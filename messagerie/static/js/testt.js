// =====================================================================
// VARIABLES GLOBALES
// =====================================================================
//alert("Bonjour Zenon, le JavaScript est bien chargé !");
let preloader, header, mobileMenuBtn, navMenu, navLinks, dropdowns, backToTopBtn;
let donationModal, modalClose, galleryModal, galleryModalClose, galleryModalImg, galleryModalCaption;
let contactForm, themeToggle;
let carouselTrack, carouselPrev, carouselNext, carouselIndicators;

// Données du carousel
const carouselImages = [
    {
        url: '/static/images/IMG-20251212-WA0000.jpg',
        title: 'Notre équipe en action',
        description: 'Réunion de travail avec notre équipe sur le terrain'
    },
    {
        url: '/static/images/IMG-20251212-WA0005.jpg',
        title: 'Distribution scolaire',
        description: 'Remise de kits scolaires aux enfants'
    },
    {
        url: '/static/images/Screenshot_20251211-124109.png',
        title: 'Activités éducatives',
        description: 'Ateliers éducatifs avec les enfants'
    },
    {
        url: '/static/images/IMG-20251212-WA0002.jpg',
        title: 'Visites communautaires',
        description: 'Rencontres avec les familles dans les communautés'
    },
    {
        url: '/static/images/Screenshot_20251211-124304.png',
        title: 'Formation des bénévoles',
        description: "Formation des membres de l'équipe"
    },
    {
        url: '/static/images/IMG-20251212-WA0003.jpg',
        title: 'Nos réalisations',
        description: 'Bilan des projets réalisés cette année'
    }
];

let currentSlideIndex = 0;

// =====================================================================
// INITIALISATION - Attendre que le DOM soit chargé
// =====================================================================
// On attend que la page soit prête
document.addEventListener('DOMContentLoaded', function() {
    // 1. Tes initialisations de design existantes
    initVariables();
    initTheme();
    watchThemeChanges();
    setupEventListeners();
    
    // 2. Initialiser le carousel
    initCarousel();

    // -------------------------------------------------------------------------
    // AJOUT : Partie pour l'ENREGISTREMENT des messages dans Django
    // -------------------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Empêche la page de se rafraîchir

            // On ramasse les informations pour les envoyer
            const data = {
                nom: document.getElementById('name').value,
                email: document.getElementById('email').value,
                sujet: document.getElementById('subject').value,
                motif: document.getElementById('reason').value, // correspond au champ select
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/envoyer-contact/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert("✅ Succès ! Les informations sont bien enregistrées dans l'Admin Django.");
                    contactForm.reset(); // On vide les cases après succès
                } else {
                    const errorMsg = await response.json();
                    alert("❌ Erreur : Django a reçu les infos mais refuse de les stocker. " + errorMsg.message);
                }
            } catch (err) {
                alert("❌ Erreur réseau : Impossible de contacter le Backend. Est-il allumé ?");
            }
        });
    }
    // -------------------------------------------------------------------------
    
    // 3. Initialiser les animations
    setTimeout(() => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => {
            if (isElementInViewport(el)) {
                el.classList.add('visible');
            }
        });
    }, 300);
    
    // Retirer la classe no-js
    document.body.classList.remove('no-js');
});

// =====================================================================
// INITIALISATION DES VARIABLES
// =====================================================================
function initVariables() {
    preloader = document.getElementById('preloader');
    header = document.getElementById('header');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    navMenu = document.getElementById('navMenu');
    navLinks = document.querySelectorAll('.nav-link');
    dropdowns = document.querySelectorAll('.nav-dropdown');
    backToTopBtn = document.getElementById('backToTop');
    donationModal = document.getElementById('donationModal');
    modalClose = document.getElementById('modalClose');
    galleryModal = document.getElementById('galleryModal');
    galleryModalClose = document.getElementById('galleryModalClose');
    galleryModalImg = document.getElementById('galleryModalImg');
    galleryModalCaption = document.getElementById('galleryModalCaption');
    contactForm = document.getElementById('contactForm');
    themeToggle = document.getElementById('themeToggle');
    carouselTrack = document.getElementById('carouselTrack');
    carouselPrev = document.getElementById('carouselPrev');
    carouselNext = document.getElementById('carouselNext');
    carouselIndicators = document.getElementById('carouselIndicators');
}

