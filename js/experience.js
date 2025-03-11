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
    
    // Initialiser la chronologie interactive
    initInteractiveChronology();
    
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
    
    // Animation des clusters de compétences
    const skillsClusters = document.querySelectorAll('.skills-cluster');
    if (skillsClusters.length > 0) {
        gsap.from(skillsClusters, {
            opacity: 0,
            y: 50,
            stagger: 0.15,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.skills-clusters',
                start: 'top 80%',
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
 * Initialise la chronologie interactive
 */
function initInteractiveChronology() {
    // Données des événements
    const events = [
        { year: 2020, month: 9, title: 'DUT GEII & Apprentissage ENGIE', type: 'education', description: 'Début de mon DUT GEII à l\'IUT de Brest et de mon apprentissage chez ENGIE Solutions.' },
        { year: 2021, month: 5, title: 'Auto-entrepreneur', type: 'professional', description: 'Lancement de mon activité auto-entrepreneur dans le domaine de l\'électronique et de la récupération de données.' },
        { year: 2022, month: 8, title: 'Diplôme DUT GEII', type: 'education', description: 'Obtention de mon DUT GEII en informatique industrielle.' },
        { year: 2022, month: 9, title: 'Licence ESGI & Alkivi', type: 'education', description: 'Début de ma licence en informatique et réseau / cybersecurity à l\'ESGI et de mon apprentissage chez Alkivi.' },
        { year: 2023, month: 9, title: 'Diplôme Licence', type: 'education', description: 'Obtention de ma licence en informatique et réseau / cybersecurity.' },
        { year: 2024, month: 1, title: 'Formation IA', type: 'education', description: 'Formation intensive en intelligence artificielle chez DataScientest.com.' },
        { year: 2024, month: 9, title: 'ISEN & Crédit Mutuel Arkéa', type: 'professional', description: 'Début de mon diplôme d\'ingénieur à l\'ISEN et de mon poste d\'Assistant Data Engineer chez Crédit Mutuel Arkéa.' }
    ];
    
    // Conteneurs
    const chronologyContainer = document.querySelector('.chronology-container');
    const chronologyEvents = document.querySelector('.chronology-events');
    const chronologyProgress = document.querySelector('.chronology-progress');
    const detailContent = document.querySelector('.detail-content');
    
    if (!chronologyContainer || !chronologyEvents || !chronologyProgress || !detailContent) return;
    
    // La plage de temps totale (en mois)
    const startDate = new Date(2020, 0, 1);
    const endDate = new Date(2025, 11, 31);
    const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth();
    
    // Créer les événements sur la ligne chronologique
    events.forEach(event => {
        // Calculer la position horizontale (en pourcentage)
        const eventDate = new Date(event.year, event.month - 1, 1);
        const monthsFromStart = (eventDate.getFullYear() - startDate.getFullYear()) * 12 + eventDate.getMonth() - startDate.getMonth();
        const position = (monthsFromStart / totalMonths) * 100;
        
        // Créer l'élément d'événement
        const eventElement = document.createElement('div');
        eventElement.className = `chronology-event ${event.type}`;
        eventElement.style.left = `${position}%`;
        eventElement.setAttribute('data-title', event.title);
        eventElement.setAttribute('data-description', event.description);
        eventElement.setAttribute('data-year', event.year);
        eventElement.setAttribute('data-month', event.month);
        eventElement.setAttribute('data-type', event.type);
        
        // Ajouter au conteneur
        chronologyEvents.appendChild(eventElement);
        
        // Ajouter l'événement de clic
        eventElement.addEventListener('click', function() {
            // Mettre à jour la classe active
            document.querySelectorAll('.chronology-event').forEach(e => e.classList.remove('active'));
            this.classList.add('active');
            
            // Mettre à jour la barre de progression
            chronologyProgress.style.width = `${position}%`;
            
            // Mettre à jour le contenu du détail
            updateDetailContent(this);
        });
    });
    
    // Fonction pour mettre à jour le contenu du détail
    function updateDetailContent(eventElement) {
        const title = eventElement.getAttribute('data-title');
        const description = eventElement.getAttribute('data-description');
        const year = eventElement.getAttribute('data-year');
        const month = eventElement.getAttribute('data-month');
        const type = eventElement.getAttribute('data-type');
        
        // Formater la date
        const date = new Date(year, month - 1);
        const formattedDate = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
        
        // Créer le contenu HTML
        const typeIcon = type === 'education' ? 'graduation-cap' : 'briefcase';
        const typeLabel = type === 'education' ? 'Formation' : 'Expérience professionnelle';
        
        const html = `
            <h3>${title}</h3>
            <div class="detail-meta">
                <span class="detail-date"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                <span class="detail-type"><i class="fas fa-${typeIcon}"></i> ${typeLabel}</span>
            </div>
            <p>${description}</p>
        `;
        
        // Mettre à jour le contenu
        detailContent.innerHTML = html;
        detailContent.classList.add('active');
        
        // Animation d'entrée
        detailContent.style.opacity = '0';
        detailContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            detailContent.style.opacity = '1';
            detailContent.style.transform = 'translateY(0)';
            detailContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        }, 50);
    }
    
    // Sélectionner le premier événement par défaut
    setTimeout(() => {
        const firstEvent = document.querySelector('.chronology-event');
        if (firstEvent) {
            firstEvent.click();
        }
    }, 500);
}

/**
 * Initialise les animations au scroll
 */
function initScrollAnimations() {
    // Animer les clusters de compétences
    const skillsClusters = document.querySelectorAll('.skills-cluster');
    
    // Observer l'entrée dans le viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Animer avec un délai progressif
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 150);
                
                // Arrêter d'observer une fois animé
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    // Observer chaque cluster
    skillsClusters.forEach(cluster => {
        observer.observe(cluster);
    });
    
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
    
    // Animation pour les détails de chronologie
    const chronologyDetail = document.querySelector('.chronology-detail');
    if (chronologyDetail) {
        const detailObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                chronologyDetail.style.transform = 'translateY(0)';
                chronologyDetail.style.opacity = '1';
                chronologyDetail.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
                detailObserver.unobserve(chronologyDetail);
            }
        }, { threshold: 0.5 });
        
        // Préparer l'animation
        chronologyDetail.style.transform = 'translateY(30px)';
        chronologyDetail.style.opacity = '0';
        
        detailObserver.observe(chronologyDetail);
    }
}
