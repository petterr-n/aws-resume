const apiUrl = "https://7yvi0odivb.execute-api.eu-north-1.amazonaws.com/prod/visitor";

async function updateVisitorCount() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        document.getElementById("visitors-total").textContent = data.count;
    } catch (error) {
        console.error("Error fetching visitor count:", error);
        document.getElementById("visitors-total").textContent = "Error";
    }
}
updateVisitorCount();