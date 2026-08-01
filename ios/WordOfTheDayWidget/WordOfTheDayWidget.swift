import WidgetKit
import SwiftUI
import MMKV // pod 'MMKV' — added to this target's Podfile entry

private let appGroupID = "group.com.loickaltenbach.wordoftheday"
private let mmkvID = "word-of-the-day" // must match the `id` used in src/storage.ts

private func loadSnapshot() -> [WordEntry] {
    guard let groupDir = FileManager.default
        .containerURL(forSecurityApplicationGroupIdentifier: appGroupID)?.path
    else { return [] }

    MMKV.initialize(rootDir: nil, groupDir: groupDir, logLevel: .info)
    guard let kv = MMKV(mmapID: mmkvID, mode: .multiProcess),
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

// Lock Screen widget: accessoryRectangular gives ~2 lines of room, so the
// example sentence (shown on the home-screen mock) doesn't fit here — word +
// translation only. No .containerBackground: that API is for Home Screen /
// StandBy widgets, accessory families render straight onto the lock screen.
struct WordOfTheDayWidgetEntryView: View {
    var entry: Provider.Entry

    var body: some View {
        if let word = entry.word {
            VStack(alignment: .leading, spacing: 1) {
                Text(word.word)
                    .font(.headline)
                    .lineLimit(1)
                Text(word.translation)
                    .font(.caption2)
                    .lineLimit(1)
            }
        } else {
            Text("Ajoute des mots dans l'app")
                .font(.caption2)
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
        .description("Affiche le mot du jour sur l'écran verrouillé.")
        .supportedFamilies([.accessoryRectangular])
    }
}
