import { createMMKV } from 'react-native-mmkv';
import { DEFAULT_WORDS } from './defaultWords';

// Same `id` the native widgets open via MMKV.mmkvWithID("word-of-the-day", ...).
// `multi-process` is required because the iOS widget extension is a separate
// process reading this same file through the App Group container.
export const storage = createMMKV({
  id: 'word-of-the-day',
  mode: 'multi-process',
});

export interface WordEntry {
  word: string;
  translation: string;
  example: string;
  learned: boolean;
}

// The only key the widgets read. Only the 3 fields the widget actually
// displays are mirrored here — `learned` stays app-only.
const SNAPSHOT_KEY = 'snapshot';

const wordsKey = (language: string) => `words:${language}`;
const LANGUAGES_KEY = 'languages';

export function getLanguages(): string[] {
  const raw = storage.getString(LANGUAGES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function registerLanguage(language: string): void {
  const languages = getLanguages();
  if (languages.includes(language)) return;
  storage.set(LANGUAGES_KEY, JSON.stringify([...languages, language]));

  const defaults = DEFAULT_WORDS[language];
  if (defaults) {
    storage.set(
      wordsKey(language),
      JSON.stringify(defaults.map(w => ({ ...w, learned: false }))),
    );
  }
}

export function removeLanguage(language: string): void {
  const remaining = getLanguages().filter(l => l !== language);
  storage.set(LANGUAGES_KEY, JSON.stringify(remaining));
  storage.remove(wordsKey(language));

  if (getActiveLanguage() !== language) return;
  if (remaining.length > 0) {
    setActiveLanguage(remaining[0]);
  } else {
    storage.remove('activeLanguage');
    writeSnapshot();
  }
}

export function getActiveLanguage(): string | undefined {
  return storage.getString('activeLanguage');
}

export function setActiveLanguage(language: string): void {
  registerLanguage(language);
  storage.set('activeLanguage', language);
  writeSnapshot();
}

export function getWords(language: string): WordEntry[] {
  const raw = storage.getString(wordsKey(language));
  return raw ? JSON.parse(raw) : [];
}

function isDuplicate(words: WordEntry[], word: string): boolean {
  return words.some(w => w.word.toLowerCase() === word.toLowerCase());
}

export function addWord(
  language: string,
  entry: { word: string; translation: string; example: string },
): { ok: true } | { ok: false; reason: 'duplicate' } {
  const words = getWords(language);
  if (isDuplicate(words, entry.word)) return { ok: false, reason: 'duplicate' };
  storage.set(
    wordsKey(language),
    JSON.stringify([...words, { ...entry, learned: false }]),
  );
  writeSnapshot();
  return { ok: true };
}

export function updateWord(
  language: string,
  originalWord: string,
  entry: { word: string; translation: string; example: string },
): { ok: true } | { ok: false; reason: 'duplicate' } {
  const words = getWords(language);
  const changingWord = originalWord.toLowerCase() !== entry.word.toLowerCase();
  if (changingWord && isDuplicate(words, entry.word)) {
    return { ok: false, reason: 'duplicate' };
  }
  storage.set(
    wordsKey(language),
    JSON.stringify(
      words.map(w =>
        w.word.toLowerCase() === originalWord.toLowerCase()
          ? { ...entry, learned: w.learned }
          : w,
      ),
    ),
  );
  writeSnapshot();
  return { ok: true };
}

export function removeWord(language: string, word: string): void {
  const words = getWords(language).filter(w => w.word !== word);
  storage.set(wordsKey(language), JSON.stringify(words));
  writeSnapshot();
}

export function toggleLearned(language: string, word: string): void {
  const words = getWords(language).map(w =>
    w.word === word ? { ...w, learned: !w.learned } : w,
  );
  storage.set(wordsKey(language), JSON.stringify(words));
}

function writeSnapshot(): void {
  const language = getActiveLanguage();
  const words = language ? getWords(language) : [];
  const forWidget = words.map(({ word, translation, example }) => ({
    word,
    translation,
    example,
  }));
  storage.set(SNAPSHOT_KEY, JSON.stringify(forWidget));
}
