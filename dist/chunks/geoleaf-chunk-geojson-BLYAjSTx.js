import { g as getLog, n as normalizeToFlat, c as collectHatchPatterns, r as registerHatchPattern, s as styleRulesToPaint, t as toFillPaint, a as toCasingPaint, b as toLinePaint, d as toFillExtrusionPaint, e as toCirclePaint, S as SENTINEL_POI, f as toSourceId, h as toSubLayerId, i as dispatchGeoLeafEvent, j as calculateMapScale, k as isScaleInRange, v as validateUrl, w as wktToGeoJSON, l as debounce, L as Log } from './geoleaf-chunk-core-utils-u0egMUiC.js';

/**
 * GeoLeaf GeoJSON Module - Shared State & Constants
 * @module geojson/shared
 */
const _g$c = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const defaultOptions = () => ({
    defaultStyle: {
        color: "#999999",
        weight: 2,
        opacity: 0.9,
        fillColor: "#cccccc",
        fillOpacity: 0.15,
    },
    defaultPointStyle: {
        radius: 6,
        color: "#999999",
        weight: 2,
        fillColor: "#cccccc",
        fillOpacity: 0.9,
    },
    onEachFeature: null,
    pointToLayer: null,
    fitBoundsOnLoad: true,
    maxZoomOnFit: _g$c.GeoLeaf?.CONSTANTS?.GEOJSON_MAX_ZOOM_ON_FIT ?? 18,
});
const GeoJSONShared = {
    state: {
        map: null,
        layerGroup: null,
        geoJsonLayer: null,
        layers: new Map(),
        layerIdCounter: 0,
        options: defaultOptions(),
        /** IMapAdapter instance (set during init). */
        adapter: null,
    },
    PANE_CONFIG: {
        BASEMAP_NAME: "geoleaf-basemap",
        BASEMAP_ZINDEX: 200,
        LAYER_PREFIX: "geoleaf-layer-",
        LAYER_BASE_ZINDEX: 400,
        MIN_LAYER_ZINDEX: 0,
        MAX_LAYER_ZINDEX: 99,
    },
    PaneHelpers: {
        getPaneName(zIndex) {
            const config = GeoJSONShared.PANE_CONFIG;
            return `${config.LAYER_PREFIX}${zIndex || 0}`;
        },
        validateZIndex(zIndex) {
            const config = GeoJSONShared.PANE_CONFIG;
            return Math.max(config.MIN_LAYER_ZINDEX, Math.min(config.MAX_LAYER_ZINDEX, Math.floor(zIndex)));
        },
        applyPaneToLayer(layer, zIndex) {
            if (layer?.options) {
                layer.options.pane = this.getPaneName(zIndex);
            }
        },
    },
    STYLE_OPERATORS: {
        ">": (a, b) => Number(a) > Number(b),
        ">=": (a, b) => Number(a) >= Number(b),
        "<": (a, b) => Number(a) < Number(b),
        "<=": (a, b) => Number(a) <= Number(b),
        "==": (a, b) => a == b,
        "===": (a, b) => a === b,
        eq: (a, b) => a == b,
        "!=": (a, b) => a != b,
        "!==": (a, b) => a !== b,
        neq: (a, b) => a != b,
        contains: (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
        startsWith: (a, b) => String(a).toLowerCase().startsWith(String(b).toLowerCase()),
        endsWith: (a, b) => String(a).toLowerCase().endsWith(String(b).toLowerCase()),
        in: (a, b) => Array.isArray(b) && b.includes(a),
        notIn: (a, b) => Array.isArray(b) && !b.includes(a),
        between: (a, b) => {
            if (!Array.isArray(b) || b.length !== 2)
                return false;
            const num = Number(a);
            const min = Number(b[0]);
            const max = Number(b[1]);
            return num >= min && num <= max;
        },
    },
    /** Default styles for each geometry type (polygon, line, point). */
    DEFAULT_STYLES: {
        polygon: {
            color: "#999999",
            weight: 2,
            opacity: 0.9,
            fillColor: "#cccccc",
            fillOpacity: 0.15,
        },
        line: {
            color: "#999999",
            weight: 2,
            opacity: 0.9,
            fillColor: "#cccccc",
            fillOpacity: 0.15,
        },
        point: { radius: 6, color: "#999999", weight: 2, fillColor: "#cccccc", fillOpacity: 0.9 },
    },
    reset() {
        const state = GeoJSONShared.state;
        state.map = null;
        state.layerGroup = null;
        state.geoJsonLayer = null;
        state.layers = new Map();
        state.layerIdCounter = 0;
        state.options = defaultOptions();
        state.adapter = null;
    },
    getLog() {
        return _g$c.GeoLeaf?.Log ?? console;
    },
    getLayers() {
        return GeoJSONShared.state.layers;
    },
    getLayerById(layerId) {
        return GeoJSONShared.state.layers.get(layerId);
    },
};

/**
 * GeoLeaf GeoJSON Module - Clustering
 * @module geojson/clustering
 */
const _g$b = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const _CLUSTER_NONE = { shouldCluster: false, useSharedCluster: false };
const _CLUSTER_UNIFIED = { shouldCluster: true, useSharedCluster: true };
function _resolveClusteringConfig(def) {
    if (typeof def.clustering === "object")
        return def.clustering;
    return { enabled: def.clustering };
}
function _resolveCustomClusterCheck(clusteringConfig, def, poiConfig) {
    const clusterRadius = clusteringConfig.maxClusterRadius ??
        (typeof def.clusterRadius === "number" ? def.clusterRadius : null);
    const disableAtZoom = clusteringConfig.disableClusteringAtZoom ??
        (typeof def.disableClusteringAtZoom === "number" ? def.disableClusteringAtZoom : null);
    if (clusterRadius !== null && clusterRadius !== (poiConfig.clusterRadius ?? 80))
        return true;
    if (disableAtZoom === null)
        return false;
    return disableAtZoom !== (poiConfig.disableClusteringAtZoom ?? 18);
}
function _resolveStrategyResult(strategy, isClusteringEnabled, poiConfig) {
    const Log = getLog();
    switch (strategy) {
        case "unified":
            return _CLUSTER_UNIFIED;
        case "by-layer":
            return { shouldCluster: isClusteringEnabled, useSharedCluster: false };
        case "by-source": {
            const sourceConfig = poiConfig.clusterStrategies?.["by-source"]?.sources ?? {};
            return { shouldCluster: sourceConfig.geojson !== false, useSharedCluster: false };
        }
        case "json-only": {
            const jsonOnlyConfig = poiConfig.clusterStrategies?.["json-only"] ?? {};
            return {
                shouldCluster: jsonOnlyConfig.geojsonClustering === true,
                useSharedCluster: false,
            };
        }
        default:
            Log.warn?.("[GeoLeaf.GeoJSON] Unknown clustering strategy: " +
                strategy +
                ". Defaulting to 'unified'.");
            return _CLUSTER_UNIFIED;
    }
}
const GeoJSONClustering = {
    getPoiConfig() {
        const Config = _g$b.GeoLeaf
            ?.Config;
        if (Config && typeof Config.get === "function") {
            return Config.get("poiConfig") || {};
        }
        return {};
    },
    getSharedPOICluster() {
        const Log = getLog();
        try {
            const POI = _g$b.GeoLeaf?.POI;
            if (!POI || typeof POI.getLayer !== "function") {
                Log.debug?.("[GeoLeaf.GeoJSON] POI module not available or getLayer() missing");
                return null;
            }
            const poiLayer = POI.getLayer();
            if (!poiLayer) {
                Log.debug?.("[GeoLeaf.GeoJSON] POI.getLayer() returns null/undefined");
                return null;
            }
            const layer = poiLayer;
            if (layer &&
                typeof layer.addLayer === "function" &&
                typeof layer.removeLayer === "function") {
                Log.debug?.("[GeoLeaf.GeoJSON] POI Cluster/Layer retrieved successfully");
                return poiLayer;
            }
            Log.warn?.("[GeoLeaf.GeoJSON] POI.getLayer() does not return a valid layer (checks failed)");
        }
        catch (e) {
            getLog().error?.("[GeoLeaf.GeoJSON] Unable to retrieve the POI cluster:", e);
        }
        return null;
    },
    getClusteringStrategy(def, geojsonData) {
        const poiConfig = GeoJSONClustering.getPoiConfig();
        const clusteringConfig = _resolveClusteringConfig(def);
        const isClusteringEnabled = clusteringConfig.enabled === true;
        const isClusteringDisabled = clusteringConfig.enabled === false;
        if (isClusteringDisabled)
            return _CLUSTER_NONE;
        if (!poiConfig.clustering && !isClusteringEnabled)
            return _CLUSTER_NONE;
        const hasPoints = geojsonData.features?.some((f) => f?.geometry?.type?.includes("Point")) ?? false;
        if (!hasPoints)
            return _CLUSTER_NONE;
        if (isClusteringEnabled) {
            if (_resolveCustomClusterCheck(clusteringConfig, def, poiConfig))
                return { shouldCluster: true, useSharedCluster: false };
            const strategy = poiConfig.clusterStrategy ?? "unified";
            return { shouldCluster: true, useSharedCluster: strategy === "unified" };
        }
        const strategy = poiConfig.clusterStrategy ?? "unified";
        return _resolveStrategyResult(strategy, isClusteringEnabled, poiConfig);
    },
    /**
     * Returns a no-op stub. In MapLibre mode, clustering is handled natively
     * via `cluster: true` on the GeoJSON source.
     */
    createIndependentCluster(options = {}) {
        return {
            _stub: true,
            options: {
                maxClusterRadius: options.clusterRadius ?? 80,
                disableClusteringAtZoom: options.disableClusteringAtZoom ?? 18,
                animate: options.animate ?? false,
                spiderfyOnMaxZoom: options.spiderfyOnMaxZoom ?? false,
                showCoverageOnHover: options.showCoverageOnHover ?? false,
                zoomToBoundsOnClick: options.zoomToBoundsOnClick ?? true,
            },
            addLayer() { },
            removeLayer() { },
            clearLayers() { },
            getLayers() {
                return [];
            },
            addTo() {
                return this;
            },
            on() {
                return this;
            },
        };
    },
};

/**







 * GeoLeaf GeoJSON Module - Feature Validator







 * @module geojson/feature-validator







 */
function _resolveFeatureId(feat, index) {
    const rawId = feat?.properties?.id ?? feat?.id ?? index ?? "unknown";
    return typeof rawId === "string" || typeof rawId === "number" ? rawId : "unknown";
}
function _validateNumericField(props, featureId, field, min, max) {
    const errors = [];
    const val = props[field];
    if (val === undefined)
        return errors;
    if (typeof val !== "number") {
        errors.push({
            featureId,
            field: `properties.${field}`,
            message: `${field} must be un nombre`,
            severity: "warning",
        });
        return errors;
    }
    const n = val;
    if (n < min) {
        errors.push({
            featureId,
            field: `properties.${field}`,
            message: max !== undefined
                ? `${field} must be entre ${min} et ${max}`
                : `${field} must be >= ${min}`,
            severity: "warning",
        });
    }
    if (max !== undefined && n > max) {
        errors.push({
            featureId,
            field: `properties.${field}`,
            message: `${field} must be entre ${min} et ${max}`,
            severity: "warning",
        });
    }
    return errors;
}
function _validateColorField(props, featureId) {
    const errors = [];
    if (typeof props.color !== "undefined" &&
        typeof props.color === "string" &&
        !/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(props.color)) {
        errors.push({
            featureId,
            field: "properties.color",
            message: `color invalide '${props.color}'. Format: #RGB ou #RRGGBB`,
            severity: "warning",
        });
    }
    return errors;
}
function _validateUrlEmailFields(props, featureId) {
    const errors = [];
    for (const field of ["link", "photo", "url"]) {
        const v = props[field];
        if (typeof v !== "undefined" && typeof v === "string") {
            let urlOk = true;
            try {
                new URL(v);
            }
            catch {
                urlOk = /^(https?:\/\/|\/|\.\.?\/)/.test(v);
            }
            if (!urlOk)
                errors.push({
                    featureId,
                    field: `properties.${field}`,
                    message: `${field} n'est pas une URL valide`,
                    severity: "warning",
                });
        }
    }
    if (typeof props.email !== "undefined" &&
        typeof props.email === "string" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
        errors.push({
            featureId,
            field: "properties.email",
            message: "email invalide",
            severity: "warning",
        });
    }
    return errors;
}
function _validateTagsAndStructure(props, featureId) {
    const errors = [];
    if (typeof props.tags !== "undefined") {
        if (!Array.isArray(props.tags)) {
            errors.push({
                featureId,
                field: "properties.tags",
                message: "tags must be un array",
                severity: "warning",
            });
        }
        else {
            props.tags.forEach((tag, idx) => {
                if (typeof tag !== "string") {
                    errors.push({
                        featureId,
                        field: `properties.tags[${idx}]`,
                        message: "tag must be une string",
                        severity: "warning",
                    });
                }
            });
        }
    }
    for (const [key, value] of Object.entries(props)) {
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            errors.push({
                featureId,
                field: `properties.${key}`,
                message: "Nested property detected. Properties must be flat.",
                severity: "error",
            });
        }
    }
    return errors;
}
const FeatureValidator = {
    validateFeatureCollection(collection) {
        const Log = getLog();
        const errors = [];
        const validFeatures = [];
        if (!collection || typeof collection !== "object") {
            Log.warn?.("[GeoLeaf.GeoJSON.Validator] Invalid collection: invalid type");
            return {
                validFeatures: [],
                errors: [
                    {
                        featureId: "?",
                        field: "",
                        message: "Collection non valide",
                        severity: "error",
                    },
                ],
            };
        }
        const coll = collection;
        const features = coll.type === "FeatureCollection"
            ? coll.features
            : Array.isArray(collection)
                ? collection
                : [collection];
        if (!Array.isArray(features)) {
            Log.warn?.("[GeoLeaf.GeoJSON.Validator] No features to validate");
            return { validFeatures: [], errors: [] };
        }
        for (let i = 0; i < features.length; i++) {
            const result = FeatureValidator.validateFeature(features[i], i);
            if (result.valid) {
                validFeatures.push(features[i]);
            }
            else {
                errors.push(...result.errors);
            }
        }
        return { validFeatures, errors };
    },
    validateFeature(feature, index) {
        const Log = getLog();
        const errors = [];
        const feat = feature;
        const featureId = _resolveFeatureId(feat, index);
        if (!feat || feat.type !== "Feature") {
            errors.push({
                featureId,
                field: "type",
                message: "Feature doit avoir type='Feature'",
                severity: "error",
            });
            Log.warn?.("[GeoLeaf.GeoJSON.Validator] Feature " + featureId + ": invalid type");
            return { valid: false, errors };
        }
        const geomResult = FeatureValidator.validateGeometry(feat.geometry, featureId);
        if (!geomResult.valid)
            errors.push(...geomResult.errors);
        const propsResult = FeatureValidator.validateProperties(feat.properties, featureId);
        if (!propsResult.valid)
            errors.push(...propsResult.errors);
        if (errors.length > 0) {
            Log.warn?.("[GeoLeaf.GeoJSON.Validator] Feature " +
                featureId +
                " rejected: " +
                errors.map((e) => e.message).join("; "));
            return { valid: false, errors };
        }
        return { valid: true, errors: [] };
    },
    validateGeometry(geometry, featureId) {
        const errors = [];
        const validTypes = ["Point", "LineString", "MultiLineString", "Polygon", "MultiPolygon"];
        if (!geometry || typeof geometry !== "object") {
            errors.push({
                featureId,
                field: "geometry",
                message: "geometry required et must be un object",
                severity: "error",
            });
            return { valid: false, errors };
        }
        const geom = geometry;
        if (!geom.type) {
            errors.push({
                featureId,
                field: "geometry.type",
                message: "geometry.type required",
                severity: "error",
            });
            return { valid: false, errors };
        }
        if (!validTypes.includes(geom.type)) {
            errors.push({
                featureId,
                field: "geometry.type",
                message: `Invalid geometry type '${geom.type}'. Must be: ${validTypes.join(", ")}`,
                severity: "error",
            });
            return { valid: false, errors };
        }
        if (!Array.isArray(geom.coordinates) || geom.coordinates.length === 0) {
            errors.push({
                featureId,
                field: "geometry.coordinates",
                message: "geometry.coordinates must be un array non-vide",
                severity: "error",
            });
            return { valid: false, errors };
        }
        return { valid: errors.length === 0, errors };
    },
    validateProperties(properties, featureId) {
        const errors = [];
        if (!properties || typeof properties !== "object") {
            errors.push({
                featureId,
                field: "properties",
                message: "properties required et must be un object",
                severity: "error",
            });
            return { valid: false, errors };
        }
        const hasName = properties.name || properties.title || properties.label;
        if (!hasName) {
            errors.push({
                featureId,
                field: "properties.name",
                message: "properties doit contenir au moins name, title ou label",
                severity: "error",
            });
        }
        errors.push(..._validateNumericField(properties, featureId, "distance_km", 0));
        errors.push(..._validateNumericField(properties, featureId, "duration_min", 0));
        errors.push(..._validateNumericField(properties, featureId, "rating", 0, 5));
        errors.push(..._validateColorField(properties, featureId));
        errors.push(..._validateNumericField(properties, featureId, "opacity", 0, 1));
        errors.push(..._validateNumericField(properties, featureId, "weight", 0));
        errors.push(..._validateUrlEmailFields(properties, featureId));
        errors.push(..._validateTagsAndStructure(properties, featureId));
        const hasErrors = errors.some((e) => e.severity === "error");
        return { valid: !hasErrors, errors };
    },
    isValidUrl(url) {
        if (typeof url !== "string")
            return false;
        try {
            new URL(url);
            return true;
        }
        catch {
            return /^(https?:\/\/|\/|\.\.?\/)/.test(url);
        }
    },
    isValidEmail(email) {
        if (typeof email !== "string")
            return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
};

/**
 * GeoLeaf GeoJSON - Style Utilities
 * @module geojson/style-utils
 */
const _g$a = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
function _applyFillOptions(normalized, fill, setFillFlag) {
    if (fill.color)
        normalized.fillColor = fill.color;
    normalized.fillOpacity = typeof fill.opacity === "number" ? fill.opacity : 0.4;
    if (fill.pattern)
        normalized.fillPattern = fill.pattern;
    if (setFillFlag)
        normalized.fill = true;
}
function _applyStrokeOptions(normalized, stroke) {
    if (stroke.color)
        normalized.color = stroke.color;
    if (typeof stroke.opacity === "number")
        normalized.opacity = stroke.opacity;
    if (typeof stroke.widthPx === "number")
        normalized.weight = stroke.widthPx;
    if (stroke.dashArray)
        normalized.dashArray = stroke.dashArray;
    if (stroke.lineCap)
        normalized.lineCap = stroke.lineCap;
    if (stroke.lineJoin)
        normalized.lineJoin = stroke.lineJoin;
}
function normalizeStyle(style, options = {}) {
    if (!style || typeof style !== "object")
        return {};
    const normalized = {};
    const fill = style.fill;
    const stroke = style.stroke;
    if (fill || stroke) {
        if (fill)
            _applyFillOptions(normalized, fill, !!options.setFillFlag);
        if (stroke)
            _applyStrokeOptions(normalized, stroke);
        if (style.shape)
            normalized.shape = style.shape;
        if (typeof style.sizePx === "number") {
            normalized.radius = style.sizePx;
            normalized.sizePx = style.sizePx;
        }
    }
    else {
        Object.assign(normalized, style);
    }
    return normalized;
}
/**
 * Normalizes a GeoLeaf style to MapLibre paint format for a given geometry type.
 * Delegates to the `maplibre-style-converter` module loaded on the global.
 *
 * @param style - GeoLeaf style (nested or flat).
 * @param geometryType - Target geometry: `"fill"`, `"line"`, or `"circle"`.
 * @returns MapLibre paint properties object.
 */
function normalizeStyleToMapLibre(style, geometryType) {
    if (!style || typeof style !== "object")
        return {};
    const converter = _g$a.GeoLeaf?._MaplibreStyleConverter;
    if (!converter)
        return {};
    const flat = converter.normalizeToFlat(style);
    switch (geometryType) {
        case "fill":
            return converter.toFillPaint(flat);
        case "line":
            return converter.toLinePaint(flat);
        case "circle":
            return converter.toCirclePaint(flat);
        default:
            return {};
    }
}
const g = _g$a;
if (!g.GeoLeaf)
    g.GeoLeaf = {};
g.GeoLeaf._StyleUtils = { normalizeStyle, normalizeStyleToMapLibre };

/**
 * GeoLeaf GeoJSON Module - Style Resolver
 * @module geojson/style-resolver
 */
const _g$9 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
/** Fallback when GeoJSONShared is not yet loaded (e.g. in tests that load style-resolver in isolation) */
const DEFAULT_STYLE_OPERATORS = {
    ">": (a, b) => Number(a) > Number(b),
    ">=": (a, b) => Number(a) >= Number(b),
    "<": (a, b) => Number(a) < Number(b),
    "<=": (a, b) => Number(a) <= Number(b),
    "==": (a, b) => a == b,
    "===": (a, b) => a === b,
    eq: (a, b) => a == b,
    "!=": (a, b) => a != b,
    "!==": (a, b) => a !== b,
    neq: (a, b) => a != b,
    contains: (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
    startsWith: (a, b) => String(a).toLowerCase().startsWith(String(b).toLowerCase()),
    endsWith: (a, b) => String(a).toLowerCase().endsWith(String(b).toLowerCase()),
    in: (a, b) => Array.isArray(b) && b.includes(a),
    notIn: (a, b) => Array.isArray(b) && !b.includes(a),
    between: (a, b) => Array.isArray(b) &&
        b.length === 2 &&
        Number(a) >= Number(b[0]) &&
        Number(a) <= Number(b[1]),
};
function _applyFillStyle(fill, normalized) {
    if (!fill)
        return;
    if (fill.color)
        normalized.fillColor = fill.color;
    normalized.fillOpacity = typeof fill.opacity === "number" ? fill.opacity : 1.0;
}
function _applyStrokeStyle(stroke, normalized) {
    if (!stroke)
        return;
    if (stroke.color)
        normalized.color = stroke.color;
    if (typeof stroke.opacity === "number")
        normalized.opacity = stroke.opacity;
    if (typeof stroke.widthPx === "number")
        normalized.weight = stroke.widthPx;
    if (stroke.dashArray)
        normalized.dashArray = stroke.dashArray;
    if (stroke.lineCap)
        normalized.lineCap = stroke.lineCap;
    if (stroke.lineJoin)
        normalized.lineJoin = stroke.lineJoin;
}
function _applyHatchAndShape(style, normalized) {
    const hatch = style.hatch;
    if (hatch?.enabled) {
        normalized.hatch = Object.assign({}, style.hatch);
        if (hatch.renderMode === "pattern_only") {
            normalized.fillColor = "transparent";
            normalized.fillOpacity = 1;
        }
    }
    if (style.shape)
        normalized.shape = style.shape;
    if (typeof style.sizePx === "number") {
        normalized.radius = style.sizePx;
        normalized.sizePx = style.sizePx;
    }
}
function _checkStyleRule(feature, rule, STYLE_OPERATORS, Log) {
    const when = rule.when;
    if (when.all && Array.isArray(when.all)) {
        const allMet = when.all.every((condition) => GeoJSONStyleResolver.evaluateCondition(feature, condition, STYLE_OPERATORS, Log));
        if (allMet)
            return rule.style;
    }
    else if (when.field && when.operator) {
        const conditionMet = GeoJSONStyleResolver.evaluateCondition(feature, when, STYLE_OPERATORS, Log);
        if (conditionMet)
            return rule.style;
    }
    return null;
}
function _buildNormalizeStyleFn() {
    return (style) => {
        if (!style || typeof style !== "object")
            return {};
        const normalized = {};
        const fill = style.fill;
        const stroke = style.stroke;
        if (fill || stroke) {
            _applyFillStyle(fill, normalized);
            _applyStrokeStyle(stroke, normalized);
            _applyHatchAndShape(style, normalized);
        }
        else {
            Object.assign(normalized, style);
            if (typeof normalized.fillOpacity !== "number")
                normalized.fillOpacity = 1.0;
        }
        return normalized;
    };
}
function _buildPointToLayerFn(options, g) {
    if (options.pointToLayer)
        return (feature, latlng) => options.pointToLayer(feature, latlng);
    return (_feature, latlng) => {
        const interactiveShapes = typeof options.interactiveShape === "boolean"
            ? options.interactiveShape
            : g.GeoLeaf?.Config?.get?.("ui.interactiveShapes", false);
        const pointStyle = g.GeoLeaf?.Utils?.mergeOptions
            ? g.GeoLeaf.Utils.mergeOptions(options.defaultPointStyle ?? {}, {
                interactive: interactiveShapes,
            })
            : Object.assign({}, options.defaultPointStyle ?? {}, {
                interactive: interactiveShapes,
            });
        return { _stub: true, latlng, style: pointStyle };
    };
}
const GeoJSONStyleResolver = {
    getNestedValue(obj, path) {
        if (!obj || !path)
            return null;
        return path
            .split(".")
            .reduce((current, prop) => current != null &&
            typeof current === "object" &&
            current[prop] !== undefined
            ? current[prop]
            : null, obj);
    },
    evaluateCondition(feature, condition, STYLE_OPERATORS, Log) {
        const { field, operator, value } = condition;
        if (!field || !operator)
            return false;
        const fieldValue = GeoJSONStyleResolver.getNestedValue(feature.properties ?? {}, field);
        if (fieldValue === null || fieldValue === undefined)
            return false;
        const compareFn = STYLE_OPERATORS[operator];
        if (!compareFn) {
            Log.warn?.("[GeoJSON] Unknown styleRules operator:", operator);
            return false;
        }
        try {
            return compareFn(fieldValue, value);
        }
        catch (e) {
            Log.warn?.("[GeoJSON] Condition evaluation error:", e instanceof Error ? e.message : e);
            return false;
        }
    },
    evaluateStyleRules(feature, styleRules) {
        if (!Array.isArray(styleRules) || styleRules.length === 0)
            return null;
        const Log = getLog();
        const STYLE_OPERATORS = GeoJSONShared?.STYLE_OPERATORS ?? DEFAULT_STYLE_OPERATORS;
        for (const rule of styleRules) {
            if (!rule?.when || !rule?.style)
                continue;
            const matched = _checkStyleRule(feature, rule, STYLE_OPERATORS, Log);
            if (matched)
                return matched;
        }
        return null;
    },
    buildLayerOptions(options) {
        const evaluateStyleRules = GeoJSONStyleResolver.evaluateStyleRules;
        const g = _g$9;
        const normalizeStyle = _buildNormalizeStyleFn();
        return {
            style(feature) {
                let finalStyle = Object.assign({}, normalizeStyle((options.defaultStyle ?? {})));
                if (options.styleRules?.length) {
                    const matched = evaluateStyleRules(feature, options.styleRules);
                    if (matched)
                        finalStyle = Object.assign({}, finalStyle, normalizeStyle(matched));
                }
                const interactiveShapes = typeof options.interactiveShape === "boolean"
                    ? options.interactiveShape
                    : g.GeoLeaf?.Config?.get?.("ui.interactiveShapes", false);
                finalStyle.interactive = interactiveShapes;
                return finalStyle;
            },
            pointToLayer: _buildPointToLayerFn(options, g),
            onEachFeature(feature, layer) {
                const layerObj = layer;
                if (feature?.properties && typeof feature.properties.popupContent === "string") {
                    layerObj.bindPopup?.(feature.properties.popupContent);
                }
                if (typeof options.onEachFeature === "function")
                    options.onEachFeature(feature, layer);
            },
        };
    },
};
if (!_g$9.GeoLeaf)
    _g$9.GeoLeaf = {};
_g$9.GeoLeaf._StyleRules = {
    evaluate: GeoJSONStyleResolver.evaluateStyleRules,
    operators: GeoJSONShared?.STYLE_OPERATORS ?? DEFAULT_STYLE_OPERATORS,
    getNestedValue: GeoJSONStyleResolver.getNestedValue,
};
// ─── MapLibre style spec builder (Sprint 4) ─────────────────────────────────
/**
 * Builds MapLibre paint specs from GeoLeaf layer style options.
 *
 * Delegates to the `maplibre-style-converter` module for paint conversion
 * and expression generation. The `evaluateStyleRules()` function remains
 * engine-agnostic and is still used at runtime for popup content building.
 */
GeoJSONStyleResolver.buildMapLibreStyleSpec = function (options, layerId) {
    // Dynamic import avoided — rely on global if converter is loaded
    const converter = _g$9.GeoLeaf?._MaplibreStyleConverter;
    if (!converter) {
        // Fallback: return empty paint objects (style will use MapLibre defaults)
        return { fillPaint: {}, linePaint: {}, circlePaint: {} };
    }
    const defaultFlat = converter.normalizeToFlat((options.defaultStyle ?? {}));
    if (options.styleRules?.length) {
        return {
            fillPaint: converter.styleRulesToPaint(options.styleRules, defaultFlat, "fill", layerId),
            linePaint: converter.styleRulesToPaint(options.styleRules, defaultFlat, "line"),
            circlePaint: converter.styleRulesToPaint(options.styleRules, defaultFlat, "circle"),
        };
    }
    return {
        fillPaint: converter.toFillPaint(defaultFlat, layerId),
        linePaint: converter.toLinePaint(defaultFlat),
        circlePaint: converter.toCirclePaint(defaultFlat),
    };
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * Boot-time validation for fill-extrusion layers.
 * Called during layer loading to fail fast on invalid configuration.
 *
 * @module adapters/maplibre/style-validator-extrusion
 */
/**
 * Validates that required fill-extrusion style properties are present.
 * Throws on missing required fields; logs warnings for suspicious config.
 *
 * @param layerId - Layer identifier (for error messages)
 * @param geometry - Layer geometry type from config
 * @param style - Normalized flat style
 * @param firstFeature - Optional first GeoJSON feature (for field heuristic)
 * @param sourceType - "geojson" | "vector" (heuristic only runs on geojson)
 */
function validateFillExtrusionStyle(layerId, geometry, style, firstFeature, sourceType) {
    if (!geometry || geometry.toLowerCase() !== "fill-extrusion")
        return;
    if (!style.fillExtrusionHeight && style.fillExtrusionHeight !== 0) {
        throw new Error(`[GeoLeaf] Layer "${layerId}": fillExtrusionHeight is required for fill-extrusion geometry.`);
    }
    if (!style.fillExtrusionColor) {
        throw new Error(`[GeoLeaf] Layer "${layerId}": fillExtrusionColor is required for fill-extrusion geometry.`);
    }
}

/**
 * GeoLeaf GeoJSON Module — Vector Tiles (MapLibre native)
 *
 * Adds MVT (Mapbox Vector Tile) layers using MapLibre's native
 * `map.addSource({type:'vector'})` + `map.addLayer()` API.
 *
 * Replaces the previous Leaflet.VectorGrid implementation.
 * No optional peer dependency required — MapLibre supports vector
 * tiles natively.
 *
 * @module geojson/vector-tiles
 */
const _g$8 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const getState$a = () => GeoJSONShared.state;
// ─── Config helpers ──────────────────────────────────────────────────────────
function _resolveProfileBasePath$1(def, g) {
    const Config = g.GeoLeaf && g.GeoLeaf.Config;
    const dataCfg = Config && Config.get ? Config.get("data") : null;
    const basePath = (dataCfg && dataCfg.profilesBasePath) || "profiles";
    return { basePath, profileId: def._profileId, layerDir: def._layerDirectory };
}
async function _loadVtStyle(layerId, def, Log, g) {
    if (!def.styles || !def.styles.default)
        return null;
    try {
        return await g.GeoLeaf?._GeoJSONLayerConfig?.loadDefaultStyle(layerId, def);
    }
    catch (err) {
        Log.warn(`[VectorTiles] Could not load default style for ${layerId}:`, err.message);
        return null;
    }
}
/** Resolves a dot-notation property path against flat properties. */
function _resolvePropertyPath(props, path) {
    if (!props || !path)
        return null;
    const cleanPath = path.startsWith("properties.") ? path.substring("properties.".length) : path;
    const parts = cleanPath.split(".");
    let current = props;
    for (const part of parts) {
        if (current === null || current === undefined)
            return null;
        current = current[part];
    }
    return current !== undefined ? current : null;
}
// ─── MapLibre popup/tooltip helpers ──────────────────────────────────────────
/** @security Escapes user-provided string before rendering in tooltip/popup. */
function _escapeHtml$1(str) {
    const GeoLeaf = _g$8.GeoLeaf;
    if (GeoLeaf?.Security && typeof GeoLeaf.Security.escapeHtml === "function") {
        return GeoLeaf.Security.escapeHtml(str);
    }
    if (!str)
        return "";
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}
function _bindVtClickPopup(nativeMap, subLayerIds, def) {
    if (!def.popup || def.popup.enabled === false)
        return;
    for (const subId of subLayerIds) {
        if (!nativeMap.getLayer(subId))
            continue;
        nativeMap.on("click", subId, (e) => {
            if (!e.features || e.features.length === 0)
                return;
            const props = e.features[0].properties ?? {};
            // Try content builder first
            const PopupTooltipMod = _g$8.GeoLeaf?._GeoJSONPopupTooltip;
            if (PopupTooltipMod && typeof PopupTooltipMod._buildPopupContent === "function") {
                const feature = { type: "Feature", properties: props, geometry: null };
                const content = PopupTooltipMod._buildPopupContent(feature, def);
                if (content) {
                    new _g$8.maplibregl.Popup({ maxWidth: "320px" })
                        .setLngLat(e.lngLat)
                        .setHTML(content)
                        .addTo(nativeMap);
                    return;
                }
            }
            // Fallback: build from raw properties with XSS escaping
            const lines = Object.keys(props)
                .filter((k) => props[k] !== null && props[k] !== undefined)
                .slice(0, 10)
                .map((k) => `<b>${_escapeHtml$1(k)}:</b> ${_escapeHtml$1(props[k])}`);
            if (lines.length > 0) {
                new _g$8.maplibregl.Popup({ maxWidth: "320px" })
                    .setLngLat(e.lngLat)
                    .setHTML(lines.join("<br>"))
                    .addTo(nativeMap);
            }
        });
        // Cursor change on hover
        nativeMap.on("mouseenter", subId, () => {
            nativeMap.getCanvas().style.cursor = "pointer";
        });
        nativeMap.on("mouseleave", subId, () => {
            nativeMap.getCanvas().style.cursor = "";
        });
    }
}
function _bindVtHoverTooltip(nativeMap, subLayerIds, def) {
    if (!def.tooltip || def.tooltip.enabled === false)
        return;
    let tooltipPopup = null;
    const fields = def.tooltip.fields;
    if (!fields || !Array.isArray(fields) || fields.length === 0)
        return;
    for (const subId of subLayerIds) {
        if (!nativeMap.getLayer(subId))
            continue;
        // mousemove instead of mouseenter so the tooltip updates when hovering
        // over different features within the same sub-layer (e.g. adjacent polygons).
        nativeMap.on("mousemove", subId, (e) => {
            if (!e.features || e.features.length === 0)
                return;
            const props = e.features[0].properties ?? {};
            const propValue = _resolvePropertyPath(props, fields[0].field || "");
            if (!propValue) {
                if (tooltipPopup) {
                    tooltipPopup.remove();
                    tooltipPopup = null;
                }
                return;
            }
            const html = _escapeHtml$1(String(propValue));
            if (tooltipPopup) {
                tooltipPopup.setLngLat(e.lngLat).setHTML(html);
            }
            else {
                tooltipPopup = new _g$8.maplibregl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    className: "gl-geojson-tooltip",
                    offset: [0, -10],
                });
                tooltipPopup.setLngLat(e.lngLat).setHTML(html).addTo(nativeMap);
            }
        });
        nativeMap.on("mouseleave", subId, () => {
            if (tooltipPopup) {
                tooltipPopup.remove();
                tooltipPopup = null;
            }
        });
    }
}
// ─── VectorTiles module ──────────────────────────────────────────────────────
const VectorTiles = {
    /**
     * MVT is always available with MapLibre — no optional dependency needed.
     */
    isAvailable() {
        return true;
    },
    /**
     * Determines if a layer definition should use vector tiles.
     * Returns true only when the VT config provides an **absolute** tile URL.
     * Relative paths (auto-generated from profile structure) are not used
     * because PBF files may not exist — the layer falls back to GeoJSON.
     */
    shouldUseVectorTiles(def) {
        const vtConfig = this._getVTConfig(def);
        if (!vtConfig || vtConfig.enabled === false)
            return false;
        // Only use VT when an explicit absolute URL is configured.
        // Relative tile paths (auto-generated) may point to non-existent PBF files.
        const url = (vtConfig.url || vtConfig.tilesUrl);
        if (!url)
            return false;
        if (url.startsWith("http") || url.startsWith("//") || url.startsWith("/")) {
            return true;
        }
        return false;
    },
    /**
     * Extracts the vectorTiles config block from a layer definition.
     * Supports both `def.vectorTiles` and `def.data.vectorTiles`.
     */
    _getVTConfig(def) {
        if (!def)
            return null;
        if (def.vectorTiles && typeof def.vectorTiles === "object")
            return def.vectorTiles;
        if (def.data?.vectorTiles && typeof def.data.vectorTiles === "object") {
            return def.data.vectorTiles;
        }
        return null;
    },
    /**
     * Resolves the full tile URL template from the layer definition.
     */
    _resolveTileUrl(def, vtConfig) {
        // Prefer tilesUrl (remote), then url (legacy)
        const directUrl = vtConfig.tilesUrl || vtConfig.url;
        if (directUrl) {
            if (directUrl.startsWith("http") ||
                directUrl.startsWith("//") ||
                directUrl.startsWith("/")) {
                return directUrl;
            }
        }
        const { basePath: profilesBasePath, profileId, layerDir, } = _resolveProfileBasePath$1(def, _g$8);
        if (!profileId || !layerDir)
            return vtConfig.url || null;
        const tilesDir = vtConfig.tilesDirectory || "tiles";
        return `${profilesBasePath}/${profileId}/${layerDir}/${tilesDir}/{z}/{x}/{y}.pbf`;
    },
    /**
     * Creates a vector tile layer using MapLibre's native source/layer API.
     *
     * One `vector` source is created, then up to 3 render layers (fill, line, circle)
     * depending on the expected geometry type from the layer definition.
     *
     * @param layerId - Unique layer ID.
     * @param layerLabel - Display label.
     * @param def - Normalised layer definition (must include vectorTiles block).
     * @param _baseOptions - Base options (unused in MapLibre mode).
     * @returns Layer metadata.
     */
    async loadVectorTileLayer(layerId, layerLabel, def, _baseOptions) {
        const Log = getLog();
        const state = getState$a();
        const vtConfig = this._getVTConfig(def);
        if (!vtConfig)
            throw new Error(`[VectorTiles] No vectorTiles config for ${layerId}`);
        const tileUrl = this._resolveTileUrl(def, vtConfig);
        if (!tileUrl)
            throw new Error(`[VectorTiles] Cannot resolve tile URL for ${layerId}`);
        const styleData = await _loadVtStyle(layerId, def, Log, _g$8);
        const vtLayerName = vtConfig.layerName || def.id;
        // Resolve the native MapLibre map
        const adapter = _g$8.GeoLeaf?.Core?.getMap?.();
        const nativeMap = adapter?.getNativeMap?.() ?? state.map;
        if (!nativeMap || typeof nativeMap.addSource !== "function") {
            throw new Error("[VectorTiles] Native MapLibre map not available");
        }
        // Add vector source — remove any stale source left from a previous load cycle
        // (e.g. rapid basemap switching where two rebuilds overlap).
        const sourceId = toSourceId(layerId);
        if (nativeMap.getSource(sourceId)) {
            for (const sid of [
                `gl-${layerId}-fill-extrusion`,
                `gl-${layerId}-fill`,
                `gl-${layerId}-line`,
                `gl-${layerId}-line-casing`,
                `gl-${layerId}-circle`,
                `gl-${layerId}-symbol`,
            ]) {
                if (nativeMap.getLayer(sid))
                    nativeMap.removeLayer(sid);
            }
            nativeMap.removeSource(sourceId);
            Log.debug(`[GeoLeaf.VectorTiles] Removed stale source/layers for "${layerId}" before re-add.`);
        }
        const sourceConfig = {
            type: "vector",
            tiles: [tileUrl],
            minzoom: vtConfig.minZoom || 0,
            maxzoom: vtConfig.maxNativeZoom || 14,
        };
        // Tile grid scheme — explicit config only.
        // NOTE: URL-based auto-detection (e.g. "/tms/" heuristic) has been
        // removed because some providers (IGN Geoplateforme) use "/tms/" in the
        // URL path but serve tiles in XYZ (y-down) convention. Set
        // `scheme: "tms"` explicitly in the layer config when needed.
        if (vtConfig.scheme === "tms") {
            sourceConfig.scheme = "tms";
        }
        // "xyz" is MapLibre's default — no need to set explicitly
        if (vtConfig.bounds)
            sourceConfig.bounds = vtConfig.bounds;
        nativeMap.addSource(sourceId, sourceConfig);
        Log.info(`[GeoLeaf.VectorTiles] Creating VT layer: ${layerId} (source-layer: ${vtLayerName})`);
        Log.debug(`[GeoLeaf.VectorTiles] URL template: ${tileUrl}`);
        // Determine geometry type from config
        const geomType = (def.geometry || def.geometryType || "polygon").toLowerCase();
        const defaultFlat = normalizeToFlat(state.options.defaultStyle);
        const resolvedStyleObj = styleData?.defaultStyle ?? styleData?.style;
        const styleFlat = resolvedStyleObj ? normalizeToFlat(resolvedStyleObj) : defaultFlat;
        const mergedFlat = { ...defaultFlat, ...styleFlat };
        // Validate fill-extrusion required fields (throws on missing)
        validateFillExtrusionStyle(layerId, geomType, mergedFlat);
        const createdSubIds = [];
        const createdTypes = [];
        // Ensure sentinel exists for ordering
        if (!nativeMap.getLayer(SENTINEL_POI)) {
            nativeMap.addLayer({
                id: SENTINEL_POI,
                type: "background",
                paint: { "background-opacity": 0 },
            });
        }
        const zIndex = typeof def.zIndex === "number" ? def.zIndex : 0;
        const beforeId = nativeMap.getLayer(SENTINEL_POI) ? SENTINEL_POI : undefined;
        // Zoom constraints from VT config → applied to every sub-layer
        const vtZoom = {};
        if (typeof vtConfig.minZoom === "number")
            vtZoom.minzoom = vtConfig.minZoom;
        if (typeof vtConfig.maxZoom === "number")
            vtZoom.maxzoom = vtConfig.maxZoom;
        // Create sub-layers based on geometry type
        if (geomType === "polygon" || geomType === "multipolygon" || geomType === "mixed") {
            const subId = toSubLayerId(layerId, "fill");
            // Register hatch patterns before creating the fill layer
            const hatchPatterns = collectHatchPatterns(mergedFlat, styleData?.styleRules, layerId);
            for (const { patternId, hatchConfig } of hatchPatterns) {
                registerHatchPattern(nativeMap, patternId, hatchConfig);
            }
            const paint = styleData?.styleRules?.length
                ? styleRulesToPaint(styleData.styleRules, mergedFlat, "fill", layerId)
                : toFillPaint(mergedFlat, layerId);
            nativeMap.addLayer({
                id: subId,
                type: "fill",
                source: sourceId,
                "source-layer": vtLayerName,
                paint,
                ...vtZoom,
            }, beforeId);
            createdSubIds.push(subId);
            createdTypes.push("fill");
        }
        if (geomType === "fill-extrusion") {
            const subId = toSubLayerId(layerId, "fill-extrusion");
            const paint = toFillExtrusionPaint(mergedFlat);
            nativeMap.addLayer({
                id: subId,
                type: "fill-extrusion",
                source: sourceId,
                "source-layer": vtLayerName,
                paint,
                ...vtZoom,
            }, beforeId);
            createdSubIds.push(subId);
            createdTypes.push("fill-extrusion");
        }
        if (geomType === "polygon" ||
            geomType === "multipolygon" ||
            geomType === "linestring" ||
            geomType === "multilinestring" ||
            geomType === "line" ||
            geomType === "mixed") {
            // Casing: thicker line behind the main stroke
            const vtCasing = mergedFlat.casing;
            if (vtCasing?.enabled) {
                const mw = typeof mergedFlat.weight === "number" ? mergedFlat.weight : 1;
                const casingSubId = toSubLayerId(layerId, "casing");
                nativeMap.addLayer({
                    id: casingSubId,
                    type: "line",
                    source: sourceId,
                    "source-layer": vtLayerName,
                    paint: toCasingPaint(vtCasing, mw),
                    ...vtZoom,
                }, beforeId);
                createdSubIds.push(casingSubId);
                createdTypes.push("casing");
            }
            const subId = toSubLayerId(layerId, "line");
            const paint = styleData?.styleRules?.length
                ? styleRulesToPaint(styleData.styleRules, mergedFlat, "line")
                : toLinePaint(mergedFlat);
            nativeMap.addLayer({
                id: subId,
                type: "line",
                source: sourceId,
                "source-layer": vtLayerName,
                paint,
                ...vtZoom,
            }, beforeId);
            createdSubIds.push(subId);
            createdTypes.push("line");
        }
        if (geomType === "point" || geomType === "multipoint" || geomType === "mixed") {
            const subId = toSubLayerId(layerId, "circle");
            const paint = styleData?.styleRules?.length
                ? styleRulesToPaint(styleData.styleRules, mergedFlat, "circle")
                : toCirclePaint(mergedFlat);
            nativeMap.addLayer({
                id: subId,
                type: "circle",
                source: sourceId,
                "source-layer": vtLayerName,
                paint,
                ...vtZoom,
            }, beforeId);
            createdSubIds.push(subId);
            createdTypes.push("circle");
        }
        // Bind interactions
        if (vtConfig.interactive !== false) {
            _bindVtClickPopup(nativeMap, createdSubIds, def);
            _bindVtHoverTooltip(nativeMap, createdSubIds, def);
        }
        // Register in adapter's layer registry if available
        if (adapter?.getLayerRegistry) {
            adapter.getLayerRegistry().register(layerId, createdTypes, zIndex, {
                isVectorTile: true,
                sourceLayer: vtLayerName,
            });
        }
        // Store layer data in shared state
        const { basePath: profilesBasePath } = _resolveProfileBasePath$1(def, _g$8);
        const layerBasePath = `${profilesBasePath}/${def._profileId}/${def._layerDirectory}`;
        const layerData = {
            id: layerId,
            label: layerLabel,
            layer: null, // No Leaflet layer object in MapLibre mode
            visible: true,
            config: def,
            clusterGroup: null,
            legendsConfig: def.legends,
            basePath: layerBasePath,
            useSharedCluster: false,
            features: [],
            geometryType: def.geometry || def.geometryType || "polygon",
            isVectorTile: true,
            vtLayerName,
            vtTileUrl: tileUrl,
            currentStyle: styleData,
            _maplibreLayerId: layerId,
            _maplibreSubLayerIds: createdSubIds,
            _visibility: {
                current: true,
                logicalState: true,
                source: "system",
                userOverride: false,
                themeOverride: false,
                themeDesired: null,
                zoomConstrained: false,
            },
        };
        state.layers.set(layerId, layerData);
        // Trigger visibility check
        if (_g$8.GeoLeaf?._GeoJSONLayerManager) {
            _g$8.GeoLeaf._GeoJSONLayerManager.updateLayerVisibilityByZoom();
        }
        Log.info(`[GeoLeaf.VectorTiles] VT layer loaded: ${layerId}`);
        return { id: layerId, label: layerLabel, featureCount: 0, isVectorTile: true };
    },
    /**
     * Updates the style of an existing VT layer via MapLibre paint properties.
     */
    updateLayerStyle(layerId, styleData) {
        const Log = getLog();
        const state = getState$a();
        const layerData = state.layers.get(layerId);
        if (!layerData || !layerData.isVectorTile)
            return;
        const adapter = _g$8.GeoLeaf?.Core?.getMap?.();
        const nativeMap = adapter?.getNativeMap?.() ?? state.map;
        if (!nativeMap)
            return;
        const subLayerIds = layerData._maplibreSubLayerIds || [];
        const defaultFlat = normalizeToFlat(state.options.defaultStyle);
        // Style objects may use either { defaultStyle: {…} } or { style: {…} } format.
        // Prefer .defaultStyle; fall back to .style before using the GeoLeaf default.
        const resolvedStyle = styleData?.defaultStyle ?? styleData?.style;
        const styleFlat = resolvedStyle ? normalizeToFlat(resolvedStyle) : defaultFlat;
        const mergedFlat = { ...defaultFlat, ...styleFlat };
        // Register hatch patterns for style updates
        const hatchPatterns = collectHatchPatterns(mergedFlat, styleData?.styleRules, layerId);
        for (const { patternId, hatchConfig } of hatchPatterns) {
            registerHatchPattern(nativeMap, patternId, hatchConfig);
        }
        for (const subId of subLayerIds) {
            if (!nativeMap.getLayer(subId))
                continue;
            let paint;
            if (subId.endsWith("-fill")) {
                paint = styleData?.styleRules?.length
                    ? styleRulesToPaint(styleData.styleRules, mergedFlat, "fill", layerId)
                    : toFillPaint(mergedFlat, layerId);
            }
            else if (subId.endsWith("-casing")) {
                const vtCas = mergedFlat.casing;
                if (vtCas?.enabled) {
                    const mw = typeof mergedFlat.weight === "number" ? mergedFlat.weight : 1;
                    paint = toCasingPaint(vtCas, mw);
                }
                else {
                    continue;
                }
            }
            else if (subId.endsWith("-line")) {
                paint = styleData?.styleRules?.length
                    ? styleRulesToPaint(styleData.styleRules, mergedFlat, "line")
                    : toLinePaint(mergedFlat);
            }
            else if (subId.endsWith("-fill-extrusion")) {
                paint = toFillExtrusionPaint(mergedFlat);
            }
            else if (subId.endsWith("-circle")) {
                paint = styleData?.styleRules?.length
                    ? styleRulesToPaint(styleData.styleRules, mergedFlat, "circle")
                    : toCirclePaint(mergedFlat);
            }
            else {
                continue;
            }
            for (const [prop, value] of Object.entries(paint)) {
                nativeMap.setPaintProperty(subId, prop, value);
            }
        }
        layerData.currentStyle = styleData;
        Log.debug(`[GeoLeaf.VectorTiles] Style updated for ${layerId}`);
    },
};

/**
 * GeoLeaf GeoJSON Module - Visibility Manager
 * Centralised visibility manager for layers with priority management
 *
 * Manages three sources of visibility change:
 * - 'user': Manual user action (toggle, explicit show/hide)
 * - 'theme': Change via theme application
 * - 'zoom': Automatic change based on the zoom level
 *
 * Priority rules:
 * 1. user > theme > zoom (the user always has the final say)
 * 2. A 'user' action cancels 'theme' and 'zoom' flags
 * 3. A 'theme' action can override 'zoom' but not 'user'
 * 4. A 'zoom' action never changes the state if 'user' or 'theme' is active
 *
 * @module geojson/visibility-manager
 */
const _g$7 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
// Lazy dependencies — fallback for tests where shared may be resolved differently
const _defaultState$1 = {
    map: null,
    layers: new Map(),
    adapter: null,
};
const getState$9 = () => (GeoJSONShared && GeoJSONShared.state ? GeoJSONShared.state : _defaultState$1);
const VisibilityManager = {};
/**
 * Possible visibility states
 * @private
 */
const VisibilitySource = {
    USER: "user",
    THEME: "theme",
    ZOOM: "zoom",
    SYSTEM: "system", // Initial load, etc.
};
/**
 * Initialises visibility metadata for a layer
 * @param {Object} layerData - Layer data
 * @private
 */
function initVisibilityMetadata(layerData) {
    if (!layerData._visibility) {
        layerData._visibility = {
            current: false, // current physical state on the map (true/false)
            logicalState: false, // logical state (button ON/OFF, independent of zoom)
            source: VisibilitySource.SYSTEM, // Last modification source
            userOverride: false, // User has forced a state
            themeOverride: false, // A theme has forced a state
            themeDesired: null, // Visibility desired by the theme (true/false)
            zoomConstrained: false, // Layer is constrained by zoom
        };
    }
}
/**
 * Sets the visibility of a layer with priority management
 *
 * @param {string} layerId - Layer ID
 * @param {boolean} visible - Desired visibility state
 * @param {string} source - Source of the change ('user' | 'theme' | 'zoom' | 'system')
 * @returns {boolean} - true if visibility was changed, false otherwise
 */
VisibilityManager.setVisibility = function (layerId, visible, source) {
    const state = getState$9();
    const Log = getLog();
    const layerData = state.layers.get(layerId);
    if (!layerData) {
        Log.warn("[VisibilityManager] Layer not found:", layerId);
        return false;
    }
    // Initialise metadata if needed
    initVisibilityMetadata(layerData);
    const meta = layerData._visibility;
    // Fast-path for zoom: skip entirely when physical state is already correct.
    // This prevents redundant adapter calls and legend rebuilds on every zoom tick.
    if (source === VisibilitySource.ZOOM && meta.current === visible) {
        return false;
    }
    const oldVisible = meta.current;
    const oldSource = meta.source;
    // Snapshot logical state before flag update to detect user-intent changes.
    const oldLogicalState = meta.logicalState;
    const oldUserOverride = meta.userOverride;
    // Apply priority rules
    const canChange = this._canChangeVisibility(meta, source, visible);
    if (!canChange) {
        Log.debug(`[VisibilityManager] Changement refusé pour ${layerId}: ` +
            `source=${source}, userOverride=${meta.userOverride}, themeOverride=${meta.themeOverride}`);
        return false;
    }
    // Update flags based on the source
    this._updateVisibilityFlags(meta, source, visible);
    // Apply the effective change
    const changed = this._applyVisibilityChange(layerId, layerData, visible);
    // A USER action may change the logical intent without causing a physical map change
    // (e.g. re-showing a layer already on the map, or acting on a shared cluster).
    // We must still fire the event so permalink / other listeners can sync.
    const logicalChanged = source === VisibilitySource.USER &&
        (meta.logicalState !== oldLogicalState || meta.userOverride !== oldUserOverride);
    if (changed) {
        meta.current = visible;
        meta.source = source;
        Log.debug(`[VisibilityManager] ${layerId}: ${oldVisible} ? ${visible} ` +
            `(source: ${oldSource} ? ${source})`);
        // Update legacy flags for compatibility
        layerData.visible = visible;
        layerData.userDisabled = meta.userOverride && !visible;
        layerData.themeHidden = meta.themeOverride && !visible;
        // Notify the legend
        this._notifyLegend(layerId, visible);
        // Emit the event
        this._fireVisibilityEvent(layerId, visible, source);
    }
    else if (logicalChanged) {
        // Physical state unchanged but user changed their intent — sync URL/listeners.
        this._fireVisibilityEvent(layerId, visible, source);
    }
    return changed;
};
/**
 * Checks whether visibility can be changed based on priority rules
 * @param {Object} meta - Visibility metadata
 * @param {string} source - Source of the change
 * @returns {boolean}
 * @private
 */
VisibilityManager._canChangeVisibility = function (meta, source, desiredVisible) {
    // User can always change
    if (source === VisibilitySource.USER) {
        return true;
    }
    // IMPORTANT: Zoom MUST ALWAYS be able to modify the physical display (current)
    // even if userOverride is true. This allows show/hide based on zoom thresholds
    // while keeping logicalState independent.
    if (source === VisibilitySource.ZOOM) {
        return true;
    }
    // If user has set an override, only the user can change the logical state
    if (meta.userOverride) {
        return false;
    }
    // Never re-enable what a theme has explicitly hidden
    if (source === VisibilitySource.ZOOM &&
        meta.themeOverride &&
        meta.themeDesired === false &&
        desiredVisible === true) {
        return false;
    }
    // Themes can override zoom but not the user
    if (source === VisibilitySource.THEME) {
        return true;
    }
    // Default: allow (for 'system' and others)
    return true;
};
/**
 * Updates visibility flags based on the source
 * @param {Object} meta - Visibility metadata
 * @param {string} source - Source of the change
 * @param {boolean} visible - Visibility state
 * @private
 */
VisibilityManager._updateVisibilityFlags = function (meta, source, visible) {
    switch (source) {
        case VisibilitySource.USER:
            meta.userOverride = true;
            meta.themeOverride = false; // Reset theme override
            meta.zoomConstrained = false;
            meta.logicalState = visible; // Update the logical state
            break;
        case VisibilitySource.THEME:
            // Do not override userOverride if already set
            if (!meta.userOverride) {
                meta.themeOverride = true;
                meta.themeDesired = visible;
                meta.zoomConstrained = false;
                meta.logicalState = visible; // Update the logical state
            }
            break;
        case VisibilitySource.ZOOM:
            // Mark zoom constraint (except user override)
            // DO NOT modify logicalState — zoom does not affect logical state
            if (!meta.userOverride) {
                meta.zoomConstrained = true;
            }
            break;
        case VisibilitySource.SYSTEM:
            // Reset all overrides for a clean load
            meta.userOverride = false;
            meta.themeOverride = false;
            meta.themeDesired = null;
            meta.zoomConstrained = false;
            meta.logicalState = visible; // Initialise the logical state
            break;
    }
};
function _syncVisibilityUI(layerId) {
    const GeoLeaf = _g$7.GeoLeaf;
    if (!GeoLeaf)
        return;
    if (GeoLeaf.LayerManager && typeof GeoLeaf.LayerManager.refresh === "function") {
        GeoLeaf.LayerManager.refresh();
    }
    if (GeoLeaf._LabelButtonManager &&
        typeof GeoLeaf._LabelButtonManager.syncImmediate === "function") {
        GeoLeaf._LabelButtonManager.syncImmediate(layerId);
    }
}
/**
 * Physically applies the visibility change (add/remove layer)
 * @param {string} layerId - Layer ID
 * @param {Object} layerData - Layer data
 * @param {boolean} visible - Desired visibility state
 * @returns {boolean} - true if a change was made
 * @private
 */
VisibilityManager._applyVisibilityChange = function (layerId, layerData, visible) {
    const state = getState$9();
    const Log = getLog();
    const adapter = state.adapter || _g$7.GeoLeaf?.Core?.getMap?.();
    if (!adapter) {
        Log.warn("[VisibilityManager] Adapter not available for:", layerId);
        return false;
    }
    try {
        if (visible)
            adapter.showLayer(layerId);
        else
            adapter.hideLayer(layerId);
        _syncVisibilityUI(layerId);
        return true;
    }
    catch (err) {
        Log.error("[VisibilityManager] Visibility error for " + layerId + ":", err);
        return false;
    }
};
function _notifyLabelsModule(layerId, visible) {
    const Labels = _g$7.GeoLeaf && _g$7.GeoLeaf.Labels;
    if (!Labels)
        return;
    if (visible && typeof Labels.refreshLabels === "function") {
        Labels.refreshLabels(layerId);
        return;
    }
    if (!visible && typeof Labels._hideLabelsForLayer === "function") {
        Labels._hideLabelsForLayer(layerId);
    }
}
/**
 * Notifies the Legend module of a visibility change
 * @param {string} layerId - Layer ID
 * @param {boolean} visible - Visibility state
 * @private
 */
VisibilityManager._notifyLegend = function (layerId, visible) {
    const GeoLeaf = _g$7.GeoLeaf;
    if (!GeoLeaf)
        return;
    if (GeoLeaf.Legend && typeof GeoLeaf.Legend.setLayerVisibility === "function") {
        GeoLeaf.Legend.setLayerVisibility(layerId, visible);
    }
    _notifyLabelsModule(layerId, visible);
    if (GeoLeaf._LabelButtonManager &&
        typeof GeoLeaf._LabelButtonManager.syncImmediate === "function") {
        GeoLeaf._LabelButtonManager.syncImmediate(layerId);
    }
};
/**
 * Emits a visibility change event
 * @param {string} layerId - Layer ID
 * @param {boolean} visible - Visibility state
 * @param {string} source - Source of the change
 * @private
 */
VisibilityManager._fireVisibilityEvent = function (layerId, visible, source) {
    const state = getState$9();
    if (!state.map)
        return;
    try {
        state.map.fire("geoleaf:geojson:visibility-changed", {
            layerId: layerId,
            visible: visible,
            source: source,
        });
    }
    catch (_e) {
        // Silent
    }
    // Also dispatch as DOM CustomEvent so cross-module listeners (permalink, filter lazy-loader)
    // can subscribe via document.addEventListener without needing the map instance.
    // Only for non-zoom sources to avoid excessive events during zoom recalculation.
    if (source !== VisibilitySource.ZOOM && typeof document !== "undefined") {
        try {
            document.dispatchEvent(new CustomEvent("geoleaf:geojson:visibility-changed", {
                detail: { layerId: layerId, visible: visible, source: source },
                bubbles: false,
            }));
        }
        catch (_e) {
            // Silent
        }
    }
    // New canonical event for integrators — fires for ALL sources including zoom
    dispatchGeoLeafEvent("geoleaf:layer:toggle", {
        layerId: String(layerId),
        visible: Boolean(visible),
        source: String(source),
    });
};
/**
 * Resets user overrides for a layer
 * Used by themes to regain control
 *
 * @param {string} layerId - Layer ID
 */
VisibilityManager.resetUserOverride = function (layerId) {
    const state = getState$9();
    const layerData = state.layers.get(layerId);
    if (layerData && layerData._visibility) {
        layerData._visibility.userOverride = false;
        getLog().debug(`[VisibilityManager] User override reset for ${layerId}`);
    }
};
/**
 * Resets all user overrides
 * Used by themes during a complete theme change
 */
VisibilityManager.resetAllUserOverrides = function () {
    const state = getState$9();
    let count = 0;
    state.layers.forEach((layerData, _layerId) => {
        if (layerData._visibility && layerData._visibility.userOverride) {
            layerData._visibility.userOverride = false;
            count++;
        }
    });
    if (count > 0) {
        getLog().debug(`[VisibilityManager] ${count} user override(s) reset`);
    }
};
/**
 * Gets the complete visibility state of a layer
 * @param {string} layerId - Layer ID
 * @returns {Object|null} - Visibility metadata or null
 */
VisibilityManager.getVisibilityState = function (layerId) {
    const state = getState$9();
    const layerData = state.layers.get(layerId);
    if (!layerData) {
        return null;
    }
    initVisibilityMetadata(layerData);
    return {
        current: layerData._visibility.current,
        source: layerData._visibility.source,
        userOverride: layerData._visibility.userOverride,
        themeOverride: layerData._visibility.themeOverride,
        zoomConstrained: layerData._visibility.zoomConstrained,
    };
};
/**
 * Exports constants for external use
 */
VisibilityManager.VisibilitySource = VisibilitySource;
/** Exposed for tests where GeoJSONShared is not injected (different module resolution) */
VisibilityManager._getTestState = () => _defaultState$1;
getLog().info("[GeoLeaf._LayerVisibilityManager] Module loaded");

/**
 * GeoLeaf GeoJSON Worker Manager
 * Orchestre le cycle de vie du Web Worker GeoJSON.
 *
 * Features :
 *   - Creation lazy of a Worker unique (singleton)
 *   - Communication postMessage / onmessage
 *   - Fallback transparent vers fetch main-thread si Worker inavailable
 *   - Nettoyage automatic du Worker after un delay d'inactivity
 *
 * @module geojson/worker-manager
 */
/** Delay avant terminaison du Worker inactive (ms) */
const IDLE_TIMEOUT = 30000;
/** Chunk size sent to the Worker */
const DEFAULT_CHUNK_SIZE = 500;
/** Nom du file worker */
const WORKER_FILENAME = "geojson-worker.js";
/**
 * Detects le directory de base du bundle GeoLeaf en scannant les balises <script>.
 * Allows resolve l'URL du Worker relative to the bundle, pas to the page HTML.
 *
 * @returns {string} Base URL se terminant par '/' (ex. "../dist/" ou "/assets/js/")
 * @private
 */
function _detectScriptBase() {
    // Method 1 : document.currentScript (available only pendant l'execution synchrone du script)
    if (typeof document !== "undefined" &&
        document.currentScript &&
        document.currentScript.src) {
        return document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf("/") + 1);
    }
    // Method 2 : scanner les <script> pour trouver geoleaf*.js
    if (typeof document !== "undefined") {
        const scripts = document.getElementsByTagName("script");
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].src || "";
            if (/geoleaf[\w.-]*\.js/i.test(src)) {
                return src.substring(0, src.lastIndexOf("/") + 1);
            }
        }
    }
    // Method 3 : fallback — same directory que la page
    return "";
}
/** Base URL captured when the module loads */
const _scriptBase = _detectScriptBase();
/**
 * STATE internal du manager.
 * @private
 */
