import { useEffect, useState } from "react";

// A static file published by the hydrator Lambda and served from CloudFront.
// Reading it costs no Lambda invocation and no third-party API quota.
const RESULTS_URL = "/data/results.json";

function relativeAge(iso) {
  if (!iso) return null;
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 0)} min siden`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} t siden`;
  return `${Math.round(hours / 24)} d siden`;
}

export default function ResultsPanel() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(RESULTS_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(setData)
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      });

    return () => controller.abort();
  }, []);

  // Nothing to show is better than an error message on a CV.
  if (failed) return null;

  const f1 = data?.f1;
  const football = data?.football;
  if (data && !f1 && !football) return null;

  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <h3 className="font-display text-lg font-semibold text-ink">Siste resultater</h3>
      <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.13em] text-muted">Hentet av en Lambda på timer</p>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-ember mb-1">Liverpool FC</h4>
        {!data ? (
          <p className="text-sm text-muted">Laster…</p>
        ) : football ? (
          <>
            <p className="text-sm text-ink">
              {football.home} {football.homeScore}–{football.awayScore}{" "}
              {football.away}
            </p>
            {data.fetchedAt?.football && (
              <p className="text-xs text-muted mt-0.5">
                Oppdatert {relativeAge(data.fetchedAt.football)}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">Ingen kamper ennå.</p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-accent mb-1">Formel 1</h4>
        {!data ? (
          <p className="text-sm text-muted">Laster…</p>
        ) : f1 ? (
          <>
            <p className="text-sm text-ink">{f1.raceName}</p>
            <p className="text-sm text-ink-soft">
              Vinner: <strong>{f1.winner}</strong> ({f1.team})
            </p>
            {data.fetchedAt?.f1 && (
              <p className="text-xs text-muted mt-0.5">
                Oppdatert {relativeAge(data.fetchedAt.f1)}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">Ingen løp ennå.</p>
        )}
      </div>
    </div>
  );
}
