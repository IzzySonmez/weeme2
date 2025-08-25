// Minimal secure proxy for OpenAI chat completions
// Keep API key on the server. Do NOT expose it to the client.

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || process.env.API_PORT || 8787;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

console.log('[DEBUG] Environment check:');
console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV);
console.log('[DEBUG] Current working directory:', process.cwd());
console.log('[DEBUG] Looking for .env.local at:', process.cwd() + '/.env.local');

if (!OPENAI_KEY) {
  console.warn("[WARN] OPENAI_API_KEY is not set. Proxy will return 503.");
  console.warn("[WARN] Available env vars:", Object.keys(process.env).filter(k => k.includes('OPENAI')));
}

app.post("/api/seo-suggestions", async (req, res) => {
  try {
    if (!OPENAI_KEY) {
      console.error("[ERROR] OPENAI_API_KEY missing on server");
      return res.status(503).json({ 
        error: "OPENAI_API_KEY missing on server",
        debug: {
          cwd: process.cwd(),
          envFile: process.cwd() + '/.env.local',
          availableEnvVars: Object.keys(process.env).filter(k => k.includes('OPENAI'))
        }
      });
    }

    const { prompt, reportContext, membershipType } = req.body || {};

    // Basic membership guard on server
    if (membershipType !== "Pro" && membershipType !== "Advanced") {
      console.log("[INFO] Membership check failed:", membershipType);
      return res.status(403).json({ error: "Not allowed for this plan" });
    }

    console.log("[INFO] Making OpenAI request for membership:", membershipType);

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
      console.error("[ERROR] OpenAI API error:", r.status, text);
      return res.status(r.status).json({ error: "openai_error", detail: text });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || "";

    // Try to parse JSON; if not JSON, pass through as text
    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = { text: content }; }

    console.log("[INFO] OpenAI request successful");
    return res.json({ ok: true, data: parsed });
  } catch (e) {
    console.error("[ERROR] Server error in /api/seo-suggestions:", e);
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
    if (!OPENAI_KEY) {
      console.error("[ERROR] OPENAI_API_KEY missing for SEO scan");
      return res.status(503).json({ 
        error: "OPENAI_API_KEY missing",
        debug: {
          cwd: process.cwd(),
          envFile: process.cwd() + '/.env.local'
        }
      });
    }

    const { url } = req.body || {};
    if (!url || !/^https?:\/\//.test(url)) {
      console.error("[ERROR] Invalid URL provided:", url);
      return res.status(400).json({ error: "Invalid URL" });
    }

    console.log("[INFO] Starting SEO scan for URL:", url);

    // Fetch HTML (basic)
    let html = "";
    try {
      const r = await fetch(url, { 
        method: "GET",
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; weeme.ai SEO Scanner)'
        }
      });
      html = await r.text();
      console.log("[INFO] HTML fetched successfully, length:", html.length);
    } catch (e) {
      console.warn("[WARN] Failed to fetch HTML:", e.message);
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

    console.log("[INFO] Making OpenAI request for SEO analysis");

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("[ERROR] OpenAI API error in SEO scan:", r.status, text);
      return res.status(r.status).json({ error: "openai_error", detail: text });
    }

    const data = await r.json();
    const txt = data?.choices?.[0]?.message?.content || "";

    console.log("[INFO] OpenAI response received, parsing JSON");

    try {
      const parsed = JSON.parse(txt);
      console.log("[INFO] SEO scan completed successfully, score:", parsed.score);
      return res.json({ ok: true, report: parsed });
    } catch {
      console.error("[ERROR] Failed to parse OpenAI response as JSON:", txt);
      return res.status(500).json({ error: "parse_error", raw: txt });
    }
  } catch (e) {
    console.error("[ERROR] Server error in /api/seo-scan:", e);
    return res.status(500).json({ error: "server_error", detail: String(e) });
  }
});