"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api/client";

type ExplanationResponse = {
  explanation: string;
};

export default function ExplainWithRalvia() {
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [error, setError] = useState("");

  async function explain() {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analytics/explain`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: language,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Could not generate explanation");
      }

      const data: ExplanationResponse = await response.json();

      setExplanation(data.explanation);

      speak(data.explanation);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  function speak(text: string) {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = language === "ar" ? "ar-SA" : "en-US";

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setSpeaking(true);
    };

    speech.onend = () => {
      setSpeaking(false);
    };

    speech.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <div className="mt-4">
      <div className="flex gap-3">
        <div className="mb-3 flex gap-2">
  <button
    onClick={() => setLanguage("en")}
    className={`rounded-lg px-3 py-1.5 text-sm ${
      language === "en"
        ? "bg-gray-900 text-white"
        : "border border-gray-300 text-gray-700"
    }`}
  >
    English
  </button>

  <button
    onClick={() => setLanguage("ar")}
    className={`rounded-lg px-3 py-1.5 text-sm ${
      language === "ar"
        ? "bg-gray-900 text-white"
        : "border border-gray-300 text-gray-700"
    }`}
  >
    العربية
  </button>
</div>
        <button
          onClick={explain}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading
            ? "Ralvia is analyzing..."
            : "🔊 Explain with Ralvia"}
        </button>

        {speaking && (
          <button
            onClick={stopSpeaking}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Stop
          </button>
        )}
      </div>

      {explanation && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm leading-6 text-gray-700">
            {explanation}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}