// =====================================================================
// CONFIGURATION DES ÉVÉNEMENTS
// =====================================================================
function setupEventListeners() {
    // Preloader
    window.addEventListener('load', handleWindowLoad);
    
    // Scroll events
    window.addEventListener('scroll', handleWindowScroll);
    
    // Mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // Back to top
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Donation modal
    if (modalClose) {
        modalClose.addEventListener('click', closeDonationModal);
    }
    
    // Gallery modal
    if (galleryModalClose) {
        galleryModalClose.addEventListener('click', closeGalleryModal);
    }
    
    // Contact form
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Program tabs
    const programTabs = document.querySelectorAll('.program-tab');
    programTabs.forEach(tab => {
        tab.addEventListener('click', handleProgramTabClick);
    });
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        const newsletterBtn = newsletterForm.querySelector('.newsletter-btn');
        const newsletterInput = newsletterForm.querySelector('.newsletter-input');
        
        newsletterBtn.addEventListener('click', (e) => handleNewsletterSubmit(e, newsletterInput, newsletterBtn));
        newsletterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                newsletterBtn.click();
            }
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', handleOutsideClick);
    
    // Close modals with Escape key
    document.addEventListener('keydown', handleEscapeKey);
    
    // Team images load
    const teamImages = document.querySelectorAll('.team-img.loading');
    teamImages.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        });
        
        if (img.complete) {
            img.classList.remove('loading');
            img.classList.add('loaded');
        }
    });
}

// =====================================================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// =====================================================================
function handleWindowLoad() {
    setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
        animateCounters();
    }, 1000);
}

function handleWindowScroll() {
    // Header scroll effect
    if (header) {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Back to top button
    if (backToTopBtn) {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    }
    
    // Active navigation link
    setActiveNavLink();
    
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        if (isElementInViewport(el)) {
            el.classList.add('visible');
        }
    });
    
    // Animate counters
    animateCounters();
}

