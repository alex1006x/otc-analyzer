document.getElementById("analyzeBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    const result = document.getElementById("result");

    if (!fileInput.files.length) {
        alert("Please select a screenshot!");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    result.textContent = "Analyzing...";

    try {
        const response = await fetch("/analyze", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.prediction) {
            result.textContent = "Next Candle Probability: " + data.prediction;
        } else {
            result.textContent = "Error: " + (data.error || "Unknown error");
        }
    } catch (err) {
        result.textContent = "Error: " + err.message;
    }
});
