import { L as Log, v as validateUrl, i as dispatchGeoLeafEvent, G as DOMSecurity, o as domCreate, x as Config, M as StyleLoader, p as getLabel, K as blockMapPropagation } from './geoleaf-chunk-core-utils-CGzgeOnm.js';
import { G as GeoJSONCore, a as GeoJSONShared } from './geoleaf-chunk-geojson-Cb7z5K-I.js';
import { L as Labels, a as LabelButtonManager, _ as _UIComponents } from './geoleaf-chunk-labels-CRJhnuZN.js';
import { L as Legend } from './geoleaf-chunk-legend-ocC0_8sN.js';
import { _ as _ThemeApplier } from './geoleaf-chunk-themes-DbPJCjeg.js';

/*!
 * GeoLeaf Core – Baselayers / URL Utilities
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
/**
 * Default basemap definitions (no API key required).
 * Each entry includes a legacy `url` field and a pre-expanded `tiles` array (MapLibre-compatible).
 */
/**
 * Strips a `{apikey}` placeholder and its surrounding query separator from a URL.
 * Handles both `?param={apikey}` (sole param) and `&param={apikey}` (additional param).
 * @internal
 */
function _stripApiKeyParam(url) {
    // Remove "&param={apikey}" or "?param={apikey}" (the latter becomes just the base URL)
    return url
        .replace(/[&?][^&?]*=\{apikey\}/g, "")
        .replace(/[?&]$/, ""); // clean trailing separator if any
}
/**
 * Expands a `{s}` subdomain URL template into an array of
 * explicit tile URLs suitable for MapLibre raster sources.
 *
 * Rules:
 * - If `definition.tiles` is a non-empty array → returned as-is (highest priority),
 *   then `{apikey}` placeholders are resolved using `definition.apiKey`.
 * - If `definition.url` starts with `pmtiles://` → returned as single-element array (no expansion).
 * - If `definition.url` contains `{s}` → expanded using `definition.subdomains`
 *   (string `"abc"` or array `["a","b","c"]`; defaults to `["a","b","c"]`).
 * - If `definition.url` is present without `{s}` → returned as single-element array.
 * - Otherwise → empty array.
 *
 * API key injection:
 * - If any resolved URL contains `{apikey}` and `definition.apiKey` is provided,
 *   `{apikey}` is replaced with the key value for all URLs.
 * - If `apiKey` is absent and `definition.apiKeyRequired` is `true`,
 *   a warning is emitted and an empty array is returned (basemap disabled).
 * - If `apiKey` is absent and `apiKeyRequired` is not set (optional key, e.g. Stadia),
 *   the `{apikey}` placeholder and its query param are stripped — the URL remains valid
 *   for unauthenticated access.
 *
 * @param definition - Basemap configuration object.
 * @returns Array of resolved tile URL strings.
 */
function normalizeTilesArray(definition) {
    let urls;
    if (Array.isArray(definition.tiles) && definition.tiles.length > 0) {
        urls = definition.tiles;
    }
    else {
        const url = definition.url;
        if (!url)
            return [];
        // PMTiles protocol — do not expand; MapLibre handles it natively
        if (url.startsWith("pmtiles://"))
            return [url];
        if (url.includes("{s}")) {
            const raw = definition.subdomains;
            const subs = typeof raw === "string"
                ? raw.split("")
                : Array.isArray(raw) && raw.length > 0
                    ? raw
                    : ["a", "b", "c"];
            urls = subs.map((s) => url.replace("{s}", s));
        }
        else {
            urls = [url];
        }
    }
    // Inject API key if any URL contains the {apikey} placeholder
    const hasApiKeyPlaceholder = urls.some((u) => u.includes("{apikey}"));
    if (!hasApiKeyPlaceholder)
        return urls;
    const apiKey = typeof definition.apiKey === "string" ? definition.apiKey : undefined;
    if (apiKey) {
        return urls.map((u) => u.replace(/\{apikey\}/g, apiKey));
    }
    if (definition.apiKeyRequired) {
        // Key required but not provided — disable to avoid silent HTTP 403.
        // Uses console directly: the Log module is not imported in this file.
        const id = definition.id ?? definition.label ?? "(unknown)";
        // eslint-disable-next-line no-console
        console.warn(`[GeoLeaf.Baselayers] Provider "${id}" requires an API key (apiKey field). Basemap disabled.`);
        return [];
    }
    // Key optional — strip the {apikey} query param so the URL remains valid
    // for unauthenticated access (e.g. Stadia Maps free tier).
    return urls.map(_stripApiKeyParam);
}
/**
 * Silence MapLibre GL v5 "Expected value to be of type number, but found null"
 * warnings emitted by the Liberty (OpenFreeMap) basemap style.
 * Applies fixed filters via setFilter() — no tile reloading.
 * @param {object} glMap - Live MapLibre Map instance
 */
function applyLibertyFilters(glMap) {
    const PATCHES = {
        boundary_3: { admin_level: -1, maritime: 0, disputed: 0 },
        road_motorway_link: { ramp: 0 },
        road_motorway_link_casing: { ramp: 0 },
        road_link: { ramp: 0 },
        road_link_casing: { ramp: 0 },
        bridge_motorway_link: { ramp: 0 },
        bridge_motorway_link_casing: { ramp: 0 },
        tunnel_motorway_link: { ramp: 0 },
        tunnel_motorway_link_casing: { ramp: 0 },
        tunnel_link: { ramp: 0 },
        tunnel_link_casing: { ramp: 0 },
        road_one_way_arrow: { oneway: 0 },
        road_one_way_arrow_opposite: { oneway: 0 },
        label_city: { capital: 0 },
        label_city_capital: { capital: 0 },
        poi_r1: { rank: 0 },
        poi_r7: { rank: 0 },
        poi_r20: { rank: 0 },
        label_country_1: { rank: 0 },
        label_country_2: { rank: 0 },
        label_country_3: { rank: 0 },
    };
    function _patchExpr(expr, propMap) {
        if (!Array.isArray(expr))
            return expr;
        if (expr[0] === "get" && expr.length === 2 && typeof expr[1] === "string") {
            if (Object.prototype.hasOwnProperty.call(propMap, expr[1])) {
                return ["coalesce", expr, propMap[expr[1]]];
            }
        }
        return expr.map((item) => (Array.isArray(item) ? _patchExpr(item, propMap) : item));
    }
    for (const [layerId, propMap] of Object.entries(PATCHES)) {
        try {
            if (!glMap.getLayer(layerId))
                continue;
            const currentFilter = glMap.getFilter(layerId);
            if (!currentFilter)
                continue;
            glMap.setFilter(layerId, _patchExpr(currentFilter, propMap));
        }
        catch (_e) {
            // layer absent from this style — skip silently
        }
    }
}

/*!
 * GeoLeaf Core – Basemaps / Terrain Manager
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 *
 * Manages 3D terrain rendering via MapLibre GL JS native API:
 *   - raster-dem source ("terrain-dem")
 *   - map.setTerrain() / map.setTerrain(null)
 *   - camera easeTo() for pitch/bearing transitions
 *
 * CRITICAL ordering rule:
 *   setTerrain(null) MUST precede removeSource("terrain-dem").
 *   Source removal is deferred to map.once("render") to avoid MapLibre
 *   throwing when the source is still referenced by the render pipeline.
 */
// ─── Fixed IDs ───────────────────────────────────────────────────────────────
/** MapLibre source id used for raster-dem terrain. */
const TERRAIN_SOURCE_ID = "terrain-dem";
// ─── State ───────────────────────────────────────────────────────────────────
/** Whether the terrain is currently active on the map. */
let _isActive = false;
// ─── Public API ──────────────────────────────────────────────────────────────
/**
 * Named error handler for the DEM source. Stored as a stable reference
 * so it can be removed on deactivation without leaking listeners.
 */
function _onTerrainError(e) {
    if (e?.sourceId === TERRAIN_SOURCE_ID) {
        Log.warn("[TerrainManager] DEM tile error:", e.error?.message ?? e.error);
    }
}
/**
 * Returns whether 3D terrain is currently active on the map.
 */
function isTerrainActive() {
    return _isActive;
}
/**
 * Resolves terrain default values and applies raster-dem source + terrain to the map.
 * Separated from `activateTerrain` to keep per-function size under limit.
 * @internal
 */
function _applyTerrainToMap(map, config, basemapKey) {
    const encoding = config.demEncoding ?? "terrarium";
    const exaggeration = config.exaggeration ?? 1.5;
    const pitch = config.pitch ?? 45;
    const bearing = config.bearing ?? 0;
    const tileSize = 256;
    const maxzoom = config.demMaxZoom ?? 15;
    // Add raster-dem source only if not already present (idempotent)
    if (!map.getSource(TERRAIN_SOURCE_ID)) {
        map.addSource(TERRAIN_SOURCE_ID, {
            type: "raster-dem",
            tiles: [config.demUrl],
            encoding,
            tileSize,
            maxzoom,
        });
        Log.debug("[TerrainManager] raster-dem source added:", config.demUrl);
    }
    map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration });
    map.easeTo({ pitch, bearing });
    // Listen for DEM tile loading errors (CORS, 404, rate-limiting, etc.).
    // Without this, raster-dem failures are silently swallowed by MapLibre.
    map.on("error", _onTerrainError);
    _isActive = true;
    Log.info("[TerrainManager] Terrain 3D activated for basemap:", basemapKey, { exaggeration, pitch, bearing });
}
/**
 * Activates 3D terrain rendering for a given basemap config.
 *
 * - Adds a `raster-dem` source named `terrain-dem` (if not already present).
 * - Calls `map.setTerrain()` with the configured source and exaggeration.
 * - Applies the configured pitch and bearing via `map.easeTo()`.
 *
 * @param map - The native maplibregl.Map instance.
 * @param config - The terrain configuration from the basemap definition.
 * @param basemapKey - The key of the basemap this terrain config belongs to.
 */
function activateTerrain(map, config, basemapKey) {
    if (!map || typeof map.getSource !== "function") {
        Log.warn("[TerrainManager] activate: no valid map instance.");
        return;
    }
    if (!config.enabled) {
        Log.warn("[TerrainManager] activate called but terrain.enabled is false.");
        return;
    }
    if (!config.demUrl) {
        Log.warn("[TerrainManager] activate: terrain.demUrl is required but missing for basemap:", basemapKey);
        return;
    }
    try {
        _applyTerrainToMap(map, config, basemapKey);
    }
    catch (err) {
        Log.error("[TerrainManager] Failed to activate terrain:", err);
    }
}
/**
 * Deactivates 3D terrain rendering.
 *
 * - Calls `map.setTerrain(null)` to detach the terrain.
 * - Defers `removeSource("terrain-dem")` via `map.once("render")` to avoid
 *   MapLibre errors when the source is still referenced by the render pipeline.
 * - Resets pitch and bearing to 0 via `map.easeTo()`.
 *
 * @param map - The native maplibregl.Map instance.
 */
function deactivateTerrain(map) {
    if (!map || typeof map.setTerrain !== "function") {
        Log.warn("[TerrainManager] deactivate: no valid map instance.");
        return;
    }
    try {
        // CRITICAL: setTerrain(null) MUST precede removeSource
        map.setTerrain(null);
        Log.debug("[TerrainManager] setTerrain(null) called.");
        // Stop listening for DEM errors
        map.off("error", _onTerrainError);
        map.easeTo({ pitch: 0, bearing: 0 });
        // Mark inactive immediately so the deferred removal guard works
        // even when the callback fires synchronously (e.g. in tests).
        _isActive = false;
        // Defer source removal until after the next render frame
        map.once("render", () => {
            if (_isActive)
                return; // terrain re-activated synchronously before this frame
            try {
                if (map.getSource?.(TERRAIN_SOURCE_ID)) {
                    map.removeSource(TERRAIN_SOURCE_ID);
                    Log.debug("[TerrainManager] raster-dem source removed.");
                }
            }
            catch (removeErr) {
                Log.warn("[TerrainManager] Could not remove terrain source:", removeErr);
            }
        });
        Log.info("[TerrainManager] Terrain 3D deactivated.");
    }
    catch (err) {
        Log.error("[TerrainManager] Failed to deactivate terrain:", err);
    }
}
/**
 * Extracts the TerrainConfig from a basemap definition if it is valid and enabled.
 *
 * Performs boot-time validation:
 * - Logs an error if `terrain.enabled` is true but `terrain.demUrl` is missing.
 *
 * @param definition - The basemap config object from the registry.
 * @param key - The basemap key (for log messages).
 * @returns The TerrainConfig if valid and enabled, otherwise null.
 */
function resolveTerrainConfig(definition, key) {
    if (!definition?.terrain?.enabled)
        return null;
    const terrain = definition.terrain;
    // Require demUrl when enabled
    if (!terrain.demUrl) {
        Log.error(`[TerrainManager] basemap "${key}" has terrain.enabled: true but terrain.demUrl is missing.` +
            ` Terrain will not be activated for this basemap.`);
        return null;
    }
    return terrain;
}

/*!
 * GeoLeaf Core – Basemaps / Image Source
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 *
 * Implements static image overlays using MapLibre GL JS `type:"image"` sources.
 * Used as a basemap type when a georeferenced image (plan, scan, ortho, etc.)
 * must be overlaid at fixed geographic coordinates.
 *
 * Security: image URLs are validated before use. No innerHTML or eval.
 */
// ─── Constants ────────────────────────────────────────────────────────────────
/** Source ID shared with raster basemap. */
const BASEMAP_SOURCE_ID$1 = "__geoleaf_basemap__";
/** Layer ID shared with raster basemap. */
const BASEMAP_LAYER_ID$2 = "__geoleaf_basemap_layer__";
/**
 * Default image corner coordinates covering the Web Mercator world extent.
 * [topLeft, topRight, bottomRight, bottomLeft] as [lng, lat].
 * @internal
 */
const WORLD_COORDS = [
    [-180, 85.051129],
    [180, 85.051129],
    [180, -85.051129],
    [-180, -85.051129],
];
// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Validates that image corner coordinates form a valid 4-element array of [lng, lat] pairs.
 * Order: [topLeft, topRight, bottomRight, bottomLeft].
 * @internal
 */
