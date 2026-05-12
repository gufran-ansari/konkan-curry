import re

def modify_html():
    with open('index.html', 'r') as f:
        content = f.read()

    # Add a grain overlay right after <body>
    grain_div = '<div class="pointer-events-none fixed inset-0 z-[100] opacity-[0.03]" style="background-image: url(\'https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png\'); background-repeat: repeat;"></div>'
    if '1k_Dissolve_Noise_Texture' not in content:
        content = content.replace('<body class="bg-deep-navy text-white antialiased page-home">', '<body class="bg-deep-navy text-cream antialiased page-home">\n  ' + grain_div)
        # Also handle if it's already replaced with cream
        content = content.replace('<body class="bg-deep-navy text-cream antialiased page-home">', '<body class="bg-deep-navy text-cream antialiased page-home">\n  ' + grain_div)

    # Remove the old IntersectionObserver
    old_observer = """    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("active");
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.2,
          rootMargin: "0px 0px -10% 0px",
        },
      );

      revealTargets.forEach((element) => {
        element.classList.add("reveals-enabled");
        observer.observe(element);
      });
    } else {
      revealTargets.forEach((element) => {
        element.classList.add("active");
      });
    }"""
    content = content.replace(old_observer, "// Replaced with GSAP ScrollTrigger")

    # Remove old parallax
    old_parallax = """    const updateParallax = () => {
      if (prefersReducedMotion || parallaxMediaTargets.length === 0) {
        return;
      }

      const viewportHeight = window.innerHeight || 1;

      parallaxMediaTargets.forEach((media) => {
        const container = media.closest("[data-parallax-container]");

        if (!container) {
          return;
        }

        const rect = container.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
        const movement = Math.max(-34, Math.min(34, centerOffset * -0.08));

        media.style.transform = `translate3d(0, ${movement}px, 0) scale(1.08)`;
      });
    };"""
    content = content.replace(old_parallax, "// Removed old parallax")
    content = content.replace('updateParallax();', '')
    content = content.replace('window.addEventListener("resize", updateParallax, {\n      passive: true\n    });', '')

    with open('index.html', 'w') as f:
        f.write(content)

def modify_css():
    with open('assets/css/style.css', 'r') as f:
        css = f.read()

    # Premium CSS changes
    if ".lenis" not in css:
        premium_css = """
html.lenis, html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-stopped {
  overflow: hidden;
}
.lenis.lenis-scrolling iframe {
  pointer-events: none;
}

/* Premium Enhancements */
::selection {
    background: #cf3819;
    color: #04151F;
}

.hero-title {
    font-family: "Cormorant Garamond", serif !important;
    font-weight: 300 !important;
    letter-spacing: -0.02em !important;
}

.section-intro__title, .brand-intro-title, .moments-title {
    font-weight: 400 !important;
    letter-spacing: -0.01em !important;
}

.cta-button {
    letter-spacing: 0.15em !important;
    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
    backdrop-filter: blur(4px);
}

.cta-button:hover {
    box-shadow: 0 6px 20px rgba(207,56,25, 0.2);
}

.sticky-card {
    border: 1px solid rgba(207,56,25, 0.15) !important;
    background: linear-gradient(145deg, rgba(10,35,50,0.6) 0%, rgba(4,21,31,0.9) 100%) !important;
    box-shadow: 0 24px 48px rgba(0,0,0,0.3) !important;
}

.sticky-card h3 {
    color: #cf3819 !important;
}

.sticky-card p {
    color: #F8F4E6 !important;
    opacity: 0.8;
}

/* Improve Snapshot cards */
.snapshot-card {
    background: rgba(10,35,50,0.3);
    border: 1px solid rgba(207,56,25, 0.1);
    padding: 2rem;
    transition: all 0.4s ease;
}

.snapshot-card:hover {
    background: rgba(10,35,50,0.6);
    border-color: rgba(207,56,25, 0.3);
    transform: translateY(-5px);
}

.snapshot-card__title {
    color: #F8F4E6;
    font-family: "Cormorant Garamond", serif;
    font-size: 1.5rem;
}

.why-icon-badge {
    background: rgba(207,56,25, 0.1) !important;
    color: #cf3819 !important;
    border: 1px solid rgba(207,56,25, 0.2);
}
"""
        css += premium_css

    with open('assets/css/style.css', 'w') as f:
        f.write(css)

modify_html()
modify_css()
