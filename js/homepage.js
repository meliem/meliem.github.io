/**
 * Animations spécifiques à la page d'accueil
 * Effets visuels avancés pour créer une expérience immersive
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser GSAP si disponible
    if (typeof gsap !== 'undefined') {
        initGsapAnimations();
    }
    
    // Initialiser les animations du hero
    initHeroAnimations();
    
    // Initialiser les animations des cartes de navigation
    initNavCardsAnimation();
    
    // Initialiser l'effet de flux de données
    initDataFlowEffect();
    
    // Initialiser l'effet de circuit imprimé
    initCircuitBoardEffect();
    
    // Initialiser l'effet glitch du titre
    initGlitchEffect();
});

/**
 * Initialise les animations GSAP avancées
 */
function initGsapAnimations() {
    // Enregistrer les plugins
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // Animation du titre avec un split text (simulation)
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        // Créer une animation de révélation pour chaque lettre
        const titleText = heroTitle.textContent;
        const charElements = [];
        
        // Vider le contenu original
        heroTitle.textContent = '';
        
        // Créer un span pour chaque caractère
        for (let i = 0; i < titleText.length; i++) {
            const charSpan = document.createElement('span');
            charSpan.textContent = titleText[i];
            charSpan.style.opacity = '0';
            charSpan.style.display = 'inline-block';
            charSpan.style.transform = 'translateY(50px)';
            charElements.push(charSpan);
            heroTitle.appendChild(charSpan);
        }
        
        // Animer chaque caractère séquentiellement
        gsap.to(charElements, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.5
        });
    }
    
    // Animation de la section de navigation visuelle
    const navCards = document.querySelectorAll('.nav-card');
    if (navCards.length) {
        gsap.from(navCards, {
            opacity: 0,
            y: 100,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: '.visual-navigation',
                start: 'top 80%'
            }
        });
    }
    
    // Parallaxe pour le fond du hero
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        gsap.to(heroBackground, {
            y: '20%',
            ease: "none",
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
}

/**
 * Initialise les animations spécifiques à la section hero
 */
function initHeroAnimations() {
    // Animation des éléments du hero
    const heroElements = document.querySelectorAll('.hero-content > *');
    heroElements.forEach((element, index) => {
        // Ajouter la classe pour l'animation
        element.classList.add('hero-element');
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        // Animation avec délai progressif
        setTimeout(() => {
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
    });
    
    // Animation du bouton de défilement
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.style.opacity = '0';
        setTimeout(() => {
            scrollIndicator.style.transition = 'opacity 1s ease';
            scrollIndicator.style.opacity = '1';
        }, 2000);
        
        // Ajouter un événement de clic pour faire défiler vers la section suivante
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.querySelector('.visual-navigation');
            if (nextSection) {
                window.scrollTo({
                    top: nextSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }
}

/**
 * Initialise les animations des cartes de navigation
 */
function initNavCardsAnimation() {
    const navCards = document.querySelectorAll('.nav-card');
    
    navCards.forEach(card => {
        // Effet au survol
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.03)';
            this.style.boxShadow = '0 20px 30px rgba(0, 0, 0, 0.15)';
            
            // Animation de l'icône
            const icon = this.querySelector('.card-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.color = 'white';
            }
        });
        
        // Retour à l'état normal
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
            
            // Animation de l'icône
            const icon = this.querySelector('.card-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
                icon.style.color = 'var(--primary-color)';
            }
        });
    });
    
    // Animation au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Animer avec un délai progressif
                setTimeout(() => {
                    entry.target.classList.add('reveal-card');
                }, index * 100);
            }
        });
    }, { threshold: 0.2 });
    
    navCards.forEach(card => {
        observer.observe(card);
    });
    
    // Ajouter la classe CSS pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        .nav-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            opacity: 0;
            transform: translateY(50px);
        }
        .nav-card.reveal-card {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .card-icon {
            transition: transform 0.3s ease, color 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Crée un effet visuel de flux de données dans l'arrière-plan
 */
function initDataFlowEffect() {
    const dataFlow = document.querySelector('.data-flow');
    if (!dataFlow) return;
    
    // Créer des particules de données
    const particleCount = window.innerWidth < 768 ? 20 : 40;
    
    for (let i = 0; i < particleCount; i++) {
        createDataParticle(dataFlow);
    }
    
    // Fonction pour créer une particule de données
    function createDataParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'data-particle';
        
        // Positionner aléatoirement
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        
        // Définir la taille et l'opacité
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.3 + 0.2;
        
        // Définir la vitesse
        const duration = Math.random() * 8 + 6; // entre 6 et 14 secondes
        
        // Définir le style
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size * (Math.random() * 5 + 5)}px; /* Forme rectangulaire */
            background-color: rgba(59, 130, 246, ${opacity});
            left: ${startX}%;
            top: ${startY}%;
            border-radius: 2px;
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
            transform-origin: center;
            animation: dataParticleAnimation ${duration}s linear infinite;
        `;
        
        // Ajouter au conteneur
        container.appendChild(particle);
    }
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes dataParticleAnimation {
            0% {
                transform: translateY(0) scale(1);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(${window.innerHeight}px) scale(0.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Crée un effet visuel de circuit imprimé dans l'arrière-plan
 */
function initCircuitBoardEffect() {
    const circuitBoard = document.querySelector('.circuit-board');
    if (!circuitBoard) return;
    
    // Nombre de lignes de circuit
    const lineCount = window.innerWidth < 768 ? 10 : 20;
    
    // Créer les lignes de circuit
    for (let i = 0; i < lineCount; i++) {
        createCircuitLine(circuitBoard);
    }
    
    // Créer les noeuds de circuit
    const nodeCount = window.innerWidth < 768 ? 15 : 30;
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
                ? `width: ${length}%; height: ${thickness}px;` 
                : `height: ${length}%; width: ${thickness}px;`
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
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);
}

/**
 * Initialise l'effet de glitch pour le titre
 */
function initGlitchEffect() {
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
    
    // Ajouter les styles pour l'effet
    const style = document.createElement('style');
    style.textContent = `
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
    document.head.appendChild(style);
}
