// =====================================================================
// CONFIGURATION GLOBALE - VERSION PROFESSIONNELLE
// =====================================================================
const CONFIG = {
    API_ENDPOINTS: {
        CONTACT: '/envoyer-contact/',
        NEWSLETTER: '/newsletter/'
    },
    TIMINGS: {
        PRELOADER: 500,
        CAROUSEL: 5000,
        TOAST: 4000,
        ANIMATION: 300
    },
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 1024
    }
};

// =====================================================================
// ÉTAT GLOBAL - SINGLE SOURCE OF TRUTH
// =====================================================================
const STATE = {
    isMobile: window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE,
    isTablet: window.innerWidth <= CONFIG.BREAKPOINTS.TABLET,
    isSubmitting: false,
    currentSlide: 0,
    aboutSlide: 0,
    isMenuOpen: false,
    theme: localStorage.getItem('theme') || 'light'
};

// =====================================================================
// CACHE DOM - PERFORMANCE OPTIMIZED
// =====================================================================
const DOMCache = {
    elements: {},

    init() {
        // Core elements
        this.elements.body = document.body;
        this.elements.preloader = document.getElementById('preloader');
        this.elements.header = document.getElementById('header');

        // Navigation
        this.elements.navMenu = document.getElementById('navMenu');
        this.elements.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.elements.navLinks = document.querySelectorAll('.nav-link');
        this.elements.backToTop = document.getElementById('backToTop');

        // Forms
        this.elements.contactForm = document.getElementById('contactForm');
        this.elements.newsletterForm = document.querySelector('.newsletter-form');

        // Carousels
        this.elements.carousel = {
            track: document.getElementById('carouselTrack'),
            prev: document.getElementById('carouselPrev'),
            next: document.getElementById('carouselNext'),
            indicators: document.getElementById('carouselIndicators')
        };

        this.elements.aboutCarousel = {
            track: document.getElementById('aboutCarouselTrack'),
            indicators: document.getElementById('aboutCarouselIndicators')
        };

        // Theme
        this.elements.themeToggle = document.getElementById('themeToggle');

        // Modals
        this.elements.donationModal = document.getElementById('donationModal');
        this.elements.galleryModal = document.getElementById('galleryModal');

        // Team section
        this.elements.teamCards = document.querySelectorAll('.team-card');
        this.elements.teamImages = document.querySelectorAll('.team-img');

        return this;
    },

    get(id) {
        return this.elements[id] || document.getElementById(id);
    }
};

// =====================================================================
// UTILITAIRES DE BASE
// =====================================================================
const Utils = {
    // Debounce pour performances
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle pour événements fréquents
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Validation email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // CSRF Token
    getCSRFToken() {
        // From cookies
        const cookieMatch = document.cookie.match(/csrftoken=([^;]+)/);
        if (cookieMatch) return cookieMatch[1];

        // From DOM
        const csrfInput = document.querySelector('[name="csrfmiddlewaretoken"]');
        if (csrfInput) return csrfInput.value;

        // From meta tag
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) return metaToken.content;

        console.warn('CSRF token not found');
        return null;
    },

    // Element in viewport
    isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
            rect.bottom >= 0
        );
    },

    // Smooth scroll
    smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
};

