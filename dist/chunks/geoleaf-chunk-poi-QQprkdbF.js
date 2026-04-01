import { o as resolveField$1, L as Log, p as Security, q as Config, u as CONSTANTS, v as StyleResolver, g as getLog, w as getActiveProfile, x as compareByOrder, k as escapeHtml, y as getColorsFromLayerStyle, z as validateUrl, A as formatNumber$1, D as DOMSecurity, h as dispatchGeoLeafEvent, B as AbstractRenderer, m as getLabel, E as createElement, F as poisToFeatureCollection } from './geoleaf-chunk-core-utils-DZhdQ30U.js';
import { S as StorageContract } from './geoleaf-chunk-layers-5bHCsvM2.js';

/* eslint-disable security/detect-object-injection */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - Normalizers
 * Fonctions de normalisation et extraction de data POI
 */
// ========================================
//   NORMALISATION POI — HELPERS
// ========================================
/** Sanitize a URL: accept only http/https/data:image. */
function _sanitizeUrl(url) {
    if (!url || typeof url !== "string")
        return null;
    const trimmed = url.trim();
    if (trimmed.match(/^(https?:\/\/|data:image\/)/i))
        return trimmed;
    return null;
}
/** @security Escapes POI property strings against XSS via Security.escapeHtml or safe fallback. */
function _escapeHtml(str) {
    if (Security.escapeHtml)
        return Security.escapeHtml(str);
    if (!str)
        return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
/** Resolve category IDs with multi-source fallback. */
function _resolveCategories(attr, p, props) {
    return {
        categoryId: attr.categoryId || p.categoryId || p.category || props.category || null,
        subCategoryId: attr.subCategoryId || p.subCategoryId || p.sub_category || props.sub_category || null,
    };
}
/** Resolve contact fields with multi-source fallback. */
function _resolveContact(p, attr, props) {
    return {
        website: _sanitizeUrl(attr.link || attr.website || p.link || props.link || p.website || props.website || null),
        address: _escapeHtml(String(resolveField$1(p, "attributes.address", "address", "properties.address") ?? "")),
        phone: _escapeHtml(String(resolveField$1(p, "attributes.phone", "phone", "properties.phone") ?? "")),
        email: _escapeHtml(String(resolveField$1(p, "attributes.email", "email", "properties.email") ?? "")),
    };
}
/** Resolve main image URL with fallback to gallery first item. */
function _resolveMainImage(attr, p, props) {
    const galleryFirst = (attr.gallery && attr.gallery[0]) || (p.gallery && p.gallery[0]);
    return _sanitizeUrl(attr.photo || attr.mainImage || props.photo || galleryFirst || null);
}
/** Collect raw gallery array from multiple sources. */
function _rawGallery(attr, p, props) {
    return attr.gallery || p.gallery || props.gallery || p.images || props.images || [];
}
/** Map a single gallery item to a sanitized URL. */
function _mapGalleryItem(img) {
    if (typeof img === "string")
        return _sanitizeUrl(img);
    if (img && img.url)
        return _sanitizeUrl(img.url);
    return null;
}
/** Resolve reviews from multiple sources. */
function _resolveReviews(attr, p, props) {
    return (attr.reviews ||
        (attr.attributes && attr.attributes.reviews) ||
        p.reviews ||
        props.reviews ||
        (props.attributes && props.attributes.reviews) ||
        null);
}
/** Resolve opening hours from multiple sources. */
function _resolveOpeningHours(attr, p, props) {
    return (attr.opening_hours ||
        attr.openingHours ||
        p.opening_hours ||
        props.opening_hours ||
        p.openingHours ||
        props.openingHours ||
        null);
}
/** Parse a single raw opening hours entry into a structured object. */
function _parseOpeningHoursEntry(raw) {
    if (raw == null)
        return null;
    const text = String(raw).trim();
    if (!text)
        return null;
    const parts = text.split(":");
    if (parts.length <= 1)
        return { day: text, open: "", close: "" };
    const day = (parts.shift() ?? "").trim();
    const rest = parts.join(":").trim();
    const hoursParts = rest.split(/[–-]/);
    if (hoursParts.length > 1) {
        return { day, open: hoursParts[0].trim(), close: hoursParts.slice(1).join("–").trim() };
    }
    return { day, open: rest, close: "" };
}
/** Build openingHoursTable from an array of raw entries. */
function _buildOpeningHoursTable(openingHours) {
    return openingHours.map(_parseOpeningHoursEntry).filter(Boolean);
}
/** Build descriptions sub-object. */
function _resolveDescriptions(p) {
    return {
        shortDescription: _escapeHtml(String(resolveField$1(p, "description", "attributes.shortDescription", "properties.description") ?? "")),
        longDescription: _escapeHtml(String(resolveField$1(p, "attributes.description_long", "description_long", "properties.description_long", "attributes.longDescription") ?? "")),
    };
}
// ========================================
//   NORMALISATION POI
// ========================================
function _resolvePoiAttr(poi) {
    if (!poi.attributes)
        return {};
    if (typeof poi.attributes !== "object")
        return {};
    return poi.attributes;
}
function _resolvePoiPrice(attr, p, props) {
    if (attr.price)
        return attr.price;
    if (p.price)
        return p.price;
    if (props.price)
        return props.price;
    return null;
}
function _resolvePoiTags(attr, p, props) {
    const raw = attr.tags || p.tags || props.tags || [];
    return raw.map((t) => _escapeHtml(String(t)));
}
function _resolvePoiServices(attr, p, props) {
    const raw = attr.services || p.services || props.services || [];
    return raw.map((s) => _escapeHtml(String(s)));
}
function _buildNormalizedAttributes(attr, p, props, descriptions, categories, contact) {
    const gallery = _rawGallery(attr, p, props).map(_mapGalleryItem).filter(Boolean);
    const openingHours = _resolveOpeningHours(attr, p, props);
    const openingHoursTable = openingHours && Array.isArray(openingHours) ? _buildOpeningHoursTable(openingHours) : null;
    return {
        ...attr,
        ...descriptions,
        ...categories,
        mainImage: _resolveMainImage(attr, p, props),
        gallery,
        price: _resolvePoiPrice(attr, p, props),
        openingHours,
        openingHoursTable,
        reviews: _resolveReviews(attr, p, props),
        tags: _resolvePoiTags(attr, p, props),
        ...contact,
        services: _resolvePoiServices(attr, p, props),
    };
}
function _preservePoiMetadata(normalized, poi) {
    if (poi._sidepanelConfig)
        normalized._sidepanelConfig = poi._sidepanelConfig;
    if (poi._layerConfig)
        normalized._layerConfig = poi._layerConfig;
}
/**
 * Normalise un POI to the structure standard { id, latlng, title, attributes: {...} }.
 * Transforme l'old format to the nouveau format expected par the profilee.json.
 *
 * @param {object} poi - POI au format brut (old ou nouveau).
 * @returns {object} POI normalized.
 */
function normalizePoi(poi) {
    if (!poi)
        return null;
    const p = poi;
    const attr = _resolvePoiAttr(p);
    const props = p.properties || {};
    const descriptions = _resolveDescriptions(p);
    const categories = _resolveCategories(attr, p, props);
    const contact = _resolveContact(p, attr, props);
    const normalized = {
        id: p.id || null,
        latlng: p.latlng || null,
        title: _escapeHtml(String(resolveField$1(p, "title", "label", "name", "attributes.title", "properties.label", "properties.name") || "Sans nom")),
        label: _escapeHtml(String(resolveField$1(p, "label", "name", "title") ?? "")),
        name: _escapeHtml(String(resolveField$1(p, "name", "label", "title") ?? "")),
        description: _escapeHtml(String(resolveField$1(p, "description", "attributes.description") ?? "")),
        properties: p.properties || {},
        attributes: _buildNormalizedAttributes(attr, p, props, descriptions, categories, contact),
    };
    _preservePoiMetadata(normalized, poi);
    return normalized;
}
/** Log a debug message when Log is available. */
function _dbg(...args) {
    if (Log && typeof Log.debug === "function")
        Log.debug(...args);
}
/**
 * Extrait the value of a field from un POI normalized using dot notation.
 *
 * @param {object} normalizedPoi - POI normalized.
 * @param {string} fieldPath - Path du field (ex: "title", "attributes.gallery", "attributes.reviews.rating").
 * @returns {*} Value du field ou null si introuvable.
 */
function getFieldValue(normalizedPoi, fieldPath) {
    if (!normalizedPoi || !fieldPath)
        return null;
    _dbg("[POI.getFieldValue] Recherche fieldPath:", fieldPath, "| POI:", normalizedPoi.id);
    const parts = fieldPath.split(".");
    let value = normalizedPoi;
    for (const part of parts) {
        if (value == null || typeof value !== "object") {
            _dbg("[POI.getFieldValue] Path interrupted at part:", part, "| value actuelle:", value);
            return null;
        }
        value = value[part];
    }
    _dbg("[POI.getFieldValue] Value found for", fieldPath, ":", value);
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
        _dbg("[POI.getFieldValue] Valeur vide ou table vide, retourne null");
        return null;
    }
    return value;
}
/** Resolve lat/lng from poi.latlng (array or object). */
function _resolveFromLatlng(poi) {
    if (Array.isArray(poi.latlng) && poi.latlng.length >= 2) {
        return { lat: poi.latlng[0], lng: poi.latlng[1] };
    }
    if (poi.latlng && typeof poi.latlng === "object") {
        return { lat: poi.latlng.lat, lng: poi.latlng.lng || poi.latlng.lon };
    }
    return { lat: undefined, lng: undefined };
}
/** Resolve lat/lng from flat coordinate fields. */
function _resolveFromFlatFields(poi) {
    if (typeof poi.lat === "number" && typeof poi.lng === "number") {
        return { lat: poi.lat, lng: poi.lng };
    }
    if (typeof poi.latitude === "number" && typeof poi.longitude === "number") {
        return { lat: poi.latitude, lng: poi.longitude };
    }
    return { lat: undefined, lng: undefined };
}
/** Resolve lat/lng from GeoJSON geometry.coordinates. */
function _resolveFromGeometry(poi) {
    if (poi.geometry && Array.isArray(poi.geometry.coordinates)) {
        return { lat: poi.geometry.coordinates[1], lng: poi.geometry.coordinates[0] };
    }
    return { lat: undefined, lng: undefined };
}
/** Extract raw lat/lng from all known POI formats. */
function _extractRawCoords(poi) {
    if (poi.latlng)
        return _resolveFromLatlng(poi);
    const flat = _resolveFromFlatFields(poi);
    if (flat.lat !== undefined)
        return flat;
    return _resolveFromGeometry(poi);
}
/**
 * Extrait les coordinates of a POI et les normalise en [lat, lng].
 *
 * @param {object} poi - POI brut.
 * @returns {Array<number>|null} Coordinates [lat, lng] ou null si invalids.
 */
function extractCoordinates(poi) {
    if (!poi)
        return null;
    const { lat, lng } = _extractRawCoords(poi);
    if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng))
        return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
        return null;
    return [lat, lng];
}
/**
 * Generates a ID unique for a POI sans ID.
 *
 * @param {object} poi - POI.
 * @returns {string} ID generated.
 */
function generatePoiId(poi) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const label = (poi.title || poi.label || poi.name || "poi")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .substring(0, 20);
    return `poi-${label}-${timestamp}-${random}`;
}
// ========================================
//   EXPORT
// ========================================
const POINormalizers = {
    normalizePoi,
    getFieldValue,
    extractCoordinates,
    generatePoiId,
};

/*!



 * GeoLeaf Core



 * © 2026 Mattieu Pottier



 * Released under the MIT License



 * https://geoleaf.dev



 */
/**



 * GeoLeaf POI Module - Markers Config



 * Configuration de base des markers POI (read profile active + CSS variables)



 */
/**



 * Obtient la configuration de base des POI depuis the profile active.



 *



 * @returns {object} Configuration de base { radius, weight, colorFill, colorStroke, fillOpacity, opacity, showIconsOnMap }.



 */
function _applyPoiProfileOverrides(poiCfg, base) {
    if (typeof poiCfg.radius === "number")
        base.radius = poiCfg.radius;
    if (typeof poiCfg.weight === "number")
        base.weight = poiCfg.weight;
    if (typeof poiCfg.fillOpacity === "number")
        base.fillOpacity = poiCfg.fillOpacity;
    if (typeof poiCfg.opacity === "number")
        base.opacity = poiCfg.opacity;
    if (typeof poiCfg.showIconsOnMap === "boolean")
        base.showIconsOnMap = poiCfg.showIconsOnMap;
    if (typeof poiCfg.colorFill === "string")
        base.colorFill = poiCfg.colorFill;
    if (typeof poiCfg.colorStroke === "string")
        base.colorStroke = poiCfg.colorStroke;
}
function _getComputedPoiColors(base) {
    if (typeof document !== "undefined" &&
        typeof window !== "undefined" &&
        typeof window.getComputedStyle === "function") {
        const root = getComputedStyle(document.documentElement);
        const fillCss = root.getPropertyValue("--gl-color-poi-fill-default").trim();
        const strokeCss = root.getPropertyValue("--gl-color-poi-stroke-default").trim();
        if (fillCss && !base.colorFill)
            base.colorFill = fillCss;
        if (strokeCss && !base.colorStroke)
            base.colorStroke = strokeCss;
    }
}
function getPoiBaseConfig() {
    const base = {
        radius: 6,
        weight: 1.5,
        colorFill: "#4a90e5",
        colorStroke: "#ffffff",
        fillOpacity: 0.8,
        opacity: 0.9,
        showIconsOnMap: true,
    };
    try {
        const ConfigAny = Config;
        if (ConfigAny && typeof ConfigAny.getActiveProfile === "function") {
            const poiCfg = ConfigAny.getActiveProfile()?.appearance?.poi;
            if (poiCfg)
                _applyPoiProfileOverrides(poiCfg, base);
        }
        _getComputedPoiColors(base);
    }
    catch (err) {
        if (Log)
            Log.warn("[POI] getPoiBaseConfig() : Erreur lecture config :", err);
    }
    return base;
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - STATE Shared
 * Variables et constantes sharedes entre tous les sous-modules POI
 */
// ========================================
//   CONSTANTES
// ========================================
const POI_MARKER_SIZE = CONSTANTS.POI_MARKER_SIZE || 16;
const POI_MAX_ZOOM = CONSTANTS.POI_MAX_ZOOM || 18;
// Icon by default (circle bleu SVG en base64)
const defaultIconUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjNGE5MGU1IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==";
// ========================================
//   SHARED STATE
// ========================================
/**
 * STATE mutable shared entre tous les sous-modules POI
 */
const state = {
    // LayerGroup contenant tous the markers POI
    poiLayerGroup: null,
    // Cluster group (si activated)
    poiClusterGroup: null,
    // Array des data POI loadedes
    allPois: [],
    // Map pour stocker the markers par ID de POI
    poiMarkers: new Map(),
    // Configuration of the module POI
    poiConfig: {},
    // Reference vers the map
    mapInstance: null,
    // Indicator de loading en cours
    isLoading: false,
    // Element DOM pour the panel side POI
    sidePanelElement: null,
    // POI currentlement displayed dans the panel
    currentPoiInPanel: null,
    // Overlay de fond sombre for the side panel
    sidePanelOverlay: null,
    // Index of the image currente in the gallery
    currentGalleryIndex: 0,
    // ── MapLibre adapter ──────────────────────────────────────────────────
    /** IMapAdapter reference. */
    adapter: null,
    /** MapLibre cluster source ID (e.g. "poi-source"). */
    poiSourceId: null,
};
// ========================================
//   SHARED UTILITIES
// ========================================
/**
 * Helper internal : garantit qu'un maxZoom numeric est defined sur the map.
 * Used to avoid errors from the clustering plugin ("Map has no maxZoom specified").
 *
 * @param {unknown} map - Map instance
 * @param {number} [fallback=18] - Value by default si map.options.maxZoom n'existe pas
 */
function ensureMapMaxZoom(map, fallback = 18) {
    if (!map || !map.options)
        return;
    if (typeof map.options.maxZoom !== "number" || isNaN(map.options.maxZoom)) {
        map.options.maxZoom = fallback;
    }
}
// ========================================
//   EXPORT
// ========================================
const POIShared = {
    // Constantes (read seule)
    constants: Object.freeze({
        POI_MARKER_SIZE,
        POI_MAX_ZOOM,
        defaultIconUrl,
    }),
    // STATE mutable (accessible en read/write par sous-modules)
    state,
    // Utilitaires
    ensureMapMaxZoom,
    // ── Getters publics (8.3.1) ────────────────────────────────────────────
    /** @public Returns the array de tous les POI loadeds */
    getAllPois() {
        return state.allPois;
    },
    /** @public Returns the active layer pour the markers POI */
    getMarkerLayer() {
        return state.markerLayer || state.poiClusterGroup || state.poiLayerGroup;
    },
    /** @public Returns the map instance */
    getMapInstance() {
        return state.mapInstance;
    },
    /** @public Returns the Map des markers par ID */
    getPoiMarkers() {
        return state.poiMarkers;
    },
};

/* eslint-disable security/detect-object-injection */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - Markers Styling
 * Resolution des colors et configuration d'display par category
 */
// ── Tiny generic helper (no CC cost vs ?? chains) ────────────────────────────
function _firstVal(...args) {
    for (const a of args)
        if (a !== null && a !== undefined)
            return a;
    return undefined;
}
// ── Category/subcategory ID resolution ───────────────────────────────────────
function _resolveCategoryId(poi) {
    const attrs = poi.attributes;
    const props = poi.properties;
    return _firstVal(poi.categoryId, poi.category, attrs?.categoryId, props?.categoryId, props?.category);
}
function _resolveSubCategoryId(poi) {
    const attrs = poi.attributes;
    const props = poi.properties;
    return _firstVal(poi.subCategoryId, poi.subCategory, poi.sub_category, attrs?.subCategoryId, props?.subCategoryId, props?.sub_category);
}
/** Casee-insensitive lookup of a category key in the categories config object. */
function _resolveCatKey(id, categoriesConfig) {
    if (!id || !categoriesConfig)
        return null;
    if (categoriesConfig[id])
        return id;
    const upper = String(id).toUpperCase();
    if (categoriesConfig[upper])
        return upper;
    const lower = String(id).toLowerCase();
    if (categoriesConfig[lower])
        return lower;
    return Object.keys(categoriesConfig).find((k) => k.toLowerCase() === lower) || null;
}
/** Resolve icon ID from category (+ optional subcategory) config entry. */
function _resolveIconId(categoriesConfig, resolvedCatKey, subCategoryId) {
    const cat = categoriesConfig[resolvedCatKey];
    if (subCategoryId && cat?.subcategories) {
        const subs = cat.subcategories;
        const lower = String(subCategoryId).toLowerCase();
        const subCat = subs[subCategoryId] || subs[String(subCategoryId).toUpperCase()] || subs[lower];
        if (subCat)
            return _firstVal(subCat.icon, subCat.iconId, cat.icon, cat.iconId, null);
    }
    return _firstVal(cat?.icon, cat?.iconId, null);
}
/**
 * Builds the MapLibre symbol image ID for a POI icon.
 * Returns `null` when `iconId` is absent.
 */
function _buildSymbolId(iconsConfig, iconId) {
    if (!iconId || !iconsConfig)
        return null;
    return (iconsConfig.symbolPrefix ?? "") + iconId;
}
/** Log a warning when a requested category key is not found in the taxonomy. */
function _warnUnknownCategory(categoryId) {
    if (categoryId && categoryId !== "undefined" && categoryId !== "null" && Log)
        Log.warn(`[POI] resolveCategoryDisplay() : Category '${categoryId}' not found in taxonomy.`);
}
// ── Layer-style colour application helpers ───────────────────────────────────
function _applyLayerStyleColors(colors, layerStyle) {
    if (layerStyle.fillColor)
        colors.colorFill = layerStyle.fillColor;
    if (layerStyle.color)
        colors.colorStroke = layerStyle.color;
    if (typeof layerStyle.weight === "number")
        colors.weight = layerStyle.weight;
    if (typeof layerStyle.radius === "number")
        colors.radius = layerStyle.radius;
    if (typeof layerStyle.fillOpacity === "number")
        colors.fillOpacity = layerStyle.fillOpacity;
    if (typeof layerStyle.opacity === "number")
        colors.opacity = layerStyle.opacity;
}
function _applyStyleResolverColors(colors, poi) {
    if (!StyleResolver)
        return;
    const styleColors = StyleResolver.resolvePoiColors(poi);
    if (styleColors.colorFill)
        colors.colorFill = styleColors.colorFill;
    if (styleColors.colorStroke)
        colors.colorStroke = styleColors.colorStroke;
    if (styleColors.colorRoute)
        colors.colorRoute = styleColors.colorRoute;
}
/**
 * Resolves les colors of a POI from category.style.json of the profile active.
 * Ordre de priority des colors :
 * 1. Style de the layer (poi._layerConfig.style)
 * 2. Style de category (category.style.json)
 * 3. Style by default (baseConfig)
 *
 * @param {object} poi - Data du POI.
 * @param {object} baseConfig - Configuration de base avec colors by default
 * @returns {object} { colorFill, colorStroke, colorRoute, weight, radius, fillOpacity, opacity }
 */
function resolveCategoryColors(poi, baseConfig) {
    const colors = {
        colorFill: baseConfig.colorFill,
        colorStroke: baseConfig.colorStroke,
        colorRoute: null,
        weight: baseConfig.weight,
        radius: baseConfig.radius,
        fillOpacity: baseConfig.fillOpacity !== undefined ? baseConfig.fillOpacity : null,
        opacity: baseConfig.opacity !== undefined ? baseConfig.opacity : null,
    };
    if (poi._layerConfig && poi._layerConfig.style)
        _applyLayerStyleColors(colors, poi._layerConfig.style);
    _applyStyleResolverColors(colors, poi);
    return colors;
}
/**
 * Resolves l'display of a POI (icon + colors) from the taxonomy et category.style.json of the profile active.
 * Ordre de priority des styles :
 * 1. Style de the layer (poi._layerConfig.style) for thes colors
 * 2. Style de category (category.style.json) for thes colors
 * 3. Taxonomie for thes icons
 * 4. Style by default (baseConfig)
 *
 * @param {object} poi - Data du POI.
 * @returns {object} Configuration d'display { useIcon, iconId, colorFill, colorStroke, weight, radius, fillOpacity, opacity }.
 */
function resolveCategoryDisplay(poi) {
    const ConfigAny = Config;
    const categoriesConfig = ConfigAny.getCategories?.() ?? {};
    const shared = POIShared;
    const poiConfig = shared ? shared.state.poiConfig : {};
    const showIconsOnMap = poiConfig.showIconsOnMap !== false;
    const baseConfig = getPoiBaseConfig();
    const colors = resolveCategoryColors(poi, baseConfig);
    const result = {
        useIcon: false,
        iconId: null,
        colorFill: colors.colorFill,
        colorStroke: colors.colorStroke,
        colorRoute: colors.colorRoute,
        weight: colors.weight,
        radius: colors.radius,
        fillOpacity: colors.fillOpacity,
        opacity: colors.opacity,
    };
    let _iconsConfig = null;
    if (showIconsOnMap) {
        try {
            _iconsConfig = ConfigAny.getIconsConfig?.() ?? null;
            if (_iconsConfig && _iconsConfig.showOnMap !== false)
                result.useIcon = true;
        }
        catch (_e) {
            /* fallback: showIconsOnMap remains true */
        }
    }
    const categoryId = _resolveCategoryId(poi);
    const subCategoryId = _resolveSubCategoryId(poi);
    const resolvedCatKey = _resolveCatKey(categoryId, categoriesConfig);
    if (resolvedCatKey) {
        result.iconId = _resolveIconId(categoriesConfig, resolvedCatKey, subCategoryId);
    }
    else {
        _warnUnknownCategory(categoryId);
        result.iconId = _iconsConfig?.defaultIcon ?? null;
    }
    result.symbolId = _buildSymbolId(_iconsConfig, result.iconId);
    return result;
}

/*!



 * GeoLeaf Core



 * © 2026 Mattieu Pottier



 * Released under the MIT License



 * https://geoleaf.dev



 */
/**



 * GeoLeaf POI Module - Markers Icon HTML



 * Generation des icons DivIcon (mode icon SVG sprite + mode circle simple)



 */
/**



 * Builds the icon (DivIcon) pour a marker POI.



 * Mode icon : utilise le sprite SVG profile avec circle de fond.



 * Mode simple : circle simple sans icon.



 *



 * @param {object} displayConfig - Configuration d'display { useIcon, iconId, colorFill, colorStroke, radius, weight, fillOpacity, opacity }.



 * @returns {unknown} Map icon configured.



 */
function _toColorWithAlpha(color, alpha) {
    if (alpha !== null && typeof alpha === "number" && color && color.startsWith("#")) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    }
    return color ?? "";
}
function _buildIconModeHtml(displayConfig, colorFill, colorStroke, iconSizeIcon, weight) {
    const iconsConfig = Config.getIconsConfig?.() ?? null;
    const iconPrefix = (iconsConfig && iconsConfig.symbolPrefix) || "gl-poi-cat-";
    const symbolId = iconPrefix + String(displayConfig.iconId).trim().toLowerCase().replace(/\s+/g, "-");
    return [
        `<div class="gl-poi-marker" style="--gl-poi-fill:${colorFill};--gl-poi-stroke:${colorStroke};width:${iconSizeIcon}px;height:${iconSizeIcon}px;">`,
        `<svg class="gl-poi-marker__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" style="overflow: visible;">`,
        `<circle cx="12" cy="12" r="10" fill="${colorFill}" stroke="${colorStroke}" stroke-width="${weight}"/>`,
        `<svg x="2" y="2" width="20" height="20" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" overflow="visible">`,
        `<use href="#${symbolId}" style="color: #ffffff"/>`,
        `</svg></svg></div>`,
    ].join("");
}
function _buildCircleModeHtml(colorFill, colorStroke, radius, iconSizeCircle, weight) {
    return [
        `<div class="gl-poi-marker" style="--gl-poi-fill:${colorFill};--gl-poi-stroke:${colorStroke};width:${iconSizeCircle}px;height:${iconSizeCircle}px;">`,
        `<svg class="gl-poi-marker__circle" aria-hidden="true" focusable="false">`,
        `<circle cx="50%" cy="50%" r="${radius}" fill="${colorFill}" stroke="${colorStroke}" stroke-width="${weight}" />`,
        `</svg></div>`,
    ].join("");
}
function buildMarkerIcon(displayConfig) {
    const baseConfig = getPoiBaseConfig();
    const radius = displayConfig.radius !== undefined ? displayConfig.radius : baseConfig.radius;
    const weight = displayConfig.weight !== undefined ? displayConfig.weight : baseConfig.weight;
    const fillOpacity = displayConfig.fillOpacity;
    const strokeOpacity = displayConfig.opacity;
    const iconSizeCircle = Math.max(Math.round(radius * 2 + weight * 2), 8);
    const iconSizeIcon = Math.max(Math.round(radius * 2 + weight * 2), 16);
    const colorFill = _toColorWithAlpha(displayConfig.colorFill, fillOpacity);
    const colorStroke = _toColorWithAlpha(displayConfig.colorStroke, strokeOpacity);
    if (displayConfig.useIcon && displayConfig.iconId) {
        return {
            html: _buildIconModeHtml(displayConfig, colorFill, colorStroke, iconSizeIcon, weight),
            className: "gl-poi-divicon",
            iconSize: [iconSizeIcon, iconSizeIcon],
            iconAnchor: [iconSizeIcon / 2, iconSizeIcon / 2],
            popupAnchor: [0, -(iconSizeIcon / 2)],
        };
    }
    return {
        html: _buildCircleModeHtml(colorFill, colorStroke, radius, iconSizeCircle, weight),
        className: "gl-poi-divicon",
        iconSize: [iconSizeCircle, iconSizeCircle],
        iconAnchor: [iconSizeCircle / 2, iconSizeCircle / 2],
        popupAnchor: [0, -(iconSizeCircle / 2)],
    };
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - Markers Sprite Loader
 * Injection asynchrone du sprite SVG of the profile active in the DOM
 */
function _getIconsConfig$1() {
    const ConfigAny = Config;
    if (typeof ConfigAny === "undefined")
        return null;
    if (typeof ConfigAny.getIconsConfig !== "function")
        return null;
    return ConfigAny.getIconsConfig();
}
function _logIconsCfgIfChanged(fn, iconsCfg) {
    if (fn._lastConfig && JSON.stringify(iconsCfg) === JSON.stringify(fn._lastConfig))
        return;
    if (Log)
        Log.debug("[POI] IconsConfig retrieved:", iconsCfg);
    fn._lastConfig = iconsCfg;
}
function _getSpriteUrl(iconsCfg) {
    if (!iconsCfg)
        return null;
    const spriteUrl = iconsCfg.spriteUrl;
    if (!spriteUrl)
        return null;
    if (typeof spriteUrl !== "string")
        return null;
    return spriteUrl;
}
function _buildSvgElement(svgText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
        if (Log)
            Log.warn("[POI] SVG sprite parsing error :", parserError.textContent);
        return null;
    }
    const svgEl = doc.documentElement;
    if (!svgEl)
        return null;
    if (svgEl.tagName.toLowerCase() !== "svg")
        return null;
    return svgEl;
}
function _appendSvgToBody(svgEl) {
    svgEl.setAttribute("data-geoleaf-sprite", "profile");
    svgEl.setAttribute("aria-hidden", "true");
    svgEl.style.position = "absolute";
    svgEl.style.width = "0";
    svgEl.style.height = "0";
    svgEl.style.overflow = "hidden";
    if (document.body.firstChild) {
        document.body.insertBefore(svgEl, document.body.firstChild);
    }
    else {
        document.body.appendChild(svgEl);
    }
    const symbolCount = svgEl.querySelectorAll("symbol").length;
    if (Log)
        Log.info("[POI] Profile SVG sprite injected into DOM (async).", symbolCount, "symbols loaded.");
}
async function _fetchAndInjectSprite(spriteUrl) {
    try {
        const response = await fetch(spriteUrl);
        if (!response.ok) {
            if (Log)
                Log.warn("[POI] Profile sprite load error: HTTP", response.status);
            return;
        }
        const svgText = await response.text();
        const svgEl = _buildSvgElement(svgText);
        if (!svgEl)
            return;
        _appendSvgToBody(svgEl);
    }
    catch (err) {
        if (Log)
            Log.warn("[POI] Profile sprite load error (async):", err);
    }
}
/**
 * Injecte le sprite SVG of the profile active in the DOM (asynchrone).
 */
