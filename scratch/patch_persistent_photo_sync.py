def patch_persistence():
    # ==========================================
    # 1. PATCH public/index.html
    # ==========================================
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Update saveActiveCandidatePhoto in index.html
    old_save_fn_start = "async function saveActiveCandidatePhoto() {"
    new_save_fn_replacement = """async function saveActiveCandidatePhoto() {
      if (!currentPhotoUploadTalentId) return;
      const talentId = currentPhotoUploadTalentId;
      
      let photoVal = '';
      if (cropState.rawImageObj) {
        photoVal = exportCroppedImageCanvas(450, 600);
      } else if (stagedPhotoDataUrl !== null) {
        photoVal = stagedPhotoDataUrl;
      }

      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (talent) {
        talent.photoUrl = photoVal;
      }

      // 1. Persist to localStorage for instant reload
      try {
        if (photoVal) {
          localStorage.setItem('pge_candidate_photo_' + talentId, photoVal);
        } else {
          localStorage.removeItem('pge_candidate_photo_' + talentId);
        }
      } catch (e) {}

      // 2. Persist to Firebase Realtime Database dedicated /candidate_photos node
      try {
        if (typeof firebase !== 'undefined' && firebase.database) {
          if (photoVal) {
            firebase.database().ref('/candidate_photos/' + talentId).set({
              photoUrl: photoVal,
              updatedAt: firebase.database.ServerValue.TIMESTAMP
            }).catch(e => console.warn('Firebase RTDB candidate_photos error:', e));

            firebase.database().ref('/talents/' + talentId).update({
              photoUrl: photoVal
            }).catch(() => {});
          } else {
            firebase.database().ref('/candidate_photos/' + talentId).remove().catch(() => {});
            firebase.database().ref('/talents/' + talentId + '/photoUrl').remove().catch(() => {});
          }
        }
      } catch (e) {}

      // 3. Try to sync to Appwrite document (if schema supports it)
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

      // 4. Update Profile Modal Avatar if open
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

      // Re-render views
      if (typeof renderTableView === 'function') renderTableView();
      if (typeof renderBentoGrid === 'function') renderBentoGrid();

      closeCandidatePhotoModal();
      showToast('✅ Foto Pas Foto 3×4 kandidat berhasil disimpan ke cloud database!');
    }"""

    import re
    save_regex = r"async function saveActiveCandidatePhoto\(\)\s*\{[\s\S]*?showToast\('✅ Foto Pas Foto 3×4[\s\S]*?\n    \}"
    if re.search(save_regex, content):
        content = re.sub(save_regex, new_save_fn_replacement, content)
    else:
        print("Warning: save_regex not matched")

    # Update loadAppwriteTalents in index.html to fetch and merge photos
    old_load_appwrite_try = """      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          [Appwrite.Query.limit(100)]
        );"""

    new_load_appwrite_try = """      try {
        // Fetch candidate photos from Firebase RTDB in parallel
        let rtdbPhotos = {};
        try {
          if (typeof rtdb !== 'undefined') {
            const photoSnap = await rtdb.ref('/candidate_photos').once('value');
            rtdbPhotos = photoSnap.val() || {};
          }
        } catch (e) {}

        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          [Appwrite.Query.limit(100)]
        );"""

    if old_load_appwrite_try in content:
        content = content.replace(old_load_appwrite_try, new_load_appwrite_try)

    old_appwrite_photo_line = "photoUrl: doc.photoUrl || doc.avatarUrl || ''"
    new_appwrite_photo_line = """photoUrl: (function() {
              const tid = doc.talentId || doc.$id;
              const rtdbEntry = rtdbPhotos[tid] || (doc.$id ? rtdbPhotos[doc.$id] : null);
              const rPhoto = rtdbEntry ? (typeof rtdbEntry === 'string' ? rtdbEntry : (rtdbEntry.photoUrl || '')) : '';
              const lPhoto = localStorage.getItem('pge_candidate_photo_' + tid) || (doc.$id ? localStorage.getItem('pge_candidate_photo_' + doc.$id) : '') || '';
              return doc.photoUrl || rPhoto || lPhoto || '';
            })()"""

    if old_appwrite_photo_line in content:
        content = content.replace(old_appwrite_photo_line, new_appwrite_photo_line)

    # Update loadFirebaseTalentsFallback in index.html
    old_fb_photo_line = "photoUrl: item.photoUrl || item.avatarUrl || ''"
    new_fb_photo_line = """photoUrl: (function() {
            const tid = item.id || k;
            const lPhoto = localStorage.getItem('pge_candidate_photo_' + tid) || '';
            return item.photoUrl || item.avatarUrl || lPhoto || '';
          })()"""
    if old_fb_photo_line in content:
        content = content.replace(old_fb_photo_line, new_fb_photo_line)

    # Add Realtime listener for /candidate_photos in bootApp / initRealtimeListeners in index.html
    listener_code = """
      // Realtime listener for /candidate_photos in Firebase RTDB
      try {
        if (typeof rtdb !== 'undefined') {
          rtdb.ref('/candidate_photos').on('value', snapshot => {
            const photos = snapshot.val() || {};
            if (state && state.talents && state.talents.length > 0) {
              let changed = false;
              state.talents.forEach(t => {
                const pEntry = photos[t.id] || (t.$id ? photos[t.$id] : null);
                const pUrl = pEntry ? (typeof pEntry === 'string' ? pEntry : (pEntry.photoUrl || '')) : '';
                if (pUrl && t.photoUrl !== pUrl) {
                  t.photoUrl = pUrl;
                  try { localStorage.setItem('pge_candidate_photo_' + t.id, pUrl); } catch(e){}
                  changed = true;
                }
              });
              if (changed) {
                if (typeof renderTableView === 'function') renderTableView();
                if (typeof renderBentoGrid === 'function') renderBentoGrid();
                if (currentProfileTalentId) {
                  const currTalent = state.talents.find(t => t.id === currentProfileTalentId);
                  if (currTalent) {
                    const avatarEl = document.getElementById('profModalAvatar');
                    const initials = (currTalent.name || 'Candidate').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
                    if (avatarEl && currTalent.photoUrl) {
                      avatarEl.innerHTML = `<img src="${escapeHtml(currTalent.photoUrl)}" alt="${escapeHtml(currTalent.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" onerror="this.onerror=null; this.parentElement.innerHTML='<span style=\\'font-family: var(--font-mono); font-weight: 700; font-size: 16px;\\'>${initials}</span><div class=\\'avatar-upload-badge\\' title=\\'Upload / Ganti Foto\\'>📷</div>';"><div class="avatar-upload-badge" title="Upload / Ganti Foto">📷</div>`;
                    }
                  }
                }
              }
            }
          });
        }
      } catch (e) {}
"""
    if "// Realtime listener for /candidate_photos in Firebase RTDB" not in content:
        content = content.replace("initAuthListener();", "initAuthListener();\n" + listener_code)

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("public/index.html patched with persistent /candidate_photos cloud sync!")

    # ==========================================
    # 2. PATCH public/assessment-portal.html
    # ==========================================
    with open('public/assessment-portal.html', 'r', encoding='utf-8') as f:
        portal = f.read()

    # Add candidate_photos listener in initRealtimeListeners in assessment-portal.html
    portal_photos_listener = """
      // Listen to /candidate_photos in Firebase RTDB for instant photo sync
      rtdb.ref('/candidate_photos').on('value', snapshot => {
        const photos = snapshot.val() || {};
        if (state && state.talents && state.talents.length > 0) {
          state.talents.forEach(t => {
            const pEntry = photos[t.id] || (t.appwriteId ? photos[t.appwriteId] : null);
            const pUrl = pEntry ? (typeof pEntry === 'string' ? pEntry : (pEntry.photoUrl || '')) : '';
            if (pUrl) t.photoUrl = pUrl;
          });
          renderCandidates();
        }
      });
"""
    if "// Listen to /candidate_photos in Firebase RTDB" not in portal:
        portal = portal.replace("rtdb.ref('/candidate_assessments').on('value'", portal_photos_listener + "\n      rtdb.ref('/candidate_assessments').on('value'")

    with open('public/assessment-portal.html', 'w', encoding='utf-8') as f:
        f.write(portal)
    print("public/assessment-portal.html patched with candidate_photos sync!")

patch_persistence()
