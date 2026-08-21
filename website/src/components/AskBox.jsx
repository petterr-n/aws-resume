import { useRef, useState } from "react";
import { CornerDownLeft, Sparkles } from "lucide-react";
import { apiUrl } from "../api";

const SUGGESTIONS = [
  "Har han jobbet med maskinsyn?",
  "What cloud experience does he have?",
  "Hva slags erfaring har han?",
];

const MAX_CHARS = 400;

export default function AskBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef(null);

  async function submit(text) {
    const q = (text ?? question).trim();
    if (!q || pending) return;

    setPending(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await fetch(apiUrl("/ask"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await response.json();

      if (!response.ok) {
        // The API's own message is more useful than a generic one — it says
        // which limit was hit and when to come back.
        setError(data.error ?? "Klarte ikke å svare akkurat nå.");
      } else {
        setAnswer(data.answer);
      }
    } catch {
      setError("Fikk ikke kontakt med serveren.");
    } finally {
      setPending(false);
    }
  }

  function askSuggestion(text) {
    setQuestion(text);
    inputRef.current?.focus();
    submit(text);
  }

  return (
    <section
      aria-labelledby="ask-heading"
      className="rounded-card border border-line bg-surface p-5 sm:p-6"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-accent" aria-hidden="true" />
        <h2
          id="ask-heading"
          className="font-display text-lg font-semibold text-ink"
        >
          Spør om CV-en
        </h2>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Still et spørsmål om bakgrunnen min. Svarene kommer fra CV-en, ikke fra
        modellens egne antakelser.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-4"
      >
        <label htmlFor="ask-input" className="sr-only">
          Spørsmål om CV-en
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="ask-input"
            ref={inputRef}
            type="text"
            value={question}
            maxLength={MAX_CHARS}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="F.eks. Hva har han jobbet med?"
            disabled={pending}
            className="min-w-0 flex-1 rounded-full border border-line-strong bg-ground px-4 py-2.5 text-sm text-ink placeholder:text-muted disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={pending || !question.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors duration-200 hover:bg-accent-hover disabled:opacity-45"
          >
            {pending ? "Tenker…" : "Spør"}
            {!pending && (
              <CornerDownLeft size={15} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </form>

      {!answer && !error && !pending && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((text) => (
            <li key={text}>
              <button
                type="button"
                onClick={() => askSuggestion(text)}
                className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors duration-200 hover:border-accent hover:text-accent"
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* polite, so a screen reader announces the answer without interrupting */}
      <div aria-live="polite" aria-atomic="true">
        {pending && (
          <p className="mt-4 text-sm text-muted">Henter svar…</p>
        )}
        {answer && (
          <div className="mt-4 rounded-xl border border-line bg-raised p-4">
            <p className="text-[0.95rem] leading-relaxed text-ink">{answer}</p>
          </div>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-line bg-raised p-4 text-sm text-ink-soft">
            {error}
          </p>
        )}
      </div>

      <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
        Claude Haiku 4.5 på Bedrock · 5 spørsmål per time
      </p>
    </section>
  );
}