async function ensureProfileSpriteInjectedSync() {
    const fn = ensureProfileSpriteInjectedSync;
    try {
        const iconsCfg = _getIconsConfig$1();
        if (!iconsCfg) {
            if (Log)
                Log.warn("[POI] Config.getIconsConfig not available or no config");
            return;
        }
        _logIconsCfgIfChanged(fn, iconsCfg);
        const spriteUrl = _getSpriteUrl(iconsCfg);
        if (!spriteUrl) {
            if (Log)
                Log.warn("[POI] spriteUrl missing or invalid:", iconsCfg.spriteUrl);
            return;
        }
        const existing = document.querySelector('svg[data-geoleaf-sprite="profile"]');
        if (existing) {
            if (Log)
                Log.debug("[POI] SVG sprite already injected");
            return;
        }
        if (Log)
            Log.info("[POI] Loading sprite from:", spriteUrl);
        await _fetchAndInjectSprite(spriteUrl);
    }
    catch (err) {
        if (Log)
            Log.warn("[POI] Profile sprite load error :", err);
    }
}

/* eslint-disable security/detect-object-injection */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI Content Builder - Helpers
 * Fonctions utilitaires sharedes pour tous les renderers/assemblers
 *
 * @module ui/content-builder/helpers
 * @version 1.2.0
 * @phase Phase 3 - Code Quality
 */
// ========================================
//   DEPENDENCY RESOLUTION (Phase 4 dedup — direct imports)
// ========================================
function getResolveField$3() {
    return resolveField$1;
}
function getEscapeHtml$3() {
    return escapeHtml;
}
// getActiveProfile and getLog imported from general-utils.js (Phase 4 dedup)
// ========================================
//   CONFIG SORTING
// ========================================
/**
 * Sort config array by order property (Phase 4 dedup: delegates to compareByOrder)
 * @param {Array<Object>} config - Config array with optional order property
 * @returns {Array<Object>} Sorted config array
 */
function sortConfigByOrder(config) {
    if (!Array.isArray(config))
        return [];
    return [...config].sort(compareByOrder);
}
// ========================================
//   BADGE TAXONOMY RESOLUTION
// ========================================
/**
 * Resolve string|number} value - Raw field value
 * @returns {string} Resolved label or original value
 *
 * @typedef {Object} POI
 * @property {string} id - POI identifier
 * @property {string} title - POI title
 * @property {Object} [attributes] - POI attributes
 * @property {string} [attributes.categoryId] - Category identifier
 * @property {string} [attributes.subCategoryId] - Subcategory identifier (duplicated 3 times)
 *
 * @param {Object} poi - POI data
 * @param {string} field - Field path (e.g., 'attributes.categoryId')
 * @param {any} value - Raw field value
 * @returns {string} Resolved label or original value
 *
 * @example
 * const label = resolveBadgeLabel(
 *   { attributes: { categoryId: 'restaurant' } },
 *   'attributes.categoryId',
 *   'restaurant'
 * );
 * // Returns: "Restaurants" (from taxonomy)
 */
function resolveBadgeLabel(poi, field, value) {
    const profile = getActiveProfile();
    const taxonomy = profile?.taxonomy;
    if (!taxonomy)
        return value;
    const attrs = poi.attributes || {};
    // Subcategory resolution
    if (field.includes("subCategoryId")) {
        const catId = attrs.categoryId || attrs.category;
        const catData = taxonomy.categories?.[catId];
        const subCatData = catData?.subcategories?.[value];
        return subCatData?.label || value;
    }
    // Category resolution
    if (field.includes("categoryId")) {
        const catData = taxonomy.categories?.[value];
        return catData?.label || value;
    }
    return value;
}
// ========================================
//   DEFAULT TITLE EXTRACTION
// ========================================
/**
 * Extract default title from POI (various field names)
 * Extracted from popup/tooltip/panel renderers (duplicated 3 times)
 *
 * @param {Object} poi - POI data
 * @returns {string} POI title or 'Sans title'
 *
 * @example
 * getDefaultTitle({ title: 'Restaurant ABC' }); // 'Restaurant ABC'
 * getDefaultTitle({ label: 'Museum' }); // 'Museum'
 * getDefaultTitle({}); // 'Sans title'
 */
function getDefaultTitle(poi) {
    if (!poi)
        return "Sans titre";
    const resolveField = getResolveField$3();
    return (poi.title ||
        poi.label ||
        poi.name ||
        resolveField(poi, "attributes.name", "attributes.nom", "properties.name", "properties.nom") ||
        "Sans titre");
}
// ========================================
//   DEBUG LOGGING
// ========================================
// For testing purposes only
let _testWindow = null;
/**
 * Check if debug mode is enabled for content builder
 * Extracted from assemblers.js (repeated pattern)
 *
 * @param {string} [context='popup'] - Context identifier (popup/tooltip/panel)
 * @returns {boolean}
 */
function isDebugEnabled(context = "popup") {
    const win = _testWindow || (typeof window !== "undefined" ? window : null);
    if (!win)
        return false;
    const debugFlags = {
        popup: win.__GEOLEAF_DEBUG_POPUP__,
        tooltip: win.__GEOLEAF_DEBUG_TOOLTIP__,
        panel: win.__GEOLEAF_DEBUG_PANEL__,
    };
    return !!debugFlags[context];
}
/**
 * Log debug message if debug enabled
 * @param {string} context - Context identifier
 * @param {string} message - Message to log
 * @param {*} [data] - Optional data to log
 */
function debugLog(context, message, data) {
    if (!isDebugEnabled(context))
        return;
    const log = getLog();
    if (data !== undefined) {
        log.warn(`[ContentBuilder.${context}] ${message}`, data);
    }
    else {
        log.warn(`[ContentBuilder.${context}] ${message}`);
    }
}
// ========================================
//   FIELD VALUE VALIDATION
// ========================================
/**
 * Check if field value is empty/invalid
 * @param {*} value - Value to check
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.allowZero=true] - Allow 0 as valid value
 * @param {boolean} [options.allowEmptyArray=false] - Allow [] as valid value
 * @param {boolean} [options.allowEmptyString=false] - Allow '' as valid value
 * @returns {boolean} True if value is empty/invalid
 */
function isEmptyValue(value, options = {}) {
    const { allowZero = true, allowEmptyArray = false, allowEmptyString = false } = options;
    // Null/undefined
    if (value === null || value === undefined)
        return true;
    // Zero
    if (value === 0)
        return !allowZero;
    // Empty string
    if (value === "")
        return !allowEmptyString;
    // Empty array
    if (Array.isArray(value) && value.length === 0)
        return !allowEmptyArray;
    return false;
}
/**
 * Get field value from POI and validate
 * @param {Object} poi - POI data
 * @param {string} field - Field path
 * @param {Object} [options] - Validation options
 * @returns {*|null} Field value or null if invalid
 */
function getValidFieldValue(poi, field, options = {}) {
    const resolveField = getResolveField$3();
    const value = resolveField(poi, field);
    return isEmptyValue(value, options) ? null : value;
}
// ========================================
//   HTML BUILDER UTILITIES
// ========================================
/**
 * Wrap content in div with className
 * @param {string} content - HTML content
 * @param {string} className - CSS class name
 * @returns {string} Wrapped HTML
 */
function wrapInDiv(content, className) {
    return `<div class="${className}">${content}</div>`;
}
/**
 * Create badge HTML element
 * @param {string} text - Badge text
 * @param {string} [style=''] - Inline style attribute
 * @returns {string} Badge HTML
 */
function createBadge(text, style = "") {
    const escapeHtml = getEscapeHtml$3();
    const escapedText = escapeHtml(text);
    const styleAttr = style ? ` style="${style}"` : "";
    return `<span class="gl-poi-badge"${styleAttr}>${escapedText}</span>`;
}
/**
 * Create image HTML element
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} [className='gl-poi-popup__photo'] - CSS class name
 * @returns {string} Image HTML
 */
function createImage(src, alt, className = "gl-poi-popup__photo") {
    const escapeHtml = getEscapeHtml$3();
    const escapedSrc = escapeHtml(src);
    const escapedAlt = escapeHtml(alt);
    return `<div class="${className}"><img src="${escapedSrc}" alt="${escapedAlt}" loading="lazy" /></div>`;
}
/**
 * Create link HTML element
 * @param {string} href - Link URL
 * @param {string} text - Link text
 * @param {Object} [options] - Link options
 * @param {boolean} [options.external=false] - Open in new tab
 * @param {string} [options.className='gl-poi-link'] - CSS class name
 * @returns {string} Link HTML
 */
function createLink(href, text, options = {}) {
    const escapeHtml = getEscapeHtml$3();
    const { external = false, className = "gl-poi-link" } = options;
    const escapedHref = escapeHtml(href);
    const escapedText = escapeHtml(text);
    const targetAttr = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${escapedHref}" class="${className}"${targetAttr}>${escapedText}</a>`;
}
// ========================================
//   EXPORTS
// ========================================
const Helpers = {
    // Dependency resolution
    getResolveField: getResolveField$3,
    getEscapeHtml: getEscapeHtml$3,
    getActiveProfile,
    getLog,
    // Config sorting
    sortConfigByOrder,
    // Badge resolution
    resolveBadgeLabel,
    // Title extraction
    getDefaultTitle,
    // Debug logging
    isDebugEnabled,
    debugLog,
    // Field validation
    isEmptyValue,
    getValidFieldValue,
    // HTML builders
    wrapInDiv,
    createBadge,
    createImage,
    createLink,
    // Test utilities (only in test environments)
    __setDebugWindow: (win) => {
        _testWindow = win;
    },
};

/* eslint-disable security/detect-object-injection */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
// ========================================
//   DEPENDENCIES & HELPERS
// ========================================
/**
 * Phase 4 dedup: resolveField direct import wrapper
 * @returns {Function}
 */
function getResolveField$2() {
    return resolveField$1;
}
/**
 * Phase 4 dedup: escapeHtml direct import wrapper
 * @returns {Function}
 */
function getEscapeHtml$2() {
    return escapeHtml;
}
// getActiveProfile and getLog imported from general-utils.js (Phase 4 dedup)
// ========================================
//   VALIDATORS
// ========================================
/**
 * Validates an image URL by checking allowed protocols and structure.
 *
 * Utilise GeoLeaf.Security.validateUrl si available, sinon applique une validation
 * basique avec whitelist de protocoles (https://, http://, data:image//, /, ./).
 *
 * @function validateImageUrl
 * @param {string} url - URL to validate
 * @returns {string|null} URL valide (trimmed) ou null si invalid
 *
 * @example
 * // URL HTTPS valide
 * const url1 = validateImageUrl('https://example.com/photo.jpg');
 * // Returns: 'https://example.com/photo.jpg'
 *
 * @example
 * // Data URL valide
 * const url2 = validateImageUrl('data:image/png;base64,iVBORw0KG...');
 * // Returns: 'data:image/png;base64,iVBORw0KG...'
 *
 * @example
 * // Path relatif valide
 * const url3 = validateImageUrl('/images/photo.jpg');
 * // Returns: '/images/photo.jpg'
 *
 * @example
 * // URL invalid (protocole interdit)
 * const url4 = validateImageUrl('javascript:alert(1)');
 * // Returns: null
 */
function validateImageUrl(url) {
    if (!url || typeof url !== "string")
        return null;
    // Utiliser le validator de GeoLeaf.Security si available
    try {
        return validateUrl(url);
    }
    catch (e) {
        getLog().warn("[ContentBuilder.Core] URL image invalide:", e.message);
        return null;
    }
}
/**
 * Validates geographical coordinates (latitude, longitude) with support
 * for multiple input formats.
 *
 * Supporte:
 * - Format array: [lat, lng]
 * - Format object: {lat: number, lng: number}
 * - Validation limits: lat ∈ [-90, 90], lng ∈ [-180, 180]
 *
 * @function validateCoordinates
 * @param {Array<number>|Object|*} value - Coordinates to validate
 * @returns {{lat: number, lng: number}|null} Valid coordinates or null
 *
 * @example
 * // Format array
 * const coords1 = validateCoordinates([45.7578, 4.8320]);
 * // Returns: { lat: 45.7578, lng: 4.8320 }
 *
 * @example
 * // Format object
 * const coords2 = validateCoordinates({ lat: 45.7578, lng: 4.8320 });
 * // Returns: { lat: 45.7578, lng: 4.8320 }
 *
 * @example
 * // Invalid coordinates (out of bounds)
 * const coords3 = validateCoordinates([95, 200]);
 * // Returns: null (lat > 90, lng > 180)
 *
 * @example
 * // Format invalid
 * const coords4 = validateCoordinates('45.7578, 4.8320');
 * // Returns: null (string not supported)
 */
function validateCoordinates(value) {
    if (value == null)
        return null;
    let lat, lng;
    // Format array [lat, lng]
    if (Array.isArray(value) && value.length >= 2) {
        lat = parseFloat(value[0]);
        lng = parseFloat(value[1]);
    }
    // Format object {lat, lng}
    else if (typeof value === "object" && value.lat !== undefined && value.lng !== undefined) {
        lat = parseFloat(value.lat);
        lng = parseFloat(value.lng);
    }
    // Format invalid
    else {
        return null;
    }
    // Validation des values
    if (isNaN(lat) || isNaN(lng))
        return null;
    if (lat < -90 || lat > 90)
        return null;
    if (lng < -180 || lng > 180)
        return null;
    return { lat, lng };
}
/**
 * Validates a numeric value by converting it if necessary.
 *
 * Accepte number, string convertible en number.
 * Rejette NaN, null, undefined, strings emptys.
 *
 * @function validateNumber
 * @param {number|string|*} value - Value to validate
 * @returns {number|null} Nombre valide ou null si invalid
 *
 * @example
 * // Number direct
 * const num1 = validateNumber(42.5);
 * // Returns: 42.5
 *
 * @example
 * // String convertible
 * const num2 = validateNumber('42.5');
 * // Returns: 42.5
 *
 * @example
 * // Values invalids
 * validateNumber(null);      // null
 * validateNumber('');        // null
 * validateNumber('abc');     // null
 * validateNumber(NaN);       // null
 * validateNumber(undefined); // null
 */
function validateNumber(value) {
    if (value == null || value === "")
        return null;
    const num = typeof value === "number" ? value : parseFloat(value);
    return isNaN(num) ? null : num;
}
/**
 * Validates a rating in the 0-5 scale.
 *
 * Uses validateNumber then checks that the value is in [0, 5].
 * Useful for 5-star rating systems.
 *
 * @function validateRating
 * @param {number|string|*} value - Rating to validate
 * @returns {number|null} Valid rating ∈ [0, 5] or null if invalid
 *
 * @example
 * // Rating valide
 * const rating1 = validateRating(4.5);
 * // Returns: 4.5
 *
 * @example
 * // Rating valide (limites)
 * const rating2 = validateRating(0);   // 0 (valide)
 * const rating3 = validateRating(5);   // 5 (valide)
 *
 * @example
 * // Rating invalid (hors limites)
 * const rating4 = validateRating(-1);  // null (< 0)
 * const rating5 = validateRating(6);   // null (> 5)
 * const rating6 = validateRating('excellent'); // null (non-numeric)
 */
function validateRating(value) {
    const num = validateNumber(value);
    if (num === null)
        return null;
    if (num < 0 || num > 5)
        return null;
    return num;
}
// ========================================
//   BADGE RESOLVER (Taxonomie + Styles)
// ========================================
/**
 * Resolves a badge by applying the layer's taxonomy and styleRules.
 *
 * Process:
 * 1. Retrieves the value via resolveField (ex: categoryId)
 * 2. Cherche le label dans taxonomy.categories ou subcategories
 * 3. Applies thes colors from GeoLeaf.Helpers.StyleResolver
 * 4. Returns { displayValue, style } pour display HTML
 *
 * Handles 2 field types:
 * - categoryId: main category resolution
 * - subCategoryId: sub-category resolution (with parent categoryId)
 *
 * @function resolveBadge
 * @param {Object} poi - POI avec attributes et _layerConfig
 * @param {Object} poi.attributes - Attributes du POI (categoryId, subCategoryId, etc.)
 * @param {Object} poi._layerConfig - Configuration de the layer (styleRules)
 * @param {string} field - Path du field (ex: 'attributes.categoryId')
 * @param {string} [variant] - Badge variant (not currently used)
 * @returns {{displayValue: string, style: string}} Resolved badge
 * @returns {string} returns.displayValue - Label du badge (taxonomy ou value brute)
 * @returns {string} returns.style - CSS inline (background-color, border-color)
 *
 * @example
 * // Main category resolution
 * const badge1 = resolveBadge(
 *   { attributes: { categoryId: 'restaurant' }, _layerConfig: { id: 'pois' } },
 *   'attributes.categoryId'
 * );
 * // Returns: {
 * //   displayValue: 'Restaurant',
 * //   style: 'background-color: #e74c3c; border-color: #c0392b;'
 * // }
 *
 * @example
 * // Sub-category resolution
 * const badge2 = resolveBadge(
 *   { attributes: { categoryId: 'restaurant', subCategoryId: 'gastronomique' } },
 *   'attributes.subCategoryId'
 * );
 * // Returns: { displayValue: 'Gastronomique', style: '...' }
 *
 * @example
 * // Value not mapped in taxonomy
 * const badge3 = resolveBadge(
 *   { attributes: { categoryId: 'unknown' } },
 *   'attributes.categoryId'
 * );
 * // Returns: { displayValue: 'unknown', style: '' }
 */
function resolveBadge(poi, field, _variant) {
    const resolveField = getResolveField$2();
    const value = resolveField(poi, field);
    if (value == null || value === "") {
        return { displayValue: "", style: "" };
    }
    const profile = getActiveProfile();
    const taxonomy = profile?.taxonomy;
    let displayValue = String(value);
    let style = "";
    // Pas de taxonomy : return simple
    if (!taxonomy || !field) {
        return { displayValue, style };
    }
    const attrs = poi.attributes || {};
    // Phase 4 dedup: factored taxonomy label resolution
    if (field.includes("subCategoryId")) {
        const catId = attrs.categoryId || attrs.category;
        const catData = taxonomy.categories?.[catId];
        const subCatData = catData?.subcategories?.[value];
        if (subCatData?.label)
            displayValue = subCatData.label;
    }
    else if (field.includes("categoryId")) {
        const catData = taxonomy.categories?.[value];
        if (catData?.label)
            displayValue = catData.label;
    }
    // Phase 4 dedup: single color resolution block (was duplicated for cat + subcat)
    if (getColorsFromLayerStyle && poi._layerConfig) {
        const styleColors = getColorsFromLayerStyle(poi, poi._layerConfig.id);
        if (styleColors) {
            if (styleColors.fillColor)
                style += "background-color: " + styleColors.fillColor + ";";
            if (styleColors.color)
                style += "border-color: " + styleColors.color + ";";
        }
    }
    return { displayValue, style };
}
/**
 * Resolves un badge pour tooltip (text only, sans styles).
 *
 * Simplified version of resolveBadge:
 * - Returns aiquement le text (displayValue)
 * - Pas de styles CSS
 * - Optimized for limited HTML tooltips
 *
 * Supporte also categoryId et subCategoryId avec Resolution taxonomy.
 *
 * @function resolveBadgeTooltip
 * @param {Object} poi - POI avec attributes
 * @param {Object} poi.attributes - Attributes du POI
 * @param {string} field - Path du field (ex: 'attributes.categoryId')
 * @returns {string} Label du badge (ou value brute si pas de taxonomy)
 *
 * @example
 * // Category resolution avec taxonomy
 * const text1 = resolveBadgeTooltip(
 *   { attributes: { categoryId: 'restaurant' } },
 *   'attributes.categoryId'
 * );
 * // Returns: 'Restaurant' (label taxonomy)
 *
 * @example
 * // Sub-category resolution
 * const text2 = resolveBadgeTooltip(
 *   { attributes: { categoryId: 'restaurant', subCategoryId: 'gastronomique' } },
 *   'attributes.subCategoryId'
 * );
 * // Returns: 'Gastronomique'
 *
 * @example
 * // Value empty
 * const text3 = resolveBadgeTooltip(
 *   { attributes: {} },
 *   'attributes.unknownField'
 * );
 * // Returns: ''
 */
/**
 * Phase 4 dedup: resolveBadgeTooltip delegates to resolveBadge (text only)
 */
function resolveBadgeTooltip(poi, field) {
    const result = resolveBadge(poi, field);
    return result.displayValue;
}
// ========================================
//   UTILITAIRES DE FORMATAGE
// ========================================
/**
 * Formats a number with French locale (FR separators).
 *
 * Utilise toLocaleString('fr-FR'):
 * - Thousands separator: narrow no-break space (\u202f)
 * - Decimal separator: comma
 *
 * @function formatNumber
 * @param {number} num - Number to format
 * @returns {string} Number formatted with French conventions
 *
 * @example
 * // Entier
 * const str1 = formatNumber(1234567);
 * // Returns: '1\u202f234\u202f567'
 *
 * @example
 * // Decimal
 * const str2 = formatNumber(1234.56);
 * // Returns: '1\u202f234,56'
 *
 * @example
 * // Petit nombre
 * const str3 = formatNumber(42);
 * // Returns: '42'
 */
function formatNumber(num) {
    return num.toLocaleString("fr-FR");
}
/**
 * Formats geographical coordinates as a "lat, lng" string.
 *
 * Uses toFixed to control decimal precision.
 * Recommended precision: 6 decimals (~10cm precision).
 *
 * @function formatCoordinates
 * @param {number} lat - Latitude (∈ [-90, 90])
 * @param {number} lng - Longitude (∈ [-180, 180])
 * @param {number} [precision=6] - Number of decimals (1-15)
 * @returns {string} Formatted coordinates "lat, lng"
 *
 * @example
 * // Default precision (6 decimals)
 * const str1 = formatCoordinates(45.7578137, 4.8320114);
 * // Returns: '45.757814, 4.832011'
 *
 * @example
 * // High precision (8 decimals)
 * const str2 = formatCoordinates(45.7578137, 4.8320114, 8);
 * // Returns: '45.75781370, 4.83201140'
 *
 * @example
 * // Low precision (2 decimals)
 * const str3 = formatCoordinates(45.7578137, 4.8320114, 2);
 * // Returns: '45.76, 4.83'
 */
function formatCoordinates(lat, lng, precision = 6) {
    return lat.toFixed(precision) + ", " + lng.toFixed(precision);
}
/**
 * Formats a rating (note) au format "X.X/5".
 *
 * Uses toFixed to display the desired number of decimals.
 * Compatible with 5-star rating systems.
 *
 * @function formatRating
 * @param {number} rating - Rating to format (∈ [0, 5])
 * @param {number} [precision=1] - Number of decimals (0-2)
 * @returns {string} Formatted rating (ex: "4.5/5", "3/5")
 *
 * @example
 * // Default precision (1 decimal)
 * const str1 = formatRating(4.567);
 * // Returns: '4.6/5'
 *
 * @example
 * // No decimal
 * const str2 = formatRating(4.567, 0);
 * // Returns: '5/5'
 *
 * @example
 * // 2 decimals
 * const str3 = formatRating(4.567, 2);
 * // Returns: '4.57/5'
 *
 * @example
 * // Note parfaite
 * const str4 = formatRating(5);
 * // Returns: '5.0/5'
 */
