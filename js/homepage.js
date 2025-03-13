/**
 * Animations spécifiques à la page d'accueil - Version optimisée
 * Effets visuels avancés pour créer une expérience immersive
 * avec une meilleure gestion des performances
 */

// Vérifier si les gestionnaires d'état sont disponibles
const hasAppState = typeof AppState !== 'undefined';
const hasPerformanceManager = typeof PerformanceManager !== 'undefined';

// Gestionnaire local d'animations pour la page d'accueil
const HomepageAnimations = {
    activeAnimations: [],
    animationsInitialized: false,
    
    // Ajouter une animation à la liste
    registerAnimation: function(animation) {
        this.activeAnimations.push(animation);
    },
    
    // Nettoyer toutes les animations
    cleanup: function() {
        this.activeAnimations.forEach(animation => {
            if (typeof animation.cleanup === 'function') {
                animation.cleanup();
            }
        });
        this.activeAnimations = [];
    }
};

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Éviter les initialisations multiples
    if (HomepageAnimations.animationsInitialized) return;
    HomepageAnimations.animationsInitialized = true;
    
    try {
        // Initialiser GSAP si disponible
        if (typeof gsap !== 'undefined') {
            initGsapAnimations();
        }
        
        // Initialiser les animations du hero
        initHeroAnimations();
        
        // Initialiser les animations des cartes de navigation
        initNavCardsAnimation();
        
        // Initialiser l'effet de flux de données (seulement si pas en mode basse consommation)
        if (!hasPerformanceManager || !PerformanceManager.lowPowerMode) {
            initDataFlowEffect();
            
            // Initialiser l'effet de circuit imprimé
            initCircuitBoardEffect();
        }
        
        // Initialiser l'effet glitch du titre (version simplifiée sur mobile)
        initGlitchEffect();
        
        // S'intégrer avec AppState pour le nettoyage lors de la navigation
        if (hasAppState) {
            const originalCleanup = AppState.removeAllEventListeners;
            AppState.removeAllEventListeners = function() {
                originalCleanup.call(AppState);
                HomepageAnimations.cleanup();
            };
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des animations de la page d\'accueil:', error);
    }
});

/**
 * Initialise les animations GSAP avancées avec optimisations de performance
 */
