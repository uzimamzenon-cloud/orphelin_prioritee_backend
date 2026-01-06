// =====================================================================
// VARIABLES GLOBALES OPTIMISÉES
// =====================================================================
const CONFIG = {
    API_ENDPOINTS: {
        CONTACT: '/envoyer-contact/',
        NEWSLETTER: '/newsletter/'
    },
    CAROUSEL: {
        MAIN_INTERVAL: 5000,
        ABOUT_INTERVAL: 4000
    },
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 992
    }
};

let currentSlideIndex = 0;
let aboutCurrentSlideIndex = 0;
let isMobile = window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE;
let isSubmitting = false;
let carouselInterval = null;
let aboutCarouselInterval = null;

// Cache DOM
let DOM = {};

// =====================================================================
// INITIALISATION - CORRIGÉE POUR AFFICHAGE IMMÉDIAT
// =====================================================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Site initialisé');

    // Afficher immédiatement le contenu
    document.body.classList.remove('no-js');

    // Initialiser les éléments DOM
    cacheDOM();

    // Initialiser les composants
    initPreloader();
    initTheme();
    initCarousels();
    initForms();
    initEventListeners();

    // Optimisations initiales
    optimizeForMobile();

    console.log('✅ Site prêt');
});

// =====================================================================
// CACHE DOM - PLUS RAPIDE
// =====================================================================
function cacheDOM() {
    DOM = {
        // Preloader et structure
        preloader: document.getElementById('preloader'),
        body: document.body,

        // Navigation
        header: document.getElementById('header'),
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        navMenu: document.getElementById('navMenu'),
        navLinks: document.querySelectorAll('.nav-link'),
        backToTopBtn: document.getElementById('backToTop'),

        // Formulaire de contact
        contactForm: document.getElementById('contactForm'),

        // Carousels
        carouselTrack: document.getElementById('carouselTrack'),
        carouselPrev: document.getElementById('carouselPrev'),
        carouselNext: document.getElementById('carouselNext'),
        carouselIndicators: document.getElementById('carouselIndicators'),

        // Carousel "À propos"
        aboutCarouselTrack: document.getElementById('aboutCarouselTrack'),
        aboutCarouselIndicators: document.getElementById('aboutCarouselIndicators'),

        // Thème
        themeToggle: document.getElementById('themeToggle')
    };
}

// =====================================================================
// PRELOADER CORRIGÉ - AFFICHAGE IMMÉDIAT
// =====================================================================
function initPreloader() {
    if (!DOM.preloader) return;

    // Masquer rapidement sans attendre le chargement complet
    setTimeout(() => {
        DOM.preloader.style.transition = 'opacity 0.3s ease';
        DOM.preloader.style.opacity = '0';

        setTimeout(() => {
            if (DOM.preloader && DOM.preloader.parentNode) {
                DOM.preloader.style.display = 'none';
            }
        }, 300);
    }, 300);

    // Fallback si tout est déjà chargé
    if (document.readyState === 'complete') {
        if (DOM.preloader) {
            DOM.preloader.style.display = 'none';
        }
    }
}

// =====================================================================
// CAROUSELS CORRIGÉS
// =====================================================================
function initCarousels() {
    initMainCarousel();
    initAboutCarousel();
}

function initMainCarousel() {
    if (!DOM.carouselTrack || !window.carouselImages) return;

    renderMainCarousel();
    setupMainCarouselEvents();
    startMainCarousel();
}

function renderMainCarousel() {
    if (!DOM.carouselTrack || !DOM.carouselIndicators) return;

    // Nettoyer
    DOM.carouselTrack.innerHTML = '';
    DOM.carouselIndicators.innerHTML = '';

    // Créer les slides
    window.carouselImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.setAttribute('data-index', index);

        // Conteneur image
        const imgContainer = document.createElement('div');
        imgContainer.className = 'carousel-img-container';

        // Image
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.title || 'Image carousel';
        img.loading = 'lazy';

        img.onload = () => img.style.opacity = '1';
        img.onerror = () => {
            img.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = `<i class="fas fa-image"></i><p>${image.title || 'Image'}</p>`;
            imgContainer.appendChild(placeholder);
        };

        imgContainer.appendChild(img);
        slide.appendChild(imgContainer);

        // Légende
        if (image.title || image.description) {
            const caption = document.createElement('div');
            caption.className = 'carousel-caption';
            caption.innerHTML = `
                ${image.title ? `<h4>${image.title}</h4>` : ''}
                ${image.description ? `<p>${image.description}</p>` : ''}
            `;
            slide.appendChild(caption);
        }

        DOM.carouselTrack.appendChild(slide);

        // Indicateur
        const indicator = document.createElement('button');
        indicator.className = 'carousel-indicator';
        indicator.setAttribute('data-index', index);
        indicator.setAttribute('aria-label', `Aller à la diapositive ${index + 1}`);

        if (index === 0) {
            indicator.classList.add('active');
        }

        indicator.addEventListener('click', () => goToSlide(index));
        DOM.carouselIndicators.appendChild(indicator);
    });

    updateCarouselControls();
}

