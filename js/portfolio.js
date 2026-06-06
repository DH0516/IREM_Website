// Portfolio case study expand/collapse
// (Image galleries are handled by initGalleries() in main.js.)

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".portfolio-project-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".portfolio-project-card");
      const caseStudy = card.querySelector(".portfolio-case-study-content");
      if (!caseStudy) return;

      const isOpen = caseStudy.classList.contains("open");
      caseStudy.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      btn.textContent = isOpen ? "View Case Study →" : "Hide Case Study ↑";
    });
  });
});