function initGsapAnimations() {
    // Vérifier que GSAP est disponible
    if (typeof gsap === 'undefined') return;
    
    // Vérifier si nous sommes en mode économie d'énergie
    const isLowPowerMode = hasPerformanceManager && PerformanceManager.lowPowerMode;
    
    // Enregistrer les plugins si disponibles
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Configuration globale de ScrollTrigger pour optimiser les performances
        ScrollTrigger.config({
            limitCallbacks: true, // Limite le nombre d'appels de callback
            ignoreMobileResize: true, // Évite des recalculs inutiles sur mobile
        });
    }
    
    try {
        // Animation du titre avec un split text optimisé
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            // Solution optimisée qui réduit les manipulations DOM
            const titleText = heroTitle.textContent || '';
            let titleHTML = '';
            
            // Créer tout le HTML en une seule fois pour minimiser les manipulations DOM
            for (let i = 0; i < titleText.length; i++) {
                titleHTML += `<span class="char-${i}" style="opacity:0;display:inline-block;transform:translateY(50px)">${titleText[i]}</span>`;
            }
            heroTitle.innerHTML = titleHTML;
            
            // Sélectionner tous les spans en une seule fois
            const charElements = heroTitle.querySelectorAll('span');
            
            // Animer chaque caractère avec des paramètres optimisés
            gsap.to(charElements, {
                opacity: 1,
                y: 0,
                duration: isLowPowerMode ? 0.4 : 0.8,
                stagger: isLowPowerMode ? 0.02 : 0.05,
                ease: "power2.out",
                delay: 0.5,
                overwrite: true // Éviter les conflits d'animation
            });
        }
        
        // Animation de la section de navigation visuelle avec meilleure performance
        const navCards = document.querySelectorAll('.nav-card');
        if (navCards.length) {
            // Créer une animation avec de meilleures performances
            const navCardsAnimation = gsap.from(navCards, {
                opacity: 0,
                y: 100,
                duration: isLowPowerMode ? 0.4 : 0.8,
                stagger: isLowPowerMode ? 0.05 : 0.1,
                ease: "back.out(1.5)", // Moins intense pour meilleures performances
                paused: true, // Ne pas démarrer automatiquement
                onComplete: () => {
                    // Libérer les ressources après l'animation
                    if (navCardsAnimation) {
                        navCardsAnimation.kill();
                    }
                }
            });
            
            // Créer un ScrollTrigger pour déclencher l'animation
            const navScrollTrigger = ScrollTrigger.create({
                trigger: '.visual-navigation',
                start: 'top 85%',
                onEnter: () => navCardsAnimation.play(),
                once: true // Déclencher une seule fois pour économiser des ressources
            });
            
            // Enregistrer pour nettoyage
            HomepageAnimations.registerAnimation({
                cleanup: () => {
                    if (navScrollTrigger) navScrollTrigger.kill();
                    if (navCardsAnimation) navCardsAnimation.kill();
                }
            });
        }
        
        // Parallaxe pour le fond du hero avec des performances optimisées
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground && !isLowPowerMode) { // Éviter sur les dispositifs faibles
            const parallaxAnimation = gsap.to(heroBackground, {
                y: '15%', // Réduire l'intensité pour de meilleures performances
                ease: "none",
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.2, // Ajouter un léger retard pour plus de fluidité
                    invalidateOnRefresh: false // Éviter les recalculs inutiles
                }
            });
            
            // Enregistrer pour nettoyage
            HomepageAnimations.registerAnimation({
                cleanup: () => {
                    if (parallaxAnimation && parallaxAnimation.scrollTrigger) {
                        parallaxAnimation.scrollTrigger.kill();
                    }
                    if (parallaxAnimation) parallaxAnimation.kill();
                }
            });
        }
    } catch (error) {
        console.error('Erreur dans les animations GSAP:', error);
    }
}

/**
 * Initialise les animations spécifiques à la section hero avec performances optimisées
 */
function initHeroAnimations() {
    try {
        // Vérifier si nous sommes en mode économie d'énergie
        const isLowPowerMode = hasPerformanceManager && PerformanceManager.lowPowerMode;
        
        // Animation des éléments du hero avec requestAnimationFrame pour de meilleures performances
        const heroElements = document.querySelectorAll('.hero-content > *');
        
        // Préparer les éléments pour l'animation
        heroElements.forEach((element) => {
            // Ajouter la classe pour l'animation
            element.classList.add('hero-element');
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
        });
        
        // Utiliser requestAnimationFrame pour une animation plus fluide
        // et diminuer l'impact sur les performances
        let startTime = null;
        const duration = isLowPowerMode ? 800 : 1200; // Durée plus courte en mode économie
        
        function animateHeroElements(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            
            heroElements.forEach((element, index) => {
                // Calculer le délai basé sur l'index et ajuster pour les performances
                const delay = isLowPowerMode ? 300 + (index * 100) : 500 + (index * 200);
                
                // Animer si le temps est supérieur au délai
                if (elapsedTime > delay) {
                    const elementTime = elapsedTime - delay;
                    if (elementTime <= duration) {
                        // Animation progressive
                        const progress = Math.min(elementTime / duration, 1);
                        // Fonction d'easing cubique
                        const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                        
                        element.style.opacity = easedProgress.toString();
                        element.style.transform = `translateY(${30 * (1 - easedProgress)}px)`;
                    } else {
                        // Assurer que l'élément est complètement visible
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }
                }
            });
            
            // Continuer l'animation si nécessaire
            if (elapsedTime < duration + (heroElements.length * 200)) {
                requestAnimationFrame(animateHeroElements);
            }
        }
        
        // Démarrer l'animation
        const animationId = requestAnimationFrame(animateHeroElements);
        
        // Animation du bouton de défilement avec meilleure gestion de mémoire
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.opacity = '0';
            
            // Utiliser requestAnimationFrame au lieu de setTimeout
            const showScrollIndicator = () => {
                scrollIndicator.style.transition = 'opacity 0.8s ease';
                scrollIndicator.style.opacity = '1';
            };
            
            // Déclencher après un délai
            setTimeout(showScrollIndicator, isLowPowerMode ? 1200 : 2000);
            
            // Utiliser la gestion centralisée des événements si disponible
            const scrollToNextSection = () => {
                const nextSection = document.querySelector('.visual-navigation');
                if (nextSection) {
                    window.scrollTo({
                        top: nextSection.offsetTop - 80,
                        behavior: isLowPowerMode ? 'auto' : 'smooth' // Défilement instantané en mode basse consommation
                    });
                }
            };
            
            if (hasAppState) {
                AppState.addEventListeners(scrollIndicator, 'click', scrollToNextSection);
            } else {
                scrollIndicator.addEventListener('click', scrollToNextSection);
            }
        }
        
        // Enregistrer l'animation pour nettoyage
        HomepageAnimations.registerAnimation({
            cleanup: () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            }
        });
    } catch (error) {
        console.error('Erreur dans les animations du Hero:', error);
    }
}

