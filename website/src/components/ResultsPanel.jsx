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
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl">
      <h3 className="text-lg font-bold mb-3 text-center">Siste resultater</h3>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-red-400 mb-1">Liverpool FC</h4>
        {!data ? (
          <p className="text-gray-400 text-sm">Laster…</p>
        ) : football ? (
          <>
            <p className="text-sm">
              {football.home} {football.homeScore}–{football.awayScore}{" "}
              {football.away}
            </p>
            {data.fetchedAt?.football && (
              <p className="text-xs text-gray-500 mt-0.5">
                Oppdatert {relativeAge(data.fetchedAt.football)}
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-sm">Ingen kamper ennå.</p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-orange-400 mb-1">Formel 1</h4>
        {!data ? (
          <p className="text-gray-400 text-sm">Laster…</p>
        ) : f1 ? (
          <>
            <p className="text-sm">{f1.raceName}</p>
            <p className="text-gray-300 text-sm">
              Vinner: <strong>{f1.winner}</strong> ({f1.team})
            </p>
            {data.fetchedAt?.f1 && (
              <p className="text-xs text-gray-500 mt-0.5">
                Oppdatert {relativeAge(data.fetchedAt.f1)}
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-sm">Ingen løp ennå.</p>
        )}
      </div>
    </div>
  );
}
