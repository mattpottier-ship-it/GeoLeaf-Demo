import { x as Config, L as Log, p as getLabel, N as FetchHelper, G as DOMSecurity, o as domCreate, I as createElement, C as Core, M as StyleLoader } from './geoleaf-chunk-core-utils-DaOLFnYl.js';
import { G as GeoJSONCore, a as GeoJSONShared, L as Loader, V as VisibilityManager, b as LayerManager$1 } from './geoleaf-chunk-geojson-C3dRY-lH.js';
import { a as POIShared } from './geoleaf-chunk-poi-BGd7qlef.js';
import { L as LayerManager, a as LegendContract, S as StyleSelector } from './geoleaf-chunk-layers-BDO10P7Z.js';
import { R as Route } from './geoleaf-chunk-route-D0ayPYQo.js';
import { L as Legend } from './geoleaf-chunk-legend-D5XLrEY3.js';
import { L as Labels, a as LabelButtonManager } from './geoleaf-chunk-labels-CEgk8g7A.js';

/**
 * GeoLeaf Theme Applier - Core
 * Module state, init/cleanup, applyTheme orchestration, getCurrentThemeId
 *
 * @module themes/theme-applier/core
 */
const _Config$3 = Config;
function _showLegendOverlay() {
    if (Legend && typeof Legend.showLoadingOverlay === "function") {
        Legend.showLoadingOverlay();
    }
}
function _hideLegendOverlay() {
    if (Legend && typeof Legend.hideLoadingOverlay === "function") {
        Legend.hideLoadingOverlay();
    }
}
function _dispatchCustomEvent(name, detail) {
    try {
        document.dispatchEvent(new CustomEvent(name, { detail }));
    }
    catch (_e) {
        /* silent */
    }
}
function _refreshLayerManager() {
    if (LayerManager && LayerManager.refresh) {
        LayerManager.refresh();
    }
}
function _reapplyZoomVisibility() {
    const _gRef = typeof globalThis !== "undefined"
        ? globalThis
        : typeof window !== "undefined"
            ? window
            : {};
    const mgr = _gRef.GeoLeaf?._GeoJSONLayerManager;
    if (mgr && typeof mgr.updateLayerVisibilityByZoom === "function") {
        mgr.updateLayerVisibilityByZoom();
    }
}
function _updateLoadingProgress(p) {
    try {
        if (typeof window !== "undefined" &&
            window._glLoadingScreen &&
            typeof window._glLoadingScreen.updateProgress === "function") {
            window._glLoadingScreen.updateProgress(p);
        }
    }
    catch (_e) {
        /* ignore */
    }
}
async function _loadLayersInBatches(visibleLayers, batchSize, applyFn) {
    for (let i = 0; i < visibleLayers.length; i += batchSize) {
        const batch = visibleLayers.slice(i, i + batchSize);
        await Promise.all(batch.map((layerConfig) => applyFn(layerConfig)));
        if (i === 0) {
            _updateLoadingProgress(98);
        }
    }
}
/**
 * Theme Applier module
 * @namespace _ThemeApplier
 * @private
 */
const _ThemeApplier = {
    /** @type {string|null} Currently active theme */
    _currentThemeId: null,
    /** @type {boolean} Flag pour savoir si c'est le premier loading */
    _isFirstLoad: true,
    /**
     * Initializes the ThemeApplier
     * @private
     */
    _init() {
        this._pendingLayerConfigs = new Map();
        this._pendingCheckTimer = null;
    },
    /**
     * Nettoie les ressources
     * @private
     */
    _cleanup() {
        if (this._pendingCheckTimer) {
            clearTimeout(this._pendingCheckTimer);
            this._pendingCheckTimer = null;
        }
        if (this._pendingLayerConfigs) {
            this._pendingLayerConfigs.clear();
        }
    },
    /**
     * Applies a theme
     * @param {Object} theme - Configuration of the theme
     * @param {Object} [options] - Options d'application
     * @param {boolean} [options.fitBounds] - Force le fitBounds
     * @returns {Promise<void>}
     */
    applyTheme(theme, options = {}) {
        if (!this._pendingLayerConfigs) {
            this._init();
        }
        _showLegendOverlay();
        if (!theme || !theme.id) {
            return Promise.reject(new Error("Invalid theme"));
        }
        if (!GeoJSONCore || !LayerManager) {
            return Promise.reject(new Error("GeoJSON or LayerManager modules not available"));
        }
        _dispatchCustomEvent("geoleaf:theme:applying", {
            themeId: theme.id,
            themeName: theme.name || theme.label || theme.id,
        });
        return this._applyThemeLayers(theme, options);
    },
    _applyThemeLayers(theme, options) {
        this._hideAllLayers();
        const layerConfigs = theme.layers || [];
        const profileConfig = _Config$3?.Profile?.getActiveProfileConfig();
        const perfConfig = profileConfig?.performance || {};
        const enableFitBounds = false;
        const visibleLayers = layerConfigs.filter((cfg) => cfg.visible !== false);
        const BATCH_SIZE = perfConfig.themeBatchSize || 3;
        const self = this;
        return _loadLayersInBatches(visibleLayers, BATCH_SIZE, (cfg) => this._applyLayerConfig(cfg))
            .then(() => {
            _updateLoadingProgress(98);
            return Promise.resolve();
        })
            .then(() => {
            _updateLoadingProgress(99);
            self._currentThemeId = theme.id;
            _refreshLayerManager();
            _reapplyZoomVisibility();
            self._syncLegendVisibility();
            _dispatchCustomEvent("geoleaf:theme:applied", {
                themeId: theme.id,
                themeName: theme.name || theme.label || theme.id,
                layerCount: visibleLayers.length,
                totalLayersInTheme: layerConfigs.length,
                timestamp: new Date().toISOString(),
            });
            const shouldFitBounds = options.fitBounds === true || (self._isFirstLoad && enableFitBounds);
            if (shouldFitBounds) {
                setTimeout(() => {
                    self._fitBoundsOnAllLayers();
                }, 1000);
                self._isFirstLoad = false;
            }
        })
            .catch((err) => {
            throw err;
        })
            .finally(() => {
            _hideLegendOverlay();
        });
    },
    /**
     * Retrieves the ID of the theme currentlement active
     * @returns {string|null}
     */
    getCurrentThemeId() {
        return this._currentThemeId;
    },
};

/**
 * GeoLeaf Theme Cache
 * Cache lightweight for thes GeoJSON layers used par the themes.
 */
/**
 * Phase 7 — Premium Separation: IndexedDB lives in GeoLeaf-Plugins/plugin-storage.
 * Access it only via GeoLeaf.Storage.DB at runtime (after the plugin is loaded).
 */
function _getIndexedDB() {
    const g = typeof globalThis !== "undefined" ? globalThis : window;
    return g?.GeoLeaf?.Storage?.DB ?? null;
}
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
function _isCachedEntryValid(cached, profileId, maxAge) {
    if (profileId && cached.profileId && cached.profileId !== profileId)
        return false;
    return Date.now() - cached.timestamp <= maxAge;
}
const ThemeCache = {
    _config: {
        enabled: true,
        maxAge: MAX_AGE_MS,
    },
    /**
     * Retrieves a layer from the cache si elle est encore valide.
     * @param {string} layerId
     * @param {string} [profileId]
     * @returns {Promise<Object|null>}
     */
    async get(layerId, profileId) {
        if (!this._config.enabled) {
            return null;
        }
        const StorageDB = _getIndexedDB();
        if (!StorageDB) {
            return null;
        }
        try {
            const cached = await StorageDB.getLayer(layerId);
            if (!cached) {
                return null;
            }
            if (!_isCachedEntryValid(cached, profileId, this._config.maxAge)) {
                Log?.debug(`[ThemeCache] Cache invalide pour ${layerId}`);
                return null;
            }
            Log?.info(`[ThemeCache] Cache hit pour ${layerId}`);
            return cached.data;
        }
        catch (err) {
            Log?.warn(`[ThemeCache] Lecture cache impossible pour ${layerId}: ${err.message}`);
            return null;
        }
    },
    /**
     * Stocke a layer in the cache.
     * @param {string} layerId
     * @param {string} [profileId]
     * @param {Object} data
     * @param {Object} [metadata]
     * @returns {Promise<void>}
     */
    async store(layerId, profileId, data, metadata = {}) {
        if (!this._config.enabled) {
            return;
        }
        const StorageDB = _getIndexedDB();
        if (!StorageDB) {
            return;
        }
        try {
            await StorageDB.cacheLayer(layerId, data, profileId || null, metadata);
            if (Log)
                Log.debug(`[ThemeCache] Couche mise en cache: ${layerId}`);
        }
        catch (err) {
            if (Log)
                Log.warn(`[ThemeCache] Cache write failed ${layerId}: ${err.message}`);
        }
    },
    /**
     * Invalid a layer en cache.
     * @param {string} layerId
     * @returns {Promise<void>}
     */
    async invalidate(layerId) {
        const StorageDB = _getIndexedDB();
        if (!StorageDB) {
            return;
        }
        try {
            await StorageDB.removeLayer(layerId);
            if (Log)
                Log.info(`[ThemeCache] Cache invalidated for ${layerId}`);
        }
        catch (err) {
            if (Log)
                Log.warn(`[ThemeCache] Impossible d'invalider ${layerId}: ${err.message}`);
        }
    },
};

