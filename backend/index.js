const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// OpenAI client (NEW)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageBuffer = await fs.readFile(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    const prompt = `
Analyze this OTC candlestick chart screenshot.
Answer in ONE word only: UP or DOWN for the next candle probability.
No guarantees.
`;

    // NEW Responses API (supports images)
const response = await openai.responses.create({
  model: "gpt-4.1-mini",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: prompt },
        {
          type: "input_image",
          image_url: `data:${req.file.mimetype};base64,${base64Image}`
        }
      ]
    }
  ]
});


    const prediction =
      response.output_text?.trim() ||
      response.output[0].content[0].text.trim();

    await fs.unlink(req.file.path);

    res.json({ prediction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
