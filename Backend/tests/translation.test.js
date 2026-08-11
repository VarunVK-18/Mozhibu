require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

describe('Gemini 3.5 Live Translate API', () => {
  it('should successfully translate an English sentence to Tamil using gemini-3.5-flash', async () => {
    expect(process.env.GEMINI_API_KEYS).toBeDefined();
    
    const keys = process.env.GEMINI_API_KEYS.split(',');
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const genAI = new GoogleGenerativeAI(randomKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    
    const prompt = "Translate the following sentence to Tamil. Return ONLY the translated sentence, without any formatting or extra words: 'The future of AI is very bright.'";
    
    try {
      const result = await model.generateContent(prompt);
      const translatedText = result.response.text().trim();
      
      console.log('Original Text: The future of AI is very bright.');
      console.log('Gemini 3.5 Live Translate Output:', translatedText);
      
      expect(translatedText.length).toBeGreaterThan(0);
      expect(translatedText).not.toBe('The future of AI is very bright.');
    } catch (err) {
      console.error('Translation failed:', err);
      throw err;
    }
  }, 20000); // 20 second timeout for the API call
});
