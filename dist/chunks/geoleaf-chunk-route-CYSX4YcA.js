import { L as Log, m as escapeHtml } from './geoleaf-chunk-core-utils-DQS_tOJV.js';

/**
 * GeoLeaf Route Layer Manager Module
 * Gestion des layers Leaflet for thes routes
 */
const _g$2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
function _createRouteLayer(context, g) {
    const interactiveShapes = g.GeoLeaf?.Config?.get?.("ui.interactiveShapes", false);
    const lineStyle = Object.assign({}, context.options?.lineStyle ?? {}, {
        interactive: interactiveShapes,
    });
    // Stub route layer — in MapLibre mode, routes are rendered via GeoJSON sources+layers
    context.routeLayer = {
        _stub: true,
        _coords: [],
        _style: lineStyle,
        setLatLngs(coords) {
            this._coords = coords;
        },
        getLatLngs() {
            return this._coords;
        },
        getBounds() {
            return null;
        },
        addTo() {
            return this;
        },
    };
}
function _fitRouteBounds(context, coords, routeLayer) {
    if (!context.options?.fitBoundsOnLoad || coords.length <= 1 || !context.map)
        return;
    const bounds = routeLayer.getBounds();
    const fitOpt = {};
    if (context.options.maxZoomOnFit)
        fitOpt.maxZoom = context.options.maxZoomOnFit;
    const map = context.map;
    map.fitBounds?.(bounds, fitOpt);
}
const RouteLayerManager = {
    applyRoute(context, coords, clearCallback, fireEventsCallback) {
        if (!Array.isArray(coords)) {
            coords = [];
        }
        if (typeof clearCallback === "function") {
            clearCallback();
        }
        const g = _g$2;
        if (!context.routeLayer && context.layerGroup && context.map) {
            _createRouteLayer(context, g);
        }
        const routeLayer = context.routeLayer;
        if (routeLayer) {
            routeLayer.setLatLngs(coords);
            _fitRouteBounds(context, coords, routeLayer);
        }
        if (typeof fireEventsCallback === "function") {
            fireEventsCallback(coords);
        }
    },
    addWaypoint(layerGroup, latlng, waypointStyle) {
        if (!layerGroup)
            return;
        const g = _g$2;
        const interactiveShapes = g.GeoLeaf?.Config?.get?.("ui.interactiveShapes", false);
        Object.assign({}, waypointStyle, { interactive: interactiveShapes });
    },
    addSegment(routeLayer, coords) {
        if (!routeLayer)
            return;
        const layer = routeLayer;
        const current = layer.getLatLngs?.() ?? [];
        layer.setLatLngs?.([...current, ...coords]);
    },
    fireRouteLoadedEvents(map, routeLayer, coords) {
        try {
            const m = map;
            if (m?.fire) {
                m.fire("geoleaf:route:loaded", {
                    coords,
                    layer: routeLayer,
                    source: "geoleaf.route",
                });
            }
        }
        catch (e) {
            Log.warn("[GeoLeaf.Route] Unable to fire Leaflet event geoleaf:route:loaded.", e);
        }
        if (typeof document !== "undefined" && typeof document.dispatchEvent === "function") {
            const detail = {
                coords: Array.isArray(coords) ? coords.slice() : [],
                map,
                layer: routeLayer,
                source: "geoleaf.route",
            };
            try {
                const event = new CustomEvent("geoleaf:route:loaded", { detail });
                document.dispatchEvent(event);
            }
            catch {
                try {
                    const legacyEvent = document.createEvent("CustomEvent");
                    legacyEvent.initCustomEvent("geoleaf:route:loaded", true, true, detail);
                    document.dispatchEvent(legacyEvent);
                }
                catch (err) {
                    Log.warn("[GeoLeaf.Route] Unable to fire CustomEvent geoleaf:route:loaded.", err);
                }
            }
        }
    },
};

/**
 * GeoLeaf Route Loaders Module
 * Loadsment d'routes depuis different sources (GPX, GeoJSON, Config)
 */
