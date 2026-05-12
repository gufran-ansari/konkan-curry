/**
 * Konkan Curry - Premium UI Interactions
 * Centralized script for all pages
 */

async function loadHtmlComponents() {
    const componentSlots = Array.from(document.querySelectorAll('[data-component-src]'));
    if (!componentSlots.length) return;

    // Detect depth (how many '../' we need)
    const currentPath = window.location.pathname;
    const isSubfolder = currentPath.includes('/location/');
    const pathPrefix = isSubfolder ? '../' : '';

    await Promise.all(componentSlots.map(async (slot) => {
        let src = slot.getAttribute('data-component-src');
        if (!src) return;
        src = src.trim();

        try {
            const response = await fetch(src, { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }

            let html = await response.text();
            
            // Fix paths if in subfolder
            if (isSubfolder) {
                // Fix href and src that don't start with http, /, or #
                html = html.replace(/(href|src)="(?!(http|https|\/|#))([^"]+)"/g, `$1="${pathPrefix}$3"`);
            }

            slot.innerHTML = html;
            slot.removeAttribute('data-component-src');
            slot.setAttribute('data-component-loaded', 'true');
        } catch (error) {
            console.error(`Unable to load component: ${src}`, error);
            slot.setAttribute('data-component-error', 'true');
        }
    }));
}

function initKonkanCurryPage() {
    const isHomePage = document.body.classList.contains('page-home');

    initPreloader();
    initStickyHeader();
    initMenuLogic();
    initFormHandlers();
    initAnimations();
    initMenuPageAnimations();

    initFooterReveal();
    initPremiumPickers();
    initLocationLeafletMap();
    initTextHover();
    initThemeToggle();
    initLocationGalleryZoom();
    initReviews();

    if (isHomePage) {
        initIndexHomePageScripts();
    }
}

function bootKonkanCurryPage() {
    loadHtmlComponents()
        .catch((error) => {
            console.error('Unable to load HTML components.', error);
        })
        .finally(initKonkanCurryPage);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootKonkanCurryPage, { once: true });
} else {
    bootKonkanCurryPage();
}

/**
 * Branded Preloader Logic
 */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderPercent = document.getElementById('preloader-percent');

    if (!preloader || !preloaderBar) return;

    let progress = 0;
    let isFinished = false;
    let loadCompleted = false;

    const updatePreloader = () => {
        if (isFinished) return;

        const increment = loadCompleted ? 1.5 : 0.4;
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            finishLoading();
            return;
        }

        const displayProgress = Math.floor(progress);
        preloaderBar.style.width = `${displayProgress}%`;
        if (preloaderPercent) {
            preloaderPercent.textContent = `${displayProgress}%`;
        }

        requestAnimationFrame(updatePreloader);
    };

    const finishLoading = () => {
        if (isFinished) return;
        isFinished = true;
        preloaderBar.style.width = "100%";
        if (preloaderPercent) preloaderPercent.textContent = "100%";

        preloader.style.transition = "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.8s";
        preloader.style.opacity = "0";
        preloader.style.visibility = "hidden";
        preloader.style.pointerEvents = "none";

        // Reveal page content
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.classList.add('is-loaded');
        }

        setTimeout(() => {
            preloader.style.display = "none";
            // Trigger hero animations after preloader
            if (typeof gsap !== 'undefined') {
                gsap.from(".subpage-hero__title, .hero-title", {
                    y: 40,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power3.out"
                });
            }
        }, 800);
    };

    window.addEventListener("load", () => {
        loadCompleted = true;
    });

    // Safety fallback
    setTimeout(() => {
        loadCompleted = true;
    }, 4000);

    requestAnimationFrame(updatePreloader);
}

/**
 * Shared sticky header state
 */
function initStickyHeader() {
    const heroHeader = document.getElementById('hero-header');
    if (!heroHeader) return;

    const syncHeader = () => {
        heroHeader.classList.toggle('is-scrolled', window.scrollY > 18);
    };

    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
}

/**
 * Footer Reveal Effect
 */
