const TABLE = "portfolio_content";
const ROW_ID = "main";

function env(name) {
  return process.env[name] || "";
}

function supabaseConfig() {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY") || env("SUPABASE_SECRET_KEY") || env("SUPBASE_SERVICE_ROLE_KEY0") || env("SUPBASE_SERVICE_ROLE_KEY1");
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return { url: url.replace(/\/$/, ""), key };
}

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
}

function isPortfolioData(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.site &&
      typeof value.site === "object" &&
      Array.isArray(value.skills) &&
      Array.isArray(value.projects) &&
      value.stats &&
      typeof value.stats === "object"
  );
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) {
    const detail = typeof payload === "string" ? payload : payload?.message || payload?.hint || payload?.details || payload?.error || "Unknown Supabase error";
    const error = new Error(`Supabase request failed (${response.status}): ${detail}`);
    error.status = response.status;
    error.details = payload;
    throw error;
  }
  return payload;
}

module.exports = { TABLE, ROW_ID, json, parseBody, isPortfolioData, supabaseRequest, env };