function _extractFromFlatArray(geom) {
    if (geom.length === 0)
        return null;
    const first = geom[0];
    if (Array.isArray(first) && typeof first[0] === "number" && typeof first[1] === "number") {
        return geom;
    }
    const geoLike = first;
    if (!geoLike || typeof geoLike !== "object")
        return null;
    if (geoLike.type !== "LineString")
        return null;
    if (!Array.isArray(geoLike.coordinates))
        return null;
    return geoLike.coordinates.map((c) => [c[1], c[0]]);
}
function _extractFromLineStringGeom(geo) {
    if (!geo || typeof geo !== "object")
        return null;
    if (geo.type !== "LineString")
        return null;
    if (!Array.isArray(geo.coordinates))
        return null;
    if (geo.coordinates.length === 0)
        return null;
    return geo.coordinates.map((c) => [c[1], c[0]]);
}
function _extractFromMultiLineStringGeom(geo) {
    if (!geo || typeof geo !== "object")
        return null;
    if (geo.type !== "MultiLineString")
        return null;
    if (!Array.isArray(geo.coordinates))
        return null;
    if (geo.coordinates.length === 0)
        return null;
    const allCoords = [];
    for (const segment of geo.coordinates) {
        if (!Array.isArray(segment))
            continue;
        for (const c of segment)
            allCoords.push([c[1], c[0]]);
    }
    return allCoords.length > 0 ? allCoords : null;
}
const RouteLoaders = {
    loadGeoJSON(geojson, applyRouteCallback) {
        if (!geojson || !geojson.type) {
            Log.error("[GeoLeaf.Route] GeoJSON invalide.");
            return;
        }
        let coords = [];
        if (geojson.type === "Feature" &&
            geojson.geometry?.type === "LineString") {
            const geom = geojson.geometry;
            coords = geom.coordinates.map((c) => [c[1], c[0]]);
        }
        else if (geojson.type === "LineString" &&
            Array.isArray(geojson.coordinates)) {
            coords = geojson.coordinates.map((c) => [
                c[1],
                c[0],
            ]);
        }
        else {
            Log.warn("[GeoLeaf.Route] Unsupported GeoJSON format.");
        }
        if (typeof applyRouteCallback === "function") {
            applyRouteCallback(coords);
        }
    },
    extractCoordsFromRouteItem(route) {
        const geom = route.geometry;
        if (Array.isArray(geom)) {
            const result = _extractFromFlatArray(geom);
            if (result)
                return result;
        }
        const lineResult = _extractFromLineStringGeom(geom);
        if (lineResult)
            return lineResult;
        const multiResult = _extractFromMultiLineStringGeom(geom);
        if (multiResult)
            return multiResult;
        return [];
    },
};

/**
 * GeoLeaf Route Popup Builder Module
 * Building des popups/tooltips et panel side for thes routes.
 */