const _state = {
    worker: null,
    workerAvailable: true,
    pending: new Map(),
    idleTimer: null,
};
// ─── Helpers ────────────────────────────────────────────────────
/**
 * Tente de create le Worker. Renvoie null si impossible.
 * @returns {Worker|null}
 * @private
 */
function _createWorker() {
    if (!_state.workerAvailable)
        return null;
    if (_state.worker)
        return _state.worker;
    try {
        // Resolve the Worker URL relative to the GeoLeaf script (not the page HTML)
        const workerUrl = _scriptBase + WORKER_FILENAME;
        const worker = new Worker(workerUrl);
        worker.onmessage = _onMessage;
        worker.onerror = _onError;
        _state.worker = worker;
        getLog().debug("[WorkerManager] Web Worker GeoJSON created:", workerUrl);
        return worker;
    }
    catch (err) {
        getLog().warn("[WorkerManager] Unable to create Web Worker, main-thread fallback:", err.message);
        _state.workerAvailable = false;
        return null;
    }
}
/**
 * Reinitializes le timer d'inactivity.
 * @private
 */
function _resetIdleTimer() {
    if (_state.idleTimer)
        clearTimeout(_state.idleTimer);
    _state.idleTimer = setTimeout(() => {
        if (_state.pending.size === 0 && _state.worker) {
            _state.worker.terminate();
            _state.worker = null;
            getLog().debug("[WorkerManager] Worker terminated after inactivity");
        }
    }, IDLE_TIMEOUT);
}
// ─── Worker message handlers ────────────────────────────────────
/**
 * Manager fors messages received from the Worker.
 * @param {MessageEvent} event
 * @private
 */
