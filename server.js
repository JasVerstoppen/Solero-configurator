
import nodemailer from "nodemailer";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // CORS (optioneel, maar netjes)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://configurator.parasols.be");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // --- Storage paths ---
  const QUOTES_DIR = path.join(__dirname, "storage", "quotes");
  const SENT_DIR = path.join(__dirname, "storage", "quotes_sent");
  const FAILED_DIR = path.join(__dirname, "storage", "quotes_failed");
  const LOG_FILE = path.join(__dirname, "storage", "cron-mail.log");

  fs.mkdirSync(QUOTES_DIR, { recursive: true });
  fs.mkdirSync(SENT_DIR, { recursive: true });
  fs.mkdirSync(FAILED_DIR, { recursive: true });

  function safe(s) {
    return String(s || "").replace(/[^a-z0-9._-]/gi, "_").slice(0, 80);
  }

  function logLine(line) {
    try {
      fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${line}\n`, "utf8");
    } catch (_) {
      // ignore logging errors to avoid crashing
    }
  }

  function mustEnv(name) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
  }

  function buildTransporter() {
    const host = mustEnv("SMTP_HOST");
    const port = Number(mustEnv("SMTP_PORT"));
    const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
    const user = mustEnv("SMTP_USER");
    const pass = mustEnv("SMTP_PASS");

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  function quoteToEmailText(q) {
    // Gebruik de volledig geformatteerde tekst als die aanwezig is in de JSON
    if (q.fullEmailText) {
      let msg = q.fullEmailText;
      msg += `\n\n--------------------------------------\n`;
      msg += `ID: ${q.id || "-"}\n`;
      msg += `Type: ${q.type || "QUOTE"}\n`;
      msg += `Ontvangen: ${q.received_at || "-"}\n`;
      if (q.meta) {
        msg += `IP: ${q.meta.ip || "-"}\n`;
      }
      return msg;
    }

    // Fallback voor oude structuur of als fullEmailText ontbreekt
    const c = q.customer || {};
    const cfg = q.config || {};

    let msg = `${q.type === 'ORDER' ? 'NIEUWE BESTELLING' : 'OFFERTE AANVRAAG'}: ${cfg.model || "SOLERO BASTO"}\n`;
    msg += `======================================\n\n`;
    msg += `KLANTGEGEVENS:\n`;
    msg += `Naam: ${c.name || "-"}\n`;
    msg += `E-mail: ${c.email || "-"}\n`;
    msg += `Telefoon: ${c.phone || "-"}\n`;
    msg += `Adres: ${c.address || "-"}\n`;
    msg += `Woonplaats: ${(c.zip || "")} ${(c.city || "")}\n`;
    
    if (cfg.paymentMethod) {
      msg += `Betaalmethode: ${cfg.paymentMethod}\n`;
    }
    msg += `\n`;

    // Toon alle properties die beginnen met "Parasol"
    Object.keys(cfg).filter(key => key.startsWith('Parasol')).forEach(key => {
      msg += `${key}:\n${cfg[key]}\n\n`;
    });

    msg += `TOTAALBEDRAG: € ${cfg.totalPrice ?? "0,00"} (incl. BTW)\n\n`;
    
    if (c.message) {
      msg += `OPMERKING VAN KLANT: ${c.message}\n\n`;
    }

    msg += `ID: ${q.id || "-"}\n`;
    msg += `Ontvangen: ${q.received_at || "-"}\n`;
    return msg;
  }

  // --- API: submit quote/order -> JSON file ---
  app.post("/api/submit-quote", (req, res) => {
    try {
      const data = req.body || {};
      const customer = data.customer || {};
      const config = data.config || {};

      const name = String(customer.name || "").trim();
      const email = String(customer.email || "").trim();

      if (!name || !email) {
        return res.status(400).json({ success: false, error: "Naam en e-mail zijn verplicht." });
      }

      const now = new Date();
      const stamp = now.toISOString().replace(/[:.]/g, "-");
      const id = `${stamp}_${safe(email)}_${Math.random().toString(16).slice(2)}`;

      const payload = {
        id,
        received_at: now.toISOString(),
        ...data, // Bevat customer, config, type (ORDER/QUOTE), fullEmailText
        meta: {
          ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
          ua: req.headers["user-agent"] || null,
          referer: req.headers["referer"] || null,
        },
      };

      const filePath = path.join(QUOTES_DIR, `${id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");

      return res.json({ success: true, id });
    } catch (e) {
      return res.status(500).json({ success: false, error: "Server error", details: String(e?.message || e) });
    }
  });

  // --- Cron trigger endpoint ---
  app.get("/cron/send-quotes", async (req, res) => {
    try {
      const token = String(req.query.token || "");
      const expected = String(process.env.CRON_TOKEN || "");

      if (!expected || token !== expected) {
        return res.status(403).json({ ok: false, error: "Forbidden" });
      }

      const transporter = buildTransporter();
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
      const fromName = process.env.SMTP_FROM_NAME || "Solero Configurator";
      const toEmail = mustEnv("SMTP_TO");

      const files = fs
        .readdirSync(QUOTES_DIR)
        .filter((f) => f.endsWith(".json"))
        .sort();

      if (!files.length) {
        return res.json({ ok: true, sent: 0, message: "No quotes/orders." });
      }

      let sent = 0;
      let failed = 0;

      for (const file of files) {
        const fullPath = path.join(QUOTES_DIR, file);
        try {
          const raw = fs.readFileSync(fullPath, "utf8");
          const q = JSON.parse(raw);
          const prefix = q.type === 'ORDER' ? 'Bestelling' : 'Offerte aanvraag';
          const subject = `${prefix} Solero Basto - ${q.customer?.name || "Klant"}`;
          const text = quoteToEmailText(q);

          await transporter.sendMail({
            from: `${fromName} <${fromEmail}>`,
            to: toEmail,
            replyTo: q.customer?.email ? `${q.customer.name} <${q.customer.email}>` : undefined,
            subject,
            text,
          });

          fs.renameSync(fullPath, path.join(SENT_DIR, file));
          sent++;
          logLine(`SENT: ${file}`);
        } catch (err) {
          try { fs.renameSync(fullPath, path.join(FAILED_DIR, file)); } catch (_) {}
          failed++;
          logLine(`FAILED: ${file} :: ${err.message}`);
        }
      }

      return res.json({ ok: true, sent, failed });
    } catch (e) {
      return res.status(500).json({ ok: false, error: "Cron error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
