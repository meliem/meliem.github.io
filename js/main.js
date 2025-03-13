/**
 * Portfolio d'Elie Maby - Script Principal
 * Gère les fonctionnalités communes à toutes les pages :
 * - Préchargement et transitions de page
 * - Navigation responsive
 * - Animations au scroll
 * - Effets généraux
 */

// Gestionnaire d'état global pour améliorer la maintenabilité et éviter les variables globales éparpillées
const AppState = {
    isPageTransitioning: false,
    transitionDuration: 700, // En millisecondes, doit correspondre à la durée CSS
    isPageLoaded: false,
    eventListeners: [], // Stocke les références aux event listeners pour le nettoyage
    
    // Méthode pour ajouter des écouteurs d'événements de manière centralisée
    addEventListeners: function(element, eventType, callback, options) {
        if (!element) return;
        
        element.addEventListener(eventType, callback, options);
        this.eventListeners.push({ element, eventType, callback });
    },
    
    // Méthode pour nettoyer tous les écouteurs avant une navigation
    removeAllEventListeners: function() {
        this.eventListeners.forEach(({ element, eventType, callback }) => {
            element.removeEventListener(eventType, callback);
        });
        this.eventListeners = [];
    }
};

// Attendre que le DOM soit complètement chargé - un seul event listener pour tout le site
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialiser le préchargeur
        initPreloader();
        
        // Initialiser la navigation
        initNavigation();
        
        // Initialiser les transitions de page
        initPageTransitions();
        
        // Initialiser les animations au scroll
        initScrollAnimations();
        
        // Initialiser le bouton retour en haut
        initBackToTop();
        
        // Fonctionnalités spécifiques selon la page
        initPageSpecificFeatures();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
    }
});

/**
 * Gère le préchargeur et l'animation de chargement initial
 * Optimisé pour être plus performant et mieux gérer les ressources
 */
function initPreloader() {
    const preloader = document.querySelector('.preloader');
    
    if (!preloader) return;
    
    // Détecter si les ressources de la page sont chargées
    window.addEventListener('load', () => {
        AppState.isPageLoaded = true;
        hidePreloader();
    });
    
    // Simuler un chargement minimum pour permettre l'animation (avec un temps maximum d'attente)
    const timeoutId = setTimeout(hidePreloader, 2500);
    
    function hidePreloader() {
        // Éviter les appels multiples
        if (preloader.classList.contains('hidden')) return;
        
        clearTimeout(timeoutId);
        preloader.classList.add('hidden');
        
        // Enlever complètement le préloader après la transition
        setTimeout(() => {
            preloader.style.display = 'none';
            
            // Déclencher les animations d'entrée une fois le préloader terminé
            document.body.classList.add('page-loaded');
            triggerEntranceAnimations();
        }, 500);
    }
}

/**
 * Initialise la navigation responsive avec une meilleure gestion des événements
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    
    if (!navbar || !navToggle || !navLinks) return;
    
    // Toggle du menu mobile avec gestion centralisée des événements
    AppState.addEventListeners(navToggle, 'click', function() {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Fermer le menu après un clic sur un lien
    navItems.forEach(item => {
        AppState.addEventListeners(item, 'click', function(e) {
            const href = this.getAttribute('href') || '';
            const isExternalLink = href.indexOf('http') === 0;
            const isAnchorLink = href.indexOf('#') === 0;
            
            if (!isExternalLink && !isAnchorLink) {
                // Empêcher la navigation par défaut pour les liens internes
                e.preventDefault();
                
                // Déclencher la transition de page
                const targetUrl = href;
                transitionToPage(targetUrl);
            }
            
            // Fermer le menu mobile
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
    
    // Optimiser l'événement de défilement avec throttling pour éviter les appels excessifs
    let scrollTimeout;
    const handleScroll = () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                scrollTimeout = null;
            }, 100);
        }
    };
    
    AppState.addEventListeners(window, 'scroll', handleScroll, { passive: true });
}

/**
 * Initialise les transitions entre les pages avec gestion améliorée des événements
 */
