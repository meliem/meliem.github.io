/**
 * Animations spécifiques à la page À propos
 * Gestion des animations au scroll, effets 3D et transitions interactives
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les animations GSAP si disponible
    if (typeof gsap !== 'undefined') {
        initGsapAnimations();
    }
    
    // Initialiser l'effet parallaxe pour le header
    initParallaxHeader();
    
    // Initialiser l'animation de la carte de profil
    initProfileCard();
    
    // Initialiser les animations des hexagones
    initHexagonAnimations();
    
    // Initialiser les animations au scroll
    initScrollAnimations();
    
    // Initialiser les animations des sections de passion
    initPassionItemsAnimations();
});

/**
 * Initialise les animations GSAP avancées
 */
function initGsapAnimations() {
    // Enregistrer les plugins
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // Animation du titre reveal
    const revealText = document.querySelector('.reveal-text');
    if (revealText) {
        gsap.fromTo(revealText, 
            { backgroundSize: "0% 100%" },
            { 
                backgroundSize: "100% 100%", 
                duration: 1.5, 
                ease: "power2.inOut" 
            }
        );
    }
    
    // Animation des sections de contenu
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach((section, index) => {
        gsap.fromTo(section, 
            { 
                opacity: 0, 
                y: 50 
            },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                delay: 0.2 * index,
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%"
                }
            }
        );
    });
    
    // Animation des éléments de philosophie
    const philosophyItems = document.querySelectorAll('.philosophy-item');
    gsap.fromTo(philosophyItems, 
        { 
            opacity: 0, 
            y: 50 
        },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.philosophy-grid',
                start: "top 80%"
            }
        }
    );
    
    // Animation de la citation
    const quote = document.querySelector('.philosophy-quote');
    if (quote) {
        gsap.fromTo(quote, 
            { 
                opacity: 0, 
                scale: 0.9 
            },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 1, 
                scrollTrigger: {
                    trigger: quote,
                    start: "top 80%"
                }
            }
        );
    }
    
    // Animation de la section CTA
    const cta = document.querySelector('.about-cta');
    if (cta) {
        gsap.fromTo(cta, 
            { 
                opacity: 0.5,
                y: 50 
            },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                scrollTrigger: {
                    trigger: cta,
                    start: "top 80%"
                }
            }
        );
    }
}

/**
 * Initialise l'effet parallaxe pour le header
 */
function initParallaxHeader() {
    const parallaxBg = document.querySelector('.parallax-bg');
    if (!parallaxBg) return;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        // Déplacer le fond à une vitesse différente pour créer l'effet parallaxe
        parallaxBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
    });
    
    // Animation du titre du header
    const headerContent = document.querySelector('.header-content');
    if (headerContent) {
        setTimeout(() => {
            headerContent.classList.add('animate-in');
        }, 300);
    }
    
    // Ajouter le style pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        .header-content {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 1s ease, transform 1s ease;
        }
        
        .header-content.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les animations pour la carte de profil
 */