/* eslint-disable complexity -- message type dispatch */
function _onMessage(event) {
    const msg = event.data;
    if (!msg || !msg.type)
        return;
    const entry = msg.layerId ? _state.pending.get(msg.layerId) : null;
    switch (msg.type) {
        case "chunk":
            if (entry) {
                // Accumuler les features
                if (msg.features && msg.features.length) {
                    entry.features.push(...msg.features);
                }
                // Callback optional par chunk (pour rendu progressif)
                if (typeof entry.onChunk === "function") {
                    entry.onChunk(msg.features, msg.index, msg.total);
                }
            }
            break;
        case "done":
            if (entry) {
                _state.pending.delete(msg.layerId);
                entry.resolve({
                    type: "FeatureCollection",
                    features: entry.features,
                });
                _resetIdleTimer();
            }
            break;
        case "text-done":
            // Perf 6.3.1: GPX text fetch completeed in Worker
            if (entry) {
                _state.pending.delete(msg.layerId);
                entry.resolve(msg.text || "");
                _resetIdleTimer();
            }
            break;
        case "error":
            if (entry) {
                _state.pending.delete(msg.layerId);
                entry.reject(new Error(msg.message));
                _resetIdleTimer();
            }
            else {
                getLog().warn("[WorkerManager] Worker error without layerId:", msg.message);
            }
            break;
        case "pong":
            getLog().debug("[WorkerManager] Worker pong received");
            break;
    }
}
/**
 * Manager d'error globale du Worker.
 * @param {ErrorEvent} err
 * @private
 */
function _onError(err) {
    const details = err.message ||
        err.filename ||
        "unknown (possible 404 on " + _scriptBase + WORKER_FILENAME + ")";
    getLog().error("[WorkerManager] Worker error:", details);
    // Rejeter toutes les requests en cours → fallback main-thread
    _state.pending.forEach(function (entry) {
        entry.reject(new Error("Worker error: " + details));
    });
    _state.pending.clear();
    // Marquer le Worker comme inavailable → prochains appels utiliseront le fallback
    _state.workerAvailable = false;
    if (_state.worker) {
        _state.worker.terminate();
        _state.worker = null;
    }
}
/* eslint-enable complexity */
// ─── Fallback main-thread ───────────────────────────────────────
/**
 * Fallback : fetch + parse sur le thread main.
 *
 * @param {string} url
 * @param {string} layerId
 * @returns {Promise<Object>} FeatureCollection
 * @private
 */
function _mainThreadFetch(url, layerId) {
    const Log = getLog();
    Log.debug("[WorkerManager] Main-thread fallback for:", layerId);
    return fetch(url)
        .then(function (response) {
        if (!response.ok) {
            throw new Error("HTTP " + response.status + " pour " + url);
        }
        return response.json();
    })
        .then(function (data) {
        // Normaliser
        if (data && data.type === "FeatureCollection")
            return data;
        if (data && data.type === "Feature") {
            return { type: "FeatureCollection", features: [data] };
        }
        if (Array.isArray(data)) {
            return { type: "FeatureCollection", features: data };
        }
        return data;
    });
}
// ─── API public ───────────────────────────────────────────────
const WorkerManager = {
    /**
     * Retrieves et parse un GeoJSON via le Web Worker (ou fallback main-thread).
     *
     * @param {string} url - URL du GeoJSON
     * @param {string} layerId - Identifier unique de the layer
     * @param {Object} [options={}]
     * @param {number} [options.chunkSize=500] - Nombre de features par chunk
     * @param {Function} [options.onChunk] - Callback(features[], chunkIndex, totalFeatures)
     * @returns {Promise<Object>} - Resolved with a complete FeatureCollection
     */
    fetchGeoJSON: function (url, layerId, options) {
        options = options || {};
        // Resolve relative URLs to absolute before sending to the Worker.
        // The Worker resolves relative paths against its own location (dist/),
        // not the page URL — so we must pass an absolute URL.
        let absoluteUrl = url;
        if (typeof location !== "undefined" && url && !url.includes("://")) {
            try {
                absoluteUrl = new URL(url, location.href).href;
            }
            catch (_) {
                // keep original url if resolution fails
            }
        }
        const worker = _createWorker();
        if (!worker) {
            return _mainThreadFetch(absoluteUrl, layerId);
        }
        return new Promise(function (resolve, reject) {
            _state.pending.set(layerId, {
                resolve: resolve,
                reject: reject,
                features: [],
                onChunk: options.onChunk || null,
            });
            // Read connector auth headers if @geoleaf/connector is installed
            const _headersHook = globalThis.__GEOLEAF_WORKER_HEADERS_HOOK__;
            const headers = typeof _headersHook === "function" ? _headersHook(absoluteUrl) : undefined;
            worker.postMessage({
                type: "fetch",
                url: absoluteUrl,
                layerId: layerId,
                chunkSize: options.chunkSize || DEFAULT_CHUNK_SIZE,
                headers: headers,
            });
            _resetIdleTimer();
        });
    },
    /**
     * Retrieves the text brut of a URL via le Web Worker (ou fallback main-thread).
     * Perf 6.3.1: Used for GPX files to offload network from the main thread.
     * Note: le parsing DOMParser reste sur le main thread car non available dans tous les Workers.
     *
     * @param {string} url - URL du file text
     * @param {string} layerId - Identifier unique de the layer
     * @returns {Promise<string>} - Resolved with raw text
     */
    fetchText: function (url, layerId) {
        // Resolve relative URLs to absolute (same reason as fetchGeoJSON)
        let absoluteUrl = url;
        if (typeof location !== "undefined" && url && !url.includes("://")) {
            try {
                absoluteUrl = new URL(url, location.href).href;
            }
            catch (_) {
                /* invalid URL, use original */
            }
        }
        const worker = _createWorker();
        if (!worker) {
            // Fallback main-thread
            return fetch(absoluteUrl).then(function (response) {
                if (!response.ok)
                    throw new Error("HTTP " + response.status + " pour " + absoluteUrl);
                return response.text();
            });
        }
        return new Promise(function (resolve, reject) {
            _state.pending.set(layerId, {
                resolve: resolve,
                reject: reject,
                features: [], // unused for text, kept for consistency
                onChunk: null,
            });
            // Read connector auth headers if @geoleaf/connector is installed
            const _headersHook = globalThis.__GEOLEAF_WORKER_HEADERS_HOOK__;
            const headers = typeof _headersHook === "function" ? _headersHook(absoluteUrl) : undefined;
            worker.postMessage({
                type: "fetch-text",
                url: absoluteUrl,
                layerId: layerId,
                headers: headers,
            });
            _resetIdleTimer();
        });
    },
    /**
     * Checks if le Web Worker est available.
     * @returns {boolean}
     */
    isAvailable: function () {
        return _state.workerAvailable && typeof Worker !== "undefined";
    },
    /**
     * Termine le Worker et nettoie the state.
     * Called during application teardown.
     */
    dispose: function () {
        if (_state.idleTimer)
            clearTimeout(_state.idleTimer);
        _state.pending.forEach(function (entry) {
            entry.reject(new Error("WorkerManager disposed"));
        });
        _state.pending.clear();
        if (_state.worker) {
            _state.worker.terminate();
            _state.worker = null;
        }
        getLog().debug("[WorkerManager] Disposed");
    },
};

/**
 * GeoLeaf GeoJSON Module - Layer Configuration Manager
 * Gestion de la configuration et des options des layers
 *
 * @module geojson/layer-config-manager
 */
const _g$6 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const LayerConfigManager = {};
/**
 * Resolves the absolute path of a data file relative to the active profile.
 *
 * @param {string} dataFile - Data file name or path.
 * @param {Object} profile - Active profile (must have an `id` field).
 * @param {string} [layerDirectory] - Layer sub-directory within the profile.
 * @returns {string} Resolved absolute path.
 */
function _resolveProfileBasePath(profile) {
    const Config = _g$6.GeoLeaf && _g$6.GeoLeaf.Config;
    const dataCfg = Config && Config.get ? Config.get("data") : null;
    return {
        profilesBasePath: (dataCfg && dataCfg.profilesBasePath) || "profiles",
        profileId: (dataCfg && dataCfg.activeProfile) || profile.id,
    };
}
LayerConfigManager.resolveDataFilePath = function (dataFile, profile, layerDirectory) {
    const { profilesBasePath, profileId } = _resolveProfileBasePath(profile);
    // Si dataFile commence par ../, on resolves relative to the folder of the profile
    if (dataFile.startsWith("../")) {
        // dataFile = "../raw/file.json" -> "profiles/tourism/raw/file.json"
        const relativePath = dataFile.replace("../", "");
        return `${profilesBasePath}/${profileId}/${relativePath}`;
    }
    // Si dataFile commence par /, c'est un path absolu
    if (dataFile.startsWith("/")) {
        return dataFile;
    }
    // Sinon, relatif au folder de the layer (layers/tourism_poi_all/data/file.json)
    if (layerDirectory) {
        return `${profilesBasePath}/${profileId}/${layerDirectory}/${dataFile}`;
    }
    // Fallback: relatif au folder of the profile
    return `${profilesBasePath}/${profileId}/${dataFile}`;
};
/**
 * Infers the geometry type of a layer from its definition or its GeoJSON features.
 *
 * @param {Object} def - Layer definition (may contain a `geometryType` field).
 * @param {Object} geojsonData - GeoJSON data.
 * @returns {string} Geometry type: `'point'`, `'line'`, `'polygon'`, or `'unknown'`.
 */
