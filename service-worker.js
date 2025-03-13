/**
 * Service Worker pour Portfolio d'Elie
 * 
 * Permet un chargement ultra rapide des pages et une expérience offline partielle
 * Optimisé pour une performance maximale et une fluidité de navigation exceptionnelle
 */

const CACHE_NAME = 'portfolio-cache-v1';
const RUNTIME_CACHE = 'portfolio-runtime-v1';

// Ressources à mettre en cache lors de l'installation
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/animations.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/homepage.js',
  '/js/particles.js',
  '/js/performance.js',
  '/assets/img/favicon.ico',
  // Polices et icônes
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  // Bibliothèques JS essentielles
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
];

// Installer le Service Worker et mettre en cache les ressources essentielles
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mise en cache des ressources statiques');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Échec du pré-cache:', error);
      })
  );
});

// Nettoyer les anciens caches lors de l'activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Stratégie de mise en cache intelligente pour les requêtes
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes non GET ou les requêtes vers des API externes
  if (event.request.method !== 'GET' || 
      event.request.url.includes('/api/') || 
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  const requestURL = new URL(event.request.url);
  
  // Stratégie différente pour les ressources statiques principales vs autres ressources
  if (PRECACHE_URLS.includes(requestURL.pathname) || 
      PRECACHE_URLS.includes(requestURL.pathname + '/') ||
      PRECACHE_URLS.includes(event.request.url)) {
    // Pour les ressources principales: Cache-First avec fallback réseau
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              // S'assurer que la réponse est valide
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Mettre en cache une copie de la réponse
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
  } else if (requestURL.pathname.endsWith('.html') || 
             requestURL.pathname === '/' || 
             requestURL.pathname.endsWith('/')) {
    // Pour les pages HTML: Network-First avec fallback cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mettre en cache même si déjà en cache pour avoir la dernière version
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              // Si trouvé dans le cache, renvoyer
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Sinon, essayer d'envoyer la page offline
              if (requestURL.pathname.endsWith('.html') || 
                  requestURL.pathname === '/' ||
                  requestURL.pathname.endsWith('/')) {
                return caches.match('/');
              }
              
              return new Response('Page non disponible hors ligne', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
  } else {
    // Pour autres ressources (images, etc.): Stale-While-Revalidate
    event.respondWith(
      caches.open(RUNTIME_CACHE)
        .then(cache => {
          return cache.match(event.request)
            .then(cachedResponse => {
              const fetchPromise = fetch(event.request)
                .then(networkResponse => {
                  // Mettre à jour le cache avec la nouvelle version
                  if (networkResponse && networkResponse.status === 200) {
                    cache.put(event.request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(error => {
                  console.log('Erreur de récupération:', error);
                });
                
              // Renvoyer la version du cache si disponible, sinon attendre la réponse du réseau
              return cachedResponse || fetchPromise;
            });
        })
    );
  }
});

// Précharger les pages lors de la navigation
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PREFETCH_PAGES') {
    const urls = event.data.urls;
    if (!urls || !Array.isArray(urls)) return;
    
    caches.open(RUNTIME_CACHE)
      .then(cache => {
        return Promise.all(
          urls.map(url => {
            // Ne précharger que si pas déjà en cache
            return cache.match(url)
              .then(cachedResponse => {
                if (!cachedResponse) {
                  return fetch(url)
                    .then(response => cache.put(url, response))
                    .catch(error => console.log(`Échec du préchargement de ${url}:`, error));
                }
                return Promise.resolve();
              });
          })
        );
      });
  }
});

// Gérer les événements de synchronisation en arrière-plan
self.addEventListener('sync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return Promise.all(
            PRECACHE_URLS.map(url => {
              return fetch(url)
                .then(response => cache.put(url, response));
            })
          );
        })
    );
  }
});

// Notification de mise à jour du Service Worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
