import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_rubric_block = '''    <!-- Structured Live Interview Rubric (Core Tool) -->
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
      </table>
    </div>'''

new_rubric_block = '''    <!-- Structured Live Interview Rubric (Role Adaptive) -->
    <div class="section-card" style="margin-bottom: 9px;">
      <div class="section-card-title">
        <span>📋 Rubrik Penilaian Wawancara: ${escapeHtml(talent.role || 'Kandidat')}</span>
        <span style="font-size: 9px; color: #2563EB; font-weight: 700; font-family: 'Geist Mono', monospace;">
          Skala: 1 (Buruk) s/d 5 (Sangat Unggul)
        </span>
      </div>
      <table class="rubric-table">
        <thead>
          <tr>
            <th style="width: 25%;">Kompetensi &amp; Aspek</th>
            <th style="width: 48%;">Panduan Observasi &amp; Pertanyaan Inti</th>
            <th style="width: 27%; text-align: center;">Skor Evaluasi (Centang)</th>
          </tr>
        </thead>
        <tbody>
          ${(function() {
            const rLower = (talent.role || '').toLowerCase();
            const isMkt = rLower.includes('marketplace') || rLower.includes('sales');
            if (isMkt) {
              return `
                <tr>
                  <td><strong>1. Motivation &amp; Role Fit</strong></td>
                  <td style="color: #475569;">Pengalaman relevan, tanggung jawab mandiri, dan motivasi spesifik di PGE</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
                <tr>
                  <td><strong>2. Marketplace &amp; Performance</strong></td>
                  <td style="color: #475569;">Pemahaman listing, upload, promo, order, dan hubungan traffic vs conversion</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
                <tr>
                  <td><strong>3. Analytical &amp; Commercial</strong></td>
                  <td style="color: #475569;">Analisis kasus (traffic tinggi penjualan rendah, cek data), respon harga kompetitor &amp; margin</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
                <tr>
                  <td><strong>4. Data / Excel Capabilities</strong></td>
                  <td style="color: #475569;">Pengalaman Sheets/Excel: laporan, formula, sorting/filtering, pivot/lookup data</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
                <tr>
                  <td><strong>5. Problem Solving &amp; Agility</strong></td>
                  <td style="color: #475569;">Penyelesaian masalah sulit, prioritas kerja (chat/order/laporan), dan respon terhadap feedback</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
              `;
            } else {
              return `
                <tr>
                  <td><strong>1. Komunikasi &amp; Sikap</strong></td>
                  <td style="color: #475569;">Kejelasan artikulasi, percaya diri, keterbukaan ide &amp; antusiasme</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
                <tr>
                  <td><strong>2. Skill Teknis &amp; Estetika</strong></td>
                  <td style="color: #475569;">Penguasaan teknis konten, orisinalitas portofolio, dan visual taste</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
                <tr>
                  <td><strong>3. Problem Solving &amp; Agility</strong></td>
                  <td style="color: #475569;">Respon studi kasus, inisiatif mandiri, dan fleksibilitas deadline</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
                <tr>
                  <td><strong>4. Culture Fit &amp; Etika</strong></td>
                  <td style="color: #475569;">Integritas kerja, kesiapan ritme kerja tim PGE, dan motivasi kerja</td>
                  <td><div class="score-check-group"><span class="score-pill">1</span><span class="score-pill">2</span><span class="score-pill">3</span><span class="score-pill">4</span><span class="score-pill">5</span></div></td>
                </tr>
              `;
            }
          })()}
        </tbody>
      </table>
    </div>'''

assert old_rubric_block in html, "Could not find old rubric block in report card"
html = html.replace(old_rubric_block, new_rubric_block)

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Successfully updated printCandidateReportCard with role-adaptive Marketplace rubric!")
