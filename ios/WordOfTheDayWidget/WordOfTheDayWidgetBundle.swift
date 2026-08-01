//
//  WordOfTheDayWidgetBundle.swift
//  WordOfTheDayWidget
//
//  Created by Loic Kaltenbach on 01/08/2026.
//

import WidgetKit
import SwiftUI

@main
struct WordOfTheDayWidgetBundle: WidgetBundle {
    var body: some Widget {
        WordOfTheDayWidget()
        WordOfTheDayWidgetControl()
        WordOfTheDayWidgetLiveActivity()
    }
}