// =====================================================================
// GESTION DES ÉVÉNEMENTS CENTRALISÉE
// =====================================================================
const EventManager = {
    handlers: {},

    init() {
        this.setupWindowEvents();
        this.setupNavigation();
        this.setupCarousels();
        this.setupForms();
        this.setupTheme();
    },

    setupWindowEvents() {
        // Scroll avec throttle
        window.addEventListener('scroll', Utils.throttle(this.handleScroll.bind(this), 100));

        // Resize avec debounce
        window.addEventListener('resize', Utils.debounce(this.handleResize.bind(this), 250));

        // Load
        window.addEventListener('load', this.handleLoad.bind(this));
    },

    handleScroll() {
        // Header effect
        if (DOMCache.elements.header) {
            DOMCache.elements.header.classList.toggle('scrolled', window.scrollY > 50);
        }

        // Back to top
        if (DOMCache.elements.backToTop) {
            DOMCache.elements.backToTop.classList.toggle('active', window.scrollY > 300);
        }

        // Navigation active link
        this.updateActiveNavLink();

        // Animations on scroll
        this.handleScrollAnimations();
    },

    handleResize() {
        STATE.isMobile = window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE;
        STATE.isTablet = window.innerWidth <= CONFIG.BREAKPOINTS.TABLET;

        // Optimize for new viewport size
        CarouselManager.updateForMobile();
        ImageOptimizer.optimizeAll();

        // Close mobile menu if resizing to desktop
        if (!STATE.isMobile && STATE.isMenuOpen) {
            this.toggleMobileMenu(false);
        }
    },

    handleLoad() {
        // Hide preloader
        Preloader.hide();

        // Start animations
        AnimationManager.init();

        // Start carousels
        CarouselManager.startAll();
    },

    setupNavigation() {
        // Mobile menu toggle
        if (DOMCache.elements.mobileMenuBtn) {
            DOMCache.elements.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Navigation links
        if (DOMCache.elements.navLinks) {
            DOMCache.elements.navLinks.forEach(link => {
                link.addEventListener('click', (e) => this.handleNavClick(e));
            });
        }

        // Back to top
        if (DOMCache.elements.backToTop) {
            DOMCache.elements.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    },

    toggleMobileMenu(force) {
        if (!DOMCache.elements.navMenu || !DOMCache.elements.mobileMenuBtn) return;

        const shouldOpen = force !== undefined ? force : !STATE.isMenuOpen;
        STATE.isMenuOpen = shouldOpen;

        DOMCache.elements.navMenu.classList.toggle('active', shouldOpen);
        DOMCache.elements.body.style.overflow = shouldOpen ? 'hidden' : '';

        // Update button icon
        const icon = DOMCache.elements.mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.className = shouldOpen ? 'fas fa-times' : 'fas fa-bars';
        }

        // Update ARIA
        DOMCache.elements.mobileMenuBtn.setAttribute('aria-expanded', shouldOpen);
    },

    handleNavClick(event) {
        const link = event.currentTarget;
        const targetId = link.getAttribute('href');

        if (!targetId || targetId === '#') return;

        event.preventDefault();

        // Close mobile menu if open
        if (STATE.isMobile && STATE.isMenuOpen) {
            this.toggleMobileMenu(false);
        }

        // Smooth scroll to target
        Utils.smoothScrollTo(targetId, DOMCache.elements.header?.offsetHeight || 0);
    },

    updateActiveNavLink() {
        if (!DOMCache.elements.navLinks) return;

        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        DOMCache.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href')?.substring(1);
            if (href === currentSection) {
                link.classList.add('active');
            }
        });
    },

    handleScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => {
            if (Utils.isInViewport(el)) {
                el.classList.add('visible');
            }
        });
    },

    setupCarousels() {
        // Main carousel events
        if (DOMCache.elements.carousel.prev) {
            DOMCache.elements.carousel.prev.addEventListener('click', () => CarouselManager.prev());
        }

        if (DOMCache.elements.carousel.next) {
            DOMCache.elements.carousel.next.addEventListener('click', () => CarouselManager.next());
        }

        // About carousel events
        if (DOMCache.elements.aboutCarousel.track) {
            DOMCache.elements.aboutCarousel.track.addEventListener('mouseenter', () => {
                CarouselManager.pauseAboutCarousel();
            });

            DOMCache.elements.aboutCarousel.track.addEventListener('mouseleave', () => {
                CarouselManager.startAboutCarousel();
            });
        }
    },

    setupForms() {
        // Contact form
        if (DOMCache.elements.contactForm) {
            DOMCache.elements.contactForm.addEventListener('submit', (e) => FormManager.handleContactSubmit(e));

            // Real-time validation
            const fields = ['name', 'email', 'message'];
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('blur', () => FormManager.validateField(field));
                    field.addEventListener('input', () => FormManager.clearFieldError(field));
                }
            });
        }

        // Newsletter form
        if (DOMCache.elements.newsletterForm) {
            DOMCache.elements.newsletterForm.addEventListener('submit', (e) => FormManager.handleNewsletterSubmit(e));
        }
    },

    setupTheme() {
        if (DOMCache.elements.themeToggle) {
            DOMCache.elements.themeToggle.addEventListener('click', () => ThemeManager.toggle());
        }
    }
};

