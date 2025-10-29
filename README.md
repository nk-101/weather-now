## 🌤️ Weather Now

Weather Now is a lightweight and responsive weather web app built using React (Vite + TypeScript), styled with Tailwind CSS, and powered by the Open-Meteo API. It allows Jamie, an outdoor enthusiast, to quickly check real-time weather conditions for any city and get AI-based insights on what to expect — for example, “Should I carry an umbrella today?” ☔

## 🧠 Overview

The application helps users fetch current weather details, including temperature, wind speed, and conditions, using the Open-Meteo API.
It also integrates Google Gemini (LLM) to provide natural language responses to weather-related questions, creating an interactive, AI-assisted experience.

## ⚙️ Tech Stack

React (Vite + TypeScript) - Frontend framework & development tool

Tailwind CSS - Styling and responsive design

Open-Meteo API - Real-time weather and geocoding data

Google Gemini API - LLM for conversational weather assistance

Vercel - Free hosting and deployment

## ✨ Features

🌍 City-based search with geocoding

🌦️ Real-time weather (temperature, wind, condition)

💬 AI Weather Chat (LLM) — ask natural questions like “Will it rain tonight?”

📱 Responsive UI using Tailwind CSS

⚙️ Error handling for invalid cities or network issues

## 📁 Folder Structure

weather-now/
├── public/
├── src/
│ ├── WeatherNowApp.tsx # Main weather app component
│ ├── WeatherChat.tsx # Chat UI component for LLM
│ ├── index.css # Tailwind base styles
│ ├── main.tsx # React entry point
│ └── ...
├── api/
│ └── ai/
│ └── index.js # Gemini API integration (LLM)
├── package.json
├── tailwind.config.js
└── .env.local # Environment variables (API keys)

## 🤖 AI Feature (Gemini Integration)

The AI assistant uses Google’s Gemini 2.5 Pro/Flash model via the Generative Language API.
It analyzes weather context (city, temperature, wind, and condition) and answers user questions in natural language.

Example interaction:

User: “Will it rain tonight in Pune?”
Gemini: “It’s cloudy but rain isn’t expected — keep a light umbrella just in case.”

## 🚀 Deployment

Deployed on Vercel:

Auto-build from GitHub

Environment variables securely stored in Vercel

Instant redeploy on code updates

Production URL: (insert your live Vercel link here once deployed)

## 🧩 Local Development

1. Clone & install

git clone https://github.com/nk-101/weather-now.git
cd weather-now
npm install

2. Set environment variables
   Create .env.local file in project root:

GEMINI_API_KEY= the_secret_key

3.Run app locally

vercel dev
Visit: http://localhost:3000

4. Build for production

npm run build
