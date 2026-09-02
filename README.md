# 🇩🇪 Goethe German Vocabulary (A1 • A2 • B1)

A modern, offline-first Progressive Web App (PWA) and comprehensive vocabulary database extracted directly from official **Goethe-Institut** wordlists:
- **A1**: *Start Deutsch 1* (737 words)
- **A2**: *Goethe-Zertifikat A2* (1,409 words)
- **B1**: *Goethe-Zertifikat B1 / ÖSD* (3,645 words)
- **Total**: **5,791 vocabulary entries** with gender articles (`der`, `die`, `das`), plural forms, verb conjugations, authentic Goethe example sentences, and pre-translated definitions in both English and Turkish.

---

## ✨ Features

- ⚡ **"Der, Die, Das" Speed Drill**: 60-second rapid-fire article reflex game with combo streak multipliers (🔥 2x, 3x) and keyboard shortcuts (`1`=der, `2`=die, `3`=das).
- 🎧 **Hörverstehen (Listening Quiz)**: Train your ear by listening to native German speech audio and selecting the correct word without seeing the prompt text first.
- 🇬🇧 & 🇹🇷 **Pre-Translated Offline Data**: All 5,791 words have both English (`meaning_en`) and Turkish (`meaning_tr`) pre-computed directly in the datasets for instant 0ms lookups.
- 📱 **Progressive Web App (PWA)**: Installable on iOS, Android, and Desktop. Service Worker caches all assets and datasets (9.6MB) for 100% offline usage.
- 🔊 **Native Audio with Speed Control**: Pronounce headwords and sentences with customizable speech rates (`0.75x` slow, `0.9x`, `1.0x` normal, `1.2x`).
- 🗂️ **Configurable 3D Flashcards**: Customize session size (10, 25, 50, or custom), flip with Spacebar, listen with "A", and mark learned cards.
- 🎯 **Smart Quizzes**: Configurable question count (5Q, 10Q, 20Q, or custom) testing articles, fill-in-the-blanks, and meanings.
- 💾 **Zero-Backend Browser Database**: Persistent IndexedDB storage (`GoetheVocabDB`) for saved words and study progress without any server requirements.
- 🌓 **Dark & Light Mode**: Automatic system default detection with a manual cycle toggle in the header.

---

## 📂 Datasets

All datasets are available in [`data/`](./data) and [`public/data/`](./public/data):

| Level | CSV (EN & TR) | JSON Dataset | Words | Official Goethe Source |
|---|---|---|---|---|
| **A1** | [`words_a1_tr.csv`](./data/words_a1_tr.csv) | [`words_a1.json`](./data/words_a1.json) | 737 | `A1_SD1_Wortliste_02.pdf` |
| **A2** | [`words_a2_tr.csv`](./data/words_a2_tr.csv) | [`words_a2.json`](./data/words_a2.json) | 1,409 | `Goethe-Zertifikat_A2_Wortliste.pdf` |
| **B1** | [`words_b1_tr.csv`](./data/words_b1_tr.csv) | [`words_b1.json`](./data/words_b1.json) | 3,645 | `Goethe-Zertifikat_B1_Wortliste.pdf` |
| **Master** | [`goethe_vocab_tr.csv`](./data/goethe_vocab_tr.csv) | [`goethe_vocab.json`](./data/goethe_vocab.json) | **5,791** | Consolidated A1 + A2 + B1 |

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

### 3. Build for production (PWA & Static Hosting)
```bash
npm run build
```
The output will be in `dist/`, ready to deploy to **GitHub Pages**, **Vercel**, or **Netlify**.

---

## 📜 Attribution & License

Vocabulary data extracted from official exam wordlists published by the [Goethe-Institut](https://www.goethe.de). Created for educational and personal study purposes.
