/**
 * Système de particules interactives avancé
 * Réagit aux mouvements de la souris/toucher et crée des effets visuels impressionnants
 * Optimisé pour les performances avec adaptation automatique
 */

class InteractiveParticles {
    constructor(options = {}) {
        // Options par défaut
        this.options = {
            canvasId: 'particles-canvas',         // ID du canvas existant
            maxParticles: 100,                    // Nombre maximum de particules
            particleSize: 2,                      // Taille de base des particules
            particleColor: '#64ffda',             // Couleur principale des particules
            connectionColor: '#64ffda',           // Couleur des connexions
            connectionOpacity: 0.2,               // Opacité des connexions
            connectionThreshold: 150,             // Distance maximale de connexion
            speed: 0.5,                           // Vitesse des particules
            responsiveness: 100,                  // Réactivité à la souris (rayon d'influence)
            interactionForce: 3,                  // Force d'interaction
            adaptivePerformance: true,            // Ajuster les performances automatiquement
            motionReactiveMode: true,             // Réagir au mouvement de la souris/appareil
            ...options                            // Écraser avec les options fournies
        };

        // États
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mousePosition = { x: null, y: null };
        this.lastMousePosition = { x: null, y: null };
        this.mouseSpeed = { x: 0, y: 0 };
        this.isActive = false;
        this.isLowPowerMode = false;
        this.rafId = null;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.touchMode = 'ontouchstart' in window;
        this.lastThrottleTime = 0;
        this.lastPerformanceAdjustTime = 0;
        this.fps = 60;
        this.framesCount = 0;
        this.lastFpsUpdateTime = 0;
        this.isMobile = window.innerWidth < 768;
        this.motionTrailsEnabled = !this.isMobile && this.options.motionReactiveMode;
        this.particleDecay = 0.95; // Facteur de décroissance pour les traces de mouvement

        // Initialiser l'effet
        this.init();
    }

    /**
     * Initialise le système de particules
     */
    init() {
        // Récupérer le canvas existant
        this.canvas = document.getElementById(this.options.canvasId);
        if (!this.canvas) {
            console.warn(`Canvas #${this.options.canvasId} non trouvé, création d'un nouveau canvas`);
            this.createCanvas();
        }

        this.ctx = this.canvas.getContext('2d');

        // Vérifier si nous sommes en mode économie d'énergie
        this.checkPowerMode();

        // Ajuster le nombre de particules selon le dispositif
        this.adjustParticleCount();

        // Configurer le canvas pour haute résolution
        this.setupHighDpiCanvas();

        // Créer les particules
        this.createParticles();

        // Mettre en place les écouteurs d'événements
        this.setupEventListeners();

        // Démarrer l'animation
        this.isActive = true;
        this.animate();

        console.log('Système de particules interactives initialisé avec', this.particles.length, 'particules');
    }

    /**
     * Crée un nouveau canvas si nécessaire
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = this.options.canvasId;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        document.body.appendChild(this.canvas);
    }

    /**
     * Vérifie si on est en mode d'économie d'énergie
     */
    checkPowerMode() {
        if (typeof PerformanceManager !== 'undefined') {
            this.isLowPowerMode = PerformanceManager.lowPowerMode;

            // Réduire les paramètres en mode économie d'énergie
            if (this.isLowPowerMode) {
                this.options.maxParticles = Math.floor(this.options.maxParticles * 0.6);
                this.options.connectionThreshold *= 0.8;
                this.options.responsiveness *= 0.8;
                this.motionTrailsEnabled = false;
            }
        }
    }

    /**
     * Ajuste le nombre de particules selon le dispositif
     */
    adjustParticleCount() {
        // Réduire le nombre de particules sur mobile
        if (this.isMobile) {
            this.options.maxParticles = Math.floor(this.options.maxParticles * 0.5);
            this.options.connectionThreshold *= 0.7;
            this.motionTrailsEnabled = false;
        }
    }

    /**
     * Configure le canvas pour une haute résolution
     */
    setupHighDpiCanvas() {
        // Ajuster la taille du canvas pour correspondre à la résolution de l'écran
        const updateSize = () => {
            // Récupérer les dimensions de l'élément parent ou de la fenêtre
            const displayWidth = this.canvas.clientWidth;
            const displayHeight = this.canvas.clientHeight;

            // Vérifier si les dimensions ont changé
            if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
                // Mettre à jour la taille du canvas en tenant compte de la résolution de l'écran
                this.canvas.width = displayWidth * this.devicePixelRatio;
                this.canvas.height = displayHeight * this.devicePixelRatio;

                // Mettre à l'échelle le contexte
                this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
            }
        };