// =====================================================================
// GESTION DU PRELOADER
// =====================================================================
const Preloader = {
    hide() {
        const preloader = DOMCache.elements.preloader;
        if (!preloader) return;

        preloader.style.transition = 'opacity 0.5s ease';
        preloader.style.opacity = '0';

        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.style.display = 'none';
            }
        }, 500);
    },

    show() {
        const preloader = DOMCache.elements.preloader;
        if (!preloader) return;

        preloader.style.display = 'flex';
        preloader.style.opacity = '1';
    }
};

// =====================================================================
// GESTION DU THÈME
// =====================================================================
const ThemeManager = {
    init() {
        document.documentElement.setAttribute('data-theme', STATE.theme);
        this.updateIcon();
    },

    toggle() {
        STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', STATE.theme);
        localStorage.setItem('theme', STATE.theme);
        this.updateIcon();
        Toast.show(`Mode ${STATE.theme === 'dark' ? 'sombre' : 'clair'} activé`, 'success');
    },

    updateIcon() {
        if (!DOMCache.elements.themeToggle) return;

        const icon = DOMCache.elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = STATE.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
};

// =====================================================================
// GESTION DES CAROUSELS
// =====================================================================
const CarouselManager = {
    intervals: {
        main: null,
        about: null
    },

    init() {
        this.renderMainCarousel();
        this.renderAboutCarousel();
        this.setupTouchEvents();
    },

    renderMainCarousel() {
        if (!DOMCache.elements.carousel.track || !window.carouselImages) return;

        const { track, indicators } = DOMCache.elements.carousel;
        track.innerHTML = '';
        if (indicators) indicators.innerHTML = '';

        window.carouselImages.forEach((image, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.dataset.index = index;

            // Image
            const imgContainer = document.createElement('div');
            imgContainer.className = 'carousel-img-container';

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.title || 'Carousel image';
            img.loading = 'lazy';
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';

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

            // Caption
            if (image.title || image.description) {
                const caption = document.createElement('div');
                caption.className = 'carousel-caption';
                caption.innerHTML = `
                    ${image.title ? `<h4>${image.title}</h4>` : ''}
                    ${image.description ? `<p>${image.description}</p>` : ''}
                `;
                slide.appendChild(caption);
            }

            track.appendChild(slide);

            // Indicator
            if (indicators) {
                const indicator = document.createElement('button');
                indicator.className = 'carousel-indicator';
                indicator.dataset.index = index;
                indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);

                if (index === 0) indicator.classList.add('active');

                indicator.addEventListener('click', () => this.goToSlide(index));
                indicators.appendChild(indicator);
            }
        });

        this.updateControls();
    },

    renderAboutCarousel() {
        if (!window.aboutImages) return;

        let track = DOMCache.elements.aboutCarousel.track;
        let indicators = DOMCache.elements.aboutCarousel.indicators;

        // Create if doesn't exist
        if (!track) {
            const aboutSection = document.getElementById('about');
            if (!aboutSection) return;

            const container = document.createElement('div');
            container.className = 'about-carousel-container';

            track = document.createElement('div');
            track.id = 'aboutCarouselTrack';
            track.className = 'about-carousel-track';

            indicators = document.createElement('div');
            indicators.id = 'aboutCarouselIndicators';
            indicators.className = 'about-carousel-indicators';

            container.appendChild(track);
            container.appendChild(indicators);

            const aboutContent = aboutSection.querySelector('.about-content') || aboutSection;
            aboutContent.appendChild(container);

            // Update cache
            DOMCache.elements.aboutCarousel.track = track;
            DOMCache.elements.aboutCarousel.indicators = indicators;
        }

        track.innerHTML = '';
        indicators.innerHTML = '';

        window.aboutImages.forEach((imageUrl, index) => {
            const slide = document.createElement('div');
            slide.className = 'about-carousel-slide';

            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `About image ${index + 1}`;
            img.loading = 'lazy';
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';

            img.onload = () => img.style.opacity = '1';
            img.onerror = () => {
                img.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'about-image-placeholder';
                placeholder.innerHTML = `<i class="fas fa-image"></i><p>Image ${index + 1}</p>`;
                slide.appendChild(placeholder);
            };

            slide.appendChild(img);
            track.appendChild(slide);

            // Indicator
            const indicator = document.createElement('button');
            indicator.className = 'about-carousel-indicator';
            indicator.dataset.index = index;

            if (index === 0) indicator.classList.add('active');

            indicator.addEventListener('click', () => this.goToAboutSlide(index));
            indicators.appendChild(indicator);
        });

        this.updateAboutForMobile();
    },

    goToSlide(index) {
        if (!window.carouselImages || index < 0 || index >= window.carouselImages.length) return;

        STATE.currentSlide = index;

        if (STATE.isMobile) {
            const slideWidth = DOMCache.elements.carousel.track.querySelector('.carousel-slide').offsetWidth;
            DOMCache.elements.carousel.track.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth'
            });
        } else {
            DOMCache.elements.carousel.track.style.transform = `translateX(-${index * 100}%)`;
        }

        this.updateControls();
    },

    goToAboutSlide(index) {
        if (!window.aboutImages || index < 0 || index >= window.aboutImages.length) return;

        STATE.aboutSlide = index;

        if (DOMCache.elements.aboutCarousel.track) {
            DOMCache.elements.aboutCarousel.track.style.transform = `translateX(-${index * 100}%)`;
            this.updateAboutIndicators();
        }
    },

    prev() {
        if (STATE.currentSlide > 0) {
            this.goToSlide(STATE.currentSlide - 1);
        }
    },

    next() {
        if (STATE.currentSlide < window.carouselImages.length - 1) {
            this.goToSlide(STATE.currentSlide + 1);
        }
    },

    updateControls() {
        const { prev, next, indicators } = DOMCache.elements.carousel;

        if (prev) prev.disabled = STATE.currentSlide === 0;
        if (next) prev.disabled = STATE.currentSlide === window.carouselImages.length - 1;

        if (indicators) {
            const indicatorElements = indicators.querySelectorAll('.carousel-indicator');
            indicatorElements.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === STATE.currentSlide);
            });
        }
    },

    updateAboutIndicators() {
        const indicators = DOMCache.elements.aboutCarousel.indicators;
        if (!indicators) return;

        const indicatorElements = indicators.querySelectorAll('.about-carousel-indicator');
        indicatorElements.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === STATE.aboutSlide);
        });
    },

    updateForMobile() {
        this.updateAboutForMobile();
    },

    updateAboutForMobile() {
        const track = DOMCache.elements.aboutCarousel.track;
        if (!track) return;

        if (STATE.isMobile) {
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
    },

    setupTouchEvents() {
        // Main carousel touch
        if (DOMCache.elements.carousel.track) {
            let startX = 0;

            DOMCache.elements.carousel.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            });

            DOMCache.elements.carousel.track.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }
            });
        }
    },

    startAll() {
        this.startMainCarousel();
        this.startAboutCarousel();
    },

    startMainCarousel() {
        if (this.intervals.main) clearInterval(this.intervals.main);
        if (!window.carouselImages || window.carouselImages.length <= 1) return;

        this.intervals.main = setInterval(() => {
            const nextIndex = (STATE.currentSlide + 1) % window.carouselImages.length;
            this.goToSlide(nextIndex);
        }, CONFIG.TIMINGS.CAROUSEL);
    },

    startAboutCarousel() {
        if (this.intervals.about) clearInterval(this.intervals.about);
        if (!window.aboutImages || window.aboutImages.length <= 1) return;

        this.intervals.about = setInterval(() => {
            const nextIndex = (STATE.aboutSlide + 1) % window.aboutImages.length;
            this.goToAboutSlide(nextIndex);
        }, CONFIG.TIMINGS.CAROUSEL);
    },

    pauseAboutCarousel() {
        if (this.intervals.about) clearInterval(this.intervals.about);
    }
};

