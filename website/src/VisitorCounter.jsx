import React, { useEffect, useState } from "react";

const apiUrl = "https://7yvi0odivb.execute-api.eu-north-1.amazonaws.com/prod/visitor";

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState("...");

  useEffect(() => {
    async function fetchVisitorCount() {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setVisitorCount(data.count);
      } catch (error) {
        console.error("Error fetching visitor count:", error);
        setVisitorCount("Error");
      }
    }

    fetchVisitorCount();
  }, []);

  return (
    <p id="visitorCounter">
      Visitors: <span id="visitors-total">{visitorCount}</span>
    </p>
  );
}
