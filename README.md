## 🧠 Overview

This project was built to fulfill a real-world user requirement:

Jamie, an outdoor enthusiast, wants to quickly check current weather conditions for any city.

The app allows Jamie to:

🌍 Search for any city (geocoded automatically)

🌡️ View current temperature and conditions

💨 See wind speed and status

🤖 Ask AI-style questions like “Should I carry an umbrella?” or “What should I wear today?”

📱 Use it on both desktop and mobile (responsive Tailwind UI)

🚀 Experience fast performance thanks to Vite + React

## ⚙️ Tech Stack

Tool / Library Purpose
React (Vite + TypeScript) Frontend framework & build tool
Tailwind CSS Styling and responsive design
Open-Meteo API Free weather and geocoding data
Vercel Deployment platform (serverless hosting)
Serverless API (Node) AI / rule-based chat responses

## 🧩 Features

Instant city search — Get results even if the spelling is slightly off.

Accurate weather data — Temperature, wind, and condition codes from Open-Meteo.

Emoji-based weather display 🌦️☀️❄️

AI Weather Assistant (Fallback Mode)

Gives intelligent, human-like advice about rain, clothing, or outdoor plans.

Works locally with no external API dependency.

Easily replaceable with OpenAI, Cohere, or Hugging Face integration in the future.

Deployed on Vercel — Free, fast, and scalable.

## 📁 Folder Structure

weather-now/
├── src/
│ ├── WeatherNowApp.tsx # Main UI component
│ ├── WeatherChat.tsx # AI chat interface
│ ├── index.css # Tailwind styles
│ └── main.tsx # App entry point
├── api/
│ └── ai/
│ └── index.js # Serverless AI logic (rule-based)
├── public/
│ └── icons, manifest, etc.
└── vite.config.ts

## 🧠 AI / Assistant Logic

The app includes a lightweight, local rule-based AI assistant that:

Responds contextually to weather data and user queries.

Suggests actions like carrying an umbrella, clothing advice, or outdoor suitability.

Does not require API keys or internet access beyond Open-Meteo.

Can later be upgraded to a true LLM-powered assistant (OpenAI, Cohere, or Hugging Face).

## 🚀 Deployment

This project is deployed on Vercel.

1.Push changes to GitHub.
2.Connect the repo on vercel.com
3.Vercel auto-builds and deploys your site.
4.Live link updates instantly after each push.

## 🧪 Local Development

# Clone and install

git clone https://github.com/nk-101/weather-now.git
cd weather-now
npm install

# Start dev server

npm run dev

Visit http://localhost:5173
in your browser.

## 💬 Future Enhancements

Integrate Cohere / OpenAI Chat API for natural LLM-powered answers.

Add weather forecast (next 3 days).

Include dark/light theme toggle.

Improve chat history persistence.
