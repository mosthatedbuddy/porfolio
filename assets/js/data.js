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
const API_DATA_URL = "./data/portfolio.json";
const API_SAVE_URL = "/api/save-data"; // Netlify/Vercel function

async function loadPortfolioData() {
  try {
    // Try to fetch from API/JSON first
    const res = await fetch(API_DATA_URL, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.site) return data;
    }
  } catch (e) {
    // ignore
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

  // Try to save via API (Netlify Functions)
  try {
    const res = await fetch(API_SAVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return { ok: true, method: "api" };
    return { ok: false, method: "local", error: await res.text() };
  } catch (e) {
    return { ok: false, method: "local", error: e.message };
  }
}
