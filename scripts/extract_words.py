# Refined Goethe German Vocabulary Extractor (A1, A2, B1)
import os, sys, re, json, csv, pdfplumber
sys.stdout.reconfigure(encoding='utf-8')

def clean_text(text: str) -> str:
    if not text:
        return ''
    text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)
    text = text.replace('\xa0', ' ').replace('\xad', '')
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def detect_pos_and_article(headword: str):
    hw = headword.strip()
    article = None
    pos = 'other'
    plural = None

    m_noun = re.match(r'^(der|die|das)\s+([A-ZÄÖÜ][\w\s\-\/(,)&\.]+?)(?:,\s*(.+))?$', hw)
    if m_noun:
        article = m_noun.group(1)
        pos = 'noun'
        plural = m_noun.group(3) if m_noun.group(3) else None
        return article, pos, plural

    for art in ['der', 'die', 'das']:
        if hw.startswith(art + ' '):
            article = art
            pos = 'noun'
            return article, pos, plural

    if hw.startswith('(sich)') or hw.startswith('sich ') or hw.endswith('en') or hw.endswith('eln') or hw.endswith('ern'):
        if not hw[0].isupper():
            pos = 'verb'
            return article, pos, plural

    first_word = hw.split()[0].rstrip(',').rstrip('-') if hw else ''
    if first_word.islower():
        if any(first_word.endswith(s) for s in ['lich', 'ig', 'isch', 'bar', 'sam', 'voll', 'arm', 'frei']):
            pos = 'adjective'
        elif first_word in ['in', 'an', 'auf', 'aus', 'bei', 'mit', 'nach', 'von', 'zu', 'über', 'unter', 'vor', 'hinter', 'neben', 'zwischen', 'durch', 'für', 'gegen', 'ohne', 'um', 'ab', 'seit']:
            pos = 'preposition'
        elif first_word in ['und', 'aber', 'oder', 'denn', 'weil', 'dass', 'da', 'ob', 'wenn', 'als', 'obwohl', 'sondern']:
            pos = 'conjunction'
        elif first_word in ['heute', 'morgen', 'gestern', 'hier', 'dort', 'immer', 'oft', 'nie', 'sehr', 'schon', 'jetzt', 'bald', 'gerne', 'gern', 'leider', 'vielleicht', 'zusammen']:
            pos = 'adverb'
        else:
            pos = 'word'
    elif hw and hw[0].isupper():
        pos = 'noun'

    return article, pos, plural

def split_examples(raw_text: str):
    cleaned = clean_text(raw_text)
    if not cleaned:
        return []
    if re.search(r'\b[1-9]\.\s+', cleaned):
        parts = re.split(r'\b[1-9]\.\s+', cleaned)
        res = [clean_text(p) for p in parts if clean_text(p)]
        return res
    parts = re.split(r'(?<=[.!?])\s+(?=[A-ZÄÖÜ]|\-|\–|\—)', cleaned)
    res = [clean_text(p) for p in parts if clean_text(p)]
    return res if res else [cleaned]

def group_words_by_line(word_items, line_tol=3.5):
    if not word_items:
        return []
    sorted_words = sorted(word_items, key=lambda w: (round(w['top'] / 4) * 4, w['x0']))
    lines = []
    curr = []
    curr_top = -100
    for w in sorted_words:
        if abs(w['top'] - curr_top) > line_tol:
            if curr:
                lines.append({
                    'top': min(cw['top'] for cw in curr),
                    'bottom': max(cw['bottom'] for cw in curr),
                    'text': ' '.join(cw['text'] for cw in curr)
                })
            curr = [w]
            curr_top = w['top']
        else:
            curr.append(w)
    if curr:
        lines.append({
            'top': min(cw['top'] for cw in curr),
            'bottom': max(cw['bottom'] for cw in curr),
            'text': ' '.join(cw['text'] for cw in curr)
        })
    return lines

