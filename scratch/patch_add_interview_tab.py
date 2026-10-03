import re
import json

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update switchProfileTab
old_switch = '''    function switchProfileTab(tabName) {
      state.activeProfileTab = tabName;
      const btnPorto = document.getElementById('profTabBtnPorto');
      const btnDiscuss = document.getElementById('profTabBtnDiscuss');
      const btnAssess = document.getElementById('profTabBtnAssess');
      const btnApps = document.getElementById('profTabBtnApps');
      const contentPorto = document.getElementById('profTabPortoContent');
      const contentDiscuss = document.getElementById('profTabDiscussContent');
      const contentAssess = document.getElementById('profTabAssessContent');
      const contentApps = document.getElementById('profTabAppsContent');

      if (btnPorto) btnPorto.classList.toggle('active', tabName === 'portfolio');
      if (btnDiscuss) btnDiscuss.classList.toggle('active', tabName === 'discussion');
      if (btnAssess) btnAssess.classList.toggle('active', tabName === 'assessment');
      if (btnApps) btnApps.classList.toggle('active', tabName === 'applications');

      if (contentPorto) contentPorto.style.display = tabName === 'portfolio' ? 'flex' : 'none';
      if (contentAssess) contentAssess.style.display = tabName === 'assessment' ? 'flex' : 'none';
      if (contentApps) contentApps.style.display = tabName === 'applications' ? 'flex' : 'none';

      if (contentDiscuss) {
        contentDiscuss.style.display = tabName === 'discussion' ? 'flex' : 'none';
        if (tabName === 'discussion' && state.activeProfileTalentId) {
          renderCandidateDiscussionMessages(state.activeProfileTalentId);
          setTimeout(() => {
            const stream = document.getElementById('candidateDiscussStream');
            if (stream) stream.scrollTop = stream.scrollHeight;
            const input = document.getElementById('candidateDiscussInput');
            if (input) input.focus();
          }, 50);
        }
      }
    }'''

new_switch = '''    function switchProfileTab(tabName) {
      state.activeProfileTab = tabName;
      const btnPorto = document.getElementById('profTabBtnPorto');
      const btnDiscuss = document.getElementById('profTabBtnDiscuss');
      const btnAssess = document.getElementById('profTabBtnAssess');
      const btnInterview = document.getElementById('profTabBtnInterview');
      const btnApps = document.getElementById('profTabBtnApps');
      const contentPorto = document.getElementById('profTabPortoContent');
      const contentDiscuss = document.getElementById('profTabDiscussContent');
      const contentAssess = document.getElementById('profTabAssessContent');
      const contentInterview = document.getElementById('profTabInterviewContent');
      const contentApps = document.getElementById('profTabAppsContent');

      if (btnPorto) btnPorto.classList.toggle('active', tabName === 'portfolio');
      if (btnDiscuss) btnDiscuss.classList.toggle('active', tabName === 'discussion');
      if (btnAssess) btnAssess.classList.toggle('active', tabName === 'assessment');
      if (btnInterview) btnInterview.classList.toggle('active', tabName === 'interview');
      if (btnApps) btnApps.classList.toggle('active', tabName === 'applications');

      if (contentPorto) contentPorto.style.display = tabName === 'portfolio' ? 'flex' : 'none';
      if (contentAssess) contentAssess.style.display = tabName === 'assessment' ? 'flex' : 'none';
      if (contentInterview) contentInterview.style.display = tabName === 'interview' ? 'flex' : 'none';
      if (contentApps) contentApps.style.display = tabName === 'applications' ? 'flex' : 'none';

      if (contentDiscuss) {
        contentDiscuss.style.display = tabName === 'discussion' ? 'flex' : 'none';
        if (tabName === 'discussion' && state.activeProfileTalentId) {
          renderCandidateDiscussionMessages(state.activeProfileTalentId);
          setTimeout(() => {
            const stream = document.getElementById('candidateDiscussStream');
            if (stream) stream.scrollTop = stream.scrollHeight;
            const input = document.getElementById('candidateDiscussInput');
            if (input) input.focus();
          }, 50);
        }
      }
    }'''

assert old_switch in html, "Could not find old switchProfileTab"
html = html.replace(old_switch, new_switch)