function initFooterReveal() {
    const footer = document.querySelector('.kc-modern-footer');
    const reservationSection = document.querySelector('.kc-reservation');
    // Targeted selector to avoid ambiguous 'main' tag in overlays
    const mainContent = document.getElementById('page-content');
    
    if (!footer) return;

    const revealTarget = mainContent;
    if (!revealTarget) return;

    const updateFooterSpace = () => {
        const isDesktop = window.innerWidth >= 1024;

        if (isDesktop) {
            document.body.classList.add('kc-footer-reveal-active');
            const footerRect = footer.getBoundingClientRect();
            // Add a small 1px buffer for rounding issues
            revealTarget.style.marginBottom = `${Math.ceil(footerRect.height)}px`;
        } else {
            document.body.classList.remove('kc-footer-reveal-active');
            revealTarget.style.marginBottom = '0px';
        }
    };

    // Initial calculation
    updateFooterSpace();

    // ResizeObserver for modern, high-performance height tracking
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(updateFooterSpace);
        resizeObserver.observe(footer);
        // Also observe the component slot in case it shifts
        if (footer.parentElement) resizeObserver.observe(footer.parentElement);
    }

    // Re-calculate when images load
    const footerImages = footer.querySelectorAll('img');
    footerImages.forEach(img => {
        if (img.complete) {
            updateFooterSpace();
        } else {
            img.addEventListener('load', updateFooterSpace);
        }
    });

    window.addEventListener('resize', updateFooterSpace);
    window.addEventListener('load', updateFooterSpace);
    
    // Multiple re-calculations to catch late layout shifts (e.g. fonts loading)
    [100, 500, 1000, 2000, 5000].forEach(delay => {
        setTimeout(updateFooterSpace, delay);
    });

    // Fallback MutationObserver
    const observer = new MutationObserver(updateFooterSpace);
    observer.observe(footer, { childList: true, subtree: true, characterData: true, attributes: true });
}

/**
 * Off-Canvas Menu Logic
 */
