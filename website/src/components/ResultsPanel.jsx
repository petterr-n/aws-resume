import { useEffect, useState } from "react";

export default function ResultsPanel() {
  const [liverpool, setLiverpool] = useState(null);
  const [f1, setF1] = useState(null);

  // Fetch Liverpool result
  useEffect(() => {
    fetch("https://7yvi0odivb.execute-api.eu-north-1.amazonaws.com/prod/football")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setLiverpool({ error: data.error });
          return;
        }

        // Find latest Liverpool match
        const latestMatch = data.matches?.find(
          (m) =>
            m.homeTeam?.name.toLowerCase().includes("liverpool") ||
            m.awayTeam?.name.toLowerCase().includes("liverpool")
        );

        if (latestMatch) {
          setLiverpool({
            home: latestMatch.homeTeam.name,
            away: latestMatch.awayTeam.name,
            homeScore: latestMatch.score?.fullTime?.home ?? "-",
            awayScore: latestMatch.score?.fullTime?.away ?? "-",
            date: latestMatch.utcDate,
          });
        } else {
          setLiverpool({ error: "Ingen Liverpool-kamper funnet" });
        }
      })
      .catch(() => setLiverpool({ error: "Kunne ikke hente Liverpool-kamper" }));
  }, []);

  // Fetch F1 result from Lambda
  useEffect(() => {
    fetch("https://7yvi0odivb.execute-api.eu-north-1.amazonaws.com/prod/f1")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setF1({ error: data.error });
        } else {
          const race = data.MRData?.RaceTable?.Races?.[0];
          if (race) {
            const winner = race.Results?.[0];
            setF1({
              raceName: race.raceName,
              circuit: race.Circuit.circuitName,
              winner: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
              team: winner.Constructor.name,
            });
          } else {
            setF1({ error: "Ingen F1-resultater funnet" });
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setF1({ error: "Kunne ikke hente F1-data" });
      });
  }, []);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl hover:scale-105 transform transition duration-300">
      <h3 className="text-lg font-bold mb-3 text-center">
        Siste Resultater
      </h3>

      {/* Liverpool */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-red-400 mb-1">⚽ Liverpool FC</h4>
        {liverpool ? (
          liverpool.error ? (
            <p>{liverpool.error}</p>
          ) : (
            <p>
              {liverpool.home} {liverpool.homeScore}–{liverpool.awayScore} {liverpool.away}
            </p>
          )
        ) : (
          <p>Laster...</p>
        )}
      </div>

      {/* Formula 1 */}
      <div>
        <h4 className="text-sm font-semibold text-orange-400 mb-1">
          🏎️ Formula 1
        </h4>
        {f1 ? (
          f1.error ? (
            <p>{f1.error}</p>
          ) : (
            <p>
              {f1.raceName}
              <br />
              <span className="text-gray-300 text-sm">
                Vinner: <strong>{f1.winner}</strong> ({f1.team})
              </span>
            </p>
          )
        ) : (
          <p>Laster...</p>
        )}
      </div>
    </div>
  );
}
