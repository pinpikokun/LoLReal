export async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    throw new Error('Translation API key not configured');
  }

  const url = `https://translation.googleapis.com/language/translate/v2`;
  const params = new URLSearchParams({
    q: text,
    target: targetLang,
    key: apiKey,
    format: 'text',
  });
  if (sourceLang) {
    params.set('source', sourceLang);
  }

  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

export async function detectLanguage(text: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return 'unknown';
  }

  const url = `https://translation.googleapis.com/language/translate/v2/detect`;
  const params = new URLSearchParams({
    q: text,
    key: apiKey,
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'POST',
  });

  if (!response.ok) {
    return 'unknown';
  }

  const data = await response.json();
  return data.data.detections[0][0].language;
}
