// src/WeatherChat.tsx
import { useState } from "react";

type Place = { name: string; country?: string } | null;
type Weather = {
  temperature?: number;
  windspeed?: number;
  weathercode?: number;
  time?: string;
} | null;

export default function WeatherChat({ place, weather }: { place: Place; weather: Weather }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function askAI() {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place, weather, question: question.trim() }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error || "Failed to get response from AI");
      } else {
        setAnswer(data.answer);
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border p-4 bg-white/80 dark:bg-zinc-400/60">
      <p className="text-sm opacity-100 mb-2">
        Ask  about today's weather
        <p> e.g: "What should I wear?",<p>&nbsp;&nbsp;&nbsp;&nbsp;  "Will it rain tonight?"</p></p>
      </p>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askAI()}
          placeholder="Ask about today’s climate"
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={askAI}
          disabled={loading}
          className="px-1 py-1 rounded-lg bg-sky-600 text-white disabled:opacity-50"
        >
          {loading ? "..." : "Ask "}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      {answer && (
        <div className="mt-3 rounded-md border bg-zinc-50 p-3 text-sm">
          <strong>Answer:</strong>
          <p className="mt-2 whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}
