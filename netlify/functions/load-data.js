const { json, supabaseRequest, isValidPortfolio } = require("./_utils");

exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== "GET") return json(405, { error: "Method not allowed" }, { Allow: "GET" });
  try {
    const rows = await supabaseRequest("portfolio_content?id=eq.main&select=payload&limit=1");
    const payload = rows?.[0]?.payload;
    if (isValidPortfolio(payload)) return json(200, payload, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error("[portfolio] Supabase load failed:", error.message);
  }
  return json(404, { error: "Portfolio data is not configured" }, { "Cache-Control": "no-store" });
};
