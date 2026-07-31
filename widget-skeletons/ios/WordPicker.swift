import Foundation

enum WordPicker {
    /// Deterministic: same local calendar day + same list = same word.
    static func pick(from words: [String], for date: Date = Date(), calendar: Calendar = .current) -> String? {
        guard !words.isEmpty else { return nil }
        let epochDay = calendar.dateComponents(
            [.day],
            from: Date(timeIntervalSince1970: 0),
            to: calendar.startOfDay(for: date)
        ).day ?? 0
        let index = ((epochDay % words.count) + words.count) % words.count
        return words[index]
    }
}