function formatRating(rating, precision = 1) {
    return rating.toFixed(precision) + "/5";
}
// ========================================
//   EXPORT
// ========================================
const ContentBuilderCore = {
    // Helpers DEPENDENCIES
    getResolveField: getResolveField$2,
    getEscapeHtml: getEscapeHtml$2,
    getActiveProfile,
    getLog,
    // Validators
    validateImageUrl,
    validateCoordinates,
    validateNumber,
    validateRating,
    // Badge resolver
    resolveBadge,
    resolveBadgeTooltip,
    // Formatters
    formatNumber,
    formatCoordinates,
    formatRating,
};
getLog().info("[GeoLeaf._ContentBuilder.Core] Module Core loaded - Helpers + Validators + Badge resolver");

/**
 * GeoLeaf UI Content Builder - Text Renderers
 * Renderers: text, longtext, link
 *
 * @module ui/content-builder/renderers-text
 */
/**
 * Builds the HTML d'icone de categorie for thes titles.
 * @private
 */
function _buildCategoryIconHtml(options, poi) {
    if (!(options.includeIcon && options.resolveCategoryDisplay))
        return "";
    const displayConfig = options.resolveCategoryDisplay(poi);
    if (!displayConfig?.iconId)
        return "";
    const iconsConfig = typeof Config?.getIconsConfig === "function"
        ? Config.getIconsConfig()
        : null;
    const iconPrefix = iconsConfig?.symbolPrefix ?? "gl-poi-cat-";
    const iconIdNormalized = String(displayConfig.iconId).trim().toLowerCase().replace(/\s+/g, "-");
    const symbolId = iconPrefix + iconIdNormalized;
    const colorFill = displayConfig.colorFill ?? "#666";
    const colorStroke = displayConfig.colorStroke ?? "#222";
    return ('<svg class="gl-poi-popup__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">' +
        '<circle cx="12" cy="12" r="10" fill="' +
        colorFill +
        '" stroke="' +
        colorStroke +
        '" stroke-width="1.5"/>' +
        '<svg x="4" y="4" width="16" height="16" viewBox="0 0 32 32"><use href="#' +
        symbolId +
        '" style="color: #ffffff"/></svg>' +
        "</svg>");
}
/**
 * Builds a element de type "text"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderText(poi, config, options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    const escaped = escapeHtml(String(value));
    const variant = config.variant || "default";
    if (variant === "title") {
        return ('<h3 class="gl-poi-popup__title">' +
            _buildCategoryIconHtml(options, poi) +
            '<span class="gl-poi-popup__title-text">' +
            escaped +
            "</span></h3>");
    }
    if (variant === "short")
        return '<p class="gl-poi-popup__desc">' + escaped + "</p>";
    if (variant === "long" || variant === "paragraph")
        return '<p class="gl-poi-popup__desc gl-poi-popup__desc--long">' + escaped + "</p>";
    return '<p class="gl-poi-popup__desc">' + escaped + "</p>";
}
/**
 * Builds a element de type "longtext"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderLongtext(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    const escaped = escapeHtml(String(value));
    return ('<div class="gl-content__longtext"><p>' + escaped.replace(/\n/g, "</p><p>") + "</p></div>");
}
/**
 * Builds a element de type "link"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderLink(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    const label = escapeHtml(config.label || String(value));
    const variant = config.variant || "default";
    if (variant === "button") {
        return ('<a href="' +
            escapeHtml(String(value)) +
            '" target="_blank" rel="noopener noreferrer" class="gl-content__link gl-content__link--button">' +
            label +
            "</a>");
    }
    return ('<a href="' +
        escapeHtml(String(value)) +
        '" target="_blank" rel="noopener noreferrer" class="gl-content__link">' +
        label +
        "</a>");
}

/**
 * GeoLeaf UI Content Builder - Numeric Renderers
 * Renderers: number, metric, rating
 *
 * @module ui/content-builder/renderers-numeric
 */
function _formatNumberHtml(numValue, config) {
    const formatted = numValue.toLocaleString("fr-FR");
    const label = config.label ? escapeHtml(config.label) : "";
    const variant = config.variant || "default";
    if (variant === "stat") {
        return ('<div class="gl-content__stat">' +
            (label ? '<span class="gl-content__stat-label">' + label + "</span>" : "") +
            '<span class="gl-content__stat-value">' +
            formatted +
            "</span>" +
            "</div>");
    }
    return ('<p class="gl-content__number">' +
        (label ? "<strong>" + label + ":</strong> " : "") +
        formatted +
        "</p>");
}
/**
 * Builds a element de type "number"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderNumber(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    const numValue = Number(value);
    if (isNaN(numValue))
        return "";
    if (formatNumber$1)
        return formatNumber$1(numValue);
    return _formatNumberHtml(numValue, config);
}
/**
 * Builds a element de type "metric" (KPI, statistiques avec suffix/prefixe)
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {string} [config.field] - Path du field
 * @param {string} [config.label] - Label optional
 * @param {string} [config.prefix] - Prefixe (ex: "+", "-")
 * @param {string} [config.suffix] - Suffixe (ex: "%", "€", " km²")
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderMetric(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    const numValue = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(numValue))
        return "";
    const formatted = numValue.toLocaleString("fr-FR");
    const label = config.label ? escapeHtml(config.label) : "";
    const suffix = config.suffix ? escapeHtml(config.suffix) : "";
    const prefix = config.prefix ? escapeHtml(config.prefix) : "";
    return ('<p class="gl-content__metric">' +
        (label ? "<strong>" + label + ":</strong> " : "") +
        prefix +
        formatted +
        suffix +
        "</p>");
}
function _buildStarsHtml(rating) {
    let html = '<span class="gl-rating__stars">';
    for (let i = 1; i <= 5; i++) {
        const cls = i <= Math.round(rating) ? " gl-rating__star--filled" : "";
        html += '<span class="gl-rating__star' + cls + '">\u2605</span>';
    }
    return html + "</span>";
}
/**
 * Builds a element de type "rating" (note avec etoiles)
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderRating(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    const rating = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(rating))
        return "";
    const label = config.label ? escapeHtml(config.label) : "";
    const variant = config.variant || "default";
    const starsHtml = _buildStarsHtml(rating);
    const numericValue = rating.toFixed(1);
    if (variant === "stat") {
        return ('<div class="gl-rating gl-rating--stat">' +
            (label ? '<span class="gl-rating__label">' + label + "</span>" : "") +
            '<div class="gl-rating__content">' +
            starsHtml +
            '<span class="gl-rating__value">' +
            numericValue +
            "/5</span>" +
            "</div>" +
            "</div>");
    }
    return ('<div class="gl-rating">' +
        (label ? '<span class="gl-rating__label">' + label + ": </span>" : "") +
        starsHtml +
        '<span class="gl-rating__value">' +
        numericValue +
        "/5</span>" +
        "</div>");
}

/* eslint-disable security/detect-object-injection */
/**
 * GeoLeaf UI Content Builder - Visual Renderers
 * Renderers: badge, image
 *
 * @module ui/content-builder/renderers-visual
 */
function _resolveBadgeLabel(taxonomy, config, value, attrs) {
    if (!taxonomy || !config.field)
        return value;
    if (config.field.includes("categoryId") && !config.field.includes("subCategoryId")) {
        const catData = taxonomy.categories?.[value];
        if (catData?.label)
            return catData.label;
        return value;
    }
    if (!config.field.includes("subCategoryId"))
        return value;
    const catId = (attrs.categoryId || attrs.category);
    const catData = taxonomy.categories?.[catId];
    const subCatData = catData?.subcategories?.[value];
    if (subCatData?.label)
        return subCatData.label;
    return value;
}
function _resolveBadgeColors(poi, config) {
    let fillColor = null;
    let strokeColor = null;
    if (poi._layerConfig?.style) {
        if (poi._layerConfig.style.fillColor)
            fillColor = poi._layerConfig.style.fillColor;
        if (poi._layerConfig.style.color)
            strokeColor = poi._layerConfig.style.color;
    }
    if (getColorsFromLayerStyle && poi._layerConfig) {
        const styleColors = getColorsFromLayerStyle(poi, poi._layerConfig.id);
        if (styleColors?.fillColor)
            fillColor = styleColors.fillColor;
        if (styleColors?.color)
            strokeColor = styleColors.color;
    }
    return { fillColor, strokeColor };
}
function _isCategoryField(field) {
    if (field.includes("categoryId"))
        return true;
    if (field.includes("subCategoryId"))
        return true;
    return false;
}
/**
 * Builds a element de type "badge"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function _buildBadgeStyle(poi, config, taxonomy) {
    if (!taxonomy)
        return "";
    if (!config.field)
        return "";
    if (!_isCategoryField(config.field))
        return "";
    const { fillColor, strokeColor } = _resolveBadgeColors(poi);
    let style = "";
    if (fillColor)
        style += "background-color: " + fillColor + ";";
    if (strokeColor)
        style += "border-color: " + strokeColor + ";";
    return style;
}
function renderBadge(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    const profile = getActiveProfile();
    const taxonomy = profile?.taxonomy ?? null;
    const variant = config.variant || "default";
    const attrs = (poi.attributes ?? {});
    const displayValue = _resolveBadgeLabel(taxonomy, config, String(value), attrs);
    const style = _buildBadgeStyle(poi, config, taxonomy);
    const escaped = escapeHtml(String(displayValue));
    const badgeClass = "gl-poi-badge gl-poi-badge--" + variant;
    return ('<span class="' +
        badgeClass +
        '"' +
        (style ? ' style="' + style + '"' : "") +
        ">" +
        escaped +
        "</span>");
}
/**
 * Builds a element de type "image"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderImage(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    let photoUrl = null;
    try {
        photoUrl = validateUrl(String(value));
    }
    catch (e) {
        getLog().warn("[ContentBuilder.Shared] URL image invalide:", e.message);
        return "";
    }
    if (!photoUrl)
        return "";
    const alt = escapeHtml(config.label || "Image");
    return ('<div class="gl-poi-popup__photo"><img src="' +
        photoUrl +
        '" alt="' +
        alt +
        '" loading="lazy" /></div>');
}

/**
 * GeoLeaf UI Content Builder - Collection Renderers
 * Renderers: list, table, tags, gallery, reviews
 *
 * @module ui/content-builder/renderers-collection
 */
/**
 * Builds a element de type "list"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderList(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null)
        return "";
    const variant = config.variant || "disc";
    let items = [];
    if (Array.isArray(value)) {
        items = value;
    }
    else if (typeof value === "object" && value !== null) {
        // Object key-value (ex: price)
        items = Object.entries(value).map(([k, v]) => k + ": " + v);
    }
    else {
        return "";
    }
    if (items.length === 0)
        return "";
    const listClass = "gl-content__list gl-content__list--" + variant;
    let html = '<ul class="' + listClass + '">';
    items.forEach((item) => {
        html += "<li>" + escapeHtml(String(item)) + "</li>";
    });
    html += "</ul>";
    return html;
}
/** @private Builds the opening <table> tag with borders and style. */
function _buildTableOpenTag(config) {
    const borders = config.borders || {};
    const styleAttr = borders.color
        ? ' style="--gl-table-border-color: ' + borders.color + ';"'
        : "";
    let cls = "gl-content__table";
    if (borders.outer)
        cls += " gl-content__table--border-outer";
    if (borders.row)
        cls += " gl-content__table--border-row";
    if (borders.column)
        cls += " gl-content__table--border-column";
    return '<table class="' + cls + '"' + styleAttr + ">";
}
/** @private Builds the <thead> element for a table. */
function _buildTableHead(columns) {
    let html = "<thead><tr>";
    columns.forEach((col) => {
        html += "<th>" + escapeHtml(col.label || col.key) + "</th>";
    });
    return html + "</tr></thead>";
}
/** @private Builds the <tbody> element for a table. */
function _buildTableBody(value, columns) {
    let html = "<tbody>";
    value.forEach((row) => {
        html += "<tr>";
        columns.forEach((col) => {
            const cellValue = typeof row === "object" && row !== null
                ? (row[col.key] ?? "")
                : row;
            html += "<td>" + escapeHtml(String(cellValue)) + "</td>";
        });
        html += "</tr>";
    });
    return html + "</tbody></table>";
}
/**
 * Builds a element de type "table"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderTable(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || !Array.isArray(value) || value.length === 0)
        return "";
    const columns = config.columns || [];
    if (columns.length === 0)
        return "";
    return _buildTableOpenTag(config) + _buildTableHead(columns) + _buildTableBody(value, columns);
}
/**
 * Builds a element de type "tags"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderTags(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || !Array.isArray(value) || value.length === 0)
        return "";
    let html = '<div class="gl-content__tags">';
    value.forEach((tag) => {
        if (tag && typeof tag === "string") {
            html += '<span class="gl-content__tag">' + escapeHtml(tag) + "</span>";
        }
    });
    html += "</div>";
    return html;
}
/**
 * Builds a element de type "gallery"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderGallery(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || !Array.isArray(value) || value.length === 0)
        return "";
    let html = '<div class="gl-content__gallery">';
    value.forEach((imgUrl, index) => {
        if (imgUrl && typeof imgUrl === "string") {
            html +=
                '<div class="gl-content__gallery-item" data-index="' +
                    index +
                    '">' +
                    '<img src="' +
                    escapeHtml(imgUrl) +
                    '" alt="Image ' +
                    (index + 1) +
                    '" loading="lazy" />' +
                    "</div>";
        }
    });
    html += "</div>";
    return html;
}
/** @private Renders the star rating sub-block of a review. */
function _renderReviewRating(review) {
    if (review.rating === undefined)
        return "";
    const rating = parseFloat(String(review.rating)) || 0;
    let html = '<div class="gl-content__review-rating">';
    for (let i = 1; i <= 5; i++) {
        html +=
            '<span class="gl-content__review-star' +
                (i <= rating ? " gl-content__review-star--filled" : "") +
                '">\u2605</span>';
    }
    return html + "</div>";
}
/** @private Renders the author/date meta sub-block of a review. */
function _renderReviewMeta(review) {
    const reviewAuthor = review.author || review.authorName;
    const reviewDate = review.date || review.createdAt;
    if (!(reviewAuthor || reviewDate))
        return "";
    let html = '<div class="gl-content__review-meta">';
    if (reviewAuthor) {
        const verifiedMark = review.verified
            ? ' <span class="gl-content__review-verified">\u2714</span>'
            : "";
        html +=
            '<span class="gl-content__review-author">' +
                escapeHtml(reviewAuthor) +
                verifiedMark +
                "</span>";
    }
    if (reviewDate) {
        html += '<span class="gl-content__review-date">' + escapeHtml(reviewDate) + "</span>";
    }
    return html + "</div>";
}
/** @private Renders a single review item. */
function _renderSingleReview(review) {
    if (!review)
        return "";
    let html = '<div class="gl-content__review">';
    html += _renderReviewRating(review);
    if (review.text || review.comment) {
        html +=
            '<p class="gl-content__review-text">' +
                escapeHtml(review.text || review.comment) +
                "</p>";
    }
    html += _renderReviewMeta(review);
    return html + "</div>";
}
/**
 * Builds a element de type "reviews"
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderReviews(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || !Array.isArray(value) || value.length === 0)
        return "";
    let html = '<div class="gl-content__reviews">';
    value.forEach((review) => {
        html += _renderSingleReview(review);
    });
    html += "</div>";
    return html;
}

/**
 * GeoLeaf UI Content Builder - Geo Renderers
 * Renderers: coordinates
 *
 * @module ui/content-builder/renderers-geo
 */
/**
 * Renders a `"coordinates"` field as a labelled coordinate pair.
 */
function renderCoordinates(poi, config, _options = {}) {
    const value = resolveField$1(poi, config.field ?? "");
    if (value == null || value === "")
        return "";
    let lat;
    let lng;
    if (Array.isArray(value) && value.length >= 2) {
        [lat, lng] = value;
    }
    else if (typeof value === "object" && value !== null && "lat" in value && "lng" in value) {
        const coords = value;
        lat = coords.lat;
        lng = coords.lng;
    }
    else {
        return "";
    }
    const label = config.label ? escapeHtml(config.label) : "Coordonn\u00e9es";
    const formatted = lat.toFixed(6) + ", " + lng.toFixed(6);
    return ('<div class="gl-content__coordinates">' +
        '<span class="gl-content__coordinates-label">' +
        label +
        ":</span> " +
        '<span class="gl-content__coordinates-value">' +
        formatted +
        "</span>" +
        "</div>");
}

/**
 * GeoLeaf UI Content Builder - Shared Renderers
 * Orchestrateur — importe et re-exporte tous les renderers individuels.
 *
 * @module ui/content-builder/renderers-shared
 * @version 1.2.0
 * @phase Phase 3 - UI Refactoring
 */
// ========================================
//   UTILITAIRES DE DEPENDANCES
// ========================================
/**
 * Phase 4 dedup: resolveField direct import wrapper
 * @returns {Function}
 */
function getResolveField$1() {
    return resolveField$1;
}
/**
 * Phase 4 dedup: escapeHtml direct import wrapper
 * @returns {Function}
 */
function getEscapeHtml$1() {
    return escapeHtml;
}
// ========================================
//   REGISTRE DES RENDERERS
// ========================================
const RENDERERS = {
    text: renderText,
    longtext: renderLongtext,
    number: renderNumber,
    metric: renderMetric,
    rating: renderRating,
    badge: renderBadge,
    image: renderImage,
    link: renderLink,
    list: renderList,
    table: renderTable,
    tags: renderTags,
    coordinates: renderCoordinates,
    gallery: renderGallery,
    reviews: renderReviews,
};
/**
 * Rend un element selon son type
 * @param {Object} poi - Donnees du POI
 * @param {Object} config - Configuration of the element
 * @param {Object} options - Options de rendu
 * @returns {string} HTML
 */
function renderItem$1(poi, config, options = {}) {
    if (!config || !config.type)
        return "";
    const renderer = RENDERERS[config.type];
    if (!renderer) {
        getLog().warn("[ContentBuilder.Shared] Unsupported render type:", config.type);
        return "";
    }
    return renderer(poi, config, options);
}
// ========================================
//   EXPORT
// ========================================
const ContentBuilderShared = {
    // Renderers individuels
    renderText,
    renderLongtext,
    renderNumber,
    renderMetric,
    renderRating,
    renderBadge,
    renderImage,
    renderLink,
    renderList,
    renderTable,
    renderTags,
    renderCoordinates,
    renderGallery,
    renderReviews,
    renderItem: renderItem$1,
    // Utilitaires
    getResolveField: getResolveField$1,
    getEscapeHtml: getEscapeHtml$1,
    getActiveProfile,
    getLog,
};
if (getLog().debug) {
    getLog().debug("[ContentBuilder.Shared] Renderers partages charges");
}

/* eslint-disable security/detect-object-injection */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf Content Builder - Assemblers Module
 *
 * Gère l'assemblage des éléments de contenu en structures complètes
 * for thes popups (detailPopup), tooltips (contentUnion) et panneaux latéraux (items).
 *
 * Organisation:
 * - Helpers: getCore, getRenderers, getResolveField, getEscapeHtml, etc.
 * - Assembleurs: buildPopupHTML, buildTooltipHTML, buildPanelItems
 *
 * @module ui/content-builder/assemblers
 * @author Assistant
 * @version 1.2.0
 * @since 2026-01-18 (Sprint 4.5 - Modularisation)
 *
 * @example
 * // Import des assembleurs
 * const Assemblers = GeoLeaf._ContentBuilder.Assemblers;
 *
 * @example
 * // Building of a popup complete
 * const popupHtml = Assemblers.buildPopupHTML(poi, config, options);
 *
 * @example
 * // Building of a tooltip
 * const tooltipHtml = Assemblers.buildTooltipHTML(poi, contentUnion);
 */
// ========================================
//   ACCÈS AUX MODULES
// ========================================
/**
 * Get Helpers module (centralized utilities)
 * @returns {Object}
 */
function getHelpers() {
    return Helpers || {};
}
function getRenderers() {
    return ContentBuilderShared || {};
}
// Phase 4 dedup: direct imports for resolveField, escapeHtml
function getResolveField() {
    return resolveField$1;
}
function getEscapeHtml() {
    return escapeHtml;
}
// getActiveProfile and getLog imported from general-utils.js (Phase 4 dedup)
function renderItem(poi, config, options = {}) {
    const renderers = getRenderers();
    if (renderers && renderers.renderItem) {
        return renderers.renderItem(poi, config, options);
    }
    return "";
}
// ========================================
//   ASSEMBLEURS
// ========================================
// ========================================
//   BUILD POPUP HTML
// ========================================
/**
 * Group popup sections by type (hero images, badges, other)
 * Extracted from buildPopupHTML to reduce complexity
 *
 * @private
 * @param {Array<Object>} sortedConfig - Sorted config array
 * @param {Object} poi - POI data
 * @param {Object} renderOptions - Render options
 * @returns {Array<{type: string, html?: string, items?: Array<string>}>} Groupd sections
 *
 * @typedef {Object} PopupSection
 * @property {'hero'|'badges'|'content'} type - Section type
 * @property {string} [html] - HTML content for hero/content sections
 * @property {Array<string>} [items] - Badge HTML items for badges section
 */
function groupPopupSections(sortedConfig, poi, renderOptions) {
    const sections = [];
    let badgeGroup = [];
    // ...logs [POPUP] supprimés...
    sortedConfig.forEach((item, index) => {
        const isHeroImage = item.type === "image" && item.variant === "hero";
        const isBadge = item.type === "badge";
        const nextItem = sortedConfig[index + 1];
        const nextIsBadge = nextItem && nextItem.type === "badge";
        const itemHtml = renderItem(poi, item, renderOptions);
        if (isHeroImage) {
            sections.push({ type: "hero", html: itemHtml });
        }
        else if (isBadge) {
            badgeGroup.push(itemHtml);
            if (!nextIsBadge) {
                sections.push({ type: "badges", items: [...badgeGroup] });
                badgeGroup = [];
            }
        }
        else {
            sections.push({ type: "content", html: itemHtml });
        }
    });
    return sections;
}
/**
 * Assemble popup HTML from groupd sections
 * Extracted from buildPopupHTML to reduce complexity
 *
 * @private
 * @param {Object} poi - POI data with id property
 * @param {Array<PopupSection>} sections - Groupd popup sections
 * @returns {string} Completee popup HTML
 */
function assemblePopupHTML(poi, sections) {
    let html = '<div class="gl-poi-popup">';
    let inBody = false;
    sections.forEach((section) => {
        if (section.type === "hero") {
            if (inBody) {
                html += "</div>";
                inBody = false;
            }
            html += section.html;
        }
        else {
            if (!inBody) {
                html += '<div class="gl-poi-popup__body">';
                inBody = true;
            }
            if (section.type === "badges") {
                html += '<div class="gl-poi-popup__badges">';
                section.items.forEach((badgeHtml) => {
                    html += badgeHtml;
                });
                html += "</div>";
            }
            else {
                html += section.html;
            }
        }
    });
    // Link "See plus"
    if (!inBody) {
        html += '<div class="gl-poi-popup__body">';
        inBody = true;
    }
    html +=
        '<a href="#" class="gl-poi-popup__link" data-poi-id="' +
            (poi.id || "") +
            '">Voir plus >>></a>';
    if (inBody) {
        html += "</div>";
    }
    html += "</div>";
    return html;
}
/**
 * Builds the HTML complete of a popup avec structure et groupment de badges.
 *
 * Gère la structure HTML du popup:
 * 1. Images hero (en dehors du body)
 * 2. Body avec badges groupés + autres éléments
 * 3. Link "See plus >>>" automatic
 *
 * Tri automatic par config.order, badges groupés si consécutifs.
 *
 * @security All user-supplied POI attribute values are escaped via `escapeHtml()`
 * before insertion into the DOM string. This prevents XSS injection through
 * malicious field values (e.g. `<script>` in `attributes.name`).
 * Do NOT bypass `escapeHtml()` when adding new renderer types.
 *
 * @function buildPopupHTML
 * @param {Object} poi - Données du POI normalisé
 * @param {Object} poi.id - ID du POI
 * @param {Object} poi.attributes - Attributes du POI
 * @param {Array<Object>} config - Configuration detailPopup (array de renderers)
 * @param {Object} config[].type - Type of renderer ('text', 'badge', 'image', etc.)
 * @param {number} config[].order - Ordre d'display (tri croissant)
 * @param {string} [config[].variant] - Variante (ex: 'hero' pour images)
 * @param {Object} [options={}] - Options de rendu
 * @param {Function} [options.resolveCategoryDisplay] - Résolution taxonomy personnalisée
 * @returns {string} HTML complete du popup
 *
 * @example
 * // Popup avec image hero + badges + text
 * const html = buildPopupHTML(
 *   poi,
 *   [
 *     { type: 'image', field: 'attributes.photo', variant: 'hero', order: 1 },
 *     { type: 'badge', field: 'attributes.categoryId', order: 2 },
 *     { type: 'badge', field: 'attributes.status', order: 3 },
 *     { type: 'text', field: 'attributes.description', order: 4 }
 *   ],
 *   {}
 * );
 * // Returns:
 * // <div class="gl-poi-popup">
 * //   <img src="..." class="gl-poi-popup__hero"> (hero en dehors du body)
 * //   <div class="gl-poi-popup__body">
 * //     <div class="gl-poi-popup__badges">
 * //       <span class="gl-poi-badge">Restaurant</span>
 * //       <span class="gl-poi-badge">Open</span>
 * //     </div>
 * //     <p>Description...</p>
 * //     <a href="#" class="gl-poi-popup__link" data-poi-id="123">See plus >>></a>
 * //   </div>
 * // </div>
 */ /**
* Returns the HTML popup par defaut (sans config).
* @private
*/
function _getDefaultPopupHTML(poi, helpers, escapeHtmlFn) {
    const title = helpers.getDefaultTitle
        ? helpers.getDefaultTitle(poi)
        : poi.title || poi.label || poi.name || "Sans titre";
    helpers.debugLog?.("popup", "No config provided, using default popup", undefined);
    return ('<div class="gl-poi-popup">' +
        '<div class="gl-poi-popup__body">' +
        '<h3 class="gl-poi-popup__title"><span class="gl-poi-popup__title-text">' +
        escapeHtmlFn(String(title)) +
        "</span></h3>" +
        '<a href="#" class="gl-poi-popup__link" data-poi-id="' +
        (poi.id || "") +
        '">Voir plus >>></a>' +
        "</div></div>");
}
function buildPopupHTML(poi, config, options = {}) {
    // Get helpers and utilities FIRST
    const helpers = getHelpers();
    const escHtml = getEscapeHtml();
    if (!poi) {
        getLog().warn("[Assemblers] Invalid POI for buildPopupHTML");
        return "";
    }
    if (!config || !Array.isArray(config) || config.length === 0) {
        return _getDefaultPopupHTML(poi, helpers, escHtml);
    }
    // ...log supprimé ([POPUP] buildPopupHTML - config items)...
    // Use helpers for config sorting (Phase 4 dedup)
    const sortedConfig = helpers.sortConfigByOrder
        ? helpers.sortConfigByOrder(config)
        : [...config].sort(compareByOrder);
    const renderOptions = {
        context: "popup",
        includeIcon: true,
        resolveCategoryDisplay: options.resolveCategoryDisplay,
    };
    // ...log supprimé ([POPUP] buildPopupHTML - sorted config)...
    // Group sections and assemble HTML
    try {
        const sections = groupPopupSections(sortedConfig, poi, renderOptions);
        // ...log supprimé ([POPUP] buildPopupHTML - sections groupd)...
        const html = assemblePopupHTML(poi, sections);
        // ...log supprimé ([POPUP] buildPopupHTML - HTML length)...
        return html;
    }
    catch (err) {
        // ...log supprimé ([POPUP] ERROR in buildPopupHTML)...
        return ('<div class="gl-poi-popup"><div class="gl-poi-popup__body">Erreur: ' +
            escHtml(err.message) +
            "</div></div>");
    }
}
/**
 * Builds the HTML of a tooltip (text only, limité).
 *
 * Génère un tooltip simple avec values textualles séparées par " | ".
 * Pas de HTML complexe, optimisé pour tooltips Leaflet.
 *
 * Process:
 * 1. Si pas de config => utilise title/label/name par défaut
 * 2. Sinon extrait the values textualles de chaque renderer
 * 3. Gère badge resolution via resolveBadgeTooltip
 * 4. Joint les parties avec " | "
 *
 * @function buildTooltipHTML
 * @param {Object} poi - Données du POI normalisé
 * @param {Object} poi.title - Title par défaut
 * @param {Object} poi.attributes - Attributes du POI
 * @param {Array<Object>} config - Configuration detailTooltip (array de renderers)
 * @param {string} config[].type - Type of renderer ('text', 'badge', 'number', etc.)
 * @param {string} config[].field - Path du field (ex: 'attributes.name')
 * @param {number} [config[].order] - Ordre d'display (tri croissant)
 * @param {Object} [options={}] - Options de rendu
 * @returns {string} Text du tooltip (pas de HTML, text plat)
 *
 * @example
 * // Tooltip simple sans config
 * const text1 = buildTooltipHTML({ title: 'Restaurant Le Gourmet' }, []);
 * // Returns: 'Restaurant Le Gourmet'
 *
 * @example
 * // Tooltip avec config (name + category + rating)
 * const text2 = buildTooltipHTML(
 *   poi,
 *   [
 *     { type: 'text', field: 'attributes.name', order: 1 },
 *     { type: 'badge', field: 'attributes.categoryId', order: 2 },
 *     { type: 'number', field: 'attributes.rating', order: 3 }
 *   ]
 * );
 * // Returns: 'Le Gourmet | Restaurant | 4.5'
 *
 * @example
 * // Tooltip avec values manquantes (skipés)
 * const text3 = buildTooltipHTML(
 *   poi,
 *   [
 *     { type: 'text', field: 'attributes.name', order: 1 },
 *     { type: 'text', field: 'attributes.missingField', order: 2 }
 *   ]
 * );
 * // Returns: 'Le Gourmet' (missingField skippé)
 */ /**
* Returns the tooltip par defaut (sans config).
* @private
*/
function _getDefaultTooltip(poi, helpers, resolveFieldFn, escapeHtmlFn) {
    const title = helpers.getDefaultTitle
        ? helpers.getDefaultTitle(poi)
        : poi.title ||
            poi.label ||
            poi.name ||
            resolveFieldFn(poi, "attributes.name", "attributes.nom", "properties.name", "properties.nom") ||
            "Sans titre";
    return escapeHtmlFn(String(title));
}
/**
 * Returns the value affichable of a field badge dans un tooltip.
 * @private
 */
