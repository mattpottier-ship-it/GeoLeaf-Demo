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

// Bootstrap GeoLeaf
GeoLeaf.boot();
