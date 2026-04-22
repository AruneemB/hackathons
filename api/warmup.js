const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

module.exports = async function handler(req, res) {
  try {
    genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    res.status(200).json({ ok: true });
  } catch (_) {
    res.status(200).json({ ok: false });
  }
};
