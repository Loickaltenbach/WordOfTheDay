package com.loickaltenbach.wordoftheday.widget

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.LocalDate

class WordPickerTest {
    @Test
    fun `empty list returns null`() {
        assertNull(WordPicker.pick(emptyList(), LocalDate.now()))
    }

    @Test
    fun `same date same list is stable`() {
        val words = listOf("chat", "chien", "table")
        val date = LocalDate.of(2026, 7, 31)
        assertEquals(WordPicker.pick(words, date), WordPicker.pick(words, date))
    }

    @Test
    fun `different day can change for a two word list`() {
        val words = listOf("chat", "chien")
        assertNotEquals(
            WordPicker.pick(words, LocalDate.ofEpochDay(0)),
            WordPicker.pick(words, LocalDate.ofEpochDay(1)),
        )
    }
}