function initPageTransitions() {
    const internalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto"]):not([target="_blank"])');
    const transitionOverlay = document.querySelector('.page-transition-overlay');
    
    if (!transitionOverlay) return;
    
    // Gérer les clics sur les liens internes avec la gestion centralisée des événements
    internalLinks.forEach(link => {
        AppState.addEventListeners(link, 'click', function(e) {
            // Ne pas déclencher pour les liens de navigation déjà gérés
            if (this.parentElement && this.parentElement.classList.contains('nav-links')) return;
            
            const href = this.getAttribute('href');
            if (!href) return;
            
            e.preventDefault();
            transitionToPage(href);
        });
    });
    
    // Gérer la navigation avec le bouton retour du navigateur
    AppState.addEventListeners(window, 'popstate', function(e) {
        // Empêcher la navigation par défaut
        e.preventDefault();
        
        // Si une transition est déjà en cours, ne rien faire
        if (AppState.isPageTransitioning) return;
        
        // Déclencher notre propre transition
        transitionToPage(location.pathname, false);
    });
}

/**
 * Effectue la transition vers une nouvelle page avec gestion améliorée
 * @param {string} url - L'URL cible
 * @param {boolean} pushState - Indique s'il faut ajouter l'URL à l'historique (défaut: true)
 */
function transitionToPage(url, pushState = true) {
    // Validation de l'URL
    if (!url) {
        console.error('URL invalide pour la transition de page');
        return;
    }
    
    // Si une transition est déjà en cours ou si c'est la page actuelle, ne rien faire
    if (AppState.isPageTransitioning || url === window.location.pathname) return;
    
    // Nettoyer les event listeners avant la navigation
    cleanupBeforeNavigation();
    
    AppState.isPageTransitioning = true;
    const transitionOverlay = document.querySelector('.page-transition-overlay');
    
    if (!transitionOverlay) {
        // Fallback si l'overlay n'est pas trouvé
        if (pushState) window.history.pushState({}, '', url);
        window.location.href = url;
        return;
    }
    
    // Ajouter la classe active pour déclencher l'animation
    transitionOverlay.classList.add('active');
    
    // Attendre la fin de l'animation avant de changer de page
    const navigationTimeout = setTimeout(() => {
        // Ajouter l'URL à l'historique si nécessaire
        if (pushState) {
            window.history.pushState({}, '', url);
        }
        
        // Rediriger vers la nouvelle page
        window.location.href = url;
    }, AppState.transitionDuration);
    
    // Sécurité: s'assurer que la navigation se produit même si l'animation échoue
    AppState.addEventListeners(transitionOverlay, 'transitionend', () => {
        clearTimeout(navigationTimeout);
        if (pushState) window.history.pushState({}, '', url);
        window.location.href = url;
    }, { once: true });
}

/**
 * Nettoie les ressources avant une navigation
 * - Supprime les écouteurs d'événements
 * - Arrête les animations en cours
 * - Libère la mémoire
 */
function cleanupBeforeNavigation() {
    // Supprimer tous les écouteurs d'événements
    AppState.removeAllEventListeners();
    
    // Arrêter les animations GSAP si elles existent
    if (typeof gsap !== 'undefined' && gsap.killAll) {
        gsap.killAll();
    }
    
    // Annuler toutes les requêtes fetch en cours (si implémenté)
    // Arrêter les intervalles et timeouts critiques
    
    // Permettre au garbage collector de faire son travail
    // en supprimant les références circulaires
}

/**
 * Initialise les animations déclenchées au scroll avec optimisation des performances
 */
function initScrollAnimations() {
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    if (!scrollElements.length) return;
    
    // Observer les éléments pour les animer quand ils sont visibles
    // avec des options optimisées pour les performances
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Appliquer la classe avec un petit délai pour les éléments qui apparaissent ensemble
                setTimeout(() => {
                    if (entry.target) {
                        entry.target.classList.add('visible');
                    }
                    observer.unobserve(entry.target);
                }, Math.random() * 150); // Délai aléatoire pour un effet plus naturel
            }
        });
    }, {
        threshold: 0.10, // Réduire le seuil pour déclencher l'animation plus tôt
        rootMargin: '0px 0px -50px 0px' // Marge ajustée pour une meilleure expérience
    });
    
    // Observer les éléments uniquement s'ils sont présents dans le DOM
    scrollElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Déclenche les animations d'entrée après le chargement
 */
function triggerEntranceAnimations() {
    // Animation du titre de la page
    const pageHeaders = document.querySelectorAll('.page-header h1');
    pageHeaders.forEach(header => {
        if (header.classList.contains('reveal-text')) {
            header.setAttribute('data-text', header.textContent);
        }
        
        if (header.classList.contains('glitch-title')) {
            header.setAttribute('data-text', header.textContent);
        }
    });
    
    // Animation du contenu hero
    if (document.querySelector('.hero')) {
        const heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, 300 + (index * 200));
        });
    }
}

