const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ answer: 'Method not allowed.' });
  }

  const { question, project } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ answer: 'Error: GEMINI_API_KEY is not configured.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
};