/**
 * Initialise les animations des cartes de navigation avec performances optimisées
 */
function initNavCardsAnimation() {
    try {
        const navCards = document.querySelectorAll('.nav-card');
        if (!navCards.length) return;
        
        // Vérifier si nous sommes en mode économie d'énergie
        const isLowPowerMode = hasPerformanceManager && PerformanceManager.lowPowerMode;
        
        // Créer des gestionnaires d'événements optimisés pour réduire les allocations
        const handleMouseEnter = function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 15px 25px rgba(0, 0, 0, 0.12)';
            
            // Animation de l'icône (optimisée)
            const icon = this.querySelector('.card-icon');
            if (icon) {
                // Animation simplifiée en mode basse consommation
                icon.style.transform = isLowPowerMode ? 'scale(1.1)' : 'scale(1.15) rotate(5deg)';
                icon.style.color = 'white';
            }
        };
        
        const handleMouseLeave = function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
            
            // Animation de l'icône
            const icon = this.querySelector('.card-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
                icon.style.color = 'var(--primary-color)';
            }
        };
        
        // Ajouter les écouteurs d'événements avec la gestion centralisée si disponible
        navCards.forEach(card => {
            if (hasAppState) {
                AppState.addEventListeners(card, 'mouseenter', handleMouseEnter);
                AppState.addEventListeners(card, 'mouseleave', handleMouseLeave);
            } else {
                card.addEventListener('mouseenter', handleMouseEnter);
                card.addEventListener('mouseleave', handleMouseLeave);
            }
        });
        
        // Animation au scroll avec performances optimisées
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Réduire le délai en mode basse consommation
                    const delay = isLowPowerMode ? index * 50 : index * 100;
                    setTimeout(() => {
                        if (entry.target) { // Vérifier que la cible existe toujours
                            entry.target.classList.add('reveal-card');
                        }
                    }, delay);
                }
            });
        }, { 
            threshold: 0.1, // Seuil plus bas pour déclencher plus tôt
            rootMargin: '50px' // Marge supplémentaire
        });
        
        navCards.forEach(card => {
            observer.observe(card);
        });
        
        // Ajouter les styles directement dans une balise existante ou en créer une nouvelle
        let styleElement = document.getElementById('nav-card-styles');
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'nav-card-styles';
            document.head.appendChild(styleElement);
        }
        
        // Version optimisée des styles avec de meilleures transitions
        styleElement.textContent = `
            .nav-card {
                transition: transform 0.25s ease, box-shadow 0.25s ease;
                opacity: 0;
                transform: translateY(30px);
                will-change: transform, opacity;
            }
            
            .nav-card.reveal-card {
                opacity: 1;
                transform: translateY(0);
            }
            
            .card-icon {
                transition: transform 0.25s ease, color 0.25s ease;
                will-change: transform;
            }
        `;
        
        // Enregistrer l'observateur pour nettoyage
        HomepageAnimations.registerAnimation({
            cleanup: () => {
                observer.disconnect();
                // Nettoyer l'élément de style si nécessaire
                if (styleElement && styleElement.parentNode) {
                    styleElement.parentNode.removeChild(styleElement);
                }
            }
        });
    } catch (error) {
        console.error('Erreur dans les animations des cartes de navigation:', error);
    }
}

}

