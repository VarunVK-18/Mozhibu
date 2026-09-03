const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEYS = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(",") : [];
if (API_KEYS.length === 0) {
  console.error("No Gemini API keys found in .env");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEYS[0]);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

const i18nPath = path.join(__dirname, "../../Frontend/src/assets/i18n");
const languages = {
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  bn: "Bengali",
  hi: "Hindi",
  pa: "Punjabi",
  mr: "Marathi",
  ur: "Urdu",
  gu: "Gujarati",
  or: "Odia"
};

async function translateKeys(keysObj, targetLangName) {
  if (Object.keys(keysObj).length === 0) return {};
  
  const prompt = `Translate the string values of the following JSON object into ${targetLangName}.
Keep the exact same JSON structure and keys. Do not translate the keys, only the values.
Return ONLY valid JSON with no markdown wrapping. Do not add \`\`\`json.
Data:
${JSON.stringify(keysObj, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("\`\`\`json")) text = text.replace(/\`\`\`json\n?/, "").replace(/\`\`\`\n?$/, "");
    else if (text.startsWith("\`\`\`")) text = text.replace(/\`\`\`\n?/, "").replace(/\`\`\`\n?$/, "");
    
    return JSON.parse(text);
  } catch (err) {
    console.error(`Error translating to ${targetLangName}:`, err);
    return {};
  }
}

function findMissing(enObj, targetObj) {
  let missing = {};
  for (let key in enObj) {
    if (typeof enObj[key] === "object" && enObj[key] !== null && !Array.isArray(enObj[key])) {
      if (!targetObj[key]) targetObj[key] = {};
      const nestedMissing = findMissing(enObj[key], targetObj[key]);
      if (Object.keys(nestedMissing).length > 0) {
        missing[key] = nestedMissing;
      }
    } else {
      if (!targetObj.hasOwnProperty(key)) {
        missing[key] = enObj[key];
      }
    }
  }
  return missing;
}

function deepAssign(target, source) {
  for (let key in source) {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!target[key]) target[key] = {};
      deepAssign(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

async function run() {
  const enData = JSON.parse(fs.readFileSync(path.join(i18nPath, "en.json"), "utf8"));
  
  for (const [code, name] of Object.entries(languages)) {
    console.log(`Processing ${name} (${code})...`);
    const filePath = path.join(i18nPath, `${code}.json`);
    
    let targetData = {};
    if (fs.existsSync(filePath)) {
      targetData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    
    const missing = findMissing(enData, targetData);
    if (Object.keys(missing).length > 0) {
      console.log(`Found missing translations for ${name}, translating...`);
      const translated = await translateKeys(missing, name);
      
      deepAssign(targetData, translated);
      fs.writeFileSync(filePath, JSON.stringify(targetData, null, 2));
      console.log(`Updated ${code}.json`);
    } else {
      console.log(`No missing translations for ${name}.`);
    }
  }
  
  console.log("All languages translated successfully!");
}

run();
