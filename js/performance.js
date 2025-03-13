/**
 * Performance Optimizer Module
 * 
 * Optimise les performances du site web pour un chargement super fluide
 * et des animations plus impressionnantes avec une gestion intelligente des ressources
 */

// Module de performance avec pattern Module révélé pour encapsuler les fonctionnalités
const PerformanceOptimizer = (function() {
    // Configuration privée
    const config = {
        preloadThreshold: 200, // Distance en px pour précharger les images
        lazyLoadClass: 'lazy-load',
        lazyLoadedClass: 'lazy-loaded',
        priorityClass: 'priority-load', // Classe pour les éléments à charger en priorité
        idleLoadDelay: 300, // Délai avant de charger les ressources non critiques
        throttleDelay: 100, // Délai pour throttling des fonctions onScroll, etc.
        pageCacheDuration: 5 * 60 * 1000, // Durée du cache pour les pages (5 min)
        imageCompressionQuality: 0.8, // Qualité des images compressées à la volée (si supporté)
        minLoadingTime: 300, // Temps minimum pour le préchargeur en ms
        maxLoadingTime: 2000 // Temps maximum pour le préchargeur en ms
    };
    
    // Variables privées
    let isInitialized = false;
    let cacheEnabled = 'caches' in window;
    let observersSupported = 'IntersectionObserver' in window;
    let idleCallbackSupported = 'requestIdleCallback' in window;
    let pageLoadStartTime = performance.now();
    
    /**
     * Initialise toutes les optimisations
     */
    function init() {
        // Éviter les initialisations multiples
        if (isInitialized) return;
        isInitialized = true;
        
        // Enregistrer le temps de début de chargement de la page
        pageLoadStartTime = performance.now();
        
        // Détecter les capacités du navigateur
        detectCapabilities();
        
        // Activer le pré-chargement des ressources
        enableResourcePreloading();
        
        // Configurer le chargement paresseux
        setupLazyLoading();
        
        // Configurer le pré-chargement des pages sur hover
        setupLinkPrefetching();
        
        // Optimiser l'exécution du JavaScript
        optimizeJsExecution();
        
        // Optimiser le rendu
        optimizeRendering();
        
        // Mettre en cache les pages visitées
        if (cacheEnabled) {
            setupPageCaching();
        }
        
        // Surveiller les performances de la page
        monitorPerformance();
        
        // Écouter la fin du chargement de la page pour affiner les animations
        window.addEventListener('load', onPageLoaded);
        
        // Optimiser le comportement du préchargeur
        optimizePreloader();
        
        // Journal des performances
        console.log('[PerformanceOptimizer] Initialized');
    }
    
    /**
     * Détecte les capacités du navigateur et ajuste les stratégies
     */
    function detectCapabilities() {
        // Détecter les fonctionnalités du navigateur
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection ? (connection.type === 'cellular' || connection.downlink < 2) : false;
        const isDataSaverEnabled = connection ? connection.saveData : false;
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isLowPowerMode = ('getBattery' in navigator) ? getBatteryInfo() : false;
        
        // Ajuster la configuration en fonction des capacités
        if (isSlowConnection || isDataSaverEnabled) {
            config.preloadThreshold = 100; // Réduire la distance de préchargement
            config.idleLoadDelay = 500; // Retarder le chargement des ressources non critiques
            config.imageCompressionQuality = 0.6; // Augmenter la compression
        }
        
        // Appliquer les préférences de réduction de mouvement
        if (isReducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        }
        
        // Ajouter la classe appropriée au body
        document.body.classList.toggle('slow-connection', isSlowConnection);
        document.body.classList.toggle('data-saver', isDataSaverEnabled);
        document.body.classList.toggle('reduced-motion', isReducedMotion);
        document.body.classList.toggle('low-power', isLowPowerMode);
    }
    
    /**
     * Récupère les informations de batterie si disponible
     */
    async function getBatteryInfo() {
        try {
            const battery = await navigator.getBattery();
            return battery.level < 0.2 || battery.charging === false;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Active le pré-chargement des ressources critiques
     */
    function enableResourcePreloading() {
        // Précharger les polices et les ressources critiques
        const criticalResources = [
            { type: 'font', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' },
            { type: 'script', url: 'js/main.js' },
            { type: 'style', url: 'css/style.css' }
        ];
        
        criticalResources.forEach(resource => {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.href = resource.url;
            
            switch (resource.type) {
                case 'font':
                    preloadLink.as = 'style';
                    preloadLink.type = 'text/css';
                    break;
                case 'script':
                    preloadLink.as = 'script';
                    break;
                case 'style':
                    preloadLink.as = 'style';
                    preloadLink.type = 'text/css';
                    break;
                case 'image':
                    preloadLink.as = 'image';
                    break;
            }
            
            document.head.appendChild(preloadLink);
        });
    }
    
    /**
     * Configurer le chargement paresseux pour les images et les iframes
     */
    function setupLazyLoading() {
        // Utiliser IntersectionObserver si disponible
        if (observersSupported) {
            const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        loadLazyElement(element);
                        observer.unobserve(element);
                    }
                });
            }, {
                rootMargin: `${config.preloadThreshold}px 0px`
            });
            
            // Observer toutes les images et iframes avec classe lazy-load
            document.querySelectorAll(`.${config.lazyLoadClass}`).forEach(element => {
                lazyLoadObserver.observe(element);
            });
        } else {
            // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
            const lazyElements = Array.from(document.querySelectorAll(`.${config.lazyLoadClass}`));
            
            // Charger immédiatement les éléments critiques
            const priorityElements = lazyElements.filter(el => el.classList.contains(config.priorityClass));
            priorityElements.forEach(loadLazyElement);
            
            // Fonction throttled pour le scroll
            let scrollTimeout;
            const lazyLoadOnScroll = () => {
                if (scrollTimeout) return;
                
                scrollTimeout = setTimeout(() => {
                    const viewportHeight = window.innerHeight;
                    
                    lazyElements.forEach((element, index) => {
                        if (!element.classList.contains(config.lazyLoadedClass)) {
                            const rect = element.getBoundingClientRect();
                            const isVisible = rect.top < viewportHeight + config.preloadThreshold && rect.bottom > -config.preloadThreshold;
                            
                            if (isVisible) {
                                loadLazyElement(element);
                                lazyElements.splice(index, 1);
                            }
                        }
                    });
                    
                    // Si tous les éléments sont chargés, retirer l'event listener
                    if (lazyElements.length === 0) {
                        window.removeEventListener('scroll', lazyLoadOnScroll);
                    }
                    
                    scrollTimeout = null;
                }, config.throttleDelay);
            };
            
            window.addEventListener('scroll', lazyLoadOnScroll, { passive: true });
            // Déclencher une fois pour charger les éléments visibles initialement
            lazyLoadOnScroll();
        }
    }
    
    /**
     * Charge un élément avec chargement paresseux
     */
    function loadLazyElement(element) {
        // Si l'élément est déjà chargé, ignorer
        if (element.classList.contains(config.lazyLoadedClass)) return;
        
        // Obtenir le type d'élément
        if (element.tagName === 'IMG' || element.tagName === 'PICTURE') {
            // Pour les images
            const dataSrc = element.getAttribute('data-src');
            if (dataSrc) {
                element.setAttribute('src', dataSrc);
                element.removeAttribute('data-src');
            }
            
            // Pour srcset (images responsives)
            const dataSrcset = element.getAttribute('data-srcset');
            if (dataSrcset) {
                element.setAttribute('srcset', dataSrcset);
                element.removeAttribute('data-srcset');
            }
        } else if (element.tagName === 'IFRAME') {
            // Pour les iframes
            const dataSrc = element.getAttribute('data-src');
            if (dataSrc) {
                element.setAttribute('src', dataSrc);
                element.removeAttribute('data-src');
            }
        } else if (element.classList.contains('lazy-background')) {
            // Pour les arrière-plans
            const dataSrc = element.getAttribute('data-background');
            if (dataSrc) {
                element.style.backgroundImage = `url(${dataSrc})`;
                element.removeAttribute('data-background');
            }
        }
        
        // Marquer comme chargé
        element.classList.add(config.lazyLoadedClass);
        element.classList.remove(config.lazyLoadClass);
        
        // Déclencher un événement personnalisé
        element.dispatchEvent(new CustomEvent('lazyloaded'));
    }
    
    /**
     * Configure le pré-chargement des pages au survol des liens
     */
    function setupLinkPrefetching() {
        // Ne pas précharger sur les connexions lentes
        if (document.body.classList.contains('slow-connection')) return;
        
        // Cible uniquement les liens internes
        const internalLinks = document.querySelectorAll('a[href^="/"]:not([href*="#"]), a[href^="./"]:not([href*="#"]), a[href^="../"]:not([href*="#"]), a[href^="http"][href*="' + window.location.host + '"]:not([href*="#"])');
        
        // Variables pour le suivi des préchargements
        const prefetchedUrls = new Set();
        let hoverTimer;
        
        internalLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const url = link.href;
                
                // Ne précharger qu'une fois par URL
                if (prefetchedUrls.has(url)) return;
                
                // Attendre un court instant pour éviter les préchargements inutiles
                hoverTimer = setTimeout(() => {
                    // Créer un lien de préchargement
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = url;
                    document.head.appendChild(prefetchLink);
                    
                    // Marquer l'URL comme préchargée
                    prefetchedUrls.add(url);
                    
                    console.log(`[PerformanceOptimizer] Prefetching: ${url}`);
                }, 100);
            });
            
            link.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);
            });
        });
    }
    
    /**
     * Optimise l'exécution du JavaScript
     */
    function optimizeJsExecution() {
        // Reporter l'exécution du JS non critique
        if (idleCallbackSupported) {
            const deferredScripts = document.querySelectorAll('script[defer-exec]');
            
            deferredScripts.forEach(script => {
                const scriptContent = script.textContent;
                const src = script.getAttribute('src');
                
                // Supprimer le script original pour éviter l'exécution immédiate
                script.parentNode.removeChild(script);
                
                // Programmer l'exécution pendant les périodes d'inactivité
                requestIdleCallback(() => {
                    if (src) {
                        // Pour les scripts externes
                        const newScript = document.createElement('script');
                        newScript.src = src;
                        document.head.appendChild(newScript);
                    } else if (scriptContent) {
                        // Pour les scripts inline
                        eval(scriptContent);
                    }
                }, { timeout: config.idleLoadDelay });
            });
        }
    }
    
    /**
     * Optimise le rendu de la page
     */
    function optimizeRendering() {
        // Éviter les reflows en regroupant les modifications DOM
        document.documentElement.classList.add('optimize-animations');
        
        // Activer will-change sur les éléments animés pour les préparer
        const animatedElements = document.querySelectorAll('.animated, .animate-on-scroll, .hover-animate');
        animatedElements.forEach(element => {
            element.style.willChange = 'transform, opacity';
        });
        
        // Nettoyer will-change après les animations pour libérer des ressources
        window.addEventListener('load', () => {
            setTimeout(() => {
                animatedElements.forEach(element => {
                    if (!element.classList.contains('active')) {
                        element.style.willChange = 'auto';
                    }
                });
            }, 1000); // Attendre que les animations initiales soient terminées
        });
    }
    
    /**
     * Configure le cache des pages pour un chargement ultra-rapide
     */
    function setupPageCaching() {
        // Créer un cache spécifique pour les pages
        const cacheName = 'pages-cache-v1';
        
        // Intercepter les requêtes de navigation pour mettre en cache les pages visitées
        if ('serviceWorker' in navigator) {
            // Vérifier si un service worker est déjà enregistré
            navigator.serviceWorker.getRegistration().then(registration => {
                if (!registration) {
                    // Enregistrer un service worker minimal pour la mise en cache
                    navigator.serviceWorker.register('/service-worker.js').catch(error => {
                        console.error('[PerformanceOptimizer] Service Worker registration failed:', error);
                    });
                }
            });
        } else {
            // Alternative pour les navigateurs sans service worker
            // Utiliser l'API Cache directement
            window.addEventListener('load', () => {
                if ('caches' in window) {
                    const currentUrl = window.location.href;
                    
                    // Mettre en cache la page courante
                    caches.open(cacheName).then(cache => {
                        fetch(currentUrl, { credentials: 'same-origin' })
                            .then(response => {
                                cache.put(currentUrl, response);
                            })
                            .catch(error => {
                                console.error('[PerformanceOptimizer] Caching current page failed:', error);
                            });
                    });
                }
            });
        }
    }
    
    /**
     * Surveille les performances de la page et ajuste automatiquement
     */
    function monitorPerformance() {
        // Observer les métriques de performance web vitales
        if ('PerformanceObserver' in window) {
            try {
                // Observer les FID (First Input Delay)
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        // Si le FID est élevé, réduire les animations
                        if (entry.processingStart - entry.startTime > 100) {
                            document.body.classList.add('reduce-animations');
                        }
                    });
                }).observe({ type: 'first-input', buffered: true });
                
                // Observer le CLS (Cumulative Layout Shift)
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const totalCLS = entries.reduce((sum, entry) => sum + entry.value, 0);
                    
                    // Si le CLS est élevé, stabiliser le layout
                    if (totalCLS > 0.1) {
                        document.body.classList.add('stabilize-layout');
                    }
                }).observe({ type: 'layout-shift', buffered: true });
            } catch (e) {
                console.warn('[PerformanceOptimizer] PerformanceObserver error:', e);
            }
        }
    }
    
    /**
     * Appelé quand la page est complètement chargée
     */
    function onPageLoaded() {
        // Calculer le temps de chargement de la page
        const loadTime = performance.now() - pageLoadStartTime;
        console.log(`[PerformanceOptimizer] Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Si la page se charge très rapidement, garder le préchargeur un peu plus longtemps
        if (loadTime < config.minLoadingTime) {
            const preloader = document.querySelector('.preloader');
            if (preloader && !preloader.classList.contains('hidden')) {
                setTimeout(() => {
                    preloader.classList.add('hidden');
                }, config.minLoadingTime - loadTime);
            }
        }
        
        // Nettoyer les optimisations temporaires
        document.querySelectorAll('[style*="will-change"]').forEach(element => {
            // Ne garder will-change que sur les éléments en cours d'animation
            if (!element.classList.contains('animating')) {
                element.style.willChange = 'auto';
            }
        });
        
        // Charger les ressources non critiques après le chargement de la page
        loadDeferredResources();
    }
    
    /**
     * Optimise le comportement du préchargeur
     */
    function optimizePreloader() {
        const preloader = document.querySelector('.preloader');
        if (!preloader) return;
        
        // Définir un temps maximum pour le préchargeur
        setTimeout(() => {
            if (!preloader.classList.contains('hidden')) {
                console.log('[PerformanceOptimizer] Force hiding preloader after timeout');
                preloader.classList.add('hidden');
                
                // Libérer complètement les ressources du préchargeur
                setTimeout(() => {
                    preloader.style.display = 'none';
                    document.body.classList.add('page-loaded');
                }, 500);
            }
        }, config.maxLoadingTime);
    }
    
    /**
     * Charge les ressources différées après le chargement initial
     */
    function loadDeferredResources() {
        // Utiliser requestIdleCallback si disponible
        const loadMethod = idleCallbackSupported ? requestIdleCallback : setTimeout;
        
        loadMethod(() => {
            // Charger les scripts non critiques
            document.querySelectorAll('script[data-defer]').forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            });
            
            // Remplacer les placeholders d'images par les images réelles
            document.querySelectorAll('img[data-defer-src]').forEach(img => {
                const src = img.getAttribute('data-defer-src');
                img.setAttribute('src', src);
                img.removeAttribute('data-defer-src');
            });
        }, { timeout: 3000 }); // Timeout pour requestIdleCallback
    }
    
    // API publique
    return {
        init,
        config,
        reoptimize: function() {
            // Permet de réoptimiser la page après des changements dynamiques
            setupLazyLoading();
            optimizeRendering();
            return this;
        },
        getLoadTime: function() {
            return performance.now() - pageLoadStartTime;
        }
    };
})();

// Initialiser l'optimiseur de performance dès que possible
document.addEventListener('DOMContentLoaded', () => {
    PerformanceOptimizer.init();
});

// Exporter pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