function initMenuLogic() {
    const body = document.body;
    const menuOverlay = document.getElementById('menu-overlay');
    const mobileToggle = document.getElementById('mobile-toggle') || document.getElementById('open-menu');
    const closeMenu = document.getElementById('close-menu');

    if (!menuOverlay || !mobileToggle || !closeMenu) return;

    const menuLinks = menuOverlay.querySelectorAll('[data-menu-link]');
    const stageImages = Array.from(menuOverlay.querySelectorAll('.menu-stage-image'));
    const navItems = Array.from(menuOverlay.querySelectorAll('.menu-nav-item'));
    const navList = menuOverlay.querySelector('.menu-nav-list');
    const defaultPreviewLink = navItems.find((item) => item.querySelector('.menu-nav-link[data-target-image]'))?.querySelector('.menu-nav-link');

    let menuCloseTimer = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const CLOSE_DURATION = prefersReducedMotion ? 0 : 600;

    const syncBodyScrollLock = () => {
        const isMenuOpen = menuOverlay.classList.contains('active') || menuOverlay.classList.contains('is-closing');
        body.classList.toggle('menu-open', isMenuOpen);
        if (isMenuOpen) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    };

    const clearStageImages = () => {
        stageImages.forEach((img) => img.classList.remove('is-active'));
    };

    const activateStageImage = (targetId) => {
        if (!targetId) {
            clearStageImages();
            return;
        }

        const targetImg = menuOverlay.querySelector(`#${CSS.escape(targetId)}`);
        clearStageImages();
        if (targetImg) {
            targetImg.classList.add('is-active');
        }
    };

    const syncDefaultStageImage = () => {
        activateStageImage(defaultPreviewLink?.getAttribute('data-target-image'));
    };

    const toggleMenu = (isOpen) => {
        window.clearTimeout(menuCloseTimer);

        if (isOpen) {
            menuOverlay.classList.remove('is-closing');
            menuOverlay.classList.add('active');
            menuOverlay.setAttribute('aria-hidden', 'false');
            mobileToggle.setAttribute('aria-expanded', 'true');
            syncDefaultStageImage();

            if (typeof gsap !== 'undefined') {
                gsap.fromTo('.menu-nav-item',
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
                );
                gsap.fromTo('.menu-footer-col',
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.6 }
                );
            }
        } else {
            menuOverlay.classList.remove('active');
            menuOverlay.classList.add('is-closing');
            mobileToggle.setAttribute('aria-expanded', 'false');
            clearStageImages();

            menuCloseTimer = window.setTimeout(() => {
                menuOverlay.classList.remove('is-closing');
                menuOverlay.setAttribute('aria-hidden', 'true');
                syncBodyScrollLock();
            }, CLOSE_DURATION);
        }
        syncBodyScrollLock();
    };

    mobileToggle.addEventListener('click', () => toggleMenu(true));
    closeMenu.addEventListener('click', () => toggleMenu(false));
    menuOverlay.addEventListener('click', (e) => {
        if (e.target === menuOverlay) toggleMenu(false);
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    navItems.forEach((item) => {
        const link = item.querySelector('.menu-nav-link');
        if (!link) return;

        const showPreview = () => activateStageImage(link.getAttribute('data-target-image'));

        item.addEventListener('mouseenter', showPreview);
        item.addEventListener('pointerenter', showPreview);
        link.addEventListener('focus', showPreview);
    });

    if (navList) {
        navList.addEventListener('mouseleave', () => {
            clearStageImages();
        });
    }
}

/**
 * Premium Date & Time Pickers
 */
function initPremiumPickers() {
    if (typeof flatpickr === 'undefined') return;

    flatpickr(".date-picker", {
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        minDate: "today",
        disableMobile: true,
        onOpen: (selectedDates, dateStr, instance) => {
            instance.element.classList.add('active');
        },
        onClose: (selectedDates, dateStr, instance) => {
            instance.element.classList.remove('active');
        }
    });

    // Custom Time & Guest dropdown logic
    const initDropdown = (display, dropdownAttr, optionsAttr, hiddenAttr) => {
        const container = display.closest('.relative');
        if (!container) return;
        const dropdown = container.querySelector(`[${dropdownAttr}]`);
        const optionsContainer = container.querySelector(`[${optionsAttr}]`);
        const hiddenInput = container.querySelector(`[${hiddenAttr}]`);

        if (!dropdown || !optionsContainer || !hiddenInput) return;

        // Use existing options if present, otherwise we can still handle clicks on them
        const options = optionsContainer.querySelectorAll('[data-option]');
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = opt.dataset.option;
                display.value = val;
                hiddenInput.value = val;
                dropdown.classList.remove('show');
            });
        });

        display.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other dropdowns first
            document.querySelectorAll('[data-time-dropdown], [data-guest-dropdown]').forEach(d => {
                if (d !== dropdown) d.classList.remove('show');
            });
            dropdown.classList.toggle('show');
        });
    };

    document.querySelectorAll('[data-time-display]').forEach(el => initDropdown(el, 'data-time-dropdown', 'data-time-options', 'data-time-value'));
    document.querySelectorAll('[data-guest-display]').forEach(el => initDropdown(el, 'data-guest-dropdown', 'data-guest-options', 'data-guest-value'));

    document.addEventListener('click', () => {
        document.querySelectorAll('[data-time-dropdown], [data-guest-dropdown]').forEach(el => el.classList.remove('show'));
    });
}

/**
 * Form Handlers
 */
function initFormHandlers() {
    const reservationForm = document.querySelector('.reservation-card form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = reservationForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;
            setTimeout(() => {
                alert('Reservation request sent successfully!');
                btn.innerHTML = originalText;
                btn.disabled = false;
                reservationForm.reset();
            }, 1500);
        });
    }
}

/**
 * Leaflet multi-location map
 */
