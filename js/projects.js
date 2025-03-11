/**
 * Animations spécifiques à la page Projets
 * Gestion des animations 3D, du filtrage et des interactions
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les animations GSAP si disponible
    if (typeof gsap !== 'undefined') {
        initGsapAnimations();
    }
    
    // Initialiser le filtrage des projets
    initProjectFilters();
    
    // Initialiser les effets 3D des cartes
    initProjectCards3DEffect();
    
    // Initialiser les modales de projet
    initProjectModals();
    
    // Initialiser l'animation de recherche
    initSearchAnimation();
    
    // Initialiser l'animation du titre
    initHeaderAnimation();
    
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
    
    // Animation du titre glitch
    const glitchTitle = document.querySelector('.glitch-title');
    if (glitchTitle) {
        gsap.from(glitchTitle, {
            opacity: 0,
            scale: 0.8,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
    }
    
    // Animation de l'effet de frappe
    const typingEffect = document.querySelector('.typing-effect');
    if (typingEffect && typeof gsap !== 'undefined') {
        const text = typingEffect.textContent;
        typingEffect.textContent = '';
        
        // Créer une animation de frappe
        let tl = gsap.timeline({delay: 0.8});
        
        // Ajouter chaque caractère un par un
        for (let i = 0; i < text.length; i++) {
            tl.to(typingEffect, {
                onUpdate: function() {
                    typingEffect.textContent = text.substring(0, i + 1);
                },
                duration: 0.1
            });
        }
    }
    
    // Animation des boutons de filtre
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length) {
        gsap.from(filterButtons, {
            opacity: 0,
            y: -20,
            stagger: 0.1,
            duration: 0.5,
            ease: "power1.out",
            delay: 1
        });
    }
    
    // Animation des cartes de projet
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length) {
        gsap.set(projectCards, {opacity: 0, y: 50});
        
        ScrollTrigger.batch(projectCards, {
            onEnter: batch => gsap.to(batch, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power2.out"
            }),
            start: "top 85%"
        });
    }
    
    // Animation de la section CTA
    const ctaSection = document.querySelector('.projects-cta');
    if (ctaSection) {
        gsap.from(ctaSection.querySelector('.cta-content'), {
            opacity: 0,
            y: 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: ctaSection,
                start: "top 80%"
            }
        });
    }
}

/**
 * Initialise le filtrage des projets
 */
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectSearch = document.getElementById('project-search');
    const projectCounter = document.querySelector('.project-counter .count');
    
    if (filterButtons.length === 0 || projectCards.length === 0) return;
    
    // Stocker le nombre total de projets
    const totalProjects = projectCards.length;
    
    // Mettre à jour le compteur
    function updateCounter(count) {
        if (projectCounter) {
            // Animation du compteur
            const currentValue = parseInt(projectCounter.textContent);
            const targetValue = count;
            
            animateCounter(currentValue, targetValue);
        }
    }
    
    // Animer le compteur de projets
    function animateCounter(from, to) {
        let current = from;
        const duration = 500; // ms
        const stepTime = 20; // ms
        const totalSteps = duration / stepTime;
        const stepSize = (to - from) / totalSteps;
        
        const timer = setInterval(() => {
            current += stepSize;
            
            // S'arrêter à la valeur cible
            if ((stepSize > 0 && current >= to) || (stepSize < 0 && current <= to)) {
                current = to;
                clearInterval(timer);
            }
            
            projectCounter.textContent = Math.round(current);
        }, stepTime);
    }
    
    // Filtrer les projets
    function filterProjects() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        const searchTerm = projectSearch ? projectSearch.value.toLowerCase() : '';
        let visibleCount = 0;
        
        projectCards.forEach(card => {
            // Récupérer les catégories du projet
            const categories = card.dataset.category.split(',');
            const title = card.querySelector('.project-title').textContent.toLowerCase();
            const description = card.querySelector('.project-description').textContent.toLowerCase();
            
            // Vérifier si le projet correspond au filtre
            const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
            
            // Vérifier si le projet correspond à la recherche
            const matchesSearch = searchTerm === '' || 
                                 title.includes(searchTerm) || 
                                 description.includes(searchTerm);
            
            // Afficher ou masquer le projet
            if (matchesFilter && matchesSearch) {
                // Rendre visible avec un délai progressif
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    card.style.display = 'block';
                }, visibleCount * 50);
                
                visibleCount++;
            } else {
                // Masquer avec une animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                // Masquer complètement après l'animation
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        // Mettre à jour le compteur
        updateCounter(visibleCount);
    }
    
    // Gérer les clics sur les boutons de filtre
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Mettre à jour la classe active
            document.querySelector('.filter-btn.active').classList.remove('active');
            this.classList.add('active');
            
            // Filtrer les projets
            filterProjects();
            
            // Effet de pulsation sur le bouton
            this.classList.add('pulse');
            setTimeout(() => {
                this.classList.remove('pulse');
            }, 300);
        });
    });
    
    // Gérer la recherche
    if (projectSearch) {
        let debounceTimer;
        projectSearch.addEventListener('input', function() {
            // Effacer le timer précédent
            clearTimeout(debounceTimer);
            
            // Définir un nouveau timer (debounce)
            debounceTimer = setTimeout(() => {
                filterProjects();
            }, 300);
        });
    }
    
    // Filtrer les projets au chargement initial
    setTimeout(() => {
        filterProjects();
    }, 300);
    
    // Ajouter l'animation de pulsation pour les boutons
    const style = document.createElement('style');
    style.textContent = `
        .filter-btn.pulse {
            animation: btnPulse 0.3s ease-out;
        }
        
        @keyframes btnPulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les effets 3D pour les cartes de projet
 */
function initProjectCards3DEffect() {
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length === 0) return;
    
    projectCards.forEach(card => {
        const cardInner = card.querySelector('.project-card-inner');
        if (!cardInner) return;
        
        // Variables pour l'effet 3D
        let cardWidth = card.offsetWidth;
        let cardHeight = card.offsetHeight;
        let centerX = cardWidth / 2;
        let centerY = cardHeight / 2;
        let maxRotation = 5; // degrés
        
        // Mettre à jour les dimensions lors du redimensionnement
        window.addEventListener('resize', () => {
            cardWidth = card.offsetWidth;
            cardHeight = card.offsetHeight;
            centerX = cardWidth / 2;
            centerY = cardHeight / 2;
        });
        
        // Effet au survol
        card.addEventListener('mousemove', (e) => {
            // Position relative de la souris
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Calcul de la rotation
            const rotateY = ((mouseX - centerX) / centerX) * maxRotation;
            const rotateX = ((centerY - mouseY) / centerY) * maxRotation;
            
            // Effet de profondeur
            const depth = 20;
            const translateZ = depth * Math.abs(rotateX / maxRotation + rotateY / maxRotation) / 2;
            
            // Appliquer la transformation
            cardInner.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateZ(${translateZ}px)
                scale3d(1.02, 1.02, 1.02)
            `;
            
            // Effet de lumière
            const light = card.querySelector('.card-light') || createLightElement(card);
            const lightX = (mouseX / cardWidth) * 100;
            const lightY = (mouseY / cardHeight) * 100;
            light.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)`;
        });
        
        // Réinitialiser au départ de la souris
        card.addEventListener('mouseleave', () => {
            cardInner.style.transform = '';
            const light = card.querySelector('.card-light');
            if (light) light.style.background = 'none';
        });
        
        // Fonction pour créer l'élément de lumière
        function createLightElement(card) {
            const light = document.createElement('div');
            light.className = 'card-light';
            light.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 15px;
                pointer-events: none;
                z-index: 3;
            `;
            card.appendChild(light);
            return light;
        }
    });
}

