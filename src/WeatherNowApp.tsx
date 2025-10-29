import { useState } from "react";
import WeatherChat from "./WeatherChat";

// -----------------------------
// 🔹 Type Definitions
// -----------------------------

// Structure of the current weather data returned by Open-Meteo
type CurrentWeather = {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
};

// Shape of the weather API response
type WeatherResponse = { current_weather: CurrentWeather };

// Structure for a single place result from the geocoding API
type Place = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
};

// -----------------------------
// 🔹 Weather Code Mapping (WMO → label + emoji)
// -----------------------------
const WEATHER_MAP: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Moderate drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌧️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Moderate rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Snow fall", icon: "🌨️" },
  80: { label: "Rain showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
};

// -----------------------------
// 🔹 Helper Functions
// -----------------------------

// Converts an ISO timestamp to a readable local time string
function formatLocalTime(isoString: string): string {
  if (!isoString) return "—";
  try {
    const dt = new Date(isoString);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(dt);
  } catch {
    return isoString;
  }
}

// Fetches latitude/longitude for a given city using Open-Meteo Geocoding API
async function geocodeCity(city: string): Promise<Place> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to search city");

  const data = await res.json();
  if (!data.results?.length) throw new Error("City not found");

  const r = data.results[0];
  return {
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  };
}

// Fetches current weather using coordinates from the previous function
async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}

// -----------------------------
// 🔹 Main Component: WeatherNowApp
// -----------------------------
export default function WeatherNowApp() {
  // --- State variables ---
  const [city, setCity] = useState<string>(""); // user-input city name
  const [loading, setLoading] = useState(false); // loading state
  const [error, setError] = useState<string | null>(null); // error message
  const [weather, setWeather] = useState<CurrentWeather | null>(null); // weather data
  const [place, setPlace] = useState<Place | null>(null); // city info (name + country)

  // Triggered when user clicks "Get Weather" or presses Enter
  async function handleSearch() {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      // Step 1: Convert city name → coordinates
      const p = await geocodeCity(city.trim());
      setPlace(p);

      // Step 2: Fetch weather data using coordinates
      const w = await fetchWeather(p.latitude, p.longitude);
      setWeather(w.current_weather);
    } catch (err: unknown) {
      // Handle both network and logical errors
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      // Stop loading spinner
      setLoading(false);
    }
  }

  // -----------------------------
  // 🔹 UI Rendering
  // -----------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
      {/* App Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-80 text-center">
        <h1 className="text-2xl font-bold mb-4">Weather Now 🌤️</h1>

        {/* Input field */}
        <input
          type="text"
          placeholder="Enter city name"
          className="border rounded-xl w-full p-2 mb-3"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()} // search on Enter key
        />

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-4 py-2 w-full mb-3"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Weather"}
        </button>

        {/* Error message */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Weather display */}
        {weather && place && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">
              {place.name}
              {place.country ? `, ${place.country}` : ""}
            </h2>

            {/* Temperature */}
            <p className="text-4xl my-2">{Math.round(weather.temperature)}°C</p>

            {/* Condition and icon */}
            <p className="text-xl">
              {(WEATHER_MAP[weather.weathercode] || {}).icon || "❔"}{" "}
              {(WEATHER_MAP[weather.weathercode] || {}).label || ""}
            </p>

                        {/* Wind + Time */}
            <p className="text-sm opacity-70">
              Wind: {Math.round(weather.windspeed)} km/h
            </p>
            <p className="text-xs mt-1">{formatLocalTime(weather.time)}</p>

            {/* AI Chat — ask questions about current weather */}
            <div className="mt-4">
              <WeatherChat place={place} weather={weather} />
            </div>

           
          </div>
        )}
      </div>
    </div>
  );
}
