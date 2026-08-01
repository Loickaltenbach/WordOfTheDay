import Foundation

struct WordEntry: Decodable {
    let word: String
    let translation: String
    let example: String
}

enum WordPicker {
    /// Deterministic: same local calendar day + same list = same word.
    static func pick<T>(from items: [T], for date: Date = Date(), calendar: Calendar = .current) -> T? {
        guard !items.isEmpty else { return nil }
        let epochDay = calendar.dateComponents(
            [.day],
            from: Date(timeIntervalSince1970: 0),
            to: calendar.startOfDay(for: date)
        ).day ?? 0
        let index = ((epochDay % items.count) + items.count) % items.count
        return items[index]
    }
}