/**
 * Module Theme Loader
 * Loads et met en cache le file themes.json
 *
 * DEPENDENCIES:
 * - GeoLeaf.Log (optional)
 * - GeoLeaf.Core.getActiveProfile()
 *
 * EXPOSE:
 * - GeoLeaf._ThemeLoader
 *
 * @module _ThemeLoader
 * @private
 */
/**
 * Cache for thes configurations de themes
 * @type {Map<string, Object>}
 */
const _cache = new Map();
/**
 * Promises en cours de loading
 * @type {Map<string, Promise>}
 */
const _loadingPromises = new Map();
function _normalizeTheme(theme) {
    if (!theme.id) {
        Log?.warn("[ThemeLoader] Theme without ID ignored");
        return null;
    }
    return {
        id: theme.id,
        label: theme.label || theme.id,
        type: theme.type || "secondary",
        description: theme.description || "",
        icon: theme.icon || "",
        layers: Array.isArray(theme.layers) ? theme.layers : [],
    };
}
function _resolveDefaultTheme(validatedConfig) {
    if (!validatedConfig.defaultTheme) {
        validatedConfig.defaultTheme = validatedConfig.themes[0].id;
        return;
    }
    const defaultExists = validatedConfig.themes.some((t) => t.id === validatedConfig.defaultTheme);
    if (!defaultExists) {
        Log?.warn("[ThemeLoader] defaultTheme not found, using first theme");
        validatedConfig.defaultTheme = validatedConfig.themes[0].id;
    }
}
/**
 * Module Theme Loader
 * @namespace _ThemeLoader
 * @private
 */
function _doFetchThemesConfig(themesPath, validateFn, profileId, Log, _cache, _loadingPromises) {
    if (FetchHelper) {
        return FetchHelper.get(themesPath, { timeout: 8000, retries: 1, parseResponse: true })
            .then((data) => {
            if (Log)
                Log.debug("[ThemeLoader] File loaded:", themesPath);
            const validated = validateFn(data);
            _cache.set(profileId, validated);
            _loadingPromises.delete(profileId);
            return validated;
        })
            .catch((err) => {
            if (Log)
                Log.warn("[ThemeLoader] Error loading themes.json:", err.message);
            _loadingPromises.delete(profileId);
            throw err;
        });
    }
    else {
        return fetch(themesPath)
            .then((response) => {
            if (!response.ok)
                throw new Error(`HTTP Error ${response.status} while loading ${themesPath}`);
            return response.json();
        })
            .then((data) => {
            if (Log)
                Log.debug("[ThemeLoader] File loaded:", themesPath);
            const validated = validateFn(data);
            _cache.set(profileId, validated);
            _loadingPromises.delete(profileId);
            return validated;
        })
            .catch((err) => {
            if (Log)
                Log.warn("[ThemeLoader] Error loading themes.json:", err.message);
            _loadingPromises.delete(profileId);
            throw err;
        });
    }
}
const _ThemeLoader = {
    /**
     * Loads the file themes.json pour a profile
     * @param {string} profileId - ID of the profile
     * @returns {Promise<Object>} Configuration des themes
     */
    loadThemesConfig(profileId) {
        if (Log)
            Log.debug("[ThemeLoader] loadThemesConfig called for:", profileId);
        if (_cache.has(profileId)) {
            if (Log)
                Log.debug("[ThemeLoader] Config cached for:", profileId);
            return Promise.resolve(_cache.get(profileId));
        }
        if (_loadingPromises.has(profileId)) {
            if (Log)
                Log.debug("[ThemeLoader] Loading already in progress for:", profileId);
            return _loadingPromises.get(profileId);
        }
        const isInDemo = window.location.pathname.includes("/demo/");
        const basePath = isInDemo ? "../" : "";
        const themesPath = `${basePath}profiles/${profileId}/themes.json`;
        const loadPromise = _doFetchThemesConfig(themesPath, (d) => this._validateConfig(d), profileId, Log, _cache, _loadingPromises);
        _loadingPromises.set(profileId, loadPromise);
        return loadPromise;
    },
    /**
     * Valide et normalise la configuration des themes
     * @param {Object} config - Configuration brute
     * @returns {Object} Configuration validated
     * @private
     */
    _validateConfig(config) {
        if (!config || typeof config !== "object") {
            throw new Error("Invalid theme configuration");
        }
        // Values by default pour config
        const validatedConfig = {
            config: {
                primaryThemes: {
                    enabled: true,
                    position: "top-map",
                    ...(config.config?.primaryThemes || {}),
                },
                secondaryThemes: {
                    enabled: true,
                    placeholder: getLabel("ui.theme.select_placeholder"),
                    showNavigationButtons: true,
                    position: "top-layermanager",
                    ...(config.config?.secondaryThemes || {}),
                },
            },
            themes: [],
            defaultTheme: config.defaultTheme || null,
        };
        // Valider the themes
        if (!Array.isArray(config.themes)) {
            Log?.warn("[ThemeLoader] No theme defined in configuration");
            return validatedConfig;
        }
        // Normaliser chaque theme
        validatedConfig.themes = config.themes.map(_normalizeTheme).filter(Boolean);
        // Check qu'il y a au moins a theme
        if (validatedConfig.themes.length === 0) {
            throw new Error("Aucun theme valide found dans la configuration");
        }
        // Check que le defaultTheme existe
        _resolveDefaultTheme(validatedConfig);
        Log?.debug("[ThemeLoader] Configuration validated:", validatedConfig.themes.length, "themes");
        return validatedConfig;
    },
    /**
     * Empty le cache (pour tests ou reloading)
     * @param {string} [profileId] - Profile ID (optional, empties all if not specified)
     */
    clearCache(profileId) {
        if (profileId) {
            _cache.delete(profileId);
            _loadingPromises.delete(profileId);
            if (Log)
                Log.debug("[ThemeLoader] Cache cleared for:", profileId);
        }
        else {
            _cache.clear();
            _loadingPromises.clear();
            if (Log)
                Log.debug("[ThemeLoader] Full cache cleared");
        }
    },
};

/**
 * Primary theme threshold beyond which the bar switches to compact mode.
 * Configurable via config.primaryThemes.compactThreshold (Phase 4).
 */
const PRIMARY_COMPACT_THRESHOLD = 5;
/**
 * Shared state of the module ThemeSelector
 */
const _state$1 = {
    initialized: false,
    profileId: null,
    config: null,
    themes: [],
    primaryThemes: [],
    secondaryThemes: [],
    currentTheme: null,
    // UI references
    primaryContainer: null,
    secondaryContainer: null,
    dropdown: null,
    // Event listner cleanup tracking
    _eventCleanups: [],
    // Mode compact – references DOM (Phase 4)
    primaryScrollEl: null,
    primaryScrollNavPrev: null,
    primaryScrollNavNext: null,
};

