import {
  storage,
  getWords,
  addWord,
  updateWord,
  removeWord,
  toggleLearned,
  setActiveLanguage,
  getActiveLanguage,
  getLanguages,
  removeLanguage,
} from './storage';

const entry = (word: string) => ({
  word,
  translation: `${word}-trad`,
  example: `Example with ${word}.`,
});

beforeEach(() => {
  storage.clearAll();
});

test('addWord/removeWord update the language word list', () => {
  addWord('Anglais', entry('bonjour'));
  addWord('Anglais', entry('chat'));
  expect(getWords('Anglais').map(w => w.word)).toEqual(['bonjour', 'chat']);

  removeWord('Anglais', 'bonjour');
  expect(getWords('Anglais').map(w => w.word)).toEqual(['chat']);
});

test('adding a duplicate word (case-insensitive) is rejected', () => {
  expect(addWord('Anglais', entry('chat'))).toEqual({ ok: true });
  expect(addWord('Anglais', entry('Chat'))).toEqual({
    ok: false,
    reason: 'duplicate',
  });
  expect(getWords('Anglais')).toHaveLength(1);
});

test('new words start unlearned; toggleLearned flips the flag', () => {
  addWord('Anglais', entry('chat'));
  expect(getWords('Anglais')[0].learned).toBe(false);

  toggleLearned('Anglais', 'chat');
  expect(getWords('Anglais')[0].learned).toBe(true);
});

test('updateWord edits fields without resetting learned, and still blocks duplicates', () => {
  addWord('Anglais', entry('chat'));
  addWord('Anglais', entry('chien'));
  toggleLearned('Anglais', 'chat');

  updateWord('Anglais', 'chat', { ...entry('chat'), translation: 'cat!' });
  expect(getWords('Anglais')[0]).toEqual({
    word: 'chat',
    translation: 'cat!',
    example: 'Example with chat.',
    learned: true,
  });

  expect(updateWord('Anglais', 'chat', entry('chien'))).toEqual({
    ok: false,
    reason: 'duplicate',
  });
});

test('every mutation refreshes the widget snapshot (word/translation/example only) for the active language', () => {
  // Made-up language names (not in the catalog / DEFAULT_WORDS) to isolate
  // the snapshot mechanism from the default-seeding behavior tested below.
  setActiveLanguage('Testland');
  addWord('Testland', entry('chat'));
  addWord('Otherland', entry('gato')); // inactive language, must not appear

  expect(JSON.parse(storage.getString('snapshot')!)).toEqual([
    { word: 'chat', translation: 'chat-trad', example: 'Example with chat.' },
  ]);
});

test('setActiveLanguage registers the language exactly once', () => {
  setActiveLanguage('Testland');
  setActiveLanguage('Otherland');
  setActiveLanguage('Testland'); // already registered, must not duplicate

  expect(getLanguages()).toEqual(['Testland', 'Otherland']);
});

test('picking a catalog language for the first time seeds its default words', () => {
  setActiveLanguage('Anglais');
  const words = getWords('Anglais');

  expect(words.length).toBeGreaterThanOrEqual(1000);
  expect(words.every(w => w.learned === false)).toBe(true);
  expect(words.map(w => w.word)).toContain('brittle');
});

test('re-selecting an already-registered language does not reset or duplicate its words', () => {
  setActiveLanguage('Anglais');
  addWord('Anglais', entry('chat'));
  const before = getWords('Anglais');

  setActiveLanguage('Anglais');

  expect(getWords('Anglais')).toEqual(before);
});

test('non-catalog languages are not seeded with any default words', () => {
  setActiveLanguage('Testland');
  expect(getWords('Testland')).toEqual([]);
});

test('removeLanguage deletes the language and its words', () => {
  setActiveLanguage('Testland');
  addWord('Testland', entry('chat'));

  removeLanguage('Testland');

  expect(getLanguages()).toEqual([]);
  expect(getWords('Testland')).toEqual([]);
});

test('removing the active language falls back to another remaining language', () => {
  setActiveLanguage('Testland');
  setActiveLanguage('Otherland');
  setActiveLanguage('Testland'); // Testland is active again

  removeLanguage('Testland');

  expect(getActiveLanguage()).toBe('Otherland');
  expect(getLanguages()).toEqual(['Otherland']);
});

test('removing the last language clears the active language and the snapshot', () => {
  setActiveLanguage('Testland');
  addWord('Testland', entry('chat'));

  removeLanguage('Testland');

  expect(getActiveLanguage()).toBeUndefined();
  expect(JSON.parse(storage.getString('snapshot')!)).toEqual([]);
});

test('removing an inactive language leaves the active language untouched', () => {
  setActiveLanguage('Testland');
  setActiveLanguage('Otherland');

  removeLanguage('Testland');

  expect(getActiveLanguage()).toBe('Otherland');
  expect(getLanguages()).toEqual(['Otherland']);
});
