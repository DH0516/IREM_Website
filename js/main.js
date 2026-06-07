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
// IMAGE GALLERIES (carousel): used on portfolio & services
// ============================================================
// Each [data-carousel] holds a horizontally scroll-snapping .pg-track of images.
// Adds dot indicators + prev/next buttons and keeps them in sync with scroll.

function initGalleries() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".pg-track");
    const dotsWrap = carousel.querySelector(".pg-dots");
    const slides = track ? Array.from(track.children) : [];
    const autoMs = Number(carousel.dataset.carouselAuto || 0);

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
      dot.addEventListener("click", () => {
        goTo(i);
        restartAuto();
      });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    // Prev / next
    const prev = carousel.querySelector(".pg-prev");
    const next = carousel.querySelector(".pg-next");
    if (prev) {
      prev.addEventListener("click", () => {
        goTo(current() - 1);
        restartAuto();
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        goTo(current() + 1);
        restartAuto();
      });
    }

    // Keep dots in sync while scrolling/swiping
    track.addEventListener(
      "scroll",
      () => {
        const idx = current();
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      },
      { passive: true }
    );

    let timer = null;
    function restartAuto() {
      if (timer) clearInterval(timer);
      if (
        autoMs <= 0 ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      timer = setInterval(() => goTo((current() + 1) % slides.length), autoMs);
    }

    restartAuto();
  });
}

// ============================================================
// FADE SLIDESHOWS
// ============================================================
// Used by the Home hero and About story images. Slides cross-fade, keep visible
// arrows/dots, and autoplay unless reduced motion is preferred.

function initFadeSlideshow(box, options = {}) {
  if (!box) return;

  const {
    sources = null,
    defaultAlt = box.dataset.slideshowAlt || "",
    width = null,
    height = null,
    autoMs = Number(box.dataset.slideshowAuto || 5000),
  } = options;

  if (sources && sources.length) {
    box.replaceChildren();
    sources.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = i === 0 ? defaultAlt : "";
      if (width) img.width = width;
      if (height) img.height = height;
      if (i > 0) img.loading = "lazy";
      box.appendChild(img);
    });
  }

  const slides = Array.from(box.children).filter((el) => el.tagName === "IMG");
  if (!slides.length) return;

  box.classList.add("is-js");
  box.querySelectorAll(".pg-nav, .pg-dots").forEach((el) => el.remove());

  let idx = 0;
  slides.forEach((slide, i) => slide.classList.toggle("is-active", i === 0));

  if (slides.length <= 1) return;

  let dots = [];

  function go(i) {
    slides[idx].classList.remove("is-active");
    dots[idx].classList.remove("is-active");
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add("is-active");
    dots[idx].classList.add("is-active");
  }

  let timer = null;
  function restart() {
    if (timer) clearInterval(timer);
    if (autoMs <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => go(idx + 1), autoMs);
  }

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "pg-dots";
  dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "pg-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "Show image " + (i + 1));
    dot.addEventListener("click", () => {
      go(i);
      restart();
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function makeArrow(cls, label, glyph, delta) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pg-nav " + cls;
    button.setAttribute("aria-label", label);
    button.textContent = glyph;
    button.addEventListener("click", () => {
      go(idx + delta);
      restart();
    });
    return button;
  }

  box.appendChild(makeArrow("pg-prev", "Previous image", "‹", -1));
  box.appendChild(makeArrow("pg-next", "Next image", "›", 1));
  box.appendChild(dotsWrap);

  restart();
}

function initHeroSlideshow() {
  const box = document.querySelector("[data-hero-slideshow]");
  if (!box) return;

  const pool = [
    "public/media/images/pages/home/hero/01-historical-woodwind-workbench.webp",
    "public/media/images/pages/home/hero/02-music-store-showroom.webp",
    "public/media/images/pages/home/hero/03-instrument-wall-display.webp",
    "public/media/images/pages/home/hero/04-historical-instrument-cabinet.webp",
    "public/media/images/pages/home/hero/06-woodwind-and-keyboard-display.webp",
    "public/media/images/pages/home/hero/08-museum-woodwind-display.webp",
    "public/media/images/pages/home/hero/09-instrument-design-workshop.webp",
    "public/media/images/pages/home/hero/10-woodwind-maker-workbench.webp",
    "public/media/images/pages/home/hero/11-audio-lab-desk-with-recorder-prototype.webp",
    "public/media/images/pages/home/hero/12-museum-instrument-exhibit.webp",
    "public/media/images/pages/home/hero/14-historical-flute-display-case.webp",
    "public/media/images/pages/home/hero/17-trumpet-cad-workstation.webp",
  ];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  initFadeSlideshow(box, {
    sources: pool.slice(0, 5),
    defaultAlt: "IREM studio and instrument imagery",
    width: 1600,
    height: 900,
    autoMs: 5000,
  });
}

function initAboutSlideshows() {
  document.querySelectorAll("[data-fade-slideshow]").forEach((box) => {
    initFadeSlideshow(box);
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
  initHeroSlideshow();
  initAboutSlideshows();

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
});
