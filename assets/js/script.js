if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true
  });
}

async function fetchComponentHtml(rawSrc, isSubfolder) {
  const filename = rawSrc.split("/").pop();
  const candidates = [
    rawSrc,
    "assets/components/" + filename,
    "/assets/components/" + filename,
    "../assets/components/" + filename,
    "../../assets/components/" + filename,
  ];

  for (const path of candidates) {
    try {
      const res = await fetch(path, { cache: "no-cache" });
      if (res.ok) {
        return await res.text();
      }
    } catch (err) {
      // Try next fallback path
    }
  }
  return null;
}

async function loadHtmlComponents() {
  const slots = Array.from(document.querySelectorAll("[data-component-src]"));
  if (!slots.length) return;

  const hasBaseTag = !!document.querySelector('base[href="/"]');
  const isSubfolder =
    !hasBaseTag &&
    (document.body.classList.contains("page-location") ||
      /\/location(\/|$)/i.test(window.location.pathname));

  await Promise.all(
    slots.map(async (slot) => {
      const src = (slot.getAttribute("data-component-src") || "").trim();
      if (!src) return;

      try {
        let html = await fetchComponentHtml(src, isSubfolder);
        if (!html) throw new Error(`HTTP fetch failed for all candidate paths of ${src}`);

        if (isSubfolder) {
          html = html.replace(
            /\b(href|src)="(?!https?:|mailto:|tel:|\/|#|javascript:|\.\.\/)([^"]+)"/g,
            '$1="../$2"'
          );
        }

        slot.innerHTML = html;
        slot.removeAttribute("data-component-src");
        slot.setAttribute("data-component-loaded", "true");
      } catch (error) {
        console.error(`Unable to load component: ${src}`, error);
        slot.setAttribute("data-component-error", "true");
      }
    })
  );
}

function initStickyHeader() {
  const header = document.getElementById("hero-header");
  if (!header) return;

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      start: "top -12",
      onEnter: () => header.classList.add("is-scrolled"),
      onLeaveBack: () => header.classList.remove("is-scrolled"),
    });
  } else {
    const syncHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }
}

function initMenuLogic() {
  const body = document.body;
  const overlay = document.getElementById("menu-overlay");
  const openButton = document.getElementById("mobile-toggle");
  const closeButton = document.getElementById("close-menu");

  if (!overlay || !openButton || !closeButton) return;

  const menuLinks = overlay.querySelectorAll("[data-menu-link]");

  const setMenuOpen = (isOpen) => {
    overlay.classList.toggle("active", isOpen);
    overlay.setAttribute("aria-hidden", String(!isOpen));
    openButton.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("menu-open", isOpen);
  };

  openButton.addEventListener("click", () => setMenuOpen(true));
  closeButton.addEventListener("click", () => setMenuOpen(false));

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) setMenuOpen(false);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });
}

function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const heroSection = document.querySelector('.kc-hero-section');
  if (!heroSection) return;

  const slider = document.querySelector('.kc-hero-slider');
  const badge = document.querySelector('.kc-hero-badge');
  const title = document.querySelector('.kc-hero-section__title');
  const subheading = document.querySelector('.kc-hero-section__subheading');
  const actions = document.querySelector('.kc-hero-section__actions');
  const scrollIndicator = document.querySelector('.kc-scroll-indicator');

  // Initial Load Animation
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Reset opacity and positions for elements
  gsap.set([badge, title, subheading, actions, scrollIndicator], { opacity: 0 });
  gsap.set(title, { y: 40 });
  gsap.set(subheading, { y: 20 });
  gsap.set(actions, { y: 20 });
  gsap.set(badge, { y: -20 });

  tl.to(slider, {
    scale: 1,
    opacity: 1,
    duration: 2,
    ease: 'power2.out'
  })
  .to(badge, { opacity: 1, y: 0, duration: 1 }, "-=1")
  .to(title, { opacity: 1, y: 0, duration: 1.2 }, "-=0.8")
  .to(subheading, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
  .to(actions, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
  .to(scrollIndicator, { opacity: 1, duration: 1 }, "-=0.4");

  // Parallax on Scroll
  gsap.to(slider, {
    y: '15%',
    ease: 'none',
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Fade out content on scroll
  gsap.to('.kc-hero-section__inner', {
    y: '-10%',
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}

function initHeroSlider() {
  const slides = document.querySelectorAll('.kc-hero-slide');
  const dots = document.querySelectorAll('.kc-hero-slider__dot');
  if (!slides.length) return;

  let currentSlide = 0;
  const slideCount = slides.length;
  let autoPlayTimer;

  function goToSlide(n) {
    slides[currentSlide].classList.remove('active');
    if (dots.length) dots[currentSlide].classList.remove('active');
    
    currentSlide = (n + slideCount) % slideCount;
    
    slides[currentSlide].classList.add('active');
    if (dots.length) dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function startAutoPlay() {
    autoPlayTimer = setInterval(nextSlide, 6000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      stopAutoPlay();
      startAutoPlay();
    });
  });

  startAutoPlay();
}

function initNarrativeScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  const narrativeSection = document.querySelector('.kc-narrative');
  if (!narrativeSection) return;

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const lines = gsap.utils.toArray('.kc-narrative__line');
  const bgs = gsap.utils.toArray('.kc-narrative__bg');
  const closing = narrativeSection.querySelector('.kc-narrative__closing');
  const warmth = narrativeSection.querySelector('.kc-narrative__warmth');
  const steam = narrativeSection.querySelector('.kc-narrative__steam');
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  if (!lines.length) return;
  
  gsap.set(lines, {
    opacity: 0,
    y: isMobile ? 28 : 48,
    force3D: true
  });
  gsap.set(bgs, { opacity: 0, scale: isMobile ? 1.02 : 1.06 });
  gsap.set(bgs[0], { opacity: 1 });
  if (closing) gsap.set(closing, { opacity: 0, y: isMobile ? 12 : 18 });

  if (isMobile) {
    let activeStep = -1;

    const showStep = (step) => {
      if (step === activeStep) return;
      activeStep = step;

      lines.forEach((line, index) => {
        gsap.to(line, {
          opacity: index === step ? 1 : 0,
          y: index === step ? 0 : -18,
          duration: 0.24,
          overwrite: true,
          ease: 'power2.out'
        });
      });

      bgs.forEach((bg, index) => {
        gsap.to(bg, {
          opacity: index === Math.min(step, bgs.length - 1) ? 1 : 0,
          scale: 1,
          duration: 0.4,
          overwrite: true,
          ease: 'sine.inOut'
        });
      });

      if (closing) {
        gsap.to(closing, {
          opacity: step === lines.length ? 1 : 0,
          y: step === lines.length ? 0 : 12,
          duration: 0.24,
          overwrite: true,
          ease: 'power2.out'
        });
      }
    };

    showStep(0);

    ScrollTrigger.create({
      trigger: narrativeSection,
      start: 'top top',
      end: 'bottom top',
      pin: '.kc-narrative__pin-container',
      pinSpacing: false,
      anticipatePin: 1,
      onUpdate: (self) => {
        const stepCount = closing ? lines.length + 1 : lines.length;
        const step = Math.min(stepCount - 1, Math.floor(self.progress * stepCount));
        showStep(step);
      }
    });

    return;
  }
  
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: narrativeSection,
      start: 'top top',
      end: 'bottom top',
      pin: '.kc-narrative__pin-container',
      pinSpacing: false,
      scrub: 1.15,
      anticipatePin: 1,
      markers: false
    }
  });

  if (warmth) {
    tl.to(warmth, {
      x: isMobile ? '2%' : '7%',
      opacity: isMobile ? 0.34 : 0.78,
      duration: lines.length * 1.15,
      ease: 'none'
    }, 0);
  }

  if (steam) {
    tl.to(steam, {
      y: isMobile ? '-4%' : '-12%',
      opacity: isMobile ? 0.24 : 0.38,
      duration: lines.length * 1.15,
      ease: 'none'
    }, 0);
  }

  lines.forEach((line, i) => {
    const cue = i * 1.18;
    const nextLine = lines[i + 1];
    const bg = bgs[i];
    const nextBg = bgs[i + 1];

    tl.to(line, {
      opacity: 1,
      y: 0,
      duration: 0.42,
      ease: 'power2.out'
    }, cue);

    tl.to(line, {
      y: isMobile ? -6 : -14,
      duration: 0.56,
      ease: 'none'
    }, cue + 0.42);

    if (bg) {
      tl.to(bg, {
        scale: isMobile ? 1 : 1.015,
        duration: 1.16,
        ease: 'none'
      }, cue);
    }

    if (nextBg) {
      tl.to(nextBg, {
        opacity: 1,
        scale: isMobile ? 1 : 1.025,
        duration: 0.72,
        ease: 'sine.inOut'
      }, cue + 0.62);
    }

    if (nextLine) {
      tl.to(line, {
        opacity: isMobile ? 0 : 0.08,
        y: isMobile ? -26 : -46,
        duration: 0.46,
        ease: 'power2.in'
      }, cue + 0.9);
    } else {
      tl.to(line, {
        opacity: 0,
        y: isMobile ? -24 : -40,
        duration: 0.46,
        ease: 'power2.in'
      }, cue + 1.04);
    }
  });

  if (closing) {
    const closingCue = lines.length * 1.18;

    tl.to(closing, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, closingCue - 0.18)
    .to(closing, {
      opacity: 1,
      duration: 0.38,
      ease: 'none'
    })
    .to(closing, {
      opacity: 0,
      y: isMobile ? -12 : -18,
      duration: 0.34,
      ease: 'power2.in'
    });
  }
}

function initShowcaseScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  // Mobile check - don't run horizontal scroll on mobile
  if (window.innerWidth < 768) return;

  const track = document.querySelector('.kc-showcase__track');
  const container = document.querySelector('.kc-showcase');
  if (!track || !container) return;

  const slides = gsap.utils.toArray('.kc-showcase__slide');
  
  // Get the total horizontal scroll width
  let getToValue = () => -(track.scrollWidth - window.innerWidth);

  // Pin and horizontal scroll timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: () => "+=" + (track.scrollWidth - window.innerWidth),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1
    }
  });

  tl.to(track, {
    x: getToValue,
    ease: "none"
  });

  // Parallax and fade effects for individual items during scroll
  slides.forEach((slide) => {
    const img = slide.querySelector('.kc-showcase__img');
    const content = slide.querySelector('.kc-showcase__content');
    
    if(img && content) {
      // containerAnimation for scroll triggers inside the horizontal track
      gsap.fromTo(img, 
        { scale: 1.1, x: 50, opacity: 0.5 },
        { 
          scale: 1, 
          x: 0, 
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: slide,
            containerAnimation: tl,
            start: "left 80%", // when slide enters from right
            end: "center center",
            scrub: true
          }
        }
      );

      gsap.fromTo(content, 
        { x: -30, opacity: 0 },
        { 
          x: 0, 
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: slide,
            containerAnimation: tl,
            start: "left 70%",
            end: "center center",
            scrub: true
          }
        }
      );
    }
  });
}

function initCraftScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  const section = document.querySelector('#chefs-picks');
  if (!section) return;

  const blocks = section.querySelectorAll('.kc-craft__block');
  const visuals = section.querySelectorAll('.kc-craft__visual');
  
  if (!blocks.length || !visuals.length) return;

  // High-performance scroll-driven synchronization using Intersection Observer
  if (window.innerWidth >= 768) {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -20% 0px', // Top 10% (90% from top), Bottom 20%
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const index = Array.from(blocks).indexOf(entry.target);
        
        if (entry.isIntersecting) {
          // When heading enters the active zone (20% from bottom)
          entry.target.classList.add('is-active');
          
          // Switch image in the right section
          visuals.forEach((vis, idx) => {
            vis.classList.toggle('active', idx === index);
          });
        } else {
          // When heading exits (10% from top or falls below 20% bottom)
          entry.target.classList.remove('is-active');
        }
      });
    }, observerOptions);

    blocks.forEach(block => observer.observe(block));
  } else {
    // Mobile simple fade in
    blocks.forEach(block => {
      gsap.fromTo(block, 
        { opacity: 0, y: 20 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: block,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    });
    
    // Auto-cycle visuals on mobile since we don't pin
    let currentVis = 0;
    setInterval(() => {
      visuals.forEach(v => v.classList.remove('active'));
      currentVis = (currentVis + 1) % visuals.length;
      visuals[currentVis].classList.add('active');
    }, 3000);
  }
}

function initGalleryMarqueeReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.kc-visual-marquee');
  if (!section) return;

  const headerChildren = section.querySelectorAll('.mx-auto > *');
  
  gsap.from(headerChildren, {
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.15,
    ease: "power2.out"
  });
}

function initIntroStoryReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.getElementById('intro-story');
  if (!section) return;

  const header = section.querySelector('.reveal-story-header');
  const content = section.querySelector('.reveal-story-content');
  const marquee = section.querySelector('.kc-icon-marquee');

  gsap.from(header, {
    scrollTrigger: {
      trigger: header,
      start: "top 85%",
    },
    opacity: 0,
    y: 40,
    duration: 1,
    ease: "power3.out"
  });

  gsap.from(content, {
    scrollTrigger: {
      trigger: content,
      start: "top 80%",
    },
    opacity: 0,
    y: 40,
    duration: 1,
    delay: 0.2,
    ease: "power3.out"
  });

  gsap.from(marquee, {
    scrollTrigger: {
      trigger: marquee,
      start: "top 90%",
    },
    opacity: 0,
    duration: 1.2,
    delay: 0.4,
    ease: "power2.out"
  });
}

function initMenuTeaser() {
  const container = document.getElementById('menu-teaser-items');
  const tabs = document.querySelectorAll('.kc-menu-teaser__tab');
  if (!container || !tabs.length) return;

  const menuData = {
    seafood: [
      { name: "Surmai Tawa Fry", desc: "Fresh Kingfish slices marinated in fiery coastal red chilli masala & rava coat.", tag: "Bestseller" },
      { name: "Pomfret Rava Fry", desc: "Golden, crisp semolina crust wrapped around succulent whole Pomfret.", tag: "Must Try" },
      { name: "Prawn Gassi", desc: "Authentic Mangalorean style prawn curry with coconut and tangy kokum.", tag: "Chef Special" },
      { name: "Crab Masala Roast", desc: "Slow-cooked fresh crab in roasted coastal spices and grated coconut.", tag: "Specialty" }
    ],
    starters: [
      { name: "Chicken Tikka", desc: "Tender chicken chunks marinated in spiced yoghurt & char-grilled in tandoor.", tag: "Tandoori" },
      { name: "Malai Paneer Tikka", desc: "Creamy cottage cheese cubes marinated in herbs, cashew & mild spices.", tag: "Veg Special" },
      { name: "Crispy Seafood Pakora", desc: "Assorted fresh catch tossed in chickpea flour, ajwain & green chilli.", tag: "Crispy" },
      { name: "Chicken Chilli Dry", desc: "Wok-tossed chicken cubes with green bell peppers & dark soy sauce.", tag: "Chinese" }
    ],
    maharashtrian: [
      { name: "Mutton Sukka", desc: "Tender mutton cooked with roasted dry spices, coconut & curry leaves.", tag: "Authentic" },
      { name: "Sol Kadhi", desc: "Refreshing pink Kokum & coconut milk digestive infused with garlic & green chillies.", tag: "Cooling" },
      { name: "Kombdi Vade", desc: "Classic Konkan chicken curry served with fluffy rice & lentil puris (Vade).", tag: "Traditional" },
      { name: "Kolhapuri Fish Curry", desc: "Fiery red fish curry spiced with authentic Kolhapuri masala.", tag: "Spicy" }
    ],
    maincourse: [
      { name: "Butter Chicken", desc: "Charcoal-grilled chicken cooked in rich tomato, butter & cashew gravy.", tag: "Popular" },
      { name: "Dal Tadka", desc: "Yellow lentils tempered with ghee, cumin, garlic & fresh coriander.", tag: "Homestyle" },
      { name: "Paneer Butter Masala", desc: "Soft cottage cheese in a mildly spiced tomato & cream sauce.", tag: "Classic" },
      { name: "Chicken Biryani", desc: "Long-grain basmati rice layered with spiced chicken, mint & saffron.", tag: "Basmati Khazana" }
    ],
    chinese: [
      { name: "Veg Hakka Noodles", desc: "Stir-fried noodles with crisp vegetables, soy sauce & aromatic spices.", tag: "Chinese" },
      { name: "Chicken Fried Rice", desc: "Flavourful rice tossed with tender chicken, spring onions & egg.", tag: "Wok Special" },
      { name: "Chilli Chicken Gravy", desc: "Succulent chicken in a tangy, spicy Indo-Chinese chilli sauce.", tag: "Spicy" }
    ],
    beverages: [
      { name: "Coastal Tropical Mocktail", desc: "Chilled refreshing tropical fruit blend with kokum & lime.", tag: "Mocktail" },
      { name: "Gulab Jamun with Ice Cream", desc: "Soft fried milk dumplings served warm with vanilla ice cream.", tag: "Dessert" },
      { name: "Kesar Pista Kulfi", desc: "Traditional rich & creamy Indian pistachios & saffron ice cream.", tag: "Dessert" },
      { name: "Kokum Sharbat", desc: "Classic tangy-sweet coastal refreshment beverage.", tag: "Beverage" }
    ]
  };

  function renderCategory(category, animateIn = true) {
    const items = menuData[category];
    if (!items) return;

    let html = '';
    items.forEach(item => {
      const tagHtml = item.tag ? `<span class="kc-menu-item__tag">${item.tag}</span>` : '';
      html += `
        <div class="kc-menu-item">
          <div class="kc-menu-item__header">
            <h4 class="kc-menu-item__title">${item.name}</h4>
            ${tagHtml}
          </div>
          <p class="kc-menu-item__desc">${item.desc}</p>
        </div>
      `;
    });

    container.innerHTML = html;

    if (animateIn && typeof gsap !== 'undefined') {
      const menuNodes = container.querySelectorAll('.kc-menu-item');
      gsap.fromTo(menuNodes, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
      );
    }
  }

  // Initial render (no animation till scroll)
  renderCategory('seafood', false);

  // Tab click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-category');
      
      if (typeof gsap !== 'undefined') {
        const existingNodes = container.querySelectorAll('.kc-menu-item');
        if (existingNodes.length) {
          gsap.to(existingNodes, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            onComplete: () => renderCategory(cat, true)
          });
        } else {
          renderCategory(cat, true);
        }
      } else {
        renderCategory(cat, false);
      }
    });
  });

  // Scroll Reveal
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const section = document.querySelector('.kc-menu-teaser');
    const headerCol = document.querySelector('.kc-menu-teaser__header-col');
    
    // Animate Header
    if (headerCol) {
      gsap.from(headerCol, {
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out"
      });
    }

    // Animate tabs
    gsap.from('.kc-menu-teaser__tabs', {
      scrollTrigger: {
        trigger: section,
        start: "top 60%",
      },
      opacity: 0,
      x: 20,
      duration: 0.6,
      ease: "power2.out"
    });

    // Animate initial items
    gsap.from('.kc-menu-item', {
      scrollTrigger: {
        trigger: section,
        start: "top 60%",
      },
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    });
  }
}
function initReviewsScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.kc-reviews');
  if (!section) return;

  const h2 = section.querySelector('h2');
  const label = section.querySelector('.kc-craft__label');

  if (h2) {
    gsap.from(h2, {
      scrollTrigger: { trigger: section, start: "top 80%" },
      opacity: 0, y: 30, duration: 1, ease: "power3.out"
    });
  }

  if (label) {
    gsap.from(label, {
      scrollTrigger: { trigger: section, start: "top 80%" },
      opacity: 0, x: -20, duration: 0.8, delay: 0.2, ease: "power2.out"
    });
  }
}

function initReserveScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.kc-reserve');
  if (!section) return;

  // Content reveal (left column)
  const contentInner = section.querySelector('.kc-reserve__content-inner');
  if (contentInner) {
    gsap.from(contentInner, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      },
      opacity: 0,
      x: -50,
      duration: 1.2,
      ease: "power3.out"
    });
  }

  // Form col reveal (right column, replaces map)
  const formCol = section.querySelector('.kc-reserve__form-col, .kc-reserve__form-card');
  if (formCol) {
    gsap.from(formCol, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      },
      opacity: 0,
      x: 50,
      duration: 1.2,
      ease: "power3.out"
    });
  }
}

function initClosingReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.kc-closing');
  if (!section) return;

  const bgImg      = section.querySelector('.kc-closing__bg img');
  const headline   = section.querySelector('.kc-closing__headline');
  const subline    = section.querySelector('.kc-closing__subline');
  const buttons    = section.querySelectorAll('.kc-button');

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top 70%" }
  });

  if (bgImg)    tl.from(bgImg,    { scale: 1.3, duration: 2, ease: "power2.out" });
  if (headline) tl.from(headline, { opacity: 0, y: 50, duration: 1, ease: "power3.out" }, "-=1.5");
  if (subline)  tl.from(subline,  { opacity: 0, y: 20, duration: 0.8, ease: "power2.out" }, "-=0.5");
  if (buttons.length) tl.from(buttons, { opacity: 0, y: 20, duration: 0.8, stagger: 0.2, ease: "power2.out" }, "-=0.3");
}

function initChefsPicksAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('#chefs-picks');
  if (!section) return;

  const header = section.querySelector('.kc-craft__header');
  const items = section.querySelectorAll('.reveal-item');

  if (header) {
    gsap.from(header, {
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out"
    });
  }

  // Individual blocks are already handled by initCraftScroll()
}

function initMomentsScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.kc-moments');
  if (!section) return;

  const header = section.querySelector('.kc-moments__header');
  const items = section.querySelectorAll('.reveal-moment');

  if (header) {
    gsap.from(header, {
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out"
    });
  }

  if (items.length) {
    gsap.from(items, {
      scrollTrigger: {
        trigger: section,
        start: "top 60%",
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
}


function initEssentialsScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.kc-essentials');
  if (!section) return;

  const header = section.querySelector('.kc-essentials__header');
  const items = section.querySelectorAll('.reveal-essentials');

  if (header) {
    gsap.from(header, {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      },
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power3.out"
    });
  }

  if (items.length) {
    gsap.from(items, {
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
      },
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
}


function initProjectRevealAnimations() {
  const sections = document.querySelectorAll('.tp-project-3-area');
  
  sections.forEach(section => {
    const leftCard = section.querySelector('.pro-img-1');
    const rightCard = section.querySelector('.pro-img-2');
    const centerContent = section.querySelector('.tp-project-center-content');
    
    if (!leftCard || !rightCard || !centerContent) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=110%",
        scrub: 0.8,
        pin: true,
        anticipatePin: 1
      }
    });
    
    tl.to(leftCard, { 
      x: "-105%", 
      rotate: -10,
      ease: "power1.inOut" 
    }, 0)
    .to(rightCard, { 
      x: "105%", 
      rotate: 10,
      ease: "power1.inOut" 
    }, 0)
    .fromTo(centerContent, 
      { opacity: 0, scale: 0.85 }, 
      { opacity: 1, scale: 1, ease: "power2.out" }, 
      0.05
    );
  });
}


function initSignatureCreations() {
  const elements = document.querySelectorAll('.reveal-signature');
  
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach(el => observer.observe(el));
}


function initGalleryHeaderReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const elements = gsap.utils.toArray('.reveal-gallery-header');
  if (!elements.length) return;

  elements.forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
      },
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power3.out"
    });
  });
}

/**
 * Curvy Gallery Interaction - Scroll Driven
 */
function initCurvyGallery() {
  const section = document.getElementById('curvy-gallery');
  if (!section) return;

  const track = section.querySelector('.kc-curvy-gallery__track');
  const items = section.querySelectorAll('.kc-curvy-gallery__item');
  
  if (!track || !items.length) return;

  let itemsData = [];

  // Horizontal Scroll on Vertical Page Scroll
  gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top bottom", // Start when section enters viewport
      end: "bottom top",    // End when section leaves viewport
      scrub: 1,
      invalidateOnRefresh: true,
      onRefresh: () => {
        // Cache layout measurements once when ScrollTrigger refreshes (e.g. on load, resize)
        const trackRect = track.getBoundingClientRect();
        itemsData = Array.from(items).map(item => {
          // Temporarily clear inline transform to measure clean bounding rect
          const prevTransform = item.style.transform;
          item.style.transform = '';
          const rect = item.getBoundingClientRect();
          item.style.transform = prevTransform;

          return {
            element: item,
            width: rect.width,
            offsetLeft: rect.left - trackRect.left,
            // Create quickSetters for high performance updates
            setRotation: gsap.quickSetter(item, "rotationY", "deg"),
            setZ: gsap.quickSetter(item, "z", "px"),
            setY: gsap.quickSetter(item, "y", "px"),
            setScale: gsap.quickSetter(item, "scale")
          };
        });
      },
      onUpdate: () => {
        // Lazy initialize if onRefresh hasn't run yet
        if (!itemsData.length) {
          const trackRect = track.getBoundingClientRect();
          itemsData = Array.from(items).map(item => {
            const rect = item.getBoundingClientRect();
            return {
              element: item,
              width: rect.width,
              offsetLeft: rect.left - trackRect.left,
              setRotation: gsap.quickSetter(item, "rotationY", "deg"),
              setZ: gsap.quickSetter(item, "z", "px"),
              setY: gsap.quickSetter(item, "y", "px"),
              setScale: gsap.quickSetter(item, "scale")
            };
          });
        }

        const centerX = window.innerWidth / 2;
        // Use direct property lookup for maximum performance
        const trackX = track._gsap ? track._gsap.x : (gsap.getProperty(track, "x") || 0);
        
        for (let i = 0; i < itemsData.length; i++) {
          const data = itemsData[i];
          const itemCenterX = trackX + data.offsetLeft + data.width / 2;
          const dist = (itemCenterX - centerX) / (window.innerWidth / 2);
          
          data.setRotation(-dist * 20); 
          data.setZ(Math.abs(dist) * -150); 
          data.setY(Math.pow(Math.abs(dist), 1.5) * 40); 
          data.setScale(1 - Math.abs(dist) * 0.1); 
        }
      }
    }
  });
}