const _g$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
const _taxonomyCache = {
    profileId: null,
    categories: {},
    icons: {},
};
function _getTaxonomyCache() {
    const Config = _g$1.GeoLeaf?.Config;
    if (!Config?.getActiveProfile)
        return { categories: {}, icons: {} };
    const profile = Config.getActiveProfile() ?? {};
    const profileId = profile.id ?? null;
    if (_taxonomyCache.profileId !== profileId) {
        _taxonomyCache.profileId = profileId;
        _taxonomyCache.categories =
            profile.taxonomy?.categories ?? {};
        _taxonomyCache.icons = profile.icons ?? {};
    }
    return { categories: _taxonomyCache.categories, icons: _taxonomyCache.icons };
}
function getContentBuilder() {
    return _g$1.GeoLeaf?._ContentBuilder?.Assemblers ?? null;
}
function getNormalizer() {
    return _g$1.GeoLeaf?._Normalizer ?? null;
}
function convertRouteToPOI(route) {
    const Normalizer = getNormalizer();
    if (Normalizer?.normalizeFromRoute) {
        return Normalizer.normalizeFromRoute(route);
    }
    const attrs = route.attributes ?? {};
    return {
        id: route.id,
        sourceType: "route",
        geometryType: "LineString",
        title: route.label ?? route.name ?? "Route",
        description: attrs.description ?? route.description ?? "",
        lat: null,
        lng: null,
        categoryId: attrs.categoryId ?? null,
        subCategoryId: attrs.subCategoryId ?? null,
        attributes: {
            ...attrs,
            label: route.label ?? route.name,
            photo: attrs.photo,
            distance_km: attrs.distance_km,
            duration_min: attrs.duration_min,
            difficulty: attrs.difficulty,
            tags: attrs.tags,
        },
        rawData: route,
    };
}
function getRoutePopupConfig() {
    const Config = _g$1.GeoLeaf?.Config;
    if (!Config?.getActiveProfile)
        return null;
    const profile = Config.getActiveProfile();
    const panels = profile?.panels;
    return panels?.route?.popup?.detailPopup ?? null;
}
function getRouteLayoutConfig() {
    const Config = _g$1.GeoLeaf?.Config;
    if (!Config?.getActiveProfile)
        return null;
    const profile = Config.getActiveProfile();
    const panels = profile?.panels;
    return panels?.route?.layout ?? null;
}
function _pickCatIcon(catData, subCatData, iconsConfig) {
    if (subCatData && subCatData.icon)
        return subCatData.icon;
    if (catData && catData.icon)
        return catData.icon;
    if (iconsConfig.defaultIcon)
        return iconsConfig.defaultIcon;
    return "activity-generic";
}
function _pickCatFill(catData, subCatData) {
    if (subCatData && subCatData.colorFill)
        return subCatData.colorFill;
    if (catData && catData.colorFill)
        return catData.colorFill;
    return "#666666";
}
function _pickCatStroke(catData, subCatData) {
    if (subCatData && subCatData.colorStroke)
        return subCatData.colorStroke;
    if (catData && catData.colorStroke)
        return catData.colorStroke;
    return "#222222";
}
function _resolveIconData(categoryId, subCategoryId, categories, iconsConfig) {
    const catData = categoryId ? categories[categoryId] : null;
    const subCatData = catData && subCategoryId ? catData.subcategories?.[subCategoryId] : null;
    return {
        iconId: _pickCatIcon(catData, subCatData, iconsConfig),
        colorFill: _pickCatFill(catData, subCatData),
        colorStroke: _pickCatStroke(catData, subCatData),
    };
}
function _buildIconHtml(iconId, colorFill, colorStroke, symbolPrefix) {
    if (!iconId)
        return "";
    const symbolId = symbolPrefix + String(iconId).trim().toLowerCase().replace(/\s+/g, "-");
    return ('<svg class="gl-poi-popup__icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">' +
        '<circle cx="12" cy="12" r="10" fill="' +
        colorFill +
        '" stroke="' +
        colorStroke +
        '" stroke-width="1.5"/>' +
        '<svg x="4" y="4" width="16" height="16"><use href="#' +
        symbolId +
        '" style="color: #ffffff"/></svg>' +
        "</svg>");
}
function _buildRouteMeta(attrs) {
    const diffLabels = {
        easy: "Facile",
        medium: "Moyen",
        hard: "Difficile",
    };
    const metaItems = [];
    if (attrs.distance_km)
        metaItems.push("📏 " + attrs.distance_km + " km");
    if (attrs.duration_min)
        metaItems.push("⏱️ " + attrs.duration_min + " min");
    if (attrs.difficulty)
        metaItems.push("⚡ " +
            (diffLabels[attrs.difficulty]
                ? diffLabels[attrs.difficulty]
                : String(attrs.difficulty)));
    return metaItems.length > 0
        ? '<p class="gl-poi-popup__meta-text">' + metaItems.join(" • ") + "</p>"
        : "";
}
function _buildTagBadges(attrs) {
    if (!Array.isArray(attrs.tags))
        return "";
    const badges = [];
    for (const tag of attrs.tags) {
        if (tag && typeof tag === "string")
            badges.push('<span class="gl-poi-badge gl-poi-badge--tag">' + escapeHtml(tag) + "</span>");
    }
    return badges.length ? '<div class="gl-poi-popup__badges">' + badges.join("") + "</div>" : "";
}
function _extractRouteData(route) {
    const attrs = (route.attributes ? route.attributes : {});
    const rawLabel = route.label ? route.label : route.name ? route.name : "Route";
    const rawDesc = attrs.description
        ? attrs.description
        : route.description
            ? route.description
            : "";
    return {
        attrs,
        label: escapeHtml(String(rawLabel)),
        description: escapeHtml(String(rawDesc)),
        photo: (attrs.photo ? attrs.photo : route.photo),
        routeId: escapeHtml(String(route.id ? route.id : "")),
        categoryId: attrs.categoryId ? attrs.categoryId : null,
        subCategoryId: attrs.subCategoryId ? attrs.subCategoryId : null,
    };
}
function buildFallbackRoutePopup(route) {
    const { attrs, label, description, photo, routeId, categoryId, subCategoryId } = _extractRouteData(route);
    const taxCache = _getTaxonomyCache();
    const categories = taxCache.categories;
    const iconsConfig = taxCache.icons;
    const { iconId, colorFill, colorStroke } = _resolveIconData(categoryId, subCategoryId, categories, iconsConfig);
    const symbolPrefix = iconsConfig.symbolPrefix ? iconsConfig.symbolPrefix : "gl-poi-cat-";
    const iconHtml = _buildIconHtml(iconId, colorFill, colorStroke, symbolPrefix);
    const metaText = _buildRouteMeta(attrs);
    const tagBadgesHtml = _buildTagBadges(attrs);
    const photoHtml = photo
        ? '<div class="gl-poi-popup__photo"><img src="' + photo + '" alt="' + label + '" /></div>'
        : "";
    const descHtml = description ? '<p class="gl-poi-popup__desc">' + description + "</p>" : "";
    return ('<div class="gl-poi-popup">' +
        photoHtml +
        '<div class="gl-poi-popup__body">' +
        '<div class="gl-poi-popup__title-wrapper">' +
        '<h3 class="gl-poi-popup__title">' +
        iconHtml +
        '<span class="gl-poi-popup__title-text">' +
        label +
        "</span></h3>" +
        "</div>" +
        descHtml +
        metaText +
        tagBadgesHtml +
        '<a class="gl-poi-popup__link" href="#" data-route-id="' +
        routeId +
        '">Voir plus &gt;&gt;&gt;</a>' +
        "</div></div>");
}
function _buildRouteSidePanelPoi(route) {
    const attrs = (route.attributes ? route.attributes : {});
    const title = route.label ? route.label : route.name;
    const diffLabels = {
        easy: "Facile",
        medium: "Moyen",
        hard: "Difficile",
    };
    const metadata = [];
    if (attrs.distance_km)
        metadata.push("📏 Distance : " + attrs.distance_km + " km");
    if (attrs.duration_min)
        metadata.push("⏱️ Duration: " + attrs.duration_min + " minutes");
    if (attrs.difficulty)
        metadata.push("⚡ Difficulty: " +
            (diffLabels[attrs.difficulty]
                ? diffLabels[attrs.difficulty]
                : String(attrs.difficulty)));
    return {
        id: route.id,
        label: title,
        title,
        name: title,
        description: attrs.description ? attrs.description : route.description,
        attributes: {
            ...attrs,
            metadata: metadata.length > 0 ? metadata : null,
            photo: attrs.photo,
            mainImage: attrs.photo,
            description: attrs.description,
            shortDescription: attrs.description,
            description_long: attrs.description_long,
            longDescription: attrs.description_long,
            categoryId: attrs.categoryId,
            subCategoryId: attrs.subCategoryId,
            difficulty: attrs.difficulty,
            distance_km: attrs.distance_km,
            duration_min: attrs.duration_min,
            tags: attrs.tags,
            link: attrs.link,
        },
    };
}
const RoutePopupBuilder = {
    addRouteTooltip(polyline, route) {
        const label = route.label ?? route.name ?? "Route";
        polyline.bindTooltip(escapeHtml(label), { sticky: true, className: "gl-route-tooltip" });
    },
    addRoutePopup(polyline, route, _routeModule) {
        const popupContent = RoutePopupBuilder.buildRoutePopupContent(route);
        polyline.bindPopup(popupContent, { maxWidth: 300 });
        polyline.on("popupopen", () => {
            Log.info?.("[Route Popup] Popup opened for route:", route.id);
            setTimeout(() => {
                const selector = '.gl-poi-popup__link[data-route-id="' + route.id + '"]';
                const linkEl = document.querySelector(selector);
                if (linkEl && !linkEl._geoleafClickBound) {
                    linkEl._geoleafClickBound = true;
                    linkEl.addEventListener("click", (e) => {
                        e.preventDefault();
                        RoutePopupBuilder.openRouteSidePanel(route);
                    });
                }
            }, 50);
        });
    },
    buildRoutePopupContent(route) {
        const ContentBuilder = getContentBuilder();
        const config = getRoutePopupConfig();
        const routeAsPoi = convertRouteToPOI(route);
        if (ContentBuilder?.buildPopupHTML && config) {
            return ContentBuilder.buildPopupHTML(routeAsPoi, config, {
                resolveCategoryDisplay: null,
            });
        }
        return buildFallbackRoutePopup(route);
    },
    openRouteSidePanel(route) {
        const g = _g$1;
        if (!(g.GeoLeaf && g.GeoLeaf.POI && g.GeoLeaf.POI.openSidePanelWithLayout)) {
            Log.warn?.("[Route Popup] Cannot open side panel: POI.openSidePanelWithLayout not available");
            return;
        }
        g.GeoLeaf.POI.openSidePanelWithLayout(_buildRouteSidePanelPoi(route), getRouteLayoutConfig());
    },
};

