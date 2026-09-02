import json, re, csv

with open('data/goethe_vocab.json', encoding='utf-8') as f_in:
    raw_data = json.load(f_in)

merged = []
for item in raw_data:
    w = item['word'].strip()
    if not w or w in ['-', '–', '—']:
        continue
    w = re.sub(r'\s+[1-9]\d*\.?$', '', w)
    item['word'] = w
    if re.match(r'^[1-9]\d*\.?$', w):
        if merged:
            merged[-1]['examples'].extend(item['examples'])
        continue
    if any(w.startswith(p) for p in ['hat ', 'ist ', 'hat/ist ', 'wird ']):
        if merged:
            pf = merged[-1]['forms']
            merged[-1]['forms'] = (pf + ', ' + w).strip(', ')
            merged[-1]['examples'].extend(item['examples'])
        continue
    if (w.startswith('-') or w.startswith('¨-')) and len(w) <= 8:
        if merged:
            merged[-1]['plural'] = w
            merged[-1]['examples'].extend(item['examples'])
        continue
    dedup_ex = []
    for ex in item['examples']:
        ec = ex.strip()
        if ec and ec not in dedup_ex:
            dedup_ex.append(ec)
    item['examples'] = dedup_ex
    merged.append(item)

lvl_counts = {}
for item in merged:
    lvl = item['level']
    lvl_counts[lvl] = lvl_counts.get(lvl, 0) + 1
    item['id'] = lvl.lower() + '_' + str(lvl_counts[lvl]).zfill(4)

a1_words = [x for x in merged if x['level'] == 'A1']
a2_words = [x for x in merged if x['level'] == 'A2']
b1_words = [x for x in merged if x['level'] == 'B1']

with open('data/words_a1.json', 'w', encoding='utf-8') as f1:
    json.dump(a1_words, f1, ensure_ascii=False, indent=2)
with open('data/words_a2.json', 'w', encoding='utf-8') as f2:
    json.dump(a2_words, f2, ensure_ascii=False, indent=2)
with open('data/words_b1.json', 'w', encoding='utf-8') as f3:
    json.dump(b1_words, f3, ensure_ascii=False, indent=2)
with open('data/goethe_vocab.json', 'w', encoding='utf-8') as f_all:
    json.dump(merged, f_all, ensure_ascii=False, indent=2)

with open('data/goethe_vocab.csv', 'w', encoding='utf-8-sig', newline='') as f_csv:
    fieldnames = ['id', 'level', 'word', 'full_entry', 'article', 'pos', 'plural', 'forms', 'examples', 'page']
    writer = csv.DictWriter(f_csv, fieldnames=fieldnames)
    writer.writeheader()
    for item in merged:
        row = dict(item)
        row['examples'] = ' || '.join(item['examples'])
        writer.writerow(row)

print('Normalization complete! Counts:', lvl_counts)
