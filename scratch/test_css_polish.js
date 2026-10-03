const fs = require('fs');

function testReportCardMarkup() {
  const css = `
    @page {
      size: A4 portrait;
      margin: 6mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0F172A;
      margin: 0;
      padding: 0;
      font-size: 10.5px;
      line-height: 1.35;
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
    }
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
    }
    
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0F172A;
    }
    .brand-sub {
      font-size: 9px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 1px;
    }
    .confidential-tag {
      font-family: 'Geist Mono', monospace;
      font-size: 8px;
      font-weight: 700;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      padding: 2px 7px;
      border-radius: 3px;
      color: #334155;
      display: inline-block;
      text-align: right;
    }
    
    .grid-bio {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1.2fr 1.2fr;
      gap: 6px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 7px 10px;
      margin-bottom: 8px;
    }
    .bio-lbl {
      font-size: 8.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.04em;
    }
    .bio-val {
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 1px;
    }
    
    .multi-job-banner {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 6px;
      padding: 5px 9px;
      font-size: 9.5px;
      color: #1E40AF;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .section-card {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      background: #FFFFFF;
      padding: 7px 10px;
      margin-bottom: 8px;
    }
    .section-card-title {
      font-size: 10px;
      font-weight: 700;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 4px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .score-calc-badge {
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
    
    .qr-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .qr-card {
      display: flex;
      gap: 9px;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 7px;
    }
    .qr-img {
      width: 76px;
      height: 76px;
      border-radius: 4px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      flex-shrink: 0;
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
      height: 48px;
      border: 1px solid #E2E8F0;
      background-color: #FFFFFF;
      background-image: repeating-linear-gradient(transparent, transparent 15px, #E2E8F0 16px);
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 9px;
      color: #94A3B8;
      font-style: italic;
      line-height: 16px;
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
      height: 24px;
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
    }
  `;
  console.log('Tested CSS string length:', css.length);
}

testReportCardMarkup();