function _resolveTooltipBadgeValue(item, poi, value, helpers, _resolveField) {
    if (helpers.resolveBadgeLabel)
        return helpers.resolveBadgeLabel(poi, item.field ?? "", String(value));
    const profile = getActiveProfile();
    const taxonomy = profile?.taxonomy ?? null;
    if (!taxonomy)
        return value;
    const attrs = (poi.attributes ?? {});
    if ((item.field ?? "").includes("subCategoryId")) {
        const catId = String(attrs.categoryId ?? attrs.category ?? "");
        const catData = catId ? taxonomy.categories?.[catId] : undefined;
        const subCatData = catData?.subcategories?.[String(value)];
        if (subCatData?.label)
            return subCatData.label;
    }
    else if ((item.field ?? "").includes("categoryId")) {
        const catData = taxonomy.categories?.[String(value)];
        if (catData?.label)
            return catData.label;
    }
    return value;
}
/**
 * Adds the representation of a item dans the table parts of a tooltip.
 * @private
 */
function _addTooltipPart(item, poi, value, helpers, resolveFieldFn, escapeHtmlFn, parts) {
    if (item.type === "text" || item.type === "badge") {
        const displayValue = item.type === "badge"
            ? _resolveTooltipBadgeValue(item, poi, value, helpers)
            : value;
        parts.push(escapeHtmlFn(String(displayValue)));
    }
    else if (item.type === "number") {
        const numValue = typeof value === "number" ? value : parseFloat(String(value));
        if (!isNaN(numValue))
            parts.push(numValue.toLocaleString("fr-FR"));
    }
    else if (item.type === "image") {
        parts.push('<img src="' +
            escapeHtmlFn(String(value)) +
            '" alt="" style="max-width:150px;max-height:100px;display:block;margin:4px 0;" />');
    }
    else if (item.type === "link") {
        const label = item.label || String(value);
        parts.push('<a href="' +
            escapeHtmlFn(String(value)) +
            '" target="_blank">' +
            escapeHtmlFn(label) +
            "</a>");
    }
}
function buildTooltipHTML(poi, config, _options = {}) {
    if (!poi) {
        getLog().warn("[Assemblers] Invalid POI for buildTooltipHTML");
        return "";
    }
    const helpers = getHelpers();
    const escHtml = getEscapeHtml();
    const resField = getResolveField();
    // Si pas de config, tooltip par défaut - use helpers
    if (!config || !Array.isArray(config) || config.length === 0) {
        return _getDefaultTooltip(poi, helpers, resField, escHtml);
    }
    // Use helpers for config sorting (Phase 4 dedup)
    const sortedConfig = helpers.sortConfigByOrder
        ? helpers.sortConfigByOrder(config)
        : [...config].sort(compareByOrder);
    const parts = [];
    sortedConfig.forEach((item, _index) => {
        if (!item || !item.type || !item.field)
            return;
        const value = resField(poi, item.field ?? "");
        if (value == null || value === "")
            return;
        _addTooltipPart(item, poi, value, helpers, resField, escHtml, parts);
    });
    if (parts.length === 0)
        return escHtml(String(poi.title || poi.label || "Sans titre"));
    // Joindre avec contentUnion ou espace
    let result = "";
    parts.forEach((part, index) => {
        result += part;
        if (index < parts.length - 1) {
            const item = sortedConfig[index];
            if (item && item.contentUnion) {
                result += " " + escHtml(item.contentUnion) + " ";
            }
            else {
                result += " ";
            }
        }
    });
    return result;
}
/**
 * Builds thes éléments DOM pour a panel latéral (side panel / accordion).
 *
 * Génère un array d'objects pour chaque élément du panel:
 * - html: HTML rendu of the élément
 * - config: Configuration renderer originale
 * - label: Label of the élément (pour accordéon)
 * - accordion: Si true, élément dans un accordéon
 * - defaultOpen: Si true, accordéon open par défaut
 *
 * Tri automatic par config.order, éléments sans value skipés.
 *
 * @function buildPanelItems
 * @param {Object} poi - Données du POI normalisé
 * @param {Object} poi.attributes - Attributes du POI
 * @param {Array<Object>} config - Configuration detailLayout (array de renderers)
 * @param {string} config[].type - Type of renderer ('text', 'list', 'image', etc.)
 * @param {string} config[].field - Path du field (ex: 'attributes.description')
 * @param {number} [config[].order] - Ordre d'display (tri croissant)
 * @param {string} [config[].label] - Label of the élément (pour accordéon)
 * @param {boolean} [config[].accordion] - Si true, élément dans un accordéon
 * @param {boolean} [config[].defaultOpen=true] - Si false, accordéon fermé par défaut
 * @param {Object} [options={}] - Options de rendu
 * @returns {Array<Object>} Array d'objects {html, config, label, accordion, defaultOpen}
 * @returns {string} returns[].html - HTML rendu of the élément
 * @returns {Object} returns[].config - Configuration renderer originale
 * @returns {string} returns[].label - Label of the élément
 * @returns {boolean} returns[].accordion - Si true, élément dans un accordéon
 * @returns {boolean} returns[].defaultOpen - Si true, accordéon open par défaut
 *
 * @example
 * // Panel simple sans accordéon
 * const items1 = buildPanelItems(
 *   poi,
 *   [
 *     { type: 'text', field: 'attributes.name', label: 'Nom', order: 1 },
 *     { type: 'longtext', field: 'attributes.description', label: 'Description', order: 2 }
 *   ]
 * );
 * // Returns: [
 * //   { html: '<p>...</p>', config: {...}, label: 'Nom', accordion: false, defaultOpen: true },
 * //   { html: '<div>...</div>', config: {...}, label: 'Description', accordion: false, defaultOpen: true }
 * // ]
 *
 * @example
 * // Panel avec accordéons
 * const items2 = buildPanelItems(
 *   poi,
 *   [
 *     { type: 'text', field: 'attributes.name', label: 'Nom', order: 1 },
 *     { type: 'list', field: 'attributes.tags', label: 'Tags', accordion: true, defaultOpen: true, order: 2 },
 *     { type: 'gallery', field: 'attributes.photos', label: 'Photos', accordion: true, defaultOpen: false, order: 3 }
 *   ]
 * );
 * // Returns: [
 * //   { html: '<p>...</p>', label: 'Nom', accordion: false, defaultOpen: true },
 * //   { html: '<ul>...</ul>', label: 'Tags', accordion: true, defaultOpen: true },
 * //   { html: '<div>...</div>', label: 'Photos', accordion: true, defaultOpen: false }
 * // ]
 */ /** @private Returns true if the field value is considered non-empty. */
function _itemHasValue(value) {
    return (value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0));
}
/** @private Builds a single panel item object, or null if it should be skipped. */
function _processPanelItem(poi, itemConfig, renderOptions, resolveFieldFn) {
    if (!itemConfig?.type)
        return null;
    const value = resolveFieldFn(poi, itemConfig.field ?? "");
    if (!_itemHasValue(value) && itemConfig.type !== "coordinates")
        return null;
    const html = renderItem(poi, itemConfig, renderOptions);
    if (!html)
        return null;
    return {
        html,
        config: itemConfig,
        label: itemConfig.label || "",
        accordion: itemConfig.accordion === true,
        defaultOpen: itemConfig.defaultOpen !== false,
    };
}
function buildPanelItems(poi, config, options = {}) {
    if (!poi || !config || !Array.isArray(config)) {
        return [];
    }
    const resField = getResolveField();
    const renderOptions = { context: "panel", ...options };
    // Trier par order (Phase 4 dedup)
    const sortedConfig = [...config].sort(compareByOrder);
    const items = [];
    sortedConfig.forEach((itemConfig) => {
        const item = _processPanelItem(poi, itemConfig, renderOptions, resField);
        if (item)
            items.push(item);
    });
    return items;
}
// ========================================
//   EXPORT
// ========================================
const Assemblers = {
    buildPopupHTML,
    buildTooltipHTML,
    buildPanelItems,
};
getLog().info("[GeoLeaf._ContentBuilder.Assemblers] Module Assemblers chargé");

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - Popup & Tooltips
 * Gestion des popups rapides et tooltips sur the markers.
 * Delegates the render au module _ContentBuilder centralized.
 *
 * @module poi/popup
 * @version 1.2.0
 */
// ========================================
//   UTILITAIRES LOCAUX
// ========================================
/**
 * Retrieves the ContentBuilder (Assemblers).
 * Les fonctions buildPopupHTML / buildTooltipHTML sont sur le sous-module Assemblers.
 * @returns {Object|null}
 */
function getContentBuilder() {
    return Assemblers || null;
}
/**
 * Resolves the value of a field to partir d'an object POI.
 * Delegates to Utils.resolveField si available.
 *
 * @param {object} poi - Object POI source.
 * @param {string} field - Path du field (ex: "attributes.photo").
 * @returns {*} Value du field ou null.
 */
function resolveField(poi, field) {
    if (!poi || !field)
        return null;
    if (resolveField$1) {
        return resolveField$1(poi, field);
    }
    // Fallback minimum
    const parts = field.split(".");
    let current = poi;
    for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
            current = current[part];
        }
        else {
            return null;
        }
    }
    return current;
}
// escapeHtml imported directly from security/index.js (A3 — DEAD-01)
// ========================================
//   CONFIGURATION
// ========================================
/**
 * Retrieves the configuration de popup pour a layer/POI.
 *
 * @param {object} poi - Data du POI.
 * @returns {Array|null} Configuration detailPopup ou null.
 */
function getPopupConfig(poi) {
    // 1. Config attached from the layer du POI
    if (poi._layerConfig?.popup?.detailPopup) {
        Log?.info("[POI Popup] Config popup from layerConfig");
        return poi._layerConfig.popup.detailPopup;
    }
    // 2. Fallback: profile active
    if (Config && typeof Config.getActiveProfile === "function") {
        const profile = Config.getActiveProfile();
        // Chercher la config in thes emplacements standards
        if (profile?.popup?.detailPopup) {
            Log?.info("[POI Popup] Config popup from profile actif (profile.popup.detailPopup)");
            return profile.popup.detailPopup;
        }
        // ALTERNATIVE: Check aussi dans panels.poi (old structure)
        if (profile?.panels?.poi?.popup?.detailPopup) {
            Log?.info("[POI Popup] Config popup from profile actif (profile.panels.poi.popup.detailPopup - old structure)");
            return profile.panels.poi.popup.detailPopup;
        }
    }
    Log?.warn("[POI Popup] No detailPopup configuration found for POI:", poi.id || "unknown");
    return null;
}
/**
 * Retrieves the configuration de tooltip pour a layer/POI.
 *
 * @param {object} poi - Data du POI.
 * @returns {Array|null} Configuration detailTooltip ou null.
 */
function getTooltipConfig(poi) {
    // 1. Config from popup.detailTooltip (structure standard)
    if (poi._layerConfig?.popup?.detailTooltip) {
        return poi._layerConfig.popup.detailTooltip;
    }
    // 2. Config from tooltip.detailTooltip
    if (poi._layerConfig?.tooltip?.detailTooltip) {
        return poi._layerConfig.tooltip.detailTooltip;
    }
    // 3. Config directe detailTooltip
    if (poi._layerConfig?.detailTooltip) {
        return poi._layerConfig.detailTooltip;
    }
    // 4. Fallback: profile active
    if (Config && typeof Config.getActiveProfile === "function") {
        const profile = Config.getActiveProfile();
        if (profile?.popup?.detailTooltip) {
            return profile.popup.detailTooltip;
        }
    }
    return null;
}
// ========================================
//   CONSTRUCTION DU CONTENU
// ========================================
/**
 * Builds the contenu HTML of a popup rapide for a POI.
 * Utilise ContentBuilder si available, sinon logical internal.
 *
 * @security Output HTML is XSS-safe: all POI attribute values are escaped
 * by `buildPopupHTML()` via `escapeHtml()` (security/index). Do NOT inject
 * raw POI fields into the DOM outside this function.
 *
 * @param {object} poi - Data du POI.
 * @param {Function} resolveCategoryDisplay - Fonction pour resolve l'display de category.
 * @returns {string} HTML du popup.
 */
function buildQuickPopupContent(poi, resolveCategoryDisplay) {
    if (!poi) {
        Log.warn && Log.warn("[POI Popup] POI invalide");
        return "";
    }
    const config = getPopupConfig(poi);
    const ContentBuilder = getContentBuilder();
    // Si ContentBuilder available, delegate
    if (ContentBuilder && typeof ContentBuilder.buildPopupHTML === "function") {
        return ContentBuilder.buildPopupHTML(poi, config, {
            resolveCategoryDisplay: resolveCategoryDisplay,
        });
    }
    // Fallback si ContentBuilder non loaded
    Log.warn && Log.warn("[POI Popup] ContentBuilder non disponible, fallback basique");
    return buildFallbackPopup(poi);
}
/**
 * Builds the contenu of a tooltip for a POI.
 * Utilise ContentBuilder si available.
 *
 * @param {object} poi - Data du POI.
 * @param {Function} resolveCategoryDisplay - Fonction pour resolve l'display de category.
 * @returns {string} HTML du tooltip.
 */
function buildTooltipContent(poi, resolveCategoryDisplay) {
    if (!poi) {
        Log.warn && Log.warn("[POI Tooltip] POI invalide");
        return "";
    }
    const config = getTooltipConfig(poi);
    const ContentBuilder = getContentBuilder();
    // Si ContentBuilder available, delegate
    if (ContentBuilder && typeof ContentBuilder.buildTooltipHTML === "function") {
        return ContentBuilder.buildTooltipHTML(poi, config, {
            resolveCategoryDisplay: resolveCategoryDisplay,
        });
    }
    // Fallback si ContentBuilder non loaded
    return escapeHtml(resolveField(poi, "title") ||
        resolveField(poi, "label") ||
        resolveField(poi, "name") ||
        "POI");
}
/**
 * Fallback pour construire un popup basique sans ContentBuilder.
 *
 * @param {object} poi - Data du POI.
 * @param {Array} _config - Configuration detailPopup (reserved pour usage futur).
 * @param {Function} _resolveCategoryDisplay - Fonction pour resolve l'display de category (reserved).
 * @returns {string} HTML du popup.
 */
function buildFallbackPopup(poi, _config, _resolveCategoryDisplay) {
    const title = escapeHtml(resolveField(poi, "title") ||
        resolveField(poi, "label") ||
        resolveField(poi, "name") ||
        "POI");
    const description = resolveField(poi, "attributes.description") || resolveField(poi, "description") || "";
    let html = '<div class="gl-poi-popup">';
    html += '<div class="gl-poi-popup__body">';
    html +=
        '<h3 class="gl-poi-popup__title"><span class="gl-poi-popup__title-text">' +
            title +
            "</span></h3>";
    if (description) {
        html += '<p class="gl-poi-popup__desc">' + escapeHtml(description) + "</p>";
    }
    html +=
        '<a href="#" class="gl-poi-popup__link" data-poi-id="' +
            escapeHtml(String(poi.id || "")) +
            '">Voir plus >>></a>';
    html += "</div></div>";
    return html;
}
// ========================================
//   ATTACHMENT
// ========================================
/**
 * Attache un tooltip to a marker.
 *
 * @param {unknown} marker - Map marker.
 * @param {string} content - Contenu du tooltip (text).
 * @param {object} options - Options du tooltip.
 */
function attachTooltip(marker, content, options) {
    if (!marker || typeof marker.bindTooltip !== "function") {
        Log.warn && Log.warn("[POI Popup] Invalid marker for attachTooltip");
        return;
    }
    const defaultOptions = {
        direction: "top",
        offset: [0, -10],
        opacity: 0.9,
        className: "gl-poi-tooltip",
    };
    const finalOptions = Object.assign({}, defaultOptions, options || {});
    marker.bindTooltip(content, finalOptions);
}
/**
 * Manages the tooltip d'a marker based on the configuration.
 *
 * @param {unknown} marker - Map marker.
 * @param {object} poi - Data du POI.
 * @param {object} config - Configuration POI globale.
 * @param {Function} resolveCategoryDisplay - Fonction pour resolve l'display de category.
 */
function manageTooltip(marker, poi, config, resolveCategoryDisplay) {
    if (!marker || !poi)
        return;
    const tooltipMode = config?.tooltipMode || "hover"; // "hover", "permanent", "none"
    if (tooltipMode === "none") {
        return;
    }
    // Construire le contenu du tooltip
    const tooltipText = buildTooltipContent(poi, resolveCategoryDisplay);
    if (tooltipMode === "permanent") {
        attachTooltip(marker, tooltipText, { permanent: true });
    }
    else {
        attachTooltip(marker, tooltipText, undefined);
    }
}
/**
 * Attache un popup to a marker.
 *
 * @param {unknown} marker - Map marker.
 * @param {string} content - Contenu HTML du popup.
 * @param {object} options - Options du popup.
 */
/** Tags allowed inside popup HTML for DOMSecurity sanitisation. */
const POPUP_ALLOWED_TAGS = [
    "div",
    "h3",
    "h4",
    "span",
    "p",
    "a",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "ul",
    "ol",
    "li",
    "img",
    "svg",
    "path",
];
function attachPopup(marker, content, options) {
    if (!marker) {
        Log.error && Log.error("[POI Popup] Marker invalide");
        return;
    }
    const defaultOptions = {
        maxWidth: 300,
        minWidth: 200,
        className: "gl-poi-popup",
        closeButton: true,
    };
    const finalOptions = Object.assign({}, defaultOptions, options || {});
    // MapLibre path via adapter
    const _g = globalThis;
    const adapter = _g.GeoLeaf?.Core?.getAdapter?.();
    if (adapter && typeof adapter.createPopup === "function") {
        // Sanitize string content into a DOM element for defense-in-depth
        let safeContent = content;
        if (typeof content === "string") {
            const container = document.createElement("div");
            DOMSecurity.setSafeHTML(container, content, POPUP_ALLOWED_TAGS);
            safeContent = container;
        }
        const popup = adapter.createPopup(safeContent, finalOptions);
        // MapLibre Marker.setPopup() to bind popup to the marker
        if (typeof marker.setPopup === "function") {
            marker.setPopup(popup);
        }
        return;
    }
    // Fallback: bindPopup API compatibility shim
    if (typeof marker.bindPopup === "function") {
        marker.bindPopup(content, finalOptions);
    }
}
// ========================================
//   MAPLIBRE POPUP (Sprint 5)
// ========================================
/**
 * Opens a MapLibre popup for a POI via the adapter.
 * Builds content with the engine-agnostic `buildQuickPopupContent()`,
 * then delegates to `adapter.createPopup()` + `adapter.openPopup()`.
 *
 * @param adapter - IMapAdapter reference.
 * @param poi - Full POI data object.
 * @param position - Geographic position `{lat, lng}`.
 * @param resolveCategoryDisplay - Category display resolver function.
 * @param onSeeMore - Optional callback when "Voir plus" link is clicked.
 */
function openMapLibrePopup(adapter, poi, position, resolveCategoryDisplay, onSeeMore) {
    // Build popup HTML via engine-agnostic content builder
    const content = buildQuickPopupContent(poi, resolveCategoryDisplay);
    if (!content)
        return;
    const popup = adapter.createPopup(content, {
        maxWidth: 300,
        minWidth: 200,
        className: "gl-poi-popup",
        closeOnClick: true,
    });
    adapter.openPopup(popup, position);
    // Wire "Voir plus" link after DOM insertion
    if (onSeeMore) {
        setTimeout(() => {
            const poiId = String(poi.id || "");
            // Use CSS.escape to prevent CSS selector injection from POI IDs
            const escapedId = typeof CSS !== "undefined" && CSS.escape
                ? CSS.escape(poiId)
                : poiId.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, "\\$&");
            const link = document.querySelector(`.gl-poi-popup__link[data-poi-id="${escapedId}"]`);
            if (link) {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    adapter.closePopup(popup);
                    onSeeMore(poi);
                });
            }
        }, 50);
    }
}
// ========================================
//   EXPORT
// ========================================
const POIPopup = {
    // Building de contenu
    buildQuickPopupContent,
    buildTooltipContent,
    attachTooltip,
    manageTooltip,
    attachPopup,
    // MapLibre (Sprint 5)
    openMapLibrePopup,
    // Configuration
    getPopupConfig,
    getTooltipConfig,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - Markers Events
 * Managers d'events : tooltip, popup, click direct, side panel
 */
/**
 * Attaches events and behaviors to a POI marker (tooltip, popup, side panel).
 *
 * @param {unknown} marker - Map marker to configure.
 * @param {object} poi - Data du POI.
 */
async function _openPoiDetails(poi, source = "direct") {
    dispatchGeoLeafEvent("geoleaf:poi:click", {
        poiId: String(poi?.id ?? ""),
        layerId: String(poi?._layerId ?? ""),
        source,
    });
    if (globalThis.GeoLeaf?.POI?.showPoiDetails) {
        globalThis.GeoLeaf.POI.showPoiDetails(poi);
    }
    else {
        // Lazy import to avoid circular dependency:
        // markers-events → poi-core.contract → poi/core → markers → markers-events
        const { POICoreContract } = await Promise.resolve().then(function () { return poiCore_contract; });
        POICoreContract.showPoiDetails?.(poi);
    }
}
function _attachMarkerPopupOpen(marker, poi) {
    marker.on("popupopen", function () {
        marker._geoleafPopupActive = true;
        marker.closeTooltip();
        setTimeout(function () {
            const link = document.querySelector('.gl-poi-popup__link[data-poi-id="' + poi.id + '"]');
            if (link) {
                if (Log)
                    Log.info('[POI] "See more" link found for POI:', poi.id);
                const newLink = link.cloneNode(true);
                if (link.parentNode)
                    link.parentNode.replaceChild(newLink, link);
                newLink.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (Log)
                        Log.info('[POI] Click on "See more" for POI:', poi.id);
                    if (marker && marker.closePopup)
                        marker.closePopup();
                    setTimeout(function () {
                        if (Log)
                            Log.info("[POI] Calling showPoiDetails for:", poi.id);
                        _openPoiDetails(poi, "popup");
                    }, 100);
                });
            }
            else {
                if (Log)
                    Log.warn('[POI] "See more" link not found for POI:', poi.id);
            }
        }, 50);
    });
    marker.on("popupclose", function () {
        marker._geoleafPopupActive = false;
        if (marker.getTooltip() && marker.getTooltip().options.permanent) {
            setTimeout(function () {
                if (marker.openTooltip && !marker._geoleafPopupActive)
                    marker.openTooltip();
            }, 50);
        }
    });
}
function _attachMarkerPopupMode(marker, poi, popupModule) {
    const popupContent = popupModule.buildQuickPopupContent(poi, resolveCategoryDisplay);
    if (popupContent) {
        if (popupModule.attachPopup) {
            popupModule.attachPopup(marker, popupContent);
        }
        else {
            marker.bindPopup(popupContent);
        }
    }
    else {
        Log.error("[markers] Empty popup content for POI:", poi.id);
    }
    marker._geoleafPopupActive = false;
    marker.on("tooltipopen", function () {
        if (marker._geoleafPopupActive)
            marker.closeTooltip();
    });
    _attachMarkerPopupOpen(marker, poi);
}
function _attachMarkerDirectMode(marker, poi) {
    marker.on("click", function (e) {
        e.originalEvent?.stopPropagation?.();
        if (Log)
            Log.info("[POI] Direct click on marker (without popup) for POI:", poi.id);
        _openPoiDetails(poi);
    });
}
function attachMarkerEvents(marker, poi) {
    marker._geoleafPoiData = poi;
    const shared = POIShared;
    const poiConfig = shared ? shared.state.poiConfig : {};
    const popupModule = POIPopup;
    if (popupModule && typeof popupModule.manageTooltip === "function") {
        popupModule.manageTooltip(marker, poi, poiConfig, resolveCategoryDisplay);
    }
    const showPopup = poiConfig.showPopup !== false;
    if (showPopup) {
        if (popupModule && typeof popupModule.buildQuickPopupContent === "function") {
            _attachMarkerPopupMode(marker, poi, popupModule);
        }
    }
    else {
        _attachMarkerDirectMode(marker, poi);
    }
}
// ── MapLibre events (Sprint 5) ───────────────────────────────────────────────
/**
 * Binds map-level events for POI interaction in MapLibre mode.
 * In MapLibre, there are no per-marker DOM elements on the GPU layer —
 * events are bound on the map for the unclustered-point layer.
 *
 * @param adapter - IMapAdapter reference.
 * @param nativeMap - Native MapLibre map instance.
 * @param state - POI shared state.
 */
