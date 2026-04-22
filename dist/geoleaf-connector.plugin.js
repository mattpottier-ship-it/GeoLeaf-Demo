/*!
 * GeoLeaf Connector — Config Schema
 * Types + validation for ConnectorConfig. Zero external dependencies.
 */
/** Thrown when ConnectorConfig fails validation. */
class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConfigError";
    }
}
/**
 * Validates a ConnectorConfig object.
 * Throws ConfigError on any constraint violation.
 */
function validateConfig(config) {
    if (!config || typeof config.baseUrl !== "string" || !config.baseUrl.trim()) {
        throw new ConfigError("[GeoLeaf Connector] baseUrl must be a non-empty string.");
    }
    // HTTPS enforcement (OWASP A05 — Security Misconfiguration)
    if (!config.baseUrl.startsWith("https://")) {
        const isDev = typeof location !== "undefined" &&
            (location.hostname === "localhost" || location.hostname === "127.0.0.1");
        if (isDev) {
            console.warn("[GeoLeaf Connector] baseUrl should use HTTPS in production. " +
                "Current value: " +
                config.baseUrl);
        }
        else {
            throw new ConfigError("[GeoLeaf Connector] baseUrl must use HTTPS in production. " +
                "Received: " +
                config.baseUrl);
        }
    }
    const hasGetToken = typeof config.getToken === "function";
    const hasAuth = config.auth !== undefined && config.auth !== null;
    if (!hasGetToken && !hasAuth) {
        throw new ConfigError("[GeoLeaf Connector] Either getToken or auth must be provided.");
    }
    if (hasGetToken && hasAuth) {
        throw new ConfigError("[GeoLeaf Connector] getToken and auth are mutually exclusive. Provide only one.");
    }
    if (hasAuth && !config.auth?.endpoint?.trim()) {
        throw new ConfigError("[GeoLeaf Connector] auth.endpoint must be a non-empty string when auth is configured.");
    }
    // Sprint 2 — validate external URLs (HTTPS in production, http allowed on localhost)
    _validateExternalUrl(config.auth?.signupUrl, "auth.signupUrl");
    _validateExternalUrl(config.auth?.forgotPasswordUrl, "auth.forgotPasswordUrl");
    // Sprint 2 — iconVariant silent fallback (no throw, no warn)
    if (config.auth?.credentialButton?.iconVariant &&
        config.auth.credentialButton.iconVariant !== "lock" &&
        config.auth.credentialButton.iconVariant !== "user") {
        config.auth.credentialButton.iconVariant = "lock";
    }
}
/**
 * Validates an optional external URL field.
 * Must start with https:// in production. http:// allowed on localhost/127.0.0.1.
 */
function _validateExternalUrl(url, fieldName) {
    if (url === undefined || url === null)
        return;
    if (typeof url !== "string" || !url.trim()) {
        throw new ConfigError(`[GeoLeaf Connector] ${fieldName} must be a non-empty string when provided.`);
    }
    if (!url.startsWith("https://")) {
        const isDev = typeof location !== "undefined" &&
            (location.hostname === "localhost" || location.hostname === "127.0.0.1");
        if (isDev) {
            console.warn(`[GeoLeaf Connector] ${fieldName} should use HTTPS in production. Current value: ${url}`);
        }
        else {
            throw new ConfigError(`[GeoLeaf Connector] ${fieldName} must use HTTPS in production. Received: ${url}`);
        }
    }
}

/*!
 * GeoLeaf Connector — Token Store
 * IndexedDB persistence + RAM cache + silent refresh for JWT tokens.
 * Standalone IDB wrapper — no external dependencies, no @core imports.
 */
// ─── IDB constants ────────────────────────────────────────────────────────────
const DB_NAME = "geoleaf-connector";
const DB_VERSION = 1;
const STORE_NAME = "auth-tokens";
// ─── RAM cache ────────────────────────────────────────────────────────────────
const _cache = new Map();
// ─── Refresh state ────────────────────────────────────────────────────────────
let _refreshFn = null;
const _refreshPromise = new Map();
// ─── IDB helpers (promise-based, no lib) ─────────────────────────────────────
function _openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "baseUrl" });
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error ?? new Error("IDB open failed"));
    });
}
async function _idbGet(baseUrl) {
    try {
        const db = await _openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const req = tx.objectStore(STORE_NAME).get(baseUrl);
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => reject(req.error ?? new Error("IDB get failed"));
            tx.oncomplete = () => db.close();
        });
    }
    catch {
        return null; // IDB unavailable — graceful degradation
    }
}
async function _idbPut(record) {
    try {
        const db = await _openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const req = tx.objectStore(STORE_NAME).put(record);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error ?? new Error("IDB put failed"));
            tx.oncomplete = () => db.close();
        });
    }
    catch {
        // IDB unavailable — only RAM cache will be used
    }
}
async function _idbDelete(baseUrl) {
    try {
        const db = await _openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const req = tx.objectStore(STORE_NAME).delete(baseUrl);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error ?? new Error("IDB delete failed"));
            tx.oncomplete = () => db.close();
        });
    }
    catch {
        // ignore
    }
}
// ─── Internal functions ───────────────────────────────────────────────────────
/** Persists a token to IDB and feeds the RAM cache. expiresAt = timestamp ms. */
async function save(baseUrl, token, expiresAt) {
    _cache.set(baseUrl, { token, expiresAt });
    await _idbPut({ baseUrl, token, expiresAt });
}
/** Reads from RAM cache first, then IDB. Feeds RAM cache on IDB hit. */
async function load(baseUrl) {
    const cached = _cache.get(baseUrl);
    if (cached)
        return cached;
    const record = await _idbGet(baseUrl);
    if (record) {
        _cache.set(baseUrl, { token: record.token, expiresAt: record.expiresAt });
        return { token: record.token, expiresAt: record.expiresAt };
    }
    return null;
}
/** Removes a token from IDB and RAM cache. */
async function clear(baseUrl) {
    _cache.delete(baseUrl);
    await _idbDelete(baseUrl);
}
/**
 * RAM cache only — NEVER reads IDB.
 * Returns null if not loaded or expired.
 * Used by maplibre-bridge (synchronous transformRequest).
 */