function _validateCoordinates(coords) {
    if (!Array.isArray(coords) || coords.length !== 4)
        return false;
    return coords.every((pair) => Array.isArray(pair) &&
        pair.length === 2 &&
        typeof pair[0] === "number" &&
        typeof pair[1] === "number" &&
        pair[0] >= -180 &&
        pair[0] <= 180 &&
        pair[1] >= -90 &&
        pair[1] <= 90);
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Builds a MapLibre image source spec and raster layer spec from a basemap definition.
 * Pure factory — does not call any map API.
 *
 * @param definition - Basemap config with `imageSource.url` and `imageSource.coordinates`.
 * @param sourceId - Source ID to use.
 * @param layerId - Layer ID to use.
 * @returns Source and layer specs, or null if the definition is invalid.
 */
function buildImageSourceSpec(definition, sourceId, layerId) {
    const config = definition?.imageSource;
    if (!config?.url) {
        Log.warn("[GeoLeaf.ImageSource] imageSource.url is required.");
        return null;
    }
    // Security: validate URL before use
    const safeUrl = validateUrl(config.url, ["http:", "https:", "data:"]);
    if (!safeUrl) {
        Log.error("[GeoLeaf.ImageSource] Invalid or unsafe imageSource.url:", config.url);
        return null;
    }
    // Validate and default coordinates
    const coordsValid = _validateCoordinates(config.coordinates);
    if (!coordsValid) {
        Log.warn("[GeoLeaf.ImageSource] imageSource.coordinates invalid — using world bounds. " +
            "Expected 4 [lng, lat] pairs: [topLeft, topRight, bottomRight, bottomLeft].");
    }
    const coords = coordsValid ? config.coordinates : WORLD_COORDS;
    const opacity = typeof config.opacity === "number" ? Math.max(0, Math.min(1, config.opacity)) : 1;
    const sourceSpec = {
        type: "image",
        url: safeUrl,
        coordinates: coords,
    };
    const layerSpec = {
        id: layerId,
        type: "raster",
        source: sourceId,
        paint: { "raster-opacity": opacity },
    };
    return { sourceSpec, layerSpec };
}
/**
 * Applies an image basemap to the map.
 * Adds a MapLibre `type:"image"` source and a raster layer below all existing layers.
 *
 * @param map - Native `maplibregl.Map` instance.
 * @param definition - Basemap config with `imageSource` settings.
 * @param sourceId - Source ID. Defaults to `"__geoleaf_basemap__"`.
 * @param layerId - Layer ID. Defaults to `"__geoleaf_basemap_layer__"`.
 */
function applyImageBasemap(map, definition, sourceId = BASEMAP_SOURCE_ID$1, layerId = BASEMAP_LAYER_ID$2) {
    const specs = buildImageSourceSpec(definition, sourceId, layerId);
    if (!specs) {
        Log.error("[GeoLeaf.ImageSource] Cannot apply: invalid definition.");
        return;
    }
    map.addSource(sourceId, specs.sourceSpec);
    const existingLayers = map.getStyle()?.layers ?? [];
    const firstLayerId = existingLayers[0]?.id;
    if (firstLayerId) {
        map.addLayer(specs.layerSpec, firstLayerId);
    }
    else {
        map.addLayer(specs.layerSpec);
    }
    Log.info("[GeoLeaf.ImageSource] Image basemap applied:", config_url(definition));
}
/** @internal Extracts the image URL for logging without re-validating. */
function config_url(definition) {
    return definition?.imageSource?.url ?? "(unknown)";
}

/*!
 * GeoLeaf Core – Basemaps / Hillshade
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 *
 * Implements hillshade (terrain shadow / ambient occlusion) as a basemap type.
 * Uses a MapLibre `raster-dem` source with a `hillshade` render layer.
 *
 * Terrain-dem reuse: when the terrain-manager has already added a `raster-dem`
 * source with a matching DEM URL, the hillshade layer reuses that source to avoid
 * redundant tile loading.
 *
 * Security: DEM URLs are validated before use. No innerHTML or eval.
 */
// ─── Constants ────────────────────────────────────────────────────────────────
/** Source ID managed by terrain-manager for 3D terrain. */
const TERRAIN_DEM_SOURCE_ID = "terrain-dem";
/** Source ID used for hillshade when terrain-dem cannot be reused. */
const HILLSHADE_SOURCE_ID = "__geoleaf_basemap__";
/** Layer ID shared with the basemap layer slot. */
const BASEMAP_LAYER_ID$1 = "__geoleaf_basemap_layer__";
// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Builds the hillshade render layer spec, referencing the given source.
 * @internal
 */
function _buildHillshadeLayerSpec(sourceId, layerId, config) {
    const paint = {};
    if (config.shadowColor)
        paint["hillshade-shadow-color"] = config.shadowColor;
    if (config.highlightColor)
        paint["hillshade-highlight-color"] = config.highlightColor;
    if (config.accentColor)
        paint["hillshade-accent-color"] = config.accentColor;
    if (typeof config.exaggeration === "number") {
        paint["hillshade-exaggeration"] = Math.max(0, Math.min(1, config.exaggeration));
    }
    if (typeof config.illuminationDirection === "number") {
        paint["hillshade-illumination-direction"] = config.illuminationDirection;
    }
    if (config.illuminationAnchor) {
        paint["hillshade-illumination-anchor"] = config.illuminationAnchor;
    }
    return { id: layerId, type: "hillshade", source: sourceId, paint };
}
/**
 * Returns the tiles array from an existing `raster-dem` map source, or null.
 * MapLibre exposes `.tiles` on the source spec; this may be absent in some versions.
 * @internal
 */
function _getExistingDemTiles(map, sourceId) {
    if (!map?.getSource)
        return null;
    const src = map.getSource(sourceId);
    if (!src)
        return null;
    return Array.isArray(src.tiles) ? src.tiles : null;
}
/**
 * Returns `true` when the `terrain-dem` source exists and contains `demUrl`.
 * @internal
 */
function _canReuseTerrainSource(map, demUrl) {
    const tiles = _getExistingDemTiles(map, TERRAIN_DEM_SOURCE_ID);
    return tiles !== null && tiles.includes(demUrl);
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Builds a MapLibre `raster-dem` source spec for a hillshade basemap.
 * Pure factory — does not call any map API.
 *
 * @param definition - Basemap config with `hillshade.demUrl` (or top-level `demUrl`).
 * @returns The raster-dem source spec.
 */
function buildHillshadeSourceSpec(definition) {
    const config = definition?.hillshade ?? {};
    const demUrl = config.demUrl ?? definition.demUrl ?? "";
    const encoding = config.demEncoding ?? definition.demEncoding ?? "terrarium";
    const maxzoom = typeof config.demMaxZoom === "number"
        ? config.demMaxZoom
        : typeof definition.demMaxZoom === "number"
            ? definition.demMaxZoom
            : 15;
    return {
        type: "raster-dem",
        tiles: [demUrl],
        encoding,
        tileSize: 256,
        maxzoom,
    };
}
/**
 * Applies a hillshade basemap to the map.
 *
 * - Reuses `terrain-dem` source if it already covers the same DEM URL.
 * - Otherwise adds a new `raster-dem` source using `HILLSHADE_SOURCE_ID`.
 * - Inserts the hillshade layer below all existing layers.
 *
 * @param map - Native `maplibregl.Map` instance.
 * @param definition - Basemap config with `hillshade` settings.
 * @param layerId - Layer ID. Defaults to `"__geoleaf_basemap_layer__"`.
 * @returns The source ID actually used (`"terrain-dem"` or `"__geoleaf_basemap__"`).
 */
function applyHillshadeBasemap(map, definition, layerId = BASEMAP_LAYER_ID$1) {
    const config = definition?.hillshade ?? {};
    const demUrl = config.demUrl ?? definition.demUrl ?? "";
    if (!demUrl) {
        Log.error("[GeoLeaf.Hillshade] hillshade.demUrl is required.");
        return HILLSHADE_SOURCE_ID;
    }
    // Security: validate DEM URL before use
    const safeDemUrl = validateUrl(demUrl, ["http:", "https:"]);
    if (!safeDemUrl) {
        Log.error("[GeoLeaf.Hillshade] Invalid hillshade demUrl:", demUrl);
        return HILLSHADE_SOURCE_ID;
    }
    // Determine source to use
    let sourceId = HILLSHADE_SOURCE_ID;
    if (_canReuseTerrainSource(map, demUrl)) {
        sourceId = TERRAIN_DEM_SOURCE_ID;
        Log.debug("[GeoLeaf.Hillshade] Reusing terrain-dem source for hillshade.");
    }
    else if (!map.getSource?.(HILLSHADE_SOURCE_ID)) {
        map.addSource(HILLSHADE_SOURCE_ID, buildHillshadeSourceSpec(definition));
    }
    const layerSpec = _buildHillshadeLayerSpec(sourceId, layerId, config);
    const existingLayers = map.getStyle()?.layers ?? [];
    const firstLayerId = existingLayers[0]?.id;
    if (firstLayerId) {
        map.addLayer(layerSpec, firstLayerId);
    }
    else {
        map.addLayer(layerSpec);
    }
    Log.info("[GeoLeaf.Hillshade] Hillshade basemap applied (source:", sourceId, ")");
    return sourceId;
}

/*!
 * GeoLeaf Core – Basemaps / WMTS & WMS Resolver
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 *
 * WMTS: fetches GetCapabilities XML, extracts an XYZ-compatible tile URL template,
 *       caches the result per GetCapabilities URL (in-process memory cache).
 * WMS:  builds a MapLibre-compatible WMS tile URL template from configuration
 *       parameters (no network request required).
 *
 * Security:
 *   - All input URLs validated via validateUrl() before fetch.
 *   - XML parsed with DOMParser (no eval, no innerHTML, no XSS risk).
 *   - External entity expansion (XXE) is not possible in browser DOMParser.
 *   - URLs extracted from XML are validated before use or caching.
 *   - AbortController on all fetch requests (cooperative cancellation).
 *   - No dynamic code execution.
 */
// ─── In-memory WMTS cache ─────────────────────────────────────────────────────
/** Maps GetCapabilities URL → resolved XYZ tile URL template. */
const _wmtsCache = new Map();
// ─── Namespace-safe DOM traversal helpers ────────────────────────────────────
/**
 * Returns all descendant elements whose `localName` equals `name`.
 * Works correctly in jsdom and browsers regardless of XML namespace prefixes.
 * @internal
 */
function _byLocalName(parent, name) {
    const all = parent.getElementsByTagName("*");
    const result = [];
    for (let i = 0; i < all.length; i++) {
        if (all[i].localName === name)
            result.push(all[i]);
    }
    return result;
}
/**
 * Returns the first descendant element whose `localName` equals `name`, or `null`.
 * @internal
 */
function _firstByLocalName(parent, name) {
    const all = parent.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
        if (all[i].localName === name)
            return all[i];
    }
    return null;
}
/**
 * Returns the trimmed text content of the first descendant matching `localName`.
 * @internal
 */
function _getText(parent, localName) {
    return _firstByLocalName(parent, localName)?.textContent?.trim() ?? null;
}
// ─── WMTS XML parsing helpers ─────────────────────────────────────────────────
/**
 * Finds the first `<Layer>` element matching `layerName`,
 * or the first available layer when `layerName` is omitted.
 * @internal
 */
function _findWmtsLayer(doc, layerName) {
    const layers = _byLocalName(doc, "Layer").filter((l) => _firstByLocalName(l, "Identifier") !== null);
    if (!layers.length)
        return null;
    if (!layerName)
        return layers[0];
    // When a specific layer is requested, return null on miss rather than falling
    // back silently to an unrelated layer.
    return layers.find((l) => _getText(l, "Identifier") === layerName) ?? null;
}
/**
 * Returns the TileMatrixSet identifier from a layer's `<TileMatrixSetLink>`
 * that matches `tileMatrixSet`, or the identifier from the first link found.
 * @internal
 */
function _findTileMatrixSetId(layer, tileMatrixSet) {
    const links = _byLocalName(layer, "TileMatrixSetLink");
    const fallbackLinks = links.length ? links : _byLocalName(layer, "TileMatrixLink");
    if (!fallbackLinks.length)
        return null;
    if (tileMatrixSet) {
        const exact = fallbackLinks.find((l) => _getText(l, "TileMatrixSet") === tileMatrixSet);
        if (exact)
            return _getText(exact, "TileMatrixSet");
        // Some providers (IGN) use range-qualified identifiers like "PM_0_19" for "PM".
        // If a link starts with the requested value, honour the caller's intent and
        // return the requested value so GetTile uses TILEMATRIXSET=PM (not PM_0_19).
        const hasPrefix = fallbackLinks.some((l) => _getText(l, "TileMatrixSet")?.startsWith(tileMatrixSet) ?? false);
        if (hasPrefix)
            return tileMatrixSet;
    }
    return _getText(fallbackLinks[0], "TileMatrixSet");
}
/**
 * Returns the identifier of the default `<Style>` element on a WMTS layer,
 * or an empty string when no style is declared (empty string is valid per spec).
 * @internal
 */
function _findDefaultStyle(layer) {
    const styles = _byLocalName(layer, "Style");
    if (!styles.length)
        return "";
    const def = styles.find((s) => s.getAttribute("isDefault") === "true");
    const target = def ?? styles[0];
    return _getText(target, "Identifier") ?? "";
}
/**
 * Converts WMTS template variables to MapLibre XYZ placeholders.
 * `{TileMatrix}` → `{z}`, `{TileRow}` → `{y}`, `{TileCol}` → `{x}`,
 * `{Style}` → resolved style identifier.
 * @internal
 */
function _toXyzTemplate(template, tmsId, styleId) {
    return template
        .replace(/\{TileMatrixSet\}/gi, tmsId ?? "")
        .replace(/\{Style\}/gi, styleId)
        .replace(/\{TileMatrix\}/gi, "{z}")
        .replace(/\{TileRow\}/gi, "{y}")
        .replace(/\{TileCol\}/gi, "{x}");
}
/**
 * Builds a KVP fallback tile URL if no RESTful ResourceURL is available.
 * @internal
 */
function _buildKvpFallback(doc, layer, tmsId, format, styleId) {
    if (!tmsId)
        return null;
    // Find the GetTile Operation element by name attribute
    const operations = _byLocalName(doc, "Operation");
    const getTile = operations.find((op) => op.getAttribute("name") === "GetTile");
    if (!getTile)
        return null;
    const getEl = _firstByLocalName(getTile, "Get");
    if (!getEl)
        return null;
    // xlink:href is a namespaced attribute — use getAttributeNS for cross-environment
    // compatibility (jsdom XML parser + all browsers). Fall back to plain href.
    const XLINK = "http://www.w3.org/1999/xlink";
    const onlineResource = _firstByLocalName(getEl, "OnlineResource");
    const opUrl = getEl.getAttributeNS(XLINK, "href") ??
        getEl.getAttribute("href") ??
        onlineResource?.getAttributeNS(XLINK, "href") ??
        onlineResource?.getAttribute("href") ??
        null;
    if (!opUrl)
        return null;
    const layerId = _getText(layer, "Identifier") ?? "";
    // Strip any existing query string from the operation URL before appending params.
    // IGN and similar WMTS services return operation URLs like
    // "https://...?SERVICE=WMTS&REQUEST=GetCapabilities" — we need only the base path.
    const base = opUrl.split("?")[0];
    const params = [
        "SERVICE=WMTS",
        "REQUEST=GetTile",
        "VERSION=1.0.0",
        `LAYER=${encodeURIComponent(layerId)}`,
        `STYLE=${encodeURIComponent(styleId)}`,
        `TILEMATRIXSET=${encodeURIComponent(tmsId)}`,
        "TILEMATRIX={z}",
        "TILEROW={y}",
        "TILECOL={x}",
        `FORMAT=${encodeURIComponent(format)}`,
    ].join("&");
    return `${base}?${params}`;
}
/**
 * Extracts the XYZ tile URL template from a WMTS layer element.
 * Prefers RESTful `<ResourceURL>` templates; falls back to KVP parameters.
 * @internal
 */
function _extractTileUrl(doc, layer, tmsId, format) {
    const styleId = _findDefaultStyle(layer);
    const resourceUrls = _byLocalName(layer, "ResourceURL");
    for (const ru of resourceUrls) {
        if (ru.getAttribute("resourceType") !== "tile")
            continue;
        const template = ru.getAttribute("template");
        if (template)
            return _toXyzTemplate(template, tmsId, styleId);
    }
    return _buildKvpFallback(doc, layer, tmsId, format, styleId);
}
// ─── WMTS public API ──────────────────────────────────────────────────────────
/**
 * Parses a WMTS GetCapabilities XML string and returns a MapLibre-compatible
 * XYZ tile URL template.
 *
 * @param xml - Raw XML string from a GetCapabilities response.
 * @param layerName - Target WMTS layer identifier (uses first layer if omitted).
 * @param tileMatrixSet - TileMatrixSet identifier (uses first available if omitted).
 * @param format - Tile image format (e.g. `"image/png"`).
 * @returns The resolved XYZ tile URL template, or `null` on failure.
 */
function parseWmtsCapabilities(xml, layerName, tileMatrixSet, format) {
    let doc;
    try {
        const parser = new DOMParser();
        doc = parser.parseFromString(xml, "application/xml");
    }
    catch (e) {
        Log.error("[GeoLeaf.WMTS] Failed to parse GetCapabilities XML:", e);
        return null;
    }
    // DOMParser signals XML errors via a <parsererror> element
    if (doc.querySelector("parsererror")) {
        Log.error("[GeoLeaf.WMTS] Malformed XML in GetCapabilities response.");
        return null;
    }
    const layer = _findWmtsLayer(doc, layerName);
    if (!layer) {
        Log.error("[GeoLeaf.WMTS] No matching layer found in GetCapabilities.");
        return null;
    }
    const tmsId = _findTileMatrixSetId(layer, tileMatrixSet);
    const tileUrl = _extractTileUrl(doc, layer, tmsId, format);
    if (!tileUrl) {
        Log.error("[GeoLeaf.WMTS] Cannot extract tile URL from GetCapabilities.");
        return null;
    }
    return tileUrl;
}
/**
 * Fetches WMTS GetCapabilities XML, resolves the XYZ tile URL template,
 * and caches the result for subsequent calls with the same GetCapabilities URL.
 *
 * @param definition - Basemap config with `wmts.getCapabilitiesUrl` and optional
 *   `wmts.layer`, `wmts.tileMatrixSet`, `wmts.format`.
 * @param signal - Optional `AbortSignal` for cooperative cancellation.
 * @returns The resolved XYZ tile URL, or `null` on failure or cancellation.
 */
async function resolveWmtsTilesUrl(definition, signal) {
    const config = definition?.wmts ?? {};
    const capsUrl = config.getCapabilitiesUrl ?? "";
    if (!capsUrl) {
        Log.warn("[GeoLeaf.WMTS] wmts.getCapabilitiesUrl is required.");
        return null;
    }
    // Inject optional API key into the GetCapabilities URL
    const apiKey = typeof definition.apiKey === "string" ? definition.apiKey : undefined;
    const resolvedCapsUrl = apiKey
        ? capsUrl.includes("?")
            ? `${capsUrl}&apikey=${encodeURIComponent(apiKey)}`
            : `${capsUrl}?apikey=${encodeURIComponent(apiKey)}`
        : capsUrl;
    // Security: validate GetCapabilities URL before fetch
    const safeCapsUrl = validateUrl(resolvedCapsUrl, ["http:", "https:"]);
    if (!safeCapsUrl) {
        Log.error("[GeoLeaf.WMTS] Invalid GetCapabilities URL:", resolvedCapsUrl);
        return null;
    }
    const format = config.format ?? "image/png";
    // Cache key includes layer + tileMatrixSet + format so that multiple layers
    // sharing the same GetCapabilities URL (e.g. IGN) each get their own entry.
    const cacheKey = `${safeCapsUrl}|${config.layer ?? ""}|${config.tileMatrixSet ?? ""}|${format}`;
    // Return cached result if available
    const cached = _wmtsCache.get(cacheKey);
    if (cached) {
        Log.debug("[GeoLeaf.WMTS] Cache hit for:", cacheKey);
        return cached;
    }
    try {
        const response = await fetch(safeCapsUrl, {
            method: "GET",
            headers: { Accept: "application/xml, text/xml" },
            signal,
        });
        if (!response.ok) {
            Log.error("[GeoLeaf.WMTS] GetCapabilities request failed:", response.status, response.statusText);
            return null;
        }
        const xml = await response.text();
        const tileUrl = parseWmtsCapabilities(xml, config.layer, config.tileMatrixSet, format);
        if (!tileUrl)
            return null;
        // Security: validate the extracted tile URL before caching
        // Replace template vars with "0" for URL validation
        const probeUrl = tileUrl.replace(/\{[^}]+\}/g, "0");
        const safeProbe = validateUrl(probeUrl, ["http:", "https:"]);
        if (!safeProbe) {
            Log.error("[GeoLeaf.WMTS] Extracted tile URL failed security validation:", tileUrl);
            return null;
        }
        _wmtsCache.set(cacheKey, tileUrl);
        Log.info("[GeoLeaf.WMTS] Resolved tile URL:", tileUrl);
        return tileUrl;
    }
    catch (e) {
        if (e?.name === "AbortError") {
            Log.debug("[GeoLeaf.WMTS] GetCapabilities request aborted.");
        }
        else {
            Log.error("[GeoLeaf.WMTS] Failed to fetch GetCapabilities:", e);
        }
        return null;
    }
}
// ─── WMS URL builder ──────────────────────────────────────────────────────────
/**
 * Builds a MapLibre-compatible WMS tile URL template from a WMS basemap config.
 *
 * The resulting URL uses `{bbox-epsg-3857}` which MapLibre replaces with the
 * actual EPSG:3857 bounding box for each tile request.
 *
 * @param definition - Basemap config with `wms.url` and `wms.layers`.
 * @returns The WMS tile URL template, or `null` if the config is invalid.
 */
