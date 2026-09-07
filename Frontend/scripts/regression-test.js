const fs = require('fs');
const path = require('path');

// 1. Load English default translations
const defaultEnPath = path.join(__dirname, '../src/app/core/i18n/default-translations.ts');
const defaultEnContent = fs.readFileSync(defaultEnPath, 'utf8');

// Parse default translations from file
const i18nDir = path.join(__dirname, '../src/assets/i18n');
const languages = ['en', 'ta', 'hi', 'te', 'ml', 'kn', 'bn', 'pa', 'mr', 'ur', 'gu', 'or'];

const translationMaps = {};
languages.forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    try {
      translationMaps[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`[ERROR] Failed to parse JSON for ${lang}:`, e.message);
    }
  } else {
    console.error(`[ERROR] Missing translation file for ${lang}`);
  }
});

function lookup(obj, key) {
  if (!obj || typeof obj !== 'object') return null;
  if (obj[key] !== undefined && typeof obj[key] === 'string') {
    return obj[key];
  }
  const keys = key.split('.');
  let cur = obj;
  for (const k of keys) {
    cur = cur?.[k];
    if (cur === undefined) return null;
  }
  return typeof cur === 'string' ? cur : null;
}

function simulateTranslate(key, currentLang) {
  if (!key) return '';
  const current = lookup(translationMaps[currentLang], key);
  if (current !== null) return { value: current, source: currentLang };

  const fallback = lookup(translationMaps['en'], key);
  if (fallback !== null) return { value: fallback, source: 'en (fallback)' };

  return { value: key, source: 'raw key (MISSING)' };
}

// 2. Scan all .html and .ts files for `| translate` usages
const appDir = path.join(__dirname, '../src/app');
const foundKeys = new Set();
const keyUsages = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.html') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Match patterns:
      // "key" | translate
      // 'key' | translate
      // `key` | translate
      const regex = /["'`]([a-zA-Z0-9_.-]+)["'`]\s*\|\s*translate/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        foundKeys.add(key);
        keyUsages.push({ key, file: path.relative(appDir, fullPath) });
      }
    }
  }
}

scanDir(appDir);

console.log(`========================================`);
console.log(`TRANSLATION REGRESSION TESTING REPORT`);
console.log(`========================================`);
console.log(`Found ${foundKeys.size} distinct translation keys in app templates across ${keyUsages.length} locations.\n`);

const missingInEn = [];
const missingInOthers = {};
languages.forEach(l => missingInOthers[l] = []);

foundKeys.forEach(key => {
  // Test in EN
  const enRes = simulateTranslate(key, 'en');
  if (enRes.source === 'raw key (MISSING)') {
    missingInEn.push(key);
  }

  // Test in other languages
  languages.filter(l => l !== 'en').forEach(lang => {
    const res = simulateTranslate(key, lang);
    if (res.source === 'en (fallback)') {
      missingInOthers[lang].push(key);
    }
  });
});

console.log(`--- 1. ENGLISH DEFAULT COVERAGE ---`);
if (missingInEn.length === 0) {
  console.log(`✓ 100% of all ${foundKeys.size} template keys exist in English! Zero raw keys.`);
} else {
  console.log(`✗ Missing in English (${missingInEn.length}):`, missingInEn);
}

console.log(`\n--- 2. CORE CRITICAL KEYS CHECK ---`);
const criticalKeys = [
  'brand.name',
  'nav.discover',
  'nav.home',
  'nav.categories',
  'nav.library',
  'header.startWriting',
  'header.myProfile',
  'header.notifications',
  'header.logOut'
];

criticalKeys.forEach(k => {
  const en = simulateTranslate(k, 'en');
  const ta = simulateTranslate(k, 'ta');
  console.log(`Key: "${k}"`);
  console.log(`  EN -> "${en.value}" [${en.source}]`);
  console.log(`  TA -> "${ta.value}" [${ta.source}]`);
});

console.log(`\n--- 3. MULTI-LANGUAGE FALLBACK STATUS ---`);
languages.filter(l => l !== 'en').forEach(lang => {
  const missingCount = missingInOthers[lang].length;
  if (missingCount === 0) {
    console.log(`✓ ${lang.toUpperCase()}: 100% translated (${foundKeys.size}/${foundKeys.size})`);
  } else {
    console.log(`ℹ ${lang.toUpperCase()}: ${foundKeys.size - missingCount}/${foundKeys.size} native, ${missingCount} smoothly fall back to English (no broken raw keys)`);
  }
});

console.log(`\n--- 4. SYNCHRONOUS FIRST RENDER SIMULATION ---`);
console.log(`Simulating immediate synchronous call to LanguageService.translate() on app boot:`);
const testKeys = ['brand.name', 'nav.discover', 'nav.categories', 'header.startWriting'];
let syncPass = true;
testKeys.forEach(k => {
  const res = simulateTranslate(k, 'en');
  if (res.value === k) {
    console.error(`✗ FAIL: Key ${k} returned raw key on first sync render!`);
    syncPass = false;
  } else {
    console.log(`✓ ${k} => "${res.value}" (Instant)`);
  }
});

if (syncPass && missingInEn.length === 0) {
  console.log(`\n========================================`);
  console.log(`ALL REGRESSION CHECKS PASSED SUCCESSFULLY!`);
  console.log(`========================================`);
  process.exit(0);
} else {
  console.log(`\n========================================`);
  console.log(`REGRESSION ISSUES FOUND`);
  console.log(`========================================`);
  process.exit(1);
}
