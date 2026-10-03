import re

with open('public/assessment-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add frexor-data.js in head
head_old = """  <script src="js/assessment-features.js"></script>"""

head_new = """  <!-- Extended Features & Role Benchmarks -->
  <script src="js/assessment-features.js"></script>
  <!-- PAS frexor Aptitude Test Data & Engine -->
  <script src="/js/frexor-data.js"></script>"""

assert head_old in content, "Could not find head_old"
content = content.replace(head_old, head_new, 1)

# 2. Update .module-grid CSS to auto-fit
grid_css_old = """.module-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }"""

grid_css_new = """.module-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }"""

assert grid_css_old in content, "Could not find grid_css_old"
content = content.replace(grid_css_old, grid_css_new, 1)

# 3. Add Preset Buttons in Header
preset_old = """          <div class="preset-btns">
            <span style="font-size: 11px; color: #64748B; margin-right: 4px;">Preset Cepat:</span>
            <button type="button" class="preset-btn" onclick="applyModulePreset('all')">Pilih Semua (3)</button>
            <button type="button" class="preset-btn" onclick="applyModulePreset('personality_disc')">Big Five + DISC</button>
            <button type="button" class="preset-btn" onclick="applyModulePreset('disc_cog')">DISC + Logika</button>
            <button type="button" class="preset-btn" onclick="applyModulePreset('cog_only')">Logika Saja</button>
          </div>"""

preset_new = """          <div class="preset-btns">
            <span style="font-size: 11px; color: #64748B; margin-right: 4px;">Preset Cepat:</span>
            <button type="button" class="preset-btn" onclick="applyModulePreset('all')">Pilih Semua (4 Modul)</button>
            <button type="button" class="preset-btn" onclick="applyModulePreset('standard_3')">Standar 3 Modul</button>
            <button type="button" class="preset-btn" onclick="applyModulePreset('frexor_only')" style="border-color: #C7D2FE; color: #4338CA; background: #EEF2FF; font-weight: 700;">⚡ Frexor IQ Saja (60)</button>
            <button type="button" class="preset-btn" onclick="applyModulePreset('disc_cog')">DISC + Logika</button>
          </div>"""

assert preset_old in content, "Could not find preset_old"
content = content.replace(preset_old, preset_new, 1)

# 4. Add Frexor Module Card in .module-grid
mod_cards_old = """          <!-- Cognitive & Business Logic Card -->
          <label class="module-card active" id="cardModuleCognitive">
            <input type="checkbox" id="chkModuleCognitive" checked onchange="updateSelectedModules()">
            <div class="module-info">
              <div class="module-title">
                <span>📊</span> Logika &amp; Bisnis Praktis (15 Soal)
              </div>
              <div class="module-desc">
                Deret Angka, Aritmatika Bisnis, Studi Kasus Komersial &amp; Penalaran Analitis untuk problem solving di dunia kerja nyata.
              </div>
              <span class="module-badge" style="background: #ECFDF5; color: #059669; border: 1px solid #D1FAE5;">15 Pilihan Ganda (A–E)</span>
            </div>
          </label>
        </div>"""

mod_cards_new = """          <!-- Cognitive & Business Logic Card -->
          <label class="module-card active" id="cardModuleCognitive">
            <input type="checkbox" id="chkModuleCognitive" checked onchange="updateSelectedModules()">
            <div class="module-info">
              <div class="module-title">
                <span>📊</span> Logika &amp; Bisnis Praktis (15 Soal)
              </div>
              <div class="module-desc">
                Deret Angka, Aritmatika Bisnis, Studi Kasus Komersial &amp; Penalaran Analitis untuk problem solving di dunia kerja nyata.
              </div>
              <span class="module-badge" style="background: #ECFDF5; color: #059669; border: 1px solid #D1FAE5;">15 Pilihan Ganda (A–E)</span>
            </div>
          </label>

          <!-- PAS Frexor Aptitude Test [IQ] Card -->
          <label class="module-card" id="cardModuleFrexor">
            <input type="checkbox" id="chkModuleFrexor" onchange="updateSelectedModules()">
            <div class="module-info">
              <div class="module-title">
                <span>⚡</span> PAS frexor® Aptitude Test [IQ]
              </div>
              <div class="module-desc">
                Standar resmi tes intelegensi Mensa: 60 soal mencakup Verbal, Spasial/Figural, Numerik &amp; Silogisme Deduktif (30 Menit).
              </div>
              <span class="module-badge" style="background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE;">60 Soal • Timer 30 Mnt • Skala IQ</span>
            </div>
          </label>
        </div>"""

assert mod_cards_old in content, "Could not find mod_cards_old"
content = content.replace(mod_cards_old, mod_cards_new, 1)

# 5. Update applyModulePreset and updateSelectedModules
preset_fn_old = """    function applyModulePreset(preset) {
      const chkBigFive = document.getElementById('chkModuleBigFive');
      const chkDisc = document.getElementById('chkModuleDisc');
      const chkCog = document.getElementById('chkModuleCognitive');

      if (preset === 'all') {
        chkBigFive.checked = true;
        chkDisc.checked = true;
        chkCog.checked = true;
      } else if (preset === 'personality_disc') {
        chkBigFive.checked = true;
        chkDisc.checked = true;
        chkCog.checked = false;
      } else if (preset === 'disc_cog') {
        chkBigFive.checked = false;
        chkDisc.checked = true;
        chkCog.checked = true;
      } else if (preset === 'cog_only') {
        chkBigFive.checked = false;
        chkDisc.checked = false;
        chkCog.checked = true;
      }

      updateSelectedModules();
    }

    function updateSelectedModules() {
      const chkBigFive = document.getElementById('chkModuleBigFive');
      const chkDisc = document.getElementById('chkModuleDisc');
      const chkCog = document.getElementById('chkModuleCognitive');

      const cardBigFive = document.getElementById('cardModuleBigFive');
      const cardDisc = document.getElementById('cardModuleDisc');
      const cardCog = document.getElementById('cardModuleCognitive');

      cardBigFive.classList.toggle('active', chkBigFive.checked);
      cardDisc.classList.toggle('active', chkDisc.checked);
      cardCog.classList.toggle('active', chkCog.checked);

      const mods = [];
      let totalQuestions = 0;
      if (chkBigFive.checked) { mods.push('bigfive'); totalQuestions += 50; }
      if (chkDisc.checked) { mods.push('disc'); totalQuestions += 24; }
      if (chkCog.checked) { mods.push('cognitive'); totalQuestions += 15; }

      if (mods.length === 0) {
        // Prevent all unselected - fallback to at least one
        chkDisc.checked = true;
        cardDisc.classList.add('active');
        mods.push('disc');
        totalQuestions += 24;
        showToast('Minimal 1 modul tes harus diaktifkan.');
      }

      state.selectedModules = mods;"""

preset_fn_new = """    function applyModulePreset(preset) {
      const chkBigFive = document.getElementById('chkModuleBigFive');
      const chkDisc = document.getElementById('chkModuleDisc');
      const chkCog = document.getElementById('chkModuleCognitive');
      const chkFrexor = document.getElementById('chkModuleFrexor');

      if (preset === 'all') {
        chkBigFive.checked = true;
        chkDisc.checked = true;
        chkCog.checked = true;
        if (chkFrexor) chkFrexor.checked = true;
      } else if (preset === 'standard_3') {
        chkBigFive.checked = true;
        chkDisc.checked = true;
        chkCog.checked = true;
        if (chkFrexor) chkFrexor.checked = false;
      } else if (preset === 'frexor_only') {
        chkBigFive.checked = false;
        chkDisc.checked = false;
        chkCog.checked = false;
        if (chkFrexor) chkFrexor.checked = true;
      } else if (preset === 'disc_cog') {
        chkBigFive.checked = false;
        chkDisc.checked = true;
        chkCog.checked = true;
        if (chkFrexor) chkFrexor.checked = false;
      }

      updateSelectedModules();
    }

    function updateSelectedModules() {
      const chkBigFive = document.getElementById('chkModuleBigFive');
      const chkDisc = document.getElementById('chkModuleDisc');
      const chkCog = document.getElementById('chkModuleCognitive');
      const chkFrexor = document.getElementById('chkModuleFrexor');

      const cardBigFive = document.getElementById('cardModuleBigFive');
      const cardDisc = document.getElementById('cardModuleDisc');
      const cardCog = document.getElementById('cardModuleCognitive');
      const cardFrexor = document.getElementById('cardModuleFrexor');

      cardBigFive.classList.toggle('active', chkBigFive.checked);
      cardDisc.classList.toggle('active', chkDisc.checked);
      cardCog.classList.toggle('active', chkCog.checked);
      if (cardFrexor && chkFrexor) cardFrexor.classList.toggle('active', chkFrexor.checked);

      const mods = [];
      let totalQuestions = 0;
      if (chkBigFive.checked) { mods.push('bigfive'); totalQuestions += 50; }
      if (chkDisc.checked) { mods.push('disc'); totalQuestions += 24; }
      if (chkCog.checked) { mods.push('cognitive'); totalQuestions += 15; }
      if (chkFrexor && chkFrexor.checked) { mods.push('frexor'); totalQuestions += 60; }

      if (mods.length === 0) {
        // Prevent all unselected - fallback to at least one
        chkDisc.checked = true;
        cardDisc.classList.add('active');
        mods.push('disc');
        totalQuestions += 24;
        showToast('Minimal 1 modul tes harus diaktifkan.');
      }

      state.selectedModules = mods;"""

assert preset_fn_old in content, "Could not find preset_fn_old"
content = content.replace(preset_fn_old, preset_fn_new, 1)

# 6. Add Frexor row in Leaderboard Table cell 4
lb_cell4_old = """                    </div>
                    ${disc.profilePattern ? `
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 11px; color: #64748B; font-weight: 600; width: 44px;">DISC:</span>
                        <span style="display: inline-flex; align-items: center; gap: 4px; background: #F5F3FF; border: 1px solid #DDD6FE; padding: 2px 7px; border-radius: 5px; font-size: 11px; font-weight: 700; color: #7C3AED; font-family: var(--font-mono);">
                          Tipe ${discPattern} <span style="font-weight: 500; font-family: var(--font-sans); color: #6D28D9; font-size: 10.5px;">(${discName})</span>
                        </span>
                      </div>
                    ` : ''}
                  </div>
                </td>"""

lb_cell4_new = """                    </div>
                    ${disc.profilePattern ? `
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 11px; color: #64748B; font-weight: 600; width: 44px;">DISC:</span>
                        <span style="display: inline-flex; align-items: center; gap: 4px; background: #F5F3FF; border: 1px solid #DDD6FE; padding: 2px 7px; border-radius: 5px; font-size: 11px; font-weight: 700; color: #7C3AED; font-family: var(--font-mono);">
                          Tipe ${discPattern} <span style="font-weight: 500; font-family: var(--font-sans); color: #6D28D9; font-size: 10.5px;">(${discName})</span>
                        </span>
                      </div>
                    ` : ''}
                    ${assessment.frexor && assessment.frexor.iq_estimate ? `
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 11px; color: #4338CA; font-weight: 700; width: 44px;">IQ [⚡]:</span>
                        <span style="display: inline-flex; align-items: center; gap: 4px; background: #EEF2FF; border: 1px solid #C7D2FE; padding: 2px 7px; border-radius: 5px; font-size: 11px; font-weight: 700; color: #312E81; font-family: var(--font-mono);">
                          IQ ${assessment.frexor.iq_estimate} <span style="font-weight: 600; font-family: var(--font-sans); color: #4338CA; font-size: 10px;">(${assessment.frexor.score}/60 • ${assessment.frexor.category})</span>
                        </span>
                      </div>
                    ` : ''}
                  </div>
                </td>"""

assert lb_cell4_old in content, "Could not find lb_cell4_old"
content = content.replace(lb_cell4_old, lb_cell4_new, 1)

# 7. Add Frexor Dossier Card in Tab 1 (Table drawer)
tab1_old = """      ${assessment.cognitive ? `
        <div class="dossier-subcard" style="margin-top: 14px;">
          <div class="dossier-subcard-title" style="color:#059669;">
            <span style="display:flex; align-items:center; gap:6px;"><span>📊</span> Aspek Logika, Penalaran Kognitif &amp; Analisis Bisnis</span>
            <span style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:#059669; background:#ECFDF5; border:1px solid #A7F3D0; padding:2px 8px; border-radius:4px;">
              Total Skor: ${assessment.cognitive.score} / ${assessment.cognitive.total} (${assessment.cognitive.percentage}%)
            </span>
          </div>
          ${renderCognitiveAspectsBarsHtml(assessment.cognitive)}
        </div>
      ` : ''}
    </div>

    <!-- SEKSI 2: PANDUAN PERTANYAAN WAWANCARA (PROBING) -->"""

tab1_new = """      ${assessment.cognitive ? `
        <div class="dossier-subcard" style="margin-top: 14px;">
          <div class="dossier-subcard-title" style="color:#059669;">
            <span style="display:flex; align-items:center; gap:6px;"><span>📊</span> Aspek Logika, Penalaran Kognitif &amp; Analisis Bisnis</span>
            <span style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:#059669; background:#ECFDF5; border:1px solid #A7F3D0; padding:2px 8px; border-radius:4px;">
              Total Skor: ${assessment.cognitive.score} / ${assessment.cognitive.total} (${assessment.cognitive.percentage}%)
            </span>
          </div>
          ${renderCognitiveAspectsBarsHtml(assessment.cognitive)}
        </div>
      ` : ''}

      ${(assessment.frexor && typeof renderFrexorDossierHtml === 'function') ? `
        <div style="margin-top: 14px;">
          ${renderFrexorDossierHtml(assessment.frexor)}
        </div>
      ` : ''}
    </div>

    <!-- SEKSI 2: PANDUAN PERTANYAAN WAWANCARA (PROBING) -->"""

assert tab1_old in content, "Could not find tab1_old"
content = content.replace(tab1_old, tab1_new, 1)

# 8. Add Frexor Dossier Card in Card view (Tab 1)
card_tab1_old = """      ${assessment.cognitive ? `
        <div class="dossier-subcard" style="margin-top: 14px;">
          <div class="dossier-subcard-title" style="color:#059669;">
            <span style="display:flex; align-items:center; gap:6px;"><span>📊</span> Aspek Logika, Penalaran Kognitif &amp; Analisis Bisnis</span>
            <span style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:#059669; background:#ECFDF5; border:1px solid #A7F3D0; padding:2px 8px; border-radius:4px;">
              Total Skor: ${assessment.cognitive.score} / ${assessment.cognitive.total} (${assessment.cognitive.percentage}%)
            </span>
          </div>
          ${renderCognitiveAspectsBarsHtml(assessment.cognitive)}
        </div>
      ` : ''}
    </div>

    <!-- SEKSI 2: PANDUAN PERTANYAAN WAWANCARA (PROBING) -->"""

# Notice this pattern also exists for the card view!
if card_tab1_old in content:
    content = content.replace(card_tab1_old, tab1_new, 1)

# 9. Add Frexor Card in showAssessmentResultModal
modal_old = """      // 3. Cognitive Aspect Bars
      let cogCardHtml = '';
      if (assessment.cognitive) {
        cogCardHtml = `
          <div class="report-card" style="grid-column: 1 / -1;">
            <div class="report-card-title" style="display: flex; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>📊</span> <span>Aspek Logika, Kognitif &amp; Bisnis Praktis</span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: #059669;">
                Skor Akhir: ${assessment.cognitive.score} / ${assessment.cognitive.total} (${assessment.cognitive.percentage}%)
              </span>
            </div>
            ${renderCognitiveAspectsBarsHtml(assessment.cognitive)}
          </div>
        `;
      }

      body.innerHTML = `
        <div class="report-grid-3col">
          ${bigFiveCardHtml}
          ${discCardHtml}
          ${cogCardHtml}
        </div>
      `;"""

modal_new = """      // 3. Cognitive Aspect Bars
      let cogCardHtml = '';
      if (assessment.cognitive) {
        cogCardHtml = `
          <div class="report-card" style="grid-column: 1 / -1;">
            <div class="report-card-title" style="display: flex; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>📊</span> <span>Aspek Logika, Kognitif &amp; Bisnis Praktis</span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: #059669;">
                Skor Akhir: ${assessment.cognitive.score} / ${assessment.cognitive.total} (${assessment.cognitive.percentage}%)
              </span>
            </div>
            ${renderCognitiveAspectsBarsHtml(assessment.cognitive)}
          </div>
        `;
      }

      // 4. Frexor IQ Card
      let frexorCardHtml = '';
      if (assessment.frexor && typeof renderFrexorDossierHtml === 'function') {
        frexorCardHtml = `
          <div style="grid-column: 1 / -1;">
            ${renderFrexorDossierHtml(assessment.frexor)}
          </div>
        `;
      }

      body.innerHTML = `
        <div class="report-grid-3col">
          ${bigFiveCardHtml}
          ${discCardHtml}
          ${cogCardHtml}
          ${frexorCardHtml}
        </div>
      `;"""

assert modal_old in content, "Could not find modal_old"
content = content.replace(modal_old, modal_new, 1)

with open('public/assessment-portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated public/assessment-portal.html!")