/**
 * Initialise le bouton de retour en haut de page avec gestion optimisée des événements
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    
    if (!backToTopBtn) return;
    
    // Afficher/masquer le bouton en fonction de la position du scroll avec throttling
    let scrollThrottleTimeout;
    const handleBackToTopVisibility = () => {
        if (!scrollThrottleTimeout) {
            scrollThrottleTimeout = setTimeout(() => {
                if (window.scrollY > 500) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
                scrollThrottleTimeout = null;
            }, 100);
        }
    };
    
    // Utiliser la gestion centralisée des événements
    AppState.addEventListeners(window, 'scroll', handleBackToTopVisibility, { passive: true });
    
    // Remonter en haut de page en douceur au clic
    AppState.addEventListeners(backToTopBtn, 'click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Initialise les fonctionnalités spécifiques à chaque page
 */
function initPageSpecificFeatures() {
    // Détecter la page actuelle
    const body = document.body;
    
    // Page d'accueil
    if (body.classList.contains('page-home')) {
        initTypingEffect();
    }
    
    // Page À propos
    if (body.classList.contains('page-about')) {
        initProfileCard();
    }
    
    // Page Projets
    if (body.classList.contains('page-projects')) {
        initProjectFilters();
        initProjectModals();
    }
}

/**
 * Initialise l'effet de frappe pour la page d'accueil
 */
function initTypingEffect() {
    const typedTextElement = document.querySelector('.typed-text');
    
    if (!typedTextElement) return;
    
    const textArray = ['Data Engineer', 'Développeur', 'Électronicien', 'Spécialiste Cybersécurité'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;
    
    function type() {
        const currentText = textArray[textIndex];
        
        if (isDeleting) {
            // Supprimer des caractères
            typedTextElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = 50;
        } else {
            // Ajouter des caractères
            typedTextElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100;
        }
        
        // Logique de changement de texte
        if (!isDeleting && charIndex === currentText.length) {
            // Pause à la fin du texte
            typingDelay = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Passer au texte suivant
            isDeleting = false;
            textIndex = (textIndex + 1) % textArray.length;
            typingDelay = 300;
        }
        
        setTimeout(type, typingDelay);
    }
    
    // Démarrer l'effet de frappe
    setTimeout(type, 1000);
}

/**
 * Initialise l'animation de la carte de profil (page À propos)
 */
function initProfileCard() {
    const profileCard = document.querySelector('.profile-card');
    
    if (!profileCard) return;
    
    profileCard.addEventListener('click', function() {
        this.classList.toggle('flipped');
    });
}

/**
 * Initialise le filtrage des projets (page Projets)
 */
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectSearch = document.getElementById('project-search');
    const projectCounter = document.querySelector('.project-counter .count');
    
    if (filterButtons.length === 0 || projectCards.length === 0) return;
    
    // Fonction pour mettre à jour le compteur de projets
    function updateProjectCounter(count) {
        if (projectCounter) {
            projectCounter.textContent = count;
        }
    }
    
    // Fonction pour filtrer les projets
    function filterProjects() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const searchTerm = projectSearch ? projectSearch.value.toLowerCase() : '';
        let visibleCount = 0;
        
        projectCards.forEach(card => {
            // Récupérer les catégories du projet (peut être multiple, séparées par des virgules)
            const categories = card.dataset.category.split(',');
            const projectTitle = card.querySelector('.project-title').textContent.toLowerCase();
            const projectDescription = card.querySelector('.project-description').textContent.toLowerCase();
            
            // Vérifier si le projet correspond au filtre actif
            const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
            
            // Vérifier si le projet correspond à la recherche
            const matchesSearch = !searchTerm || 
                                 projectTitle.includes(searchTerm) || 
                                 projectDescription.includes(searchTerm);
            
            // Afficher ou masquer le projet
            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
                visibleCount++;
                
                // Animation progressive d'apparition
                setTimeout(() => {
                    card.classList.add('visible');
                }, 100 * visibleCount);
            } else {
                card.classList.remove('visible');
                card.style.display = 'none';
            }
        });
        
        // Mettre à jour le compteur
        updateProjectCounter(visibleCount);
    }
    
    // Gérer les clics sur les boutons de filtre
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Mise à jour des classes actives
            document.querySelector('.filter-btn.active').classList.remove('active');
            this.classList.add('active');
            
            // Filtrer les projets
            filterProjects();
        });
    });
    
    // Gérer la recherche
    if (projectSearch) {
        projectSearch.addEventListener('input', filterProjects);
    }
    
    // Filtrer les projets au chargement initial
    filterProjects();
}