LayerConfigManager.inferGeometryType = function (def, geojsonData) {
    if (def && typeof def.geometryType === "string")
        return def.geometryType;
    const features = geojsonData && Array.isArray(geojsonData.features) ? geojsonData.features : [];
    const first = features.find((f) => f && f.geometry && f.geometry.type);
    if (!first)
        return "unknown";
    const geometryType = first.geometry.type.toLowerCase();
    if (geometryType.includes("point"))
        return "point";
    if (geometryType.includes("line"))
        return "line";
    if (geometryType.includes("polygon"))
        return "polygon";
    return "unknown";
};
/**
 * Triggers the Legend module to display the legend for a layer.
 *
 * @param {Object} profile - Active profile.
 * @param {Object} layerDef - Layer definition (must include a `legends` config).
 * @example
 * GeoLeaf._GeoJSONLayerConfig.loadLayerLegend(
 *   { id: 'tourism', basePath: '../profiles/tourism' },
 *   { id: 'poi_all', style: 'par_categorie', legends: { directory: 'legends' } }
 * );
 */
function _buildLegendPath(profile, layerDef, legendsConfig, activeStyle) {
    const legendDirectory = legendsConfig.directory || "legends";
    const legendFile = activeStyle === "default" && legendsConfig.default
        ? legendsConfig.default
        : `${activeStyle}.legend.json`;
    const profileBasePath = profile.basePath || "./profiles/" + profile.id;
    const layerDirectory = layerDef._layerDirectory || "layers/" + layerDef.id;
    return `${profileBasePath}/${layerDirectory}/${legendDirectory}/${legendFile}`;
}
function _invokeLegendModule(layerDef, activeStyle, Log) {
    if (_g$6.GeoLeaf &&
        _g$6.GeoLeaf.Legend &&
        typeof _g$6.GeoLeaf.Legend.loadLayerLegend === "function") {
        try {
            _g$6.GeoLeaf.Legend.loadLayerLegend(layerDef.id, activeStyle, layerDef);
            if (Log)
                Log.info(`[GeoLeaf.GeoJSON] Legend shown for ${layerDef.id} (style: ${activeStyle})`);
        }
        catch (error) {
            if (Log)
                Log.warn(`[GeoLeaf.GeoJSON] Error loading legend: ${error.message}`);
        }
    }
    else {
        if (Log)
            Log.warn("[GeoLeaf.GeoJSON] Legend module not available");
    }
}
LayerConfigManager.loadLayerLegend = function (profile, layerDef) {
    const Log = getLog();
    if (!layerDef) {
        if (Log)
            Log.debug("[GeoLeaf.GeoJSON] No layer definition");
        return;
    }
    const layerConfig = layerDef.legends ? layerDef : null;
    if (!layerConfig || !layerConfig.legends) {
        if (Log)
            Log.debug("[GeoLeaf.GeoJSON] No legend config for this layer");
        return;
    }
    const activeStyle = layerDef.style || "default";
    const legendPath = _buildLegendPath(profile, layerDef, layerConfig.legends, activeStyle);
    if (Log)
        Log.debug(`[GeoLeaf.GeoJSON] Loading legend for style "${activeStyle}": ${legendPath}`);
    _invokeLegendModule(layerDef, activeStyle, Log);
};
/**
 * Loads the default style for a layer from its `styles/*.json` file.
 *
 * @async
 * @param {string} layerId - Layer ID (used for logging).
 * @param {Object} layerDef - Layer definition.
 * @param {Object} layerDef.styles - Styles config.
 * @param {string} layerDef.styles.default - Default style filename.
 * @param {string} layerDef._profileId - Profile ID (internal metadata).
 * @param {string} layerDef._layerDirectory - Layer directory (internal metadata).
 * @returns {Promise<Object>} Parsed style JSON.
 * @throws {Error} When `styles.default` is missing, metadata is absent, or fetch fails.
 * @example
 * const style = await GeoLeaf._GeoJSONLayerConfig.loadDefaultStyle(
 *   'provincia_ar',
 *   { styles: { default: 'default.json' }, _profileId: 'tourism', _layerDirectory: 'layers/provincia_ar' }
 * );
 */
LayerConfigManager.loadDefaultStyle = async function (layerId, layerDef) {
    const Log = getLog();
    if (!layerDef.styles || !layerDef.styles.default) {
        throw new Error("No default style defined");
    }
    const profileId = layerDef._profileId;
    const layerDirectory = layerDef._layerDirectory;
    if (!profileId || !layerDirectory) {
        throw new Error("Missing metadata (profileId or layerDirectory)");
    }
    const { profilesBasePath } = _resolveProfileBasePath({ id: profileId });
    const styleDirectory = layerDef.styles.directory || "styles";
    const styleFile = layerDef.styles.default;
    const stylePath = `${profilesBasePath}/${profileId}/${layerDirectory}/${styleDirectory}/${styleFile}`;
    Log.debug("[GeoLeaf.GeoJSON] Loading default style:", stylePath);
    const response = await fetch(stylePath);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const styleData = await response.json();
    Log.debug("[GeoLeaf.GeoJSON] Style loaded:", styleData);
    return styleData;
};

/**
 * GeoLeaf GeoJSON Module - Popup & Tooltip
 * Gestion des popups et tooltips unifiés
 *
 * @module geojson/popup-tooltip
 */
const _g$5 = typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
        ? window
        : {};
const _defaultState = { map: null };
const getState$8 = () => (GeoJSONShared && GeoJSONShared.state ? GeoJSONShared.state : _defaultState);
let _popupDeps = null;
/**
 * Injects popup/tooltip dependencies (Phase 10-F — service locator pattern).
 * Called once at boot by globals.geojson.ts after GeoLeaf modules are registered.
 */
function setupPopupTooltipDeps(deps) {
    _popupDeps = deps;
}
const PopupTooltip = {};
/**
 * Converts ae feature GeoJSON en format POI for the side panel.
 */
function _firstPropStr(p, keys, fallback) {
    for (const k of keys) {
        if (p[k])
            return p[k];
    }
    return fallback;
}
function _buildFallbackPOI(feature, def) {
    const props = feature.properties || {};
    const p = props;
    const nameKeys = ["NAME", "Name", "name", "TITLE", "Title", "title", "LABEL", "Label", "label"];
    const title = _firstPropStr(p, nameKeys, "Sans titre");
    const geom = feature.geometry;
    const poi = {
        id: p.id ? p.id : "geojson-feature-" + Math.random().toString(36).substr(2, 9),
        title,
        description: p.description ? p.description : p.desc ? p.desc : "",
        properties: { ...props },
        attributes: { source: "geojson", layerId: def.id, layerLabel: def.label, ...props },
    };
    if (geom && geom.coordinates && geom.coordinates.length >= 2) {
        poi.latlng = [geom.coordinates[1], geom.coordinates[0]];
        poi.geometry = geom;
        poi.location = { lat: geom.coordinates[1], lng: geom.coordinates[0] };
    }
    return poi;
}
function _enrichPOI(poi, def) {
    poi.attributes = poi.attributes ? poi.attributes : {};
    poi.attributes.source = "geojson";
    poi.attributes.layerId = def.id;
    poi.attributes.layerLabel = def.label;
    poi._layerConfig = def;
    const Loader = _popupDeps?.getLoader();
    const sidepanelLayout = Loader && Loader.getSidepanelConfig ? Loader.getSidepanelConfig(def) : null;
    if (sidepanelLayout) {
        poi._sidepanelConfig = { detailLayout: sidepanelLayout };
    }
}
PopupTooltip.convertFeatureToPOI = function (feature, def) {
    let poi;
    const Normalizer = _popupDeps?.getNormalizer();
    if (Normalizer && typeof Normalizer.normalizeFromGeoJSON === "function") {
        poi = Normalizer.normalizeFromGeoJSON(feature, def);
    }
    else {
        poi = _buildFallbackPOI(feature, def);
    }
    if (poi)
        _enrichPOI(poi, def);
    return poi;
};
/**
 * Attache un popup unifié compatible with the système POI.
 */
function _getGeoLeaf() {
    return _g$5.GeoLeaf;
}
function _getResolveCategoryDisplay() {
    const m = _getGeoLeaf() && _getGeoLeaf()._POIMarkers;
    return m && typeof m.resolveCategoryDisplay === "function" ? m.resolveCategoryDisplay : null;
}
/** @security Escapes user-provided GeoJSON property values before popup/tooltip rendering. */
function _defaultEscapeHtml(str) {
    if (!str)
        return "";
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}
function _escapeHtml(str) {
    const GeoLeaf = _getGeoLeaf();
    const fn = GeoLeaf && GeoLeaf.Security && typeof GeoLeaf.Security.escapeHtml === "function"
        ? GeoLeaf.Security.escapeHtml
        : _defaultEscapeHtml;
    return fn(str);
}
function _propStr(p, ...keys) {
    for (const k of keys) {
        if (p[k])
            return p[k];
    }
    return "";
}
/** @security Builds popup HTML from external GeoJSON data; all properties escaped via _escapeHtml. */
function _buildFallbackPopupHtml(feature, def) {
    const GeoLeaf = _getGeoLeaf();
    const props = feature.properties ? feature.properties : {};
    const p = props;
    const name = _propStr(p, "name", "label", "title") || "Sans titre";
    const description = _propStr(p, "description", "desc");
    let html = '<div class="gl-geojson-popup">';
    html += '<h3 class="gl-popup-title">' + _escapeHtml(name) + "</h3>";
    if (description)
        html += '<p class="gl-popup-description">' + _escapeHtml(description) + "</p>";
    if (GeoLeaf && GeoLeaf.POI && typeof GeoLeaf.POI.showPoiDetails === "function") {
        html +=
            '<a href="#" class="gl-poi-popup__link" data-layer-id="' +
                def.id +
                '" data-feature-id="' +
                (p.id ? p.id : "") +
                '">Voir d\u00e9tails ?</a>';
    }
    html += "</div>";
    return html;
}
/** @security Builds popup content from external GeoJSON; delegates to ContentBuilder or fallback with escaping. */
function _buildPopupContent(poiData, popupConfig, def, feature) {
    const GeoLeaf = _getGeoLeaf();
    const ContentBuilder = GeoLeaf && GeoLeaf._ContentBuilder ? GeoLeaf._ContentBuilder.Assemblers : null;
    if (ContentBuilder && typeof ContentBuilder.buildPopupHTML === "function") {
        return ContentBuilder.buildPopupHTML(poiData, popupConfig, {
            resolveCategoryDisplay: _getResolveCategoryDisplay(),
        });
    }
    const popupModule = GeoLeaf && GeoLeaf._POIPopup;
    if (popupModule && typeof popupModule.buildQuickPopupContent === "function") {
        return popupModule.buildQuickPopupContent(poiData, _getResolveCategoryDisplay());
    }
    return _buildFallbackPopupHtml(feature, def);
}
function _handleSidePanelClick(e, feature, def) {
    e.preventDefault();
    const GeoLeaf = _getGeoLeaf();
    if (GeoLeaf && GeoLeaf.POI && typeof GeoLeaf.POI.showPoiDetails === "function") {
        GeoLeaf.POI.showPoiDetails(PopupTooltip.convertFeatureToPOI(feature, def));
    }
}
function _bindPopupOpenHandler(layer, feature, def) {
    const Log = getLog();
    layer.on("popupopen", () => {
        layer._geoleafPopupActive = true;
        if (layer.getTooltip && layer.getTooltip()) {
            try {
                if (typeof layer.closeTooltip === "function")
                    layer.closeTooltip();
            }
            catch (err) {
                Log.warn("[GeoJSON] Error closing tooltip:", err);
            }
        }
        const popup = layer.getPopup();
        if (!popup)
            return;
        const popupEl = popup.getElement && popup.getElement();
        if (!popupEl)
            return;
        const link = popupEl.querySelector(".gl-poi-popup__link");
        if (link && !link._geoleafClickBound) {
            link._geoleafClickBound = true;
            link.addEventListener("click", (e) => _handleSidePanelClick(e, feature, def));
        }
    });
}
function _closeLayerTooltip(layer) {
    if (!(layer.getTooltip && layer.getTooltip()))
        return;
    try {
        if (typeof layer.closeTooltip === "function")
            layer.closeTooltip();
        else
            layer.unbindTooltip();
    }
    catch (_err) {
        /* ignore */
    }
}
function _toggleSidePanel(GeoLeaf, poiData) {
    const shared = GeoLeaf._POIShared && GeoLeaf._POIShared.state;
    const current = shared ? shared.currentPoiInPanel : null;
    const curId = current ? current.id : undefined;
    const poiId = poiData ? poiData.id : undefined;
    if (curId && poiId && curId === poiId) {
        if (typeof GeoLeaf.POI.hideSidePanel === "function")
            GeoLeaf.POI.hideSidePanel();
    }
    else {
        GeoLeaf.POI.showPoiDetails(poiData);
    }
}
function _bindNoPopupClickHandler(layer, feature, def) {
    layer.on("click", (e) => {
        if (e && e.originalEvent)
            e.originalEvent.stopPropagation();
        _closeLayerTooltip(layer);
        const GeoLeaf = _getGeoLeaf();
        if (!(GeoLeaf && GeoLeaf.POI && typeof GeoLeaf.POI.showPoiDetails === "function"))
            return;
        _toggleSidePanel(GeoLeaf, PopupTooltip.convertFeatureToPOI(feature, def));
    });
}
function _getPopupConfig(def) {
    const GeoLeaf = _getGeoLeaf();
    const Loader = GeoLeaf && GeoLeaf._GeoJSONLoader;
    try {
        return Loader && Loader.getPopupConfig ? Loader.getPopupConfig(def) : null;
    }
    catch (_e) {
        return null;
    }
}
function _bindPopupCloseHandler(layer) {
    layer.on("popupclose", () => {
        layer._geoleafPopupActive = false;
        const tt = layer.getTooltip && layer.getTooltip();
        if (!(tt && tt.options && tt.options.permanent))
            return;
        setTimeout(() => {
            if (layer.openTooltip && !layer._geoleafPopupActive)
                layer.openTooltip();
        }, 50);
    });
}
PopupTooltip.bindUnifiedPopup = function (feature, layer, def) {
    if (!feature.properties)
        return;
    if (def.interactiveShape === false)
        return;
    const showPopup = typeof def.showPopup === "boolean" ? def.showPopup : true;
    if (!showPopup) {
        _bindNoPopupClickHandler(layer, feature, def);
        return;
    }
    if (layer.getPopup && layer.getPopup())
        return;
    const poiData = PopupTooltip.convertFeatureToPOI(feature, def);
    const popupContent = _buildPopupContent(poiData, _getPopupConfig(def), def, feature);
    if (popupContent)
        layer.bindPopup(popupContent);
    layer._geoleafPopupActive = false;
    _bindPopupOpenHandler(layer, feature, def);
    _bindPopupCloseHandler(layer);
};
/**
 * Attache un tooltip unifi\u00e9 \u00e0 a layer selon sa configuration.
 */
function _getTooltipText(props, def) {
    // If tooltip.fields is configured, resolve the first field by dot-notation path.
    const fields = def?.tooltip?.fields;
    if (Array.isArray(fields) && fields.length > 0 && fields[0].field) {
        const path = fields[0].field;
        const key = path.startsWith("properties.") ? path.slice("properties.".length) : path;
        const val = key.split(".").reduce((o, k) => (o != null ? o[k] : null), props);
        if (val != null && val !== "")
            return String(val);
    }
    // Return "" (falsy) when no recognized title property exists so that the
    // callers' `if (!tooltipText) return` guard correctly skips tooltip creation.
    // Using "Sans titre" as fallback would cause tooltips to appear on every
    // feature, including those with no meaningful label.
    return _firstPropStr(props, ["NAME", "Name", "name", "TITLE", "Title", "title", "LABEL", "Label", "label", "id"], "");
}
function _buildTooltipContent(featureAsPoi, tooltipConfig, tooltipText, fallback) {
    const GeoLeaf = _getGeoLeaf();
    const ContentBuilder = GeoLeaf && GeoLeaf._ContentBuilder ? GeoLeaf._ContentBuilder.Assemblers : null;
    if (ContentBuilder && typeof ContentBuilder.buildTooltipHTML === "function") {
        const content = ContentBuilder.buildTooltipHTML(featureAsPoi, tooltipConfig);
        return content ? content : tooltipText;
    }
    const POIPopup = GeoLeaf && GeoLeaf._POIPopup;
    if (POIPopup && typeof POIPopup.buildTooltipContent === "function") {
        const content = POIPopup.buildTooltipContent(featureAsPoi);
        return content ? content : tooltipText;
    }
    return fallback;
}
function _hideTooltip(layer) {
    if (!layer.getTooltip())
        return;
    try {
        if (typeof layer.closeTooltip === "function")
            layer.closeTooltip();
        else
            layer.unbindTooltip();
    }
    catch (_err) {
        /* ignore */
    }
}
function _showOrUpdateTooltip(layer, content, tooltipMode) {
    if (!layer.getTooltip()) {
        layer.bindTooltip(content, {
            direction: "top",
            offset: [0, -10],
            opacity: 0.9,
            className: "gl-geojson-tooltip",
            permanent: tooltipMode === "always",
        });
        if (tooltipMode === "always" && layer.openTooltip)
            layer.openTooltip();
    }
    else {
        const tooltip = layer.getTooltip();
        if (tooltip && tooltip.setContent)
            tooltip.setContent(content);
    }
}
function _updateTooltipVisibility(ctx) {
    if (!ctx.state.map)
        return;
    if (ctx.layer._geoleafPopupActive)
        return;
    const currentZoom = ctx.state.map.getZoom();
    const content = _buildTooltipContent(ctx.featureAsPoi, ctx.tooltipConfig, ctx.tooltipText, ctx.tooltipText);
    if (currentZoom >= ctx.tooltipMinZoom) {
        _showOrUpdateTooltip(ctx.layer, content, ctx.tooltipMode);
    }
    else {
        _hideTooltip(ctx.layer);
    }
}
PopupTooltip.bindUnifiedTooltip = function (feature, layer, def) {
    const state = getState$8();
    if (!feature.properties || !layer)
        return;
    const tooltipMode = def.tooltipMode ? def.tooltipMode : "hover";
    const tooltipMinZoom = typeof def.tooltipMinZoom === "number" ? def.tooltipMinZoom : 0;
    if (tooltipMode === "never")
        return;
    const props = feature.properties;
    const tooltipText = _getTooltipText(props, def);
    const GeoLeaf = _getGeoLeaf();
    const Loader = GeoLeaf && GeoLeaf._GeoJSONLoader;
    const tooltipConfig = Loader && Loader.getTooltipConfig ? Loader.getTooltipConfig(def) : null;
    const featureAsPoi = PopupTooltip.convertFeatureToPOI(feature, def);
    const ctx = {
        state,
        layer,
        featureAsPoi,
        tooltipConfig,
        tooltipText,
        tooltipMinZoom,
        tooltipMode,
    };
    const updateFn = () => _updateTooltipVisibility(ctx);
    layer._geoleafTooltipUpdate = updateFn;
    layer.on("tooltipopen", () => {
        if (layer._geoleafPopupActive)
            layer.closeTooltip();
    });
    layer.on("add", () => {
        updateFn();
        if (state.map)
            state.map.on("zoomend", updateFn);
    });
    layer.on("remove", () => {
        if (state.map && layer._geoleafTooltipUpdate) {
            state.map.off("zoomend", layer._geoleafTooltipUpdate);
        }
    });
};
// ─── MapLibre interaction helpers ────────────────────────────────────────────
/**
 * Per-map tooltip state. Tracks which tooltip is currently displayed and at
 * which z-index so only the topmost overlapping layer shows a tooltip.
 * WeakMap ensures state is GC'd when the map is destroyed.
 */
const _mapTooltipState = new WeakMap();
function _getTooltipState(nativeMap) {
    let state = _mapTooltipState.get(nativeMap);
    if (!state) {
        state = { popup: null, zIndex: -Infinity };
        _mapTooltipState.set(nativeMap, state);
    }
    return state;
}
/**
 * Returns the sub-layer IDs best suited for interaction events.
 *
 * Prefers `fill` sub-layers (cover the entire polygon surface) over `line`
 * sub-layers (border only), so that mousemove / mouseleave fire anywhere
 * inside the polygon. Falls back gracefully: circle → line → all.
 */
function _interactionSubLayerIds(subLayerIds) {
    const fills = subLayerIds.filter((id) => id.endsWith("-fill"));
    if (fills.length)
        return fills;
    const circles = subLayerIds.filter((id) => id.endsWith("-circle"));
    if (circles.length)
        return circles;
    const lines = subLayerIds.filter((id) => id.endsWith("-line"));
    if (lines.length)
        return lines;
    return subLayerIds;
}
// ─── MapLibre popup binding (Sprint 4) ───────────────────────────────────────
/**
 * Binds click-popup and hover-tooltip interactions for a MapLibre layer.
 *
 * Unlike Leaflet (where popups are bound per-feature on layer objects),
 * MapLibre uses event-driven handlers on the map keyed by layer ID.
 *
 * @param layerId - GeoLeaf layer ID (used to derive sub-layer IDs).
 * @param def - Layer definition (popup/tooltip config).
 * @param nativeMap - The raw `maplibregl.Map` instance.
 * @param subLayerIds - MapLibre sub-layer IDs to bind events on.
 */
function bindMapLibrePopup(layerId, def, nativeMap, subLayerIds) {
    const noInteraction = def.interactiveShape === false;
    const showPopup = typeof def.showPopup === "boolean" ? def.showPopup : true;
    const hasSidepanel = Array.isArray(def.sidepanelFields) && def.sidepanelFields.length > 0;
    // Suppress click when interaction is disabled or when there is nothing to show on click
    const suppressClick = noInteraction || (!showPopup && !hasSidepanel);
    for (const subId of subLayerIds) {
        // Skip non-existent layers (e.g. symbol layer not created)
        if (!nativeMap.getLayer(subId))
            continue;
        // ── Click → popup or side panel ──
        if (!suppressClick) {
            nativeMap.on("click", subId, (e) => {
                if (!e.features || e.features.length === 0)
                    return;
                const feature = e.features[0];
                // Skip cluster features — they have point_count, not real data properties.
                // Cluster clicks are handled separately by bindGeoJSONClusterEvents (zoom in).
                if (feature.properties?.point_count !== undefined)
                    return;
                const geoFeature = {
                    type: "Feature",
                    geometry: feature.geometry,
                    properties: feature.properties ?? {},
                };
                if (!showPopup) {
                    // No popup — open side panel directly
                    const GeoLeaf = _getGeoLeaf();
                    if (GeoLeaf?.POI && typeof GeoLeaf.POI.showPoiDetails === "function") {
                        const poiData = PopupTooltip.convertFeatureToPOI(geoFeature, def);
                        _toggleSidePanel(GeoLeaf, poiData);
                    }
                    return;
                }
                const poiData = PopupTooltip.convertFeatureToPOI(geoFeature, def);
                const popupContent = _buildPopupContent(poiData, _getPopupConfig(def), def, geoFeature);
                if (!popupContent)
                    return;
                // @security — content is sanitised by _buildPopupContent / _escapeHtml
                const popup = _createMapLibrePopup(nativeMap, popupContent, e.lngLat);
                // Bind "Voir détails" side-panel link inside the popup DOM
                if (popup) {
                    const popupEl = popup.getElement?.();
                    if (popupEl) {
                        _bindSidePanelLink(popupEl, geoFeature, def);
                    }
                    else {
                        // Popup DOM may not be ready yet — wait for open event
                        popup.once?.("open", () => {
                            const el = popup.getElement?.();
                            if (el)
                                _bindSidePanelLink(el, geoFeature, def);
                        });
                    }
                }
            });
        }
    }
    // ── Hover → cursor pointer on full shape surface ──
    // Uses fill sub-layer for polygons so the pointer appears anywhere inside,
    // not only on the border. mousemove (not mouseenter) avoids stale state
    // when the cursor crosses between fill and line sub-layers.
    if (!noInteraction) {
        const cursorIds = _interactionSubLayerIds(subLayerIds).filter((id) => nativeMap.getLayer(id));
        for (const cId of cursorIds) {
            nativeMap.on("mousemove", cId, () => {
                nativeMap.getCanvas().style.cursor = "pointer";
            });
            nativeMap.on("mouseleave", cId, () => {
                nativeMap.getCanvas().style.cursor = "";
            });
        }
    }
}
/** Binds click handler on the "Voir détails" link inside a popup DOM element. */
function _bindSidePanelLink(popupEl, feature, def) {
    const link = popupEl.querySelector(".gl-poi-popup__link");
    if (link && !link._geoleafClickBound) {
        link._geoleafClickBound = true;
        link.addEventListener("click", (e) => _handleSidePanelClick(e, feature, def));
    }
}
/** Resolves the maplibregl global (loaded via script tag at runtime). */
function _getMapLibreGL() {
    const g = _g$5;
    return g.maplibregl ?? null;
}
/** Creates and opens a MapLibre popup at the given coordinates. */
function _createMapLibrePopup(nativeMap, htmlContent, lngLat) {
    const ml = _getMapLibreGL();
    if (!ml?.Popup)
        return null;
    const popup = new ml.Popup({ maxWidth: "320px" });
    popup.setLngLat(lngLat).setHTML(htmlContent).addTo(nativeMap);
    return popup;
}
/**
 * Binds hover-tooltip interactions for a MapLibre layer.
 *
 * Tooltips in MapLibre are implemented as popups with `closeOnClick: false`
 * that appear on hover and disappear on mouse leave.
 */