function getTokenSync(baseUrl) {
    const entry = _cache.get(baseUrl);
    if (!entry)
        return null;
    if (entry.expiresAt <= Date.now()) {
        _cache.delete(baseUrl);
        return null;
    }
    return entry.token;
}
// ─── Refresh internals ────────────────────────────────────────────────────────
async function _doRefresh(baseUrl) {
    if (!_refreshFn)
        return null;
    try {
        return await _refreshFn(baseUrl);
    }
    catch (err) {
        // Propagate as domain event — fetch-interceptor also listens
        if (typeof document !== "undefined") {
            document.dispatchEvent(new CustomEvent("connector:auth-error", {
                detail: {
                    baseUrl,
                    error: err instanceof Error ? err.message : String(err),
                },
            }));
        }
        return null;
    }
}
/** Anti-concurrent refresh — multiple callers join the same in-flight promise. */
async function _refreshToken(baseUrl) {
    const inflight = _refreshPromise.get(baseUrl);
    if (inflight !== undefined) {
        return inflight;
    }
    const p = _doRefresh(baseUrl).finally(() => _refreshPromise.delete(baseUrl));
    _refreshPromise.set(baseUrl, p);
    return p;
}
// ─── getTokenAsync ────────────────────────────────────────────────────────────
/**
 * IDB → RAM cache → returns token or null if not authenticated / expired.
 *
 * Sequence:
 *  1. RAM cache hit with >30s margin → return immediately (trigger refresh if <5 min)
 *  2. IDB hit with >30s margin → populate RAM, return (trigger refresh if <5 min)
 *  3. Token close to expiry → force refresh
 *  4. No token → return null
 */
async function getTokenAsync(baseUrl) {
    const now = Date.now();
    // 1. RAM cache — valid with >30s margin
    const cached = _cache.get(baseUrl);
    if (cached && cached.expiresAt > now + 30_000) {
        if (cached.expiresAt - now < 300_000) {
            // Non-blocking proactive refresh
            _refreshToken(baseUrl).catch(() => {
                /* handled in _doRefresh */
            });
        }
        return cached.token;
    }
    // 2. IDB fallback
    const record = await _idbGet(baseUrl);
    if (record && record.expiresAt > now + 30_000) {
        _cache.set(baseUrl, { token: record.token, expiresAt: record.expiresAt });
        if (record.expiresAt - now < 300_000) {
            _refreshToken(baseUrl).catch(() => {
                /* handled in _doRefresh */
            });
        }
        return record.token;
    }
    // 3. Token expired or close to expiry — force refresh
    if (record || cached) {
        return _refreshToken(baseUrl);
    }
    // 4. No token at all
    return null;
}
// ─── Public API ───────────────────────────────────────────────────────────────
const TokenStore = {
    save,
    load,
    clear,
    getTokenSync,
    getTokenAsync,
    /**
     * Injects a refresh delegate.
     * Called by entry.ts when auth.endpoint is configured.
     * Pass null to disable refresh (e.g. when using getToken callback).
     */
    _setRefreshFn(fn) {
        _refreshFn = fn;
    },
};

/*!
 * GeoLeaf Connector — Format Detector
 * Pure function. No side effects. Zero external dependencies.
 */
/**
 * Detects the data format from a URL and optional Content-Type header.
 *
 * Used by fetch-interceptor to route MVT/PMTiles requests to the MapLibre bridge
 * instead of the window.fetch monkey-patch.
 *
 * @param url - Request URL (query params are ignored)
 * @param contentType - Optional Content-Type header value
 * @returns Detected DataFormat (defaults to 'geojson' when format is ambiguous)
 */
function detectFormat(url, contentType) {
    const u = url.toLowerCase().split("?")[0];
    // Extension-based detection (highest priority)
    if (u.endsWith(".fgb"))
        return "flatgeobuf";
    if (u.endsWith(".kml"))
        return "kml";
    if (u.endsWith(".csv"))
        return "csv";
    if (u.endsWith(".pmtiles"))
        return "pmtiles";
    if (u.endsWith(".mvt"))
        return "mvt";
    if (u.endsWith(".pbf"))
        return "mvt";
    // OGC API Features — path-based detection
    if (u.includes("/collections/"))
        return "oapif";
    return "geojson";
}

/*!
 * GeoLeaf Connector — Fetch Interceptor
 * Monkey-patches window.fetch to inject Authorization headers on matching URLs.
 */
// ─── State ────────────────────────────────────────────────────────────────────
// Capture the original fetch before any patching (globalThis.fetch is always available in browser)
const _originalFetch = globalThis.fetch;
let _config = null;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function _extractUrl(input) {
    if (typeof input === "string")
        return input;
    if (input instanceof URL)
        return input.href;
    if (input instanceof Request)
        return input.url;
    return "";
}
/**
 * Returns true if the request URL should have a token injected via window.fetch.
 * MVT and PMTiles are routed to the MapLibre bridge instead.
 */
function _shouldIntercept(url) {
    if (!_config)
        return false;
    if (!url.startsWith(_config.baseUrl))
        return false;
    const fmt = detectFormat(url);
    return fmt !== "pmtiles" && fmt !== "mvt";
}
/**
 * Resolves the current token using either the getToken callback or TokenStore.
 * This is the single routing point for the two auth modes.
 */
async function _resolveToken() {
    if (!_config)
        return null;
    if (_config.getToken) {
        return _config.getToken();
    }
    return TokenStore.getTokenAsync(_config.baseUrl);
}
/**
 * Handles a 401 response: attempts one token refresh, retries the request.
 * Never loops — if refresh fails, emits connector:auth-error and returns a synthetic 401.
 */
