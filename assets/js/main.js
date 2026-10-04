/* Main JS */
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav__links");
  const navLinkItems = document.querySelectorAll(".nav__link");
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const yearEl = document.getElementById("year");
  const revealEls = document.querySelectorAll(".reveal");

  // Theme
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  // Year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Loader
  setTimeout(() => {
    if (loader) {
      loader.classList.add("hidden");
    }
  }, 600);

  // Nav scroll
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY > 50;
    if (nav) nav.classList.toggle("scrolled", scrolled);
    if (backToTop) {
      backToTop.classList.toggle("visible", window.scrollY > 500);
    }
    updateActiveNav();
  });

  // Nav toggle mobile
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }

  navLinkItems.forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("active");
      if (navToggle) navToggle.classList.remove("active");
    });
  });

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const theme = document.documentElement.getAttribute("data-theme");
      const newTheme = theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle?.querySelector("i");
    if (icon) {
      icon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
    }
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });

  // Active nav
  function updateActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPos = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        navLinkItems.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  // Reveal on scroll
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // Load and render data
  loadPortfolioData().then((data) => {
    renderPortfolio(data);
  });

  function renderPortfolio(data) {
    // Site
    document.title = data.site?.title || document.title;
    const nameEl = document.querySelector(".hero__title");
    if (nameEl) nameEl.textContent = data.site?.name || "ADAM EL IDRISSI";
    const roleEl = document.querySelector(".hero__role");
    if (roleEl) roleEl.textContent = data.site?.role || "Web Developer";
    const descEl = document.querySelector(".hero__desc");
    if (descEl) descEl.textContent = data.site?.description || "";

    // About
    const aboutText = document.getElementById("aboutText");
    if (aboutText) aboutText.textContent = data.site?.about || "";

    // Contact links
    const contactEmail = document.getElementById("contactEmail");
    const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
    if (data.site?.email) {
      mailtoLinks.forEach((a) => (a.href = `mailto:${data.site.email}`));
      if (contactEmail) {
        contactEmail.href = `mailto:${data.site.email}`;
        contactEmail.textContent = data.site.email;
      }
    }
    const contactGithub = document.getElementById("contactGithub");
    const ghLinks = document.querySelectorAll('a[href*="github.com"]');
    if (data.site?.github) {
      ghLinks.forEach((a) => {
        if (a.href.includes("github.com")) a.href = data.site.github;
      });
      if (contactGithub) {
        contactGithub.href = data.site.github;
        contactGithub.textContent = data.site.github.replace(
          "https://github.com/",
          ""
        );
      }
    }
    const contactStatus = document.getElementById("contactStatus");
    if (contactStatus) contactStatus.textContent = data.site?.contactStatus || "";

    // Skills
    const skillsList = document.getElementById("skillsList");
    if (skillsList && Array.isArray(data.skills)) {
      skillsList.innerHTML = "";
      data.skills.forEach((skill, i) => {
        const el = document.createElement("span");
        el.className = "skill-tag reveal";
        el.textContent = skill;
        el.style.animationDelay = `${i * 50}ms`;
        skillsList.appendChild(el);
        revealObserver.observe(el);
      });
    }

    // Stats
    const statProjects = document.getElementById("statProjects");
    const statExp = document.getElementById("statExperience");
    const statFocus = document.getElementById("statFocus");
    if (data.stats) {
      if (statProjects) statProjects.textContent = data.stats.projects || "0+";
      if (statExp) statExp.textContent = data.stats.experience || "1+";
      if (statFocus) statFocus.textContent = data.stats.focus || "Clean";
    }

    // Projects
    renderProjects(data.projects || []);
  }

  // Projects
  function renderProjects(projects) {
    const grid = document.getElementById("projectsGrid");
    const empty = document.getElementById("projectsEmpty");
    const filters = document.getElementById("projectFilters");

    if (!grid) return;

    // Clear
    grid.innerHTML = "";
    if (filters) filters.innerHTML = "";

    if (!projects.length) {
      if (empty) empty.classList.remove("hidden");
      return;
    }
    if (empty) empty.classList.add("hidden");

    // Get unique tags
    const allTags = new Set(["All"]);
    projects.forEach((p) =>
      (p.tags || []).forEach((t) => allTags.add(t))
    );
    const tagsArr = Array.from(allTags);

    // Render filters
    tagsArr.forEach((tag, i) => {
      const btn = document.createElement("button");
      btn.className = "filter-btn" + (tag === "All" ? " active" : "");
      btn.textContent = tag;
      btn.dataset.filter = tag;
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        filterProjects(tag);
      });
      if (filters) filters.appendChild(btn);
    });

    // Render projects
    projects.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "project-card reveal";
      card.dataset.tags = (p.tags || []).join(",");
      card.style.animationDelay = `${i * 80}ms`;

      card.innerHTML = `
        <div class="project-card__image">
          <i class="fas ${p.icon || "fa-code"}"></i>
        </div>
        <div class="project-card__content">
          <h3 class="project-card__title">${escapeHtml(p.title || "")}</h3>
          <p class="project-card__desc">${escapeHtml(
            p.description || ""
          )}</p>
          <div class="project-card__tags">
            ${(p.tags || [])
              .map((t) => `<span class="project-tag">${escapeHtml(t)}</span>`)
              .join("")}
          </div>
          <div class="project-card__links">
            ${
              p.demoUrl && p.demoUrl !== "#"
                ? `<a href="${p.demoUrl}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>`
                : ""
            }
            ${
              p.repoUrl
                ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fab fa-github"></i> View Code</a>`
                : ""
            }
          </div>
        </div>
      `;
      grid.appendChild(card);
      revealObserver.observe(card);
    });

    function filterProjects(tag) {
      const cards = document.querySelectorAll(".project-card");
      cards.forEach((card) => {
        const tags = card.dataset.tags.split(",");
        if (tag === "All" || tags.includes(tag)) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Contact form (Netlify)
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (formStatus) {
        formStatus.textContent = "Sending...";
        formStatus.className = "form__status";
      }

      const formData = new FormData(contactForm);
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(formData).toString(),
        });
        if (res.ok) {
          if (formStatus) {
            formStatus.textContent = "Message sent successfully!";
            formStatus.className = "form__status success";
          }
          contactForm.reset();
        } else {
          throw new Error("Failed to send");
        }
      } catch (err) {
        if (formStatus) {
          formStatus.textContent = "Something went wrong. Please try again.";
          formStatus.className = "form__status error";
        }
      }
    });
  }
});
