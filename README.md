# 🇩🇪 Goethe German Vocabulary (A1 • A2 • B1)

A modern, offline-ready vocabulary platform and comprehensive dataset extracted directly from official **Goethe-Institut** wordlists:
- **A1**: *Start Deutsch 1* (737 words)
- **A2**: *Goethe-Zertifikat A2* (1,409 words)
- **B1**: *Goethe-Zertifikat B1 / ÖSD* (3,645 words)
- **Total**: **5,791 vocabulary entries** with gender articles (`der`, `die`, `das`), plural forms, verb conjugations, authentic Goethe example sentences, and pre-translated English definitions.

---

## ✨ Features

- 📖 **Interactive Dictionary**: Real-time search across German headwords, English meanings, and example sentences.
- 🇬🇧 **Pre-Translated English**: All 5,791 words are pre-translated in both JSON and CSV datasets for zero-latency lookups.
- 🌍 **On-Demand Multilingual Translation**: Instant free translation into Turkish (Türkçe), Spanish, French, Italian, Russian, and more.
- 🔊 **Native Audio**: High-quality German pronunciation (`de-DE`) for headwords and sentences using the Web Speech API.
- 🗂️ **Configurable 3D Flashcards**: Choose session deck size (10, 25, 50, or custom), flip cards with spacebar, and track learned progress.
- 🎯 **Smart Quiz Mode**: Select question count (5Q, 10Q, 20Q, or custom) to practice gender articles, Goethe sentence fill-ins, and meanings.
- 💾 **Zero-Backend Browser Database**: Saved words and study progress are stored persistently in **IndexedDB** (`GoetheVocabDB`), making it 100% serverless and ready for GitHub Pages.
- 🌓 **Dark & Light Mode**: Automatic system default detection (`prefers-color-scheme`) with a manual cycle toggle.
- 📊 **Modular CSV & JSON Downloads**: Download individual level datasets (A1, A2, B1) or the consolidated master database.

---

## 📂 Datasets

All datasets are available in [`data/`](./data) and [`public/data/`](./public/data):

| Level | CSV with English | JSON Dataset | Words | Official Goethe Source |
|---|---|---|---|---|
| **A1** | [`words_a1_en.csv`](./data/words_a1_en.csv) | [`words_a1.json`](./data/words_a1.json) | 737 | `A1_SD1_Wortliste_02.pdf` |
| **A2** | [`words_a2_en.csv`](./data/words_a2_en.csv) | [`words_a2.json`](./data/words_a2.json) | 1,409 | `Goethe-Zertifikat_A2_Wortliste.pdf` |
| **B1** | [`words_b1_en.csv`](./data/words_b1_en.csv) | [`words_b1.json`](./data/words_b1.json) | 3,645 | `Goethe-Zertifikat_B1_Wortliste.pdf` |
| **Master** | [`goethe_vocab_en.csv`](./data/goethe_vocab_en.csv) | [`goethe_vocab.json`](./data/goethe_vocab.json) | **5,791** | Consolidated A1 + A2 + B1 |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run local development server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Build for production (Static Hosting)
```bash
npm run build
```
The output will be in `dist/`, ready to deploy to **GitHub Pages**, **Vercel**, or **Netlify**.

---

## 📜 Attribution & License

Vocabulary data extracted from official exam wordlists published by the [Goethe-Institut](https://www.goethe.de). Created for educational and personal study purposes.
