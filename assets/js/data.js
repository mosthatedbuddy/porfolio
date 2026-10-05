/* Default data - ADAM EL IDRISSI */
const defaultPortfolioData = {
  site: {
    title: "ADAM EL IDRISSI | Web Developer",
    name: "ADAM EL IDRISSI",
    role: "Web Developer",
    description:
      "I build clean, responsive, and user-friendly web experiences with a focus on performance and accessibility.",
    about:
      "Passionate web developer focused on building modern, performant websites. I enjoy turning ideas into clean, functional, and beautiful digital experiences.",
    email: "adam@example.com",
    github: "https://github.com/Adam-El-Idrissi",
    contactStatus: "Open to opportunities",
    accentColor: "#a855f7",
  },
  skills: [
    "HTML5",
    "CSS3",
    "JavaScript (ES6+)",
    "Responsive Design",
    "Git & GitHub",
    "API Integration",
    "UI/UX Basics",
    "Performance Optimization",
  ],
  projects: [
    {
      id: "project-1",
      title: "Portfolio Website",
      description:
        "A modern, responsive portfolio built with clean code and smooth animations. Features dark theme and mobile-first design.",
      tags: ["HTML", "CSS", "JavaScript"],
      demoUrl: "#",
      repoUrl: "https://github.com/Adam-El-Idrissi",
      featured: true,
      icon: "fa-laptop-code",
    },
    {
      id: "project-2",
      title: "Landing Page",
      description:
        "Conversion-focused landing page with modern layouts, animations, and fully responsive across all devices.",
      tags: ["HTML", "CSS", "JavaScript"],
      demoUrl: "#",
      repoUrl: "https://github.com/Adam-El-Idrissi",
      featured: true,
      icon: "fa-window-maximize",
    },
    {
      id: "project-3",
      title: "Web App",
      description:
        "Interactive web application with clean UI, smooth UX, and focus on performance and accessibility.",
      tags: ["JavaScript", "API", "CSS"],
      demoUrl: "#",
      repoUrl: "https://github.com/Adam-El-Idrissi",
      featured: false,
      icon: "fa-code",
    },
  ],
  stats: {
    projects: "3+",
    experience: "1+",
    focus: "Clean",
  },
};

/* Load/Save helpers */
const DATA_KEY = "portfolio_data_v1";
const API_DATA_URL = "/.netlify/functions/load-data";
const API_SAVE_URL = "/.netlify/functions/save-data";

async function loadPortfolioData() {
  const urls = [API_DATA_URL, "/api/load-data"];
  for (const url of urls) {
    try {
      const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
      const payload = await res.json();
      const data = payload?.data?.site ? payload.data : payload;
      if (res.ok && data?.site) {
        savePortfolioDataLocal(data);
        return data;
      }
    } catch (e) {
      console.warn("[v0] portfolio load failed", url, e);
    }
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(DATA_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && parsed.site) return parsed;
    }
  } catch (e) {
    // ignore
  }

  // Return defaults
  return JSON.parse(JSON.stringify(defaultPortfolioData));
}

function savePortfolioDataLocal(data) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save to localStorage", e);
    return false;
  }
}

async function savePortfolioData(data) {
  // Save locally first
  savePortfolioDataLocal(data);

  // Try both deployed API routes. Some hosts return an HTML fallback page for a missing
  // function, so only treat a valid JSON response as an API response.
  let lastError = "Unable to reach the portfolio database.";
  for (const url of [API_SAVE_URL, "/api/save-data"]) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        cache: "no-store",
        body: JSON.stringify(data),
      });
      const text = await res.text();
      let payload;
      try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
      if (res.ok && payload?.ok) return { ok: true, method: "api", data: payload.data };
      lastError = payload?.error || (text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180) || `Save failed (${res.status})`);
      if (res.status !== 404 && payload) break;
    } catch (e) {
      lastError = e.message || lastError;
    }
  }
  return { ok: false, method: "local", error: lastError };
}