/**
 * Attaches a native DOM event handler on an element.
 * Registers the cleanup in _state._eventCleanups.
 *
 * Uses a non-capturing stopPropagation wrapper so that clicks on
 * theme-selector buttons do not propagate to the map canvas, while
 * still allowing the handler itself to execute normally.
 *
 * @param el - Target DOM element
 * @param eventType - Event type ("click", "change", etc.)
 * @param handler - Handler
 * @param _tag - Debug tag (kept for call-site compat, unused)
 */
function attachDOMEvent(el, eventType, handler, _tag) {
    el.addEventListener(eventType, handler);
    // Prevent click from reaching the map
    // Uses bubbling phase so the handler above fires first.
    const stopProp = (e) => e.stopPropagation();
    el.addEventListener("click", stopProp);
    _state$1._eventCleanups.push(() => el.removeEventListener(eventType, handler), () => el.removeEventListener("click", stopProp));
}

/**
 * Attache le manager for click sur un button de navigation compact (prev/next).
 *
 * @param btn - Button nav
 * @param direction - "prev" | "next"
 */
function attachCompactNavHandler(btn, direction) {
    const SCROLL_AMOUNT = 120; // px par click
    const onClick = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        if (!_state$1.primaryScrollEl)
            return;
        const delta = direction === "next" ? SCROLL_AMOUNT : -SCROLL_AMOUNT;
        _state$1.primaryScrollEl.scrollBy({ left: delta, behavior: "smooth" });
    };
    attachDOMEvent(btn, "click", onClick);
}
/**
 * Updates the state disabled des buttons de navigation compacts.
 */
function updatePrimaryNavButtons() {
    const el = _state$1.primaryScrollEl;
    if (!el)
        return;
    const atStart = el.scrollLeft <= 2;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    if (_state$1.primaryScrollNavPrev)
        _state$1.primaryScrollNavPrev.disabled = atStart;
    if (_state$1.primaryScrollNavNext)
        _state$1.primaryScrollNavNext.disabled = atEnd;
}
/**
 * Scrolls the compact bar to make the active theme visible.
 *
 * @param themeId - ID of the theme active
 */
function ensurePrimaryThemeVisible(themeId) {
    if (!_state$1.primaryScrollEl)
        return;
    const btn = _state$1.primaryScrollEl.querySelector(`[data-theme-id="${themeId}"]`);
    if (!btn)
        return;
    btn.scrollIntoView?.({ behavior: "smooth", block: "nearest", inline: "nearest" });
    // Recalculate nav button state after scrolling
    setTimeout(() => updatePrimaryNavButtons(), 350);
}

/**
 * Attache le manager for click sur un button de theme main.
 *
 * @param btn - Button DOM
 * @param theme - Configuration of the theme
 * @param setThemeFn - Fonction de changement de theme
 */
function attachPrimaryButtonHandler(btn, theme, setThemeFn) {
    const onClick = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        setThemeFn(theme.id);
    };
    attachDOMEvent(btn, "click", onClick);
}
/**
 * Updates the state active des buttons principaux et manages le scroll compact.
 *
 * @param themeId - ID of the theme active
 */
function updateUIStatePrimary(themeId) {
    if (!_state$1.primaryContainer)
        return;
    const buttons = _state$1.primaryContainer.querySelectorAll(".gl-theme-btn");
    buttons.forEach((btn) => {
        if (btn.dataset.themeId === themeId) {
            btn.classList.add("gl-theme-btn--active");
        }
        else {
            btn.classList.remove("gl-theme-btn--active");
        }
    });
    // Compact mode: scroll to the active theme (Phase 4)
    if (_state$1.primaryScrollEl) {
        ensurePrimaryThemeVisible(themeId);
    }
}
/**
 * Creates the UI for main themes (buttons + compact mode if threshold exceeded).
 *
 * @param setThemeFn - Theme change function passed as callback
 */
function _buildCompactPrimaryUI(container) {
    container.classList.add("gl-theme-selector-primary--compact");
    const navPrev = domCreate("button", "gl-theme-selector-primary__nav gl-theme-selector-primary__nav--prev", container);
    navPrev.type = "button";
    navPrev.setAttribute("aria-label", getLabel("aria.themes.nav_prev"));
    navPrev.innerHTML = "&#8249;"; // SAFE: static HTML entity, no user data
    _state$1.primaryScrollNavPrev = navPrev;
    attachCompactNavHandler(navPrev, "prev");
    const scrollEl = domCreate("div", "gl-theme-selector-primary__scroll", container);
    _state$1.primaryScrollEl = scrollEl;
    scrollEl.addEventListener("scroll", () => updatePrimaryNavButtons());
    const navNext = domCreate("button", "gl-theme-selector-primary__nav gl-theme-selector-primary__nav--next", container);
    navNext.type = "button";
    navNext.setAttribute("aria-label", getLabel("aria.themes.nav_next"));
    navNext.innerHTML = "&#8250;"; // SAFE: static HTML entity, no user data
    _state$1.primaryScrollNavNext = navNext;
    attachCompactNavHandler(navNext, "next");
    return scrollEl;
}
function createPrimaryUI(setThemeFn) {
    if (!_state$1.primaryContainer)
        return;
    // Emptyr le conteneur
    DOMSecurity.clearElementFast(_state$1.primaryContainer);
    // Addsr la class CSS (retirer d'abord --compact au case de re-init)
    _state$1.primaryContainer.classList.add("gl-theme-selector-primary");
    _state$1.primaryContainer.classList.remove("gl-theme-selector-primary--compact");
    // Reset references mode compact
    _state$1.primaryScrollEl = null;
    _state$1.primaryScrollNavPrev = null;
    _state$1.primaryScrollNavNext = null;
    // Seuil configurable (Phase 4) : si > seuil → mode compact (nav + scroll horizontal)
    const threshold = _state$1.config?.primaryThemes?.compactThreshold ?? PRIMARY_COMPACT_THRESHOLD;
    const isCompact = _state$1.primaryThemes.length > threshold;
    // Conteneur qui recevra les buttons (direct ou zone scrollable)
    let btnParent = _state$1.primaryContainer;
    if (isCompact) {
        btnParent = _buildCompactPrimaryUI(_state$1.primaryContainer);
    }
    // Createsr un button pour chaque theme main
    _state$1.primaryThemes.forEach((theme) => {
        const btn = domCreate("button", "gl-theme-btn", btnParent);
        btn.type = "button";
        btn.dataset.themeId = theme.id;
        btn.title = theme.description || theme.label;
        // Contenu du button : icon + label
        const iconSpan = domCreate("span", "gl-theme-btn__icon", btn);
        iconSpan.textContent = theme.icon || "";
        const labelSpan = domCreate("span", "gl-theme-btn__label", btn);
        labelSpan.textContent = theme.label;
        // Marquer the theme active
        if (theme.id === _state$1.currentTheme) {
            btn.classList.add("gl-theme-btn--active");
        }
        // Manager for click
        attachPrimaryButtonHandler(btn, theme, setThemeFn);
    });
    if (isCompact) {
        // Initializesr the state des buttons nav after rendu (scrollWidth available)
        requestAnimationFrame(() => updatePrimaryNavButtons());
    }
    if (Log)
        Log.debug("[ThemeSelector] Primary UI created:", _state$1.primaryThemes.length, "buttons", isCompact ? "(mode compact)" : "");
}

/**
 * Attache le manager for changement sur le dropdown secondary.
 *
 * @param select - Element select
 * @param setThemeFn - Fonction de changement de theme
 */
function attachDropdownHandler(select, setThemeFn) {
    const onChange = (ev) => {
        ev.stopPropagation();
        const themeId = select.value;
        if (Log)
            Log.info(`[ThemeSelector] Dropdown changed: ${themeId}`);
        if (themeId) {
            setThemeFn(themeId);
        }
        else {
            if (Log)
                Log.warn("[ThemeSelector] Dropdown: themeId vide");
        }
    };
    attachDOMEvent(select, "change", onChange);
    if (Log)
        Log.debug("[ThemeSelector] Dropdown handler attached");
}
/**
 * Attache le manager sur un button de navigation secondary (prev/next).
 *
 * @param btn - Button DOM
 * @param direction - "prev" | "next"
 * @param nextThemeFn - Fonction pour enable the theme suivant
 * @param previousThemeFn - Fonction pour enable the theme previous
 */