function initProfileCard() {
    const profileCard = document.querySelector('.profile-card');
    if (!profileCard) return;
    
    // Ajouter l'animation d'entrée
    setTimeout(() => {
        profileCard.classList.add('animate-in');
    }, 500);
    
    // Effet de rotation 3D
    let isFlipped = false;
    profileCard.addEventListener('click', () => {
        isFlipped = !isFlipped;
        if (isFlipped) {
            profileCard.classList.add('flipped');
        } else {
            profileCard.classList.remove('flipped');
        }
    });
    
    // Effet de perspective au mouvement de souris
    profileCard.addEventListener('mousemove', (e) => {
        // Ne pas appliquer l'effet si la carte est retournée
        if (isFlipped) return;
        
        const rect = profileCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculer la position relative de la souris par rapport au centre
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        // Calculer l'angle de rotation (limité à +/- 10 degrés)
        const rotateX = (mouseY / (rect.height / 2)) * -10;
        const rotateY = (mouseX / (rect.width / 2)) * 10;
        
        // Appliquer la transformation (seulement à la face avant)
        const frontFace = profileCard.querySelector('.profile-card-front');
        frontFace.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Effet de "brillance" qui suit la souris
        const shine = profileCard.querySelector('.shine') || createShineElement(profileCard);
        const shineX = (mouseX / rect.width) * 100 + 50;
        const shineY = (mouseY / rect.height) * 100 + 50;
        shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)`;
    });
    
    // Réinitialiser la transformation lorsque la souris quitte la carte
    profileCard.addEventListener('mouseleave', () => {
        const frontFace = profileCard.querySelector('.profile-card-front');
        frontFace.style.transform = 'rotateX(0) rotateY(0)';
        
        const shine = profileCard.querySelector('.shine');
        if (shine) shine.style.background = 'none';
    });
    
    // Fonction pour créer l'élément de brillance
    function createShineElement(card) {
        const shine = document.createElement('div');
        shine.className = 'shine';
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 15px;
            pointer-events: none;
            z-index: 10;
        `;
        card.querySelector('.profile-card-front').appendChild(shine);
        return shine;
    }
    
    // Ajouter le style pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        .profile-card {
            opacity: 0;
            transform: translateY(50px);
        }
        
        .profile-card.animate-in {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 1s ease, transform 1s ease;
        }
        
        .profile-card-front {
            transition: transform 0.2s ease-out;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les animations pour les hexagones
 */
function initHexagonAnimations() {
    const hexIcons = document.querySelectorAll('.hex-icon');
    if (hexIcons.length === 0) return;
    
    // Animation au survol
    hexIcons.forEach(hex => {
        const parent = hex.closest('.philosophy-item');
        if (!parent) return;
        
        parent.addEventListener('mouseenter', () => {
            hex.style.transform = 'rotate(30deg) scale(1.1)';
            hex.style.backgroundColor = 'var(--accent-color)';
        });
        
        parent.addEventListener('mouseleave', () => {
            hex.style.transform = '';
            hex.style.backgroundColor = '';
        });
    });
    
    // Animation de pulsation continue
    hexIcons.forEach((hex, index) => {
        // Ajouter une animation de pulsation subtile
        hex.style.animation = `pulse ${2 + index * 0.2}s infinite alternate ease-in-out`;
    });
    
    // Ajouter le style pour l'animation
    const style = document.createElement('style');
    style.textContent = `
        .hex-icon {
            transition: transform 0.3s ease, background-color 0.3s ease;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            100% {
                transform: scale(1.05);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les animations déclenchées au scroll
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-reveal');
    
    // Créer un observateur pour les animations au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animer séquentiellement les enfants si nécessaire
                animateChildren(entry.target);
                
                // Arrêter d'observer une fois animé
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    });
    
    // Observer chaque élément
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Fonction pour animer séquentiellement les enfants d'un élément
    function animateChildren(parent) {
        // Vérifier s'il s'agit d'un élément qui nécessite une animation séquentielle
        if (parent.classList.contains('passion-items') || parent.classList.contains('philosophy-grid')) {
            const children = parent.children;
            Array.from(children).forEach((child, index) => {
                // Ajouter une classe pour l'animation avec délai progressif
                setTimeout(() => {
                    child.classList.add('child-visible');
                }, 100 * index);
            });
        }
    }
    
    // Ajouter le style pour l'animation des enfants
    const style = document.createElement('style');
    style.textContent = `
        .passion-items > *, .philosophy-grid > * {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .passion-items > *.child-visible, .philosophy-grid > *.child-visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les animations pour les éléments de passion
 */
function initPassionItemsAnimations() {
    const passionItems = document.querySelectorAll('.passion-item');
    if (passionItems.length === 0) return;
    
    // Animation au survol
    passionItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Animer l'icône
            const icon = item.querySelector('.passion-icon');
            if (icon) {
                icon.style.transform = 'rotate(15deg) scale(1.2)';
                icon.style.backgroundColor = 'var(--accent-color)';
            }
            
            // Animer le texte
            const title = item.querySelector('h3');
            if (title) {
                title.style.color = 'var(--primary-color)';
            }
            
            // Ajouter un effet de profondeur
            item.style.transform = 'translateY(-15px)';
            item.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
        });
        
        item.addEventListener('mouseleave', () => {
            // Restaurer l'icône
            const icon = item.querySelector('.passion-icon');
            if (icon) {
                icon.style.transform = '';
                icon.style.backgroundColor = '';
            }
            
            // Restaurer le texte
            const title = item.querySelector('h3');
            if (title) {
                title.style.color = '';
            }
            
            // Restaurer l'élément
            item.style.transform = '';
            item.style.boxShadow = '';
        });
    });
    
    // Ajouter le style pour les transitions
    const style = document.createElement('style');
    style.textContent = `
        .passion-item {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .passion-icon {
            transition: transform 0.3s ease, background-color 0.3s ease;
        }
        
        .passion-item h3 {
            transition: color 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}
