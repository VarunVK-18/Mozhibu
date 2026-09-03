const { GoogleGenerativeAI } = require("@google/generative-ai");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");

const langMap = {
  en: "English",
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
  or: "Odia",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateContentWithRetry(model, prompt, retries = 4, delay = 12000) {
  for (let i = 0; i < retries; i++) {
    try {
      // Add a mandatory base delay between requests in batches to prevent 429
      if (i === 0) await sleep(2000); 
      
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      if (err.status === 429 || err.status === 503) {
        if (i === retries - 1) throw err;
        const backoff = delay * Math.pow(2, i);
        console.warn(`[Translation] API overloaded (${err.status}). Retrying in ${backoff/1000}s...`);
        await sleep(backoff);
      } else {
        throw err;
      }
    }
  }
}
async function translateBooks(books, targetLang) {
  if (!targetLang || targetLang === "en" || !books || books.length === 0)
    return books;

  const keys = process.env.GEMINI_API_KEYS
    ? process.env.GEMINI_API_KEYS.split(",")
    : [];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const genAI = new GoogleGenerativeAI(randomKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const targetLangName = langMap[targetLang] || targetLang;

  // Filter books that need translation
  const toTranslate = books.filter(
    (b) => !b.titleTranslations || !b.titleTranslations.has(targetLang),
  );

  if (toTranslate.length > 0) {
    const titlesObj = {};
    toTranslate.forEach((b) => {
      titlesObj[b._id.toString()] = b.title;
    });

    const prompt = `Translate the following book titles into ${targetLangName}. 
Return ONLY a valid JSON object where keys are the exact same IDs and values are the translated titles.
Do not add any text before or after the JSON. Do not add markdown blocks like \`\`\`json.
Data:
${JSON.stringify(titlesObj)}`;

    try {
      const result = await generateContentWithRetry(model, prompt);
      let text = result.response.text();
      if (text.startsWith("\`\`\`json"))
        text = text.replace(/\`\`\`json\n?/, "").replace(/\`\`\`\n?$/, "");
      else if (text.startsWith("\`\`\`"))
        text = text.replace(/\`\`\`\n?/, "").replace(/\`\`\`\n?$/, "");
      text = text.trim();

      const translatedObj = JSON.parse(text);

      // Save translations back to DB
      for (let b of toTranslate) {
        const transTitle = translatedObj[b._id.toString()];
        if (transTitle) {
          if (!b.titleTranslations) {
            b.titleTranslations = new Map();
          }
          if (typeof b.titleTranslations.set === 'function') {
            b.titleTranslations.set(targetLang, transTitle);
          } else {
            b.titleTranslations[targetLang] = transTitle;
          }

          if (typeof b.save === 'function') {
            await b.save();
          } else {
            await Book.updateOne(
              { _id: b._id },
              { $set: { [`titleTranslations.${targetLang}`]: transTitle } }
            );
          }
        }
      }
    } catch (err) {
      console.error("Batch Translation error:", err);
    }
  }

  // Replace titles with translated ones for the response
  return books.map((b) => {
    let bObj = typeof b.toObject === "function" ? b.toObject() : b;
    if (b.titleTranslations && b.titleTranslations.has(targetLang)) {
      bObj.title = b.titleTranslations.get(targetLang);
    }
    return bObj;
  });
}

async function translateChapters(chapters, targetLang) {
  if (!targetLang || targetLang === "en" || !chapters || chapters.length === 0)
    return chapters;

  const keys = process.env.GEMINI_API_KEYS
    ? process.env.GEMINI_API_KEYS.split(",")
    : [];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const genAI = new GoogleGenerativeAI(randomKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  const targetLangName = langMap[targetLang] || targetLang;

  // Filter chapters that need title translation
  const titlesToTranslate = chapters.filter(
    (c) => !c.titleTranslations || !c.titleTranslations.has(targetLang),
  );

  if (titlesToTranslate.length > 0) {
    const titlesObj = {};
    titlesToTranslate.forEach((c) => {
      titlesObj[c._id.toString()] = c.title;
    });

    const prompt = `Translate the following chapter titles into ${targetLangName}. 
Return ONLY a valid JSON object where keys are the exact same IDs and values are the translated titles.
Do not add any text before or after the JSON. Do not add markdown blocks like \`\`\`json.
Data:
${JSON.stringify(titlesObj)}`;

    try {
      const result = await generateContentWithRetry(model, prompt);
      let text = result.response.text();
      if (text.startsWith("\`\`\`json"))
        text = text.replace(/\`\`\`json\n?/, "").replace(/\`\`\`\n?$/, "");
      else if (text.startsWith("\`\`\`"))
        text = text.replace(/\`\`\`\n?/, "").replace(/\`\`\`\n?$/, "");
      text = text.trim();

      const translatedObj = JSON.parse(text);

      for (let c of titlesToTranslate) {
        const transTitle = translatedObj[c._id.toString()];
        if (transTitle) {
          if (!c.titleTranslations) {
            c.titleTranslations = new Map();
          }
          if (typeof c.titleTranslations.set === 'function') {
            c.titleTranslations.set(targetLang, transTitle);
          } else {
            c.titleTranslations[targetLang] = transTitle;
          }

          if (typeof c.save === 'function') {
            await c.save();
          } else {
            await Chapter.updateOne(
              { _id: c._id },
              { $set: { [`titleTranslations.${targetLang}`]: transTitle } }
            );
          }
        }
      }
    } catch (err) {
      console.error("Batch Chapter Title Translation error:", err);
    }
  }

  // Now translate chapter content for those missing it
  const contentToTranslate = chapters.filter(
    (c) => !c.translations || !c.translations.has(targetLang),
  );

  for (let c of contentToTranslate) {
    const prompt = `Translate the following HTML story content into ${targetLangName}. 
Only return the translated HTML. Preserve all HTML tags and structure exactly as they are. 
Do not add markdown blocks like \`\`\`html. 
Content to translate:

${c.content}`;

    try {
      const result = await generateContentWithRetry(model, prompt);
      let translatedContent = result.response.text();
      if (translatedContent.startsWith("\`\`\`html")) {
        translatedContent = translatedContent
          .replace(/\`\`\`html\n?/, "")
          .replace(/\`\`\`\n?$/, "");
      } else if (translatedContent.startsWith("\`\`\`")) {
        translatedContent = translatedContent
          .replace(/\`\`\`\n?/, "")
          .replace(/\`\`\`\n?$/, "");
      }
      translatedContent = translatedContent.trim();

      if (!c.translations) {
        c.translations = new Map();
      }
      if (typeof c.translations.set === 'function') {
        c.translations.set(targetLang, translatedContent);
      } else {
        c.translations[targetLang] = translatedContent;
      }

      if (typeof c.save === 'function') {
        await c.save();
      } else {
        await Chapter.updateOne(
          { _id: c._id },
          { $set: { [`translations.${targetLang}`]: translatedContent } }
        );
      }
    } catch (err) {
      console.error("Chapter Content Translation error:", err);
    }
  }

  // Replace title and content with translated ones for the response
  return chapters.map((c) => {
    let cObj = typeof c.toObject === "function" ? c.toObject() : c;
    if (c.titleTranslations && c.titleTranslations.has(targetLang)) {
      cObj.title = c.titleTranslations.get(targetLang);
    }
    if (c.translations && c.translations.has(targetLang)) {
      cObj.content = c.translations.get(targetLang);
    }
    return cObj;
  });
}

module.exports = {
  translateBooks,
  translateChapters,
};