// =====================================================================
// GESTION DES FORMULAIRES
// =====================================================================
const FormManager = {
    async handleContactSubmit(event) {
        event.preventDefault();

        if (STATE.isSubmitting) {
            Toast.show('⏳ Un envoi est déjà en cours...', 'warning');
            return;
        }

        // Collect data
        const formData = this.collectContactData();
        if (!formData) return;

        // Validate
        const validation = this.validateContactData(formData);
        if (!validation.valid) {
            Toast.show(`❌ ${validation.message}`, 'error');
            this.highlightError(validation.field);
            return;
        }

        // Prepare UI
        const submitBtn = DOMCache.elements.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
        submitBtn.disabled = true;
        STATE.isSubmitting = true;

        try {
            // Send to backend
            const success = await this.sendContactData(formData);

            if (success) {
                DOMCache.elements.contactForm.reset();
                Toast.show(`✅ Merci ${formData.nom}, message envoyé !`, 'success');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Toast.show('❌ Erreur d\'envoi', 'error');
        } finally {
            // Restore UI
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            STATE.isSubmitting = false;
        }
    },

    collectContactData() {
        try {
            return {
                nom: this.getValue('name'),
                email: this.getValue('email'),
                sujet: this.getValue('subject', 'Sans sujet'),
                motif: this.getValue('reason', 'Information'),
                message: this.getValue('message')
            };
        } catch (error) {
            console.error('Data collection error:', error);
            return null;
        }
    },

    getValue(id, defaultValue = '') {
        const element = document.getElementById(id);
        return element ? element.value.trim() : defaultValue;
    },

    validateContactData(data) {
        if (!data.nom) return { valid: false, message: 'Nom requis', field: 'name' };
        if (!data.email) return { valid: false, message: 'Email requis', field: 'email' };
        if (!Utils.validateEmail(data.email)) return { valid: false, message: 'Email invalide', field: 'email' };
        if (!data.message) return { valid: false, message: 'Message requis', field: 'message' };
        if (data.message.length < 10) return { valid: false, message: 'Message trop court (10+ caractères)', field: 'message' };

        return { valid: true };
    },

    async sendContactData(data) {
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key]));

            const csrfToken = Utils.getCSRFToken();
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
                return result.success || true;
            }

            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            console.error('Send error:', error);
            throw error;
        }
    },

    validateField(field) {
        const value = field.value.trim();
        if (!value) return;

        if (field.id === 'email' && !Utils.validateEmail(value)) {
            this.showFieldError(field, 'Email invalide');
        } else if (field.id === 'message' && value.length < 10) {
            this.showFieldError(field, '10+ caractères requis');
        }
    },

    showFieldError(field, message) {
        this.clearFieldError(field);

        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        error.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;

        field.parentNode.appendChild(error);
        field.style.borderColor = '#dc3545';
    },

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();
        field.style.borderColor = '';
    },

    highlightError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.focus();
            field.style.borderColor = '#dc3545';
            setTimeout(() => field.style.borderColor = '', 3000);
        }
    },

    handleNewsletterSubmit(event) {
        event.preventDefault();

        const emailInput = event.target.querySelector('input[type="email"]');
        const submitBtn = event.target.querySelector('button[type="submit"]');

        if (!emailInput || !submitBtn) return;

        const email = emailInput.value.trim();

        if (!email || !Utils.validateEmail(email)) {
            Toast.show('❌ Email invalide', 'error');
            return;
        }

        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            Toast.show('✅ Inscription réussie !', 'success');
            emailInput.value = '';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    }
};

