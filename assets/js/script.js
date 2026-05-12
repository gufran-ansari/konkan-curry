async function loadHtmlComponents() {
  const slots = Array.from(document.querySelectorAll("[data-component-src]"));
  if (!slots.length) return;

  await Promise.all(
    slots.map(async (slot) => {
      const src = (slot.getAttribute("data-component-src") || "").trim();
      if (!src) return;

      try {
        const response = await fetch(src, { cache: "no-cache" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        let html = await response.text();
        const needsParentPrefix =
          src.startsWith("../") || window.location.pathname.includes("/location/");

        if (needsParentPrefix) {
          html = html.replace(
            /\b(href|src)="(?!https?:|mailto:|tel:|\/|#|javascript:)([^"]+)"/g,
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

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
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

  const bgWrapper = document.querySelector('.kc-hero-bg-wrapper');
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

  tl.to(bgWrapper, {
    scale: 1,
    opacity: 1,
    duration: 2.5,
    ease: 'power2.out'
  })
  .to(badge, { opacity: 1, y: 0, duration: 1 }, "-=1.5")
  .to(title, { opacity: 1, y: 0, duration: 1.2 }, "-=1.2")
  .to(subheading, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
  .to(actions, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
  .to(scrollIndicator, { opacity: 1, duration: 1 }, "-=0.4");

  // Parallax on Scroll
  gsap.to(bgWrapper, {
    y: '20%',
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
    fish: [
      { name: "Surmai Curry", desc: "Coconut, chilli, and coastal heat wrapped around firm kingfish.", tag: "Spicy" },
      { name: "Pomfret Fry", desc: "Crisp-edged, golden, and finished with house masala.", tag: "House Special" },
      { name: "Bombil Fry", desc: "Light, crisp, coastal comfort with a sharp masala finish.", tag: "" },
      { name: "Rawas Tawa", desc: "Seared Indian salmon cooked on a flat iron with dry coastal spices.", tag: "" }
    ],
    prawns: [
      { name: "Prawn Gassi", desc: "Rich coconut curry with deep spice and clean sweetness.", tag: "Must Try" },
      { name: "Butter Garlic Prawns", desc: "Plump prawns tossed in coastal garlic butter.", tag: "" },
      { name: "Prawn Sukka", desc: "Dry-roasted spices, grated coconut, and curry leaves.", tag: "Dry" }
    ],
    crab: [
      { name: "Crab Masala", desc: "Messy, bold, dry-spiced crab built for slow eating.", tag: "Messy" },
      { name: "Crab Butter Pepper", desc: "Fresh crab cooked in an aromatic black pepper emulsion.", tag: "Spicy" }
    ],
    curries: [
      { name: "Fish Tikka Masala", desc: "Smoky tandoor fish in a rich, velvety coastal gravy.", tag: "" },
      { name: "Mutton Xacuti", desc: "Goan-style curry featuring roasted spices and tender cuts.", tag: "Heritage" }
    ],
    veg: [
      { name: "Sol Kadhi", desc: "Cool kokum and coconut to reset the palate.", tag: "Cooling" },
      { name: "Mushroom Sukka", desc: "Earthy mushrooms tossed in a dry coconut and red chilli base.", tag: "Vegan" },
      { name: "Bhindi Coastal Fry", desc: "Crisp okra slices dusted in house coastal rub.", tag: "" }
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
  renderCategory('fish', false);

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

  gsap.from(section.querySelector('h2'), {
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
    },
    opacity: 0,
    y: 30,
    duration: 1,
    ease: "power3.out"
  });

  gsap.from(section.querySelector('.kc-craft__label'), {
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
    },
    opacity: 0,
    x: -20,
    duration: 0.8,
    delay: 0.2,
    ease: "power2.out"
  });
}

function initReserveScroll() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.kc-reserve');
  if (!section) return;

  // Map reveal
  gsap.from(section.querySelector('.kc-reserve__map-col'), {
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
    },
    opacity: 0,
    x: -50,
    duration: 1.2,
    ease: "power3.out"
  });

  // Content reveal
  gsap.from(section.querySelector('.kc-reserve__content-inner'), {
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
    },
    opacity: 0,
    x: 50,
    duration: 1.2,
    ease: "power3.out"
  });

  // Marker pulse delay
  gsap.from(section.querySelector('.kc-reserve__marker-info'), {
    scrollTrigger: {
      trigger: section,
      start: "top 60%",
    },
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.5,
    ease: "power2.out"
  });
}

function initClosingReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const section = document.querySelector('.kc-closing');
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
    }
  });

  tl.from(section.querySelector('.kc-closing__bg img'), {
    scale: 1.3,
    duration: 2,
    ease: "power2.out"
  })
  .from(section.querySelector('.kc-closing__headline'), {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power3.out"
  }, "-=1.5")
  .from(section.querySelector('.kc-closing__subline'), {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: "power2.out"
  }, "-=0.5")
  .from(section.querySelectorAll('.kc-button'), {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out"
  }, "-=0.3");
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
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=120%",
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });
    
    tl.to(leftCard, { 
      x: "-100%", 
      rotate: -10,
      ease: "power1.inOut" 
    }, 0)
    .to(rightCard, { 
      x: "100%", 
      rotate: 10,
      ease: "power1.inOut" 
    }, 0)
    .fromTo(centerContent, 
      { opacity: 0, scale: 0.7, y: 30 }, 
      { opacity: 1, scale: 1, y: 0, ease: "power2.out" }, 
      0.1
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
      onUpdate: () => {
        // Apply the curvy/3D effect to each item based on viewport position
        const centerX = window.innerWidth / 2;
        
        items.forEach(item => {
          const itemRect = item.getBoundingClientRect();
          const itemCenterX = itemRect.left + itemRect.width / 2;
          const dist = (itemCenterX - centerX) / (window.innerWidth / 2);
          
          const rotation = dist * 20; 
          const zOffset = Math.abs(dist) * -150; 
          const yOffset = Math.pow(Math.abs(dist), 1.5) * 40; 
          const scale = 1 - Math.abs(dist) * 0.1; 

          item.style.transform = `rotateY(${-rotation}deg) translateZ(${zOffset}px) translateY(${yOffset}px) scale(${scale})`;
        });
      }
    }
  });
}