/**
 * Initialise les modales de détail de projet
 */
function initProjectModals() {
    const viewButtons = document.querySelectorAll('.view-details');
    const modal = document.getElementById('project-modal');
    if (!modal || viewButtons.length === 0) return;
    
    const modalContainer = modal.querySelector('.modal-container');
    const modalClose = modal.querySelector('.modal-close');
    const modalOverlay = modal.querySelector('.modal-overlay');
    
    // Données des projets (à adapter avec les données réelles)
    const projectsData = {
        'ids-neural': {
            title: 'IDS avec détection par réseau neuronal',
            description: 'Système de détection d\'intrusion utilisant des réseaux neuronaux pour identifier les comportements malveillants sur un réseau. Développé dans le cadre de mon projet ESGI, ce système s\'appuie sur le dataset UNB CICIDS2017 pour l\'apprentissage et la détection.',
            images: [
                'assets/img/projects/ids-neural-full.jpg',
                'assets/img/projects/ids-neural-2.jpg',
                'assets/img/projects/ids-neural-3.jpg'
            ],
            technologies: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'Numpy', 'Matplotlib'],
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
        // Ajouter les autres projets ici
    };
    
    // Ouvrir la modale
    function openModal(projectId) {
        const projectData = projectsData[projectId] || {
            title: 'Détails du projet',
            description: 'Information détaillée sur ce projet.',
            images: [],
            technologies: [],
            features: [],
            challenges: 'Information non disponible',
            demoLink: '#',
            githubLink: '#'
        };
        
        // Remplir la modale avec les données du projet
        modal.querySelector('.modal-title').textContent = projectData.title;
        document.getElementById('modal-description-text').textContent = projectData.description;
        document.getElementById('modal-challenges-text').textContent = projectData.challenges;
        
        // Image principale
        const modalMainImage = document.getElementById('modal-main-image');
        modalMainImage.src = projectData.images[0] || 'assets/img/projects/placeholder.jpg';
        
        // Technologies
        const techTags = document.getElementById('modal-tech-tags');
        techTags.innerHTML = '';
        projectData.technologies.forEach(tech => {
            const tag = document.createElement('span');
            tag.className = 'tech-tag';
            tag.textContent = tech;
            techTags.appendChild(tag);
        });
        
        // Fonctionnalités
        const featuresList = document.getElementById('modal-features-list');
        featuresList.innerHTML = '';
        projectData.features.forEach(feature => {
            const item = document.createElement('li');
            item.textContent = feature;
            featuresList.appendChild(item);
        });
        
        // Galerie d'images
        const galleryThumbs = modal.querySelector('.gallery-thumbs');
        if (galleryThumbs) {
            galleryThumbs.innerHTML = '';
            projectData.images.forEach((image, index) => {
                const thumb = document.createElement('div');
                thumb.className = `gallery-thumb ${index === 0 ? 'active' : ''}`;
                
                const thumbImg = document.createElement('img');
                thumbImg.src = image;
                thumbImg.alt = `${projectData.title} - Image ${index + 1}`;
                
                thumb.appendChild(thumbImg);
                galleryThumbs.appendChild(thumb);
                
                // Cliquer sur une miniature change l'image principale
                thumb.addEventListener('click', () => {
                    modalMainImage.src = image;
                    modal.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });
        }
        
        // Liens
        document.getElementById('modal-demo-link').href = projectData.demoLink || '#';
        document.getElementById('modal-github-link').href = projectData.githubLink || '#';
        
        // Afficher la modale avec animation
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Animation d'entrée pour le contenu
        setTimeout(() => {
            modalContainer.classList.add('animate-in');
        }, 100);
    }
    
    // Fermer la modale
    function closeModal() {
        modalContainer.classList.remove('animate-in');
        
        // Attendre la fin de l'animation avant de masquer complètement
        setTimeout(() => {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }, 300);
    }
    
    // Événements d'ouverture
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = button.dataset.project;
            openModal(projectId);
        });
    });
    
    // Événements de fermeture
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Ajouter le style pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        .modal-container {
            transform: scale(0.9);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .modal-container.animate-in {
            transform: scale(1);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise l'animation de la barre de recherche
 */
function initSearchAnimation() {
    const searchInput = document.getElementById('project-search');
    const searchContainer = document.querySelector('.project-search');
    
    if (!searchInput || !searchContainer) return;
    
    // Animation au focus
    searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('active');
    });
    
    searchInput.addEventListener('blur', () => {
        searchContainer.classList.remove('active');
    });
    
    // Effet de suggestion de recherche
    const placeholders = [
        'Rechercher un projet...',
        'Essayez "python"...',
        'Essayez "électronique"...',
        'Essayez "mobile"...'
    ];
    
    let currentPlaceholder = 0;
    
    // Changer le placeholder périodiquement
    setInterval(() => {
        currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
        animatePlaceholder(placeholders[currentPlaceholder]);
    }, 3000);
    
    // Animer le changement de placeholder
    function animatePlaceholder(newPlaceholder) {
        // Animation de sortie
        searchInput.style.transition = 'opacity 0.3s ease';
        searchInput.style.opacity = '0.5';
        
        setTimeout(() => {
            searchInput.placeholder = newPlaceholder;
            searchInput.style.opacity = '1';
        }, 300);
    }
    
    // Ajouter le style pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        .project-search {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .project-search.active {
            transform: scale(1.02);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise l'animation du titre de l'en-tête
 */
function initHeaderAnimation() {
    const header = document.querySelector('.projects-header');
    if (!header) return;
    
    // Animation du titre glitch
    const glitchTitle = header.querySelector('.glitch-title');
    if (glitchTitle) {
        // S'assurer que l'attribut data-text est défini
        glitchTitle.setAttribute('data-text', glitchTitle.textContent);
    }
    
    // Animation de l'en-tête au scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        
        // Effet parallaxe
        if (scrollPosition < header.offsetHeight) {
            header.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
            
            // Effet de flou progressif
            const blur = Math.min(scrollPosition / 100, 5);
            header.style.backdropFilter = `blur(${blur}px)`;
        }
    });
}

/**
 * Initialise les animations au scroll
 */
function initScrollAnimations() {
    // Animation de l'entrée des cartes de projet
    const projectCards = document.querySelectorAll('.project-card');
    
    // Observer l'entrée dans le viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Animer avec un délai progressif
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                
                // Arrêter d'observer une fois animé
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Observer chaque carte
    projectCards.forEach(card => {
        observer.observe(card);
    });
    
    // Animer le compteur de projets
    const projectCounter = document.querySelector('.project-counter .count');
    if (projectCounter) {
        const targetCount = parseInt(projectCounter.textContent);
        projectCounter.textContent = '0';
        
        // Observer le compteur
        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Animer le compteur
                animateCounter(0, targetCount, 1500);
                counterObserver.unobserve(entries[0].target);
            }
        }, { threshold: 1 });
        
        counterObserver.observe(projectCounter.parentElement);
        
        // Fonction pour animer le compteur
        function animateCounter(start, end, duration) {
            const increment = Math.ceil(end / (duration / 16)); // Incrément par frame pour une animation fluide
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    clearInterval(timer);
                    current = end;
                }
                projectCounter.textContent = current;
            }, 16);
        }
    }
}