// Add style and return cleanup function for proper resource management
function addStyleAndReturnCleanup(styleText) {
    const styleElement = document.createElement('style');
    styleElement.textContent = styleText;
    document.head.appendChild(styleElement);
    
    return () => {
        if (styleElement && styleElement.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
        }
    };
}

/**
 * Initialise l'effet de flux de données avec optimisations de performance
 */
function initDataFlowEffect() {
    try {
        // Vérifier si nous sommes en mode économie d'énergie
        const isLowPowerMode = hasPerformanceManager && PerformanceManager.lowPowerMode;
        
        // Créer et configurer le canvas
        const dataFlow = document.querySelector('.data-flow');
        if (!dataFlow) return;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'data-flow-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        dataFlow.appendChild(canvas);
        
        // Vérifier si canvas est visible avant d'initialiser
        const isCanvasVisible = () => {
            const rect = canvas.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        };
        
        // Configurer le canvas
        const ctx = canvas.getContext('2d');
        let animationId = null;
        
        // Ajuster la taille du canvas
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resizeCanvas();
        
        // Créer les lignes de données avec moins d'éléments si en mode basse consommation
        const dataLines = [];
        const lineCount = isLowPowerMode ? 15 : 30;
        
        for (let i = 0; i < lineCount; i++) {
            dataLines.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: (Math.random() * 50) + 20,
                speed: isLowPowerMode ? 1 + Math.random() * 2 : 1 + Math.random() * 3,
                thickness: Math.random() * 2 + 1,
                color: 'rgba(0, ' + Math.floor(120 + Math.random() * 135) + ', ' + Math.floor(180 + Math.random() * 75) + ', ' + (0.3 + Math.random() * 0.4).toFixed(2) + ')'
            });
        }
        
        // Fonction d'animation optimisée
        function animate() {
            if (!isCanvasVisible()) {
                // Si le canvas n'est pas visible, on ralentit les calculs
                animationId = requestAnimationFrame(animate);
                return;
            }
            
            // Effacer le canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dessiner et mettre à jour chaque ligne
            dataLines.forEach(line => {
                // Dessiner la ligne
                ctx.beginPath();
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.thickness;
                ctx.moveTo(line.x, line.y);
                ctx.lineTo(line.x, line.y + line.length);
                ctx.stroke();
                
                // Mettre à jour la position
                line.y += line.speed;
                
                // Réinitialiser si hors de l'écran
                if (line.y > canvas.height) {
                    line.y = -line.length;
                    line.x = Math.random() * canvas.width;
                }
            });
            
            // Continuer l'animation
            animationId = requestAnimationFrame(animate);
        }
        
        // Démarrer l'animation
        animationId = requestAnimationFrame(animate);
        
        // Ajouter un écouteur pour redimensionner
        const handleResize = () => {
            resizeCanvas();
        };
        
        if (hasAppState) {
            AppState.addEventListeners(window, 'resize', handleResize);
        } else {
            window.addEventListener('resize', handleResize);
        }
        
        // Enregistrer pour nettoyage
        HomepageAnimations.registerAnimation({
            cleanup: () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                if (!hasAppState) {
                    window.removeEventListener('resize', handleResize);
                }
            }
        });
    } catch (error) {
        console.error('Erreur dans l\'effet de flux de données:', error);
    }
}
}

/**
 * Initialise l'effet de circuit imprimé dans l'arrière-plan avec optimisations de performance
 */
