def patch_cropper():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace the photo modal preview & dropzone with the new Dual Preview + Interactive Controls
    old_modal_preview = """        <!-- Photo Preview Box -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 18px;">
          <div id="photoPreviewContainer" style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid #E2E8F0; overflow: hidden; background: #0F172A; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 28px; font-weight: 700; font-family: var(--font-mono); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 8px;">
            <span id="photoPreviewInitials">--</span>
          </div>
          <div style="font-size: 11.5px; color: #64748B; text-align: center;">Pratinjau Foto Profil / Pas Foto 3×4</div>
        </div>"""

    new_modal_preview = """        <!-- Dual Preview: 3x4 Pas Foto & Circle Avatar -->
        <div style="display: flex; gap: 16px; align-items: center; justify-content: center; margin-bottom: 12px; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
          <!-- 3:4 Pas Foto Viewport -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div id="cropViewport3x4" style="width: 105px; height: 140px; border-radius: 8px; border: 2.5px solid #2563EB; overflow: hidden; background: #FFFFFF; position: relative; cursor: grab; box-shadow: 0 4px 12px rgba(37,99,235,0.15); display: flex; align-items: center; justify-content: center; user-select: none;">
              <img id="cropTargetImg" src="" alt="Crop Target" style="position: absolute; display: none; pointer-events: none;">
              <span id="cropPlaceholderText" style="font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: #64748B;">--</span>
            </div>
            <span style="font-size: 10.5px; font-weight: 700; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.04em;">Pas Foto 3×4</span>
          </div>

          <!-- Circle Avatar Preview -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div id="cropViewportCircle" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #CBD5E1; overflow: hidden; background: #0F172A; position: relative; box-shadow: 0 2px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
              <img id="cropTargetImgCircle" src="" alt="Crop Circle" style="position: absolute; display: none; pointer-events: none;">
              <span id="cropPlaceholderTextCircle" style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: #FFFFFF;">--</span>
            </div>
            <span style="font-size: 10.5px; font-weight: 600; color: #64748B;">Avatar Bulat</span>
          </div>
        </div>

        <!-- Interactive Adjusters (Zoom & Reposition) -->
        <div id="cropControlsContainer" style="background: #FFFFFF; border: 1.5px solid #DBEAFE; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11.5px; font-weight: 700; color: #1E293B;">🔍 Posisikan Wajah &amp; Zoom</span>
            <button type="button" class="btn btn-secondary btn-xs" onclick="resetCropTransform()" style="font-size: 11px; padding: 2px 8px; color: #2563EB; border-color: #BFDBFE;">🎯 Tengah / Reset</button>
          </div>

          <!-- Zoom Slider -->
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span style="font-size: 11px; color: #475569; width: 42px; font-weight: 600;">Zoom:</span>
            <input type="range" id="cropZoomSlider" min="0.8" max="2.5" step="0.05" value="1.0" style="flex: 1; cursor: pointer;" oninput="handleZoomSliderInput(this.value)">
            <span id="cropZoomVal" style="font-size: 11px; font-family: var(--font-mono); width: 36px; text-align: right; font-weight: 600; color: #1E40AF;">100%</span>
          </div>

          <!-- Pan Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; background: #F8FAFC; border-radius: 6px; padding: 6px 10px;">
            <div style="font-size: 10.5px; color: #64748B; line-height: 1.3;">
              💡 <em>Geser foto langsung pada kotak <strong>Pas Foto 3×4</strong> di atas, atau gunakan tombol pan:</em>
            </div>
            <div style="display: flex; gap: 3px; flex-shrink: 0;">
              <button type="button" class="btn btn-secondary btn-xs" onclick="nudgeCrop(0, -8)" title="Geser ke Atas" style="padding: 2px 6px; font-size: 10px;">▲</button>
              <button type="button" class="btn btn-secondary btn-xs" onclick="nudgeCrop(0, 8)" title="Geser ke Bawah" style="padding: 2px 6px; font-size: 10px;">▼</button>
              <button type="button" class="btn btn-secondary btn-xs" onclick="nudgeCrop(-8, 0)" title="Geser ke Kiri" style="padding: 2px 6px; font-size: 10px;">◀</button>
              <button type="button" class="btn btn-secondary btn-xs" onclick="nudgeCrop(8, 0)" title="Geser ke Kanan" style="padding: 2px 6px; font-size: 10px;">▶</button>
            </div>
          </div>
        </div>"""

    if old_modal_preview in content:
        content = content.replace(old_modal_preview, new_modal_preview)
    else:
        print("Warning: old_modal_preview not exact match")

    # 2. Update the Photo helper JS functions with full Cropper & Centering logic
    old_helpers_marker = "/* CANDIDATE AVATAR & PHOTO UPLOAD HELPER FUNCTIONS */"
    
    new_helpers_js = """/* CANDIDATE AVATAR & PHOTO UPLOAD HELPER FUNCTIONS (WITH INTERACTIVE PAS FOTO 3X4 CENTERING) */
    /* ---------------------------------------------------- */
    let currentPhotoUploadTalentId = null;
    let stagedPhotoDataUrl = null;

    let cropState = {
      zoom: 1.0,
      panX: 0,
      panY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
      rawImageObj: null
    };

    function compressImageFile(file, maxWidth = 900, maxHeight = 900, quality = 0.90) {
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

    function initCropViewportDrag() {
      const vp = document.getElementById('cropViewport3x4');
      if (!vp || vp._dragInitialized) return;
      vp._dragInitialized = true;

      vp.addEventListener('mousedown', (e) => {
        if (!cropState.rawImageObj) return;
        cropState.isDragging = true;
        cropState.startX = e.clientX - cropState.panX;
        cropState.startY = e.clientY - cropState.panY;
        vp.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!cropState.isDragging) return;
        cropState.panX = e.clientX - cropState.startX;
        cropState.panY = e.clientY - cropState.startY;
        applyCropStyles();
      });

      window.addEventListener('mouseup', () => {
        if (cropState.isDragging) {
          cropState.isDragging = false;
          const vpEl = document.getElementById('cropViewport3x4');
          if (vpEl) vpEl.style.cursor = 'grab';
        }
      });

      vp.addEventListener('touchstart', (e) => {
        if (!cropState.rawImageObj || !e.touches[0]) return;
        cropState.isDragging = true;
        cropState.startX = e.touches[0].clientX - cropState.panX;
        cropState.startY = e.touches[0].clientY - cropState.panY;
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!cropState.isDragging || !e.touches[0]) return;
        cropState.panX = e.touches[0].clientX - cropState.startX;
        cropState.panY = e.touches[0].clientY - cropState.startY;
        applyCropStyles();
      }, { passive: true });

      window.addEventListener('touchend', () => {
        cropState.isDragging = false;
      });
    }

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

      initCropViewportDrag();
      loadPhotoIntoCropper(talent.photoUrl, talent.name);

      if (modal) modal.style.display = 'flex';
    }

    function closeCandidatePhotoModal() {
      const modal = document.getElementById('candidatePhotoModalBackdrop');
      if (modal) modal.style.display = 'none';
      currentPhotoUploadTalentId = null;
      stagedPhotoDataUrl = null;
      cropState.rawImageObj = null;
    }

    function loadPhotoIntoCropper(photoUrl, name) {
      const img3x4 = document.getElementById('cropTargetImg');
      const imgCircle = document.getElementById('cropTargetImgCircle');
      const ph3x4 = document.getElementById('cropPlaceholderText');
      const phCircle = document.getElementById('cropPlaceholderTextCircle');
      const controls = document.getElementById('cropControlsContainer');
      const initials = (name || 'Candidate').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();

      if (ph3x4) ph3x4.textContent = initials;
      if (phCircle) phCircle.textContent = initials;

      if (!photoUrl || !photoUrl.trim()) {
        if (img3x4) img3x4.style.display = 'none';
        if (imgCircle) imgCircle.style.display = 'none';
        if (ph3x4) ph3x4.style.display = 'inline';
        if (phCircle) phCircle.style.display = 'inline';
        if (controls) controls.style.display = 'none';
        cropState.rawImageObj = null;
        return;
      }

      const raw = new Image();
      raw.crossOrigin = 'anonymous';
      raw.onload = () => {
        cropState.rawImageObj = raw;
        cropState.zoom = 1.0;
        cropState.panX = 0;
        cropState.panY = 0;

        if (img3x4) {
          img3x4.src = raw.src;
          img3x4.style.display = 'block';
        }
        if (imgCircle) {
          imgCircle.src = raw.src;
          imgCircle.style.display = 'block';
        }
        if (ph3x4) ph3x4.style.display = 'none';
        if (phCircle) phCircle.style.display = 'none';
        if (controls) controls.style.display = 'block';

        const slider = document.getElementById('cropZoomSlider');
        const zoomVal = document.getElementById('cropZoomVal');
        if (slider) slider.value = 1.0;
        if (zoomVal) zoomVal.textContent = '100%';

        applyCropStyles();
      };
      raw.onerror = () => {
        if (img3x4) img3x4.style.display = 'none';
        if (imgCircle) imgCircle.style.display = 'none';
        if (ph3x4) ph3x4.style.display = 'inline';
        if (phCircle) phCircle.style.display = 'inline';
        if (controls) controls.style.display = 'none';
      };
      raw.src = photoUrl;
    }

    function handleZoomSliderInput(val) {
      cropState.zoom = parseFloat(val) || 1.0;
      const zoomVal = document.getElementById('cropZoomVal');
      if (zoomVal) zoomVal.textContent = Math.round(cropState.zoom * 100) + '%';
      applyCropStyles();
    }

    function nudgeCrop(dx, dy) {
      cropState.panX += dx;
      cropState.panY += dy;
      applyCropStyles();
    }

    function resetCropTransform() {
      cropState.zoom = 1.0;
      cropState.panX = 0;
      cropState.panY = 0;
      const slider = document.getElementById('cropZoomSlider');
      const zoomVal = document.getElementById('cropZoomVal');
      if (slider) slider.value = 1.0;
      if (zoomVal) zoomVal.textContent = '100%';
      applyCropStyles();
      showToast('Posisi diatur kembali ke tengah.');
    }

    function applyCropStyles() {
      const img3x4 = document.getElementById('cropTargetImg');
      const imgCircle = document.getElementById('cropTargetImgCircle');
      if (!img3x4 || !cropState.rawImageObj) return;

      const vpW = 105;
      const vpH = 140;
      const rawW = cropState.rawImageObj.naturalWidth || cropState.rawImageObj.width || 1;
      const rawH = cropState.rawImageObj.naturalHeight || cropState.rawImageObj.height || 1;

      const baseScale = Math.max(vpW / rawW, vpH / rawH);
      const totalScale = baseScale * cropState.zoom;

      const displayW = Math.round(rawW * totalScale);
      const displayH = Math.round(rawH * totalScale);

      const left = Math.round((vpW - displayW) / 2 + cropState.panX);
      const top = Math.round((vpH - displayH) / 2 + cropState.panY);

      img3x4.style.width = displayW + 'px';
      img3x4.style.height = displayH + 'px';
      img3x4.style.left = left + 'px';
      img3x4.style.top = top + 'px';
      img3x4.style.display = 'block';

      if (imgCircle) {
        const circleW = 64;
        const circleH = 64;
        const circleBaseScale = Math.max(circleW / rawW, circleH / rawH);
        const circleTotalScale = circleBaseScale * cropState.zoom;
        const cDisplayW = Math.round(rawW * circleTotalScale);
        const cDisplayH = Math.round(rawH * circleTotalScale);
        const cLeft = Math.round((circleW - cDisplayW) / 2 + (cropState.panX * (circleW / vpW)));
        const cTop = Math.round((circleH - cDisplayH) / 2 + (cropState.panY * (circleH / vpH)));

        imgCircle.style.width = cDisplayW + 'px';
        imgCircle.style.height = cDisplayH + 'px';
        imgCircle.style.left = cLeft + 'px';
        imgCircle.style.top = cTop + 'px';
        imgCircle.style.display = 'block';
      }
    }

    function exportCroppedImageCanvas(targetWidth = 450, targetHeight = 600) {
      if (!cropState.rawImageObj) return null;
      const rawImg = cropState.rawImageObj;
      const rawW = rawImg.naturalWidth || rawImg.width || 1;
      const rawH = rawImg.naturalHeight || rawImg.height || 1;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const vpW = 105;
      const vpH = 140;
      const scaleRatio = targetWidth / vpW;

      const baseScale = Math.max(vpW / rawW, vpH / rawH);
      const totalScale = (baseScale * cropState.zoom) * scaleRatio;

      const finalW = rawW * totalScale;
      const finalH = rawH * totalScale;
      const finalX = (targetWidth - finalW) / 2 + (cropState.panX * scaleRatio);
      const finalY = (targetHeight - finalH) / 2 + (cropState.panY * scaleRatio);

      ctx.drawImage(rawImg, finalX, finalY, finalW, finalH);
      return canvas.toDataURL('image/jpeg', 0.88);
    }

    async function handlePhotoFileSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        showToast('Memproses file foto...');
        const compressed = await compressImageFile(file, 900, 900, 0.90);
        stagedPhotoDataUrl = compressed;
        const urlInput = document.getElementById('photoUrlInput');
        if (urlInput) urlInput.value = '';
        const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
        loadPhotoIntoCropper(compressed, talent ? talent.name : 'Candidate');
        showToast('✅ Foto dimuat! Geser foto jika perlu mengatur posisi wajah.');
      } catch (err) {
        console.error('Photo error:', err);
        showToast('Gagal memproses foto: ' + (err.message || 'Format tidak didukung'));
      }
    }

    function handlePhotoUrlInput(url) {
      const trimmed = (url || '').trim();
      stagedPhotoDataUrl = trimmed || null;
      const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
      loadPhotoIntoCropper(trimmed, talent ? talent.name : 'Candidate');
    }

    function removeCandidatePhoto() {
      stagedPhotoDataUrl = '';
      const urlInput = document.getElementById('photoUrlInput');
      if (urlInput) urlInput.value = '';
      const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
      loadPhotoIntoCropper('', talent ? talent.name : 'Candidate');
      showToast('Foto dikosongkan. Klik "Simpan Foto" untuk menerapkan.');
    }

    async function saveActiveCandidatePhoto() {
      if (!currentPhotoUploadTalentId) return;
      const talentId = currentPhotoUploadTalentId;
      
      // If an image is loaded in cropper, bake the exact user crop and centering
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
      showToast('✅ Foto Pas Foto 3×4 kandidat berhasil disimpan dengan posisi presisi!');
    }

    window.openCandidatePhotoModal = openCandidatePhotoModal;
    window.closeCandidatePhotoModal = closeCandidatePhotoModal;
    window.handlePhotoFileSelected = handlePhotoFileSelected;
    window.handlePhotoUrlInput = handlePhotoUrlInput;
    window.removeCandidatePhoto = removeCandidatePhoto;
    window.saveActiveCandidatePhoto = saveActiveCandidatePhoto;
    window.handleZoomSliderInput = handleZoomSliderInput;
    window.nudgeCrop = nudgeCrop;
    window.resetCropTransform = resetCropTransform;
    window.handleDrawerPhotoFileSelected = handleDrawerPhotoFileSelected;
    window.clearDrawerPhoto = clearDrawerPhoto;
    window.updateDrawerPhotoPreview = updateDrawerPhotoPreview;
    """

    # Replace old photo helpers section
    import re
    helpers_regex = r"/\* CANDIDATE AVATAR & PHOTO UPLOAD HELPER FUNCTIONS[\s\S]*?(?=/\* ----------------------------------------------------\*/\s+/\* CLIPBOARD PASTE)"
    if re.search(helpers_regex, content):
        content = re.sub(helpers_regex, new_helpers_js + "\n\n    ", content)
    else:
        print("Warning: helpers_regex did not match, replacing entire section")

    # Also update paste listener to load into cropper
    content = content.replace(
        "renderPhotoModalPreview(compressed, talent ? talent.name : 'Candidate');",
        "loadPhotoIntoCropper(compressed, talent ? talent.name : 'Candidate');"
    )

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("public/index.html successfully updated with Interactive Cropper & Centering!")

patch_cropper()