function bindMapLibreTooltip(layerId, def, nativeMap, subLayerIds) {
    const tooltipMode = def.tooltipMode || "hover";
    if (tooltipMode === "never")
        return;
    const tooltipMinZoom = typeof def.tooltipMinZoom === "number" ? def.tooltipMinZoom : 0;
    const layerZIndex = typeof def.zIndex === "number" ? def.zIndex : 0;
    const ml = _getMapLibreGL();
    if (!ml?.Popup)
        return;
    const PopupCtor = ml.Popup;
    // For polygons, bind on fill sub-layer so the tooltip fires on the entire
    // surface, not only on the border (line sub-layer).
    const interactionIds = _interactionSubLayerIds(subLayerIds).filter((id) => nativeMap.getLayer(id));
    for (const subId of interactionIds) {
        // ── mousemove: show / reposition tooltip, z-index priority ──
        nativeMap.on("mousemove", subId, (e) => {
            if (nativeMap.getZoom() < tooltipMinZoom)
                return;
            if (!e.features || e.features.length === 0)
                return;
            const tsState = _getTooltipState(nativeMap);
            // Only the topmost (highest z-index) layer shows a tooltip.
            // Prevents two tooltips when polygons overlap.
            if (layerZIndex < tsState.zIndex)
                return;
            const feature = e.features[0];
            const props = feature.properties ?? {};
            const tooltipText = _getTooltipText(props, def);
            if (!tooltipText)
                return;
            // Already showing this layer's tooltip — just follow the cursor.
            if (tsState.zIndex === layerZIndex && tsState.popup) {
                tsState.popup.setLngLat(e.lngLat);
                return;
            }
            // Replace lower-priority tooltip.
            if (tsState.popup) {
                tsState.popup.remove();
                tsState.popup = null;
            }
            const geoFeature = {
                type: "Feature",
                geometry: feature.geometry,
                properties: props,
            };
            const featureAsPoi = PopupTooltip.convertFeatureToPOI(geoFeature, def);
            const GeoLeaf = _getGeoLeaf();
            const Loader = GeoLeaf && GeoLeaf._GeoJSONLoader;
            const tooltipConfig = Loader?.getTooltipConfig ? Loader.getTooltipConfig(def) : null;
            const content = _buildTooltipContent(featureAsPoi, tooltipConfig, tooltipText, _escapeHtml(tooltipText));
            const popup = new PopupCtor({
                closeButton: false,
                closeOnClick: false,
                className: "gl-geojson-tooltip",
                offset: [0, -10],
            });
            popup.setLngLat(e.lngLat).setHTML(content).addTo(nativeMap);
            tsState.popup = popup;
            tsState.zIndex = layerZIndex;
        });
        // ── mouseleave: only remove when this layer owns the active tooltip ──
        nativeMap.on("mouseleave", subId, () => {
            const tsState = _getTooltipState(nativeMap);
            if (tsState.zIndex === layerZIndex && tsState.popup) {
                tsState.popup.remove();
                tsState.popup = null;
                tsState.zIndex = -Infinity;
            }
        });
    }
}
PopupTooltip.bindMapLibrePopup = bindMapLibrePopup;
PopupTooltip.bindMapLibreTooltip = bindMapLibreTooltip;
PopupTooltip._getTestState = () => _defaultState;

/**
 * GeoLeaf GeoJSON Layer Manager - Store
 * Layer CRUD operations: get, query, remove, z-index
 *
 * @module geojson/layer-manager/store
 */
const _g$4 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const getState$7 = () => GeoJSONShared.state;
const LayerManager$3 = {};
/**
 * Retrieves a layer specific par son ID.
 *
 * @param {string} layerId - ID de the layer
 * @returns {Object|null} - { id, label, layer, visible, config, clusterGroup } ou null
 */
LayerManager$3.getLayerById = function (layerId) {
    const state = getState$7();
    return state.layers.get(layerId) || null;
};
/**
 * Retrieves thes data d'a layer (geojson, geometryType, config).
 * Used by the Themes module to apply styles.
 *
 * @param {string} layerId - ID de the layer
 * @returns {Object|null} - { geojson, geometryType, config } ou null
 */
LayerManager$3.getLayerData = function (layerId) {
    const state = getState$7();
    const layerData = state.layers.get(layerId);
    if (!layerData)
        return null;
    return {
        geojson: layerData.geojson || null,
        features: layerData.features || [],
        geometryType: layerData.geometryType || "unknown",
        config: layerData.config || {},
        layer: layerData.layer,
    };
};
/**
 * Retrieves toutes the layers loadedes.
 *
 * @returns {Array<Object>} - Array de { id, label, visible, type, featureCount }
 *
 * Note: 'visible' returnne the state LOGIQUE de the layer (activatede/deactivatede par l'user ou the theme),
 * pas the state physical sur the map (qui can be hidden par le zoom).
 * This is the state that must be reflected by the ON/OFF toggle button.
 */
LayerManager$3.getAllLayers = function () {
    const state = getState$7();
    const layers = [];
    state.layers.forEach((layerData, id) => {
        // Utiliser logicalState qui est independent du zoom
        const meta = layerData._visibility;
        const logicalVisible = meta && typeof meta.logicalState === "boolean"
            ? meta.logicalState
            : layerData.visible || false;
        layers.push({
            id: id,
            label: layerData.label,
            visible: logicalVisible,
            // Perf 6.1.2: Use cached geometryType instead of O(n) detectLayerType() per call
            type: layerData.geometryType || LayerManager$3.detectLayerType(layerData.layer),
            featureCount: layerData.features
                ? layerData.features.length
                : layerData.layer
                    ? layerData.layer.getLayers().length
                    : 0,
        });
    });
    return layers;
};
/**
 * Detects the type of geometry dominant d'a layer.
 *
 * @param {unknown} layer
 * @returns {string} - "poi", "route", "area", ou "mixed"
 */
LayerManager$3.detectLayerType = function (layer) {
    if (!layer || typeof layer.eachLayer !== "function")
        return "mixed";
    const types = { Point: 0, LineString: 0, Polygon: 0 };
    layer.eachLayer((l) => {
        if (l.feature && l.feature.geometry) {
            const geomType = l.feature.geometry.type;
            if (geomType.includes("Point"))
                types.Point++;
            else if (geomType.includes("LineString"))
                types.LineString++;
            else if (geomType.includes("Polygon"))
                types.Polygon++;
        }
    });
    const max = Math.max(types.Point, types.LineString, types.Polygon);
    if (max === 0)
        return "mixed";
    if (types.Point === max)
        return "poi";
    if (types.LineString === max)
        return "route";
    if (types.Polygon === max)
        return "area";
    return "mixed";
};
/**
 * Removes ae layer.
 *
 * @param {string} layerId - ID de the layer
 */
LayerManager$3.removeLayer = function (layerId) {
    const state = getState$7();
    const Log = getLog();
    const layerData = state.layers.get(layerId);
    if (!layerData) {
        Log.warn("[GeoLeaf.GeoJSON] removeLayer: layer not found:", layerId);
        return;
    }
    // Retirer de the map
    if (layerData.visible) {
        LayerManager$3.hideLayer(layerId);
    }
    // Destroy engine objects via adapter
    const adapter = state.adapter || _g$4.GeoLeaf?.Core?.getMap?.();
    if (adapter && adapter.hasLayer(layerId)) {
        adapter.removeLayer(layerId);
    }
    // Retirer de la Map
    state.layers.delete(layerId);
    // featureCache removed (Sprint 1)
    Log.debug("[GeoLeaf.GeoJSON] Layer removed:", layerId);
};
/**
 * Updates the zIndex d'a layer (ordre d'emstackment sur the map).
 */
function _removeLayerOrCluster(state, layerData) {
    if (layerData.clusterGroup) {
        state.map.removeLayer(layerData.clusterGroup);
    }
    else {
        state.map.removeLayer(layerData.layer);
    }
}
function _addLayerOrCluster(state, layerData) {
    if (layerData.clusterGroup) {
        state.map.addLayer(layerData.clusterGroup);
    }
    else {
        state.map.addLayer(layerData.layer);
    }
}
function _moveLayerToPane(state, layerData, newPaneName) {
    if (!layerData.layer?.options)
        return;
    layerData.layer.options.pane = newPaneName;
    layerData.layer.eachLayer((subLayer) => {
        if (subLayer.options)
            subLayer.options.pane = newPaneName;
        if (subLayer._path?.parentNode) {
            state.map.getPane(newPaneName)?.appendChild(subLayer._path);
        }
    });
    if (layerData.clusterGroup?.options) {
        layerData.clusterGroup.options.pane = newPaneName;
    }
}
LayerManager$3.updateLayerZIndex = function (layerId, newZIndex) {
    const state = getState$7();
    const Log = getLog();
    const layerData = state.layers.get(layerId);
    if (!layerData) {
        Log.warn("[GeoLeaf.GeoJSON] updateLayerZIndex: layer not found:", layerId);
        return false;
    }
    const PaneHelpers = GeoJSONShared.PaneHelpers;
    newZIndex = PaneHelpers.validateZIndex(newZIndex);
    const oldZIndex = layerData.config.zIndex || 0;
    if (oldZIndex === newZIndex) {
        Log.debug("[GeoLeaf.GeoJSON] updateLayerZIndex: identical zIndex, no change:", layerId);
        return true;
    }
    Log.info(`[GeoLeaf.GeoJSON] zIndex change for ${layerId}: ${oldZIndex} → ${newZIndex}`);
    layerData.config.zIndex = newZIndex;
    const VisPool = _g$4.GeoLeaf?._LayerVisibilityManager;
    const visState = VisPool ? VisPool.getVisibilityState(layerId) : null;
    const isVisible = visState ? visState.current : layerData.visible;
    if (!isVisible) {
        Log.debug("[GeoLeaf.GeoJSON] Layer not visible, zIndex updated in config only");
        return true;
    }
    const newPaneName = PaneHelpers.getPaneName(newZIndex);
    const newPane = state.map.getPane(newPaneName);
    if (!newPane) {
        Log.error(`[GeoLeaf.GeoJSON] Pane ${newPaneName} not found`);
        return false;
    }
    try {
        _removeLayerOrCluster(state, layerData);
        _moveLayerToPane(state, layerData, newPaneName);
        _addLayerOrCluster(state, layerData);
        Log.debug(`[GeoLeaf.GeoJSON] Layer ${layerId} moved to pane ${newPaneName}`);
        if (state.map) {
            state.map.fire("geoleaf:geojson:zindex-changed", { layerId, oldZIndex, newZIndex });
        }
        return true;
    }
    catch (error) {
        Log.error(`[GeoLeaf.GeoJSON] Error changing zIndex for ${layerId}:`, error);
        return false;
    }
};

/**
 * GeoLeaf GeoJSON Layer Manager - Visibility
 * Show/hide/toggle layers, zoom-based visibility
 *
 * @module geojson/layer-manager/visibility
 */
const _g$3 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const getState$6 = () => GeoJSONShared.state;
const ScaleUtils = { calculateMapScale, isScaleInRange };
function _normalizeScaleValue(value) {
    if (typeof value !== "number")
        return null;
    return value <= 0 ? null : value;
}
function _resolveBaseVisibility(meta) {
    if (meta && meta.userOverride)
        return meta.logicalState;
    if (meta && meta.themeOverride)
        return meta.themeDesired;
    return true;
}
const LayerManager$2 = {};
/**
 * Displays a layer (rend visible).
 *
 * @param {string} layerId - ID de the layer
 */
/* eslint-disable complexity -- visibility state branchs */
LayerManager$2.showLayer = function (layerId) {
    const state = getState$6();
    const Log = getLog();
    const layerData = state.layers.get(layerId);
    if (!layerData) {
        Log.warn("[GeoLeaf.GeoJSON] showLayer: layer not found:", layerId);
        return;
    }
    // Utiliser le manager for visibility centralized
    const VisibilityManager = _g$3.GeoLeaf && _g$3.GeoLeaf._LayerVisibilityManager;
    if (!VisibilityManager) {
        Log.error("[GeoLeaf.GeoJSON] LayerVisibilityManager not available");
        return;
    }
    const changed = VisibilityManager.setVisibility(layerId, true, VisibilityManager.VisibilitySource.USER);
    // IMPORTANT: Recalculer la visibility physical en fonction du zoom
    // setVisibility met up to date logicalState (button), mais il faut aussi recalculer current
    LayerManager$2.updateLayerVisibilityByZoom();
    // Load the legend if available (only if change was made)
    if (changed) {
        // _loadLayerLegend est defined dans integration.ts sur an object LayerManager separated.
        // After Object.assign in globals.geojson.ts, the method exists on _GeoJSONLayerManager.
        // Resolved via the global rather than the local object to avoid "is not a function".
        const _unifiedMgr = _g$3.GeoLeaf?._GeoJSONLayerManager;
        if (_unifiedMgr && typeof _unifiedMgr._loadLayerLegend === "function") {
            _unifiedMgr._loadLayerLegend(layerId, layerData);
        }
        // Handle les labels au moment of the activation
        if (_g$3.GeoLeaf && _g$3.GeoLeaf.Labels && _g$3.GeoLeaf.Labels.hasLabelConfig(layerId)) {
            // Check si visibleByDefault est true for thes labels
            const visibleByDefault = layerData.currentStyle?.label?.visibleByDefault === true;
            if (visibleByDefault) {
                // Activer et display les labels immediately
                _g$3.GeoLeaf.Labels.enableLabels(layerId, {}, true);
            }
            else if (_g$3.GeoLeaf.Labels.areLabelsEnabled(layerId)) {
                // Sinon, juste refresh si already activateds
                _g$3.GeoLeaf.Labels.refreshLabels(layerId);
            }
        }
        if (_g$3.GeoLeaf && _g$3.GeoLeaf._LabelButtonManager) {
            _g$3.GeoLeaf._LabelButtonManager.syncImmediate(layerId);
        }
        Log.debug("[GeoLeaf.GeoJSON] Layer shown:", layerId);
    }
};
/* eslint-enable complexity */
/**
 * Masque a layer (rend invisible).
 *
 * @param {string} layerId - ID de the layer
 */
LayerManager$2.hideLayer = function (layerId) {
    const state = getState$6();
    const Log = getLog();
    const layerData = state.layers.get(layerId);
    if (!layerData) {
        Log.warn("[GeoLeaf.GeoJSON] hideLayer: layer not found:", layerId);
        return;
    }
    // Utiliser le manager for visibility centralized
    const VisibilityManager = _g$3.GeoLeaf && _g$3.GeoLeaf._LayerVisibilityManager;
    if (!VisibilityManager) {
        Log.error("[GeoLeaf.GeoJSON] LayerVisibilityManager not available");
        return;
    }
    const changed = VisibilityManager.setVisibility(layerId, false, VisibilityManager.VisibilitySource.USER);
    // IMPORTANT: Recalculer la visibility physical (even on hide, to ensure consistency)
    LayerManager$2.updateLayerVisibilityByZoom();
    if (changed) {
        // Masquer les labels et update le button
        if (_g$3.GeoLeaf && _g$3.GeoLeaf.Labels) {
            _g$3.GeoLeaf.Labels.disableLabels(layerId);
        }
        if (_g$3.GeoLeaf && _g$3.GeoLeaf._LabelButtonManager) {
            _g$3.GeoLeaf._LabelButtonManager.syncImmediate(layerId);
        }
        Log.debug("[GeoLeaf.GeoJSON] Layer hidden:", layerId);
    }
};
/**
 * Toggle la visibility d'a layer.
 *
 * @param {string} layerId - ID de the layer
 */
LayerManager$2.toggleLayer = function (layerId) {
    const state = getState$6();
    const Log = getLog();
    const layerData = state.layers.get(layerId);
    if (!layerData) {
        Log.warn("[GeoLeaf.GeoJSON] toggleLayer: layer not found:", layerId);
        return;
    }
    // Obtenir the state current via le manager for visibility
    const VisibilityManager = _g$3.GeoLeaf && _g$3.GeoLeaf._LayerVisibilityManager;
    if (!VisibilityManager) {
        Log.error("[GeoLeaf.GeoJSON] LayerVisibilityManager not available");
        return;
    }
    const visState = VisibilityManager.getVisibilityState(layerId);
    const currentlyVisible = visState ? visState.current : layerData.visible;
    // Toggle
    if (currentlyVisible) {
        LayerManager$2.hideLayer(layerId);
    }
    else {
        LayerManager$2.showLayer(layerId);
    }
};
/**
 * Updates the visibility des layers en fonction de layerScale du style active.
 * Respecte les preferences user (deactivation manuelle ou par theme).
 * Utilise le manager for visibility centralized avec source 'zoom'.
 * Immediate execution for reactivity during zoom (LayerManager.refresh debounce avoids UI jitter).
 */
LayerManager$2.updateLayerVisibilityByZoom = function () {
    const state = getState$6();
    const Log = getLog();
    if (!state.map)
        return;
    const VisibilityManager = _g$3.GeoLeaf && _g$3.GeoLeaf._LayerVisibilityManager;
    if (!VisibilityManager) {
        Log.error("[GeoLeaf.GeoJSON] LayerVisibilityManager non disponible");
        return;
    }
    const currentScale = ScaleUtils && typeof ScaleUtils.calculateMapScale === "function"
        ? ScaleUtils.calculateMapScale(state.map, { logger: Log })
        : 0;
    /* eslint-disable complexity -- per-layer visibility rules */
    state.layers.forEach((layerData, layerId) => {
        const config = layerData.config;
        if (!config)
            return;
        const hasCurrentStyle = !!layerData.currentStyle;
        // Support both new key (zoomConfig) and legacy key (layerScale) for backward compat
        const styleScale = hasCurrentStyle
            ? (layerData.currentStyle.zoomConfig ?? layerData.currentStyle.layerScale)
            : null;
        // Warn when legacy key is used without canonical key
        if (hasCurrentStyle &&
            !layerData.currentStyle.zoomConfig &&
            layerData.currentStyle.layerScale)
            Log?.warn(`[GeoLeaf.GeoJSON] Style for layer "${layerId}" uses deprecated "layerScale" — migrate to "zoomConfig".`);
        if (!styleScale && hasCurrentStyle) {
            if (Log && typeof Log.warn === "function") {
                Log.warn(`[GeoLeaf.GeoJSON] zoomConfig missing for ${layerId}, layer left visible by default`);
            }
        }
        const minScale = _normalizeScaleValue(styleScale && (styleScale.minZoom ?? styleScale.minScale));
        const maxScale = _normalizeScaleValue(styleScale && (styleScale.maxZoom ?? styleScale.maxScale));
        const shouldBeVisibleByScale = ScaleUtils && typeof ScaleUtils.isScaleInRange === "function"
            ? ScaleUtils.isScaleInRange(currentScale, minScale, maxScale, Log)
            : true;
        const baseVisible = _resolveBaseVisibility(layerData._visibility);
        // If the user explicitly chose to keep this layer visible, bypass zoom constraints.
        // MapLibre itself handles "no features at this zoom" via layer minzoom/maxzoom.
        // Respecting userOverride here prevents a race condition where updateLayerVisibilityByZoom()
        // re-hides a layer the user just manually enabled (Bug: layer disappears on re-toggle).
        const meta = layerData._visibility;
        const userForcedVisible = meta?.userOverride === true && meta?.logicalState === true;
        const shouldBeVisible = userForcedVisible ? true : baseVisible && shouldBeVisibleByScale;
        VisibilityManager.setVisibility(layerId, shouldBeVisible, VisibilityManager.VisibilitySource.ZOOM);
    });
    /* eslint-enable complexity */
};
/**
 * Emits an event de changement de visibility.
 *
 * @param {string} layerId
 * @param {boolean} visible
 * @private
 */
LayerManager$2._fireLayerVisibilityEvent = function (layerId, visible) {
    const state = getState$6();
    if (!state.map)
        return;
    try {
        state.map.fire("geoleaf:geojson:visibility-changed", {
            layerId: layerId,
            visible: visible,
        });
    }
    catch (_e) {
        // Silencieux
    }
};
// ─── Zoom event binding ──────────────────────────────────────────────────────
// Recalculate layer visibility on every zoom change (layerScale constraints).
if (typeof document !== "undefined") {
    document.addEventListener("geoleaf:map:zoom", () => {
        LayerManager$2.updateLayerVisibilityByZoom();
    });
}

/**
 * GeoLeaf GeoJSON Layer Manager - Style
 * Style application via MapLibre adapter.
 *
 * @module geojson/layer-manager/style
 */
const _g$2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const getState$5 = () => GeoJSONShared.state;
const LayerManager$1 = {};
/**
 * Applies a style to an existing layer.
 * Used by the Themes module to dynamically change appearance.
 *
 * @param {string} layerId - Layer ID
 * @param {Object} styleConfig - Style configuration { style, styleRules }
 * @returns {boolean} - true if the style was applied successfully
 */
LayerManager$1.setLayerStyle = function (layerId, styleConfig) {
    const state = getState$5();
    const Log = getLog();
    const layerData = state.layers.get(layerId);
    if (!layerData) {
        Log.warn("[GeoLeaf.GeoJSON] setLayerStyle: layer not found:", layerId);
        return false;
    }
    // VT layers — delegate to VectorTiles module
    if (layerData.isVectorTile && _g$2.GeoLeaf && _g$2.GeoLeaf._VectorTiles) {
        _g$2.GeoLeaf._VectorTiles.updateLayerStyle(layerId, styleConfig);
        return true;
    }
    // Delegate to adapter
    const adapter = state.adapter || _g$2.GeoLeaf?.Core?.getMap?.();
    if (adapter && typeof adapter.setLayerStyle === "function") {
        adapter.setLayerStyle(layerId, styleConfig);
        layerData.currentStyle = styleConfig;
        Log.debug("[GeoLeaf.GeoJSON] Style applied:", layerId);
        return true;
    }
    return false;
};

/**
 * GeoLeaf GeoJSON Layer Manager - Integration
 * Layer Manager UI registration, legend loading, populate with all configs
 *
 * @module geojson/layer-manager/integration
 */
const _g$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const getState$4 = () => GeoJSONShared.state;
const LayerManager = {};
function _resolveLegendType(type) {
    if (type === "poi")
        return "circle";
    if (type === "route")
        return "line";
    return "fill";
}
function _resolveLayerColor(layerData) {
    const defaultColor = "#3388ff";
    if (layerData.config.style) {
        return layerData.config.style.fillColor || layerData.config.style.color || defaultColor;
    }
    if (layerData.config.pointStyle)
        return layerData.config.pointStyle.fillColor || defaultColor;
    return defaultColor;
}
function _resolveLayerLabels(layerData) {
    if (layerData.config.labels && layerData.config.labels.enabled) {
        return { hasLabels: true, labelsConfig: layerData.config.labels };
    }
    if (layerData.currentStyle?.label?.enabled) {
        return { hasLabels: true, labelsConfig: { enabled: true } };
    }
    return { hasLabels: false, labelsConfig: null };
}
function _logLayerPreparation(id, layerData, Log) {
    if (!Log)
        return;
    Log.info(`[GeoJSON LayerManager] Preparing layer item ${id}:`, {
        hasConfig: !!layerData.config,
        hasStyles: !!(layerData.config && layerData.config.styles),
        styles: layerData.config ? layerData.config.styles : "NO CONFIG",
        configKeys: layerData.config ? Object.keys(layerData.config).sort() : [],
    });
}
function _processLayerForSection(layerData, id, sectionMap, Log) {
    const sectionId = layerData.config.layerManagerId || "geojson-default";
    if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, { id: sectionId, order: 99, items: [] });
    }
    const type = LayerManager.detectLayerType(layerData.layer);
    const legendType = _resolveLegendType(type);
    const color = _resolveLayerColor(layerData);
    const { hasLabels, labelsConfig } = _resolveLayerLabels(layerData);
    _logLayerPreparation(id, layerData, Log);
    sectionMap.get(sectionId).items.push({
        id: id,
        label: layerData.label,
        type: legendType,
        color: color,
        visible: layerData.visible,
        toggleable: true,
        order: 0,
        zIndex: layerData.config.zIndex || 0,
        themes: layerData.config.themes || null,
        labels: hasLabels ? labelsConfig : null,
        styles: layerData.config.styles || null,
    });
}
/**
 * Registers thes layers dans the module LayerManager.
 */
LayerManager.registerWithLayerManager = function () {
    const state = getState$4();
    const Log = getLog();
    const LMgr = _g$1.GeoLeaf && _g$1.GeoLeaf.LayerManager;
    Log.info(`[GeoLeaf.GeoJSON] registerWithLayerManager() called with ${state.layers.size} layer(s)`);
    if (!LMgr || typeof LMgr._registerGeoJsonLayer !== "function") {
        Log.warn("[GeoLeaf.GeoJSON] Module LayerManager unavailable, no layer manager integration");
        return;
    }
    // Groupr les layers par idSection
    const sectionMap = new Map();
    state.layers.forEach((layerData, id) => {
        _processLayerForSection(layerData, id, sectionMap, Log);
    });
    // Addsr chaque section au manager for layers
    sectionMap.forEach((section) => {
        // Sort items by descending zIndex (high zIndex = on top = displayed above)
        section.items.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
        // Registersr chaque layer in the LayerManager
        section.items.forEach((item) => {
            Log.debug(`[GeoLeaf.GeoJSON] Registering layer "${item.id}" in section "${section.id}"`);
            LMgr._registerGeoJsonLayer(item.id, {
                layerManagerId: section.id,
                label: item.label,
                themes: item.themes,
                styles: item.styles,
                labels: item.labels,
            });
        });
        Log.debug("[GeoLeaf.GeoJSON] Layer section '" +
            section.id +
            "' créée avec " +
            section.items.length +
            " layer(s)");
    });
};
/**
 * Loads the légende d'a layer si available
 * @param {string} layerId - ID de the layer
 * @param {Object} layerData - Données de the layer
 * @private
 */
