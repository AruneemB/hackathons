const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('.'));

// Explicitly serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/ask', async (req, res) => {
  const { question, project } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ answer: 'Error: GEMINI_API_KEY is not set in .env file.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construct the context-aware prompt
    const prompt = `
      You are Aruneem's personal project assistant. You are helping a visitor on Aruneem's portfolio website.
      Your goal is to answer questions about the following project:
      
      Project Title: ${project.title}
      Date: ${project.date}
      Hackathon: ${project.hackathon || 'N/A'}
      Description: ${project.description}
      Tech Stack: ${project.techStack.join(', ')}
      Award: ${project.award || 'None'}
      Team Size: ${project.teamSize}
      
      Rules:
      1. Be professional, friendly, and enthusiastic about Aruneem's work.
      2. If the user asks something unrelated to this project or Aruneem, politely steer them back.
      3. If you don't know the answer based on the provided info, say "I don't have that specific detail, but you can check out the repo or Aruneem's GitHub for more!"
      4. Use concise, clear language.
      
      User Question: ${question}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ answer: text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ answer: 'Sorry, I hit a snag while thinking. Is your API key valid?' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`\x1b[32m[Server]\x1b[0m Chat bridge running at http://localhost:${port}`);
    console.log(`\x1b[33m[Status]\x1b[0m Ready to answer project questions!\n`);
  });
}

module.exports = app;
