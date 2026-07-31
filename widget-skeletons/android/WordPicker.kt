package com.loickaltenbach.wordoftheday.widget

import java.time.LocalDate

data class WordEntry(
    val word: String,
    val translation: String,
    val example: String,
)

object WordPicker {
    /** Deterministic: same local calendar day + same list = same word. */
    fun <T> pick(items: List<T>, date: LocalDate = LocalDate.now()): T? {
        if (items.isEmpty()) return null
        val index = ((date.toEpochDay() % items.size) + items.size) % items.size
        return items[index.toInt()]
    }
}
