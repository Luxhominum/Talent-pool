import re

with open('public/assessment.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update init() to start Frexor timer if enabled
init_old = """      renderQuestions();
      updateProgress();"""

init_new = """      renderQuestions();
      updateProgress();

      if (enabledTests.includes('frexor')) {
        initFrexorTimer();
      }"""

assert init_old in content, "Could not find init_old"
content = content.replace(init_old, init_new, 1)

# 2. Update getActiveQuestions() to include frexor
get_active_old = """      if (enabledTests.includes('cognitive')) {
        COGNITIVE_QUESTIONS.forEach((q, idx) => {
          list.push({ ...q, _type: 'cognitive', _num: idx + 1 });
        });
      }
      return list;"""

get_active_new = """      if (enabledTests.includes('cognitive')) {
        COGNITIVE_QUESTIONS.forEach((q, idx) => {
          list.push({ ...q, _type: 'cognitive', _num: idx + 1 });
        });
      }
      if (enabledTests.includes('frexor')) {
        (window.FREXOR_QUESTIONS || []).forEach((q, idx) => {
          list.push({ ...q, _type: 'frexor', _num: idx + 1 });
        });
      }
      return list;"""

assert get_active_old in content, "Could not find get_active_old"
content = content.replace(get_active_old, get_active_new, 1)

# 3. Update renderQuestions() activeModules
mod_old = """      const hasBigFive = enabledTests.includes('bigfive');
      const hasDisc = enabledTests.includes('disc');
      const hasCognitive = enabledTests.includes('cognitive');

// 1. Build list of active modules in consistent sequence: Big Five -> DISC -> Cognitive
      const activeModules = [];"""

mod_new = """      const hasBigFive = enabledTests.includes('bigfive');
      const hasDisc = enabledTests.includes('disc');
      const hasCognitive = enabledTests.includes('cognitive');
      const hasFrexor = enabledTests.includes('frexor');

// 1. Build list of active modules in consistent sequence: Big Five -> DISC -> Cognitive -> Frexor
      const activeModules = [];"""

assert mod_old in content, "Could not find mod_old"
content = content.replace(mod_old, mod_new, 1)

# 4. Add frexor to activeModules definition
active_mod_old = """      if (hasCognitive) {
        activeModules.push({
          key: 'cognitive',
          title: 'Tes Logika, Kognitif & Bisnis Praktis',
          countText: '15 Soal Pilihan Ganda',
          estTime: '15–20 Menit',
          icon: '📊',
          accentColor: '#059669',
          tagBg: '#ECFDF5',
          borderColor: '#059669',
          subtitle: 'Penalaran numerik, kalkulasi komersial & pemecahan masalah bisnis • Pilihan Ganda A–E'
        });
      }

      const totalModules = activeModules.length;"""

active_mod_new = """      if (hasCognitive) {
        activeModules.push({
          key: 'cognitive',
          title: 'Tes Logika, Kognitif & Bisnis Praktis',
          countText: '15 Soal Pilihan Ganda',
          estTime: '15–20 Menit',
          icon: '📊',
          accentColor: '#059669',
          tagBg: '#ECFDF5',
          borderColor: '#059669',
          subtitle: 'Penalaran numerik, kalkulasi komersial & pemecahan masalah bisnis • Pilihan Ganda A–E'
        });
      }
      if (hasFrexor) {
        activeModules.push({
          key: 'frexor',
          title: 'PAS frexor® Aptitude Test [IQ]',
          countText: '60 Soal',
          estTime: '30 Menit (Batas Waktu Ketat)',
          icon: '⚡',
          accentColor: '#4338CA',
          tagBg: '#EEF2FF',
          borderColor: '#4338CA',
          subtitle: 'Standar resmi tes intelegensi Mensa: Penalaran Verbal, Analogi Spasial, Deret & Logika Deduktif • Skala IQ'
        });
      }

      const totalModules = activeModules.length;"""

assert active_mod_old in content, "Could not find active_mod_old"
content = content.replace(active_mod_old, active_mod_new, 1)

# 5. Add rendering for Frexor section right after cognitive section rendering
cog_end_old = """          container.appendChild(card);
        });
      }
    }

        function escapeHtml(str) {"""

frexor_render_block = """          container.appendChild(card);
        });
      }

      // --- SECTION: FREXOR APTITUDE TEST [IQ] ---
      if (hasFrexor) {
        partCounter++;
        const mod = activeModules.find(m => m.key === 'frexor');
        const partLabel = totalModules > 1 ? `BAGIAN ${partCounter} DARI ${totalModules} • PAS FREXOR® APTITUDE TEST [IQ]` : 'PAS FREXOR® APTITUDE TEST [IQ]';

        const frexorBriefing = document.createElement('div');
        frexorBriefing.className = 'section-briefing-card';
        frexorBriefing.style.borderLeft = '5px solid #4338CA';
        frexorBriefing.innerHTML = `
          <div class="section-briefing-header">
            <div>
              <div class="section-briefing-part" style="color: #4338CA;">${partLabel}</div>
              <h3 class="section-briefing-title">${mod.icon} ${mod.title}</h3>
              <p class="section-briefing-subtitle">${mod.subtitle}</p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="category-chip" style="background:#EEF2FF; color:#4338CA; border: 1px solid #C7D2FE;">60 Butir Soal</span>
              <span class="category-chip" style="background:#FEF2F2; color:#DC2626; border: 1px solid #FECACA; font-weight: 700;">⏱️ Waktu 30 Menit</span>
            </div>
          </div>

          <div class="section-briefing-body">
            <div class="section-briefing-instructions-title" style="color: #312E81;">
              <span>💡</span> Panduan Resmi Pengerjaan Frexor Aptitude Test
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12.5px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">⏱️ Batas Waktu 30 Menit</div>
                <div style="font-size: 12px; color: #475569; line-height: 1.45;">
                  Terdapat <strong>60 soal</strong> dengan batas waktu total <strong>30 menit</strong>. Kerjakan secepat dan seakurat mungkin.
                </div>
              </div>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-size: 12.5px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">🎯 1 Jawaban Terbaik</div>
                <div style="font-size: 12px; color: #475569; line-height: 1.45;">
                  Pilih <strong>1 (satu)</strong> jawaban yang menurut Anda paling benar dari 5 opsi yang tersedia (A s.d E).
                </div>
              </div>
            </div>

            <div style="font-size: 12px; color: #3730A3; background: #EEF2FF; border: 1px solid #C7D2FE; padding: 10px 14px; border-radius: 8px; line-height: 1.5;">
              ℹ️ <strong>Cakupan Domain:</strong> Tes ini mencakup 4 dimensi intelegensi: <strong>Kemampuan Verbal</strong> (analogi & klasifikasi), <strong>Penalaran Spasial</strong> (analogi bentuk & rotasi gambar), <strong>Numerik</strong> (deret angka & aritmatika), serta <strong>Logika Deduktif</strong> (silogisme & pemecahan sandi).
            </div>
          </div>
        `;
        container.appendChild(frexorBriefing);

        const LETTERS = ['A', 'B', 'C', 'D', 'E'];
        (window.FREXOR_QUESTIONS || []).forEach((q, idx) => {
          const qNum = idx + 1;
          const currentAns = userAnswers[q.id];

          const card = document.createElement('div');
          card.className = `question-card frexor-card ${currentAns ? 'is-answered' : ''}`;
          card.id = `qcard_${q.id}`;
          card.setAttribute('tabindex', '0');

          let imgHtml = '';
          if (q.image) {
            imgHtml = `
              <div class="frexor-diagram-wrapper" style="margin: 12px 0 16px 0; padding: 12px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; display: inline-block; max-width: 100%;">
                <img src="${q.image}" alt="Diagram Soal ${qNum}" style="max-width: 100%; height: auto; display: block; border-radius: 4px;" />
              </div>
            `;
          }

          let mcOptionsHtml = '';
          (q.options || []).forEach((optText, optIdx) => {
            const letter = LETTERS[optIdx] || String(optIdx + 1);
            const isSel = (currentAns === optText);

            mcOptionsHtml += `
              <button type="button" 
                      class="mc-btn ${isSel ? 'selected' : ''}" 
                      onclick="selectFrexorAnswer('${q.id}', '${escapeJsAttr(optText)}')">
                <span class="mc-letter">${letter}</span>
                <span class="mc-text">${escapeHtml(optText)}</span>
              </button>
            `;
          });

          card.innerHTML = `
            <div class="question-header" style="justify-content: space-between; align-items: flex-start;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span class="question-num" style="background: #312E81; color: #C7D2FE;">#${qNum}</span>
                <div>
                  <div class="question-text" style="font-size: 14.5px;">${escapeHtml(q.question)}</div>
                  ${imgHtml}
                </div>
              </div>
              <span class="category-chip" style="background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE;">${escapeHtml(q.domain || 'IQ')}</span>
            </div>
            <div class="mc-options" style="margin-top: 10px;">
              ${mcOptionsHtml}
            </div>
          `;

          container.appendChild(card);
        });
      }
    }

        function escapeHtml(str) {"""

assert cog_end_old in content, "Could not find cog_end_old"
content = content.replace(cog_end_old, frexor_render_block, 1)

# 6. Add selectFrexorAnswer and Timer functions
func_old = """    function selectCognitiveAnswer(qid, chosenOption) {
      userAnswers[qid] = chosenOption;

      const card = document.getElementById(`qcard_${qid}`);
      if (card) {
        card.classList.add('is-answered');
        card.classList.remove('pulse-highlight');
        const btns = card.querySelectorAll('.mc-btn');
        btns.forEach(btn => {
          const textEl = btn.querySelector('.mc-text');
          const isSelected = textEl && textEl.textContent.trim() === chosenOption.trim();
          btn.classList.toggle('selected', Boolean(isSelected));
        });
      }

      persistUserAnswers();
      flashAutosaveIndicator();
      updateProgress();
    }"""

func_new = """    function selectCognitiveAnswer(qid, chosenOption) {
      userAnswers[qid] = chosenOption;

      const card = document.getElementById(`qcard_${qid}`);
      if (card) {
        card.classList.add('is-answered');
        card.classList.remove('pulse-highlight');
        const btns = card.querySelectorAll('.mc-btn');
        btns.forEach(btn => {
          const textEl = btn.querySelector('.mc-text');
          const isSelected = textEl && textEl.textContent.trim() === chosenOption.trim();
          btn.classList.toggle('selected', Boolean(isSelected));
        });
      }

      persistUserAnswers();
      flashAutosaveIndicator();
      updateProgress();
    }

    function selectFrexorAnswer(qid, chosenOption) {
      userAnswers[qid] = chosenOption;

      const card = document.getElementById(`qcard_${qid}`);
      if (card) {
        card.classList.add('is-answered');
        card.classList.remove('pulse-highlight');
        const btns = card.querySelectorAll('.mc-btn');
        btns.forEach(btn => {
          const textEl = btn.querySelector('.mc-text');
          const isSelected = textEl && textEl.textContent.trim() === chosenOption.trim();
          btn.classList.toggle('selected', Boolean(isSelected));
        });
      }

      persistUserAnswers();
      flashAutosaveIndicator();
      updateProgress();
    }

    // 30-Minute Timer for Frexor Test
    const FREXOR_DURATION_SEC = 30 * 60; // 30 minutes = 1800s
    let frexorTimerInterval = null;

    function initFrexorTimer() {
      if (!enabledTests.includes('frexor')) return;

      const timerWrap = document.getElementById('frexorTimerWrap');
      if (timerWrap) timerWrap.style.display = 'flex';

      const storageKey = 'frexor_timer_start_' + (candidateId || 'default');
      let startTime = sessionStorage.getItem(storageKey);
      if (!startTime) {
        startTime = Date.now();
        sessionStorage.setItem(storageKey, startTime);
      } else {
        startTime = parseInt(startTime, 10);
      }

      function updateCountdown() {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        const remainingSec = Math.max(0, FREXOR_DURATION_SEC - elapsedSec);

        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const el = document.getElementById('frexorCountdown');
        if (el) el.textContent = timeStr;

        if (timerWrap) {
          if (remainingSec <= 300) { // 5 minutes warning
            timerWrap.style.background = '#FEF3C7';
            timerWrap.style.borderColor = '#F59E0B';
            if (el) el.style.color = '#B45309';
          }
          if (remainingSec <= 60) { // 1 minute warning
            timerWrap.style.background = '#FEE2E2';
            timerWrap.style.borderColor = '#EF4444';
            if (el) el.style.color = '#DC2626';
          }
        }

        if (remainingSec <= 0) {
          clearInterval(frexorTimerInterval);
          alert('⏱️ Waktu pengerjaan tes Frexor (30 menit) telah habis. Jawaban Anda akan otomatis dikirimkan ke sistem sekarang.');
          handleVerifyAndSubmit(true); // force submit on timeout
        }
      }

      updateCountdown();
      frexorTimerInterval = setInterval(updateCountdown, 1000);
    }"""

assert func_old in content, "Could not find func_old"
content = content.replace(func_old, func_new, 1)

# 7. Update handleVerifyAndSubmit and submitAssessment
submit_old = """    async function handleVerifyAndSubmit() {
      const activeQuestions = getActiveQuestions();
      const unanswered = activeQuestions.filter(q => {
        const val = userAnswers[q.id];
        if (q._type === 'disc') {
          return !val || typeof val !== 'object' || val.mostIdx === undefined || val.leastIdx === undefined;
        }
        return val === undefined || val === null || val === '';
      });

      if (unanswered.length > 0) {
        showUnansweredBanner(unanswered);
        return;
      }

      // Confirmation Prompt
      const confirmed = window.confirm(
        `Apakah Anda yakin telah mengisi semua ${activeQuestions.length} pertanyaan dengan teliti dan ingin mengirimkan hasil asesmen ini?`
      );
      if (!confirmed) return;"""

submit_new = """    async function handleVerifyAndSubmit(force = false) {
      const activeQuestions = getActiveQuestions();
      const unanswered = activeQuestions.filter(q => {
        const val = userAnswers[q.id];
        if (q._type === 'disc') {
          return !val || typeof val !== 'object' || val.mostIdx === undefined || val.leastIdx === undefined;
        }
        return val === undefined || val === null || val === '';
      });

      if (!force && unanswered.length > 0) {
        showUnansweredBanner(unanswered);
        return;
      }

      if (!force) {
        // Confirmation Prompt
        const confirmed = window.confirm(
          `Apakah Anda yakin telah mengisi semua ${activeQuestions.length} pertanyaan dengan teliti dan ingin mengirimkan hasil asesmen ini?`
        );
        if (!confirmed) return;
      }"""

assert submit_old in content, "Could not find submit_old"
content = content.replace(submit_old, submit_new, 1)

# 8. Add frexor payload in submitAssessment
payload_old = """        if (enabledTests.includes('disc')) {
          payload.disc = calculateDiscScores(userAnswers);
        }"""

payload_new = """        if (enabledTests.includes('disc')) {
          payload.disc = calculateDiscScores(userAnswers);
        }
        if (enabledTests.includes('frexor') && typeof calculateFrexorScores === 'function') {
          payload.frexor = calculateFrexorScores(userAnswers);
        }"""

assert payload_old in content, "Could not find payload_old"
content = content.replace(payload_old, payload_new, 1)

# 9. Update showUnansweredBanner for frexor
banner_old = """        if (q._type === 'disc') typeLabel = 'DISC';
        else if (q._type === 'cognitive') typeLabel = 'Kognitif';
        chip.textContent = `#${q._num} (${typeLabel})`;"""

banner_new = """        if (q._type === 'disc') typeLabel = 'DISC';
        else if (q._type === 'cognitive') typeLabel = 'Kognitif';
        else if (q._type === 'frexor') typeLabel = 'Frexor';
        chip.textContent = `#${q._num} (${typeLabel})`;"""

assert banner_old in content, "Could not find banner_old"
content = content.replace(banner_old, banner_new, 1)

with open('public/assessment.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated public/assessment.html!")