function bindMapLibrePoiEvents(adapter, nativeMap, state) {
    const poiConfig = state.poiConfig || {};
    const showPopup = poiConfig.showPopup !== false;
    // Import layer IDs from the poi-renderer (same naming convention)
    const prefix = "gl-poi-" + (state.poiSourceId || "poi-source");
    const unclusteredLayerId = prefix + "-unclustered";
    // Click on unclustered point
    nativeMap.on("click", unclusteredLayerId, (e) => {
        if (!e.features || e.features.length === 0)
            return;
        const feature = e.features[0];
        const poiId = feature.properties?.id;
        const coords = feature.geometry?.coordinates;
        if (!coords)
            return;
        // Retrieve full POI data from state.
        // Build an index Map on first click for O(1) lookup on large datasets.
        if (!state._poiIndex || state._poiIndexVersion !== state.allPois.length) {
            state._poiIndex = new Map(state.allPois.map((p) => [p.id, p]));
            state._poiIndexVersion = state.allPois.length;
        }
        const fullPoi = state._poiIndex.get(poiId) ?? null;
        if (!fullPoi) {
            if (Log)
                Log.warn("[POI] MapLibre click: POI not found in state for id:", poiId);
            return;
        }
        const position = { lat: coords[1], lng: coords[0] };
        if (showPopup) {
            // Open popup via adapter
            POIPopup.openMapLibrePopup(adapter, fullPoi, position, resolveCategoryDisplay, (poi) => _openPoiDetails(poi, "popup"));
        }
        else {
            // Direct mode: open side panel
            _openPoiDetails(fullPoi);
        }
    });
    // Note: cluster click + cursor pointer are already wired by
    // MaplibreAdapter.createClusterGroup() → bindPoiEvents()
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - Markers
 * Factory + orchestrateur — API public POIMarkers unchanged.
 */
/**
 * Extrait les coordinates of a POI for the creation de marker.
 *
 * @param {object} poi - Data du POI.
 * @returns {[number, number]|null} [latitude, longitude] ou null si invalids.
 */
function extractMarkerCoordinates(poi) {
    if (!poi) {
        if (Log)
            Log.warn("[POI] extractMarkerCoordinates() : Invalid POI.", poi);
        return null;
    }
    const normalizers = POINormalizers;
    if (!normalizers) {
        if (Log)
            Log.error("[POI] extractMarkerCoordinates() : Normalizers module not loaded.");
        return null;
    }
    const coords = normalizers.extractCoordinates(poi);
    if (!coords) {
        if (Log)
            Log.warn("[POI] extractMarkerCoordinates() : POI with no valid coordinates.", poi);
        return null;
    }
    return coords;
}
/**
 * Creates a marker for a POI.
 * Orchestrateur main : coordinates → display → icon → events.
 *
 * @param {object} poi - Data du POI.
 * @param {object} [options] - Options de creation.
 * @param {boolean} [options.attachEvents=true] - Si false, ne pas attach the events (popup, tooltip).
 * @param {string} [options.pane] - Nom du pane to utiliser for the z-index.
 * @returns {unknown} Map marker ou null si invalid.
 */
function createMarker(poi, options = {}) {
    if (!poi) {
        if (Log)
            Log.warn("[POI] createMarker() : Invalid POI.", poi);
        return null;
    }
    const { attachEvents = true, pane } = options;
    // Extraction coordinates
    const coords = extractMarkerCoordinates(poi);
    if (!coords) {
        return null;
    }
    const [lat, lon] = coords;
    // Resolution of the display (icon et colors)
    const displayConfig = resolveCategoryDisplay(poi);
    // Building of the icon
    const customIcon = buildMarkerIcon(displayConfig);
    // Options du marker avec pane si fourni
    const markerOptions = { icon: customIcon };
    if (pane) {
        markerOptions.pane = pane;
    }
    // Accessibility: pass POI name as aria-label for screen readers (WCAG 1.1.1)
    const poiTitle = poi.title ??
        poi.label ??
        poi.name ??
        poi.properties?.name ??
        poi.properties?.label ??
        poi.properties?.nom;
    if (poiTitle) {
        markerOptions.title = String(poiTitle);
    }
    // Creation du marker via adapter (MapLibre) or stub
    const _g = globalThis;
    const adapter = _g.GeoLeaf?.Core?.getAdapter?.();
    const marker = adapter?.createMarker
        ? adapter.createMarker([lat, lon], markerOptions)
        : { _stub: true, latlng: [lat, lon], options: markerOptions };
    // Attacher events et behaviors (sauf si deactivated)
    if (attachEvents) {
        attachMarkerEvents(marker, poi);
    }
    return marker;
}
// ========================================
//   EXPORT
// ========================================
const POIMarkers = {
    getPoiBaseConfig,
    resolveCategoryDisplay,
    ensureProfileSpriteInjectedSync,
    extractMarkerCoordinates,
    buildMarkerIcon,
    attachMarkerEvents,
    createMarker,
};

/**
 * GeoLeaf Contract — POI AddForm (lazy-chunk boundary)
 *
 * Interface ESM pure pour access to AddFormOrchestrator et POIPlacementMode
 * from the modules UI (controls.js, fields-manager.js) sans couplage runtime.
 *
 * Phase 10-D — Pattern C : contrat de chunk POI AddForm.
 *
 * USAGE :
 *   import { POIAddFormContract } from '../contracts/poi-addform.contract.js';
 *
 *   if (POIAddFormContract.isAddFormAvailable()) {
 *       POIAddFormContract.openAddForm(latlng, null);
 *   }
 *
 *   POIAddFormContract.activatePlacementMode(map: any, callback: any);
 */
/**
 * Phase 7 — Premium Separation:
 * AddFormOrchestrator and POIPlacementMode are now in GeoLeaf-Plugins/plugin-addpoi.
 * Access them only via globalThis.GeoLeaf at runtime (after the plugin is loaded).
 */
function _getOrchestrator() {
    return ((typeof globalThis !== "undefined" ? globalThis : window)?.GeoLeaf?.POI?.AddForm ??
        null);
}
function _getPlacementMode() {
    return ((typeof globalThis !== "undefined" ? globalThis : window)?.GeoLeaf?.POI
        ?.PlacementMode ?? null);
}
/**
 * Contrat d'interface pour the module POI AddForm + PlacementMode.
 * @namespace POIAddFormContract
 */
const POIAddFormContract = {
    /**
     * Returns true si AddFormOrchestrator est available.
     * @returns {boolean}
     */
    isAddFormAvailable() {
        const orch = _getOrchestrator();
        return !!(orch && typeof orch.openAddForm === "function");
    },
    /**
     * Returns true si PlacementMode est available.
     * @returns {boolean}
     */
    isPlacementModeAvailable() {
        const pm = _getPlacementMode();
        return !!(pm && typeof pm.activate === "function");
    },
    /**
     * Ouvre le form d'ajout de POI.
     * @param {unknown} latlng - Position initial (optionalle)
     * @param {Object|null} options - Additional options
     * @returns {Promise<void>}
     */
    async openAddForm(latlng, options) {
        return _getOrchestrator()?.openAddForm(latlng, options);
    },
    /**
     * Active le mode placement pour choisir une position sur the map.
     * @param {unknown} map - Map instance
     * @param {Function} callback - callback(result) avec result.latlng
     */
    activatePlacementMode(map, callback) {
        const pm = _getPlacementMode();
        if (pm && typeof pm.activate === "function") {
            pm.activate(map, callback);
        }
    },
    /**
     * Returns true si openEditForm est disponible.
     * @returns {boolean}
     */
    isEditFormAvailable() {
        const orch = _getOrchestrator();
        return !!(orch && typeof orch.openEditForm === "function");
    },
    /**
     * Ouvre le form d'édition d'un POI existant.
     * @param {Object} poi - POI object (must have an id)
     * @returns {Promise<boolean|undefined>}
     */
    async openEditForm(poi) {
        return _getOrchestrator()?.openEditForm(poi);
    },
    /**
     * Ouvre le form en lecture seule pour un POI existant.
     * @param {Object} poi - POI object (must have an id)
     * @returns {Promise<boolean|undefined>}
     */
    async openViewForm(poi) {
        return _getOrchestrator()?.openViewForm(poi);
    },
    /**
     * Direct access to AddFormOrchestrator (for cases where the complete API is required).
     * @type {Object}
     */
    get orchestrator() {
        return _getOrchestrator();
    },
    /**
     * Direct access to POIPlacementMode.
     * @type {Object}
     */
    get placementMode() {
        return _getPlacementMode();
    },
};

/**
 * GeoLeaf POI Module - Component Renderers
 * Rendu des components UI (badges, links, lists, arrayx, tags)
 * Phase 6.2 - Extraction from core.js
 */
/**
 * Renderers for thes components UI du side panel
 */
class ComponentRenderers {
    /**
     * Rend un badge avec style de category
     * @param {object} section - Configuration de section
     * @param {string} value - Value du badge
     * @param {object} poi - POI complete
     * @returns {HTMLElement|null}
     */
    renderBadge(section, value, poi) {
        if (!value)
            return null;
        const container = document.createElement("div");
        container.className = "gl-poi-badge-container";
        const badge = document.createElement("span");
        badge.className = "gl-poi-badge";
        badge.textContent = value;
        // Retrieve les colors from the taxonomy si available
        const displayInfo = resolveCategoryDisplay(poi);
        if (displayInfo.colorFill) {
            badge.style.background = displayInfo.colorFill;
            badge.style.color = "#fff";
        }
        container.appendChild(badge);
        return container;
    }
    /**
     * Rend un link external
     * @param {object} section - Configuration de section
     * @param {string} url - URL du link
     * @returns {HTMLElement|null}
     */
    renderLink(section, url) {
        if (!url)
            return null;
        const container = document.createElement("div");
        container.className = "gl-poi-link-container";
        const link = document.createElement("a");
        link.className = "gl-poi-website-link";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = section.label || "Visiter le site web →";
        container.appendChild(link);
        return container;
    }
    _buildPriceText(data) {
        const safeFrom = Number.isFinite(Number(data.from)) ? Number(data.from) : null;
        const safeTo = Number.isFinite(Number(data.to)) ? Number(data.to) : null;
        const safeCurrency = data.currency || "USD";
        if (safeFrom !== null && safeTo !== null)
            return `From ${safeFrom} to ${safeTo} ${safeCurrency}`;
        if (safeFrom !== null)
            return `From ${safeFrom} ${safeCurrency}`;
        if (safeTo !== null)
            return `Up to ${safeTo} ${safeCurrency}`;
        return "";
    }
    /**
     * Rend a list (array de prix, etc.)
     * @param {object} section - Configuration de section
     * @param {Array|object} data - Data to display
     * @returns {HTMLElement|null}
     */
    _renderPriceObject(data) {
        const div = document.createElement("div");
        div.className = "gl-poi-section";
        if (data.from || data.to) {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = this._buildPriceText(data);
            if (strong.textContent) {
                p.appendChild(strong);
                div.appendChild(p);
            }
        }
        if (data.description) {
            const desc = document.createElement("p");
            desc.textContent = data.description;
            desc.style.fontSize = "0.85rem";
            desc.style.color = "var(--gl-color-text-muted)";
            div.appendChild(desc);
        }
        if (div.children.length === 0) {
            if (Log)
                Log.warn("[POI] renderList: price object has no displayable content");
            return null;
        }
        return div;
    }
    _renderArrayList(data, section) {
        const variant = section.variant || "disc";
        const ul = document.createElement("ul");
        ul.className = "gl-poi-list-unordered";
        if (variant === "disc" || variant === "circle" || variant === "square") {
            ul.style.listStyleType = variant;
        }
        else {
            ul.style.listStyleType = "disc";
        }
        data.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
        });
        return ul;
    }
    renderList(section, data) {
        if (!data) {
            if (Log)
                Log.warn("[POI] renderList: data is null/undefined");
            return null;
        }
        const div = document.createElement("div");
        div.className = "gl-poi-section";
        // Special case for price (object)
        if (typeof data === "object" && !Array.isArray(data)) {
            if (Log)
                Log.info("[POI] renderList: price object:", data);
            return this._renderPriceObject(data);
        }
        // List normale (array)
        if (Array.isArray(data)) {
            div.appendChild(this._renderArrayList(data, section));
        }
        return div;
    }
    /**
     * Renders a table with headers and borders
     * @param {object} section - Configuration de section
     * @param {Array} data - Data du array
     * @returns {HTMLElement|null}
     */
    _normalizeTableData(data, section) {
        if (data.length === 0 || typeof data[0] !== "string")
            return data;
        if (!section.columns || section.columns.length !== 2)
            return data;
        const separators = [" : ", ": ", " – ", "–", " - ", "-"];
        return data.map((str) => {
            for (const sep of separators) {
                const parts = str.split(sep);
                if (parts.length >= 2) {
                    return {
                        [section.columns[0].key]: parts[0].trim(),
                        [section.columns[1].key]: parts.slice(1).join(sep).trim(),
                    };
                }
            }
            return { [section.columns[0].key]: str, [section.columns[1].key]: "" };
        });
    }
    _buildDataTableHeader(table, section, borders, borderColor) {
        if (!section.columns)
            return;
        const thead = document.createElement("thead");
        const tr = document.createElement("tr");
        section.columns.forEach((col, index) => {
            const th = document.createElement("th");
            th.textContent = col.label;
            th.style.padding = "8px";
            th.style.textAlign = "left";
            th.style.fontWeight = "600";
            th.style.backgroundColor = "var(--gl-color-bg-subtle)";
            if (borders.row !== false)
                th.style.borderBottom = `1px solid ${borders.color || borderColor}`;
            if (borders.column && index > 0)
                th.style.borderLeft = `1px solid ${borders.color || borderColor}`;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
    }
    _buildDataTableBody(table, section, tableData, borders, borderColor) {
        const tbody = document.createElement("tbody");
        tableData.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            if (section.columns) {
                section.columns.forEach((col, colIndex) => {
                    const td = document.createElement("td");
                    td.textContent = row[col.key] || "";
                    td.style.padding = "8px";
                    if (borders.row !== false && rowIndex < tableData.length - 1)
                        td.style.borderBottom = `1px solid ${borders.color || borderColor}`;
                    if (borders.column && colIndex > 0)
                        td.style.borderLeft = `1px solid ${borders.color || borderColor}`;
                    tr.appendChild(td);
                });
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    }
    renderTable(section, data) {
        if (!data || !Array.isArray(data)) {
            if (Log)
                Log.warn("[POI] renderTable: data is", data ? "not an array" : "null/undefined", "- type:", typeof data);
            return null;
        }
        if (Log)
            Log.info("[POI] renderTable: rendering", data.length, "rows");
        const tableData = this._normalizeTableData(data, section);
        const table = document.createElement("table");
        table.className = "gl-poi-table";
        const borders = section.borders ?? {};
        const borderColor = borders.color ?? "var(--gl-color-border-soft)";
        if (borders.outer !== false)
            table.style.border = `1px solid ${borderColor}`;
        this._buildDataTableHeader(table, section, borders, borderColor);
        this._buildDataTableBody(table, section, tableData, borders, borderColor);
        return table;
    }
    /**
     * Rend des tags
     * @param {object} section - Configuration de section
     * @param {Array<string>} tags - List de tags
     * @returns {HTMLElement|null}
     */
    renderTags(section, tags) {
        // Normalize JSON-stringified arrays (e.g. '["FOO","BAR"]' stored as string in GeoJSON)
        if (typeof tags === "string") {
            const trimmed = tags.trim();
            if (trimmed.startsWith("[")) {
                try {
                    tags = JSON.parse(trimmed);
                }
                catch {
                    tags = trimmed
                        .split(/[,;]+/)
                        .map((t) => t.trim())
                        .filter(Boolean);
                }
            }
            else {
                tags = trimmed
                    .split(/[,;]+/)
                    .map((t) => t.trim())
                    .filter(Boolean);
            }
        }
        if (!tags || !Array.isArray(tags)) {
            if (Log)
                Log.warn("[POI] renderTags: tags is", tags ? "not an array" : "null/undefined", "- type:", typeof tags, "- value:", tags);
            return null;
        }
        if (tags.length === 0) {
            if (Log)
                Log.warn("[POI] renderTags: tags array is empty");
            return null;
        }
        if (Log)
            Log.info("[POI] renderTags: rendering", tags.length, "tags");
        const div = document.createElement("div");
        div.className = "gl-poi-sidepanel__tags";
        div.style.display = "flex";
        div.style.flexWrap = "wrap";
        div.style.gap = "6px";
        tags.forEach((tag) => {
            const tagSpan = document.createElement("span");
            tagSpan.className = "gl-poi-tag";
            tagSpan.textContent = tag;
            div.appendChild(tagSpan);
        });
        return div;
    }
    /**
     * Rend une note globale (stars)
     * @param {object} section - Configuration de section
     * @param {number} rating - Note numeric (0-5)
     * @returns {HTMLElement|null}
     */
    renderRating(section, rating) {
        const numRating = parseFloat(rating);
        if (!Number.isFinite(numRating)) {
            if (Log)
                Log.warn("[POI] renderRating: non-numeric value:", rating);
            return null;
        }
        const container = document.createElement("div");
        container.className = "gl-rating gl-rating--stat";
        if (section.label) {
            const label = document.createElement("span");
            label.className = "gl-rating__label";
            label.textContent = section.label;
            container.appendChild(label);
        }
        const starsWrap = document.createElement("span");
        starsWrap.className = "gl-rating__stars";
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("span");
            star.className =
                "gl-rating__star" + (i <= Math.round(numRating) ? " gl-rating__star--filled" : "");
            star.textContent = "\u2605";
            starsWrap.appendChild(star);
        }
        container.appendChild(starsWrap);
        const value = document.createElement("span");
        value.className = "gl-rating__value";
        value.textContent = numRating.toFixed(1) + "/5";
        container.appendChild(value);
        return container;
    }
    /**
     * Rend les avis (reviews)
     * @param {object} section - Configuration de section
     * @param {Array} reviews - List d'avis
     * @returns {HTMLElement|null}
     */
    renderReviews(section, reviews) {
        if (!reviews || !Array.isArray(reviews)) {
            if (Log)
                Log.warn("[POI] renderReviews: reviews is", reviews ? "not an array" : "null/undefined", "- type:", typeof reviews);
            return null;
        }
        if (Log)
            Log.info("[POI] renderReviews: rendering", reviews.length, "reviews");
        const div = document.createElement("div");
        div.className = "gl-poi-reviews";
        const maxCount = section.maxCount || 5;
        reviews.slice(0, maxCount).forEach((review) => {
            const reviewDiv = document.createElement("div");
            reviewDiv.className = "gl-poi-review";
            reviewDiv.style.borderLeft = "3px solid var(--gl-color-accent-soft)";
            reviewDiv.style.paddingLeft = "12px";
            reviewDiv.style.marginBottom = "12px";
            const header = document.createElement("p");
            header.style.fontSize = "0.875rem";
            header.style.fontWeight = "600";
            header.style.marginBottom = "4px";
            const safeAuthor = review.authorName || "Anonyme";
            const safeRating = Number.isFinite(review.rating) ? review.rating : 0;
            const verifiedMark = review.verified ? " ✓" : "";
            header.textContent = `${safeAuthor} - ⭐${safeRating}/5${verifiedMark}`;
            reviewDiv.appendChild(header);
            if (review.comment) {
                const comment = document.createElement("p");
                comment.textContent = review.comment;
                comment.style.fontSize = "0.85rem";
                comment.style.marginBottom = "4px";
                reviewDiv.appendChild(comment);
            }
            if (review.createdAt) {
                const date = document.createElement("p");
                date.style.fontSize = "0.75rem";
                date.style.color = "var(--gl-color-text-muted)";
                date.textContent = review.createdAt;
                reviewDiv.appendChild(date);
            }
            div.appendChild(reviewDiv);
        });
        return div;
    }
}

/**
 * POI Renderers - Field Renderers Module (Migrated to AbstractRenderer)
 * Rendu des fields simples: text, badges, links, tags
 *
 * @module poi/renderers/field-renderers
 * @requires renderers/abstract-renderer
 * @version 1.2.0 - Migrated to AbstractRenderer base class
 */
/**
 * @class FieldRenderers
 * @extends AbstractRenderer
 * @description Renders simple POI fields: text, badges, links, tags
 */
function _getIconsConfig() {
    return Config && typeof Config.getIconsConfig === "function"
        ? Config.getIconsConfig()
        : null;
}
function _buildCategoryIconSvg(displayInfo) {
    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("width", "32");
    svgIcon.setAttribute("height", "32");
    svgIcon.setAttribute("viewBox", "0 0 24 24");
    svgIcon.setAttribute("class", "gl-poi-sidepanel__icon");
    svgIcon.style.marginRight = "10px";
    svgIcon.style.flexShrink = "0";
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", displayInfo.colorFill || "#3388ff");
    circle.setAttribute("stroke", displayInfo.colorStroke || "#fff");
    circle.setAttribute("stroke-width", "1.5");
    svgIcon.appendChild(circle);
    return svgIcon;
}
function _appendCategoryIconSymbol(svgIcon, symbolId) {
    const innerSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    innerSvg.setAttribute("x", "4");
    innerSvg.setAttribute("y", "4");
    innerSvg.setAttribute("width", "16");
    innerSvg.setAttribute("height", "16");
    innerSvg.setAttribute("viewBox", "0 0 32 32");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + symbolId);
    use.setAttribute("href", "#" + symbolId);
    use.style.color = "#ffffff";
    innerSvg.appendChild(use);
    svgIcon.appendChild(innerSvg);
}
class FieldRenderers extends AbstractRenderer {
    constructor(options = {}) {
        super({
            name: "FieldRenderers",
            debug: options.debug || false,
            config: options.config || {},
        });
        this.init();
    }
    /**
     * Render method (required by AbstractRenderer)
     * Delegates to specific render methods
     * @param {Object} data - Render data {section, poi, value, type}
     * @returns {HTMLElement|null} Rendered element
     */
    render(data) {
        const { section, poi, value, type } = data;
        switch (type) {
            case "text":
                return this.renderText(section, poi, value);
            case "badge":
                return this.renderBadge(section, value, poi);
            case "link":
                return this.renderLink(section, value);
            case "tags":
                return this.renderTags(section, value);
            default:
                this.warn("Unknown render type:", type);
                return null;
        }
    }
    /**
     * Rend un field text (title, description, etc.)
     * @param {Object} section - Section config
     * @param {Object} poi - POI data
     * @param {string} value - Text value
     * @returns {HTMLElement|null}
     */
    async renderText(section, poi, value) {
        // Special case for title with icon
        if (section.style === "title" || section.variant === "title") {
            return await this._renderTitleWithIcon(poi, value);
        }
        // Text normal ou multiline
        if (!value) {
            this.warn("renderText: no value provided");
            return null;
        }
        const element = this.createElement(section.variant === "multiline" ? "div" : "p", "gl-poi-sidepanel__desc");
        if (section.variant === "multiline") {
            element.style.whiteSpace = "pre-wrap";
            element.style.lineHeight = "1.6";
        }
        element.textContent = value;
        this.info("renderText: element created, variant:", section.variant || "normal");
        return element;
    }
    /**
     * Rend un title avec icon SVG
     * @private
     * @param {Object} poi - POI data
     * @param {string} value - Title text
     * @returns {HTMLElement}
     */
    async _renderTitleWithIcon(poi, value) {
        const titleH2 = this.createElement("h2", "gl-poi-sidepanel__title");
        // Addsr l'icon SVG au title
        const displayInfo = resolveCategoryDisplay(poi);
        this.debug("_renderTitleWithIcon: displayInfo =", displayInfo);
        if (displayInfo.iconId) {
            await ensureProfileSpriteInjectedSync();
            const svgIcon = this._createCategoryIcon(displayInfo);
            if (svgIcon) {
                this.debug("_renderTitleWithIcon: SVG icon created successfully");
                titleH2.appendChild(svgIcon);
            }
            else {
                this.warn("_renderTitleWithIcon: SVG icon creation failed");
            }
        }
        else {
            this.debug("_renderTitleWithIcon: No iconId in displayInfo");
        }
        // Addsr le text du title
        const titleSpan = this.createTextElement("span", value || poi.title || poi.label || poi.name || "POI", "gl-poi-sidepanel__title-text");
        titleH2.appendChild(titleSpan);
        this.info("renderText: title element created with icon");
        return titleH2;
    }
    /**
     * Creates ae icon SVG de category
     * @private
     * @param {Object} displayInfo - Display information {iconId, colorFill, colorStroke}
     * @returns {SVGElement|null}
     */
    _createCategoryIcon(displayInfo) {
        const iconsConfig = _getIconsConfig();
        const iconPrefix = iconsConfig?.symbolPrefix || "gl-poi-cat-";
        const iconIdNormalized = String(displayInfo.iconId)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
        const symbolId = iconPrefix + iconIdNormalized;
        this.debug("_createCategoryIcon", symbolId, displayInfo.colorFill, displayInfo.colorStroke);
        const sprite = document.querySelector('svg[data-geoleaf-sprite="profile"]');
        if (!sprite) {
            this.warn("_createCategoryIcon: Sprite SVG non trouv\u00e9 dans le DOM!");
        }
        else {
            this.debug("_createCategoryIcon: Sprite trouv\u00e9, symboles:", sprite.querySelectorAll("symbol").length);
        }
        const spriteSymbol = sprite?.querySelector(`#${symbolId}`);
        if (!spriteSymbol) {
            this.warn("_createCategoryIcon: Symbole non trouv\u00e9:", symbolId);
            if (sprite) {
                const avail = Array.from(sprite.querySelectorAll("symbol"))
                    .map((s) => s.id)
                    .slice(0, 5);
                this.debug("_createCategoryIcon: Premiers symboles:", avail);
            }
        }
        const svgIcon = _buildCategoryIconSvg(displayInfo);
        if (spriteSymbol) {
            _appendCategoryIconSymbol(svgIcon, symbolId);
        }
        this.debug("_createCategoryIcon: SVG structure created");
        return svgIcon;
    }
    /**
     * Rend un badge (category, sous-category)
     * @param {Object} section - Section config
     * @param {string} value - Badge text
     * @param {Object} poi - POI data
     * @returns {HTMLElement|null}
     */
    renderBadge(section, value, poi) {
        if (!value)
            return null;
        const container = this.createElement("div", "gl-poi-badge-container");
        const badge = this.createTextElement("span", value, "gl-poi-badge");
        // Retrieve les colors from the taxonomy
        const displayInfo = resolveCategoryDisplay(poi);
        if (displayInfo.colorFill) {
            badge.style.background = displayInfo.colorFill;
            badge.style.color = "#fff";
        }
        container.appendChild(badge);
        return container;
    }
    /**
     * Rend un link (website, etc.)
     * @param {Object} section - Section config
     * @param {string} url - URL
     * @returns {HTMLElement|null}
     */
    renderLink(section, url) {
        if (!url)
            return null;
        const linkP = this.createElement("p", "gl-poi-sidepanel__link");
        const anchor = this.createElement("a", null, {
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
        });
        anchor.textContent = section.linkText || url;
        linkP.appendChild(anchor);
        return linkP;
    }
    /**
     * Rend a list de tags
     * @param {Object} section - Section config
     * @param {Array<string>} tags - Tags array
     * @returns {HTMLElement|null}
     */
    renderTags(section, tags) {
        // Normalize JSON-stringified arrays (e.g. '["FOO","BAR"]' stored as string in GeoJSON)
        if (typeof tags === "string") {
            const trimmed = tags.trim();
            if (trimmed.startsWith("[")) {
                try {
                    tags = JSON.parse(trimmed);
                }
                catch {
                    tags = trimmed
                        .split(/[,;]+/)
                        .map((t) => t.trim())
                        .filter(Boolean);
                }
            }
            else {
                tags = trimmed
                    .split(/[,;]+/)
                    .map((t) => t.trim())
                    .filter(Boolean);
            }
        }
        if (!tags || !Array.isArray(tags) || tags.length === 0)
            return null;
        const tagsDiv = this.createElement("div", "gl-poi-sidepanel__tags");
        tags.forEach((tag) => {
            if (tag) {
                const tagSpan = this.createTextElement("span", tag, "gl-poi-tag");
                tagsDiv.appendChild(tagSpan);
            }
        });
        return tagsDiv;
    }
}

