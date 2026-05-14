import { L as Log, o as domCreate, K as blockMapPropagation, G as DOMSecurity, p as getLabel, x as Config, B as compareByOrder } from './geoleaf-chunk-core-utils-CGzgeOnm.js';
import { P as POIMarkers, a as POIShared } from './geoleaf-chunk-poi-wab1BBmO.js';
import { _ as _UIComponents } from './geoleaf-chunk-labels-CRJhnuZN.js';

/**
 * Module Legend Renderer
 * Rendu des symboles de legend cartographical
 *
 * DEPENDENCIES:
 * - DOM utilities
 * - GeoLeaf.Log (optional)
 *
 * EXPOSE:
 * - GeoLeaf._LegendRenderer
 */
/**
 * Rendu of a section de legend
 */
function renderSection(container, section) {
    const sectionEl = domCreate("div", "gl-legend__section", container);
    if (section.title) {
        const titleEl = domCreate("h3", "gl-legend__section-title", sectionEl);
        titleEl.textContent = section.title;
    }
    const itemsContainer = domCreate("div", "gl-legend__items", sectionEl);
    if (Array.isArray(section.items)) {
        section.items.forEach((item) => renderItem(itemsContainer, item));
    }
    return sectionEl;
}
/**
 * Rendu of a item de legend
 */
function renderItem(container, item) {
    const itemEl = domCreate("div", "gl-legend__item", container);
    const symbolEl = domCreate("div", "gl-legend__symbol", itemEl);
    renderSymbol(symbolEl, item);
    const textContainer = domCreate("div", "gl-legend__text", itemEl);
    const labelEl = domCreate("span", "gl-legend__label", textContainer);
    labelEl.textContent = item.label ?? "";
    if (item.description) {
        const descEl = domCreate("span", "gl-legend__description", textContainer);
        descEl.textContent = item.description;
    }
    return itemEl;
}
/**
 * Rendu of a symbole selon son type
 */
function renderSymbol(container, item) {
    if (_UIComponents && typeof _UIComponents.renderSymbol === "function") {
        _UIComponents.renderSymbol(container, item);
    }
    else {
        if (Log)
            Log.error("[LegendRenderer] Module _UIComponents not available");
    }
}
/**
 * Rendu du footer
 */
function renderFooter(container, footer) {
    if (!footer?.text)
        return;
    const footerEl = domCreate("div", "gl-legend__footer", container);
    footerEl.textContent = footer.text;
    if (footer.style === "italic") {
        footerEl.style.fontStyle = "italic";
    }
}
/**
 * Rendu of a accordion pour a layer
 */
function renderAccordion(container, accordionData) {
    const _UIComponentsResolved = globalThis.GeoLeaf?._UIComponents;
    if (!_UIComponentsResolved) {
        if (Log)
            Log.error("[LegendRenderer] Module _UIComponents not available");
        return;
    }
    const { bodyEl } = _UIComponentsResolved.createAccordion(container, {
        layerId: accordionData.layerId,
        label: accordionData.label,
        collapsed: accordionData.collapsed !== false,
        visible: accordionData.visible,
        onToggle: (_layerId, _expanded) => {
            const _gl = globalThis;
            if (_gl.GeoLeaf?.Legend && typeof _gl.GeoLeaf.Legend.toggleAccordion === "function") {
                _gl.GeoLeaf.Legend.toggleAccordion(accordionData.layerId);
            }
        },
    });
    if (Array.isArray(accordionData.sections)) {
        accordionData.sections.forEach((section) => {
            renderSection(bodyEl, section);
        });
    }
}
const LegendRenderer = {
    renderSection,
    renderItem,
    renderSymbol,
    renderFooter,
    renderAccordion,
};

/**
 * Module Legend Control
 * Adapter-agnostic control for displaying a cartographic legend.
 *
 * DEPENDENCIES:
 * - GeoLeaf.Log (optional)
 * - GeoLeaf._LegendRenderer
 *
 * EXPOSE:
 * - GeoLeaf._LegendControl
 */
let _alreadyLogged = false;
let _spriteDetected = false;
/**
 * Ensures the SVG icon sprite is loaded with robust verification.
 * Fast-path: if sprite was already detected, invoke callback synchronously.
 */
