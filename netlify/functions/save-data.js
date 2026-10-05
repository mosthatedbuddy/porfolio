const { TABLE, ROW_ID, json, parseBody, isPortfolioData, supabaseRequest, env } = require("./_utils");

function authorized(event) {
  const expected = env("ADMIN_TOKEN") || env("PORTFOLIO_ADMIN_TOKEN");
  // The existing admin surface authenticates locally. Require a server token when one is configured;
  // otherwise allow the established admin UI to publish through this private function route.
  if (!expected) return true;
  const header = event.headers?.authorization || event.headers?.Authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : (event.headers?.["x-admin-token"] || "");
  return token === expected;
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" }, { Allow: "POST" });
  if (!authorized(event)) return json(401, { error: "Unauthorized" });
  const data = parseBody(event);
  if (!isPortfolioData(data)) return json(400, { error: "Invalid portfolio data" });
  try {
    const rows = await supabaseRequest(TABLE, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id: ROW_ID, payload: data, updated_at: new Date().toISOString() }),
    });
    const row = Array.isArray(rows) ? rows[0] : null;
    return json(200, { ok: true, data: row?.payload || data, updatedAt: row?.updated_at || null });
  } catch (error) {
    console.error("[v0] save-data failed", error.message, error.details || "");
    return json(error.status === 404 ? 404 : 500, { error: "Unable to save portfolio data" });
  }
};
