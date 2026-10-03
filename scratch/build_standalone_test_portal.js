const fs = require('fs');

const assessHtml = fs.readFileSync('public/assessment.html', 'utf-8');

// Extract QUESTIONS (Big Five)
const qStart = assessHtml.indexOf('const QUESTIONS = [');
const qEnd = assessHtml.indexOf('];', qStart) + 2;
const questionsStr = assessHtml.substring(qStart, qEnd);

// Extract COGNITIVE_QUESTION_BANK
const cStart = assessHtml.indexOf('const COGNITIVE_QUESTION_BANK = [');
const cEnd = assessHtml.indexOf('];', cStart) + 2;
const cogStr = assessHtml.substring(cStart, cEnd);

// Extract DISC_QUESTIONS
const dStart = assessHtml.indexOf('const DISC_QUESTIONS = [');
const dEnd = assessHtml.indexOf('];', dStart) + 2;
const discStr = assessHtml.substring(dStart, dEnd);

// Extract calculation functions
const fnDiscStart = assessHtml.indexOf('function calculateDiscScores(answers) {');
const fnDiscEnd = assessHtml.indexOf('function calculateCognitiveScores', fnDiscStart);
const fnDisc = assessHtml.substring(fnDiscStart, fnDiscEnd);

const fnCogStart = fnDiscEnd;
const fnCogEnd = assessHtml.indexOf('function calculateBigFiveScores', fnCogStart);
const fnCog = assessHtml.substring(fnCogStart, fnCogEnd);

const fnB5Start = fnCogEnd;
const fnB5End = assessHtml.indexOf('async function handleVerifyAndSubmit', fnB5Start);
const fnB5 = assessHtml.substring(fnB5Start, fnB5End);

const testHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>PGE Talent Pool | Portal Asesmen Online</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Firebase SDK Compat -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

  <style>
    :root {
      --bg: #090D16;
      --card-bg: #111827;
      --card-border: #1F2937;
      --text: #F9FAFB;
      --text-muted: #9CA3AF;
      --text-dim: #6B7280;
      --primary: #3B82F6;
      --primary-hover: #2563EB;
      --primary-glow: rgba(59, 130, 246, 0.25);
      --emerald: #10B981;
      --amber: #F59E0B;
      --rose: #EF4444;
      --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: 'Geist Mono', monospace;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Header Nav */
    .app-header {
      border-bottom: 1px solid var(--card-border);
      background: rgba(17, 24, 39, 0.75);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #059669, #10B981);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      color: #FFF;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
    }

    .brand-name {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #FFF;
    }

    .status-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34D399;
      padding: 4px 10px;
      border-radius: 999px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10B981;
    }

    /* Container */
    .main-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 24px 16px 40px;
      max-width: 680px;
      width: 100%;
      margin: 0 auto;
    }

    /* Cards */
    .portal-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 32px 24px;
      width: 100%;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Progress & Section Header */
    .test-progress-bar-wrap {
      width: 100%;
      height: 6px;
      background: #1F2937;
      border-radius: 999px;
      margin-bottom: 20px;
      overflow: hidden;
    }

    .test-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3B82F6, #10B981);
      width: 0%;
      transition: width 0.25s ease;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Timer on Cognitive */
    .timer-badge {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 6px;
      background: #1E293B;
      border: 1px solid #334155;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .timer-badge.warning {
      background: rgba(245, 158, 11, 0.15);
      border-color: #F59E0B;
      color: #FCD34D;
    }
    .timer-badge.danger {
      background: rgba(239, 68, 68, 0.15);
      border-color: #EF4444;
      color: #FCA5A5;
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    /* Question Typography */
    .question-category {
      font-size: 11px;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .question-title {
      font-size: 18px;
      font-weight: 600;
      color: #FFF;
      line-height: 1.45;
      margin-bottom: 24px;
    }

    /* Options - Thumb Friendly */
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn-option {
      background: #1F2937;
      border: 1.5px solid #374151;
      border-radius: 12px;
      padding: 14px 18px;
      color: #F3F4F6;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 14px;
      text-align: left;
      transition: all 0.15s ease;
      min-height: 52px;
      width: 100%;
      user-select: none;
    }

    .btn-option:hover {
      background: #283548;
      border-color: #4B5563;
      transform: translateY(-1px);
    }

    .btn-option.selected {
      background: rgba(59, 130, 246, 0.15);
      border-color: #3B82F6;
      color: #93C5FD;
      box-shadow: 0 0 0 1px #3B82F6;
    }

    .opt-key {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #111827;
      border: 1px solid #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .btn-option.selected .opt-key {
      background: #3B82F6;
      border-color: #3B82F6;
      color: #FFF;
    }

    /* Primary Action Buttons */
    .btn-cta {
      background: var(--primary);
      color: #FFF;
      border: none;
      border-radius: 10px;
      padding: 14px 24px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      transition: all 0.15s ease;
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .btn-cta:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .btn-cta:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* OTP Input Box */
    .otp-input {
      width: 100%;
      background: #1F2937;
      border: 2px solid #374151;
      border-radius: 12px;
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 28px;
      font-weight: 700;
      color: #FFF;
      text-align: center;
      letter-spacing: 0.3em;
      margin: 20px 0;
      outline: none;
      transition: border 0.15s ease;
    }
    .otp-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }

    /* Modal Warning */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-box {
      background: #1F2937;
      border: 1px solid #EF4444;
      border-radius: 14px;
      padding: 24px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(239, 68, 68, 0.2);
    }

    /* DISC Specific Styling */
    .disc-quad {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .disc-row {
      background: #1F2937;
      border: 1.5px solid #374151;
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .disc-desc {
      font-size: 14px;
      color: #F3F4F6;
      flex: 1;
    }
    .disc-toggles {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    .disc-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #4B5563;
      background: #111827;
      color: var(--text-muted);
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;
    }
    .disc-pill.most.active {
      background: #10B981;
      border-color: #10B981;
      color: #FFF;
    }
    .disc-pill.least.active {
      background: #EF4444;
      border-color: #EF4444;
      color: #FFF;
    }
  </style>
</head>
<body>

  <!-- App Header -->
  <header class="app-header">
    <div class="brand">
      <div class="brand-logo">P</div>
      <div>
        <div class="brand-name">PGE TALENT POOL</div>
        <div style="font-size: 10px; color: var(--text-dim); font-family: var(--font-mono);">Online Assessment Engine</div>
      </div>
    </div>
    <div id="sessionStatusPill" class="status-pill">
      <span class="status-dot"></span>
      <span id="sessionStatusLabel">Terhubung</span>
    </div>
  </header>

  <!-- Main Workspace Container -->
  <main class="main-wrap" id="mainContainer">
    <!-- Dynamic View Injected Here -->
    <div style="color: var(--text-muted); font-size: 14px;">Memuat portal asesmen...</div>
  </main>

  <!-- Warning Modal (Anti-Cheat) -->
  <div id="cheatWarningModal" class="modal-overlay" style="display: none;">
    <div class="modal-box">
      <div style="font-size: 36px; margin-bottom: 12px;">⚠️</div>
      <h3 style="font-size: 17px; font-weight: 700; color: #F87171; margin-bottom: 8px;">Peringatan Perpindahan Layar</h3>
      <p style="font-size: 13px; color: #D1D5DB; margin-bottom: 16px; line-height: 1.5;">
        Anda terdeteksi meninggalkan halaman tes atau membuka tab/aplikasi lain. Mohon tetap berada di layar hingga soal selesai dikerjakan.
      </p>
      <div style="font-family: var(--font-mono); font-size: 11px; background: rgba(239, 68, 68, 0.15); color: #FCA5A5; padding: 6px 10px; border-radius: 6px; margin-bottom: 18px;">
        Jumlah Pelanggaran: <span id="violationCountBadge">1</span>x
      </div>
      <button onclick="dismissCheatWarning()" class="btn-cta" style="background: #EF4444;">
        Saya Mengerti, Kembali ke Tes
      </button>
    </div>
  </div>

  <script>
    /* ---------------------------------------------------- */
    /* 1. FIREBASE SETUP                                    */
    /* ---------------------------------------------------- */
    const firebaseConfig = {
      projectId: 'talentpool-34137',
      databaseURL: 'https://talentpool-34137-default-rtdb.asia-southeast1.firebasedatabase.app'
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const rtdb = firebase.database();

    /* ---------------------------------------------------- */
    /* 2. QUESTION BANKS & SCORING ENGINES                  */
    /* ---------------------------------------------------- */
    ${questionsStr}

    ${discStr}

    ${cogStr}

    // Pick exactly 15 standardized cognitive questions
    const COGNITIVE_QUESTIONS = COGNITIVE_QUESTION_BANK.slice(0, 15);

    ${fnDisc}

    ${fnCog}

    ${fnB5}

    /* ---------------------------------------------------- */
    /* 3. APPLICATION STATE                                 */
    /* ---------------------------------------------------- */
    const state = {
      token: '',
      talentId: '',
      candidateName: '',
      role: '',
      currentStage: 'otp', // 'otp' | 'welcome' | 'bigfive' | 'inter_disc' | 'disc' | 'inter_cog' | 'cognitive' | 'done' | 'error'
      currentIndex: 0,
      answers: {
        bigFive: {},
        disc: {},
        cognitive: {}
      },
      tabViolations: 0,
      timerSeconds: 45,
      timerInterval: null
    };

    /* ---------------------------------------------------- */
    /* 4. LIFECYCLE & ROUTING                               */
    /* ---------------------------------------------------- */
    window.addEventListener('DOMContentLoaded', () => {
      // Check query parameter ?token=xxx or ?otp=xxx
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token') || params.get('otp');
      if (token) {
        state.token = token.trim();
        validateAndLaunchToken(state.token);
      } else {
        renderOtpScreen();
      }

      setupAntiCheatWatcher();
    });

    function setupAntiCheatWatcher() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && state.currentStage === 'cognitive') {
          state.tabViolations += 1;
          const badge = document.getElementById('violationCountBadge');
          if (badge) badge.textContent = state.tabViolations;
          const modal = document.getElementById('cheatWarningModal');
          if (modal) modal.style.display = 'flex';

          // Sync violation to cloud
          if (state.token) {
            rtdb.ref('/assessmentTokens/' + state.token + '/tabViolations').set(state.tabViolations);
          }
        }
      });
    }

    function dismissCheatWarning() {
      const modal = document.getElementById('cheatWarningModal');
      if (modal) modal.style.display = 'none';
    }

    /* ---------------------------------------------------- */
    /* 5. TOKEN VALIDATION                                  */
    /* ---------------------------------------------------- */
    function renderOtpScreen(errorMsg = '') {
      const container = document.getElementById('mainContainer');
      container.innerHTML = \`
        <div class="portal-card" style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 12px;">🔑</div>
          <h2 style="font-size: 20px; font-weight: 700; color: #FFF; margin-bottom: 6px;">Portal Asesmen Mandiri</h2>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 380px; margin: 0 auto 20px;">
            Masukkan 6-digit Kode Akses (OTP) yang Anda terima melalui WhatsApp dari Tim HR PGE.
          </p>

          <form onsubmit="handleOtpSubmit(event)">
            <input type="text" id="manualOtpInput" class="otp-input" placeholder="000-000" maxlength="6" inputmode="numeric" pattern="[0-9]*" autofocus autocomplete="one-time-code" required>
            \${errorMsg ? \`<div style="color: #F87171; font-size: 12px; margin-bottom: 16px;">\${errorMsg}</div>\` : ''}
            <button type="submit" id="btnVerifyOtp" class="btn-cta">
              Verifikasi &amp; Mulai Asesmen ➔
            </button>
          </form>
        </div>
      \`;
    }

    function handleOtpSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('manualOtpInput');
      const val = input ? input.value.trim().replace(/[^0-9]/g, '') : '';
      if (val.length < 6) {
        renderOtpScreen('Harap masukkan 6 digit angka kode akses.');
        return;
      }
      state.token = val;
      validateAndLaunchToken(val);
    }

    function validateAndLaunchToken(token) {
      const btn = document.getElementById('btnVerifyOtp');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Memverifikasi Kode...';
      }

      rtdb.ref('/assessmentTokens/' + token).once('value').then(snap => {
        const data = snap.val();
        if (!data) {
          renderOtpScreen('Kode akses tidak valid atau tidak terdaftar. Hubungi HR PGE.');
          return;
        }

        if (data.status === 'completed') {
          renderAlreadyCompletedScreen(data);
          return;
        }

        if (data.expiresAt && Date.now() > data.expiresAt) {
          renderOtpScreen('Kode akses ini telah kedaluwarsa (berlaku 24 jam). Hubungi HR PGE untuk kode baru.');
          return;
        }

        // Token Valid! Populate session
        state.talentId = data.talentId;
        state.candidateName = data.candidateName || 'Kandidat';
        state.role = data.role || 'Freelance Content Creator';
        if (data.answers) {
          if (data.answers.bigFive) state.answers.bigFive = data.answers.bigFive;
          if (data.answers.disc) state.answers.disc = data.answers.disc;
          if (data.answers.cognitive) state.answers.cognitive = data.answers.cognitive;
        }
        if (data.tabViolations) state.tabViolations = data.tabViolations;

        // Update token state to in_progress
        rtdb.ref('/assessmentTokens/' + token + '/status').set('in_progress');

        renderWelcomeScreen();
      }).catch(err => {
        console.error('Validation error:', err);
        renderOtpScreen('Terjadi kendala koneksi ke server. Silakan coba lagi.');
      });
    }

    function renderAlreadyCompletedScreen(data) {
      const container = document.getElementById('mainContainer');
      const timeStr = data.completedAt ? new Date(data.completedAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : 'Sebelumnya';
      container.innerHTML = \`
        <div class="portal-card" style="text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">✅</div>
          <h2 style="font-size: 20px; font-weight: 700; color: #FFF; margin-bottom: 6px;">Asesmen Sudah Selesai</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); max-width: 440px; margin: 0 auto 20px; line-height: 1.5;">
            Halo <strong>\${escapeHtml(data.candidateName || 'Kandidat')}</strong>, berkas asesmen Anda untuk posisi <strong>\${escapeHtml(data.role || 'Role')}</strong> telah berhasil diserahkan pada \${timeStr}.
          </p>
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 12px 16px; font-size: 12.5px; color: #34D399; margin-bottom: 20px;">
            Terima kasih atas partisipasi Anda. Tim Rekrutmen PGE akan menghubungi Anda kembali untuk tahapan berikutnya.
          </div>
        </div>
      \`;
    }

    /* ---------------------------------------------------- */
    /* 6. WELCOME & INSTRUCTION SCREEN                     */
    /* ---------------------------------------------------- */
    function renderWelcomeScreen() {
      state.currentStage = 'welcome';
      const container = document.getElementById('mainContainer');
      container.innerHTML = \`
        <div class="portal-card">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #3B82F6; color: #FFF; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; font-family: var(--font-mono);">
              \${state.candidateName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style="font-size: 11px; font-family: var(--font-mono); color: var(--primary); text-transform: uppercase;">Selamat Datang</div>
              <h2 style="font-size: 18px; font-weight: 700; color: #FFF;">\${escapeHtml(state.candidateName)}</h2>
            </div>
          </div>

          <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5;">
            Anda terdaftar untuk posisi <strong>\${escapeHtml(state.role)}</strong>. Asesmen ini terdiri dari 2 bagian utama yang dirancang untuk mengukur kesesuaian gaya kerja dan penalaran bisnis:
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
            <div style="background: #1F2937; border: 1px solid #374151; border-radius: 10px; padding: 14px;">
              <div style="font-weight: 700; font-size: 13.5px; color: #38BDF8; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span>🧠</span> Bagian 1: Karakter &amp; Gaya Kolaborasi (Big Five + DISC)
              </div>
              <div style="font-size: 12px; color: #D1D5DB; line-height: 1.45;">
                • Waktu santai &amp; fleksibel (tanpa timer countdown).<br>
                • Tidak ada jawaban benar atau salah. Jawablah sesuai kecenderungan alami Anda.
              </div>
            </div>

            <div style="background: #1F2937; border: 1px solid #374151; border-radius: 10px; padding: 14px;">
              <div style="font-weight: 700; font-size: 13.5px; color: #FBBF24; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span>📊</span> Bagian 2: Penalaran Logika &amp; Analisis Bisnis (15 Soal)
              </div>
              <div style="font-size: 12px; color: #D1D5DB; line-height: 1.45;">
                • Diberikan waktu <strong>45 detik per soal</strong>.<br>
                • Mohon tidak berpindah tab atau membuka aplikasi lain agar tes tidak terkunci.
              </div>
            </div>
          </div>

          <button onclick="startBigFive()" class="btn-cta">
            Mulai Bagian 1: Karakter Kerja ➔
          </button>
        </div>
      \`;
    }

    /* ---------------------------------------------------- */
    /* 7. SECTION 1A: BIG FIVE (50 ITEMS)                   */
    /* ---------------------------------------------------- */
    function startBigFive() {
      state.currentStage = 'bigfive';
      // Find first unanswered question or 0
      let nextIdx = 0;
      for (let i = 0; i < QUESTIONS.length; i++) {
        if (state.answers.bigFive[QUESTIONS[i].id] === undefined) {
          nextIdx = i;
          break;
        }
      }
      state.currentIndex = nextIdx;
      renderBigFiveQuestion();
    }

    function renderBigFiveQuestion() {
      if (state.currentIndex >= QUESTIONS.length) {
        renderIntermissionToDisc();
        return;
      }

      const q = QUESTIONS[state.currentIndex];
      const selectedVal = state.answers.bigFive[q.id];
      const pct = Math.round(((state.currentIndex + 1) / QUESTIONS.length) * 100);

      const options = [
        { val: 1, label: 'Sangat Tidak Setuju' },
        { val: 2, label: 'Tidak Setuju' },
        { val: 3, label: 'Netral / Ragu-ragu' },
        { val: 4, label: 'Setuju' },
        { val: 5, label: 'Sangat Setuju' }
      ];

      const container = document.getElementById('mainContainer');
      container.innerHTML = \`
        <div class="portal-card">
          <div class="test-progress-bar-wrap">
            <div class="test-progress-bar-fill" style="width: \${pct}%;"></div>
          </div>

          <div class="meta-row">
            <span>Bagian 1A: Big Five Personality</span>
            <span style="font-family: var(--font-mono);">Soal \${state.currentIndex + 1} dari \${QUESTIONS.length}</span>
          </div>

          <div class="question-category">Pernyataan Diri:</div>
          <div class="question-title">"\${escapeHtml(q.text)}"</div>

          <div class="options-list">
            \${options.map(opt => \`
              <button type="button" class="btn-option \${selectedVal === opt.val ? 'selected' : ''}" onclick="selectBigFiveAnswer('\${q.id}', \${opt.val})">
                <span class="opt-key">\${opt.val}</span>
                <span>\${opt.label}</span>
              </button>
            \`).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 24px;">
            <button type="button" class="btn-option" style="width: auto; padding: 10px 16px; font-size: 13px;" onclick="prevBigFiveQuestion()" \${state.currentIndex === 0 ? 'disabled style=\"opacity:0.3;cursor:not-allowed;\"' : ''}>
              ← Sebelumnya
            </button>
            <div style="font-size: 11px; color: var(--text-dim); display: flex; align-items: center;">
              ✓ Autosaved
            </div>
          </div>
        </div>
      \`;
    }

    function selectBigFiveAnswer(qid, val) {
      state.answers.bigFive[qid] = val;
      // Realtime Autosave
      if (state.token) {
        rtdb.ref('/assessmentTokens/' + state.token + '/answers/bigFive/' + qid).set(val);
      }
      setTimeout(() => {
        state.currentIndex += 1;
        renderBigFiveQuestion();
      }, 180);
    }

    function prevBigFiveQuestion() {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        renderBigFiveQuestion();
      }
    }

    /* ---------------------------------------------------- */
    /* 8. INTERMISSION TO DISC                              */
    /* ---------------------------------------------------- */
    function renderIntermissionToDisc() {
      state.currentStage = 'inter_disc';
      const container = document.getElementById('mainContainer');
      container.innerHTML = \`
        <div class="portal-card" style="text-align: center;">
          <div style="font-size: 36px; margin-bottom: 12px;">🎉</div>
          <h2 style="font-size: 20px; font-weight: 700; color: #FFF; margin-bottom: 6px;">Bagian 1A Selesai!</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); max-width: 440px; margin: 0 auto 20px; line-height: 1.5;">
            Selanjutnya adalah <strong>DISC Behavioral Profile (24 Set)</strong>. Di setiap set berisi 4 pernyataan perilaku kerja.
          </p>

          <div style="background: #1F2937; border: 1px solid #374151; border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 24px; font-size: 12.5px; color: #E5E7EB; line-height: 1.5;">
            <strong>Cara Menjawab:</strong><br>
            • Pilih 1 pernyataan yang <strong style="color: #34D399;">Paling Menggambarkan Diri [M]</strong>.<br>
            • Pilih 1 pernyataan yang <strong style="color: #F87171;">Paling Tidak Menggambarkan Diri [L]</strong>.
          </div>

          <button onclick="startDisc()" class="btn-cta">
            Lanjut ke Tes DISC ➔
          </button>
        </div>
      \`;
    }

    /* ---------------------------------------------------- */
    /* 9. SECTION 1B: DISC (24 SETS)                        */
    /* ---------------------------------------------------- */
    function startDisc() {
      state.currentStage = 'disc';
      let nextIdx = 0;
      for (let i = 0; i < DISC_QUESTIONS.length; i++) {
        const qid = DISC_QUESTIONS[i].id;
        const cur = state.answers.disc[qid];
        if (!cur || cur.mostIdx === undefined || cur.leastIdx === undefined) {
          nextIdx = i;
          break;
        }
      }
      state.currentIndex = nextIdx;
      renderDiscQuestion();
    }

    function renderDiscQuestion() {
      if (state.currentIndex >= DISC_QUESTIONS.length) {
        renderIntermissionToCognitive();
        return;
      }

      const q = DISC_QUESTIONS[state.currentIndex];
      const cur = state.answers.disc[q.id] || {};
      const pct = Math.round(((state.currentIndex + 1) / DISC_QUESTIONS.length) * 100);

      const isValid = (cur.mostIdx !== undefined && cur.leastIdx !== undefined && cur.mostIdx !== cur.leastIdx);

      const container = document.getElementById('mainContainer');
      container.innerHTML = \`
        <div class="portal-card">
          <div class="test-progress-bar-wrap">
            <div class="test-progress-bar-fill" style="width: \${pct}%;"></div>
          </div>

          <div class="meta-row">
            <span>Bagian 1B: DISC Profile</span>
            <span style="font-family: var(--font-mono);">Set \${state.currentIndex + 1} dari \${DISC_QUESTIONS.length}</span>
          </div>

          <div class="question-category">Pilih 1 [Paling] dan 1 [Kurang]:</div>
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Pilih satu perilaku yang paling sesuai dengan Anda di tempat kerja, dan satu yang paling kurang sesuai.
          </div>

          <div class="disc-quad">
            \${q.options.map((opt, idx) => \`
              <div class="disc-row">
                <div class="disc-desc">\${escapeHtml(opt.text)}</div>
                <div class="disc-toggles">
                  <span class="disc-pill most \${cur.mostIdx === idx ? 'active' : ''}" onclick="selectDiscToggle('\${q.id}', \${idx}, 'most')">
                    Paling [M]
                  </span>
                  <span class="disc-pill least \${cur.leastIdx === idx ? 'active' : ''}" onclick="selectDiscToggle('\${q.id}', \${idx}, 'least')">
                    Kurang [L]
                  </span>
                </div>
              </div>
            \`).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
            <button type="button" class="btn-option" style="width: auto; padding: 10px 16px; font-size: 13px;" onclick="prevDiscQuestion()" \${state.currentIndex === 0 ? 'disabled style=\"opacity:0.3;cursor:not-allowed;\"' : ''}>
              ← Sebelumnya
            </button>
            <button type="button" class="btn-cta" style="width: auto; padding: 10px 24px; font-size: 13px;" onclick="nextDiscQuestion()" \${!isValid ? 'disabled' : ''}>
              Lanjut Set Berikutnya ➔
            </button>
          </div>
        </div>
      \`;
    }

    function selectDiscToggle(qid, optIdx, type) {
      if (!state.answers.disc[qid]) state.answers.disc[qid] = {};
      const cur = state.answers.disc[qid];

      if (type === 'most') {
        if (cur.mostIdx === optIdx) delete cur.mostIdx;
        else {
          cur.mostIdx = optIdx;
          if (cur.leastIdx === optIdx) delete cur.leastIdx; // can't be both
        }
      } else {
        if (cur.leastIdx === optIdx) delete cur.leastIdx;
        else {
          cur.leastIdx = optIdx;
          if (cur.mostIdx === optIdx) delete cur.mostIdx; // can't be both
        }
      }

      // Sync to cloud
      if (state.token) {
        rtdb.ref('/assessmentTokens/' + state.token + '/answers/disc/' + qid).set(cur);
      }
      renderDiscQuestion();
    }

    function nextDiscQuestion() {
      state.currentIndex += 1;
      renderDiscQuestion();
    }

    function prevDiscQuestion() {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        renderDiscQuestion();
      }
    }

    /* ---------------------------------------------------- */
    /* 10. INTERMISSION TO COGNITIVE                        */
    /* ---------------------------------------------------- */
    function renderIntermissionToCognitive() {
      state.currentStage = 'inter_cog';
      const container = document.getElementById('mainContainer');
      container.innerHTML = \`
        <div class="portal-card" style="text-align: center;">
          <div style="font-size: 36px; margin-bottom: 12px;">📊</div>
          <h2 style="font-size: 20px; font-weight: 700; color: #FFF; margin-bottom: 6px;">Bagian 1 Selesai!</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); max-width: 440px; margin: 0 auto 20px; line-height: 1.5;">
            Selanjutnya adalah <strong>Bagian 2: Penalaran Logika &amp; Analisis Bisnis (15 Soal)</strong>.
          </p>

          <div style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 24px; font-size: 12.5px; color: #FDE68A; line-height: 1.5;">
            <strong>⚠️ Aturan Penting:</strong><br>
            • Setiap soal berbatas waktu <strong>45 detik</strong>.<br>
            • Jika waktu habis, layar otomatis berpindah ke soal berikutnya.<br>
            • Dilarang berpindah tab/aplikasi selama tes berlangsung.
          </div>

          <button onclick="startCognitive()" class="btn-cta" style="background: #F59E0B; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);">
            Mulai Tes Logika (15 Soal) ➔
          </button>
        </div>
      \`;
    }

    /* ---------------------------------------------------- */
    /* 11. SECTION 2: COGNITIVE (15 ITEMS WITH 45S TIMER)   */
    /* ---------------------------------------------------- */
    function startCognitive() {
      state.currentStage = 'cognitive';
      state.currentIndex = 0;
      renderCognitiveQuestion();
    }

    function renderCognitiveQuestion() {
      if (state.timerInterval) clearInterval(state.timerInterval);

      if (state.currentIndex >= COGNITIVE_QUESTIONS.length) {
        submitAllAssessments();
        return;
      }

      const q = COGNITIVE_QUESTIONS[state.currentIndex];
      const pct = Math.round(((state.currentIndex + 1) / COGNITIVE_QUESTIONS.length) * 100);
      const selectedAns = state.answers.cognitive[q.id];

      state.timerSeconds = 45;

      const container = document.getElementById('mainContainer');
      container.innerHTML = \`
        <div class="portal-card" style="user-select: none; -webkit-user-select: none;">
          <div class="test-progress-bar-wrap">
            <div class="test-progress-bar-fill" style="width: \${pct}%; background: linear-gradient(90deg, #F59E0B, #EF4444);"></div>
          </div>

          <div class="meta-row">
            <span>Bagian 2: Logika &amp; Analisis</span>
            <div id="countdownBadge" class="timer-badge">
              <span>⏱️</span> <span id="timerSecondsText">45s</span>
            </div>
          </div>

          <div class="question-category">\${escapeHtml(q.category || 'Penalaran')}</div>
          <div class="question-title">\${escapeHtml(q.question)}</div>

          <div class="options-list">
            \${q.options.map((opt, i) => \`
              <button type="button" class="btn-option \${selectedAns === opt ? 'selected' : ''}" onclick="selectCognitiveAnswer('\${q.id}', '\${escapeHtml(opt)}')">
                <span class="opt-key">\${String.fromCharCode(65 + i)}</span>
                <span>\${escapeHtml(opt)}</span>
              </button>
            \`).join('')}
          </div>
        </div>
      \`;

      // Start countdown
      state.timerInterval = setInterval(() => {
        state.timerSeconds -= 1;
        const textEl = document.getElementById('timerSecondsText');
        const badgeEl = document.getElementById('countdownBadge');
        if (textEl) textEl.textContent = state.timerSeconds + 's';

        if (badgeEl) {
          if (state.timerSeconds <= 10) {
            badgeEl.className = 'timer-badge danger';
          } else if (state.timerSeconds <= 20) {
            badgeEl.className = 'timer-badge warning';
          }
        }

        if (state.timerSeconds <= 0) {
          clearInterval(state.timerInterval);
          // Auto advance on timeout
          state.currentIndex += 1;
          renderCognitiveQuestion();
        }
      }, 1000);
    }

    function selectCognitiveAnswer(qid, optValue) {
      if (state.timerInterval) clearInterval(state.timerInterval);
      state.answers.cognitive[qid] = optValue;

      // Sync to cloud
      if (state.token) {
        rtdb.ref('/assessmentTokens/' + state.token + '/answers/cognitive/' + qid).set(optValue);
      }

      setTimeout(() => {
        state.currentIndex += 1;
        renderCognitiveQuestion();
      }, 200);
    }

    /* ---------------------------------------------------- */
    /* 12. FINAL SUBMISSION & PERMANENT LOCK                */
    /* ---------------------------------------------------- */
    function submitAllAssessments() {
      state.currentStage = 'submitting';
      if (state.timerInterval) clearInterval(state.timerInterval);

      const container = document.getElementById('mainContainer');
      container.innerHTML = \`
        <div class="portal-card" style="text-align: center;">
          <div style="font-size: 36px; margin-bottom: 12px;">⏳</div>
          <h2 style="font-size: 18px; font-weight: 700; color: #FFF; margin-bottom: 6px;">Menyimpan &amp; Menghitung Hasil Asesmen...</h2>
          <p style="font-size: 13px; color: var(--text-muted);">Mohon tunggu sebentar, jangan tutup peramban Anda.</p>
        </div>
      \`;

      // 1. Compute Big Five
      const bigFiveResults = calculateBigFiveScores(state.answers.bigFive);

      // 2. Compute DISC
      const discResults = calculateDiscScores(state.answers.disc);

      // 3. Compute Cognitive
      const cognitiveResults = calculateCognitiveScores(state.answers.cognitive);

      const finalPayload = {
        status: 'completed',
        completedAt: Date.now(),
        talentId: state.talentId,
        tabViolations: state.tabViolations || 0,
        totalQuestions: QUESTIONS.length + DISC_QUESTIONS.length + COGNITIVE_QUESTIONS.length,
        mode: 'remote_online',
        dimensions: bigFiveResults,
        disc: discResults,
        cognitive: cognitiveResults
      };

      // Write directly to candidate's assessment node in Firebase
      rtdb.ref('/talents/' + state.talentId + '/assessment').set(finalPayload).then(() => {
        // Lock token
        return rtdb.ref('/assessmentTokens/' + state.token).update({
          status: 'completed',
          completedAt: Date.now(),
          tabViolations: state.tabViolations || 0
        });
      }).then(() => {
        renderThankYouScreen(bigFiveResults, discResults);
      }).catch(err => {
        console.error('Submit error:', err);
        container.innerHTML = \`
          <div class="portal-card" style="text-align: center;">
            <div style="font-size: 36px; margin-bottom: 12px; color: #F87171;">⚠️</div>
            <h2 style="font-size: 18px; font-weight: 700; color: #FFF; margin-bottom: 8px;">Gagal Menyimpan Data</h2>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
              Terjadi gangguan koneksi internet. Klik tombol di bawah untuk mencoba kirim ulang.
            </p>
            <button onclick="submitAllAssessments()" class="btn-cta">
              Coba Kirim Ulang ➔
            </button>
          </div>
        \`;
      });
    }

    /* ---------------------------------------------------- */
    /* 13. CANDIDATE APPRECIATION SCREEN (DELIGHT & PERK)   */
    /* ---------------------------------------------------- */
    function renderThankYouScreen(b5, disc) {
      state.currentStage = 'done';
      const container = document.getElementById('mainContainer');

      container.innerHTML = \`
        <div class="portal-card" style="text-align: center;">
          <div style="font-size: 44px; margin-bottom: 12px;">🎉</div>
          <h2 style="font-size: 22px; font-weight: 800; color: #FFF; margin-bottom: 6px;">Asesmen Berhasil Terkirim!</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); max-width: 440px; margin: 0 auto 20px; line-height: 1.5;">
            Terima kasih, <strong>\${escapeHtml(state.candidateName)}</strong>. Seluruh hasil tes Anda telah terverifikasi dan tersinkronisasi ke Tim Rekrutmen PGE Talent Pool.
          </p>

          <!-- Mini Workplace Style Infographic (Perk for Candidate) -->
          <div style="background: #1F2937; border: 1px solid #374151; border-radius: 12px; padding: 18px; text-align: left; margin-bottom: 24px;">
            <div style="font-size: 11px; font-family: var(--font-mono); color: #38BDF8; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">
              🎁 Karakter Kerja Dominan Anda:
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #FFF; margin-bottom: 6px;">
              \${escapeHtml(disc.primaryName || 'Kolaborator Andal')}
            </div>
            <div style="font-size: 12.5px; color: #D1D5DB; line-height: 1.45; margin-bottom: 12px;">
              \${escapeHtml(disc.summary || 'Memiliki gaya kerja yang adaptif, komunikatif, dan mampu bekerja harmonis dalam tim.')}
            </div>

            <div style="border-top: 1px solid #374151; padding-top: 10px; font-size: 11px; color: var(--text-muted);">
              💡 <em>Hasil ini mencerminkan kecenderungan gaya alami Anda. Tim HR akan mempelajari kecocokan profil Anda untuk posisi \${escapeHtml(state.role)}.</em>
            </div>
          </div>

          <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 16px;">
            Anda dapat menutup jendela peramban ini dengan aman.
          </div>

          <button onclick="window.close()" class="btn-cta" style="background: #374151; box-shadow: none;">
            Tutup Halaman Ini
          </button>
        </div>
      \`;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  </script>
</body>
</html>`;

fs.writeFileSync('public/test.html', testHtmlContent, 'utf-8');
console.log('SUCCESS: public/test.html generated cleanly! Size:', fs.statSync('public/test.html').size);