function buildWmsUrl(definition) {
    const config = definition?.wms ?? {};
    const baseUrl = config.url ?? "";
    const layers = config.layers ?? "";
    if (!baseUrl) {
        Log.warn("[GeoLeaf.WMS] wms.url is required.");
        return null;
    }
    if (!layers) {
        Log.warn("[GeoLeaf.WMS] wms.layers is required.");
        return null;
    }
    // Security: validate base URL before use
    const safeBaseUrl = validateUrl(baseUrl, ["http:", "https:"]);
    if (!safeBaseUrl) {
        Log.error("[GeoLeaf.WMS] Invalid WMS URL:", baseUrl);
        return null;
    }
    const version = config.version ?? "1.3.0";
    const crs = config.crs ?? "EPSG:3857";
    const format = config.format ?? "image/png";
    const transparent = config.transparent !== false;
    const size = typeof config.tileSize === "number" ? config.tileSize : 256;
    const base = safeBaseUrl.replace(/[?&]$/, "");
    const styles = config.styles ?? "";
    // Build params without URLSearchParams to preserve the `{bbox-epsg-3857}` placeholder.
    // URLSearchParams would encode `{` / `}` as `%7B` / `%7D`, which MapLibre cannot resolve.
    const params = [
        "SERVICE=WMS",
        `VERSION=${encodeURIComponent(version)}`,
        "REQUEST=GetMap",
        `LAYERS=${encodeURIComponent(layers)}`,
        `CRS=${encodeURIComponent(crs)}`,
        "BBOX={bbox-epsg-3857}",
        `WIDTH=${size}`,
        `HEIGHT=${size}`,
        `FORMAT=${encodeURIComponent(format)}`,
        `TRANSPARENT=${transparent ? "TRUE" : "FALSE"}`,
        `STYLES=${encodeURIComponent(styles)}`,
    ].join("&");
    return `${base}?${params}`;
}

/*!
 * GeoLeaf Core – Baselayers / Registry
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 *
 * Sprint 3: rewritten to use the native MapLibre GL API.
 * The map instance stored here is a raw `maplibregl.Map`,
 * not an IMapAdapter wrapper.
 */
const _g$2 = globalThis;
// ─── Fixed IDs ───────────────────────────────────────────────────────────────
/** MapLibre source id used for raster basemaps. */
const BASEMAP_SOURCE_ID = "__geoleaf_basemap__";
/** MapLibre layer id used for raster basemaps. */
const BASEMAP_LAYER_ID = "__geoleaf_basemap_layer__";
// ─── State ───────────────────────────────────────────────────────────────────
/** Native `maplibregl.Map` instance (null before init or after destroy). */
let _map = null;
/** Key of the currently active basemap. */
let _activeKey = null;
/**
 * Type of the currently active basemap — used by the switcher to know
 * whether a source+layer removal is needed before switching.
 * - 'raster' : was applied via addSource + addLayer
 * - 'vector' : was applied via setStyle (replaces the entire style)
 */
let _activeType = null;
/**
 * Registry of all registered basemaps.
 * Each entry: `{ key, label, definition: BasemapConfig, layer: null }`
 * `layer: null` is a backward-compat tombstone — no layer instance is stored.
 */
const _baseLayers = Object.create(null);
/**
 * Monotonically increasing counter used to guard against race conditions
 * when the user switches basemaps faster than `style.load` fires.
 * Each call to `_applyViaStyleChange()` increments the counter; the
 * `style.load` callback skips work if the generation no longer matches.
 * Also used by the WMTS async path as a stale-switch guard.
 */
let _styleGeneration = 0;
/** AbortController for any in-flight WMTS GetCapabilities request. */
let _wmtsAbort = null;
/**
 * Empty MapLibre style used when transitioning from a vector basemap to
 * a raster one. `setStyle(EMPTY_STYLE)` clears the previous vector style
 * so that the raster source and layer can be injected cleanly.
 */
const EMPTY_STYLE = { version: 8, sources: {}, layers: [] };
// ─── Map resolution ──────────────────────────────────────────────────────────
/**
 * Duck-type check for a native maplibregl.Map instance.
 * Detects the presence of `addSource` and `addLayer` methods.
 */
function _isNativeMaplibreMap(m) {
    return m != null && typeof m.addSource === "function" && typeof m.addLayer === "function";
}
/**
 * Resolves and caches the native maplibregl.Map instance.
 *
 * Resolution order:
 * 1. Explicit map passed as argument (must pass _isNativeMaplibreMap).
 * 2. Already-cached `_map` (if still a valid native map).
 * 3. Fallback via `GeoLeaf.Core.getMap().getNativeMap()`.
 */
function ensureMap(explicitMap) {
    if (_map && _isNativeMaplibreMap(_map))
        return;
    const adapter = _g$2.GeoLeaf?.Core?.getMap?.();
    const native = adapter && typeof adapter.getNativeMap === "function" ? adapter.getNativeMap() : null;
    if (native && _isNativeMaplibreMap(native)) {
        _map = native;
        Log.info("[GeoLeaf.Baselayers] ensureMap: acquired via Core.getMap().getNativeMap().");
    }
}
function setMap(mapInstance) {
    // Accept null/undefined to clear the cached map (used in tests and destroy flows).
    if (mapInstance == null) {
        _map = null;
        return;
    }
    // Accept an IMapAdapter — unwrap to native map via getNativeMap().
    if (typeof mapInstance.getNativeMap === "function") {
        const native = mapInstance.getNativeMap();
        if (_isNativeMaplibreMap(native)) {
            _map = native;
            return;
        }
    }
    if (_isNativeMaplibreMap(mapInstance)) {
        _map = mapInstance;
    }
}
// ─── Basemap type resolution ─────────────────────────────────────────────────
/**
 * Determines whether a basemap definition should be applied as a
 * raster source (`addSource`/`addLayer`) or a vector style (`setStyle`).
 * Image, hillshade, WMTS, and WMS types all return `"raster"` — they use
 * the same sync removal path as XYZ raster tiles.
 */
