import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update modal header buttons: add Cetak Report Card button
modal_header_old = """        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" id="profModalAdminEditBtn" class="btn btn-secondary btn-sm" style="display: none;" onclick="switchToEditDrawer()">
            ✏️ Edit Candidate
          </button>
          <button type="button" class="btn btn-secondary btn-icon" onclick="closeCandidateProfileModal()">✕</button>
        </div>"""

modal_header_new = """        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" id="profModalPrintBtn" class="btn btn-secondary btn-sm" onclick="printCandidateReportCard(currentProfileTalentId)" title="Cetak Report Card &amp; Lembar Wawancara 2 Halaman A4">
            🖨️ Cetak Report Card
          </button>
          <button type="button" id="profModalAdminEditBtn" class="btn btn-secondary btn-sm" style="display: none;" onclick="switchToEditDrawer()">
            ✏️ Edit Candidate
          </button>
          <button type="button" class="btn btn-secondary btn-icon" onclick="closeCandidateProfileModal()">✕</button>
        </div>"""

if modal_header_old in content:
    content = content.replace(modal_header_old, modal_header_new, 1)
    print("1. Modal header updated with Cetak Report Card button.")
else:
    print("WARNING: modal_header_old not found!")

# 2. Update Table View action buttons
table_action_old = """            <td style="text-align: right;">
              ${isSuperAdmin() ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openTalentDetail('${talent.id}')">Edit</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); deleteCandidate('${talent.id}', '${escapeHtml(talent.name)}')" style="color: var(--pastel-red-text); margin-left: 4px;">Delete</button>
              ` : `
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openCandidateProfileModal('${talent.id}')">View Profile ↗</button>
              `}
            </td>"""

table_action_new = """            <td style="text-align: right;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); printCandidateReportCard('${talent.id}')" title="Cetak Report Card &amp; Lembar Interview A4" style="margin-right: 4px; padding: 4px 8px;">🖨️</button>
              ${isSuperAdmin() ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openTalentDetail('${talent.id}')">Edit</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); deleteCandidate('${talent.id}', '${escapeHtml(talent.name)}')" style="color: var(--pastel-red-text); margin-left: 4px;">Delete</button>
              ` : `
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openCandidateProfileModal('${talent.id}')">View Profile ↗</button>
              `}
            </td>"""

if table_action_old in content:
    content = content.replace(table_action_old, table_action_new, 1)
    print("2. Table view updated with print button.")
else:
    print("WARNING: table_action_old not found!")

# 3. Update Assessment tab button title
assess_btn_old = """<button type="button" class="btn btn-secondary btn-sm" onclick="printCandidateDossier('${talent.id}')" style="font-size: 11px; padding: 4px 10px; font-weight: 700; color: #1E40AF; border-color: #BFDBFE; background: #EFF6FF;" title="Cetak laporan resmi 1 lembar atau Simpan PDF">
                🖨️ Cetak Dossier
              </button>"""

assess_btn_new = """<button type="button" class="btn btn-secondary btn-sm" onclick="printCandidateReportCard('${talent.id}')" style="font-size: 11px; padding: 4px 10px; font-weight: 700; color: #1E40AF; border-color: #BFDBFE; background: #EFF6FF;" title="Cetak Report Card &amp; Lembar Wawancara 2 Halaman A4">
                🖨️ Cetak Report Card
              </button>"""

if assess_btn_old in content:
    content = content.replace(assess_btn_old, assess_btn_new, 1)
    print("3. Assessment tab button updated.")
else:
    print("WARNING: assess_btn_old not found!")

# 4. Replace printCandidateDossier with printCandidateReportCard
# Find start of function printCandidateDossier and end before function renderPentagonMatrixSvg
pattern = r"function printCandidateDossier\(talentId\) \{[\s\S]*?printWindow\.document\.close\(\);\s*\}"

