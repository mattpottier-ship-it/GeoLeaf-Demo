import { o as domCreate, L as Log, C as Core, k as isScaleInRange, j as calculateMapScale, p as getLabel } from './geoleaf-chunk-core-utils-DaOLFnYl.js';
import { G as GeoJSONCore } from './geoleaf-chunk-geojson-C3dRY-lH.js';

/**
 * GeoLeaf UI Components - Common shared module
 * Reusable UI components for Legend and LayerManager
 *
 * Extrait le code commun entre:
 * - legend-renderer.js
 * - layer-manager/renderer.js
 *
 * DEPENDENCIES:
 * - native DOM events
 * - Log (import ESM)
 *
 * EXPOSE:
 * - _UIComponents
 *
 * @module ui/components
 */
/**
 * Module UI Components
 * @namespace _UIComponents
 * @private
 */
function _appendCircleIconSvg(circleEl, iconId, size, iconColor) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.style.width = size * 0.85 + "px";
    svg.style.height = size * 0.85 + "px";
    svg.style.fill = iconColor || "currentColor";
    svg.style.stroke = iconColor || "currentColor";
    svg.style.color = "#ffffff";
    svg.style.pointerEvents = "none";
    svg.style.position = "absolute";
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + iconId);
    svg.appendChild(use);
    circleEl.appendChild(svg);
    if (Log) {
        const spriteExists = document.querySelector('svg[data-geoleaf-sprite="profile"]');
        if (!spriteExists) {
            svg.setAttribute("data-sprite-missing", "true");
            Log.warn("[UIComponents] Icon", "#" + iconId, "referenced but sprite not found in DOM");
        }
        else if (!spriteExists.querySelector("#" + iconId)) {
            svg.setAttribute("data-symbol-missing", "#" + iconId);
            Log.warn("[UIComponents] Symbol", "#" + iconId, "not found in SVG sprite");
        }
    }
}
function _buildLineSvgEl(config, width, color, dashArray, outlineColor, outlineWidth) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 40 8");
    svg.style.width = "40px";
    const totalHeight = Math.max(width, 3) + (outlineWidth || 0) + 4;
    svg.style.height = totalHeight + "px";
    if (outlineColor && outlineWidth) {
        const outlineLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        outlineLine.setAttribute("x1", "0");
        outlineLine.setAttribute("y1", "4");
        outlineLine.setAttribute("x2", "40");
        outlineLine.setAttribute("y2", "4");
        outlineLine.setAttribute("stroke", outlineColor);
        outlineLine.setAttribute("stroke-width", width + outlineWidth * 2);
        outlineLine.setAttribute("stroke-linecap", "round");
        if (config.outlineOpacity !== undefined)
            outlineLine.setAttribute("stroke-opacity", config.outlineOpacity);
        svg.appendChild(outlineLine);
    }
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "4");
    line.setAttribute("x2", "40");
    line.setAttribute("y2", "4");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", width);
    line.setAttribute("stroke-linecap", "round");
    if (dashArray)
        line.setAttribute("stroke-dasharray", dashArray);
    else if (config.style === "dashed")
        line.setAttribute("stroke-dasharray", "8,4");
    else if (config.style === "dotted")
        line.setAttribute("stroke-dasharray", "2,3");
    if (config.opacity !== undefined)
        line.setAttribute("stroke-opacity", config.opacity);
    svg.appendChild(line);
    return svg;
}
function _resolveHatchStyle(hatchCfg) {
    const stroke = hatchCfg.stroke || {};
    return {
        color: stroke.color || "#000000",
        opacity: stroke.opacity !== undefined ? stroke.opacity : 1,
        widthPx: stroke.widthPx || 1,
    };
}
function _buildLegendHatchDefs(svg, config) {
    const hatchCfg = config.hatch;
    const type = hatchCfg.type || "diagonal";
    const spacing = hatchCfg.spacingPx || 10;
    const { color: hatchColor, opacity: hatchOpacity, widthPx: hatchWidth, } = _resolveHatchStyle(hatchCfg);
    const patternId = "hatch-legend-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", patternId);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", spacing);
    pattern.setAttribute("height", spacing);
    const ns = "http://www.w3.org/2000/svg";
    const mkLine = (x1, y1, x2, y2) => {
        const l = document.createElementNS(ns, "line");
        l.setAttribute("x1", x1);
        l.setAttribute("y1", y1);
        l.setAttribute("x2", x2);
        l.setAttribute("y2", y2);
        l.setAttribute("stroke", hatchColor);
        l.setAttribute("stroke-width", String(hatchWidth));
        l.setAttribute("stroke-opacity", hatchOpacity);
        return l;
    };
    if (type === "diagonal")
        pattern.appendChild(mkLine("0", "0", spacing, spacing));
    else if (type === "dot") {
        const c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", String(spacing / 2));
        c.setAttribute("cy", String(spacing / 2));
        c.setAttribute("r", String(Math.max(0.3, spacing * 0.07)));
        c.setAttribute("fill", hatchColor);
        c.setAttribute("fill-opacity", hatchOpacity);
        pattern.appendChild(c);
    }
    else if (type === "cross") {
        pattern.appendChild(mkLine("0", spacing / 2, spacing, spacing / 2));
        pattern.appendChild(mkLine(spacing / 2, "0", spacing / 2, spacing));
    }
    else if (type === "x") {
        pattern.appendChild(mkLine("0", "0", spacing, spacing));
        pattern.appendChild(mkLine(spacing, "0", "0", spacing));
    }
    defs.appendChild(pattern);
    svg.appendChild(defs);
    return patternId;
}
function _applyCircleIcon(circleEl, config, size) {
    const iconId = config.icon.startsWith("#") ? config.icon.substring(1) : config.icon;
    if (!/^[a-zA-Z0-9_-]+$/.test(iconId)) {
        if (Log)
            Log.error("[UIComponents] ID d'ic\u00f4ne invalide (caract\u00e8res non autoris\u00e9s):", config.icon);
        return;
    }
    _appendCircleIconSvg(circleEl, iconId, size, config.iconColor);
}
function _needsLineSvg(dashArray, width, outlineColor, outlineWidth) {
    return !!(dashArray || width > 5 || (outlineColor && outlineWidth));
}
function _applyLineDivStyle(lineEl, color, style) {
    if (style === "dashed") {
        lineEl.style.backgroundImage = `linear-gradient(to right, ${color} 50%, transparent 50%)`;
        lineEl.style.backgroundSize = "8px 100%";
    }
    else if (style === "dotted") {
        lineEl.style.backgroundImage = `linear-gradient(to right, ${color} 30%, transparent 30%)`;
        lineEl.style.backgroundSize = "4px 100%";
    }
}
function _resolvePolygonColors(config) {
    return {
        color: config.fillColor || config.color || "#3388ff",
        borderColor: config.borderColor || config.color || "#333",
    };
}
function _resolveFillOpacity(config) {
    if (config.fillOpacity !== undefined)
        return config.fillOpacity;
    if (config.opacity !== undefined)
        return config.opacity;
    return 1;
}
function _buildPolygonSvgEl(config, borderColor, borderWidth, fillOpacity, hasHatch) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 32 24");
    svg.style.width = "32px";
    svg.style.height = "24px";
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "1");
    rect.setAttribute("y", "1");
    rect.setAttribute("width", "30");
    rect.setAttribute("height", "22");
    rect.setAttribute("stroke", borderColor);
    rect.setAttribute("stroke-width", String(borderWidth));
    if (hasHatch) {
        const patternId = _buildLegendHatchDefs(svg, config);
        rect.setAttribute("fill", `url(#${patternId})`);
        if (fillOpacity !== 1)
            rect.setAttribute("fill-opacity", String(fillOpacity));
    }
    else {
        rect.setAttribute("fill", "none");
        if (config.dashArray)
            rect.setAttribute("stroke-dasharray", config.dashArray);
    }
    svg.appendChild(rect);
    return svg;
}
function _renderIconSymbol(container, symbolConfig, renderCircleFn) {
    if (symbolConfig.iconUrl) {
        const imgEl = domCreate("img", "gl-legend__icon-img", container);
        imgEl.src = symbolConfig.iconUrl;
        if (symbolConfig.size) {
            imgEl.style.width = symbolConfig.size + "px";
            imgEl.style.height = symbolConfig.size + "px";
        }
        return imgEl;
    }
    return renderCircleFn(container, symbolConfig);
}
const _UIComponents = {
    /**
     * Creates an accordion
     * @param {HTMLElement} container - Conteneur parent
     * @param {Object} config - Configuration of the accordion
     * @param {string} config.layerId - ID de the layer
     * @param {string} config.label - Title of the accordion
     * @param {boolean} config.collapsed - Initial state
     * @param {boolean} config.visible - Couche visible ou non (pour grisage)
     * @param {Function} [config.onToggle] - Callback during the toggle
     * @returns {Object} - { accordionEl, headerEl, bodyEl }
     */
    createAccordion(container, config) {
        const accordionEl = domCreate("div", "gl-legend__accordion", container);
        accordionEl.setAttribute("data-layer-id", config.layerId);
        if (config.collapsed) {
            accordionEl.classList.add("gl-legend__accordion--collapsed");
        }
        // Addsr class inactive si the layer n'est pas visible
        if (config.visible === false) {
            accordionEl.classList.add("gl-legend__accordion--inactive");
        }
        // A1+A2+A3: single semantic <button> — native keyboard, no nesting violation
        const headerEl = domCreate("button", "gl-legend__accordion-header", accordionEl);
        headerEl.type = "button";
        headerEl.setAttribute("aria-expanded", config.collapsed ? "false" : "true");
        const titleEl = domCreate("span", "gl-legend__accordion-title", headerEl);
        titleEl.textContent = config.label;
        // Icon span excluded from accessibility tree (replaces nested <button>)
        // Arrow rotation handled by CSS (.gl-legend__accordion--collapsed / :not(--collapsed))
        const toggleEl = domCreate("span", "gl-legend__accordion-icon", headerEl);
        toggleEl.setAttribute("aria-hidden", "true");
        toggleEl.textContent = "\u25b6";
        // Body of the accordion
        const bodyEl = domCreate("div", "gl-legend__accordion-body", accordionEl);
        // Manager for click sur le header
        const onToggle = (ev) => {
            // Ne rien faire si the layer est inactive
            if (config.visible === false) {
                ev.stopPropagation();
                ev.preventDefault();
                return;
            }
            ev.stopPropagation();
            ev.preventDefault();
            const isCollapsed = accordionEl.classList.toggle("gl-legend__accordion--collapsed");
            headerEl.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
            // Callback optional
            if (typeof config.onToggle === "function") {
                config.onToggle(config.layerId, !isCollapsed);
            }
        };
        this.attachEventHandler(headerEl, "click", onToggle);
        return { accordionEl, headerEl, bodyEl, toggleEl };
    },
    /**
     * Rend un symbole circle (POI/Marker)
     * @param {HTMLElement} container - Conteneur du symbole
     * @param {Object} config - Configuration du symbole
     * @returns {HTMLElement} - Created element
     */
    renderCircleSymbol(container, config) {
        const radius = config.radius !== undefined ? config.radius : 24;
        const size = radius * 2;
        const fillColor = config.fillColor || config.color || "#3388ff";
        const strokeColor = config.color || config.borderColor || "rgba(0,0,0,0.2)";
        const strokeWidth = config.weight || 1;
        const circleEl = domCreate("div", "gl-legend__circle", container);
        circleEl.style.width = size + "px";
        circleEl.style.height = size + "px";
        circleEl.style.backgroundColor = fillColor;
        circleEl.style.borderRadius = "50%";
        circleEl.style.border = strokeWidth + "px solid " + strokeColor;
        circleEl.style.position = "relative";
        circleEl.style.display = "flex";
        circleEl.style.alignItems = "center";
        circleEl.style.justifyContent = "center";
        if (config.fillOpacity !== undefined)
            circleEl.style.opacity = config.fillOpacity;
        if (config.icon)
            _applyCircleIcon(circleEl, config, size);
        return circleEl;
    },
    /**
     * Rend un symbole line
     * @param {HTMLElement} container - Conteneur du symbole
     * @param {Object} config - Configuration du symbole
     * @returns {HTMLElement} - Created element
     */
    renderLineSymbol(container, config) {
        const width = config.width || 3;
        const color = config.color || "#3388ff";
        const style = config.style || "solid";
        const dashArray = config.dashArray || null;
        const outlineColor = config.outlineColor || null;
        const outlineWidth = config.outlineWidth || null;
        if (_needsLineSvg(dashArray, width, outlineColor, outlineWidth)) {
            const svg = _buildLineSvgEl(config, width, color, dashArray, outlineColor, outlineWidth);
            container.appendChild(svg);
            return svg;
        }
        const lineEl = domCreate("div", "gl-legend__line", container);
        lineEl.style.width = "30px";
        lineEl.style.height = width + "px";
        lineEl.style.backgroundColor = color;
        _applyLineDivStyle(lineEl, color, style);
        if (config.opacity !== undefined)
            lineEl.style.opacity = config.opacity;
        return lineEl;
    },
    /**
     * Rend un symbole polygon/fill
     * @param {HTMLElement} container - Conteneur du symbole
     * @param {Object} config - Configuration du symbole
     * @returns {HTMLElement} - Created element
     */
    renderPolygonSymbol(container, config) {
        const { color, borderColor } = _resolvePolygonColors(config);
        const borderWidth = config.weight || 1;
        const hasHatch = config.hatch && config.hatch.enabled;
        let fillOpacity = _resolveFillOpacity(config);
        if (hasHatch && config.hatch.renderMode === "pattern_only")
            fillOpacity = 1.0;
        if (hasHatch || fillOpacity === 0) {
            const svg = _buildPolygonSvgEl(config, borderColor, borderWidth, fillOpacity, hasHatch);
            container.appendChild(svg);
            return svg;
        }
        const polygonEl = domCreate("div", "gl-legend__polygon", container);
        polygonEl.style.width = "24px";
        polygonEl.style.height = "16px";
        polygonEl.style.backgroundColor = color;
        polygonEl.style.border = borderWidth + "px solid " + borderColor;
        if (fillOpacity !== 1)
            polygonEl.style.opacity = String(fillOpacity);
        return polygonEl;
    },
    /**
     * Renders a star symbol (rating)
     * @param {HTMLElement} container - Conteneur du symbole
     * @param {Object} config - Configuration du symbole
     * @returns {HTMLElement} - Created element
     */
    renderStarSymbol(container, config) {
        const starContainer = domCreate("div", "gl-legend__stars", container);
        const count = config.count || 5;
        const color = config.color || "#f1c40f";
        const size = config.size || 12;
        for (let i = 0; i < count; i++) {
            const starEl = domCreate("span", "gl-legend__star", starContainer);
            starEl.textContent = "★";
            starEl.style.color = color;
            starEl.style.fontSize = size + "px";
        }
        return starContainer;
    },
    /**
     * Rend un symbole selon son type
     * @param {HTMLElement} container - Conteneur du symbole
     * @param {Object} config - Configuration du symbole
     * @returns {HTMLElement} - Created element
     */
    renderSymbol(container, config) {
        // Support de la structure avec config.symbol ou directly config
        const symbolConfig = config.symbol || config;
        const symbolType = symbolConfig.type || config.type || "circle";
        const circleFn = (c, cfg) => this.renderCircleSymbol(c, cfg);
        const renderers = {
            marker: () => this.renderCircleSymbol(container, symbolConfig),
            circle: () => this.renderCircleSymbol(container, symbolConfig),
            line: () => this.renderLineSymbol(container, symbolConfig),
            polygon: () => this.renderPolygonSymbol(container, symbolConfig),
            fill: () => this.renderPolygonSymbol(container, symbolConfig),
            star: () => this.renderStarSymbol(container, symbolConfig),
            icon: () => _renderIconSymbol(container, symbolConfig, circleFn),
        };
        return (renderers[symbolType] ?? (() => this.renderCircleSymbol(container, symbolConfig)))();
    },
    /**
     * Creates a toggle button (checkbox/switch)
     * @param {HTMLElement} container - Conteneur parent
     * @param {Object} config - Configuration du toggle
     * @param {string} [config.id] - ID du toggle
     * @param {boolean} config.isActive - Initial state (alias: active)
     * @param {string} [config.className] - Custom CSS class
     * @param {string} [config.label] - Label du toggle
     * @param {string} [config.title] - Tooltip
     * @param {Function} [config.onToggle] - Callback during the toggle
     * @returns {HTMLElement} - Created button element
     */
    createToggleButton(container, config) {
        // Support isActive ou active
        const isActive = config.isActive !== undefined ? config.isActive : config.active;
        const className = config.className || "gl-toggle-btn";
        const toggleBtn = domCreate("button", className, container);
        toggleBtn.type = "button";
        if (config.id) {
            toggleBtn.setAttribute("data-toggle-id", config.id);
        }
        toggleBtn.setAttribute("aria-pressed", isActive ? "true" : "false");
        if (config.title) {
            toggleBtn.title = config.title;
        }
        if (isActive) {
            toggleBtn.classList.add(className + "--on");
        }
        if (config.label) {
            toggleBtn.textContent = config.label;
        }
        // Attacher le manager
        if (typeof config.onToggle === "function") {
            const className = config.className || "gl-toggle-btn";
            const onToggle = (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                const isActive = toggleBtn.classList.toggle(className + "--on");
                toggleBtn.setAttribute("aria-pressed", isActive ? "true" : "false");
                config.onToggle(config.id, isActive, ev);
            };
            this.attachEventHandler(toggleBtn, "click", onToggle);
        }
        return toggleBtn;
    },
    /**
     * Attaches a native DOM event handler and blocks map propagation for clicks.
     * @param {HTMLElement} element - Target element
     * @param {string} eventName - Name of the event
     * @param {Function} handler - Manager
     */
    attachEventHandler(element, eventName, handler) {
        element.addEventListener(eventName, handler);
        if (eventName === "click") {
            // Prevent click from propagating to the map (bubbling phase, non-blocking)
            element.addEventListener("click", (e) => e.stopPropagation());
        }
    },
};

