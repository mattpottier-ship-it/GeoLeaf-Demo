import { O as events, L as Log, p as getLabel, G as DOMSecurity, I as createElement, P as getNestedValue } from './geoleaf-chunk-core-utils-4nAkV2K5.js';
import { a as GeoJSONShared, V as VisibilityManager } from './geoleaf-chunk-geojson-DSRPRrfB.js';

/**
 * GeoLeaf Contract — Table (lazy-chunk boundary)
 *
 * Interface ESM pure pour que table/panel.js puisse appeler the methods
 * of the module Table (geoleaf.table.js) sans couplage runtime.
 *
 * Phase 10-E — Pattern G : contrat de chunk Table.
 *
 * CYCLE ROMPU :
 *   geoleaf.table.js → table/panel.js (static import, unchanged)
 *   table/panel.js   → TableContract  (registration pattern)
 *   geoleaf.table.js appelle TableContract.register(Table) au loading
 *
 * USAGE dans panel.js :
 *   import { TableContract } from '../../../contracts/table.contract.js';
 *
 *   if (TableContract.isAvailable()) {
 *       TableContract.setLayer(layerId);
 *   }
 *
 * REGISTRATION dans geoleaf.table.js (side Table) :
 *   import { TableContract } from '../../contracts/table.contract.js';
 *   TableContract.register(TableModule);
 */
/** @type {Object|null} */
let _table = null;
/** @type {Object|null} */
let _panel = null;
/**
 * Contrat d'interface pour the module Table.
 * Allows panel.js d'appeler the methods Table sans importer geoleaf.table.js
 * (which would create a cycle).
 * @namespace TableContract
 */
const TableContract = {
    /**
     * Registers the instance Table (called par geoleaf.table.js au loading).
     * @param {Object} tableInstance
     * @param {Object} [panelInstance]
     */
    register(tableInstance, panelInstance) {
        _table = tableInstance;
        if (panelInstance)
            _panel = panelInstance;
    },
    /**
     * Returns true si Table est available.
     * @returns {boolean}
     */
    isAvailable() {
        return !!_table;
    },
    /**
     * @param {string} layerId
     */
    setLayer(layerId) {
        if (_table && typeof _table.setLayer === "function") {
            _table.setLayer(layerId);
        }
    },
    /**
     * Zoom sur the selection currente.
     */
    zoomToSelection() {
        if (_table && typeof _table.zoomToSelection === "function") {
            _table.zoomToSelection();
        }
    },
    /**
     * @param {boolean} active
     */
    highlightSelection(active) {
        if (_table && typeof _table.highlightSelection === "function") {
            _table.highlightSelection(active);
        }
    },
    /**
     * Exports selected features in the given format (default: 'geojson').
     * @param {string} [format] - 'geojson' | 'csv' | 'kml' | 'gpx' | 'excel'
     * @param {object} [options] - ExportOptions (csvSeparator, csvIncludeGeometry)
     */
    exportSelection(format, options) {
        if (_table && typeof _table.exportSelection === "function") {
            _table.exportSelection(format, options);
        }
    },
    /**
     * Exports all features of the active layer in the given format (default: 'geojson').
     * @param {string} [format] - 'geojson' | 'csv' | 'kml' | 'gpx' | 'excel'
     * @param {object} [options] - ExportOptions (csvSeparator, csvIncludeGeometry)
     */
    exportLayerAll(format, options) {
        if (_table && typeof _table.exportLayer === "function") {
            _table.exportLayer(format, options);
        }
    },
    /**
     * Toggle visibility du array.
     */
    toggle() {
        if (_table && typeof _table.toggle === "function") {
            _table.toggle();
        }
    },
    /**
     * Displays the table.
     */
    show() {
        if (_table && typeof _table.show === "function") {
            _table.show();
        }
    },
    // ── Selection API ──
    /**
     * @returns {string[]}
     */
    getSelectedIds() {
        if (_table && typeof _table.getSelectedIds === "function") {
            return _table.getSelectedIds();
        }
        return [];
    },
    /**
     * @param {string[]} ids
     * @param {boolean} [fireEvent]
     */
    setSelection(ids, fireEvent) {
        if (_table && typeof _table.setSelection === "function") {
            _table.setSelection(ids, fireEvent);
        }
    },
    /**
     * Clear the selection.
     */
    clearSelection() {
        if (_table && typeof _table.clearSelection === "function") {
            _table.clearSelection();
        }
    },
    /**
     * @param {string} field
     */
    sortByField(field) {
        if (_table && typeof _table.sortByField === "function") {
            _table.sortByField(field);
        }
    },
    /**
     * Updates thes buttons toolbar du panel.
     * @param {number} selectedCount
     */
    updateToolbarButtons(selectedCount) {
        if (_panel && typeof _panel.updateToolbarButtons === "function") {
            _panel.updateToolbarButtons(selectedCount);
        }
    },
};

/**
 * GeoLeaf Table – Shared mutable state, utilities.
 * @module table/table-state
 */
const _gRaw = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
_gRaw.GeoLeaf = _gRaw.GeoLeaf || {};
const _g = _gRaw;
const tableState = {
    _map: null,
    _config: null,
    _currentLayerId: null,
    _selectedIds: new Set(),
    _cachedData: [],
    _featureIdMap: new Map(),
    _highlightLayers: [],
    _highlightActive: false,
    _sortState: { field: null, direction: null },
    _container: null,
    _isVisible: false,
};
/** Emits an event on the map and the document DOM. */
function fireEvent(eventName, detail) {
    if (tableState._map && typeof tableState._map.fire === "function") {
        tableState._map.fire("geoleaf:" + eventName, detail);
    }
    if (typeof document !== "undefined" && document.dispatchEvent) {
        document.dispatchEvent(new CustomEvent("geoleaf:" + eventName, { detail }));
    }
}
/** Returns the features selected via le mapping ID→index du cache. */
function getSelectedFeatures() {
    const result = [];
    tableState._selectedIds.forEach((id) => {
        const index = tableState._featureIdMap.get(id);
        if (index != null && tableState._cachedData[index]) {
            result.push(tableState._cachedData[index]);
        }
    });
    return result;
}

/**
 * panel-resize.ts
 *
 * Resize handle helpers for the table bottom-sheet panel.
 * Extracted from panel.ts to keep it within the 700-line limit.
 */
/**
 * Parse a value de height (%, px, vh) en pixels
 * @param {string} value - Value à parser ("40%", "300px", "50vh")
 * @param {number} referenceHeight - Height de reference for thes %
 * @returns {number} Height en pixels
 * @private
 */
function parseHeight(value, referenceHeight) {
    if (typeof value === "number")
        return value;
    if (typeof value !== "string")
        return 300;
    if (value.endsWith("%")) {
        const percent = parseFloat(value);
        return (referenceHeight * percent) / 100;
    }
    else if (value.endsWith("px")) {
        return parseFloat(value);
    }
    else if (value.endsWith("vh")) {
        const vh = parseFloat(value);
        return (window.innerHeight * vh) / 100;
    }
    return 300; // Default
}
function attachResizeEvents(handle, container, config, cleanups) {
    let isResizing = false;
    let startY = 0;
    let startHeight = 0;
    const events$1 = events;
    const mouseDownHandler = (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = container.offsetHeight;
        document.body.style.cursor = "ns-resize";
        document.body.style.userSelect = "none";
        e.preventDefault();
    };
    const mouseMoveHandler = (e) => {
        if (!isResizing)
            return;
        const delta = startY - e.clientY;
        let newHeight = startHeight + delta;
        const viewportHeight = window.innerHeight;
        const minHeightPx = parseHeight(config.minHeight || "20%", viewportHeight);
        const maxHeightPx = parseHeight(config.maxHeight || "80%", viewportHeight);
        newHeight = Math.max(minHeightPx, Math.min(maxHeightPx, newHeight));
        container.style.height = newHeight + "px";
    };
    const mouseUpHandler = () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }
    };
    if (events$1) {
        cleanups.push(events$1.on(handle, "mousedown", mouseDownHandler, false, "TablePanel.resizeMouseDown"));
        cleanups.push(events$1.on(document, "mousemove", mouseMoveHandler, false, "TablePanel.resizeMouseMove"));
        cleanups.push(events$1.on(document, "mouseup", mouseUpHandler, false, "TablePanel.resizeMouseUp"));
    }
    else {
        handle.addEventListener("mousedown", mouseDownHandler);
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    }
}
/**
 * Creates la bar de redimensionnement
 * @param {HTMLElement} container - Conteneur du array
 * @param {Object} config - Configuration
 * @param {any[]} cleanups - Event cleanup callbacks array
 * @returns {HTMLElement}
 */
function createResizeHandle(container, config, cleanups) {
    const handle = document.createElement("div");
    handle.className = "gl-table-panel__resize-handle";
    const resizeBar = document.createElement("div");
    resizeBar.className = "gl-table-panel__resize-bar";
    handle.appendChild(resizeBar);
    attachResizeEvents(handle, container, config, cleanups);
    return handle;
}

/**
 * GeoLeaf Table - Panel Module
 * Building du bottom-sheet drawer pour the table
 */
const _TablePanel = {};
_TablePanel._eventCleanups = [];
/**
 * Creates the container main du array (bottom-sheet)
 * @param {unknown} map - Map instance
 * @param {Object} config - Configuration du array
 * @returns {HTMLElement} Conteneur du array
 */
