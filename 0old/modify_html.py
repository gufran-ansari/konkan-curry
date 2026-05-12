import re

def modify_html():
    with open('index.html', 'r') as f:
        content = f.read()

    # 1. Update Fonts
    content = re.sub(
        r'<link\n\s*href="https://fonts\.googleapis\.com/css2\?family=Cormorant\+Garamond.*?rel="stylesheet" />',
        '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:wght@300;400;500;600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet" />',
        content,
        flags=re.DOTALL
    )

    # 2. Add GSAP & Lenis to Head
    head_additions = """
  <script src="https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
"""
    if "lenis.min.js" not in content:
        content = content.replace('</head>', head_additions + '</head>')

    # 3. Replace Tailwind Config
    tailwind_config_old = r'<script>\n\s*tailwind\.config = \{.*?\};\n\s*</script>'
    tailwind_config_new = """<script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            "deep-navy": "#04151F",
            "navy-light": "#0A2332",
            "gold": "#cf3819",
            "gold-light": "#e65035",
            "teal": "#143642",
            "cream": "#F8F4E6",
            "primary": "#FFE397",
            "on-primary": "#3C2F00",
          },
          fontFamily: {
            heading: ["Cormorant Garamond", "serif"],
            body: ["DM Sans", "sans-serif"],
            jost: ["Jost", "sans-serif"],
          },
        },
      },
    };
  </script>"""
    content = re.sub(tailwind_config_old, tailwind_config_new, content, flags=re.DOTALL)

    # 4. Replace Colors & Classes
    content = content.replace('bg-nocturne-dark', 'bg-deep-navy')
    content = content.replace('bg-[#0D0D0D]', 'bg-navy-light')
    content = content.replace('text-nocturne-amber', 'text-gold')
    content = content.replace('text-nocturne-gold', 'text-gold-light')
    content = content.replace('text-[#E2D1B3]', 'text-gold-light')
    content = content.replace('bg-white/[0.03]', 'bg-teal/20')

    # 5. Add GSAP animations and Lenis init at the very end of body
    gsap_script = """
  <script>
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });
    
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Advanced Parallax on hero image
    gsap.to(".hero-carousel", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Staggered reveal for snapshot cards
    gsap.from(".snapshot-card", {
      scrollTrigger: {
        trigger: ".home-snapshot",
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: "power4.out"
    });

    // Parallax on brand intro media
    gsap.fromTo(".brand-intro-media", {
      yPercent: -15,
      scale: 1.15
    }, {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: ".brand-intro-media-frame",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    // Text reveals across sections
    gsap.utils.toArray('.section-intro__title, .brand-intro-title, .moments-title, .reviews-title').forEach(title => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 85%",
        },
        y: 40,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out"
      });
    });

    // USP counter animation
    gsap.from(".brand-intro-usp-card", {
      scrollTrigger: {
        trigger: ".brand-intro-usp",
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "back.out(1.5)"
    });

    // Sticky cards horizontal/vertical scale effect (Premium touch)
    gsap.utils.toArray('.sticky-card').forEach((card, i) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 15%",
          endTrigger: "#inside-konkan-curry",
          end: "bottom center",
          pin: true,
          pinSpacing: false,
          scrub: true
        },
        scale: 0.95 - (i * 0.05),
        opacity: 1 - (i * 0.1),
        transformOrigin: "top center"
      });
    });

    // Review Cards stagger
    gsap.from(".review-card", {
      scrollTrigger: {
        trigger: ".reviews-grid",
        start: "top 80%",
      },
      y: 60,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "power3.out"
    });
  </script>
</body>
"""
    if "lenis = new Lenis" not in content:
        content = content.replace('</body>', gsap_script)

    with open('index.html', 'w') as f:
        f.write(content)

def modify_css():
    with open('assets/css/style.css', 'r') as f:
        css = f.read()
    
    # 1. Update font families to the new ones
    css = css.replace('--font-family-global: "Average Sans", sans-serif;', '--font-family-global: "DM Sans", sans-serif;')
    css = css.replace('--font-family-heading: "Cormorant Garamond", serif;', '--font-family-heading: "Cormorant Garamond", serif;')
    
    # 2. Update background gradient in page-home
    old_bg = 'linear-gradient(180deg, #0a0a0a 0%, #090909 100%)'
    new_bg = 'linear-gradient(180deg, #04151F 0%, #0A2332 100%)'
    css = css.replace(old_bg, new_bg)

    # 3. Adjust CTA buttons to look more premium
    css = css.replace('--cta-primary: #ffe397;', '--cta-primary: #cf3819;')
    css = css.replace('--cta-primary-text: #3c2f00;', '--cta-primary-text: #F8F4E6;')
    
    # 4. Remove default border radius and give it a sharper/premium look
    css = css.replace('--radius-section: 14px;', '--radius-section: 0px;')
    css = css.replace('--radius-card: 12px;', '--radius-card: 4px;')
    css = css.replace('--radius-media: 8px;', '--radius-media: 4px;')
    
    with open('assets/css/style.css', 'w') as f:
        f.write(css)

modify_html()
modify_css()
