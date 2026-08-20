import React, { useEffect, useState } from "react";
import { apiUrl } from "../api";

export default function VisitorCounter() {
  const [count, setCount] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // React 18+ StrictMode runs effects twice in development, which would
    // double-count locally. The abort keeps the discarded run from landing.
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

  // A broken counter should not announce itself on a CV. Render nothing until
  // there is a real number, and nothing at all if the request failed.
  if (failed) return null;

  return (
    <p className="text-sm text-slate-300 tabular-nums">
      Besøkende:{" "}
      <span className="font-semibold text-white">
        {count === null ? "…" : count.toLocaleString("nb-NO")}
      </span>
    </p>
  );
}
