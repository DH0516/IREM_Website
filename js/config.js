// Keep the literal email address out of published source files.
const IREM = {
  emailUser: "irem25qc",
  emailDomain: "gmail.com",
  address: "Montréal, Québec, Canada",
};

function iremEmail() {
  return IREM.emailUser + String.fromCharCode(64) + IREM.emailDomain;
}

document.addEventListener("DOMContentLoaded", () => {
  const email = iremEmail();

  document.querySelectorAll("[data-contact='email']").forEach((el) => {
    const link = document.createElement("a");
    link.href = "mailto:" + email;
    link.textContent = email;
    link.className = "contact-email-link";
    el.replaceChildren(link);
  });

  document.querySelectorAll("[data-contact='email-button']").forEach((el) => {
    el.setAttribute("href", "mailto:" + email);
    el.hidden = false;
  });

  document.querySelectorAll("[data-contact='address']").forEach((el) => {
    el.textContent = IREM.address;
  });
});
