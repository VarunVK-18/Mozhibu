const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use standard env variable for Gemini API key, fallback to a dummy for testing if needed
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const LANGUAGES = [
  "ta", // Tamil
  "hi", // Hindi
  "te", // Telugu
  "ml", // Malayalam
  "kn", // Kannada
  "bn", // Bengali
  "pa", // Punjabi
  "mr", // Marathi
  "ur", // Urdu
  "gu", // Gujarati
  "or", // Odia
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateContentWithRetry(model, prompt, retries = 4, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      if (err.status === 429 || err.status === 503) {
        if (i === retries - 1) throw err;
        const backoff = delay * Math.pow(2, i);
        console.warn(`[Translator] API overloaded (${err.status}). Retrying in ${backoff/1000}s...`);
        await sleep(backoff);
      } else {
        throw err;
      }
    }
  }
}

/**
 * Translates a title and message into 11 regional languages.
 * @param {string} title 
 * @param {string} message 
 * @returns {Promise<Object>} An object with language codes as keys, and {title, message} as values.
 */
async function translateContent(title, message) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Skipping translations.");
    return {};
  }

  const prompt = `You are a professional translator. I have a title and a message in English. 
Please translate both of them into the following 11 languages.
The languages are represented by their codes: ta (Tamil), hi (Hindi), te (Telugu), ml (Malayalam), kn (Kannada), bn (Bengali), pa (Punjabi), mr (Marathi), ur (Urdu), gu (Gujarati), or (Odia).

English Title: "${title}"
English Message: "${message}"

Return ONLY a valid JSON object where keys are the language codes, and values are objects with "title" and "message" fields containing the translated text. Do not include markdown formatting or backticks around the JSON.
Format example:
{
  "ta": { "title": "...", "message": "..." },
  "hi": { "title": "...", "message": "..." }
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const result = await generateContentWithRetry(model, prompt);
    let text = result.response.text().trim();
    
    // Remove markdown code block if present
    if (text.startsWith("\`\`\`json")) {
      text = text.substring(7);
    }
    if (text.startsWith("\`\`\`")) {
      text = text.substring(3);
    }
    if (text.endsWith("\`\`\`")) {
      text = text.substring(0, text.length - 3);
    }
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Translation generation failed:", error);
    return {};
  }
}

module.exports = { translateContent, LANGUAGES };