function initReservationModal() {
  const modal = document.getElementById('reservationModal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('#openReserveModal, .openReserveModalBtn, [data-open-modal="reservationModal"]');
  const closeBtn = document.getElementById('closeReserveModal');
  const overlay = document.getElementById('modalOverlay');
  const form = modal.querySelector('form');

  const openModal = (e) => {
    if (e) e.preventDefault();
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    // Close any open flatpickr instances
    document.querySelectorAll('.flatpickr-input').forEach(input => {
      if (input._flatpickr) input._flatpickr.close();
    });
  };

  openBtns.forEach(btn => {
    btn.addEventListener('click', openModal);
  });
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Form submission is handled by kc_initForms() via [data-kc-form].
  // We just need to auto-close the modal on success — hook into the status element.
  if (form) {
    const statusEl = form.querySelector('.kc-form-status');
    if (statusEl) {
      const observer = new MutationObserver(() => {
        // If kc_initForms wrote a success message (green), close the modal after a short delay
        if (statusEl.style.color === 'rgb(46, 125, 50)' && statusEl.textContent.trim() !== '') {
          setTimeout(() => {
            closeModal();
            // Clear status after modal closes so it's clean next open
            setTimeout(() => { statusEl.textContent = ''; statusEl.style.color = ''; }, 400);
          }, 2000);
        }
      });
      observer.observe(statusEl, { childList: true, characterData: true, subtree: true });
    }
  }

  // Time Select "6 items" Logic
  const timeSelect = modal.querySelector('.kc-modal__time-select');
  if (timeSelect) {
    timeSelect.addEventListener('focus', () => {
      timeSelect.size = 6;
      timeSelect.classList.add('is-expanded');
    });
    timeSelect.addEventListener('blur', () => {
      timeSelect.size = 1;
      timeSelect.classList.remove('is-expanded');
    });
    timeSelect.addEventListener('change', () => {
      timeSelect.size = 1;
      timeSelect.blur();
    });
  }
}


function bootKonkanCurryPage() {
  loadHtmlComponents()
    .catch((error) => {
      console.error("Unable to load HTML components.", error);
    })
    .finally(() => {
      initStickyHeader();
      initMenuLogic();
      initHeroAnimations();
      initHeroSlider();
      initNarrativeScroll();
      initShowcaseScroll();
      initGalleryMarqueeReveal();
      initIntroStoryReveal();
      initCraftScroll();
      initMomentsScroll();
      initMenuTeaser();
      initSignatureCreations();
      initProjectRevealAnimations();
      initChefsPicksAnimations();
      initEssentialsScroll();
      initReviewsScroll();
      initReserveScroll();
      initClosingReveal();
      initCurvyGallery();
      initGalleryHeaderReveal();
      initReservationModal();

      if (document.body.classList.contains('page-about')) {
        initAboutAnimations();
      }
      
      if (document.body.classList.contains('page-menu')) {
        initMenuAnimations();
      }
      
      if (document.body.classList.contains('page-contact')) {
        initContactAnimations();
      }

      if (document.body.classList.contains('page-location')) {
        initLocationAnimations();
      }

      // Wire up all booking/contact forms (reCAPTCHA + SMTP backend)
      kc_initForms();
      initRecaptchaWidgets();
      
      // Restrict date inputs to today + 1 month
      initDateInputRestrictions();

      // Force refresh to account for dynamic heights
      ScrollTrigger.refresh();
    });
}

function initDateInputRestrictions() {
  const getTodayAndMaxDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDateStr = `${year}-${month}-${day}`;

    // Exactly 1 month from today
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 1);
    const maxYear = maxDate.getFullYear();
    const maxMonth = String(maxDate.getMonth() + 1).padStart(2, '0');
    const maxDay = String(maxDate.getDate()).padStart(2, '0');
    const maxDateStr = `${maxYear}-${maxMonth}-${maxDay}`;

    return { today, maxDate, minDateStr, maxDateStr };
  };

  const { today, maxDate, minDateStr, maxDateStr } = getTodayAndMaxDates();

  // Primary: If Flatpickr library is available, use custom dark-text datepicker
  if (typeof flatpickr !== 'undefined') {
    const setupFlatpickr = (el) => {
      if (!el || el.dataset.fpInitialized) return;
      el.dataset.fpInitialized = "true";

      flatpickr(el, {
        minDate: today,
        maxDate: maxDate,
        defaultDate: today,
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        disableMobile: true,
        allowInput: true,
        position: "auto right"
      });
    };

    document.querySelectorAll('input[type="date"]').forEach(setupFlatpickr);

    document.addEventListener('focusin', (e) => {
      if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'date') {
        setupFlatpickr(e.target);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'date') {
        setupFlatpickr(e.target);
      }
    });

    return;
  }

  // Fallback for native inputs
  const setupInput = (input) => {
    if (!input) return;

    input.setAttribute('min', minDateStr);
    input.setAttribute('max', maxDateStr);

    if (!input.value) {
      input.value = minDateStr;
    }

    if (input.dataset.dateBound) return;
    input.dataset.dateBound = 'true';

    const clampValue = () => {
      const { minDateStr: currentMin, maxDateStr: currentMax } = getTodayAndMaxDates();
      if (!input.value) {
        input.value = currentMin;
        return;
      }

      if (input.value < currentMin) {
        input.value = currentMin;
      } else if (input.value > currentMax) {
        input.value = currentMax;
      }
    };

    input.addEventListener('input', clampValue);
    input.addEventListener('change', clampValue);
    input.addEventListener('blur', clampValue);
    input.addEventListener('keyup', clampValue);
  };

  document.querySelectorAll('input[type="date"]').forEach(setupInput);

  document.addEventListener('focusin', (e) => {
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'date') {
      setupInput(e.target);
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'date') {
      setupInput(e.target);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootKonkanCurryPage, { once: true });
} else {
  bootKonkanCurryPage();
}

function initAboutAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  // Prevent double initialization
  if (window.aboutAnimationsInitialized) return;
  window.aboutAnimationsInitialized = true;

  gsap.registerPlugin(ScrollTrigger);

  // Hero Animation
  const heroElements = document.querySelectorAll('[data-reveal-hero] > *');
  if (heroElements.length) {
    gsap.set(heroElements, { opacity: 0, y: 30 });
    gsap.to(heroElements, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }

  const heroBgImg = document.querySelector('.about-hero__bg img, .kc-hero-section__bg img');
  if (heroBgImg) {
    gsap.fromTo(heroBgImg, { scale: 1.08 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
  }

  // Generic Reveal Animations
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const type = el.getAttribute('data-reveal');
    
    let animation = {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    };

    if (type === 'left') {
      gsap.set(el, { opacity: 0, x: -40 });
      animation.x = 0;
    } else if (type === 'right') {
      gsap.set(el, { opacity: 0, x: 40 });
      animation.x = 0;
    } else if (type === 'scale') {
      gsap.set(el, { opacity: 0, scale: 0.95 });
      animation.scale = 1;
    } else {
      gsap.set(el, { opacity: 0, y: 40 });
    }

    gsap.to(el, {
      ...animation,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
        onEnter: () => el.classList.add('revealed')
      }
    });
  });

  // Refresh ScrollTrigger after a short delay to ensure layout is stable
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 500);

  // Staggered Reveals
  document.querySelectorAll('[data-reveal="stagger"]').forEach((parent, i) => {
    gsap.set(parent, { opacity: 0, y: 30 });
    gsap.to(parent, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: parent,
        start: "top 90%",
        toggleActions: "play none none none"
      },
      delay: (i % 3) * 0.15
    });
  });

  // Gallery Items Reveal
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    gsap.set(item, { opacity: 0, y: 50 });
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });
}

// --- Menu Page Specific Animations ---
function initMenuAnimations() {
  if (!document.querySelector('.page-menu')) return;

  // 1. Menu Hero Parallax & Reveal
  const heroBg = document.querySelector('.menu-hero__bg');
  const floatingFoods = document.querySelectorAll('.menu-floating-food');

  if (heroBg) {
    gsap.fromTo(heroBg, 
      { scale: 1.08 },
      { scale: 1, duration: 2, ease: "power2.out" }
    );
    
    gsap.to(heroBg, {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: ".menu-hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  if (floatingFoods.length) {
    floatingFoods.forEach((food, index) => {
      // Float effect
      gsap.to(food, {
        y: "+=20",
        rotation: "+=5",
        duration: 3 + index,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
      // Scroll parallax
      gsap.to(food, {
        yPercent: -50 * (index + 1),
        ease: "none",
        scrollTrigger: {
          trigger: ".menu-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });
    });
  }

  // 2. House Specials Slider (Normal Slider with Prev/Next + Dots)
  const spotlightTrack = document.querySelector('.spotlight-track');
  const spotlightSlides = document.querySelectorAll('.spotlight-slide');

  if (spotlightTrack && spotlightSlides.length > 0) {
    const prevBtn = document.querySelector('.spotlight-slider__btn--prev');
    const nextBtn = document.querySelector('.spotlight-slider__btn--next');
    const paginationEl = document.querySelector('.spotlight-slider__pagination');

    let currentIndex = 0;
    const totalSlides = spotlightSlides.length;
    const slideGap = 80; // 5rem in px (5 * 16)

    // Use matchMedia to check if the 5rem gap is active
    const matchDesktop = window.matchMedia('(min-width: 992px)');

    const slideStep = () => {
      const sw = spotlightSlides[0].getBoundingClientRect().width;
      return matchDesktop.matches ? sw + slideGap : sw;
    };

    // Build dots
    if (paginationEl) {
      spotlightSlides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('spotlight-slider__dot');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        paginationEl.appendChild(dot);
      });
    }

    const dots = paginationEl ? paginationEl.querySelectorAll('.spotlight-slider__dot') : [];

    function updateDots() {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function updateButtons() {
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;
    }

    function goToSlide(index) {
      if (index < 0) index = 0;
      if (index > totalSlides - 1) index = totalSlides - 1;
      currentIndex = index;
      const offset = index * slideStep();
      gsap.to(spotlightTrack, {
        x: -offset,
        duration: 0.6,
        ease: "power2.inOut"
      });
      updateDots();
      updateButtons();
    }

    prevBtn?.addEventListener('click', () => {
      if (currentIndex > 0) goToSlide(currentIndex - 1);
    });

    nextBtn?.addEventListener('click', () => {
      if (currentIndex < totalSlides - 1) goToSlide(currentIndex + 1);
    });

    // Handle window resize — recalculate slide position
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goToSlide(currentIndex), 100);
    });

    goToSlide(0);
  }

  // 3. Featured Story Parallax
  const storyBg = document.querySelector('.featured-story__bg');
  if (storyBg) {
    gsap.to(storyBg, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: ".featured-story",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }

  // 4. Menu Category Reveal
  const categoryBlocks = document.querySelectorAll('.menu-category-block');
  categoryBlocks.forEach(block => {
    // Animate title
    gsap.from(block.querySelector('h2'), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: block,
        start: "top 85%"
      }
    });

    // Animate grid items staggered
    gsap.from(block.querySelectorAll('.menu-item'), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: block.querySelector('.menu-grid'),
        start: "top 85%"
      }
    });
  });

  // 6. Chef Recommendations Reveal
  gsap.from('.chef-slider-container', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".chef-recommendations",
      start: "top 80%"
    }
  });

  // 6.5. Chef Recommendations Slider Logic
  const chefSlider = document.getElementById('chefSlider');
  const chefPrev = document.getElementById('chef-prev');
  const chefNext = document.getElementById('chef-next');
  
  if (chefSlider && chefPrev && chefNext) {
    chefNext.addEventListener('click', () => {
      const scrollAmount = chefSlider.querySelector('.chef-slider-item').offsetWidth + 24;
      chefSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    chefPrev.addEventListener('click', () => {
      const scrollAmount = chefSlider.querySelector('.chef-slider-item').offsetWidth + 24;
      chefSlider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }

  // 7. Menu Marquee continuous scroll
  const menuMarqueeTrack = document.querySelector('.menu-marquee-track');
  if (menuMarqueeTrack) {
    // Clone items for seamless loop
    const items = menuMarqueeTrack.innerHTML;
    menuMarqueeTrack.innerHTML += items;
    
    gsap.to(menuMarqueeTrack, {
      xPercent: -50,
      ease: "none",
      duration: 20,
      repeat: -1
    });

    // Pause on hover
    menuMarqueeTrack.addEventListener('mouseenter', () => gsap.getTweensOf(menuMarqueeTrack)[0].pause());
    menuMarqueeTrack.addEventListener('mouseleave', () => gsap.getTweensOf(menuMarqueeTrack)[0].play());
  }
}

function initContactAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // 1. Hero Animations
  const tlHero = gsap.timeline({ defaults: { ease: "power3.out" } });
  
  // Animate background image scale
  const heroBg = document.querySelector('.kc-hero-section__bg img');
  if (heroBg) {
    tlHero.from(heroBg, {
      scale: 1.05,
      duration: 1.5
    }, 0);
  }

  // Reveal texts
  const heroElements = gsap.utils.toArray('.contact-gs-reveal-up');
  if (heroElements.length) {
    tlHero.from(heroElements, {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.15
    }, 0.2);
  }

  // 2. Info Cards Stagger
  const infoCards = gsap.utils.toArray('.contact-gs-stagger');
  if (infoCards.length) {
    gsap.from(infoCards, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: infoCards[0],
        start: "top 85%"
      }
    });
  }

  // 3. Form Slide In
  const slideLeft = document.querySelector('.contact-gs-slide-left');
  const slideRight = document.querySelector('.contact-gs-slide-right');
  
  if (slideLeft && slideRight) {
    gsap.from(slideLeft, {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: slideLeft,
        start: "top 95%",
        toggleActions: "play none none none",
        once: true
      }
    });
    
    gsap.from(slideRight, {
      x: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: slideRight,
        start: "top 95%",
        toggleActions: "play none none none",
        once: true
      }
    });
  }

  // 4. Map Scale In
  const mapElement = document.querySelector('.contact-gs-scale-in');
  if (mapElement) {
    gsap.from(mapElement, {
      scale: 0.95,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: mapElement,
        start: "top 95%",
        toggleActions: "play none none none",
        once: true
      }
    });
  }

  // 5. Generic Reveal Up
  const revealElements = gsap.utils.toArray('section .contact-gs-reveal-up:not(.kc-hero-section .contact-gs-reveal-up)');
  revealElements.forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 95%",
        toggleActions: "play none none none",
        once: true
      }
    });
  });

  // Safety fallback: if any contact-gs-* elements are still invisible after 1.5s
  // (e.g. ScrollTrigger failed to fire), force them visible
  setTimeout(() => {
    const allContactGs = document.querySelectorAll(
      '.contact-gs-reveal-up, .contact-gs-slide-left, .contact-gs-slide-right, .contact-gs-scale-in, .contact-gs-stagger'
    );
    allContactGs.forEach(el => {
      const computed = window.getComputedStyle(el);
      if (parseFloat(computed.opacity) < 0.1) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      }
    });
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }, 1500);

  // 6. FAQ Accordion Logic (GSAP)
  initFaqAccordion();

  // 7. Form Submission Logic
  const contactForm = document.getElementById('kc-contact-form');
  const successMsg = document.getElementById('kc-form-success-msg');
  if (contactForm && successMsg) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent page reload
      
      // Show success message
      successMsg.classList.remove('d-none');
      
      // Reset the form fields
      contactForm.reset();
      
      // Optionally hide the message after 5 seconds
      setTimeout(() => {
        successMsg.classList.add('d-none');
      }, 5000);
    });
  }
}

