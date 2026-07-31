import { storage, getWords, addWord, removeWord, setActiveLanguage } from './storage';

beforeEach(() => {
  storage.clearAll();
});

test('addWord/removeWord update the language word list', () => {
  addWord('fr', 'bonjour');
  addWord('fr', 'chat');
  expect(getWords('fr')).toEqual(['bonjour', 'chat']);

  removeWord('fr', 'bonjour');
  expect(getWords('fr')).toEqual(['chat']);
});

test('adding a duplicate word is a no-op', () => {
  addWord('fr', 'chat');
  addWord('fr', 'chat');
  expect(getWords('fr')).toEqual(['chat']);
});

test('every mutation refreshes the snapshot for the active language', () => {
  setActiveLanguage('fr');
  addWord('fr', 'chat');
  addWord('en', 'cat'); // different (inactive) language, must not appear in the snapshot

  expect(JSON.parse(storage.getString('snapshot')!)).toEqual(['chat']);
});
