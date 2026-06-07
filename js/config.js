// ── IREM Contact Configuration ───────────────────────────────────────────────
// Update values here to change contact details across the entire site.
//
// Anti-scrape note: the email address is intentionally NOT stored as a single
// literal string. It is split into parts and reassembled at runtime so that the
// text "user@domain" never appears in any served .js or .html file. This defeats
// the naive regex harvesters responsible for the vast majority of address
// scraping, without affecting real users or accessibility.

const IREM = {
  emailUser: "irem25qc", // local part (before the @)
  emailDomain: "gmail.com", // domain part (after the @)
  address: "Montréal, Québec, Canada",
};

// Reassemble the address only when needed. String.fromCharCode(64) === "@".
function iremEmail() {
  return IREM.emailUser + String.fromCharCode(64) + IREM.emailDomain;
}

document.addEventListener("DOMContentLoaded", () => {
  const email = iremEmail();

  // Render each [data-contact='email'] placeholder as a runtime-built mailto link
  // that also displays the address (used in the studio card and legal pages).
  document.querySelectorAll("[data-contact='email']").forEach((el) => {
    const link = document.createElement("a");
    link.href = "mailto:" + email;
    link.textContent = email;
    link.className = "contact-email-link";
    el.replaceChildren(link);
  });

  // Turn each [data-contact='email-button'] anchor into a mailto link WITHOUT
  // ever showing the address as text; only the href is set, at runtime.
  document.querySelectorAll("[data-contact='email-button']").forEach((el) => {
    el.setAttribute("href", "mailto:" + email);
  });

  document.querySelectorAll("[data-contact='address']").forEach((el) => {
    el.textContent = IREM.address;
  });
});
