with open('public/assessment.html', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('COGNITIVE_QUESTION_BANK = [')
print('start:', start)
if start != -1:
    end = text.find('];', start)
    print('end:', end)
    bank_code = text[start + len('COGNITIVE_QUESTION_BANK = '):end + 1]
    
    # Save JS snippet to scratch/bank.json or evaluate with node
    with open('scratch/bank.js', 'w', encoding='utf-8') as out:
        out.write('const bank = ' + bank_code + ';\nconsole.log(JSON.stringify(bank, null, 2));')
    print('Wrote scratch/bank.js')
