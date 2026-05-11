/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
const LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};
let currentLevel = LEVELS.INFO; // niveau by default
let quietMode = false; // silent mode for repetitive logs
const groupedMessageCounts = new Map(); // pour groupr les messages similaires
const MAX_GROUPED_ENTRIES = 200; // cap to prevent unbounded growth
const formatPrefix = (type) => `[GeoLeaf.${type}]`;
// Detects if a message is repetitive or non-critical informational
const isRepetitiveMessage = (message) => {
    const patterns = [
        /Chargement du sprite SVG/,
        /Sprite SVG detected/,
        /IconsConfig retrieved/,
        /Module.*loaded/,
        /Module.*initialized/,
        /Control.*added/,
        /Button.*added/,
        /Panel.*created/,
        /Section.*remplie/,
        /Profile.*loaded/,
        /Layer.*loaded/,
        /Style.*applied/,
        /ThemeApplier/,
        /LayerManager/,
        /Storage/,
        /CacheButton/,
        /Renderers\./,
        /FormRenderer/,
        /ResourceEnumerator/,
        /LayerSelector/,
        /CacheControl/,
        /POI.*DEBUG/,
        /AddForm/,
    ];
    return patterns.some((pattern) => pattern.test(message));
};
// Critical messages that must always be displayed
const isCriticalMessage = (message) => {
    const criticalPatterns = [
        /ERROR/,
        /WARN/,
        /Failed/,
        /Error/,
        /Exception/,
        /Map initialized successfully/,
        /All.*modules loaded/,
        /Mode.*activated/,
    ];
    return criticalPatterns.some((pattern) => pattern.test(message));
};
// Manages grouped messages
const handleGroupedMessage = (message, _args) => {
    const key = message.replace(/\d+/g, "X").replace(/[{}:,]/g, ""); // normalise
    const count = (groupedMessageCounts.get(key) || 0) + 1;
    groupedMessageCounts.set(key, count);
    // Evict oldest entries when cap is reached
    if (groupedMessageCounts.size > MAX_GROUPED_ENTRIES) {
        const firstKey = groupedMessageCounts.keys().next().value;
        if (firstKey !== undefined)
            groupedMessageCounts.delete(firstKey);
    }
    if (count === 1) {
        return true; // displays le premier
    }
    else if (count === 3 && !isCriticalMessage(message)) {
        console.info(`${formatPrefix("INFO")} [Grouped] Repeated message - continuation hidden: ${message.substring(0, 60)}...`);
        return false;
    }
    else if (count > 3) {
        return false; // suppressed after 3 occurrences for non-critical messages
    }
    return count <= 2; // displays max 2 fois les messages non critiques
};
/**
 * Logger centralized GeoLeaf (implementation)
 */
const _LogImpl = {
    setLevel(level) {
        const lvl = String(level).toLowerCase();
        switch (lvl) {
            case "debug":
                currentLevel = LEVELS.DEBUG;
                break;
            case "info":
                currentLevel = LEVELS.INFO;
                break;
            case "warn":
                currentLevel = LEVELS.WARN;
                break;
            case "error":
                currentLevel = LEVELS.ERROR;
                break;
            case "production":
                currentLevel = LEVELS.WARN; // En production, only WARN et ERROR
                quietMode = true;
                break;
            default:
                console.warn(`${formatPrefix("WARN")} Niveau de log inconnu :`, level);
        }
    },
    getLevel() {
        return currentLevel;
    },
    getLevelName() {
        for (const [name, value] of Object.entries(LEVELS)) {
            if (value === currentLevel)
                return name;
        }
        return "UNKNOWN";
    },
    setQuietMode(enabled) {
        if (quietMode === enabled)
            return; // avoid repetitions
        quietMode = enabled;
        if (enabled) {
            console.info(`${formatPrefix("INFO")} Silent mode activated - repetitive logs reduced`);
        }
    },
    showSummary() {
        if (groupedMessageCounts.size > 0) {
            console.group(`${formatPrefix("INFO")} Grouped log summary`);
            for (const [message, count] of groupedMessageCounts) {
                if (count > 3) {
                    console.info(`• ${count}x: ${message.substring(0, 60)}...`);
                }
            }
            console.groupEnd();
        }
    },
    debug(...args) {
        if (currentLevel <= LEVELS.DEBUG) {
            const message = args.map((a) => String(a)).join(" ");
            if (quietMode && isRepetitiveMessage(message)) {
                if (!handleGroupedMessage(message))
                    return;
            }
            console.debug(formatPrefix("DEBUG"), ...args);
        }
    },
    info(...args) {
        if (currentLevel <= LEVELS.INFO) {
            const message = args.map((a) => String(a)).join(" ");
            // In mode silencieux, filter plus agressivement
            if (quietMode) {
                // Always display les messages critiques
                if (isCriticalMessage(message)) {
                    console.info(formatPrefix("INFO"), ...args);
                    return;
                }
                // Group/hide repetitive messages
                if (isRepetitiveMessage(message)) {
                    if (!handleGroupedMessage(message))
                        return;
                }
            }
            console.info(formatPrefix("INFO"), ...args);
        }
    },
    warn(...args) {
        if (currentLevel <= LEVELS.WARN) {
            console.warn(formatPrefix("WARN"), ...args);
        }
    },
    error(...args) {
        if (currentLevel <= LEVELS.ERROR) {
            console.error(formatPrefix("ERROR"), ...args);
        }
    },
};
const _g$5 = typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
        ? window
        : {};
/**
 * Exported Log proxy — delegates to LogImpl; provides CJS test override area
 * (global.GeoLeaf.Log = mock)
 * whithe modules use the standard `import { Log }` pattern.
 */
const Log = new Proxy(_LogImpl, {
    get(_target, prop, receiver) {
        const current = _g$5.GeoLeaf?.Log;
        if (current && current !== _LogImpl && current !== receiver && prop in current) {
            return current[prop];
        }
        return _LogImpl[prop];
    },
});

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module errors
 * @description Typed error classes for GeoLeaf.
 * Each error type includes context information and can be caught specifically.
 */
// ── Base class ──
class GeoLeafError extends Error {
    context;
    timestamp;
    constructor(message, context = {}) {
        super(message);
        this.name = this.constructor.name;
        this.context = context;
        this.timestamp = new Date().toISOString();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
    toString() {
        const contextStr = Object.keys(this.context).length > 0
            ? ` [Context: ${JSON.stringify(this.context)}]`
            : "";
        return `${this.name}: ${this.message}${contextStr}`;
    }
}
// ── Specific error types ──
class ValidationError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "VALIDATION_ERROR";
    }
}
class SecurityError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "SECURITY_ERROR";
    }
}
class ConfigError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "CONFIG_ERROR";
    }
}
class NetworkError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "NETWORK_ERROR";
    }
}
class InitializationError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "INITIALIZATION_ERROR";
    }
}
class MapError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "MAP_ERROR";
    }
}
class DataError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "DATA_ERROR";
    }
}
class POIError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "POI_ERROR";
    }
}
class RouteError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "ROUTE_ERROR";
    }
}
class UIError extends GeoLeafError {
    constructor(message, context = {}) {
        super(message, context);
        this.code = "UI_ERROR";
    }
}
// ── Error codes enum ──
const ErrorCodes = Object.freeze({
    VALIDATION: "VALIDATION_ERROR",
    SECURITY: "SECURITY_ERROR",
    CONFIG: "CONFIG_ERROR",
    NETWORK: "NETWORK_ERROR",
    INITIALIZATION: "INITIALIZATION_ERROR",
    MAP: "MAP_ERROR",
    DATA: "DATA_ERROR",
    POI: "POI_ERROR",
    ROUTE: "ROUTE_ERROR",
    UI: "UI_ERROR",
});
// ── Utility functions ──
function normalizeError(error, defaultMessage = "An unknown error occurred") {
    if (error instanceof Error)
        return error;
    if (typeof error === "string")
        return new GeoLeafError(error);
    if (error && typeof error === "object") {
        const obj = error;
        const message = obj.message || obj.error || defaultMessage;
        return new GeoLeafError(message, { originalError: error });
    }
    return new GeoLeafError(defaultMessage, { originalError: error });
}
function isErrorType(error, ErrorClass) {
    return error instanceof ErrorClass;
}
function getErrorCode(error) {
    if (error && typeof error === "object" && "code" in error)
        return error.code;
    return "UNKNOWN_ERROR";
}
function createError(ErrorClass, message, context = {}) {
    const err = new ErrorClass(message, context);
    if (Error.captureStackTrace) {
        Error.captureStackTrace(err, createError);
    }
    return err;
}
const errorMap = {
    validation: ValidationError,
    security: SecurityError,
    config: ConfigError,
    network: NetworkError,
    initialization: InitializationError,
    map: MapError,
    data: DataError,
    poi: POIError,
    route: RouteError,
    ui: UIError,
};
function createErrorByType(type, message, context = {}) {
    const ErrorClass = errorMap[type.toLowerCase()] || GeoLeafError;
    return createError(ErrorClass, message, context);
}
const MAX_ERROR_MESSAGE_LENGTH = 500;
function sanitizeErrorMessage(message, maxLength = MAX_ERROR_MESSAGE_LENGTH) {
    if (message == null)
        return "Unknown error";
    let str = typeof message === "string" ? message : String(message);
    str = str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    if (str.length > maxLength) {
        str = str.slice(0, maxLength) + "...";
    }
    return str;
}
function safeErrorHandler(handler, error) {
    if (typeof handler !== "function")
        return;
    try {
        handler(error);
    }
    catch (handlerError) {
        Log.error("[GeoLeaf.Errors] Error in error handler:", handlerError);
        Log.error("[GeoLeaf.Errors] Original error:", error);
    }
}
// ── Aggregate export (facade) ──
const Errors = {
    GeoLeafError,
    ValidationError,
    SecurityError,
    ConfigError,
    NetworkError,
    InitializationError,
    MapError,
    DataError,
    POIError,
    RouteError,
    UIError,
    normalizeError,
    isErrorType,
    getErrorCode,
    createError,
    createErrorByType,
    sanitizeErrorMessage,
    safeErrorHandler,
    ErrorCodes,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module constants
 * @description Constantes globales GeoLeaf — values numerics centralizedes.
 */
const CONSTANTS = Object.freeze({
    // Carte — vue neutre, le fitBounds positionne after loading des layers
    DEFAULT_ZOOM: 3,
    DEFAULT_CENTER: [0, 0],
    MAX_ZOOM_ON_FIT: 15,
    // POI
    POI_MARKER_SIZE: 12,
    POI_MAX_ZOOM: 18,
    POI_SWIPE_THRESHOLD: 50,
    POI_LIGHTBOX_TRANSITION_MS: 300,
    POI_SIDEPANEL_DEFAULT_WIDTH: 420,
    // Route
    ROUTE_MAX_ZOOM_ON_FIT: 14,
    ROUTE_WAYPOINT_RADIUS: 5,
    // GeoJSON
    GEOJSON_MAX_ZOOM_ON_FIT: 15,
    GEOJSON_POINT_RADIUS: 6,
    // UI
    FULLSCREEN_TRANSITION_MS: 10,
});

/*!



 * GeoLeaf Core



 * © 2026 Mattieu Pottier



 * Released under the MIT License



 * https://geoleaf.dev



 */
/**



 * @module security



 * @description Security functions for GeoLeaf — HTML escaping, URL validation, sanitization.



 */
// ── HTML Escaping ──
/**



 * Escape dangerous HTML characters to prevent XSS.
 *
 * @security Sanitizes arbitrary strings against HTML injection by escaping <, >, &, ", ' to entities.
 *
 * @param str - The string to escape. Null or undefined returns `""`.
 *
 * @returns The HTML-escaped string, safe for use in DOM text contexts.



 */
function escapeHtml(str) {
    if (str === null || str === undefined) {
        return "";
    }
    if (typeof str !== "string") {
        str = String(str);
    }
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
/**



 * Escape HTML attributes for safe use in attribute values.
 *
 * @security Sanitizes arbitrary strings against attribute injection by escaping &, ', ", <, >.
 *
 * @param str - The string to escape. Null or undefined returns `""`.
 *
 * @returns The escaped string, safe for use in HTML attribute values.



 */
function escapeAttribute(str) {
    if (str === null || str === undefined) {
        return "";
    }
    if (typeof str !== "string") {
        str = String(str);
    }
    return str
        .replace(/&/g, "&amp;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
/**



 * Resolve the base URL for relative URL parsing, defaulting to the current origin.



 * @param baseUrl - Optional explicit base URL.



 * @returns The resolved base URL string.



 */
function _resolveBaseUrl(baseUrl) {
    const _loc = typeof globalThis !== "undefined" && "location" in globalThis
        ? globalThis.location
        : typeof location !== "undefined"
            ? location
            : null;
    return baseUrl ?? _loc?.origin ?? "https://localhost";
}
const _ALLOWED_DATA_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/svg+xml",
    "image/webp",
];
function _validateDataUrl$1(url) {
    const dataPrefix = url.split(",")[0];
    const mimeMatch = dataPrefix.match(/data:([^;,]+)/);
    if (!mimeMatch)
        throw new Error("Invalid data URL format");
    if (!_ALLOWED_DATA_TYPES.includes(mimeMatch[1])) {
        throw new Error(`Data URL type "${mimeMatch[1]}" not allowed. Allowed: ${_ALLOWED_DATA_TYPES.join(", ")}`);
    }
}
/**



 * Validate a URL strictly against a protocol whitelist (http, https, data:image).
 *
 * @security Rejects javascript:, vbscript:, data:text/html and other dangerous protocols.
 *
 * @param url - The URL string to validate.



 * @param baseUrl - Optional base URL for relative URL resolution. Defaults to `location.origin`.



 * @param options - Optional: set `httpsOnly: true` to reject http: (production hardening).



 * @returns The normalized absolute URL string.



 * @throws {Error} If the URL is invalid or the protocol is not allowed.



 */
function validateUrl$2(url, baseUrl, options) {
    if (!url || typeof url !== "string") {
        throw new TypeError("URL must be a non-empty string");
    }
    url = url.trim();
    const base = _resolveBaseUrl(baseUrl);
    try {
        const parsed = new URL(url, base);
        const allowedProtocols = options?.httpsOnly
            ? ["https:", "data:"]
            : ["http:", "https:", "data:"];
        if (!allowedProtocols.includes(parsed.protocol)) {
            throw new Error(options?.httpsOnly
                ? "Only https: and data: (images) URLs are allowed when security.httpsOnly is enabled."
                : `Protocol "${parsed.protocol}" not allowed. Allowed protocols: ${allowedProtocols.join(", ")}`);
        }
        if (parsed.protocol === "data:") {
            _validateDataUrl$1(url);
        }
        return parsed.href;
    }
    catch (e) {
        const err = e;
        if (err.message?.includes("not allowed")) {
            throw e;
        }
        throw new Error(`Invalid URL "${url}": ${err.message}`);
    }
}
/**



 * Validate geographic coordinates (latitude and longitude).
 *
 * @security Rejects non-finite, NaN, Infinity, and out-of-range coordinate values.
 *
 * @param lat - Latitude value, must be in range [-90, 90].



 * @param lng - Longitude value, must be in range [-180, 180].



 * @returns A tuple `[lat, lng]` if valid.



 * @throws {TypeError} If values are not finite numbers.



 * @throws {RangeError} If values are out of the allowed range.



 */
function validateCoordinates$1(lat, lng) {
    if (typeof lat !== "number" || typeof lng !== "number") {
        throw new TypeError(`Coordinates must be numbers, got lat=${typeof lat}, lng=${typeof lng}`);
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new RangeError("Coordinates must be finite numbers (not NaN or Infinity)");
    }
    if (lat < -90 || lat > 90) {
        throw new RangeError(`Latitude must be between -90 and 90, got ${lat}`);
    }
    if (lng < -180 || lng > 180) {
        throw new RangeError(`Longitude must be between -180 and 180, got ${lng}`);
    }
    return [lat, lng];
}
// ── POI field constants and helpers ──
const _TEXT_FIELDS = [
    "label",
    "name",
    "title",
    "description",
    "desc",
    "address",
    "phone",
    "email",
    "category",
    "type",
];
const _URL_FIELDS = ["url", "website", "image", "photo", "icon"];
function _sanitizeStringValue(key, value) {
    if (_TEXT_FIELDS.includes(key))
        return escapeHtml(value);
    if (_URL_FIELDS.includes(key)) {
        try {
            return validateUrl$2(value);
        }
        catch (e) {
            Log.warn(`[Security] Invalid URL for ${key}: ${e.message}`);
            return "";
        }
    }
    return value;
}
function _sanitizeEntry(key, value, sanitized) {
    if (typeof value === "function" || typeof value === "symbol")
        return;
    if (value === null || value === undefined) {
        sanitized[key] = "";
        return;
    }
    if (typeof value === "string") {
        sanitized[key] = _sanitizeStringValue(key, value);
        return;
    }
    if (Array.isArray(value)) {
        sanitized[key] = value.map((item) => {
            if (typeof item === "object" && item !== null)
                return sanitizePoiProperties(item);
            if (typeof item === "string")
                return escapeHtml(item);
            return item;
        });
        return;
    }
    if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizePoiProperties(value);
    }
    else {
        sanitized[key] = value;
    }
}
/**



 * Sanitize a POI properties object — escapes text fields and validates URLs.
 *
 * @security Sanitizes all POI property values from external GeoJSON data against XSS and URL injection.
 *
 * @param props - The raw POI properties object to sanitize. Null or undefined returns `{}`.



 * @returns A new object with safely escaped values.



 */
function sanitizePoiProperties(props) {
    if (!props || typeof props !== "object") {
        return {};
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(props)) {
        _sanitizeEntry(key, value, sanitized);
    }
    return sanitized;
}
/**



 * Check whether a string contains potentially dangerous HTML patterns (XSS vectors).
 *
 * @security Detects script, iframe, object, embed, base, form, meta, link, event handlers, and dangerous protocols.
 *
 * @param str - The value to test. Non-string values return false.



 * @returns `true` if dangerous patterns are detected, `false` otherwise.



 */
function containsDangerousHtml(str) {
    if (typeof str !== "string")
        return false;
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<applet/i,
        /<meta/i,
        /<link/i,
        /vbscript:/i,
        /data:text\/html/i,
        /<base/i,
        /<form/i,
    ];
    return dangerousPatterns.some((pattern) => pattern.test(str));
}
/**



 * Strip all HTML from a string, keeping only text content.
 *
 * @security Removes all HTML tags from untrusted strings, returning safe plain text.
 *
 * @param html - The HTML string to strip. Non-string values return `""`.
 *
 * @returns The plain text content without any HTML tags.



 */
function stripHtml(html) {
    if (typeof html !== "string")
        return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent ?? doc.body.innerText ?? "";
}
// ── Safe DOM Creation ──
/**



 * Create a DOM element safely with automatic content escaping.



 * @param tagName - The HTML tag name to create (e.g. `"div"`, `"span"`).



 * @param options - Optional element properties: className, id, textContent, attributes, children.



 * @returns The created DOM element with safely escaped content.



 */
function createSafeElement(tagName, options = {}) {
    const element = document.createElement(tagName);
    if (options.className)
        element.className = options.className;
    if (options.id)
        element.id = options.id;
    if (options.textContent) {
        element.textContent = options.textContent;
    }
    if (options.attributes) {
        Object.keys(options.attributes).forEach((key) => {
            element.setAttribute(key, escapeAttribute(options.attributes[key]));
        });
    }
    if (options.children && Array.isArray(options.children)) {
        options.children.forEach((child) => {
            if (child instanceof Element)
                element.appendChild(child);
        });
    }
    return element;
}
// ── SVG Sanitization ──
/**



 * Parse and sanitize SVG content safely, removing scripts and event handlers.
 *
 * @security Strips script, foreignObject, on* handlers, and javascript: hrefs from external SVG content.
 *
 * @param svgContent - The raw SVG string to sanitize. Null or undefined returns null.



 * @returns The sanitized `SVGElement`, or null if parsing fails or content is invalid.



 */
function sanitizeSvgContent(svgContent) {
    if (!svgContent || typeof svgContent !== "string")
        return null;
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, "image/svg+xml");
        const parserError = doc.querySelector("parsererror");
        if (parserError) {
            Log.warn("[Security] Error parsing SVG:", parserError.textContent ?? "");
            return null;
        }
        const svgEl = doc.documentElement;
        if (!svgEl || svgEl.tagName.toLowerCase() !== "svg") {
            Log.warn("[Security] Invalid SVG content: root element is not SVG");
            return null;
        }
        const dangerousElements = ["script", "foreignObject", "use[href^='data:']"];
        dangerousElements.forEach((selector) => {
            const elements = svgEl.querySelectorAll(selector);
            elements.forEach((el) => el.remove());
        });
        // Strip dangerous attributes from ALL elements including the root <svg>
        const allElements = [svgEl, ...Array.from(svgEl.querySelectorAll("*"))];
        allElements.forEach((el) => {
            Array.from(el.attributes).forEach((attr) => {
                if (attr.name.toLowerCase().startsWith("on")) {
                    el.removeAttribute(attr.name);
                }
                const isHref = attr.name === "href" || attr.name === "xlink:href";
                const val = (attr.value || "").toLowerCase().trim();
                const jsProto = "javascript" + ":";
                const isJsProtocol = val.length >= jsProto.length && val.slice(0, jsProto.length) === jsProto;
                if (isHref && isJsProtocol) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        return svgEl;
    }
    catch (e) {
        Log.warn("[Security] Erreur sanitization SVG:", e.message);
        return null;
    }
}
// ── Number Validation ──
/**



 * Validate that a value is a finite number within a given range.
 *
 * @security Rejects NaN, Infinity, and out-of-range values from untrusted input (URL params, config).
 *
 * @param value - The value to validate; coerced to number via `Number()`.



 * @param min - Minimum allowed value (inclusive). Defaults to `-Infinity`.



 * @param max - Maximum allowed value (inclusive). Defaults to `Infinity`.



 * @returns The validated number, or null if invalid or out of range.



 */
function validateNumber(value, min = -Infinity, max = Infinity) {
    const num = Number(value);
    if (!Number.isFinite(num))
        return null;
    if (num < min || num > max)
        return null;
    return num;
}
// ── Safe HTML Parsing ──
const DEFAULT_ALLOWED_TAGS = ["p", "br", "strong", "em", "span", "a", "ul", "ol", "li", "b", "i"];
/**



 * Parse HTML safely with a tag allowlist, converting disallowed elements to text nodes.
 *
 * @security Parses untrusted HTML, keeping only whitelisted tags; validates link hrefs via validateUrl.
 *
 * @param html - The HTML string to parse. Non-string or empty values return an empty fragment.



 * @param allowedTags - Array of allowed tag names. Defaults to `["p","br","strong","em","span","a","ul","ol","li","b","i"]`.



 * @returns A `DocumentFragment` containing the sanitized DOM nodes.



 */
function parseHtmlSafely(html, allowedTags = DEFAULT_ALLOWED_TAGS) {
    const fragment = document.createDocumentFragment();
    if (!html || typeof html !== "string")
        return fragment;
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const cleanNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return document.createTextNode(node.textContent ?? "");
            }
            if (node.nodeType !== Node.ELEMENT_NODE)
                return null;
            const tagName = node.tagName.toLowerCase();
            if (!allowedTags.includes(tagName)) {
                return document.createTextNode(node.textContent ?? "");
            }
            // SVG elements require createElementNS for correct rendering.
            const SVG_NS = "http://www.w3.org/2000/svg";
            const svgTags = [
                "svg",
                "path",
                "circle",
                "rect",
                "g",
                "use",
                "line",
                "polygon",
                "polyline",
                "ellipse",
                "defs",
                "clipPath",
            ];
            const isSvg = svgTags.includes(tagName);
            const cleanElement = isSvg
                ? document.createElementNS(SVG_NS, tagName)
                : document.createElement(tagName);
            if (tagName === "a" && node.hasAttribute("href")) {
                try {
                    const href = validateUrl$2(node.getAttribute("href"));
                    cleanElement.setAttribute("href", href);
                    cleanElement.setAttribute("rel", "noopener noreferrer");
                    cleanElement.setAttribute("target", "_blank");
                }
                catch {
                    // Invalid URL — ignore the link
                }
            }
            // @security Copy safe attributes for SVG elements (presentation only).
            if (isSvg) {
                const SVG_SAFE_ATTRS = [
                    "viewBox",
                    "width",
                    "height",
                    "fill",
                    "stroke",
                    "stroke-width",
                    "stroke-linecap",
                    "stroke-linejoin",
                    "d",
                    "cx",
                    "cy",
                    "r",
                    "rx",
                    "ry",
                    "x",
                    "y",
                    "x1",
                    "y1",
                    "x2",
                    "y2",
                    "points",
                    "transform",
                    "opacity",
                    "fill-opacity",
                    "stroke-opacity",
                    "fill-rule",
                    "clip-rule",
                    "xmlns",
                    "class",
                ];
                const el = node;
                for (const attr of SVG_SAFE_ATTRS) {
                    if (el.hasAttribute(attr)) {
                        cleanElement.setAttribute(attr, el.getAttribute(attr));
                    }
                }
            }
            node.childNodes.forEach((child) => {
                const cleanChild = cleanNode(child);
                if (cleanChild)
                    cleanElement.appendChild(cleanChild);
            });
            return cleanElement;
        };
        doc.body.childNodes.forEach((child) => {
            const cleanChild = cleanNode(child);
            if (cleanChild)
                fragment.appendChild(cleanChild);
        });
    }
    catch (e) {
        Log.warn("[Security] Error parsing safe HTML:", e.message);
    }
    return fragment;
}
// ── Alias for backward compatibility ──
/** Clear element children without innerHTML (same contract as DOMSecurity.clearElement; avoids circular import). */
function clearElementContent(el) {
    const htmlEl = el;
    if (!htmlEl?.firstChild)
        return;
    while (htmlEl.firstChild) {
        htmlEl.removeChild(htmlEl.firstChild);
    }
}
/**



 * Sanitize HTML content and inject into a DOM element safely.
 *
 * @security Sanitizes untrusted HTML via parseHtmlSafely before DOM injection; primary entry point.
 *
 * @param element - The target DOM element to inject content into.



 * @param html - The HTML string to sanitize and inject. Null or undefined clears the element.



 * @param options - Optional: `{ stripAll: true }` to strip all tags; `{ allowedTags: [...] }` to customize.



 * @returns The element for chaining, or null if invalid.



 */
function sanitizeHTML(element, html, options = {}) {
    if (!element || typeof element.appendChild !== "function")
        return null;
    if (html == null) {
        clearElementContent(element);
        return element;
    }
    const str = typeof html === "string" ? html : String(html);
    if (options.stripAll) {
        element.textContent = stripHtml(str);
        return element;
    }
    const allowedTags = options.allowedTags ?? DEFAULT_ALLOWED_TAGS;
    const fragment = parseHtmlSafely(str, allowedTags);
    clearElementContent(element);
    element.appendChild(fragment);
    return element;
}
// ── Aggregate export (facade) ──
const Security = {
    escapeHtml,
    escapeAttribute,
    validateUrl: validateUrl$2,
    validateCoordinates: validateCoordinates$1,
    sanitizePoiProperties,
    containsDangerousHtml,
    stripHtml,
    createSafeElement,
    sanitizeSvgContent,
    validateNumber,
    parseHtmlSafely,
    sanitizeHTML,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module security/csrf-token
 * @description CSRF Token Manager — generates and validates CSRF tokens.
 */
const _g$4 = typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
        ? window
        : {};
const CSRFToken = {
    _token: null,
    _tokenExpiry: null,
    _tokenDuration: 3600000,
    _refreshIntervalId: null,
    init() {
        try {
            this._token = this._generateToken();
            this._tokenExpiry = Date.now() + this._tokenDuration;
            this._startAutoRefresh();
            Log.info("[CSRF] Token initialized");
        }
        catch (e) {
            Log.error("[CSRF] Init failed — crypto.getRandomValues unavailable:", e.message);
            this._token = null;
        }
    },
    _generateToken() {
        if (_g$4.crypto && _g$4.crypto.getRandomValues) {
            const array = new Uint8Array(32);
            _g$4.crypto.getRandomValues(array);
            return btoa(String.fromCharCode(...array))
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=/g, "");
        }
        Log.error("[CSRF] crypto.getRandomValues not available — CSRF protection disabled");
        throw new Error("[CSRF] Secure random number generation not available");
    },
    getToken() {
        if (!this._token || Date.now() >= (this._tokenExpiry ?? 0)) {
            Log.info("[CSRF] Token expired, generating new one");
            try {
                this._token = this._generateToken();
                this._tokenExpiry = Date.now() + this._tokenDuration;
            }
            catch (e) {
                Log.error("[CSRF] Token generation failed:", e.message);
                this._token = null;
            }
        }
        return this._token;
    },
    /** @security Validates CSRF token integrity; rejects expired or mismatched tokens. */
    validateToken(token) {
        if (!token || typeof token !== "string")
            return false;
        if (token === this._token && Date.now() < (this._tokenExpiry ?? 0))
            return true;
        Log.warn("[CSRF] Token validation failed");
        return false;
    },
    addTokenToData(data) {
        const token = this.getToken();
        if (data instanceof FormData) {
            data.append("csrf_token", token ?? "");
        }
        else if (typeof data === "object" && data !== null) {
            data.csrf_token = token;
        }
        return data;
    },
    addTokenToHeaders(options = {}) {
        const token = this.getToken();
        if (!options.headers)
            options.headers = {};
        options.headers["X-CSRF-Token"] = token ?? "";
        return options;
    },
    createTokenInput() {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "csrf_token";
        input.value = this.getToken() ?? "";
        input.className = "csrf-token-input";
        return input;
    },
    addTokenToForm(form) {
        if (!form || !(form instanceof HTMLFormElement)) {
            Log.error("[CSRF] Invalid form element");
            return;
        }
        const existingInput = form.querySelector('input[name="csrf_token"]');
        if (existingInput) {
            existingInput.value = this.getToken() ?? "";
            return;
        }
        form.appendChild(this.createTokenInput());
    },
    validateFormToken(data) {
        let token;
        if (data instanceof FormData) {
            token = data.get("csrf_token");
        }
        else if (typeof data === "object" && data !== null) {
            token = data.csrf_token;
        }
        else {
            token = undefined;
        }
        return this.validateToken(token);
    },
    /**
     * Sets a cookie with security attributes for CSRF protection.
     * - `Secure` flag is added by default on HTTPS contexts (`secure: true`).
     * - `SameSite=Strict` is the default — change to `Lax` for cross-site OAuth flows.
     * @security Breaking change (v2.0.0): `secure` defaults to `true`. Consumers
     * relying on HTTP-only deployments must explicitly pass `{ secure: false }`.
     */
    setSecureCookie(cookieName, value, options = {}) {
        const { maxAge = 3600, path = "/", sameSite = "Strict", secure = true } = options;
        let cookie = `${encodeURIComponent(cookieName)}=${encodeURIComponent(value)}`;
        cookie += `; Max-Age=${maxAge}`;
        cookie += `; Path=${path}`;
        cookie += `; SameSite=${sameSite}`;
        if (secure && _g$4.location?.protocol === "https:") {
            cookie += "; Secure";
        }
        else if (secure) {
            Log.warn("[CSRF] setSecureCookie: 'secure' option ignored — HTTP context detected. Cookie will not have the Secure flag.");
        }
        document.cookie = cookie;
        Log.info(`[CSRF] Secure cookie set: ${cookieName}`);
    },
    _startAutoRefresh() {
        const refreshInterval = this._tokenDuration - 5 * 60 * 1000;
        this._refreshIntervalId = setInterval(() => {
            Log.info("[CSRF] Auto-refreshing token");
            this._token = this._generateToken();
            this._tokenExpiry = Date.now() + this._tokenDuration;
            if (typeof CustomEvent !== "undefined") {
                const event = new CustomEvent("geoleaf:csrf:refreshed", {
                    detail: { token: this._token },
                });
                document.dispatchEvent(event);
            }
        }, refreshInterval);
    },
    destroy() {
        if (this._refreshIntervalId !== null) {
            clearInterval(this._refreshIntervalId);
            this._refreshIntervalId = null;
        }
        this._token = null;
        this._tokenExpiry = null;
        Log.debug("[CSRF] Destroyed");
    },
    rotateToken() {
        Log.info("[CSRF] Rotating token");
        this._token = this._generateToken();
        this._tokenExpiry = Date.now() + this._tokenDuration;
        if (typeof CustomEvent !== "undefined") {
            const event = new CustomEvent("geoleaf:csrf:rotated", {
                detail: { token: this._token },
            });
            document.dispatchEvent(event);
        }
    },
    getTokenInfo() {
        return {
            hasToken: !!this._token,
            expiresIn: this._tokenExpiry ? Math.max(0, this._tokenExpiry - Date.now()) : 0,
            isValid: !!(this._token && Date.now() < (this._tokenExpiry ?? 0)),
        };
    },
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * Module Config.Storage
 *
 * Responsibilities:
 * - Storage and management of the consolidated configuration
 * - API get/set avec paths "a.b.c"
 * - Fusion profonde (deep merge)
 * - Helpers de navigation dans l'tree de config
 */
const StorageModule = {
    _config: null,
    init(config) {
        this._config = config;
    },
    getAll() {
        return (this._config || {});
    },
    get(path, defaultValue) {
        if (!this._config || !path || typeof path !== "string") {
            return defaultValue;
        }
        const result = this.getValueByPath(this._config, path);
        return result === undefined ? defaultValue : result;
    },
    merge(config) {
        if (!this._config) {
            Log.warn("[GeoLeaf.Config.Storage] Configuration non initialisée.");
            return;
        }
        if (!config || typeof config !== "object" || Array.isArray(config)) {
            Log.warn("[GeoLeaf.Config.Storage] merge() requiert un objet valide.");
            return;
        }
        this._config = this.deepMerge(this._config, config);
    },
    set(path, value) {
        if (!this._config) {
            Log.warn("[GeoLeaf.Config.Storage] Configuration non initialisée.");
            return;
        }
        if (!path || typeof path !== "string") {
            Log.warn("[GeoLeaf.Config.Storage] set() requiert un chemin string non vide.");
            return;
        }
        const segments = path.split(".");
        let current = this._config;
        for (let i = 0; i < segments.length; i++) {
            const key = segments[i];
            if (i === segments.length - 1) {
                current[key] = value;
            }
            else {
                if (!Object.prototype.hasOwnProperty.call(current, key) ||
                    typeof current[key] !== "object" ||
                    current[key] === null) {
                    current[key] = {};
                }
                current = current[key];
            }
        }
    },
    getSection(sectionName, defaultValue) {
        if (!sectionName)
            return defaultValue;
        const value = this.get(sectionName);
        return value === undefined ? defaultValue : value;
    },
    deepMerge(target, source) {
        const output = Object.assign({}, target || {});
        if (!source || typeof source !== "object")
            return output;
        Object.keys(source).forEach((key) => {
            const srcVal = source[key];
            const tgtVal = output[key];
            if (srcVal &&
                typeof srcVal === "object" &&
                !Array.isArray(srcVal) &&
                tgtVal &&
                typeof tgtVal === "object" &&
                !Array.isArray(tgtVal)) {
                output[key] = this.deepMerge(tgtVal, srcVal);
            }
            else {
                output[key] = srcVal;
            }
        });
        return output;
    },
    getValueByPath(source, path) {
        if (!source || !path)
            return undefined;
        const parts = path.split(".");
        let current = source;
        for (let i = 0; i < parts.length; i += 1) {
            if (current == null)
                return undefined;
            current = current[parts[i]];
        }
        return current;
    },
    setValueByPath(target, path, value) {
        if (!target || !path)
            return;
        const parts = path.split(".");
        let current = target;
        for (let i = 0; i < parts.length - 1; i += 1) {
            const key = parts[i];
            if (!Object.prototype.hasOwnProperty.call(current, key) || current[key] == null) {
                current[key] = {};
            }
            current = current[key];
        }
        current[parts[parts.length - 1]] = value;
    },
};
const StorageHelper = StorageModule;

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
let _cachedSecurity = null;
function _getSecurity() {
    if (_cachedSecurity !== null)
        return _cachedSecurity;
    _cachedSecurity = Security ?? null;
    return _cachedSecurity;
}
function _validateUrl(url) {
    const Security = _getSecurity();
    const isRelative = /^\.{0,2}\//.test(url) || /^\/[^/]/.test(url);
    if (isRelative)
        return url;
    if (Security && typeof Security.validateUrl === "function") {
        try {
            return Security.validateUrl(url);
        }
        catch (e) {
            return new Error("[GeoLeaf.Config.Loader] " + (e instanceof Error ? e.message : String(e)));
        }
    }
    if (!/^https?:\/\//i.test(url))
        return new Error("[GeoLeaf.Config.Loader] URL doit \u00eatre relative ou commencer par http:// ou https://");
    return url;
}
function _checkContentType(contentType, strictContentType, ctx) {
    if (strictContentType && (!contentType || !contentType.includes("application/json"))) {
        return new Error("[GeoLeaf.Config.Loader] Content-Type invalide" +
            ctx +
            ": expected 'application/json', re\u00e7u '" +
            (contentType || "null") +
            "'.");
    }
    if (!strictContentType && contentType && !contentType.includes("application/json"))
        Log.warn("[GeoLeaf.Config.Loader] Unexpected Content-Type:", contentType);
    return null;
}
function _doFetch(url, hdrs, strictContentType, ctx) {
    return fetch(url, { method: "GET", headers: { Accept: "application/json", ...hdrs } })
        .then((response) => {
        if (!response.ok)
            throw new Error("HTTP " + response.status + " pour " + url);
        const ctErr = _checkContentType(response.headers.get("content-type"), strictContentType, ctx);
        if (ctErr)
            throw ctErr;
        return response.json().catch((parseErr) => {
            throw new Error("[GeoLeaf.Config.Loader] Erreur de parsing JSON pour " +
                url +
                ": " +
                parseErr.message);
        });
    })
        .then((json) => {
        if (typeof json !== "object" || json === null)
            throw new Error("Le JSON de configuration n'est pas un object valide.");
        return json;
    });
}
/**
 * Module Config.Loader
 *
 * Responsibilities:
 * - Loadsment HTTP via fetch() avec validation CSRF/XSS
 * - Validation Content-Type stricte
 * - Gestion des headers customs
 * - Helper generic _fetchJson()
 */
const LoaderModule = {
    /**
     * Fetch a JSON configuration file from a validated URL.
     * @param url - Absolute or relative URL of the JSON resource.
     * @param options - Optional fetch options (headers, strictContentType). Defaults to `{}`.
     * @returns The parsed JSON record, or an empty object `{}` if the URL is missing.
     */
    loadUrl(url, options = {}) {
        if (!url) {
            Log.warn("[GeoLeaf.Config.Loader] Missing JSON URL in loadUrl().");
            return Promise.resolve({});
        }
        const { headers = {}, strictContentType = true } = options;
        const validUrl = _validateUrl(url);
        if (validUrl instanceof Error) {
            Log.error(validUrl.message);
            return Promise.reject(validUrl);
        }
        return _doFetch(validUrl, headers, strictContentType, "").catch((err) => {
            Log.error("[GeoLeaf.Config.Loader] Error loading JSON:", err);
            throw err;
        });
    },
    /**
     * Fetch a JSON resource from a validated URL, returning null instead of throwing on empty.
     * @param url - Absolute or relative URL of the JSON resource.
     * @param options - Optional fetch options (headers, strictContentType). Defaults to `{}`.
     * @returns The parsed JSON record, or null if the URL is missing or the resource cannot be parsed.
     */
    fetchJson(url, options = {}) {
        if (!url) {
            Log.warn("[GeoLeaf.Config.Loader] fetchJson() called without URL.");
            return Promise.resolve(null);
        }
        const { headers = {}, strictContentType = true } = options;
        const validUrl = _validateUrl(url);
        if (validUrl instanceof Error) {
            Log.error(validUrl.message);
            return Promise.reject(validUrl);
        }
        return _doFetch(validUrl, headers, strictContentType, " dans fetchJson")
            .then((json) => json)
            .catch((err) => {
            Log.error("[GeoLeaf.Config.Loader] Error in fetchJson() for " + url + ":", err);
            throw err;
        });
    },
};
const ProfileLoader$1 = LoaderModule;

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
function _resolveCategoryKey(categories, id) {
    if (Object.prototype.hasOwnProperty.call(categories, id))
        return id;
    const lower = id.toLowerCase();
    return Object.keys(categories).find((k) => k.toLowerCase() === lower) ?? null;
}
function _resolveSubcategoryKey(subcategories, id) {
    if (Object.prototype.hasOwnProperty.call(subcategories, id))
        return id;
    const lower = id.toLowerCase();
    return Object.keys(subcategories).find((k) => k.toLowerCase() === lower) ?? null;
}
const TaxonomyModule = {
    _config: null,
    init(config) {
        this._config = config;
    },
    loadTaxonomy(url = null, options = {}) {
        const Loader = ProfileLoader$1;
        if (!Loader) {
            Log.error("[GeoLeaf.Config.Taxonomy] Loader module not available.");
            return Promise.reject(new Error("Loader module not available"));
        }
        if (!url) {
            Log.info("[GeoLeaf.Config.Taxonomy] No mapping URL provided — skip.");
            return Promise.resolve({});
        }
        return Loader.loadUrl(url, options)
            .then((cfg) => {
            const hasCategories = cfg &&
                typeof cfg === "object" &&
                cfg.categories &&
                typeof cfg.categories === "object" &&
                !Array.isArray(cfg.categories);
            if (!hasCategories) {
                Log.warn("[GeoLeaf.Config.Taxonomy] Category mapping file loaded but " +
                    "no valid 'categories' property found (expected: { \"categories\": { ... } }).");
            }
            else if (this._config) {
                if (!this._config.categories || typeof this._config.categories !== "object") {
                    this._config.categories = {};
                }
                Object.assign(this._config.categories, cfg.categories);
                Log.info("[GeoLeaf.Config.Taxonomy] Category mapping merged successfully.");
            }
            return this.getCategories();
        })
            .catch((err) => {
            Log.error("[GeoLeaf.Config.Taxonomy] Error loading taxonomy:", err);
            return {};
        });
    },
    getCategories() {
        if (!this._config)
            return {};
        const cats = this._config.categories;
        return cats && typeof cats === "object" && !Array.isArray(cats) ? cats : {};
    },
    getCategory(categoryId) {
        if (!categoryId || typeof categoryId !== "string")
            return undefined;
        const cats = this.getCategories();
        const key = _resolveCategoryKey(cats, categoryId);
        return key !== null ? cats[key] : undefined;
    },
    getSubcategory(categoryId, subCategoryId) {
        if (!categoryId ||
            typeof categoryId !== "string" ||
            !subCategoryId ||
            typeof subCategoryId !== "string") {
            return undefined;
        }
        const category = this.getCategory(categoryId);
        if (!category?.subcategories ||
            typeof category.subcategories !== "object" ||
            Array.isArray(category.subcategories)) {
            return undefined;
        }
        const subs = category.subcategories;
        const subKey = _resolveSubcategoryKey(subs, subCategoryId);
        return subKey !== null ? subs[subKey] : undefined;
    },
};
const TaxonomyManager = TaxonomyModule;

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
function _isValidLatLng(lat, lng) {
    return (typeof lat === "number" &&
        !Number.isNaN(lat) &&
        typeof lng === "number" &&
        !Number.isNaN(lng));
}
function _poiHasValidLocation(p) {
    if (Array.isArray(p.latlng) && p.latlng.length >= 2) {
        const [lat, lng] = p.latlng;
        if (_isValidLatLng(lat, lng))
            return true;
    }
    if (p.location && typeof p.location === "object") {
        const { lat, lng } = p.location;
        if (_isValidLatLng(lat, lng))
            return true;
    }
    return false;
}
/**
 * Module Config.Normalization
 *
 * Responsibilities:
 * - Normalisation structurelle des POI (mapping brut → format GeoLeaf)
 * - Application de mapping.json sur POI non normalized
 * - Normalisation des avis (reviews) : old/nouveau format
 * - Validation de la structure POI : id/title/location
 */
function _tryNormalizeRecentReviews(attributes, normalized) {
    const reviewsObj = attributes.reviews;
    const poiReviews = normalized.reviews;
    if (reviewsObj &&
        typeof reviewsObj === "object" &&
        !Array.isArray(reviewsObj) &&
        Array.isArray(reviewsObj.recent)) {
        attributes.reviews = { ...reviewsObj, recent: reviewsObj.recent.slice(0, 5) };
        return true;
    }
    if (poiReviews &&
        typeof poiReviews === "object" &&
        !Array.isArray(poiReviews) &&
        Array.isArray(poiReviews.recent)) {
        attributes.reviews = { ...poiReviews, recent: poiReviews.recent.slice(0, 5) };
        return true;
    }
    return false;
}
function _normalizePoiReviews(attributes, normalized, index) {
    if (_tryNormalizeRecentReviews(attributes, normalized))
        return;
    if (Array.isArray(attributes.reviews)) {
        attributes.reviews = attributes.reviews.slice(0, 5);
    }
    else if (Array.isArray(normalized.reviews)) {
        attributes.reviews = normalized.reviews.slice(0, 5);
    }
    else if (normalized.reviews !== undefined || attributes.reviews !== undefined) {
        Log.warn("[GeoLeaf.Config.Normalization] Unexpected `reviews` format for POI:", {
            poiIndex: index,
            poiId: normalized.id,
            reviewsType: typeof normalized.reviews,
            attributesReviewsType: typeof attributes.reviews,
        });
        attributes.reviews = [];
    }
    else {
        attributes.reviews = [];
    }
}
const NormalizationModule = {
    /** @security Blocks __proto__, constructor, prototype pollution in object assignment. */
    _safeAssign(target, source) {
        const dangerousKeys = ["__proto__", "constructor", "prototype"];
        for (const key in source) {
            if (!Object.prototype.hasOwnProperty.call(source, key))
                continue;
            if (dangerousKeys.includes(key)) {
                Log.warn("[GeoLeaf.Config.Normalization] Prototype pollution attempt blocked", {
                    key,
                });
                continue;
            }
            target[key] = source[key];
        }
        return target;
    },
    isPoiStructNormalized(poi) {
        if (!poi || typeof poi !== "object")
            return false;
        const p = poi;
        if (typeof p.id !== "string" || p.id.trim() === "")
            return false;
        const hasTitle = typeof p.title === "string" && p.title.trim() !== "";
        const hasLabel = typeof p.label === "string" && p.label.trim() !== "";
        if (!hasTitle && !hasLabel)
            return false;
        return _poiHasValidLocation(p);
    },
    mapRawPoiToNormalized(rawPoi, mappingDef) {
        if (!rawPoi || !mappingDef || typeof mappingDef !== "object")
            return null;
        if (!StorageHelper) {
            Log.error("[GeoLeaf.Config.Normalization] Module Storage non disponible.");
            return null;
        }
        const normalized = {
            id: "",
            title: "",
            location: { lat: 0, lng: 0 },
            attributes: {},
        };
        Object.keys(mappingDef).forEach((targetPath) => {
            const sourcePath = mappingDef[targetPath];
            if (!sourcePath)
                return;
            const value = StorageHelper.getValueByPath(rawPoi, sourcePath);
            if (typeof value === "undefined")
                return;
            StorageHelper.setValueByPath(normalized, targetPath, value);
        });
        if (!normalized.attributes ||
            typeof normalized.attributes !== "object" ||
            Array.isArray(normalized.attributes)) {
            normalized.attributes = {};
        }
        return normalized;
    },
    normalizePoiWithMapping(rawPoiArray, mappingConfig) {
        if (!Array.isArray(rawPoiArray))
            return [];
        const hasMapping = mappingConfig &&
            typeof mappingConfig === "object" &&
            mappingConfig.mapping &&
            typeof mappingConfig.mapping === "object";
        if (!hasMapping) {
            Log.debug("[GeoLeaf.Config.Normalization] Aucun mapping.json fourni ; " +
                "POIs used as-is (no structural normalization).");
            return rawPoiArray;
        }
        const mappingDef = mappingConfig.mapping;
        const result = [];
        rawPoiArray.forEach((rawPoi, index) => {
            if (this.isPoiStructNormalized(rawPoi)) {
                result.push(rawPoi);
                return;
            }
            const normalized = this.mapRawPoiToNormalized(rawPoi, mappingDef);
            if (normalized && this.isPoiStructNormalized(normalized)) {
                result.push(normalized);
            }
            else {
                Log.warn("[GeoLeaf.Config.Normalization] POI not normalized even after mapping; POI skipped.", { poiIndex: index, poiId: rawPoi && rawPoi.id });
            }
        });
        return result;
    },
    normalizePoiArray(poiArray) {
        if (!Array.isArray(poiArray))
            return poiArray;
        return poiArray.map((poi, index) => {
            if (!poi || typeof poi !== "object")
                return poi;
            const normalized = poi;
            const baseAttributes = normalized.attributes &&
                typeof normalized.attributes === "object" &&
                !Array.isArray(normalized.attributes)
                ? normalized.attributes
                : {};
            const attributes = Object.assign(Object.create(null), baseAttributes);
            _normalizePoiReviews(attributes, normalized, index);
            normalized.attributes = attributes;
            return normalized;
        });
    },
};
const ConfigNormalizer = NormalizationModule;

/**
 * @fileoverview Loader de profil modulaire pour GeoLeaf
 * @module config/profile-loader
 */
function _validateFiles(files, warn) {
    for (const [key, val] of Object.entries(files)) {
        if (val !== undefined && typeof val !== "string") {
            warn(`Files.${key} should be a string filename`);
        }
    }
}
function _validateBasemaps(basemaps, warn) {
    for (const [id, entry] of Object.entries(basemaps)) {
        const bm = entry;
        if (!bm || (!bm.url && !bm.style)) {
            // Sanitize id before logging: limit to 64 chars and strip control chars
            const safeId = String(id)
                .replaceAll(/[^\w.-]/g, "_")
                .slice(0, 64);
            warn(`basemaps.${safeId}: "url" or "style" is required`);
        }
    }
}
function _extractRawLayers(layersFileData) {
    if (!layersFileData)
        return null;
    if (Array.isArray(layersFileData.layers)) {
        return layersFileData.layers;
    }
    return Array.isArray(layersFileData) ? layersFileData : null;
}
/**
 * Expands `layerTemplates` from the layers file into individual LayerRef entries
 * with pre-built inline configs, appended after the regular layers array.
 */
function _expandLayerTemplates(regularLayers, layersFileData) {
    const templates = layersFileData
        ?.layerTemplates;
    if (!templates || !Array.isArray(templates) || templates.length === 0) {
        return regularLayers;
    }
    const expanded = [...regularLayers];
    for (const tpl of templates) {
        if (!Array.isArray(tpl.instances))
            continue; // guard: malformed template
        const baseData = tpl.template.data ?? {};
        for (const inst of tpl.instances) {
            const { id, label, dataFile, ...overrides } = inst;
            expanded.push({
                id,
                layerManagerId: tpl.layerManagerId,
                inlineConfig: {
                    ...tpl.template,
                    ...overrides,
                    id,
                    label,
                    data: { directory: baseData.directory ?? "data", file: dataFile },
                },
            });
        }
    }
    return expanded;
}
const ProfileLoader = {
    /**
     * Loads and hydrates a modular GeoLeaf profile by fetching taxonomy, themes, layer files, and individual layer configs.
     * @param profile - The base profile object (Files or inline taxonomy/themes/layers properties).
     * @param baseUrl - Base URL for resolving relative file paths.
     * @param profileId - Identifier used for logging and the enriched profile metadata.
     * @param timestamp - Cache-busting timestamp appended to fetch URLs. Defaults to `Date.now()`.
     * @param fetchOptions - Optional fetch configuration (headers, strictContentType).
     * @returns The enriched profile record with resolved taxonomy, themes, and layer configs.
     */
    async loadModularProfile(profile, baseUrl, profileId, timestamp = Date.now(), fetchOptions = {}) {
        if (!ProfileLoader$1)
            throw new Error("GeoLeaf._ConfigLoader not available");
        Log.info(`[ProfileLoader] ${profileId}`);
        // B.1 — If a pre-built bundle is declared, use it instead of the request cascade
        const bundleFile = profile.bundleFile;
        if (bundleFile) {
            return this._loadBundledProfile(profile, baseUrl, profileId, bundleFile, fetchOptions);
        }
        try {
            return await this._loadModularProfileCascade(profile, baseUrl, profileId, timestamp, fetchOptions);
        }
        catch (error) {
            Log.error("[ProfileLoader] Error loading modular profile:", error);
            throw error;
        }
    },
    /**
     * Fetches the taxonomy file or returns the inline taxonomy from the profile.
     * @param profile - The profile object.
     * @param baseUrl - Base URL for resolving the taxonomy file path.
     * @param timestamp - Cache-busting timestamp.
     * @param fetchOptions - Optional fetch configuration.
     * @returns The taxonomy record, or null if unavailable.
     */
    async _loadTaxonomy(profile, baseUrl, timestamp, fetchOptions) {
        const Loader = ProfileLoader$1;
        const taxonomyFile = profile.Files?.taxonomyFile ?? profile.taxonomyFile;
        if (!taxonomyFile && !profile.taxonomy)
            return null;
        if (taxonomyFile) {
            try {
                const taxonomy = await Loader.fetchJson(`${baseUrl}/${taxonomyFile}?t=${timestamp}`, fetchOptions);
                Log.info("[ProfileLoader] taxonomy.json loaded");
                return taxonomy;
            }
            catch (err) {
                Log.warn("[ProfileLoader] Error loading taxonomy.json:", err);
                return null;
            }
        }
        return profile.taxonomy ?? null;
    },
    /**
     * Fetches the themes file or returns the inline themes from the profile.
     * @param profile - The profile object.
     * @param baseUrl - Base URL for resolving the themes file path.
     * @param timestamp - Cache-busting timestamp.
     * @param fetchOptions - Optional fetch configuration.
     * @returns The themes record, or null if unavailable.
     */
    async _loadThemes(profile, baseUrl, timestamp, fetchOptions) {
        const Loader = ProfileLoader$1;
        const themesFile = profile.Files?.themesFile ?? profile.themesFile;
        if (themesFile) {
            try {
                return ((await Loader.fetchJson(`${baseUrl}/${themesFile}?t=${timestamp}`, fetchOptions)) ?? null);
            }
            catch (err) {
                Log.warn("[ProfileLoader] Error loading themes.json:", err);
                return null;
            }
        }
        return profile.themes ?? null;
    },
    /**
     * Fetches the layers index file defined in `profile.Files.layersFile`.
     * @param profile - The profile object.
     * @param baseUrl - Base URL for resolving the layers file path.
     * @param timestamp - Cache-busting timestamp.
     * @param fetchOptions - Optional fetch configuration.
     * @returns The layers file record, or null if no `layersFile` is defined.
     */
    async _loadLayersFile(profile, baseUrl, timestamp, fetchOptions) {
        const Loader = ProfileLoader$1;
        const layersFile = profile.Files?.layersFile;
        if (layersFile) {
            try {
                return ((await Loader.fetchJson(`${baseUrl}/${layersFile}?t=${timestamp}`, fetchOptions)) ?? null);
            }
            catch (err) {
                Log.warn("[ProfileLoader] Error loading layers.json:", err);
                return null;
            }
        }
        return null;
    },
    /**
     * Fetches an optional section file referenced in `profile.Files` (e.g. basemapsFile, uiFile).
     * Returns null silently if the file is not declared or fails to load.
     * @param profile - The profile object.
     * @param fileKey - Key in `profile.Files` pointing to the section file name.
     * @param baseUrl - Base URL for resolving the file path.
     * @param timestamp - Cache-busting timestamp.
     * @param fetchOptions - Optional fetch configuration.
     * @returns The section record, or null if unavailable.
     */
    async _loadSectionFile(profile, fileKey, baseUrl, timestamp, fetchOptions) {
        const Loader = ProfileLoader$1;
        const fileName = profile.Files?.[fileKey];
        if (!fileName)
            return null;
        try {
            return ((await Loader.fetchJson(`${baseUrl}/${fileName}?t=${timestamp}`, fetchOptions)) ??
                null);
        }
        catch (err) {
            Log.warn(`[ProfileLoader] Error loading ${String(fileKey)} (${fileName}):`, err);
            return null;
        }
    },
    /**
     * Fetches individual layer configuration files for each layer reference.
     * Supports inline configs generated from template expansion (no HTTP fetch).
     * @param layersSource - Array of layer references with optional `configFile` or `inlineConfig`.
     * @param baseUrl - Base URL for resolving layer config file paths.
     * @param timestamp - Cache-busting timestamp.
     * @param fetchOptions - Optional fetch configuration.
     * @returns Array of layer config results with resolved config objects and layer directories.
     */
    async _loadLayerConfigs(layersSource, baseUrl, timestamp, fetchOptions) {
        const Loader = ProfileLoader$1;
        if (!Array.isArray(layersSource) || layersSource.length === 0)
            return [];
        const promises = layersSource.map(async (layerRef) => {
            // Inline config from template expansion — no HTTP fetch needed
            if (layerRef.inlineConfig) {
                return {
                    id: layerRef.id,
                    config: layerRef.inlineConfig,
                    layerDirectory: `layers/${layerRef.id}`,
                    layerManagerId: layerRef.layerManagerId ?? null,
                };
            }
            if (!layerRef.configFile) {
                return {
                    id: layerRef.id,
                    config: null,
                    layerDirectory: null,
                    layerManagerId: layerRef.layerManagerId ?? null,
                };
            }
            const layerDirectory = layerRef.configFile.replace(/\/[^/]+$/, "");
            try {
                const layerConfig = await Loader.fetchJson(`${baseUrl}/${layerRef.configFile}?t=${timestamp}`, fetchOptions);
                return {
                    id: layerRef.id,
                    config: layerConfig,
                    layerDirectory,
                    layerManagerId: layerRef.layerManagerId ?? null,
                };
            }
            catch (err) {
                Log.error(`[ProfileLoader] Error loading ${layerRef.configFile}:`, err);
                return {
                    id: layerRef.id,
                    config: null,
                    layerDirectory,
                    layerManagerId: layerRef.layerManagerId ?? null,
                };
            }
        });
        return Promise.all(promises);
    },
    /**
     * Loads and hydrates a profile from a pre-built bundle file, replacing the
     * ~19-request cascade with a single HTTP fetch.
     *
     * Called automatically by `loadModularProfile()` when `profile.bundleFile` is set.
     * The bundle must have been generated at build time by `scripts/bundle-profiles.cjs`.
     *
     * @param profile     - The base profile object (already loaded from profile.json).
     * @param baseUrl     - Base URL for resolving the bundle file path.
     * @param profileId   - Identifier used for logging and metadata.
     * @param bundleFile  - Filename of the bundle (e.g. `"profile-bundle.json"`).
     * @param fetchOptions - Optional fetch configuration.
     * @returns The enriched profile record, equivalent to the result of `loadModularProfile()`.
     */
    async _loadBundledProfile(profile, baseUrl, profileId, bundleFile, fetchOptions) {
        if (!ProfileLoader$1)
            throw new Error("GeoLeaf._ConfigLoader not available");
        Log.info(`[ProfileLoader] ${profileId} — loading bundle: ${bundleFile}`);
        try {
            const bundle = (await ProfileLoader$1.fetchJson(`${baseUrl}/${bundleFile}`, fetchOptions));
            const taxonomy = bundle.taxonomy ?? null;
            const themes = bundle.themes ?? null;
            const layersFileData = bundle.layersFile ?? null;
            const layerConfigsMap = bundle.layerConfigs ?? {};
            // Mirror the same spread logic as loadModularProfile (basemaps/ui file contents)
            const mergedProfile = {
                ...profile,
                ...bundle.basemaps,
                ...bundle.ui,
            };
            this._validateProfile(mergedProfile, profileId);
            const layersSource = _extractRawLayers(layersFileData) || mergedProfile.layers || [];
            const expandedLayers = _expandLayerTemplates(layersSource, layersFileData);
            // Resolve configs: bundled map for static layers, inlineConfig for templates
            const layersConfigs = expandedLayers.map((layerRef) => {
                if (layerRef.inlineConfig) {
                    return {
                        id: layerRef.id,
                        config: layerRef.inlineConfig,
                        layerDirectory: `layers/${layerRef.id}`,
                        layerManagerId: layerRef.layerManagerId ?? null,
                    };
                }
                const layerDirectory = layerRef.configFile
                    ? layerRef.configFile.replace(/\/[^/]+$/, "")
                    : `layers/${layerRef.id}`;
                return {
                    id: layerRef.id,
                    config: layerConfigsMap[layerRef.id] ?? null,
                    layerDirectory,
                    layerManagerId: layerRef.layerManagerId ?? null,
                };
            });
            const enrichedProfile = this._buildEnrichedProfile({
                profile: mergedProfile,
                baseUrl,
                profileId,
                taxonomy,
                themes,
                layersSource: expandedLayers,
                layersConfigs,
            });
            Log.info("[ProfileLoader] bundle loaded", {
                profileId,
                hasTaxonomy: !!enrichedProfile.taxonomy,
                hasThemes: !!enrichedProfile.themes,
                layersCount: enrichedProfile.layers?.length ?? 0,
            });
            return enrichedProfile;
        }
        catch (error) {
            Log.error("[ProfileLoader] Error loading bundle, falling back to cascade:", error);
            // Fall back to cascade on bundle load failure
            return this._loadModularProfileCascade(profile, baseUrl, profileId, Date.now(), fetchOptions);
        }
    },
    /**
     * Core cascade implementation of `loadModularProfile` — used as fallback when bundle loading fails.
     * @internal
     */
    async _loadModularProfileCascade(profile, baseUrl, profileId, timestamp, fetchOptions) {
        const [taxonomyData, themesData, layersFileData, basemapsData, uiData] = await Promise.all([
            this._loadTaxonomy(profile, baseUrl, timestamp, fetchOptions),
            this._loadThemes(profile, baseUrl, timestamp, fetchOptions),
            this._loadLayersFile(profile, baseUrl, timestamp, fetchOptions),
            this._loadSectionFile(profile, "basemapsFile", baseUrl, timestamp, fetchOptions),
            this._loadSectionFile(profile, "uiFile", baseUrl, timestamp, fetchOptions),
        ]);
        const mergedProfile = {
            ...profile,
            ...(basemapsData ?? undefined),
            ...(uiData ?? undefined),
        };
        this._validateProfile(mergedProfile, profileId);
        const layersSource = _extractRawLayers(layersFileData) || mergedProfile.layers || [];
        const expandedLayers = _expandLayerTemplates(layersSource, layersFileData);
        const layersConfigs = await this._loadLayerConfigs(expandedLayers, baseUrl, timestamp, fetchOptions);
        return this._buildEnrichedProfile({
            profile: mergedProfile,
            baseUrl,
            profileId,
            taxonomy: taxonomyData,
            themes: themesData,
            layersSource: expandedLayers,
            layersConfigs,
        });
    },
    /**
     * Assembles the final enriched profile from all fetched sub-resources.
     * @param params - Object containing the base profile, taxonomy, themes, layersSource, and layersConfigs.
     * @returns The enriched profile record with resolved layers, taxonomy, themes, and metadata.
     */
    _buildEnrichedProfile(params) {
        const { profile, baseUrl, profileId, taxonomy, themes, layersSource, layersConfigs } = params;
        const enrichedProfile = { ...profile };
        enrichedProfile.basePath = baseUrl;
        enrichedProfile._profileId = profileId;
        if (taxonomy)
            enrichedProfile.taxonomy = taxonomy;
        if (themes)
            enrichedProfile.themes = themes;
        if (layersConfigs?.length > 0) {
            enrichedProfile.layers = layersConfigs.map((layerData) => {
                if (layerData.config) {
                    const normalized = {
                        ...layerData.config,
                        _layerDirectory: layerData.layerDirectory,
                        _profileId: profileId,
                        layerManagerId: layerData.layerManagerId ||
                            layerData.config.layerManagerId ||
                            "geojson-default",
                    };
                    const data = normalized.data;
                    if (data?.file && !normalized.dataFile) {
                        const dataDir = data.directory || "data";
                        normalized.dataFile = `${dataDir}/${data.file}`;
                    }
                    return normalized;
                }
                const original = layersSource.find((l) => l.id === layerData.id);
                return original ?? { id: layerData.id, error: "Failed to load config" };
            });
        }
        return enrichedProfile;
    },
    /**
     * Validates a loaded profile object against minimum structural requirements.
     * Logs warnings for each violation — non-blocking, does not throw.
     *
     * Checks: required `id`, `map.bounds` recommended, `Files` keys are strings,
     * `layers` is an array if present.
     *
     * @param profile - The raw profile object to validate.
     * @param profileId - Identifier used in warning messages.
     */
    _validateProfile(profile, profileId) {
        const warn = (msg) => Log.warn(`[ProfileLoader] Schema warning (${profileId}): ${msg}`);
        if (!profile.id)
            warn('"id" is required in profile.json');
        const map = profile.map;
        if (map && !map.bounds && !map.center) {
            warn('"map.bounds" or "map.center" is recommended');
        }
        const files = profile.Files;
        if (files)
            _validateFiles(files, warn);
        if (profile.layers !== undefined && !Array.isArray(profile.layers)) {
            warn('"layers" must be an array');
        }
        const basemaps = profile.basemaps;
        if (basemaps)
            _validateBasemaps(basemaps, warn);
    },
    /**
     * Determines whether a profile uses the modular format (has `Files` object or version ≥ 1.2).
     * @param profile - The profile object to inspect.
     * @returns `true` if the profile is modular, `false` otherwise.
     */
    isModularProfile(profile) {
        if (!profile || typeof profile !== "object")
            return false;
        const p = profile;
        if (p.Files && typeof p.Files === "object")
            return true;
        if (p.version) {
            const versionMatch = /^(\d+)\.(\d+)/.exec(String(p.version));
            if (versionMatch) {
                const major = Number.parseInt(versionMatch[1], 10);
                const minor = Number.parseInt(versionMatch[2], 10);
                return major > 1 || (major === 1 && minor >= 2);
            }
        }
        return false;
    },
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
function _resolveMappingForNormalization(mappingEnabled, mapping) {
    if (mappingEnabled && mapping && typeof mapping === "object")
        return mapping;
    return null;
}
function _applyTaxonomyCategories(config, profile, activeProfileId) {
    const profileObj = profile;
    const cats = profileObj?.taxonomy?.categories;
    if (!cats || typeof cats !== "object" || Array.isArray(cats))
        return;
    config.categories = cats;
    Log.info("[GeoLeaf.Config.Profile] Category taxonomy loaded from active profile.", {
        profileId: activeProfileId,
        categoriesCount: Object.keys(cats).length,
    });
}
function _ensureProfilesMap(config) {
    if (!config.profiles || typeof config.profiles !== "object" || Array.isArray(config.profiles)) {
        config.profiles = {};
    }
}
function _buildFetchOptions(options) {
    return {
        headers: options.headers ?? {},
        strictContentType: typeof options.strictContentType === "boolean" ? options.strictContentType : true,
    };
}
function _buildLegacyProfilePromise(Loader, baseUrl, timestamp, fetchOptions, isPoiMappingEnabled, self) {
    const profileId = self._activeProfileId;
    const mappingPromise = isPoiMappingEnabled
        ? Loader.fetchJson(`${baseUrl}/mapping.json?t=${timestamp}`, fetchOptions)
        : Promise.resolve(null);
    const routesPromise = Loader.fetchJson(`${baseUrl}/routes.json?t=${timestamp}`, fetchOptions).catch(() => {
        Log.info("[GeoLeaf.Config.Profile] routes.json not available or invalid, using an empty array.");
        return [];
    });
    return Promise.all([
        Loader.fetchJson(`${baseUrl}/profile.json?t=${timestamp}`, fetchOptions),
        Loader.fetchJson(`${baseUrl}/poi.json?t=${timestamp}`, fetchOptions),
        mappingPromise,
        routesPromise,
    ])
        .then(([profile, poi, mapping, routes]) => {
        self._activeProfileId = profileId;
        return self._finalizeProfileLoad({
            profile: profile ?? null,
            poi,
            routes,
            mapping: mapping ?? null,
            mappingEnabled: isPoiMappingEnabled,
        });
    })
        .catch((err) => {
        Log.error("[GeoLeaf.Config.Profile] Error loading active profile resources:", err);
        return self._config;
    });
}
function _resolveProfileStep1(profile, isPoiMappingEnabled, Loader, baseUrl, timestamp, fetchOptions, self) {
    const isModular = ProfileLoader && ProfileLoader.isModularProfile(profile);
    if (isModular) {
        Log.info("[GeoLeaf.Config.Profile] Modular profile detected - modular loading");
        return self._loadModularProfile(profile, baseUrl, timestamp, fetchOptions);
    }
    let requiresMapping = false;
    if (profile && Array.isArray(profile.layers)) {
        requiresMapping = profile.layers.some((layer) => layer.normalized === false);
    }
    const mappingPromise = isPoiMappingEnabled && requiresMapping
        ? Loader.fetchJson(`${baseUrl}/mapping.json?t=${timestamp}`, fetchOptions).catch((err) => {
            Log.error("[GeoLeaf.Config.Profile] mapping.json required (normalized:false) but not found or invalid.", err);
            return null;
        })
        : Promise.resolve(null);
    return Promise.all([Promise.resolve(profile), mappingPromise]);
}
function _resolveProfileStep2(result, profileId, self) {
    if (result && !Array.isArray(result))
        return result;
    const [profile, mapping] = result;
    self._activeProfileId = profileId;
    self._activeProfile = profile ?? null;
    Log.info("[GeoLeaf.Config.Profile] Profile loaded (layers-only)", {
        profileId,
        profileLoaded: !!profile,
        profileKeys: profile ? Object.keys(profile) : [],
    });
    self._activeProfileData = {
        poi: [],
        routes: [],
        mapping: _resolveMappingForNormalization(true, mapping ?? null),
    };
    _applyTaxonomyCategories(self._config, profile, profileId);
    _ensureProfilesMap(self._config);
    const profiles = self._config.profiles;
    profiles[profileId] = {
        profile: self._activeProfile,
        poi: self._activeProfileData.poi,
        routes: self._activeProfileData.routes,
        mapping: self._activeProfileData.mapping,
    };
    self._fireProfileLoadedEvent(profileId, {
        profile: self._activeProfile,
        poi: self._activeProfileData.poi,
        routes: self._activeProfileData.routes,
        mapping: self._activeProfileData.mapping,
    });
    return self._config;
}
function _fetchAndResolveProfile(Loader, baseUrl, timestamp, fetchOptions, isPoiMappingEnabled, self) {
    const profileId = self._config.data?.activeProfile;
    return Loader.fetchJson(`${baseUrl}/profile.json?t=${timestamp}`, fetchOptions)
        .then((profile) => _resolveProfileStep1(profile, isPoiMappingEnabled, Loader, baseUrl, timestamp, fetchOptions, self))
        .then((result) => _resolveProfileStep2(result, profileId, self))
        .catch((err) => {
        Log.error("[GeoLeaf.Config.Profile] Error loading active profile resources:", err);
        return self._config;
    });
}
function _applyModularEnrichedProfile(enrichedProfile, profileId, self) {
    self._activeProfileId = profileId;
    self._activeProfile = enrichedProfile;
    Log.info("[GeoLeaf.Config.Profile] Modular profile loaded successfully", {
        profileId,
        hasTaxonomy: !!enrichedProfile.taxonomy,
        hasThemes: !!enrichedProfile.themes,
        layersCount: enrichedProfile.layers?.length ?? 0,
    });
    self._activeProfileData = { poi: [], routes: [], mapping: null };
    const enriched = enrichedProfile;
    if (enriched.taxonomy?.categories) {
        self._config.categories = enriched.taxonomy.categories;
        Log.info("[GeoLeaf.Config.Profile] Taxonomy loaded from modular profile", {
            categoriesCount: Object.keys(enriched.taxonomy.categories || {}).length,
        });
    }
    Object.keys(enrichedProfile).forEach((key) => {
        if (key !== "layers" && key !== "taxonomy" && key !== "themes")
            self._config[key] = enrichedProfile[key];
    });
    _ensureProfilesMap(self._config);
    const profiles = self._config.profiles;
    profiles[profileId] = { profile: self._activeProfile, poi: [], routes: [], mapping: null };
    self._fireProfileLoadedEvent(profileId, {
        profile: self._activeProfile,
        poi: [],
        routes: [],
        mapping: null,
    });
    return enrichedProfile;
}
function _buildProfileDispatchArgs(dataCfg, options) {
    const useLegacyProfileData = typeof dataCfg.useLegacyProfileData === "boolean" ? dataCfg.useLegacyProfileData : false;
    const profileId = dataCfg.activeProfile;
    const basePath = dataCfg.profilesBasePath ?? "data/profiles";
    const baseUrl = `${basePath}/${profileId}`;
    Log.info("[GeoLeaf.Config.Profile] Starting profile load:", {
        profileId,
        baseUrl,
        configData: dataCfg,
    });
    return { useLegacyProfileData, profileId, baseUrl, fetchOptions: _buildFetchOptions(options) };
}
const ProfileModule = {
    _config: null,
    _activeProfileId: null,
    _activeProfile: null,
    _activeProfileData: {
        poi: [],
        routes: [],
        mapping: null,
    },
    init(config) {
        this._config = config;
    },
    isProfilePoiMappingEnabled() {
        const dataCfg = this._config?.data;
        if (!dataCfg || typeof dataCfg !== "object")
            return true;
        if (typeof dataCfg.enableProfilePoiMapping === "boolean") {
            return dataCfg.enableProfilePoiMapping;
        }
        if (typeof dataCfg.useProfilePoiMapping === "boolean") {
            return dataCfg.useProfilePoiMapping;
        }
        if (typeof dataCfg.useMapping === "boolean") {
            return dataCfg.useMapping;
        }
        return true;
    },
    loadActiveProfileResources(options = {}) {
        const dataCfg = this._config?.data;
        if (!dataCfg || !dataCfg.activeProfile) {
            Log.info("[GeoLeaf.Config.Profile] No active profile defined in config.data.activeProfile; no profile loading performed.");
            return Promise.resolve(this._config);
        }
        const { useLegacyProfileData, profileId, baseUrl, fetchOptions } = _buildProfileDispatchArgs(dataCfg, options);
        const Loader = ProfileLoader$1;
        const Normalization = ConfigNormalizer;
        if (!Loader || !Normalization) {
            Log.error("[GeoLeaf.Config.Profile] Loader or Normalization modules not available.");
            return Promise.reject(new Error("Required modules not available"));
        }
        const isPoiMappingEnabled = this.isProfilePoiMappingEnabled();
        if (!isPoiMappingEnabled)
            Log.info("[GeoLeaf.Config.Profile] POI mapping disabled via global configuration; profile POIs will be considered already normalized.");
        Log.info("[GeoLeaf.Config.Profile] Loading active profile resources:", {
            profileId,
            baseUrl,
        });
        const isDebug = !!this._config?.debug;
        const timestamp = isDebug ? Date.now() : 0;
        if (useLegacyProfileData) {
            this._activeProfileId = profileId;
            return _buildLegacyProfilePromise(Loader, baseUrl, timestamp, fetchOptions, isPoiMappingEnabled, this);
        }
        return _fetchAndResolveProfile(Loader, baseUrl, timestamp, fetchOptions, isPoiMappingEnabled, this);
    },
    _loadModularProfile(profile, baseUrl, timestamp, fetchOptions) {
        const profileId = this._config.data?.activeProfile;
        if (!ProfileLoader) {
            Log.error("[GeoLeaf.Config.Profile] ProfileLoader not available");
            return Promise.reject(new Error("ProfileLoader non disponible"));
        }
        return ProfileLoader.loadModularProfile(profile, baseUrl, profileId, timestamp, fetchOptions).then((enrichedProfile) => _applyModularEnrichedProfile(enrichedProfile, profileId, this));
    },
    _finalizeProfileLoad(params) {
        const Normalization = ConfigNormalizer;
        const { profile, poi, routes, mapping, mappingEnabled } = params;
        this._activeProfile = profile ?? null;
        Log.info("[GeoLeaf.Config.Profile] Profile loaded from profile.json:", {
            profileId: this._activeProfileId,
            profileLoaded: profile != null,
            profileKeys: profile ? Object.keys(profile) : [],
        });
        const mappingForNormalization = _resolveMappingForNormalization(mappingEnabled, mapping);
        const structurallyNormalizedPoi = Array.isArray(poi)
            ? Normalization.normalizePoiWithMapping(poi, mappingForNormalization)
            : [];
        const normalizedPoi = Normalization.normalizePoiArray(structurallyNormalizedPoi);
        const safeRoutes = Array.isArray(routes) ? routes : [];
        this._activeProfileData = {
            poi: normalizedPoi,
            mapping: mappingForNormalization,
            routes: safeRoutes,
        };
        if (normalizedPoi.length) {
            this._config.poi = normalizedPoi;
        }
        if (safeRoutes.length) {
            this._config.routes = safeRoutes;
        }
        _applyTaxonomyCategories(this._config, profile, this._activeProfileId);
        _ensureProfilesMap(this._config);
        const profiles = this._config.profiles;
        profiles[this._activeProfileId] = {
            profile: this._activeProfile,
            poi: this._activeProfileData.poi,
            routes: this._activeProfileData.routes,
            mapping: this._activeProfileData.mapping,
        };
        this._fireProfileLoadedEvent(this._activeProfileId, {
            profile: this._activeProfile,
            poi: this._activeProfileData.poi,
            routes: this._activeProfileData.routes,
            mapping: this._activeProfileData.mapping,
        });
        return this._config;
    },
    getActiveProfileId() {
        return this._activeProfileId;
    },
    getActiveProfile() {
        return this._activeProfile;
    },
    getActiveProfilePoi() {
        return this._activeProfileData?.poi && Array.isArray(this._activeProfileData.poi)
            ? this._activeProfileData.poi
            : [];
    },
    getActiveProfileRoutes() {
        return this._activeProfileData?.routes && Array.isArray(this._activeProfileData.routes)
            ? this._activeProfileData.routes
            : [];
    },
    getActiveProfileMapping() {
        return this._activeProfileData?.mapping ?? null;
    },
    getIconsConfig() {
        const p = this._activeProfile;
        return p?.taxonomy?.icons ?? null;
    },
    getActiveProfileLayersConfig() {
        const p = this._activeProfile;
        return p?.layers ?? null;
    },
    _fireProfileLoadedEvent(profileId, payload) {
        if (typeof document === "undefined" || typeof document.dispatchEvent !== "function")
            return;
        try {
            const event = new CustomEvent("geoleaf:profile:loaded", {
                detail: { profileId, data: payload },
            });
            document.dispatchEvent(event);
        }
        catch {
            try {
                const legacyEvent = document.createEvent("CustomEvent");
                legacyEvent.initCustomEvent("geoleaf:profile:loaded", false, false, {
                    profileId,
                    data: payload,
                });
                document.dispatchEvent(legacyEvent);
            }
            catch {
                Log.warn("[GeoLeaf.Config.Profile] Unable to dispatch geoleaf:profile:loaded event.");
            }
        }
    },
};
const ProfileManager = ProfileModule;

/*!
 * GeoLeaf Core – Config / Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
function _applyProfileId(cfg, profileId, configObj) {
    if (typeof profileId === "string" && profileId.length > 0) {
        if (!cfg.data)
            cfg.data = {};
        cfg.data.activeProfile = profileId;
        if (configObj && configObj.data)
            configObj.data.activeProfile = profileId;
        Log.info("[GeoLeaf.Config] Active profile changed to:", profileId);
    }
}
function _resolveDebugFlag(cfg, mergedConfig) {
    if (cfg && typeof cfg.debug !== "undefined") {
        return !!cfg.debug;
    }
    if (mergedConfig && typeof mergedConfig.debug !== "undefined") {
        return !!mergedConfig.debug;
    }
    return false;
}
function _resolveLogLevel(cfg, mergedConfig) {
    const loggingCfg = (cfg && typeof cfg === "object" && cfg.logging
        ? cfg.logging
        : mergedConfig?.logging) ?? null;
    const level = loggingCfg?.level;
    const debugFlag = _resolveDebugFlag(cfg, mergedConfig);
    return level || (debugFlag ? "debug" : "info");
}
function _applyLoggingConfig(cfg, mergedConfig) {
    const level = _resolveLogLevel(cfg, mergedConfig);
    if (Log?.setLevel) {
        Log.setLevel(level);
        Log.info("[GeoLeaf.Config] Log level applied from configuration:", level);
    }
}
function _resolveLoadOptions(options) {
    return {
        headers: options.headers,
        strictContentType: typeof options.strictContentType === "boolean" ? options.strictContentType : true,
    };
}
function _resolveMappingOptions(options, loadOptions) {
    return {
        headers: options.mappingHeaders || options.headers,
        strictContentType: typeof options.mappingStrictContentType === "boolean"
            ? options.mappingStrictContentType
            : loadOptions.strictContentType,
    };
}
function _callOnLoaded(options, cfg, context) {
    if (typeof options.onLoaded === "function") {
        try {
            options.onLoaded(cfg);
        }
        catch (e) {
            Log.error(`[GeoLeaf.Config] Error in onLoaded (${context}):`, e);
        }
    }
}
function _initFromUrl(options, self) {
    const loadOptions = _resolveLoadOptions(options);
    const mappingUrl = typeof options.mappingUrl === "string" && options.mappingUrl.length > 0
        ? options.mappingUrl
        : null;
    const mappingOptions = _resolveMappingOptions(options, loadOptions);
    const selfTyped = self;
    return selfTyped
        .loadUrl(options.url, loadOptions)
        .then((cfg) => {
        _applyProfileId(cfg, options.profileId, self._config);
        return cfg;
    })
        .then((cfg) => {
        if (!mappingUrl)
            return cfg;
        return selfTyped
            .loadTaxonomy(mappingUrl, mappingOptions)
            .then(() => cfg)
            .catch((err) => {
            Log.warn("[GeoLeaf.Config] Failed to load category mapping from " +
                mappingUrl +
                " (GeoLeaf will continue without dedicated mapping):", err);
            return cfg;
        });
    })
        .then((cfg) => {
        _callOnLoaded(options, cfg, "url+mapping");
        return cfg;
    })
        .catch((err) => {
        Log.error("[GeoLeaf.Config] Error in init() with url:", err);
        if (typeof options.onError === "function") {
            try {
                options.onError(err);
            }
            catch (e) {
                Log.error("[GeoLeaf.Config] Error in onError:", e);
            }
        }
        throw err;
    });
}
const Config = {
    _config: {},
    _isLoaded: false,
    _subModulesInitialized: false,
    _source: null,
    _options: { autoEvent: true },
    init(options = {}) {
        this._options = {
            ...this._options,
            autoEvent: typeof options.autoEvent === "boolean"
                ? options.autoEvent
                : this._options.autoEvent,
        };
        if (options.config && typeof options.config === "object") {
            this._applyConfig(options.config, "inline");
            _applyProfileId(this._config, options.profileId);
            this._maybeFireLoadedEvent();
            _callOnLoaded(options, this._config, "inline");
            return Promise.resolve(this._config);
        }
        if (typeof options.url === "string" && options.url.length > 0) {
            return _initFromUrl(options, this);
        }
        this._applyConfig({}, "inline");
        _applyProfileId(this._config, options.profileId);
        this._maybeFireLoadedEvent();
        _callOnLoaded(options, this._config, "vide");
        return Promise.resolve(this._config);
    },
    _initSubModules() {
        if (this._subModulesInitialized)
            return;
        this._subModulesInitialized = true;
        const Storage = StorageHelper;
        const Taxonomy = TaxonomyManager;
        const Profile = ProfileManager;
        if (Storage?.init)
            Storage.init(this._config);
        if (Taxonomy?.init)
            Taxonomy.init(this._config);
        if (Profile?.init)
            Profile.init(this._config);
    },
    _applyConfig(cfg, source) {
        if (typeof cfg !== "object" || cfg === null) {
            cfg = {};
        }
        this._validateConfig?.(cfg);
        const Storage = StorageHelper;
        if (Storage?.deepMerge) {
            this._config = Storage.deepMerge(this._config, cfg);
        }
        else {
            this._config = Object.assign({}, this._config, cfg);
        }
        const Normalization = ConfigNormalizer;
        if (Array.isArray(this._config.poi) && Normalization) {
            this._config.poi = Normalization.normalizePoiArray(this._config.poi);
        }
        this._isLoaded = true;
        this._source = source || "inline";
        this._subModulesInitialized = false;
        this._initSubModules();
        try {
            _applyLoggingConfig(cfg, this._config);
        }
        catch (e) {
            Log.warn("[GeoLeaf.Config] Unable to apply log level from configuration:", e);
        }
    },
    isLoaded() {
        return this._isLoaded;
    },
    getSource() {
        return this._source;
    },
    _maybeFireLoadedEvent() {
        if (!this._options.autoEvent)
            return;
        if (typeof document === "undefined" || typeof document.dispatchEvent !== "function")
            return;
        try {
            const event = new CustomEvent("geoleaf:config:loaded", {
                detail: { config: this._config, source: this._source },
            });
            document.dispatchEvent(event);
        }
        catch {
            try {
                const legacyEvent = document.createEvent("CustomEvent");
                legacyEvent.initCustomEvent("geoleaf:config:loaded", false, false, {
                    config: this._config,
                    source: this._source,
                });
                document.dispatchEvent(legacyEvent);
            }
            catch {
                Log.warn("[GeoLeaf.Config] Unable to dispatch geoleaf:config:loaded event.");
            }
        }
    },
};

/*!
 * GeoLeaf Core – Core / Map Factory
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
// ES2022 target + Node ≥ 18: globalThis is always defined.
const _g$3 = globalThis;
/**
 * Validates and resolves the DOM container element for the map.
 *
 * @param mapId - DOM element id or selector string.
 * @returns The resolved HTMLElement.
 * @throws Error if mapId is missing or no element is found.
 */
function resolveMapContainer(mapId) {
    if (!mapId)
        throw new Error("The required 'mapId' option is missing.");
    const el = document.getElementById(mapId);
    if (!el)
        throw new Error(`No DOM element found for mapId='${mapId}'.`);
    return el;
}
/**
 * Returns a new GeoLeafBounds expanded by the given ratio on all sides.
 *
 * Replaces the legacy `latLngBounds().pad()` call.
 * Used to compute `maxBounds` for the `positionFixed` feature.
 *
 * @param b - Original bounds.
 * @param ratio - Expansion ratio (e.g. 0.3 = 30% added to each side).
 * @returns Expanded bounds as a plain GeoLeafBounds object.
 */
function padBounds(b, ratio) {
    const latSpan = (b.north - b.south) * ratio;
    const lngSpan = (b.east - b.west) * ratio;
    return {
        north: Math.min(b.north + latSpan, 85.051129),
        south: Math.max(b.south - latSpan, -85.051129),
        east: Math.min(b.east + lngSpan, 180),
        west: Math.max(b.west - lngSpan, -180),
    };
}
/**
 * Applies the current UI theme via GeoLeaf.UI if available.
 * Silently no-ops if the UI module has not been loaded yet.
 *
 * @param theme - Theme identifier (e.g. "light", "dark").
 */
function applyThemeSafe(theme) {
    try {
        if (_g$3.GeoLeaf?.UI && typeof _g$3.GeoLeaf.UI.applyTheme === "function") {
            _g$3.GeoLeaf.UI.applyTheme(theme);
        }
    }
    catch (err) {
        Log.warn("[GeoLeaf.Core] Error applying theme:", err);
    }
}
/**
 * Initialises the Legend module if enabled in the UI config.
 *
 * @param mapInstance - The active map adapter instance (IMapAdapter).
 */
function initLegendSafe(mapInstance) {
    const uiConfig = _g$3.GeoLeaf?.Config?.get ? _g$3.GeoLeaf.Config.get("ui") : null;
    const showLegend = uiConfig ? uiConfig.showLegend !== false : true;
    if (showLegend && typeof _g$3.GeoLeaf?.Legend?.init === "function") {
        try {
            _g$3.GeoLeaf.Legend.init(mapInstance, {
                position: "bottomleft",
                collapsible: true,
                collapsed: false,
            });
        }
        catch (err) {
            Log.warn("[GeoLeaf.Core] Error initializing legend:", err);
        }
    }
}

/*!
 * GeoLeaf Core – Core / Theme
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
let _theme = "light";
/**
 * Applies ae class de theme sur document.body.
 * @param {string} theme - "light" | "dark"
 */
function _applyThemeToBody(theme) {
    const body = document.body;
    if (!body) {
        Log.warn("[GeoLeaf.Core] document.body not found");
        return;
    }
    body.classList.remove("gl-theme-light", "gl-theme-dark");
    body.classList.add(theme === "dark" ? "gl-theme-dark" : "gl-theme-light");
}
/**
 * Sets et applique the theme active.
 * @param {string} theme - "light" | "dark"
 */
function setTheme(theme) {
    if (!theme || (theme !== "light" && theme !== "dark")) {
        Log.warn("[GeoLeaf.Core] setTheme()→", theme);
        return;
    }
    _theme = theme;
    _applyThemeToBody(theme);
}
/**
 * Returns the theme active.
 * @returns {string}
 */
function getTheme() {
    return _theme;
}

/*!
 * GeoLeaf Core – Events / EventBus
 * © 2026 Mattieu Pottier — MIT License
 */
/**
 * @module events/event-bus
 *
 * Central dispatch helper for GeoLeaf custom DOM events.
 * All events are dispatched on `document` using native CustomEvent (no external lib).
 *
 * Security notes:
 * - Payloads contain primitives only (string, number, boolean). No DOM refs or Leaflet objects.
 * - `plugin:failed` error is truncated to 200 chars to prevent stack trace leakage.
 * - Guard for SSR environments where `document` is undefined.
 */
// ── Sanitization helper ──────────────────────────────────────────────────────
/**
 * Returns a safe copy of `payload` by stripping properties that are not
 * JSON-serializable (functions, DOM nodes, circular references).
 * Prevents `CustomEvent` from receiving unserializable data that may crash
 * structured-clone in some environments.
 *
 * @param payload - Raw payload object.
 * @returns Sanitized plain-object copy (may be the original if already safe).
 * @internal
 */
function _sanitizePayload(payload) {
    if (payload === null || payload === undefined)
        return payload;
    if (typeof payload !== "object")
        return payload;
    try {
        return JSON.parse(JSON.stringify(payload));
    }
    catch (_e) {
        // Fallback: shallow copy, dropping non-serializable values
        const safe = {};
        for (const key of Object.keys(payload)) {
            const value = payload[key];
            if (value !== null && (typeof value === "function" || value instanceof Node))
                continue;
            try {
                JSON.stringify(value);
                safe[key] = value;
            }
            catch (_inner) {
                // skip non-serializable property
            }
        }
        return safe;
    }
}
// ── Dispatch helper ──────────────────────────────────────────────────────────
/**
 * Dispatches a typed GeoLeaf custom event on `document`.
 * Silent in SSR environments where `document` is not available.
 *
 * @param name - Event name (must be a key of `GeoLeafEventMap`).
 * @param detail - Typed payload for the event.
 */
function dispatchGeoLeafEvent(name, detail) {
    if (typeof document === "undefined")
        return;
    try {
        const safeDetail = _sanitizePayload(detail);
        document.dispatchEvent(new CustomEvent(name, {
            detail: safeDetail,
            bubbles: false,
        }));
    }
    catch (err) {
        Log?.warn(`[GeoLeaf.Events] Failed to dispatch "${name}":`, err);
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * MapLibre Layer Registry
 *
 * Internal registry that tracks the mapping between GeoLeaf layer IDs
 * and the MapLibre source + sub-layer IDs created for each layer.
 * Manages layer ordering by z-index using MapLibre's layer stack.
 *
 * **Naming convention:**
 * - Source:  `gl-src-{layerId}`
 * - Layers:  `gl-{layerId}-fill`, `gl-{layerId}-line`,
 *            `gl-{layerId}-circle`, `gl-{layerId}-symbol`,
 *            `gl-{layerId}-casing`
 *
 * **Ordering:**
 * Layers are rendered in insertion order (bottom to top). A sentinel
 * layer `gl-sentinel-poi` marks the boundary between GeoJSON layers
 * and POI layers. GeoJSON layers are inserted before this sentinel,
 * ordered by ascending `zIndex`.
 *
 * @module adapters/maplibre/maplibre-layer-registry
 */
// ─── Constants ───────────────────────────────────────────────────────────────
/** Source ID prefix for GeoLeaf GeoJSON sources. */
const SOURCE_PREFIX = "gl-src-";
/** Layer ID prefix for GeoLeaf MapLibre sub-layers. */
const LAYER_PREFIX = "gl-";
/** Sentinel layer inserted after all GeoJSON layers / before POI layers. */
const SENTINEL_POI = "gl-sentinel-poi";
// ─── Helper functions ────────────────────────────────────────────────────────
/** Builds the MapLibre source ID for a GeoLeaf layer. */
function toSourceId(layerId) {
    return SOURCE_PREFIX + layerId;
}
/** Builds a MapLibre sub-layer ID. */
function toSubLayerId(layerId, type) {
    return LAYER_PREFIX + layerId + "-" + type;
}
// ─── MaplibreLayerRegistry ───────────────────────────────────────────────────
/**
 * Internal registry for MapLibre layers managed by the adapter.
 *
 * One instance per adapter. All mutations are through explicit methods —
 * callers never modify entries directly.
 */
class MaplibreLayerRegistry {
    /** Registry map: GeoLeaf layerId → entry. */
    _entries = new Map();
    // ── Query ────────────────────────────────────────────────────────────────
    /** Returns `true` if the layer is registered. */
    has(layerId) {
        return this._entries.has(layerId);
    }
    /** Returns the entry for a layer, or `undefined`. */
    get(layerId) {
        return this._entries.get(layerId);
    }
    /** Returns the sub-layer IDs for a registered layer. */
    getSubLayerIds(layerId) {
        return this._entries.get(layerId)?.subLayerIds ?? [];
    }
    /** Returns the source ID for a registered layer. */
    getSourceId(layerId) {
        return this._entries.get(layerId)?.sourceId ?? toSourceId(layerId);
    }
    /** Returns all registered layer IDs. */
    getAllLayerIds() {
        return Array.from(this._entries.keys());
    }
    /** Returns the number of registered layers. */
    get size() {
        return this._entries.size;
    }
    // ── Registration ─────────────────────────────────────────────────────────
    /**
     * Registers a new GeoLeaf layer with its MapLibre sub-layers.
     *
     * @param layerId - GeoLeaf layer identifier.
     * @param subLayerTypes - Which sub-layer types were created.
     * @param zIndex - Layer z-index for ordering (0–99).
     * @param options - Additional options (vector tile, source-layer, custom IDs).
     */
    register(layerId, subLayerTypes, zIndex, options) {
        const entry = {
            sourceId: options?.customSourceId ?? toSourceId(layerId),
            subLayerIds: options?.customSubLayerIds ?? subLayerTypes.map((t) => toSubLayerId(layerId, t)),
            zIndex,
            visible: true,
            subLayerTypes: new Set(subLayerTypes),
            isVectorTile: options?.isVectorTile ?? false,
            sourceLayer: options?.sourceLayer,
        };
        this._entries.set(layerId, entry);
        return entry;
    }
    /** Unregisters a layer. Returns `true` if it existed. */
    unregister(layerId) {
        return this._entries.delete(layerId);
    }
    // ── Visibility ───────────────────────────────────────────────────────────
    /** Marks a layer as visible or hidden in the registry. */
    setVisible(layerId, visible) {
        const entry = this._entries.get(layerId);
        if (entry)
            entry.visible = visible;
    }
    // ── Ordering ─────────────────────────────────────────────────────────────
    /**
     * Computes the `beforeId` for inserting a new layer at the given z-index.
     *
     * Finds the first existing sub-layer with a **higher** z-index and returns
     * its ID. If none exists, returns the sentinel layer ID so the new layer
     * is inserted just below the POI boundary.
     *
     * @param zIndex - The z-index of the layer being inserted.
     * @returns The MapLibre layer ID to pass as `beforeId` to `map.addLayer()`.
     */
    getInsertBeforeId(zIndex) {
        let bestId = null;
        let bestZ = Infinity;
        for (const entry of this._entries.values()) {
            if (entry.zIndex > zIndex && entry.zIndex < bestZ && entry.subLayerIds.length > 0) {
                bestZ = entry.zIndex;
                bestId = entry.subLayerIds[0];
            }
        }
        return bestId ?? SENTINEL_POI;
    }
    /**
     * Updates the z-index of a registered layer.
     * Returns the new `beforeId` for reinsertion, or `null` if the layer
     * is not registered.
     */
    updateZIndex(layerId, newZIndex) {
        const entry = this._entries.get(layerId);
        if (!entry)
            return null;
        entry.zIndex = newZIndex;
        return this.getInsertBeforeId(newZIndex);
    }
    /**
     * Returns all entries sorted by z-index (ascending = bottom to top).
     * Useful for rebuilding the full layer order.
     */
    sortedEntries() {
        return Array.from(this._entries.entries()).sort(([, a], [, b]) => a.zIndex - b.zIndex);
    }
    // ── Cleanup ──────────────────────────────────────────────────────────────
    /** Removes all entries. */
    clear() {
        this._entries.clear();
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * MapLibre Hatch Pattern Generator
 *
 * Generates Canvas-based hatch pattern images for use with MapLibre's
 * `fill-pattern` paint property. Replaces the SVG-based approach used
 * (Canvas API avoids DOM injection and MutationObservers).
 *
 * Supported hatch types: `diagonal`, `dot`, `cross`, `x`, `horizontal`, `vertical`.
 *
 * Usage:
 * 1. Call `generateHatchImage()` to get an `ImageData` object.
 * 2. Register it with MapLibre: `map.addImage(patternId, imageData, { pixelRatio })`.
 * 3. Set the fill layer paint: `{ "fill-pattern": patternId }`.
 *
 * @module adapters/maplibre/maplibre-hatch-patterns
 */
// ─── Pattern generation ──────────────────────────────────────────────────────
/** Default pixel ratio for retina displays. */
const DEFAULT_PIXEL_RATIO = 2;
/**
 * Generates a hatch pattern as an `ImageData` object for MapLibre.
 *
 * @param hatchConfig - Hatch configuration from the GeoLeaf style.
 * @param pixelRatio - Device pixel ratio for sharp rendering. @default 2
 * @returns `{ imageData, width, height, pixelRatio }` ready for `map.addImage()`.
 */
function generateHatchImage(hatchConfig, pixelRatio = DEFAULT_PIXEL_RATIO) {
    const type = hatchConfig.type ?? "diagonal";
    const spacing = (hatchConfig.spacingPx ?? 10) * pixelRatio;
    const color = hatchConfig.stroke?.color ?? "#000000";
    const strokeWidth = (hatchConfig.stroke?.widthPx ?? 1) * pixelRatio;
    const strokeOpacity = hatchConfig.stroke?.opacity ?? 1;
    const size = Math.max(4, Math.ceil(spacing));
    const canvas = _createCanvas(size, size);
    const ctx = canvas.getContext("2d");
    // Clear to transparent
    ctx.clearRect(0, 0, size, size);
    // Set drawing style
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.globalAlpha = strokeOpacity;
    ctx.fillStyle = color;
    ctx.lineCap = "square";
    switch (type) {
        case "diagonal":
            _drawDiagonal(ctx, size, hatchConfig.angleDeg);
            break;
        case "dot":
            _drawDot(ctx, size, spacing, pixelRatio);
            break;
        case "cross":
            _drawCross(ctx, size);
            break;
        case "x":
            _drawX(ctx, size);
            break;
        case "horizontal":
            _drawHorizontal(ctx, size);
            break;
        case "vertical":
            _drawVertical(ctx, size);
            break;
    }
    const imageData = ctx.getImageData(0, 0, size, size);
    return { imageData, width: size, height: size, pixelRatio };
}
/**
 * Builds a unique pattern ID for a hatch configuration.
 * Deterministic — same config always produces the same ID.
 */
function buildHatchPatternId(layerId, hatchConfig) {
    const type = hatchConfig.type ?? "diagonal";
    const angle = hatchConfig.angleDeg ?? 0;
    const spacing = hatchConfig.spacingPx ?? 10;
    const color = (hatchConfig.stroke?.color ?? "#000000").replace("#", "");
    const sw = hatchConfig.stroke?.widthPx ?? 1;
    const op = hatchConfig.stroke?.opacity ?? 1;
    return `gl-hatch-${layerId}-${type}-${angle}-${spacing}-${color}-${sw}-${op}`;
}
/**
 * Registers a hatch pattern image on a MapLibre map instance.
 *
 * @param map - Native `maplibregl.Map` instance.
 * @param patternId - Unique pattern ID (from `buildHatchPatternId`).
 * @param hatchConfig - Hatch configuration.
 * @param pixelRatio - Device pixel ratio. @default 2
 * @returns The pattern ID (for use in `fill-pattern`).
 */
function registerHatchPattern(map, patternId, hatchConfig, pixelRatio = DEFAULT_PIXEL_RATIO) {
    // Skip if already registered
    if (map.hasImage(patternId))
        return patternId;
    const { imageData, width, height, pixelRatio: pr, } = generateHatchImage(hatchConfig, pixelRatio);
    map.addImage(patternId, { data: imageData.data, width, height }, { pixelRatio: pr });
    return patternId;
}
// ─── Canvas helpers ──────────────────────────────────────────────────────────
/** Creates an offscreen canvas (OffscreenCanvas where available, fallback to DOM). */
function _createCanvas(width, height) {
    if (typeof OffscreenCanvas !== "undefined") {
        return new OffscreenCanvas(width, height);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
/** Diagonal lines from bottom-left to top-right. */
function _drawDiagonal(ctx, size, angleDeg) {
    const angle = angleDeg ?? 45;
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);
    // Draw lines that cover the rotated tile with margin
    const extent = size * 2;
    for (let i = -extent; i < extent; i += size) {
        ctx.beginPath();
        ctx.moveTo(i, -extent);
        ctx.lineTo(i, extent);
        ctx.stroke();
    }
    ctx.restore();
}
/** Dot pattern (filled circles at center of each tile). */
function _drawDot(ctx, size, spacing, pixelRatio) {
    const radius = Math.max(0.5 * pixelRatio, spacing * 0.07);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    ctx.fill();
}
/** Cross pattern: horizontal + vertical lines through center. */
function _drawCross(ctx, size) {
    const half = size / 2;
    ctx.beginPath();
    ctx.moveTo(0, half);
    ctx.lineTo(size, half);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(half, 0);
    ctx.lineTo(half, size);
    ctx.stroke();
}
/** X pattern: two diagonal lines corner-to-corner. */
function _drawX(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.stroke();
}
/** Single horizontal line through center. */
function _drawHorizontal(ctx, size) {
    const half = size / 2;
    ctx.beginPath();
    ctx.moveTo(0, half);
    ctx.lineTo(size, half);
    ctx.stroke();
}
/** Single vertical line through center. */
function _drawVertical(ctx, size) {
    const half = size / 2;
    ctx.beginPath();
    ctx.moveTo(half, 0);
    ctx.lineTo(half, size);
    ctx.stroke();
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * MapLibre Style Converter
 *
 * Converts GeoLeaf style format (flat) to MapLibre GL paint/layout properties.
 * Pure module — no engine dependency, no side effects, fully testable in isolation.
 *
 * **Style input formats supported:**
 * 1. Flat: `{ fillColor, fillOpacity, color, weight, ... }`
 * 2. Native pass-through: `{ expressionPaint: { "fill-color": [...expression] } }`
 *
 * The legacy nested format `{ fill: { color }, stroke: { color, widthPx } }` is
 * no longer supported. Use the flat format instead.
 * `expressionPaint` bypasses GeoLeaf conversion and is injected as-is into the
 * MapLibre paint object, enabling zoom interpolations, match expressions, etc.
 *
 * @module adapters/maplibre/maplibre-style-converter
 */
// ─── Security helpers ────────────────────────────────────────────────────────
/**
 * Keys that must never be copied between objects to prevent prototype pollution.
 * JSON.parse can produce objects where `__proto__` is an own property; passing
 * such objects through Object.assign would invoke the `__proto__` setter and
 * silently mutate the target's prototype chain.
 */
const _UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);
/**
 * Safe shallow copy: copies own enumerable keys from `source` to `target`,
 * skipping any key in `_UNSAFE_KEYS`.
 */
function _safeCopy(target, source) {
    for (const key of Object.keys(source)) {
        if (!_UNSAFE_KEYS.has(key)) {
            target[key] = source[key];
        }
    }
}
/**
 * Merges `expressionPaint` into a MapLibre paint object, accepting only keys
 * that look like valid MapLibre paint/layout property names (kebab-case,
 * letter-only segments). Silently ignores invalid or dangerous keys.
 *
 * Valid examples: `"fill-color"`, `"line-width"`, `"circle-radius"`, `"text-size"`.
 */
function _mergeExpressionPaint(paint, expressionPaint) {
    for (const key of Object.keys(expressionPaint)) {
        // Reject prototype-polluting keys and anything that doesn't look like a
        // MapLibre property (must be kebab-case, e.g. "fill-color", "line-width").
        // eslint-disable-next-line security/detect-unsafe-regex
        if (_UNSAFE_KEYS.has(key) || !/^[a-z][a-z0-9]*(?:-[a-z][a-z0-9]*)+$/.test(key)) {
            continue;
        }
        paint[key] = expressionPaint[key];
    }
}
// ─── Normalization ────────────────────────────────────────────────────────────
/**
 * Returns a shallow copy of a flat GeoLeaf style, normalizing the legacy
 * `sizePx` alias to `radius`. All other properties are copied as-is.
 *
 * The nested `fill`/`stroke` format is no longer supported — profile style
 * files should use flat keys (`fillColor`, `fillOpacity`, `color`, `weight`…).
 *
 * Safe against prototype-pollution attacks: keys `__proto__`, `constructor`
 * and `prototype` are never copied.
 */
function normalizeToFlat(style) {
    if (!style || typeof style !== "object")
        return {};
    const flat = {};
    _safeCopy(flat, style);
    // Legacy alias: sizePx → radius (profiles migrated in v2.0.x)
    if (typeof style.sizePx === "number" && style.radius === undefined) {
        flat.radius = style.sizePx;
    }
    return flat;
}
// ─── Paint converters ────────────────────────────────────────────────────────
/**
 * Parses a CSS dash-array string (`"5, 10"`) into a number array (`[5, 10]`).
 * Returns `undefined` for invalid or empty input.
 */
function parseDashArray(dashArray) {
    if (!dashArray || typeof dashArray !== "string")
        return undefined;
    const parts = dashArray
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n) && n >= 0);
    return parts.length > 0 ? parts : undefined;
}
/** Converts a flat GeoLeaf style to MapLibre fill paint properties. */
function toFillPaint(style, layerId) {
    const paint = {};
    if (style.fillColor)
        paint["fill-color"] = style.fillColor;
    if (typeof style.fillOpacity === "number")
        paint["fill-opacity"] = style.fillOpacity;
    if (style.color)
        paint["fill-outline-color"] = style.color;
    const hatch = style.hatch;
    if (hatch?.enabled && layerId) {
        paint["fill-pattern"] = buildHatchPatternId(layerId, hatch);
        if (hatch.renderMode === "pattern_only") {
            paint["fill-color"] = "transparent";
            paint["fill-opacity"] = 1;
        }
    }
    // Native MapLibre expression overrides (last-wins, keys validated)
    if (style.expressionPaint)
        _mergeExpressionPaint(paint, style.expressionPaint);
    return paint;
}
/** Converts a flat GeoLeaf style to MapLibre line paint properties. */
function toLinePaint(style) {
    const paint = {};
    if (style.color)
        paint["line-color"] = style.color;
    if (typeof style.weight === "number")
        paint["line-width"] = style.weight;
    if (typeof style.opacity === "number")
        paint["line-opacity"] = style.opacity;
    const dash = parseDashArray(style.dashArray);
    if (dash)
        paint["line-dasharray"] = dash;
    if (style.lineCap)
        paint["line-cap"] = style.lineCap;
    if (style.lineJoin)
        paint["line-join"] = style.lineJoin;
    // Native MapLibre expression overrides (last-wins, keys validated)
    if (style.expressionPaint)
        _mergeExpressionPaint(paint, style.expressionPaint);
    return paint;
}
/** Converts a flat GeoLeaf style to MapLibre circle paint properties. */
function toCirclePaint(style) {
    const paint = {};
    if (style.fillColor)
        paint["circle-color"] = style.fillColor;
    if (typeof style.fillOpacity === "number")
        paint["circle-opacity"] = style.fillOpacity;
    if (typeof style.radius === "number")
        paint["circle-radius"] = style.radius;
    if (style.color)
        paint["circle-stroke-color"] = style.color;
    if (typeof style.weight === "number")
        paint["circle-stroke-width"] = style.weight;
    // Native MapLibre expression overrides (last-wins, keys validated)
    if (style.expressionPaint)
        _mergeExpressionPaint(paint, style.expressionPaint);
    return paint;
}
/** Resolves extrusion height/base: string → `["coalesce", ["get", field], fallback]` expression; number → direct value. */
function _resolveExtrusionValue(value, fallback) {
    if (typeof value === "string")
        return ["coalesce", ["get", value], fallback];
    if (typeof value === "number")
        return value;
    return fallback;
}
/** Converts a flat GeoLeaf style to MapLibre fill-extrusion paint properties. */
function toFillExtrusionPaint(style) {
    const paint = {};
    if (style.fillExtrusionColor)
        paint["fill-extrusion-color"] = style.fillExtrusionColor;
    paint["fill-extrusion-opacity"] =
        typeof style.fillExtrusionOpacity === "number" ? style.fillExtrusionOpacity : 1.0;
    paint["fill-extrusion-height"] = _resolveExtrusionValue(style.fillExtrusionHeight, 0);
    paint["fill-extrusion-base"] = _resolveExtrusionValue(style.fillExtrusionBase, 0);
    // Native MapLibre expression overrides (last-wins, keys validated)
    if (style.expressionPaint)
        _mergeExpressionPaint(paint, style.expressionPaint);
    return paint;
}
/**
 * Converts a flat GeoLeaf style to MapLibre paint for a casing line layer.
 * Casing = thicker line rendered behind the main line for outline effect.
 */
function toCasingPaint(casing, mainWeight) {
    const paint = {};
    paint["line-color"] = casing.color || "#000000";
    // Casing = main stroke + configurable border on each side
    paint["line-width"] = mainWeight + (casing.widthPx ?? 1) * 2;
    if (typeof casing.opacity === "number")
        paint["line-opacity"] = casing.opacity;
    const dash = parseDashArray(casing.dashArray);
    if (dash)
        paint["line-dasharray"] = dash;
    if (casing.lineCap)
        paint["line-cap"] = casing.lineCap;
    if (casing.lineJoin)
        paint["line-join"] = casing.lineJoin;
    return paint;
}
// ─── Hatch pattern collection ────────────────────────────────────────────────
/**
 * Collects unique hatch patterns from a default style and optional styleRules.
 * Returns `{ patternId, hatchConfig }` pairs to register on the map.
 */
function collectHatchPatterns(defaultStyle, styleRules, layerId) {
    const patterns = new Map();
    const defaultHatch = defaultStyle.hatch;
    if (defaultHatch?.enabled) {
        patterns.set(buildHatchPatternId(layerId, defaultHatch), defaultHatch);
    }
    if (styleRules?.length) {
        for (const rule of styleRules) {
            if (!rule.style)
                continue;
            const ruleFlat = normalizeToFlat(rule.style);
            const h = ruleFlat.hatch;
            if (h?.enabled) {
                patterns.set(buildHatchPatternId(layerId, h), h);
            }
        }
    }
    return [...patterns.entries()].map(([patternId, hatchConfig]) => ({ patternId, hatchConfig }));
}
// ─── Data-driven style expressions ──────────────────────────────────────────
/**
 * Converts a single GeoLeaf style condition to a MapLibre filter expression.
 *
 * @param condition - `{ field, operator, value }` or `{ all: [...] }`
 * @returns MapLibre expression array, e.g. `["==", ["get", "type"], "park"]`
 */
function conditionToExpression(condition) {
    if (condition.all && Array.isArray(condition.all)) {
        const subs = condition.all
            .map((c) => conditionToExpression(c))
            .filter((e) => e !== null);
        if (subs.length === 0)
            return null;
        if (subs.length === 1)
            return subs[0];
        return ["all", ...subs];
    }
    const { field, operator, value } = condition;
    if (!field || !operator)
        return null;
    // Strip "properties." prefix — MapLibre ["get"] operates implicitly on feature.properties
    const cleanField = field.startsWith("properties.") ? field.substring(11) : field;
    const getter = ["get", cleanField];
    switch (operator) {
        case "==":
        case "===":
        case "eq":
            return ["==", getter, value];
        case "!=":
        case "!==":
        case "neq":
            return ["!=", getter, value];
        case ">":
            return [">", getter, value];
        case ">=":
            return [">=", getter, value];
        case "<":
            return ["<", getter, value];
        case "<=":
            return ["<=", getter, value];
        case "contains": {
            const lowerVal = String(value).toLowerCase();
            // MapLibre: check if lowercase string contains the substring
            return ["in", lowerVal, ["downcase", ["to-string", getter]]];
        }
        case "startsWith": {
            const lowerVal = String(value).toLowerCase();
            const len = lowerVal.length;
            return ["==", ["slice", ["downcase", ["to-string", getter]], 0, len], lowerVal];
        }
        case "endsWith": {
            const lowerVal = String(value).toLowerCase();
            const len = lowerVal.length;
            return [
                "==",
                [
                    "slice",
                    ["downcase", ["to-string", getter]],
                    ["-", ["length", ["to-string", getter]], len],
                ],
                lowerVal,
            ];
        }
        case "in": {
            if (!Array.isArray(value))
                return null;
            return ["in", getter, ["literal", value]];
        }
        case "notIn": {
            if (!Array.isArray(value))
                return null;
            return ["!", ["in", getter, ["literal", value]]];
        }
        case "between": {
            if (!Array.isArray(value) || value.length !== 2)
                return null;
            return ["all", [">=", getter, value[0]], ["<=", getter, value[1]]];
        }
        default:
            return null;
    }
}
/** Strips the `"extends": "base"` marker from a style object before normalization. */
function _resolveRuleStyle(style) {
    if (style.extends !== "base")
        return style;
    const result = {};
    for (const key of Object.keys(style)) {
        if (key !== "extends" && !_UNSAFE_KEYS.has(key)) {
            result[key] = style[key];
        }
    }
    return result;
}
/** Collects all paint keys and builds static or case-expression values per key. */
function _buildPaintFromRules(basePaint, ruleEntries) {
    const result = {};
    const allKeys = new Set(Object.keys(basePaint));
    for (const entry of ruleEntries) {
        for (const k of Object.keys(entry.paint))
            allKeys.add(k);
    }
    for (const key of allKeys) {
        const defaultVal = basePaint[key];
        const varies = ruleEntries.some((e) => e.paint[key] !== undefined && e.paint[key] !== defaultVal);
        if (!varies) {
            if (defaultVal !== undefined)
                result[key] = defaultVal;
            continue;
        }
        result[key] = _buildCaseExpr(key, ruleEntries, defaultVal);
    }
    return result;
}
/** Builds a `["case", cond, val, ..., default]` expression for one paint key. */
function _buildCaseExpr(key, ruleEntries, defaultVal) {
    const caseExpr = ["case"];
    for (const entry of ruleEntries) {
        const v = entry.paint[key];
        if (v !== undefined)
            caseExpr.push(entry.expression, Array.isArray(v) ? ["literal", v] : v);
    }
    const fallback = defaultVal ?? _getPaintDefault(key);
    caseExpr.push(Array.isArray(fallback) ? ["literal", fallback] : fallback);
    return caseExpr;
}
/**
 * Converts GeoLeaf `styleRules` + `defaultStyle` to MapLibre data-driven
 * paint expressions.
 *
 * For each paint property that varies across rules, builds a
 * `["case", cond1, val1, cond2, val2, ..., defaultVal]` expression.
 *
 * If `defaultStyle.expressionPaint` is set, those native MapLibre paint
 * properties are injected last, overriding any GeoLeaf-derived or
 * case-expression values for the same keys.
 *
 * @param styleRules - Array of `{ when, style }` rules from the profile
 * @param defaultStyle - Default style (flat) applied when no rule matches
 * @param geometryType - Target geometry type ('fill' | 'line' | 'circle' | 'fill-extrusion')
 * @returns Paint object with expression values where needed
 */
function styleRulesToPaint(styleRules, defaultStyle, geometryType, layerId) {
    if (!styleRules || styleRules.length === 0) {
        return _getBasePaint(defaultStyle, geometryType, layerId);
    }
    // Collect all paint property keys that appear in any rule
    const basePaint = _getBasePaint(defaultStyle, geometryType, layerId);
    const ruleEntries = [];
    for (const rule of styleRules) {
        if (!rule.when || !rule.style)
            continue;
        const expr = conditionToExpression(rule.when);
        if (!expr)
            continue;
        // _resolveRuleStyle strips the "extends": "base" marker; the merge below
        // provides full inheritance from defaultStyle, so the marker is only syntactic.
        const ruleFlat = normalizeToFlat(_resolveRuleStyle(rule.style));
        const mergedFlat = { ...defaultStyle, ...ruleFlat };
        ruleEntries.push({
            expression: expr,
            paint: _getBasePaint(mergedFlat, geometryType, layerId),
        });
    }
    if (ruleEntries.length === 0)
        return basePaint;
    const result = _buildPaintFromRules(basePaint, ruleEntries);
    // Apply expressionPaint from default style as final overrides — bypass case builder,
    // keys are validated to prevent prototype pollution.
    if (defaultStyle.expressionPaint) {
        _mergeExpressionPaint(result, defaultStyle.expressionPaint);
    }
    return result;
}
// ─── Private helpers ─────────────────────────────────────────────────────────
/** Returns the base (static) paint for a geometry type. */
function _getBasePaint(style, geometryType, layerId) {
    switch (geometryType) {
        case "fill":
            return toFillPaint(style, layerId);
        case "fill-extrusion":
            return toFillExtrusionPaint(style);
        case "line":
            return toLinePaint(style);
        case "circle":
            return toCirclePaint(style);
    }
}
/** Returns a sensible paint default for a given MapLibre property key. */
function _getPaintDefault(key) {
    switch (key) {
        case "fill-color":
        case "line-color":
        case "circle-color":
        case "circle-stroke-color":
        case "fill-outline-color":
            return "#cccccc";
        case "fill-extrusion-color":
            return "#cccccc";
        case "fill-opacity":
        case "line-opacity":
        case "circle-opacity":
        case "fill-extrusion-opacity":
            return 1;
        case "line-width":
        case "circle-stroke-width":
            return 1;
        case "circle-radius":
            return 6;
        case "fill-pattern":
            return "";
        case "fill-extrusion-height":
        case "fill-extrusion-base":
            return 0;
        case "line-dasharray":
            return [1, 0];
        default:
            return 0;
    }
}
/**
 * Cluster config → MapLibre circle paint with step expressions based on `point_count`.
 *
 * @param config - Optional color/size stops. Sensible defaults provided.
 */
function toClusterCirclePaint(config) {
    const colorStops = config?.colorStops ?? [
        [0, "#51bbd6"],
        [100, "#f1f075"],
        [750, "#f28cb1"],
    ];
    const radiusStops = config?.radiusStops ?? [
        [0, 18],
        [100, 24],
        [750, 32],
    ];
    // Build step expressions: ["step", ["get", "point_count"], default, stop1, val1, ...]
    const colorExpr = ["step", ["get", "point_count"], colorStops[0][1]];
    for (let i = 1; i < colorStops.length; i++) {
        colorExpr.push(colorStops[i][0], colorStops[i][1]);
    }
    const radiusExpr = ["step", ["get", "point_count"], radiusStops[0][1]];
    for (let i = 1; i < radiusStops.length; i++) {
        radiusExpr.push(radiusStops[i][0], radiusStops[i][1]);
    }
    return {
        "circle-color": colorExpr,
        "circle-radius": radiusExpr,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
    };
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
// ─── Coordinate helpers ───────────────────────────────────────────────────────
/** Converts a GeoLeafLatLng to a MapLibre [lng, lat] tuple. */
function toMapLibreLngLat(ll) {
    return [ll.lng, ll.lat];
}
/** Converts a MapLibre {lng, lat} result to a GeoLeafLatLng value object. */
function fromMapLibreLngLat(ll) {
    return { lat: ll.lat, lng: ll.lng };
}
/**
 * Converts a GeoLeafBounds to MapLibre LngLatBoundsLike [[w,s],[e,n]].
 * Note the order: MapLibre expects [lng, lat] (longitude first, then latitude).
 */
function toMapLibreBounds(b) {
    return [
        [b.west, b.south],
        [b.east, b.north],
    ];
}
/** Converts a MapLibre LngLatBounds to a GeoLeafBounds object. */
function fromMapLibreBounds(b) {
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    return { south: sw.lat, west: sw.lng, north: ne.lat, east: ne.lng };
}
// ─── Control position mapping ─────────────────────────────────────────────────
/** Maps GeoLeaf control positions to MapLibre position strings. */
const POSITION_MAP = {
    topleft: "top-left",
    topright: "top-right",
    bottomleft: "bottom-left",
    bottomright: "bottom-right",
};
// ─── Security constants ───────────────────────────────────────────────────────
/** @security SVG-only tag whitelist for marker icon sanitisation. */
const SVG_ALLOWED_TAGS = [
    "svg",
    "path",
    "circle",
    "rect",
    "g",
    "use",
    "line",
    "polygon",
    "polyline",
    "ellipse",
    "defs",
    "clipPath",
];
/** Scans GeoJSON data and returns the set of geometry types present. */
function detectGeometryTypes(data) {
    const types = new Set();
    if (data?.type === "FeatureCollection" && Array.isArray(data.features)) {
        for (const f of data.features) {
            if (f?.geometry?.type)
                types.add(f.geometry.type);
        }
    }
    else if (data?.type === "Feature" && data.geometry?.type) {
        types.add(data.geometry.type);
    }
    if (types.size === 0) {
        types.add("Point");
        types.add("LineString");
        types.add("Polygon");
    }
    return types;
}
/** Returns `beforeId` if the layer exists, otherwise `undefined`. */
function safeBeforeId(map, beforeId) {
    return map.getLayer(beforeId) ? beforeId : undefined;
}
/** Creates fill/line/circle sub-layers for detected geometry types. */
function addSubLayers(map, id, sourceId, geomTypes, flat, layoutBase, beforeId, options) {
    const created = [];
    const has = (...t) => t.some((v) => geomTypes.has(v));
    const cfgGeom = options?.configGeometry?.toLowerCase();
    // Zoom constraints applied to every sub-layer
    const zoomProps = {};
    if (typeof options?.minZoom === "number")
        zoomProps.minzoom = options.minZoom;
    if (typeof options?.maxZoom === "number")
        zoomProps.maxzoom = options.maxZoom;
    if (has("Polygon", "MultiPolygon")) {
        if (cfgGeom === "fill-extrusion") {
            // fill-extrusion: extruded 3D polygons
            const extPaint = toFillExtrusionPaint(flat);
            map.addLayer({
                id: toSubLayerId(id, "fill-extrusion"),
                type: "fill-extrusion",
                source: sourceId,
                paint: extPaint,
                layout: { ...layoutBase },
                ...zoomProps,
            }, beforeId);
            created.push("fill-extrusion");
        }
        else {
            // Register hatch patterns before creating the fill layer
            const hatchPatterns = collectHatchPatterns(flat, options?.styleRules, id);
            for (const { patternId, hatchConfig } of hatchPatterns) {
                registerHatchPattern(map, patternId, hatchConfig);
            }
            const fillPaint = options?.styleRules?.length
                ? styleRulesToPaint(options.styleRules, flat, "fill", id)
                : toFillPaint(flat, id);
            map.addLayer({
                id: toSubLayerId(id, "fill"),
                type: "fill",
                source: sourceId,
                paint: fillPaint,
                layout: { ...layoutBase },
                ...zoomProps,
            }, beforeId);
            created.push("fill");
        }
    }
    if (has("LineString", "MultiLineString", "Polygon", "MultiPolygon") &&
        cfgGeom !== "fill-extrusion") {
        // Casing: thicker line behind the main stroke for outline effect
        const casing = flat.casing;
        if (casing?.enabled) {
            const mainWeight = typeof flat.weight === "number" ? flat.weight : 1;
            map.addLayer({
                id: toSubLayerId(id, "casing"),
                type: "line",
                source: sourceId,
                paint: toCasingPaint(casing, mainWeight),
                layout: { ...layoutBase },
                ...zoomProps,
            }, beforeId);
            created.push("casing");
        }
        const linePaint = options?.styleRules?.length
            ? styleRulesToPaint(options.styleRules, flat, "line")
            : toLinePaint(flat);
        map.addLayer({
            id: toSubLayerId(id, "line"),
            type: "line",
            source: sourceId,
            paint: linePaint,
            layout: { ...layoutBase },
            ...zoomProps,
        }, beforeId);
        created.push("line");
    }
    if (has("Point", "MultiPoint")) {
        const circlePaint = options?.styleRules?.length
            ? styleRulesToPaint(options.styleRules, flat, "circle")
            : toCirclePaint(flat);
        map.addLayer({
            id: toSubLayerId(id, "circle"),
            type: "circle",
            source: sourceId,
            paint: circlePaint,
            layout: { ...layoutBase },
            ...zoomProps,
        }, beforeId);
        created.push("circle");
        if (options?.showIconsOnMap) {
            map.addLayer({
                id: toSubLayerId(id, "symbol"),
                type: "symbol",
                source: sourceId,
                layout: {
                    ...layoutBase,
                    "icon-image": ["get", "symbolId"],
                    "icon-size": 0.5,
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true,
                },
                paint: {},
                ...zoomProps,
            }, beforeId);
            created.push("symbol");
        }
    }
    return created;
}
// ─── Cluster helpers (GeoJSON layers with native Supercluster) ────────────────
/**
 * Adds cluster circle + count label sub-layers for a GeoJSON source
 * that has `cluster: true`. Also patches the existing "circle" sub-layer
 * with a filter to exclude clustered points.
 *
 * @returns The sub-layer type keys added (`"clusters"` and `"cluster-count"`).
 */
function addClusterSubLayers(map, id, sourceId, layoutBase, beforeId) {
    const clusterPaint = toClusterCirclePaint();
    // Cluster circles
    const clustersId = toSubLayerId(id, "clusters");
    map.addLayer({
        id: clustersId,
        type: "circle",
        source: sourceId,
        filter: ["has", "point_count"],
        paint: clusterPaint,
        layout: { ...layoutBase },
    }, beforeId);
    // Cluster count labels
    const clusterCountId = toSubLayerId(id, "cluster-count");
    map.addLayer({
        id: clusterCountId,
        type: "symbol",
        source: sourceId,
        filter: ["has", "point_count"],
        layout: {
            ...layoutBase,
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 12,
        },
        paint: { "text-color": "#333333" },
    }, beforeId);
    return [clustersId, clusterCountId];
}
/**
 * Binds default cluster interactions on GeoJSON layers:
 * click on cluster → `getClusterExpansionZoom` + `flyTo`.
 */
function bindGeoJSONClusterEvents(map, sourceId, clustersLayerId) {
    map.on("click", clustersLayerId, (e) => {
        if (!e.features || e.features.length === 0)
            return;
        const clusterId = e.features[0].properties?.cluster_id;
        if (clusterId === undefined)
            return;
        const source = map.getSource(sourceId);
        if (!source)
            return;
        source
            .getClusterExpansionZoom(clusterId)
            .then((zoom) => {
            map.flyTo({ center: e.lngLat, zoom });
        })
            .catch(() => {
            map.flyTo({ center: e.lngLat, zoom: map.getZoom() + 2 });
        });
    });
    // Cursor pointer on hover over clusters
    map.on("mouseenter", clustersLayerId, () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", clustersLayerId, () => {
        map.getCanvas().style.cursor = "";
    });
}

/**
 * Applies a flat GeoLeaf style to the sub-layers of a registered MapLibre layer.
 * Extracted from MaplibreAdapter to keep the adapter file within the 700-line limit.
 * @module adapters/maplibre/maplibre-style-applier
 */
/** Returns true when rules are a non-empty array. */
function _hasRules(rules) {
    return Array.isArray(rules) && rules.length > 0;
}
/** Builds the paint object for a casing sub-layer from a flat style. */
function _buildCasingPaint(flat) {
    const casingConfig = (flat.casing ?? {});
    const mainWeight = typeof flat.weight === "number" ? flat.weight : 1;
    return toCasingPaint(casingConfig, mainWeight);
}
/** Builds the paint object for a fill sub-layer, with or without styleRules. */
function _buildFillPaint(map, flat, rules, id) {
    if (_hasRules(rules)) {
        const hatchPatterns = collectHatchPatterns(flat, rules, id);
        for (const { patternId, hatchConfig } of hatchPatterns) {
            registerHatchPattern(map, patternId, hatchConfig);
        }
        return styleRulesToPaint(rules, flat, "fill", id);
    }
    const hatch = flat.hatch;
    if (hatch?.enabled) {
        registerHatchPattern(map, buildHatchPatternId(id, hatch), hatch);
    }
    return toFillPaint(flat, id);
}
/**
 * Updates the MapLibre paint properties for all sub-layers of `id`
 * to match the given GeoLeaf style options.
 */
function applyLayerStyle(map, registry, id, style) {
    const entry = registry.get(id);
    if (!entry)
        return;
    const flat = normalizeToFlat(style);
    const rules = style?.styleRules;
    for (const subType of entry.subLayerTypes) {
        const subId = toSubLayerId(id, subType);
        if (!map.getLayer(subId))
            continue;
        let paint;
        switch (subType) {
            case "fill":
                paint = _buildFillPaint(map, flat, rules, id);
                break;
            case "line":
                paint = _hasRules(rules)
                    ? styleRulesToPaint(rules, flat, "line")
                    : toLinePaint(flat);
                break;
            case "casing":
                paint = _buildCasingPaint(flat);
                break;
            case "circle":
                paint = _hasRules(rules)
                    ? styleRulesToPaint(rules, flat, "circle")
                    : toCirclePaint(flat);
                break;
            case "fill-extrusion":
                paint = toFillExtrusionPaint(flat);
                break;
            default:
                continue;
        }
        for (const [prop, value] of Object.entries(paint)) {
            map.setPaintProperty(subId, prop, value);
        }
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * MapLibre POI Renderer
 *
 * Encapsulates MapLibre-specific logic for creating and managing POI
 * cluster sources, render layers, and interaction events. Extracted from
 * the adapter to keep it under the 700-line limit.
 *
 * **Architecture (dual-mode):**
 * - GPU path: GeoJSON source with `cluster:true` → 3 render layers
 *   (clusters circle, cluster-count symbol, unclustered-point circle)
 * - DOM path: `maplibregl.Marker` created on click for rich popups
 *
 * @module adapters/maplibre/maplibre-poi-renderer
 */
// ─── Constants ───────────────────────────────────────────────────────────────
/** Suffix for the cluster circles layer. */
const CLUSTERS_SUFFIX = "-clusters";
/** Suffix for the cluster count label layer. */
const CLUSTER_COUNT_SUFFIX = "-cluster-count";
/** Suffix for the unclustered individual points layer. */
const UNCLUSTERED_SUFFIX = "-unclustered";
/** Suffix for the unclustered icon symbol layer (stacked above the circle layer). */
const UNCLUSTERED_ICONS_SUFFIX = "-unclustered-icons";
// ─── Layer ID builders ───────────────────────────────────────────────────────
/** Builds the MapLibre source ID for a POI cluster source. */
function toClusterSourceId(id) {
    return "gl-poi-src-" + id;
}
/** Builds sub-layer IDs for a POI cluster group. */
function toClusterLayerIds(id) {
    const prefix = "gl-poi-" + id;
    const sourceId = toClusterSourceId(id);
    const clustersLayerId = prefix + CLUSTERS_SUFFIX;
    const clusterCountLayerId = prefix + CLUSTER_COUNT_SUFFIX;
    const unclusteredLayerId = prefix + UNCLUSTERED_SUFFIX;
    const unclusteredIconsLayerId = prefix + UNCLUSTERED_ICONS_SUFFIX;
    return {
        sourceId,
        clustersLayerId,
        clusterCountLayerId,
        unclusteredLayerId,
        unclusteredIconsLayerId,
        allLayerIds: [
            clustersLayerId,
            clusterCountLayerId,
            unclusteredLayerId,
            unclusteredIconsLayerId,
        ],
    };
}
// ─── Source & layer creation ─────────────────────────────────────────────────
/**
 * Creates a clustered GeoJSON source and its 3 render layers on the map.
 *
 * @param map - Native MapLibre map instance.
 * @param id - GeoLeaf cluster group identifier (e.g. `"poi-source"`).
 * @param options - Clustering and paint options.
 * @returns The layer IDs created.
 */
/** Copies resolved display fields onto a flat properties object. */
function _applyDisplayProperties(display, properties) {
    if (display.colorFill)
        properties.colorFill = display.colorFill;
    if (display.colorStroke)
        properties.colorStroke = display.colorStroke;
    if (typeof display.radius === "number")
        properties.radius = display.radius;
    if (display.symbolId)
        properties.symbolId = display.symbolId;
}
/** Default paint for unclustered POI circles. */
const DEFAULT_UNCLUSTERED_PAINT = {
    "circle-color": ["coalesce", ["get", "colorFill"], "#4a90e5"],
    "circle-radius": ["coalesce", ["get", "radius"], 6],
    "circle-stroke-width": 1.5,
    "circle-stroke-color": ["coalesce", ["get", "colorStroke"], "#ffffff"],
};
/** Adds the 3 cluster render layers (circles, count labels, unclustered points). */
function _addClusterLayers(map, ids, clusterPaint, unclusteredPaint) {
    map.addLayer({
        id: ids.clustersLayerId,
        type: "circle",
        source: ids.sourceId,
        filter: ["has", "point_count"],
        paint: clusterPaint,
    });
    map.addLayer({
        id: ids.clusterCountLayerId,
        type: "symbol",
        source: ids.sourceId,
        filter: ["has", "point_count"],
        layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 12,
        },
        paint: { "text-color": "#333333" },
    });
    map.addLayer({
        id: ids.unclusteredLayerId,
        type: "circle",
        source: ids.sourceId,
        filter: ["!", ["has", "point_count"]],
        paint: unclusteredPaint,
    });
    // Icon symbol layer — stacked above circle layer; only shown for points with a registered image.
    map.addLayer({
        id: ids.unclusteredIconsLayerId,
        type: "symbol",
        source: ids.sourceId,
        filter: ["all", ["!", ["has", "point_count"]], ["has", "symbolId"]],
        layout: {
            "icon-image": ["get", "symbolId"],
            "icon-size": 1,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
        },
    });
}
async function createClusteredSource(map, id, options) {
    // MapLibre requires the style to be fully loaded before addSource/addLayer.
    // Use the same guard pattern as registerSpriteIcons (maplibre-poi-icons.ts).
    if (!map.isStyleLoaded()) {
        await new Promise((resolve) => map.once("styledata", resolve));
    }
    const ids = toClusterLayerIds(id);
    const data = options?.data ?? { type: "FeatureCollection", features: [] };
    map.addSource(ids.sourceId, {
        type: "geojson",
        data,
        cluster: true,
        clusterRadius: options?.clusterRadius ?? 50,
        clusterMaxZoom: Math.min(options?.clusterMaxZoom ?? 14, 17),
    });
    const clusterPaint = toClusterCirclePaint(options?.clusterPaint);
    const unclusteredPaint = options?.unclusteredPaint ?? DEFAULT_UNCLUSTERED_PAINT;
    _addClusterLayers(map, ids, clusterPaint, unclusteredPaint);
    return ids;
}
// ─── Filtering ───────────────────────────────────────────────────────────────
/**
 * Applies a MapLibre filter expression to the unclustered-point layer.
 *
 * @param map - Native MapLibre map instance.
 * @param id - Cluster group identifier.
 * @param filter - MapLibre filter expression, or `null` to reset to default.
 */
function applyPoiFilter(map, id, filter) {
    const ids = toClusterLayerIds(id);
    if (filter === null || filter === undefined) {
        // Reset to default: show all unclustered points
        map.setFilter(ids.unclusteredLayerId, ["!", ["has", "point_count"]]);
        map.setFilter(ids.unclusteredIconsLayerId, [
            "all",
            ["!", ["has", "point_count"]],
            ["has", "symbolId"],
        ]);
    }
    else {
        // Combine with the base filter (must NOT be a cluster)
        map.setFilter(ids.unclusteredLayerId, ["all", ["!", ["has", "point_count"]], filter]);
        map.setFilter(ids.unclusteredIconsLayerId, [
            "all",
            ["!", ["has", "point_count"]],
            ["has", "symbolId"],
            filter,
        ]);
    }
}
// ─── Events ──────────────────────────────────────────────────────────────────
/**
 * Binds click and hover events on the cluster layers.
 *
 * @param map - Native MapLibre map instance.
 * @param id - Cluster group identifier.
 * @param handlers - Event handler callbacks.
 */
function bindPoiEvents(map, id, handlers) {
    const ids = toClusterLayerIds(id);
    // Click on unclustered point (circle layer)
    if (handlers.onPointClick) {
        map.on("click", ids.unclusteredLayerId, (e) => {
            if (!e.features || e.features.length === 0)
                return;
            const feature = e.features[0];
            handlers.onPointClick(feature, e.lngLat);
        });
        // Icon layer is topmost — must also forward clicks to onPointClick
        map.on("click", ids.unclusteredIconsLayerId, (e) => {
            if (!e.features || e.features.length === 0)
                return;
            const feature = e.features[0];
            handlers.onPointClick(feature, e.lngLat);
        });
    }
    // Click on cluster → expansion zoom
    if (handlers.onClusterClick) {
        map.on("click", ids.clustersLayerId, (e) => {
            if (!e.features || e.features.length === 0)
                return;
            const feature = e.features[0];
            handlers.onClusterClick(feature, e.lngLat);
        });
    }
    // Cursor pointer on hover — unclustered points and their icons
    map.on("mouseenter", ids.unclusteredLayerId, () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", ids.unclusteredLayerId, () => {
        map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", ids.unclusteredIconsLayerId, () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", ids.unclusteredIconsLayerId, () => {
        map.getCanvas().style.cursor = "";
    });
    // Cursor pointer on hover — clusters
    map.on("mouseenter", ids.clustersLayerId, () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", ids.clustersLayerId, () => {
        map.getCanvas().style.cursor = "";
    });
}
/**
 * Returns the expansion zoom level for a cluster.
 *
 * @param map - Native MapLibre map instance.
 * @param id - Cluster group identifier.
 * @param clusterId - The `cluster_id` property from the clicked feature.
 * @returns Promise resolving to the zoom level.
 */
function getClusterExpansionZoom(map, id, clusterId) {
    const sourceId = toClusterSourceId(id);
    const source = map.getSource(sourceId);
    return source.getClusterExpansionZoom(clusterId);
}
// ─── Data conversion ─────────────────────────────────────────────────────────
/**
 * Converts a POI array to a GeoJSON FeatureCollection suitable for a
 * clustered MapLibre source.
 *
 * Properties are flattened (MapLibre expressions cannot access nested objects).
 * Coordinates are flipped from `[lat, lng]` (GeoLeaf) to `[lng, lat]` (GeoJSON).
 *
 * @param pois - Array of POI objects.
 * @param extractCoords - Function that extracts `{lat, lng}` from a POI.
 * @param resolveDisplay - Optional function that resolves display config (colorFill, etc.).
 * @returns GeoJSON FeatureCollection with Point features.
 */
function poisToFeatureCollection(pois, extractCoords, resolveDisplay) {
    const features = [];
    for (const poi of pois) {
        const coords = extractCoords(poi);
        if (!coords)
            continue;
        const display = resolveDisplay ? resolveDisplay(poi) : null;
        const properties = {
            id: poi.id ?? "",
            title: poi.title ?? poi.label ?? "",
            categoryId: poi.attributes?.categoryId ?? poi.categoryId ?? "",
            subCategoryId: poi.attributes?.subCategoryId ?? poi.subCategoryId ?? "",
            type: poi.type ?? "",
        };
        // Add display properties for data-driven paint/layout expressions
        if (display)
            _applyDisplayProperties(display, properties);
        features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [coords.lng, coords.lat], // GeoJSON order: [lng, lat]
            },
            properties,
        });
    }
    return { type: "FeatureCollection", features };
}

/**
 * GeoLeaf - DOM Security Module
 *
 * @description Secure wrappers for DOM manipulation without XSS vulnerabilities
 * @module GeoLeaf.DOMSecurity
 * @version 1.2.0
 *
 * USAGE:
 * - Replaces innerHTML with secure alternatives
 * - Utilise textContent pour data non-HTML
 * - Sanitize via GeoLeaf.Security pour HTML required
 * - Creates SVG securely
 */
/** @security Safe DOM text assignment; never interprets HTML — immune to XSS. */
function setTextContent(element, text) {
    if (!element || !element.nodeType) {
        Log.warn("[DOMSecurity] Invalid element in setTextContent");
        return;
    }
    element.textContent = text != null ? String(text) : "";
}
/** @security Wraps innerHTML assignment through Security.sanitizeHTML; fallback to textContent if unavailable. */
function setSafeHTML(element, html, allowedTags) {
    if (!element || !element.nodeType) {
        Log.warn("[DOMSecurity] Invalid element in setSafeHTML");
        return;
    }
    if (Security && typeof Security.sanitizeHTML === "function") {
        Security.sanitizeHTML(element, html, allowedTags ? { allowedTags } : {});
    }
    else {
        Log.warn("[DOMSecurity] Security.sanitizeHTML unavailable, falling back to textContent");
        element.textContent = html ? String(html) : "";
    }
}
function clearElement(element) {
    if (!element || !element.nodeType) {
        Log.warn("[DOMSecurity] Invalid element in clearElement");
        return;
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}
function clearElementFast(element) {
    if (!element || !element.nodeType) {
        Log.warn("[DOMSecurity] Invalid element in clearElementFast");
        return;
    }
    element.textContent = "";
}
function createSVGIcon(width, height, pathData, options = {}) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", options.viewBox ?? "0 0 24 24");
    svg.setAttribute("fill", options.fill ?? "none");
    svg.setAttribute("stroke", options.stroke ?? "currentColor");
    svg.setAttribute("stroke-width", String(options.strokeWidth ?? "2"));
    svg.setAttribute("stroke-linecap", options.strokeLinecap ?? "round");
    svg.setAttribute("stroke-linejoin", options.strokeLinejoin ?? "round");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    return svg;
}
const SVG_ICONS = {
    "chevron-down": "M6 9l6 6 6-6",
    "chevron-up": "M18 15l-6-6-6 6",
    "chevron-left": "M15 18l-6-6 6-6",
    "chevron-right": "M9 18l6-6-6-6",
    "arrow-left": "‹",
    "arrow-right": "›",
    close: "✕",
    check: "✓",
    star: "★",
    "star-empty": "☆",
    "triangle-right": "▶",
    "triangle-down": "▼",
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    marker: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z",
    "map-pin": "M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
    trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    copy: "M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z",
    sync: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
};
function getIcon(name, size = 18, options = {}) {
    const pathData = SVG_ICONS[name];
    if (!pathData) {
        Log.warn(`[DOMSecurity] Icon '${name}' not found`);
        return null;
    }
    return createSVGIcon(size, size, pathData, options);
}
function _applyAttribute(element, key, value) {
    if (key === "class" || key === "className") {
        element.className = String(value);
    }
    else if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
    }
    else if (key.startsWith("data-")) {
        element.setAttribute(key, String(value));
    }
    else {
        element[key] = value;
    }
}
function createElement$2(tagName, attributes = {}, children = null) {
    const element = document.createElement(tagName);
    for (const [key, value] of Object.entries(attributes)) {
        _applyAttribute(element, key, value);
    }
    if (children) {
        if (Array.isArray(children)) {
            children.forEach((child) => {
                if (typeof child === "string") {
                    element.appendChild(document.createTextNode(child));
                }
                else if (child && child.nodeType) {
                    element.appendChild(child);
                }
            });
        }
        else if (typeof children === "string") {
            element.textContent = children;
        }
        else if (children.nodeType) {
            element.appendChild(children);
        }
    }
    return element;
}
const DOMSecurity = {
    setTextContent,
    setSafeHTML,
    clearElement,
    clearElementFast,
    createSVGIcon,
    getIcon,
    createElement: createElement$2,
    SVG_ICONS,
};

/** MapLibre GL JS adapter — implements `IMapAdapter`. One instance per map. */
class MaplibreAdapter {
    _map = null;
    _ready = false;
    _prevZoom = 0;
    _controlIdCounter = 0;
    _controls = new Map();
    _layerRegistry = new MaplibreLayerRegistry();
    _openPopups = new Set();
    _markers = new Map();
    _clusterIds = new Map();
    // Named handler refs — stored so destroy() can deregister them explicitly.
    _handleLoad = () => {
        dispatchGeoLeafEvent("geoleaf:map:ready", undefined);
    };
    _handleZoomStart = () => {
        if (this._map)
            this._prevZoom = this._map.getZoom();
    };
    _handleZoomEnd = () => {
        if (!this._map)
            return;
        const c = this._map.getCenter();
        dispatchGeoLeafEvent("geoleaf:map:zoom", {
            zoom: this._map.getZoom(),
            oldZoom: this._prevZoom,
            center: { lat: c.lat, lng: c.lng },
        });
    };
    _handleMoveEnd = () => {
        if (!this._map)
            return;
        const c = this._map.getCenter();
        dispatchGeoLeafEvent("geoleaf:map:move", {
            center: { lat: c.lat, lng: c.lng },
            zoom: this._map.getZoom(),
        });
    };
    // ── Initialisation ────────────────────────────────────────────────────────
    init(options) {
        if (this._ready)
            throw new Error("MaplibreAdapter: init() has already been called.");
        const maxBoundsRaw = options["maxBounds"];
        // Auto-activate preserveDrawingBuffer when the print plugin is registered before map init.
        // Also honoured via explicit opt-in `mapOptions.preserveDrawingBuffer`.
        const _printRegistered = globalThis?.GeoLeaf?.plugins?.isLoaded?.("print") === true;
        this._map = new maplibregl.Map({
            container: options.container,
            style: { version: 8, sources: {}, layers: [] },
            center: options.center ? toMapLibreLngLat(options.center) : [0, 0],
            zoom: options.zoom ?? 5,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
            maxPitch: options.maxPitch ?? 80,
            maxBounds: maxBoundsRaw ? toMapLibreBounds(maxBoundsRaw) : undefined,
            attributionControl: false,
            ...((options.preserveDrawingBuffer || _printRegistered) && {
                preserveDrawingBuffer: true,
            }),
        });
        if (options.bounds)
            this._map.fitBounds(toMapLibreBounds(options.bounds), { animate: false });
        this._ready = true;
        this._bindEvents();
    }
    isReady() {
        return this._ready;
    }
    /** Destroys the map instance and releases all resources. After destroy(), no other method may be called. */
    destroy() {
        this._ready = false;
        if (this._map) {
            // Deregister named handlers before remove() to prevent listener leaks
            // when the same adapter instance is destroyed and re-initialised.
            this._map.off("load", this._handleLoad);
            this._map.off("zoomstart", this._handleZoomStart);
            this._map.off("zoomend", this._handleZoomEnd);
            this._map.off("moveend", this._handleMoveEnd);
            this._map.remove();
            this._map = null;
        }
        // Cleanup DOM markers
        for (const marker of this._markers.values()) {
            marker.remove();
        }
        this._markers.clear();
        this._clusterIds.clear();
        this._controls.clear();
        this._layerRegistry.clear();
        this._openPopups.clear();
        this._sentinelCreated = false;
    }
    // ── View / Navigation ─────────────────────────────────────────────────────
    setView(center, zoom) {
        this._assertReady();
        this._map.jumpTo({ center: toMapLibreLngLat(center), zoom });
    }
    getCenter() {
        this._assertReady();
        return fromMapLibreLngLat(this._map.getCenter());
    }
    getZoom() {
        this._assertReady();
        return this._map.getZoom();
    }
    setZoom(zoom) {
        this._assertReady();
        this._map.jumpTo({ zoom });
    }
    panTo(center) {
        this._assertReady();
        this._map.easeTo({ center: toMapLibreLngLat(center) });
    }
    flyTo(center, zoom) {
        this._assertReady();
        const opts = { center: toMapLibreLngLat(center) };
        if (zoom !== undefined)
            opts.zoom = zoom;
        this._map.flyTo(opts);
    }
    fitBounds(bounds, options) {
        this._assertReady();
        const mlOpts = {};
        if (options?.padding) {
            const p = options.padding;
            if (typeof p.top === "number" || typeof p.bottom === "number") {
                // MapLibre {top, bottom, left, right} format — pass through
                mlOpts.padding = {
                    top: p.top ?? 0,
                    bottom: p.bottom ?? 0,
                    left: p.left ?? 0,
                    right: p.right ?? 0,
                };
            }
            else {
                // GeoLeafPoint {x, y} → symmetric conversion
                mlOpts.padding = {
                    top: p.y ?? 0,
                    bottom: p.y ?? 0,
                    left: p.x ?? 0,
                    right: p.x ?? 0,
                };
            }
        }
        if (options?.animate === false)
            mlOpts.animate = false;
        this._map.fitBounds(toMapLibreBounds(bounds), mlOpts);
    }
    getBounds() {
        this._assertReady();
        return fromMapLibreBounds(this._map.getBounds());
    }
    // ── Events ────────────────────────────────────────────────────────────────
    /**
     * Wraps the handler to normalise MapLibre events to GeoLeaf conventions.
     * MapLibre uses `e.lngLat`; GeoLeaf modules expect `e.latlng`.
     */
    _wrapperMap = new Map();
    on(event, handler) {
        this._assertReady();
        const wrapped = (e) => {
            if (e?.lngLat && !e.latlng) {
                e.latlng = fromMapLibreLngLat(e.lngLat);
            }
            handler(e);
        };
        this._wrapperMap.set(handler, wrapped);
        this._map.on(event, wrapped);
    }
    off(event, handler) {
        this._assertReady();
        const wrapped = this._wrapperMap.get(handler) || handler;
        this._map.off(event, wrapped);
        this._wrapperMap.delete(handler);
    }
    once(event, handler) {
        this._assertReady();
        this._map.once(event, handler);
    }
    // ── Layers ────────────────────────────────────────────────────────────────
    /** Creates a GeoJSON source + fill/line/circle sub-layers for the given data. */
    addGeoJSONLayer(id, data, options) {
        this._assertReady();
        if (this._layerRegistry.has(id)) {
            throw new Error(`MaplibreAdapter: layer "${id}" already exists.`);
        }
        const sourceId = toSourceId(id);
        const fc = data;
        const geomTypes = detectGeometryTypes(fc);
        // Resolve clustering options from layer config
        const shouldCluster = options?.cluster === true;
        const sourceOptions = { type: "geojson", data };
        if (shouldCluster) {
            sourceOptions.cluster = true;
            sourceOptions.clusterRadius =
                typeof options?.clusterRadius === "number" ? options.clusterRadius : 50;
            sourceOptions.clusterMaxZoom =
                typeof options?.clusterMaxZoom === "number" ? options.clusterMaxZoom : 14;
        }
        // Add GeoJSON source (with or without clustering)
        this._map.addSource(sourceId, sourceOptions);
        // Resolve style — convert flat GeoLeaf options to MapLibre paint
        const rawStyle = options ?? {};
        const styleRules = rawStyle.styleRules;
        const flat = normalizeToFlat(rawStyle);
        const zIndex = typeof rawStyle.zIndex === "number" ? rawStyle.zIndex : 0;
        const visible = options?.visible !== false;
        const layoutBase = visible
            ? { visibility: "visible" }
            : { visibility: "none" };
        const beforeId = this._layerRegistry.getInsertBeforeId(zIndex);
        // Zoom constraints (if provided by caller)
        const minZoom = typeof rawStyle.minZoom === "number" ? rawStyle.minZoom : undefined;
        const maxZoom = typeof rawStyle.maxZoom === "number" ? rawStyle.maxZoom : undefined;
        const showIconsOnMap = rawStyle.showIconsOnMap === true;
        const configGeometry = rawStyle.geometry;
        this._ensureSentinel();
        const effectiveBeforeId = safeBeforeId(this._map, beforeId);
        const createdSubLayers = addSubLayers(this._map, id, sourceId, geomTypes, flat, layoutBase, effectiveBeforeId, {
            styleRules,
            minZoom,
            maxZoom,
            showIconsOnMap: showIconsOnMap || undefined,
            configGeometry,
        });
        // If clustering enabled: add cluster layers + filter unclustered circle layer
        let extraSubLayerIds = [];
        if (shouldCluster && geomTypes.has("Point")) {
            // Patch existing circle layer to only show unclustered points
            const circleLayerId = toSubLayerId(id, "circle");
            if (this._map.getLayer(circleLayerId)) {
                this._map.setFilter(circleLayerId, ["!", ["has", "point_count"]]);
            }
            // Add cluster circle + count label layers
            extraSubLayerIds = addClusterSubLayers(this._map, id, sourceId, layoutBase, effectiveBeforeId);
            // Bind click-to-zoom interaction on clusters
            const clustersLayerId = extraSubLayerIds[0];
            bindGeoJSONClusterEvents(this._map, sourceId, clustersLayerId);
        }
        this._layerRegistry.register(id, createdSubLayers, zIndex, {
            customSubLayerIds: extraSubLayerIds.length
                ? [...createdSubLayers.map((t) => toSubLayerId(id, t)), ...extraSubLayerIds]
                : undefined,
        });
        if (!visible)
            this._layerRegistry.setVisible(id, false);
    }
    /**
     * Removes all MapLibre layers and the source for the given GeoLeaf layer.
     */
    removeLayer(id) {
        this._assertReady();
        const entry = this._layerRegistry.get(id);
        if (!entry)
            return;
        for (const subId of entry.subLayerIds) {
            if (this._map.getLayer(subId))
                this._map.removeLayer(subId);
        }
        if (this._map.getSource(entry.sourceId)) {
            this._map.removeSource(entry.sourceId);
        }
        // Cleanup hatch pattern images (prefix-based: gl-hatch-{layerId}-*)
        const hatchPrefix = `gl-hatch-${id}-`;
        if (this._map.style?._images) {
            for (const imgId of Object.keys(this._map.style._images)) {
                if (imgId.startsWith(hatchPrefix))
                    this._map.removeImage(imgId);
            }
        }
        this._layerRegistry.unregister(id);
    }
    /** Returns `true` if the layer is registered in the adapter. */
    hasLayer(id) {
        return this._layerRegistry.has(id);
    }
    /** Shows all sub-layers for the given GeoLeaf layer. */
    showLayer(id) {
        this._assertReady();
        const subIds = this._layerRegistry.getSubLayerIds(id);
        for (const subId of subIds) {
            if (this._map.getLayer(subId)) {
                this._map.setLayoutProperty(subId, "visibility", "visible");
            }
        }
        this._layerRegistry.setVisible(id, true);
    }
    /** Hides all sub-layers for the given GeoLeaf layer. */
    hideLayer(id) {
        this._assertReady();
        const subIds = this._layerRegistry.getSubLayerIds(id);
        for (const subId of subIds) {
            if (this._map.getLayer(subId)) {
                this._map.setLayoutProperty(subId, "visibility", "none");
            }
        }
        this._layerRegistry.setVisible(id, false);
    }
    /** Replaces the GeoJSON data of an existing source. */
    updateLayerData(id, data) {
        this._assertReady();
        const entry = this._layerRegistry.get(id);
        if (!entry)
            return;
        const source = this._map.getSource(entry.sourceId);
        if (source && typeof source.setData === "function") {
            source.setData(data);
        }
    }
    /** Applies a style to an existing layer by updating paint properties on each sub-layer. */
    setLayerStyle(id, style) {
        this._assertReady();
        applyLayerStyle(this._map, this._layerRegistry, id, style);
    }
    // ── Layer filtering ──────────────────────────────────────────────────────
    /**
     * Applies a filter expression to a registered layer's sub-layers.
     * For cluster groups, filters the unclustered-point layer specifically.
     * Pass `null` to clear the filter.
     */
    setLayerFilter(id, filter) {
        this._assertReady();
        // Check if this is a cluster group first
        if (this._clusterIds.has(id)) {
            applyPoiFilter(this._map, id, filter);
            return;
        }
        // Regular GeoJSON layer — apply filter to all sub-layers
        const subLayerIds = this._layerRegistry.getSubLayerIds(id);
        for (const subId of subLayerIds) {
            if (this._map.getLayer(subId)) {
                this._map.setFilter(subId, filter ?? null);
            }
        }
    }
    // ── Markers ──────────────────────────────────────────────────────────────
    /** Creates a DOM marker at the given position and adds it to the map. */
    createMarker(id, position, options) {
        this._assertReady();
        if (this._markers.has(id)) {
            // Update position instead of throwing — allows reuse for popup anchors
            this.updateMarkerPosition(id, position);
            return;
        }
        const markerOpts = {};
        // Custom DOM element from icon SVG string
        // @security Defence-in-depth: sanitise SVG even though icons should be static
        if (options?.icon) {
            const el = document.createElement("div");
            DOMSecurity.setSafeHTML(el, options.icon, SVG_ALLOWED_TAGS);
            el.style.cursor = "pointer";
            if (options.iconSize) {
                el.style.width = options.iconSize[0] + "px";
                el.style.height = options.iconSize[1] + "px";
            }
            // Accessibility: expose marker to screen readers via aria-label (WCAG 1.1.1)
            if (options.title) {
                el.setAttribute("aria-label", String(options.title));
                el.setAttribute("role", "img");
            }
            markerOpts.element = el;
        }
        if (options?.draggable)
            markerOpts.draggable = true;
        if (options?.iconAnchor) {
            markerOpts.offset = [options.iconAnchor[0], options.iconAnchor[1]];
        }
        const marker = new maplibregl.Marker(markerOpts);
        marker.setLngLat(toMapLibreLngLat(position)).addTo(this._map);
        this._markers.set(id, marker);
    }
    removeMarker(id) {
        const marker = this._markers.get(id);
        if (!marker)
            return;
        marker.remove();
        this._markers.delete(id);
    }
    updateMarkerPosition(id, position) {
        const marker = this._markers.get(id);
        if (!marker)
            return;
        marker.setLngLat(toMapLibreLngLat(position));
    }
    /** Creates a clustered GeoJSON source with cluster circle/symbol layers. */
    async createClusterGroup(id, options) {
        this._assertReady();
        if (this._clusterIds.has(id)) {
            throw new Error(`MaplibreAdapter: cluster group "${id}" already exists.`);
        }
        const ids = await createClusteredSource(this._map, id, {
            clusterRadius: options?.clusterRadius ?? 50,
            clusterMaxZoom: options?.clusterMaxZoom ?? 14,
        });
        this._clusterIds.set(id, ids);
        // Register in layer registry with custom IDs for unified layer management
        this._layerRegistry.register(id, ["circle", "symbol"], 100, {
            customSubLayerIds: ids.allLayerIds,
            customSourceId: ids.sourceId,
        });
        // Wire default cluster interaction: click on cluster → expansion zoom
        bindPoiEvents(this._map, id, {
            onClusterClick: (feature, lngLat) => {
                const clusterId = feature.properties?.cluster_id;
                if (clusterId === undefined)
                    return;
                getClusterExpansionZoom(this._map, id, clusterId)
                    .then((zoom) => {
                    this._map.flyTo({
                        center: [lngLat.lng, lngLat.lat],
                        zoom,
                    });
                })
                    .catch(() => {
                    // Fallback: zoom in +2 levels on click if expansion zoom fails
                    this._map.flyTo({
                        center: [lngLat.lng, lngLat.lat],
                        zoom: this._map.getZoom() + 2,
                    });
                });
            },
        });
    }
    // ── Popups ───────────────────────────────────────────────────────────────
    /** Creates a popup (not opened — call `openPopup()` after). Content must be pre-sanitised. */
    createPopup(content, options) {
        const mlOpts = {};
        if (options?.maxWidth)
            mlOpts.maxWidth = `${options.maxWidth}px`;
        if (options?.minWidth)
            mlOpts.minWidth = `${options.minWidth}px`;
        if (options?.maxHeight)
            mlOpts.maxHeight = `${options.maxHeight}px`;
        if (typeof options?.closeOnClick === "boolean")
            mlOpts.closeOnClick = options.closeOnClick;
        if (options?.className)
            mlOpts.className = options.className;
        const popup = new maplibregl.Popup(mlOpts);
        if (typeof content === "string") {
            popup.setHTML(content);
        }
        else {
            popup.setDOMContent(content);
        }
        return popup;
    }
    openPopup(popup, position) {
        this._assertReady();
        const p = popup;
        if (position) {
            p.setLngLat(toMapLibreLngLat(position));
        }
        p.addTo(this._map);
        this._openPopups.add(p);
        // Auto-remove from tracking when the popup is closed by the user.
        p.once("close", () => {
            this._openPopups.delete(p);
        });
    }
    closePopup(popup) {
        if (popup) {
            popup.remove();
            this._openPopups.delete(popup);
        }
        else {
            for (const p of this._openPopups) {
                p.remove();
            }
            this._openPopups.clear();
        }
    }
    // ── Controls ──────────────────────────────────────────────────────────────
    /** Adds a control (HTMLElement or native IControl) at the given position. */
    addControl(control, position) {
        this._assertReady();
        const mlControl = this._resolveControl(control, position);
        const mlPosition = POSITION_MAP[position] || "top-right";
        this._map.addControl(mlControl, mlPosition);
        const controlId = `ctrl_${++this._controlIdCounter}`;
        this._controls.set(controlId, mlControl);
        return {
            position,
            remove: () => {
                this._map?.removeControl(mlControl);
                this._controls.delete(controlId);
            },
        };
    }
    removeControl(control) {
        this._assertReady();
        control.remove();
    }
    // ── Utilities ─────────────────────────────────────────────────────────────
    latLngToPoint(latlng) {
        this._assertReady();
        const pt = this._map.project(toMapLibreLngLat(latlng));
        return { x: pt.x, y: pt.y };
    }
    pointToLatLng(point) {
        this._assertReady();
        const ll = this._map.unproject([point.x, point.y]);
        return fromMapLibreLngLat(ll);
    }
    getContainer() {
        this._assertReady();
        return this._map.getContainer();
    }
    /** Escape hatch — returns the underlying `maplibregl.Map` instance. */
    getNativeMap() {
        return this._map;
    }
    // ── Private helpers ───────────────────────────────────────────────────────
    _assertReady() {
        if (!this._ready || !this._map) {
            throw new Error("MaplibreAdapter: map is not ready. Call init() first.");
        }
    }
    _bindEvents() {
        this._map.on("load", this._handleLoad);
        this._map.on("zoomstart", this._handleZoomStart);
        this._map.on("zoomend", this._handleZoomEnd);
        this._map.on("moveend", this._handleMoveEnd);
    }
    _resolveControl(control, _position) {
        if (control instanceof HTMLElement) {
            return { onAdd: () => control, onRemove: () => { } };
        }
        return control;
    }
    // ── Sentinel ─────────────────────────────────────────────────────────────
    _sentinelCreated = false;
    _ensureSentinel() {
        if (this._sentinelCreated)
            return;
        if (this._map.getLayer(SENTINEL_POI)) {
            this._sentinelCreated = true;
            return;
        }
        this._map.addLayer({
            id: SENTINEL_POI,
            type: "background",
            paint: { "background-opacity": 0 },
        });
        this._sentinelCreated = true;
    }
    /**
     * Resets internal tracking state after `map.setStyle()` replaces the
     * entire MapLibre style (destroys all sources and layers).
     *
     * Clears layer registry, sentinel flag, and cluster IDs. Does **not**
     * touch DOM markers, controls, or popups (they survive style changes).
     */
    resetForStyleChange() {
        this._sentinelCreated = false;
        this._layerRegistry.clear();
        this._clusterIds.clear();
    }
    /** Returns the layer registry (read-only, for popup-tooltip event binding). */
    getLayerRegistry() {
        return this._layerRegistry;
    }
}

/*!
 * GeoLeaf Core – Core / Index
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
// ES2022 target + Node ≥ 18: globalThis is always defined.
const _g$2 = globalThis;
let _mapInstance = null;
let _map = null;
// ── Private helpers ───────────────────────────────────────────────────────────
/**
 * Builds a GeoLeafLatLng center from a [lat, lng] array coming from the config.
 * Returns undefined when the value is absent or malformed.
 */
function _centerFromArray(raw) {
    if (!Array.isArray(raw) || raw.length < 2)
        return undefined;
    return { lat: Number(raw[0]), lng: Number(raw[1]) };
}
/**
 * Extracts maxBounds from mapOptions if it is a plain GeoLeafBounds object.
 * After the migration of app/init.ts, maxBounds is produced by padBounds()
 * and is always a GeoLeafBounds — not a Leaflet LatLngBounds.
 */
function _maxBoundsFromOpts(mapOptions) {
    const b = mapOptions?.maxBounds;
    if (!b || typeof b !== "object")
        return undefined;
    if (typeof b.north === "number" &&
        typeof b.south === "number" &&
        typeof b.east === "number" &&
        typeof b.west === "number") {
        return b;
    }
    return undefined;
}
/**
 * Builds a MapInitOptions object from the normalised GeoLeaf options
 * produced by APIInitializationManager._normalizeInitOptions().
 */
function _buildInitOptions(container, options) {
    return {
        container,
        center: _centerFromArray(options.center),
        zoom: Number.isFinite(options.zoom) ? options.zoom : CONSTANTS.DEFAULT_ZOOM,
        minZoom: options.mapOptions?.minZoom,
        maxZoom: options.mapOptions?.maxZoom,
        maxPitch: options.mapOptions?.maxPitch,
        maxBounds: _maxBoundsFromOpts(options.mapOptions),
        preserveDrawingBuffer: options.mapOptions?.preserveDrawingBuffer === true ? true : undefined,
    };
}
// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Initialises the map with the given options.
 * Resolves the container element, creates a MaplibreAdapter,
 * applies the UI theme, and bootstraps the legend.
 *
 * @param options - Normalised map options.
 * @param options.mapId - DOM element id for the map container.
 * @param options.center - Initial center as `[lat, lng]`.
 * @param options.zoom - Initial zoom level.
 * @param options.theme - UI theme identifier (e.g. `"light"`, `"dark"`).
 * @param options.mapOptions - Additional engine options (minZoom, maxZoom, maxBounds).
 * @returns The active `IMapAdapter` instance, or `null` on error.
 */
function init(options = {}) {
    const context = "[GeoLeaf.Core]";
    try {
        if (_mapInstance) {
            Log.warn(`${context} Map already initialized. Recycling existing instance.`);
            return _mapInstance;
        }
        const container = resolveMapContainer(options.mapId);
        const initOpts = _buildInitOptions(container, options);
        const adapter = new MaplibreAdapter();
        adapter.init(initOpts);
        _mapInstance = adapter;
        _map = adapter;
        applyThemeSafe(options.theme || "light");
        initLegendSafe(adapter);
        Log.info(`${context} Map initialized successfully.`);
        return adapter;
    }
    catch (err) {
        Log.error(`${context} ERROR:`, err.message);
        if (typeof _g$2.GeoLeaf?.Core?.onError === "function") {
            try {
                _g$2.GeoLeaf.Core.onError(err);
            }
            catch (cbErr) {
                Log.error(`${context} Error in Core.onError():`, cbErr);
            }
        }
        _mapInstance = null;
        _map = null;
        return null;
    }
}
// ── Accessor ──────────────────────────────────────────────────────────────────
/**
 * Returns the current map adapter instance.
 *
 * @returns The active `IMapAdapter`, or `null` if not yet initialised.
 */
function getMap() {
    return _map;
}
// ── Public Core object ────────────────────────────────────────────────────────
const Core = {
    init,
    getMap,
    /** Alias for getMap — returns the active IMapAdapter (used by POI, Route, GeoJSON modules). */
    getAdapter: getMap,
    setTheme,
    getTheme,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @fileoverview General utility functions for GeoLeaf
 */
function validateUrl$1(url, allowedProtocols = ["http:", "https:", "mailto:", "tel:"]) {
    if (!url || typeof url !== "string")
        return null;
    try {
        const parsed = new URL(url);
        if (!allowedProtocols.includes(parsed.protocol))
            return null;
        // For non-http(s) protocols that the security module doesn't handle,
        // return the normalized href after basic validation
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return parsed.href;
        }
        return validateUrl$2(url);
    }
    catch {
        return null;
    }
}
function deepMerge(target, source) {
    if (!source || typeof source !== "object")
        return target;
    if (!target || typeof target !== "object")
        return source;
    const DANGEROUS_KEYS = ["__proto__", "constructor", "prototype"];
    const output = Object.assign({}, target);
    Object.keys(source).forEach((key) => {
        if (DANGEROUS_KEYS.includes(key))
            return;
        const srcVal = source[key];
        if (srcVal && typeof srcVal === "object" && !Array.isArray(srcVal)) {
            output[key] = deepMerge(target[key] || {}, srcVal);
        }
        else {
            output[key] = srcVal;
        }
    });
    return output;
}
function ensureMap(explicitMap) {
    if (explicitMap)
        return explicitMap;
    if (Core && typeof Core.getMap === "function") {
        return Core.getMap();
    }
    return null;
}
function mergeOptions(defaults, override) {
    if (!override || typeof override !== "object")
        return defaults;
    return Object.assign({}, defaults, override);
}
function fireMapEvent(map, eventName, payload) {
    if (!map || typeof map.fire !== "function")
        return;
    try {
        map.fire(eventName, payload ?? {});
    }
    catch (err) {
        if (Log)
            Log.warn("[Utils] fireMapEvent error:", eventName, err);
    }
}
function debounce(func, wait = 250, immediate = false) {
    let timeout;
    return function debounced(...args) {
        const context = this;
        const later = () => {
            timeout = undefined;
            if (!immediate)
                func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
}
function throttle(func, limit = 100) {
    let lastRan;
    return function throttled(...args) {
        const context = this;
        const now = Date.now();
        if (!lastRan || now - lastRan >= limit) {
            func.apply(context, args);
            lastRan = now;
        }
    };
}
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function _traversePath(obj, path) {
    const keys = path.split(".");
    let value = obj;
    for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
            value = value[key];
        }
        else {
            value = null;
            break;
        }
    }
    if (value != null) {
        if (typeof value === "string") {
            if (value.trim())
                return value;
        }
        else {
            return value;
        }
    }
    return null;
}
function resolveField(obj, ...paths) {
    if (!obj || typeof obj !== "object")
        return "";
    for (const path of paths) {
        const result = _traversePath(obj, path);
        if (result != null)
            return result;
    }
    return "";
}
function compareByOrder(a, b, fallback = 999) {
    const orderA = typeof a.order === "number" ? a.order : fallback;
    const orderB = typeof b.order === "number" ? b.order : fallback;
    return orderA - orderB;
}
function getLog() {
    return Log;
}
function getActiveProfile() {
    const C = Config;
    if (C && typeof C.getActiveProfile === "function") {
        return C.getActiveProfile() ?? null;
    }
    return null;
}
const Utils = {
    validateUrl: validateUrl$1,
    deepMerge,
    ensureMap,
    mergeOptions,
    fireMapEvent,
    debounce,
    throttle,
    getDistance,
    resolveField,
    compareByOrder,
    getLog,
    getActiveProfile,
};

/**
 * @module GeoLeaf.Utils.DomHelpers
 * Helpers pour création et manipulation d'éléments DOM
 *
 * @version 1.2.0
 * @requires GeoLeaf.Security (pour sanitization)
 */
/**
 * Cr\u00e9e un \u00e9l\u00e9ment DOM avec propri\u00e9t\u00e9s et enfants de mani\u00e8re d\u00e9clarative
 */
function _applyDataset(element, dataAttrs) {
    if (!(dataAttrs && typeof dataAttrs === "object"))
        return;
    for (const [key, value] of Object.entries(dataAttrs))
        element.dataset[key] = value;
}
function _applyAttributes(element, attributes) {
    if (!(attributes && typeof attributes === "object"))
        return;
    for (const [key, value] of Object.entries(attributes))
        element.setAttribute(key, String(value));
}
function _applyBaseProps(element, props) {
    const { className, id, style, dataset: dataAttrs, attributes } = props;
    if (className)
        element.className = String(className);
    if (id)
        element.id = String(id);
    if (style && typeof style === "object")
        Object.assign(element.style, style);
    _applyDataset(element, dataAttrs);
    _applyAttributes(element, attributes);
}
function _applyOtherProp(element, key, value, events, eventContext, cleanupArray) {
    if (key.startsWith("on") && typeof value === "function") {
        const event = key.substring(2).toLowerCase();
        if (events) {
            const id = events.on(element, event, value, false, eventContext);
            if (cleanupArray &&
                Array.isArray(cleanupArray) &&
                typeof id === "number" &&
                events.off) {
                cleanupArray.push(() => events.off(id));
            }
        }
        else {
            element.addEventListener(event, value);
        }
    }
    else if (key.startsWith("aria")) {
        element.setAttribute("aria-" + key.substring(4).toLowerCase(), String(value));
    }
    else if (key in element) {
        element[key] = value;
    }
    else {
        element.setAttribute(key, String(value));
    }
}
function _applyContent(element, textContent, innerHTML, children) {
    if (textContent !== undefined) {
        element.textContent = String(textContent);
        return;
    }
    if (innerHTML !== undefined) {
        if (Log?.warn) {
            Log.warn("[DomHelpers] createElement with innerHTML — content sanitized via DOMSecurity", { tag: element.tagName, innerHTML: String(innerHTML).substring(0, 100) });
        }
        const domSec = typeof GeoLeaf !== "undefined" ? GeoLeaf?.DOMSecurity : undefined;
        if (domSec?.setSafeHTML) {
            domSec.setSafeHTML(element, String(innerHTML));
        }
        else {
            element.textContent = String(innerHTML);
        }
        return;
    }
    appendChild(element, ...children);
}
function createElement$1(tag, props = {}, ...children) {
    if (typeof tag !== "string" || !tag.trim()) {
        throw new TypeError("[DomHelpers] createElement: tag must be a non-empty string");
    }
    const element = document.createElement(tag);
    const { textContent, innerHTML, _eventContext, _cleanupArray, ...otherProps } = props;
    _applyBaseProps(element, props);
    const events = typeof GeoLeaf !== "undefined" ? GeoLeaf.Utils?.events : undefined;
    const evCtx = _eventContext ? _eventContext : "DomHelpers.createElement";
    for (const [key, value] of Object.entries(otherProps)) {
        if (!["className", "id", "style", "dataset", "attributes"].includes(key)) {
            _applyOtherProp(element, key, value, events, evCtx, _cleanupArray);
        }
    }
    _applyContent(element, textContent, innerHTML, children);
    return element;
}
/**
 * Adds des enfants à un élément parent
 */
function appendChild(parent, ...children) {
    for (const child of children) {
        if (child == null || child === false)
            continue;
        if (Array.isArray(child)) {
            appendChild(parent, ...child);
        }
        else if (typeof child === "string" || typeof child === "number") {
            parent.appendChild(document.createTextNode(String(child)));
        }
        else if (child instanceof Node) {
            parent.appendChild(child);
        }
        else {
            parent.appendChild(document.createTextNode(String(child)));
        }
    }
    return parent;
}
function domCreate(tag, className, parent) {
    const el = document.createElement(tag);
    if (className)
        el.className = className;
    if (parent)
        parent.appendChild(el);
    return el;
}

/**
 * @fileoverview Animation Helper - 60 FPS Animation Manager
 * @version 1.2.0
 */
const _TRANSFORM_PROPS = new Set([
    "translateX",
    "translateY",
    "translateZ",
    "scale",
    "scaleX",
    "scaleY",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "skewX",
    "skewY",
]);
const _EASINGS = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => --t * t * t + 1,
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - --t * t * t * t,
    easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
};
class AnimationHelper {
    _animations = new Map();
    _rafId = null;
    _lastFrameTime = 0;
    _fpsHistory = [];
    _debug = false;
    _nextId = 1;
    _elementAnimations = new WeakMap();
    _stats = { totalFrames: 0, droppedFrames: 0, averageFPS: 0 };
    constructor() {
        this._tick = this._tick.bind(this);
    }
    setDebug(enabled) {
        this._debug = enabled;
        if (enabled && !this._rafId)
            this._startLoop();
    }
    getStats() {
        return {
            ...this._stats,
            activeAnimations: this._animations.size,
            currentFPS: this._getCurrentFPS(),
        };
    }
    animate(element, options = {}) {
        if (!element || !(element instanceof HTMLElement)) {
            this._log("warn", "animate: invalid element", element);
            return null;
        }
        const { from = {}, to = {}, duration = 300, easing = "easeOutCubic", onComplete = null, onUpdate = null, } = options;
        const id = this._nextId++;
        const startTime = performance.now();
        const easingFn = this._getEasingFunction(easing);
        this._optimizeElement(element, to);
        this._trackElementAnimation(element, id);
        const animationFn = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFn(progress);
            this._applyTransform(element, from, to, easedProgress);
            if (onUpdate)
                onUpdate(easedProgress);
            if (progress >= 1) {
                this._animations.delete(id);
                this._untrackElementAnimation(element, id);
                this._cleanupElement(element);
                if (onComplete)
                    onComplete();
                this._log("debug", `Animation ${id} completed`);
                return false;
            }
            return true;
        };
        this._animations.set(id, animationFn);
        this._startLoop();
        this._log("debug", `Animation ${id} started`, { duration, easing });
        return id;
    }
    fadeIn(element, duration = 300, onComplete) {
        if (element.style.display === "none")
            element.style.display = "block";
        return this.animate(element, {
            from: { opacity: 0 },
            to: { opacity: 1 },
            duration,
            easing: "easeOutCubic",
            onComplete,
        });
    }
    fadeOut(element, duration = 300, onComplete) {
        return this.animate(element, {
            from: { opacity: 1 },
            to: { opacity: 0 },
            duration,
            easing: "easeOutCubic",
            onComplete: () => {
                element.style.display = "none";
                if (onComplete)
                    onComplete();
            },
        });
    }
    slideIn(element, duration = 300, onComplete) {
        element.style.display = element.style.display || "block";
        return this.animate(element, {
            from: { opacity: 0, translateY: -20 },
            to: { opacity: 1, translateY: 0 },
            duration,
            easing: "easeOutBack",
            onComplete,
        });
    }
    slideOut(element, duration = 300, onComplete) {
        return this.animate(element, {
            from: { opacity: 1, translateY: 0 },
            to: { opacity: 0, translateY: -20 },
            duration,
            easing: "easeInCubic",
            onComplete: () => {
                element.style.display = "none";
                if (onComplete)
                    onComplete();
            },
        });
    }
    cancel(id) {
        const existed = this._animations.has(id);
        if (existed) {
            this._animations.delete(id);
            this._log("debug", `Animation ${id} cancelled`);
        }
        return existed;
    }
    cancelForElement(element) {
        const ids = this._elementAnimations.get(element);
        if (!ids)
            return 0;
        let count = 0;
        ids.forEach((id) => {
            if (this._animations.delete(id))
                count++;
        });
        this._elementAnimations.delete(element);
        this._cleanupElement(element);
        this._log("debug", `Cancelled ${count} animations for element`);
        return count;
    }
    cancelAll() {
        const count = this._animations.size;
        this._animations.clear();
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._log("info", `Cancelled all ${count} animations`);
    }
    nextFrame() {
        return new Promise((resolve) => requestAnimationFrame(resolve));
    }
    batch(animations) {
        if (!Array.isArray(animations))
            return;
        requestAnimationFrame(() => {
            animations.forEach((fn) => {
                if (typeof fn === "function") {
                    try {
                        fn();
                    }
                    catch (error) {
                        this._log("error", "Batch animation error:", error);
                    }
                }
            });
        });
    }
    _tick(currentTime) {
        if (this._lastFrameTime) {
            const delta = currentTime - this._lastFrameTime;
            const fps = 1000 / delta;
            this._updateFPS(fps);
            if (fps < 50)
                this._stats.droppedFrames++;
        }
        this._lastFrameTime = currentTime;
        this._stats.totalFrames++;
        const toRemove = [];
        this._animations.forEach((animationFn, id) => {
            try {
                if (!animationFn(currentTime))
                    toRemove.push(id);
            }
            catch (error) {
                this._log("error", `Animation ${id} error:`, error);
                toRemove.push(id);
            }
        });
        toRemove.forEach((id) => this._animations.delete(id));
        if (this._animations.size > 0 || this._debug) {
            this._rafId = requestAnimationFrame(this._tick);
        }
        else {
            this._rafId = null;
        }
    }
    _startLoop() {
        if (!this._rafId)
            this._rafId = requestAnimationFrame(this._tick);
    }
    _applyTransform(element, from, to, progress) {
        const transforms = [];
        const styles = {};
        Object.keys(to).forEach((key) => {
            const startValue = from[key] !== undefined ? from[key] : this._getDefaultValue(key);
            const endValue = to[key];
            const currentValue = this._interpolate(startValue, endValue, progress);
            if (_TRANSFORM_PROPS.has(key)) {
                transforms.push(this._formatTransform(key, currentValue));
            }
            else {
                styles[key] = this._formatValue(key, currentValue);
            }
        });
        if (transforms.length > 0)
            element.style.transform = transforms.join(" ");
        Object.assign(element.style, styles);
    }
    _interpolate(start, end, progress) {
        return start + (end - start) * progress;
    }
    _formatTransform(key, value) {
        if (key.includes("translate"))
            return `${key}(${value}px)`;
        if (key.includes("rotate") || key.includes("skew"))
            return `${key}(${value}deg)`;
        return `${key}(${value})`;
    }
    _formatValue(key, value) {
        if (key === "opacity")
            return value.toString();
        return `${value}px`;
    }
    _getDefaultValue(key) {
        if (key === "opacity")
            return 1;
        if (key === "scale" || key === "scaleX" || key === "scaleY")
            return 1;
        return 0;
    }
    _optimizeElement(element, properties) {
        const willChange = [];
        Object.keys(properties).forEach((key) => {
            if (_TRANSFORM_PROPS.has(key)) {
                if (!willChange.includes("transform"))
                    willChange.push("transform");
            }
            else {
                willChange.push(key);
            }
        });
        if (willChange.length > 0)
            element.style.willChange = willChange.join(", ");
    }
    _cleanupElement(element) {
        element.style.willChange = "auto";
    }
    _trackElementAnimation(element, id) {
        let ids = this._elementAnimations.get(element);
        if (!ids) {
            ids = new Set();
            this._elementAnimations.set(element, ids);
        }
        ids.add(id);
    }
    _untrackElementAnimation(element, id) {
        const ids = this._elementAnimations.get(element);
        if (ids) {
            ids.delete(id);
            if (ids.size === 0)
                this._elementAnimations.delete(element);
        }
    }
    _getEasingFunction(name) {
        return _EASINGS[name] ?? _EASINGS.easeOutCubic;
    }
    _updateFPS(fps) {
        this._fpsHistory.push(fps);
        if (this._fpsHistory.length > 60)
            this._fpsHistory.shift();
        const sum = this._fpsHistory.reduce((a, b) => a + b, 0);
        this._stats.averageFPS = Math.round(sum / this._fpsHistory.length);
    }
    _getCurrentFPS() {
        if (this._fpsHistory.length === 0)
            return 0;
        return Math.round(this._fpsHistory[this._fpsHistory.length - 1]);
    }
    _log(level, ...args) {
        if (!this._debug && level === "debug")
            return;
        const log = (Log ?? console);
        if (typeof log[level] === "function")
            log[level]("[AnimationHelper]", ...args);
    }
}
let _animationHelperInstance = null;
function getAnimationHelper() {
    if (!_animationHelperInstance)
        _animationHelperInstance = new AnimationHelper();
    return _animationHelperInstance;
}

/**
 * GeoLeaf Error Logger
 *
 * Centralised error logging for consistent error reporting across all modules.
 * Replaces 60+ LOC of repetitive logging patterns with unified interface.
 *
 * @module GeoLeaf.Utils.ErrorLogger
 * @version 1.2.0
 */
const ErrorLogger = {
    LEVELS: {
        ERROR: "error",
        WARN: "warn",
        INFO: "info",
        DEBUG: "debug",
    },
    error(module, message, error) {
        const fullMessage = `[${module}] ${message}`;
        if (Log && typeof Log.error === "function") {
            Log.error(fullMessage, error);
            if (error && typeof error === "object" && error !== null && "stack" in error) {
                Log.error(`  Stack: ${error.stack}`);
            }
        }
    },
    warn(module, message) {
        const fullMessage = `[${module}] ${message}`;
        if (Log && typeof Log.warn === "function") {
            Log.warn(fullMessage);
        }
    },
    info(module, message) {
        const fullMessage = `[${module}] ${message}`;
        if (Log && typeof Log.info === "function") {
            Log.info(fullMessage);
        }
    },
    debug(module, message) {
        const fullMessage = `[${module}] ${message}`;
        if (Log && typeof Log.debug === "function") {
            Log.debug(fullMessage);
        }
        else {
            console.debug(fullMessage); // eslint-disable-line no-console
        }
    },
    quotaError(module, available, needed) {
        const availableGB = (available / 1024 / 1024 / 1024).toFixed(2);
        const neededGB = (needed / 1024 / 1024 / 1024).toFixed(2);
        const shortageGB = ((needed - available) / 1024 / 1024 / 1024).toFixed(2);
        const message = `QUOTA EXCEEDED - Available: ${availableGB}GB, Needed: ${neededGB}GB, Shortage: ${shortageGB}GB`;
        this.error(module, message);
    },
    networkError(module, url, status, error) {
        const message = `Network error [${status}] - ${url}`;
        this.error(module, message, error);
    },
    validationError(module, field, expectedFormat) {
        const message = `Validation error - ${field} (expected: ${expectedFormat})`;
        this.warn(module, message);
    },
    idbError(module, operation, error) {
        const message = `IndexedDB error (${operation})`;
        this.error(module, message, error);
    },
    performance(module, operation, milliseconds) {
        const message = `${operation} completed in ${milliseconds}ms`;
        this.info(module, message);
    },
    memoryWarning(module, usedMB) {
        const message = `⚠️ High memory usage: ${usedMB}MB`;
        this.warn(module, message);
    },
    operation(module, operation) {
        const startTime = performance.now();
        const self = this;
        return {
            success(result) {
                const duration = performance.now() - startTime;
                self.info(module, `${operation} succeeded (${duration.toFixed(0)}ms)`);
                return result;
            },
            error(error) {
                const duration = performance.now() - startTime;
                self.error(module, `${operation} failed (${duration.toFixed(0)}ms)`, error);
                throw error;
            },
            warn(warning) {
                const duration = performance.now() - startTime;
                self.warn(module, `${operation} warning (${duration.toFixed(0)}ms): ${warning}`);
            },
        };
    },
};
if (Log) {
    Log.debug("[ErrorLogger] Module loaded");
}

/**
 * @fileoverview Event Helpers - Utilities for custom event dispatching
 * @module utils/event-helpers
 */
/**
 * @namespace EventHelpers
 * @memberof GeoLeaf.Utils
 */
const EventHelpers = {
    dispatchCustomEvent(eventName, detail = {}, options = {}) {
        const { bubbles = true, cancelable = true, target = document } = options;
        try {
            const event = new CustomEvent(eventName, {
                detail,
                bubbles,
                cancelable,
            });
            target.dispatchEvent(event);
            return true;
        }
        catch (error) {
            if (Log.error) {
                Log.error(`[EventHelpers] Failed to dispatch event '${eventName}':`, error);
            }
            return false;
        }
    },
    dispatchMapEvent(map, eventName, detail = {}) {
        if (!map || typeof map.fire !== "function") {
            if (Log.warn) {
                Log.warn(`[EventHelpers] Invalid map instance, cannot fire '${eventName}'`);
            }
            return false;
        }
        try {
            map.fire(eventName, detail);
            return true;
        }
        catch (error) {
            if (Log.error) {
                Log.error(`[EventHelpers] Failed to fire map event '${eventName}':`, error);
            }
            return false;
        }
    },
    dispatchBoth(eventName, detail = {}, map = null) {
        const fullEventName = eventName.startsWith("geoleaf:") ? eventName : `geoleaf:${eventName}`;
        const results = {
            document: false,
            map: false,
        };
        results.document = this.dispatchCustomEvent(fullEventName, detail);
        if (map) {
            results.map = this.dispatchMapEvent(map, fullEventName, detail);
        }
        return results;
    },
    addEventListener(target, eventName, handler, options = {}) {
        if (!target || typeof target.addEventListener !== "function") {
            if (Log.warn) {
                Log.warn(`[EventHelpers] Invalid target for addEventListener '${eventName}'`);
            }
            return () => { };
        }
        target.addEventListener(eventName, handler, options);
        return () => {
            try {
                target.removeEventListener(eventName, handler, options);
            }
            catch (error) {
                if (Log.error) {
                    Log.error(`[EventHelpers] Failed to remove listener '${eventName}':`, error);
                }
            }
        };
    },
    addEventListeners(listeners = []) {
        const cleanups = listeners.map(({ target, event, handler, options }) => {
            return this.addEventListener(target, event, handler, options ?? {});
        });
        return () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    },
    /** UI-event debounce (default 300 ms). For general-purpose debouncing use {@link Utils.debounce} (250 ms default). */
    debounce(func, wait = 300, immediate = false) {
        let timeout;
        return function debounced(...args) {
            const context = this;
            const later = () => {
                timeout = undefined;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    },
    throttle(func, limit = 300) {
        let lastRan;
        return function throttled(...args) {
            const context = this;
            const now = Date.now();
            if (!lastRan) {
                func.apply(context, args);
                lastRan = now;
            }
            else {
                if (now - lastRan >= limit) {
                    func.apply(context, args);
                    lastRan = now;
                }
            }
        };
    },
};

/**
 * @fileoverview EventListnerManager - Gestion centralizede des event listners
 * @module GeoLeaf.Utils.EventListnerManager
 */
function _detachListener(listener) {
    if (listener.type === "emitter") {
        const t = listener.target;
        if (t && typeof t.off === "function") {
            t.off(listener.event, listener.handler);
        }
    }
    else {
        const t = listener.target;
        if (t && typeof t.removeEventListener === "function") {
            t.removeEventListener(listener.event, listener.handler, listener.options);
        }
    }
}
class EventListenerManager {
    name;
    listeners;
    _nextId;
    constructor(name = "default") {
        this.name = name;
        this.listeners = [];
        this._nextId = 1;
    }
    addEventListener(target, event, handler, options = false, label = "") {
        if (!target || typeof target.addEventListener !== "function") {
            Log.warn(`[EventListenerManager.${this.name}] Invalid target for addEventListener`);
            return null;
        }
        const id = this._nextId++;
        target.addEventListener(event, handler, options);
        this.listeners.push({
            id,
            target,
            event,
            handler,
            options: options === false ? undefined : options,
            label,
            createdAt: Date.now(),
        });
        Log.debug(`[EventListenerManager.${this.name}] Listener added:`, id, event, label);
        return id;
    }
    addEmitterListener(target, event, handler, label = "") {
        if (!target || typeof target.on !== "function") {
            Log.warn(`[EventListenerManager.${this.name}] Invalid emitter target`);
            return null;
        }
        const id = this._nextId++;
        target.on(event, handler);
        this.listeners.push({
            id,
            target,
            event,
            handler,
            label,
            type: "emitter",
            createdAt: Date.now(),
        });
        Log.debug(`[EventListenerManager.${this.name}] Emitter listener added:`, id, event, label);
        return id;
    }
    removeListener(id) {
        const index = this.listeners.findIndex((l) => l.id === id);
        if (index === -1)
            return false;
        const listener = this.listeners[index];
        _detachListener(listener);
        this.listeners.splice(index, 1);
        Log.debug(`[EventListenerManager.${this.name}] Listener removed:`, id, listener.label);
        return true;
    }
    removeListenersForTarget(target) {
        const matchingListeners = this.listeners.filter((l) => l.target === target);
        matchingListeners.forEach(_detachListener);
        this.listeners = this.listeners.filter((l) => l.target !== target);
        if (matchingListeners.length > 0) {
            Log.info(`[EventListenerManager.${this.name}] Removed ${matchingListeners.length} listener(s) for target`);
        }
        return matchingListeners.length;
    }
    removeAll() {
        const count = this.listeners.length;
        this.listeners.forEach((listener) => {
            try {
                _detachListener(listener);
            }
            catch (error) {
                Log.warn(`[EventListenerManager.${this.name}] Error removing listener:`, error);
            }
        });
        this.listeners = [];
        if (count > 0) {
            Log.info(`[EventListenerManager.${this.name}] Removed ${count} listener(s)`);
        }
    }
    getCount() {
        return this.listeners.length;
    }
    listActiveListeners() {
        return this.listeners.map((l) => ({
            id: l.id,
            event: l.event,
            label: l.label,
            type: l.type ?? "dom",
            age: Date.now() - l.createdAt,
        }));
    }
    destroy() {
        this.removeAll();
        Log.info(`[EventListenerManager.${this.name}] Destroyed`);
    }
}
const globalEventManager = new EventListenerManager("global");
if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        const count = globalEventManager.getCount();
        if (count > 0) {
            Log.warn(`[EventListenerManager] ${count} listener(s) still active at page unload`);
            globalEventManager.removeAll();
        }
    });
}
const events = {
    on: (target, event, handler, options, label) => globalEventManager.addEventListener(target, event, handler, options ?? false, label ?? ""),
    onEmitter: (target, event, handler, label) => globalEventManager.addEmitterListener(target, event, handler, label ?? ""),
    off: (id) => globalEventManager.removeListener(id),
    offTarget: (target) => globalEventManager.removeListenersForTarget(target),
    offAll: () => globalEventManager.removeAll(),
    getCount: () => globalEventManager.getCount(),
    listActive: () => globalEventManager.listActiveListeners(),
    createManager: (name) => new EventListenerManager(name),
};

/**
 * GeoLeaf - Event Bus lightweight (pub/sub)
 * @module utils/event-bus
 */
function createEventBus() {
    const _listeners = new Map();
    function on(event, handler) {
        if (!_listeners.has(event))
            _listeners.set(event, new Set());
        _listeners.get(event).add(handler);
        return () => off(event, handler);
    }
    function off(event, handler) {
        const handlers = _listeners.get(event);
        if (handlers)
            handlers.delete(handler);
    }
    function emit(event, data) {
        const handlers = _listeners.get(event);
        if (!handlers)
            return;
        handlers.forEach((h) => {
            try {
                h(data);
            }
            catch {
                // isolation des errors
            }
        });
    }
    function once(event, handler) {
        const wrapper = (data) => {
            off(event, wrapper);
            handler(data);
        };
        return on(event, wrapper);
    }
    function clear(event) {
        if (event) {
            _listeners.delete(event);
        }
        else {
            _listeners.clear();
        }
    }
    return { on, off, emit, once, clear };
}
const bus = createEventBus();

/**
 * @fileoverview FetchHelper - Unified HTTP clinkt with timeout, retry, and cache strategies
 * @module GeoLeaf.Utils.FetchHelper
 * @version 1.2.0
 */
const FETCH_DEFAULTS = {
    timeout: 10000,
    retries: 2,
    retryDelay: 1000,
    retryDelayMultiplier: 1.5,
    maxPerDomain: 50,
    windowMs: 10000,
};
const DEFAULT_CONFIG$2 = {
    timeout: FETCH_DEFAULTS.timeout,
    retries: FETCH_DEFAULTS.retries,
    retryDelay: FETCH_DEFAULTS.retryDelay,
    retryDelayMultiplier: FETCH_DEFAULTS.retryDelayMultiplier,
    cache: "default",
    credentials: "same-origin",
    referrerPolicy: "strict-origin-when-cross-origin",
    parseResponse: true,
    throwOnError: true,
    validateUrl: true,
};
const _rateLimiter = {
    _requests: new Map(),
    maxPerDomain: FETCH_DEFAULTS.maxPerDomain,
    windowMs: FETCH_DEFAULTS.windowMs,
    allow(url) {
        let domain;
        try {
            domain = new URL(url, globalThis.location?.origin ??
                "https://localhost").hostname;
        }
        catch {
            domain = "_relative";
        }
        const now = Date.now();
        let timestamps = _rateLimiter._requests.get(domain) ?? [];
        timestamps = timestamps.filter((t) => now - t < _rateLimiter.windowMs);
        if (timestamps.length >= _rateLimiter.maxPerDomain)
            return false;
        timestamps.push(now);
        _rateLimiter._requests.set(domain, timestamps);
        return true;
    },
    reset() {
        _rateLimiter._requests.clear();
    },
};
class FetchError extends Error {
    url;
    attempts;
    type;
    cause;
    constructor(message, context = {}) {
        super(message);
        this.name = "FetchError";
        this.url = context.url;
        this.attempts = context.attempts;
        this.type = context.type ?? "unknown";
        this.cause = context.cause;
        if (typeof Error
            .captureStackTrace === "function") {
            Error.captureStackTrace(this, FetchError);
        }
    }
}
function _validateAndResolveUrl(url, config) {
    if (config.validateUrl && Security?.validateUrl) {
        try {
            return Security.validateUrl(url);
        }
        catch (error) {
            throw new FetchError(`URL validation failed: ${error.message}`, {
                url,
                cause: error,
                type: "validation_error",
            });
        }
    }
    return url;
}
function _throwFinalRetryError(url, config, error, attempt) {
    throw new FetchError(`Request failed after ${(config.retries ?? FETCH_DEFAULTS.retries) + 1} attempts: ${error.message}`, {
        url,
        attempts: attempt,
        cause: error,
        type: error.name === "AbortError" ? "timeout" : "network_error",
    });
}
async function _handleRetry(url, config, error, attempt) {
    if (attempt > (config.retries ?? FETCH_DEFAULTS.retries)) {
        _throwFinalRetryError(url, config, error, attempt);
    }
    const delay = (config.retryDelay ?? FETCH_DEFAULTS.retryDelay) *
        Math.pow(config.retryDelayMultiplier ?? FETCH_DEFAULTS.retryDelayMultiplier, attempt - 1);
    if (config.onRetry && typeof config.onRetry === "function") {
        try {
            config.onRetry(attempt, error, delay);
        }
        catch (callbackError) {
            Log.warn("[FetchHelper] onRetry callback failed:", callbackError);
        }
    }
    const retries = config.retries ?? FETCH_DEFAULTS.retries;
    if (Log)
        Log.warn(`[FetchHelper] Retry ${attempt}/${retries} for ${url} in ${delay}ms (${error.message})`);
    await new Promise((resolve) => setTimeout(resolve, delay));
}
const FetchHelper = {
    async fetch(url, options = {}) {
        const config = { ...DEFAULT_CONFIG$2, ...options };
        let attempt = 0;
        if (!_rateLimiter.allow(url)) {
            throw new FetchError("Rate limit exceeded for this domain", {
                url,
                type: "rate_limit_error",
            });
        }
        const resolvedUrl = _validateAndResolveUrl(url, config);
        const maxRetries = config.retries ?? FETCH_DEFAULTS.retries;
        while (attempt <= maxRetries) {
            try {
                const result = await this._executeRequest(resolvedUrl, config, attempt);
                if (Log && attempt > 0)
                    Log.info(`[FetchHelper] ✓ ${resolvedUrl} (succeeded after ${attempt} retries)`);
                return result;
            }
            catch (error) {
                attempt++;
                await _handleRetry(resolvedUrl, config, error, attempt);
            }
        }
        throw new FetchError("Unreachable");
    },
    async _executeRequest(url, config, attempt) {
        const timeoutMs = config.timeout ?? FETCH_DEFAULTS.timeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            if (config.onTimeout && typeof config.onTimeout === "function") {
                try {
                    config.onTimeout(url, timeoutMs, attempt);
                }
                catch (e) {
                    Log.warn("[FetchHelper] onTimeout callback failed:", e);
                }
            }
        }, timeoutMs);
        try {
            const fetchOptions = { ...config };
            delete fetchOptions.timeout;
            delete fetchOptions.retries;
            delete fetchOptions.retryDelay;
            delete fetchOptions.retryDelayMultiplier;
            delete fetchOptions.parseResponse;
            delete fetchOptions.throwOnError;
            delete fetchOptions.validateUrl;
            delete fetchOptions.onRetry;
            delete fetchOptions.onTimeout;
            fetchOptions.signal = controller.signal;
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);
            if (!response.ok && config.throwOnError) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            if (config.parseResponse && response.ok)
                return await this._parseResponse(response);
            return response;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
                throw new Error(`Request timed out after ${timeoutMs}ms`);
            }
            throw error;
        }
    },
    async _parseResponse(response) {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json"))
            return await response.json();
        if (contentType.includes("text/") || contentType.includes("application/javascript"))
            return await response.text();
        if (contentType.startsWith("image/") || contentType.includes("application/octet-stream"))
            return await response.blob();
        return await response.text();
    },
    async _delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async get(url, options = {}) {
        return this.fetch(url, { ...options, method: "GET" });
    },
    async post(url, data, options = {}) {
        return this.fetch(url, {
            ...options,
            method: "POST",
            headers: { "Content-Type": "application/json", ...options.headers },
            body: typeof data === "string" ? data : JSON.stringify(data),
        });
    },
    async head(url, options = {}) {
        return this.fetch(url, {
            ...options,
            method: "HEAD",
            parseResponse: false,
        });
    },
    async exists(url, options = {}) {
        try {
            const response = await this.head(url, { ...options, throwOnError: false });
            return response.ok;
        }
        catch (error) {
            Log.debug(`[FetchHelper] exists() failed for ${url}:`, error.message);
            return false;
        }
    },
    configure(config) {
        Object.assign(DEFAULT_CONFIG$2, config);
        Log.debug("[FetchHelper] Configuration updated:", DEFAULT_CONFIG$2);
    },
    getConfig() {
        return { ...DEFAULT_CONFIG$2 };
    },
    get _rateLimiter() {
        return _rateLimiter;
    },
};

/**

 * @module GeoLeaf.Utils.Formatters

 * Formatters pour dates, nombres, distances et autres values

 * @version 1.2.0

 */
const defaultConfig = {
    locale: "fr-FR"};
function formatNumber(value, options = {}) {
    const { locale = defaultConfig.locale, decimals = null, minDecimals = 0, maxDecimals = 2, } = options;
    if (value == null || isNaN(value))
        return "0";
    const formatOptions = {};
    if (decimals !== null) {
        formatOptions.minimumFractionDigits = decimals;
        formatOptions.maximumFractionDigits = decimals;
    }
    else {
        formatOptions.minimumFractionDigits = minDecimals;
        formatOptions.maximumFractionDigits = maxDecimals;
    }
    return value.toLocaleString(locale, formatOptions);
}
function formatFileSize(bytes, options = {}) {
    const { precision = 2, locale = defaultConfig.locale } = options;
    if (bytes == null || isNaN(bytes) || bytes === 0)
        return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const k = 1024;
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
    const value = bytes / Math.pow(k, i);
    const formatted = value.toLocaleString(locale, {
        minimumFractionDigits: i === 0 ? 0 : precision,
        maximumFractionDigits: i === 0 ? 0 : precision,
    });
    return `${formatted} ${units[i]}`;
}

/**















 * GeoLeaf File Validator Module















 * Security-focused file validation for uploads















 *















 * @module utils/file-validator















 * @version 1.2.0















 */
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const MAGIC_BYTES = [
    { signature: [0xff, 0xd8, 0xff], offset: 0, mime: "image/jpeg", extensions: ["jpg", "jpeg"] },
    {
        signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
        offset: 0,
        mime: "image/png",
        extensions: ["png"],
    },
    {
        signature: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
        offset: 0,
        mime: "image/gif",
        extensions: ["gif"],
    },
    {
        signature: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
        offset: 0,
        mime: "image/gif",
        extensions: ["gif"],
    },
    {
        signature: [0x52, 0x49, 0x46, 0x46],
        offset: 0,
        mime: "image/webp",
        extensions: ["webp"],
        extraCheck: (bytes) => bytes.length >= 12 &&
            bytes[8] === 0x57 &&
            bytes[9] === 0x45 &&
            bytes[10] === 0x42 &&
            bytes[11] === 0x50,
    },
    { signature: [0x42, 0x4d], offset: 0, mime: "image/bmp", extensions: ["bmp"] },
    {
        signature: [0x25, 0x50, 0x44, 0x46],
        offset: 0,
        mime: "application/pdf",
        extensions: ["pdf"],
    },
    {
        signature: [0x50, 0x4b, 0x03, 0x04],
        offset: 0,
        mime: "application/zip",
        extensions: ["zip", "kmz"],
    },
    {
        signature: [0x50, 0x4b, 0x05, 0x06],
        offset: 0,
        mime: "application/zip",
        extensions: ["zip", "kmz"],
    },
    {
        signature: [0x50, 0x4b, 0x07, 0x08],
        offset: 0,
        mime: "application/zip",
        extensions: ["zip", "kmz"],
    },
];
const ALLOWED_EXTENSIONS = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "svg",
    "geojson",
    "json",
    "kml",
    "gpx",
    "kmz",
    "topojson",
    "fgb",
    "pdf",
    "txt",
    "csv",
];
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/svg+xml",
    "application/json",
    "application/geo+json",
    "application/vnd.google-earth.kml+xml",
    "application/vnd.google-earth.kmz",
    "application/gpx+xml",
    "application/topojson+json",
    "application/octet-stream",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/zip",
];
function _validateFileNameSafety(file, result) {
    if (!file.name)
        return true;
    const dangerousPatterns = [/\.\./, /[/\\]/, /[\x00-\x1f]/, /^\.+$/];
    for (const pattern of dangerousPatterns) {
        if (pattern.test(file.name)) {
            result.error = "Filename contains dangerous characters (path traversal attempt?)";
            Log.warn("[FileValidator] Dangerous filename rejected:", file.name.substring(0, 50));
            return false;
        }
    }
    if (file.name.length > 255) {
        result.error = "Filename too long (max 255 characters)";
        return false;
    }
    return true;
}
function _validateFileBasics(file, extension, maxSize, allowedExtensions, allowedMimeTypes, result) {
    if (file.size > maxSize) {
        result.error = `File size exceeds maximum allowed`;
        Log.warn("[FileValidator] File too large:", result.error);
        return false;
    }
    if (file.size === 0) {
        result.error = "File is empty";
        return false;
    }
    if (!extension) {
        result.error = "File has no extension";
        return false;
    }
    if (!allowedExtensions.includes(extension.toLowerCase())) {
        result.error = `File extension '.${extension}' is not allowed. Allowed: ${allowedExtensions.join(", ")}`;
        Log.warn("[FileValidator] Invalid extension:", result.error);
        return false;
    }
    if (file.type && !allowedMimeTypes.includes(file.type)) {
        result.error = `MIME type '${file.type}' is not allowed`;
        Log.warn("[FileValidator] Invalid MIME type:", result.error);
        return false;
    }
    return true;
}
const FileValidator = {
    async _runMagicBytesCheck(file, extension, checkMagicBytes, result) {
        if (!checkMagicBytes && !this._needsMagicBytesCheck(extension))
            return true;
        const mbv = await this._validateMagicBytes(file, extension);
        if (!mbv.valid) {
            result.error = mbv.error ?? "Magic bytes validation failed";
            return false;
        }
        result.details.magicBytesMatch = mbv.matchedType;
        return true;
    },
    async _runTextContentCheck(file, extension, result) {
        if (!this._isTextFile(extension))
            return true;
        const tv = await this._validateTextFile(file, extension);
        if (!tv.valid) {
            result.error = tv.error ?? "Text file validation failed";
            return false;
        }
        return true;
    },
    async validateFile(file, options = {}) {
        const { maxSize = MAX_FILE_SIZE, allowedExtensions = ALLOWED_EXTENSIONS, allowedMimeTypes = ALLOWED_MIME_TYPES, checkMagicBytes = true, } = options;
        const extension = this._getFileExtension(file.name);
        const result = {
            valid: false,
            error: null,
            details: {
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                extension: extension ?? "",
            },
        };
        try {
            if (!file) {
                result.error = "No file provided";
                return result;
            }
            if (!_validateFileNameSafety(file, result))
                return result;
            if (!_validateFileBasics(file, extension, maxSize, allowedExtensions, allowedMimeTypes, result))
                return result;
            if (!(await this._runMagicBytesCheck(file, extension, checkMagicBytes, result)))
                return result;
            if (!(await this._runTextContentCheck(file, extension, result)))
                return result;
            result.valid = true;
            Log.info("[FileValidator] File validation successful:", file.name);
            return result;
        }
        catch (error) {
            result.error = `Validation error: ${error.message}`;
            Log.error("[FileValidator] Validation exception:", error);
            return result;
        }
    },
    async _validateMagicBytes(file, extension) {
        try {
            const headerBytes = await this._readFileBytes(file, 0, 32);
            const matches = MAGIC_BYTES.filter((magic) => {
                if (!magic.extensions.includes(extension.toLowerCase()))
                    return false;
                for (let i = 0; i < magic.signature.length; i++) {
                    if (headerBytes[magic.offset + i] !== magic.signature[i])
                        return false;
                }
                if (magic.extraCheck && !magic.extraCheck(Array.from(headerBytes)))
                    return false;
                return true;
            });
            if (matches.length === 0) {
                return {
                    valid: false,
                    error: `File signature does not match extension '.${extension}'. File may be corrupted or renamed.`,
                };
            }
            return { valid: true, matchedType: matches[0].mime };
        }
        catch (error) {
            return {
                valid: false,
                error: `Error reading file signature: ${error.message}`,
            };
        }
    },
    async _validateTextFile(file, extension) {
        try {
            const text = await this._readFileAsText(file, 1024 * 1024);
            if (extension === "json" || extension === "geojson") {
                try {
                    JSON.parse(text);
                    return { valid: true };
                }
                catch (e) {
                    return { valid: false, error: `Invalid JSON: ${e.message}` };
                }
            }
            if (extension === "kml" || extension === "gpx" || extension === "svg") {
                if (!text.trim().startsWith("<?xml") && !text.trim().startsWith("<")) {
                    return {
                        valid: false,
                        error: "Invalid XML: File does not start with XML declaration or tag",
                    };
                }
            }
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                error: `Error reading text file: ${error.message}`,
            };
        }
    },
    _readFileBytes(file, start, length) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const blob = file.slice(start, start + length);
            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                resolve(new Uint8Array(arrayBuffer));
            };
            reader.onerror = () => reject(new Error("Failed to read file bytes"));
            reader.readAsArrayBuffer(blob);
        });
    },
    _readFileAsText(file, maxLength = null) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const blob = maxLength ? file.slice(0, maxLength) : file;
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error("Failed to read file as text"));
            reader.readAsText(blob);
        });
    },
    _getFileExtension(filename) {
        if (!filename || typeof filename !== "string")
            return "";
        const parts = filename.split(".");
        return parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
    },
    _needsMagicBytesCheck(extension) {
        const ext = extension.toLowerCase();
        const binaryExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "pdf"];
        return binaryExtensions.includes(ext);
    },
    _isTextFile(extension) {
        const ext = extension.toLowerCase();
        const textExtensions = ["json", "geojson", "kml", "gpx", "svg", "txt", "csv"];
        return textExtensions.includes(ext);
    },
    _formatBytes(bytes) {
        return formatFileSize(bytes, { precision: 2 });
    },
    getConfig() {
        return {
            maxFileSize: MAX_FILE_SIZE,
            allowedExtensions: [...ALLOWED_EXTENSIONS],
            allowedMimeTypes: [...ALLOWED_MIME_TYPES],
            magicBytesSignatures: MAGIC_BYTES.map((m) => ({
                mime: m.mime,
                extensions: m.extensions,
            })),
        };
    },
};

/**
 * @fileoverview Map Helpers - Utilities for map instance management
 * @module utils/map-helpers
 */
const MapHelpers = {
    ensureMap(explicitMap) {
        if (explicitMap && typeof explicitMap === "object") {
            if (this._isMapInstance(explicitMap)) {
                return explicitMap;
            }
        }
        const CoreModule = Core;
        if (CoreModule?.getMap && typeof CoreModule.getMap === "function") {
            const coreMap = CoreModule.getMap();
            if (coreMap && this._isMapInstance(coreMap)) {
                return coreMap;
            }
        }
        return null;
    },
    requireMap(explicitMap, contextInfo = "Unknown") {
        const map = this.ensureMap(explicitMap);
        if (!map) {
            const sources = [];
            if (explicitMap !== null && explicitMap !== undefined)
                sources.push("explicit parameter");
            if (Core)
                sources.push("(Core module)");
            throw new Error(`[${contextInfo}] No map instance found. ` +
                `Tried: ${sources.length ? sources.join(", ") : "no sources available"}. ` +
                `Ensure map is initialized or passed as option.`);
        }
        return map;
    },
    _isMapInstance(obj) {
        if (!obj || typeof obj !== "object")
            return false;
        const o = obj;
        return (typeof o.getCenter === "function" &&
            typeof o.setView === "function" &&
            typeof o.getBounds === "function" &&
            typeof o.on === "function" &&
            typeof o.off === "function");
    },
    hasMap(explicitMap) {
        return this.ensureMap(explicitMap) !== null;
    },
    getMapDiagnostic(explicitMap) {
        const diagnostic = {
            map: null,
            found: false,
            source: "none",
            isValid: false,
        };
        if (explicitMap && typeof explicitMap === "object") {
            if (this._isMapInstance(explicitMap)) {
                diagnostic.map = explicitMap;
                diagnostic.found = true;
                diagnostic.source = "explicit";
                diagnostic.isValid = true;
                return diagnostic;
            }
        }
        const CoreModule = Core;
        if (CoreModule?.getMap && typeof CoreModule.getMap === "function") {
            const coreMap = CoreModule.getMap();
            if (coreMap && this._isMapInstance(coreMap)) {
                diagnostic.map = coreMap;
                diagnostic.found = true;
                diagnostic.source = "core";
                diagnostic.isValid = true;
                return diagnostic;
            }
        }
        return diagnostic;
    },
};

/**
 * GeoLeaf Performance Profiler – Baseline Storage
 * Pure storage helpers extracted from performance-profiler.js (Phase 8.2.5)
 *
 * @module utils/performance/baseline-storage
 */
const STORAGE_KEY = "geoleaf_performance_baseline";
/**
 * Loads the profile de baseline from the storage browser.
 * Returns the baseline ou null si absente / invalid.
 *
 * @param {'localStorage'|'sessionStorage'} storageType
 * @returns {Object|null}
 */
function loadBaselineFromStorage(storageType) {
    try {
        const storage = storageType === "localStorage" ? localStorage : sessionStorage;
        const saved = storage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    }
    catch (_) {
        // Storage non available ou data corrompues
    }
    return null;
}
/**
 * Sauvegarde the profile de baseline in the storage browser.
 *
 * @param {Object} baseline     - Object baseline to sauvegarder
 * @param {'localStorage'|'sessionStorage'} storageType
 */
function saveBaselineToStorage(baseline, storageType) {
    try {
        const storage = storageType === "localStorage" ? localStorage : sessionStorage;
        storage.setItem(STORAGE_KEY, JSON.stringify(baseline));
    }
    catch (_) {
        // Storage non available
    }
}

/**
 * GeoLeaf Performance Profiler – DevTools Export
 * Pure DevTools trace builder extracted from performance-profiler.js (Phase 8.2.5)
 *
 * @module utils/performance/devtools-export
 */
/**
 * Builds a object de trace Chrome DevTools (profile JSON) froms
 * marks and measures collected by `PerformanceProfiler`.
 *
 * Compatible avec l'tab Performance de Chrome DevTools:
 * `DevTools → Performance → Load Profile → selectionner le file JSON`
 *
 * @param {{ marks: Map<string, number>, measures: Map<string, number> }} data
 * @returns {{traceEvents: Array, metadata: Object}} Object de trace DevTools
 */
function buildDevToolsTrace({ marks, measures }) {
    const devToolsData = {
        traceEvents: [],
        metadata: {
            "cpu-family": 6,
            "cpu-model": 70,
            "cpu-stepping": 1,
            "field-name-mappings": {},
            "os-name": navigator.platform,
            "trace-capture-datetime": new Date().toISOString(),
            "user-agent": navigator.userAgent,
        },
    };
    // Convert marks → Instant trace events
    marks.forEach((timestamp, name) => {
        devToolsData.traceEvents.push({
            name,
            cat: "blink.user_timing",
            ph: "I", // Instant event
            ts: timestamp * 1000, // µs
            pid: 1,
            tid: 1,
        });
    });
    // Convert measures → Begin/End trace event pairs
    measures.forEach((duration, name) => {
        const startTime = performance.now() - duration;
        devToolsData.traceEvents.push({
            name,
            cat: "blink.user_timing",
            ph: "B", // Begin
            ts: startTime * 1000,
            pid: 1,
            tid: 1,
        }, {
            name,
            cat: "blink.user_timing",
            ph: "E", // End
            ts: (startTime + duration) * 1000,
            pid: 1,
            tid: 1,
        });
    });
    return devToolsData;
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module config/debug-flag
 * @description Centralized debug mode accessor.
 *
 * Phase 10-A: Extracts the `globalThis.GeoLeaf.DEBUG` lookup into a dedicated
 * utility so modules can declare the dependency explicitly rather than
 * reading the global namespace directly.
 *
 * NOTE: This still reads `globalThis.GeoLeaf.DEBUG` at call time to support
 * the use casee where end users set `window.GeoLeaf.DEBUG = true` after init.
 */
/**
 * Returns whether GeoLeaf debug mode is currently active.
 * Reads the runtime flag set by end users via `window.GeoLeaf.DEBUG = true`.
 */
function getDebugMode() {
    const g = globalThis;
    return g.GeoLeaf?.DEBUG === true;
}

/**
 * @fileoverview GeoLeaf Performance Profiler
 * @version 1.2.0
 */
const _RE_IMAGE_EXT = /\.(jpg|jpeg|png|gif|svg|webp)$/i;
const DEFAULT_CONFIG$1 = {
    monitoring: {
        enabled: false,
        interval: 5000,
        maxDataPoints: 60,
    },
    memory: {
        enabled: true,
        threshold: 200 * 1024 * 1024,
        leakDetection: true,
    },
    marks: {
        enabled: true,
        autoMark: ["init", "ready", "firstLoad"],
    },
    baseline: {
        enabled: true,
        storage: "sessionStorage",
    },
};
const performanceData = {
    marks: new Map(),
    measures: new Map(),
    memory: [],
    baseline: null,
};
class PerformanceProfiler {
    config;
    monitoringInterval = null;
    baselineEstablished = false;
    constructor(config = {}) {
        this.config = this._mergeConfig(DEFAULT_CONFIG$1, config);
    }
    init() {
        this.config.monitoring.enabled = this._isDevelopmentMode();
        this._initPerformanceObserver();
        this._loadBaseline();
        if (this.config.monitoring.enabled)
            this._startMonitoring();
        if (Log)
            Log.info("[GeoLeaf.Utils.PerformanceProfiler] Performance profiler initialized");
    }
    startMonitoring() {
        if (this.monitoringInterval)
            this.stopMonitoring();
        this._startMonitoring();
        if (Log)
            Log.info("[PerformanceProfiler] Monitoring started");
    }
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            if (Log)
                Log.info("[PerformanceProfiler] Monitoring stopped");
        }
    }
    mark(name) {
        if (!this.config.marks.enabled)
            return;
        const timestamp = performance.now();
        try {
            performance.mark(name);
            performanceData.marks.set(name, timestamp);
            if (Log)
                Log.debug(`[PerformanceProfiler] Mark: ${name} at ${timestamp.toFixed(2)}ms`);
        }
        catch (error) {
            if (Log)
                Log.warn(`[PerformanceProfiler] Failed to create mark ${name}:`, error);
        }
    }
    measure(name, startMark, endMark) {
        try {
            performance.measure(name, startMark, endMark ?? undefined);
            const entries = performance.getEntriesByName(name, "measure");
            const latestEntry = entries[entries.length - 1];
            const duration = latestEntry ? latestEntry.duration : 0;
            performanceData.measures.set(name, duration);
            if (Log)
                Log.debug(`[PerformanceProfiler] Measure: ${name} = ${duration.toFixed(2)}ms`);
            return duration;
        }
        catch (error) {
            if (Log)
                Log.warn(`[PerformanceProfiler] Failed to create measure ${name}:`, error);
            return 0;
        }
    }
    getMemoryUsage() {
        const memory = {
            timestamp: performance.now(),
            used: 0,
            total: 0,
            available: 0,
        };
        try {
            const perf = performance;
            if (perf.memory) {
                memory.used = perf.memory.usedJSHeapSize;
                memory.total = perf.memory.totalJSHeapSize;
                memory.available = perf.memory.jsHeapSizeLimit;
            }
        }
        catch {
            // Memory API not available
        }
        return memory;
    }
    analyzeMemoryLeaks() {
        if (performanceData.memory.length < 10)
            return { status: "insufficient_data" };
        const recentData = performanceData.memory.slice(-30);
        const firstUsed = recentData[0].used;
        const lastUsed = recentData[recentData.length - 1].used;
        const growthRate = (lastUsed - firstUsed) / firstUsed;
        const analysis = {
            status: "normal",
            growthRate,
            memoryTrend: lastUsed > firstUsed ? "increasing" : "decreasing",
            recommendation: "No action needed",
        };
        if (growthRate > 0.2) {
            analysis.status = "warning";
            analysis.recommendation = "Monitor memory usage - potential leak detected";
        }
        if (growthRate > 0.5) {
            analysis.status = "critical";
            analysis.recommendation = "Investigate memory leak - significant growth detected";
        }
        return analysis;
    }
    generateReport() {
        const currentMemory = this.getMemoryUsage();
        const memoryAnalysis = this.analyzeMemoryLeaks();
        return {
            timestamp: new Date().toISOString(),
            session: {
                duration: performance.now(),
                marks: Object.fromEntries(performanceData.marks),
                measures: Object.fromEntries(performanceData.measures),
            },
            memory: {
                current: currentMemory,
                peak: this._getPeakMemory(),
                analysis: memoryAnalysis,
                history: performanceData.memory.slice(-10),
            },
            performance: {
                navigation: this._getNavigationTiming(),
                paint: this._getPaintTiming(),
                resources: this._getResourceTiming(),
                longTasks: this._getLongTasks(),
            },
            baseline: this._compareWithBaseline(),
            recommendations: this._generateRecommendations(),
        };
    }
    establishBaseline() {
        const baseline = {
            timestamp: new Date().toISOString(),
            navigation: this._getNavigationTiming(),
            paint: this._getPaintTiming(),
            memory: this.getMemoryUsage(),
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
            viewport: typeof window !== "undefined"
                ? { width: window.innerWidth, height: window.innerHeight }
                : {},
        };
        performanceData.baseline = baseline;
        this.baselineEstablished = true;
        if (this.config.baseline.enabled)
            this._saveBaseline(baseline);
        if (Log)
            Log.info("[PerformanceProfiler] Performance baseline established");
        return baseline;
    }
    exportForDevTools() {
        return buildDevToolsTrace(performanceData);
    }
    _initPerformanceObserver() {
        if (typeof window === "undefined" || !("PerformanceObserver" in window))
            return;
        try {
            const observer = new PerformanceObserver((list) => {
                this._processPerformanceEntries(list.getEntries());
            });
            observer.observe({
                entryTypes: ["navigation", "paint", "measure", "mark", "longtask"],
            });
        }
        catch (error) {
            if (Log)
                Log.warn("[PerformanceProfiler] PerformanceObserver initialization failed:", error);
        }
    }
    _processPerformanceEntries(entries) {
        entries.forEach((entry) => {
            switch (entry.entryType) {
                case "longtask":
                    if (Log)
                        Log.warn(`[PerformanceProfiler] Long task detected: ${entry.duration?.toFixed(2)}ms`);
                    break;
                case "measure":
                    performanceData.measures.set(entry.name, entry.duration);
                    break;
                case "mark":
                    performanceData.marks.set(entry.name, entry.startTime);
                    break;
            }
        });
    }
    _startMonitoring() {
        this.monitoringInterval = setInterval(() => this._collectPerformanceData(), this.config.monitoring.interval);
    }
    _collectPerformanceData() {
        const memory = this.getMemoryUsage();
        performanceData.memory.push(memory);
        if (performanceData.memory.length > this.config.monitoring.maxDataPoints)
            performanceData.memory.shift();
        if (this.config.memory.enabled && memory.used > this.config.memory.threshold) {
            if (Log)
                Log.warn(`[PerformanceProfiler] Memory usage high: ${(memory.used / 1024 / 1024).toFixed(2)}MB`);
        }
    }
    _getNavigationTiming() {
        try {
            const timing = performance.getEntriesByType("navigation")[0];
            if (!timing)
                return null;
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
                load: timing.loadEventEnd - timing.loadEventStart,
                domComplete: timing.domComplete - timing.startTime,
                firstByte: timing.responseStart - timing.requestStart,
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
            };
        }
        catch {
            return null;
        }
    }
    _getPaintTiming() {
        try {
            const paintEntries = performance.getEntriesByType("paint");
            const result = {};
            paintEntries.forEach((entry) => {
                result[entry.name] = entry.startTime;
            });
            return result;
        }
        catch {
            return {};
        }
    }
    _getResourceTiming() {
        try {
            const resources = performance.getEntriesByType("resource");
            const summary = {
                total: resources.length,
                scripts: 0,
                stylesheets: 0,
                images: 0,
                totalSize: 0,
                totalDuration: 0,
            };
            resources.forEach((resource) => {
                if (resource.name.includes(".js"))
                    summary.scripts++;
                else if (resource.name.includes(".css"))
                    summary.stylesheets++;
                else if (_RE_IMAGE_EXT.test(resource.name))
                    summary.images++;
                if (resource.transferSize)
                    summary.totalSize += resource.transferSize;
                summary.totalDuration += resource.duration;
            });
            return summary;
        }
        catch {
            return { total: 0 };
        }
    }
    _getLongTasks() {
        try {
            return performance.getEntriesByType("longtask").map((task) => ({
                duration: task.duration,
                startTime: task.startTime,
            }));
        }
        catch {
            return [];
        }
    }
    _getPeakMemory() {
        if (performanceData.memory.length === 0)
            return this.getMemoryUsage();
        return performanceData.memory.reduce((peak, current) => current.used > peak.used ? current : peak);
    }
    _compareNavigation(baseline, current) {
        const result = {};
        Object.keys(baseline).forEach((key) => {
            const baselineValue = baseline[key];
            const currentValue = current[key];
            const diff = baselineValue ? ((currentValue - baselineValue) / baselineValue) * 100 : 0;
            result[key] = {
                baseline: baselineValue,
                current: currentValue,
                difference: diff,
                status: Math.abs(diff) > 20 ? (diff > 0 ? "worse" : "better") : "similar",
            };
        });
        return result;
    }
    _comparePaint(baselinePaint, currentPaint) {
        const result = {};
        Object.keys(baselinePaint).forEach((key) => {
            if (currentPaint[key] !== undefined) {
                const baseVal = baselinePaint[key];
                const currVal = currentPaint[key];
                const diff = baseVal ? ((currVal - baseVal) / baseVal) * 100 : 0;
                result[key] = {
                    baseline: baseVal,
                    current: currVal,
                    difference: diff,
                    status: Math.abs(diff) > 20 ? (diff > 0 ? "worse" : "better") : "similar",
                };
            }
        });
        return result;
    }
    _compareWithBaseline() {
        if (!performanceData.baseline)
            return { status: "no_baseline" };
        const current = {
            navigation: this._getNavigationTiming(),
            paint: this._getPaintTiming(),
            memory: this.getMemoryUsage(),
        };
        const baseline = performanceData.baseline;
        const comparison = {
            navigation: {},
            paint: {},
            memory: {},
            overall: "similar",
        };
        if (current.navigation && baseline.navigation)
            comparison.navigation = this._compareNavigation(baseline.navigation, current.navigation);
        if (baseline.paint && typeof baseline.paint === "object")
            comparison.paint = this._comparePaint(baseline.paint, current.paint);
        if (baseline.memory && baseline.memory.used > 0) {
            const memDiff = ((current.memory.used - baseline.memory.used) / baseline.memory.used) * 100;
            comparison.memory = {
                baseline: baseline.memory.used,
                current: current.memory.used,
                difference: memDiff,
                status: Math.abs(memDiff) > 30 ? (memDiff > 0 ? "worse" : "better") : "similar",
            };
        }
        return comparison;
    }
    _generateRecommendations() {
        const recommendations = [];
        const memoryAnalysis = this.analyzeMemoryLeaks();
        const resources = this._getResourceTiming();
        const longTasks = this._getLongTasks();
        if (memoryAnalysis.status === "warning") {
            recommendations.push({
                type: "memory",
                priority: "medium",
                message: "Monitor memory usage - potential leak detected",
                action: "Check for event listener cleanup and object references",
            });
        }
        else if (memoryAnalysis.status === "critical") {
            recommendations.push({
                type: "memory",
                priority: "high",
                message: "Critical memory usage detected",
                action: "Immediate investigation required - check for memory leaks",
            });
        }
        if (longTasks.length > 0) {
            const avgLongTask = longTasks.reduce((sum, task) => sum + task.duration, 0) / longTasks.length;
            recommendations.push({
                type: "performance",
                priority: "medium",
                message: `${longTasks.length} long tasks detected (avg: ${avgLongTask.toFixed(2)}ms)`,
                action: "Consider breaking up long-running operations with setTimeout or requestIdleCallback",
            });
        }
        if (resources.total > 50) {
            recommendations.push({
                type: "resources",
                priority: "low",
                message: `High number of resources loaded (${resources.total})`,
                action: "Consider bundling or lazy loading resources",
            });
        }
        return recommendations;
    }
    _isDevelopmentMode() {
        const loc = typeof globalThis !== "undefined" && "location" in globalThis
            ? globalThis.location
            : null;
        return (loc?.hostname === "localhost" ||
            loc?.hostname === "127.0.0.1" ||
            !!loc?.port ||
            getDebugMode());
    }
    _loadBaseline() {
        if (!this.config.baseline.enabled)
            return;
        const saved = loadBaselineFromStorage(this.config.baseline.storage);
        if (saved) {
            performanceData.baseline = saved;
            this.baselineEstablished = true;
        }
    }
    _saveBaseline(baseline) {
        saveBaselineToStorage(baseline, this.config.baseline.storage);
    }
    _mergeConfig(defaultConfig, userConfig) {
        const merged = { ...defaultConfig };
        for (const key of Object.keys(userConfig)) {
            const userVal = userConfig[key];
            if (typeof userVal === "object" && userVal !== null && !Array.isArray(userVal)) {
                merged[key] = {
                    ...defaultConfig[key],
                    ...userVal,
                };
            }
            else if (userVal !== undefined) {
                merged[key] = userVal;
            }
        }
        return merged;
    }
}
let _performanceProfilerInstance = null;
function getPerformanceProfiler() {
    if (!_performanceProfilerInstance) {
        _performanceProfilerInstance = new PerformanceProfiler();
        _performanceProfilerInstance.init();
    }
    return _performanceProfilerInstance;
}
if (typeof window !== "undefined") {
    window.addEventListener("load", () => {
        if (_performanceProfilerInstance)
            _performanceProfilerInstance.establishBaseline();
    }, { once: true });
}

/**
 * @fileoverview GeoLeaf Lazy Loading Module
 * @version 1.2.0
 */
const _g$1 = typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
        ? window
        : {};
const DEFAULT_CONFIG = {
    modules: {
        timeout: 15000,
        retries: 2,
        cacheBust: false,
    },
    images: {
        rootMargin: "50px",
        threshold: 0.1,
        loadingClass: "lazy-loading",
        loadedClass: "lazy-loaded",
        errorClass: "lazy-error",
    },
    chunks: {
        preload: ["core", "ui"],
        defer: ["poi", "geojson", "route", "legend"],
    },
};
const moduleCache = new Map();
const loadingPromises = new Map();
const metrics = {
    modulesLoaded: 0,
    imagesLoaded: 0,
    totalLoadTime: 0,
    errors: 0,
};
class LazyLoader {
    config;
    imageObserver = null;
    constructor(config = {}) {
        this.config = this._mergeConfig(DEFAULT_CONFIG, config);
        this.init();
    }
    init() {
        this._preloadCoreModules();
        if (Log)
            Log.info("[GeoLeaf.Utils.LazyLoader] Lazy loading system initialized");
    }
    async loadModule(moduleName, modulePath, options = {}) {
        const startTime = performance.now();
        try {
            if (moduleCache.has(moduleName))
                return moduleCache.get(moduleName);
            if (loadingPromises.has(moduleName))
                return await loadingPromises.get(moduleName);
            const loadingPromise = this._loadModuleScript(moduleName, modulePath, options);
            loadingPromises.set(moduleName, loadingPromise);
            const result = await loadingPromise;
            moduleCache.set(moduleName, result);
            loadingPromises.delete(moduleName);
            const loadTime = performance.now() - startTime;
            metrics.modulesLoaded++;
            metrics.totalLoadTime += loadTime;
            if (Log)
                Log.info(`[LazyLoader] Module "${moduleName}" loaded in ${loadTime.toFixed(2)}ms`);
            return result;
        }
        catch (error) {
            loadingPromises.delete(moduleName);
            metrics.errors++;
            if (Log)
                Log.error(`[LazyLoader] Failed to load module "${moduleName}":`, error);
            throw error;
        }
    }
    async _loadModuleScript(moduleName, modulePath, options = {}) {
        const config = { ...this.config.modules, ...options };
        const finalPath = config.cacheBust ? `${modulePath}?v=${Date.now()}` : modulePath;
        const importPromise = import(/* webpackIgnore: true */ finalPath);
        if (!config.timeout)
            return importPromise;
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Module "${moduleName}" load timeout`)), config.timeout));
        return Promise.race([importPromise, timeoutPromise]);
    }
    _extractModuleExports(moduleName) {
        const patterns = [
            `GeoLeaf.${moduleName}`,
            `GeoLeaf._${moduleName}`,
            `GeoLeaf.Utils.${moduleName}`,
            moduleName,
        ];
        for (const pattern of patterns) {
            const moduleExports = this._getNestedProperty(_g$1, pattern);
            if (moduleExports)
                return moduleExports;
        }
        return { name: moduleName, loaded: true };
    }
    _getNestedProperty(obj, path) {
        return path.split(".").reduce((current, key) => {
            const o = current;
            return o && o[key] !== undefined ? o[key] : null;
        }, obj);
    }
    _ensureObserver() {
        if (!this.imageObserver)
            this._initImageObserver();
    }
    _initImageObserver() {
        if (typeof window === "undefined" || !("IntersectionObserver" in window))
            return;
        this.imageObserver = new IntersectionObserver((entries) => this._handleImageIntersection(entries), {
            rootMargin: this.config.images.rootMargin,
            threshold: this.config.images.threshold,
        });
    }
    _handleImageIntersection(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this._loadImage(img);
                this.imageObserver?.unobserve(img);
            }
        });
    }
    _loadImage(img) {
        const config = this.config.images;
        img.classList.add(config.loadingClass);
        const startTime = performance.now();
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = tempImg.src;
            img.classList.remove(config.loadingClass);
            img.classList.add(config.loadedClass);
            metrics.imagesLoaded++;
            if (Log)
                Log.debug(`[LazyLoader] Image loaded in ${(performance.now() - startTime).toFixed(2)}ms: ${img.src}`);
        };
        tempImg.onerror = () => {
            img.classList.remove(config.loadingClass);
            img.classList.add(config.errorClass);
            metrics.errors++;
            if (Log)
                Log.warn(`[LazyLoader] Image load failed: ${tempImg.src}`);
        };
        tempImg.src = img.dataset.src || img.src;
    }
    enableImageLazyLoading(selector = "img[data-src]") {
        this._ensureObserver();
        const images = document.querySelectorAll(selector);
        if (this.imageObserver) {
            images.forEach((img) => this.imageObserver.observe(img));
        }
        else {
            images.forEach((img) => this._loadImage(img));
        }
        if (Log)
            Log.info(`[LazyLoader] Enabled lazy loading for ${images.length} images`);
    }
    scan(selector = "img[data-src]") {
        this._ensureObserver();
        const images = document.querySelectorAll(selector);
        if (images.length) {
            if (this.imageObserver) {
                images.forEach((img) => this.imageObserver.observe(img));
            }
            else {
                images.forEach((img) => this._loadImage(img));
            }
            if (Log)
                Log.info(`[LazyLoader] scan() — ${images.length} image(s) found`);
        }
        return images.length;
    }
    initialize(options = {}) {
        const { autoScan = true, selector = "img[data-src]" } = options;
        if (!autoScan)
            return;
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.scan(selector), {
                once: true,
            });
        }
        else {
            this.scan(selector);
        }
    }
    _preloadCoreModules() {
        this.config.chunks.preload.forEach((moduleName) => {
            if (!moduleCache.has(moduleName) && this._shouldPreloadModule(moduleName)) {
                this._preloadModule(moduleName);
            }
        });
    }
    _shouldPreloadModule(moduleName) {
        const moduleExists = this._extractModuleExports(moduleName);
        return (!moduleExists ||
            (typeof moduleExists === "object" &&
                moduleExists !== null &&
                moduleExists.name === moduleName));
    }
    _preloadModule(moduleName) {
        const modulePath = this._getModulePath(moduleName);
        if (modulePath) {
            const link = document.createElement("link");
            link.rel = "prefetch";
            link.href = modulePath;
            document.head.appendChild(link);
            if (Log)
                Log.debug(`[LazyLoader] Prefetching module: ${moduleName}`);
        }
    }
    _getModulePath(moduleName) {
        const pathMap = {
            poi: "poi/add-form-orchestrator.js",
            geojson: "geojson/loader.js",
            route: "geoleaf.route.js",
            legend: "geoleaf.legend.js",
            themes: "themes/theme-loader.js",
        };
        const basePath = this._getBasePath();
        return pathMap[moduleName] ? `${basePath}/${pathMap[moduleName]}` : null;
    }
    _getBasePath() {
        const scripts = document.getElementsByTagName("script");
        for (const script of scripts) {
            if (script.src && script.src.includes("geoleaf")) {
                const srcParts = script.src.split("/");
                srcParts.pop();
                return srcParts.join("/");
            }
        }
        return "./src/modules";
    }
    getMetrics() {
        return {
            ...metrics,
            averageLoadTime: metrics.modulesLoaded > 0 ? metrics.totalLoadTime / metrics.modulesLoaded : 0,
        };
    }
    clearCache() {
        moduleCache.clear();
        loadingPromises.clear();
        if (Log)
            Log.info("[LazyLoader] Module cache cleared");
    }
    _mergeConfig(defaultConfig, userConfig) {
        const merged = {
            modules: { ...defaultConfig.modules },
            images: { ...defaultConfig.images },
            chunks: { ...defaultConfig.chunks },
        };
        if (userConfig.modules && typeof userConfig.modules === "object") {
            merged.modules = { ...defaultConfig.modules, ...userConfig.modules };
        }
        if (userConfig.images && typeof userConfig.images === "object") {
            merged.images = { ...defaultConfig.images, ...userConfig.images };
        }
        if (userConfig.chunks && typeof userConfig.chunks === "object") {
            merged.chunks = { ...defaultConfig.chunks, ...userConfig.chunks };
        }
        return merged;
    }
}
let _lazyLoaderInstance = null;
function getLazyLoader() {
    if (!_lazyLoaderInstance)
        _lazyLoaderInstance = new LazyLoader();
    return _lazyLoaderInstance;
}
if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => getLazyLoader().initialize(), {
            once: true,
        });
    }
    else {
        Promise.resolve().then(() => getLazyLoader().initialize());
    }
}

/**
 * @fileoverview TimerManager - Gestion centralizede des timers
 * @module GeoLeaf.Utils.TimerManager
 */
class TimerManager {
    name;
    timers;
    intervals;
    _nextId;
    constructor(name = "default") {
        this.name = name;
        this.timers = new Map();
        this.intervals = new Map();
        this._nextId = 1;
    }
    setTimeout(callback, delay, label = "") {
        const id = this._nextId++;
        const timerId = setTimeout(() => {
            try {
                callback();
            }
            finally {
                this.timers.delete(id);
            }
        }, delay);
        this.timers.set(id, {
            timerId,
            label,
            type: "timeout",
            createdAt: Date.now(),
            delay,
        });
        Log.debug(`[TimerManager.${this.name}] setTimeout created:`, id, label);
        return id;
    }
    setInterval(callback, interval, label = "") {
        const id = this._nextId++;
        const intervalId = setInterval(() => {
            try {
                callback();
            }
            catch (error) {
                Log.error(`[TimerManager.${this.name}] Error in interval ${id}:`, error);
            }
        }, interval);
        this.intervals.set(id, {
            intervalId,
            label,
            type: "interval",
            createdAt: Date.now(),
            interval,
        });
        Log.debug(`[TimerManager.${this.name}] setInterval created:`, id, label);
        return id;
    }
    clearTimeout(id) {
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer.timerId);
            this.timers.delete(id);
            Log.debug(`[TimerManager.${this.name}] setTimeout cleared:`, id, timer.label);
            return true;
        }
        return false;
    }
    clearInterval(id) {
        const interval = this.intervals.get(id);
        if (interval) {
            clearInterval(interval.intervalId);
            this.intervals.delete(id);
            Log.debug(`[TimerManager.${this.name}] setInterval cleared:`, id, interval.label);
            return true;
        }
        return false;
    }
    clearAll() {
        for (const [, timer] of this.timers.entries()) {
            clearTimeout(timer.timerId);
        }
        for (const [, interval] of this.intervals.entries()) {
            clearInterval(interval.intervalId);
        }
        const totalCleared = this.timers.size + this.intervals.size;
        this.timers.clear();
        this.intervals.clear();
        if (totalCleared > 0) {
            Log.info(`[TimerManager.${this.name}] Cleared ${totalCleared} timer(s)`);
        }
    }
    getStats() {
        return {
            timeouts: this.timers.size,
            intervals: this.intervals.size,
            total: this.timers.size + this.intervals.size,
        };
    }
    listActiveTimers() {
        const list = [];
        for (const [id, timer] of this.timers.entries()) {
            list.push({
                id,
                type: "timeout",
                label: timer.label,
                age: Date.now() - timer.createdAt,
                delay: timer.delay,
            });
        }
        for (const [id, interval] of this.intervals.entries()) {
            list.push({
                id,
                type: "interval",
                label: interval.label,
                age: Date.now() - interval.createdAt,
                interval: interval.interval,
            });
        }
        return list;
    }
    destroy() {
        this.clearAll();
        Log.info(`[TimerManager.${this.name}] Destroyed`);
    }
}
const globalTimerManager = new TimerManager("global");
if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        const stats = globalTimerManager.getStats();
        if (stats.total > 0) {
            Log.warn(`[TimerManager] ${stats.total} timer(s) still active at page unload`);
            globalTimerManager.clearAll();
        }
    });
}

/**
 * @module GeoLeaf.Utils.ObjectUtils
 * @description Utilitaires pour manipulation d'objects et access to properties nestedes
 * @version 1.2.0
 * @since 2.1.0
 */
/**
 * Retrieves a value nestede dans an object via un path de properties.
 * Manages null/undefined values safely.
 *
 * @param obj - Object source
 * @param path - Path to the property avec notation point (ex: 'user.address.city')
 * @returns Value found ou null si le path n'existe pas
 */
function getNestedValue(obj, path) {
    if (!obj || typeof obj !== "object") {
        return null;
    }
    if (!path || typeof path !== "string") {
        return null;
    }
    const keys = path.split(".");
    let result = obj;
    for (const key of keys) {
        if (result == null) {
            return null;
        }
        result = result[key];
    }
    return result !== undefined ? result : null;
}
/**
 * Checks if un path de property existe dans an object.
 *
 * @param obj - Object source
 * @param path - Path to the property
 * @returns True si le path existe, false sinon
 */
function hasNestedPath(obj, path) {
    if (!obj || typeof obj !== "object" || !path) {
        return false;
    }
    const keys = path.split(".");
    let current = obj;
    for (const key of keys) {
        if (current == null || !Object.prototype.hasOwnProperty.call(current, key)) {
            return false;
        }
        current = current[key];
    }
    return true;
}
/**
 * Sets ae value dans an object via un path de properties.
 * Creates intermediate objects if needed.
 *
 * @param obj - Object cible
 * @param path - Path to the property
 * @param value - Value to define
 * @returns The object modified
 */
function setNestedValue(obj, path, value) {
    if (!obj || typeof obj !== "object") {
        throw new Error("[ObjectUtils.setNestedValue] Invalid object");
    }
    if (!path || typeof path !== "string") {
        throw new Error("[ObjectUtils.setNestedValue] Invalid path");
    }
    const keys = path.split(".");
    const lastKey = keys.pop();
    let current = obj;
    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== "object") {
            current[key] = {};
        }
        current = current[key];
    }
    current[lastKey] = value;
    return obj;
}

/**
 * @fileoverview Scale utilities - compute map scale and test visibility ranges
 * @module utils/scale-utils
 */
const _scaleCache = {
    zoom: null,
    lat: null,
    scale: null,
};
/**
 * Calculates the scale (1:X) de the map for the zoom et la latitude currents.
 * Returns the cached value if zoom/latitude unchanged.
 */
function calculateMapScale(map, options = {}) {
    if (!map)
        return 0;
    const logger = options.logger;
    const center = map.getCenter?.();
    const zoom = map.getZoom?.();
    if (!center || typeof zoom !== "number") {
        return 0;
    }
    if (!options.force && _scaleCache.zoom === zoom && _scaleCache.lat === center.lat) {
        return _scaleCache.scale ?? 0;
    }
    const METERS_PER_PIXEL_AT_ZOOM_0 = 156543.04;
    const metersPerPixel = (METERS_PER_PIXEL_AT_ZOOM_0 * Math.cos((center.lat * Math.PI) / 180)) / Math.pow(2, zoom);
    const METERS_PER_INCH = 0.0254;
    const DPI = 96;
    const metersPerInch = metersPerPixel * DPI;
    const scale = Math.round(metersPerInch / METERS_PER_INCH);
    _scaleCache.zoom = zoom;
    _scaleCache.lat = center.lat;
    _scaleCache.scale = scale;
    if (logger && typeof logger.debug === "function") {
        logger.debug(`[ScaleUtils] Scale calculation: zoom=${zoom}, lat=${center.lat.toFixed(2)}, scale=1:${scale.toLocaleString()}`);
    }
    return scale;
}
/**
 * Checks if l'scale currente est dans l'interval [maxScale ; minScale].
 */
function _logScale(logger, msg) {
    logger?.debug?.(msg);
}
function _normalizeScaleBound(val) {
    return typeof val === "number" && val > 0 ? val : null;
}
function isScaleInRange(currentScale, minScale, maxScale, logger) {
    const normalizedMin = _normalizeScaleBound(minScale);
    const normalizedMax = _normalizeScaleBound(maxScale);
    if (normalizedMin !== null && currentScale > normalizedMin) {
        _logScale(logger, `[ScaleUtils] ${currentScale} > minScale ${normalizedMin} → invisible (too zoomed out)`);
        return false;
    }
    if (normalizedMax !== null && currentScale < normalizedMax) {
        _logScale(logger, `[ScaleUtils] ${currentScale} < maxScale ${normalizedMax} → invisible (too zoomed in)`);
        return false;
    }
    _logScale(logger, `[ScaleUtils] ${currentScale} dans [${normalizedMax ?? "∞"} ; ${normalizedMin ?? "∞"}] → visible`);
    return true;
}
function clearScaleCache() {
    _scaleCache.zoom = null;
    _scaleCache.lat = null;
    _scaleCache.scale = null;
}

/*!
 * GeoLeaf Core — Language: French (fr)
 * © 2026 Mattieu Pottier — MIT License
 *
 * Canonical reference file. All other lang files translate these strings.
 * Template variables use {0}, {1}, ... positional placeholders.
 */
const lang_fr = {
    // ── Toasts / Geolocation ─────────────────────────────────────────────────
    "toast.geoloc.position_found": "Position trouv\u00e9e",
    "toast.geoloc.locating": "Localisation en cours\u2026",
    "toast.geoloc.error.default": "Impossible d\u2019obtenir votre position",
    "toast.geoloc.error.permission_denied": "Permission de g\u00e9olocalisation refus\u00e9e",
    "toast.geoloc.error.position_unavailable": "Position indisponible",
    "toast.geoloc.error.timeout": "D\u00e9lai de g\u00e9olocalisation d\u00e9pass\u00e9",
    // ── Toasts / Init ────────────────────────────────────────────────────────
    "toast.init.loading": "Chargement des donn\u00e9es\u2026",
    "toast.profile.loaded": "{0} charg\u00e9",
    "toast.theme.applied": "Th\u00e8me \u00ab\u202f{0}\u202f\u00bb appliqu\u00e9 ({1} couches visibles)",
    // ── Toasts / Cache ───────────────────────────────────────────────────────
    // ── Aria / Fullscreen ────────────────────────────────────────────────────
    "aria.fullscreen.enter": "Plein \u00e9cran",
    "aria.fullscreen.enter_label": "Activer le mode plein \u00e9cran",
    "aria.fullscreen.exit": "Quitter le plein \u00e9cran",
    "aria.fullscreen.exit_label": "Quitter le mode plein \u00e9cran",
    // ── Aria / Geolocation ───────────────────────────────────────────────────
    "aria.geoloc.toggle": "G\u00e9olocalisation ON/OFF",
    "aria.geoloc.toggle_label": "Activer/D\u00e9sactiver le suivi GPS",
    "aria.geoloc.recenter": "Revenir \u00e0 ma position",
    // ── Aria / POI Add ───────────────────────────────────────────────────────
    "aria.poi_add.title": "Ajouter un POI",
    "aria.poi_add.label": "Ajouter un nouveau point d\u2019int\u00e9r\u00eat",
    // ── Aria / Toolbar ───────────────────────────────────────────────────────
    "aria.toolbar.root": "Outils carte",
    "aria.toolbar.scroll_up": "D\u00e9filer vers le haut",
    "aria.toolbar.scroll_down": "D\u00e9filer vers le bas",
    "aria.toolbar.fullscreen": "Plein \u00e9cran",
    "aria.toolbar.zoom_in": "Zoom avant",
    "aria.toolbar.zoom_out": "Zoom arri\u00e8re",
    "aria.toolbar.geoloc": "Ma position",
    "aria.toolbar.themes": "Th\u00e8mes",
    "tooltip.toolbar.themes": "Th\u00e8mes / options th\u00e8mes secondaires",
    "aria.toolbar.legend": "L\u00e9gende",
    "tooltip.toolbar.legend": "L\u00e9gende de la carte",
    "aria.toolbar.layers": "Couches",
    "tooltip.toolbar.layers": "Gestionnaire de layers",
    "aria.toolbar.table": "Tableau de donn\u00e9es",
    "aria.toolbar.poi_add": "Ajouter un POI",
    "tooltip.toolbar.poi_add": "Ajouter un point d\u2019int\u00e9r\u00eat",
    "aria.toolbar.search": "Recherche",
    "tooltip.toolbar.search": "Recherche textuelle",
    "aria.toolbar.proximity": "Proximit\u00e9",
    "tooltip.toolbar.proximity": "Recherche par proximit\u00e9",
    "aria.toolbar.filters": "Filtres",
    "aria.toolbar.reset_filters": "R\u00e9initialiser tous les filtres",
    "tooltip.toolbar.filters": "Filtres avanc\u00e9s",
    // ── Aria / Search bar ────────────────────────────────────────────────────
    "aria.search.bar": "Recherche textuelle",
    "aria.search.input": "Texte de recherche",
    "aria.search.submit": "Valider la recherche",
    "aria.search.clear": "Effacer la recherche",
    "placeholder.search.input": "Rechercher...",
    // ── Aria / Sheet ─────────────────────────────────────────────────────────
    "aria.sheet.close": "Fermer",
    // ── Aria / Proximity ─────────────────────────────────────────────────────
    "aria.proximity.region": "Configuration de la recherche par proximit\u00e9",
    "aria.proximity.slider": "Rayon de recherche en kilom\u00e8tres",
    "aria.proximity.validate": "Valider la recherche par proximit\u00e9",
    "aria.proximity.cancel": "Annuler la recherche par proximit\u00e9",
    // ── Aria / Layer manager ─────────────────────────────────────────────────
    "aria.layer.toggle": "Afficher / hide la layer",
    // ── Aria / Themes ────────────────────────────────────────────────────────
    "aria.themes.nav_prev": "Th\u00e8mes pr\u00e9c\u00e9dents",
    "aria.themes.nav_next": "Th\u00e8mes suivants",
    "aria.themes.prev_title": "Th\u00e8me pr\u00e9c\u00e9dent",
    "aria.themes.next_title": "Th\u00e8me suivant",
    "aria.themes.secondary_select": "S\u00e9lecteur de th\u00e8me secondaire",
    // ── Aria / Filter panel ──────────────────────────────────────────────────
    "aria.filter_panel.open": "Ouvrir le panel de filtres",
    "aria.filter_panel.close": "Fermer le panel de filtres",
    "aria.filter_panel.close_inner": "Fermer le panel",
    // ── Aria / Desktop Panel ─────────────────────────────────────────────────
    "aria.panel.nav": "Panneau de navigation",
    "aria.panel.lateral": "Panneau lat\u00e9ral",
    // ── Aria / Side Panel (POI) ──────────────────────────────────────────────
    "aria.sidepanel.close": "Fermer",
    "aria.sidepanel.landmark": "Fiche d\u00e9taill\u00e9e du point d\u2019int\u00e9r\u00eat",
    // ── Aria / Lightbox ───────────────────────────────────────────────────────
    "aria.lightbox.title": "Galerie d\u2019images",
    "aria.lightbox.close": "Fermer",
    "aria.lightbox.prev": "Image pr\u00e9c\u00e9dente",
    "aria.lightbox.next": "Image suivante",
    "aria.lightbox.counter": "Image {0} sur {1}",
    // ── Aria / Table ─────────────────────────────────────────────────────────
    "aria.table.hide": "Masquer le table",
    "aria.table.show": "Afficher le table",
    // ── Aria / Legend ────────────────────────────────────────────────────────
    "aria.legend.toggle": "Basculer la l\u00e9gende",
    // ── Aria / Labels ────────────────────────────────────────────────────────
    "aria.labels.toggle": "Afficher/hide les \u00e9tiquettes",
    // ── Aria / Theme toggle ──────────────────────────────────────────────────
    "aria.theme.toggle_to_light": "Basculer en th\u00e8me clair",
    "aria.theme.toggle_to_dark": "Basculer en th\u00e8me sombre",
    // ── Aria / Notifications ─────────────────────────────────────────────────
    "aria.notification.close_label": "Fermer la notification",
    "aria.notification.close_title": "Fermer",
    // ── Aria / Cache ─────────────────────────────────────────────────────────
    // ── UI texts / Proximity ─────────────────────────────────────────────────
    "ui.proximity.point_placed": "\u2713 Ajustez le rayon",
    "ui.proximity.instruction_initial": "Toucher la carte",
    // ── UI texts / Filter actions ────────────────────────────────────────────
    "ui.filter.activate": "Activer",
    "ui.filter.disable": "D\u00e9sactiver",
    // ── UI texts / Sheet titles ──────────────────────────────────────────────
    "sheet.title.zoom": "Zoom",
    "sheet.title.geoloc": "Ma position",
    "sheet.title.search": "Recherche",
    "sheet.title.proximity": "Proximit\u00e9",
    "sheet.title.filters": "Filtres",
    "sheet.title.legend": "L\u00e9gende",
    "sheet.title.layers": "Couches",
    "sheet.title.table": "Tableau",
    "sheet.title.themes": "Th\u00e8mes (principales et secondaire)",
    // ── UI texts / Layer manager ─────────────────────────────────────────────
    "ui.layer_manager.empty": "Aucune couche \u00e0 afficher.",
    // ── UI texts / Filter panel ──────────────────────────────────────────────
    "ui.filter_panel.title": "Filtres",
    "ui.filter_panel.apply": "Appliquer",
    "ui.filter_panel.reset": "R\u00e9initialiser",
    "ui.filter_panel.categories_title_fallback": "Afficher les cat\u00e9gories",
    "ui.filter_panel.tags_title_fallback": "Afficher les tags",
    "ui.filter_panel.no_categories": "Aucune cat\u00e9gorie disponible sur les layers visibles",
    "ui.filter_panel.no_tags": "Aucun tag disponible sur les layers visibles",
    "ui.filter_panel.loading": "Chargement...",
    // ── UI texts / Notifications ─────────────────────────────────────────────
    "ui.notification.close_char": "\u00d7",
    // ── UI texts / Branding ──────────────────────────────────────────────────
    "ui.branding.default_text": "Propuls\u00e9 par \u00a9 GeoLeaf with MapLibre",
    "ui.branding.not_configured": "\u26a0 Branding non configur\u00e9",
    // ── UI texts / Cache ─────────────────────────────────────────────────────
    // ── UI texts / Offline ───────────────────────────────────────────────────
    "ui.offline.badge": "\u26a0\ufe0f Hors ligne",
    "aria.offline.badge_title": "Mode hors ligne actif",
    // ── UI texts / Themes ────────────────────────────────────────────────────
    "ui.theme.select_placeholder": "S\u00e9lectionner un th\u00e8me...",
    // ── UI texts / Table ─────────────────────────────────────────────────────
    "ui.table.layer_placeholder": "S\u00e9lectionner une couche...",
    // ── UI texts / Themes nav chars ──────────────────────────────────────────
    "ui.themes.nav_prev_char": "\u276e",
    "ui.themes.nav_next_char": "\u276f",
    // ── Formats ──────────────────────────────────────────────────────────────
    "format.proximity.radius": "{0} km",
    "format.scale.unit_km": "{0} km",
    "format.scale.unit_m": "{0} m",
    "format.zoom.level": "Zoom : {0}",
};

const lang_en = {
    "toast.geoloc.position_found": "Position found",
    "toast.geoloc.locating": "Locating\u2026",
    "toast.geoloc.error.default": "Unable to retrieve your position",
    "toast.geoloc.error.permission_denied": "Geolocation permission denied",
    "toast.geoloc.error.position_unavailable": "Position unavailable",
    "toast.geoloc.error.timeout": "Geolocation timed out",
    "toast.init.loading": "Loading data, please wait.",
    "toast.profile.loaded": "{0} loaded",
    "toast.theme.applied": 'Theme "{0}" loaded ({1} visible layers)',
    "aria.fullscreen.enter": "Fullscreen",
    "aria.fullscreen.enter_label": "Enable fullscreen mode",
    "aria.fullscreen.exit": "Exit fullscreen",
    "aria.fullscreen.exit_label": "Exit fullscreen mode",
    "aria.geoloc.toggle": "Geolocation ON/OFF",
    "aria.geoloc.toggle_label": "Enable/Disable GPS tracking",
    "aria.geoloc.recenter": "Back to my position",
    "aria.poi_add.title": "Add POI",
    "aria.poi_add.label": "Add a new point of interest",
    "aria.toolbar.root": "Map tools",
    "aria.toolbar.scroll_up": "Scroll up",
    "aria.toolbar.scroll_down": "Scroll down",
    "aria.toolbar.fullscreen": "Fullscreen",
    "aria.toolbar.zoom_in": "Zoom in",
    "aria.toolbar.zoom_out": "Zoom out",
    "aria.toolbar.geoloc": "My position",
    "aria.toolbar.themes": "Themes",
    "tooltip.toolbar.themes": "Themes / secondary theme options",
    "aria.toolbar.legend": "Legend",
    "tooltip.toolbar.legend": "Map legend",
    "aria.toolbar.layers": "Layers",
    "tooltip.toolbar.layers": "Layer manager",
    "aria.toolbar.table": "Data table",
    "aria.toolbar.poi_add": "Add POI",
    "tooltip.toolbar.poi_add": "Add a point of interest",
    "aria.toolbar.search": "Search",
    "tooltip.toolbar.search": "Text search",
    "aria.toolbar.proximity": "Proximity",
    "tooltip.toolbar.proximity": "Proximity search",
    "aria.toolbar.filters": "Filters",
    "aria.toolbar.reset_filters": "Reset all filters",
    "tooltip.toolbar.filters": "Advanced filters",
    "aria.search.bar": "Text search",
    "aria.search.input": "Search text",
    "aria.search.submit": "Submit search",
    "aria.search.clear": "Clear search",
    "placeholder.search.input": "Search...",
    "aria.sheet.close": "Close",
    "aria.proximity.region": "Proximity search settings",
    "aria.proximity.slider": "Search radius in kilometres",
    "aria.proximity.validate": "Confirm proximity search",
    "aria.proximity.cancel": "Cancel proximity search",
    "aria.layer.toggle": "Show / hide layer",
    "aria.themes.nav_prev": "Previous themes",
    "aria.themes.nav_next": "Next themes",
    "aria.themes.prev_title": "Previous theme",
    "aria.themes.next_title": "Next theme",
    "aria.themes.secondary_select": "Secondary theme selector",
    "aria.filter_panel.open": "Open filter panel",
    "aria.filter_panel.close": "Close filter panel",
    "aria.filter_panel.close_inner": "Close panel",
    "aria.panel.nav": "Navigation panel",
    "aria.panel.lateral": "Side panel",
    "aria.sidepanel.close": "Close",
    "aria.sidepanel.landmark": "Detailed point of interest information",
    "aria.lightbox.title": "Image gallery",
    "aria.lightbox.close": "Close",
    "aria.lightbox.prev": "Previous image",
    "aria.lightbox.next": "Next image",
    "aria.lightbox.counter": "Image {0} of {1}",
    "aria.table.hide": "Hide table",
    "aria.table.show": "Show table",
    "aria.legend.toggle": "Toggle legend",
    "aria.labels.toggle": "Show/hide labels",
    "aria.theme.toggle_to_light": "Switch to light theme",
    "aria.theme.toggle_to_dark": "Switch to dark theme",
    "aria.notification.close_label": "Close notification",
    "aria.notification.close_title": "Close",
    "ui.proximity.point_placed": "\u2713 Adjust the radius",
    "ui.proximity.instruction_initial": "Tap the map",
    "ui.filter.activate": "Activate",
    "ui.filter.disable": "Disable",
    "sheet.title.zoom": "Zoom",
    "sheet.title.geoloc": "My location",
    "sheet.title.search": "Search",
    "sheet.title.proximity": "Proximity",
    "sheet.title.filters": "Filters",
    "sheet.title.legend": "Legend",
    "sheet.title.layers": "Layers",
    "sheet.title.table": "Table",
    "sheet.title.themes": "Themes (main and secondary)",
    "ui.layer_manager.empty": "No layers to display.",
    "ui.filter_panel.title": "Filters",
    "ui.filter_panel.apply": "Apply",
    "ui.filter_panel.reset": "Reset",
    "ui.filter_panel.categories_title_fallback": "Show categories",
    "ui.filter_panel.tags_title_fallback": "Show tags",
    "ui.filter_panel.no_categories": "No categories available on visible layers",
    "ui.filter_panel.no_tags": "No tags available on visible layers",
    "ui.filter_panel.loading": "Loading...",
    "ui.notification.close_char": "\u00d7",
    "ui.branding.default_text": "Powered by \u00a9 GeoLeaf with MapLibre",
    "ui.branding.not_configured": "\u26a0 Branding not configured",
    "ui.offline.badge": "\u26a0\ufe0f Offline",
    "aria.offline.badge_title": "Offline mode active",
    "ui.theme.select_placeholder": "Select a theme...",
    "ui.table.layer_placeholder": "Select a layer...",
    "ui.themes.nav_prev_char": "\u276e",
    "ui.themes.nav_next_char": "\u276f",
    "format.proximity.radius": "{0} km",
    "format.scale.unit_km": "{0} km",
    "format.scale.unit_m": "{0} m",
    "format.zoom.level": "Zoom: {0}",
};

const lang_es = {
    "toast.geoloc.position_found": "Posici\u00f3n encontrada",
    "toast.geoloc.locating": "Localizando\u2026",
    "toast.geoloc.error.default": "No se puede obtener su posici\u00f3n",
    "toast.geoloc.error.permission_denied": "Permiso de geolocalizaci\u00f3n denegado",
    "toast.geoloc.error.position_unavailable": "Posici\u00f3n no disponible",
    "toast.geoloc.error.timeout": "Tiempo de geolocalizaci\u00f3n agotado",
    "toast.init.loading": "Cargando datos, espere por favor.",
    "toast.profile.loaded": "{0} cargado",
    "toast.theme.applied": 'Tema "{0}" cargado ({1} capas visibles)',
    "aria.fullscreen.enter": "Pantalla completa",
    "aria.fullscreen.enter_label": "Activar modo pantalla completa",
    "aria.fullscreen.exit": "Salir de pantalla completa",
    "aria.fullscreen.exit_label": "Salir del modo pantalla completa",
    "aria.geoloc.toggle": "Geolocalizaci\u00f3n ON/OFF",
    "aria.geoloc.toggle_label": "Activar/Desactivar seguimiento GPS",
    "aria.geoloc.recenter": "Volver a mi posici\u00f3n",
    "aria.poi_add.title": "A\u00f1adir POI",
    "aria.poi_add.label": "A\u00f1adir un nuevo punto de inter\u00e9s",
    "aria.toolbar.root": "Herramientas del mapa",
    "aria.toolbar.scroll_up": "Desplazarse hacia arriba",
    "aria.toolbar.scroll_down": "Desplazarse hacia abajo",
    "aria.toolbar.fullscreen": "Pantalla completa",
    "aria.toolbar.zoom_in": "Acercar",
    "aria.toolbar.zoom_out": "Alejar",
    "aria.toolbar.geoloc": "Mi posici\u00f3n",
    "aria.toolbar.themes": "Temas",
    "tooltip.toolbar.themes": "Temas / opciones de temas secundarios",
    "aria.toolbar.legend": "Leyenda",
    "tooltip.toolbar.legend": "Leyenda del mapa",
    "aria.toolbar.layers": "Capas",
    "tooltip.toolbar.layers": "Gestor de capas",
    "aria.toolbar.table": "Tabla de datos",
    "aria.toolbar.poi_add": "A\u00f1adir POI",
    "tooltip.toolbar.poi_add": "A\u00f1adir un punto de inter\u00e9s",
    "aria.toolbar.search": "Buscar",
    "tooltip.toolbar.search": "B\u00fasqueda de texto",
    "aria.toolbar.proximity": "Proximidad",
    "tooltip.toolbar.proximity": "B\u00fasqueda por proximidad",
    "aria.toolbar.filters": "Filtros",
    "aria.toolbar.reset_filters": "Restablecer todos los filtros",
    "tooltip.toolbar.filters": "Filtros avanzados",
    "aria.search.bar": "B\u00fasqueda de texto",
    "aria.search.input": "Texto de b\u00fasqueda",
    "aria.search.submit": "Enviar b\u00fasqueda",
    "aria.search.clear": "Borrar b\u00fasqueda",
    "placeholder.search.input": "Buscar...",
    "aria.sheet.close": "Cerrar",
    "aria.proximity.region": "Configuraci\u00f3n de b\u00fasqueda por proximidad",
    "aria.proximity.slider": "Radio de b\u00fasqueda en kil\u00f3metros",
    "aria.proximity.validate": "Confirmar b\u00fasqueda por proximidad",
    "aria.proximity.cancel": "Cancelar b\u00fasqueda por proximidad",
    "aria.layer.toggle": "Mostrar / ocultar capa",
    "aria.themes.nav_prev": "Temas anteriores",
    "aria.themes.nav_next": "Temas siguientes",
    "aria.themes.prev_title": "Tema anterior",
    "aria.themes.next_title": "Tema siguiente",
    "aria.themes.secondary_select": "Selector de tema secundario",
    "aria.filter_panel.open": "Abrir panel de filtros",
    "aria.filter_panel.close": "Cerrar panel de filtros",
    "aria.filter_panel.close_inner": "Cerrar panel",
    "aria.panel.nav": "Panel de navegaci\u00f3n",
    "aria.panel.lateral": "Panel lateral",
    "aria.sidepanel.close": "Cerrar",
    "aria.sidepanel.landmark": "Informaci\u00f3n detallada del punto de inter\u00e9s",
    "aria.lightbox.title": "Galería de imágenes",
    "aria.lightbox.close": "Cerrar",
    "aria.lightbox.prev": "Imagen anterior",
    "aria.lightbox.next": "Imagen siguiente",
    "aria.lightbox.counter": "Imagen {0} de {1}",
    "aria.table.hide": "Ocultar tabla",
    "aria.table.show": "Mostrar tabla",
    "aria.legend.toggle": "Alternar leyenda",
    "aria.labels.toggle": "Mostrar/ocultar etiquetas",
    "aria.theme.toggle_to_light": "Cambiar a tema claro",
    "aria.theme.toggle_to_dark": "Cambiar a tema oscuro",
    "aria.notification.close_label": "Cerrar notificaci\u00f3n",
    "aria.notification.close_title": "Cerrar",
    "ui.proximity.point_placed": "\u2713 Ajuste el radio",
    "ui.proximity.instruction_initial": "Toca el mapa",
    "ui.filter.activate": "Activar",
    "ui.filter.disable": "Desactivar",
    "sheet.title.zoom": "Zoom",
    "sheet.title.geoloc": "Mi ubicaci\u00f3n",
    "sheet.title.search": "B\u00fasqueda",
    "sheet.title.proximity": "Proximidad",
    "sheet.title.filters": "Filtros",
    "sheet.title.legend": "Leyenda",
    "sheet.title.layers": "Capas",
    "sheet.title.table": "Tabla",
    "sheet.title.themes": "Temas (principales y secundarios)",
    "ui.layer_manager.empty": "No hay capas para mostrar.",
    "ui.filter_panel.title": "Filtros",
    "ui.filter_panel.apply": "Aplicar",
    "ui.filter_panel.reset": "Restablecer",
    "ui.filter_panel.categories_title_fallback": "Mostrar categor\u00edas",
    "ui.filter_panel.tags_title_fallback": "Mostrar etiquetas",
    "ui.filter_panel.no_categories": "No hay categor\u00edas disponibles en las capas visibles",
    "ui.filter_panel.no_tags": "No hay etiquetas disponibles en las capas visibles",
    "ui.filter_panel.loading": "Cargando...",
    "ui.notification.close_char": "\u00d7",
    "ui.branding.default_text": "Desarrollado por \u00a9 GeoLeaf with MapLibre",
    "ui.branding.not_configured": "\u26a0 Branding no configurado",
    "ui.offline.badge": "\u26a0\ufe0f Sin conexi\u00f3n",
    "aria.offline.badge_title": "Modo sin conexi\u00f3n activo",
    "ui.theme.select_placeholder": "Seleccionar un tema...",
    "ui.table.layer_placeholder": "Seleccionar una capa...",
    "ui.themes.nav_prev_char": "\u276e",
    "ui.themes.nav_next_char": "\u276f",
    "format.proximity.radius": "{0} km",
    "format.scale.unit_km": "{0} km",
    "format.scale.unit_m": "{0} m",
    "format.zoom.level": "Zoom: {0}",
};

const lang_pt = {
    "toast.geoloc.position_found": "Posi\u00e7\u00e3o encontrada",
    "toast.geoloc.locating": "A localizar\u2026",
    "toast.geoloc.error.default": "N\u00e3o foi poss\u00edvel obter a sua posi\u00e7\u00e3o",
    "toast.geoloc.error.permission_denied": "Permiss\u00e3o de geolocali\u00e7\u00e3o recusada",
    "toast.geoloc.error.position_unavailable": "Posi\u00e7\u00e3o indispon\u00edvel",
    "toast.geoloc.error.timeout": "Tempo de geolocali\u00e7\u00e3o esgotado",
    "toast.init.loading": "A carregar dados, aguarde.",
    "toast.profile.loaded": "{0} carregado",
    "toast.theme.applied": 'Tema "{0}" carregado ({1} camadas vis\u00edveis)',
    "aria.fullscreen.enter": "Ecr\u00e3 inteiro",
    "aria.fullscreen.enter_label": "Ativar modo ecr\u00e3 inteiro",
    "aria.fullscreen.exit": "Sair do ecr\u00e3 inteiro",
    "aria.fullscreen.exit_label": "Sair do modo ecr\u00e3 inteiro",
    "aria.geoloc.toggle": "Geolocali\u00e7\u00e3o ON/OFF",
    "aria.geoloc.toggle_label": "Ativar/Desativar rastreamento GPS",
    "aria.geoloc.recenter": "Voltar \u00e0 minha posi\u00e7\u00e3o",
    "aria.poi_add.title": "Adicionar POI",
    "aria.poi_add.label": "Adicionar um novo ponto de interesse",
    "aria.toolbar.root": "Ferramentas do mapa",
    "aria.toolbar.scroll_up": "Deslocar para cima",
    "aria.toolbar.scroll_down": "Deslocar para baixo",
    "aria.toolbar.fullscreen": "Ecr\u00e3 inteiro",
    "aria.toolbar.zoom_in": "Aproximar",
    "aria.toolbar.zoom_out": "Afastar",
    "aria.toolbar.geoloc": "A minha posi\u00e7\u00e3o",
    "aria.toolbar.themes": "Temas",
    "tooltip.toolbar.themes": "Temas / op\u00e7\u00f5es de temas secund\u00e1rios",
    "aria.toolbar.legend": "Legenda",
    "tooltip.toolbar.legend": "Legenda do mapa",
    "aria.toolbar.layers": "Camadas",
    "tooltip.toolbar.layers": "Gestor de camadas",
    "aria.toolbar.table": "Tabela de dados",
    "aria.toolbar.poi_add": "Adicionar POI",
    "tooltip.toolbar.poi_add": "Adicionar um ponto de interesse",
    "aria.toolbar.search": "Pesquisar",
    "tooltip.toolbar.search": "Pesquisa de texto",
    "aria.toolbar.proximity": "Proximidade",
    "tooltip.toolbar.proximity": "Pesquisa por proximidade",
    "aria.toolbar.filters": "Filtros",
    "aria.toolbar.reset_filters": "Repor todos os filtros",
    "tooltip.toolbar.filters": "Filtros avan\u00e7ados",
    "aria.search.bar": "Pesquisa de texto",
    "aria.search.input": "Texto de pesquisa",
    "aria.search.submit": "Enviar pesquisa",
    "aria.search.clear": "Limpar pesquisa",
    "placeholder.search.input": "Pesquisar...",
    "aria.sheet.close": "Fechar",
    "aria.proximity.region": "Configura\u00e7\u00e3o de pesquisa por proximidade",
    "aria.proximity.slider": "Raio de pesquisa em quil\u00f3metros",
    "aria.proximity.validate": "Confirmar pesquisa por proximidade",
    "aria.proximity.cancel": "Cancelar pesquisa por proximidade",
    "aria.layer.toggle": "Mostrar / ocultar camada",
    "aria.themes.nav_prev": "Temas anteriores",
    "aria.themes.nav_next": "Temas seguintes",
    "aria.themes.prev_title": "Tema anterior",
    "aria.themes.next_title": "Tema seguinte",
    "aria.themes.secondary_select": "Seletor de tema secund\u00e1rio",
    "aria.filter_panel.open": "Abrir painel de filtros",
    "aria.filter_panel.close": "Fechar painel de filtros",
    "aria.filter_panel.close_inner": "Fechar painel",
    "aria.panel.nav": "Painel de navega\u00e7\u00e3o",
    "aria.panel.lateral": "Painel lateral",
    "aria.sidepanel.close": "Fechar",
    "aria.sidepanel.landmark": "Informa\u00e7\u00f5es detalhadas do ponto de interesse",
    "aria.lightbox.title": "Galeria de imagens",
    "aria.lightbox.close": "Fechar",
    "aria.lightbox.prev": "Imagem anterior",
    "aria.lightbox.next": "Pr\u00f3xima imagem",
    "aria.lightbox.counter": "Imagem {0} de {1}",
    "aria.table.hide": "Ocultar tabela",
    "aria.table.show": "Mostrar tabela",
    "aria.legend.toggle": "Alternar legenda",
    "aria.labels.toggle": "Mostrar/ocultar etiquetas",
    "aria.theme.toggle_to_light": "Mudar para tema claro",
    "aria.theme.toggle_to_dark": "Mudar para tema escuro",
    "aria.notification.close_label": "Fechar notifica\u00e7\u00e3o",
    "aria.notification.close_title": "Fechar",
    "ui.proximity.point_placed": "\u2713 Ajuste o raio",
    "ui.proximity.instruction_initial": "Toque no mapa",
    "ui.filter.activate": "Ativar",
    "ui.filter.disable": "Desativar",
    "sheet.title.zoom": "Zoom",
    "sheet.title.geoloc": "Minha localiza\u00e7\u00e3o",
    "sheet.title.search": "Pesquisa",
    "sheet.title.proximity": "Proximidade",
    "sheet.title.filters": "Filtros",
    "sheet.title.legend": "Legenda",
    "sheet.title.layers": "Camadas",
    "sheet.title.table": "Tabela",
    "sheet.title.themes": "Temas (principal e secund\u00e1rio)",
    "ui.layer_manager.empty": "Nenhuma camada para exibir.",
    "ui.filter_panel.title": "Filtros",
    "ui.filter_panel.apply": "Aplicar",
    "ui.filter_panel.reset": "Repor",
    "ui.filter_panel.categories_title_fallback": "Mostrar categorias",
    "ui.filter_panel.tags_title_fallback": "Mostrar etiquetas",
    "ui.filter_panel.no_categories": "Nenhuma categoria dispon\u00edvel nas camadas vis\u00edveis",
    "ui.filter_panel.no_tags": "Nenhuma etiqueta dispon\u00edvel nas camadas vis\u00edveis",
    "ui.filter_panel.loading": "A carregar...",
    "ui.notification.close_char": "\u00d7",
    "ui.branding.default_text": "Desenvolvido por \u00a9 GeoLeaf with MapLibre",
    "ui.branding.not_configured": "\u26a0 Branding n\u00e3o configurado",
    "ui.offline.badge": "\u26a0\ufe0f Sem liga\u00e7\u00e3o",
    "aria.offline.badge_title": "Modo offline ativo",
    "ui.theme.select_placeholder": "Selecionar um tema...",
    "ui.table.layer_placeholder": "Selecionar uma camada...",
    "ui.themes.nav_prev_char": "\u276e",
    "ui.themes.nav_next_char": "\u276f",
    "format.proximity.radius": "{0} km",
    "format.scale.unit_km": "{0} km",
    "format.scale.unit_m": "{0} m",
    "format.zoom.level": "Zoom: {0}",
};

const lang_it = {
    "toast.geoloc.position_found": "Posizione trovata",
    "toast.geoloc.locating": "Localizzazione in corso\u2026",
    "toast.geoloc.error.default": "Impossibile ottenere la posizione",
    "toast.geoloc.error.permission_denied": "Permesso di geolocalizzazione negato",
    "toast.geoloc.error.position_unavailable": "Posizione non disponibile",
    "toast.geoloc.error.timeout": "Timeout geolocalizzazione",
    "toast.init.loading": "Caricamento dati in corso, attendere.",
    "toast.profile.loaded": "{0} caricato",
    "toast.theme.applied": 'Tema "{0}" caricato ({1} livelli visibili)',
    "aria.fullscreen.enter": "Schermo intero",
    "aria.fullscreen.enter_label": "Attiva modalit\u00e0 schermo intero",
    "aria.fullscreen.exit": "Esci dallo schermo intero",
    "aria.fullscreen.exit_label": "Esci dalla modalit\u00e0 schermo intero",
    "aria.geoloc.toggle": "Geolocalizzazione ON/OFF",
    "aria.geoloc.toggle_label": "Attiva/Disattiva tracciamento GPS",
    "aria.geoloc.recenter": "Torna alla mia posizione",
    "aria.poi_add.title": "Aggiungi POI",
    "aria.poi_add.label": "Aggiungi un nuovo punto di interesse",
    "aria.toolbar.root": "Strumenti mappa",
    "aria.toolbar.scroll_up": "Scorri verso l\u2019alto",
    "aria.toolbar.scroll_down": "Scorri verso il basso",
    "aria.toolbar.fullscreen": "Schermo intero",
    "aria.toolbar.zoom_in": "Zoom avanti",
    "aria.toolbar.zoom_out": "Zoom indietro",
    "aria.toolbar.geoloc": "La mia posizione",
    "aria.toolbar.themes": "Temi",
    "tooltip.toolbar.themes": "Temi / opzioni temi secondari",
    "aria.toolbar.legend": "Legenda",
    "tooltip.toolbar.legend": "Legenda della mappa",
    "aria.toolbar.layers": "Livelli",
    "tooltip.toolbar.layers": "Gestore livelli",
    "aria.toolbar.table": "Tabella dati",
    "aria.toolbar.poi_add": "Aggiungi POI",
    "tooltip.toolbar.poi_add": "Aggiungi un punto di interesse",
    "aria.toolbar.search": "Cerca",
    "tooltip.toolbar.search": "Ricerca testuale",
    "aria.toolbar.proximity": "Prossimit\u00e0",
    "tooltip.toolbar.proximity": "Ricerca per prossimit\u00e0",
    "aria.toolbar.filters": "Filtri",
    "aria.toolbar.reset_filters": "Reimposta tutti i filtri",
    "tooltip.toolbar.filters": "Filtri avanzati",
    "aria.search.bar": "Ricerca testuale",
    "aria.search.input": "Testo di ricerca",
    "aria.search.submit": "Invia ricerca",
    "aria.search.clear": "Cancella ricerca",
    "placeholder.search.input": "Cerca...",
    "aria.sheet.close": "Chiudi",
    "aria.proximity.region": "Impostazioni ricerca per prossimit\u00e0",
    "aria.proximity.slider": "Raggio di ricerca in chilometri",
    "aria.proximity.validate": "Conferma ricerca per prossimit\u00e0",
    "aria.proximity.cancel": "Annulla ricerca per prossimit\u00e0",
    "aria.layer.toggle": "Mostra / nascondi livello",
    "aria.themes.nav_prev": "Temi precedenti",
    "aria.themes.nav_next": "Temi successivi",
    "aria.themes.prev_title": "Tema precedente",
    "aria.themes.next_title": "Tema successivo",
    "aria.themes.secondary_select": "Selettore tema secondario",
    "aria.filter_panel.open": "Apri pannello filtri",
    "aria.filter_panel.close": "Chiudi pannello filtri",
    "aria.filter_panel.close_inner": "Chiudi pannello",
    "aria.panel.nav": "Pannello di navigazione",
    "aria.panel.lateral": "Pannello laterale",
    "aria.sidepanel.close": "Chiudi",
    "aria.sidepanel.landmark": "Informazioni dettagliate del punto di interesse",
    "aria.lightbox.title": "Galleria di immagini",
    "aria.lightbox.close": "Chiudi",
    "aria.lightbox.prev": "Immagine precedente",
    "aria.lightbox.next": "Immagine successiva",
    "aria.lightbox.counter": "Immagine {0} di {1}",
    "aria.table.hide": "Nascondi tabella",
    "aria.table.show": "Mostra tabella",
    "aria.legend.toggle": "Attiva/disattiva legenda",
    "aria.labels.toggle": "Mostra/nascondi etichette",
    "aria.theme.toggle_to_light": "Passa al tema chiaro",
    "aria.theme.toggle_to_dark": "Passa al tema scuro",
    "aria.notification.close_label": "Chiudi notifica",
    "aria.notification.close_title": "Chiudi",
    "ui.proximity.point_placed": "\u2713 Regola il raggio",
    "ui.proximity.instruction_initial": "Tocca la mappa",
    "ui.filter.activate": "Attiva",
    "ui.filter.disable": "Disattiva",
    "sheet.title.zoom": "Zoom",
    "sheet.title.geoloc": "La mia posizione",
    "sheet.title.search": "Ricerca",
    "sheet.title.proximity": "Prossimit\u00e0",
    "sheet.title.filters": "Filtri",
    "sheet.title.legend": "Legenda",
    "sheet.title.layers": "Livelli",
    "sheet.title.table": "Tabella",
    "sheet.title.themes": "Temi (principali e secondari)",
    "ui.layer_manager.empty": "Nessun livello da visualizzare.",
    "ui.filter_panel.title": "Filtri",
    "ui.filter_panel.apply": "Applica",
    "ui.filter_panel.reset": "Reimposta",
    "ui.filter_panel.categories_title_fallback": "Mostra categorie",
    "ui.filter_panel.tags_title_fallback": "Mostra tag",
    "ui.filter_panel.no_categories": "Nessuna categoria disponibile sui livelli visibili",
    "ui.filter_panel.no_tags": "Nessun tag disponibile sui livelli visibili",
    "ui.filter_panel.loading": "Caricamento...",
    "ui.notification.close_char": "\u00d7",
    "ui.branding.default_text": "Sviluppato da \u00a9 GeoLeaf with MapLibre",
    "ui.branding.not_configured": "\u26a0 Branding non configurato",
    "ui.offline.badge": "\u26a0\ufe0f Non in linea",
    "aria.offline.badge_title": "Modalit\u00e0 offline attiva",
    "ui.theme.select_placeholder": "Seleziona un tema...",
    "ui.table.layer_placeholder": "Seleziona un livello...",
    "ui.themes.nav_prev_char": "\u276e",
    "ui.themes.nav_next_char": "\u276f",
    "format.proximity.radius": "{0} km",
    "format.scale.unit_km": "{0} km",
    "format.scale.unit_m": "{0} m",
    "format.zoom.level": "Zoom: {0}",
};

const lang_de = {
    "toast.geoloc.position_found": "Position gefunden",
    "toast.geoloc.locating": "Ortung l\u00e4uft\u2026",
    "toast.geoloc.error.default": "Position konnte nicht ermittelt werden",
    "toast.geoloc.error.permission_denied": "Standortberechtigung verweigert",
    "toast.geoloc.error.position_unavailable": "Position nicht verf\u00fcgbar",
    "toast.geoloc.error.timeout": "Zeitlimit f\u00fcr Geolokalisierung \u00fcberschritten",
    "toast.init.loading": "Daten werden geladen, bitte warten.",
    "toast.profile.loaded": "{0} geladen",
    "toast.theme.applied": 'Thema "{0}" geladen ({1} sichtbare Ebenen)',
    "aria.fullscreen.enter": "Vollbild",
    "aria.fullscreen.enter_label": "Vollbildmodus aktivieren",
    "aria.fullscreen.exit": "Vollbild beenden",
    "aria.fullscreen.exit_label": "Vollbildmodus beenden",
    "aria.geoloc.toggle": "Geolokalisierung AN/AUS",
    "aria.geoloc.toggle_label": "GPS-Tracking aktivieren/deaktivieren",
    "aria.geoloc.recenter": "Zur\u00fcck zu meiner Position",
    "aria.poi_add.title": "POI hinzuf\u00fcgen",
    "aria.poi_add.label": "Einen neuen Interessenpunkt hinzuf\u00fcgen",
    "aria.toolbar.root": "Kartenwerkzeuge",
    "aria.toolbar.scroll_up": "Nach oben scrollen",
    "aria.toolbar.scroll_down": "Nach unten scrollen",
    "aria.toolbar.fullscreen": "Vollbild",
    "aria.toolbar.zoom_in": "Vergr\u00f6\u00dfern",
    "aria.toolbar.zoom_out": "Verkleinern",
    "aria.toolbar.geoloc": "Meine Position",
    "aria.toolbar.themes": "Themen",
    "tooltip.toolbar.themes": "Themen / sekund\u00e4re Themenoptionen",
    "aria.toolbar.legend": "Legende",
    "tooltip.toolbar.legend": "Kartenlegende",
    "aria.toolbar.layers": "Ebenen",
    "tooltip.toolbar.layers": "Schichtenmanager",
    "aria.toolbar.table": "Datentabelle",
    "aria.toolbar.poi_add": "POI hinzuf\u00fcgen",
    "tooltip.toolbar.poi_add": "Einen Interessenpunkt hinzuf\u00fcgen",
    "aria.toolbar.search": "Suchen",
    "tooltip.toolbar.search": "Textsuche",
    "aria.toolbar.proximity": "Umgebung",
    "tooltip.toolbar.proximity": "Umgebungssuche",
    "aria.toolbar.filters": "Filter",
    "aria.toolbar.reset_filters": "Alle Filter zur\u00fccksetzen",
    "tooltip.toolbar.filters": "Erweiterte Filter",
    "aria.search.bar": "Textsuche",
    "aria.search.input": "Suchtext",
    "aria.search.submit": "Suche absenden",
    "aria.search.clear": "Suche l\u00f6schen",
    "placeholder.search.input": "Suchen...",
    "aria.sheet.close": "Schlie\u00dfen",
    "aria.proximity.region": "Einstellungen Umgebungssuche",
    "aria.proximity.slider": "Suchradius in Kilometern",
    "aria.proximity.validate": "Umgebungssuche best\u00e4tigen",
    "aria.proximity.cancel": "Umgebungssuche abbrechen",
    "aria.layer.toggle": "Ebene anzeigen / ausblenden",
    "aria.themes.nav_prev": "Vorherige Themen",
    "aria.themes.nav_next": "N\u00e4chste Themen",
    "aria.themes.prev_title": "Vorheriges Thema",
    "aria.themes.next_title": "N\u00e4chstes Thema",
    "aria.themes.secondary_select": "Sekund\u00e4re Themenauswahl",
    "aria.filter_panel.open": "Filterbereich \u00f6ffnen",
    "aria.filter_panel.close": "Filterbereich schlie\u00dfen",
    "aria.filter_panel.close_inner": "Panel schlie\u00dfen",
    "aria.panel.nav": "Navigationsbereich",
    "aria.panel.lateral": "Seitenleiste",
    "aria.sidepanel.close": "Schlie\u00dfen",
    "aria.sidepanel.landmark": "Detailansicht des Interessenpunkts",
    "aria.lightbox.title": "Bildergalerie",
    "aria.lightbox.close": "Schlie\u00dfen",
    "aria.lightbox.prev": "Vorheriges Bild",
    "aria.lightbox.next": "N\u00e4chstes Bild",
    "aria.lightbox.counter": "Bild {0} von {1}",
    "aria.table.hide": "Tabelle ausblenden",
    "aria.table.show": "Tabelle einblenden",
    "aria.legend.toggle": "Legende umschalten",
    "aria.labels.toggle": "Beschriftungen ein-/ausblenden",
    "aria.theme.toggle_to_light": "Zum hellen Design wechseln",
    "aria.theme.toggle_to_dark": "Zum dunklen Design wechseln",
    "aria.notification.close_label": "Benachrichtigung schlie\u00dfen",
    "aria.notification.close_title": "Schlie\u00dfen",
    "ui.proximity.point_placed": "\u2713 Radius anpassen",
    "ui.proximity.instruction_initial": "Karte ber\u00fchren",
    "ui.filter.activate": "Aktivieren",
    "ui.filter.disable": "Deaktivieren",
    "sheet.title.zoom": "Zoom",
    "sheet.title.geoloc": "Mein Standort",
    "sheet.title.search": "Suche",
    "sheet.title.proximity": "Umgebung",
    "sheet.title.filters": "Filter",
    "sheet.title.legend": "Legende",
    "sheet.title.layers": "Ebenen",
    "sheet.title.table": "Tabelle",
    "sheet.title.themes": "Themen (Haupt und Neben)",
    "ui.layer_manager.empty": "Keine Ebenen anzuzeigen.",
    "ui.filter_panel.title": "Filter",
    "ui.filter_panel.apply": "Anwenden",
    "ui.filter_panel.reset": "Zur\u00fccksetzen",
    "ui.filter_panel.categories_title_fallback": "Kategorien anzeigen",
    "ui.filter_panel.tags_title_fallback": "Tags anzeigen",
    "ui.filter_panel.no_categories": "Keine Kategorien in sichtbaren Ebenen vorhanden",
    "ui.filter_panel.no_tags": "Keine Tags in sichtbaren Ebenen vorhanden",
    "ui.filter_panel.loading": "Laden...",
    "ui.notification.close_char": "\u00d7",
    "ui.branding.default_text": "Entwickelt von \u00a9 GeoLeaf with MapLibre",
    "ui.branding.not_configured": "\u26a0 Branding nicht konfiguriert",
    "ui.offline.badge": "\u26a0\ufe0f Offline",
    "aria.offline.badge_title": "Offline-Modus aktiv",
    "ui.theme.select_placeholder": "Ein Thema ausw\u00e4hlen...",
    "ui.table.layer_placeholder": "Eine Ebene ausw\u00e4hlen...",
    "ui.themes.nav_prev_char": "\u276e",
    "ui.themes.nav_next_char": "\u276f",
    "format.proximity.radius": "{0} km",
    "format.scale.unit_km": "{0} km",
    "format.scale.unit_m": "{0} m",
    "format.zoom.level": "Zoom: {0}",
};

const LANGS = {
    fr: lang_fr,
    en: lang_en,
    es: lang_es,
    pt: lang_pt,
    it: lang_it,
    de: lang_de,
    al: lang_de, // "al" = Allemand (French shorthand for German)
};
let _active = lang_fr;
let _overrides = {};
let _initialized = false;
// Plugin i18n support — namespace → { lang → dict }
const _pluginDicts = {};
let _pluginActive = {};
let _pluginFr = {};
function _rebuildPluginFlat() {
    const activeLang = _initialized
        ? (Object.keys(LANGS).find((k) => LANGS[k] === _active) ?? "fr")
        : "fr";
    _pluginActive = {};
    _pluginFr = {};
    for (const ns of Object.keys(_pluginDicts)) {
        Object.assign(_pluginActive, _pluginDicts[ns][activeLang] ?? {});
        Object.assign(_pluginFr, _pluginDicts[ns]["fr"] ?? {});
    }
}
/** Initialize i18n from config. Called once after config is loaded. */
function initI18n() {
    const urlLang = new URLSearchParams(window.location.search).get("lang")?.toLowerCase() ?? null;
    const configCode = Config.get?.("ui.language", "fr")?.toLowerCase() ?? "fr";
    const code = urlLang ?? configCode;
    _active = LANGS[code] ?? lang_fr;
    _overrides = Config.get?.("labels", {}) ?? {};
    _initialized = true;
    _rebuildPluginFlat();
}
/**
 * Registers a plugin i18n dictionary. Must be called before `GeoLeaf.boot()`.
 * Keys are namespaced (e.g. `"print.toolbar.button"`) and merged into the
 * resolution table without overwriting core keys.
 *
 * @param namespace - Plugin identifier used for deduplication (e.g. `"print"`).
 * @param dictsByLang - Map of language code → `LangDict` (keys: `"fr"`, `"en"`, …).
 */
function registerDict(namespace, dictsByLang) {
    _pluginDicts[namespace] = dictsByLang;
    _rebuildPluginFlat();
}
/**
 * Returns the localised label for `key`, optionally interpolating positional args.
 * Resolution order: profile overrides → active lang (core + plugins) → French (core + plugins) → key.
 *
 * @example getLabel("toast.geoloc.position_found")
 * @example getLabel("toast.geoloc.error_timeout", "timeout")
 */
function getLabel(key, ...args) {
    if (!_initialized)
        initI18n();
    let label = _overrides[key] ?? _active[key] ?? _pluginActive[key] ?? lang_fr[key] ?? _pluginFr[key] ?? key;
    for (let i = 0; i < args.length; i++) {
        label = label.replace(`{${i}}`, args[i]);
    }
    return label;
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
const _gl$2 = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {});
function _resolveCategoryId(poi) {
    return (poi.categoryId ??
        poi.category ??
        poi.attributes?.categoryId ??
        poi.properties?.categoryId ??
        poi.properties?.category);
}
function _resolveSubCategoryId(poi) {
    return (poi.subCategoryId ??
        poi.subCategory ??
        poi.sub_category ??
        poi.attributes?.subCategoryId ??
        poi.properties?.subCategoryId ??
        poi.properties?.sub_category);
}
function getColorsFromLayerStyle(poi, layerId) {
    if (!poi || !layerId)
        return null;
    const layerData = _gl$2.GeoLeaf?._GeoJSONShared?.state?.layers?.get(layerId);
    if (!layerData)
        return null;
    const styleConfig = layerData.currentStyle;
    if (!styleConfig?.styleRules)
        return null;
    const categoryId = _resolveCategoryId(poi);
    const subCategoryId = _resolveSubCategoryId(poi);
    if (subCategoryId) {
        const rule = styleConfig.styleRules.find((r) => r.when?.field === "properties.subCategoryId" && r.when?.value === subCategoryId);
        if (rule?.style) {
            return {
                fillColor: rule.style.fillColor,
                color: rule.style.color,
                colorFill: rule.style.fillColor,
                colorStroke: rule.style.color,
            };
        }
    }
    if (categoryId) {
        const rule = styleConfig.styleRules.find((r) => r.when?.field === "properties.categoryId" && r.when?.value === categoryId);
        if (rule?.style) {
            return {
                fillColor: rule.style.fillColor,
                color: rule.style.color,
                colorFill: rule.style.fillColor,
                colorStroke: rule.style.color,
            };
        }
    }
    if (styleConfig.defaultStyle) {
        return {
            fillColor: styleConfig.defaultStyle.fillColor,
            color: styleConfig.defaultStyle.color,
            colorFill: styleConfig.defaultStyle.fillColor,
            colorStroke: styleConfig.defaultStyle.color,
        };
    }
    return null;
}
function resolvePoiColors(poi) {
    const colors = {
        colorFill: null,
        colorStroke: null,
        colorRoute: null,
    };
    if (!poi?._layerConfig)
        return colors;
    const layerId = poi._layerConfig.id;
    const styleColors = getColorsFromLayerStyle(poi, layerId);
    if (styleColors) {
        colors.colorFill = styleColors.fillColor ?? styleColors.colorFill ?? null;
        colors.colorStroke = styleColors.color ?? styleColors.colorStroke ?? null;
        colors.colorRoute = styleColors.color ?? styleColors.colorStroke ?? null;
    }
    return colors;
}
const StyleResolver = {
    getColorsFromLayerStyle,
    resolvePoiColors,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
function _validateSingleRule(rule, index, errors, warnings, context) {
    const ruleContext = { ...context, ruleIndex: index };
    if (typeof rule !== "object" || rule === null) {
        errors.push({
            field: `styleRules[${index}]`,
            message: `La r\u00e8gle doit \u00eatre un object`,
            context: ruleContext,
        });
        return;
    }
    const r = rule;
    if (!r.when)
        errors.push({
            field: `styleRules[${index}].when`,
            message: `Le field 'when' est required`,
            context: ruleContext,
        });
    else
        validateWhenCondition(r.when, index, errors, warnings, ruleContext);
    if (!r.style)
        errors.push({
            field: `styleRules[${index}].style`,
            message: `Le field 'style' est required`,
            context: ruleContext,
        });
    else if (typeof r.style !== "object" || r.style === null)
        errors.push({
            field: `styleRules[${index}].style`,
            message: `Le style doit \u00eatre un object`,
            context: { received: typeof r.style, ...ruleContext },
        });
    if (r.legend && typeof r.legend !== "object")
        errors.push({
            field: `styleRules[${index}].legend`,
            message: `legend doit \u00eatre un object`,
            context: { received: typeof r.legend, ...ruleContext },
        });
}
function validateStyleRules(rules, errors, warnings, context) {
    if (!Array.isArray(rules)) {
        errors.push({
            field: "styleRules",
            message: `styleRules doit \u00eatre un table`,
            context: { received: typeof rules, ...context },
        });
        return;
    }
    rules.forEach((rule, index) => _validateSingleRule(rule, index, errors, warnings, context));
}
function validateWhenCondition(when, ruleIndex, errors, _warnings, context) {
    if (typeof when !== "object" || when === null) {
        errors.push({
            field: `styleRules[${ruleIndex}].when`,
            message: `when must be un object`,
            context: { received: typeof when, ...context },
        });
        return;
    }
    const w = when;
    if (w.all && Array.isArray(w.all)) {
        w.all.forEach((condition, condIndex) => {
            validateSimpleCondition(condition, ruleIndex, condIndex, errors, context);
        });
        return;
    }
    validateSimpleCondition(w, ruleIndex, null, errors, context);
}
function validateSimpleCondition(condition, ruleIndex, condIndex, errors, context) {
    const c = condition;
    const required = ["field", "operator", "value"];
    for (const field of required) {
        if (!(field in c)) {
            const prefix = condIndex !== null
                ? `styleRules[${ruleIndex}].when.all[${condIndex}]`
                : `styleRules[${ruleIndex}].when`;
            errors.push({
                field: `${prefix}.${field}`,
                message: `Le field '${field}' est required dans la condition`,
                context,
            });
        }
    }
    const validOperators = ["==", "!=", "<", ">", "<=", ">=", "in", "contains"];
    if (c.operator && !validOperators.includes(c.operator)) {
        const prefix = condIndex !== null
            ? `styleRules[${ruleIndex}].when.all[${condIndex}]`
            : `styleRules[${ruleIndex}].when`;
        errors.push({
            field: `${prefix}.operator`,
            message: `Invalid operator`,
            context: { received: c.operator, allowed: validOperators, ...context },
        });
    }
    if (c.field && typeof c.field !== "string") {
        const prefix = condIndex !== null
            ? `styleRules[${ruleIndex}].when.all[${condIndex}]`
            : `styleRules[${ruleIndex}].when`;
        errors.push({
            field: `${prefix}.field`,
            message: `field must be une string de characters`,
            context: { received: typeof c.field, ...context },
        });
    }
}
function validateScales(styleData, errors, _warnings, context) {
    // "zoomConfig" is the canonical key; "layerScale" is the legacy fallback
    const scaleFieldsToValidate = [
        "zoomConfig" in styleData ? "zoomConfig" : "layerScale",
        "labelScale",
    ];
    scaleFieldsToValidate.forEach((scaleField) => {
        const isRequired = scaleField === "zoomConfig" || scaleField === "layerScale";
        if (!styleData[scaleField]) {
            if (isRequired) {
                errors.push({
                    field: scaleField,
                    message: `${scaleField} est required`,
                    context,
                });
            }
            return;
        }
        const scale = styleData[scaleField];
        if (typeof scale !== "object" || scale === null) {
            errors.push({
                field: scaleField,
                message: `${scaleField} must be un object`,
                context: { received: typeof scale, ...context },
            });
            return;
        }
        // Accept minZoom/maxZoom (new) or minScale/maxScale (legacy)
        const minKey = "minZoom" in scale ? "minZoom" : "minScale";
        const maxKey = "maxZoom" in scale ? "maxZoom" : "maxScale";
        [minKey, maxKey].forEach((prop) => {
            if (!(prop in scale)) {
                if (isRequired) {
                    errors.push({
                        field: `${scaleField}.${prop}`,
                        message: `${prop} est required dans ${scaleField}`,
                        context,
                    });
                }
                return;
            }
            if (scale[prop] !== null) {
                if (typeof scale[prop] !== "number" || scale[prop] < 0) {
                    errors.push({
                        field: `${scaleField}.${prop}`,
                        message: `${prop} must be un nombre >= 0 ou null`,
                        context: { received: scale[prop], ...context },
                    });
                }
            }
        });
    });
}
function validateLegend(legend, errors, _warnings, context) {
    if (typeof legend !== "object" || legend === null) {
        errors.push({
            field: "legend",
            message: `legend must be un object`,
            context: { received: typeof legend, ...context },
        });
        return;
    }
    const leg = legend;
    if ("order" in leg && !Number.isInteger(leg.order)) {
        errors.push({
            field: "legend.order",
            message: `order must be un entier`,
            context: { received: leg.order, type: typeof leg.order, ...context },
        });
    }
}
const StyleValidatorRules = {
    validateStyleRules,
    validateWhenCondition,
    validateSimpleCondition,
    validateScales,
    validateLegend,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * Classe d'error for thes validations de style
 */
class StyleValidationError extends Error {
    context;
    constructor(message, context = {}) {
        super(message);
        this.name = "StyleValidationError";
        this.context = context;
    }
}
/**
 * Valide les fields structurels required (id, style/defaultStyle, layerScale)
 */
function validateRequiredFields$1(styleData, errors, context) {
    if (!("id" in styleData) || styleData.id == null) {
        errors.push({
            field: "id",
            message: `Le field required 'id' est manquant`,
            context: { availableFields: Object.keys(styleData), ...context },
        });
    }
    const hasStyle = "style" in styleData && styleData.style != null;
    const hasDefaultStyle = "defaultStyle" in styleData && styleData.defaultStyle != null;
    if (!hasStyle && !hasDefaultStyle) {
        errors.push({
            field: "style",
            message: `Le field required 'style' ou 'defaultStyle' est manquant`,
            context: { availableFields: Object.keys(styleData), ...context },
        });
    }
    // Accept both new key (zoomConfig) and legacy key (layerScale)
    if (!("zoomConfig" in styleData) && !("layerScale" in styleData)) {
        errors.push({
            field: "zoomConfig",
            message: `Le field required 'zoomConfig' (ou 'layerScale' legacy) est manquant`,
            context: { availableFields: Object.keys(styleData), ...context },
        });
    }
}
/**
 * Valide le format of the ID (lettres Unicode, chiffres, tirets, underscores)
 */
function validateId(styleData, errors, context) {
    if (!styleData.id)
        return;
    // \p{L} = all Unicode letters (including accented, CJK, etc.)
    const idPattern = /^[\p{L}0-9_-]+$/u;
    if (typeof styleData.id !== "string") {
        errors.push({
            field: "id",
            message: `L'ID must be une string de characters`,
            context: { received: typeof styleData.id, value: styleData.id, ...context },
        });
    }
    else if (!idPattern.test(styleData.id)) {
        errors.push({
            field: "id",
            message: `L'ID doit contenir only des lettres, chiffres, tirets et underscores`,
            context: { received: styleData.id, pattern: idPattern.toString(), ...context },
        });
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * Checks if une color est au format hex valide (#RRGGBB)
 */
function isValidHexColor(color) {
    return typeof color === "string" && /^#[0-9A-Fa-f]{6}$/.test(color);
}
/**
 * Pousse une error si le field color est present mais invalid (#RRGGBB)
 */
function pushColorError(obj, key, fieldPath, errors, context) {
    if (obj[key] && !isValidHexColor(obj[key])) {
        errors.push({
            field: fieldPath,
            message: `Couleur invalide, format expected: #RRGGBB`,
            context: { received: obj[key], ...context },
        });
    }
}
/**
 * Pousse une error si le field opacity est present mais hors de la plage [0, 1]
 */
function pushOpacityError(obj, key, fieldPath, errors, context) {
    if (key in obj) {
        const val = obj[key];
        if (typeof val !== "number" || val < 0 || val > 1) {
            errors.push({
                field: fieldPath,
                message: `Opacity must be a number between 0 and 1`,
                context: { received: val, ...context },
            });
        }
    }
}
/**
 * Pousse une error si the numeric field is present but strictly negative
 */
function pushSizeError(obj, key, fieldPath, errors, context) {
    if (key in obj) {
        const val = obj[key];
        if (typeof val !== "number" || val < 0) {
            errors.push({
                field: fieldPath,
                message: `${key} must be un nombre >= 0`,
                context: { received: val, ...context },
            });
        }
    }
}

/*!

 * GeoLeaf Core

 * © 2026 Mattieu Pottier

 * Released under the MIT License

 * https://geoleaf.dev

 */
/**

 * Valide la configuration font of a label

 */
function validateFont(font, errors, _warnings, context) {
    if (typeof font !== "object" || font === null) {
        errors.push({
            field: "label.font",
            message: `La configuration font must be un object`,
            context: { received: typeof font, ...context },
        });
        return;
    }
    const f = font;
    if (f.sizePt !== undefined) {
        if (typeof f.sizePt !== "number" || f.sizePt < 1) {
            errors.push({
                field: "label.font.sizePt",
                message: `sizePt must be un nombre >= 1`,
                context: { received: f.sizePt, ...context },
            });
        }
    }
    if (f.weight !== undefined) {
        if (!Number.isInteger(f.weight) || f.weight < 0 || f.weight > 100) {
            errors.push({
                field: "label.font.weight",
                message: `weight must be un entier entre 0 et 100`,
                context: { received: f.weight, ...context },
            });
        }
    }
}
/**

 * Valide un component de label (buffer, background)

 */
function validateLabelComponent(component, fieldPath, errors, _warnings, context) {
    if (typeof component !== "object" || component === null) {
        errors.push({
            field: fieldPath,
            message: `${fieldPath} must be un object`,
            context: { received: typeof component, ...context },
        });
        return;
    }
    const comp = component;
    pushColorError(comp, "color", `${fieldPath}.color`, errors, context);
    pushOpacityError(comp, "opacity", `${fieldPath}.opacity`, errors, context);
    pushSizeError(comp, "sizePx", `${fieldPath}.sizePx`, errors, context);
}
/**

 * Valide le field label (can be string ou object de config label)

 */
function _validateLabelOffset(labelObj, errors, context) {
    if (!labelObj.offset)
        return;
    const offset = labelObj.offset;
    if (typeof offset.distancePx === "undefined")
        return;
    if (typeof offset.distancePx !== "number") {
        errors.push({
            field: "label.offset.distancePx",
            message: `distancePx must be un nombre`,
            context: { received: typeof offset.distancePx, ...context },
        });
    }
}
function _validateLabelObject(labelObj, label, errors, warnings, context) {
    if (!("enabled" in labelObj)) {
        errors.push({
            field: "label.enabled",
            message: `Le field 'enabled' est required dans la configuration de labels`,
            context: { labelConfig: label, ...context },
        });
    }
    else if (typeof labelObj.enabled !== "boolean") {
        errors.push({
            field: "label.enabled",
            message: `Le field 'enabled' must be un boolean`,
            context: { received: typeof labelObj.enabled, value: labelObj.enabled, ...context },
        });
    }
    if (labelObj.enabled && !labelObj.field) {
        warnings.push({
            field: "label.field",
            message: `Labels are enabled but no field is specified`,
            context: { labelConfig: label, ...context },
        });
    }
    if (labelObj.font)
        validateFont(labelObj.font, errors, warnings, context);
    pushColorError(labelObj, "color", "label.color", errors, context);
    pushOpacityError(labelObj, "opacity", "label.opacity", errors, context);
    if (labelObj.buffer)
        validateLabelComponent(labelObj.buffer, "label.buffer", errors, warnings, context);
    if (labelObj.background)
        validateLabelComponent(labelObj.background, "label.background", errors, warnings, context);
    _validateLabelOffset(labelObj, errors, context);
}
function validateLabel(styleData, errors, warnings, context) {
    if (!("label" in styleData))
        return;
    const label = styleData.label;
    if (typeof label === "string")
        return;
    if (typeof label === "object" && label !== null) {
        _validateLabelObject(label, label, errors, warnings, context);
        return;
    }
    errors.push({
        field: "label",
        message: `Le field 'label' must be une string de characters ou un object de configuration`,
        context: { received: typeof label, value: label, ...context },
    });
}
/**

 * Valide le stroke (lines)

 */
function validateStroke(stroke, errors, _warnings, context) {
    if (typeof stroke !== "object" || stroke === null) {
        errors.push({
            field: "style.stroke",
            message: `stroke must be un object`,
            context: { received: typeof stroke, ...context },
        });
        return;
    }
    const s = stroke;
    pushColorError(s, "color", "style.stroke.color", errors, context);
    pushOpacityError(s, "opacity", "style.stroke.opacity", errors, context);
    pushSizeError(s, "weight", "style.stroke.weight", errors, context);
    if (s.dashArray !== null && s.dashArray !== undefined && typeof s.dashArray !== "string") {
        errors.push({
            field: "style.stroke.dashArray",
            message: `dashArray must be une string de characters ou null`,
            context: { received: typeof s.dashArray, value: s.dashArray, ...context },
        });
    }
}
/**

 * Valide le caseing (lines)

 */
function validateCasing(casing, errors, _warnings, context) {
    if (typeof casing !== "object" || casing === null) {
        errors.push({
            field: "style.casing",
            message: `casing must be un object`,
            context: { received: typeof casing, ...context },
        });
        return;
    }
    const c = casing;
    if ("enabled" in c && typeof c.enabled !== "boolean") {
        errors.push({
            field: "style.casing.enabled",
            message: `enabled must be un boolean`,
            context: { received: typeof c.enabled, ...context },
        });
    }
    pushColorError(c, "color", "style.casing.color", errors, context);
}
/**

 * Valide le fillPattern (polygons)

 */
function validateFillPattern(pattern, errors, _warnings, context) {
    if (typeof pattern !== "object" || pattern === null) {
        errors.push({
            field: "style.fillPattern",
            message: `fillPattern must be un object`,
            context: { received: typeof pattern, ...context },
        });
        return;
    }
    const p = pattern;
    if ("enabled" in p && typeof p.enabled !== "boolean") {
        errors.push({
            field: "style.fillPattern.enabled",
            message: `enabled must be un boolean`,
            context: { received: typeof p.enabled, ...context },
        });
    }
    if (p.type &&
        !["diagonal", "horizontal", "vertical", "cross", "x"].includes(p.type)) {
        errors.push({
            field: "style.fillPattern.type",
            message: `type must be parmi: diagonal, horizontal, vertical, cross, x`,
            context: {
                received: p.type,
                allowed: ["diagonal", "horizontal", "vertical", "cross", "x"],
                ...context,
            },
        });
    }
    pushColorError(p, "color", "style.fillPattern.color", errors, context);
    pushSizeError(p, "weight", "style.fillPattern.weight", errors, context);
    pushSizeError(p, "density", "style.fillPattern.density", errors, context);
}
/**

 * Valide le style de base (style ou defaultStyle)

 */
function validateBaseStyle(styleData, errors, warnings, context) {
    const style = styleData.style || styleData.defaultStyle;
    if (!style)
        return;
    const styleObj = style;
    if (typeof styleObj !== "object" || styleObj === null) {
        errors.push({
            field: "style",
            message: `Le style must be un object`,
            context: { received: typeof styleObj, ...context },
        });
        return;
    }
    pushColorError(styleObj, "fillColor", "style.fillColor", errors, context);
    pushColorError(styleObj, "color", "style.color", errors, context);
    pushOpacityError(styleObj, "fillOpacity", "style.fillOpacity", errors, context);
    pushOpacityError(styleObj, "opacity", "style.opacity", errors, context);
    pushSizeError(styleObj, "weight", "style.weight", errors, context);
    pushSizeError(styleObj, "sizePx", "style.sizePx", errors, context);
    pushSizeError(styleObj, "radius", "style.radius", errors, context);
    if (styleObj.shape && !["circle", "square"].includes(styleObj.shape)) {
        errors.push({
            field: "style.shape",
            message: `shape must be 'circle' ou 'square'`,
            context: { received: styleObj.shape, allowed: ["circle", "square"], ...context },
        });
    }
    if (styleObj.stroke) {
        validateStroke(styleObj.stroke, errors, warnings, context);
    }
    if (styleObj.casing) {
        validateCasing(styleObj.casing, errors, warnings, context);
    }
    if (styleObj.fillPattern) {
        validateFillPattern(styleObj.fillPattern, errors, warnings, context);
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
function _formatErrorItems(items, label, icon, lines) {
    lines.push(`${icon}  ${items.length} ${label}:`);
    lines.push("");
    items.forEach((item, index) => {
        lines.push(`  ${index + 1}. Champ: ${item.field}`);
        lines.push(`     Message: ${item.message}`);
        if (item.context)
            lines.push(`     Contexte: ${JSON.stringify(item.context, null, 2).split("\n").join("\n     ")}`);
        const withStack = item;
        if (withStack.stack)
            lines.push(`     Stack: ${withStack.stack.split("\n").slice(0, 3).join("\n     ")}`);
        lines.push("");
    });
}
/**
 * Formats a result de validation en message d'error lisible.
 * Returns null si le style est valide.
 */
function formatValidationErrors(validationResult, styleFilePath = "") {
    if (validationResult.valid)
        return null;
    const lines = [];
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("\u274c ERREUR DE VALIDATION DE STYLE GEOLEAF");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    if (styleFilePath) {
        lines.push(`Fichier: ${styleFilePath}`);
        lines.push("");
    }
    if (validationResult.errors.length > 0)
        _formatErrorItems(validationResult.errors, "error(s) d\u00e9tect\u00e9e(s):", "\u274c", lines);
    if (validationResult.warnings.length > 0)
        _formatErrorItems(validationResult.warnings, "warning(s):", "\u26a0\ufe0f", lines);
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("\ud83d\udca1 Conseil: V\u00e9rifiez la documentation dans docs/STYLE_FORMAT_SPEC.md");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    return lines.join("\n");
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @fileoverview Validateur de files de style GeoLeaf — orchestrateur
 * Valide les files style.json contre le schema JSON defined
 * and generates detailed errors with context to facilitate debugging
 * @module validators/style-validator
 */
/**
 * Valide an object de style contre le schema JSON
 */
function validateStyle(styleData, context = {}) {
    const errors = [];
    const warnings = [];
    try {
        if (!styleData || typeof styleData !== "object") {
            errors.push({
                field: "root",
                message: "Le style must be un object JSON valide",
                context: { received: typeof styleData, ...context },
            });
            return { valid: false, errors, warnings };
        }
        validateRequiredFields$1(styleData, errors, context);
        validateId(styleData, errors, context);
        validateLabel(styleData, errors, warnings, context);
        validateBaseStyle(styleData, errors, warnings, context);
        if (styleData.styleRules) {
            validateStyleRules(styleData.styleRules, errors, warnings, context);
        }
        validateScales(styleData, errors, warnings, context);
        if (styleData.legend) {
            validateLegend(styleData.legend, errors, warnings, context);
        }
    }
    catch (error) {
        errors.push({
            field: "validation",
            message: `Erreur inexpectede lors de la validation: ${error.message}`,
            stack: error.stack,
            context,
        });
    }
    return { valid: errors.length === 0, errors, warnings };
}
/**
 * Module Style Validator — expose les fonctions publiques
 */
const StyleValidator = {
    validateStyle,
    formatValidationErrors,
    StyleValidationError,
};

/**
 * @fileoverview Abstract Renderer Base Class
 * @description Base class providing common functionality for all renderers
 * @version 1.2.0
 * @phase Phase 5 - Code Optimization
 *
 * @author GeoLeaf Team
 * @since 3.1.0
 *
 * @benefits
 * - Eliminates ~20% code duplication across renderers
 * - Unified dependency resolution pattern
 * - Consistent error handling and logging
 * - Easier testing and maintenance
 */
// Lazy access to GeoLeaf namespace (globalThis fallback for non-ESM consumers)
const _gl$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
function _resolvePathInObject(obj, path) {
    const parts = String(path).split(".");
    let current = obj;
    for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
            current = current[part];
        }
        else {
            return null;
        }
    }
    return current != null ? current : null;
}
/**
 * @class AbstractRenderer
 * @description Base class for all renderer implementations
 *
 * Common Patterns Extracted:
 * - Dependency resolution (Log, Security, Config, Utils)
 * - DOM element creation helpers
 * - Event handler registration/cleanup
 * - State management
 * - Error handling and logging
 *
 * @example
 * class MyCustomRenderer extends AbstractRenderer {
 *     constructor(options) {
 *         super(options);
 *         this.init();
 *     }
 *
 *     render(data) {
 *         this.log('info', 'Rendering data', data);
 *         const element = this.createElement('div', 'my-class');
 *         // ... custom rendering logic
 *         return element;
 *     }
 * }
 */
class AbstractRenderer {
    /**
     * @constructor
     * @param {Object} [options={}] - Renderer configuration options
     * @param {string} [options.name='Renderer'] - Renderer name for logging
     * @param {Object} [options.config={}] - Custom configuration
     * @param {boolean} [options.debug=false] - Enable debug logging
     */
    constructor(options = {}) {
        this._name = options.name || "Renderer";
        this._config = options.config || {};
        this._debug = options.debug || false;
        this._eventListeners = [];
        this._initialized = false;
        this._stateMap = new WeakMap();
    }
    // ========================================
    //   DEPENDENCY RESOLUTION
    // ========================================
    /**
     * Get Log utility with fallback
     * @protected
     * @returns {Object} Log object
     */
    getLog() {
        return _gl$1.GeoLeaf && _gl$1.GeoLeaf.Log ? _gl$1.GeoLeaf.Log : console;
    }
    /**
     * Get Security utilities with fallback
     * @protected
     * @returns {Object} Security object with escapeHtml function
     */
    getSecurity() {
        if (_gl$1.GeoLeaf &&
            _gl$1.GeoLeaf.Security &&
            typeof _gl$1.GeoLeaf.Security.escapeHtml === "function") {
            return _gl$1.GeoLeaf.Security;
        }
        // Fallback security utilities
        return {
            escapeHtml: (str) => {
                if (str == null)
                    return "";
                const div = document.createElement("div");
                div.textContent = String(str);
                return div.innerHTML;
            },
            setSafeHTML: (element, html) => {
                if (!element)
                    return;
                DOMSecurity.setSafeHTML(element, html);
            },
        };
    }
    /**
     * Get Utils with field resolution
     * @protected
     * @returns {Object} Utils object with resolveField function
     */
    getUtils() {
        if (_gl$1.GeoLeaf &&
            _gl$1.GeoLeaf.Utils &&
            typeof _gl$1.GeoLeaf.Utils.resolveField === "function") {
            return _gl$1.GeoLeaf.Utils;
        }
        // Fallback resolveField implementation
        return {
            resolveField: (obj, ...paths) => {
                if (!obj)
                    return null;
                for (const path of paths) {
                    if (!path)
                        continue;
                    const result = _resolvePathInObject(obj, path);
                    if (result != null)
                        return result;
                }
                return null;
            },
        };
    }
    /**
     * Get active profile configuration
     * @protected
     * @returns {Object|null} Active profile or null
     */
    getActiveProfile() {
        if (_gl$1.GeoLeaf &&
            _gl$1.GeoLeaf.Config &&
            typeof _gl$1.GeoLeaf.Config.getActiveProfile === "function") {
            return _gl$1.GeoLeaf.Config.getActiveProfile() || null;
        }
        return null;
    }
    // ========================================
    //   LOGGING UTILITIES
    // ========================================
    /**
     * Log message with level
     * @protected
     * @param {string} level - Log level (debug, info, warn, error)
     * @param {string} message - Log message
     * @param {...*} args - Additional arguments
     */
    log(level, message, ...args) {
        if (level === "debug" && !this._debug)
            return;
        const log = this.getLog();
        const prefix = `[${this._name}]`;
        switch (level) {
            case "debug":
            case "info":
                log.info(prefix, message, ...args);
                break;
            case "warn":
                log.warn(prefix, message, ...args);
                break;
            case "error":
                log.error(prefix, message, ...args);
                break;
            default:
                log.info(prefix, message, ...args);
        }
    }
    /**
     * Log debug message (if debug enabled)
     * @protected
     * @param {string} message - Debug message
     * @param {...*} args - Additional arguments
     */
    debug(message, ...args) {
        this.log("debug", message, ...args);
    }
    /**
     * Log info message
     * @protected
     * @param {string} message - Info message
     * @param {...*} args - Additional arguments
     */
    info(message, ...args) {
        this.log("info", message, ...args);
    }
    /**
     * Log warning message
     * @protected
     * @param {string} message - Warning message
     * @param {...*} args - Additional arguments
     */
    warn(message, ...args) {
        this.log("warn", message, ...args);
    }
    /**
     * Log error message
     * @protected
     * @param {string} message - Error message
     * @param {...*} args - Additional arguments
     */
    error(message, ...args) {
        this.log("error", message, ...args);
    }
    // ========================================
    //   DOM BUILDERS
    // ========================================
    /**
     * Create DOM element with class and attributes
     * @protected
     * @param {string} tagName - HTML tag name
     * @param {string|Array<string>} [className] - CSS class name(s)
     * @param {Object} [attributes={}] - HTML attributes
     * @returns {HTMLElement} Created element
     *
     * @example
     * const div = this.createElement('div', 'my-class', { id: 'my-id', 'data-value': '123' });
     * const button = this.createElement('button', ['btn', 'btn-primary'], { type: 'button' });
     */
    createElement(tagName, className, attributes = {}) {
        const element = document.createElement(tagName);
        if (className) {
            if (Array.isArray(className)) {
                element.classList.add(...className);
            }
            else {
                element.className = className;
            }
        }
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });
        return element;
    }
    /**
     * Create text node with safe content
     * @protected
     * @param {string} text - Text content
     * @returns {Text} Text node
     */
    createTextNode(text) {
        return document.createTextNode(text || "");
    }
    /**
     * Create element with safe text content
     * @protected
     * @param {string} tagName - HTML tag name
     * @param {string} text - Text content
     * @param {string} [className] - CSS class name
     * @returns {HTMLElement} Element with text
     */
    createTextElement(tagName, text, className) {
        const element = this.createElement(tagName, className);
        element.textContent = text || "";
        return element;
    }
    /**
     * Create element with safe HTML content
     * @protected
     * @param {string} tagName - HTML tag name
     * @param {string} html - HTML content (will be sanitized)
     * @param {string} [className] - CSS class name
     * @returns {HTMLElement} Element with HTML
     */
    createHTMLElement(tagName, html, className) {
        const element = this.createElement(tagName, className);
        const security = this.getSecurity();
        security.setSafeHTML(element, html);
        return element;
    }
    /**
     * Append multiple children to parent element
     * @protected
     * @param {HTMLElement} parent - Parent element
     * @param {...HTMLElement} children - Child elements to append
     * @returns {HTMLElement} Parent element (for chaining)
     */
    appendChildren(parent, ...children) {
        children.forEach((child) => {
            if (child)
                parent.appendChild(child);
        });
        return parent;
    }
    // ========================================
    //   EVENT HANDLING
    // ========================================
    /**
     * Register event listner with automatic cleanup
     * @protected
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} [options] - Event listner options
     * @returns {Function} Cleanup function
     */
    addEventListener(element, event, handler, options) {
        if (!element || !event || !handler) {
            this.warn("addEventListener: invalid parameters");
            return () => { };
        }
        const boundHandler = handler.bind(this);
        element.addEventListener(event, boundHandler, options);
        // Store for cleanup
        const cleanup = () => {
            element.removeEventListener(event, boundHandler, options);
        };
        this._eventListeners.push(cleanup);
        return cleanup;
    }
    /**
     * Remove all registered event listners
     * @protected
     */
    removeAllEventListeners() {
        this._eventListeners.forEach((cleanup) => cleanup());
        this._eventListeners = [];
    }
    // ========================================
    //   STATE MANAGEMENT
    // ========================================
    /**
     * Set element state
     * @protected
     * @param {HTMLElement} element - Element to store state for
     * @param {Object} state - State data
     */
    setState(element, state) {
        if (element) {
            this._stateMap.set(element, { ...state });
        }
    }
    /**
     * Get element state
     * @protected
     * @param {HTMLElement} element - Element to get state from
     * @returns {Object|null} Element state or null
     */
    getState(element) {
        return element ? this._stateMap.get(element) || null : null;
    }
    /**
     * Update element state (merge with existing)
     * @protected
     * @param {HTMLElement} element - Element to update state for
     * @param {Object} updates - State updates to merge
     */
    updateState(element, updates) {
        if (element) {
            const currentState = this.getState(element) || {};
            this.setState(element, { ...currentState, ...updates });
        }
    }
    /**
     * Delete element state
     * @protected
     * @param {HTMLElement} element - Element to delete state for
     */
    deleteState(element) {
        if (element) {
            this._stateMap.delete(element);
        }
    }
    // ========================================
    //   LIFECYCLE METHODS
    // ========================================
    /**
     * Initialize renderer (called in constructor or manually)
     * Override in subclasses for custom initialization
     * @protected
     */
    init() {
        if (this._initialized) {
            this.warn("Renderer already initialized");
            return;
        }
        this.debug("Initializing renderer");
        this._initialized = true;
    }
    /**
     * Check if renderer is initialized
     * @public
     * @returns {boolean} true if initialized
     */
    isInitialized() {
        return this._initialized;
    }
    /**
     * Destroy renderer and cleanup resources
     * @public
     */
    destroy() {
        this.debug("Destroying renderer");
        this.removeAllEventListeners();
        this._stateMap = new WeakMap();
        this._initialized = false;
    }
    // ========================================
    //   ABSTRACT METHODS (to be overridden)
    // ========================================
    /**
     * Render content (must be implemented by subclasses)
     * @abstract
     * @param {*} data - Data to render
     * @param {Object} [options] - Render options
     * @returns {HTMLElement|string|null} Rendered content
     * @throws {Error} If not implemented
     */
    render(_data, _options) {
        throw new Error(`${this._name}.render() must be implemented by subclass`);
    }
}

/**
 * @fileoverview Example Renderer Implementation using AbstractRenderer
 * @description Demonstrates how to extend AbstractRenderer base class
 * @version 1.2.0
 * @phase Phase 5 - Code Optimization
 *
 * @example Usage
 * ```javascript
 * const renderer = new GeoLeaf._Renderers.SimpleTextRenderer({
 *     name: 'SimpleTextRenderer',
 *     debug: true
 * });
 *
 * const element = renderer.render({
 *     title: 'Hello World',
 *     description: 'This is a test'
 * });
 *
 * document.body.appendChild(element);
 * ```
 */
/**
 * @class SimpleTextRenderer
 * @extends AbstractRenderer
 * @description Simple renderer for text-based POI information
 *
 * Shows how to:
 * - Extend AbstractRenderer
 * - Use inherited utilities (createElement, log, etc.)
 * - Implement render() method
 * - Leverage dependency resolution
 * - Use state management
 * - Handle events with automatic cleanup
 */
class SimpleTextRenderer extends AbstractRenderer {
    /**
     * @constructor
     * @param {Object} [options={}] - Renderer options
     * @param {boolean} [options.showIcon=true] - Show icon in title
     * @param {string} [options.theme='light'] - Theme (light/dark)
     */
    constructor(options = {}) {
        super({
            name: "SimpleTextRenderer",
            debug: options.debug || false,
            config: {
                showIcon: options.showIcon !== false,
                theme: options.theme || "light",
            },
        });
        this.init();
    }
    /**
     * Override init for custom initialization
     * @protected
     */
    init() {
        super.init();
        this.debug("Initializing with config:", this._config);
    }
    /**
     * Render POI data as HTML element
     * @override
     * @param {Object} poi - POI data
     * @param {string} poi.title - POI title
     * @param {string} [poi.description] - POI description
     * @param {string} [poi.categoryId] - Category ID for icon
     * @param {Object} [options={}] - Render options
     * @param {string} [options.context='default'] - Render context
     * @returns {HTMLElement} Rendered element
     */
    render(poi, options = {}) {
        if (!poi) {
            this.warn("render: no POI data provided");
            return null;
        }
        this.debug("Rendering POI:", poi.title || poi.id);
        // Create container
        const container = this.createElement("div", "simple-text-renderer", {
            "data-poi-id": poi.id || "unknown",
            "data-context": options.context || "default",
        });
        // Store state
        this.setState(container, {
            poi: poi,
            renderTime: Date.now(),
            context: options.context,
        });
        // Render title
        const title = this._renderTitle(poi);
        if (title)
            container.appendChild(title);
        // Render description
        const description = this._renderDescription(poi);
        if (description)
            container.appendChild(description);
        // Add clickk handler example
        this.addEventListener(container, "click", (e) => {
            this._handleClick(e, poi);
        });
        this.info("Rendered POI successfully");
        return container;
    }
    /**
     * Render title element
     * @private
     * @param {Object} poi - POI data
     * @returns {HTMLElement} Title element
     */
    _renderTitle(poi) {
        const utils = this.getUtils();
        const title = utils.resolveField(poi, "title", "label", "name") || "Untitled";
        const titleElement = this.createTextElement("h3", title, "simple-text-renderer__title");
        // Add icon if enabled
        if (this._config.showIcon && poi.categoryId) {
            const icon = this._createIcon(poi.categoryId);
            if (icon) {
                titleElement.insertBefore(icon, titleElement.firstChild);
            }
        }
        return titleElement;
    }
    /**
     * Render description element
     * @private
     * @param {Object} poi - POI data
     * @returns {HTMLElement|null} Description element or null
     */
    _renderDescription(poi) {
        const utils = this.getUtils();
        const description = utils.resolveField(poi, "description", "desc");
        if (!description)
            return null;
        return this.createTextElement("p", description, "simple-text-renderer__description");
    }
    /**
     * Create icon element
     * @private
     * @param {string} categoryId - Category ID
     * @returns {HTMLElement|null} Icon element or null
     */
    _createIcon(_categoryId) {
        const profile = this.getActiveProfile();
        if (!profile || !profile.icons)
            return null;
        const iconSpan = this.createElement("span", "simple-text-renderer__icon");
        iconSpan.textContent = "📍"; // Fallback emoji icon
        iconSpan.style.marginRight = "8px";
        return iconSpan;
    }
    /**
     * Handle container clickk
     * @private
     * @param {MouseEvent} event - Clickk event
     * @param {Object} poi - POI data
     */
    _handleClick(event, poi) {
        const state = this.getState(event.currentTarget);
        this.info("Clicked POI:", poi.title, "State:", state);
        // Update state
        this.updateState(event.currentTarget, {
            lastClicked: Date.now(),
            clickCount: (state.clickCount || 0) + 1,
        });
        // Dispatch custom event
        const customEvent = new CustomEvent("poi:click", {
            detail: { poi, state },
            bubbles: true,
        });
        event.currentTarget.dispatchEvent(customEvent);
    }
    /**
     * Override destroy for custom cleanup
     * @override
     * @public
     */
    destroy() {
        this.debug("Destroying SimpleTextRenderer");
        super.destroy();
    }
}

/**
 * GeoLeaf Data Normalizer Module
 * Module central for the normalisation des data provenant de different sources.
 * Converts JSON, GeoJSON, GPX (future) et Routes vers un format POI unified.
 *
 * @module data/normalizer
 * @version 1.2.0
 */
// ========================================
//   TYPES DE SOURCES
// ========================================
const SOURCE_TYPES = {
    JSON: "json",
    GEOJSON: "geojson",
    GPX: "gpx",
    ROUTE: "route",
};
// ========================================
//   UTILITAIRES
// ========================================
// getLog imported from general-utils.js (Phase 4 dedup)
/**
 * Generates a ID unique
 * @returns {string}
 */
function generateUniqueId() {
    return "poi_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}
/**
 * Determines the type of geometry from coordinates
 * @param {Object} layer - Map layer
 * @returns {string} 'Point', 'Polygon', 'LineString' ou 'Unknown'
 */
function detectGeometryType(layer) {
    if (!layer)
        return "Unknown";
    if (typeof layer.getLatLng === "function") {
        return "Point";
    }
    if (typeof layer.getLatLngs === "function") {
        const latLngs = layer.getLatLngs();
        // Polygon : array de arrayx de points (anneau outer + trous potential)
        // LineString : array de points
        if (Array.isArray(latLngs) && latLngs.length > 0) {
            if (Array.isArray(latLngs[0]) && Array.isArray(latLngs[0][0])) {
                return "Polygon";
            }
            if (Array.isArray(latLngs[0])) {
                // Can be Polygon ou LineString selon si closed
                return "Polygon";
            }
            return "LineString";
        }
    }
    return "Unknown";
}
/**
 * Extrait les coordinates of a layer
 * @param {Object} layer - Map layer
 * @returns {Array|null} Coordinates [lat, lng] ou null
 */
/* eslint-disable complexity -- layer type branchs */
function extractCoordinates(layer) {
    if (!layer)
        return null;
    if (typeof layer.getLatLng === "function") {
        const ll = layer.getLatLng();
        return ll ? [ll.lat, ll.lng] : null;
    }
    if (typeof layer.getCenter === "function") {
        const center = layer.getCenter();
        return center ? [center.lat, center.lng] : null;
    }
    if (typeof layer.getBounds === "function") {
        try {
            const bounds = layer.getBounds();
            if (bounds && bounds.isValid()) {
                const center = bounds.getCenter();
                return center ? [center.lat, center.lng] : null;
            }
        }
        catch (_e) {
            // Bounds invalids
        }
    }
    return null;
}
/* eslint-enable complexity */
// ========================================
//   NORMALISEURS PAR TYPE DE SOURCE
// ========================================
/**
 * Normalise une input JSON en POI
 * @param {Object} data - Data JSON brutes
 * @param {Object} layerConfig - Configuration du layer
 * @returns {Object} POI normalized
 */
/* eslint-disable complexity -- config-driven field mapping */
function normalizeFromJSON(data, layerConfig = {}) {
    if (!data)
        return null;
    const id = data.id || data.uid || data.guid || generateUniqueId();
    const dataMapping = layerConfig.dataMapping || {};
    // Extraction du title
    const titleField = dataMapping.title || "title";
    const title = data[titleField] || data.title || data.name || data.label || data.nom || "Sans titre";
    // Extraction de la description
    const descField = dataMapping.description || "description";
    const description = data[descField] || data.description || data.shortDescription || "";
    // Extraction des coordinates
    const latField = dataMapping.lat || "lat";
    const lngField = dataMapping.lng || "lng";
    let lat = data[latField];
    let lng = data[lngField];
    // Fallbacks pour coordinates
    if (lat === undefined)
        lat = data.latitude || data.y;
    if (lng === undefined)
        lng = data.longitude || data.lng || data.x;
    // Extraction category/sous-category
    const catField = dataMapping.categoryId || "categoryId";
    const subCatField = dataMapping.subCategoryId || "subCategoryId";
    const categoryId = data[catField] || data.categoryId || data.category || null;
    const subCategoryId = data[subCatField] || data.subCategoryId || data.subcategory || null;
    // Building des attributes (toutes les properties)
    const attributes = { ...data };
    return {
        id: String(id),
        sourceType: SOURCE_TYPES.JSON,
        geometryType: "Point",
        title: String(title),
        description: String(description || ""),
        lat: lat !== undefined ? parseFloat(lat) : null,
        lng: lng !== undefined ? parseFloat(lng) : null,
        categoryId: categoryId,
        subCategoryId: subCategoryId,
        attributes: attributes,
        rawData: data,
    };
}
/* eslint-enable complexity */
/**
 * Normalise une feature GeoJSON en POI
 * @param {Object} feature - Feature GeoJSON
 * @param {Object} layerConfig - Configuration du layer
 * @param {Object} layer - Map layer (optional, pour coordinates)
 * @returns {Object} POI normalized
 */
/* eslint-disable complexity, max-lines-per-function -- GeoJSON field mapping */
function normalizeFromGeoJSON(feature, layerConfig = {}, layer = null) {
    if (!feature)
        return null;
    const props = feature.properties || {};
    const geometry = feature.geometry || {};
    const dataMapping = layerConfig.dataMapping || {};
    // ID
    const id = feature.id || props.id || props.uid || props.guid || generateUniqueId();
    // Type of geometry
    let geometryType = geometry.type || "Unknown";
    if (layer && geometryType === "Unknown") {
        geometryType = detectGeometryType(layer);
    }
    // Extraction du title
    const titleField = dataMapping.title || "title";
    const titlePath = titleField.includes(".") ? titleField.split(".").pop() : titleField;
    const title = props[titlePath] || props.name || props.nom || props.title || props.label || "Sans titre";
    // Extraction de la description
    const descField = dataMapping.description || "description";
    const descPath = descField.includes(".") ? descField.split(".").pop() : descField;
    const description = props[descPath] || props.description || props.shortDescription || "";
    // Coordinates
    let lat = null, lng = null;
    if (geometry.coordinates) {
        if (geometryType === "Point") {
            // GeoJSON : [lng, lat]
            lng = geometry.coordinates[0];
            lat = geometry.coordinates[1];
        }
        else if (layer) {
            const coords = extractCoordinates(layer);
            if (coords) {
                lat = coords[0];
                lng = coords[1];
            }
        }
        else if (geometry.coordinates.length > 0) {
            // Calculatesr le centre approximatif
            const flatCoords = flattenCoordinates(geometry.coordinates, geometry.type);
            if (flatCoords.length > 0) {
                let sumLat = 0, sumLng = 0;
                flatCoords.forEach((c) => {
                    sumLng += c[0];
                    sumLat += c[1];
                });
                lng = sumLng / flatCoords.length;
                lat = sumLat / flatCoords.length;
            }
        }
    }
    else if (layer) {
        const coords = extractCoordinates(layer);
        if (coords) {
            lat = coords[0];
            lng = coords[1];
        }
    }
    // Category/sub-category
    const catField = dataMapping.categoryId || "categoryId";
    const catPath = catField.includes(".") ? catField.split(".").pop() : catField;
    const subCatField = dataMapping.subCategoryId || "subCategoryId";
    const subCatPath = subCatField.includes(".") ? subCatField.split(".").pop() : subCatField;
    const categoryId = props[catPath] || props.categoryId || props.category || null;
    const subCategoryId = props[subCatPath] || props.subCategoryId || props.subcategory || null;
    // Building des attributes
    // Hoist nested props.attributes.* fields to top level so that config paths like
    // "attributes.reviews.rating" resolve correctly when the GeoJSON stores rich data
    // under properties.attributes (e.g. reviews, gallery, photo, etc.)
    // MapLibre click events serialize nested objects/arrays to JSON strings — parse them back.
    const rawAttrs = props.attributes;
    let parsedAttrs = null;
    if (rawAttrs != null) {
        if (typeof rawAttrs === "object") {
            parsedAttrs = rawAttrs;
        }
        else if (typeof rawAttrs === "string") {
            try {
                parsedAttrs = JSON.parse(rawAttrs);
            }
            catch {
                parsedAttrs = null;
            }
        }
    }
    const nestedAttrs = parsedAttrs && typeof parsedAttrs === "object" ? parsedAttrs : {};
    const attributes = { ...props, ...nestedAttrs };
    return {
        id: String(id),
        sourceType: SOURCE_TYPES.GEOJSON,
        geometryType: geometryType,
        title: String(title),
        description: String(description || ""),
        lat: lat !== null ? parseFloat(lat) : null,
        lng: lng !== null ? parseFloat(lng) : null,
        categoryId: categoryId,
        subCategoryId: subCategoryId,
        attributes: attributes,
        properties: props, // Conserve aussi properties pour compatibility
        rawData: feature,
    };
}
/* eslint-enable complexity, max-lines-per-function */
/**
 * Aplatit les coordinates GeoJSON selon the type of geometry
 * @param {Array} coords - Coordinates nestedes
 * @param {string} type - Type of geometry
 * @returns {Array} Array de [lng, lat]
 */
function flattenCoordinates(coords, type) {
    if (!coords || !Array.isArray(coords))
        return [];
    switch (type) {
        case "Point":
            return [coords];
        case "MultiPoint":
        case "LineString":
            return coords;
        case "MultiLineString":
        case "Polygon":
            return coords.flat();
        case "MultiPolygon":
            return coords.flat(2);
        default: {
            // Aplatir recursively
            const flat = [];
            const flatten = (arr) => {
                if (!Array.isArray(arr))
                    return;
                if (typeof arr[0] === "number") {
                    flat.push(arr);
                }
                else {
                    arr.forEach(flatten);
                }
            };
            flatten(coords);
            return flat;
        }
    }
}
/**
 * Normalise un waypoint GPX en POI (placeholder pour futur module)
 * @param {Object} waypoint - Waypoint GPX
 * @param {Object} layerConfig - Configuration du layer
 * @returns {Object} POI normalized
 */
/* eslint-disable complexity -- GPX field fallbacks */
function normalizeFromGPX(waypoint, _layerConfig = {}) {
    if (!waypoint)
        return null;
    getLog().info("[Normalizer] GPX normalization - placeholder for future implementation");
    // Structure de base pour GPX
    const id = waypoint.name || waypoint.sym || generateUniqueId();
    const title = waypoint.name || waypoint.cmt || "Point GPX";
    const description = waypoint.desc || waypoint.cmt || "";
    return {
        id: String(id),
        sourceType: SOURCE_TYPES.GPX,
        geometryType: "Point",
        title: String(title),
        description: String(description),
        lat: waypoint.lat !== undefined ? parseFloat(waypoint.lat) : null,
        lng: waypoint.lon !== undefined ? parseFloat(waypoint.lon) : null,
        categoryId: waypoint.type || null,
        subCategoryId: null,
        attributes: { ...waypoint },
        rawData: waypoint,
    };
}
/* eslint-enable complexity */
/**
 * Normalise un point de route en POI
 * @param {Object} routePoint - Point de route
 * @param {Object} routeConfig - Configuration de la route
 * @returns {Object} POI normalized
 */
/* eslint-disable complexity -- route point field fallbacks */
function normalizeFromRoute(routePoint, _routeConfig = {}) {
    if (!routePoint)
        return null;
    const id = routePoint.id || routePoint.placeId || generateUniqueId();
    const title = routePoint.name || routePoint.title || routePoint.address || "Point de route";
    const description = routePoint.description || routePoint.comment || "";
    let lat = null, lng = null;
    if (routePoint.latLng) {
        lat = routePoint.latLng.lat;
        lng = routePoint.latLng.lng;
    }
    else if (routePoint.lat !== undefined && routePoint.lng !== undefined) {
        lat = routePoint.lat;
        lng = routePoint.lng;
    }
    return {
        id: String(id),
        sourceType: SOURCE_TYPES.ROUTE,
        geometryType: "Point",
        title: String(title),
        description: String(description),
        lat: lat !== null ? parseFloat(lat) : null,
        lng: lng !== null ? parseFloat(lng) : null,
        categoryId: routePoint.type || "route-point",
        subCategoryId: routePoint.order !== undefined ? `stop-${routePoint.order}` : null,
        order: routePoint.order,
        address: routePoint.address,
        attributes: { ...routePoint },
        rawData: routePoint,
    };
}
/* eslint-enable complexity */
// ========================================
//   FONCTION PRINCIPALE
// ========================================
/**
 * Normalise des data based on theur type of source
 * @param {string} sourceType - Type of source ('json', 'geojson', 'gpx', 'route')
 * @param {Object} data - Data brutes
 * @param {Object} layerConfig - Configuration du layer
 * @param {Object} options - Options additionnelles (layer, etc.)
 * @returns {Object} POI normalized
 */
function normalizeFeature(sourceType, data, layerConfig = {}, options = {}) {
    if (!data) {
        getLog().warn("[Normalizer] Null data for normalization");
        return null;
    }
    switch (sourceType) {
        case SOURCE_TYPES.JSON:
            return normalizeFromJSON(data, layerConfig);
        case SOURCE_TYPES.GEOJSON:
            return normalizeFromGeoJSON(data, layerConfig, options.layer);
        case SOURCE_TYPES.GPX:
            return normalizeFromGPX(data, layerConfig);
        case SOURCE_TYPES.ROUTE:
            return normalizeFromRoute(data, layerConfig);
        default:
            getLog().warn("[Normalizer] Unrecognized source type:", sourceType);
            // Tenter une detection automatic
            return autoDetectAndNormalize(data, layerConfig, options);
    }
}
/**
 * Detects automaticment the type of source et normalise
 * @param {Object} data - Data brutes
 * @param {Object} layerConfig - Configuration du layer
 * @param {Object} options - Options additionnelles
 * @returns {Object} POI normalized
 */
function autoDetectAndNormalize(data, layerConfig = {}, options = {}) {
    // Detection GeoJSON
    if (data.type === "Feature" && data.geometry) {
        return normalizeFromGeoJSON(data, layerConfig, options.layer);
    }
    // Detection GPX (waypoint)
    if (data.lat !== undefined && data.lon !== undefined && (data.name || data.sym)) {
        return normalizeFromGPX(data, layerConfig);
    }
    // Detection Route
    if (data.latLng || (data.order !== undefined && data.address)) {
        return normalizeFromRoute(data, layerConfig);
    }
    // By default : JSON
    return normalizeFromJSON(data, layerConfig);
}
/**
 * Normalise un data table
 * @param {string} sourceType - Type of source
 * @param {Array} dataArray - Data table brutes
 * @param {Object} layerConfig - Configuration du layer
 * @param {Object} options - Options additionnelles
 * @returns {Array} Array de POIs normalized
 */
function normalizeCollection(sourceType, dataArray, layerConfig = {}, options = {}) {
    if (!Array.isArray(dataArray)) {
        getLog().warn("[Normalizer] normalizeCollection expects an array");
        return [];
    }
    return dataArray
        .map((data) => normalizeFeature(sourceType, data, layerConfig, options))
        .filter((poi) => poi !== null);
}
// ========================================
//   EXPORT
// ========================================
const DataNormalizer = {
    // Types de sources
    SOURCE_TYPES,
    // Normaliseurs par type
    normalizeFromJSON,
    normalizeFromGeoJSON,
    normalizeFromGPX,
    normalizeFromRoute,
    // Fonctions maines
    normalizeFeature,
    autoDetectAndNormalize,
    normalizeCollection,
    // Utilitaires
    detectGeometryType,
    extractCoordinates,
    generateUniqueId,
};
// Log de loading
getLog().info("[GeoLeaf._Normalizer] Module Normalizer loaded");

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @fileoverview In-memory cache for GeoLeaf styles.
 * Extracted from style-loader.ts as part of Sprint 1 refactoring.
 * @module loaders/style-cache
 */
/**
 * In-memory cache for loaded styles.
 * Key: "profileId:layerId:styleId"
 * Value: { styleData, labelConfig, timestamp }
 */
const styleCache = new Map();
/**
 * Clears the style cache.
 * @param {string|null} [cacheKey] - Specific key to remove, or null to clear all entries.
 */
function clearStyleCache(cacheKey = null) {
    if (cacheKey) {
        styleCache.delete(cacheKey);
    }
    else {
        styleCache.clear();
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @fileoverview Label configuration extractor for GeoLeaf style data.
 * Extracted from style-loader.ts as part of Sprint 1 refactoring.
 * @module loaders/label-extractor
 */
/**
 * Ensures visibleByDefault is set when label.enabled is true.
 * Mutates styleData in place; emits a console warning if the field was missing.
 * @param {Object} styleData - Style data object.
 * @param {string} stylePath - Path of the style file (used in warning message).
 * @internal
 */
function _ensureLabelVisibleByDefault(styleData, stylePath) {
    if (styleData.label && styleData.label.enabled === true) {
        if (styleData.label.visibleByDefault === undefined) {
            styleData.label.visibleByDefault = false;
            console.warn(`[StyleLoader] "visibleByDefault" manquant: ${stylePath}\nFallback applied: visibleByDefault = false`);
        }
    }
}
/**
 * Extracts label configuration from a loaded style data object.
 * Automatically detects if labels are integrated in the style.
 * @param {Object} styleData - The style data object.
 * @returns {Object|null} Label configuration or null if absent/disabled.
 */
function extractLabelConfig(styleData) {
    if (!styleData || typeof styleData !== "object") {
        return null;
    }
    if (styleData.label && typeof styleData.label === "object" && styleData.label !== null) {
        if (styleData.label.enabled === true) {
            return {
                ...styleData.label,
                isIntegrated: true,
            };
        }
    }
    return null;
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @fileoverview Core style loading and validation logic for GeoLeaf.
 * Extracted from style-loader.ts as part of Sprint 1 refactoring.
 * Fix included: loadStyleLenient no longer mutates the shared loaderConfig object.
 * @module loaders/style-loader-core
 */
// Lazy access to Config (not yet ESM — migrated in B4)
const _gl = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
/**
 * Internal loader configuration.
 */
const loaderConfig = {
    debug: false,
    throwOnValidationError: true,
};
function getProfilesBasePath() {
    const cfg = _gl.GeoLeaf && _gl.GeoLeaf.Config;
    if (cfg && typeof cfg.get === "function") {
        const configured = cfg.get("data.profilesBasePath", "profiles");
        if (typeof configured === "string" && configured.trim().length > 0) {
            return configured.endsWith("/") ? configured.slice(0, -1) : configured;
        }
    }
    return "profiles";
}
/**
 * Initializes the style loader with the GeoLeaf configuration.
 * @param {Object} config - GeoLeaf configuration (must contain { debug: boolean }).
 */
function initStyleLoader(config = {}) {
    loaderConfig.debug = config.debug === true;
    if (loaderConfig.debug) {
        if (Log)
            Log.debug("[StyleLoader] Debug mode enabled - cache disabled");
    }
}
async function _parseStyleJson(response, stylePath, ctx) {
    try {
        return await response.json();
    }
    catch (jsonError) {
        console.error("[StyleLoader] ❌ JSON parse error:", stylePath);
        console.error("Context:", JSON.stringify({ ...ctx, parseError: jsonError.message }, null, 2));
        console.error("Stack:", jsonError.stack);
        throw new Error(`Le fichier de style contient du JSON malformed: ${stylePath}\n` +
            `Erreur de parsing: ${jsonError.message}\n` +
            `Please check the JSON syntax of the file.`);
    }
}
/**
 * Validates the style data against the GeoLeaf schema.
 * @param lenient - When true, validation errors are logged but not thrown.
 */
function _applyStyleValidation(styleData, stylePath, params, lenient = false) {
    const validationResult = StyleValidator
        ? StyleValidator.validateStyle(styleData, params)
        : { valid: true, errors: [], warnings: [] };
    if (!validationResult.valid) {
        const errorMessage = StyleValidator
            ? StyleValidator.formatValidationErrors(validationResult, stylePath)
            : "Erreurs de validation";
        console.error(errorMessage);
        if (!lenient && loaderConfig.throwOnValidationError) {
            throw new Error(`Le fichier de style ne respecte pas le schema GeoLeaf: ${stylePath}\n` +
                `Check the console for error details.`);
        }
    }
    if (validationResult.warnings.length > 0) {
        console.warn(`[StyleLoader] ${validationResult.warnings.length} warning(s) pour ${stylePath}:`);
        validationResult.warnings.forEach((warning) => {
            console.warn(`  - ${warning.field}: ${warning.message}`);
        });
    }
}
function _buildStyleResult(styleData, profileId, layerId, styleId, stylePath) {
    const labelConfig = extractLabelConfig(styleData);
    return {
        styleData,
        labelConfig,
        metadata: {
            profileId,
            layerId,
            styleId,
            stylePath,
            hasIntegratedLabels: labelConfig !== null,
            loadedAt: new Date().toISOString(),
        },
    };
}
function _throwStyleLoadError(error, ctx) {
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ ERREUR DE CHARGEMENT DE STYLE");
    console.error("═══════════════════════════════════════════════════════");
    console.error("Contexte:", JSON.stringify({ ...ctx, originalError: error.message }, null, 2));
    console.error("Stack trace:", error.stack);
    console.error("═══════════════════════════════════════════════════════");
    throw error;
}
/**
 * Loads and validates a style file.
 * @param {string} profileId - Profile ID.
 * @param {string} layerId - Layer ID.
 * @param {string} styleId - Style ID.
 * @param {string} styleFileName - Style file name (e.g. "default.json").
 * @param {string} layerDirectory - Layer directory (e.g. "layers/tourism_poi_all").
 * @param {boolean} [_lenient] - When true, validation errors are not thrown. Internal use only.
 * @returns {Promise<Object>} Loaded and validated style with extracted label config.
 * @throws {Error} If the file is invalid or not found (unless lenient).
 */
async function loadAndValidateStyle(profileId, layerId, styleId, styleFileName, layerDirectory, _lenient = false) {
    const cacheKey = `${profileId}:${layerId}:${styleId}`;
    if (!loaderConfig.debug && styleCache.has(cacheKey))
        return styleCache.get(cacheKey);
    const profilesBasePath = getProfilesBasePath();
    const stylePath = `${profilesBasePath}/${profileId}/${layerDirectory}/styles/${styleFileName}`;
    try {
        const response = await fetch(stylePath);
        if (!response.ok)
            throw new Error(`Impossible de load le fichier de style: ${stylePath}\nHTTP ${response.status}: ${response.statusText}`);
        const styleData = await _parseStyleJson(response, stylePath, {
            profileId,
            layerId,
            styleId,
            stylePath,
            httpStatus: response.status,
        });
        _ensureLabelVisibleByDefault(styleData, stylePath);
        _applyStyleValidation(styleData, stylePath, { profileId, layerId, styleId, stylePath }, _lenient);
        const result = _buildStyleResult(styleData, profileId, layerId, styleId, stylePath);
        if (!loaderConfig.debug)
            styleCache.set(cacheKey, result);
        return result;
    }
    catch (error) {
        if (error.message.includes("JSON malformed") || error.message.includes("GeoLeaf schema"))
            throw error;
        _throwStyleLoadError(error, { profileId, layerId, styleId, styleFileName, layerDirectory });
    }
}
/**
 * Loads a style with relaxed validation (no throw on validation error).
 * Used for cases where loading is desired even if validation fails.
 * @param {string} profileId
 * @param {string} layerId
 * @param {string} styleId
 * @param {string} styleFileName
 * @param {string} layerDirectory
 * @returns {Promise<Object>} Loaded style (may contain validation warnings).
 */
async function loadStyleLenient(profileId, layerId, styleId, styleFileName, layerDirectory) {
    return loadAndValidateStyle(profileId, layerId, styleId, styleFileName, layerDirectory, true);
}
/**
 * Preloads multiple styles in parallel.
 * @param {Array<Object>} styleConfigs - Array of { profileId, layerId, styleId, styleFileName, layerDirectory }.
 * @returns {Promise<Array<Object>>} Loading results.
 */
async function preloadStyles(styleConfigs) {
    if (Log)
        Log.info(`[StyleLoader] Preloading ${styleConfigs.length} style(s)...`);
    const promises = styleConfigs.map((config) => loadAndValidateStyle(config.profileId, config.layerId, config.styleId, config.styleFileName, config.layerDirectory).catch((error) => ({
        error: true,
        message: error.message,
        config,
    })));
    const results = await Promise.all(promises);
    const successCount = results.filter((r) => !r.error).length;
    const errorCount = results.filter((r) => r.error).length;
    if (Log)
        Log.info(`[StyleLoader] Preloading complete: ${successCount} success, ${errorCount} errors`);
    return results;
}
/**
 * Returns cache statistics.
 * @returns {Object} Statistics { size, keys, debug, cacheEnabled }.
 */
function getCacheStats() {
    return {
        size: styleCache.size,
        keys: Array.from(styleCache.keys()),
        debug: loaderConfig.debug,
        cacheEnabled: !loaderConfig.debug,
    };
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @fileoverview Style loading helpers for layer configurations.
 * Extracted from style-loader.ts as part of Sprint 1 refactoring.
 * @module loaders/style-from-layer
 */
/**
 * Loads a style from a layer configuration object.
 * Automatically detects obsolete references to styleFile.
 * @param {string} profileId - Profile ID.
 * @param {Object} layerConfig - Layer configuration.
 * @param {string} styleIdOrFileName - Style ID or file name.
 * @returns {Promise<Object>} Loaded style.
 */
async function loadStyleFromLayerConfig(profileId, layerConfig, styleIdOrFileName) {
    const layerId = layerConfig.id;
    const layerDirectory = layerConfig._layerDirectory || `layers/${layerId}`;
    if (layerConfig.labels && layerConfig.labels.styleFile) {
        const errorMessage = `❌ OBSOLETE CONFIGURATION DETECTED\n` +
            `═══════════════════════════════════════════════════════\n` +
            `The layer "${layerId}" uses une reference obsolete to un fichier\n` +
            `via deprecated "labels.styleFile".\n\n` +
            `GeoLeaf no longer supports separate label files (styleLabel.json).\n` +
            `Les labels must be integrated dans les fichiers de style.\n\n` +
            `Detected value: ${layerConfig.labels.styleFile}\n` +
            `Profil: ${profileId}\n` +
            `Couche: ${layerId}\n\n` +
            `Action requirede:\n` +
            `1. Supprimez la property "labels.styleFile" de la configuration\n` +
            `2. Integrate labels into style files ("label" property)\n` +
            `3. Consultez docs/STYLE_FORMAT_SPEC.md pour la syntax\n` +
            `═══════════════════════════════════════════════════════`;
        console.error(errorMessage);
        throw new Error(`Obsolete configuration: labels.styleFile detected in layer ${layerId}`);
    }
    let styleFileName = styleIdOrFileName;
    let styleId = styleIdOrFileName;
    if (layerConfig.styles && layerConfig.styles.available) {
        const styleConfig = layerConfig.styles.available.find((s) => s.id === styleIdOrFileName || s.file === styleIdOrFileName);
        if (styleConfig) {
            styleFileName = styleConfig.file;
            styleId = styleConfig.id;
        }
    }
    return loadAndValidateStyle(profileId, layerId, styleId, styleFileName, layerDirectory);
}
/**
 * Builds the complete path to a style file.
 * @param {string} profileId - Profile ID.
 * @param {string} layerDirectory - Layer directory.
 * @param {string} styleFileName - Style file name.
 * @returns {string} Complete path.
 */
function getStylePath(profileId, layerDirectory, styleFileName) {
    return `profiles/${profileId}/${layerDirectory}/styles/${styleFileName}`;
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @fileoverview Aggregator for GeoLeaf style loader — re-exports from sub-modules.
 * Refactored in Sprint 1: 1549 lines split into style-cache.ts, label-extractor.ts,
 * style-loader-core.ts, style-from-layer.ts.
 * All consumers import { StyleLoader } unchanged.
 * @module loaders/style-loader
 */
/**
 * Module Style Loader — exposes all public functions.
 */
const StyleLoader = {
    initStyleLoader,
    loadAndValidateStyle,
    extractLabelConfig,
    loadStyleLenient,
    preloadStyles,
    clearStyleCache,
    getCacheStats,
    loadStyleFromLayerConfig,
    getStylePath,
    styleCache,
};

/**
 * @module GeoLeaf.Utils.PropagationBlocker
 * Blocks map-level DOM event propagation on control containers.
 *
 * @version 2.0.0
 */
/**
 * Prevents click / scroll events on a control container from reaching
 * the underlying map canvas.
 *
 * This utility uses native addEventListener in the **bubbling phase**
 * so that events first reach child elements (accordion headers, toggle
 * buttons) and are only stopped from propagating further up to the map.
 *
 * @param container - The control's root HTMLElement.
 * @param cleanups - Optional array; removal functions are pushed into it
 *                   so the caller can tear down listeners on control removal.
 */
function blockMapPropagation(container, cleanups) {
    const stop = (e) => {
        e.stopPropagation();
    };
    // Click-family events (bubbling phase — lets children handle first)
    container.addEventListener("click", stop);
    container.addEventListener("dblclick", stop);
    container.addEventListener("mousedown", stop);
    container.addEventListener("touchstart", stop, { passive: true });
    // Scroll / wheel
    container.addEventListener("wheel", stop, { passive: false });
    // Context menu
    container.addEventListener("contextmenu", stop);
    if (cleanups) {
        cleanups.push(() => {
            container.removeEventListener("click", stop);
            container.removeEventListener("dblclick", stop);
            container.removeEventListener("mousedown", stop);
            container.removeEventListener("touchstart", stop);
            container.removeEventListener("wheel", stop);
            container.removeEventListener("contextmenu", stop);
        });
    }
}

/**
 * @module GeoLeaf.Utils.Haversine
 * Great-circle distance between two {lat, lng} points using the Haversine formula.
 *
 * @version 2.0.0
 */
/** Earth radius in metres (WGS-84 mean). */
const R = 6_371_000;
/**
 * Returns the great-circle distance in **metres** between two points.
 *
 * @param a - First point `{ lat, lng }` in decimal degrees.
 * @param b - Second point `{ lat, lng }` in decimal degrees.
 */
function haversineDistance(a, b) {
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat +
        Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
    return 2 * R * Math.asin(Math.sqrt(h));
}

/*!



 * GeoLeaf Core



 * © 2026 Mattieu Pottier



 * Released under the MIT License



 * https://geoleaf.dev



 */
const emptyFC = () => ({ type: "FeatureCollection", features: [] });
// ---------------------------------------------------------
// Module-level helpers (reduce cyclomatic complexity)
// ---------------------------------------------------------
function _resolvePoiCoordinates(poi) {
    if (Array.isArray(poi.latlng) && poi.latlng.length === 2)
        return [poi.latlng[1], poi.latlng[0]];
    if (poi.location &&
        typeof poi.location.lat === "number" &&
        typeof poi.location.lng === "number")
        return [poi.location.lng, poi.location.lat];
    return null;
}
function _checkEarlyGeoJson(data) {
    const d = data;
    if (d.type === "FeatureCollection" && Array.isArray(d.features)) {
        Log.debug("[DataConverter.autoConvert] Data already in GeoJSON, passing through");
        return data;
    }
    if (d.type === "Feature" && d.geometry) {
        Log.debug("[DataConverter.autoConvert] Single feature, converting to FeatureCollection");
        return { type: "FeatureCollection", features: [data] };
    }
    return null;
}
function _detectPoiType(firstItem) {
    if (firstItem.latlng ||
        (firstItem.location && typeof firstItem.location.lat === "number"))
        return "poi";
    const geom = firstItem.geometry;
    if (geom?.type === "LineString" && Array.isArray(geom.coordinates))
        return "route";
    if (geom?.type === "Polygon" && Array.isArray(geom.coordinates))
        return "zone";
    return "unknown";
}
const DataConverterModule = {
    /**
     * Convert an array of POI objects to a GeoJSON FeatureCollection.
     * @param poiArray - Array of POI objects with `id`, `latlng` (or `location`), and optional `attributes`.
     * @returns A GeoJSON FeatureCollection. Items without an id or valid coordinates are skipped.
     */
    convertPoiArrayToGeoJSON(poiArray) {
        if (!Array.isArray(poiArray)) {
            Log.warn("[DataConverter.convertPoiArrayToGeoJSON] Input is not an array, returning empty FeatureCollection");
            return emptyFC();
        }
        const features = poiArray
            .map((poi) => {
            if (!poi || typeof poi !== "object")
                return null;
            if (!poi.id) {
                Log.warn("[DataConverter.convertPoiArrayToGeoJSON] POI without ID, skipped", poi);
                return null;
            }
            const coordinates = _resolvePoiCoordinates(poi);
            if (!coordinates) {
                Log.warn("[DataConverter.convertPoiArrayToGeoJSON] POI without valid coordinates, skipped", { id: poi.id });
                return null;
            }
            return {
                type: "Feature",
                id: poi.id,
                geometry: { type: "Point", coordinates },
                properties: {
                    id: poi.id,
                    title: poi.title || "Sans titre",
                    description: poi.description || "",
                    ...poi.attributes,
                },
            };
        })
            .filter((f) => f !== null);
        Log.debug("[DataConverter.convertPoiArrayToGeoJSON] Converted", {
            input: poiArray.length,
            output: features.length,
        });
        return { type: "FeatureCollection", features };
    },
    /**
     * Convert an array of route objects to a GeoJSON FeatureCollection (LineString features).
     * @param routeArray - Array of route objects with `id` and a `geometry.type === "LineString"`.
     * @returns A GeoJSON FeatureCollection. Items without valid LineString geometry are skipped.
     */
    convertRouteArrayToGeoJSON(routeArray) {
        if (!Array.isArray(routeArray)) {
            Log.warn("[DataConverter.convertRouteArrayToGeoJSON] Input is not an array, returning empty FeatureCollection");
            return emptyFC();
        }
        const features = routeArray
            .map((route) => {
            if (!route || typeof route !== "object")
                return null;
            if (!route.id) {
                Log.warn("[DataConverter.convertRouteArrayToGeoJSON] Route without ID, skipped", route);
                return null;
            }
            if (!route.geometry ||
                route.geometry.type !== "LineString" ||
                !Array.isArray(route.geometry.coordinates)) {
                Log.warn("[DataConverter.convertRouteArrayToGeoJSON] Route without valid LineString geometry, skipped", { id: route.id });
                return null;
            }
            return {
                type: "Feature",
                id: route.id,
                geometry: { type: "LineString", coordinates: route.geometry.coordinates },
                properties: {
                    id: route.id,
                    title: route.title || "Sans titre",
                    description: route.description || "",
                    categoryId: route.categoryId,
                    subCategoryId: route.subCategoryId,
                    ...route.attributes,
                },
            };
        })
            .filter((f) => f !== null);
        Log.debug("[DataConverter.convertRouteArrayToGeoJSON] Converted", {
            input: routeArray.length,
            output: features.length,
        });
        return { type: "FeatureCollection", features };
    },
    /**
     * Convert an array of zone objects to a GeoJSON FeatureCollection (Polygon features).
     * @param zoneArray - Array of zone objects with `id` and a `geometry.type === "Polygon"`.
     * @returns A GeoJSON FeatureCollection. Items without valid Polygon geometry are skipped.
     */
    convertZoneArrayToGeoJSON(zoneArray) {
        if (!Array.isArray(zoneArray)) {
            Log.warn("[DataConverter.convertZoneArrayToGeoJSON] Input is not an array, returning empty FeatureCollection");
            return emptyFC();
        }
        const features = zoneArray
            .map((zone) => {
            if (!zone || typeof zone !== "object")
                return null;
            if (!zone.id) {
                Log.warn("[DataConverter.convertZoneArrayToGeoJSON] Zone without ID, skipped", zone);
                return null;
            }
            if (!zone.geometry ||
                zone.geometry.type !== "Polygon" ||
                !Array.isArray(zone.geometry.coordinates)) {
                Log.warn("[DataConverter.convertZoneArrayToGeoJSON] Zone without valid Polygon geometry, skipped", { id: zone.id });
                return null;
            }
            return {
                type: "Feature",
                id: zone.id,
                geometry: { type: "Polygon", coordinates: zone.geometry.coordinates },
                properties: {
                    id: zone.id,
                    title: zone.title || zone.siteName || "Sans titre",
                    description: zone.description || "",
                    ...zone.attributes,
                },
            };
        })
            .filter((f) => f !== null);
        Log.debug("[DataConverter.convertZoneArrayToGeoJSON] Converted", {
            input: zoneArray.length,
            output: features.length,
        });
        return { type: "FeatureCollection", features };
    },
    /**
     * Auto-detect the input data type and convert to a GeoJSON FeatureCollection.
     * Handles: existing GeoJSON pass-through, POI arrays, route arrays, zone arrays.
     * @param data - The input data. Can be a GeoJSON object or an array of POI/route/zone items.
     * @returns A GeoJSON FeatureCollection, or an empty one if the type cannot be determined.
     */
    autoConvert(data) {
        if (!data) {
            Log.warn("[DataConverter.autoConvert] Null data, returning empty FeatureCollection");
            return emptyFC();
        }
        const early = _checkEarlyGeoJson(data);
        if (early)
            return early;
        if (!Array.isArray(data) || data.length === 0) {
            Log.warn("[DataConverter.autoConvert] Data is not an array or is empty");
            return emptyFC();
        }
        const firstItem = data[0];
        if (!firstItem || typeof firstItem !== "object") {
            Log.warn("[DataConverter.autoConvert] First element is invalid");
            return emptyFC();
        }
        const type = _detectPoiType(firstItem);
        if (type === "poi") {
            Log.debug("[DataConverter.autoConvert] Detected as POI array");
            return this.convertPoiArrayToGeoJSON(data);
        }
        if (type === "route") {
            Log.debug("[DataConverter.autoConvert] Detected as route array");
            return this.convertRouteArrayToGeoJSON(data);
        }
        if (type === "zone") {
            Log.debug("[DataConverter.autoConvert] Detected as zone array");
            return this.convertZoneArrayToGeoJSON(data);
        }
        Log.warn("[DataConverter.autoConvert] Unrecognized data type");
        return emptyFC();
    },
};
const DataConverter = DataConverterModule;

/*!
 * GeoLeaf Core – Config / Loaders
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
const C$1 = Config;
C$1.loadUrl = function (url, options = {}) {
    const Loader = ProfileLoader$1;
    if (!Loader) {
        Log.error("[GeoLeaf.Config] Loader module not available.");
        return Promise.reject(new Error("Loader module not available"));
    }
    return Loader.loadUrl(url, options)
        .then((jsonCfg) => {
        this._applyConfig(jsonCfg, "url");
        this._maybeFireLoadedEvent();
        return this._config;
    })
        .catch((err) => {
        Log.error("[GeoLeaf.Config] Error loading config:", err);
        return this._config;
    });
};
C$1.loadTaxonomy = function (url = null, options = {}) {
    const Taxonomy = TaxonomyManager;
    if (!Taxonomy) {
        Log.error("[GeoLeaf.Config] Taxonomy module not available.");
        return Promise.reject(new Error("Taxonomy module not available"));
    }
    return Taxonomy.loadTaxonomy(url, options);
};
C$1.loadActiveProfileResources = function (options = {}) {
    const Profile = ProfileManager;
    if (!Profile) {
        Log.error("[GeoLeaf.Config] Profile module not available.");
        return Promise.reject(new Error("Profile module not available"));
    }
    return Profile.loadActiveProfileResources(options);
};

/*!
 * GeoLeaf Core – Config / Accessors
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
const C = Config;
C.getAll = function () {
    if (!this._isLoaded) {
        this._initSubModules();
    }
    const Storage = StorageHelper;
    return (Storage?.getAll ? Storage.getAll() : this._config);
};
C.get = function (path, defaultValue) {
    if (!this._isLoaded) {
        this._initSubModules();
    }
    const Storage = StorageHelper;
    const value = Storage?.get ? Storage.get(path, defaultValue) : defaultValue;
    return value;
};
C.set = function (path, value) {
    const Storage = StorageHelper;
    if (Storage?.set) {
        Storage.set(path, value);
    }
    else {
        Log.warn("[GeoLeaf.Config] Storage module unavailable for set().");
    }
};
C.getSection = function (sectionName, defaultValue) {
    const Storage = StorageHelper;
    return Storage?.getSection ? Storage.getSection(sectionName, defaultValue) : defaultValue;
};
C.getCategories = function () {
    if (!this._isLoaded) {
        this._initSubModules();
    }
    const Taxonomy = TaxonomyManager;
    return Taxonomy?.getCategories ? Taxonomy.getCategories() : {};
};
C.getCategory = function (categoryId) {
    const Taxonomy = TaxonomyManager;
    return Taxonomy?.getCategory ? Taxonomy.getCategory(categoryId) : undefined;
};
C.getSubcategory = function (categoryId, subCategoryId) {
    const Taxonomy = TaxonomyManager;
    return Taxonomy?.getSubcategory
        ? Taxonomy.getSubcategory(categoryId, subCategoryId)
        : undefined;
};
C.getActiveProfileId = function () {
    const Profile = ProfileManager;
    return Profile?.getActiveProfileId ? Profile.getActiveProfileId() : null;
};
C.getActiveProfile = function () {
    const Profile = ProfileManager;
    return Profile?.getActiveProfile ? Profile.getActiveProfile() : null;
};
C.getActiveProfilePoi = function () {
    const Profile = ProfileManager;
    return Profile?.getActiveProfilePoi ? Profile.getActiveProfilePoi() : [];
};
C.getActiveProfileRoutes = function () {
    const Profile = ProfileManager;
    return Profile?.getActiveProfileRoutes ? Profile.getActiveProfileRoutes() : [];
};
C.getActiveProfileMapping = function () {
    const Profile = ProfileManager;
    return Profile?.getActiveProfileMapping ? Profile.getActiveProfileMapping() : null;
};
C.getIconsConfig = function () {
    const Profile = ProfileManager;
    return Profile?.getIconsConfig ? Profile.getIconsConfig() : null;
};
C.isProfilePoiMappingEnabled = function () {
    const Profile = ProfileManager;
    return Profile?.isProfilePoiMappingEnabled ? Profile.isProfilePoiMappingEnabled() : true;
};

/*!
 * GeoLeaf Core – Config / Validation
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
function _hasColor(d) {
    if (d.color && typeof d.color === "string")
        return true;
    if (d.colorFill && typeof d.colorFill === "string")
        return true;
    if (d.colorStroke && typeof d.colorStroke === "string")
        return true;
    return false;
}
function _validateCenter(center) {
    if (!Array.isArray(center) ||
        center.length !== 2 ||
        typeof center[0] !== "number" ||
        typeof center[1] !== "number") {
        throw new Error("[GeoLeaf.Config] map.center must be un table de 2 nombres [lat, lng].");
    }
}
function _validateZoom(zoom) {
    if (typeof zoom !== "number" || zoom < 0 || zoom > 20) {
        throw new Error("[GeoLeaf.Config] map.zoom must be un nombre entre 0 et 20.");
    }
}
function _validateInitialMaxZoom(v) {
    if (typeof v !== "number" || v < 1 || v > 20) {
        throw new Error("[GeoLeaf.Config] map.initialMaxZoom must be un nombre entre 1 et 20.");
    }
}
function _validateBoundsMargin(v) {
    if (typeof v !== "number" || v < 0 || v > 1) {
        throw new Error("[GeoLeaf.Config] map.boundsMargin must be un nombre entre 0 et 1 (ex: 0.3 = 30% de marge).");
    }
}
function _validateMapSection(map) {
    if (map.center !== undefined)
        _validateCenter(map.center);
    if (map.zoom !== undefined)
        _validateZoom(map.zoom);
    if (map.positionFixed !== undefined) {
        if (typeof map.positionFixed !== "boolean") {
            throw new Error("[GeoLeaf.Config] map.positionFixed must be un boolean (true/false).");
        }
    }
    if (map.initialMaxZoom !== undefined)
        _validateInitialMaxZoom(map.initialMaxZoom);
    if (map.boundsMargin !== undefined)
        _validateBoundsMargin(map.boundsMargin);
}
function _validateSubCategory(subId, subData, catId) {
    if (!subData || typeof subData !== "object") {
        Log.warn(`[GeoLeaf.Config] Subcategory '${subId}' in '${catId}' is invalid (must be an object).`);
        return;
    }
    if (!subData.label || typeof subData.label !== "string") {
        Log.warn(`[GeoLeaf.Config] Subcategory '${subId}' in '${catId}': 'label' field is missing or invalid.`);
    }
    if (!_hasColor(subData)) {
        Log.warn(`[GeoLeaf.Config] Subcategory '${subId}' in '${catId}': no color defined (neither 'color' nor 'colorFill'/'colorStroke').`);
    }
}
function _validateCategory(catId, catData) {
    if (!catData || typeof catData !== "object") {
        Log.warn(`[GeoLeaf.Config] Category '${catId}' is invalid (must be an object).`);
        return;
    }
    if (!catData.label || typeof catData.label !== "string") {
        Log.warn(`[GeoLeaf.Config] Category '${catId}': 'label' field is missing or invalid.`);
    }
    if (!_hasColor(catData)) {
        Log.warn(`[GeoLeaf.Config] Category '${catId}': no color defined (neither 'color' nor 'colorFill'/'colorStroke').`);
    }
    if (catData.subcategories === undefined)
        return;
    if (typeof catData.subcategories !== "object" ||
        catData.subcategories === null ||
        Array.isArray(catData.subcategories)) {
        Log.warn(`[GeoLeaf.Config] Category '${catId}': subcategories must be an object.`);
        return;
    }
    Object.entries(catData.subcategories).forEach(([subId, subData]) => _validateSubCategory(subId, subData, catId));
}
function _validateTopLevelFields(cfg) {
    if (cfg.basemaps !== undefined) {
        if (typeof cfg.basemaps !== "object")
            throw new Error("[GeoLeaf.Config] basemaps must be un object.");
        if (cfg.basemaps === null)
            throw new Error("[GeoLeaf.Config] basemaps must be un object.");
    }
    if (cfg.poi !== undefined && !Array.isArray(cfg.poi))
        throw new Error("[GeoLeaf.Config] poi must be un table.");
}
function _validateCategoriesSection(cats) {
    if (typeof cats !== "object")
        throw new Error("[GeoLeaf.Config] categories must be un object.");
    if (cats === null)
        throw new Error("[GeoLeaf.Config] categories must be un object.");
    if (Array.isArray(cats))
        throw new Error("[GeoLeaf.Config] categories must be un object.");
    Object.entries(cats).forEach(([catId, catData]) => _validateCategory(catId, catData));
}
function validateConfig(cfg) {
    if (!cfg)
        return;
    if (typeof cfg !== "object")
        return;
    if (cfg.map)
        _validateMapSection(cfg.map);
    _validateTopLevelFields(cfg);
    if (cfg.categories !== undefined)
        _validateCategoriesSection(cfg.categories);
    Log.debug("[GeoLeaf.Config] Structure validation successful.");
}
Config._validateConfig = validateConfig;

/**
 * GeoLeaf WKT Parser
 * Converts Well-Known Text (WKT) geometry strings to GeoJSON geometry objects.
 *
 * Supported types: Point, LineString, Polygon, MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection (2D and 3D/Z variants).
 * Returns null for invalid or unrecognised input — never throws.
 *
 * @module utils/general/wkt-parser
 */
function _peek(s) {
    return s.input[s.pos] ?? "";
}
function _consume(s, char) {
    if (s.input[s.pos] === char) {
        s.pos++;
        return true;
    }
    return false;
}
function _skipWhitespace(s) {
    while (s.pos < s.input.length && /\s/.test(s.input[s.pos]))
        s.pos++;
}
function _readKeyword(s) {
    _skipWhitespace(s);
    const start = s.pos;
    while (s.pos < s.input.length && /[A-Za-z_]/.test(s.input[s.pos]))
        s.pos++;
    return s.input.slice(start, s.pos).toUpperCase();
}
function _readNumber(s) {
    _skipWhitespace(s);
    const start = s.pos;
    if (s.input[s.pos] === "-" || s.input[s.pos] === "+")
        s.pos++;
    while (s.pos < s.input.length && /[\d.]/.test(s.input[s.pos]))
        s.pos++;
    if (s.pos === start)
        return null;
    const n = parseFloat(s.input.slice(start, s.pos));
    return isNaN(n) ? null : n;
}
function _readCoordinate(s) {
    _skipWhitespace(s);
    const x = _readNumber(s);
    if (x === null)
        return null;
    _skipWhitespace(s);
    const y = _readNumber(s);
    if (y === null)
        return null;
    // Optional Z
    const saved = s.pos;
    _skipWhitespace(s);
    const next = s.input[s.pos];
    if (next !== undefined && next !== "," && next !== ")" && /[-+\d]/.test(next)) {
        const z = _readNumber(s);
        if (z !== null)
            return [x, y, z];
    }
    else {
        s.pos = saved;
    }
    return [x, y];
}
function _readCoordinateList(s) {
    _skipWhitespace(s);
    if (!_consume(s, "("))
        return null;
    const coords = [];
    do {
        _skipWhitespace(s);
        const coord = _readCoordinate(s);
        if (coord === null)
            return null;
        coords.push(coord);
        _skipWhitespace(s);
    } while (_consume(s, ","));
    _skipWhitespace(s);
    if (!_consume(s, ")"))
        return null;
    return coords;
}
function _readRingList(s) {
    _skipWhitespace(s);
    if (!_consume(s, "("))
        return null;
    const rings = [];
    do {
        _skipWhitespace(s);
        const ring = _readCoordinateList(s);
        if (ring === null)
            return null;
        rings.push(ring);
        _skipWhitespace(s);
    } while (_consume(s, ","));
    _skipWhitespace(s);
    if (!_consume(s, ")"))
        return null;
    return rings;
}
// ─── Type parsers ────────────────────────────────────────────────────────────
function _parseEmpty(s) {
    const saved = s.pos;
    _skipWhitespace(s);
    const kw = _readKeyword(s);
    if (kw === "EMPTY")
        return true;
    s.pos = saved;
    return false;
}
function _parsePoint(s) {
    if (_parseEmpty(s))
        return { type: "Point", coordinates: [] };
    _skipWhitespace(s);
    if (!_consume(s, "("))
        return null;
    _skipWhitespace(s);
    const coord = _readCoordinate(s);
    if (coord === null)
        return null;
    _skipWhitespace(s);
    if (!_consume(s, ")"))
        return null;
    return { type: "Point", coordinates: coord };
}
function _parseLineString(s) {
    if (_parseEmpty(s))
        return { type: "LineString", coordinates: [] };
    const coords = _readCoordinateList(s);
    if (coords === null)
        return null;
    return { type: "LineString", coordinates: coords };
}
function _parsePolygon(s) {
    if (_parseEmpty(s))
        return { type: "Polygon", coordinates: [] };
    const rings = _readRingList(s);
    if (rings === null)
        return null;
    return { type: "Polygon", coordinates: rings };
}
function _parseMultiPoint(s) {
    if (_parseEmpty(s))
        return { type: "MultiPoint", coordinates: [] };
    _skipWhitespace(s);
    if (!_consume(s, "("))
        return null;
    const points = [];
    do {
        _skipWhitespace(s);
        // Support both MULTIPOINT((x y),(x y)) and MULTIPOINT(x y,x y)
        if (_peek(s) === "(") {
            const list = _readCoordinateList(s);
            if (list === null || list.length !== 1)
                return null;
            points.push(list[0]);
        }
        else {
            const coord = _readCoordinate(s);
            if (coord === null)
                return null;
            points.push(coord);
        }
        _skipWhitespace(s);
    } while (_consume(s, ","));
    _skipWhitespace(s);
    if (!_consume(s, ")"))
        return null;
    return { type: "MultiPoint", coordinates: points };
}
function _parseMultiLineString(s) {
    if (_parseEmpty(s))
        return { type: "MultiLineString", coordinates: [] };
    _skipWhitespace(s);
    if (!_consume(s, "("))
        return null;
    const lines = [];
    do {
        _skipWhitespace(s);
        const coords = _readCoordinateList(s);
        if (coords === null)
            return null;
        lines.push(coords);
        _skipWhitespace(s);
    } while (_consume(s, ","));
    _skipWhitespace(s);
    if (!_consume(s, ")"))
        return null;
    return { type: "MultiLineString", coordinates: lines };
}
function _parseMultiPolygon(s) {
    if (_parseEmpty(s))
        return { type: "MultiPolygon", coordinates: [] };
    _skipWhitespace(s);
    if (!_consume(s, "("))
        return null;
    const polygons = [];
    do {
        _skipWhitespace(s);
        const rings = _readRingList(s);
        if (rings === null)
            return null;
        polygons.push(rings);
        _skipWhitespace(s);
    } while (_consume(s, ","));
    _skipWhitespace(s);
    if (!_consume(s, ")"))
        return null;
    return { type: "MultiPolygon", coordinates: polygons };
}
function _parseGeometryCollection(s) {
    if (_parseEmpty(s))
        return { type: "GeometryCollection", geometries: [] };
    _skipWhitespace(s);
    if (!_consume(s, "("))
        return null;
    const geometries = [];
    do {
        _skipWhitespace(s);
        const geom = _parseGeometry(s);
        if (geom === null)
            return null;
        geometries.push(geom);
        _skipWhitespace(s);
    } while (_consume(s, ","));
    _skipWhitespace(s);
    if (!_consume(s, ")"))
        return null;
    return { type: "GeometryCollection", geometries };
}
// Forward declaration resolved here
function _parseGeometry(s) {
    _skipWhitespace(s);
    const keyword = _readKeyword(s);
    // Skip Z/M/ZM qualifiers (e.g. POINT Z (...))
    // NOTE: EMPTY is NOT consumed here — each sub-parser's _parseEmpty() call handles it.
    const saved = s.pos;
    _skipWhitespace(s);
    const qualifier = _readKeyword(s);
    if (qualifier !== "Z" && qualifier !== "M" && qualifier !== "ZM") {
        s.pos = saved;
    }
    switch (keyword) {
        case "POINT":
            return _parsePoint(s);
        case "LINESTRING":
            return _parseLineString(s);
        case "POLYGON":
            return _parsePolygon(s);
        case "MULTIPOINT":
            return _parseMultiPoint(s);
        case "MULTILINESTRING":
            return _parseMultiLineString(s);
        case "MULTIPOLYGON":
            return _parseMultiPolygon(s);
        case "GEOMETRYCOLLECTION":
            return _parseGeometryCollection(s);
        default:
            return null;
    }
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Converts a WKT geometry string to a GeoJSON geometry object.
 *
 * Supports all 7 standardised WKT geometry types (2D and 3D/Z):
 * `Point`, `LineString`, `Polygon`, `MultiPoint`, `MultiLineString`,
 * `MultiPolygon`, `GeometryCollection`.
 *
 * - SRID prefixes (e.g. `SRID=4326;POINT(...)`) are stripped before parsing.
 * - WKT qualifier tokens (`Z`, `M`, `ZM`) are accepted and ignored.
 * - Returns `null` when the input is null, empty, or syntactically invalid.
 * - Never throws.
 *
 * @param wkt - WKT geometry string.
 * @returns A GeoJSON geometry object, or `null` on failure.
 *
 * @example
 * ```typescript
 * wktToGeoJSON("POINT(2.3522 48.8566)")
 * // → { type: "Point", coordinates: [2.3522, 48.8566] }
 *
 * wktToGeoJSON("POINT Z (2.3522 48.8566 35)")
 * // → { type: "Point", coordinates: [2.3522, 48.8566, 35] }
 * ```
 */
function wktToGeoJSON(wkt) {
    if (wkt == null)
        return null;
    const trimmed = wkt.trim();
    if (!trimmed)
        return null;
    // Strip optional SRID prefix: "SRID=4326;"
    const stripped = trimmed.replace(/^SRID\s*=\s*\d+\s*;\s*/i, "");
    try {
        const state = { input: stripped, pos: 0 };
        const result = _parseGeometry(state);
        if (result === null)
            return null;
        // Ensure full input was consumed (no garbage at the end)
        _skipWhitespace(state);
        if (state.pos < state.input.length)
            return null;
        return result;
    }
    catch {
        return null;
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf Helpers - Performance optimization & DOM utilities
 * @module helpers/dom-helpers
 * SEC-03: innerHTML always via DOMSecurity (no raw assignment).
 */
function getElementById(id) {
    if (!id || typeof id !== "string")
        return null;
    return document.getElementById(id);
}
function querySelector(selector, parent = document) {
    if (!selector || typeof selector !== "string")
        return null;
    try {
        return parent.querySelector(selector);
    }
    catch {
        return null;
    }
}
function querySelectorAll(selector, parent = document) {
    if (!selector || typeof selector !== "string")
        return [];
    try {
        return Array.from(parent.querySelectorAll(selector));
    }
    catch {
        return [];
    }
}
function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    const { className, id, attributes = {}, dataset = {}, styles = {}, textContent, innerHTML, children = [], ...otherProps } = options;
    if (className)
        element.className = className;
    if (id)
        element.id = id;
    Object.keys(attributes).forEach((key) => {
        element.setAttribute(key, attributes[key]);
    });
    Object.keys(dataset).forEach((key) => {
        element.dataset[key] = dataset[key];
    });
    Object.keys(styles).forEach((key) => {
        element.style[key] = styles[key];
    });
    Object.keys(otherProps).forEach((key) => {
        if (key === "ariaLabel") {
            element.setAttribute("aria-label", String(otherProps[key]));
        }
        else if (key in element) {
            element[key] = otherProps[key];
        }
        else {
            element.setAttribute(key, String(otherProps[key]));
        }
    });
    if (innerHTML) {
        DOMSecurity.setSafeHTML(element, innerHTML);
    }
    else if (textContent) {
        element.textContent = textContent;
    }
    if (children.length > 0) {
        children.forEach((child) => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    }
    return element;
}
function addClass(element, ...classNames) {
    if (!element || !element.classList)
        return;
    const allClasses = classNames.flatMap((cn) => cn.split(" ")).filter(Boolean);
    element.classList.add(...allClasses);
}
function removeClass(element, ...classNames) {
    if (!element || !element.classList)
        return;
    const allClasses = classNames.flatMap((cn) => cn.split(" ")).filter(Boolean);
    element.classList.remove(...allClasses);
}
function toggleClass(element, className, force) {
    if (!element || !element.classList)
        return false;
    return element.classList.toggle(className, force);
}
function hasClass(element, className) {
    if (!element || !element.classList)
        return false;
    return element.classList.contains(className);
}
function removeElement(element) {
    if (element?.parentNode) {
        element.parentNode.removeChild(element);
    }
}
function requestFrame(callback) {
    const w = typeof window !== "undefined"
        ? window
        : typeof globalThis !== "undefined"
            ? globalThis
            : {};
    if (typeof w.requestAnimationFrame === "function") {
        return w.requestAnimationFrame(callback);
    }
    return setTimeout(callback, 0);
}
function cancelFrame(id) {
    const w = typeof window !== "undefined"
        ? window
        : typeof globalThis !== "undefined"
            ? globalThis
            : {};
    if (typeof w.cancelAnimationFrame === "function") {
        w.cancelAnimationFrame(id);
    }
    else {
        clearTimeout(id);
    }
}
function createAbortController(timeout) {
    const controller = new AbortController();
    if (timeout) {
        setTimeout(() => controller.abort(), timeout);
    }
    return controller;
}
function lazyLoadImage(img, options = { threshold: 0.1 }) {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
        const src = img.dataset.src || img.getAttribute("data-src");
        if (src)
            img.src = src;
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const lazyImg = entry.target;
                const src = lazyImg.dataset.src || lazyImg.getAttribute("data-src");
                if (src)
                    lazyImg.src = src;
                observer.unobserve(lazyImg);
            }
        });
    }, options);
    observer.observe(img);
}
function lazyExecute(callback, timeout = 100) {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(callback, { timeout });
    }
    else {
        setTimeout(callback, timeout);
    }
}
function clearObject(obj) {
    if (!obj || typeof obj !== "object")
        return;
    Object.keys(obj).forEach((key) => {
        delete obj[key];
    });
}
function createFragment(children = []) {
    const fragment = document.createDocumentFragment();
    children.forEach((child) => {
        if (child instanceof HTMLElement) {
            fragment.appendChild(child);
        }
    });
    return fragment;
}
function addEventListener(element, event, handler, options) {
    if (!element || !event || !handler)
        return () => { };
    element.addEventListener(event, handler, options);
    return () => {
        element.removeEventListener(event, handler, options);
    };
}
function addEventListeners(element, events, options) {
    if (!element || !events)
        return () => { };
    const cleanups = [];
    Object.keys(events).forEach((eventName) => {
        cleanups.push(addEventListener(element, eventName, events[eventName], options));
    });
    return () => {
        cleanups.forEach((cleanup) => cleanup());
    };
}
function delegateEvent(parent, event, selector, handler) {
    const delegatedHandler = (e) => {
        const target = e.target;
        if (target?.matches?.(selector)) {
            handler.call(target, e);
        }
    };
    return addEventListener(parent, event, delegatedHandler);
}
function deepClone(obj, seen = new WeakMap()) {
    if (obj === null || typeof obj !== "object")
        return obj;
    if (seen.has(obj))
        return seen.get(obj);
    if (obj instanceof Date)
        return new Date(obj.getTime());
    // eslint-disable-next-line security/detect-non-literal-regexp
    if (obj instanceof RegExp)
        return new RegExp(obj.source, obj.flags);
    if (Array.isArray(obj)) {
        const cloned = [];
        seen.set(obj, cloned);
        obj.forEach((item) => cloned.push(deepClone(item, seen)));
        return cloned;
    }
    const cloned = {};
    seen.set(obj, cloned);
    Object.keys(obj).forEach((key) => {
        cloned[key] = deepClone(obj[key], seen);
    });
    return cloned;
}
function isEmpty(value) {
    if (value == null)
        return true;
    if (typeof value === "string")
        return value.trim().length === 0;
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === "object")
        return Object.keys(value).length === 0;
    return false;
}
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const backoffDelay = delay * Math.pow(2, i);
                await wait(backoffDelay);
            }
        }
    }
    throw lastError;
}
const Helpers = {
    getElementById,
    querySelector,
    querySelectorAll,
    createElement,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    removeElement,
    requestFrame,
    cancelFrame,
    createAbortController,
    lazyLoadImage,
    lazyExecute,
    clearObject,
    createFragment,
    addEventListener,
    addEventListeners,
    delegateEvent,
    deepClone,
    isEmpty,
    wait,
    retryWithBackoff,
};

/**
 * GeoLeaf — General Validators
 * Generic validation functions (coordinates, URL, email, etc.)
 *
 * @module validators/general-validators
 */
function validateCoordinates(lat, lng, options = {}) {
    const { throwOnError = false } = options;
    try {
        validateCoordinates$1(lat, lng);
        return { valid: true, error: null };
    }
    catch (err) {
        const error = new Errors.ValidationError(err.message, { lat, lng });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
}
function _validateDataUrl(url, allowDataImages) {
    if (!allowDataImages) {
        throw new Errors.SecurityError("Data URLs are not allowed", { url, protocol: "data:" });
    }
    let end = url.indexOf(",");
    if (end < 0)
        end = url.indexOf(";");
    const dataType = url.substring(5, end >= 0 ? end : undefined).trim();
    if (!dataType.startsWith("image/")) {
        throw new Errors.SecurityError("Only data:image URLs are allowed", { url, dataType });
    }
}
function validateUrl(url, options = {}) {
    const { allowedProtocols = ["http:", "https:", "data:"], allowDataImages = true, throwOnError = false, } = options;
    if (!url || typeof url !== "string") {
        const error = new Errors.ValidationError("URL must be a non-empty string", {
            url,
            type: typeof url,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message, url: null };
    }
    try {
        const parsed = new URL(url, "http://dummy.com");
        const protocol = parsed.protocol;
        if (!allowedProtocols.includes(protocol)) {
            if (protocol === "data:") {
                _validateDataUrl(url, allowDataImages);
            }
            else {
                throw new Errors.SecurityError(`Protocol "${protocol}" not allowed`, {
                    url,
                    protocol,
                    allowed: allowedProtocols,
                });
            }
        }
        if (protocol === "data:") {
            _validateDataUrl(url, allowDataImages);
        }
        return { valid: true, error: null, url: parsed.href };
    }
    catch (err) {
        if (throwOnError)
            throw err;
        return { valid: false, error: err.message, url: null };
    }
}
function validateEmail(email, options = {}) {
    const { throwOnError = false } = options;
    if (!email || typeof email !== "string") {
        const error = new Errors.ValidationError("Email must be a non-empty string", {
            email,
            type: typeof email,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const error = new Errors.ValidationError("Invalid email format", { email });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    return { valid: true, error: null };
}
function validatePhone(phone, options = {}) {
    const { throwOnError = false } = options;
    if (!phone || typeof phone !== "string") {
        const error = new Errors.ValidationError("Phone must be a non-empty string", {
            phone,
            type: typeof phone,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!phoneRegex.test(phone)) {
        const error = new Errors.ValidationError("Invalid phone format", { phone });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
        const error = new Errors.ValidationError("Phone number must contain at least 10 digits", {
            phone,
            digitCount: digits.length,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    return { valid: true, error: null };
}
function validateZoom(zoom, options = {}) {
    const { min = 0, max = 20, throwOnError = false } = options;
    if (typeof zoom !== "number") {
        const error = new Errors.ValidationError("Zoom must be a number", {
            zoom,
            type: typeof zoom,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    if (!Number.isFinite(zoom)) {
        const error = new Errors.ValidationError("Zoom must be a finite number", { zoom });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    if (zoom < min || zoom > max) {
        const error = new Errors.ValidationError(`Zoom must be between ${min} and ${max}`, {
            zoom,
            min,
            max,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    return { valid: true, error: null };
}
function validateRequiredFields(config, requiredFields, options = {}) {
    const { throwOnError = false } = options;
    if (!config || typeof config !== "object") {
        const error = new Errors.ConfigError("Config must be an object", {
            config,
            type: typeof config,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message, missing: requiredFields };
    }
    const missing = requiredFields.filter((field) => !(field in config) || config[field] === null || config[field] === undefined);
    if (missing.length > 0) {
        const error = new Errors.ConfigError(`Missing required fields: ${missing.join(", ")}`, {
            config,
            missing,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message, missing };
    }
    return { valid: true, error: null, missing: [] };
}
const _VALID_GEOJSON_TYPES = new Set([
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "GeometryCollection",
    "Feature",
    "FeatureCollection",
]);
function _geoJSONCheck(condition, ErrorClass, message, ctx, throwOnError) {
    const err = new ErrorClass(message, ctx);
    if (throwOnError)
        throw err;
    return { valid: false, error: err.message };
}
function validateGeoJSON(geojson, options = {}) {
    const { throwOnError = false } = options;
    const fail = (ErrorClass, msg, ctx) => _geoJSONCheck(true, ErrorClass, msg, ctx, throwOnError);
    if (!geojson || typeof geojson !== "object") {
        return fail(Errors.ValidationError, "GeoJSON must be an object", {
            geojson,
            type: typeof geojson,
        });
    }
    if (!geojson.type) {
        return fail(Errors.ValidationError, "GeoJSON must have a type field", { geojson });
    }
    if (!_VALID_GEOJSON_TYPES.has(geojson.type)) {
        return fail(Errors.ValidationError, "Invalid GeoJSON type", {
            type: geojson.type,
            validTypes: [..._VALID_GEOJSON_TYPES],
        });
    }
    if (geojson.type === "Feature" && !geojson.geometry) {
        return fail(Errors.ValidationError, "Feature must have a geometry", { geojson });
    }
    if (geojson.type === "FeatureCollection" && !Array.isArray(geojson.features)) {
        return fail(Errors.ValidationError, "FeatureCollection must have a features array", {
            geojson,
        });
    }
    return { valid: true, error: null };
}
function validateColor(color, options = {}) {
    const { throwOnError = false } = options;
    if (!color || typeof color !== "string") {
        const error = new Errors.ValidationError("Color must be a non-empty string", {
            color,
            type: typeof color,
        });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    // eslint-disable-next-line security/detect-unsafe-regex
    const hexRegex = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
    const isValid = hexRegex.test(color) ||
        rgbRegex.test(color) ||
        rgbaRegex.test(color) ||
        (typeof CSS !== "undefined" && CSS.supports("color", color));
    if (!isValid) {
        const error = new Errors.ValidationError("Invalid color format", { color });
        if (throwOnError)
            throw error;
        return { valid: false, error: error.message };
    }
    return { valid: true, error: null };
}
function validateBatch(validations) {
    const errors = [];
    for (const item of validations) {
        const { value, validator, options = {}, label = "value" } = item;
        if (typeof validator !== "function") {
            errors.push(`Invalid validator for ${label}`);
            continue;
        }
        const result = validator(value, { ...options, throwOnError: false });
        if (!result.valid) {
            errors.push(`${label}: ${result.error ?? "validation failed"}`);
        }
    }
    return { valid: errors.length === 0, errors };
}
const Validators = {
    validateCoordinates,
    validateUrl,
    validateEmail,
    validatePhone,
    validateZoom,
    validateRequiredFields,
    validateGeoJSON,
    validateColor,
    validateBatch,
};

/*!
 * GeoLeaf Core – Runtime performance metrics
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 *
 * Collects custom metrics (time to first layer, time to interactivity) and
 * exposes them for dev (console) or prod (callback/beacon).
 * @see docs/PERFORMANCE_METRICS.md
 */
const _g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const GeoLeaf$1 = _g.GeoLeaf || {};
let cachedMetrics = null;
function getNavigationStart() {
    if (typeof performance === "undefined")
        return 0;
    if ("timeOrigin" in performance &&
        typeof performance.timeOrigin === "number") {
        return performance.timeOrigin;
    }
    return 0;
}
function collectMetrics() {
    if (cachedMetrics)
        return cachedMetrics;
    const navStart = getNavigationStart();
    let timeToMapReadyMs = null;
    let timeToAppReadyMs = null;
    let startupTotalMs = null;
    if (typeof performance !== "undefined" && performance.getEntriesByName) {
        const measures = performance.getEntriesByName("geoleaf:startup-total", "measure");
        if (measures.length > 0) {
            startupTotalMs = measures[measures.length - 1].duration;
        }
    }
    const mapReadyMark = typeof performance !== "undefined" && performance.getEntriesByName
        ? performance.getEntriesByName("geoleaf:initApp:ready", "mark")
        : [];
    if (mapReadyMark.length > 0) {
        const entry = mapReadyMark[mapReadyMark.length - 1];
        timeToMapReadyMs = Math.round("startTime" in entry ? entry.startTime : 0);
    }
    if (navStart) {
        timeToAppReadyMs = Math.round(Date.now() - navStart);
    }
    cachedMetrics = {
        timeToMapReadyMs,
        timeToAppReadyMs,
        startupTotalMs,
        capturedAt: new Date().toISOString(),
    };
    return cachedMetrics;
}
function logToConsole(metrics) {
    const parts = ["[GeoLeaf Perf]"];
    if (metrics.timeToMapReadyMs != null) {
        parts.push(`map ready: ${metrics.timeToMapReadyMs}ms`);
    }
    if (metrics.timeToAppReadyMs != null) {
        parts.push(`app ready: ${metrics.timeToAppReadyMs}ms`);
    }
    if (metrics.startupTotalMs != null) {
        parts.push(`startup: ${metrics.startupTotalMs.toFixed(1)}ms`);
    }
    if (typeof console !== "undefined" && console.info) {
        console.info(parts.join(" | "));
    }
}
function onAppReady() {
    const metrics = collectMetrics();
    const gl = _g.GeoLeaf || GeoLeaf$1;
    if (gl._perfCallback && typeof gl._perfCallback === "function") {
        try {
            gl._perfCallback(metrics);
        }
        catch (e) {
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[GeoLeaf Perf] Callback error:", e);
            }
        }
    }
    const debugPerf = gl._debugPerf === true ||
        (typeof _g.__GEOLEAF_PERF_DEBUG__ !== "undefined" && _g.__GEOLEAF_PERF_DEBUG__);
    if (debugPerf) {
        logToConsole(metrics);
    }
}
if (typeof document !== "undefined") {
    document.addEventListener("geoleaf:app:ready", onAppReady, { once: true });
}
/**
 * Returns the last collected runtime metrics (or collects now if not yet done).
 * Use after geoleaf:app:ready has fired for full data.
 */
function getRuntimeMetrics() {
    return collectMetrics();
}
/**
 * Resets cached metrics (e.g. for tests or SPA navigation).
 */
function resetRuntimeMetrics() {
    cachedMetrics = null;
}
if (_g.GeoLeaf) {
    _g.GeoLeaf.getPerformanceMetrics = getRuntimeMetrics;
    _g.GeoLeaf.getRuntimeMetrics = getRuntimeMetrics;
    _g.GeoLeaf.resetRuntimeMetrics = resetRuntimeMetrics;
}

export { createEventBus as $, getActiveProfile as A, compareByOrder as B, Core as C, getColorsFromLayerStyle as D, validateUrl$2 as E, formatNumber as F, DOMSecurity as G, AbstractRenderer as H, createElement$1 as I, poisToFeatureCollection as J, blockMapPropagation as K, Log as L, StyleLoader as M, FetchHelper as N, events as O, getNestedValue as P, Errors as Q, CSRFToken as R, SENTINEL_POI as S, AnimationHelper as T, Utils as U, getAnimationHelper as V, ErrorLogger as W, EventHelpers as X, EventListenerManager as Y, globalEventManager as Z, bus as _, toCasingPaint as a, FetchError as a0, FileValidator as a1, MapHelpers as a2, PerformanceProfiler as a3, getPerformanceProfiler as a4, LazyLoader as a5, getLazyLoader as a6, TimerManager as a7, setNestedValue as a8, hasNestedPath as a9, clearScaleCache as aa, registerDict as ab, haversineDistance as ac, resolvePoiColors as ad, StyleValidator as ae, StyleValidatorRules as af, SimpleTextRenderer as ag, DataNormalizer as ah, DataConverter as ai, ProfileLoader$1 as aj, ConfigNormalizer as ak, ProfileLoader as al, ProfileManager as am, StorageHelper as an, TaxonomyManager as ao, getDistance as ap, ensureMap as aq, validateCoordinates$1 as ar, validateNumber as as, Helpers as at, Validators as au, initI18n as av, padBounds as aw, GeoLeafError as ax, toLinePaint as b, collectHatchPatterns as c, toFillExtrusionPaint as d, toCirclePaint as e, toSourceId as f, getLog as g, toSubLayerId as h, dispatchGeoLeafEvent as i, calculateMapScale as j, isScaleInRange as k, debounce as l, escapeHtml as m, normalizeToFlat as n, domCreate as o, getLabel as p, resolveField as q, registerHatchPattern as r, styleRulesToPaint as s, toFillPaint as t, Security as u, validateUrl$1 as v, wktToGeoJSON as w, Config as x, CONSTANTS as y, StyleResolver as z };
//# sourceMappingURL=geoleaf-chunk-core-utils-CrTxiE0o.js.map
