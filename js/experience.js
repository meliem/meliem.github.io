/**
 * Animations spécifiques à la page Expérience
 * Gestion de la timeline, des onglets, et des effets visuels
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les animations GSAP si disponible
    if (typeof gsap !== 'undefined') {
        initGsapAnimations();
    }
    
    // Initialiser l'effet parallaxe du header
    initParallaxHeader();
    
    // Initialiser les onglets
    initTabs();
    
    // Initialiser les animations des timelines
    initTimelineAnimations();
    
    // Initialiser les animations au scroll
    initScrollAnimations();
});

/**
 * Initialise les animations GSAP avancées
 */
function initGsapAnimations() {
    // Enregistrer les plugins
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // Animation de la timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        gsap.from(timelineItems, {
            opacity: 0,
            x: -50,
            stagger: 0.2,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.vertical-timeline',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });
    }
    
    // Animation de la section CTA
    const ctaSection = document.querySelector('.experience-cta');
    if (ctaSection) {
        gsap.from(ctaSection.querySelector('.cta-content'), {
            opacity: 0,
            y: 50,
            duration: 0.8,
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
    
    // Créer les particules pour le layer de particules
    const particlesLayer = document.querySelector('.layer-particles');
    if (particlesLayer) {
        createParticles(particlesLayer);
    }
    
    // Effet parallaxe au mouvement de souris
    document.querySelector('.experience-header').addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        headerLayers.forEach(layer => {
            const depth = layer.getAttribute('data-depth');
            const translateX = (mouseX - 0.5) * depth * 100;
            const translateY = (mouseY - 0.5) * depth * 100;
            
            layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
        });
    });
    
    // Fonction pour créer des particules
    function createParticles(container) {
        // Nombre de particules à créer
        const particleCount = Math.min(window.innerWidth / 10, 100);
        
        // Ajouter des particules dynamiquement
        for (let i = 0; i < particleCount; i++) {
            createParticle(container);
        }
    }
    
    // Fonction pour créer une particule
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'header-particle';
        
        // Attributs aléatoires
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const opacity = Math.random() * 0.5 + 0.1;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        
        // Appliquer le style
        particle.style.cssText = `
            position: absolute;
            top: ${posY}%;
            left: ${posX}%;
            width: ${size}px;
            height: ${size}px;
            background-color: rgba(255, 255, 255, ${opacity});
            border-radius: 50%;
            animation: float ${duration}s linear infinite;
            animation-delay: -${delay}s;
        `;
        
        container.appendChild(particle);
    }
    
    // Ajouter l'animation CSS pour les particules
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0);
            }
            25% {
                transform: translateY(-20px) translateX(10px);
            }
            50% {
                transform: translateY(0) translateX(20px);
            }
            75% {
                transform: translateY(20px) translateX(10px);
            }
            100% {
                transform: translateY(0) translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les onglets de navigation
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabSections = document.querySelectorAll('.timeline-section');
    const tabIndicator = document.querySelector('.tab-indicator');
    
    if (tabButtons.length === 0 || tabSections.length === 0 || !tabIndicator) return;
    
    // Fonction pour mettre à jour l'indicateur
    function updateIndicator(activeTab) {
        // Obtenir les dimensions et la position du bouton actif
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = activeTab.parentNode.getBoundingClientRect();
        
        // Calculer la position relative
        const leftPosition = tabRect.left - containerRect.left;
        
        // Mettre à jour l'indicateur
        tabIndicator.style.width = tabRect.width + 'px';
        tabIndicator.style.transform = `translateX(${leftPosition}px)`;
    }
    
    // Initialiser la position de l'indicateur
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        updateIndicator(activeTab);
    }
    
    // Gérer les clics sur les onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Mettre à jour les classes actives
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mettre à jour l'indicateur
            updateIndicator(this);
            
            // Afficher la section correspondante
            const targetTab = this.getAttribute('data-tab');
            tabSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetTab + '-timeline') {
                    section.classList.add('active');
                }
            });
            
            // Animation d'entrée pour la nouvelle section
            animateNewSection(targetTab + '-timeline');
        });
    });
    
    // Gérer le redimensionnement
    window.addEventListener('resize', () => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            updateIndicator(activeTab);
        }
    });
    
    // Fonction pour animer l'entrée de la nouvelle section
    function animateNewSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Animer les éléments de la timeline
        const timelineItems = section.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            // Réinitialiser pour l'animation
            item.style.opacity = '0';
            item.style.transform = 'translateX(-50px)';
            
            // Animer avec un délai progressif
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100 * index);
        });
    }
}

/**
 * Initialise les animations pour les timelines
 */
function initTimelineAnimations() {
    // Animer les éléments de la timeline au scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Observer l'entrée dans le viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    // Observer chaque élément
    timelineItems.forEach(item => {
        observer.observe(item);
    });
    
    // Ajouter des animations aux éléments de la carte
    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach(card => {
        // Animation au survol
        card.addEventListener('mouseenter', function() {
            const techTags = this.querySelectorAll('.tech-stack span');
            
            // Animer les tags tech
            techTags.forEach((tag, index) => {
                tag.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
                tag.style.transitionDelay = `${index * 0.05}s`;
                tag.style.transform = 'translateY(-3px)';
                tag.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            });
        });
        
        // Réinitialiser au départ
        card.addEventListener('mouseleave', function() {
            const techTags = this.querySelectorAll('.tech-stack span');
            
            // Réinitialiser les tags
            techTags.forEach(tag => {
                tag.style.transform = 'translateY(0)';
                tag.style.backgroundColor = '';
            });
        });
    });
}

/**
 * Initialise les animations au scroll
 */
function initScrollAnimations() {
    // Animation au scroll pour les sections
    window.addEventListener('scroll', () => {
        // Effet parallaxe pour l'en-tête
        const header = document.querySelector('.experience-header');
        if (header) {
            const scrollPosition = window.pageYOffset;
            const headerHeight = header.offsetHeight;
            
            if (scrollPosition < headerHeight) {
                // Effet de parallaxe
                const parallaxValue = scrollPosition * 0.5;
                const layers = header.querySelectorAll('.header-layer');
                
                layers.forEach(layer => {
                    const depth = layer.getAttribute('data-depth');
                    const yOffset = parallaxValue * depth;
                    layer.style.transform = `translateY(${yOffset}px)`;
                });
            }
        }
    });
}