/**
 * Initialise les modales pour les détails des projets
 */
function initProjectModals() {
    const detailButtons = document.querySelectorAll('.view-details');
    const modal = document.getElementById('project-modal');
    
    if (!modal || detailButtons.length === 0) return;
    
    const modalTitle = modal.querySelector('.modal-title');
    const modalDescription = document.getElementById('modal-description-text');
    const modalTechTags = document.getElementById('modal-tech-tags');
    const modalFeaturesList = document.getElementById('modal-features-list');
    const modalChallengesText = document.getElementById('modal-challenges-text');
    const modalMainImage = document.getElementById('modal-main-image');
    const modalDemoLink = document.getElementById('modal-demo-link');
    const modalGithubLink = document.getElementById('modal-github-link');
    const modalClose = modal.querySelector('.modal-close');
    const modalOverlay = modal.querySelector('.modal-overlay');
    
    // Données des projets (à compléter avec les détails réels)
    const projectsData = {
        'ids-neural': {
            title: 'IDS avec détection par réseau neuronal',
            description: 'Système de détection d\'intrusion utilisant des réseaux neuronaux pour identifier les comportements malveillants sur un réseau. Développé dans le cadre de mon projet ESGI, ce système s\'appuie sur le dataset UNB CICIDS2017 pour l\'apprentissage et la détection.',
            mainImage: 'assets/img/projects/ids-neural-full.jpg',
            techTags: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'Numpy', 'Matplotlib'],
            features: [
                'Détection en temps réel des tentatives d\'intrusion',
                'Classification des types d\'attaques (DoS, DDoS, Brute Force, etc.)',
                'Interface d\'administration pour la visualisation des alertes',
                'Système d\'apprentissage continu pour améliorer la précision'
            ],
            challenges: 'Le principal défi a été d\'optimiser le modèle pour qu\'il puisse fonctionner en temps réel sans consommer trop de ressources. J\'ai également dû faire face à un déséquilibre important dans les données d\'entraînement, ce qui nécessitait des techniques spécifiques de rééchantillonnage pour améliorer la précision de détection des attaques rares.',
            demoLink: '#',
            githubLink: 'https://github.com/'
        },
        'data-recovery': {
            title: 'Système de récupération de données',
            description: 'Système personnalisé développé pour mon activité d\'auto-entrepreneur, permettant de récupérer des données sur des supports endommagés (disques durs, SSD, cartes mémoire, etc.).',
            mainImage: 'assets/img/projects/data-recovery-full.jpg',
            techTags: ['Hardware', 'Électronique', 'Python', 'C++', 'Forensique'],
            features: [
                'Récupération de données sur supports physiquement endommagés',
                'Reconstruction de systèmes de fichiers corrompus',
                'Bypass des protections de sécurité (mot de passe, chiffrement)',
                'Interface utilisateur pour suivre la progression'
            ],
            challenges: 'Chaque cas étant unique, j\'ai dû concevoir un système modulaire capable de s\'adapter à différents types de pannes et de supports. La partie la plus complexe a été de développer un firmware capable d\'accéder aux données brutes en contournant les mécanismes de contrôle défectueux des disques.',
            demoLink: '#',
            githubLink: 'https://github.com/'
        },
        'calendar-app': {
            title: 'CalendarSync - Application Swift',
            description: 'Application iOS développée en Swift permettant de synchroniser automatiquement le calendrier de l\'école au format ICS avec le calendrier de l\'iPhone et d\'envoyer des notifications pour les événements importants.',
            mainImage: 'assets/img/projects/calendar-app-full.jpg',
            techTags: ['Swift', 'iOS', 'iCloud Calendar API', 'ICS Parser', 'Core Data', 'Push Notifications'],
            features: [
                'Synchronisation automatique du calendrier scolaire (format ICS)',
                'Notifications intelligentes pour les cours et examens',
                'Filtrage des événements par type et importance',
                'Fonctionnement hors ligne avec synchronisation différée',
                'Intégration avec les rappels et l\'application Plans pour les salles'
            ],
            challenges: 'Le principal défi a été d\'analyser correctement le format ICS qui peut varier selon les établissements, et de gérer les mises à jour du calendrier sans créer de doublons. J\'ai également dû optimiser la consommation de batterie en implémentant un système intelligent de synchronisation qui s\'adapte aux habitudes de l\'utilisateur.',
            demoLink: '#',
            githubLink: 'https://github.com/'
        },
        'diagnostic-platform': {
            title: 'Plateforme de diagnostic électronique',
            description: 'Outil de diagnostic automatisé pour identifier les problèmes matériels courants sur les appareils électroniques, développé pour mon activité d\'auto-entrepreneur.',
            mainImage: 'assets/img/projects/diagnostic-platform-full.jpg',
            techTags: ['C++', 'Arduino', 'Matériel spécialisé', 'Interface Web', 'JavaScript', 'PHP'],
            features: [
                'Diagnostic automatisé des composants (CPU, RAM, stockage, etc.)',
                'Tests de performance et de stress',
                'Génération de rapports détaillés',
                'Interface Web pour le suivi à distance',
                'Base de données de problèmes connus pour accélérer le diagnostic'
            ],
            challenges: 'La difficulté majeure a été de créer un système universel capable de diagnostiquer différents types d\'appareils (ordinateurs, smartphones, tablettes) avec leurs spécificités propres. J\'ai développé une architecture modulaire avec des adaptateurs spécifiques à chaque type d\'appareil, tout en maintenant une interface utilisateur cohérente.',
            demoLink: '#',
            githubLink: 'https://github.com/'
        },
        'gtc-system': {
            title: 'GTC Institut Polaire Français',
            description: 'Développement d\'une Gestion Technique Centralisée provisoire pour le contrôle et la surveillance des équipements techniques de l\'Institut Polaire Français.',
            mainImage: 'assets/img/projects/gtc-system-full.jpg',
            techTags: ['Automatisme', 'Capteurs', 'Instrumentation', 'Supervision', 'PLC', 'SCADA'],
            features: [
                'Surveillance en temps réel des équipements critiques',
                'Gestion des alertes et notifications',
                'Interface de contrôle centralisée',
                'Historisation des données pour analyses',
                'Système de secours en cas de panne'
            ],
            challenges: 'L\'environnement extrême de l\'Antarctique impose des contraintes fortes sur les équipements et les communications. J\'ai dû concevoir un système robuste, capable de fonctionner avec une connectivité limitée et de résister aux conditions climatiques difficiles. La solution devait également être simple à maintenir par une équipe non spécialisée.',
            demoLink: '#',
            githubLink: 'https://github.com/'
        }
    };
    
    // Ouvrir la modale avec les détails du projet
    function openProjectModal(projectId) {
        const projectData = projectsData[projectId];
        
        if (!projectData) return;
        
        // Remplir le contenu de la modale
        modalTitle.textContent = projectData.title;
        modalDescription.textContent = projectData.description;
        modalMainImage.src = projectData.mainImage;
        modalMainImage.alt = projectData.title;
        modalChallengesText.textContent = projectData.challenges;
        
        // Remplir les tags technologiques
        modalTechTags.innerHTML = '';
        projectData.techTags.forEach(tech => {
            const tag = document.createElement('span');
            tag.className = 'tech-tag';
            tag.textContent = tech;
            modalTechTags.appendChild(tag);
        });
        
        // Remplir la liste des fonctionnalités
        modalFeaturesList.innerHTML = '';
        projectData.features.forEach(feature => {
            const item = document.createElement('li');
            item.textContent = feature;
            modalFeaturesList.appendChild(item);
        });
        
        // Mettre à jour les liens
        modalDemoLink.href = projectData.demoLink;
        modalGithubLink.href = projectData.githubLink;
        
        // Afficher la modale
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    // Fermer la modale
    function closeProjectModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // Gérer les clics sur les boutons de détail
    detailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const projectId = this.dataset.project;
            openProjectModal(projectId);
        });
    });
    
    // Fermer la modale au clic sur le bouton ou l'overlay
    if (modalClose) {
        modalClose.addEventListener('click', closeProjectModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeProjectModal);
    }
    
    // Fermer la modale avec la touche Echap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProjectModal();
        }
    });
}