function _resolveBasemapType(definition) {
    if (definition.type === "maplibre")
        return "vector";
    if (definition.type === "image" ||
        definition.type === "hillshade" ||
        definition.type === "wmts" ||
        definition.type === "wms") {
        return "raster";
    }
    // A style URL without a raster url/tiles → vector
    if (definition.style && !definition.url && !definition.tiles)
        return "vector";
    // PMTiles: if a style URL is also provided treat as vector; otherwise raster
    const firstTile = definition.url || (Array.isArray(definition.tiles) ? definition.tiles[0] : undefined);
    if (firstTile?.startsWith("pmtiles://")) {
        return definition.style ? "vector" : "raster";
    }
    return "raster";
}
// ─── Raster basemap builders ─────────────────────────────────────────────────
/**
 * Builds a MapLibre raster source spec and layer spec from a basemap definition.
 * Pure factory — does not call any map API.
 */
function _buildRasterSourceSpec(definition) {
    const tiles = normalizeTilesArray(definition);
    const tileSize = typeof definition.tileSize === "number" ? definition.tileSize : 256;
    const attribution = definition.attribution ?? definition.options?.attribution ?? "";
    const sourceSpec = {
        type: "raster",
        tiles,
        tileSize,
    };
    if (attribution)
        sourceSpec.attribution = attribution;
    if (typeof definition.minZoom === "number")
        sourceSpec.minzoom = definition.minZoom;
    if (typeof definition.maxZoom === "number") {
        sourceSpec.maxzoom = definition.maxZoom;
    }
    else if (typeof definition.options?.maxZoom === "number") {
        sourceSpec.maxzoom = definition.options.maxZoom;
    }
    const layerSpec = {
        id: BASEMAP_LAYER_ID,
        type: "raster",
        source: BASEMAP_SOURCE_ID,
    };
    return { sourceSpec, layerSpec };
}
/**
 * Injects a raster basemap into the map by adding a raster source and layer.
 * The basemap is always inserted below all existing layers to avoid covering data layers.
 */
function _applyRasterBasemap(nativeMap, definition) {
    const { sourceSpec, layerSpec } = _buildRasterSourceSpec(definition);
    nativeMap.addSource(BASEMAP_SOURCE_ID, sourceSpec);
    // Insert below all existing layers — basemap must always be at the bottom of the render stack.
    const existingLayers = nativeMap.getStyle()?.layers ?? [];
    const firstLayerId = existingLayers[0]?.id;
    if (firstLayerId) {
        nativeMap.addLayer(layerSpec, firstLayerId);
    }
    else {
        nativeMap.addLayer(layerSpec);
    }
    _activeType = "raster";
}
// ─── WMS raster basemap ───────────────────────────────────────────────────────
/**
 * Builds a MapLibre raster source from a WMS config and applies it to the map.
 * WMS tiles are fetched in EPSG:3857 using MapLibre's `{bbox-epsg-3857}` template.
 */
function _applyWmsBasemap(nativeMap, definition) {
    const tilesUrl = buildWmsUrl(definition);
    if (!tilesUrl) {
        Log.error("[GeoLeaf.Baselayers] Cannot build WMS URL.", definition?.id);
        return;
    }
    const tileSize = typeof definition.wms?.tileSize === "number" ? definition.wms.tileSize : 256;
    const attribution = definition.attribution ?? "";
    const sourceSpec = {
        type: "raster",
        tiles: [tilesUrl],
        tileSize,
    };
    if (attribution)
        sourceSpec.attribution = attribution;
    if (typeof definition.minZoom === "number")
        sourceSpec.minzoom = definition.minZoom;
    if (typeof definition.maxZoom === "number")
        sourceSpec.maxzoom = definition.maxZoom;
    nativeMap.addSource(BASEMAP_SOURCE_ID, sourceSpec);
    const existingLayers = nativeMap.getStyle()?.layers ?? [];
    const firstLayerId = existingLayers[0]?.id;
    const layerSpec = {
        id: BASEMAP_LAYER_ID,
        type: "raster",
        source: BASEMAP_SOURCE_ID,
    };
    if (firstLayerId) {
        nativeMap.addLayer(layerSpec, firstLayerId);
    }
    else {
        nativeMap.addLayer(layerSpec);
    }
    _activeType = "raster";
}
// ─── WMTS async basemap ───────────────────────────────────────────────────────
/**
 * Fetches WMTS GetCapabilities asynchronously, then applies the basemap.
 * Uses `_styleGeneration` as a stale-switch guard (if the user switches away
 * before resolution, the result is discarded).
 * Any previous in-flight request is aborted before starting a new one.
 */
function _applyWmtsBasemap(nativeMap, definition, key, previousKey, options) {
    // Abort any pending GetCapabilities fetch
    _wmtsAbort?.abort();
    _wmtsAbort = new AbortController();
    const generation = ++_styleGeneration;
    // Set state eagerly so getActiveKey() is consistent during the async gap
    _activeKey = key;
    _activeType = "raster";
    resolveWmtsTilesUrl(definition, _wmtsAbort.signal)
        .then((tilesUrl) => {
        // Discard stale result if user has already switched to another basemap
        if (_styleGeneration !== generation) {
            Log.debug("[GeoLeaf.Baselayers] WMTS resolution superseded — skipping.");
            return;
        }
        _wmtsAbort = null;
        if (!tilesUrl) {
            Log.error("[GeoLeaf.Baselayers] WMTS resolution failed for:", key);
            return;
        }
        try {
            // Build a resolved definition with the XYZ tile URL
            const resolved = { ...definition, tiles: [tilesUrl] };
            _applyRasterBasemap(nativeMap, resolved);
        }
        catch (e) {
            Log.error("[GeoLeaf.Baselayers] Cannot apply WMTS basemap:", e);
            return;
        }
        _handleTerrainOnSyncSwitch(key, definition);
        if (!options.silent)
            _dispatchBasemapChange(key, previousKey, definition);
    })
        .catch((e) => {
        Log.error("[GeoLeaf.Baselayers] WMTS async error:", e);
    });
}
// ─── Vector basemap via setStyle ─────────────────────────────────────────────
/**
 * Applies a basemap via `map.setStyle()` — full style replacement.
 *
 * Used for **all** transitions where the source or target basemap is vector:
 * raster→vector, vector→raster, vector→vector.
 *
 * After the new style loads:
 * 1. Resets the adapter (layer registry, sentinel, cluster IDs).
 * 2. Applies the target basemap (raster source/layer or vector filters).
 * 3. Dispatches `geoleaf:style:rebuild` so modules re-inject data layers.
 * 4. Activates terrain if the target has `terrain.default3D: true`.
 * 5. Dispatches `geoleaf:basemap:change`.
 */
function _applyViaStyleChange(nativeMap, definition, targetType, key, previousKey, options) {
    const generation = ++_styleGeneration;
    // Set state immediately so getActiveKey() is consistent during async gap
    _activeKey = key;
    _activeType = targetType;
    // Deactivate terrain before style replacement (source will be destroyed)
    if (isTerrainActive()) {
        deactivateTerrain(nativeMap);
    }
    const styleTarget = targetType === "vector" ? definition.style : EMPTY_STYLE;
    // Register the listener BEFORE calling setStyle(). For inline style
    // objects (e.g. EMPTY_STYLE) MapLibre may fire `style.load` synchronously
    // during setStyle(), so the handler must already be in place.
    nativeMap.once("style.load", () => {
        // Guard against superseded style changes (rapid basemap switching)
        if (_styleGeneration !== generation)
            return;
        // 1. Reset adapter internal state (registry, sentinel, clusters)
        const adapter = _g$2.GeoLeaf?.Core?.getAdapter?.();
        if (adapter && typeof adapter.resetForStyleChange === "function") {
            adapter.resetForStyleChange();
        }
        // 2. Apply basemap
        if (targetType === "vector") {
            applyLibertyFilters(nativeMap);
            Log.info("[GeoLeaf.Baselayers] Vector style loaded:", key);
        }
        else if (definition.type === "wmts") {
            // WMTS needs async GetCapabilities resolution — cannot apply inline here.
            // Fire style:rebuild first so data layers re-inject after the style reset,
            // then delegate tile injection, terrain, and change dispatch to _applyWmtsBasemap.
            dispatchGeoLeafEvent("geoleaf:style:rebuild", undefined);
            _applyWmtsBasemap(nativeMap, definition, key, previousKey, options);
            return;
        }
        else {
            try {
                _applyRasterBasemap(nativeMap, definition);
            }
            catch (e) {
                Log.error("[GeoLeaf.Baselayers] Cannot apply raster after style change:", e);
            }
        }
        // 3. Rebuild data layers (GeoJSON, POI, etc.)
        dispatchGeoLeafEvent("geoleaf:style:rebuild", undefined);
        // 4. Terrain activation (directly — no nested style.load)
        const terrainConfig = resolveTerrainConfig(definition, key);
        if (terrainConfig?.default3D) {
            activateTerrain(nativeMap, terrainConfig, key);
        }
        // 5. Notify
        Log.info("[GeoLeaf.Baselayers] Active basemap:", key);
        if (!options.silent) {
            _dispatchBasemapChange(key, previousKey, definition);
        }
    });
    // Trigger style replacement AFTER the listener is in place.
    nativeMap.setStyle(styleTarget);
}
// ─── Switcher ────────────────────────────────────────────────────────────────
/**
 * Removes the currently active raster basemap source and layer.
 * Only used by the sync path (raster→raster). Vector basemaps are handled
 * entirely by `_applyViaStyleChange()` which calls `setStyle()`.
 */
function _removeCurrentBasemap() {
    if (!_map || _activeType !== "raster")
        return;
    try {
        if (_map.getLayer?.(BASEMAP_LAYER_ID)) {
            _map.removeLayer(BASEMAP_LAYER_ID);
        }
        if (_map.getSource?.(BASEMAP_SOURCE_ID)) {
            _map.removeSource(BASEMAP_SOURCE_ID);
        }
    }
    catch (e) {
        Log.warn("[GeoLeaf.Baselayers] Cannot remove current basemap:", e);
    }
}
// ─── Registration ────────────────────────────────────────────────────────────
/**
 * Registers a single basemap definition by key.
 * No map API calls are made at registration time — the definition is stored
 * and applied lazily when `setBaseLayer()` is called.
 *
 * If the key is already registered (e.g. from `registerDefaultBaseLayers`),
 * the new definition is shallow-merged on top of the existing one so that
 * profile overrides (apiKey, defaultBasemap, label, offline…) take effect
 * without losing the structural fields (tiles, wmts, attribution…) already
 * provided by the default entry.
 */
function registerBaseLayer(key, definition) {
    if (!key) {
        Log.warn("[GeoLeaf.Baselayers] registerBaseLayer called without key.");
        return;
    }
    if (!definition) {
        Log.warn("[GeoLeaf.Baselayers] Missing definition for layer:", key);
        return;
    }
    const actualKey = definition.id || key;
    // Merge with existing entry when re-registering a known key (e.g. profile override)
    const existing = _baseLayers[actualKey]?.definition;
    const merged = existing ? { ...existing, ...definition } : definition;
    const label = merged.label || actualKey;
    // Validate: must have url, tiles, style, or be one of the extended raster types
    const hasRaster = !!merged.url || (Array.isArray(merged.tiles) && merged.tiles.length > 0);
    const hasVector = !!(merged.style || merged.type === "maplibre");
    const hasExtendedType = ["image", "hillshade", "wmts", "wms"].includes(merged.type);
    if (!hasRaster && !hasVector && !hasExtendedType) {
        Log.warn("[GeoLeaf.Baselayers] Invalid definition for layer:", actualKey, "(no url / tiles / style / type provided)");
        return;
    }
    _baseLayers[actualKey] = {
        key: actualKey,
        label,
        definition: merged,
        layer: null, // tombstone — no layer instance
    };
    // Validate terrain config at registration time (boot-time warnings/errors)
    if (merged.terrain?.enabled) {
        resolveTerrainConfig(merged, actualKey);
    }
}
function registerBaseLayers(definitions) {
    if (!definitions || typeof definitions !== "object") {
        Log.warn("[GeoLeaf.Baselayers] registerBaseLayers expects a definitions object.");
        return;
    }
    Object.keys(definitions).forEach((key) => registerBaseLayer(key, definitions[key]));
}
// ─── Activation ──────────────────────────────────────────────────────────────
function _dispatchBasemapChange(key, previousKey, definition) {
    if (typeof document === "undefined" || typeof document.dispatchEvent !== "function")
        return;
    const detail = {
        key,
        previousKey,
        map: _map,
        definition,
        layer: null, // tombstone for backward compat — no layer instance
        source: "geoleaf.baselayers",
    };
    try {
        document.dispatchEvent(new CustomEvent("geoleaf:basemap:change", { detail }));
    }
    catch (err) {
        Log.warn("[GeoLeaf.Baselayers] Cannot dispatch geoleaf:basemap:change.", err);
    }
}
/**
 * Handles terrain activation/deactivation for the sync raster→raster path.
 * Deactivates any active terrain, then auto-activates if `default3D: true`.
 *
 * The async vector path (`_applyViaStyleChange`) handles terrain directly
 * inside its `style.load` callback.
 * @internal
 */
function _handleTerrainOnSyncSwitch(key, definition) {
    if (isTerrainActive()) {
        deactivateTerrain(_map);
    }
    const terrainConfig = resolveTerrainConfig(definition, key);
    if (!terrainConfig?.default3D)
        return;
    activateTerrain(_map, terrainConfig, key);
}
/**
 * Dispatches the correct sync basemap apply function based on `definition.type`.
 * @internal
 */
function _applySyncBasemapByType(nativeMap, definition) {
    if (definition.type === "image") {
        applyImageBasemap(nativeMap, definition);
        _activeType = "raster";
    }
    else if (definition.type === "hillshade") {
        applyHillshadeBasemap(nativeMap, definition);
        _activeType = "raster";
    }
    else if (definition.type === "wms") {
        _applyWmsBasemap(nativeMap, definition);
    }
    else {
        _applyRasterBasemap(nativeMap, definition);
    }
}
/**
 * Sync raster→raster switch: removes the old basemap, applies the new one,
 * activates terrain, and dispatches the change event.
 * @internal
 */
