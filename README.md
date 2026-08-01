# Word of the Day

A React Native vocabulary app with an iOS Lock Screen widget. You keep a lexicon
per language, and the widget shows one word from it each day — the same word all
day, a new one at midnight.

The word list lives in MMKV inside a shared App Group container, so the widget
extension reads it directly. No server, no account, no network.

## Features

- Per-language lexicons (Français, Anglais, Japonais), seeded with 1010 words each
  on first pick — the list is never empty on day one
- Add, edit, delete words with a translation and an optional example sentence
- Mark words as learned, search within a lexicon
- iOS Lock Screen widget (`accessoryRectangular`), refreshed at local midnight
- Case-insensitive duplicate detection

## Stack

React Native 0.86 · React 19 · TypeScript · MMKV (`react-native-mmkv` v4 / Nitro)
· WidgetKit + SwiftUI. Node >= 22.11.

## Running it

```sh
npm install
bundle install                        # CocoaPods itself (Gemfile at the repo root)
cd ios && bundle exec pod install && cd ..

npm start           # Metro
npm run ios         # or: npm run android
```

Tests and lint:

```sh
npm test
npm run lint
```

## The iOS widget

The widget is a separate target, `WordOfTheDayWidgetExtension`. It shares data with
the app through an App Group — which means three things have to line up, and all
three fail silently when they don't:

1. **Both targets need the App Group entitlement.** See
   [`ios/WordOfTheDay/WordOfTheDay.entitlements`](ios/WordOfTheDay/WordOfTheDay.entitlements)
   and
   [`ios/WordOfTheDayWidget/WordOfTheDayWidget.entitlements`](ios/WordOfTheDayWidget/WordOfTheDayWidget.entitlements).
   Without it on the extension, `containerURL(forSecurityApplicationGroupIdentifier:)`
   returns `nil` and the widget just renders its empty state.

2. **`AppGroupIdentifier` must be set in the app's `Info.plist`.** That is the key
   `react-native-mmkv` reads to decide where to put the MMKV file. Without it, the
   app writes to its own container instead of the shared one.

3. **The MMKV root path must match on both sides.** `react-native-mmkv` writes to
   the App Group container root, so the widget passes `rootPath: groupDir`
   explicitly — *not* `MMKV.initialize(rootDir:groupDir:)`, which appends `/mmkv`
   and would open a different file. See
   [`WordOfTheDayWidget.swift`](ios/WordOfTheDayWidget/WordOfTheDayWidget.swift).

Forking with a different bundle identifier means updating the App Group ID in both
entitlements files, in `Info.plist`, and in `WordOfTheDayWidget.swift`.

After reinstalling, remove and re-add the widget: iOS caches the previous timeline,
so a stale empty state can outlive the fix.

## Layout

```
App.tsx                        UI (single file, French copy)
src/storage.ts                 MMKV reads/writes + widget snapshot
src/defaultWords.ts            seed lexicons
src/languages.ts               language catalog
src/theme.ts                   colors, radii
ios/WordOfTheDayWidget/        WidgetKit extension
widget-skeletons/              pre-integration templates (iOS + Android)
```

The widget only ever reads one key, `snapshot`: the active language's words
flattened to `{word, translation, example}`. Every mutation in `storage.ts`
rewrites it. The `learned` flag stays app-only.

Word selection is deterministic — the same calendar day plus the same list yields
the same word, with no stored state, so the app and the widget agree without
coordinating. See [`WordPicker.swift`](ios/WordOfTheDayWidget/WordPicker.swift).

## Known gaps

- The Android widget exists only as a skeleton in
  [`widget-skeletons/android/`](widget-skeletons/android/); it is not wired into the
  Gradle build.
- No `WidgetCenter.reloadAllTimelines()` bridge — words added in the app show up on
  the widget at the next system refresh, not immediately.

## License

MIT — see [LICENSE](LICENSE).

The bundled word lists are derived from third-party MIT-licensed datasets; see
[NOTICE.md](NOTICE.md) for attribution.
