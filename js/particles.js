/**
 * Animation de particules interactive
 * Crée un effet visuel immersif dans les sections hero et header
 */

// Initialiser au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    // Initialiser les particules pour la page d'accueil
    if (document.getElementById('particles-canvas')) {
        initParticles('particles-canvas');
    }
    
    // Initialiser les particules pour le header de la page projets
    if (document.getElementById('header-particles')) {
        initHeaderParticles('header-particles');
    }
});

/**
 * Initialise l'animation de particules pour la page d'accueil
 * @param {string} canvasId - ID de l'élément canvas
 */
function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Adapter la taille du canvas à son conteneur
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    // Appeler au chargement et au redimensionnement
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Configuration des particules
    const particlesConfig = {
        count: calculateParticleCount(),
        color: '#3b82f6',
        radius: { min: 1, max: 3 },
        speed: { min: 0.5, max: 1.5 },
        connectionDistance: 150,
        lineWidth: 0.5,
        lineColor: 'rgba(59, 130, 246, 0.15)'
    };
    
    // Calculer le nombre de particules en fonction de la taille de l'écran
    function calculateParticleCount() {
        const width = window.innerWidth;
        if (width < 576) return 50;
        if (width < 992) return 80;
        return 120;
    }
    
    // Créer un tableau de particules
    let particles = [];
    
    // Classe Particule
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * particlesConfig.speed.max;
            this.vy = (Math.random() - 0.5) * particlesConfig.speed.max;
            this.radius = Math.random() * (particlesConfig.radius.max - particlesConfig.radius.min) + particlesConfig.radius.min;
            this.color = particlesConfig.color;
            this.opacity = Math.random() * 0.5 + 0.2;
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
            
            // Rebondir sur les bords
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }
    }
    
    // Initialiser les particules
    function initParticlesArray() {
        particles = [];
        for (let i = 0; i < particlesConfig.count; i++) {
            particles.push(new Particle());
        }
    }
    
    // Dessiner les connexions entre particules proches
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < particlesConfig.connectionDistance) {
                    // Opacité basée sur la distance
                    let opacity = 1 - distance / particlesConfig.connectionDistance;
                    
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.15})`;
                    ctx.lineWidth = particlesConfig.lineWidth;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Variables pour l'interaction à la souris
    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;
    let mouseTimeout;
    
    // Suivre la position de la souris
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseMoving = true;
        
        // Réinitialiser le timeout à chaque mouvement
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    });
    
    // Effet d'attraction/répulsion à la souris
    function applyMouseEffect() {
        if (!isMouseMoving) return;
        
        const mouseRadius = 100; // Rayon d'influence
        const mouseStrength = 3; // Force de l'effet
        
        particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouseRadius) {
                // Force inversement proportionnelle à la distance
                const force = (mouseRadius - distance) / mouseRadius;
                
                // Effet répulsif (négatif)
                particle.vx -= (dx / distance) * force * mouseStrength * 0.05;
                particle.vy -= (dy / distance) * force * mouseStrength * 0.05;
            }
        });
    }
    
    // Animation des particules
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Mettre à jour et dessiner chaque particule
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Appliquer l'effet de la souris
        applyMouseEffect();
        
        // Dessiner les connexions
        drawConnections();
        
        requestAnimationFrame(animate);
    }
    
    // Démarrer l'animation
    initParticlesArray();
    animate();
    
    // Ajuster le nombre de particules lors du redimensionnement
    window.addEventListener('resize', () => {
        resizeCanvas();
        particlesConfig.count = calculateParticleCount();
        initParticlesArray();
    });
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