function _applySyncRasterSwitch(nativeMap, definition, key, previousKey, options) {
    _removeCurrentBasemap();
    try {
        _applySyncBasemapByType(nativeMap, definition);
    }
    catch (e) {
        Log.error("[GeoLeaf.Baselayers] Cannot apply basemap:", e);
        return;
    }
    _activeKey = key;
    Log.info("[GeoLeaf.Baselayers] Active basemap:", key);
    _handleTerrainOnSyncSwitch(key, definition);
    if (!options.silent)
        _dispatchBasemapChange(key, previousKey, definition);
}
/**
 * Activates a registered basemap by key.
 *
 * Three code paths:
 * - **Vector path**: `setStyle()` — full style replacement via `_applyViaStyleChange()`.
 * - **WMTS async path**: fetch GetCapabilities, then inject raster source.
 * - **Sync raster path**: remove old source/layer, add new one.
 *
 * If the map style is not yet loaded, activation is deferred until `load`.
 */
function setBaseLayer(key, options = {}) {
    if (!key) {
        Log.warn("[GeoLeaf.Baselayers] setBaseLayer called without key.");
        return;
    }
    const previousKey = _activeKey;
    ensureMap();
    Log.info("[GeoLeaf.Baselayers] setBaseLayer:", key, "_map=", !!_map);
    if (!_map) {
        Log.warn("[GeoLeaf.Baselayers] No maplibregl.Map available.");
        return;
    }
    if (!_baseLayers[key]) {
        Log.warn("[GeoLeaf.Baselayers] Unknown layer:", key);
        const keys = Object.keys(_baseLayers);
        if (!previousKey && keys.length > 0)
            setBaseLayer(keys[0], { silent: true });
        return;
    }
    if (_activeKey === key)
        return;
    if (typeof _map.loaded === "function" && !_map.loaded()) {
        _map.once("load", () => setBaseLayer(key, options));
        return;
    }
    const definition = _baseLayers[key].definition;
    const targetType = _resolveBasemapType(definition);
    if (targetType === "vector" || _activeType === "vector") {
        _applyViaStyleChange(_map, definition, targetType, key, previousKey, options);
    }
    else if (definition.type === "wmts") {
        _removeCurrentBasemap();
        _applyWmtsBasemap(_map, definition, key, previousKey, options);
    }
    else {
        _applySyncRasterSwitch(_map, definition, key, previousKey, options);
    }
}
// ─── Accessors ───────────────────────────────────────────────────────────────
function getBaseLayers() {
    return { ..._baseLayers };
}
function getActiveKey() {
    return _activeKey;
}
/**
 * Returns the `BasemapConfig` definition of the currently active basemap.
 * Returns `null` when no basemap is active.
 *
 * NOTE: unlike the pre-Sprint-3 version, this no longer returns a
 * layer instance. The `layer` field on each `_baseLayers` entry is always
 * `null` and exists only for backward compatibility.
 */
function getActiveLayer() {
    if (!_activeKey || !_baseLayers[_activeKey])
        return null;
    return _baseLayers[_activeKey].definition ?? null;
}

/*!

 * GeoLeaf Core – Baselayers / UI

 * © 2026 Mattieu Pottier

 * Released under the MIT License

 */
const _g$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
let _uiBound = false;
let _resizeHandler = null;
// ---------------------------------------------------------
// Indicator active
// ---------------------------------------------------------
function _updateActiveIndicator(panel, activeButton) {
    if (!panel || !activeButton)
        return;
    const panelRect = panel.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    panel.style.setProperty("--indicator-left", buttonRect.left - panelRect.left + "px");
    panel.style.setProperty("--indicator-width", buttonRect.width + "px");
}
// ---------------------------------------------------------
// UI refresh
// ---------------------------------------------------------
function refreshUI() {
    if (!_g$1.document)
        return;
    const elements = _g$1.document.querySelectorAll("[data-gl-baselayer]");
    const leftPanel = _g$1.document.getElementById("gl-left-panel");
    const activeKey = getActiveKey();
    let activeElement = null;
    elements.forEach((el) => {
        const key = el.getAttribute("data-gl-baselayer");
        if (!key)
            return;
        const isActive = key === activeKey;
        el.classList.toggle("gl-baselayer-active", isActive);
        el.classList.toggle("gl-is-active", isActive);
        el.setAttribute("aria-pressed", String(isActive));
        if (isActive)
            activeElement = el;
    });
    if (leftPanel && activeElement) {
        _updateActiveIndicator(leftPanel, activeElement);
    }
}
// ---------------------------------------------------------
// Creation des controles UI
// ---------------------------------------------------------
// Creation des controles UI (helpers)
// ---------------------------------------------------------
function _computeShowControls(uiCfg) {
    return uiCfg && uiCfg.showBaseLayerControls === false ? false : !!uiCfg;
}
function _createLeftPanel() {
    const panel = _g$1.document.createElement("div");
    panel.id = "gl-left-panel";
    panel.className = "gl-left-panel";
    const mapContainer = _g$1.document.getElementById("geoleaf-map") || _g$1.document.querySelector(".gl-map");
    (mapContainer || _g$1.document.body).appendChild(panel);
    return panel;
}
function _populateLeftPanel(leftPanel) {
    DOMSecurity.clearElementFast(leftPanel);
    Object.keys(_baseLayers).forEach((key) => {
        const def = _baseLayers[key];
        const button = _g$1.document.createElement("button");
        button.className = "gl-baselayer-btn";
        button.setAttribute("data-gl-baselayer", key);
        button.setAttribute("aria-label", def.label || key);
        button.textContent = def.label || key;
        leftPanel.appendChild(button);
    });
    leftPanel.style.display = "flex";
    Log.info("[GeoLeaf.Baselayers] Controls created with", Object.keys(_baseLayers).length, "buttons");
}
function createBaseLayerControlsUI(config) {
    if (!_g$1.document)
        return;
    if (!config && _g$1.GeoLeaf?.Config?.get) {
        config = {
            ui: _g$1.GeoLeaf.Config.get("ui"),
            basemaps: _g$1.GeoLeaf.Config.get("basemaps") || {},
        };
    }
    const uiCfg = config?.ui;
    const showControls = _computeShowControls(uiCfg);
    Log.info("[GeoLeaf.Baselayers] showBaseLayerControls =", showControls, "(config.ui.showBaseLayerControls =", uiCfg?.showBaseLayerControls ?? "N/A", ")");
    let leftPanel = _g$1.document.getElementById("gl-left-panel");
    if (showControls) {
        if (!leftPanel) {
            leftPanel = _createLeftPanel();
        }
        _populateLeftPanel(leftPanel);
        setTimeout(refreshUI, 50);
    }
    else {
        leftPanel?.parentNode?.removeChild(leftPanel);
    }
}
// ---------------------------------------------------------
// Binding DOM (une seule fois)
// ---------------------------------------------------------
function bindUIOnce() {
    if (_uiBound || !_g$1.document)
        return;
    _uiBound = true;
    _g$1.document.addEventListener("click", (evt) => {
        const target = evt.target.closest("[data-gl-baselayer]");
        if (!target)
            return;
        const key = target.getAttribute("data-gl-baselayer");
        if (!key)
            return;
        evt.preventDefault();
        setBaseLayer(key);
        refreshUI();
    });
    let resizeTimeout;
    _resizeHandler = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(refreshUI, 100);
    };
    _g$1.addEventListener("resize", _resizeHandler);
}
// ---------------------------------------------------------
// Nettoyage
// ---------------------------------------------------------
function destroyUI() {
    if (_resizeHandler) {
        _g$1.removeEventListener("resize", _resizeHandler);
        _resizeHandler = null;
    }
    _uiBound = false;
}

/*!
 * GeoLeaf Core – Baselayers / Index (barl)
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
/**
 * Initialises the basemaps system: registers default layers, applies custom
 * layers from options, sets the active layer, and renders the basemap UI controls.
 *
 * @param options - Initialisation options.
 * @param options.map - Map instance (uses the global map if omitted).
 * @param options.baselayers - Map of layer key → basemap config objects.
 * @param options.activeKey - Key of the basemap to activate on init.
 * @returns An object with the active key and the full layers registry.
 */
function init(options) {
    options = options || {};
    if (options.map) {
        setMap(options.map);
    }
    else {
        ensureMap();
    }
    if (options.baselayers && typeof options.baselayers === "object") {
        registerBaseLayers(options.baselayers);
    }
    if (options.activeKey) {
        setBaseLayer(options.activeKey, { silent: true });
    }
    if (!getActiveKey()) {
        const keys = Object.keys(getBaseLayers());
        if (keys.length > 0) {
            setBaseLayer(keys[0], { silent: true });
        }
    }
    createBaseLayerControlsUI(options);
    bindUIOnce();
    refreshUI();
    return {
        activeKey: getActiveKey(),
        layers: getBaseLayers(),
    };
}
const Baselayers = {
    init,
    registerBaseLayer,
    registerBaseLayers,
    setBaseLayer,
    setActive: setBaseLayer,
    getBaseLayers,
    getActiveKey,
    getActiveId: getActiveKey,
    getActiveLayer,
    destroy: destroyUI,
};

/**
 * Module Basemap Selector pour LayerManager
 * Gestion du selector de base maps
 *
 * DEPENDENCIES:
 * - GeoLeaf.Log (optional)
 * - GeoLeaf.Baselayers (optional, pour getActiveId et setBaseLayer)
 *
 * EXPOSE:
 * - GeoLeaf._LayerManagerBasemapSelector
 */
const _LayerManagerBasemapSelector = {
    render(section, sectionEl) {
        if (!section || !sectionEl)
            return;
        const container = domCreate("div", "gl-layer-manager__items gl-layer-manager__basemap-select", sectionEl);
        const select = domCreate("select", "gl-layer-manager__basemap-select__select", container);
        if (Array.isArray(section.items)) {
            section.items.forEach((item) => {
                if (!item?.id)
                    return;
                const opt = document.createElement("option");
                opt.value = item.id;
                opt.textContent = item.label || item.id;
                select.appendChild(opt);
            });
        }
        try {
            const activeKey = Baselayers && typeof Baselayers.getActiveKey === "function"
                ? Baselayers.getActiveKey()
                : null;
            if (activeKey) {
                select.value = activeKey;
            }
        }
        catch {
            // ignore
        }
        this._attachChangeHandler(select);
        this._attachExternalListener(select);
    },
    _attachChangeHandler(select) {
        const handler = (ev) => {
            ev.stopPropagation();
            try {
                const val = select.value;
                if (Baselayers && typeof Baselayers.setBaseLayer === "function") {
                    Baselayers.setBaseLayer(val, {});
                }
            }
            catch (err) {
                if (Log)
                    Log.warn("Error during basemap change from legend:", err);
            }
        };
        select.addEventListener("change", handler);
    },
    _attachExternalListener(select) {
        if (typeof document !== "undefined") {
            if (this._externalHandler) {
                document.removeEventListener("geoleaf:basemap:change", this._externalHandler);
            }
            this._externalHandler = (e) => {
                try {
                    if (e?.detail?.key) {
                        select.value = e.detail.key;
                    }
                }
                catch {
                    // ignore
                }
            };
            document.addEventListener("geoleaf:basemap:change", this._externalHandler);
        }
    },
    destroy() {
        if (this._externalHandler) {
            document.removeEventListener("geoleaf:basemap:change", this._externalHandler);
            this._externalHandler = undefined;
        }
    },
};
const BasemapSelector = _LayerManagerBasemapSelector;

/**
 * GeoLeaf Contract — Legend (lazy-chunk boundary)
 *
 * Interface ESM pure pour access au module Legend from the modules core
 * sans couplage runtime — interface ESM pure.
 *
 * Phase 10-D — Pattern C : contrat de chunk Legend.
 *
 * USAGE :
 *   import { LegendContract } from '../../../contracts/legend.contract.js';
 *
 *   if (LegendContract.isAvailable()) {
 *       LegendContract.loadLayerLegend(layerId, styleId: any, layerConfig: any);
 *   }
 *
 * POURQUOI un contrat ?
 * Legend (geoleaf.legend.js) est une facade qui depends of the init runtime
 * (map + profile). Le contrat encapsule la garde d'initialization et fournit
 * un point d'input typed, sans exposer le namespace global.
 */
/**
 * Contrat d'interface pour the module Legend.
 * @namespace LegendContract
 */
const LegendContract = {
    /**
     * Returns true si Legend est initialized (carte loadede).
     * @returns {boolean}
     */
    isAvailable() {
        return !!Legend && typeof Legend.loadLayerLegend === "function";
    },
    /**
     * Loads and displays the legend for a layer with given styles.
     * @param {string} layerId
     * @param {string} styleId
     * @param {Object} layerConfig
     */
    loadLayerLegend(layerId, styleId, layerConfig) {
        if (typeof Legend.loadLayerLegend === "function") {
            Legend.loadLayerLegend(layerId, styleId, layerConfig);
        }
    },
    /**
     * Updates the visibility d'a layer dans the legend.
     * @param {string} layerId
     * @param {boolean} visible
     */
    setLayerVisibility(layerId, visible) {
        if (typeof Legend.setLayerVisibility === "function") {
            Legend.setLayerVisibility(layerId, visible);
        }
    },
};

/**
 * @module _LayerManagerStyleSelector
 * @description Selector de styles for the manager for layers.
 * @version 1.2.0
 */
