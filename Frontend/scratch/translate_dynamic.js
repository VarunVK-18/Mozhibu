const fs = require('fs');
const path = require('path');
const dir = 'c:/projects/Mozhibu - Story/Frontend/src/assets/i18n';
const key1 = 'Competition Winners Announced!';
const key2 = 'The competition "The Twelve Tongues Prize 882" has concluded. Congratulations to Adhi for "winnerwillbeme", varun for "contest"!';
const translations = {
  'en': {
    [key1]: 'Competition Winners Announced!',
    [key2]: 'The competition "The Twelve Tongues Prize 882" has concluded. Congratulations to Adhi for "winnerwillbeme", varun for "contest"!'
  },
  'ta': {
    [key1]: 'போட்டி வெற்றியாளர்கள் அறிவிப்பு!',
    [key2]: '\'தி டுவெல்வ் டங்க்ஸ் பிரைஸ் 882\' போட்டி முடிவடைந்தது. \'winnerwillbeme\' என்ற புத்தகத்திற்காக அதியையும், \'contest\' என்ற புத்தகத்திற்காக வருணையும் வாழ்த்துகிறோம்!'
  },
  'hi': {
    [key1]: 'प्रतियोगिता के विजेताओं की घोषणा!',
    [key2]: 'प्रतियोगिता \'द ट्वेल्व टंग्स प्राइज 882\' समाप्त हो गई है। \'winnerwillbeme\' के लिए आधी और \'contest\' के लिए वरुण को बधाई!'
  },
  'te': {
    [key1]: 'పోటీ విజేతల ప్రకటన!',
    [key2]: 'పోటీ \'ది ట్వెల్వ్ టంగ్స్ ప్రైజ్ 882\' ముగిసింది. \'winnerwillbeme\' కోసం ఆదికి, \'contest\' కోసం వరుణ్‌కి అభినందనలు!'
  },
  'ml': {
    [key1]: 'മത്സര വിജയികളെ പ്രഖ്യാപിച്ചു!',
    [key2]: '\'ദി ട്വൽവ് ടങ്സ് പ്രൈസ് 882\' മത്സരം സമാപിച്ചു. \'winnerwillbeme\' ന് ആധിക്കും \'contest\' ന് വരുണിനും അഭിനന്ദനങ്ങൾ!'
  },
  'kn': {
    [key1]: 'ಸ್ಪರ್ಧೆಯ ವಿಜೇತರ ಪ್ರಕಟಣೆ!',
    [key2]: 'ಸ್ಪರ್ಧೆ \'ದಿ ಟ್ವೆಲ್ವ್ ಟಂಗ್ಸ್ ಪ್ರೈಜ್ 882\' ಮುಕ್ತಾಯಗೊಂಡಿದೆ. \'winnerwillbeme\' ಗಾಗಿ ಆದಿಗೆ, \'contest\' ಗಾಗಿ ವರುಣ್ ಗೆ ಅಭಿನಂದನೆಗಳು!'
  },
  'bn': {
    [key1]: 'প্রতিযোগিতার বিজয়ীদের ঘোষণা!',
    [key2]: '\'দ্য টুয়েলভ টাং প্রাইস ৮৮২\' প্রতিযোগিতা শেষ হয়েছে। \'winnerwillbeme\' এর জন্য আধি এবং \'contest\' এর জন্য বরুণকে অভিনন্দন!'
  },
  'pa': {
    [key1]: 'ਮੁਕਾਬਲੇ ਦੇ ਜੇਤੂਆਂ ਦਾ ਐਲਾਨ!',
    [key2]: 'ਮੁਕਾਬਲਾ \'ਦ ਟਵੈਲਵ ਟੰਗਸ ਪ੍ਰਾਈਜ਼ 882\' ਸਮਾਪਤ ਹੋ ਗਿਆ ਹੈ। \'winnerwillbeme\' ਲਈ ਆਧੀ ਅਤੇ \'contest\' ਲਈ ਵਰੁਣ ਨੂੰ ਵਧਾਈਆਂ!'
  },
  'mr': {
    [key1]: 'स्पर्धेच्या विजेत्यांची घोषणा!',
    [key2]: 'स्पर्धा \'द ट्वेल्व टंग्स प्राईज 882\' संपली आहे. \'winnerwillbeme\' साठी आधी आणि \'contest\' साठी वरुणचे अभिनंदन!'
  },
  'ur': {
    [key1]: 'مقابلے کے فاتحین کا اعلان!',
    [key2]: 'مقابلہ \'دی ٹویلھ ٹنگز پرائز 882\' ختم ہو گیا ہے۔ \'winnerwillbeme\' کے لیے آدھی اور \'contest\' کے لیے ورون کو مبارکباد!'
  },
  'gu': {
    [key1]: 'સ્પર્ધાના વિજેતાઓની જાહેરાત!',
    [key2]: 'સ્પર્ધા \'ધ ટ્વેલ્વ ટંગ્સ પ્રાઇઝ 882\' પૂર્ણ થઈ છે. \'winnerwillbeme\' માટે આધીને અને \'contest\' માટે વરુણને અભિનંદન!'
  },
  'or': {
    [key1]: 'ପ୍ରତିଯୋଗିତାର ବିଜେତାମାନଙ୍କ ଘୋଷଣା!',
    [key2]: 'ପ୍ରତିଯୋଗିତା \'ଦ ଟ୍ୱେଲଭ୍ ଟଙ୍ଗ୍ସ ପ୍ରାଇଜ୍ 882\' ଶେଷ ହୋଇଛି। \'winnerwillbeme\' ପାଇଁ ଆଧିଙ୍କୁ ଏବଂ \'contest\' ପାଇଁ ବରୁଣଙ୍କୁ ଅଭିନନ୍ଦନ!'
  }
};

Object.keys(translations).forEach(lang => {
  const file = path.join(dir, lang + '.json');
  if (fs.existsSync(file)) {
    let data = JSON.parse(fs.readFileSync(file));
    Object.assign(data, translations[lang]);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log('Updated ' + lang);
  }
});
