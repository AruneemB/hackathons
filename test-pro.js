const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There isn't a direct listModels on the genAI object in the same way, 
    // but we can try to find what's available or use a known one.
    // Actually, usually gemini-pro or gemini-1.5-flash should work.
    // Let's try gemini-pro.
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello');
    console.log('Gemini Pro works!');
  } catch (error) {
    console.error('Gemini Pro failed:', error.message);
  }
}

listModels();
