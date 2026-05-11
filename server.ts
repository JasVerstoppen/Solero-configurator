import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
let dbErrorInfo: string | null = null;
const db = (function initializeAdmin() {
    try {
        const configPath = path.join(process.cwd(), "firebase-applet-config.json");
        const adminKeyPath = path.join(process.cwd(), "firebase-admin-key.json");
        
        let config: any = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, "utf8"));
            console.log("Found Firebase config (Project ID:", config.projectId, ", Database:", config.firestoreDatabaseId, ")");
        }

        let app;
        if (getApps().length === 0) {
            if (fs.existsSync(adminKeyPath)) {
                console.log("Initializing Firebase Admin with Service Account key...");
                const serviceAccount = JSON.parse(fs.readFileSync(adminKeyPath, "utf8"));
                app = initializeApp({
                    credential: cert(serviceAccount),
                    projectId: config.projectId
                });
            } else {
                const projectId = config.projectId || process.env.PROJECT_ID;
                console.log(`Firebase Admin using default credentials for project: ${projectId}`);
                app = initializeApp({
                    projectId: projectId
                });
            }
        } else {
            app = getApp();
        }
        
        const databaseId = (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)") 
            ? config.firestoreDatabaseId 
            : undefined;

        if (databaseId) {
            console.log(`Connecting to Firestore database: ${databaseId}`);
            return getFirestore(app, databaseId);
        }
        
        return getFirestore(app);
    } catch (e: any) {
        console.error("ERROR initializing Firebase Admin:", e);
        dbErrorInfo = e.message;
        return null;
    }
})();