function attachNavButtonHandler(btn, direction, nextThemeFn, previousThemeFn) {
    const onClick = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        if (direction === "next") {
            nextThemeFn();
        }
        else {
            previousThemeFn();
        }
    };
    attachDOMEvent(btn, "click", onClick);
}
/**
 * Updates the state du dropdown after un changement de theme.
 *
 * @param themeId - ID of the theme active
 */
function updateUIStateSecondary(themeId) {
    if (!_state$1.dropdown)
        return;
    const isSecondary = _state$1.secondaryThemes.some((t) => t.id === themeId);
    if (isSecondary) {
        _state$1.dropdown.value = themeId;
    }
    else {
        _state$1.dropdown.value = "";
    }
}
/**
 * Creates the UI des themes secondarys (dropdown + buttons prev/next).
 *
 * @param setThemeFn - Fonction de changement de theme
 * @param nextThemeFn - Callback theme suivant
 * @param previousThemeFn - Callback theme previous
 */
function _buildSecondaryNavButton(wrapper, dir, nextFn, prevFn) {
    const cls = dir === "prev" ? "gl-theme-nav gl-theme-nav--prev" : "gl-theme-nav gl-theme-nav--next";
    const btn = domCreate("button", cls, wrapper);
    btn.type = "button";
    btn.textContent = dir === "prev" ? "❮" : "❯";
    btn.title =
        dir === "prev" ? getLabel("aria.themes.prev_title") : getLabel("aria.themes.next_title");
    attachNavButtonHandler(btn, dir, nextFn, prevFn);
}
function _buildSecondaryDropdown(wrapper, setThemeFn) {
    const select = domCreate("select", "gl-theme-dropdown", wrapper);
    _state$1.dropdown = select;
    select.setAttribute("aria-label", getLabel("aria.themes.secondary_select"));
    const placeholder = createElement("option", {
        value: "",
        textContent: _state$1.config.secondaryThemes.placeholder,
        disabled: true,
    });
    select.appendChild(placeholder);
    _state$1.secondaryThemes.forEach((theme) => {
        const opt = createElement("option", { value: theme.id, textContent: theme.label });
        select.appendChild(opt);
    });
    const currentIsSecondary = _state$1.secondaryThemes.some((t) => t.id === _state$1.currentTheme);
    select.value = currentIsSecondary ? _state$1.currentTheme : "";
    attachDropdownHandler(select, setThemeFn);
}
function createSecondaryUI(setThemeFn, nextThemeFn, previousThemeFn) {
    if (!_state$1.secondaryContainer) {
        if (Log)
            Log.warn("[ThemeSelector] Conteneur secondaire introuvable");
        return;
    }
    if (Log)
        Log.debug("[ThemeSelector] Creating secondary UI:", _state$1.secondaryThemes.length, "themes");
    if (Log)
        Log.debug("[ThemeSelector] IDs:", _state$1.secondaryThemes.map((t) => t.id));
    DOMSecurity.clearElementFast(_state$1.secondaryContainer);
    _state$1.secondaryContainer.classList.add("gl-theme-selector-secondary");
    const wrapper = domCreate("div", "gl-theme-selector-secondary__wrapper", _state$1.secondaryContainer);
    if (_state$1.config.secondaryThemes.showNavigationButtons) {
        _buildSecondaryNavButton(wrapper, "prev", nextThemeFn, previousThemeFn);
    }
    _buildSecondaryDropdown(wrapper, setThemeFn);
    if (_state$1.config.secondaryThemes.showNavigationButtons) {
        _buildSecondaryNavButton(wrapper, "next", nextThemeFn, previousThemeFn);
    }
    if (Log)
        Log.debug("[ThemeSelector] Secondary UI created:", _state$1.secondaryThemes.length, "themes");
}

/**
 * Module Theme Selector — Orchestrateur
 * Selector de themes global (principaux + secondarys)
 *
 * DEPENDENCIES:
 * - Native DOM events
 * - GeoLeaf.Log (optional)
 * - GeoLeaf._ThemeLoader
 * - GeoLeaf._ThemeApplier
 * - GeoLeaf.Core.getActiveProfile()
 *
 * EXPOSE:
 * - GeoLeaf.ThemeSelector
 *
 * @module ThemeSelector
 * @public
 */
/**
 * Module Theme Selector
 * @namespace ThemeSelector
 * @public
 */
