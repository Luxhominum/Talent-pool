import re

with open('public/assessment.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS
css_target = """    /* Unanswered Floating Warning Banner */
    .unanswered-banner {"""

css_replacement = """    /* Stage Stepper Bar (Multi-Stage Wizard) */
    .stage-stepper-bar {
      position: sticky;
      top: 69px;
      z-index: 45;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-light);
      padding: 10px 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .stage-stepper-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      overflow-x: auto;
      padding: 2px 4px;
      scrollbar-width: none;
    }

    .stage-stepper-inner::-webkit-scrollbar {
      display: none;
    }

    .stage-step-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      white-space: nowrap;
      transition: all 0.2s ease;
      user-select: none;
    }

    .stage-step-pill.active {
      color: #0F172A;
      background: #FFFFFF;
      border-color: #0F172A;
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08);
      font-weight: 700;
    }

    .stage-step-pill.completed {
      color: #065F46;
      background: #ECFDF5;
      border-color: #A7F3D0;
    }

    .stage-step-pill .step-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #CBD5E1;
      color: #FFFFFF;
      font-size: 10.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-family: var(--font-mono);
    }

    .stage-step-pill.active .step-circle {
      background: #0F172A;
      color: #FFFFFF;
    }

    .stage-step-pill.completed .step-circle {
      background: #10B981;
      color: #FFFFFF;
    }

    .stage-step-arrow {
      color: #CBD5E1;
      font-size: 11px;
    }

    /* Stage Navigation Bar at Bottom */
    .stage-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .btn-stage-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: var(--radius-sm);
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-stage-back:hover {
      background: #F8FAFC;
      border-color: #94A3B8;
      color: #0F172A;
    }

    .btn-stage-next {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 13px 28px;
      border-radius: var(--radius-sm);
      border: none;
      background: #0F172A;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.15);
    }

    .btn-stage-next:hover {
      background: #1E293B;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(15, 23, 42, 0.2);
    }

    .stage-status-meta {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    /* Frexor Pre-Test Intermission Card */
    .frexor-intermission-card {
      background: #FFFFFF;
      border: 2px solid #C7D2FE;
      border-radius: var(--radius-lg);
      padding: 36px 32px;
      box-shadow: var(--shadow-md);
      text-align: center;
      max-width: 760px;
      margin: 20px auto;
      animation: fadeIn 0.3s ease;
    }

    .frexor-intermission-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid #C7D2FE;
      padding: 4px 14px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 700;
      font-family: var(--font-mono);
      letter-spacing: 0.5px;
      margin-bottom: 14px;
    }

    .frexor-intermission-title {
      font-size: 24px;
      font-weight: 800;
      color: #1E1B4B;
      margin-bottom: 8px;
    }

    .frexor-intermission-subtitle {
      font-size: 14px;
      color: #475569;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .frexor-rules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px;
      text-align: left;
      margin-bottom: 28px;
    }

    .frexor-rule-item {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 14px 16px;
      border-radius: 10px;
    }

    .frexor-rule-item-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #1E293B;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .frexor-rule-item-desc {
      font-size: 11.5px;
      color: #64748B;
      line-height: 1.4;
    }

    .btn-start-frexor {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #4338CA;
      color: #FFFFFF;
      border: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(67, 56, 202, 0.3);
      transition: all 0.2s ease;
    }

    .btn-start-frexor:hover {
      background: #3730A3;
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(67, 56, 202, 0.4);
    }

    /* Unanswered Floating Warning Banner */
    .unanswered-banner {"""

assert css_target in content, "css_target not found"
content = content.replace(css_target, css_replacement, 1)

# 2. Update HTML
html_target = """    </div>
  </header>

  <!-- Main Test Form Container -->
  <main class="container" id="mainContainer" style="display: none;">
    
    <!-- Instruction Card -->
    <section class="instruction-card" id="instructionCard">
      <h1 class="instruction-title" id="instructionTitle">
        <span>📋</span> Petunjuk Asesmen On-Site
      </h1>
      <div class="instruction-desc" id="instructionDesc">
        Silakan isi pertanyaan di bawah ini dengan seksama. Pastikan seluruh pertanyaan telah dijawab sebelum mengirimkan hasil tes.
      </div>
    </section>

    <!-- Questions Feed -->
    <div class="questions-list" id="questionsList"></div>

    <!-- Submit Section -->
    <section class="submit-section">
      <!-- Incomplete Warning -->
      <div class="unanswered-banner" id="unansweredBanner">
        <div class="unanswered-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span id="unansweredTitleText">Masih ada pertanyaan yang belum diisi</span>
        </div>
        <div style="font-size: 11.5px; color: #7F1D1D; margin-bottom: 8px;">
          Klik nomor pertanyaan di bawah ini untuk langsung menuju soal:
        </div>
        <div class="unanswered-chips-container" id="unansweredChips"></div>
      </div>

      <div class="submit-status-text" id="submitStatusText">
        Pastikan seluruh 50 pernyataan telah terisi sebelum mengirim jawaban.
      </div>

      <button type="button" class="btn-submit" id="submitBtn" onclick="handleVerifyAndSubmit()">
        <span>Kirim Jawaban Asesmen</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </section>

  </main>"""

html_replacement = """    </div>
  </header>

  <!-- Stage Stepper Bar (Multi-Stage Wizard Navigation) -->
  <nav class="stage-stepper-bar" id="stageStepperBar" style="display: none;">
    <div class="stage-stepper-inner" id="stageStepperInner"></div>
  </nav>

  <!-- Main Test Form Container -->
  <main class="container" id="mainContainer" style="display: none;">
    
    <!-- Instruction Card -->
    <section class="instruction-card" id="instructionCard">
      <h1 class="instruction-title" id="instructionTitle">
        <span>📋</span> Petunjuk Asesmen On-Site
      </h1>
      <div class="instruction-desc" id="instructionDesc">
        Silakan isi pertanyaan di bawah ini dengan seksama. Pastikan seluruh pertanyaan telah dijawab sebelum mengirimkan hasil tes.
      </div>
    </section>

    <!-- Questions Feed (Current Stage) -->
    <div class="questions-list" id="questionsList"></div>

    <!-- Submit & Stage Navigation Section -->
    <section class="submit-section" id="submitSection">
      <!-- Incomplete Warning -->
      <div class="unanswered-banner" id="unansweredBanner">
        <div class="unanswered-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span id="unansweredTitleText">Masih ada pertanyaan yang belum diisi pada tahap ini</span>
        </div>
        <div style="font-size: 11.5px; color: #7F1D1D; margin-bottom: 8px;">
          Klik nomor pertanyaan di bawah ini untuk langsung menuju soal:
        </div>
        <div class="unanswered-chips-container" id="unansweredChips"></div>
      </div>

      <div class="submit-status-text" id="submitStatusText">
        Lengkapi seluruh pertanyaan pada tahap ini untuk melanjutkan.
      </div>

      <!-- Stage Navigation Bar -->
      <div class="stage-nav-bar" id="stageNavBar">
        <button type="button" class="btn-stage-back" id="btnStagePrev" onclick="navigateStage(-1)" style="display: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span id="btnStagePrevText">Kembali</span>
        </button>

        <div class="stage-status-meta" id="stageStatusMeta">
          <span id="stageCounterText" style="color: var(--text-primary); font-weight: 700;">Tahap 1</span>
          <span id="stageProgressSummary" style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">0 / 0 Terjawab</span>
        </div>

        <button type="button" class="btn-stage-next" id="btnStageNext" onclick="handleStageNext()" style="display: none;">
          <span id="btnStageNextText">Lanjut ke Tahap Berikutnya</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>

        <button type="button" class="btn-submit" id="submitBtn" onclick="handleVerifyAndSubmit()" style="display: none;">
          <span>Kirim Jawaban Asesmen</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </section>

  </main>"""

assert html_target in content, "html_target not found"
content = content.replace(html_target, html_replacement, 1)

with open('public/assessment.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML and CSS successfully updated!")
