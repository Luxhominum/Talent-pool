const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

console.log('Original length:', html.length);

// ============================================================
// 1. ADD ASESMEN ON-SITE BUTTON TO NAVBAR
// ============================================================
const targetBtnAnalytics = 'Visual Analytics\r\n        </button>';
const altBtnAnalytics = 'Visual Analytics\n        </button>';

const navbarBtnMarkup = `
        <button type="button" class="btn btn-secondary btn-sm" id="btnAssessmentLauncher" onclick="openAssessmentLauncherModal()" style="border-color: #111827; color: #111827; background: #FFFFFF; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
          <span style="font-size: 13px;">🧠</span>
          Asesmen On-Site
        </button>`;

if (html.includes(targetBtnAnalytics)) {
  html = html.replace(targetBtnAnalytics, targetBtnAnalytics + navbarBtnMarkup);
} else if (html.includes(altBtnAnalytics)) {
  html = html.replace(altBtnAnalytics, altBtnAnalytics + navbarBtnMarkup);
} else {
  console.error('Could not find Visual Analytics button in navbar!');
}

// ============================================================
// 2. ADD MODAL MARKUP
// ============================================================
const modalMarkup = `
  <!-- On-Site Assessment Launcher Modal (Navbar) -->
  <div class="modal-backdrop" id="assessmentLauncherModalBackdrop" onclick="if(event.target === this) closeAssessmentLauncherModal()">
    <div class="modal-card" style="max-width: 720px; width: 95%; max-height: 88vh; display: flex; flex-direction: column;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: #111827; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 18px;">
            🧠
          </div>
          <div>
            <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #059669; font-weight: 600;">On-Site Screening Portal</span>
            <h2 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; color: var(--text-primary); margin-top: 2px;">
              Portal Tes Kepribadian (IPIP Big Five)
            </h2>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closeAssessmentLauncherModal()">✕</button>
      </div>

      <div class="modal-body" style="padding: 16px 20px; overflow-y: auto; flex: 1;">
        <!-- Filters Bar: Lowongan + Stage + Search -->
        <div style="background: #F9FAFB; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 11px; font-family: var(--font-mono); font-weight: 600; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">
                Posisi Lowongan:
              </label>
              <select id="launcherVacancySelect" class="form-select" onchange="renderAssessmentLauncherCandidates()" style="width: 100%; font-size: 12px; padding: 7px 10px;">
              </select>
            </div>
            <div>
              <label style="font-size: 11px; font-family: var(--font-mono); font-weight: 600; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">
                Filter Tahapan:
              </label>
              <select id="launcherStageSelect" class="form-select" onchange="renderAssessmentLauncherCandidates()" style="width: 100%; font-size: 12px; padding: 7px 10px;">
                <option value="Screening" selected>🎯 Hanya Tahap Screening</option>
                <option value="ALL">🌐 Semua Tahapan</option>
                <option value="Prospect">Prospect</option>
                <option value="Interviewed">Interviewed</option>
                <option value="Shortlisted">Shortlisted</option>
              </select>
            </div>
          </div>

          <div>
            <input type="text" id="launcherSearchInput" class="form-input" placeholder="Cari nama kandidat atau ID (e.g. Ghayu, PGE-052)..." oninput="renderAssessmentLauncherCandidates()" style="width: 100%; font-size: 12px; padding: 7px 12px;">
          </div>
        </div>

        <!-- Candidate List Stream -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted);">
            Daftar Kandidat Terfilter (<span id="launcherCountBadge">0</span>):
          </span>
          <span style="font-size: 11px; color: var(--text-muted);">
            💻 Siap dibuka di laptop ini untuk diserahkan ke kandidat
          </span>
        </div>

        <div id="launcherCandidatesContainer" style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Populated dynamically -->
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
          PGE Talent Pool • On-Site Assessment Launcher
        </span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeAssessmentLauncherModal()">
          Tutup
        </button>
      </div>
    </div>
  </div>
`;

const whitelistMarker = '<!-- Team Access & Whitelist Modal -->';
if (html.includes(whitelistMarker)) {
  html = html.replace(whitelistMarker, modalMarkup + '\n  ' + whitelistMarker);
}

// ============================================================
// 3. REMOVE CHICKEN / PSYDUCK ASSISTANT HTML
// ============================================================
const startWidget = html.indexOf('<div class="psyduck-widget-container"');
if (startWidget !== -1) {
  const endMarker = '<!-- Fullscreen High-Density Comparison Matrix Modal -->';
  const endWidget = html.indexOf(endMarker);
  if (endWidget !== -1) {
    html = html.slice(0, startWidget) + html.slice(endWidget);
    console.log('Chicken / Psyduck HTML widget removed.');
  }
}