const ThemeSelector = {
    /**
     * Initializes le selector de themes
     * @param {Object} options - Options d'initialization
     * @param {string} options.profileId - ID of the profile
     * @param {HTMLElement} [options.primaryContainer] - Conteneur pour buttons principaux
     * @param {HTMLElement} [options.secondaryContainer] - Conteneur pour dropdown secondary
     * @returns {Promise<void>}
     */
    init(options) {
        if (!options || !options.profileId) {
            return Promise.reject(new Error("profileId required for ThemeSelector.init"));
        }
        if (Log)
            Log.debug("[ThemeSelector] Initializing for profile:", options.profileId);
        _state$1.profileId = options.profileId;
        _state$1.primaryContainer = options.primaryContainer || null;
        _state$1.secondaryContainer = options.secondaryContainer || null;
        // Loadsr la configuration des themes
        return _ThemeLoader.loadThemesConfig(options.profileId)
            .then((themesConfig) => {
            _state$1.config = themesConfig.config;
            _state$1.themes = themesConfig.themes;
            _state$1.primaryThemes = themesConfig.themes.filter((t) => t.type === "primary");
            _state$1.secondaryThemes = themesConfig.themes.filter((t) => t.type === "secondary");
            _state$1.currentTheme = themesConfig.defaultTheme;
            if (Log)
                Log.debug("[ThemeSelector] Configuration loaded:", {
                    total: _state$1.themes.length,
                    primary: _state$1.primaryThemes.length,
                    secondary: _state$1.secondaryThemes.length,
                });
            // Createsr l'UI
            this._createUI();
            // Marquer comme initialized AVANT d'appliquer the theme
            _state$1.initialized = true;
            // Appliesr the theme by default
            return this.setTheme(_state$1.currentTheme);
        })
            .then(() => {
            if (Log)
                Log.debug("[ThemeSelector] Initialization complete");
            // Emit the theme loading completion event
            const event = new CustomEvent("geoleaf:themes:ready", {
                detail: { time: Date.now() },
            });
            document.dispatchEvent(event);
        })
            .catch((err) => {
            if (Log)
                Log.warn("[ThemeSelector] Erreur initialization:", err.message);
            // Emit event even in case of error
            const event = new CustomEvent("geoleaf:themes:ready", {
                detail: { time: Date.now(), error: err.message },
            });
            document.dispatchEvent(event);
            throw err;
        });
    },
    /**
     * Creates the interface user
     * @private
     */
    _createUI() {
        // Check si le selector de themes est activated globalement
        const uiConfig = Config?.get?.("ui") ?? null;
        const showThemeSelector = uiConfig ? uiConfig.showThemeSelector === true : false;
        if (!showThemeSelector) {
            if (Log)
                Log.debug("[ThemeSelector] showThemeSelector is false, UI not created");
            return;
        }
        // Createsr l'UI des themes principaux
        if (_state$1.config.primaryThemes.enabled && _state$1.primaryContainer) {
            createPrimaryUI((id) => this.setTheme(id));
        }
        // Createsr l'UI des themes secondarys
        if (_state$1.config.secondaryThemes.enabled && _state$1.secondaryContainer) {
            createSecondaryUI((id) => this.setTheme(id), () => this.nextTheme(), () => this.previousTheme());
        }
    },
    /**
     * Active a theme par son ID
     * @param {string} themeId - ID of the theme
     * @returns {Promise<void>}
     */
    setTheme(themeId) {
        if (!_state$1.initialized) {
            return Promise.reject(new Error("ThemeSelector not initialized"));
        }
        const theme = _state$1.themes.find((t) => t.id === themeId);
        if (!theme) {
            return Promise.reject(new Error(`Theme not found: ${themeId}`));
        }
        if (Log)
            Log.debug("[ThemeSelector] setTheme:", themeId);
        // Appliesr the theme
        return _ThemeApplier.applyTheme(theme)
            .then(() => {
            _state$1.currentTheme = themeId;
            // Mettre up to date l'UI
            this._updateUIState(themeId);
            if (Log)
                Log.debug("[ThemeSelector] Theme activated:", themeId);
        })
            .catch((err) => {
            if (Log)
                Log.warn("[ThemeSelector] Theme activation error:", err.message);
            throw err;
        });
    },
    /**
     * Updates the state visuel of the UI after un changement de theme
     * @param {string} themeId - ID of the theme active
     * @private
     */
    _updateUIState(themeId) {
        updateUIStatePrimary(themeId);
        updateUIStateSecondary(themeId);
    },
    /**
     * Active the theme secondary suivant
     */
    nextTheme() {
        if (!_state$1.initialized || _state$1.secondaryThemes.length === 0) {
            return;
        }
        const currentIsSecondary = _state$1.secondaryThemes.some((t) => t.id === _state$1.currentTheme);
        let nextIndex = 0;
        if (currentIsSecondary) {
            const currentIndex = _state$1.secondaryThemes.findIndex((t) => t.id === _state$1.currentTheme);
            nextIndex = (currentIndex + 1) % _state$1.secondaryThemes.length;
        }
        const nextTheme = _state$1.secondaryThemes[nextIndex];
        if (nextTheme) {
            this.setTheme(nextTheme.id);
        }
    },
    /**
     * Active the theme secondary previous
     */
    previousTheme() {
        if (!_state$1.initialized || _state$1.secondaryThemes.length === 0) {
            return;
        }
        const currentIsSecondary = _state$1.secondaryThemes.some((t) => t.id === _state$1.currentTheme);
        let prevIndex = _state$1.secondaryThemes.length - 1;
        if (currentIsSecondary) {
            const currentIndex = _state$1.secondaryThemes.findIndex((t) => t.id === _state$1.currentTheme);
            prevIndex =
                (currentIndex - 1 + _state$1.secondaryThemes.length) % _state$1.secondaryThemes.length;
        }
        const prevTheme = _state$1.secondaryThemes[prevIndex];
        if (prevTheme) {
            this.setTheme(prevTheme.id);
        }
    },
    /**
     * Retrieves the theme currentlement active
     * @returns {string|null}
     */
    getCurrentTheme() {
        return _state$1.currentTheme;
    },
    /**
     * Retrieves tous the themes
     * @returns {Array}
     */
    getThemes() {
        return _state$1.themes;
    },
    /**
     * Retrieves thes themes principaux
     * @returns {Array}
     */
    getPrimaryThemes() {
        return _state$1.primaryThemes;
    },
    /**
     * Retrieves thes themes secondarys
     * @returns {Array}
     */
    getSecondaryThemes() {
        return _state$1.secondaryThemes;
    },
    /**
     * Checks if the module est initialized
     * @returns {boolean}
     */
    isInitialized() {
        return _state$1.initialized;
    },
    /**
     * Cleanup method for event listners
     * Call this when destroying the theme selector
     */
    destroy() {
        if (Log)
            Log.debug("[ThemeSelector] Cleaning up event listeners");
        if (_state$1._eventCleanups) {
            _state$1._eventCleanups.forEach((cleanup) => {
                if (typeof cleanup === "function") {
                    cleanup();
                }
            });
            _state$1._eventCleanups = [];
        }
        _state$1.initialized = false;
    },
};

/**
 * GeoLeaf Theme Applier - Deferred
 * Loadsment deferred de layers, resolution de profile, gestion du cache
 *
 * @module themes/theme-applier/deferred
 */
const _Config$2 = Config;
/**
 * Programme l'application of a configuration de layer pour plus tard
 * @param {string} layerId - ID de the layer
 * @param {boolean} visible - Desired visibility
 * @param {string} styleId - ID du style to appliquer
 * @returns {Promise<void>}
 * @private
 */
_ThemeApplier._scheduleLayerConfig = function (layerId, visible, styleId) {
    if (!_ThemeApplier._pendingLayerConfigs) {
        _ThemeApplier._pendingLayerConfigs = new Map();
    }
    _ThemeApplier._pendingLayerConfigs.set(layerId, { visible, styleId });
    // Schedule a periodic check
    _ThemeApplier._schedulePendingCheck();
    return Promise.resolve();
};
/**
 * Planifie une verification des layers en attente
 * @private
 */
_ThemeApplier._schedulePendingCheck = function () {
    if (_ThemeApplier._pendingCheckTimer) {
        return; // Already scheduled
    }
    _ThemeApplier._pendingCheckTimer = setTimeout(() => {
        _ThemeApplier._checkPendingLayerConfigs();
        _ThemeApplier._pendingCheckTimer = null;
    }, 1000);
};
/**
 * Checks and applies pending layer configurations
 * @private
 */
_ThemeApplier._checkPendingLayerConfigs = function () {
    if (!_ThemeApplier._pendingLayerConfigs || _ThemeApplier._pendingLayerConfigs.size === 0) {
        return;
    }
    const appliedLayers = [];
    for (const [layerId, config] of _ThemeApplier._pendingLayerConfigs) {
        const layerData = GeoJSONShared.state.layers?.get(layerId);
        if (layerData) {
            _ThemeApplier._setLayerVisibilityAndStyle(layerId, config.visible, config.styleId);
            appliedLayers.push(layerId);
        }
    }
    // Removes processed layers
    appliedLayers.forEach((layerId) => {
        _ThemeApplier._pendingLayerConfigs.delete(layerId);
    });
    // S'il reste des layers en attente, programmer une nouvelle verification
    if (_ThemeApplier._pendingLayerConfigs.size > 0) {
        _ThemeApplier._schedulePendingCheck();
    }
};
function _getProfileLayers(activeProfile) {
    if (Array.isArray(activeProfile.geojsonLayers))
        return activeProfile.geojsonLayers;
    if (activeProfile.geojson && Array.isArray(activeProfile.geojson.layers))
        return activeProfile.geojson.layers;
    if (Array.isArray(activeProfile.layers))
        return activeProfile.layers;
    if (Array.isArray(activeProfile.Layers))
        return activeProfile.Layers;
    return [];
}
function _layerType(lc) {
    if (lc.geometryType)
        return lc.geometryType;
    if (lc.type)
        return lc.type;
    return "geojson";
}
function _applyDeferredClusteringNorm(layerDef, normalizedDef) {
    if (!(layerDef.clustering && typeof layerDef.clustering === "object"))
        return;
    normalizedDef.clustering = layerDef.clustering.enabled !== false;
    if (typeof layerDef.clustering.maxClusterRadius === "number") {
        normalizedDef.maxClusterRadius = layerDef.clustering.maxClusterRadius;
        normalizedDef.clusterRadius = layerDef.clustering.maxClusterRadius;
    }
    if (typeof layerDef.clustering.disableClusteringAtZoom === "number") {
        normalizedDef.disableClusteringAtZoom = layerDef.clustering.disableClusteringAtZoom;
    }
}
function _normalizeDeferredLayerDef(layerDef, cachedData) {
    const normalizedDef = { ...layerDef };
    if (layerDef.popup && layerDef.popup.fields)
        normalizedDef.popupFields = layerDef.popup.fields;
    if (layerDef.tooltip && layerDef.tooltip.fields)
        normalizedDef.tooltipFields = layerDef.tooltip.fields;
    if (layerDef.sidepanel && layerDef.sidepanel.detailLayout)
        normalizedDef.sidepanelFields = layerDef.sidepanel.detailLayout;
    _applyDeferredClusteringNorm(layerDef, normalizedDef);
    if (cachedData)
        normalizedDef._cachedData = cachedData;
    return normalizedDef;
}
async function _loadAndCache(loader, layerId, layerLabel, normalizedDef, profileId, cachedData) {
    const layer = await loader.call(Loader, layerId, layerLabel, normalizedDef, {});
    if (cachedData && ThemeCache && typeof ThemeCache.store === "function") {
        ThemeCache.store(layerId, profileId, cachedData);
    }
    return layer;
}
async function _getCachedData(layerId, profileId) {
    if (ThemeCache && typeof ThemeCache.get === "function") {
        return await ThemeCache.get(layerId, profileId);
    }
    return null;
}
async function _buildAndLoadLayer(loader, layerId, layerConfig, dataUrl, profileId) {
    const layerLabel = layerConfig.label ? layerConfig.label : layerId;
    const cachedData = await _getCachedData(layerId, profileId);
    const layerDef = {
        ...layerConfig,
        url: dataUrl,
        type: _layerType(layerConfig),
        _profileId: profileId,
        _layerDirectory: layerConfig._layerDirectory,
    };
    const normalizedDef = _normalizeDeferredLayerDef(layerDef, cachedData);
    try {
        return await _loadAndCache(loader, layerId, layerLabel, normalizedDef, profileId, cachedData);
    }
    catch (err) {
        Log.warn(`[ThemeApplier._loadLayerFromProfile] Erreur loading layer "${layerId}":`, err ? err.message : err);
        return null;
    }
}
function _getActiveProfileAndLayers(layerId) {
    const activeProfile = Config.getActiveProfile();
    if (!activeProfile || typeof activeProfile !== "object")
        return null;
    const profileLayersConfig = _getProfileLayers(activeProfile);
    if (profileLayersConfig.length === 0)
        return null;
    const layerConfig = profileLayersConfig.find((config) => config.id === layerId);
    if (!layerConfig)
        return null;
    const dataUrl = _ThemeApplier._resolveDataFilePath(layerConfig);
    if (!dataUrl)
        return null;
    return { layerConfig, dataUrl, profileId: activeProfile.id ?? null };
}
/**
 * Loads a layer from the active profile (with error tolerance)
 * @param {string} layerId - ID de the layer to load
 * @returns {Promise<Object|null>} - Couche loadede ou null si error
 * @private
 */