        // Mettre à jour la taille initialement
        updateSize();

        // Écouter les redimensionnements de fenêtre
        window.addEventListener('resize', () => {
            updateSize();
            this.isMobile = window.innerWidth < 768;
            // Recréer les particules après redimensionnement
            this.adjustParticleCount();
            this.particles = [];
            this.createParticles();
        });
    }

    /**
     * Crée les particules du système
     */
    createParticles() {
        for (let i = 0; i < this.options.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.clientWidth,
                y: Math.random() * this.canvas.clientHeight,
                size: Math.random() * this.options.particleSize + 1,
                speedX: (Math.random() - 0.5) * this.options.speed,
                speedY: (Math.random() - 0.5) * this.options.speed,
                color: this.generateParticleColor(),
                opacity: Math.random() * 0.5 + 0.3,
                hovered: false,
                life: 1.0 // Pour les particules de trace de mouvement
            });
        }
    }

    /**
     * Génère une couleur légèrement variée pour chaque particule
     */
    generateParticleColor() {
        // Si la couleur est au format hexadécimal, la convertir en RGB
        let r, g, b;
        
        if (this.options.particleColor.startsWith('#')) {
            const hex = this.options.particleColor.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (this.options.particleColor.startsWith('rgb')) {
            const rgb = this.options.particleColor.match(/\d+/g);
            r = parseInt(rgb[0]);
            g = parseInt(rgb[1]);
            b = parseInt(rgb[2]);
        } else {
            // Couleur par défaut si le format n'est pas reconnu
            r = 100;
            g = 255;
            b = 218;
        }
        
        // Ajouter une petite variation
        const variation = 30;
        r = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * variation));
        g = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * variation));
        b = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * variation));
        
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }

    /**
     * Met en place les écouteurs d'événements
     */
    setupEventListeners() {
        // Gérer les événements de souris
        if (this.touchMode) {
            this.canvas.addEventListener('touchmove', this.handleTouch.bind(this), { passive: true });
            this.canvas.addEventListener('touchend', () => {
                this.mousePosition = { x: null, y: null };
            });
        } else {
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseleave', () => {
                this.mousePosition = { x: null, y: null };
            });
        }

        // Observer la visibilité pour économiser les ressources
        this.setupVisibilityObserver();
    }

    /**
     * Gère les mouvements de souris
     */
    handleMouseMove(event) {
        const now = Date.now();
        
        // Stocker la position actuelle de la souris
        this.lastMousePosition = { ...this.mousePosition };
        this.mousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        
        // Calculer la vitesse de mouvement de la souris (vecteur delta)
        if (this.lastMousePosition.x !== null) {
            this.mouseSpeed = {
                x: this.mousePosition.x - this.lastMousePosition.x,
                y: this.mousePosition.y - this.lastMousePosition.y
            };
        }
        
        // Créer des particules sur la trace du mouvement si actif
        if (this.motionTrailsEnabled && now - this.lastThrottleTime > 16) {
            this.lastThrottleTime = now;
            this.createMotionTrail();
        }
    }

    /**
     * Gère les événements tactiles
     */
    handleTouch(event) {
        event.preventDefault();
        const touch = event.touches[0];
        
        // Stocker la position actuelle du toucher
        this.lastMousePosition = { ...this.mousePosition };
        this.mousePosition = {
            x: touch.clientX,
            y: touch.clientY
        };
        
        // Calculer la vitesse du mouvement
        if (this.lastMousePosition.x !== null) {
            this.mouseSpeed = {
                x: this.mousePosition.x - this.lastMousePosition.x,
                y: this.mousePosition.y - this.lastMousePosition.y
            };
        }
        
        // Créer des particules sur la trace du mouvement
        if (this.motionTrailsEnabled) {
            this.createMotionTrail();
        }
    }

    /**
     * Crée une trace de particules suivant le mouvement de la souris
     */
    createMotionTrail() {
        // Ne pas créer de traces si la souris ne se déplace pas assez vite
        const mouseSpeed = Math.sqrt(
            this.mouseSpeed.x * this.mouseSpeed.x + 
            this.mouseSpeed.y * this.mouseSpeed.y
        );
        
        if (mouseSpeed < 3) return;
        
        // Calculer le nombre de particules à créer en fonction de la vitesse
        const particlesToCreate = Math.min(5, Math.floor(mouseSpeed / 5));
        
        // Remplacer certaines particules existantes par des particules de trace
        for (let i = 0; i < particlesToCreate; i++) {
            // Trouver une particule à remplacer
            const particleIndex = Math.floor(Math.random() * this.particles.length);
            
            // Position légèrement aléatoire autour du curseur
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            
            // Remplacer la particule
            this.particles[particleIndex] = {
                x: this.mousePosition.x + offsetX,
                y: this.mousePosition.y + offsetY,
                size: Math.random() * this.options.particleSize * 2 + 1,
                speedX: this.mouseSpeed.x * 0.1 * (Math.random() - 0.5),
                speedY: this.mouseSpeed.y * 0.1 * (Math.random() - 0.5),
                color: this.generateParticleColor(),
                opacity: 0.8,
                hovered: true,
                life: 1.0
            };
        }
    }

    /**
     * Configure un observateur pour détecter si le canvas est visible
     */
    setupVisibilityObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Canvas visible, démarrer l'animation
                        if (!this.isActive) {
                            this.isActive = true;
                            this.animate();
                        }
                    } else {
                        // Canvas non visible, arrêter l'animation
                        this.isActive = false;
                        if (this.rafId) {
                            cancelAnimationFrame(this.rafId);
                            this.rafId = null;
                        }
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(this.canvas);
        }
        
        // Observer aussi la visibilité du document
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
                if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                    this.rafId = null;
                }
            } else {
                this.isActive = true;
                if (!this.rafId) {
                    this.animate();
                }
            }
        });
    }

    /**
     * Ajuste les performances en fonction du FPS
     */
    adjustPerformance() {
        const now = performance.now();
        this.framesCount++;
        
        // Calculer le FPS toutes les secondes
        if (now - this.lastFpsUpdateTime > 1000) {
            this.fps = this.framesCount;
            this.framesCount = 0;
            this.lastFpsUpdateTime = now;
            
            // Ajuster les paramètres si le FPS est trop bas
            if (this.options.adaptivePerformance && now - this.lastPerformanceAdjustTime > 5000) {
                this.lastPerformanceAdjustTime = now;
                
                if (this.fps < 30 && this.particles.length > 20) {
                    // Réduire le nombre de particules de 10%
                    const reduceCount = Math.ceil(this.particles.length * 0.1);
                    this.particles.splice(0, reduceCount);
                    this.options.connectionThreshold *= 0.9;
                    console.log(`Performances adaptées: ${this.particles.length} particules, FPS: ${this.fps}`);
                } else if (this.fps > 55 && this.particles.length < this.options.maxParticles) {
                    // Augmenter le nombre de particules si le FPS est bon
                    const increaseCount = Math.min(5, this.options.maxParticles - this.particles.length);
                    for (let i = 0; i < increaseCount; i++) {
                        this.particles.push({
                            x: Math.random() * this.canvas.clientWidth,
                            y: Math.random() * this.canvas.clientHeight,
                            size: Math.random() * this.options.particleSize + 1,
                            speedX: (Math.random() - 0.5) * this.options.speed,
                            speedY: (Math.random() - 0.5) * this.options.speed,
                            color: this.generateParticleColor(),
                            opacity: Math.random() * 0.5 + 0.3,
                            hovered: false,
                            life: 1.0
                        });
                    }
                }
            }
        }
    }

    /**
     * Fonction d'animation principale
     */
    animate() {
        if (!this.isActive) return;
        
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        
        // Mettre à jour et dessiner les particules
        this.updateParticles();
        
        // Dessiner les connexions entre particules
        this.drawConnections();
        
        // Ajuster les performances si nécessaire
        this.adjustPerformance();
        
        // Continuer l'animation
        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Met à jour et dessine les particules
     */
    updateParticles() {
        this.particles.forEach((particle, index) => {
            // Mettre à jour la position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Gérer les rebonds sur les bords
            if (particle.x > this.canvas.clientWidth) {
                particle.x = 0;
            } else if (particle.x < 0) {
                particle.x = this.canvas.clientWidth;
            }
            
            if (particle.y > this.canvas.clientHeight) {
                particle.y = 0;
            } else if (particle.y < 0) {
                particle.y = this.canvas.clientHeight;
            }
            
            // Gérer les particules de traces de mouvement
            if (particle.life < 1.0) {
                particle.life *= this.particleDecay;
                particle.opacity = particle.life * 0.8;
                
                // Recréer la particule si sa vie est trop courte
                if (particle.life < 0.1) {
                    this.particles[index] = {
                        x: Math.random() * this.canvas.clientWidth,
                        y: Math.random() * this.canvas.clientHeight,
                        size: Math.random() * this.options.particleSize + 1,
                        speedX: (Math.random() - 0.5) * this.options.speed,
                        speedY: (Math.random() - 0.5) * this.options.speed,
                        color: this.generateParticleColor(),
                        opacity: Math.random() * 0.5 + 0.3,
                        hovered: false,
                        life: 1.0
                    };
                    return;
                }
            }
            
            // Interagir avec la souris
            if (this.mousePosition.x !== null && this.mousePosition.y !== null) {
                // Calculer la distance entre la particule et la souris
                const dx = this.mousePosition.x - particle.x;
                const dy = this.mousePosition.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Si la particule est dans le rayon d'influence de la souris
                if (distance < this.options.responsiveness) {
                    // Marquer la particule comme survolée
                    particle.hovered = true;
                    
                    // Calculer la direction de répulsion/attraction
                    const angle = Math.atan2(dy, dx);
                    const force = (this.options.responsiveness - distance) / this.options.responsiveness;
                    
                    // Appliquer une force à la particule (répulsion)
                    particle.speedX -= Math.cos(angle) * force * this.options.interactionForce * 0.01;
                    particle.speedY -= Math.sin(angle) * force * this.options.interactionForce * 0.01;
                } else {
                    particle.hovered = false;
                }
            } else {
                particle.hovered = false;
            }
            
            // Limiter la vitesse
            const maxSpeed = this.options.speed * 2;
            particle.speedX = Math.max(-maxSpeed, Math.min(maxSpeed, particle.speedX));
            particle.speedY = Math.max(-maxSpeed, Math.min(maxSpeed, particle.speedY));
            
            // Dessiner la particule
            this.ctx.beginPath();
            this.ctx.arc(
                particle.x, 
                particle.y, 
                particle.hovered ? particle.size * 1.5 : particle.size, 
                0, 
                Math.PI * 2
            );
            
            // Couleur de la particule avec opacité
            this.ctx.fillStyle = particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.opacity})`);
            this.ctx.fill();
            
            // Ajouter un halo pour les particules survolées
            if (particle.hovered) {
                this.ctx.beginPath();
                this.ctx.arc(
                    particle.x, 
                    particle.y, 
                    particle.size * 2, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fillStyle = particle.color.replace('rgb', 'rgba').replace(')', ', 0.1)');
                this.ctx.fill();
            }
        });
    }

    /**
     * Dessine les connexions entre particules proches
     */
    drawConnections() {
        // Ne pas dessiner les connexions en mode basse performance
        if (this.isLowPowerMode && this.isMobile) return;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle1 = this.particles[i];
                const particle2 = this.particles[j];
                
                // Calculer la distance entre les particules
                const dx = particle1.x - particle2.x;
                const dy = particle1.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Si les particules sont assez proches, dessiner une connexion
                if (distance < this.options.connectionThreshold) {
                    // Calculer l'opacité en fonction de la distance
                    const opacity = (1 - distance / this.options.connectionThreshold) * this.options.connectionOpacity;
                    
                    // Dessiner la ligne
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle1.x, particle1.y);
                    this.ctx.lineTo(particle2.x, particle2.y);
                    this.ctx.strokeStyle = this.options.connectionColor.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        // Arrêter l'animation
        this.isActive = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        // Retirer les écouteurs d'événements
        if (this.touchMode) {
            this.canvas.removeEventListener('touchmove', this.handleTouch);
        } else {
            document.removeEventListener('mousemove', this.handleMouseMove);
        }
        
        // Effacer le canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

/**
 * Initialiser l'effet lorsque la page est chargée
 */
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que tous les éléments soient chargés
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Initialiser le système de particules interactives
            const particles = new InteractiveParticles({
                canvasId: 'particles-canvas',
                maxParticles: window.innerWidth < 768 ? 50 : 100, // Moins de particules sur mobile
                particleColor: '#64ffda',
                connectionThreshold: window.innerWidth < 768 ? 100 : 150
            });
            
            // Enregistrer pour nettoyage si HomepageAnimations existe
            if (window.HomepageAnimations) {
                window.HomepageAnimations.registerAnimation({
                    cleanup: () => particles.cleanup()
                });
            }
        }, 500); // Léger délai pour s'assurer que tout est prêt
    });
});
