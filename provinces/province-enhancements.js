const navLinks = Array.from(document.querySelectorAll('.navbar a[href^="#"]'));
const sections = navLinks
  .map((link) => {
    const id = link.getAttribute("href")?.slice(1);
    return id ? document.getElementById(id) : null;
  })
  .filter(Boolean);
function setActiveLink(activeId) {
  navLinks.forEach((link) => {
    const linkId = link.getAttribute("href")?.slice(1);
    link.classList.toggle("is-active", linkId === activeId);
    if (linkId === activeId) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveSection() {
  let currentId = sections[0]?.id;

  for (const section of sections) {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop <= 120) {
      currentId = section.id;
    }
  }

  if (currentId) {
    setActiveLink(currentId);
  }
}
function addBackToTopButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.textContent = "Top";
  button.setAttribute("aria-label", "Back to top");

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.body.appendChild(button);

  function handleVisibility() {
    if (window.scrollY > 380) {
      button.classList.add("visible");
    } else {
      button.classList.remove("visible");
    }
  }
  window.addEventListener("scroll", handleVisibility, { passive: true });
  handleVisibility();
}
window.addEventListener("scroll", updateActiveSection, { passive: true });
window.addEventListener("load", updateActiveSection);

if (sections.length > 0) {
  updateActiveSection();
}

addBackToTopButton();
