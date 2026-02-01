const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imageData = await fs.readFile(req.file.path);

    const prompt = `
Analyze this OTC candlestick chart screenshot. 
Answer in one word: UP or DOWN for the next candle probability. 
Do not give 100% guarantee, just probable outcome.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a professional OTC candlestick analyst." },
        { role: "user", content: prompt }
      ],
      input_images: [
        {
          name: req.file.originalname,
          data: imageData.toString('base64'),
          mime: req.file.mimetype
        }
      ]
    });

    const prediction = response.choices[0].message.content.trim();
    await fs.unlink(req.file.path);

    res.json({ prediction });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
