/**
 * Animations spécifiques à la page Expérience
 * Gestion de la timeline, des onglets, et des effets visuels
 * Version améliorée avec corrections de bugs et optimisations
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les animations GSAP si disponible
    if (typeof gsap !== 'undefined') {
        initGsapAnimations();
    }
    
    // Initialiser l'effet parallaxe du header
    initParallaxHeader();
    
    // Initialiser les onglets - CORRECTION APPLIQUÉE ICI
    initTabs();
    
    // Initialiser les animations des timelines
    initTimelineAnimations();
    
    // Initialiser les animations au scroll
    initScrollAnimations();
    
    // Nouvelles fonctionnalités
    initTimelineInteractivity();
    
    // Pré-calculer les positions pour les animations (optimisation)
    calculateAnimationPositions();
});

/**
 * Pré-calcule les positions pour améliorer les performances des animations
 */
function calculateAnimationPositions() {
    // Optimisation pour éviter les calculs répétés pendant l'animation
    window.addEventListener('load', () => {
        // Stocker les positions des éléments
        const positions = {};
        
        // Sélectionner tous les éléments animés
        document.querySelectorAll('.timeline-item, .card-header, .cta-content').forEach(el => {
            const rect = el.getBoundingClientRect();
            positions[el.id || Math.random().toString(36).substr(2, 9)] = {
                top: rect.top + window.pageYOffset,
                left: rect.left,
                width: rect.width,
                height: rect.height
            };
        });
        
        // Stocker pour utilisation ultérieure
        window._animPositions = positions;
    });
}

/**
 * Initialise les animations GSAP avancées
 */