/**
 * GeoLeaf Route Style Resolver Module
 * Resolution des styles d'routes (colors, endpoints)
 */
function _applyRoutePropertyStyle(finalStyle, p) {
    if (typeof p.color === "string" && p.color.trim() !== "")
        finalStyle.color = p.color.trim();
    if (typeof p.weight === "number")
        finalStyle.weight = p.weight;
    if (typeof p.opacity === "number")
        finalStyle.opacity = p.opacity;
    if (typeof p.dashArray === "string" && p.dashArray.trim() !== "")
        finalStyle.dashArray = p.dashArray.trim();
}
function _applyEndpointOverrides(cfg, src) {
    if (!src || typeof src !== "object")
        return;
    if (typeof src.showStart === "boolean")
        cfg.showStart = src.showStart;
    if (typeof src.showEnd === "boolean")
        cfg.showEnd = src.showEnd;
    const startObj = src.start ?? src.startStyle;
    const endObj = src.end ?? src.endStyle;
    if (startObj)
        Object.assign(cfg.startStyle, startObj);
    if (endObj)
        Object.assign(cfg.endStyle, endObj);
}
const RouteStyleResolver = {
    getRouteColor(route, profile, routeConfigDefault) {
        if (!route?.attributes) {
            return routeConfigDefault?.color ?? null;
        }
        const attrs = route.attributes;
        const categoryId = attrs.categoryId;
        const subCategoryId = attrs.subCategoryId;
        const taxonomy = profile?.taxonomy?.categories ?? {};
        if (categoryId && subCategoryId) {
            const category = taxonomy[categoryId];
            const subCategory = category?.subcategories?.[subCategoryId];
            if (subCategory?.colorRoute)
                return subCategory.colorRoute;
        }
        if (categoryId) {
            const category = taxonomy[categoryId];
            if (category?.colorRoute)
                return category.colorRoute;
        }
        return routeConfigDefault?.color ?? null;
    },
    resolveRouteStyle(route, activeProfile, routeConfigDefault, defaultStyle) {
        const finalStyle = Object.assign({}, defaultStyle ?? {});
        if (routeConfigDefault && typeof routeConfigDefault === "object") {
            Object.assign(finalStyle, routeConfigDefault);
        }
        const taxonomyColor = this.getRouteColor(route, activeProfile, routeConfigDefault);
        if (taxonomyColor) {
            finalStyle.color = taxonomyColor;
        }
        if (route.properties && typeof route.properties === "object") {
            _applyRoutePropertyStyle(finalStyle, route.properties);
        }
        return finalStyle;
    },
    resolveEndpointConfig(route, profileEndpoints, moduleOptions) {
        const opt = moduleOptions ?? {};
        const baseStart = opt.startWaypointStyle ??
            opt.waypointStyle ?? {
            radius: 6,
            color: "#ffffff",
            fillColor: "#2b7cff",
            fillOpacity: 1,
            weight: 2,
        };
        const baseEnd = opt.endWaypointStyle ??
            opt.waypointStyle ?? {
            radius: 6,
            color: "#ffffff",
            fillColor: "#ff7b32",
            fillOpacity: 1,
            weight: 2,
        };
        const cfg = {
            showStart: typeof opt.showStart === "boolean" ? opt.showStart : true,
            showEnd: typeof opt.showEnd === "boolean" ? opt.showEnd : true,
            startStyle: Object.assign({}, baseStart),
            endStyle: Object.assign({}, baseEnd),
        };
        _applyEndpointOverrides(cfg, profileEndpoints);
        _applyEndpointOverrides(cfg, route?.properties);
        return cfg;
    },
};

