require("dotenv").config();
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
const dataDir = path.join(__dirname, "data");
const submissionsFile = path.join(dataDir, "submissions.json");

if (!ADMIN_USER || !ADMIN_PASSWORD || !SESSION_SECRET) {
  console.error("Configure ADMIN_USER, ADMIN_PASSWORD e SESSION_SECRET nas variáveis de ambiente.");
  process.exit(1);
}
fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(submissionsFile)) fs.writeFileSync(submissionsFile, "[]", { mode: 0o600 });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: false, limit: "30kb" }));
app.use(session({
  name: "despachante.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, "public")));

function readSubmissions() {
  try { return JSON.parse(fs.readFileSync(submissionsFile, "utf8")); }
  catch { return []; }
}
function writeSubmissions(rows) {
  fs.writeFileSync(submissionsFile, JSON.stringify(rows, null, 2), { mode: 0o600 });
}
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: "Faça login como administrador." });
}
function clean(value, max = 180) {
  return String(value || "").trim().replace(/[<>]/g, "").slice(0, max);
}

app.post("/api/solicitacoes", (req, res) => {
  const name = clean(req.body.name, 100);
  const phone = clean(req.body.phone, 30);
  const category = clean(req.body.category, 10);
  const service = clean(req.body.service, 80);
  const consent = req.body.consent === true || req.body.consent === "on" || req.body.consent === "true";
  if (!name || !phone || !["A", "B", "AB", "Outro"].includes(category) || !service || !consent) {
    return res.status(400).json({ error: "Confira os campos obrigatórios e autorize o contato." });
  }
  const rows = readSubmissions();
  const item = {
    id: require("node:crypto").randomUUID(),
    name, phone, category, service,
    notes: clean(req.body.notes, 500),
    createdAt: new Date().toISOString(),
    status: "Novo"
  };
  rows.unshift(item);
  writeSubmissions(rows);
  res.json({ ok: true, message: "Cadastro enviado! Nossa equipe entrará em contato pelo telefone informado." });
});

app.post("/api/admin/login", (req, res) => {
  const username = String(req.body.username || "");
  const password = String(req.body.password || "");
  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Usuário ou senha inválidos." });
  }
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: "Não foi possível iniciar a sessão." });
    req.session.isAdmin = true;
    res.json({ ok: true });
  });
});
app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});
app.get("/api/admin/me", (req, res) => res.json({ authenticated: !!(req.session && req.session.isAdmin) }));
app.get("/api/admin/solicitacoes", requireAdmin, (req, res) => res.json(readSubmissions()));
app.patch("/api/admin/solicitacoes/:id", requireAdmin, (req, res) => {
  const status = clean(req.body.status, 30);
  if (!["Novo", "Em atendimento", "Concluído"].includes(status)) {
    return res.status(400).json({ error: "Status inválido." });
  }
  const rows = readSubmissions();
  const item = rows.find(x => x.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Solicitação não encontrada." });
  item.status = status;
  writeSubmissions(rows);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Despachante Credenciado disponível na porta ${PORT}`));