# 2. Add Interview Guide Tab in openCandidateProfileModal
old_tabs_nav = '''        <!-- Tab Navigation -->
        <div class="profile-tabs-nav">
          <button type="button" id="profTabBtnPorto" class="profile-tab-btn ${state.activeProfileTab === 'portfolio' ? 'active' : ''}" onclick="switchProfileTab('portfolio')">
            📁 Portfolio &amp; CV (${validPortoList.length + (isValidDisplayUrl(talent.cvUrl) ? 1 : 0)})
          </button>
          <button type="button" id="profTabBtnAssess" class="profile-tab-btn ${state.activeProfileTab === 'assessment' ? 'active' : ''}" onclick="switchProfileTab('assessment')">
            🧠 Hasil Asesmen (${isCompletedAssessment ? '✓ Selesai' : 'Belum Tes'})
          </button>
          <button type="button" id="profTabBtnDiscuss" class="profile-tab-btn ${state.activeProfileTab === 'discussion' ? 'active' : ''}" onclick="switchProfileTab('discussion')">
            💬 Tim Diskusi &amp; Evaluasi (<span id="profModalDiscussCount">${commentCount}</span>)
          </button>
          <button type="button" id="profTabBtnApps" class="profile-tab-btn ${state.activeProfileTab === 'applications' ? 'active' : ''}" onclick="switchProfileTab('applications')">
            🔗 Posisi &amp; Lamaran (${relatedApps.length})
          </button>
        </div>'''

new_tabs_nav = '''        <!-- Tab Navigation -->
        <div class="profile-tabs-nav">
          <button type="button" id="profTabBtnPorto" class="profile-tab-btn ${state.activeProfileTab === 'portfolio' ? 'active' : ''}" onclick="switchProfileTab('portfolio')">
            📁 Portfolio &amp; CV (${validPortoList.length + (isValidDisplayUrl(talent.cvUrl) ? 1 : 0)})
          </button>
          <button type="button" id="profTabBtnAssess" class="profile-tab-btn ${state.activeProfileTab === 'assessment' ? 'active' : ''}" onclick="switchProfileTab('assessment')">
            🧠 Hasil Asesmen (${isCompletedAssessment ? '✓ Selesai' : 'Belum Tes'})
          </button>
          <button type="button" id="profTabBtnInterview" class="profile-tab-btn ${state.activeProfileTab === 'interview' ? 'active' : ''}" onclick="switchProfileTab('interview')">
            🎙️ Panduan Wawancara (15 Soal)
          </button>
          <button type="button" id="profTabBtnDiscuss" class="profile-tab-btn ${state.activeProfileTab === 'discussion' ? 'active' : ''}" onclick="switchProfileTab('discussion')">
            💬 Tim Diskusi (<span id="profModalDiscussCount">${commentCount}</span>)
          </button>
          <button type="button" id="profTabBtnApps" class="profile-tab-btn ${state.activeProfileTab === 'applications' ? 'active' : ''}" onclick="switchProfileTab('applications')">
            🔗 Lamaran (${relatedApps.length})
          </button>
        </div>'''

assert old_tabs_nav in html, "Could not find old tabs nav"
html = html.replace(old_tabs_nav, new_tabs_nav)

# 3. Add profTabInterviewContent in rightCol
old_tab_assess = '''        <!-- Tab 2: Candidate Assessment Result Dashboard Content -->
        <div id="profTabAssessContent" style="display: ${state.activeProfileTab === 'assessment' ? 'flex' : 'none'}; flex-direction: column; gap: 16px;">
          ${renderAssessmentReportDashboardHtml(talent, assessment)}
        </div>'''

new_tab_assess = '''        <!-- Tab 2: Candidate Assessment Result Dashboard Content -->
        <div id="profTabAssessContent" style="display: ${state.activeProfileTab === 'assessment' ? 'flex' : 'none'}; flex-direction: column; gap: 16px;">
          ${renderAssessmentReportDashboardHtml(talent, assessment)}
        </div>

        <!-- Tab: Structured Interview Questions & Guide Content -->
        <div id="profTabInterviewContent" style="display: ${state.activeProfileTab === 'interview' ? 'flex' : 'none'}; flex-direction: column; gap: 16px;">
          ${renderInterviewGuideTabHtml(talent)}
        </div>'''

