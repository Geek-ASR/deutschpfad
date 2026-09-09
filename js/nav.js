/**
 * Site navigation: accessible mobile menu toggle.
 * Progressive enhancement — the nav is a normal list of links in markup;
 * this only adds the collapse/expand behavior for small screens.
 */

function initNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.getElementById("site-nav");

  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  // Close on Escape, return focus to the toggle button.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      close();
      toggle.focus();
    }
  });

  // Close when a nav link is activated (mobile menu shouldn't linger).
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("a")) {
      close();
    }
  });

  // Close when focus/click moves outside the header entirely.
  document.addEventListener("click", (event) => {
    const header = toggle.closest(".site-header");
    if (header && !header.contains(event.target) && nav.classList.contains("is-open")) {
      close();
    }
  });

  // If the viewport grows past the mobile breakpoint, reset state so the
  // menu doesn't get stuck "open" (as a positioned overlay) once the CSS
  // switches it back to an inline row.
  const mq = window.matchMedia("(min-width: 56em)");
  mq.addEventListener("change", (event) => {
    if (event.matches) close();
  });
}

document.addEventListener("DOMContentLoaded", initNav);