/**
 * Module Label Renderer pour GeoLeaf
 * Creates et manages les tooltips permanents for thes labels
 * @private GeoLeaf._LabelRenderer
 */
function _resolvePositionFromBounds(featureLayer) {
    const bounds = featureLayer.getBounds();
    if (!bounds)
        return null;
    if (typeof bounds.getCenter !== "function")
        return null;
    return bounds.getCenter();
}
function _resolvePositionFromLatLngs(featureLayer) {
    const latlngs = featureLayer.getLatLngs();
    if (!latlngs || latlngs.length === 0)
        return null;
    const flatLatlngs = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
    if (!flatLatlngs || flatLatlngs.length === 0)
        return null;
    const middleIndex = Math.floor(flatLatlngs.length / 2);
    return flatLatlngs[middleIndex];
}
function _resolveFeaturePosition(featureLayer) {
    if (typeof featureLayer.getLatLng === "function")
        return featureLayer.getLatLng();
    if (typeof featureLayer.getBounds === "function")
        return _resolvePositionFromBounds(featureLayer);
    if (typeof featureLayer.getLatLngs === "function")
        return _resolvePositionFromLatLngs(featureLayer);
    return null;
}
function _extractLatLng(position) {
    const lat = typeof position.lat === "function" ? position.lat() : position.lat;
    const lng = typeof position.lng === "function" ? position.lng() : position.lng;
    return { lat, lng };
}
function _buildFeatureId(feature) {
    if (feature.id)
        return String(feature.id);
    if (feature.properties && feature.properties.id)
        return String(feature.properties.id);
    return `feature_${Date.now()}_${Math.random()}`;
}
function _applyFontStyles(element, font) {
    if (!font)
        return;
    if (font.family)
        element.style.setProperty("font-family", `"${font.family}", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`, "important");
    if (font.sizePt)
        element.style.setProperty("font-size", `${font.sizePt}pt`, "important");
    if (font.bold) {
        element.style.setProperty("font-weight", "bold", "important");
    }
    else if (font.weight) {
        element.style.setProperty("font-weight", String(font.weight < 400 ? 500 : font.weight), "important");
    }
    if (font.italic)
        element.style.setProperty("font-style", "italic", "important");
}
function _buildBufferShadow(bufferColor, bufferOpacity, bufferSize, hexToRgba) {
    const rgba = hexToRgba(bufferColor, bufferOpacity);
    const shadowParts = [];
    for (let angle = 0; angle < 360; angle += 30) {
        const rad = (angle * Math.PI) / 180;
        shadowParts.push(`${(Math.cos(rad) * bufferSize).toFixed(2)}px ${(Math.sin(rad) * bufferSize).toFixed(2)}px 0 ${rgba}`);
    }
    for (let angle = 15; angle < 360; angle += 30) {
        const rad = (angle * Math.PI) / 180;
        shadowParts.push(`${(Math.cos(rad) * bufferSize * 0.7).toFixed(2)}px ${(Math.sin(rad) * bufferSize * 0.7).toFixed(2)}px 0 ${rgba}`);
    }
    shadowParts.push(`0 0 ${bufferSize * 0.8}px ${rgba}`, `0 0 ${bufferSize * 1.5}px ${rgba}`);
    return shadowParts.join(", ");
}
function _applyBufferStyle(element, buffer, hexToRgba) {
    if (!buffer.enabled)
        return;
    const bufferColor = buffer.color || "#ffffff";
    const bufferOpacity = buffer.opacity !== undefined ? buffer.opacity : 1;
    const bufferSize = buffer.sizePx || 2;
    const shadow = _buildBufferShadow(bufferColor, bufferOpacity, bufferSize, hexToRgba);
    element.style.setProperty("text-shadow", shadow, "important");
}
function _isValidLatLng(lat, lng) {
    if (!lat || !lng)
        return false;
    if (isNaN(lat))
        return false;
    if (isNaN(lng))
        return false;
    return true;
}
function _addLabelMarkerToMap(_L, lat, lng, htmlContent, className, feature, tooltipsMap) {
    const labelIcon = {
        html: htmlContent,
        className,
        iconSize: null,
        iconAnchor: [0, 0],
    };
    const mapAdapter = Core && Core.getMap ? Core.getMap() : null;
    const adapter = mapAdapter && typeof mapAdapter.createMarker === "function" ? mapAdapter : null;
    if (adapter) {
        const labelMarker = adapter.createMarker([lat, lng], {
            icon: labelIcon,
            interactive: false,
            keyboard: false,
        });
        tooltipsMap.set(_buildFeatureId(feature), labelMarker);
    }
    else {
        // Stub marker when no adapter is available
        const labelMarker = {
            _stub: true,
            latlng: [lat, lng],
            icon: labelIcon,
            options: { interactive: false, keyboard: false },
            addTo() {
                return this;
            },
        };
        const map = mapAdapter;
        if (map) {
            tooltipsMap.set(_buildFeatureId(feature), labelMarker);
        }
        else {
            if (Log)
                Log.warn("[LabelRenderer] Map not available for label addition");
        }
    }
}
/**
 * Reads the first usable `text-font` array from the map's loaded style.
 * This avoids 404s caused by CSS font names (e.g. "Lucida Sans") not existing
 * as PBF glyphs on the tile server, or by MapLibre's built-in spec default
 * ("Open Sans Regular, Arial Unicode MS Regular") which OpenFreeMap doesn't serve.
 */
