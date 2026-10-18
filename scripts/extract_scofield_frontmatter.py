import pymupdf
import json
import re

doc = pymupdf.open('Alkitab/scofieldreferenc0000revc.pdf')

def clean_text(text):
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\ufffd', "'")
    
    # Fix hyphenated words at line breaks
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    
    # Split into lines
    lines = text.split('\n')
    paragraphs = []
    curr = []
    for l in lines:
        stripped = l.strip()
        if not stripped:
            if curr:
                paragraphs.append(' '.join(curr))
                curr = []
        else:
            curr.append(stripped)
    if curr:
        paragraphs.append(' '.join(curr))
    
    cleaned_paras = []
    for p in paragraphs:
        p = re.sub(r'[ \t]+', ' ', p)
        cleaned_paras.append(p)
    return '\n\n'.join(cleaned_paras)

# 1. Introduction (PDF Page 7 to top of 8, index 6-7)
p7 = doc[6].get_text()
p8 = doc[7].get_text()

intro_start = p7.find('INTRODUCTION.')
pref_start = p8.find('PREFACE TO THE PRESENT EDITION.')

intro_raw = p7[intro_start:] + '\n\n' + p8[:pref_start]
preface_raw = p8[pref_start:]

# 2. Panoramic View (PDF Page 9-10, index 8-9)
p9 = doc[8].get_text()
p10 = doc[9].get_text()
pan_start = p9.find('A PANORAMIC VIEW OF THE BIBLE.')
pan_end = p10.find('THE NAMES AND ORDER')
pan_raw = p9[pan_start:] + '\n\n' + (p10[:pan_end] if pan_end != -1 else p10)

# 3. The Pentateuch (PDF Page 12, index 11)
p12 = doc[11].get_text()
pent_start = p12.find('THE PENTATEUCH.')
pent_raw = p12[pent_start:]

data = {
    'introduction': clean_text(intro_raw),
    'preface': clean_text(preface_raw),
    'panoramic_view': clean_text(pan_raw),
    'the_pentateuch': clean_text(pent_raw)
}

with open('public/bible/scofield/frontmatter_scofield_1917.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved cleanly to public/bible/scofield/frontmatter_scofield_1917.json")
