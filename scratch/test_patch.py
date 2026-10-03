import sys
import os
sys.path.append(os.path.abspath('scratch'))

with open('public/assessment-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

import update_portal_html as up

checks = [
    ('head', '  <script src="js/assessment-features.js"></script>' in content),
    ('grid_css', up.grid_css_old in content),
    ('preset', up.preset_old in content),
    ('mod_cards', up.mod_cards_old in content),
    ('preset_fn', up.preset_fn_old in content),
    ('lb_cell4', up.lb_cell4_old in content),
    ('tab1', up.tab1_old in content),
    ('modal', up.modal_old in content)
]

for name, res in checks:
    print(f'{name}: {res}')
