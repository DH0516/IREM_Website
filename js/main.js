// ============================================================
// TRANSLATIONS
// ============================================================

const translations = {
  en: {
    home: "Home",
    about: "About",
    services: "Services",
    projects: "Projects",
    contact: "Contact",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    services: "Services",
    projects: "Projets",
    contact: "Contact",
  },
};

// ============================================================
// DARK MODE
// ============================================================

function initTheme() {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = stored === "dark" || (!stored && prefersDark);
  setTheme(isDark);
}

function setTheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = isDark ? "☀" : "☾";
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  setTheme(!isDark);
}

// ============================================================
// BURGER MENU
// ============================================================

function initBurger() {
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("nav-links");
  if (!burger || !navLinks) return;

  burger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// ============================================================
// LANGUAGE SWITCHER
// ============================================================

function applyTranslations(lang) {
  const dict = translations[lang] || translations.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
}

function initLanguage() {
  const stored = localStorage.getItem("lang");
  const browserLang = navigator.language.split("-")[0];
  const lang = stored || (translations[browserLang] ? browserLang : "en");

  applyTranslations(lang);

  const select = document.getElementById("lang-select");
  if (select) {
    select.value = lang;
    select.addEventListener("change", (e) => {
      const newLang = e.target.value;
      localStorage.setItem("lang", newLang);
      applyTranslations(newLang);
    });
  }
}

// ============================================================
// IMAGE GALLERIES (carousel) — used on portfolio & services
// ============================================================
// Each [data-carousel] holds a horizontally scroll-snapping .pg-track of images.
// Adds dot indicators + prev/next buttons and keeps them in sync with scroll.

function initGalleries() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".pg-track");
    const dotsWrap = carousel.querySelector(".pg-dots");
    const slides = track ? Array.from(track.children) : [];

    // A single image needs no controls.
    if (slides.length <= 1) {
      carousel.querySelectorAll(".pg-nav").forEach((b) => b.remove());
      if (dotsWrap) dotsWrap.remove();
      return;
    }

    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    const goTo = (i) => {
      const idx = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: track.clientWidth * idx, behavior: "smooth" });
    };

    // Dots
    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "pg-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Go to image " + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    // Prev / next
    const prev = carousel.querySelector(".pg-prev");
    const next = carousel.querySelector(".pg-next");
    if (prev) prev.addEventListener("click", () => goTo(current() - 1));
    if (next) next.addEventListener("click", () => goTo(current() + 1));

    // Keep dots in sync while scrolling/swiping
    track.addEventListener(
      "scroll",
      () => {
        const idx = current();
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      },
      { passive: true }
    );
  });
}

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initBurger();
  initLanguage();
  initGalleries();

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
});