function initLocationLeafletMap() {
    const mapElement = document.getElementById('location-leaflet-map');
    if (!mapElement || typeof L === 'undefined') return;
    if (document.body.classList.contains('page-contact') || document.body.classList.contains('page-location')) return;

    const map = L.map(mapElement, { zoomControl: false, scrollWheelZoom: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    const locations = [
        { name: 'Seawoods Grand Central Mall', lat: 19.02188, lng: 73.01783 },
        { name: 'Inorbit Mall Vashi', lat: 19.0657, lng: 73.0012 },
        { name: 'Viviana Mall Thane', lat: 19.2086, lng: 72.9717 },
        { name: 'The Capital Mall Vasai', lat: 19.4078, lng: 72.8219 }
    ];

    const markers = locations.map(loc => L.marker([loc.lat, loc.lng]).addTo(map).bindPopup(loc.name));
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
}

/**
 * Text Hover Interactions
 */
function initTextHover() {
    const targets = document.querySelectorAll('.text-hover-target');
    targets.forEach(target => {
        target.addEventListener('mouseenter', () => document.body.classList.add('text-hover-active'));
        target.addEventListener('mouseleave', () => document.body.classList.remove('text-hover-active'));
    });
}

/**
 * Theme Toggle
 */
function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-mode');
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('bi-brightness-high-fill');
            icon.classList.toggle('bi-moon-stars-fill');
        }
    });
}

/**
 * Location Gallery Zoom
 */
function initLocationGalleryZoom() {
    if (!document.body.classList.contains('page-location')) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById('location-gallery-zoom');
    const pin = section?.querySelector('[data-location-gallery-pin]');
    const header = section?.querySelector('.location-gallery-zoom__header');
    const tiles = section ? gsap.utils.toArray('[data-gallery-tile]') : [];
    const focus = section?.querySelector('[data-gallery-focus]');
    const focusImage = focus?.querySelector('img');
    const expansion = section?.querySelector('[data-gallery-expansion]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCompactLayout = window.matchMedia('(max-width: 991px)').matches;

    if (!section || !pin || !tiles.length || !focus || !focusImage || !expansion) return;

    ScrollTrigger.getAll()
        .filter(trigger => trigger.vars.trigger === section)
        .forEach(trigger => trigger.kill());

    const headerElements = header ? Array.from(header.children) : [];
    const animatedElements = [...headerElements, ...tiles, focus, focusImage, expansion];

    if (prefersReducedMotion || isCompactLayout) {
        gsap.set(animatedElements, { clearProps: 'all' });
        return;
    }

    const tileMotion = [
        { xPercent: 34, yPercent: 28, scale: 0.42, opacity: 0.12, rotate: -8 },
        { xPercent: 16, yPercent: 26, scale: 0.48, opacity: 0.16, rotate: -5 },
        { xPercent: -34, yPercent: 28, scale: 0.42, opacity: 0.12, rotate: 8 },
        { xPercent: 42, yPercent: 8, scale: 0.46, opacity: 0.14, rotate: -10 },
        { xPercent: -42, yPercent: 2, scale: 0.46, opacity: 0.14, rotate: 10 },
        { xPercent: 28, yPercent: -22, scale: 0.44, opacity: 0.12, rotate: -7 },
        { xPercent: 10, yPercent: -30, scale: 0.4, opacity: 0.1, rotate: -4 },
        { xPercent: -10, yPercent: -30, scale: 0.4, opacity: 0.1, rotate: 4 },
        { xPercent: -28, yPercent: -22, scale: 0.44, opacity: 0.12, rotate: 7 }
    ];

    const syncFocusExpansionState = () => {
        const focusRect = focus.getBoundingClientRect();
        const scaleX = window.innerWidth / focusRect.width;
        const scaleY = window.innerHeight / focusRect.height;
        const x = window.innerWidth / 2 - (focusRect.left + focusRect.width / 2);
        const y = window.innerHeight / 2 - (focusRect.top + focusRect.height / 2);

        focus.style.setProperty('--location-focus-expand-x', `${x}px`);
        focus.style.setProperty('--location-focus-expand-y', `${y}px`);
        focus.style.setProperty('--location-focus-scale-x', `${scaleX}`);
        focus.style.setProperty('--location-focus-scale-y', `${scaleY}`);
    };

    gsap.set(headerElements, { y: 0, opacity: 1 });
    gsap.set(tiles, { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, rotate: 0, transformOrigin: 'center center' });
    gsap.set(focus, {
        opacity: 1,
        zIndex: 8,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        borderRadius: 28,
        transformOrigin: 'center center'
    });
    gsap.set(focusImage, { scale: 1.02, transformOrigin: 'center center' });
    gsap.set(expansion, { clearProps: 'all' });
    syncFocusExpansionState();

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=155%',
            scrub: 1,
            pin,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: syncFocusExpansionState,
            onRefresh: syncFocusExpansionState
        }
    });

    if (headerElements.length) {
        timeline.to(headerElements, {
            y: -40,
            opacity: 0,
            stagger: 0.04,
            duration: 0.18,
            ease: 'power2.out'
        }, 0);
    }

    timeline.to(tiles, {
        xPercent: (index) => tileMotion[index]?.xPercent ?? 0,
        yPercent: (index) => tileMotion[index]?.yPercent ?? 0,
        scale: (index) => tileMotion[index]?.scale ?? 0.45,
        opacity: (index) => tileMotion[index]?.opacity ?? 0.12,
        rotate: (index) => tileMotion[index]?.rotate ?? 0,
        stagger: 0.02,
        duration: 0.34,
        ease: 'power2.inOut'
    }, 0.08);

    timeline.to(focus, {
        x: () => parseFloat(getComputedStyle(focus).getPropertyValue('--location-focus-expand-x')) || 0,
        y: () => parseFloat(getComputedStyle(focus).getPropertyValue('--location-focus-expand-y')) || 0,
        scaleX: () => parseFloat(getComputedStyle(focus).getPropertyValue('--location-focus-scale-x')) || 1,
        scaleY: () => parseFloat(getComputedStyle(focus).getPropertyValue('--location-focus-scale-y')) || 1,
        borderRadius: 0,
        duration: 0.52,
        ease: 'power3.inOut'
    }, 0.18);

    timeline.to(focusImage, {
        scale: 1,
        duration: 0.52,
        ease: 'power3.inOut'
    }, 0.18);

    timeline.to({}, { duration: 0.18 });
}

