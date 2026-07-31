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
        val entries = kv?.decodeString("snapshot")?.let { json ->
            val array = JSONArray(json)
            (0 until array.length()).map {
                val obj = array.getJSONObject(it)
                WordEntry(
                    word = obj.getString("word"),
                    translation = obj.getString("translation"),
                    example = obj.getString("example"),
                )
            }
        } ?: emptyList()

        val entry = WordPicker.pick(entries)
        for (id in ids) {
            val views = RemoteViews(context.packageName, R.layout.word_of_the_day_widget)
            if (entry != null) {
                views.setTextViewText(R.id.word_text, entry.word)
                views.setTextViewText(R.id.translation_text, entry.translation)
                views.setViewVisibility(R.id.example_text, android.view.View.VISIBLE)
                views.setTextViewText(R.id.example_text, "« ${entry.example} »")
            } else {
                views.setTextViewText(R.id.word_text, context.getString(R.string.word_of_the_day_empty))
                views.setTextViewText(R.id.translation_text, "")
                views.setViewVisibility(R.id.example_text, android.view.View.GONE)
            }
            manager.updateAppWidget(id, views)
        }
    }
}