/**
 * POI Renderers - Media Renderers Module (Migrated to AbstractRenderer)
 * Rendu des media: images, galleries, lightbox
 *
 * @module poi/renderers/media-renderers
 * @requires renderers/abstract-renderer
 * @version 1.2.0 - Migrated to AbstractRenderer base class
 */
/**
 * @class MediaRenderers
 * @extends AbstractRenderer
 * @description Renders media elements: images, galleries, lightbox
 */
class MediaRenderers extends AbstractRenderer {
    constructor(options = {}) {
        super({
            name: "MediaRenderers",
            debug: options.debug || false,
            config: options.config || {},
        });
        this.init();
    }
    /**
     * Render method (required by AbstractRenderer)
     * @param {Object} data - Render data {section, value, type}
     * @returns {HTMLElement|null} Rendered element
     */
    render(data) {
        const { section, value, type } = data;
        switch (type) {
            case "image":
                return this.renderImage(section, value);
            case "gallery":
                return this.renderGallery(section, value);
            default:
                this.warn("Unknown media render type:", type);
                return null;
        }
    }
    /**
     * Rend une image (hero ou normale)
     * @param {Object} section - Section config
     * @param {string} imageUrl - Image URL
     * @returns {HTMLElement|null}
     */
    renderImage(section, imageUrl) {
        if (!imageUrl)
            return null;
        const className = section.variant === "hero"
            ? "gl-poi-sidepanel__photo gl-poi-sidepanel__photo--hero"
            : "gl-poi-sidepanel__photo";
        const photoDiv = this.createElement("div", className);
        const img = this.createElement("img", null, {
            src: imageUrl,
            alt: section.label || "Photo",
            loading: "lazy",
        });
        photoDiv.appendChild(img);
        return photoDiv;
    }
    /**
     * Rend une gallery d'images avec thumbnails
     * @param {Object} section - Section config
     * @param {Array<string>} gallery - Array of image URLs
     * @returns {HTMLElement|null}
     */
    renderGallery(section, gallery) {
        if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
            this.warn("renderGallery: invalid gallery data", gallery);
            return null;
        }
        this.info("renderGallery: rendering", gallery.length, "images");
        const galleryDiv = this.createElement("div", "gl-poi-gallery");
        // Image maine
        const mainDiv = this._createMainImage(gallery[0]);
        galleryDiv.appendChild(mainDiv);
        // Miniatures si plusieurs images
        if (gallery.length > 1) {
            const thumbsDiv = this._createThumbnails(gallery, mainDiv);
            galleryDiv.appendChild(thumbsDiv);
        }
        return galleryDiv;
    }
    /**
     * Creates the image maine de la gallery
     * @private
     * @param {string} imageUrl - Image URL
     * @returns {HTMLElement}
     */
    _createMainImage(imageUrl) {
        const mainDiv = this.createElement("div", "gl-poi-gallery__main", {
            "data-gallery-index": "0",
        });
        const mainImg = this.createElement("img", null, {
            src: imageUrl,
            alt: "Image 1",
            loading: "lazy",
        });
        mainDiv.appendChild(mainImg);
        return mainDiv;
    }
    /**
     * Creates thes thumbnails de la gallery
     * @private
     * @param {Array<string>} gallery - Array of image URLs
     * @param {HTMLElement} mainDiv - Main image container
     * @returns {HTMLElement}
     */
    _createThumbnails(gallery, mainDiv) {
        const thumbsDiv = this.createElement("div", "gl-poi-gallery__thumbnails");
        const mainImg = mainDiv.querySelector("img");
        gallery.forEach((imgUrl, index) => {
            const thumbDiv = this._createThumbnail(imgUrl, index, mainImg, mainDiv, thumbsDiv);
            thumbsDiv.appendChild(thumbDiv);
        });
        return thumbsDiv;
    }
    /**
     * Creates ae thumbnail individuelle
     * @private
     * @param {string} imgUrl - Image URL
     * @param {number} index - Image index
     * @param {HTMLElement} mainImg - Main image element
     * @param {HTMLElement} mainDiv - Main image container
     * @param {HTMLElement} thumbsDiv - Thumbnails container
     * @returns {HTMLElement}
     */
    _createThumbnail(imgUrl, index, mainImg, mainDiv, thumbsDiv) {
        const thumbDiv = this.createElement("div", index === 0 ? "gl-poi-gallery__thumb active" : "gl-poi-gallery__thumb", { "data-index": index.toString() });
        const imgThumb = this.createElement("img", null, {
            src: imgUrl,
            alt: `Image ${index + 1}`,
            loading: "lazy",
        });
        thumbDiv.appendChild(imgThumb);
        // Event listner pour changer l'image maine
        this.addEventListener(thumbDiv, "click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Retirer la class active de toutes les thumbnails
            const allThumbs = thumbsDiv.querySelectorAll(".gl-poi-gallery__thumb");
            allThumbs.forEach((t) => t.classList.remove("active"));
            // Add active class to the clicked thumbnail
            thumbDiv.classList.add("active");
            // Changer l'image maine
            mainImg.src = imgUrl;
            mainImg.alt = `Image ${index + 1}`;
            mainDiv.setAttribute("data-gallery-index", index.toString());
            this.info("Gallery: Switched to image", index + 1);
        }, true);
        return thumbDiv;
    }
    /**
     * Cleanup when gallery is destroyed
     * @override
     */
    destroy() {
        this.debug("Destroying MediaRenderers");
        super.destroy();
    }
}

/* eslint-disable security/detect-object-injection */
/**
 * GeoLeaf POI Module - Section Orchestrator
 * Orchestration du rendu des sections (dispatcher, extraction values, accordions)
 * Phase 6.2 - Extraction from core.js
 */
/**
 * Orchestrateur de sections for the side panel POI
 */
class SectionOrchestrator {
    componentRenderers = null;
    fieldRenderers = null;
    mediaRenderers = null;
    constructor() { }
    /**
     * Initializes the renderers (lazy loading)
     * @private
     */
    _initRenderers() {
        if (!this.componentRenderers) {
            this.componentRenderers = new ComponentRenderers();
        }
        if (!this.fieldRenderers) {
            this.fieldRenderers = new FieldRenderers({ debug: true });
        }
        if (!this.mediaRenderers) {
            this.mediaRenderers = new MediaRenderers({ debug: true });
        }
    }
    /**
     * Decrit a value for thes logs.
     * @private
     */
    _describeVal(v) {
        if (v === undefined)
            return "undefined";
        if (v === null)
            return "null";
        if (v === "")
            return "\u201c\u201d (empty string)";
        if (Array.isArray(v))
            return `Array(${v.length})`;
        if (v && typeof v === "object")
            return `Object(${Object.keys(v).length} keys)`;
        return String(v);
    }
    /**
     * Determine si the value of a field est empty.
     * Note: 0 est non-empty (value valide pour prix, metriques, etc.)
     * @private
     */
    _isEmptyFieldValue(v) {
        if (v === null || v === undefined || v === "")
            return true;
        if (Array.isArray(v))
            return v.length === 0;
        if (typeof v === "object")
            return Object.keys(v).length === 0;
        return false;
    }
    /**
     * Dispatche the render selon the type of section via une table de correspondance.
     * CC=3 : pas de switch, tous les case sont des fonctions dans DISPATCH.
     * @private
     */
    async _dispatchSection(section, poi, fieldValue) {
        const f = this.fieldRenderers;
        const m = this.mediaRenderers;
        const comp = this.componentRenderers;
        const DISPATCH = {
            text: () => f.renderText(section, poi, fieldValue),
            longtext: () => f.renderText(section, poi, fieldValue),
            number: () => f.renderText(section, poi, String(fieldValue)),
            metric: () => f.renderText(section, poi, (section.prefix || "") + String(fieldValue) + (section.suffix || "")),
            image: () => m.renderImage(section, fieldValue),
            gallery: () => m.renderGallery(section, fieldValue),
            badge: () => comp.renderBadge(section, fieldValue, poi),
            link: () => comp.renderLink(section, fieldValue),
            list: () => comp.renderList(section, fieldValue),
            table: () => comp.renderTable(section, fieldValue),
            tags: () => comp.renderTags(section, fieldValue),
            rating: () => comp.renderRating(section, fieldValue),
            reviews: () => comp.renderReviews(section, fieldValue),
        };
        const fn = DISPATCH[section.type];
        if (!fn) {
            if (Log)
                Log.warn("[POI] Type de section inconnu:", section.type);
            return null;
        }
        return await fn();
    }
    /**
     * Recupere the value of a field avec support du dot notation.
     * @param {object} poi - POI complete
     * @param {string} fieldPath - Path du field (ex: "attributes.address.city")
     * @returns {*}
     */
    getFieldValue(poi, fieldPath) {
        if (!fieldPath)
            return null;
        const resolve_fn = resolveField$1 ||
            function (obj, path) {
                let cur = obj;
                for (const part of path.split(".")) {
                    if (cur && typeof cur === "object" && part in cur) {
                        cur = cur[part];
                    }
                    else {
                        return null;
                    }
                }
                return cur;
            };
        const value = resolve_fn(poi, fieldPath);
        if (Log && Log.info)
            Log.info("[POI] getFieldValue:", fieldPath, "\u2192", this._describeVal(value));
        return value;
    }
    /**
     * Wrappe un contenu dans un accordion <details>
     * @param {object} section - Configuration de section
     * @param {HTMLElement} content - Contenu to wrapper
     * @param {boolean} isOpen - Ouvrir by default
     * @returns {HTMLElement}
     */
    wrapInAccordion(section, content, isOpen = false) {
        const details = document.createElement("details");
        details.className = "gl-accordion";
        if (isOpen)
            details.setAttribute("open", "");
        const summary = document.createElement("summary");
        summary.className = "gl-accordion__header";
        summary.textContent = section.label || "Section";
        const arrow = document.createElement("span");
        arrow.className = "gl-accordion__arrow";
        arrow.textContent = "▼";
        summary.appendChild(arrow);
        const panel = document.createElement("div");
        panel.className = "gl-accordion__panel";
        const panelContent = document.createElement("div");
        panelContent.className = "gl-accordion__panel-content";
        panelContent.appendChild(content);
        panel.appendChild(panelContent);
        details.appendChild(summary);
        details.appendChild(panel);
        return details;
    }
    /**
     * Rend une section completee selon son type.
     * @param {object} section - Configuration de section
     * @param {object} poi - POI complete
     * @param {object} _state - Etat partage POI
     * @returns {Promise<HTMLElement|null>}
     */
    async renderSection(section, poi, _state) {
        if (!section?.type)
            return null;
        this._initRenderers();
        const fieldValue = this.getFieldValue(poi, section.field);
        Log?.debug("[POI] Section:", section.type, "- Field:", section.field, "- Value:", this._describeVal(fieldValue));
        const isRequiredField = (section.type === "text" && section.style === "title") || section.type === "badge";
        const isEmpty = this._isEmptyFieldValue(fieldValue);
        Log?.info("[POI] isEmpty:", isEmpty, "isRequiredField:", isRequiredField);
        if (isEmpty && !isRequiredField) {
            Log?.warn("[POI] Section ignoree (valeur vide):", section.type);
            return null;
        }
        Log?.info("[POI] \u2192 Appel render - Type:", section.type, "- Value:", this._describeVal(fieldValue));
        const content = await this._dispatchSection(section, poi, fieldValue);
        if (!content) {
            Log?.debug("[POI] Aucun contenu genere pour:", section.type);
            return null;
        }
        Log?.debug("[POI] Contenu genere:", section.type, "- Accordion:", section.accordion);
        if (section.accordion)
            return this.wrapInAccordion(section, content, section.defaultOpen);
        return content;
    }
}

/**
 * GeoLeaf POI Module - Lightbox Manager
 * Gestion of the display lightbox for thes images avec navigation gallery
 * Phase 6.2 - Extraction from core.js
 */
/**
 * Traps keyboard focus within a container element.
 * Used by the lightbox to prevent Tab from escaping the dialog.
 */
function _handleFocusTrap(container, e) {
    const focusable = Array.from(container.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => el.offsetParent !== null);
    if (!focusable.length)
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
}
/**
 * Manager for lightbox pour display d'images en fullscreen
 * Supporte la navigation dans une gallery d'images (arrows gauche/droite)
 */
function _buildLightboxDom(imageSrc) {
    const lightbox = document.createElement("div");
    lightbox.className = "gl-poi-lightbox-global";
    lightbox.style.display = "flex";
    const overlay = document.createElement("div");
    overlay.className = "gl-poi-lightbox__overlay";
    lightbox.appendChild(overlay);
    const content = document.createElement("div");
    content.className = "gl-poi-lightbox__content";
    lightbox.appendChild(content);
    const img = document.createElement("img");
    img.className = "gl-poi-lightbox__image";
    img.src = imageSrc;
    img.alt = "";
    content.appendChild(img);
    const closeBtn = document.createElement("button");
    closeBtn.className = "gl-poi-lightbox__close";
    closeBtn.setAttribute("aria-label", "Fermer");
    closeBtn.textContent = "×";
    lightbox.appendChild(closeBtn);
    return { lightbox, img };
}
class LightboxManager {
    currentLightbox = null;
    keyHandler = null;
    galleryImages = [];
    currentIndex = 0;
    _imgElement = null;
    _counterElement = null;
    _prevButton = null;
    _nextButton = null;
    onIndexChange = null;
    _triggerElement = null;
    constructor() {
        this.currentLightbox = null;
        this.keyHandler = null;
        this.galleryImages = [];
        this.currentIndex = 0;
        this._imgElement = null;
        this._counterElement = null;
        this._prevButton = null;
        this._nextButton = null;
        this.onIndexChange = null;
        this._triggerElement = null;
    }
    /**
     * Ouvre une lightbox pour display une image en fullscreen.
     * If a array d'images est fourni, active la navigation par arrows.
     * @param {string} imageSrc - URL of the image to display
     * @param {string[]} [galleryImages] - Array d'URLs pour navigation gallery
     * @param {number} [startIndex] - Starting index in the gallery
     */
    open(imageSrc, galleryImages, startIndex) {
        // Save triggering element for focus restoration on close
        this._triggerElement = document.activeElement;
        this.close();
        if (Array.isArray(galleryImages) && galleryImages.length > 1) {
            this.galleryImages = galleryImages;
            this.currentIndex =
                typeof startIndex === "number" ? startIndex : galleryImages.indexOf(imageSrc);
            if (this.currentIndex < 0)
                this.currentIndex = 0;
        }
        else {
            this.galleryImages = [imageSrc];
            this.currentIndex = 0;
        }
        const { lightbox, img } = _buildLightboxDom(imageSrc);
        {
            const overlay = lightbox.querySelector(".gl-poi-lightbox__overlay");
            if (overlay)
                overlay.addEventListener("click", () => this.close());
        }
        const closeBtn = lightbox.querySelector(".gl-poi-lightbox__close");
        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.close();
            });
        }
        this._imgElement = img;
        if (this.galleryImages.length > 1) {
            this._createNavigation(lightbox);
        }
        document.body.appendChild(lightbox);
        this.currentLightbox = lightbox;
        // Set initial alt text (1.5.7)
        if (this._imgElement) {
            this._imgElement.alt = getLabel("aria.lightbox.counter", String(this.currentIndex + 1), String(this.galleryImages.length));
        }
        // Move focus to close button
        const initialFocusBtn = lightbox.querySelector(".gl-poi-lightbox__close");
        if (initialFocusBtn)
            initialFocusBtn.focus();
        this.keyHandler = (e) => {
            if (e.key === "Escape") {
                this.close();
            }
            else if (e.key === "ArrowLeft") {
                e.preventDefault();
                this.prev();
            }
            else if (e.key === "ArrowRight") {
                e.preventDefault();
                this.next();
            }
            else if (e.key === "Tab" && this.currentLightbox) {
                // Focus trap: cycle within lightbox (1.5.1)
                _handleFocusTrap(this.currentLightbox, e);
            }
        };
        document.addEventListener("keydown", this.keyHandler);
    }
    /**
     * Creates thes buttons de navigation et le compteur
     * @private
     * @param {HTMLElement} lightbox - Conteneur lightbox
     */
    _createNavigation(lightbox) {
        // Button previous
        const prevBtn = document.createElement("button");
        prevBtn.className = "gl-poi-lightbox__prev";
        prevBtn.setAttribute("aria-label", getLabel("aria.lightbox.prev"));
        prevBtn.textContent = "\u2039";
        prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.prev();
        });
        lightbox.appendChild(prevBtn);
        this._prevButton = prevBtn;
        // Button suivant
        const nextBtn = document.createElement("button");
        nextBtn.className = "gl-poi-lightbox__next";
        nextBtn.setAttribute("aria-label", getLabel("aria.lightbox.next"));
        nextBtn.textContent = "\u203A";
        nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.next();
        });
        lightbox.appendChild(nextBtn);
        this._nextButton = nextBtn;
        // Compteur (ex: "2 / 5")
        const counter = document.createElement("div");
        counter.className = "gl-poi-lightbox__counter";
        lightbox.appendChild(counter);
        this._counterElement = counter;
        this._updateNavState();
    }
    /**
     * Navigue vers l'image previous
     */
    prev() {
        if (this.galleryImages.length <= 1)
            return;
        this.currentIndex =
            (this.currentIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        this._updateImage();
    }
    /**
     * Navigue vers l'image suivante
     */
    next() {
        if (this.galleryImages.length <= 1)
            return;
        this.currentIndex = (this.currentIndex + 1) % this.galleryImages.length;
        this._updateImage();
    }
    /**
     * Updates the image displayed et the state de navigation
     * @private
     */
    _updateImage() {
        if (!this._imgElement)
            return;
        this._imgElement.src = this.galleryImages[this.currentIndex];
        // Update alt text with current position (1.5.7)
        this._imgElement.alt = getLabel("aria.lightbox.counter", String(this.currentIndex + 1), String(this.galleryImages.length));
        this._updateNavState();
        // Notifier le changement d'index (pour synchronize les thumbnails)
        if (typeof this.onIndexChange === "function") {
            this.onIndexChange(this.currentIndex);
        }
    }
    /**
     * Updates the compteur et la visibility des arrows
     * @private
     */
    _updateNavState() {
        if (this._counterElement) {
            this._counterElement.textContent = `${this.currentIndex + 1} / ${this.galleryImages.length}`;
        }
    }
    /**
     * Ferme la lightbox active
     */
    close() {
        if (this.currentLightbox && document.body.contains(this.currentLightbox)) {
            document.body.removeChild(this.currentLightbox);
        }
        if (this.keyHandler) {
            document.removeEventListener("keydown", this.keyHandler);
            this.keyHandler = null;
        }
        // Restore focus to the element that opened the lightbox (1.5.1)
        this._triggerElement?.focus();
        this._triggerElement = null;
        this.currentLightbox = null;
        this._imgElement = null;
        this._counterElement = null;
        this._prevButton = null;
        this._nextButton = null;
        this.galleryImages = [];
        this.currentIndex = 0;
        this.onIndexChange = null;
    }
    /**
     * Checks if une lightbox est currentlement opene
     * @returns {boolean}
     */
    isOpen() {
        return this.currentLightbox !== null && document.body.contains(this.currentLightbox);
    }
}

/**
 * GeoLeaf POI Module - UI Behaviors
 * Comportements interactives for the side panel (accordions, galleries)
 * Phase 6.2 - Extraction from core.js
 */
/**
 * Comportements UI for the side panel POI
 */
const UIBehaviors = {
    /**
     * Attache le behavior d'accordion exclusif (un seul open to the fois)
     * @param {HTMLElement} container - Conteneur parent des accordions
     */
    attachSingleAccordionBehavior(container) {
        const accordions = container.querySelectorAll("details.gl-accordion");
        if (accordions.length === 0)
            return;
        accordions.forEach((accordion) => {
            accordion.addEventListener("toggle", (event) => {
                // Si cet accordion vient to be open
                if (event.target.open) {
                    // Fermer tous les autres accordions
                    accordions.forEach((otherAccordion) => {
                        if (otherAccordion !== event.target && otherAccordion.open) {
                            otherAccordion.removeAttribute("open");
                        }
                    });
                }
            });
        });
        if (Log)
            Log.info("[POI] ");
    },
    /**
     * Attache the events de navigation for ae gallery d'images
     * @param {HTMLElement} sidePanelElement - Element du side panel
     * @param {LightboxManager} lightboxManager - Instance du manager for lightbox
     */
    attachGalleryEvents(sidePanelElement, lightboxManager) {
        if (!sidePanelElement)
            return;
        if (sidePanelElement._galleryEventsAttached)
            return;
        sidePanelElement._galleryEventsAttached = true;
        // Navigation par thumbnails
        const thumbs = sidePanelElement.querySelectorAll(".gl-poi-gallery__thumb");
        const mainImg = sidePanelElement.querySelector(".gl-poi-gallery__main img");
        if (!mainImg || thumbs.length === 0)
            return;
        // Collecter toutes les URLs d'images de la gallery
        const galleryImages = Array.from(thumbs).map((thumb) => thumb.querySelector("img").src);
        thumbs.forEach((thumb) => {
            thumb.addEventListener("click", () => {
                const index = parseInt(thumb.getAttribute("data-index"), 10);
                const imgSrc = thumb.querySelector("img").src;
                // Mettre up to date l'image maine
                mainImg.src = imgSrc;
                mainImg.alt = `Image ${index + 1}`;
                // Mettre up to date the state active des thumbnails
                thumbs.forEach((t) => t.classList.remove("active"));
                thumb.classList.add("active");
            });
        });
        // Click sur l'image maine pour lightbox avec navigation gallery
        mainImg.addEventListener("click", () => {
            if (lightboxManager) {
                // Determine the current index from the active thumbnail
                const activeThumb = sidePanelElement.querySelector(".gl-poi-gallery__thumb.active");
                const currentIndex = activeThumb
                    ? parseInt(activeThumb.getAttribute("data-index"), 10)
                    : 0;
                // Ouvrir la lightbox avec toute la gallery
                lightboxManager.open(mainImg.src, galleryImages, currentIndex);
                // Synchronize les thumbnails quand on navigue in the lightbox
                lightboxManager.onIndexChange = (newIndex) => {
                    thumbs.forEach((t) => t.classList.remove("active"));
                    const targetThumb = sidePanelElement.querySelector(`.gl-poi-gallery__thumb[data-index="${newIndex}"]`);
                    if (targetThumb) {
                        targetThumb.classList.add("active");
                        // Mettre up to date l'image maine du panel aussi
                        const imgSrc = targetThumb.querySelector("img").src;
                        mainImg.src = imgSrc;
                        mainImg.alt = `Image ${newIndex + 1}`;
                    }
                };
            }
        });
    },
    /**
     * Configure tous les behaviors UI for the side panel
     * @param {HTMLElement} container - Conteneur du side panel
     * @param {LightboxManager} lightboxManager - Instance du manager for lightbox
     */
    setupAll(container, lightboxManager) {
        this.attachSingleAccordionBehavior(container);
        this.attachGalleryEvents(container, lightboxManager);
    },
};

/**
 * GeoLeaf POI Module - Renderers Core
 * Orchestrateur main pour the render du side panel POI
 * Phase 6.2 - Version refactorisee (837 LOC -> ~140 LOC)
 *
 * Architecture modulaire:
 * - lightbox-manager.js: Gestion lightbox
 * - ui-behaviors.js: UI behaviors (accordions, gallery)
 * - component-renderers.js: Renderers components (badges, links, lists, tables, tags)
 * - section-orchestrator.js: Dispatcher de sections + extraction values
 * - media-renderers-v2.js: Renderers media
 */
// Initializesr les nouveaux modules
let sectionOrchestrator = null;
let lightboxManager = null;
let uiBehaviors = null;
/**
 * Initializes the modules (lazy loading)
 * @private
 */
function _initModules() {
    if (!sectionOrchestrator) {
        sectionOrchestrator = new SectionOrchestrator();
    }
    if (!lightboxManager) {
        lightboxManager = new LightboxManager();
    }
    if (!uiBehaviors) {
        uiBehaviors = UIBehaviors;
    }
}
/**
 * Populates the side panel with POI data using the JSON layout.
 *
 * @param {object} poi - Normalized POI.
 * @param {object} customLayout - Custom layout (optional).
 * @returns {Promise<void>}
 */
