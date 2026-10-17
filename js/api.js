const translateCache = new Map();

function isBadTranslation(out, key) {
  if (!out) return true;
  const t = out.trim();
  if (!t) return true;
  if (/MYMEMORY WARNING/i.test(t)) return true;
  if (/YOU USED ALL AVAILABLE FREE TRANSLATIONS/i.test(t)) return true;
  return t === key.trim();
}

async function translateViaGoogle(key) {
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=" +
      encodeURIComponent(key.slice(0, 1500));
    const data = await getJSON(url);
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((seg) => (seg && seg[0]) || "").join("").trim();
    }
    return "";
  } catch (err) {
    return "";
  }
}

async function translateViaMyMemory(key) {
  try {
    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(key.slice(0, 500)) +
      "&langpair=en|pt-BR";
    const data = await getJSON(url);
    return (data.responseData && data.responseData.translatedText) || "";
  } catch (err) {
    return "";
  }
}

async function translateText(text) {
  const key = (text || "").trim();
  if (!key) return "";
  if (translateCache.has(key)) return translateCache.get(key);
  let out = await translateViaGoogle(key);
  if (isBadTranslation(out, key)) out = await translateViaMyMemory(key);
  const clean = isBadTranslation(out, key) ? key : out.trim();
  translateCache.set(key, clean);
  return clean;
}
