// Simple AI service wrapper
// Provides `initAI()` and `analyzeMeal(imageBase64)`.

const { parseAIResponse } = require('../utils/helpers');
let client = null;

async function initAI() {
  try {
    const genaiPkg = require('@google/generative-ai');
    const GoogleGenAI = genaiPkg.GoogleGenAI || genaiPkg.default || genaiPkg;
    if (typeof GoogleGenAI === 'function') {
      client = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY || '' });
      return client;
    }
  } catch (e) {
    // fallback to mock
  }
  // mock client
  client = { getGenerativeModel: () => ({ generateContent: async () => ({ response: { text: () => '{}' } }) }) };
  return client;
}

async function analyzeMeal(imageBase64) {
  if (!client) await initAI();
  if (!imageBase64) return { Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0 };

  const model = client.getGenerativeModel ? client.getGenerativeModel({ model: 'gemini-2.5-flash' }) : client;
  const prompt = `Analyze this meal image for a health application. Provide your output ONLY as a strict JSON object with these exact keys, no conversational text, no markdown block: {"Protein_Grams": float, "Carbs_Grams": float, "Fats_Grams": float, "Total_Calories": integer}`;
  const imagePart = { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } };

  const aiResult = await model.generateContent([prompt, imagePart]);
  const text = (aiResult && aiResult.response && typeof aiResult.response.text === 'function') ? aiResult.response.text() : '{}';
  return parseAIResponse(text);
}

module.exports = { initAI, analyzeMeal };
