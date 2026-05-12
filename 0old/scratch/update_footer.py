import os
import re

# The updated prefooter + new footer structure with "Premium Pickers"
# Fixed: Unified all input styles, removed 'blue' tint, fixed icons, and styled dropdown
new_combined_html = """
	<!-- Pre-Footer (Content + Premium Reservation Form) -->
	<section class="kc-prefooter bg-nocturne-dark text-white pt-24 pb-24 px-6 md:px-12 border-t border-border relative z-20">
		<div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20">
			<!-- Left Column: Content & Socials -->
			<div class="flex flex-col items-start justify-center">
				<span class="text-[10px] uppercase tracking-[0.4em] text-body mb-8 block font-medium">Est. 2017</span>
				<h2 class="text-5xl md:text-7xl mb-8 leading-[1.1] text-white font-heading font-light">
					Your dining <em class="italic text-primary">experience</em> <br> deserves better.
				</h2>
				<p class="text-body text-lg max-w-md leading-relaxed mb-12 font-body">
					Premium seafood. Artisanal preparations. Four iconic locations. Experience the art of coastal dining with Konkan Curry.
				</p>
				
				<!-- Social Media Icons -->
				<div class="flex gap-6 mt-4">
					<a href="#" class="why-icon-badge h-12 w-12 text-xl hover:bg-white hover:text-black transition-all border border-border rounded-full flex items-center justify-center">
						<i class="bi bi-instagram"></i>
					</a>
					<a href="#" class="why-icon-badge h-12 w-12 text-xl hover:bg-white hover:text-black transition-all border border-border rounded-full flex items-center justify-center">
						<i class="bi bi-facebook"></i>
					</a>
					<a href="#" class="why-icon-badge h-12 w-12 text-xl hover:bg-white hover:text-black transition-all border border-border rounded-full flex items-center justify-center">
						<i class="bi bi-linkedin"></i>
					</a>
				</div>
			</div>

			<!-- Right Column: Premium Curvy Reservation Form -->
			<div class="bg-[#272A29] p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
				<div class="flex items-center gap-4 mb-10">
					<div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
						<i class="bi bi-calendar-event"></i>
					</div>
					<h3 class="font-heading text-3xl text-white italic">Reserve a Table</h3>
				</div>
				
				<form class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="col-span-full">
						<label class="text-[10px] uppercase tracking-[0.2em] text-body block mb-3 ml-4 font-medium">Full Name</label>
						<input type="text" placeholder="Your Name" class="kc-reservation-input no-icon">
					</div>
					
					<div>
						<label class="text-[10px] uppercase tracking-[0.2em] text-body block mb-3 ml-4 font-medium">Email Address</label>
						<input type="email" placeholder="Email" class="kc-reservation-input no-icon">
					</div>
					
					<div>
						<label class="text-[10px] uppercase tracking-[0.2em] text-body block mb-3 ml-4 font-medium">Phone</label>
						<input type="tel" placeholder="Number" class="kc-reservation-input no-icon">
					</div>

					<div class="kc-reservation-input-wrapper">
						<label class="text-[10px] uppercase tracking-[0.2em] text-body block mb-3 ml-4 font-medium">Select Date</label>
						<i class="bi bi-calendar3 kc-reservation-icon"></i>
						<input type="text" placeholder="Pick a date" class="kc-reservation-input date-picker">
					</div>

					<div class="kc-reservation-input-wrapper">
						<label class="text-[10px] uppercase tracking-[0.2em] text-body block mb-3 ml-4 font-medium">Select Time</label>
						<i class="bi bi-clock kc-reservation-icon"></i>
						<input type="text" placeholder="Pick a time" class="kc-reservation-input time-picker">
					</div>

					<div class="col-span-full">
						<label class="text-[10px] uppercase tracking-[0.2em] text-body block mb-3 ml-4 font-medium">Number of Guests</label>
						<select class="kc-reservation-select">
							<option class="bg-[#272A29]">2 Guests</option>
							<option class="bg-[#272A29]">4 Guests</option>
							<option class="bg-[#272A29]">6 Guests</option>
							<option class="bg-[#272A29]">8+ Guests</option>
						</select>
					</div>

					<button type="submit" class="col-span-full mt-4 bg-primary text-black font-bold uppercase tracking-[0.2em] py-5 rounded-full hover:bg-primary-dark transition-all text-[11px] font-body flex items-center justify-center gap-3">
						Confirm Booking <i class="bi bi-arrow-right"></i>
					</button>
				</form>
			</div>
		</div>
	</section>

	<!-- Main Footer -->
	<footer class="kc-modern-footer bg-nocturne-dark text-white pt-20 pb-10 px-6 md:px-12 border-t border-border">
		<div class="max-w-7xl mx-auto">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
				<!-- Brand Column -->
				<div class="flex flex-col items-start">
					<a class="brand nav-brand-center" href="/" aria-label="Konkan Curry home">
					    <img class="brand-logo" src="assets/images/logo.webp" alt="Konkan Curry">
				    </a>
					<p class="text-body text-sm leading-relaxed mb-10 max-w-xs font-body">
						Redefining the standard of luxury hospitality through culinary excellence and tailored service since 2017.
					</p>
					<div class="flex gap-4">
						<a href="#" class="why-icon-badge h-10 w-10 text-lg hover:bg-white hover:text-black transition-all"><i class="bi bi-instagram"></i></a>
						<a href="#" class="why-icon-badge h-10 w-10 text-lg hover:bg-white hover:text-black transition-all"><i class="bi bi-linkedin"></i></a>
						<a href="#" class="why-icon-badge h-10 w-10 text-lg hover:bg-white hover:text-black transition-all"><i class="bi bi-facebook"></i></a>
					</div>
				</div>

				<!-- Quick Links -->
				<div>
					<h4 class="text-[10px] uppercase tracking-[0.3em] text-white font-bold mb-10">Quick Links</h4>
					<ul class="flex flex-col gap-4">
						<li><a href="home.html" class="text-body hover:text-white transition-colors text-sm font-body">Home</a></li>
						<li><a href="menu.html" class="text-body hover:text-white transition-colors text-sm font-body">Menu</a></li>
						<li><a href="about.html" class="text-body hover:text-white transition-colors text-sm font-body">About Us</a></li>
						<li><a href="contact.html" class="text-body hover:text-white transition-colors text-sm font-body">Contact</a></li>
					</ul>
				</div>

				<!-- Resources -->
				<div>
					<h4 class="text-[10px] uppercase tracking-[0.3em] text-white font-bold mb-10">Resources</h4>
					<ul class="flex flex-col gap-4">
						<li><a href="#" class="text-body hover:text-white transition-colors text-sm font-body">Locations</a></li>
						<li><a href="#" class="text-body hover:text-white transition-colors text-sm font-body">Reservations</a></li>
						<li><a href="#" class="text-body hover:text-white transition-colors text-sm font-body">Legal & Privacy</a></li>
						<li><a href="#" class="text-body hover:text-white transition-colors text-sm font-body">Terms of Service</a></li>
					</ul>
				</div>

				<!-- Our Office -->
				<div>
					<h4 class="text-[10px] uppercase tracking-[0.3em] text-white font-bold mb-10">Our Office</h4>
					<div class="flex flex-col gap-6">
						<p class="text-body text-sm leading-relaxed font-body max-w-[200px]">
							124 Seawoods Grand Central, Navi Mumbai, <br> MH 400706, IN
						</p>
						<div class="flex flex-col gap-2">
							<a href="tel:+912279460958" class="text-white hover:text-primary transition-colors text-sm font-bold">+91 (22) 7946 0958</a>
							<a href="mailto:contact@konkancurry.com" class="text-body hover:text-white transition-colors text-sm font-body">contact@konkancurry.com</a>
						</div>
					</div>
				</div>
			</div>

			<!-- Divider -->
			<div class="h-px w-full bg-border mb-10"></div>

			<!-- Bottom Bar -->
			<div class="flex flex-col md:flex-row justify-between items-center w-full gap-8 text-[9px] uppercase tracking-[0.3em] text-body font-medium">
				<div class="text-center md:text-left">
					© 2026 KONKAN CURRY. ALL RIGHTS RESERVED.
				</div>
				<div class="flex items-center gap-2">
					Designed by Candid Digital.
				</div>
			</div>
		</div>
	</footer>
"""

# Synchronized Tailwind Configuration
new_tailwind_config = """
					colors: {
						"nocturne-amber": "var(--color-primary)",
						"nocturne-dark": "var(--color-dark)",
						"nocturne-gold": "var(--color-primary-light)",
						primary: "var(--color-primary)",
						"primary-dark": "var(--color-primary-dark)",
						"on-primary": "var(--color-dark)",
                        white: "var(--color-white)",
                        black: "var(--color-dark)",
                        border: "var(--color-border)",
                        body: "var(--color-text-body)",
                        "card-bg": "var(--color-card-bg)",
					},
"""

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update Footer/Prefooter
    updated_content = re.sub(r'<!-- Pre-Footer.*?<footer.*?>.*?</footer>', new_combined_html, content, flags=re.DOTALL)
    if updated_content == content:
        updated_content = re.sub(r'<footer.*?>.*?</footer>', new_combined_html, content, flags=re.DOTALL)

    # 2. Update Tailwind Colors
    updated_content = re.sub(r'colors:\s*{.*?},', new_tailwind_config, updated_content, flags=re.DOTALL)

    if updated_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes for {file_path}")

if __name__ == "__main__":
    for filename in os.listdir('.'):
        if filename.endswith('.html'):
            update_file(filename)