/**
 * Reviews Stack
 */
function initReviews() {
    const container = document.querySelector('#reviews-stack-container');
    if (!container || typeof gsap === 'undefined') return;
    // ... reviews logic ...
}

/**
 * Global Page Animations
 */
function initAnimations() {
    if (typeof gsap === 'undefined') return;

    const revealElements = gsap.utils.toArray('.reveal-content');
    const processed = new Set();

    revealElements.forEach(el => {
        if (processed.has(el) || document.body.classList.contains('page-home')) return;

        const parent = el.parentElement;
        // Find siblings with the same class under the same immediate parent
        const siblings = gsap.utils.toArray('.reveal-content', parent).filter(s => s.parentElement === parent);

        if (siblings.length > 1) {
            // Grouped animation for siblings (e.g., cards in a grid)
            gsap.from(siblings, {
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: parent,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
            siblings.forEach(s => processed.add(s));
        } else {
            // Individual animation for standalone elements
            gsap.from(el, {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            });
            processed.add(el);
        }
    });
}

function initMenuPageAnimations() {
    if (!document.body.classList.contains('page-menu') || typeof gsap === 'undefined') return;

    const menuItems = gsap.utils.toArray('.global-menu__item--gsap');
    if (!menuItems.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    menuItems.forEach((item, index) => {
        const line = item.querySelector('[data-gsap-inline-reveal]');
        const image = item.querySelector('.global-menu__image--gsap');
        const leftWord = item.querySelector('.global-menu__word--left');
        const rightWord = item.querySelector('.global-menu__word--right');
        const gap = item.querySelector('.global-menu__gap--gsap');

        if (!line || !image || !leftWord || !rightWord || !gap) return;

        if (prefersReducedMotion) {
            gsap.set([item, leftWord, rightWord], { clearProps: 'all' });
            gsap.set(gap, { width: 'clamp(140px, 18vw, 240px)' });
            gsap.set(image, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50 });
            item.classList.add('is-active');
            return;
        }

        gsap.set(item, { opacity: 0, y: 32 });
        gsap.set(leftWord, { x: 36 });
        gsap.set(rightWord, { x: -36 });
        gsap.set(gap, { width: 0 });
        gsap.set(image, { opacity: 0, scale: 0.82, xPercent: -50, yPercent: -50 });

        const hoverTimeline = gsap.timeline({
            paused: true,
            defaults: { ease: 'power3.out', duration: 0.45 }
        });

        hoverTimeline
            .to(gap, { width: 'clamp(140px, 18vw, 240px)' }, 0)
            .to(leftWord, { x: 0 }, 0)
            .to(rightWord, { x: 0 }, 0)
            .to(image, { opacity: 1, scale: 1, duration: 0.45 }, 0);

        const activateItem = () => {
            item.classList.add('is-active');
            hoverTimeline.play();
        };

        const deactivateItem = () => {
            item.classList.remove('is-active');
            hoverTimeline.reverse();
        };

        item.addEventListener('mouseenter', activateItem);
        item.addEventListener('mouseleave', deactivateItem);
        item.addEventListener('focusin', activateItem);
        item.addEventListener('focusout', (event) => {
            if (!item.contains(event.relatedTarget)) {
                deactivateItem();
            }
        });

        gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: index * 0.08,
            scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });
}

/**
 * Index page legacy inline scripts migrated to external file
 */
/**
 * Homepage-specific cinematic scripts
 * Consolidates GSAP timelines and special sliders
 */
function initIndexHomePageScripts() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger not loaded for homepage scripts");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Helper for cinematic sliders
    function createCinematicSlider({
        trackId,
        bgContainerId,
        titleId,
        descId,
        prevId,
        nextId,
        slides
    }) {
        const track = document.getElementById(trackId);
        const bgContainer = document.getElementById(bgContainerId);
        const mainTitle = document.getElementById(titleId);
        const mainDesc = document.getElementById(descId);

        if (!track || !bgContainer || !mainTitle || !mainDesc) return;

        let currentIndex = 0;
        let autoplayTimer;

        function initSlider() {
            slides.forEach((slide, i) => {
                const bg = document.createElement("div");
                bg.className = `slider-bg-layer z-0 ${i === 0 ? 'active' : ''}`;
                bg.style.backgroundImage = `url('${slide.image}')`;
                bgContainer.insertBefore(bg, bgContainer.lastElementChild);
            });

            slides.forEach((slide, i) => {
                const card = document.createElement("div");
                card.className = "slider-card-item";
                card.dataset.index = i;
                card.innerHTML = `<img src="${slide.image}" class="slider-card-image" alt="${slide.title}">`;
                card.addEventListener("click", () => {
                    goToSlide(i);
                    resetAutoplay();
                });
                track.appendChild(card);
            });

            updateSlider();
            startAutoplay();
        }

        function updateSlider() {
            const cards = track.querySelectorAll(".slider-card-item");
            const bgs = bgContainer.querySelectorAll(".slider-bg-layer");

            if (!mainTitle || !mainDesc) return;

            mainTitle.style.opacity = 0;
            mainDesc.style.opacity = 0;

            setTimeout(() => {
                if (slides[currentIndex]) {
                    mainTitle.textContent = slides[currentIndex].title;
                    mainDesc.textContent = slides[currentIndex].desc;
                }
                mainTitle.style.opacity = 1;
                mainDesc.style.opacity = 1;
            }, 300);

            bgs.forEach((bg, i) => {
                bg.classList.toggle("active", i === currentIndex);
            });

            cards.forEach((card, i) => {
                card.className = "slider-card-item";
                if (i === currentIndex) card.classList.add("active");
                else if (i === (currentIndex + 1) % slides.length) card.classList.add("next-1");
                else if (i === (currentIndex + 2) % slides.length) card.classList.add("next-2");
                else if (i === (currentIndex + 3) % slides.length) card.classList.add("next-3");
                else card.classList.add("prev");
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
        }

        function startAutoplay() {
            autoplayTimer = setInterval(nextSlide, 3500);
        }

        function resetAutoplay() {
            clearInterval(autoplayTimer);
            startAutoplay();
        }

        document.getElementById(nextId)?.addEventListener("click", () => {
            nextSlide();
            resetAutoplay();
        });

        document.getElementById(prevId)?.addEventListener("click", () => {
            prevSlide();
            resetAutoplay();
        });

        initSlider();
    }

    // Initialize gathering slider
    createCinematicSlider({
        trackId: "gathering-cards-track",
        bgContainerId: "gathering-bg-container",
        titleId: "gathering-main-title",
        descId: "gathering-main-desc",
        prevId: "gathering-prev",
        nextId: "gathering-next",
        slides: [
            { id: 1, image: "assets/images/family.webp", title: "Family Dining", desc: "Comfortable seating and a setting that works for everyone at the table." },
            { id: 2, image: "assets/images/office.webp", title: "Office Gatherings", desc: "Spacious layouts and an atmosphere that balances casual and professional." },
            { id: 3, image: "assets/images/client.webp", title: "Client Meetings", desc: "A refined environment that makes the right impression." },
            { id: 4, image: "assets/images/celebration.webp", title: "Celebrations", desc: "Moments that feel special without needing extra effort." },
        ]
    });

    // Cinematic Scroll Animations
    gsap.fromTo(".cinematic-intro-text", {
        y: "100%",
        opacity: 0
    }, {
        y: "0%",
        opacity: 1,
        ease: "power1.out",
        scrollTrigger: {
            trigger: "#cinematic-scroll-section",
            start: "top bottom",
            end: "top top",
            scrub: 1
        }
    });

    const cinematicTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#cinematic-scroll-section",
            start: "top top",
            end: "+=250%",
            pin: true,
            scrub: 1.5,
            anticipatePin: 1
        }
    });

    cinematicTL.to(".cinematic-intro-text", {
        y: "-30vh",
        duration: 3,
        ease: "none"
    }, 0);

    cinematicTL.to(".cinematic-heading", {
        fontSize: "7rem",
        duration: 1,
        ease: "power2.inOut"
    }, 0.2);

    cinematicTL.to(".overlay-panel", {
        y: "0%",
        duration: 1.5,
        ease: "power3.inOut"
    }, 1);

    const revealTrack = document.querySelector(".cards-reveal-track");
    const totalWidth = revealTrack ? revealTrack.scrollWidth - window.innerWidth + 200 : 0;
    const revealCards = gsap.utils.toArray(".reveal-card");

    cinematicTL.from(revealCards, {
        x: 400,
        opacity: 0,
        stagger: 0.4,
        duration: 1,
        ease: "power2.out"
    });

    if (totalWidth > 0) {
        cinematicTL.to(".cards-reveal-track", {
            x: -totalWidth,
            duration: 2,
            ease: "none"
        });
    }

    // Stats Counter Animation
    const statsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#modern-stats",
            start: "top 70%",
            once: true
        }
    });

    statsTimeline.from("#modern-stats .max-w-3xl > *", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    });

    statsTimeline.from(".stat-item", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
    }, "-=0.6");

    document.querySelectorAll(".stat-number").forEach((num, index) => {
        const targetAttr = num.getAttribute("data-target");
        if (!targetAttr) return;
        const target = Number(targetAttr);
        const counter = { value: 0 };

        statsTimeline.to(counter, {
            value: target,
            duration: 2.4,
            ease: "power4.out",
            onStart: function () {
                num.textContent = "0";
            },
            onUpdate: function () {
                num.textContent = Math.floor(counter.value).toLocaleString();
            },
            onComplete: function () {
                num.textContent = target.toLocaleString();
            }
        }, 0.9 + (index * 0.12));
    });

    // Reservation Form Animation
    const reservationSection = document.querySelector("#reservation-form");
    if (reservationSection) {
        const reservationTL = gsap.timeline({
            scrollTrigger: {
                trigger: "#reservation-form",
                start: "top 70%",
                toggleActions: "play none none none"
            }
        });

        reservationTL.from(".reservation-copy > *", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out"
        });

        reservationTL.from(".field", {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.4");

        gsap.to(".reservation-copy img", {
            y: -60,
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
                trigger: "#reservation-form",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }
}
