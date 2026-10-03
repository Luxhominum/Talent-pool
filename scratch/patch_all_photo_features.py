import re

def patch_all():
    # ==========================================
    # 1. PATCH public/index.html
    # ==========================================
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # A. Update openCandidateProfileModal avatar rendering
    target_prof_avatar = "const initials = (talent.name || 'Candidate').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();\n      if (avatarEl) avatarEl.textContent = initials;"
    replacement_prof_avatar = """const initials = (talent.name || 'Candidate').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
      if (avatarEl) {
        if (talent.photoUrl) {
          avatarEl.innerHTML = `
            <img src="${escapeHtml(talent.photoUrl)}" alt="${escapeHtml(talent.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'font-family: var(--font-mono); font-weight: 700; font-size: 16px;\\'>${initials}</span><div class=\\'avatar-upload-badge\\' title=\\'Upload / Ganti Foto\\'>📷</div>';">
            <div class="avatar-upload-badge" title="Upload / Ganti Foto">📷</div>
          `;
        } else {
          avatarEl.innerHTML = `
            <span style="font-family: var(--font-mono); font-weight: 700; font-size: 16px;">${initials}</span>
            <div class="avatar-upload-badge" title="Upload / Ganti Foto">📷</div>
          `;
        }
      }"""
    if target_prof_avatar in content:
        content = content.replace(target_prof_avatar, replacement_prof_avatar)
    else:
        print("Warning: target_prof_avatar not found in exact match, trying regex...")
        content = re.sub(
            r"const initials = \(talent\.name \|\| 'Candidate'\)\.split\(' '\)\.map\(w => w\.charAt\(0\)\)\.slice\(0, 2\)\.join\(''\)\.toUpperCase\(\);\s+if \(avatarEl\) avatarEl\.textContent = initials;",
            replacement_prof_avatar,
            content
        )

    # B. Update renderDrawerForm with Photo Upload section
    target_drawer_form_start = '<form id="talentForm" onsubmit="event.preventDefault(); handleSaveCandidate();">\n          <div class="form-group">\n            <label class="form-label">Full Name *</label>'
    drawer_photo_section = """<form id="talentForm" onsubmit="event.preventDefault(); handleSaveCandidate();">
          <div class="form-group" style="background: #F8FAFC; border: 1.5px solid var(--border-light); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;">
            <label class="form-label" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>Foto Profil / Pas Foto (3×4)</span>
              <span style="font-size: 11px; font-weight: 500; color: #64748B;">Opsional</span>
            </label>
            <div style="display: flex; align-items: center; gap: 14px;">
              <div id="drawerPhotoPreviewBox" style="width: 52px; height: 52px; border-radius: 50%; background: #0F172A; color: #FFF; display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: var(--font-mono); font-size: 16px; overflow: hidden; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1); border: 2px solid #FFFFFF;">
                ${data.photoUrl ? `<img src="${escapeHtml(data.photoUrl)}" style="width:100%; height:100%; object-fit:cover;" alt="Foto">` : `<span id="drawerPhotoInitials">${((data.name || 'C').trim().split(/\\s+/).map(w=>w[0]).slice(0,2).join('') || 'C').toUpperCase()}</span>`}
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('drawerPhotoFileInput').click()" style="font-size: 11.5px; padding: 4px 10px;">
                    📁 Upload File
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="clearDrawerPhoto()" style="font-size: 11.5px; padding: 4px 8px; color: #DC2626;" title="Hapus foto">
                    ✕ Hapus
                  </button>
                </div>
                <input type="file" id="drawerPhotoFileInput" accept="image/*" style="display: none;" onchange="handleDrawerPhotoFileSelected(event)">
                <input type="text" id="inputPhotoUrl" class="form-input" value="${escapeHtml(data.photoUrl || '')}" placeholder="atau masukkan URL foto (https://...)" style="font-size: 11.5px; padding: 5px 10px;" oninput="updateDrawerPhotoPreview(this.value)">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Name *</label>"""
    if target_drawer_form_start in content:
        content = content.replace(target_drawer_form_start, drawer_photo_section)
    else:
        print("Warning: target_drawer_form_start not found in exact match")

    # C. Update handleSaveCandidate to persist photoUrl
    target_handle_save = """const notes = document.getElementById('inputNotes').value.trim();
      const cvUrl = document.getElementById('inputCvUrl') ? document.getElementById('inputCvUrl').value.trim() : '';"""
    replacement_handle_save = """const notes = document.getElementById('inputNotes').value.trim();
      const cvUrl = document.getElementById('inputCvUrl') ? document.getElementById('inputCvUrl').value.trim() : '';
      const photoUrl = document.getElementById('inputPhotoUrl') ? document.getElementById('inputPhotoUrl').value.trim() : (state.selectedTalent ? (state.selectedTalent.photoUrl || '') : '');"""
    if target_handle_save in content:
        content = content.replace(target_handle_save, replacement_handle_save)

    target_doc_payload = """cvUrl: cvUrl,
        portfolioUrl: primaryPorto,
        portfolioItemsJson: JSON.stringify(state.stagedPortfolioItems),
        skillsJson: JSON.stringify(skills)"""
    replacement_doc_payload = """cvUrl: cvUrl,
        portfolioUrl: primaryPorto,
        portfolioItemsJson: JSON.stringify(state.stagedPortfolioItems),
        skillsJson: JSON.stringify(skills),
        photoUrl: photoUrl"""
    if target_doc_payload in content:
        content = content.replace(target_doc_payload, replacement_doc_payload)

    # RTDB update inside handleSaveCandidate
    target_post_create = "loadAppwriteTalents();"
    replacement_post_create = """// Also sync to Firebase RTDB
        try {
          if (typeof firebase !== 'undefined' && firebase.database) {
            firebase.database().ref('/talents/' + targetId).update({
              id: targetId,
              name: name,
              role: role,
              phone: phone,
              email: email,
              experienceLevel: experienceLevel,
              overallRating: overallRating,
              stage: stage || 'Prospect',
              expectedSalary: expectedSalary || 'Standard Uang Saku',
              domisili: domisili,
              education: education,
              notes: packOutreachStatus(structuredNotes.trim(), state.selectedTalent ? (state.selectedTalent.outreachStatus || 'Pending') : 'Pending'),
              cvUrl: cvUrl,
              portfolioUrl: primaryPorto,
              portfolioItemsJson: JSON.stringify(state.stagedPortfolioItems),
              skillsJson: JSON.stringify(skills),
              photoUrl: photoUrl
            }).catch(e => console.warn('Firebase RTDB candidate sync error:', e));
          }
        } catch (e) {}

        loadAppwriteTalents();"""
    if target_post_create in content and "Firebase RTDB candidate sync error" not in content:
        content = content.replace(target_post_create, replacement_post_create, 1)

    # D. Update loadFirebaseTalentsFallback & loadAppwriteTalents
    content = content.replace(
        "notes: fullNotes,\n          outreachStatus: outreach\n        };",
        "notes: fullNotes,\n          outreachStatus: outreach,\n          photoUrl: item.photoUrl || item.avatarUrl || ''\n        };"
    )
    content = content.replace(
        "notes: fullNotes,\n            outreachStatus: outreach\n          };",
        "notes: fullNotes,\n            outreachStatus: outreach,\n            photoUrl: doc.photoUrl || doc.avatarUrl || ''\n          };"
    )

    # E. Update renderTableView candidate cell to show table avatar
    target_table_cell = '<td style="font-family: var(--font-mono); font-weight: 500;">${talent.id}</td>'
    replacement_table_cell = """<td style="font-family: var(--font-mono); font-weight: 500;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="candidate-table-avatar">
                  ${talent.photoUrl ? `<img src="${escapeHtml(talent.photoUrl)}" alt="Avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"><span style="display:none;">${((talent.name || 'C').trim().split(/\\s+/).map(w=>w[0]).slice(0,2).join('') || 'C').toUpperCase()}</span>` : `<span>${((talent.name || 'C').trim().split(/\\s+/).map(w=>w[0]).slice(0,2).join('') || 'C').toUpperCase()}</span>`}
                </div>
                <span>${talent.id}</span>
              </div>
            </td>"""
    if target_table_cell in content:
        content = content.replace(target_table_cell, replacement_table_cell)

    # F. Update renderBentoGrid card-header
    target_bento_header = """<div class="card-header">
                <div>
                  <div class="talent-id">${talent.id}</div>
                  <div class="talent-name">${escapeHtml(talent.name)}</div>
                  <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
                    <span class="talent-role">${escapeHtml(talent.role || 'Freelance Content Creator')}</span>
                    ${multiJobBadge}
                  </div>
                </div>
                <div class="rating-badge">★ ${(talent.overallRating || 3).toFixed(1)}</div>
              </div>"""
    replacement_bento_header = """<div class="card-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div class="candidate-table-avatar" style="width: 38px; height: 38px; border-radius: 50%; background: #0F172A; color: #FFF; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; font-family: var(--font-mono); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    ${talent.photoUrl ? `<img src="${escapeHtml(talent.photoUrl)}" alt="Avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"><span style="display:none;">${((talent.name || 'C').trim().split(/\\s+/).map(w=>w[0]).slice(0,2).join('') || 'C').toUpperCase()}</span>` : `<span>${((talent.name || 'C').trim().split(/\\s+/).map(w=>w[0]).slice(0,2).join('') || 'C').toUpperCase()}</span>`}
                  </div>
                  <div>
                    <div class="talent-id">${talent.id}</div>
                    <div class="talent-name">${escapeHtml(talent.name)}</div>
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
                      <span class="talent-role">${escapeHtml(talent.role || 'Freelance Content Creator')}</span>
                      ${multiJobBadge}
                    </div>
                  </div>
                </div>
                <div class="rating-badge">★ ${(talent.overallRating || 3).toFixed(1)}</div>
              </div>"""
    if target_bento_header in content:
        content = content.replace(target_bento_header, replacement_bento_header)

    # G. Update printCandidateReportCard with formal Pas Foto 3x4 Box
    target_print_bio = """<!-- Candidate Core Bio -->
    <div class="grid-bio">
      <div>
        <div class="bio-lbl">Nama Lengkap</div>
        <div class="bio-val" style="font-size: 13px;">${escapeHtml(talent.name)}</div>
      </div>"""
    replacement_print_bio = """<!-- Candidate Core Bio with Pas Foto 3x4 Box -->
    <div class="grid-bio" style="grid-template-columns: 52px 1.4fr 1fr 1.1fr 1.1fr; gap: 10px; align-items: center;">
      <div class="pas-foto-box" style="width: 50px; height: 64px; border: 1.5px solid #CBD5E1; border-radius: 4px; background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); flex-shrink: 0;">
        ${talent.photoUrl ? `
          <img src="${escapeHtml(talent.photoUrl)}" style="width: 100%; height: 100%; object-fit: cover;" alt="Pas Foto">
        ` : `
          <div style="font-size: 18px; line-height: 1; color: #94A3B8;">👤</div>
          <div style="font-size: 6px; color: #94A3B8; font-weight: 700; margin-top: 2px; font-family: 'Geist Mono', monospace; text-align: center; letter-spacing: 0.05em;">PAS FOTO<br>3×4</div>
        `}
      </div>
      <div>
        <div class="bio-lbl">Nama Lengkap</div>
        <div class="bio-val" style="font-size: 13px;">${escapeHtml(talent.name)}</div>
      </div>"""
    if target_print_bio in content:
        content = content.replace(target_print_bio, replacement_print_bio)

    # H. Append Photo Helper Functions to window scope in index.html
    photo_helpers_js = """
    /* ---------------------------------------------------- */
    /* CANDIDATE AVATAR & PHOTO UPLOAD HELPER FUNCTIONS     */
    /* ---------------------------------------------------- */
    function compressImageFile(file, maxWidth = 600, maxHeight = 600, quality = 0.85) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            let w = img.width;
            let h = img.height;
            if (w > maxWidth || h > maxHeight) {
              if (w > h) {
                h = Math.round((h * maxWidth) / w);
                w = maxWidth;
              } else {
                w = Math.round((w * maxHeight) / h);
                h = maxHeight;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          };
          img.onerror = () => reject(new Error('Gagal memproses file gambar'));
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Gagal membaca file'));
        reader.readAsDataURL(file);
      });
    }

    let currentPhotoUploadTalentId = null;
    let stagedPhotoDataUrl = null;

    function openCandidatePhotoModal(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      currentPhotoUploadTalentId = talent.id;
      stagedPhotoDataUrl = talent.photoUrl || null;

      const modal = document.getElementById('candidatePhotoModalBackdrop');
      const nameEl = document.getElementById('photoModalCandidateName');
      const idEl = document.getElementById('photoModalCandidateId');
      const urlInput = document.getElementById('photoUrlInput');

      if (nameEl) nameEl.textContent = talent.name || 'Candidate';
      if (idEl) idEl.textContent = talent.id + ' • ' + (talent.role || '');
      if (urlInput) urlInput.value = (talent.photoUrl && !talent.photoUrl.startsWith('data:')) ? talent.photoUrl : '';

      renderPhotoModalPreview(talent.photoUrl, talent.name);
      if (modal) modal.style.display = 'flex';
    }

    function closeCandidatePhotoModal() {
      const modal = document.getElementById('candidatePhotoModalBackdrop');
      if (modal) modal.style.display = 'none';
      currentPhotoUploadTalentId = null;
      stagedPhotoDataUrl = null;
    }

    function renderPhotoModalPreview(photoUrl, name) {
      const previewContainer = document.getElementById('photoPreviewContainer');
      if (!previewContainer) return;
      const initials = (name || 'Candidate').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
      if (photoUrl) {
        previewContainer.innerHTML = `<img src="${escapeHtml(photoUrl)}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" onerror="this.onerror=null; this.parentElement.innerHTML='<span>${initials}</span>';">`;
      } else {
        previewContainer.innerHTML = `<span>${initials}</span>`;
      }
    }

    async function handlePhotoFileSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        showToast('Memproses file foto...');
        const compressed = await compressImageFile(file, 600, 600, 0.85);
        stagedPhotoDataUrl = compressed;
        const urlInput = document.getElementById('photoUrlInput');
        if (urlInput) urlInput.value = '';
        const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
        renderPhotoModalPreview(compressed, talent ? talent.name : 'Candidate');
        showToast('✅ Foto siap disimpan. Klik "Simpan Foto"');
      } catch (err) {
        console.error('Photo error:', err);
        showToast('Gagal memproses foto: ' + (err.message || 'Format tidak didukung'));
      }
    }

    function handlePhotoUrlInput(url) {
      const trimmed = (url || '').trim();
      stagedPhotoDataUrl = trimmed || null;
      const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
      renderPhotoModalPreview(trimmed, talent ? talent.name : 'Candidate');
    }

    function removeCandidatePhoto() {
      stagedPhotoDataUrl = '';
      const urlInput = document.getElementById('photoUrlInput');
      if (urlInput) urlInput.value = '';
      const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
      renderPhotoModalPreview('', talent ? talent.name : 'Candidate');
      showToast('Foto dikosongkan. Klik "Simpan Foto" untuk menerapkan.');
    }

    async function saveActiveCandidatePhoto() {
      if (!currentPhotoUploadTalentId) return;
      const talentId = currentPhotoUploadTalentId;
      const photoVal = stagedPhotoDataUrl !== null ? stagedPhotoDataUrl : '';

      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (talent) {
        talent.photoUrl = photoVal;
      }

      // Update Profile Modal Avatar if open
      if (currentProfileTalentId === talentId && talent) {
        const avatarEl = document.getElementById('profModalAvatar');
        const initials = (talent.name || 'Candidate').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
        if (avatarEl) {
          if (talent.photoUrl) {
            avatarEl.innerHTML = `
              <img src="${escapeHtml(talent.photoUrl)}" alt="${escapeHtml(talent.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'font-family: var(--font-mono); font-weight: 700; font-size: 16px;\\'>${initials}</span><div class=\\'avatar-upload-badge\\' title=\\'Upload / Ganti Foto\\'>📷</div>';">
              <div class="avatar-upload-badge" title="Upload / Ganti Foto">📷</div>
            `;
          } else {
            avatarEl.innerHTML = `
              <span style="font-family: var(--font-mono); font-weight: 700; font-size: 16px;">${initials}</span>
              <div class="avatar-upload-badge" title="Upload / Ganti Foto">📷</div>
            `;
          }
        }
      }

      // Sync to Firebase RTDB
      try {
        if (typeof firebase !== 'undefined' && firebase.database) {
          firebase.database().ref('/talents/' + talentId).update({
            photoUrl: photoVal
          }).catch(e => console.warn('Firebase RTDB photo save error:', e));
        }
      } catch (e) {}

      // Sync to Appwrite if available
      try {
        if (talent && talent.$id && typeof databases !== 'undefined' && typeof APPWRITE_CONFIG !== 'undefined') {
          databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            talent.$id,
            { photoUrl: photoVal }
          ).catch(() => {});
        }
      } catch (e) {}

      // Re-render views
      if (typeof renderTableView === 'function') renderTableView();
      if (typeof renderBentoGrid === 'function') renderBentoGrid();

      closeCandidatePhotoModal();
      showToast('✅ Foto kandidat ' + (talent ? talent.name : '') + ' berhasil disimpan!');
    }

    async function handleDrawerPhotoFileSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        showToast('Memproses file foto...');
        const compressed = await compressImageFile(file, 600, 600, 0.85);
        const input = document.getElementById('inputPhotoUrl');
        if (input) input.value = compressed;
        updateDrawerPhotoPreview(compressed);
        showToast('✅ Foto berhasil dimuat ke form.');
      } catch (err) {
        showToast('Gagal memproses file foto: ' + err.message);
      }
    }

    function clearDrawerPhoto() {
      const input = document.getElementById('inputPhotoUrl');
      if (input) input.value = '';
      const fileInput = document.getElementById('drawerPhotoFileInput');
      if (fileInput) fileInput.value = '';
      updateDrawerPhotoPreview('');
      showToast('Foto dikosongkan dari form.');
    }

    function updateDrawerPhotoPreview(url) {
      const box = document.getElementById('drawerPhotoPreviewBox');
      if (!box) return;
      const nameInput = document.getElementById('inputName');
      const name = nameInput ? nameInput.value : '';
      const initials = (name || 'C').trim().split(/\\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'C';
      if (url && url.trim()) {
        box.innerHTML = `<img src="${escapeHtml(url.trim())}" style="width:100%; height:100%; object-fit:cover;" alt="Foto" onerror="this.onerror=null; this.parentElement.innerHTML='<span>${initials}</span>';">`;
      } else {
        box.innerHTML = `<span>${initials}</span>`;
      }
    }

    window.openCandidatePhotoModal = openCandidatePhotoModal;
    window.closeCandidatePhotoModal = closeCandidatePhotoModal;
    window.handlePhotoFileSelected = handlePhotoFileSelected;
    window.handlePhotoUrlInput = handlePhotoUrlInput;
    window.removeCandidatePhoto = removeCandidatePhoto;
    window.saveActiveCandidatePhoto = saveActiveCandidatePhoto;
    window.handleDrawerPhotoFileSelected = handleDrawerPhotoFileSelected;
    window.clearDrawerPhoto = clearDrawerPhoto;
    window.updateDrawerPhotoPreview = updateDrawerPhotoPreview;
    """

    if "/* CANDIDATE AVATAR & PHOTO UPLOAD HELPER FUNCTIONS */" not in content:
        content = content.replace("</script>\n</body>", photo_helpers_js + "\n  </script>\n</body>")

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("index.html fully updated!")

    # ==========================================
    # 2. PATCH public/assessment-portal.html
    # ==========================================
    with open('public/assessment-portal.html', 'r', encoding='utf-8') as f:
        portal = f.read()

    # Map photoUrl in loadAppwriteCandidatesDirect
    target_portal_map = "notes: fullNotes,\n              outreachStatus: outreach\n            };"
    replacement_portal_map = "notes: fullNotes,\n              outreachStatus: outreach,\n              photoUrl: doc.photoUrl || doc.avatarUrl || ''\n            };"
    if target_portal_map in portal:
        portal = portal.replace(target_portal_map, replacement_portal_map)

    # Map photoUrl in RTDB on value merge
    target_portal_rtdb_merge = "notes: fullNotes,\n              outreachStatus: outreach\n            };"
    replacement_portal_rtdb_merge = "notes: fullNotes,\n              outreachStatus: outreach,\n              photoUrl: doc.photoUrl || existing.photoUrl || ''\n            };"
    if target_portal_rtdb_merge in portal:
        portal = portal.replace(target_portal_rtdb_merge, replacement_portal_rtdb_merge)

    # Render candidate avatar in launcher list
    target_card_avatar = '<div class="candidate-avatar">${initials}</div>'
    replacement_card_avatar = """<div class="candidate-avatar" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
                  ${talent.photoUrl ? `<img src="${escapeHtml(talent.photoUrl)}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null; this.parentElement.innerHTML='${initials}';">` : `${initials}`}
                </div>"""
    if target_card_avatar in portal:
        portal = portal.replace(target_card_avatar, replacement_card_avatar)

    # Render candidate avatar in completed dossier cards
    target_dossier_avatar = '<div class="candidate-avatar" style="background:#0F172A; width:48px; height:48px; font-size:16px;">${initials}</div>'
    replacement_dossier_avatar = """<div class="candidate-avatar" style="background:#0F172A; width:48px; height:48px; font-size:16px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    ${talent.photoUrl ? `<img src="${escapeHtml(talent.photoUrl)}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null; this.parentElement.innerHTML='${initials}';">` : `${initials}`}
                  </div>"""
    if target_dossier_avatar in portal:
        portal = portal.replace(target_dossier_avatar, replacement_dossier_avatar)

    with open('public/assessment-portal.html', 'w', encoding='utf-8') as f:
        f.write(portal)
    print("assessment-portal.html fully updated!")

patch_all()
