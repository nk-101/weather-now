//gemini
// 🌤️ api/ai/index.js
// ------------------------------------------------------------
// Gemini API integration for Weather Now
// ------------------------------------------------------------
// This serverless function handles AI-powered weather insights
// using Google's Gemini models via the Generative Language API.
//
// ✅ Features:
//  - Uses environment variable GEMINI_API_KEY (secure, hidden)
//  - Builds a dynamic weather-related prompt
//  - Tries multiple Gemini models (2.5 & 2.0) with fallback
//  - Returns concise natural language responses
// ------------------------------------------------------------

export default async function handler(req, res) {
  // 🛑 Restrict to POST requests only
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // 🔑 Load Gemini API key from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return res
      .status(500)
      .json({ error: "GEMINI_API_KEY missing in environment variables." });

  // 🧠 Extract user input data (city, weather, question)
  const { place, weather, question } = req.body || {};

  // 📍 Handle missing values gracefully
  const placeName = place?.name || "the location";
  const country = place?.country ? `, ${place.country}` : "";
  const temp =
    weather?.temperature != null ? `${weather.temperature}°C` : "unknown";
  const wind =
    weather?.windspeed != null ? `${weather.windspeed} km/h` : "unknown";
  const conditionCode = weather?.weathercode ?? "N/A";

  // 📝 Construct the AI prompt
  const prompt = `
You are a concise, friendly weather assistant. 
Answer in 1–2 sentences and add one practical tip if needed.

Context:
City: ${placeName}${country}
Temperature: ${temp}
Wind: ${wind}
Condition code: ${conditionCode}

User question: ${question || "Give a short summary of current conditions."}
  `.trim();

  // 🚀 Candidate Gemini models (from ListModels output)
  // Tries each in sequence until one responds successfully
  const candidates = [
    "models/gemini-2.5-pro",
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash-001",
    "models/gemini-2.0-flash",
    "models/gemini-2.0-flash-lite-001",
    "models/gemini-2.5-flash-lite",
  ];

  let lastErr = null;

  // 🔁 Try each model sequentially until a valid response is received
  for (const modelId of candidates) {
    const endpoint = `https://generativelanguage.googleapis.com/v1/${modelId}:generateContent?key=${apiKey}`;

    try {
      // 🌐 Make POST request to Gemini API
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6, // controls creativity
            maxOutputTokens: 120, // limits response length
          },
        }),
      });

      const text = await resp.text();

      // ❌ If API returned an error, log and try next model
      if (!resp.ok) {
        lastErr = { modelId, status: resp.status, detail: text };
        continue;
      }

      // ✅ Parse and extract AI-generated response
      const data = JSON.parse(text);
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (answer)
        return res
          .status(200)
          .json({ answer: answer.trim(), model: modelId }); // return successful result

      // Fallback if empty
      lastErr = { modelId, status: resp.status, detail: text };
    } catch (err) {
      // 🧯 Catch unexpected network or parsing errors
      lastErr = { modelId, error: String(err) };
    }
  }

  // ❗If all models fail, return diagnostic info
  return res.status(502).json({ error: "All Gemini models failed", lastErr });
}

// manual code:used when api's were not working
/*
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

  */