function _getDefaultLayoutExtra() {
    return [
        {
            type: "gallery",
            label: "Galerie photos",
            field: "attributes.gallery",
            accordion: true,
            defaultOpen: true,
        },
        {
            type: "list",
            label: "Prix",
            field: "attributes.price",
            accordion: true,
            defaultOpen: false,
        },
        {
            type: "reviews",
            label: "Avis r\u00e9cents",
            field: "attributes.reviews.recent",
            maxCount: 5,
            accordion: true,
            defaultOpen: false,
        },
        { type: "tags", label: "Tags", field: "attributes.tags", accordion: false },
        {
            type: "link",
            label: "Visiter le site web",
            field: "attributes.website",
            accordion: false,
        },
    ];
}
function _getDefaultLayout() {
    return [
        { type: "text", field: "title", style: "title", accordion: false },
        { type: "image", field: "attributes.mainImage", variant: "hero", accordion: false },
        { type: "text", field: "attributes.shortDescription", variant: "short", accordion: false },
        {
            type: "text",
            label: "Informations",
            field: "attributes.longDescription",
            variant: "multiline",
            accordion: true,
            defaultOpen: true,
        },
        {
            type: "text",
            label: "Description",
            field: "attributes.description_long",
            variant: "multiline",
            accordion: true,
            defaultOpen: true,
        },
        ..._getDefaultLayoutExtra(),
    ];
}
function _resolveLayoutFromNormalized(normalized) {
    if (!normalized._sidepanelConfig)
        return null;
    if (!normalized._sidepanelConfig.detailLayout)
        return null;
    if (Log)
        Log.info("[POI] Layout retrieved from layer config attached to the POI");
    return normalized._sidepanelConfig.detailLayout;
}
function _resolveLayoutFromProfile() {
    if (!Config)
        return null;
    if (typeof Config.getActiveProfile !== "function")
        return null;
    const activeProfile = Config.getActiveProfile();
    if (!activeProfile)
        return null;
    if (!activeProfile.panels)
        return null;
    if (!activeProfile.panels.detail)
        return null;
    if (Log)
        Log.info("[POI] Layout retrieved from active profile:", activeProfile.id || "unknown");
    return activeProfile.panels.detail.layout;
}
function _resolveLayout(customLayout, normalized, state) {
    if (customLayout)
        return customLayout;
    const fromNorm = _resolveLayoutFromNormalized(normalized);
    if (fromNorm)
        return fromNorm;
    const fromProfile = _resolveLayoutFromProfile();
    if (fromProfile)
        return fromProfile;
    if (state.poiConfig &&
        state.poiConfig.panels &&
        state.poiConfig.panels.detail &&
        state.poiConfig.panels.detail.layout) {
        return state.poiConfig.panels.detail.layout;
    }
    if (Log)
        Log.warn("[POI] No layout found, using default layout");
    return _getDefaultLayout();
}
async function _renderSections(sortedLayout, normalized, state) {
    const body = document.createElement("div");
    body.className = "gl-poi-sidepanel__body";
    for (const section of sortedLayout) {
        try {
            const element = sectionOrchestrator
                ? await sectionOrchestrator.renderSection(section, normalized, state)
                : null;
            if (element) {
                body.appendChild(element);
                if (Log)
                    Log.info("[POI] ✓ Section added:", section.label || section.type);
            }
            else {
                if (Log)
                    Log.warn("[POI] ✗ Section skipped (element null):", section.label || section.type, "- field:", section.field);
            }
        }
        catch (error) {
            console.error("[SIDEPANEL] ERROR rendering section:", section.label, error);
            if (Log)
                Log.error("[POI] Error rendering section:", section.label, error);
        }
    }
    return body;
}
function _attachPostRenderBehaviors(normalized, body, state) {
    const singleAccordion = normalized._sidepanelConfig?.singleAccordion;
    if (singleAccordion === true && uiBehaviors) {
        uiBehaviors.attachSingleAccordionBehavior(body);
    }
    if (uiBehaviors) {
        uiBehaviors.attachGalleryEvents(state.sidePanelElement, lightboxManager);
    }
}
function _debugNormalized(normalized) {
    if (!Log)
        return;
    Log.debug("[POI] Normalized POI:", normalized.title || normalized.label);
    Log.debug("[POI] Available attribute fields:", Object.keys(normalized.attributes || {}));
}
async function populateSidePanel(poi, customLayout) {
    _initModules();
    const shared = POIShared;
    if (!shared) {
        if (Log)
            Log.error("[POI] populateSidePanel : shared is null");
        return;
    }
    const state = shared.state;
    if (!state.sidePanelElement) {
        if (Log)
            Log.error("[POI] populateSidePanel : sidePanelElement not found");
        return;
    }
    const contentDiv = state.sidePanelElement.querySelector(".gl-poi-sidepanel__content");
    if (!contentDiv)
        return;
    DOMSecurity.clearElementFast(contentDiv);
    delete state.sidePanelElement._galleryEventsAttached;
    const normalizers = POINormalizers;
    const normalized = normalizers ? normalizers.normalizePoi(poi) : poi;
    _debugNormalized(normalized);
    const layout = _resolveLayout(customLayout, normalized, state);
    const sortedLayout = [...layout].sort(compareByOrder);
    if (Log)
        Log.info("[POI] Generating side panel with", sortedLayout.length, "sections");
    const body = await _renderSections(sortedLayout, normalized, state);
    contentDiv.appendChild(body);
    _attachPostRenderBehaviors(normalized, body, state);
}
const RendererCore$1 = {
    populateSidePanel,
};

/**
 * Module Renderers/Links pour POI
 * Rendu des links
 */
/**
 * Module Links Renderer
 * @namespace _POIRendererLinks
 * @private
 */
const _POIRendererLinks = {
    /**
     * Rend un link (website, etc.)
     * @param {Object} section - Configuration de la section
     * @param {string} url - URL du link
     * @returns {HTMLElement|null}
     */
    renderLink(section, url) {
        if (!url)
            return null;
        const container = document.createElement("div");
        container.className = "gl-poi-link-container";
        const link = document.createElement("a");
        link.className = "gl-poi-website-link";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = section.label || url;
        container.appendChild(link);
        return container;
    },
};
// ── ESM Export ──
const RendererLinks = _POIRendererLinks;

/**
 * GeoLeaf Contract — POI Renderers (lazy-chunk boundary)
 *
 * Interface ESM pure pour access aux sous-modules de rendu POI
 * (RendererCore, FieldRenderers, MediaRenderers, RendererLinks)
 * from the facade poi/renderers.js sans couplage runtime.
 *
 * Phase 10-D — Pattern C : contrat de chunk POI Renderers.
 *
 * USAGE :
 *   import { POIRenderersContract } from '../../contracts/poi-renderers.contract.js';
 *
 *   const fragment = POIRenderersContract.renderContent(poi, state);
 *   await POIRenderersContract.populateSidePanel(poi, layout);
 */
const RendererCore = RendererCore$1;
/** @type {FieldRenderers|null} Instance singleton paresseuse */
let _fieldRenderers = null;
/** @type {MediaRenderers|null} Instance singleton paresseuse */
let _mediaRenderers = null;
/**
 * Returns the instance singleton de FieldRenderers (lazy-init).
 * @returns {FieldRenderers}
 * @private
 */
function _getFieldRenderers() {
    if (!_fieldRenderers) {
        _fieldRenderers = new FieldRenderers({ debug: false });
    }
    return _fieldRenderers;
}
/**
 * Returns the instance singleton de MediaRenderers (lazy-init).
 * @returns {MediaRenderers}
 * @private
 */
function _getMediaRenderers() {
    if (!_mediaRenderers) {
        _mediaRenderers = new MediaRenderers({ debug: false });
    }
    return _mediaRenderers;
}
/**
 * Contrat d'interface for thes sous-modules POI Renderers.
 * @namespace POIRenderersContract
 */
const POIRenderersContract = {
    /**
     * Peuple le side panel with thes data of a POI.
     * @param {Object} poi - POI normalized
     * @param {Object} customLayout - Layout custom (optional)
     * @returns {Promise<void>}
     */
    async populateSidePanel(poi, customLayout) {
        if (RendererCore && typeof RendererCore.populateSidePanel === "function") {
            return RendererCore.populateSidePanel(poi, customLayout);
        }
    },
    /**
     * Rend le contenu complete of a POI (side panel).
     * @param {Object} poi - Data du POI
     * @param {Object} state - STATE
     * @returns {DocumentFragment}
     */
    renderContent(poi, state) {
        if (RendererCore && typeof RendererCore.renderContent === "function") {
            return RendererCore.renderContent(poi, state);
        }
        return document.createDocumentFragment();
    },
    /**
     * Rend un field text.
     * @param {Object} section
     * @param {Object} poi
     * @param {string} value
     * @returns {Promise<HTMLElement|null>}
     */
    async renderText(section, poi, value) {
        return _getFieldRenderers().renderText(section, poi, value);
    },
    /**
     * Rend un badge.
     * @param {Object} section
     * @param {*} value
     * @param {Object} poi
     * @returns {HTMLElement|null}
     */
    renderBadge(section, value, poi) {
        return _getFieldRenderers().renderBadge(section, value, poi);
    },
    /**
     * Rend une image.
     * @param {Object} section
     * @param {string} imageUrl
     * @returns {HTMLElement|null}
     */
    renderImage(section, imageUrl) {
        return _getMediaRenderers().renderImage(section, imageUrl);
    },
    /**
     * Rend une gallery.
     * @param {Object} section
     * @param {Array<string>} gallery
     * @returns {HTMLElement|null}
     */
    renderGallery(section, gallery) {
        return _getMediaRenderers().renderGallery(section, gallery);
    },
    /**
     * Rend un link.
     * @param {Object} section
     * @param {string} url
     * @returns {HTMLElement|null}
     */
    renderLink(section, url) {
        return RendererLinks.renderLink(section, url);
    },
};

/*!
 * GeoLeaf Core
 *  2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * Module POI Renderers (Aggregator)
 * Facade public pour tous les renderers POI - Phase 10-D Pattern C
 */
const _POIRenderers = {
    /**
     * Rend le contenu complete of a POI
     * @param {Object} poi - Data du POI
     * @param {Object} state - STATE
     * @returns {DocumentFragment}
     */
    renderContent(poi, state) {
        return POIRenderersContract.renderContent(poi, state);
    },
    /**
     * Rend un field text
     */
    renderText(section, poi, value) {
        return POIRenderersContract.renderText(section, poi, value);
    },
    /**
     * Rend un badge
     */
    renderBadge(section, value, poi) {
        return POIRenderersContract.renderBadge(section, value, poi);
    },
    /**
     * Rend une image
     */
    renderImage(section, imageUrl) {
        return POIRenderersContract.renderImage(section, imageUrl);
    },
    /**
     * Rend une gallery
     */
    renderGallery(section, gallery) {
        return POIRenderersContract.renderGallery(section, gallery);
    },
    /**
     * Rend un link
     */
    renderLink(section, url) {
        return POIRenderersContract.renderLink(section, url);
    },
    /**
     * Peuple le side panel with thes data du POI
     * @returns {Promise<void>}
     */
    async populateSidePanel(poi, customLayout) {
        return POIRenderersContract.populateSidePanel(poi, customLayout);
    },
};
//  ESM Export
const POIRenderers = _POIRenderers;

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - Side Panel
 * Management of the detailed display side panel for POI
 */
/**
 * Shorthand for createElement
 */
const $create = (tag, props, ...children) => {
    return createElement(tag, props, ...children);
};
// Reference au module shared
/**
 * Creates the element DOM du panel side si non existing.
 */
function createSidePanel() {
    const shared = POIShared;
    if (!shared)
        return;
    const state = shared.state;
    if (state.sidePanelElement)
        return; // Already created
    // Createsr l'overlay
    const overlay = $create("div", {
        className: "gl-poi-sidepanel-overlay",
        attributes: { "aria-hidden": "true" },
    });
    // Add to .gl-main for fullscreen mode support
    const glMain = document.querySelector(".gl-main");
    if (glMain) {
        glMain.appendChild(overlay);
    }
    else {
        document.body.appendChild(overlay);
    }
    state.sidePanelOverlay = overlay;
    // Createsr the panel
    const panel = $create("aside", {
        className: "gl-poi-sidepanel",
        attributes: {
            "aria-hidden": "true",
            role: "complementary",
            "aria-label": getLabel("aria.sidepanel.landmark"), // F2
        },
    });
    // Createsr le header avec button fermer
    const header = $create("div", { className: "gl-poi-sidepanel__header" });
    const closeBtn = $create("button", {
        className: "gl-poi-sidepanel__close",
        attributes: { "aria-label": getLabel("aria.sidepanel.close") }, // i18n
        textContent: "×",
        onClick: closeSidePanel,
    });
    header.appendChild(closeBtn);
    // Createsr le content
    const content = $create("div", { className: "gl-poi-sidepanel__content" });
    panel.appendChild(header);
    panel.appendChild(content);
    // Add to .gl-main for fullscreen mode support
    if (glMain) {
        glMain.appendChild(panel);
    }
    else {
        document.body.appendChild(panel);
    }
    state.sidePanelElement = panel;
    state.sidePanelContent = content;
    // Event listners
    overlay.addEventListener("click", closeSidePanel);
    if (Log)
        Log.info("[POI] Side panel created.");
}
/**
 * Ouvre the panel side with thes infos completes du POI.
 *
 * @param {object} poi - Data completes du POI.
 * @param {object} customLayout - Layout custom (optional).
 * @returns {Promise<void>}
 */
