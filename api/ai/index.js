// api/ai/index.js
// Vercel serverless function for AI chat using OpenAI API
/* open ai:
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "API key missing in environment variables." });
    return;
  }



  try {
    const { place, weather, question } = req.body;

    const placeName = place?.name || "the location";
    const country = place?.country ? `, ${place.country}` : "";
    const temp = weather?.temperature != null ? `${weather.temperature}°C` : "unknown";
    const wind = weather?.windspeed != null ? `${weather.windspeed} km/h` : "unknown";

    const systemPrompt =
      "You are a helpful, friendly weather assistant. Keep answers short and practical.";

    const userPrompt = `City: ${placeName}${country}
Temperature: ${temp}
Wind: ${wind}
Condition code: ${weather?.weathercode ?? "N/A"}
Question: ${question}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 120,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || "Sorry, I couldn't respond.";

    res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
*/
// hugging face:

// api/ai/index.js  (Hugging Face inference API version)
// Uses HF_API_KEY from environment variables
// api/ai/index.js



// api/ai/index.js
/*
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const hfKey = process.env.HF_API_KEY;
  console.log("DEBUG: HF key present?", !!hfKey);
  if (!hfKey) {
    res.status(500).json({ error: "HF_API_KEY missing in environment variables." });
    return;
  }

  try {
    const { place, weather, question } = req.body || {};
    const placeName = place?.name || "the location";
    const country = place?.country ? `, ${place.country}` : "";
    const temp = weather?.temperature != null ? `${weather.temperature}°C` : "unknown";
    const wind = weather?.windspeed != null ? `${weather.windspeed} km/h` : "unknown";
    const conditionCode = weather?.weathercode ?? "N/A";

    const prompt = `You are a helpful weather assistant. Use the context below and answer concisely (one or two sentences), and give one practical suggestion if relevant.

Context:
City: ${placeName}${country}
Temperature: ${temp}
Wind: ${wind}
Condition code: ${conditionCode}

User question: ${question}

Answer:`;

    // Candidate models to try (order: more likely -> fallback)
    const models = [
      "gpt2",
      "distilgpt2",
      "sshleifer/tiny-gpt2",
      // you can add more models here if you want
    ];

    let lastError = null;
    for (const model of models) {
      const inferenceUrl = `https://api-inference.huggingface.co/models/${model}`;
      try {
        const resp = await fetch(inferenceUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 120, temperature: 0.6 },
            options: { wait_for_model: true },
          }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          console.warn(`HF model ${model} returned ${resp.status}: ${text.slice(0,200)}`);
          lastError = { model, status: resp.status, detail: text };
          // if 404 try next model; if other errors you may still try next but keep lastError
          continue;
        }

        const data = await resp.json();
        let answer = "";
        if (Array.isArray(data)) {
          answer = data[0]?.generated_text ?? JSON.stringify(data).slice(0,1000);
        } else if (data.generated_text) {
          answer = data.generated_text;
        } else if (data?.[0]?.generated_text) {
          answer = data[0].generated_text;
        } else {
          answer = JSON.stringify(data).slice(0,2000);
        }

        return res.status(200).json({ answer: answer.trim(), model });
      } catch (err) {
        console.error(`Error calling HF model ${model}:`, err);
        lastError = { model, error: String(err) };
        // try next model
      }
    }

    // If we reach here, all models failed
    return res.status(502).json({
      error: "HF inference error (all candidates failed)",
      lastError,
    });
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Internal server error", detail: String(err) });
  }
}
*/

//cohere

// api/ai/index.js
// Cohere Chat API handler — expects COHERE_API_KEY in env

// api/ai/index.js
// Cohere Chat API handler — expects COHERE_API_KEY in env

/*
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cohereKey = process.env.COHERE_API_KEY;
  console.log("DEBUG: COHERE key present?", !!cohereKey);
  if (!cohereKey) {
    return res.status(500).json({ error: "COHERE_API_KEY missing in environment variables." });
  }

  try {
    const { place, weather, question } = req.body || {};
    const placeName = place?.name || "the location";
    const country = place?.country ? `, ${place.country}` : "";
    const temp = weather?.temperature != null ? `${weather.temperature}°C` : "unknown";
    const wind = weather?.windspeed != null ? `${weather.windspeed} km/h` : "unknown";
    const conditionCode = weather?.weathercode ?? "N/A";

    const systemMessage = `You are a friendly, concise weather assistant. Answer in 1-2 sentences and give one practical tip if relevant.`;
    // ensure question is non-empty string
    const userQ = (question || "").trim() || "Give a short weather summary for the current conditions.";

    const userMessage = `Context:
City: ${placeName}${country}
Temperature: ${temp}
Wind: ${wind}
Condition code: ${conditionCode}

User question: ${userQ}`;

    // Use the simpler content format (string) which is accepted by Cohere Chat v1
    const body = {
      model: "command",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      max_tokens: 120,
      temperature: 0.7
    };

    console.log("DEBUG: Cohere request body preview:", JSON.stringify(body).slice(0, 800));

    const resp = await fetch("https://api.cohere.com/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohereKey}`,
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error("Cohere API error:", resp.status, text);
      return res.status(502).json({ error: "Cohere API error", status: resp.status, detail: text });
    }

    const data = JSON.parse(text);
    // Try common shapes: data.message.content[0].text OR data.message.content[0] (string) OR data.generations...
    const assistantText =
      data?.message?.content?.[0]?.text ??
      (typeof data?.message?.content?.[0] === "string" ? data.message.content[0] : null) ??
      (data?.generations?.[0]?.text ?? null) ??
      JSON.stringify(data).slice(0, 2000);

    return res.status(200).json({ answer: assistantText.trim() });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error", detail: String(err) });
  }
}

*/