new_print_code = """function printCandidateReportCard(talentId) {
      const talent = (typeof state !== 'undefined' && state.talents) ? state.talents.find(t => (t.id === talentId || t.talentId === talentId || t.appwriteId === talentId)) : null;
      if (!talent) {
        alert('Data kandidat tidak ditemukan.');
        return;
      }

      const assessment = (typeof state !== 'undefined' && state.assessments) ? (state.assessments[talent.id] || talent.assessment) : talent.assessment;
      const b5 = assessment ? (assessment.dimensions || assessment.scores) : null;
      const hasAssessment = Boolean(assessment && assessment.status === 'completed');
      const dateStr = assessment && assessment.completedAt 
        ? new Date(assessment.completedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) 
        : 'Belum Diambil';

      const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      // Resolve Applications
      const relatedApps = (typeof getCandidateApplications === 'function') ? getCandidateApplications(talent) : [talent];
      const otherApps = relatedApps.filter(a => a.id !== talent.id);

      // Resolve Discussions / Team Evaluator Comments
      const discussData = (typeof state !== 'undefined' && state.candidateDiscussions) ? state.candidateDiscussions[talent.id] : null;
      const discussObj = (discussData && discussData.messages) ? discussData.messages : {};
      const discussList = Object.values(discussObj);
      discussList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // Resolve Portfolio & CV
      let primaryPortoUrl = '';
      if (talent.portfolioItems && talent.portfolioItems.length > 0) {
        const firstValid = talent.portfolioItems.find(p => isValidDisplayUrl(p.url));
        if (firstValid) primaryPortoUrl = firstValid.url;
      }
      if (!primaryPortoUrl && isValidDisplayUrl(talent.portfolioUrl)) {
        primaryPortoUrl = talent.portfolioUrl;
      }

      const cvUrl = isValidDisplayUrl(talent.cvUrl) ? talent.cvUrl : '';
      const phoneClean = formatToInternationalPhone(talent.phone);

      const portoQr = primaryPortoUrl 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(normalizeExternalUrl(primaryPortoUrl))}`
        : '';
      const cvOrWaQr = cvUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(normalizeExternalUrl(cvUrl))}`
        : (phoneClean ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent('https://wa.me/' + phoneClean.replace(/\\+/g, ''))}` : '');

      // Resolve Baseline Skills
      const skills = (talent.skills && talent.skills.length > 0) ? talent.skills : [
        { name: 'Foto', rating: 4 },
        { name: 'Video', rating: 4 },
        { name: 'Editing', rating: 4 },
        { name: 'Sense / Taste', rating: 4 }
      ];

      // Pre-render SVGs in parent context
      const pentagonSvgMarkup = (hasAssessment && b5 && typeof renderPentagonMatrixSvg === 'function') 
        ? renderPentagonMatrixSvg(b5) 
        : '';
      const discSvgMarkup = (hasAssessment && assessment.disc && typeof renderDiscLineGraphSvg === 'function') 
        ? renderDiscLineGraphSvg(assessment.disc) 
        : '';
      const cognitiveMarkup = (hasAssessment && assessment.cognitive && typeof renderCognitiveAspectsBarsHtml === 'function') 
        ? renderCognitiveAspectsBarsHtml(assessment.cognitive) 
        : '';

      const printWindow = window.open('', '_blank', 'width=1060,height=920,menubar=no,toolbar=no,location=no,status=no');
      if (!printWindow) {
        alert('Browser memblokir jendela cetak pop-up. Harap izinkan pop-up pada peramban Anda untuk mencetak Report Card.');
        return;
      }

      const reportCardHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Report Card &amp; Evaluasi Wawancara - ${talent.id} ${escapeHtml(talent.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0F172A;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.4;
      background: #0B1120;
    }
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0F172A;
      border-bottom: 1px solid #1E293B;
      color: #FFFFFF;
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .btn-print-cta {
      background: #2563EB;
      color: #FFFFFF;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-print-cta:hover { background: #1D4ED8; }
    .btn-close-cta {
      background: rgba(255,255,255,0.1);
      color: #E2E8F0;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .page-sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 16px auto;
      background: #FFFFFF;
      box-shadow: 0 10px 25px rgba(0,0,0,0.35);
      padding: 10mm 12mm;
      position: relative;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    @media print {
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print-bar { display: none !important; }
      .page-sheet {
        margin: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        width: 100% !important;
        min-height: auto !important;
      }
    }
    
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .brand-title {
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0F172A;
    }
    .brand-sub {
      font-size: 9.5px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 1px;
    }
    .confidential-tag {
      font-family: 'Geist Mono', monospace;
      font-size: 8.5px;
      font-weight: 700;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      padding: 3px 8px;
      border-radius: 4px;
      color: #334155;
      display: inline-block;
      text-align: right;
    }
    
    .grid-bio {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1.2fr 1.2fr;
      gap: 8px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 9px;
    }
    .bio-lbl {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.04em;
    }
    .bio-val {
      font-size: 11.5px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 1px;
    }
    
    .multi-job-banner {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 10px;
      color: #1E40AF;
      margin-bottom: 9px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .section-card {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      background: #FFFFFF;
      padding: 9px 11px;
      margin-bottom: 9px;
    }
    .section-card-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 5px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .qr-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .qr-card {
      display: flex;
      gap: 10px;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px;
    }
    .qr-img {
      width: 82px;
      height: 82px;
      border-radius: 4px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      flex-shrink: 0;
    }
    
    .rubric-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    .rubric-table th, .rubric-table td {
      border: 1px solid #E2E8F0;
      padding: 5px 8px;
    }
    .rubric-table th {
      background: #F8FAFC;
      font-weight: 700;
      color: #334155;
      text-align: left;
    }
    .score-check-group {
      display: flex;
      gap: 7px;
      justify-content: center;
      align-items: center;
    }
    .score-box-option {
      font-family: 'Geist Mono', monospace;
      font-size: 9px;
      font-weight: 600;
      color: #475569;
      border: 1px solid #CBD5E1;
      border-radius: 3px;
      padding: 1px 5px;
      background: #FFFFFF;
    }
    
    .live-notes-area {
      min-height: 52px;
      border: 1px dashed #CBD5E1;
      background: #FAFAFA;
      border-radius: 4px;
      padding: 6px 8px;
      font-size: 9.5px;
      color: #94A3B8;
      font-style: italic;
    }
    
    .decision-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #F1F5F9;
      font-size: 10px;
    }
    
    .page-footer {
      position: absolute;
      bottom: 8mm;
      left: 12mm;
      right: 12mm;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #94A3B8;
      border-top: 1px solid #F1F5F9;
      padding-top: 4px;
      font-family: 'Geist Mono', monospace;
    }
  </style>
</head>
<body>
  <!-- Floating No-Print Toolbar -->
  <div class="no-print-bar">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px;">
        <span>🖨️</span> PGE Candidate Report Card &amp; Interview Dossier
      </div>
      <div style="font-size: 11px; opacity: 0.8; font-family: 'Geist Mono', monospace;">[${talent.id}] ${escapeHtml(talent.name)}</div>
    </div>
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 6px;">
        <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500;">
          <input type="radio" name="printScope" value="all" checked onchange="setPrintScope('all')">
          2 Halaman (Lengkap)
        </label>
        <span style="opacity: 0.3;">|</span>
        <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 500;">
          <input type="radio" name="printScope" value="p1" onchange="setPrintScope('p1')">
          Hanya Halaman 1 (Interview Sheet)
        </label>
      </div>
      <button onclick="window.print()" class="btn-print-cta">🖨️ Cetak / Simpan PDF</button>
      <button onclick="window.close()" class="btn-close-cta">✕ Tutup</button>
    </div>
  </div>

  <!-- HALAMAN 1: INTERVIEW EVALUATION SHEET & CANDIDATE PROFILE -->
  <div class="page-sheet" id="reportCardPage1">
    <div class="doc-header">
      <div>
        <div class="brand-title">PGE TALENT POOL</div>
        <div class="brand-sub">Lembar Evaluasi Wawancara &amp; Profil Kandidat</div>
      </div>
      <div style="text-align: right;">
        <div class="confidential-tag">CONFIDENTIAL • INTERNAL RECRUITMENT ONLY</div>
        <div style="font-size: 9px; color: #64748B; margin-top: 3px; font-family: 'Geist Mono', monospace;">
          Ref ID: ${talent.id} • Cetak: ${todayStr}
        </div>
      </div>
    </div>

    <!-- Candidate Core Bio -->
    <div class="grid-bio">
      <div>
        <div class="bio-lbl">Nama Lengkap</div>
        <div class="bio-val" style="font-size: 13px;">${escapeHtml(talent.name)}</div>
      </div>
      <div>
        <div class="bio-lbl">Posisi Dilamar</div>
        <div class="bio-val" style="color: #2563EB;">${escapeHtml(talent.role || 'Freelance Content Creator')}</div>
      </div>
      <div>
        <div class="bio-lbl">Kontak WhatsApp &amp; Email</div>
        <div class="bio-val" style="font-size: 10px; font-family: 'Geist Mono', monospace;">
          ${phoneClean || '-'}<br>${escapeHtml(talent.email || '-')}
        </div>
      </div>
      <div>
        <div class="bio-lbl">Domisili / Pendidikan / Gaji</div>
        <div class="bio-val" style="font-size: 10px;">
          ${escapeHtml(talent.domisili || '-')} • ${escapeHtml(talent.education || '-')}<br>
          <span style="color: #059669; font-weight: 600;">Exp: ${escapeHtml(talent.expectedSalary || 'Standard')}</span>
        </div>
      </div>
    </div>

    <!-- Multi-Job Awareness Banner (if applicable) -->
    ${otherApps.length > 0 ? `
      <div class="multi-job-banner">
        <span>
          🔗 <strong>Multi-Job Candidate:</strong> Terdaftar juga melamar pada ${otherApps.map(a => `<strong>${escapeHtml(a.role || 'Role')}</strong> (${a.id} - ${a.stage || 'Prospect'})`).join(', ')}.
        </span>
        <span style="font-family: 'Geist Mono', monospace; font-size: 9px; font-weight: 700; background: #DBEAFE; padding: 2px 6px; border-radius: 4px;">
          Total ${relatedApps.length} Berkas
        </span>
      </div>
    ` : ''}

    <!-- Digital Portfolio Bridge (QR Codes) -->
    <div class="section-card">
      <div class="section-card-title">
        <span>🌐 Portofolio Digital &amp; Dokumen CV (Scan via Kamera HP)</span>
        <span style="font-size: 9px; color: #64748B; font-weight: 500;">Arahkan kamera smartphone untuk membuka karya langsung</span>
      </div>
      <div class="qr-grid">
        <!-- QR 1: Portfolio -->
        <div class="qr-card">
          ${portoQr ? `<img src="${portoQr}" alt="QR Portfolio" class="qr-img" />` : '<div class="qr-img" style="display:flex;align-items:center;justify-content:center;font-size:9px;color:#94A3B8;text-align:center;">Link Tidak Tersedia</div>'}
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 11px; color: #0F172A; display: flex; align-items: center; gap: 4px;">
              <span>📁</span> Portofolio Kreatif &amp; Media
            </div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 3px; word-break: break-all; font-family: 'Geist Mono', monospace; line-height: 1.3;">
              ${primaryPortoUrl ? escapeHtml(primaryPortoUrl.length > 60 ? primaryPortoUrl.slice(0, 58) + '...' : primaryPortoUrl) : 'Belum melampirkan URL portofolio'}
            </div>
            <div style="font-size: 8.5px; color: #059669; font-weight: 600; margin-top: 4px;">
              ✓ Siap scan langsung saat wawancara
            </div>
          </div>
        </div>

        <!-- QR 2: CV / Profile & Rating -->
        <div class="qr-card">
          ${cvOrWaQr ? `<img src="${cvOrWaQr}" alt="QR CV" class="qr-img" />` : '<div class="qr-img" style="display:flex;align-items:center;justify-content:center;font-size:9px;color:#94A3B8;text-align:center;">No QR</div>'}
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 700; font-size: 11px; color: #0F172A; display: flex; align-items: center; gap: 4px;">
              <span>📄</span> ${cvUrl ? 'Curriculum Vitae (PDF)' : 'WhatsApp Kontak Langsung'}
            </div>
            <div style="margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
              ${skills.slice(0, 4).map(s => `
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; padding: 2px 5px; border-radius: 3px; display: flex; justify-content: space-between;">
                  <span style="color: #64748B;">${s.name}:</span>
                  <strong style="color: #D97706;">★ ${s.rating}</strong>
                </div>
              `).join('')}
            </div>
            <div style="font-size: 9px; color: #1E40AF; font-weight: 700; margin-top: 4px;">
              Rating Baseline: ★ ${(talent.overallRating || 3).toFixed(1)} / 5.0
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Discussion & Prior Screener Comments -->
    <div class="section-card">
      <div class="section-card-title">
        <span>💬 Catatan Tim Reviewer &amp; Riwayat Evaluasi Awal</span>
        <span style="font-size: 9px; color: #64748B; font-weight: 500;">
          ${discussList.length} Catatan Internal
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        ${discussList.length > 0 ? discussList.slice(0, 3).map(m => `
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 5px 8px; font-size: 9.5px; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <strong style="color: #0F172A;">${escapeHtml(m.senderName || m.senderEmail || 'Evaluator')}:</strong>
              <span style="color: #334155; margin-left: 4px;">${escapeHtml(m.text || '')}</span>
            </div>
            ${m.tag ? `<span style="font-size: 8.5px; font-weight: 700; background: #DBEAFE; color: #1E40AF; padding: 1px 5px; border-radius: 3px; white-space: nowrap; margin-left: 8px;">${escapeHtml(m.tag)}</span>` : ''}
          </div>
        `).join('') : `
          <div style="font-size: 9.5px; color: #64748B; font-style: italic; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 5px 8px; border-radius: 4px;">
            ${talent.notes ? escapeHtml(talent.notes) : 'Belum ada catatan awal tim. Gunakan rubrik di bawah untuk penilaian wawancara langsung.'}
          </div>
        `}
      </div>
    </div>

    <!-- Structured Live Interview Rubric (Core Tool) -->
    <div class="section-card" style="margin-bottom: 9px;">
      <div class="section-card-title">
        <span>📋 Rubrik Penilaian Wawancara Tatap Muka</span>
        <span style="font-size: 9px; color: #2563EB; font-weight: 700; font-family: 'Geist Mono', monospace;">
          Skala: 1 (Buruk) s/d 5 (Sangat Unggul)
        </span>
      </div>
      <table class="rubric-table">
        <thead>
          <tr>
            <th style="width: 28%;">Aspek Penilaian</th>
            <th style="width: 44%;">Deskripsi Kriteria Observasi</th>
            <th style="width: 28%; text-align: center;">Skor Evaluasi (Centang)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Komunikasi &amp; Sikap</strong></td>
            <td style="color: #475569;">Kejelasan artikulasi, rasa percaya diri, keterbukaan ide &amp; antusiasme</td>
            <td>
              <div class="score-check-group">
                <span class="score-box-option">[ 1 ]</span>
                <span class="score-box-option">[ 2 ]</span>
                <span class="score-box-option">[ 3 ]</span>
                <span class="score-box-option">[ 4 ]</span>
                <span class="score-box-option">[ 5 ]</span>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>2. Skill Teknis &amp; Estetika</strong></td>
            <td style="color: #475569;">Penguasaan teknis produksi/konten, orisinalitas portofolio, dan taste visual</td>
            <td>
              <div class="score-check-group">
                <span class="score-box-option">[ 1 ]</span>
                <span class="score-box-option">[ 2 ]</span>
                <span class="score-box-option">[ 3 ]</span>
                <span class="score-box-option">[ 4 ]</span>
                <span class="score-box-option">[ 5 ]</span>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>3. Problem Solving &amp; Agility</strong></td>
            <td style="color: #475569;">Respon terhadap studi kasus, inisiatif mandiri, dan fleksibilitas menghadapi deadline</td>
            <td>
              <div class="score-check-group">
                <span class="score-box-option">[ 1 ]</span>
                <span class="score-box-option">[ 2 ]</span>
                <span class="score-box-option">[ 3 ]</span>
                <span class="score-box-option">[ 4 ]</span>
                <span class="score-box-option">[ 5 ]</span>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>4. Culture Fit &amp; Etika</strong></td>
            <td style="color: #475569;">Integritas kerja, kesiapan ritme kerja tim PGE, dan motivasi jangka panjang</td>
            <td>
              <div class="score-check-group">
                <span class="score-box-option">[ 1 ]</span>
                <span class="score-box-option">[ 2 ]</span>
                <span class="score-box-option">[ 3 ]</span>
                <span class="score-box-option">[ 4 ]</span>
                <span class="score-box-option">[ 5 ]</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Live Interviewer Handwritten Notes & Final Decision -->
    <div class="section-card">
      <div class="section-card-title">
        <span>📝 Catatan Observasi Langsung &amp; Keputusan Akhir Interviewer</span>
        <div style="font-size: 9px; font-family: 'Geist Mono', monospace;">
          Total Skor: <strong style="color: #2563EB;">_____ / 20</strong> &nbsp;|&nbsp; Rata-rata: <strong style="color: #2563EB;">_____ / 5.0</strong>
        </div>
      </div>
      <div class="live-notes-area">
        Tuliskan catatan observasi spesifik, highlight kekuatan, atau catatan tindak lanjut kandidat di sini...
      </div>
      <div class="decision-row">
        <div style="display: flex; gap: 14px; font-weight: 700;">
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: #15803D;">
            <input type="checkbox" style="width: 13px; height: 13px;"> REKOMENDASI (HIRE)
          </label>
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: #D97706;">
            <input type="checkbox" style="width: 13px; height: 13px;"> DIPERTIMBANGKAN (HOLD)
          </label>
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: #DC2626;">
            <input type="checkbox" style="width: 13px; height: 13px;"> TIDAK DISARANKAN
          </label>
        </div>
        <div style="display: flex; align-items: flex-end; gap: 20px; font-size: 9px;">
          <div>
            <div style="border-bottom: 1px solid #0F172A; width: 130px; height: 26px;"></div>
            <div style="margin-top: 2px; text-align: center; color: #475569;">Tanda Tangan Interviewer</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Page 1 Footer -->
    <div class="page-footer">
      <span>PGE TALENT POOL RECRUITMENT DOSSIER</span>
      <span>HALAMAN 1 DARI <span class="page-total-label">${hasAssessment ? '2' : '1'}</span></span>
    </div>
  </div>

  <!-- HALAMAN 2: PSYCHOMETRIC & COGNITIVE DOSSIER -->
  <div class="page-sheet page-break" id="reportCardPage2">
    <div class="doc-header">
      <div>
        <div class="brand-title">PGE TALENT POOL</div>
        <div class="brand-sub">Dossier Hasil Asesmen Psikometrik &amp; Kognitif On-Site</div>
      </div>
      <div style="text-align: right;">
        <div class="confidential-tag">DIAGNOSTIC REPORT • CONFIDENTIAL</div>
        <div style="font-size: 9px; color: #64748B; margin-top: 3px; font-family: 'Geist Mono', monospace;">
          ${talent.id} • ${escapeHtml(talent.name)} • ${dateStr}
        </div>
      </div>
    </div>

    ${hasAssessment ? `
      <!-- Psychometrics: Big Five & DISC Side-by-Side -->
      <div style="display: grid; grid-template-columns: 1.15fr 1fr; gap: 10px; margin-bottom: 10px;">
        <!-- Left: Big Five Pentagon -->
        <div class="section-card" style="margin-bottom: 0;">
          <div class="section-card-title">
            <span>🧠 Pentagon Matrix: Big Five Personality</span>
            <span style="font-family: 'Geist Mono', monospace; font-size: 9px; color: #2563EB;">5 Dimensi Karakter</span>
          </div>
          ${pentagonSvgMarkup || '<p>Tidak ada data visual</p>'}
          <div style="margin-top: 6px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 9.5px;">
            ${b5 ? Object.entries(b5).map(([k, d]) => `
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 4px 6px; border-radius: 4px; display: flex; justify-content: space-between;">
                <span style="color: #64748B;">${k}:</span>
                <strong style="color: #1E40AF;">${d.percentage}% (${d.level})</strong>
              </div>
            `).join('') : ''}
          </div>
        </div>

        <!-- Right: DISC Behavioral Curve -->
        <div class="section-card" style="margin-bottom: 0;">
          <div class="section-card-title">
            <span>🧩 DISC Behavioral Element Graph</span>
            <span style="font-family: 'Geist Mono', monospace; font-size: 9px; color: #7C3AED;">Pola Kerja Alami</span>
          </div>
          ${discSvgMarkup || '<p>Tidak ada data visual</p>'}
          ${assessment.disc ? `
            <div style="margin-top: 6px; padding: 8px 10px; background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 6px;">
              <div style="font-weight: 700; color: #7C3AED; font-size: 11px; display: flex; justify-content: space-between;">
                <span>Tipe ${assessment.disc.profilePattern} (${assessment.disc.primaryName})</span>
                <span style="font-family: 'Geist Mono', monospace; font-size: 10px;">D:${assessment.disc.tally.change.D} I:${assessment.disc.tally.change.I} S:${assessment.disc.tally.change.S} C:${assessment.disc.tally.change.C}</span>
              </div>
              <div style="font-size: 9.5px; color: #5B21B6; margin-top: 3px; line-height: 1.35;">
                ${escapeHtml(assessment.disc.desc || '')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Cognitive & Business Logic Aspects -->
      <div class="section-card" style="margin-bottom: 10px;">
        <div class="section-card-title">
          <span>📊 Aspek Logika, Penalaran Kognitif &amp; Analisis Bisnis</span>
          <span style="font-family: 'Geist Mono', monospace; font-size: 11px; font-weight: 700; color: #059669;">
            Skor Total: ${assessment.cognitive ? assessment.cognitive.score : 0} / ${assessment.cognitive ? assessment.cognitive.total : 15} (${assessment.cognitive ? assessment.cognitive.percentage : 0}%)
          </span>
        </div>
        ${cognitiveMarkup || '<p>Tidak ada data visual kognitif</p>'}
      </div>

      <!-- Workplace Behavioral Synthesis -->
      <div class="section-card">
        <div class="section-card-title">
          <span>🎯 Sintesis Karakter Kerja &amp; Rekomendasi Penempatan</span>
        </div>
        <div style="font-size: 10px; color: #334155; line-height: 1.45; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px 12px; border-radius: 6px;">
          Berdasarkan profil kepribadian Big Five dan DISC di atas, kandidat menunjukkan kecenderungan gaya kerja alami yang terukur. Gunakan hasil psikotes ini sebagai bahan konfirmasi dan pendalaman pada lembar evaluasi wawancara di Halaman 1.
        </div>
      </div>
    ` : `
      <!-- Unassessed State Notice & QR Test Invitation -->
      <div style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 8px; padding: 40px 20px; text-align: center; margin-top: 40px;">
        <div style="font-size: 38px; margin-bottom: 12px;">⏳</div>
        <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 6px 0;">Asesmen Belum Diambil oleh Kandidat</h3>
        <p style="font-size: 11.5px; color: #64748B; max-width: 480px; margin: 0 auto 16px; line-height: 1.5;">
          Kandidat <strong>${escapeHtml(talent.name)}</strong> belum menyelesaikan tes psikometrik (Big Five, DISC) dan penalaran logika bisnis on-site.
        </p>
        <div style="display: inline-block; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 20px;">
          <div style="font-size: 10px; font-weight: 700; color: #2563EB; text-transform: uppercase; margin-bottom: 6px;">
            Scan untuk Mulai Tes di HP Kandidat:
          </div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&margin=0&data=${encodeURIComponent('https://pge-talentpool.web.app/assessment-portal.html')}" style="width: 120px; height: 120px; border-radius: 4px; border: 1px solid #CBD5E1;" alt="QR Tes On-Site" />
          <div style="font-size: 9px; color: #64748B; margin-top: 4px;">pge-talentpool.web.app/assessment-portal.html</div>
        </div>
        <div style="font-size: 10px; color: #94A3B8; margin-top: 20px;">
          Tip: Jika tidak memerlukan halaman ini saat mencetak, pilih opsi <strong>"Hanya Halaman 1"</strong> pada toolbar di atas.
        </div>
      </div>
    `}

    <!-- Page 2 Footer -->
    <div class="page-footer">
      <span>PGE TALENT POOL PSYCHOMETRIC DOSSIER</span>
      <span>HALAMAN 2 DARI <span class="page-total-label">${hasAssessment ? '2' : '1'}</span></span>
    </div>
  </div>

  <script>
    function setPrintScope(scope) {
      const p2 = document.getElementById('reportCardPage2');
      const totalLabels = document.querySelectorAll('.page-total-label');
      if (scope === 'p1') {
        if (p2) p2.style.display = 'none';
        totalLabels.forEach(el => el.textContent = '1');
      } else {
        if (p2) p2.style.display = 'block';
        totalLabels.forEach(el => el.textContent = '2');
      }
    }
  </script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(reportCardHtml);
      printWindow.document.close();
    }

    function printCandidateDossier(talentId) {
      return printCandidateReportCard(talentId);
    }"""

if re.search(pattern, content):
    content = re.sub(pattern, new_print_code, content, count=1)
    print("4. printCandidateReportCard replaced printCandidateDossier successfully.")
else:
    print("WARNING: printCandidateDossier pattern not found!")

# 5. Export to window
export_old = "window.getCandidateApplications = getCandidateApplications;"
export_new = """window.getCandidateApplications = getCandidateApplications;
    window.printCandidateReportCard = printCandidateReportCard;
    window.printCandidateDossier = printCandidateDossier;"""

if export_old in content:
    content = content.replace(export_old, export_new, 1)
    print("5. window exports updated.")
else:
    print("WARNING: export_old not found!")

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done patching public/index.html.")
