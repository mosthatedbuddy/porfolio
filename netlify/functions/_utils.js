const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(body),
});

const getSupabaseConfig = () => ({
  url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
});

const supabaseRequest = async (path, options = {}) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
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
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const message = body?.message || body?.error_description || body?.hint || text || `Supabase request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
};

const isValidPortfolio = (value) => Boolean(value && typeof value === "object" && value.site && typeof value.site === "object" && Array.isArray(value.skills) && Array.isArray(value.projects));

module.exports = { json, supabaseRequest, isValidPortfolio };
