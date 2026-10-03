def fix_cropper_definitions():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    start_marker = "    let currentPhotoUploadTalentId = null;"
    end_marker = "    window.updateDrawerPhotoPreview = updateDrawerPhotoPreview;"

    if start_marker not in content or end_marker not in content:
        print("Error: markers not found")
        return

    cropper_full_code = """    let currentPhotoUploadTalentId = null;
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

    async function handleDrawerPhotoFileSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        showToast('Memproses file foto...');
        const compressed = await compressImageFile(file, 900, 900, 0.90);
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
    window.loadPhotoIntoCropper = loadPhotoIntoCropper;
    window.handlePhotoFileSelected = handlePhotoFileSelected;
    window.handlePhotoUrlInput = handlePhotoUrlInput;
    window.removeCandidatePhoto = removeCandidatePhoto;
    window.saveActiveCandidatePhoto = saveActiveCandidatePhoto;
    window.handleZoomSliderInput = handleZoomSliderInput;
    window.nudgeCrop = nudgeCrop;
    window.resetCropTransform = resetCropTransform;
    window.handleDrawerPhotoFileSelected = handleDrawerPhotoFileSelected;
    window.clearDrawerPhoto = clearDrawerPhoto;
    window.updateDrawerPhotoPreview = updateDrawerPhotoPreview;"""

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker) + len(end_marker)

    content = content[:start_idx] + cropper_full_code + content[end_idx:]

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed loadPhotoIntoCropper and full cropper scope successfully!")

fix_cropper_definitions()
