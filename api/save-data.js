const { handler } = require("../netlify/functions/save-data");

async function readBody(req) {
  if (typeof req.body === "string") return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);
  return await new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

module.exports = async function saveData(req, res) {
  try {
    const result = await handler({
      httpMethod: req.method,
      headers: req.headers || {},
      body: await readBody(req),
    });
    for (const [name, value] of Object.entries(result.headers || {})) res.setHeader(name, value);
    res.status(result.statusCode).send(result.body);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to save portfolio data" });
  }
};

module.exports.config = { api: { bodyParser: false } };