function _resolveMapFontStack(nativeMap) {
    try {
        const mapStyle = nativeMap.getStyle?.();
        if (mapStyle?.layers) {
            for (const layer of mapStyle.layers) {
                if (layer.type !== "symbol")
                    continue;
                const fonts = layer.layout?.["text-font"];
                // Accept a plain string array (not a MapLibre expression)
                if (Array.isArray(fonts) && fonts.length > 0 && typeof fonts[0] === "string") {
                    return fonts;
                }
            }
        }
    }
    catch (_e) {
        // Ignore — fall through to safe default
    }
    // Safe fallback: Noto Sans is served by most self-hosted and cloud tile providers
    return ["Noto Sans Regular"];
}
const _LabelRenderer = {
    createTooltipsForLayer(layerId, layerGroup, labelConfig, style, tooltipsMap) {
        if (!layerGroup || !labelConfig || !labelConfig.labelId) {
            if (Log)
                Log.warn("[LabelRenderer] Invalid parameters for createTooltipsForLayer", {
                    layerId,
                    hasLayerGroup: !!layerGroup,
                    hasLabelConfig: !!labelConfig,
                    labelId: labelConfig?.labelId,
                });
            return;
        }
        const labelField = labelConfig.labelId;
        if (Log)
            Log.debug(`[LabelRenderer] Creating tooltips for ${layerId}, field: ${labelField}`);
        let featureCount = 0;
        layerGroup.eachLayer((featureLayer) => {
            featureCount++;
            try {
                this._createTooltipForFeature(featureLayer, labelField, style, tooltipsMap);
            }
            catch (err) {
                if (Log)
                    Log.warn("[LabelRenderer] Error creating tooltip:", err);
            }
        });
        if (Log)
            Log.debug(`[LabelRenderer] ${tooltipsMap.size} tooltips created for ${layerId} (${featureCount} features processed)`);
    },
    _createTooltipForFeature(featureLayer, labelField, style, tooltipsMap) {
        const feature = featureLayer.feature;
        if (!feature)
            return;
        if (!feature.properties)
            return;
        const labelValue = this._extractFieldValue(feature.properties, labelField);
        if (!labelValue)
            return;
        const position = _resolveFeaturePosition(featureLayer);
        if (!position) {
            if (Log)
                Log.debug("[LabelRenderer] Null position for feature, skipping label. Label:", labelValue);
            return;
        }
        const { lat, lng } = _extractLatLng(position);
        if (!_isValidLatLng(lat, lng))
            return;
        const htmlContent = this._formatLabelContent(labelValue, style);
        _addLabelMarkerToMap(null, lat, lng, htmlContent, this._buildClassName(style), feature, tooltipsMap);
    },
    _extractFieldValue(properties, fieldPath) {
        if (!properties || !fieldPath)
            return null;
        if (!fieldPath.includes("."))
            return properties[fieldPath];
        const parts = fieldPath.split(".");
        let value = properties;
        for (const part of parts) {
            if (value && typeof value === "object" && part in value)
                value = value[part];
            else
                return null;
        }
        return value;
    },
    _parseOffset(offset) {
        if (!offset)
            return [0, 0];
        if (Array.isArray(offset) && offset.length === 2) {
            return [
                typeof offset[0] === "number" ? offset[0] : 0,
                typeof offset[1] === "number" ? offset[1] : 0,
            ];
        }
        return [0, 0];
    },
    _buildClassName(style) {
        const classes = ["gl-label"];
        if (style?.className)
            classes.push(style.className);
        if (style?.variant)
            classes.push(`gl-label--${style.variant}`);
        return classes.join(" ");
    },
    _formatLabelContent(value, style) {
        if (!value)
            return "";
        let content = String(value);
        if (style?.prefix)
            content = style.prefix + content;
        if (style?.suffix)
            content = content + style.suffix;
        const div = globalThis.document.createElement("div");
        div.className = "gl-label__content";
        div.textContent = content;
        if (style)
            this._applyInlineStyles(div, style);
        return div.outerHTML;
    },
    _applyInlineStyles(element, style) {
        if (!element || !style)
            return;
        _applyFontStyles(element, style.font);
        if (style.color)
            element.style.setProperty("color", style.color, "important");
        if (style.opacity !== undefined)
            element.style.setProperty("opacity", String(style.opacity), "important");
        if (style.buffer)
            _applyBufferStyle(element, style.buffer, (hex, op) => this._hexToRgba(hex, op));
        if (style.textTransform)
            element.style.setProperty("text-transform", style.textTransform, "important");
    },
    /**
     * Creates a MapLibre native symbol layer for labels.
     * Used in MapLibre mode where there is no Leaflet layer to iterate.
     * The symbol layer is added on top of the existing GeoJSON source.
     * Cleanup is handled by storing a removal function in `tooltipsMap`.
     */
    createSymbolLayerForMapLibre(layerId, labelConfig, style, tooltipsMap) {
        if (!labelConfig.labelId) {
            if (Log)
                Log.warn("[LabelRenderer] No labelId for MapLibre symbol layer", layerId);
            return;
        }
        const mapAdapter = Core && Core.getMap ? Core.getMap() : null;
        if (!mapAdapter || typeof mapAdapter.getNativeMap !== "function") {
            if (Log)
                Log.warn("[LabelRenderer] MapLibre adapter unavailable for labels", layerId);
            return;
        }
        const nativeMap = mapAdapter.getNativeMap();
        const registry = mapAdapter.getLayerRegistry?.();
        const sourceId = registry?.getSourceId?.(layerId) ?? `gl-src-${layerId}`;
        if (!nativeMap.getSource(sourceId)) {
            if (Log)
                Log.warn("[LabelRenderer] MapLibre source not found:", sourceId);
            return;
        }
        const labelLayerId = `gl-${layerId}-label-text`;
        if (nativeMap.getLayer(labelLayerId)) {
            nativeMap.removeLayer(labelLayerId);
        }
        const textSize = style.font?.sizePt ? Math.round(style.font.sizePt * 1.33) : 12;
        // Resolve the font stack from the map's loaded style to avoid 404s.
        // CSS font names (e.g. "Lucida Sans") are not PBF glyphs — use whatever the
        // base style actually serves. Fall back to common OpenFreeMap/MapTiler names.
        const textFont = _resolveMapFontStack(nativeMap);
        const layout = {
            "text-field": ["get", labelConfig.labelId],
            "text-size": textSize,
            "text-allow-overlap": false,
            "text-ignore-placement": false,
            "text-font": textFont,
        };
        const paint = {
            "text-color": style.color ?? "#000000",
            "text-opacity": style.opacity ?? 1,
        };
        if (style.buffer?.enabled) {
            paint["text-halo-color"] = style.buffer.color ?? "#ffffff";
            paint["text-halo-width"] = style.buffer.sizePx ?? 2;
            paint["text-halo-blur"] = 0.5;
        }
        nativeMap.addLayer({
            id: labelLayerId,
            type: "symbol",
            source: sourceId,
            layout,
            paint,
        });
        // Store a removal function so _clearTooltips() can remove the symbol layer
        tooltipsMap.set(labelLayerId, {
            remove: () => {
                if (nativeMap.getLayer(labelLayerId))
                    nativeMap.removeLayer(labelLayerId);
            },
        });
        if (Log)
            Log.debug(`[LabelRenderer] MapLibre symbol layer created for ${layerId} (field: ${labelConfig.labelId})`);
    },
    _hexToRgba(hex, opacity) {
        if (!hex)
            return `rgba(0, 0, 0, ${opacity})`;
        hex = hex.replace("#", "");
        if (hex.length === 3)
            hex = hex
                .split("")
                .map((c) => c + c)
                .join("");
        const r = Number.parseInt(hex.substring(0, 2), 16);
        const g = Number.parseInt(hex.substring(2, 4), 16);
        const b = Number.parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
};

/**
 * Module Labels pour GeoLeaf
 * Gestion des labels flottantes sur les entities
 * @namespace Labels
 */
const ScaleUtils = { isScaleInRange: isScaleInRange, calculateMapScale: calculateMapScale };
const _state = {
    layers: new Map(),
    zoomListenerAttached: false,
};
function _getIntegratedLabel(layerData) {
    if (!layerData)
        return null;
    if (!layerData.currentStyle)
        return null;
    if (!layerData.currentStyle.label)
        return null;
    return layerData.currentStyle.label;
}
function _hasConfigLabel(labelConfig) {
    if (!labelConfig)
        return false;
    if (!labelConfig.enabled)
        return false;
    if (!labelConfig.labelId)
        return false;
    return true;
}
function _resolveLabelStyleConfig(layerData, labelConfig, _layerId) {
    const integratedLabel = _getIntegratedLabel(layerData);
    if (integratedLabel) {
        if (integratedLabel.enabled !== true)
            return "disabled";
        const result = Object.assign({}, integratedLabel);
        if (layerData.currentStyle && layerData.currentStyle.labelScale) {
            result.labelScale = layerData.currentStyle.labelScale;
        }
        return result;
    }
    if (_hasConfigLabel(labelConfig))
        return _buildLabelStyleFromConfig(labelConfig);
    return null;
}
function _buildLabelStyleFromConfig(labelConfig) {
    const cfg = labelConfig;
    const font = cfg.font
        ? cfg.font
        : { family: "Arial", sizePt: 10, weight: 50, bold: false, italic: false };
    const color = cfg.color ? cfg.color : "#000000";
    const opacity = cfg.opacity ? cfg.opacity : 1.0;
    const buffer = cfg.buffer ? cfg.buffer : { enabled: false };
    const background = cfg.background ? cfg.background : { enabled: false };
    const offset = cfg.offset ? cfg.offset : { distancePx: 0 };
    return { enabled: true, field: cfg.labelId, font, color, opacity, buffer, background, offset };
}
function _resolveLabelEffectiveShow(labelStyleConfig, showImmediately) {
    if (labelStyleConfig.visibleByDefault !== undefined)
        return labelStyleConfig.visibleByDefault;
    return showImmediately;
}
function _computeShouldShow(effectiveShowImmediately, layerData) {
    if (!layerData)
        return effectiveShowImmediately;
    if (!layerData._visibility)
        return effectiveShowImmediately;
    return effectiveShowImmediately && layerData._visibility.current === true;
}
async function _doEnableLabels(self, layerId, labelConfig, showImmediately) {
    const layerData = self._getLayerData(layerId);
    const labelStyleConfig = _resolveLabelStyleConfig(layerData, labelConfig);
    if (labelStyleConfig === "disabled") {
        if (Log)
            Log.debug("[Labels] Embedded labels disabled for", layerId);
        return;
    }
    if (!labelStyleConfig) {
        if (Log)
            Log.debug("[Labels] No label configured for", layerId);
        return;
    }
    const effectiveShowImmediately = _resolveLabelEffectiveShow(labelStyleConfig, showImmediately);
    _state.layers.set(layerId, {
        enabled: effectiveShowImmediately,
        config: labelConfig,
        labelStyle: labelStyleConfig,
        tooltips: new Map(),
    });
    const shouldShowLabels = _computeShouldShow(effectiveShowImmediately, layerData);
    if (shouldShowLabels)
        await self._createLabelsForLayer(layerId);
    self._ensureZoomListener();
    if (Log)
        Log.debug("[Labels] Label config prepared for", layerId);
}
function _getMap() {
    if (Core && Core.getMap)
        return Core.getMap();
    return null;
}
function _isLayerVisible(layerData) {
    if (!layerData)
        return false;
    if (!layerData._visibility)
        return false;
    return layerData._visibility.current === true;
}
function _isOutOfRange(self, map, config, labelStyle) {
    if (!map)
        return false;
    if (labelStyle.labelScale) {
        const { minScale, maxScale } = labelStyle.labelScale;
        if (minScale == null && maxScale == null)
            return false;
        const currentScale = self._calculateMapScale(map);
        return !self._isScaleInRange(currentScale, minScale, maxScale);
    }
    if (config.minZoom === undefined)
        return false;
    if (config.maxZoom === undefined)
        return false;
    const currentZoom = map.getZoom();
    if (currentZoom < config.minZoom)
        return true;
    if (currentZoom > config.maxZoom)
        return true;
    return false;
}
function _renderTooltipsForLayer(layerId, layerData, config, labelStyle, tooltips) {
    if (!_LabelRenderer) {
        if (Log)
            Log.error("[Labels] GeoLeaf._LabelRenderer not available!");
        return;
    }
    const labelConfig = {
        labelId: labelStyle.field || config.labelId,
        minZoom: config.minZoom,
        maxZoom: config.maxZoom,
    };
    // MapLibre path — native symbol layer on the GeoJSON source
    _LabelRenderer.createSymbolLayerForMapLibre(layerId, labelConfig, labelStyle, tooltips);
}
function _clearTooltips(tooltips) {
    tooltips.forEach((t) => {
        if (t && t.remove)
            t.remove();
    });
    tooltips.clear();
}
function _processZoomLayerItem(self, layerState, layerId, currentScale, detail, map) {
    if (!layerState.enabled)
        return;
    if (!_isLayerVisible(self._getLayerData(layerId))) {
        if (layerState.tooltips && layerState.tooltips.size)
            _clearTooltips(layerState.tooltips);
        return;
    }
    const { labelStyle, config } = layerState;
    const shouldShow = _resolveShouldShowForZoom(self, currentScale, detail, map, config, labelStyle);
    const isShowing = layerState.tooltips && layerState.tooltips.size > 0;
    if (shouldShow && !isShowing)
        self._createLabelsForLayer(layerId);
    else if (!shouldShow && isShowing)
        _clearTooltips(layerState.tooltips);
}
function _resolveShouldShowForZoom(self, currentScale, detail, map, config, labelStyle) {
    if (labelStyle.labelScale) {
        const { minScale, maxScale } = labelStyle.labelScale;
        return self._isScaleInRange(currentScale, minScale, maxScale);
    }
    if (config.minZoom === undefined)
        return true;
    if (config.maxZoom === undefined)
        return true;
    const zoom = detail.zoom !== undefined ? detail.zoom : map.getZoom();
    if (zoom < config.minZoom)
        return false;
    if (zoom > config.maxZoom)
        return false;
    return true;
}
const Labels = {
    init(_options = {}) {
        if (Log)
            Log.debug("[Labels] Initializing Labels module");
        this._attachLayerEvents();
        if (Log)
            Log.debug("[Labels] Labels module initialized");
    },
    initializeLayerLabels(layerId) {
        if (!layerId)
            return;
        const layerData = this._getLayerData(layerId);
        if (!layerData)
            return;
        this._hideLabelsForLayer(layerId);
        _state.layers.delete(layerId);
        if (layerData.currentStyle?.label?.enabled !== true) {
            if (Log)
                Log.debug("[Labels.initialize] Style without labels or labels disabled for", layerId);
            return;
        }
        const visibleByDefault = layerData.currentStyle.label.visibleByDefault === true;
        if (!visibleByDefault) {
            if (Log)
                Log.debug("[Labels.initialize] Labels disabled by default for", layerId);
            return this.enableLabels(layerId, {}, false);
        }
        const isLayerVisible = layerData._visibility?.current === true;
        if (!isLayerVisible) {
            if (Log)
                Log.debug("[Labels.initialize] Labels configured but layer hidden for", layerId);
            return this.enableLabels(layerId, {}, false);
        }
        if (Log)
            Log.debug("[Labels.initialize] Initializing visible labels for", layerId);
        return this.enableLabels(layerId, {}, true);
    },
    async enableLabels(layerId, labelConfig = {}, showImmediately = true) {
        if (!layerId) {
            if (Log)
                Log.warn("[Labels] enableLabels: layerId missing");
            return;
        }
        if (labelConfig.styleFile) {
            throw new Error(`Obsolete configuration: labels.styleFile detected in layer ${layerId}`);
        }
        if (Log)
            Log.debug("[Labels] Preparing labels for", layerId, "showImmediately:", showImmediately);
        try {
            await _doEnableLabels(this, layerId, labelConfig, showImmediately);
        }
        catch (err) {
            if (Log)
                Log.error("[Labels] Error preparing labels:", err);
            console.error("[Labels] Stack trace:", err.stack);
        }
    },
    disableLabels(layerId) {
        if (!layerId)
            return;
        const layerState = _state.layers.get(layerId);
        if (!layerState)
            return;
        if (Log)
            Log.debug("[Labels] Disabling labels for", layerId);
        if (layerState.tooltips) {
            layerState.tooltips.forEach((t) => {
                try {
                    if (t?.remove)
                        t.remove();
                }
                catch (_e) {
                    /* ignore */
                }
            });
            layerState.tooltips.clear();
        }
        layerState.enabled = false;
    },
    _hideLabelsForLayer(layerId) {
        if (!layerId)
            return;
        const layerState = _state.layers.get(layerId);
        if (!layerState)
            return;
        if (layerState.tooltips) {
            layerState.tooltips.forEach((t) => {
                try {
                    if (t?.remove)
                        t.remove();
                }
                catch (_e) {
                    /* ignore */
                }
            });
            layerState.tooltips.clear();
        }
    },
    toggleLabels(layerId) {
        if (!layerId)
            return false;
        const layerState = _state.layers.get(layerId);
        if (!layerState)
            return false;
        const layerData = this._getLayerData(layerId);
        if (layerData?.currentStyle?.label?.enabled !== true)
            return false;
        if (layerState.enabled) {
            this._hideLabelsForLayer(layerId);
            layerState.enabled = false;
            return false;
        }
        layerState.enabled = true;
        this.refreshLabels(layerId);
        return true;
    },
    hasLabelConfig(layerId) {
        return _state.layers.has(layerId);
    },
    areLabelsEnabled(layerId) {
        const layerState = _state.layers.get(layerId);
        return layerState ? layerState.enabled : false;
    },
    refreshLabels(layerId) {
        if (!layerId)
            return;
        const layerState = _state.layers.get(layerId);
        if (!layerState || !layerState.enabled)
            return;
        const layerData = this._getLayerData(layerId);
        if (!layerData?._visibility?.current)
            return;
        if (layerState.tooltips) {
            layerState.tooltips.forEach((t) => {
                try {
                    if (t?.remove)
                        t.remove();
                }
                catch (_e) {
                    /* ignore */
                }
            });
            layerState.tooltips.clear();
        }
        this._createLabelsForLayer(layerId);
    },
    async _createLabelsForLayer(layerId) {
        const layerState = _state.layers.get(layerId);
        if (!layerState)
            return;
        if (!layerState.enabled)
            return;
        const layerData = this._getLayerData(layerId);
        if (!_isLayerVisible(layerData))
            return;
        const hasFeatures = Array.isArray(layerData.features);
        if (!hasFeatures) {
            if (Log)
                Log.warn("[Labels] GeoJSON layer not found:", layerId);
            return;
        }
        const map = _getMap();
        if (_isOutOfRange(this, map, layerState.config, layerState.labelStyle))
            return;
        _renderTooltipsForLayer(layerId, layerData, layerState.config, layerState.labelStyle, layerState.tooltips);
    },
    _getLayerData(layerId) {
        if (!GeoJSONCore || typeof GeoJSONCore.getLayerById !== "function")
            return null;
        return GeoJSONCore.getLayerById(layerId);
    },
    _ensureZoomListener() {
        if (_state.zoomListenerAttached)
            return;
        const map = Core && Core.getMap ? Core.getMap() : null;
        if (map) {
            map.on("zoomend", () => {
                this._handleZoomChange({ zoom: map.getZoom() });
            });
            _state.zoomListenerAttached = true;
        }
    },
    _attachLayerEvents() {
        if (typeof globalThis.addEventListener === "function") {
            globalThis.addEventListener("geoleaf:layer-loaded", (evt) => {
                const d = evt.detail;
                if (d?.layerId)
                    this._handleLayerLoaded(d.layerId);
            });
        }
    },
    _handleZoomChange(detail) {
        if (!detail)
            return;
        const map = _getMap();
        if (!map)
            return;
        const currentScale = this._calculateMapScale(map);
        _state.layers.forEach((layerState, layerId) => {
            _processZoomLayerItem(this, layerState, layerId, currentScale, detail, map);
        });
    },
    async _handleLayerLoaded(layerId) {
        const layerState = _state.layers.get(layerId);
        if (layerState?.enabled)
            await this._createLabelsForLayer(layerId);
    },
    _calculateMapScale(map) {
        if (ScaleUtils && typeof ScaleUtils.calculateMapScale === "function")
            return ScaleUtils.calculateMapScale(map, { logger: Log });
        if (Log)
            Log.warn("[Labels] ScaleUtils.calculateMapScale unavailable");
        return 0;
    },
    _isScaleInRange(currentScale, minScale, maxScale) {
        if (ScaleUtils && typeof ScaleUtils.isScaleInRange === "function")
            return ScaleUtils.isScaleInRange(currentScale, minScale, maxScale, Log);
        if (Log)
            Log.warn("[Labels] ScaleUtils.isScaleInRange unavailable");
        return true;
    },
    destroy() {
        if (Log)
            Log.debug("[Labels] Destroying Labels module");
        _state.layers.forEach((_, layerId) => this.disableLabels(layerId));
        _state.layers.clear();
    },
};

/**
 * Centralized manager for the button de label in the Layer Manager
 * @module labels/label-button-manager
 */
function _buildLabelToggleButton() {
    const labelToggle = domCreate("button", "gl-layer-manager__label-toggle");
    labelToggle.type = "button";
    labelToggle.setAttribute("aria-label", getLabel("aria.labels.toggle"));
    labelToggle.disabled = true;
    labelToggle.classList.add("gl-layer-manager__label-toggle--disabled");
    const iconSpan = document.createElement("span");
    iconSpan.className = "gl-layer-manager__label-toggle-icon";
    iconSpan.textContent = "🏷️";
    labelToggle.appendChild(iconSpan);
    labelToggle.title = getLabel("aria.labels.toggle");
    return labelToggle;
}
function _buildLabelToggleHandler(labelToggle, layerId) {
    return function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (labelToggle.disabled)
            return;
        try {
            const layerData = GeoJSONCore?.getLayerById?.(layerId);
            const labelEnabled = layerData?.currentStyle?.label?.enabled === true;
            if (!labelEnabled)
                return;
            if (Labels?.toggleLabels) {
                const newState = Labels.toggleLabels(layerId);
                if (newState) {
                    labelToggle.classList.add("gl-layer-manager__label-toggle--on");
                    labelToggle.setAttribute("aria-pressed", "true");
                }
                else {
                    labelToggle.classList.remove("gl-layer-manager__label-toggle--on");
                    labelToggle.setAttribute("aria-pressed", "false");
                }
            }
        }
        catch (err) {
            if (Log)
                Log.warn("[LabelButtonManager] Error toggling labels:", err);
        }
    };
}
const LabelButtonManager = {
    createButton(layerId, controlsContainer) {
        if (!layerId || !controlsContainer) {
            if (Log)
                Log.warn("[LabelButtonManager] createButton: missing parameters", {
                    layerId,
                    hasContainer: !!controlsContainer,
                });
            return null;
        }
        const existingButton = controlsContainer.querySelector(".gl-layer-manager__label-toggle");
        if (existingButton)
            return existingButton;
        const labelToggle = _buildLabelToggleButton();
        const onLabelToggle = _buildLabelToggleHandler(labelToggle, layerId);
        _UIComponents.attachEventHandler(labelToggle, "click", onLabelToggle);
        const visibilityToggle = controlsContainer.querySelector(".gl-layer-manager__item-toggle");
        if (visibilityToggle)
            controlsContainer.insertBefore(labelToggle, visibilityToggle);
        else
            controlsContainer.appendChild(labelToggle);
        return labelToggle;
    },
    sync(layerId) {
        if (!layerId)
            return;
        if (this._syncTimeouts?.has(layerId)) {
            clearTimeout(this._syncTimeouts.get(layerId));
        }
        if (!this._syncTimeouts)
            this._syncTimeouts = new Map();
        const timeout = setTimeout(() => {
            this._syncTimeouts.delete(layerId);
            this._doSync(layerId);
        }, 300);
        this._syncTimeouts.set(layerId, timeout);
    },
    _doSync(layerId) {
        if (!layerId)
            return;
        let button = document.querySelector(`[data-layer-id="${layerId}"] .gl-layer-manager__label-toggle`);
        if (!button) {
            const layerItem = document.querySelector(`[data-layer-id="${layerId}"]`);
            if (!layerItem)
                return;
            const controlsContainer = layerItem.querySelector(".gl-layer-manager__item-controls");
            if (controlsContainer) {
                button = controlsContainer.querySelector(".gl-layer-manager__label-toggle");
                if (!button)
                    button = this.createButton(layerId, controlsContainer);
            }
        }
        if (!button)
            return;
        const state = this._getState(layerId);
        this._applyState(button, state);
    },
    _getState(layerId) {
        const layerData = GeoJSONCore?.getLayerById?.(layerId);
        return {
            layerId,
            layerExists: !!layerData,
            layerVisible: layerData?._visibility?.current === true,
            labelEnabled: layerData?.currentStyle?.label?.enabled === true,
            areLabelsActive: Labels?.areLabelsEnabled?.(layerId) || false,
        };
    },
    _applyState(button, state) {
        const canUseLabels = state.labelEnabled && state.layerVisible;
        if (canUseLabels) {
            button.disabled = false;
            button.classList.remove("gl-layer-manager__label-toggle--disabled");
            const shouldAppearOn = state.areLabelsActive && state.layerVisible;
            if (shouldAppearOn) {
                button.classList.add("gl-layer-manager__label-toggle--on");
                button.setAttribute("aria-pressed", "true");
            }
            else {
                button.classList.remove("gl-layer-manager__label-toggle--on");
                button.setAttribute("aria-pressed", "false");
            }
        }
        else {
            button.disabled = true;
            button.classList.add("gl-layer-manager__label-toggle--disabled");
            button.classList.remove("gl-layer-manager__label-toggle--on");
            button.setAttribute("aria-pressed", "false");
        }
    },
    syncImmediate(layerId) {
        if (!layerId)
            return;
        if (this._syncTimeouts?.has(layerId)) {
            clearTimeout(this._syncTimeouts.get(layerId));
            this._syncTimeouts.delete(layerId);
        }
        this._doSync(layerId);
    },
};

export { Labels as L, _UIComponents as _, LabelButtonManager as a, _LabelRenderer as b };
//# sourceMappingURL=geoleaf-chunk-labels-CEgk8g7A.js.map