/** GeoLeaf Route API */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
const _g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
function _getActiveProfile(g) {
    if (!g.GeoLeaf)
        return null;
    if (!g.GeoLeaf.Config)
        return null;
    if (!g.GeoLeaf.Config.getActiveProfile)
        return null;
    return g.GeoLeaf.Config.getActiveProfile();
}
function _loadProfileConfig(g) {
    let routeConfigDefault = null;
    let profileEndpoints = null;
    try {
        if (!g.GeoLeaf)
            return { routeConfigDefault, profileEndpoints };
        if (!g.GeoLeaf.Config)
            return { routeConfigDefault, profileEndpoints };
        if (!g.GeoLeaf.Config.getActiveProfile)
            return { routeConfigDefault, profileEndpoints };
        const activeProfile = g.GeoLeaf.Config.getActiveProfile();
        const defaultSettings = activeProfile?.defaultSettings;
        if (defaultSettings?.routeConfig?.default &&
            typeof defaultSettings.routeConfig.default === "object") {
            routeConfigDefault = defaultSettings.routeConfig.default;
        }
        if (defaultSettings?.routeConfig?.endpoints &&
            typeof defaultSettings.routeConfig.endpoints === "object") {
            profileEndpoints = defaultSettings.routeConfig.endpoints;
        }
    }
    catch (e) {
        Log.warn("[GeoLeaf.Route] Impossible de lire la config/endpoints depuis le profile actif.", e);
    }
    return { routeConfigDefault, profileEndpoints };
}
function _validateMaxZoomOnFit(opts) {
    if (opts.maxZoomOnFit === undefined)
        return;
    if (typeof opts.maxZoomOnFit === "number" && opts.maxZoomOnFit >= 1 && opts.maxZoomOnFit <= 20)
        return;
    Log.warn("[GeoLeaf.Route] options.maxZoomOnFit must be between 1 and 20.");
    opts.maxZoomOnFit = 14;
}
function _addMapLibreEndpoints(coords, routeId, endpointCfg, adapter, layerIds) {
    if (!endpointCfg.showStart && !endpointCfg.showEnd)
        return;
    const features = [];
    if (endpointCfg.showStart && coords[0]) {
        features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [coords[0][1], coords[0][0]] },
            properties: { role: "start", routeId },
        });
    }
    if (endpointCfg.showEnd && coords.length > 1) {
        const last = coords.at(-1);
        features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [last[1], last[0]] },
            properties: { role: "end", routeId },
        });
    }
    if (features.length === 0)
        return;
    const id = "route-" + routeId + "-endpoints";
    adapter.addGeoJSONLayer(id, { type: "FeatureCollection", features }, {
        fillColor: endpointCfg.startStyle?.fillColor || "#42A5F5",
        color: endpointCfg.startStyle?.color || "#0D47A1",
        weight: endpointCfg.startStyle?.weight || 2,
    });
    layerIds.push(id);
}
function _loadMapLibreRoute(self, route, activeProfile, routeConfigDefault, defaultStyle, profileEndpoints, adapter) {
    const coords = self._extractCoordsFromRouteItem(route);
    if (!coords.length)
        return;
    const routeId = route.id || "route-" + Math.random().toString(36).slice(2, 8);
    const routeStyle = self._resolveRouteStyle(route, activeProfile, routeConfigDefault, defaultStyle);
    const lineGeoJSON = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: coords.map(([lat, lng]) => [lng, lat]),
        },
        properties: { id: routeId, label: route.label || route.name || "" },
    };
    const layerId = "route-" + routeId;
    adapter.addGeoJSONLayer(layerId, lineGeoJSON, {
        color: routeStyle.color,
        weight: routeStyle.weight,
        opacity: routeStyle.opacity,
        dashArray: routeStyle.dashArray,
    });
    self._routeLayerIds.push(layerId);
    const endpointCfg = self._resolveEndpointConfig(route, profileEndpoints, self._options);
    _addMapLibreEndpoints(coords, routeId, endpointCfg, adapter, self._routeLayerIds);
}
function _mergeRouteOptions(self, options, g) {
    if (g.GeoLeaf && g.GeoLeaf.Utils && g.GeoLeaf.Utils.mergeOptions) {
        self._options = g.GeoLeaf.Utils.mergeOptions(self._options, options);
        return;
    }
    const merged = Object.assign({}, self._options, options);
    if (self._options.lineStyle && options.lineStyle && typeof options.lineStyle === "object") {
        merged.lineStyle = Object.assign({}, self._options.lineStyle, options.lineStyle);
    }
    self._options = merged;
}
const RouteModule = {
    _map: null,
    _layerGroup: null,
    _routeLayer: null,
    _initialized: false,
    _visible: true,
    /** IMapAdapter reference. */
    _adapter: null,
    /** MapLibre route layer IDs for cleanup. */
    _routeLayerIds: [],
    _options: {
        lineStyle: {
            color: "#1E88E5",
            weight: 4,
            opacity: 0.9,
            interactive: false,
        },
        waypointStyle: {
            radius: 5,
            color: "#0D47A1",
            fillColor: "#42A5F5",
            fillOpacity: 0.9,
            weight: 2,
        },
        showStart: true,
        showEnd: true,
        startWaypointStyle: null,
        endWaypointStyle: null,
        fitBoundsOnLoad: true,
        maxZoomOnFit: 14,
    },
    _validateOptions(options) {
        const opts = options ?? {};
        if (opts.map &&
            typeof opts.map.getNativeMap !== "function" &&
            typeof opts.map.addLayer !== "function") {
            Log.warn("[GeoLeaf.Route] options.map does not appear to be a valid map or adapter instance.");
        }
        if (opts.lineStyle && typeof opts.lineStyle !== "object") {
            Log.warn("[GeoLeaf.Route] options.lineStyle must be an object.");
            delete opts.lineStyle;
        }
        if (opts.waypointStyle && typeof opts.waypointStyle !== "object") {
            Log.warn("[GeoLeaf.Route] options.waypointStyle must be an object.");
            delete opts.waypointStyle;
        }
        _validateMaxZoomOnFit(opts);
        return opts;
    },
    getLayer() {
        return this._layerGroup ?? null;
    },
    init(options = {}) {
        options = this._validateOptions(options);
        const g = _g;
        // ── MapLibre detection (Sprint 5) ─────────────────────────────────
        const adapter = g.GeoLeaf?.Core?.getAdapter?.();
        const nativeMap = adapter?.getNativeMap?.();
        const isMapLibre = nativeMap && typeof nativeMap.addSource === "function";
        if (isMapLibre) {
            this._adapter = adapter;
            this._map = nativeMap;
            this._routeLayerIds = [];
            _mergeRouteOptions(this, options, g);
            this._initialized = true;
            this._visible = true;
            Log.info("[GeoLeaf.Route] Initialized (MapLibre mode).");
            return null;
        }
        Log.error("[GeoLeaf.Route] MapLibre adapter not found.");
        return null;
    },
    isInitialized() {
        return this._initialized === true && !!this._map && !!(this._layerGroup || this._adapter);
    },
    isVisible() {
        return this._visible === true;
    },
    show() {
        if (!this._adapter)
            return;
        for (const id of this._routeLayerIds)
            this._adapter.showLayer(id);
        this._visible = true;
    },
    hide() {
        if (!this._adapter)
            return;
        for (const id of this._routeLayerIds)
            this._adapter.hideLayer(id);
        this._visible = false;
    },
    toggleVisibility() {
        if (!this.isInitialized()) {
            Log.warn("[GeoLeaf.Route] toggleVisibility() called without init().");
            return;
        }
        if (this.isVisible())
            this.hide();
        else
            this.show();
    },
    clear() {
        if (!this._adapter)
            return;
        for (const id of this._routeLayerIds) {
            this._adapter.removeLayer(id);
        }
        this._routeLayerIds = [];
        this._routeLayer = null;
    },
    loadGPX(url) {
        if (!url) {
            Log.warn("[GeoLeaf.Route] URL GPX manquante.");
            return Promise.resolve();
        }
        const g = _g;
        const FetchHelper = g.GeoLeaf?.Utils?.FetchHelper;
        if (FetchHelper) {
            return FetchHelper.fetch(url, { timeout: 15000, retries: 2, parseResponse: false })
                .then((response) => response.text())
                .then((xmlText) => new DOMParser().parseFromString(xmlText, "application/xml"))
                .then((gpx) => {
                const coords = Array.from(gpx.getElementsByTagName("trkpt")).map((pt) => [
                    parseFloat(pt.getAttribute("lat") || "0"),
                    parseFloat(pt.getAttribute("lon") || "0"),
                ]);
                this._applyRoute(coords);
            })
                .catch((err) => {
                Log.error("[GeoLeaf.Route] Erreur GPX :", err);
            });
        }
        return fetch(url)
            .then((res) => res.text())
            .then((xmlText) => new DOMParser().parseFromString(xmlText, "application/xml"))
            .then((gpx) => {
            const coords = Array.from(gpx.getElementsByTagName("trkpt")).map((pt) => [
                parseFloat(pt.getAttribute("lat") || "0"),
                parseFloat(pt.getAttribute("lon") || "0"),
            ]);
            this._applyRoute(coords);
        })
            .catch((err) => Log.error("[GeoLeaf.Route] Erreur GPX :", err));
    },
    loadGeoJSON(geojson) {
        RouteLoaders.loadGeoJSON(geojson, this._applyRoute.bind(this));
    },
    _loadFromConfigMapLibre(routes) {
        const defaultStyle = (this._options.lineStyle ?? {});
        const g = _g;
        const activeProfile = _getActiveProfile(g);
        const { routeConfigDefault, profileEndpoints } = _loadProfileConfig(g);
        for (const route of routes) {
            if (!route || typeof route !== "object")
                continue;
            _loadMapLibreRoute(this, route, activeProfile, routeConfigDefault, defaultStyle, profileEndpoints, this._adapter);
        }
        Log.info(`[GeoLeaf.Route] MapLibre: ${this._routeLayerIds.length} route layer(s) created.`);
    },
    loadFromConfig(routes) {
        if (!this.isInitialized()) {
            Log.warn("[GeoLeaf.Route] loadFromConfig() called while the module is not initialized.");
            return;
        }
        if (!Array.isArray(routes) || routes.length === 0) {
            this.clear();
            Log.info("[GeoLeaf.Route] No routes in cfg.routes; layer cleared.");
            return;
        }
        this.clear();
        if (this._adapter) {
            this._loadFromConfigMapLibre(routes);
        }
    },
    filterVisibility(filteredRoutes) {
        if (!this._initialized) {
            Log.warn("[GeoLeaf.Route] Module not initialized - filterVisibility ignored.");
            return;
        }
        if (!Array.isArray(filteredRoutes)) {
            Log.warn("[GeoLeaf.Route] filterVisibility: filteredRoutes must be an array.");
            return;
        }
        const visibleRouteIds = new Set(filteredRoutes.map((r) => r.id));
        if (!this._adapter)
            return;
        for (const layerId of this._routeLayerIds) {
            const routeId = layerId.replace(/^route-/, "").replace(/-endpoints$/, "");
            if (visibleRouteIds.has(routeId)) {
                this._adapter.showLayer(layerId);
            }
            else {
                this._adapter.hideLayer(layerId);
            }
        }
        Log.info("[GeoLeaf.Route] Filtered visibility: " + filteredRoutes.length + " visible routes.");
    },
    _extractCoordsFromRouteItem(route) {
        return RouteLoaders.extractCoordsFromRouteItem(route);
    },
    _resolveRouteStyle(route, activeProfile, routeConfigDefault, defaultStyle) {
        return RouteStyleResolver.resolveRouteStyle(route, activeProfile, routeConfigDefault, defaultStyle);
    },
    _resolveEndpointConfig(route, profileEndpoints, moduleOptions) {
        return RouteStyleResolver.resolveEndpointConfig(route, profileEndpoints, moduleOptions);
    },
    addWaypoint(latlng) {
        RouteLayerManager.addWaypoint(this._layerGroup, latlng, (this._options.waypointStyle ?? {}));
    },
    addSegment(coords) {
        if (!this._routeLayer)
            return;
        const layer = this._routeLayer;
        const current = layer.getLatLngs?.() ?? [];
        layer.setLatLngs?.([...current, ...coords]);
    },
    _applyRoute(coords) {
        const context = {
            map: this._map,
            layerGroup: this._layerGroup,
            routeLayer: this._routeLayer,
            options: this._options,
        };
        RouteLayerManager.applyRoute(context, coords, () => {
            this.clear();
            // After clear(), this._routeLayer is a fresh polyline added to the layerGroup.
            // Propagate it into context so applyRoute sets coords on the correct (new) layer
            // rather than the stale pre-clear() reference.
            context.routeLayer = this._routeLayer;
        }, this._fireRouteLoadedEvents.bind(this));
        this._routeLayer = context.routeLayer ?? this._routeLayer;
    },
    _addRouteTooltip(polyline, route) {
        RoutePopupBuilder.addRouteTooltip(polyline, route);
    },
    _addRoutePopup(polyline, route) {
        RoutePopupBuilder.addRoutePopup(polyline, route, this);
    },
    _buildRoutePopupContent(route) {
        return RoutePopupBuilder.buildRoutePopupContent(route);
    },
    _openRouteSidePanel(route) {
        RoutePopupBuilder.openRouteSidePanel(route);
    },
    _fireRouteLoadedEvents(coords) {
        RouteLayerManager.fireRouteLoadedEvents(this._map, this._routeLayer, coords);
    },
};
const Route = RouteModule;

export { Route as R, RouteLayerManager as a, RouteLoaders as b, RoutePopupBuilder as c, RouteStyleResolver as d };
//# sourceMappingURL=geoleaf-chunk-route-CYSX4YcA.js.map
