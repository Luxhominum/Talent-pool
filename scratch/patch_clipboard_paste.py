def patch_clipboard():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Drop Zone HTML in photo modal
    old_dropzone = """        <!-- File Upload Zone -->
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-size: 12px; font-weight: 600;">Upload File Gambar (PNG / JPG / WEBP)</label>
          <div id="photoDropZone" style="border: 2px dashed #CBD5E1; border-radius: 10px; padding: 16px; text-align: center; background: #F8FAFC; cursor: pointer; transition: all 0.15s ease;" onclick="document.getElementById('photoFileInput').click()">
            <input type="file" id="photoFileInput" accept="image/*" style="display: none;" onchange="handlePhotoFileSelected(event)">
            <div style="font-size: 24px; margin-bottom: 4px;">📷</div>
            <div style="font-size: 12.5px; font-weight: 600; color: #1E293B;">Klik untuk memilih file foto</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Otomatis dikompresi &amp; dioptimasi (Maks 10MB)</div>
          </div>
        </div>"""

    new_dropzone = """        <!-- File Upload & Clipboard Paste Zone -->
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-size: 12px; font-weight: 700; color: #1E293B; display: flex; justify-content: space-between; align-items: center;">
            <span>Tempel Screenshot / Upload File</span>
            <span style="font-size: 11px; font-weight: 600; color: #2563EB;">⚡ Dukung Ctrl + V</span>
          </label>
          <div id="photoDropZone" tabindex="0" style="border: 2px dashed #3B82F6; border-radius: 10px; padding: 18px 14px; text-align: center; background: #EFF6FF; cursor: pointer; transition: all 0.15s ease; outline: none;" onclick="document.getElementById('photoFileInput').click()">
            <input type="file" id="photoFileInput" accept="image/*" style="display: none;" onchange="handlePhotoFileSelected(event)">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 22px; margin-bottom: 5px;">
              <span>📋</span>
              <span style="font-size: 13px; opacity: 0.4;">/</span>
              <span>📁</span>
            </div>
            <div style="font-size: 13.5px; font-weight: 700; color: #1E40AF;">
              Tekan <kbd style="background: #FFFFFF; border: 1.5px solid #93C5FD; padding: 2px 7px; border-radius: 4px; font-size: 11.5px; font-family: var(--font-mono); box-shadow: 0 1px 2px rgba(0,0,0,0.05); color: #1E3A8A;">Ctrl + V</kbd> untuk Tempel Screenshot
            </div>
            <div style="font-size: 11.5px; color: #2563EB; margin-top: 4px;">
              atau klik untuk memilih file dari komputer (PNG / JPG / WEBP)
            </div>
            <div style="font-size: 10.5px; color: #64748B; margin-top: 8px; background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 6px; display: inline-block;">
              💡 <em>Screenshot dengan <strong>Win + Shift + S</strong>, lalu langsung tekan <strong>Ctrl + V</strong> di sini</em>
            </div>
          </div>
        </div>"""

    if old_dropzone in content:
        content = content.replace(old_dropzone, new_dropzone)
    else:
        print("Warning: old_dropzone not exact match, checking pattern...")

    # 2. Add Clipboard paste & Drag-and-Drop JavaScript listeners
    paste_js = """
    /* ---------------------------------------------------- */
    /* CLIPBOARD PASTE & DRAG-AND-DROP PHOTO HANDLERS       */
    /* ---------------------------------------------------- */
    window.addEventListener('paste', async (e) => {
      const photoModal = document.getElementById('candidatePhotoModalBackdrop');
      const isPhotoModalOpen = photoModal && photoModal.style.display !== 'none';
      const drawer = document.getElementById('talentDrawer');
      const isDrawerOpen = drawer && drawer.classList.contains('open');

      if (!isPhotoModalOpen && !isDrawerOpen) return;

      const items = (e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData) || {}).items;
      if (!items || !items.length) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type && item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            try {
              showToast('📋 Menempel screenshot dari clipboard...');
              const compressed = await compressImageFile(blob, 600, 600, 0.85);

              if (isPhotoModalOpen) {
                stagedPhotoDataUrl = compressed;
                const urlInput = document.getElementById('photoUrlInput');
                if (urlInput) urlInput.value = '';
                const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
                renderPhotoModalPreview(compressed, talent ? talent.name : 'Candidate');
                showToast('✅ Screenshot berhasil ditempel! Klik "Simpan Foto" untuk menyimpan.');
              } else if (isDrawerOpen) {
                const input = document.getElementById('inputPhotoUrl');
                if (input) input.value = compressed;
                updateDrawerPhotoPreview(compressed);
                showToast('✅ Screenshot berhasil ditempel ke formulir.');
              }
            } catch (err) {
              console.error('Clipboard paste image error:', err);
              showToast('Gagal memproses gambar dari clipboard: ' + err.message);
            }
          }
          return;
        }
      }
    });

    // Drag and drop listeners for Photo Drop Zone
    document.addEventListener('DOMContentLoaded', () => {
      initPhotoDropZoneEvents();
    });

    function initPhotoDropZoneEvents() {
      const dropZone = document.getElementById('photoDropZone');
      if (!dropZone) return;

      ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.style.borderColor = '#1D4ED8';
          dropZone.style.background = '#DBEAFE';
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.style.borderColor = '#3B82F6';
          dropZone.style.background = '#EFF6FF';
        }, false);
      });

      dropZone.addEventListener('drop', async (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type && file.type.startsWith('image/')) {
            try {
              showToast('Memproses file foto...');
              const compressed = await compressImageFile(file, 600, 600, 0.85);
              stagedPhotoDataUrl = compressed;
              const urlInput = document.getElementById('photoUrlInput');
              if (urlInput) urlInput.value = '';
              const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
              renderPhotoModalPreview(compressed, talent ? talent.name : 'Candidate');
              showToast('✅ Foto berhasil dimuat. Klik "Simpan Foto".');
            } catch (err) {
              showToast('Gagal memproses file: ' + err.message);
            }
          } else {
            showToast('Harap pilih file gambar (PNG, JPG, WEBP).');
          }
        }
      }, false);
    }
    """

    if "/* CLIPBOARD PASTE & DRAG-AND-DROP PHOTO HANDLERS */" not in content:
        content = content.replace("</script>\n</body>", paste_js + "\n  </script>\n</body>")

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("public/index.html patched with clipboard paste and drag & drop support successfully!")

patch_clipboard()
