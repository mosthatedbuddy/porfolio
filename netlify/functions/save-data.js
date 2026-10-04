const { json, supabaseRequest, isValidPortfolio } = require("./_utils");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" }, { Allow: "POST" });
  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Invalid JSON body" }); }
  if (!isValidPortfolio(payload)) return json(400, { error: "Invalid portfolio data" });
  try {
    const rows = await supabaseRequest("portfolio_content?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id: "main", payload, updated_at: new Date().toISOString() }),
    });
    const saved = rows?.[0]?.payload;
    if (!isValidPortfolio(saved)) throw new Error("Supabase did not return the saved portfolio");
    return json(200, { ok: true, data: saved }, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error("[portfolio] Supabase save failed:", error.message);
    return json(503, { error: "Shared portfolio storage is unavailable" });
  }
};