// ============================================================
// 4. REMOVE CHICKEN / PSYDUCK CSS
// ============================================================
const cssStartMarker = '/* 3D PSYDUCK ANIMATED ASSISTANT WIDGET';
const cssEndMarker = '</style>';
const startCss = html.indexOf(cssStartMarker);
if (startCss !== -1) {
  const lineStart = html.lastIndexOf('/*', startCss);
  const endCss = html.indexOf(cssEndMarker, startCss);
  html = html.slice(0, lineStart) + html.slice(endCss);
  console.log('Chicken / Psyduck CSS removed.');
}

// ============================================================
// 5. REMOVE CHICKEN / PSYDUCK JS LOGIC
// ============================================================
html = html.replace('initPsyduckAssistant();', '// Assistant removed per professional mode');

const jsStartMarker = '/* 3D PSYDUCK ANIMATED ASSISTANT LOGIC';
const jsEndMarker = '/* Renders permanent attached CV Card in Drawer */';
const startJs = html.indexOf(jsStartMarker);
if (startJs !== -1) {
  const lineStart = html.lastIndexOf('/*', startJs);
  const endJs = html.indexOf(jsEndMarker);
  html = html.slice(0, lineStart) + html.slice(endJs);
  console.log('Chicken / Psyduck JS functions removed.');
}

// ============================================================
// 6. ADD LAUNCHER JS FUNCTIONS & CANDIDATE ASSESSMENTS STATE
// ============================================================
if (!html.includes('candidateAssessments:')) {
  html = html.replace(
    'candidateCommentCounts: {},',
    'candidateCommentCounts: {},\n      candidateAssessments: {},'
  );
}