_TablePanel.create = function (map, config) {
    // Check si le conteneur existe already
    let container = document.querySelector(".gl-table-panel");
    if (container) {
        return container;
    }
    // Createsr le conteneur main
    container = document.createElement("div");
    container.className = "gl-table-panel";
    container.id = "gl-rp-pane-table"; // B1: aria-controls target for desktop panel table tab
    container.style.height = config.defaultHeight || "40%";
    // Addsr la bar de redimensionnement si resizable
    if (config.resizable) {
        const resizeHandle = createResizeHandle(container, config, _TablePanel._eventCleanups);
        container.appendChild(resizeHandle);
    }
    // Createsr la bar d'outils (header)
    const toolbar = createToolbar(map, config);
    container.appendChild(toolbar);
    // Createsr le wrapper du array avec scroll
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "gl-table-panel__wrapper";
    container.appendChild(tableWrapper);
    // Createsr the table empty (sera rempli par le renderer)
    const table = document.createElement("table");
    table.className = "gl-table-panel__table";
    tableWrapper.appendChild(table);
    // Addsr au body
    document.body.appendChild(container);
    // Createsr le button flottant pour display the table (quand hidden)
    createFloatingShowButton();
    Log.info("[TablePanel] Panel created successfully");
    return container;
};
/**
 * Creates la bar d'outils du array
 * @param {unknown} map - Map instance
 * @param {Object} config - Configuration
 * @returns {HTMLElement}
 * @private
 */
function createToolbar(map, config) {
    const toolbar = document.createElement("div");
    toolbar.className = "gl-table-panel__toolbar";
    // Selector de layer
    const layerSelect = createLayerSelector();
    toolbar.appendChild(layerSelect);
    // Champ de recherche
    const searchInput = createSearchInput();
    toolbar.appendChild(searchInput);
    // Button Zoom sur the selection
    const zoomButton = createButton("Zoom sur selection", "zoom", () => {
        TableContract.zoomToSelection();
    });
    zoomButton.disabled = true;
    zoomButton.setAttribute("data-table-btn", "zoom");
    toolbar.appendChild(zoomButton);
    // Button Surbrillance
    const highlightButton = createButton("Surbrillance", "highlight", () => {
        const isActive = highlightButton.classList.toggle("gl-is-active");
        TableContract.highlightSelection(isActive);
    });
    highlightButton.disabled = true;
    highlightButton.setAttribute("data-table-btn", "highlight");
    toolbar.appendChild(highlightButton);
    // Export buttons (si activated)
    if (config.enableExportButton) {
        const formats = config.exportFormats ?? ["geojson", "csv", "kml", "gpx", "excel"];
        toolbar.appendChild(createExportDropdown("Exporter", "export", formats, (fmt) => TableContract.exportSelection(fmt), true));
        toolbar.appendChild(createExportDropdown("Couche", "export-layer", formats, (fmt) => TableContract.exportLayerAll(fmt), false));
    }
    // Spacer pour pousser le button toggle à droite
    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    toolbar.appendChild(spacer);
    // Button toggle (hide/display the table)
    const toggleBtn = createToggleButton();
    toolbar.appendChild(toggleBtn);
    return toolbar;
}
/**
 * Creates the selector de layer
 * @returns {HTMLElement}
 * @private
 */
function createLayerSelector() {
    const wrapper = document.createElement("div");
    wrapper.className = "gl-table-panel__layer-selector";
    const select = document.createElement("select");
    select.id = "geoleaf-table-layer-selector";
    select.name = "geoleaf-table-layer-selector";
    select.className = "gl-table-panel__select";
    select.setAttribute("data-table-layer-select", "");
    // Option by default
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = getLabel("ui.table.layer_placeholder");
    select.appendChild(defaultOption);
    // Population deferrede : les GeoJSON layers ne sont pas encore availables to the creation du panel.
    // refreshLayerSelector() est called via l'event geoleaf:geojson:layers-loaded une fois
    // async loading completed.
    // Event de changement - avec cleanup tracking
    const changeHandler = (e) => {
        const layerId = e.target?.value ?? "";
        TableContract.setLayer(layerId);
    };
    const events$1 = events;
    if (events$1) {
        _TablePanel._eventCleanups.push(events$1.on(select, "change", changeHandler, false, "TablePanel.layerSelect"));
    }
    else {
        select.addEventListener("change", changeHandler);
    }
    wrapper.appendChild(select);
    return wrapper;
}
function _isLayerVisible(layerId, layerData, VisibilityManager) {
    if (VisibilityManager && typeof VisibilityManager.getVisibilityState === "function") {
        const visState = VisibilityManager.getVisibilityState(layerId);
        return visState?.current === true;
    }
    if (layerData._visibility)
        return layerData._visibility.current === true;
    return true;
}
function _isTableLayer(layerData) {
    return !!layerData?.config?.table?.enabled;
}
/**
 * Peuple le selector avec the layers availables
 * @param {HTMLSelectElement} select - Element select
 * @private
 */
function populateLayerSelector(select) {
    const allLayersMap = GeoJSONShared.getLayers();
    if (!allLayersMap || allLayersMap.size === 0) {
        Log.warn("[TablePanel] Module GeoJSON non disponible ou aucune layer");
        return;
    }
    const VisibilityManager$1 = VisibilityManager;
    // Check les options existings pour avoid les doublons
    const existingValues = new Set();
    for (let i = 1; i < select.options.length; i++) {
        existingValues.add(select.options[i].value);
    }
    let addedCount = 0;
    allLayersMap.forEach((layerData, layerId) => {
        if (!_isTableLayer(layerData))
            return;
        if (!_isLayerVisible(layerId, layerData, VisibilityManager$1))
            return;
        if (existingValues.has(layerId))
            return;
        const option = document.createElement("option");
        option.value = layerId;
        option.textContent = layerData.label || layerData.config?.title || layerId;
        select.appendChild(option);
        addedCount++;
    });
    if (addedCount > 0) {
        Log.info("[TablePanel] Layer selector populated:", addedCount, "layers added");
    }
}
/**
 * Creates the field de recherche
 * @returns {HTMLElement}
 * @private
 */
function createSearchInput() {
    const wrapper = document.createElement("div");
    wrapper.className = "gl-table-panel__search";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "geoleaf-table-search-input";
    input.name = "geoleaf-table-search-input";
    input.placeholder = getLabel("placeholder.search.input");
    input.className = "gl-table-panel__search-input";
    input.setAttribute("data-table-search", "");
    // Debounce la recherche pour avoid les appels trop frequent
    let timeout;
    input.addEventListener("input", (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const searchText = (e.target?.value ?? "").trim().toLowerCase();
            filterTableRows(searchText);
        }, 300);
    });
    wrapper.appendChild(input);
    return wrapper;
}
/**
 * Filtre les lines du tableat the bottomed on the text de recherche
 * @param {string} searchText - Text à rechercher
 * @private
 */
function filterTableRows(searchText) {
    const table = document.querySelector(".gl-table-panel__table tbody");
    if (!table)
        return;
    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
        const rowEl = row;
        if (!searchText) {
            rowEl.style.display = "";
            return;
        }
        const cells = row.querySelectorAll("td");
        let match = false;
        cells.forEach((cell) => {
            const text = (cell.textContent ?? "").toLowerCase();
            if (text.includes(searchText)) {
                match = true;
            }
        });
        rowEl.style.display = match ? "" : "none";
    });
}
/**
 * Creates a button generic
 * @param {string} label - Label du button
 * @param {string} icon - Classe d'icon (optional)
 * @param {Function} onClickk - Callback au click
 * @returns {HTMLElement}
 * @private
 */
function createButton(label, icon, onClick) {
    const button = document.createElement("button");
    button.className = "gl-table-panel__btn";
    button.textContent = label;
    if (icon) {
        button.classList.add("gl-table-panel__btn--" + icon);
    }
    if (onClick) {
        if (events) {
            _TablePanel._eventCleanups.push(events.on(button, "click", onClick, false, "TablePanel.button"));
        }
        else {
            button.addEventListener("click", onClick);
        }
    }
    return button;
}
const _FORMAT_LABELS = {
    geojson: "GeoJSON",
    csv: "CSV",
    kml: "KML",
    gpx: "GPX",
    excel: "Excel (.xlsx)",
};
let _docExportListenerBound = false;
function _closeAllExportDropdowns() {
    document.querySelectorAll(".gl-table-export-group.gl-is-open").forEach((el) => {
        el.classList.remove("gl-is-open");
        const dd = el.querySelector(".gl-table-export-dropdown");
        if (dd) {
            dd.style.top = "";
            dd.style.left = "";
        }
    });
}
/**
 * Creates a dropdown export button group.
 * @param label - Button label
 * @param dataAttr - data-table-btn value (empty string = no attribute = always enabled)
 * @param formats - Allowed format keys to display
 * @param onFormat - Callback called with the chosen format string
 * @param requiresSelection - When true, button is disabled until rows are selected
 */
