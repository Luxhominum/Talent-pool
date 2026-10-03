const fs = require('fs');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidDisplayUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return clean.startsWith('http://') || clean.startsWith('https://');
}

function normalizeExternalUrl(url) {
  if (!url) return '';
  return url.trim();
}

function formatToInternationalPhone(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0')) cleaned = '+62' + cleaned.slice(1);
  else if (cleaned.startsWith('62') && !cleaned.startsWith('+')) cleaned = '+' + cleaned;
  return cleaned;
}

function renderPentagonMatrixSvg(dimensions) {
  const W = 520;
  const H = 300;
  const cx = 260;
  const cy = 145;
  const R = 80;

  const dims = [
    { key: 'extraversion', label: 'Extraversion', icon: '⚡' },
    { key: 'agreeableness', label: 'Agreeableness', icon: '🤝' },
    { key: 'conscientiousness', label: 'Conscientiousness', icon: '🎯' },
    { key: 'emotionalStability', label: 'Emotional Stability', icon: '🧘' },
    { key: 'intellect', label: 'Intellect / Openness', icon: '💡' }
  ];

  const angles = [0, 1, 2, 3, 4].map(i => -Math.PI / 2 + (i * 2 * Math.PI / 5));

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
  let ringsSvg = '';
  rings.forEach((scale, idx) => {
    const pts = angles.map(a => (cx + Math.cos(a) * R * scale).toFixed(1) + ',' + (cy + Math.sin(a) * R * scale).toFixed(1)).join(' ');
    const isOuter = (idx === rings.length - 1);
    ringsSvg += '<polygon points="' + pts + '" fill="' + (idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF') + '" stroke="' + (isOuter ? '#94A3B8' : '#E2E8F0') + '" stroke-width="' + (isOuter ? '1.5' : '1') + '" />';
  });

  let spokesSvg = '';
  angles.forEach(a => {
    const x2 = (cx + Math.cos(a) * R).toFixed(1);
    const y2 = (cy + Math.sin(a) * R).toFixed(1);
    spokesSvg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="2 2" />';
  });

  const dataPoints = dims.map((d, i) => {
    const dataObj = dimensions ? dimensions[d.key] : null;
    const pct = dataObj ? Math.max(10, Math.min(100, dataObj.percentage || 50)) : 50;
    const r = (pct / 100) * R;
    const x = cx + Math.cos(angles[i]) * r;
    const y = cy + Math.sin(angles[i]) * r;
    return { x, y, pct, label: d.label, level: dataObj ? dataObj.level : 'Sedang' };
  });

  const polyPoints = dataPoints.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');

  let dotsSvg = '';
  dataPoints.forEach(p => {
    dotsSvg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="5" fill="#2563EB" stroke="#FFFFFF" stroke-width="2" />' +
               '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="2" fill="#FFFFFF" />';
  });

  const labelOffsets = [
    { x: 0, y: -14, align: 'middle' },
    { x: 8, y: -2, align: 'start' },
    { x: 8, y: 12, align: 'start' },
    { x: -8, y: 12, align: 'end' },
    { x: -8, y: -2, align: 'end' }
  ];

  let labelsSvg = '';
  dims.forEach((d, i) => {
    const outerX = cx + Math.cos(angles[i]) * (R + 8);
    const outerY = cy + Math.sin(angles[i]) * (R + 8);
    const offset = labelOffsets[i];
    const dataObj = dimensions ? dimensions[d.key] : null;
    const pct = dataObj ? dataObj.percentage : 50;
    const level = dataObj ? dataObj.level : 'Sedang';

    labelsSvg += '<g transform="translate(' + (outerX + offset.x) + ', ' + (outerY + offset.y) + ')">' +
      '<text text-anchor="' + offset.align + '" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#0F172A">' +
        d.icon + ' ' + d.label +
      '</text>' +
      '<text text-anchor="' + offset.align + '" y="12" font-family="monospace" font-size="9.5" font-weight="600" fill="#2563EB">' +
        pct + '% (' + level + ')' +
      '</text>' +
    '</g>';
  });

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width: 100%; max-width: 440px; height: auto; display: block; margin: 0 auto; overflow: visible;" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="pentagonGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#3B82F6" stop-opacity="0.45" />' +
        '<stop offset="100%" stop-color="#1D4ED8" stop-opacity="0.15" />' +
      '</linearGradient>' +
    '</defs>' +
    ringsSvg +
    spokesSvg +
    '<polygon points="' + polyPoints + '" fill="url(#pentagonGradient)" stroke="#2563EB" stroke-width="2.2" stroke-linejoin="round" />' +
    dotsSvg +
    labelsSvg +
  '</svg>';
}

function renderDiscLineGraphSvg(discData) {
  const W = 360;
  const H = 200;
  const padLeft = 42;
  const padRight = 32;
  const padTop = 30;
  const padBottom = 35;

  const graphW = W - padLeft - padRight;
  const graphH = H - padTop - padBottom;
  const midY = padTop + graphH / 2;

  const elements = [
    { key: 'D', name: 'Dominance', color: '#DC2626', x: padLeft + graphW * 0.12 },
    { key: 'I', name: 'Influence', color: '#D97706', x: padLeft + graphW * 0.38 },
    { key: 'S', name: 'Steadiness', color: '#059669', x: padLeft + graphW * 0.64 },
    { key: 'C', name: 'Compliance', color: '#2563EB', x: padLeft + graphW * 0.90 }
  ];

  const changeScores = (discData && discData.tally && discData.tally.change) ? discData.tally.change : { D: 0, I: 0, S: 0, C: 0 };
  const maxAmp = 18;
  const scaleY = (graphH / 2 - 8) / maxAmp;

  const points = elements.map(el => {
    const val = changeScores[el.key] || 0;
    const clamped = Math.max(-maxAmp, Math.min(maxAmp, val));
    const y = midY - (clamped * scaleY);
    return { ...el, val, y };
  });

  const linePath = points.map((p, idx) => (idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)).join(' ');

  return `
    <svg viewBox="0 0 ${W} ${H}" style="width: 100%; max-width: 360px; height: auto; display: block; margin: 0 auto;" xmlns="http://www.w3.org/2000/svg">
      <rect x="${padLeft}" y="${padTop}" width="${graphW}" height="${graphH/2}" fill="#F0FDF4" fill-opacity="0.5" />
      <rect x="${padLeft}" y="${midY}" width="${graphW}" height="${graphH/2}" fill="#F8FAFC" fill-opacity="0.8" />
      <rect x="${padLeft}" y="${padTop}" width="${graphW}" height="${graphH}" fill="none" stroke="#E2E8F0" stroke-width="1" rx="4" />

      <text x="${padLeft - 6}" y="${padTop + 14}" text-anchor="end" font-family="monospace" font-size="8.5" fill="#059669" font-weight="600">+HIGH</text>
      <text x="${padLeft - 6}" y="${midY + 3}" text-anchor="end" font-family="monospace" font-size="8.5" fill="#64748B" font-weight="600">0</text>
      <text x="${padLeft - 6}" y="${padTop + graphH - 6}" text-anchor="end" font-family="monospace" font-size="8.5" fill="#DC2626" font-weight="600">-LOW</text>

      <line x1="${padLeft}" y1="${midY}" x2="${padLeft + graphW}" y2="${midY}" stroke="#94A3B8" stroke-width="1.2" stroke-dasharray="4 3" />

      ${points.map(p => `
        <line x1="${p.x.toFixed(1)}" y1="${padTop}" x2="${p.x.toFixed(1)}" y2="${padTop + graphH}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="2 2" />
      `).join('')}

      <path d="${linePath}" fill="none" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

      ${points.map(p => `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${p.color}" fill-opacity="0.2" />
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${p.color}" stroke="#FFFFFF" stroke-width="2" />
        <g transform="translate(${p.x.toFixed(1)}, ${p.val >= 0 ? (p.y - 10).toFixed(1) : (p.y + 14).toFixed(1)})">
          <text text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="${p.color}">
            ${p.val > 0 ? '+' + p.val : p.val}
          </text>
        </g>
        <g transform="translate(${p.x.toFixed(1)}, ${padTop + graphH + 14})">
          <text text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="${p.color}">
            ${p.key}
          </text>
          <text text-anchor="middle" y="10" font-family="sans-serif" font-size="8.5" fill="#64748B">
            ${p.name}
          </text>
        </g>
      `).join('')}
    </svg>
  `;
}

function renderCognitiveAspectsBarsHtml(cogData) {
  const rawCats = (cogData && cogData.categories) ? cogData.categories : {};
  const aspects = [
    { name: 'Deret Angka & Pola', icon: '🔢', correct: rawCats['Deret Angka'] ? rawCats['Deret Angka'].correct : 0, total: rawCats['Deret Angka'] ? rawCats['Deret Angka'].total : 3 },
    { name: 'Aritmatika Bisnis', icon: '➕', correct: rawCats['Aritmatika Dasar'] ? rawCats['Aritmatika Dasar'].correct : 0, total: rawCats['Aritmatika Dasar'] ? rawCats['Aritmatika Dasar'].total : 3 },
    { name: 'Logika Komersial', icon: '💼', correct: rawCats['Logika Komersial'] ? rawCats['Logika Komersial'].correct : 0, total: rawCats['Logika Komersial'] ? rawCats['Logika Komersial'].total : 4 },
    { name: 'Analisis Data', icon: '📈', correct: rawCats['Analisis Data'] ? rawCats['Analisis Data'].correct : 0, total: rawCats['Analisis Data'] ? rawCats['Analisis Data'].total : 3 },
    { name: 'Penalaran & Silogisme', icon: '🧩', correct: (rawCats['Penalaran Kritis'] ? rawCats['Penalaran Kritis'].correct : 0) + (rawCats['Silogisme'] ? rawCats['Silogisme'].correct : 0), total: (rawCats['Penalaran Kritis'] ? rawCats['Penalaran Kritis'].total : 1) + (rawCats['Silogisme'] ? rawCats['Silogisme'].total : 1) }
  ];

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${aspects.map(asp => {
        const pct = asp.total > 0 ? Math.round((asp.correct / asp.total) * 100) : 0;
        let barColor = '#059669';
        if (pct < 50) barColor = '#DC2626';
        else if (pct < 75) barColor = '#D97706';

        return `
          <div style="display: grid; grid-template-columns: 180px 1fr 70px; align-items: center; gap: 10px; font-size: 11px;">
            <div style="font-weight: 600; color: #334155; display: flex; align-items: center; gap: 6px;">
              <span>${asp.icon}</span> <span>${asp.name}</span>
            </div>
            <div style="background: #F1F5F9; border-radius: 4px; height: 10px; overflow: hidden; border: 1px solid #E2E8F0;">
              <div style="background: ${barColor}; width: ${pct}%; height: 100%; border-radius: 3px;"></div>
            </div>
            <div style="font-family: monospace; font-size: 10.5px; font-weight: 700; color: ${barColor}; text-align: right;">
              ${asp.correct}/${asp.total} (${pct}%)
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Test generating full HTML report card string
function generateReportCardHtml(talent, assessment, relatedApps, discussList) {
  const b5 = assessment ? (assessment.dimensions || assessment.scores) : null;
  const hasAssessment = Boolean(assessment && assessment.status === 'completed');
  const dateStr = assessment && assessment.completedAt 
    ? new Date(assessment.completedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) 
    : 'Belum Selesai';

  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Portfolio & CV resolution
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
    : (phoneClean ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent('https://wa.me/' + phoneClean.replace(/\+/g, ''))}` : '');

  const otherApps = relatedApps.filter(a => a.id !== talent.id);

  // Skill items
  const skills = (talent.skills && talent.skills.length > 0) ? talent.skills : [
    { name: 'Foto', rating: 4 },
    { name: 'Video', rating: 4 },
    { name: 'Editing', rating: 4 },
    { name: 'Sense / Taste', rating: 4 }
  ];

  return `<!DOCTYPE html>
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
    
    /* Layout Elements */
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
          ${b5 ? renderPentagonMatrixSvg(b5) : '<p>Tidak ada data</p>'}
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
          ${assessment.disc ? renderDiscLineGraphSvg(assessment.disc) : '<p>Tidak ada data DISC</p>'}
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
        ${assessment.cognitive ? renderCognitiveAspectsBarsHtml(assessment.cognitive) : '<p>Tidak ada data kognitif</p>'}
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
}

// Test with mock candidate
const mockTalent = {
  id: 'PGE-001',
  name: 'Lia Ana Pratama',
  role: 'Freelance Content Creator',
  phone: '081323319026',
  email: 'liaanapratama21@gmail.com',
  education: 'Fresh Graduate (Duta Bangsa)',
  domisili: 'Banjarsari',
  expectedSalary: 'Rp 3.500.000',
  stage: 'Interview',
  overallRating: 4.8,
  portfolioUrl: 'https://drive.google.com/drive/folders/test123',
  cvUrl: 'https://pge-talentpool.web.app/cv/lia.pdf',
  notes: 'Kandidat memiliki portofolio video reels yang sangat konsisten dengan editing modern.'
};

const mockRelatedApps = [
  mockTalent,
  { id: 'PGE-042', role: 'Live Host Streamer', stage: 'Prospect' }
];

const mockDiscussions = [
  { senderName: 'Dian HR', text: 'Portofolio video cinematic sangat rapi.', tag: '✅ Strong Fit' },
  { senderName: 'Budi Lead', text: 'Komunikasi baik, siap wawancara offline.', tag: '⭐ Prioritas Interview' }
];

const htmlResult = generateReportCardHtml(mockTalent, null, mockRelatedApps, mockDiscussions);
console.log('Generated HTML length:', htmlResult.length);
fs.writeFileSync('scratch/test_report_card_output.html', htmlResult, 'utf-8');
console.log('Saved test output to scratch/test_report_card_output.html');