const launcherJs = `
    /* ---------------------------------------------------- */
    /* ON-SITE ASSESSMENT LAUNCHER MODAL (NAVBAR)           */
    /* ---------------------------------------------------- */
    let expandedAssessmentScoreTalentId = null;

    function openAssessmentLauncherModal() {
      const modal = document.getElementById('assessmentLauncherModalBackdrop');
      const vacSelect = document.getElementById('launcherVacancySelect');
      if (!modal || !vacSelect) return;

      const vacancies = getUniqueVacancies();
      let vacHtml = \`<option value="ALL">🌐 Semua Posisi (\${state.talents.length})</option>\`;
      vacancies.forEach(v => {
        const isSel = (state.activeVacancy === v.name);
        vacHtml += \`<option value="\${escapeHtml(v.name)}" \${isSel ? 'selected' : ''}>\${getVacancyIcon(v.name)} \${escapeHtml(v.name)} (\${v.total})</option>\`;
      });
      vacSelect.innerHTML = vacHtml;

      // Default stage to Screening
      const stageSelect = document.getElementById('launcherStageSelect');
      if (stageSelect) stageSelect.value = 'Screening';

      const searchInput = document.getElementById('launcherSearchInput');
      if (searchInput) searchInput.value = '';

      expandedAssessmentScoreTalentId = null;
      renderAssessmentLauncherCandidates();
      modal.classList.add('open');
    }

    function closeAssessmentLauncherModal() {
      const modal = document.getElementById('assessmentLauncherModalBackdrop');
      if (modal) modal.classList.remove('open');
    }

    function toggleAssessmentScorePreview(talentId) {
      if (expandedAssessmentScoreTalentId === talentId) {
        expandedAssessmentScoreTalentId = null;
      } else {
        expandedAssessmentScoreTalentId = talentId;
      }
      renderAssessmentLauncherCandidates();
    }

    function renderAssessmentLauncherCandidates() {
      const container = document.getElementById('launcherCandidatesContainer');
      const countBadge = document.getElementById('launcherCountBadge');
      const vacSelect = document.getElementById('launcherVacancySelect');
      const stageSelect = document.getElementById('launcherStageSelect');
      const searchInput = document.getElementById('launcherSearchInput');

      if (!container || !vacSelect || !stageSelect) return;

      const selectedVac = vacSelect.value;
      const selectedStage = stageSelect.value;
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

      const filtered = (state.talents || []).filter(talent => {
        if (selectedVac !== 'ALL') {
          const roleClean = (talent.role || 'Freelance Content Creator').toLowerCase().trim();
          if (roleClean !== selectedVac.toLowerCase().trim()) return false;
        }

        if (selectedStage !== 'ALL') {
          const stClean = (talent.stage || 'Prospect').toLowerCase().trim();
          if (stClean !== selectedStage.toLowerCase().trim()) return false;
        }

        if (query) {
          const matchName = (talent.name || '').toLowerCase().includes(query);
          const matchId = (talent.id || '').toLowerCase().includes(query);
          if (!matchName && !matchId) return false;
        }

        return true;
      });

      if (countBadge) countBadge.textContent = filtered.length;

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div style="text-align: center; padding: 36px 16px; color: var(--text-secondary); background: #FFFFFF; border: 1px dashed var(--border-light); border-radius: var(--radius-sm);">
            <div style="font-size: 28px; margin-bottom: 6px;">🔍</div>
            <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Tidak ada kandidat di tahap ini</div>
            <div style="font-size: 11.5px; margin-top: 4px; color: var(--text-muted);">
              Coba ganti filter lowongan atau pilih "Semua Tahapan" untuk melihat kandidat di tahap lain.
            </div>
          </div>
        \`;
        return;
      }

      container.innerHTML = filtered.map(talent => {
        const assessment = talent.assessment || state.candidateAssessments[talent.id];
        const isCompleted = Boolean(assessment && assessment.status === 'completed');
        const initials = (talent.name || 'KD').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
        const stageClass = 'stage-' + (talent.stage || 'prospect').toLowerCase();
        const isExpanded = (expandedAssessmentScoreTalentId === talent.id);

        let previewScoreHtml = '';
        if (isExpanded && isCompleted && assessment.scores) {
          const sc = assessment.scores;
          const renderMiniBar = (label, trait) => {
            const raw = trait ? trait.rawScore : 0;
            const pct = trait ? trait.percentage : 0;
            const lvl = trait ? trait.level : '-';
            return \`
              <div style="font-size: 11px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span style="font-weight: 500;">\${label}</span>
                  <span style="font-family: var(--font-mono); font-weight: 600;">\${raw}/50 (\${lvl})</span>
                </div>
                <div style="height: 4px; background: #E5E7EB; border-radius: 2px; overflow: hidden;">
                  <div style="height: 100%; width: \${pct}%; background: #10B981; border-radius: 2px;"></div>
                </div>
              </div>\`;
          };

          previewScoreHtml = \`
            <div style="margin-top: 10px; padding: 12px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-sm);">
              <div style="font-size: 11px; font-weight: 600; color: #166534; margin-bottom: 8px; font-family: var(--font-mono);">
                RINGKASAN SKOR KEPRIBADIAN BIG FIVE:
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                \${renderMiniBar('Extraversion (E)', sc.extraversion)}
                \${renderMiniBar('Agreeableness (A)', sc.agreeableness)}
                \${renderMiniBar('Conscientiousness (C)', sc.conscientiousness)}
                \${renderMiniBar('Emotional Stability (EM)', sc.emotionalStability)}
                <div style="grid-column: 1 / -1;">
                  \${renderMiniBar('Intellect / Openness (I)', sc.intellect)}
                </div>
              </div>
            </div>
          \`;
        }

        return \`
          <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px 14px; box-shadow: var(--shadow-sm); transition: border-color 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: #111827; color: #FFFFFF; font-family: var(--font-mono); font-weight: 600; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  \${initials}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 600; font-size: 13px; color: var(--text-primary);">\${escapeHtml(talent.name)}</span>
                    <span class="candidate-tag" style="font-size: 10px;">\${talent.id}</span>
                    <span class="stage-badge \${stageClass}" style="font-size: 10px; padding: 1px 6px;">\${talent.stage || 'Prospect'}</span>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                    💼 \${escapeHtml(talent.role || 'Freelance Content Creator')} 
                    \${talent.domisili ? ' • 📍 ' + escapeHtml(talent.domisili) : ''}
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                \${isCompleted ? \`
                  <span class="doc-badge" style="background:#F0FDF4; border-color:#86EFAC; color:#15803D; font-weight:600; font-size: 11px;">
                    ✓ Selesai
                  </span>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="toggleAssessmentScorePreview('\${talent.id}')" style="font-size: 11px; padding: 4px 10px;">
                    \${isExpanded ? '▲ Tutup Skor' : '📊 Lihat Skor'}
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.open('assessment.html?id=' + encodeURIComponent('\${talent.id}') + '&name=' + encodeURIComponent('\${escapeHtml(talent.name || '')}') + '&role=' + encodeURIComponent('\${escapeHtml(talent.role || '')}'), '_blank')" style="font-size: 11px; padding: 4px 10px;" title="Buka lembar tes">
                    Buka ↗
                  </button>
                \` : \`
                  <span class="doc-badge" style="background:#F3F4F6; border-color:#E5E7EB; color:#6B7280; font-size: 11px;">
                    ⏳ Belum Tes
                  </span>
                  <button type="button" class="btn btn-primary btn-sm" onclick="window.open('assessment.html?id=' + encodeURIComponent('\${talent.id}') + '&name=' + encodeURIComponent('\${escapeHtml(talent.name || '')}') + '&role=' + encodeURIComponent('\${escapeHtml(talent.role || '')}'), '_blank')" style="font-size: 11px; padding: 5px 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                    <span>🚀 Mulai Tes di Laptop Ini ↗</span>
                  </button>
                \`}
              </div>
            </div>

            \${previewScoreHtml}
          </div>
        \`;
      }).join('');
    }

    /* ---------------------------------------------------- */
    /* REALTIME CANDIDATE ASSESSMENTS (BIG FIVE) LISTENER   */
    /* ---------------------------------------------------- */
    function listenCandidateAssessments() {
      try {
        rtdb.ref('/candidate_assessments').on('value', (snapshot) => {
          const data = snapshot.val() || {};
          state.candidateAssessments = data;

          (state.talents || []).forEach(t => {
            if (data[t.id]) {
              t.assessment = data[t.id];
            }
          });

          if (state.activeProfileTalentId) {
            const currentTalent = (state.talents || []).find(t => t.id === state.activeProfileTalentId);
            if (currentTalent && currentTalent.assessment) {
              const assessBadge = document.getElementById('profModalAssessmentBadge');
              if (assessBadge) {
                assessBadge.textContent = '✓ Selesai';
                assessBadge.style.background = '#DCFCE7';
                assessBadge.style.color = '#15803D';
              }
              if (state.activeProfileTab === 'assessment') {
                openCandidateProfileModal(state.activeProfileTalentId, 'assessment');
              }
            }
          }

          renderActiveView();
        });
      } catch (e) {
        console.warn('Assessments RTDB listener error:', e);
      }
    }

    window.openAssessmentLauncherModal = openAssessmentLauncherModal;
    window.closeAssessmentLauncherModal = closeAssessmentLauncherModal;
    window.renderAssessmentLauncherCandidates = renderAssessmentLauncherCandidates;
    window.toggleAssessmentScorePreview = toggleAssessmentScorePreview;
`;