function createExportDropdown(label, dataAttr, formats, onFormat, requiresSelection) {
    if (!_docExportListenerBound) {
        document.addEventListener("click", _closeAllExportDropdowns);
        _docExportListenerBound = true;
    }
    const group = document.createElement("div");
    group.className = "gl-table-export-group";
    const trigger = document.createElement("button");
    trigger.className = "gl-table-panel__btn gl-table-panel__btn--export-trigger";
    trigger.textContent = label + " ▾";
    if (requiresSelection) {
        trigger.disabled = true;
        trigger.dataset["tableBtn"] = dataAttr;
    }
    const dropdown = document.createElement("div");
    dropdown.className = "gl-table-export-dropdown";
    for (const fmt of formats) {
        const item = document.createElement("button");
        item.className = "gl-table-export-dropdown__item";
        item.textContent = _FORMAT_LABELS[fmt] ?? fmt.toUpperCase();
        const itemClick = (e) => {
            e.stopPropagation();
            _closeAllExportDropdowns();
            if (fmt === "excel") {
                trigger.classList.add("gl-is-loading");
                setTimeout(() => trigger.classList.remove("gl-is-loading"), 8000);
            }
            onFormat(fmt);
        };
        if (events) {
            _TablePanel._eventCleanups.push(events.on(item, "click", itemClick, false, "TablePanel.exportItem"));
        }
        else {
            item.addEventListener("click", itemClick);
        }
        dropdown.appendChild(item);
    }
    const triggerClick = (e) => {
        e.stopPropagation();
        const wasOpen = group.classList.contains("gl-is-open");
        _closeAllExportDropdowns();
        if (!wasOpen) {
            // .gl-table-panel has transform → it is the containing block for position:fixed children.
            // We must offset relative to the panel, not the viewport.
            const panelEl = trigger.closest(".gl-table-panel");
            const panelRect = panelEl?.getBoundingClientRect() ?? { top: 0, left: 0 };
            const rect = trigger.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom - panelRect.top + 4}px`;
            dropdown.style.left = `${rect.left - panelRect.left}px`;
            group.classList.add("gl-is-open");
        }
    };
    if (events) {
        _TablePanel._eventCleanups.push(events.on(trigger, "click", triggerClick, false, "TablePanel.exportTrigger"));
    }
    else {
        trigger.addEventListener("click", triggerClick);
    }
    group.appendChild(trigger);
    group.appendChild(dropdown);
    return group;
}
function _resetPanelStyles(tp) {
    tp.dataset["glOpen"] = "false";
    tp.classList.remove("gl-is-visible");
    tp.style.removeProperty("position");
    tp.style.removeProperty("top");
    tp.style.removeProperty("bottom");
    tp.style.removeProperty("right");
    tp.style.removeProperty("left");
    tp.style.removeProperty("width");
    tp.style.removeProperty("height");
    tp.style.removeProperty("transform");
    tp.style.removeProperty("display");
    tp.style.removeProperty("visibility");
    tp.style.removeProperty("opacity");
    tp.style.removeProperty("z-index");
    /* Disable desktop tab */
    const desktopPanel = document.getElementById("gl-right-panel");
    if (desktopPanel) {
        desktopPanel
            .querySelector("[data-gl-rp-tab='table']")
            ?.classList.remove("gl-is-active");
        desktopPanel
            .querySelector("[data-gl-rp-tab='table']")
            ?.setAttribute("aria-selected", "false");
    }
}
/**
 * Creates the button toggle pour hide the table (integrated in the toolbar)
 * @returns {HTMLElement}
 * @private
 */
function createToggleButton() {
    const button = document.createElement("button");
    button.className = "gl-table-panel__toggle-btn";
    button.title = getLabel("aria.table.hide");
    button.setAttribute("aria-label", getLabel("aria.table.hide"));
    const icon = document.createElement("span");
    icon.className = "gl-table-panel__toggle-btn__icon";
    // SAFE: SVG static hardcoded, pas de data user
    const rightSvg = DOMSecurity.createSVGIcon(16, 16, "M9 6l6 6-6 6", {
        stroke: "currentColor",
        strokeWidth: "6",
        fill: "none",
    });
    icon.appendChild(rightSvg);
    button.appendChild(icon);
    const clickHandler = () => {
        const tp = document.querySelector(".gl-table-panel");
        if (tp?.dataset["glOpen"] === "true") {
            _resetPanelStyles(tp);
        }
        TableContract.toggle();
    };
    const events$1 = events;
    if (events$1) {
        _TablePanel._eventCleanups.push(events$1.on(button, "click", clickHandler, false, "TablePanel.toggleBtn"));
    }
    else {
        button.addEventListener("click", clickHandler);
    }
    return button;
}
/**
 * Creates the button flottant pour display the table (visible quand array hidden)
 * @private
 */
function createFloatingShowButton() {
    const button = document.createElement("button");
    button.className = "gl-table-panel__floating-show-btn";
    button.title = getLabel("aria.table.show");
    button.setAttribute("aria-label", getLabel("aria.table.show"));
    // Createsr l'icon SVG (arrow to the haut)
    const icon = document.createElement("span");
    icon.className = "gl-table-panel__toggle-btn__icon";
    // SAFE: SVG static hardcoded, pas de data user
    const upSvg = DOMSecurity.createSVGIcon(16, 16, "M18 15l-6-6-6 6", {
        stroke: "currentColor",
        strokeWidth: "6",
        fill: "none",
    });
    icon.appendChild(upSvg);
    button.appendChild(icon);
    const clickHandler = () => {
        TableContract.show();
    };
    const events$1 = events;
    if (events$1) {
        _TablePanel._eventCleanups.push(events$1.on(button, "click", clickHandler, false, "TablePanel.floatingShowBtn"));
    }
    else {
        button.addEventListener("click", clickHandler);
    }
    document.body.appendChild(button);
}
/**
 * Met à jour the state des buttons de la toolbar selon the selection
 * @param {number} selectedCount - Nombre d'entities selected
 */
_TablePanel.updateToolbarButtons = function (selectedCount) {
    const hasSelection = selectedCount > 0;
    const zoomBtn = document.querySelector("[data-table-btn='zoom']");
    const highlightBtn = document.querySelector("[data-table-btn='highlight']");
    const exportBtn = document.querySelector("[data-table-btn='export']");
    if (zoomBtn)
        zoomBtn.disabled = !hasSelection;
    if (highlightBtn) {
        highlightBtn.disabled = !hasSelection;
        // Si plus aucune selection, disable la surbrillance
        if (!hasSelection && highlightBtn.classList.contains("gl-is-active")) {
            highlightBtn.classList.remove("gl-is-active");
            TableContract.highlightSelection(false);
        }
    }
    if (exportBtn) {
        exportBtn.disabled = !hasSelection;
        if (!hasSelection) {
            exportBtn.closest(".gl-table-export-group")?.classList.remove("gl-is-open");
        }
    }
};
/**
 * Refreshes le selector de layer (utile after loading de nouvelthe layers)
 */
_TablePanel.refreshLayerSelector = function () {
    const select = document.querySelector("[data-table-layer-select]");
    if (!select)
        return;
    // Sauvegarder the value currentle
    const currentValue = select.value;
    // Empty options (except the first)
    while (select.options.length > 1) {
        select.options[1].remove();
    }
    // Re-peupler
    populateLayerSelector(select);
    // Check si the value currentle est always available
    const optionValues = new Set(Array.from(select.options, (o) => o.value));
    if (currentValue && optionValues.has(currentValue)) {
        select.value = currentValue;
    }
    else if (currentValue && !optionValues.has(currentValue)) {
        // The active layer has been removed (hidden): switch to the first available
        if (select.options.length > 1) {
            select.value = select.options[1].value;
            TableContract.setLayer(select.options[1].value);
        }
        else {
            // Auca layer visible : emptyr the table
            select.value = "";
            TableContract.setLayer("");
        }
    }
    // Mettre up to date le placeholder si auca layer visible
    const defaultOption = select.options[0];
    if (defaultOption) {
        defaultOption.textContent =
            select.options.length > 1 ? "Select a layer..." : "No visible layer";
    }
    Log.info("[TablePanel] Layer selector refreshed,", select.options.length - 1, "layers disponibles");
};
/**
 * Cleanup all event listners
 */
_TablePanel.destroy = function () {
    if (_TablePanel._eventCleanups && _TablePanel._eventCleanups.length > 0) {
        _TablePanel._eventCleanups.forEach((cleanup) => {
            if (typeof cleanup === "function")
                cleanup();
        });
        _TablePanel._eventCleanups = [];
        Log.info("[TablePanel] Event listeners cleaned up");
    }
};
const TablePanel = _TablePanel;

/**
 * GeoLeaf Table – Layer data and map event logic.
 * @module table/table-layer
 */
/** Returns all features of a layer without row limit (for full-layer export). */
function getAllLayerFeatures(layerId) {
    if (!_g.GeoLeaf.GeoJSON || typeof _g.GeoLeaf.GeoJSON.getLayerData !== "function") {
        Log.warn("[Table] Module GeoJSON non disponible");
        return [];
    }
    const layerData = _g.GeoLeaf.GeoJSON.getLayerData(layerId);
    if (!layerData || !layerData.features) {
        Log.warn("[Table] No data for layer:", layerId);
        return [];
    }
    return layerData.features || [];
}
/** Returns the features d'a layer en appliquant la limite de lines. */
function getLayerFeatures(layerId) {
    if (!_g.GeoLeaf.GeoJSON || typeof _g.GeoLeaf.GeoJSON.getLayerData !== "function") {
        Log.warn("[Table] Module GeoJSON non disponible");
        return [];
    }
    const layerData = _g.GeoLeaf.GeoJSON.getLayerData(layerId);
    if (!layerData || !layerData.features) {
        Log.warn("[Table] No data for layer:", layerId);
        return [];
    }
    Log.debug("[Table] _getLayerFeatures - Nombre de features:", layerData.features.length);
    const maxRows = tableState._config?.maxRowsPerLayer || 1000;
    if (layerData.features.length > maxRows) {
        Log.warn("[Table] Large dataset (" +
            layerData.features.length +
            " entities). Limited to " +
            maxRows);
        return layerData.features.slice(0, maxRows);
    }
    return layerData.features || [];
}
/** Returns toutes the layers ayant `table.enabled = true`. */
function getAvailableLayers() {
    if (!_g.GeoLeaf.GeoJSON || typeof _g.GeoLeaf.GeoJSON.getAllLayers !== "function") {
        return [];
    }
    const allLayers = _g.GeoLeaf.GeoJSON.getAllLayers();
    const availableLayers = [];
    allLayers.forEach((layer) => {
        const layerData = _g.GeoLeaf.GeoJSON.getLayerData(layer.id);
        if (layerData &&
            layerData.config &&
            layerData.config.table &&
            layerData.config.table.enabled) {
            availableLayers.push({
                id: layer.id,
                label: layer.label || layer.id,
                config: layerData.config.table,
            });
        }
    });
    return availableLayers;
}
/** Returns the layers availables ET visibles sur the map. */
function getAvailableVisibleLayers() {
    const available = getAvailableLayers();
    const VisibilityManager = _g.GeoLeaf._LayerVisibilityManager;
    return available.filter((layer) => {
        if (VisibilityManager && typeof VisibilityManager.getVisibilityState === "function") {
            const visState = VisibilityManager.getVisibilityState(layer.id);
            return visState && visState.current === true;
        }
        const layerData = _g.GeoLeaf.GeoJSON.getLayerData(layer.id);
        return layerData && layerData._visibility && layerData._visibility.current === true;
    });
}
/**
 * Attache les listeners d'events carte et DOM.
 * @param refreshCallback   - Called to refresh the table data
 * @param setLayerCallback  - Called to change the active layer
 */
function attachMapEvents(refreshCallback, setLayerCallback) {
    const map = tableState._map;
    if (!map)
        return;
    let refreshSelectorTimer = null;
    const debouncedRefreshSelector = () => {
        if (refreshSelectorTimer)
            clearTimeout(refreshSelectorTimer);
        refreshSelectorTimer = setTimeout(() => {
            if (TablePanel && typeof TablePanel.refreshLayerSelector === "function") {
                TablePanel.refreshLayerSelector();
            }
        }, 150);
    };
    map.on("geoleaf:filters:changed", () => {
        if (tableState._isVisible && tableState._currentLayerId) {
            refreshCallback();
        }
    });
    map.on("geoleaf:geojson:layers-loaded", () => {
        Log.debug("[Table] layers-loaded event received, refreshing selector");
        debouncedRefreshSelector();
    });
    document.addEventListener("geoleaf:theme:applied", () => {
        Log.debug("[Table] theme:applied event received, refreshing selector");
        debouncedRefreshSelector();
    });
    map.on("geoleaf:geojson:visibility-changed", (e) => {
        debouncedRefreshSelector();
        if (tableState._currentLayerId === e.layerId) {
            if (e.visible) {
                refreshCallback();
            }
            else {
                setTimeout(() => {
                    const available = getAvailableVisibleLayers();
                    if (available.length > 0) {
                        setLayerCallback(available[0].id);
                        const select = document.querySelector("[data-table-layer-select]");
                        if (select)
                            select.value = available[0].id;
                    }
                    else {
                        setLayerCallback("");
                    }
                }, 200);
            }
        }
    });
}

/**
 * GeoLeaf Table – Highlight and geometry utilities.
 * @module table/table-highlight
 */
/** Removes all highlight layers from the map. */
function clearHighlightLayers() {
    tableState._highlightLayers.forEach((layerId) => {
        try {
            if (tableState._map && typeof tableState._map.removeLayer === "function") {
                tableState._map.removeLayer(layerId);
            }
        }
        catch (_e) {
            // Silent
        }
    });
    tableState._highlightLayers = [];
}
/** Extends map bounds from a GeoJSON geometry. */
function extendBoundsFromGeometry(bounds, geometry) {
    const coords = geometry.coordinates;
    const type = geometry.type;
    if (type === "Point") {
        bounds.extend([coords[1], coords[0]]);
    }
    else if (type === "LineString") {
        coords.forEach((c) => bounds.extend([c[1], c[0]]));
    }
    else if (type === "MultiLineString") {
        coords.forEach((line) => line.forEach((c) => bounds.extend([c[1], c[0]])));
    }
    else if (type === "Polygon") {
        coords[0].forEach((c) => bounds.extend([c[1], c[0]]));
    }
    else if (type === "MultiPolygon") {
        coords.forEach((poly) => {
            poly[0].forEach((c) => bounds.extend([c[1], c[0]]));
        });
    }
    else if (type === "MultiPoint") {
        coords.forEach((c) => bounds.extend([c[1], c[0]]));
    }
}
/** Counter for unique highlight layer IDs. */
let _highlightCounter = 0;
/**
 * Adds a highlight overlay for a single feature using the adapter's addGeoJSONLayer.
 * Stores the layer ID in tableState._highlightLayers for later cleanup.
 */
function _addFeatureHighlight(feature) {
    if (!feature.geometry)
        return;
    const highlightStyle = {
        color: "#FFD600",
        weight: 4,
        opacity: 1,
        fillOpacity: 0.15,
        fillColor: "#FFD600",
        interactive: false,
    };
    try {
        const layerId = `__gl_table_highlight_${++_highlightCounter}`;
        const fc = { type: "FeatureCollection", features: [feature] };
        tableState._map.addGeoJSONLayer(layerId, fc, highlightStyle);
        tableState._highlightLayers.push(layerId);
    }
    catch (e) {
        Log.warn("[Table] Highlight feature error:", e);
    }
}
/** Activates or deactivates highlight of selected entities on the map. */
function highlightSelection(active) {
    clearHighlightLayers();
    tableState._highlightActive = active;
    if (!active) {
        Log.debug("[Table] Highlight disabled");
        fireEvent("table:highlightSelection", {
            layerId: tableState._currentLayerId,
            selectedIds: Array.from(tableState._selectedIds),
            active: false,
        });
        return;
    }
    if (tableState._selectedIds.size === 0) {
        Log.warn("[Table] No entity selected for highlighting");
        return;
    }
    const selectedFeatures = getSelectedFeatures();
    if (selectedFeatures.length === 0) {
        Log.warn("[Table] No feature found for highlighting");
        return;
    }
    if (!tableState._map || typeof tableState._map.addGeoJSONLayer !== "function") {
        Log.warn("[Table] Map adapter unavailable for highlightSelection");
        return;
    }
    selectedFeatures.forEach((feature) => _addFeatureHighlight(feature));
    fireEvent("table:highlightSelection", {
        layerId: tableState._currentLayerId,
        selectedIds: Array.from(tableState._selectedIds),
        active: true,
    });
    Log.debug("[Table] Highlight enabled for", selectedFeatures.length, "entities");
}

/**
 * GeoLeaf Table – Export Utilities
 * Pure export helpers: GeoJSON (existing), CSV, KML, GPX, Excel (lazy).
 *
 * @module table/export
 */
const _FEATURE_ID_PROPS$1 = ["id", "fid", "osm_id", "OBJECTID", "SITE_ID", "code", "IN1"];
/** Serializes an unknown value to a display string without [object Object]. */
function _str(v) {
    if (v == null)
        return "";
    if (typeof v === "object")
        return JSON.stringify(v);
    return String(v);
}
/**
 * Resolves the ID of a GeoJSON feature consistently with the renderer.
 */
function resolveFeatureId(feature, syntheticIndex) {
    if (feature.id != null && feature.id !== "")
        return String(feature.id);
    const p = feature.properties;
    if (!p)
        return "__gl_row_" + syntheticIndex;
    for (const key of _FEATURE_ID_PROPS$1) {
        const v = p[key];
        if (v != null && v !== "")
            return _str(v);
    }
    return "__gl_row_" + syntheticIndex;
}
/**
 * Builds a GeoJSON FeatureCollection from an array of features.
 */
function buildGeoJSONCollection(features) {
    return {
        type: "FeatureCollection",
        features: features.map((f) => ({
            type: "Feature",
            properties: f.properties || {},
            geometry: f.geometry || null,
        })),
    };
}
/** Generic browser file download. */
function downloadFile(content, filename, mimeType) {
    const part = typeof content === "string" ? content : content.buffer;
    const blob = new Blob([part], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
/** Builds a CSV string with UTF-8 BOM (Excel Windows compatibility). */
function buildCSV(features, options) {
    const sep = options?.csvSeparator ?? ",";
    const includeGeom = options?.csvIncludeGeometry ?? false;
    const allKeys = new Set();
    for (const f of features) {
        if (f.properties) {
            for (const k of Object.keys(f.properties))
                allKeys.add(k);
        }
    }
    const keys = Array.from(allKeys);
    if (includeGeom)
        keys.push("__geometry");
    const escCsv = (v) => {
        const s = _str(v);
        if (s.includes(sep) || s.includes('"') || s.includes("\n")) {
            return '"' + s.replaceAll('"', '""') + '"';
        }
        return s;
    };
    const rows = [keys.map(escCsv).join(sep)];
    for (const f of features) {
        rows.push(keys
            .map((k) => {
            if (k === "__geometry") {
                return escCsv(f.geometry ? JSON.stringify(f.geometry) : "");
            }
            return escCsv(f.properties?.[k]);
        })
            .join(sep));
    }
    // ﻿ = UTF-8 BOM
    return "﻿" + rows.join("\r\n");
}
/** Builds a KML string from features (no external dependency). */
function buildKML(features, layerId) {
    const escXml = (s) => s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    const coordStr = (ring) => ring
        .map((c) => {
        const z = c[2] == null ? "" : "," + c[2];
        return `${c[0]},${c[1]}${z}`;
    })
        .join(" ");
    const geomToKml = (geom) => {
        if (!geom)
            return "";
        const { type, coordinates: co } = geom;
        if (type === "Point") {
            const z = co[2] == null ? "" : "," + co[2];
            return `<Point><coordinates>${co[0]},${co[1]}${z}</coordinates></Point>`;
        }
        if (type === "LineString")
            return `<LineString><coordinates>${coordStr(co)}</coordinates></LineString>`;
        if (type === "Polygon") {
            const outerCoords = coordStr(co[0]);
            const inner = co
                .slice(1)
                .map((r) => {
                const innerCoords = coordStr(r);
                return `<innerBoundaryIs><LinearRing><coordinates>${innerCoords}</coordinates></LinearRing></innerBoundaryIs>`;
            })
                .join("");
            return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${outerCoords}</coordinates></LinearRing></outerBoundaryIs>${inner}</Polygon>`;
        }
        if (type === "MultiPoint") {
            const points = co
                .map((c) => `<Point><coordinates>${c[0]},${c[1]}</coordinates></Point>`)
                .join("");
            return `<MultiGeometry>${points}</MultiGeometry>`;
        }
        if (type === "MultiLineString") {
            const lines = co
                .map((ls) => {
                const coords = coordStr(ls);
                return `<LineString><coordinates>${coords}</coordinates></LineString>`;
            })
                .join("");
            return `<MultiGeometry>${lines}</MultiGeometry>`;
        }
        if (type === "MultiPolygon") {
            const polys = co
                .map((poly) => {
                const outerCoords = coordStr(poly[0]);
                return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${outerCoords}</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
            })
                .join("");
            return `<MultiGeometry>${polys}</MultiGeometry>`;
        }
        return "";
    };
    const placemarks = features
        .map((f, i) => {
        const name = escXml(resolveFeatureId(f, i));
        const desc = Object.entries(f.properties || {})
            .map(([k, v]) => `${k}: ${_str(v)}`)
            .join("\n");
        return `  <Placemark>\n    <name>${name}</name>\n    <description><![CDATA[${desc}]]></description>\n    ${geomToKml(f.geometry)}\n  </Placemark>`;
    })
        .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n  <name>${escXml(layerId || "GeoLeaf Export")}</name>\n${placemarks}\n</Document>\n</kml>`;
}
/** Builds a GPX string from features (no external dependency). */
function buildGPX(features, layerId) {
    const escXml = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const trkpt = (c) => {
        const ele = c[2] == null ? "" : `<ele>${c[2]}</ele>`;
        return `      <trkpt lat="${c[1]}" lon="${c[0]}">${ele}</trkpt>`;
    };
    const elements = [];
    for (let i = 0; i < features.length; i++) {
        const f = features[i];
        const geom = f.geometry;
        if (!geom)
            continue;
        const name = escXml(resolveFeatureId(f, i));
        const desc = escXml(JSON.stringify(f.properties || {}));
        const { type, coordinates: co } = geom;
        if (type === "Point") {
            elements.push(`  <wpt lat="${co[1]}" lon="${co[0]}">\n    <name>${name}</name>\n    <desc>${desc}</desc>\n  </wpt>`);
        }
        else if (type === "LineString") {
            elements.push(`  <trk>\n    <name>${name}</name>\n    <desc>${desc}</desc>\n    <trkseg>\n${co.map(trkpt).join("\n")}\n    </trkseg>\n  </trk>`);
        }
        else if (type === "MultiLineString") {
            const segs = co
                .map((seg) => `    <trkseg>\n${seg.map(trkpt).join("\n")}\n    </trkseg>`)
                .join("\n");
            elements.push(`  <trk>\n    <name>${name}</name>\n    <desc>${desc}</desc>\n${segs}\n  </trk>`);
        }
        else {
            // Polygon / MultiPolygon / MultiPoint — export as route using exterior ring
            let ring;
            if (type === "MultiPolygon") {
                ring = co[0][0];
            }
            else if (type === "Polygon") {
                ring = co[0];
            }
            else {
                ring = co;
            }
            const rtepts = ring
                .map((c) => `    <rtept lat="${c[1]}" lon="${c[0]}"></rtept>`)
                .join("\n");
            elements.push(`  <rte>\n    <name>${name}</name>\n    <desc>${desc}</desc>\n${rtepts}\n  </rte>`);
        }
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="GeoLeaf" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${escXml(layerId || "GeoLeaf Export")}</name></metadata>\n${elements.join("\n")}\n</gpx>`;
}
/**
 * Orchestrates download for all formats.
 * Excel is loaded lazily from the export-excel chunk.
 */
