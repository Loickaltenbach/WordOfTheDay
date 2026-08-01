# Third-party notices

The seed word lists in [`src/defaultWords.ts`](src/defaultWords.ts) — 1010 entries
per language, everything past the first 20 hand-curated ones — are derived from
third-party datasets. Both are MIT-licensed, and the MIT license requires their
copyright notice to travel with the derived work. That is what this file is for.

Words were filtered (function words, names, filler and vulgar tokens dropped) and
enriched with translations written for this project. The upstream datasets
themselves are not redistributed here in their original form.

---

## FrequencyWords — English and French word lists

Copyright (c) Hermit Dave
Licensed under the MIT License.

- Source: https://github.com/hermitdave/FrequencyWords
- English: `content/2018/en/en_full.txt`
- French: `content/2018/fr/fr_full.txt`
- Full license text: https://github.com/hermitdave/FrequencyWords/blob/master/LICENSE

Derived from the OpenSubtitles subtitle-frequency corpus.

## jlpt-word-list — Japanese vocabulary

Copyright (c) elzup
Licensed under the MIT License.

- Source: https://github.com/elzup/jlpt-word-list
- File: `out/all.csv` (JLPT N5/N4 vocabulary)
- Full license text: https://github.com/elzup/jlpt-word-list/blob/master/LICENSE

Romaji readings were derived mechanically from the dataset's kana readings; no
kanji or readings were invented.

---

## MIT License

Both datasets above are distributed under the following terms:

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
