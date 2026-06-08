/**
 * GeoLeaf Demo — Initialization script
 * Loads the demo header and bootstraps GeoLeaf.
 * Extracted from inline scripts for CSP compliance (no 'unsafe-inline').
 */

// PWA — Service Worker registration (worker-src 'self' in CSP covers this)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw-core.js')
            .catch(function (err) { console.warn('[GeoLeaf] SW registration failed:', err); });
    });
}

// DEMO ONLY — Remove this fetch block and the demo-header-container div for production projects
fetch('demo-header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('demo-header-container').innerHTML = html; // SAFE: trusted same-origin HTML
        // Bind selectors now that the header DOM is injected (demo.extensions.js ran before the fetch resolved)
        if (window.GeoLeafDemoTheme && typeof window.GeoLeafDemoTheme.bindSelector === 'function') {
            window.GeoLeafDemoTheme.bindSelector();
        }
        if (window.GeoLeafDemoProfile && typeof window.GeoLeafDemoProfile.bind === 'function') {
            window.GeoLeafDemoProfile.bind();
        }
        if (window.GeoLeafDemoLang && typeof window.GeoLeafDemoLang.bind === 'function') {
            window.GeoLeafDemoLang.bind();
        }
    })
    .catch(err => console.error('Erreur chargement header:', err));

// S4 — Lazy-load print / measure / editor on first use.
// Bundles are NOT loaded at boot; toolbar buttons appear immediately via registerLazyForAction.
// Icons are copied from each plugin's entry.ts and are stable across minor versions.
(function () {
    const gl = window.GeoLeaf;
    if (!gl?.plugins || !gl?.registry || !gl?.I18n) return;

    // ── Print ─────────────────────────────────────────────────────────────────
    const _PRINT_ICON =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"' +
        ' stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="6 9 6 2 18 2 18 9"/>' +
        '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>' +
        '<rect x="6" y="14" width="12" height="8"/>' +
        '</svg>';
    gl.I18n.registerDict('print', {
        fr: { 'print.toolbar.button': 'Imprimer' },
        en: { 'print.toolbar.button': 'Print' },
        es: { 'print.toolbar.button': 'Imprimir' },
        pt: { 'print.toolbar.button': 'Imprimir' },
        it: { 'print.toolbar.button': 'Stampa' },
        de: { 'print.toolbar.button': 'Drucken' },
    });
    gl.plugins.registerLazy('print', () => import('./dist/geoleaf-print.plugin.js'));
    gl.plugins.registerLazyForAction('print', 'print', {
        mobileIcon: { icon: _PRINT_ICON, labelKey: 'print.toolbar.button', profileKey: 'ui.showPrint', action: 'print' },
        desktopTabButton: { icon: _PRINT_ICON, labelKey: 'print.toolbar.button', profileKey: 'ui.showPrint', action: 'print' },
    });

    // ── Measure ───────────────────────────────────────────────────────────────
    const _MEASURE_ICON =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"' +
        ' stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M2 20 L20 2"/>' +
        '<path d="M2 20 L2 14 L8 20 Z"/>' +
        '<line x1="6" y1="18" x2="9" y2="15"/>' +
        '<line x1="10" y1="14" x2="13" y2="11"/>' +
        '<line x1="14" y1="10" x2="17" y2="7"/>' +
        '</svg>';
    gl.I18n.registerDict('measure', {
        fr: { 'measure.toolbar.button': 'Mesurer' },
        en: { 'measure.toolbar.button': 'Measure' },
        es: { 'measure.toolbar.button': 'Medir' },
        pt: { 'measure.toolbar.button': 'Medir' },
        it: { 'measure.toolbar.button': 'Misurare' },
        de: { 'measure.toolbar.button': 'Messen' },
    });
    gl.plugins.registerLazy('measure', () => import('./dist/geoleaf-measure.plugin.js'));
    gl.plugins.registerLazyForAction('measure', 'measure', {
        mobileIcon: { icon: _MEASURE_ICON, labelKey: 'measure.toolbar.button', profileKey: 'ui.showMeasure', action: 'measure' },
    });

    // ── Editor ────────────────────────────────────────────────────────────────
    const _EDITOR_ICON =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"' +
        ' stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
        '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
        '</svg>';
    gl.I18n.registerDict('editor', {
        fr: { 'editor.toolbar.button': 'Éditeur' },
        en: { 'editor.toolbar.button': 'Editor' },
        es: { 'editor.toolbar.button': 'Editor' },
        pt: { 'editor.toolbar.button': 'Editor' },
        it: { 'editor.toolbar.button': 'Editor' },
        de: { 'editor.toolbar.button': 'Editor' },
    });
    gl.plugins.registerLazy('editor', () => import('./dist/geoleaf-editor.plugin.js'));
    gl.plugins.registerLazyForAction('editor', 'editor', {
        mobileIcon: { icon: _EDITOR_ICON, labelKey: 'editor.toolbar.button', profileKey: 'ui.showEditor', action: 'editor' },
    });
})();

// ── DEV-ONLY — Connector bootstrap (auth) ───────────────────────────────────
// Loads an optional, git-ignored local file `connector.local.js` that defines
// `window.GEOLEAF_DEV_CONNECTOR = { baseUrl, getToken }` (a dev JWT for the demo
// PostGIS/PostgREST backend). Used to attach the bearer on authenticated reads
// (private feature) and addpoi/editor writes when testing locally.
// Double safety: the token lives ONLY in the git-ignored file (never in this
// committed script), AND activation is restricted to localhost/127.0.0.1 so it
// never runs on a deployed origin. Template: connector.local.example.js.
// Production must use a real login flow (Connector `auth.endpoint`).
if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) {
    try {
        await import('./connector.local.js');
    } catch (_e) {
        /* no local dev connector configured — fine */
    }
    if (window.GEOLEAF_DEV_CONNECTOR && window.GeoLeaf?.Connector?.configure) {
        try {
            await GeoLeaf.Connector.configure(window.GEOLEAF_DEV_CONNECTOR);
        } catch (e) {
            console.warn('[GeoLeaf] Connector dev config failed:', e);
        }
    }
}

// Bootstrap GeoLeaf
GeoLeaf.boot();