function initAboutCarousel() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection || !window.aboutImages || window.aboutImages.length === 0) return;

    // Créer le carousel si il n'existe pas
    let aboutCarouselTrack = document.getElementById('aboutCarouselTrack');
    let aboutCarouselIndicators = document.getElementById('aboutCarouselIndicators');

    if (!aboutCarouselTrack) {
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'about-carousel-container';

        aboutCarouselTrack = document.createElement('div');
        aboutCarouselTrack.id = 'aboutCarouselTrack';
        aboutCarouselTrack.className = 'about-carousel-track';

        aboutCarouselIndicators = document.createElement('div');
        aboutCarouselIndicators.id = 'aboutCarouselIndicators';
        aboutCarouselIndicators.className = 'about-carousel-indicators';

        carouselContainer.appendChild(aboutCarouselTrack);
        carouselContainer.appendChild(aboutCarouselIndicators);

        const aboutContent = aboutSection.querySelector('.about-content') || aboutSection;
        aboutContent.appendChild(carouselContainer);
    }

    renderAboutCarousel(aboutCarouselTrack, aboutCarouselIndicators);
    setupAboutCarouselEvents(aboutCarouselTrack, aboutCarouselIndicators);
    startAboutCarousel();
}

function renderAboutCarousel(track, indicators) {
    if (!track || !indicators || !window.aboutImages) return;

    track.innerHTML = '';
    indicators.innerHTML = '';

    window.aboutImages.forEach((imageUrl, index) => {
        const slide = document.createElement('div');
        slide.className = 'about-carousel-slide';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Image ${index + 1}`;
        img.loading = 'lazy';

        img.onerror = () => {
            img.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'about-image-placeholder';
            placeholder.innerHTML = `<i class="fas fa-image"></i><p>Image ${index + 1}</p>`;
            slide.appendChild(placeholder);
        };

        slide.appendChild(img);
        track.appendChild(slide);

        const indicator = document.createElement('button');
        indicator.className = 'about-carousel-indicator';
        indicator.setAttribute('data-index', index);

        if (index === 0) {
            indicator.classList.add('active');
        }

        indicator.addEventListener('click', () => goToAboutSlide(index));
        indicators.appendChild(indicator);
    });

    updateAboutCarouselForMobile();
}

// =====================================================================
// FORMULAIRE DE CONTACT - VERSION FONCTIONNELLE
// =====================================================================
function initForms() {
    initContactForm();
    initNewsletterForm();
}

function initContactForm() {
    if (!DOM.contactForm) {
        console.error('Formulaire de contact non trouvé');
        return;
    }

    console.log('✅ Formulaire de contact initialisé');

    // S'assurer que tous les champs existent
    const requiredFields = ['name', 'email', 'message'];
    const missingFields = requiredFields.filter(id => !document.getElementById(id));

    if (missingFields.length > 0) {
        console.error('❌ Champs manquants:', missingFields);
        return;
    }

    DOM.contactForm.addEventListener('submit', handleContactSubmit);
}

async function handleContactSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
        showToast('⏳ Un envoi est déjà en cours...', 'warning');
        return;
    }

    // Récupérer les données
    const formData = collectFormData();
    if (!formData) return;

    // Préparer l'interface
    const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    submitBtn.disabled = true;
    isSubmitting = true;

    try {
        // Envoyer les données
        const success = await sendContactData(formData);

        if (success) {
            DOM.contactForm.reset();
            showToast(`✅ Merci ${formData.nom}, votre message a été envoyé !`, 'success');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showToast('❌ Erreur lors de l\'envoi du message', 'error');
    } finally {
        // Restaurer le bouton
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        isSubmitting = false;
    }
}

function collectFormData() {
    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const subject = document.getElementById('subject')?.value.trim() || '';
    const reason = document.getElementById('reason')?.value || 'Information';
    const message = document.getElementById('message')?.value.trim() || '';

    // Validation
    if (!name || !email || !message) {
        showToast('❌ Veuillez remplir tous les champs obligatoires', 'error');
        return null;
    }

    if (!isValidEmail(email)) {
        showToast('❌ Adresse email invalide', 'error');
        return null;
    }

    return {
        nom: name,
        email: email,
        sujet: subject || "Sans sujet",
        motif: reason,
        message: message
    };
}

async function sendContactData(data) {
    try {
        const csrfToken = getCSRFToken();

        // Essayer d'abord avec FormData (recommandé pour Django)
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        if (csrfToken) formData.append('csrfmiddlewaretoken', csrfToken);

        const response = await fetch(CONFIG.API_ENDPOINTS.CONTACT, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (response.ok) {
            const result = await response.json();
            return result.success || result.message;
        }

        return false;
    } catch (error) {
        console.error('Erreur d\'envoi:', error);
        return false;
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// =====================================================================
// GESTION DES ÉVÉNEMENTS
// =====================================================================
function initEventListeners() {
    // Menu mobile
    if (DOM.mobileMenuBtn && DOM.navMenu) {
        DOM.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Back to top
    if (DOM.backToTopBtn) {
        DOM.backToTopBtn.addEventListener('click', scrollToTop);
    }

    // Navigation
    if (DOM.navLinks) {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
    }

    // Thème
    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', toggleTheme);
    }

    // Scroll
    window.addEventListener('scroll', handleScroll);

    // Resize
    window.addEventListener('resize', debounce(handleResize, 250));
}

function handleScroll() {
    // Header scroll effect
    if (DOM.header) {
        DOM.header.classList.toggle('scrolled', window.scrollY > 50);
    }

    // Back to top button
    if (DOM.backToTopBtn) {
        DOM.backToTopBtn.classList.toggle('active', window.scrollY > 300);
    }
}

function handleResize() {
    isMobile = window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE;
    optimizeForMobile();
    updateAboutCarouselForMobile();
}

// =====================================================================
// FONCTIONS UTILITAIRES
// =====================================================================
function toggleMobileMenu() {
    if (!DOM.navMenu || !DOM.mobileMenuBtn) return;

    const isExpanded = DOM.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    DOM.navMenu.classList.toggle('active');
    DOM.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);

    const icon = DOM.mobileMenuBtn.querySelector('i');
    if (icon) {
        icon.className = DOM.navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    }

    // Bloquer/débloquer le défilement
    DOM.body.style.overflow = DOM.navMenu.classList.contains('active') ? 'hidden' : '';
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleNavClick(e) {
    const targetId = this.getAttribute('href');
    if (!targetId || targetId === '#') return;

    e.preventDefault();

    // Fermer le menu mobile si ouvert
    if (isMobile && DOM.navMenu && DOM.navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }

    // Scroll vers la section
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// =====================================================================
// THÈME
// =====================================================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    showToast(`🌓 Mode ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'success');
}

function updateThemeIcon(theme) {
    if (!DOM.themeToggle) return;

    const icon = DOM.themeToggle.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// =====================================================================
// CAROUSEL FUNCTIONS
// =====================================================================
function goToSlide(index) {
    if (!window.carouselImages || index < 0 || index >= window.carouselImages.length) return;

    currentSlideIndex = index;

    if (DOM.carouselTrack) {
        const slides = DOM.carouselTrack.querySelectorAll('.carousel-slide');
        if (slides[index]) {
            if (isMobile) {
                DOM.carouselTrack.scrollTo({
                    left: slides[index].offsetLeft,
                    behavior: 'smooth'
                });
            } else {
                slides[index].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }

    updateCarouselControls();
}

function updateCarouselControls() {
    if (!DOM.carouselPrev || !DOM.carouselNext) return;

    DOM.carouselPrev.disabled = currentSlideIndex === 0;
    DOM.carouselNext.disabled = currentSlideIndex >= window.carouselImages.length - 1;

    // Mettre à jour les indicateurs
    if (DOM.carouselIndicators) {
        const indicators = DOM.carouselIndicators.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlideIndex);
        });
    }
}

function startMainCarousel() {
    if (carouselInterval) clearInterval(carouselInterval);
    if (!window.carouselImages || window.carouselImages.length <= 1) return;

    carouselInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % window.carouselImages.length;
        goToSlide(currentSlideIndex);
    }, CONFIG.CAROUSEL.MAIN_INTERVAL);
}

