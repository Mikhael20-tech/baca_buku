import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

line1 = "Dengan perantaraan Silwanus yang kuanggap sebagai seorang saudara seiman yang dapat dipercayai, ku menulis dengan singkat kepada kamu"
line2 = "untuk menasihati dan 1cmeyakinkan kamu bahwa ini adalah 2anugerah yang benar-benar dari Allah. Berdirilah dengan teguh di dalamnya!"

full_v = line1 + " " + line2
print("Full verse:", full_v)

# Test our new marker processing on full_v
from test_transform_v23 import transform_verse

clean_t, marked_t, kw_map = transform_verse(full_v)
print("\nClean :", clean_t)
print("Marked:", marked_t)
print("KW    :", kw_map)
