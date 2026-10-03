with open('public/js/frexor-data.js', 'r', encoding='utf-8') as f:
    code = f.read()

# remove old export footer if present
if 'module.exports' in code:
    code = code[:code.index('if (typeof window !==')]

new_functions = """
/**
 * Calculate Frexor Test Scores and Standard IQ Conversion
 */
function calculateFrexorScores(answers) {
  let correctCount = 0;
  const domainBreakdown = {
    Verbal: { correct: 0, total: 0 },
    Spasial: { correct: 0, total: 0 },
    Numerik: { correct: 0, total: 0 },
    Logika: { correct: 0, total: 0 }
  };
  const itemAnalysis = [];

  FREXOR_QUESTIONS.forEach(q => {
    const userAns = answers[q.id];
    let isCorrect = false;
    if (userAns !== undefined && userAns !== null) {
      const uStr = String(userAns).trim().toLowerCase();
      const cStr = String(q.correct_answer).trim().toLowerCase();
      // Match exact or match letter / value
      isCorrect = (uStr === cStr) || (uStr.startsWith(cStr)) || (cStr.startsWith(uStr));
    }

    if (isCorrect) correctCount++;

    if (domainBreakdown[q.domain]) {
      domainBreakdown[q.domain].total++;
      if (isCorrect) domainBreakdown[q.domain].correct++;
    }

    itemAnalysis.push({
      num: q.num,
      id: q.id,
      category: q.category,
      domain: q.domain,
      question: q.question,
      image: q.image || null,
      user_answer: userAns || null,
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      explanation: q.explanation
    });
  });

  const totalQuestions = FREXOR_QUESTIONS.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Standard IQ Scale (SD 15)
  let iqEstimate = 70;
  let categoryLabel = 'Di Bawah Rata-rata';
  let badgeColor = '#64748B';

  if (correctCount >= 55) {
    iqEstimate = Math.round(130 + ((correctCount - 55) / 5) * 15);
    categoryLabel = 'Sangat Superior / Genius';
    badgeColor = '#7C3AED';
  } else if (correctCount >= 48) {
    iqEstimate = Math.round(120 + ((correctCount - 48) / 6) * 9);
    categoryLabel = 'Superior';
    badgeColor = '#2563EB';
  } else if (correctCount >= 40) {
    iqEstimate = Math.round(110 + ((correctCount - 40) / 7) * 9);
    categoryLabel = 'Di Atas Rata-rata';
    badgeColor = '#059669';
  } else if (correctCount >= 30) {
    iqEstimate = Math.round(90 + ((correctCount - 30) / 9) * 19);
    categoryLabel = 'Rata-rata';
    badgeColor = '#D97706';
  } else {
    iqEstimate = Math.max(70, Math.round(70 + (correctCount / 30) * 19));
    categoryLabel = 'Di Bawah Rata-rata';
    badgeColor = '#DC2626';
  }

  // Domain percentages
  Object.keys(domainBreakdown).forEach(d => {
    const item = domainBreakdown[d];
    item.percent = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
  });

  return {
    score: correctCount,
    total: totalQuestions,
    percentage: percentage,
    iq_estimate: iqEstimate,
    category: categoryLabel,
    badge_color: badgeColor,
    domains: domainBreakdown,
    item_analysis: itemAnalysis
  };
}

/**
 * Render Frexor Aptitude Dossier HTML Card
 */
function renderFrexorDossierHtml(frexor) {
  if (!frexor || typeof frexor.score !== 'number') {
    return '';
  }

  const domains = frexor.domains || {};
  const v = domains.Verbal || { correct: 0, total: 20, percent: 0 };
  const s = domains.Spasial || { correct: 0, total: 16, percent: 0 };
  const n = domains.Numerik || { correct: 0, total: 9, percent: 0 };
  const l = domains.Logika || { correct: 0, total: 15, percent: 0 };

  const auditId = 'frexorAuditTable_' + Math.random().toString(36).substring(2, 8);

  let auditRows = '';
  if (Array.isArray(frexor.item_analysis)) {
    auditRows = frexor.item_analysis.map(item => {
      const isOk = item.is_correct;
      const statusIcon = isOk ? '✅' : '❌';
      const statusBadge = isOk 
        ? '<span style="color:#059669; font-weight:700;">Benar</span>' 
        : '<span style="color:#DC2626; font-weight:700;">Salah</span>';
      
      const imgThumb = item.image 
        ? `<div style="margin-top:6px;"><img src="${item.image}" style="max-height:48px; max-width:180px; border:1px solid #E2E8F0; border-radius:4px;" /></div>` 
        : '';

      return `
        <tr style="border-bottom: 1px solid #F1F5F9; font-size: 12px;">
          <td style="padding: 8px 10px; font-weight: 700; color: #1E293B;">#${item.num}</td>
          <td style="padding: 8px 10px;">
            <span style="background: #EEF2FF; color: #4338CA; padding: 1px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 600;">
              ${item.domain}
            </span>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${item.category}</div>
            ${imgThumb}
          </td>
          <td style="padding: 8px 10px; font-weight: 600; color: ${isOk ? '#059669' : '#DC2626'};">
            ${item.user_answer || '<span style="color:#94A3B8; font-style:italic;">(Kosong)</span>'}
          </td>
          <td style="padding: 8px 10px; font-weight: 700; color: #047857;">
            ${item.correct_answer}
          </td>
          <td style="padding: 8px 10px; text-align: center;">
            ${statusIcon} ${statusBadge}
          </td>
          <td style="padding: 8px 10px; color: #475569; font-size: 11.5px; line-height: 1.4;">
            ${item.explanation || '-'}
          </td>
        </tr>
      `;
    }).join('');
  }

  return `
    <div class="detail-card-premium" style="border-left: 5px solid #4338CA; margin-bottom: 24px; background: #FFFFFF; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #E2E8F0; border-left: 5px solid #4338CA;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 18px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 18px;">⚡</span>
            <h4 style="font-size: 16px; font-weight: 700; color: #1E1B4B; margin: 0;">PAS frexor® Aptitude Test [IQ]</h4>
            <span style="background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;">
              Mensa Standard (60 Soal • 30 Mnt)
            </span>
          </div>
          <p style="font-size: 12.5px; color: #64748B; margin: 0;">
            Hasil pengukuran intelegensi umum, daya abstraksi spasial, pemecahan masalah numerik, dan penalaran deduktif.
          </p>
        </div>

        <!-- Big IQ Badge -->
        <div style="display: flex; align-items: center; gap: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 18px; border-radius: 12px;">
          <div style="text-align: right;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Estimasi IQ</div>
            <div style="font-size: 13px; font-weight: 700; color: ${frexor.badge_color || '#4338CA'};">${frexor.category}</div>
            <div style="font-size: 11px; color: #94A3B8;">Skor Mentah: <strong>${frexor.score} / ${frexor.total}</strong> (${frexor.percentage}%)</div>
          </div>
          <div style="font-size: 32px; font-weight: 800; font-family: var(--font-mono, monospace); color: ${frexor.badge_color || '#4338CA'}; line-height: 1;">
            ${frexor.iq_estimate}
          </div>
        </div>
      </div>

      <!-- 4 Domain Grids -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <!-- Verbal -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px 14px; border-radius: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #1E293B;">🗣️ Kemampuan Verbal</span>
            <span style="font-weight: 700; color: #4338CA;">${v.correct}/${v.total} (${v.percent}%)</span>
          </div>
          <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
            <div style="width: ${v.percent}%; height: 100%; background: #4338CA; border-radius: 999px;"></div>
          </div>
          <div style="font-size: 10.5px; color: #64748B; margin-top: 4px;">Anagram, analogi kata, klasifikasi makna</div>
        </div>

        <!-- Spasial -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px 14px; border-radius: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #1E293B;">📐 Penalaran Spasial</span>
            <span style="font-weight: 700; color: #0284C7;">${s.correct}/${s.total} (${s.percent}%)</span>
          </div>
          <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
            <div style="width: ${s.percent}%; height: 100%; background: #0284C7; border-radius: 999px;"></div>
          </div>
          <div style="font-size: 10.5px; color: #64748B; margin-top: 4px;">Rotasi figur, matriks 4x4, analogi gambar</div>
        </div>

        <!-- Numerik -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px 14px; border-radius: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #1E293B;">🔢 Numerik & Deret</span>
            <span style="font-weight: 700; color: #059669;">${n.correct}/${n.total} (${n.percent}%)</span>
          </div>
          <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
            <div style="width: ${n.percent}%; height: 100%; background: #059669; border-radius: 999px;"></div>
          </div>
          <div style="font-size: 10.5px; color: #64748B; margin-top: 4px;">Deret bilangan, aljabar, persentase & koin</div>
        </div>

        <!-- Logika Deduktif -->
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px 14px; border-radius: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #1E293B;">🧠 Logika Deduktif</span>
            <span style="font-weight: 700; color: #7C3AED;">${l.correct}/${l.total} (${l.percent}%)</span>
          </div>
          <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
            <div style="width: ${l.percent}%; height: 100%; background: #7C3AED; border-radius: 999px;"></div>
          </div>
          <div style="font-size: 10.5px; color: #64748B; margin-top: 4px;">Silogisme fiktif, pemecahan sandi alien</div>
        </div>
      </div>

      <!-- Expandable Audit Button -->
      <div>
        <button type="button" 
                onclick="const el=document.getElementById('${auditId}'); el.style.display=(el.style.display==='none'?'block':'none'); this.querySelector('.arrow-ic').textContent=(el.style.display==='none'?'▼':'▲');"
                style="width: 100%; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 10px 16px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: #334155; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
          <span>🔍 Rincian Audit Seluruh 60 Butir Soal Frexor & Kunci Jawaban Resmi</span>
          <span class="arrow-ic">▼</span>
        </button>

        <div id="${auditId}" style="display: none; margin-top: 12px; max-height: 440px; overflow-y: auto; border: 1px solid #E2E8F0; border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #F1F5F9; font-size: 11px; text-transform: uppercase; color: #475569; position: sticky; top: 0; z-index: 10;">
                <th style="padding: 8px 10px; width: 45px;">No</th>
                <th style="padding: 8px 10px; width: 180px;">Domain / Kategori</th>
                <th style="padding: 8px 10px; width: 120px;">Respon Kandidat</th>
                <th style="padding: 8px 10px; width: 120px;">Kunci Benar</th>
                <th style="padding: 8px 10px; width: 85px; text-align: center;">Status</th>
                <th style="padding: 8px 10px;">Pembahasan / Logika</th>
              </tr>
            </thead>
            <tbody>
              ${auditRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.FREXOR_QUESTIONS = FREXOR_QUESTIONS;
  window.calculateFrexorScores = calculateFrexorScores;
  window.renderFrexorDossierHtml = renderFrexorDossierHtml;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FREXOR_QUESTIONS, calculateFrexorScores, renderFrexorDossierHtml };
}
"""

with open('public/js/frexor-data.js', 'w', encoding='utf-8') as f:
    f.write(code + new_functions)

print('Enriched public/js/frexor-data.js with scoring and UI functions!')
