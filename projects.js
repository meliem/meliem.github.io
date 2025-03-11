// Données des projets
const projects = [
    {
        id: 1,
        title: "IDS avec détection par réseau neuronal",
        category: "cyber",
        image: "assets/img/projects/ids.jpg",
        description: "Développement d'un système de détection d'intrusion utilisant des réseaux neuronaux. Basé sur le dataset UNB CICIDS2017 pour la détection de menaces en temps réel.",
        technologies: ["Python", "TensorFlow", "Scikit-learn", "Pandas"],
        github: "#",
        demo: "#"
    },
    {
        id: 2,
        title: "Analyse de résistance des matériaux (Mohs Hardness)",
        category: "data",
        image: "assets/img/projects/mohs.jpg",
        description: "Projet Kaggle (49e/1632) - Modèle de régression pour prédire la dureté des matériaux selon l'échelle de Mohs en fonction de leurs propriétés physiques et chimiques.",
        technologies: ["Python", "Scikit-learn", "XGBoost", "Feature Engineering"],
        github: "#",
        demo: "https://www.kaggle.com/kgrou0"
    },
    {
        id: 3,
        title: "Système GTC pour l'Institut Polaire Français",
        category: "electronics",
        image: "assets/img/projects/gtc.jpg",
        description: "Développement d'une Gestion Technique Centralisée provisoire pour le contrôle et la surveillance des équipements techniques de l'Institut Polaire Français.",
        technologies: ["Automatisme", "Capteurs", "Instrumentation", "Supervision"],
        github: "#",
        demo: "#"
    },
    {
        id: 4,
        title: "IA pour les échecs efficiente (FIDE & Google)",
        category: "data",
        image: "assets/img/projects/chess.jpg",
        description: "Développement d'une IA d'échecs optimisée pour une faible consommation de ressources. 120e sur 1120 participants dans la compétition FIDE & Google.",
        technologies: ["Python", "Algorithmes minimax", "Élagage alpha-bêta", "Optimisation"],
        github: "#",
        demo: "https://www.kaggle.com/kgrou0"
    },
    {
        id: 5,
        title: "Capture The Flag - DEFCON31",
        category: "cyber",
        image: "assets/img/projects/ctf.jpg",
        description: "Participation au CTF de l'AI Village à DEFCON31. 107e place sur 1344 participants. Résolution de défis en sécurité IA.",
        technologies: ["Sécurité IA", "Prompt Injection", "Model Jailbreaking", "Python"],
        github: "#",
        demo: "https://www.kaggle.com/kgrou0"
    },
    {
        id: 6,
        title: "Système de récupération de données",
        category: "electronics",
        image: "assets/img/projects/data_recovery.jpg",
        description: "Développement d'un système de récupération de données pour supports de stockage endommagés dans le cadre de mon activité auto-entrepreneur.",
        technologies: ["Hardware", "Électronique", "Forensique", "Récupération de données"],
        github: "#",
        demo: "#"
    },
    {
        id: 7,
        title: "Gestion de flotte avec Azure",
        category: "dev",
        image: "assets/img/projects/azure.jpg",
        description: "Mise en place d'une solution de gestion de flotte d'appareils avec Microsoft Azure et intégration Apple Business Manager.",
        technologies: ["Azure", "MDM", "Apple Business Manager", "REST API"],
        github: "#",
        demo: "#"
    },
    {
        id: 8,
        title: "Analyse de données IoT",
        category: "data",
        image: "assets/img/projects/iot.jpg",
        description: "Pipeline d'analyse pour données IoT industrielles. Collecte, traitement et visualisation de données de capteurs en temps réel.",
        technologies: ["Python", "Spark", "Kafka", "Tableau"],
        github: "#",
        demo: "#"
    }
];

// Fonction pour afficher les projets
function displayProjects(category = 'all') {
    const projectsGrid = document.getElementById('projects-grid');
    
    // Vider la grille
    projectsGrid.innerHTML = '';
    
    // Filtrer les projets selon la catégorie
    const filteredProjects = category === 'all' 
        ? projects 
        : projects.filter(project => project.category === category);
    
    // Créer et ajouter les cartes de projets
    filteredProjects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = `project-card ${project.category}`;
        
        // Ajouter les classes d'animation
        projectCard.classList.add('scale-in');
        
        const technologies = project.technologies.map(tech => `<span>${tech}</span>`).join('');
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-details">
                <div class="project-category">${getCategoryName(project.category)}</div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${technologies}
                </div>
                <div class="project-links">
                    <a href="${project.github}" target="_blank"><i class="fab fa-github"></i> Code</a>
                    <a href="${project.demo}" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>
                </div>
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    });
    
    // Initialiser les animations après avoir ajouté les projets
    initProjectAnimations();
}

// Fonction pour obtenir le nom complet de la catégorie
function getCategoryName(categoryCode) {
    const categories = {
        'data': 'Data Science',
        'dev': 'Développement',
        'cyber': 'Cybersécurité',
        'electronics': 'Électronique'
    };
    
    return categories[categoryCode] || categoryCode;
}

// Fonction pour initialiser les animations des projets
function initProjectAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        // Ajouter un délai basé sur l'index
        card.style.transitionDelay = `${index * 0.1}s`;
        
        // Observer l'élément pour l'animation au scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        
        observer.observe(card);
    });
}

// Initialiser les boutons de filtre
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Désactiver le bouton actif
            document.querySelector('.filter-btn.active').classList.remove('active');
            
            // Activer le bouton cliqué
            this.classList.add('active');
            
            // Filtrer les projets
            const category = this.getAttribute('data-filter');
            displayProjects(category);
        });
    });
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Afficher tous les projets au chargement initial
    displayProjects();
    
    // Initialiser les boutons de filtre
    initFilterButtons();
});

// Ajouter les classes CSS pour le style des technologies
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .project-tech {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .project-tech span {
            background-color: var(--light-color);
            color: var(--primary-color);
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.3rem 0.6rem;
            border-radius: 20px;
        }
    `;
    document.head.appendChild(style);
});
