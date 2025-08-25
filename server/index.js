// Minimal secure proxy for OpenAI chat completions
// Keep API key on the server. Do NOT expose it to the client.

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

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
});