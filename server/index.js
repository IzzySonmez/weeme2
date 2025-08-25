// Minimal secure proxy for OpenAI chat completions
// Keep API key on the server. Do NOT expose it to the client.

import dotenv from 'dotenv';
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || process.env.API_PORT || 8787;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.warn("[WARN] OPENAI_API_KEY is not set. Proxy will return 503.");
}

app.post("/api/seo-suggestions", async (req, res) => {
  try {
    if (!OPENAI_KEY) {
      return res.status(503).json({ error: "OPENAI_API_KEY missing on server" });
    }

    const { prompt, reportContext, membershipType } = req.body || {};

    // Basic membership guard on server
    if (membershipType !== "Pro" && membershipType !== "Advanced") {
      return res.status(403).json({ error: "Not allowed for this plan" });
    }

    const messages = [
      { role: "system", content: "You are a senior SEO assistant. Return Turkish JSON with fields quickWins[], issues[], snippets[] (optional), roadmap{d30[],d60[],d90[]}, notes[]. Keep it concise and actionable." },
      { role: "user", content: `${reportContext ? `[RAPOR]\n${reportContext}\n\n` : ""}${prompt || "SEO iyileştirme önerileri üret."}` }
    ];

    const body = {
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "openai_error", detail: text });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "";

    // Try to parse JSON; if not JSON, pass through as text
    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = { text: content }; }

    return res.json({ ok: true, data: parsed });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
});

app.listen(PORT, () => {
  console.log(`[weeme.ai] API proxy running on http://localhost:${PORT}`);
  console.log(`[DEBUG] OpenAI API Key configured: ${OPENAI_KEY ? 'YES' : 'NO'}`);
  if (OPENAI_KEY) {
    console.log(`[DEBUG] API Key starts with: ${OPENAI_KEY.substring(0, 7)}...`);
  }
});

app.post("/api/seo-scan", async (req, res) => {
  try {
    if (!OPENAI_KEY) return res.status(503).json({ error: "OPENAI_API_KEY missing" });

    const { url } = req.body || {};
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // Fetch HTML (basic)
    let html = "";
    try {
      const r = await fetch(url, { method: "GET" });
      html = await r.text();
    } catch (e) {
      html = "";
    }

    const messages = [
      {
        role: "system",
        content:
          "You are an SEO auditor. Analyze the given site HTML and URL. Always respond with strict JSON: {score: number 0-100, positives: string[], negatives: string[], suggestions: string[], reportData: {metaTags:boolean, headings:boolean, images:boolean, performance:number, mobileOptimization:boolean, sslCertificate:boolean, pageSpeed:number, keywords:string[]}}. Use Turkish in text fields.",
      },
      {
        role: "user",
        content: `URL: ${url}\n\nHTML:\n${html.slice(0, 4000)}\n\nLütfen JSON döndür.`,
      },
    ];

    const body = { model: "gpt-4o-mini", messages, temperature: 0.3 };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "openai_error", detail: text });
    }

    const data = await r.json();
    const txt = data?.choices?.[0]?.message?.content || "";

    try {
      const parsed = JSON.parse(txt);
      return res.json({ ok: true, report: parsed });
    } catch {
      return res.status(500).json({ error: "parse_error", raw: txt });
    }
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
});