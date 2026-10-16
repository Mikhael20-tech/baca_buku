from korean_romanizer.romanizer import Romanizer
import sys

sys.stdout.reconfigure(encoding='utf-8')

sample_lines = [
    "성부 성자 성령님께 영광 돌리세",
    "영원토록 영광 돌려 하나님께",
    "온 우주 만물 지으심을 볼 때에",
    "그 지혜로움 참으로 묘하도다"
]

for line in sample_lines:
    r = Romanizer(line)
    roman = r.romanize()
    print("Hangul :", line)
    print("Roman  :", roman)
    print()
