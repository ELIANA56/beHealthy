// Utility helpers

function parseAIResponse(text) {
  try {
    const obj = JSON.parse(text.trim());
    return obj;
  } catch (e) {
    return { Protein_Grams: 0, Carbs_Grams: 0, Fats_Grams: 0, Total_Calories: 0 };
  }
}

module.exports = { parseAIResponse };