async function ensureSpriteLoaded(callback) {
    if (POIMarkers && typeof POIMarkers.ensureProfileSpriteInjectedSync === "function") {
        if (!_alreadyLogged) {
            Log?.debug("[Legend] Loading SVG sprite for icons...");
            _alreadyLogged = true;
        }
        await POIMarkers.ensureProfileSpriteInjectedSync();
        const spriteEl = document.querySelector('svg[data-geoleaf-sprite="profile"]');
        if (spriteEl) {
            if (!_spriteDetected) {
                Log?.info("[Legend] SVG sprite detected and ready for use");
                _spriteDetected = true;
            }
            if (typeof callback === "function")
                callback(true);
            return;
        }
        // No sprite found after injection attempt — proceed without sprite icons
        Log?.debug("[Legend] No SVG sprite found — profile uses non-sprite icons");
        if (typeof callback === "function")
            callback(false);
    }
    else {
        Log?.debug("[Legend] GeoLeaf._POIMarkers.ensureProfileSpriteInjectedSync non disponible");
        if (typeof callback === "function")
            callback(false);
    }
}
function _buildLegendHeader(opts, wrapper, self) {
    if (!opts.title)
        return;
    const header = domCreate("div", "gl-map-legend__header", wrapper);
    const titleEl = domCreate("h2", "gl-map-legend__title", header);
    titleEl.textContent = opts.title ?? "";
    if (opts.collapsible) {
        const toggleEl = domCreate("button", "gl-map-legend__toggle", header);
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
}
function _renderLegendContent(bodyEl, opts) {
    DOMSecurity.clearElementFast(bodyEl);
    if (!LegendRenderer) {
        if (Log)
            Log.error("[Legend] LegendRenderer not available");
        return;
    }
    ensureSpriteLoaded();
    if (Array.isArray(opts.sections))
        opts.sections.forEach((section) => LegendRenderer.renderSection(bodyEl, section));
    if (opts.footer)
        LegendRenderer.renderFooter(bodyEl, opts.footer);
}
function _updateMultiLayerLegendContent(instance, legendsArray) {
    if (!instance._bodyEl)
        return;
    instance._renderGen = (instance._renderGen ?? 0) + 1;
    const gen = instance._renderGen;
    DOMSecurity.clearElementFast(instance._bodyEl);
    if (!LegendRenderer || typeof LegendRenderer.renderAccordion !== "function") {
        if (Log)
            Log.error("[Legend] Renderer.renderAccordion not available");
        return;
    }
    ensureSpriteLoaded(function (spriteLoaded) {
        if (instance._renderGen !== gen)
            return;
        if (Log)
            Log.debug("[Legend] Sprite loaded:", spriteLoaded, "- Rendering accordions");
        if (Array.isArray(legendsArray))
            legendsArray.forEach((accordionData) => LegendRenderer.renderAccordion(instance._bodyEl, accordionData));
        if (!spriteLoaded) {
            setTimeout(function () {
                const spriteEl = document.querySelector('svg[data-geoleaf-sprite="profile"]');
                if (spriteEl && Log) {
                    Log.info("[Legend] Sprite loaded late - Re-rendering accordions");
                    instance.updateMultiLayerContent(legendsArray);
                }
            }, 1000);
        }
    });
}
function _doLegendBuildStructure(self) {
    const opts = self._glOptions;
    const wrapper = domCreate("div", "gl-map-legend__wrapper", self._container);
    _buildLegendHeader(opts, wrapper, self);
    self._bodyEl = domCreate("div", "gl-map-legend__body", wrapper);
    if (opts.collapsed)
        self._container.classList.add("gl-map-legend--collapsed");
    self._renderContent();
}
/**
 * Creates an adapter-agnostic legend control instance.
 *
 * The returned object exposes `addTo(map)` which delegates to
 * `map.addControl(container, position)` from the IMapAdapter contract.
 */
function createLegendControl(options) {
    const instance = {
        _map: null,
        _container: null,
        _bodyEl: null,
        _glOptions: options,
        _controlHandle: null,
        _cleanups: [],
        addTo(map) {
            this._map = map;
            this._container = domCreate("div", "gl-map-legend");
            blockMapPropagation(this._container, this._cleanups);
            this._buildStructure();
            this._controlHandle = map.addControl(this._container, options.position || "bottomleft");
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
            _doLegendBuildStructure(this);
        },
        _renderContent() {
            if (this._bodyEl)
                _renderLegendContent(this._bodyEl, this._glOptions);
        },
        _toggleCollapsed() {
            const isCollapsed = this._container.classList.toggle("gl-map-legend--collapsed");
            this._glOptions.collapsed = isCollapsed;
        },
        updateMultiLayerContent(legendsArray) {
            _updateMultiLayerLegendContent(this, legendsArray);
        },
        updateContent(legendData) {
            if (legendData.title)
                this._glOptions.title = legendData.title;
            if (legendData.sections)
                this._glOptions.sections = legendData.sections;
            if (legendData.footer)
                this._glOptions.footer = legendData.footer;
            this._renderContent();
        },
        show() {
            if (this._container)
                this._container.style.display = "block";
        },
        hide() {
            if (this._container)
                this._container.style.display = "none";
        },
    };
    return instance;
}
const LegendControl = {
    create: createLegendControl,
};

/**
 * Module Legend Generator
 * Generates automaticment the legends from thes files de style
 *
 * DEPENDENCIES:
 * - GeoLeaf.Log (optional)
 *
 * EXPOSE:
 * - GeoLeaf._LegendGenerator
 */
function _findKeyCI(obj, id) {
    if (Object.prototype.hasOwnProperty.call(obj, id))
        return id;
    const lower = id.toLowerCase();
    return Object.keys(obj).find((k) => k.toLowerCase() === lower) ?? null;
}
function _findSubcategoryIcon(categories, value, symbolPrefix) {
    const valueStr = value;
    for (const categoryKey in categories) {
        const subcategories = categories[categoryKey].subcategories;
        if (!subcategories)
            continue;
        const subKey = _findKeyCI(subcategories, valueStr);
        if (subKey && subcategories[subKey]?.icon) {
            return symbolPrefix + subcategories[subKey].icon;
        }
    }
    return null;
}
function _findCategoryIcon(categories, value, symbolPrefix) {
    const catKey = _findKeyCI(categories, value);
    if (catKey && categories[catKey]?.icon) {
        return symbolPrefix + categories[catKey].icon;
    }
    return null;
}
function _buildFallbackItem(items, styleData, geometryType, taxonomyData, symbolPrefix) {
    if (items.length !== 0 || !styleData.style || !styleData.legend)
        return;
    const item = generateLegendItem(styleData.style, styleData.legend, geometryType, null, null, taxonomyData, symbolPrefix);
    if (item)
        items.push(item);
}
function _buildSymbolForGeometry(geometryType, mergedStyle, rule, taxonomyData, symbolPrefix) {
    switch (geometryType) {
        case "point":
            return generatePointSymbol(mergedStyle, rule, taxonomyData, symbolPrefix);
        case "line":
            return generateLineSymbol(mergedStyle);
        case "polygon":
            return generatePolygonSymbol(mergedStyle);
        default:
            Log?.warn("[LegendGenerator] Unrecognized geometry type:", geometryType);
            return generatePointSymbol(mergedStyle, rule, taxonomyData, symbolPrefix);
    }
}
const _FIELD_CATEGORY_MAP = {
    "properties.categoryId": "categoryId",
    categoryId: "categoryId",
    "properties.category": "categoryId",
    category: "categoryId",
    "properties.subCategoryId": "subCategoryId",
    subCategoryId: "subCategoryId",
    "properties.subCategory": "subCategoryId",
    subCategory: "subCategoryId",
};
function _resolveIdsFromWhen(rule) {
    const ids = { categoryId: null, subCategoryId: null };
    if (!(rule.when?.field && rule.when.value !== undefined))
        return ids;
    const f = rule.when.field;
    const v = rule.when.value;
    if (f === "properties.fclass" || f === "fclass") {
        const mapping = fclassMappings[v];
        if (mapping) {
            ids.categoryId = mapping.categoryId;
            ids.subCategoryId = mapping.subCategoryId;
        }
    }
    else {
        const key = _FIELD_CATEGORY_MAP[f];
        if (key)
            ids[key] = v;
    }
    return ids;
}
function _resolveIdsFromCondition(rule) {
    let categoryId = null;
    let subCategoryId = null;
    if (!rule.condition)
        return { categoryId, subCategoryId };
    if (rule.condition.categoryId !== undefined)
        categoryId = rule.condition.categoryId;
    if (rule.condition.subCategoryId !== undefined)
        subCategoryId = rule.condition.subCategoryId;
    if (rule.condition.category !== undefined)
        categoryId = rule.condition.category;
    if (rule.condition.subCategory !== undefined)
        subCategoryId = rule.condition.subCategory;
    return { categoryId, subCategoryId };
}
function _inferCategoryId(categoriesConfig, subCategoryId) {
    if (!subCategoryId)
        return null;
    for (const catKey of Object.keys(categoriesConfig)) {
        const subs = categoriesConfig[catKey].subcategories;
        if (subs && _findKeyCI(subs, subCategoryId))
            return catKey;
    }
    return null;
}
function _resolveSubcatIcon(cat, subCategoryId) {
    const subKey = cat.subcategories ? _findKeyCI(cat.subcategories, subCategoryId) : null;
    const subCat = subKey ? cat.subcategories[subKey] : null;
    if (subCat)
        return subCat.icon || subCat.iconId || cat.icon || cat.iconId || null;
    return cat.icon || cat.iconId || null;
}
function _resolveIconId(categoriesConfig, categoryId, subCategoryId) {
    if (!categoryId)
        return null;
    const catKey = _findKeyCI(categoriesConfig, categoryId);
    const cat = catKey ? categoriesConfig[catKey] : null;
    if (!cat)
        return null;
    if (subCategoryId && cat.subcategories)
        return _resolveSubcatIcon(cat, subCategoryId);
    return cat.icon || cat.iconId || null;
}
function _resolveRadius(style) {
    const r = style.radius || style.size;
    return r || (style.sizePx ? style.sizePx / 2 : 6);
}
function _resolveFirstDefined(v1, v2, fallback) {
    if (v1 !== undefined)
        return v1;
    if (v2 !== undefined)
        return v2;
    return fallback;
}
function _resolveCircleColors(style, fill, stroke) {
    return {
        fillColor: style.fillColor ||
            style.color ||
            fill.color ||
            "#3388ff",
        color: style.color || stroke.color || "#ffffff",
    };
}
function _buildPointSymbolBase(style) {
    const fill = style.fill || {};
    const stroke = style.stroke || {};
    const colors = _resolveCircleColors(style, fill, stroke);
    return {
        type: "circle",
        radius: _resolveRadius(style),
        fillColor: colors.fillColor,
        fillOpacity: _resolveFirstDefined(style.fillOpacity, fill.opacity, 1),
        color: colors.color,
        weight: style.weight || stroke.widthPx || 2,
        opacity: _resolveFirstDefined(style.opacity, stroke.opacity, 1),
    };
}
function _applyIconFromRule(symbol, rule, symbolPrefix) {
    if (!shouldUseIcons())
        return false;
    const res = resolveRuleIcons(rule);
    if (!res.useIcon || !res.iconId)
        return false;
    const base = res.iconId.startsWith("#")
        ? res.iconId
        : symbolPrefix
            ? symbolPrefix + res.iconId
            : "#sprite-" + res.iconId;
    symbol.icon = base;
    symbol.iconColor = "#ffffff";
    Log?.debug(`[LegendGenerator] Icon resolved from config: ${base}`);
    return true;
}
function _applyPointIcon(symbol, style, rule, taxonomyData, symbolPrefix) {
    if (style.useIcon && style.iconId) {
        symbol.icon = style.iconId;
        symbol.iconColor = "#ffffff";
        Log?.debug(`[LegendGenerator] Icon found in style: ${style.iconId}`);
        return;
    }
    if (rule && _applyIconFromRule(symbol, rule, symbolPrefix))
        return;
    if (!symbol.icon && rule && taxonomyData && shouldUseIcons()) {
        const icon = getIconFromTaxonomy(rule, taxonomyData, symbolPrefix);
        if (icon) {
            symbol.icon = icon;
            symbol.iconColor = "#ffffff";
            Log?.debug("[LegendGenerator] Taxonomy icon added:", icon);
        }
    }
}
function _buildLineBase(style) {
    const stroke = style.stroke || {};
    const casing = style.casing || {};
    const symbol = {
        type: "line",
        color: stroke.color || style.color || "#3388ff",
        width: stroke.widthPx || style.weight || 3,
        style: "solid",
    };
    return { symbol, stroke, casing };
}
function _applyCasingLine(symbol, casing) {
    if (casing.enabled && casing.color) {
        symbol.outlineColor = casing.color;
        symbol.outlineWidth = Math.max(0.5, (casing.widthPx || 1) * 0.4);
        symbol.outlineOpacity = casing.opacity ?? 1;
    }
}
function _applyLineDash(symbol, style, stroke) {
    const dashArray = style.dashArray || stroke.dashArray;
    if (!dashArray)
        return;
    symbol.dashArray = dashArray;
    if (dashArray === "5, 5" || dashArray === "10, 10") {
        symbol.style = "dashed";
    }
    else if (dashArray === "1, 3" || dashArray === "2, 4") {
        symbol.style = "dotted";
    }
}
function _buildPolygonBase(fill, stroke, style) {
    return {
        type: "polygon",
        fillColor: style.fillColor ||
            style.color ||
            fill.color ||
            "#3388ff",
        color: style.color || stroke.color || "#333",
        weight: style.weight || stroke.widthPx || 1,
    };
}
function _applyPolygonDecorations(symbol, fill, style, stroke) {
    applyOpacityProperties(symbol, style, ["fillOpacity"]);
    if (fill.opacity !== undefined)
        symbol.opacity = fill.opacity;
    if (style.opacity !== undefined)
        symbol.opacity = style.opacity;
    const dashArray = style.dashArray || stroke.dashArray;
    if (dashArray)
        symbol.dashArray = dashArray;
    if (style.fillPattern)
        symbol.fillPattern = style.fillPattern;
    if (style.hatch)
        symbol.hatch = style.hatch;
}
function _isSubCategoryField(field) {
    return field === "properties.subCategoryId" || field === "attributes.subCategoryId";
}
function _isCategoryIdField(field) {
    return field === "properties.categoryId" || field === "attributes.categoryId";
}
function getIconFromTaxonomy(rule, taxonomyData, symbolPrefix) {
    if (!rule.when || !taxonomyData?.categories) {
        Log?.debug("[LegendGenerator] Insufficient data to retrieve icon:", {
            hasRule: !!rule.when,
            hasTaxonomy: !!taxonomyData,
            hasCategories: !!(taxonomyData && taxonomyData.categories),
        });
        return null;
    }
    const field = rule.when.field;
    const value = rule.when.value ?? "";
    const categories = taxonomyData.categories;
    Log?.debug(`[LegendGenerator] Looking for icon for ${field}=${value}`);
    const isSubCategory = _isSubCategoryField(field);
    const isCategoryId = _isCategoryIdField(field);
    if (isSubCategory) {
        const iconId = _findSubcategoryIcon(categories, value, symbolPrefix);
        if (iconId) {
            Log?.debug(`[LegendGenerator] Icon found (subcat): ${iconId}`);
            return iconId;
        }
    }
    if (isCategoryId) {
        const iconId = _findCategoryIcon(categories, value, symbolPrefix);
        if (iconId) {
            Log?.debug(`[LegendGenerator] Icon found (cat): ${iconId}`);
            return iconId;
        }
    }
    const isKnownTaxonomyField = isSubCategory ||
        isCategoryId ||
        field === "fclass" ||
        field === "properties.fclass" ||
        !!_FIELD_CATEGORY_MAP[field ?? ""];
    if (isKnownTaxonomyField) {
        Log?.warn(`[LegendGenerator] No icon found for ${field}=${value}`);
    }
    else {
        Log?.debug(`[LegendGenerator] Field "${field}" is not a taxonomy field — icon lookup skipped`);
    }
    return null;
}
function shouldUseIcons() {
    try {
        const shared = POIShared ?? null;
        const poiConfig = shared
            ? (shared.state
                ?.poiConfig ?? {})
            : {};
        const showIconsOnMap = poiConfig.showIconsOnMap !== false;
        if (showIconsOnMap) {
            const iconsConfig = Config.getIconsConfig?.() ??
                null;
            if (iconsConfig && iconsConfig.showOnMap !== false) {
                return true;
            }
        }
    }
    catch {
        // ignore
    }
    return false;
}
/**
 * Generates thes data de legend from un file de style
 */
function generateLegendFromStyle(styleData, geometryType, taxonomyData) {
    if (!styleData) {
        Log?.warn("[LegendGenerator] Style data manquant");
        return null;
    }
    const legendData = {
        version: "1.2.0",
        id: styleData.id,
        title: styleData.label || "Sans titre",
        description: styleData.description || "",
        sections: [],
    };
    const items = [];
    const symbolPrefix = taxonomyData?.icons?.symbolPrefix || "tourism-poi-cat-";
    if (Array.isArray(styleData.styleRules) && styleData.styleRules.length > 0) {
        styleData.styleRules.forEach((rule) => {
            // Accept rule.legend or fall back to rule.label (backward-compat with older style formats)
            const legendMeta = rule.legend ?? (rule.label ? { label: rule.label } : null);
            if (!legendMeta) {
                Log?.debug("[LegendGenerator] Rule without legend property (skipped):", rule);
                return;
            }
            const item = generateLegendItem(rule.style, legendMeta, geometryType, styleData.style ?? null, rule, taxonomyData, symbolPrefix);
            if (item) {
                items.push(item);
            }
        });
        items.sort(compareByOrder);
    }
    _buildFallbackItem(items, styleData, geometryType, taxonomyData, symbolPrefix);
    if (items.length > 0) {
        legendData.sections.push({
            title: "",
            items,
        });
    }
    return legendData;
}
function generateLegendItem(style, legend, geometryType, baseStyle, rule, taxonomyData, symbolPrefix) {
    if (!style || !legend) {
        return null;
    }
    const mergedStyle = baseStyle ? Object.assign({}, baseStyle, style) : style;
    const item = {
        label: legend.label || "Sans label",
        order: legend.order ?? 999,
        symbol: {},
    };
    if (legend.description) {
        item.description = legend.description;
    }
    item.symbol = _buildSymbolForGeometry(geometryType, mergedStyle, rule, taxonomyData, symbolPrefix);
    return item;
}
function applyOpacityProperties(symbol, style, opacityProps) {
    opacityProps.forEach((prop) => {
        if (style[prop] !== undefined) {
            symbol[prop] = style[prop];
        }
    });
}
const fclassMappings = {
    archaeological: { categoryId: "CULTURES", subCategoryId: "SITE ARCHEOLOGIQUE" },
    museum: { categoryId: "CULTURES", subCategoryId: "MUSEE" },
    camp_site: { categoryId: "HEBERGEMENT", subCategoryId: "CAMPING" },
    hotel: { categoryId: "HEBERGEMENT", subCategoryId: "HOTEL" },
};
function _getCategories() {
    const cfg = Config.getCategories?.();
    if (!cfg || Object.keys(cfg).length === 0)
        return null;
    return cfg;
}
function resolveRuleIcons(rule) {
    if (!shouldUseIcons())
        return { useIcon: false, iconId: null };
    const categoriesConfig = _getCategories();
    if (!categoriesConfig)
        return { useIcon: false, iconId: null };
    let { categoryId, subCategoryId } = _resolveIdsFromWhen(rule);
    if (!categoryId && !subCategoryId) {
        ({ categoryId, subCategoryId } = _resolveIdsFromCondition(rule));
    }
    if (subCategoryId && !categoryId) {
        categoryId = _inferCategoryId(categoriesConfig, subCategoryId);
    }
    if (!categoryId && !subCategoryId)
        return { useIcon: false, iconId: null };
    const iconId = _resolveIconId(categoriesConfig, categoryId, subCategoryId);
    return { useIcon: iconId !== null, iconId };
}
function generatePointSymbol(style, rule, taxonomyData, symbolPrefix) {
    const symbol = _buildPointSymbolBase(style);
    _applyPointIcon(symbol, style, rule, taxonomyData, symbolPrefix);
    return symbol;
}
function generateLineSymbol(style) {
    const { symbol, stroke, casing } = _buildLineBase(style);
    _applyCasingLine(symbol, casing);
    if (stroke.opacity !== undefined) {
        symbol.opacity = stroke.opacity;
    }
    _applyLineDash(symbol, style, stroke);
    return symbol;
}
function generatePolygonSymbol(style) {
    const fill = style.fill || {};
    const stroke = style.stroke || {};
    const symbol = _buildPolygonBase(fill, stroke, style);
    _applyPolygonDecorations(symbol, fill, style, stroke);
    return symbol;
}
const LegendGenerator = {
    generateLegendFromStyle,
    generateLegendItem,
};

/**
 * GeoLeaf Legend API (assemblage namespace Legend)
 * @module legend/legend-api
 */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * Module main GeoLeaf.Legend
 * Manager for legend cartographical multi-layers avec accordions
 */
const _g = typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
        ? window
        : {};
_g.GeoLeaf = _g.GeoLeaf || {};
function _getGeoLeaf() {
    return _g.GeoLeaf;
}
let _map = null;
let _control = null;
let _options = {};
let _profileConfig = null;
let _taxonomyData = null;
let _rebuildTimer = null;
const REBUILD_DEBOUNCE_MS = 150;
let _loadingOverlayEl = null;
let _loadingOverlayTimer = null;
const LOADING_OVERLAY_TIMEOUT_MS = 12000;
const _allLayers = new Map();
function _normalizeGeometryType(rawGeometry) {
    const value = (rawGeometry || "").toLowerCase();
    if (value === "polyline" || value === "line")
        return "line";
    if (value === "polygon")
        return "polygon";
    return "point";
}
function _scheduleRebuild() {
    if (_rebuildTimer) {
        clearTimeout(_rebuildTimer);
    }
    _rebuildTimer = setTimeout(() => {
        _rebuildTimer = null;
        LegendModule._rebuildDisplay();
    }, REBUILD_DEBOUNCE_MS);
}
function _ensureSpinnerStyles() {
    if (document.getElementById("gl-legend-spinner-style"))
        return;
    const styleEl = document.createElement("style");
    styleEl.id = "gl-legend-spinner-style";
    styleEl.textContent =
        "@keyframes gl-legend-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
    document.head.appendChild(styleEl);
}
function _clearOverlayTimeout() {
    if (_loadingOverlayTimer) {
        clearTimeout(_loadingOverlayTimer);
        _loadingOverlayTimer = null;
    }
}
function _showLoadingOverlay() {
    if (!_control?._container)
        return;
    _ensureSpinnerStyles();
    _clearOverlayTimeout();
    const container = _control._container;
    if (!container.style.position) {
        container.style.position = "relative";
    }
    if (!_loadingOverlayEl) {
        const overlay = document.createElement("div");
        overlay.className = "gl-map-legend__loading-overlay";
        overlay.style.position = "absolute";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(255,255,255,0.6)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.pointerEvents = "auto";
        overlay.style.zIndex = "2";
        overlay.setAttribute("aria-hidden", "false");
        const spinner = document.createElement("div");
        spinner.className = "gl-map-legend__spinner";
        spinner.style.width = "34px";
        spinner.style.height = "34px";
        spinner.style.border = "3px solid rgba(0,0,0,0.12)";
        spinner.style.borderTop = "3px solid rgba(0,0,0,0.55)";
        spinner.style.borderRadius = "50%";
        spinner.style.animation = "gl-legend-spin 1s linear infinite";
        overlay.appendChild(spinner);
        _loadingOverlayEl = overlay;
    }
    if (!_loadingOverlayEl.parentElement) {
        container.appendChild(_loadingOverlayEl);
    }
    container.setAttribute("aria-busy", "true");
    container.setAttribute("aria-live", "polite");
    _loadingOverlayTimer = setTimeout(() => {
        _loadingOverlayTimer = null;
        _hideLoadingOverlay();
    }, LOADING_OVERLAY_TIMEOUT_MS);
}
function _hideLoadingOverlay() {
    _clearOverlayTimeout();
    if (_loadingOverlayEl?.parentElement) {
        _loadingOverlayEl.parentElement.removeChild(_loadingOverlayEl);
    }
    if (_control?._container) {
        _control._container.removeAttribute("aria-busy");
        _control._container.removeAttribute("aria-live");
    }
}
function _resolveProfileConfig(Config) {
    if (!Config)
        return null;
    if (typeof Config.getActiveProfile === "function")
        return Config.getActiveProfile();
    const allConfig = Config.getAll();
    return {
        id: allConfig.id ?? Config.get("id"),
        layers: (allConfig.layers ?? Config.get("layers")) ?? [],
    };
}
function _ensureLegendControl() {
    if (_control)
        return;
    const ControlFactory = _getGeoLeaf()._LegendControl?.create;
    if (ControlFactory) {
        _control = ControlFactory(_options);
        // Use the control's own addTo(map) instead of map.addControl(ctrl)
        if (_control && typeof _control.addTo === "function") {
            _control.addTo(_map);
        }
    }
}
function _updateLegendContent(ctrl, self) {
    const visibilityManager = _getGeoLeaf()._LayerVisibilityManager;
    const legendsArray = [];
    _allLayers.forEach((data, layerId) => {
        if (!data.legendData)
            return;
        const visState = typeof visibilityManager?.getVisibilityState === "function"
            ? visibilityManager.getVisibilityState(layerId)
            : null;
        const isVisible = visState?.current ?? data.visible;
        if (!isVisible)
            return;
        legendsArray.push({
            layerId,
            label: data.label,
            collapsed: true,
            order: data.order,
            visible: true,
            sections: data.legendData.sections ?? [],
        });
    });
    legendsArray.sort((a, b) => a.order - b.order);
    ctrl.updateMultiLayerContent(legendsArray);
    const hasIcons = legendsArray.some((legend) => legend.sections.some((section) => section.items?.some((item) => item.icon)));
    if (hasIcons && !document.querySelector('svg[data-geoleaf-sprite="profile"]')) {
        Log?.info("[Legend] Icons detected but sprite missing - scheduling retry");
        setTimeout(() => {
            if (document.querySelector('svg[data-geoleaf-sprite="profile"]')) {
                Log?.info("[Legend] Sprite available - re-rendering legend");
                self._rebuildDisplay();
            }
        }, 2000);
    }
}
function _resolveStyleFilePath(profileId, layerDir, layerConfig, styleId) {
    if (!layerConfig.styles?.directory)
        return null;
    const stylesDir = layerConfig.styles.directory;
    const styleFile = layerConfig.styles.available?.find((s) => s.id === styleId)?.file ??
        layerConfig.styles.default;
    const Config = _getGeoLeaf().Config;
    const dataCfg = Config?.get
        ? Config.get("data")
        : null;
    const profilesBasePath = dataCfg?.profilesBasePath ?? "profiles";
    return `${profilesBasePath}/${profileId}/${layerDir}/${stylesDir}/${styleFile}`;
}
function _resolveLayerGeometryType(layerConfig, layerInfo) {
    const raw = layerConfig.geometryType ?? layerConfig.geometry ?? layerInfo.geometryType ?? "point";
    return _normalizeGeometryType(raw);
}
function _applyStyleToLegend(layerId, layerInfo, layerConfig, styleData) {
    const GeoLeaf = _getGeoLeaf();
    const Generator = GeoLeaf._LegendGenerator;
    if (!Generator) {
        Log?.error("[Legend] LegendGenerator non disponible");
        return;
    }
    const originalPOIShared = GeoLeaf._POIShared;
    if (layerConfig.showIconsOnMap !== undefined) {
        GeoLeaf._POIShared = {
            state: { poiConfig: { showIconsOnMap: layerConfig.showIconsOnMap } },
        };
    }
    const legendData = Generator.generateLegendFromStyle(styleData, layerInfo.geometryType, _taxonomyData);
    if (layerConfig.showIconsOnMap !== undefined) {
        GeoLeaf._POIShared = originalPOIShared;
    }
    if (legendData) {
        layerInfo.legendData = legendData;
        _allLayers.set(layerId, layerInfo);
        Log?.debug(`[Legend] Legend generated for ${layerId}`);
        _scheduleRebuild();
    }
}
const LegendModule = {
    init(mapInstance, options) {
        if (!mapInstance) {
            Log?.error("[Legend] MapLibre map instance required to initialize Legend");
            return false;
        }
        _map = mapInstance;
        const Config = _getGeoLeaf().Config;
        if (Config && typeof Config.get === "function") {
            const legendConfig = Config.get("legendConfig");
            _options = Object.assign({
                position: legendConfig?.position ?? "bottomleft",
                collapsible: true,
                collapsed: legendConfig?.collapsedByDefault ?? false,
                title: legendConfig?.title ?? "Legend",
            }, options ?? {});
            _profileConfig = _resolveProfileConfig(Config);
        }
        else {
            _options = Object.assign({ position: "bottomleft", collapsible: true, collapsed: false, title: "Legend" }, options ?? {});
        }
        this._loadTaxonomy();
        this._initializeAllLayers();
        Log?.info("[Legend] Legend module initialized with automatic generation from styles");
        return true;
    },
    _loadTaxonomy() {
        if (!_profileConfig)
            return;
        const Config = _getGeoLeaf().Config;
        const dataCfg = Config?.get
            ? Config.get("data")
            : null;
        const profilesBasePath = dataCfg?.profilesBasePath ?? "profiles";
        const profileId = _profileConfig.id;
        if (!profileId) {
            if (Log)
                Log.warn("[Legend] Cannot load taxonomy without profileId");
            return;
        }
        const taxonomyPath = `${profilesBasePath}/${profileId}/taxonomy.json`;
        fetch(taxonomyPath)
            .then((response) => {
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
            .then((data) => {
            _taxonomyData = data;
            if (Log)
                Log.debug("[Legend] Taxonomy loaded");
        })
            .catch((err) => {
            if (Log)
                Log.warn(`[Legend] Taxonomy loading error: ${err.message}`);
        });
    },
    _initializeAllLayers() {
        if (!_profileConfig?.layers?.length) {
            if (Log)
                Log.warn("[Legend] No layer defined in the profile");
            return;
        }
        _profileConfig.layers.forEach((layerDef, index) => {
            const existing = _allLayers.get(layerDef.id);
            if (existing) {
                // Preserve entry already populated by the theme applier
                // (legendData, visible, label, etc.) — only refresh order.
                existing.order = index + 1;
                if (!existing.configFile)
                    existing.configFile = layerDef.configFile;
                return;
            }
            _allLayers.set(layerDef.id, {
                label: layerDef.id,
                styleId: null,
                legendData: null,
                visible: false,
                order: index + 1,
                geometryType: "",
                configFile: layerDef.configFile,
            });
        });
        if (Log)
            Log.debug(`[Legend] ${_allLayers.size} layer(s) initialized`);
    },
    loadLayerLegend(layerId, styleId, layerConfig) {
        if (!_map) {
            // Silent when showLegend is explicitly disabled — module is intentionally not initialized
            const uiCfg = globalThis.GeoLeaf?.Config?.get?.("ui");
            if (uiCfg?.showLegend !== false) {
                Log?.warn("[Legend] Module not initialized");
            }
            return;
        }
        const layerInfo = _allLayers.get(layerId);
        if (!layerInfo) {
            Log?.warn(`[Legend] Layer ${layerId} not found in profile`);
            return;
        }
        const POIMarkers = _getGeoLeaf()._POIMarkers;
        if (typeof POIMarkers
            ?.ensureProfileSpriteInjectedSync === "function") {
            POIMarkers.ensureProfileSpriteInjectedSync();
            Log?.debug(`[Legend] SVG sprite requested for layer ${layerId}`);
        }
        layerInfo.label = layerConfig.label ?? layerId;
        layerInfo.geometryType = _resolveLayerGeometryType(layerConfig, layerInfo);
        layerInfo.styleId = styleId;
        const profileId = layerConfig._profileId ?? _profileConfig?.id;
        const layerDir = layerConfig._layerDirectory ?? `layers/${layerId}`;
        const stylePath = _resolveStyleFilePath(profileId, layerDir, layerConfig, styleId);
        if (!stylePath) {
            Log?.warn(`[Legend] Configuration styles manquante pour ${layerId}`);
            return;
        }
        Log?.debug(`[Legend] Chargement style: ${stylePath}`);
        fetch(stylePath)
            .then((response) => {
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
            .then((styleData) => {
            _applyStyleToLegend(layerId, layerInfo, layerConfig, styleData);
        })
            .catch((err) => {
            Log?.warn(`[Legend] Erreur loading style: ${err.message}`);
        });
    },
    setLayerVisibility(layerId, visible) {
        const layerInfo = _allLayers.get(layerId);
        if (layerInfo) {
            layerInfo.visible = visible;
            _allLayers.set(layerId, layerInfo);
            _scheduleRebuild();
            if (Log)
                Log.debug(`[Legend] Visibility of ${layerId}: ${visible}`);
        }
    },
    _rebuildDisplay() {
        if (!_map)
            return;
        if (_allLayers.size === 0) {
            if (_control && _map) {
                if (typeof _control.remove === "function") {
                    _control.remove();
                }
                _control = null;
            }
            return;
        }
        _ensureLegendControl();
        if (_control?.updateMultiLayerContent) {
            _updateLegendContent(_control, this);
        }
    },
    toggleAccordion(_layerId) {
        // Managed visually by the renderer
    },
    getAllLayers() {
        return _allLayers;
    },
    hideLegend() {
        if (_control?.hide) {
            _control.hide();
        }
    },
    removeLegend() {
        _allLayers.forEach((layerInfo) => {
            layerInfo.legendData = null;
            layerInfo.visible = false;
        });
        if (_control && _map) {
            if (typeof _control.remove === "function") {
                _control.remove();
            }
            _control = null;
            if (Log)
                Log.debug("[Legend] All legends removed");
        }
    },
    isLegendVisible() {
        return _control !== null && _allLayers.size > 0;
    },
    showLoadingOverlay() {
        _showLoadingOverlay();
    },
    hideLoadingOverlay() {
        _hideLoadingOverlay();
    },
};
const Legend = LegendModule;

export { Legend as L, LegendControl as a, LegendGenerator as b, LegendRenderer as c };
//# sourceMappingURL=geoleaf-chunk-legend-EiidBdJl.js.map