function initReservationModal() {
  const modal = document.getElementById('reservationModal');
  const openBtn = document.getElementById('openReserveModal');
  const closeBtn = document.getElementById('closeReserveModal');
  const overlay = document.getElementById('modalOverlay');
  const form = modal?.querySelector('form');

  if (!modal || !openBtn) return;

  const openModal = () => {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = ''; // Restore scroll
  };

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Handle Form Submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Confirming...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      alert('Reservation request received! We will contact you shortly.');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
      closeModal();
    }, 1500);
  });

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
      
      // Force refresh to account for dynamic heights
      ScrollTrigger.refresh();
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
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  
  gsap.set('[data-reveal-hero] > *', { opacity: 0, y: 40 });
  gsap.set('.about-hero__bg img', { scale: 1.05 });

  heroTl.to('.about-hero__bg img', { scale: 1, duration: 2.5, ease: 'power2.out' })
        .to('[data-reveal-hero] .kc-badge', { opacity: 1, y: 0, duration: 0.8 }, "-=1.8")
        .to('[data-reveal-hero] .about-hero__title', { opacity: 1, y: 0, duration: 1 }, "-=1.4")
        .to('[data-reveal-hero] .about-hero__desc', { opacity: 1, y: 0, duration: 1 }, "-=1")
        .to('[data-reveal-hero] .kc-button', { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }, "-=0.6")
        .from('.about-scroll-indicator', { opacity: 0, y: 20, duration: 1 }, "-=0.4");

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
