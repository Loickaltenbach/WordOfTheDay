package com.loickaltenbach.wordoftheday.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.loickaltenbach.wordoftheday.R
import com.tencent.mmkv.MMKV
import org.json.JSONArray

private const val MMKV_ID = "word-of-the-day" // must match the `id` used in src/storage.ts

// Android widgets run in the same process as the app, so no App Group
// equivalent is needed here — just open the same MMKV instance by id.
class WordOfTheDayWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        MMKV.initialize(context)
        val kv = MMKV.mmkvWithID(MMKV_ID)
        val words = kv?.decodeString("snapshot")?.let { json ->
            val array = JSONArray(json)
            (0 until array.length()).map { array.getString(it) }
        } ?: emptyList()

        val word = WordPicker.pick(words) ?: context.getString(R.string.word_of_the_day_empty)
        for (id in ids) {
            val views = RemoteViews(context.packageName, R.layout.word_of_the_day_widget)
            views.setTextViewText(R.id.word_text, word)
            manager.updateAppWidget(id, views)
        }
    }
}