function goToAboutSlide(index) {
    if (!window.aboutImages || index < 0 || index >= window.aboutImages.length) return;

    aboutCurrentSlideIndex = index;

    const track = document.getElementById('aboutCarouselTrack');
    if (track) {
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    updateAboutCarouselIndicators();
}

function updateAboutCarouselIndicators() {
    const indicators = document.getElementById('aboutCarouselIndicators');
    if (!indicators) return;

    const indicatorElements = indicators.querySelectorAll('.about-carousel-indicator');
    indicatorElements.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === aboutCurrentSlideIndex);
    });
}

function updateAboutCarouselForMobile() {
    const track = document.getElementById('aboutCarouselTrack');
    if (!track) return;

    if (isMobile) {
        track.style.overflowX = 'auto';
        track.style.scrollSnapType = 'x mandatory';
        track.style.webkitOverflowScrolling = 'touch';

        const slides = track.querySelectorAll('.about-carousel-slide');
        slides.forEach(slide => {
            slide.style.flex = '0 0 auto';
            slide.style.width = '100%';
            slide.style.scrollSnapAlign = 'start';
        });
    } else {
        track.style.overflowX = 'hidden';
        track.style.scrollSnapType = '';
    }
}

function startAboutCarousel() {
    if (aboutCarouselInterval) clearInterval(aboutCarouselInterval);
    if (!window.aboutImages || window.aboutImages.length <= 1) return;

    aboutCarouselInterval = setInterval(() => {
        aboutCurrentSlideIndex = (aboutCurrentSlideIndex + 1) % window.aboutImages.length;
        goToAboutSlide(aboutCurrentSlideIndex);
    }, CONFIG.CAROUSEL.ABOUT_INTERVAL);
}

