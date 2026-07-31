import { MMKV } from 'react-native-mmkv';

// Same `id` the native widgets open via MMKV.mmkvWithID("word-of-the-day", ...).
// `multi-process` is required because the iOS widget extension is a separate
// process reading this same file through the App Group container.
export const storage = new MMKV({
  id: 'word-of-the-day',
  mode: 'multi-process',
});

// The only key the widgets read. Keeping it a flat string[] means the native
// side never needs to know about languages, ids, or any other CRUD detail.
const SNAPSHOT_KEY = 'snapshot';

const wordsKey = (language: string) => `words:${language}`;

export function getActiveLanguage(): string | undefined {
  return storage.getString('activeLanguage');
}

export function setActiveLanguage(language: string): void {
  storage.set('activeLanguage', language);
  writeSnapshot();
}

export function getWords(language: string): string[] {
  const raw = storage.getString(wordsKey(language));
  return raw ? JSON.parse(raw) : [];
}

export function addWord(language: string, word: string): void {
  const words = getWords(language);
  if (words.includes(word)) return;
  storage.set(wordsKey(language), JSON.stringify([...words, word]));
  writeSnapshot();
}

export function removeWord(language: string, word: string): void {
  const words = getWords(language).filter(w => w !== word);
  storage.set(wordsKey(language), JSON.stringify(words));
  writeSnapshot();
}

function writeSnapshot(): void {
  const language = getActiveLanguage();
  const words = language ? getWords(language) : [];
  storage.set(SNAPSHOT_KEY, JSON.stringify(words));
}
