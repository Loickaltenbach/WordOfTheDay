import XCTest
// @testable import <YourWidgetExtensionModuleName>

final class WordPickerTests: XCTestCase {
    func testEmptyListReturnsNil() {
        XCTAssertNil(WordPicker.pick(from: [String](), for: Date()))
    }

    func testSameDateSameListIsStable() {
        let words = ["chat", "chien", "table"]
        let date = Date(timeIntervalSince1970: 1_800_000_000)
        XCTAssertEqual(WordPicker.pick(from: words, for: date), WordPicker.pick(from: words, for: date))
    }

    func testDifferentDayCanChangeForATwoWordList() {
        let words = ["chat", "chien"]
        let day0 = Date(timeIntervalSince1970: 0)
        let day1 = Date(timeIntervalSince1970: 86_400)
        XCTAssertNotEqual(WordPicker.pick(from: words, for: day0), WordPicker.pick(from: words, for: day1))
    }
}