function initCircuitBoardEffect() {
    try {
        // Vérifier si nous sommes en mode économie d'énergie
        const isLowPowerMode = hasPerformanceManager && PerformanceManager.lowPowerMode;
        
        // Récupérer l'élément conteneur
        const circuitBoard = document.querySelector('.circuit-board');
        if (!circuitBoard) return;
        
        // Adapter le nombre d'éléments selon performance et taille d'écran
        const lineCount = isLowPowerMode ? 8 : (window.innerWidth < 768 ? 10 : 20);
        const nodeCount = isLowPowerMode ? 5 : (window.innerWidth < 768 ? 15 : 30);
        
        // Créer des lignes de circuit
        for (let i = 0; i < lineCount; i++) {
            createCircuitLine(circuitBoard);
        }
        
        // Créer des nœuds de circuit
        for (let i = 0; i < nodeCount; i++) {
            createCircuitNode(circuitBoard);
        }
    
    // Fonction pour créer une ligne de circuit
    function createCircuitLine(container) {
        const line = document.createElement('div');
        line.className = 'circuit-line';
        
        // Positionner aléatoirement
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        
        // Définir la longueur et l'épaisseur
        const length = Math.random() * 20 + 5; // entre 5% et 25% de l'écran
        const thickness = Math.random() * 1 + 1; // entre 1px et 2px
        
        // Orientation aléatoire (horizontale ou verticale)
        const isHorizontal = Math.random() > 0.5;
        
        // Définir le style
        line.style.cssText = `
            position: absolute;
            background-color: rgba(59, 130, 246, 0.2);
            left: ${startX}%;
            top: ${startY}%;
            box-shadow: 0 0 3px rgba(59, 130, 246, 0.3);
            ${isHorizontal 
                ? 'width: ' + length + '%; height: ' + thickness + 'px;' 
                : 'height: ' + length + '%; width: ' + thickness + 'px;'
            }
        `;
        
        // Ajouter au conteneur
        container.appendChild(line);
        
        // Animation de pulsation
        animateCircuitElement(line);
    }
    
    // Fonction pour créer un noeud de circuit
    function createCircuitNode(container) {
        const node = document.createElement('div');
        node.className = 'circuit-node';
        
        // Positionner aléatoirement
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Définir la taille
        const size = Math.random() * 4 + 2; // entre 2px et 6px
        
        // Définir le style
        node.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background-color: rgba(59, 130, 246, 0.4);
            left: ${posX}%;
            top: ${posY}%;
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
        `;
        
        // Ajouter au conteneur
        container.appendChild(node);
        
        // Animation de pulsation
        animateCircuitElement(node);
    }
    
    // Fonction pour animer un élément de circuit
    function animateCircuitElement(element) {
        // Créer une animation de pulsation avec une périodicité aléatoire
        const duration = Math.random() * 3 + 2; // entre 2 et 5 secondes
        const delay = Math.random() * 2; // délai initial aléatoire
        
        element.style.animation = `circuitPulse ${duration}s ease-in-out ${delay}s infinite`;
    }
    
    try {
        // Ajouter l'animation CSS
        const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes circuitPulse {
            0%, 100% {
                opacity: 0.2;
                box-shadow: 0 0 3px rgba(59, 130, 246, 0.3);
            }
            50% {
                opacity: 0.8;
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
            }
        }
    `;
    document.head.appendChild(styleElement);
    
    // Enregistrer l'animation pour le nettoyage global
    HomepageAnimations.registerAnimation({
        cleanup: () => {
            // Nettoyer les styles
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
            
            // Nettoyer les éléments du circuit
            if (circuitBoard) {
                const elements = circuitBoard.querySelectorAll('.circuit-line, .circuit-node');
                elements.forEach(el => el.remove());
            }
        }
    });
    } catch (error) {
        console.error('Erreur dans l\'effet circuit board:', error);
    }
}

/**
 * Initialise l'effet glitch du titre avec optimisations de performance
 */
function initGlitchEffect() {
    try {
        // Vérifier si nous sommes en mode économie d'énergie
        const isLowPowerMode = hasPerformanceManager && PerformanceManager.lowPowerMode;
        
        // Éviter complètement l'animation en mode très faible performance
        if (isLowPowerMode && window.innerWidth < 768) return;
        
        // Récupérer l'élément titre
        const glitchContainer = document.querySelector('.glitch-container');
        if (!glitchContainer) return;
        
        const glitchText = glitchContainer.querySelector('.glitch');
        if (!glitchText) return;
        
        // Texte original
        const text = glitchText.textContent;
        
        // Créer les couches de glitch
    const beforeLayer = document.createElement('span');
    beforeLayer.className = 'glitch-layer glitch-before';
    beforeLayer.setAttribute('data-text', text);
    
    const afterLayer = document.createElement('span');
    afterLayer.className = 'glitch-layer glitch-after';
    afterLayer.setAttribute('data-text', text);
    
    // Insérer avant le texte original
    glitchContainer.insertBefore(beforeLayer, glitchText);
    glitchContainer.appendChild(afterLayer);
    
    // Ajouter les styles avec des identifiants uniques pour éviter les conflits
    const styleId = 'glitch-effect-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
        .glitch-container {
            position: relative;
            display: inline-block;
        }
        
        .glitch {
            position: relative;
            animation: glitch-animation 2.5s infinite;
        }
        
        .glitch-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: white;
        }
        
        .glitch-layer::before {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        .glitch-before {
            left: -2px;
            text-shadow: -2px 0 #ff00cc;
            animation: glitch-animation-1 3s infinite linear alternate-reverse;
            clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
            -webkit-clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }
        
        .glitch-after {
            left: 2px;
            text-shadow: 2px 0 #00ffff;
            animation: glitch-animation-2 2.7s infinite linear alternate-reverse;
            clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
            -webkit-clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
        }
        
        @keyframes glitch-animation-1 {
            0% {
                transform: translate(0);
            }
            10% {
                transform: translate(-2px, 2px);
            }
            20% {
                transform: translate(-4px, 4px);
            }
            30% {
                transform: translate(0);
            }
            40% {
                transform: translate(-2px, -2px);
            }
            50% {
                transform: translate(0);
            }
            60% {
                transform: translate(4px, 2px);
            }
            70% {
                transform: translate(0);
            }
            80% {
                transform: translate(2px, -4px);
            }
            90% {
                transform: translate(-2px, 2px);
            }
            100% {
                transform: translate(0);
            }
        }
        
        @keyframes glitch-animation-2 {
            0% {
                transform: translate(0);
            }
            10% {
                transform: translate(2px, -2px);
            }
            20% {
                transform: translate(0);
            }
            30% {
                transform: translate(-2px, 2px);
            }
            40% {
                transform: translate(0);
            }
            50% {
                transform: translate(2px, 2px);
            }
            60% {
                transform: translate(0);
            }
            70% {
                transform: translate(2px, -2px);
            }
            80% {
                transform: translate(-2px, -2px);
            }
            90% {
                transform: translate(0);
            }
            100% {
                transform: translate(0);
            }
        }
        
        @keyframes glitch-animation {
            0%, 10%, 90%, 100% {
                opacity: 1;
                transform: translate(0) skew(0);
            }
            1% {
                transform: translate(-3px, 1px) skew(0.2deg);
            }
            2% {
                transform: translate(3px, -1px) skew(-0.1deg);
            }
            3% {
                transform: translate(0);
            }
            20% {
                transform: translate(0);
            }
            21% {
                opacity: 0.8;
                transform: translate(-5px, 0) skew(0.4deg);
            }
            22% {
                opacity: 1;
                transform: translate(0);
            }
            23% {
                opacity: 0.8;
                transform: translate(5px, 1px) skew(-0.4deg);
            }
            24% {
                opacity: 1;
                transform: translate(0);
            }
            90% {
                opacity: 1;
                transform: translate(0) skew(0);
            }
            91% {
                opacity: 0.9;
                transform: translate(5px, 2px) skew(0.3deg);
            }
            92% {
                opacity: 1;
                transform: translate(0);
            }
            93% {
                opacity: 0.9;
                transform: translate(-5px, -2px) skew(-0.3deg);
            }
            94% {
                opacity: 1;
                transform: translate(0);
            }
        }
    `;
    document.head.appendChild(styleElement);
    
        // Enregistrer l'animation pour le nettoyage global
    HomepageAnimations.registerAnimation({
        cleanup: () => {
            if (styleElement && styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
            
            // Restaurer le texte original si nécessaire
            if (glitchContainer) {
                const layers = glitchContainer.querySelectorAll('.glitch-layer');
                layers.forEach(layer => layer.remove());
            }
        }
    });
    
    } catch (error) {
        console.error('Erreur dans l\'effet glitch:', error);
    }
}