// =====================================================================
// OPTIMISATION DES IMAGES
// =====================================================================
const ImageOptimizer = {
    optimizeAll() {
        this.optimizeTeamImages();
        this.optimizeCarouselImages();
    },

    optimizeTeamImages() {
        const teamCards = DOMCache.elements.teamCards;
        if (!teamCards || teamCards.length === 0) return;

        teamCards.forEach((card, index) => {
            const imgContainer = card.querySelector('.team-img-container');
            if (!imgContainer) return;

            // Make visible
            imgContainer.style.opacity = '1';
            imgContainer.style.visibility = 'visible';

            const img = imgContainer.querySelector('img');
            if (img) {
                img.style.opacity = '1';

                if (STATE.isMobile) {
                    imgContainer.style.width = '180px';
                    imgContainer.style.height = '180px';
                    imgContainer.style.margin = '0 auto 20px';
                    imgContainer.style.borderRadius = '50%';

                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                } else {
                    imgContainer.style.width = '100%';
                    imgContainer.style.height = '250px';
                    imgContainer.style.borderRadius = '10px';

                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                }
            }

            // Animate appearance
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    },

    optimizeCarouselImages() {
        // Lazy load carousel images
        const images = document.querySelectorAll('.carousel-slide img, .about-carousel-slide img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
};

// =====================================================================
// GESTION DES ANIMATIONS
// =====================================================================
const AnimationManager = {
    init() {
        this.setupScrollAnimations();
        this.animateCounters();
    },

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    if (entry.target.classList.contains('counter')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll, .counter').forEach(el => {
            observer.observe(el);
        });
    },

    animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            if (Utils.isInViewport(counter)) {
                this.animateCounter(counter);
            }
        });
    },

    animateCounter(counter) {
        if (counter.classList.contains('animated')) return;

        const target = parseInt(counter.getAttribute('data-count')) || 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
                counter.classList.add('animated');
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }
};