// =====================================================================
// NEWSLETTER FORM
// =====================================================================
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;

    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    const emailInput = newsletterForm.querySelector('input[type="email"]');

    if (!submitBtn || !emailInput) return;

    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!isValidEmail(email)) {
            showToast('❌ Adresse email invalide', 'error');
            return;
        }

        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        // Simuler l'envoi (à remplacer par un vrai appel API)
        setTimeout(() => {
            showToast('✅ Merci pour votre inscription !', 'success');
            emailInput.value = '';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1000);
    });
}

// =====================================================================
// OPTIMIZATIONS
// =====================================================================
function optimizeForMobile() {
    // Optimiser les images d'équipe
    optimizeTeamImages();

    // Optimiser les formulaires
    optimizeFormsForMobile();
}

function optimizeTeamImages() {
    const teamCards = document.querySelectorAll('.team-card');
    if (!teamCards.length) return;

    teamCards.forEach(card => {
        const imgContainer = card.querySelector('.team-img-container');
        if (!imgContainer) return;

        if (isMobile) {
            imgContainer.style.width = '180px';
            imgContainer.style.height = '180px';
            imgContainer.style.margin = '0 auto 20px';
            imgContainer.style.borderRadius = '50%';
        } else {
            imgContainer.style.width = '';
            imgContainer.style.height = '';
            imgContainer.style.margin = '';
            imgContainer.style.borderRadius = '';
        }
    });
}

function optimizeFormsForMobile() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (isMobile) {
            form.style.padding = '15px';

            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.style.fontSize = '16px'; // Évite le zoom sur iOS
            });
        }
    });
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================
function showToast(message, type = 'success') {
    // Supprimer les anciens toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' :
            type === 'error' ? '#dc3545' :
                type === 'warning' ? '#ffc107' : '#007bff'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getCSRFToken() {
    // Chercher dans les cookies
    const cookieMatch = document.cookie.match(/csrftoken=([^;]+)/);
    if (cookieMatch) return cookieMatch[1];

    // Chercher dans le DOM
    const csrfInput = document.querySelector('[name="csrfmiddlewaretoken"]');
    if (csrfInput) return csrfInput.value;

    return null;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =====================================================================
// ANIMATIONS AU SCROLL
// =====================================================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animer les compteurs
                if (entry.target.classList.contains('counter')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll, .counter').forEach(el => {
        observer.observe(el);
    });
}

function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-count')) || 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            counter.textContent = target;
            clearInterval(timer);
        } else {
            counter.textContent = Math.floor(current);
        }
    }, 16);
}

// =====================================================================
// CLEANUP ON UNLOAD
// =====================================================================
window.addEventListener('beforeunload', () => {
    if (carouselInterval) clearInterval(carouselInterval);
    if (aboutCarouselInterval) clearInterval(aboutCarouselInterval);
});

// =====================================================================
// DEBUG MODE (DÉVELOPPEMENT SEULEMENT)
// =====================================================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Mode développement activé');

    // Ajouter un bouton de test
    setTimeout(() => {
        const testBtn = document.createElement('button');
        testBtn.textContent = 'TEST FORMULAIRE';
        testBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9999;
            font-size: 12px;
        `;

        testBtn.onclick = () => {
            if (document.getElementById('name')) {
                document.getElementById('name').value = 'Jean Dupont';
                document.getElementById('email').value = 'test@example.com';
                document.getElementById('subject').value = 'Test automatique';
                document.getElementById('message').value = 'Ceci est un test du formulaire de contact.';

                if (DOM.contactForm) {
                    DOM.contactForm.dispatchEvent(new Event('submit'));
                }
            }
        };

        document.body.appendChild(testBtn);
    }, 1000);
}