function _resolveStyleIdFromAvailable(config) {
    if (!config.styles)
        return null;
    if (!Array.isArray(config.styles.available))
        return null;
    const available = config.styles.available;
    const defaultFile = config.styles.default;
    const defaultByFile = defaultFile ? available.find((s) => s.file === defaultFile) : null;
    if (defaultByFile && defaultByFile.id)
        return defaultByFile.id;
    if (available[0] && available[0].id)
        return available[0].id;
    return "default";
}
function _resolveStyleId(layerId, layerData, config) {
    const styleSelector = _g$1.GeoLeaf && _g$1.GeoLeaf._LayerManagerStyleSelector;
    if (styleSelector && typeof styleSelector.getCurrentStyle === "function") {
        const sid = styleSelector.getCurrentStyle(layerId);
        if (sid)
            return sid;
    }
    if (layerData.currentStyleMetadata && layerData.currentStyleMetadata.id) {
        return layerData.currentStyleMetadata.id;
    }
    return _resolveStyleIdFromAvailable(config) || "default";
}
LayerManager._loadLayerLegend = function (layerId, layerData) {
    const config = layerData.config || {};
    const GeoLeaf = _g$1.GeoLeaf;
    if (!GeoLeaf)
        return;
    if (!GeoLeaf.Legend)
        return;
    if (typeof GeoLeaf.Legend.loadLayerLegend !== "function")
        return;
    const styleId = _resolveStyleId(layerId, layerData, config);
    GeoLeaf.Legend.loadLayerLegend(layerId, styleId, config);
};
/**
 * Peuple le LayerManager avec TOUTES les configurations de layers availables.
 * Contrairement — registerWithLayerManager() qui ne montre que the layers chargées (thème active),
 * cette fonction displays TOUTES the layers et met à jour l'état coché based on the thème active.
 *
 * @param {Object} activeThemeConfig - Configuration du thème active (contient list des layers visibles)
 * @returns {void}
 */
function _getActiveThemeLayers(activeThemeConfig) {
    if (!activeThemeConfig)
        return [];
    if (!Array.isArray(activeThemeConfig.layers))
        return [];
    return activeThemeConfig.layers.map((l) => l.id || l);
}
function _triggerLayerManagerUIUpdate(LMgr, Log) {
    if (typeof LMgr._updateContent === "function") {
        Log.debug("[GeoLeaf.GeoJSON] Calling LayerManager._updateContent()");
        LMgr._updateContent();
    }
    else if (typeof LMgr.refresh === "function") {
        Log.debug("[GeoLeaf.GeoJSON] Calling LayerManager.refresh()");
        LMgr.refresh();
    }
}
function _buildPopulateConfigSectionMap(allConfigs, activeThemeLayers) {
    const sectionMap = new Map();
    allConfigs.forEach((config) => {
        const sectionId = config.layerManagerId || "geojson-default";
        if (!sectionMap.has(sectionId)) {
            sectionMap.set(sectionId, { id: sectionId, items: [] });
        }
        const isActive = activeThemeLayers.includes(config.id);
        sectionMap.get(sectionId).items.push({
            id: config.id,
            label: config.label,
            layerManagerId: sectionId,
            themes: config.themes || null,
            isActive: isActive,
            zIndex: config.zIndex || 0,
            styles: config.styles || null,
            labels: config.labels || null,
        });
    });
    return sectionMap;
}
function _registerPopulateSectionMap(sectionMap, LMgr, Log) {
    sectionMap.forEach((section) => {
        section.items.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
        section.items.forEach((item) => {
            Log.debug(`[GeoLeaf.GeoJSON] Registering layer "${item.id}" in section "${section.id}" (active: ${item.isActive})`);
            LMgr._registerGeoJsonLayer(item.id, {
                layerManagerId: section.id,
                label: item.label,
                themes: item.themes,
                checked: item.isActive,
                styles: item.styles,
                labels: item.labels,
            });
        });
        Log.debug(`[GeoLeaf.GeoJSON] Section "${section.id}" populated with ${section.items.length} layer(s)`);
    });
}
LayerManager.populateLayerManagerWithAllConfigs = function (activeThemeConfig) {
    const Log = getLog();
    const LMgr = _g$1.GeoLeaf && _g$1.GeoLeaf.LayerManager;
    if (!LMgr || typeof LMgr._registerGeoJsonLayer !== "function") {
        Log.warn("[GeoLeaf.GeoJSON] populateLayerManagerWithAllConfigs: LayerManager module unavailable");
        return;
    }
    if (!_g$1.GeoLeaf ||
        !_g$1.GeoLeaf._allLayerConfigs ||
        !Array.isArray(_g$1.GeoLeaf._allLayerConfigs)) {
        Log.warn("[GeoLeaf.GeoJSON] populateLayerManagerWithAllConfigs: GeoLeaf._allLayerConfigs unavailable");
        return;
    }
    Log.info(`[GeoLeaf.GeoJSON] Populating LayerManager with ${_g$1.GeoLeaf._allLayerConfigs.length} layer configs...`);
    const activeThemeLayers = _getActiveThemeLayers(activeThemeConfig);
    Log.debug(`[GeoLeaf.GeoJSON] Active layers for theme: ${activeThemeLayers.join(", ")}`);
    const sectionMap = _buildPopulateConfigSectionMap(_g$1.GeoLeaf._allLayerConfigs, activeThemeLayers);
    _registerPopulateSectionMap(sectionMap, LMgr, Log);
    // Load legend data for layers active (visible) in the current theme
    if (typeof LayerManager._loadLayerLegend === "function") {
        _g$1.GeoLeaf._allLayerConfigs.forEach((config) => {
            if (!activeThemeLayers.includes(config.id))
                return;
            LayerManager._loadLayerLegend(config.id, { config });
        });
    }
    Log.info(`[GeoLeaf.GeoJSON] LayerManager populated successfully`);
    _triggerLayerManagerUIUpdate(LMgr, Log);
};

/**
 * GeoLeaf GeoJSON Loader - Config Helpers
 * @module geojson/loader/config-helpers
 */
const Loader$3 = {
    getPopupConfig(def) {
        if (!def)
            return null;
        if (def.popupFields && Array.isArray(def.popupFields))
            return def.popupFields;
        if (def.popup?.fields && Array.isArray(def.popup.fields))
            return def.popup.fields;
        return null;
    },
    getTooltipConfig(def) {
        if (!def)
            return null;
        if (def.tooltipFields && Array.isArray(def.tooltipFields))
            return def.tooltipFields;
        if (def.tooltip?.fields && Array.isArray(def.tooltip.fields))
            return def.tooltip.fields;
        return null;
    },
    getSidepanelConfig(def) {
        if (!def)
            return null;
        if (def.sidepanelFields && Array.isArray(def.sidepanelFields))
            return def.sidepanelFields;
        // Canonical key first (v2.0.0+), then legacy fallback
        if (def.sidepanelConfig?.detailLayout && Array.isArray(def.sidepanelConfig.detailLayout))
            return def.sidepanelConfig.detailLayout;
        if (def.sidepanel?.detailLayout && Array.isArray(def.sidepanel.detailLayout))
            return def.sidepanel.detailLayout;
        return null;
    },
};

/**
 * GeoLeaf GeoJSON Loader - Data
 * Loadsment direct de data GeoJSON (URL ou object JS)
 *
 * @module geojson/loader/data
 */
const getState$3 = () => GeoJSONShared.state;
// ─── Phase 10-F service locator ───────────────────────────────────────────────
let _deps$2 = null;
/**
 * Injects loader dependencies (Phase 10-F — service locator pattern).
 * Called once at boot by globals.geojson.ts after GeoLeaf modules are registered.
 */
function setupDataDeps(deps) {
    _deps$2 = deps;
}
const Loader$2 = {};
function _resolveMergedOptions(state, options) {
    const mergeOptions = _deps$2?.getUtils()?.mergeOptions;
    return mergeOptions
        ? mergeOptions(state.options, options)
        : Object.assign({}, state.options, options);
}
async function _fetchGeoJsonData(url) {
    const FetchHelper = _deps$2?.getUtils()?.FetchHelper;
    if (FetchHelper) {
        return FetchHelper.get(url, { timeout: 20000, retries: 2 });
    }
    const response = await fetch(url);
    if (!response.ok)
        throw new Error("HTTP " + response.status + " pour " + url);
    return response.json();
}
Loader$2.loadUrl = async function (url, options = {}) {
    const state = getState$3();
    const Log = getLog();
    if (!url) {
        Log.warn("[GeoLeaf.GeoJSON] URL GeoJSON missing.");
        return state.geoJsonLayer;
    }
    if (!state.map) {
        Log.error("[GeoLeaf.GeoJSON] Module not initialized. Call GeoLeaf.GeoJSON.init() before loadUrl().");
        return null;
    }
    const mergedOptions = _resolveMergedOptions(state, options);
    try {
        const data = await _fetchGeoJsonData(url);
        Loader$2.addData(data, mergedOptions);
        return state.geoJsonLayer;
    }
    catch (err) {
        Log.error("[GeoLeaf.GeoJSON] Error loading GeoJSON :", err);
        return state.geoJsonLayer;
    }
};
function _resolveAddDataOptions(state, options) {
    const mergedOptions = _resolveMergedOptions(state, options);
    const styleResolver = _deps$2?.getStyleResolver();
    if (styleResolver?.buildLayerOptions) {
        state.geoJsonLayer.options = styleResolver.buildLayerOptions(mergedOptions);
    }
    return mergedOptions;
}
function _filterValidFeatures(geojsonData, Validator, Log) {
    const validationResult = Validator.validateFeatureCollection(geojsonData);
    if (validationResult.errors.length > 0) {
        Log.warn(`[GeoLeaf.GeoJSON] Validation: ${validationResult.errors.length} feature(s) rejected, ${validationResult.validFeatures.length} accepted`);
    }
    if (validationResult.validFeatures.length > 0) {
        if (geojsonData.type === "FeatureCollection") {
            return { type: "FeatureCollection", features: validationResult.validFeatures };
        }
        return validationResult.validFeatures.length === 1
            ? validationResult.validFeatures[0]
            : { type: "FeatureCollection", features: validationResult.validFeatures };
    }
    return null;
}
function _fitBoundsAfterLoad(state, mergedOptions) {
    if (mergedOptions.fitBoundsOnLoad && state.layerGroup) {
        const bounds = state.layerGroup.getBounds();
        if (bounds.isValid()) {
            const fitOptions = {};
            if (typeof mergedOptions.maxZoomOnFit === "number")
                fitOptions.maxZoom = mergedOptions.maxZoomOnFit;
            state.map.fitBounds(bounds, fitOptions);
        }
    }
}
Loader$2.addData = function (geojsonData, options = {}) {
    const state = getState$3();
    const Log = getLog();
    if (!geojsonData) {
        Log.warn("[GeoLeaf.GeoJSON] No GeoJSON data provided to addData().");
        return;
    }
    if (!state.map || !state.geoJsonLayer) {
        Log.error("[GeoLeaf.GeoJSON] Module not initialized. Call GeoLeaf.GeoJSON.init() before addData().");
        return;
    }
    const mergedOptions = _resolveAddDataOptions(state, options);
    let dataToAdd = geojsonData;
    const Validator = _deps$2?.getFeatureValidator();
    if (Validator && typeof Validator.validateFeatureCollection === "function") {
        const filtered = _filterValidFeatures(geojsonData, Validator, Log);
        if (filtered === null) {
            Log.warn("[GeoLeaf.GeoJSON] No valid feature to add after validation");
            return;
        }
        dataToAdd = filtered;
    }
    state.geoJsonLayer.addData(dataToAdd);
    _fitBoundsAfterLoad(state, mergedOptions);
    try {
        state.map.fire("geoleaf:geojson:loaded", {
            data: geojsonData,
            layer: state.geoJsonLayer,
        });
    }
    catch (_e) {
        /* ignore */
    }
};

/**
 * GeoLeaf GeoJSON Loader - Profile
 * Orchestration du loading par profile, batch loading, LayerManager population
 *
 * @module geojson/loader/profile
 */
const getState$2 = () => GeoJSONShared.state;
// ─── Phase 10-F service locator ───────────────────────────────────────────────
let _deps$1 = null;
/**
 * Injects loader dependencies (Phase 10-F — service locator pattern).
 * Called once at boot by globals.geojson.ts after GeoLeaf modules are registered.
 */
function setupProfileDeps(deps) {
    _deps$1 = deps;
}
function _getLayersDef(profile, Config, Log) {
    if (Array.isArray(profile.geojsonLayers))
        return profile.geojsonLayers;
    if (profile.geojson && Array.isArray(profile.geojson.layers))
        return profile.geojson.layers;
    if (Array.isArray(profile.layers))
        return profile.layers;
    if (Config.Profile && typeof Config.Profile.getActiveProfileLayersConfig === "function") {
        const lc = Config.Profile?.getActiveProfileLayersConfig();
        if (Array.isArray(lc)) {
            Log.info("[GeoLeaf.GeoJSON] Using modular profile system - " + lc.length + " layers detected");
            return lc;
        }
    }
    return [];
}
function _resolveLayerUrl(d, profile, self) {
    if (d.url)
        return d.url;
    if (d.dataFile && self._resolveDataFilePath) {
        return self._resolveDataFilePath(d.dataFile, profile, d._layerDirectory || null);
    }
    // Remote GeoJSON URL declared via data.dataUrl (WFS, opendata APIs, etc.)
    const layerData = d.data;
    if (typeof layerData?.dataUrl === "string")
        return layerData.dataUrl;
    // Vector tiles — URL lives in data.vectorTiles; return it so the layer is not
    // skipped. shouldUseVectorTiles() re-resolves it from def.data.vectorTiles inside _loadSingleLayer.
    if (layerData?.vectorTiles && typeof layerData.vectorTiles === "object") {
        const vt = layerData.vectorTiles;
        const vtUrl = (vt.tilesUrl || vt.url);
        if (vtUrl)
            return vtUrl;
    }
    return null;
}
function _applyPopupConfig(nd, d) {
    if (!(d.popup && typeof d.popup === "object"))
        return;
    nd.showPopup = d.popup.enabled !== false;
    if (Array.isArray(d.popup.fields))
        nd.popupFields = d.popup.fields;
    nd.popup = d.popup;
}
function _applyTooltipConfig(nd, d) {
    if (!(d.tooltip && typeof d.tooltip === "object"))
        return;
    nd.showTooltip = d.tooltip.enabled !== false;
    if (Array.isArray(d.tooltip.fields))
        nd.tooltipFields = d.tooltip.fields;
    if (d.tooltip.mode)
        nd.tooltipMode = d.tooltip.mode;
    nd.tooltip = d.tooltip;
}
function _applySidepanelConfig(nd, d) {
    // Canonical key first (v2.0.0+), then legacy fallback
    const cfg = d.sidepanelConfig ?? d.sidepanel;
    if (!(cfg && typeof cfg === "object"))
        return;
    if (Array.isArray(cfg.detailLayout))
        nd.sidepanelFields = cfg.detailLayout;
    nd.sidepanelConfig = cfg;
    nd.sidepanel = cfg; // keep legacy alias populated for backward-compat consumers
}
function _applyClusteringConfig(nd, d) {
    if (!(d.clustering && typeof d.clustering === "object"))
        return;
    nd.clustering = d.clustering.enabled !== false;
    if (typeof d.clustering.maxClusterRadius === "number") {
        nd.maxClusterRadius = d.clustering.maxClusterRadius;
        nd.clusterRadius = d.clustering.maxClusterRadius;
    }
    if (typeof d.clustering.disableClusteringAtZoom === "number")
        nd.disableClusteringAtZoom = d.clustering.disableClusteringAtZoom;
}
function _applyVectorTilesConfig(nd, d) {
    if (d.data &&
        d.data.vectorTiles &&
        typeof d.data.vectorTiles === "object")
        nd.vectorTiles = {
            ...d.data.vectorTiles,
        };
    if (d.vectorTiles && typeof d.vectorTiles === "object")
        nd.vectorTiles = { ...d.vectorTiles };
    // Normalize tilesUrl → url so shouldUseVectorTiles() finds a single key
    const vt = nd.vectorTiles;
    if (vt && !vt.url && vt.tilesUrl)
        vt.url = vt.tilesUrl;
}
function _buildNormalizedDef(d, profile, layerUrl) {
    const nd = { ...d, url: layerUrl };
    nd._profileId = profile.id;
    nd._layerDirectory = d._layerDirectory || null;
    _applyPopupConfig(nd, d);
    _applyTooltipConfig(nd, d);
    _applySidepanelConfig(nd, d);
    if (d.clustering && typeof d.clustering === "object")
        _applyClusteringConfig(nd, d);
    if (d.search && typeof d.search === "object")
        nd.search = d.search;
    if (d.table && typeof d.table === "object")
        nd.table = d.table;
    _applyVectorTilesConfig(nd, d);
    return nd;
}
function _registerLayerManager(loadedLayers) {
    if (loadedLayers.length > 0) {
        _deps$1?.getLayerManager()?.registerWithLayerManager();
    }
}
function _fitBoundsIfNeeded(baseOptions, state, Log) {
    if (!(baseOptions.fitBoundsOnLoad !== false && state.map && state.layerGroup))
        return;
    const bounds = state.layerGroup.getBounds();
    if (!bounds.isValid())
        return;
    const fitOptions = {};
    if (typeof baseOptions.maxZoomOnFit === "number")
        fitOptions.maxZoom = baseOptions.maxZoomOnFit;
    state.map.fitBounds(bounds, fitOptions);
    Log.debug("[GeoLeaf.GeoJSON] Map bounds fitted to GeoJSON layers");
    const onMoveEnd = function () {
        state.map.off("moveend", onMoveEnd);
        try {
            document.dispatchEvent(new CustomEvent("geoleaf:fitbounds:complete", { detail: { bounds } }));
        }
        catch (_e) {
            /* ignore */
        }
    };
    state.map.on("moveend", onMoveEnd);
}
function _resolveDefaultThemeId(themesData) {
    const cfg = themesData && themesData.config;
    return (cfg && cfg.defautTheme) || themesData?.defaultTheme || null;
}
function _resolveStyleLabels(layer) {
    return {
        styles: layer.config && layer.config.styles ? layer.config.styles : layer.styles || null,
        labels: layer.config && layer.config.labels ? layer.config.labels : layer.labels || null,
    };
}
function _buildLayerDefParams(d, profile, state, layerUrl) {
    const normalizedDef = _buildNormalizedDef(d, profile, layerUrl);
    const layerId = d.id || "geojson-layer-" + state.layerIdCounter++;
    const layerLabel = d.label || layerId;
    return { normalizedDef, layerId, layerLabel };
}
async function _processLayerDef(def, index, profile, state, self, baseOptions, Log) {
    if (!def || typeof def !== "object") {
        Log.warn("[GeoLeaf.GeoJSON] Invalid profile GeoJSON descriptor, ignored :", {
            index,
            def,
        });
        return null;
    }
    const d = def;
    if (typeof d.active === "boolean" && d.active === false) {
        Log.debug("[GeoLeaf.GeoJSON] Layer disabled (active: false), skipped :", d.id);
        return null;
    }
    const layerUrl = _resolveLayerUrl(d, profile, self);
    if (!layerUrl) {
        Log.warn("[GeoLeaf.GeoJSON] GeoJSON descriptor without URL or dataFile, ignored :", {
            index,
            id: d.id,
            label: d.label,
        });
        return null;
    }
    const params = _buildLayerDefParams(d, profile, state, layerUrl);
    const { normalizedDef, layerId, layerLabel } = params;
    const debugLoad = { profileId: profile.id, layerId, url: layerUrl };
    Log.debug("[GeoLeaf.GeoJSON] Loading GeoJSON layer :", debugLoad);
    try {
        const loadLayer = _deps$1?.getLoader()?._loadSingleLayer;
        return (await loadLayer?.(layerId, layerLabel, normalizedDef, baseOptions)) ?? null;
    }
    catch (err) {
        Log.error("[GeoLeaf.GeoJSON] Failed to load layer :", {
            layerId,
            url: layerUrl,
            error: err,
        });
        return null;
    }
}
const Loader$1 = {};
function _splitTasksByTheme(layersDef, profile, state, self, baseOptions, Log) {
    const tasks = layersDef.map((def, index) => async () => _processLayerDef(def, index, profile, state, self, baseOptions, Log));
    const defaultThemeLayerIds = self._getDefaultThemeLayerIds(profile);
    const immediateTasks = [];
    const deferredTasks = [];
    layersDef.forEach((def, index) => {
        const d = def;
        if (d && d.id && defaultThemeLayerIds.has(d.id))
            immediateTasks.push(tasks[index]);
        else
            deferredTasks.push(tasks[index]);
    });
    return { immediateTasks, deferredTasks };
}
function _scheduleDeferredLayers(deferredTasks, self, state, Log) {
    self._loadLayersInIdle(deferredTasks)
        .then((loadedDeferred) => {
        const loadedDeferredFiltered = loadedDeferred.filter(Boolean);
        Log.info("[GeoLeaf.GeoJSON] Phase 2 : " +
            loadedDeferredFiltered.length +
            " deferred layer(s) loaded in background");
        _registerLayerManager(loadedDeferredFiltered);
        try {
            state.map.fire("geoleaf:geojson:deferred-layers-loaded", {
                count: loadedDeferredFiltered.length,
                layers: loadedDeferredFiltered.map((l) => ({ id: l.id, label: l.label })),
            });
        }
        catch (_e) {
            /* ignore */
        }
    })
        .catch((err) => Log.error("[GeoLeaf.GeoJSON] Error loading deferred layers :", err));
}
function _handlePhase1Loaded(loadedLayers, deferredTasks, baseOptions, state, self, Log) {
    Log.info("[GeoLeaf.GeoJSON] Phase 1 : " + loadedLayers.length + " layer(s) from default theme loaded");
    _registerLayerManager(loadedLayers);
    _fitBoundsIfNeeded(baseOptions, state, Log);
    try {
        state.map.fire("geoleaf:geojson:layers-loaded", {
            count: loadedLayers.length,
            layers: loadedLayers.map((l) => ({
                id: l.id,
                label: l.label,
            })),
        });
    }
    catch (_e) {
        /* ignore */
    }
    try {
        document.dispatchEvent(new CustomEvent("geoleaf:layers:initial-loaded", {
            detail: { count: loadedLayers.length, deferred: deferredTasks.length },
        }));
    }
    catch (_e) {
        /* ignore */
    }
    if (deferredTasks.length > 0)
        _scheduleDeferredLayers(deferredTasks, self, state, Log);
    return loadedLayers;
}
function _warnLayerCount(layersDef, Log) {
    if (layersDef.length > 50)
        Log.warn("[GeoLeaf.GeoJSON] Many GeoJSON layers detected (" +
            layersDef.length +
            "). This may impact performance.");
    else if (layersDef.length > 20)
        Log.info("[GeoLeaf.GeoJSON] " +
            layersDef.length +
            " GeoJSON layers detected. Rich profile detected.");
}
Loader$1.loadFromActiveProfile = function (options = {}) {
    const state = getState$2();
    const Log = getLog();
    const Config = _deps$1?.getConfig();
    if (!Config || typeof Config.getActiveProfile !== "function") {
        Log.warn("[GeoLeaf.GeoJSON] Config module or Config.getActiveProfile() not available; GeoJSON profile loading impossible.");
        return Promise.resolve([]);
    }
    const profile = Config.getActiveProfile();
    if (!profile || typeof profile !== "object") {
        Log.warn("[GeoLeaf.GeoJSON] No active profile or invalid profile; no GeoJSON loaded.");
        return Promise.resolve([]);
    }
    const layersDef = _getLayersDef(profile, Config, Log);
    if (!layersDef.length) {
        Log.info("[GeoLeaf.GeoJSON] No geojsonLayers / geojson.layers / layers block defined in active profile; nothing to load.");
        return Promise.resolve([]);
    }
    _warnLayerCount(layersDef, Log);
    const baseOptions = options || {};
    const batchSize = 3;
    const batchDelay = 200;
    const self = this;
    const { immediateTasks, deferredTasks } = _splitTasksByTheme(layersDef, profile, state, self, baseOptions, Log);
    Log.info(`[GeoLeaf.GeoJSON] Smart loading: ${immediateTasks.length} immediate(s) (default theme), ${deferredTasks.length} deferred`);
    const handleLoaded = (layers) => _handlePhase1Loaded(layers.filter(Boolean), deferredTasks, baseOptions, state, self, Log);
    return self._loadLayersByBatch(immediateTasks, batchSize, batchDelay).then(handleLoaded);
};
Loader$1._loadLayersByBatch = async function (tasks, batchSize = 3, delayMs = 200) {
    const results = [];
    const Log = getLog();
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        const batchStart = Date.now();
        const batchResults = await Promise.all(batch.map((fn) => fn()));
        results.push(...batchResults);
        Log.info(`[GeoLeaf.GeoJSON] Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tasks.length / batchSize)} loaded in ${Date.now() - batchStart} ms`);
        if (i + batchSize < tasks.length && delayMs > 0)
            await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return results;
};
Loader$1._getDefaultThemeLayerIds = function (profile) {
    try {
        if (!profile || !profile.themes)
            return new Set();
        const themesData = profile.themes;
        const defaultThemeId = _resolveDefaultThemeId(themesData);
        if (!defaultThemeId || !Array.isArray(themesData.themes))
            return new Set();
        const defaultTheme = themesData.themes.find((t) => t.id === defaultThemeId);
        if (!defaultTheme || !Array.isArray(defaultTheme.layers))
            return new Set();
        return new Set(defaultTheme.layers
            .filter((l) => l.visible !== false)
            .map((l) => l.id));
    }
    catch (_e) {
        return new Set();
    }
};
Loader$1._loadLayersInIdle = function (tasks, batchSize = 2) {
    const Log = getLog();
    return new Promise((resolve) => {
        const results = [];
        let index = 0;
        const schedule = typeof requestIdleCallback === "function"
            ? (cb) => requestIdleCallback(cb, { timeout: 3000 })
            : (cb) => setTimeout(cb, 60);
        const processNext = () => {
            if (index >= tasks.length) {
                resolve(results);
                return;
            }
            schedule(async () => {
                const batch = tasks.slice(index, index + batchSize);
                const batchResults = await Promise.all(batch.map((fn) => fn()));
                results.push(...batchResults);
                Log.debug(`[GeoLeaf.GeoJSON] Idle: batch ${Math.floor(index / batchSize) + 1}/${Math.ceil(tasks.length / batchSize)} (${results.length}/${tasks.length} processed)`);
                index += batchSize;
                processNext();
            });
        };
        processNext();
    });
};
Loader$1.loadAllLayersConfigsForLayerManager = async function (profile) {
    const Log = getLog();
    if (!profile || !profile.layers || !Array.isArray(profile.layers)) {
        Log.warn("[GeoLeaf.GeoJSON] loadAllLayersConfigsForLayerManager: No layers in profile");
        return [];
    }
    const layers = profile.layers;
    Log.info(`[GeoLeaf.GeoJSON] Preparing ${layers.length} layer configurations for LayerManager...`);
    const allConfigs = layers.map((layer) => {
        const { styles, labels } = _resolveStyleLabels(layer);
        return {
            id: layer.id,
            label: layer.label,
            layerManagerId: layer.layerManagerId || "geojson-default",
            configFile: layer.configFile,
            zIndex: (layer.config && layer.config.zIndex) || 0,
            themes: (layer.config && layer.config.themes) || null,
            styles,
            labels,
        };
    });
    Log.info("[GeoLeaf.GeoJSON] " + allConfigs.length + " configurations ready for LayerManager");
    _deps$1?.setAllLayerConfigs(allConfigs);
    return allConfigs;
};

