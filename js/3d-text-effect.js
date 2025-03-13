/**
 * Animation de texte 3D interactive pour la page d'accueil
 * Réagit aux mouvements de la souris et à l'accéléromètre sur mobile
 * Effet impressionnant et fluide avec optimisations de performance
 */

class Text3DEffect {
    constructor(options = {}) {
        // Options par défaut
        this.options = {
            selector: '.hero-title',           // Sélecteur CSS pour le titre
            depth: 40,                         // Profondeur de l'effet 3D
            layers: 10,                        // Nombre de couches pour l'effet de profondeur
            perspective: 1000,                 // Perspective CSS
            shadowColor: '#64ffda',            // Couleur de l'ombre
            shadowBlur: '5px',                 // Flou de l'ombre
            shadowOpacity: 0.5,                // Opacité de l'ombre
            gyroscopeEnabled: true,            // Activer l'effet sur mobile avec gyroscope
            mouseEnabled: true,                // Activer l'effet avec la souris
            maxTilt: 20,                       // Inclinaison maximale en degrés
            smoothing: 0.1,                    // Facteur de lissage des mouvements
            throttleDelay: 16,                 // Délai pour le throttling (environ 60fps)
            adaptivePerformance: true,         // Ajuster les performances automatiquement
            ...options                         // Écraser avec les options fournies
        };

        // États
        this.element = null;
        this.container = null;
        this.layers = [];
        this.isActive = false;
        this.isLowPowerMode = false;
        this.mousePosition = { x: 0, y: 0 };
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.gyroscopeEnabled = false;
        this.lastThrottleTime = 0;
        this.frameRequest = null;
        this.centerPoint = { x: 0, y: 0 };
        this.windowDimensions = { width: window.innerWidth, height: window.innerHeight };
        
        // Initialiser l'effet
        this.init();
    }
    
    /**
     * Initialise l'effet 3D
     */
    init() {
        // Sélectionner l'élément cible
        this.element = document.querySelector(this.options.selector);
        if (!this.element) {
            console.warn(`Élément ${this.options.selector} non trouvé pour l'effet 3D`);
            return;
        }
        
        // Créer le conteneur 3D
        this.setupContainer();
        
        // Créer les couches de texte
        this.createLayers();
        
        // Vérifier le mode d'économie d'énergie
        this.checkPowerMode();
        
        // Mettre en place les écouteurs d'événements
        this.setupEventListeners();
        
        // Démarrer l'animation
        this.isActive = true;
        this.animate();
        
        // Activer le gyroscope si disponible
        this.enableGyroscope();
        
        console.log('Effet de texte 3D initialisé');
    }
    
    /**
     * Crée le conteneur pour l'effet 3D
     */
    setupContainer() {
        // Créer un conteneur 3D
        this.container = document.createElement('div');
        this.container.className = 'text-3d-container';
        
        // Styler le conteneur
        this.container.style.cssText = `
            position: relative;
            transform-style: preserve-3d;
            perspective: ${this.options.perspective}px;
            transition: transform 0.1s ease-out;
            will-change: transform;
            display: inline-block;
        `;
        
        // Remplacer l'élément original par le conteneur
        this.element.parentNode.replaceChild(this.container, this.element);
        
        // Ajouter l'élément original au conteneur
        this.container.appendChild(this.element);
        
        // Mettre à jour les dimensions et le centre
        this.updateDimensions();
    }
    