_ThemeApplier._loadLayerFromProfile = async function (layerId) {
    if (!Config || typeof Config.getActiveProfile !== "function")
        return null;
    try {
        const found = _getActiveProfileAndLayers(layerId);
        if (!found)
            return null;
        const loader = Loader._loadSingleLayer;
        if (!loader)
            return null;
        return await _buildAndLoadLayer(loader, layerId, found.layerConfig, found.dataUrl, found.profileId);
    }
    catch (error) {
        Log.warn(`[ThemeApplier._loadLayerFromProfile] Erreur inexpectede pour "${layerId}":`, error ? error.message : error);
        return null;
    }
};
/**
 * Resolves le path du file de data d'a layer
 * @param {Object} layerConfig - Configuration de the layer
 * @returns {string|null} - URL complete du file de data
 * @private
 */
_ThemeApplier._resolveDataFilePath = function (layerConfig) {
    // Remote GeoJSON URL declared via data.dataUrl (WFS, opendata APIs, etc.)
    if (typeof layerConfig.data?.dataUrl === "string") {
        return layerConfig.data.dataUrl;
    }
    // Vector tiles — return the tilesUrl so the layer is not skipped.
    // shouldUseVectorTiles() detects def.data.vectorTiles in _loadSingleLayer.
    if (layerConfig.data?.vectorTiles && typeof layerConfig.data.vectorTiles === "object") {
        const vt = layerConfig.data.vectorTiles;
        const vtUrl = vt.tilesUrl || vt.url;
        if (vtUrl)
            return vtUrl;
    }
    // Local data file referenced by dataFile + _layerDirectory
    if (!layerConfig.dataFile || !layerConfig._layerDirectory) {
        return null;
    }
    if (!Config || !Config.getActiveProfile) {
        return null;
    }
    const activeProfile = Config.getActiveProfile();
    if (!activeProfile) {
        return null;
    }
    const profileId = activeProfile.id;
    const profileBasePath = _ThemeApplier._getProfilesBasePath(activeProfile);
    return `${profileBasePath}/${profileId}/${layerConfig._layerDirectory}/${layerConfig.dataFile}`;
};
/**
 * Resolves le path de base des profiles
 * @private
 */
_ThemeApplier._getProfilesBasePath = function (activeProfile) {
    const configured = _Config$2?.get?.("data.profilesBasePath");
    if (typeof configured === "string" && configured.trim().length > 0) {
        return _ThemeApplier._normalizeBasePath(configured);
    }
    if (activeProfile && typeof activeProfile.profilesBasePath === "string") {
        return _ThemeApplier._normalizeBasePath(activeProfile.profilesBasePath);
    }
    return "profiles";
};
/**
 * Normalise un path (trim + supprime le / final)
 * @private
 */