// =====================================================================
// NOTIFICATIONS (TOAST)
// =====================================================================
const Toast = {
    show(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        // Styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease-out;
            max-width: ${STATE.isMobile ? '90vw' : '400px'};
        `;

        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.TIMINGS.TOAST);
    },

    getIcon(type) {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    },

    getColor(type) {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#3b82f6';
        }
    }
};

// =====================================================================
// INITIALISATION PRINCIPALE
// =====================================================================
class App {
    static init() {
        console.log('🚀 Application initialisation...');

        // Set no-js fallback
        document.body.classList.remove('no-js');

        // Initialize DOM cache
        DOMCache.init();

        // Initialize components
        this.initComponents();

        // Add debug tools in development
        if (this.isDevelopment()) {
            this.addDebugTools();
        }

        console.log('✅ Application prête');
    }

    static initComponents() {
        // Order matters
        ThemeManager.init();
        EventManager.init();
        CarouselManager.init();
        ImageOptimizer.optimizeAll();
        AnimationManager.init();
    }

    static isDevelopment() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev');
    }

    static addDebugTools() {
        const debugPanel = document.createElement('div');
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 9999;
            font-family: monospace;
            font-size: 12px;
        `;

        debugPanel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #60a5fa;">Debug Panel</div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="App.testForm()" style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    Test Form
                </button>
                <button onclick="App.testToast()" style="background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    Test Toast
                </button>
                <button onclick="App.nextSlide()" style="background: #f59e0b; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    Next Slide
                </button>
            </div>
            <div id="debug-info" style="margin-top: 10px; font-size: 10px; color: #d1d5db;"></div>
        `;

        document.body.appendChild(debugPanel);
    }

    static testForm() {
        if (!DOMCache.elements.contactForm) {
            Toast.show('Formulaire non trouvé', 'error');
            return;
        }

        // Fill with test data
        document.getElementById('name').value = 'Jean Dupont';
        document.getElementById('email').value = 'test@example.com';
        document.getElementById('subject').value = 'Test automatique';
        document.getElementById('message').value = 'Ceci est un test du formulaire de contact.';

        // Trigger submit
        DOMCache.elements.contactForm.dispatchEvent(new Event('submit'));

        Toast.show('Test du formulaire déclenché', 'success');
    }

    static testToast() {
        Toast.show('Ceci est un test de notification', 'success');
    }

    static nextSlide() {
        CarouselManager.next();
    }
}

// =====================================================================
// DÉMARRAGE DE L'APPLICATION
// =====================================================================
document.addEventListener('DOMContentLoaded', () => App.init());

// =====================================================================
// EXPOSITION GLOBALE (pour débogage)
// =====================================================================
window.App = App;
window.Toast = Toast;
window.CarouselManager = CarouselManager;
window.FormManager = FormManager;

// =====================================================================
// GESTION DE LA FERMETURE
// =====================================================================
window.addEventListener('beforeunload', () => {
    // Clean up intervals
    if (CarouselManager.intervals.main) clearInterval(CarouselManager.intervals.main);
    if (CarouselManager.intervals.about) clearInterval(CarouselManager.intervals.about);
});