import WidgetKit
import SwiftUI
import MMKV // pod 'MMKV' — add to this target in the Podfile, separate from the RN app's MMKVCore

private let appGroupID = "group.com.loickaltenbach.wordoftheday"
private let mmkvID = "word-of-the-day" // must match the `id` used in src/storage.ts

// ponytail: MMKV(App Group) init sequence copied from Tencent's documented
// extension pattern, not yet compiled — verify against the current MMKV pod
// docs once this target exists (github.com/Tencent/MMKV/wiki/ios_advance).
private func loadSnapshot() -> [String] {
    guard let groupDir = FileManager.default
        .containerURL(forSecurityApplicationGroupIdentifier: appGroupID)?.path
    else { return [] }

    MMKV.initialize(rootDir: nil, groupDir: groupDir, logLevel: .info)
    guard let kv = MMKV(mmapID: mmkvID, mode: .multiProcess),
          let json = kv.string(forKey: "snapshot"),
          let data = json.data(using: .utf8),
          let words = try? JSONDecoder().decode([String].self, from: data)
    else { return [] }
    return words
}

struct WordEntry: TimelineEntry {
    let date: Date
    let word: String?
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WordEntry {
        WordEntry(date: Date(), word: "mot")
    }

    func getSnapshot(in context: Context, completion: @escaping (WordEntry) -> Void) {
        completion(WordEntry(date: Date(), word: WordPicker.pick(from: loadSnapshot())))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WordEntry>) -> Void) {
        let now = Date()
        let entry = WordEntry(date: now, word: WordPicker.pick(from: loadSnapshot(), for: now))
        let midnight = Calendar.current.nextDate(
            after: now,
            matching: DateComponents(hour: 0, minute: 0),
            matchingPolicy: .nextTime
        ) ?? now.addingTimeInterval(86_400)
        completion(Timeline(entries: [entry], policy: .after(midnight)))
    }
}

struct WordOfTheDayWidgetEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        if let word = entry.word {
            Text(word)
                .font(.title2)
                .bold()
        } else {
            Text("Ajoute des mots dans l'app")
                .font(.footnote)
                .multilineTextAlignment(.center)
        }
    }
}

struct WordOfTheDayWidget: Widget {
    let kind = "WordOfTheDayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WordOfTheDayWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Mot du jour")
        .description("Affiche le mot du jour.")
        .supportedFamilies([.systemSmall])
    }
}