_ThemeApplier._normalizeBasePath = function (path) {
    const trimmed = path.trim();
    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

/**
 * GeoLeaf Contract — Route (lazy-chunk boundary)
 *
 * Interface ESM pure pour access au module Route depuis the modules core.
 *
 * Phase 10-D — Pattern C : contrat de chunk Route.
 *
 * USAGE :
 *   import { RouteContract } from '../../../contracts/route.contract.js';
 *
 *   const routeGroup = RouteContract.getLayerGroup();
 *   if (routeGroup) tempGroup.addLayer(routeGroup);
 */
/**
 * Contrat d'interface pour the module Route.
 * @namespace RouteContract
 */
const RouteContract = {
    /**
     * Returns true si Route est initialized.
     * @returns {boolean}
     */
    isAvailable() {
        return !!Route && Route._initialized === true;
    },
    /**
     * Returns the LayerGroup contenant les routes.
     * Note : the method dans geoleaf.route.js est `getLayer()`.
     * Ce contrat uniformise l'API sous `getLayerGroup()`.
     * @returns {unknown}
     */
    getLayerGroup() {
        if (typeof Route.getLayer === "function") {
            return Route.getLayer();
        }
        return null;
    },
};

/**
 * GeoLeaf Theme Applier - UI Sync
 * Synchronization of the UI : selector de style, legend, fitBounds
 *
 * @module themes/theme-applier/ui-sync
 */
/**
 * Updates the selector de style dans l'UI
 * @param {string} layerId - Identifier de the layer
 * @param {string} styleId - Identifier du style
 * @private
 */
_ThemeApplier._updateStyleSelector = function (layerId, styleId) {
    const selectId = "style-selector-" + layerId;
    const select = document.getElementById(selectId);
    if (select) {
        select.value = styleId;
    }
};
/**
 * Loads the legend correspondant au style applied
 * @param {string} layerId - ID de the layer
 * @param {string} styleId - ID du style
 * @private
 */
_ThemeApplier._loadLegendForStyle = function (layerId, styleId) {
    if (!LegendContract.isAvailable()) {
        return;
    }
    // Retrieve les information de the layer
    const layersMap = GeoJSONShared.state.layers;
    const layerInfo = layersMap instanceof Map ? layersMap.get(layerId) : layersMap?.[layerId];
    if (!layerInfo || !layerInfo.config) {
        return;
    }
    // Utiliser la nouvelle API qui generates the legend from the style
    LegendContract.loadLayerLegend(layerId, styleId, layerInfo.config);
};
/**
 * Zoom sur l'emprise de toutes the layers loadedes
 * @private
 */
/**
 * Collects bounds from all registered layers (GeoJSON, POI, Route)
 * and returns a merged GeoLeafBounds or null if no valid data found.
 */
function _collectAllBounds() {
    let north = -90, south = 90, east = -180, west = 180;
    let hasData = false;
    if (GeoJSONShared.getLayers) {
        GeoJSONShared.getLayers().forEach((layerData) => {
            if (layerData.bounds) {
                try {
                    const b = layerData.bounds;
                    if (b.north > north)
                        north = b.north;
                    if (b.south < south)
                        south = b.south;
                    if (b.east > east)
                        east = b.east;
                    if (b.west < west)
                        west = b.west;
                    hasData = true;
                }
                catch (_e) {
                    /* silent */
                }
            }
        });
    }
    // Fallback: use the adapter's current bounds if layers provide no explicit bounds
    // but we know layers exist
    if (!hasData) {
        let layerCount = 0;
        if (GeoJSONShared.getLayers) {
            GeoJSONShared.getLayers().forEach((layerData) => {
                if (layerData.layer)
                    layerCount++;
            });
        }
        if (POIShared?.getMarkerLayer) {
            const markerLayer = POIShared.getMarkerLayer();
            if (markerLayer)
                layerCount++;
        }
        if (RouteContract.isAvailable()) {
            try {
                const routeGroup = RouteContract.getLayerGroup();
                if (routeGroup)
                    layerCount++;
            }
            catch (_e) {
                /* silent */
            }
        }
        if (layerCount > 0) {
            // Use the adapter's current viewport as a reasonable fallback
            const map = Core?.getMap();
            if (map && typeof map.getBounds === "function") {
                return map.getBounds();
            }
        }
    }
    return hasData ? { north, south, east, west } : null;
}
function _fitAndReveal(map, bounds) {
    const mapContainer = document.getElementById("geoleaf-map") ||
        document.querySelector(".maplibregl-map")?.parentElement;
    if (mapContainer) {
        mapContainer.style.opacity = "1";
    }
    map.fitBounds(bounds, { padding: { x: 50, y: 50 } });
    setTimeout(() => {
        try {
            document.dispatchEvent(new CustomEvent("geoleaf:map:ready", { detail: { time: Date.now() } }));
        }
        catch (_e) {
            /* fallback */
        }
    }, 800);
}
_ThemeApplier._fitBoundsOnAllLayers = function () {
    const map = Core?.getMap();
    if (!map) {
        return;
    }
    if (window._glLoadingScreen?.updateProgress) {
        window._glLoadingScreen.updateProgress(99);
    }
    const bounds = _collectAllBounds();
    if (bounds) {
        _fitAndReveal(map, bounds);
    }
};
/**
 * Synchronise l'visibility state de toutes the layers dans the legend
 * @private
 */
_ThemeApplier._syncLegendVisibility = function () {
    if (!LegendContract.isAvailable()) {
        return;
    }
    if (!GeoJSONShared.getLayers) {
        return;
    }
    const VisibilityManager$1 = VisibilityManager;
    if (!VisibilityManager$1) {
        return;
    }
    // Parcourir toutes the layers et synchronize leur state
    GeoJSONShared.getLayers().forEach((layerData, layerId) => {
        const visState = VisibilityManager$1.getVisibilityState(layerId);
        const isVisible = visState ? visState.current : layerData.visible;
        LegendContract.setLayerVisibility(layerId, isVisible);
    });
};

/**
 * GeoLeaf Theme Applier - Visibility
 * Gestion de la visibility des layers et application des styles
 *
 * @module themes/theme-applier/visibility
 */
const _Config$1 = Config;
/**
 * Deactivates all GeoJSON layers
 * @private
 */
_ThemeApplier._hideAllLayers = function () {
    if (!GeoJSONShared.state.layers) {
        return;
    }
    const VisibilityManager$1 = VisibilityManager;
    if (!VisibilityManager$1) {
        return;
    }
    // Reset tous les overrides user for theisser the theme prendre the control
    VisibilityManager$1.resetAllUserOverrides();
    // Iterate over all registered layers
    GeoJSONShared.getLayers().forEach((layerData, layerId) => {
        VisibilityManager$1.setVisibility(layerId, false, VisibilityManager$1.VisibilitySource.THEME);
    });
};
/**
 * Applies the configuration d'a layer (visible/hidden + style)
 * @param {Object} layerConfig - Configuration { id, visible, style }
 * @returns {Promise<void>}
 * @private
 */
_ThemeApplier._applyLayerConfig = function (layerConfig) {
    if (!layerConfig?.id) {
        return Promise.resolve();
    }
    const layerId = layerConfig.id;
    const visible = layerConfig.visible !== false;
    const styleId = layerConfig.style ? String(layerConfig.style).trim() : undefined;
    // Retrieve the layer from the registre
    const layerData = GeoJSONShared.state.layers?.get(layerId);
    // Si the layer n'existe pas, essayer de la load automaticment
    if (!layerData) {
        return _ThemeApplier._loadLayerFromProfile(layerId).then((loadedLayer) => {
            if (loadedLayer) {
                return _ThemeApplier._setLayerVisibilityAndStyle(layerId, visible, styleId);
            }
            else {
                return _ThemeApplier._scheduleLayerConfig(layerId, visible, styleId);
            }
        });
    }
    // The layer existe already, appliquer directly la visibility
    return _ThemeApplier._setLayerVisibilityAndStyle(layerId, visible, styleId);
};
function _resolveEffectiveStyleId(styleId, availableStyles) {
    const styleExists = availableStyles.some((s) => s.id === styleId);
    if (styleExists)
        return { styleId, exists: true };
    const fallbackMap = { default: "default", defaut: "default" };
    const fallbackStyleId = fallbackMap[styleId];
    if (fallbackStyleId) {
        const fallbackExists = availableStyles.some((s) => s.id === fallbackStyleId);
        if (fallbackExists)
            return { styleId: fallbackStyleId, exists: true };
    }
    return { styleId, exists: false };
}
function _getProfileId() {
    if (_Config$1 && typeof _Config$1.getActiveProfile === "function") {
        const activeProfile = _Config$1.getActiveProfile();
        return activeProfile?.id || "default";
    }
    return "default";
}
function _applyLayerHidden(layerId) {
    VisibilityManager.setVisibility(layerId, false, VisibilityManager.VisibilitySource.THEME);
    if (Labels)
        Labels.disableLabels(layerId);
    if (LabelButtonManager)
        LabelButtonManager.syncImmediate(layerId);
}
function _onStyleLoaded(layerId, styleId, result) {
    const styleConfig = result.styleData;
    // Style files have the shape { id, label, style: { fillColor, … }, styleRules: [...], legend }.
    // Unwrap the nested `style` flat-paint object so normalizeToFlat() finds paint keys at
    // the root level (required for fill-extrusion). Preserve styleRules so that
    // applyLayerStyle() can rebuild MapLibre case-expressions for per-category colouring.
    const paintForStyle = {
        ...(styleConfig?.style ?? styleConfig),
    };
    if (Array.isArray(styleConfig?.styleRules)) {
        paintForStyle.styleRules = styleConfig.styleRules;
    }
    LayerManager$1.setLayerStyle(layerId, paintForStyle);
    const layerDataForStyle = GeoJSONShared.state.layers?.get(layerId);
    // Keep the full style object in currentStyle so _rebuildGeoJSONLayers can unwrap it too.
    if (layerDataForStyle)
        layerDataForStyle.currentStyle = styleConfig;
    if (Labels && typeof Labels.initializeLayerLabels === "function")
        Labels.initializeLayerLabels(layerId);
    if (LabelButtonManager)
        LabelButtonManager.syncImmediate(layerId);
    if (LayerManager && typeof LayerManager.refresh === "function")
        LayerManager.refresh();
    if (StyleSelector)
        StyleSelector.setCurrentStyle(layerId, styleId);
    _ThemeApplier._updateStyleSelector(layerId, styleId);
    _ThemeApplier._loadLegendForStyle(layerId, styleId);
}
function _applyLayerVisible(layerId, styleId, layerData) {
    VisibilityManager.setVisibility(layerId, true, VisibilityManager.VisibilitySource.THEME);
    if (!styleId || !LayerManager$1?.setLayerStyle)
        return Promise.resolve();
    const availableStyles = layerData.config?.styles?.available || [];
    const { styleId: effectiveStyleId, exists } = _resolveEffectiveStyleId(styleId, availableStyles);
    if (!exists)
        return Promise.resolve();
    const styleFile = availableStyles.find((s) => s.id === effectiveStyleId)?.file;
    if (!styleFile)
        return Promise.resolve();
    const profileId = _getProfileId();
    const layerDirectory = layerData._layerDirectory || layerId;
    const localStyleLoader = StyleLoader;
    if (!localStyleLoader) {
        Log?.error(`[ThemeApplier] StyleLoader non disponible`);
        return Promise.resolve();
    }
    return localStyleLoader
        .loadAndValidateStyle(profileId, layerId, effectiveStyleId, styleFile, `layers/${layerDirectory}`)
        .then((result) => {
        _onStyleLoaded(layerId, styleId, result);
        return result;
    })
        .catch((_err) => {
        // Silent — error already logged by StyleLoader
    });
}
/**
 * Sets the visibility et le style d'a layer
 * @param {string} layerId - ID de the layer
 * @param {boolean} visible - Desired visibility
 * @param {string} styleId - ID du style to appliquer
 * @returns {Promise<void>}
 * @private
 */
_ThemeApplier._setLayerVisibilityAndStyle = function (layerId, visible, styleId) {
    const layerData = GeoJSONShared.state.layers?.get(layerId);
    if (!layerData)
        return Promise.resolve();
    if (!VisibilityManager)
        return Promise.resolve();
    if (visible)
        return _applyLayerVisible(layerId, styleId, layerData);
    _applyLayerHidden(layerId);
    return Promise.resolve();
};

/**















 * GeoLeaf – Themes API (assemblage namespace Themes)















 *















 * Assemble GeoLeaf.Themes from the modules refactoreds :















 *   - themes/theme-loader.js















 *   - themes/theme-applier/core.js















 *   - themes/theme-selector.js















 *   - themes/theme-cache.js















 *















 * @module themes/themes-api















 */
const _Config = Config;
const _g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_g.GeoLeaf = _g.GeoLeaf || {};
// ── STATE internal ────────────────────────────────────────────────
const _state = {
    initialized: false,
    options: {},
    _layerThemes: new Map(),
    _availableCache: new Map(),
};
// Loader/manager internals (references mockables in thes tests)
function _getThemesUrl(layerId, options) {
    const basePath = _Config?.get?.("data.profilesBasePath") || "data/profiles";
    const dir = options.directory || layerId;
    return `${basePath}/${dir}/themes/index.json`;
}
function _parseFetchedThemes(data) {
    if (Array.isArray(data.themes))
        return data.themes;
    if (Array.isArray(data))
        return data;
    return [];
}
const _loader = {
    _indexCache: new Map(),
    _themeCache: new Map(),
    clearCache() {
        this._indexCache.clear();
        this._themeCache.clear();
    },
    getStylesBasePath() {
        try {
            const profile = _Config?.getActiveProfile?.();
            if (!profile || !profile.stylesConfig)
                return null;
            const base = _Config?.get?.("data.profilesBasePath") || "data/profiles";
            return `${base}/${profile.id}/styles`;
        }
        catch (_) {
            return null;
        }
    },
    load: async (layerId, options = {}) => {
        const Log$1 = Log;
        if (options.enabled === false)
            return [];
        const cacheKey = `${layerId}:${options.directory || layerId}`;
        if (_loader._indexCache.has(cacheKey))
            return _loader._indexCache.get(cacheKey);
        try {
            const response = await (typeof fetch !== "undefined"
                ? fetch(_getThemesUrl(layerId, options))
                : Promise.reject(new Error("fetch unavailable")));
            if (!response.ok)
                return [];
            const result = _parseFetchedThemes(await response.json());
            _loader._indexCache.set(cacheKey, result);
            return result;
        }
        catch (err) {
            if (Log$1)
                Log$1.warn("[Themes._loader] Error during loading:", err.message);
            return [];
        }
    },
    invalidateCache: () => {
        _loader._indexCache.clear();
        _loader._themeCache.clear();
        _state._availableCache.clear();
    },
};
const _manager = {
    apply: async (layerId, themeId) => {
        const Log$1 = Log;
        const layerData = typeof GeoJSONShared?.getLayerById === "function"
            ? GeoJSONShared.getLayerById(layerId)
            : null;
        if (!layerData) {
            if (Log$1)
                Log$1.warn("[Themes._manager] Couche introuvable:", layerId);
            return false;
        }
        _state._layerThemes.set(layerId, themeId);
        return true;
    },
    getCurrent: (layerId) => {
        return _state._layerThemes.has(layerId) ? _state._layerThemes.get(layerId) : null;
    },
};
// ── API public GeoLeaf.Themes ────────────────────────────────
/**















 * @namespace GeoLeaf.Themes















 */
function _resolveDefaultThemeId(rememberedTheme, options, themes) {
    return rememberedTheme || options.default || options.defaultTheme || themes[0]?.id || null;
}
function _tryGetStoredTheme(layerId) {
    try {
        return localStorage.getItem(`gl-theme-${layerId}`) || null;
    }
    catch (_) {
        return null;
    }
}
function _tryStoreTheme(layerId, themeId) {
    try {
        localStorage.setItem(`gl-theme-${layerId}`, themeId);
    }
    catch (_) {
        /* noop */
    }
}
const Themes = {
    _loader,
    _manager,
    init(options = {}) {
        _state.options = { ...options };
        _state.initialized = true;
        return true;
    },
    async applyTheme(layerId, themeId) {
        if (!_state.initialized)
            this.init();
        return _manager.apply(layerId, themeId);
    },
    getCurrentTheme(layerId) {
        return _manager.getCurrent(layerId);
    },
    async getAvailableThemes(layerId, options = {}) {
        if (options.enabled === false)
            return [];
        if (_state._availableCache.has(layerId))
            return _state._availableCache.get(layerId);
        const result = await _loader.load(layerId, options);
        if (result.length > 0)
            _state._availableCache.set(layerId, result);
        return result;
    },
    async initializeLayerTheme(layerId, options = {}) {
        if (options.enabled === false)
            return null;
        const rememberChoice = options.rememberChoice || _state.options.rememberChoice;
        const rememberedTheme = rememberChoice ? _tryGetStoredTheme(layerId) : null;
        const themes = await this.getAvailableThemes(layerId, options);
        if (!themes.length)
            return null;
        const defaultId = _resolveDefaultThemeId(rememberedTheme, options, themes);
        if (defaultId) {
            await this.applyTheme(layerId, defaultId);
            if (rememberChoice)
                _tryStoreTheme(layerId, defaultId);
        }
        return defaultId;
    },
    async loadTheme(themeOrId) {
        const Log$1 = Log;
        if (!themeOrId)
            return null;
        try {
            const themeId = typeof themeOrId === "string" ? themeOrId : themeOrId.id;
            if (Log$1)
                Log$1.debug("[Themes] loadTheme:", themeId);
            return { id: themeId };
        }
        catch (err) {
            if (Log$1)
                Log$1.warn("[Themes] loadTheme error:", err.message);
            return null;
        }
    },
    clearRememberedThemes() {
        try {
            const keys = Object.keys(localStorage).filter((k) => k.startsWith("gl-theme-"));
            keys.forEach((k) => localStorage.removeItem(k));
        }
        catch (_) {
            /* localStorage non available */
        }
    },
    invalidateCache() {
        _loader.clearCache();
        _state._layerThemes.clear();
        _state._availableCache.clear();
    },
    async toggleTheme(layerId) {
        const current = this.getCurrentTheme(layerId);
        const available = await this.getAvailableThemes(layerId);
        if (!available || !available.length)
            return null;
        const idx = available.findIndex((t) => t.id === current);
        const next = available[(idx + 1) % available.length];
        return this.applyTheme(layerId, next.id);
    },
};
// Attacher sur le namespace global
_g.GeoLeaf.Themes = Themes;

export { ThemeSelector as T, _ThemeApplier as _, ThemeCache as a, _ThemeLoader as b, Themes as c };
//# sourceMappingURL=geoleaf-chunk-themes-olKtJRrg.js.map
