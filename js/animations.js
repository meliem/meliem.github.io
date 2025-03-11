// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les classes d'animation aux éléments appropriés
    addAnimationClasses();
    
    // Initialiser les observers pour les animations au scroll
    initScrollAnimations();
    
    // Animer les compétences lorsque la section est visible
    animateSkillsOnScroll();
    
    // Initialiser les animations de la timeline
    animateTimelineItems();
    
    // Initialiser l'animation des nombres pour les statistiques
    animateNumbers();
});

// Fonction pour ajouter les classes d'animation aux éléments
function addAnimationClasses() {
    // Section Hero
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('fade-in');
        // Ajouter des délais aux éléments enfants
        Array.from(heroContent.children).forEach((child, index) => {
            child.classList.add('fade-in');
            child.style.transitionDelay = `${0.3 + (index * 0.2)}s`;
        });
    }
    
    // Section À propos
    const aboutImg = document.querySelector('.about-img');
    const aboutText = document.querySelector('.about-text');
    if (aboutImg) aboutImg.classList.add('fade-in-left');
    if (aboutText) aboutText.classList.add('fade-in-right');
    
    // Ajouter animation aux éléments de la timeline
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.classList.add('fade-in');
        item.style.transitionDelay = `${index * 0.15}s`;
    });
    
    // Projets
    document.querySelectorAll('.project-card').forEach((card, index) => {
        card.classList.add('scale-in');
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Compétences
    document.querySelectorAll('.skills-category').forEach((category, index) => {
        category.classList.add('fade-in');
        category.style.transitionDelay = `${index * 0.2}s`;
    });
    
    // Kaggle
    document.querySelectorAll('.competition-card').forEach((card, index) => {
        card.classList.add('fade-in-right');
        card.style.transitionDelay = `${index * 0.15}s`;
    });
    
    // Contact
    const contactInfo = document.querySelector('.contact-info');
    const contactForm = document.querySelector('.contact-form');
    if (contactInfo) contactInfo.classList.add('fade-in-left');
    if (contactForm) contactForm.classList.add('fade-in-right');
}

// Fonction pour initialiser les animations au scroll
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Fonction pour animer les barres de compétence
function animateSkillsOnScroll() {
    const skillsSection = document.querySelector('.skills');
    const skillBars = document.querySelectorAll('.skill-progress');
    
    if (!skillsSection || !skillBars.length) return;
    
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            skillBars.forEach(bar => {
                const progress = bar.getAttribute('data-progress');
                bar.style.width = `${progress}%`;
                bar.classList.add('animate');
            });
            observer.unobserve(skillsSection);
        }
    }, {
        threshold: 0.2
    });
    
    observer.observe(skillsSection);
}

// Fonction pour animer les éléments de la timeline
function animateTimelineItems() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timelineItems.length) return;
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

// Fonction pour animer les nombres (pour les statistiques)
function animateNumbers() {
    const rankElements = document.querySelectorAll('.rank .highlight');
    
    if (!rankElements.length) return;
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const finalValue = parseInt(element.textContent);
                animateValue(element, 0, finalValue, 2000);
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.5
    });
    
    rankElements.forEach(element => {
        observer.observe(element);
    });
}

// Fonction pour animer la valeur d'un élément
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = timestamp => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Effet parallaxe pour l'arrière-plan de la section hero
window.addEventListener('scroll', function() {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrollPosition = window.scrollY;
        if (scrollPosition < window.innerHeight) {
            hero.style.backgroundPositionY = `${scrollPosition * 0.4}px`;
        }
    }
});

// Animation pour la navigation
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Animation des particules pour la section hero
(function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Créer le conteneur de particules s'il n'existe pas déjà
    let particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) {
        particlesContainer = document.createElement('div');
        particlesContainer.classList.add('particles');
        hero.appendChild(particlesContainer);
    }
    
    // Créer les particules
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Taille aléatoire
        const size = Math.random() * 6 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Position aléatoire
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Délai et durée d'animation aléatoires
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
        
        particlesContainer.appendChild(particle);
    }
})();

// Animation des cards au hover
(function initHoverAnimations() {
    // Animation des cartes de projet
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Animation des cartes de compétition
    const competitionCards = document.querySelectorAll('.competition-card');
    competitionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.backgroundColor = 'var(--primary-color)';
            this.style.color = 'white';
            
            // Changer la couleur des éléments internes
            const title = this.querySelector('h4');
            const date = this.querySelector('.date');
            const highlight = this.querySelector('.highlight');
            
            if (title) title.style.color = 'white';
            if (date) date.style.color = 'rgba(255, 255, 255, 0.8)';
            if (highlight) highlight.style.color = '#FFD700';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.backgroundColor = 'white';
            this.style.color = 'var(--text-color)';
            
            // Restaurer la couleur des éléments internes
            const title = this.querySelector('h4');
            const date = this.querySelector('.date');
            const highlight = this.querySelector('.highlight');
            
            if (title) title.style.color = 'var(--dark-color)';
            if (date) date.style.color = 'var(--text-light)';
            if (highlight) highlight.style.color = 'var(--primary-color)';
        });
    });
})();
