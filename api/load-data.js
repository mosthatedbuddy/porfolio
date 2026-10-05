const { handler } = require("../netlify/functions/load-data");

module.exports = async function loadData(req, res) {
  const result = await handler({
    httpMethod: req.method,
    headers: req.headers || {},
    body: null,
  });
  for (const [name, value] of Object.entries(result.headers || {})) res.setHeader(name, value);
  res.status(result.statusCode).send(result.body);
};

module.exports.config = { api: { bodyParser: false } };

