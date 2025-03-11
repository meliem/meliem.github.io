// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter une classe au body pour indiquer que JavaScript est activé
    document.body.classList.add('js-enabled');
    
    // Solution de secours : s'assurer que tout le contenu est visible après 2 secondes
    // même si les animations ne se déclenchent pas correctement
    setTimeout(function() {
        document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
            el.classList.add('appear');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }, 2000);
    
    // Afficher la page après le chargement complet
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        // Initialiser les animations
        initAnimations();
        
        // Forcer l'affichage de tous les éléments après le chargement
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '1';
        });
    });

    // Initialiser la navigation
    initNavigation();
    
    // Initialiser l'effet de typage pour la section hero
    initTypingEffect();
    
    // Initialiser les animations des barres de compétence
    initSkillBars();
    
    // Initialiser les animations au scroll
    initScrollAnimations();
    
    // Initialiser l'effet de particules sur la section hero
    initParticles();
    
    // Initialiser le formulaire de contact
    initContactForm();
});

// Fonction pour initialiser la navigation
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    
    // Gestion du toggle menu pour mobile
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Fermer le menu après un clic sur un lien
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Changer le style de la navbar au scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Mettre en surbrillance le lien actif en fonction de la section visible
        highlightActiveLink();
    });
}

// Fonction pour mettre en évidence le lien de navigation actif
function highlightActiveLink() {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
}

// Fonction pour initialiser l'effet de typage
function initTypingEffect() {
    const typedTextElement = document.querySelector('.typed-text');
    const textArray = ['Developer', 'Data Engineer', 'Cybersecurity Specialist', 'Electronics Expert'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;
    let deletingDelay = 50;
    let newTextDelay = 2000;
    
    function type() {
        const currentText = textArray[textIndex];
        
        if (isDeleting) {
            typedTextElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = deletingDelay;
        } else {
            typedTextElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingDelay = newTextDelay;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % textArray.length;
        }
        
        setTimeout(type, typingDelay);
    }
    
    if (typedTextElement) {
        setTimeout(type, newTextDelay);
    }
}

// Fonction pour initialiser les animations des barres de compétence
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        bar.style.setProperty('--progress', `${progress}%`);
    });
}

// Fonction pour initialiser les animations au scroll
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .timeline-item, .skill-progress');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                
                if (entry.target.classList.contains('skill-progress')) {
                    entry.target.classList.add('animate');
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Fonction pour initialiser les animations
function initAnimations() {
    // Ajouter les classes d'animation aux éléments
    document.querySelectorAll('section').forEach((section, index) => {
        section.classList.add('fade-in');
        section.style.transitionDelay = `${index * 0.1}s`;
    });
    
    document.querySelectorAll('.about-img').forEach(el => {
        el.classList.add('fade-in-left');
    });
    
    document.querySelectorAll('.about-text').forEach(el => {
        el.classList.add('fade-in-right');
    });
    
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.classList.add('fade-in');
        item.style.transitionDelay = `${index * 0.1}s`;
    });
    
    document.querySelectorAll('.project-card').forEach((card, index) => {
        card.classList.add('scale-in');
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    document.querySelectorAll('.skill-category').forEach((category, index) => {
        category.classList.add('fade-in');
        category.style.transitionDelay = `${index * 0.1}s`;
    });
    
    document.querySelectorAll('.competition-card').forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Fonction pour initialiser l'effet de particules
function initParticles() {
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        heroSection.appendChild(particlesContainer);
        
        for (let i = 0; i < 50; i++) {
            createParticle(particlesContainer);
        }
    }
}

// Fonction pour créer une particule
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Taille aléatoire
    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Position aléatoire
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    
    // Animation aléatoire
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 5;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    
    container.appendChild(particle);
}

// Fonction pour initialiser le formulaire de contact
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Simuler l'envoi du formulaire
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Changer le texte du bouton pendant la "soumission"
            submitButton.textContent = 'Envoi en cours...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                // Simuler une réponse réussie
                alert('Message envoyé avec succès! (Simulation pour la démonstration)');
                
                // Réinitialiser le formulaire
                contactForm.reset();
                
                // Restaurer le bouton
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        });
    }
}

// Fonction pour le bouton télécharger CV
document.getElementById('download-cv')?.addEventListener('click', function(e) {
    e.preventDefault();
    alert('Le CV sera disponible au téléchargement dans la version finale du site.');
});

// Fonction pour gérer le clic sur le bouton "retour en haut"
document.querySelector('.back-to-top a')?.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