const state = {
    currentStyles: new Map(),
};
function _applyStyleResult(layerData, layerId, styleId, res) {
    layerData.currentStyle = res.styleData;
    layerData.currentStyleMetadata = res.metadata;
    // Extract the nested `style` object from the style file JSON.
    // Style files have the shape { id, label, style: { fillColor, … }, styleRules: [...], legend }.
    // normalizeToFlat() is a shallow copy — passing the root object would leave
    // paint properties nested inside flat.style. We unwrap here so the adapter
    // receives a flat paint object directly, while preserving styleRules so that
    // applyLayerStyle() can rebuild MapLibre case-expressions for per-category colouring.
    const sd = res.styleData;
    const paintData = { ...(sd?.style ?? sd) };
    if (Array.isArray(sd?.styleRules)) {
        paintData.styleRules = sd.styleRules;
    }
    if (typeof GeoJSONCore.setLayerStyle === "function") {
        GeoJSONCore.setLayerStyle(layerId, paintData);
    }
    Labels?.initializeLayerLabels?.(layerId);
    if (LabelButtonManager)
        LabelButtonManager.syncImmediate(layerId);
    if (LegendContract.isAvailable()) {
        LegendContract.loadLayerLegend(layerData.config.id, styleId, layerData.config);
    }
}
function _resolveStyleConfig(layerId, styleId) {
    if (!GeoJSONCore)
        return null;
    const layerData = GeoJSONCore.getLayerData(layerId);
    if (!layerData)
        return null;
    if (!layerData.config.styles || !Array.isArray(layerData.config.styles.available))
        return null;
    const styleConfig = layerData.config.styles.available.find((s) => s.id === styleId);
    return styleConfig ? { layerData, styleConfig } : null;
}
const _LayerManagerStyleSelector = {
    getCurrentStyle(layerId) {
        return state.currentStyles.get(layerId) ?? null;
    },
    setCurrentStyle(layerId, styleId) {
        state.currentStyles.set(layerId, styleId);
    },
    renderDOM(item) {
        if (!item.styles ||
            !Array.isArray(item.styles.available) ||
            item.styles.available.length <= 1) {
            return null;
        }
        const currentStyle = this.getCurrentStyle(item.id) || item.styles.default || item.styles.available[0].id;
        const selectId = "style-selector-" + item.id;
        const container = document.createElement("div");
        container.className = "gl-layer-manager__style-selector";
        const select = document.createElement("select");
        select.id = selectId;
        select.className = "gl-layer-manager__style-select";
        select.setAttribute("data-layer-id", item.id);
        item.styles.available.forEach((style) => {
            const option = document.createElement("option");
            option.value = style.id;
            option.textContent = style.label ?? style.id;
            if (style.id === currentStyle) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        container.appendChild(select);
        return container;
    },
    bindEvents(container, item) {
        if (!item.styles ||
            !Array.isArray(item.styles.available) ||
            item.styles.available.length <= 1) {
            return;
        }
        const selectId = "style-selector-" + item.id;
        const select = container.querySelector("#" + selectId);
        if (!select)
            return;
        const self = this;
        select.addEventListener("change", function () {
            const styleId = this.value;
            const layerId = this.getAttribute("data-layer-id");
            if (layerId) {
                self.setCurrentStyle(layerId, styleId);
                self.applyStyle(layerId, styleId);
            }
        });
    },
    async applyStyle(layerId, styleId) {
        const resolved = _resolveStyleConfig(layerId, styleId);
        if (!resolved)
            return;
        const { layerData, styleConfig } = resolved;
        try {
            if (!StyleLoader) {
                this._applyStyleLegacy(layerId, styleId, layerData, styleConfig);
                return;
            }
            const profileId = layerData.config._profileId;
            const layerDirectory = layerData.config._layerDirectory;
            if (!profileId || !layerDirectory)
                return;
            const result = await StyleLoader.loadAndValidateStyle(profileId, layerId, styleId, styleConfig.file ?? "", layerDirectory);
            _applyStyleResult(layerData, layerId, styleId, result);
        }
        catch (_error) {
            // log removed
        }
    },
    _applyStyleLegacy(layerId, styleId, layerData, styleConfig) {
        const profileId = layerData.config._profileId;
        const layerDirectory = layerData.config._layerDirectory;
        if (!profileId || !layerDirectory)
            return;
        const dataCfg = Config.get?.("data");
        const profilesBasePath = dataCfg?.profilesBasePath ?? "profiles";
        const styleDirectory = layerData.config.styles.directory ?? "styles";
        const stylePath = profilesBasePath +
            "/" +
            profileId +
            "/" +
            layerDirectory +
            "/" +
            styleDirectory +
            "/" +
            (styleConfig.file ?? "");
        fetch(stylePath)
            .then((response) => {
            if (!response.ok)
                throw new Error("Erreur HTTP " + response.status);
            return response.json();
        })
            .then((styleData) => {
            // Same unwrapping as in _applyStyleResult: extract the nested `style`
            // flat-paint object, preserving styleRules for per-category colouring.
            const sdRaw = styleData;
            const paintData = { ...(sdRaw?.style ?? sdRaw) };
            if (Array.isArray(sdRaw?.styleRules)) {
                paintData.styleRules = sdRaw.styleRules;
            }
            if (typeof GeoJSONCore.setLayerStyle === "function") {
                GeoJSONCore.setLayerStyle(layerId, paintData);
            }
            if (LegendContract.isAvailable()) {
                LegendContract.loadLayerLegend(layerData.config.id, styleId, layerData.config);
            }
        })
            .catch(() => { });
    },
};
const StyleSelector = _LayerManagerStyleSelector;

/**
 * LayerManager — Visibility Checker
 * Validates the visibility state logical d'a layer.
 *
 * Extrait de layer-manager/renderer.ts (split Sprint 1 roadmap).
 *
 * @module geoleaf.layer-manager.visibility-checker
 */
/**
 * Checks if a layer est visible.
 * Utilise logicalState (state du button ON/OFF) au lieu de current (state physical sur carte).
 * The button must reflect the user/theme intent, not zoom constraints.
 */
function checkLayerVisibility(layerId) {
    try {
        if (layerId && GeoJSONCore) {
            const layerData = GeoJSONCore.getLayerById(layerId);
            const logicalState = layerData &&
                layerData._visibility &&
                typeof layerData._visibility.logicalState === "boolean"
                ? layerData._visibility.logicalState
                : layerData && layerData.visible === true;
            const result = logicalState;
            if (Log) {
                Log.debug(`[LayerManager Renderer] _checkLayerVisibility(${layerId}): logicalState=${logicalState}`);
            }
            return result;
        }
    }
    catch (e) {
        if (Log)
            Log.error("[LayerManager Renderer] Error in _checkLayerVisibility:", e);
    }
    return false;
}

/**
 * GeoLeaf LayerManager — Pure Helper Functions
 * Extracted from layer-manager-api.ts — Sprint 1 refactoring.
 * Contains stateless helpers used during LayerManager initialization.
 *
 * @module layer-manager/layer-manager-helpers
 */
/**
 * Merges a layerManagerConfig object into the module options.
 * Adds/updates sections based on configuration, sorted by order.
 * @internal
 */
function _applyLayerManagerConfig(lmConfig, options) {
    if (lmConfig.title)
        options.title = lmConfig.title;
    if (typeof lmConfig.collapsedByDefault === "boolean")
        options.collapsed = lmConfig.collapsedByDefault;
    if (!(Array.isArray(lmConfig.sections) && lmConfig.sections.length > 0))
        return;
    const configSections = lmConfig.sections
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((s) => ({
        id: s.id,
        label: s.label,
        order: s.order,
        collapsedByDefault: s.collapsedByDefault,
        items: [],
    }));
    if (!Array.isArray(options.sections))
        options.sections = [];
    configSections.forEach((configSection) => {
        const existingSection = options.sections.find((s) => s.id === configSection.id);
        if (!existingSection) {
            options.sections.push(configSection);
        }
        else if (configSection.label && !existingSection.label) {
            existingSection.label = configSection.label;
        }
    });
    options.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
    Log?.info("[GeoLeaf.LayerManager] Sections merged with layerManagerConfig");
}
/**
 * Resolves the current basemap definitions from Baselayers or Config.
 * @internal
 */
function _resolveBasemapDefs(g) {
    if (g.GeoLeaf?.Baselayers && typeof g.GeoLeaf.Baselayers.getBaseLayers === "function") {
        return g.GeoLeaf.Baselayers.getBaseLayers() || {};
    }
    if (g.GeoLeaf.Config && typeof g.GeoLeaf.Config.get === "function") {
        return g.GeoLeaf.Config.get("basemaps") || {};
    }
    return null;
}
/**
 * Builds the auto-populated basemap section items from the basemap definitions.
 * @internal
 */
function _buildAutoBasemapSections(g) {
    const defs = _resolveBasemapDefs(g);
    if (!defs || Object.keys(defs).length === 0)
        return [];
    const baseItems = Object.keys(defs).map((k) => ({ id: k, label: (defs[k] || {}).label || k }));
    return baseItems.length ? [{ id: "basemap", label: "Fond de carte", items: baseItems }] : [];
}
/**
 * Creates a layer entry descriptor for the layer manager.
 * @internal
 */
function _createLayerEntry(layerId, options) {
    return {
        id: layerId,
        label: options.label || layerId,
        toggleable: true,
        themes: options.themes || null,
        styles: options.styles || null,
        labels: options.labels || null,
    };
}
/**
 * Merges a new item into an existing section's items array (upsert by id).
 * @internal
 */
function _mergeItem(existing, newItem) {
    const idx = existing.items.findIndex((i) => i.id === newItem.id);
    if (idx !== -1) {
        existing.items[idx] = Object.assign({}, existing.items[idx], newItem);
    }
    else {
        existing.items.push(newItem);
    }
}
/**
 * Merges a section descriptor into an existing section (items, label, order, collapsedByDefault).
 * @internal
 */
function _mergeSection(existing, section) {
    if (Array.isArray(section.items)) {
        if (!Array.isArray(existing.items))
            existing.items = [];
        section.items.forEach((item) => _mergeItem(existing, item));
        existing.items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    if (section.label)
        existing.label = section.label;
    if (section.order !== undefined)
        existing.order = section.order;
    if (section.collapsedByDefault !== undefined)
        existing.collapsedByDefault = section.collapsedByDefault;
}
/**
 * Resolves the map instance from options or GeoLeaf.Core.
 * @internal
 */
function _resolveMap(options, g) {
    let map = options.map || null;
    if (!map && g.GeoLeaf.Core && typeof g.GeoLeaf.Core.getMap === "function") {
        map = g.GeoLeaf.Core.getMap();
    }
    return map;
}

/**

 * GeoLeaf LayerManager API (assemblage namespace LayerManager)

 * @module layer-manager/layer-manager-api

 */
/*!

 * GeoLeaf Core

 * Â© 2026 Mattieu Pottier

 * Released under the MIT License

 * https://geoleaf.dev

 */
const _g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g.GeoLeaf = _g.GeoLeaf || {};
/**

 * Namespace global GeoLeaf

 */
/**

 * Logger unified

 */
/**

 * Module GeoLeaf.LayerManager (REFACTORED v1.0)

 *

 * ARCHITECTURE MODULAIRE :

 * - layer-manager/shared.js : Shared state

 * - layer-manager/control.js : Control

 * - layer-manager/renderer.js : Rendu des sections et items

 * - layer-manager/basemap-selector.js : Selector de base maps

 * - layer-manager/theme-selector.js : Selector de themes

 * - geoleaf.layer-manager.js (this file): Public aggregator/facade

 *

 * REQUIRED DEPENDENCIES (loadedes avant ce module) :

 * - layer-manager/shared.js â†’ GeoLeaf._LayerManagerShared

 * - layer-manager/renderer.js â†’ GeoLeaf._LayerManagerRenderer

 * - layer-manager/basemap-selector.js â†’ GeoLeaf._LayerManagerBasemapSelector

 * - layer-manager/theme-selector.js â†’ GeoLeaf._LayerManagerThemeSelector

 * - layer-manager/control.js â†’ GeoLeaf._LayerManagerControl

 *

 * Role :

 * - Createsr un controle de manager for layers pour GeoLeaf

 * - Displays structured sections (basemaps, layers, categories)

 * - Handle un mode collapsible (collapsible)

 * - Preparation for integration with the Legend module (Phase 6)

 */
const LayerManagerModule = {
    /**

     * Reference to the map

     * @type {unknown}

     * @private

     */
    _map: null,
    /**

     * Reference to the legend control

     * @type {unknown}

     * @private

     */
    _control: null,
    /**

     * Timeout for the debounce du refresh

     * @type {number|null}

     * @private

     */
    _refreshTimeout: null,
    /**

     * Options internals of the module

     * @type {Object}

     * @private

     */
    _options: {
        position: "bottomright",
        title: "Gestionnaire de layers",
        collapsible: true,
        collapsed: false,
        sections: [],
    },
    /**

     * Initialization of the module LayerManager

     *

     * @param {Object} options

     * @param {unknown} [options.map] - Map (si absent, tentative via GeoLeaf.Core.getMap())

     * @param {string} [options.position]

     * @param {string} [options.title]

     * @param {boolean} [options.collapsible]

     * @param {boolean} [options.collapsed]

     * @param {Array} [options.sections]

     * @returns {unknown} - The control LayerManager ou null

     */
    init(options = {}) {
        const map = _resolveMap(options, _g);
        if (!map) {
            Log?.error("[GeoLeaf.LayerManager] No map instance available. Pass one via init({ map }).");
            return null;
        }
        this._map = map;
        Log?.info("[GeoLeaf.LayerManager] init: map assigned");
        this._options = this._mergeOptions(this._options, options);
        // Loadsr les sections from theyerManagerConfig si availables
        this._loadConfigSections();
        // Remplir automaticment la section basemap
        this._autoPopulateBasemap();
        // Autofill minimum si aucune section
        this._autoPopulateSections();
        // Createsr the control via le sous-module
        if (!_g.GeoLeaf._LayerManagerControl) {
            Log?.error("[GeoLeaf.LayerManager] Module _LayerManagerControl not loaded");
            return null;
        }
        this._control = _g.GeoLeaf._LayerManagerControl.create(this._options);
        if (!this._control) {
            Log?.error("[GeoLeaf.LayerManager] Failed to create control");
            return null;
        }
        this._control.addTo(this._map);
        Log?.info("[GeoLeaf.LayerManager] Control created and added to map");
        return this._control;
    },
    /**

     * Loads thes sections from the configuration

     * @private

     */
    _loadConfigSections() {
        if (!(_g.GeoLeaf.Config && typeof _g.GeoLeaf.Config.get === "function"))
            return;
        const layerManagerConfig = _g.GeoLeaf.Config.get("layerManagerConfig");
        if (_g.GeoLeaf.Log)
            _g.GeoLeaf.Log.debug("[LayerManager] Configuration loaded:", {
                title: layerManagerConfig?.title,
                collapsed: layerManagerConfig?.collapsedByDefault,
                sectionsCount: layerManagerConfig?.sections?.length || 0,
            });
        if (layerManagerConfig)
            _applyLayerManagerConfig(layerManagerConfig, this._options);
    },
    /**

     * Remplit automaticment la section basemap

     * @private

     */
    _autoPopulateBasemap() {
        if (!Array.isArray(this._options.sections))
            return;
        const basemapSection = this._options.sections.find((s) => s.id === "basemap");
        if (basemapSection && (!basemapSection.items || basemapSection.items.length === 0)) {
            try {
                const basemapDefs = _resolveBasemapDefs(_g);
                if (basemapDefs && Object.keys(basemapDefs).length > 0) {
                    basemapSection.items = Object.keys(basemapDefs).map((k) => {
                        const d = basemapDefs[k] || {};
                        return { id: d.id || k, label: d.label || k };
                    });
                    Log?.info("[GeoLeaf.LayerManager] Section basemap remplie automatically");
                }
            }
            catch (e) {
                Log?.warn("[GeoLeaf.LayerManager] Erreur lors du remplissage automatic des basemaps:", e);
            }
        }
    },
    /**

     * Autofill minimum des sections

     * @private

     */
    _autoPopulateSections() {
        if (Array.isArray(this._options.sections) && this._options.sections.length > 0)
            return;
        let autoSections = [];
        try {
            autoSections = _buildAutoBasemapSections(_g);
        }
        catch (_e) {
            // ignore
        }
        if (autoSections.length) {
            this._options.sections = autoSections;
            Log?.info("[GeoLeaf.LayerManager] auto-populated sections from Baselayers");
        }
        else {
            Log?.warn("[GeoLeaf.LayerManager] Aucune section fournie et autoremplissage impossible.");
        }
    },
    /**

     * Registers ae GeoJSON layer dans the legend

     * @param {string} layerId - ID de the layer

     * @param {Object} options - Options de the layer

     */
    _registerGeoJsonLayer(layerId, options = {}) {
        // ...log deleted ([LayerManager] _registerGeoJsonLayer called pour)...
        if (!this._options.sections) {
            this._options.sections = [];
        }
        // Utiliser layerManagerId ou legendSection (backward compatibility)
        const sectionId = options.layerManagerId || options.legendSection || "geojson-default";
        let section = this._options.sections.find((s) => s.id === sectionId);
        if (!section) {
            section = {
                id: sectionId,
                label: options.legendSectionLabel || "Couches GeoJSON",
                order: 10,
                items: [],
            };
            this._options.sections.push(section);
            this._options.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        const existingItem = section.items.find((item) => item.id === layerId);
        if (!existingItem) {
            section.items.push(_createLayerEntry(layerId, options));
            this._updateContent();
            Log?.debug(`[LayerManager] Layer "${layerId}" registered in section "${sectionId}"`);
        }
    },
    /**

     * Unregisters a GeoJSON layer from the legend

     * @param {string} layerId - ID de the layer

     */
    _unregisterGeoJsonLayer(layerId) {
        if (!Array.isArray(this._options.sections))
            return;
        this._options.sections.forEach((section) => {
            if (Array.isArray(section.items)) {
                section.items = section.items.filter((item) => item.id !== layerId);
            }
        });
        this._options.sections = this._options.sections.filter((section) => section.id === "basemap" ||
            (Array.isArray(section.items) && section.items.length > 0));
        this._updateContent();
        if (Log)
            Log.debug(`[LayerManager] Layer "${layerId}" unregistered`);
    },
    /**

     * Updates thes sections de the legend

     * @param {Array} sections - Nouvelles sections

     */
    updateSections(sections) {
        if (!Array.isArray(sections)) {
            if (Log)
                Log.warn("[GeoLeaf.LayerManager] updateSections: sections must be an array");
            return;
        }
        this._options.sections = sections;
        this._updateContent();
    },
    /**

     * Adds ou met up to date une section dans the legend

     * @param {Object} section - Section to add {id, label, order, items}

     */
    addSection(section) {
        if (!section || !section.id) {
            Log?.warn("[GeoLeaf.LayerManager] addSection: invalid section (missing id)");
            return;
        }
        if (!Array.isArray(this._options.sections)) {
            this._options.sections = [];
        }
        // Chercher une section existing with the same id
        const existingIndex = this._options.sections.findIndex((s) => s.id === section.id);
        if (existingIndex !== -1) {
            _mergeSection(this._options.sections[existingIndex], section);
        }
        else {
            // Addsr la nouvelle section
            this._options.sections.push({
                id: section.id,
                label: section.label || section.id,
                order: section.order || 99,
                collapsedByDefault: section.collapsedByDefault || false,
                items: section.items || [],
            });
            // Trier les sections par order
            this._options.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        this._updateContent();
        Log?.debug(`[LayerManager] Section "${section.id}" added/updated`);
    },
    /**

     * Switches the collapsed/expanded state of the legend

     */
    toggleCollapse() {
        this._options.collapsed = !this._options.collapsed;
        if (!this._control)
            return;
        if (this._options.collapsed) {
            this._control._container.classList.add("gl-layer-manager--collapsed");
        }
        else {
            this._control._container.classList.remove("gl-layer-manager--collapsed");
        }
    },
    /**

     * Returns whether the legend is collapsed

     * @returns {boolean}

     */
    isCollapsed() {
        return !!this._options.collapsed;
    },
    /**

     * Force le re-rendu du contenu

     * @private

     */
    _updateContent() {
        if (!this._control || typeof this._control.updateSections !== "function") {
            return;
        }
        this._control.updateSections(this._options.sections || []);
    },
    /**

     * Refreshes l'display du LayerManager

     * Used in particular after applying a theme to update toggle button states

     * Version debounced pour groupr les appels multiples (ex: plusieurs layers changent de visibility au zoom)

     * @public

     * @param {boolean} [immediate=false] - Si true, force le refresh immediate sans debounce

     */
    refresh(immediate = false) {
        if (!this._control || typeof this._control.refresh !== "function") {
            if (Log)
                Log.debug("[LayerManager] refresh(): control not yet initialized (early boot, skipping)");
            return;
        }
        // If immediate refresh requested, cancel debounce and execute
        if (immediate) {
            if (this._refreshTimeout) {
                clearTimeout(this._refreshTimeout);
                this._refreshTimeout = null;
            }
            this._control.refresh();
            if (Log)
                Log.debug("[LayerManager] Display refreshed (immediate)");
            return;
        }
        // Debounce: cancel le timeout previous et programmer un nouveau refresh
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
        }
        this._refreshTimeout = setTimeout(() => {
            this._refreshTimeout = null;
            this._control.refresh();
            if (Log)
                Log.debug("[LayerManager] Display refreshed (debounced)");
        }, 250);
    },
    /**

     * Fusion d'options (shallow + fusion lightweight pour sous-objects)

     * @param {Object} base

     * @param {Object} override

     * @returns {Object}

     * @private

     */
    _mergeOptions(base, override) {
        const result = Object.assign({}, base || {});
        if (!override)
            return result;
        Object.keys(override).forEach((key) => {
            const value = override[key];
            if (value &&
                typeof value === "object" &&
                !Array.isArray(value) &&
                base &&
                typeof base[key] === "object" &&
                !Array.isArray(base[key])) {
                result[key] = Object.assign({}, base[key], value);
            }
            else {
                result[key] = value;
            }
        });
        return result;
    },
};
const LayerManager = LayerManagerModule;

/**
 * LayerManager — Toggle Handler
 * Gestion du click sur le button toggle d'a layer (show/hide, lazy-load, label-btn sync).
 *
 * Extrait de layer-manager/renderer.ts (split Sprint 1 roadmap).
 *
 * @module geoleaf.layer-manager.toggle-handler
 */
function _stopEventPropagation(ev) {
    ev.stopPropagation();
    ev.preventDefault();
}
function _findLabelBtn(layerItem, toggleBtn) {
    if (layerItem) {
        const btn = layerItem.querySelector(".gl-layer-manager__label-toggle");
        if (btn)
            return btn;
    }
    if (toggleBtn.parentElement) {
        return toggleBtn.parentElement.querySelector(".gl-layer-manager__label-toggle");
    }
    return null;
}
function _enableLabelBtnIfApplicable(labelBtn, itemId) {
    const ld = GeoJSONCore && GeoJSONCore.getLayerById
        ? GeoJSONCore.getLayerById(itemId)
        : null;
    if (!ld)
        return;
    const labelEnabled = ld.currentStyle && ld.currentStyle.label && ld.currentStyle.label.enabled === true;
    if (!labelEnabled)
        return;
    labelBtn.disabled = false;
    labelBtn.classList.remove("gl-layer-manager__label-toggle--disabled");
}
function _handleLayerHide(toggleBtn, layerItem, itemId) {
    GeoJSONCore.hideLayer(itemId);
    toggleBtn.setAttribute("aria-pressed", "false");
    toggleBtn.classList.remove("gl-layer-manager__item-toggle--on");
    if (layerItem)
        layerItem.classList.add("gl-layer--hidden");
    const labelBtn = _findLabelBtn(layerItem, toggleBtn);
    if (labelBtn) {
        labelBtn.disabled = true;
        labelBtn.classList.add("gl-layer-manager__label-toggle--disabled");
        labelBtn.classList.remove("gl-layer-manager__label-toggle--on");
        labelBtn.setAttribute("aria-pressed", "false");
    }
    else {
        if (Log)
            Log.warn("[LayerManager] Label button NOT FOUND for deactivation:", itemId);
    }
}
function _handleLayerShow(toggleBtn, layerItem, itemId) {
    GeoJSONCore.showLayer(itemId);
    toggleBtn.setAttribute("aria-pressed", "true");
    toggleBtn.classList.add("gl-layer-manager__item-toggle--on");
    if (layerItem)
        layerItem.classList.remove("gl-layer--hidden");
    const labelBtn = _findLabelBtn(layerItem, toggleBtn);
    if (labelBtn) {
        _enableLabelBtnIfApplicable(labelBtn, itemId);
    }
}
function _afterLazyLoadSuccess(toggleBtn, itemId, loadedLayer) {
    toggleBtn.classList.remove("gl-layer-manager__item-toggle--loading");
    toggleBtn.disabled = false;
    if (!loadedLayer) {
        if (Log)
            Log.warn("[LayerManager] Layer loading failed:", itemId);
        return;
    }
    if (Log)
        Log.info("[LayerManager] Layer loaded successfully:", itemId);
    GeoJSONCore.showLayer(itemId);
    toggleBtn.setAttribute("aria-pressed", "true");
    toggleBtn.classList.add("gl-layer-manager__item-toggle--on");
    const layerItem = document.querySelector('[data-layer-id="' + itemId + '"]');
    if (layerItem)
        layerItem.classList.remove("gl-layer--hidden");
    const labelBtn = _findLabelBtn(layerItem, toggleBtn);
    if (labelBtn)
        _enableLabelBtnIfApplicable(labelBtn, itemId);
}
function _handleLazyLoad(toggleBtn, itemId) {
    if (Log)
        Log.info("[LayerManager] Layer not loaded, loading on demand:", itemId);
    toggleBtn.classList.add("gl-layer-manager__item-toggle--loading");
    toggleBtn.disabled = true;
    const loader = _ThemeApplier && typeof _ThemeApplier._loadLayerFromProfile === "function"
        ? _ThemeApplier._loadLayerFromProfile
        : null;
    if (!loader) {
        toggleBtn.classList.remove("gl-layer-manager__item-toggle--loading");
        toggleBtn.disabled = false;
        if (Log)
            Log.warn("[LayerManager] ThemeApplierCore not available for loading:", itemId);
        return;
    }
    loader
        .call(_ThemeApplier, itemId)
        .then((loadedLayer) => {
        _afterLazyLoadSuccess(toggleBtn, itemId, loadedLayer);
    })
        .catch((err) => {
        toggleBtn.classList.remove("gl-layer-manager__item-toggle--loading");
        toggleBtn.disabled = false;
        if (Log)
            Log.error("[LayerManager] Error loading layer:", itemId, err);
    });
}
/**
 * Attache le manager for toggle pour a layer.
 * @param toggleBtn - Le button HTML
 * @param itemId - The identifier de the layer
 * @param checkVisibility - Callback injected pour verify la visibility (avoids dependency circulaire)
 */
function attachToggleHandler(toggleBtn, itemId, checkVisibility) {
    // GUARD: Check si un manager est already attached
    if (toggleBtn._toggleHandlerAttached) {
        return;
    }
    // Marquer comme attached AVANT de create le manager
    toggleBtn._toggleHandlerAttached = true;
    const onToggle = function (ev) {
        if (toggleBtn._isToggling) {
            if (Log)
                Log.warn("[LayerManager] Toggle already in progress, blocked:", itemId);
            _stopEventPropagation(ev);
            return;
        }
        toggleBtn._isToggling = true;
        _stopEventPropagation(ev);
        setTimeout(() => {
            toggleBtn._isToggling = false;
        }, 100);
        try {
            if (!itemId || !GeoJSONCore)
                return;
            const layerData = GeoJSONCore.getLayerById(itemId);
            if (!layerData) {
                _handleLazyLoad(toggleBtn, itemId);
                return;
            }
            const isCurrentlyVisible = checkVisibility(itemId);
            const layerItem = document.querySelector(`[data-layer-id="${itemId}"]`);
            if (isCurrentlyVisible) {
                _handleLayerHide(toggleBtn, layerItem, itemId);
            }
            else {
                _handleLayerShow(toggleBtn, layerItem, itemId);
            }
        }
        catch (err) {
            if (Log)
                Log.warn("Legend toggle error :", err);
        }
    };
    toggleBtn.addEventListener("click", onToggle);
}

/**
 * LayerManager — Item Controls
 * Rendu des items of a section et de leurs controles (toggle, label, style-selector).
 *
 * Extrait de layer-manager/renderer.ts (split Sprint 1 roadmap).
 *
 * @module geoleaf.layer-manager.item-controls
 */
/**
 * Rend les items of a section in the DOM.
 */
function renderItems(section, sectionEl) {
    const listEl = domCreate("div", "gl-layer-manager__items", sectionEl);
    section.items.forEach((item) => {
        const itemEl = domCreate("div", "gl-layer-manager__item", listEl);
        // Addsr l'attribut data-layer-id pour faciliter la recherche DOM
        if (item.id) {
            itemEl.setAttribute("data-layer-id", item.id);
            // Addsr la class gl-layer--hidden si the layer n'est pas visible au loading
            const isVisible = checkLayerVisibility(item.id);
            if (!isVisible) {
                itemEl.classList.add("gl-layer--hidden");
            }
        }
        // Conteneur de la line maine (always created for the layout en column)
        const mainRow = domCreate("div", "gl-layer-manager__item-row", itemEl);
        // Label
        const labelEl = domCreate("span", "gl-layer-manager__label", mainRow);
        labelEl.textContent = item.label || "";
        // Toggle d'display pour the layers toggleable
        if (item.toggleable && item.id) {
            renderToggleControls(item, mainRow, itemEl);
        }
        else if (item.id) {
            // Same pour the layers non-toggleable, create le button label
            const controlsContainer = domCreate("div", "gl-layer-manager__item-controls", mainRow);
            // Createsr le button de label
            if (LabelButtonManager) {
                LabelButtonManager.createButton(item.id, controlsContainer);
                LabelButtonManager.syncImmediate(item.id);
            }
        }
        else {
            // Value/info complementary pour items sans ID
            if (typeof item.value !== "undefined") {
                const valueEl = domCreate("span", "gl-layer-manager__value", itemEl);
                valueEl.textContent = String(item.value);
            }
        }
    });
}
/**
 * Rend les controles toggle for a item (button label + button toggle + style selector).
 */
function renderToggleControls(item, mainRow, itemEl) {
    // L.DomUtil guard removed (Sprint 9 — MapLibre only)
    const controlsContainer = domCreate("div", "gl-layer-manager__item-controls", mainRow);
    // Createsr le button de label via le centralized manager
    if (LabelButtonManager && item.id) {
        LabelButtonManager.createButton(item.id, controlsContainer);
        LabelButtonManager.syncImmediate(item.id);
    }
    // Check the state initial
    const isActive = checkLayerVisibility(item.id);
    const toggleBtn = _UIComponents.createToggleButton(controlsContainer, {
        isActive: isActive,
        className: "gl-layer-manager__item-toggle",
        title: getLabel("aria.layer.toggle"),
    });
    // Attacher le manager for toggle (checkLayerVisibility injected comme callback)
    attachToggleHandler(toggleBtn, item.id, checkLayerVisibility);
    // Selector de styles si available
    if (item.styles && StyleSelector && item.id) {
        const styleElement = StyleSelector.renderDOM(item);
        if (styleElement) {
            itemEl.appendChild(styleElement);
            StyleSelector.bindEvents(styleElement, item);
        }
    }
}
/**
 * Fallback pour create un toggle button si _UIComponents non available.
 */
function createToggleFallback(container, isActive) {
    const toggleBtn = domCreate("button", "gl-layer-manager__item-toggle", container);
    toggleBtn.type = "button";
    toggleBtn.setAttribute("aria-pressed", isActive ? "true" : "false");
    toggleBtn.title = getLabel("aria.layer.toggle");
    if (isActive) {
        toggleBtn.classList.add("gl-layer-manager__item-toggle--on");
    }
    return toggleBtn;
}

/**
 * LayerManager — Section Renderer
 * Generation DOM des sections de the legend (accordions, titles, delegation basemap/items).
 *
 * Extrait de layer-manager/renderer.ts (split Sprint 1 roadmap).
 *
 * @module geoleaf.layer-manager.section-renderer
 */
function _buildAccordionHeader(section, sectionEl) {
    const accordionHeader = domCreate("div", "gl-layer-manager__accordion-header", sectionEl);
    const sectionTitle = domCreate("div", "gl-layer-manager__section-title", accordionHeader);
    sectionTitle.textContent = section.label;
    const accordionArrow = domCreate("span", "gl-layer-manager__accordion-arrow", accordionHeader);
    accordionArrow.textContent = "▶";
    accordionHeader.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        const wasCollapsed = sectionEl.classList.contains("gl-layer-manager__section--collapsed");
        sectionEl.classList.toggle("gl-layer-manager__section--collapsed");
        accordionArrow.textContent = wasCollapsed ? "▼" : "▶";
        section._isExpanded = wasCollapsed;
        if (Log)
            Log.debug("[LayerManager] Accordion", section.id, wasCollapsed ? "opened" : "closed");
    });
}
function _renderSectionEl(section, bodyEl) {
    const isCollapsible = typeof section.collapsedByDefault === "boolean";
    const isCollapsed = section.collapsedByDefault === true;
    const sectionEl = domCreate("div", isCollapsible
        ? "gl-layer-manager__section gl-layer-manager__section--accordion"
        : "gl-layer-manager__section", bodyEl);
    if (isCollapsed)
        sectionEl.classList.add("gl-layer-manager__section--collapsed");
    if (section.label) {
        if (isCollapsible)
            _buildAccordionHeader(section, sectionEl);
        else {
            const sectionTitle = domCreate("div", "gl-layer-manager__section-title", sectionEl);
            sectionTitle.textContent = section.label;
        }
    }
    if (!Array.isArray(section.items) || section.items.length === 0)
        return;
    const sectionBody = isCollapsible
        ? domCreate("div", "gl-layer-manager__accordion-body", sectionEl)
        : sectionEl;
    if (section.id === "basemap") {
        if (BasemapSelector)
            BasemapSelector.render(section, sectionBody);
    }
    else {
        renderItems(section, sectionBody);
    }
}
/**
 * Generates the DOM pour l'set des sections de the legend.
 */
function renderSections(bodyEl, sections) {
    if (!bodyEl)
        return;
    DOMSecurity.clearElementFast(bodyEl);
    if (!Array.isArray(sections) || sections.length === 0) {
        const emptyEl = domCreate("div", "gl-layer-manager__empty", bodyEl);
        emptyEl.textContent = getLabel("ui.layer_manager.empty");
        return;
    }
    sections
        .filter((s) => s.id !== "poi" && s.id !== "route")
        .forEach((section) => _renderSectionEl(section, bodyEl));
    if (LabelButtonManager && GeoJSONCore) {
        const allLayers = GeoJSONCore._layers || new Map();
        allLayers.forEach((layerData, layerId) => {
            if (layerData.currentStyle)
                LabelButtonManager.syncImmediate(layerId);
        });
    }
}

/**
 * Module Renderer pour LayerManager — Orchestrateur
 * Delegates aux sous-modules specialized (split Sprint 1 roadmap).
 *
 * Sous-modules:
 * - visibility-checker.ts : _checkLayerVisibility
 * - toggle-handler.ts     : _attachToggleHandler
 * - item-controls.ts      : _renderItems, _renderToggleControls, _createToggleFallback, interfaces
 * - section-renderer.ts   : renderSections
 *
 * EXPOSE:
 * - LMRenderer (object)
 * - LMSection, LMItem (re-export interfaces pour compatibility control.ts)
 */
const _LayerManagerRenderer = {
    renderSections(bodyEl, sections) {
        renderSections(bodyEl, sections);
    },
    /**
     * Synchronise the state des toggles existings sans re-generate le DOM.
     * Used after applying a theme to update the toggles.
     * @public
     */
    syncToggles() {
        // Trouver tous les items de layer in the DOM
        const layerItems = document.querySelectorAll("[data-layer-id]");
        if (Log)
            Log.debug(`[LayerManager Renderer] Synchronizing ${layerItems.length} toggles`);
        layerItems.forEach((itemEl) => {
            const layerId = itemEl.getAttribute("data-layer-id");
            if (!layerId)
                return;
            // Retrieve les infos de visibility for the log
            const layerData = GeoJSONCore?.getLayerById(layerId);
            const isVisible = checkLayerVisibility(layerId);
            if (Log)
                Log.debug(`[LayerManager Renderer] Layer ${layerId}:`, {
                    isVisible,
                    hasLayerData: !!layerData,
                    hasVisibility: !!(layerData && layerData._visibility),
                    currentValue: layerData?._visibility?.current,
                    onMap: layerData?.layer &&
                        GeoJSONShared.state.map
                        ? GeoJSONShared.state.map.hasLayer(layerData.layer)
                        : false,
                });
            // Mettre up to date la class gl-layer--hidden
            if (isVisible) {
                itemEl.classList.remove("gl-layer--hidden");
            }
            else {
                itemEl.classList.add("gl-layer--hidden");
            }
            // Trouver et update le toggle button
            const toggleBtn = itemEl.querySelector(".gl-layer-manager__item-toggle");
            if (toggleBtn) {
                toggleBtn.setAttribute("aria-pressed", isVisible ? "true" : "false");
                const onClass = "gl-layer-manager__item-toggle--on";
                if (isVisible) {
                    toggleBtn.classList.add(onClass);
                }
                else {
                    toggleBtn.classList.remove(onClass);
                }
            }
        });
        if (Log)
            Log.debug("[LayerManager Renderer] Toggle states synchronized");
    },
    _renderItems(section, sectionEl) {
        renderItems(section, sectionEl);
    },
    _renderToggleControls(item, mainRow, itemEl) {
        renderToggleControls(item, mainRow, itemEl);
    },
    _checkLayerVisibility(layerId) {
        return checkLayerVisibility(layerId);
    },
    _attachToggleHandler(toggleBtn, itemId) {
        attachToggleHandler(toggleBtn, itemId, checkLayerVisibility);
    },
    _createToggleFallback(container, isActive) {
        return createToggleFallback(container, isActive);
    },
};
const LMRenderer = _LayerManagerRenderer;

/**
 * Module Control for LayerManager
 * Adapter-agnostic custom control for the layer manager panel.
 *
 * DEPENDENCIES:
 * - GeoLeaf.Log (optional)
 * - GeoLeaf._LayerManagerRenderer (for renderSections)
 *
 * EXPOSE:
 * - GeoLeaf._LayerManagerControl
 */
function _buildLMHeader(opts, mainWrapper) {
    const headerWrapper = domCreate("div", "gl-layer-manager__header-wrapper", mainWrapper);
    const header = domCreate("div", "gl-layer-manager__header", headerWrapper);
    const titleEl = domCreate("div", "gl-layer-manager__title", header);
    titleEl.textContent = opts.title || "Legend";
    return header;
}
function _buildLMCollapsibleToggle(header, self) {
    const toggleEl = domCreate("button", "gl-layer-manager__toggle", header);
    toggleEl.type = "button";
    toggleEl.setAttribute("aria-label", getLabel("aria.legend.toggle"));
    toggleEl.textContent = "\u27F1";
    toggleEl.addEventListener("click", (ev) => {
        ev.stopPropagation();
        self._toggleCollapsed();
    });
    self._cleanups.push(() => {
        toggleEl.replaceWith(toggleEl.cloneNode(true));
    });
}
function _buildLMBody(instance, opts, mainWrapper) {
    const bodyWrapper = domCreate("div", "gl-layer-manager__body-wrapper", mainWrapper);
    instance._bodyEl = domCreate("div", "gl-layer-manager__body", bodyWrapper);
    const initialCollapsed = opts.collapsed ?? opts.collapsedByDefault ?? false;
    if (initialCollapsed) {
        instance._container.classList.add("gl-layer-manager--collapsed");
        opts.collapsed = true;
    }
    if (LMRenderer)
        LMRenderer.renderSections(instance._bodyEl, opts.sections ?? []);
    else if (Log)
        Log.error("[LayerManager] _LayerManagerRenderer non disponible");
}
/**
 * Creates an adapter-agnostic layer manager control instance.
 *
 * The returned object exposes `addTo(map)` which delegates to
 * `map.addControl(container, position)` from the IMapAdapter contract.
 */
function createLayerManagerControl(options) {
    const instance = {
        _map: null,
        _container: null,
        _bodyEl: null,
        _glOptions: options,
        _controlHandle: null,
        _cleanups: [],
        addTo(map) {
            this._map = map;
            this._container = domCreate("div", "gl-layer-manager");
            blockMapPropagation(this._container, this._cleanups);
            this._buildStructure();
            this._controlHandle = map.addControl(this._container, options.position || "bottomright");
            return this;
        },
        remove() {
            for (const fn of this._cleanups)
                fn();
            this._cleanups = [];
            this._controlHandle?.remove();
            this._controlHandle = null;
            this._map = null;
            this._container = null;
        },
        getContainer() {
            return this._container;
        },
        _buildStructure() {
            const opts = this._glOptions;
            const mainWrapper = domCreate("div", "gl-layer-manager__main-wrapper", this._container);
            const header = _buildLMHeader(opts, mainWrapper);
            if (opts.collapsible)
                _buildLMCollapsibleToggle(header, this);
            _buildLMBody(this, opts, mainWrapper);
        },
        _renderSections(sections) {
            if (LMRenderer)
                LMRenderer.renderSections(this._bodyEl, sections);
            else if (Log)
                Log.error("[LayerManager] _LayerManagerRenderer non disponible");
        },
        updateSections(sections) {
            this._glOptions.sections = Array.isArray(sections) ? sections : [];
            this._renderSections(this._glOptions.sections);
        },
        refresh() {
            if (LMRenderer && typeof LMRenderer.syncToggles === "function")
                LMRenderer.syncToggles();
            else if (this._glOptions?.sections)
                this._renderSections(this._glOptions.sections);
        },
        _toggleCollapsed() {
            const isCollapsed = this._container.classList.toggle("gl-layer-manager--collapsed");
            this._glOptions.collapsed = isCollapsed;
        },
    };
    return instance;
}
const LMControl = {
    create: createLayerManagerControl,
};

/**
 * Module shared pour LayerManager
 * STATE et utilitaires communs entre les sous-modules
 *
 * DEPENDENCIES:
 * - GeoLeaf.Log (optional)
 *
 * EXPOSE:
 * - GeoLeaf._LayerManagerShared
 */
/**
 * Shared state for LayerManager (private internal)
 */
const _LayerManagerShared = {
    map: null,
    control: null,
    options: {
        position: "bottomright",
        title: "Legend",
        collapsible: true,
        collapsed: false,
        sections: [],
    },
};
const LMShared = _LayerManagerShared;

export { BasemapSelector as B, LayerManager as L, StyleSelector as S, LegendContract as a, LMControl as b, LMRenderer as c, LMShared as d, Baselayers as e };
//# sourceMappingURL=geoleaf-chunk-layers-D7C6tPLK.js.map