const jsInsertionPoint = 'function listenCandidateDiscussions() {';
if (html.includes(jsInsertionPoint)) {
  html = html.replace(jsInsertionPoint, launcherJs + '\n    ' + jsInsertionPoint);
}

// Call listenCandidateAssessments
if (!html.includes('listenCandidateAssessments();')) {
  html = html.replace(
    'listenCandidateDiscussions();',
    'listenCandidateDiscussions();\n        listenCandidateAssessments();'
  );
}

// Ensure candidate profile drawer has the on-site test button
const waBtnTarget = 'Contact via WhatsApp ↗\r\n          </a>';
const altWaBtnTarget = 'Contact via WhatsApp ↗\n          </a>';
const onSiteBtnInDrawer = `
        <button type="button" class="btn btn-secondary" onclick="window.open('assessment.html?id=' + encodeURIComponent('\${talent.id}') + '&name=' + encodeURIComponent('\${escapeHtml(talent.name || '')}') + '&role=' + encodeURIComponent('\${escapeHtml(talent.role || '')}'), '_blank')" style="width: 100%; justify-content: center; padding: 9px 14px; font-size: 12px; font-weight: 600; margin-top: 8px; border-color: #111827; color: #111827; background: #FFFFFF; display: flex; align-items: center; gap: 6px;">
          <span>🧠</span> Mulai Tes On-Site (Big Five) ↗
        </button>`;

if (html.includes(waBtnTarget)) {
  html = html.replace(waBtnTarget, waBtnTarget + '\n        ' + onSiteBtnInDrawer);
} else if (html.includes(altWaBtnTarget)) {
  html = html.replace(altWaBtnTarget, altWaBtnTarget + '\n        ' + onSiteBtnInDrawer);
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Update finished! Validating syntax...');