function toggleMobileMenu() {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    navMenu.classList.toggle('active');
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    
    const icon = mobileMenuBtn.querySelector('i');
    icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    
    // Bloquer/débloquer le défilement
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

function handleNavLinkClick(e) {
    if (window.innerWidth <= 992) {
        navMenu.classList.remove('active');
        mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    // Update active link
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    this.classList.add('active');
}

function handleSmoothScroll(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        // Fermer le menu mobile si ouvert
        if (window.innerWidth <= 992 && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function closeDonationModal() {
    if (donationModal) {
        donationModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeGalleryModal() {
    if (galleryModal) {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const subject = document.getElementById('subject')?.value;
    const reason = document.getElementById('reason')?.value;
    const message = document.getElementById('message')?.value;
    
    if (!name || !email || !reason || !message) {
        showToast('Veuillez remplir tous les champs obligatoires.', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Veuillez entrer une adresse email valide.', 'error');
        return;
    }
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    submitBtn.disabled = true;
    
    // Simulation d'envoi (remplacez par votre appel API)
    setTimeout(() => {
        showToast(`Merci ${name}, votre message a bien été enregistré !`, 'success');
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

function handleProgramTabClick() {
    const programTabs = document.querySelectorAll('.program-tab');
    programTabs.forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    
    const tabId = this.getAttribute('data-tab');
    console.log(`Selected program tab: ${tabId}`);
}

function handleNewsletterSubmit(e, input, btn) {
    e.preventDefault();
    const email = input.value;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && emailRegex.test(email)) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        
        setTimeout(() => {
            showToast(`Merci de vous être inscrit à notre newsletter avec l'adresse: ${email}`);
            input.value = '';
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1000);
    } else {
        showToast('Veuillez entrer une adresse email valide.', 'error');
    }
}

function handleOutsideClick(e) {
    // Mobile menu
    const isMobile = window.innerWidth <= 992;
    if (isMobile && navMenu && mobileMenuBtn && 
        !navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navMenu.classList.remove('active');
        mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    // Donation modal
    if (donationModal && e.target === donationModal) {
        closeDonationModal();
    }
    
    // Gallery modal
    if (galleryModal && e.target === galleryModal) {
        closeGalleryModal();
    }
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        if (donationModal && donationModal.classList.contains('active')) {
            closeDonationModal();
        }
        if (galleryModal && galleryModal.classList.contains('active')) {
            closeGalleryModal();
        }
    }
}

// =====================================================================
// FONCTIONS DU THÈME
// =====================================================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = savedTheme;
    if (!theme) {
        theme = prefersDark ? 'dark' : 'light';
    }
    
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
}

function updateThemeIcon(theme) {
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre');
}

function watchThemeChanges() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const theme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            updateThemeIcon(theme);
        }
    });
}

// =====================================================================
// FONCTIONS DU CAROUSEL
// =====================================================================
function initCarousel() {
    if (!carouselTrack || !carouselIndicators) return;
    
    renderCarousel();
    updateCarouselControls();
    setupCarouselEvents();
}

function renderCarousel() {
    carouselTrack.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    carouselImages.forEach((image, index) => {
        // Créer la diapositive
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.dataset.index = index;
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${index + 1} sur ${carouselImages.length}`);
        
        // Créer l'image
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.title;
        img.loading = 'lazy';
        img.onerror = function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = `
                <i class="fas fa-image" aria-hidden="true"></i>
                <p>${image.title}</p>
            `;
            slide.appendChild(placeholder);
        };
        
        slide.appendChild(img);
        
        // Ajouter la légende
        const caption = document.createElement('div');
        caption.className = 'carousel-caption';
        caption.innerHTML = `
            <h4>${image.title}</h4>
            <p>${image.description}</p>
        `;
        slide.appendChild(caption);
        
        carouselTrack.appendChild(slide);
        
        // Créer l'indicateur
        const indicator = document.createElement('button');
        indicator.className = 'carousel-indicator';
        indicator.dataset.index = index;
        indicator.setAttribute('aria-label', `Aller à la diapositive ${index + 1}`);
        indicator.setAttribute('aria-controls', 'carouselTrack');
        
        if (index === 0) {
            indicator.classList.add('active');
            indicator.setAttribute('aria-current', 'true');
        }
        
        indicator.addEventListener('click', () => {
            scrollToSlide(index);
        });
        
        carouselIndicators.appendChild(indicator);
    });
}

function updateCarouselControls() {
    if (!carouselPrev || !carouselNext) return;
    
    carouselPrev.disabled = currentSlideIndex === 0;
    carouselNext.disabled = currentSlideIndex >= carouselImages.length - 1;
    
    document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
        if (index === currentSlideIndex) {
            indicator.classList.add('active');
            indicator.setAttribute('aria-current', 'true');
        } else {
            indicator.classList.remove('active');
            indicator.removeAttribute('aria-current');
        }
    });
}

function setupCarouselEvents() {
    if (!carouselTrack || !carouselPrev || !carouselNext) return;
    
    // Bouton précédent
    carouselPrev.addEventListener('click', () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            scrollToSlide(currentSlideIndex);
        }
    });
    
    // Bouton suivant
    carouselNext.addEventListener('click', () => {
        if (currentSlideIndex < carouselImages.length - 1) {
            currentSlideIndex++;
            scrollToSlide(currentSlideIndex);
        }
    });
    
    // Gestion du défilement horizontal
    carouselTrack.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            return;
        }
        
        e.preventDefault();
        carouselTrack.scrollLeft += e.deltaY;
        updateActiveSlideIndex();
    });
    
    // Gestion du défilement avec la souris
    let isDown = false;
    let startX;
    let scrollLeft;
    
    carouselTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - carouselTrack.offsetLeft;
        scrollLeft = carouselTrack.scrollLeft;
        carouselTrack.style.cursor = 'grabbing';
    });
    
    carouselTrack.addEventListener('mouseleave', () => {
        isDown = false;
        carouselTrack.style.cursor = 'grab';
    });
    
    carouselTrack.addEventListener('mouseup', () => {
        isDown = false;
        carouselTrack.style.cursor = 'grab';
        updateActiveSlideIndex();
    });
    
    carouselTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carouselTrack.offsetLeft;
        const walk = (x - startX) * 2;
        carouselTrack.scrollLeft = scrollLeft - walk;
    });
    
    // Mettre à jour l'index de la diapositive active
    carouselTrack.addEventListener('scroll', () => {
        updateActiveSlideIndex();
    });
}

function scrollToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides[index]) {
        slides[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
        currentSlideIndex = index;
        updateCarouselControls();
    }
}

function updateActiveSlideIndex() {
    const slides = document.querySelectorAll('.carousel-slide');
    const trackRect = carouselTrack.getBoundingClientRect();
    
    let closestSlide = null;
    let closestDistance = Infinity;
    
    slides.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        const slideCenter = slideRect.left + slideRect.width / 2;
        const trackCenter = trackRect.left + trackRect.width / 2;
        const distance = Math.abs(slideCenter - trackCenter);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestSlide = index;
        }
    });
    
    if (closestSlide !== null && closestSlide !== currentSlideIndex) {
        currentSlideIndex = closestSlide;
        updateCarouselControls();
    }
}

// =====================================================================
// FONCTIONS UTILITAIRES
// =====================================================================
function setActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 150;
    
    let currentSectionId = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSectionId = sectionId;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href')?.substring(1);
        if (href === currentSectionId) {
            link.classList.add('active');
        }
    });
}

function isElementInViewport(el) {
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9
    );
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .impact-number');
    counters.forEach(counter => {
        if (isElementInViewport(counter) && !counter.classList.contains('animated')) {
            counter.classList.add('animated');
            const target = parseInt(counter.getAttribute('data-count')) || 0;
            const duration = 2000;
            const increment = target / (duration / 16);
            
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);
        }
    });
}

function showDonationModal(type) {
    let title = '';
    let content = '';
    
    if (type === 'bank') {
        title = 'Faire un virement bancaire';
        content = `
            <p>Pour effectuer un virement bancaire, veuillez utiliser les coordonnées suivantes :</p>
            <div style="background-color: var(--light); padding: 20px; border-radius: var(--border-radius); margin: 20px 0;">
                <p><strong>Banque :</strong> À préciser</p>
                <p><strong>IBAN :</strong> À préciser</p>
                <p><strong>Code Swift :</strong> À préciser</p>
                <p><strong>Titulaire :</strong> Orphelin Priorité ASBL</p>
                <p><strong>Adresse :</strong> Q. Katindo, Avenue Masisi, N°26, Goma, RDC</p>
            </div>
            <p>Après avoir effectué votre virement, merci de nous envoyer un email à <strong>donations@orphelinpriorite.org</strong> avec votre nom et le montant du don pour que nous puissions vous envoyer un reçu.</p>
            <p style="margin-top: 20px;"><strong>Note :</strong> Pour les dons supérieurs à 40€, un reçu fiscal vous sera délivré.</p>
        `;
    } else if (type === 'mobile') {
        title = 'Donner via Mobile Money';
        content = `
            <p>Pour effectuer un don via Mobile Money, veuillez utiliser l'un des numéros suivants :</p>
            <div style="background-color: var(--light); padding: 20px; border-radius: var(--border-radius); margin: 20px 0;">
                <p><strong>M-Pesa :</strong> 081 787 9584</p>
                <p><strong>Airtel Money :</strong> 099 597 4028</p>
                <p><strong>Orange Money :</strong> À préciser</p>
            </div>
            <p><strong>Instructions :</strong></p>
            <ol style="margin-left: 20px;">
                <li>Accédez à l'application de votre opérateur mobile</li>
                <li>Sélectionnez "Envoyer de l'argent"</li>
                <li>Entrez le numéro correspondant à votre opérateur</li>
                <li>Indiquez le montant de votre don</li>
                <li>Dans le message, écrivez "DON ORPHELIN"</li>
                <li>Validez la transaction</li>
            </ol>
            <p style="margin-top: 20px;">Après votre don, vous pouvez nous envoyer un screenshot à <strong>+243 817 879 584</strong> sur WhatsApp pour recevoir un reçu.</p>
        `;
    }
    
    if (donationModal) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalContent').innerHTML = content;
        donationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            if (modalClose) modalClose.focus();
        }, 100);
    }
}

function openGalleryModal(galleryItem) {
    const img = galleryItem.querySelector('img') || galleryItem.querySelector('.fas');
    const title = galleryItem.querySelector('h4')?.textContent || '';
    const description = galleryItem.querySelector('p')?.textContent || '';
    
    if (img && galleryModalImg && galleryModalCaption && galleryModal) {
        if (img.tagName === 'IMG') {
            galleryModalImg.src = img.src;
            galleryModalImg.alt = img.alt;
        } else {
            galleryModalImg.src = '';
            galleryModalImg.alt = title;
        }
        
        galleryModalCaption.textContent = `${title} - ${description}`;
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            if (galleryModalClose) galleryModalClose.focus();
        }, 100);
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' :
                   type === 'warning' ? 'var(--warning)' :
                   type === 'error' ? 'var(--accent)' : 'var(--primary)'};
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        z-index: 10000;
        box-shadow: var(--shadow);
        animation: fadeIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Exposer les fonctions globales
window.showDonationModal = showDonationModal;
window.openGalleryModal = openGalleryModal;