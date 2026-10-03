import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS in reportCardHtml
old_css_part = """    .page-sheet {
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
    }"""

new_css_part = """    .page-sheet {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      margin: 16px auto;
      background: #FFFFFF;
      box-shadow: 0 10px 25px rgba(0,0,0,0.35);
      padding: 7mm 12mm 8mm 12mm;
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      overflow: hidden;
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
        height: auto !important;
        max-height: none !important;
      }
    }"""

if old_css_part in content:
    content = content.replace(old_css_part, new_css_part, 1)
    print("1. Updated page-sheet CSS for strict A4 height budgeting.")
else:
    print("WARNING: old_css_part not found!")

# 2. Update rubric-table and score styles
old_rubric_css = """    .rubric-table {
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
    }"""

new_rubric_css = """    .score-calc-badge {
      font-size: 9px;
      font-family: 'Geist Mono', monospace;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      padding: 1px 7px;
      white-space: nowrap;
      flex-shrink: 0;
      font-weight: 600;
    }

    .rubric-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
    }
    .rubric-table th, .rubric-table td {
      border: 1px solid #E2E8F0;
      padding: 4px 6px;
    }
    .rubric-table th {
      background: #F8FAFC;
      font-weight: 700;
      color: #334155;
      text-align: left;
    }
    .score-check-group {
      display: flex;
      gap: 6px;
      justify-content: center;
      align-items: center;
      white-space: nowrap;
    }
    .score-pill {
      font-family: 'Geist Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      color: #0F172A;
      border: 1.5px solid #CBD5E1;
      border-radius: 4px;
      width: 22px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      box-sizing: border-box;
      flex-shrink: 0;
    }
    
    .live-notes-area {
      height: 46px;
      border: 1px solid #E2E8F0;
      background-color: #FFFFFF;
      background-image: repeating-linear-gradient(transparent, transparent 14px, #E2E8F0 15px);
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 9px;
      color: #94A3B8;
      font-style: italic;
      line-height: 15px;
    }
    
    .decision-signature-grid {
      display: grid;
      grid-template-columns: 1fr 180px;
      align-items: flex-end;
      gap: 14px;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #F1F5F9;
    }
    .decision-boxes {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .decision-pill-check {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 9px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      padding: 3px 6px;
    }
    .check-square {
      width: 12px;
      height: 12px;
      border: 1.5px solid #64748B;
      border-radius: 2px;
      background: #FFFFFF;
      display: inline-block;
      flex-shrink: 0;
    }
    .signature-col {
      text-align: center;
    }
    .sig-line {
      border-bottom: 1.5px solid #0F172A;
      width: 100%;
      height: 22px;
      margin-bottom: 2px;
    }
    .sig-label {
      font-size: 8px;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    
    .page-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94A3B8;
      border-top: 1px solid #F1F5F9;
      padding-top: 4px;
      font-family: 'Geist Mono', monospace;
    }"""

if old_rubric_css in content:
    content = content.replace(old_rubric_css, new_rubric_css, 1)
    print("2. Updated rubric and score CSS styles.")
else:
    print("WARNING: old_rubric_css not found!")

# 3. Update the rubric table HTML
old_table_html = """      <table class="rubric-table">
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
      </table>"""

