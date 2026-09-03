require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

const frontendI18nPath = path.join(__dirname, '../Frontend/src/assets/i18n');
const enJsonPath = path.join(frontendI18nPath, 'en.json');

const enData = fs.readFileSync(enJsonPath, 'utf8');

const languages = {
  'mr': 'Marathi'
};

async function translateAll() {
  for (const [code, name] of Object.entries(languages)) {
    console.log(`Translating to ${name} (${code})...`);
    
    const prompt = `Translate the following JSON object into ${name}. 
Keep the exact same JSON keys and structure. Only translate the values (strings and array of strings).
Return ONLY valid JSON without any markdown formatting like \`\`\`json.
Data:
${enData}`;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      if (text.startsWith('\`\`\`json')) text = text.replace(/\`\`\`json\n?/, '').replace(/\`\`\`\n?$/, '');
      else if (text.startsWith('\`\`\`')) text = text.replace(/\`\`\`\n?/, '').replace(/\`\`\`\n?$/, '');
      text = text.trim();
      
      // Verify it's valid JSON
      JSON.parse(text);
      
      const outPath = path.join(frontendI18nPath, `${code}.json`);
      fs.writeFileSync(outPath, text);
      console.log(`Successfully saved ${code}.json`);
    } catch (err) {
      console.error(`Error translating ${name}:`, err.message || err);
    }
  }
}

translateAll();
