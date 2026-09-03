import json, csv, os, sys, shutil, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from deep_translator import GoogleTranslator

sys.stdout.reconfigure(encoding='utf-8')

CACHE_FILE = 'data/cache_ar.json'
cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
        print(f"Loaded {len(cache)} cached Arabic translations.")
    except Exception:
        cache = {}

with open('data/goethe_vocab.json', 'r', encoding='utf-8') as f:
    vocab = json.load(f)

print(f"Total vocabulary items: {len(vocab)}")

to_translate = []
for item in vocab:
    w = item['word'].strip()
    if w and w not in cache:
        to_translate.append(w)

unique_to_translate = list(set(to_translate))
print(f"Unique words to translate into Arabic: {len(unique_to_translate)}")

def translate_item(word_str):
    t = GoogleTranslator(source='de', target='ar')
    query = word_str.strip().rstrip(',')
    for attempt in range(3):
        try:
            res = t.translate(query)
            if res:
                return word_str, res.strip()
        except Exception:
            time.sleep(0.5)
    return word_str, word_str

if unique_to_translate:
    print("Translating words into Arabic with thread pool...")
    count = 0
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(translate_item, w): w for w in unique_to_translate}
        for future in as_completed(futures):
            w_orig, trans = future.result()
            cache[w_orig] = trans
            count += 1
            if count % 250 == 0 or count == len(unique_to_translate):
                print(f"Progress: {count}/{len(unique_to_translate)} ({count/len(unique_to_translate)*100:.1f}%)")
                with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                    json.dump(cache, f, ensure_ascii=False, indent=2)

    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    print("Arabic translations cached successfully.")

# Attach meaning_ar to all vocabulary entries
for item in vocab:
    w = item['word'].strip()
    item['meaning_ar'] = cache.get(w, w)

# Save updated JSONs
with open('data/goethe_vocab.json', 'w', encoding='utf-8') as f:
    json.dump(vocab, f, ensure_ascii=False, indent=2)

a1_words = [x for x in vocab if x['level'] == 'A1']
a2_words = [x for x in vocab if x['level'] == 'A2']
b1_words = [x for x in vocab if x['level'] == 'B1']

with open('data/words_a1.json', 'w', encoding='utf-8') as f:
    json.dump(a1_words, f, ensure_ascii=False, indent=2)
with open('data/words_a2.json', 'w', encoding='utf-8') as f:
    json.dump(a2_words, f, ensure_ascii=False, indent=2)
with open('data/words_b1.json', 'w', encoding='utf-8') as f:
    json.dump(b1_words, f, ensure_ascii=False, indent=2)

def save_csv(data, path):
    with open(path, 'w', encoding='utf-8-sig', newline='') as f:
        fieldnames = ['id', 'level', 'word', 'meaning_en', 'meaning_tr', 'meaning_es', 'meaning_ar', 'full_entry', 'article', 'pos', 'plural', 'forms', 'examples', 'page']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for item in data:
            row = dict(item)
            row['examples'] = ' || '.join(item.get('examples', []))
            writer.writerow(row)

# Save updated master and level-split CSVs with meaning_ar
save_csv(vocab, 'data/goethe_vocab.csv')
save_csv(vocab, 'data/goethe_vocab_ar.csv')

save_csv(a1_words, 'data/words_a1.csv')
save_csv(a1_words, 'data/words_a1_ar.csv')

save_csv(a2_words, 'data/words_a2.csv')
save_csv(a2_words, 'data/words_a2_ar.csv')

save_csv(b1_words, 'data/words_b1.csv')
save_csv(b1_words, 'data/words_b1_ar.csv')

# Ensure public/data directory exists
os.makedirs('public/data', exist_ok=True)

# Copy all to public/data
for filename in [
    'goethe_vocab.json', 'words_a1.json', 'words_a2.json', 'words_b1.json',
    'goethe_vocab.csv', 'goethe_vocab_en.csv', 'goethe_vocab_tr.csv', 'goethe_vocab_es.csv', 'goethe_vocab_ar.csv',
    'words_a1.csv', 'words_a1_en.csv', 'words_a1_tr.csv', 'words_a1_es.csv', 'words_a1_ar.csv',
    'words_a2.csv', 'words_a2_en.csv', 'words_a2_tr.csv', 'words_a2_es.csv', 'words_a2_ar.csv',
    'words_b1.csv', 'words_b1_en.csv', 'words_b1_tr.csv', 'words_b1_es.csv', 'words_b1_ar.csv'
]:
    if os.path.exists(f'data/{filename}'):
        shutil.copy(f'data/{filename}', f'public/data/{filename}')

print("All datasets enriched with Arabic translations and synced to public/data!")