    /**
     * Crée les couches de texte pour l'effet de profondeur
     */
    createLayers() {
        // Récupérer le texte de l'élément
        const text = this.element.textContent;
        this.element.style.opacity = '0'; // Masquer l'original
        
        // Créer chaque couche
        for (let i = 0; i < this.options.layers; i++) {
            const layer = document.createElement('div');
            layer.className = 'text-3d-layer';
            layer.textContent = text;
            
            // Calculer la profondeur de cette couche
            const depth = (i / (this.options.layers - 1)) * this.options.depth;
            const opacity = i === 0 ? 1 : 0.9 - (i / this.options.layers) * 0.8;
            
            // Styler la couche
            layer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                transform: translateZ(${depth - this.options.depth/2}px);
                color: ${i === 0 ? '#fff' : this.options.shadowColor};
                opacity: ${opacity};
                text-shadow: 0 0 ${this.options.shadowBlur} ${this.options.shadowColor};
                will-change: transform;
                pointer-events: none;
                font-size: ${this.element.style.fontSize || 'inherit'};
                font-weight: ${this.element.style.fontWeight || 'inherit'};
                font-family: ${this.element.style.fontFamily || 'inherit'};
                letter-spacing: ${this.element.style.letterSpacing || 'inherit'};
                line-height: ${this.element.style.lineHeight || 'inherit'};
            `;
            
            // Ajouter la couche au conteneur
            this.container.appendChild(layer);
            this.layers.push(layer);
        }
    }
    
    /**
     * Vérifier si le mode économie d'énergie est activé
     */
    checkPowerMode() {
        // Vérifier le mode d'économie d'énergie
        if (typeof PerformanceManager !== 'undefined') {
            this.isLowPowerMode = PerformanceManager.lowPowerMode;
            
            // Ajuster les paramètres en mode basse performance
            if (this.isLowPowerMode) {
                this.options.layers = Math.min(5, this.options.layers);
                this.options.throttleDelay = 32; // environ 30fps
                this.options.smoothing = 0.05;
                
                // Supprimer les couches excédentaires
                while (this.layers.length > this.options.layers) {
                    const layer = this.layers.pop();
                    if (layer.parentNode) {
                        layer.parentNode.removeChild(layer);
                    }
                }
            }
        }
    }
    
    /**
     * Met en place les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les mouvements de la souris
        if (this.options.mouseEnabled) {
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        }
        
        // Écouter les changements de taille de fenêtre
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Observer la visibilité
        this.setupVisibilityObserver();
    }
    
    /**
     * Gère les mouvements de la souris
     */
    handleMouseMove(event) {
        // Throttling pour limiter les calculs
        const now = Date.now();
        if (now - this.lastThrottleTime < this.options.throttleDelay) return;
        this.lastThrottleTime = now;
        
        // Mettre à jour la position de la souris
        this.mousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        // Calculer l'angle de rotation basé sur la position de la souris
        const rotationX = ((this.mousePosition.y - this.centerPoint.y) / this.windowDimensions.height) * this.options.maxTilt * 2;
        const rotationY = ((this.mousePosition.x - this.centerPoint.x) / this.windowDimensions.width) * this.options.maxTilt * 2;
        
        // Définir la rotation cible
        this.targetRotation = {
            x: -rotationX,
            y: rotationY
        };
    }
    
    /**
     * Gère la sortie de la souris
     */
    handleMouseLeave() {
        // Revenir progressivement à la position de repos
        this.targetRotation = { x: 0, y: 0 };
    }
    
    /**
     * Gère le redimensionnement de la fenêtre
     */
    handleResize() {
        this.updateDimensions();
    }
    
    /**
     * Met à jour les dimensions et le point central
     */
    updateDimensions() {
        // Mettre à jour les dimensions de la fenêtre
        this.windowDimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Calculer le centre de l'élément
        const rect = this.container.getBoundingClientRect();
        this.centerPoint = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
    
    /**
     * Configure un observateur pour détecter si l'élément est visible
     */
    setupVisibilityObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // L'élément est visible
                        if (!this.isActive) {
                            this.isActive = true;
                            this.animate();
                        }
                    } else {
                        // L'élément n'est pas visible
                        this.isActive = false;
                        if (this.frameRequest) {
                            cancelAnimationFrame(this.frameRequest);
                            this.frameRequest = null;
                        }
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(this.container);
        }
    }
    
    /**
     * Active le gyroscope sur les appareils mobiles
     */
    enableGyroscope() {
        if (!this.options.gyroscopeEnabled) return;
        
        // Vérifier si l'API DeviceOrientation est disponible
        if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
            this.gyroscopeEnabled = true;
            
            // Écouter les événements d'orientation
            window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
        }
    }
    
    /**
     * Gère les événements du gyroscope
     */
    handleDeviceOrientation(event) {
        // Throttling pour limiter les calculs
        const now = Date.now();
        if (now - this.lastThrottleTime < this.options.throttleDelay) return;
        this.lastThrottleTime = now;
        
        // Sur iOS, l'orientation est différente
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        // Lire les données du gyroscope
        let beta = event.beta;  // Inclinaison avant/arrière (-180 à 180)
        let gamma = event.gamma; // Inclinaison gauche/droite (-90 à 90)
        
        // Limiter les valeurs
        beta = Math.max(-90, Math.min(90, beta));
        gamma = Math.max(-90, Math.min(90, gamma));
        
        // Normaliser pour notre utilisation (max +/- maxTilt)
        const rotationX = (beta / 90) * this.options.maxTilt;
        const rotationY = (gamma / 90) * this.options.maxTilt;
        
        // Définir la rotation cible
        this.targetRotation = {
            x: isIOS ? -rotationX : rotationX,
            y: rotationY
        };
    }
    
    /**
     * Fonction d'animation
     */
    animate() {
        if (!this.isActive) return;
        
        // Appliquer le lissage du mouvement
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * this.options.smoothing;
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * this.options.smoothing;
        
        // Appliquer la rotation au conteneur
        this.container.style.transform = `rotateX(${this.rotation.x}deg) rotateY(${this.rotation.y}deg)`;
        
        // Animer chaque couche avec un effet parallaxe
        this.layers.forEach((layer, index) => {
            const depth = (index / (this.options.layers - 1));
            const translateX = -this.rotation.y * depth * 2; // Effet parallaxe horizontal
            const translateY = this.rotation.x * depth * 2;  // Effet parallaxe vertical
            
            layer.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${depth * this.options.depth - this.options.depth/2}px)`;
        });
        
