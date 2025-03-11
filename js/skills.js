/**
 * Animations et interactions pour la page Compétences
 * Graphiques, visualisations et effets pour mettre en valeur les expertises
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le graphique radar des compétences
    initSkillsRadarChart();
    
    // Initialiser les barres de progression
    initProgressBars();
    
    // Initialiser les animations au scroll
    initScrollAnimations();
    
    // Initialiser les sphères de compétences interactives
    initSkillSpheres();
    
    // Initialiser le slider des certifications
    initCertificationsSlider();
    
    // Initialiser les animations GSAP si disponible
    if (typeof gsap !== 'undefined') {
        initGsapAnimations();
    }
});

/**
 * Initialise le graphique radar pour visualiser les compétences principales
 */
function initSkillsRadarChart() {
    const canvas = document.getElementById('skills-radar-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    // Données des compétences principales (sur 100)
    const skillsData = {
        labels: [
            'Data Engineering',
            'Développement',
            'Cybersécurité',
            'Électronique',
            'Cloud',
            'Machine Learning'
        ],
        datasets: [{
            label: 'Niveau de compétence',
            data: [85, 82, 78, 90, 75, 80],
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };
    
    // Options du graphique
    const options = {
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    }
                },
                ticks: {
                    backdropColor: 'transparent',
                    color: 'rgba(255, 255, 255, 0.5)',
                    z: 100
                },
                suggestedMin: 0,
                suggestedMax: 100
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1e293b',
                bodyColor: '#1e293b',
                bodyFont: {
                    family: "'Inter', sans-serif"
                },
                padding: 12,
                boxPadding: 8,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `Niveau: ${context.parsed.r}/100`;
                    }
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };
    
    // Créer le graphique radar
    const skillsChart = new Chart(canvas, {
        type: 'radar',
        data: skillsData,
        options: options
    });
    
    // Animation au chargement
    animateChartOnLoad(skillsChart);
    
    // Fonction pour animer le chargement du graphique
    function animateChartOnLoad(chart) {
        const originalData = [...chart.data.datasets[0].data];
        chart.data.datasets[0].data = Array(originalData.length).fill(0);
        chart.update();
        
        // Animation progressive des valeurs
        let currentStep = 0;
        const totalSteps = 60; // ~1 seconde à 60fps
        
        const animationInterval = setInterval(() => {
            currentStep++;
            
            // Calculer les nouvelles valeurs
            const newData = originalData.map(value => {
                return (value * currentStep) / totalSteps;
            });
            
            // Mettre à jour le graphique
            chart.data.datasets[0].data = newData;
            chart.update('none'); // Mise à jour sans animation native
            
            // Arrêter l'animation une fois terminée
            if (currentStep >= totalSteps) {
                clearInterval(animationInterval);
            }
        }, 16); // ~60fps
    }
}

/**
 * Initialise les barres de progression des compétences
 */
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    // Fonction pour animer une barre de progression
    function animateProgressBar(bar) {
        const level = bar.getAttribute('data-level');
        bar.style.width = `${level}%`;
    }
    
    // Observer l'entrée des barres dans le viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressBar(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    // Observer chaque barre
    progressBars.forEach(bar => {
        observer.observe(bar);
    });
}

/**
 * Initialise les animations au scroll
 */
