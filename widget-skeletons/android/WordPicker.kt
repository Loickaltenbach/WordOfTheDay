package com.loickaltenbach.wordoftheday.widget

import java.time.LocalDate

object WordPicker {
    /** Deterministic: same local calendar day + same list = same word. */
    fun pick(words: List<String>, date: LocalDate = LocalDate.now()): String? {
        if (words.isEmpty()) return null
        val index = ((date.toEpochDay() % words.size) + words.size) % words.size
        return words[index.toInt()]
    }
}