async function _handleUnauthorized(input, init) {
    if (!_config)
        return new Response(null, { status: 401, statusText: "Unauthorized" });
    let newToken = null;
    try {
        if (_config.getToken) {
            // App-managed token — simply re-call; it is the app's responsibility to rotate it
            newToken = await Promise.resolve(_config.getToken());
        }
        else {
            // Force IDB re-read by clearing RAM cache entry
            await TokenStore.clear(_config.baseUrl);
            newToken = await TokenStore.getTokenAsync(_config.baseUrl);
        }
    }
    catch {
        // ignore — fall through to error dispatch
    }
    if (newToken) {
        const headers = {
            ...init.headers,
            Authorization: `Bearer ${newToken}`,
        };
        return _originalFetch(input, { ...init, headers });
    }
    // Refresh failed — notify and return 401 without looping
    if (typeof document !== "undefined") {
        document.dispatchEvent(new CustomEvent("connector:auth-error", {
            detail: {
                baseUrl: _config.baseUrl,
                error: "Authentication failed — 401 after token refresh attempt.",
            },
        }));
    }
    return new Response(null, { status: 401, statusText: "Unauthorized" });
}
// ─── Install / Uninstall ──────────────────────────────────────────────────────
/**
 * Installs the window.fetch monkey-patch.
 * All requests starting with config.baseUrl (except MVT/PMTiles) will have
 * an Authorization: Bearer <token> header injected.
 */
function install(config) {
    _config = config;
    globalThis.fetch = async function (input, init = {}) {
        const url = _extractUrl(input);
        if (_shouldIntercept(url)) {
            const token = await _resolveToken();
            if (token) {
                init = {
                    ...init,
                    headers: {
                        ...init.headers,
                        Authorization: `Bearer ${token}`,
                    },
                };
            }
            const response = await _originalFetch(input, init);
            if (response.status === 401) {
                return _handleUnauthorized(input, init);
            }
            return response;
        }
        return _originalFetch(input, init);
    };
    // Warn for static (non-JWT) tokens — dev/demo indicator (§16 S6)
    if (config.getToken) {
        const maybeToken = config.getToken();
        const checkToken = (t) => {
            if (t && !t.includes(".")) {
                console.warn("[GeoLeaf Connector] Static token detected. " +
                    "This provides NO real security — use only for dev/demo with non-sensitive data.");
            }
        };
        if (maybeToken instanceof Promise) {
            maybeToken.then(checkToken).catch(() => {
                /* ignore */
            });
        }
        else {
            checkToken(maybeToken);
        }
    }
}
/**
 * Restores window.fetch to its original implementation and removes the Worker hook.
 * Called by ConnectorInstance.destroy().
 */
function uninstall() {
    globalThis.fetch = _originalFetch;
    // Remove Worker headers hook installed by entry.ts
    delete globalThis["__GEOLEAF_WORKER_HEADERS_HOOK__"];
    _config = null;
}
/**
 * Returns Authorization headers for a given URL if it falls within the baseUrl scope.
 * Called via the __GEOLEAF_WORKER_HEADERS_HOOK__ global hook from worker-manager.ts.
 * Uses only the RAM cache (sync) — IDB is never accessed in this path.
 */
function getWorkerHeaders(url, baseUrl) {
    if (!url.startsWith(baseUrl))
        return undefined;
    const token = TokenStore.getTokenSync(baseUrl);
    if (!token)
        return undefined;
    return { Authorization: `Bearer ${token}` };
}

/*!
 * GeoLeaf Connector — MapLibre Bridge
 * Installs map.setTransformRequest() to inject Authorization headers for
 * MVT and PMTiles tile requests. Uses TokenStore RAM cache (sync-only path).
 *
 * Resolution strategy:
 * 1. Immediate install when configure() is called after geoleaf:map:ready.
 * 2. Deferred via geoleaf:map:ready listener when map is not yet available.
 * 3. Re-install on geoleaf:basemap:change (defensive safety net for setStyle).
 *
 * Map access: globalThis.GeoLeaf.Core.getMap().getNativeMap()
 * No imports from @geoleaf/core — rule no-premium-in-core applies in reverse.
 */
// ─── Internal helpers ─────────────────────────────────────────────────────────
/** Duck-type guard: accepts any object that has setTransformRequest(). */
function _isMaplibreMap(m) {
    return m != null && typeof m["setTransformRequest"] === "function";
}
/**
 * Resolves the native maplibregl.Map via globalThis.GeoLeaf.Core.getMap().getNativeMap().
 * Returns null if not available yet.
 * No @geoleaf/core import — access through the global namespace only.
 */
function _resolveNativeMap() {
    const g = globalThis;
    const GeoLeaf = g["GeoLeaf"];
    if (!GeoLeaf)
        return null;
    const Core = GeoLeaf["Core"];
    if (!Core || typeof Core["getMap"] !== "function")
        return null;
    const adapter = Core["getMap"]();
    if (!adapter || typeof adapter["getNativeMap"] !== "function")
        return null;
    return adapter["getNativeMap"]();
}
/**
 * Applies map.setTransformRequest() with the token injection callback.
 * Returns true on success, false if m is not a valid MapLibre instance.
 *
 * The callback uses TokenStore.getTokenSync() (RAM cache only) because
 * transformRequest is synchronous in MapLibre GL JS.
 * getTokenAsync() is called non-blocking to keep the RAM cache warm.
 */
function _install(m, config) {
    if (!_isMaplibreMap(m))
        return false;
    m.setTransformRequest((url) => {
        if (!url.startsWith(config.baseUrl))
            return undefined;
        const token = TokenStore.getTokenSync(config.baseUrl);
        // Non-blocking proactive refresh — updates RAM cache before expiry.
        // The return value is discarded; connector:auth-error is emitted on failure.
        TokenStore.getTokenAsync(config.baseUrl).catch(() => { });
        if (!token)
            return undefined;
        return { url, headers: { Authorization: `Bearer ${token}` } };
    });
    return true;
}
// ─── Basemap change listener ──────────────────────────────────────────────────
/**
 * Re-installs setTransformRequest whenever the active basemap changes.
 * Defensive measure: map.setStyle() replaces the tile pipeline but not the
 * transformRequest hook in MapLibre GL JS 5.x. This listener is a safety net
 * for edge cases where the hook might be cleared by a basemap provider switch.
 *
 * Uses detail.map from the geoleaf:basemap:change event (populated by
 * registry._dispatchBasemapChange, line 281) as a fast path. Falls back to
 * globalThis.GeoLeaf.Core.getMap().getNativeMap() when detail.map is absent.
 */
