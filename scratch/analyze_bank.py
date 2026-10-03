import json

try:
    with open('scratch/cognitive_bank.json', 'r', encoding='utf-16') as f:
        bank = json.load(f)
except Exception:
    with open('scratch/cognitive_bank.json', 'r', encoding='utf-8') as f:
        bank = json.load(f)

print(f"Total Questions in Bank: {len(bank)}")

categories = {}
for idx, q in enumerate(bank):
    cat = q.get('category', 'Unknown')
    categories[cat] = categories.get(cat, [])
    categories[cat].append((idx, q))

print("\nCategories breakdown:")
for cat, items in categories.items():
    print(f"  - {cat}: {len(items)} questions")

with open('scratch/bank_summary.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total Questions in Bank: {len(bank)}\n")
    for cat, items in categories.items():
        out.write(f"\n==================================================\n")
        out.write(f"### CATEGORY: {cat} ({len(items)} questions)\n")
        out.write(f"==================================================\n")
        for idx, q in items:
            out.write(f"\n[{q['id']}] Q: {q['question']}\n")
            out.write(f"    Options: {q['options']}\n")
            out.write(f"    Correct: {q['correct_answer']}\n")
            out.write(f"    Explanation: {q['explanation']}\n")

print("Wrote scratch/bank_summary.txt")