        // Continuer l'animation
        this.frameRequest = requestAnimationFrame(this.animate.bind(this));
    }
    
    /**
     * Nettoie les ressources
     */
    cleanup() {
        // Arrêter l'animation
        this.isActive = false;
        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
            this.frameRequest = null;
        }
        
        // Retirer les écouteurs d'événements
        if (this.options.mouseEnabled) {
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseleave', this.handleMouseLeave);
        }
        
        if (this.gyroscopeEnabled) {
            window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        // Restaurer l'élément original
        if (this.container && this.container.parentNode) {
            this.element.style.opacity = '1';
            this.container.parentNode.replaceChild(this.element, this.container);
        }
    }
}

/**
 * Initialiser l'effet lorsque la page est chargée
 */
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que tous les éléments soient chargés et le préchargeur masqué
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Trouver l'élément du titre
            const heroTitle = document.querySelector('.hero h1, .hero-content h1, .typed-text');
            
            // Créer l'effet 3D s'il y a un titre
            if (heroTitle) {
                // Créer un conteneur pour le titre s'il n'en a pas
                if (!heroTitle.parentElement.classList.contains('hero-title')) {
                    const container = document.createElement('div');
                    container.className = 'hero-title';
                    heroTitle.parentNode.insertBefore(container, heroTitle);
                    container.appendChild(heroTitle);
                }
                
                // Initialiser l'effet
                const text3DEffect = new Text3DEffect({
                    selector: '.hero-title',
                    depth: window.innerWidth < 768 ? 20 : 40, // Moins de profondeur sur mobile
                    layers: window.innerWidth < 768 ? 5 : 10  // Moins de couches sur mobile
                });
                
                // Enregistrer pour nettoyage si HomepageAnimations existe
                if (window.HomepageAnimations) {
                    window.HomepageAnimations.registerAnimation({
                        cleanup: () => text3DEffect.cleanup()
                    });
                }
            }
        }, 500); // Léger délai pour s'assurer que tout est prêt
    });
});
