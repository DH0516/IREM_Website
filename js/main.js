const LANG = document.documentElement.lang === "fr" ? "fr" : "en";
const UI = {
  en: { close: "Close", image: "Image" },
  fr: { close: "Fermer", image: "Image" },
}[LANG];

function initLogo() {
  const logo = document.querySelector(".logo img");
  if (!logo) return;
  let previous;
  try {
    previous = sessionStorage.getItem("irem-logo");
    if (!previous) {
      sessionStorage.setItem("irem-logo", "default");
      return;
    }
  } catch {
    // Keep the default logo when session storage is blocked.
    return;
  }
  const choices = ["default", "02", "03", "04"].filter(name => name !== previous);
  const selected = choices[Math.floor(Math.random() * choices.length)];
  const next = new Image();
  next.alt = logo.alt;
  const url = new URL("IREM_Logo" + (selected === "default" ? "" : "-" + selected) + ".svg", logo.src);
  url.search = new URL(logo.src).search;
  next.src = url.href;
  next.decode().then(() => {
    logo.parentElement.dataset.logo = selected;
    logo.replaceWith(next);
    try {
      sessionStorage.setItem("irem-logo", selected);
    } catch {
      // The loaded logo still works without persistence.
    }
  }).catch(() => {
    // Keep the current image if the selected variant cannot load.
  });
}

function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch {
    // Use the device preference when browser storage is blocked.
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(stored === "dark" || (!stored && prefersDark));
}

function setTheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  const button = document.getElementById("theme-toggle");
  if (button) {
    button.hidden = false;
    button.setAttribute("aria-pressed", String(isDark));
  }
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {
    // The selected theme still works without persistence.
  }
}

function initBurger() {
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("nav-links");
  if (!burger || !navLinks) return;
  burger.hidden = false;
  burger.closest(".navbar").classList.add("has-menu");

  function setOpen(isOpen) {
    navLinks.classList.toggle("open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.textContent = isOpen ? UI.close : "Menu";
  }
  burger.addEventListener("click", () => {
    setOpen(!navLinks.classList.contains("open"));
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      setOpen(false);
      burger.focus();
    }
  });
}

function initGalleries() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".pg-track");
    const slides = track ? Array.from(track.children) : [];
    const prev = carousel.querySelector(".pg-prev");
    const next = carousel.querySelector(".pg-next");
    const counter = carousel.querySelector(".pg-dots");
    if (slides.length <= 1) return;

    prev.hidden = false;
    next.hidden = false;
    const current = () => Math.round(track.scrollLeft / track.clientWidth);
    const goTo = (index) => {
      const position = Math.max(0, Math.min(slides.length - 1, index));
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto" : "smooth";
      track.scrollTo({ left: track.clientWidth * position, behavior });
    };
    const update = () => {
      const index = current();
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      counter.textContent = (index + 1) + " / " + slides.length;
      counter.setAttribute("aria-label", UI.image + " " + counter.textContent);
    };
    prev.addEventListener("click", () => goTo(current() - 1));
    next.addEventListener("click", () => goTo(current() + 1));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
}

window.addEventListener("pageshow", event => {
  if (event.persisted) initLogo();
});

document.addEventListener("DOMContentLoaded", () => {
  initLogo();
  initTheme();
  initBurger();
  initGalleries();
  const button = document.getElementById("theme-toggle");
  if (button) button.addEventListener("click", () => {
    setTheme(!document.documentElement.classList.contains("dark"));
  });
});
