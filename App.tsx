/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  addWord,
  getActiveLanguage,
  getLanguages,
  getWords,
  removeLanguage,
  removeWord,
  setActiveLanguage,
  toggleLearned,
  updateWord,
  WordEntry,
} from './src/storage';
import { LANGUAGE_CATALOG } from './src/languages';
import { colors, radii } from './src/theme';

type SortMode = 'az' | 'recent';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [languages, setLanguages] = useState<string[]>([]);
  const [activeLanguage, setActive] = useState<string | undefined>();
  const [words, setWords] = useState<WordEntry[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('az');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [wordForm, setWordForm] = useState<
    | { mode: 'add' }
    | { mode: 'edit'; original: string }
    | null
  >(null);

  useEffect(() => {
    setLanguages(getLanguages());
    setActive(getActiveLanguage());
  }, []);

  useEffect(() => {
    setWords(activeLanguage ? getWords(activeLanguage) : []);
  }, [activeLanguage]);

  const reloadWords = (language: string) => setWords(getWords(language));

  const selectLanguage = (language: string) => {
    setActiveLanguage(language);
    setLanguages(getLanguages());
    setActive(language);
    setPickerOpen(false);
    setPickerSearch('');
  };

  const confirmDeleteLanguage = (language: string) => {
    Alert.alert(
      'Supprimer cette langue ?',
      `« ${language} » et tous ses mots seront supprimés définitivement.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            removeLanguage(language);
            setLanguages(getLanguages());
            setActive(getActiveLanguage());
          },
        },
      ],
    );
  };

  const visibleWords = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? words.filter(
          w =>
            w.word.toLowerCase().includes(query) ||
            w.translation.toLowerCase().includes(query),
        )
      : words;
    return sort === 'az'
      ? [...filtered].sort((a, b) => a.word.localeCompare(b.word))
      : [...filtered].reverse();
  }, [words, search, sort]);

  const learnedCount = words.filter(w => w.learned).length;

  return (
    <View style={[styles.screen, { paddingTop: safeAreaInsets.top }]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={activeLanguage ? visibleWords : []}
        keyExtractor={item => item.word}
        renderItem={({ item }) => (
          <WordRow
            entry={item}
            onToggleLearned={() => {
              toggleLearned(activeLanguage!, item.word);
              reloadWords(activeLanguage!);
            }}
            onEdit={() => setWordForm({ mode: 'edit', original: item.word })}
            onDelete={() => {
              removeWord(activeLanguage!, item.word);
              reloadWords(activeLanguage!);
            }}
          />
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.kicker}>Lexique</Text>

            {activeLanguage && (
              <>
                <View style={styles.headerRow}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{activeLanguage}</Text>
                    <Pressable
                      onPress={() => confirmDeleteLanguage(activeLanguage)}
                      hitSlop={8}
                      accessibilityLabel="Supprimer cette langue">
                      <Text style={styles.deleteLanguageIcon}>🗑</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.count}>
                    {words.length} mots · {learnedCount} appris
                  </Text>
                </View>

                <LanguageChips
                  languages={languages}
                  active={activeLanguage}
                  counts={Object.fromEntries(
                    languages.map(l => [
                      l,
                      l === activeLanguage ? words.length : getWords(l).length,
                    ]),
                  )}
                  onSelect={selectLanguage}
                  onAdd={() => setPickerOpen(true)}
                />

                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Rechercher un mot"
                    placeholderTextColor={colors.neutral500}
                  />
                  <View style={styles.seg}>
                    <Pressable onPress={() => setSort('az')}>
                      <Text
                        style={[
                          styles.segOption,
                          sort === 'az' && styles.segOptionActive,
                        ]}>
                        A–Z
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => setSort('recent')}>
                      <Text
                        style={[
                          styles.segOption,
                          styles.segOptionBorder,
                          sort === 'recent' && styles.segOptionActive,
                        ]}>
                        Récents
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </>
        }
        ListEmptyComponent={
          !activeLanguage ? (
            <EmptyState
              title="Aucune langue"
              body="Choisissez une première langue à apprendre. Le widget affichera ses mots dès le premier ajout."
              actionLabel="Choisir une langue"
              onAction={() => setPickerOpen(true)}
            />
          ) : words.length === 0 ? (
            <EmptyState
              title="Aucun mot"
              body="Ajoutez un mot, sa traduction et une phrase d'exemple pour alimenter le widget."
            />
          ) : (
            <EmptyState title="Aucun résultat" body="Aucun mot ne correspond à cette recherche." />
          )
        }
      />

      {activeLanguage && (
        <Pressable style={styles.addBar} onPress={() => setWordForm({ mode: 'add' })}>
          <Text style={styles.addBarText}>+ Ajouter un mot</Text>
        </Pressable>
      )}

      <LanguagePicker
        visible={pickerOpen}
        search={pickerSearch}
        onChangeSearch={setPickerSearch}
        alreadyAdded={languages}
        onPick={selectLanguage}
        onClose={() => {
          setPickerOpen(false);
          setPickerSearch('');
        }}
      />

      {activeLanguage && wordForm && (
        <WordFormModal
          language={activeLanguage}
          editing={
            wordForm.mode === 'edit'
              ? words.find(w => w.word === wordForm.original)
              : undefined
          }
          onClose={() => setWordForm(null)}
          onSaved={() => {
            reloadWords(activeLanguage);
            setWordForm(null);
          }}
        />
      )}
    </View>
  );
}

function LanguageChips({
  languages,
  active,
  counts,
  onSelect,
  onAdd,
}: {
  languages: string[];
  active: string;
  counts: Record<string, number>;
  onSelect: (language: string) => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.chipRow}>
      {languages.map(language => {
        const isActive = language === active;
        return (
          <Pressable
            key={language}
            onPress={() => onSelect(language)}
            style={[styles.chip, isActive && styles.chipActive]}>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {language} {counts[language] ?? 0}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onAdd}
        style={[styles.chip, styles.chipAdd]}
        accessibilityLabel="Ajouter une langue">
        <Text style={styles.chipAddText}>+</Text>
      </Pressable>
    </View>
  );
}

function WordRow({
  entry,
  onToggleLearned,
  onEdit,
  onDelete,
}: {
  entry: WordEntry;
  onToggleLearned: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.wordRow}>
      <Pressable onPress={onToggleLearned} hitSlop={8}>
        <View
          style={[styles.learnedDot, entry.learned && styles.learnedDotOn]}
        />
      </Pressable>
      <View style={styles.wordBody}>
        <Text style={styles.wordText}>{entry.word}</Text>
        <Text style={styles.translationText}>{entry.translation}</Text>
        {!!entry.example && (
          <Text style={styles.exampleText}>« {entry.example} »</Text>
        )}
      </View>
      <View style={styles.wordActions}>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text style={styles.actionIcon}>✎</Text>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Text style={styles.actionIcon}>🗑</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {actionLabel && onAction && (
        <Pressable style={styles.emptyAction} onPress={onAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>{children}</View>
      </View>
    </Modal>
  );
}

function LanguagePicker({
  visible,
  search,
  onChangeSearch,
  alreadyAdded,
  onPick,
  onClose,
}: {
  visible: boolean;
  search: string;
  onChangeSearch: (v: string) => void;
  alreadyAdded: string[];
  onPick: (language: string) => void;
  onClose: () => void;
}) {
  const query = search.trim().toLowerCase();
  const results = LANGUAGE_CATALOG.filter(l =>
    l.toLowerCase().includes(query),
  );

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.sheetHeader}>
        <Text style={styles.kicker}>Ajouter une langue</Text>
        <Pressable onPress={onClose}>
          <Text style={styles.closeText}>Fermer</Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={onChangeSearch}
        placeholder="Rechercher une langue"
        placeholderTextColor={colors.neutral500}
      />
      <ScrollView style={{ marginTop: 12 }}>
        {results.map(language => {
          const added = alreadyAdded.includes(language);
          return (
            <Pressable
              key={language}
              disabled={added}
              onPress={() => onPick(language)}
              style={[styles.pickerRow, added && styles.pickerRowDisabled]}>
              <Text style={styles.pickerRowText}>{language}</Text>
              <Text style={styles.pickerRowMeta}>
                {added ? 'Déjà ajoutée' : '+'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Sheet>
  );
}

function WordFormModal({
  language,
  editing,
  onClose,
  onSaved,
}: {
  language: string;
  editing?: WordEntry;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [word, setWord] = useState(editing?.word ?? '');
  const [translation, setTranslation] = useState(editing?.translation ?? '');
  const [example, setExample] = useState(editing?.example ?? '');
  const [duplicate, setDuplicate] = useState(false);
  const invalid = !word.trim() || !translation.trim();

  const save = () => {
    if (invalid) return;
    const entry = { word: word.trim(), translation: translation.trim(), example: example.trim() };

    const result = editing
      ? updateWord(language, editing.word, entry)
      : addWord(language, entry);

    if (!result.ok) {
      setDuplicate(true);
      return;
    }
    onSaved();
  };

  return (
    <Sheet visible onClose={onClose}>
      <Text style={styles.kicker}>
        {editing ? 'Modifier le mot' : 'Nouveau mot'} · {language}
      </Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Mot</Text>
        <TextInput
          style={[styles.fieldInput, duplicate && styles.fieldInputError]}
          value={word}
          onChangeText={text => {
            setWord(text);
            setDuplicate(false);
          }}
          placeholder="ex: brittle"
          placeholderTextColor={colors.neutral500}
        />
        {duplicate && (
          <Text style={styles.fieldError}>
            « {word} » figure déjà dans votre liste {language.toLowerCase()}.
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Traduction</Text>
        <TextInput
          style={styles.fieldInput}
          value={translation}
          onChangeText={setTranslation}
          placeholder="ex: cassant, fragile"
          placeholderTextColor={colors.neutral500}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Exemple (optionnel)</Text>
        <TextInput
          style={styles.fieldInput}
          value={example}
          onChangeText={setExample}
          placeholder="ex: The old paper had grown brittle."
          placeholderTextColor={colors.neutral500}
        />
      </View>

      <View style={styles.formActions}>
        <Pressable style={styles.formCancel} onPress={onClose}>
          <Text style={styles.formCancelText}>Annuler</Text>
        </Pressable>
        <Pressable
          style={[styles.formSave, invalid && styles.formSaveDisabled]}
          onPress={save}
          disabled={invalid}>
          <Text style={styles.formSaveText}>Enregistrer</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 100,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.neutral600,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '400',
    color: colors.text,
  },
  deleteLanguageIcon: {
    fontSize: 15,
    color: colors.neutral500,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.neutral300,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent100,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral700,
  },
  chipTextActive: {
    color: colors.accent700,
  },
  chipAdd: {
    borderColor: colors.accent,
  },
  chipAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 22,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radii.md,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: colors.neutral100,
    fontSize: 14,
    color: colors.text,
  },
  seg: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  segOption: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: colors.neutral600,
  },
  segOptionBorder: {
    borderLeftWidth: 1,
    borderLeftColor: colors.neutral300,
  },
  segOptionActive: {
    backgroundColor: colors.accent100,
    color: colors.accent700,
  },
  wordRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  learnedDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.6,
    borderColor: colors.neutral400,
    marginTop: 5,
  },
  learnedDotOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  wordBody: {
    flex: 1,
  },
  wordText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  translationText: {
    fontSize: 13,
    color: colors.neutral700,
    marginTop: 2,
  },
  exampleText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.neutral600,
    marginTop: 5,
  },
  wordActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 3,
  },
  actionIcon: {
    fontSize: 15,
    color: colors.neutral600,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    color: colors.neutral700,
  },
  emptyBody: {
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.neutral700,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyActionText: {
    fontWeight: '600',
    color: colors.accent700,
  },
  addBar: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 24,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  addBarText: {
    fontWeight: '600',
    fontSize: 15,
    color: colors.accent700,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(45,43,43,0.32)',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 22,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  closeText: {
    fontWeight: '600',
    fontSize: 13,
    color: colors.accent700,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pickerRowDisabled: {
    opacity: 0.5,
  },
  pickerRowText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  pickerRowMeta: {
    fontSize: 12,
    color: colors.neutral600,
  },
  field: {
    marginTop: 14,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.neutral700,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.neutral100,
    fontSize: 15,
    color: colors.text,
  },
  fieldInputError: {
    borderColor: colors.accent700,
  },
  fieldError: {
    fontSize: 12,
    color: colors.accent700,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  formCancel: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  formCancelText: {
    fontWeight: '600',
    color: colors.neutral700,
  },
  formSave: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  formSaveDisabled: {
    opacity: 0.45,
  },
  formSaveText: {
    fontWeight: '600',
    color: colors.accent700,
  },
});

export default App;