assert old_tab_assess in html, "Could not find old tab assess"
html = html.replace(old_tab_assess, new_tab_assess)

# 4. Add renderInterviewGuideTabHtml and helper functions
interview_helpers = '''
    /* ---------------------------------------------------- */
    /* STRUCTURED INTERVIEW QUESTIONS & EVALUATION GUIDE    */
    /* ---------------------------------------------------- */
    let currentInterviewCategory = 'all';

    function renderInterviewGuideTabHtml(talent) {
      const data = window.PGE_INTERVIEW_DATA || {
        roleTitle: 'Marketplace & Online Sales Officer',
        formQuestions: [],
        bankQuestions: [],
        rubrics: [],
        competencyGuides: {}
      };

      const formCount = (data.formQuestions || []).length;
      const bankCount = (data.bankQuestions || []).length;
      const isMarketplace = (talent.role || '').toLowerCase().includes('marketplace') || (talent.role || '').toLowerCase().includes('sales');

      return `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color: #FFFFFF; border-radius: 10px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.12);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🎙️</span>
                <span style="font-weight: 700; font-size: 14px; letter-spacing: -0.01em;">PGE Structured Interview Assessment</span>
                <span style="background: #3B82F6; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 12px; font-family: var(--font-mono);">
                  ${escapeHtml(data.roleTitle || 'Marketplace Specialist')}
                </span>
              </div>
              <div style="font-size: 11.5px; color: #94A3B8; margin-top: 4px; line-height: 1.4;">
                Pertanyaan terstruktur berbasis kompetensi dengan panduan observasi <em>What Good Looks Like</em> &amp; <em>Warning Signs</em>.
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="printCandidateReportCard('${talent.id}')" style="background: rgba(255,255,255,0.12); color: #FFFFFF; border-color: rgba(255,255,255,0.25); font-size: 11px; padding: 6px 12px; cursor: pointer;" title="Cetak Lembar Wawancara 2 Halaman A4">
                🖨️ Cetak Lembar A4
              </button>
            </div>
          </div>

          <!-- Quick Search & Category Filter Pills -->
          <div style="display: flex; flex-direction: column; gap: 10px; background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 8px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
              <div style="position: relative; flex: 1; min-width: 200px;">
                <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94A3B8; font-size: 12px;">🔍</span>
                <input type="text" id="interviewSearchInput" placeholder="Cari pertanyaan (misal: traffic, promo, excel, komplain, tim)..." oninput="searchInterviewQuestions(this.value)" style="width: 100%; font-size: 11.5px; padding: 6px 10px 6px 30px; border: 1px solid #CBD5E1; border-radius: 6px; outline: none; background: #F8FAFC;">
              </div>
              <div style="font-size: 11px; color: #64748B; font-family: var(--font-mono);" id="interviewResultCountBadge">
                Menampilkan ${formCount} Soal Inti
              </div>
            </div>

            <!-- Filter Chips -->
            <div style="display: flex; gap: 6px; flex-wrap: wrap;" id="interviewCategoryChips">
              <button type="button" class="btn btn-xs ${currentInterviewCategory === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="filterInterviewCategory('all')" style="font-size: 11px; padding: 3px 10px; border-radius: 14px;">
                ⭐ Soal Inti Form (${formCount})
              </button>
              <button type="button" class="btn btn-xs ${currentInterviewCategory === 'bank' ? 'btn-primary' : 'btn-secondary'}" onclick="filterInterviewCategory('bank')" style="font-size: 11px; padding: 3px 10px; border-radius: 14px;">
                📚 Bank Soal (40)
              </button>
              <button type="button" class="btn btn-xs ${currentInterviewCategory === 'analytical' ? 'btn-primary' : 'btn-secondary'}" onclick="filterInterviewCategory('analytical')" style="font-size: 11px; padding: 3px 10px; border-radius: 14px;">
                📊 Analisis &amp; Traffic
              </button>
              <button type="button" class="btn btn-xs ${currentInterviewCategory === 'commercial' ? 'btn-primary' : 'btn-secondary'}" onclick="filterInterviewCategory('commercial')" style="font-size: 11px; padding: 3px 10px; border-radius: 14px;">
                🛍️ Marketplace &amp; Promo
              </button>
              <button type="button" class="btn btn-xs ${currentInterviewCategory === 'excel' ? 'btn-primary' : 'btn-secondary'}" onclick="filterInterviewCategory('excel')" style="font-size: 11px; padding: 3px 10px; border-radius: 14px;">
                📈 Data &amp; Excel
              </button>
              <button type="button" class="btn btn-xs ${currentInterviewCategory === 'problem' ? 'btn-primary' : 'btn-secondary'}" onclick="filterInterviewCategory('problem')" style="font-size: 11px; padding: 3px 10px; border-radius: 14px;">
                🧩 Problem Solving
              </button>
              <button type="button" class="btn btn-xs ${currentInterviewCategory === 'rubric' ? 'btn-primary' : 'btn-secondary'}" onclick="filterInterviewCategory('rubric')" style="font-size: 11px; padding: 3px 10px; border-radius: 14px;">
                📋 Panduan Rubrik 1-5
              </button>
            </div>
          </div>

          <!-- Questions List Container -->
          <div id="interviewQuestionsContainer" style="display: flex; flex-direction: column; gap: 12px;">
            ${renderInterviewCardsListHtml(currentInterviewCategory, '')}
          </div>

          <!-- Optional Quick Interviewer Scratchpad -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; margin-top: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-weight: 700; font-size: 12px; color: #1E293B; display: flex; align-items: center; gap: 6px;">
                <span>📝</span> Catatan Ringkas Pewawancara (Opsional)
              </div>
              <button type="button" class="btn btn-secondary btn-xs" onclick="saveInterviewQuickNotes('${talent.id}')" style="font-size: 10.5px; padding: 3px 10px; background: #2563EB; color: #FFFFFF; border-color: #2563EB; cursor: pointer;">
                💾 Simpan Catatan
              </button>
            </div>
            <textarea id="interviewQuickNotesInput" placeholder="Tulis catatan observasi, respons menarik, atau poin penting selama wawancara..." style="width: 100%; min-height: 70px; font-size: 11.5px; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 6px; resize: vertical; box-sizing: border-box; font-family: var(--font-sans); background: #FFFFFF;">${escapeHtml(talent.notes || '')}</textarea>
          </div>
        </div>
      `;
    }

    function renderInterviewCardsListHtml(category, query = '') {
      const data = window.PGE_INTERVIEW_DATA;
      if (!data) {
        return '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Data pertanyaan wawancara sedang dimuat...</div>';
      }

      if (category === 'rubric') {
        const rubrics = data.rubrics || [];
        const guides = data.competencyGuides || {};
        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 8px; padding: 14px 16px;">
              <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>⭐</span> Skala Penilaian Standar (1–5)
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${rubrics.map(r => `
                  <div style="display: flex; gap: 12px; align-items: flex-start; padding: 8px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
                    <div style="width: 28px; height: 28px; border-radius: 6px; background: #2563EB; color: #FFFFFF; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: var(--font-mono);">
                      ${r.score}
                    </div>
                    <div style="flex: 1;">
                      <div style="font-weight: 700; font-size: 12px; color: #0F172A;">${escapeHtml(r.def)} - <span style="font-weight: 500; color: #64748B;">${escapeHtml(r.interp)}</span></div>
                      <div style="font-size: 11px; color: #475569; margin-top: 2px;">${escapeHtml(r.evidence)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 8px; padding: 14px 16px;">
              <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>🔍</span> Panduan Observasi Kompetensi (What Good Looks Like vs Warning Signs)
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
                ${Object.entries(guides).map(([comp, g]) => `
                  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 12px;">
                    <div style="font-weight: 700; font-size: 12px; color: #1E40AF; margin-bottom: 6px;">${escapeHtml(comp)}</div>
                    <div style="font-size: 11px; color: #166534; background: #F0FDF4; border: 1px solid #DCFCE7; padding: 6px 8px; border-radius: 4px; margin-bottom: 6px; line-height: 1.35;">
                      <strong>🟢 Baik:</strong> ${escapeHtml(g.good)}
                    </div>
                    <div style="font-size: 11px; color: #991B1B; background: #FEF2F2; border: 1px solid #FEE2E2; padding: 6px 8px; border-radius: 4px; line-height: 1.35;">
                      <strong>🔴 Waspada:</strong> ${escapeHtml(g.warning)}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }

      let items = [];
      if (category === 'bank') {
        items = (data.bankQuestions || []).map(q => ({
          num: q.num,
          tag: q.area,
          question: q.question,
          probing: q.probing,
          guide: data.competencyGuides[q.area] || null
        }));
      } else {
        items = (data.formQuestions || []).map(q => ({
          num: q.num,
          tag: q.competency,
          question: q.question,
          probing: q.probing,
          guide: data.competencyGuides[q.competency] || null
        }));
      }

      // Filter by category if not 'all' or 'bank'
      if (category === 'analytical') {
        items = items.filter(it => it.tag.toLowerCase().includes('analyt') || it.tag.toLowerCase().includes('traffic') || it.tag.toLowerCase().includes('performance') || it.tag.toLowerCase().includes('decline'));
      } else if (category === 'commercial') {
        items = items.filter(it => it.tag.toLowerCase().includes('market') || it.tag.toLowerCase().includes('commercial') || it.tag.toLowerCase().includes('promo') || it.tag.toLowerCase().includes('competitor') || it.tag.toLowerCase().includes('price'));
      } else if (category === 'excel') {
        items = items.filter(it => it.tag.toLowerCase().includes('data') || it.tag.toLowerCase().includes('excel'));
      } else if (category === 'problem') {
        items = items.filter(it => it.tag.toLowerCase().includes('problem') || it.tag.toLowerCase().includes('initiative') || it.tag.toLowerCase().includes('agility') || it.tag.toLowerCase().includes('priorit') || it.tag.toLowerCase().includes('failure'));
      }

      // Filter by search query
      if (query && query.trim()) {
        const qLower = query.toLowerCase().trim();
        items = items.filter(it => 
          (it.question || '').toLowerCase().includes(qLower) ||
          (it.probing || '').toLowerCase().includes(qLower) ||
          (it.tag || '').toLowerCase().includes(qLower)
        );
      }

      if (items.length === 0) {
        return `
          <div style="background: #FFFFFF; border: 1px dashed var(--border-light); border-radius: 8px; padding: 24px; text-align: center; color: #64748B;">
            <div style="font-size: 20px; margin-bottom: 6px;">🔍</div>
            <div style="font-weight: 600; font-size: 13px;">Tidak ada pertanyaan yang sesuai dengan kata kunci "${escapeHtml(query)}"</div>
            <div style="font-size: 11px; margin-top: 4px;">Coba gunakan kata kunci umum seperti <em>traffic, promo, excel,</em> atau pilih kategori lain.</div>
          </div>
        `;
      }

      return items.map(item => {
        const copyText = `${item.question} Probing: ${item.probing}`.replace(/"/g, '&quot;');
        return `
          <div class="interview-q-card" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 8px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 10px; transition: border-color 0.15s ease;">
            <!-- Top Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; padding: 2px 7px; border-radius: 4px;">
                  #${item.num}
                </span>
                <span style="font-size: 11px; font-weight: 600; background: #F3F4F6; color: #374151; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);">
                  ${escapeHtml(item.tag)}
                </span>
              </div>
              <button type="button" class="btn btn-secondary btn-xs" onclick="copyInterviewQuestion(this, '${escapeHtml(item.question).replace(/'/g, "\\'")}')" style="font-size: 10.5px; padding: 2px 8px; color: #475569; border-color: #CBD5E1; cursor: pointer;" title="Salin teks pertanyaan">
                📋 Salin Soal
              </button>
            </div>

            <!-- Main Question -->
            <div style="font-size: 13.5px; font-weight: 600; color: #0F172A; line-height: 1.45;">
              ${escapeHtml(item.question)}
            </div>

            <!-- Probing Question Box -->
            ${item.probing && item.probing !== '—' ? `
              <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-left: 3px solid #2563EB; border-radius: 4px; padding: 8px 12px; font-size: 11.5px; color: #1E3A8A; line-height: 1.4;">
                <strong>🔍 Pertanyaan Pendalaman (Probing):</strong>
                <div style="margin-top: 3px; color: #1E40AF;">${escapeHtml(item.probing)}</div>
              </div>
            ` : ''}

            <!-- Competency Observational Guide (if mapped) -->
            ${item.guide ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px; margin-top: 2px; font-size: 10.5px;">
                <div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 4px; padding: 6px 9px; color: #166534; line-height: 1.35;">
                  <strong>🟢 Jawaban Baik:</strong> ${escapeHtml(item.guide.good)}
                </div>
                <div style="background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 4px; padding: 6px 9px; color: #991B1B; line-height: 1.35;">
                  <strong>🔴 Tanda Bahaya:</strong> ${escapeHtml(item.guide.warning)}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    function filterInterviewCategory(cat) {
      currentInterviewCategory = cat;
      const chipsContainer = document.getElementById('interviewCategoryChips');
      if (chipsContainer) {
        const btns = chipsContainer.querySelectorAll('button');
        btns.forEach(b => {
          b.className = 'btn btn-xs ' + (b.getAttribute('onclick').includes(`'${cat}'`) ? 'btn-primary' : 'btn-secondary');
        });
      }
      const searchInput = document.getElementById('interviewSearchInput');
      const q = searchInput ? searchInput.value : '';
      const listContainer = document.getElementById('interviewQuestionsContainer');
      if (listContainer) {
        listContainer.innerHTML = renderInterviewCardsListHtml(cat, q);
      }
      const badge = document.getElementById('interviewResultCountBadge');
      if (badge) {
        badge.textContent = `Kategori: ${cat.toUpperCase()}`;
      }
    }
    window.filterInterviewCategory = filterInterviewCategory;

    function searchInterviewQuestions(query) {
      const listContainer = document.getElementById('interviewQuestionsContainer');
      if (listContainer) {
        listContainer.innerHTML = renderInterviewCardsListHtml(currentInterviewCategory, query);
      }
      const badge = document.getElementById('interviewResultCountBadge');
      if (badge) {
        badge.textContent = query ? `Hasil pencarian "${query}"` : `Kategori: ${currentInterviewCategory.toUpperCase()}`;
      }
    }
    window.searchInterviewQuestions = searchInterviewQuestions;

    function copyInterviewQuestion(btn, text) {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Disalin!';
        btn.style.color = '#15803D';
        btn.style.borderColor = '#86EFAC';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.color = '#475569';
          btn.style.borderColor = '#CBD5E1';
        }, 1500);
      }).catch(() => {
        showToast('Teks soal: ' + text.slice(0, 40) + '...');
      });
    }
    window.copyInterviewQuestion = copyInterviewQuestion;

    async function saveInterviewQuickNotes(talentId) {
      const input = document.getElementById('interviewQuickNotesInput');
      if (!input || !talentId) return;
      const val = input.value.trim();
      const talent = (state.talents || []).find(t => t.id === talentId || t.$id === talentId);
      if (talent) {
        talent.notes = val;
      }
      try {
        const docId = talent && talent.$id ? talent.$id : (talentId || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        if (typeof databases !== 'undefined' && typeof APPWRITE_CONFIG !== 'undefined') {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            { notes: val }
          );
        }
      } catch(e) {
        console.warn('Appwrite save note err:', e);
      }
      if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('/talents/' + talentId).update({ notes: val }).catch(() => {});
      }
      showToast('✅ Catatan wawancara berhasil disimpan.');
    }
    window.saveInterviewQuickNotes = saveInterviewQuickNotes;
'''

# Insert helper functions before openCandidateProfileModal
target_pos = '    function openCandidateProfileModal('
assert target_pos in html, "Could not find openCandidateProfileModal"
html = html.replace(target_pos, interview_helpers + '\n    function openCandidateProfileModal(')

# Export functions to window
old_exports = '    window.submitReschedule = submitReschedule;'
new_exports = '''    window.submitReschedule = submitReschedule;
    window.renderInterviewGuideTabHtml = renderInterviewGuideTabHtml;
    window.renderInterviewCardsListHtml = renderInterviewCardsListHtml;'''
assert old_exports in html, "Could not find old exports"
html = html.replace(old_exports, new_exports)

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Successfully patched public/index.html with Structured Interview Guide tab!")