def extract_a1():
    words_list = []
    pdf_path = 'data/raw/A1.pdf'
    if not os.path.exists(pdf_path):
        return []

    print('Parsing A1.pdf...')
    with pdfplumber.open(pdf_path) as pdf:
        for page_idx in range(8, len(pdf.pages)):
            page = pdf.pages[page_idx]
            w, h = page.width, page.height
            words = page.extract_words(y_tolerance=3, x_tolerance=3)
            words = [wd for wd in words if 60 < wd['top'] < h - 45]
            if not words:
                continue

            left_words = [wd for wd in words if wd['x0'] < 215]
            right_words = [wd for wd in words if wd['x0'] >= 215]

            left_lines = group_words_by_line(left_words, line_tol=3.5)
            right_lines = group_words_by_line(right_words, line_tol=3.5)

            filtered_left = []
            for item in left_lines:
                t = clean_text(item['text'])
                if len(t) <= 1 and t.isupper():
                    continue
                if any(t.lower().startswith(x) for x in ['inventare', 'alphabetische', 'wortliste', 'vs_02', 'seite']):
                    continue
                filtered_left.append(item)

            for i, lw in enumerate(filtered_left):
                head_text = clean_text(lw['text'])
                next_top = filtered_left[i+1]['top'] if i + 1 < len(filtered_left) else h - 45
                
                # Match right lines
                matching_exs = [
                    rw['text'] for rw in right_lines
                    if (lw['top'] - 5.0) <= rw['top'] < (next_top - 2.5)
                ]

                raw_ex = ' '.join(matching_exs)
                examples = split_examples(raw_ex)
                article, pos, plural = detect_pos_and_article(head_text)
                
                forms = ''
                if ',' in head_text and pos == 'verb':
                    parts = head_text.split(',', 1)
                    head_base = parts[0].strip()
                    forms = parts[1].strip()
                else:
                    head_base = head_text

                words_list.append({
                    'id': f'a1_{len(words_list)+1:04d}',
                    'level': 'A1',
                    'word': head_base,
                    'full_entry': head_text,
                    'article': article,
                    'pos': pos,
                    'plural': plural,
                    'forms': forms,
                    'examples': examples,
                    'page': page_idx + 1
                })

    print(f'Extracted {len(words_list)} entries from A1.')
    return words_list

def extract_a2():
    words_list = []
    pdf_path = 'data/raw/A2.pdf'
    if not os.path.exists(pdf_path):
        return []

    print('Parsing A2.pdf...')
    with pdfplumber.open(pdf_path) as pdf:
        for page_idx in range(7, len(pdf.pages)):
            page = pdf.pages[page_idx]
            w, h = page.width, page.height
            mid_x = w / 2

            all_words = page.extract_words(y_tolerance=3, x_tolerance=3)
            all_words = [wd for wd in all_words if 55 < wd['top'] < h - 45]

            columns = [
                (30, 105, 105, mid_x),
                (mid_x, mid_x + 75, mid_x + 75, w - 20)
            ]

            for w_min, w_max, e_min, e_max in columns:
                col_words = [wd for wd in all_words if w_min <= wd['x0'] < w_max]
                col_exs = [wd for wd in all_words if e_min <= wd['x0'] < e_max]

                left_lines = group_words_by_line(col_words, line_tol=3.5)
                right_lines = group_words_by_line(col_exs, line_tol=3.5)

                filtered_left = []
                for item in left_lines:
                    t = clean_text(item['text'])
                    if len(t) <= 1 and t.isupper():
                        continue
                    if any(t.lower().startswith(x) for x in ['wortliste', 'goethe', 'a2_', 'seite']):
                        continue
                    filtered_left.append(item)

                for i, lw in enumerate(filtered_left):
                    head_text = clean_text(lw['text'])
                    next_top = filtered_left[i+1]['top'] if i + 1 < len(filtered_left) else h - 45
                    
                    matching_exs = [
                        rw['text'] for rw in right_lines
                        if (lw['top'] - 5.5) <= rw['top'] < (next_top - 2.5)
                    ]

                    raw_ex = ' '.join(matching_exs)
                    examples = split_examples(raw_ex)
                    article, pos, plural = detect_pos_and_article(head_text)

                    forms = ''
                    if ',' in head_text and pos == 'verb':
                        parts = head_text.split(',', 1)
                        head_base = parts[0].strip()
                        forms = parts[1].strip()
                    else:
                        head_base = head_text

                    words_list.append({
                        'id': f'a2_{len(words_list)+1:04d}',
                        'level': 'A2',
                        'word': head_base,
                        'full_entry': head_text,
                        'article': article,
                        'pos': pos,
                        'plural': plural,
                        'forms': forms,
                        'examples': examples,
                        'page': page_idx + 1
                    })

    print(f'Extracted {len(words_list)} entries from A2.')
    return words_list

