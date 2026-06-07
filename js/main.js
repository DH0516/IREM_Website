// ============================================================
// LANGUAGE / UI STRINGS
// ============================================================
// The site ships separate English (root) and French (/fr/) pages. The language
// selector just navigates between them (each <option> value is the target URL).
// These strings localize the labels for JS-generated controls.

const LANG = document.documentElement.lang === "fr" ? "fr" : "en";
const UI = {
  en: {
    prev: "Previous image",
    next: "Next image",
    goTo: "Go to image ",
    show: "Show image ",
  },
  fr: {
    prev: "Image précédente",
    next: "Image suivante",
    goTo: "Aller à l'image ",
    show: "Afficher l'image ",
  },
}[LANG];

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
// Each <option> value is the URL of the corresponding page in the other
// language; selecting one navigates there. EN pages live at the root, FR pages
// under /fr/.

function initLanguage() {
  const select = document.getElementById("lang-select");
  if (!select) return;
  select.addEventListener("change", (e) => {
    const url = e.target.value;
    if (url) window.location.href = url;
  });
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
      dot.setAttribute("aria-label", UI.goTo + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      if (dotsWrap) dotsWrap.appendChild(dot);
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
    dot.setAttribute("aria-label", UI.show + (i + 1));
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

  box.appendChild(makeArrow("pg-prev", UI.prev, "‹", -1));
  box.appendChild(makeArrow("pg-next", UI.next, "›", 1));
  box.appendChild(dotsWrap);

  restart();
}

function initHeroSlideshow() {
  const box = document.querySelector("[data-hero-slideshow]");
  if (!box) return;

  // Derive the image directory from the page's own first hero image, so the
  // pool resolves correctly at any depth (root EN pages and /fr/ pages alike).
  const first = box.querySelector("img");
  if (!first) return;
  const dir = first.getAttribute("src").replace(/[^/]+$/, "");

  const files = [
    "01-historical-woodwind-workbench.webp",
    "02-music-store-showroom.webp",
    "03-instrument-wall-display.webp",
    "04-historical-instrument-cabinet.webp",
    "06-woodwind-and-keyboard-display.webp",
    "08-museum-woodwind-display.webp",
    "09-instrument-design-workshop.webp",
    "10-woodwind-maker-workbench.webp",
    "11-audio-lab-desk-with-recorder-prototype.webp",
    "12-museum-instrument-exhibit.webp",
    "14-historical-flute-display-case.webp",
    "17-trumpet-cad-workstation.webp",
  ];

  for (let i = files.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [files[i], files[j]] = [files[j], files[i]];
  }

  initFadeSlideshow(box, {
    sources: files.slice(0, 5).map((f) => dir + f),
    defaultAlt:
      LANG === "fr"
        ? "Studio IREM et instruments"
        : "IREM studio and instrument imagery",
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
