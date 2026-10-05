const { TABLE, ROW_ID, json, supabaseRequest } = require("./_utils");

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" }, { Allow: "GET" });
  try {
    const rows = await supabaseRequest(`${TABLE}?id=eq.${encodeURIComponent(ROW_ID)}&select=payload,updated_at`);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.payload) return json(404, { error: "Portfolio data has not been saved yet" });
    return json(200, { ...row.payload, data: row.payload, updatedAt: row.updated_at });
  } catch (error) {
    console.error("[v0] load-data failed", error.message, error.details || "");
    return json(error.status === 404 ? 404 : 500, { error: "Unable to load portfolio data" });
  }
};
