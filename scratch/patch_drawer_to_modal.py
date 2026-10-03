def patch_drawer_to_modal():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update CSS
    old_css = """    /* Slide-over Drawer */
    .drawer-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0, 0, 0, 0.4);
      z-index: 1500; opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
    }
    .drawer-backdrop.active { opacity: 1; pointer-events: auto; }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 640px; max-width: 95vw;
      background: var(--bg-surface); border-left: 1px solid var(--border-light);
      z-index: 1501; transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-drawer); display: flex; flex-direction: column;
    }
    .drawer.open { transform: translateX(0); }
    .drawer-header {
      padding: 20px 24px; border-bottom: 1px solid var(--border-light);
      display: flex; justify-content: space-between; align-items: center;
    }
    .drawer-body { padding: 24px; overflow-y: auto; flex: 1; }
    .drawer-footer {
      position: sticky;
      bottom: 0;
      z-index: 10;
      padding: 16px 24px; border-top: 1px solid var(--border-light);
      background: #FFFFFF; display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 -4px 14px rgba(0, 0, 0, 0.06);
    }"""

    new_css = """    /* Candidate Editor Centered Modal (Pop-Up with Smooth Spring Animation) */
    .drawer-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 2100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .drawer-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }
    .drawer {
      position: relative;
      width: 760px;
      max-width: 95vw;
      max-height: 90vh;
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
      z-index: 2101;
    }
    .drawer.open {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    .drawer-header {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-light);
      background: #F8FAFC;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .drawer-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      background: #FFFFFF;
    }
    .drawer-footer {
      position: sticky;
      bottom: 0;
      z-index: 10;
      padding: 14px 24px;
      border-top: 1px solid var(--border-light);
      background: #F8FAFC;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }"""

    if old_css in content:
        content = content.replace(old_css, new_css)
    else:
        print("Warning: old_css not found")

    # 2. Update HTML structure
    old_html = """  <!-- Slide-over Drawer -->
  <div class="drawer-backdrop" id="drawerBackdrop" onclick="closeDrawer()"></div>
  <aside class="drawer" id="talentDrawer">
    <div class="drawer-header">
      <div>
        <span id="drawerId" class="talent-id"></span>
        <h2 id="drawerTitle" style="font-size: 18px; font-weight: 600; color: var(--text-primary);">Candidate Profile</h2>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" class="btn btn-secondary btn-sm" id="btnDrawerShowcase" onclick="switchToProfileModalFromDrawer()" style="font-size: 11.5px; padding: 5px 12px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;" title="Buka modal showcase profil lengkap & hasil asesmen">
          <span>👁️ Profil &amp; Hasil Asesmen ↗</span>
        </button>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closeDrawer()">✕</button>
      </div>
    </div>

    <div class="drawer-body" id="drawerBody"></div>

    <div class="drawer-footer">
      <button type="button" class="btn btn-danger btn-sm" id="btnDeleteDrawer" onclick="handleDeleteCurrentCandidate()">Delete Candidate</button>
      <div style="display: flex; gap: 8px; margin-left: auto;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeDrawer()">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" id="btnSaveDrawer" onclick="handleSaveCandidate()">Save Candidate</button>
      </div>
    </div>
  </aside>"""

    new_html = """  <!-- Candidate Editor Centered Modal (Replaces side-drawer) -->
  <div class="drawer-backdrop" id="drawerBackdrop" onclick="if(event.target === this) closeDrawer()">
    <div class="drawer" id="talentDrawer">
      <div class="drawer-header">
        <div>
          <span id="drawerId" class="talent-id"></span>
          <h2 id="drawerTitle" style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 2px 0 0 0;">Candidate Profile</h2>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" id="btnDrawerShowcase" onclick="switchToProfileModalFromDrawer()" style="font-size: 11.5px; padding: 5px 12px; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;" title="Buka modal showcase profil lengkap &amp; hasil asesmen">
            <span>👁️ Profil &amp; Hasil Asesmen ↗</span>
          </button>
          <button type="button" class="btn btn-secondary btn-icon" onclick="closeDrawer()" title="Tutup Modal">✕</button>
        </div>
      </div>

      <div class="drawer-body" id="drawerBody"></div>

      <div class="drawer-footer">
        <button type="button" class="btn btn-danger btn-sm" id="btnDeleteDrawer" onclick="handleDeleteCurrentCandidate()">Delete Candidate</button>
        <div style="display: flex; gap: 8px; margin-left: auto;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeDrawer()">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" id="btnSaveDrawer" onclick="handleSaveCandidate()">Save Candidate</button>
        </div>
      </div>
    </div>
  </div>"""

    if old_html in content:
        content = content.replace(old_html, new_html)
    else:
        print("Warning: old_html not found")

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Transformed Candidate Drawer into a centered Pop-Up Modal with smooth transitions successfully!")

patch_drawer_to_modal()
