def patch_paste():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the Dropzone in photo modal to include an explicit 1-Click Paste Button
    old_dropzone = """          <div id="photoDropZone" tabindex="0" style="border: 2px dashed #3B82F6; border-radius: 10px; padding: 18px 14px; text-align: center; background: #EFF6FF; cursor: pointer; transition: all 0.15s ease; outline: none;" onclick="document.getElementById('photoFileInput').click()">
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
          </div>"""

    new_dropzone = """          <div id="photoDropZone" tabindex="0" style="border: 2px dashed #3B82F6; border-radius: 10px; padding: 14px 14px; text-align: center; background: #EFF6FF; outline: none;">
            <input type="file" id="photoFileInput" accept="image/*" style="display: none;" onchange="handlePhotoFileSelected(event)">
            
            <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary btn-sm" onclick="pasteFromClipboardButton()" style="background: #2563EB; border-color: #2563EB; font-weight: 700; font-size: 12px; padding: 8px 16px; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">
                📋 Klik untuk Tempel dari Clipboard (Ctrl + V)
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('photoFileInput').click()" style="font-size: 12px; padding: 8px 14px; background: #FFFFFF;">
                📁 Pilih File Foto
              </button>
            </div>

            <div style="font-size: 11px; color: #1E40AF; margin-top: 4px;">
              ⚡ <strong>Cara Cepat:</strong> Screenshot dengan <strong>Win + Shift + S</strong> (atau Snipping Tool), lalu klik tombol biru di atas atau tekan <strong>Ctrl + V</strong>.
            </div>
          </div>"""

    if old_dropzone in content:
        content = content.replace(old_dropzone, new_dropzone)
    else:
        print("Warning: old_dropzone not exact match, trying regex...")
        import re
        content = re.sub(
            r'<div id="photoDropZone"[\s\S]*?<!-- URL Input Alternative -->',
            new_dropzone + '\n        </div>\n\n        <!-- URL Input Alternative -->',
            content
        )

    # 2. Update the clipboard paste JS implementation
    old_paste_js_marker = "/* CLIPBOARD PASTE & DRAG-AND-DROP PHOTO HANDLERS */"
    new_paste_js = """/* CLIPBOARD PASTE & DRAG-AND-DROP PHOTO HANDLERS (ENHANCED) */
    /* ---------------------------------------------------- */
    async function processPastedImageBlob(blob, isPhotoModalOpen, isDrawerOpen) {
      if (!blob) return;
      try {
        showToast('📋 Memproses screenshot dari clipboard...');
        const compressed = await compressImageFile(blob, 900, 900, 0.90);

        if (isPhotoModalOpen) {
          stagedPhotoDataUrl = compressed;
          const urlInput = document.getElementById('photoUrlInput');
          if (urlInput) urlInput.value = '';
          const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
          loadPhotoIntoCropper(compressed, talent ? talent.name : 'Candidate');
          showToast('✅ Screenshot berhasil ditempel! Posisikan wajah jika perlu, lalu klik "Simpan Foto".');
        } else if (isDrawerOpen) {
          const input = document.getElementById('inputPhotoUrl');
          if (input) input.value = compressed;
          updateDrawerPhotoPreview(compressed);
          showToast('✅ Screenshot berhasil ditempel ke formulir.');
        }
      } catch (err) {
        console.error('Clipboard image process error:', err);
        showToast('Gagal memproses gambar: ' + (err.message || 'Format tidak didukung'));
      }
    }

    async function pasteFromClipboardButton() {
      const photoModal = document.getElementById('candidatePhotoModalBackdrop');
      const isPhotoModalOpen = photoModal && photoModal.style.display !== 'none';
      const drawer = document.getElementById('talentDrawer');
      const isDrawerOpen = drawer && drawer.classList.contains('open');

      try {
        // 1. Try modern navigator.clipboard.read() for binary image items
        if (navigator.clipboard && navigator.clipboard.read) {
          try {
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems) {
              for (const type of clipboardItem.types) {
                if (type.startsWith('image/')) {
                  const blob = await clipboardItem.getType(type);
                  await processPastedImageBlob(blob, isPhotoModalOpen, isDrawerOpen);
                  return;
                }
              }
            }
          } catch (readErr) {
            console.warn('navigator.clipboard.read error, falling back to readText:', readErr);
          }
        }

        // 2. Try reading clipboard text (in case an image link or dataURI was copied)
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text && (text.startsWith('http') || text.startsWith('data:image/'))) {
            const trimmed = text.trim();
            if (isPhotoModalOpen) {
              stagedPhotoDataUrl = trimmed;
              const urlInput = document.getElementById('photoUrlInput');
              if (urlInput) urlInput.value = trimmed;
              const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
              loadPhotoIntoCropper(trimmed, talent ? talent.name : 'Candidate');
              showToast('✅ Link foto berhasil ditempel dari clipboard!');
            }
            return;
          }
        }

        showToast('⚠️ Belum ada screenshot di clipboard. Silakan screenshot dulu dengan Win + Shift + S lalu klik tombol ini lagi.');
      } catch (err) {
        console.warn('Clipboard read error:', err);
        showToast('Silakan tekan Ctrl + V secara langsung pada keyboard Anda.');
      }
    }

    window.pasteFromClipboardButton = pasteFromClipboardButton;

    // Attach global paste listener on document capturing phase
    document.addEventListener('paste', async (e) => {
      const photoModal = document.getElementById('candidatePhotoModalBackdrop');
      const isPhotoModalOpen = photoModal && photoModal.style.display !== 'none';
      const drawer = document.getElementById('talentDrawer');
      const isDrawerOpen = drawer && drawer.classList.contains('open');

      if (!isPhotoModalOpen && !isDrawerOpen) return;

      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      // 1. Check Files array
      if (clipboardData.files && clipboardData.files.length > 0) {
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i];
          if (file.type && file.type.startsWith('image/')) {
            e.preventDefault();
            e.stopPropagation();
            await processPastedImageBlob(file, isPhotoModalOpen, isDrawerOpen);
            return;
          }
        }
      }

      // 2. Check Items array
      if (clipboardData.items && clipboardData.items.length > 0) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item.type && item.type.indexOf('image') !== -1) {
            e.preventDefault();
            e.stopPropagation();
            const blob = item.getAsFile();
            if (blob) {
              await processPastedImageBlob(blob, isPhotoModalOpen, isDrawerOpen);
            }
            return;
          }
        }
      }

      // 3. Check Text (Data URI or Image URL)
      const pastedText = clipboardData.getData('text/plain') || '';
      if (pastedText && (pastedText.startsWith('data:image/') || pastedText.startsWith('http'))) {
        if (isPhotoModalOpen) {
          const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
          loadPhotoIntoCropper(pastedText.trim(), talent ? talent.name : 'Candidate');
          showToast('✅ Gambar berhasil dimuat.');
        }
      }
    }, true);

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
              const compressed = await compressImageFile(file, 900, 900, 0.90);
              stagedPhotoDataUrl = compressed;
              const urlInput = document.getElementById('photoUrlInput');
              if (urlInput) urlInput.value = '';
              const talent = state.talents.find(t => t.id === currentPhotoUploadTalentId);
              loadPhotoIntoCropper(compressed, talent ? talent.name : 'Candidate');
              showToast('✅ Foto berhasil dimuat. Posisikan jika perlu lalu klik "Simpan Foto".');
            } catch (err) {
              showToast('Gagal memproses file: ' + err.message);
            }
          } else {
            showToast('Harap pilih file gambar (PNG, JPG, WEBP).');
          }
        }
      }, false);
    }"""

    import re
    old_paste_regex = r"/\* CLIPBOARD PASTE & DRAG-AND-DROP PHOTO HANDLERS[\s\S]*?(?=</script>)"
    if re.search(old_paste_regex, content):
        content = re.sub(old_paste_regex, new_paste_js + "\n    ", content)
    else:
        print("Warning: old_paste_regex did not match, appending new_paste_js")

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("public/index.html enhanced with 1-Click Clipboard Paste button and robust capture listeners!")

patch_paste()
