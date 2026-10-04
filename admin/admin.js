/* Portfolio admin surface */
(function () {
  "use strict";

  const DATA_KEY = "portfolio_data_v1";
  const LOAD_URL = "/.netlify/functions/load-data";
  const SAVE_URL = "/.netlify/functions/save-data";
  const PASSWORD_KEY = "portfolio_admin_password_v1";
  const SESSION_KEY = "portfolio_admin_session_v1";
  const DEFAULTS = {
    site: { title: "ADAM EL IDRISSI | Web Developer", name: "ADAM EL IDRISSI", role: "Web Developer", description: "", about: "", email: "", github: "", contactStatus: "", accentColor: "#a855f7" },
    skills: [], projects: [], stats: { projects: "0+", experience: "1+", focus: "Clean" }
  };
  let data = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const mergeData = (value) => ({ ...clone(DEFAULTS), ...value, site: { ...DEFAULTS.site, ...(value?.site || {}) }, stats: { ...DEFAULTS.stats, ...(value?.stats || {}) }, skills: Array.isArray(value?.skills) ? value.skills : [], projects: Array.isArray(value?.projects) ? value.projects : [] });
  const setStatus = (element, message, type = "") => { if (!element) return; element.textContent = message; element.className = `form__status ${type}`; };
  const getStoredData = () => { try { const value = JSON.parse(localStorage.getItem(DATA_KEY) || "null"); return value?.site ? mergeData(value) : null; } catch { return null; } };
  const persistLocal = () => localStorage.setItem(DATA_KEY, JSON.stringify(data));
  const hash = async (value) => { const bytes = new TextEncoder().encode(value); const digest = await crypto.subtle.digest("SHA-256", bytes); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""); };
  const setBusy = (button, busy, label) => { if (!button) return; button.disabled = busy; button.dataset.label ||= button.innerHTML; button.innerHTML = busy ? '<i class="fas fa-spinner fa-spin"></i> Saving…' : (label || button.dataset.label); };

  function showAdmin() { $("#authScreen")?.classList.add("hidden"); $("#adminPanel")?.classList.remove("hidden"); fillForm(); }
  function showAuth() { $("#authScreen")?.classList.remove("hidden"); $("#adminPanel")?.classList.add("hidden"); }
  function fill(selector, value) { const element = $(selector); if (element) element.value = value ?? ""; }
  function fillForm() {
    fill("#siteName", data.site.name); fill("#siteRole", data.site.role); fill("#siteTitle", data.site.title); fill("#siteDesc", data.site.description); fill("#siteAbout", data.site.about); fill("#siteEmail", data.site.email); fill("#siteGithub", data.site.github); fill("#siteStatus", data.site.contactStatus); fill("#statProjects", data.stats.projects); fill("#statExp", data.stats.experience); fill("#statFocus", data.stats.focus); fill("#skillsInput", data.skills.join(", ")); fill("#accentColor", data.site.accentColor || "#a855f7"); renderProjects();
  }
  function readForm() {
    data.site = { ...data.site, name: $("#siteName").value.trim(), role: $("#siteRole").value.trim(), title: $("#siteTitle").value.trim(), description: $("#siteDesc").value.trim(), about: $("#siteAbout").value.trim(), email: $("#siteEmail").value.trim(), github: $("#siteGithub").value.trim(), contactStatus: $("#siteStatus").value.trim(), accentColor: $("#accentColor").value };
    data.stats = { projects: $("#statProjects").value.trim(), experience: $("#statExp").value.trim(), focus: $("#statFocus").value.trim() };
    data.skills = $("#skillsInput").value.split(",").map((skill) => skill.trim()).filter(Boolean);
    data.projects = $$(".project-item").map((item, index) => ({ id: $(".project-id", item).value || `project-${Date.now()}-${index}`, title: $(".project-title", item).value.trim(), description: $(".project-desc", item).value.trim(), tags: $(".project-tags", item).value.split(",").map((tag) => tag.trim()).filter(Boolean), featured: $(".project-featured", item).checked, icon: $(".project-icon", item).value, demoUrl: $(".project-demo", item).value.trim() || "#", repoUrl: $(".project-repo", item).value.trim() }));
  }
  function renderProjects() {
    const list = $("#projectsList"), template = $("#projectTemplate"); if (!list || !template) return; list.innerHTML = "";
    data.projects.forEach((project) => { const item = template.content.cloneNode(true); const root = $(".project-item", item); $(".project-id", item).value = project.id; $(".project-title", item).value = project.title || ""; $(".project-desc", item).value = project.description || ""; $(".project-tags", item).value = (project.tags || []).join(", "); $(".project-featured", item).checked = Boolean(project.featured); $(".project-icon", item).value = project.icon || "fa-code"; $(".project-demo", item).value = project.demoUrl || "#"; $(".project-repo", item).value = project.repoUrl || ""; $(".project-item__title", item).textContent = project.title || "Untitled project"; list.appendChild(item); root.querySelector(".project-item__header").addEventListener("click", (event) => { if (event.target.closest("button")) return; $(".project-item__content", root).classList.toggle("collapsed"); }); });
  }
  function addProject() { readForm(); data.projects.push({ id: `project-${Date.now()}`, title: "New Project", description: "", tags: [], featured: false, icon: "fa-code", demoUrl: "#", repoUrl: "" }); renderProjects(); const items = $$(".project-item"); $(".project-item__content", items.at(-1))?.classList.remove("collapsed"); }

  document.addEventListener("DOMContentLoaded", async () => {
    let remoteData = null;
    try {
      const response = await fetch(LOAD_URL, { cache: "no-store" });
      if (response.ok) {
        const candidate = await response.json();
        if (candidate && candidate.site) remoteData = candidate;
      }
    } catch {
      remoteData = null;
    }
    data = mergeData(remoteData || getStoredData() || DEFAULTS);
    if (remoteData) localStorage.setItem(DATA_KEY, JSON.stringify(data));
    const configured = localStorage.getItem(PASSWORD_KEY);
    $("#setupForm")?.classList.toggle("hidden", Boolean(configured)); $("#loginForm")?.classList.toggle("hidden", !configured);
    if (localStorage.getItem(SESSION_KEY) === "authenticated") showAdmin();
    $("#setupForm")?.addEventListener("submit", async (event) => { event.preventDefault(); const first = $("#setupPass").value, second = $("#setupPass2").value; if (first.length < 4 || first !== second) return setStatus($("#setupStatus"), "Passwords must match and be at least 4 characters.", "error"); localStorage.setItem(PASSWORD_KEY, await hash(first)); localStorage.setItem(SESSION_KEY, "authenticated"); showAdmin(); });
    $("#loginForm")?.addEventListener("submit", async (event) => { event.preventDefault(); const ok = (await hash($("#loginPass").value)) === localStorage.getItem(PASSWORD_KEY); if (!ok) return setStatus($("#loginStatus"), "Incorrect password.", "error"); localStorage.setItem(SESSION_KEY, "authenticated"); showAdmin(); });
    $("#logoutBtn")?.addEventListener("click", () => { localStorage.removeItem(SESSION_KEY); showAuth(); });
    $("#addProjectBtn")?.addEventListener("click", addProject);
    $("#projectsList")?.addEventListener("click", (event) => { const button = event.target.closest("button[data-action]"); if (!button) return; const item = button.closest(".project-item"), items = $$(".project-item"), index = items.indexOf(item); if (button.dataset.action === "delete") { item.remove(); return; } if (button.dataset.action === "toggle") $(".project-item__content", item).classList.toggle("collapsed"); if (button.dataset.action === "move-up" && index > 0) item.before(items[index - 1]); if (button.dataset.action === "move-down" && index < items.length - 1) item.after(items[index + 1]); });
    $$(".tab").forEach((tab) => tab.addEventListener("click", () => { $$(".tab").forEach((item) => item.classList.toggle("active", item === tab)); $$(".tab-content").forEach((content) => content.classList.toggle("active", content.id === `tab-${tab.dataset.tab}`)); }));
    $("#previewBtn")?.addEventListener("click", () => window.open("../", "_blank", "noopener,noreferrer"));
    $("#resetBtn")?.addEventListener("click", () => { if (!window.confirm("Reset all content to defaults?")) return; data = mergeData(window.defaultPortfolioData || DEFAULTS); fillForm(); });
    $("#saveBtn")?.addEventListener("click", async () => { const button = $("#saveBtn"); setBusy(button, true); try { readForm(); persistLocal(); const response = await fetch(SAVE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!response.ok) throw new Error(await response.text()); const saved = await response.json(); data = mergeData(saved.data || data); persistLocal(); setStatus($("#saveStatus"), "Changes saved for every device.", "success"); } catch (error) { persistLocal(); setStatus($("#saveStatus"), `Shared save failed: ${error.message || "try again"}`, "error"); } finally { setBusy(button, false, '<i class="fas fa-save"></i> Save Changes'); } });
  });
})();
