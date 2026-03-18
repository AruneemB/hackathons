const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found in .env');
    return;
  }
  console.log('Using API Key:', apiKey.substring(0, 5) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hello, are you working?');
    const response = await result.response;
    console.log('AI Response:', response.text());
  } catch (error) {
    console.error('Test Failed:', error);
  }
}

test();