function initScrollAnimations() {
    // Animer les cartes de compétences
    const skillCards = document.querySelectorAll('.skill-card');
    
    // Observer l'entrée dans le viewport
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Animer avec un délai progressif selon la position
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index % 2 * 150); // Décalage pour les lignes
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    // Observer chaque carte
    skillCards.forEach(card => {
        observer.observe(card);
    });
    
    // Animation des titres au scroll
    const sectionHeaders = document.querySelectorAll('.section-header');
    
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                headerObserver.unobserve(entry.target);
                
                // Animer l'icône
                const icon = entry.target.querySelector('.section-icon');
                if (icon) {
                    icon.classList.add('animate-in');
                }
            }
        });
    }, { threshold: 0.5 });
    
    // Observer chaque titre de section
    sectionHeaders.forEach(header => {
        headerObserver.observe(header);
    });
    
    // Ajouter les styles pour les animations
    const style = document.createElement('style');
    style.textContent = `
        .section-header {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .section-header.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .section-icon {
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.8s ease, transform 0.8s ease;
            transition-delay: 0.3s;
        }
        
        .section-icon.animate-in {
            opacity: 1;
            transform: scale(1);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialise les sphères de compétences interactives
 */
function initSkillSpheres() {
    const container = document.getElementById('skill-spheres');
    const detailsPanel = document.querySelector('.skill-details-panel .panel-content');
    
    if (!container || !detailsPanel) return;
    
    // Données des compétences à afficher dans les sphères
    const skills = [
        { name: 'Python', level: 90, color: '#3776AB', category: 'dev', description: 'Utilisation avancée de Python pour le développement d\'applications, le traitement de données et le machine learning.', tools: ['Django', 'Flask', 'Pandas', 'NumPy', 'TensorFlow', 'Scikit-learn'] },
        { name: 'ETL', level: 85, color: '#E97627', category: 'data', description: 'Conception et optimisation de pipelines d\'extraction, transformation et chargement de données.', tools: ['Apache Spark', 'Airflow', 'Kafka', 'AWS Glue'] },
        { name: 'SQL', level: 85, color: '#336791', category: 'data', description: 'Maîtrise des bases de données relationnelles avec optimisation des requêtes et gestion de la performance.', tools: ['PostgreSQL', 'MySQL', 'SQLite', 'Query Optimization'] },
        { name: 'React', level: 75, color: '#61DAFB', category: 'dev', description: 'Développement d\'interfaces utilisateur modernes et réactives avec React.', tools: ['Redux', 'React Router', 'Hooks', 'Context API'] },
        { name: 'IDS', level: 85, color: '#D32F2F', category: 'cyber', description: 'Développement et configuration de systèmes de détection d\'intrusion avec algorithmes avancés.', tools: ['Machine Learning', 'Neural Networks', 'Snort', 'Suricata'] },
        { name: 'C++', level: 75, color: '#00599C', category: 'dev', description: 'Programmation C++ pour le développement d\'applications hautes performances et de systèmes embarqués.', tools: ['STL', 'Boost', 'Qt', 'Multi-threading'] },
        { name: 'NoSQL', level: 70, color: '#4DB33D', category: 'data', description: 'Utilisation de bases de données NoSQL pour les applications à forte scalabilité.', tools: ['MongoDB', 'Redis', 'Cassandra', 'DynamoDB'] },
        { name: 'Swift', level: 70, color: '#F05138', category: 'dev', description: 'Développement d\'applications iOS natives avec Swift et le framework UIKit/SwiftUI.', tools: ['UIKit', 'SwiftUI', 'Core Data', 'Firebase'] },
        { name: 'Cloud', level: 75, color: '#0089D6', category: 'infra', description: 'Déploiement et gestion d\'infrastructures cloud sur les principales plateformes.', tools: ['AWS', 'Azure', 'Docker', 'Kubernetes'] },
        { name: 'Hardware', level: 90, color: '#FF7043', category: 'elec', description: 'Réparation et diagnostic de composants électroniques au niveau circuit pour divers appareils.', tools: ['Soudure', 'Oscilloscope', 'Multimètre', 'Logic Analyzer'] },
        { name: 'Data Recovery', level: 85, color: '#66BB6A', category: 'elec', description: 'Récupération de données sur supports endommagés physiquement ou logiquement.', tools: ['HDD Recovery', 'SSD Recovery', 'Flash Recovery', 'File Carving'] },
        { name: 'Embedded', level: 80, color: '#FFA726', category: 'elec', description: 'Programmation de systèmes embarqués pour diverses applications, de l\'IoT aux systèmes industriels.', tools: ['Arduino', 'ESP32', 'Raspberry Pi', 'PLC'] }
    ];
    
    // Créer et positionner les sphères
    skills.forEach(skill => {
        createSkillSphere(skill);
    });
    
    // Fonction pour créer une sphère de compétence
    function createSkillSphere(skill) {
        const sphere = document.createElement('div');
        sphere.className = 'skill-sphere';
        sphere.textContent = skill.name;
        
        // Calculer la taille en fonction du niveau de compétence (60px à 90px)
        const size = 60 + ((skill.level - 50) / 50) * 30;
        
        // Appliquer le style
        sphere.style.width = `${size}px`;
        sphere.style.height = `${size}px`;
        sphere.style.backgroundColor = skill.color;
        sphere.style.color = 'white';
        sphere.style.fontSize = `${Math.max(size / 6, 12)}px`;
        
        // Stocker les données dans l'élément
        sphere.dataset.name = skill.name;
        sphere.dataset.level = skill.level;
        sphere.dataset.color = skill.color;
        sphere.dataset.category = skill.category;
        sphere.dataset.description = skill.description;
        sphere.dataset.tools = JSON.stringify(skill.tools);
        
        // Positionner aléatoirement (sera ajusté par la simulation)
        const containerRect = container.getBoundingClientRect();
        const randomX = Math.random() * (containerRect.width - size);
        const randomY = Math.random() * (containerRect.height - size);
        
        sphere.style.left = `${randomX}px`;
        sphere.style.top = `${randomY}px`;
        
        // Ajouter l'événement click pour afficher les détails
        sphere.addEventListener('click', () => {
            showSkillDetails(skill);
            highlightSphere(sphere);
        });
        
        // Ajouter au conteneur
        container.appendChild(sphere);
    }
    
    // Fonction pour afficher les détails d'une compétence
    function showSkillDetails(skill) {
        // Préparer les détails
        const tools = Array.isArray(skill.tools) ? skill.tools : JSON.parse(skill.tools);
        
        // Animation de transition
        detailsPanel.style.opacity = '0';
        
        setTimeout(() => {
            // Mettre à jour le contenu
            detailsPanel.innerHTML = `
                <h3 style="color: ${skill.color}">${skill.name}</h3>
                <div class="skill-meta">
                    <div class="skill-level-indicator">
                        <div class="level-bar">
                            <div class="level-fill" style="width: ${skill.level}%; background-color: ${skill.color}"></div>
                        </div>
                        <span>${skill.level}/100</span>
                    </div>
                    <div class="skill-category">${getCategoryName(skill.category)}</div>
                </div>
                <p>${skill.description}</p>
                <div class="tech-list">
                    <h4>Technologies et outils</h4>
                    <div class="tech-tags">
                        ${tools.map(tool => `<span>${tool}</span>`).join('')}
                    </div>
                </div>
            `;
            
            // Ajouter les styles spécifiques
            const style = document.createElement('style');
            style.textContent = `
                .skill-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                }
                
                .skill-level-indicator {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .level-bar {
                    width: 100px;
                    height: 8px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .level-fill {
                    height: 100%;
                    border-radius: 4px;
                    animation: fillBar 1s ease-out forwards;
                }
                
                .skill-category {
                    background-color: rgba(255, 255, 255, 0.1);
                    padding: 0.3rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                }
                
                @keyframes fillBar {
                    from { width: 0; }
                    to { width: ${skill.level}%; }
                }
            `;
            document.head.appendChild(style);
            
            // Afficher le contenu mis à jour
            detailsPanel.style.opacity = '1';
        }, 300);
    }
    
    // Fonction pour mettre en évidence la sphère sélectionnée
    function highlightSphere(selectedSphere) {
        // Réinitialiser toutes les sphères
        document.querySelectorAll('.skill-sphere').forEach(sphere => {
            sphere.style.boxShadow = '';
            sphere.style.zIndex = '1';
        });
        
        // Mettre en évidence la sphère sélectionnée
        selectedSphere.style.boxShadow = `0 0 20px 5px ${selectedSphere.dataset.color}`;
        selectedSphere.style.zIndex = '10';
    }
    
    // Fonction pour obtenir le nom complet de la catégorie
    function getCategoryName(categoryCode) {
        const categories = {
            'dev': 'Développement',
            'data': 'Data Engineering',
            'cyber': 'Cybersécurité',
            'elec': 'Électronique',
            'infra': 'Infrastructure'
        };
        
        return categories[categoryCode] || categoryCode;
    }
    
    // Simulation de physique simple pour éviter que les sphères se chevauchent
    simulatePhysics();
    
    function simulatePhysics() {
        const spheres = document.querySelectorAll('.skill-sphere');
        const containerRect = container.getBoundingClientRect();
        
        // Fonction pour vérifier la collision entre deux sphères
        function checkCollision(sphere1, sphere2) {
            const rect1 = sphere1.getBoundingClientRect();
            const rect2 = sphere2.getBoundingClientRect();
            
            const center1 = {
                x: rect1.left + rect1.width / 2,
                y: rect1.top + rect1.height / 2
            };
            
            const center2 = {
                x: rect2.left + rect2.width / 2,
                y: rect2.top + rect2.height / 2
            };
            
            const distance = Math.sqrt(
                Math.pow(center1.x - center2.x, 2) + 
                Math.pow(center1.y - center2.y, 2)
            );
            
            const minDistance = (rect1.width + rect2.width) / 2;
            
            return distance < minDistance;
        }
        
        // Ajuster les positions pour éviter les chevauchements
        for (let i = 0; i < 50; i++) { // Nombre d'itérations
            let moved = false;
            
            for (let a = 0; a < spheres.length; a++) {
                for (let b = a + 1; b < spheres.length; b++) {
                    if (checkCollision(spheres[a], spheres[b])) {
                        // Calculer le vecteur de répulsion
                        const rect1 = spheres[a].getBoundingClientRect();
                        const rect2 = spheres[b].getBoundingClientRect();
                        
                        const center1 = {
                            x: rect1.left + rect1.width / 2,
                            y: rect1.top + rect1.height / 2
                        };
                        
                        const center2 = {
                            x: rect2.left + rect2.width / 2,
                            y: rect2.top + rect2.height / 2
                        };
                        
                        // Calculer la direction de répulsion
                        const dx = center2.x - center1.x;
                        const dy = center2.y - center1.y;
                        
                        // Normaliser et appliquer le déplacement
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const minDistance = (rect1.width + rect2.width) / 2;
                        const overlap = minDistance - distance;
                        
                        if (overlap > 0) {
                            // Déplacer proportionnellement à la taille
                            const sphere1Weight = 1 - rect1.width / (rect1.width + rect2.width);
                            const sphere2Weight = 1 - sphere1Weight;
                            
                            const moveX = (dx / distance) * overlap;
                            const moveY = (dy / distance) * overlap;
                            
                            // Position actuelle
                            let x1 = parseFloat(spheres[a].style.left);
                            let y1 = parseFloat(spheres[a].style.top);
                            let x2 = parseFloat(spheres[b].style.left);
                            let y2 = parseFloat(spheres[b].style.top);
                            
                            // Appliquer le déplacement
                            spheres[a].style.left = `${x1 - moveX * sphere1Weight}px`;
                            spheres[a].style.top = `${y1 - moveY * sphere1Weight}px`;
                            spheres[b].style.left = `${x2 + moveX * sphere2Weight}px`;
                            spheres[b].style.top = `${y2 + moveY * sphere2Weight}px`;
                            
                            moved = true;
                        }
                    }
                }
                
                // Maintenir dans les limites du conteneur
                const rect = spheres[a].getBoundingClientRect();
                let x = parseFloat(spheres[a].style.left);
                let y = parseFloat(spheres[a].style.top);
                
                if (rect.left < containerRect.left) {
                    spheres[a].style.left = '0px';
                    moved = true;
                }
                
                if (rect.right > containerRect.right) {
                    spheres[a].style.left = `${containerRect.width - rect.width}px`;
                    moved = true;
                }
                
                if (rect.top < containerRect.top) {
                    spheres[a].style.top = '0px';
                    moved = true;
                }
                
                if (rect.bottom > containerRect.bottom) {
                    spheres[a].style.top = `${containerRect.height - rect.height}px`;
                    moved = true;
                }
            }
            
            // Si plus rien ne bouge, arrêter la simulation
            if (!moved) break;
        }
        
        // Sélectionner la première sphère par défaut après un court délai
        setTimeout(() => {
            const firstSphere = document.querySelector('.skill-sphere');
            if (firstSphere) {
                firstSphere.click();
            }
        }, 1000);
    }
    
    // Gérer le redimensionnement
    window.addEventListener('resize', () => {
        // Recalculer les positions
        const spheres = document.querySelectorAll('.skill-sphere');
        const containerRect = container.getBoundingClientRect();
        
        spheres.forEach(sphere => {
            const sphereRect = sphere.getBoundingClientRect();
            
            // Maintenir dans les limites du conteneur
            let x = parseFloat(sphere.style.left);
            let y = parseFloat(sphere.style.top);
            
            if (sphereRect.right > containerRect.right) {
                sphere.style.left = `${containerRect.width - sphereRect.width}px`;
            }
            
            if (sphereRect.bottom > containerRect.bottom) {
                sphere.style.top = `${containerRect.height - sphereRect.height}px`;
            }
        });
    });
}

/**
 * Initialise le slider des certifications
 */
function initCertificationsSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const certificationCards = document.querySelectorAll('.certification-card');
    
    if (!sliderTrack || !prevBtn || !nextBtn || certificationCards.length === 0) return;
    
    // Variables pour le slider
    let position = 0;
    const cardWidth = certificationCards[0].offsetWidth;
    const gap = parseInt(window.getComputedStyle(sliderTrack).columnGap);
    const visibleCards = Math.floor(sliderTrack.parentElement.offsetWidth / (cardWidth + gap));
    const maxPosition = certificationCards.length - visibleCards;
    
    // Définir le premier élément comme actif
    certificationCards[0].classList.add('active');
    
    // Fonction pour mettre à jour la position du slider
    function updateSliderPosition() {
        sliderTrack.style.transform = `translateX(-${position * (cardWidth + gap)}px)`;
        
        // Mettre à jour l'élément actif
        certificationCards.forEach((card, index) => {
            card.classList.toggle('active', index === position);
        });
        
        // Mettre à jour l'état des boutons
        prevBtn.disabled = position <= 0;
        nextBtn.disabled = position >= maxPosition;
        
        // Mettre à jour l'apparence des boutons
        prevBtn.style.opacity = position <= 0 ? '0.5' : '1';
        nextBtn.style.opacity = position >= maxPosition ? '0.5' : '1';
    }
    
    // Événements des boutons
    prevBtn.addEventListener('click', () => {
        if (position > 0) {
            position--;
            updateSliderPosition();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (position < maxPosition) {
            position++;
            updateSliderPosition();
        }
    });
    
    // Initialiser la position
    updateSliderPosition();
    
    // Gérer le redimensionnement
    window.addEventListener('resize', () => {
        // Recalculer les dimensions
        const newCardWidth = certificationCards[0].offsetWidth;
        const newGap = parseInt(window.getComputedStyle(sliderTrack).columnGap);
        const newVisibleCards = Math.floor(sliderTrack.parentElement.offsetWidth / (newCardWidth + newGap));
        const newMaxPosition = certificationCards.length - newVisibleCards;
        
        // Mettre à jour les variables
        position = Math.min(position, newMaxPosition);
        
        // Mettre à jour la position
        updateSliderPosition();
    });
    
    // Défilement automatique
    let autoScrollInterval;
    
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            if (position < maxPosition) {
                position++;
            } else {
                position = 0;
            }
            updateSliderPosition();
        }, 5000);
    }
    
    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }
    
    // Démarrer le défilement automatique
    startAutoScroll();
    
    // Arrêter au survol
    sliderTrack.parentElement.addEventListener('mouseenter', stopAutoScroll);
    sliderTrack.parentElement.addEventListener('mouseleave', startAutoScroll);
    
    // Arrêter au toucher sur mobile
    sliderTrack.parentElement.addEventListener('touchstart', stopAutoScroll);
    sliderTrack.parentElement.addEventListener('touchend', startAutoScroll);
}

/**
 * Initialise les animations GSAP avancées
 */
function initGsapAnimations() {
    // Enregistrer les plugins
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // Effet de déroulement du titre
    const title = document.querySelector('.split-text');
    if (title) {
        // Animation du titre lettre par lettre
        const text = title.textContent;
        let html = '';
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                html += '<span>&nbsp;</span>';
            } else {
                html += `<span>${text[i]}</span>`;
            }
        }
        
        title.innerHTML = html;
        
        // Animer chaque lettre
        gsap.from(title.querySelectorAll('span'), {
            opacity: 0,
            y: 50,
            stagger: 0.05,
            duration: 0.5,
            ease: 'back.out'
        });
    }
    
    // Animation des cartes de navigation
    const navItems = document.querySelectorAll('.skill-nav-item');
    if (navItems.length > 0) {
        gsap.from(navItems, {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.skills-navigation',
                start: 'top 80%'
            }
        });
    }
    
    // Animation des sections au scroll
    const sections = document.querySelectorAll('.skills-section');
    sections.forEach(section => {
        // Animer l'entrée de la section
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });
    });
    
    // Animation de la section CTA
    const ctaSection = document.querySelector('.skills-cta');
    if (ctaSection) {
        gsap.from(ctaSection.querySelector('.cta-content'), {
            opacity: 0,
            y: 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: ctaSection,
                start: 'top 80%'
            }
        });
    }
}