/**
 * GeoLeaf OGC API Features Loader
 *
 * Fetches GeoJSON features from an OGC API Features endpoint with support for:
 * - Automatic pagination via `next` link relations
 * - Bounding-box (`bbox`) query filtering
 * - Hard `maxFeatures` cap (memory anti-DoS)
 * - Cooperative cancellation via `AbortSignal`
 * - WKT geometry fallback (detects string geometry → converts via wktToGeoJSON)
 * - Auto-refresh on map `moveend` events with debouncing
 *
 * @module built-in/geojson/loader/ogc-api-loader
 */
// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_MAX_FEATURES = 10_000;
const DEFAULT_LIMIT = 1_000;
const DEFAULT_DEBOUNCE_MS = 300;
// ─── Helpers ──────────────────────────────────────────────────────────────────
function _buildItemsUrl(config) {
    let base = config.url.trim().replace(/\/$/, "");
    if (config.collectionId && !base.endsWith("/items")) {
        base = `${base}/collections/${config.collectionId}/items`;
    }
    return base;
}
function _buildRequestUrl(base, config, bbox, offset) {
    // Use URL constructor to correctly merge any existing query params in base
    const url = new URL(base);
    url.searchParams.set("f", "json");
    const limit = config.limit ?? DEFAULT_LIMIT;
    url.searchParams.set("limit", String(limit));
    const effectiveBbox = bbox ?? config.bbox;
    if (effectiveBbox) {
        url.searchParams.set("bbox", effectiveBbox.join(","));
    }
    return url.toString();
}
function _extractNextUrl(response) {
    if (!Array.isArray(response.links))
        return null;
    const next = response.links.find((l) => l.rel === "next" && typeof l.href === "string" && l.href.length > 0);
    return next ? next.href : null;
}
/**
 * Resolves WKT string geometries in a GeoJSON feature to proper GeoJSON geometry objects.
 * Some OGC API Features implementations return WKT strings instead of GeoJSON geometry.
 */
function _resolveWktGeometry(features) {
    return features.map((rawFeature) => {
        const f = rawFeature;
        if (typeof f.geometry === "string") {
            const converted = wktToGeoJSON(f.geometry);
            return { ...f, geometry: converted };
        }
        return f;
    });
}
/**
 * Validates that `data` is an OGC API Features-compatible response object.
 */
function _validateOgcResponse(data) {
    if (!data || typeof data !== "object")
        return false;
    const d = data;
    if (d["type"] !== "FeatureCollection")
        return false;
    if (d["features"] !== undefined && !Array.isArray(d["features"]))
        return false;
    return true;
}
// ─── Core fetch function ──────────────────────────────────────────────────────
/**
 * Fetches and validates a single page from an OGC API Features endpoint.
 * @returns The validated OGC response, or `null` if the request was aborted or the URL is invalid.
 * @throws Error on network failure or malformed response.
 * @internal
 */
async function _fetchPage(url, signal, headers) {
    const Log = getLog();
    const safeUrl = validateUrl(url);
    if (!safeUrl) {
        Log.warn("[OgcApiLoader] Skipping invalid URL:", url.substring(0, 100));
        return null;
    }
    let response;
    try {
        response = await fetch(safeUrl, { signal, headers });
    }
    catch (err) {
        if (err.name === "AbortError") {
            Log.info("[OgcApiLoader] Fetch aborted by signal");
            return null;
        }
        throw new Error(`[OgcApiLoader] Network error fetching "${safeUrl}": ${err.message}`);
    }
    if (!response.ok) {
        throw new Error(`[OgcApiLoader] HTTP ${response.status} from "${safeUrl}"`);
    }
    let data;
    try {
        data = await response.json();
    }
    catch (err) {
        throw new Error(`[OgcApiLoader] Failed to parse JSON response: ${err.message}`);
    }
    if (!_validateOgcResponse(data)) {
        throw new Error(`[OgcApiLoader] Response is not a valid FeatureCollection (type="${data?.type}")`);
    }
    return data;
}
/**
 * Fetches all features from an OGC API Features endpoint, following `next` pagination links.
 *
 * Security controls applied:
 * - URL validated via `validateUrl()` before any network request
 * - All requests carry the provided `AbortSignal` for cooperative cancellation
 * - `maxFeatures` limit enforced to prevent memory exhaustion
 * - Response `type` field validated before data consumption
 *
 * @param config - OGC API source configuration.
 * @param signal - AbortSignal for cooperative cancellation.
 * @param bbox - Override bounding box (used by autoRefresh to inject viewport bbox).
 * @returns A GeoJSON FeatureCollection.
 * @throws Error if the URL is invalid, the network request fails, or the response is malformed.
 */
async function fetchOgcApiFeatures(config, signal, bbox) {
    const Log = getLog();
    const maxFeatures = config.maxFeatures ?? DEFAULT_MAX_FEATURES;
    const validatedUrl = validateUrl(config.url);
    if (!validatedUrl) {
        throw new Error(`[OgcApiLoader] Invalid or disallowed URL: "${config.url}"`);
    }
    const baseItemsUrl = _buildItemsUrl(config);
    const accumulated = [];
    let nextUrl = _buildRequestUrl(baseItemsUrl, config, bbox);
    const headers = config.headers ?? {};
    while (nextUrl !== null) {
        if (signal?.aborted) {
            Log.info("[OgcApiLoader] Request aborted");
            break;
        }
        const page = await _fetchPage(nextUrl, signal, headers);
        if (!page)
            break;
        const resolved = _resolveWktGeometry(page.features ?? []);
        accumulated.push(...resolved);
        Log.debug(`[OgcApiLoader] Page loaded: ${resolved.length} features (total: ${accumulated.length})`);
        if (accumulated.length >= maxFeatures) {
            Log.warn(`[OgcApiLoader] maxFeatures limit reached (${maxFeatures}). Stopping pagination.`);
            break;
        }
        nextUrl = _extractNextUrl(page);
    }
    return { type: "FeatureCollection", features: accumulated };
}
// ─── Auto-refresh ─────────────────────────────────────────────────────────────
/**
 * Registers a `moveend` listener on the map to re-fetch OGC features when
 * the viewport changes. The listener is debounced to avoid flooding the server.
 *
 * @param map - MapLibre map instance (minimal interface).
 * @param config - OGC API source configuration.
 * @param reloadFn - Callback invoked with the current viewport bbox on each refresh.
 * @returns A cleanup function that removes the listener. Call it on layer removal.
 */
function setupAutoRefresh(map, config, reloadFn) {
    const Log = getLog();
    const ms = config.autoRefreshDebounce ?? DEFAULT_DEBOUNCE_MS;
    const handler = debounce(() => {
        const bounds = map.getBounds?.();
        if (!bounds)
            return;
        const bbox = [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
        ];
        Log.debug("[OgcApiLoader] autoRefresh triggered, bbox:", bbox);
        reloadFn(bbox);
    }, ms);
    map.on("moveend", handler);
    return () => map.off("moveend", handler);
}

/**
 * GeoLeaf GeoJSON Loader - Single Layer
 * Pipeline complete de loading d'a layer individuelle
 * Sprint 7 : Web Worker fetch+parse + chunked addData via requestIdleCallback
 * Sprint 8 : Vector tiles — early-exit to VectorTiles module when configured
 *
 * @module geojson/loader/single-layer
 */
const getState$1 = () => GeoJSONShared.state;
// ─── Phase 10-F service locator ───────────────────────────────────────────────
let _deps = null;
/**
 * Injects loader dependencies (Phase 10-F — service locator pattern).
 * Called once at boot by globals.geojson.ts after GeoLeaf modules are registered.
 */
function setupSingleLayerDeps(deps) {
    _deps = deps;
}
const getVectorTiles = () => _deps?.getVectorTiles();
// ─── Symbol ID injection for point layers with showIconsOnMap ─────────────────
/** Resolves a MapLibre symbol image ID from a GeoJSON feature's properties. */
function _resolveSymbolIdForFeature(props) {
    const config = _deps?.getConfig();
    if (!config)
        return null;
    const categoriesConfig = config.getCategories?.() ?? {};
    const iconsConfig = config.getIconsConfig?.() ?? null;
    if (!iconsConfig || iconsConfig.showOnMap === false)
        return null;
    const categoryId = props?.categoryId ?? props?.category;
    if (!categoryId)
        return null;
    const id = String(categoryId);
    const upper = id.toUpperCase();
    const lower = id.toLowerCase();
    let catKey = null;
    if (categoriesConfig[id])
        catKey = id;
    else if (categoriesConfig[upper])
        catKey = upper;
    else
        catKey =
            Object.keys(categoriesConfig).find((k) => k.toLowerCase() === lower) ?? null;
    if (!catKey)
        return null;
    const cat = categoriesConfig[catKey];
    const subId = props?.subcategoryId ?? props?.subCategoryId ?? props?.sub_category;
    let iconId = null;
    if (subId && cat?.subcategories) {
        const sl = String(subId).toLowerCase();
        const sub = cat.subcategories[subId] ||
            cat.subcategories[String(subId).toUpperCase()] ||
            cat.subcategories[sl];
        iconId = sub?.icon ?? sub?.iconId ?? cat?.icon ?? cat?.iconId ?? null;
    }
    else {
        iconId = cat?.icon ?? cat?.iconId ?? null;
    }
    if (!iconId)
        return null;
    return (iconsConfig.symbolPrefix ?? "") + iconId;
}
/** Adds a `symbolId` property to Point/MultiPoint features that have a recognised category. */
function _injectSymbolIds(geojsonData) {
    if (!Array.isArray(geojsonData.features))
        return;
    for (const rawFeature of geojsonData.features) {
        const feature = rawFeature;
        const geomType = feature?.geometry?.type;
        if (geomType !== "Point" && geomType !== "MultiPoint")
            continue;
        const symbolId = _resolveSymbolIdForFeature(feature.properties ?? null);
        if (symbolId) {
            if (!feature.properties)
                feature.properties = {};
            feature.properties.symbolId = symbolId;
        }
    }
}
function _getDataPromise(fromCache, useWorker, def, WorkerMgr, layerId) {
    if (fromCache)
        return Promise.resolve(def._cachedData);
    if (useWorker && WorkerMgr)
        return WorkerMgr.fetchGeoJSON(def.url, layerId);
    return fetch(def.url).then((response) => {
        if (!response.ok)
            throw new Error("HTTP " + response.status + " pour " + def.url);
        return response.json();
    });
}
function _convertRawData(rawData, DataConverter) {
    return DataConverter
        ? DataConverter.autoConvert(rawData)
        : rawData;
}
function _notifyStyleFail(layerLabel) {
    const notify = _deps?.getNotifications();
    if (notify && typeof notify.warning === "function") {
        notify.warning(`Default style not found for « ${layerLabel} ». Displaying with neutral style.`);
    }
}
function _applyPreloadedStyle(def, psd) {
    const resolvedDefault = psd.defaultStyle || psd.style;
    if (resolvedDefault)
        def.style = Object.assign({}, def.style || {}, resolvedDefault);
    if (Array.isArray(psd.styleRules) && psd.styleRules.length)
        def.styleRules = psd.styleRules;
}
async function _preloadStyle(def, layerId, layerLabel, Log) {
    if (!(def.styles && def.styles.default))
        return null;
    try {
        const psd = await _deps?.getLayerConfig()?.loadDefaultStyle(layerId, def);
        if (psd) {
            _applyPreloadedStyle(def, psd);
            Log.debug("[GeoLeaf.GeoJSON] Style preloaded for:", layerId);
        }
        return psd;
    }
    catch (err) {
        Log.warn("[GeoLeaf.GeoJSON] Failed to preload style for:", layerId, err.message);
        _notifyStyleFail(layerLabel);
        return null;
    }
}
const Loader = {};
async function _doLoadSingleLayerMapLibre(rawData, fromCache, def, layerId, layerLabel, state, Log) {
    if (fromCache)
        delete def._cachedData;
    const DataConverter = _deps?.getDataConverter();
    const geojsonData = _convertRawData(rawData, DataConverter);
    // Inject symbolId into Point features for SVG icon rendering
    if (def.showIconsOnMap)
        _injectSymbolIds(geojsonData);
    const features = Array.isArray(geojsonData.features) ? geojsonData.features : [];
    Log.debug("[GeoLeaf.GeoJSON] MapLibre layer data converted", {
        layerId,
        features: features.length,
    });
    // Preload style
    const preloadedStyleData = await _preloadStyle(def, layerId, layerLabel, Log);
    // Resolve adapter and add source+layers via IMapAdapter
    const adapter = (state.adapter || _deps?.getCore()?.getMap?.());
    if (!adapter)
        throw new Error("[GeoLeaf.GeoJSON] MapLibre adapter not available");
    const zIndex = typeof def.zIndex === "number" ? def.zIndex : 0;
    const adapterOptions = {
        visible: true,
        zIndex,
    };
    // Merge style into adapter options (flat format).
    // Preserve visible/zIndex — style properties must not override layer options.
    if (def.style)
        Object.assign(adapterOptions, def.style);
    if (preloadedStyleData?.defaultStyle)
        Object.assign(adapterOptions, preloadedStyleData.defaultStyle);
    adapterOptions.visible = true;
    adapterOptions.zIndex = zIndex;
    // Pass geometry type so the adapter creates the correct MapLibre layer type
    // (e.g. "fill-extrusion" instead of the default "fill" for polygon GeoJSON sources).
    if (def.geometry)
        adapterOptions.geometry = def.geometry;
    if (def.showIconsOnMap)
        adapterOptions.showIconsOnMap = true;
    if (Array.isArray(def.styleRules) && def.styleRules.length) {
        adapterOptions.styleRules = def.styleRules;
    }
    // Resolve clustering strategy from profile/layer config
    const clusterResult = GeoJSONClustering.getClusteringStrategy(def, geojsonData);
    if (clusterResult.shouldCluster) {
        adapterOptions.cluster = true;
        adapterOptions.clusterRadius =
            typeof def.clusterRadius === "number" ? def.clusterRadius : 80;
        const rawClusterMaxZoom = typeof def.disableClusteringAtZoom === "number" ? def.disableClusteringAtZoom : 14;
        const sourceMaxZoom = typeof adapterOptions.maxzoom === "number" ? adapterOptions.maxzoom : 22;
        adapterOptions.clusterMaxZoom = Math.min(rawClusterMaxZoom, sourceMaxZoom - 1);
        Log.info("[GeoLeaf.GeoJSON] Clustering enabled for layer:", layerId, {
            clusterRadius: adapterOptions.clusterRadius,
            clusterMaxZoom: adapterOptions.clusterMaxZoom,
        });
    }
    adapter.addGeoJSONLayer(layerId, geojsonData, adapterOptions);
    // Bind popups & tooltips via event-driven MapLibre pattern
    const nativeMap = adapter.getNativeMap();
    const registry = adapter.getLayerRegistry?.();
    const subLayerIds = registry?.getSubLayerIds(layerId) ?? [];
    const PopupTooltipMod = _deps?.getPopupTooltip();
    if (PopupTooltipMod?.bindMapLibrePopup) {
        PopupTooltipMod.bindMapLibrePopup(layerId, def, nativeMap, subLayerIds);
    }
    if (PopupTooltipMod?.bindMapLibreTooltip) {
        PopupTooltipMod.bindMapLibreTooltip(layerId, def, nativeMap, subLayerIds);
    }
    // Build and register layer data in shared state
    const Config = _deps?.getConfig();
    const dataCfg = Config?.get ? Config.get("data") : null;
    const profilesBasePath = dataCfg?.profilesBasePath || "profiles";
    const layerBasePath = `${profilesBasePath}/${def._profileId}/${def._layerDirectory}`;
    const inferredGeometry = _deps?.getLayerConfig()?.inferGeometryType?.(def, geojsonData) || "mixed";
    const layerData = {
        id: layerId,
        label: layerLabel,
        layer: null, // No Leaflet layer object
        visible: true,
        config: def,
        clusterGroup: clusterResult.shouldCluster ? layerId : null,
        legendsConfig: def.legends,
        basePath: layerBasePath,
        useSharedCluster: clusterResult.useSharedCluster,
        features,
        geometryType: def.geometryType || inferredGeometry,
        currentStyle: preloadedStyleData,
        _maplibreLayerId: layerId,
        _maplibreSubLayerIds: subLayerIds,
        _visibility: {
            current: true,
            logicalState: true,
            source: "system",
            userOverride: false,
            themeOverride: false,
            themeDesired: null,
            zoomConstrained: false,
        },
    };
    state.layers.set(layerId, layerData);
    // Trigger visibility recalculation
    if (_deps?.getLayerManager()) {
        _deps.getLayerManager()?.updateLayerVisibilityByZoom();
    }
    // Labels
    const Labels = _deps?.getLabels();
    if (Labels && typeof Labels.initializeLayerLabels === "function") {
        if (preloadedStyleData || (def.labels && def.labels.enabled)) {
            Labels.initializeLayerLabels(layerId);
        }
    }
    Log.debug("[GeoLeaf.GeoJSON] MapLibre layer loaded:", layerId, "(" + features.length + " features)");
    return { id: layerId, label: layerLabel, featureCount: features.length };
}
// ─── Entry point ─────────────────────────────────────────────────────────────
// ─── OGC API Features early-exit ────────────────────────────────────────────
async function _loadFromOgcApi(layerId, layerLabel, def, ogcConfig, state, Log) {
    const controller = new AbortController();
    const featureCollection = await fetchOgcApiFeatures(ogcConfig, controller.signal);
    const result = await _doLoadSingleLayerMapLibre(featureCollection, false, def, layerId, layerLabel, state, Log);
    // Register autoRefresh listener if requested
    if (ogcConfig.autoRefresh) {
        const adapter = (state.adapter || _deps?.getCore()?.getMap?.());
        const nativeMap = adapter?.getNativeMap?.();
        if (nativeMap) {
            const cleanup = setupAutoRefresh(nativeMap, ogcConfig, (bbox) => {
                fetchOgcApiFeatures(ogcConfig, undefined, bbox)
                    .then((fc) => {
                    Log.debug(`[OgcApiLoader] autoRefresh: ${fc.features.length} features for layer "${layerId}"`);
                    // Update layer data in-place via adapter if available
                    const a = (state.adapter || _deps?.getCore()?.getMap?.());
                    a?.updateGeoJSONSource?.(layerId, fc);
                })
                    .catch((err) => Log.warn(`[OgcApiLoader] autoRefresh error for "${layerId}":`, err.message));
            });
            // Store cleanup on state so it can be called on layer removal
            const layerData = state.layers.get(layerId);
            if (layerData)
                layerData._ogcAutoRefreshCleanup = cleanup;
        }
    }
    return result;
}
Loader._loadSingleLayer = function (layerId, layerLabel, def, baseOptions) {
    const state = getState$1();
    const Log = getLog();
    // Vector tiles early exit
    const VT = getVectorTiles();
    if (VT && VT.shouldUseVectorTiles(def)) {
        Log.info(`[GeoLeaf.GeoJSON] Layer "${layerId}" → vector tiles`);
        return VT.loadVectorTileLayer(layerId, layerLabel, def, baseOptions);
    }
    // OGC API Features early exit
    const defData = def.data;
    if (defData?.ogcApi) {
        Log.info(`[GeoLeaf.GeoJSON] Layer "${layerId}" → OGC API Features`);
        return _loadFromOgcApi(layerId, layerLabel, def, defData.ogcApi, state, Log);
    }
    const fromCache = !!def._cachedData;
    const WorkerMgr = _deps?.getWorkerManager();
    const useWorker = !!(!fromCache && WorkerMgr && WorkerMgr.isAvailable());
    const dataPromise = _getDataPromise(fromCache, useWorker, def, WorkerMgr, layerId);
    return dataPromise.then((rawData) => _doLoadSingleLayerMapLibre(rawData, fromCache, def, layerId, layerLabel, state, Log));
};

/**
 * GeoLeaf GeoJSON — Feature Filter Helpers
 * Extracted from geojson/core.ts — Sprint 1 refactoring.
 * Handles geometry-type filtering and per-feature visibility for filterFeatures().
 *
 * @module geojson/geojson-filter
 */
/**
 * Resolves the list of layer IDs to process, optionally filtered by geometry type.
 * @internal
 */
function _resolveGeometryFilteredIds(state, options) {
    const layerIds = options.layerIds
        ? Array.isArray(options.layerIds)
            ? options.layerIds
            : [options.layerIds]
        : Array.from(state.layers.keys());
    if (!options.geometryType)
        return layerIds;
    const geoType = options.geometryType.toLowerCase();
    const typeAliases = {
        poi: "point",
        route: "line",
        linestring: "line",
        area: "polygon",
    };
    const normalizedType = typeAliases[geoType] || geoType;
    return layerIds.filter((id) => {
        const data = state.layers.get(id);
        if (!data)
            return false;
        const layerGeoType = (data.geometryType || "").toLowerCase();
        const normalizedLayerType = typeAliases[layerGeoType] || layerGeoType;
        return normalizedLayerType === normalizedType;
    });
}
/**
 * Applies a filter predicate to all features in a single layer,
 * showing or hiding each feature via the visibility helpers.
 * @internal
 */
function _applyFeatureVisibilityForLayer(layerData, filterFn, layerId, stats) {
    const isLineLayer = ["line", "linestring", "polyline"].includes((layerData.geometryType || "").toLowerCase());
    const bypassFilter = layerData.config?.search?.enabled === false ||
        (isLineLayer && layerData.config?.search?.enabled !== true);
    const features = layerData.features || [];
    if (!features.length)
        return;
    if (bypassFilter) {
        stats.total += features.length;
        stats.visible += features.length;
        return;
    }
    const visibleFeatures = features.filter((feature) => filterFn(feature, layerId));
    stats.total += features.length;
    stats.visible += visibleFeatures.length;
    stats.filtered += features.length - visibleFeatures.length;
    const adapter = GeoJSONShared.state?.adapter;
    if (adapter && typeof adapter.updateLayerData === "function") {
        adapter.updateLayerData(layerId, {
            type: "FeatureCollection",
            features: visibleFeatures,
        });
    }
}

/*!
 * GeoLeaf Core — © 2026 Mattieu Pottier — MIT License — https://geoleaf.dev
 */
/**
 * @fileoverview GeoJSON utility functions for feature analysis, validation, and coordinate processing.
 * Previously part of the src/geojson/ legacy shim; moved here as canonical utilities.
 * @module geojson/geojson-utils
 */
function _getStyleOperators() {
    return GeoJSONShared.STYLE_OPERATORS || {};
}
/**
 * Returns the geometry type string of a GeoJSON feature, or null if unavailable.
 * @param feature - The GeoJSON feature object.
 * @returns The geometry type string (e.g. `"Point"`, `"LineString"`), or null.
 */
function getGeometryType(feature) {
    return feature?.geometry?.type ?? null;
}
/**
 * Returns true if the feature has Point or MultiPoint geometry.
 * @param feature - The GeoJSON feature object.
 * @returns `true` if the geometry type is `"Point"` or `"MultiPoint"`.
 */
