import json, csv, os, shutil

def export_level_csv(json_path, csv_path):
    with open(json_path, encoding='utf-8') as f:
        data = json.load(f)
    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        fieldnames = ['id', 'level', 'word', 'full_entry', 'article', 'pos', 'plural', 'forms', 'examples', 'page']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for item in data:
            row = dict(item)
            row['examples'] = ' || '.join(item['examples'])
            writer.writerow(row)
    print(f'Exported {len(data)} entries to {csv_path}')

export_level_csv('data/words_a1.json', 'data/words_a1.csv')
export_level_csv('data/words_a2.json', 'data/words_a2.csv')
export_level_csv('data/words_b1.json', 'data/words_b1.csv')

# Copy to public/data
for f in ['words_a1.csv', 'words_a2.csv', 'words_b1.csv']:
    shutil.copy(f'data/{f}', f'public/data/{f}')
    print(f'Copied to public/data/{f}')