function initFaqAccordion() {
  const items = document.querySelectorAll('.kc-accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    if (item.dataset.faqInitialized) return;
    item.dataset.faqInitialized = "true";
    const trigger = item.querySelector('.kc-faq-trigger');
    const content = item.querySelector('.kc-faq-content');
    
    if (!trigger || !content) return;

    // Initial state setup
    if (content.classList.contains('show')) {
      gsap.set(content, { height: 'auto', opacity: 1, display: 'block' });
      trigger.classList.remove('collapsed');
    } else {
      gsap.set(content, { height: 0, opacity: 0, display: 'none' });
      trigger.classList.add('collapsed');
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isAlreadyOpen = !trigger.classList.contains('collapsed');

      // Close all other items
      items.forEach(otherItem => {
        if (otherItem === item) return;
        const otherTrigger = otherItem.querySelector('.kc-faq-trigger');
        const otherContent = otherItem.querySelector('.kc-faq-content');
        
        if (otherTrigger && !otherTrigger.classList.contains('collapsed')) {
          otherTrigger.classList.add('collapsed');
          
          gsap.to(otherContent, {
            height: 0,
            opacity: 0,
            duration: 0.5,
            delay: 0.1,
            ease: "power2.inOut",
            onComplete: () => {
              otherContent.style.display = 'none';
              otherContent.classList.remove('show');
              ScrollTrigger.refresh();
            }
          });
        }
      });

      // Toggle current item
      if (isAlreadyOpen) {
        // Close it
        trigger.classList.add('collapsed');
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.5,
          delay: 0.1,
          ease: "power2.inOut",
          onComplete: () => {
            content.style.display = 'none';
            content.classList.remove('show');
            ScrollTrigger.refresh();
          }
        });
      } else {
        // Open it
        trigger.classList.remove('collapsed');
        content.style.display = 'block';
        content.classList.add('show');
        
        // Use scrollHeight for accurate calculation
        const targetHeight = content.scrollHeight;
        
        gsap.fromTo(content, 
          { height: 0, opacity: 0 },
          { 
            height: targetHeight, 
            opacity: 1, 
            duration: 0.6, 
            delay: 0.1, 
            ease: "power2.out",
            onComplete: () => {
              content.style.height = 'auto'; // Reset to auto for responsiveness
              ScrollTrigger.refresh();
            }
          }
        );
      }
    });
  });
}

function initLocationAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // 1. Hero Animations
  const tlHero = gsap.timeline({ defaults: { ease: "power3.out" } });
  
  const heroBg = document.querySelector('.kc-loc-hero__bg img');
  if (heroBg) {
    tlHero.from(heroBg, {
      scale: 1.1,
      duration: 2,
      ease: "power2.out"
    }, 0);
  }

  const heroElements = gsap.utils.toArray('.kc-loc-hero .loc-gs-reveal-up');
  if (heroElements.length) {
    tlHero.from(heroElements, {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.15
    }, 0.5);
  }

  // 2. Generic Reveals
  const revealUp = gsap.utils.toArray('.loc-gs-reveal-up:not(.kc-loc-hero .loc-gs-reveal-up)');
  revealUp.forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%"
      }
    });
  });

  const revealLeft = gsap.utils.toArray('.loc-gs-reveal-left');
  revealLeft.forEach(el => {
    gsap.from(el, {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%"
      }
    });
  });

  const revealRight = gsap.utils.toArray('.loc-gs-reveal-right');
  revealRight.forEach(el => {
    gsap.from(el, {
      x: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%"
      }
    });
  });

  // 3. Stagger Animations
  const staggers = document.querySelectorAll('.row');
  staggers.forEach(row => {
    const items = row.querySelectorAll('.loc-gs-stagger');
    if (items.length) {
      gsap.from(items, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: row,
          start: "top 85%"
        }
      });
    }
  });

  // 4. Initialize FAQ (generic)
  initFaqAccordion();

  // 5. Menu Marquee continuous scroll (shared with menu page)
  const menuMarqueeTrack = document.querySelector('.menu-marquee-track');
  if (menuMarqueeTrack) {
    // Clone items for seamless loop if not already cloned
    if (menuMarqueeTrack.children.length < 10) { // Simple check to prevent double cloning
      const items = menuMarqueeTrack.innerHTML;
      menuMarqueeTrack.innerHTML += items;
    }
    
    gsap.to(menuMarqueeTrack, {
      xPercent: -50,
      ease: "none",
      duration: 25,
      repeat: -1
    });

    // Pause on hover
    menuMarqueeTrack.addEventListener('mouseenter', () => {
      const tweens = gsap.getTweensOf(menuMarqueeTrack);
      if (tweens.length) tweens[0].pause();
    });
    menuMarqueeTrack.addEventListener('mouseleave', () => {
      const tweens = gsap.getTweensOf(menuMarqueeTrack);
      if (tweens.length) tweens[0].play();
    });
  }
}

/**
 * kc_initForms — handles all [data-kc-form] forms on the site.
 * - Collects all named fields (including reCAPTCHA token)
 * - POSTs as JSON to backend/submit.php (with resilient relative fallbacks)
 * - Shows inline success / error messages via .kc-form-status
 */
function kc_initForms() {
  const forms = document.querySelectorAll('[data-kc-form]');
  if (!forms.length) return;

  const isSubPage = window.location.pathname.includes('/location/');
  const backendCandidates = isSubPage
    ? ['../../backend/submit.php', '../backend/submit.php', 'backend/submit.php', '/backend/submit.php']
    : ['backend/submit.php', '../backend/submit.php', '/backend/submit.php'];

  forms.forEach(function (form) {
    if (form.dataset.kcInitialized === 'true') return;
    form.dataset.kcInitialized = 'true';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const statusEl = form.querySelector('.kc-form-status');
      const submitBtn = form.querySelector('[type="submit"]');

      // Trigger native HTML5 validation UI before submitting
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Validate date range if date input exists
      const dateInput = form.querySelector('input[type="date"]');
      if (dateInput && dateInput.value) {
        const selected = new Date(dateInput.value + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 1);
        maxDate.setHours(23, 59, 59, 999);

        if (selected < today || selected > maxDate) {
          if (statusEl) {
            statusEl.textContent = 'Please select a reservation date within the next 30 days.';
            statusEl.style.color = '#c0392b';
          }
          return;
        }
      }

      // Collect all named fields
      const data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      // Disable button while submitting
      if (submitBtn) {
        submitBtn.disabled = true;
        if (!submitBtn.dataset.origText) {
          submitBtn.dataset.origText = submitBtn.textContent;
        }
        submitBtn.textContent = (form.id === 'kc-contact-form') ? 'Sending…' : 'Booking…';
      }
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.style.color = '';
      }

      // Automatically capture the current page URL
      data['page_url'] = window.location.href;

      // Execute reCAPTCHA v3 (Invisible security token generation)
      const token = await getRecaptchaToken();
      if (token && token !== 'localhost_bypass') {
        data['g-recaptcha-response'] = token;
      } else if (!isLocalhost && !token) {
        if (statusEl) {
          statusEl.textContent = 'Security check initialization in progress. Please click Make Reservation again.';
          statusEl.style.color = '#c0392b';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.origText || 'Submit';
        }
        return;
      }

      let json = null;
      let fetchSuccess = false;
      let serverErrorMsg = '';

      for (const backendUrl of backendCandidates) {
        try {
          const res = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(data),
          });

          // If 404, fallback to next URL candidate
          if (res.status === 404 && backendUrl !== backendCandidates[backendCandidates.length - 1]) {
            continue;
          }

          const rawText = await res.text();
          try {
            json = JSON.parse(rawText);
          } catch (parseErr) {
            console.error('Server returned non-JSON response from ' + backendUrl + ':', rawText);
            serverErrorMsg = 'Server response error. Please try again.';
          }

          fetchSuccess = true;
          break;
        } catch (netErr) {
          console.warn('Fetch attempt failed on ' + backendUrl + ':', netErr);
        }
      }

      if (fetchSuccess && json && json.ok) {
        if (statusEl) {
          statusEl.textContent = json.message || 'Thank you! We will call you shortly to confirm.';
          statusEl.style.color = '#2e7d32';
        }
        form.reset();
      } else {
        if (statusEl) {
          statusEl.textContent = (json && json.message) || serverErrorMsg || 'Network error. Please check your connection and try again.';
          statusEl.style.color = '#c0392b';
        }
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.origText || 'Submit';
      }
    });
  });
}

/**
 * Automatically loads Google reCAPTCHA v3 API and gets verification token
 */
async function getRecaptchaToken() {
  const siteKey = '6LcqWpstAAAAAE6nfHwC53IIHLj-NhkeAB6vNbtK';
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalhost) return 'localhost_bypass';

  if (typeof grecaptcha === 'undefined' && !document.getElementById('recaptcha-api-script')) {
    const script = document.createElement('script');
    script.id = 'recaptcha-api-script';
    script.src = 'https://www.google.com/recaptcha/api.js?render=' + siteKey;
    document.head.appendChild(script);
  }

  for (let i = 0; i < 40; i++) {
    if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') break;
    await new Promise((r) => setTimeout(r, 100));
  }

  if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') {
    return new Promise((resolve) => {
      try {
        grecaptcha.ready(function () {
          grecaptcha.execute(siteKey, { action: 'submit' }).then(function (token) {
            resolve(token || '');
          }).catch(function (e) {
            console.error('reCAPTCHA execution error:', e);
            resolve('');
          });
        });
      } catch (err) {
        console.error('reCAPTCHA ready error:', err);
        resolve('');
      }
    });
  }
  return '';
}

function initRecaptchaWidgets() {
  getRecaptchaToken();
}


function initContactForm() {
  const contactForm = document.getElementById('kc-contact-form');
  const successMsg = document.getElementById('kc-form-success-msg');
  if (contactForm && successMsg && !contactForm.dataset.initialized) {
    contactForm.dataset.initialized = "true";
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      successMsg.classList.remove('d-none');
      contactForm.reset();
      setTimeout(() => {
        successMsg.classList.add('d-none');
      }, 5000);
    });
  }
}
