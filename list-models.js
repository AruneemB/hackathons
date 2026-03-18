const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // In newer versions, we might need a different approach or just try a standard name.
    // Let's try to fetch a specific model and see if it fails with something other than 404.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
    const result = await model.generateContent('Hi');
    console.log('Success with 1.5-flash-8b');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();