async function startServer() {
    const app = express();
    app.use(express.json({ limit: "1mb" }));

    // Diag Route
    app.get("/api/diag", (req, res) => {
        res.json({
            status: "ok",
            nodeVersion: process.version,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                hasSmtpUser: !!process.env.SMTP_USER,
                hasSmtpPass: !!process.env.SMTP_PASS,
                smtpHost: process.env.SMTP_HOST || "DEFAULT",
            },
            firebase: {
                dbInitialized: !!db,
                error: dbErrorInfo,
                projectId: getApps()[0]?.options.projectId || "UNKNOWN",
                databaseId: (db as any)?._databaseId || "DEFAULT",
            },
            paths: {
                cwd: process.cwd(),
                existsConfig: fs.existsSync(path.join(process.cwd(), "firebase-applet-config.json")),
                existsAdminKey: fs.existsSync(path.join(process.cwd(), "firebase-admin-key.json"))
            }
        });
    });

    // DB Ping Route
    app.get("/api/db-ping", async (req, res) => {
        if (!db) return res.status(500).json({ error: "DB not initialized", detail: dbErrorInfo });
        try {
            const testRef = db.collection('_system_tests').doc('last_ping');
            await testRef.set({
                time: FieldValue.serverTimestamp(),
                message: "Server is alive (Admin SDK v2)"
            });
            res.json({ success: true, path: testRef.path });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message });
        }
    });

    // Test SMTP Route
    app.get("/api/test-smtp", async (req, res) => {
        const smtpHost = process.env.SMTP_HOST || "smtp-auth.mailprotect.be";
        const smtpUser = (process.env.SMTP_USER || "info@parasols-xl.nl").trim();
        const smtpPass = (process.env.SMTP_PASS || "98Sr8722dF5n4y4lPRp4").trim();
        const smtpTo = process.env.SMTP_TO || "info@parasols.nl";
        const smtpPort = Number(process.env.SMTP_PORT || 465);

        try {
            console.log(`Manual SMTP test triggered for ${smtpTo}...`);
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: smtpUser, pass: smtpPass },
                tls: { rejectUnauthorized: false }
            });

            await transporter.verify();
            const info = await transporter.sendMail({
                from: `"Solero SMTP Test" <${smtpUser}>`,
                to: smtpTo,
                subject: "Solero Configurator - SMTP Test",
                text: "Configuratortest: Dit bericht bevestigt dat de mailserververbinding werkt."
            });

            res.json({ success: true, messageId: info.messageId, response: info.response });
        } catch (error: any) {
            console.error("SMTP Test failed:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // API Routes
    app.get("/api/health", (req, res) => {
        res.json({ status: "ok", time: new Date().toISOString() });
    });

    app.post("/api/submit-quote", async (req, res) => {
        try {
            console.log("Received submission request");
            const data = req.body;
            const customer = data.customer;
            const parasols = data.parasols || [];
            const totalPrice = data.totalPrice || 0;
            const type = data.type || 'QUOTE';
            const fullEmailText = data.fullEmailText;
            const language = data.language || 'nl';

            if (!customer?.email) {
                return res.status(400).json({ error: "E-mail is verplicht." });
            }

            // Webhook to Make.com
            try {
                const hookUrl = "https://hook.eu1.make.com/6xtn5re726p588b50oafhic419u66v4m";
                axios.post(hookUrl, data, { timeout: 10000 }).catch(e => console.error("Make hook silent error"));
            } catch (hookErr: any) {}

            if (!db) {
                console.error("Firestore DB not initialized");
                return res.status(500).json({ error: "Database initialization failed." });
            }

            console.log("Saving to Firestore...");
            const quoteRef = await db.collection('quotes').add({
                customerName: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
                customerEmail: customer.email,
                customerPhone: customer.phone || '',
                totalPrice: totalPrice,
                itemsCount: parasols.length,
                language: language,
                createdAt: FieldValue.serverTimestamp(),
                type: type,
                status: 'NEW',
                emailSent: false,
                fullEmailText: fullEmailText || '',
                rawPayload: data
            });

            console.log("Saved successfully, ID:", quoteRef.id);
            
            // Trigger background mail
            processUnsentEmails().catch(err => console.error("Immediate background email error:", err));

            return res.json({ success: true, id: quoteRef.id });
        } catch (error: any) {
            console.error("Submission error details:", error);
            return res.status(500).json({ error: error.message });
        }
    });

    // Background Email Processing
    async function processUnsentEmails() {
        if (!db) return 0;
        
        console.log("Checking for unsent emails...");
        const smtpHost = process.env.SMTP_HOST || "smtp-auth.mailprotect.be";
        const smtpUser = (process.env.SMTP_USER || "info@parasols-xl.nl").trim();
        const smtpPass = (process.env.SMTP_PASS || "98Sr8722dF5n4y4lPRp4").trim();
        const smtpTo = process.env.SMTP_TO || "info@parasols.nl";
        const smtpPort = Number(process.env.SMTP_PORT || 465);

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.error("SMTP credentials missing.");
            return 0;
        }

        try {
            const snapshot = await db.collection('quotes')
                .where('emailSent', '==', false)
                .limit(5)
                .get();

            if (snapshot.empty) {
                console.log("Nothing to send.");
                return 0;
            }

            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: smtpUser, pass: smtpPass },
                tls: { rejectUnauthorized: false }
            });

            let count = 0;
            for (const doc of snapshot.docs) {
                const quote = doc.data();
                try {
                    console.log(`Sending mail for quote ${doc.id}...`);
                    await transporter.sendMail({
                        from: `"Solero Configurator" <${smtpUser}>`,
                        to: smtpTo,
                        replyTo: quote.customerEmail,
                        subject: `${quote.type === 'ORDER' ? 'Bestelling' : 'Offerte'} - ${quote.customerName}`,
                        text: quote.fullEmailText || `Nieuwe aanvraag van ${quote.customerName}`
                    });

                    await doc.ref.update({
                        emailSent: true,
                        emailSentAt: FieldValue.serverTimestamp()
                    });
                    count++;
                } catch (itemErr: any) {
                    console.error(`Mail failed for ${doc.id}:`, itemErr.message);
                }
            }
            return count;
        } catch (err: any) {
            console.error("Batch send error:", err.message);
            return 0;
        }
    }

    // Interval check every 5 mins
    setInterval(processUnsentEmails, 5 * 60 * 1000);

    // Serve static files or Vite
    const distPath = path.join(process.cwd(), "dist");
    const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(distPath);

    if (!isProduction) {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            const indexPath = path.join(distPath, 'index.html');
            if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                res.status(404).send("Build not found.");
            }
        });
    }

    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server started on http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error("Fatal startup error:", err);
});
