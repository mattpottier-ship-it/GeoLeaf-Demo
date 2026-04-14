/**
 * Demo page-specific extensions
 *
 * This file contains features reserved for the demo page:
 * - Verbose logging system with DemoLog control
 * - CSS theme selector for testing different styles
 * - Profile selector with page reload
 * - Language selector with URL param override (?lang=xx)
 *
 * These features must NOT be deployed in production
 */
(function () {
    "use strict";

    // ============================================================
    // 1) Demo log system with verbose mode
    // ============================================================
    window.DemoLog = {
        _isVerbose: false,

        setVerbose(enabled) {
            this._isVerbose = enabled;
            if (enabled) {
                console.info("[Demo] Verbose mode enabled for demo");
            }
        },

        log(...args) {
            if (this._isVerbose ||
                location.search.includes('debug=true') ||
                location.search.includes('verbose=true')) {
                console.log(...args);
            }
        },

        info(...args) {
            console.info(...args);
        },

        progress(message, details = null) {
            if (this._isVerbose || location.search.includes('debug=true')) {
                console.log(`[GeoLeaf.Demo] ${message}`, details || '');
            }
        },

        warn(...args) {
            console.warn(...args);
        },

        error(...args) {
            console.error(...args);
        }
    };

    // Auto-configuration du mode verbeux
    if (location.search.includes('verbose=true')) {
        window.DemoLog.setVerbose(true);
    } else {
        console.info("🔇 [Demo] Demo logs reduced - add ?verbose=true for details");
    }

    // ============================================================
    // 2) CSS theme selector (for testing different styles)
    // ============================================================
    (function demoThemeSelector() {
        var LINK_ID = 'gl-demo-theme-css';
        var STORAGE_KEY = 'gl-demo-theme';

        var THEMES = {
            default: '',
            green: 'css/geoleaf-theme-green.css',
            alt: 'css/geoleaf-theme-alt.css'
        };

        function ensureLink() {
            var link = document.getElementById(LINK_ID);
            if (!link) {
                link = document.createElement('link');
                link.rel = 'stylesheet';
                link.id = LINK_ID;
                document.head.appendChild(link);
            }
            return link;
        }

        function applyTheme(key) {
            try {
                var href = THEMES.hasOwnProperty(key) ? THEMES[key] : '';
                var link = ensureLink();
                if (href) {
                    link.href = href;
                } else {
                    link.removeAttribute('href');
                }
                try {
                    localStorage.setItem(STORAGE_KEY, key);
                } catch (e) {
                    DemoLog.warn('[Demo] Unable to save theme:', e);
                }
                DemoLog.info('[Demo] Theme applied:', key);
            } catch (e) {
                console.warn('[GeoLeaf.Demo] Error applying theme:', e);
            }
        }

        // Apply saved theme
        var stored = 'default';
        try {
            stored = localStorage.getItem(STORAGE_KEY) || 'default';
        } catch (e) {
            DemoLog.warn('[Demo] Unable to read saved theme:', e);
        }
        applyTheme(stored);

        // Connect selector to DOM — also called externally after dynamic header injection
        function bindSelector() {
            var sel = document.getElementById('gl-theme-select');
            if (!sel) {
                DemoLog.log('[Demo] Theme selector not found in DOM');
                return;
            }

            try {
                sel.value = stored || 'default';
            } catch (e) {
                DemoLog.warn('[Demo] Error setting selector value:', e);
            }

            sel.addEventListener('change', function () {
                var v = sel.value || 'default';
                applyTheme(v);
            });

            DemoLog.log('[Demo] CSS theme selector connected');
        }

        // API publique pour usage manuel + rebind après injection header dynamique
        window.GeoLeafDemoTheme = {
            THEMES: THEMES,
            apply: applyTheme,
            bindSelector: bindSelector
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindSelector);
        } else {
            bindSelector();
        }
    })();

    // ============================================================
    // 3) Profile selector with page reload
    // ============================================================
    function initProfileSelector() {
        var profileSelect = document.getElementById('gl-profile-select');

        if (!profileSelect) {
            DemoLog.log('[Demo] Profile selector not found in DOM (normal if no header)');
            return;
        }

        profileSelect.addEventListener('change', function(e) {
            var newProfileId = e.target.value;

            DemoLog.info('[Demo] 🔄 Changement de profil vers:', newProfileId);

            try {
                sessionStorage.setItem('gl-selected-profile', newProfileId);

                // Clear SW cache to avoid stale profile data on reload
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    var mc = new MessageChannel();
                    navigator.serviceWorker.controller.postMessage(
                        { type: 'CLEAR_CACHE' },
                        [mc.port2]
                    );
                }

                DemoLog.log('[Demo] Rechargement de la page avec le profil:', newProfileId);
                // Cache-busting: force fresh fetch of profile resources
                window.location.href = window.location.pathname + '?profile=' + encodeURIComponent(newProfileId) + '&t=' + Date.now();
            } catch (err) {
                console.error('[GeoLeaf.Demo] Erreur lors du changement de profil:', err);
                alert('Erreur lors du changement de profil. Voir la console.');
            }
        });

        // Update selector to reflect active profile after load
        setTimeout(function() {
            if (window.GeoLeaf && window.GeoLeaf.Config) {
                var activeProfileId = window.GeoLeaf.Config.getActiveProfileId();
                if (activeProfileId && profileSelect.value !== activeProfileId) {
                    profileSelect.value = activeProfileId;
                    DemoLog.log('[Demo] Selector updated with active profile:', activeProfileId);
                }
            }
        }, 1000);

        DemoLog.info('[Demo] Profile selector initialized');
    }

    // API publique pour rebind après injection header dynamique
    window.GeoLeafDemoProfile = {
        bind: initProfileSelector
    };

    // Initialiser au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfileSelector);
    } else {
        initProfileSelector();
    }

    // ============================================================
    // 4) Language selector with URL param override
    // ============================================================
    function initLangSelector() {
        var langSelect = document.getElementById('gl-lang-select');

        if (!langSelect) {
            DemoLog.log('[Demo] Language selector not found in DOM (normal if no header)');
            return;
        }

        // Restore current language from URL param
        var currentLang = new URLSearchParams(window.location.search).get('lang') || 'fr';
        langSelect.value = currentLang;

        langSelect.addEventListener('change', function(e) {
            var newLang = e.target.value;
            DemoLog.info('[Demo] 🌐 Changement de langue vers:', newLang);
            try {
                var url = new URL(window.location.href);
                url.searchParams.set('lang', newLang);
                window.location.href = url.href;
            } catch (err) {
                console.error('[GeoLeaf.Demo] Erreur lors du changement de langue:', err);
            }
        });

        DemoLog.info('[Demo] Language selector initialized');
    }

    // API publique pour rebind après injection header dynamique
    window.GeoLeafDemoLang = {
        bind: initLangSelector
    };

    // Initialiser au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLangSelector);
    } else {
        initLangSelector();
    }

    DemoLog.info('[Demo] Demo extensions loaded');

})();