function isPointGeometry(feature) {
    const t = getGeometryType(feature);
    return t === "Point" || t === "MultiPoint";
}
/**
 * Returns true if the feature has LineString or MultiLineString geometry.
 * @param feature - The GeoJSON feature object.
 * @returns `true` if the geometry type is `"LineString"` or `"MultiLineString"`.
 */
function isLineGeometry(feature) {
    const t = getGeometryType(feature);
    return t === "LineString" || t === "MultiLineString";
}
/**
 * Returns true if the feature has Polygon or MultiPolygon geometry.
 * @param feature - The GeoJSON feature object.
 * @returns `true` if the geometry type is `"Polygon"` or `"MultiPolygon"`.
 */
function isPolygonGeometry(feature) {
    const t = getGeometryType(feature);
    return t === "Polygon" || t === "MultiPolygon";
}
/**
 * Retrieves a nested property from a GeoJSON feature using dot-notation key.
 * @param feature - The GeoJSON feature object.
 * @param key - Dot-notation property path (e.g. `"properties.name"`).
 * @returns The property value or null if not found.
 */
function getFeatureProperty(feature, key) {
    if (feature == null || key == null)
        return null;
    const parts = String(key).split(".");
    let v = feature;
    for (const p of parts) {
        v = v?.[p];
    }
    return v !== undefined ? v : null;
}
/**
 * Evaluates a style condition against a feature or two values.
 * Supports both `(leftValue, operator, rightValue)` and `(feature, { field, operator, value })` call signatures.
 * @param featureOrLeft - A GeoJSON feature (2-arg form) or a left-hand value (3-arg form).
 * @param conditionOrOp - A condition object `{ field, operator, value }` or an operator string.
 * @param rightValue - The right-hand comparison value (3-arg form only).
 * @returns `true` if the condition is satisfied, `false` otherwise.
 */
function evaluateStyleCondition(featureOrLeft, conditionOrOp, rightValue) {
    const ops = _getStyleOperators();
    if (arguments.length >= 3 && typeof conditionOrOp === "string") {
        return ops[conditionOrOp] ? ops[conditionOrOp](featureOrLeft, rightValue) : false;
    }
    if (!conditionOrOp || !featureOrLeft)
        return false;
    const { field, operator, value } = conditionOrOp;
    const prop = getFeatureProperty(featureOrLeft, field);
    return ops[operator] ? ops[operator](prop, value) : prop === value;
}
/**
 * Validates a GeoJSON feature and returns a normalized result object.
 * @param args - Passed through to `FeatureValidator.validateFeature`.
 * @returns `{ valid, errors }` where errors is an array of strings.
 */
function validateFeature(...args) {
    const r = FeatureValidator.validateFeature?.(...args);
    if (!r)
        return { valid: false, errors: ["Validator unavailable"] };
    return {
        valid: r.valid,
        errors: (r.errors || []).map((e) => (typeof e === "string" ? e : e.message)),
    };
}
/* eslint-disable complexity -- validation branches */
/**
 * Validates a GeoJSON FeatureCollection and returns a normalized result object.
 * @param collection - The GeoJSON FeatureCollection or array to validate.
 * @param rest - Additional arguments passed through to the underlying validator.
 * @returns `{ valid, errors, featureCount }`.
 */
function validateFeatureCollection(collection, ...rest) {
    const r = FeatureValidator.validateFeatureCollection?.(collection, ...rest);
    if (!r)
        return { valid: false, errors: ["Validator unavailable"], featureCount: 0 };
    const features = collection?.type === "FeatureCollection"
        ? collection.features
        : Array.isArray(collection)
            ? collection
            : [];
    const wrongType = collection && collection.type !== undefined && collection.type !== "FeatureCollection";
    const missingFeatures = collection?.type === "FeatureCollection" && !Array.isArray(collection?.features);
    const errors = (r.errors || []).map((e) => (typeof e === "string" ? e : e.message));
    if (wrongType)
        errors.push('GeoJSON type must be "FeatureCollection"');
    if (missingFeatures)
        errors.push("GeoJSON must have features array");
    return {
        valid: errors.length === 0,
        errors,
        featureCount: Array.isArray(features) ? features.length : 0,
    };
}
/* eslint-enable complexity */
function _toLatLng(coord) {
    return Array.isArray(coord) && coord.length >= 2 ? [coord[1], coord[0]] : null;
}
/* eslint-disable complexity -- geometry type branches */
/**
 * Extracts coordinates from a GeoJSON feature, converting [lng, lat] → [lat, lng].
 * @param feature - The GeoJSON feature to extract coordinates from.
 * @returns Array of [lat, lng] pairs, or null if no valid coordinates are found.
 */
function extractCoordinates(feature) {
    if (feature == null)
        return null;
    const geom = feature.geometry;
    if (!geom || !geom.coordinates)
        return null;
    const c = geom.coordinates;
    if (!Array.isArray(c))
        return null;
    switch (geom.type) {
        case "Point":
            return _toLatLng(c) ? [_toLatLng(c)] : null;
        case "MultiPoint":
            return c.map(_toLatLng).filter(Boolean);
        case "LineString":
            return c.map(_toLatLng).filter(Boolean);
        case "MultiLineString":
            return c.flat().map(_toLatLng).filter(Boolean);
        case "Polygon":
            return c[0]?.length
                ? c[0].map(_toLatLng).filter(Boolean)
                : null;
        case "MultiPolygon":
            return c.flat(2).map(_toLatLng).filter(Boolean);
        default:
            return null;
    }
}
/* eslint-enable complexity */
/**
 * Computes the bounding box [[minLat, minLng], [maxLat, maxLng]] from an array of GeoJSON features.
 * @param features - Array of GeoJSON features to compute bounds from. Defaults to `[]`.
 * @returns A `[[minLat, minLng], [maxLat, maxLng]]` bounding box, or null if no valid coordinates.
 */
function calculateBounds(features = []) {
    if (!features || !Array.isArray(features))
        return null;
    const coords = features
        .flatMap((f) => extractCoordinates(f))
        .filter((c) => c != null && c.length >= 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]));
    if (!coords.length)
        return null;
    const lats = coords.map((c) => c[0]);
    const lngs = coords.map((c) => c[1]);
    const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
    const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
    if (!Number.isFinite(minLat) || !Number.isFinite(maxLng))
        return null;
    return [
        [minLat, minLng],
        [maxLat, maxLng],
    ];
}

/**
 * GeoLeaf GeoJSON Module - Aggregator — main module delegating to sub-modules.
 *
 * Architecture Phase 3.5:
 * - geojson/shared.js        : Shared state, constants, STYLE_OPERATORS
 * - geojson/style-resolver.js: styleRules evaluation, buildLayerOptions
 * - geojson/layer-manager.js : Gestion layers (show/hide/toggle/remove)
 * - geojson/loader.js        : Loadsment (loadUrl, loadFromActiveProfile)
 * - geojson/popup-tooltip.js : Unified popups and tooltips
 * - geojson/clustering.js    : Clustering strategies
 *
 * @module geoleaf.geojson
 */
const _g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
// ========================================
//   GETTERS LAZY POUR SOUS-MODULES
// ========================================
const getState = () => GeoJSONShared.state;
const getLayerManager = () => _g.GeoLeaf && _g.GeoLeaf._GeoJSONLayerManager;
const getLoader = () => _g.GeoLeaf && _g.GeoLeaf._GeoJSONLoader;
function _validateZoomOnFit(options, g) {
    if (typeof options.maxZoomOnFit !== "number" ||
        options.maxZoomOnFit < 1 ||
        options.maxZoomOnFit > 20) {
        Log.warn("[GeoLeaf.GeoJSON] options.maxZoomOnFit must be a number between 1 and 20.");
        options.maxZoomOnFit =
            g.GeoLeaf && g.GeoLeaf.CONSTANTS ? g.GeoLeaf.CONSTANTS.GEOJSON_MAX_ZOOM_ON_FIT : 18;
    }
}
function _mergeInitOptions(current, incoming, g) {
    return g.GeoLeaf && g.GeoLeaf.Utils && g.GeoLeaf.Utils.mergeOptions
        ? g.GeoLeaf.Utils.mergeOptions(current, incoming)
        : Object.assign({}, current, incoming);
}
// ─── Bug B2 fix: rebuild data layers after map.setStyle() ────────────────────
/**
 * Re-injects all GeoJSON data layers into MapLibre after a full style
 * replacement (`map.setStyle()`). Reads layer metadata and feature arrays
 * from `GeoJSONShared.state.layers` (which lives in JS memory and survives
 * style changes), then calls `adapter.addGeoJSONLayer()` to recreate the
 * MapLibre sources and sub-layers.
 *
 * Popup/tooltip event handlers are re-bound and visibility is restored.
 *
 * @param state - GeoJSONShared.state reference.
 * @internal
 */
function _rebuildGeoJSONLayers(state) {
    const adapter = state.adapter;
    if (!adapter || typeof adapter.addGeoJSONLayer !== "function")
        return;
    const nativeMap = adapter.getNativeMap?.();
    if (!nativeMap)
        return;
    const PopupTooltipMod = _g.GeoLeaf?._GeoJSONPopupTooltip;
    // Sort layers by zIndex for correct rendering order
    const entries = Array.from(state.layers.entries());
    entries.sort((a, b) => {
        const zA = a[1].config?.zIndex ?? 0;
        const zB = b[1].config?.zIndex ?? 0;
        return zA - zB;
    });
    for (const [layerId, layerData] of entries) {
        try {
            // Reconstruct adapter options from stored config + style
            const def = layerData.config || {};
            const zIndex = typeof def.zIndex === "number" ? def.zIndex : 0;
            const adapterOptions = { visible: true, zIndex };
            if (def.style)
                Object.assign(adapterOptions, def.style);
            // Restore the user-selected style if any. currentStyle may be:
            //  - a full style file object { id, label, style: { … }, styleRules: [...] }
            //  - a flat paint object { fillColor, … , styleRules: [...] }
            if (layerData.currentStyle) {
                const activePaint = layerData.currentStyle.style ?? layerData.currentStyle;
                Object.assign(adapterOptions, activePaint);
            }
            adapterOptions.visible = true;
            adapterOptions.zIndex = zIndex;
            if (def.geometry)
                adapterOptions.geometry = def.geometry;
            if (def.showIconsOnMap)
                adapterOptions.showIconsOnMap = true;
            // Prefer styleRules from current style (may differ after style switch),
            // fall back to initial config set by _applyPreloadedStyle during first load.
            const rebuildRules = layerData.currentStyle?.styleRules ?? def.styleRules;
            if (Array.isArray(rebuildRules) && rebuildRules.length) {
                adapterOptions.styleRules = rebuildRules;
            }
            // Clustering
            if (layerData.clusterGroup) {
                adapterOptions.cluster = true;
                adapterOptions.clusterRadius =
                    typeof def.clusterRadius === "number" ? def.clusterRadius : 80;
                adapterOptions.clusterMaxZoom =
                    typeof def.disableClusteringAtZoom === "number"
                        ? def.disableClusteringAtZoom
                        : 14;
            }
            // Vector tile layers: re-load via VectorTiles module (no GeoJSON features to rebuild)
            if (layerData.isVectorTile) {
                _g.GeoLeaf?._VectorTiles?.loadVectorTileLayer?.(layerId, layerData.label, layerData.config, {});
                continue;
            }
            // Build GeoJSON FeatureCollection from stored features
            const features = layerData.features;
            if (!Array.isArray(features) || features.length === 0) {
                Log.warn(`[GeoLeaf.GeoJSON] Rebuild: no features for "${layerId}", skipping.`);
                continue;
            }
            const geojsonData = { type: "FeatureCollection", features };
            // Recreate MapLibre source + sub-layers
            adapter.addGeoJSONLayer(layerId, geojsonData, adapterOptions);
            // Rebind popup/tooltip event handlers
            const registry = adapter.getLayerRegistry?.();
            const subLayerIds = registry?.getSubLayerIds(layerId) ?? [];
            if (PopupTooltipMod?.bindMapLibrePopup) {
                PopupTooltipMod.bindMapLibrePopup(layerId, def, nativeMap, subLayerIds);
            }
            if (PopupTooltipMod?.bindMapLibreTooltip) {
                PopupTooltipMod.bindMapLibreTooltip(layerId, def, nativeMap, subLayerIds);
            }
            // Restore visibility
            if (layerData._visibility?.logicalState === false) {
                adapter.hideLayer(layerId);
            }
            // Update stored sub-layer IDs (may differ if SubLayerType detection changed)
            layerData._maplibreSubLayerIds = subLayerIds;
            Log.debug(`[GeoLeaf.GeoJSON] Rebuild: layer "${layerId}" restored.`);
        }
        catch (err) {
            Log.warn(`[GeoLeaf.GeoJSON] Rebuild: failed to restore "${layerId}":`, err);
        }
    }
    Log.info(`[GeoLeaf.GeoJSON] Rebuild complete: ${entries.length} layer(s) restored.`);
}
const GeoJSONModule = {
    /**

     * Getters for direct state access (compatibility)

     */
    get _map() {
        return getState() ? getState().map : null;
    },
    get _layerGroup() {
        return getState() ? getState().layerGroup : null;
    },
    get _geoJsonLayer() {
        return getState() ? getState().geoJsonLayer : null;
    },
    get _layers() {
        return getState() ? getState().layers : new Map();
    },
    get _options() {
        return getState() ? getState().options : {};
    },
    get DEFAULT_STYLES() {
        return GeoJSONShared.DEFAULT_STYLES;
    },
    STYLE_OPERATORS: GeoJSONShared.STYLE_OPERATORS,
    evaluateStyleCondition,
    getFeatureProperty,
    getGeometryType,
    isPointGeometry,
    isLineGeometry,
    isPolygonGeometry,
    validateFeature,
    validateFeatureCollection,
    extractCoordinates,
    calculateBounds,
    /**

     * Validates options passed to init()

     * @param {Object} options

     * @private

     */
    _validateOptions(options) {
        if (options.map &&
            typeof options.map.getNativeMap !== "function" &&
            typeof options.map.addLayer !== "function") {
            Log.warn("[GeoLeaf.GeoJSON] options.map does not appear to be a valid map or adapter instance.");
        }
        if (options.defaultStyle && typeof options.defaultStyle !== "object") {
            Log.warn("[GeoLeaf.GeoJSON] options.defaultStyle must be an object.");
            delete options.defaultStyle;
        }
        if (options.onEachFeature && typeof options.onEachFeature !== "function") {
            Log.warn("[GeoLeaf.GeoJSON] options.onEachFeature must be a function.");
            delete options.onEachFeature;
        }
        if (options.pointToLayer && typeof options.pointToLayer !== "function") {
            Log.warn("[GeoLeaf.GeoJSON] options.pointToLayer must be a function.");
            delete options.pointToLayer;
        }
        if (options.maxZoomOnFit !== undefined)
            _validateZoomOnFit(options, _g);
        return options;
    },
    /**

     * Initialise the module GeoJSON.

     *

     * @param {Object} options

     * @param {unknown} [options.map] - Map instance. Si absent, tentative via GeoLeaf.Core.getMap().

     * @param {Object} [options.defaultStyle]

     * @param {Object} [options.defaultPointStyle]

     * @param {Function} [options.onEachFeature]

     * @param {Function} [options.pointToLayer]

     * @param {boolean} [options.fitBoundsOnLoad]

     * @param {number} [options.maxZoomOnFit]

     * @returns {unknown} - The GeoJSON layer or null on failure.

     */
    init(options = {}) {
        const state = getState();
        if (!state) {
            Log.error("[GeoLeaf.GeoJSON] shared.js module not loaded.");
            return null;
        }
        // Validation
        options = this._validateOptions(options);
        // ── MapLibre mode ─────────────────────────────────────────────────
        // Detect MapLibre adapter: options.map may be the adapter itself,
        // or fall back to GeoLeaf.Core.getMap() which returns the adapter.
        const mapOrAdapter = options.map || _g.GeoLeaf?.Core?.getMap?.() || null;
        const adapter = mapOrAdapter && typeof mapOrAdapter.getNativeMap === "function" ? mapOrAdapter : null;
        const nativeMap = adapter?.getNativeMap?.();
        const isMapLibre = nativeMap && typeof nativeMap.addSource === "function";
        if (isMapLibre) {
            state.adapter = adapter;
            state.map = nativeMap;
            state.options = _mergeInitOptions(state.options, options, _g);
            // No panes, no layer groups in MapLibre — layer ordering via registry
            state.layerGroup = null;
            state.geoJsonLayer = null;
            state.layers = new Map();
            Log.info("[GeoLeaf.GeoJSON] Module initialized (MapLibre mode)");
            // Register rebuild listener for vector basemap transitions (Bug B2 fix).
            // When the basemap registry calls map.setStyle(), all MapLibre sources
            // and layers are destroyed. This listener re-injects them from state.
            document.addEventListener("geoleaf:style:rebuild", () => {
                _rebuildGeoJSONLayers(state);
            });
            return null;
        }
        Log.error("[GeoLeaf.GeoJSON] MapLibre adapter not found. Pass a valid map adapter in init({ map }).");
        return null;
    },
    /**

     * Returns the GeoJSON layer maine (LEGACY).

     * @returns {unknown}

     */
    getLayer() {
        const state = getState();
        return state ? state.geoJsonLayer : null;
    },
    // ========================================
    //   DELEGATION TO LAYER MANAGER
    // ========================================
    getLayerById(layerId) {
        const LayerManager = getLayerManager();
        return LayerManager ? LayerManager.getLayerById(layerId) : null;
    },
    getLayerData(layerId) {
        const LayerManager = getLayerManager();
        return LayerManager ? LayerManager.getLayerData(layerId) : null;
    },
    /**
     * Replaces the GeoJSON data of an existing layer in real time.
     *
     * Updates both the MapLibre source (`source.setData()`) and the in-memory
     * state so that subsequent `getLayerData()` calls return the fresh data.
     *
     * @param {string} layerId - ID of the layer to update.
     * @param {unknown} data - GeoJSON FeatureCollection (or any valid GeoJSON) to set.
     */
    updateLayerData(layerId, data) {
        const state = getState();
        if (!state)
            return;
        // Update MapLibre source via adapter
        const adapter = state.adapter;
        if (adapter && typeof adapter.updateLayerData === "function") {
            adapter.updateLayerData(layerId, data);
        }
        // Keep in-memory state consistent so getLayerData() returns fresh data
        const layerEntry = state.layers?.get(layerId);
        if (layerEntry) {
            layerEntry.geojson = data;
            const fc = data;
            if (fc && Array.isArray(fc.features)) {
                layerEntry.features = fc.features;
            }
        }
    },
    getAllLayers() {
        const LayerManager = getLayerManager();
        return LayerManager ? LayerManager.getAllLayers() : [];
    },
    showLayer(layerId) {
        const LayerManager = getLayerManager();
        if (LayerManager)
            LayerManager.showLayer(layerId);
    },
    hideLayer(layerId) {
        const LayerManager = getLayerManager();
        if (LayerManager)
            LayerManager.hideLayer(layerId);
    },
    toggleLayer(layerId) {
        const LayerManager = getLayerManager();
        if (LayerManager)
            LayerManager.toggleLayer(layerId);
    },
    removeLayer(layerId) {
        const LayerManager = getLayerManager();
        if (LayerManager)
            LayerManager.removeLayer(layerId);
    },
    updateLayerZIndex(layerId, newZIndex) {
        const LayerManager = getLayerManager();
        return LayerManager ? LayerManager.updateLayerZIndex(layerId, newZIndex) : false;
    },
    setLayerStyle(layerId, styleConfig) {
        const LayerManager = getLayerManager();
        return LayerManager ? LayerManager.setLayerStyle(layerId, styleConfig) : false;
    },
    // ========================================
    //   DELEGATION TO LOADER
    // ========================================
    loadUrl(url, options = {}) {
        const Loader = getLoader();
        return Loader ? Loader.loadUrl(url, options) : Promise.resolve(null);
    },
    addData(geojsonData, options = {}) {
        const Loader = getLoader();
        if (Loader)
            Loader.addData(geojsonData, options);
    },
    loadFromActiveProfile(options = {}) {
        const Loader = getLoader();
        return Loader ? Loader.loadFromActiveProfile(options) : Promise.resolve([]);
    },
    // ========================================
    //   FILTRAGE DES FEATURES
    // ========================================
    /**

     * Filtre les features de toutes les GeoJSON layers.

     * Shows only features that pass the predicate.

     *

     * @param {Function} filterFn - Fonction (feature, layerId) => boolean

     * @param {Object} [options] - Additional options

     * @returns {Object} - { filtered: number, total: number, visible: number }

     */
    filterFeatures(filterFn, options = {}) {
        const state = getState();
        if (typeof filterFn !== "function") {
            Log.warn("[GeoLeaf.GeoJSON] filterFeatures: filterFn must be a function");
            return { filtered: 0, total: 0, visible: 0 };
        }
        const stats = { filtered: 0, total: 0, visible: 0 };
        const layerIds = _resolveGeometryFilteredIds(state, options);
        layerIds.forEach((layerId) => {
            const layerData = state.layers.get(layerId);
            if (!layerData)
                return;
            _applyFeatureVisibilityForLayer(layerData, filterFn, layerId, stats);
        });
        Log.debug(`[GeoLeaf.GeoJSON] filterFeatures: ${stats.visible}/${stats.total} visible features`);
        return stats;
    },
    /**

     * Resets the feature filter (shows all).

     *

     * @param {Object} [options] - Same options as filterFeatures

     */
    clearFeatureFilter(options = {}) {
        return this.filterFeatures(() => true, options);
    },
    /**

     * Returns all loaded features.

     * Reads directly from state.layers (featureCache removed in Sprint 1).

     * @param {Object} [options]

     * @returns {Array<Object>} features GeoJSON enrichies de { _layerId }

     */
    getFeatures(options = {}) {
        const state = getState();
        if (!state)
            return [];
        const geometrySet = Array.isArray(options.geometryTypes)
            ? new Set(options.geometryTypes.map((t) => t.toLowerCase()))
            : null;
        const layerSet = Array.isArray(options.layerIds) ? new Set(options.layerIds) : null;
        const result = [];
        state.layers.forEach((layerData, layerId) => {
            if (layerSet && !layerSet.has(layerId))
                return;
            const geoType = (layerData.geometryType || "").toLowerCase();
            if (geometrySet && !geometrySet.has(geoType))
                return;
            (layerData.features || []).forEach((f) => {
                if (f && typeof f === "object") {
                    // Shallow tag with _layerId instead of full Object.assign clone
                    f._layerId = layerId;
                    result.push(f);
                }
            });
        });
        return result;
    },
    /**

     * Removes all GeoJSON entities from the legacy layer.

     */
    clear() {
        const state = getState();
        if (state && state.geoJsonLayer) {
            state.geoJsonLayer.clearLayers();
        }
    },
    // ========================================
    //   EXPOSED INTERNAL METHODS
    // ========================================
    _updateLayerVisibilityByZoom() {
        const LayerManager = getLayerManager();
        if (LayerManager)
            LayerManager.updateLayerVisibilityByZoom();
    },
    _registerWithLayerManager() {
        const LayerManager = getLayerManager();
        if (LayerManager)
            LayerManager.registerWithLayerManager();
    },
    _convertFeatureToPOI(feature, def) {
        const pt = _g.GeoLeaf && _g.GeoLeaf._GeoJSONPopupTooltip;
        return pt ? pt.convertFeatureToPOI(feature, def) : null;
    },
    _getClusteringStrategy(def, geojsonData) {
        const Clustering = GeoJSONClustering;
        return Clustering
            ? Clustering.getClusteringStrategy(def, geojsonData)
            : { shouldCluster: false, useSharedCluster: false };
    },
    _getSharedPOICluster() {
        const Clustering = GeoJSONClustering;
        return Clustering ? Clustering.getSharedPOICluster() : null;
    },
    _getPoiConfig() {
        const Clustering = GeoJSONClustering;
        return Clustering ? Clustering.getPoiConfig() : {};
    },
    _detectLayerType(layer) {
        const LayerManager = getLayerManager();
        return LayerManager ? LayerManager.detectLayerType(layer) : "mixed";
    },
    _buildLayerOptions(options) {
        const StyleResolver = GeoJSONStyleResolver;
        return StyleResolver ? StyleResolver.buildLayerOptions(options) : {};
    },
};
// Exposes _StyleRules for compatibility with the Themes module
// (already done in style-resolver.js, but we ensure it is accessible)
if (_g.GeoLeaf && !_g.GeoLeaf._StyleRules && GeoJSONStyleResolver) {
    _g.GeoLeaf._StyleRules = {
        evaluate: GeoJSONStyleResolver.evaluateStyleRules,
        operators: GeoJSONShared ? GeoJSONShared.STYLE_OPERATORS : {},
        getNestedValue: GeoJSONStyleResolver.getNestedValue,
    };
}
const GeoJSONCore = GeoJSONModule;

export { FeatureValidator as F, GeoJSONCore as G, Loader as L, PopupTooltip as P, VisibilityManager as V, WorkerManager as W, GeoJSONShared as a, LayerManager$1 as b, LayerManager$3 as c, LayerManager$2 as d, LayerManager as e, Loader$3 as f, Loader$2 as g, Loader$1 as h, LayerConfigManager as i, GeoJSONClustering as j, GeoJSONStyleResolver as k, VectorTiles as l, setupDataDeps as m, normalizeStyle as n, setupSingleLayerDeps as o, setupPopupTooltipDeps as p, setupProfileDeps as s };
//# sourceMappingURL=geoleaf-chunk-geojson-BLYAjSTx.js.map