function initGsapAnimations() {
    // Enregistrer les plugins
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // Animation de la timeline avec effet staggered amélioré
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        // Créer une timeline GSAP
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.vertical-timeline',
                start: 'top 70%',
                toggleActions: 'play none none reset'
            }
        });
        
        // Animation des points de la timeline
        tl.from('.timeline-dot', {
            scale: 0,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: "back.out(1.7)"
        }, 0);
        
        // Animation des dates
        tl.from('.timeline-date', {
            opacity: 0,
            x: -30,
            stagger: 0.1,
            duration: 0.5,
            ease: "power2.out"
        }, 0.2);
        
        // Animation des cartes de contenu avec effet 3D
        tl.from('.content-card', {
            opacity: 0,
            x: 50,
            rotationY: -5,
            transformOrigin: "left center",
            stagger: 0.2,
            duration: 0.8,
            ease: "power3.out"
        }, 0.3);
    }
    
    // Animation améliorée de la section CTA avec parallaxe
    const ctaSection = document.querySelector('.experience-cta');
    if (ctaSection) {
        // Animation du fond
        gsap.fromTo(ctaSection, 
            { backgroundPosition: "50% 0%" },
            { 
                backgroundPosition: "50% 100%", 
                ease: "none",
                scrollTrigger: {
                    trigger: ctaSection,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
        
        // Animation du contenu
        gsap.from(ctaSection.querySelector('.cta-content'), {
            opacity: 0,
            y: 80,
            scale: 0.9,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ctaSection,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
        
        // Animation des boutons
        gsap.from(ctaSection.querySelectorAll('.btn'), {
            opacity: 0,
            y: 20,
            stagger: 0.2,
            duration: 0.7,
            delay: 0.5,
            ease: "back.out(1.4)",
            scrollTrigger: {
                trigger: ctaSection,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    }
}

/**
 * Initialise l'effet parallaxe pour l'en-tête
 */
function initParallaxHeader() {
    const headerLayers = document.querySelectorAll('.header-layer');
    if (headerLayers.length === 0) return;
    
    // Optimisation: utiliser requestAnimationFrame pour les animations
    let ticking = false;
    let lastScrollY = window.scrollY;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Créer les particules pour le layer de particules
    const particlesLayer = document.querySelector('.layer-particles');
    if (particlesLayer) {
        createParticles(particlesLayer);
    }
    
    // Effet parallaxe amélioré au mouvement de souris
    document.querySelector('.experience-header').addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        if (!ticking) {
            requestAnimationFrame(() => {
                const mouseX = lastMouseX / window.innerWidth;
                const mouseY = lastMouseY / window.innerHeight;
                
                headerLayers.forEach(layer => {
                    const depth = layer.getAttribute('data-depth');
                    const translateX = (mouseX - 0.5) * depth * 100;
                    const translateY = (mouseY - 0.5) * depth * 100;
                    
                    // Ajout d'une légère rotation pour plus de dynamisme
                    const rotateX = (mouseY - 0.5) * depth * -5;
                    const rotateY = (mouseX - 0.5) * depth * 5;
                    
                    layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                });
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Ajouter un effet de transition lisse
    headerLayers.forEach(layer => {
        layer.style.transition = "transform 0.1s cubic-bezier(0.22, 1, 0.36, 1)";
    });
    
    // Gestion optimisée du scroll
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const headerHeight = document.querySelector('.experience-header').offsetHeight;
                
                if (scrollY < headerHeight * 1.5) {
                    const scrollMultiplier = Math.min(scrollY / headerHeight, 1);
                    
                    headerLayers.forEach(layer => {
                        const depth = layer.getAttribute('data-depth');
                        const yOffset = scrollY * depth * 0.5;
                        
                        // Ajouter un effet de fondu
                        const opacity = 1 - (scrollMultiplier * depth * 1.5);
                        layer.style.opacity = Math.max(0, opacity);
                        
                        // Combiner avec la position actuelle
                        const currentTransform = layer.style.transform || '';
                        if (currentTransform.includes('translate3d')) {
                            // Extraire les valeurs X et Y actuelles
                            const matches = currentTransform.match(/translate3d\(([^,]+),\s*([^,]+)/);
                            if (matches && matches.length >= 3) {
                                const currentX = matches[1];
                                layer.style.transform = `translate3d(${currentX}, calc(${matches[2]} + ${yOffset}px), 0) rotateX(${-scrollMultiplier * depth * 10}deg)`;
                            }
                        } else {
                            layer.style.transform = `translateY(${yOffset}px)`;
                        }
                    });
                    
                    // Effet parallaxe sur le contenu du header
                    const headerContent = document.querySelector('.header-content');
                    if (headerContent) {
                        headerContent.style.transform = `translateY(${scrollY * 0.4}px)`;
                        headerContent.style.opacity = 1 - (scrollMultiplier * 0.8);
                    }
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Fonction améliorée pour créer des particules
    function createParticles(container) {
        // Nombre adaptatif de particules selon la taille de l'écran
        const particleCount = Math.min(Math.max(window.innerWidth / 10, 50), 150);
        
        // Ajouter des particules dynamiquement
        for (let i = 0; i < particleCount; i++) {
            createParticle(container, i);
        }
    }
    
    // Fonction pour créer une particule avec plus de variété
    function createParticle(container, index) {
        const particle = document.createElement('div');
        particle.className = 'header-particle';
        
        // Plus de variété d'attributs aléatoires
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const opacity = Math.random() * 0.6 + 0.1;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        
        // Variation de couleur pour plus d'effet
        const hue = Math.random() * 20 + 200; // Nuances de bleu
        const saturation = Math.random() * 40 + 60;
        const lightness = Math.random() * 30 + 70;
        
        // Plus d'effet brillant pour certaines particules
        const isGlowing = Math.random() > 0.8;
        const glowSize = isGlowing ? Math.random() * 5 + 5 : 0;
        const glowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`;
        
        // Appliquer le style
        particle.style.cssText = `
            position: absolute;
            top: ${posY}%;
            left: ${posX}%;
            width: ${size}px;
            height: ${size}px;
            background-color: hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity});
            border-radius: 50%;
            animation: floatParticle${index % 5} ${duration}s linear infinite;
            animation-delay: -${delay}s;
            ${isGlowing ? `box-shadow: 0 0 ${glowSize}px ${glowSize/2}px ${glowColor};` : ''}
            z-index: ${isGlowing ? 3 : 1};
        `;
        
        container.appendChild(particle);
    }
    
    // Ajouter 5 animations différentes pour plus de variété
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle0 {
            0% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(0) translateX(20px); }
            75% { transform: translateY(20px) translateX(10px); }
            100% { transform: translateY(0) translateX(0); }
        }
        
        @keyframes floatParticle1 {
            0% { transform: translateY(0) translateX(0) scale(1); }
            33% { transform: translateY(-30px) translateX(-20px) scale(1.2); }
            66% { transform: translateY(10px) translateX(15px) scale(0.8); }
            100% { transform: translateY(0) translateX(0) scale(1); }
        }
        
        @keyframes floatParticle2 {
            0% { transform: translateY(0) rotate(0); }
            25% { transform: translateY(-15px) translateX(5px) rotate(90deg); }
            50% { transform: translateY(0) translateX(15px) rotate(180deg); }
            75% { transform: translateY(15px) translateX(5px) rotate(270deg); }
            100% { transform: translateY(0) rotate(360deg); }
        }
        
        @keyframes floatParticle3 {
            0% { transform: scale(1) translateX(0); opacity: ${Math.random() * 0.5 + 0.5}; }
            50% { transform: scale(1.5) translateX(20px); opacity: ${Math.random() * 0.3 + 0.2}; }
            100% { transform: scale(1) translateX(0); opacity: ${Math.random() * 0.5 + 0.5}; }
        }
        
        @keyframes floatParticle4 {
            0% { transform: translateY(0) translateX(0); filter: blur(0px); }
            25% { transform: translateY(20px) translateX(-15px); filter: blur(1px); }
            75% { transform: translateY(-15px) translateX(10px); filter: blur(2px); }
            100% { transform: translateY(0) translateX(0); filter: blur(0px); }
        }
        
        /* Animation pour les layers */
        .header-layer {
            transition: transform 0.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
            will-change: transform, opacity;
        }
        
        /* Amélioration de l'animation du titre */
        .animate-text {
            position: relative;
            overflow: hidden;
        }
        
        .animate-text::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 0%;
            height: 100%;
            background-color: var(--primary-color);
            animation: textReveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }
        
        @keyframes textReveal {
            0% { width: 0%; left: 0; }
            50% { width: 100%; left: 0; }
            100% { width: 0%; left: 100%; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les onglets de navigation - CORRECTION DÉFINITIVE
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const professionalTimeline = document.getElementById('professional-timeline');
    const educationTimeline = document.getElementById('education-timeline');
    const tabIndicator = document.querySelector('.tab-indicator');
    
    if (tabButtons.length === 0 || !professionalTimeline || !educationTimeline) return;
    
    // CORRECTION IMPORTANTE: Supprimer les transitions temporairement
    // pour éviter les problèmes de fondu au chargement initial
    const style = document.createElement('style');
    style.textContent = `
        .timeline-section {
            transition: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Fonction pour activer un onglet et sa section
    function activateTab(tab) {
        // 1. Mettre à jour les boutons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tab.classList.add('active');
        
        // 2. Mettre à jour l'indicateur
        if (tabIndicator) {
            const tabRect = tab.getBoundingClientRect();
            const containerRect = tab.parentNode.getBoundingClientRect();
            const leftPosition = tabRect.left - containerRect.left;
            
            tabIndicator.style.width = tabRect.width + 'px';
            tabIndicator.style.left = leftPosition + 'px';
        }
        
        // 3. Afficher la section correspondante
        const targetTab = tab.getAttribute('data-tab');
        
        // Masquer toutes les sections d'abord
        professionalTimeline.style.display = 'none';
        professionalTimeline.classList.remove('active');
        educationTimeline.style.display = 'none';
        educationTimeline.classList.remove('active');
        
        // Afficher uniquement la section active
        if (targetTab === 'professional') {
            professionalTimeline.style.display = 'block';
            professionalTimeline.classList.add('active');
            // Force l'opacité à 1 pour éviter les problèmes de fondu
            professionalTimeline.style.opacity = '1';
        } else if (targetTab === 'education') {
            educationTimeline.style.display = 'block';
            educationTimeline.classList.add('active');
            // Force l'opacité à 1 pour éviter les problèmes de fondu
            educationTimeline.style.opacity = '1';
        }
    }
    
    // INITIALISATION AU CHARGEMENT
    // Vérifier s'il y a un onglet actif
    const activeTab = document.querySelector('.tab-btn.active');
    
    if (activeTab) {
        // Utiliser l'onglet déjà actif dans le HTML
        activateTab(activeTab);
    } else if (tabButtons.length > 0) {
        // Sinon, activer le premier onglet par défaut (expérience professionnelle)
        activateTab(tabButtons[0]);
    }
    
    // Une fois l'affichage initial terminé, restaurer les transitions
    // pour les changements d'onglets futurs
    setTimeout(() => {
        style.textContent = `
            .timeline-section {
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .timeline-section:not(.active) {
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
            }
            
            .timeline-section.active {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        
        // Animer les éléments de la timeline active
        const activeSection = document.querySelector('.timeline-section.active');
        if (activeSection) {
            animateTimelineItems(activeSection);
        }
    }, 200);
    
    // Gérer les clics sur les onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Activer l'onglet cliqué
            activateTab(this);
            
            // Animer les éléments de la timeline
            const targetTab = this.getAttribute('data-tab');
            const targetSection = document.getElementById(targetTab + '-timeline');
            if (targetSection) {
                animateTimelineItems(targetSection);
            }
        });
    });
    
    // Animation des éléments de la timeline
    function animateTimelineItems(section) {
        const timelineItems = section.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            // Réinitialiser le style pour l'animation
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            
            // Animer avec délai
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100 + (index * 80));
        });
    }
}

/**
 * Initialise les animations pour les timelines
 */
function initTimelineAnimations() {
    // Animer les éléments de la timeline au scroll avec plus de fluidité
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Observer plus efficace avec threshold adaptatif
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animation séquentielle des éléments internes
                const item = entry.target;
                
                // Animation du point
                const dot = item.querySelector('.timeline-dot');
                if (dot) {
                    dot.style.transform = 'scale(0)';
                    dot.style.opacity = '0';
                    requestAnimationFrame(() => {
                        dot.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease';
                        dot.style.transform = 'scale(1)';
                        dot.style.opacity = '1';
                    });
                }
                
                // Animation de la date avec délai
                const date = item.querySelector('.timeline-date');
                if (date) {
                    date.style.transform = 'translateX(-20px)';
                    date.style.opacity = '0';
                    setTimeout(() => {
                        date.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease';
                        date.style.transform = 'translateX(0)';
                        date.style.opacity = '1';
                    }, 200);
                }
                
                // Animation de la carte avec délai supplémentaire
                const card = item.querySelector('.content-card');
                if (card) {
                    card.style.transform = 'translateX(30px) scale(0.95)';
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease, box-shadow 0.3s ease';
                        card.style.transform = 'translateX(0) scale(1)';
                        card.style.opacity = '1';
                    }, 300);
                }
                
                // Marquer comme animé
                item.classList.add('animate-in');
                
                // Arrêter d'observer une fois animé
                observer.unobserve(item);
            }
        });
    }, { 
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });
    
    // Observer chaque élément
    timelineItems.forEach(item => {
        observer.observe(item);
    });
    
    // Ajouter des animations aux éléments de la carte avec transitions plus fluides
    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach(card => {
        // Animation au survol améliorée avec effet 3D
        card.addEventListener('mouseenter', function() {
            // Effet 3D léger
            this.style.transform = 'translateY(-5px) rotateX(2deg)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
            
            const techTags = this.querySelectorAll('.tech-stack span');
            
            // Animer les tags tech avec plus d'effet
            techTags.forEach((tag, index) => {
                tag.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease, color 0.3s ease';
                tag.style.transitionDelay = `${index * 0.05}s`;
                tag.style.transform = 'translateY(-5px) scale(1.05)';
                tag.style.backgroundColor = 'var(--primary-light)';
                tag.style.color = 'var(--dark-color)';
            });
            
            // Mettre en évidence le titre
            const title = this.querySelector('h3');
            if (title) {
                title.style.transition = 'color 0.3s ease';
                title.style.color = 'var(--primary-color)';
            }
        });
        
        // Réinitialiser au départ avec transition douce
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0)';
            this.style.boxShadow = '';
            
            const techTags = this.querySelectorAll('.tech-stack span');
            
            // Réinitialiser les tags avec délai inverse
            techTags.forEach((tag, index) => {
                const reverseIndex = techTags.length - index - 1;
                tag.style.transitionDelay = `${reverseIndex * 0.03}s`;
                tag.style.transform = 'translateY(0) scale(1)';
                tag.style.backgroundColor = '';
                tag.style.color = '';
            });
            
            // Réinitialiser le titre
            const title = this.querySelector('h3');
            if (title) {
                title.style.color = '';
            }
        });
    });
}

/**
 * Initialise les animations au scroll
 */
function initScrollAnimations() {
    // Animation au scroll pour les sections avec optimisation des performances
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            requestAnimationFrame(() => {
                // Effet parallaxe pour l'en-tête
                const header = document.querySelector('.experience-header');
                if (header) {
                    const headerHeight = header.offsetHeight;
                    
                    if (lastScrollY < headerHeight) {
                        // Effet de parallaxe avec optimisation
                        const layers = header.querySelectorAll('.header-layer');
                        
                        layers.forEach(layer => {
                            const depth = parseFloat(layer.getAttribute('data-depth') || 0);
                            layer.style.transform = `translateY(${lastScrollY * depth * 0.5}px)`;
                        });
                        
                        // Effet sur le titre de la page
                        const title = header.querySelector('h1');
                        if (title) {
                            title.style.transform = `translateY(${lastScrollY * 0.2}px)`;
                            title.style.opacity = 1 - (lastScrollY / headerHeight * 0.8);
                        }
                    }
                }
                
                // Animation des onglets lors du défilement
                const tabsContainer = document.querySelector('.experience-tabs');
                if (tabsContainer) {
                    const tabsOffset = tabsContainer.offsetTop;
                    
                    // Effet de sticky sur les onglets avec classe CSS
                    if (lastScrollY > tabsOffset - 60) {
                        tabsContainer.classList.add('sticky');
                    } else {
                        tabsContainer.classList.remove('sticky');
                    }
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Ajouter les styles pour l'effet sticky
    const style = document.createElement('style');
    style.textContent = `
        .experience-tabs {
            transition: box-shadow 0.3s ease, transform 0.3s ease;
            z-index: 100;
        }
        
        .experience-tabs.sticky {
            position: sticky;
            top: 0;
            background-color: var(--background-color, white);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideDown 0.3s forwards;
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(-100%);
            }
            to {
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * NOUVELLE FONCTION: Ajoute des interactions avancées pour la timeline
 */
function initTimelineInteractivity() {
    // Interactions avancées pour les éléments de la timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        const dot = item.querySelector('.timeline-dot');
        const card = item.querySelector('.content-card');
        
        if (dot && card) {
            // Animation au survol du point
            dot.addEventListener('mouseenter', () => {
                // Effet de pulsation
                dot.style.animation = 'pulse 1s infinite';
                
                // Mettre en évidence la carte associée
                card.classList.add('highlight');
            });
            
            dot.addEventListener('mouseleave', () => {
                dot.style.animation = '';
                card.classList.remove('highlight');
            });
            
            // Interaction au clic pour les écrans tactiles
            dot.addEventListener('click', () => {
                // Toggle de la classe "expanded" pour élargir la carte
                card.classList.toggle('expanded');
                
                // Faire défiler jusqu'à la carte si nécessaire
                if (card.classList.contains('expanded')) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
        
        // Ajouter des effets "tilting" pour les cartes
        if (card) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculer la rotation selon la position du curseur (effet léger)
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = (x - centerX) / 20;
                const rotateX = (centerY - y) / 20;
                
                // Appliquer une légère rotation
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(5px)`;
                
                // Ajout d'un effet de brillance
                const glare = document.createElement('div');
                glare.className = 'card-glare';
                
                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;
                
                card.style.background = `
                    linear-gradient(to bottom, var(--card-bg, white), var(--card-bg, white)),
                    radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)
                `;
                card.style.backgroundBlendMode = 'soft-light';
            });
            
            // Réinitialiser l'effet au départ
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.background = '';
                card.style.backgroundBlendMode = '';
            });
        }
    });
    
    // Ajouter des styles pour les nouvelles interactions
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
            70% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        .content-card {
            transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), 
                        box-shadow 0.4s ease,
                        background 0.3s ease;
            transform-style: preserve-3d;
            will-change: transform, box-shadow;
        }
        
        .content-card.highlight {
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
            border-left: 3px solid var(--primary-color);
        }
        
        .content-card.expanded {
            transform: scale(1.02);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
            z-index: 10;
        }
        
        .timeline-dot {
            cursor: pointer;
            transition: transform 0.3s ease, background-color 0.3s ease;
        }
        
        .timeline-dot:hover {
            transform: scale(1.3);
            background-color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
}