def extract_b1():
    words_list = []
    pdf_path = 'data/raw/B1.pdf'
    if not os.path.exists(pdf_path):
        return []

    print('Parsing B1.pdf...')
    with pdfplumber.open(pdf_path) as pdf:
        for page_idx in range(15, len(pdf.pages)):
            page = pdf.pages[page_idx]
            w, h = page.width, page.height
            mid_x = w / 2

            all_words = page.extract_words(y_tolerance=3, x_tolerance=3)
            all_words = [wd for wd in all_words if 55 < wd['top'] < h - 45]

            columns = [
                (25, 138, 138, mid_x),
                (mid_x - 10, mid_x + 118, mid_x + 118, w - 15)
            ]

            for w_min, w_max, e_min, e_max in columns:
                col_words = [wd for wd in all_words if w_min <= wd['x0'] < w_max]
                col_exs = [wd for wd in all_words if e_min <= wd['x0'] < e_max]

                left_lines = group_words_by_line(col_words, line_tol=3.5)
                right_lines = group_words_by_line(col_exs, line_tol=3.5)

                filtered_left = []
                for item in left_lines:
                    t = clean_text(item['text'])
                    if len(t) <= 1 and t.isupper():
                        continue
                    if any(t.lower().startswith(x) for x in ['zertifikat', 'wortliste', 'vs_03', 'seite']):
                        continue
                    filtered_left.append(item)

                for i, lw in enumerate(filtered_left):
                    head_text = clean_text(lw['text'])
                    next_top = filtered_left[i+1]['top'] if i + 1 < len(filtered_left) else h - 45
                    
                    matching_exs = [
                        rw['text'] for rw in right_lines
                        if (lw['top'] - 5.5) <= rw['top'] < (next_top - 2.5)
                    ]

                    raw_ex = ' '.join(matching_exs)
                    examples = split_examples(raw_ex)
                    article, pos, plural = detect_pos_and_article(head_text)

                    forms = ''
                    if ',' in head_text and pos == 'verb':
                        parts = head_text.split(',', 1)
                        head_base = parts[0].strip()
                        forms = parts[1].strip()
                    else:
                        head_base = head_text

                    words_list.append({
                        'id': f'b1_{len(words_list)+1:04d}',
                        'level': 'B1',
                        'word': head_base,
                        'full_entry': head_text,
                        'article': article,
                        'pos': pos,
                        'plural': plural,
                        'forms': forms,
                        'examples': examples,
                        'page': page_idx + 1
                    })

    print(f'Extracted {len(words_list)} entries from B1.')
    return words_list

def main():
    os.makedirs('data', exist_ok=True)
    words_a1 = extract_a1()
    words_a2 = extract_a2()
    words_b1 = extract_b1()

    with open('data/words_a1.json', 'w', encoding='utf-8') as f:
        json.dump(words_a1, f, ensure_ascii=False, indent=2)
    with open('data/words_a2.json', 'w', encoding='utf-8') as f:
        json.dump(words_a2, f, ensure_ascii=False, indent=2)
    with open('data/words_b1.json', 'w', encoding='utf-8') as f:
        json.dump(words_b1, f, ensure_ascii=False, indent=2)

    all_words = words_a1 + words_a2 + words_b1
    print(f'\nTotal vocabulary extracted across all levels: {len(all_words)}')

    with open('data/goethe_vocab.json', 'w', encoding='utf-8') as f:
        json.dump(all_words, f, ensure_ascii=False, indent=2)

    csv_file = 'data/goethe_vocab.csv'
    with open(csv_file, 'w', encoding='utf-8-sig', newline='') as f:
        fieldnames = ['id', 'level', 'word', 'full_entry', 'article', 'pos', 'plural', 'forms', 'examples', 'page']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for item in all_words:
            row = dict(item)
            row['examples'] = ' || '.join(item['examples'])
            writer.writerow(row)

    print('Successfully generated data files in data/')

if __name__ == '__main__':
    main()