async function _populatePanel(poi, customLayout) {
    const renderers = POIRenderers;
    if (typeof renderers?.populateSidePanel === "function") {
        try {
            await renderers.populateSidePanel(poi, customLayout);
        }
        catch (err) {
            Log?.error("[POI] Erreur lors du peuplement du side panel :", err);
        }
    }
    else {
        Log?.warn("[POI] openSidePanel() : renderers.populateSidePanel non disponible");
    }
}
async function openSidePanel(poi, customLayout) {
    if (!poi) {
        Log?.warn("[POI] openSidePanel() : POI invalide.");
        return;
    }
    Log?.debug("[POI] openSidePanel:", poi.id ?? poi.name);
    const shared = POIShared;
    if (!shared) {
        Log?.error("[POI] openSidePanel() : POIShared is null");
        return;
    }
    const state = shared.state;
    // S'assurer que the panel existe
    if (!state.sidePanelElement) {
        createSidePanel();
    }
    if (!state.sidePanelElement) {
        Log?.error("[POI] openSidePanel() : Unable to create the side panel.");
        return;
    }
    state.currentPoiInPanel = poi;
    state.currentGalleryIndex = 0;
    await _populatePanel(poi, customLayout);
    // Displaysr l'overlay et the panel avec animation
    if (state.sidePanelOverlay) {
        state.sidePanelOverlay.classList.add("open");
    }
    state.sidePanelElement.classList.add("open");
    state.sidePanelElement.setAttribute("aria-hidden", "false");
    // F3: move focus to close button on panel open
    const closeBtnEl = state.sidePanelElement.querySelector(".gl-poi-sidepanel__close");
    if (closeBtnEl)
        closeBtnEl.focus();
    // F4: Escape key closes the panel
    const _escapeHandler = (e) => {
        if (e.key === "Escape") {
            closeSidePanel();
            document.removeEventListener("keydown", _escapeHandler);
        }
    };
    document.addEventListener("keydown", _escapeHandler);
    state._escapeHandler = _escapeHandler;
    // F5: Focus trap — keep Tab/Shift+Tab cycling within the panel (1.5.3)
    const _trapHandler = (e) => {
        if (e.key !== "Tab" || !state.sidePanelElement)
            return;
        const panel = state.sidePanelElement;
        const focusable = Array.from(panel.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => el.offsetParent !== null);
        if (!focusable.length)
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
    document.addEventListener("keydown", _trapHandler);
    state._trapHandler = _trapHandler;
    // Add class to body to shift the map
    document.body.classList.add("gl-poi-sidepanel-open");
    dispatchGeoLeafEvent("geoleaf:poi:panel:open", {
        poiId: String(poi?.id ?? ""),
        poiName: String(poi?.title ?? poi?.name ?? poi?.label ?? ""),
    });
    Log?.info("[POI] Side panel opened for:", poi.title ?? poi.name ?? poi.label);
}
/**
 * Ferme the panel side.
 */
function closeSidePanel() {
    const shared = POIShared;
    if (!shared)
        return;
    const state = shared.state;
    if (!state.sidePanelElement)
        return;
    state.sidePanelElement.classList.remove("open");
    state.sidePanelElement.setAttribute("aria-hidden", "true");
    // F4: remove Escape listner
    if (state._escapeHandler) {
        document.removeEventListener("keydown", state._escapeHandler);
        state._escapeHandler = null;
    }
    // F5: remove focus trap (1.5.3)
    if (state._trapHandler) {
        document.removeEventListener("keydown", state._trapHandler);
        state._trapHandler = null;
    }
    if (state.sidePanelOverlay) {
        state.sidePanelOverlay.classList.remove("open");
    }
    // Retirer class du body
    document.body.classList.remove("gl-poi-sidepanel-open");
    // Nettoyer la lightbox globale
    const lightbox = document.querySelector(".gl-poi-lightbox-global");
    if (lightbox) {
        lightbox.remove();
    }
    const closedPoiId = String(state.currentPoiInPanel?.id ?? "");
    state.currentPoiInPanel = null;
    dispatchGeoLeafEvent("geoleaf:poi:panel:close", { poiId: closedPoiId });
    if (Log)
        Log.info("[POI] Side panel closed.");
}
/**
 * Alias pour fermer the panel (API public).
 */
function hideSidePanel() {
    closeSidePanel();
}
// ========================================
//   EXPORT
// ========================================
const POISidepanel = {
    createSidePanel,
    openSidePanel,
    closeSidePanel,
    hideSidePanel,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * MapLibre POI Icon Registrar
 *
 * Converts each SVG `<symbol>` from the injected profile sprite into a
 * Canvas-rendered `ImageData` and registers it with MapLibre via `map.addImage()`.
 *
 * Rendering strategy: direct canvas 2D API — reads the DOM `<symbol>` children
 * (`<path>`, `<circle>`, `<line>`, etc.) and renders them with `Path2D` and
 * `ctx.arc()`. This avoids loading the SVG as an `<img>` element, which is
 * unreliable in Chrome for stroke-only SVGs (known blank-canvas issue) and is
 * subject to `img-src` CSP restrictions.
 *
 * @module adapters/maplibre/maplibre-poi-icons
 */
// ─── Constants ───────────────────────────────────────────────────────────────
/** Logical icon size in pixels (before pixel ratio scaling). */
const ICON_SIZE_PX = 24;
/** Pixel ratio for retina-sharp icon rendering. */
const ICON_PIXEL_RATIO = 2;
// ─── Canvas helpers ──────────────────────────────────────────────────────────
function _createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
function _getAttrFloat(el, name, fallback) {
    const v = Number.parseFloat(el.getAttribute(name) ?? "");
    return Number.isNaN(v) ? fallback : v;
}
// ─── Color resolution ────────────────────────────────────────────────────────
function _resolveColor(raw, parent) {
    if (!raw)
        return parent;
    if (raw === "currentColor")
        return "white";
    return raw;
}
function _resolveFill(raw, parent) {
    if (!raw)
        return parent;
    if (raw === "none")
        return null;
    if (raw === "currentColor")
        return "white";
    return raw;
}
// ─── Per-shape renderers ─────────────────────────────────────────────────────
function _renderPath(ctx, el, stroke, fill) {
    const d = el.getAttribute("d");
    if (!d)
        return;
    const path = new Path2D(d);
    if (fill)
        ctx.fill(path);
    if (stroke)
        ctx.stroke(path);
}
function _renderCircle(ctx, el, stroke, fill) {
    ctx.beginPath();
    ctx.arc(_getAttrFloat(el, "cx", 0), _getAttrFloat(el, "cy", 0), _getAttrFloat(el, "r", 0), 0, Math.PI * 2);
    if (fill)
        ctx.fill();
    if (stroke)
        ctx.stroke();
}
function _renderLine(ctx, el, stroke) {
    ctx.beginPath();
    ctx.moveTo(_getAttrFloat(el, "x1", 0), _getAttrFloat(el, "y1", 0));
    ctx.lineTo(_getAttrFloat(el, "x2", 0), _getAttrFloat(el, "y2", 0));
    if (stroke)
        ctx.stroke();
}
function _renderPoly(ctx, el, tag, stroke, fill) {
    const pts = (el.getAttribute("points") ?? "")
        .trim()
        .split(/[\s,]+/)
        .map(Number);
    if (pts.length < 4)
        return;
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length - 1; i += 2)
        ctx.lineTo(pts[i], pts[i + 1]);
    if (tag === "polygon")
        ctx.closePath();
    if (fill)
        ctx.fill();
    if (stroke)
        ctx.stroke();
}
function _renderRect(ctx, el, stroke, fill) {
    const x = _getAttrFloat(el, "x", 0);
    const y = _getAttrFloat(el, "y", 0);
    const w = _getAttrFloat(el, "width", 0);
    const h = _getAttrFloat(el, "height", 0);
    if (fill)
        ctx.fillRect(x, y, w, h);
    if (stroke)
        ctx.strokeRect(x, y, w, h);
}
function _renderEllipse(ctx, el, stroke, fill) {
    ctx.beginPath();
    ctx.ellipse(_getAttrFloat(el, "cx", 0), _getAttrFloat(el, "cy", 0), _getAttrFloat(el, "rx", 0), _getAttrFloat(el, "ry", 0), 0, 0, Math.PI * 2);
    if (fill)
        ctx.fill();
    if (stroke)
        ctx.stroke();
}
// ─── SVG element dispatcher ──────────────────────────────────────────────────
/**
 * Renders one SVG child element onto a canvas 2D context.
 * Coordinates are in the symbol's viewBox units — caller must apply `ctx.scale()`.
 */
function _renderSvgElement(ctx, el, parentStroke, parentFill) {
    const tag = el.tagName.toLowerCase();
    const stroke = _resolveColor(el.getAttribute("stroke"), parentStroke);
    const fill = _resolveFill(el.getAttribute("fill"), parentFill);
    if (stroke)
        ctx.strokeStyle = stroke;
    if (fill)
        ctx.fillStyle = fill;
    if (tag === "path") {
        _renderPath(ctx, el, stroke, fill);
        return;
    }
    if (tag === "circle") {
        _renderCircle(ctx, el, stroke, fill);
        return;
    }
    if (tag === "line") {
        _renderLine(ctx, el, stroke);
        return;
    }
    if (tag === "polyline" || tag === "polygon") {
        _renderPoly(ctx, el, tag, stroke, fill);
        return;
    }
    if (tag === "rect") {
        _renderRect(ctx, el, stroke, fill);
        return;
    }
    if (tag === "ellipse")
        _renderEllipse(ctx, el, stroke, fill);
}
// ─── Symbol rendering ─────────────────────────────────────────────────────────
/**
 * Renders a `<symbol>` DOM element directly to `ImageData` using the canvas 2D API.
 * Synchronous — no URL, no CSP, no browser timing dependency.
 */
function _renderSymbolToImageData(symbolEl, canvasSize) {
    const canvas = _createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return null;
    const vb = (symbolEl.getAttribute("viewBox") ?? "0 0 24 24").split(" ").map(Number);
    const scaleX = canvasSize / (vb[2] || 24);
    const scaleY = canvasSize / (vb[3] || 24);
    const rawStroke = symbolEl.getAttribute("stroke") ?? "currentColor";
    const rawFill = symbolEl.getAttribute("fill") ?? "none";
    const stroke = rawStroke === "currentColor" ? "white" : rawStroke;
    let fill = rawFill;
    if (rawFill === "none")
        fill = null;
    else if (rawFill === "currentColor")
        fill = "white";
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Number.parseFloat(symbolEl.getAttribute("stroke-width") ?? "1.7");
    ctx.lineCap = (symbolEl.getAttribute("stroke-linecap") ?? "round");
    ctx.lineJoin = (symbolEl.getAttribute("stroke-linejoin") ?? "round");
    if (fill)
        ctx.fillStyle = fill;
    for (const child of Array.from(symbolEl.children)) {
        _renderSvgElement(ctx, child, stroke, fill);
    }
    ctx.restore();
    const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const hasPixels = imageData.data.some((v, i) => i % 4 === 3 && v > 0);
    if (!hasPixels) {
        if (Log)
            Log.warn("[POI] registerSpriteIcons: canvas empty after direct render");
        return null;
    }
    return imageData;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Returns true when every child of the symbol is a `<use>` element.
 * These are alias symbols whose `<use href="#...">` targets are not available
 * when iterating children — skip them; the real symbols are registered directly.
 */
function _isAliasSymbol(symbol) {
    const children = Array.from(symbol.children);
    return children.length > 0 && children.every((c) => c.tagName.toLowerCase() === "use");
}
function _tryAddImage(map, id, imageData, canvasSize) {
    try {
        map.addImage(id, { data: imageData.data, width: canvasSize, height: canvasSize }, { pixelRatio: ICON_PIXEL_RATIO });
        return true;
    }
    catch (err) {
        if (Log)
            Log.warn(`[POI] registerSpriteIcons: map.addImage failed for "${id}":`, err);
        return false;
    }
}
// ─── Public API ──────────────────────────────────────────────────────────────
/** Renders and registers one symbol. Returns true if successfully registered. */
function _processSymbol(map, symbol, canvasSize) {
    const id = symbol.getAttribute("id");
    if (!id || map.hasImage(id))
        return false;
    if (_isAliasSymbol(symbol))
        return false;
    const imageData = _renderSymbolToImageData(symbol, canvasSize);
    if (!imageData) {
        if (Log)
            Log.warn(`[POI] registerSpriteIcons: failed to render "${id}"`);
        return false;
    }
    return _tryAddImage(map, id, imageData, canvasSize);
}
/**
 * Registers all SVG `<symbol>` elements from the injected profile sprite as
 * images in the MapLibre map instance.
 *
 * Each symbol's `id` attribute becomes the image name used in the symbol layer's
 * `"icon-image"` expression (`["get", "symbolId"]`).
 *
 * @param map - Native `maplibregl.Map` instance.
 */
async function registerSpriteIcons(map) {
    if (!map.isStyleLoaded()) {
        await new Promise((resolve) => map.once("styledata", resolve));
    }
    const spriteEl = document.querySelector('svg[data-geoleaf-sprite="profile"]');
    if (!spriteEl) {
        if (Log)
            Log.warn("[POI] registerSpriteIcons: sprite not in DOM — icons will not be registered.");
        return;
    }
    const symbols = Array.from(spriteEl.querySelectorAll("symbol[id]"));
    if (symbols.length === 0) {
        if (Log)
            Log.warn("[POI] registerSpriteIcons: no symbols found in sprite.");
        return;
    }
    const canvasSize = ICON_SIZE_PX * ICON_PIXEL_RATIO;
    const registered = symbols.filter((s) => _processSymbol(map, s, canvasSize)).length;
    if (Log)
        Log.info(`[POI] ${registered} icon(s) registered in MapLibre.`);
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf POI Module - Core
 * Fonctions maines d'initialization, loading et gestion des POI
 */
// References to POI modules
/**
 * Fonction maine d'initialization of the module POI.
 *
 * @param {unknown} mapOrOptions - Map instance or options object {map, config}.
 * @param {object} config - Configuration POI from globalThis.GeoLeaf.config.json (optional si premier param est object).
 */
function _resolveInitParams(mapOrOptions, config) {
    if (mapOrOptions && typeof mapOrOptions === "object" && mapOrOptions.map) {
        return { map: mapOrOptions.map, opts: mapOrOptions.config || mapOrOptions };
    }
    return { map: mapOrOptions, opts: config };
}
function _initPoiSidePanel() {
    if (!POISidepanel)
        return;
    if (typeof POISidepanel.createSidePanel !== "function")
        return;
    POISidepanel.createSidePanel();
}
async function _initPoiSprite() {
    if (!POIMarkers)
        return;
    if (typeof POIMarkers.ensureProfileSpriteInjectedSync !== "function")
        return;
    await POIMarkers.ensureProfileSpriteInjectedSync();
}
function _scheduleLoadOnStorageReady() {
    const onStorageReady = () => {
        document.removeEventListener("geoleaf:storage:ready", onStorageReady);
        loadAndDisplay();
    };
    document.addEventListener("geoleaf:storage:ready", onStorageReady, { once: true });
    if (document.readyState !== "loading") {
        Promise.resolve().then(() => {
            document.removeEventListener("geoleaf:storage:ready", onStorageReady);
            loadAndDisplay();
        });
        return;
    }
    document.addEventListener("DOMContentLoaded", () => {
        document.removeEventListener("geoleaf:storage:ready", onStorageReady);
        loadAndDisplay();
    }, { once: true });
}
function _schedulePoiLoad(state) {
    if (state.poiConfig.enabled === false)
        return;
    if (StorageContract.isAvailable()) {
        loadAndDisplay();
        return;
    }
    _scheduleLoadOnStorageReady();
}
async function _initMapLibrePoi(state, constants) {
    const _g = globalThis;
    const adapter = _g.GeoLeaf?.Core?.getAdapter?.();
    const nativeMap = adapter?.getNativeMap?.();
    state.adapter = adapter;
    state.poiSourceId = "poi-source";
    state.mapInstance = nativeMap;
    adapter.createClusterGroup(state.poiSourceId, {
        clusterRadius: state.poiConfig.clusterRadius || 50,
        clusterMaxZoom: state.poiConfig.disableClusteringAtZoom || constants.POI_MAX_ZOOM,
    });
    _initPoiSidePanel();
    await _initPoiSprite();
    await registerSpriteIcons(nativeMap);
    bindMapLibrePoiEvents(adapter, nativeMap, state);
    _schedulePoiLoad(state);
}
async function init(mapOrOptions, config) {
    const { opts } = _resolveInitParams(mapOrOptions, config);
    const shared = POIShared;
    if (!shared) {
        if (Log)
            Log.error("[POI] Module shared not loaded.");
        return;
    }
    const state = shared.state;
    const constants = shared.constants;
    state.poiConfig = opts || {};
    if (Log)
        Log.info("[POI] Initializing POI module...");
    // MapLibre detection
    const _g = globalThis;
    const adapter = _g.GeoLeaf?.Core?.getAdapter?.();
    const nativeMap = adapter?.getNativeMap?.();
    if (nativeMap && typeof nativeMap.addSource === "function") {
        return _initMapLibrePoi(state, constants);
    }
    // MapLibre adapter not found — cannot initialize without adapter
    if (Log)
        Log.error("[POI] MapLibre adapter not found. Cannot initialize POI module without adapter.");
}
/**
 * ✅ NEW FUNCTION: Loads and merges locally stored POIs with existing POIs
 */
function _detectWrappedPoiItem(item) {
    if (!item.data)
        return null;
    if (item.data.type !== "poi")
        return null;
    if (!item.action)
        return null;
    const actionStr = item.action;
    if (!actionStr.includes("add") && !actionStr.includes("update"))
        return null;
    return { isPoi: true, poiData: item.data, itemAction: item.action };
}
function _hasPoiCoords(item) {
    if (item.latlng)
        return true;
    if (item.latitude)
        return true;
    return false;
}
function _detectHeuristicPoiInData(item) {
    if (!item.data)
        return null;
    const d = item.data;
    if (!d.id && !d.latlng && !d.latitude)
        return null;
    const hintId = d.id || "no-id";
    if (Log)
        Log.info(`[POI] Heuristic POI detection: ${hintId}`);
    return { isPoi: true, poiData: d, itemAction: item.action || "add" };
}
function _detectDirectPoiItem(item) {
    if (item.type === "poi")
        return { isPoi: true, poiData: item, itemAction: item.action || "add" };
    const heuristic = _detectHeuristicPoiInData(item);
    if (heuristic)
        return heuristic;
    if (!item.id)
        return null;
    if (!_hasPoiCoords(item))
        return null;
    if (Log)
        Log.info(`[POI] Direct POI detection: ${item.id}`);
    return { isPoi: true, poiData: item, itemAction: "add" };
}
function _detectQueueItemFormat(item) {
    if (!item)
        return { isPoi: false, poiData: null, itemAction: null };
    const wrapped = _detectWrappedPoiItem(item);
    if (wrapped)
        return wrapped;
    const direct = _detectDirectPoiItem(item);
    if (direct)
        return direct;
    return { isPoi: false, poiData: null, itemAction: null };
}
function _processPoiQueueItem(item, normalizers, cachedPois) {
    if (!item)
        return;
    const { isPoi, poiData, itemAction } = _detectQueueItemFormat(item);
    if (!isPoi || !poiData) {
        if (Log)
            Log.debug(`[POI] Item ignored - action: ${item.action}, type: ${item.type || (item.data && item.data.type)}, keys: ${Object.keys(item).join(",")}`);
        return;
    }
    const normalizedPoi = normalizers.normalizePoi(poiData);
    if (!normalizedPoi) {
        if (Log)
            Log.warn("[POI] Failed to normalize cached POI:", poiData);
        return;
    }
    cachedPois.push(normalizedPoi);
    if (Log)
        Log.info(`[POI] Cached POI normalized: ${normalizedPoi.id || "No ID"} (action: ${itemAction})`);
}
function _mergeWithoutDuplicates(existingPois, cachedPois) {
    const merged = [...existingPois];
    for (const cachedPoi of cachedPois) {
        const duplicate = merged.find((p) => p.id === cachedPoi.id);
        if (!duplicate)
            merged.push(cachedPoi);
    }
    return merged;
}
function _waitForStorage(checkStorageAvailable, existingPois, callback) {
    if (Log)
        Log.warn("[POI] Module Storage pas encore pr\u00eat, attente \u00e9v\u00e9nement geoleaf:storage:ready...");
    const onReady = () => {
        if (checkStorageAvailable()) {
            loadAndMergeStoredPois(existingPois, callback);
        }
        else {
            if (Log)
                Log.error("[POI] Storage module still not available, aborting.");
            callback(existingPois);
        }
    };
    document.addEventListener("geoleaf:storage:ready", onReady, { once: true });
    Promise.resolve().then(() => {
        if (!checkStorageAvailable()) {
            document.removeEventListener("geoleaf:storage:ready", onReady);
            callback(existingPois);
        }
    });
}
function _onStorageQueueLoaded(queueItems, existingPois, callback) {
    if (Log)
        Log.info(`[POI] Cache retrieval: ${queueItems.length} items found`);
    if (!Array.isArray(queueItems) || queueItems.length === 0) {
        if (Log)
            Log.info("[POI] No POI found in the sync queue.");
        callback(existingPois);
        return;
    }
    if (Log) {
        const itemTypes = queueItems.map((item) => `${item.action}:${item.data?.type || "no-type"}`);
        Log.info(`[POI] Item types in cache: [${itemTypes.join(", ")}]`);
        queueItems.slice(0, 2).forEach((item, i) => {
            Log.info(`[POI] DEBUG Item ${i}:`, {
                action: item.action,
                type: item.type,
                data_type: item.data?.type,
                keys: Object.keys(item),
                data_keys: item.data ? Object.keys(item.data) : "no data",
            });
        });
    }
    const cachedPois = [];
    const normalizers = POINormalizers;
    if (!normalizers) {
        if (Log)
            Log.error("[POI] Normalizers module not available for cached POIs.");
        callback(existingPois);
        return;
    }
    queueItems.forEach((item) => {
        _processPoiQueueItem(item, normalizers, cachedPois);
    });
    if (cachedPois.length > 0) {
        if (Log)
            Log.info(`[POI] ${cachedPois.length} POI(s) retrieved from local cache.`);
        callback(_mergeWithoutDuplicates(existingPois, cachedPois));
    }
    else {
        callback(existingPois);
    }
}
function loadAndMergeStoredPois(existingPois, callback) {
    if (typeof callback !== "function") {
        if (Log)
            Log.error("[POI] loadAndMergeStoredPois: callback required");
        return;
    }
    const StorageAny = StorageContract;
    const checkStorageAvailable = () => StorageContract.isAvailable() && typeof StorageAny.DB?.getAllFromSyncQueue === "function";
    if (!checkStorageAvailable()) {
        _waitForStorage(checkStorageAvailable, existingPois, callback);
        return;
    }
    if (Log)
        Log.info("[POI] Storage module available, retrieving POIs...");
    StorageAny.DB.getAllFromSyncQueue()
        .then((queueItems) => _onStorageQueueLoaded(queueItems, existingPois, callback))
        .catch((err) => {
        if (Log)
            Log.error("[POI] Error retrieving cached POIs :", err);
        callback(existingPois);
    });
}
function _loadFromProfilePois(state) {
    const ConfigAny = Config;
    if (!ConfigAny)
        return false;
    if (typeof ConfigAny.getActiveProfilePoi !== "function")
        return false;
    const profilePois = ConfigAny.getActiveProfilePoi();
    if (!Array.isArray(profilePois))
        return false;
    if (profilePois.length === 0)
        return false;
    state.allPois = profilePois;
    if (Log)
        Log.info(`[POI] ${state.allPois.length} POI(s) from active profile.`);
    loadAndMergeStoredPois(state.allPois, (mergedPois) => {
        state.allPois = mergedPois;
        displayPois(state.allPois);
    });
    return true;
}
function _loadFromDataUrl(state) {
    const dataUrl = state.poiConfig.dataUrl;
    if (!dataUrl) {
        if (Log)
            Log.info("[POI] No dataUrl specified and no cached POIs. Manual add mode.");
        return;
    }
    state.isLoading = true;
    if (Log)
        Log.info("[POI] Loading POI data from :", dataUrl);
    fetch(dataUrl)
        .then((response) => {
        if (!response.ok)
            throw new Error(`Erreur HTTP ${response.status} lors du loading de ${dataUrl}`);
        return response.json();
    })
        .then((data) => {
        if (Array.isArray(data)) {
            state.allPois = data;
        }
        else if (data && Array.isArray(data.pois)) {
            state.allPois = data.pois;
        }
        else {
            state.allPois = [];
        }
        if (Log)
            Log.info(`[POI] ${state.allPois.length} POI(s) loaded from dataUrl.`);
        displayPois(state.allPois);
    })
        .catch((err) => {
        if (Log)
            Log.error("[POI] Error loading POIs :", err);
    })
        .finally(() => {
        state.isLoading = false;
    });
}
function loadAndDisplay() {
    const shared = POIShared;
    if (!shared)
        return;
    const state = shared.state;
    if (state.isLoading) {
        if (Log)
            Log.warn("[POI] Loading already in progress...");
        return;
    }
    try {
        if (_loadFromProfilePois(state))
            return;
    }
    catch (err) {
        if (Log)
            Log.error("[POI] Error retrieving POIs from active profile :", err);
    }
    loadAndMergeStoredPois([], (cachedPois) => {
        if (cachedPois.length > 0) {
            state.allPois = cachedPois;
            if (Log)
                Log.info(`[POI] ${cachedPois.length} POI(s) loaded from local cache.`);
            displayPois(cachedPois);
            return;
        }
        _loadFromDataUrl(state);
    });
}
/** Reusable coord extractor for poisToFeatureCollection. */
function _extractPoiCoords(poi) {
    const coords = POINormalizers.extractCoordinates(poi);
    if (!coords)
        return null;
    return { lat: coords[0], lng: coords[1] };
}
/** Builds a GeoJSON FeatureCollection from the POI array (MapLibre path). */
function _buildPoiFeatureCollection(pois) {
    return poisToFeatureCollection(pois, _extractPoiCoords, (poi) => POIMarkers.resolveCategoryDisplay(poi));
}
function _clearPoiLayers(state) {
    if (state.adapter && state.poiSourceId) {
        state.adapter.closePopup();
    }
}
/**
 * Displays all POIs passed as parameter on the map.
 *
 * @param {array} pois - Array d'objects POI.
 */
function displayPois(pois) {
    if (!pois || !Array.isArray(pois)) {
        if (Log)
            Log.warn("[POI] displayPois() : No valid POI data to display.");
        return;
    }
    const shared = POIShared;
    if (!shared)
        return;
    const state = shared.state;
    _clearPoiLayers(state);
    // R4.3.2 — Warn when a large number of markers is rendered without clustering.
    // Unclustered rendering at scale strains the WebGL layer budget.
    // Enable clustering in your profile (poiConfig.clustering: true) for better performance.
    if (pois.length > 1000 && state.poiConfig && state.poiConfig.clustering === false) {
        console.warn("[GeoLeaf PERF] " +
            pois.length +
            " markers rendered unclustered. " +
            "Enable clustering in your profile (poiConfig.clustering: true) for better performance.");
    }
    if (state.adapter && state.poiSourceId) {
        state.allPois = pois;
        const fc = _buildPoiFeatureCollection(pois);
        state.adapter.updateLayerData(state.poiSourceId, fc);
        if (Log)
            Log.info(`[POI] ${pois.length} POI(s) pushed to cluster source.`);
    }
}
function _validateAndNormalizePoi(poi, normalizers) {
    const normalizedPoi = normalizers.normalizePoi(poi);
    if (!normalizedPoi) {
        if (Log)
            Log.warn("[POI] addPoi() : POI normalization failed.", poi);
        return null;
    }
    if (!normalizedPoi.id)
        normalizedPoi.id = normalizers.generatePoiId(normalizedPoi);
    return normalizedPoi;
}
function _logNormalizedPoiDebug(normalizedPoi) {
    if (!Log)
        return;
    Log.info("[POI] Adding normalized POI:", normalizedPoi.id);
    Log.info("[POI] - Has _layerConfig:", !!normalizedPoi._layerConfig);
    Log.info("[POI] - Has _sidepanelConfig:", !!normalizedPoi._sidepanelConfig);
    Log.info("[POI] - Has _popupConfig:", !!normalizedPoi._popupConfig);
    Log.info("[POI] - Attributes keys:", Object.keys(normalizedPoi.attributes || {}));
}
/**
 * Adds a POI manually sur the map.
 * FIXED V3: Systematic normalization of new POIs
 *
 * @param {object} poi - Data du POI.
 * @returns {unknown} Marqueur created ou null.
 */
function addPoi(poi) {
    if (!poi) {
        if (Log)
            Log.warn("[POI] addPoi() : POI invalide.");
        return null;
    }
    const shared = POIShared;
    if (!shared)
        return null;
    const state = shared.state;
    const normalizers = POINormalizers;
    if (!normalizers)
        return null;
    const normalizedPoi = _validateAndNormalizePoi(poi, normalizers);
    if (!normalizedPoi)
        return null;
    _logNormalizedPoiDebug(normalizedPoi);
    if (state.adapter && state.poiSourceId) {
        state.allPois.push(normalizedPoi);
        const fc = _buildPoiFeatureCollection(state.allPois);
        state.adapter.updateLayerData(state.poiSourceId, fc);
        if (Log)
            Log.info("[POI] POI added, source updated:", normalizedPoi.id);
        return normalizedPoi;
    }
    return null;
}
/**
 * Retrieves tous les POI loadeds.
 *
 * @returns {array} Array des POI.
 */
function getAllPois() {
    const shared = POIShared;
    return shared ? shared.state.allPois : [];
}
/**
 * Updates the MapLibre cluster source with the filtered POI subset,
 * WITHOUT modifying state.allPois (the full dataset is preserved for subsequent filter calls).
 *
 * @param {array} pois - Filtered POI array to display.
 */
function setFilteredDisplay(pois) {
    const shared = POIShared;
    if (!shared)
        return;
    const state = shared.state;
    if (state.adapter && state.poiSourceId) {
        const fc = _buildPoiFeatureCollection(pois);
        state.adapter.updateLayerData(state.poiSourceId, fc);
        if (Log)
            Log.debug(`[POI] setFilteredDisplay: ${pois.length} filtered POI(s) shown`);
    }
    // state.allPois intentionally NOT modified — it remains the full dataset
}
/**
 * Retrieves un POI par son ID.
 *
 * @param {string} id - ID du POI.
 * @returns {object|null} POI found ou null.
 */
function getPoiById(id) {
    const shared = POIShared;
    if (!shared)
        return null;
    const state = shared.state;
    return state.allPois.find((p) => p.id === id) || null;
}
/**
 * Reloads POIs (clears and re-displays).
 *
 * @param {array} pois - Nouveau array de POI (optional).
 */
function reload(pois) {
    const shared = POIShared;
    if (!shared)
        return;
    const state = shared.state;
    if (pois && Array.isArray(pois)) {
        state.allPois = pois;
    }
    displayPois(state.allPois);
    if (Log)
        Log.info("[POI] POIs reloaded.");
}
// ========================================
//   EXPORT
// ========================================
const POICore = {
    init,
    loadAndDisplay,
    displayPois,
    addPoi,
    getAllPois,
    setFilteredDisplay,
    getPoiById,
    reload,
    getDisplayedPoisCount: function () {
        const shared = POIShared;
        return shared && shared.state ? (shared.state.allPois || []).length : 0;
    },
};

/**
 * GeoLeaf POI API (assemblage namespace POI)
 *
 * Assemble GeoLeaf.POI from thes sous-modules refactoreds :
 *   - poi/core.js      : Fonctions maines (init, load, display)
 *   - poi/sidepanel.js : Panneau side
 *   - poi/shared.js    : Shared state et constantes
 *
 * Note : POI.Renderers est injected separatedment par globals.api.js after Object.assign.
 *
 * @module poi/poi-api
 */
/**
 * API public of the module POI
 * All functions delegate to the appropriate sub-modules
 */
// NOTE: POI.Renderers is set explicitly by globals.js after Object.assign — do not set it here.
const POI = {
    /**
     * Initializes the module POI avec the map et la configuration.
     * Supporte deux signatures: init(map, config) et init({map, config}).
     */
    init: function (mapOrOptions, config) {
        if (!POICore) {
            if (Log)
                Log.error("[POI] Core module not loaded.");
            return;
        }
        POICore.init(mapOrOptions, config);
    },
    /**
     * Loads POI data from the configured endpoint and renders all markers on the map.
     * Equivalent to calling `load()` + `display()`.
     */
    loadAndDisplay: function () {
        if (!POICore) {
            if (Log)
                Log.error("[POI] Core module not loaded.");
            return;
        }
        POICore.loadAndDisplay();
    },
    /**
     * Renders an array of POI objects as markers on the map.
     *
     * @param pois - Array of POI objects to display.
     */
    displayPois: function (pois) {
        if (!POICore) {
            if (Log)
                Log.error("[POI] Core module not loaded.");
            return;
        }
        POICore.displayPois(pois);
    },
    /**
     * Adds a single POI to the map and internal registry.
     *
     * @param poi - POI object to add.
     * @returns The created MapLibre marker element, or `null` on failure.
     */
    addPoi: function (poi) {
        if (!POICore) {
            if (Log)
                Log.error("[POI] Core module not loaded.");
            return null;
        }
        return POICore.addPoi(poi);
    },
    /**
     * Alias for {@link POI.addPoi}.
     *
     * @param poi - POI object to add.
     * @returns `true` on success, `false` on failure.
     */
    add: function (poi) {
        if (!POICore) {
            if (Log)
                Log.error("[POI] Core module not loaded.");
            return false;
        }
        return POICore.addPoi(poi);
    },
    /**
     * Returns all POI objects currently in the internal registry.
     *
     * @returns Array of all POI objects.
     */
    getAllPois: function () {
        if (!POICore)
            return [];
        return POICore.getAllPois();
    },
    /**
     * Updates the MapLibre cluster source with a filtered POI subset
     * without modifying the internal full dataset (`state.allPois`).
     * Use this for filter operations to avoid data loss on subsequent filter calls.
     *
     * @param filteredPois - Filtered array of POI objects to display.
     */
    setFilteredDisplay: function (filteredPois) {
        if (!POICore)
            return;
        return POICore.setFilteredDisplay(filteredPois);
    },
    /**
     * Retrieves a POI by its unique identifier.
     *
     * @param id - POI identifier.
     * @returns The matching POI object, or `null` if not found.
     */
    getPoiById: function (id) {
        if (!POICore)
            return null;
        return POICore.getPoiById(id);
    },
    /**
     * Clears all current POI markers and re-renders the given array.
     *
     * @param pois - Replacement array of POI objects.
     */
    reload: function (pois) {
        if (!POICore) {
            if (Log)
                Log.error("[POI] Core module not loaded.");
            return;
        }
        POICore.reload(pois);
    },
    /**
     * Opens the side panel and displays the detail view for the given POI.
     *
     * @param poi - POI object to display.
     * @param customLayout - Optional custom layout configuration.
     */
    showPoiDetails: async function (poi, customLayout) {
        if (!POISidepanel) {
            if (Log)
                Log.error("[POI] SidePanel module not loaded.");
            return;
        }
        await POISidepanel.openSidePanel(poi, customLayout);
    },
    /**
     * Closes the POI side panel.
     */
    hideSidePanel: function () {
        if (!POISidepanel) {
            if (Log)
                Log.error("[POI] SidePanel module not loaded.");
            return;
        }
        POISidepanel.closeSidePanel();
    },
    openSidePanelWithLayout: function (poi, customLayout) {
        this.showPoiDetails(poi, customLayout);
    },
    /**
     * Returns the MapLibre source cluster group containing all POI markers.
     *
     * @returns The cluster group or layer group, or `null` if not initialised.
     */
    getLayer: function () {
        if (!POIShared)
            return null;
        const state = POIShared.state;
        return state.poiClusterGroup || state.poiLayerGroup;
    },
    /**
     * Returns the number of POI markers currently visible on the map.
     *
     * @returns Count of displayed POIs.
     */
    getDisplayedPoisCount: function () {
        if (!POICore) {
            if (Log)
                Log.error("[POI] Core module not loaded.");
            return 0;
        }
        return POICore.getDisplayedPoisCount();
    },
    /** @private */
    _clearAllForTests: function () {
        if (!POIShared)
            return;
        const state = POIShared.state;
        if (Log)
            Log.info("[POI] _clearAllForTests: Suppression de", state.allPois.length, "POI(s) et", state.poiMarkers.size, "marker(s)");
        state.allPois = [];
        state.poiMarkers.clear();
        if (state.poiClusterGroup)
            state.poiClusterGroup.clearLayers();
        if (state.poiLayerGroup)
            state.poiLayerGroup.clearLayers();
    },
};

/**
 * GeoLeaf Contract — POI Core operations
 *
 * Interface ESM pour que the modules POI (add-form, sync…) puissent appeler
 * les operations CRUD of the module POI (addPoi, updatePoi, removePoi, notify)
 * sans couplage runtime to the namespace global.
 *
 * Phase 10-E — Pattern G.
 *
 * REGISTRATION (dans globals.poi.js ou geoleaf.core.js) :
 *   import { POICoreContract } from '../../contracts/poi-core.contract.js';
 *   POICoreContract.register({ addPoi, updatePoi, removePoi }, notifyInstance);
 */
// ─── State ────────────────────────────────────────────────────────────────────
let _extra = null;
let _notify = null;
/**
 * @namespace POICoreContract
 */
const POICoreContract = {
    /**
     * Registers thes fonctions POI non-exportedes et the system de notification.
     * Called by globals.poi.js or the addpoi plugin on loading.
     * @param {{updatePoi?: Function, removePoi?: Function}} extras
     * @param {{success: Function, error: Function}} [notifyInstance]
     */
    register(extras, notifyInstance) {
        _extra = extras || {};
        if (notifyInstance)
            _notify = notifyInstance;
    },
    /**
     * @returns {boolean}
     */
    canShowDetails() {
        return !!(_extra && typeof _extra.showPoiDetails === "function");
    },
    /**
     * Show POI details panel.
     * @param {Object} poi
     */
    showPoiDetails(poi) {
        if (_extra && typeof _extra.showPoiDetails === "function") {
            _extra.showPoiDetails(poi);
        }
    },
    /**
     * Registers the instance UI.notify.
     * @param {{success: Function, error: Function}} notifyInstance
     */
    registerNotify(notifyInstance) {
        _notify = notifyInstance;
    },
    // ── POI CRUD ──
    /**
     * @param {Object} poi
     * @returns {unknown}
     */
    addPoi(poi) {
        return POICore.addPoi(poi);
    },
    /**
     * @param {Object} poiData
     */
    updatePoi(poiData) {
        if (_extra && typeof _extra.updatePoi === "function") {
            _extra.updatePoi(poiData);
        }
        // else: graceful no-op — updatePoi not yet registered
    },
    /**
     * @param {string} poiId
     */
    removePoi(poiId) {
        if (_extra && typeof _extra.removePoi === "function") {
            _extra.removePoi(poiId);
        }
    },
    /**
     * @returns {boolean}
     */
    canUpdate() {
        return !!(_extra && typeof _extra.updatePoi === "function");
    },
    /**
     * @returns {boolean}
     */
    canRemove() {
        return !!(_extra && typeof _extra.removePoi === "function");
    },
    // ── Notifications ──
    /**
     * @param {string} message
     */
    notifySuccess(message) {
        if (_notify && typeof _notify.success === "function") {
            _notify.success(message);
        }
    },
    /**
     * @param {string} message
     */
    notifyError(message) {
        if (_notify && typeof _notify.error === "function") {
            _notify.error(message);
        }
    },
};

var poiCore_contract = /*#__PURE__*/Object.freeze({
    __proto__: null,
    POICoreContract: POICoreContract
});

export { Assemblers as A, ContentBuilderCore as C, FieldRenderers as F, Helpers as H, LightboxManager as L, MediaRenderers as M, POIMarkers as P, RendererCore$1 as R, SectionOrchestrator as S, UIBehaviors as U, POIShared as a, POIAddFormContract as b, POI as c, ContentBuilderShared as d, POINormalizers as e, POIPopup as f, POISidepanel as g, POIRenderers as h, POICore as i, ComponentRenderers as j, RendererLinks as k, POICoreContract as l };
//# sourceMappingURL=geoleaf-chunk-poi-QQprkdbF.js.map
