import WidgetKit
import SwiftUI
import MMKV // pod 'MMKV' — add to this target in the Podfile, separate from the RN app's MMKVCore

private let appGroupID = "group.com.loickaltenbach.wordoftheday"
private let mmkvID = "word-of-the-day" // must match the `id` used in src/storage.ts

private func loadSnapshot() -> [WordEntry] {
    guard let groupDir = FileManager.default
        .containerURL(forSecurityApplicationGroupIdentifier: appGroupID)?.path
    else { return [] }

    // rootPath must be the App Group container itself, NOT `initialize(groupDir:)`
    // — that variant appends "/mmkv", while react-native-mmkv writes straight to
    // the container root (its createMMKV sets `path = getAppGroupDirectory()`).
    MMKV.initialize(rootDir: groupDir, logLevel: .info)
    guard let kv = MMKV(
        mmapID: mmkvID,
        cryptKey: nil,
        rootPath: groupDir,
        mode: .multiProcess,
        expectedCapacity: 0
    ),
          let json = kv.string(forKey: "snapshot"),
          let data = json.data(using: .utf8),
          let entries = try? JSONDecoder().decode([WordEntry].self, from: data)
    else { return [] }
    return entries
}

struct WidgetEntry: TimelineEntry {
    let date: Date
    let word: WordEntry?
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry {
        WidgetEntry(date: Date(), word: WordEntry(word: "mot", translation: "traduction", example: ""))
    }

    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> Void) {
        completion(WidgetEntry(date: Date(), word: WordPicker.pick(from: loadSnapshot())))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetEntry>) -> Void) {
        let now = Date()
        let entry = WidgetEntry(date: now, word: WordPicker.pick(from: loadSnapshot(), for: now))
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
            VStack(alignment: .leading, spacing: 4) {
                Text(word.word)
                    .font(.title2)
                    .bold()
                Text(word.translation)
                    .font(.footnote)
                if !word.example.isEmpty {
                    Text("« \(word.example) »")
                        .font(.caption2)
                        .italic()
                }
            }
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