async function downloadFeatures(features, format, layerId, suffix, options) {
    const base = (layerId || "export") + "_" + suffix;
    switch (format) {
        case "geojson":
            downloadFile(JSON.stringify(buildGeoJSONCollection(features), null, 2), base + ".geojson", "application/geo+json");
            break;
        case "csv":
            downloadFile(buildCSV(features, options), base + ".csv", "text/csv;charset=utf-8;");
            break;
        case "kml":
            downloadFile(buildKML(features, layerId), base + ".kml", "application/vnd.google-earth.kml+xml");
            break;
        case "gpx":
            downloadFile(buildGPX(features, layerId), base + ".gpx", "application/gpx+xml");
            break;
        case "excel": {
            const mod = await import('./geoleaf-export-excel-CAHOxti5.js');
            const data = mod.buildExcelBuffer(features);
            downloadFile(data, base + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            break;
        }
    }
}

/**



 * GeoLeaf Table - Renderer Utilities



 * Constants, synthetic ID counter, feature ID resolution, and value formatting.



 */
// Virtual scrolling constants
const VIRTUAL_ROW_HEIGHT = 32;
const VIRTUAL_BUFFER = 20;
const VIRTUAL_THRESHOLD = 150;
/**



 * Counter for generating synthetic row IDs.



 * Must be reset via resetSyntheticIdCounter() before each full render.



 */
let _syntheticIdCounter = 0;
function resetSyntheticIdCounter() {
    _syntheticIdCounter = 0;
}
/**



 * Shared event cleanup registry.



 * All cleanup functions/IDs registered during render are stored here so they can



 * be flushed before re-render or on destroy.



 */
const _eventCleanups = [];
/**



 * Retrieves the ID of a feature reliably.



 * Parcourt plusieurs properties candidates puis generates un ID synthetic if needed.



 * @param {Object} feature - Feature GeoJSON



 * @returns {string}



 */
const _FEATURE_ID_PROPS = ["id", "fid", "osm_id", "OBJECTID", "SITE_ID", "code", "IN1"];
function getFeatureId(feature) {
    // 1. ID standard GeoJSON
    if (feature.id != null && feature.id !== "")
        return String(feature.id);
    const p = feature.properties;
    if (!p)
        return "__gl_row_" + _syntheticIdCounter++;
    // 2. Properties d'identifier currentes
    for (const key of _FEATURE_ID_PROPS) {
        const v = p[key];
        if (v != null && v !== "")
            return String(v);
    }
    // 3. Fallback: synthetic ID based on a counter
    return "__gl_row_" + _syntheticIdCounter++;
}
/**



 * Formats ae value selon son type of column.



 * @param {*} value - Value to formater



 * @param {string} type - Type of data (string, number, date)



 * @returns {string}



 */
function formatValue(value, type) {
    if (value == null || value === "")
        return "—";
    if (type === "number") {
        const num = Number(value);
        if (isNaN(num))
            return String(value);
        return num.toLocaleString("fr-FR");
    }
    if (type === "date") {
        const date = new Date(value);
        if (isNaN(date.getTime()))
            return String(value);
        return date.toLocaleDateString("fr-FR");
    }
    return String(value);
}

/**
 * GeoLeaf Table - Virtual Scroll
 * Renders only visible rows + a buffer for large datasets (> VIRTUAL_THRESHOLD rows).
 */
/** @type {WeakMap<HTMLElement, VirtualState>} */
const _virtualState = new WeakMap();
/**
 * Registers virtual scroll state for a container.
 * Must be called right after createTableBodyVirtual() and before setupVirtualScroll().
 */
function initVirtualState(container, features, columns, selectedIds, layerConfig, createRowFn) {
    _virtualState.set(container, { features, columns, selectedIds, layerConfig, createRowFn });
}
/**
 * Creates a fixed-height tbody for virtual scrolling.
 * Only the initially visible window is populated; subsequent rows are rendered on scroll.
 * @param {Array} features - All features
 * @param {Array} columns - Column config
 * @param {Set} selectedIds - Selected IDs
 * @param {Function} createRowFn - Row factory from the main renderer
 * @returns {HTMLElement}
 */
function createTableBodyVirtual(features, columns, selectedIds, createRowFn) {
    const tbody = createElement("tbody");
    tbody.setAttribute("data-virtual", "true");
    tbody.style.height = features.length * VIRTUAL_ROW_HEIGHT + "px";
    updateVirtualRows(tbody, features, columns, selectedIds, 0, createRowFn);
    return tbody;
}
/**
 * Fills tbody with a top spacer, visible rows, and a bottom spacer based on scrollTop.
 * @param {HTMLElement} tbody - Virtual tbody element
 * @param {Array} features - All features
 * @param {Array} columns - Column config
 * @param {Set} selectedIds - Selected IDs
 * @param {number} scrollTop - Current scroll position of the wrapper
 * @param {Function} createRowFn - Row factory from the main renderer
 */
function updateVirtualRows(tbody, features, columns, selectedIds, scrollTop, createRowFn) {
    const wrapper = tbody.closest(".gl-table-panel__wrapper");
    const clientHeight = wrapper ? wrapper.clientHeight : 400;
    const total = features.length;
    const startIndex = Math.max(0, Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_BUFFER);
    const endIndex = Math.min(total, Math.ceil((scrollTop + clientHeight) / VIRTUAL_ROW_HEIGHT) + VIRTUAL_BUFFER);
    const visibleFeatures = features.slice(startIndex, endIndex);
    const colCount = columns && columns.length ? columns.length + 1 : 2;
    DOMSecurity.clearElementFast(tbody);
    const fragment = document.createDocumentFragment();
    if (startIndex > 0) {
        const spacerTop = createElement("tr", { className: "gl-table-panel__spacer" });
        const tdTop = createElement("td", { colSpan: colCount });
        tdTop.style.height = startIndex * VIRTUAL_ROW_HEIGHT + "px";
        spacerTop.appendChild(tdTop);
        fragment.appendChild(spacerTop);
    }
    visibleFeatures.forEach((feature) => {
        const tr = createRowFn(feature, columns, selectedIds);
        tr.style.height = VIRTUAL_ROW_HEIGHT + "px";
        fragment.appendChild(tr);
    });
    if (endIndex < total) {
        const spacerBottom = createElement("tr", { className: "gl-table-panel__spacer" });
        const tdBottom = createElement("td", { colSpan: colCount });
        tdBottom.style.height = (total - endIndex) * VIRTUAL_ROW_HEIGHT + "px";
        spacerBottom.appendChild(tdBottom);
        fragment.appendChild(spacerBottom);
    }
    tbody.appendChild(fragment);
}
/**
 * Attaches a passive scroll listner to the table wrapper.
 * On each scroll, re-renders the visible window of rows.
 * @param {HTMLElement} container - Tabthe module container
 */
function setupVirtualScroll(container) {
    const wrapper = container.querySelector(".gl-table-panel__wrapper");
    const table = container.querySelector(".gl-table-panel__table");
    if (!wrapper || !table)
        return;
    const tbody = table.querySelector("tbody[data-virtual=true]");
    if (!tbody)
        return;
    const onScroll = () => {
        const state = _virtualState.get(container);
        if (!state)
            return;
        updateVirtualRows(tbody, state.features, state.columns, state.selectedIds, wrapper.scrollTop, state.createRowFn);
    };
    if (events) {
        _eventCleanups.push(events.on(wrapper, "scroll", onScroll, { passive: true }, "TableRenderer.virtualScroll"));
    }
    else {
        wrapper.addEventListener("scroll", onScroll, { passive: true });
    }
}

/**
 * GeoLeaf Table - Selection Manager
 * Row selection logic: single clickk, Ctrl+clickk (multi), Shift+clickk (range), toggle-all.
 */
/**
 * Updates the state des buttons de la toolbar en fonction du nombre de lines selected.
 */
function updateToolbarButtonsState() {
    const selectedCount = TableContract.getSelectedIds().length;
    TableContract.updateToolbarButtons(selectedCount);
}
/**
 * Manages the selection of a line (simple, multi, plage ou checkbox).
 * @param {string} featureId - ID de la feature
 * @param {boolean} selected - Selected or not
 * @param {boolean} shiftKey - Shift key pressed
 * @param {boolean} ctrlKey - Ctrl/Cmd key pressed
 * @param {boolean} isCheckbox - Si l'action vient of a checkbox
 */
function handleRowSelection(featureId, selected, shiftKey, ctrlKey, isCheckbox = false) {
    Log.debug("[TableRenderer] handleRowSelection - featureId:", featureId, "selected:", selected);
    const currentSelection = TableContract.getSelectedIds();
    if (shiftKey && currentSelection.length > 0) {
        // Selection par plage (Shift+click)
        Log.debug("[TableRenderer] SHIFT mode - Range selection");
        selectRange(featureId);
    }
    else if (ctrlKey || isCheckbox) {
        // Multi-selection (Ctrl+click ou checkbox)
        Log.debug("[TableRenderer] MULTI mode - Multi-selection" +
            (isCheckbox ? " (checkbox)" : " (Ctrl)"));
        if (selected) {
            const newSelection = [...currentSelection, featureId];
            TableContract.setSelection(newSelection, false);
        }
        else {
            const newSelection = currentSelection.filter((id) => id !== featureId);
            TableContract.setSelection(newSelection, false);
        }
    }
    else {
        // Selection simple
        Log.debug("[TableRenderer] SIMPLE mode - Single selection");
        if (selected) {
            TableContract.setSelection([featureId], false);
        }
        else {
            TableContract.clearSelection();
        }
    }
    updateToolbarButtonsState();
}
/**
 * Selects a range of rows (Shift+click) between the last selection and the target.
 * @param {string} targetId - ID de la feature cible
 */
function selectRange(targetId) {
    const tbody = document.querySelector(".gl-table-panel__table tbody");
    if (!tbody)
        return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const currentSelection = TableContract.getSelectedIds();
    const lastSelected = currentSelection[currentSelection.length - 1];
    const targetIndex = rows.findIndex((r) => r.getAttribute("data-feature-id") === targetId);
    const lastIndex = rows.findIndex((r) => r.getAttribute("data-feature-id") === lastSelected);
    if (targetIndex === -1 || lastIndex === -1)
        return;
    const start = Math.min(targetIndex, lastIndex);
    const end = Math.max(targetIndex, lastIndex);
    const rangeIds = [];
    for (let i = start; i <= end; i++) {
        const id = rows[i].getAttribute("data-feature-id");
        if (id)
            rangeIds.push(id);
    }
    TableContract.setSelection(rangeIds, false);
    updateToolbarButtonsState();
}
/**
 * Toggle toutes les lines via le checkbox "tout selectionner".
 * @param {boolean} checked - STATE du checkbox
 */
function toggleAllRows(checked) {
    const tbody = document.querySelector(".gl-table-panel__table tbody");
    if (!tbody)
        return;
    const rows = tbody.querySelectorAll("tr");
    const ids = [];
    rows.forEach((row) => {
        const id = row.getAttribute("data-feature-id");
        if (id) {
            ids.push(id);
            row.classList.toggle("gl-is-selected", checked);
            const checkbox = row.querySelector(".gl-table-panel__checkbox");
            if (checkbox)
                checkbox.checked = checked;
        }
    });
    if (checked) {
        TableContract.setSelection(ids, false);
    }
    else {
        TableContract.clearSelection();
    }
    updateToolbarButtonsState();
}

/**
 * GeoLeaf Table - Renderer Module (orchestrator)
 * Rendu des columns, lines et pagination avec virtual scrolling.
 *
 * Sub-modules:
 *  - table-renderer-utils.ts     — constants, getFeatureId, formatValue, _eventCleanups
 *  - table-renderer-virtual-scroll.ts — virtual scrolling for large datasets
 *  - table-selection-manager.ts  — row selection logic (single, multi, range, toggle-all)
 */
const _TableRenderer = {};
// Exposes the shared cleanup array on the object for backward compatibility
_TableRenderer._eventCleanups = _eventCleanups;
/**
 * Flush all tracked event cleanups (called before re-render and on destroy).
 */
_TableRenderer._flushEventCleanups = function () {
    const cleanups = _eventCleanups;
    for (let i = 0; i < cleanups.length; i++) {
        const item = cleanups[i];
        if (typeof item === "function") {
            try {
                item();
            }
            catch (_e) {
                /* ignore */
            }
        }
        else if (typeof item === "number") {
            try {
                events?.off(item);
            }
            catch (_e) {
                /* ignore */
            }
        }
    }
    cleanups.length = 0;
};
/**
 * Destroy the table renderer and clean up all event listners.
 */
_TableRenderer.destroy = function () {
    this._flushEventCleanups();
};
function _getLayerTableConfig(layerId) {
    const layerData = GeoJSONShared.getLayerById(layerId);
    return layerData?.config?.table ?? null;
}
function _renderTableBody(container, features, columns, selectedIds, layerConfig, table) {
    if (features.length > VIRTUAL_THRESHOLD) {
        const tbody = createTableBodyVirtual(features, columns, selectedIds, createTableRow);
        table.appendChild(tbody);
        initVirtualState(container, features, columns, selectedIds, layerConfig, createTableRow);
        setupVirtualScroll(container);
    }
    else {
        const tbody = createTableBody(features, columns, selectedIds);
        table.appendChild(tbody);
    }
}
/**
 * Rend the table with thes data fournies.
 * @param {HTMLElement} container - Conteneur du array
 * @param {Object} options - Options de rendu
 * @param {string} options.layerId - ID de the layer
 * @param {Array} options.features - Features to display
 * @param {Set} options.selectedIds - IDs des entities selected
 * @param {Object} options.sortState - STATE du tri
 */
_TableRenderer.render = function (container, options) {
    Log.debug("[TableRenderer] render() - Start, options:", options);
    if (!container) {
        Log.error("[TableRenderer] Conteneur invalide");
        return;
    }
    // Flush previous event cleanups before re-render
    _TableRenderer._flushEventCleanups();
    // Reset le compteur d'IDs synthetic to chaque rendu
    resetSyntheticIdCounter();
    const { layerId, features, selectedIds, sortState } = options;
    Log.debug("[TableRenderer] render() - layerId:", layerId, "features:", features ? features.length : 0);
    const table = container.querySelector(".gl-table-panel__table");
    if (!table) {
        Log.error("[TableRenderer] Table element not found");
        return;
    }
    // Si pas de layerId, emptyr the table
    if (!layerId) {
        // SAFE: Empty string to clear the content
        DOMSecurity.clearElementFast(table);
        Log.debug("[TableRenderer] Table cleared (no layer selected)");
        return;
    }
    // Retrieve la config du layer
    const layerConfig = _getLayerTableConfig(layerId);
    if (!layerConfig?.columns) {
        Log.warn("[TableRenderer] No column configuration for", layerId);
        // SAFE: Empty string to clear the content
        DOMSecurity.clearElementFast(table);
        return;
    }
    Log.debug("[TableRenderer] Colonnes:", layerConfig.columns);
    // Emptyr the table avant rebuilding
    DOMSecurity.clearElementFast(table);
    // Createsr le thead
    const thead = createTableHead(layerConfig.columns, sortState);
    table.appendChild(thead);
    _renderTableBody(container, features, layerConfig.columns, selectedIds, layerConfig, table);
    Log.debug("[TableRenderer] Tableau rendu:", features.length, "lines");
};
function _buildCheckboxTh() {
    const thCheckbox = createElement("th", {
        className: "gl-table-panel__th gl-table-panel__th--checkbox",
    });
    const checkboxAll = createElement("input", {
        type: "checkbox",
        className: "gl-table-panel__checkbox-all",
        title: "Select all / Deselect all",
    });
    const checkboxAllHandler = (e) => {
        toggleAllRows(e.target.checked);
    };
    if (events) {
        _eventCleanups.push(events.on(checkboxAll, "change", checkboxAllHandler, false, "TableRenderer.checkboxAll"));
    }
    else {
        checkboxAll.addEventListener("change", checkboxAllHandler);
    }
    thCheckbox.appendChild(checkboxAll);
    return thCheckbox;
}
function _buildSortableTh(col, sortState) {
    const th = createElement("th", { className: "gl-table-panel__th" });
    th.textContent = col.label || col.field;
    if (col.width) {
        th.style.width = col.width;
    }
    const isSortable = col.sortable !== false;
    if (isSortable) {
        th.classList.add("gl-table-panel__th--sortable");
        th.setAttribute("data-field", col.field);
        const sortIcon = createElement("span", { className: "gl-table-panel__sort-icon" });
        if (sortState.field === col.field) {
            if (sortState.direction === "asc") {
                sortIcon.textContent = " \u25b2"; // ▲
                th.classList.add("is-sorted-asc");
            }
            else if (sortState.direction === "desc") {
                sortIcon.textContent = " \u25bc"; // ▼
                th.classList.add("is-sorted-desc");
            }
        }
        else {
            sortIcon.textContent = " \u2195"; // ↕
        }
        th.appendChild(sortIcon);
        const sortHandler = () => {
            TableContract.sortByField(col.field);
        };
        if (events) {
            _eventCleanups.push(events.on(th, "click", sortHandler, false, "TableRenderer.sort"));
        }
        else {
            th.addEventListener("click", sortHandler);
        }
    }
    return th;
}
/**
 * Creates the header du array (thead).
 * @param {Array} columns - Configuration des columns
 * @param {Object} sortState - STATE du tri current
 * @returns {HTMLElement}
 * @private
 */
function createTableHead(columns, sortState) {
    const thead = createElement("thead");
    const tr = createElement("tr");
    tr.appendChild(_buildCheckboxTh());
    columns.forEach((col) => {
        tr.appendChild(_buildSortableTh(col, sortState));
    });
    thead.appendChild(tr);
    return thead;
}
/**
 * Creates the corps du array (tbody).
 * @param {Array} features - Features to display
 * @param {Array} columns - Configuration des columns
 * @param {Set} selectedIds - IDs selected
 * @returns {HTMLElement}
 * @private
 */
function createTableBody(features, columns, selectedIds) {
    Log.debug("[TableRenderer] createTableBody() - features:", features.length);
    const tbody = createElement("tbody");
    // Use DocumentFragment for batch DOM operations
    const fragment = document.createDocumentFragment();
    features.forEach((feature) => {
        const tr = createTableRow(feature, columns, selectedIds);
        fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);
    Log.debug("[TableRenderer] tbody created with", tbody.children.length, "rows");
    return tbody;
}
function _buildRowCheckboxTd(featureId) {
    const tdCheckbox = createElement("td", {
        className: "gl-table-panel__td gl-table-panel__td--checkbox",
    });
    const checkbox = createElement("input", {
        type: "checkbox",
        className: "gl-table-panel__checkbox",
    });
    const checkboxHandler = (e) => {
        handleRowSelection(featureId, e.target.checked, false, true, true);
    };
    if (events) {
        _eventCleanups.push(events.on(checkbox, "change", checkboxHandler, false, "TableRenderer.checkbox"));
    }
    else {
        checkbox.addEventListener("change", checkboxHandler);
    }
    tdCheckbox.appendChild(checkbox);
    return tdCheckbox;
}
function _attachRowClickEvent(tr, featureId) {
    const rowClickHandler = (e) => {
        if (e.target.getAttribute?.("type") === "checkbox")
            return;
        const currentState = tr.classList.contains("gl-is-selected");
        handleRowSelection(featureId, !currentState, e.shiftKey, e.ctrlKey || e.metaKey);
    };
    if (events) {
        _eventCleanups.push(events.on(tr, "click", rowClickHandler, false, "TableRenderer.rowClick"));
    }
    else {
        tr.addEventListener("click", rowClickHandler);
    }
}
/**
 * Creates ae line du array.
 * @param {Object} feature - Feature GeoJSON
 * @param {Array} columns - Configuration des columns
 * @param {Set} selectedIds - IDs selected
 * @returns {HTMLElement}
 * @private
 */
function createTableRow(feature, columns, selectedIds) {
    const tr = createElement("tr");
    const featureId = getFeatureId(feature);
    tr.setAttribute("data-feature-id", featureId);
    if (selectedIds.has(String(featureId))) {
        tr.classList.add("gl-is-selected");
    }
    const tdCheckbox = _buildRowCheckboxTd(featureId);
    const checkbox = tdCheckbox.querySelector(".gl-table-panel__checkbox");
    if (checkbox)
        checkbox.checked = selectedIds.has(String(featureId));
    tr.appendChild(tdCheckbox);
    columns.forEach((col) => {
        const td = createElement("td", { className: "gl-table-panel__td" });
        const value = getNestedValue(feature, col.field);
        td.textContent = formatValue(value, col.type);
        if (col.type === "number") {
            td.classList.add("gl-table-panel__td--number");
        }
        tr.appendChild(td);
    });
    _attachRowClickEvent(tr, featureId);
    return tr;
}
/**
 * Met a jour la selection visuelle dans the table sans re-rendre toutes les lines.
 * @param {HTMLElement} container - Conteneur du array
 * @param {Set} selectedIds - IDs selectionnes
 */
_TableRenderer.updateSelection = function (container, selectedIds) {
    const tbody = container.querySelector(".gl-table-panel__table tbody");
    if (!tbody)
        return;
    const rows = tbody.querySelectorAll("tr");
    rows.forEach((row) => {
        const id = row.getAttribute("data-feature-id");
        const isSelected = selectedIds.has(String(id));
        row.classList.toggle("gl-is-selected", isSelected);
        const checkbox = row.querySelector(".gl-table-panel__checkbox");
        if (checkbox) {
            checkbox.checked = isSelected;
        }
    });
    // Mettre a jour le checkbox "tout selectionner"
    const checkboxAll = container.querySelector(".gl-table-panel__checkbox-all");
    if (checkboxAll) {
        // Count only feature rows (rows with data-feature-id) to exclude virtual-scroll spacers
        const totalRows = tbody.querySelectorAll("tr[data-feature-id]").length;
        const selectedCount = selectedIds.size;
        checkboxAll.checked = totalRows > 0 && selectedCount === totalRows;
        checkboxAll.indeterminate = selectedCount > 0 && selectedCount < totalRows;
    }
    updateToolbarButtonsState();
};
const TableRenderer = _TableRenderer;

/**
 * GeoLeaf Table – Selection and export logic.
 * @module table/table-selection
 */
/** Returns the IDs des entities selected. */
function getSelectedIds() {
    return Array.from(tableState._selectedIds);
}
/**
 * Selects or deselects entities.
 * @param ids - IDs to selectionner
 * @param add - Addsr to the selection existing (true) ou remplacer (false)
 */
function setSelection(ids, add = false) {
    if (!add) {
        tableState._selectedIds.clear();
    }
    ids.forEach((id) => tableState._selectedIds.add(String(id)));
    fireEvent("table:selectionChanged", {
        layerId: tableState._currentLayerId,
        selectedIds: Array.from(tableState._selectedIds),
    });
    if (TableRenderer && typeof TableRenderer.updateSelection === "function") {
        TableRenderer.updateSelection(tableState._container, tableState._selectedIds);
    }
    Log.debug("[Table] Selection updated:", tableState._selectedIds.size, "entities");
}
/** Efface toute the selection. */
function clearSelection() {
    tableState._selectedIds.clear();
    fireEvent("table:selectionChanged", {
        layerId: tableState._currentLayerId,
        selectedIds: [],
    });
    if (TableRenderer && typeof TableRenderer.updateSelection === "function") {
        TableRenderer.updateSelection(tableState._container, tableState._selectedIds);
    }
    Log.debug("[Table] Selection cleared");
}
/** Zoom on selected entities via the adapter. */
function zoomToSelection() {
    if (tableState._selectedIds.size === 0) {
        Log.warn("[Table] No entity selected for zoom");
        return;
    }
    const selectedFeatures = getSelectedFeatures();
    if (selectedFeatures.length === 0) {
        Log.warn("[Table] No feature found for selected IDs");
        return;
    }
    // Compute GeoLeafBounds from feature geometries
    let north = -90, south = 90, east = -180, west = 180;
    let hasCoords = false;
    selectedFeatures.forEach((feature) => {
        if (feature.geometry && feature.geometry.coordinates) {
            _extendBoundsBox(feature.geometry, (lng, lat) => {
                if (lat > north)
                    north = lat;
                if (lat < south)
                    south = lat;
                if (lng > east)
                    east = lng;
                if (lng < west)
                    west = lng;
                hasCoords = true;
            });
        }
    });
    if (hasCoords && north >= south && east >= west) {
        const map = tableState._map;
        if (map && typeof map.fitBounds === "function") {
            map.fitBounds({ north, south, east, west }, { padding: { x: 50, y: 50 } });
        }
        fireEvent("table:zoomToSelection", {
            layerId: tableState._currentLayerId,
            selectedIds: Array.from(tableState._selectedIds),
        });
        Log.debug("[Table] Zoom on selection (", selectedFeatures.length, "entities)");
    }
    else {
        Log.warn("[Table] Invalid bounds for selection");
    }
}
/** Walks geometry coordinates and calls `cb(lng, lat)` for each point. */
function _extendBoundsBox(geometry, cb) {
    const coords = geometry.coordinates;
    const type = geometry.type;
    if (type === "Point") {
        cb(coords[0], coords[1]);
    }
    else if (type === "LineString" || type === "MultiPoint") {
        coords.forEach((c) => cb(c[0], c[1]));
    }
    else if (type === "MultiLineString" || type === "Polygon") {
        coords.forEach((ring) => ring.forEach((c) => cb(c[0], c[1])));
    }
    else if (type === "MultiPolygon") {
        coords.forEach((poly) => poly.forEach((ring) => ring.forEach((c) => cb(c[0], c[1]))));
    }
}
function _resolveOptions(options) {
    const cfg = tableState._config ?? {};
    return {
        csvSeparator: options?.csvSeparator ?? cfg.csvSeparator,
        csvIncludeGeometry: options?.csvIncludeGeometry ?? cfg.csvIncludeGeometry,
    };
}
/** Exports selected entities in the given format (default: geojson). */
function exportSelection(format = "geojson", options) {
    if (tableState._selectedIds.size === 0) {
        Log.warn("[Table] No entity selected for export");
        return;
    }
    const selectedFeatures = getSelectedFeatures();
    if (selectedFeatures.length === 0) {
        Log.warn("[Table] No feature found for export");
        return;
    }
    const layerId = tableState._currentLayerId ?? "";
    downloadFeatures(selectedFeatures, format, layerId, "selection", _resolveOptions(options)).catch((e) => {
        Log.error("[Table] Error during export:", e);
    });
    Log.info("[Table] Export (" + format + "):", selectedFeatures.length, "entities");
    fireEvent("table:exportSelection", {
        layerId,
        format,
        selectedIds: Array.from(tableState._selectedIds),
        rows: selectedFeatures,
    });
}
/** Exports all features of the current layer in the given format (default: geojson). */
function exportLayerAll(format = "geojson", options) {
    const layerId = tableState._currentLayerId ?? "";
    if (!layerId) {
        Log.warn("[Table] No active layer for export");
        return;
    }
    const features = getAllLayerFeatures(layerId);
    if (features.length === 0) {
        Log.warn("[Table] No features found in layer:", layerId);
        return;
    }
    downloadFeatures(features, format, layerId, "layer", _resolveOptions(options)).catch((e) => {
        Log.error("[Table] Error during layer export:", e);
    });
    Log.info("[Table] Layer export (" + format + "):", features.length, "features");
    fireEvent("table:exportLayer", { layerId, format, count: features.length });
}

/**
 * GeoLeaf Table – Sort Utilities
 * Pure sort helpers extracted from geoleaf.table.js (Phase 8.2.2)
 *
 * @module table/sort
 */
/**
 * Trie the table `cachedData` en place selon `sortState`.
 */
function sortInPlace(cachedData, sortState, getNestedValue) {
    if (!sortState.field || !sortState.direction)
        return;
    const { field, direction } = sortState;
    cachedData.sort((a, b) => {
        const valA = getNestedValue(a, field);
        const valB = getNestedValue(b, field);
        if (valA == null && valB == null)
            return 0;
        if (valA == null)
            return direction === "asc" ? 1 : -1;
        if (valB == null)
            return direction === "asc" ? -1 : 1;
        let result = 0;
        if (typeof valA === "number" && typeof valB === "number") {
            result = valA - valB;
        }
        else {
            result = String(valA).localeCompare(String(valB));
        }
        return direction === "asc" ? result : -result;
    });
}
/**
 * Calculates the prochain state de tri d'after un click sur une column.
 * Cycle : (aucun) → asc → desc → (aucun).
 */
function nextSortState(sortState, field) {
    if (sortState.field === field) {
        if (sortState.direction === "asc")
            return { field, direction: "desc" };
        if (sortState.direction === "desc")
            return { field: null, direction: null };
        return { field, direction: "asc" };
    }
    return { field, direction: "asc" };
}

/**
 * GeoLeaf Table API - Orchestrator and public API.
 * Wires together table-state, table-layer, table-highlight and table-selection sub-modules.
 *
 * @module table/table-api
 */
/*!
 * GeoLeaf Core
 * © 2026 Mattieu Pottier
 * Released under the MIT License
 * https://geoleaf.dev
 */
function applySorting() {
    sortInPlace(tableState._cachedData, tableState._sortState, (o, p) => getNestedValue(o, p));
    Log.debug("[Table] Sort applied:", tableState._sortState.field, tableState._sortState.direction);
}
const TableModule = {
    init(options) {
        if (!options || !options.map) {
            Log.error("[Table] init() requires a MapLibre map instance");
            return;
        }
        tableState._map = options.map;
        const globalConfig = _g.GeoLeaf.Config ? _g.GeoLeaf.Config.get("tableConfig") : null;
        tableState._config = Object.assign({
            enabled: true,
            defaultVisible: false,
            pageSize: 50,
            maxRowsPerLayer: 1000,
            enableExportButton: true,
            virtualScrolling: true,
            defaultHeight: "40%",
            minHeight: "20%",
            maxHeight: "60%",
            resizable: true,
        }, globalConfig, options.config);
        if (!tableState._config.enabled) {
            Log.info("[Table] Module disabled via configuration");
            return;
        }
        Log.info("[Table] Initialisation du module Table", tableState._config);
        if (TablePanel && typeof TablePanel.create === "function") {
            tableState._container = TablePanel.create(tableState._map, tableState._config);
        }
        else {
            Log.error("[Table] Module table/panel.js not loaded");
            return;
        }
        if (tableState._config.defaultVisible) {
            this.show();
        }
        attachMapEvents(() => this.refresh(), (layerId) => this.setLayer(layerId));
        Log.info("[Table] Table module initialized successfully");
    },
    show() {
        if (!tableState._container) {
            Log.warn("[Table] Container not initialized");
            return;
        }
        tableState._container.classList.add("gl-is-visible");
        tableState._isVisible = true;
        fireEvent("table:opened", {});
        Log.debug("[Table] Table shown");
    },
    hide() {
        if (!tableState._container)
            return;
        clearHighlightLayers();
        tableState._highlightActive = false;
        tableState._container.classList.remove("gl-is-visible");
        tableState._isVisible = false;
        fireEvent("table:closed", {});
        Log.debug("[Table] Table hidden");
    },
    toggle() {
        if (tableState._isVisible) {
            this.hide();
        }
        else {
            this.show();
        }
    },
    setLayer(layerId) {
        Log.debug("[Table] setLayer called with:", layerId);
        if (!layerId) {
            tableState._currentLayerId = null;
            tableState._selectedIds.clear();
            clearHighlightLayers();
            tableState._highlightActive = false;
            tableState._featureIdMap.clear();
            tableState._sortState = { field: null, direction: null };
            tableState._cachedData = [];
            if (TableRenderer) {
                TableRenderer.render(tableState._container, {
                    layerId: null,
                    features: [],
                    selectedIds: tableState._selectedIds,
                    sortState: tableState._sortState,
                    config: tableState._config,
                });
            }
            fireEvent("table:layerChanged", { layerId: null });
            Log.debug("[Table] Table cleared (no layer selected)");
            return;
        }
        const layers = getAvailableLayers();
        const layer = layers.find((l) => l.id === layerId);
        if (!layer) {
            Log.warn("[Table] Layer not found or not active for the table:", layerId);
            return;
        }
        tableState._currentLayerId = layerId;
        tableState._selectedIds.clear();
        clearHighlightLayers();
        tableState._highlightActive = false;
        tableState._sortState = { field: null, direction: null };
        const layerData = _g.GeoLeaf.GeoJSON ? _g.GeoLeaf.GeoJSON.getLayerData(layerId) : null;
        if (layerData?.config?.table?.defaultSort) {
            tableState._sortState.field = layerData.config.table.defaultSort.field;
            tableState._sortState.direction =
                layerData.config.table.defaultSort.direction ||
                    layerData.config.table.defaultSort.order ||
                    "asc";
        }
        this.refresh();
        fireEvent("table:layerChanged", { layerId });
        Log.debug("[Table] Layer changed:", layerId);
    },
    refresh() {
        if (!tableState._currentLayerId) {
            Log.debug("[Table] No layer selected, cannot refresh");
            return;
        }
        const features = getLayerFeatures(tableState._currentLayerId);
        tableState._cachedData = features;
        tableState._featureIdMap.clear();
        let syntheticCounter = 0;
        features.forEach((feature, index) => {
            const id = resolveFeatureId(feature, syntheticCounter);
            if (id.startsWith("__gl_row_"))
                syntheticCounter++;
            tableState._featureIdMap.set(id, index);
        });
        Log.debug("[Table] Features retrieved:", features.length);
        if (tableState._sortState.field && tableState._sortState.direction) {
            applySorting();
        }
        if (TableRenderer && typeof TableRenderer.render === "function") {
            TableRenderer.render(tableState._container, {
                layerId: tableState._currentLayerId,
                features: tableState._cachedData,
                selectedIds: tableState._selectedIds,
                sortState: tableState._sortState,
                config: tableState._config,
            });
        }
        else {
            Log.error("[Table] Renderer non disponible");
        }
        Log.debug("[Table] Data refreshed:", features.length, "entities");
    },
    sortByField(field) {
        tableState._sortState = nextSortState(tableState._sortState, field);
        this.refresh();
        fireEvent("table:sortChanged", tableState._sortState);
    },
    setSelection: (ids, add = false) => setSelection(ids, add),
    getSelectedIds: () => getSelectedIds(),
    clearSelection: () => clearSelection(),
    zoomToSelection: () => zoomToSelection(),
    highlightSelection: (active) => highlightSelection(active),
    exportSelection: (format, options) => exportSelection(format, options),
    exportLayer: (format, options) => exportLayerAll(format, options),
};
const Table = TableModule;
// State property forwarding — permet aux tests d'access/modifier the state via Table._*
// comme avant l'extraction de table-state.ts
Object.defineProperties(TableModule, {
    _map: {
        get: () => tableState._map,
        set: (v) => {
            tableState._map = v;
        },
        configurable: true,
    },
    _container: {
        get: () => tableState._container,
        set: (v) => {
            tableState._container = v;
        },
        configurable: true,
    },
    _config: {
        get: () => tableState._config,
        set: (v) => {
            tableState._config = v;
        },
        configurable: true,
    },
    _currentLayerId: {
        get: () => tableState._currentLayerId,
        set: (v) => {
            tableState._currentLayerId = v;
        },
        configurable: true,
    },
    _selectedIds: { get: () => tableState._selectedIds, configurable: true },
    _cachedData: {
        get: () => tableState._cachedData,
        set: (v) => {
            tableState._cachedData = v;
        },
        configurable: true,
    },
    _featureIdMap: { get: () => tableState._featureIdMap, configurable: true },
    _highlightLayers: {
        get: () => tableState._highlightLayers,
        set: (v) => {
            tableState._highlightLayers = v;
        },
        configurable: true,
    },
    _highlightActive: {
        get: () => tableState._highlightActive,
        set: (v) => {
            tableState._highlightActive = v;
        },
        configurable: true,
    },
    _sortState: {
        get: () => tableState._sortState,
        set: (v) => {
            tableState._sortState = v;
        },
        configurable: true,
    },
    _isVisible: {
        get: () => tableState._isVisible,
        set: (v) => {
            tableState._isVisible = v;
        },
        configurable: true,
    },
    // Internal methods exposed for tests (previously on Table, now extracted)
    _getLayerFeatures: {
        value: (layerId) => getLayerFeatures(layerId),
        configurable: true,
    },
    _getAvailableLayers: { value: () => getAvailableLayers(), configurable: true },
    _getAvailableVisibleLayers: { value: () => getAvailableVisibleLayers(), configurable: true },
    _extendBoundsFromGeometry: {
        value: (bounds, geometry) => extendBoundsFromGeometry(bounds, geometry),
        configurable: true,
    },
});
TableContract.register(Table, TablePanel);

export { TableContract as T, Table as a };
//# sourceMappingURL=geoleaf-chunk-table-DbTf8xJx.js.map
