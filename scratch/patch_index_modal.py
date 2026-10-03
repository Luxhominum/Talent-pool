import re

def patch_index():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add CSS
    css_to_add = """
    /* Candidate Avatar & Photo Placeholder Styles */
    .candidate-avatar-holder {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #0F172A;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      font-family: var(--font-mono);
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      border: 2px solid #FFFFFF;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .candidate-avatar-holder:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
    }
    .candidate-avatar-holder img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: block;
    }
    .avatar-upload-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #2563EB;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #FFFFFF;
      font-size: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      transition: background 0.15s ease, transform 0.15s ease;
    }
    .candidate-avatar-holder:hover .avatar-upload-badge {
      background: #1D4ED8;
      transform: scale(1.15);
    }
    .candidate-table-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #0F172A;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      font-family: var(--font-mono);
      border: 1px solid #E2E8F0;
    }
    .candidate-table-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: block;
    }
  </style>"""
    
    if "/* Candidate Avatar & Photo Placeholder Styles */" not in content:
        content = content.replace("  </style>\n</head>", css_to_add + "\n</head>")

    # 2. Add Candidate Photo Modal HTML after candidateProfileModalBackdrop
    modal_html = """
  <!-- Candidate Photo Upload & Avatar Modal -->
  <div class="modal-backdrop" id="candidatePhotoModalBackdrop" style="display: none; z-index: 2400; align-items: center; justify-content: center;" onclick="if(event.target === this) closeCandidatePhotoModal()">
    <div class="modal-card" style="max-width: 440px; width: 92%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border-radius: 14px; overflow: hidden; padding: 0;">
      <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-light); background: #F8FAFC; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #2563EB; font-weight: 700;">Pas Foto / Avatar</span>
          <h2 id="photoModalCandidateName" style="font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 2px 0 0 0;">Foto Profil Kandidat</h2>
          <div id="photoModalCandidateId" style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">PGE-000</div>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closeCandidatePhotoModal()">✕</button>
      </div>

      <div class="modal-body" style="padding: 20px;">
        <!-- Photo Preview Box -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 18px;">
          <div id="photoPreviewContainer" style="width: 110px; height: 110px; border-radius: 50%; border: 3px solid #E2E8F0; overflow: hidden; background: #0F172A; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 28px; font-weight: 700; font-family: var(--font-mono); box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 8px;">
            <span id="photoPreviewInitials">--</span>
          </div>
          <div style="font-size: 11.5px; color: #64748B; text-align: center;">Pratinjau Foto Profil / Pas Foto 3×4</div>
        </div>

        <!-- File Upload Zone -->
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-size: 12px; font-weight: 600;">Upload File Gambar (PNG / JPG / WEBP)</label>
          <div id="photoDropZone" style="border: 2px dashed #CBD5E1; border-radius: 10px; padding: 16px; text-align: center; background: #F8FAFC; cursor: pointer; transition: all 0.15s ease;" onclick="document.getElementById('photoFileInput').click()">
            <input type="file" id="photoFileInput" accept="image/*" style="display: none;" onchange="handlePhotoFileSelected(event)">
            <div style="font-size: 24px; margin-bottom: 4px;">📷</div>
            <div style="font-size: 12.5px; font-weight: 600; color: #1E293B;">Klik untuk memilih file foto</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Otomatis dikompresi &amp; dioptimasi (Maks 10MB)</div>
          </div>
        </div>

        <!-- URL Input Alternative -->
        <div class="form-group" style="margin-bottom: 18px;">
          <label class="form-label" style="font-size: 12px; font-weight: 600;">Atau Masukkan Link / URL Foto</label>
          <div style="display: flex; gap: 8px;">
            <input type="url" id="photoUrlInput" class="form-input" placeholder="https://example.com/foto.jpg" oninput="handlePhotoUrlInput(this.value)" style="font-size: 12px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="handlePhotoUrlInput(document.getElementById('photoUrlInput').value)" style="white-space: nowrap; font-size: 11.5px;">Cek URL</button>
          </div>
        </div>

        <!-- Modal Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 14px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="removeCandidatePhoto()" style="color: #DC2626; border-color: #FECACA; font-size: 11.5px;">
            🗑️ Hapus Foto
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="closeCandidatePhotoModal()">Batal</button>
            <button type="button" class="btn btn-primary btn-sm" onclick="saveActiveCandidatePhoto()">Simpan Foto</button>
          </div>
        </div>
      </div>
    </div>
  </div>
"""
    if "id=\"candidatePhotoModalBackdrop\"" not in content:
        # insert after id="candidateProfileModalBackdrop" closing div
        target_marker = '<!-- Multi-Portfolio Gallery Modal -->'
        content = content.replace(target_marker, modal_html + "\n  " + target_marker)

    # 3. Update profModalAvatar in HTML
    content = content.replace(
        '<div id="profModalAvatar" style="width: 44px; height: 44px; border-radius: 50%; background: #111827; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; font-family: var(--font-mono); box-shadow: 0 2px 6px rgba(0,0,0,0.15);">\n            P\n          </div>',
        '<div id="profModalAvatar" class="candidate-avatar-holder" onclick="openCandidatePhotoModal(currentProfileTalentId)" title="Klik untuk ganti / upload foto kandidat">\n            P\n            <div class="avatar-upload-badge" title="Ganti / Upload Foto">📷</div>\n          </div>'
    )

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched index styles and modal structure successfully.")

patch_index()
