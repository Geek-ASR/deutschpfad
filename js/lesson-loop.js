/**
 * Generic step-flow UI for a lesson: builds an accessible tab-like
 * stepper across a set of `[data-step]` sections already present in the
 * DOM, shows one at a time, and adds Back/Next controls. Knows nothing
 * about lesson *content* — a page supplies the step markup; this module
 * only handles moving between steps.
 *
 * Follows the ARIA tabs pattern (tablist/tab/tabpanel) so it's both
 * clickable and arrow-key navigable, plus Back/Next buttons for a more
 * guided, linear path through the same steps.
 */

export function initLessonLoop({ container, stepLabels }) {
  const panels = Array.from(container.querySelectorAll("[data-step]"));
  if (panels.length === 0) return;

  const tablist = document.createElement("div");
  tablist.className = "lesson-stepper";
  tablist.setAttribute("role", "tablist");
  tablist.setAttribute("aria-label", "Lesson steps");

  const tabs = panels.map((panel, i) => {
    const stepKey = panel.getAttribute("data-step");
    const panelId = `step-panel-${stepKey}`;
    const tabId = `step-tab-${stepKey}`;
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabId);
    panel.tabIndex = 0;

    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "lesson-step-tab";
    tab.id = tabId;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panelId);
    tab.setAttribute("aria-selected", "false");
    tab.tabIndex = -1;

    const num = document.createElement("span");
    num.className = "lesson-step-num";
    num.textContent = String(i + 1);
    const label = document.createElement("span");
    label.className = "lesson-step-label";
    label.textContent = (stepLabels && stepLabels[stepKey]) || stepKey;

    tab.appendChild(num);
    tab.appendChild(label);
    tab.addEventListener("click", () => activate(i, { focusPanel: false }));
    tablist.appendChild(tab);
    return tab;
  });

  container.insertBefore(tablist, panels[0]);

  tablist.addEventListener("keydown", (e) => {
    const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      activate((current + 1) % tabs.length, { focusTab: true });
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      activate((current - 1 + tabs.length) % tabs.length, { focusTab: true });
    } else if (e.key === "Home") {
      e.preventDefault();
      activate(0, { focusTab: true });
    } else if (e.key === "End") {
      e.preventDefault();
      activate(tabs.length - 1, { focusTab: true });
    }
  });

  function buildNav(activeIndex) {
    const panel = panels[activeIndex];
    let nav = panel.querySelector(":scope > .lesson-step-nav");
    if (!nav) {
      nav = document.createElement("div");
      nav.className = "lesson-step-nav";
      panel.appendChild(nav);
    }
    nav.innerHTML = "";

    if (activeIndex > 0) {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "btn btn-secondary btn-sm";
      back.textContent = "← Back";
      back.addEventListener("click", () => activate(activeIndex - 1, { focusPanel: true }));
      nav.appendChild(back);
    }
    if (activeIndex < panels.length - 1) {
      const next = document.createElement("button");
      next.type = "button";
      next.className = "btn btn-primary btn-sm";
      next.textContent = "Next →";
      next.addEventListener("click", () => activate(activeIndex + 1, { focusPanel: true }));
      nav.appendChild(next);
    }
  }

  function activate(index, { focusTab, focusPanel } = {}) {
    panels.forEach((panel, i) => {
      const active = i === index;
      panel.hidden = !active;
      tabs[i].setAttribute("aria-selected", active ? "true" : "false");
      tabs[i].tabIndex = active ? 0 : -1;
      tabs[i].classList.toggle("is-active", active);
    });
    buildNav(index);
    if (focusTab) tabs[index].focus();
    if (focusPanel) panels[index].focus();
  }

  activate(0);
}
