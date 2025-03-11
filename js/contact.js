/**
 * Animations et interactions pour la page Contact
 * Carte interactive, formulaire et animations avancées
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser la carte interactive
    initInteractiveMap();
    
    // Initialiser les animations d'entrée
    initEntryAnimations();
    
    // Initialiser le formulaire de contact
    initContactForm();
    
    // Initialiser les FAQ
    initFaqAccordion();
    
    // Initialiser les animations au scroll
    initScrollAnimations();
    
    // Initialiser les animations GSAP si disponible
    if (typeof gsap !== 'undefined') {
        initGsapAnimations();
    }
});

/**
 * Initialise la carte interactive dans l'en-tête
 * Utilise une visualisation personnalisée si leaflet n'est pas disponible
 */
function initInteractiveMap() {
    const mapContainer = document.getElementById('contact-map');
    if (!mapContainer) return;
    
    // Vérifier si leaflet est disponible
    if (typeof L !== 'undefined') {
        // Coordonnées de Brest
        const brestCoordinates = [48.390394, -4.486076];
        
        // Initialiser la carte
        const map = L.map(mapContainer, {
            center: brestCoordinates,
            zoom: 13,
            scrollWheelZoom: false,
            dragging: false,
            zoomControl: false,
            attributionControl: false
        });
        
        // Ajouter un fond de carte stylisé
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
        }).addTo(map);
        
        // Ajouter un marqueur avec effet pulse
        const pulseIcon = L.divIcon({
            className: 'pulse-icon',
            html: '<div class="pulse-marker"><div class="pulse-core"></div><div class="pulse-outer"></div></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Ajouter un marqueur
        const marker = L.marker(brestCoordinates, { icon: pulseIcon }).addTo(map);
        
        // Ajouter les styles pour l'effet pulse
        const style = document.createElement('style');
        style.textContent = `
            .pulse-marker {
                position: relative;
                width: 30px;
                height: 30px;
            }
            
            .pulse-core {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                background-color: var(--primary-color);
                border-radius: 50%;
                z-index: 2;
            }
            
            .pulse-outer {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 30px;
                height: 30px;
                background-color: rgba(59, 130, 246, 0.4);
                border-radius: 50%;
                z-index: 1;
                animation: pulse-animation 2s infinite;
            }
            
            @keyframes pulse-animation {
                0% {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Effet d'animation au survol de la carte
        mapContainer.addEventListener('mousemove', function(e) {
            // Effet parallaxe subtil
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const offsetX = (x - centerX) / 50;
            const offsetY = (y - centerY) / 50;
            
            // Déplacer légèrement la carte
            map.panBy([offsetX, offsetY], { animate: false });
        });
    } else {
        // Alternative: créer une visualisation personnalisée
        createCustomMapVisualization(mapContainer);
    }
}

/**
 * Crée une visualisation de carte personnalisée si leaflet n'est pas disponible
 * @param {HTMLElement} container - Conteneur pour la visualisation
 */
function createCustomMapVisualization(container) {
    // Définir un fond stylisé
    container.style.backgroundImage = "url('assets/img/map-bg.jpg')";
    container.style.backgroundSize = "cover";
    container.style.backgroundPosition = "center";
    
    // Ajouter un effet de grille
    const gridOverlay = document.createElement('div');
    gridOverlay.className = 'map-grid-overlay';
    gridOverlay.style.position = 'absolute';
    gridOverlay.style.top = '0';
    gridOverlay.style.left = '0';
    gridOverlay.style.width = '100%';
    gridOverlay.style.height = '100%';
    gridOverlay.style.backgroundImage = `
        linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
    `;
    gridOverlay.style.backgroundSize = '20px 20px';
    gridOverlay.style.zIndex = '1';
    container.appendChild(gridOverlay);
    
    // Ajouter un marqueur de localisation
    const locationMarker = document.createElement('div');
    locationMarker.className = 'location-marker';
    locationMarker.style.position = 'absolute';
    locationMarker.style.top = '50%';
    locationMarker.style.left = '50%';
    locationMarker.style.transform = 'translate(-50%, -50%)';
    locationMarker.style.zIndex = '2';
    
    // Créer l'indicateur de pulsation
    const pulseIndicator = document.createElement('div');
    pulseIndicator.className = 'pulse-indicator';
    pulseIndicator.style.position = 'relative';
    pulseIndicator.style.width = '30px';
    pulseIndicator.style.height = '30px';
    
    // Core du marqueur
    const markerCore = document.createElement('div');
    markerCore.className = 'marker-core';
    markerCore.style.position = 'absolute';
    markerCore.style.top = '50%';
    markerCore.style.left = '50%';
    markerCore.style.transform = 'translate(-50%, -50%)';
    markerCore.style.width = '12px';
    markerCore.style.height = '12px';
    markerCore.style.backgroundColor = 'var(--primary-color)';
    markerCore.style.borderRadius = '50%';
    markerCore.style.zIndex = '3';
    
    // Effet de pulsation
    const pulseMask = document.createElement('div');
    pulseMask.className = 'pulse-mask';
    pulseMask.style.position = 'absolute';
    pulseMask.style.top = '50%';
    pulseMask.style.left = '50%';
    pulseMask.style.transform = 'translate(-50%, -50%)';
    pulseMask.style.width = '30px';
    pulseMask.style.height = '30px';
    pulseMask.style.backgroundColor = 'rgba(59, 130, 246, 0.4)';
    pulseMask.style.borderRadius = '50%';
    pulseMask.style.zIndex = '2';
    pulseMask.style.animation = 'pulse-animation 2s infinite';
    
    // Définir l'animation de pulsation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-animation {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Assembler les éléments
    pulseIndicator.appendChild(markerCore);
    pulseIndicator.appendChild(pulseMask);
    locationMarker.appendChild(pulseIndicator);
    container.appendChild(locationMarker);
    
    // Ajouter un label
    const locationLabel = document.createElement('div');
    locationLabel.className = 'location-label';
    locationLabel.style.position = 'absolute';
    locationLabel.style.top = 'calc(50% + 25px)';
    locationLabel.style.left = '50%';
    locationLabel.style.transform = 'translateX(-50%)';
    locationLabel.style.backgroundColor = 'rgba(17, 24, 39, 0.8)';
    locationLabel.style.color = 'white';
    locationLabel.style.padding = '5px 10px';
    locationLabel.style.borderRadius = '4px';
    locationLabel.style.fontSize = '0.85rem';
    locationLabel.style.fontWeight = '600';
    locationLabel.style.zIndex = '3';
    locationLabel.textContent = 'Brest, France';
    container.appendChild(locationLabel);
    
    // Effet parallaxe au mouvement de la souris
    container.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 20;
        const moveY = (y - centerY) / 20;
        
        this.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
        gridOverlay.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
    });
}

/**
 * Initialise les animations d'entrée pour les éléments principaux
 */
function initEntryAnimations() {
    // Animer l'entrée du bloc d'informations et du formulaire
    const contactInfo = document.querySelector('.contact-info');
    const contactForm = document.querySelector('.contact-form-container');
    
    if (contactInfo) {
        setTimeout(() => {
            contactInfo.classList.add('animate-in');
        }, 300);
    }
    
    if (contactForm) {
        setTimeout(() => {
            contactForm.classList.add('animate-in');
        }, 500);
    }
}

/**
 * Initialise le formulaire de contact avec validation et soumission
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
    if (!contactForm || !successMessage) return;
    
    // Animation des champs de formulaire au focus
    const formInputs = contactForm.querySelectorAll('input, textarea');
    
    formInputs.forEach(input => {
        // Animation au focus
        input.addEventListener('focus', function() {
            const container = this.closest('.input-container');
            if (container) {
                container.classList.add('focused');
            }
        });
        
        // Animation à la perte du focus
        input.addEventListener('blur', function() {
            const container = this.closest('.input-container');
            if (container) {
                container.classList.remove('focused');
                
                // Ajouter une classe si la valeur n'est pas vide
                if (this.value.trim() !== '') {
                    container.classList.add('has-value');
                } else {
                    container.classList.remove('has-value');
                }
            }
        });
        
        // Vérifier l'état initial
        if (input.value.trim() !== '') {
            const container = input.closest('.input-container');
            if (container) {
                container.classList.add('has-value');
            }
        }
    });
    
    // Ajouter les styles pour les animations
    const style = document.createElement('style');
    style.textContent = `
        .input-container.focused .input-icon {
            color: var(--primary-color);
        }
        
        .input-container.has-value .input-icon {
            color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
    
    // Validation et soumission du formulaire
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validation basique
        if (!validateForm(this)) return;
        
        // Simuler l'envoi
        simulateFormSubmission(this);
    });
    
    // Fermer le message de succès
    const closeSuccessBtn = successMessage.querySelector('.close-success');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', function() {
            successMessage.classList.remove('active');
        });
    }
    
    // Fonction de validation du formulaire
    function validateForm(form) {
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const subject = form.querySelector('#subject').value.trim();
        const message = form.querySelector('#message').value.trim();
        const consent = form.querySelector('input[name="consent"]').checked;
        
        // Vérifications basiques
        if (name === '') {
            showError('name', 'Veuillez entrer votre nom');
            return false;
        }
        
        if (email === '') {
            showError('email', 'Veuillez entrer votre email');
            return false;
        }
        
        if (!isValidEmail(email)) {
            showError('email', 'Veuillez entrer un email valide');
            return false;
        }
        
        if (subject === '') {
            showError('subject', 'Veuillez entrer un sujet');
            return false;
        }
        
        if (message === '') {
            showError('message', 'Veuillez entrer un message');
            return false;
        }
        
        if (!consent) {
            showError('consent', 'Vous devez accepter les conditions');
            return false;
        }
        
        return true;
    }
    
    // Afficher une erreur
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Créer ou mettre à jour le message d'erreur
        let errorElement = field.parentElement.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            
            if (fieldId === 'consent') {
                field.closest('.checkbox-group').appendChild(errorElement);
            } else {
                field.parentElement.appendChild(errorElement);
            }
        }
        
        errorElement.textContent = message;
        
        // Ajouter une classe d'erreur
        if (fieldId === 'consent') {
            field.closest('.checkbox-container').classList.add('error');
        } else {
            field.classList.add('error');
        }
        
        // Style pour les messages d'erreur
        const errorStyle = document.createElement('style');
        errorStyle.textContent = `
            .error-message {
                color: #ef4444;
                font-size: 0.85rem;
                margin-top: 0.5rem;
                animation: fadeIn 0.3s ease;
            }
            
            input.error, textarea.error {
                border-color: #ef4444;
            }
            
            .checkbox-container.error .checkmark {
                border-color: #ef4444;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(errorStyle);
        
        // Supprimer l'erreur lors de la modification du champ
        field.addEventListener('input', function() {
            this.classList.remove('error');
            if (errorElement) {
                errorElement.remove();
            }
        }, { once: true });
    }
    
    // Vérifier si l'email est valide
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Simuler la soumission du formulaire
    function simulateFormSubmission(form) {
        // Récupérer le bouton de soumission
        const submitBtn = form.querySelector('.submit-btn');
        
        // Afficher l'état de chargement
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simuler un délai d'envoi
        setTimeout(() => {
            // Réinitialiser le bouton
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Réinitialiser le formulaire
            form.reset();
            
            // Réinitialiser les états des champs
            formInputs.forEach(input => {
                const container = input.closest('.input-container');
                if (container) {
                    container.classList.remove('has-value');
                }
            });
            
            // Afficher le message de succès
            successMessage.classList.add('active');
            
            // Animation d'entrée pour le message de succès
            const successContent = successMessage.querySelector('.success-content');
            successContent.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                successContent.style.transform = 'scale(1)';
            }, 50);
        }, 1500);
    }
}

/**
 * Initialise l'accordéon pour les FAQ
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        // Animation d'entrée
        setTimeout(() => {
            item.classList.add('animate-in');
        }, 100 * index);
        
        // Gérer le clic sur la question
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                // Fermer les autres items
                const isActive = item.classList.contains('active');
                
                faqItems.forEach(i => {
                    i.classList.remove('active');
                });
                
                // Si l'item n'était pas actif, l'activer
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
    
    // Ouvrir le premier item par défaut après un délai
    setTimeout(() => {
        if (faqItems.length > 0) {
            faqItems[0].classList.add('active');
        }
    }, 1000);
}

/**
 * Initialise les animations au scroll
 */
function initScrollAnimations() {
    // Observer l'entrée des sections dans le viewport
    const sections = document.querySelectorAll('.contact-main, .faq-section, .contact-cta');
    
    // Observer l'entrée dans le viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
                
                // Animer les enfants
                animateChildren(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Observer chaque section
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Fonction pour animer les enfants d'une section
    function animateChildren(section) {
        // Animer les éléments de contenu
        const contentElements = section.querySelectorAll('.info-header, .form-header, .info-items, .social-links, .availability-status');
        
        contentElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animated');
            }, 200 * index);
        });
    }
    
    // Ajouter les styles pour les animations
    const style = document.createElement('style');
    style.textContent = `
        .contact-main, .faq-section, .contact-cta {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .contact-main.visible, .faq-section.visible, .contact-cta.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .info-header, .form-header, .info-items, .social-links, .availability-status {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .info-header.animated, .form-header.animated, .info-items.animated, .social-links.animated, .availability-status.animated {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les animations GSAP avancées
 */
function initGsapAnimations() {
    // Enregistrer les plugins
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // Animation du titre
    const animatedHeading = document.querySelector('.animated-heading');
    if (animatedHeading) {
        // Animation lettre par lettre
        const text = animatedHeading.textContent;
        let html = '';
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                html += '<span>&nbsp;</span>';
            } else {
                html += `<span>${text[i]}</span>`;
            }
        }
        
        animatedHeading.innerHTML = html;
        
        // Animer chaque lettre
        gsap.from(animatedHeading.querySelectorAll('span'), {
            opacity: 0,
            y: 20,
            rotationX: 90,
            stagger: 0.05,
            duration: 0.5,
            delay: 1,
            ease: 'back.out'
        });
    }
    
    // Animation des icônes d'information
    const infoIcons = document.querySelectorAll('.info-icon');
    if (infoIcons.length > 0) {
        gsap.from(infoIcons, {
            opacity: 0,
            scale: 0,
            stagger: 0.2,
            duration: 0.6,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: '.info-items',
                start: 'top 80%'
            }
        });
    }
    
    // Animation des icônes sociales
    const socialIcons = document.querySelectorAll('.social-icon');
    if (socialIcons.length > 0) {
        gsap.from(socialIcons, {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.social-links',
                start: 'top 90%'
            }
        });
    }
    
    // Animation du formulaire
    const formGroups = document.querySelectorAll('.form-group');
    if (formGroups.length > 0) {
        gsap.from(formGroups, {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.contact-form',
                start: 'top 80%'
            }
        });
    }
    
    // Animation de la section FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        gsap.from(faqItems, {
            opacity: 0,
            y: 40,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.faq-container',
                start: 'top 80%'
            }
        });
    }
    
    // Animation de la section CTA
    const ctaSection = document.querySelector('.contact-cta');
    if (ctaSection) {
        gsap.from(ctaSection.querySelector('.cta-content'), {
            opacity: 0,
            y: 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: ctaSection,
                start: 'top 80%'
            }
        });
    }
}

// Gestion des liens de défilement doux
document.querySelectorAll('.scroll-to').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            // Calculer la position de défilement
            const headerOffset = 100;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            // Défilement doux
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});
