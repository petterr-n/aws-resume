import { useEffect, useState } from "react";

export default function ResultsPanel() {
  const [liverpool, setLiverpool] = useState(null);
  const [f1, setF1] = useState(null);

  // Fetch Liverpool result
  useEffect(() => {
    fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.bbc.co.uk/sport/football/teams/liverpool/rss.xml"
    )
      .then((res) => res.json())
      .then((data) => {
        const latest = data.items?.[0];
        if (latest) {
          // Example title: "Liverpool 2-1 Chelsea"
          const matchRegex = /(\w[\w\s]*) (\d+)-(\d+) (\w[\w\s]*)/;
          const match = latest.title.match(matchRegex);
          if (match) {
            const [, home, homeScore, awayScore, away] = match;
            setLiverpool({ home, away, homeScore, awayScore });
          } else {
            setLiverpool({ title: "Kunne ikke hente data" });
          }
        } else {
          setLiverpool("error");
        }
      })
      .catch(() => setLiverpool("error"));
  }, []);

  // Fetch F1 result
  useEffect(() => {
  fetch("https://ergast.com/api/f1/current/last/results.json")
    .then((res) => res.json())
    .then((data) => {
      console.log("F1 data:", data); 
      const race = data.MRData.RaceTable.Races?.[0];
      if (race) {
        const winner = race.Results?.[0];
        setF1({
          raceName: race.raceName,
          circuit: race.Circuit.circuitName,
          winner: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
          team: winner.Constructor.name,
        });
      } else {
        setF1("error");
      }
    })
    .catch((err) => {
      console.error(err);
      setF1("error");
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
          typeof liverpool === "string" ? (
            <p>Kunne ikke hente data</p>
          ) : liverpool.home ? (
            <p>
              {liverpool.home} {liverpool.homeScore}–{liverpool.awayScore} {liverpool.away}
            </p>
          ) : (
            <p>{liverpool.title}</p>
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
          typeof f1 === "string" ? (
            <p>Kunne ikke hente data</p>
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
