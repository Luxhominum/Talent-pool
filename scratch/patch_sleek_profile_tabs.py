def patch_tabs():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update CSS in index.html
    old_css_start = "/* Profile Modal Segmented Tabs */"
    old_css_end = "/* Discussion Container & Message Stream */"

    new_css = """/* Profile Modal Modern Nav Tabs (Linear/Stripe Style) */
    .profile-tabs-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 2px;
      border-bottom: 1.5px solid #E2E8F0;
      margin-bottom: 20px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      background: transparent;
      border-radius: 0;
    }
    .profile-tabs-nav::-webkit-scrollbar {
      display: none;
    }
    .profile-tab-btn {
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 500;
      color: #64748B;
      border: none;
      background: transparent;
      cursor: pointer;
      white-space: nowrap;
      border-bottom: 2.5px solid transparent;
      margin-bottom: -1.5px;
      border-radius: 6px 6px 0 0;
      transition: all 0.15s ease;
    }
    .profile-tab-btn:hover {
      color: #0F172A;
      background: #F8FAFC;
    }
    .profile-tab-btn.active {
      color: #2563EB;
      font-weight: 700;
      border-bottom-color: #2563EB;
      background: transparent;
      box-shadow: none;
    }
    .profile-tab-btn svg {
      flex-shrink: 0;
      opacity: 0.7;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
    .profile-tab-btn:hover svg,
    .profile-tab-btn.active svg {
      opacity: 1;
      transform: translateY(-0.5px);
    }
    .profile-tab-badge {
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      background: #F1F5F9;
      color: #64748B;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: all 0.15s ease;
    }
    .profile-tab-btn.active .profile-tab-badge {
      background: #EFF6FF;
      color: #1D4ED8;
      box-shadow: 0 0 0 1px #DBEAFE;
    }
    .profile-tab-badge.badge-success {
      background: #ECFDF5 !important;
      color: #059669 !important;
    }
    .profile-tab-badge.badge-pending {
      background: #FFFBEB !important;
      color: #B45309 !important;
    }

    """

    start_c = content.find(old_css_start)
    end_c = content.find(old_css_end)

    if start_c != -1 and end_c != -1:
        content = content[:start_c] + new_css + content[end_c:]
    else:
        print("Warning: CSS markers not found")

    # 2. Update HTML generation in openCandidateProfileModal
    old_tab_html_start = '<!-- Tab Navigation -->\n        <div class="profile-tabs-nav">'
    old_tab_html_end = '<!-- Tab 1: Portfolio & CV Content -->'

    new_tab_html = """<!-- Tab Navigation -->
        <div class="profile-tabs-nav">
          <button type="button" id="profTabBtnPorto" class="profile-tab-btn ${state.activeProfileTab === 'portfolio' ? 'active' : ''}" onclick="switchProfileTab('portfolio')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <span>Portfolio &amp; CV</span>
            <span class="profile-tab-badge">${validPortoList.length + (isValidDisplayUrl(talent.cvUrl) ? 1 : 0)}</span>
          </button>
          <button type="button" id="profTabBtnAssess" class="profile-tab-btn ${state.activeProfileTab === 'assessment' ? 'active' : ''}" onclick="switchProfileTab('assessment')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
            <span>Hasil Asesmen</span>
            <span class="profile-tab-badge ${isCompletedAssessment ? 'badge-success' : 'badge-pending'}">${isCompletedAssessment ? '✓ Selesai' : 'Belum Tes'}</span>
          </button>
          <button type="button" id="profTabBtnInterview" class="profile-tab-btn ${state.activeProfileTab === 'interview' ? 'active' : ''}" onclick="switchProfileTab('interview')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            <span>Panduan Wawancara</span>
            <span class="profile-tab-badge">15 Soal</span>
          </button>
          <button type="button" id="profTabBtnDiscuss" class="profile-tab-btn ${state.activeProfileTab === 'discussion' ? 'active' : ''}" onclick="switchProfileTab('discussion')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span>Diskusi Tim</span>
            <span class="profile-tab-badge" id="profModalDiscussCount">${commentCount}</span>
          </button>
          ${hasMultipleJobs ? `
            <button type="button" id="profTabBtnApps" class="profile-tab-btn ${state.activeProfileTab === 'applications' ? 'active' : ''}" onclick="switchProfileTab('applications')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <span>Lamaran Lain</span>
              <span class="profile-tab-badge">${relatedApps.length}</span>
            </button>
          ` : ''}
        </div>
        """

    start_h = content.find(old_tab_html_start)
    end_h = content.find(old_tab_html_end)

    if start_h != -1 and end_h != -1:
        content = content[:start_h] + new_tab_html + "\n\n        " + content[end_h:]
    else:
        print("Warning: HTML markers not found")

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Sleek Linear/Stripe profile tabs successfully applied!")

patch_tabs()
