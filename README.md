# 🌊 Konkan Curry — Coastal Indian Dining Website

Welcome to the official web application for **Konkan Curry**, an authentic coastal Indian restaurant serving refined flavors, fresh seafood delicacies, and warm coastal hospitality across Navi Mumbai.

---

## ✨ Features

- **Modern & Premium Coastal Aesthetics**: Dynamic hero banners, smooth scroll animations, glassmorphism badges, and custom typography.
- **Dynamic Modular Architecture**: Reusable dynamic components (`header.html`, `footer.html`, `reservation.html`, `popup.html`) auto-loaded via lightweight JavaScript.
- **Branch Outlets Showcase**: Dedicated location pages and detailed cards for **Kopar Khairane**, **Kharghar**, and **Roadpali**.
- **Interactive Reservation System**: Popup reservation modal accessible site-wide with date/time pickers and automated submission support.
- **Backend & Google Sheets Sync**: Integrated PHP mailer (`backend/submit.php`, `backend/mailer.php`) and Google Sheets AppScript sync for real-time table reservation management.
- **100% Mobile & Tablet Responsive**: Fully optimized touch targets, fluid font scaling (`clamp()`), and responsive grid layouts across all viewports.

---

## 📁 Project Structure

```text
KonkanCurry/
├── index.html                  # Homepage (Hero, Chef Spotlight, Signature Dishes)
├── about.html                  # About Us (Story, Values, Culinary Experience)
├── menu.html                   # Full Coastal Menu & Chef's Recommendations
├── locations.html              # Outlet Explorer (Kopar Khairane, Kharghar, Roadpali)
├── contact.html                # Contact Us page with direct branch details
├── location/                   # Individual Location Detail Pages
│   ├── kopar-khairane.html
│   ├── kharghar.html
│   └── roadpali.html
├── assets/
│   ├── css/
│   │   └── style.css           # Core Design System & Mobile Responsiveness
│   ├── js/
│   │   └── script.js            # Component Loader, Mobile Nav & Animations
│   ├── components/             # Reusable UI Components
│   │   ├── header.html
│   │   ├── footer.html
│   │   ├── reservation.html
│   │   ├── popup.html
│   │   └── form.html
│   └── images/                 # Optimized High-Res Dish & Interior Photos (.webp)
├── backend/                    # Table Reservation Backend
│   ├── submit.php
│   ├── mailer.php
│   └── google-sheet-appscript.gs
└── README.md
```

---

## 📍 Restaurant Locations & Contact

### 1. Kopar Khairane Branch
- **Address**: 3,4 Plot, Ajanta Commercial Complex, Shop no.1,2, no. 92, Zone 2, Sector 15, Kopar Khairane, Navi Mumbai, Maharashtra 400709
- **Google Maps**: [View on Map](https://share.google/70V8uC0zImnNrVqJ7)
- **Phone**: [+91 99204 61100](tel:+919920461100) | [+91 99204 62200](tel:+919920462200) | [+91 99204 63300](tel:+919920463300)

### 2. Kharghar Branch
- **Address**: Shop Number 6, Goodwill Paradise, Plot no 24, Gharkul, Sector 15, Kharghar, Panvel, Maharashtra 410210
- **Google Maps**: [View on Map](https://share.google/gmY2cc7AgcdLuxr6c)
- **Phone**: [+91 98339 98500](tel:+919833998500) | [+91 98339 98600](tel:+919833998600) | [+91 98339 98700](tel:+919833998700)

### 3. Roadpali Branch
- **Address**: Shop Number 6, Goodwill Paradise, Plot no 24, Gharkul, Sector 15, Kharghar, Panvel, Maharashtra 410210
- **Google Maps**: [View on Map](https://share.google/g93vEU6Tm8DgZJNrN)
- **Phone**: [+91 91525 57070](tel:+919152557070) | [+91 91523 37070](tel:+919152337070)

---

## 🚀 How to Run Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/Konkan-Curry.git
   cd Konkan-Curry
   ```

2. **Preview Static Pages**:
   - Open `index.html` in any web browser or launch a local development server (e.g., VS Code Live Server or `python -m http.server 8000`).

3. **Backend PHP Mailer Setup** *(Optional for local reservation testing)*:
   - Serve the project directory via Apache/Nginx with PHP support (e.g., XAMPP, WAMP, or LocalWP).
   - Configure SMTP credentials in `backend/mailer.php`.

---

## 🛠️ Built With

- **HTML5 & CSS3** (Vanilla CSS Design System & Bootstrap 5 Grid)
- **JavaScript (ES6+)** (Dynamic Component Loader, Modals & Micro-Animations)
- **FontAwesome 6** & **Google Fonts** (Outfit, Roboto Condensed, Inter)
- **PHP & PHPMailer** (Backend reservation handling)
