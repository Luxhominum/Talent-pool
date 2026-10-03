import re

with open('public/assessment.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update init()
init_old = """      renderQuestions();
      updateProgress();

      if (enabledTests.includes('frexor')) {
        initFrexorTimer();
      }"""

init_new = """      // Wizard State: Restore saved stage and frexorStarted status
      try {
        const savedStage = sessionStorage.getItem('assessment_stage_' + candidateId);
        if (savedStage !== null) {
          currentStageIndex = parseInt(savedStage, 10) || 0;
        }
        const savedFrexorStarted = sessionStorage.getItem('frexor_started_' + candidateId);
        if (savedFrexorStarted === 'true') {
          frexorStarted = true;
        }
      } catch (e) {}

      activeModules = buildActiveModules();
      if (currentStageIndex >= activeModules.length) {
        currentStageIndex = 0;
      }

      renderStage(currentStageIndex);
      updateProgress();"""

assert init_old in text, "Could not find init_old"
text = text.replace(init_old, init_new, 1)
print("[OK] Replaced init() logic")

# 2. Extract the 4 sections from renderQuestions()
start_rq = text.find('function renderQuestions() {')
end_rq = text.find('function escapeHtml(str) {')
assert start_rq != -1 and end_rq != -1, "Could not find renderQuestions boundaries"

rq_content = text[start_rq:end_rq]

pos_b5 = rq_content.find('// --- SECTION: BIG FIVE ---')
pos_disc = rq_content.find('// --- SECTION: DISC ---')
pos_cog = rq_content.find('// --- SECTION: COGNITIVE & BUSINESS LOGIC ---')
pos_frexor = rq_content.find('// --- SECTION: FREXOR APTITUDE TEST [IQ] ---')

b5_block = rq_content[pos_b5:pos_disc]
disc_block = rq_content[pos_disc:pos_cog]
cog_block = rq_content[pos_cog:pos_frexor]
frexor_block = rq_content[pos_frexor:]
# strip trailing closing brace of renderQuestions
frexor_block = frexor_block.rstrip()
if frexor_block.endswith('}'):
    frexor_block = frexor_block[:-1].rstrip()

print("[OK] Extracted all 4 section code blocks from renderQuestions")

# 3. Clean up section blocks to be self-contained stage functions
# In b5_block:
# replace "if (hasBigFive) {" with "function renderBigFiveStage(container, mod) {"
# remove "partCounter++;", etc.
b5_fn = re.sub(r'// --- SECTION: BIG FIVE ---\s*if \(hasBigFive\) \{', 
               '// --- STAGE RENDERER: BIG FIVE ---\n    function renderBigFiveStage(container, mod) {', 
               b5_block)
b5_fn = re.sub(r'const mod = activeModules\.find\(m => m\.key === \'bigfive\'\);', '', b5_fn)
b5_fn = re.sub(r'partCounter\+\+;', '', b5_fn)
b5_fn = b5_fn.replace("const partLabel = totalModules > 1 ? `BAGIAN ${partCounter} DARI ${totalModules} • MODUL KEPRIBADIAN KERJA` : 'MODUL ASESMEN KEPRIBADIAN';", "const partLabel = activeModules.length > 1 ? `TAHAP ${currentStageIndex + 1} DARI ${activeModules.length} • MODUL KEPRIBADIAN KERJA` : 'MODUL ASESMEN KEPRIBADIAN';")

disc_fn = re.sub(r'// --- SECTION: DISC ---\s*if \(hasDisc\) \{', 
                 '// --- STAGE RENDERER: DISC ---\n    function renderDiscStage(container, mod) {', 
                 disc_block)
disc_fn = re.sub(r'const mod = activeModules\.find\(m => m\.key === \'disc\'\);', '', disc_fn)
disc_fn = re.sub(r'partCounter\+\+;', '', disc_fn)
disc_fn = disc_fn.replace("const partLabel = totalModules > 1 ? `BAGIAN ${partCounter} DARI ${totalModules} • MODUL GAYA KERJA & KOMUNIKASI (DISC)` : 'MODUL GAYA KERJA & KOMUNIKASI (DISC)';", "const partLabel = activeModules.length > 1 ? `TAHAP ${currentStageIndex + 1} DARI ${activeModules.length} • MODUL GAYA KERJA & KOMUNIKASI (DISC)` : 'MODUL GAYA KERJA & KOMUNIKASI (DISC)';")

cog_fn = re.sub(r'// --- SECTION: COGNITIVE & BUSINESS LOGIC ---\s*if \(hasCognitive\) \{', 
                '// --- STAGE RENDERER: COGNITIVE ---\n    function renderCognitiveStage(container, mod) {', 
                cog_block)
cog_fn = re.sub(r'const mod = activeModules\.find\(m => m\.key === \'cognitive\'\);', '', cog_fn)
cog_fn = re.sub(r'partCounter\+\+;', '', cog_fn)
cog_fn = cog_fn.replace("const partLabel = totalModules > 1 ? `BAGIAN ${partCounter} DARI ${totalModules} • PENALARAN & LOGIKA BISNIS` : 'PENALARAN & LOGIKA BISNIS';", "const partLabel = activeModules.length > 1 ? `TAHAP ${currentStageIndex + 1} DARI ${activeModules.length} • PENALARAN & LOGIKA BISNIS` : 'PENALARAN & LOGIKA BISNIS';")

frexor_fn = re.sub(r'// --- SECTION: FREXOR APTITUDE TEST \[IQ\] ---\s*if \(hasFrexor\) \{', 
                   '// --- STAGE RENDERER: FREXOR ---\n    function renderFrexorStage(container, mod) {', 
                   frexor_block)
frexor_fn = re.sub(r'const mod = activeModules\.find\(m => m\.key === \'frexor\'\);', '', frexor_fn)
frexor_fn = re.sub(r'partCounter\+\+;', '', frexor_fn)
frexor_fn = frexor_fn.replace("const partLabel = totalModules > 1 ? `BAGIAN ${partCounter} DARI ${totalModules} • PAS FREXOR® APTITUDE TEST [IQ]` : 'PAS FREXOR® APTITUDE TEST [IQ]';", "const partLabel = activeModules.length > 1 ? `TAHAP ${currentStageIndex + 1} DARI ${activeModules.length} • PAS FREXOR® APTITUDE TEST [IQ]` : 'PAS FREXOR® APTITUDE TEST [IQ]';")

# 4. Construct complete new Wizard JavaScript
new_wizard_js = """    // ==========================================
    // MULTI-STAGE WIZARD ARCHITECTURE
    // ==========================================
    let currentStageIndex = 0;
    let activeModules = [];
    let frexorStarted = false;

    function buildActiveModules() {
      const list = [];
      if (enabledTests.includes('bigfive')) {
        list.push({
          key: 'bigfive',
          title: 'Tes Kepribadian Kerja (IPIP Big Five)',
          shortName: 'Kepribadian',
          countText: '50 Pernyataan',
          totalCount: 50,
          estTime: '10–12 Menit',
          icon: '🧠',
          accentColor: '#1E40AF',
          tagBg: '#EFF6FF',
          borderColor: '#3B82F6',
          subtitle: 'Kuesioner preferensi kerja & pola perilaku sehari-hari • Skala 1 (Sangat Tidak Sesuai) s.d 5 (Sangat Sesuai)'
        });
      }
      if (enabledTests.includes('disc')) {
        list.push({
          key: 'disc',
          title: 'Tes Gaya Kerja & Komunikasi (DISC)',
          shortName: 'Gaya Kerja (DISC)',
          countText: '24 Soal M/L',
          totalCount: 24,
          estTime: '8–10 Menit',
          icon: '🧩',
          accentColor: '#7C3AED',
          tagBg: '#F5F3FF',
          borderColor: '#7C3AED',
          subtitle: 'Pemetaan gaya komunikasi & dinamika perilaku profesional • Pilih 1 [M] Most (+) dan 1 [L] Least (-)'
        });
      }
      if (enabledTests.includes('cognitive')) {
        list.push({
          key: 'cognitive',
          title: 'Tes Logika, Kognitif & Bisnis Praktis',
          shortName: 'Logika Bisnis',
          countText: '15 Soal Pilihan Ganda',
          totalCount: 15,
          estTime: '15–20 Menit',
          icon: '📊',
          accentColor: '#059669',
          tagBg: '#ECFDF5',
          borderColor: '#059669',
          subtitle: 'Penalaran numerik, kalkulasi komersial & pemecahan masalah bisnis • Pilihan Ganda A–E'
        });
      }
      if (enabledTests.includes('frexor')) {
        list.push({
          key: 'frexor',
          title: 'PAS frexor® Aptitude Test [IQ]',
          shortName: 'Frexor IQ',
          countText: '60 Soal',
          totalCount: 60,
          estTime: '30 Menit (Batas Waktu Ketat)',
          icon: '⚡',
          accentColor: '#4338CA',
          tagBg: '#EEF2FF',
          borderColor: '#4338CA',
          isTimed: true,
          subtitle: 'Standar resmi tes intelegensi Mensa: Penalaran Verbal, Analogi Spasial, Deret & Logika Deduktif • Skala IQ'
        });
      }
      return list;
    }

    function isQuestionAnswered(q) {
      const val = userAnswers[q.id];
      if (q._type === 'disc') {
        return Boolean(val && typeof val === 'object' && val.mostIdx !== undefined && val.leastIdx !== undefined);
      }
      return val !== undefined && val !== null && val !== '';
    }

    function getStageQuestions(moduleKey) {
      if (moduleKey === 'bigfive') {
        return QUESTIONS.map((q, idx) => ({ ...q, _type: 'bigfive', _num: idx + 1 }));
      }
      if (moduleKey === 'disc') {
        return DISC_QUESTIONS.map((q, idx) => ({ ...q, _type: 'disc', _num: idx + 1 }));
      }
      if (moduleKey === 'cognitive') {
        const cogList = (typeof getCandidateCognitiveQuestions === 'function') 
          ? getCandidateCognitiveQuestions(candidateId) 
          : COGNITIVE_QUESTIONS;
        return cogList.map((q, idx) => ({ ...q, _type: 'cognitive', _num: idx + 1 }));
      }
      if (moduleKey === 'frexor') {
        return (window.FREXOR_QUESTIONS || []).map((q, idx) => ({ ...q, _type: 'frexor', _num: idx + 1 }));
      }
      return [];
    }

    function renderStageStepper() {
      const bar = document.getElementById('stageStepperBar');
      const inner = document.getElementById('stageStepperInner');
      if (!bar || !inner) return;

      if (!activeModules || activeModules.length <= 1) {
        bar.style.display = 'none';
        return;
      }

      bar.style.display = 'block';
      let html = '';

      activeModules.forEach((m, idx) => {
        const isDone = idx < currentStageIndex;
        const isActive = idx === currentStageIndex;
        const circleContent = isDone ? '✓' : (idx + 1);

        html += `
          <div class="stage-step-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}" 
               id="stagePill_${idx}">
            <span class="step-circle">${circleContent}</span>
            <span>${m.icon} ${m.shortName}</span>
          </div>
        `;

        if (idx < activeModules.length - 1) {
          html += `<span class="stage-step-arrow">➔</span>`;
        }
      });

      inner.innerHTML = html;
    }

    function renderStage(stageIndex) {
      if (!activeModules || activeModules.length === 0) {
        activeModules = buildActiveModules();
      }
      if (stageIndex < 0) stageIndex = 0;
      if (stageIndex >= activeModules.length) stageIndex = activeModules.length - 1;
      currentStageIndex = stageIndex;

      try {
        sessionStorage.setItem('assessment_stage_' + candidateId, currentStageIndex);
      } catch (e) {}

      renderStageStepper();

      const mod = activeModules[currentStageIndex];
      if (!mod) return;

      const container = document.getElementById('questionsList');
      container.innerHTML = '';

      // Update Instruction Card
      const instrTitle = document.getElementById('instructionTitle');
      const instrDesc = document.getElementById('instructionDesc');
      if (instrTitle && instrDesc) {
        const stagePrefix = activeModules.length > 1 
          ? `Tahap ${currentStageIndex + 1} dari ${activeModules.length}: ` 
          : '';
        instrTitle.innerHTML = `<span>${mod.icon}</span> ${stagePrefix}${mod.title}`;
        instrDesc.innerHTML = `
          <div>${mod.subtitle}</div>
          <div style="margin-top: 6px; font-size: 12px; color: var(--text-muted);">
            Jumlah Soal: <strong>${mod.countText}</strong> • Estimasi Waktu: <strong>${mod.estTime}</strong>
          </div>
        `;
      }

      // Check if Frexor Intermission is needed
      if (mod.key === 'frexor' && !frexorStarted) {
        // Hide top Frexor timer during intermission
        const timerWrap = document.getElementById('frexorTimerWrap');
        if (timerWrap) timerWrap.style.display = 'none';

        renderFrexorIntermission(container, mod);
        updateStageNavUI(false);
        updateProgress();
        return;
      }

      // If Frexor is active and started, show timer
      if (mod.key === 'frexor' && frexorStarted) {
        initFrexorTimer();
      } else {
        const timerWrap = document.getElementById('frexorTimerWrap');
        if (timerWrap) timerWrap.style.display = 'none';
      }

      // Render Stage Questions
      if (mod.key === 'bigfive') {
        renderBigFiveStage(container, mod);
      } else if (mod.key === 'disc') {
        renderDiscStage(container, mod);
      } else if (mod.key === 'cognitive') {
        renderCognitiveStage(container, mod);
      } else if (mod.key === 'frexor') {
        renderFrexorStage(container, mod);
      }

      updateStageNavUI(true);
      updateProgress();
    }

    function renderFrexorIntermission(container, mod) {
      const card = document.createElement('div');
      card.className = 'frexor-intermission-card';
      card.innerHTML = `
        <div class="frexor-intermission-badge">⚡ TAHAP BERWAKTU KETAT</div>
        <h2 class="frexor-intermission-title">PAS frexor® Aptitude Test [IQ]</h2>
        <p class="frexor-intermission-subtitle">
          Tes ini adalah instrumen resmi untuk mengukur intelegensi umum, daya abstraksi spasial, pemecahan masalah numerik, dan silogisme deduktif berstandar Mensa.
        </p>

        <div class="frexor-rules-grid">
          <div class="frexor-rule-item">
            <div class="frexor-rule-item-title"><span>⏱️</span> Batas Waktu 30 Menit</div>
            <div class="frexor-rule-item-desc">Timer hitung mundur berjalan otomatis. Jika waktu habis, jawaban otomatis dikirimkan ke server.</div>
          </div>
          <div class="frexor-rule-item">
            <div class="frexor-rule-item-title"><span>📝</span> 60 Butir Soal</div>
            <div class="frexor-rule-item-desc">Terdiri dari 20 Verbal, 16 Spasial (dengan gambar asli), 9 Numerik, dan 15 Logika Deduktif.</div>
          </div>
          <div class="frexor-rule-item">
            <div class="frexor-rule-item-title"><span>💡</span> Strategi Mengerjakan</div>
            <div class="frexor-rule-item-desc">Jangan terpaku terlalu lama pada satu soal yang sulit. Kerjakan soal yang mudah terlebih dahulu.</div>
          </div>
        </div>

        <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; font-size: 12.5px; color: #92400E; text-align: left;">
          ⚠️ <strong>Perhatian:</strong> Pastikan Anda telah berada di ruangan yang tenang, koneksi internet stabil, dan siap fokus penuh selama 30 menit ke depan sebelum menekan tombol di bawah.
        </div>

        <button type="button" class="btn-start-frexor" onclick="startFrexorStage()">
          <span>🚀 Saya Siap, Mulai Tes Frexor IQ Sekarang!</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      `;
      container.appendChild(card);
    }

    function startFrexorStage() {
      frexorStarted = true;
      try {
        sessionStorage.setItem('frexor_started_' + candidateId, 'true');
      } catch (e) {}

      initFrexorTimer();
      renderStage(currentStageIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateStageNavUI(showQuestions) {
      const btnPrev = document.getElementById('btnStagePrev');
      const btnNext = document.getElementById('btnStageNext');
      const btnSubmit = document.getElementById('submitBtn');
      const meta = document.getElementById('stageStatusMeta');
      const counterText = document.getElementById('stageCounterText');
      const summaryText = document.getElementById('stageProgressSummary');
      const banner = document.getElementById('unansweredBanner');
      if (banner) banner.style.display = 'none';

      const mod = activeModules[currentStageIndex];
      const isLastStage = (currentStageIndex === activeModules.length - 1);
      const isFrexorIntermission = (mod && mod.key === 'frexor' && !frexorStarted);

      // Back button
      if (btnPrev) {
        // Can go back if > 0 and NOT inside active Frexor test
        const canGoBack = (currentStageIndex > 0) && !(mod && mod.key === 'frexor' && frexorStarted);
        btnPrev.style.display = canGoBack ? 'inline-flex' : 'none';
        if (canGoBack) {
          const prevMod = activeModules[currentStageIndex - 1];
          document.getElementById('btnStagePrevText').textContent = `Kembali ke ${prevMod.shortName}`;
        }
      }

      // Next & Submit button
      if (isFrexorIntermission) {
        if (btnNext) btnNext.style.display = 'none';
        if (btnSubmit) btnSubmit.style.display = 'none';
        if (meta) meta.style.display = 'none';
        return;
      }

      if (meta) meta.style.display = 'flex';

      if (isLastStage) {
        if (btnNext) btnNext.style.display = 'none';
        if (btnSubmit) btnSubmit.style.display = 'inline-flex';
      } else {
        if (btnSubmit) btnSubmit.style.display = 'none';
        if (btnNext) {
          btnNext.style.display = 'inline-flex';
          const nextMod = activeModules[currentStageIndex + 1];
          document.getElementById('btnStageNextText').textContent = `Lanjut: ${nextMod.shortName}`;
        }
      }

      // Counter Meta
      if (counterText && summaryText && mod) {
        const stageQs = getStageQuestions(mod.key);
        const answeredCount = stageQs.filter(q => isQuestionAnswered(q)).length;
        counterText.textContent = `Tahap ${currentStageIndex + 1} dari ${activeModules.length}: ${mod.shortName}`;
        summaryText.textContent = `${answeredCount} / ${stageQs.length} Terjawab`;
      }
    }

    function handleStageNext() {
      const mod = activeModules[currentStageIndex];
      if (!mod) return;

      const stageQs = getStageQuestions(mod.key);
      const unanswered = stageQs.filter(q => !isQuestionAnswered(q));

      if (unanswered.length > 0) {
        showUnansweredBanner(unanswered);
        const firstUnanswered = unanswered[0];
        const card = document.getElementById(`qcard_${firstUnanswered.id}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('pulse-highlight');
          setTimeout(() => card.classList.remove('pulse-highlight'), 2000);
        }
        return;
      }

      currentStageIndex++;
      try {
        sessionStorage.setItem('assessment_stage_' + candidateId, currentStageIndex);
      } catch (e) {}

      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderStage(currentStageIndex);
    }

    function navigateStage(delta) {
      const mod = activeModules[currentStageIndex];
      if (mod && mod.key === 'frexor' && frexorStarted) {
        alert('Anda sedang berada dalam sesi tes Frexor berwaktu. Anda tidak dapat kembali ke tahap sebelumnya.');
        return;
      }

      const newIndex = currentStageIndex + delta;
      if (newIndex >= 0 && newIndex < activeModules.length) {
        currentStageIndex = newIndex;
        try {
          sessionStorage.setItem('assessment_stage_' + candidateId, currentStageIndex);
        } catch (e) {}

        window.scrollTo({ top: 0, behavior: 'smooth' });
        renderStage(currentStageIndex);
      }
    }

    // Alias for backwards compatibility
    function renderQuestions() {
      renderStage(currentStageIndex);
    }

""" + "\n" + b5_fn + "\n" + disc_fn + "\n" + cog_fn + "\n" + frexor_fn + "\n"

# Replace renderQuestions with new_wizard_js
text = text[:start_rq] + new_wizard_js + text[end_rq:]
print("[OK] Replaced renderQuestions with modular Stage Wizard architecture!")

# 5. Update updateProgress to support stage meta and global progress
old_progress_fn = """    function updateProgress() {
      const activeQuestions = getActiveQuestions();
      const total = activeQuestions.length;
      let answeredCount = 0;

      activeQuestions.forEach(q => {
        const ans = userAnswers[q.id];
        if (q._type === 'disc') {
          if (ans && typeof ans === 'object' && ans.mostIdx !== undefined && ans.leastIdx !== undefined) {
            answeredCount++;
          }
        } else {
          if (ans !== undefined && ans !== null && ans !== '') {
            answeredCount++;
          }
        }
      });

      const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

      document.getElementById('progressBar').style.width = pct + '%';
      document.getElementById('progressText').textContent = `${answeredCount} / ${total} (${pct}%)`;

      const remaining = total - answeredCount;
      const statusText = document.getElementById('submitStatusText');
      if (statusText) {
        if (remaining === 0 && total > 0) {
          statusText.innerHTML = `<strong style="color: var(--accent-emerald);">✓ Seluruh ${total} pertanyaan telah dijawab! Anda siap mengirimkan tes.</strong>`;
          document.getElementById('unansweredBanner').style.display = 'none';
        } else {
          statusText.innerHTML = `Tersisa <strong>${remaining}</strong> pertanyaan yang belum terjawab.`;
        }
      }
    }"""

new_progress_fn = """    function updateProgress() {
      const activeQuestions = getActiveQuestions();
      const total = activeQuestions.length;
      let answeredCount = 0;

      activeQuestions.forEach(q => {
        if (isQuestionAnswered(q)) {
          answeredCount++;
        }
      });

      const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

      const pBar = document.getElementById('progressBar');
      const pText = document.getElementById('progressText');
      if (pBar) pBar.style.width = pct + '%';
      if (pText) pText.textContent = `${answeredCount} / ${total} (${pct}%)`;

      // Update current stage meta
      if (activeModules && activeModules[currentStageIndex]) {
        const currentMod = activeModules[currentStageIndex];
        const stageQs = getStageQuestions(currentMod.key);
        const stageAnswered = stageQs.filter(q => isQuestionAnswered(q)).length;
        const stageSummary = document.getElementById('stageProgressSummary');
        const stageCounter = document.getElementById('stageCounterText');
        if (stageSummary) stageSummary.textContent = `${stageAnswered} / ${stageQs.length} Terjawab`;
        if (stageCounter) stageCounter.textContent = `Tahap ${currentStageIndex + 1} dari ${activeModules.length}: ${currentMod.shortName}`;

        const statusText = document.getElementById('submitStatusText');
        if (statusText) {
          const stageRemaining = stageQs.length - stageAnswered;
          if (stageRemaining === 0) {
            statusText.innerHTML = `<strong style="color: var(--accent-emerald);">✓ Tahap ini telah selesai (${stageAnswered}/${stageQs.length}). Silakan lanjutkan.</strong>`;
          } else {
            statusText.innerHTML = `Tersisa <strong>${stageRemaining}</strong> pertanyaan pada tahap ini.`;
          }
        }
      }
    }"""

assert old_progress_fn in text, "Could not find old_progress_fn"
text = text.replace(old_progress_fn, new_progress_fn, 1)
print("[OK] Replaced updateProgress()")

# 6. Update handleVerifyAndSubmit to validate across all stages smoothly
old_submit_start = """    async function handleVerifyAndSubmit(force = false) {
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
      }"""

new_submit_start = """    async function handleVerifyAndSubmit(force = false) {
      const activeQuestions = getActiveQuestions();
      const unanswered = activeQuestions.filter(q => !isQuestionAnswered(q));

      if (!force && unanswered.length > 0) {
        // Find which stage has the first unanswered question
        const firstUn = unanswered[0];
        const targetStageIdx = activeModules.findIndex(m => m.key === firstUn._type);
        if (targetStageIdx !== -1 && targetStageIdx !== currentStageIndex) {
          renderStage(targetStageIdx);
        }
        showUnansweredBanner(unanswered.filter(q => q._type === activeModules[currentStageIndex].key));
        alert(`Masih ada ${unanswered.length} pertanyaan yang belum Anda jawab. Silakan lengkapi sebelum mengirim.`);
        return;
      }"""

assert old_submit_start in text, "Could not find old_submit_start"
text = text.replace(old_submit_start, new_submit_start, 1)
print("[OK] Replaced handleVerifyAndSubmit() validation")

# 7. Clear all wizard session storage on completion
old_cleanup = """        // Clear local session storage
        try {
          sessionStorage.removeItem('ipip_answers_' + candidateId);
          sessionStorage.removeItem('pge_cog_set_' + candidateId);
          sessionStorage.removeItem('frexor_timer_start_' + candidateId);
        } catch (e) {}"""

new_cleanup = """        // Clear local session storage
        try {
          sessionStorage.removeItem('ipip_answers_' + candidateId);
          sessionStorage.removeItem('pge_cog_set_' + candidateId);
          sessionStorage.removeItem('frexor_timer_start_' + candidateId);
          sessionStorage.removeItem('frexor_started_' + candidateId);
          sessionStorage.removeItem('assessment_stage_' + candidateId);
        } catch (e) {}"""

assert old_cleanup in text, "Could not find old_cleanup"
text = text.replace(old_cleanup, new_cleanup, 1)
print("[OK] Replaced sessionStorage cleanup on completion")

with open('public/assessment.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("\nSUCCESS: public/assessment.html has been fully refactored into the Multi-Stage Wizard Flow!")
