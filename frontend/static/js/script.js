document.getElementById('simulationForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the form from resetting

    // Get user inputs
    const frames = document.getElementById('frames').value;
    const requests = document.getElementById('requests').value;
    const algorithm = document.getElementById('algorithm').value;

    // Send data to the Flask backend
    const response = await fetch('/run', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frames, requests, algorithm }),
    });

    // Handle the response
    const result = await response.json();

    if (response.ok) {
        // Display the result
        document.getElementById('result').innerText = result.result;
    } else {
        // Display the error
        document.getElementById('result').innerText = "Error: " + result.error;
    }
});