with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add generateAndSendAssessmentLink function before window exports
target_func_placement = "window.getCandidateApplications = getCandidateApplications;"
new_func_code = """    function generateAndSendAssessmentLink(talentId) {
      const talent = (typeof state !== 'undefined' && state.talents) ? state.talents.find(t => (t.id === talentId || t.talentId === talentId || t.appwriteId === talentId)) : null;
      if (!talent) {
        showToast('⚠️ Data kandidat tidak ditemukan.');
        return;
      }

      const phoneClean = formatToInternationalPhone(talent.phone);
      if (!phoneClean) {
        showToast('⚠️ Kandidat tidak memiliki nomor telepon / WhatsApp yang valid.');
        return;
      }

      // Generate 6-digit random numeric token
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      // Save token to Firebase RTDB /assessmentTokens
      if (typeof rtdb !== 'undefined' && rtdb) {
        rtdb.ref('/assessmentTokens/' + token).set({
          talentId: talent.id,
          candidateName: talent.name,
          role: talent.role || 'Freelance Content Creator',
          phone: phoneClean,
          createdAt: Date.now(),
          expiresAt: expiresAt,
          status: 'active'
        }).then(() => {
          rtdb.ref('/talents/' + talent.id + '/assessmentToken').set(token);
          rtdb.ref('/talents/' + talent.id + '/assessmentTokenCreatedAt').set(Date.now());
        }).catch(err => {
          console.warn('Token sync log:', err);
        });
      }

      const cleanDigits = phoneClean.replace(/\\+/g, '');
      const testUrl = 'https://pge-talentpool.web.app/test?token=' + token;
      const messageText = `Halo Kak ${talent.name},\\n\\nSelamat! Anda lolos ke tahap asesmen online PGE Talent Pool untuk posisi ${talent.role || 'Freelance Content Creator'}.\\n\\nSilakan klik link berikut untuk memulai tes melalui smartphone/laptop Anda:\\n👉 ${testUrl}\\n\\nKode Akses (OTP): ${token} (Aktif selama 24 jam).\\nEstimasi waktu pengerjaan: 15–20 menit. Pastikan koneksi internet stabil.\\n\\nTerima kasih,\\nTim HR PGE`;

      const waUrl = 'https://wa.me/' + cleanDigits + '?text=' + encodeURIComponent(messageText);
      window.open(waUrl, '_blank');
      showToast('✓ Link Asesmen Online & OTP (' + token + ') berhasil dibuat dan dibuka di WhatsApp!');
    }

    window.generateAndSendAssessmentLink = generateAndSendAssessmentLink;
    window.getCandidateApplications = getCandidateApplications;"""

if target_func_placement in content:
    content = content.replace(target_func_placement, new_func_code, 1)
    print("1. generateAndSendAssessmentLink function added.")
else:
    print("WARNING: target_func_placement not found!")

# 2. Add Kirim Link Tes button in modal left column
modal_wa_old = """        ${phoneClean ? `
          <a href="https://wa.me/${phoneClean.replace(/\\+/g, '')}?text=${encodeURIComponent(`Halo Kak ${talent.name}, kami dari Tim HR PGE Talent Pool ingin mendiskusikan peluang kerja sama terkait posisi ${talent.role || 'Freelance Content Creator'}.`)}" target="_blank" class="btn btn-wa" style="width: 100%; justify-content: center; padding: 9px 14px; font-size: 12px; font-weight: 600; margin-top: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Contact via WhatsApp ↗
          </a>
        ` : ''}"""

modal_wa_new = """        ${phoneClean ? `
          <a href="https://wa.me/${phoneClean.replace(/\\+/g, '')}?text=${encodeURIComponent(`Halo Kak ${talent.name}, kami dari Tim HR PGE Talent Pool ingin mendiskusikan peluang kerja sama terkait posisi ${talent.role || 'Freelance Content Creator'}.`)}" target="_blank" class="btn btn-wa" style="width: 100%; justify-content: center; padding: 9px 14px; font-size: 12px; font-weight: 600; margin-top: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Contact via WhatsApp ↗
          </a>
          <button type="button" class="btn btn-secondary" onclick="generateAndSendAssessmentLink('${talent.id}')" style="width: 100%; justify-content: center; padding: 9px 14px; font-size: 12px; font-weight: 700; color: #1E40AF; border-color: #BFDBFE; background: #EFF6FF; margin-top: 6px;" title="Buat Token OTP 6-digit dan buka WhatsApp siap kirim ke kandidat">
            📲 Kirim Link Tes Online ke WA
          </button>
        ` : ''}"""

if modal_wa_old in content:
    content = content.replace(modal_wa_old, modal_wa_new, 1)
    print("2. Kirim Link Tes button added to candidate profile modal left column.")
else:
    print("WARNING: modal_wa_old not found!")

# 3. Add to Unassessed banner in tab
unassessed_old = """            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary" onclick="launchOnSiteAssessment('${talent.id}')" style="font-size: 12px; padding: 8px 16px;">
                🚀 Mulai Asesmen On-Site di Laptop Ini ↗
              </button>"""

unassessed_new = """            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary" onclick="generateAndSendAssessmentLink('${talent.id}')" style="font-size: 12px; padding: 8px 16px; background: #2563EB;">
                📲 Kirim Link Tes Online via WhatsApp ↗
              </button>
              <button type="button" class="btn btn-secondary" onclick="launchOnSiteAssessment('${talent.id}')" style="font-size: 12px; padding: 8px 16px;">
                🚀 Mulai On-Site di Laptop Ini ↗
              </button>"""

if unassessed_old in content:
    content = content.replace(unassessed_old, unassessed_new, 1)
    print("3. Kirim Link Tes button added to unassessed banner.")
else:
    print("WARNING: unassessed_old not found!")

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch complete.")