new_table_html = """      <table class="rubric-table">
        <thead>
          <tr>
            <th style="width: 24%;">Aspek Penilaian</th>
            <th style="width: 46%;">Deskripsi Kriteria Observasi</th>
            <th style="width: 30%; text-align: center;">Skor Evaluasi (Centang)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Komunikasi &amp; Sikap</strong></td>
            <td style="color: #475569;">Kejelasan artikulasi, percaya diri, keterbukaan ide &amp; antusiasme</td>
            <td>
              <div class="score-check-group">
                <span class="score-pill" title="1 - Buruk">1</span>
                <span class="score-pill" title="2 - Kurang">2</span>
                <span class="score-pill" title="3 - Cukup">3</span>
                <span class="score-pill" title="4 - Bagus">4</span>
                <span class="score-pill" title="5 - Unggul">5</span>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>2. Skill Teknis &amp; Estetika</strong></td>
            <td style="color: #475569;">Penguasaan teknis konten, orisinalitas portofolio, dan visual taste</td>
            <td>
              <div class="score-check-group">
                <span class="score-pill" title="1 - Buruk">1</span>
                <span class="score-pill" title="2 - Kurang">2</span>
                <span class="score-pill" title="3 - Cukup">3</span>
                <span class="score-pill" title="4 - Bagus">4</span>
                <span class="score-pill" title="5 - Unggul">5</span>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>3. Problem Solving &amp; Agility</strong></td>
            <td style="color: #475569;">Respon studi kasus, inisiatif mandiri, dan fleksibilitas deadline</td>
            <td>
              <div class="score-check-group">
                <span class="score-pill" title="1 - Buruk">1</span>
                <span class="score-pill" title="2 - Kurang">2</span>
                <span class="score-pill" title="3 - Cukup">3</span>
                <span class="score-pill" title="4 - Bagus">4</span>
                <span class="score-pill" title="5 - Unggul">5</span>
              </div>
            </td>
          </tr>
          <tr>
            <td><strong>4. Culture Fit &amp; Etika</strong></td>
            <td style="color: #475569;">Integritas kerja, kesiapan ritme kerja tim PGE, dan motivasi kerja</td>
            <td>
              <div class="score-check-group">
                <span class="score-pill" title="1 - Buruk">1</span>
                <span class="score-pill" title="2 - Kurang">2</span>
                <span class="score-pill" title="3 - Cukup">3</span>
                <span class="score-pill" title="4 - Bagus">4</span>
                <span class="score-pill" title="5 - Unggul">5</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>"""

if old_table_html in content:
    content = content.replace(old_table_html, new_table_html, 1)
    print("3. Updated rubric table HTML with crisp score-pill boxes.")
else:
    print("WARNING: old_table_html not found!")

# 4. Update the Notes and Decision box HTML
old_notes_decision_html = """    <!-- Live Interviewer Handwritten Notes & Final Decision -->
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
    </div>"""

new_notes_decision_html = """    <!-- Live Interviewer Handwritten Notes & Final Decision -->
    <div class="section-card">
      <div class="section-card-title">
        <span>📝 Catatan Observasi &amp; Rekomendasi Interviewer</span>
        <div class="score-calc-badge">
          Total Skor: <strong style="color: #2563EB;">____ / 20</strong> &nbsp;|&nbsp; Rata-rata: <strong style="color: #2563EB;">____ / 5.0</strong>
        </div>
      </div>
      <div class="live-notes-area">
        Tuliskan catatan observasi karakter, kekuatan utama, atau poin tindak lanjut kandidat di sini...
      </div>
      <div class="decision-signature-grid">
        <div class="decision-boxes">
          <div class="decision-pill-check">
            <span class="check-square"></span>
            <span style="color: #15803D; font-weight: 700;">REKOMENDASI (HIRE)</span>
          </div>
          <div class="decision-pill-check">
            <span class="check-square"></span>
            <span style="color: #D97706; font-weight: 700;">DIPERTIMBANGKAN (HOLD)</span>
          </div>
          <div class="decision-pill-check">
            <span class="check-square"></span>
            <span style="color: #DC2626; font-weight: 700;">TIDAK DISARANKAN (REJECT)</span>
          </div>
        </div>

        <div class="signature-col">
          <div class="sig-line"></div>
          <div class="sig-label">Tanda Tangan Interviewer</div>
        </div>
      </div>
    </div>"""

if old_notes_decision_html in content:
    content = content.replace(old_notes_decision_html, new_notes_decision_html, 1)
    print("4. Updated Notes & Decision card HTML.")
else:
    print("WARNING: old_notes_decision_html not found!")

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Report card layout patch applied successfully.")
