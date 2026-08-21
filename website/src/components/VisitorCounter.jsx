import { useEffect, useState } from "react";
import { apiUrl } from "../api";

export default function VisitorCounter() {
  const [count, setCount] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // StrictMode runs effects twice in development; aborting the discarded run
    // keeps it from double-counting locally.
    const controller = new AbortController();

    fetch(apiUrl("/visitor"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => setCount(data.count))
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      });

    return () => controller.abort();
  }, []);

  // A broken counter should not announce itself on a CV.
  if (failed) return null;

  return (
    <p className="font-mono text-xs text-muted">
      Besøkende{" "}
      <span className="font-medium tabular-nums text-ink">
        {count === null ? "…" : count.toLocaleString("nb-NO")}
      </span>
    </p>
  );
}
