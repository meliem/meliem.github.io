/**
 * Animation de particules interactive optimisée
 * Crée un effet visuel immersif dans les sections hero et header
 * avec des optimisations de performance pour tous les appareils
 */

// Gestionnaire de performances pour les animations
const PerformanceManager = {
    // Détecter les capacités de l'appareil
    lowPowerMode: false,
    minFrameTime: 0, // Temps minimum entre les frames en ms (pour limiter le FPS)
    lastFrameTime: 0,
    active: true, // Indique si les animations sont actives
    animationLoops: [], // Référence aux boucles d'animation
    
    // Détecter les capacités du dispositif
    detectCapabilities: function() {
        // Vérifier si on est sur mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Vérifier si l'utilisateur préfère réduire les animations
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Détecter la puissance de l'appareil en fonction du nombre de cœurs logiques
        const cpuCores = navigator.hardwareConcurrency || 4;
        
        // Configuration basée sur les capacités
        if (prefersReducedMotion || (isMobile && cpuCores <= 4)) {
            this.lowPowerMode = true;
            this.minFrameTime = 50; // Environ 20 FPS max
        } else if (isMobile || cpuCores <= 4) {
            this.lowPowerMode = false;
            this.minFrameTime = 33; // Environ 30 FPS max
        } else {
            this.lowPowerMode = false;
            this.minFrameTime = 0; // Pas de limite
        }
    },
    
    // Vérifier si on peut animer cette frame
    canAnimate: function() {
        if (!this.active) return false;
        
        const now = performance.now();
        if (now - this.lastFrameTime < this.minFrameTime) return false;
        
        this.lastFrameTime = now;
        return true;
    },
    
    // Ajouter une boucle d'animation
    addAnimationLoop: function(loop) {
        this.animationLoops.push(loop);
    },
    
    // Arrêter toutes les animations
    stopAllAnimations: function() {
        this.active = false;
        this.animationLoops.forEach(loop => {
            if (typeof loop === 'number') {
                cancelAnimationFrame(loop);
            }
        });
        this.animationLoops = [];
    }
};

// Détecter les capacités de l'appareil
PerformanceManager.detectCapabilities();

// Configuration de la visibilité de la page
document.addEventListener('visibilitychange', () => {
    PerformanceManager.active = document.visibilityState === 'visible';
});

// Initialiser au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    try {
        // Initialiser les particules pour la page d'accueil
        if (document.getElementById('particles-canvas')) {
            initParticles('particles-canvas');
        }
        
        // Initialiser les particules pour le header de la page projets
        if (document.getElementById('header-particles')) {
            initHeaderParticles('header-particles');
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des particules:', error);
    }
    
    // Nettoyage lors de la navigation
    if (typeof AppState !== 'undefined') {
        const oldCleanup = AppState.removeAllEventListeners;
        AppState.removeAllEventListeners = function() {
            oldCleanup.call(AppState);
            PerformanceManager.stopAllAnimations();
        };
    }
});

/**
 * Initialise l'animation de particules pour la page d'accueil
 * Version optimisée pour réduire la consommation de ressources
 * @param {string} canvasId - ID de l'élément canvas
 */
