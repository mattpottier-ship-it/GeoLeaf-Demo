import { L as Log, Q as Errors, y as CONSTANTS, u as Security, R as CSRFToken, U as Utils, T as AnimationHelper, V as getAnimationHelper, I as createElement, G as DOMSecurity, W as ErrorLogger, X as EventHelpers, Y as EventListenerManager, O as events, Z as globalEventManager, _ as bus, $ as createEventBus, N as FetchHelper, a0 as FetchError, a1 as FileValidator, a2 as MapHelpers, a3 as PerformanceProfiler, a4 as getPerformanceProfiler, a5 as LazyLoader, a6 as getLazyLoader, a7 as TimerManager, a8 as setNestedValue, a9 as hasNestedPath, P as getNestedValue$1, aa as clearScaleCache, k as isScaleInRange, j as calculateMapScale, p as getLabel, ab as registerDict, o as domCreate, K as blockMapPropagation, ac as haversineDistance, z as StyleResolver, D as getColorsFromLayerStyle, ad as resolvePoiColors, ae as StyleValidator, af as StyleValidatorRules, H as AbstractRenderer, ag as SimpleTextRenderer, ah as DataNormalizer, M as StyleLoader, x as Config$3, ai as DataConverter, aj as ProfileLoader, ak as ConfigNormalizer, al as ProfileLoader$1, am as ProfileManager, an as StorageHelper, ao as TaxonomyManager, l as debounce, q as resolveField, m as escapeHtml, g as getLog, ap as getDistance, A as getActiveProfile, aq as ensureMap, ar as validateCoordinates, as as validateNumber, C as Core, at as Helpers$1, au as Validators, av as initI18n, aw as padBounds, ax as GeoLeafError } from './chunks/geoleaf-chunk-core-utils-CrTxiE0o.js';
import { c as LayerManager, d as LayerManager$1, b as LayerManager$2, e as LayerManager$3, f as Loader, g as Loader$1, h as Loader$2, L as Loader$3, i as LayerConfigManager, a as GeoJSONShared, j as GeoJSONClustering, F as FeatureValidator, n as normalizeStyle, k as GeoJSONStyleResolver, l as VectorTiles, V as VisibilityManager, W as WorkerManager, P as PopupTooltip, G as GeoJSONCore, s as setupProfileDeps, m as setupDataDeps, o as setupSingleLayerDeps, p as setupPopupTooltipDeps } from './chunks/geoleaf-chunk-geojson-RFtchQr2.js';
import { a as RouteLayerManager, b as RouteLoaders, c as RoutePopupBuilder, d as RouteStyleResolver, R as Route } from './chunks/geoleaf-chunk-route-CjIPmU1R.js';
import { a as LabelButtonManager, b as _LabelRenderer, L as Labels, _ as _UIComponents } from './chunks/geoleaf-chunk-labels-SF6JUIVF.js';
import { a as LegendControl, b as LegendGenerator, c as LegendRenderer, L as Legend } from './chunks/geoleaf-chunk-legend-CP85U24h.js';
import { B as BasemapSelector, b as LMControl, c as LMRenderer, d as LMShared, S as StyleSelector, e as Baselayers, L as LayerManager$4 } from './chunks/geoleaf-chunk-layers-Bl8pZzO-.js';
import { T as ThemeSelector, a as ThemeCache, b as _ThemeLoader, _ as _ThemeApplier } from './chunks/geoleaf-chunk-themes-CogamjC4.js';
export { c as Themes } from './chunks/geoleaf-chunk-themes-CogamjC4.js';
import { b as POI, c as POIAddFormContract, C as ContentBuilderCore, H as Helpers, d as ContentBuilderShared, A as Assemblers, a as POIShared, e as POINormalizers, P as POIMarkers, f as POIPopup, g as POISidepanel, h as POIRenderers, i as POICore, j as ComponentRenderers, R as RendererCore, L as LightboxManager, k as RendererLinks, S as SectionOrchestrator, U as UIBehaviors, l as POICoreContract, F as FieldRenderers, M as MediaRenderers } from './chunks/geoleaf-chunk-poi-C7l6cKn-.js';
import { T as TableContract, a as Table } from './chunks/geoleaf-chunk-table-qzqmtbw7.js';
export { S as Search } from './chunks/geoleaf-search-DW_76Z72.js';

/**
 * @module globals.core
 *
 * @description
 * UMD/ESM bridge — B1 + B2 — runtime core initialization.
 *
 * This runtime initialization module registers the foundational GeoLeaf services
 * on `globalThis.GeoLeaf`. It is imported as a side-effect by `globals.ts` and
 * must be the **first** sub-module executed.
 *
 * Registers:
 *   - **B1** — `Log`, `Errors`, `CONSTANTS`, `Security`, `CSRFToken`
 *   - **B2** — `Utils` (animation, DOM, events, fetch, file validation,
 *     lazy loading, map helpers, object utils, performance, scale, timers)
 *
 * Also sets `_g.GeoLeaf._version` from the Rollup-injected `"2.1.7"`
 * constant, falling back to `'1.1.1-dev'` in development mode.
 *
 * @see globals for the orchestrator and import order
 * @see docs/architecture/BOOT_SEQUENCE.md
 */
// B1 : log, errors, constants, security
const _g$j = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g$j.GeoLeaf = _g$j.GeoLeaf || {};
// Version injectable at build time — fallback for dev without build step
_g$j.GeoLeaf._version =
    "2.1.7" ;
// -- B1 assignations ----------------------------------------------------------
_g$j.GeoLeaf.Log = Log;
_g$j.GeoLeaf.Errors = Errors;
_g$j.GeoLeaf.CONSTANTS = CONSTANTS;
if (!_g$j.GeoLeaf.Security)
    _g$j.GeoLeaf.Security = {};
Object.assign(_g$j.GeoLeaf.Security, Security);
_g$j.GeoLeaf.Security.CSRFToken = CSRFToken;
// -- B2 assignations ----------------------------------------------------------
if (!_g$j.GeoLeaf.Utils)
    _g$j.GeoLeaf.Utils = {};
Object.assign(_g$j.GeoLeaf.Utils, Utils);
_g$j.GeoLeaf.Utils.AnimationHelper = AnimationHelper;
Object.defineProperty(_g$j.GeoLeaf.Utils, "animationHelper", {
    get: () => getAnimationHelper(),
    configurable: true,
});
_g$j.GeoLeaf.Utils.createElement = createElement;
_g$j.GeoLeaf.Utils.DOMSecurity = DOMSecurity;
_g$j.GeoLeaf.DOMSecurity = DOMSecurity;
_g$j.GeoLeaf.Utils.ErrorLogger = ErrorLogger;
_g$j.GeoLeaf.Utils.EventHelpers = EventHelpers;
_g$j.GeoLeaf.Utils.EventListenerManager = EventListenerManager;
_g$j.GeoLeaf.Utils.events = events;
_g$j.GeoLeaf.Utils.globalEventManager = globalEventManager;
_g$j.GeoLeaf.Bus = bus;
_g$j.GeoLeaf.Utils.createEventBus = createEventBus;
_g$j.GeoLeaf.Utils.FetchHelper = FetchHelper;
_g$j.GeoLeaf.Utils.FetchError = FetchError;
_g$j.GeoLeaf.Utils.FileValidator = FileValidator;
_g$j.GeoLeaf.FileValidator = FileValidator;
_g$j.GeoLeaf.Utils.MapHelpers = MapHelpers;
_g$j.GeoLeaf.Utils.PerformanceProfiler = PerformanceProfiler;
Object.defineProperty(_g$j.GeoLeaf.Utils, "performanceProfiler", {
    get: () => getPerformanceProfiler(),
    configurable: true,
});
_g$j.GeoLeaf.Utils.LazyLoader = LazyLoader;
Object.defineProperty(_g$j.GeoLeaf.Utils, "lazyLoader", {
    get: () => getLazyLoader(),
    configurable: true,
});
_g$j.GeoLeaf.Utils.TimerManager = TimerManager;
_g$j.GeoLeaf.Utils.ObjectUtils = { getNestedValue: getNestedValue$1, hasNestedPath, setNestedValue };
_g$j.GeoLeaf.Utils.getNestedValue = getNestedValue$1;
_g$j.GeoLeaf.Utils.hasNestedPath = hasNestedPath;
_g$j.GeoLeaf.Utils.setNestedValue = setNestedValue;
_g$j.GeoLeaf.Utils.ScaleUtils = { calculateMapScale, isScaleInRange, clearScaleCache };
// FetchHelper shortcuts
_g$j.GeoLeaf.fetch = FetchHelper.fetch.bind(FetchHelper);
_g$j.GeoLeaf.get = FetchHelper.get.bind(FetchHelper);
_g$j.GeoLeaf.post = FetchHelper.post.bind(FetchHelper);
// MapHelpers shortcuts
_g$j.GeoLeaf.ensureMap = MapHelpers.ensureMap.bind(MapHelpers);
_g$j.GeoLeaf.requireMap = MapHelpers.requireMap.bind(MapHelpers);
_g$j.GeoLeaf.hasMap = MapHelpers.hasMap.bind(MapHelpers);
// Animation shortcuts
_g$j.GeoLeaf.animate = (...args) => getAnimationHelper().animate(...args);
_g$j.GeoLeaf.fadeIn = (...args) => getAnimationHelper().fadeIn(...args);
_g$j.GeoLeaf.fadeOut = (...args) => getAnimationHelper().fadeOut(...args);
// PerformanceProfiler shortcuts
_g$j.GeoLeaf.mark = (name) => getPerformanceProfiler().mark(name);
_g$j.GeoLeaf.measure = (name, s, e) => getPerformanceProfiler().measure(name, s, e);
_g$j.GeoLeaf.getPerformanceReport = () => getPerformanceProfiler().generateReport();
_g$j.GeoLeaf.establishBaseline = () => getPerformanceProfiler().establishBaseline();
// LazyLoader shortcuts
_g$j.GeoLeaf.loadModule = (name, path, opts) => getLazyLoader().loadModule(name, path, opts);
_g$j.GeoLeaf.enableLazyImages = (selector) => getLazyLoader().enableImageLazyLoading(selector);
// EventHelpers shortcuts
_g$j.GeoLeaf.dispatchEvent = EventHelpers.dispatchCustomEvent.bind(EventHelpers);
_g$j.GeoLeaf.dispatchMapEvent = EventHelpers.dispatchMapEvent.bind(EventHelpers);
// I18n namespace — exposes registerDict for plugins + getLabel for consumers
_g$j.GeoLeaf.I18n = { registerDict, getLabel };

/**
 * GeoLeaf Scale Control
 * Manages the display of graphical scale, numeric scale and zoom level
 *
 * @module map/scale-control
 */
// Lazy access to Config (not yet ESM — migrated in B4)
const _gl$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
/**
 * Custom scale control
 */
const ScaleControl$1 = {
    _map: null,
    _config: null,
    _container: null,
    _scaleLineMetric: null,
    _numericElement: null,
    _zoomElement: null,
    _inputElement: null,
    _scalePrefix: null,
    _mainWrapper: null,
    _controlHandle: null,
    _cleanups: [],
    _eventHandlers: {},
    /**
     * Initializes the scale control
     * @param {any} map - Map adapter instance (IMapAdapter)
     * @param {Object} config - Configuration from scaleConfig
     */
    init(map, config) {
        if (!map) {
            Log.error("[GeoLeaf.ScaleControl] Map not provided");
            return;
        }
        this._map = map;
        this._config = config || {};
        this._cleanups = [];
        // Create a single container for everything
        this._createMainContainer();
        Log.info("[GeoLeaf.ScaleControl] Scale control initialized");
    },
    /**
     * Creates the main container with graphical scale and custom block
     * @private
     */
    _createMainContainer() {
        const position = this._config.position || "bottomleft";
        // Main container — horizontal layout
        this._mainWrapper = domCreate("div", "gl-scale-main-wrapper");
        // 1. Graphical scale
        if (this._config.scaleGraphic !== false) {
            const graphicWrapper = domCreate("div", "gl-scale-graphic-wrapper", this._mainWrapper);
            this._addGraphicScaleToContainer(graphicWrapper);
        }
        // 2. Custom block (numeric scale + zoom) on the same line
        if (this._config.scaleNumeric || this._config.scaleNivel) {
            this._createCustomScaleBlock(this._mainWrapper);
        }
        // Add main container to the map via the adapter
        this._controlHandle = this._map.addControl(this._mainWrapper, position);
    },
    /**
     * Adds the graphical scale into a container
     * @param {HTMLElement} container - Target container
     * @private
     */
    _addGraphicScaleToContainer(container) {
        // Create graphical scale manually
        const scaleDiv = domCreate("div", "gl-scale-graphic gl-control", container);
        const scaleLineMetric = domCreate("div", "gl-scale-graphic-line", scaleDiv);
        this._scaleLineMetric = scaleLineMetric;
        // Update function for the graphical scale
        const updateScale = () => {
            const mapHeight = this._map.getContainer().getBoundingClientRect().height;
            const y = mapHeight / 2;
            const p1 = this._map.pointToLatLng({ x: 0, y });
            const p2 = this._map.pointToLatLng({ x: 150, y });
            const maxMeters = haversineDistance(p1, p2);
            this._updateScaleLine(this._scaleLineMetric, maxMeters);
        };
        this._eventHandlers.graphicScaleUpdate = updateScale;
        this._map.on("zoomend", updateScale);
        this._map.on("moveend", updateScale);
        updateScale();
        Log.info("[GeoLeaf.ScaleControl] Graphical scale added");
    },
    /**
     * Updates the graphical scale line
     * @param {HTMLElement} scaleLine - Scale line element
     * @param {number} maxMeters - Maximum distance in meters
     * @private
     */
    _updateScaleLine(scaleLine, maxMeters) {
        const maxKm = maxMeters / 1000;
        let scale, ratio;
        if (maxKm > 1) {
            const maxNiceKm = this._getRoundNum(maxKm);
            ratio = maxNiceKm / maxKm;
            scale = maxNiceKm + " km";
        }
        else {
            const maxNiceM = this._getRoundNum(maxMeters);
            ratio = maxNiceM / maxMeters;
            scale = maxNiceM + " m";
        }
        scaleLine.style.width = Math.round(150 * ratio) + "px";
        scaleLine.textContent = scale;
    },
    /**
     * Rounds a number to a "clean" value (1, 2, 5, 10, 20, 50, etc.)
     * @param {number} num - Number to round
     * @returns {number} Rounded number
     * @private
     */
    _getRoundNum(num) {
        const pow10 = Math.pow(10, (Math.floor(num) + "").length - 1);
        let d = num / pow10;
        d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
        return pow10 * d;
    },
    /**
     * Creates the custom block (numeric scale + zoom level)
     * @param {HTMLElement} parentContainer - Parent container
     * @private
     */
    _createCustomScaleBlock(parentContainer) {
        // Create container — horizontal layout
        this._container = domCreate("div", "gl-scale-control", parentContainer);
        // Numeric scale
        if (this._config.scaleNumeric) {
            if (this._config.scaleNumericEditable) {
                this._createEditableScale();
            }
            else {
                this._createReadOnlyScale();
            }
        }
        // Zoom level
        if (this._config.scaleNivel) {
            this._createZoomLevel();
        }
        // Update events
        const updateHandler = () => this._updateScale();
        this._eventHandlers.numericScaleUpdate = updateHandler;
        this._map.on("zoomend", updateHandler);
        this._map.on("moveend", updateHandler);
        this._updateScale(); // Initial update
        Log.info("[GeoLeaf.ScaleControl] Custom block added");
    },
    /**
     * Creates read-only numeric scale
     * @private
     */
    _createReadOnlyScale() {
        this._numericElement = domCreate("div", "gl-scale-numeric", this._container);
    },
    /**
     * Creates editable numeric scale with input
     * @private
     */
    _createEditableScale() {
        // Create container for editable scale
        const wrapper = domCreate("div", "gl-scale-numeric-editable", this._container);
        // Create "1:" prefix (always visible)
        this._scalePrefix = domCreate("span", "gl-scale-prefix", wrapper);
        this._scalePrefix.textContent = "1:";
        // Create the initially displayed span (underlined and clickable) - contains only the denominator
        this._numericElement = domCreate("span", "gl-scale-numeric-clickable", wrapper);
        this._numericElement.textContent = "0";
        // Create the input (hidden initially) - contains only the denominator
        this._inputElement = domCreate("input", "gl-scale-numeric-input", wrapper);
        this._inputElement.type = "text";
        this._inputElement.placeholder = "250000";
        this._inputElement.style.display = "none";
        // Prevent map interactions during editing
        blockMapPropagation(wrapper, this._cleanups);
        // Span click: switch to edit mode
        this._numericElement.addEventListener("click", () => {
            this._switchToEditMode();
        });
        // Validate with Enter
        this._inputElement.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this._onScaleInputChange();
                this._switchToDisplayMode();
            }
        });
        // Validation on blur
        this._inputElement.addEventListener("blur", () => {
            this._onScaleInputChange();
            this._switchToDisplayMode();
        });
    },
    /**
     * Creates zoom level display
     * @private
     */
    _createZoomLevel() {
        this._zoomElement = domCreate("div", "gl-scale-zoom", this._container);
    },
    /**
     * Switches to edit mode (shows input)
     * @private
     */
    _switchToEditMode() {
        if (!this._numericElement || !this._inputElement)
            return;
        // Copy current value into the input
        this._inputElement.value = this._numericElement.textContent;
        // Hide the span, show the input
        this._numericElement.style.display = "none";
        this._inputElement.style.display = "inline-block";
        // Focus and select text
        this._inputElement.focus();
        this._inputElement.select();
    },
    /**
     * Switches to display mode (shows span)
     * @private
     */
    _switchToDisplayMode() {
        if (!this._numericElement || !this._inputElement)
            return;
        // Hide the input, show the span
        this._inputElement.style.display = "none";
        this._numericElement.style.display = "inline";
    },
    /**
     * Updates the scale and zoom display
     * @private
     */
    _updateScale() {
        const zoom = this._map.getZoom();
        const scale = this._calculateScale(zoom);
        // Update numeric scale
        if (this._numericElement) {
            if (this._config.scaleNumericEditable) {
                // Update only the denominator (without '1:')
                if (this._inputElement.style.display === "none") {
                    this._numericElement.textContent = this._formatNumber(scale);
                }
            }
            else {
                // Non-editable mode: display "1:" + denominator
                this._numericElement.textContent = `1:${this._formatNumber(scale)}`;
            }
        }
        // Update zoom level
        if (this._zoomElement) {
            this._zoomElement.textContent = `Zoom: ${Number(zoom).toFixed(2)}`;
        }
    },
    /**
     * Calculates approximate scale based on zoom level
     * @param {number} zoom - Map zoom level
     * @param {number} [lat] - Optional latitude (uses map center if not provided)
     * @returns {number} Scale (e.g. 250000 for 1:250000)
     * @private
     */
    _calculateScale(zoom, lat) {
        // Use provided latitude or map center latitude
        const latitude = lat !== undefined ? lat : this._map.getCenter().lat;
        // Approximate formula based on Web Mercator tile size
        const metersPerPixel = (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
        const scale = (metersPerPixel * 96) / 0.0254; // 96 DPI
        return Math.round(scale);
    },
    /**
     * Formats a number with spaces as thousands separators
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     * @private
     */
    _formatNumber(num) {
        /* eslint-disable-next-line security/detect-unsafe-regex -- fixed pattern for thousands separator */
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },
    /**
     * Handles manual scale change
     * @private
     */
    _onScaleInputChange() {
        if (!this._inputElement)
            return;
        const input = this._inputElement.value.trim();
        // Parse only the denominator (number with optional spaces)
        const cleanedInput = input.replace(/\s/g, "");
        const targetScale = Number.parseInt(cleanedInput, 10);
        if (!isNaN(targetScale) && targetScale > 0) {
            const targetZoom = this._calculateZoomFromScale(targetScale);
            // Use setView without options — adapter signature: setView(center, zoom)
            this._map.setView(this._map.getCenter(), targetZoom);
            Log.info(`[GeoLeaf.ScaleControl] Zoom adjusted to ${targetZoom} for scale 1:${targetScale}`);
        }
        else {
            Log.warn("[GeoLeaf.ScaleControl] Invalid scale format:", input);
            this._updateScale(); // Reset value
        }
    },
    /**
     * Calculates the zoom level to reach a given scale
     * @param {number} targetScale - Target scale (e.g. 250000)
     * @returns {number} Zoom level (may be fractional for precision)
     * @private
     */
    _calculateZoomFromScale(targetScale) {
        const lat = this._map.getCenter().lat;
        const metersPerPixel = (targetScale * 0.0254) / 96;
        let zoom = Math.log2((156543.03392 * Math.cos((lat * Math.PI) / 180)) / metersPerPixel);
        // Refine zoom by iteration to get the exact scale
        // Use a precise convergence method
        for (let i = 0; i < 20; i++) {
            const currentScale = this._calculateScale(zoom, lat);
            const diff = targetScale - currentScale;
            // Stop if error is less than 1 (essentially identical)
            if (Math.abs(diff) < 1) {
                break;
            }
            // Adjust zoom proportionally to the error
            // The larger the scale, the more we need to zoom out
            const adjustment = Math.log2(targetScale / currentScale);
            zoom -= adjustment * 0.95; // Damping factor to avoid oscillations
        }
        // Round to 4 decimal places for maximum precision
        const preciseZoom = Math.round(zoom * 10000) / 10000;
        return Math.max(0, Math.min(22, preciseZoom));
    },
    /**
     * Destroys the control and cleans up resources
     */
    destroy() {
        // Remove event listeners from the map
        if (this._map && this._eventHandlers) {
            if (this._eventHandlers.graphicScaleUpdate) {
                this._map.off("zoomend", this._eventHandlers.graphicScaleUpdate);
                this._map.off("moveend", this._eventHandlers.graphicScaleUpdate);
            }
            if (this._eventHandlers.numericScaleUpdate) {
                this._map.off("zoomend", this._eventHandlers.numericScaleUpdate);
                this._map.off("moveend", this._eventHandlers.numericScaleUpdate);
            }
        }
        // Remove the control via adapter handle
        this._controlHandle?.remove();
        // Run propagation-blocker cleanups
        if (this._cleanups) {
            for (const fn of this._cleanups)
                fn();
            this._cleanups = [];
        }
        // Remove main container from the DOM (belt-and-suspenders)
        if (this._mainWrapper && this._mainWrapper.parentNode) {
            this._mainWrapper.parentNode.removeChild(this._mainWrapper);
        }
        // Clean up all references
        this._map = null;
        this._config = null;
        this._container = null;
        this._scaleLineMetric = null;
        this._numericElement = null;
        this._zoomElement = null;
        this._inputElement = null;
        this._scalePrefix = null;
        this._mainWrapper = null;
        this._controlHandle = null;
        this._eventHandlers = {};
        Log.info("[GeoLeaf.ScaleControl] Control destroyed and resources cleaned up");
    },
};
// Expose the module (removed: migrated to globals.js in B3)
/**
 * Automatically initializes the scale control if configuration is present
 */
function initScaleControl(map) {
    if (!map) {
        Log.warn("[GeoLeaf.ScaleControl] Cannot initialize: map not provided");
        return;
    }
    const uiConfig = _gl$1.GeoLeaf && _gl$1.GeoLeaf.Config && typeof _gl$1.GeoLeaf.Config.get === "function"
        ? _gl$1.GeoLeaf.Config.get("ui")
        : null;
    if (uiConfig?.showScale === false)
        return;
    const config = _gl$1.GeoLeaf && _gl$1.GeoLeaf.Config && typeof _gl$1.GeoLeaf.Config.get === "function"
        ? _gl$1.GeoLeaf.Config.get("scaleConfig")
        : null;
    if (config && (config.scaleGraphic || config.scaleNumeric || config.scaleNivel)) {
        ScaleControl$1.init(map, config);
    }
}

/**
 * @module globals.config
 *
 * @description
 * UMD/ESM bridge — B3 + B4 — Helpers, Validators, Renderers, Data, Config.
 *
 * This runtime initialization module registers configuration and data services
 * on `globalThis.GeoLeaf`. It is imported as a side-effect by `globals.ts`.
 *
 * Registers:
 *   - **B3** — Helpers (DOM, style resolver), Validators (schema, style),
 *     Renderers (abstract, simple-text), Data normalizer, Loaders (style loader),
 *     Map factory
 *   - **B4** — Config (accessors, core, loaders, validation, primitives,
 *     profile loader, data converter, taxonomy, debug flag, normalization, storage)
 *
 * @see globals for the orchestrator and import order
 */
// B3 : helpers, validators, renderers, data, loaders, map
const _g$i = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g$i.GeoLeaf = _g$i.GeoLeaf || {};
// ── B3 assignations ──────────────────────────────────────────────────────────
if (!_g$i.GeoLeaf.Helpers)
    _g$i.GeoLeaf.Helpers = {};
_g$i.GeoLeaf.Helpers.StyleResolver = StyleResolver;
_g$i.GeoLeaf.Helpers.getColorsFromLayerStyle = getColorsFromLayerStyle;
_g$i.GeoLeaf.Helpers.resolvePoiColors = resolvePoiColors;
if (!_g$i.GeoLeaf._Validators)
    _g$i.GeoLeaf._Validators = {};
_g$i.GeoLeaf._StyleValidator = StyleValidator;
_g$i.GeoLeaf._Validators.StyleValidator = StyleValidator;
_g$i.GeoLeaf._StyleValidatorRules = StyleValidatorRules;
_g$i.GeoLeaf._Validators.StyleValidatorRules = StyleValidatorRules;
if (!_g$i.GeoLeaf._Renderers)
    _g$i.GeoLeaf._Renderers = {};
_g$i.GeoLeaf._Renderers.AbstractRenderer = AbstractRenderer;
_g$i.GeoLeaf._Renderers.SimpleTextRenderer = SimpleTextRenderer;
_g$i.GeoLeaf._Normalizer = DataNormalizer;
_g$i.GeoLeaf._StyleLoader = StyleLoader;
_g$i.GeoLeaf.ScaleControl = ScaleControl$1;
_g$i.GeoLeaf.initScaleControl = initScaleControl;
// ── B4 assignations ──────────────────────────────────────────────────────────
if (!_g$i.GeoLeaf.Config)
    _g$i.GeoLeaf.Config = Config$3;
Object.assign(_g$i.GeoLeaf.Config, Config$3);
_g$i.GeoLeaf._DataConverter = DataConverter;
_g$i.GeoLeaf._ConfigLoader = ProfileLoader;
_g$i.GeoLeaf._ConfigNormalization = ConfigNormalizer;
_g$i.GeoLeaf._ProfileLoader = ProfileLoader$1;
_g$i.GeoLeaf._ConfigProfile = ProfileManager;
_g$i.GeoLeaf._ConfigStorage = StorageHelper;
_g$i.GeoLeaf._ConfigTaxonomy = TaxonomyManager;

/**
 * @module globals.geojson
 *
 * @description
 * UMD/ESM bridge — B5 — GeoJSON layers and Route module initialization.
 *
 * This runtime initialization module registers all GeoJSON and Route internals
 * on `globalThis.GeoLeaf`. It is imported as a side-effect by `globals.ts`.
 *
 * Registers:
 *   - `GeoJSON` core (`GeoJSONCore`, clustering, shared, feature validator)
 *   - Style utilities (`_StyleUtils`, `_GeoJSONStyleResolver`, `_StyleRules`)
 *   - Vector tiles (`_VectorTiles`), visibility manager, worker manager
 *   - Layer config manager, popup/tooltip, layer manager sub-modules (store,
 *     visibility, style, integration), loader sub-modules (config, data, profile, single-layer)
 *   - Route internals (`_RouteLayerManager`, `_RouteLoaders`, `_RoutePopupBuilder`,
 *     `_RouteStyleResolver`)
 *
 * @see globals for the orchestrator and import order
 * @see globals-lite.geojson for the Lite variant (route excluded)
 */
// B5 : geojson, route
const _g$h = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g$h.GeoLeaf = _g$h.GeoLeaf || {};
// ── B5 assignations ──────────────────────────────────────────────────────────
const _GeoJSONLayerManager = Object.assign({}, LayerManager, LayerManager$1, LayerManager$2, LayerManager$3);
const _GeoJSONLoader = Object.assign({}, Loader, Loader$1, Loader$2, Loader$3);
// Missing delegation: _resolveDataFilePath is not defined in any Loader sub-module.
// LayerConfigManager.resolveDataFilePath resolves le path of a file de data GeoJSON.
_GeoJSONLoader._resolveDataFilePath = LayerConfigManager.resolveDataFilePath?.bind(LayerConfigManager);
_g$h.GeoLeaf._GeoJSONShared = GeoJSONShared;
_g$h.GeoLeaf._GeoJSONClustering = GeoJSONClustering;
_g$h.GeoLeaf._GeoJSONFeatureValidator = FeatureValidator;
_g$h.GeoLeaf._StyleUtils = { normalizeStyle };
_g$h.GeoLeaf._GeoJSONStyleResolver = GeoJSONStyleResolver;
_g$h.GeoLeaf._StyleRules = {
    evaluate: GeoJSONStyleResolver.evaluateStyleRules,
    operators: GeoJSONShared.STYLE_OPERATORS,
    getNestedValue: GeoJSONStyleResolver.getNestedValue,
};
_g$h.GeoLeaf._VectorTiles = VectorTiles;
_g$h.GeoLeaf._LayerVisibilityManager = VisibilityManager;
_g$h.GeoLeaf._WorkerManager = WorkerManager;
_g$h.GeoLeaf._GeoJSONLayerConfig = LayerConfigManager;
_g$h.GeoLeaf._GeoJSONPopupTooltip = PopupTooltip;
_g$h.GeoLeaf._GeoJSONLayerManager = _GeoJSONLayerManager;
_g$h.GeoLeaf._GeoJSONLoader = _GeoJSONLoader;
_g$h.GeoLeaf.GeoJSON = GeoJSONCore;
_g$h.GeoLeaf._RouteLayerManager = RouteLayerManager;
_g$h.GeoLeaf._RouteLoaders = RouteLoaders;
_g$h.GeoLeaf._RoutePopupBuilder = RoutePopupBuilder;
_g$h.GeoLeaf._RouteStyleResolver = RouteStyleResolver;
// ── Phase 10-F — Service locator wiring for GeoJSON loaders ─────────────────
const _loaderDeps = {
    getLayerManager: () => _GeoJSONLayerManager,
    getLoader: () => _GeoJSONLoader,
    getConfig: () => _g$h.GeoLeaf?.Config,
    getStyleResolver: () => GeoJSONStyleResolver,
    getFeatureValidator: () => FeatureValidator,
    getLayerConfig: () => LayerConfigManager,
    getVectorTiles: () => VectorTiles,
    getUtils: () => _g$h.GeoLeaf?.Utils,
    getNotifications: () => _g$h.GeoLeaf?.Notifications,
    getCore: () => _g$h.GeoLeaf?.Core,
    getPopupTooltip: () => PopupTooltip,
    getLabels: () => _g$h.GeoLeaf?.Labels,
    getWorkerManager: () => WorkerManager,
    getDataConverter: () => _g$h.GeoLeaf?._DataConverter,
    getNormalizer: () => _g$h.GeoLeaf?._Normalizer,
    getAllLayerConfigs: () => _g$h.GeoLeaf?._allLayerConfigs,
    setAllLayerConfigs: (configs) => {
        _g$h.GeoLeaf._allLayerConfigs = configs;
    },
};
setupProfileDeps(_loaderDeps);
setupDataDeps(_loaderDeps);
setupSingleLayerDeps(_loaderDeps);
setupPopupTooltipDeps(_loaderDeps);

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * Module GeoLeaf.UI.Branding
 *
 * Role:
 * - Displays a customisable branding text
 * - Positions the control based on the configuration
 * - Allows activation/deactivation via configuration
 */
function _applyBrandingOptions(opts, branding) {
    if (branding.text)
        opts.text = branding.text;
    if (branding.position)
        opts.position = branding.position;
}
const Branding = {
    /**
     * Reference to the map adapter instance.
     * @type {IMapAdapter|null}
     * @private
     */
    _map: null,
    /**
     * Handle returned by map.addControl(), used for removal.
     * @type {{ remove(): void }|null}
     * @private
     */
    _controlHandle: null,
    /**
     * Root HTMLElement of the branding control.
     * @type {HTMLElement|null}
     * @private
     */
    _container: null,
    /**
     * Cleanup functions for event listeners.
     * @type {(() => void)[]}
     * @private
     */
    _cleanups: [],
    /**
     * Options of the module.
     * @type {Object}
     * @private
     */
    _options: {
        position: "bottomleft",
        text: getLabel("ui.branding.default_text"),
    },
    /**
     * Initializes the branding module.
     * @param {any} map - Map adapter instance
     * @param {Object} options - Configuration options
     */
    init(map, options = {}) {
        const context = "[GeoLeaf.UI.Branding]";
        try {
            if (!map) {
                throw new Error("A map instance is required.");
            }
            this._map = map;
            this._options = Object.assign({}, this._options, options);
            // Source unique: geoleaf.config.json → key "branding"
            // No fallback to profile.json (brandingConfig ignored)
            const branding = Config$3?.get("branding");
            if (branding === undefined || branding === null) {
                // Key missing → visible warning on the map
                console.warn("[GeoLeaf] branding key missing in geoleaf.config.json");
                this._options.text = getLabel("ui.branding.not_configured");
                this._createControl();
                return;
            }
            if (branding === false || (branding && branding.enabled === false)) {
                Log.info(`${context} Branding disabled in configuration.`);
                return;
            }
            // Empty text → silent
            if (branding.text === "") {
                Log.info(`${context} Branding text empty — nothing displayed.`);
                return;
            }
            // Apply options from geoleaf.config.json
            _applyBrandingOptions(this._options, branding);
            // Create the control
            this._createControl();
            Log.info(`${context} Module initialized successfully.`);
        }
        catch (err) {
            Log.error(`${context} Error during initialization:`, err.message);
        }
    },
    /**
     * Creates the branding control and adds it to the map.
     * @private
     */
    _createControl() {
        const context = "[GeoLeaf.UI.Branding]";
        try {
            // Build the container element
            const container = domCreate("div", "gl-branding");
            // Block map event propagation on this control
            this._cleanups = [];
            blockMapPropagation(container, this._cleanups);
            // Create the text display element
            const brandingElement = domCreate("div", "gl-branding__content", container);
            // SAFE: textContent prevents XSS
            brandingElement.textContent = this._options.text;
            // Store reference for direct access
            this._container = container;
            // Add to map via adapter — returns a handle with remove()
            this._controlHandle = this._map.addControl(container, this._options.position);
            Log.info(`${context} Branding control created and added to the map.`);
        }
        catch (err) {
            Log.error(`${context} Error creating branding control:`, err.message);
        }
    },
    /**
     * Destroys the control and cleans up resources.
     */
    destroy() {
        const context = "[GeoLeaf.UI.Branding]";
        try {
            // Run all event listener cleanups
            for (const fn of this._cleanups)
                fn();
            this._cleanups = [];
            // Remove control from the map
            this._controlHandle?.remove();
            this._controlHandle = null;
            this._container = null;
            Log.info(`${context} Module destroyed successfully.`);
        }
        catch (err) {
            Log.error(`${context} Error during destruction:`, err.message);
        }
    },
    /**
     * Shows the branding control on the map.
     */
    show() {
        if (this._container) {
            this._container.style.display = "";
        }
    },
    /**
     * Hides the branding control from the map.
     */
    hide() {
        if (this._container) {
            this._container.style.display = "none";
        }
    },
    /**
     * Updates the branding text.
     * @param {string} text - New text to display
     */
    setText(text) {
        if (this._container) {
            const brandingElement = this._container.querySelector(".gl-branding__content");
            if (brandingElement) {
                // SAFE: textContent prevents XSS
                brandingElement.textContent = text;
            }
        }
    },
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI - Fullscreen Control
 * Engine-agnostic fullscreen control (no Leaflet dependency).
 *
 * @module ui/control-fullscreen
 */
function _buildFullscreenIcons(link) {
    // SAFE: SVG static hardcode
    const svgEnter = DOMSecurity.createSVGIcon(18, 18, "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3", { stroke: "currentColor", strokeWidth: "2", fill: "none" });
    svgEnter.classList.add("fullscreen-enter-icon");
    // SAFE: SVG static hardcode
    const svgExit = DOMSecurity.createSVGIcon(18, 18, "M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3", { stroke: "currentColor", strokeWidth: "2", fill: "none" });
    svgExit.classList.add("fullscreen-exit-icon");
    svgExit.style.display = "none";
    link.appendChild(svgEnter);
    link.appendChild(svgExit);
    return { svgEnter, svgExit };
}
function _buildNotifMover(mapContainer) {
    const _notifId = "gl-notifications";
    let _notifOriginalParent = null;
    let _notifOriginalNextSibling = null;
    return {
        moveIn: () => {
            const notif = document.getElementById(_notifId);
            if (!notif)
                return;
            _notifOriginalParent = notif.parentElement;
            _notifOriginalNextSibling = notif.nextSibling;
            mapContainer.appendChild(notif);
        },
        moveOut: () => {
            const notif = document.getElementById(_notifId);
            if (!notif || !_notifOriginalParent)
                return;
            if (_notifOriginalNextSibling) {
                _notifOriginalParent.insertBefore(notif, _notifOriginalNextSibling);
            }
            else {
                _notifOriginalParent.appendChild(notif);
            }
            _notifOriginalParent = null;
            _notifOriginalNextSibling = null;
        },
    };
}
function _buildFullscreenHandlers(link, mapContainer, debouncedResize, svgEnter, svgExit, notifMover) {
    const updateIcon = (isFullscreen) => {
        svgEnter.style.display = isFullscreen ? "none" : "block";
        svgExit.style.display = isFullscreen ? "block" : "none";
    };
    const toggleFullscreen = (e) => {
        e.preventDefault();
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().catch((err) => {
                if (Log)
                    Log.error("[UI.Controls] Fullscreen error:", err);
            });
        }
        else {
            document.exitFullscreen().catch((err) => {
                if (Log)
                    Log.error("[UI.Controls] Fullscreen exit error:", err);
            });
        }
    };
    // Single source of truth for the fullscreen state.
    const fullscreenChangeHandler = () => {
        if (document.fullscreenElement) {
            link.classList.add("is-fullscreen");
            link.title = getLabel("aria.fullscreen.exit");
            link.setAttribute("aria-label", getLabel("aria.fullscreen.exit_label"));
            updateIcon(true);
            document.body.classList.add("gl-fullscreen-active");
            notifMover.moveIn();
            debouncedResize();
        }
        else {
            link.classList.remove("is-fullscreen");
            link.title = getLabel("aria.fullscreen.enter");
            link.setAttribute("aria-label", getLabel("aria.fullscreen.enter_label"));
            updateIcon(false);
            document.body.classList.remove("gl-fullscreen-active");
            notifMover.moveOut();
            debouncedResize();
        }
    };
    return { toggleFullscreen, fullscreenChangeHandler };
}
/**
 * Builds the fullscreen control DOM and wires event listeners.
 *
 * @returns The control container element plus a destroy() teardown function.
 */
function _buildFullscreenControl(map, mapContainer) {
    const cleanups = [];
    const container = domCreate("div", "geoleaf-ctrl-fullscreen geoleaf-ctrl-group geoleaf-ctrl");
    const link = domCreate("a", "", container);
    link.href = "#";
    link.title = getLabel("aria.fullscreen.enter");
    link.setAttribute("role", "button");
    link.setAttribute("aria-label", getLabel("aria.fullscreen.enter_label"));
    const { svgEnter, svgExit } = _buildFullscreenIcons(link);
    blockMapPropagation(container, cleanups);
    // Trigger map resize after fullscreen toggle.
    // MapLibre handles resize via ResizeObserver; dispatchEvent is a safe fallback.
    const triggerResize = () => {
        if (typeof map.resize === "function")
            map.resize();
        else
            globalThis.dispatchEvent(new Event("resize"));
    };
    const debouncedResize = debounce ? debounce(triggerResize, 200) : triggerResize;
    const notifMover = _buildNotifMover(mapContainer);
    const { toggleFullscreen, fullscreenChangeHandler } = _buildFullscreenHandlers(link, mapContainer, debouncedResize, svgEnter, svgExit, notifMover);
    // Native event listeners (with stored references for cleanup)
    const keydownHandler = (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar")
            toggleFullscreen(e);
    };
    link.addEventListener("click", toggleFullscreen);
    link.addEventListener("keydown", keydownHandler);
    document.addEventListener("fullscreenchange", fullscreenChangeHandler);
    // Teardown function — removes all listeners and nullifies references
    const destroy = () => {
        document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
        link.removeEventListener("click", toggleFullscreen);
        link.removeEventListener("keydown", keydownHandler);
        for (const fn of cleanups)
            fn();
        cleanups.length = 0;
    };
    return { container, destroy };
}
/**
 * Fullscreen management for the map.
 *
 * @param map          - IMapAdapter instance (engine-agnostic).
 * @param mapContainer - The map container element to put in fullscreen.
 * @returns A destroy function that removes the control and all listeners,
 *          or undefined if initialisation was skipped.
 */
function initFullscreenControl(map, mapContainer) {
    if (!map || !mapContainer) {
        if (Log)
            Log.warn("[UI.Controls] initFullscreenControl: map or container missing");
        return;
    }
    const { container, destroy } = _buildFullscreenControl(map, mapContainer);
    const controlHandle = map.addControl(container, "topleft");
    // Wrap destroy to also remove control from the map
    const fullDestroy = () => {
        destroy();
        controlHandle?.remove?.();
    };
    if (Log)
        Log.info("[UI.Controls] Fullscreen control added to map");
    return fullDestroy;
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf Notification System
 * Gestion des notifications toast et overlays
 * @module ui/notifications
 * @version 1.2.0
 * @updated 2026-01-23 - Standardisation API, queue prioritaire, integration Telemetry
 */
// Constantes for thes prioritys de la queue
const PRIORITY = {
    ERROR: 3,
    WARNING: 2,
    SUCCESS: 1,
    INFO: 1,
};
class NotificationSystem {
    container;
    maxVisible;
    maxPersistent;
    durations;
    config;
    _eventManager;
    _timerManager;
    _activeToasts;
    _queue;
    _maxQueueSize;
    constructor() {
        this.container = null;
        this.maxVisible = 3; // Max toasts temporaires visibles
        this.maxPersistent = 2; // Max toasts persistants visibles
        this.durations = {
            success: 3000,
            error: 5000,
            warning: 4000,
            info: 3000,
        };
        this.config = {
            enabled: true,
            position: "bottom-center",
            animations: true,
        };
        // Managers pour cleanup
        this._eventManager = null;
        this._timerManager = null;
        this._activeToasts = new Map();
        // Queue avec prioritys (limite: 15 max en attente)
        this._queue = [];
        this._maxQueueSize = 15;
    }
    /**
     * Initializes the system de notifications
     * @param {Object} config - Configuration
     * @param {string} config.container - Selector du container
     * @param {number} config.maxVisible - Nombre max de toasts visibles
     * @param {Object} config.durations - Durations par type
     * @param {string} config.position - Position ('bottom-center', 'top-right', etc.)
     * @param {boolean} config.animations - Activer les animations
     */
    init(config = {}) {
        // Fusionner la config
        this.config = { ...this.config, ...config };
        this.maxVisible = config.maxVisible ?? 3;
        this.durations = { ...this.durations, ...config.durations };
        // Retrieve le container
        this.container = document.querySelector(config.container || "#gl-notifications");
        if (!this.container) {
            if (Log)
                Log.warn("[GeoLeaf Notifications] Container introuvable:", config.container);
            return false;
        }
        // Appliesr la class de position
        if (config.position) {
            this.container.className = `gl-notifications gl-notifications--${config.position}`;
        }
        if (Log)
            Log.debug("[GeoLeaf Notifications] System initialized");
        // Initializesr les managers for the cleanup
        this._eventManager = events ? events.createManager("notifications") : null;
        this._timerManager = new TimerManager("notifications");
        return true;
    }
    /**
     * Displays a generic notification (standardized public method)
     * Support double signature:
     * - show(message, type, duration) : Appel positionnel classique
     * - show(message, options) : Appel avec object options
     *
     * @param {string} message - Message to display
     * @param {string|Object} typeOrOptions - Type ('success', 'error', 'warning', 'info') OU object options
     * @param {number} [duration] - Custom duration (ms) - ignored if typeOrOptions is an object
     *
     * @example
     * // Appel positionnel
     * show("Message", "success", 3000);
     *
     * @example
     * // Appel avec options
     * show("Message", {
     *   type: "success",
     *   duration: 3000,
     *   persistent: false,      // Toast persistant (ne s'auto-dismiss pas)
     *   dismissible: true,      // Button de fermeture
     *   icon: "✓",             // Icon custome (futur)
     *   action: {               // Action button (futur)
     *     label: "Annuler",
     *     callback: () => {}
     *   }
     * });
     */
    show(message, typeOrOptions = "info", duration) {
        // Parser les arguments based on the signature
        let options = {};
        if (typeof typeOrOptions === "string") {
            // Signature positionnelle: show(message, type, duration)
            options = {
                type: typeOrOptions,
                duration: duration,
            };
        }
        else if (typeof typeOrOptions === "object" && typeOrOptions !== null) {
            // Signature object: show(message, options)
            options = typeOrOptions;
        }
        else {
            // Fallback by default
            options = { type: "info" };
        }
        // Addsr to the queue avec priority
        return this._enqueue(message, options);
    }
    /**
     * Displays une notification de success
     * Support double signature:
     * - success(message, duration)
     * - success(message, options)
     *
     * @param {string} message - Message to display
     * @param {number|Object} [durationOrOptions] - Duration (ms) OU object options
     *
     * @example
     * success("Save successful", 3000);
     * success("Save successful", { duration: 3000, persistent: false });
     */
    success(message, durationOrOptions) {
        if (typeof durationOrOptions === "number") {
            return this.show(message, "success", durationOrOptions);
        }
        else if (typeof durationOrOptions === "object") {
            return this.show(message, { ...durationOrOptions, type: "success" });
        }
        else {
            return this.show(message, "success");
        }
    }
    /**
     * Displays une notification d'error
     * Support double signature:
     * - error(message, duration)
     * - error(message, options)
     *
     * @param {string} message - Message to display
     * @param {number|Object} [durationOrOptions] - Duration (ms) OU object options
     *
     * @example
     * error("Error network", 5000);
     * error("Error network", { duration: 5000, persistent: true });
     */
    error(message, durationOrOptions) {
        if (typeof durationOrOptions === "number") {
            return this.show(message, "error", durationOrOptions);
        }
        else if (typeof durationOrOptions === "object") {
            return this.show(message, { ...durationOrOptions, type: "error" });
        }
        else {
            return this.show(message, "error");
        }
    }
    /**
     * Displays une notification d'warning
     * Support double signature:
     * - warning(message, duration)
     * - warning(message, options)
     *
     * @param {string} message - Message to display
     * @param {number|Object} [durationOrOptions] - Duration (ms) OU object options
     *
     * @example
     * warning("Connexion instable", 4000);
     * warning("Connexion instable", { duration: 4000 });
     */
    warning(message, durationOrOptions) {
        if (typeof durationOrOptions === "number") {
            return this.show(message, "warning", durationOrOptions);
        }
        else if (typeof durationOrOptions === "object") {
            return this.show(message, { ...durationOrOptions, type: "warning" });
        }
        else {
            return this.show(message, "warning");
        }
    }
    /**
     * Displays une notification d'information
     * Support double signature:
     * - info(message, duration)
     * - info(message, options)
     *
     * @param {string} message - Message to display
     * @param {number|Object} [durationOrOptions] - Duration (ms) OU object options
     *
     * @example
     * info("Synchronization en cours", 3000);
     * info("Synchronization en cours", { persistent: true, dismissible: false });
     */
    info(message, durationOrOptions) {
        if (typeof durationOrOptions === "number") {
            return this.show(message, "info", durationOrOptions);
        }
        else if (typeof durationOrOptions === "object") {
            return this.show(message, { ...durationOrOptions, type: "info" });
        }
        else {
            return this.show(message, "info");
        }
    }
    /**
     * Adds ae notification to the queue avec priority
     * @private
     * @param {string} message - Message
     * @param {Object} options - Options de la notification
     */
    _enqueue(message, options) {
        const type = (options.type ?? "info");
        const priority = PRIORITY[type.toUpperCase()] ?? PRIORITY.INFO;
        const item = {
            message,
            options: {
                type,
                duration: options.duration,
                persistent: options.persistent ?? false,
                dismissible: options.dismissible !== false, // true by default
                icon: options.icon,
                action: options.action,
            },
            priority,
            timestamp: Date.now(),
        };
        // Check la limite de la queue
        if (this._queue.length >= this._maxQueueSize) {
            // Find the lowest priority element (and oldest if tie)
            const lowestPriorityIndex = this._queue.reduce((minIdx, qItem, idx, arr) => {
                const minItem = arr[minIdx];
                if (qItem.priority < minItem.priority ||
                    (qItem.priority === minItem.priority && qItem.timestamp < minItem.timestamp)) {
                    return idx;
                }
                return minIdx;
            }, 0);
            // If the nouvel item est plus prioritaire que le moins prioritaire in the queue
            if (item.priority > this._queue[lowestPriorityIndex].priority) {
                // Removesr le moins prioritaire
                this._queue.splice(lowestPriorityIndex, 1);
                if (Log)
                    Log.warn("[GeoLeaf Notifications] Queue full, notification dropped");
            }
            else {
                // Dropper le nouveau item
                if (Log)
                    Log.warn("[GeoLeaf Notifications] Queue full, notification rejected");
                return null;
            }
        }
        // Addsr to the queue
        this._queue.push(item);
        // Trier la queue par priority (desc) puis timestamp (asc)
        this._queue.sort((a, b) => {
            if (b.priority !== a.priority) {
                return b.priority - a.priority; // Descending priority
            }
            return a.timestamp - b.timestamp; // Timestamp croissant (FIFO pour same priority)
        });
        // Processesr la queue
        return this._processQueue();
    }
    _makeSpaceForPriority(nextItem, temporaryToasts) {
        if (nextItem.priority === PRIORITY.ERROR && temporaryToasts.length > 0) {
            const toastToRemove = temporaryToasts.find((t) => t.classList.contains("gl-toast--info") ||
                t.classList.contains("gl-toast--success")) || temporaryToasts[0];
            this._remove(toastToRemove, true);
            return true; // space was made, continue
        }
        return false; // no space could be made
    }
    /**
     * Processes the queue and displays notifications based on availability
     * @private
     */
    _processQueue() {
        if (!this.container || !this.config.enabled || this._queue.length === 0) {
            return null;
        }
        // Compter les toasts currentlement visibles
        const visibleToasts = this.container.querySelectorAll(".gl-toast:not(.gl-toast--removing)");
        const temporaryToasts = Array.from(visibleToasts).filter((t) => !t.dataset.persistent);
        const persistentToasts = Array.from(visibleToasts).filter((t) => t.dataset.persistent);
        // Tant qu'il y a de la place et des items in the queue
        let lastToast = null;
        while (this._queue.length > 0) {
            const nextItem = this._queue[0];
            const isPersistent = nextItem.options.persistent;
            // Check si on peut display ce toast
            const canShow = isPersistent
                ? persistentToasts.length < this.maxPersistent
                : temporaryToasts.length < this.maxVisible;
            if (!canShow) {
                // If priority toast, try to make room; otherwise stop processing
                if (!this._makeSpaceForPriority(nextItem, temporaryToasts)) {
                    break;
                }
            }
            // Retirer de la queue et display
            const item = this._queue.shift();
            lastToast = this._showImmediate(item.message, item.options);
            // Mettre up to date les compteurs
            if (isPersistent) {
                persistentToasts.push(lastToast);
            }
            else {
                temporaryToasts.push(lastToast);
            }
        }
        return lastToast;
    }
    /**
     * Displays une notification immediately (used par la queue)
     * @private
     * @param {string} message - Message to display
     * @param {Object} options - Options de la notification
     */
    _showImmediate(message, options) {
        const type = options.type;
        const duration = options.duration ?? this.durations[type];
        const persistent = !!options.persistent;
        const dismissible = options.dismissible !== false;
        // Createsr le toast
        const toast = createElement("div", {
            className: `gl-toast gl-toast--${type}`,
            attributes: {
                role: "alert",
                // Utiliser assertive pour errors
                "aria-live": type === "error" ? "assertive" : "polite",
            },
        });
        // Marquer si persistant
        if (persistent) {
            toast.dataset.persistent = "true";
        }
        // Creates the message (textContent = secure)
        const messageSpan = createElement("span", {
            className: "gl-toast__message",
            textContent: message,
        });
        toast.appendChild(messageSpan);
        if (dismissible)
            this._appendCloseButton(toast);
        // Addsr au DOM
        this.container.appendChild(toast);
        // Animation d'input
        if (this.config.animations) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toast.classList.add("gl-toast--visible");
                });
            });
        }
        else {
            toast.classList.add("gl-toast--visible");
        }
        // Planifier l'auto-removal (only si non persistant)
        // Perf 6.2.6: Un seul timer — timerManager si available, sinon setTimeout nu
        if (!persistent) {
            if (this._timerManager) {
                toast.dataset.timerId = String(this._timerManager.setTimeout(() => {
                    this._remove(toast, false);
                }, duration));
            }
            else {
                const autoRemove = setTimeout(() => {
                    this._remove(toast, false);
                }, duration);
                toast.dataset.timeoutId = String(autoRemove);
            }
        }
        return toast;
    }
    _appendCloseButton(toast) {
        const closeBtn = createElement("button", {
            className: "gl-toast__close",
            attributes: {
                "aria-label": getLabel("aria.notification.close_label"),
                title: getLabel("aria.notification.close_title"),
            },
            textContent: getLabel("ui.notification.close_char"),
            onClick: () => {
                this._remove(toast, false);
            },
        });
        toast.appendChild(closeBtn);
    }
    /**
     * Retire une notification
     * @private
     * @param {HTMLElement} toast - Element toast to retirer
     * @param {boolean} isReorganization - If true, this is a reorganization (different animation)
     */
    _remove(toast, isReorganization = false) {
        if (!toast || toast.classList.contains("gl-toast--removing")) {
            return;
        }
        // Annuler le timeout auto si fermeture manuelle
        if (toast.dataset.timeoutId) {
            clearTimeout(Number.parseInt(toast.dataset.timeoutId, 10));
            delete toast.dataset.timeoutId;
        }
        if (toast.dataset.timerId && this._timerManager) {
            this._timerManager.clearTimeout(Number.parseInt(toast.dataset.timerId, 10));
            delete toast.dataset.timerId;
        }
        // Animation de output
        toast.classList.add("gl-toast--removing");
        toast.classList.remove("gl-toast--visible");
        // Applies specific animation for reorganization
        if (isReorganization && this.config.animations) {
            toast.classList.add("gl-toast--sliding-up");
        }
        const removeDelay = this.config.animations ? 200 : 0;
        // Perf 6.2.6: Un seul timer — timerManager si available, sinon setTimeout nu
        const _doRemove = () => {
            if (toast.parentNode) {
                toast.remove();
            }
            this._processQueue();
        };
        if (this._timerManager) {
            this._timerManager.setTimeout(_doRemove, removeDelay);
        }
        else {
            setTimeout(_doRemove, removeDelay);
        }
    }
    /**
     * Efface toutes les notifications
     */
    clearAll() {
        if (!this.container)
            return;
        const toasts = this.container.querySelectorAll(".gl-toast");
        toasts.forEach((toast) => this._remove(toast, false));
        // Emptyr aussi la queue
        this._queue = [];
    }
    /**
     * Ferme une notification specific par sa reference DOM
     * @param {HTMLElement} toastEl - Toast element returned by show/info/success/etc.
     */
    dismiss(toastEl) {
        if (!toastEl)
            return;
        this._remove(toastEl, false);
    }
    /**
     * Temporarily disables notifications
     */
    disable() {
        this.config.enabled = false;
        if (Log)
            Log.debug("[GeoLeaf Notifications] System disabled");
    }
    /**
     * Re-enables notifications
     */
    enable() {
        this.config.enabled = true;
        if (Log)
            Log.debug("[GeoLeaf Notifications] System enabled");
        // Processes the queue in case items are waiting
        this._processQueue();
    }
    /**
     * Destroyed the system de notifications et nettoie toutes les ressources
     * Retire tous les event listners et timers actives
     */
    destroy() {
        // Clear tous les timers actives
        if (this._timerManager) {
            this._timerManager.destroy();
            this._timerManager = null;
        }
        // Retire tous les event listners
        if (this._eventManager) {
            this._eventManager.destroy();
            this._eventManager = null;
        }
        // Retire tous les toasts actives
        if (this.container) {
            const toasts = this.container.querySelectorAll(".gl-toast");
            toasts.forEach((toast) => toast.remove());
        }
        // Clear la queue
        this._queue = [];
        // Clear la map
        this._activeToasts.clear();
        // Reset les properties
        this.container = null;
        this.config.enabled = false;
        if (Log)
            Log.info("[GeoLeaf Notifications] System destroyed and cleaned up");
    }
    /**
     * Get current status of notification system
     * @returns {Object} Status information
     */
    getStatus() {
        const visibleToasts = this.container
            ? Array.from(this.container.querySelectorAll(".gl-toast:not(.gl-toast--removing)"))
            : [];
        const temporaryToasts = visibleToasts.filter((t) => !t.dataset.persistent);
        const persistentToasts = visibleToasts.filter((t) => t.dataset.persistent);
        return {
            enabled: this.config.enabled,
            initialized: !!this.container,
            activeToasts: visibleToasts.length,
            temporaryToasts: temporaryToasts.length,
            persistentToasts: persistentToasts.length,
            queued: this._queue.length,
            maxVisible: this.maxVisible,
            maxPersistent: this.maxPersistent,
            position: this.config.position,
        };
    }
}
// Createsr an instance singleton et l'exposer
const _UINotifications = new NotificationSystem();

/**
 * @module ui/geolocation-state
 * @description ESM singleton store for geolocation UI state — Phase 10-B Pattern D
 *
 * ESM singleton replacing the mutable UI properties _geolocationActive / _geolocationWatchId /
 * _userPosition / _userPositionAccuracy.
 *
 * All reads and writes go through this module: consumers import GeoLocationState
 * and access/mutate its properties directly.
 *
 * The globals bridge (geoleaf.ui.js) keeps the UMD / CDN namespace aliases
 * in sync with this ESM singleton.
 *
 * @example
 * import { GeoLocationState } from '../geolocation-state.js';
 *
 * // Read
 * if (GeoLocationState.active) { ... }
 *
 * // Write
 * GeoLocationState.active = true;
 * GeoLocationState.watchId = navigator.geolocation.watchPosition(onSuccess, onError);
 * GeoLocationState.userPosition = { lat, lng, timestamp: Date.now(), accuracy };
 */
/**
 * Mutable singleton holding geolocation tracking state.
 */
const GeoLocationState = {
    /** Whether the geolocation watch is currently active */
    active: false,
    /** ID returned by navigator.geolocation.watchPosition(), or null */
    watchId: null,
    /** Last known user position, or null if geolocation has never succeeded. */
    userPosition: null,
    /** Last known accuracy in metres, or null */
    userPositionAccuracy: null,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI - Geolocation Control
 * Engine-agnostic geolocation control (no Leaflet dependency).
 * Centers the map on the user's GPS position.
 *
 * @module ui/control-geolocation
 */
// ── Marker / layer IDs ──────────────────────────────────────────────────────
const MARKER_ID$1 = "gl-geoloc-user";
const ACCURACY_LAYER_ID = "gl-geoloc-accuracy";
// ── Internal helpers ────────────────────────────────────────────────────────
function _checkRecenterVisibility(map, geoState) {
    if (!geoState.recenterBtn || !GeoLocationState.userPosition)
        return;
    const mapCenter = map.getCenter();
    const dist = haversineDistance(mapCenter, GeoLocationState.userPosition);
    geoState.recenterBtn.classList.toggle("gl-is-visible", dist > 50);
}
function _stopGeolocation(map, link, geoState, onMoveEnd) {
    if (GeoLocationState.watchId !== null) {
        navigator.geolocation.clearWatch(GeoLocationState.watchId);
        GeoLocationState.watchId = null;
    }
    if (geoState.hasMarker) {
        map.removeMarker(MARKER_ID$1);
        geoState.hasMarker = false;
    }
    if (geoState.hasAccuracyLayer) {
        map.removeLayer(ACCURACY_LAYER_ID);
        geoState.hasAccuracyLayer = false;
    }
    GeoLocationState.active = false;
    GeoLocationState.userPosition = null;
    link.classList.remove("gl-is-active");
    link.classList.remove("gl-is-locating");
    if (geoState.pendingGeolocToast && _UINotifications?.dismiss) {
        _UINotifications.dismiss(geoState.pendingGeolocToast);
        geoState.pendingGeolocToast = null;
    }
    if (geoState.recenterBtn) {
        map.off("moveend", onMoveEnd);
        if (geoState.recenterBtn.parentNode)
            geoState.recenterBtn.remove();
        geoState.recenterBtn = null;
    }
    map.getContainer().dispatchEvent(new CustomEvent("gl:geoloc:statechange", { detail: { active: false }, bubbles: true }));
    Log?.info("[UI.Controls] Geolocation disabled");
}
function _createRecenterButton(map, geoState) {
    if (geoState.recenterBtn)
        return;
    const btn = document.createElement("button");
    btn.id = "gl-recenter-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", getLabel("aria.geoloc.recenter"));
    btn.title = getLabel("aria.geoloc.recenter");
    const svg = DOMSecurity.createSVGIcon(20, 20, "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z", { stroke: "none", fill: "currentColor" });
    btn.appendChild(svg);
    btn.addEventListener("click", () => {
        if (GeoLocationState.userPosition) {
            map.setView({ lat: GeoLocationState.userPosition.lat, lng: GeoLocationState.userPosition.lng }, map.getZoom());
        }
    });
    map.getContainer().appendChild(btn);
    geoState.recenterBtn = btn;
}
function _updateGeoMarkers(map, geoState, lat, lng, accuracy) {
    // Remove previous marker / accuracy layer
    if (geoState.hasMarker)
        map.removeMarker(MARKER_ID$1);
    if (geoState.hasAccuracyLayer)
        map.removeLayer(ACCURACY_LAYER_ID);
    // User position marker (DOM-based via adapter)
    // SAFE: icon HTML is static hardcoded string
    map.createMarker(MARKER_ID$1, { lat, lng }, {
        icon: '<div class="gl-user-location-dot gl-user-location-dot--active"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        className: "gl-user-location-marker gl-user-location-marker--active",
    });
    geoState.hasMarker = true;
    // Accuracy circle (GeoJSON layer with circle-type paint)
    if (accuracy && accuracy < 1000) {
        const circleGeoJSON = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [lng, lat] },
                    properties: { radius: accuracy },
                },
            ],
        };
        const interactiveShapes = Config$3.get("ui.interactiveShapes", false);
        map.addGeoJSONLayer(ACCURACY_LAYER_ID, circleGeoJSON, {
            fillColor: "#4285F4",
            fillOpacity: 0.1,
            color: "#4285F4",
            opacity: 0.3,
            weight: 1,
            interactive: interactiveShapes,
            className: "gl-user-location-accuracy",
        });
        geoState.hasAccuracyLayer = true;
    }
}
function _onGeoPositionSuccess(position, map, link, geoState, onMoveEnd) {
    const { latitude, longitude, accuracy } = position.coords;
    if (!GeoLocationState.active) {
        map.setView({ lat: latitude, lng: longitude }, 16);
    }
    _updateGeoMarkers(map, geoState, latitude, longitude, accuracy);
    const _isFirstFix = !GeoLocationState.active;
    GeoLocationState.active = true;
    link.classList.remove("gl-is-locating");
    link.classList.add("gl-is-active");
    GeoLocationState.userPosition = {
        lat: latitude,
        lng: longitude,
        accuracy,
        timestamp: Date.now(),
    };
    if (_isFirstFix) {
        if (geoState.pendingGeolocToast && _UINotifications?.dismiss) {
            _UINotifications.dismiss(geoState.pendingGeolocToast);
            geoState.pendingGeolocToast = null;
        }
        if (_UINotifications?.success)
            _UINotifications.success(getLabel("toast.geoloc.position_found"), 2500);
        map.on("moveend", onMoveEnd);
        map.getContainer().dispatchEvent(new CustomEvent("gl:geoloc:statechange", { detail: { active: true }, bubbles: true }));
    }
    else {
        _checkRecenterVisibility(map, geoState);
    }
    Log?.debug("[UI.Controls] Position GPS mise a jour:", latitude, longitude);
}
function _onGeoPositionError(error, link, geoState) {
    link.classList.remove("gl-is-locating");
    link.classList.remove("gl-is-active");
    GeoLocationState.active = false;
    if (geoState.pendingGeolocToast && _UINotifications?.dismiss) {
        _UINotifications.dismiss(geoState.pendingGeolocToast);
        geoState.pendingGeolocToast = null;
    }
    let errorMessage = getLabel("toast.geoloc.error.default");
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = getLabel("toast.geoloc.error.permission_denied");
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = getLabel("toast.geoloc.error.position_unavailable");
            break;
        case error.TIMEOUT:
            errorMessage = getLabel("toast.geoloc.error.timeout");
            break;
    }
    if (Log)
        Log.error("[UI.Controls] Geolocation error:", error);
    if (_UINotifications && typeof _UINotifications.error === "function") {
        _UINotifications.error(errorMessage);
    }
    else {
        Log.warn("[UI.Controls] " + errorMessage);
    }
}
function _makeToggleGeolocation(map, link, geoState, onMoveEnd) {
    return (e) => {
        e.preventDefault();
        if (GeoLocationState.active) {
            _stopGeolocation(map, link, geoState, onMoveEnd);
            return;
        }
        link.classList.add("gl-is-locating");
        if (_UINotifications?.info) {
            geoState.pendingGeolocToast = _UINotifications.info(getLabel("toast.geoloc.locating"), {
                persistent: true,
                dismissible: false,
            });
        }
        _createRecenterButton(map, geoState);
        GeoLocationState.watchId = navigator.geolocation.watchPosition((pos) => _onGeoPositionSuccess(pos, map, link, geoState, onMoveEnd), (err) => _onGeoPositionError(err, link, geoState), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    };
}
/**
 * Builds the geolocation control DOM and wires event listeners.
 *
 * @returns The control container element plus a destroy() teardown function.
 */
function _buildGeolocationControl(map, geoState, onMoveEnd) {
    const cleanups = [];
    const container = domCreate("div", "geoleaf-ctrl-geolocation geoleaf-ctrl-group geoleaf-ctrl");
    const link = domCreate("a", "", container);
    link.href = "#";
    link.title = getLabel("aria.geoloc.toggle");
    link.setAttribute("role", "button");
    link.setAttribute("aria-label", getLabel("aria.geoloc.toggle_label"));
    // SAFE: SVG static hardcode
    const geoSvg = DOMSecurity.createSVGIcon(18, 18, "M12 2 C 6.5 2 2 6.5 2 12 C 2 17.5 6.5 22 12 22 C 17.5 22 22 17.5 22 12 C 22 6.5 17.5 2 12 2 M12 9 C 10.3 9 9 10.3 9 12 C 9 13.7 10.3 15 12 15 C 13.7 15 15 13.7 15 12 C 15 10.3 13.7 9 12 9", { stroke: "currentColor", strokeWidth: "2", fill: "none" });
    link.appendChild(geoSvg);
    blockMapPropagation(container, cleanups);
    const toggleGeolocation = _makeToggleGeolocation(map, link, geoState, onMoveEnd);
    const keydownHandler = (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar")
            toggleGeolocation(e);
    };
    link.addEventListener("click", toggleGeolocation);
    link.addEventListener("keydown", keydownHandler);
    // Teardown function — removes all listeners and cleans up map layers
    const destroy = () => {
        link.removeEventListener("click", toggleGeolocation);
        link.removeEventListener("keydown", keydownHandler);
        for (const fn of cleanups)
            fn();
        cleanups.length = 0;
        if (geoState.hasMarker) {
            map.removeMarker(MARKER_ID$1);
            geoState.hasMarker = false;
        }
        if (geoState.hasAccuracyLayer) {
            map.removeLayer(ACCURACY_LAYER_ID);
            geoState.hasAccuracyLayer = false;
        }
    };
    return { container, link, destroy };
}
/**
 * Geolocation management — centers the map on the user's GPS position.
 *
 * @param map    - IMapAdapter instance (engine-agnostic).
 * @param config - Configuration object (requires `ui.showGeolocation`).
 * @returns A destroy function that removes the control and all listeners,
 *          or undefined if initialisation was skipped.
 */
function initGeolocationControl(map, config) {
    if (!map) {
        Log?.warn("[UI.Controls] initGeolocationControl: carte manquante");
        return;
    }
    if (!config?.ui?.showGeolocation && !config?.ui?.enableGeolocation) {
        Log?.info("[UI.Controls] Geolocation disabled in configuration");
        return;
    }
    if (!navigator.geolocation) {
        Log?.warn("[UI.Controls] Geolocation is not supported by this browser");
        return;
    }
    const geoState = {
        hasMarker: false,
        hasAccuracyLayer: false,
        pendingGeolocToast: null,
        recenterBtn: null,
    };
    const onMoveEnd = () => _checkRecenterVisibility(map, geoState);
    const { container, link, destroy } = _buildGeolocationControl(map, geoState, onMoveEnd);
    const controlHandle = map.addControl(container, "topleft");
    // Wrap destroy to also remove control from the map
    const fullDestroy = () => {
        _stopGeolocation(map, link, geoState, onMoveEnd);
        destroy();
        controlHandle.remove();
    };
    if (Log)
        Log.info("[UI.Controls] Geolocation control added to map");
    return fullDestroy;
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI Module - Theme Management
 * Gestion of the theme dark/light avec persistance localStorage
 */
// ========================================
//   CONSTANTES
// ========================================
const THEME_KEY = "geoleaf_theme";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
// ========================================
//   STATE INTERNE
// ========================================
/**
 * Single source of truth for the current theme
 * @type {string|null}
 * @private
 */
let _currentTheme = null;
/** Cleanup function for the active matchMedia listener (auto mode only). */
let _matchMediaUnsubscribe = null;
// ========================================
//   FONCTIONS PUBLIQUES
// ========================================
/**
 * Returns the theme current ("light" ou "dark").
 * @returns {string} Theme current
 */
function getCurrentTheme() {
    // Si already en memory, returnner directly
    if (_currentTheme) {
        return _currentTheme;
    }
    // Sinon, fallback sur le DOM
    if (document.body.classList.contains("gl-theme-dark")) {
        _currentTheme = THEME_DARK;
        return THEME_DARK;
    }
    if (document.body.classList.contains("gl-theme-light")) {
        _currentTheme = THEME_LIGHT;
        return THEME_LIGHT;
    }
    // Fallback final
    _currentTheme = THEME_DARK;
    return THEME_DARK;
}
/**
 * Applies a theme au <body> et synchronise le button.
 * @param {string} theme - "light" ou "dark"
 * @param {boolean} [persist=true] - Write to localStorage. Pass false for auto-detect (system preference).
 */
function applyTheme(theme, persist = true) {
    const normalized = theme === THEME_LIGHT || theme === THEME_DARK ? theme : THEME_DARK;
    Log.debug("[UI.Theme] applyTheme:", theme, "→", normalized, persist ? "(persisted)" : "(no-persist)");
    // Mettre up to date the state centralized AVANT le DOM
    _currentTheme = normalized;
    // Update du DOM sur body
    document.body.classList.remove("gl-theme-light", "gl-theme-dark");
    document.body.classList.add(normalized === THEME_DARK ? "gl-theme-dark" : "gl-theme-light");
    // Appliesr aussi the theme au conteneur de carte (pour support fullscreen)
    const mapContainer = document.getElementById("geoleaf-map");
    if (mapContainer) {
        mapContainer.classList.remove("gl-theme-light", "gl-theme-dark");
        mapContainer.classList.add(normalized === THEME_DARK ? "gl-theme-dark" : "gl-theme-light");
    }
    // Sauvegarde locale (uniquement si persist demandé)
    if (persist) {
        try {
            localStorage.setItem(THEME_KEY, normalized);
        }
        catch (_e) {
            // Handle explicitement l'absence de localStorage
            if (Log)
                Log.warn("[UI.Theme] localStorage not available, theme not persisted.");
        }
    }
    // Synchronise le button si present
    updateToggleButton(normalized);
    // Global event for other modules
    if (globalThis.dispatchEvent) {
        globalThis.dispatchEvent(new CustomEvent("geoleaf:ui-theme-changed", {
            detail: { theme: normalized },
        }));
    }
}
// ========================================
//   AUTO-THEME (prefers-color-scheme)
// ========================================
/**
 * Reads the OS/browser color scheme preference.
 * @returns {string} "dark" or "light"
 * @private
 */
function _detectSystemTheme() {
    try {
        const mm = typeof globalThis !== "undefined" &&
            typeof globalThis.matchMedia === "function"
            ? globalThis.matchMedia
            : null;
        if (mm?.("(prefers-color-scheme: dark)")?.matches) {
            return THEME_DARK;
        }
    }
    catch (_e) {
        // matchMedia not available (e.g. SSR or old browser) — fall through
    }
    return THEME_LIGHT;
}
/**
 * Registers a matchMedia listener that tracks OS theme changes in auto mode.
 * The listener is a no-op when the user has set a manual override in localStorage.
 * @private
 */
function _setupMatchMediaListener() {
    // Remove any existing listener before registering a new one
    if (_matchMediaUnsubscribe) {
        _matchMediaUnsubscribe();
        _matchMediaUnsubscribe = null;
    }
    const mm = typeof globalThis !== "undefined" &&
        typeof globalThis.matchMedia === "function"
        ? globalThis.matchMedia
        : null;
    if (!mm)
        return;
    const mq = mm("(prefers-color-scheme: dark)");
    const handler = (e) => {
        // Skip if the user has manually overridden the theme
        let override = null;
        try {
            override = localStorage.getItem(THEME_KEY);
        }
        catch (_e) {
            /* ignore */
        }
        if (override === THEME_LIGHT || override === THEME_DARK) {
            Log.debug("[UI.Theme] matchMedia change ignored — user override:", override);
            return;
        }
        Log.debug("[UI.Theme] matchMedia change →", e.matches ? THEME_DARK : THEME_LIGHT);
        applyTheme(e.matches ? THEME_DARK : THEME_LIGHT, false);
    };
    mq.addEventListener("change", handler);
    _matchMediaUnsubscribe = () => mq.removeEventListener("change", handler);
}
/**
 * Initialises the theme according to the profile config value.
 *
 * - `"auto"` (default): detects `prefers-color-scheme` when no localStorage override is
 *   present; installs a live listener for OS theme changes. Does not write to localStorage,
 *   so the system preference is re-evaluated on each page load.
 * - `"light"` / `"dark"`: applies the configured theme explicitly (persisted).
 *
 * Must be called **before** `initThemeToggle` so the resolved theme is already on the
 * DOM when the toggle button syncs its visual state.
 *
 * @param {string} [themeConfig="auto"] - Value from profile `ui.theme`
 */
function initAutoTheme(themeConfig = "auto") {
    const cfg = (themeConfig || "auto").trim().toLowerCase();
    if (cfg !== "auto") {
        // Explicit theme from profile — apply and persist
        const normalized = cfg === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
        Log.debug("[UI.Theme] initAutoTheme: explicit theme →", normalized);
        applyTheme(normalized);
        return;
    }
    // Auto mode: honour existing user override
    let userOverride = null;
    try {
        userOverride = localStorage.getItem(THEME_KEY);
    }
    catch (_e) {
        userOverride = null;
    }
    if (userOverride === THEME_LIGHT || userOverride === THEME_DARK) {
        Log.debug("[UI.Theme] initAutoTheme: user override →", userOverride);
        // Apply without touching localStorage; initThemeToggle will handle the rest
        applyTheme(userOverride, false);
        // Still register live listener in case the user clears their override later
        _setupMatchMediaListener();
        return;
    }
    // No override — detect and apply system preference without persisting
    const detected = _detectSystemTheme();
    Log.debug("[UI.Theme] initAutoTheme: system detected →", detected);
    applyTheme(detected, false);
    _setupMatchMediaListener();
}
/**
 * Switches the theme current (light <-> dark).
 */
function toggleTheme() {
    const current = getCurrentTheme();
    const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    Log.debug("[UI.Theme] toggleTheme:", current, "→", next);
    applyTheme(next);
}
/**
 * Determines the theme initial :
 * 1) localStorage si available
 * 2) class du <body> si already defined
 * 3) sinon, "dark"
 * @returns {string} Theme initial
 * @private
 */
function resolveInitialTheme() {
    let stored = null;
    try {
        stored = localStorage.getItem(THEME_KEY);
    }
    catch (_e) {
        stored = null;
    }
    if (stored === THEME_LIGHT || stored === THEME_DARK) {
        return stored;
    }
    const bodyTheme = getCurrentTheme();
    if (bodyTheme === THEME_LIGHT || bodyTheme === THEME_DARK) {
        return bodyTheme;
    }
    return THEME_DARK;
}
/**
 * Retrieves the button de theme in the DOM.
 * Par convention on utilise l'attribut data-gl-role="theme-toggle".
 * @returns {HTMLElement|null}
 * @private
 */
function getToggleButton() {
    return document.querySelector('[data-gl-role="theme-toggle"]');
}
/**
 * Updates the state visuel/ARIA du button de theme.
 * @param {string} theme - "light" ou "dark"
 * @private
 */
function updateToggleButton(theme, overrideBtn) {
    const btn = overrideBtn === undefined ? getToggleButton() : overrideBtn;
    if (!btn)
        return;
    const isDark = theme === THEME_DARK;
    btn.setAttribute("data-gl-theme-state", isDark ? "dark" : "light");
    btn.setAttribute("aria-pressed", String(isDark));
    btn.setAttribute("aria-label", isDark ? getLabel("aria.theme.toggle_to_light") : getLabel("aria.theme.toggle_to_dark"));
    btn.title = isDark
        ? getLabel("aria.theme.toggle_to_light")
        : getLabel("aria.theme.toggle_to_dark");
}
/**
 * Initializes the gestion du button de theme.
 * @param {object} [options] - Options de configuration
 * @param {string} [options.buttonSelector] - Selector custom du button
 * @param {boolean} [options.autoInitOnDomReady] - Si true, attend DOMContentLoaded
 */
function initThemeToggle(options = {}) {
    const cfg = {
        buttonSelector: options.buttonSelector || '[data-gl-role="theme-toggle"]',
        autoInitOnDomReady: typeof options.autoInitOnDomReady === "boolean" ? options.autoInitOnDomReady : false,
    };
    const doInit = () => {
        const initialTheme = resolveInitialTheme();
        Log.debug("[UI.Theme] initThemeToggle:", initialTheme);
        applyTheme(initialTheme);
        const btn = document.querySelector(cfg.buttonSelector);
        if (!btn) {
            Log.debug("[UI.Theme] Theme button not found:", cfg.buttonSelector);
            return;
        }
        Log.debug("[UI.Theme] Theme button found");
        // Accessibility: native <button> or role "button"
        const tag = (btn.tagName || "").toLowerCase();
        if (tag === "button") {
            try {
                btn.type = btn.type || "button";
            }
            catch (_e) {
                // Certains elements custom peuvent lever une error
            }
        }
        else {
            btn.setAttribute("role", "button");
            btn.setAttribute("tabindex", "0");
        }
        // First sync of visual state
        updateToggleButton(initialTheme, btn);
        // Click souris
        btn.addEventListener("click", (evt) => {
            evt.preventDefault();
            toggleTheme();
        });
        // Clavier (Enter / Space)
        btn.addEventListener("keydown", (evt) => {
            if (evt.key === "Enter" || evt.key === " " || evt.key === "Spacebar") {
                evt.preventDefault();
                toggleTheme();
            }
        });
    };
    if (cfg.autoInitOnDomReady) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", doInit, { once: true });
        }
        else {
            doInit();
        }
    }
    else {
        doInit();
    }
}
// ========================================
//   EXPORT
// ========================================
const _UITheme = {
    initThemeToggle,
    initAutoTheme,
    toggleTheme,
    applyTheme,
    getCurrentTheme,
    // Constantes exposées
    THEME_LIGHT,
    THEME_DARK,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI - Theme Toggle Control
 * Adapter-agnostic control for switching between light and dark themes.
 * Activates when `ui.showThemeToggle: true` in the profile config.
 *
 * @module ui/control-theme-toggle
 */
// SVG path — sun icon (light mode indicator)
const SVG_SUN = "M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M3 12h1m16 0h1M4.92 19.07l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z";
// SVG path — crescent moon icon (dark mode indicator)
const SVG_MOON = "M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z";
/**
 * Internal state for the theme toggle control, allowing cleanup on destroy.
 */
let _controlHandle = null;
let _cleanups = [];
function _syncState(theme, link, svgSun, svgMoon) {
    const isDark = theme === _UITheme.THEME_DARK;
    // Sun is shown when dark (click → switch to light); moon when light (click → switch to dark)
    svgSun.style.display = isDark ? "block" : "none";
    svgMoon.style.display = isDark ? "none" : "block";
    const ariaLabel = isDark
        ? getLabel("aria.theme.toggle_to_light")
        : getLabel("aria.theme.toggle_to_dark");
    link.title = ariaLabel;
    link.setAttribute("aria-label", ariaLabel);
    link.setAttribute("aria-pressed", String(isDark));
}
function _buildThemeIcons(link) {
    // SAFE: SVG paths are static hardcoded strings
    const opts = { stroke: "currentColor", strokeWidth: "2", fill: "none" };
    const svgSun = DOMSecurity.createSVGIcon(18, 18, SVG_SUN, opts);
    svgSun.classList.add("gl-theme-toggle-icon--sun");
    const svgMoon = DOMSecurity.createSVGIcon(18, 18, SVG_MOON, opts);
    svgMoon.classList.add("gl-theme-toggle-icon--moon");
    link.appendChild(svgSun);
    link.appendChild(svgMoon);
    return { svgSun, svgMoon };
}
function _buildThemeToggleOnAdd(cleanups) {
    const container = domCreate("div", "geoleaf-ctrl-theme-toggle geoleaf-ctrl-group geoleaf-ctrl");
    const link = domCreate("a", "", container);
    link.href = "#";
    link.setAttribute("role", "button");
    const { svgSun, svgMoon } = _buildThemeIcons(link);
    _syncState(_UITheme.getCurrentTheme(), link, svgSun, svgMoon);
    blockMapPropagation(container, cleanups);
    // Toggle on click/keyboard
    const toggleHandler = (e) => {
        e.preventDefault();
        _UITheme.toggleTheme();
    };
    const keydownHandler = (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar")
            toggleHandler(e);
    };
    link.addEventListener("click", toggleHandler);
    link.addEventListener("keydown", keydownHandler);
    cleanups.push(() => link.removeEventListener("click", toggleHandler), () => link.removeEventListener("keydown", keydownHandler));
    // React to theme changes from any source (auto-detect, toggleTheme, applyTheme)
    const themeChangedHandler = (e) => {
        const theme = e.detail?.theme || _UITheme.getCurrentTheme();
        _syncState(theme, link, svgSun, svgMoon);
    };
    if (globalThis.addEventListener) {
        globalThis.addEventListener("geoleaf:ui-theme-changed", themeChangedHandler);
        cleanups.push(() => globalThis.removeEventListener("geoleaf:ui-theme-changed", themeChangedHandler));
    }
    return container;
}
/**
 * Adds a light/dark theme toggle button to the map.
 * Activated when the profile sets `ui.showThemeToggle: true`.
 *
 * @param map - Map adapter instance.
 * @returns A destroy function to remove the control and clean up listeners,
 *          or `undefined` if the control could not be created.
 */
function initThemeToggleControl(map) {
    if (!map) {
        if (Log)
            Log.warn("[UI.Controls] initThemeToggleControl: map missing");
        return;
    }
    // Clean up any previous instance
    _destroyThemeToggleControl();
    _cleanups = [];
    const container = _buildThemeToggleOnAdd(_cleanups);
    _controlHandle = map.addControl(container, "topleft");
    if (Log)
        Log.info("[UI.Controls] Theme toggle control added to map");
    return _destroyThemeToggleControl;
}
/**
 * Removes the theme toggle control from the map and cleans up all listeners.
 */
function _destroyThemeToggleControl() {
    // Run all event listener cleanups
    for (const fn of _cleanups)
        fn();
    _cleanups = [];
    // Remove control from the map
    _controlHandle?.remove();
    _controlHandle = null;
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI - Controls
 * Barrel index des contrôles UI.
 * Chaque contrôle est défini dans son propre module.
 *
 * @module ui/controls
 */
const _UIControls = {
    initFullscreenControl,
    initGeolocationControl,
    initThemeToggleControl,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * Context for the logs
 * @const
 */
const CONTEXT = "[GeoLeaf.UI.CoordinatesDisplay]";
/**
 * Default text for coordinates
 * @const
 */
const DEFAULT_COORDS_TEXT = "Lat: --, Lng: --";
/**
 * Module GeoLeaf.UI.CoordinatesDisplay
 *
 * Role:
 * - Displays the cursor coordinates in real time
 * - Positions the control at the bottom left next to the legend
 * - Allows activation/deactivation via configuration
 */
const CoordinatesDisplay = {
    /**
     * Reference to the map adapter instance.
     * @type {IMapAdapter|null}
     * @private
     */
    _map: null,
    /**
     * Handle returned by map.addControl(), used for removal.
     * @type {{ remove(): void }|null}
     * @private
     */
    _controlHandle: null,
    /**
     * Element DOM for displaying coordinates.
     * @type {HTMLElement|null}
     * @private
     */
    _coordsElement: null,
    /**
     * Bound reference to the mousemove listener (so it can be removed).
     * @type {Function|null}
     * @private
     */
    _boundMouseMoveHandler: null,
    /**
     * Cleanup functions for event listeners.
     * @type {(() => void)[]}
     * @private
     */
    _cleanups: [],
    /**
     * Options of the module.
     * @type {Object}
     * @private
     */
    _options: {
        position: "bottomleft",
        decimals: 6,
    },
    /**
     * Initializes the coordinates module.
     * @param {any} map - Map adapter instance
     * @param {Object} options - Configuration options
     */
    init(map, options = {}) {
        try {
            if (!map) {
                throw new Error("A map instance is required.");
            }
            this._map = map;
            this._options = { ...this._options, ...options };
            // Check if the module is enabled in the config
            const showCoordinates = Config$3?.get("ui.showCoordinates");
            if (showCoordinates === false) {
                Log.info(`${CONTEXT} Coordinate display disabled in configuration.`);
                return;
            }
            // Store the bound reference of the listener
            this._boundMouseMoveHandler = this._onMouseMove.bind(this);
            // Create the control
            this._createControl();
            Log.info(`${CONTEXT} Module initialized successfully.`);
        }
        catch (err) {
            Log.error(`${CONTEXT} Error during initialization:`, err.message);
        }
    },
    /**
     * Creates the control for displaying coordinates.
     * @private
     */
    _createControl() {
        try {
            // Perf 6.2.4: MutationObserver instead of setTimeout(100) for robustness
            // Wait for .gl-scale-main-wrapper to appear in DOM without a fixed delay
            const scaleWrapper = document.querySelector(".gl-scale-main-wrapper");
            if (scaleWrapper) {
                this._attachToScaleWrapper(scaleWrapper);
            }
            else {
                // Wrapper not yet in DOM: observe body until it appears
                const observer = new MutationObserver((_mutations, obs) => {
                    const el = document.querySelector(".gl-scale-main-wrapper");
                    if (el) {
                        obs.disconnect();
                        this._attachToScaleWrapper(el);
                    }
                });
                observer.observe(document.body || document.documentElement, {
                    childList: true,
                    subtree: true,
                });
                // Safety timeout: fallback to standalone after 5s if wrapper never appears
                setTimeout(() => {
                    observer.disconnect();
                    if (!this._coordsElement) {
                        Log.warn(`${CONTEXT} Scale wrapper not found after 5s, using classic mode.`);
                        this._createStandaloneControl();
                    }
                }, 5000);
            }
        }
        catch (err) {
            Log.error(`${CONTEXT} Error creating control:`, err.message);
        }
    },
    /**
     * Attaches coordinates to the existing scale wrapper.
     * @param {HTMLElement} scaleWrapper - Scale wrapper element
     * @private
     */
    _attachToScaleWrapper(scaleWrapper) {
        // Add a separator before the coordinates
        domCreate("div", "gl-scale-separator", scaleWrapper);
        // Create the display element for coordinates directly in the wrapper
        this._coordsElement = domCreate("div", "gl-scale-coordinates", scaleWrapper);
        this._coordsElement.textContent = DEFAULT_COORDS_TEXT;
        // Add the mousemove event listener with stored reference
        this._map.on("mousemove", this._boundMouseMoveHandler);
        Log.info(`${CONTEXT} Coordinates integrated into scale wrapper.`);
    },
    /**
     * Creates a standalone control as fallback.
     * @private
     */
    _createStandaloneControl() {
        // Build the container element
        const container = domCreate("div", "gl-coordinates-display");
        // Block map event propagation on this control
        this._cleanups = [];
        blockMapPropagation(container, this._cleanups);
        // Create the content element
        this._coordsElement = domCreate("div", "gl-coordinates__content", container);
        this._coordsElement.textContent = DEFAULT_COORDS_TEXT;
        // Listen for mousemove on the map adapter
        this._map.on("mousemove", this._boundMouseMoveHandler);
        // Add to map via adapter — returns a handle with remove()
        this._controlHandle = this._map.addControl(container, this._options.position);
    },
    /**
     * Event handler for mouse movement.
     * @param {Object} e - Map event with e.latlng {lat, lng}
     * @private
     */
    _onMouseMove(e) {
        if (!this._coordsElement)
            return;
        const lat = e.latlng.lat.toFixed(this._options.decimals);
        const lng = e.latlng.lng.toFixed(this._options.decimals);
        this._coordsElement.textContent = `Lat: ${lat}, Lng: ${lng}`;
    },
    /**
     * Destroys the control and cleans up resources.
     */
    destroy() {
        try {
            // Remove the event listener with stored reference
            if (this._map && this._boundMouseMoveHandler) {
                this._map.off("mousemove", this._boundMouseMoveHandler);
                this._boundMouseMoveHandler = null;
            }
            // Remove the element from DOM if it exists
            if (this._coordsElement && this._coordsElement.parentNode) {
                this._coordsElement.parentNode.removeChild(this._coordsElement);
                this._coordsElement = null;
            }
            // Run all event listener cleanups
            for (const fn of this._cleanups)
                fn();
            this._cleanups = [];
            // Remove standalone control from the map
            this._controlHandle?.remove();
            this._controlHandle = null;
            Log.info(`${CONTEXT} Module destroyed successfully.`);
        }
        catch (err) {
            Log.error(`${CONTEXT} Error during destruction:`, err.message);
        }
    },
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI DOM Utilities Module
 * Reusable DOM utilities for the user interface
 */
const _UIDomUtils = {};
// Delegate resolveField to canonical import (Phase 4 dedup)
_UIDomUtils.resolveField = resolveField;
/**
 * Attache le behavior d'accordion (toggle open/close) to a conteneur.
 * Prevents multiple attachments using a flag.
 * @param {HTMLElement} container - Conteneur parent avec des elements .gl-accordion
 */
_UIDomUtils.attachAccordionBehavior = function (container) {
    if (!container || container._glAccordionBound)
        return;
    container._glAccordionBound = true;
    container.addEventListener("click", function (evt) {
        const header = evt.target.closest(".gl-accordion__header");
        if (!header || !container.contains(header)) {
            return;
        }
        const section = header.closest(".gl-accordion");
        if (!section)
            return;
        section.classList.toggle("gl-is-open");
    });
};
/**
 * Retrieves the profile active from GeoLeaf.Config.
 * @returns {Object|null} Object profile ou null si inavailable
 */
_UIDomUtils.getActiveProfileConfig = function () {
    if (!Config$3 || typeof Config$3.getActiveProfile !== "function") {
        Log.warn("[UIDomUtils] GeoLeaf.(Config as any).getActiveProfile() unavailable. Cannot retrieve active profile.");
        return null;
    }
    const profile = Config$3.getActiveProfile();
    if (!profile) {
        Log.warn("[UIDomUtils] No active profile returned by GeoLeaf.(Config as any).getActiveProfile().");
    }
    return profile || null;
};
/**
 * Builds thes <option> of a select from la taxonomy et of a path optionsFrom.
 * @param {HTMLSelectElement} selectEl - Element <select> to peupler
 * @param {Object} profile - Object profile contenant la taxonomy
 * @param {string} optionsFrom - Path to thes options (ex: "taxonomy.categories")
 */
_UIDomUtils.populateSelectOptionsFromTaxonomy = function (selectEl, profile, optionsFrom) {
    if (!selectEl || !profile || !profile.taxonomy)
        return;
    const taxonomy = profile.taxonomy;
    const emptyOpt = createElement("option", {
        value: "",
        textContent: "— Tous —",
    });
    selectEl.appendChild(emptyOpt);
    if (optionsFrom === "taxonomy.categories") {
        const categories = taxonomy.categories || {};
        Object.keys(categories).forEach(function (catId) {
            const cat = categories[catId];
            const opt = createElement("option", {
                value: catId,
                textContent: cat.label || catId,
            });
            selectEl.appendChild(opt);
        });
        return;
    }
    if (optionsFrom === "taxonomy.categories[*].subcategories") {
        const categories = taxonomy.categories || {};
        Object.keys(categories).forEach(function (catId) {
            const cat = categories[catId];
            const subs = (cat && cat.subcategories) || {};
            Object.keys(subs).forEach(function (subId) {
                const sub = subs[subId];
                const catLabel = cat.label || catId;
                const subLabel = sub.label || subId;
                const opt = createElement("option", {
                    value: subId,
                    textContent: catLabel + " – " + subLabel,
                    attributes: { "data-category-id": catId },
                });
                selectEl.appendChild(opt);
            });
        });
    }
};

/**
 * GeoLeaf UI Module - Event Delegation
 * Centralisation de la gestion des events UI avec patterns de delegation efficaces
 *
 * @module ui/event-delegation
 * @author Assistant
 * @version 1.2.0
 */
// ========================================
//   CONSTANTES & STATE
// ========================================
/**
 * Map des listners actives pour cleanup
 * @type {Map<string, {element: HTMLElement, event: string, handler: Function}>}
 */
const _activeListeners = new Map();
/**
 * Compteur pour identifiers uniques des listners
 * @type {number}
 */
let _listenerIdCounter = 0;
// ========================================
//   UTILITAIRES DE DELEGATION
// ========================================
/**
 * Attache un event listner avec tracking automatic pour cleanup
 * @param {HTMLElement} element - Element DOM
 * @param {string} event - Type d'event
 * @param {Function} handler - Handler of the event
 * @param {Object} options - Options pour addEventListner
 * @returns {string} ID unique du listner pour cleanup
 */
function attachTrackedListener(element, event, handler, options = {}) {
    if (!element || typeof handler !== "function") {
        if (Log)
            Log.warn("[UI.EventDelegation] attachTrackedListener: element or handler missing");
        return null;
    }
    const listenerId = `listener_${++_listenerIdCounter}`;
    // Wrapper pour tracking automatic des errors
    const wrappedHandler = function (e) {
        try {
            return handler.call(this, e);
        }
        catch (error) {
            if (Log)
                Log.error("[UI.EventDelegation] Error in handler:", error);
        }
    };
    element.addEventListener(event, wrappedHandler, options);
    _activeListeners.set(listenerId, {
        element,
        event,
        handler: wrappedHandler,
        originalHandler: handler,
    });
    return listenerId;
}
/**
 * Detaches a tracked listener
 * @param {string} listnerId - ID returned by attachTrackedListner
 * @returns {boolean} True si success
 */
function detachTrackedListener(listenerId) {
    if (!listenerId || !_activeListeners.has(listenerId)) {
        return false;
    }
    const { element, event, handler } = _activeListeners.get(listenerId);
    element.removeEventListener(event, handler);
    _activeListeners.delete(listenerId);
    return true;
}
/**
 * Cleans up all tracked listeners
 * @returns {number} Nombre de listners cleaned
 */
function cleanupAllListeners() {
    let cleaned = 0;
    for (const [_listenerId, { element, event, handler }] of _activeListeners) {
        element.removeEventListener(event, handler);
        cleaned++;
    }
    _activeListeners.clear();
    if (Log && cleaned > 0) {
        Log.info(`[UI.EventDelegation] ${cleaned} listeners cleaned`);
    }
    return cleaned;
}
// ========================================
//   DELEGATION BY SPECIFIC UI TYPES
// ========================================
/**
 * Manages thes events des inputs de filters avec debouncing
 * @param {HTMLElement} filterContainer - Conteneur des filters
 * @param {Function} onFilterChange - Callback called whens changements
 * @param {number} debounceMs - Debounce delay (default: 300ms)
 * @returns {string[]} IDs des listners created
 */
function attachFilterInputEvents(filterContainer, onFilterChange, debounceMs = 300) {
    if (!filterContainer || typeof onFilterChange !== "function") {
        if (Log)
            Log.warn("[UI.EventDelegation] attachFilterInputEvents: missing parameters");
        return [];
    }
    const listenerIds = [];
    let debounceTimer = null;
    // Fonction debounce for thes inputs
    const debouncedHandler = function () {
        if (debounceTimer)
            clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            onFilterChange();
        }, debounceMs);
    };
    // Delegation pour tous les inputs de type text/range
    const textInputHandler = function (e) {
        if (e.target.matches('input[type="text"], input[type="range"]')) {
            debouncedHandler();
        }
    };
    // Delegation for thes checkboxes (pas de debounce)
    const checkboxHandler = function (e) {
        if (e.target.matches('input[type="checkbox"]')) {
            onFilterChange();
        }
    };
    // Delegation for thes selects
    const selectHandler = function (e) {
        if (e.target.matches("select")) {
            onFilterChange();
        }
    };
    listenerIds.push(attachTrackedListener(filterContainer, "input", textInputHandler));
    listenerIds.push(attachTrackedListener(filterContainer, "change", checkboxHandler));
    listenerIds.push(attachTrackedListener(filterContainer, "change", selectHandler));
    return listenerIds.filter((id) => id !== null);
}
/**
 * Manages thes events d'accordion avec delegation
 * @param {HTMLElement} container - Conteneur des accordions
 * @returns {string} ID du listner created
 */
function attachAccordionEvents(container) {
    if (!container) {
        if (Log)
            Log.warn("[UI.EventDelegation] attachAccordionEvents: conteneur manquant");
        return null;
    }
    const accordionHandler = function (e) {
        // Cherche le button d'accordion in the hierarchy
        const accordionButton = e.target.closest(".gl-accordion-toggle, .accordion-arrow");
        if (!accordionButton)
            return;
        e.preventDefault();
        e.stopPropagation();
        // Finds the associated panel
        const panel = accordionButton
            .closest(".gl-accordion")
            ?.querySelector(".gl-accordion-content");
        if (!panel)
            return;
        // Toggle accordion
        const isExpanded = panel.style.display !== "none";
        panel.style.display = isExpanded ? "none" : "block";
        // Updates the aria-expanded
        accordionButton.setAttribute("aria-expanded", !isExpanded);
        // Updates the icon si presents
        const icon = accordionButton.querySelector(".accordion-icon, .accordion-arrow");
        if (icon) {
            icon.classList.toggle("expanded", !isExpanded);
        }
    };
    return attachTrackedListener(container, "click", accordionHandler);
}
/**
 * Manages thes events des controles de carte (delegation for thes buttons)
 * @param {HTMLElement} mapContainer - Conteneur de the map
 * @param {Object} handlers - Map des handlers { selectorPattern: handlerFunction }
 * @returns {string[]} IDs des listners created
 */
function attachMapControlEvents(mapContainer, handlers) {
    if (!mapContainer || !handlers || typeof handlers !== "object") {
        if (Log)
            Log.warn("[UI.EventDelegation] attachMapControlEvents: missing parameters");
        return [];
    }
    const listenerIds = [];
    const controlHandler = function (e) {
        for (const [selector, handler] of Object.entries(handlers)) {
            if (e.target.matches(selector) || e.target.closest(selector)) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof handler === "function") {
                    handler.call(this, e);
                }
                break;
            }
        }
    };
    listenerIds.push(attachTrackedListener(mapContainer, "click", controlHandler));
    return listenerIds.filter((id) => id !== null);
}
// ========================================
//   API PUBLIQUE
// ========================================
/**
 * Obtient le nombre de listners actives registered
 * Utile for the debugging et le monitoring des fuites memory
 * @returns {number} Nombre de listners actives
 */
function getActiveListenersCount() {
    return _activeListeners.size;
}
/**
 * Retrieves the list complete des listners actives with theurs metadata
 * @returns {string[]} List des IDs de listners actives
 */
function getActiveListeners() {
    return Array.from(_activeListeners.keys());
}
const _UIEventDelegation = {
    attachTrackedListener,
    detachTrackedListener,
    cleanupAllListeners,
    attachFilterInputEvents,
    attachAccordionEvents,
    attachMapControlEvents,
    getActiveListenersCount,
    getActiveListeners,
};

// Sprint 7: @ts-nocheck removed — progressive typing complete
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
// any: Config may expose getActiveProfile at runtime via dynamic enrichment
const _Config = Config$3;
function _numCfg(val, def) {
    return typeof val === "number" && val > 0 ? val : def;
}
function _resolveProximityRadius() {
    let minRadius = 1, maxRadius = 50, stepRadius = 1, defaultRadius = 10;
    try {
        const activeProfile = _Config?.getActiveProfile?.();
        const ap = activeProfile;
        const panels = ap?.panels;
        const searchConfig = ap
            ? panels?.search ||
                ap.search
            : null;
        if (searchConfig) {
            minRadius = _numCfg(searchConfig.radiusMin, 1);
            maxRadius = _numCfg(searchConfig.radiusMax, 50);
            stepRadius = _numCfg(searchConfig.radiusStep, 1);
            defaultRadius = Math.max(minRadius, Math.min(_numCfg(searchConfig.radiusDefault, 10), maxRadius));
        }
    }
    catch (err) {
        Log?.warn?.("[GeoLeaf.UI] Erreur lecture radius config:", err);
    }
    return { minRadius, maxRadius, stepRadius, defaultRadius };
}
function _buildSelectControl(filterDef, labelEl) {
    const selectEl = createElement("select", {
        className: "gl-filter-panel__control gl-filter-panel__control--select",
        name: filterDef.id,
        id: "gl-filter-" + filterDef.id,
    });
    if (labelEl)
        labelEl.setAttribute("for", selectEl.id);
    if (filterDef.type === "multiselect")
        selectEl.multiple = true;
    if (filterDef.optionsFrom) {
        const profile = _UIDomUtils.getActiveProfileConfig();
        _UIDomUtils.populateSelectOptionsFromTaxonomy(selectEl, profile, filterDef.optionsFrom);
    }
    return selectEl;
}
function _buildRangeControl(filterDef, labelEl) {
    const container = createElement("div", { className: "gl-filter-panel__range-wrapper" });
    const input = createElement("input", {
        type: "range",
        className: "gl-filter-panel__control gl-filter-panel__control--range",
        id: "gl-filter-" + filterDef.id,
        name: filterDef.id,
    });
    if (labelEl)
        labelEl.setAttribute("for", input.id);
    if (typeof filterDef.min === "number")
        input.min = String(filterDef.min);
    if (typeof filterDef.max === "number")
        input.max = String(filterDef.max);
    if (typeof filterDef.step === "number")
        input.step = String(filterDef.step);
    const valueLabel = createElement("span", { className: "gl-filter-panel__range-value" });
    let initialValue;
    if (typeof filterDef.default === "number") {
        initialValue = filterDef.default;
    }
    else if (input.min && input.max) {
        initialValue = (parseFloat(input.min) + parseFloat(input.max)) / 2;
    }
    else {
        initialValue = input.min ? parseFloat(input.min) : 0;
    }
    if (!isNaN(initialValue)) {
        input.value = String(initialValue);
        valueLabel.textContent = initialValue.toString().replace(".", ",");
    }
    input.addEventListener("input", function () {
        const val = parseFloat(input.value);
        if (!isNaN(val))
            valueLabel.textContent = val.toString().replace(".", ",");
    });
    container.appendChild(input);
    container.appendChild(valueLabel);
    return container;
}
function _buildTreeControl(filterDef) {
    return createElement("div", {
        className: "gl-filter-panel__tree gl-filter-panel__tree--lazy",
        attributes: { "data-lazy-type": "categories", "data-filter-id": filterDef.id },
    });
}
function _buildCheckboxGroupControl(filterDef) {
    const groupContainer = createElement("div", { className: "gl-filter-panel__checkbox-group" });
    if (Array.isArray(filterDef.options)) {
        filterDef.options.forEach(function (opt) {
            const label = createElement("label", { className: "gl-filter-panel__checkbox-label" });
            const checkbox = createElement("input", {
                type: "checkbox",
                className: "gl-filter-panel__checkbox",
                name: filterDef.id,
                value: opt.id,
                checked: !!opt.checked,
                attributes: { "data-filter-option-id": opt.id },
            });
            const text = createElement("span", {
                className: "gl-filter-panel__checkbox-text",
                textContent: opt.label || opt.id,
            });
            label.appendChild(checkbox);
            label.appendChild(text);
            groupContainer.appendChild(label);
        });
    }
    return groupContainer;
}
function _buildSearchControl(filterDef, _labelEl, wrapper) {
    const searchInput = createElement("input", {
        type: "text",
        className: "gl-filter-panel__control gl-filter-panel__control--search",
        name: filterDef.id,
        placeholder: filterDef.placeholder || "Filtrer...",
    });
    if (Array.isArray(filterDef.searchFields)) {
        searchInput.setAttribute("data-search-fields", filterDef.searchFields.join(","));
    }
    wrapper.classList.add("gl-filter-group--search");
    return searchInput;
}
function _createProximityRangeSection(filterDef) {
    const rangeWrapper = createElement("div", {
        className: "gl-filter-panel__proximity-range",
        style: { display: "none" },
    });
    rangeWrapper.appendChild(createElement("label", {
        className: "gl-filter-panel__label",
        textContent: "Rayon (km)",
        attributes: { for: "gl-filter-proximity-radius" },
    }));
    const rangeContainer = createElement("div", { className: "gl-filter-panel__range-wrapper" });
    const { minRadius, maxRadius, stepRadius, defaultRadius } = _resolveProximityRadius();
    const rangeInput = createElement("input", {
        type: "range",
        className: "gl-filter-panel__control gl-filter-panel__control--range",
        id: "gl-filter-proximity-radius",
        name: filterDef.id + "_radius",
        min: String(minRadius),
        max: String(maxRadius),
        step: String(stepRadius),
        value: String(defaultRadius),
        attributes: {
            "data-filter-proximity-radius": "true",
            "data-proximity-radius-default": String(defaultRadius),
        },
    });
    const rangeValue = createElement("span", {
        className: "gl-filter-panel__range-value",
        textContent: String(defaultRadius),
    });
    rangeInput.addEventListener("input", function () {
        rangeValue.textContent = rangeInput.value;
    });
    rangeContainer.appendChild(rangeInput);
    rangeContainer.appendChild(rangeValue);
    rangeWrapper.appendChild(rangeContainer);
    rangeWrapper.appendChild(createElement("p", {
        className: "gl-filter-panel__proximity-instruction",
        textContent: filterDef.instructionText || "Cliquez sur la carte",
        style: { display: "none" },
    }));
    return rangeWrapper;
}
function _buildProximityControl(filterDef) {
    const proximityContainer = createElement("div", { className: "gl-filter-panel__proximity" });
    if (filterDef.label) {
        proximityContainer.appendChild(createElement("h3", {
            className: "gl-filter-panel__proximity-title",
            textContent: filterDef.label,
        }));
    }
    const button = createElement("button", {
        type: "button",
        className: "gl-btn gl-btn--secondary gl-filter-panel__proximity-btn",
        attributes: { "data-filter-proximity-btn": "true" },
        textContent: filterDef.buttonLabel || "Activer",
    });
    proximityContainer.appendChild(button);
    proximityContainer.appendChild(_createProximityRangeSection(filterDef));
    return proximityContainer;
}
function _buildTagsControl(filterDef) {
    return createElement("div", {
        className: "gl-filter-panel__tags-container",
        attributes: { "data-lazy-type": "tags", "data-filter-id": filterDef.id },
    });
}
const _FILTER_BUILDERS = {
    select: _buildSelectControl,
    multiselect: _buildSelectControl,
    range: _buildRangeControl,
    tree: _buildTreeControl,
    "tree-category": _buildTreeControl,
    categoryTree: _buildTreeControl,
    "checkbox-group": _buildCheckboxGroupControl,
    search: _buildSearchControl,
    proximity: _buildProximityControl,
    "multiselect-tags": _buildTagsControl,
};
function _dispatchFilterControl(filterDef, labelEl, wrapper) {
    const builderFn = _FILTER_BUILDERS[filterDef.type];
    if (builderFn)
        return builderFn(filterDef, labelEl, wrapper);
    if (filterDef.id === "tags")
        return _buildTagsControl(filterDef);
    return null;
}
/**
 * Builds a controle de filters individuel
 * @param {Object} filterDef - Definition du filters
 * @param {Object} profile - Configuration of the profile
 * @param {boolean} skipLabel - Sauter la creation du label (defaut: false)
 * @returns {HTMLElement|null}
 */
const _buildFilterControl = function (filterDef, _profile, skipLabel) {
    const fid = filterDef?.id;
    const ftype = filterDef?.type;
    if (!fid || !ftype)
        return null;
    const wrapper = createElement("div", {
        className: "gl-filter-panel__group",
        attributes: { "data-gl-filter-id": fid },
    });
    let labelEl = null;
    if (filterDef.label && !skipLabel) {
        labelEl = createElement("label", {
            className: "gl-filter-panel__label",
            textContent: filterDef.label,
        });
        wrapper.appendChild(labelEl);
    }
    const control = _dispatchFilterControl(filterDef, labelEl, wrapper);
    if (!control)
        return null;
    if (labelEl && control instanceof HTMLElement && !control.id) {
        const controlId = "gl-filter-" + fid;
        control.id = controlId;
        labelEl.setAttribute("for", controlId);
    }
    wrapper.appendChild(control);
    return wrapper;
};
/**
 * Fonctions globales for the loading lazy des filtres
 * Used by the lazy-loader to build content on demand
 */
/**
 * Builds the contenu HTML of the tree de categories
 * @param {Object} scanResult - Result du scan ({usedIds: Set, visibleLayerIds: Array})
 * @returns {string} HTML string
 */
function _buildCategoryItemHtml(catId, cat, subKeys, esc) {
    let html = '<li class="gl-filter-tree__item gl-filter-tree__item--category">';
    html += '<div class="gl-filter-tree__row">';
    if (subKeys.length > 0) {
        html +=
            '<span class="gl-filter-tree__arrow" data-category-id="' + esc(catId) + '">▶</span>';
    }
    else {
        html += '<span class="gl-filter-tree__spacer"></span>';
    }
    html += '<label class="gl-filter-tree__label gl-filter-tree__label--category">';
    html +=
        '<input type="checkbox" class="gl-filter-tree__checkbox gl-filter-tree__checkbox--category" ';
    html += 'name="categories_category" value="' + esc(catId) + '" ';
    html += 'data-gl-filter-category-id="' + esc(catId) + '">';
    html += '<span class="gl-filter-tree__text">' + esc(cat.label || catId) + "</span>";
    html += "</label>";
    html += "</div>";
    if (subKeys.length > 0) {
        const subs = cat.subcategories || {};
        html += '<ul class="gl-filter-tree gl-filter-tree--subcategories">';
        subKeys.forEach(function (subId) {
            const sub = subs[subId] || {};
            html += '<li class="gl-filter-tree__item gl-filter-tree__item--subcategory">';
            html += '<label class="gl-filter-tree__label gl-filter-tree__label--subcategory">';
            html +=
                '<input type="checkbox" class="gl-filter-tree__checkbox gl-filter-tree__checkbox--subcategory" ';
            html += 'name="categories_subcategory" value="' + esc(subId) + '" ';
            html += 'data-gl-filter-category-id="' + esc(catId) + '" ';
            html += 'data-gl-filter-subcategory-id="' + esc(subId) + '">';
            html += '<span class="gl-filter-tree__text">' + esc(sub.label || subId) + "</span>";
            html += "</label>";
            html += "</li>";
        });
        html += "</ul>";
    }
    html += "</li>";
    return html;
}
function buildCategoryTreeContent(scanResult) {
    // Retrieve the profile active via l'API Config (enrichedProfile contient taxonomy)
    const profile = _Config && typeof _Config.getActiveProfile === "function"
        ? _Config.getActiveProfile()
        : null;
    const taxonomy = profile?.taxonomy;
    const categories = taxonomy?.categories;
    if (!profile || !taxonomy || !categories) {
        return '<div class="gl-empty-state">Aucune category disponible</div>';
    }
    const usedCategoryIds = scanResult.usedIds;
    // Security: escape dynamic values injected in HTML
    const esc = Security && typeof Security.escapeHtml === "function"
        ? function (s) {
            return Security.escapeHtml(s);
        }
        : function (s) {
            return String(s || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        };
    // Case-insensitive comparison: normalize scanned IDs
    const usedLower = new Set();
    usedCategoryIds.forEach(function (id) {
        usedLower.add(id.toLowerCase());
    });
    // Filtrer les categories pour display celles used (comparaison casee-insensitive)
    const catIds = Object.keys(categories).filter((catId) => usedLower.has(catId.toLowerCase()));
    if (catIds.length === 0) {
        return '<div class="gl-empty-state">ND - Non disponible</div>';
    }
    let html = '<ul class="gl-filter-tree gl-filter-tree--root">';
    catIds.forEach(function (catId) {
        const cat = categories[catId] || {};
        const subs = cat.subcategories || {};
        const subKeys = Object.keys(subs).filter((subId) => usedLower.has(subId.toLowerCase()));
        html += _buildCategoryItemHtml(catId, cat, subKeys, esc);
    });
    html += "</ul>";
    return html;
}
/**
 * Builds the contenu HTML de the list de tags
 * @param {Array} tags - Array de tags uniques sorted
 * @returns {string} HTML string
 */
function buildTagsListContent(tags) {
    if (!tags || tags.length === 0) {
        return '<div class="gl-empty-state">ND - Non disponible</div>';
    }
    // Security: escape dynamic values
    const esc = Security && typeof Security.escapeHtml === "function"
        ? function (s) {
            return Security.escapeHtml(s);
        }
        : function (s) {
            return String(s || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        };
    let html = "";
    tags.forEach(function (tag) {
        html +=
            '<span class="gl-filter-panel__tag-badge" data-tag-value="' +
                esc(tag) +
                '">' +
                esc(tag) +
                "</span>";
    });
    return html;
}
/**
 * Attache les event listners pour l'tree de categories after rendering
 * Perf 6.2.2: Delegation d'events — 3 listners sur le container au lieu de N listners individuels
 * @param {HTMLElement} container - Container of the tree
 */
function attachCategoryTreeListeners(container) {
    // Delegation: 1 seul listner 'click' pour toutes les arrows
    container.addEventListener("click", function (e) {
        const arrow = e.target.closest(".gl-filter-tree__arrow");
        if (!arrow)
            return;
        e.stopPropagation();
        const li = arrow.closest(".gl-filter-tree__item--category");
        if (!li)
            return;
        const subList = li.querySelector(".gl-filter-tree--subcategories");
        if (subList) {
            const isExpanded = li.classList.contains("is-expanded");
            if (isExpanded) {
                li.classList.remove("is-expanded");
                arrow.textContent = "▶";
            }
            else {
                li.classList.add("is-expanded");
                arrow.textContent = "▼";
            }
        }
    });
    // Delegation: 1 seul listner 'change' pour toutes les checkboxes (categories + sous-categories)
    container.addEventListener("change", function (e) {
        const target = e.target;
        if (!target.matches(".gl-filter-tree__checkbox"))
            return;
        if (target.classList.contains("gl-filter-tree__checkbox--category")) {
            // Category checkbox checked → propagate to sub-categories
            const li = target.closest(".gl-filter-tree__item--category");
            if (!li)
                return;
            const subCheckboxes = li.querySelectorAll(".gl-filter-tree__checkbox--subcategory");
            subCheckboxes.forEach(function (subCb) {
                subCb.checked = target.checked;
            });
            target.indeterminate = false;
        }
        else if (target.classList.contains("gl-filter-tree__checkbox--subcategory")) {
            // Sub-category checkbox checked → update parent state
            const liCat = target.closest(".gl-filter-tree__item--category");
            if (!liCat)
                return;
            const categoryCheckbox = liCat.querySelector(".gl-filter-tree__checkbox--category");
            const subCheckboxes = liCat.querySelectorAll(".gl-filter-tree__checkbox--subcategory");
            const checkedCount = Array.from(subCheckboxes).filter((cb) => cb.checked).length;
            const totalCount = subCheckboxes.length;
            if (categoryCheckbox) {
                if (checkedCount === 0) {
                    categoryCheckbox.checked = false;
                    categoryCheckbox.indeterminate = false;
                }
                else if (checkedCount === totalCount) {
                    categoryCheckbox.checked = true;
                    categoryCheckbox.indeterminate = false;
                }
                else {
                    categoryCheckbox.checked = false;
                    categoryCheckbox.indeterminate = true;
                }
            }
        }
        // Trigger filter application after any checkbox state change
        const filterPanel = document.getElementById("gl-filter-panel") || document.getElementById("gl-left-panel");
        const applier = globalThis?.GeoLeaf?._UIFilterPanelApplier;
        if (filterPanel && applier && typeof applier.applyFiltersNow === "function") {
            applier.applyFiltersNow(filterPanel);
        }
    });
}
/**
 * Attache les event listners for thes tags after rendering
 * Perf 6.2.2: Delegation d'events — 1 listner sur le container au lieu de N badges
 * @param {HTMLElement} container - Container des tags
 */
function attachTagsListeners(container) {
    container.addEventListener("click", function (e) {
        const badge = e.target.closest(".gl-filter-panel__tag-badge");
        if (badge) {
            badge.classList.toggle("gl-is-selected");
            // Trigger filter application after tag toggle
            const filterPanel = document.getElementById("gl-filter-panel") ||
                document.getElementById("gl-left-panel");
            const applier = globalThis?.GeoLeaf?._UIFilterPanelApplier;
            if (filterPanel && applier && typeof applier.applyFiltersNow === "function") {
                applier.applyFiltersNow(filterPanel);
            }
        }
    });
}

/**
 * GeoLeaf UI Module - Filter State Manager
 * Gestion centralizede de the state des filters avec patterns observer
 *
 * @module ui/filter-state-manager
 * @author Assistant
 * @version 1.2.0
 */
// ========================================
//   CENTRALIZED FILTER STATE
// ========================================
/**
 * Current state des filters
 * @type {Object}
 * @private
 */
const _filterState = {
    // STATE des filters par ID
    values: new Map(),
    // Metadata des filters
    metadata: new Map(),
    // Profil current
    activeProfile: null,
    // Callbacks observers
    observers: new Set(),
};
/**
 * Timestamps pour debouncing
 * @type {Map<string, number>}
 * @private
 */
const _debounceTimers = new Map();
const _ARRAY_FILTER_TYPES = new Set(["multiselect", "tree", "tree-category", "categoryTree"]);
// ========================================
//   GESTION DE L'STATE DES FILTRES
// ========================================
function _getDefaultForType(filter) {
    if (_ARRAY_FILTER_TYPES.has(filter.type))
        return filter.default ?? [];
    if (filter.type === "select")
        return filter.default ?? "";
    if (filter.type === "range")
        return filter.default ?? (filter.min + filter.max) / 2;
    return filter.default ?? "";
}
function _initFilterFromDesc(filter) {
    if (!filter.id)
        return;
    const metadata = {
        type: filter.type,
        label: filter.label,
        required: !!filter.required,
        min: filter.min,
        max: filter.max,
        options: filter.options ?? [],
        optionsFrom: filter.optionsFrom,
    };
    _filterState.metadata.set(filter.id, metadata);
    _filterState.values.set(filter.id, _getDefaultForType(filter));
}
/**
 * Initializes the filter state from a profile
 * @param {Object} profile - Configuration of the profile
 * @returns {boolean} Successfully initialized
 */
function initializeFromProfile(profile) {
    if (!profile || !profile.filters) {
        if (Log)
            Log.warn("[UI.FilterStateManager] Profil ou filters manquants");
        return false;
    }
    // Reinitializes the state
    _filterState.values.clear();
    _filterState.metadata.clear();
    _filterState.activeProfile = profile;
    // Configure chaque filters avec ses values by default
    profile.filters.forEach(_initFilterFromDesc);
    // Notifie les observers
    _notifyObservers("init", null, _filterState.values);
    if (Log) {
        Log.info(`[UI.FilterStateManager] Initialized with ${_filterState.values.size} filters`);
    }
    return true;
}
/**
 * Updates the value d'a filter
 * @param {string} filterId - ID du filters
 * @param {*} value - Nouvelle value
 * @param {boolean} skipNotify - Skip notification (default: false)
 * @returns {boolean} Update success
 */
function updateFilterValue(filterId, value, skipNotify = false) {
    if (!filterId || !_filterState.metadata.has(filterId)) {
        if (Log)
            Log.warn(`[UI.FilterStateManager] Filtre inconnu: ${filterId}`);
        return false;
    }
    const metadata = _filterState.metadata.get(filterId);
    const oldValue = _filterState.values.get(filterId);
    // Validation selon the type
    const validatedValue = _validateFilterValue(value, metadata);
    if (validatedValue === null && value !== null) {
        if (Log)
            Log.warn(`[UI.FilterStateManager] Invalid value for ${filterId}:`, value);
        return false;
    }
    // Update
    _filterState.values.set(filterId, validatedValue);
    // Notification avec debouncing for thes ranges
    if (!skipNotify) {
        if (metadata.type === "range") {
            _notifyWithDebounce(filterId, "change", oldValue, validatedValue, 200);
        }
        else {
            _notifyObservers("change", filterId, validatedValue, oldValue);
        }
    }
    return true;
}
/**
 * Retrieves the value d'a filter
 * @param {string} filterId - ID du filters
 * @returns {*} Value du filters ou null si inexisting
 */
function getFilterValue(filterId) {
    return _filterState.values.get(filterId) || null;
}
/**
 * Retrieves toutes the values de filters
 * @returns {Object} Object avec filterId -> value
 */
function getAllFilterValues() {
    return Object.fromEntries(_filterState.values);
}
/**
 * Retrieves thes metadata d'a filter
 * @param {string} filterId - ID du filters
 * @returns {Object|null} Metadata ou null
 */
function getFilterMetadata(filterId) {
    return _filterState.metadata.get(filterId) || null;
}
/**
 * Resets all filters
 * @param {boolean} skipNotify - Skip notification (default: false)
 */
function resetAllFilters(skipNotify = false) {
    const oldState = new Map(_filterState.values);
    _filterState.values.forEach((value, filterId) => {
        const metadata = _filterState.metadata.get(filterId);
        if (!metadata)
            return;
        // Reset according to type
        let resetValue = null;
        switch (metadata.type) {
            case "multiselect":
            case "tree":
            case "tree-category":
            case "categoryTree":
                resetValue = [];
                break;
            case "range":
                resetValue = (metadata.min + metadata.max) / 2;
                break;
            default:
                resetValue = "";
        }
        _filterState.values.set(filterId, resetValue);
    });
    if (!skipNotify) {
        _notifyObservers("reset", null, _filterState.values, oldState);
    }
}
// ========================================
//   OBSERVER SYSTEM
// ========================================
/**
 * Adds a observer for thes changements d'state
 * @param {Function} callback - Fonction called whens changements
 * @returns {Function} Function to unsubscribe the observer
 */
function addObserver(callback) {
    if (typeof callback !== "function") {
        if (Log)
            Log.warn("[UI.FilterStateManager] Observer must be a function");
        return () => { };
    }
    _filterState.observers.add(callback);
    // Returns unsubscription function
    return function unsubscribe() {
        _filterState.observers.delete(callback);
    };
}
/**
 * Notifie tous les observers
 * @param {string} type - Type of changement ('init', 'change', 'reset')
 * @param {string|null} filterId - Changed filter ID (null for global)
 * @param {*} newValue - Nouvelle value
 * @param {*} oldValue - Ancienne value
 * @private
 */
function _notifyObservers(type, filterId, newValue, oldValue) {
    const event = {
        type,
        filterId,
        newValue,
        oldValue,
        timestamp: Date.now(),
        allValues: Object.fromEntries(_filterState.values),
    };
    _filterState.observers.forEach((callback) => {
        try {
            callback(event);
        }
        catch (error) {
            if (Log)
                Log.error("[UI.FilterStateManager] Error in observer:", error);
        }
    });
}
/**
 * Notification avec debouncing
 * @param {string} filterId - ID du filters
 * @param {string} type - Type d'event
 * @param {*} oldValue - Ancienne value
 * @param {*} newValue - Nouvelle value
 * @param {number} delay - Delay de debounce
 * @private
 */
function _notifyWithDebounce(filterId, type, oldValue, newValue, delay) {
    // Clear existing timer
    if (_debounceTimers.has(filterId)) {
        clearTimeout(_debounceTimers.get(filterId));
    }
    // Set new timer
    const timer = setTimeout(() => {
        _notifyObservers(type, filterId, newValue, oldValue);
        _debounceTimers.delete(filterId);
    }, delay);
    _debounceTimers.set(filterId, timer);
}
// ========================================
//   VALIDATION DE VALEURS
// ========================================
function _validateRangeValue(value, metadata) {
    const num = parseFloat(value);
    if (isNaN(num))
        return metadata.min ?? 0;
    if (metadata.min !== undefined && num < metadata.min)
        return metadata.min;
    if (metadata.max !== undefined && num > metadata.max)
        return metadata.max;
    return num;
}
/**
 * Valide a value based on thes metadata du filters
 * @param {*} value - Value to valider
 * @param {Object} metadata - Metadata du filters
 * @returns {*} Value validated ou null si invalid
 * @private
 */
function _validateFilterValue(value, metadata) {
    if (!metadata)
        return null;
    if (_ARRAY_FILTER_TYPES.has(metadata.type))
        return Array.isArray(value) ? value : [];
    if (metadata.type === "select")
        return typeof value === "string" ? value : "";
    if (metadata.type === "range")
        return _validateRangeValue(value, metadata);
    return value;
}
// ========================================
//   QUERY UTILITIES
// ========================================
function _rangeDefaultVal(metadata) {
    return (metadata.min + metadata.max) / 2;
}
function _isFilterActive(metadata, value) {
    if (_ARRAY_FILTER_TYPES.has(metadata.type))
        return Array.isArray(value) && value.length > 0;
    if (metadata.type === "select")
        return !!value && value !== "";
    if (metadata.type === "range")
        return Math.abs(value - _rangeDefaultVal(metadata)) > 0.01;
    return false;
}
function _getFilterDisplayValue(metadata, value) {
    if (_ARRAY_FILTER_TYPES.has(metadata.type))
        return `${value.length} selected(s)`;
    if (metadata.type === "select")
        return value;
    if (metadata.type === "range")
        return value.toString().replace(".", ",");
    return "";
}
/**
 * Checks if des filters sont currentlement actives
 * @returns {boolean} True si au moins a filter est active
 */
function hasActiveFilters() {
    for (const [filterId, value] of _filterState.values) {
        const metadata = _filterState.metadata.get(filterId);
        if (!metadata)
            continue;
        if (_isFilterActive(metadata, value))
            return true;
    }
    return false;
}
/**
 * Retrieves a summary of active filters
 * @returns {Array} List des filters actives with theurs values
 */
function getActiveFiltersSummary() {
    const summary = [];
    for (const [filterId, value] of _filterState.values) {
        const metadata = _filterState.metadata.get(filterId);
        if (!metadata)
            continue;
        if (!_isFilterActive(metadata, value))
            continue;
        summary.push({
            id: filterId,
            label: metadata.label || filterId,
            value: _getFilterDisplayValue(metadata, value),
            type: metadata.type,
        });
    }
    return summary;
}
// ========================================
//   API PUBLIQUE
// ========================================
const _UIFilterStateManager = {
    initializeFromProfile,
    updateFilterValue,
    getFilterValue,
    getAllFilterValues,
    getFilterMetadata,
    resetAllFilters,
    addObserver,
    hasActiveFilters,
    getActiveFiltersSummary,
};
// Properties as read-only
Object.defineProperty(_UIFilterStateManager, "activeProfile", {
    get: () => _filterState.activeProfile,
    enumerable: true,
});
Object.defineProperty(_UIFilterStateManager, "filterCount", {
    get: () => _filterState.values.size,
    enumerable: true,
});

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI Module - Panel Builder
 * Building POI detail panels with configurable layouts
 */
/**
 * Creates a bloc section simple (sans accordion).
 *
 * @param {string} label - Title de la section.
 * @param {Node|string} innerContent - Contenu de la section (Node ou text).
 * @param {string} extraClass - Classes CSS additionnelles.
 * @returns {HTMLElement} Element section.
 */
function createPlainSection(label, innerContent, extraClass) {
    const section = createElement("section", {
        className: "gl-poi-panel__section" + (extraClass ? " " + extraClass : ""),
    });
    if (label) {
        const header = createElement("h3", {
            className: "gl-poi-panel__section-title",
            textContent: label,
        });
        section.appendChild(header);
    }
    const body = createElement("div", {
        className: "gl-poi-panel__section-body",
    });
    if (innerContent instanceof Node) {
        body.appendChild(innerContent);
    }
    else if (innerContent != null) {
        body.textContent = String(innerContent);
    }
    section.appendChild(body);
    return section;
}
/**
 * Creates a bloc section accordion (panel collapsible).
 *
 * @param {string} label - Title of the accordion.
 * @param {Node|string} innerContent - Contenu of the accordion.
 * @param {object} options - Options { defaultOpen: boolean }.
 * @returns {HTMLElement} Element section accordion.
 */
function createAccordionSection(label, innerContent, options) {
    const opts = options || {};
    const isOpen = Boolean(opts.defaultOpen);
    const section = createElement("section", {
        className: "gl-accordion gl-poi-panel__section" + (isOpen ? " gl-is-open" : ""),
    });
    const header = createElement("button", {
        type: "button",
        className: "gl-accordion__header",
    });
    const titleSpan = createElement("span", {
        className: "gl-accordion__title",
        textContent: label || "",
    });
    header.appendChild(titleSpan);
    const iconSpan = createElement("span", {
        className: "gl-accordion__icon",
        attributes: { "aria-hidden": "true" },
        textContent: "▾",
    });
    header.appendChild(iconSpan);
    section.appendChild(header);
    const body = createElement("div", {
        className: "gl-accordion__body",
    });
    if (innerContent instanceof Node) {
        body.appendChild(innerContent);
    }
    else if (innerContent != null) {
        const p = createElement("p", {
            textContent: String(innerContent),
        });
        body.appendChild(p);
    }
    section.appendChild(body);
    return section;
}
/**
 * Builds the rendu of a item de type "text".
 *
 * @param {*} value - Value to display.
 * @param {string} variant - Variant ("multiline" ou autre).
 * @returns {HTMLElement|null} Element div ou null.
 */
function renderText(value, variant) {
    const div = createElement("div", {
        className: "gl-poi-panel__text" +
            (variant === "multiline" ? " gl-poi-panel__text--multiline" : ""),
        textContent: String(value),
    });
    return div;
}
function _resolveEntryLabel(entry) {
    if (typeof entry.label === "string")
        return entry.label;
    if (typeof entry.text === "string")
        return entry.text;
    return null;
}
function _resolveListEntry(entry) {
    if (entry == null)
        return null;
    if (typeof entry === "string" || typeof entry === "number")
        return String(entry);
    if (typeof entry !== "object")
        return null;
    const label = _resolveEntryLabel(entry);
    const val = entry.value != null ? String(entry.value) : null;
    if (label && val)
        return label + " : " + val;
    return label ?? val ?? null;
}
/**
 * Builds the rendu of a item de type "list".
 *
 * @param {*} value - Array ou string (lines separatedes).
 * @returns {HTMLElement|null} Element ul ou null.
 */
function renderList(value) {
    const items = [];
    if (Array.isArray(value)) {
        value.forEach(function (entry) {
            const text = _resolveListEntry(entry);
            if (text !== null)
                items.push(text);
        });
    }
    else if (typeof value === "string") {
        value.split(/\r?\n/).forEach(function (line) {
            const trimmed = line.trim();
            if (trimmed) {
                items.push(trimmed);
            }
        });
    }
    if (!items.length) {
        return null;
    }
    const ul = createElement("ul", {
        className: "gl-poi-panel__list",
    });
    items.forEach(function (text) {
        const li = createElement("li", {
            className: "gl-poi-panel__list-item",
            textContent: text,
        });
        ul.appendChild(li);
    });
    return ul;
}
/**
 * Builds the rendu of a item de type "table".
 *
 * @param {Array} value - Array of objects representing the rows.
 * @param {object} item - Configuration du array (columns, borders).
 * @returns {HTMLElement|null} Wrapper de array ou null.
 */
function _buildTableBorderClass(borders) {
    const cls = [];
    if (borders.outer)
        cls.push("gl-poi-panel__table--border-outer");
    if (borders.row)
        cls.push("gl-poi-panel__table--border-row");
    if (borders.column)
        cls.push("gl-poi-panel__table--border-column");
    return cls.length ? " " + cls.join(" ") : "";
}
function _buildPanelTableHead(columns) {
    const thead = createElement("thead");
    const headRow = createElement("tr", {
        className: "gl-poi-panel__table-row gl-poi-panel__table-row--head",
    });
    columns.forEach(function (col) {
        const th = createElement("th", {
            className: "gl-poi-panel__table-cell gl-poi-panel__table-cell--head",
            textContent: col.label || col.key || "",
        });
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    return thead;
}
function _buildPanelTableBody(value, columns) {
    const tbody = createElement("tbody");
    value.forEach(function (rowObj) {
        if (!rowObj || typeof rowObj !== "object")
            return;
        const tr = createElement("tr", { className: "gl-poi-panel__table-row" });
        columns.forEach(function (col) {
            const cellVal = rowObj[col.key];
            const td = createElement("td", {
                className: "gl-poi-panel__table-cell",
                textContent: cellVal == null ? "" : String(cellVal),
            });
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    return tbody;
}
function renderTable(value, item) {
    if (!Array.isArray(value) || !value.length) {
        return null;
    }
    const columns = Array.isArray(item.columns) ? item.columns : [];
    if (!columns.length) {
        return null;
    }
    const wrapper = createElement("div", {
        className: "gl-poi-panel__table-wrapper",
    });
    const borders = item.borders || {};
    const table = createElement("table", {
        className: "gl-poi-panel__table" + _buildTableBorderClass(borders),
        attributes: borders.color ? { "data-gl-border-color": borders.color } : {},
    });
    table.appendChild(_buildPanelTableHead(columns));
    table.appendChild(_buildPanelTableBody(value, columns));
    wrapper.appendChild(table);
    return wrapper;
}
/**
 * Builds the rendu of a item de type "gallery".
 *
 * @param {Array} value - Array d'images { url, alt, caption }.
 * @returns {HTMLElement|null} Container gallery ou null.
 */
function renderGallery(value) {
    if (!Array.isArray(value)) {
        return null;
    }
    const container = createElement("div", {
        className: "gl-poi-panel__gallery",
    });
    value.forEach(function (img) {
        if (!img)
            return;
        const figure = createElement("figure", {
            className: "gl-poi-panel__gallery-item",
        });
        const imgEl = createElement("img", {
            src: img.url || img,
            alt: img.alt || "",
        });
        figure.appendChild(imgEl);
        if (img.caption) {
            const figCap = createElement("figcaption", {
                textContent: img.caption,
            });
            figure.appendChild(figCap);
        }
        container.appendChild(figure);
    });
    return container;
}
function _appendReviewFooter(review) {
    const footer = createElement("footer", { className: "gl-poi-panel__review-footer" });
    if (typeof review.helpfulCount === "number") {
        footer.appendChild(createElement("span", {
            className: "gl-poi-panel__review-helpful",
            textContent: review.helpfulCount + " personnes ont found cet avis utile",
        }));
    }
    if (review.url) {
        footer.appendChild(createElement("a", {
            href: review.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "gl-poi-panel__review-link",
            textContent: "Voir l'avis",
        }));
    }
    return footer;
}
function _renderReviewItem(review) {
    const itemEl = createElement("article", { className: "gl-poi-panel__review" });
    const header = createElement("header", { className: "gl-poi-panel__review-header" });
    header.appendChild(createElement("span", {
        className: "gl-poi-panel__review-author",
        textContent: review.authorName || "",
    }));
    if (typeof review.rating === "number") {
        header.appendChild(createElement("span", {
            className: "gl-poi-panel__review-rating",
            textContent: review.rating.toFixed(1) + "/5",
        }));
    }
    if (review.source) {
        header.appendChild(createElement("span", {
            className: "gl-poi-panel__review-source",
            textContent: review.source,
        }));
    }
    itemEl.appendChild(header);
    if (review.title) {
        itemEl.appendChild(createElement("h4", { className: "gl-poi-panel__review-title", textContent: review.title }));
    }
    const reviewText = review.text || review.comment;
    if (reviewText) {
        itemEl.appendChild(createElement("p", { className: "gl-poi-panel__review-text", textContent: reviewText }));
    }
    const reviewDate = review.date || review.createdAt;
    if (reviewDate) {
        itemEl.appendChild(createElement("time", { className: "gl-poi-panel__review-date", textContent: reviewDate }));
    }
    itemEl.appendChild(_appendReviewFooter(review));
    return itemEl;
}
/**
 * Builds the rendu of a item de type "reviews" (avis voyageurs).
 *
 * @param {*} value - Array ou object avec property 'recent'.
 * @returns {HTMLElement|null} Container d'avis ou null.
 */
function renderReviews(value) {
    // Si value est an object with ae property 'recent', utiliser celle-ci
    let reviewsArray = value;
    if (value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Array.isArray(value.recent)) {
        reviewsArray = value.recent;
    }
    if (!Array.isArray(reviewsArray)) {
        return null;
    }
    const container = createElement("div", {
        className: "gl-poi-panel__reviews gl-poi-sidepanel__reviews",
    });
    reviewsArray.forEach(function (review) {
        if (!review)
            return;
        container.appendChild(_renderReviewItem(review));
    });
    return container;
}
/**
 * Builds the contenu internal for a item de layout.
 * Dispatcher main to thes fonctions de rendu specialized.
 *
 * @param {object} poi - Object POI source.
 * @param {object} item - Configuration du layout item (type, field, variant, etc).
 * @returns {HTMLElement|null} Element construit ou null.
 */
function buildLayoutItemContent(poi, item) {
    const type = item.type;
    const value = resolveField(poi, item.field);
    if (value == null || value === "") {
        if (!Array.isArray(value)) {
            return null;
        }
    }
    // Dispatch par type
    if (type === "text") {
        return renderText(value, item.variant);
    }
    if (type === "list") {
        return renderList(value);
    }
    if (type === "table") {
        return renderTable(value, item);
    }
    if (type === "gallery") {
        return renderGallery(value);
    }
    if (type === "reviews") {
        return renderReviews(value);
    }
    // Fallback : text simple
    const defaultDiv = createElement("div", {
        className: "gl-poi-panel__text",
        textContent: String(value),
    });
    return defaultDiv;
}
// ── ESM Export ──
const PanelBuilder = {
    resolveField,
    createPlainSection,
    createAccordionSection,
    renderText,
    renderList,
    renderTable,
    renderGallery,
    renderReviews,
    buildLayoutItemContent,
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module GeoLeaf.UI.ScaleControl
 * @description Scale control for the map (graphic or numeric)
 * @version 2.0.0
 */
const Config$2 = Config$3;
function _detachScaleListeners(ctx) {
    if (ctx._map) {
        if (ctx._boundUpdateNumericScale) {
            ctx._map.off("zoomend", ctx._boundUpdateNumericScale);
            ctx._map.off("moveend", ctx._boundUpdateNumericScale);
            ctx._boundUpdateNumericScale = null;
        }
        if (ctx._boundUpdateGraphicScale) {
            ctx._map.off("zoomend", ctx._boundUpdateGraphicScale);
            ctx._map.off("moveend", ctx._boundUpdateGraphicScale);
            ctx._boundUpdateGraphicScale = null;
        }
    }
    ctx._controlHandle?.remove();
    ctx._controlHandle = null;
    if (ctx._cleanups) {
        for (const fn of ctx._cleanups)
            fn();
        ctx._cleanups = [];
    }
}
/**
 * Scale control module
 * Displays the map scale in graphic or numeric (1:25000) mode
 */
const ScaleControl = {
    _map: null,
    _controlHandle: null,
    _scaleElement: null,
    _zoomElement: null,
    _scaleLineMetric: null,
    _boundUpdateNumericScale: null,
    _boundUpdateGraphicScale: null,
    _cleanups: [],
    _options: {
        position: "bottomleft",
        scaleType: "graphic", // "graphic" or "numeric" (1:25000)
        metric: true,
        imperial: false,
        maxWidth: 150,
    },
    /**
     * Initializes the scale control
     *
     * @param {any} map - Map adapter instance (IMapAdapter)
     * @param {Object} [options={}] - Configuration options
     * @param {string} [options.position='bottomleft'] - Control position
     * @param {string} [options.scaleType='graphic'] - Scale type ('graphic' or 'numeric')
     * @param {boolean} [options.metric=true] - Display metric scale
     * @param {boolean} [options.imperial=false] - Display imperial scale
     * @param {number} [options.maxWidth=150] - Max width of the graphic scale
     *
     * @example
     * GeoLeaf.UI.ScaleControl.init(map, {
     *   scaleType: 'numeric',
     *   position: 'bottomright'
     * });
     */
    init(map, options = {}) {
        const context = "[GeoLeaf.UI.ScaleControl]";
        try {
            if (!map) {
                throw new Error("A map instance is required.");
            }
            this._map = map;
            this._options = { ...this._options, ...options };
            this._cleanups = [];
            const showScale = Config$2?.get("ui.showScale");
            if (showScale === false) {
                Log.info(`${context} Scale display disabled in configuration.`);
                return;
            }
            // Retrieve the scale type from config
            const scaleType = Config$2?.get("ui.scaleType");
            if (scaleType) {
                this._options.scaleType = scaleType;
            }
            this._createControl();
            Log.info(`${context} Module initialized successfully (type: ${this._options.scaleType}).`);
        }
        catch (err) {
            Log.error(`${context} Error during initialization:`, err.message);
        }
    },
    _createControl() {
        const context = "[GeoLeaf.UI.ScaleControl]";
        try {
            if (this._options.scaleType === "numeric") {
                this._createNumericScale();
            }
            else {
                this._createGraphicScale();
            }
            Log.info(`${context} Scale control created and added to the map.`);
        }
        catch (err) {
            Log.error(`${context} Error creating scale control:`, err.message);
        }
    },
    /**
     * Creates a graphic scale bar using DPI-based / Haversine calculation.
     * Native scale control.
     * @private
     */
    _createGraphicScale() {
        const container = domCreate("div", "gl-scale-graphic gl-control");
        const scaleLine = domCreate("div", "gl-scale-graphic-line", container);
        this._scaleLineMetric = scaleLine;
        // Prevent map interactions when interacting with the scale bar
        blockMapPropagation(container, this._cleanups);
        this._boundUpdateGraphicScale = () => {
            if (!this._map || !this._scaleLineMetric)
                return;
            const maxWidth = this._options.maxWidth || 150;
            const mapHeight = this._map.getContainer().getBoundingClientRect().height;
            const y = mapHeight / 2;
            const p1 = this._map.pointToLatLng({ x: 0, y });
            const p2 = this._map.pointToLatLng({ x: maxWidth, y });
            const maxMeters = haversineDistance(p1, p2);
            this._updateScaleLine(this._scaleLineMetric, maxMeters, maxWidth);
        };
        // Add control to the map via adapter
        this._controlHandle = this._map.addControl(container, this._options.position);
        // Listen for map changes
        this._map.on("zoomend", this._boundUpdateGraphicScale);
        this._map.on("moveend", this._boundUpdateGraphicScale);
        this._boundUpdateGraphicScale();
    },
    /**
     * Updates the graphic scale line width and label.
     * @param {HTMLElement} scaleLine - Scale line element
     * @param {number} maxMeters - Maximum distance in meters
     * @param {number} maxWidth - Maximum pixel width for the bar
     * @private
     */
    _updateScaleLine(scaleLine, maxMeters, maxWidth) {
        const maxKm = maxMeters / 1000;
        let label;
        let ratio;
        if (maxKm > 1) {
            const maxNiceKm = this._getRoundNum(maxKm);
            ratio = maxNiceKm / maxKm;
            label = maxNiceKm + " km";
        }
        else {
            const maxNiceM = this._getRoundNum(maxMeters);
            ratio = maxNiceM / maxMeters;
            label = maxNiceM + " m";
        }
        scaleLine.style.width = Math.round(maxWidth * ratio) + "px";
        scaleLine.textContent = label;
    },
    /**
     * Rounds a number to a "clean" value (1, 2, 5, 10, 20, 50, etc.)
     * @param {number} num - Number to round
     * @returns {number} Rounded number
     * @private
     */
    _getRoundNum(num) {
        const pow10 = Math.pow(10, (Math.floor(num) + "").length - 1);
        const ratio = num / pow10;
        let d;
        if (ratio >= 10)
            d = 10;
        else if (ratio >= 5)
            d = 5;
        else if (ratio >= 3)
            d = 3;
        else if (ratio >= 2)
            d = 2;
        else
            d = 1;
        return pow10 * d;
    },
    _createNumericScale() {
        const container = domCreate("div", "gl-scale-numeric gl-control");
        // Prevent map interactions
        blockMapPropagation(container, this._cleanups);
        // Create a flex container to align scale and zoom
        const flexContainer = domCreate("div", "scale-flex-container", container);
        flexContainer.style.cssText = "display: flex; align-items: center; gap: 8px;";
        // Element for the numeric scale (follows theme)
        this._scaleElement = domCreate("div", "scale-content gl-scale-numeric", flexContainer);
        this._scaleElement.textContent = "1:0";
        // Element for the zoom level (follows theme)
        this._zoomElement = domCreate("div", "zoom-level gl-zoom-badge", flexContainer);
        this._zoomElement.textContent = "Z0";
        // Store bound reference for cleanup
        this._boundUpdateNumericScale = this._updateNumericScale.bind(this);
        // Add control to the map via adapter
        this._controlHandle = this._map.addControl(container, this._options.position);
        // Listen for map changes
        this._updateNumericScale();
        this._map.on("zoomend", this._boundUpdateNumericScale);
        // Perf 6.2.1: 'moveend' instead of 'move' — fires once per pan, not per pixel
        this._map.on("moveend", this._boundUpdateNumericScale);
    },
    _updateNumericScale() {
        if (!this._scaleElement || !this._map)
            return;
        // Get the map center
        const center = this._map.getCenter();
        const zoom = this._map.getZoom();
        // Update zoom level
        if (this._zoomElement) {
            this._zoomElement.textContent = `Z${Number(zoom).toFixed(2)}`;
        }
        // Calculate resolution in meters per pixel at the map center
        // Formula: resolution = (40075016.686 * Math.abs(Math.cos(center.lat * Math.PI / 180))) / Math.pow(2, zoom + 8)
        const metersPerPixel = (156543.03392 * Math.cos((center.lat * Math.PI) / 180)) / Math.pow(2, zoom);
        // Calculate scale (1 screen pixel = X real meters)
        // Scale = real distance / map distance
        // Assuming 96 DPI (standard), so 1 inch = 96 pixels = 0.0254 meters
        const scale = Math.round((metersPerPixel * 96) / 0.0254);
        // Format scale readably
        let scaleText;
        if (scale >= 1000000) {
            scaleText = `1:${(scale / 1000000).toFixed(1)}M`;
        }
        else if (scale >= 1000) {
            scaleText = `1:${(scale / 1000).toFixed(0)}K`;
        }
        else {
            scaleText = `1:${scale}`;
        }
        this._scaleElement.textContent = scaleText;
    },
    /**
     * Destroys the scale control and frees resources
     *
     * @example
     * GeoLeaf.UI.ScaleControl.destroy();
     */
    destroy() {
        const context = "[GeoLeaf.UI.ScaleControl]";
        try {
            _detachScaleListeners(this);
            this._scaleElement = null;
            this._zoomElement = null;
            this._scaleLineMetric = null;
            this._map = null;
        }
        catch (err) {
            Log.error(`${context} Error during destruction:`, err.message);
        }
    },
    /**
     * Displays the scale control (creates it if it doesn't exist)
     *
     * @example
     * GeoLeaf.UI.ScaleControl.show();
     */
    show() {
        if (!this._controlHandle && this._map) {
            this._createControl();
        }
    },
    /**
     * Hides the scale control
     *
     * @example
     * GeoLeaf.UI.ScaleControl.hide();
     */
    hide() {
        const context = "[GeoLeaf.UI.ScaleControl]";
        try {
            _detachScaleListeners(this);
            this._scaleElement = null;
            this._zoomElement = null;
            this._scaleLineMetric = null;
        }
        catch (err) {
            Log.error(`${context} Error during hide:`, err.message);
        }
    },
};

/**
 * GeoLeaf Content Builder - CSS Classes
 * Standard CSS class dictionary used by all template builders.
 *
 * @module ui/content-builder/templates-css-classes
 */
const CSS_CLASSES = {
    // Container classes
    text: "gl-content__text",
    longtext: "gl-content__longtext",
    number: "gl-content__number",
    metric: "gl-content__metric",
    badge: "gl-poi-badge",
    rating: "gl-content__rating",
    image: "gl-content__image",
    link: "gl-content__link",
    list: "gl-content__list",
    table: "gl-content__table",
    tags: "gl-content__tags",
    tag: "gl-content__tag",
    coordinates: "gl-content__coordinates",
    gallery: "gl-content__gallery",
    // Badge variants
    badgeDefault: "gl-poi-badge--default",
    badgeStatus: "gl-poi-badge--status",
    badgePriority: "gl-poi-badge--priority",
    badgeCategory: "gl-poi-badge--category",
    // Rating
    star: "gl-star",
    starFull: "gl-star--full",
    starHalf: "gl-star--half",
    starEmpty: "gl-star--empty",
};

/**
 * GeoLeaf Content Builder - Primitives
 * Base HTML attribute and wrapper helpers used by all template builders.
 *
 * @module ui/content-builder/templates-primitives
 */
/** Builds an HTML `class="..."` attribute from base and optional custom classes. */
function buildClassAttr(baseClass, customClass) {
    const classes = [baseClass];
    if (customClass)
        classes.push(customClass);
    return ' class="' + classes.join(" ") + '"';
}
/** Builds an inline `style="..."` attribute, or an empty string when none. */
function buildStyleAttr(style) {
    return style ? ' style="' + style + '"' : "";
}
/** Builds a `<strong>Label:</strong>` prefix string. */
function buildLabel(label, _icon) {
    if (!label)
        return "";
    return "<strong>" + escapeHtml(label) + ":</strong> ";
}
/** Wraps HTML content in a `<p>` element with base and optional custom classes. */
function wrapInParagraph(content, className, customClass) {
    return "<p" + buildClassAttr(className, customClass) + ">" + content + "</p>";
}
/** Wraps HTML content in a `<div>` element with base and optional custom classes. */
function wrapInDiv(content, className, customClass) {
    return "<div" + buildClassAttr(className, customClass) + ">" + content + "</div>";
}

/**
 * GeoLeaf Content Builder - Text & Metric Template Builders
 * Builders: createTextElement, createLongtextElement, createNumberElement,
 *           createMetricElement, createBadge, createStar, createRatingElement, createLinkElement
 *
 * @module ui/content-builder/templates-text-metric
 */
/** Creates a simple `<p>` text element with an optional label. */
function createTextElement(value, config) {
    const label = buildLabel(config.label);
    const content = label + escapeHtml(value);
    return wrapInParagraph(content, CSS_CLASSES.text, config.className);
}
/** Creates a long-text `<div>` element with a separated label. */
function createLongtextElement(value, config) {
    const label = config.label ? "<p><strong>" + escapeHtml(config.label) + "</strong></p>" : "";
    const content = label + "<p>" + escapeHtml(value) + "</p>";
    return wrapInDiv(content, CSS_CLASSES.longtext, config.className);
}
/** Creates a numeric `<p>` element formatted for the `fr-FR` locale. */
function createNumberElement(value, config) {
    const formatted = value.toLocaleString("fr-FR");
    const label = buildLabel(config.label);
    const suffix = config.suffix ? " " + escapeHtml(config.suffix) : "";
    const prefix = config.prefix ? escapeHtml(config.prefix) + " " : "";
    const content = label + prefix + formatted + suffix;
    return wrapInParagraph(content, CSS_CLASSES.number, config.className);
}
/** Creates a metric `<p>` element (similar to number, with prefix/suffix). */
function createMetricElement(value, config) {
    const formatted = value.toLocaleString("fr-FR");
    const label = buildLabel(config.label);
    const suffix = config.suffix ? escapeHtml(config.suffix) : "";
    const prefix = config.prefix ? escapeHtml(config.prefix) : "";
    const content = label + prefix + formatted + suffix;
    return wrapInParagraph(content, CSS_CLASSES.metric, config.className);
}
/** Creates a badge `<span>` with variant class and optional inline style. */
function createBadge(value, variant, style) {
    const v = variant || "default";
    const variantKey = ("badge" +
        v.charAt(0).toUpperCase() +
        v.slice(1));
    const badgeClass = CSS_CLASSES.badge + " " + (CSS_CLASSES[variantKey] ?? "");
    const styleAttr = buildStyleAttr(style);
    return '<span class="' + badgeClass + '"' + styleAttr + ">" + escapeHtml(value) + "</span>";
}
/** Creates a single star `<span>` element (type: `"full"` | `"half"` | `"empty"`). */
function createStar(type) {
    const starKey = ("star" +
        type.charAt(0).toUpperCase() +
        type.slice(1));
    const starClass = CSS_CLASSES.star + " " + (CSS_CLASSES[starKey] ?? "");
    return '<span class="' + starClass + '">\u2605</span>';
}
/** Creates a star-rating `<div>` element (0–5 stars). */
function createRatingElement(rating, config) {
    let stars = "";
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++)
        stars += createStar("full");
    if (hasHalfStar)
        stars += createStar("half");
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++)
        stars += createStar("empty");
    const ratingText = " (" + rating.toFixed(1) + "/5)";
    const label = buildLabel(config.label);
    const content = label + stars + ratingText;
    return wrapInDiv(content, CSS_CLASSES.rating, config.className);
}
/** Creates a `<a>` link element with `target="_blank"` and safe attribute escaping. */
function createLinkElement(href, config) {
    const text = config.text ? escapeHtml(config.text) : escapeHtml(href);
    const label = buildLabel(config.label);
    const link = '<a href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">' +
        text +
        "</a>";
    const content = label + link;
    return wrapInParagraph(content, CSS_CLASSES.link, config.className);
}

/**
 * GeoLeaf Content Builder - Media & Collection Template Builders
 * Builders: createImageElement, createListElement, createTableElement,
 *           createTag, createTagsElement, createCoordinatesElement, createGalleryElement
 *
 * @module ui/content-builder/templates-media-collection
 */
/** Creates an `<img>` element with escaped `src` and `alt` attributes. */
function createImageElement(src, config) {
    const alt = config.alt ? escapeHtml(config.alt) : "";
    const classAttr = buildClassAttr(CSS_CLASSES.image, config.className);
    return "<img" + classAttr + ' src="' + escapeHtml(src) + '" alt="' + alt + '">';
}
/** Creates a `<ul>` list element from an array of items. */
function createListElement(items, config) {
    const label = config.label ? "<p><strong>" + escapeHtml(config.label) + "</strong></p>" : "";
    let list = "<ul>";
    items.forEach((item) => {
        list += "<li>" + escapeHtml(String(item)) + "</li>";
    });
    list += "</ul>";
    const content = label + list;
    return wrapInDiv(content, CSS_CLASSES.list, config.className);
}
/** Creates a `<table>` element from a key-value data object. */
function createTableElement(data, config) {
    const label = config.label ? "<p><strong>" + escapeHtml(config.label) + "</strong></p>" : "";
    let table = "<table><tbody>";
    Object.keys(data).forEach((key) => {
        const keyLabel = escapeHtml(String(key));
        const value = escapeHtml(String(data[key]));
        table += "<tr><th>" + keyLabel + "</th><td>" + value + "</td></tr>";
    });
    table += "</tbody></table>";
    const content = label + table;
    return wrapInDiv(content, CSS_CLASSES.table, config.className);
}
/** Creates a single tag `<span>` element. */
function createTag(tag) {
    return '<span class="' + CSS_CLASSES.tag + '">' + escapeHtml(String(tag)) + "</span>";
}
/** Creates a tag cloud `<div>` element from an array of tag values. */
function createTagsElement(tags, config) {
    let content = "";
    tags.forEach((tag) => {
        content += createTag(tag) + " ";
    });
    return wrapInDiv(content.trim(), CSS_CLASSES.tags, config.className);
}
/** Creates a coordinates `<p>` element from lat/lng numbers. */
function createCoordinatesElement(lat, lng, config) {
    const latFixed = lat.toFixed(6);
    const lngFixed = lng.toFixed(6);
    const content = "<strong>Coordonn\u00e9es:</strong> " + latFixed + ", " + lngFixed;
    return wrapInParagraph(content, CSS_CLASSES.coordinates, config.className);
}
/** Creates a gallery `<div>` element from an array of photo URLs. */
function createGalleryElement(photos, config) {
    let gallery = "";
    photos.forEach((photo) => {
        gallery += '<img src="' + escapeHtml(photo) + '" alt="Photo">';
    });
    return wrapInDiv(gallery, CSS_CLASSES.gallery, config.className);
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf Content Builder - Templates Module
 * Orchestrateur — importe et re-exporte tous les template builders.
 *
 * @module ui/content-builder/templates
 * @version 1.2.0
 * @phase Phase 3 - UI Refactoring
 */
// ========================================
//   EXPORT
// ========================================
const Templates = {
    // Classes CSS
    CSS_CLASSES,
    // Helpers de base
    buildClassAttr,
    buildStyleAttr,
    buildLabel,
    wrapInParagraph,
    wrapInDiv,
    // Template builders
    createTextElement,
    createLongtextElement,
    createNumberElement,
    createMetricElement,
    createBadge,
    createStar,
    createRatingElement,
    createImageElement,
    createLinkElement,
    createListElement,
    createTableElement,
    createTag,
    createTagsElement,
    createCoordinatesElement,
    createGalleryElement,
};

/**
 * GeoLeaf UI Filter Panel - Shared Helpers
 * Fonctions utilitaires sharedes pour the panel de filtres
 *
 * @module ui/filter-panel/shared
 */
const Config$1 = Config$3;
const _runtime = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
// _runtime used only for legacy demo fallback (_runtime.cfg)
const FilterPanelShared = {};
function _isPointGeom(geom) {
    return geom?.type?.toLowerCase().indexOf("point") !== -1;
}
function _isLineGeom(geom) {
    return geom?.type?.toLowerCase().indexOf("line") !== -1;
}
function _enrichPoiProps(poi, props, feature, latlng) {
    if (!poi.title && props.name)
        poi.title = props.name;
    if (!poi.id && feature.id)
        poi.id = feature.id;
    if (!poi.latlng && latlng)
        poi.latlng = latlng;
    if (!poi.attributes && props.attributes)
        poi.attributes = props.attributes;
}
function _enrichRouteProps(route, props, feature) {
    if (!route.title && props.name)
        route.title = props.name;
    if (!route.id && feature.id)
        route.id = feature.id;
}
function _isProtectedArea(props) {
    const hasOtherProperties = Object.keys(props).some((key) => !["fid", "name", "Name", "region", "REGION", "Region"].includes(key));
    return !hasOtherProperties && (props.fid !== undefined || props.Name);
}
// ========================================
//   CONVERSION DE FEATURES
// ========================================
/**
 * Converts ae feature GeoJSON Point en object POI-like
 * @param {Object} feature - Feature GeoJSON
 * @returns {Object|null} - POI-like ou null
 */
FilterPanelShared.featureToPoiLike = function (feature) {
    if (!feature || !feature.geometry || !feature.properties)
        return null;
    const geom = feature.geometry;
    if (!geom || !_isPointGeom(geom))
        return null;
    const coords = Array.isArray(geom.coordinates) ? geom.coordinates : null;
    const latlng = coords && coords.length >= 2 ? [coords[1], coords[0]] : null;
    const props = feature.properties ?? {};
    const poi = Object.assign({}, props);
    _enrichPoiProps(poi, props, feature, latlng);
    return poi;
};
/**
 * Converts ae feature GeoJSON LineString en object Route-like
 * @param {Object} feature - Feature GeoJSON
 * @returns {Object|null} - Route-like ou null
 */
FilterPanelShared.featureToRouteLike = function (feature) {
    if (!feature || !feature.geometry || !feature.properties)
        return null;
    const geom = feature.geometry;
    if (!geom || !_isLineGeom(geom))
        return null;
    const props = feature.properties ?? {};
    // Exclude protected areas (aires_protegees_nationales) - they should not be treated as routes/itineraries
    if (_isProtectedArea(props))
        return null;
    const route = Object.assign({}, props);
    _enrichRouteProps(route, props, feature);
    route.geometry = geom;
    return route;
};
// ========================================
//   DATA RETRIEVAL
// ========================================
function _resolvePoiFromGeoJSON(featureToPoiLike) {
    if (!GeoJSONCore || typeof GeoJSONCore.getFeatures !== "function")
        return null;
    const feats = GeoJSONCore.getFeatures({ geometryTypes: ["point"] }) ?? [];
    const pois = feats.map(featureToPoiLike).filter(Boolean);
    return pois.length ? pois : null;
}
function _resolvePoiFromConfig() {
    if (!Config$1)
        return null;
    if (typeof Config$1.get === "function") {
        const fromGet = Config$1.get("poi");
        if (Array.isArray(fromGet))
            return fromGet;
    }
    if (Array.isArray(Config$1._activeProfileData?.poi))
        return Config$1._activeProfileData.poi;
    return null;
}
function _resolveRoutesFromGeoJSON(featureToRouteLike) {
    if (!GeoJSONCore || typeof GeoJSONCore.getFeatures !== "function")
        return null;
    const feats = GeoJSONCore.getFeatures({ geometryTypes: ["line", "linestring", "multilinestring"] }) ?? [];
    const routes = feats.map(featureToRouteLike).filter(Boolean);
    return routes.length ? routes : null;
}
function _resolveRoutesFromConfig() {
    if (!Config$1)
        return null;
    if (typeof Config$1.get === "function") {
        const fromGet = Config$1.get("routes");
        if (Array.isArray(fromGet))
            return fromGet;
    }
    if (Array.isArray(Config$1._activeProfileData?.routes))
        return Config$1._activeProfileData.routes;
    return null;
}
/**
 * Retrieves tous les POI from thes different sources
 * @returns {Array} - List des POI
 */
FilterPanelShared.getBasePois = function () {
    const Log = getLog();
    try {
        const result = _resolvePoiFromGeoJSON(FilterPanelShared.featureToPoiLike);
        if (result)
            return result;
    }
    catch (err) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Error retrieving POI via GeoJSON:", err);
    }
    try {
        const result = _resolvePoiFromConfig();
        if (result)
            return result;
    }
    catch (err) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Error retrieving POI via Config:", err);
    }
    if (_runtime.cfg && Array.isArray(_runtime.cfg.poi))
        return _runtime.cfg.poi;
    return [];
};
/**
 * Retrieves toutes les routes from thes different sources
 * @returns {Array} - List des routes
 */
FilterPanelShared.getBaseRoutes = function () {
    const Log = getLog();
    try {
        const result = _resolveRoutesFromGeoJSON(FilterPanelShared.featureToRouteLike);
        if (result)
            return result;
    }
    catch (err) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Error retrieving routes via GeoJSON:", err);
    }
    try {
        const result = _resolveRoutesFromConfig();
        if (result)
            return result;
    }
    catch (err) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Error retrieving routes via Config:", err);
    }
    if (_runtime.cfg && Array.isArray(_runtime.cfg.routes))
        return _runtime.cfg.routes;
    return [];
};
// ========================================
//   UTILITAIRES
// ========================================
/**
 * Returns the element DOM du filter panels.
 * Priority au conteneur flottant #gl-filter-panel, puis fallback #gl-left-panel.
 * @returns {HTMLElement|null}
 */
FilterPanelShared.getFilterPanelElement = function () {
    let el = document.getElementById("gl-filter-panel");
    if (el)
        return el;
    el = document.getElementById("gl-left-panel");
    if (el)
        return el;
    const Log = getLog();
    Log.warn("[GeoLeaf.UI.FilterPanel] No filter panel container found (#gl-filter-panel / #gl-left-panel).");
    return null;
};
/**
 * Access to a nested property (Phase 4 dedup: delegates to Utils)
 */
FilterPanelShared.getNestedValue = getNestedValue$1;
/**
 * Extracts a representative point from a geometry (for distance calculation)
 * @param {Object} geometry - GeoJSON geometry
 * @returns {Object|null} - { lat, lng } ou null
 */
function _coordToLatLng(coords) {
    return coords ? { lng: coords[0], lat: coords[1] } : null;
}
function _midPoint(coordsArray) {
    if (!coordsArray || coordsArray.length === 0)
        return null;
    const c = coordsArray[Math.floor(coordsArray.length / 2)];
    return { lng: c[0], lat: c[1] };
}
FilterPanelShared.getRepresentativePoint = function (geometry) {
    if (!geometry || !geometry.coordinates)
        return null;
    switch (geometry.type) {
        case "Polygon":
            return _coordToLatLng(geometry.coordinates[0][0]);
        case "MultiPolygon":
            return _coordToLatLng(geometry.coordinates[0][0][0]);
        case "LineString":
            return _midPoint(geometry.coordinates);
        case "MultiLineString":
            return _midPoint(geometry.coordinates[0]);
        case "Point":
            return { lng: geometry.coordinates[0], lat: geometry.coordinates[1] };
        case "MultiPoint":
            return _coordToLatLng(geometry.coordinates[0]);
        default:
            return null;
    }
};
/**
 * Collecte tous les tags uniques from a list d'items
 * @param {Array} items - List d'items (POI, routes)
 * @returns {Array} - Tags uniques sorted
 */
FilterPanelShared.collectAllTags = function (items) {
    const tagSet = new Set();
    items.forEach(function (item) {
        // Support GeoJSON properties.attributes.tags, item.attributes.tags, et item.tags
        const props = item.properties || item;
        const attrs = props.attributes || item.attributes || {};
        const tags = attrs.tags || props.tags || item.tags;
        if (Array.isArray(tags) && tags.length > 0) {
            tags.forEach(function (t) {
                if (t && typeof t === "string") {
                    tagSet.add(t);
                }
            });
        }
    });
    const arr = Array.from(tagSet);
    arr.sort();
    return arr;
};

/**
 * Shared state entre tous les sous-modules de proximity.
 * Remplace les olds variables module-locales de proximity.ts.
 */
const ProximityState = {
    /** Mode proximity active ou non */
    mode: false,
    /** Current proximity circle */
    circle: null,
    /** Current proximity marker */
    marker: null,
    /** Reference to the map */
    map: null,
    /** Handler de click manuel sur the map */
    clickHandler: null,
    /** Pre-selected radius before the marker is placed */
    pendingRadius: null,
    /** Cleanups des event listners */
    eventCleanups: [],
};

/** Unique layer/marker IDs used by the proximity module. */
const CIRCLE_LAYER_ID = "__gl_proximity_circle";
const MARKER_ID = "__gl_proximity_marker";
function _resolveNativeMarker(map) {
    const nativeMap = map.getNativeMap?.() ?? null;
    return nativeMap
        ? (map._markers?.get(MARKER_ID) ?? null)
        : null;
}
function _attachDragendSync(nativeMarker, wrapper) {
    nativeMarker.on("dragend", () => {
        const ll = nativeMarker.getLngLat();
        const pos = { lat: ll.lat, lng: ll.lng };
        if (ProximityState.circle && ProximityState.circle.setLatLng) {
            ProximityState.circle.setLatLng(pos);
        }
        wrapper.setAttribute("data-proximity-lat", String(pos.lat));
        wrapper.setAttribute("data-proximity-lng", String(pos.lng));
    });
}
function _buildMarkerHandle(nativeMarker, latlng) {
    return {
        _id: MARKER_ID,
        getLatLng() {
            if (nativeMarker) {
                const ll = nativeMarker.getLngLat();
                return { lat: ll.lat, lng: ll.lng };
            }
            return latlng;
        },
    };
}
/**
 * Generates a GeoJSON Polygon approximating a circle.
 * @param center - { lat, lng } center of the circle
 * @param radiusMeters - radius in meters
 * @param steps - number of polygon vertices (default 64)
 */
function _circlePolygon(center, radiusMeters, steps = 64) {
    const coords = [];
    const earthRadius = 6371008.8;
    const lat = (center.lat * Math.PI) / 180;
    const lng = (center.lng * Math.PI) / 180;
    const d = radiusMeters / earthRadius;
    for (let i = 0; i <= steps; i++) {
        const bearing = (2 * Math.PI * i) / steps;
        const pLat = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(bearing));
        const pLng = lng +
            Math.atan2(Math.sin(bearing) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(pLat));
        coords.push([(pLng * 180) / Math.PI, (pLat * 180) / Math.PI]);
    }
    return {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [coords] },
    };
}
/**
 * Creates the proximity circle overlay and stores a reference in ProximityState.circle.
 */
function createProximityCircle(latlng, radiusMeters, map) {
    const fc = {
        type: "FeatureCollection",
        features: [_circlePolygon(latlng, radiusMeters)],
    };
    // Remove previous circle layer if present
    if (map.hasLayer && map.hasLayer(CIRCLE_LAYER_ID)) {
        map.removeLayer(CIRCLE_LAYER_ID);
    }
    map.addGeoJSONLayer(CIRCLE_LAYER_ID, fc, {
        color: "#c2410c",
        fillColor: "#c2410c",
        fillOpacity: 0.2,
        weight: 2,
        opacity: 1,
        interactive: false,
    });
    // Closure variables for mutable circle state (avoids `this` type issues with interface cast)
    let _center = { lat: latlng.lat, lng: latlng.lng };
    let _radius = radiusMeters;
    // Store a handle so other modules can detect circle presence & update it
    ProximityState.circle = {
        /** Update circle radius (re-creates the GeoJSON polygon). */
        setRadius(newRadiusMeters) {
            _radius = newRadiusMeters;
            const newFc = {
                type: "FeatureCollection",
                features: [_circlePolygon(_center, newRadiusMeters)],
            };
            if (map.updateLayerData) {
                map.updateLayerData(CIRCLE_LAYER_ID, newFc);
            }
        },
        setLatLng(ll) {
            _center = { lat: ll.lat, lng: ll.lng };
            const newFc = {
                type: "FeatureCollection",
                features: [_circlePolygon(ll, _radius)],
            };
            if (map.updateLayerData) {
                map.updateLayerData(CIRCLE_LAYER_ID, newFc);
            }
        },
        getCenter() {
            return _center;
        },
        getRadius() {
            return _radius;
        },
        getLatLng() {
            return _center;
        },
    };
}
/**
 * Creates the GPS marker (blue, draggable) and stores it in ProximityState.marker.
 * Attaches dragend to synchronize the circle and the wrapper data attributes.
 */
function createGPSMarker(latlng, map, wrapper) {
    // Remove previous marker if present
    if (map.removeMarker) {
        try {
            map.removeMarker(MARKER_ID);
        }
        catch (_e) {
            /* noop */
        }
    }
    map.createMarker(MARKER_ID, latlng, {
        draggable: true,
        icon: '<div style="width:20px;height:20px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
    const nativeMarker = _resolveNativeMarker(map);
    if (nativeMarker && typeof nativeMarker.on === "function") {
        _attachDragendSync(nativeMarker, wrapper);
    }
    ProximityState.marker = _buildMarkerHandle(nativeMarker, latlng);
}
/**
 * Creates the manual marker (default style, draggable) and stores it in ProximityState.marker.
 * Attaches dragend to synchronize the circle and the wrapper data attributes.
 */
function createManualMarker(latlng, map, wrapper) {
    // Remove previous marker if present
    if (map.removeMarker) {
        try {
            map.removeMarker(MARKER_ID);
        }
        catch (_e) {
            /* noop */
        }
    }
    map.createMarker(MARKER_ID, latlng, { draggable: true });
    const nativeMarker = _resolveNativeMarker(map);
    if (nativeMarker && typeof nativeMarker.on === "function") {
        _attachDragendSync(nativeMarker, wrapper);
    }
    ProximityState.marker = _buildMarkerHandle(nativeMarker, latlng);
}
/**
 * Removes the circle overlay and marker from the map, resets ProximityState references.
 */
function removeCircleAndMarker(map) {
    if (ProximityState.circle) {
        try {
            if (map.hasLayer && map.hasLayer(CIRCLE_LAYER_ID)) {
                map.removeLayer(CIRCLE_LAYER_ID);
            }
        }
        catch (_e) {
            /* noop */
        }
        ProximityState.circle = null;
    }
    if (ProximityState.marker) {
        try {
            if (map.removeMarker) {
                map.removeMarker(MARKER_ID);
            }
        }
        catch (_e) {
            /* noop */
        }
        ProximityState.marker = null;
    }
}

/**
 * GeoLeaf UI Filter Panel - Proximity GPS Mode
 * Activation du mode proximity par position GPS — compatible panel ET toolbar.
 * Eliminates duplication between activateGPSMode() (panel) and GPS branch
 * de toggleProximityToolbar() (toolbar).
 *
 * @module ui/filter-panel/proximity-gps-mode
 */
/**
 * Activates GPS mode on a given DOM wrapper.
 * Utilisable from the panel (wrapper via container.closest) comme from the toolbar
 * (wrapper virtuel via getElementById).
 *
 * @param map        - Instance de carte MapLibre
 * @param wrapper    - Element [data-gl-filter-id="proximity"] recevant les attributes data-proximity-*
 * @param radiusKm   - Radius in kilometers
 * @param options    - Callbacks optionals (onPointPlaced)
 */
function activateGPSMode(map, wrapper, radiusKm, options) {
    const Log = getLog();
    removeCircleAndMarker(map);
    const gpsPos = GeoLocationState.userPosition;
    if (!gpsPos) {
        Log.warn("[GeoLeaf.Proximity] activateGPSMode: no GPS position available");
        return;
    }
    const gpsLatLng = {
        lat: gpsPos.lat,
        lng: gpsPos.lng,
    };
    createProximityCircle(gpsLatLng, radiusKm * 1000, map);
    if (!GeoLocationState.active) {
        // GPS non en suivi continu : create a marker GPS draggable
        createGPSMarker(gpsLatLng, map, wrapper);
    }
    else {
        ProximityState.marker = null;
        Log.info("[GeoLeaf.Proximity] Circle displayed around continuous tracking GPS marker");
    }
    if (!wrapper) {
        Log.warn("[GeoLeaf.Proximity] activateGPSMode: wrapper not found, attributes not updated");
        return;
    }
    wrapper.setAttribute("data-proximity-lat", String(gpsLatLng.lat));
    wrapper.setAttribute("data-proximity-lng", String(gpsLatLng.lng));
    wrapper.setAttribute("data-proximity-radius", String(radiusKm));
    wrapper.setAttribute("data-proximity-active", "true");
    map.setView(gpsLatLng, Math.max(map.getZoom(), 14));
    // Pas de handler de click required in mode GPS
    ProximityState.clickHandler = null;
    Log.info("[GeoLeaf.Proximity] GPS mode enabled", {
        lat: gpsLatLng.lat,
        lng: gpsLatLng.lng,
        radius: radiusKm,
    });
    options?.onPointPlaced?.();
}
/**
 * Checks if a recent GPS position (< 5 minutes) is available.
 */
function hasRecentGPS() {
    return (!!GeoLocationState.userPosition &&
        Date.now() - (GeoLocationState.userPosition.timestamp ?? 0) < 300000);
}

/**
 * GeoLeaf UI Filter Panel - Proximity Manual Mode
 * Activation du mode proximity par click manuel sur the map — compatible panel ET toolbar.
 * Eliminates duplication between activateManualMode() (panel) and the manual branch
 * de toggleProximityToolbar() (toolbar).
 *
 * Note : le radius est lu via callback au moment du click (pas to the activation) pour
 * capture the current slider value, including if it changed after activation.
 *
 * @module ui/filter-panel/proximity-manual-mode
 */
/**
 * Activates manual mode on a given DOM wrapper.
 * Utilisable from the panel comme from the toolbar.
 *
 * @param map          - Instance de carte MapLibre
 * @param wrapper      - Element [data-gl-filter-id="proximity"] recevant les attributes data-proximity-*
 * @param getRadiusKm  - Callback called au click pour lire le radius current en km
 * @param options      - Callbacks optionals (onPointPlaced)
 */
function activateManualMode(map, wrapper, getRadiusKm, options) {
    const Log = getLog();
    Log.info("[GeoLeaf.Proximity] Manual mode: click on the map to define the search point");
    map.getContainer().style.cursor = "crosshair";
    ProximityState.clickHandler = function (e) {
        // Lire le radius au moment du click, pas to the activation
        const event = e;
        const radiusKm = getRadiusKm();
        const radiusMeters = radiusKm * 1000;
        removeCircleAndMarker(map);
        createProximityCircle(event.latlng, radiusMeters, map);
        createManualMarker(event.latlng, map, wrapper);
        if (!wrapper) {
            Log.warn("[GeoLeaf.Proximity] clickHandler: wrapper not found, attributes not updated");
            return;
        }
        wrapper.setAttribute("data-proximity-lat", String(event.latlng.lat));
        wrapper.setAttribute("data-proximity-lng", String(event.latlng.lng));
        wrapper.setAttribute("data-proximity-radius", String(radiusKm));
        wrapper.setAttribute("data-proximity-active", "true");
        map.getContainer().style.cursor = "";
        map.off("click", ProximityState.clickHandler);
        ProximityState.clickHandler = null;
        Log.info("[GeoLeaf.Proximity] Manual proximity point defined", {
            lat: event.latlng.lat,
            lng: event.latlng.lng,
            radius: radiusKm,
        });
        options?.onPointPlaced?.();
    };
    map.on("click", ProximityState.clickHandler);
}

/**
 * GeoLeaf UI Filter Panel - Proximity Deactivation
 * Deactivation et cleanup du mode proximity — shared panel + toolbar.
 *
 * @module ui/filter-panel/proximity-deactivation
 */
/**
 * Nettoie les elements cartographicals : circle, marker, handler de click, cursor.
 * N'agit pas sur le DOM du panel.
 */
function cleanupMapElements(map) {
    map.getContainer().style.cursor = "";
    if (ProximityState.clickHandler) {
        map.off("click", ProximityState.clickHandler);
        ProximityState.clickHandler = null;
    }
    removeCircleAndMarker(map);
}
/**
 * Deactivates le mode proximity from the panel de filtres.
 * Remet l'UI panel to son initial state et nettoie the map.
 */
function deactivatePanel$1(btn, container, map) {
    const Log = getLog();
    btn.textContent = getLabel("ui.filter.activate");
    btn.classList.remove("gl-is-active");
    const rangeWrapper = container.querySelector(".gl-filter-panel__proximity-range");
    const instruction = container.querySelector(".gl-filter-panel__proximity-instruction");
    if (rangeWrapper)
        rangeWrapper.style.display = "none";
    if (instruction)
        instruction.style.display = "none";
    cleanupMapElements(map);
    // Reset le slider to sa value by default
    const radiusInput = container.querySelector("[data-filter-proximity-radius]");
    if (radiusInput) {
        const defaultVal = radiusInput.getAttribute("data-proximity-radius-default") || radiusInput.min || "10";
        radiusInput.value = defaultVal;
        const rangeValueSpan = radiusInput
            .closest(".gl-filter-panel__range-wrapper")
            ?.querySelector(".gl-filter-panel__range-value");
        if (rangeValueSpan)
            rangeValueSpan.textContent = defaultVal;
    }
    // Retirer les attributes data-proximity-* du wrapper
    const wrapper = container.closest("[data-gl-filter-id='proximity']");
    if (wrapper) {
        wrapper.removeAttribute("data-proximity-active");
        wrapper.removeAttribute("data-proximity-lat");
        wrapper.removeAttribute("data-proximity-lng");
        wrapper.removeAttribute("data-proximity-radius");
    }
    ProximityState.pendingRadius = null;
    Log.info("[GeoLeaf.Proximity] Proximity mode disabled (panel)");
}
/**
 * Reinitializes le mode proximity from l'outer (ex. button "Reset").
 * Ne key qu'aux elements cartographicals, pas au DOM du panel.
 */
function resetProximity() {
    if (!ProximityState.map)
        return;
    cleanupMapElements(ProximityState.map);
    ProximityState.mode = false;
}

/**
 * GeoLeaf UI Filter Panel - Proximity
 * Orchestrateur of the module de proximity (panel + toolbar).
 * The state and domain logic are delegated to sub-modules:
 *   - proximity-state.ts      : shared state
 *   - proximity-circle.ts     : creation/removal des elements cartographicals
 *   - proximity-gps-mode.ts   : activation GPS (panel + toolbar)
 *   - proximity-manual-mode.ts: activation manuelle (panel + toolbar)
 *   - proximity-deactivation.ts: deactivation/cleanup
 *
 * @module ui/filter-panel/proximity
 */
const FilterPanelProximity$1 = {};
/**
 * Initializes the feature de proximity
 * @param {unknown} map - Map instance
 */
function _attachProximityEvents(Log, map) {
    const inputHandler = function (evt) {
        const target = evt.target;
        const slider = target?.closest("[data-filter-proximity-radius]");
        if (!slider)
            return;
        const proximityControl = slider.closest(".gl-filter-panel__proximity");
        if (!proximityControl)
            return;
        const wrapper = proximityControl.closest("[data-gl-filter-id='proximity']");
        if (!wrapper)
            return;
        const newRadius = parseFloat(slider.value);
        wrapper.setAttribute("data-proximity-radius", String(newRadius));
        if (ProximityState.circle)
            ProximityState.circle.setRadius(newRadius * 1000);
    };
    const clickHandler = function (evt) {
        const target = evt.target;
        const btn = target?.closest("[data-filter-proximity-btn]");
        if (!btn)
            return;
        evt.preventDefault();
        FilterPanelProximity$1.toggleProximityMode(btn, map);
    };
    if (events) {
        ProximityState.eventCleanups.push(events.on(document, "input", inputHandler, false, "ProximityFilter.radiusInput"));
        ProximityState.eventCleanups.push(events.on(document, "click", clickHandler, false, "ProximityFilter.buttonClick"));
    }
    else {
        Log.warn("[ProximityFilter] EventListenerManager not available - listeners will not be cleaned up");
        document.addEventListener("input", inputHandler);
        document.addEventListener("click", clickHandler);
    }
}
FilterPanelProximity$1.initProximityFilter = function (map) {
    const Log = getLog();
    if (!map) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Map not available for proximity filter");
        return;
    }
    ProximityState.mode = false;
    ProximityState.circle = null;
    ProximityState.marker = null;
    ProximityState.map = map;
    ProximityState.clickHandler = null;
    _attachProximityEvents(Log, map);
    Log.info("[GeoLeaf.UI.FilterPanel] Proximity filter initialized");
};
/**
 * Cleanup du proximity filter
 */
FilterPanelProximity$1.destroy = function () {
    const Log = getLog();
    if (ProximityState.eventCleanups && ProximityState.eventCleanups.length > 0) {
        ProximityState.eventCleanups.forEach((cleanup) => {
            if (typeof cleanup === "function")
                cleanup();
        });
        ProximityState.eventCleanups = [];
        Log.info("[ProximityFilter] Event listeners cleaned up");
    }
    if (ProximityState.map) {
        removeCircleAndMarker(ProximityState.map);
    }
    ProximityState.map = null;
    ProximityState.mode = false;
};
/**
 * Switches le mode de proximity from the panel de filtres
 * @param {HTMLElement} btn - Button de proximity
 * @param {unknown} map - Map instance
 */
FilterPanelProximity$1.toggleProximityMode = function (btn, map) {
    ProximityState.mode = !ProximityState.mode;
    const container = btn.closest(".gl-filter-panel__proximity");
    if (!container)
        return;
    const rangeWrapper = container.querySelector(".gl-filter-panel__proximity-range");
    const instruction = container.querySelector(".gl-filter-panel__proximity-instruction");
    if (ProximityState.mode) {
        btn.textContent = getLabel("ui.filter.disable");
        btn.classList.add("gl-is-active");
        if (rangeWrapper)
            rangeWrapper.style.display = "block";
        if (instruction)
            instruction.style.display = "block";
        const wrapper = container.closest("[data-gl-filter-id='proximity']");
        const radiusInput = container.querySelector("[data-filter-proximity-radius]");
        const radiusKm = radiusInput ? parseFloat(radiusInput.value) : 10;
        if (!wrapper)
            return;
        if (hasRecentGPS()) {
            activateGPSMode(map, wrapper, radiusKm);
        }
        else {
            activateManualMode(map, wrapper, () => {
                const inp = container.querySelector("[data-filter-proximity-radius]");
                return inp ? parseFloat(inp.value) : 10;
            });
        }
    }
    else {
        deactivatePanel$1(btn, container, map);
    }
};
/**
 * Active le mode GPS automatic (API public preserved pour compatibility)
 * @param {HTMLElement} container - Container de proximity
 * @param {unknown} map - Map instance
 */
FilterPanelProximity$1.activateGPSMode = function (container, map) {
    const wrapper = container.closest("[data-gl-filter-id='proximity']");
    if (!wrapper)
        return;
    const radiusInput = container.querySelector("[data-filter-proximity-radius]");
    const radiusKm = radiusInput ? parseFloat(radiusInput.value) : 10;
    activateGPSMode(map, wrapper, radiusKm);
};
/**
 * Active le mode manuel (API public preserved pour compatibility)
 * @param {HTMLElement} container - Container de proximity
 * @param {unknown} map - Map instance
 */
FilterPanelProximity$1.activateManualMode = function (container, map) {
    const wrapper = container.closest("[data-gl-filter-id='proximity']");
    if (!wrapper)
        return;
    activateManualMode(map, wrapper, () => {
        const inp = container.querySelector("[data-filter-proximity-radius]");
        return inp ? parseFloat(inp.value) : 10;
    });
};
/**
 * Disables proximity mode (public API preserved for compatibility)
 * @param {HTMLElement} btn - Button de proximity
 * @param {HTMLElement} container - Container de proximity
 * @param {unknown} map - Map instance
 */
FilterPanelProximity$1.deactivateProximityMode = function (btn, container, map) {
    deactivatePanel$1(btn, container, map);
};
/**
 * Reinitializes completement le mode proximity from l'outer (ex. button "Reset").
 */
FilterPanelProximity$1.resetProximity = resetProximity;
/**
 * Active/deactivates la recherche par proximity from the bar mobile,
 * sans dependency au DOM du filter panels.
 * Utilise un wrapper DOM virtuel pour compatibility with the moteur de filtres.
 *
 * @param {unknown} map - Map instance
 * @param {number} [defaultRadius=10] - Radius by default en km
 * @returns {boolean} Nouvel state active
 */
FilterPanelProximity$1.toggleProximityToolbar = function (map, defaultRadius, options) {
    const Log = getLog();
    const effectiveDefaultRadius = defaultRadius ?? 10;
    ProximityState.mode = !ProximityState.mode;
    const effectiveRadius = ProximityState.pendingRadius ?? effectiveDefaultRadius;
    // Wrapper virtuel compatible with the moteur de filtres
    let wrapper = document.getElementById("gl-proximity-toolbar-wrapper");
    if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.id = "gl-proximity-toolbar-wrapper";
        wrapper.setAttribute("data-gl-filter-id", "proximity");
        wrapper.style.display = "none";
        document.body.appendChild(wrapper);
    }
    wrapper.setAttribute("data-proximity-radius", String(effectiveRadius));
    if (ProximityState.mode) {
        if (hasRecentGPS()) {
            activateGPSMode(map, wrapper, effectiveRadius, options);
        }
        else {
            activateManualMode(map, wrapper, () => ProximityState.pendingRadius ?? effectiveDefaultRadius, options);
        }
    }
    else {
        // Deactivation toolbar
        ProximityState.pendingRadius = null;
        cleanupMapElements(map);
        const existingWrapper = document.getElementById("gl-proximity-toolbar-wrapper");
        if (existingWrapper) {
            existingWrapper.removeAttribute("data-proximity-active");
            existingWrapper.removeAttribute("data-proximity-lat");
            existingWrapper.removeAttribute("data-proximity-lng");
        }
        Log.info("[GeoLeaf.Toolbar] Proximity disabled");
    }
    return ProximityState.mode;
};
/**
 * Updates the radius of the active proximity circle without recreating it.
 * Used by the mobile banner slider.
 * @param {number} radiusKm - New radius in kilometers
 */
FilterPanelProximity$1.setProximityRadius = function (radiusKm) {
    /* Memorize the radius even if the circle doesn't exist yet (marker not placed) */
    ProximityState.pendingRadius = radiusKm;
    const wrapper = document.getElementById("gl-proximity-toolbar-wrapper");
    if (wrapper)
        wrapper.setAttribute("data-proximity-radius", String(radiusKm));
    if (!ProximityState.mode || !ProximityState.circle)
        return;
    ProximityState.circle.setRadius(radiusKm * 1000);
};
// Proxy _eventCleanups → ProximityState.eventCleanups pour compatibility tests
Object.defineProperty(FilterPanelProximity$1, "_eventCleanups", {
    get: () => ProximityState.eventCleanups,
    set: (v) => {
        ProximityState.eventCleanups = v;
    },
    configurable: true,
    enumerable: false,
});

/**
 * GeoLeaf UI Filter Panel - State Reader
 * Read de the state des filtres from the DOM
 *
 * @module ui/filter-panel/state-reader
 */
const FilterPanelProximity = FilterPanelProximity$1;
// _g.GeoLeaf.UI.* proximity globals removed — using FilterPanelProximity.resetProximity() (module-local state)
const FilterPanelStateReader = {};
function _resetCategoryTagRatingControls(panelEl) {
    panelEl.querySelectorAll(".gl-filter-tree__checkbox").forEach(function (input) {
        input.checked = false;
    });
    panelEl.querySelectorAll(".gl-filter-panel__tag-badge.gl-is-selected").forEach(function (badge) {
        badge.classList.remove("gl-is-selected");
    });
    panelEl.querySelectorAll("select.gl-filter-panel__control--select").forEach(function (sel) {
        if (sel.multiple) {
            Array.from(sel.options).forEach(function (opt) {
                opt.selected = false;
            });
        }
        else {
            sel.value = "";
        }
    });
    const ratingInput = panelEl.querySelector("[data-gl-filter-id='minRating'] input[type='range']");
    const ratingLabel = panelEl.querySelector("[data-gl-filter-id='minRating'] .gl-filter-panel__range-value");
    if (ratingInput) {
        const min = ratingInput.min !== "" ? ratingInput.min : "0";
        ratingInput.value = min;
        if (ratingLabel) {
            ratingLabel.textContent = String(min).replace(".", ",");
        }
    }
}
/**
 * Structure by default de the state des filtres
 * @returns {Object}
 */
FilterPanelStateReader.getDefaultState = function () {
    return {
        categoriesTree: [],
        subCategoriesTree: [],
        minRating: NaN,
        hasMinRating: false,
        selectedTags: [],
        hasTags: false,
        dataTypes: { poi: true, routes: true },
        searchText: "",
        hasSearchText: false,
        proximity: {
            active: false,
            center: null,
            radius: 10,
        },
    };
};
function _resolveProximityContainer(panelEl) {
    const panelEl_ = panelEl.querySelector("[data-gl-filter-id='proximity']");
    const toolbarEl = document.getElementById("gl-proximity-toolbar-wrapper");
    if (panelEl_?.getAttribute("data-proximity-active") === "true")
        return panelEl_;
    if (toolbarEl?.getAttribute("data-proximity-active") === "true")
        return toolbarEl;
    return null;
}
function _readProximityState(panelEl, state) {
    const proximityContainer = _resolveProximityContainer(panelEl);
    if (proximityContainer) {
        const lat = parseFloat(proximityContainer.getAttribute("data-proximity-lat") ?? "");
        const lng = parseFloat(proximityContainer.getAttribute("data-proximity-lng") ?? "");
        const radius = parseFloat(proximityContainer.getAttribute("data-proximity-radius") ?? "");
        if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
            state.proximity.active = true;
            state.proximity.center = { lat, lng };
            state.proximity.radius = radius;
        }
    }
}
function _readRatingState(panelEl, state) {
    const ratingInput = panelEl.querySelector("[data-gl-filter-id='minRating'] input[type='range']");
    if (ratingInput && ratingInput.value !== "") {
        const val = parseFloat(ratingInput.value);
        if (!isNaN(val)) {
            state.minRating = val;
            state.hasMinRating = val > 0;
        }
    }
}
function _readTagsState(panelEl, state) {
    const tagsContainer = panelEl.querySelector("[data-gl-filter-id='tags'] .gl-filter-panel__tags-container");
    if (tagsContainer) {
        const selectedBadges = tagsContainer.querySelectorAll(".gl-filter-panel__tag-badge.gl-is-selected");
        const selected = Array.from(selectedBadges)
            .map(function (badge) {
            return badge.getAttribute("data-tag-value");
        })
            .filter(Boolean);
        state.selectedTags = selected;
        state.hasTags = selected.length > 0;
    }
}
function _resetProximityControls(proximityWrapper) {
    proximityWrapper.removeAttribute("data-proximity-active");
    proximityWrapper.removeAttribute("data-proximity-lat");
    proximityWrapper.removeAttribute("data-proximity-lng");
    proximityWrapper.removeAttribute("data-proximity-radius");
    const btn = proximityWrapper.querySelector(".gl-filter-panel__proximity-btn");
    if (btn) {
        btn.classList.remove("gl-is-active");
        btn.textContent = btn.getAttribute("data-label-inactive") || "Activer";
    }
    const rangeWrapper = proximityWrapper.querySelector(".gl-filter-panel__proximity-range");
    if (rangeWrapper)
        rangeWrapper.style.display = "none";
    const instruction = proximityWrapper.querySelector(".gl-filter-panel__proximity-instruction");
    if (instruction)
        instruction.style.display = "none";
    FilterPanelProximity.resetProximity();
}
/**
 * Lit the state current des filtres from the panel DOM
 * @param {HTMLElement} panelEl - Element du filter panels
 * @returns {Object} - STATE des filtres
 */
FilterPanelStateReader.readFiltersFromPanel = function (panelEl) {
    const state = FilterPanelStateReader.getDefaultState();
    if (!panelEl)
        return state;
    // Types de data (POI / Routes)
    const poiCheckbox = panelEl.querySelector("[data-gl-filter-id='dataTypes'] input[value='poi']");
    const routesCheckbox = panelEl.querySelector("[data-gl-filter-id='dataTypes'] input[value='routes']");
    if (poiCheckbox)
        state.dataTypes.poi = poiCheckbox.checked;
    if (routesCheckbox)
        state.dataTypes.routes = routesCheckbox.checked;
    // Recherche textualle
    const searchInput = panelEl.querySelector("[data-gl-filter-id='searchText'] input[type='text']");
    if (searchInput && searchInput.value.trim() !== "") {
        state.searchText = searchInput.value.trim().toLowerCase();
        state.hasSearchText = true;
    }
    // Proximity
    _readProximityState(panelEl, state);
    // Tree-view: checked categories
    panelEl.querySelectorAll("input.gl-filter-tree__checkbox--category:checked").forEach(function (input) {
        const val = input.value;
        if (val)
            state.categoriesTree.push(String(val));
    });
    // Tree-view: checked sub-categories
    panelEl
        .querySelectorAll("input.gl-filter-tree__checkbox--subcategory:checked")
        .forEach(function (input) {
        const subId = input.getAttribute("data-gl-filter-subcategory-id");
        if (subId)
            state.subCategoriesTree.push(String(subId));
    });
    // Slider de note minimume
    _readRatingState(panelEl, state);
    // Tags selected (badges)
    _readTagsState(panelEl, state);
    return state;
};
/**
 * Reinitializes les controles du filter panels to leur state by default
 * @param {HTMLElement} panelEl - Element du filter panels
 */
FilterPanelStateReader.resetControls = function (panelEl) {
    if (!panelEl)
        return;
    // Checkbox-group (POI/Routes) - reset to checked by default
    const dataTypesCheckboxes = panelEl.querySelectorAll("[data-gl-filter-id='dataTypes'] input[type='checkbox']");
    dataTypesCheckboxes.forEach(function (input) {
        input.checked = true;
    });
    // Search text input
    const searchInput = panelEl.querySelector("[data-gl-filter-id='searchText'] input[type='text']");
    if (searchInput) {
        searchInput.value = "";
    }
    // Proximity
    const proximityWrapper = panelEl.querySelector("[data-gl-filter-id='proximity']");
    if (proximityWrapper)
        _resetProximityControls(proximityWrapper);
    _resetCategoryTagRatingControls(panelEl);
};
/**
 * Reinitializes only les categories, sous-categories, tags et note.
 * Ne key PAS to the recherche textualle ni to the proximity.
 * @param {HTMLElement} panelEl - Element du filter panels
 */
FilterPanelStateReader.resetCategoryTagControls = function (panelEl) {
    if (!panelEl)
        return;
    _resetCategoryTagRatingControls(panelEl);
};

/*!
 * GeoLeaf Core – Filters / Utils
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
const _g$g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
/**
 * Extrait a value from un path (ex: "attributes.shortDescription").
 * @param {object} obj
 * @param {string} path
 * @returns {*}
 */
function getNestedValue(obj, path) {
    return path
        .split(".")
        .reduce((current, prop) => current && current[prop] !== undefined ? current[prop] : null, obj);
}
/**
 * Retrieves thes fields de recherche from the profile active.
 * Priority: layouts (search:true) → searchFields → defaults.
 * @returns {Array<string>}
 */
function getSearchFieldsFromProfile() {
    try {
        if (_g$g.GeoLeaf?.Config && typeof _g$g.GeoLeaf.Config.getActiveProfile === "function") {
            const profile = _g$g.GeoLeaf.Config.getActiveProfile();
            const searchableFieldsSet = new Set();
            if (profile?.panels?.detail?.layout) {
                profile.panels.detail.layout
                    .filter((item) => item.search === true && item.field)
                    .forEach((item) => searchableFieldsSet.add(item.field));
            }
            if (profile?.panels?.route?.layout) {
                profile.panels.route.layout
                    .filter((item) => item.search === true && item.field)
                    .forEach((item) => searchableFieldsSet.add(item.field));
            }
            if (searchableFieldsSet.size > 0) {
                const fields = Array.from(searchableFieldsSet);
                Log.debug("[Filters]  (search:true):", fields);
                return fields;
            }
            const searchFilters = profile?.panels?.search?.filters ?? profile?.panels?.searchConfig?.filters;
            if (Array.isArray(searchFilters)) {
                const searchFilter = searchFilters.find((f) => f.type === "search");
                if (searchFilter?.searchFields?.length > 0) {
                    Log.debug("[Filters] ields (fallback):", searchFilter.searchFields);
                    return searchFilter.searchFields;
                }
            }
        }
    }
    catch (err) {
        Log.warn("[Filters] Error retrieving filter fields:", err);
    }
    const defaultFields = ["title", "label", "name"];
    Log.debug("[Filters] Default fields:", defaultFields);
    return defaultFields;
}
/**
 * Extrait les coordinates [lat, lng] d'an object route (multi-format).
 * @param {object} route
 * @returns {Array<[number, number]>}
 */
function extractRouteCoords(route) {
    if (Array.isArray(route.geometry) && route.geometry.length > 0) {
        if (Array.isArray(route.geometry[0]) && typeof route.geometry[0][0] === "number") {
            return route.geometry.map((pair) => [pair[0], pair[1]]);
        }
        if (route.geometry[0]?.type === "LineString" &&
            Array.isArray(route.geometry[0].coordinates)) {
            return route.geometry[0].coordinates.map((c) => [c[1], c[0]]);
        }
    }
    if (route.geometry?.type === "LineString" && Array.isArray(route.geometry.coordinates)) {
        return route.geometry.coordinates.map((c) => [c[1], c[0]]);
    }
    return [];
}

/*!
 * GeoLeaf Core — Filters / POI Filter
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
const _g$f = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
/**
 * Fallback Haversine distance (metres) — used when GeoLeaf.Utils is not loaded.
 * @param {number} lat1 @param {number} lng1 @param {number} lat2 @param {number} lng2
 * @returns {number}
 */
function _haversine$1(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
/**
 * Extracts rating from a reviews object or array.
 */
function _extractRatingFromReviews(reviewsObj) {
    if (!Array.isArray(reviewsObj) && typeof reviewsObj === "object") {
        if (typeof reviewsObj.rating === "number")
            return { avg: reviewsObj.rating, hasRating: true };
        return null;
    }
    if (Array.isArray(reviewsObj) && reviewsObj.length > 0) {
        const sum = reviewsObj.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        const avg = sum / reviewsObj.length;
        return { avg, hasRating: avg > 0 };
    }
    return null;
}
/**
 * Extrait la note moyenne d'un object (POI ou route).
 * @param {object} attrs - attributes
 * @param {object} item  - object root
 * @param {object} props - properties
 * @returns {{ avg: number, hasRating: boolean }}
 */
function _extractRating$2(attrs, item, props) {
    const reviewsObj = attrs.reviews || item.reviews || props.reviews;
    if (reviewsObj) {
        const result = _extractRatingFromReviews(reviewsObj);
        if (result)
            return result;
    }
    if (typeof attrs.rating === "number")
        return { avg: attrs.rating, hasRating: true };
    if (typeof item.rating === "number")
        return { avg: item.rating, hasRating: true };
    if (typeof props.rating === "number")
        return { avg: props.rating, hasRating: true };
    return { avg: 0, hasRating: false };
}
/**
 * Normalise un array de tags (string CSV, array ou autre).
 * @param {*} rawTags
 * @returns {string[]}
 */
function _normalizeTags$1(rawTags) {
    if (Array.isArray(rawTags))
        return rawTags.map((t) => String(t).trim()).filter(Boolean);
    if (typeof rawTags === "string")
        return rawTags
            .split(/[,;]+/)
            .map((t) => t.trim())
            .filter(Boolean);
    return [];
}
/** Resolves the latitude coordinate from multiple possible source fields. */
function _resolveLat(poi, attrs, props) {
    return (poi.lat ??
        poi.latitude ??
        attrs.latitude ??
        props.latitude ??
        poi.coordinates?.[1] ??
        poi.geometry?.coordinates?.[1]);
}
/** Resolves the longitude coordinate from multiple possible source fields. */
function _resolveLng(poi, attrs, props) {
    return (poi.lng ??
        poi.longitude ??
        attrs.longitude ??
        props.longitude ??
        poi.coordinates?.[0] ??
        poi.geometry?.coordinates?.[0]);
}
function _resolvePoiCoords(poi) {
    const attrs = poi.attributes || {};
    const props = poi.properties || {};
    if (poi.latlng && Array.isArray(poi.latlng) && poi.latlng.length === 2) {
        return { lat: poi.latlng[0], lng: poi.latlng[1] };
    }
    return { lat: _resolveLat(poi, attrs, props), lng: _resolveLng(poi, attrs, props) };
}
function _passesTypeFilter(poi, attrs, props, dataTypes) {
    const poiType = poi.type || attrs.type || props.type || "poi";
    if (poiType === "route" || poiType === "routes") {
        return !!dataTypes.routes;
    }
    return !!dataTypes.poi;
}
function _passesSearchFilter$1(poi, hasSearchText, searchText, filterState) {
    if (!hasSearchText)
        return true;
    const searchFields = filterState.searchFields?.length > 0
        ? filterState.searchFields
        : getSearchFieldsFromProfile();
    return searchFields.some((fieldPath) => {
        const value = getNestedValue(poi, fieldPath);
        if (Array.isArray(value))
            return value.some((v) => String(v).toLowerCase().includes(searchText));
        return value && String(value).toLowerCase().includes(searchText);
    });
}
function _passesProximityFilter$1(poi, proximity, getDistance) {
    if (!proximity.active || !proximity.center)
        return true;
    const { lat, lng } = _resolvePoiCoords(poi);
    if (!lat || !lng)
        return false;
    return getDistance(proximity.center.lat, proximity.center.lng, lat, lng) <= proximity.radius;
}
/** Resolves the category ID string from multiple possible source fields. */
function _resolveCatId$2(poi, attrs, props) {
    return String(attrs.categoryId ??
        poi.categoryId ??
        poi.category ??
        props.categoryId ??
        props.category ??
        "");
}
/** Resolves the sub-category ID string from multiple possible source fields. */
function _resolveSubId$2(poi, attrs, props) {
    return String(attrs.subCategoryId ??
        poi.subCategoryId ??
        poi.subCategory ??
        poi.sub_category ??
        props.subCategoryId ??
        props.sub_category ??
        "");
}
function _resolveCatIds(poi, attrs, props) {
    return { catId: _resolveCatId$2(poi, attrs, props), subId: _resolveSubId$2(poi, attrs, props) };
}
function _passesCatSubFilter(hasCats, hasSubs, catId, subId, catsSel, subsSel) {
    if (!hasCats && !hasSubs)
        return true;
    if (hasSubs)
        return !!subId && subsSel.includes(subId);
    return !!catId && catsSel.includes(catId);
}
function _passesRatingFilter$1(hasMinRating, attrs, poi, props, minRating) {
    if (!hasMinRating)
        return true;
    const { avg, hasRating } = _extractRating$2(attrs, poi, props);
    return hasRating && avg >= minRating;
}
function _passesTagFilter$1(hasTags, attrs, poi, props, selectedTags) {
    if (!hasTags)
        return true;
    const poiTags = _normalizeTags$1(attrs.tags ?? poi.tags ?? props.tags);
    return selectedTags.some((tag) => poiTags.includes(tag));
}
function _matchesSinglePoi(poi, ctx) {
    const { hasCats, hasSubs, hasMinRating, minRating, selectedTags, hasTags, dataTypes, searchText, hasSearchText, proximity, catsSel, subsSel, getDistance, filterState, } = ctx;
    const attrs = poi.attributes || {};
    const props = poi.properties || {};
    if (!_passesTypeFilter(poi, attrs, props, dataTypes))
        return false;
    if (!_passesSearchFilter$1(poi, hasSearchText, searchText, filterState))
        return false;
    if (!_passesProximityFilter$1(poi, proximity, getDistance))
        return false;
    const { catId, subId } = _resolveCatIds(poi, attrs, props);
    if (!_passesCatSubFilter(hasCats, hasSubs, catId, subId, catsSel, subsSel))
        return false;
    if (!_passesRatingFilter$1(hasMinRating, attrs, poi, props, minRating))
        return false;
    if (!_passesTagFilter$1(hasTags, attrs, poi, props, selectedTags))
        return false;
    return true;
}
function _buildFilterContext(filterState) {
    const catsSel = filterState.categoriesTree || [];
    const subsSel = filterState.subCategoriesTree || [];
    return {
        catsSel,
        subsSel,
        hasCats: catsSel.length > 0,
        hasSubs: subsSel.length > 0,
        hasMinRating: !!filterState.hasMinRating,
        minRating: filterState.minRating,
        selectedTags: filterState.selectedTags || [],
        hasTags: filterState.hasTags,
        dataTypes: filterState.dataTypes || { poi: true, routes: true },
        searchText: (filterState.searchText || "").toLowerCase(),
        hasSearchText: filterState.hasSearchText || false,
        proximity: filterState.proximity || { active: false },
        filterState,
    };
}
function filterPoiList(basePois, filterState) {
    if (!Array.isArray(basePois) || basePois.length === 0) {
        Log.debug("[Filters] No POI to filter");
        return [];
    }
    const ctx = _buildFilterContext(filterState);
    Log.debug("[Filters] POI filtering start:", {
        totalPOI: basePois.length,
        hasCats: ctx.hasCats,
        hasSubs: ctx.hasSubs,
        hasSearchText: ctx.hasSearchText,
        proximityActive: ctx.proximity.active,
    });
    const getDistance = _g$f.GeoLeaf?.Utils?.getDistance ?? _haversine$1;
    return basePois.filter((poi) => _matchesSinglePoi(poi, { ...ctx, getDistance }));
}

/*!
 * GeoLeaf Core – Filters / Route Filter
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
const _g$e = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
function _haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function _getReviewsObj(attrs, item, props) {
    if (attrs.reviews !== undefined)
        return attrs.reviews;
    if (item.reviews !== undefined)
        return item.reviews;
    return props.reviews;
}
function _getDirectRating(attrs, item, props) {
    if (typeof attrs.rating === "number")
        return attrs.rating;
    if (typeof item.rating === "number")
        return item.rating;
    if (typeof props.rating === "number")
        return props.rating;
    return undefined;
}
function _extractRating$1(attrs, item, props) {
    const reviewsObj = _getReviewsObj(attrs, item, props);
    if (reviewsObj && typeof reviewsObj === "object" && !Array.isArray(reviewsObj)) {
        if (typeof reviewsObj.rating === "number")
            return { avg: reviewsObj.rating, hasRating: true };
    }
    if (Array.isArray(reviewsObj) && reviewsObj.length > 0) {
        const sum = reviewsObj.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        const avg = sum / reviewsObj.length;
        return { avg, hasRating: avg > 0 };
    }
    const direct = _getDirectRating(attrs, item, props);
    if (direct !== undefined)
        return { avg: direct, hasRating: true };
    return { avg: 0, hasRating: false };
}
function _normalizeTags(rawTags) {
    if (Array.isArray(rawTags))
        return rawTags.map((t) => String(t).trim()).filter(Boolean);
    if (typeof rawTags === "string")
        return rawTags
            .split(/[,;]+/)
            .map((t) => t.trim())
            .filter(Boolean);
    return [];
}
function _defined(v) {
    return v !== undefined && v !== null;
}
function _strVal(v) {
    return _defined(v) ? String(v) : "";
}
function _firstDefined(...vals) {
    for (const v of vals) {
        if (_defined(v))
            return v;
    }
    return "";
}
function _resolveCatId$1(attrs, route, props) {
    return _strVal(_firstDefined(attrs.categoryId, route.categoryId, route.category, props.categoryId, props.category));
}
function _resolveSubId$1(attrs, route, props) {
    return _strVal(_firstDefined(attrs.subCategoryId, route.subCategoryId, route.subCategory, route.sub_category, props.subCategoryId, props.sub_category));
}
function _passesSearchFilter(route, searchText, searchFields) {
    return searchFields.some((fieldPath) => {
        const value = getNestedValue(route, fieldPath);
        return value && String(value).toLowerCase().includes(searchText);
    });
}
function _passesCatFilter(catId, subId, catsSel, subsSel, hasCats, hasSubs) {
    if (hasSubs)
        return !!(subId && subsSel.includes(subId));
    if (hasCats)
        return !!(catId && catsSel.includes(catId));
    return true;
}
function _passesTagFilter(attrs, route, props, selectedTags) {
    const raw = attrs.tags !== undefined ? attrs.tags : route.tags !== undefined ? route.tags : props.tags;
    const routeTags = _normalizeTags(raw);
    return selectedTags.some((tag) => routeTags.includes(tag));
}
function _passesProximityFilter(route, proximity, getDistance) {
    const coords = extractRouteCoords(route);
    if (coords.length === 0)
        return false;
    return coords.some(([lat, lng]) => getDistance(proximity.center.lat, proximity.center.lng, lat, lng) <= proximity.radius);
}
function _parseFilterState(fs) {
    return {
        catsSel: Array.isArray(fs.categoriesTree) ? fs.categoriesTree : [],
        subsSel: Array.isArray(fs.subCategoriesTree) ? fs.subCategoriesTree : [],
        selectedTags: Array.isArray(fs.selectedTags) ? fs.selectedTags : [],
        hasTags: fs.hasTags,
        hasMinRating: !!fs.hasMinRating,
        minRating: fs.minRating,
        searchText: typeof fs.searchText === "string" ? fs.searchText.toLowerCase() : "",
        hasSearchText: fs.hasSearchText ? true : false,
        proximity: fs.proximity && typeof fs.proximity === "object" ? fs.proximity : { active: false },
    };
}
function _getSearchFields(filterState) {
    if (filterState.searchFields && filterState.searchFields.length > 0)
        return filterState.searchFields;
    return getSearchFieldsFromProfile();
}
function _passesRatingFilter(attrs, route, props, minRating) {
    const { avg, hasRating } = _extractRating$1(attrs, route, props);
    if (!hasRating)
        return false;
    if (avg < minRating)
        return false;
    return true;
}
function _resolveRouteIds(route) {
    const attrs = route.attributes ? route.attributes : {};
    const props = route.properties ? route.properties : {};
    return {
        attrs,
        props,
        catId: _resolveCatId$1(attrs, route, props),
        subId: _resolveSubId$1(attrs, route, props),
    };
}
function _passesCatAndSubFilter(catId, subId, catsSel, subsSel) {
    const hasCats = catsSel.length > 0;
    const hasSubs = subsSel.length > 0;
    if (!hasCats && !hasSubs)
        return true;
    return _passesCatFilter(catId, subId, catsSel, subsSel, hasCats, hasSubs);
}
function _passesActiveProximityFilter(route, proximity, getDistance) {
    if (!proximity.center)
        return true;
    return _passesProximityFilter(route, proximity, getDistance);
}
function _filterSingleRoute(route, parsed, filterState, getDistance) {
    const { catsSel, subsSel, selectedTags, hasTags, hasMinRating, minRating, searchText, hasSearchText, proximity, } = parsed;
    const { attrs, props, catId, subId } = _resolveRouteIds(route);
    if (hasSearchText) {
        if (!_passesSearchFilter(route, searchText, _getSearchFields(filterState)))
            return false;
    }
    if (!_passesCatAndSubFilter(catId, subId, catsSel, subsSel))
        return false;
    if (hasTags) {
        if (!_passesTagFilter(attrs, route, props, selectedTags))
            return false;
    }
    if (hasMinRating) {
        if (!_passesRatingFilter(attrs, route, props, minRating))
            return false;
    }
    if (proximity.active) {
        if (!_passesActiveProximityFilter(route, proximity, getDistance))
            return false;
    }
    return true;
}
/**
 * Filtre a list de routes based on thes criteria fournis.
 * @param {Array} baseRoutes
 * @param {object} filterState
 * @returns {Array}
 */
function filterRouteList(baseRoutes, filterState) {
    if (!Array.isArray(baseRoutes) || baseRoutes.length === 0) {
        Log.debug("[Filters] No routes to filter");
        return [];
    }
    const parsed = _parseFilterState(filterState);
    Log.debug("[Filters] Route filtering start:", {
        totalRoutes: baseRoutes.length,
        hasCats: parsed.catsSel.length > 0,
        hasSubs: parsed.subsSel.length > 0,
        hasMinRating: parsed.hasMinRating,
        minRating: parsed.minRating,
        hasSearchText: parsed.hasSearchText,
        proximityActive: parsed.proximity.active,
    });
    const getDistance = _g$e.GeoLeaf && _g$e.GeoLeaf.Utils && _g$e.GeoLeaf.Utils.getDistance
        ? _g$e.GeoLeaf.Utils.getDistance
        : _haversine;
    return baseRoutes.filter((route) => _filterSingleRoute(route, parsed, filterState, getDistance));
}

/*!
 * GeoLeaf Core — © 2026 Mattieu Pottier — MIT License — https://geoleaf.dev
 */
/**
 * @module built-in/filters/filter-stats
 * @description Utility functions for POI category/tag/rating statistics.
 * Extracted from legacy `src/filters/index.ts` shim (Sprint 11).
 */
// ── Internal helpers ───────────────────────────────────────────────────────────
function _getCatId(item) {
    return item?.attributes?.categoryId ?? item?.properties?.categoryId ?? null;
}
function _getSubCatId(item) {
    return item?.attributes?.subCategoryId ?? item?.properties?.subCategoryId ?? null;
}
function _getTags(item) {
    const raw = item?.attributes?.tags ?? item?.properties?.tags;
    if (Array.isArray(raw))
        return raw.map((t) => String(t).trim()).filter(Boolean);
    if (typeof raw === "string")
        return raw
            .split(/[,;]+/)
            .map((t) => t.trim())
            .filter(Boolean);
    return [];
}
/* eslint-disable complexity -- rating extraction; reduce accumulators */
function _extractRating(item) {
    const attrs = item?.attributes || {};
    const props = item?.properties || {};
    const reviewsObj = attrs.reviews || item.reviews || props.reviews;
    if (reviewsObj && typeof reviewsObj === "object" && !Array.isArray(reviewsObj)) {
        if (typeof reviewsObj.rating === "number")
            return reviewsObj.rating;
    }
    if (Array.isArray(reviewsObj) && reviewsObj.length > 0) {
        const sum = reviewsObj.reduce((a, r) => a + (Number(r.rating) || 0), 0);
        return sum / reviewsObj.length;
    }
    if (typeof attrs.rating === "number")
        return attrs.rating;
    if (typeof props.rating === "number")
        return props.rating;
    return null;
}
/* eslint-enable complexity */
// ── Public API ─────────────────────────────────────────────────────────────────
function getUniqueCategories(items = []) {
    if (!Array.isArray(items))
        return [];
    return [...new Set(items.map(_getCatId).filter(Boolean))].sort();
}
function getUniqueSubCategories(items = []) {
    if (!Array.isArray(items))
        return [];
    return [...new Set(items.map(_getSubCatId).filter(Boolean))].sort();
}
function getUniqueTags(items = []) {
    if (!Array.isArray(items))
        return [];
    return [...new Set(items.flatMap(_getTags))].sort();
}
function countByCategory(items = []) {
    if (!Array.isArray(items))
        return {};
    return items.reduce((acc, item) => {
        const c = _getCatId(item);
        if (c)
            acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {});
}
function countBySubCategory(items = []) {
    if (!Array.isArray(items))
        return {};
    return items.reduce((acc, item) => {
        const c = _getSubCatId(item);
        if (c)
            acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {});
}
function getRatingStats(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
        return { min: 0, max: 0, avg: 0, count: 0, withRating: 0, withoutRating: 0 };
    }
    const ratings = items.map(_extractRating);
    const defined = ratings.filter((r) => r !== null && r > 0);
    const withRating = defined.length;
    const withoutRating = items.length - withRating;
    if (withRating === 0) {
        return { min: 0, max: 0, avg: 0, count: items.length, withRating: 0, withoutRating };
    }
    const min = Math.min(...defined);
    const max = Math.max(...defined);
    const avg = defined.reduce((a, b) => a + b, 0) / withRating;
    return { min, max, avg, count: items.length, withRating, withoutRating };
}

/*!
 * GeoLeaf Core – Filters / Index (barl)
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
/**
 * Static interface for GeoLeaf filtering utilities.
 */
const Filters = {
    /**
     * Filters a list of POI objects against a set of active filter criteria.
     *
     * @param pois - Array of POI objects to filter.
     * @param filters - Active filter state (field → value map).
     * @returns Filtered subset of POI objects.
     */
    filterPoiList,
    /**
     * Filters a list of route objects against a set of active filter criteria.
     *
     * @param routes - Array of route objects to filter.
     * @param filters - Active filter state (field → value map).
     * @returns Filtered subset of route objects.
     */
    filterRouteList,
    getUniqueCategories,
    getUniqueSubCategories,
    getUniqueTags,
    countByCategory,
    countBySubCategory,
    getRatingStats,
};

/**
 * GeoLeaf UI Filter Panel - Applier
 * Application des filtres aux layers POI, Routes, GeoJSON
 *
 * @module ui/filter-panel/applier
 */
const Config = Config$3;
// Direct ESM bindings (P3-DEAD-01 completee)
const getShared$1 = () => FilterPanelShared;
const FilterPanelApplier = {};
// --- Module-level helpers for filterGeoJSONLayers ---
function _getSearchFieldsFromLayerConfig(layerData) {
    if (!layerData || !layerData.config)
        return null;
    if (layerData.config.search && Array.isArray(layerData.config.search.indexingFields)) {
        return layerData.config.search.indexingFields;
    }
    if (Array.isArray(layerData.config.indexingFields))
        return layerData.config.indexingFields;
    if (Array.isArray(layerData.config.searchFields))
        return layerData.config.searchFields;
    return null;
}
function _getSearchFieldsFromProfile() {
    try {
        const activeProfile = Config._activeProfileData;
        if (!activeProfile)
            return null;
        if (!activeProfile.searchConfig)
            return null;
        if (!activeProfile.searchConfig.filters)
            return null;
        const searchFilter = activeProfile.searchConfig.filters.find((f) => f.type === "search");
        if (searchFilter && Array.isArray(searchFilter.searchFields))
            return searchFilter.searchFields;
    }
    catch (_e) {
        /* ignore */
    }
    return null;
}
function _getLayerSearchFields(GeoJSON, layerId) {
    const Log = getLog();
    try {
        const layerData = GeoJSON.getLayerData(layerId);
        const fromConfig = _getSearchFieldsFromLayerConfig(layerData);
        if (fromConfig)
            return fromConfig;
    }
    catch (err) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Erreur r\u00e9cup\u00e9ration fields de recherche:", err);
    }
    try {
        const fromProfile = _getSearchFieldsFromProfile();
        if (fromProfile)
            return fromProfile;
    }
    catch (err) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Erreur r\u00e9cup\u00e9ration fields par d\u00e9faut:", err);
    }
    return [
        "title",
        "description",
        "properties.title",
        "properties.name",
        "properties.description",
        "attributes.nom",
    ];
}
function _featureMatchesSearch(feature, searchFields, searchLower, Shared) {
    for (let i = 0; i < searchFields.length; i++) {
        const fieldPath = searchFields[i];
        let propertiesFieldPath = fieldPath;
        if (fieldPath.startsWith("properties."))
            propertiesFieldPath = fieldPath.substring("properties.".length);
        let value = null;
        if (feature.properties)
            value = Shared.getNestedValue(feature.properties, propertiesFieldPath);
        if (!value)
            value = Shared.getNestedValue(feature, fieldPath);
        if (value && String(value).toLowerCase().includes(searchLower))
            return true;
    }
    return false;
}
function _resolveCatId(props) {
    if (props.categoryId)
        return String(props.categoryId);
    if (props.category)
        return String(props.category);
    return null;
}
function _resolveSubId(props) {
    if (props.subcategoryId)
        return String(props.subcategoryId);
    if (props.subCategoryId)
        return String(props.subCategoryId);
    if (props.subcategory)
        return String(props.subcategory);
    if (props.sub_category)
        return String(props.sub_category);
    return null;
}
function _featurePassesCatFilter(props, hasCats, hasSubs, state) {
    const catId = _resolveCatId(props);
    const subId = _resolveSubId(props);
    if (!catId && !subId)
        return false;
    if (hasSubs) {
        if (!subId)
            return false;
        if (!state.subCategoriesTree.includes(subId))
            return false;
    }
    if (hasCats && !hasSubs) {
        if (!catId)
            return false;
        if (!state.categoriesTree.includes(catId))
            return false;
    }
    return true;
}
function _getFeatureTags(props) {
    // Check attributes.tags first (common in GeoJSON profiles), then fall back to props.tags.
    // Mirrors the same precedence used by _scanTags (lazy-loader) and _normalizeTags (poi-filter)
    // so that badge population and tag filtering always operate on the same field.
    const attrs = props.attributes || {};
    let featureTags = attrs.tags ?? props.tags ?? [];
    if (!Array.isArray(featureTags)) {
        if (typeof featureTags === "string") {
            featureTags = featureTags.split(/[,;]+/);
        }
        else {
            featureTags = [];
        }
    }
    return featureTags.map((t) => String(t).trim()).filter(Boolean);
}
function _featurePassesProximityCheck(feature, state, Shared) {
    if (!state.proximity.center)
        return true;
    const point = Shared.getRepresentativePoint(feature.geometry);
    if (!point)
        return true;
    const dist = getDistance(state.proximity.center.lat, state.proximity.center.lng, point.lat, point.lng);
    return dist <= state.proximity.radius;
}
function _safeProps(feature) {
    return feature.properties ? feature.properties : {};
}
function _applyGeoFilter(feature, layerId, ctx) {
    const safeProps = _safeProps(feature);
    if (ctx.hasSearchText) {
        const fields = _getLayerSearchFields(ctx.GeoJSON, layerId);
        if (!_featureMatchesSearch(feature, fields, ctx.searchText.toLowerCase(), ctx.Shared))
            return false;
    }
    if (ctx.hasCats || ctx.hasSubs) {
        if (!_featurePassesCatFilter(safeProps, ctx.hasCats, ctx.hasSubs, ctx.state))
            return false;
    }
    if (ctx.hasTags) {
        const featureTags = _getFeatureTags(safeProps);
        const hasAtLeastOneTag = ctx.selectedTags.some((tag) => featureTags.includes(tag));
        if (!hasAtLeastOneTag)
            return false;
    }
    if (ctx.hasProximity) {
        if (!_featurePassesProximityCheck(feature, ctx.state, ctx.Shared))
            return false;
    }
    return true;
}
function _applyRouteFilters(baseRoutes, state, skipRoutes) {
    const Log = getLog();
    if (!state.dataTypes.routes) {
        Route.hide();
        return;
    }
    if (skipRoutes) {
        Route.show();
        return;
    }
    let filteredRoutes = baseRoutes;
    if (Filters && typeof Filters.filterRouteList === "function") {
        filteredRoutes = Filters.filterRouteList(baseRoutes, state);
    }
    Log.info("[GeoLeaf.UI.FilterPanel] Filters applied on routes.", {
        total: baseRoutes.length,
        result: filteredRoutes.length,
    });
    if (typeof Route.filterVisibility === "function") {
        Route.filterVisibility(filteredRoutes);
    }
    else if (typeof Route.loadFromConfig === "function") {
        Route.loadFromConfig(filteredRoutes);
    }
    Route.show();
}
let _lastApplyTime = 0;
const APPLY_DEBOUNCE_DELAY = 300; // 300ms
// Fonction debounce pour l'application des filtres
let _applyFiltersTimeout = null;
let _lastSkipRoutes = false; // Store skipRoutes flag for debounced call
const _debouncedApplyFilters = function (panelEl, skipRoutes) {
    if (_applyFiltersTimeout) {
        clearTimeout(_applyFiltersTimeout);
    }
    _lastSkipRoutes = skipRoutes || false;
    _applyFiltersTimeout = setTimeout(() => {
        FilterPanelApplier._applyFiltersImmediate(panelEl, _lastSkipRoutes);
    }, APPLY_DEBOUNCE_DELAY);
};
/**
 * MEMORY LEAK FIX (Phase 2): Cleanup timeout on destroy
 */
FilterPanelApplier.destroy = function () {
    if (_applyFiltersTimeout) {
        clearTimeout(_applyFiltersTimeout);
        _applyFiltersTimeout = null;
    }
};
/**
 * Rafraîchit la visibilité des POI selon the list filtréee.
 * IMPORTANT: Cette fonction filters UNIQUEMENT les POI du système POI traditionnel.
 * Les GeoJSON layers (point, line, polygon) sont gérées par filterGeoJSONLayers().
 * On n'appelle PAS filterFeatures() ici pour éviter de hide les GeoJSON layers.
 *
 * @param {Array} filteredPois - List des POI à display
 */
FilterPanelApplier.refreshPoiLayer = function (filteredPois) {
    const Log = getLog();
    // Vérifier si le système POI est activé in the config
    const poiConfig = typeof Config.get === "function" ? Config.get("poiConfig") : null;
    if (poiConfig && poiConfig.enabled === false) {
        Log.debug("[GeoLeaf.UI.FilterPanel] POI system disabled, skipping POI layer refresh.");
        return;
    }
    if (!POI) {
        Log.warn("[GeoLeaf.UI.FilterPanel] GeoLeaf.POI unavailable, skipping POI layer refresh.");
        return;
    }
    // MapLibre path: update the cluster source directly without corrupting state.allPois.
    // Using setFilteredDisplay preserves the full POI dataset for subsequent filter calls.
    if (typeof POI.setFilteredDisplay === "function") {
        POI.setFilteredDisplay(filteredPois);
        Log.debug(`[GeoLeaf.UI.FilterPanel] refreshPoiLayer: ${filteredPois.length} visible POIs`);
        return;
    }
    // Fallback: clear markers then re-add one by one
    if (typeof POI._clearAllForTests === "function") {
        POI._clearAllForTests();
    }
    else {
        Log.warn("[GeoLeaf.UI.FilterPanel] GeoLeaf.POI._clearAllForTests unavailable.");
    }
    filteredPois.forEach(function (p) {
        try {
            POI.addPoi(p);
        }
        catch (err) {
            Log.warn("[GeoLeaf.UI.FilterPanel] Failed to add filtered POI:", p, err);
        }
    });
    Log.debug(`[GeoLeaf.UI.FilterPanel] refreshPoiLayer: ${filteredPois.length} visible POIs`);
};
/**
 * Applies thes filtres aux GeoJSON layers (polygons et polylines)
 * @param {Object} state - État des filtres
 */
function _buildGeoFilterCtx(state, GeoJSON, Shared) {
    const hasCats = state.categoriesTree && state.categoriesTree.length > 0;
    const hasSubs = state.subCategoriesTree && state.subCategoriesTree.length > 0;
    const hasTags = state.hasTags && state.selectedTags && state.selectedTags.length > 0;
    const selectedTags = state.selectedTags || [];
    const hasProximity = state.proximity && state.proximity.active;
    const hasSearchText = state.hasSearchText && state.searchText;
    const searchText = state.searchText || "";
    return {
        hasSearchText: !!hasSearchText,
        searchText,
        hasCats,
        hasSubs,
        hasTags,
        selectedTags,
        hasProximity: !!hasProximity,
        state,
        GeoJSON,
        Shared,
    };
}
FilterPanelApplier.filterGeoJSONLayers = function (state) {
    const Shared = getShared$1();
    const GeoJSON = GeoJSONCore;
    if (!GeoJSON || typeof GeoJSON.filterFeatures !== "function")
        return;
    const ctx = _buildGeoFilterCtx(state, GeoJSON, Shared);
    const filterFn = (_geometryType) => (feature, layerId) => _applyGeoFilter(feature, layerId, ctx);
    GeoJSON.filterFeatures(filterFn(), { geometryType: "polygon" });
    GeoJSON.filterFeatures(filterFn(), { geometryType: "line" });
    GeoJSON.filterFeatures(filterFn(), { geometryType: "point" });
};
/**
 * Applies tous the filters actives avec debounce
 */
FilterPanelApplier.applyFiltersNow = function (panelEl, skipRoutes) {
    _debouncedApplyFilters(panelEl, skipRoutes);
};
/**
 * Applies tous the filters actives imm\u00e9diatement (internal)
 * @private
 */
FilterPanelApplier._applyFiltersImmediate = function (panelEl, skipRoutes) {
    const Log = getLog();
    const Shared = getShared$1();
    const StateReader = FilterPanelStateReader;
    const now = Date.now();
    if (now - _lastApplyTime < 100)
        return;
    _lastApplyTime = now;
    let basePois = Shared.getBasePois();
    // Fallback: POIs managed by the POI module (state.allPois) are not in GeoJSON layers
    if (!basePois.length && POI && typeof POI.getAllPois === "function") {
        basePois = POI.getAllPois();
    }
    const baseRoutes = Shared.getBaseRoutes();
    const state = StateReader.readFiltersFromPanel(panelEl);
    FilterPanelApplier.filterGeoJSONLayers(state);
    // Notify permalink/other modules that filters have been applied.
    // Dispatch here (before early return) so URL sync triggers even when there are no POIs/routes.
    try {
        document.dispatchEvent(new CustomEvent("geoleaf:filters:applied"));
    }
    catch {
        // No DOM (SSR / test context)
    }
    if (!basePois.length && !baseRoutes.length) {
        Log.info("[GeoLeaf.UI.FilterPanel] No source POI or route found.");
        return;
    }
    if (Route && typeof Route.isInitialized === "function" && Route.isInitialized()) {
        _applyRouteFilters(baseRoutes, state, skipRoutes);
    }
    const filtered = FilterPanelApplier.filterPoiList(basePois, state);
    Log.info("[GeoLeaf.UI.FilterPanel] Filters applied on POIs.", {
        total: basePois.length,
        result: filtered.length,
        filters: state,
    });
    FilterPanelApplier.refreshPoiLayer(filtered);
};
/**
 * Filtre a list de POI based on thes criteria fournis
 */
FilterPanelApplier.filterPoiList = function (basePois, filterState) {
    if (Filters && typeof Filters.filterPoiList === "function") {
        return Filters.filterPoiList(basePois, filterState);
    }
    return basePois;
};
/**
 * Filtre a list de routes based on thes criteria fournis
 */
FilterPanelApplier.filterRouteList = function (baseRoutes, filterState) {
    if (Filters && typeof Filters.filterRouteList === "function") {
        return Filters.filterRouteList(baseRoutes, filterState);
    }
    return baseRoutes;
};
/**
 * Applies initial filters by retrieving the panel from Shared
 */
FilterPanelApplier.applyFiltersInitial = function () {
    const Shared = getShared$1();
    const panelEl = Shared.getFilterPanelElement();
    if (!panelEl)
        return;
    _lastApplyTime = 0;
    FilterPanelApplier._applyFiltersImmediate(panelEl, false);
};

/**
 * GeoLeaf UI Filter Panel - SVG Helpers
 * Fonctions SVG for thes icons du filter panels
 *
 * @module ui/filter-panel/svg-helpers
 */
/**
 * Updates une icon de toggle pour the state "panel open" (arrow gauche)
 * @param {HTMLElement} icon - L'element icon to update
 */
function setToggleIconOpen(icon) {
    // SAFE: SVG static hardcoded
    DOMSecurity.clearElementFast(icon);
    const svg = DOMSecurity.createSVGIcon(16, 16, "M15 18l-6-6 6-6", {
        stroke: "currentColor",
        strokeWidth: "6",
        fill: "none",
    });
    icon.appendChild(svg);
}
/**
 * Updates une icon de toggle pour the state "panel closed" (arrow droite)
 * @param {HTMLElement} icon - L'element icon to update
 */
function setToggleIconClosed(icon) {
    // SAFE: SVG static hardcoded
    DOMSecurity.clearElementFast(icon);
    const svg = DOMSecurity.createSVGIcon(16, 16, "M9 6l6 6-6 6", {
        stroke: "currentColor",
        strokeWidth: "6",
        fill: "none",
    });
    icon.appendChild(svg);
}

/**
 * GeoLeaf UI Filter Panel - Lazy Loader
 * Loadsment to the demande des filtres categories et tags
 *
 * @module ui/filter-panel/lazy-loader
 */
function _resolveCheckboxKey(cb) {
    const categoryId = cb.dataset.glFilterCategoryId;
    const subcategoryId = cb.dataset.glFilterSubcategoryId;
    const value = cb.value;
    if (subcategoryId)
        return `${categoryId}:${subcategoryId}`;
    if (categoryId)
        return categoryId;
    if (value)
        return value;
    return undefined;
}
const FilterPanelLazyLoader = {
    _cache: {},
    _openAccordions: new Set(),
    /**
     * Loads thes categories pour the theme active
     * @param {string} themeId - ID of the theme
     * @returns {Array} - Array de categories with theurs sous-categories
     */
    loadCategories(themeId) {
        const cacheKey = `categories_${themeId}`;
        if (this._cache[cacheKey]) {
            Log.debug("[LazyLoader] Cache HIT for categories:", themeId);
            return this._cache[cacheKey];
        }
        Log.debug("[LazyLoader] Cache MISS for categories, scanning...");
        const result = this._scanCategories(themeId);
        this._cache[cacheKey] = result;
        return result;
    },
    /**
     * Loads thes tags pour the theme active
     * @param {string} themeId - ID of the theme
     * @returns {Array} - Array de tags uniques
     */
    loadTags(themeId) {
        const cacheKey = `tags_${themeId}`;
        if (this._cache[cacheKey]) {
            Log.debug("[LazyLoader] Cache HIT for tags:", themeId);
            return this._cache[cacheKey];
        }
        Log.debug("[LazyLoader] Cache MISS for tags, scanning...");
        const result = this._scanTags(themeId);
        this._cache[cacheKey] = result;
        return result;
    },
    /**
     * Scanne les features pour extraire les categories used
     * @private
     * @param {string} themeId - ID of the theme
     * @returns {Object} - {categories: Map, usedIds: Set}
     */
    _scanCategories(themeId) {
        const startTime = performance.now();
        // Retrieve the layers visibles of the theme
        const visibleLayerIds = this._getVisibleLayerIds(themeId);
        // Retrieve toutes les features
        let allFeatures = [];
        try {
            if (GeoJSONCore && typeof GeoJSONCore.getFeatures === "function") {
                allFeatures = GeoJSONCore.getFeatures() || [];
            }
        }
        catch (err) {
            Log.warn("[LazyLoader] Error fetching features:", err);
            return { usedIds: new Set(), visibleLayerIds: [] };
        }
        // Filtrer par layers visibles
        const visibleFeatures = allFeatures.filter((feature) => {
            const fp = feature.properties;
            const layerId = fp?._layerId ?? fp?.layerId ?? feature._layerId;
            return visibleLayerIds.includes(layerId);
        });
        Log.debug(`[LazyLoader] Category scan: ${visibleFeatures.length} features on ${visibleLayerIds.length} active layers`);
        // Extraire les categories uniques (normalisation lowercasee + variantes camelCasee)
        const usedCategoryIds = new Set();
        visibleFeatures.forEach((feature) => {
            const props = feature.properties || {};
            if (props.categoryId) {
                usedCategoryIds.add(String(props.categoryId));
            }
            if (props.subcategoryId) {
                usedCategoryIds.add(String(props.subcategoryId));
            }
            // Variante camelCasee (subCategoryId) presents dans certains GeoJSON
            if (props.subCategoryId) {
                usedCategoryIds.add(String(props.subCategoryId));
            }
        });
        const elapsed = (performance.now() - startTime).toFixed(2);
        Log.info(`[LazyLoader] Category scan completed in ${elapsed}ms: ${usedCategoryIds.size} categories found`);
        return {
            usedIds: usedCategoryIds,
            visibleLayerIds: visibleLayerIds,
        };
    },
    /**
     * Scanne les features pour extraire les tags used
     * @private
     * @param {string} themeId - ID of the theme
     * @returns {Array} - Array de tags sorted
     */
    _scanTags(themeId) {
        const startTime = performance.now();
        // Retrieve the layers visibles of the theme
        const visibleLayerIds = this._getVisibleLayerIds(themeId);
        // Retrieve toutes les features
        let allFeatures = [];
        try {
            if (GeoJSONCore && typeof GeoJSONCore.getFeatures === "function") {
                allFeatures = GeoJSONCore.getFeatures() || [];
            }
        }
        catch (err) {
            Log.warn("[LazyLoader] Error retrieving features:", err);
            return [];
        }
        // Filtrer par layers visibles
        const visibleFeatures = allFeatures.filter((feature) => {
            const fp = feature.properties;
            const layerId = fp?._layerId ?? fp?.layerId ?? feature._layerId;
            return visibleLayerIds.includes(layerId);
        });
        // Extraire les tags uniques
        const tagSet = new Set();
        visibleFeatures.forEach((feature) => {
            const props = feature.properties || {};
            const attrs = props.attributes || {};
            const tags = attrs.tags || props.tags;
            if (Array.isArray(tags)) {
                tags.forEach((tag) => {
                    if (tag && typeof tag === "string") {
                        tagSet.add(tag);
                    }
                });
            }
        });
        const tagsArray = Array.from(tagSet).sort();
        const elapsed = (performance.now() - startTime).toFixed(2);
        Log.info(`[LazyLoader] Tag scan completed in ${elapsed}ms:`, {
            totalFeatures: allFeatures.length,
            visibleFeatures: visibleFeatures.length,
            tagsFound: tagsArray.length,
        });
        return tagsArray;
    },
    /**
     * Retrieves thes IDs des layers actually visibles sur the map
     * @private
     * @param {string} _themeId - ID of the theme (not used, but kept for compatibility)
     * @returns {Array} - Array d'IDs de layers avec visible: true
     */
    _getVisibleLayerIds(_themeId) {
        let visibleLayerIds = [];
        try {
            if (GeoJSONCore && typeof GeoJSONCore.getAllLayers === "function") {
                const allLayers = GeoJSONCore.getAllLayers();
                // Filtrer only celles qui sont visibles (ON in theyer manager)
                visibleLayerIds = allLayers
                    .filter((layer) => layer.visible === true)
                    .map((layer) => layer.id);
                Log.debug(`[LazyLoader] ${visibleLayerIds.length} visible layers found:`, visibleLayerIds);
            }
        }
        catch (err) {
            Log.warn("[LazyLoader] Error retrieving visible layers:", err);
        }
        return visibleLayerIds;
    },
    /**
     * Marque un accordion comme open
     * @param {string} type - 'categories' ou 'tags'
     * @param {HTMLElement} element - Element of the accordion
     */
    markAccordionOpen(type, element) {
        this._openAccordions.add({ type, element });
        Log.debug(`[LazyLoader] Accordion "${type}" marked as open`);
    },
    /**
     * Marque un accordion comme closed
     * @param {HTMLElement} element - Element of the accordion
     */
    markAccordionClosed(element) {
        this._openAccordions.forEach((item) => {
            if (item.element === element) {
                this._openAccordions.delete(item);
                Log.debug(`[LazyLoader] Accordion "${item.type}" marked as closed`);
            }
        });
    },
    /**
     * Invalid le cache pour a theme specific
     * @param {string} themeId - ID of the theme
     */
    invalidateCacheForTheme(themeId) {
        delete this._cache[`categories_${themeId}`];
        delete this._cache[`tags_${themeId}`];
        Log.info(`[LazyLoader] Cache invalidated for theme: ${themeId}`);
    },
    /**
     * Invalid tout le cache (changement de theme)
     */
    clearCache() {
        this._cache = {};
        Log.info("[LazyLoader] Cache completely cleared");
    },
    /**
     * Refreshes les accordions opens
     * Used after a theme change or layer toggle
     */
    refreshOpenAccordions() {
        if (this._openAccordions.size === 0) {
            Log.debug("[LazyLoader] No open accordion to refresh");
            return;
        }
        Log.info(`[LazyLoader] Refreshing ${this._openAccordions.size} open accordion(s)`);
        const currentTheme = ThemeSelector.getCurrentTheme();
        if (!currentTheme) {
            Log.warn("[LazyLoader] Unable to retrieve active theme");
            return;
        }
        this._openAccordions.forEach(({ type, element }) => {
            // Sauvegarder the state des checkboxes / tags selected
            const savedStates = this._saveCheckboxStates(element);
            // Target the [data-lazy-type] area that receives innerHTML
            const contentArea = element.querySelector("[data-lazy-type]");
            if (!contentArea) {
                Log.warn("[LazyLoader] Zone [data-lazy-type] not found in accordion");
                return;
            }
            // Reset le flag lazyLoaded pour permettre un futur reloading
            element.dataset.lazyLoaded = "false";
            // Appeler la fonction de render appropriate
            if (type === "categories") {
                this._rerenderCategories(contentArea, currentTheme, savedStates);
            }
            else if (type === "tags") {
                this._rerenderTags(contentArea, currentTheme, savedStates);
            }
            // Re-marquer comme loaded after the re-render
            element.dataset.lazyLoaded = "true";
        });
    },
    /**
     * Re-render les categories dans un accordion
     * @private
     */
    _rerenderCategories(contentArea, themeId, savedStates) {
        const result = this.loadCategories(themeId);
        // Building du contenu via import ESM direct (P3-DEAD-02)
        const content = buildCategoryTreeContent(result);
        // User values are escaped at the source by buildCategoryTreeContent.
        // We use createContextualFragment (remove scripts only) to preserve
        // all safe attributes (class, data-*, type, value, name, checked) — the whitelist
        // de sanitizeHTML supprimait <input> et <label>, casesant les checkboxes.
        contentArea.textContent = "";
        const catFrag = document
            .createRange()
            .createContextualFragment(content.replace(/<script[\s\S]*?<\/script>/gi, ""));
        contentArea.appendChild(catFrag);
        // NE PAS re-attach attachCategoryTreeListners ici :
        // the listener on contentArea (added by _loadAccordionContentIfNeeded)
        // survives child replacement. Re-attaching would cause duplicates
        // that would cancel checkbox toggles (toggle pair = zero net).
        // Restaurer les states des checkboxes
        this._restoreCheckboxStates(contentArea, savedStates);
    },
    /**
     * Re-render les tags dans un accordion
     * @private
     */
    _rerenderTags(contentArea, themeId, savedStates) {
        const tags = this.loadTags(themeId);
        // Building du contenu via import ESM direct (P3-DEAD-02)
        const content = buildTagsListContent(tags);
        // User values are escaped at the source by buildTagsListContent.
        // We use createContextualFragment (remove scripts only) to preserve
        // class et data-tag-value sur les <span> badges — la whitelist supprimait ces attributes,
        // rendant les tags non selectionnables.
        contentArea.textContent = "";
        const tagFrag = document
            .createRange()
            .createContextualFragment(content.replace(/<script[\s\S]*?<\/script>/gi, ""));
        contentArea.appendChild(tagFrag);
        // NE PAS re-attach attachTagsListners ici :
        // the listener on contentArea (added by _loadAccordionContentIfNeeded)
        // survives child replacement. Re-attaching would cause duplicates
        // that would cancel toggles (toggle pair = zero net, badge
        // semblant inactive same after click).
        // Restaurer les states des checkboxes
        this._restoreCheckboxStates(contentArea, savedStates);
    },
    /**
     * Sauvegarde the state des checkboxes avant re-render
     * @private
     */
    _saveCheckboxStates(element) {
        const states = {};
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((cb) => {
            const key = _resolveCheckboxKey(cb);
            if (key) {
                states[key] = cb.checked;
            }
        });
        return states;
    },
    /**
     * Restaure the state des checkboxes after re-render
     * @private
     */
    _restoreCheckboxStates(element, savedStates) {
        if (!savedStates || Object.keys(savedStates).length === 0)
            return;
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        let restoredCount = 0;
        checkboxes.forEach((cb) => {
            const key = _resolveCheckboxKey(cb);
            if (key && savedStates[key] !== undefined) {
                cb.checked = savedStates[key];
                restoredCount++;
            }
        });
        Log.debug(`[LazyLoader] ${restoredCount} checkbox states restored`);
    },
};
document.addEventListener("geoleaf:theme:applied", () => {
    Log.info("[LazyLoader] theme:applied event detected — full invalidation");
    // 1. Emptyr le cache de data (scan categories/tags)
    FilterPanelLazyLoader.clearCache();
    // 2. Reset TOUS les flags data-lazy-loaded sur les accordions
    //    (closeds ou opens) pour forcer un reloading au prochain expand
    const allAccordions = document.querySelectorAll(".gl-filter-panel__group--accordion[data-lazy-loaded]");
    allAccordions.forEach((acc) => {
        acc.dataset.lazyLoaded = "false";
    });
    Log.debug(`[LazyLoader] ${allAccordions.length} data-lazy-loaded flag(s) reset`);
    // 3. Refresh currently open accordions (immediate re-render)
    FilterPanelLazyLoader.refreshOpenAccordions();
});
// Listen layer visibility change event
document.addEventListener("geoleaf:geojson:visibility-changed", (e) => {
    const detail = e.detail || {};
    Log.info("[LazyLoader] Layer visibility changed:", detail.layerId, detail.visible);
    // Invalidr le cache of the theme active
    const currentTheme = ThemeSelector.getCurrentTheme();
    if (currentTheme) {
        FilterPanelLazyLoader.invalidateCacheForTheme(currentTheme);
        // Refresh open accordions
        FilterPanelLazyLoader.refreshOpenAccordions();
    }
});

/**
 * GeoLeaf UI Filter Panel - Accordion Manager
 * Creation des groups accordion (categories/tags), deployment/repli et lazy loading
 *
 * @module ui/filter-panel/filter-panel-accordion
 */
/**
 * Creates a group accordion (categories ou tags) avec header, body et gestion d'state.
 * @param filterDef - Setsion du filters
 * @param groupEl - Element de contenu (checkboxes, etc.)
 * @param eventCleanups - Array de fonctions de cleanup d'events
 * @param onExpand - Callback called during the deployment (passe accordionGroup et filterDef)
 */
function _createAccordionHeader(filterDef, _accordionGroup) {
    const accordionHeader = createElement("div", { className: "gl-filter-panel__accordion-header" });
    const contentId = "gl-fp-accordion-body-" + filterDef.id;
    // D1: semantic <button> inside heading — native keyboard, aria-expanded, aria-controls
    const accordionBtn = createElement("button", {
        className: "gl-filter-panel__accordion-title",
        attributes: {
            type: "button",
            "aria-expanded": "false",
            "aria-controls": contentId,
        },
        textContent: filterDef.label ||
            (filterDef.id === "categories"
                ? getLabel("ui.filter_panel.categories_title_fallback")
                : getLabel("ui.filter_panel.tags_title_fallback")),
    });
    const accordionArrow = createElement("span", {
        className: "gl-filter-panel__accordion-arrow",
        textContent: "\u25b6",
        attributes: { "aria-hidden": "true" }, // D5
    });
    accordionBtn.appendChild(accordionArrow);
    accordionHeader.appendChild(accordionBtn);
    return { accordionHeader, accordionBtn, contentId };
}
function _createAccordionBody(groupEl, contentId) {
    const accordionBody = createElement("div", {
        className: "gl-filter-panel__accordion-body",
        attributes: { id: contentId },
    });
    const accordionWrapper = createElement("div");
    accordionWrapper.appendChild(groupEl);
    accordionBody.appendChild(accordionWrapper);
    return accordionBody;
}
function _setupAccordionToggle(accordionBtn, accordionGroup, eventCleanups, onExpand, filterDef) {
    const accordionClickHandler = function () {
        requestAnimationFrame(function () {
            accordionGroup.classList.toggle("is-expanded");
            const isExpanded = accordionGroup.classList.contains("is-expanded");
            accordionBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false"); // D2
            if (isExpanded) {
                onExpand(accordionGroup, filterDef);
            }
            else {
                const LazyLoader = FilterPanelLazyLoader;
                if (LazyLoader)
                    LazyLoader.markAccordionClosed(accordionGroup);
            }
        });
    };
    if (events) {
        eventCleanups.push(events.on(accordionBtn, "click", accordionClickHandler, false, "FilterPanel.accordionToggle"));
    }
    else {
        accordionBtn.addEventListener("click", accordionClickHandler);
    }
}
function createAccordionGroup(filterDef, groupEl, eventCleanups, onExpand) {
    const accordionGroup = createElement("div", {
        className: "gl-filter-panel__group--accordion",
        attributes: { "data-accordion-for": filterDef.id },
    });
    const { accordionHeader, accordionBtn, contentId } = _createAccordionHeader(filterDef);
    const body = _createAccordionBody(groupEl, contentId);
    _setupAccordionToggle(accordionBtn, accordionGroup, eventCleanups, onExpand, filterDef);
    accordionGroup.appendChild(accordionHeader);
    accordionGroup.appendChild(body);
    return accordionGroup;
}
/**
 * Displays un message simple (state empty, error)
 */
function _setMessage(area, className, text) {
    while (area.firstChild)
        area.removeChild(area.firstChild);
    const div = document.createElement("div");
    div.className = className;
    div.textContent = text;
    area.appendChild(div);
}
function _resolveCurrentTheme() {
    let theme = ThemeSelector.getCurrentTheme();
    if (!theme) {
        const profile = Config$3 && typeof Config$3.getActiveProfile === "function"
            ? Config$3.getActiveProfile()
            : null;
        if (profile &&
            profile.themes &&
            profile.themes.config &&
            profile.themes.config.defautTheme) {
            theme = profile.themes.config.defautTheme;
        }
    }
    return theme || "defaut";
}
/**
 * Loads the contenu of a accordion to the demande (lazy loading).
 * @param accordionGroup - Element of the accordion
 * @param _filterDef - Setsion du filters (reservede pour usage futur)
 */
function _handleLazyLoad(LazyLoader, Log, lazyType, contentArea, accordionGroup, currentTheme) {
    try {
        if (lazyType === "categories") {
            const result = LazyLoader.loadCategories(currentTheme);
            if (!result.usedIds || result.usedIds.size === 0) {
                _setMessage(contentArea, "gl-filter-panel__empty", getLabel("ui.filter_panel.no_categories"));
                accordionGroup.dataset.lazyLoaded = "true";
                return;
            }
            const htmlContent = buildCategoryTreeContent(result);
            // Use createContextualFragment (strips scripts only) to preserve <input>, <label>,
            // <div> and all attributes (class, data-*, type, value, name) that
            // DOMSecurity.setSafeHTML/sanitizeHTML whitelist would strip, breaking checkboxes.
            contentArea.textContent = "";
            const catFrag = document
                .createRange()
                .createContextualFragment(htmlContent.replace(/<script[\s\S]*?<\/script>/gi, ""));
            contentArea.appendChild(catFrag);
            attachCategoryTreeListeners(contentArea);
            LazyLoader.markAccordionOpen("categories", accordionGroup);
        }
        else if (lazyType === "tags") {
            const tags = LazyLoader.loadTags(currentTheme);
            if (!tags || tags.length === 0) {
                _setMessage(contentArea, "gl-filter-panel__empty", getLabel("ui.filter_panel.no_tags"));
                accordionGroup.dataset.lazyLoaded = "true";
                return;
            }
            const htmlContent = buildTagsListContent(tags);
            // Use createContextualFragment (strips scripts only) to preserve class and
            // data-tag-value on <span> badges — sanitizeHTML whitelist stripped these
            // attributes, making tags non-selectable and unreadable by the state-reader.
            contentArea.textContent = "";
            const tagFrag = document
                .createRange()
                .createContextualFragment(htmlContent.replace(/<script[\s\S]*?<\/script>/gi, ""));
            contentArea.appendChild(tagFrag);
            attachTagsListeners(contentArea);
            LazyLoader.markAccordionOpen("tags", accordionGroup);
        }
        accordionGroup.dataset.lazyLoaded = "true";
    }
    catch (err) {
        Log.error("[FilterPanel] Erreur durant le loading lazy:", err);
        _setMessage(contentArea, "gl-filter-panel__error", "Erreur: " + err?.message);
    }
}
function loadAccordionContentIfNeeded(accordionGroup, _filterDef) {
    const Log = getLog();
    const LazyLoader = FilterPanelLazyLoader;
    if (!LazyLoader) {
        Log.warn("[FilterPanel] LazyLoader non disponible");
        return;
    }
    if (accordionGroup.dataset.lazyLoaded === "true") {
        Log.debug("[FilterPanel] Accordion already loaded for this theme, skip");
        return;
    }
    const contentArea = accordionGroup.querySelector("[data-lazy-type]");
    if (!contentArea) {
        Log.debug("[FilterPanel] No lazy zone in this accordion");
        return;
    }
    const lazyType = contentArea.dataset.lazyType;
    Log.info(`[FilterPanel] Chargement lazy du contenu: ${lazyType}`);
    const currentTheme = _resolveCurrentTheme();
    (function setLoading(area) {
        while (area.firstChild)
            area.removeChild(area.firstChild);
        const loader = document.createElement("div");
        loader.className = "gl-filter-panel__loading";
        loader.textContent = getLabel("ui.filter_panel.loading");
        area.appendChild(loader);
    })(contentArea);
    setTimeout(() => _handleLazyLoad(LazyLoader, Log, lazyType, contentArea, accordionGroup, currentTheme), 10);
}

/**
 * GeoLeaf UI Filter Panel - Renderer Core
 * Building maine du squelette HTML du filter panels
 * (header, body with filters/accordions, footer, event wiring)
 *
 * @module ui/filter-panel/filter-panel-renderer-core
 */
function _resolveSearchPanel(profile) {
    if (profile.panels && profile.panels.searchConfig)
        return profile.panels.searchConfig;
    if (profile.panels && profile.panels.search)
        return profile.panels.search;
    if (profile.searchConfig)
        return profile.searchConfig;
    return profile.search || null;
}
function _resolveFilters(searchPanel) {
    if (!searchPanel)
        return null;
    if (!Array.isArray(searchPanel.filters))
        return null;
    return searchPanel.filters.length > 0 ? searchPanel.filters : null;
}
function _buildFilterPanelHeader(container, searchPanel, toggleVisibility) {
    const header = createElement("div", { className: "gl-filter-panel__header" });
    const title = createElement("h2", {
        className: "gl-filter-panel__title",
        textContent: searchPanel.title || getLabel("ui.filter_panel.title"),
    });
    header.appendChild(title);
    const toggleBtn = createElement("button", {
        type: "button",
        className: "gl-filter-panel__toggle-btn",
        attributes: {
            "data-gl-action": "filter-close",
            "aria-label": getLabel("aria.filter_panel.close_inner"),
        },
    });
    const toggleIcon = createElement("span", {
        className: "gl-filter-panel__toggle-icon",
        textContent: "◀",
    });
    toggleBtn.appendChild(toggleIcon);
    header.appendChild(toggleBtn);
    container.appendChild(header);
}
function _buildFilterPanelBody(container, filters, profile, eventCleanups) {
    const body = createElement("div", { className: "gl-filter-panel__body" });
    const bodyFragment = document.createDocumentFragment();
    filters.forEach(function (filterDef) {
        if (filterDef.type === "search")
            return;
        const skipLabel = filterDef.id === "categories" ||
            filterDef.id === "tags" ||
            filterDef.type === "proximity";
        const groupEl = _buildFilterControl(filterDef, profile, skipLabel);
        if (!groupEl)
            return;
        if (filterDef.id === "categories" || filterDef.id === "tags") {
            bodyFragment.appendChild(createAccordionGroup(filterDef, groupEl, eventCleanups, loadAccordionContentIfNeeded));
        }
        else {
            bodyFragment.appendChild(groupEl);
        }
    });
    body.appendChild(bodyFragment);
    container.appendChild(body);
}
function _buildFilterPanelFooter(container, searchPanel) {
    const footer = createElement("div", { className: "gl-filter-panel__footer" });
    const resetLabel = (searchPanel.actions && searchPanel.actions.resetLabel) ||
        getLabel("ui.filter_panel.reset");
    footer.appendChild(createElement("button", {
        type: "button",
        className: "gl-btn gl-btn--subtle gl-filter-panel__btn-reset",
        textContent: resetLabel,
    }));
    const applyLabel = (searchPanel.actions && searchPanel.actions.applyLabel) ||
        getLabel("ui.filter_panel.apply");
    if (applyLabel) {
        footer.appendChild(createElement("button", {
            type: "button",
            className: "gl-btn gl-btn--primary gl-filter-panel__btn-apply",
            textContent: applyLabel,
        }));
    }
    container.appendChild(footer);
}
function _addClickHandler(container, eventCleanups, handler, label) {
    if (events) {
        eventCleanups.push(events.on(container, "click", handler, false, label));
    }
    else {
        container.addEventListener("click", handler);
    }
}
function _addKeydownHandler(container, eventCleanups, handler, label) {
    if (events) {
        eventCleanups.push(events.on(container, "keydown", handler, false, label));
    }
    else {
        container.addEventListener("keydown", handler);
    }
}
function _wireFilterPanelEvents(container, eventCleanups, toggleVisibility, Applier, StateReader) {
    if (container._glFilterHandlersBound)
        return;
    const containerClickHandler = function (evt) {
        const target = evt.target;
        if (target.closest("[data-gl-action='filter-close']")) {
            evt.preventDefault();
            toggleVisibility(false);
            return;
        }
        if (target.classList.contains("gl-filter-panel__btn-reset")) {
            evt.preventDefault();
            StateReader.resetCategoryTagControls(container);
            Applier.applyFiltersNow(container, true);
        }
        if (target.classList.contains("gl-filter-panel__btn-apply")) {
            evt.preventDefault();
            Applier.applyFiltersNow(container);
        }
    };
    const containerKeydownHandler = function (evt) {
        if (evt.key !== "Enter" && evt.keyCode !== 13)
            return;
        const searchInput = evt.target.closest("[data-gl-filter-id='searchText'] input[type='text']");
        if (!searchInput)
            return;
        evt.preventDefault();
        Applier.applyFiltersNow(container);
    };
    _addClickHandler(container, eventCleanups, containerClickHandler, "FilterPanel.containerClick");
    _addKeydownHandler(container, eventCleanups, containerKeydownHandler, "FilterPanel.enterKey");
    container._glFilterHandlersBound = true;
}
/**
 * Builds the filter panels from the configuration of the profile active.
 * @param options - Options (container optional)
 * @param eventCleanups - Array de fonctions de cleanup d'events (shared avec l'orchestrateur)
 * @param toggleVisibility - Callback pour basculer la visibility du panel
 */
function buildFilterPanelFromActiveProfile(options, eventCleanups, toggleVisibility) {
    const Log = getLog();
    const Shared = FilterPanelShared;
    const StateReader = FilterPanelStateReader;
    const Applier = FilterPanelApplier;
    const profile = getActiveProfile();
    if (Log)
        Log.debug("[FilterPanel] buildFilterPanelFromActiveProfile CALLED, options:", options);
    if (!profile) {
        Log.warn("[GeoLeaf.UI.FilterPanel] No active profile found");
        return;
    }
    Log.info("[GeoLeaf.UI.FilterPanel] Profil actif:", profile.id || "unknown");
    const searchPanel = _resolveSearchPanel(profile);
    if (!searchPanel) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Aucune configuration search/panels.search dans le profile");
        return;
    }
    const filters = _resolveFilters(searchPanel);
    if (!filters) {
        Log.warn("[GeoLeaf.UI.FilterPanel] No filters defined in profile.search.filters for the active profile.");
        return;
    }
    Log.info("[GeoLeaf.UI.FilterPanel] Number of filters found:", filters.length);
    const container = (options && options.container) || Shared.getFilterPanelElement();
    if (!container) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Conteneur de panel not found");
        return;
    }
    while (container.firstChild)
        container.removeChild(container.firstChild);
    container.classList.add("gl-filter-panel");
    _buildFilterPanelHeader(container, searchPanel);
    _buildFilterPanelBody(container, filters, profile, eventCleanups);
    _buildFilterPanelFooter(container, searchPanel);
    _wireFilterPanelEvents(container, eventCleanups, toggleVisibility, Applier, StateReader);
    container.classList.remove("gl-is-open");
}

/**
 * GeoLeaf UI Filter Panel - Tags Populator
 * Peuplement des badges/tags dans the panel de filtres
 *
 * @module ui/filter-panel/filter-panel-tags
 */
/**
 * Refreshes les badges de tags dans the panel de filtres.
 * Must be called AFTER POIs have been loaded.
 * @param eventCleanups - Array de fonctions de cleanup d'events
 */
function refreshFilterTags(eventCleanups) {
    const Log = getLog();
    const Shared = FilterPanelShared;
    const container = Shared.getFilterPanelElement();
    if (!container) {
        Log.warn("[GeoLeaf.UI.FilterPanel.refreshFilterTags] Filter panel not found");
        return;
    }
    // Retrieve POI et routes
    const basePois = Shared.getBasePois();
    const baseRoutes = Shared.getBaseRoutes();
    const allItems = basePois.concat(baseRoutes);
    Log.debug("[GeoLeaf.UI.FilterPanel.refreshFilterTags] Items:", basePois.length, "POI,", baseRoutes.length, "routes");
    // Collecter tous les tags
    const allTags = Shared.collectAllTags(allItems);
    // Peupler les badges
    populateTagsBadges(container, allTags, eventCleanups);
}
/**
 * Peuple le conteneur de badges with thes tags fournis
 * @param panelEl - Element du filter panels
 * @param allTags - List des tags uniques
 * @param eventCleanups - Array de fonctions de cleanup d'events
 */
function _onTagBadgeClick() {
    this.classList.toggle("gl-is-selected");
}
function _buildTagBadges(tags, eventCleanups) {
    const tagsFragment = document.createDocumentFragment();
    tags.forEach(function (tag) {
        const badge = createElement("span", {
            className: "gl-filter-panel__tag-badge",
            textContent: tag,
            attributes: { "data-tag-value": tag },
        });
        if (events) {
            eventCleanups.push(events.on(badge, "click", _onTagBadgeClick, false, "FilterPanel.tagBadge"));
        }
        else {
            badge.addEventListener("click", _onTagBadgeClick);
        }
        tagsFragment.appendChild(badge);
    });
    return tagsFragment;
}
function populateTagsBadges(panelEl, allTags, eventCleanups) {
    const Log = getLog();
    const wrapper = panelEl.querySelector("[data-gl-filter-id='tags']");
    if (!wrapper) {
        Log.debug("[GeoLeaf.UI.FilterPanel] Tags wrapper not found — probably not used in this profile");
        return;
    }
    const tagsContainer = wrapper.querySelector(".gl-filter-panel__tags-container");
    if (!tagsContainer) {
        Log.warn("[GeoLeaf.UI.FilterPanel] Tags container not found");
        return;
    }
    // Trouver l'accordion parent par l'attribut data-accordion-for
    const accordionGroup = panelEl.querySelector("[data-accordion-for='tags']");
    Log.debug("[GeoLeaf.UI.FilterPanel] Looking for accordion with [data-accordion-for='tags']");
    Log.debug("[GeoLeaf.UI.FilterPanel] Accordion found:", accordionGroup);
    // Emptyr le container
    while (tagsContainer.firstChild) {
        tagsContainer.removeChild(tagsContainer.firstChild);
    }
    // Si pas de tags, cacher completement l'accordion parent
    if (!allTags.length) {
        Log.debug("[GeoLeaf.UI.FilterPanel] Pas de tags (count:", allTags.length, ")");
        if (accordionGroup) {
            accordionGroup.style.display = "none";
            Log.info("[GeoLeaf.UI.FilterPanel] Tags accordion HIDDEN (display: none)");
        }
        else {
            Log.warn("[GeoLeaf.UI.FilterPanel] Tags accordion not found to hide it");
        }
        return;
    }
    // S'il y a des tags, s'assurer que l'accordion est visible
    Log.debug("[GeoLeaf.UI.FilterPanel] Tags detected (count:", allTags.length, ")");
    if (accordionGroup) {
        accordionGroup.style.display = "";
        Log.info("[GeoLeaf.UI.FilterPanel] Tags accordion SHOWN");
    }
    // Createsr les badges
    tagsContainer.appendChild(_buildTagBadges(allTags, eventCleanups));
}

/**
 * GeoLeaf UI Filter Panel - Renderer (Orchestrateur)
 * Assemble les sous-modules et expose l'API public unchanged.
 *
 * @module ui/filter-panel/renderer
 */
const FilterPanelRenderer = {};
FilterPanelRenderer._eventCleanups = [];
/**
 * Builds the filter panels from the configuration of the profile active
 * @param {Object} options - Options
 * @param {HTMLElement} [options.container] - Conteneur cible
 */
FilterPanelRenderer.buildFilterPanelFromActiveProfile = function (options) {
    buildFilterPanelFromActiveProfile(options, FilterPanelRenderer._eventCleanups, FilterPanelRenderer.toggleFilterPanelVisibility.bind(FilterPanelRenderer));
};
/**
 * Switches la visibility du filter panels.
 * @param {boolean} [forceState] - Force the state (true = open, false = closed)
 */
FilterPanelRenderer.toggleFilterPanelVisibility = function (forceState) {
    const container = FilterPanelShared.getFilterPanelElement();
    if (!container)
        return;
    const isOpen = container.classList.contains("gl-is-open");
    let nextState;
    if (typeof forceState === "boolean") {
        nextState = forceState;
    }
    else {
        nextState = !isOpen;
    }
    if (nextState) {
        container.classList.add("gl-is-open");
    }
    else {
        container.classList.remove("gl-is-open");
    }
    // Mettre up to date l'icon du button toggle external
    const toggleBtn = document.getElementById("gl-filter-toggle");
    if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", nextState ? "true" : "false"); // E1
        const icon = toggleBtn.querySelector(".gl-filter-toggle__icon");
        if (icon) {
            if (nextState) {
                setToggleIconOpen(icon);
                toggleBtn.setAttribute("aria-label", getLabel("aria.filter_panel.close"));
            }
            else {
                setToggleIconClosed(icon);
                toggleBtn.setAttribute("aria-label", getLabel("aria.filter_panel.open"));
            }
        }
    }
};
/**
 * Initializes le button toggle du filter panels
 */
FilterPanelRenderer.initFilterToggle = function () {
    const Log = getLog();
    const toggleBtn = document.getElementById("gl-filter-toggle");
    const panel = FilterPanelShared.getFilterPanelElement();
    if (!toggleBtn || !panel) {
        Log.info("[GeoLeaf.UI.FilterPanel] Bouton toggle ou panel filtres not found");
        return;
    }
    const toggleClickHandler = function () {
        const isOpen = panel.classList.contains("gl-is-open");
        const icon = toggleBtn.querySelector(".gl-filter-toggle__icon");
        if (isOpen) {
            panel.classList.remove("gl-is-open");
            if (icon) {
                setToggleIconClosed(icon);
            }
            toggleBtn.setAttribute("aria-expanded", "false"); // E1
            toggleBtn.setAttribute("aria-label", getLabel("aria.filter_panel.open"));
        }
        else {
            panel.classList.add("gl-is-open");
            if (icon) {
                setToggleIconOpen(icon);
            }
            toggleBtn.setAttribute("aria-expanded", "true"); // E1
            toggleBtn.setAttribute("aria-label", getLabel("aria.filter_panel.close"));
        }
    };
    if (events) {
        FilterPanelRenderer._eventCleanups.push(events.on(toggleBtn, "click", toggleClickHandler, false, "FilterPanel.toggleButton"));
    }
    else {
        toggleBtn.addEventListener("click", toggleClickHandler);
    }
    Log.info("[GeoLeaf.UI.FilterPanel] Filter toggle button initialized");
};
/**
 * Refreshes les badges de tags dans the panel de filtres.
 * Must be called AFTER POIs have been loaded.
 */
FilterPanelRenderer.refreshFilterTags = function () {
    refreshFilterTags(FilterPanelRenderer._eventCleanups);
};
/**
 * Peuple le conteneur de badges with thes tags fournis
 * @param {HTMLElement} panelEl - Element du filter panels
 * @param {Array} allTags - List des tags uniques
 */
FilterPanelRenderer.populateTagsBadges = function (panelEl, allTags) {
    populateTagsBadges(panelEl, allTags, FilterPanelRenderer._eventCleanups);
};
/**
 * Cleanup method for event listners
 * Call this when destroying the filter panel
 * MEMORY LEAK FIX (Phase 2): Also cleanup timeouts in applier
 */
FilterPanelRenderer.destroy = function () {
    const Log = getLog();
    if (Log)
        Log.debug("[FilterPanel] Cleaning up event listeners");
    if (FilterPanelRenderer._eventCleanups) {
        FilterPanelRenderer._eventCleanups.forEach((cleanup) => {
            if (typeof cleanup === "function") {
                cleanup();
            }
        });
        FilterPanelRenderer._eventCleanups = [];
    }
    // MEMORY LEAK FIX (Phase 2): Cleanup applier timeouts
    if (FilterPanelApplier && FilterPanelApplier.destroy) {
        FilterPanelApplier.destroy();
    }
};
/**
 * Loads the contenu of a accordion to the demande (lazy loading)
 * @param {HTMLElement} accordionGroup - Element of the accordion
 * @param {Object} _filterDef - Setsion du filters (reservede pour usage futur)
 */
FilterPanelRenderer._loadAccordionContentIfNeeded = function (accordionGroup, _filterDef) {
    loadAccordionContentIfNeeded(accordionGroup);
};

/**
 * GeoLeaf UI Filter Panel - Core
 * API public et delegation to thes sous-modules
 *
 * @module ui/filter-panel/core
 */
// Direct ESM bindings (P3-DEAD-01 completee)
const getShared = () => FilterPanelShared;
const getStateReader = () => FilterPanelStateReader;
const getApplier = () => FilterPanelApplier;
const getRenderer = () => FilterPanelRenderer;
const getProximity = () => FilterPanelProximity$1;
const FilterPanel = {};
// ========================================
//   API PUBLIQUE - Delegation vers sous-modules
// ========================================
/**
 * Builds the filter panels from the configuration of the profile active
 * @param {Object} options - Options
 */
FilterPanel.buildFilterPanelFromActiveProfile = function (options) {
    const Renderer = getRenderer();
    if (Renderer && Renderer.buildFilterPanelFromActiveProfile) {
        return Renderer.buildFilterPanelFromActiveProfile(options);
    }
    getLog().error("[GeoLeaf.UI.FilterPanel] Renderer module not loaded");
};
/**
 * Switches la visibility du filter panels
 * @param {boolean} [forceState]
 */
FilterPanel.toggleFilterPanelVisibility = function (forceState) {
    const Renderer = getRenderer();
    if (Renderer && Renderer.toggleFilterPanelVisibility) {
        return Renderer.toggleFilterPanelVisibility(forceState);
    }
};
/**
 * Initializes le button toggle du filter panels
 */
FilterPanel.initFilterToggle = function () {
    const Renderer = getRenderer();
    if (Renderer && Renderer.initFilterToggle) {
        return Renderer.initFilterToggle();
    }
};
/**
 * Refreshes les badges de tags
 */
FilterPanel.refreshFilterTags = function () {
    const Renderer = getRenderer();
    if (Renderer && Renderer.refreshFilterTags) {
        return Renderer.refreshFilterTags();
    }
};
/**
 * Applies thes filtres initiaux
 */
FilterPanel.applyFiltersInitial = function () {
    const Applier = getApplier();
    if (Applier && Applier.applyFiltersInitial) {
        return Applier.applyFiltersInitial();
    }
};
/**
 * Initializes le proximity filter
 * @param {unknown} map
 */
FilterPanel.initProximityFilter = function (map) {
    const Proximity = getProximity();
    if (Proximity && Proximity.initProximityFilter) {
        return Proximity.initProximityFilter(map);
    }
};
/**
 * Returns the element DOM du filter panels
 * @returns {HTMLElement|null}
 */
FilterPanel._getFilterPanelElement = function () {
    const Shared = getShared();
    if (Shared && Shared.getFilterPanelElement) {
        return Shared.getFilterPanelElement();
    }
    return null;
};
/**
 * Retrieves thes POI de base
 * @returns {Array}
 */
FilterPanel._getBasePois = function () {
    const Shared = getShared();
    if (Shared && Shared.getBasePois) {
        return Shared.getBasePois();
    }
    return [];
};
/**
 * Retrieves thes routes de base
 * @returns {Array}
 */
FilterPanel._getBaseRoutes = function () {
    const Shared = getShared();
    if (Shared && Shared.getBaseRoutes) {
        return Shared.getBaseRoutes();
    }
    return [];
};
/**
 * Lit the state des filtres from the panel
 * @param {HTMLElement} panelEl
 * @returns {Object}
 */
FilterPanel._readFiltersFromPanel = function (panelEl) {
    const StateReader = getStateReader();
    if (StateReader && StateReader.readFiltersFromPanel) {
        return StateReader.readFiltersFromPanel(panelEl);
    }
    return {};
};
/**
 * Filtre a list de POI
 * @param {Array} basePois
 * @param {Object} filterState
 * @returns {Array}
 */
FilterPanel._filterPoiList = function (basePois, filterState) {
    const Applier = getApplier();
    if (Applier && Applier.filterPoiList) {
        return Applier.filterPoiList(basePois, filterState);
    }
    return basePois || [];
};
/**
 * Filtre a list de routes
 * @param {Array} baseRoutes
 * @param {Object} filterState
 * @returns {Array}
 */
FilterPanel._filterRouteList = function (baseRoutes, filterState) {
    const Applier = getApplier();
    if (Applier && Applier.filterRouteList) {
        return Applier.filterRouteList(baseRoutes, filterState);
    }
    return baseRoutes || [];
};
/**
 * Refreshes the layer POI
 * @param {Array} filteredPois
 */
FilterPanel._refreshPoiLayer = function (filteredPois) {
    const Applier = getApplier();
    if (Applier && Applier.refreshPoiLayer) {
        return Applier.refreshPoiLayer(filteredPois);
    }
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI Module - Filter Panel (Aggregator)
 *
 * Ce file est un aggregator for the backward compatibility.
 * The logic has been moved into sub-modules:
 * - filter-panel/shared.js       : Helpers de data shareds
 * - filter-panel/state-reader.js : Read de the state des filtres
 * - filter-panel/applier.js      : Application des filtres
 * - filter-panel/renderer.js     : Building du panel HTML
 * - filter-panel/proximity.js    : Gestion des filtres de proximity
 * - filter-panel/core.js         : API public et delegation
 *
 * @module ui/filter-panel
 */
const FilterPanelAggregator = FilterPanel;

/**
 * GeoLeaf UI – Mobile toolbar: shared mutable state, types and constants.
 * @module ui/mobile-toolbar-state
 */
const _g$d = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
function getDefaultSheetTitles() {
    return {
        zoom: getLabel("sheet.title.zoom"),
        geoloc: getLabel("sheet.title.geoloc"),
        search: getLabel("sheet.title.search"),
        proximity: getLabel("sheet.title.proximity"),
        filters: getLabel("sheet.title.filters"),
        themes: getLabel("sheet.title.themes"),
        legend: getLabel("sheet.title.legend"),
        layers: getLabel("sheet.title.layers"),
        table: getLabel("sheet.title.table"),
    };
}
/** Shared mutable DOM and runtime state — populated during init by each sub-module. */
const domState = {
    overlay: null,
    toolbar: null,
    filterGroup: null,
    filterBtn: null,
    resetBtn: null,
    scrollEl: null,
    navUp: null,
    navDown: null,
    panelTitle: null,
    panelBody: null,
    tooltipEl: null,
    activeSheetId: null,
    options: null,
    filterCheckInterval: null,
    proximityActive: false,
    // proximity bar
    proximityBar: null,
    proximitySlider: null,
    proximityValidateBtn: null,
    proximityInstruction: null,
    proximityRadiusLabel: null,
    // search bar
    searchBar: null,
    searchInput: null,
    // sheet restore
    restoreOnClose: [],
    lastFocusedElement: null,
};

/**
 * GeoLeaf UI – Mobile toolbar: pill DOM creation, nav arrows, tooltip and filter state.
 * @module ui/mobile-toolbar-pill
 */
function createSvgIcon(pathData, size = 22) {
    const opts = { stroke: "currentColor", strokeWidth: "2", fill: "none" };
    return DOMSecurity.createSVGIcon(size, size, pathData, opts);
}
/**
 * Updates nav arrow visibility according to current scroll position.
 * Arrows appear only when the content overflows the visible area.
 */
function updateNavVisibility() {
    if (!domState.scrollEl || !domState.navUp || !domState.navDown)
        return;
    const { scrollTop, scrollHeight, clientHeight } = domState.scrollEl;
    const hasOverflow = scrollHeight > clientHeight + 2;
    const canScrollUp = scrollTop > 2;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 2;
    domState.navUp.classList.toggle("gl-is-visible", hasOverflow && canScrollUp);
    domState.navDown.classList.toggle("gl-is-visible", hasOverflow && canScrollDown);
}
/**
 * Refreshes the visual state of the filter button (active / reset).
 */
function refreshFilterButtonState() {
    let active = domState.options?.getFilterActiveState?.() ?? false;
    if (!active) {
        const panel = document.querySelector("#gl-filter-panel");
        if (panel) {
            const checkedCats = panel.querySelectorAll(".gl-filter-tree__checkbox--category:checked, .gl-filter-tree__checkbox--subcategory:checked").length;
            const selectedTags = panel.querySelectorAll(".gl-filter-panel__tag-badge.gl-is-selected").length;
            active = checkedCats > 0 || selectedTags > 0;
        }
    }
    domState.filterBtn?.classList.toggle("gl-map-toolbar__btn--active", active);
    domState.filterGroup?.classList.toggle("gl-has-active-filters", active);
}
function _getNavItems() {
    return [
        {
            id: "",
            label: getLabel("aria.toolbar.fullscreen"),
            tooltip: getLabel("aria.toolbar.fullscreen"),
            path: "M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6",
            action: "fullscreen",
        },
        {
            id: "",
            label: getLabel("aria.toolbar.zoom_in"),
            tooltip: getLabel("aria.toolbar.zoom_in"),
            path: "M12 5v14M5 12h14",
            action: "zoom-in",
        },
        {
            id: "",
            label: getLabel("aria.toolbar.zoom_out"),
            tooltip: getLabel("aria.toolbar.zoom_out"),
            path: "M5 12h14",
            action: "zoom-out",
        },
        ...(domState.options?.showGeolocation !== false
            ? [
                {
                    id: "geoloc",
                    label: getLabel("aria.toolbar.geoloc"),
                    tooltip: getLabel("aria.toolbar.geoloc"),
                    path: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 7a3 3 0 100 6 3 3 0 000-6z",
                },
            ]
            : []),
    ];
}
function _getMapToolItems() {
    // Sprint 4: legend and table are now rendered dynamically via registry.getUISlots()
    return [
        ...(domState.options?.showThemeSelector !== false
            ? [
                {
                    id: "",
                    label: getLabel("aria.toolbar.themes"),
                    tooltip: getLabel("tooltip.toolbar.themes"),
                    path: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
                    action: "themes",
                },
            ]
            : []),
        ...(domState.options?.showLayerManager !== false
            ? [
                {
                    id: "layers",
                    label: getLabel("aria.toolbar.layers"),
                    tooltip: getLabel("tooltip.toolbar.layers"),
                    path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
                },
            ]
            : []),
    ];
}
function _getToolbarItems() {
    // Sprint 4: search is now rendered dynamically via registry.getUISlots()
    return [
        ..._getNavItems(),
        ...(domState.options?.showAddPoi && POIAddFormContract.isAddFormAvailable()
            ? [
                {
                    id: "",
                    label: getLabel("aria.toolbar.poi_add"),
                    tooltip: getLabel("tooltip.toolbar.poi_add"),
                    path: "M12 2 C 6.5 2 2 6.5 2 12 C 2 17.5 6.5 22 12 22 C 17.5 22 22 17.5 22 12 C 22 6.5 17.5 2 12 2 M12 8 L12 16 M8 12 L16 12",
                    action: "poi-add",
                },
            ]
            : []),
        {
            id: "proximity",
            label: getLabel("aria.toolbar.proximity"),
            tooltip: getLabel("tooltip.toolbar.proximity"),
            path: "M12 2v2M12 20v2M2 12h2M20 12h2M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0",
        },
        ..._getMapToolItems(),
    ];
}
function _buildToolbarButton(b, index, filterGroup, scroll) {
    if (index === 6 && domState.options?.showFilterPanel !== false)
        scroll.appendChild(filterGroup);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gl-map-toolbar__btn";
    if (b.id)
        btn.setAttribute("data-gl-sheet", b.id);
    btn.setAttribute("aria-label", b.label);
    btn.setAttribute("data-tooltip", b.tooltip);
    if (b.action)
        btn.setAttribute("data-gl-toolbar-action", b.action);
    if ((b.id && !["geoloc", "proximity"].includes(b.id)) || b.action === "themes")
        btn.setAttribute("aria-expanded", "false");
    btn.appendChild(createSvgIcon(b.path));
    scroll.appendChild(btn);
}
function _attachNavScroll(btn, direction) {
    const SCROLL_STEP = 80;
    btn.addEventListener("click", () => {
        if (domState.scrollEl) {
            domState.scrollEl.scrollBy({ top: direction * SCROLL_STEP, behavior: "smooth" });
        }
    });
}
function _createFilterGroup() {
    const filterGroup = document.createElement("div");
    filterGroup.className = "gl-map-toolbar__group";
    domState.filterGroup = filterGroup;
    const filterBtn = document.createElement("button");
    filterBtn.type = "button";
    filterBtn.className = "gl-map-toolbar__btn";
    filterBtn.setAttribute("data-gl-sheet", "filters");
    filterBtn.setAttribute("data-gl-toolbar-action", "filters");
    filterBtn.setAttribute("aria-label", getLabel("aria.toolbar.filters"));
    filterBtn.setAttribute("aria-expanded", "false");
    filterBtn.appendChild(createSvgIcon("M4 4h16v2.5l-6 6v6l-4 2v-8l-6-6V4z"));
    domState.filterBtn = filterBtn;
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "gl-map-toolbar__reset";
    resetBtn.setAttribute("aria-label", getLabel("aria.toolbar.reset_filters"));
    resetBtn.setAttribute("data-gl-toolbar-action", "reset-filters");
    resetBtn.appendChild(createSvgIcon("M4 6h16M4 12h16M4 18h16M3 3l18 18", 18));
    domState.resetBtn = resetBtn;
    filterGroup.appendChild(filterBtn);
    filterGroup.appendChild(resetBtn);
    filterBtn.setAttribute("data-tooltip", getLabel("tooltip.toolbar.filters"));
    return filterGroup;
}
/**
 * Implements roving tabindex on the toolbar (WCAG 2.1 §1.5.5).
 * Only the active button exposes tabindex=0; arrow keys cycle focus.
 */
function _attachRovingTabindex(toolbar) {
    const _btns = () => Array.from(toolbar.querySelectorAll(".gl-map-toolbar__btn:not([disabled]), .gl-map-toolbar__reset:not([disabled])")).filter((b) => b.offsetParent !== null);
    // Initialise: first button focusable, others withdrawn from tab order
    const initial = _btns();
    initial.forEach((b, i) => b.setAttribute("tabindex", i === 0 ? "0" : "-1"));
    toolbar.addEventListener("keydown", (e) => {
        const btns = _btns();
        if (!btns.length)
            return;
        const idx = btns.indexOf(document.activeElement);
        if (idx === -1)
            return;
        let next = -1;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            next = (idx + 1) % btns.length;
        }
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            next = (idx - 1 + btns.length) % btns.length;
        }
        else if (e.key === "Home") {
            e.preventDefault();
            next = 0;
        }
        else if (e.key === "End") {
            e.preventDefault();
            next = btns.length - 1;
        }
        if (next !== -1) {
            btns[idx].setAttribute("tabindex", "-1");
            btns[next].setAttribute("tabindex", "0");
            btns[next].focus();
        }
    });
    // Keep tabindex=0 in sync when a button receives focus by any means
    toolbar.addEventListener("focusin", (e) => {
        const target = e.target;
        const btn = target.closest(".gl-map-toolbar__btn, .gl-map-toolbar__reset");
        if (!btn)
            return;
        _btns().forEach((b) => b.setAttribute("tabindex", b === btn ? "0" : "-1"));
    });
}
/** Creates the pill wrapper, nav buttons, scroll container and icon buttons. */
/**
 * Appends toolbar buttons for modules that declare a `mobileIcon` UI slot.
 * Icons are rendered in module registration order (set in boot.ts).
 * Each button gets `data-gl-sheet={moduleId}` for the existing sheet delegation.
 */
function _appendRegistryIcons(scroll) {
    const registry = globalThis.GeoLeaf?.registry;
    if (!registry)
        return;
    const showMap = {
        legend: domState.options?.showLegend !== false,
        table: domState.options?.showTable !== false,
        filters: domState.options?.showFilterPanel !== false,
    };
    for (const mod of registry.getAll()) {
        if (!mod.ui?.mobileIcon)
            continue;
        if (mod.id in showMap && !showMap[mod.id])
            continue;
        const icon = mod.ui.mobileIcon;
        // Guard 1 — profileKey: respect config-driven visibility (implements IModuleUISlot contract)
        if (icon.profileKey) {
            const cfg = globalThis.GeoLeaf?.Config;
            const visible = cfg?.get?.(icon.profileKey, icon.defaultVisible ?? true);
            if (visible === false)
                continue;
        }
        // Guard 2 — requiresPlugin: only show if the backing plugin is loaded
        if (icon.requiresPlugin) {
            const pluginReg = globalThis.GeoLeaf?.plugins;
            if (!pluginReg?.isLoaded?.(icon.requiresPlugin))
                continue;
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gl-map-toolbar__btn";
        btn.setAttribute("data-gl-sheet", mod.id);
        btn.setAttribute("aria-label", getLabel(icon.labelKey));
        btn.setAttribute("data-tooltip", getLabel(icon.labelKey));
        btn.setAttribute("aria-expanded", "false");
        if (icon.action)
            btn.setAttribute("data-gl-toolbar-action", icon.action);
        // @security Route module-provided SVG through sanitizer to strip scripts/handlers
        DOMSecurity.setSafeHTML(btn, icon.icon, [
            "svg",
            "path",
            "circle",
            "rect",
            "line",
            "polyline",
            "polygon",
            "g",
            "defs",
            "use",
        ]);
        scroll.appendChild(btn);
    }
}
function createToolbarDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "gl-map-toolbar-wrapper";
    const navUp = document.createElement("button");
    navUp.type = "button";
    navUp.className = "gl-map-toolbar__nav";
    navUp.setAttribute("aria-label", getLabel("aria.toolbar.scroll_up"));
    navUp.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>';
    wrapper.appendChild(navUp);
    domState.navUp = navUp;
    const toolbar = document.createElement("div");
    toolbar.className = "gl-map-toolbar";
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", getLabel("aria.toolbar.root"));
    domState.toolbar = toolbar;
    const scroll = document.createElement("div");
    scroll.className = "gl-map-toolbar__scroll";
    domState.scrollEl = scroll;
    const filterGroup = _createFilterGroup();
    const items = _getToolbarItems();
    items.forEach((b, index) => _buildToolbarButton(b, index, filterGroup, scroll));
    // Sprint 4: render module-driven toolbar icons from registry UI slots
    _appendRegistryIcons(scroll);
    toolbar.appendChild(scroll);
    wrapper.appendChild(toolbar);
    const navDown = document.createElement("button");
    navDown.type = "button";
    navDown.className = "gl-map-toolbar__nav";
    navDown.setAttribute("aria-label", getLabel("aria.toolbar.scroll_down"));
    navDown.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
    wrapper.appendChild(navDown);
    domState.navDown = navDown;
    _attachNavScroll(navUp, -1);
    _attachNavScroll(navDown, 1);
    scroll.addEventListener("scroll", updateNavVisibility, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => updateNavVisibility());
        ro.observe(scroll);
    }
    // Roving tabindex for keyboard navigation within role=toolbar (1.5.5)
    toolbar.setAttribute("aria-orientation", "vertical");
    _attachRovingTabindex(toolbar);
    return wrapper;
}
// ── Tooltip ──────────────────────────────────────────────────────────────────
/** Creates the floating tooltip div (outside the pill, inside glMain). */
function createTooltipDom() {
    const tip = document.createElement("div");
    tip.className = "gl-toolbar-tooltip";
    tip.setAttribute("aria-hidden", "true");
    domState.tooltipEl = tip;
    return tip;
}
function _showTooltip(btn, glMain) {
    if (!domState.tooltipEl)
        return;
    const label = btn.getAttribute("data-tooltip");
    if (!label)
        return;
    domState.tooltipEl.textContent = label;
    domState.tooltipEl.style.display = "block";
    const btnRect = btn.getBoundingClientRect();
    const mainRect = glMain.getBoundingClientRect();
    const top = btnRect.top - mainRect.top + btnRect.height / 2;
    const left = btnRect.right - mainRect.left + 10;
    domState.tooltipEl.style.top = `${top}px`;
    domState.tooltipEl.style.left = `${left}px`;
    requestAnimationFrame(() => {
        if (domState.tooltipEl)
            domState.tooltipEl.classList.add("gl-is-visible");
    });
}
function _hideTooltip() {
    if (!domState.tooltipEl)
        return;
    domState.tooltipEl.classList.remove("gl-is-visible");
    domState.tooltipEl.addEventListener("transitionend", () => {
        if (domState.tooltipEl && !domState.tooltipEl.classList.contains("gl-is-visible")) {
            domState.tooltipEl.style.display = "none";
        }
    }, { once: true });
}
function attachTooltipHandlers(wrapper, glMain) {
    const btns = wrapper.querySelectorAll("[data-tooltip]");
    btns.forEach((btn) => {
        btn.addEventListener("mouseenter", () => _showTooltip(btn, glMain));
        btn.addEventListener("focusin", () => _showTooltip(btn, glMain));
        btn.addEventListener("mouseleave", _hideTooltip);
        btn.addEventListener("focusout", _hideTooltip);
        btn.addEventListener("pointerleave", _hideTooltip);
    });
}

/**
 * GeoLeaf UI – Mobile toolbar: inline text search bar.
 * @module ui/mobile-toolbar-searchbar
 */
/** Clears the search input and resets the filter. */
function clearSearchText() {
    if (!domState.searchInput)
        return;
    domState.searchInput.value = "";
    const filterPanel = document.querySelector("#gl-filter-panel");
    if (filterPanel) {
        const ghostInput = ensureSearchGhostInput(filterPanel);
        ghostInput.value = "";
        const applier = _g$d.GeoLeaf?._UIFilterPanelApplier;
        if (applier && typeof applier.applyFiltersNow === "function") {
            applier.applyFiltersNow(filterPanel);
        }
    }
    const clearBtn = domState.searchBar?.querySelector(".gl-search-bar__clear");
    if (clearBtn)
        clearBtn.style.display = "none";
    const searchBtn = domState.toolbar?.querySelector('[data-gl-toolbar-action="search"]');
    if (searchBtn instanceof HTMLElement) {
        searchBtn.classList.remove("gl-map-toolbar__btn--active", "gl-map-toolbar__btn--active-muted");
        searchBtn.setAttribute("aria-expanded", "true");
    }
}
/**
 * Ensures a hidden ghost input `[data-gl-filter-id='searchText']` exists in the
 * filter panel. The renderer skips the 'search' type control (commit 87840e6) so
 * this wrapper may not be in the DOM — creating it here lets state-reader.ts
 * detect `hasSearchText` correctly.
 */
function ensureSearchGhostInput(filterPanel) {
    let input = filterPanel.querySelector("[data-gl-filter-id='searchText'] input[type='text']");
    if (!input) {
        const ghost = document.createElement("div");
        ghost.setAttribute("data-gl-filter-id", "searchText");
        ghost.style.cssText = "display:none;position:absolute;visibility:hidden";
        input = document.createElement("input");
        input.type = "text";
        ghost.appendChild(input);
        filterPanel.appendChild(ghost);
    }
    return input;
}
/** Submits the text search value into the existing filter panel. */
function submitSearch() {
    if (!domState.searchInput)
        return;
    const value = domState.searchInput.value.trim();
    const filterPanel = document.querySelector("#gl-filter-panel");
    if (filterPanel) {
        const ghostInput = ensureSearchGhostInput(filterPanel);
        ghostInput.value = value;
        const applier = _g$d.GeoLeaf?._UIFilterPanelApplier;
        if (applier && typeof applier.applyFiltersNow === "function") {
            applier.applyFiltersNow(filterPanel);
        }
        else {
            const applyBtn = filterPanel.querySelector(".gl-filter-panel__btn-apply");
            if (applyBtn)
                applyBtn.click();
        }
    }
    const clearBtnSubmit = domState.searchBar?.querySelector(".gl-search-bar__clear");
    if (clearBtnSubmit)
        clearBtnSubmit.style.display = value.length > 0 ? "flex" : "none";
    const searchBtn = domState.toolbar?.querySelector('[data-gl-toolbar-action="search"]');
    if (searchBtn instanceof HTMLElement) {
        const hasValue = value.length > 0;
        searchBtn.classList.toggle("gl-map-toolbar__btn--active", hasValue);
        searchBtn.setAttribute("aria-expanded", hasValue ? "true" : "false");
    }
}
/** Opens the inline search bar with animation. */
function openSearchBar() {
    if (!domState.searchBar)
        return;
    domState.searchBar.style.display = "flex";
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (domState.searchBar)
                domState.searchBar.classList.add("gl-is-visible");
            domState.searchInput?.focus();
            const glMain = domState.options?.glMain;
            if (glMain) {
                glMain.style.setProperty("--gl-search-bar-height", "46px");
                glMain.style.setProperty("--gl-search-bar-gap", "0.4rem");
            }
        });
    });
    const searchBtn = domState.toolbar?.querySelector('[data-gl-toolbar-action="search"]');
    if (searchBtn instanceof HTMLElement) {
        searchBtn.setAttribute("aria-expanded", "true");
        searchBtn.classList.remove("gl-map-toolbar__btn--active-muted");
        if ((domState.searchInput?.value.trim().length ?? 0) > 0) {
            searchBtn.classList.add("gl-map-toolbar__btn--active");
        }
    }
    const clearBtn = domState.searchBar?.querySelector(".gl-search-bar__clear");
    if (clearBtn) {
        clearBtn.style.display =
            (domState.searchInput?.value.trim().length ?? 0) > 0 ? "flex" : "none";
    }
}
/** Closes the search bar and resets text filter state if empty. */
function closeSearchBar() {
    if (!domState.searchBar)
        return;
    domState.searchBar.classList.remove("gl-is-visible");
    const glMain = domState.options?.glMain;
    if (glMain) {
        glMain.style.removeProperty("--gl-search-bar-height");
        glMain.style.removeProperty("--gl-search-bar-gap");
    }
    const searchBtn = domState.toolbar?.querySelector('[data-gl-toolbar-action="search"]');
    if (searchBtn instanceof HTMLElement) {
        searchBtn.setAttribute("aria-expanded", "false");
        const hasValue = (domState.searchInput?.value.trim().length ?? 0) > 0;
        searchBtn.classList.toggle("gl-map-toolbar__btn--active-muted", hasValue);
        searchBtn.classList.toggle("gl-map-toolbar__btn--active", false);
    }
    domState.searchBar.addEventListener("transitionend", () => {
        if (domState.searchBar && !domState.searchBar.classList.contains("gl-is-visible")) {
            domState.searchBar.style.display = "none";
        }
    }, { once: true });
}
/** Creates the inline search bar pill DOM (top of the map). */
function createSearchBarDom() {
    const bar = document.createElement("div");
    bar.className = "gl-search-bar";
    bar.style.display = "none";
    bar.setAttribute("role", "search");
    bar.setAttribute("aria-label", getLabel("aria.search.bar"));
    const input = document.createElement("input");
    input.type = "text";
    input.className = "gl-search-bar__input";
    input.placeholder = getLabel("placeholder.search.input");
    input.setAttribute("aria-label", getLabel("aria.search.input"));
    domState.searchInput = input;
    const submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "gl-search-bar__submit";
    submitBtn.setAttribute("aria-label", getLabel("aria.search.submit"));
    submitBtn.appendChild(createSvgIcon("M9 10l-4 4 4 4M5 14h8a4 4 0 000-8H9", 20));
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "gl-search-bar__clear";
    clearBtn.setAttribute("aria-label", getLabel("aria.search.clear"));
    clearBtn.style.display = "none";
    clearBtn.appendChild(createSvgIcon("M18 6L6 18M6 6l12 12", 18));
    clearBtn.addEventListener("click", () => clearSearchText());
    bar.appendChild(input);
    bar.appendChild(clearBtn);
    bar.appendChild(submitBtn);
    input.addEventListener("input", () => {
        clearBtn.style.display = input.value.length > 0 ? "flex" : "none";
    });
    submitBtn.addEventListener("click", () => submitSearch());
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            submitSearch();
        }
        else if (e.key === "Escape") {
            if (input.value.trim().length > 0) {
                clearSearchText();
            }
            else {
                closeSearchBar();
            }
        }
    });
    domState.searchBar = bar;
    return bar;
}

/**







 * GeoLeaf UI – Mobile toolbar: proximity configuration bar.







 * @module ui/mobile-toolbar-proximity







 */
function _applyRadiusConfig(searchConfig, out) {
    const props = [
        ["min", "radiusMin"],
        ["max", "radiusMax"],
        ["step", "radiusStep"],
        ["def", "radiusDefault"],
    ];
    for (const [k, prop] of props) {
        if (typeof searchConfig[prop] === "number" && searchConfig[prop] > 0)
            out[k] = searchConfig[prop];
    }
    out.def = Math.max(out.min, Math.min(out.def, out.max));
}
function _readProximityRadius() {
    const out = { min: 1, max: 50, step: 1, def: 10 };
    try {
        const activeProfile = Config$3?.getActiveProfile?.();
        if (activeProfile) {
            const searchConfig = (activeProfile.panels &&
                (activeProfile.panels.searchConfig || activeProfile.panels.search)) ||
                activeProfile.searchConfig ||
                activeProfile.search;
            if (searchConfig)
                _applyRadiusConfig(searchConfig, out);
        }
    }
    catch (_e) {
        /* fallback to defaults */
    }
    return out;
}
function _runFilterApplier(filterEl) {
    const applier = _g$d.GeoLeaf?._UIFilterPanelApplier;
    if (applier && typeof applier.applyFiltersNow === "function") {
        applier.applyFiltersNow(filterEl);
    }
}
function _createProximitySlider(min, max, step, def) {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.className = "gl-proximity-bar__slider";
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.defaultValue = String(def);
    slider.setAttribute("aria-label", getLabel("aria.proximity.slider"));
    domState.proximitySlider = slider;
    return slider;
}
/** Creates the proximity configuration pill (slider + validate/cancel). */
function createProximityBarDom() {
    const bar = document.createElement("div");
    bar.className = "gl-proximity-bar";
    bar.style.display = "none";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", getLabel("aria.proximity.region"));
    const instruction = document.createElement("span");
    instruction.className = "gl-proximity-bar__instruction";
    instruction.textContent = getLabel("ui.proximity.instruction_initial");
    domState.proximityInstruction = instruction;
    bar.appendChild(instruction);
    const { min: _minRadius, max: _maxRadius, step: _stepRadius, def: _defaultRadius, } = _readProximityRadius();
    const slider = _createProximitySlider(_minRadius, _maxRadius, _stepRadius, _defaultRadius);
    bar.appendChild(slider);
    const radiusLabel = document.createElement("span");
    radiusLabel.className = "gl-proximity-bar__radius-label";
    radiusLabel.textContent = `${_defaultRadius} km`;
    domState.proximityRadiusLabel = radiusLabel;
    bar.appendChild(radiusLabel);
    const validateBtn = document.createElement("button");
    validateBtn.type = "button";
    validateBtn.className = "gl-proximity-bar__validate";
    validateBtn.setAttribute("aria-label", getLabel("aria.proximity.validate"));
    validateBtn.disabled = true;
    validateBtn.appendChild(createSvgIcon("M9 10l-4 4 4 4M5 14h8a4 4 0 000-8H9", 20));
    validateBtn.addEventListener("click", () => closeProximityBar(false));
    domState.proximityValidateBtn = validateBtn;
    bar.appendChild(validateBtn);
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "gl-proximity-bar__cancel";
    cancelBtn.setAttribute("aria-label", getLabel("aria.proximity.cancel"));
    cancelBtn.appendChild(createSvgIcon("M18 6L6 18M6 6l12 12", 18));
    cancelBtn.addEventListener("click", () => closeProximityBar(true));
    bar.appendChild(cancelBtn);
    slider.addEventListener("input", () => {
        const km = Number.parseInt(slider.value, 10);
        if (domState.proximityRadiusLabel)
            domState.proximityRadiusLabel.textContent = `${km} km`;
        const prox = _g$d.GeoLeaf?._UIFilterPanelProximity;
        if (prox?.setProximityRadius)
            prox.setProximityRadius(km);
    });
    domState.proximityBar = bar;
    return bar;
}
/** Shows the proximity pill with fade+scale animation. */
function openProximityBar() {
    if (!domState.proximityBar)
        return;
    if (domState.proximityValidateBtn)
        domState.proximityValidateBtn.disabled = true;
    if (domState.proximityInstruction) {
        domState.proximityInstruction.textContent = getLabel("ui.proximity.instruction_initial");
        domState.proximityInstruction.classList.remove("point-placed");
    }
    if (domState.proximitySlider)
        domState.proximitySlider.value = domState.proximitySlider.defaultValue;
    if (domState.proximityRadiusLabel)
        domState.proximityRadiusLabel.textContent = `${domState.proximitySlider?.defaultValue ?? 10} km`;
    domState.proximityBar.style.display = "flex";
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (domState.proximityBar)
                domState.proximityBar.classList.add("gl-is-visible");
            const glMain = domState.options?.glMain;
            if (glMain) {
                glMain.style.setProperty("--gl-proximity-bar-height", "46px");
                glMain.style.setProperty("--gl-proximity-bar-gap", "0.4rem");
            }
        });
    });
}
/**







 * Closes the proximity pill.







 * @param cancel true = cancel (deactivates mode), false = validate (keeps mode active).







 */
function closeProximityBar(cancel) {
    if (!domState.proximityBar)
        return;
    domState.proximityBar.classList.remove("gl-is-visible");
    const glMain = domState.options?.glMain;
    if (glMain) {
        glMain.style.removeProperty("--gl-proximity-bar-height");
        glMain.style.removeProperty("--gl-proximity-bar-gap");
    }
    domState.proximityBar.addEventListener("transitionend", () => {
        if (domState.proximityBar &&
            !domState.proximityBar.classList.contains("gl-is-visible")) {
            domState.proximityBar.style.display = "";
        }
    }, { once: true });
    if (cancel) {
        const prox = _g$d.GeoLeaf?._UIFilterPanelProximity;
        const map = domState.options?.map;
        if (prox?.toggleProximityToolbar && map && domState.proximityActive) {
            prox.toggleProximityToolbar(map, 10);
        }
        domState.proximityActive = false;
        const proximityBtn = domState.toolbar?.querySelector('[data-gl-sheet="proximity"]');
        if (proximityBtn instanceof HTMLElement)
            proximityBtn.classList.remove("gl-map-toolbar__btn--active");
        _runFilterApplier(document.querySelector("#gl-filter-panel"));
        refreshFilterButtonState();
    }
    else {
        _runFilterApplier(document.querySelector("#gl-filter-panel"));
        refreshFilterButtonState();
    }
}

/**
 * GeoLeaf UI – Mobile toolbar: sheet modal (full-height overlay panel).
 * @module ui/mobile-toolbar-sheet
 */
// C1: guard — only one document-level Escape listner at a time
let _escapeListenerAdded = false;
function _attachFocusTrap(overlay) {
    overlay.addEventListener("keydown", (e) => {
        if (!overlay.classList.contains("open") || e.key !== "Tab")
            return;
        const focusable = Array.from(overlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => el.offsetParent !== null);
        if (!focusable.length)
            return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        }
        else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}
/** Creates the sheet overlay DOM and attaches keyboard / clickk handlers. */
function createSheetDom() {
    const overlay = document.createElement("div");
    overlay.className = "gl-sheet-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "gl-sheet-panel-title");
    overlay.setAttribute("aria-describedby", "gl-sheet-panel-body");
    const panel = document.createElement("div");
    panel.className = "gl-sheet-panel";
    const header = document.createElement("div");
    header.className = "gl-sheet-panel__header";
    const title = document.createElement("h2");
    title.className = "gl-sheet-panel__title";
    title.id = "gl-sheet-panel-title";
    domState.panelTitle = title;
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "gl-sheet-panel__close";
    closeBtn.setAttribute("aria-label", getLabel("aria.sheet.close"));
    closeBtn.appendChild(createSvgIcon("M18 6L6 18M6 6l12 12", 24));
    const body = document.createElement("div");
    body.className = "gl-sheet-panel__body";
    body.id = "gl-sheet-panel-body";
    domState.panelBody = body;
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    panel.appendChild(body);
    overlay.appendChild(panel);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay)
            closeSheet();
    });
    closeBtn.addEventListener("click", () => closeSheet());
    _attachFocusTrap(overlay);
    // C1: add document Escape listner only once
    if (!_escapeListenerAdded) {
        _escapeListenerAdded = true;
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && domState.overlay?.classList.contains("open"))
                closeSheet();
        });
    }
    return overlay;
}
/** Moves a node into the sheet body and registers it for restoration on close. */
function moveNodeToSheetBody(node) {
    if (!node || !domState.panelBody)
        return;
    const parent = node.parentElement;
    if (!parent)
        return;
    const nextSibling = node.nextSibling;
    domState.restoreOnClose.push({ parent, node, nextSibling });
    domState.panelBody.appendChild(node);
}
/** Injects existing DOM panels (filters, layers, table, legend) into the sheet body. */
function injectSheetContent(sheetId) {
    if (!domState.panelBody)
        return;
    domState.restoreOnClose = [];
    if (sheetId === "filters") {
        const panel = document.getElementById("gl-filter-panel");
        if (panel) {
            panel.classList.add("gl-is-open", "gl-sheet-content");
            moveNodeToSheetBody(panel);
        }
    }
    else if (sheetId === "layers") {
        const lm = document.querySelector(".gl-layer-manager");
        if (lm) {
            lm.classList.remove("gl-layer-manager--collapsed");
            moveNodeToSheetBody(lm);
        }
    }
    else if (sheetId === "table") {
        const tablePanel = document.querySelector(".gl-table-panel");
        if (tablePanel) {
            tablePanel.classList.add("gl-is-visible", "gl-sheet-content");
            moveNodeToSheetBody(tablePanel);
        }
    }
    else if (sheetId === "legend") {
        const legendEl = document.querySelector(".gl-map-legend");
        if (legendEl)
            moveNodeToSheetBody(legendEl);
    }
}
/** Restores nodes moved into the sheet back to their original positions. */
function restoreMovedNodes() {
    for (let i = domState.restoreOnClose.length - 1; i >= 0; i--) {
        const { parent, node, nextSibling } = domState.restoreOnClose[i];
        node.classList.remove("gl-sheet-content");
        if (nextSibling && nextSibling.parentNode === parent) {
            parent.insertBefore(node, nextSibling);
        }
        else {
            parent.appendChild(node);
        }
    }
    domState.restoreOnClose = [];
    document.getElementById("gl-filter-panel")?.classList.remove("gl-is-open");
    // Keep is-visible if the table panel is open via desktop panel (data-gl-open=true)
    const tpRestore = document.querySelector(".gl-table-panel");
    if (tpRestore && tpRestore.getAttribute("data-gl-open") !== "true") {
        tpRestore.classList.remove("gl-is-visible");
    }
}
/** Opens the sheet overlay for the given sheetId. */
function openSheet(sheetId) {
    const titles = { ...getDefaultSheetTitles(), ...(domState.options?.sheetTitles ?? {}) };
    const title = titles[sheetId] ?? sheetId;
    if (domState.panelTitle)
        domState.panelTitle.textContent = title;
    if (domState.panelBody)
        domState.panelBody.innerHTML = ""; // SAFE: empty string — clears element, no user data
    domState.activeSheetId = sheetId;
    domState.lastFocusedElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    domState.overlay?.classList.add("open");
    domState.overlay?.setAttribute("aria-labelledby", "gl-sheet-panel-title");
    const openedBtn = domState.toolbar?.querySelector(`[data-gl-sheet="${sheetId}"]`);
    if (openedBtn instanceof HTMLElement)
        openedBtn.setAttribute("aria-expanded", "true");
    if (["filters", "layers", "table", "legend"].includes(sheetId)) {
        injectSheetContent(sheetId);
    }
    const sheetCloseBtn = domState.overlay?.querySelector(".gl-sheet-panel__close");
    sheetCloseBtn?.focus();
    refreshFilterButtonState();
}
/** Closes the sheet overlay and restores any moved nodes. */
function closeSheet() {
    restoreMovedNodes();
    domState.overlay?.classList.remove("open");
    domState.activeSheetId = null;
    domState.toolbar
        ?.querySelectorAll("[aria-expanded]")
        .forEach((el) => el.setAttribute("aria-expanded", "false"));
    if (domState.lastFocusedElement) {
        domState.lastFocusedElement.focus();
        domState.lastFocusedElement = null;
    }
    refreshFilterButtonState();
}

/**
 * GeoLeaf UI – Mobile toolbar: orchestrator and public API.
 * Wires together pill, search bar, proximity bar and sheet modal sub-modules.
 *
 * @module ui/mobile-toolbar
 */
// ── Toolbar clickk dispatcher ──────────────────────────────────────────────────
function _handleResetFilters(e) {
    e.preventDefault();
    domState.options?.onResetFilters?.();
    refreshFilterButtonState();
}
function _handleZoom(action) {
    const map = domState.options?.map;
    if (!map)
        return;
    const zoom = typeof map.getZoom === "function" ? map.getZoom() : 0;
    const delta = action === "zoom-in" ? 1 : -1;
    if (typeof map.setView === "function" && typeof map.getCenter === "function") {
        map.setView(map.getCenter(), zoom + delta);
    }
    else if (typeof map.zoomIn === "function") {
        action === "zoom-in" ? map.zoomIn() : map.zoomOut();
    }
}
function _isZoomAction(action) {
    if (action === "zoom-in")
        return true;
    if (action === "zoom-out")
        return true;
    return false;
}
function _handleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    else {
        domState.options.glMain.requestFullscreen().catch(() => {
            /* fullscreen not supported or denied */
        });
    }
}
function _handleSearch(target) {
    const isOpen = domState.searchBar?.classList.contains("gl-is-visible");
    if (isOpen) {
        closeSearchBar();
        target.classList.remove("gl-map-toolbar__btn--active");
    }
    else {
        openSearchBar();
    }
}
function _handleThemes(target) {
    const secondaryCtr = document.getElementById("gl-theme-secondary-container");
    if (!secondaryCtr)
        return;
    const isVisible = secondaryCtr.classList.contains("gl-mobile-secondary-visible");
    if (isVisible) {
        secondaryCtr.classList.remove("gl-mobile-secondary-visible");
        target.classList.remove("gl-map-toolbar__btn--active");
        target.setAttribute("aria-expanded", "false");
    }
    else {
        secondaryCtr.classList.add("gl-mobile-secondary-visible");
        target.classList.add("gl-map-toolbar__btn--active");
        target.setAttribute("aria-expanded", "true");
    }
}
function _buildProximityCallback() {
    return () => {
        if (domState.proximityValidateBtn)
            domState.proximityValidateBtn.disabled = false;
        if (domState.proximityInstruction) {
            domState.proximityInstruction.textContent = getLabel("ui.proximity.point_placed");
            domState.proximityInstruction.classList.add("point-placed");
        }
    };
}
function _handleProximity(target) {
    const proximity = _g$d.GeoLeaf?._UIFilterPanelProximity;
    const map = domState.options?.map;
    if (!proximity?.toggleProximityToolbar || !map)
        return;
    if (domState.proximityActive) {
        proximity.toggleProximityToolbar(map, 10);
        domState.proximityActive = false;
        target.classList.remove("gl-map-toolbar__btn--active");
        closeProximityBar(false);
        return;
    }
    domState.proximityActive = proximity.toggleProximityToolbar(map, Number.parseInt(domState.proximitySlider?.defaultValue || "10", 10), { onPointPlaced: _buildProximityCallback() });
    target.classList.toggle("gl-map-toolbar__btn--active", domState.proximityActive);
    if (domState.proximityActive)
        openProximityBar();
}
function _handleGeoloc() {
    const geolocLink = document.querySelector(".geoleaf-ctrl-geolocation a");
    if (geolocLink)
        geolocLink.click();
    const btn = domState.toolbar?.querySelector('[data-gl-sheet="geoloc"]');
    if (btn instanceof HTMLElement)
        btn.setAttribute("aria-expanded", "false");
}
function _handlePoiAdd(target) {
    if (target.getAttribute("aria-disabled") === "true")
        return;
    target.setAttribute("aria-disabled", "true");
    const map = domState.options?.map;
    const defaultPosition = domState.options?.poiAddDefaultPosition ?? "placement-mode";
    const userPosition = GeoLocationState.userPosition;
    const openForm = (latlng) => {
        target.removeAttribute("aria-disabled");
        if (!POIAddFormContract.isAddFormAvailable()) {
            Log?.error("[UI.Toolbar] AddForm.openAddForm not available");
            return;
        }
        POIAddFormContract.openAddForm(latlng, null);
    };
    if (userPosition && defaultPosition === "geolocation") {
        Log?.debug("[UI.Toolbar] Using GPS position for POI add");
        openForm(userPosition);
    }
    else {
        Log?.debug("[UI.Toolbar] Activating placement mode for POI add");
        POIAddFormContract.activatePlacementMode(map, (result) => {
            if (result?.latlng) {
                openForm(result.latlng);
            }
            else {
                target.removeAttribute("aria-disabled");
                Log?.warn("[UI.Toolbar] Mode placement cancelled");
            }
        });
    }
}
function _dispatchSheetAction(sheetId, target) {
    if (sheetId === "proximity") {
        _handleProximity(target);
        return;
    }
    if (sheetId === "geoloc") {
        _handleGeoloc();
        return;
    }
    if (sheetId)
        openSheet(sheetId);
}
function onToolbarClick(e) {
    const target = e.target.closest("button");
    if (!target)
        return;
    const action = target.getAttribute("data-gl-toolbar-action");
    const sheetId = target.getAttribute("data-gl-sheet");
    if (action === "reset-filters") {
        _handleResetFilters(e);
        return;
    }
    if (_isZoomAction(action)) {
        _handleZoom(action);
        return;
    }
    if (action === "fullscreen") {
        _handleFullscreen();
        return;
    }
    if (action === "search") {
        _handleSearch(target);
        return;
    }
    if (action === "themes") {
        _handleThemes(target);
        return;
    }
    if (action === "poi-add") {
        _handlePoiAdd(target);
        return;
    }
    // Generic dispatch for plugin-registered actions (e.g. "print").
    // Plugins listen for 'geoleaf:toolbar:action' to handle their own button.
    if (action) {
        document.dispatchEvent(new CustomEvent("geoleaf:toolbar:action", {
            detail: { action, element: target },
            bubbles: false,
        }));
        return;
    }
    _dispatchSheetAction(sheetId, target);
}
function onTableClosed() {
    if (domState.activeSheetId === "table")
        closeSheet();
}
// ── Public API ────────────────────────────────────────────────────────────────
function _setupDocumentListeners() {
    if (typeof document === "undefined")
        return;
    document.addEventListener("geoleaf:table:closed", onTableClosed);
    document.addEventListener("fullscreenchange", () => {
        const isFullscreen = !!document.fullscreenElement;
        const fsBtn = domState.toolbar?.querySelector('[data-gl-toolbar-action="fullscreen"]');
        if (fsBtn) {
            fsBtn.classList.toggle("gl-map-toolbar__btn--active", isFullscreen);
            fsBtn.innerHTML = ""; // SAFE: empty string — clears before SVG append via DOM API
            const exitPath = "M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3";
            const enterPath = "M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6";
            fsBtn.appendChild(createSvgIcon(isFullscreen ? exitPath : enterPath));
        }
        domState.toolbar?.classList.toggle("gl-map-toolbar--fullscreen", isFullscreen);
        updateNavVisibility();
    });
}
function _setupGeolocListener() {
    const geolocMapContainer = domState.options?.map?.getContainer?.();
    if (geolocMapContainer) {
        geolocMapContainer.addEventListener("gl:geoloc:statechange", (e) => {
            const detail = e.detail;
            const btn = domState.toolbar?.querySelector('[data-gl-sheet="geoloc"]');
            if (btn instanceof HTMLElement) {
                btn.classList.toggle("gl-map-toolbar__btn--active", !!detail?.active);
            }
        });
    }
}
/**
 * Initializes the mobile utility pill toolbar and sheet modal.
 * Must be called after the map and .gl-main DOM are ready.
 */
function initMobileToolbar(options) {
    domState.options = options;
    const { glMain } = options;
    const toolbarWrapper = createToolbarDom();
    domState.toolbar.addEventListener("click", onToolbarClick);
    glMain.appendChild(toolbarWrapper);
    const searchBarEl = createSearchBarDom();
    glMain.appendChild(searchBarEl);
    const tooltipEl = createTooltipDom();
    tooltipEl.style.display = "none";
    glMain.appendChild(tooltipEl);
    attachTooltipHandlers(toolbarWrapper, glMain);
    const proximityBar = createProximityBarDom();
    glMain.appendChild(proximityBar);
    if (glMain.style.position === "" || glMain.style.position === "static") {
        glMain.style.position = "relative";
    }
    domState.overlay = createSheetDom();
    glMain.appendChild(domState.overlay);
    requestAnimationFrame(() => {
        updateNavVisibility();
    });
    _setupDocumentListeners();
    _setupGeolocListener();
    refreshFilterButtonState();
    domState.filterCheckInterval = window.setInterval(() => refreshFilterButtonState(), 2000);
}

/**
 * desktop-panel-theme.ts
 *
 * Theme toggle button helpers for the desktop side panel.
 * Extracted from desktop-panel.ts to keep it within the 700-line limit.
 */
// SVG paths for sun/moon icons (same as control-theme-toggle.ts)
const _SVG_SUN = "M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16.7.7M3 12h1m16 0h1M4.92 19.07l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z";
const _SVG_MOON = "M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z";
function buildThemeToggleBtn(variant) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gl-rp-theme-toggle";
    btn.dataset.variant = variant;
    const opts = { stroke: "currentColor", strokeWidth: "2", fill: "none" };
    const svgSun = DOMSecurity.createSVGIcon(18, 18, _SVG_SUN, opts);
    svgSun.classList.add("gl-rp-theme-icon--sun");
    const svgMoon = DOMSecurity.createSVGIcon(18, 18, _SVG_MOON, opts);
    svgMoon.classList.add("gl-rp-theme-icon--moon");
    btn.appendChild(svgSun);
    btn.appendChild(svgMoon);
    const _syncBtn = () => {
        const isDark = _UITheme.getCurrentTheme() === _UITheme.THEME_DARK;
        svgSun.style.display = isDark ? "block" : "none";
        svgMoon.style.display = isDark ? "none" : "block";
        const label = isDark
            ? getLabel("aria.theme.toggle_to_light")
            : getLabel("aria.theme.toggle_to_dark");
        btn.setAttribute("aria-label", label);
        btn.title = label;
    };
    _syncBtn();
    btn.addEventListener("click", () => {
        _UITheme.toggleTheme();
    });
    if (typeof globalThis !== "undefined" && globalThis.addEventListener) {
        globalThis.addEventListener("geoleaf:ui-theme-changed", _syncBtn);
    }
    return btn;
}
function appendThemeToggleToTabs(tabs) {
    if (tabs.querySelector(".gl-rp-theme-toggle"))
        return;
    const separator = document.createElement("div");
    separator.className = "gl-rp-theme-separator";
    const btn = buildThemeToggleBtn("desktop");
    tabs.appendChild(separator);
    tabs.appendChild(btn);
}

/**

 * desktop-panel.ts

 *

 * Panneau lateral droit avec tabs verticaux collapsibles (>= 1440px).

 * Tabs : Filtres / Couches / Legende / Array

 * Les elements sont deplaces dans the panel apres import des modules secondarys.

 * Appeler activateDesktopPanel() from init.ts apres Legend + LayerManager + Table.

 */
const BREAKPOINT = "(min-width: 1440px)";
const PANEL_ID = "gl-right-panel";
let _panel = null;
let _restoreEntries = [];
let _mql = null;
let _isActive = false;
let _legendObserver = null;
let _getFilterActiveState = null;
let _mobileThemeToggle = null;
let _themeObserver = null;
function _injectMobileThemeToggle() {
    const scroll = document.querySelector(".gl-map-toolbar__scroll") ??
        document.querySelector(".gl-map-toolbar");
    if (!scroll)
        return;
    if (scroll.querySelector("[data-variant='mobile-theme']"))
        return;
    const btn = buildThemeToggleBtn("mobile");
    btn.classList.add("gl-map-toolbar__btn");
    scroll.appendChild(btn);
    _mobileThemeToggle = btn;
}
function _tryInjectMobile() {
    if (_mobileThemeToggle)
        return;
    _injectMobileThemeToggle();
    if (_mobileThemeToggle) {
        _themeObserver?.disconnect();
        _themeObserver = null;
    }
}
// DOM Builders
function buildTabsDom(panel, titles, show) {
    const tabs = document.createElement("div");
    tabs.className = "gl-rp-tabs";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", getLabel("aria.panel.nav"));
    const allDefs = [
        { id: "filters", label: titles.filters, visible: show.filters },
        { id: "layers", label: titles.layers, visible: show.layers },
        { id: "legend", label: titles.legend, visible: show.legend },
        { id: "table", label: titles.table, visible: show.table },
    ];
    const defs = allDefs.filter((d) => d.visible);
    for (let i = 0; i < defs.length; i++) {
        const def = defs[i];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gl-rp-tab";
        btn.id = "gl-rp-tab-" + def.id; // B2: tab id for aria-labelledby
        btn.dataset.glRpTab = def.id;
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-controls", "gl-rp-pane-" + def.id);
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute("tabindex", i === 0 ? "0" : "-1"); // B4: roving tabindex
        btn.textContent = def.label;
        btn.addEventListener("click", () => handleTabClick(panel, def.id));
        tabs.appendChild(btn);
    }
    // B3: arrow key navigation (roving focus, no auto-select)
    tabs.addEventListener("keydown", (e) => {
        const btns = Array.from(tabs.querySelectorAll("[role='tab']"));
        const idx = btns.indexOf(document.activeElement);
        if (idx === -1)
            return;
        let next = idx;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            next = (idx + 1) % btns.length;
        }
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            next = (idx - 1 + btns.length) % btns.length;
        }
        else if (e.key === "Home") {
            e.preventDefault();
            next = 0;
        }
        else if (e.key === "End") {
            e.preventDefault();
            next = btns.length - 1;
        }
        else {
            return;
        }
        btns[next].focus();
    });
    panel.appendChild(tabs);
    // Inject theme toggle at bottom of tab strip (above credential button if present)
    appendThemeToggleToTabs(tabs);
}
function buildContentDom(panel) {
    const content = document.createElement("div");
    content.className = "gl-rp-content";
    const ids = ["filters", "layers", "legend"];
    for (const id of ids) {
        const pane = document.createElement("div");
        pane.className = "gl-rp-pane";
        pane.id = "gl-rp-pane-" + id;
        pane.setAttribute("role", "tabpanel");
        pane.setAttribute("aria-labelledby", "gl-rp-tab-" + id); // B5
        pane.setAttribute("tabindex", "0"); // B5
        content.appendChild(pane);
    }
    // Contenu insere AVANT la bande d tabs (ordre flex row: contenu | tabs)
    panel.insertBefore(content, panel.firstChild);
}
function buildPanelDom(glMain, titles, show) {
    // If no tabs are enabled, don't create the panel.
    if (!show.filters && !show.layers && !show.legend && !show.table)
        return null;
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.setAttribute("aria-label", getLabel("aria.panel.lateral"));
    buildTabsDom(panel, titles, show);
    buildContentDom(panel);
    glMain.appendChild(panel);
    return panel;
}
// Tab Interaction
function _refreshFilterTabIndicator() {
    if (!_panel)
        return;
    const filterTab = _panel.querySelector("[data-gl-rp-tab='filters']");
    if (!filterTab)
        return;
    let active = _getFilterActiveState?.() ?? false;
    // Fallback: check inline search bar value (search moved out of filter panel)
    if (!active) {
        const searchInput = document.querySelector(".gl-search-bar__input");
        if (searchInput && searchInput.value.trim().length > 0)
            active = true;
    }
    // Fallback: check filter panel DOM (categories, tags)
    if (!active) {
        const panel = document.querySelector("#gl-filter-panel");
        if (panel) {
            active =
                panel.querySelectorAll(".gl-filter-tree__checkbox--category:checked, .gl-filter-tree__checkbox--subcategory:checked").length > 0 ||
                    panel.querySelectorAll(".gl-filter-panel__tag-badge.gl-is-selected").length > 0;
        }
    }
    filterTab.classList.toggle("has-filters", active);
}
function _closeAllTabs(panel) {
    const allTabs = Array.from(panel.querySelectorAll(".gl-rp-tab"));
    allTabs.forEach((t) => {
        t.classList.remove("gl-is-active");
        t.setAttribute("aria-selected", "false");
        t.setAttribute("tabindex", "-1"); // B4: roving — reset all
    });
    // Keep first tab as keyboard entry point when none is active
    if (allTabs.length)
        allTabs[0].setAttribute("tabindex", "0");
    panel
        .querySelectorAll(".gl-rp-pane")
        .forEach((p) => p.classList.remove("gl-is-active"));
    panel.classList.remove("gl-has-active");
}
function _closeTablePanel(tp) {
    tp.setAttribute("data-gl-open", "false");
    tp.classList.remove("gl-is-visible");
    const props = [
        "position",
        "top",
        "bottom",
        "right",
        "left",
        "width",
        "height",
        "transform",
        "display",
        "visibility",
        "opacity",
        "z-index",
    ];
    props.forEach((p) => tp.style.removeProperty(p));
    TableContract.toggle();
}
function _openTablePanel(tp, tableTab) {
    tp.setAttribute("data-gl-open", "true");
    tp.classList.add("gl-is-visible");
    tp.style.setProperty("display", "flex", "important");
    tp.style.setProperty("visibility", "visible", "important");
    tp.style.setProperty("opacity", "1", "important");
    tp.style.setProperty("z-index", "1100", "important");
    TableContract.show();
    tableTab?.classList.add("gl-is-active");
    tableTab?.setAttribute("aria-selected", "true");
}
function _resolveTablePanel(_panel) {
    let tp = document.querySelector(".gl-table-panel");
    if (!tp) {
        const _g = (typeof globalThis !== "undefined" ? globalThis : window);
        const _container = _g["GeoLeaf"]?.["Table"]?.["_container"];
        tp = _container || null;
        if (tp && !document.body.contains(tp))
            document.body.appendChild(tp);
    }
    return tp;
}
function _handleTableTab(panel) {
    const tableTab = panel.querySelector("[data-gl-rp-tab='table']");
    _closeAllTabs(panel);
    const tp = _resolveTablePanel();
    if (!tp) {
        console.warn("[GL-Desktop] .gl-table-panel not found — Table.init() not called?");
        return;
    }
    const isOpen = tp.getAttribute("data-gl-open") === "true";
    if (!isOpen) {
        _openTablePanel(tp, tableTab);
    }
    else {
        _closeTablePanel(tp);
    }
}
function _closeOpenTablePanelIfAny() {
    const _tp = document.querySelector(".gl-table-panel");
    if (_tp && _tp.getAttribute("data-gl-open") === "true") {
        _closeTablePanel(_tp);
    }
}
function handleTabClick(panel, tabId) {
    /* Array → panneat the bottom pleine width, independent du side panel */
    if (tabId === "table") {
        _handleTableTab(panel);
        return;
    }
    /* Close the table if another tab is clicked */
    _closeOpenTablePanelIfAny();
    const targetTab = panel.querySelector("[data-gl-rp-tab='" + tabId + "']");
    const targetPane = document.getElementById("gl-rp-pane-" + tabId);
    if (!targetTab || !targetPane)
        return;
    const isAlreadyActive = targetTab.classList.contains("gl-is-active");
    _closeAllTabs(panel);
    if (isAlreadyActive)
        return;
    targetTab.classList.add("gl-is-active");
    targetTab.setAttribute("aria-selected", "true");
    targetTab.setAttribute("tabindex", "0"); // B4: active tab in tab order
    targetPane.classList.add("gl-is-active");
    panel.classList.add("gl-has-active");
}
// Move / Restore
function storeAndMove(node, targetBody) {
    _restoreEntries.push({
        node,
        parent: node.parentElement,
        nextSibling: node.nextSibling,
    });
    targetBody.appendChild(node);
}
// Activate / Deactivate
function activatePanel() {
    if (_isActive)
        return;
    _isActive = true;
    const pFilters = document.getElementById("gl-rp-pane-filters");
    const pLayers = document.getElementById("gl-rp-pane-layers");
    const pLegend = document.getElementById("gl-rp-pane-legend");
    if (!pFilters || !pLayers || !pLegend)
        return;
    const filterPanel = document.getElementById("gl-filter-panel");
    if (filterPanel) {
        storeAndMove(filterPanel, pFilters);
    }
    const layerManager = document.querySelector(".gl-layer-manager");
    if (layerManager) {
        storeAndMove(layerManager, pLayers);
    }
    const legend = document.querySelector(".gl-map-legend");
    if (legend) {
        storeAndMove(legend, pLegend);
    }
    else {
        // La legende est creee de facon asynchrone (fetch des styles) :
        // on surveille le DOM et on deplace l element quand il apparait.
        _legendObserver = new MutationObserver(() => {
            const el = document.querySelector(".gl-map-legend");
            if (el && !pLegend.contains(el)) {
                storeAndMove(el, pLegend);
                _legendObserver.disconnect();
                _legendObserver = null;
            }
        });
        _legendObserver.observe(document.body, { childList: true, subtree: true });
    }
    // Inject theme toggle into mobile toolbar
    _tryInjectMobile();
    if (!_mobileThemeToggle) {
        _themeObserver = new MutationObserver(() => {
            _tryInjectMobile();
        });
        _themeObserver.observe(document.body, { childList: true, subtree: true });
    }
    document.body.classList.add("gl-right-panel-open");
}
function deactivatePanel() {
    if (!_isActive)
        return;
    _isActive = false;
    if (_legendObserver) {
        _legendObserver.disconnect();
        _legendObserver = null;
    }
    for (let i = _restoreEntries.length - 1; i >= 0; i--) {
        const { node, parent, nextSibling } = _restoreEntries[i];
        try {
            if (nextSibling && nextSibling.parentNode === parent) {
                parent.insertBefore(node, nextSibling);
            }
            else {
                parent.appendChild(node);
            }
        }
        catch {
            // noeud detache - ignorer
        }
    }
    _restoreEntries = [];
    if (_panel) {
        _panel.querySelectorAll(".gl-rp-tab").forEach((t) => {
            t.classList.remove("gl-is-active");
            t.setAttribute("aria-selected", "false");
        });
        _panel
            .querySelectorAll(".gl-rp-pane")
            .forEach((p) => p.classList.remove("gl-is-active"));
        _panel.classList.remove("gl-has-active");
        const filterTab = _panel.querySelector("[data-gl-rp-tab='filters']");
        filterTab?.classList.remove("has-filters");
    }
    document.removeEventListener("geoleaf:filters:applied", _refreshFilterTabIndicator);
    if (_themeObserver) {
        _themeObserver.disconnect();
        _themeObserver = null;
    }
    document.body.classList.remove("gl-right-panel-open");
}
// MediaQuery Listner
function onMQChange(e) {
    if (!_panel)
        return;
    if (e.matches) {
        activatePanel();
    }
    else {
        deactivatePanel();
    }
}
// Public API
/**

 * Cree le DOM du panel lateral droit (>= 1440px).

 * N active PAS les deplacement d elements - appeler activateDesktopPanel() ensuite.

 */
function initDesktopPanel(options) {
    const { glMain } = options;
    _getFilterActiveState = options.getFilterActiveState ?? null;
    if (document.getElementById(PANEL_ID))
        return;
    const titles = {
        filters: options.titleFilters || "Filtres",
        layers: options.titleLayers || "Couches",
        legend: options.titleLegend || "Legende",
        table: options.titleTable || "Tableau",
    };
    const show = {
        filters: options.showFilters !== false,
        layers: options.showLayers !== false,
        legend: options.showLegend !== false,
        table: options.showTable !== false,
    };
    _panel = buildPanelDom(glMain, titles, show);
    _mql = window.matchMedia(BREAKPOINT);
    _mql.addEventListener("change", onMQChange);
    // Synchronize l'tab Array avec the events of the module Table
    document.addEventListener("geoleaf:table:opened", () => {
        if (!_panel)
            return;
        _panel.querySelectorAll(".gl-rp-tab").forEach((t) => {
            t.classList.remove("gl-is-active");
            t.setAttribute("aria-selected", "false");
        });
        _panel
            .querySelectorAll(".gl-rp-pane")
            .forEach((p) => p.classList.remove("gl-is-active"));
        _panel.classList.remove("gl-has-active");
        const tableTab = _panel.querySelector("[data-gl-rp-tab='table']");
        tableTab?.classList.add("gl-is-active");
        tableTab?.setAttribute("aria-selected", "true");
    });
    document.addEventListener("geoleaf:table:closed", () => {
        if (!_panel)
            return;
        const tableTab = _panel.querySelector("[data-gl-rp-tab='table']");
        tableTab?.classList.remove("gl-is-active");
        tableTab?.setAttribute("aria-selected", "false");
    });
    document.addEventListener("geoleaf:filters:applied", _refreshFilterTabIndicator);
    // NE PAS appeler activatePanel() ici :
    // les elements (legend, layer-manager, table) n existent pas encore in the DOM.
    // init.ts appellera activateDesktopPanel() apres tous the modules secondarys.
}
/**

 * Deplace les elements (filtres, layers, legende, array) dans the panels.

 * A appeler APRES Legend.init(), LayerManager.init(), Table.init().

 */
function activateDesktopPanel() {
    if (!_mql)
        return;
    if (_mql.matches) {
        activatePanel();
    }
}
/**

 * Detruit the panel lateral droit et restaure les elements.

 */
function destroyDesktopPanel() {
    deactivatePanel();
    if (_mql) {
        _mql.removeEventListener("change", onMQChange);
        _mql = null;
    }
    if (_panel && _panel.parentElement) {
        _panel.parentElement.removeChild(_panel);
    }
    _panel = null;
    _isActive = false;
    _restoreEntries = [];
    _mobileThemeToggle = null;
}

/**
 * @module globals.ui
 *
 * @description
 * UMD/ESM bridge — B6 + B7 + B9 — Labels, Legend, Layer Manager, Themes, and UI.
 *
 * This runtime initialization module registers all UI-related services on
 * `globalThis.GeoLeaf`. It is imported as a side-effect by `globals.ts`.
 *
 * Registers:
 *   - **B6** — Labels (`LabelButtonManager`, `LabelRenderer`, `Labels`),
 *     Legend (`LegendControl`, `LegendGenerator`, `LegendRenderer`),
 *     Layer Manager (`BasemapSelector`, `LMControl`, `LMRenderer`,
 *     `LMShared`, `StyleSelector`)
 *   - **B7** — Themes (`ThemeCache`, `ThemeLoader`, `ThemeSelector`, `ThemeApplier*`)
 *   - **B9** — UI components (`Branding`, `CoordinatesDisplay`, `NotificationSystem`,
 *     `PanelBuilder`, `ScaleControl`), content builder sub-modules, filter panel
 *     sub-modules, mobile/desktop toolbar
 *
 * @see globals for the orchestrator and import order
 * @see globals.ui-lite for the Lite variant (Labels excluded)
 */
// B6 : labels, legend, layer-manager
const _g$c = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g$c.GeoLeaf = _g$c.GeoLeaf || {};
// -- B6 assignations ----------------------------------------------------------
_g$c.GeoLeaf._LabelButtonManager = LabelButtonManager;
_g$c.GeoLeaf._LabelRenderer = _LabelRenderer;
_g$c.GeoLeaf.Labels = Labels;
_g$c.GeoLeaf._LegendControl = LegendControl;
_g$c.GeoLeaf._LegendGenerator = LegendGenerator;
_g$c.GeoLeaf._LegendRenderer = LegendRenderer;
_g$c.GeoLeaf._LayerManagerBasemapSelector = BasemapSelector;
_g$c.GeoLeaf._LayerManagerControl = LMControl;
_g$c.GeoLeaf._LayerManagerRenderer = LMRenderer;
_g$c.GeoLeaf._LayerManagerShared = LMShared;
_g$c.GeoLeaf._LayerManagerStyleSelector = StyleSelector;
// -- B7 assignations ----------------------------------------------------------
_g$c.GeoLeaf.ThemeCache = ThemeCache;
_g$c.GeoLeaf._ThemeLoader = _ThemeLoader;
_g$c.GeoLeaf.ThemeSelector = ThemeSelector;
_g$c.GeoLeaf._ThemeApplier = Object.assign({}, _ThemeApplier, _ThemeApplier, _ThemeApplier, _ThemeApplier);
// -- B9 assignations : ui -----------------------------------------------------
if (!_g$c.GeoLeaf.UI)
    _g$c.GeoLeaf.UI = {};
_g$c.GeoLeaf.UI.Branding = Branding;
_g$c.GeoLeaf._UIComponents = _UIComponents;
_g$c.GeoLeaf._UIControls = _UIControls;
_g$c.GeoLeaf.UI.CoordinatesDisplay = CoordinatesDisplay;
_g$c.GeoLeaf._UIDomUtils = _UIDomUtils;
_g$c.GeoLeaf._UIEventDelegation = _UIEventDelegation;
_g$c.GeoLeaf.UI._buildFilterControl = _buildFilterControl;
_g$c.GeoLeaf._UIFilterStateManager = _UIFilterStateManager;
_g$c.GeoLeaf._UINotifications = _UINotifications;
_g$c.GeoLeaf.NotificationSystem = NotificationSystem;
// Alias UI.notify ? _UINotifications (utilisé par boot-info.js et les intégrateurs)
// GeoLeaf.UI est déjà initialisé plus haut, on complète sans écraser
if (!_g$c.GeoLeaf.UI)
    _g$c.GeoLeaf.UI = {};
_g$c.GeoLeaf.UI.notify = {
    info: (msg, opts) => _UINotifications?.info?.(msg, opts),
    warn: (msg, opts) => _UINotifications?.warning?.(msg, opts),
    error: (msg, opts) => _UINotifications?.error?.(msg, opts),
    success: (msg, opts) => _UINotifications?.success?.(msg, opts),
    dismiss: (id) => _UINotifications?.dismiss?.(id),
};
_g$c.GeoLeaf.UI.PanelBuilder = PanelBuilder;
_g$c.GeoLeaf.UI.ScaleControl = ScaleControl;
_g$c.GeoLeaf._UITheme = _UITheme;
// Wire theme methods directly onto UI (geoleaf.ui.js body runs at import time,
// before globals.js body assigns _g.GeoLeaf._UITheme, so its conditional block
// was skipped — we re-apply here to ensure applyTheme/setTheme exist at boot)
_g$c.GeoLeaf.UI.applyTheme = _UITheme.applyTheme;
_g$c.GeoLeaf.UI.setTheme = _UITheme.applyTheme;
_g$c.GeoLeaf.UI.toggleTheme = _UITheme.toggleTheme;
_g$c.GeoLeaf.UI.initThemeToggle = _UITheme.initThemeToggle;
_g$c.GeoLeaf.UI.initAutoTheme = _UITheme.initAutoTheme;
_g$c.GeoLeaf.UI.getCurrentTheme = _UITheme.getCurrentTheme;
// content-builder
if (!_g$c.GeoLeaf._ContentBuilder)
    _g$c.GeoLeaf._ContentBuilder = {};
_g$c.GeoLeaf._ContentBuilder.Core = ContentBuilderCore;
_g$c.GeoLeaf._ContentBuilder.Helpers = Helpers;
_g$c.GeoLeaf._ContentBuilder.Shared = ContentBuilderShared;
_g$c.GeoLeaf._ContentBuilder.Templates = Templates;
_g$c.GeoLeaf._ContentBuilder.Assemblers = Assemblers;
// filter-panel
_g$c.GeoLeaf._UIFilterPanelShared = FilterPanelShared;
_g$c.GeoLeaf._UIFilterPanelStateReader = FilterPanelStateReader;
_g$c.GeoLeaf._UIFilterPanelApplier = FilterPanelApplier;
_g$c.GeoLeaf._UIFilterPanelRenderer = FilterPanelRenderer;
_g$c.GeoLeaf._UIFilterPanelProximity = FilterPanelProximity$1;
_g$c.GeoLeaf._UIFilterPanelLazyLoader = FilterPanelLazyLoader;
_g$c.GeoLeaf._UIFilterPanelAccordion = { loadAccordionContentIfNeeded };
_g$c.GeoLeaf._UIFilterPanel = FilterPanel;
_g$c.GeoLeaf.FilterPanel = FilterPanelAggregator;
_g$c.GeoLeaf.UI.initMobileToolbar = initMobileToolbar;
_g$c.GeoLeaf.UI.initDesktopPanel = initDesktopPanel;
_g$c.GeoLeaf.UI.activateDesktopPanel = activateDesktopPanel;
_g$c.GeoLeaf.UI.destroyDesktopPanel = destroyDesktopPanel;

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf Storage - Offline Detector Module
 *
 * Détecte et gère les transitions online/offline.
 * Displays un badge UI et émet des événements personnalisés.
 *
 * @module GeoLeaf.OfflineDetector
 * @version 1.2.0
 */
/**
 * Module de détection online/offline
 */
function _createOfflineBadgeContainer() {
    const container = domCreate("div", "geoleaf-offline-badge-control");
    container.style.cssText = `
        background: #ff6b6b;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        cursor: default;
        display: none;
        white-space: nowrap;
        position: absolute;
        left: 54px;
        top: 0;
        margin: 0 !important;
        border: none;
    `;
    container.textContent = getLabel("ui.offline.badge");
    container.title = getLabel("aria.offline.badge_title");
    return container;
}
const OfflineDetector = {
    /**
     * État de connexion current
     * @private
     */
    _isOnline: navigator.onLine,
    /**
     * Badge UI (si activé)
     * @private
     */
    _badge: null,
    /**
     * Handle returned by map.addControl(), used for removal.
     * @private
     */
    _badgeControlHandle: null,
    /**
     * Cleanup functions for badge propagation blockers
     * @private
     */
    _badgeCleanups: [],
    /**
     * Configuration
     * @private
     */
    _config: {
        showBadge: false,
        badgePosition: "topleft",
        checkInterval: 30000,
        pingUrl: null,
    },
    /**
     * Timer de vérification périodique
     * @private
     */
    _checkTimer: null,
    /**
     * Event cleanup functions
     * @private
     */
    _eventCleanups: [],
    /**
     * Initialise le détecteur
     * @param {Object} options - Options de configuration
     * @param {boolean} options.showBadge - Displaysr le badge UI
     * @param {string} options.badgePosition - Position du badge (top-right, top-left, etc.)
     * @param {number} options.checkInterval - Interval de vérification en ms
     * @param {string} options.pingUrl - URL pour ping de connectivité
     * @returns {void}
     */
    init(options = {}) {
        // Fusionner config
        this._config = { ...this._config, ...options };
        Log.info(`[OfflineDetector] Initializing (badge: ${this._config.showBadge ? "enabled" : "disabled"})`);
        // État initial
        this._isOnline = navigator.onLine;
        Log.info(`[OfflineDetector] Initial state: ${this._isOnline ? "ONLINE" : "OFFLINE"}`);
        // Le badge sera créé de manière lazy :
        // - During the premier événement offline si showBadge=true
        // - Ou via un appel manuel si the map devient available plus tard
        // Écouter les événements navigateur
        this._attachEventListeners();
        // Vérification périodique
        this._startPeriodicCheck();
        // Vérifier immédiatement l'état réel
        this.checkConnectivity();
    },
    /**
     * Creates the offline badge UI control on the map via IMapAdapter.
     * @private
     */
    _createBadge() {
        if (this._badge)
            return; // Already created
        const map = ensureMap(undefined);
        if (!map) {
            Log.warn("[OfflineDetector] Cannot create badge: map not available");
            return;
        }
        const container = _createOfflineBadgeContainer();
        const cleanups = [];
        blockMapPropagation(container, cleanups);
        this._badgeControlHandle = map.addControl(container, "topleft");
        this._badge = container;
        this._badgeCleanups = cleanups;
        Log.debug("[OfflineDetector] Badge control created on map");
    },
    /**
     * Displays le badge
     * @private
     */
    _showBadge() {
        // Créer le badge si pas encore créé (lazy creation)
        if (!this._badge && this._config.showBadge) {
            this._createBadge();
        }
        if (this._badge) {
            this._badge.style.display = "block";
        }
    },
    /**
     * Masque le badge
     * @private
     */
    _hideBadge() {
        if (this._badge) {
            this._badge.style.display = "none";
        }
    },
    /**
     * Attache les event listners
     * @private
     */
    _attachEventListeners() {
        // événements natifs du navigateur - avec cleanup tracking
        if (events) {
            this._eventCleanups.push(events.on(window, "online", () => this._handleOnline(), false, "OfflineDetector.online"));
            this._eventCleanups.push(events.on(window, "offline", () => this._handleOffline(), false, "OfflineDetector.offline"));
        }
        else {
            // Fallback sans cleanup
            Log.warn("[OfflineDetector] EventListenerManager not available - listeners will not be cleaned up");
            window.addEventListener("online", () => this._handleOnline());
            window.addEventListener("offline", () => this._handleOffline());
        }
        Log.debug("[OfflineDetector] Event listeners attached");
    },
    /**
     * Cleanup event listners
     */
    destroy() {
        // Cleanup event listners
        if (this._eventCleanups && this._eventCleanups.length > 0) {
            this._eventCleanups.forEach((cleanup) => {
                if (typeof cleanup === "function")
                    cleanup();
                else if (typeof cleanup === "number")
                    events.off(cleanup);
            });
            this._eventCleanups = [];
            Log.info("[OfflineDetector] Event listeners cleaned up");
        }
        // Clear check timer
        if (this._checkTimer) {
            clearInterval(this._checkTimer);
            this._checkTimer = null;
        }
        // Clean up badge propagation blockers
        if (this._badgeCleanups.length > 0) {
            this._badgeCleanups.forEach((fn) => fn());
            this._badgeCleanups = [];
        }
        // Remove badge control from map
        this._badgeControlHandle?.remove();
        this._badgeControlHandle = null;
        this._badge = null;
    },
    /**
     * Gère le passage online
     * @private
     */
    _handleOnline() {
        if (this._isOnline)
            return; // Déjà online
        Log.info("[OfflineDetector] Connection restored ? ONLINE");
        this._isOnline = true;
        // Masquer le badge
        if (this._config.showBadge) {
            this._hideBadge();
        }
        // Émettre événement personnalisé
        document.dispatchEvent(new CustomEvent("geoleaf:online", {
            detail: { timestamp: Date.now() },
        }));
        // Vérifier avec ping si nécessaire
        this.checkConnectivity();
    },
    /**
     * Gère le passage hors line
     * @private
     */
    _handleOffline() {
        if (!this._isOnline)
            return; // Déjà offline
        Log.warn("[OfflineDetector] Connection lost ? OFFLINE");
        this._isOnline = false;
        // Displaysr le badge
        if (this._config.showBadge) {
            this._showBadge();
        }
        // Émettre événement personnalisé
        document.dispatchEvent(new CustomEvent("geoleaf:offline", {
            detail: { timestamp: Date.now() },
        }));
    },
    /**
     * Vérifie la connectivité réelle (avec ping si configuré)
     *
     * @returns {Promise<boolean>}
     * @example
     * const isOnline = await GeoLeaf.Storage.OfflineDetector.checkConnectivity();
     */
    async checkConnectivity() {
        // Si pas d'URL de ping, utiliser l'état navigateur
        if (!this._config.pingUrl) {
            return this._isOnline;
        }
        try {
            // Tenter un ping vers l'URL configurée
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(this._config.pingUrl, {
                method: "HEAD",
                cache: "no-cache",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const isOnline = response.ok;
            // Mettre à jour l'état si différent
            if (isOnline !== this._isOnline) {
                if (isOnline) {
                    this._handleOnline();
                }
                else {
                    this._handleOffline();
                }
            }
            return isOnline;
        }
        catch (error) {
            // Error = probablement offline
            Log.debug(`[OfflineDetector] Ping failed: ${error?.message ?? error}`);
            if (this._isOnline) {
                this._handleOffline();
            }
            return false;
        }
    },
    /**
     * Démarre la vérification périodique
     * @private
     */
    _startPeriodicCheck() {
        if (this._checkTimer) {
            clearInterval(this._checkTimer);
        }
        this._checkTimer = setInterval(() => {
            this.checkConnectivity();
        }, this._config.checkInterval);
        Log.debug(`[OfflineDetector] Periodic check started (every ${this._config.checkInterval}ms)`);
    },
    /**
     * Arrête la vérification périodique
     */
    stopPeriodicCheck() {
        if (this._checkTimer) {
            clearInterval(this._checkTimer);
            this._checkTimer = null;
            Log.debug("[OfflineDetector] Periodic check stopped");
        }
    },
    /**
     * Returns the État de connexion current
     *
     * @returns {boolean}
     * @example
     * if (GeoLeaf.Storage.OfflineDetector.isOnline()) {
     *   // Effectuer requête réseau
     * }
     */
    isOnline() {
        return this._isOnline;
    },
};

/**
 * @file sw-register.js
 * @description Service Worker registration module for GeoLeaf offline support.
 *              Handles SW lifecycle: register, update, unregister.
 *              The core/lite SW (sw-core.js) is registered unconditionally at boot.
 *              The premium SW (sw.js) replaces it when the Storage plugin is loaded
 *              and storage.enableServiceWorker = true in the profile.
 * @module Storage/SWRegister
 * @requires GeoLeaf
 *
 * Copyright (c) 2025 GeoLeaf Contributors
 * Licensed under the MIT License
 * SPDX-License-Identifier: MIT
 */
/**
 * Service Worker registration helper.
 *
 * @namespace GeoLeaf._SWRegister
 * @example
 * // Automatic registration via Storage.init({ enableServiceWorker: true })
 * // Or manual:
 * await GeoLeaf._SWRegister.register();
 */
const SWRegister = {
    /** @type {ServiceWorkerRegistration|null} */
    _registration: null,
    /** @type {string} Default SW script path — core/lite, always registered at boot */
    _swPath: "sw-core.js",
    /**
     * Register the Service Worker.
     * No-op in environments that don't support Service Workers.
     *
     * @param {Object}  [options]
     * @param {string}  [options.path="sw.js"] - Path to the SW script
     * @param {string}  [options.scope="/"]     - SW scope
     * @returns {Promise<ServiceWorkerRegistration|null>}
     * @example
     * const reg = await GeoLeaf._SWRegister.register();
     */
    async register(options = {}) {
        if (!("serviceWorker" in navigator)) {
            Log.warn("[SWRegister] Service Workers not supported in this browser.");
            return null;
        }
        const swPath = options.path || this._swPath;
        const scope = options.scope || "/";
        try {
            const registration = await navigator.serviceWorker.register(swPath, { scope });
            this._registration = registration;
            Log.info(`[SWRegister] Service Worker registered (scope: ${registration.scope})`);
            // Listen for updates
            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "activated") {
                            Log.info("[SWRegister] New Service Worker activated.");
                            document.dispatchEvent(new CustomEvent("geoleaf:sw:updated"));
                        }
                    });
                }
            });
            return registration;
        }
        catch (error) {
            Log.error(`[SWRegister] Registration failed: ${error.message}`);
            throw error;
        }
    },
    /**
     * Force an update check on the registered Service Worker.
     *
     * @returns {Promise<void>}
     */
    async update() {
        if (this._registration) {
            await this._registration.update();
            Log.info("[SWRegister] Update check triggered.");
        }
        else {
            Log.warn("[SWRegister] No active registration — call register() first.");
        }
    },
    /**
     * Unregister the Service Worker.
     *
     * @returns {Promise<boolean>} true if successfully unregistered
     */
    async unregister() {
        if (!this._registration) {
            Log.warn("[SWRegister] No active registration to unregister.");
            return false;
        }
        const result = await this._registration.unregister();
        if (result) {
            Log.info("[SWRegister] Service Worker unregistered.");
            this._registration = null;
        }
        return result;
    },
    /**
     * Get the current registration (if any).
     *
     * @returns {ServiceWorkerRegistration|null}
     */
    getRegistration() {
        return this._registration;
    },
};

/**
 * @module globals.storage
 *
 * @description
 * UMD/ESM bridge — B8 — Storage initialization (core MIT subset).
 *
 * This runtime initialization module registers the storage-related services that
 * remain in the open-source core after Phase 7. It is imported as a side-effect
 * by `globals.ts`.
 *
 * Registers (core only):
 *   - `_OfflineDetector` — detects online/offline state transitions
 *   - `_SWRegister` — Service Worker registration wrapper
 *   - `Storage` namespace stub (enriched at runtime by the premium plugin)
 *
 * The full storage plugin (`CacheManager`, `CacheStrategy`, `IDBHelper`, …)
 * is distributed separately as `GeoLeaf-Plugins/plugin-storage`.
 *
 * @see globals for the orchestrator and import order
 */
const _g$b = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g$b.GeoLeaf = _g$b.GeoLeaf || {};
_g$b.GeoLeaf._OfflineDetector = OfflineDetector;
_g$b.GeoLeaf._SWRegister = SWRegister;
// Namespace stub — enrichi par le plugin Storage au loading
if (!_g$b.GeoLeaf.Storage)
    _g$b.GeoLeaf.Storage = {};

/**
 * @module globals.poi
 *
 * @description
 * UMD/ESM bridge — B10 — POI, Add-Form, and Renderers initialization.
 *
 * This runtime initialization module registers all POI-related services on
 * `globalThis.GeoLeaf`. It is imported as a side-effect by `globals.ts`
 * (and `globals-lite.ts` — POI is included in both Full and Lite builds).
 *
 * Registers:
 *   - POI core: `POIShared`, `POICore`, `POIMarkers`, `POINormalizers`, `POIAPI`,
 *     `POIPopup`, `POISidePanel`
 *   - Add-form: `AddFormFieldsManager`, `AddFormValidator`
 *   - Renderers: `POIRenderers` (core, field renderers, media renderers,
 *     component renderers, section orchestrator, lightbox manager, links, UI behaviors)
 *   - Shared state: `LayerVisibilityState`, `POIState`
 *
 * @see globals for the orchestrator and import order
 */
// B10 : poi — direct
const _g$a = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g$a.GeoLeaf = _g$a.GeoLeaf || {};
// ── B10 assignations : poi ───────────────────────────────────────────────────
if (!_g$a.GeoLeaf.POI)
    _g$a.GeoLeaf.POI = {};
_g$a.GeoLeaf._POIShared = POIShared;
_g$a.GeoLeaf._POINormalizers = POINormalizers;
_g$a.GeoLeaf._POIMarkers = POIMarkers;
_g$a.GeoLeaf._POIPopup = POIPopup;
_g$a.GeoLeaf._POISidePanel = POISidepanel;
_g$a.GeoLeaf._POIRenderers = POIRenderers;
_g$a.GeoLeaf._POICore = POICore;
// poi/renderers/
_g$a.GeoLeaf.ComponentRenderers = ComponentRenderers;
_g$a.GeoLeaf._POIRenderersCore = RendererCore;
_g$a.GeoLeaf.LightboxManager = LightboxManager;
_g$a.GeoLeaf._lightboxManager = new LightboxManager();
_g$a.GeoLeaf._POIRendererLinks = RendererLinks;
_g$a.GeoLeaf.SectionOrchestrator = SectionOrchestrator;
_g$a.GeoLeaf._POIUIBehaviors = UIBehaviors;
// ── Registersr showPoiDetails dans POICoreContract (used par markers.js) ──
// Allows POICoreContract.showPoiDetails(poi) de delegate to the side panel.
POICoreContract.register({
    showPoiDetails: (poi, customLayout) => POISidepanel.openSidePanel(poi, customLayout),
});

/**
 * API Controller - Sprint 4.3 (Version Robuste)
 * Main orchestrator for GeoLeaf API operations.
 * @module APIController
 */
const _g$9 = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {});
_g$9.GeoLeaf = _g$9.GeoLeaf ?? {};
/**
 * Main orchestrator for GeoLeaf API operations.
 * Manages the lifecycle of the module, initialisation, and factory managers.
 */
class APIController {
    isInitialized;
    managers;
    moduleAccessFn;
    healthStatus;
    constructor() {
        this.isInitialized = false;
        this.managers = {};
        this.moduleAccessFn = null;
        // Controller health state
        this.healthStatus = {
            managers: 0,
            errors: [],
            lastUpdate: null,
        };
    }
    /**
     * Initialises the controller and all its managers.
     * @returns Initialisation success flag
     */
    init() {
        try {
            if (this.isInitialized) {
                if (Log)
                    Log.debug("[APIController] Already initialized");
                return true;
            }
            if (Log)
                Log.info("[APIController] Initializing API controller (Sprint 4.3 - Robust)");
            // Initialiser les managers dans l'ordre
            this._initializeManagers();
            // Configurer l'accès aux modules
            const success = this._setupModuleAccess();
            if (!success) {
                throw new Error("Module access setup failed");
            }
            // Valider l'état final
            this._validateInitialization();
            this.isInitialized = true;
            this.healthStatus.lastUpdate = new Date().toISOString();
            if (Log)
                Log.info("[APIController] API controller initialized successfully");
            return true;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.healthStatus.errors.push({
                message: err.message,
                timestamp: new Date().toISOString(),
                stack: err.stack,
            });
            if (Log)
                Log.error("[APIController] Initialization failed:", error);
            return false;
        }
    }
    /** Instantiates all configured managers from the GeoLeaf.API namespace. */
    _initializeManagers() {
        const managerTypes = [
            "module",
            "initialization",
            "factory",
        ];
        managerTypes.forEach((type) => {
            const ManagerClass = this._getManagerClass(type);
            if (ManagerClass) {
                try {
                    this.managers[type] = new ManagerClass();
                    this.healthStatus.managers++;
                    if (Log)
                        Log.debug(`[APIController] ${type} manager loaded`);
                }
                catch (error) {
                    if (Log)
                        Log.warn(`[APIController] Failed to load ${type} manager:`, error);
                    this.healthStatus.errors.push({
                        manager: type,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
        });
        if (Log)
            Log.info(`[APIController] Loaded ${this.healthStatus.managers} managers`);
    }
    /**
     * Resolves a manager constructor by type key.
     * @private
     */
    _getManagerClass(type) {
        const classNames = {
            module: "APIModuleManager",
            initialization: "APIInitializationManager",
            factory: "APIFactoryManager",
        };
        const className = classNames[type];
        const api = _g$9.GeoLeaf?.API;
        return api && api[className] ? api[className] : null;
    }
    /** Configures the module access function using the module manager. */
    _setupModuleAccess() {
        // The module manager doit être initialisé en premier
        if (!this.managers.module) {
            if (Log)
                Log.error("[APIController] Module manager not available");
            return false;
        }
        // Initialiser the module manager avec the modules existants
        const initSuccess = this.managers.module.init ? this.managers.module.init() : true;
        if (!initSuccess) {
            if (Log)
                Log.error("[APIController] Module manager initialization failed");
            return false;
        }
        // Créer la fonction d'accès aux modules avec validation
        this.moduleAccessFn = (name) => {
            try {
                if (!name || typeof name !== "string") {
                    if (Log)
                        Log.warn("[APIController] Invalid module name:", name);
                    return null;
                }
                if (this.managers.module && typeof this.managers.module.getModule === "function") {
                    return this.managers.module.getModule(name);
                }
                // Fallback to global access
                if (_g$9.GeoLeaf && _g$9.GeoLeaf[name]) {
                    return _g$9.GeoLeaf[name];
                }
                return null;
            }
            catch (error) {
                if (Log)
                    Log.warn(`[APIController] Error accessing module ${name}:`, error);
                return null;
            }
        };
        if (Log)
            Log.info("[APIController] Module access configured");
        return true;
    }
    /** Validates the controller is fully initialised before it is marked ready. */
    _validateInitialization() {
        const checks = [
            { name: "moduleAccessFn", value: this.moduleAccessFn, type: "function" },
            { name: "managers", value: this.managers, type: "object" },
            { name: "moduleManager", value: this.managers.module, type: "object" },
        ];
        const failures = checks.filter((check) => {
            return !check.value || typeof check.value !== check.type;
        });
        if (failures.length > 0) {
            const failureNames = failures.map((f) => f.name).join(", ");
            throw new Error(`Validation failed for: ${failureNames}`);
        }
        if (Log)
            Log.debug("[APIController] Validation passed");
    }
    /**
     * Delegates `GeoLeaf.init()` to the initialisation manager.
     * @param options - Raw init options
     */
    geoleafInit(options) {
        if (!this._ensureInitialized())
            return null;
        try {
            if (!this.managers.initialization) {
                throw new Error("Initialization manager not available");
            }
            return this.managers.initialization.init(options, this.moduleAccessFn);
        }
        catch (error) {
            if (Log)
                Log.error("[APIController] geoleafInit failed:", error);
            return null;
        }
    }
    /**
     * Delegates `GeoLeaf.loadConfig()` to the initialisation manager.
     * @param input - URL string or config object
     */
    geoleafLoadConfig(input) {
        if (!this._ensureInitialized())
            return Promise.resolve(null);
        try {
            if (!this.managers.initialization) {
                throw new Error("Initialization manager not available");
            }
            return this.managers.initialization.loadConfig(input, this.moduleAccessFn);
        }
        catch (error) {
            if (Log)
                Log.error("[APIController] geoleafLoadConfig failed:", error);
            return Promise.resolve(null);
        }
    }
    /**
     * Delegates `GeoLeaf.setTheme()` to the initialisation manager.
     * @param theme - Theme identifier
     */
    geoleafSetTheme(theme) {
        if (!this._ensureInitialized())
            return false;
        try {
            if (!this.managers.initialization) {
                throw new Error("Initialization manager not available");
            }
            return Boolean(this.managers.initialization.setTheme(theme, this.moduleAccessFn));
        }
        catch (error) {
            if (Log)
                Log.error("[APIController] geoleafSetTheme failed:", error);
            return false;
        }
    }
    /**
     * Delegates `GeoLeaf.createMap()` to the factory manager.
     * @param targetId - DOM element id for the new map
     * @param options - Map creation options
     */
    geoleafCreateMap(targetId, options) {
        if (!this._ensureInitialized())
            return null;
        try {
            if (!this.managers.factory) {
                throw new Error("Factory manager not available");
            }
            return this.managers.factory.createMap(targetId, options ?? {}, this.moduleAccessFn);
        }
        catch (error) {
            if (Log)
                Log.error("[APIController] geoleafCreateMap failed:", error);
            return null;
        }
    }
    /** Returns `false` and logs an error if the controller has not been initialised. */
    _ensureInitialized() {
        if (!this.isInitialized) {
            if (Log)
                Log.error("[APIController] Controller not initialized");
            return false;
        }
        return true;
    }
    /** Returns the current health status of the controller. */
    getHealthStatus() {
        return {
            ...this.healthStatus,
            isInitialized: this.isInitialized,
            managersCount: Object.keys(this.managers).length,
            hasModuleAccess: !!this.moduleAccessFn,
        };
    }
    /** Resets the controller to its initial uninitialised state. */
    reset() {
        this.isInitialized = false;
        this.managers = {};
        this.moduleAccessFn = null;
        this.healthStatus = {
            managers: 0,
            errors: [],
            lastUpdate: null,
        };
        if (Log)
            Log.info("[APIController] Controller reset");
    }
}
// perf 5.9 : Lazy instantiation — created on first access via getter
// (avoids costly synchronous _initializeManagers on import)
let _apiControllerInstance = null;
function _getAPIController$1() {
    if (!_apiControllerInstance) {
        _apiControllerInstance = new APIController();
        // Deferred init: managers are resolved once GeoLeaf.API is populated
        _apiControllerInstance.init();
    }
    return _apiControllerInstance;
}
const _gl = _g$9.GeoLeaf;
if (!Object.getOwnPropertyDescriptor(_gl, "_APIController") ||
    !Object.getOwnPropertyDescriptor(_gl, "_APIController").get) {
    Object.defineProperty(_gl, "_APIController", {
        get: _getAPIController$1,
        configurable: true,
        enumerable: true,
    });
}

/**
 * API Factory Manager - Sprint 4.3 (Version Robuste)
 * Manager for the création d'instances multi-cartes
 * @module APIFactoryManager
 */
const _g$8 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g$8.GeoLeaf = _g$8.GeoLeaf || {};
/**
 * Manager for factory pour multi-cartes
 */
class APIFactoryManager {
    isReady;
    mapInstances;
    stats;
    getModule;
    constructor() {
        this.isReady = true;
        this.mapInstances = new Map();
        this.stats = {
            mapsCreated: 0,
            errors: 0,
        };
        this.getModule = null;
    }
    /**
     * Initialise le manager with the fonction d'accès aux modules
     * @param {Function} getModule - Fonction d'accès aux modules
     * @returns {boolean} Succès
     */
    init(getModule) {
        try {
            if (!getModule || typeof getModule !== "function") {
                throw new Error("getModule function is required");
            }
            this.getModule = getModule;
            if (Log)
                Log.info("[APIFactoryManager] Factory manager initialized");
            return true;
        }
        catch (error) {
            this.stats.errors++;
            if (Log)
                Log.error("[APIFactoryManager] Initialization failed:", error);
            return false;
        }
    }
    /**
     * Créer une nouvelle instance de carte
     * @param {string} targetId - ID of the élément cible
     * @param {Object} options - Options de configuration
     * @param {Function} getModule - Fonction d'accès aux modules
     * @returns {*} Instance de carte ou null
     */
    createMap(targetId, options, getModule) {
        try {
            this.stats.mapsCreated++;
            if (!targetId) {
                throw new Error("Target ID is required");
            }
            const Core = getModule("Core");
            if (!Core || typeof Core.init !== "function") {
                throw new Error("Core module not available for map creation");
            }
            // Créer the map with thes options fournies
            const mapOptions = {
                target: targetId,
                ...options,
            };
            const mapInstance = Core.init(mapOptions);
            if (mapInstance) {
                this.mapInstances.set(targetId, mapInstance);
                if (Log)
                    Log.info(`[APIFactoryManager] Map created for target: ${targetId}`);
            }
            return mapInstance;
        }
        catch (error) {
            this.stats.errors++;
            if (Log)
                Log.error(`[APIFactoryManager] Failed to create map for ${targetId}:`, error);
            return null;
        }
    }
    /**
     * Obtient an instance de carte par ID
     * @param {string} targetId - ID of the élément cible
     * @returns {*} Instance de carte ou null
     */
    getMapInstance(targetId) {
        return this.mapInstances.get(targetId) || null;
    }
    /**
     * Obtient toutes les instances de carte
     * @returns {Array} List des instances
     */
    getAllMapInstances() {
        return Array.from(this.mapInstances.values());
    }
    /**
     * Removes ae instance de carte par ID
     * @param {string} targetId - ID of the élément cible
     * @returns {boolean} Succès de la removal
     */
    removeMapInstance(targetId) {
        if (!this.mapInstances.has(targetId)) {
            if (Log)
                Log.warn(`[APIFactoryManager] No map instance found for: ${targetId}`);
            return false;
        }
        this.mapInstances.delete(targetId);
        if (Log)
            Log.info(`[APIFactoryManager] Map instance removed for: ${targetId}`);
        return true;
    }
    /**
     * Obtient les statistiques
     */
    getStats() {
        return {
            ...this.stats,
            activeInstances: this.mapInstances.size,
            isReady: this.isReady,
        };
    }
    /**
     * Réinitializes le manager
     */
    reset() {
        this.mapInstances.clear();
        this.getModule = null;
        this.stats = {
            mapsCreated: 0,
            errors: 0,
        };
        if (Log)
            Log.info("[APIFactoryManager] Manager reset");
    }
}

/**
 * API Initialization Manager - Sprint 4.3 (Version Robuste)
 * Manager for GeoLeaf initialization operations.
 * @module APIInitializationManager
 */
const _g$7 = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {});
_g$7.GeoLeaf = _g$7.GeoLeaf ?? {};
function _normalizeMapAndUiOpts(options) {
    if (options.map) {
        return {
            mapOpts: options.map ?? {},
            uiOpts: options.ui ?? {},
        };
    }
    return {
        mapOpts: {
            target: options.target ?? options.mapId,
            center: options.center,
            zoom: options.zoom,
        },
        uiOpts: { theme: options.theme },
    };
}
function _resolveCenter(mapOpts, CONSTANTS) {
    return Array.isArray(mapOpts.center)
        ? mapOpts.center
        : (CONSTANTS.DEFAULT_CENTER ?? [0, 0]);
}
function _resolveZoom(mapOpts, CONSTANTS) {
    return Number.isFinite(mapOpts.zoom)
        ? mapOpts.zoom
        : (CONSTANTS.DEFAULT_ZOOM ?? 12);
}
function _applyUITheme(UI, theme) {
    if (typeof UI.applyTheme === "function")
        return UI.applyTheme(theme);
    if (typeof UI.setTheme === "function")
        return UI.setTheme(theme);
    if (typeof UI.theme === "function")
        return UI.theme(theme);
    throw new Error("UI module does not provide applyTheme, setTheme or theme method");
}
class APIInitializationManager {
    isReady;
    pendingPromise;
    cancelled;
    stats;
    constructor() {
        this.isReady = true; // Manager ready without separate init
        this.pendingPromise = null;
        this.cancelled = false;
        this.stats = {
            initCalls: 0,
            configLoads: 0,
            errors: 0,
        };
    }
    /**
     * Initialises GeoLeaf with the provided options.
     * @param options - Initialisation options
     * @param getModule - Module access function
     * @returns Initialisation result from Core
     */
    init(options, getModule) {
        try {
            this.stats.initCalls++;
            if (Log)
                Log.info("[APIInitializationManager] Initializing GeoLeaf");
            // Parameter validation
            const validationResult = this._validateInitParams(options, getModule);
            if (!validationResult.valid) {
                throw new Error(validationResult.error);
            }
            // Obtenir the module Core
            const Core = getModule("Core");
            if (!Core || typeof Core.init !== "function") {
                throw new Error("[GeoLeaf.init] GeoLeaf.Core.init() is not available. Core module must be loaded before API.");
            }
            // Normaliser les options
            const normalizedOptions = this._normalizeInitOptions(options);
            if (Log)
                Log.info("[APIInitializationManager] Initializing with options:", normalizedOptions);
            // Appeler l'initialization du Core
            const result = Core.init(normalizedOptions);
            if (Log)
                Log.info("[APIInitializationManager] Initialization completed successfully");
            return result;
        }
        catch (error) {
            this.stats.errors++;
            if (Log)
                Log.error("[APIInitializationManager] Initialization failed:", error);
            throw error;
        }
    }
    /**
     * Loads configuration from a URL or a data object.
     * @param input - URL string or config object
     * @param getModule - Module access function
     * @returns Resolved configuration data
     */
    async loadConfig(input, getModule) {
        try {
            this.stats.configLoads++;
            Log?.info("[APIInitializationManager] Loading configuration");
            if (!input) {
                throw new Error("Configuration input is required");
            }
            if (!getModule || typeof getModule !== "function") {
                throw new Error("getModule function is required");
            }
            const Config = getModule("Config");
            if (!Config || typeof Config.init !== "function") {
                throw new Error("[GeoLeaf.loadConfig] GeoLeaf.Config.init() is not available. Config module must be loaded.");
            }
            const options = this._normalizeConfigOptions(input);
            if (this.pendingPromise) {
                this.cancelled = true;
                Log?.info("[APIInitializationManager] Cancelling previous config load request");
            }
            this.cancelled = false;
            this.pendingPromise = Config.init(options);
            const result = await this.pendingPromise;
            this.pendingPromise = null;
            if (this.cancelled) {
                Log?.info("[APIInitializationManager] Config load was cancelled");
                return null;
            }
            Log?.info("[APIInitializationManager] Configuration loaded successfully");
            return result;
        }
        catch (error) {
            this.stats.errors++;
            this.pendingPromise = null;
            Log?.error("[APIInitializationManager] Config loading failed:", error);
            throw error;
        }
    }
    /**
     * Applies a named theme to the UI module.
     * @param theme - Theme identifier
     * @param getModule - Module access function
     * @returns `true` on success, `false` on error
     */
    setTheme(theme, getModule) {
        try {
            Log?.info(`[APIInitializationManager] Setting theme: ${theme}`);
            if (!theme || typeof theme !== "string") {
                throw new Error("Theme name must be a non-empty string");
            }
            if (!getModule || typeof getModule !== "function") {
                throw new Error("getModule function is required");
            }
            const UI = getModule("UI");
            if (!UI) {
                throw new Error("[GeoLeaf.setTheme] GeoLeaf.UI is not available. UI module must be loaded.");
            }
            const result = _applyUITheme(UI, theme);
            Log?.info(`[APIInitializationManager] Theme '${theme}' applied successfully`);
            return Boolean(result);
        }
        catch (error) {
            this.stats.errors++;
            Log?.error(`[APIInitializationManager] Failed to set theme '${theme}':`, error);
            return false;
        }
    }
    /** Validates raw initialisation parameters before normalisation. */
    _validateInitParams(options, getModule) {
        if (!options || typeof options !== "object") {
            return { valid: false, error: "[GeoLeaf.init] An options object is required." };
        }
        if (!getModule || typeof getModule !== "function") {
            return { valid: false, error: "getModule function is required" };
        }
        return { valid: true };
    }
    /** Normalises raw init options into the canonical `INormalizedInitOptions` shape. */
    _normalizeInitOptions(options) {
        const { mapOpts, uiOpts } = _normalizeMapAndUiOpts(options);
        const target = mapOpts.target || mapOpts.mapId;
        if (!target) {
            throw new Error("[GeoLeaf.init] The 'map.target' (or 'target'/'mapId') option is required.");
        }
        const CONSTANTS = _g$7.GeoLeaf?.CONSTANTS ?? {};
        const center = _resolveCenter(mapOpts, CONSTANTS);
        const zoom = _resolveZoom(mapOpts, CONSTANTS);
        const theme = (uiOpts.theme ?? mapOpts.theme ?? "light");
        return {
            mapId: String(target),
            center,
            zoom,
            theme,
            mapOptions: mapOpts.mapOptions ?? {},
        };
    }
    /** Normalises a URL string or config object into `INormalizedConfigOptions`. */
    _normalizeConfigOptions(input) {
        if (typeof input === "string") {
            // URL string
            return {
                source: "url",
                url: input,
                autoEvent: true,
            };
        }
        else if (input && typeof input === "object") {
            // Configuration object
            return {
                source: (input.url ? "url" : "data"),
                url: input.url,
                data: input.data,
                profileId: input.profileId,
                autoEvent: input.autoEvent !== false, // true by default
                ...input,
            };
        }
        else {
            throw new Error("Configuration input must be a URL string or options object");
        }
    }
    /** Returns statistics for this manager. */
    getStats() {
        return {
            ...this.stats,
            isReady: this.isReady,
            hasPendingRequest: !!this.pendingPromise,
        };
    }
    /** Resets the manager, cancelling any pending config load. */
    reset() {
        if (this.pendingPromise) {
            this.cancelled = true;
        }
        this.pendingPromise = null;
        this.cancelled = false;
        this.stats = {
            initCalls: 0,
            configLoads: 0,
            errors: 0,
        };
        if (Log)
            Log.info("[APIInitializationManager] Manager reset");
    }
}

/**
 * API Module Manager - Sprint 4.3 (Version Robuste)
 * Centralised access manager for GeoLeaf modules.
 * @module APIModuleManager
 */
const _g$6 = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {});
_g$6.GeoLeaf = _g$6.GeoLeaf ?? {};
/**
 * Centralised access manager for GeoLeaf modules.
 */
class APIModuleManager {
    modules;
    aliases;
    isInitialized;
    stats;
    constructor() {
        this.modules = new Map();
        this.aliases = new Map();
        this.isInitialized = false;
        this.stats = {
            totalModules: 0,
            accessCount: 0,
            errors: 0,
        };
    }
    /**
     * Initialises the manager with existing modules.
     * @returns Initialisation success flag
     */
    init() {
        try {
            if (this.isInitialized) {
                if (Log)
                    Log.debug("[APIModuleManager] Already initialized");
                return true;
            }
            if (Log)
                Log.info("[APIModuleManager] Initializing module manager");
            // Scanner tous the modules availables in the namespace GeoLeaf
            this._scanExistingModules();
            // Configurer les alias pour compatibilité
            this._setupAliases();
            this.isInitialized = true;
            if (Log)
                Log.info(`[APIModuleManager] Initialized with ${this.stats.totalModules} modules`);
            return true;
        }
        catch (error) {
            this.stats.errors++;
            if (Log)
                Log.error("[APIModuleManager] Initialization failed:", error);
            return false;
        }
    }
    /** Scans the existing GeoLeaf namespace and populates the module cache. */
    _scanExistingModules() {
        const gl = _g$6.GeoLeaf;
        if (!gl)
            return;
        const moduleList = [
            "Core",
            "UI",
            "Config",
            "Baselayers",
            "BaseLayers",
            "POI",
            "GeoJSON",
            "Route",
            "Legend",
            "LayerManager",
            "Storage",
            "Filters",
            "Log",
            "Security",
            "Utils",
            "Constants",
            "Validators",
            "Errors",
        ];
        moduleList.forEach((name) => {
            if (gl[name]) {
                this.modules.set(name, gl[name]);
                this.stats.totalModules++;
            }
        });
        // Scanner the modules privés (préfixe _)
        Object.keys(gl).forEach((key) => {
            if (key.startsWith("_") && !this.modules.has(key)) {
                this.modules.set(key, gl[key]);
                this.stats.totalModules++;
            }
        });
    }
    /** Sets up backwards-compatibility aliases between module names. */
    _setupAliases() {
        const aliases = {
            Baselayers: "BaseLayers",
            BaseLayers: "Baselayers",
            Logger: "Log",
            Log: "Logger",
        };
        Object.entries(aliases).forEach(([alias, target]) => {
            if (this.modules.has(target)) {
                this.aliases.set(alias, target);
            }
        });
    }
    /**
     * Returns a module by name, or `null` if not found.
     * @param name - Module key (e.g. `'Core'`, `'POI'`)
     */
    getModule(name) {
        try {
            this.stats.accessCount++;
            if (!name || typeof name !== "string") {
                Log?.warn(`[APIModuleManager] Invalid module name:`, name);
                this.stats.errors++;
                return null;
            }
            // Recherche directe
            if (this.modules.has(name)) {
                return this.modules.get(name);
            }
            // Recherche par alias
            if (this.aliases.has(name)) {
                const targetName = this.aliases.get(name);
                return this.modules.get(targetName) ?? null;
            }
            // Fallback vers accès global direct
            if (_g$6.GeoLeaf && _g$6.GeoLeaf[name]) {
                // Addsr — notre cache for thes prochains accès
                this.modules.set(name, _g$6.GeoLeaf[name]);
                this.stats.totalModules++;
                return _g$6.GeoLeaf[name];
            }
            // Module non trouvé
            Log?.debug(`[APIModuleManager] Module '${name}' not found`);
            return null;
        }
        catch (error) {
            this.stats.errors++;
            Log?.error(`[APIModuleManager] Error accessing module '${name}':`, error);
            return null;
        }
    }
    /**
     * Manually registers a module in the cache.
     * @param name - Module key
     * @param module - Module instance
     */
    registerModule(name, module) {
        try {
            if (!name || typeof name !== "string") {
                throw new Error("Module name must be a non-empty string");
            }
            if (!module) {
                throw new Error("Module cannot be null or undefined");
            }
            this.modules.set(name, module);
            this.stats.totalModules++;
            if (Log)
                Log.debug(`[APIModuleManager] Module '${name}' registered`);
            return true;
        }
        catch (error) {
            this.stats.errors++;
            if (Log)
                Log.error(`[APIModuleManager] Failed to register module '${name}':`, error);
            return false;
        }
    }
    /**
     * Returns `true` if a module is available by that name.
     * @param name - Module key
     */
    hasModule(name) {
        try {
            return (this.modules.has(name) ||
                this.aliases.has(name) ||
                !!(_g$6.GeoLeaf && _g$6.GeoLeaf[name]));
        }
        catch (error) {
            if (Log)
                Log.error(`[APIModuleManager] Error checking module '${name}':`, error);
            return false;
        }
    }
    /** Returns a sorted list of all known module names. */
    getModuleList() {
        // Perf 6.3.2: O(n) via Set instead of O(n²) via Array.includes() in forEach loop
        const moduleNameSet = new Set(this.modules.keys());
        // Addsr the modules du namespace global non encore dans notre cache
        if (_g$6.GeoLeaf) {
            Object.keys(_g$6.GeoLeaf).forEach((key) => {
                moduleNameSet.add(key);
            });
        }
        return Array.from(moduleNameSet).sort();
    }
    /** Returns usage statistics for this manager. */
    getStats() {
        return {
            ...this.stats,
            cachedModules: this.modules.size,
            aliases: this.aliases.size,
            isInitialized: this.isInitialized,
        };
    }
    /** Clears and repopulates the module cache from the GeoLeaf namespace. */
    refresh() {
        if (Log)
            Log.info("[APIModuleManager] Refreshing module cache");
        this.modules.clear();
        this.aliases.clear();
        this.stats.totalModules = 0;
        this._scanExistingModules();
        this._setupAliases();
    }
    /** Resets the manager to its initial state. */
    reset() {
        this.modules.clear();
        this.aliases.clear();
        this.isInitialized = false;
        this.stats = {
            totalModules: 0,
            accessCount: 0,
            errors: 0,
        };
        if (Log)
            Log.info("[APIModuleManager] Manager reset");
    }
}

/** GeoLeaf UI API - implementation deplacee depuis geoleaf.ui.js */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf UI Module - Main Orchestrator (Sprint 4.4 Refactored)
 * Orchestrateur main pour l'interface user avec délégation complète vers sous-modules
 *
 * @module geoleaf.ui
 * @author Assistant
 * @version 1.2.0 - Modular Architecture
 *
 * RESPONSABILITÉS:
 * ? Exposition of the API public unifiée
 * ? Délégation vers sous-modules spécialisés
 * ? Initialization et coordination des components
 * ? Compatibility layer for the code legacy
 *
 * MODULES DÉLÉGUÉS:
 * - Theme Management    ? _UITheme (ui/theme.js)
 * - Controls            ? _UIControls (ui/controls.js)
 * - Panel Builder       ? _UIPanelBuilder (ui/panel-builder.js)
 * - Filter Panel        ? _UIFilterPanel (ui/filter-panel.js)
 * - Notifications       ? _UINotifications (ui/notifications.js)
 * - Event Delegation    ? _UIEventDelegation (ui/event-delegation.js)
 * - Filter State Mgmt   ? _UIFilterStateManager (ui/filter-state-manager.js)
 */
const _g$5 = (typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {});
_g$5.GeoLeaf = _g$5.GeoLeaf || {};
// ========================================
//   NAMESPACE & DEPENDENCIES
// ========================================
_g$5.GeoLeaf.UI = _g$5.GeoLeaf.UI || {};
// Helper pour createElement unifié
const $create = (tag, props, ...children) => {
    const createElement = _g$5.GeoLeaf.Utils?.createElement;
    if (createElement) {
        return createElement(tag, props ?? {}, ...children);
    }
    // Fallback to native if DomHelpers not loaded yet
    const el = document.createElement(tag);
    if (props) {
        if (props.className)
            el.className = String(props.className);
        if (props.textContent)
            el.textContent = String(props.textContent);
    }
    return el;
};
// ========================================
//   MODULE AVAILABILITY CHECKS
// ========================================
/**
 * Vérifie la disponibilité des modules required
 * @returns {Object} Status de disponibilité des modules
 */
function checkModuleAvailability() {
    const modules = {
        theme: !!_g$5.GeoLeaf._UITheme,
        controls: !!_g$5.GeoLeaf._UIControls,
        panelBuilder: !!(_g$5.GeoLeaf._UIPanelBuilder || _g$5.GeoLeaf.UI.PanelBuilder),
        filterPanel: !!_g$5.GeoLeaf._UIFilterPanel,
        notifications: !!_g$5.GeoLeaf._UINotifications,
        eventDelegation: !!_g$5.GeoLeaf._UIEventDelegation,
        filterStateManager: !!_g$5.GeoLeaf._UIFilterStateManager,
    };
    const missing = Object.entries(modules)
        .filter(([_name, available]) => !available)
        .map(([name]) => name);
    if (missing.length > 0 && Log) {
        Log.warn("[UI.Orchestrator] Modules manquants:", missing.join(", "));
    }
    return { modules, missing, allAvailable: missing.length === 0 };
}
// ========================================
//   API DELEGATION - THEME MANAGEMENT
// ========================================
if (_g$5.GeoLeaf._UITheme) {
    // Délégation directe des fonctions thème
    _g$5.GeoLeaf.UI.initThemeToggle = _g$5.GeoLeaf._UITheme.initThemeToggle;
    _g$5.GeoLeaf.UI.initAutoTheme = _g$5.GeoLeaf._UITheme.initAutoTheme;
    _g$5.GeoLeaf.UI.toggleTheme = _g$5.GeoLeaf._UITheme.toggleTheme;
    _g$5.GeoLeaf.UI.applyTheme = _g$5.GeoLeaf._UITheme.applyTheme;
    _g$5.GeoLeaf.UI.getCurrentTheme = _g$5.GeoLeaf._UITheme.getCurrentTheme;
    // Compatibility aliases
    _g$5.GeoLeaf.UI.setTheme = _g$5.GeoLeaf._UITheme.applyTheme;
}
// ========================================
//   API DELEGATION - CONTROLS
// ========================================
if (_g$5.GeoLeaf._UIControls) {
    // Délégation des contrôles UI
    _g$5.GeoLeaf.UI.initFullscreenControl = _g$5.GeoLeaf._UIControls.initFullscreenControl;
    _g$5.GeoLeaf.UI.initGeolocationControl = _g$5.GeoLeaf._UIControls.initGeolocationControl;
    _g$5.GeoLeaf.UI.initThemeToggleControl = _g$5.GeoLeaf._UIControls.initThemeToggleControl;
    _g$5.GeoLeaf.UI.initScaleControl = _g$5.GeoLeaf._UIControls.initScaleControl;
    // État géolocalisation — proxy live vers GeoLocationState (CDN backward compat)
    Object.defineProperty(_g$5.GeoLeaf.UI, "_geolocationActive", {
        get() {
            return GeoLocationState.active;
        },
        set(v) {
            GeoLocationState.active = v;
        },
        configurable: true,
        enumerable: true,
    });
    Object.defineProperty(_g$5.GeoLeaf.UI, "_geolocationWatchId", {
        get() {
            return GeoLocationState.watchId;
        },
        set(v) {
            GeoLocationState.watchId = v;
        },
        configurable: true,
        enumerable: true,
    });
    Object.defineProperty(_g$5.GeoLeaf.UI, "_userPosition", {
        get() {
            return GeoLocationState.userPosition;
        },
        set(v) {
            GeoLocationState.userPosition = v;
        },
        configurable: true,
        enumerable: true,
    });
    Object.defineProperty(_g$5.GeoLeaf.UI, "_userPositionAccuracy", {
        get() {
            return GeoLocationState.userPositionAccuracy;
        },
        set(v) {
            GeoLocationState.userPositionAccuracy = v;
        },
        configurable: true,
        enumerable: true,
    });
}
// ========================================
//   API DELEGATION - PANEL BUILDER
// ========================================
if (_g$5.GeoLeaf._UIPanelBuilder || _g$5.GeoLeaf.UI.PanelBuilder) {
    const _pbLegacy = _g$5.GeoLeaf.UI.PanelBuilder;
    // Délégation vers panel builder
    _g$5.GeoLeaf.UI.buildSidePanel =
        (_g$5.GeoLeaf._UIPanelBuilder && _g$5.GeoLeaf._UIPanelBuilder.buildSidePanel) ||
            (_pbLegacy && _pbLegacy.buildSidePanel);
    _g$5.GeoLeaf.UI.renderPoiSidePanel =
        (_g$5.GeoLeaf._UIPanelBuilder && _g$5.GeoLeaf._UIPanelBuilder.renderPoiSidePanel) ||
            (_pbLegacy && _pbLegacy.renderPoiSidePanel);
    // Legacy compatibility pour POI panels
    _g$5.GeoLeaf.UI.renderPoiPanelWithLayout = function (poi, layout, container) {
        const sidePanel = _g$5.GeoLeaf.UI.renderPoiSidePanel;
        if (typeof sidePanel === "function") {
            return sidePanel(poi, layout, container);
        }
        if (Log)
            Log.warn("[UI.Orchestrator] renderPoiPanelWithLayout: PanelBuilder non disponible");
    };
    // Helper functions (deprecated, pour compatibilité)
    _g$5.GeoLeaf.UI._resolveField = function (poi, fieldPath) {
        if (_g$5.GeoLeaf._UIDomUtils && _g$5.GeoLeaf._UIDomUtils.resolveField) {
            return _g$5.GeoLeaf._UIDomUtils.resolveField(poi, fieldPath);
        }
        return null;
    };
    _g$5.GeoLeaf.UI._createPlainSection = function (label, innerContent, extraClass) {
        const _pbLegacy = _g$5.GeoLeaf.UI.PanelBuilder;
        if (_pbLegacy && typeof _pbLegacy.createPlainSection === "function") {
            return _pbLegacy.createPlainSection(label, innerContent, extraClass);
        }
        return $create("section", { className: "gl-poi-panel__section " + (extraClass || "") });
    };
    _g$5.GeoLeaf.UI._createAccordionSection = function (label, innerContent, options) {
        const _pbLegacy = _g$5.GeoLeaf.UI.PanelBuilder;
        if (_pbLegacy && typeof _pbLegacy.createAccordionSection === "function") {
            return _pbLegacy.createAccordionSection(label, innerContent, options);
        }
        return $create("section", { className: "gl-poi-panel__section--accordion" });
    };
    _g$5.GeoLeaf.UI._buildLayoutItemContent = function (poi, item) {
        const _pbLegacy = _g$5.GeoLeaf.UI.PanelBuilder;
        if (_pbLegacy && typeof _pbLegacy.buildLayoutItemContent === "function") {
            return _pbLegacy.buildLayoutItemContent(poi, item);
        }
        return null;
    };
}
// ========================================
//   API DELEGATION - FILTER PANEL
// ========================================
if (_g$5.GeoLeaf._UIFilterPanel) {
    // Délégation des fonctions filtres
    _g$5.GeoLeaf.UI.buildFilterPanelFromActiveProfile =
        _g$5.GeoLeaf._UIFilterPanel.buildFilterPanelFromActiveProfile;
    _g$5.GeoLeaf.UI.refreshFilterTags = _g$5.GeoLeaf._UIFilterPanel.refreshFilterTags;
    _g$5.GeoLeaf.UI.initFilterToggle = _g$5.GeoLeaf._UIFilterPanel.initFilterToggle;
    _g$5.GeoLeaf.UI.initProximityFilter = _g$5.GeoLeaf._UIFilterPanel.initProximityFilter;
    _g$5.GeoLeaf.UI._getBasePois = _g$5.GeoLeaf._UIFilterPanel.getBasePois;
    _g$5.GeoLeaf.UI._getBaseRoutes = _g$5.GeoLeaf._UIFilterPanel.getBaseRoutes;
    // Additional delegations
    _g$5.GeoLeaf.UI.toggleFilterPanelVisibility =
        _g$5.GeoLeaf._UIFilterPanel.toggleFilterPanelVisibility;
    _g$5.GeoLeaf.UI.applyFiltersInitial = _g$5.GeoLeaf._UIFilterPanel.applyFiltersInitial;
    _g$5.GeoLeaf.UI._readFiltersFromPanel = _g$5.GeoLeaf._UIFilterPanel._readFiltersFromPanel;
    _g$5.GeoLeaf.UI._filterPoiList = _g$5.GeoLeaf._UIFilterPanel._filterPoiList;
    _g$5.GeoLeaf.UI._filterRouteList = _g$5.GeoLeaf._UIFilterPanel._filterRouteList;
    _g$5.GeoLeaf.UI._refreshPoiLayer = _g$5.GeoLeaf._UIFilterPanel._refreshPoiLayer;
    _g$5.GeoLeaf.UI._getFilterPanelElement = _g$5.GeoLeaf._UIFilterPanel._getFilterPanelElement;
    // Filter state integration si available
    if (_g$5.GeoLeaf._UIFilterStateManager) {
        const _fsm = _g$5.GeoLeaf._UIFilterStateManager;
        // Bridge entre filter panel et state manager
        _g$5.GeoLeaf.UI.resetAllFilters = function () {
            _fsm.resetAllFilters();
            if (_g$5.GeoLeaf._UIFilterPanel?.refreshFilterTags) {
                _g$5.GeoLeaf._UIFilterPanel.refreshFilterTags();
            }
        };
        _g$5.GeoLeaf.UI.getActiveFilters = _g$5.GeoLeaf._UIFilterStateManager.getActiveFiltersSummary;
        _g$5.GeoLeaf.UI.hasActiveFilters = _g$5.GeoLeaf._UIFilterStateManager.hasActiveFilters;
    }
}
// ========================================
//   API DELEGATION - NOTIFICATIONS
// ========================================
if (_g$5.GeoLeaf._UINotifications) {
    // Créer un namespace dédié pour l'accès complete
    _g$5.GeoLeaf.UI.Notifications = {
        show: _g$5.GeoLeaf._UINotifications.show.bind(_g$5.GeoLeaf._UINotifications),
        success: _g$5.GeoLeaf._UINotifications.success.bind(_g$5.GeoLeaf._UINotifications),
        error: _g$5.GeoLeaf._UINotifications.error.bind(_g$5.GeoLeaf._UINotifications),
        warning: _g$5.GeoLeaf._UINotifications.warning.bind(_g$5.GeoLeaf._UINotifications),
        info: _g$5.GeoLeaf._UINotifications.info.bind(_g$5.GeoLeaf._UINotifications),
        clearAll: _g$5.GeoLeaf._UINotifications.clearAll.bind(_g$5.GeoLeaf._UINotifications),
        enable: _g$5.GeoLeaf._UINotifications.enable.bind(_g$5.GeoLeaf._UINotifications),
        disable: _g$5.GeoLeaf._UINotifications.disable.bind(_g$5.GeoLeaf._UINotifications),
        getStatus: _g$5.GeoLeaf._UINotifications.getStatus.bind(_g$5.GeoLeaf._UINotifications),
    };
    // Shortcuts globals pour l'API public (rétrocompatibilité)
    _g$5.GeoLeaf.UI.showNotification = _g$5.GeoLeaf._UINotifications.show.bind(_g$5.GeoLeaf._UINotifications);
    _g$5.GeoLeaf.UI.showSuccess = _g$5.GeoLeaf._UINotifications.success.bind(_g$5.GeoLeaf._UINotifications);
    _g$5.GeoLeaf.UI.showError = _g$5.GeoLeaf._UINotifications.error.bind(_g$5.GeoLeaf._UINotifications);
    _g$5.GeoLeaf.UI.showWarning = _g$5.GeoLeaf._UINotifications.warning.bind(_g$5.GeoLeaf._UINotifications);
    _g$5.GeoLeaf.UI.showInfo = _g$5.GeoLeaf._UINotifications.info.bind(_g$5.GeoLeaf._UINotifications);
    _g$5.GeoLeaf.UI.clearNotifications = _g$5.GeoLeaf._UINotifications.clearAll.bind(_g$5.GeoLeaf._UINotifications);
}
// ========================================
//   EVENT DELEGATION INTEGRATION
// ========================================
let _delegationInitialized = false;
/**
 * Initializes the délégation d'événements pour l'interface
 * @param {Object} options - Options d'initialization
 */
function initializeEventDelegation(options = {}) {
    const delegation = _g$5.GeoLeaf._UIEventDelegation;
    if (_delegationInitialized || !delegation)
        return;
    const { filterContainer } = options;
    // Event listners pour the filters si available
    if (filterContainer && _g$5.GeoLeaf._UIFilterStateManager) {
        delegation.attachFilterInputEvents(filterContainer, () => {
            // Callback de changement de filters - déléguer vers FilterPanel
            if (_g$5.GeoLeaf._UIFilterPanel && _g$5.GeoLeaf._UIFilterPanel.refreshFilterTags) {
                _g$5.GeoLeaf._UIFilterPanel.refreshFilterTags();
            }
        });
    }
    // Event listners for thes accordéons
    document.addEventListener("DOMContentLoaded", () => {
        const accordionContainers = document.querySelectorAll(".gl-poi-panel, .gl-filter-panel");
        accordionContainers.forEach((container) => {
            delegation.attachAccordionEvents(container);
        });
    });
    _delegationInitialized = true;
    if (Log)
        Log.info("[UI.Orchestrator] Event delegation initialisée");
}
// ========================================
//   MAIN INITIALIZATION HELPERS
// ========================================
function _checkAndLogModules() {
    const { missing, allAvailable } = checkModuleAvailability();
    if (!allAvailable) {
        if (Log)
            Log.warn("[UI.Orchestrator] Initialization with missing modules:", missing);
    }
}
function _tryControl(fn, logMsg, ...args) {
    if (!fn || typeof fn !== "function")
        return;
    try {
        fn(...args);
    }
    catch (error) {
        if (Log)
            Log.error(logMsg, error);
    }
}
function _initThemeControl(config) {
    // Apply auto-detection / explicit theme BEFORE the toggle button is initialised
    const uiConfig = _g$5.GeoLeaf.Config?.get?.("ui") ?? {};
    const themeConfig = uiConfig.theme ?? "auto";
    const autoFn = _g$5.GeoLeaf.UI.initAutoTheme;
    if (typeof autoFn === "function") {
        try {
            autoFn(themeConfig);
        }
        catch (error) {
            if (Log)
                Log.error("[UI.Orchestrator] Erreur initAutoTheme:", error);
        }
    }
    const fn = _g$5.GeoLeaf.UI.initThemeToggle;
    if (typeof fn !== "function")
        return;
    try {
        fn(config);
    }
    catch (error) {
        if (Log)
            Log.error("[UI.Orchestrator] Erreur init th\u00e8me:", error);
    }
}
function _initMapControls(options) {
    if (!options.map)
        return;
    if (!options.mapContainer)
        return;
    // Fullscreen standalone control removed (Sprint 9) — managed by toolbar.
    // Geolocation control must be initialized — toolbar delegates click events to it.
    _tryControl(_g$5.GeoLeaf.UI.initGeolocationControl, "[UI.Orchestrator] Erreur geolocation control:", options.map, options.config);
    _tryControl(_g$5.GeoLeaf.UI.initScaleControl, "[UI.Orchestrator] Erreur scale control:", options.map);
    // Theme toggle control (opt-in via ui.showThemeToggle)
    const uiCfg = _g$5.GeoLeaf.Config?.get?.("ui") ?? {};
    if (uiCfg.showThemeToggle) {
        _tryControl(_g$5.GeoLeaf.UI.initThemeToggleControl, "[UI.Orchestrator] Erreur theme toggle control:", options.map);
    }
}
function _initFilterState() {
    if (!_g$5.GeoLeaf._UIFilterStateManager)
        return;
    if (!_g$5.GeoLeaf.Config)
        return;
    const getProfile = _g$5.GeoLeaf.Config.getActiveProfile;
    if (!getProfile)
        return;
    const activeProfile = getProfile();
    if (!activeProfile)
        return;
    if (!activeProfile.filters)
        return;
    try {
        _g$5.GeoLeaf._UIFilterStateManager.initializeFromProfile(activeProfile);
    }
    catch (error) {
        if (Log)
            Log.error("[UI.Orchestrator] Erreur init filter state:", error);
    }
}
// ========================================
//   MAIN INITIALIZATION
// ========================================
/**
 * Point d'entrée main pour l'initialization UI
 * @param {Object} options - Options d'initialization
 * @param {HTMLElement} options.map - Instance de carte MapLibre
 * @param {HTMLElement} options.mapContainer - Conteneur DOM de the map
 * @param {HTMLElement} options.filterContainer - Conteneur des filtres
 * @param {string} options.buttonSelector - Sélecteur du button thème
 * @param {boolean} options.autoInitOnDomReady - Auto-init au DOMContentLoaded
 * @param {boolean} options.enableEventDelegation - Active la délégation d'événements (défaut: true)
 */
_g$5.GeoLeaf.UI.init = function (options = {}) {
    const config = {
        buttonSelector: options.buttonSelector || '[data-gl-role="theme-toggle"]',
        autoInitOnDomReady: !!options.autoInitOnDomReady,
        enableEventDelegation: options.enableEventDelegation !== false,
    };
    _checkAndLogModules();
    _initThemeControl(config);
    _initMapControls(options);
    if (config.enableEventDelegation) {
        initializeEventDelegation({
            filterContainer: options.filterContainer,
        });
    }
    _initFilterState();
    if (Log) {
        Log.info(`[UI.Orchestrator] Initialisation termin\u00e9e (modules: ${Object.keys(checkModuleAvailability().modules).length})`);
    }
};
// ========================================
//   UTILITY & DEBUG FUNCTIONS
// ========================================
/**
 * Information de debug sur l'état des modules
 * @returns {Object} Status détaillé des modules
 */
_g$5.GeoLeaf.UI.getModuleStatus = function () {
    return checkModuleAvailability();
};
/**
 * Nettoyage général des resources UI
 */
_g$5.GeoLeaf.UI.cleanup = function () {
    // Nettoyage des event listners
    if (_g$5.GeoLeaf._UIEventDelegation && _g$5.GeoLeaf._UIEventDelegation.cleanupAllListeners) {
        const cleaned = _g$5.GeoLeaf._UIEventDelegation.cleanupAllListeners();
        if (Log && cleaned > 0) {
            Log.info(`[UI.Orchestrator] ${cleaned} event listeners nettoyés`);
        }
    }
    // Reset flag délégation
    _delegationInitialized = false;
    if (Log)
        Log.info("[UI.Orchestrator] Nettoyage terminé");
};
// ========================================
//   LEGACY COMPATIBILITY LAYER
// ========================================
// Fonctions legacy maintenues pour compatibilité
_g$5.GeoLeaf.UI._attachAccordionBehavior = function (container) {
    if (_g$5.GeoLeaf._UIEventDelegation && _g$5.GeoLeaf._UIEventDelegation.attachAccordionEvents) {
        return _g$5.GeoLeaf._UIEventDelegation.attachAccordionEvents(container);
    }
    if (Log)
        Log.warn("[UI.Orchestrator] _attachAccordionBehavior: EventDelegation module manquant");
};
_g$5.GeoLeaf.UI._getActiveProfileConfig = function () {
    if (_g$5.GeoLeaf._UIDomUtils && _g$5.GeoLeaf._UIDomUtils.getActiveProfileConfig) {
        return _g$5.GeoLeaf._UIDomUtils.getActiveProfileConfig();
    }
    return _g$5.GeoLeaf.Config?.getActiveProfile?.() || null;
};
_g$5.GeoLeaf.UI._populateSelectOptionsFromTaxonomy = function (selectEl, profile, optionsFrom) {
    if (!_g$5.GeoLeaf._UIDomUtils) {
        Log?.error?.("[UI] _UIDomUtils unavailable");
        return;
    }
    return _g$5.GeoLeaf._UIDomUtils.populateSelectOptionsFromTaxonomy(selectEl, profile, optionsFrom);
};
// Version info
_g$5.GeoLeaf.UI.VERSION = "4.4.0";
_g$5.GeoLeaf.UI.BUILD = "Sprint-4.4-Modular";
if (Log) {
    Log.info(`[UI.Orchestrator] Module initialise v${_g$5.GeoLeaf.UI.VERSION}`);
}
const UI = _g$5.GeoLeaf.UI;

/*!
 * GeoLeaf Core – API / Boot Info
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 */
/**
 * Displays un toast de startup listant la version GeoLeaf
 * et les plugins optionals loadeds.
 *
 * Called automatically at the end of GeoLeaf.boot() if not deactivated.
 *
 * @module api/boot-info
 */
/**
 * Detects les plugins loadeds en interrogeant window.GeoLeaf.
 * @param {object} GeoLeaf - Le namespace global GeoLeaf
 * @returns {string[]} List des noms de plugins actives
 */
/* eslint-disable complexity -- plugin detection branchs */
function _detectLoadedPlugins(GeoLeaf) {
    // Source maine : PluginRegistry (fiable, auto-enregistrement par chaque plugin).
    // If the registry is available, it is fully trusted — even if the list is empty (Core only).
    // Ne PAS tomber en fallback duck-typing : les facades Core (Storage, Labels, LayerManager)
    // existent same sans plugin premium, ce qui fausse la detection.
    if (GeoLeaf.plugins?.getLoadedPlugins) {
        return GeoLeaf.plugins.getLoadedPlugins().filter((n) => !["core"].includes(n));
    }
    // Fallback duck-typing si registry non available (compat ascendante)
    const plugins = [];
    if (GeoLeaf.Storage && typeof GeoLeaf.Storage === "object") {
        const hasDB = GeoLeaf.Storage.DB && typeof GeoLeaf.Storage.DB === "object";
        plugins.push(hasDB ? "storage (offline + IndexedDB)" : "storage (cache)");
    }
    if (GeoLeaf.POI?.AddForm && typeof GeoLeaf.POI.AddForm === "object") {
        plugins.push("addpoi");
    }
    if (GeoLeaf._LayerManagerControl || GeoLeaf._LMRenderer) {
        plugins.push("layer-manager");
    }
    if (GeoLeaf.Route && typeof GeoLeaf.Route.load === "function") {
        plugins.push("route");
    }
    if (GeoLeaf.Labels && typeof GeoLeaf.Labels.init === "function") {
        plugins.push("labels");
    }
    return plugins;
}
/* eslint-enable complexity */
/**
 * Builds the message du toast de startup.
 * @param {object} GeoLeaf
 * @returns {{ title: string, message: string }}
 */
function _buildBootMessage(GeoLeaf) {
    const version = GeoLeaf._version || "1.2.0";
    const plugins = _detectLoadedPlugins(GeoLeaf);
    // Distinguer modules premium des modules core
    const premiumKeys = ["storage", "addpoi"];
    const premiumLoaded = plugins.filter((p) => premiumKeys.some((pk) => p.toLowerCase().startsWith(pk)));
    const coreModules = plugins.filter((p) => !premiumKeys.some((pk) => p.toLowerCase().startsWith(pk)));
    let message = "";
    if (premiumLoaded.length > 0) {
        message = `Core MIT • Premium: ${premiumLoaded.join(" + ")}`;
        if (coreModules.length > 0)
            message += ` • ${coreModules.join(" • ")}`;
    }
    else {
        message =
            plugins.length > 0 ? `Core MIT — ${coreModules.join(" • ")}` : "Core MIT — open source";
    }
    return {
        title: `GeoLeaf JS ${version}`,
        message,
    };
}
/**
 * Displays le toast de startup.
 * Respects the `debug.showBootInfo` config (default: true in dev, false in prod).
 *
 * @param {object} GeoLeaf - Le namespace global GeoLeaf
 * @param {object} [options]
 * @param {boolean} [options.force=false] - Forcer l'display same si deactivated en config
 * @param {number} [options.duration=4000] - Duration d'display en ms
 */
function showBootInfo(GeoLeaf, options = {}) {
    if (!GeoLeaf)
        return;
    // Config check — can be disabled via JSON profile: "debug": { "showBootInfo": false }
    if (!options.force) {
        try {
            const showFlag = GeoLeaf.Config?.get?.("debug.showBootInfo");
            // Si explicitement deactivated, ne pas display
            if (showFlag === false)
                return;
        }
        catch (_) {
            /* Config non available — display quand same */
        }
    }
    const { title, message } = _buildBootMessage(GeoLeaf);
    // Log only — toast deactivated (dev info only)
    console.info(`[GeoLeaf] ${title} | ${message}`);
}
/**
 * API public exposede sur GeoLeaf.bootInfo
 */
const BootInfo = {
    show: showBootInfo,
    detectPlugins: _detectLoadedPlugins,
    buildMessage: _buildBootMessage,
};

/*!
 * GeoLeaf Core – API / PluginRegistry
 * © 2026 Mattieu Pottier — MIT License
 */
/**
 * Lightweight registry of loaded GeoLeaf plugins and modules.
 * Allows integrators to query available capabilities.
 *
 * @module api/plugin-registry
 * @example
 * GeoLeaf.plugins.isLoaded('storage')      // → true/false
 * GeoLeaf.plugins.getLoadedPlugins()        // → ['core', 'storage', 'labels']
 * GeoLeaf.plugins.canActivate('addpoi')     // → true if dependencies OK
 */
const _registry$1 = new Map(); // name → { name, version, loaded, loadedAt, metadata }
const _lazyResolvers = new Map(); // name → () => Promise<void>
/**
 * Dispatches a GeoLeaf custom event on `document` (inline, no external import).
 * Same pattern used by baselayers/registry.ts to avoid circular dependencies.
 * @internal
 */
function _firePluginEvent(name, detail) {
    if (typeof document === "undefined")
        return;
    try {
        document.dispatchEvent(new CustomEvent(name, { detail, bubbles: false }));
    }
    catch (_e) {
        // Silent — non-critical telemetry event
    }
}
const PluginRegistry = {
    /**
     * Registers a plugin as loaded.
     * Called automatically by globals.js and plugin files.
     * @param {string} name - Plugin identifier (e.g. 'storage', 'addpoi', 'labels')
     * @param {object} [metadata] - Optional metadata { version, requires, optional }
     */
    register(name, metadata = {}) {
        const version = metadata.version || null;
        _registry$1.set(name, {
            name,
            version,
            type: metadata.type || "standard",
            loaded: true,
            loadedAt: Date.now(),
            requires: metadata.requires || [],
            optional: metadata.optional || [],
            label: metadata.label || name,
            healthCheck: metadata.healthCheck || null,
        });
        _firePluginEvent("geoleaf:plugin:loaded", { name: String(name), version });
    },
    /**
     * Registers a lazy resolver (called by bundle-entry.js).
     * @param {string} name
     * @param {Function} resolver - () => Promise<void>
     */
    registerLazy(name, resolver) {
        _lazyResolvers.set(name, resolver);
    },
    /**
     * Checks if a plugin is currently loaded.
     * @param {string} name
     * @returns {boolean}
     */
    isLoaded(name) {
        return _registry$1.has(name) && _registry$1.get(name).loaded === true;
    },
    /**
     * Checks if a plugin can be activated (its `requires` dependencies are loaded).
     * @param {string} name
     * @returns {boolean}
     */
    canActivate(name) {
        const entry = _registry$1.get(name);
        if (!entry)
            return _lazyResolvers.has(name);
        return entry.requires.every((dep) => PluginRegistry.isLoaded(dep));
    },
    /**
     * Loads a plugin lazy par son nom.
     * @param {string} name
     * @returns {Promise<void>}
     */
    async load(name) {
        if (PluginRegistry.isLoaded(name))
            return;
        const resolver = _lazyResolvers.get(name);
        if (!resolver)
            throw new Error(`[GeoLeaf.plugins] Module inconnu : "${name}". Modules disponibles : ${[..._lazyResolvers.keys()].join(", ")}`);
        try {
            await resolver();
            _firePluginEvent("geoleaf:plugin:lazy-loaded", { name: String(name) });
        }
        catch (err) {
            _firePluginEvent("geoleaf:plugin:failed", {
                name: String(name),
                error: String(err).slice(0, 200),
            });
            throw err;
        }
    },
    /**
     * Returns the list of loaded plugin names.
     * @returns {string[]}
     */
    getLoadedPlugins() {
        return [..._registry$1.keys()].filter((k) => _registry$1.get(k).loaded);
    },
    /**
     * Returns the list of all availabthe modules (loaded + lazy available).
     * @returns {string[]}
     */
    getAvailableModules() {
        return [...new Set([..._registry$1.keys(), ..._lazyResolvers.keys()])];
    },
    /**
     * Returns the metadata of a plugin.
     * @param {string} name
     * @returns {object|null}
     */
    getInfo(name) {
        return _registry$1.get(name) || null;
    },
    /**
     * Prints a console report of loaded standard (MIT, non-core) plugins.
     * Silent if none are loaded.
     */
    reportStandardPlugins() {
        // Fallback name set for plugins that don't declare type
        const STANDARD_PLUGINS_FALLBACK = new Set([
            "websocket",
            "realtime-layer",
            "connector",
            "flatgeobuf",
            "file-import",
            "print",
        ]);
        const standard = [..._registry$1.values()].filter((e) => e.loaded &&
            (e.type === "standard"
                ? !_isCoreName(e.name)
                : STANDARD_PLUGINS_FALLBACK.has(e.name)));
        if (standard.length === 0)
            return;
        // eslint-disable-next-line no-console
        console.groupCollapsed(`%c[PLUGINS] ${standard.length} plugin(s) MIT chargé(s)`, "color:#0369a1;font-weight:bold");
        for (const entry of standard) {
            const healthy = typeof entry.healthCheck === "function" ? entry.healthCheck() : true;
            const icon = healthy ? "✅" : "⚠️";
            const color = healthy ? "color:#0284c7" : "color:#d97706";
            const label = entry.label || entry.name;
            const version = entry.version ? ` v${entry.version}` : "";
            const status = healthy ? "OK" : "non connecté";
            console.log(`%c  ${icon} ${label}${version}  [${status}]`, color); // eslint-disable-line no-console
        }
        console.groupEnd(); // eslint-disable-line no-console
    },
    /**
     * Prints a console report of loaded premium (commercial) plugins.
     * Silent if no premium plugin is loaded (core only).
     */
    reportPremiumPlugins() {
        // Fallback name set for plugins that don't declare type
        const PREMIUM_PLUGINS_FALLBACK = new Set(["storage", "addpoi", "cog"]);
        const premium = [..._registry$1.values()].filter((e) => e.loaded && (e.type === "premium" || PREMIUM_PLUGINS_FALLBACK.has(e.name)));
        if (premium.length === 0) {
            console.info("%c[PLUGINS] Core MIT — 0 premium plugin loaded", "color:#6b7280;font-style:italic");
            return;
        }
        // eslint-disable-next-line no-console
        console.groupCollapsed(`%c[PLUGINS] ${premium.length} premium plugin(s) loaded`, "color:#7c3aed;font-weight:bold");
        for (const entry of premium) {
            const healthy = typeof entry.healthCheck === "function" ? entry.healthCheck() : true;
            const icon = healthy ? "✅" : "❌";
            const color = healthy ? "color:#16a34a" : "color:#dc2626";
            const label = entry.label || entry.name;
            const version = entry.version ? ` v${entry.version}` : "";
            const status = healthy ? "OK" : "ERREUR — module incomplet";
            console.log(`%c  ${icon} ${label}${version}  [${status}]`, color); // eslint-disable-line no-console
            if (!healthy) {
                console.warn(`     [PLUGINS] ${entry.name} : healthCheck failed — check plugin loading.`);
            }
        }
        console.groupEnd(); // eslint-disable-line no-console
    },
    // Internal access — do not use outside GeoLeaf
    _registry: _registry$1,
    _lazyResolvers,
};
/** Core internal module names — excluded from standard plugin report. */
function _isCoreName(name) {
    return [
        "core",
        "labels",
        "route",
        "table",
        "legend",
        "layerManager",
        "themes",
        "basemapSelector",
        "poiCore",
        "poiRenderers",
        "poiExtras",
        "poi",
        "basemap-selector",
    ].includes(name);
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
const DISMISSED_KEY = "gl_pwa_install_dismissed";
let _deferredPrompt = null;
let _banner = null;
function _isDismissed$1() {
    try {
        return localStorage.getItem(DISMISSED_KEY) === "1";
    }
    catch {
        return false;
    }
}
function _persist() {
    try {
        localStorage.setItem(DISMISSED_KEY, "1");
    }
    catch {
        // localStorage unavailable — silently ignore
    }
}
function _removeBanner() {
    if (_banner) {
        _banner.remove();
        _banner = null;
    }
}
function _dismiss$1() {
    _persist();
    _removeBanner();
}
function _createBanner$1() {
    const div = document.createElement("div");
    div.id = "gl-install-banner";
    div.setAttribute("role", "banner");
    div.setAttribute("aria-live", "polite");
    div.style.cssText = [
        "position:fixed",
        "bottom:16px",
        "left:50%",
        "transform:translateX(-50%)",
        "background:#2d6a4f",
        "color:#fff",
        "border-radius:8px",
        "padding:12px 16px",
        "box-shadow:0 4px 16px rgba(0,0,0,0.25)",
        "display:flex",
        "align-items:center",
        "gap:12px",
        "z-index:99999",
        "max-width:calc(100vw - 32px)",
        "font-family:inherit",
        "font-size:14px",
        "line-height:1.4",
    ].join(";");
    const text = document.createElement("span");
    text.textContent = "Installer l'application GeoLeaf";
    const installBtn = document.createElement("button");
    installBtn.setAttribute("type", "button");
    installBtn.textContent = "Installer";
    installBtn.style.cssText = [
        "background:#fff",
        "color:#2d6a4f",
        "border:none",
        "border-radius:4px",
        "padding:6px 12px",
        "font-weight:600",
        "cursor:pointer",
        "font-size:13px",
        "white-space:nowrap",
        "flex-shrink:0",
    ].join(";");
    installBtn.addEventListener("click", () => {
        const pending = _deferredPrompt;
        if (!pending)
            return;
        pending.prompt().then(() => {
            pending.userChoice.then(() => {
                _deferredPrompt = null;
                _dismiss$1();
            });
        });
    });
    const closeBtn = document.createElement("button");
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("aria-label", "Fermer la bannière d'installation");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = [
        "background:transparent",
        "border:none",
        "color:#fff",
        "cursor:pointer",
        "font-size:16px",
        "padding:0 4px",
        "line-height:1",
        "flex-shrink:0",
    ].join(";");
    closeBtn.addEventListener("click", _dismiss$1);
    div.appendChild(text);
    div.appendChild(installBtn);
    div.appendChild(closeBtn);
    return div;
}
/**
 * Android PWA install prompt controller.
 */
const InstallPrompt = {
    /**
     * Registers event listeners for `beforeinstallprompt` and `appinstalled`.
     * Shows a banner when the browser signals the PWA is installable.
     * Does nothing if the user has previously dismissed the prompt.
     */
    init() {
        if (_isDismissed$1())
            return;
        // Use bare event target (global scope) to avoid unicorn/prefer-globalThis lint rule
        addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            _deferredPrompt = e;
            if (!_banner) {
                _banner = _createBanner$1();
                document.body.appendChild(_banner);
            }
        });
        // Auto-dismiss if the app gets installed through another path
        addEventListener("appinstalled", () => {
            _deferredPrompt = null;
            _dismiss$1();
        });
    },
    /** Returns `true` if the browser has a deferred install prompt ready. */
    isInstallable() {
        return _deferredPrompt !== null;
    },
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module pwa/ios-banner
 * @description iOS PWA installation instructions banner.
 *
 * On iOS Safari, `beforeinstallprompt` does not exist. This module detects
 * the iOS environment and shows a bottom sheet with manual install instructions:
 * "Tap the share icon, then 'Add to Home Screen'".
 *
 * The banner is shown once per browser (dismissal persisted in localStorage).
 * It is not shown if the app is already running in standalone mode.
 */
const IOS_DISMISSED_KEY = "gl_pwa_ios_dismissed";
// iOS share icon — simplified Apple share symbol (SVG inline, no external resource)
const SHARE_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" ' +
    'fill="currentColor" aria-hidden="true" style="display:inline-block;vertical-align:middle;">' +
    '<path d="M8 0L4 4h3v9h2V4h3L8 0z"/>' +
    '<path d="M0 7v11a1 1 0 001 1h14a1 1 0 001-1V7a1 1 0 00-1-1h-3v2h2v8H2V8h2V6H1a1 1 0 00-1 1z"/>' +
    "</svg>";
function _isIOSSafari() {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    // `navigator.standalone` is `true` when already running as installed PWA
    const isStandalone = navigator.standalone === true;
    return isIOS && !isStandalone;
}
function _isDismissed() {
    try {
        return localStorage.getItem(IOS_DISMISSED_KEY) === "1";
    }
    catch {
        return false;
    }
}
function _dismiss(banner) {
    try {
        localStorage.setItem(IOS_DISMISSED_KEY, "1");
    }
    catch {
        // localStorage unavailable — silently ignore
    }
    banner.remove();
}
function _createBanner() {
    const div = document.createElement("div");
    div.id = "gl-ios-install-banner";
    div.setAttribute("role", "complementary");
    div.setAttribute("aria-label", "Ajouter GeoLeaf à l'écran d'accueil");
    div.style.cssText = [
        "position:fixed",
        "bottom:0",
        "left:0",
        "right:0",
        "background:#1c1c1e",
        "color:#fff",
        "padding:16px 16px 20px",
        "box-shadow:0 -2px 16px rgba(0,0,0,0.4)",
        "z-index:99999",
        "font-family:inherit",
        "font-size:13px",
        "border-top-left-radius:12px",
        "border-top-right-radius:12px",
    ].join(";");
    // Header row: title + close button
    const header = document.createElement("div");
    header.style.cssText =
        "display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;";
    const title = document.createElement("strong");
    title.style.cssText = "font-size:15px;";
    title.textContent = "Installer GeoLeaf";
    const closeBtn = document.createElement("button");
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("aria-label", "Fermer");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = [
        "background:transparent",
        "border:none",
        "color:#aaa",
        "cursor:pointer",
        "font-size:20px",
        "padding:0",
        "line-height:1",
    ].join(";");
    closeBtn.addEventListener("click", () => _dismiss(div));
    header.appendChild(title);
    header.appendChild(closeBtn);
    // Body: instructions with share icon inline
    const body = document.createElement("div");
    body.style.cssText = "display:flex;align-items:flex-start;gap:10px;line-height:1.6;";
    const iconWrap = document.createElement("span");
    iconWrap.style.cssText = "color:#2d6a4f;flex-shrink:0;margin-top:2px;";
    iconWrap.innerHTML = SHARE_ICON_SVG; // SAFE: hardcoded SVG constant — no user data
    const instructions = document.createElement("span");
    // Build instruction text with inline share icon
    instructions.innerHTML = // SAFE: hardcoded i18n string + SVG constant — no user data
        "Appuyez sur l'icône " +
            '<span style="color:#2d6a4f;display:inline-flex;align-items:center;vertical-align:middle;">' +
            SHARE_ICON_SVG +
            "</span>" +
            " de partage, puis sélectionnez <strong>« Sur l'écran d'accueil »</strong>";
    body.appendChild(iconWrap);
    body.appendChild(instructions);
    div.appendChild(header);
    div.appendChild(body);
    return div;
}
/**
 * iOS PWA installation instructions banner controller.
 */
const IosBanner = {
    /**
     * Shows the iOS install instructions banner if the current environment is
     * iOS Safari and the app has not been dismissed or already installed.
     * Displayed after a 1.5 s delay to avoid interfering with the initial render.
     */
    init() {
        if (!_isIOSSafari() || _isDismissed())
            return;
        setTimeout(() => {
            const banner = _createBanner();
            document.body.appendChild(banner);
        }, 1500);
    },
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module pwa/pwa-manager
 * @description GeoLeaf PWA Manager — orchestrates the install prompt experience.
 *
 * Activated by `GeoLeaf.PWA.init(config)` after the application config is loaded.
 * The install prompt is **opt-in**: it only activates when
 * `pwa.installPrompt.enabled` is `true` in `geoleaf.config.json`.
 *
 * Platform routing:
 * - **iOS Safari** → `IosBanner` (manual instructions — `beforeinstallprompt` not available on iOS)
 * - **Android / Chrome / Edge** → `InstallPrompt` (native `beforeinstallprompt` banner)
 *
 * @example
 * // geoleaf.config.json
 * {
 *   "pwa": {
 *     "name": "My App",
 *     "short_name": "MyApp",
 *     "theme_color": "#2d6a4f",
 *     "background_color": "#ffffff",
 *     "installPrompt": { "enabled": true }
 *   }
 * }
 */
/**
 * GeoLeaf PWA Manager.
 * Initializes the appropriate install prompt experience based on the platform.
 */
const PWAManager = {
    /**
     * Initializes the PWA install prompt for the current platform.
     *
     * - **Opt-in**: does nothing unless `config.installPrompt.enabled === true`.
     * - **iOS Safari**: displays a bottom sheet with manual install instructions.
     * - **Other browsers**: listens for `beforeinstallprompt` and shows a custom banner.
     *
     * Call this method after the GeoLeaf config has been loaded (i.e. from `app/boot.ts`).
     *
     * @param config - PWA section from the loaded `geoleaf.config.json`.
     */
    init(config) {
        if (config?.installPrompt?.enabled !== true)
            return;
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isIOS) {
            IosBanner.init();
        }
        else {
            InstallPrompt.init();
        }
    },
};

/*!
 * GeoLeaf Core – Permalink / URL Parsing and Building
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module permalink/permalink-url
 *
 * @description
 * URL parsing and serialization for the GeoLeaf permalink system (§1.3).
 *
 * Exposes `readUrl`, `buildUrl`, the `PermalinkState` type, and URL parameter
 * constants. Consumed by `permalink-manager.ts` and re-exported via
 * `permalink-api.ts`.
 */
// ── URL parameter names ───────────────────────────────────────────────────────
const P_LAT = "gl_lat";
const P_LNG = "gl_lng";
const P_ZOOM = "gl_zoom";
const P_LAYERS = "gl_layers";
const P_FILTER = "gl_filter";
const P_POI = "gl_poi";
/** Compact mode key: `#gl=<base64>` */
const P_COMPACT = "gl";
/** Active data theme parameter key. */
const P_THEME = "gl_theme";
/** Layers manually shown by the user (beyond what the active theme displays). */
const P_SHOWN = "gl_shown";
/** Active category filter param key. */
const P_CATS = "gl_cats";
/** Active sub-category filter param key. */
const P_SUBS = "gl_subs";
/** Active tag filter param key. */
const P_TAGS = "gl_tags";
/** Minimum rating filter param key. */
const P_RATING = "gl_rating";
/** Auto-compact threshold in characters (param string length). */
const AUTO_COMPACT_THRESHOLD = 200;
/** Maximum number of serialized layer IDs (prevents URL abuse). */
const MAX_LAYERS = 100;
/** Maximum length of serialized text fields. */
const MAX_TEXT_LEN = 200;
// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Validate and coerce a raw parsed permalink state object.
 * Returns null if required numeric fields are missing or out of range.
 *
 * @security Validates decoded permalink state; rejects invalid coordinates, caps arrays and text lengths.
 */
function _validateRaw(raw) {
    if (!raw || typeof raw !== "object")
        return null;
    const lat = validateNumber(raw.lat, -90, 90);
    const lng = validateNumber(raw.lng, -180, 180);
    const zoom = validateNumber(raw.zoom, 0, 28);
    if (lat === null || lng === null || zoom === null)
        return null;
    try {
        validateCoordinates(lat, lng);
    }
    catch {
        return null;
    }
    const state = { lat, lng, zoom };
    if (Array.isArray(raw.layers)) {
        state.layers = raw.layers
            .filter((l) => typeof l === "string" && l.length > 0)
            .slice(0, MAX_LAYERS);
    }
    if (Array.isArray(raw.shownLayers)) {
        state.shownLayers = raw.shownLayers
            .filter((l) => typeof l === "string" && l.length > 0)
            .slice(0, MAX_LAYERS);
    }
    if (typeof raw.filter === "string" && raw.filter.length > 0) {
        state.filter = raw.filter.slice(0, MAX_TEXT_LEN);
    }
    if (Array.isArray(raw.categories)) {
        state.categories = raw.categories
            .filter((c) => typeof c === "string" && c.length > 0)
            .slice(0, MAX_LAYERS);
    }
    if (Array.isArray(raw.subCategories)) {
        state.subCategories = raw.subCategories
            .filter((c) => typeof c === "string" && c.length > 0)
            .slice(0, MAX_LAYERS);
    }
    if (Array.isArray(raw.tags)) {
        state.tags = raw.tags
            .filter((t) => typeof t === "string" && t.length > 0)
            .slice(0, MAX_LAYERS);
    }
    if (typeof raw.rating === "number" && raw.rating > 0) {
        state.rating = raw.rating;
    }
    if (typeof raw.poi === "string" && raw.poi.length > 0) {
        state.poi = raw.poi.slice(0, MAX_TEXT_LEN);
    }
    if (typeof raw.theme === "string" && raw.theme.length > 0) {
        state.theme = raw.theme.slice(0, MAX_TEXT_LEN);
    }
    return state;
}
/**
 * Parse URL params into a PermalinkState according to the active config.
 * Handles both verbose (`gl_lat=…`) and compact (`gl=<base64>`) formats.
 *
 * @security Validates all URL parameters; numeric fields via validateNumber, text capped at MAX_TEXT_LEN.
 */
function _parseParams(params, config) {
    // Compact mode (base64 JSON)
    const compact = params.get(P_COMPACT);
    if (compact) {
        try {
            const decoded = JSON.parse(atob(compact));
            return _validateRaw(decoded);
        }
        catch {
            return null;
        }
    }
    const rawLat = params.get(P_LAT);
    const rawLng = params.get(P_LNG);
    const rawZoom = params.get(P_ZOOM);
    if (rawLat === null || rawLng === null || rawZoom === null)
        return null;
    const lat = validateNumber(Number(rawLat), -90, 90);
    const lng = validateNumber(Number(rawLng), -180, 180);
    const zoom = validateNumber(Number(rawZoom), 0, 28);
    if (lat === null || lng === null || zoom === null)
        return null;
    try {
        validateCoordinates(lat, lng);
    }
    catch {
        return null;
    }
    const fields = config.fields ?? [
        "lat",
        "lng",
        "zoom",
        "layers",
        "shownLayers",
        "filter",
        "categories",
        "subCategories",
        "tags",
        "rating",
        "poi",
        "theme",
    ];
    const state = { lat, lng, zoom };
    if (fields.includes("layers")) {
        const rawLayers = params.get(P_LAYERS);
        if (rawLayers) {
            state.layers = rawLayers
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .slice(0, MAX_LAYERS);
        }
    }
    if (fields.includes("shownLayers")) {
        const rawShown = params.get(P_SHOWN);
        if (rawShown) {
            state.shownLayers = rawShown
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .slice(0, MAX_LAYERS);
        }
    }
    if (fields.includes("filter")) {
        const rawFilter = params.get(P_FILTER);
        if (rawFilter) {
            state.filter = rawFilter.slice(0, MAX_TEXT_LEN);
        }
    }
    if (fields.includes("categories")) {
        const r = params.get(P_CATS);
        if (r)
            state.categories = r
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .slice(0, MAX_LAYERS);
    }
    if (fields.includes("subCategories")) {
        const r = params.get(P_SUBS);
        if (r)
            state.subCategories = r
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .slice(0, MAX_LAYERS);
    }
    if (fields.includes("tags")) {
        const r = params.get(P_TAGS);
        if (r)
            state.tags = r
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
                .slice(0, MAX_LAYERS);
    }
    if (fields.includes("rating")) {
        const r = params.get(P_RATING);
        if (r) {
            const n = Number(r);
            if (!isNaN(n) && n > 0)
                state.rating = n;
        }
    }
    if (fields.includes("poi")) {
        const rawPoi = params.get(P_POI);
        if (rawPoi) {
            state.poi = rawPoi.slice(0, MAX_TEXT_LEN);
        }
    }
    if (fields.includes("theme")) {
        const rawTheme = params.get(P_THEME);
        if (rawTheme) {
            state.theme = rawTheme.slice(0, MAX_TEXT_LEN);
        }
    }
    return state;
}
// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Read and validate the current URL, returning the embedded map state or null.
 *
 * @security Parses URL parameters with numeric validation and length caps; rejects malicious input.
 *
 * @param config - Active permalink configuration.
 * @returns Parsed and validated state, or null if the URL carries no permalink data.
 */
function readUrl(config) {
    if (typeof window === "undefined")
        return null;
    const mode = config.mode ?? "hash";
    let params;
    if (mode === "query") {
        params = new URLSearchParams(window.location.search);
    }
    else {
        // "hash" and "compact" modes both use the fragment
        const hash = window.location.hash;
        if (!hash || hash === "#")
            return null;
        params = new URLSearchParams(hash.slice(1));
    }
    return _parseParams(params, config);
}
/**
 * Serialize a state object into a URL fragment or query string.
 *
 * When `mode` is `"compact"` *or* the verbose param string exceeds
 * {@link AUTO_COMPACT_THRESHOLD} chars, the state is base64-encoded instead.
 *
 * @param state - State to serialize. Uses current-map defaults if undefined.
 * @param config - Active permalink configuration.
 * @returns A full URL change string starting with `#` (hash) or `?` (query).
 */
function buildUrl(state, config) {
    if (!state)
        return "";
    const mode = config.mode ?? "hash";
    const fields = config.fields ?? [
        "lat",
        "lng",
        "zoom",
        "layers",
        "shownLayers",
        "filter",
        "categories",
        "subCategories",
        "tags",
        "rating",
        "poi",
        "theme",
    ];
    const params = new URLSearchParams();
    params.set(P_LAT, state.lat.toFixed(6));
    params.set(P_LNG, state.lng.toFixed(6));
    params.set(P_ZOOM, String(Math.round(state.zoom)));
    if (fields.includes("layers") && state.layers?.length) {
        params.set(P_LAYERS, state.layers.join(","));
    }
    if (fields.includes("shownLayers") && state.shownLayers?.length) {
        params.set(P_SHOWN, state.shownLayers.join(","));
    }
    if (fields.includes("filter") && state.filter) {
        params.set(P_FILTER, state.filter);
    }
    if (fields.includes("categories") && state.categories?.length) {
        params.set(P_CATS, state.categories.join(","));
    }
    if (fields.includes("subCategories") && state.subCategories?.length) {
        params.set(P_SUBS, state.subCategories.join(","));
    }
    if (fields.includes("tags") && state.tags?.length) {
        params.set(P_TAGS, state.tags.join(","));
    }
    if (fields.includes("rating") && state.rating && state.rating > 0) {
        params.set(P_RATING, String(state.rating));
    }
    if (fields.includes("poi") && state.poi) {
        params.set(P_POI, state.poi);
    }
    if (fields.includes("theme") && state.theme) {
        params.set(P_THEME, state.theme);
    }
    const paramStr = params.toString();
    // Auto-compact or explicit compact mode
    const shouldCompact = mode === "compact" || paramStr.length > AUTO_COMPACT_THRESHOLD;
    if (shouldCompact) {
        const compactParams = new URLSearchParams();
        compactParams.set(P_COMPACT, btoa(JSON.stringify(state)));
        const compactStr = compactParams.toString();
        return mode === "query" ? "?" + compactStr : "#" + compactStr;
    }
    return mode === "query" ? "?" + paramStr : "#" + paramStr;
}

/*!
 * GeoLeaf Core – Permalink / Deep Linking
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module permalink/permalink-manager
 *
 * @description
 * Core logic for URL Permalink / Deep Linking (§1.3).
 *
 * Responsibilities:
 *   - `readUrl(config)` — parse the current URL and return a `PermalinkState` (or null).
 *   - `buildUrl(state, config)` — serialize a state object to a URL fragment or query string.
 *   - `applyState(state, map)` — restore map view + layer visibility + active filter from state.
 *   - `startSync(map, config)` — attach map event listeners that write the URL on every move.
 *
 * Security:
 *   - All numeric values are passed through `validateNumber()` / `validateCoordinates()`.
 *   - Layer IDs are validated as non-empty strings, capped at 100 entries.
 *   - Filter text is capped at 200 characters.
 *   - No `innerHTML` usage — no XSS surface.
 *
 * URL formats (§1.3.1, §1.3.4):
 *   Hash (default): `#gl_lat=48.857&gl_lng=2.347&gl_zoom=12`
 *   Query:          `?gl_lat=48.857&gl_lng=2.347&gl_zoom=12`
 *   Compact:        `#gl=<base64(JSON)>`
 *   Auto-compact:   transparent fallback when hash exceeds 200 chars.
 *
 * @see permalink-api for the public facade
 * @see config-types for PermalinkConfig
 */
/**
 * Populates and reveals the floating pill search bar (`.gl-search-bar`) with the
 * text restored from a permalink — mirrors what the user sees after typing in the bar.
 */
function _restoreSearchBar(text) {
    if (!text)
        return;
    const bar = document.querySelector(".gl-search-bar");
    const input = bar?.querySelector(".gl-search-bar__input");
    if (!bar || !input)
        return;
    input.value = text;
    bar.style.display = "flex";
    requestAnimationFrame(() => {
        bar.classList.add("gl-is-visible");
    });
    const clearBtn = bar.querySelector(".gl-search-bar__clear");
    if (clearBtn)
        clearBtn.style.display = "flex";
    const searchBtn = document.querySelector('[data-gl-toolbar-action="search"]');
    if (searchBtn) {
        searchBtn.classList.add("gl-map-toolbar__btn--active");
        searchBtn.setAttribute("aria-expanded", "true");
    }
    const glMain = document.querySelector(".gl-main");
    if (glMain) {
        glMain.style.setProperty("--gl-search-bar-height", "46px");
        glMain.style.setProperty("--gl-search-bar-gap", "0.4rem");
    }
}
/** Debounce delay in ms for map move/zoom events. */
const SYNC_DEBOUNCE_MS = 400;
/**
 * Filter value pending programmatic restoration.
 * Kept alive until applyFiltersNow has run so that _captureState (which fires
 * on geoleaf:theme:applied, ~50 ms after _applyLayersAndFilter) can preserve
 * the gl_filter URL parameter even while the DOM input is still empty.
 */
let _pendingFilterRestore = null;
/**
 * Category / tag / rating state pending programmatic restoration.
 * Works like _pendingFilterRestore: kept alive during the T+30ms gap between
 * direct filterGeoJSONLayers call (T=0) and DOM checkbox hydration (T+30ms)
 * so _captureState can preserve gl_cats/gl_subs/gl_tags/gl_rating in the URL
 * even before the lazy accordion DOM is fully built.
 */
let _pendingCategoriesState = null;
// ── Helpers ───────────────────────────────────────────────────────────────────
function _debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        if (timer !== null)
            clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}
/**
 * Capture the current map state (centre, zoom, hidden layers, active filter).
 *
 * @param map - Map instance.
 * @param config - Active permalink configuration.
 * @returns Current serializable state.
 */
function _captureState(map, config) {
    const center = map.getCenter();
    const fields = config.fields ?? [
        "lat",
        "lng",
        "zoom",
        "layers",
        "shownLayers",
        "filter",
        "categories",
        "subCategories",
        "tags",
        "rating",
        "poi",
        "theme",
    ];
    const state = {
        lat: Math.round(center.lat * 1e6) / 1e6,
        lng: Math.round(center.lng * 1e6) / 1e6,
        zoom: Math.round(map.getZoom()),
    };
    if (fields.includes("layers")) {
        try {
            const hidden = [];
            GeoJSONShared.state.layers.forEach((layerData, layerId) => {
                // Use logicalState (user intent) not current (physical, overridable by zoom).
                // userOverride=true + logicalState=false means the user explicitly hid this layer.
                const meta = layerData._visibility;
                if (meta && meta.userOverride === true && meta.logicalState === false) {
                    hidden.push(layerId);
                }
            });
            if (hidden.length > 0) {
                state.layers = hidden;
            }
        }
        catch {
            // GeoJSONShared not yet initialised — omit layers field
        }
    }
    if (fields.includes("shownLayers")) {
        try {
            const shown = [];
            GeoJSONShared.state.layers.forEach((layerData, layerId) => {
                // userOverride=true + logicalState=true means the user explicitly showed this layer
                // beyond what the active theme displays.
                const meta = layerData._visibility;
                if (meta && meta.userOverride === true && meta.logicalState === true) {
                    shown.push(layerId);
                }
            });
            if (shown.length > 0) {
                state.shownLayers = shown;
            }
        }
        catch {
            // GeoJSONShared not yet initialised — omit shownLayers field
        }
    }
    if (fields.includes("filter")) {
        try {
            // Prefer reading from inside #gl-filter-panel (panel-scoped, avoids ghost inputs).
            const panel = document.getElementById("gl-filter-panel");
            const filterInput = panel?.querySelector('[data-gl-filter-id="searchText"] input[type="text"]') ?? null;
            const currentValue = filterInput?.value.trim() ?? "";
            // Fall back to _pendingFilterRestore while programmatic restoration is in flight
            // (applyFiltersNow runs async at +350 ms, so _captureState may fire first).
            const filterValue = currentValue.length > 0 ? currentValue : (_pendingFilterRestore ?? "");
            if (filterValue.length > 0) {
                state.filter = filterValue.slice(0, MAX_TEXT_LEN);
            }
        }
        catch {
            // No DOM (SSR / test context)
        }
    }
    if (fields.includes("categories") ||
        fields.includes("subCategories") ||
        fields.includes("tags") ||
        fields.includes("rating")) {
        try {
            const panel = document.getElementById("gl-filter-panel");
            if (panel) {
                if (fields.includes("categories")) {
                    const cats = [];
                    panel
                        .querySelectorAll("input.gl-filter-tree__checkbox--category:checked")
                        .forEach((el) => {
                        if (el.value)
                            cats.push(String(el.value));
                    });
                    if (cats.length > 0)
                        state.categories = cats;
                }
                if (fields.includes("subCategories")) {
                    const subs = [];
                    panel
                        .querySelectorAll("input.gl-filter-tree__checkbox--subcategory:checked")
                        .forEach((el) => {
                        const id = el.getAttribute("data-gl-filter-subcategory-id");
                        if (id)
                            subs.push(String(id));
                    });
                    if (subs.length > 0)
                        state.subCategories = subs;
                }
                if (fields.includes("tags")) {
                    const tags = [];
                    panel
                        .querySelectorAll(".gl-filter-panel__tag-badge.gl-is-selected")
                        .forEach((el) => {
                        const v = el.getAttribute("data-tag-value");
                        if (v)
                            tags.push(String(v));
                    });
                    if (tags.length > 0)
                        state.tags = tags;
                }
                if (fields.includes("rating")) {
                    const ri = panel.querySelector("[data-gl-filter-id='minRating'] input[type='range']");
                    if (ri && ri.value !== "") {
                        const val = parseFloat(ri.value);
                        if (!isNaN(val) && val > 0)
                            state.rating = val;
                    }
                }
                // Fallback: during the T+30ms async restore window the DOM checkboxes
                // have not yet been hydrated — preserve the pending URL values so the
                // URL is not wiped by writeOnTheme firing at T+50ms.
                if (!state.categories?.length && _pendingCategoriesState?.categories?.length) {
                    state.categories = _pendingCategoriesState.categories;
                }
                if (!state.subCategories?.length &&
                    _pendingCategoriesState?.subCategories?.length) {
                    state.subCategories = _pendingCategoriesState.subCategories;
                }
                if (!state.tags?.length && _pendingCategoriesState?.tags?.length) {
                    state.tags = _pendingCategoriesState.tags;
                }
                if (state.rating === undefined && _pendingCategoriesState?.rating) {
                    state.rating = _pendingCategoriesState.rating;
                }
            }
        }
        catch {
            // No DOM (SSR / test context)
        }
    }
    if (fields.includes("theme")) {
        try {
            const themeId = globalThis.GeoLeaf?.ThemeSelector?.getCurrentTheme?.();
            if (typeof themeId === "string" && themeId.length > 0) {
                state.theme = themeId;
            }
        }
        catch {
            // ThemeSelector not available
        }
    }
    return state;
}
/**
 * Apply a permalink state to the map and UI.
 *
 * Map view is applied immediately (synchronous).
 * If a theme needs to be restored, it is applied once `geoleaf:themes:ready` fires,
 * then layer visibility and filter are applied after the resulting `geoleaf:theme:applied`.
 * Without a theme change, layers and filter are deferred to the first `geoleaf:theme:applied`.
 *
 * @param state - State to restore.
 * @param map - Map instance.
 */
function applyState(state, map) {
    // Immediate: restore map view
    map.setView({ lat: state.lat, lng: state.lng }, state.zoom);
    if (typeof document === "undefined")
        return;
    const hasLayers = !!(state.layers && state.layers.length > 0);
    const hasShownLayers = !!(state.shownLayers && state.shownLayers.length > 0);
    const hasFilter = typeof state.filter === "string";
    const hasCategories = !!(state.categories?.length || state.subCategories?.length);
    const hasTags = !!state.tags?.length;
    const hasRating = typeof state.rating === "number" && state.rating > 0;
    const hasTheme = typeof state.theme === "string" && state.theme.length > 0;
    const hasDeferred = hasLayers ||
        hasShownLayers ||
        hasFilter ||
        hasCategories ||
        hasTags ||
        hasRating ||
        hasTheme;
    if (!hasDeferred)
        return;
    function _applyLayersAndFilter() {
        if (hasLayers) {
            for (const layerId of state.layers) {
                try {
                    VisibilityManager.setVisibility(layerId, false, "user");
                }
                catch {
                    // Layer may not exist in this profile
                }
            }
        }
        if (hasShownLayers) {
            for (const layerId of state.shownLayers) {
                try {
                    VisibilityManager.setVisibility(layerId, true, "user");
                }
                catch {
                    // Layer may not exist in this profile
                }
            }
        }
        if (hasFilter && !hasCategories && !hasTags && !hasRating) {
            // _pendingFilterRestore protects gl_filter in the URL: writeOnTheme (~50 ms) calls
            // _captureState before the DOM input is populated — this fallback value keeps the
            // parameter alive until the filter is actually applied.
            _pendingFilterRestore = state.filter;
            try {
                const panel = document.getElementById("gl-filter-panel");
                if (panel) {
                    // filter-panel-renderer-core.ts L69 intentionally skips type="search" controls:
                    //   `if (filterDef.type === "search") return;`
                    // So [data-gl-filter-id="searchText"] does NOT exist in the panel DOM on a fresh
                    // page load. Replicate ensureSearchGhostInput() (mobile-toolbar-searchbar.ts):
                    // inject a hidden wrapper that readFiltersFromPanel() will find via its selector.
                    let filterInput = panel.querySelector('[data-gl-filter-id="searchText"] input[type="text"]');
                    if (!filterInput) {
                        const ghost = document.createElement("div");
                        ghost.setAttribute("data-gl-filter-id", "searchText");
                        ghost.style.cssText = "display:none;position:absolute;visibility:hidden";
                        filterInput = document.createElement("input");
                        filterInput.type = "text";
                        ghost.appendChild(filterInput);
                        panel.appendChild(ghost);
                    }
                    filterInput.value = state.filter;
                    _restoreSearchBar(state.filter);
                    // geoleaf:theme:applied fires AFTER _loadLayersInBatches resolves — all GeoJSON
                    // features are already rendered. Call _applyFiltersImmediate directly to bypass
                    // the 300ms internal debounce of applyFiltersNow → filter applied synchronously
                    // with zero delay, eliminating the flash where all features are briefly visible.
                    try {
                        const gl = globalThis.GeoLeaf;
                        if (gl?._UIFilterPanelApplier?._applyFiltersImmediate) {
                            gl._UIFilterPanelApplier._applyFiltersImmediate(panel, false);
                        }
                        else if (gl?._UIFilterPanelApplier?.applyFiltersNow) {
                            gl._UIFilterPanelApplier.applyFiltersNow(panel);
                        }
                    }
                    catch {
                        // Silent
                    }
                    finally {
                        _pendingFilterRestore = null;
                    }
                }
                else {
                    // Panel not in DOM yet — clear pending after a safe delay.
                    setTimeout(() => {
                        _pendingFilterRestore = null;
                    }, 1000);
                }
            }
            catch {
                _pendingFilterRestore = null;
            }
        }
        if (hasCategories || hasTags || hasRating) {
            // The category tree and tag badges are lazy-rendered — their DOM does not exist until
            // the user first opens the accordion. Calling `_applyFiltersImmediate` after a T+30ms
            // async gap caused a visible flash: features briefly appeared unfiltered because
            // `readFiltersFromPanel` read empty DOM and cleared the filter state applied earlier.
            //
            // Solution — ghost elements injected synchronously at T=0:
            //   Inject hidden `<input type="checkbox" checked>` and `<span.tag-badge.gl-is-selected>`
            //   into the panel. `_applyFiltersImmediate` picks them up via querySelectorAll and
            //   applies the correct filter at T=0 — zero flash, no async delay.
            //
            //   T+15ms: remove ghost nodes, hydrate real accordion DOM (visual feedback only),
            //   dispatch `geoleaf:filters:applied` so `writeOnFilter` captures the real state.
            //   Do NOT call `_applyFiltersImmediate` here: it has a 100ms rate-limiter and
            //   T+15ms < 100ms — we rely on the ghost-based T=0 call instead.
            //
            //   T+100ms: clear `_pendingCategoriesState` (after all debounced URL writes settle).
            const gl = globalThis.GeoLeaf;
            const applier = gl?._UIFilterPanelApplier;
            _pendingCategoriesState = {
                categories: state.categories,
                subCategories: state.subCategories,
                tags: state.tags,
                rating: state.rating,
            };
            if (hasFilter) {
                _pendingFilterRestore = state.filter;
            }
            try {
                const panel = document.getElementById("gl-filter-panel");
                if (panel) {
                    // Build a single hidden container with all ghost elements
                    const ghost = document.createElement("div");
                    ghost.setAttribute("data-gl-permalink-cat-ghost", "1");
                    ghost.style.cssText =
                        "display:none;position:absolute;visibility:hidden;pointer-events:none";
                    state.categories?.forEach((catId) => {
                        const cb = document.createElement("input");
                        cb.type = "checkbox";
                        cb.className = "gl-filter-tree__checkbox--category";
                        cb.value = catId;
                        cb.checked = true;
                        ghost.appendChild(cb);
                    });
                    state.subCategories?.forEach((subId) => {
                        const cb = document.createElement("input");
                        cb.type = "checkbox";
                        cb.className = "gl-filter-tree__checkbox--subcategory";
                        cb.setAttribute("data-gl-filter-subcategory-id", subId);
                        cb.checked = true;
                        ghost.appendChild(cb);
                    });
                    if (hasTags) {
                        // The panel already has a real [data-gl-filter-id='tags']
                        // .gl-filter-panel__tags-container in the initial HTML (present but
                        // empty — badges are only populated after POI data loads).
                        // querySelector always returns that real container first, so a
                        // duplicate wrapper inside the ghost div is silently ignored.
                        // Fix: inject ghost badges directly into the real container, marked
                        // with data-gl-permalink-ghost for removal at T+15ms.
                        const realTagsContainer = panel.querySelector("[data-gl-filter-id='tags'] .gl-filter-panel__tags-container");
                        if (realTagsContainer) {
                            state.tags.forEach((tag) => {
                                const badge = document.createElement("span");
                                badge.className = "gl-filter-panel__tag-badge gl-is-selected";
                                badge.setAttribute("data-tag-value", tag);
                                badge.setAttribute("data-gl-permalink-ghost", "1");
                                realTagsContainer.appendChild(badge);
                            });
                        }
                        else {
                            // Fallback: real container absent — legacy wrapper in ghost div
                            const tw = document.createElement("div");
                            tw.setAttribute("data-gl-filter-id", "tags");
                            const tc = document.createElement("div");
                            tc.className = "gl-filter-panel__tags-container";
                            state.tags.forEach((tag) => {
                                const badge = document.createElement("span");
                                badge.className = "gl-filter-panel__tag-badge gl-is-selected";
                                badge.setAttribute("data-tag-value", tag);
                                tc.appendChild(badge);
                            });
                            tw.appendChild(tc);
                            ghost.appendChild(tw);
                        }
                    }
                    if (hasRating) {
                        const rw = document.createElement("div");
                        rw.setAttribute("data-gl-filter-id", "minRating");
                        const ri = document.createElement("input");
                        ri.type = "range";
                        ri.value = String(state.rating);
                        rw.appendChild(ri);
                        ghost.appendChild(rw);
                    }
                    panel.appendChild(ghost);
                    // Ghost searchText input for combined text+category permalink
                    if (hasFilter) {
                        let filterInput = panel.querySelector('[data-gl-filter-id="searchText"] input[type="text"]');
                        if (!filterInput) {
                            const sw = document.createElement("div");
                            sw.setAttribute("data-gl-filter-id", "searchText");
                            sw.style.cssText = "display:none;position:absolute;visibility:hidden";
                            filterInput = document.createElement("input");
                            filterInput.type = "text";
                            sw.appendChild(filterInput);
                            panel.appendChild(sw);
                        }
                        filterInput.value = state.filter;
                    }
                    // T=0 — apply immediately using ghost elements → zero flash
                    if (applier?._applyFiltersImmediate) {
                        applier._applyFiltersImmediate(panel, false);
                    }
                    else if (applier?.applyFiltersNow) {
                        applier.applyFiltersNow(panel);
                    }
                    // T+15ms — remove ghost, hydrate real accordion DOM for visual feedback
                    const accordionApi = gl?._UIFilterPanelAccordion;
                    panel.querySelectorAll("[data-accordion-for]").forEach((group) => {
                        if (group.dataset.lazyLoaded !== "true" &&
                            group.querySelector("[data-lazy-type]")) {
                            accordionApi?.loadAccordionContentIfNeeded?.(group, null);
                        }
                    });
                    setTimeout(() => {
                        try {
                            // Remove ghost container and ghost badges injected into real container
                            panel.querySelector("[data-gl-permalink-cat-ghost]")?.remove();
                            panel
                                .querySelectorAll("[data-gl-permalink-ghost]")
                                .forEach((el) => el.remove());
                            state.categories?.forEach((id) => {
                                const cb = panel.querySelector(`input.gl-filter-tree__checkbox--category[value="${CSS.escape(id)}"]`);
                                if (cb)
                                    cb.checked = true;
                            });
                            state.subCategories?.forEach((id) => {
                                const cb = panel.querySelector(`input.gl-filter-tree__checkbox--subcategory[data-gl-filter-subcategory-id="${CSS.escape(id)}"]`);
                                if (cb)
                                    cb.checked = true;
                            });
                            // Hydrate real tag badges (populated by now after POI load)
                            state.tags?.forEach((tag) => {
                                panel
                                    .querySelectorAll(`.gl-filter-panel__tag-badge[data-tag-value="${CSS.escape(tag)}"]`)
                                    .forEach((badge) => badge.classList.add("gl-is-selected"));
                            });
                            if (hasRating) {
                                const ri = panel.querySelector("[data-gl-filter-id='minRating'] input[type='range']");
                                if (ri) {
                                    ri.value = String(state.rating);
                                    ri.dispatchEvent(new Event("input", { bubbles: true }));
                                }
                            }
                            // DO NOT call _applyFiltersImmediate here — it has a 100ms rate-limiter
                            // and we are at T+15ms (< 100ms since T=0 call). Real DOM hydration is
                            // for visual feedback only; dispatch event for URL sync.
                            if (hasFilter)
                                _restoreSearchBar(state.filter);
                            document.dispatchEvent(new CustomEvent("geoleaf:filters:applied"));
                        }
                        catch {
                            // Silent
                        }
                    }, 15);
                    // T+100ms — clear pending state after all debounced URL writes have settled
                    setTimeout(() => {
                        _pendingCategoriesState = null;
                        _pendingFilterRestore = null;
                    }, 100);
                }
                else {
                    // Panel not yet in DOM — direct filter via applier internals (no ghost needed)
                    try {
                        const builtState = {
                            categoriesTree: state.categories ?? [],
                            subCategoriesTree: state.subCategories ?? [],
                            selectedTags: state.tags ?? [],
                            minRating: state.rating ?? 0,
                            hasMinRating: hasRating,
                            hasTags: hasTags,
                            dataTypes: { poi: true, routes: true },
                            searchText: state.filter ?? "",
                            hasSearchText: !!state.filter?.length,
                            proximity: { active: false, center: null, radius: 10 },
                        };
                        applier?.filterGeoJSONLayers?.(builtState);
                        const basePois = gl?._UIFilterPanelShared?.getBasePois?.() ?? [];
                        if (basePois.length) {
                            const filtered = applier?.filterPoiList?.(basePois, builtState);
                            if (filtered)
                                applier?.refreshPoiLayer?.(filtered);
                        }
                        document.dispatchEvent(new CustomEvent("geoleaf:filters:applied"));
                        if (hasFilter)
                            setTimeout(() => _restoreSearchBar(state.filter), 200);
                    }
                    catch {
                        // Silent
                    }
                    setTimeout(() => {
                        _pendingCategoriesState = null;
                        if (hasFilter)
                            _pendingFilterRestore = null;
                    }, 1000);
                }
            }
            catch {
                _pendingCategoriesState = null;
                _pendingFilterRestore = null;
            }
        }
    }
    if (hasTheme) {
        // Wait for ThemeSelector to finish its initial load, then switch theme if needed.
        // geoleaf:themes:ready fires once, after the default theme:applied.
        document.addEventListener("geoleaf:themes:ready", function () {
            const gl = globalThis.GeoLeaf;
            const currentTheme = gl?.ThemeSelector?.getCurrentTheme?.();
            if (state.theme && currentTheme !== state.theme && gl?.ThemeSelector?.setTheme) {
                // Register layers/filter restore to fire after the next theme:applied
                document.addEventListener("geoleaf:theme:applied", _applyLayersAndFilter, {
                    once: true,
                });
                gl.ThemeSelector.setTheme(state.theme).catch(() => {
                    // setTheme() failed — theme:applied may never fire; apply directly
                    document.removeEventListener("geoleaf:theme:applied", _applyLayersAndFilter);
                    _applyLayersAndFilter();
                });
            }
            else {
                // Correct theme already active — layers are loaded, apply immediately
                _applyLayersAndFilter();
            }
        }, { once: true });
    }
    else {
        // No theme change — defer layers/filter to the first theme:applied
        document.addEventListener("geoleaf:theme:applied", _applyLayersAndFilter, { once: true });
    }
}
/**
 * Start URL synchronisation: listen to map `moveend` and write the URL.
 *
 * Uses `history.replaceState()` only — no browser history entry is created.
 * The write is debounced by {@link SYNC_DEBOUNCE_MS} ms.
 *
 * @param map - Map instance.
 * @param config - Active permalink configuration.
 */
function startSync(map, config) {
    function _doWrite() {
        try {
            const state = _captureState(map, config);
            const fragment = buildUrl(state, config);
            if (!fragment)
                return;
            const mode = config.mode ?? "hash";
            if (mode === "query") {
                history.replaceState(null, "", window.location.pathname + fragment + window.location.hash);
            }
            else {
                history.replaceState(null, "", window.location.pathname + window.location.search + fragment);
            }
        }
        catch {
            // Silently ignore — history API may be unavailable (e.g. file:// protocol)
        }
    }
    // Map pan/zoom — debounced at 400 ms to avoid excessive writes while dragging.
    const writeOnMove = _debounce(_doWrite, SYNC_DEBOUNCE_MS);
    map.on("moveend", writeOnMove);
    if (typeof document !== "undefined") {
        // Layer visibility toggled by the user — use a very short debounce (50 ms) so the
        // URL reflects the new state almost immediately and is never cancelled by a concurrent
        // moveend event firing within the 400 ms window.
        const writeOnVisibility = _debounce(_doWrite, 50);
        document.addEventListener("geoleaf:geojson:visibility-changed", writeOnVisibility);
        // Filter changes and theme switches — short debounce too (they batch quickly).
        const writeOnFilter = _debounce(_doWrite, 50);
        document.addEventListener("geoleaf:filters:applied", writeOnFilter);
        const writeOnTheme = _debounce(_doWrite, 50);
        document.addEventListener("geoleaf:theme:applied", writeOnTheme);
    }
}

/*!
 * GeoLeaf Core – Permalink / Deep Linking — Internal Facade
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module permalink/permalink-api
 *
 * @description
 * Stateful internal facade for the Permalink module.
 *
 * Wraps the stateless functions from `permalink-manager.ts` with a module-level
 * config and stored-state slot, matching the lifecycle used by all GeoLeaf modules:
 *   1. `init(config)`         — called once by initApp before map creation.
 *   2. `readAndStore()`       — parses the current URL; result cached in `_storedState`.
 *   3. `applyStoredState(map)` — restores the view after map + modules are ready.
 *   4. `startSync(map)`       — begins continuous URL synchronisation.
 *
 * Additional helpers:
 *   - `getState()` — returns the last captured / restored state (read-only snapshot).
 *   - `buildUrl(state?)` — serialises a state object (or the current stored state).
 *   - `reset()` — clears config and stored state (used by tests).
 *
 * @see permalink-manager for the underlying stateless logic
 * @see geoleaf.permalink for the public GeoLeaf.Permalink facade
 */
let _config = {};
let _storedState = null;
/**
 * Public Permalink facade — bound to `GeoLeaf.Permalink`.
 */
const Permalink = {
    /**
     * Initialise the Permalink module with the config extracted from the active profile.
     * Must be called before `readAndStore()`.
     *
     * @param config - Permalink section of `ui.permalink` or an empty object.
     */
    init(config) {
        _config = config ?? {};
    },
    /**
     * Read the current URL and cache the parsed state.
     * Call this **before** map creation so the stored state is available for `applyStoredState`.
     */
    readAndStore() {
        _storedState = readUrl(_config);
    },
    /**
     * Apply the stored state (from `readAndStore`) to the given map instance.
     * Must be called **after** the map and all modules are initialised.
     *
     * @param map - MapLibre map instance.
     */
    applyStoredState(map) {
        if (_storedState) {
            applyState(_storedState, map);
        }
    },
    /**
     * Begin continuous URL synchronisation on map move/zoom events.
     * Call this **after** `applyStoredState` to avoid overwriting the restored state.
     *
     * @param map - MapLibre map instance.
     */
    startSync(map) {
        startSync(map, _config);
    },
    /**
     * Return the currently cached permalink state (read-only).
     * Returns null if `readAndStore` was not called or found no permalink in the URL.
     */
    getState() {
        return _storedState;
    },
    /**
     * Serialise `state` (or the cached stored state) to a URL fragment / query string.
     *
     * @param state - Optional explicit state. Falls back to `_storedState`.
     * @returns URL string starting with `#` or `?`, or empty string if no state.
     */
    buildUrl(state) {
        return buildUrl(state ?? _storedState, _config);
    },
    /**
     * Reset internal state.
     * Intended for use in test environments only.
     * @internal
     */
    _reset() {
        _config = {};
        _storedState = null;
    },
};

/*!
 * GeoLeaf Core – Events / Public Facade
 * © 2026 Mattieu Pottier — MIT License
 */
/**
 * Public GeoLeaf Events API.
 * Exposed as `GeoLeaf.events`.
 */
const Events = {
    /**
     * Registers a listener for a GeoLeaf event.
     * The listener is called every time the event fires until `off()` is called.
     *
     * @param event - Event name (see module docs for full reference).
     * @param handler - Callback receiving the `CustomEvent` with typed `detail`.
     */
    on(event, handler) {
        if (typeof document === "undefined")
            return;
        document.addEventListener(event, handler);
    },
    /**
     * Removes a previously registered listener.
     * The exact same `handler` reference must be passed.
     *
     * @param event - Event name.
     * @param handler - The handler reference originally passed to `on()`.
     */
    off(event, handler) {
        if (typeof document === "undefined")
            return;
        document.removeEventListener(event, handler);
    },
    /**
     * Registers a listener that fires **once** then automatically removes itself.
     * Uses the native `{once: true}` option — no wrapper function needed.
     *
     * @param event - Event name.
     * @param handler - Callback called at most once.
     */
    once(event, handler) {
        if (typeof document === "undefined")
            return;
        document.addEventListener(event, handler, { once: true });
    },
};

/*!
 * GeoLeaf Core – Geocoding / Providers
 * © 2026 Mattieu Pottier — MIT License
 * https://geoleaf.dev
 */
// ── Addok BAN (data.gouv.fr) ──────────────────────────────────────────────────
/**
 * Addok BAN provider — French national address database.
 * Free, no API key required, no quota for reasonable traffic.
 * @see https://adresse.data.gouv.fr/api-doc/adresse
 */
class AddokProvider {
    async search(query, limit) {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}` +
            `&limit=${limit}`;
        return _fetchAndParseGeoJSON(url);
    }
}
// ── Nominatim (OpenStreetMap) ─────────────────────────────────────────────────
/**
 * Nominatim provider — OpenStreetMap geocoder. Worldwide coverage.
 * Must comply with OSM Nominatim usage policy: max 1 request/second.
 * @see https://nominatim.org/release-docs/latest/api/Search/
 */
class NominatimProvider {
    async search(query, limit) {
        const lang = (typeof navigator !== "undefined" ? navigator.language : "fr") ?? "fr";
        const url = `https://nominatim.openstreetmap.org/search` +
            `?q=${encodeURIComponent(query)}&format=geocodejson&limit=${limit}&addressdetails=1`;
        try {
            const res = await fetch(url, {
                headers: {
                    "Accept-Language": lang,
                    "User-Agent": "GeoLeaf/2 (https://geoleaf.dev)",
                },
            });
            if (!res.ok)
                return [];
            return _parseGeoJSON(await res.json());
        }
        catch {
            return [];
        }
    }
}
// ── Photon (Komoot) ───────────────────────────────────────────────────────────
/**
 * Photon provider — worldwide geocoder by Komoot. No API key required.
 * @see https://photon.komoot.io/
 */
class PhotonProvider {
    async search(query, limit) {
        const lang = (typeof navigator !== "undefined" ? navigator.language : "fr")
            ?.slice(0, 2)
            .toLowerCase() ?? "fr";
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}` +
            `&limit=${limit}&lang=${encodeURIComponent(lang)}`;
        return _fetchAndParseGeoJSON(url);
    }
}
// ── Custom URL provider ───────────────────────────────────────────────────────
/**
 * Custom HTTPS endpoint provider.
 * The URL must return a GeoJSON FeatureCollection when called with `?q=` and `?limit=`.
 */
class CustomProvider {
    _baseUrl;
    constructor(_baseUrl) {
        this._baseUrl = _baseUrl;
    }
    async search(query, limit) {
        const separator = this._baseUrl.includes("?") ? "&" : "?";
        const url = `${this._baseUrl}${separator}q=${encodeURIComponent(query)}&limit=${limit}`;
        return _fetchAndParseGeoJSON(url);
    }
}
// ── Factory ───────────────────────────────────────────────────────────────────
/**
 * Creates the appropriate provider from a `GeocodingConfig`.
 * Defaults to `AddokProvider` for an unknown or missing provider value.
 * @internal
 */
function createProvider(config) {
    const provider = config.provider ?? "addok";
    switch (provider) {
        case "addok":
            return new AddokProvider();
        case "nominatim":
            return new NominatimProvider();
        case "photon":
            return new PhotonProvider();
        default:
            // Custom HTTPS URL — validate scheme before accepting
            if (typeof provider === "string" && provider.startsWith("https://")) {
                return new CustomProvider(provider);
            }
            // Unknown / unsafe value: fall back to Addok
            return new AddokProvider();
    }
}
// ── Shared fetch + parse helpers ──────────────────────────────────────────────
/**
 * Fetches `url` and delegates to `_parseGeoJSON`.
 * Returns an empty array on any network or parsing error.
 * @internal
 */
async function _fetchAndParseGeoJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok)
            return [];
        return _parseGeoJSON(await res.json());
    }
    catch {
        return [];
    }
}
/**
 * Normalizes a GeoJSON FeatureCollection from any supported provider
 * into a flat `GeocodingResult[]`.
 *
 * Security notes:
 * - All string values are coerced via `String()` — no dynamic property injection.
 * - Labels are length-capped at 200 characters to prevent oversized strings.
 * - `lat` / `lng` are validated with `isFinite` before inclusion.
 * - The raw feature is stored as-is but never rendered directly.
 * @internal
 */
function _parseGeoJSON(data) {
    if (!data || typeof data !== "object")
        return [];
    const fc = data;
    if (!Array.isArray(fc["features"]))
        return [];
    const results = [];
    for (const feature of fc["features"]) {
        const f = feature;
        if (f["type"] !== "Feature")
            continue;
        const geometry = f["geometry"];
        const properties = f["properties"];
        const coords = geometry?.["coordinates"];
        if (!Array.isArray(coords) || coords.length < 2)
            continue;
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);
        if (!isFinite(lat) || !isFinite(lng))
            continue;
        // Build label — textContent only, never rendered as HTML
        const rawLabel = properties?.["label"] ??
            properties?.["display_name"] ??
            properties?.["name"] ??
            `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const label = String(rawLabel).slice(0, 200);
        const result = { label, lat, lng, raw: feature };
        // Optional bounding box for broad results (cities, departments, etc.)
        const bbox = f["bbox"];
        if (Array.isArray(bbox) && bbox.length === 4) {
            const [west, south, east, north] = bbox.map(Number);
            if ([west, south, east, north].every(isFinite)) {
                result.bounds = { north, south, east, west };
            }
        }
        results.push(result);
    }
    return results;
}

/*!
 * GeoLeaf Core – Geocoding / DOM Control
 * © 2026 Mattieu Pottier — MIT License
 * https://geoleaf.dev
 */
/**
 * Builds and mounts the geocoding search control into a map container.
 *
 * @param mapContainer - The HTMLElement returned by `adapter.getContainer()`.
 * @param provider     - Active geocoding provider instance.
 * @param config       - Geocoding configuration from profile.
 * @param onSelect     - Callback invoked when the user selects a result.
 * @returns A `destroy` function that removes the widget and its listeners.
 */
function mountGeocodingControl(mapContainer, provider, config, onSelect) {
    const debounceMs = config.debounceMs ?? 300;
    const minChars = config.minChars ?? 3;
    const limit = config.resultLimit ?? 5;
    const placeholder = config.placeholder ?? "Rechercher une adresse\u2026";
    const position = config.position ?? "top-right";
    // ── DOM construction ──────────────────────────────────────────────────────
    const wrapper = document.createElement("div");
    wrapper.className = `gl-geocoding-ctrl gl-geocoding-ctrl--${position}`;
    wrapper.setAttribute("role", "search");
    wrapper.setAttribute("aria-label", "Recherche d\u2019adresse");
    const input = document.createElement("input");
    input.type = "search";
    input.className = "gl-geocoding-input";
    input.placeholder = placeholder;
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("aria-label", placeholder);
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-haspopup", "listbox");
    input.setAttribute("aria-owns", "gl-geocoding-results");
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "gl-geocoding-clear";
    clearBtn.setAttribute("aria-label", "Effacer la recherche");
    clearBtn.textContent = "\u00d7"; // ×
    clearBtn.hidden = true;
    const resultsList = document.createElement("ul");
    resultsList.className = "gl-geocoding-results";
    resultsList.id = "gl-geocoding-results";
    resultsList.setAttribute("role", "listbox");
    resultsList.hidden = true;
    wrapper.appendChild(input);
    wrapper.appendChild(clearBtn);
    wrapper.appendChild(resultsList);
    mapContainer.appendChild(wrapper);
    // ── Internal state ────────────────────────────────────────────────────────
    let _debounceTimer = null;
    let _currentResults = [];
    // ── Private helpers ───────────────────────────────────────────────────────
    function _showResults(results) {
        _currentResults = results;
        // Clear previous items — textContent will be used for each new item (no XSS risk)
        resultsList.innerHTML = "";
        resultsList.hidden = results.length === 0;
        input.setAttribute("aria-expanded", results.length > 0 ? "true" : "false");
        results.forEach((result, idx) => {
            const li = document.createElement("li");
            li.className = "gl-geocoding-result-item";
            li.setAttribute("role", "option");
            li.setAttribute("aria-selected", "false");
            li.setAttribute("data-idx", String(idx));
            li.textContent = result.label; // safe — textContent, not innerHTML
            resultsList.appendChild(li);
        });
    }
    function _clearResults() {
        _currentResults = [];
        resultsList.innerHTML = "";
        resultsList.hidden = true;
        input.setAttribute("aria-expanded", "false");
    }
    function _clear() {
        input.value = "";
        clearBtn.hidden = true;
        _clearResults();
        input.focus();
    }
    async function _doSearch(query) {
        wrapper.classList.add("gl-geocoding-ctrl--loading");
        try {
            const results = await provider.search(query, limit);
            // Discard stale responses if the input changed while fetching
            if (input.value.trim() === query) {
                _showResults(results);
            }
        }
        finally {
            wrapper.classList.remove("gl-geocoding-ctrl--loading");
        }
    }
    function _onInput() {
        const query = input.value.trim();
        clearBtn.hidden = query.length === 0;
        if (_debounceTimer !== null)
            clearTimeout(_debounceTimer);
        if (query.length < minChars) {
            _clearResults();
            return;
        }
        _debounceTimer = setTimeout(() => void _doSearch(query), debounceMs);
    }
    function _onResultClick(e) {
        const target = e.target.closest("[data-idx]");
        if (!target)
            return;
        const idx = Number(target.getAttribute("data-idx"));
        const result = _currentResults[idx];
        if (!result)
            return;
        input.value = result.label;
        clearBtn.hidden = false;
        _clearResults();
        onSelect(result);
    }
    function _onKeyDown(e) {
        if (e.key === "Escape") {
            _clear();
            return;
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            const items = resultsList.querySelectorAll(".gl-geocoding-result-item");
            if (items.length === 0)
                return;
            e.preventDefault();
            const current = resultsList.querySelector("[aria-selected='true']");
            let nextIdx = 0;
            if (current) {
                const currentIdx = Number(current.getAttribute("data-idx"));
                nextIdx =
                    e.key === "ArrowDown"
                        ? Math.min(currentIdx + 1, items.length - 1)
                        : Math.max(currentIdx - 1, 0);
                current.setAttribute("aria-selected", "false");
            }
            else if (e.key === "ArrowUp") {
                nextIdx = items.length - 1;
            }
            items[nextIdx].setAttribute("aria-selected", "true");
            items[nextIdx].scrollIntoView?.({ block: "nearest" });
            return;
        }
        if (e.key === "Enter") {
            const selected = resultsList.querySelector("[aria-selected='true']");
            // Click fires _onResultClick which handles selection
            selected?.click();
        }
    }
    function _onDocumentClick(e) {
        if (!wrapper.contains(e.target)) {
            _clearResults();
        }
    }
    /** Stops event propagation to prevent map pan/zoom while interacting. */
    function _stopProp(e) {
        e.stopPropagation();
    }
    // ── Event listeners ───────────────────────────────────────────────────────
    input.addEventListener("input", _onInput);
    input.addEventListener("keydown", _onKeyDown);
    clearBtn.addEventListener("click", _clear);
    resultsList.addEventListener("click", _onResultClick);
    document.addEventListener("click", _onDocumentClick);
    // Prevent map interactions when user is engaging with the geocoding widget
    wrapper.addEventListener("mousedown", _stopProp);
    wrapper.addEventListener("touchstart", _stopProp, { passive: true });
    wrapper.addEventListener("dblclick", _stopProp);
    wrapper.addEventListener("wheel", _stopProp, { passive: false });
    // ── Destroy / cleanup ─────────────────────────────────────────────────────
    return function destroy() {
        if (_debounceTimer !== null) {
            clearTimeout(_debounceTimer);
        }
        input.removeEventListener("input", _onInput);
        input.removeEventListener("keydown", _onKeyDown);
        clearBtn.removeEventListener("click", _clear);
        resultsList.removeEventListener("click", _onResultClick);
        document.removeEventListener("click", _onDocumentClick);
        wrapper.removeEventListener("mousedown", _stopProp);
        wrapper.removeEventListener("touchstart", _stopProp);
        wrapper.removeEventListener("dblclick", _stopProp);
        wrapper.removeEventListener("wheel", _stopProp);
        wrapper.remove();
    };
}

/*!
 * GeoLeaf Core – Geocoding / Registry
 * © 2026 Mattieu Pottier — MIT License
 * https://geoleaf.dev
 */
const _g$4 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
// ── Module-level state ────────────────────────────────────────────────────────
let _initialized = false;
let _destroyControl = null;
// ── Private helpers ───────────────────────────────────────────────────────────
/**
 * Reads the `geocodingConfig` block from the active profile.
 * Returns an empty object when config is unavailable.
 * @internal
 */
function _getConfig() {
    try {
        const profile = _g$4.GeoLeaf?.Config?.getActiveProfile?.();
        return profile?.["geocodingConfig"] ?? {};
    }
    catch {
        return {};
    }
}
/**
 * Dispatches `geoleaf:geocoding:result` on `document`.
 * Payload matches `GeocodingResult` minus the `raw` field.
 * @internal
 */
function _dispatchResult(result) {
    document.dispatchEvent(new CustomEvent("geoleaf:geocoding:result", {
        bubbles: true,
        detail: {
            label: result.label,
            lat: result.lat,
            lng: result.lng,
            bounds: result.bounds ?? null,
        },
    }));
}
/**
 * Handles a user-selected result: navigates the map and dispatches the event.
 * Uses `fitBounds` when the result has a bounding box, `flyTo` otherwise.
 * @internal
 */
function _onSelect(result, flyToZoom) {
    const adapter = _g$4.GeoLeaf?.getMap?.();
    if (adapter) {
        if (result.bounds) {
            adapter.fitBounds({
                north: result.bounds.north,
                south: result.bounds.south,
                east: result.bounds.east,
                west: result.bounds.west,
            }, { padding: { x: 40, y: 40 }, animate: true });
        }
        else {
            adapter.flyTo({ lat: result.lat, lng: result.lng }, flyToZoom);
        }
    }
    _dispatchResult(result);
}
/**
 * Mounts the geocoding control when the map is ready.
 * Only runs when `geocodingConfig.enabled` is true.
 * @internal
 */
function _onMapReady() {
    const config = _getConfig();
    if (!config.enabled)
        return;
    const adapter = _g$4.GeoLeaf?.getMap?.();
    const container = adapter?.getContainer?.() ?? null;
    if (!container)
        return;
    // Tear down any previously mounted control (e.g. after config reload)
    _destroyControl?.();
    const provider = createProvider(config);
    const flyToZoom = config.flyToZoom ?? 15;
    _destroyControl = mountGeocodingControl(container, provider, config, (result) => {
        _onSelect(result, flyToZoom);
    });
}
// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Singleton Geocoding registry.
 * Exposed through the `Geocoding` facade (`geoleaf.geocoding.ts`).
 */
const GeocodingRegistry = {
    /**
     * Subscribes to `geoleaf:map:ready` and prepares the control.
     * Idempotent — safe to call multiple times.
     */
    init() {
        if (_initialized)
            return;
        _initialized = true;
        document.addEventListener("geoleaf:map:ready", _onMapReady);
    },
    /**
     * Returns `true` when `geocodingConfig.enabled` is set in the active profile.
     */
    isEnabled() {
        return _getConfig().enabled === true;
    },
    /**
     * Programmatically performs an address search without requiring the UI control.
     * Useful for scripts or integration tests.
     *
     * @param query - Address or place name to search.
     * @param limit - Maximum number of results. Defaults to `geocodingConfig.resultLimit` or 5.
     */
    async search(query, limit) {
        const trimmed = query.trim();
        if (trimmed.length === 0)
            return [];
        const config = _getConfig();
        const provider = createProvider(config);
        return provider.search(trimmed, limit ?? config.resultLimit ?? 5);
    },
    /**
     * Programmatically selects a result — flies the map to the location
     * and dispatches `geoleaf:geocoding:result`.
     *
     * @param result - A `GeocodingResult` obtained from `.search()`.
     */
    selectResult(result) {
        const config = _getConfig();
        _onSelect(result, config.flyToZoom ?? 15);
    },
    /**
     * Unmounts the geocoding control and cleans up all listeners.
     * The control can be re-mounted by calling `init()` and triggering `geoleaf:map:ready`.
     */
    destroy() {
        _destroyControl?.();
        _destroyControl = null;
    },
};

/*!
 * GeoLeaf Core – Geocoding / Public Facade
 * © 2026 Mattieu Pottier — MIT License
 * https://geoleaf.dev
 */
/**
 * @module geoleaf.geocoding
 *
 * Public facade for the GeoLeaf Geocoding module.
 * Exposes `GeoLeaf.Geocoding` on the global namespace and provides named ESM exports.
 *
 * The geocoding control is mounted automatically when `geocodingConfig.enabled: true`
 * is set in the active profile and the `geoleaf:map:ready` event fires.
 *
 * @example
 * // Profile configuration — enable the address search control
 * // geoleaf.config.json:
 * {
 *   "geocodingConfig": {
 *     "enabled": true,
 *     "provider": "addok",
 *     "position": "top-right",
 *     "placeholder": "Rechercher une adresse…"
 *   }
 * }
 *
 * @example
 * // Programmatic search (no UI required)
 * const results = await GeoLeaf.Geocoding.search("Bordeaux");
 * if (results.length) GeoLeaf.Geocoding.selectResult(results[0]);
 *
 * @example
 * // Listen for user selections
 * document.addEventListener("geoleaf:geocoding:result", (e) => {
 *   const { label, lat, lng } = (e as CustomEvent).detail;
 *   console.log("Selected:", label, lat, lng);
 * });
 *
 * @see {@link ./built-in/geocoding/geocoding-registry.ts} for the control lifecycle
 * @see {@link ./built-in/geocoding/geocoding-provider.ts} for provider implementations
 */
const _g$3 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
/**
 * Public Geocoding namespace.
 * Available as `GeoLeaf.Geocoding` after boot.
 */
const Geocoding = {
    /**
     * Returns `true` when `geocodingConfig.enabled` is set in the active profile.
     */
    isEnabled: () => GeocodingRegistry.isEnabled(),
    /**
     * Programmatically performs an address search.
     * Does not require the UI control to be visible.
     *
     * @param query - Address or place name to search (e.g. "Paris", "10 rue de Rivoli").
     * @param limit - Maximum number of results to return. Default 5.
     * @returns Promise resolving to an array of `GeocodingResult`.
     */
    search: (query, limit) => GeocodingRegistry.search(query, limit),
    /**
     * Programmatically selects a geocoding result.
     * Flies the map to the result location and dispatches `geoleaf:geocoding:result`.
     *
     * @param result - A `GeocodingResult` obtained from `.search()`.
     */
    selectResult: (result) => GeocodingRegistry.selectResult(result),
    /**
     * Unmounts the geocoding control and releases all DOM listeners.
     */
    destroy: () => GeocodingRegistry.destroy(),
};
if (_g$3.GeoLeaf)
    _g$3.GeoLeaf.Geocoding = Geocoding;
// Subscribe to geoleaf:map:ready — mounts the control when the map is ready.
GeocodingRegistry.init();

/**
 * @module globals.api
 *
 * @description
 * UMD/ESM bridge — B11 — public facades, API controller, and PluginRegistry.
 *
 * This runtime initialization module is imported **last** by `globals.ts`.
 * It assembles the complete `GeoLeaf` public API by:
 *   - Assigning all domain facades (`Core`, `POI`, `Route`, `Table`, `UI`, …)
 *   - Wiring the APIController sub-managers (`FactoryManager`, `ModuleManager`, …)
 *   - Registering `PluginRegistry` and `BootInfo`
 *   - Defining top-level shorthand methods (`init`, `loadConfig`, `setTheme`,
 *     `createMap`, `getMap`, `getAllMaps`, `removeMap`, `getModule`, `getHealth`)
 *
 * **UMD note:** public methods are assigned directly here (not via `geoleaf-api.js`)
 * to prevent Rollup DCE from eliminating them when `propertyReadSideEffects:false`.
 *
 * @see globals for the orchestrator and import order
 * @see api/geoleaf-api for the ESM facade with full JSDoc
 */
// B11 : facades geoleaf.*.js + api/
// Note: api/ must be imported before geoleaf.api.js (controller sets up _APIController getter)
// geoleaf.api.js is imported last in bundle-entry.js (requires _APIController to be set up first)
const _g$2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g$2.GeoLeaf = _g$2.GeoLeaf || {};
// -- B11 assignations : facades + api -----------------------------------------
if (!_g$2.GeoLeaf.API)
    _g$2.GeoLeaf.API = {};
_g$2.GeoLeaf.API.Controller = APIController;
_g$2.GeoLeaf.API.FactoryManager = APIFactoryManager;
_g$2.GeoLeaf.API.InitializationManager = APIInitializationManager;
_g$2.GeoLeaf.API.ModuleManager = APIModuleManager;
// Aliases expected by api/controller.js._getManagerClass() (Phase 7 key mismatch fix)
_g$2.GeoLeaf.API.APIModuleManager = APIModuleManager;
_g$2.GeoLeaf.API.APIInitializationManager = APIInitializationManager;
_g$2.GeoLeaf.API.APIFactoryManager = APIFactoryManager;
// Top-level facade modules
_g$2.GeoLeaf.Baselayers = Baselayers;
_g$2.GeoLeaf.BaseLayers = Baselayers; // alias stabilized Phase 7
_g$2.GeoLeaf.Core = Core;
_g$2.GeoLeaf.Filters = Filters;
_g$2.GeoLeaf.Helpers = Helpers$1;
_g$2.GeoLeaf.LayerManager = LayerManager$4;
_g$2.GeoLeaf.Legend = Legend;
if (!_g$2.GeoLeaf.POI || !_g$2.GeoLeaf.POI.init)
    _g$2.GeoLeaf.POI = Object.assign(_g$2.GeoLeaf.POI || {}, POI);
// Renderers must be (re-)set AFTER the Object.assign above because geoleaf.poi.js
// historically shipped a Renderers:{} key that would overwrite them if set earlier.
if (!_g$2.GeoLeaf.POI.Renderers)
    _g$2.GeoLeaf.POI.Renderers = {};
_g$2.GeoLeaf.POI.Renderers.FieldRenderers = FieldRenderers;
_g$2.GeoLeaf.POI.Renderers.MediaRenderers = MediaRenderers;
_g$2.GeoLeaf.Route = Route;
// Storage: namespace ensured by globals.storage.js; facade methods injected by the premium plugin at runtime
_g$2.GeoLeaf.Storage = _g$2.GeoLeaf.Storage || {};
_g$2.GeoLeaf.Table = Table;
// UI: geoleaf.ui.js built _g.GeoLeaf.UI directly via mutations — re-sync reference
_g$2.GeoLeaf.UI = UI || _g$2.GeoLeaf.UI;
// Validators: override B8 SchemaValidators with full public Validators facade
_g$2.GeoLeaf.Validators = Validators;
_g$2.GeoLeaf.plugins = PluginRegistry;
_g$2.GeoLeaf.bootInfo = BootInfo;
_g$2.GeoLeaf.PWA = PWAManager;
_g$2.GeoLeaf.Permalink = Permalink;
_g$2.GeoLeaf.events = Events;
_g$2.GeoLeaf.Geocoding = Geocoding;
// Registers core as loaded
PluginRegistry.register("core", { version: _g$2.GeoLeaf._version });
// -- Public API entry points --------------------------------------------------
// Note: api/geoleaf-api.js is excluded by Rollup DCE in the ESM build because
// Object.assign(existing, {...}) where existing = _g.GeoLeaf||{} is treated as
// operating on a "local" object (propertyReadSideEffects:false + globalThis).
// Methods are assigned directly here to guarantee inclusion in the UMD bundle.
// See ROADMAP_PHASE11_LEGACY_TESTS_2026-02.md for context.
_g$2.GeoLeaf.init = function (options) {
    try {
        return _g$2.GeoLeaf._APIController.geoleafInit(options);
    }
    catch (error) {
        if (Log)
            Log.error("[GeoLeaf.init]", error);
        throw error;
    }
};
_g$2.GeoLeaf.setTheme = function (theme) {
    try {
        return _g$2.GeoLeaf._APIController.geoleafSetTheme(theme);
    }
    catch (error) {
        if (Log)
            Log.error("[GeoLeaf.setTheme]", error);
        throw error;
    }
};
_g$2.GeoLeaf.loadConfig = function (input) {
    if (input === null ||
        input === undefined ||
        (typeof input !== "string" && typeof input !== "object")) {
        throw new TypeError(`[GeoLeaf.loadConfig] Invalid input: expected string URL or config object, got ${typeof input}`);
    }
    try {
        return _g$2.GeoLeaf._APIController.geoleafLoadConfig(input);
    }
    catch (error) {
        if (Log)
            Log.error("[GeoLeaf.loadConfig]", error);
        throw error;
    }
};
_g$2.GeoLeaf.createMap = function (id, options) {
    const ctrl = _g$2.GeoLeaf._APIController;
    return ctrl && ctrl.geoleafCreateMap ? ctrl.geoleafCreateMap(id, options) : null;
};
_g$2.GeoLeaf.getMap = function (id) {
    const ctrl = _g$2.GeoLeaf._APIController;
    return ctrl && ctrl.managers && ctrl.managers.factory
        ? ctrl.managers.factory.getMapInstance(id)
        : null;
};
_g$2.GeoLeaf.getAllMaps = function () {
    const ctrl = _g$2.GeoLeaf._APIController;
    return ctrl && ctrl.managers && ctrl.managers.factory
        ? ctrl.managers.factory.getAllMapInstances()
        : [];
};
_g$2.GeoLeaf.removeMap = function (id) {
    const ctrl = _g$2.GeoLeaf._APIController;
    if (ctrl &&
        ctrl.managers &&
        ctrl.managers.factory &&
        typeof ctrl.managers.factory.removeMapInstance === "function") {
        return ctrl.managers.factory.removeMapInstance(id);
    }
    return false;
};
_g$2.GeoLeaf.getModule = function (name) {
    const ctrl = _g$2.GeoLeaf._APIController;
    return ctrl && ctrl.moduleAccessFn ? ctrl.moduleAccessFn(name) : null;
};
_g$2.GeoLeaf.hasModule = function (name) {
    const ctrl = _g$2.GeoLeaf._APIController;
    const mod = ctrl && ctrl.moduleAccessFn ? ctrl.moduleAccessFn(name) : null;
    return !!mod;
};
_g$2.GeoLeaf.getNamespace = function (name) {
    return _g$2.GeoLeaf && name ? _g$2.GeoLeaf[name] || null : null;
};
_g$2.GeoLeaf.getHealth = function () {
    const ctrl = _g$2.GeoLeaf._APIController;
    return ctrl && ctrl.getHealthStatus ? ctrl.getHealthStatus() : null;
};
_g$2.GeoLeaf.getMetrics = function () {
    return _g$2.GeoLeaf.getHealth();
};
// Alias version / CONSTANTS (set also by geoleaf-api.js for ESM — harmless duplicate)
if (!_g$2.GeoLeaf.version) {
    _g$2.GeoLeaf.version = (_g$2.GeoLeaf.CONSTANTS && _g$2.GeoLeaf.CONSTANTS.VERSION) || "1.2.0";
}
// geoleaf.api.js (ESM facade) also sets these; globals.api.js provides the UMD fallback.

/**
 * @module globals
 *
 * @description
 * ESM orchestrator — Phase 9 refactor.
 *
 * This runtime initialization module delegates to domain-specific sub-modules,
 * each of which imports its own dependencies and appends to `_g.GeoLeaf`.
 * It is imported as a **side-effect** by `bundle-esm-entry.ts` (ESM)
 * to populate `window.GeoLeaf.*`.
 *
 * Guaranteed execution order (ESM depth-first resolution):
 *   `globals.core` → `globals.config` → `globals.geojson` →
 *   `globals.ui` → `globals.storage` → `globals.poi` → `globals.api`
 *
 * History:
 *   - `_namespace.js` removed in Phase 8 — all modules use pure Pattern A
 *   - `globals.js` split into domain sub-files in Phase 9 (P3-DEAD-05)
 *
 * @see globals.core for runtime core (log, errors, utils)
 * @see globals.api for public facades and PluginRegistry
 * @see docs/architecture/BOOT_SEQUENCE.md
 */
// B1+B2  runtime core : log, errors, constants, security, utils (DOIT être en premier)
// Re-exporter _g for thes consommateurs qui l'importent directly
const _g$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};

/*!
 * GeoLeaf Core – App / Helpers
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf Application Helpers
 * Production logging, path detection, plugin verification,
 * and notification helper.
 *
 * This file creates the shared GeoLeaf._app namespace used by
 * app/init.js and app/boot.js.
 *
 * @module app/helpers
 */
const GeoLeaf$2 = _g$1.GeoLeaf;
/**
 * Internal namespace for the Application Bootstrap module.
 * Shared between app/helpers.js, app/init.js and app/boot.js.
 * @namespace GeoLeaf._app
 * @private
 */
const _app$2 = (GeoLeaf$2._app = GeoLeaf$2._app || {});
// ============================================================
// Production logging system
// ============================================================
_app$2.AppLog = {
    log(...args) {
        if (location.search.includes("debug=true")) {
            // eslint-disable-next-line no-console -- intentional debug output when ?debug=true
            console.debug("[GeoLeaf]", ...args);
        }
    },
    info(...args) {
        console.info("[GeoLeaf]", ...args);
    },
    error(...args) {
        console.error("[GeoLeaf]", ...args);
    },
    warn(...args) {
        console.warn("[GeoLeaf]", ...args);
    },
};
// ============================================================
// Automatic path detection for profiles/
// ============================================================
/**
 * Automatically detects the base path to the profiles/ folder
 * based on the current URL.
 * @returns {string} Relative path to profiles/
 */
_app$2.getProfilesBasePath = function () {
    const currentPath = _g$1.location.pathname;
    if (currentPath.includes("/demo/")) {
        return "../profiles/";
    }
    return "./profiles/";
};
// ============================================================
// Plugin verification at boot
// ============================================================
/**
 * Verifies that required plugins for the configuration are loaded
 * and prints console warnings if they are missing.
 * @param {Object} cfg - Active profile configuration
 */
/* eslint-disable complexity -- sequential plugin checks */
_app$2.checkPlugins = function (cfg) {
    const AppLog = _app$2.AppLog;
    // Warning if config expects Storage but plugin is not loaded
    if (cfg && cfg.storage) {
        if (!GeoLeaf$2.Storage) {
            AppLog.warn("⚠️ Config references storage but Storage plugin is not loaded. " +
                "Advanced features (IndexedDB, CacheManager, sync) require geoleaf-storage.plugin.js. " +
                "Basic offline caching via SW core is always available without the plugin.");
        }
        // SW lite (sw-core.js) is always registered at boot — no check needed.
        // Only warn if user expects PREMIUM SW without the Storage plugin.
        if (cfg.storage.enableServiceWorker && !GeoLeaf$2.Storage) {
            AppLog.warn("⚠️ Config has enableServiceWorker=true but Storage plugin is not loaded. " +
                "Premium SW (IndexedDB tiles, background sync) requires geoleaf-storage.plugin.js. " +
                "Core/lite SW remains active for basic offline caching.");
        }
    }
    // Warning if showAddPoi is enabled but AddPOI plugin is not loaded
    if (cfg?.ui?.showAddPoi && !GeoLeaf$2.POI) {
        AppLog.warn("AddPOI plugin is not loaded. Include geoleaf-addpoi.plugin.js to enable POI creation.");
    }
    // Warning if SyncHandler is loaded without Storage
    if (GeoLeaf$2.POI && GeoLeaf$2.POI.SyncHandler && !GeoLeaf$2.Storage) {
        AppLog.warn("⚠️ SyncHandler loaded without Storage plugin — sync operations will be disabled. " +
            "POI add/edit/delete will work in online-only mode.");
    }
};
/* eslint-enable complexity */
// ============================================================
// Helper : display une notification
// ============================================================
/**
 * Displays a notification via the GeoLeaf UI system.
 * Tries GeoLeaf.UI.Notifications first, then GeoLeaf._UINotifications.
 * @param {string} message - Message to display
 * @param {number} [duration=3500] - Display duration in milliseconds
 * @returns {boolean} true if the notification was shown
 */
/* eslint-disable complexity -- fallback notification paths */
_app$2.showNotification = function (message, duration) {
    duration = duration || 3500;
    if (GeoLeaf$2.UI &&
        GeoLeaf$2.UI.Notifications &&
        typeof GeoLeaf$2.UI.Notifications.success === "function") {
        try {
            GeoLeaf$2.UI.Notifications.success(message, duration);
            return true;
        }
        catch (_) {
            /* notification API may not be ready */
        }
    }
    if (GeoLeaf$2._UINotifications && typeof GeoLeaf$2._UINotifications.success === "function") {
        try {
            GeoLeaf$2._UINotifications.success(message, duration);
            return true;
        }
        catch (_) {
            /* notification API may not be ready */
        }
    }
    if (Log && typeof Log.debug === "function") {
        Log.debug(message + " (notifications indisponibles)");
    }
    return false;
};
/* eslint-enable complexity */
// ============================================================
// Sprint 6: Lazy module loader helper
// ============================================================
/**
 * Ensures a secondary module is loaded.
 * In UMD mode the module is already available (inlined) → immediate resolution.
 * In ESM mode, triggers network chunk loading if needed.
 *
 * @param {string} globalName - Name on window.GeoLeaf (e.g. 'POI', 'Route')
 * @param {string} chunkName  - Chunk identifier (e.g. 'poi', 'route')
 * @returns {Promise<void>}
 */
_app$2._ensureModule = async function (globalName, chunkName) {
    if (GeoLeaf$2[globalName])
        return; // already loaded (UMD or already imported)
    if (typeof GeoLeaf$2._loadModule === "function") {
        await GeoLeaf$2._loadModule(chunkName);
    }
};

/**
 * GeoLeaf App – Feature Module Initializers
 * Extracted from app/init.js (Phase 8.2.3)
 * Each function initializes one feature domain after secondary modules are loaded.
 *
 * @module app/init-feature-modules
 */
/**
 * @typedef {Object} InitDeps
 * @property {Object} GeoLeaf  - The global GeoLeaf object
 * @property {Object} cfg      - The active profile configuration
 * @property {Object} map      - The map instance
 * @property {Object} AppLog   - Logger instance
 * @property {Object} [_app]   - The _app namespace (required for initGeoJSON)
 */
/**
 * Initialize base tile layers from profile cfg.basemaps.
 * @param {InitDeps} deps
 */
/* eslint-disable complexity -- keys from config object */
function initBasemaps({ GeoLeaf, cfg, map, AppLog }) {
    const baseLayersModule = GeoLeaf.BaseLayers || GeoLeaf.Baselayers;
    if (!baseLayersModule || typeof baseLayersModule.init !== "function") {
        AppLog.warn("BaseLayers module not found.");
        return;
    }
    // Resolve native maplibregl.Map from the IMapAdapter (Sprint 3+).
    // Fallback to the raw map value for legacy paths.
    const nativeMap = map && typeof map.getNativeMap === "function"
        ? map.getNativeMap()
        : (GeoLeaf?.Core?.getMap?.()?.getNativeMap?.() ?? map);
    let activeKey = "street";
    const basemapsFromConfig = {};
    if (cfg.basemaps && typeof cfg.basemaps === "object") {
        Object.keys(cfg.basemaps).forEach(function (key) {
            const def = cfg.basemaps[key];
            if (def.defaultBasemap === true)
                activeKey = def.id || key;
            const entry = {
                id: def.id || key,
                label: def.label || key,
                url: def.url || def.fallbackUrl,
                options: {
                    minZoom: def.minZoom || 0,
                    maxZoom: def.maxZoom || 19,
                    attribution: def.attribution || "",
                },
            };
            // MapLibre vector basemap support
            if (def.type)
                entry.type = def.type;
            if (def.style)
                entry.style = def.style;
            if (def.attribution)
                entry.attribution = def.attribution;
            // Propagate minZoom/maxZoom at top level for MapLibre path
            if (typeof def.minZoom === "number")
                entry.minZoom = def.minZoom;
            if (typeof def.maxZoom === "number")
                entry.maxZoom = def.maxZoom;
            // Native tiles array and subdomain config for MapLibre raster sources
            if (Array.isArray(def.tiles) && def.tiles.length > 0)
                entry.tiles = def.tiles;
            if (def.subdomains)
                entry.subdomains = def.subdomains;
            if (typeof def.tileSize === "number")
                entry.tileSize = def.tileSize;
            // 3D terrain configuration
            if (def.terrain)
                entry.terrain = def.terrain;
            basemapsFromConfig[key] = entry;
        });
    }
    try {
        baseLayersModule.init({
            map: nativeMap,
            baselayers: basemapsFromConfig,
            activeKey: activeKey,
            ui: cfg.ui,
            basemaps: cfg.basemaps,
        });
    }
    catch (e) {
        AppLog.warn("BaseLayers.init threw an exception:", e);
    }
}
/* eslint-enable complexity */
/**
 * Initialize POI markers from profile cfg.poi.
 * @param {InitDeps} deps
 */
/* eslint-disable complexity, max-lines-per-function -- init orchestration */
function initPOI({ GeoLeaf, cfg, map, AppLog }) {
    const poiApi = GeoLeaf.POI;
    if (!poiApi || typeof poiApi.add !== "function") {
        AppLog.warn("GeoLeaf.POI.add() unavailable, no POI will be displayed.");
        return;
    }
    try {
        if (typeof poiApi.init === "function") {
            poiApi.init({ map: map, config: cfg.poiConfig || {} });
            // Load POI legends
            if (GeoLeaf.Legend &&
                typeof GeoLeaf.Legend.loadLayerLegend === "function" &&
                cfg.layers &&
                Array.isArray(cfg.layers)) {
                cfg.layers.forEach(function (layerRef) {
                    if (layerRef.id && layerRef.id.includes("poi") && layerRef.configFile) {
                        fetch(layerRef.configFile)
                            .then((response) => response.json())
                            .then((layerConfig) => {
                            let styleId = "default";
                            if (layerConfig.styles &&
                                layerConfig.styles.available &&
                                layerConfig.styles.available.length > 0) {
                                styleId = layerConfig.styles.available[0].id || "default";
                            }
                            GeoLeaf.Legend.loadLayerLegend(layerRef.id, styleId, layerConfig);
                            if (typeof GeoLeaf.Legend.setLayerVisibility === "function") {
                                GeoLeaf.Legend.setLayerVisibility(layerRef.id, true);
                            }
                        })
                            .catch((err) => AppLog.warn(`Error loading layer config ${layerRef.id}:`, err));
                    }
                });
            }
        }
    }
    catch (e) {
        AppLog.warn("GeoLeaf.POI.init() threw an error:", e);
    }
    const showFilterPanel = cfg.ui && cfg.ui.showFilterPanel === true;
    if (showFilterPanel) {
        AppLog.info("Filter panel enabled: POIs will be loaded via the filter system.");
        if (GeoLeaf.UI && typeof GeoLeaf.UI.applyFiltersInitial === "function") {
            GeoLeaf.UI.applyFiltersInitial();
        }
        return;
    }
    if (!Array.isArray(cfg.poi) || cfg.poi.length === 0) {
        return;
    }
    const bounds = [];
    cfg.poi.forEach(function (poiItem) {
        let latlng = null;
        if (poiItem.latlng && Array.isArray(poiItem.latlng) && poiItem.latlng.length === 2) {
            latlng = poiItem.latlng;
        }
        else if (poiItem.location &&
            typeof poiItem.location.lat === "number" &&
            typeof poiItem.location.lng === "number") {
            latlng = [poiItem.location.lat, poiItem.location.lng];
        }
        if (latlng)
            bounds.push(latlng);
    });
    if (bounds.length > 0) {
        // fitBounds POI only si pas de bounds dans the profile ET pas de GeoJSON layers
        const hasBoundsFromProfile = cfg.map && Array.isArray(cfg.map.bounds) && cfg.map.bounds.length === 2;
        const hasGeoJSONLayers = cfg.layers && Array.isArray(cfg.layers) && cfg.layers.length > 0;
        if (!hasBoundsFromProfile && !hasGeoJSONLayers) {
            try {
                // Compute GeoLeafBounds from [lat, lng] pairs
                let north = -90, south = 90, east = -180, west = 180;
                for (const [lat, lng] of bounds) {
                    if (lat > north)
                        north = lat;
                    if (lat < south)
                        south = lat;
                    if (lng > east)
                        east = lng;
                    if (lng < west)
                        west = lng;
                }
                map.fitBounds({ north, south, east, west }, { padding: { x: 80, y: 80 } });
            }
            catch (e) {
                AppLog.warn("Error during fitBounds:", e);
            }
        }
        if (GeoLeaf.UI && typeof GeoLeaf.UI.refreshFilterTags === "function") {
            GeoLeaf.UI.refreshFilterTags();
        }
    }
}
/* eslint-enable complexity, max-lines-per-function */
/**
 * Initialize route display from profile cfg.routes.
 * @param {InitDeps} deps
 */
function initRoute({ GeoLeaf, cfg, map, AppLog }) {
    const routeApi = GeoLeaf.Route;
    if (!routeApi ||
        typeof routeApi.init !== "function" ||
        typeof routeApi.loadFromConfig !== "function") {
        return;
    }
    try {
        routeApi.init({ map: map, fitBoundsOnLoad: false, maxZoomOnFit: 12 });
    }
    catch (e) {
        AppLog.warn("GeoLeaf.Route.init() threw an error:", e);
        return;
    }
    if (Array.isArray(cfg.routes) && cfg.routes.length > 0) {
        try {
            routeApi.loadFromConfig(cfg.routes);
            AppLog.log("Routes loaded.");
        }
        catch (e) {
            AppLog.warn("GeoLeaf.Route.loadFromConfig() threw an error:", e);
        }
    }
}
/**
 * Initialize GeoJSON layers and theme selector from profile cfg.layers.
 * @param {InitDeps} deps
 */
/* eslint-disable max-lines-per-function -- init + theme setup */
function initGeoJSON({ GeoLeaf, _cfg, map, AppLog, _app }) {
    const geoJsonApi = GeoLeaf.GeoJSON;
    if (!geoJsonApi || typeof geoJsonApi.init !== "function") {
        AppLog.log("GeoLeaf.GeoJSON.init() unavailable — no GeoJSON layers.");
        return;
    }
    try {
        geoJsonApi.init({ map: map, fitBoundsOnLoad: false, maxZoomOnFit: 12 });
    }
    catch (e) {
        AppLog.warn("GeoLeaf.GeoJSON.init() threw an error:", e);
        return;
    }
    if (map && typeof map.on === "function") {
        map.on("geoleaf:geojson:layers-loaded", function (event) {
            if (event && event.detail && typeof event.detail.count === "number") {
                const count = event.detail.count;
                const message = count === 1 ? "1 GeoJSON layer loaded" : count + " GeoJSON layers loaded";
                if (_app && typeof _app.showNotification === "function") {
                    _app.showNotification(message, 3000);
                }
            }
        });
    }
    // Theme system initialization
    // B5 [ESM-02]: IIFE replaced by named function — scoping unnecessary in ESM
    function buildLoadAllConfigsPromise() {
        if (GeoLeaf._GeoJSONLoader &&
            typeof GeoLeaf._GeoJSONLoader.loadAllLayersConfigsForLayerManager === "function") {
            const activeProfile = GeoLeaf.Config && typeof GeoLeaf.Config.getActiveProfile === "function"
                ? GeoLeaf.Config.getActiveProfile()
                : null;
            if (activeProfile) {
                return GeoLeaf._GeoJSONLoader
                    .loadAllLayersConfigsForLayerManager(activeProfile)
                    .catch((err) => {
                    AppLog.warn("Error loading layer configs:", err);
                    return [];
                });
            }
        }
        return Promise.resolve();
    }
    const loadAllConfigsPromise = buildLoadAllConfigsPromise();
    /* eslint-disable max-lines-per-function -- theme init callback */
    loadAllConfigsPromise.then(function () {
        if (!GeoLeaf.ThemeSelector || typeof GeoLeaf.ThemeSelector.init !== "function") {
            AppLog.warn("ThemeSelector not available");
            return;
        }
        let currentProfileId = null;
        if (GeoLeaf.Config && typeof GeoLeaf.Config.getActiveProfileId === "function") {
            currentProfileId = GeoLeaf.Config.getActiveProfileId();
        }
        const primaryContainer = document.getElementById("gl-theme-primary-container");
        const secondaryContainer = document.getElementById("gl-theme-secondary-container");
        if (!currentProfileId || !primaryContainer || !secondaryContainer) {
            AppLog.warn("ThemeSelector: containers or profile missing");
            return;
        }
        GeoLeaf.ThemeSelector.init({
            profileId: currentProfileId,
            primaryContainer: primaryContainer,
            secondaryContainer: secondaryContainer,
        })
            .then(function () {
            AppLog.log("ThemeSelector initialized and theme applied");
            if (GeoLeaf._GeoJSONLayerManager &&
                typeof GeoLeaf._GeoJSONLayerManager.populateLayerManagerWithAllConfigs ===
                    "function") {
                const activeThemeConfig = GeoLeaf.ThemeSelector.getActiveTheme
                    ? GeoLeaf.ThemeSelector.getActiveTheme()
                    : null;
                GeoLeaf._GeoJSONLayerManager.populateLayerManagerWithAllConfigs(activeThemeConfig);
            }
            document.addEventListener("geoleaf:theme:applied", function () {
                if (GeoLeaf._GeoJSONLayerManager &&
                    typeof GeoLeaf._GeoJSONLayerManager.populateLayerManagerWithAllConfigs ===
                        "function") {
                    const activeThemeConfig = GeoLeaf.ThemeSelector.getActiveTheme
                        ? GeoLeaf.ThemeSelector.getActiveTheme()
                        : null;
                    GeoLeaf._GeoJSONLayerManager.populateLayerManagerWithAllConfigs(activeThemeConfig);
                }
            });
        })
            .catch(function (e) {
            AppLog.warn("Error initializing ThemeSelector:", e);
        });
    });
    /* eslint-enable max-lines-per-function */
}
/**
 * Initialize mobile toolbar pill bar and desktop right panel.
 * @param {InitDeps} deps
 */
function initUIPanels({ GeoLeaf, cfg, map, AppLog }) {
    // Mobile utilities pill bar + sheet (Phase 2 Mobile Friendly)
    if (GeoLeaf.UI && typeof GeoLeaf.UI.initMobileToolbar === "function") {
        try {
            const glMain = document.querySelector(".gl-main");
            if (glMain) {
                GeoLeaf.UI.initMobileToolbar({
                    glMain,
                    map,
                    showAddPoi: cfg?.ui?.showAddPoi ?? false,
                    poiAddDefaultPosition: cfg?.poiAddConfig?.defaultPosition,
                    showGeolocation: cfg?.ui?.showGeolocation ?? true,
                    showThemeSelector: cfg?.ui?.showThemeSelector !== false,
                    showFilterPanel: cfg?.ui?.showFilterPanel !== false,
                    showLayerManager: cfg?.ui?.showLayerManager !== false,
                    showLegend: cfg?.ui?.showLegend !== false,
                    showTable: cfg?.ui?.showTable !== false,
                    sheetTitles: {
                        ...(cfg.searchConfig?.title ? { filters: cfg.searchConfig.title } : {}),
                        ...(cfg.layerManagerConfig?.title
                            ? { layers: cfg.layerManagerConfig.title }
                            : {}),
                        ...(cfg.legendConfig?.title ? { legend: cfg.legendConfig.title } : {}),
                        ...(cfg.tableConfig?.title ? { table: cfg.tableConfig.title } : {}),
                    },
                    getFilterActiveState: () => GeoLeaf._UIFilterStateManager?.hasActiveFilters?.() ?? false,
                    onResetFilters: () => {
                        const panel = document.getElementById("gl-filter-panel");
                        const StateReader = GeoLeaf._UIFilterPanelStateReader;
                        const Applier = GeoLeaf._UIFilterPanelApplier;
                        if (panel && StateReader?.resetControls && Applier?.applyFiltersNow) {
                            StateReader.resetControls(panel);
                            Applier.applyFiltersNow(panel, true);
                        }
                    },
                });
                AppLog.log("Mobile pill bar and sheet initialized.");
            }
        }
        catch (e) {
            AppLog.warn("Error initializing mobile pill bar:", e);
        }
    }
    // Persistent right sidebar for desktop (>= 1440px) (Phase 9 Mobile Friendly)
    if (GeoLeaf.UI && typeof GeoLeaf.UI.initDesktopPanel === "function") {
        try {
            const glMainDesktop = document.querySelector(".gl-main");
            if (glMainDesktop) {
                GeoLeaf.UI.initDesktopPanel({
                    glMain: glMainDesktop,
                    titleFilters: cfg.searchConfig?.title,
                    titleLayers: cfg.layerManagerConfig?.title,
                    titleLegend: cfg.legendConfig?.title,
                    titleTable: cfg.tableConfig?.title,
                    showFilters: cfg?.ui?.showFilterPanel !== false,
                    showLayers: cfg?.ui?.showLayerManager !== false,
                    showLegend: cfg?.ui?.showLegend !== false,
                    showTable: cfg?.ui?.showTable !== false,
                    getFilterActiveState: () => GeoLeaf._UIFilterStateManager?.hasActiveFilters?.() ?? false,
                });
                AppLog.log("Right desktop sidebar initialized.");
            }
        }
        catch (e) {
            AppLog.warn("Error initializing right desktop panel:", e);
        }
    }
}

/*!
 * GeoLeaf Core – App / Init
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/** App init: map, modules, UI, loader reveal. @module app/init */
const GeoLeaf$1 = _g$1.GeoLeaf;
const _app$1 = (GeoLeaf$1._app = GeoLeaf$1._app || {});
/* eslint-disable complexity, max-lines-per-function -- init orchestration */
_app$1.initApp = async function (cfg) {
    cfg = cfg || {};
    const AppLog = _app$1.AppLog;
    // R4.1.1 — Perf marks, active when window.__GEOLEAF_PERF__ === true
    const _pm = (name) => window.__GEOLEAF_PERF__ ? performance?.mark?.(name) : undefined;
    // perf 5 — benchmark: startup measurement
    if (typeof performance !== "undefined" && performance.mark) {
        performance.mark("geoleaf:initApp:start");
    }
    AppLog.log("Initializing with config:", cfg);
    initI18n();
    // ── beforeBoot hook (A.5.1): auth gate before map creation ──────────────
    // Allows integrators without the connector plugin (SSO Keycloak, Azure AD,
    // Laravel/Symfony session) to condition map startup on an external auth check.
    // Throwing aborts boot and emits 'geoleaf:boot:aborted'.
    if (typeof GeoLeaf$1._beforeBootCallback === "function") {
        try {
            await GeoLeaf$1._beforeBootCallback({ config: cfg });
        }
        catch (err) {
            AppLog.warn("[beforeBoot] Auth hook rejected — boot aborted:", err);
            document.dispatchEvent(new CustomEvent("geoleaf:boot:aborted", {
                detail: { reason: err },
                bubbles: false,
                cancelable: false,
            }));
            return;
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ── Permalink hook 1 (§1.3.2): read URL state before map creation ──────
    // Must run before GeoLeaf.init() so the stored state is ready for hook 2.
    const _permalinkCfg = (cfg.ui && cfg.ui.permalink) || {};
    if (_permalinkCfg.enabled && GeoLeaf$1.Permalink) {
        try {
            GeoLeaf$1.Permalink.init(_permalinkCfg);
            GeoLeaf$1.Permalink.readAndStore();
        }
        catch (e) {
            AppLog.warn("[Permalink] readAndStore failed:", e);
        }
    }
    // Check plugins
    _app$1.checkPlugins(cfg);
    // ── Map initialisation: profile extent (map.bounds or map.center+zoom) ──────────────────
    const mapTarget = (cfg.map && (cfg.map.target || cfg.map.id)) || "geoleaf-map";
    const uiTheme = (cfg.ui && cfg.ui.theme) || "light";
    // Determine positioning mode: bounds (fitBounds) or center+zoom (setView)
    const _hasBounds = cfg.map && Array.isArray(cfg.map.bounds) && cfg.map.bounds.length === 2;
    const _hasCenterZoom = cfg.map &&
        Array.isArray(cfg.map.center) &&
        cfg.map.center.length === 2 &&
        typeof cfg.map.zoom === "number";
    if (!_hasBounds && !_hasCenterZoom) {
        AppLog.error("[GeoLeaf] Active profile does not define valid map.bounds or map.center+zoom. " +
            "Either map.bounds or map.center+map.zoom is required in profile.json. " +
            'Example: "bounds": [[43.0, 1.0], [44.0, 2.0]]  or  "center": [20, 10], "zoom": 2');
        return;
    }
    // Build positioning variables depending on available config
    let profileBounds = null;
    let profilePadding = null;
    let mapCenter;
    let profileMaxZoom;
    if (_hasBounds) {
        const profileBoundsRaw = cfg.map.bounds;
        profileMaxZoom = cfg.map.initialMaxZoom || cfg.map.maxZoom || 12;
        const _rawPadding = cfg.map.padding || [50, 50];
        profilePadding = Array.isArray(_rawPadding)
            ? {
                top: _rawPadding[1] ?? 50,
                bottom: _rawPadding[1] ?? 50,
                left: _rawPadding[0] ?? 50,
                right: _rawPadding[0] ?? 50,
            }
            : _rawPadding;
        mapCenter = [
            (profileBoundsRaw[0][0] + profileBoundsRaw[1][0]) / 2,
            (profileBoundsRaw[0][1] + profileBoundsRaw[1][1]) / 2,
        ];
        profileBounds = {
            south: profileBoundsRaw[0][0],
            west: profileBoundsRaw[0][1],
            north: profileBoundsRaw[1][0],
            east: profileBoundsRaw[1][1],
        };
    }
    else {
        // center+zoom mode (e.g. world-transport, world-disasters)
        mapCenter = cfg.map.center;
        profileMaxZoom = cfg.map.zoom;
        AppLog.log("[GeoLeaf] Profile uses center+zoom positioning (no bounds).");
    }
    let map = null;
    // Map options — positionFixed constrains panning to the profile extent
    const mapOptions = {};
    const boundsMargin = typeof cfg.map.boundsMargin === "number" ? cfg.map.boundsMargin : 0.3;
    if (cfg.map.positionFixed === true && profileBounds) {
        mapOptions.maxBounds = padBounds(profileBounds, boundsMargin);
        mapOptions.minZoom = typeof cfg.map.minZoom === "number" ? cfg.map.minZoom : 3;
    }
    if (typeof cfg.map.minZoom === "number" && !mapOptions.minZoom)
        mapOptions.minZoom = cfg.map.minZoom;
    if (typeof cfg.map.maxZoom === "number")
        mapOptions.maxZoom = cfg.map.maxZoom;
    if (typeof cfg.map.maxPitch === "number")
        mapOptions.maxPitch = cfg.map.maxPitch;
    if (typeof cfg.map.pitch === "number")
        mapOptions.pitch = cfg.map.pitch;
    _pm("geoleaf:init:mapCreate:start");
    try {
        map = GeoLeaf$1.init({
            map: {
                target: mapTarget,
                center: mapCenter,
                zoom: profileMaxZoom,
                mapOptions: mapOptions,
            },
            ui: {
                theme: uiTheme,
            },
        });
    }
    catch (e) {
        AppLog.error("GeoLeaf.init() threw an error:", e);
        return;
    }
    _pm("geoleaf:init:mapCreate:end");
    if (!map) {
        AppLog.error("GeoLeaf.init() did not return a valid map.");
        return;
    }
    // Preload secondary modules as early as possible to overlap
    // chunk network loading with UI/Storage initialisation.
    // We keep an await below before using the secondary modules in order to
    // preserve current behavior.
    let secondaryModulesPromise = null;
    if (typeof GeoLeaf$1._loadAllSecondaryModules === "function") {
        secondaryModulesPromise = GeoLeaf$1._loadAllSecondaryModules();
    }
    // positionFixed is now applied via mapOptions in GeoLeaf.init() —
    // no post-creation safety net needed (MapLibre applies maxBounds reliably).
    if (cfg.map.positionFixed === true && profileBounds) {
        AppLog.log("[GeoLeaf] positionFixed enabled — movement restricted to profile extent (margin: " +
            boundsMargin * 100 +
            "%).");
    }
    // Precise positioning via fitBounds (adjusts zoom to real container dimensions)
    // Skipped for center+zoom profiles — already positioned via GeoLeaf.init()
    if (profileBounds) {
        try {
            if (map && typeof map.fitBounds === "function") {
                map.fitBounds(profileBounds, {
                    padding: profilePadding,
                    animate: false,
                });
            }
            AppLog.log("Map positioned via profile map.bounds.");
        }
        catch (e) {
            AppLog.warn("Error during fitBounds from profile map.bounds:", e);
        }
    }
    else {
        AppLog.log("Map positioned via profile center+zoom.");
    }
    // ── SW core/lite: unconditional registration (replaced by premium SW if Storage loaded) ──
    if (GeoLeaf$1._SWRegister) {
        GeoLeaf$1._SWRegister
            .register({ scope: "./" })
            .then(() => AppLog.log("Service Worker (core/lite) registered."))
            .catch((err) => AppLog.warn("Error registering core SW:", err.message));
    }
    // ── Storage init (if plugin loaded) ─────────────────────────────────────────────────────
    const storageConfig = cfg.storage || {};
    if (GeoLeaf$1.Storage && typeof GeoLeaf$1.Storage.init === "function") {
        try {
            AppLog.log("Initializing Storage with config:", storageConfig);
            GeoLeaf$1.Storage.init({
                indexedDB: { name: "geoleaf-db", version: 2 },
                cache: storageConfig.cache || {
                    enableProfileCache: true,
                    enableTileCache: true,
                },
                offline: {},
                enableOfflineDetector: !!storageConfig.enableOfflineDetector,
                enableServiceWorker: !!storageConfig.enableServiceWorker,
            })
                .then(() => {
                AppLog.log("Storage initialized successfully");
            })
                .catch((err) => {
                AppLog.warn("Error initializing Storage:", err);
            });
        }
        catch (e) {
            AppLog.warn("Error during Storage initialization:", e);
        }
    }
    else {
        AppLog.log("Plugin Storage not loaded — running in standard browser cache mode.");
        // Initialize the Offline Detector for connectivity badge (core mode)
        if (storageConfig.enableOfflineDetector && GeoLeaf$1._OfflineDetector) {
            GeoLeaf$1._OfflineDetector.init({
                showBadge: true,
                badgePosition: "topleft",
                checkInterval: 30000,
            });
            AppLog.log("Offline Detector initialized (core mode).");
        }
    }
    // ========================================================
    // Initialise the UI notification system
    // ========================================================
    if (GeoLeaf$1._UINotifications && typeof GeoLeaf$1._UINotifications.init === "function") {
        try {
            let notificationContainer = document.getElementById("gl-notifications");
            if (!notificationContainer) {
                notificationContainer = document.createElement("div");
                notificationContainer.id = "gl-notifications";
                notificationContainer.className =
                    "gl-notifications gl-notifications--bottom-center";
                document.body.appendChild(notificationContainer);
            }
            GeoLeaf$1._UINotifications.init({
                container: "#gl-notifications",
                position: "bottom-center",
                maxVisible: 3,
                animations: true,
            });
            AppLog.log("Notification system initialized");
        }
        catch (e) {
            AppLog.warn("Error during notification system initialization:", e);
        }
    }
    // ========================================================
    // Persistent loading toast during layer loading
    // Shown as soon as ThemeApplier starts loading a theme,
    // dismissed when geoleaf:theme:applied is emitted.
    // ========================================================
    let _loadingToast = null;
    document.addEventListener("geoleaf:theme:applying", function () {
        // Display a persistent toast if the notification system is ready
        if (GeoLeaf$1._UINotifications && GeoLeaf$1._UINotifications.container) {
            _loadingToast = GeoLeaf$1._UINotifications.info(getLabel("toast.init.loading"), {
                persistent: true,
                dismissible: false,
            });
        }
    });
    // ========================================================
    // Event listeners (profile & theme notifications)
    // ========================================================
    let pendingProfileToastDetail = null;
    function notificationsReady() {
        try {
            if (GeoLeaf$1.UI &&
                GeoLeaf$1.UI.Notifications &&
                typeof GeoLeaf$1.UI.Notifications.getStatus === "function") {
                return !!GeoLeaf$1.UI.Notifications.getStatus().initialized;
            }
            if (GeoLeaf$1._UINotifications && GeoLeaf$1._UINotifications.container) {
                return true;
            }
        }
        catch (e) {
        }
        return false;
    }
    function tryShowProfileToast(detail) {
        if (!detail || !detail.data)
            return false;
        const profile = detail.data.profile || {};
        const profileName = profile.label || profile.name || profile.title || detail.profileId || "Profile";
        const message = getLabel("toast.profile.loaded", profileName);
        if (!notificationsReady()) {
            pendingProfileToastDetail = detail;
            return false;
        }
        const shown = _app$1.showNotification(message);
        if (shown)
            pendingProfileToastDetail = null;
        else
            pendingProfileToastDetail = detail;
        return shown;
    }
    document.addEventListener("geoleaf:profile:loaded", function (event) {
        if (event && event.detail) {
            pendingProfileToastDetail = event.detail;
            tryShowProfileToast(event.detail);
        }
    });
    document.addEventListener("geoleaf:theme:applied", function (event) {
        // Close the persistent loading toast
        if (_loadingToast &&
            GeoLeaf$1._UINotifications &&
            typeof GeoLeaf$1._UINotifications.dismiss === "function") {
            GeoLeaf$1._UINotifications.dismiss(_loadingToast);
            _loadingToast = null;
        }
        if (event && event.detail) {
            const detail = event.detail;
            _app$1.showNotification(getLabel("toast.theme.applied", detail.themeName, String(detail.layerCount)), 3500);
        }
    });
    // Listen for load completion to show pending notifications.
    // Note: map event forwarding (move/zoom → geoleaf:map:move/zoom) is now
    // handled by MaplibreAdapter._bindEvents() — no duplicate wiring needed.
    document.addEventListener("geoleaf:map:ready", function () {
        if (pendingProfileToastDetail) {
            tryShowProfileToast(pendingProfileToastDetail);
        }
    });
    // ========================================================
    // UI theme via GeoLeaf.setTheme() + UI initialisation
    // ========================================================
    try {
        if (typeof GeoLeaf$1.setTheme === "function") {
            GeoLeaf$1.setTheme(uiTheme);
        }
    }
    catch (e) {
        AppLog.warn("Error calling GeoLeaf.setTheme:", e);
    }
    if (GeoLeaf$1.UI && typeof GeoLeaf$1.UI.init === "function") {
        try {
            const mapContainer = document.querySelector(".gl-main") || document.getElementById(mapTarget);
            GeoLeaf$1.UI.init({
                map: map,
                mapContainer: mapContainer,
                config: cfg,
            });
        }
        catch (e) {
            AppLog.warn("GeoLeaf.UI.init() threw an error:", e);
        }
    }
    // Build the filter panel
    // ui.showFilterPanel === false: hide the toggle button + panel and skip building it
    if (cfg.ui && cfg.ui.showFilterPanel === false) {
        const _toggleBtn = document.getElementById("gl-filter-toggle");
        if (_toggleBtn)
            _toggleBtn.style.display = "none";
        const _filterPanel = document.getElementById("gl-filter-panel");
        if (_filterPanel)
            _filterPanel.style.display = "none";
    }
    else if (GeoLeaf$1.UI && typeof GeoLeaf$1.UI.buildFilterPanelFromActiveProfile === "function") {
        try {
            let filterContainer = document.getElementById("gl-filter-panel");
            if (!filterContainer) {
                filterContainer = document.createElement("div");
                filterContainer.id = "gl-filter-panel";
                filterContainer.setAttribute("data-gl-role", "filter-panel");
                const glMain = document.querySelector(".gl-main");
                if (glMain)
                    glMain.appendChild(filterContainer);
                else
                    document.body.appendChild(filterContainer);
            }
            GeoLeaf$1.UI.buildFilterPanelFromActiveProfile({ container: filterContainer });
            if (typeof GeoLeaf$1.UI.initFilterToggle === "function") {
                GeoLeaf$1.UI.initFilterToggle();
            }
            if (typeof GeoLeaf$1.UI.initProximityFilter === "function") {
                GeoLeaf$1.UI.initProximityFilter(map);
            }
        }
        catch (e) {
            AppLog.warn("Error building the filter panel:", e);
        }
    }
    initUIPanels({ GeoLeaf: GeoLeaf$1, cfg, map, AppLog });
    // ========================================================
    // Sprint 6: Loading secondary modules (code splitting)
    // In ESM mode: loads network chunks in parallel.
    // In UMD mode: already inlined, immediate resolution.
    // ========================================================
    _pm("geoleaf:init:secondaryModules:start");
    if (secondaryModulesPromise) {
        try {
            await secondaryModulesPromise;
            AppLog.log("Secondary modules loaded (POI, Route, Legend, LayerManager, Labels, Themes, Table).");
        }
        catch (e) {
            AppLog.warn("Error loading secondary modules:", e);
        }
    }
    _pm("geoleaf:init:secondaryModules:end");
    // Initialise the Table module
    // ui.showTable !== false: same pattern as showLegend / showLayerManager
    if (cfg.ui &&
        cfg.ui.showTable !== false &&
        GeoLeaf$1.Table &&
        typeof GeoLeaf$1.Table.init === "function" &&
        cfg.tableConfig &&
        cfg.tableConfig.enabled !== false) {
        try {
            GeoLeaf$1.Table.init({ map: map, config: cfg.tableConfig });
            AppLog.log("Table module initialized.");
        }
        catch (e) {
            AppLog.warn("Error during Table module initialization:", e);
        }
    }
    // Initialise the offline cache button (if Storage plugin loaded)
    if (GeoLeaf$1.UI && GeoLeaf$1.UI.CacheButton && typeof GeoLeaf$1.UI.CacheButton.init === "function") {
        try {
            GeoLeaf$1.UI.CacheButton.init(map, cfg);
            AppLog.log("Cache button initialized.");
        }
        catch (e) {
            AppLog.warn("Error during cache button initialization:", e);
        }
    }
    // ========================================================
    // Basemaps via GeoLeaf.BaseLayers
    // ========================================================
    _pm("geoleaf:init:basemaps:start");
    initBasemaps({ GeoLeaf: GeoLeaf$1, cfg, map, AppLog });
    _pm("geoleaf:init:basemaps:end");
    // ========================================================
    // POI via GeoLeaf.POI
    // ========================================================
    _pm("geoleaf:init:poi:start");
    initPOI({ GeoLeaf: GeoLeaf$1, cfg, map, AppLog });
    _pm("geoleaf:init:poi:end");
    // ========================================================
    // Routes via GeoLeaf.Route
    // ========================================================
    _pm("geoleaf:init:route:start");
    initRoute({ GeoLeaf: GeoLeaf$1, cfg, map, AppLog });
    _pm("geoleaf:init:route:end");
    // ========================================================
    // GeoJSON layers via GeoLeaf.GeoJSON
    // ========================================================
    _pm("geoleaf:init:geojson:start");
    initGeoJSON({ GeoLeaf: GeoLeaf$1, map, AppLog, _app: _app$1 });
    _pm("geoleaf:init:geojson:end");
    // ========================================================
    // Branding
    // ========================================================
    if (GeoLeaf$1.UI && GeoLeaf$1.UI.Branding && typeof GeoLeaf$1.UI.Branding.init === "function") {
        try {
            GeoLeaf$1.UI.Branding.init(map);
        }
        catch (e) {
            AppLog.warn("GeoLeaf.UI.Branding.init() threw an error:", e);
        }
    }
    // ========================================================
    // R4.2.1 — Defer non-critical UI panels to post-reveal (geoleaf:app:ready)
    // Legend, LayerManager, activateDesktopPanel, Scale, Labels, CoordinatesDisplay
    // do not affect the map first render or revealApp timing.
    // They are initialized after the app reveals to free the main thread during
    // the async theme-loading phase (which gates the startup measurement).
    // ========================================================
    document.addEventListener("geoleaf:app:ready", function _initDeferredUIPanels() {
        _pm("geoleaf:init:deferredUI:start");
        // Legend and layer manager
        if (cfg.ui &&
            cfg.ui.showLegend !== false &&
            GeoLeaf$1.Legend &&
            typeof GeoLeaf$1.Legend.init === "function") {
            try {
                GeoLeaf$1.Legend.init(map, {
                    position: "bottomleft",
                    collapsible: true,
                    collapsed: false,
                    title: "Legend",
                });
            }
            catch (e) {
                AppLog.warn("Error during Legend module initialization:", e);
            }
        }
        // Load legends for layers active in the current theme (Legend must be init'd first)
        try {
            if (GeoLeaf$1._GeoJSONLayerManager &&
                typeof GeoLeaf$1._GeoJSONLayerManager._loadLayerLegend === "function" &&
                Array.isArray(GeoLeaf$1._allLayerConfigs)) {
                const activeTheme = GeoLeaf$1.ThemeSelector?.getActiveTheme?.();
                const activeIds = Array.isArray(activeTheme?.layers)
                    ? activeTheme.layers.map((l) => l.id)
                    : [];
                GeoLeaf$1._allLayerConfigs.forEach((config) => {
                    if (activeIds.length === 0 || activeIds.includes(config.id)) {
                        GeoLeaf$1._GeoJSONLayerManager._loadLayerLegend(config.id, { config });
                    }
                });
            }
        }
        catch (e) {
            AppLog.warn("Error loading initial layer legends:", e);
        }
        if (cfg.ui &&
            cfg.ui.showLayerManager !== false &&
            GeoLeaf$1.LayerManager &&
            typeof GeoLeaf$1.LayerManager.init === "function") {
            try {
                GeoLeaf$1.LayerManager.init({ map: map, position: "bottomright" });
            }
            catch (e) {
                AppLog.warn("GeoLeaf.LayerManager.init() threw an error:", e);
            }
        }
        // Activate the right desktop panel (after Legend + LayerManager)
        if (GeoLeaf$1.UI && typeof GeoLeaf$1.UI.activateDesktopPanel === "function") {
            try {
                GeoLeaf$1.UI.activateDesktopPanel();
                AppLog.log("Right desktop panel activated.");
            }
            catch (e) {
                AppLog.warn("Error activating right desktop panel:", e);
            }
        }
        // Scale control
        if (GeoLeaf$1.initScaleControl && typeof GeoLeaf$1.initScaleControl === "function") {
            try {
                GeoLeaf$1.initScaleControl(map);
            }
            catch (e) {
                AppLog.warn("GeoLeaf.initScaleControl() threw an error:", e);
            }
        }
        // Label system
        if (GeoLeaf$1.Labels && typeof GeoLeaf$1.Labels.init === "function") {
            try {
                GeoLeaf$1.Labels.init({ map: map });
            }
            catch (e) {
                AppLog.warn("GeoLeaf.Labels.init() threw an error:", e);
            }
        }
        // Coordinates display
        if (cfg.ui &&
            cfg.ui.showCoordinates !== false &&
            GeoLeaf$1.UI &&
            GeoLeaf$1.UI.CoordinatesDisplay &&
            typeof GeoLeaf$1.UI.CoordinatesDisplay.init === "function") {
            try {
                GeoLeaf$1.UI.CoordinatesDisplay.init(map, {
                    position: "bottomleft",
                    decimals: 6,
                });
            }
            catch (e) {
                AppLog.warn("GeoLeaf.UI.CoordinatesDisplay.init() threw an error:", e);
            }
        }
        _pm("geoleaf:init:deferredUI:end");
    }, { once: true });
    // ========================================================
    // Reveal the application when layers are ready
    // The #gl-loader spinner stays opaque while the map
    // and GeoJSON layers load in the background.
    // We wait for the geoleaf:theme:applied event (= all
    // visible layers loaded) before revealing.
    // ========================================================
    let _appRevealed = false;
    /* eslint-disable max-lines-per-function -- loader reveal + fitBounds + events */
    function revealApp(reason) {
        if (_appRevealed)
            return;
        _appRevealed = true;
        const loader = document.getElementById("gl-loader");
        if (loader) {
            loader.classList.add("gl-loader--fade");
            // Remove from DOM after the CSS transition (400ms)
            // { once: true } ensures hide() is not called multiple times
            loader.addEventListener("transitionend", function () {
                loader.style.display = "none";
            }, { once: true });
            // Fallback if transitionend does not fire — 800ms > transition duration
            // (value > transition duration to let transitionend execute first)
            setTimeout(function () {
                loader.style.display = "none";
            }, 800);
        }
        // After removing the loader, tell the engine to recalculate its container
        // size and re-fit the profile bounds (unless permalink state overrides).
        if (map) {
            // Trigger MapLibre resize() to recalculate the container dimensions.
            const nativeMap = typeof map.getNativeMap === "function" ? map.getNativeMap() : null;
            if (nativeMap && typeof nativeMap.resize === "function") {
                nativeMap.resize();
            }
            const _hasPermalink = _permalinkCfg.enabled &&
                typeof GeoLeaf$1.Permalink !== "undefined" &&
                GeoLeaf$1.Permalink.getState() !== null;
            if (profileBounds && !_hasPermalink && typeof map.fitBounds === "function") {
                setTimeout(function () {
                    try {
                        map.fitBounds(profileBounds, {
                            padding: profilePadding,
                            animate: false,
                        });
                    }
                    catch (e) {
                        AppLog.warn("[GeoLeaf] fitBounds correction at reveal:", e);
                    }
                }, 120);
            }
        }
        document.dispatchEvent(new CustomEvent("geoleaf:map:ready"));
        // Emit the application initialisation end event
        // (used by boot.js to display the boot toast via GeoLeaf.bootInfo)
        document.dispatchEvent(new CustomEvent("geoleaf:app:ready", {
            detail: {
                version: GeoLeaf$1._version,
                timestamp: Date.now(),
            },
        }));
        AppLog.info("Application ready: " + reason);
        // perf 5 — benchmark: total startup time measurement
        if (typeof performance !== "undefined" && performance.mark) {
            performance.mark("geoleaf:initApp:ready");
            try {
                performance.measure("geoleaf:startup-total", "geoleaf:initApp:start", "geoleaf:initApp:ready");
                const entries = performance.getEntriesByName("geoleaf:startup-total", "measure");
                if (entries.length) {
                    AppLog.info("[Perf] ? Startup total: " +
                        entries[entries.length - 1].duration.toFixed(1) +
                        "ms");
                }
            }
            catch (error) {
            }
        }
    }
    /* eslint-enable max-lines-per-function */
    // ── Permalink hook 2 (§1.3.2): apply stored URL state + start sync ─────
    // Called after all modules are initialised but before the reveal,
    // so the view override is applied before the app becomes visible.
    if (_permalinkCfg.enabled && GeoLeaf$1.Permalink) {
        try {
            GeoLeaf$1.Permalink.applyStoredState(map);
            GeoLeaf$1.Permalink.startSync(map);
        }
        catch (e) {
            AppLog.warn("[Permalink] applyStoredState/startSync failed:", e);
        }
    }
    // Wait for all theme layers to be loaded
    document.addEventListener("geoleaf:theme:applied", function () {
        revealApp("theme applied, layers loaded");
    }, { once: true });
    // Safety: reveal after 5s max (slow network, error…) — perf 5.10: reduced from 15s to 5s
    setTimeout(function () {
        revealApp("safety timeout 5s");
    }, 5000);
    AppLog.info("Application initialized, loading layers in the background.");
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * ModuleRegistry — Sprint 3 implementation of `IModuleRegistry`.
 *
 * Manages the GeoLeaf module lifecycle:
 * - Validates uniqueness and registration order.
 * - Resolves the dependency graph via topological sort (Kahn's BFS).
 * - Detects circular dependencies at `init()` time and throws a `GeoLeafError`
 *   with the full cycle path (e.g. `"A → B → A"`).
 * - Calls each module's `init()` in dependency order, `destroy()` in reverse.
 *
 * @module app/module-registry
 */
// ─── ModuleRegistry ───────────────────────────────────────────────────────────
/**
 * Concrete implementation of `IModuleRegistry`.
 *
 * @example
 * ```typescript
 * const registry = new ModuleRegistry();
 * registry.register(new SecurityModule());
 * registry.register(new POIModule());
 * await registry.init(adapter, config);
 * ```
 */
class ModuleRegistry {
    /** Internal store — preserves insertion order. */
    _modules = new Map();
    /** Resolved initialisation order (populated by `init()`). */
    _initOrder = [];
    /** Guards against double-init and late registration. */
    _initialized = false;
    // ── register ──────────────────────────────────────────────────────────────
    register(module) {
        if (this._initialized) {
            throw new GeoLeafError(`ModuleRegistry: cannot register module '${module.id}' after init() has been called.`);
        }
        if (this._modules.has(module.id)) {
            throw new GeoLeafError(`ModuleRegistry: a module with id '${module.id}' is already registered.`);
        }
        this._modules.set(module.id, module);
    }
    // ── init ──────────────────────────────────────────────────────────────────
    async init(adapter, config) {
        if (this._initialized) {
            // Safe to call twice (idempotent guard — no-op on second call).
            return;
        }
        const order = this._topoSort(); // throws on cycle or missing dep
        this._initOrder = order;
        this._initialized = true;
        for (const id of order) {
            const mod = this._modules.get(id);
            await Promise.resolve(mod.init(adapter, config));
        }
    }
    // ── get / has / getAll / getUISlots ───────────────────────────────────────
    get(id) {
        const mod = this._modules.get(id);
        if (!mod) {
            throw new GeoLeafError(`ModuleRegistry: no module registered with id '${id}'.`);
        }
        return mod;
    }
    has(id) {
        return this._modules.has(id);
    }
    isInitialized() {
        return this._initialized;
    }
    getAll() {
        return Array.from(this._modules.values());
    }
    getUISlots() {
        const slots = [];
        for (const mod of this._modules.values()) {
            if (mod.ui !== undefined) {
                slots.push(mod.ui);
            }
        }
        return slots;
    }
    // ── destroy ───────────────────────────────────────────────────────────────
    destroy() {
        const reverseOrder = [...this._initOrder].reverse();
        for (const id of reverseOrder) {
            const mod = this._modules.get(id);
            if (!mod)
                continue;
            try {
                mod.destroy();
            }
            catch (err) {
                // Log but do not interrupt teardown — all modules must be destroyed.
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`[ModuleRegistry] destroy() failed for module '${id}': ${msg}`);
            }
        }
    }
    // ── Topological sort (Kahn's BFS) ─────────────────────────────────────────
    /**
     * Produces a topological ordering of registered modules.
     *
     * Validates that every declared dependency is registered.
     * Detects circular dependencies; if found, performs a DFS to build the
     * human-readable cycle path (e.g. `"A → B → A"`).
     *
     * @throws `GeoLeafError` on missing dependency or circular dependency.
     */
    _topoSort() {
        const ids = Array.from(this._modules.keys());
        // Validate dependencies — every declared dep must be registered.
        for (const id of ids) {
            const mod = this._modules.get(id);
            for (const dep of mod.dependencies) {
                if (!this._modules.has(dep)) {
                    throw new GeoLeafError(`ModuleRegistry: module '${id}' declared dependency '${dep}' ` +
                        `which is not registered.`);
                }
            }
        }
        // Build in-degree map and reverse adjacency (dep → dependants).
        const inDegree = new Map();
        const dependants = new Map(); // dep → [modules that depend on dep]
        for (const id of ids) {
            if (!inDegree.has(id))
                inDegree.set(id, 0);
            if (!dependants.has(id))
                dependants.set(id, []);
        }
        for (const id of ids) {
            const mod = this._modules.get(id);
            for (const dep of mod.dependencies) {
                inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
                dependants.get(dep).push(id);
            }
        }
        // Kahn's BFS — start with modules that have no dependencies.
        const queue = [];
        for (const [id, deg] of inDegree) {
            if (deg === 0)
                queue.push(id);
        }
        const result = [];
        while (queue.length > 0) {
            const id = queue.shift();
            result.push(id);
            for (const dep of dependants.get(id) ?? []) {
                const newDeg = (inDegree.get(dep) ?? 1) - 1;
                inDegree.set(dep, newDeg);
                if (newDeg === 0)
                    queue.push(dep);
            }
        }
        // If not all modules were processed → cycle detected.
        if (result.length < ids.length) {
            const cyclePath = this._findCyclePath();
            throw new GeoLeafError(`ModuleRegistry: circular dependency detected: ${cyclePath}`);
        }
        return result;
    }
    /**
     * DFS-based cycle path finder. Called only when Kahn's algorithm confirms
     * a cycle exists. Returns a human-readable path like `"A → B → A"`.
     */
    _findCyclePath() {
        const visited = new Set();
        const stack = new Set();
        const path = [];
        const dfs = (id) => {
            if (stack.has(id)) {
                // Found the start of the cycle — slice from first occurrence.
                const cycleStart = path.indexOf(id);
                const cycle = path.slice(cycleStart);
                cycle.push(id); // close the loop
                path.splice(0, path.length, ...cycle);
                return true;
            }
            if (visited.has(id))
                return false;
            visited.add(id);
            stack.add(id);
            path.push(id);
            const mod = this._modules.get(id);
            for (const dep of mod.dependencies) {
                if (dfs(dep))
                    return true;
            }
            stack.delete(id);
            path.pop();
            return false;
        };
        for (const id of this._modules.keys()) {
            if (!visited.has(id)) {
                if (dfs(id))
                    break;
            }
        }
        return path.join(" → ");
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * SecurityModule — `ICoreModule` wrapper for the security subsystem.
 *
 * Represents: `GeoLeaf.Security`, `GeoLeaf.CSRFToken`, `DOMSecurity`.
 * Underlying globals: `globals.core.ts` (B1 — security portion).
 *
 * Sprint 3: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point. `init()` and
 * `destroy()` will be filled in Sprint 4 during physical restructuring.
 *
 * @module app/modules/security.module
 */
/**
 * Represents the GeoLeaf security subsystem (XSS sanitization, CSRF token,
 * DOM security helpers). No dependencies — must be the first module initialized.
 */
class SecurityModule {
    id = "security";
    dependencies = [];
    init(_adapter, _config) {
        // Sprint 3: no-op — globals.core.ts B1 already ran as a side-effect.
        // Sprint 4: move security bootstrap logic here.
    }
    destroy() {
        // Security helpers (XSS sanitization, CSRF token) are stateless utilities.
        // No listeners or DOM state to clean up.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * CoreMapModule — `ICoreModule` wrapper for the runtime core.
 *
 * Represents: `GeoLeaf.Log`, `GeoLeaf.Errors`, `GeoLeaf.CONSTANTS`,
 * `GeoLeaf.Utils` (all utility helpers: DOM, events, fetch, lazy, timers…).
 * Underlying globals: `globals.core.ts` (B1 + B2).
 *
 * Sprint 3: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point.
 *
 * @module app/modules/core-map.module
 */
/**
 * Represents the GeoLeaf runtime core: logging, error classes, constants,
 * and all utility helpers registered under `GeoLeaf.Utils`.
 * No dependencies — bootstrapped unconditionally before any other module.
 */
class CoreMapModule {
    id = "core-map";
    dependencies = [];
    init(_adapter, _config) {
        // Sprint 3: no-op — globals.core.ts B1+B2 already ran as a side-effect.
        // Sprint 4: move core bootstrap logic here.
    }
    destroy() {
        // Remove all event listeners registered via the global EventListenerManager.
        events.offAll();
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * ConfigModule — `ICoreModule` wrapper for the configuration subsystem.
 *
 * Represents: `GeoLeaf.Config`, `GeoLeaf.Helpers`, `GeoLeaf.Validators`,
 * `GeoLeaf.Renderers` (abstract + simple-text), `GeoLeaf.Data`.
 * Underlying globals: `globals.config.ts` (B3 + B4).
 *
 * Sprint 3: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point.
 *
 * @module app/modules/config.module
 */
/**
 * Represents the GeoLeaf configuration subsystem: helpers, validators,
 * renderers, data normalizers, and the Config singleton.
 * No dependencies — loaded directly after the runtime core.
 */
class ConfigModule {
    id = "config";
    dependencies = [];
    init(_adapter, _config) {
        // Sprint 3: no-op — globals.config.ts B3+B4 already ran as a side-effect.
        // Sprint 4: move config bootstrap logic here.
    }
    destroy() {
        // Config singleton is initialized as a globals side-effect and does not
        // expose a public reset API. Teardown deferred to Sprint 4 DI refactoring.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * SharedModule — `ICoreModule` wrapper for the shared inter-module state.
 *
 * Represents: `geojson-state`, `poi-state`, `layer-visibility-state`,
 * `storage-contract` — the shared state store consumed by multiple modules.
 * Underlying location: `modules/shared/`.
 *
 * Sprint 3: stub wrapper — the shared state modules initialize lazily when
 * first imported by their consumers (geojson, poi). No separate globals file.
 *
 * @module app/modules/shared.module
 */
/**
 * Represents the shared inter-module state (geojson-state, poi-state,
 * layer-visibility-state). Depends on `security` to ensure sanitization
 * helpers are available before state objects are created.
 */
class SharedModule {
    id = "shared";
    dependencies = ["security"];
    init(_adapter, _config) {
        // Sprint 3: no-op — shared state modules initialize lazily on first import.
        // Sprint 4: explicit initialization of shared state here.
    }
    destroy() {
        // Shared state objects (geojson-state, poi-state, layer-visibility-state)
        // initialize lazily and do not expose public reset APIs.
        // Teardown deferred to Sprint 4 DI refactoring.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoJSONModule — `ICoreModule` wrapper for the GeoJSON subsystem.
 *
 * Represents: `GeoLeaf.GeoJSON` (layers, styles, clustering, workers),
 * `GeoLeaf.Route` (full bundle only).
 * Underlying globals: `globals.geojson.ts` (B5) — full bundle.
 *                     `globals.geojson-lite.ts` (B5) — lite bundle (no route).
 *
 * Sprint 3: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` / `globals-lite.ts` import in the bundle entry point.
 *
 * @module app/modules/geojson.module
 */
/**
 * Represents the GeoJSON rendering subsystem (layers, styles, clustering,
 * web workers, and route in the full bundle). Depends on `config` and
 * `core-map` to ensure the Config singleton and utilities are ready.
 */
class GeoJSONModule {
    id = "geojson";
    dependencies = ["config", "core-map"];
    init(_adapter, _config) {
        // Sprint 3: no-op — globals.geojson.ts B5 already ran as a side-effect.
        // Sprint 4: move GeoJSON bootstrap logic here, pass adapter.
    }
    destroy() {
        // GeoJSON subsystem (layers, clustering, workers) does not expose a
        // teardown API at module level. Teardown deferred to Sprint 4 DI refactoring.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * UIModule — `ICoreModule` wrapper for the UI subsystem.
 *
 * Represents: `GeoLeaf.UI`, `GeoLeaf.LayerManager`, `GeoLeaf.Legend`,
 * `GeoLeaf.Labels` (full bundle), `GeoLeaf.Themes`.
 * Underlying globals: `globals.ui.ts` (B6+B7+B9) — full bundle.
 *                     `globals.ui-lite.ts` — lite bundle (no labels, no table).
 *
 * Sprint 3: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` / `globals-lite.ts` import in the bundle entry point.
 *
 * @module app/modules/ui.module
 */
/**
 * Represents the GeoLeaf UI subsystem (controls, filter panel, layer manager,
 * legend, themes, and labels in the full bundle). Depends on `config` and
 * `core-map` to ensure the map container and config are available.
 */
class UIModule {
    id = "ui";
    dependencies = ["config", "core-map"];
    init(_adapter, _config) {
        // Sprint 3: no-op — globals.ui.ts B6+B7+B9 already ran as a side-effect.
        // Sprint 4: move UI bootstrap logic here, pass adapter.
    }
    destroy() {
        // UI subsystem (controls, panels, layer manager) does not expose a
        // teardown API at module level. Teardown deferred to Sprint 4 DI refactoring.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * POIModule — `ICoreModule` wrapper for the POI subsystem.
 *
 * Represents: `GeoLeaf.POI` (markers, popup, sidepanel, renderers, add-form).
 * Underlying globals: `globals.poi.ts` (B10).
 *
 * Sprint 3: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point.
 *
 * @module app/modules/poi.module
 */
/**
 * Represents the GeoLeaf POI subsystem (markers, popup, sidepanel, renderers).
 * Depends on `geojson` (layer state) and `ui` (panel infrastructure).
 */
class POIModule {
    id = "poi";
    dependencies = ["geojson", "ui"];
    init(_adapter, _config) {
        // Sprint 3: no-op — globals.poi.ts B10 already ran as a side-effect.
        // Sprint 4: move POI bootstrap logic here, pass adapter.
    }
    destroy() {
        // POI subsystem (markers, popups, sidepanel) does not expose a
        // teardown API at module level. Teardown deferred to Sprint 4 DI refactoring.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * APIModule — `ICoreModule` wrapper for the public API assembly (full bundle).
 *
 * Represents: all `geoleaf.*.ts` facades, `APIController`, `APIModuleManager`,
 * `PluginRegistry`, and the `GeoLeaf.init()` / `GeoLeaf.boot()` public surface.
 * Underlying globals: `globals.api.ts` (B11 — must be last).
 *
 * Sprint 3: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point.
 *
 * @module app/modules/api.module
 */
/**
 * Represents the GeoLeaf public API assembly (all facades + PluginRegistry).
 * Depends on `config` to ensure the Config singleton is wired before facades run.
 *
 * Must be the last module initialized — all other modules must be ready before
 * the public API is assembled (Sprint 4: enforce via explicit dependencies).
 */
class APIModule {
    id = "api";
    dependencies = ["config"];
    init(_adapter, _config) {
        // Sprint 3: no-op — globals.api.ts B11 already ran as a side-effect.
        // Sprint 4: move API assembly logic here.
    }
    destroy() {
        // API facades are assembled as globals side-effects. The APIController
        // singleton does not have an externally-accessible reset path at module level.
        // Teardown deferred to Sprint 4 DI refactoring.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * RouteModule — `ICoreModule` wrapper for the Route subsystem.
 *
 * Represents: `GeoLeaf.Route` (itinerary layers, route popups, route styles).
 * Underlying globals: `globals.geojson.ts` (B5 — route is part of GeoJSON loading).
 *
 * Sprint 4: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point.
 * Route does not declare a toolbar icon — route display is driven by the
 * GeoJSON layer configuration, not a UI toggle.
 *
 * @module app/modules/route.module
 */
/**
 * Represents the GeoLeaf Route subsystem (itinerary layers, popups, styles).
 * Depends on `geojson` (layer rendering) and `ui` (popup/panel infrastructure).
 */
class RouteModule {
    id = "route";
    dependencies = ["geojson", "ui"];
    init(_adapter, _config) {
        // Sprint 4: no-op — route initialization is handled by globals.geojson.ts.
    }
    destroy() {
        // Sprint 4: no-op — route layer cleanup deferred to full init migration.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * LabelsModule — `ICoreModule` wrapper for the Labels subsystem.
 *
 * Represents: `GeoLeaf.Labels` (per-layer text labels on map features).
 * Underlying globals: `globals.ui.ts` (B6 — labels loaded with UI).
 *
 * Sprint 4: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point.
 * Labels do not declare a toolbar icon — they are toggled per-layer
 * via the layer manager, not via a global UI button.
 *
 * @module app/modules/labels.module
 */
/**
 * Represents the GeoLeaf Labels subsystem (per-layer map feature labels).
 * Depends on `geojson` (features to label).
 */
class LabelsModule {
    id = "labels";
    dependencies = ["geojson"];
    init(_adapter, _config) {
        // Sprint 4: no-op — labels initialization is handled by globals.ui.ts.
    }
    destroy() {
        // Sprint 4: no-op — labels cleanup deferred to full init migration.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * LegendModule — `ICoreModule` wrapper for the Legend subsystem.
 *
 * Represents: `GeoLeaf.Legend` (legend control, legend generator/renderer).
 * Underlying globals: `globals.ui.ts` (B6 — legend loaded with UI).
 *
 * Sprint 4: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point.
 * Declares a mobile toolbar icon (legend toggle) driven by `ui.showLegend`.
 *
 * @module app/modules/legend.module
 */
/**
 * Represents the GeoLeaf Legend subsystem (legend control, generator, renderer).
 * Depends on `geojson` (layer styles) and `ui` (panel infrastructure).
 */
class LegendModule {
    id = "legend";
    dependencies = ["geojson", "ui"];
    ui = {
        mobileIcon: {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h10M4 14h8M4 18h6"/></svg>',
            labelKey: "aria.toolbar.legend",
            profileKey: "ui.showLegend",
            defaultVisible: true,
        },
    };
    init(_adapter, _config) {
        // Sprint 4: no-op — legend initialization is handled by globals.ui.ts.
    }
    destroy() {
        // Sprint 4: no-op — legend cleanup deferred to full init migration.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * TableModule — `ICoreModule` wrapper for the Table subsystem.
 *
 * Represents: `GeoLeaf.Table` (data table panel, selection, highlight, export).
 * Underlying globals: `globals.ui.ts` (B6 — table loaded with UI).
 *
 * Sprint 4: stub wrapper — initialization already performed as a side-effect
 * of the `globals.ts` import in the bundle entry point.
 * Declares a mobile toolbar icon (table toggle) driven by `ui.showTable`.
 *
 * @module app/modules/table.module
 */
/**
 * Represents the GeoLeaf Table subsystem (data table, selection, highlights).
 * Depends on `geojson` (feature data), `poi` (marker highlight) and `ui` (panel).
 */
class TableModule {
    id = "table";
    dependencies = ["geojson", "poi", "ui"];
    ui = {
        mobileIcon: {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
            labelKey: "aria.toolbar.table",
            profileKey: "ui.showTable",
            defaultVisible: true,
        },
    };
    init(_adapter, _config) {
        // Sprint 4: no-op — table initialization is handled by globals.ui.ts.
    }
    destroy() {
        // Sprint 4: no-op — table cleanup deferred to full init migration.
    }
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * SearchModule — `ICoreModule` wrapper for the Search subsystem.
 *
 * Represents: `GeoLeaf.Search` (search engine registry, FlexSearch index).
 * Underlying globals: loaded lazily via `lazy/search.ts`.
 *
 * Sprint 4: stub wrapper — initialization already performed as a side-effect
 * of the lazy module loading.
 * Declares a mobile toolbar icon (search toggle) driven by `ui.showSearch`.
 *
 * @module app/modules/search.module
 */
/**
 * Represents the GeoLeaf Search subsystem (FlexSearch engine, search registry).
 * Depends on `poi` (POI data to index).
 */
class SearchModule {
    id = "search";
    dependencies = ["poi"];
    ui = {
        mobileIcon: {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"/></svg>',
            labelKey: "aria.toolbar.search",
            profileKey: "ui.showSearch",
            defaultVisible: true,
            action: "search",
        },
    };
    init(_adapter, _config) {
        // Sprint 4: no-op — search initialization is handled by lazy/search.ts.
    }
    destroy() {
        // Sprint 4: no-op — search cleanup deferred to full init migration.
    }
}

/*!
 * GeoLeaf Core – App / Boot
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * GeoLeaf Application Boot — full bundle (Sprint 3: ModuleRegistry integration).
 *
 * Loads the configuration and launches initialization via the ModuleRegistry.
 * Exposes the public API GeoLeaf.boot().
 *
 * Usage : <script>GeoLeaf.boot();</script>
 *
 * @module app/boot
 */
const GeoLeaf = _g$1.GeoLeaf;
const _app = (GeoLeaf._app = GeoLeaf._app || {});
// ── Sprint 3 — ModuleRegistry setup ──────────────────────────────────────────
// Modules are registered here, at module-init time, before startApp() is called.
// Registration order does NOT determine initialization order — the registry
// resolves the dependency graph at init() time.
const _registry = new ModuleRegistry();
_registry.register(new SecurityModule());
_registry.register(new CoreMapModule());
_registry.register(new ConfigModule());
_registry.register(new SharedModule());
_registry.register(new GeoJSONModule());
_registry.register(new UIModule());
_registry.register(new POIModule());
_registry.register(new APIModule());
// Expose on GeoLeaf namespace (task 3.3.4):
//   GeoLeaf._registry — internal access (boot internals)
//   GeoLeaf.registry  — public API for third-party module self-registration:
//                       GeoLeaf.registry.register(new MyCustomModule())
GeoLeaf._registry = _registry;
GeoLeaf.registry = _registry;
// ─────────────────────────────────────────────────────────────────────────────
/** Prevents startApp from running more than once (double-boot guard). */
_app._appStarted = false;
// ============================================================
// Fonction startApp : loading config + lancement initApp
// ============================================================
/* eslint-disable complexity, max-lines-per-function -- boot sequence */
_app.startApp = async function () {
    const AppLog = _app.AppLog;
    // R4.1.1 — Perf marks, active when window.__GEOLEAF_PERF__ === true
    const _pm = (name) => window.__GEOLEAF_PERF__ ? performance?.mark?.(name) : undefined;
    if (!GeoLeaf) {
        AppLog.error("GeoLeaf global not found. The core bundle must be loaded before GeoLeaf.boot().");
        return;
    }
    if (typeof GeoLeaf.loadConfig !== "function") {
        AppLog.error("GeoLeaf.loadConfig() not found. Check that the core bundle is complete.");
        return;
    }
    AppLog.info("Starting application...");
    // Double-boot guard: if the app has already started, ignore subsequent calls.
    if (_app._appStarted) {
        AppLog.warn("[GeoLeaf.boot] Application already started — second boot call ignored.");
        return;
    }
    _app._appStarted = true;
    // Listen for app ready event to show boot toast
    // (after UI is ready — GeoLeaf.UI.notify may not be available yet)
    document.addEventListener("geoleaf:app:ready", function _onAppReady() {
        if (GeoLeaf.bootInfo?.show) {
            GeoLeaf.bootInfo.show(GeoLeaf);
        }
    }, { once: true });
    let selectedProfile = null;
    try {
        const rawProfile = sessionStorage.getItem("gl-selected-profile");
        // Validate profile ID: alphanumeric, hyphens, underscores, max 50 chars
        if (rawProfile && /^[a-zA-Z0-9_-]{1,50}$/.test(rawProfile)) {
            selectedProfile = rawProfile;
            AppLog.log("Profile selected from sessionStorage:", selectedProfile);
        }
        else if (rawProfile) {
            AppLog.warn("sessionStorage profile rejected (invalid format):", rawProfile.substring(0, 20));
        }
        sessionStorage.removeItem("gl-selected-profile");
    }
    catch (e) {
        AppLog.warn("Unable to read sessionStorage:", e);
    }
    const profilesPath = _app.getProfilesBasePath();
    // perf 5.4: wrap loadConfig (callback) in a Promise to enable chaining
    _pm("geoleaf:boot:loadConfig:start");
    const configPromise = new Promise((resolve, reject) => {
        GeoLeaf.loadConfig({
            url: profilesPath + "geoleaf.config.json",
            profileId: selectedProfile,
            autoEvent: true,
            onLoaded: resolve,
            onError: reject,
        });
    });
    let cfg;
    try {
        cfg = await configPromise;
        AppLog.log("Config loaded via GeoLeaf.loadConfig:", cfg || {});
    }
    catch (err) {
        AppLog.error("Error loading config via GeoLeaf.loadConfig:", err);
        return;
    }
    _pm("geoleaf:boot:loadConfig:end");
    if (GeoLeaf.Config && typeof GeoLeaf.Config.getCategories === "function") {
        try {
            GeoLeaf.Config.getCategories();
        }
        catch (e) {
            AppLog.warn("Error reading category mapping:", e);
        }
    }
    const baseCfg = (cfg || {});
    // PWA install prompt — opt-in via pwa.installPrompt.enabled in geoleaf.config.json
    if (GeoLeaf.PWA && typeof GeoLeaf.PWA.init === "function" && baseCfg["pwa"]) {
        try {
            GeoLeaf.PWA.init(baseCfg["pwa"]);
        }
        catch (e) {
            AppLog.warn("PWA init failed:", e);
        }
    }
    // ── Sprint 3 — ModuleRegistry init ───────────────────────────────────────
    // Wrap raw config in a minimal IGeoLeafConfig adapter.
    // Sprint 4 will replace this with the real GeoLeaf.Config instance and
    // pass a MapLibreAdapter (created after GeoLeaf.init()) instead of null.
    const _cfgAdapter = {
        get(key, def) {
            const v = key.split(".").reduce((o, k) => o?.[k], baseCfg);
            return v !== undefined ? v : def;
        },
        getAll() {
            return { ...baseCfg };
        },
        isLoaded() {
            return true;
        },
    };
    // ── Sprint 4 — Register optional modules based on profile config ────────
    // Guard: skip registration if registry already initialised (double-boot).
    // Cast to unknown: the inline _cfgAdapter.get() literal default causes TS
    // to narrow the return type to `true`, making `!== false` trivially true.
    if (!_registry.isInitialized()) {
        if (_cfgAdapter.get("route.enabled") !== false) {
            _registry.register(new RouteModule());
        }
        if (_cfgAdapter.get("labels.enabled") !== false) {
            _registry.register(new LabelsModule());
        }
        if (_cfgAdapter.get("ui.showLegend") !== false) {
            _registry.register(new LegendModule());
        }
        if (_cfgAdapter.get("ui.showTable") !== false) {
            _registry.register(new TableModule());
        }
        if (_cfgAdapter.get("ui.showSearch") !== false) {
            _registry.register(new SearchModule());
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    try {
        // Sprint 3: null adapter — module stubs do not consume it.
        // Sprint 4 will pass MapLibreAdapter after the map is created.
        _pm("geoleaf:boot:registry:start");
        await _registry.init(null, _cfgAdapter);
        _pm("geoleaf:boot:registry:end");
        AppLog.log("[Registry] Modules initialized:", _registry.getAll().map((m) => m.id));
    }
    catch (err) {
        AppLog.warn("[Registry] init() failed — falling back to legacy boot:", err);
    }
    // ─────────────────────────────────────────────────────────────────────────
    if (GeoLeaf.Config && typeof GeoLeaf.Config.loadActiveProfileResources === "function") {
        try {
            _pm("geoleaf:boot:profileResources:start");
            const profileCfg = await GeoLeaf.Config.loadActiveProfileResources();
            _pm("geoleaf:boot:profileResources:end");
            AppLog.info("Active profile resources loaded.");
            _app.initApp(profileCfg || baseCfg);
        }
        catch (err) {
            AppLog.warn("Error loading profile resources:", err);
            _app.initApp(baseCfg);
        }
    }
    else {
        _app.initApp(baseCfg);
    }
};
/* eslint-enable complexity, max-lines-per-function */
// ============================================================
// Exposesr GeoLeaf.boot() — API public
// ============================================================
/**
 * Starts the GeoLeaf application.
 * Loads the configuration, initializes the map and all modules.
 * Optional plugins (Storage, AddPOI) must be loaded before this call.
 *
 * @param options - Optional boot options.
 * @param options.beforeBoot - Async hook called after config load, before map creation.
 *   Return void to proceed, throw to abort boot (emits `geoleaf:boot:aborted`).
 *   Use case: SSO / external auth gate (Keycloak, Azure AD, Laravel/Symfony) without the connector plugin.
 * @param options.onPerformanceMetrics - Callback to receive runtime metrics after geoleaf:app:ready.
 * @example
 * GeoLeaf.boot();
 * // Auth gate (SSO without connector)
 * GeoLeaf.boot({
 *   beforeBoot: async ({ config }) => {
 *     const ok = await checkSession();
 *     if (!ok) throw new Error('Not authenticated');
 *   }
 * });
 * // Performance metrics
 * GeoLeaf.boot({ onPerformanceMetrics: (m) => console.log(m.timeToMapReadyMs) });
 */
GeoLeaf.boot = function (options) {
    if (options?.beforeBoot) {
        GeoLeaf._beforeBootCallback = options.beforeBoot;
    }
    if (options?.onPerformanceMetrics) {
        GeoLeaf._perfCallback = options.onPerformanceMetrics;
    }
    // Standard MIT plugin report (websocket, realtime-layer, connector, …)
    GeoLeaf.plugins?.reportStandardPlugins?.();
    // Premium plugin report — silent if none loaded (core only)
    GeoLeaf.plugins?.reportPremiumPlugins?.();
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", _app.startApp);
    }
    else {
        _app.startApp();
    }
};

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
// ── Module loader ─────────────────────────────────────────────────────────────
/**
 * Dynamically loads a GeoLeaf lazy module by name.
 *
 * Each case issues one or more dynamic `import()` expressions that produce
 * separate chunks in the ESM build (`dist/chunks/`).
 *
 * The `"poi"` case loads the three POI sub-chunks in dependency order:
 * poi-core first (required by renderers and extras), then the remaining two
 * in parallel via `Promise.all`.
 *
 * @param moduleName - The name of the module to load.
 * @returns A `Promise` that resolves once all required chunks are imported.
 *
 * @example
 * ```typescript
 * await loadModule("poi");         // poi-core → poi-renderers + poi-extras
 * await loadModule("layerManager"); // layer-manager chunk only
 * ```
 */
/* eslint-disable complexity -- switch dispatch for all named lazy modules */
async function loadModule(moduleName) {
    switch (moduleName) {
        // POI convenience: core first, then renderers + extras in parallel
        case "poi":
            await import('./chunks/geoleaf-poi-core-DuC7d1J8.js');
            await Promise.all([
                import('./chunks/geoleaf-poi-renderers-DC4hPufW.js'),
                import('./chunks/geoleaf-poi-extras-DuC7d1J8.js'),
            ]);
            break;
        // Granular POI sub-chunks
        case "poiCore":
            await import('./chunks/geoleaf-poi-core-DuC7d1J8.js');
            break;
        case "poiRenderers":
            await import('./chunks/geoleaf-poi-renderers-DC4hPufW.js');
            break;
        case "poiExtras":
            await import('./chunks/geoleaf-poi-extras-DuC7d1J8.js');
            break;
        case "basemapSelector":
            await import('./chunks/geoleaf-basemap-selector-DC4hPufW.js');
            break;
        case "route":
            await import('./chunks/geoleaf-route-DC4hPufW.js');
            break;
        case "layerManager":
            await import('./chunks/geoleaf-layer-manager-Cp9pIcWZ.js');
            break;
        case "legend":
            await import('./chunks/geoleaf-legend-BsT_bzSV.js');
            break;
        case "labels":
            await import('./chunks/geoleaf-labels-CDcPyAy5.js');
            break;
        case "themes":
            await import('./chunks/geoleaf-themes-DJXbe93Q.js');
            break;
        case "table":
            await import('./chunks/geoleaf-table-DWJIDi5D.js');
            break;
        case "search":
            await import('./chunks/geoleaf-search-DW_76Z72.js').then(function (n) { return n.s; });
            break;
        default: {
            // TypeScript exhaustiveness guard — `moduleName` is `never` here for
            // typed callers, but untyped JS callers (e.g. window.GeoLeaf._loadModule)
            // can still reach this branch at runtime.
            const _exhaustive = moduleName;
            console.warn("[GeoLeaf] Module inconnu:", _exhaustive);
        }
    }
}
/* eslint-enable complexity */
// ── Bulk loader ───────────────────────────────────────────────────────────────
/**
 * Loads all secondary GeoLeaf modules in the correct dependency order.
 *
 * POI core is loaded first because poi-renderers and poi-extras depend on it.
 * All remaining secondary chunks are then loaded in parallel.
 *
 * Exposed as `GeoLeaf._loadAllSecondaryModules` by the ESM entry point.
 *
 * @returns A `Promise` that resolves once all secondary chunks are imported.
 */
async function loadAllSecondaryModules() {
    // poi-core must be ready before poi-renderers and poi-extras
    await import('./chunks/geoleaf-poi-core-DuC7d1J8.js');
    await Promise.all([
        import('./chunks/geoleaf-poi-renderers-DC4hPufW.js'),
        import('./chunks/geoleaf-poi-extras-DuC7d1J8.js'),
        import('./chunks/geoleaf-route-DC4hPufW.js'),
        import('./chunks/geoleaf-layer-manager-Cp9pIcWZ.js'),
        import('./chunks/geoleaf-legend-BsT_bzSV.js'),
        import('./chunks/geoleaf-labels-CDcPyAy5.js'),
        import('./chunks/geoleaf-themes-DJXbe93Q.js'),
        import('./chunks/geoleaf-table-DWJIDi5D.js'),
    ]);
}

/**
 * GeoLeaf – Unified public API (assembly)
 * Phase 4.3 — Refactored robust Controller architecture
 *
 * Builds the GeoLeafAPI object by delegating to APIController.
 * This module is loaded after globals.api.js (which initializes _APIController).
 *
 * @module api/geoleaf-api
 */
const _g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g.GeoLeaf = _g.GeoLeaf || {};
// Retrieve any GeoLeaf already attached by the modules
const existing = _g.GeoLeaf || {};
// ⚠️ APIController checks are deferred into each function (lazy access).
// Module-level throws (before Object.assign) prevented Rollup from including the public API:
// with propertyReadSideEffects:false, Rollup statically analyzed APIController = undefined
// and concluded the throw was inevitable → all following code = dead code eliminated.
//
// Validation now happens at runtime, inside _getAPIController().
// Lazy and validated access to APIController (called in each public method)
function _getAPIController() {
    const ctrl = existing._APIController;
    if (!ctrl) {
        if (Log)
            Log.error("[GeoLeaf.API] APIController unavailable. API modules must be loaded before geoleaf.api.js");
        throw new Error("APIController missing - verify that API modules are loaded");
    }
    if (!ctrl.isInitialized) {
        if (Log)
            Log.error("[GeoLeaf.API] APIController in failed state. Checking state:", ctrl.getHealthStatus());
        throw new Error("APIController in failed state");
    }
    return ctrl;
}
// ---------------------------------------------------------------------
// API public delegated vers APIController
// ---------------------------------------------------------------------
/**
 * Initializes GeoLeaf with the provided options.
 * Delegates to `APIController.geoleafInit`.
 *
 * @param {object} options - GeoLeaf initialization options (mapId, profile, theme, etc.)
 * @returns {Promise<void>} Resolves when initialization is complete.
 */
function geoleafInit(options) {
    try {
        return _getAPIController().geoleafInit(options);
    }
    catch (error) {
        if (Log)
            Log.error("[GeoLeaf.init] Error during initialization:", error);
        throw error;
    }
}
/**
 * Applies a visual theme to the GeoLeaf map container.
 * Delegates to `APIController.geoleafSetTheme`.
 *
 * @param {string} theme - Theme identifier (e.g. `'default'`, `'dark'`, `'green'`).
 * @returns {void}
 */
function geoleafSetTheme(theme) {
    try {
        return _getAPIController().geoleafSetTheme(theme);
    }
    catch (error) {
        if (Log)
            Log.error("[GeoLeaf.setTheme] Error applying theme:", error);
        throw error;
    }
}
/**
 * Loads a GeoLeaf configuration from a URL string or a plain config object.
 * Validates input type before delegating to `APIController.geoleafLoadConfig`.
 *
 * @param {string | object} input - Remote URL to a JSON config file, or an inline config object.
 * @returns {Promise<void>} Resolves when the configuration has been loaded and applied.
 * @throws {TypeError} If `input` is null, undefined, or not a string/object.
 */
function geoleafLoadConfig(input) {
    if (input === null ||
        input === undefined ||
        (typeof input !== "string" && typeof input !== "object")) {
        throw new TypeError(`[GeoLeaf.loadConfig] Invalid input: expected string URL or config object, got ${typeof input}`);
    }
    try {
        return _getAPIController().geoleafLoadConfig(input);
    }
    catch (error) {
        if (Log)
            Log.error("[GeoLeaf.loadConfig] Error loading configuration:", error);
        throw error;
    }
}
// ---------------------------------------------------------------------
// Building of the API final (mutation de the object global GeoLeaf)
// ---------------------------------------------------------------------
const GeoLeafAPI = Object.assign(existing, {
    // Methods maines
    init: geoleafInit,
    setTheme: geoleafSetTheme,
    loadConfig: geoleafLoadConfig,
    // Constantes (source unique : constants/index.js)
    CONSTANTS: _g.GeoLeaf.CONSTANTS || {},
    // Alias retrocompat — BaseLayers = Baselayers
    get BaseLayers() {
        return this.Baselayers;
    },
    // Version (lue from the manifest ou les constantes)
    version: (_g.GeoLeaf.CONSTANTS && _g.GeoLeaf.CONSTANTS.VERSION) || "1.1.0",
    /**
     * Returns a registered GeoLeaf module by name via APIController.
     * @param {string} name - Module name (e.g. `'poi'`, `'route'`, `'table'`).
     * @returns {object | null} The module object, or `null` if not found.
     */
    getModule: function (name) {
        const ctrl = existing._APIController;
        return ctrl && ctrl.moduleAccessFn ? ctrl.moduleAccessFn(name) : null;
    },
    /**
     * Returns `true` if a GeoLeaf module with the given name is registered.
     * @param {string} name - Module name (e.g. `'poi'`, `'legend'`).
     * @returns {boolean}
     */
    hasModule: function (name) {
        const ctrl = existing._APIController;
        const mod = ctrl && ctrl.moduleAccessFn ? ctrl.moduleAccessFn(name) : null;
        return !!mod;
    },
    /**
     * Returns a top-level GeoLeaf namespace by name (e.g. `GeoLeaf['POI']`).
     * @param {string} name - Namespace key on the global `GeoLeaf` object.
     * @returns {object | null} The namespace object, or `null` if absent.
     */
    getNamespace: function (name) {
        return _g.GeoLeaf && name ? _g.GeoLeaf[name] || null : null;
    },
    /**
     * Creates a new MapLibre map instance managed by GeoLeaf.
     * @param {string} id - DOM element id for the map container.
     * @param {object} [options] - Optional GeoLeaf map options.
     * @returns {object | null} The map adapter instance, or `null` on failure.
     */
    createMap: function (id, options) {
        const ctrl = existing._APIController;
        return ctrl && ctrl.geoleafCreateMap ? ctrl.geoleafCreateMap(id, options) : null;
    },
    /**
     * Retrieves a managed map adapter instance by its container id.
     * @param {string} id - DOM element id of the target map container.
     * @returns {object | null} The map adapter instance, or `null` if not found.
     */
    getMap: function (id) {
        const ctrl = existing._APIController;
        return ctrl && ctrl.managers && ctrl.managers.factory
            ? ctrl.managers.factory.getMapInstance(id)
            : null;
    },
    /**
     * Returns all active map adapter instances managed by GeoLeaf.
     * @returns {object[]} Array of map adapter instances (may be empty).
     */
    getAllMaps: function () {
        const ctrl = existing._APIController;
        return ctrl && ctrl.managers && ctrl.managers.factory
            ? ctrl.managers.factory.getAllMapInstances()
            : [];
    },
    /**
     * Destroys and removes a managed map adapter instance.
     * @param {string} id - DOM element id of the map container to remove.
     * @returns {boolean} `true` if the map was found and removed, `false` otherwise.
     */
    removeMap: function (id) {
        const ctrl = existing._APIController;
        if (ctrl &&
            ctrl.managers &&
            ctrl.managers.factory &&
            typeof ctrl.managers.factory.removeMapInstance === "function") {
            return ctrl.managers.factory.removeMapInstance(id);
        }
        return false;
    },
    /**
     * Returns the current health status of the GeoLeaf APIController.
     * Includes module load states, error counts, and initialization flags.
     * @returns {object | null} Health status object, or `null` if APIController is unavailable.
     */
    getHealth: function () {
        const ctrl = existing._APIController;
        return ctrl && ctrl.getHealthStatus ? ctrl.getHealthStatus() : null;
    },
    /**
     * Alias for {@link GeoLeafAPI.getHealth} — returns APIController metrics.
     * @returns {object | null} Health status object.
     */
    getMetrics: function () {
        return this.getHealth();
    },
});
if (Log) {
    Log.info(`[GeoLeaf.API] Public API initialized successfully`);
    const _ctrl = existing._APIController;
    if (_ctrl)
        Log.info(`[GeoLeaf.API] APIController health:`, _ctrl.getHealthStatus());
}

/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module geoleaf.notifications
 *
 * @description
 * Public facade for the GeoLeaf Notifications module.
 * Exposes {@link Notifications} — a top-level shortcut to the internal
 * `NotificationSystem` singleton (`_UINotifications`).
 *
 * This facade provides the `GeoLeaf.Notifications` namespace used in the
 * ESM build, complementing the top-level `GeoLeaf.notify()` helper
 * registered in `globals.ui.ts`.
 *
 * @see {@link NotifyType}
 * @see {@link NotifyOptions}
 *
 * @example
 * // Shortcut (UMD / CDN)
 * GeoLeaf.notify("Données chargées", "success");
 *
 * @example
 * // Namespace complet (ESM)
 * import { Notifications } from "@geoleaf/core";
 * Notifications.success("Données chargées");
 * Notifications.error("Échec du chargement", { persistent: true, dismissible: true });
 *
 * @example
 * // Avec options
 * GeoLeaf.Notifications.notify("Mise à jour disponible", "info", { duration: 8000 });
 */
/**
 * Public Notifications namespace.
 *
 * Delegates all calls to the internal `_UINotifications` singleton
 * (initialized during the GeoLeaf boot sequence).
 *
 * Available as `GeoLeaf.Notifications` after the core is initialized,
 * and as a named ESM export `{ Notifications }` from `@geoleaf/core`.
 */
const Notifications = {
    /**
     * Displays a notification toast.
     *
     * Supports two call signatures:
     * - `notify(message, type, duration)` — positional, e.g. `notify("OK", "success", 3000)`
     * - `notify(message, options)`        — options object, e.g. `notify("OK", { type: "success", duration: 3000 })`
     *
     * @param message - Text to display.
     * @param typeOrOptions - Notification type (`"info"` | `"success"` | `"warning"` | `"error"`) or options object.
     * @param duration - Auto-dismiss duration in ms (only when `typeOrOptions` is a string).
     */
    notify(message, typeOrOptions, duration) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _UINotifications?.show?.(message, (typeOrOptions ?? "info"), duration);
    },
    /**
     * Displays a success toast.
     *
     * @param message - Text to display.
     * @param options - Optional duration (ms) or options object.
     *
     * @example
     * Notifications.success("Sauvegarde réussie");
     * Notifications.success("Sauvegarde réussie", { duration: 2000 });
     */
    success(message, options) {
        _UINotifications?.success?.(message, options);
    },
    /**
     * Displays an error toast (highest priority, longest default duration: 5 s).
     *
     * @param message - Text to display.
     * @param options - Optional duration (ms) or options object.
     *
     * @example
     * Notifications.error("Erreur réseau", { persistent: true, dismissible: true });
     */
    error(message, options) {
        _UINotifications?.error?.(message, options);
    },
    /**
     * Displays a warning toast.
     *
     * @param message - Text to display.
     * @param options - Optional duration (ms) or options object.
     *
     * @example
     * Notifications.warning("Connexion instable", { duration: 6000 });
     */
    warning(message, options) {
        _UINotifications?.warning?.(message, options);
    },
    /**
     * Displays an informational toast.
     *
     * @param message - Text to display.
     * @param options - Optional duration (ms) or options object.
     *
     * @example
     * Notifications.info("3 nouvelles alertes disponibles");
     */
    info(message, options) {
        _UINotifications?.info?.(message, options);
    },
    /**
     * Dismisses a specific toast by its DOM element reference.
     *
     * @param toastEl - The toast `HTMLElement` returned by a previous call.
     *
     * @example
     * const toast = Notifications.notify("Chargement…", "info", { persistent: true });
     * // later:
     * Notifications.dismiss(toast);
     */
    dismiss(toastEl) {
        _UINotifications?.dismiss?.(toastEl);
    },
    /**
     * Removes all visible toasts and clears the pending queue.
     *
     * @example
     * Notifications.clearAll();
     */
    clearAll() {
        _UINotifications?.clearAll?.();
    },
    /**
     * Returns a snapshot of the current notification system state.
     * Useful for debugging or building custom status indicators.
     *
     * @returns {NotifyStatus} Current system status.
     *
     * @example
     * const status = Notifications.getStatus();
     * console.log(status.activeToasts, status.queued);
     */
    getStatus() {
        return _UINotifications?.getStatus?.();
    },
};

/*!
 * GeoLeaf Core — ESM Entry Point
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
/**
 * @module bundle-esm-entry
 *
 * @description
 * GeoLeaf Bundle ESM Entry Point — Phase 7.
 *
 * This is the **exclusive entry point for ESM bundle generation** via Rollup
 * (`esmConfig` in `rollup.config.mjs`).
 *
 * Responsibilities:
 *   - Side-effects: `globals.js` (assigns `window.GeoLeaf.*`) + `app/` bootstrap
 *   - Dynamic `_loadModule` / `_loadAllSecondaryModules` helpers for lazy loading
 *   - 30 named ESM exports intended for third-party bundlers (Vite, webpack, etc.)
 *
 * Lazy chunks (`dist/chunks/`) are produced via dynamic `import()` expressions.
 * Each chunk is a separate network request for optimal code splitting.
 *
 * @version 2.0.0
 * @see app/init for the application initialization sequence
 */
// ── Side-effects : globals.js + bootstrap applicatif ──
// globals.js assigns window.GeoLeaf.* for CDN compatibility.
// app/* bootstraps the application.
// Assign helpers to the GeoLeaf global namespace (CDN compat).
// globals.js (imported above) already initialises window.GeoLeaf, so
// the null-coalesce below is a safety net for edge-case load orders.
const _gns = ((typeof globalThis !== "undefined" ? globalThis : window)["GeoLeaf"] ??= {});
_gns["_loadModule"] = loadModule;
_gns["_loadAllSecondaryModules"] = loadAllSecondaryModules;
var bundleEsmEntry = typeof window !== "undefined"
    ? window["GeoLeaf"]
    : {};

export { APIController, APIFactoryManager, APIInitializationManager, APIModuleManager, Baselayers, BootInfo, CONSTANTS, Config$3 as Config, Core, Errors, Events, Filters, GeoLeafAPI, Geocoding, Helpers$1 as Helpers, LayerManager$4 as LayerManager, Legend, Log, Notifications, POI, PWAManager as PWA, Permalink, PluginRegistry, Route, Table, UI, Utils, Validators, bundleEsmEntry as default, showBootInfo };
//# sourceMappingURL=geoleaf.esm.js.map