// api/ai/index.js
// Local rule-based "assistant" fallback — no external LLM required.
// Returns short, practical answers based on weather & question.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { place, weather, question } = req.body || {};
    const city = place?.name || "the location";
    const country = place?.country ? `, ${place.country}` : "";
    const temp = typeof weather?.temperature === "number" ? weather.temperature : null;
    const wind = typeof weather?.windspeed === "number" ? weather.windspeed : null;
    const code = weather?.weathercode ?? null;

    const q = (question || "").toString().trim().toLowerCase();

    // Basic label from weathercode (we use a small map)
    const codeMap = {
      0: "clear",
      1: "mainly clear",
      2: "partly cloudy",
      3: "overcast",
      45: "fog",
      48: "rime fog",
      51: "light drizzle",
      53: "moderate drizzle",
      55: "dense drizzle",
      61: "light rain",
      63: "moderate rain",
      65: "heavy rain",
      71: "snow",
      80: "showers",
      95: "thunderstorm"
    };
    const cond = code != null ? (codeMap[code] || "unknown") : "unknown";

    // Helper: decide umbrella
    function adviseUmbrella() {
      if ([61,63,65,80,95,55].includes(code)) return "Yes , there's rain or showers indicated; take an umbrella.";
      if ([51,53].includes(code)) return "Probably useful , light drizzle is possible; carry a small umbrella.";
      if (cond === "unknown" && temp != null && temp < 5) return "Unlikely to rain but weather's cold; consider a jacket instead.";
      return "Unlikely to rain based on current data, but keep an eye on changing skies.";
    }

    // Helper: clothing advice
    function adviseClothing() {
      if (temp == null) return "Hard to say without temperature data.";
      if (temp <= 5) return "It's cold , wear a warm jacket.";
      if (temp <= 15) return "Cool , a light jacket or sweater is recommended.";
      if (temp <= 25) return "Mild , comfortable with light layers.";
      return "Hot - wear breathable clothes and stay hydrated.";
    }

    // Helper: walk/outdoor advice
    function adviseOutdoor() {
      if ([95,65,80].includes(code)) return "Not ideal for outdoor activities , heavy rain or thunderstorms expected.";
      if ([51,53,61,63,55].includes(code)) return "Might be wet , bring waterproof gear and consider rescheduling outdoor plans.";
      if (temp != null && temp >= 35) return "It's very hot , avoid strenuous outdoor activity during peak sun.";
      return "Looks fine for outdoor activities , enjoy, but dress appropriately.";
    }

    // Decide answer by question keywords
    let answer = "";

    if (!q) {
      // default summary
      const tpart = temp != null ? `${Math.round(temp)}°C` : "temperature unknown";
      answer = `Currently in ${city}${country}: ${tpart}, ${cond}. ${adviseOutdoor()}`;
    } else if (/(umbrella|rain|rainy|raining|drizzle|shower)/.test(q)) {
      answer = adviseUmbrella();
    } else if (/(wear|clothes|jacket|cold|hot|warm|what to wear)/.test(q)) {
      answer = adviseClothing();
    } else if (/(walk|outside|outdoor|run|exercise)/.test(q)) {
      answer = adviseOutdoor();
    } else if (/(wind|windy)/.test(q)) {
      if (wind == null) answer = "I don't have current wind data.";
      else if (wind > 40) answer = `It's quite windy (${Math.round(wind)} km/h). Secure loose items and avoid outdoor tents.`;
      else answer = `Wind is ${Math.round(wind)} km/h - not too strong for normal outdoor plans.`;
    } else if (/(summary|what's the weather|how is the weather)/.test(q)) {
      const tpart = temp != null ? `${Math.round(temp)}°C` : "temperature unknown";
      answer = `Right now in ${city}${country}: ${tpart}, ${cond}. ${adviseOutdoor()}`;
    } else {
      // fallback: combine summary + suggestion
      const tpart = temp != null ? `${Math.round(temp)}°C` : "temperature unknown";
      answer = `In ${city}${country} it's ${tpart} and ${cond}. ${adviseOutdoor()}`;
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Fallback handler error:", err);
    return res.status(500).json({ error: "Internal server error", detail: String(err) });
  }
}