function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    let isInViewport = true;
    
    // Détecter si le canvas est visible dans le viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isInViewport = entry.isIntersecting;
        });
    }, { threshold: 0.1 });
    
    observer.observe(canvas);
    
    // Adapter la taille du canvas à son conteneur avec debounce
    let resizeTimeout;
    function resizeCanvas() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            // Recréer les particules après le redimensionnement
            particlesConfig.count = calculateParticleCount();
            initParticlesArray();
        }, 250); // Delai de 250ms pour éviter les calculs excessifs
    }
    
    // Ajouter l'écouteur d'événement avec la gestion centralisée
    if (typeof AppState !== 'undefined') {
        AppState.addEventListeners(window, 'resize', resizeCanvas, { passive: true });
    } else {
        window.addEventListener('resize', resizeCanvas, { passive: true });
    }
    
    // Appeler au chargement
    resizeCanvas();
    
    // Configuration des particules optimisée selon les performances
    const particlesConfig = {
        count: calculateParticleCount(),
        color: '#3b82f6',
        radius: { min: 1, max: 3 },
        speed: { min: 0.2, max: 1.0 }, // Vitesse réduite pour économiser des ressources
        connectionDistance: PerformanceManager.lowPowerMode ? 100 : 150,
        lineWidth: 0.5,
        lineColor: 'rgba(59, 130, 246, 0.15)',
        skipConnectionsFrames: PerformanceManager.lowPowerMode ? 2 : 1 // Dessiner les connexions moins fréquemment en mode basse consommation
    };
    
    // Calculer le nombre de particules en fonction de la taille de l'écran et des performances
    function calculateParticleCount() {
        const width = window.innerWidth;
        const multiplier = PerformanceManager.lowPowerMode ? 0.5 : 1;
        
        if (width < 576) return Math.floor(30 * multiplier);
        if (width < 992) return Math.floor(50 * multiplier);
        return Math.floor(80 * multiplier);
    }
    
    // Créer un tableau de particules
    let particles = [];
    let frameCount = 0;
    
    // Classe Particule optimisée
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * particlesConfig.speed.max;
            this.vy = (Math.random() - 0.5) * particlesConfig.speed.max;
            this.radius = Math.random() * (particlesConfig.radius.max - particlesConfig.radius.min) + particlesConfig.radius.min;
            this.color = particlesConfig.color;
            this.opacity = Math.random() * 0.5 + 0.2;
            return this;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
            ctx.fill();
        }
        
        update() {
            // Mettre à jour la position
            this.x += this.vx;
            this.y += this.vy;
            
            // Rebondir sur les bords avec réutilisation des particules
            if (this.x < -50 || this.x > canvas.width + 50 || 
                this.y < -50 || this.y > canvas.height + 50) {
                // Réinitialiser plutôt que de simplement inverser la direction
                this.reset();
            } else {
                // Rebondir normalement sur les bords proches
                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
            }
        }
    }
    
    // Initialiser les particules avec réutilisation d'objets
    function initParticlesArray() {
        const targetCount = particlesConfig.count;
        
        // Si le tableau est vide, le remplir
        if (particles.length === 0) {
            for (let i = 0; i < targetCount; i++) {
                particles.push(new Particle());
            }
        }
        // Si nous avons besoin de plus de particules
        else if (particles.length < targetCount) {
            for (let i = particles.length; i < targetCount; i++) {
                particles.push(new Particle());
            }
        }
        // Si nous avons trop de particules, réduire le tableau
        else if (particles.length > targetCount) {
            particles = particles.slice(0, targetCount);
        }
    }
    
    // Dessiner les connexions entre particules proches (optimisé)
    function drawConnections() {
        // Sauter des frames pour réduire la charge CPU
        if (frameCount % particlesConfig.skipConnectionsFrames !== 0) return;
        
        // Batch drawing pour réduire les opérations sur le contexte
        ctx.beginPath();
        
        for (let i = 0; i < particles.length; i++) {
            // Optimisation: vérifier moins de particules en mode basse puissance
            const checkStep = PerformanceManager.lowPowerMode ? 2 : 1;
            
            for (let j = i + checkStep; j < particles.length; j += checkStep) {
                const p1 = particles[i];
                const p2 = particles[j];
                
                // Calcul optimisé de la distance (sans racine carrée quand possible)
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSquared = dx * dx + dy * dy;
                
                // Éviter la racine carrée quand possible pour améliorer les performances
                const connectionDistanceSquared = particlesConfig.connectionDistance * particlesConfig.connectionDistance;
                
                if (distSquared < connectionDistanceSquared) {
                    // Calculer la racine carrée seulement quand nécessaire
                    const distance = Math.sqrt(distSquared);
                    const opacity = 1 - distance / particlesConfig.connectionDistance;
                    
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.15})`;
                    ctx.lineWidth = particlesConfig.lineWidth;
                }
            }
        }
        
        ctx.stroke();
    }
    
    // Variables pour l'interaction à la souris
    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;
    let mouseTimeout;
    
    // Suivre la position de la souris avec la gestion centralisée d'événements
    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseMoving = true;
        
        // Réinitialiser le timeout à chaque mouvement
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    };
    
    // Ajouter l'écouteur d'événement
    if (typeof AppState !== 'undefined') {
        AppState.addEventListeners(canvas, 'mousemove', handleMouseMove);
    } else {
        canvas.addEventListener('mousemove', handleMouseMove);
    }
    
    // Effet d'attraction/répulsion à la souris (optimisé)
    function applyMouseEffect() {
        if (!isMouseMoving || PerformanceManager.lowPowerMode) return;
        
        const mouseRadius = 100; // Rayon d'influence
        const mouseStrength = 3; // Force de l'effet
        const mouseRadiusSquared = mouseRadius * mouseRadius;
        
        particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distSquared = dx * dx + dy * dy;
            
            if (distSquared < mouseRadiusSquared) {
                // Calculer la racine carrée seulement quand nécessaire
                const distance = Math.sqrt(distSquared);
                const force = (mouseRadius - distance) / mouseRadius;
                
                // Effet répulsif (négatif) avec intensité réduite
                particle.vx -= (dx / distance) * force * mouseStrength * 0.03;
                particle.vy -= (dy / distance) * force * mouseStrength * 0.03;
            }
        });
    }
    
    // Animation des particules optimisée
    function animate() {
        // Vérifier si l'animation doit être exécutée
        if (!PerformanceManager.canAnimate() || !isInViewport) {
            animationFrameId = requestAnimationFrame(animate);
            PerformanceManager.addAnimationLoop(animationFrameId);
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frameCount++;
        
        // Mettre à jour et dessiner chaque particule
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Appliquer l'effet de la souris (seulement si nécessaire)
        applyMouseEffect();
        
        // Dessiner les connexions (optimisé)
        drawConnections();
        
        animationFrameId = requestAnimationFrame(animate);
        PerformanceManager.addAnimationLoop(animationFrameId);
    }
    
    // Démarrer l'animation
    initParticlesArray();
    animate();
    
    // Fonction de nettoyage
    function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        observer.disconnect();
        clearTimeout(resizeTimeout);
        clearTimeout(mouseTimeout);
        
        // Supprimer les références pour le garbage collector
        particles = [];
    }
    
    // Exposer la fonction de nettoyage
    return {
        cleanup: cleanup
    };
}

/**
 * Initialise l'animation de particules pour le header de la page projets
 * Utilise une approche différente avec un effet de connexion plus intense
 * @param {string} containerId - ID du conteneur pour les particules
 */
function initHeaderParticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Créer le canvas
    const canvas = document.createElement('canvas');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Configuration
    const config = {
        particleCount: calculateParticleCount(),
        particleColor: '#60a5fa',
        lineColor: '#3b82f6',
        particleRadius: 2,
        lineWidth: 1,
        maxSpeed: 0.7,
        interactionRadius: 100,
        connectionDistance: 140
    };
    
    // Calculer le nombre de particules en fonction de la taille
    function calculateParticleCount() {
        const width = window.innerWidth;
        if (width < 576) return 40;
        if (width < 992) return 60;
        return 80;
    }
    
    // Tableau de particules
    let particles = [];
    
    // Classe Particule avec plus d'effets
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1 + 1;
            
            // Vitesse plus variée
            this.speedX = (Math.random() - 0.5) * config.maxSpeed;
            this.speedY = (Math.random() - 0.5) * config.maxSpeed;
            
            // Couleur avec variation
            const hue = 220 + Math.random() * 20; // Tons de bleu
            this.color = `hsl(${hue}, 80%, 60%)`;
            
            // Pulsation
            this.pulseFactor = Math.random() * 0.05 + 0.01;
            this.pulseDirection = Math.random() > 0.5 ? 1 : -1;
            this.pulseValue = 0;
            
            // Opacité variable
            this.baseOpacity = Math.random() * 0.5 + 0.3;
            this.opacity = this.baseOpacity;
        }
        
        update() {
            // Mouvement
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Rebondir sur les bords
            if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
            if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
            
            // Effet de pulsation
            this.pulseValue += this.pulseFactor * this.pulseDirection;
            if (Math.abs(this.pulseValue) > 1) {
                this.pulseDirection *= -1;
            }
            
            // Taille et opacité pulsantes
            const pulseFactor = 1 + this.pulseValue * 0.2;
            this.currentSize = this.size * pulseFactor;
            this.opacity = this.baseOpacity * pulseFactor;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // Initialiser les particules
    function init() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Dessiner les connections
    function connect() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    // Opacité basée sur la distance
                    const opacity = 1 - distance / config.connectionDistance;
                    
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.5})`;
                    ctx.lineWidth = config.lineWidth * opacity;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Variables pour l'interaction
    let mouse = {
        x: null,
        y: null,
        radius: config.interactionRadius
    };
    
    // Écouter les mouvements de souris
    container.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });
    
    container.addEventListener('mouseleave', function() {
        mouse.x = undefined;
        mouse.y = undefined;
    });
    
    // Gérer l'interaction avec la souris
    function handleMouseInteraction() {
        if (mouse.x === undefined || mouse.y === undefined) return;
        
        particles.forEach(particle => {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // Ajouter une accélération dans la direction opposée à la souris
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                
                // Appliquer la force
                particle.speedX -= forceDirectionX * force * 0.5;
                particle.speedY -= forceDirectionY * force * 0.5;
                
                // Augmenter temporairement l'opacité
                particle.opacity = Math.min(1, particle.baseOpacity + force * 0.5);
            }
        });
    }
    
    // Animation
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Mettre à jour et dessiner les particules
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Gérer l'interaction avec la souris
        handleMouseInteraction();
        
        // Dessiner les connexions
        connect();
        
        requestAnimationFrame(animate);
    }
    
    // Redimensionner le canvas
    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        init();
    }
    
    window.addEventListener('resize', resize);
    
    // Initialiser et démarrer l'animation
    init();
    animate();
}