function _registerBasemapChangeListener(config) {
    if (typeof document === "undefined")
        return;
    document.addEventListener("geoleaf:basemap:change", (e) => {
        const detail = e.detail;
        // Fast path: detail.map is the native map instance from the registry event
        const mapFromDetail = detail?.["map"];
        const m = _isMaplibreMap(mapFromDetail) ? mapFromDetail : _resolveNativeMap();
        _install(m, config);
    });
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Installs the MapLibre transformRequest hook to inject Authorization headers
 * into MVT and PMTiles tile requests.
 *
 * Handles two timing scenarios:
 * - Scenario A: configure() called AFTER geoleaf:map:ready → immediate install.
 * - Scenario B: configure() called BEFORE geoleaf:map:ready → deferred install
 *   via a one-shot document event listener.
 *
 * In both cases, a geoleaf:basemap:change listener is registered to re-install
 * the hook on basemap switches.
 *
 * @param config - Connector configuration (baseUrl used for URL matching)
 */
function installMapLibreBridge(config) {
    // Scenario A: map already available (configure() called post-init)
    const map = _resolveNativeMap();
    if (_install(map, config)) {
        _registerBasemapChangeListener(config);
        return;
    }
    // Scenario B: map not ready yet (common case — configure() called during boot)
    if (typeof document !== "undefined") {
        document.addEventListener("geoleaf:map:ready", () => {
            _install(_resolveNativeMap(), config);
            _registerBasemapChangeListener(config);
        }, { once: true });
    }
}

/*!
 * GeoLeaf Connector — Auth Client
 * HTTP calls to the authentication endpoint.
 * Credentials are never stored or logged.
 */
/** Thrown when authentication or refresh fails. */
class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}
// ─── Internal helpers ─────────────────────────────────────────────────────────
async function _parseAuthResponse(response) {
    if (response.status === 401) {
        throw new AuthError("Invalid credentials");
    }
    if (response.status === 404) {
        throw new AuthError("Endpoint not found (404)");
    }
    if (response.status >= 500) {
        throw new AuthError("Server error (" + response.status + ")");
    }
    if (!response.ok) {
        throw new AuthError("Authentication failed (" + response.status + ")");
    }
    let data;
    try {
        data = (await response.json());
    }
    catch {
        throw new AuthError("Invalid server response: could not parse JSON");
    }
    if (!data.token || typeof data.expiresIn !== "number") {
        throw new AuthError("Invalid server response: missing token or expiresIn");
    }
    return data;
}
// ─── Public API ───────────────────────────────────────────────────────────────
const AuthClient = {
    /**
     * Authenticates with login + password against the endpoint.
     * Returns the token and expiresIn so the caller can store via TokenStore.save().
     *
     * Security: password string is overwritten before the function returns.
     */
    async login(endpoint, login, password) {
        let pwd = password;
        try {
            let response;
            try {
                response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ login, password: pwd }),
                });
            }
            catch {
                throw new AuthError("Network unavailable");
            }
            return await _parseAuthResponse(response);
        }
        finally {
            // Overwrite password in memory after use (OWASP A02)
            pwd = "";
        }
    },
    /**
     * Refreshes the current token via POST {endpoint}/refresh.
     * Returns the new AuthResponse, or null if the backend does not support refresh (404).
     * All other errors are propagated as AuthError.
     */
    async refresh(endpoint, currentToken) {
        let response = null;
        try {
            response = await fetch(`${endpoint}/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
            });
        }
        catch {
            // Network error — treat as non-fatal for refresh
            return null;
        }
        // Backend does not support refresh — graceful degradation
        if (response.status === 404)
            return null;
        try {
            return await _parseAuthResponse(response);
        }
        catch {
            return null;
        }
    },
};

/*!
 * GeoLeaf Connector — Login UI (v1.2.3)
 * Accessible login modal with close button, overlay dismiss, and optional
 * signup / forgot-password links. Colors follow the active GeoLeaf theme
 * (light / dark / green / alt) through --gl-color-* custom properties.
 * CSS is inlined as a constant — no external stylesheet required.
 */
// ─── CSS ──────────────────────────────────────────────────────────────────────
const _CSS = `
.gc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  font-family: system-ui, -apple-system, sans-serif;
}
.gc-modal {
  position: relative;
  background: var(--gl-color-bg-surface, #ffffff);
  color: var(--gl-color-text-main, #0f172a);
  border: 1px solid var(--gl-color-border-soft, rgba(15,23,42,0.08));
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.24);
  padding: 2rem;
  width: 100%;
  max-width: 360px;
  box-sizing: border-box;
}
.gc-modal h2 {
  margin: 0 0 1.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gl-color-text-main, #0f172a);
}
.gc-modal label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gl-color-text-muted, #374151);
}
.gc-modal input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  background: var(--gl-color-bg-surface-muted, #f9fafb);
  color: var(--gl-color-text-main, #0f172a);
  border: 1px solid var(--gl-color-border-strong, rgba(15,23,42,0.22));
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.gc-modal input::placeholder {
  color: var(--gl-color-text-muted, #9ca3af);
  opacity: 0.7;
}
.gc-modal input:focus {
  border-color: var(--gl-color-accent, #3b82f6);
  box-shadow: 0 0 0 2px var(--gl-color-accent-soft, rgba(59,130,246,0.25));
}
.gc-modal button[type="submit"] {
  width: 100%;
  padding: 0.625rem 1rem;
  background: var(--gl-color-accent, #3b82f6);
  color: var(--gl-color-accent-contrast, #ffffff);
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.gc-modal button[type="submit"]:hover:not(:disabled) {
  background: var(--gl-color-accent-hover, #2563eb);
}
.gc-modal button[type="submit"]:disabled {
  background: var(--gl-color-accent-soft, #93c5fd);
  color: var(--gl-color-text-muted, #ffffff);
  cursor: not-allowed;
}
.gc-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
  min-height: 1.25em;
}
.gc-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--gl-color-text-muted, #6b7280);
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
  transition: background 0.15s, color 0.15s;
}
.gc-close:hover {
  background: var(--gl-color-bg-surface-muted, #f3f4f6);
  color: var(--gl-color-text-main, #111);
}
.gc-close:focus-visible {
  outline: 2px solid var(--gl-color-focus-ring, #2684FF);
  outline-offset: 1px;
}
.gc-links {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gl-color-border-soft, rgba(15,23,42,0.08));
  font-size: 0.875rem;
  color: var(--gl-color-text-muted, #6b7280);
}
.gc-links a {
  color: var(--gl-color-accent, #3b82f6);
  text-decoration: none;
}
.gc-links a:hover { text-decoration: underline; }
.gc-links a:focus-visible {
  outline: 2px solid var(--gl-color-focus-ring, #2684FF);
  outline-offset: 2px;
  border-radius: 2px;
}
`;
// ─── Focus trap helpers ───────────────────────────────────────────────────────
const FOCUSABLE = "input:not([disabled]), button:not([disabled]), a[href]:not([hidden])";
function _trapFocus(overlay) {
    return (e) => {
        if (e.key !== "Tab")
            return;
        const focusable = Array.from(overlay.querySelectorAll(FOCUSABLE));
        if (focusable.length === 0)
            return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        }
        else if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };
}
// ─── Close button SVG builder ─────────────────────────────────────────────────
function _buildCloseSvg() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M18 6L6 18M6 6l12 12");
    svg.appendChild(path);
    return svg;
}
function _buildModal() {
    // Inject styles once
    if (!document.getElementById("gc-style")) {
        const style = document.createElement("style");
        style.id = "gc-style";
        // textContent avoids innerHTML XSS risk (static string, no user data)
        style.textContent = _CSS;
        document.head.appendChild(style);
    }
    const overlay = document.createElement("div");
    overlay.className = "gc-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "gc-modal-title");
    const modal = document.createElement("div");
    modal.className = "gc-modal";
    // Close button (top-right)
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "gc-close";
    closeBtn.setAttribute("aria-label", "Fermer");
    closeBtn.appendChild(_buildCloseSvg());
    const title = document.createElement("h2");
    title.id = "gc-modal-title";
    title.textContent = "Connexion";
    const form = document.createElement("form");
    form.id = "gc-login-form";
    form.setAttribute("novalidate", "");
    const loginLabel = document.createElement("label");
    loginLabel.setAttribute("for", "gc-login");
    loginLabel.textContent = "Identifiant";
    const loginInput = document.createElement("input");
    loginInput.id = "gc-login";
    loginInput.type = "text";
    loginInput.setAttribute("autocomplete", "username");
    loginInput.required = true;
    const passwordLabel = document.createElement("label");
    passwordLabel.setAttribute("for", "gc-password");
    passwordLabel.textContent = "Mot de passe"; // NOSONAR: UI label text, not a credential
    const passwordInput = document.createElement("input");
    passwordInput.id = "gc-password"; // NOSONAR: element ID, not a credential
    passwordInput.type = "password"; // NOSONAR: input type, not a credential
    passwordInput.setAttribute("autocomplete", "current-password");
    passwordInput.required = true;
    const errorEl = document.createElement("p");
    errorEl.id = "gc-error";
    errorEl.className = "gc-error";
    errorEl.setAttribute("role", "alert");
    errorEl.setAttribute("aria-live", "polite");
    errorEl.hidden = true;
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "Se connecter";
    form.appendChild(loginLabel);
    form.appendChild(loginInput);
    form.appendChild(passwordLabel);
    form.appendChild(passwordInput);
    form.appendChild(errorEl);
    form.appendChild(submitBtn);
    // External links container (hidden by default)
    const linksDiv = document.createElement("div");
    linksDiv.className = "gc-links";
    linksDiv.hidden = true;
    const signupLink = document.createElement("a");
    signupLink.id = "gc-link-signup";
    signupLink.textContent = "Créer un compte";
    signupLink.target = "_blank";
    signupLink.rel = "noopener noreferrer";
    signupLink.hidden = true;
    const forgotLink = document.createElement("a");
    forgotLink.id = "gc-link-forgot";
    forgotLink.textContent = "Mot de passe oublié";
    forgotLink.target = "_blank";
    forgotLink.rel = "noopener noreferrer";
    forgotLink.hidden = true;
    linksDiv.appendChild(signupLink);
    linksDiv.appendChild(forgotLink);
    modal.appendChild(closeBtn);
    modal.appendChild(title);
    modal.appendChild(form);
    modal.appendChild(linksDiv);
    overlay.appendChild(modal);
    return {
        overlay,
        closeBtn,
        loginInput,
        passwordInput,
        submitBtn,
        errorEl,
        form,
        linksDiv,
        signupLink,
        forgotLink,
    };
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Displays the login modal and resolves when the user authenticates successfully.
 * Rejects with `Error("Modal closed by user")` if the user dismisses the modal
 * via close button, Escape key, or overlay click.
 */
function showLoginModal(config) {
    return new Promise((resolve, reject) => {
        const { overlay, closeBtn, loginInput, passwordInput, submitBtn, errorEl, form, linksDiv, signupLink, forgotLink, } = _buildModal();
        // ── Configure external links (Sprint 2) ──────────────────────
        if (config.auth?.signupUrl) {
            signupLink.href = config.auth.signupUrl;
            signupLink.hidden = false;
            linksDiv.hidden = false;
        }
        if (config.auth?.forgotPasswordUrl) {
            forgotLink.href = config.auth.forgotPasswordUrl;
            forgotLink.hidden = false;
            linksDiv.hidden = false;
        }
        // Cancelable event dispatch on link clicks
        signupLink.addEventListener("click", (e) => {
            const evt = new CustomEvent("connector:signup-requested", {
                detail: { url: config.auth.signupUrl },
                cancelable: true,
            });
            const notPrevented = document.dispatchEvent(evt);
            if (!notPrevented)
                e.preventDefault();
        });
        forgotLink.addEventListener("click", (e) => {
            const evt = new CustomEvent("connector:forgot-password-requested", {
                detail: { url: config.auth.forgotPasswordUrl },
                cancelable: true,
            });
            const notPrevented = document.dispatchEvent(evt);
            if (!notPrevented)
                e.preventDefault();
        });
        // ── Focus trap ───────────────────────────────────────────────
        const trapHandler = _trapFocus(overlay);
        document.addEventListener("keydown", trapHandler);
        // ── Shared cleanup ───────────────────────────────────────────
        function _cleanup() {
            document.removeEventListener("keydown", trapHandler);
            document.removeEventListener("keydown", _escapeHandler);
            overlay.remove();
        }
        // ── Error helpers ────────────────────────────────────────────
        function _showError(msg) {
            errorEl.textContent = msg;
            errorEl.hidden = false;
        }
        function _clearError() {
            errorEl.textContent = "";
            errorEl.hidden = true;
        }
        function _setLoading(loading) {
            submitBtn.disabled = loading;
            loginInput.disabled = loading;
            passwordInput.disabled = loading;
            submitBtn.textContent = loading ? "Connexion…" : "Se connecter";
        }
        // ── Close: Escape key ────────────────────────────────────────
        const _escapeHandler = (e) => {
            if (e.key === "Escape") {
                _cleanup();
                reject(new Error("Modal closed by user"));
            }
        };
        document.addEventListener("keydown", _escapeHandler);
        // ── Close: close button (Sprint 2) ───────────────────────────
        closeBtn.addEventListener("click", () => {
            _cleanup();
            reject(new Error("Modal closed by user"));
        });
        // ── Close: overlay click (Sprint 2) ──────────────────────────
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                _cleanup();
                reject(new Error("Modal closed by user"));
            }
        });
        // ── Submit handler ───────────────────────────────────────────
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            _clearError();
            const loginValue = loginInput.value.trim();
            const passwordValue = passwordInput.value;
            if (!loginValue || !passwordValue) {
                _showError("Veuillez remplir tous les champs.");
                return;
            }
            _setLoading(true);
            try {
                const auth = config.auth;
                if (!auth?.endpoint) {
                    _showError("Configuration invalide : endpoint manquant.");
                    _setLoading(false);
                    return;
                }
                const result = await AuthClient.login(auth.endpoint, loginValue, passwordValue);
                const expiresAt = Date.now() + result.expiresIn * 1000;
                await TokenStore.save(config.baseUrl, result.token, expiresAt);
                _cleanup();
                document.dispatchEvent(new CustomEvent("connector:authenticated", {
                    detail: { baseUrl: config.baseUrl },
                }));
                resolve();
            }
            catch (err) {
                _setLoading(false);
                // Clear password on any error (OWASP A02)
                passwordInput.value = "";
                if (err instanceof AuthError) {
                    if (err.message === "Invalid credentials") {
                        _showError("Identifiant ou mot de passe incorrect.");
                    }
                    else if (err.message === "Network unavailable") {
                        _showError("Serveur inaccessible. Vérifiez votre connexion.");
                    }
                    else {
                        _showError("Erreur : " + err.message);
                    }
                }
                else {
                    _showError("Une erreur inattendue est survenue.");
                }
            }
        });
        document.body.appendChild(overlay);
        // Focus on first input after mount
        requestAnimationFrame(() => loginInput.focus());
    });
}

/*!
 * GeoLeaf Connector — Credential Button (Sprint 2 / v1.1.0)
 * Auto-injects a credential/login icon button into the desktop panel
 * (.gl-rp-tabs) and mobile toolbar (.gl-map-toolbar).
 * Uses MutationObserver to handle deferred DOM creation by the core.
 * SVG built via createElementNS — no innerHTML.
 */
// ─── CSS ──────────────────────────────────────────────────────────────────────
const _BTN_CSS = `
.gc-credential-separator {
  height: 1px;
  background: var(--gl-color-border-soft, rgba(15,23,42,0.08));
  margin: 8px 4px 8px;
  width: calc(100% - 8px);
  flex-shrink: 0;
}
.gc-credential-btn[data-variant="desktop"] {
  margin-bottom: 8px;
  flex-shrink: 0;
}
/* Hide the mobile-variant button on desktop (≥ 1440px) — core breakpoint
   where .gl-rp-tabs becomes the primary surface and the mobile pill still
   exists but several of its buttons are already hidden by the core. */
@media (min-width: 1440px) {
  .gc-credential-btn[data-variant="mobile"] {
    display: none !important;
  }
}
.gc-credential-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  margin: 4px auto;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--gl-color-text-muted, #6b7280);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.gc-credential-btn:hover {
  background: color-mix(in srgb, var(--gl-color-accent, #f97316) 15%, transparent);
  color: var(--gl-color-accent, #f97316);
}
.gc-credential-btn:focus-visible {
  outline: 2px solid var(--gl-color-focus-ring, #2684FF);
  outline-offset: 2px;
}
`;
// ─── Module state ─────────────────────────────────────────────────────────────
let _observer = null;
let _desktopBtn = null;
let _mobileBtn = null;
let _styleInjected = false;
// ─── Activation check ─────────────────────────────────────────────────────────
function _shouldEnable(config) {
    // Source 1: explicit config
    if (config.auth?.credentialButton?.enabled === true)
        return true;
    // Source 2: profile ui.json — read via GeoLeaf.Config.getActiveProfile().
    // The core merges ui.json into the active profile (spread at root), so
    // showCredentialButton sits at profile.ui.showCredentialButton.
    const g = globalThis;
    const gl = g["GeoLeaf"];
    const Config = gl?.["Config"];
    const profile = Config?.getActiveProfile?.();
    const ui = (profile?.["ui"] ?? undefined);
    if (ui?.["showCredentialButton"] === true)
        return true;
    return false;
}
// ─── CSS injection ────────────────────────────────────────────────────────────
function _injectStyles() {
    if (_styleInjected)
        return;
    if (!document.getElementById("gc-btn-style")) {
        const style = document.createElement("style");
        style.id = "gc-btn-style";
        style.textContent = _BTN_CSS;
        document.head.appendChild(style);
    }
    _styleInjected = true;
}
// ─── SVG icon builder ─────────────────────────────────────────────────────────
function _buildSvgIcon(variant) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    if (variant === "user") {
        // User silhouette — two paths: head circle + body arc
        const circle = document.createElementNS(ns, "circle");
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "8");
        circle.setAttribute("r", "4");
        svg.appendChild(circle);
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2");
        svg.appendChild(path);
    }
    else {
        // Lock — rect body + path for shackle
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", "5");
        rect.setAttribute("y", "11");
        rect.setAttribute("width", "14");
        rect.setAttribute("height", "10");
        rect.setAttribute("rx", "2");
        svg.appendChild(rect);
        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", "M8 11V7a4 4 0 0 1 8 0v4");
        svg.appendChild(path);
    }
    return svg;
}
// ─── Button builder ───────────────────────────────────────────────────────────
function _buildButton(config, variant) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gc-credential-btn";
    btn.dataset.variant = variant;
    const iconVariant = config.auth?.credentialButton?.iconVariant ?? "lock";
    const svg = _buildSvgIcon(iconVariant === "user" ? "user" : "lock");
    btn.appendChild(svg);
    btn.addEventListener("click", () => {
        void _onCredentialClick(config);
    });
    return btn;
}
// ─── Click handler ────────────────────────────────────────────────────────────
async function _onCredentialClick(config) {
    // Only hit the token store when an auth endpoint is wired — otherwise
    // there is no backend to authenticate against and we go straight to the
    // modal. The ui.showCredentialButton flag is the sole display safeguard.
    const hasEndpoint = !!config.auth?.endpoint?.trim();
    const token = hasEndpoint ? await TokenStore.getTokenAsync(config.baseUrl) : null;
    const authenticated = !!token;
    document.dispatchEvent(new CustomEvent("connector:credential-button-clicked", {
        detail: { baseUrl: config.baseUrl, authenticated },
    }));
    if (authenticated)
        return;
    try {
        await showLoginModal(config);
    }
    catch {
        // User closed modal without authenticating — no-op
    }
}
// ─── Desktop injection ────────────────────────────────────────────────────────
function _injectDesktop(config) {
    const tabs = document.querySelector(".gl-rp-tabs");
    if (!tabs)
        return;
    // Idempotence guard
    if (tabs.querySelector(".gc-credential-btn"))
        return;
    const separator = document.createElement("div");
    separator.className = "gc-credential-separator";
    const btn = _buildButton(config, "desktop");
    btn.setAttribute("aria-label", "Connexion");
    btn.title = "Connexion";
    tabs.appendChild(separator);
    tabs.appendChild(btn);
    _desktopBtn = btn;
}
// ─── Mobile injection ─────────────────────────────────────────────────────────
function _injectMobile(config) {
    // Prefer the scroll container; fallback to the toolbar itself
    const scroll = document.querySelector(".gl-map-toolbar__scroll") ??
        document.querySelector(".gl-map-toolbar");
    if (!scroll)
        return;
    // Idempotence guard
    if (scroll.querySelector(".gc-credential-btn"))
        return;
    const btn = _buildButton(config, "mobile");
    btn.classList.add("gl-map-toolbar__btn");
    btn.setAttribute("aria-label", "Connexion");
    scroll.appendChild(btn);
    _mobileBtn = btn;
}
// ─── Injection orchestrator ───────────────────────────────────────────────────
function _tryInjectAll(config) {
    if (!_desktopBtn)
        _injectDesktop(config);
    if (!_mobileBtn)
        _injectMobile(config);
    if (_desktopBtn && _mobileBtn) {
        _observer?.disconnect();
    }
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Auto-injects the credential button into the desktop panel tabs and mobile
 * toolbar. No-op if activation conditions are not met.
 * Uses MutationObserver to handle deferred DOM creation.
 */
function installCredentialButton(config) {
    if (!_shouldEnable(config))
        return;
    _injectStyles();
    // Immediate attempt (DOM may already be ready)
    _tryInjectAll(config);
    // Fallback: observe for late DOM creation
    if (!_desktopBtn || !_mobileBtn) {
        _observer = new MutationObserver(() => _tryInjectAll(config));
        _observer.observe(document.body, { childList: true, subtree: true });
        // Safety timeout — disconnect after 10s to prevent memory leak
        setTimeout(() => _observer?.disconnect(), 10_000);
    }
}
/**
 * Removes injected credential buttons and disconnects the MutationObserver.
 * Called by entry.ts destroy().
 */
function uninstallCredentialButton() {
    _observer?.disconnect();
    _observer = null;
    _desktopBtn?.remove();
    _mobileBtn?.remove();
    _desktopBtn = null;
    _mobileBtn = null;
    _styleInjected = false;
}

/*!
 * GeoLeaf Connector — Entry Point
 * Boot, GeoLeaf.Connector global API, plugin registration.
 * ESM named export createConnector() for suite-connector.
 */
// ─── Singleton state (global API) ────────────────────────────────────────────
let _currentInstance = null;
let _currentConfig = null;
// ─── createConnector — ESM named export ──────────────────────────────────────
/**
 * Creates a ConnectorInstance from a validated config without mutating the
 * global GeoLeaf.Connector state.
 * Intended for use by @geoleaf-plugins/suite-connector and advanced integrators.
 */
function createConnector(config) {
    validateConfig(config);
    let _active = true;
    // Wire refresh delegate if auth.endpoint is configured
    if (config.auth?.endpoint) {
        TokenStore._setRefreshFn(async (baseUrl) => {
            const current = TokenStore.getTokenSync(baseUrl);
            if (!current || !config.auth?.endpoint)
                return null;
            const result = await AuthClient.refresh(config.auth.endpoint, current);
            if (result) {
                const expiresAt = Date.now() + result.expiresIn * 1000;
                await TokenStore.save(baseUrl, result.token, expiresAt);
                if (typeof document !== "undefined") {
                    document.dispatchEvent(new CustomEvent("connector:token-refreshed", { detail: { baseUrl } }));
                }
                return result.token;
            }
            return null;
        });
    }
    return {
        getTokenSync() {
            if (!_active)
                return null;
            if (config.getToken) {
                const result = config.getToken();
                // async getToken cannot be used synchronously — return null
                if (result instanceof Promise)
                    return null;
                return result;
            }
            return TokenStore.getTokenSync(config.baseUrl);
        },
        async getTokenAsync() {
            if (!_active)
                return null;
            if (config.getToken) {
                return config.getToken();
            }
            return TokenStore.getTokenAsync(config.baseUrl);
        },
        destroy() {
            _active = false;
            TokenStore._setRefreshFn(null);
        },
    };
}
// ─── configure — global singleton ────────────────────────────────────────────
/**
 * Initializes the Connector singleton.
 * Installs window.fetch monkey-patch and Worker headers hook.
 * If auth.ui is true and no token is found, shows the login modal.
 */
async function _configure(config) {
    validateConfig(config);
    // Destroy the existing instance if any
    if (_currentInstance) {
        uninstallCredentialButton();
        _currentInstance.destroy();
        uninstall();
        _currentInstance = null;
        _currentConfig = null;
    }
    _currentConfig = config;
    // Warm up RAM cache from IDB (required before MapLibre bridge reads sync cache)
    if (config.auth?.endpoint) {
        await TokenStore.getTokenAsync(config.baseUrl);
        // Wire refresh delegate for the singleton
        TokenStore._setRefreshFn(async (baseUrl) => {
            const current = TokenStore.getTokenSync(baseUrl);
            if (!current || !config.auth?.endpoint)
                return null;
            const result = await AuthClient.refresh(config.auth.endpoint, current);
            if (result) {
                const expiresAt = Date.now() + result.expiresIn * 1000;
                await TokenStore.save(baseUrl, result.token, expiresAt);
                if (typeof document !== "undefined") {
                    document.dispatchEvent(new CustomEvent("connector:token-refreshed", { detail: { baseUrl } }));
                }
                return result.token;
            }
            return null;
        });
    }
    // Install fetch monkey-patch
    install(config);
    // Install Worker headers hook on globalThis
    // worker-manager.ts reads this via __GEOLEAF_WORKER_HEADERS_HOOK__ (no import of this plugin)
    globalThis["__GEOLEAF_WORKER_HEADERS_HOOK__"] = (url) => {
        if (!_currentConfig)
            return undefined;
        return getWorkerHeaders(url, _currentConfig.baseUrl);
    };
    // Install MapLibre bridge (Phase 1 stub — no-op until Phase 2)
    installMapLibreBridge(config);
    // Resolve current token status
    let token = null;
    if (config.getToken) {
        token = await config.getToken();
    }
    else if (config.auth?.endpoint) {
        token = await TokenStore.getTokenAsync(config.baseUrl);
    }
    // No token + auth configured → show login modal or throw
    if (!token && config.auth) {
        if (config.auth.ui) {
            await showLoginModal(config);
        }
        else {
            throw new ConfigError("[GeoLeaf Connector] No valid token found and auth.ui is not enabled. " +
                "Configure auth.ui: true to show the login modal, or provide a valid token.");
        }
    }
    // Install credential button (Sprint 2 — idempotent, no-op if not enabled)
    installCredentialButton(config);
    _currentInstance = createConnector(config);
}
const _g = globalThis;
if (_g.GeoLeaf) {
    _g.GeoLeaf.Connector = {
        configure: _configure,
        /**
         * Opens the login modal on demand.
         * Resolves when authenticated, rejects if the user closes the modal.
         * Requires a prior configure() call with auth configured.
         */
        async openLoginModal() {
            if (!_currentConfig?.auth) {
                throw new ConfigError("[GeoLeaf Connector] openLoginModal() requires auth to be configured. " +
                    "Call GeoLeaf.Connector.configure() with auth first.");
            }
            return showLoginModal(_currentConfig);
        },
    };
}
// ─── Auto-bootstrap UI-only from profile ui.showCredentialButton ─────────────
// Mounts the credential button without requiring GeoLeaf.Connector.configure().
// Triggered by geoleaf:config:loaded / geoleaf:map:ready. Idempotent.
// If configure() runs later, uninstallCredentialButton() inside _configure
// removes this standalone button and _configure re-installs it with real auth.
let _uiOnlyBooted = false;
function _readUiShowCredentialButtonFlag() {
    // Read through GeoLeaf.Config.getActiveProfile() — the only runtime-exposed
    // path to the profile's ui section (merged from ui.json). GeoLeaf.config
    // does not exist at runtime.
    const g = globalThis;
    const gl = g["GeoLeaf"];
    const Config = gl?.["Config"];
    const profile = Config?.getActiveProfile?.();
    const ui = (profile?.["ui"] ?? undefined);
    return ui?.["showCredentialButton"] === true;
}
function _autoBootstrapUiOnly() {
    if (_uiOnlyBooted)
        return;
    if (_currentInstance)
        return; // explicit configure() already ran
    if (_readUiShowCredentialButtonFlag()) {
        _uiOnlyBooted = true;
        // Minimal standalone config — not passed through validateConfig.
        // credential-button._shouldEnable() reads ui.showCredentialButton directly.
        // Empty auth.endpoint signals UI-only click mode (event dispatch only).
        const uiOnlyCfg = {
            baseUrl: typeof location === "undefined" ? "" : location.origin,
            auth: {
                endpoint: "",
                credentialButton: { enabled: true, iconVariant: "lock" },
            },
        };
        installCredentialButton(uiOnlyCfg);
    }
}
/** @internal — exposed for tests only, resets the auto-bootstrap latch. */
function _resetAutoBootstrapForTests() {
    _uiOnlyBooted = false;
}
if (typeof document !== "undefined") {
    // geoleaf:profile:loaded — fired after the active profile (including ui.json)
    //   is loaded and merged; getActiveProfile() is then populated.
    // geoleaf:map:ready — safety net, fires later during boot.
    // geoleaf:config:loaded fires BEFORE profile load so the flag is not yet
    //   readable via getActiveProfile() — not used.
    document.addEventListener("geoleaf:profile:loaded", _autoBootstrapUiOnly, { once: true });
    document.addEventListener("geoleaf:map:ready", _autoBootstrapUiOnly, { once: true });
    // Fallback: plugin script loaded after events already fired
    if (_readUiShowCredentialButtonFlag())
        _autoBootstrapUiOnly();
}
if (_g.GeoLeaf?.plugins?.register) {
    _g.GeoLeaf.plugins.register("connector", {
        version: "1.2.4",
        type: "standard",
        optional: ["storage", "addpoi"],
        label: "Connector (Auth + Fetch intercept)",
        healthCheck: () => !!_currentInstance,
    });
}

export { _resetAutoBootstrapForTests, createConnector };
//# sourceMappingURL=geoleaf-connector.plugin.js.map
