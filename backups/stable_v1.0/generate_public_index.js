const fs = require('fs');
const path = require('path');

const targetPath = 'C:\\\\Users\\\\User\\\\Documents\\\\antigravity\\\\Talent pool\\\\public\\\\index.html';

const publicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>PGE Talent Pool | Candidate Repository</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23111827'/%3E%3Ctext x='16' y='22' font-family='sans-serif' font-weight='bold' font-size='18' fill='%23FFFFFF' text-anchor='middle'%3EP%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Geist:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">

  <!-- Appwrite Web SDK v14 -->
  <script src="https://cdn.jsdelivr.net/npm/appwrite@14"></script>

  <!-- Firebase SDK for Google OAuth Sign-In & Live Presence -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

  <!-- PDF.js & PDF-Lib for Client-Side 50MB PDF Auto-Compression -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
  <script>
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  </script>

  <style>
    :root {
      /* Clean Editorial / Swiss Minimalist Design Tokens */
      --bg-canvas: #F8F9FA;
      --bg-surface: #FFFFFF;
      --bg-surface-secondary: #F3F4F6;
      --border-light: rgba(0, 0, 0, 0.08);
      --border-focus: #111827;

      --text-primary: #111827;
      --text-secondary: #4B5563;
      --text-muted: #6B7280;

      /* Understated Pastel Status & Document Pills */
      --pastel-blue-bg: #EFF6FF;
      --pastel-blue-text: #1E40AF;
      --pastel-blue-border: #DBEAFE;

      --pastel-green-bg: #F0FDF4;
      --pastel-green-text: #166534;
      --pastel-green-border: #DCFCE7;

      --pastel-yellow-bg: #FEFCE8;
      --pastel-yellow-text: #854D0E;
      --pastel-yellow-border: #FEF08A;

      --pastel-purple-bg: #FAF5FF;
      --pastel-purple-text: #6B21A8;
      --pastel-purple-border: #F3E8FD;

      --pastel-red-bg: #FEF2F2;
      --pastel-red-text: #991B1B;
      --pastel-red-border: #FEE2E2;

      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
      --shadow-drawer: -4px 0 24px rgba(0, 0, 0, 0.08);
      --shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --radius-pill: 9999px;

      --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-serif: 'Newsreader', Georgia, serif;
      --font-mono: 'Geist Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 13px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      min-height: 100vh;
    }

    /* Auth Gate Container */
    .auth-gate-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(circle at 50% 30%, #FFFFFF, #F1F3F5);
    }
    .auth-card {
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 40px 36px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
      text-align: center;
      animation: modalScale 0.25s ease;
    }
    .auth-logo {
      width: 48px;
      height: 48px;
      background: #111827;
      color: #FFFFFF;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-family: var(--font-mono);
      font-weight: 700;
      margin-bottom: 20px;
      box-shadow: var(--shadow-sm);
    }
    .btn-google {
      width: 100%;
      background: #FFFFFF;
      color: #1F2937;
      border: 1px solid #D1D5DB;
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.15s ease;
      margin-top: 24px;
    }
    .btn-google:hover {
      background: #F9FAFB;
      border-color: #9CA3AF;
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .app-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px 32px 100px;
    }

    /* Navigation Bar */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      margin-bottom: 32px;
    }
    .brand-group { display: flex; align-items: center; gap: 12px; }
    .brand-logo {
      width: 32px; height: 32px;
      background: var(--text-primary);
      color: #FFFFFF;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; font-family: var(--font-mono);
    }
    .brand-title { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; color: var(--text-primary); }
    .brand-badge {
      font-family: var(--font-mono); font-size: 11px;
      background: var(--pastel-green-bg); color: var(--pastel-green-text);
      border: 1px solid var(--pastel-green-border);
      padding: 3px 8px; border-radius: var(--radius-pill); font-weight: 500;
    }

    .nav-actions { display: flex; align-items: center; gap: 10px; }

    .user-profile-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-pill);
      padding: 3px 10px 3px 4px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .user-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
      background: #E5E7EB;
    }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      font-family: var(--font-sans); font-size: 13px; font-weight: 500;
      padding: 8px 14px; border-radius: var(--radius-sm);
      border: 1px solid transparent; cursor: pointer;
      transition: all 0.15s ease; text-decoration: none;
    }
    .btn-primary { 
      background: var(--text-primary); 
      color: #FFFFFF; 
      font-weight: 500;
      box-shadow: var(--shadow-sm);
    }
    .btn-primary:hover { 
      background: #000000; 
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .btn-secondary { 
      background: var(--bg-surface); 
      border-color: var(--border-light); 
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }
    .btn-secondary:hover { 
      background: var(--bg-surface-secondary); 
      border-color: #D1D5DB; 
    }
    .btn-danger { 
      background: var(--pastel-red-bg); 
      color: var(--pastel-red-text); 
      border-color: var(--pastel-red-border); 
    }
    .btn-danger:hover { 
      background: #FEE2E2; 
      border-color: #FCA5A5;
    }
    .btn-wa {
      background: #16A34A;
      color: #FFFFFF;
      border-color: #15803D;
    }
    .btn-wa:hover {
      background: #15803D;
      box-shadow: var(--shadow-sm);
    }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-icon { padding: 6px; border-radius: var(--radius-sm); }

    /* Editorial Hero */
    .hero-section { margin-bottom: 28px; }
    .hero-meta {
      font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.1em; color: var(--text-secondary); margin-bottom: 6px; font-weight: 600;
    }
    .hero-heading {
      font-family: var(--font-serif); font-size: 34px; font-weight: 400;
      line-height: 1.2; letter-spacing: -0.02em; color: var(--text-primary);
    }
    .hero-heading em { font-style: italic; color: #4B5563; }

    /* Metrics Grid */
    .metrics-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px;
    }
    .metric-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md); padding: 18px 20px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .metric-label {
      font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 8px;
    }
    .metric-value {
      font-family: var(--font-sans); font-size: 30px; font-weight: 600;
      color: var(--text-primary); line-height: 1;
    }

    /* Analytics Dashboard */
    .analytics-dashboard {
      background: var(--bg-surface); border: 1px solid var(--border-light);
      border-radius: var(--radius-md); padding: 22px 24px; margin-bottom: 28px;
      box-shadow: var(--shadow-sm);
    }

    /* Controls Bar */
    .controls-bar {
      display: flex; justify-content: space-between; align-items: center;
      gap: 16px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .search-box {
      flex: 1; min-width: 280px; position: relative; display: flex; align-items: center;
    }
    .search-box svg {
      position: absolute; left: 12px; width: 15px; height: 15px;
      color: var(--text-muted); pointer-events: none;
    }
    .search-box input {
      width: 100%; background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm); padding: 9px 12px 9px 36px; font-family: var(--font-sans);
      font-size: 13px; color: var(--text-primary); outline: none; transition: border-color 0.15s ease;
      box-shadow: var(--shadow-sm);
    }
    .search-box input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 1px var(--border-focus); }
    .search-box input::placeholder { color: var(--text-muted); }

    .filter-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .select-filter {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm); padding: 8px 12px; font-family: var(--font-sans);
      font-size: 13px; color: var(--text-primary); outline: none; cursor: pointer;
      box-shadow: var(--shadow-sm); transition: border-color 0.15s ease;
    }
    .select-filter:focus { border-color: var(--border-focus); }

    /* View Switcher */
    .view-switcher {
      display: inline-flex; background: #E5E7EB; border-radius: var(--radius-sm); padding: 2px;
    }
    .view-btn {
      background: transparent; border: none; padding: 6px 12px; font-family: var(--font-sans);
      font-size: 12px; font-weight: 500; color: var(--text-secondary); border-radius: 4px;
      cursor: pointer; transition: all 0.15s ease;
    }
    .view-btn.active {
      background: var(--bg-surface); color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }

    /* Bento Grid */
    .bento-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 18px; margin-bottom: 40px;
    }
    .talent-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md); padding: 22px; display: flex; flex-direction: column;
      justify-content: space-between; box-shadow: var(--shadow-sm);
      transition: all 0.2s ease; cursor: pointer; position: relative;
    }
    .talent-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: rgba(0, 0, 0, 0.16);
    }
    .talent-card.selected-compare {
      border-color: #2563EB;
      box-shadow: 0 0 0 2px #2563EB;
      background: #F8FAFC;
    }
    .card-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;
    }
    .talent-id {
      font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
      letter-spacing: 0.06em; margin-bottom: 2px; font-weight: 600;
    }
    .talent-name {
      font-size: 16px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.01em;
    }
    .talent-role {
      font-size: 12px; color: var(--text-secondary); margin-top: 2px;
    }
    .rating-badge {
      font-family: var(--font-mono); font-size: 11px; font-weight: 600;
      background: var(--pastel-yellow-bg); color: var(--pastel-yellow-text);
      border: 1px solid var(--pastel-yellow-border);
      padding: 3px 7px; border-radius: var(--radius-sm); display: inline-flex;
      align-items: center; gap: 3px;
    }

    /* Compare Pill in Card Footer */
    .compare-pill {
      font-size: 11px;
      font-family: var(--font-mono);
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid var(--border-light);
      background: var(--bg-surface-secondary);
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      user-select: none;
      color: var(--text-secondary);
      transition: all 0.15s ease;
    }
    .compare-pill:hover {
      background: #E5E7EB;
      color: var(--text-primary);
    }
    .compare-pill input {
      cursor: pointer;
    }

    /* Interactive Pastel Stage Selector Pill */
    .stage-select-pill {
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 500;
      padding: 4px 24px 4px 10px;
      border-radius: var(--radius-pill);
      border: 1px solid transparent;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='8' height='6' viewBox='0 0 8 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L4 4.5L7 1.5' stroke='%234B5563' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      transition: all 0.15s ease;
    }
    .stage-select-pill:hover { filter: brightness(0.96); }
    .stage-select-pill:focus { border-color: var(--border-focus); }

    .stage-prospect { background-color: var(--pastel-blue-bg); color: var(--pastel-blue-text); border-color: var(--pastel-blue-border); }
    .stage-screening { background-color: var(--pastel-yellow-bg); color: var(--pastel-yellow-text); border-color: var(--pastel-yellow-border); }
    .stage-interviewed { background-color: var(--pastel-purple-bg); color: var(--pastel-purple-text); border-color: var(--pastel-purple-border); }
    .stage-shortlisted { background-color: var(--pastel-green-bg); color: var(--pastel-green-text); border-color: var(--pastel-green-border); }
    .stage-offered { background-color: #FEF3C7; color: #92400E; border-color: #FDE68A; }
    .stage-hired { background-color: #DCFCE7; color: #14532D; border-color: #BBF7D0; }
    .stage-archived { background-color: #F3F4F6; color: #4B5563; border-color: #E5E7EB; }

    .skills-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 18px; }
    .skill-tag {
      font-family: var(--font-mono); font-size: 11px; background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light); padding: 3px 8px; border-radius: 4px;
      color: var(--text-secondary);
    }
    .card-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 14px; border-top: 1px solid var(--border-light); font-size: 12px;
    }
    .doc-badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .doc-badge {
      font-size: 11px; font-family: var(--font-mono); padding: 4px 9px;
      border-radius: 6px; text-decoration: none; border: 1px solid transparent;
      display: inline-flex; align-items: center; gap: 4px; font-weight: 500;
      transition: all 0.15s ease; cursor: pointer;
    }
    .doc-badge:hover { transform: translateY(-1px); filter: brightness(0.96); }
    .doc-badge-wa { background: var(--pastel-green-bg); color: var(--pastel-green-text); border-color: var(--pastel-green-border); }
    .doc-badge-cv { background: var(--pastel-blue-bg); color: var(--pastel-blue-text); border-color: var(--pastel-blue-border); }
    .doc-badge-porto { background: var(--pastel-purple-bg); color: var(--pastel-purple-text); border-color: var(--pastel-purple-border); }

    /* Table View */
    .table-container {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md); overflow-x: auto; box-shadow: var(--shadow-sm);
      margin-bottom: 40px;
    }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    .data-table th {
      background: var(--bg-surface-secondary); padding: 12px 16px; font-family: var(--font-mono);
      font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--text-muted); border-bottom: 1px solid var(--border-light);
    }
    .data-table td {
      padding: 14px 16px; border-bottom: 1px solid var(--border-light); vertical-align: middle;
    }
    .data-table tr:hover { background-color: #FAFAFA; }

    /* Kanban Board */
    .kanban-board {
      display: grid; grid-template-columns: repeat(7, minmax(200px, 1fr));
      gap: 14px; overflow-x: auto; padding-bottom: 16px; margin-bottom: 40px;
    }
    .kanban-col {
      background: #F3F4F6;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md); padding: 14px; min-height: 420px;
      display: flex; flex-direction: column;
    }
    .kanban-col-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px; font-family: var(--font-mono); font-size: 11px;
      font-weight: 600; text-transform: uppercase; color: var(--text-secondary);
    }
    .kanban-cards-wrap { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .kanban-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm); padding: 12px; box-shadow: var(--shadow-sm);
      cursor: pointer; transition: all 0.15s ease;
    }
    .kanban-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

    /* WhatsApp Broadcast Center */
    .broadcast-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 40px;
    }
    .broadcast-control-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .broadcast-control-card { grid-template-columns: 1fr; }
    }
    .variable-chip {
      display: inline-block;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      border-radius: 4px;
      padding: 2px 7px;
      font-size: 11px;
      font-family: var(--font-mono);
      cursor: pointer;
      color: #1E40AF;
      transition: all 0.15s ease;
    }
    .variable-chip:hover {
      background: #DBEAFE;
      border-color: #BFDBFE;
    }

    /* Slide-over Drawer */
    .drawer-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0, 0, 0, 0.4);
      z-index: 1500; opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
    }
    .drawer-backdrop.active { opacity: 1; pointer-events: auto; }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 640px; max-width: 95vw;
      background: var(--bg-surface); border-left: 1px solid var(--border-light);
      z-index: 1501; transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-drawer); display: flex; flex-direction: column;
    }
    .drawer.open { transform: translateX(0); }
    .drawer-header {
      padding: 20px 24px; border-bottom: 1px solid var(--border-light);
      display: flex; justify-content: space-between; align-items: center;
    }
    .drawer-body { padding: 24px; overflow-y: auto; flex: 1; }
    .drawer-footer {
      position: sticky;
      bottom: 0;
      z-index: 10;
      padding: 16px 24px; border-top: 1px solid var(--border-light);
      background: #FFFFFF; display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 -4px 14px rgba(0, 0, 0, 0.06);
    }
    body.drawer-open .messenger-trigger,
    body.drawer-open .messenger-panel,
    .drawer-backdrop.active ~ .messenger-trigger {
      display: none !important;
    }

    /* Form Elements */
    .form-group { margin-bottom: 18px; position: relative; }
    .form-label {
      display: flex; justify-content: space-between; align-items: center;
      font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 6px;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%; background: var(--bg-surface);
      border: 1px solid #D1D5DB;
      border-radius: var(--radius-sm); padding: 9px 12px; font-family: var(--font-sans);
      font-size: 13px; color: var(--text-primary); outline: none; transition: all 0.15s ease;
      box-shadow: var(--shadow-sm);
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus { 
      border-color: var(--border-focus); 
      box-shadow: 0 0 0 1px var(--border-focus);
    }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* Live Duplicate Warning Box */
    .duplicate-warning-box {
      display: none;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      padding: 8px 12px;
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: var(--radius-sm);
      font-size: 12px;
      color: #991B1B;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* Quick Tag Pills in Drawer */
    .quick-tag-btn {
      font-size: 11px;
      font-family: var(--font-mono);
      padding: 3px 8px;
      border-radius: var(--radius-pill);
      background: var(--bg-surface-secondary);
      border: 1px solid var(--border-light);
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.15s ease;
    }
    .quick-tag-btn:hover {
      background: #E5E7EB;
      color: var(--text-primary);
    }

    /* Separated Dropzones for CV and Portfolio */
    .upload-section-box {
      background: #F9FAFB;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 16px;
      margin-bottom: 16px;
    }
    .upload-section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-primary);
      margin-bottom: 10px;
    }

    .dropzone-box {
      border: 1.5px dashed #D1D5DB;
      border-radius: var(--radius-sm);
      padding: 20px 14px;
      text-align: center;
      background: var(--bg-surface);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .dropzone-box:hover {
      border-color: #2563EB;
      background: #F8FAFC;
    }
    .dropzone-box.drag-active {
      border-color: #2563EB;
      border-style: solid;
      background: #EFF6FF;
    }
    .dropzone-icon {
      width: 32px;
      height: 32px;
      margin: 0 auto 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2563EB;
      background: #EFF6FF;
      border-radius: 6px;
    }

    /* Live Upload Progress Queue inside Drawer */
    .upload-queue-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }
    .upload-item-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .upload-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
    .upload-item-name {
      font-weight: 500;
      color: var(--text-primary);
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .upload-progress-track {
      height: 4px;
      background: #E5E7EB;
      border-radius: 2px;
      overflow: hidden;
    }
    .upload-progress-fill {
      height: 100%;
      background: #2563EB;
      width: 0%;
      border-radius: 2px;
      transition: width 0.25s ease;
    }
    .upload-progress-fill.complete {
      background: #16A34A;
    }
    .upload-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }
    .badge-status-ready {
      color: #16A34A;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .spin-icon { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Attached CV Card */
    .attached-cv-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--pastel-blue-bg);
      border: 1px solid var(--pastel-blue-border);
      border-radius: var(--radius-sm);
      margin-top: 8px;
    }

    /* Chips */
    .portfolio-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .chip {
      background: var(--bg-surface-secondary); border: 1px solid var(--border-light);
      border-radius: 6px; padding: 4px 10px; font-size: 11px; font-family: var(--font-mono);
      display: inline-flex; align-items: center; gap: 6px; color: var(--text-primary);
    }
    .chip-remove { cursor: pointer; color: var(--text-muted); font-weight: bold; }
    .chip-remove:hover { color: #DC2626; }

    /* Skills Builder */
    .skills-builder-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }

    /* Floating Candidate Comparison Bottom Bar */
    .compare-bar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1400;
      background: #111827;
      color: #FFFFFF;
      border-radius: var(--radius-pill);
      padding: 10px 24px;
      display: none;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-modal);
      animation: slideUp 0.25s ease;
    }
    .compare-bar.active { display: flex; }
    @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

    /* Generic Modals */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5); z-index: 2000;
      display: none; align-items: center; justify-content: center;
      padding: 20px;
    }
    .modal-backdrop.open { display: flex; }
    .modal-card {
      background: #FFFFFF; border-radius: var(--radius-md);
      box-shadow: var(--shadow-modal); max-width: 680px; width: 100%;
      max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
      animation: modalScale 0.2s ease;
    }
    .modal-card-lg { max-width: 960px; }
    .modal-card-xl { max-width: 1040px; width: 95vw; }
    @media (max-width: 768px) {
      .modal-split-grid { grid-template-columns: 1fr !important; }
      .modal-split-left { border-right: none !important; border-bottom: 1px solid var(--border-light); padding-right: 0 !important; padding-bottom: 16px !important; }
    }
    .profile-meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary);
      padding: 6px 0;
      border-bottom: 1px dashed var(--border-light);
    }
    .profile-meta-item strong {
      color: var(--text-primary);
      font-weight: 600;
    }
    .profile-skill-row {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-bottom: 8px;
    }
    .profile-skill-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .profile-skill-track {
      height: 6px;
      background: #E5E7EB;
      border-radius: 3px;
      overflow: hidden;
    }
    .profile-skill-fill {
      height: 100%;
      background: #10B981;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .media-showcase-card {
      background: #F9FAFB;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: all 0.15s ease;
    }
    .media-showcase-card:hover {
      border-color: #93C5FD;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    /* Candidate Bento Card Team Comments & Remarks */
    .card-comments-preview {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 6px 10px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
      color: #334155;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .card-comments-preview:hover {
      background: #EFF6FF;
      border-color: #BFDBFE;
      color: #1D4ED8;
    }
    .card-comments-snippet {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .card-comments-count-pill {
      font-size: 10px;
      font-weight: 600;
      font-family: var(--font-mono);
      background: #E2E8F0;
      color: #475569;
      padding: 2px 6px;
      border-radius: 10px;
      flex-shrink: 0;
    }
    .card-comments-preview:hover .card-comments-count-pill {
      background: #DBEAFE;
      color: #1E40AF;
    }
    .comment-author-avatar-sm {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #3B82F6;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .comment-thread-item {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.15s ease;
    }
    .comment-thread-item:hover {
      background: #FFFFFF;
      border-color: #CBD5E1;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .comment-thread-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
    }
    .comment-thread-author {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .comment-thread-time {
      font-size: 10px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    .comment-thread-body {
      font-size: 12px;
      color: #334155;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Vacancy Hub Portal Styles */
    .vacancy-hub-section {
      margin-bottom: 32px;
      animation: fadeIn 0.25s ease;
    }
    .vacancy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .vacancy-card {
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .vacancy-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 30px -8px rgba(0, 0, 0, 0.1);
      border-color: #3B82F6;
    }
    .vacancy-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .vacancy-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #F3F4F6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      border: 1px solid var(--border-light);
    }
    .vacancy-badge-active {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 9999px;
      background: #ECFDF5;
      color: #065F46;
      border: 1px solid #A7F3D0;
    }
    .vacancy-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 4px 0 6px;
      font-family: var(--font-sans);
    }
    .vacancy-stat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: #F9FAFB;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
      margin: 14px 0;
    }
    .vacancy-stat-item {
      display: flex;
      flex-direction: column;
    }
    .vacancy-stat-label {
      font-size: 10px;
      font-family: var(--font-mono);
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .vacancy-stat-value {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      font-family: var(--font-mono);
    }
    .vacancy-enter-btn {
      width: 100%;
      background: #111827;
      color: #FFFFFF;
      border: none;
      padding: 9px 16px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 600;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .vacancy-card:hover .vacancy-enter-btn {
      background: #2563EB;
    }
    .vacancy-breadcrumb-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-light);
      flex-wrap: wrap;
      gap: 12px;
    }
    .btn-back-hub {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #2563EB;
      background: #EFF6FF;
      border: 1px solid #DBEAFE;
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-back-hub:hover {
      background: #DBEAFE;
      color: #1D4ED8;
    }
    @keyframes modalScale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .modal-header {
      padding: 18px 24px; border-bottom: 1px solid var(--border-light);
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
    .modal-footer {
      padding: 16px 24px; border-top: 1px solid var(--border-light);
      background: #F9FAFB; display: flex; justify-content: flex-end; gap: 8px;
    }

    /* Floating Global Background Upload Pill */
    .global-upload-pill {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1500;
      background: #111827;
      color: #FFFFFF;
      border-radius: var(--radius-pill);
      padding: 10px 20px;
      font-size: 12px;
      font-family: var(--font-mono);
      display: none;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      transition: all 0.25s ease;
      cursor: pointer;
    }
    .global-upload-pill.active { display: inline-flex; }
    .global-upload-pill.success { background: #15803D; }
    .mini-track {
      width: 60px;
      height: 4px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 2px;
      overflow: hidden;
    }
    .mini-fill {
      height: 100%;
      background: #60A5FA;
      width: 0%;
      transition: width 0.2s ease;
    }

    /* Toast */
    .toast-container {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      z-index: 3000; display: flex; flex-direction: column; gap: 8px; pointer-events: none;
    }
    .toast {
      background: #111827; color: #FFFFFF; padding: 10px 20px;
      border-radius: var(--radius-sm); font-size: 13px; font-weight: 500;
      box-shadow: var(--shadow-lg); pointer-events: auto;
      animation: toastIn 0.2s ease;
    }
    @keyframes toastIn {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Floating Messenger Trigger & Panel */
    .messenger-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1050;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: #111827;
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 9999px;
      box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.28);
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .messenger-trigger:hover {
      background: #1F2937;
      transform: translateY(-2px);
      box-shadow: 0 16px 32px -4px rgba(0, 0, 0, 0.35);
    }
    .messenger-unread-badge {
      position: absolute;
      top: -7px;
      right: -5px;
      background: #EF4444;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 9999px;
      line-height: 1.2;
      min-width: 20px;
      text-align: center;
      box-shadow: 0 0 0 2px #111827, 0 2px 8px rgba(239, 68, 68, 0.7);
      animation: pulseRedBadge 1.5s infinite;
    }
    @keyframes pulseRedBadge {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    .messenger-panel {
      position: fixed;
      bottom: 80px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 490px;
      max-height: calc(100vh - 110px);
      background: #FFFFFF;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      display: none;
      flex-direction: column;
      z-index: 1050;
      overflow: hidden;
      animation: messengerIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .messenger-panel.open {
      display: flex;
    }
    @keyframes messengerIn {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .messenger-header {
      padding: 12px 16px;
      background: #111827;
      color: #FFFFFF;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .messenger-tabs-bar {
      display: flex;
      background: #1F2937;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0 8px;
    }
    .messenger-tab-btn {
      background: transparent;
      border: none;
      color: #9CA3AF;
      font-size: 11px;
      font-weight: 600;
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
    }
    .messenger-tab-btn:hover {
      color: #FFFFFF;
    }
    .messenger-tab-btn.active {
      color: #60A5FA;
      border-bottom-color: #60A5FA;
    }
    .messenger-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #F9FAFB;
    }
    .messenger-footer {
      padding: 10px 12px;
      background: #FFFFFF;
      border-top: 1px solid var(--border-light);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .chat-msg {
      display: flex;
      flex-direction: column;
      max-width: 84%;
    }
    .chat-msg.me {
      align-self: flex-end;
      align-items: flex-end;
    }
    .chat-msg.them {
      align-self: flex-start;
      align-items: flex-start;
    }
    .chat-bubble {
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 12px;
      line-height: 1.45;
      word-break: break-word;
    }
    .chat-msg.me .chat-bubble {
      background: #111827;
      color: #FFFFFF;
      border-bottom-right-radius: 2px;
    }
    .chat-msg.them .chat-bubble {
      background: #FFFFFF;
      color: var(--text-primary);
      border: 1px solid var(--border-light);
      border-bottom-left-radius: 2px;
    }
    .chat-meta {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 3px;
      font-family: var(--font-mono);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .chat-date-separator {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin: 16px 0 8px;
      clear: both;
      pointer-events: none;
    }
    .chat-date-separator span {
      background: #E5E7EB;
      color: #374151;
      font-size: 10px;
      font-weight: 600;
      font-family: var(--font-sans);
      padding: 3px 12px;
      border-radius: 9999px;
      letter-spacing: 0.02em;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.06);
    }

    .bg-particle-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      opacity: 0.65;
    }
    .empty-state { text-align: center; padding: 48px 24px; color: var(--text-secondary); }
  </style>
</head>
<body>

  <!-- Interactive Particle Web Background -->
  <canvas id="bgParticleCanvas" class="bg-particle-canvas"></canvas>

  <!-- ============================================== -->
  <!-- 1. GOOGLE OAUTH SIGN-IN GATE (UNAUTHENTICATED) -->
  <!-- ============================================== -->
  <div id="authGate" class="auth-gate-wrapper">
    <div class="auth-card">
      <div class="auth-logo">P</div>
      <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 600;">HR Security Portal</span>
      <h1 style="font-family: var(--font-serif); font-size: 26px; font-weight: 500; color: var(--text-primary); margin: 6px 0 10px;">PGE Talent Pool</h1>
      <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
        Internal Candidate Repository, Skill Benchmarking, and Recruitment Outreach System.
      </p>

      <button type="button" class="btn-google" id="btnGoogleSignIn" onclick="handleGoogleSignIn()">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Sign in with Google
      </button>

      <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-light); font-size: 11px; color: var(--text-muted);">
        🔒 Restricted to Authorized PGE HR Team &amp; Designated Whitelist
      </div>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- 2. ACCESS RESTRICTED SCREEN (NON-WHITELIST)   -->
  <!-- ============================================== -->
  <div id="accessDeniedGate" class="auth-gate-wrapper" style="display: none;">
    <div class="auth-card" style="border-color: #FECACA;">
      <div style="font-size: 36px; margin-bottom: 12px;">🚫</div>
      <h2 style="font-family: var(--font-serif); font-size: 22px; font-weight: 600; color: #991B1B; margin-bottom: 8px;">Access Restricted</h2>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">
        Akun <strong id="deniedUserEmail" style="color: var(--text-primary);"></strong> belum terdaftar di whitelist resmi PGE Talent Pool.
      </p>
      <div style="background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: var(--radius-sm); padding: 12px; font-size: 12px; color: #991B1B; margin-bottom: 20px;">
        Silakan hubungi Super Admin di <strong>hrdcvpge@gmail.com</strong> untuk mendaftarkan akun Anda.
      </div>
      <button type="button" class="btn btn-secondary btn-sm" onclick="handleSignOut()" style="width: 100%;">
        Sign in with Different Account
      </button>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- 3. MAIN APPLICATION CONTAINER (AUTHENTICATED)  -->
  <!-- ============================================== -->
  <div id="mainApp" class="app-container" style="display: none;">
    <!-- Navbar -->
    <header class="navbar">
      <div class="brand-group">
        <div class="brand-logo">P</div>
        <span class="brand-title">PGE Talent Pool</span>
        <span class="brand-badge" id="syncStatus">● Appwrite Cloud</span>
      </div>

      <div class="nav-actions">
        <button type="button" class="btn btn-secondary btn-sm" id="btnToggleAnalytics" onclick="toggleAnalyticsDashboard()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 20V10M12 20V4M6 20v-6"></path></svg>
          Visual Analytics
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="btnExportCSV" onclick="handleExportCSV()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="btnManageWhitelist" onclick="openWhitelistModal()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Team Whitelist
        </button>
        <span class="brand-badge" id="onlineTeamBadge" style="display: none; background: #F0FDF4; color: #166534; border-color: #DCFCE7; font-size: 11px;">🟢 1 Online</span>
        <button type="button" class="btn btn-primary btn-sm" id="btnAddTalent" onclick="openAddCandidateDrawer()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          + New Candidate
        </button>

        <!-- User Profile Pill & Sign Out -->
        <div class="user-profile-pill" id="userProfileBadge">
          <img src="" id="navUserAvatar" class="user-avatar" alt="Avatar">
          <span id="navUserName" style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">HR Admin</span>
          <button type="button" class="btn btn-secondary btn-sm" onclick="handleSignOut()" style="padding: 2px 8px; font-size: 11px; border: none; background: transparent; color: var(--pastel-red-text);" title="Sign Out">
            Logout ↗
          </button>
        </div>
      </div>
    </header>

    <!-- ============================================== -->
    <!-- VIEW A: JOB VACANCY HUB & PORTAL (LANDING)     -->
    <!-- ============================================== -->
    <div id="vacancyHubView" class="vacancy-hub-section">
      <section class="hero-section" style="margin-bottom: 24px;">
        <div class="hero-meta">Recruitment Workspaces &amp; Job Vacancies</div>
        <h1 class="hero-heading">Curated job openings &amp; <em>talent portals</em>.</h1>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px; max-width: 620px; line-height: 1.6;">
          Pilih lowongan pekerjaan yang ingin Anda kurasi untuk melihat metrik, pipeline interview, dan portofolio kandidat khusus posisi tersebut.
        </p>
      </section>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
        <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 600;">
          Daftar Posisi Lowongan Aktif:
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="selectVacancy('ALL')">
            🌐 Buka Semua Kandidat (Master Pool)
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="openAddCandidateDrawer()">
            + Buka Posisi Lowongan Baru
          </button>
        </div>
      </div>

      <!-- Vacancy Cards Grid -->
      <div class="vacancy-grid" id="vacancyGridContainer"></div>
    </div>

    <!-- ============================================== -->
    <!-- VIEW B: DEDICATED SCREENING ROOM (FILTERED)    -->
    <!-- ============================================== -->
    <div id="screeningRoomView" style="display: none;">
      <!-- Breadcrumb Bar -->
      <div class="vacancy-breadcrumb-bar">
        <button type="button" class="btn-back-hub" onclick="selectVacancy('HUB')">
          ← Kembali ke Semua Lowongan
        </button>

        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">Ganti Lowongan:</span>
          <select id="quickVacancySelector" class="form-select" style="font-size: 12px; padding: 5px 12px; font-weight: 600;" onchange="selectVacancy(this.value)">
          </select>
        </div>
      </div>

      <!-- Editorial Hero -->
      <section class="hero-section">
        <div class="hero-meta" id="selectedVacancyMeta">Candidate Screening Room</div>
        <h1 class="hero-heading" id="selectedVacancyHeading">Curated talent index &amp; <em>skills repository</em>.</h1>
      </section>

      <!-- Metrics Grid -->
      <section class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Active Candidates</div>
          <div class="metric-value" id="metricTotal">0</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">In Active Pipeline</div>
          <div class="metric-value" id="metricPipeline">0</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Shortlisted</div>
          <div class="metric-value" id="metricShortlisted">0</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Top Rated (5★)</div>
          <div class="metric-value" id="metricTopRated">0</div>
        </div>
      </section>

      <!-- Analytics Dashboard -->
      <section class="analytics-dashboard" id="analyticsDashboard" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
          <div>
            <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted);">Executive Overview</span>
            <h2 style="font-family: var(--font-serif); font-size: 20px; font-weight: 500; color: var(--text-primary);">Talent Pool Analytics Dashboard</h2>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="toggleAnalyticsDashboard()">Hide Analytics ✕</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          <div style="background: #F9FAFB; padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 12px;">Recruitment Pipeline Funnel</div>
            <div id="analyticsFunnelContainer" style="display: flex; flex-direction: column; gap: 8px;"></div>
          </div>

          <div style="background: #F9FAFB; padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 12px;">Overall Star Rating Distribution</div>
            <div id="analyticsRatingsContainer" style="display: flex; flex-direction: column; gap: 8px;"></div>
          </div>

          <div style="background: #F9FAFB; padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 12px;">Skill Benchmark Averages</div>
            <div id="analyticsSkillsContainer" style="display: flex; flex-direction: column; gap: 8px;"></div>
          </div>

          <div style="background: #F9FAFB; padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 12px;">Top Candidate Domisili</div>
            <div id="analyticsLocationContainer" style="display: flex; flex-direction: column; gap: 6px;"></div>
          </div>
        </div>
      </section>

    <!-- Controls Bar -->
    <section class="controls-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="searchInput" placeholder="Search candidate by name, role, skill, or notes...">
      </div>

      <div class="filter-group">
        <select class="select-filter" id="filterStage">
          <option value="ALL">All Active Candidates</option>
          <option value="Prospect">Prospect</option>
          <option value="Screening">Screening</option>
          <option value="Interviewed">Interviewed</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Offered">Offered</option>
          <option value="Hired">Hired</option>
          <option value="Archived">📁 Archived Candidates</option>
        </select>

        <select class="select-filter" id="filterRating">
          <option value="0">All Ratings</option>
          <option value="5">5 Stars Only</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>

        <div class="view-switcher">
          <button type="button" class="view-btn active" data-view="bento" onclick="switchView('bento')">Grid</button>
          <button type="button" class="view-btn" data-view="table" onclick="switchView('table')">Table</button>
          <button type="button" class="view-btn" data-view="kanban" onclick="switchView('kanban')">Pipeline</button>
          <button type="button" class="view-btn" data-view="broadcast" onclick="switchView('broadcast')">📢 WA Broadcast</button>
        </div>
      </div>
    </section>

    <!-- Views Container -->
    <main id="mainViewArea">
      <!-- 1. Grid View -->
      <div id="bentoContainer" class="bento-grid"></div>

      <!-- 2. Table View -->
      <div id="tableContainer" class="table-container" style="display: none;">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 36px;"></th>
              <th>ID</th>
              <th>Candidate</th>
              <th>Stage</th>
              <th>Level</th>
              <th>Rating</th>
              <th>Contact &amp; Documents</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>

      <!-- 3. Pipeline Kanban View -->
      <div id="kanbanContainer" class="kanban-board" style="display: none;"></div>

      <!-- 4. WhatsApp Broadcast Center & Schedule Coordinator -->
      <div id="broadcastContainer" class="broadcast-container" style="display: none;">
        <!-- Top Control: Schedule & Custom Message Composer -->
        <div class="broadcast-control-card">
          <!-- Left: Schedule Parameters & Target Audience -->
          <div>
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #16A34A; margin-bottom: 12px;">
              📅 1. Interview Schedule &amp; Target Slot
            </div>

            <div class="form-group">
              <label class="form-label">Target Candidate Stage:</label>
              <select id="bcStageFilter" class="form-select" onchange="renderBroadcastTable()">
                <option value="ALL">All Active Candidates</option>
                <option value="Screening" selected>Screening Candidates Only</option>
                <option value="Prospect">Prospect Candidates</option>
                <option value="Interviewed">Interviewed Candidates</option>
                <option value="Shortlisted">Shortlisted Candidates</option>
                <option value="Hired">Hired Candidates</option>
              </select>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Interview Date:</label>
                <input type="date" id="bcDateInput" class="form-input" onchange="updateBroadcastPreview()">
              </div>
              <div class="form-group">
                <label class="form-label">Interview Time / Slot:</label>
                <input type="text" id="bcTimeInput" class="form-input" value="10:00 WIB" placeholder="e.g. 10:00 WIB" oninput="updateBroadcastPreview()">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Meeting Link / Location:</label>
              <input type="text" id="bcLocationInput" class="form-input" value="Google Meet: https://meet.google.com/pge-interview" placeholder="e.g. Google Meet link or Kantor PGE Surakarta" oninput="updateBroadcastPreview()">
            </div>

            <div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 12px;">
              <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer; color: #166534;">
                <input type="checkbox" id="bcAutoUpdateStage" checked style="margin-top: 2px;">
                <span><strong>Auto-Sync ke Appwrite:</strong> Otomatis simpan catatan jadwal &amp; ubah status kandidat ke <em>Interviewed</em> saat pesan dikirim.</span>
              </label>
            </div>
          </div>

          <!-- Right: Custom Message Composer Box -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #1E40AF;">
                💬 2. Custom Message Box
              </div>
              <select id="bcTemplateSelect" class="form-select" style="width: auto; padding: 4px 8px; font-size: 11px;" onchange="handleBroadcastTemplateChange()">
                <option value="interview">Template: Undangan Interview</option>
                <option value="screening">Template: Follow-up Screening</option>
                <option value="offering">Template: Pemberitahuan Shortlist</option>
                <option value="custom">Template: Pesan Kustom Bebas</option>
              </select>
            </div>

            <div style="margin-bottom: 8px;">
              <span style="font-size: 11px; color: var(--text-muted); margin-right: 6px;">Insert Variable:</span>
              <div style="display: inline-flex; gap: 4px; flex-wrap: wrap;">
                <span class="variable-chip" onclick="insertVariableIntoMessage('{name}')">{name}</span>
                <span class="variable-chip" onclick="insertVariableIntoMessage('{role}')">{role}</span>
                <span class="variable-chip" onclick="insertVariableIntoMessage('{date}')">{date}</span>
                <span class="variable-chip" onclick="insertVariableIntoMessage('{time}')">{time}</span>
                <span class="variable-chip" onclick="insertVariableIntoMessage('{location}')">{location}</span>
              </div>
            </div>

            <textarea id="bcCustomMessage" class="form-textarea" rows="7" style="font-family: var(--font-sans); font-size: 12px; line-height: 1.6;" oninput="updateBroadcastPreview()"></textarea>

            <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; font-style: italic;">
              💡 Variabel di atas otomatis diganti sesuai data kandidat dan jadwal yang Anda atur.
            </div>
          </div>
        </div>

        <!-- Broadcast Queue Table -->
        <div class="table-container">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: #FFFFFF;">
            <div>
              <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">Broadcast Outreach Queue</h3>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                Antrean pengiriman pesan WhatsApp resmi ke kandidat yang dipilih.
              </div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 12px;">
              Queue: <span id="bcQueueCount" style="font-weight: 600; color: #16A34A;">0</span> candidate(s) ready
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">
                  <input type="checkbox" id="bcSelectAll" checked onchange="toggleSelectAllBroadcast(this.checked)">
                </th>
                <th>Candidate Profile</th>
                <th>Stage</th>
                <th>WhatsApp Number</th>
                <th>Resolved Message Preview</th>
                <th style="text-align: right;">Action &amp; Tracking</th>
              </tr>
            </thead>
            <tbody id="bcTableBody"></tbody>
          </table>
        </div>
      </div>

      <div id="emptyState" class="empty-state" style="display: none;">
        <p style="font-size: 15px; font-weight: 500; margin-bottom: 6px; color: var(--text-primary);">No candidates match your filter.</p>
        <button type="button" class="btn btn-secondary btn-sm" onclick="resetFilters()">Reset Filters</button>
      </div>
    </main>
    </div> <!-- /#screeningRoomView -->
  </div> <!-- /.app-container -->

  <!-- Slide-over Drawer -->
  <div class="drawer-backdrop" id="drawerBackdrop" onclick="closeDrawer()"></div>
  <aside class="drawer" id="talentDrawer">
    <div class="drawer-header">
      <div>
        <span id="drawerId" class="talent-id"></span>
        <h2 id="drawerTitle" style="font-size: 18px; font-weight: 600; color: var(--text-primary);">Candidate Profile</h2>
      </div>
      <button type="button" class="btn btn-secondary btn-icon" onclick="closeDrawer()">✕</button>
    </div>

    <div class="drawer-body" id="drawerBody"></div>

    <div class="drawer-footer">
      <button type="button" class="btn btn-danger btn-sm" id="btnDeleteDrawer" onclick="handleDeleteCurrentCandidate()">Delete Candidate</button>
      <div style="display: flex; gap: 8px; margin-left: auto;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeDrawer()">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" id="btnSaveDrawer" onclick="handleSaveCandidate()">Save Candidate</button>
      </div>
    </div>
  </aside>

  <!-- Floating Candidate Comparison Bar -->
  <div class="compare-bar" id="compareBar">
    <span style="font-family: var(--font-mono); font-size: 12px;">⚖️ Compare Selected (<span id="compareCount">0</span>/3)</span>
    <button type="button" class="btn btn-primary btn-sm" style="background: #2563EB; color: #FFFFFF;" onclick="openComparisonModal()">Side-by-Side Comparison ↗</button>
    <button type="button" class="btn btn-secondary btn-sm" style="background: transparent; color: #9CA3AF; border-color: rgba(255,255,255,0.2);" onclick="clearComparison()">Clear</button>
  </div>

  <!-- Candidate Comparison Modal -->
  <div class="modal-backdrop" id="compareModalBackdrop">
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <div>
          <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted);">Side-by-Side Evaluation</span>
          <h2 style="font-family: var(--font-serif); font-size: 20px; font-weight: 500; color: var(--text-primary);">Candidate Comparison Matrix</h2>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closeComparisonModal()">✕</button>
      </div>
      <div class="modal-body" id="compareModalBody"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeComparisonModal()">Close Matrix</button>
      </div>
    </div>
  </div>

  <!-- Candidate Profile Showcase Modal (2-Column Split for Team Members & Quick Viewing) -->
  <div class="modal-backdrop" id="candidateProfileModalBackdrop" onclick="if(event.target === this) closeCandidateProfileModal()">
    <div class="modal-card modal-card-xl" style="max-height: 92vh; display: flex; flex-direction: column; padding: 0; overflow: hidden; border-radius: var(--radius-lg);">
      <div class="modal-header" style="padding: 16px 24px; border-bottom: 1px solid var(--border-light); background: #F9FAFB;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div id="profModalAvatar" style="width: 44px; height: 44px; border-radius: 50%; background: #111827; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; font-family: var(--font-mono); box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
            P
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
              <span id="profModalId" class="talent-id" style="font-size: 11px;">PGE-000</span>
              <span id="profModalStageBadge" class="stage-badge stage-prospect">Prospect</span>
              <span id="profModalRatingStars" style="color: #D97706; font-size: 12px; font-weight: 700;">★★★★★</span>
            </div>
            <h2 id="profModalName" style="font-family: var(--font-serif); font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">
              Candidate Name
            </h2>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" id="profModalAdminEditBtn" class="btn btn-secondary btn-sm" style="display: none;" onclick="switchToEditDrawer()">
            ✏️ Edit Candidate
          </button>
          <button type="button" class="btn btn-secondary btn-icon" onclick="closeCandidateProfileModal()">✕</button>
        </div>
      </div>

      <div class="modal-body modal-split-grid" style="padding: 24px; overflow-y: auto; display: grid; grid-template-columns: 310px 1fr; gap: 24px; background: #FFFFFF;">
        <!-- Left Column: Bio Details, Skill Benchmarks & WhatsApp Outreach -->
        <div id="profModalLeftCol" class="modal-split-left" style="display: flex; flex-direction: column; gap: 16px; border-right: 1px solid var(--border-light); padding-right: 20px;"></div>

        <!-- Right Column: Interactive CV & Multi-Portfolio Media Showcase -->
        <div id="profModalRightCol" style="display: flex; flex-direction: column; gap: 20px;"></div>
      </div>
    </div>
  </div>

  <!-- Multi-Portfolio Gallery Modal -->
  <div class="modal-backdrop" id="portoGalleryModalBackdrop">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #7C3AED;">Candidate Creative Works</span>
          <h2 id="portoGalleryCandidateName" style="font-family: var(--font-serif); font-size: 18px; font-weight: 500; color: var(--text-primary);">Portfolio Gallery</h2>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closePortoGalleryModal()">✕</button>
      </div>
      <div class="modal-body" id="portoGalleryModalBody"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closePortoGalleryModal()">Close Gallery</button>
      </div>
    </div>
  </div>

  <!-- Candidate Team Comments & Remarks Modal -->
  <div class="modal-backdrop" id="candidateCommentsModalBackdrop">
    <div class="modal-card" style="max-width: 580px;">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: #EFF6FF; border: 1px solid #BFDBFE; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #2563EB;">
            💬
          </div>
          <div>
            <h2 style="font-family: var(--font-serif); font-size: 17px; font-weight: 600; color: var(--text-primary); margin: 0;">
              Catatan &amp; Evaluasi Tim HR
            </h2>
            <div id="candidateCommentsSubtitle" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              PGE-000 Candidate Name
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closeCandidateCommentsModal()">✕</button>
      </div>

      <div class="modal-body" style="padding: 16px 20px; max-height: 400px; min-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #FFFFFF;">
        <div id="candidateCommentsList" style="display: flex; flex-direction: column; gap: 10px;"></div>
      </div>

      <div class="modal-footer" style="padding: 12px 16px; background: #F8FAFC; border-top: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 8px; width: 100%;">
          <input type="text" id="inputCandidateCommentText" class="form-input" placeholder="Tulis catatan evaluasi tim untuk kandidat ini... (Tekan Enter)" style="flex: 1; font-size: 12px;" onkeydown="if(event.key==='Enter') handleAddCandidateCommentFromModal()">
          <button type="button" class="btn btn-primary btn-sm" onclick="handleAddCandidateCommentFromModal()" style="font-size: 12px; padding: 6px 14px;">
            Kirim ↵
          </button>
        </div>
        <div style="font-size: 10px; color: var(--text-muted); display: flex; justify-content: space-between;">
          <span>💡 Catatan tersinkronisasi realtime ke seluruh tim HR.</span>
          <span id="candidateCommentTypingIndicator"></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Team Access & Whitelist Modal -->
  <div class="modal-backdrop" id="whitelistModalBackdrop">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #2563EB;">Security & Access Control</span>
          <h2 style="font-family: var(--font-serif); font-size: 18px; font-weight: 500; color: var(--text-primary);">HR Team Whitelist Manager</h2>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closeWhitelistModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
          Kelola akun email Google yang diizinkan login ke dashboard PGE Talent Pool.
        </div>

        <!-- Add New Email Bar -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <input type="email" id="inputNewWhitelistEmail" class="form-input" placeholder="Masukkan email Google baru (e.g. recruiter@gmail.com)" style="flex: 1;">
          <button type="button" class="btn btn-primary btn-sm" onclick="handleAddWhitelistEmail()">+ Add Email</button>
        </div>

        <!-- Whitelist List Table -->
        <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
          Authorized Accounts:
        </div>
        <div id="whitelistItemsContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto;"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeWhitelistModal()">Close</button>
      </div>
    </div>
  </div>

  <!-- Global Floating Background Upload Indicator -->
  <div class="global-upload-pill" id="globalUploadPill">
    <span id="globalUploadIcon">☁️</span>
    <span id="globalUploadText">Uploading to Appwrite Storage...</span>
    <div class="mini-track" id="globalUploadTrack">
      <div class="mini-fill" id="globalUploadBar"></div>
    </div>
  </div>

  <!-- Floating HR Team Messenger Trigger & Panel -->
  <button type="button" class="messenger-trigger" id="messengerTrigger" onclick="toggleTeamMessenger()">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    <span>Team Chat</span>
    <span class="messenger-unread-badge" id="messengerUnreadBadge" style="display: none;">0</span>
  </button>

  <div class="messenger-panel" id="messengerPanel">
    <div class="messenger-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px #10B981;"></div>
        <div>
          <div style="font-weight: 600; font-size: 13px; color: #FFFFFF;">HR Team Lounge</div>
          <div style="font-size: 10px; color: #9CA3AF; font-family: var(--font-mono);">Live Realtime Discussion</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <button type="button" class="btn btn-secondary btn-icon" onclick="requestWindowsDesktopNotification()" style="color: #9CA3AF; border: none; background: transparent; padding: 4px; font-size: 13px;" title="Aktifkan Notifikasi Desktop Windows">
          🔔
        </button>
        <button type="button" class="btn btn-secondary btn-icon" onclick="toggleTeamMessenger()" style="color: #9CA3AF; border: none; background: transparent; padding: 4px;" title="Close">
          ✕
        </button>
      </div>
    </div>

    <!-- Messenger View Tabs -->
    <div class="messenger-tabs-bar">
      <button type="button" id="tabBtnChat" class="messenger-tab-btn active" onclick="switchMessengerTab('chat')">
        💬 Chat Messages
      </button>
      <button type="button" id="tabBtnMembers" class="messenger-tab-btn" onclick="switchMessengerTab('members')">
        🟢 Online Members (<span id="chatOnlineMemberCount">0</span>)
      </button>
    </div>

    <!-- Tab 1: Chat Feed Body -->
    <div class="messenger-body" id="messengerChatBody">
      <div style="text-align: center; font-size: 11px; color: var(--text-muted); padding: 12px 0;">
        👋 Selamat datang di Lounge Chat Tim HR PGE.
      </div>
    </div>

    <!-- Tab 2: Online / Team Presence List Body -->
    <div class="messenger-body" id="messengerMembersBody" style="display: none; background: #FFFFFF;">
      <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; font-family: var(--font-mono);">
        Active Team Presence:
      </div>
      <div id="messengerMembersList" style="display: flex; flex-direction: column; gap: 8px;"></div>
    </div>

    <!-- Composer Footer -->
    <form class="messenger-footer" id="messengerFooter" onsubmit="event.preventDefault(); handleSendTeamMessage();">
      <input type="text" id="messengerInput" class="form-input" placeholder="Tulis pesan ke tim HR..." style="font-size: 12px; padding: 7px 10px;" autocomplete="off">
      <button type="submit" class="btn btn-primary btn-sm" style="padding: 7px 12px; font-size: 12px;">
        Kirim
      </button>
    </form>
  </div>

  <!-- Notification Toasts -->
  <div class="toast-container" id="toastContainer"></div>

  <script>
    // 1. Firebase Auth & Realtime Presence Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyD8HZVXj6kzxVrdMrbmenfKRb5itrtvboA",
      authDomain: "talentpool-34137.firebaseapp.com",
      databaseURL: "https://talentpool-34137-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "talentpool-34137",
      storageBucket: "talentpool-34137.firebasestorage.app",
      messagingSenderId: "530363287467",
      appId: "1:530363287467:web:6d58c64fb7dffd70b534ee"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const rtdb = firebase.database();

    // Enable Persistent Local Auth across page refreshes
    try {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
        console.warn('Auth persistence config:', err);
      });
    } catch (e) {}

    // 2. Authorized HR Super Admin Whitelist & Cloud Sync
    const SUPER_ADMIN_EMAILS = [
      'hrdcvpge@gmail.com'
    ];

    let cloudWhitelist = [];

    // Realtime Cloud Whitelist Listener (Multi-Device Sync)
    try {
      rtdb.ref('/metadata/authorizedEmails').on('value', (snap) => {
        const val = snap.val();
        if (Array.isArray(val)) {
          cloudWhitelist = val;
        } else if (val && typeof val === 'object') {
          cloudWhitelist = Object.values(val);
        } else {
          cloudWhitelist = [];
        }
        try {
          localStorage.setItem('pge_auth_whitelist', JSON.stringify(cloudWhitelist));
        } catch (e) {}

        // If user is currently signed in, re-check authorization
        if (auth.currentUser) {
          evaluateUserAccess(auth.currentUser);
        }
      });
    } catch (e) {
      console.warn('Realtime cloud whitelist error:', e);
    }

    function getCustomWhitelist() {
      if (cloudWhitelist && cloudWhitelist.length > 0) {
        return cloudWhitelist;
      }
      try {
        const stored = JSON.parse(localStorage.getItem('pge_auth_whitelist') || '[]');
        if (stored && stored.length > 0) {
          cloudWhitelist = stored;
          return stored;
        }
      } catch (e) {}
      return [];
    }

    async function saveCustomWhitelist(list) {
      cloudWhitelist = list;
      try {
        localStorage.setItem('pge_auth_whitelist', JSON.stringify(list));
      } catch (e) {}
      try {
        await rtdb.ref('/metadata/authorizedEmails').set(list);
      } catch (err) {
        console.warn('Sync whitelist to cloud error:', err);
      }
    }

    function isEmailAuthorized(email) {
      if (!email) return false;
      const lower = email.toLowerCase().trim();
      if (SUPER_ADMIN_EMAILS.includes(lower)) return true;
      if (lower.endsWith('@pge.co.id') || lower.endsWith('@pertamina.com')) return true;
      const customList = getCustomWhitelist();
      if (customList.some(e => (e || '').toLowerCase().trim() === lower)) return true;
      return false;
    }

    // 3. Appwrite Cloud Configuration
    const APPWRITE_CONFIG = {
      endpoint: 'https://sgp.cloud.appwrite.io/v1',
      projectId: '6a9131260006737c5919',
      databaseId: 'talent_pool_db',
      collectionId: 'talents',
      bucketId: '6a913140001b7455f5ff'
    };

    const client = new Appwrite.Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);

    const databases = new Appwrite.Databases(client);
    const storage = new Appwrite.Storage(client);

    const STAGES = ['Prospect', 'Screening', 'Interviewed', 'Shortlisted', 'Offered', 'Hired', 'Archived'];

    const state = {
      currentUser: null,
      talents: [],
      filteredTalents: [],
      candidateComments: {},
      activeCommentsTalentId: null,
      currentView: 'bento',
      activeVacancy: localStorage.getItem('pge_active_vacancy') || 'HUB',
      filters: { search: '', stage: 'ALL', rating: 0 },
      selectedTalent: null,
      stagedPortfolioItems: [],
      globalUploads: [],
      comparedTalentIds: new Set(),
      broadcastSelectedIds: new Set(),
      broadcastSentHistory: {},
      analyticsOpen: false
    };

    let el = {};

    /* ---------------------------------------------------- */
    /* SMART AUTO-CAPITALIZATION & STRING SANITIZERS        */
    /* ---------------------------------------------------- */
    function toTitleCase(str) {
      if (!str) return '';
      return str
        .toLowerCase()
        .split(' ')
        .map(word => {
          if (!word) return '';
          if (word.startsWith('(') && word.endsWith(')')) {
            return '(' + word.slice(1, -1).toUpperCase() + ')';
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ')
        .trim();
    }

    function cleanEducation(str) {
      if (!str) return '';
      let res = toTitleCase(str);
      const acronyms = ['S1', 'D3', 'D4', 'S2', 'SMA', 'SMK', 'USB', 'ISI', 'UNS', 'DKV', 'IT', 'UGM', 'UI', 'UNDIP', 'UNNES'];
      acronyms.forEach(acr => {
        const reg = new RegExp(\`\\\\b\${acr}\\\\b\`, 'gi');
        res = res.replace(reg, acr);
      });
      return res;
    }

    function formatToInternationalPhone(rawPhone) {
      if (!rawPhone) return '';
      let cleaned = String(rawPhone).replace(/[^0-9+]/g, '');
      if (cleaned.startsWith('08')) cleaned = '+628' + cleaned.substring(2);
      else if (cleaned.startsWith('628')) cleaned = '+' + cleaned;
      else if (cleaned.startsWith('8') && !cleaned.startsWith('+')) cleaned = '+62' + cleaned;
      return cleaned;
    }

    function cleanEmail(str) {
      if (!str) return '';
      return str.toLowerCase().trim();
    }

    function normalizeUrl(url) {
      if (!url || typeof url !== 'string') return '';
      const trimmed = url.trim();
      if (!trimmed) return '';
      const lower = trimmed.toLowerCase();
      if (['link', 'none', '-', '#', 'n/a', 'null', 'undefined', 'cv', 'porto'].includes(lower)) return '';
      if (/^(https?:\/\/|mailto:|tel:|data:|blob:)/i.test(trimmed)) {
        return trimmed;
      }
      return 'https://' + trimmed;
    }

    function isValidDisplayUrl(url) {
      if (!url || typeof url !== 'string') return false;
      const norm = normalizeUrl(url);
      return norm.startsWith('http://') || norm.startsWith('https://') || norm.startsWith('data:') || norm.startsWith('blob:');
    }

    function formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function cacheDOMElements() {
      el = {
        authGate: document.getElementById('authGate'),
        accessDeniedGate: document.getElementById('accessDeniedGate'),
        deniedUserEmail: document.getElementById('deniedUserEmail'),
        mainApp: document.getElementById('mainApp'),
        navUserAvatar: document.getElementById('navUserAvatar'),
        navUserName: document.getElementById('navUserName'),
        searchInput: document.getElementById('searchInput'),
        filterStage: document.getElementById('filterStage'),
        filterRating: document.getElementById('filterRating'),
        bentoContainer: document.getElementById('bentoContainer'),
        tableContainer: document.getElementById('tableContainer'),
        tableBody: document.getElementById('tableBody'),
        kanbanContainer: document.getElementById('kanbanContainer'),
        broadcastContainer: document.getElementById('broadcastContainer'),
        bcStageFilter: document.getElementById('bcStageFilter'),
        bcDateInput: document.getElementById('bcDateInput'),
        bcTimeInput: document.getElementById('bcTimeInput'),
        bcLocationInput: document.getElementById('bcLocationInput'),
        bcAutoUpdateStage: document.getElementById('bcAutoUpdateStage'),
        bcTemplateSelect: document.getElementById('bcTemplateSelect'),
        bcCustomMessage: document.getElementById('bcCustomMessage'),
        bcTableBody: document.getElementById('bcTableBody'),
        bcQueueCount: document.getElementById('bcQueueCount'),
        bcSelectAll: document.getElementById('bcSelectAll'),
        emptyState: document.getElementById('emptyState'),
        syncStatus: document.getElementById('syncStatus'),
        toastContainer: document.getElementById('toastContainer'),
        metricTotal: document.getElementById('metricTotal'),
        metricPipeline: document.getElementById('metricPipeline'),
        metricShortlisted: document.getElementById('metricShortlisted'),
        metricTopRated: document.getElementById('metricTopRated'),
        talentDrawer: document.getElementById('talentDrawer'),
        drawerBackdrop: document.getElementById('drawerBackdrop'),
        drawerId: document.getElementById('drawerId'),
        drawerTitle: document.getElementById('drawerTitle'),
        drawerBody: document.getElementById('drawerBody'),
        btnDeleteDrawer: document.getElementById('btnDeleteDrawer'),
        btnSaveDrawer: document.getElementById('btnSaveDrawer'),
        globalUploadPill: document.getElementById('globalUploadPill'),
        globalUploadIcon: document.getElementById('globalUploadIcon'),
        globalUploadText: document.getElementById('globalUploadText'),
        globalUploadTrack: document.getElementById('globalUploadTrack'),
        globalUploadBar: document.getElementById('globalUploadBar'),
        compareBar: document.getElementById('compareBar'),
        compareCount: document.getElementById('compareCount'),
        btnAddTalent: document.getElementById('btnAddTalent'),
        btnManageWhitelist: document.getElementById('btnManageWhitelist'),
        compareModalBackdrop: document.getElementById('compareModalBackdrop'),
        compareModalBody: document.getElementById('compareModalBody')
      };

      if (el.bcDateInput && !el.bcDateInput.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        el.bcDateInput.value = tomorrow.toISOString().slice(0, 10);
      }
    }

    function isSuperAdmin() {
      if (!state.currentUser || !state.currentUser.email) return false;
      const lower = state.currentUser.email.toLowerCase().trim();
      return SUPER_ADMIN_EMAILS.includes(lower);
    }

    function setupPresence(user) {
      if (!user || !user.email) return;
      try {
        const safeEmailKey = user.email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const userPresenceRef = rtdb.ref('/presence/' + safeEmailKey);
        const connectedRef = rtdb.ref('.info/connected');

        connectedRef.on('value', (snap) => {
          if (snap.val() === true) {
            userPresenceRef.onDisconnect().set({
              email: user.email,
              name: user.displayName || user.email,
              photoURL: user.photoURL || '',
              status: 'offline',
              lastActive: firebase.database.ServerValue.TIMESTAMP
            });

            userPresenceRef.set({
              email: user.email,
              name: user.displayName || user.email,
              photoURL: user.photoURL || '',
              status: 'online',
              lastActive: firebase.database.ServerValue.TIMESTAMP
            });
          }
        });
      } catch (e) {
        console.warn('Presence error:', e);
      }
    }

    function listenTeamPresence() {
      try {
        rtdb.ref('/presence').on('value', (snapshot) => {
          state.presenceData = snapshot.val() || {};
          updatePresenceBadge();
          renderMessengerMembers();
          const modal = document.getElementById('whitelistModalBackdrop');
          if (modal && modal.classList.contains('open')) {
            renderWhitelistItems();
          }
        });
      } catch (e) {
        console.warn('Listen presence error:', e);
      }
    }

    function updatePresenceBadge() {
      const onlineCount = Object.values(state.presenceData || {}).filter(u => u.status === 'online').length;
      const badge = document.getElementById('onlineTeamBadge');
      if (badge) {
        badge.textContent = \`🟢 \${onlineCount} Online\`;
        badge.style.display = isSuperAdmin() ? 'inline-flex' : 'none';
      }
    }

    function evaluateUserAccess(user) {
      if (!user) {
        state.currentUser = null;
        if (el.authGate) el.authGate.style.display = 'flex';
        if (el.accessDeniedGate) el.accessDeniedGate.style.display = 'none';
        if (el.mainApp) el.mainApp.style.display = 'none';
        return;
      }

      const userEmail = (user.email || '').toLowerCase().trim();

      if (isEmailAuthorized(userEmail)) {
        state.currentUser = user;
        if (el.authGate) el.authGate.style.display = 'none';
        if (el.accessDeniedGate) el.accessDeniedGate.style.display = 'none';
        if (el.mainApp) el.mainApp.style.display = 'block';

        if (el.navUserAvatar) el.navUserAvatar.src = user.photoURL || 'https://www.gravatar.com/avatar/?d=mp';
        if (el.navUserName) el.navUserName.textContent = user.displayName || userEmail;

        // Enforce Super Admin RBAC Permissions
        const isSuper = isSuperAdmin();
        if (el.btnAddTalent) el.btnAddTalent.style.display = isSuper ? 'inline-flex' : 'none';
        if (el.btnManageWhitelist) el.btnManageWhitelist.style.display = isSuper ? 'inline-flex' : 'none';

        setupPresence(user);
        listenTeamPresence();
        listenTeamChat();
        listenCandidateComments();

        if (state.talents.length === 0) {
          loadAppwriteTalents();
          subscribeAppwriteRealtime();
        } else {
          selectVacancy(state.activeVacancy);
        }
      } else {
        state.currentUser = null;
        if (el.authGate) el.authGate.style.display = 'none';
        if (el.mainApp) el.mainApp.style.display = 'none';
        if (el.accessDeniedGate) el.accessDeniedGate.style.display = 'flex';
        if (el.deniedUserEmail) el.deniedUserEmail.textContent = user.email || '';
      }
    }

    function initAuthListener() {
      auth.onAuthStateChanged((user) => {
        evaluateUserAccess(user);
      });
    }

    async function handleGoogleSignIn() {
      const btn = document.getElementById('btnGoogleSignIn') || document.querySelector('#authGate button');
      const originalHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spin-icon" style="display:inline-block; animation: spin 1s linear infinite;">⏳</span> <span>Menghubungkan ke Google...</span>';
      }
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        if (result && result.user) {
          evaluateUserAccess(result.user);
        }
      } catch (err) {
        console.error('Google Sign-In Error:', err);
        showToast('Login: ' + (err.message || 'Silakan coba lagi'));
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      }
    }

    async function handleSignOut() {
      try {
        await auth.signOut();
        showToast('Signed out successfully.');
      } catch (err) {
        console.error('Sign Out Error:', err);
      }
    }

    /* ---------------------------------------------------- */
    /* INTERACTIVE PARTICLE WEB BACKGROUND ENGINE           */
    /* ---------------------------------------------------- */
    function initParticleBackground() {
      const canvas = document.getElementById('bgParticleCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const mouse = { x: null, y: null, radius: 140 };

      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }, { passive: true });

      window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
      }, { passive: true });

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
      }, { passive: true });

      let particles = [];
      const colors = [
        'rgba(37, 99, 235, 0.45)',  // Royal Blue
        'rgba(16, 185, 129, 0.45)', // Pertamina Emerald Green
        'rgba(99, 102, 241, 0.4)'   // Indigo
      ];

      class Particle {
        constructor() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.size = Math.random() * 2 + 1.2;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;

          // Mouse attraction / gentle interaction
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              const force = (mouse.radius - dist) / mouse.radius;
              const angle = Math.atan2(dy, dx);
              this.x += Math.cos(angle) * force * 1.5;
              this.y += Math.sin(angle) * force * 1.5;
            }
          }
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      function initParticles() {
        particles = [];
        const count = Math.min(Math.floor((width * height) / 18000), 65);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle());
        }
      }

      function connectParticles() {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              const opacity = (1 - dist / maxDist) * 0.22;
              ctx.strokeStyle = \`rgba(100, 116, 139, \${opacity})\`;
              ctx.lineWidth = 0.75;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }

          // Connect to mouse cursor
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - particles[i].x;
            const dy = mouse.y - particles[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
              const opacity = (1 - dist / mouse.radius) * 0.35;
              ctx.strokeStyle = \`rgba(37, 99, 235, \${opacity})\`;
              ctx.lineWidth = 0.9;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        }
      }

      function animate() {
        if (document.visibilityState === 'visible') {
          ctx.clearRect(0, 0, width, height);
          for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
          }
          connectParticles();
        }
        requestAnimationFrame(animate);
      }

      initParticles();
      animate();
    }

    function bootApp() {
      cacheDOMElements();
      initParticleBackground();
      initEventListeners();
      initDefaultBroadcastTemplate();
      initAuthListener();
      if (auth.currentUser) {
        evaluateUserAccess(auth.currentUser);
      }
    }

    /* ---------------------------------------------------- */
    /* APPWRITE DATABASE LOAD & REALTIME                    */
    /* ---------------------------------------------------- */
    async function loadAppwriteTalents() {
      if (!state.currentUser) return;

      if (el.syncStatus) {
        el.syncStatus.textContent = 'Loading Appwrite... ⏳';
        el.syncStatus.style.background = 'var(--pastel-yellow-bg)';
        el.syncStatus.style.color = 'var(--pastel-yellow-text)';
      }

      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          [Appwrite.Query.limit(100)]
        );

        const items = (response.documents || []).map(doc => {
          let skills = [];
          let portfolioItems = [];
          try { if (doc.skillsJson) skills = JSON.parse(doc.skillsJson); } catch (e) {}
          try { if (doc.portfolioItemsJson) portfolioItems = JSON.parse(doc.portfolioItemsJson); } catch (e) {}

          return {
            $id: doc.$id,
            id: doc.talentId || doc.$id,
            name: toTitleCase(doc.name || ''),
            role: doc.role || 'Freelance Content Creator',
            phone: formatToInternationalPhone(doc.phone || ''),
            email: cleanEmail(doc.email || ''),
            experienceLevel: doc.experienceLevel || 'Junior',
            overallRating: Number(doc.overallRating) || 4,
            stage: doc.stage || 'Prospect',
            expectedSalary: doc.expectedSalary || 'Standard Uang Saku',
            domisili: toTitleCase(doc.domisili || ''),
            education: cleanEducation(doc.education || ''),
            cvUrl: doc.cvUrl || '',
            portfolioUrl: doc.portfolioUrl || '',
            portfolioItems: portfolioItems,
            skills: skills,
            notes: doc.notes || ''
          };
        });

        // Sort: Newest Candidates First
        items.sort((a, b) => {
          const numA = parseInt((a.id || '').replace(/\\D/g, ''), 10) || 0;
          const numB = parseInt((b.id || '').replace(/\\D/g, ''), 10) || 0;
          return numB - numA;
        });

        state.talents = items;
        selectVacancy(state.activeVacancy);

        if (el.syncStatus) {
          const activeCount = state.talents.filter(t => t.stage !== 'Archived').length;
          el.syncStatus.textContent = \`● Appwrite Cloud (\${activeCount} Active / \${state.talents.length} Total)\`;
          el.syncStatus.style.background = 'var(--pastel-green-bg)';
          el.syncStatus.style.color = 'var(--pastel-green-text)';
          el.syncStatus.style.borderColor = 'var(--pastel-green-border)';
        }
      } catch (err) {
        console.error('Appwrite load error:', err);
        if (el.syncStatus) {
          el.syncStatus.textContent = 'Appwrite Error';
          el.syncStatus.style.background = 'var(--pastel-red-bg)';
          el.syncStatus.style.color = 'var(--pastel-red-text)';
        }
      }
    }

    function subscribeAppwriteRealtime() {
      try {
        client.subscribe(
          \`databases.\${APPWRITE_CONFIG.databaseId}.collections.\${APPWRITE_CONFIG.collectionId}.documents\`,
          response => {
            console.log('Appwrite Realtime Event:', response.events);
            loadAppwriteTalents();
          }
        );
      } catch (e) {
        console.warn('Realtime subscription:', e);
      }
    }

    function initEventListeners() {
      if (el.searchInput) {
        el.searchInput.addEventListener('input', (e) => {
          state.filters.search = e.target.value.toLowerCase().trim();
          applyFilters();
        });
      }
      if (el.filterStage) {
        el.filterStage.addEventListener('change', (e) => {
          state.filters.stage = e.target.value;
          applyFilters();
        });
      }
      if (el.filterRating) {
        el.filterRating.addEventListener('change', (e) => {
          state.filters.rating = Number(e.target.value);
          applyFilters();
        });
      }
    }

    async function updateCandidateStage(id, newStage, event) {
      if (event) event.stopPropagation();
      if (!id || !newStage) return;

      const talent = state.talents.find(t => t.id === id || t.$id === id);
      if (talent) {
        talent.stage = newStage;
      }
      applyFilters();

      try {
        const docId = talent && talent.$id ? talent.$id : (id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId,
          { stage: newStage }
        );
        showToast(\`Updated \${talent ? talent.name : id} stage to \${newStage}\`);
      } catch (err) {
        console.error('Stage update error:', err);
        showToast('Error updating stage: ' + err.message);
      }
    }

    /* ---------------------------------------------------- */
    /* VACANCY HUB & MULTI-ROLE SCREENING LOGIC             */
    /* ---------------------------------------------------- */
    function getVacancyIcon(roleName) {
      const r = (roleName || '').toLowerCase();
      if (r.includes('video') || r.includes('editor')) return '🎬';
      if (r.includes('design') || r.includes('grafis') || r.includes('ui')) return '🎨';
      if (r.includes('creator') || r.includes('konten') || r.includes('content')) return '📱';
      if (r.includes('host') || r.includes('stream') || r.includes('talent') || r.includes('model')) return '🎙️';
      if (r.includes('admin') || r.includes('hr') || r.includes('secret')) return '📋';
      if (r.includes('marketing') || r.includes('sales') || r.includes('ads')) return '📈';
      if (r.includes('photo') || r.includes('foto')) return '📸';
      if (r.includes('writer') || r.includes('copy')) return '✍️';
      return '💼';
    }

    function getUniqueVacancies() {
      const rolesMap = {};
      state.talents.forEach(t => {
        const r = (t.role || 'Freelance Content Creator').trim();
        if (r) {
          if (!rolesMap[r]) {
            rolesMap[r] = {
              name: r,
              total: 0,
              active: 0,
              pipeline: 0,
              shortlisted: 0,
              topRated: 0,
              stages: { Prospect: 0, Screening: 0, Interviewed: 0, Shortlisted: 0, Offered: 0, Hired: 0, Archived: 0 }
            };
          }
          rolesMap[r].total++;
          if (t.stage !== 'Archived') {
            rolesMap[r].active++;
            if (['Prospect', 'Screening', 'Interviewed'].includes(t.stage)) rolesMap[r].pipeline++;
            if (t.stage === 'Shortlisted') rolesMap[r].shortlisted++;
            if (t.overallRating === 5) rolesMap[r].topRated++;
          }
          if (rolesMap[r].stages[t.stage] !== undefined) {
            rolesMap[r].stages[t.stage]++;
          }
        }
      });
      return Object.values(rolesMap).sort((a, b) => b.total - a.total);
    }

    function renderVacancyHub() {
      const hubContainer = document.getElementById('vacancyGridContainer');
      const quickSelector = document.getElementById('quickVacancySelector');
      const vacancies = getUniqueVacancies();

      // Populate Quick Selector Dropdown
      if (quickSelector) {
        let selectorHtml = \`<option value="ALL" \${state.activeVacancy === 'ALL' ? 'selected' : ''}>🌐 Semua Posisi (Master Pool - \${state.talents.length})</option>\`;
        vacancies.forEach(v => {
          selectorHtml += \`<option value="\${escapeHtml(v.name)}" \${state.activeVacancy === v.name ? 'selected' : ''}>\${getVacancyIcon(v.name)} \${escapeHtml(v.name)} (\${v.total})</option>\`;
        });
        quickSelector.innerHTML = selectorHtml;
      }

      if (!hubContainer) return;

      if (vacancies.length === 0) {
        hubContainer.innerHTML = \`
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: var(--text-secondary);">
            <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
            <div style="font-size: 15px; font-weight: 500; color: var(--text-primary);">Belum ada data lowongan pekerjaan.</div>
            <div style="font-size: 12px; margin-top: 4px;">Klik "+ Buka Posisi Lowongan Baru" untuk memulai.</div>
          </div>
        \`;
        return;
      }

      hubContainer.innerHTML = vacancies.map(v => {
        const icon = getVacancyIcon(v.name);
        return \`
          <div class="vacancy-card" onclick="selectVacancy('\${escapeHtml(v.name)}')">
            <div>
              <div class="vacancy-card-header">
                <div class="vacancy-icon-badge">\${icon}</div>
                <span class="vacancy-badge-active">🟢 Active Screening</span>
              </div>
              <div class="vacancy-title">\${escapeHtml(v.name)}</div>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                Target PGE Recruitment Workspace
              </div>

              <div class="vacancy-stat-row">
                <div class="vacancy-stat-item">
                  <span class="vacancy-stat-label">Pelamar</span>
                  <span class="vacancy-stat-value">\${v.total}</span>
                </div>
                <div class="vacancy-stat-item">
                  <span class="vacancy-stat-label">Pipeline</span>
                  <span class="vacancy-stat-value" style="color: #2563EB;">\${v.pipeline}</span>
                </div>
                <div class="vacancy-stat-item">
                  <span class="vacancy-stat-label">Shortlist</span>
                  <span class="vacancy-stat-value" style="color: #059669;">\${v.shortlisted}</span>
                </div>
              </div>

              <!-- Mini Stage Distribution Track -->
              <div style="margin-top: 10px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); margin-bottom: 4px;">
                  <span>Stage: \${v.stages.Prospect} Prs • \${v.stages.Screening} Scr • \${v.stages.Interviewed} Int • \${v.stages.Shortlisted} Shl</span>
                  <span>\${v.topRated} Top (5★)</span>
                </div>
                <div style="height: 5px; background: #E5E7EB; border-radius: 3px; overflow: hidden; display: flex;">
                  <div style="background: #93C5FD; width: \${v.total ? (v.stages.Prospect / v.total * 100) : 0}%;"></div>
                  <div style="background: #3B82F6; width: \${v.total ? (v.stages.Screening / v.total * 100) : 0}%;"></div>
                  <div style="background: #F59E0B; width: \${v.total ? (v.stages.Interviewed / v.total * 100) : 0}%;"></div>
                  <div style="background: #10B981; width: \${v.total ? (v.stages.Shortlisted / v.total * 100) : 0}%;"></div>
                  <div style="background: #059669; width: \${v.total ? (v.stages.Hired / v.total * 100) : 0}%;"></div>
                </div>
              </div>
            </div>

            <button type="button" class="vacancy-enter-btn">
              Masuk ke Ruang Screening ➔
            </button>
          </div>
        \`;
      }).join('');
    }

    function selectVacancy(vacancyName) {
      state.activeVacancy = vacancyName;
      try {
        localStorage.setItem('pge_active_vacancy', vacancyName);
      } catch (e) {}

      const hubView = document.getElementById('vacancyHubView');
      const roomView = document.getElementById('screeningRoomView');
      const heading = document.getElementById('selectedVacancyHeading');
      const meta = document.getElementById('selectedVacancyMeta');

      if (vacancyName === 'HUB') {
        if (hubView) hubView.style.display = 'block';
        if (roomView) roomView.style.display = 'none';
        renderVacancyHub();
      } else {
        if (hubView) hubView.style.display = 'none';
        if (roomView) roomView.style.display = 'block';

        if (vacancyName === 'ALL') {
          if (meta) meta.textContent = 'Master Talent Pool (All Roles)';
          if (heading) heading.innerHTML = 'All active candidate applications &amp; <em>universal repository</em>.';
        } else {
          const icon = getVacancyIcon(vacancyName);
          if (meta) meta.textContent = \`\${icon} Job Opening Screening Portal\`;
          if (heading) heading.innerHTML = \`Curated candidates for <em>\${escapeHtml(vacancyName)}</em>.\`;
        }

        applyFilters();
      }
    }

    function getVacancyFilteredTalents() {
      if (state.activeVacancy === 'HUB' || state.activeVacancy === 'ALL') {
        return state.talents;
      }
      return state.talents.filter(t => (t.role || 'Freelance Content Creator').toLowerCase().trim() === state.activeVacancy.toLowerCase().trim());
    }

    function applyFilters() {
      const baseList = getVacancyFilteredTalents();
      const q = state.filters.search;
      const stage = state.filters.stage;
      const rating = state.filters.rating;

      state.filteredTalents = baseList.filter((talent) => {
        if (stage === 'Archived') {
          if (talent.stage !== 'Archived') return false;
        } else if (stage === 'ALL') {
          if (talent.stage === 'Archived') return false;
        } else {
          if (talent.stage !== stage) return false;
        }

        if (rating > 0) {
          if (rating === 5 && talent.overallRating !== 5) return false;
          if (rating < 5 && talent.overallRating < rating) return false;
        }
        if (q) {
          const matchName = (talent.name || '').toLowerCase().includes(q);
          const matchRole = (talent.role || '').toLowerCase().includes(q);
          const matchNotes = (talent.notes || '').toLowerCase().includes(q);
          const matchSkills = (talent.skills || []).some((s) => (s.name || '').toLowerCase().includes(q));
          return matchName || matchRole || matchNotes || matchSkills;
        }
        return true;
      });

      renderVacancyHub();
      updateMetrics();
      if (state.analyticsOpen) renderAnalyticsDashboard();
      renderActiveView();
    }

    function resetFilters() {
      state.filters = { search: '', stage: 'ALL', rating: 0 };
      if (el.searchInput) el.searchInput.value = '';
      if (el.filterStage) el.filterStage.value = 'ALL';
      if (el.filterRating) el.filterRating.value = '0';
      applyFilters();
    }

    function updateMetrics() {
      const baseList = getVacancyFilteredTalents();
      const activeTalents = baseList.filter(t => t.stage !== 'Archived');
      if (el.metricTotal) el.metricTotal.textContent = activeTalents.length;
      if (el.metricPipeline) {
        const inPipe = baseList.filter(t => ['Prospect', 'Screening', 'Interviewed'].includes(t.stage)).length;
        el.metricPipeline.textContent = inPipe;
      }
      if (el.metricShortlisted) {
        el.metricShortlisted.textContent = baseList.filter(t => t.stage === 'Shortlisted').length;
      }
      if (el.metricTopRated) {
        el.metricTopRated.textContent = activeTalents.filter(t => t.overallRating === 5).length;
      }
    }

    function toggleAnalyticsDashboard() {
      const section = document.getElementById('analyticsDashboard');
      if (!section) return;
      state.analyticsOpen = !state.analyticsOpen;
      section.style.display = state.analyticsOpen ? 'block' : 'none';
      if (state.analyticsOpen) renderAnalyticsDashboard();
    }

    function renderAnalyticsDashboard() {
      const activeTalents = state.talents.filter(t => t.stage !== 'Archived');
      const total = activeTalents.length || 1;
      
      const funnelContainer = document.getElementById('analyticsFunnelContainer');
      if (funnelContainer) {
        funnelContainer.innerHTML = STAGES.filter(s => s !== 'Archived').map(stage => {
          const count = state.talents.filter(t => t.stage === stage).length;
          const pct = Math.round((count / total) * 100);
          return \`
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>\${stage}</span>
                <span style="font-family: var(--font-mono); font-weight: 500;">\${count} (\${pct}%)</span>
              </div>
              <div style="background: rgba(0,0,0,0.06); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: var(--text-primary); width: \${pct}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>\`;
        }).join('');
      }

      const ratingsContainer = document.getElementById('analyticsRatingsContainer');
      if (ratingsContainer) {
        const starCounts = [5, 4, 3, 2, 1].map(stars => ({
          stars,
          count: activeTalents.filter(t => t.overallRating === stars).length
        }));
        ratingsContainer.innerHTML = starCounts.map(({ stars, count }) => {
          const pct = Math.round((count / total) * 100);
          return \`
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>\${stars} Stars (\${'★'.repeat(stars)})</span>
                <span style="font-family: var(--font-mono); font-weight: 500;">\${count} (\${pct}%)</span>
              </div>
              <div style="background: rgba(0,0,0,0.06); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #EAB308; width: \${pct}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>\`;
        }).join('');
      }

      const skillsContainer = document.getElementById('analyticsSkillsContainer');
      if (skillsContainer) {
        const skillTotals = {};
        activeTalents.forEach(t => {
          (t.skills || []).forEach(s => {
            if (!skillTotals[s.name]) skillTotals[s.name] = { sum: 0, count: 0 };
            skillTotals[s.name].sum += s.rating;
            skillTotals[s.name].count += 1;
          });
        });
        const skillEntries = Object.keys(skillTotals).map(name => ({
          name,
          avg: (skillTotals[name].sum / skillTotals[name].count).toFixed(1)
        }));
        skillsContainer.innerHTML = skillEntries.map(({ name, avg }) => {
          const pct = Math.round((Number(avg) / 5) * 100);
          return \`
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>\${name}</span>
                <span style="font-family: var(--font-mono); font-weight: 500;">\${avg} / 5.0</span>
              </div>
              <div style="background: rgba(0,0,0,0.06); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #3B82F6; width: \${pct}%; height: 100%; border-radius: 3px;"></div>
              </div>
            </div>\`;
        }).join('');
      }

      const locationContainer = document.getElementById('analyticsLocationContainer');
      if (locationContainer) {
        const domisiliCounts = {};
        activeTalents.forEach(t => {
          const dom = t.domisili || '';
          if (dom && dom !== '-') domisiliCounts[dom] = (domisiliCounts[dom] || 0) + 1;
        });
        const sortedLocs = Object.keys(domisiliCounts).sort((a, b) => domisiliCounts[b] - domisiliCounts[a]).slice(0, 4);
        locationContainer.innerHTML = sortedLocs.map(loc => \`
          <div style="display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; border-bottom: 1px dashed var(--border-light);">
            <span>\${loc}</span>
            <span style="font-family: var(--font-mono); font-weight: 600;">\${domisiliCounts[loc]} candidates</span>
          </div>\`).join('');
      }
    }

    function switchView(viewName) {
      state.currentView = viewName;
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
      });
      renderActiveView();
    }

    function renderActiveView() {
      if (el.bentoContainer) el.bentoContainer.style.display = state.currentView === 'bento' ? 'grid' : 'none';
      if (el.tableContainer) el.tableContainer.style.display = state.currentView === 'table' ? 'block' : 'none';
      if (el.kanbanContainer) el.kanbanContainer.style.display = state.currentView === 'kanban' ? 'grid' : 'none';
      if (el.broadcastContainer) el.broadcastContainer.style.display = state.currentView === 'broadcast' ? 'flex' : 'none';

      const hasData = state.filteredTalents.length > 0;
      if (el.emptyState) el.emptyState.style.display = hasData ? 'none' : 'block';

      if (state.currentView === 'bento') renderBentoGrid();
      else if (state.currentView === 'table') renderTableView();
      else if (state.currentView === 'kanban') renderKanbanBoard();
      else if (state.currentView === 'broadcast') renderBroadcastTable();
    }

    /* ---------------------------------------------------- */
    /* BENTO GRID (CLEAN & UNCLUTTERED)                     */
    /* ---------------------------------------------------- */
    function renderBentoGrid() {
      if (!el.bentoContainer) return;
      el.bentoContainer.innerHTML = state.filteredTalents.map(talent => {
        const stageClass = 'stage-' + (talent.stage || 'prospect').toLowerCase();
        const skillsHtml = (talent.skills || []).map(s => \`<span class="skill-tag">\${escapeHtml(s.name)} \${'★'.repeat(s.rating)}</span>\`).join('');
        const isCompared = state.comparedTalentIds.has(talent.id);

        const phoneClean = formatToInternationalPhone(talent.phone);
        const waLink = phoneClean ? \`<a href="https://wa.me/\${phoneClean.replace(/\\+/g, '')}" target="_blank" class="doc-badge doc-badge-wa" onclick="event.stopPropagation()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          \${phoneClean}
        </a>\` : '';

        // CV badge
        const safeCv = normalizeUrl(talent.cvUrl);
        const cvLink = isValidDisplayUrl(safeCv) ? \`<a href="\${safeCv}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-cv" onclick="event.stopPropagation()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          CV ↗
        </a>\` : '';

        // Porto badge (Support Multi-Porto Gallery Modal)
        const validPortoList = (talent.portfolioItems || []).filter(p => isValidDisplayUrl(p.url));
        const portoCount = validPortoList.length ? validPortoList.length : (isValidDisplayUrl(talent.portfolioUrl) ? 1 : 0);
        let portoLink = '';
        if (portoCount > 1) {
          portoLink = \`<span class="doc-badge doc-badge-porto" onclick="event.stopPropagation(); openPortoGalleryModal('\${talent.id}')" title="Click to view all \${portoCount} portfolios">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Porto (\${portoCount}) 📚 ↗
          </span>\`;
        } else if (portoCount === 1) {
          const rawDirect = validPortoList.length ? validPortoList[0].url : talent.portfolioUrl;
          const directUrl = normalizeUrl(rawDirect);
          portoLink = \`<a href="\${directUrl}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-porto" onclick="event.stopPropagation()">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Porto ↗
          </a>\`;
        }

        // Interactive stage selector
        const stageSelectHtml = \`
          <select class="stage-select-pill \${stageClass}" 
                  onchange="updateCandidateStage('\${talent.id}', this.value, event)" 
                  onclick="event.stopPropagation()">
            \${STAGES.map(st => \`<option value="\${st}" \${(talent.stage || 'Prospect') === st ? 'selected' : ''}>\${st}</option>\`).join('')}
          </select>
        \`;

        // Team Comments & Notes snippet on Bento Card
        const comments = state.candidateComments[talent.id] || [];
        let commentSnippetHtml = '';
        if (comments.length > 0) {
          const last = comments[comments.length - 1];
          const authorShort = (last.authorName || 'HR').split(' ')[0];
          commentSnippetHtml = \`
            <div class="card-comments-snippet">
              <span class="comment-author-avatar-sm">\${authorShort.charAt(0).toUpperCase()}</span>
              <span style="font-weight: 600; color: #1E293B;">\${escapeHtml(authorShort)}:</span>
              <span style="color: #64748B; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"\${escapeHtml(last.text)}"</span>
            </div>
            <span class="card-comments-count-pill">\${comments.length}</span>
          \`;
        } else {
          commentSnippetHtml = \`
            <div class="card-comments-snippet">
              <span style="font-size: 13px;">💬</span>
              <span style="color: #94A3B8; font-style: italic; font-size: 10.5px;">+ Tulis catatan evaluasi tim...</span>
            </div>
            <span class="card-comments-count-pill">+ Catatan</span>
          \`;
        }

        const commentsBlockHtml = \`
          <div class="card-comments-preview" data-talent-id="\${talent.id}" onclick="event.stopPropagation(); openCandidateCommentsModal('\${talent.id}')" title="Buka Catatan &amp; Diskusi Tim HR (\${comments.length})">
            \${commentSnippetHtml}
          </div>
        \`;

        return \`
          <div class="talent-card \${isCompared ? 'selected-compare' : ''}" onclick="handleCandidateCardClick('\${talent.id}')">
            <div>
              <div class="card-header">
                <div>
                  <div class="talent-id">\${talent.id}</div>
                  <div class="talent-name">\${escapeHtml(talent.name)}</div>
                  <div class="talent-role">\${escapeHtml(talent.role || 'Freelance Content Creator')}</div>
                </div>
                <div class="rating-badge">★ \${(talent.overallRating || 4).toFixed(1)}</div>
              </div>

              <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 8px;">
                \${talent.domisili && talent.domisili !== '-' ? \`<span class="skill-tag" style="background:#F0FDF4; border-color:#DCFCE7; color:#166534;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> \${escapeHtml(talent.domisili)}</span>\` : ''}
                \${talent.education && talent.education !== '-' ? \`<span class="skill-tag" style="background:#FAF5FF; border-color:#F3E8FD; color:#6B21A8;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg> \${escapeHtml(talent.education)}</span>\` : ''}
                \${stageSelectHtml}
              </div>

              <div class="skills-row">\${skillsHtml}</div>
              \${commentsBlockHtml}
            </div>

            <div class="card-footer">
              <div class="doc-badges">
                <label class="compare-pill" onclick="event.stopPropagation()">
                  <input type="checkbox" \${isCompared ? 'checked' : ''} onchange="toggleCompareCandidate('\${talent.id}')">
                  <span>Compare</span>
                </label>
                \${waLink}
                \${cvLink}
                \${portoLink}
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn btn-secondary btn-icon" onclick="event.stopPropagation(); \${isSuperAdmin() ? \`openTalentDetail('\${talent.id}')\` : \`openCandidateProfileModal('\${talent.id}')\`}" title="\${isSuperAdmin() ? 'Edit candidate' : 'View full profile'}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                \${isSuperAdmin() ? \`
                  <button type="button" class="btn btn-secondary btn-icon" onclick="event.stopPropagation(); deleteCandidate('\${talent.id}', '\${escapeHtml(talent.name)}')" title="Delete candidate" style="color: var(--pastel-red-text);">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                \` : ''}
              </div>
            </div>
          </div>\`;
      }).join('');
    }

    /* ---------------------------------------------------- */
    /* TABLE VIEW                                           */
    /* ---------------------------------------------------- */
    function renderTableView() {
      if (!el.tableBody) return;
      el.tableBody.innerHTML = state.filteredTalents.map(talent => {
        const stageClass = 'stage-' + (talent.stage || 'prospect').toLowerCase();
        const phoneClean = formatToInternationalPhone(talent.phone);
        const isCompared = state.comparedTalentIds.has(talent.id);
        
        const validPortoList = (talent.portfolioItems || []).filter(p => isValidDisplayUrl(p.url));
        const portoCount = validPortoList.length ? validPortoList.length : (isValidDisplayUrl(talent.portfolioUrl) ? 1 : 0);
        let livePortoUrlHtml = '';
        if (portoCount > 1) {
          livePortoUrlHtml = \`<span class="doc-badge doc-badge-porto" onclick="event.stopPropagation(); openPortoGalleryModal('\${talent.id}')">Porto (\${portoCount}) 📚 ↗</span>\`;
        } else if (portoCount === 1) {
          const rawDirect = validPortoList.length ? validPortoList[0].url : talent.portfolioUrl;
          const directUrl = normalizeUrl(rawDirect);
          livePortoUrlHtml = \`<a href="\${directUrl}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-porto" onclick="event.stopPropagation()">Porto ↗</a>\`;
        }

        const safeCvTable = normalizeUrl(talent.cvUrl);
        const stageSelectTableHtml = \`
          <select class="stage-select-pill \${stageClass}" 
                  onchange="updateCandidateStage('\${talent.id}', this.value, event)" 
                  onclick="event.stopPropagation()">
            \${STAGES.map(st => \`<option value="\${st}" \${(talent.stage || 'Prospect') === st ? 'selected' : ''}>\${st}</option>\`).join('')}
          </select>
        \`;

        return \`
          <tr onclick="handleCandidateCardClick('\${talent.id}')" style="cursor: pointer;" class="\${isCompared ? 'selected-compare' : ''}">
            <td onclick="event.stopPropagation()">
              <input type="checkbox" \${isCompared ? 'checked' : ''} onchange="toggleCompareCandidate('\${talent.id}')">
            </td>
            <td style="font-family: var(--font-mono); font-weight: 500;">\${talent.id}</td>
            <td>
              <div style="font-weight: 600;">\${escapeHtml(talent.name)}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">\${escapeHtml(talent.role || 'Freelance')}</div>
            </td>
            <td>\${stageSelectTableHtml}</td>
            <td>\${talent.experienceLevel || 'Junior'}</td>
            <td><span class="rating-badge">★ \${(talent.overallRating || 4).toFixed(1)}</span></td>
            <td>
              <div class="doc-badges">
                \${phoneClean ? \`<a href="https://wa.me/\${phoneClean.replace(/\\+/g, '')}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-wa" onclick="event.stopPropagation()">\${phoneClean}</a>\` : ''}
                \${isValidDisplayUrl(safeCvTable) ? \`<a href="\${safeCvTable}" target="_blank" rel="noopener noreferrer" class="doc-badge doc-badge-cv" onclick="event.stopPropagation()">CV ↗</a>\` : ''}
                \${livePortoUrlHtml}
              </div>
            </td>
            <td style="text-align: right;">
              \${isSuperAdmin() ? \`
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openTalentDetail('\${talent.id}')">Edit</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); deleteCandidate('\${talent.id}', '\${escapeHtml(talent.name)}')" style="color: var(--pastel-red-text); margin-left: 4px;">Delete</button>
              \` : \`
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openCandidateProfileModal('\${talent.id}')">View Profile ↗</button>
              \`}
            </td>
          </tr>\`;
      }).join('');
    }

    /* ---------------------------------------------------- */
    /* KANBAN BOARD                                         */
    /* ---------------------------------------------------- */
    function renderKanbanBoard() {
      if (!el.kanbanContainer) return;
      el.kanbanContainer.innerHTML = STAGES.map(stage => {
        const stageTalents = state.filteredTalents.filter(t => t.stage === stage);
        const cardsHtml = stageTalents.map(t => \`
          <div class="kanban-card" onclick="handleCandidateCardClick('\${t.id}')">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);">\${t.id}</span>
              <span class="rating-badge" style="font-size: 9px; padding: 2px 5px;">★ \${(t.overallRating || 4).toFixed(1)}</span>
            </div>
            <div style="font-weight: 600; font-size: 13px;">\${escapeHtml(t.name)}</div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">\${escapeHtml(t.role || 'Content Creator')}</div>
            <div style="margin-top: 8px;">
              <select class="stage-select-pill stage-\${(t.stage || 'prospect').toLowerCase()}" 
                      style="width: 100%; font-size: 10px; padding: 2px 18px 2px 6px;"
                      onchange="updateCandidateStage('\${t.id}', this.value, event)" 
                      onclick="event.stopPropagation()">
                \${STAGES.map(st => \`<option value="\${st}" \${(t.stage || 'Prospect') === st ? 'selected' : ''}>\${st}</option>\`).join('')}
              </select>
            </div>
          </div>\`).join('');

        return \`
          <div class="kanban-col">
            <div class="kanban-col-header">
              <span>\${stage}</span>
              <span style="background: var(--bg-surface); padding: 2px 6px; border-radius: var(--radius-pill); border: 1px solid var(--border-light);">\${stageTalents.length}</span>
            </div>
            <div class="kanban-cards-wrap">\${cardsHtml}</div>
          </div>\`;
      }).join('');
    }

    /* ---------------------------------------------------- */
    /* WHATSAPP BROADCAST TAB LOGIC                         */
    /* ---------------------------------------------------- */
    function initDefaultBroadcastTemplate() {
      if (el.bcCustomMessage) {
        el.bcCustomMessage.value = \`Halo Kak {name},\\n\\nTerima kasih telah melamar posisi {role} di PGE Talent Pool.\\n\\nKami telah meninjau portofolio Kakak dan ingin mengundang Kakak untuk sesi Interview:\\n📅 Tanggal: {date}\\n⏰ Waktu: {time}\\n📍 Lokasi: {location}\\n\\nMohon konfirmasi kehadiran Kakak dengan membalas pesan ini ya. Terima kasih!\\n- Tim HR PGE Talent Pool\`;
      }
    }

    function handleBroadcastTemplateChange() {
      const tmpl = el.bcTemplateSelect ? el.bcTemplateSelect.value : 'interview';
      const msgBox = el.bcCustomMessage;
      if (!msgBox) return;

      if (tmpl === 'interview') {
        msgBox.value = \`Halo Kak {name},\\n\\nTerima kasih telah melamar posisi {role} di PGE Talent Pool.\\n\\nKami telah meninjau portofolio Kakak dan ingin mengundang Kakak untuk sesi Interview:\\n📅 Tanggal: {date}\\n⏰ Waktu: {time}\\n📍 Lokasi: {location}\\n\\nMohon konfirmasi kehadiran Kakak dengan membalas pesan ini ya. Terima kasih!\\n- Tim HR PGE Talent Pool\`;
      } else if (tmpl === 'screening') {
        msgBox.value = \`Halo Kak {name},\\n\\nKami dari Tim Rekrutmen PGE Talent Pool sedang meninjau aplikasi Kakak untuk posisi {role}.\\n\\nBisakah Kakak mengirimkan link portofolio video/desain terbaru dan konfirmasi kesiapan interview pada {date} pukul {time}?\\n\\nTerima kasih Kak!\\n- Tim Rekrutmen PGE\`;
      } else if (tmpl === 'offering') {
        msgBox.value = \`Selamat Kak {name}! 🎉\\n\\nBerdasarkan hasil evaluasi tim, Kakak telah terpilih untuk melanjutkan ke tahap penawaran kerja sama (Offering) posisi {role}.\\n\\nSesi penjelasan kontrak & onboarding akan dilaksanakan pada:\\n📅 Tanggal: {date}\\n⏰ Waktu: {time}\\n📍 Link/Tempat: {location}\\n\\nApakah Kakak siap bergabung?\\n\\nTerima kasih!\\n- Management PGE Team\`;
      } else {
        msgBox.value = \`Halo Kak {name},\\n\\n\`;
      }

      updateBroadcastPreview();
    }

    function insertVariableIntoMessage(variableTag) {
      const textarea = el.bcCustomMessage;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      textarea.value = text.substring(0, start) + variableTag + text.substring(end);
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variableTag.length;
      updateBroadcastPreview();
    }

    function formatDisplayDate(dateStr) {
      if (!dateStr) return 'Besok';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    }

    function resolveCandidateMessage(talent) {
      const template = el.bcCustomMessage ? el.bcCustomMessage.value : '';
      const dateVal = formatDisplayDate(el.bcDateInput ? el.bcDateInput.value : '');
      const timeVal = el.bcTimeInput ? el.bcTimeInput.value.trim() : '10:00 WIB';
      const locVal = el.bcLocationInput ? el.bcLocationInput.value.trim() : 'Online Meet';

      return template
        .replace(/{name}/g, talent.name || 'Kandidat')
        .replace(/{role}/g, talent.role || 'Freelance Content Creator')
        .replace(/{date}/g, dateVal)
        .replace(/{time}/g, timeVal)
        .replace(/{location}/g, locVal)
        .replace(/{id}/g, talent.id || '');
    }

    function renderBroadcastTable() {
      if (!el.bcTableBody) return;
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';

      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });

      if (state.broadcastSelectedIds.size === 0) {
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      }

      if (el.bcQueueCount) el.bcQueueCount.textContent = targetTalents.length;

      el.bcTableBody.innerHTML = targetTalents.map(talent => {
        const isSelected = state.broadcastSelectedIds.has(talent.id);
        const phone = formatToInternationalPhone(talent.phone);
        const resolvedMsg = resolveCandidateMessage(talent);
        const sentTime = state.broadcastSentHistory[talent.id];
        const isSent = !!sentTime;

        return \`
          <tr>
            <td style="text-align: center;">
              <input type="checkbox" \${isSelected ? 'checked' : ''} onchange="toggleBroadcastSelect('\${talent.id}')">
            </td>
            <td>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">\${talent.id}</div>
              <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">\${escapeHtml(talent.name)}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">\${escapeHtml(talent.role || 'Freelance')} • \${escapeHtml(talent.domisili || '-')}</div>
            </td>
            <td>
              <span class="stage-select-pill stage-\${(talent.stage || 'prospect').toLowerCase()}">\${talent.stage || 'Prospect'}</span>
            </td>
            <td style="font-family: var(--font-mono); font-size: 12px;">
              \${phone ? \`<span style="color: #166534; font-weight: 500;">\${phone}</span>\` : '<span style="color: #DC2626;">No WhatsApp</span>'}
            </td>
            <td style="max-width: 320px;">
              <div style="font-size: 11px; color: var(--text-secondary); background: #F9FAFB; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--border-light); max-height: 55px; overflow-y: auto; white-space: pre-wrap; line-height: 1.4;">\${escapeHtml(resolvedMsg)}</div>
            </td>
            <td style="text-align: right;">
              \${phone ? \`
                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                  \${isSent ? \`
                    <span style="font-family: var(--font-mono); font-size: 11px; color: #16A34A; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                      ✓ Sent (\${sentTime})
                    </span>
                  \` : '<span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">⏳ Pending</span>'}
                  <button type="button" class="btn btn-wa btn-sm" onclick="sendBroadcastSingle('\${talent.id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Send to WA ↗
                  </button>
                </div>
              \` : '<span style="font-size: 11px; color: var(--text-muted);">Cannot send</span>'}
            </td>
          </tr>\`;
      }).join('');
    }

    function updateBroadcastPreview() {
      if (state.currentView === 'broadcast') {
        renderBroadcastTable();
      }
    }

    function toggleBroadcastSelect(id) {
      if (state.broadcastSelectedIds.has(id)) {
        state.broadcastSelectedIds.delete(id);
      } else {
        state.broadcastSelectedIds.add(id);
      }
    }

    function toggleSelectAllBroadcast(isChecked) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });

      if (isChecked) {
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      } else {
        state.broadcastSelectedIds.clear();
      }
      renderBroadcastTable();
    }

    async function sendBroadcastSingle(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      const phone = formatToInternationalPhone(talent.phone);
      if (!phone) {
        showToast('Candidate does not have a valid WhatsApp number');
        return;
      }

      const msg = resolveCandidateMessage(talent);
      const cleanNum = phone.replace(/\\+/g, '');
      const waUrl = \`https://wa.me/\${cleanNum}?text=\${encodeURIComponent(msg)}\`;

      window.open(waUrl, '_blank');

      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      state.broadcastSentHistory[talent.id] = nowTime;

      const autoUpdate = el.bcAutoUpdateStage && el.bcAutoUpdateStage.checked;
      if (autoUpdate) {
        const dateVal = formatDisplayDate(el.bcDateInput ? el.bcDateInput.value : '');
        const timeVal = el.bcTimeInput ? el.bcTimeInput.value.trim() : '10:00 WIB';
        const locVal = el.bcLocationInput ? el.bcLocationInput.value.trim() : 'Online Meet';
        
        const scheduleRemark = \`\\n[Interview Scheduled: \${dateVal} \${timeVal} @ \${locVal}]\`;
        const updatedNotes = (talent.notes || '') + scheduleRemark;

        talent.stage = 'Interviewed';
        talent.notes = updatedNotes;

        try {
          const docId = talent.$id || (talent.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            {
              stage: 'Interviewed',
              notes: updatedNotes
            }
          );
          showToast(\`✅ Sent & Recorded Schedule for \${talent.name} in Appwrite!\`);
        } catch (err) {
          console.warn('Auto-save schedule error:', err);
        }
      } else {
        showToast(\`Opening WhatsApp for \${talent.name}...\`);
      }

      renderBroadcastTable();
      updateMetrics();
    }

    /* ---------------------------------------------------- */
    /* CANDIDATE PROFILE SHOWCASE MODAL (2-COLUMN SPLIT)    */
    /* ---------------------------------------------------- */
    let currentProfileTalentId = null;

    function handleCandidateCardClick(id) {
      if (isSuperAdmin()) {
        openTalentDetail(id);
      } else {
        openCandidateProfileModal(id);
      }
    }

    function openCandidateProfileModal(id) {
      const talent = state.talents.find(t => t.id === id || t.$id === id);
      if (!talent) return;
      currentProfileTalentId = talent.id;

      const modal = document.getElementById('candidateProfileModalBackdrop');
      const avatarEl = document.getElementById('profModalAvatar');
      const idEl = document.getElementById('profModalId');
      const stageBadgeEl = document.getElementById('profModalStageBadge');
      const ratingStarsEl = document.getElementById('profModalRatingStars');
      const nameEl = document.getElementById('profModalName');
      const adminEditBtn = document.getElementById('profModalAdminEditBtn');
      const leftCol = document.getElementById('profModalLeftCol');
      const rightCol = document.getElementById('profModalRightCol');

      if (!modal || !leftCol || !rightCol) return;

      // Header info
      const initials = (talent.name || 'Candidate').split(' ').map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase();
      if (avatarEl) avatarEl.textContent = initials;
      if (idEl) idEl.textContent = talent.id;
      if (nameEl) nameEl.textContent = talent.name;
      if (ratingStarsEl) ratingStarsEl.textContent = '★'.repeat(talent.overallRating || 4);

      if (stageBadgeEl) {
        stageBadgeEl.textContent = talent.stage || 'Prospect';
        stageBadgeEl.className = 'stage-badge stage-' + (talent.stage || 'prospect').toLowerCase();
      }

      if (adminEditBtn) {
        adminEditBtn.style.display = isSuperAdmin() ? 'inline-flex' : 'none';
      }

      // Left Column: Details & Skill Matrix & WhatsApp
      const phoneClean = formatToInternationalPhone(talent.phone);
      const emailClean = cleanEmail(talent.email);
      const skills = talent.skills && talent.skills.length > 0 ? talent.skills : [
        { name: 'Foto', rating: 4 },
        { name: 'Video', rating: 4 },
        { name: 'Editing', rating: 4 },
        { name: 'Sense', rating: 4 }
      ];

      const skillsHtml = skills.map(s => {
        const pct = Math.round((Number(s.rating || 0) / 5) * 100);
        return \`
          <div class="profile-skill-row">
            <div class="profile-skill-header">
              <span>\${escapeHtml(s.name)}</span>
              <span style="font-family: var(--font-mono); font-weight: 600; color: #059669;">\${s.rating} ★ (\${pct}%)</span>
            </div>
            <div class="profile-skill-track">
              <div class="profile-skill-fill" style="width: \${pct}%;"></div>
            </div>
          </div>\`;
      }).join('');

      leftCol.innerHTML = \`
        <div>
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px;">
            Candidate Overview
          </div>
          <div class="profile-meta-item">
            <span>💼 <strong>Role:</strong></span>
            <span>\${escapeHtml(talent.role || 'Freelance Content Creator')}</span>
          </div>
          <div class="profile-meta-item">
            <span>📈 <strong>Level:</strong></span>
            <span>\${escapeHtml(talent.experienceLevel || 'Junior')}</span>
          </div>
          <div class="profile-meta-item">
            <span>📍 <strong>Domisili:</strong></span>
            <span>\${escapeHtml(talent.domisili || '-')}</span>
          </div>
          <div class="profile-meta-item">
            <span>🎓 <strong>Pendidikan:</strong></span>
            <span>\${escapeHtml(talent.education || '-')}</span>
          </div>
          <div class="profile-meta-item">
            <span>💰 <strong>Gaji/Uang Saku:</strong></span>
            <span>\${escapeHtml(talent.expectedSalary || 'Standard Uang Saku')}</span>
          </div>
          <div class="profile-meta-item">
            <span>📱 <strong>WhatsApp:</strong></span>
            \${phoneClean ? \`<a href="https://wa.me/\${phoneClean.replace(/\\+/g, '')}" target="_blank" style="color: #16A34A; font-weight: 600; font-family: var(--font-mono);">\${phoneClean} ↗</a>\` : '<span style="color: #9CA3AF;">-</span>'}
          </div>
          <div class="profile-meta-item">
            <span>✉️ <strong>Email:</strong></span>
            \${emailClean ? \`<a href="mailto:\${emailClean}" style="color: #2563EB; font-family: var(--font-mono); font-size: 11px;">\${emailClean}</a>\` : '<span style="color: #9CA3AF;">-</span>'}
          </div>
        </div>

        <div>
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px;">
            Skill Benchmarking Matrix
          </div>
          <div style="background: #F9FAFB; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            \${skillsHtml}
          </div>
        </div>

        \${talent.notes ? \`
          <div>
            <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">
              Notes &amp; Background
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); background: #F9FAFB; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); white-space: pre-wrap; line-height: 1.5; max-height: 110px; overflow-y: auto;">
              \${escapeHtml(talent.notes)}
            </div>
          </div>
        \` : ''}

        \${phoneClean ? \`
          <a href="https://wa.me/\${phoneClean.replace(/\\+/g, '')}?text=\${encodeURIComponent(\`Halo Kak \${talent.name}, kami dari Tim HR PGE Talent Pool ingin mendiskusikan peluang kerja sama terkait posisi \${talent.role || 'Freelance Content Creator'}.\`)}" target="_blank" class="btn btn-wa" style="width: 100%; justify-content: center; padding: 9px 14px; font-size: 12px; font-weight: 600; margin-top: 4px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Contact via WhatsApp ↗
          </a>
        \` : ''}
      \`;

      // Right Column: CV & Portfolio Media Showcase
      let cvBlockHtml = '';
      const safeCvUrl = normalizeUrl(talent.cvUrl);
      if (isValidDisplayUrl(safeCvUrl)) {
        cvBlockHtml = \`
          <div class="media-showcase-card" style="border-left: 4px solid #2563EB;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">📄</span>
                <div>
                  <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Curriculum Vitae (CV)</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Official Resume Document</div>
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <a href="\${safeCvUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="font-size: 11px; padding: 5px 12px;">
                  Open CV Fullscreen ↗
                </a>
              </div>
            </div>
          </div>
        \`;
      } else {
        cvBlockHtml = \`
          <div style="background: #F9FAFB; border: 1px dashed var(--border-light); border-radius: var(--radius-sm); padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
            📄 Belum ada Curriculum Vitae (CV) yang dilampirkan.
          </div>
        \`;
      }

      const validPortoList = (talent.portfolioItems || []).filter(p => isValidDisplayUrl(p.url));
      if (validPortoList.length === 0 && isValidDisplayUrl(talent.portfolioUrl)) {
        validPortoList.push({ name: 'Primary Portfolio Link', url: normalizeUrl(talent.portfolioUrl), type: 'document' });
      }

      let portoBlockHtml = '';
      if (validPortoList.length > 0) {
        portoBlockHtml = validPortoList.map((item, idx) => {
          const itemUrl = normalizeUrl(item.url || '');
          const isVideo = itemUrl.includes('.mp4') || (item.type === 'video');
          const isCanva = itemUrl.includes('canva.site') || itemUrl.includes('canva.com');
          const isDrive = itemUrl.includes('drive.google.com');
          const isTiktok = itemUrl.includes('tiktok.com') || itemUrl.includes('vt.tiktok');
          const isYoutube = itemUrl.includes('youtube.com') || itemUrl.includes('youtu.be');

          if (isVideo) {
            return \`
              <div class="media-showcase-card" style="border-left: 4px solid #7C3AED;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">🎬</span>
                    <div>
                      <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">\${escapeHtml(item.name || \`Video Portfolio #\${idx + 1}\`)}</div>
                      <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">MP4 Video Stream</div>
                    </div>
                  </div>
                  <a href="\${itemUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="font-size: 10px; padding: 3px 8px;">
                    Download / Fullscreen ↗
                  </a>
                </div>
                <video controls style="width: 100%; border-radius: 6px; max-height: 240px; background: #000000; margin-top: 4px;">
                  <source src="\${itemUrl}">
                  Browser Anda tidak mendukung tag video.
                </video>
              </div>\`;
          }

          let badgeIcon = '📁';
          let badgeColor = '#2563EB';
          let platformName = 'Document / Portfolio';

          if (isCanva) {
            badgeIcon = '🎨';
            badgeColor = '#7C3AED';
            platformName = 'Canva Design Presentation';
          } else if (isDrive) {
            badgeIcon = '☁️';
            badgeColor = '#059669';
            platformName = 'Google Drive Storage Folder';
          } else if (isTiktok) {
            badgeIcon = '📱';
            badgeColor = '#111827';
            platformName = 'TikTok Video / Reel Content';
          } else if (isYoutube) {
            badgeIcon = '▶️';
            badgeColor = '#DC2626';
            platformName = 'YouTube Video';
          }

          return \`
            <div class="media-showcase-card" style="border-left: 4px solid \${badgeColor};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">\${badgeIcon}</span>
                  <div>
                    <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">\${escapeHtml(item.name || \`Portfolio Item #\${idx + 1}\`)}</div>
                    <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">\${platformName}</div>
                  </div>
                </div>
                <a href="\${itemUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="font-size: 11px; padding: 4px 10px; background: \${badgeColor}; border-color: \${badgeColor}; color: #FFFFFF;">
                  Buka Link Portofolio ↗
                </a>
              </div>
            </div>\`;
        }).join('');
      } else {
        portoBlockHtml = \`
          <div style="background: #F9FAFB; border: 1px dashed var(--border-light); border-radius: var(--radius-sm); padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
            🎨 Belum ada item portofolio yang dilampirkan.
          </div>
        \`;
      }

      rightCol.innerHTML = \`
        <div>
          <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; margin-bottom: 8px;">
            1. Curriculum Vitae Document
          </div>
          \${cvBlockHtml}
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600;">
              2. Creative Portfolio Works &amp; Media (\${validPortoList.length})
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            \${portoBlockHtml}
          </div>
        </div>

        <div style="margin-top: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #2563EB; font-weight: 600;">
              3. Catatan &amp; Evaluasi Tim HR (<span id="profModalCommentsCount">\${(state.candidateComments[talent.id] || []).length}</span>)
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="openCandidateCommentsModal('\${talent.id}')" style="font-size: 10px; padding: 2px 8px;">
              💬 Buka Diskusi Lengkap ↗
            </button>
          </div>
          <div id="profModalCommentsContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; background: #F8FAFC; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 10px; margin-bottom: 8px;"></div>
          <div style="display: flex; gap: 6px;">
            <input type="text" id="profModalCommentInput" class="form-input" placeholder="Tulis catatan evaluasi tim untuk \${escapeHtml(talent.name)}... (Tekan Enter)" style="font-size: 11px; padding: 6px 10px;" onkeydown="if(event.key==='Enter') handleAddCommentFromProfileModal('\${talent.id}')">
            <button type="button" class="btn btn-primary btn-sm" onclick="handleAddCommentFromProfileModal('\${talent.id}')" style="font-size: 11px; padding: 4px 12px;">
              Kirim
            </button>
          </div>
        </div>
      \`;

      modal.classList.add('open');
      renderProfileCommentsSection(talent.id);
    }

    function closeCandidateProfileModal() {
      const modal = document.getElementById('candidateProfileModalBackdrop');
      if (modal) {
        modal.classList.remove('open');
        modal.querySelectorAll('video').forEach(v => v.pause());
      }
      currentProfileTalentId = null;
    }

    function switchToEditDrawer() {
      const targetId = currentProfileTalentId;
      closeCandidateProfileModal();
      if (targetId) {
        openTalentDetail(targetId);
      }
    }

    /* ---------------------------------------------------- */
    /* DRAWER LOGIC (SUPER ADMIN ONLY)                      */
    /* ---------------------------------------------------- */
    function openDrawer() {
      document.body.classList.add('drawer-open');
      if (el.talentDrawer) el.talentDrawer.classList.add('open');
      if (el.drawerBackdrop) el.drawerBackdrop.classList.add('active');
    }

    function closeDrawer() {
      document.body.classList.remove('drawer-open');
      if (el.talentDrawer) el.talentDrawer.classList.remove('open');
      if (el.drawerBackdrop) el.drawerBackdrop.classList.remove('active');
      state.selectedTalent = null;
      state.stagedPortfolioItems = [];
    }

    function openTalentDetail(id) {
      if (!isSuperAdmin()) {
        openCandidateProfileModal(id);
        return;
      }
      const talent = state.talents.find(t => t.id === id || t.$id === id);
      if (!talent) return;
      state.selectedTalent = talent;
      state.stagedPortfolioItems = talent.portfolioItems ? [...talent.portfolioItems] : (isValidDisplayUrl(talent.portfolioUrl) ? [{ name: 'Portfolio Link', url: talent.portfolioUrl, type: 'document' }] : []);

      if (el.drawerId) el.drawerId.textContent = talent.id;
      if (el.drawerTitle) el.drawerTitle.textContent = talent.name;
      if (el.btnDeleteDrawer) el.btnDeleteDrawer.style.display = isSuperAdmin() ? 'inline-flex' : 'none';

      renderDrawerForm(talent);
      openDrawer();
    }

    function openAddCandidateDrawer() {
      if (!isSuperAdmin()) {
        showToast('⚠️ Only Super Admin (hrdcvpge@gmail.com) is authorized to add new candidates.');
        return;
      }

      state.selectedTalent = null;
      state.stagedPortfolioItems = [];
      const nextId = 'PGE-' + String(state.talents.length + 1).padStart(3, '0');

      const defaultRole = (state.activeVacancy && state.activeVacancy !== 'HUB' && state.activeVacancy !== 'ALL')
        ? state.activeVacancy
        : 'Freelance Content Creator';

      if (el.drawerId) el.drawerId.textContent = nextId + ' (New)';
      if (el.drawerTitle) el.drawerTitle.textContent = 'Add New Candidate';
      if (el.btnDeleteDrawer) el.btnDeleteDrawer.style.display = 'none';

      renderDrawerForm({
        id: nextId,
        name: '',
        role: defaultRole,
        phone: '',
        email: '',
        experienceLevel: 'Junior',
        overallRating: 4,
        stage: 'Prospect',
        expectedSalary: 'Standard Uang Saku',
        domisili: '',
        education: '',
        notes: '',
        cvUrl: '',
        portfolioUrl: '',
        skills: [
          { name: 'Foto Produk', rating: 4 },
          { name: 'Video Produk', rating: 4 },
          { name: 'Video Editing', rating: 4 },
          { name: 'Content Sense', rating: 4 }
        ]
      });
      openDrawer();
    }

    function renderDrawerForm(data) {
      if (!el.drawerBody) return;
      const uniqueRoles = Array.from(new Set(state.talents.map(t => (t.role || '').trim()).filter(Boolean)));
      const datalistOptions = uniqueRoles.map(r => \`<option value="\${escapeHtml(r)}"></option>\`).join('');

      el.drawerBody.innerHTML = \`
        <form id="talentForm" onsubmit="event.preventDefault(); handleSaveCandidate();">
          <div class="form-group">
            <label class="form-label">
              <span>Full Name *</span>
              <span style="font-size: 10px; color: #2563EB; font-weight: normal;">Auto Title Case</span>
            </label>
            <input type="text" id="inputName" class="form-input" value="\${escapeHtml(data.name || '')}" placeholder="e.g. Budi Santoso" required onblur="handleNameBlur(this)" oninput="checkDuplicateLive()">
            <div id="duplicateWarningName" class="duplicate-warning-box"></div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                <span>Role / Job Vacancy *</span>
                <span style="font-size: 10px; color: #2563EB; font-weight: normal;">Datalist / Custom</span>
              </label>
              <input type="text" id="inputRole" list="registeredRolesList" class="form-input" value="\${escapeHtml(data.role || 'Freelance Content Creator')}" placeholder="Pilih atau ketik nama lowongan..." onblur="this.value = toTitleCase(this.value)">
              <datalist id="registeredRolesList">
                \${datalistOptions}
              </datalist>
            </div>
            <div class="form-group">
              <label class="form-label">Experience Level</label>
              <select id="inputLevel" class="form-select">
                <option value="Junior" \${data.experienceLevel === 'Junior' ? 'selected' : ''}>Junior</option>
                <option value="Mid" \${data.experienceLevel === 'Mid' ? 'selected' : ''}>Mid-Level</option>
                <option value="Senior" \${data.experienceLevel === 'Senior' ? 'selected' : ''}>Senior</option>
                <option value="Lead" \${data.experienceLevel === 'Lead' ? 'selected' : ''}>Lead / Specialist</option>
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                <span>Domisili / Location</span>
                <span style="font-size: 10px; color: #2563EB; font-weight: normal;">Auto Title Case</span>
              </label>
              <input type="text" id="inputDomisili" class="form-input" value="\${escapeHtml(data.domisili || '')}" placeholder="e.g. Surakarta" onblur="this.value = toTitleCase(this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">
                <span>Education / Background</span>
                <span style="font-size: 10px; color: #2563EB; font-weight: normal;">Auto Format</span>
              </label>
              <input type="text" id="inputEducation" class="form-input" value="\${escapeHtml(data.education || '')}" placeholder="e.g. S1 DKV / SMA" onblur="this.value = cleanEducation(this.value)">
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                <span>WhatsApp Number</span>
                <span style="font-size: 10px; color: #16A34A; font-weight: normal;">Auto +62 Format</span>
              </label>
              <input type="text" id="inputPhone" class="form-input" value="\${escapeHtml(data.phone || '')}" placeholder="08123456789" onblur="handlePhoneBlur(this)" oninput="checkDuplicateLive()">
              <div id="duplicateWarningPhone" class="duplicate-warning-box"></div>
            </div>
            <div class="form-group">
              <label class="form-label">
                <span>Email Address</span>
                <span style="font-size: 10px; color: var(--text-muted); font-weight: normal;">Auto Lowercase</span>
              </label>
              <input type="email" id="inputEmail" class="form-input" value="\${escapeHtml(data.email || '')}" placeholder="candidate@example.com" onblur="this.value = cleanEmail(this.value)">
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Overall Rating (1-5)</label>
              <select id="inputOverallRating" class="form-select">
                <option value="5" \${data.overallRating === 5 ? 'selected' : ''}>5 - Exceptional ★★★★★</option>
                <option value="4" \${data.overallRating === 4 ? 'selected' : ''}>4 - Proficient ★★★★☆</option>
                <option value="3" \${data.overallRating === 3 ? 'selected' : ''}>3 - Standard ★★★☆☆</option>
                <option value="2" \${data.overallRating === 2 ? 'selected' : ''}>2 - Developing ★★☆☆☆</option>
                <option value="1" \${data.overallRating === 1 ? 'selected' : ''}>1 - Novice ★☆☆☆☆</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Pipeline Stage</label>
              <select id="inputStage" class="form-select">
                \${STAGES.map(st => \`<option value="\${st}" \${data.stage === st ? 'selected' : ''}>\${st}</option>\`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Expected Salary / Rate</label>
            <input type="text" id="inputSalary" class="form-input" value="\${escapeHtml(data.expectedSalary || 'Standard Uang Saku')}" placeholder="e.g. Standard Uang Saku, Rp 3.500.000 / project">
          </div>

          <!-- Quick Tagging Bar -->
          <div class="form-group">
            <label class="form-label">Quick Recruitment Tags (1-Click Add):</label>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <span class="quick-tag-btn" onclick="addQuickTag('Siap Kerja')">+ Siap Kerja</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Remote Ready')">+ Remote Ready</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Full-Time Ready')">+ Full-Time Ready</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Video Specialist')">+ Video Specialist</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Fast Response')">+ Fast Response</span>
              <span class="quick-tag-btn" onclick="addQuickTag('Top Talent PGE')">+ Top Talent</span>
            </div>
          </div>

          <!-- Dynamic Skill Builder -->
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" style="margin-bottom: 0;">Skill Ratings</label>
              <button type="button" class="btn btn-secondary btn-sm" onclick="addSkillRow()" style="padding: 2px 8px; font-size: 11px;">+ Add Skill</button>
            </div>
            <div id="skillsBuilderContainer">
              \${(data.skills || []).map(s => \`
                <div class="skills-builder-row">
                  <input type="text" class="form-input skill-name-input" value="\${escapeHtml(s.name)}" placeholder="Skill name" style="flex: 1;" onblur="this.value = toTitleCase(this.value)">
                  <select class="form-select skill-rating-select" style="width: 90px;">
                    <option value="5" \${s.rating === 5 ? 'selected' : ''}>5 ★</option>
                    <option value="4" \${s.rating === 4 ? 'selected' : ''}>4 ★</option>
                    <option value="3" \${s.rating === 3 ? 'selected' : ''}>3 ★</option>
                    <option value="2" \${s.rating === 2 ? 'selected' : ''}>2 ★</option>
                    <option value="1" \${s.rating === 1 ? 'selected' : ''}>1 ★</option>
                  </select>
                  <button type="button" class="btn btn-secondary btn-icon" onclick="this.closest('.skills-builder-row').remove()" style="color: var(--pastel-red-text);">✕</button>
                </div>\`).join('')}
            </div>
          </div>

          <!-- ============================================== -->
          <!-- 1. SEPARATED CV / RESUME UPLOAD SECTION (APPWRITE) -->
          <!-- ============================================== -->
          <div class="upload-section-box">
            <div class="upload-section-title">
              <span>📄 1. Curriculum Vitae (CV / Resume)</span>
              <span style="font-size: 10px; color: #2563EB; font-weight: 500;">Appwrite Native Cloud Stream</span>
            </div>

            <div class="dropzone-box" id="cvDropzone"
                 onclick="document.getElementById('inputCvFileInput').click()"
                 ondragover="handleCvDragOver(event)"
                 ondragenter="handleCvDragEnter(event)"
                 ondragleave="handleCvDragLeave(event)"
                 ondrop="handleCvDrop(event)">
              <input type="file" id="inputCvFileInput" accept=".pdf,.doc,.docx,image/*" style="display: none;" onchange="handleCvFileSelect(event)">
              <div class="dropzone-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">
                Drop CV file here, or <span style="color: #2563EB; text-decoration: underline;">browse</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                PDF, Word doc, or scanned document (Auto-compressed if &gt;25MB)
              </div>
            </div>

            <!-- Persistent Attached CV Container -->
            <div id="cvAttachedContainer"></div>

            <!-- CV Upload Progress -->
            <div class="upload-queue-container" id="cvUploadQueue"></div>

            <!-- CV Link URL Input -->
            <div style="margin-top: 10px;">
              <label class="form-label" style="font-size: 10px; color: var(--text-muted); margin-bottom: 3px;">Or Paste CV Cloud Link:</label>
              <input type="text" id="inputCvUrl" class="form-input" value="\${escapeHtml(data.cvUrl || '')}" placeholder="https://..." oninput="handleManualCvUrlChange(this.value)">
            </div>
          </div>

          <!-- ============================================== -->
          <!-- 2. SEPARATED PORTFOLIO UPLOAD SECTION (APPWRITE) -->
          <!-- ============================================== -->
          <div class="upload-section-box">
            <div class="upload-section-title">
              <span>🎬 2. Portfolio &amp; Creative Media</span>
              <span style="font-size: 10px; color: #7C3AED; font-weight: 500;">Appwrite High-Speed Stream (Auto-Compress Supported)</span>
            </div>

            <div class="dropzone-box" id="portoDropzone"
                 onclick="document.getElementById('inputPortoFileInput').click()"
                 ondragover="handlePortoDragOver(event)"
                 ondragenter="handlePortoDragEnter(event)"
                 ondragleave="handlePortoDragLeave(event)"
                 ondrop="handlePortoDrop(event)">
              <input type="file" id="inputPortoFileInput" multiple accept="video/*,image/*,.pdf,.zip" style="display: none;" onchange="handlePortoFileSelect(event)">
              <div class="dropzone-icon" style="color: #7C3AED; background: #FAF5FF;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <div style="font-weight: 600; font-size: 12px; color: var(--text-primary);">
                Drop Portfolio files here, or <span style="color: #7C3AED; text-decoration: underline;">browse multiple</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                MP4 Videos, Reels, Large Portfolios, PDFs (Auto-compressed if &gt;25MB)
              </div>
            </div>

            <!-- Portfolio Upload Progress -->
            <div class="upload-queue-container" id="portoUploadQueue"></div>

            <!-- Attached Portfolio Media Chips List (Persistent) -->
            <div style="margin-top: 10px;">
              <label class="form-label" style="font-size: 10px; color: var(--text-muted); margin-bottom: 3px;">Attached Portfolio Items:</label>
              <div class="portfolio-chips" id="portfolioFilesContainer"></div>
              <div style="display: flex; gap: 6px; margin-top: 6px;">
                <input type="text" id="inputManualPortoUrl" class="form-input" placeholder="Or paste Canva, Drive folder, TikTok, YouTube link...">
                <button type="button" class="btn btn-secondary btn-sm" onclick="addManualPortoLink()">Add Link</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Notes &amp; Remarks</label>
            <textarea id="inputNotes" class="form-textarea" rows="3" placeholder="Add interview remarks, background notes, source... ">\${escapeHtml(data.notes || '')}</textarea>
          </div>
        </form>\`;

      if (isValidDisplayUrl(data.cvUrl)) {
        renderAttachedCvCard(data.cvUrl);
      }
      renderPortfolioChips();
      renderDrawerUploadQueues();
    }

    function handleNameBlur(input) {
      if (input && input.value) {
        input.value = toTitleCase(input.value);
      }
    }

    function handlePhoneBlur(input) {
      if (input && input.value) {
        input.value = formatToInternationalPhone(input.value);
      }
    }

    /* Smart Duplicate Checker */
    function checkDuplicateLive() {
      const nameInput = document.getElementById('inputName');
      const phoneInput = document.getElementById('inputPhone');
      const warnName = document.getElementById('duplicateWarningName');
      const warnPhone = document.getElementById('duplicateWarningPhone');

      const curName = (nameInput ? nameInput.value.trim().toLowerCase() : '');
      const curPhone = (phoneInput ? formatToInternationalPhone(phoneInput.value.trim()) : '');
      const curId = state.selectedTalent ? state.selectedTalent.id : null;

      if (curPhone && curPhone.length > 7 && warnPhone) {
        const matchPh = state.talents.find(t => t.id !== curId && t.phone && formatToInternationalPhone(t.phone) === curPhone);
        if (matchPh) {
          warnPhone.style.display = 'flex';
          warnPhone.innerHTML = \`⚠️ Duplicate Phone! Already belongs to <strong>[\${matchPh.id}] \${escapeHtml(matchPh.name)}</strong>\`;
        } else {
          warnPhone.style.display = 'none';
        }
      } else if (warnPhone) {
        warnPhone.style.display = 'none';
      }

      if (curName && curName.length > 3 && warnName) {
        const matchNm = state.talents.find(t => t.id !== curId && t.name && t.name.toLowerCase() === curName);
        if (matchNm) {
          warnName.style.display = 'flex';
          warnName.innerHTML = \`⚠️ Duplicate Name! Candidate <strong>[\${matchNm.id}] \${escapeHtml(matchNm.name)}</strong> already exists.\`;
        } else {
          warnName.style.display = 'none';
        }
      } else if (warnName) {
        warnName.style.display = 'none';
      }
    }

    function addQuickTag(tagName) {
      const container = document.getElementById('skillsBuilderContainer');
      if (!container) return;
      const existing = Array.from(container.querySelectorAll('.skill-name-input')).find(i => i.value.toLowerCase() === tagName.toLowerCase());
      if (existing) {
        showToast(\`Tag "\${tagName}" already added!\`);
        return;
      }
      const row = document.createElement('div');
      row.className = 'skills-builder-row';
      row.innerHTML = \`
        <input type="text" class="form-input skill-name-input" value="\${escapeHtml(tagName)}" style="flex: 1;">
        <select class="form-select skill-rating-select" style="width: 90px;">
          <option value="5" selected>5 ★</option>
          <option value="4">4 ★</option>
          <option value="3">3 ★</option>
        </select>
        <button type="button" class="btn btn-secondary btn-icon" onclick="this.closest('.skills-builder-row').remove()" style="color: var(--pastel-red-text);">✕</button>\`;
      container.appendChild(row);
      showToast(\`Added tag "\${tagName}"!\`);
    }

    /* ---------------------------------------------------- */
    /* CANDIDATE COMPARISON MATRIX                          */
    /* ---------------------------------------------------- */
    function toggleCompareCandidate(id) {
      if (state.comparedTalentIds.has(id)) {
        state.comparedTalentIds.delete(id);
      } else {
        if (state.comparedTalentIds.size >= 3) {
          showToast('You can compare a maximum of 3 candidates at once');
          return;
        }
        state.comparedTalentIds.add(id);
      }
      updateCompareBar();
      renderActiveView();
    }

    function updateCompareBar() {
      const count = state.comparedTalentIds.size;
      if (el.compareCount) el.compareCount.textContent = count;
      if (el.compareBar) {
        el.compareBar.classList.toggle('active', count > 0);
      }
    }

    function clearComparison() {
      state.comparedTalentIds.clear();
      updateCompareBar();
      renderActiveView();
    }

    function openComparisonModal() {
      const ids = Array.from(state.comparedTalentIds);
      if (!ids.length) return;
      const talents = ids.map(id => state.talents.find(t => t.id === id || t.$id === id)).filter(Boolean);

      const body = el.compareModalBody;
      if (!body) return;

      body.innerHTML = \`
        <div style="overflow-x: auto;">
          <table class="data-table" style="border: 1px solid var(--border-light); width: 100%;">
            <thead>
              <tr>
                <th style="width: 140px; background: #F9FAFB;">Feature</th>
                \${talents.map(t => \`<th style="text-align: center; background: #FFFFFF; border-left: 1px solid var(--border-light); width: \${100 / talents.length}%;">
                  <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">\${t.id}</div>
                  <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">\${escapeHtml(t.name)}</div>
                  <div style="font-size: 11px; color: var(--text-secondary); font-weight: normal;">\${escapeHtml(t.role || 'Freelance')}</div>
                </th>\`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Overall Rating</td>
                \${talents.map(t => \`<td style="text-align: center; border-left: 1px solid var(--border-light);"><span class="rating-badge">★ \${(t.overallRating || 4).toFixed(1)}</span></td>\`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Pipeline Stage</td>
                \${talents.map(t => \`<td style="text-align: center; border-left: 1px solid var(--border-light);"><span class="stage-select-pill stage-\${(t.stage || 'prospect').toLowerCase()}">\${t.stage || 'Prospect'}</span></td>\`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Experience Level</td>
                \${talents.map(t => \`<td style="text-align: center; border-left: 1px solid var(--border-light);">\${t.experienceLevel || 'Junior'}</td>\`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Domisili / Location</td>
                \${talents.map(t => \`<td style="text-align: center; border-left: 1px solid var(--border-light);">\${escapeHtml(t.domisili || '-')}</td>\`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Education</td>
                \${talents.map(t => \`<td style="text-align: center; border-left: 1px solid var(--border-light); font-size: 12px;">\${escapeHtml(t.education || '-')}</td>\`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Expected Rate</td>
                \${talents.map(t => \`<td style="text-align: center; border-left: 1px solid var(--border-light); font-family: var(--font-mono); font-size: 11px;">\${escapeHtml(t.expectedSalary || 'Standard')}</td>\`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Skill Breakdown</td>
                \${talents.map(t => \`
                  <td style="border-left: 1px solid var(--border-light); vertical-align: top; padding: 10px;">
                    \${(t.skills || []).map(s => \`<div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; padding: 2px 4px; background: #F3F4F6; border-radius: 4px;">
                      <span>\${escapeHtml(s.name)}</span>
                      <span style="font-weight: 600; color: #D97706;">★ \${s.rating}</span>
                    </div>\`).join('')}
                  </td>\`).join('')}
              </tr>
              <tr>
                <td style="font-weight: 600; background: #F9FAFB;">Quick Actions</td>
                \${talents.map(t => \`
                  <td style="text-align: center; border-left: 1px solid var(--border-light); padding: 12px;">
                    <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                      \${isValidDisplayUrl(t.cvUrl) ? \`<a href="\${t.cvUrl}" target="_blank" class="btn btn-secondary btn-sm" style="font-size: 11px;">CV ↗</a>\` : ''}
                      \${t.phone ? \`<a href="https://wa.me/\${formatToInternationalPhone(t.phone).replace(/\\+/g, '')}" target="_blank" class="btn btn-wa btn-sm" style="font-size: 11px;">💬 WA</a>\` : ''}
                    </div>
                  </td>\`).join('')}
              </tr>
            </tbody>
          </table>
        </div>\`;

      if (el.compareModalBackdrop) el.compareModalBackdrop.classList.add('open');
    }

    function closeComparisonModal() {
      if (el.compareModalBackdrop) el.compareModalBackdrop.classList.remove('open');
    }

    /* ---------------------------------------------------- */
    /* MULTI-PORTFOLIO GALLERY MODAL                        */
    /* ---------------------------------------------------- */
    function openPortoGalleryModal(id) {
      const talent = state.talents.find(t => t.id === id || t.$id === id);
      if (!talent) return;

      const titleEl = document.getElementById('portoGalleryCandidateName');
      if (titleEl) titleEl.textContent = \`\${talent.name} (\${talent.id})\`;

      const bodyEl = document.getElementById('portoGalleryModalBody');
      if (!bodyEl) return;

      const items = talent.portfolioItems && talent.portfolioItems.length ? talent.portfolioItems : (isValidDisplayUrl(talent.portfolioUrl) ? [{ name: 'Portfolio Link', url: normalizeUrl(talent.portfolioUrl), type: 'document' }] : []);

      if (!items.length) {
        bodyEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No portfolio attachments found.</div>';
      } else {
        bodyEl.innerHTML = \`
          <div style="display: flex; flex-direction: column; gap: 12px;">
            \${items.map((item, idx) => {
              const safeUrl = normalizeUrl(item.url);
              const isVid = item.type === 'video' || (safeUrl && safeUrl.toLowerCase().includes('.mp4'));
              const isImg = item.type === 'image';
              const icon = isVid ? '🎬' : (isImg ? '🖼️' : '📄');

              return \`
                <div style="background: #F9FAFB; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 14px; display: flex; flex-direction: column; gap: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; color: var(--text-primary); max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <span>\${icon}</span>
                      <span>\${escapeHtml(item.name || \`Portfolio Item #\${idx + 1}\`)}</span>
                    </div>
                    <a href="\${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="font-size: 11px;">
                      Open / Download ↗
                    </a>
                  </div>
                  \${isVid && !safeUrl.includes('drive.google') && !safeUrl.includes('canva') && !safeUrl.includes('tiktok') ? \`
                    <div style="margin-top: 6px; border-radius: 6px; overflow: hidden; background: #000;">
                      <video src="\${safeUrl}" controls style="width: 100%; max-height: 280px; display: block;"></video>
                    </div>
                  \` : ''}
                </div>\`;
            }).join('')}
          </div>\`;
      }

      const modal = document.getElementById('portoGalleryModalBackdrop');
      if (modal) modal.classList.add('open');
    }

    function closePortoGalleryModal() {
      const modal = document.getElementById('portoGalleryModalBackdrop');
      if (modal) modal.classList.remove('open');
    }

    /* ---------------------------------------------------- */
    /* TEAM WHITELIST MANAGER MODAL                         */
    /* ---------------------------------------------------- */
    function openWhitelistModal() {
      renderWhitelistItems();
      const modal = document.getElementById('whitelistModalBackdrop');
      if (modal) modal.classList.add('open');
    }

    function closeWhitelistModal() {
      const modal = document.getElementById('whitelistModalBackdrop');
      if (modal) modal.classList.remove('open');
    }

    function formatTimeAgo(timestamp) {
      if (!timestamp) return 'Never';
      const diffSec = Math.floor((Date.now() - timestamp) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return \`\${diffMin}m ago\`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return \`\${diffHr}h ago\`;
      const diffDay = Math.floor(diffHr / 24);
      return \`\${diffDay}d ago\`;
    }

    function renderWhitelistItems() {
      const container = document.getElementById('whitelistItemsContainer');
      if (!container) return;

      const customList = getCustomWhitelist();
      let html = '';

      // Super Admins with Live Presence
      SUPER_ADMIN_EMAILS.forEach(email => {
        const safeKey = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const pres = state.presenceData ? state.presenceData[safeKey] : null;
        const isOnline = pres && pres.status === 'online';

        html += \`
          <div style="display: flex; justify-content: space-between; align-items: center; background: #F3F4F6; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 14px;">👑</span>
              <div>
                <div style="font-weight: 600; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary);">\${escapeHtml(email)}</div>
                <div style="margin-top: 2px;">
                  \${isOnline ? \`
                    <span style="color: #16A34A; font-weight: 600; font-size: 10px; font-family: var(--font-mono); display: inline-flex; align-items: center; gap: 4px;">
                      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #16A34A; box-shadow: 0 0 5px #16A34A;"></span> Online Now
                    </span>
                  \` : (pres && pres.lastActive ? \`
                    <span style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono);">Last active: \${formatTimeAgo(pres.lastActive)}</span>
                  \` : '<span style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono); font-style: italic;">Offline</span>')}
                </div>
              </div>
            </div>
            <span class="brand-badge" style="background: #FEF3C7; color: #92400E; border-color: #FDE68A;">Super Admin</span>
          </div>\`;
      });

      // Domain Wildcards
      html += \`
        <div style="display: flex; justify-content: space-between; align-items: center; background: #F0FDF4; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid #DCFCE7;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px;">🏢</span>
            <div>
              <div style="font-weight: 500; font-family: var(--font-mono); font-size: 12px; color: #166534;">*@pge.co.id &amp; *@pertamina.com</div>
              <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">Domain Auto-Authorize</div>
            </div>
          </div>
          <span class="brand-badge">Org Domain</span>
        </div>\`;

      // Custom Added Emails with Live Presence
      customList.forEach(email => {
        const safeKey = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const pres = state.presenceData ? state.presenceData[safeKey] : null;
        const isOnline = pres && pres.status === 'online';

        html += \`
          <div style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 14px;">👤</span>
              <div>
                <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); font-weight: 500;">\${escapeHtml(email)}</div>
                <div style="margin-top: 2px;">
                  \${isOnline ? \`
                    <span style="color: #16A34A; font-weight: 600; font-size: 10px; font-family: var(--font-mono); display: inline-flex; align-items: center; gap: 4px;">
                      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #16A34A; box-shadow: 0 0 5px #16A34A;"></span> Online Now
                    </span>
                  \` : (pres && pres.lastActive ? \`
                    <span style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono);">Last active: \${formatTimeAgo(pres.lastActive)}</span>
                  \` : '<span style="color: var(--text-muted); font-size: 10px; font-family: var(--font-mono); font-style: italic;">Offline</span>')}
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="handleRemoveWhitelistEmail('\${escapeHtml(email)}')" style="color: var(--pastel-red-text); padding: 2px 8px; font-size: 11px;">
              Remove ✕
            </button>
          </div>\`;
      });

      container.innerHTML = html;
    }

    function handleAddWhitelistEmail() {
      const input = document.getElementById('inputNewWhitelistEmail');
      if (!input) return;
      const email = input.value.toLowerCase().trim();
      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address');
        return;
      }

      if (SUPER_ADMIN_EMAILS.includes(email) || email.endsWith('@pge.co.id') || email.endsWith('@pertamina.com')) {
        showToast('This email is already authorized by default!');
        return;
      }

      const list = getCustomWhitelist();
      if (list.includes(email)) {
        showToast('This email is already in the whitelist!');
        return;
      }

      list.push(email);
      saveCustomWhitelist(list);
      input.value = '';
      renderWhitelistItems();
      showToast(\`Added \${email} to whitelist!\`);
    }

    function handleRemoveWhitelistEmail(email) {
      if (!confirm(\`Remove \${email} from whitelist?\`)) return;
      let list = getCustomWhitelist();
      list = list.filter(e => e.toLowerCase() !== email.toLowerCase());
      saveCustomWhitelist(list);
      renderWhitelistItems();
      showToast(\`Removed \${email} from whitelist.\`);
    }

    /* ---------------------------------------------------- */
    /* REALTIME TEAM MESSENGER                              */
    /* ---------------------------------------------------- */
    let messengerOpen = false;
    let messengerCurrentTab = 'chat';
    let unreadCount = 0;

    function toggleTeamMessenger() {
      messengerOpen = !messengerOpen;
      const panel = document.getElementById('messengerPanel');
      if (panel) {
        if (messengerOpen) {
          panel.classList.add('open');
          markChatAsRead();
          renderMessengerMembers();
          if (messengerCurrentTab === 'chat') {
            const input = document.getElementById('messengerInput');
            if (input) setTimeout(() => input.focus(), 100);
            scrollChatToBottom();
          }
        } else {
          panel.classList.remove('open');
        }
      }
    }

    function switchMessengerTab(tab) {
      messengerCurrentTab = tab;
      const tabBtnChat = document.getElementById('tabBtnChat');
      const tabBtnMembers = document.getElementById('tabBtnMembers');
      const chatBody = document.getElementById('messengerChatBody');
      const membersBody = document.getElementById('messengerMembersBody');
      const footer = document.getElementById('messengerFooter');

      if (tab === 'chat') {
        if (tabBtnChat) tabBtnChat.classList.add('active');
        if (tabBtnMembers) tabBtnMembers.classList.remove('active');
        if (chatBody) chatBody.style.display = 'flex';
        if (membersBody) membersBody.style.display = 'none';
        if (footer) footer.style.display = 'flex';
        markChatAsRead();
        scrollChatToBottom();
      } else {
        if (tabBtnChat) tabBtnChat.classList.remove('active');
        if (tabBtnMembers) tabBtnMembers.classList.add('active');
        if (chatBody) chatBody.style.display = 'none';
        if (membersBody) membersBody.style.display = 'flex';
        if (footer) footer.style.display = 'none';
        renderMessengerMembers();
      }
    }

    function renderMessengerMembers() {
      const container = document.getElementById('messengerMembersList');
      const onlineCountEl = document.getElementById('chatOnlineMemberCount');
      if (!container) return;

      const customList = getCustomWhitelist();
      const allEmails = [...new Set([...SUPER_ADMIN_EMAILS, ...customList])];

      let onlineCount = 0;
      let html = '';

      allEmails.forEach(email => {
        const safeKey = email.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const pres = state.presenceData ? state.presenceData[safeKey] : null;
        const isOnline = pres && pres.status === 'online';
        if (isOnline) onlineCount++;

        const isSuper = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
        const displayName = (pres && pres.name) ? pres.name : (isSuper ? 'Super Admin' : email.split('@')[0]);

        html += \`
          <div style="display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="position: relative;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px; color: var(--text-primary);">
                  \${displayName.charAt(0).toUpperCase()}
                </div>
                <div style="position: absolute; bottom: 0; right: 0; width: 7px; height: 7px; border-radius: 50%; background: \${isOnline ? '#10B981' : '#9CA3AF'}; border: 1px solid #FFFFFF;"></div>
              </div>
              <div>
                <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  \${escapeHtml(displayName)}
                </div>
                <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">
                  \${isOnline ? '<span style="color: #16A34A; font-weight: 600;">Online Now</span>' : (pres && pres.lastActive ? \`Last active: \${formatTimeAgo(pres.lastActive)}\` : 'Offline')}
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="mentionMemberInChat('\${escapeHtml(displayName)}')" style="font-size: 10px; padding: 2px 6px;">
              @Chat
            </button>
          </div>\`;
      });

      container.innerHTML = html;
      if (onlineCountEl) onlineCountEl.textContent = onlineCount;
    }

    function mentionMemberInChat(name) {
      switchMessengerTab('chat');
      const input = document.getElementById('messengerInput');
      if (input) {
        input.value = \`@\${name} \` + input.value;
        input.focus();
      }
    }

    /* Audio Context Autoplay Unlocker */
    let sharedAudioCtx = null;
    function unlockAudio() {
      try {
        if (!sharedAudioCtx) {
          const AudioClass = window.AudioContext || window.webkitAudioContext;
          if (AudioClass) sharedAudioCtx = new AudioClass();
        }
        if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
          sharedAudioCtx.resume();
        }
      } catch (e) {}
    }
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    window.addEventListener('touchstart', unlockAudio, { passive: true });

    /* ---------------------------------------------------- */
    /* MULTI-LAYER NOTIFICATIONS: WINDOWS DESKTOP & CHIME   */
    /* ---------------------------------------------------- */
    function requestWindowsDesktopNotification() {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              showToast('🔔 Notifikasi Desktop Windows Aktif!');
              try {
                new Notification('PGE Talent Pool', {
                  body: 'Notifikasi Desktop Windows aktif. Anda tidak akan melewatkan pesan chat dari tim HR!',
                  icon: '/favicon.svg'
                });
              } catch (e) {}
            }
          });
        } else if (Notification.permission === 'granted') {
          showToast('🔔 Notifikasi Desktop Windows sudah aktif.');
        } else if (Notification.permission === 'denied') {
          showToast('⚠️ Izin notifikasi diblokir di browser. Mohon izinkan via ikon gembok di address bar.');
        }
      }
    }

    function triggerWindowsDesktopNotification(senderName, messageText) {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          const notif = new Notification(\`💬 \${senderName || 'Tim HR PGE'}\`, {
            body: messageText || 'Ada pesan baru di HR Team Lounge.',
            icon: '/favicon.svg',
            tag: 'pge-team-chat',
            renotify: true
          });
          notif.onclick = () => {
            window.focus();
            if (!messengerOpen) toggleTeamMessenger();
          };
        }
      } catch (e) {
        console.warn('Desktop notification trigger error:', e);
      }
    }

    let titleFlashInterval = null;
    function startTitleFlash(unread) {
      if (titleFlashInterval) clearInterval(titleFlashInterval);
      let flag = false;
      titleFlashInterval = setInterval(() => {
        if (messengerOpen && messengerCurrentTab === 'chat') {
          stopTitleFlash();
          return;
        }
        document.title = flag ? \`🔴 (\${unread}) PESAN BARU! | PGE Talent Pool\` : \`💬 (\${unread}) Chat Masuk | PGE Talent Pool\`;
        flag = !flag;
      }, 900);
    }

    function stopTitleFlash() {
      if (titleFlashInterval) {
        clearInterval(titleFlashInterval);
        titleFlashInterval = null;
      }
      document.title = 'PGE Talent Pool | Candidate Repository';
    }

    /* Crisp Slack / Apple Modern Two-Tone Chime Synth (880Hz -> 1320Hz + Harmonic Shimmer) */
    function playChimeSound() {
      try {
        unlockAudio();
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        const ctx = sharedAudioCtx || (AudioClass ? new AudioClass() : null);
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        const t = ctx.currentTime;

        // Tone 1: 880 Hz (Crisp "Ding")
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, t);
        gain1.gain.setValueAtTime(0.38, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.32);

        // Tone 2: 1320 Hz (Harmonic "Dong")
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, t + 0.11);
        gain2.gain.setValueAtTime(0.0, t);
        gain2.gain.setValueAtTime(0.42, t + 0.11);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t + 0.11);
        osc2.stop(t + 0.58);

        // Tone 3: 2640 Hz (Resonant Metallic Bell Shimmer)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(2640, t + 0.11);
        gain3.gain.setValueAtTime(0.0, t);
        gain3.gain.setValueAtTime(0.12, t + 0.11);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(t + 0.11);
        osc3.stop(t + 0.45);
      } catch (e) {
        console.warn('Audio chime error:', e);
      }
    }

    let initialChatLoaded = false;
    let lastChatCount = 0;
    let lastSeenChatTimestamp = parseInt(localStorage.getItem('pge_chat_last_seen') || '0', 10);

    function markChatAsRead() {
      lastSeenChatTimestamp = Date.now();
      try {
        localStorage.setItem('pge_chat_last_seen', String(lastSeenChatTimestamp));
      } catch (e) {}
      unreadCount = 0;
      const badge = document.getElementById('messengerUnreadBadge');
      if (badge) badge.style.display = 'none';
      stopTitleFlash();
    }

    function scrollChatToBottom() {
      const body = document.getElementById('messengerChatBody');
      const anchor = document.getElementById('chatScrollAnchor');
      if (!body) return;

      const doScroll = () => {
        if (anchor) {
          anchor.scrollIntoView({ block: 'end', inline: 'nearest' });
        }
        body.scrollTop = body.scrollHeight + 10000;
      };

      doScroll();
      requestAnimationFrame(doScroll);
      setTimeout(doScroll, 40);
      setTimeout(doScroll, 150);
    }

    const clientSessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

    function listenTeamChat() {
      try {
        rtdb.ref('/team_chat/messages').limitToLast(50).on('value', (snapshot) => {
          const data = snapshot.val();
          const list = data ? Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) : [];
          const curEmail = state.currentUser ? (state.currentUser.email || '').toLowerCase() : '';

          if (initialChatLoaded && list.length > lastChatCount) {
            const latestMsg = list[list.length - 1];
            const isFromOther = (latestMsg.senderEmail || '').toLowerCase().trim() !== curEmail;

            if (isFromOther) {
              playChimeSound();
              triggerWindowsDesktopNotification(latestMsg.senderName, latestMsg.text);

              if (!messengerOpen || messengerCurrentTab !== 'chat') {
                unreadCount++;
                const badge = document.getElementById('messengerUnreadBadge');
                if (badge) {
                  badge.textContent = unreadCount;
                  badge.style.display = 'inline-block';
                }
                showToast(\`💬 \${latestMsg.senderName || 'Team Member'}: "\${latestMsg.text}"\`);
                startTitleFlash(unreadCount);
              }
            }
          } else if (!initialChatLoaded) {
            // Check unread count on initial load
            const unreadOnLoad = list.filter(m => (m.timestamp || 0) > lastSeenChatTimestamp && (m.senderEmail || '').toLowerCase().trim() !== curEmail).length;
            if (unreadOnLoad > 0 && (!messengerOpen || messengerCurrentTab !== 'chat')) {
              unreadCount = unreadOnLoad;
              const badge = document.getElementById('messengerUnreadBadge');
              if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
              }
              startTitleFlash(unreadCount);
            }
          }

          initialChatLoaded = true;
          lastChatCount = list.length;
          renderChatMessages(data);
        });
      } catch (e) {
        console.warn('Chat listener error:', e);
      }
    }

    function formatChatDateSeparator(timestamp) {
      if (!timestamp) return '';
      const msgDate = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (d1, d2) => 
        d1.getDate() === d2.getDate() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getFullYear() === d2.getFullYear();

      if (isSameDay(msgDate, today)) {
        return 'HARI INI';
      } else if (isSameDay(msgDate, yesterday)) {
        return 'KEMARIN';
      } else {
        return msgDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).toUpperCase();
      }
    }

    function renderChatMessages(data) {
      const body = document.getElementById('messengerChatBody');
      if (!body) return;
      if (!data) {
        body.innerHTML = '<div style="text-align: center; font-size: 11px; color: var(--text-muted); padding: 12px 0;">👋 Belum ada pesan. Mulai percakapan pertama Anda dengan tim HR!</div>';
        return;
      }

      const curEmail = state.currentUser ? (state.currentUser.email || '').toLowerCase().trim() : '';
      const list = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      let lastDateKey = null;
      let bubblesHtml = '';

      list.forEach(msg => {
        const isMe = (msg.senderEmail || '').toLowerCase().trim() === curEmail;
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
        const roleBadge = msg.isSuperAdmin ? '👑 Admin' : 'HR';

        const msgDateKey = msg.timestamp ? new Date(msg.timestamp).toDateString() : 'unknown';
        if (msg.timestamp && msgDateKey !== lastDateKey) {
          lastDateKey = msgDateKey;
          bubblesHtml += \`
            <div class="chat-date-separator">
              <span>\${formatChatDateSeparator(msg.timestamp)}</span>
            </div>\`;
        }

        bubblesHtml += \`
          <div class="chat-msg \${isMe ? 'me' : 'them'}">
            \${!isMe ? \`
              <div style="font-size: 10px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
                <span>\${escapeHtml(msg.senderName || msg.senderEmail)}</span>
                <span style="font-size: 9px; padding: 1px 4px; border-radius: 4px; background: #E5E7EB; color: #374151;">\${roleBadge}</span>
              </div>
            \` : ''}
            <div class="chat-bubble">
              \${escapeHtml(msg.text || '')}
            </div>
            <div class="chat-meta">
              \${timeStr}
            </div>
          </div>\`;
      });

      body.innerHTML = bubblesHtml + '<div id="chatScrollAnchor" style="height: 1px; width: 100%;"></div>';
      scrollChatToBottom();
    }

    async function handleSendTeamMessage() {
      const input = document.getElementById('messengerInput');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;
      if (!state.currentUser) return;

      const newMsg = {
        senderEmail: state.currentUser.email || 'anonymous',
        senderName: state.currentUser.displayName || state.currentUser.email || 'HR Member',
        senderPhoto: state.currentUser.photoURL || '',
        text: text,
        sessionId: clientSessionId,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        isSuperAdmin: isSuperAdmin()
      };

      try {
        input.value = '';
        await rtdb.ref('/team_chat/messages').push(newMsg);
      } catch (err) {
        console.error('Send message error:', err);
        showToast('Gagal mengirim pesan: ' + err.message);
      }
    }

    /* ---------------------------------------------------- */
    /* REALTIME CANDIDATE COMMENTS & TEAM EVALUATION THREAD */
    /* ---------------------------------------------------- */
    function listenCandidateComments() {
      try {
        rtdb.ref('/candidate_comments').on('value', (snapshot) => {
          const val = snapshot.val() || {};
          state.candidateComments = {};
          Object.keys(val).forEach(tId => {
            const commMap = val[tId] || {};
            const list = Object.values(commMap).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            state.candidateComments[tId] = list;
          });

          // Live update active UI components
          if (state.currentView === 'bento') {
            updateCardCommentBadges();
          }
          if (state.activeCommentsTalentId) {
            renderCandidateCommentsModal(state.activeCommentsTalentId);
          }
          if (currentProfileTalentId) {
            renderProfileCommentsSection(currentProfileTalentId);
          }
        });
      } catch (e) {
        console.warn('Candidate comments listener error:', e);
      }
    }

    function openCandidateCommentsModal(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      state.activeCommentsTalentId = talent.id;

      const sub = document.getElementById('candidateCommentsSubtitle');
      if (sub) {
        sub.textContent = \`[\${talent.id}] \${talent.name} — \${talent.role || 'Freelance Content Creator'}\`;
      }

      renderCandidateCommentsModal(talent.id);

      const modal = document.getElementById('candidateCommentsModalBackdrop');
      if (modal) modal.classList.add('open');

      const input = document.getElementById('inputCandidateCommentText');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 150);
      }
    }

    function closeCandidateCommentsModal() {
      const modal = document.getElementById('candidateCommentsModalBackdrop');
      if (modal) modal.classList.remove('open');
      state.activeCommentsTalentId = null;
    }

    function renderCandidateCommentsModal(talentId) {
      const container = document.getElementById('candidateCommentsList');
      if (!container) return;

      const comments = state.candidateComments[talentId] || [];
      const curEmail = state.currentUser ? (state.currentUser.email || '').toLowerCase() : '';

      if (comments.length === 0) {
        container.innerHTML = \`
          <div style="text-align: center; color: var(--text-muted); padding: 36px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <span style="font-size: 32px;">📝</span>
            <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Belum Ada Catatan Evaluasi Tim</div>
            <div style="font-size: 11px; max-width: 340px; line-height: 1.45;">
              Tulis catatan pertama untuk mengevaluasi skill, portofolio, kecocokan tim, atau kesepakatan interview kandidat ini.
            </div>
          </div>\`;
        return;
      }

      container.innerHTML = comments.map(c => {
        const isAuthor = (c.authorEmail || '').toLowerCase() === curEmail;
        const canDelete = isAuthor || isSuperAdmin();
        const initial = (c.authorName || 'HR').charAt(0).toUpperCase();

        return \`
          <div class="comment-thread-item" id="comment_\${c.id}">
            <div class="comment-thread-header">
              <div class="comment-thread-author">
                <div class="comment-author-avatar-sm">\${initial}</div>
                <div>
                  <span style="font-weight: 600;">\${escapeHtml(c.authorName || 'HR Team')}</span>
                  <span style="color: var(--text-muted); font-size: 10px; font-weight: normal; margin-left: 4px;">(\${escapeHtml(c.authorEmail || '')})</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="comment-thread-time">\${formatTimeAgo(c.createdAt)}</span>
                \${canDelete ? \`
                  <button type="button" class="btn btn-secondary btn-sm" onclick="handleDeleteCandidateComment('\${talentId}', '\${c.id}')" title="Hapus Catatan" style="color: var(--pastel-red-text); padding: 1px 6px; font-size: 10px;">
                    ✕ Hapus
                  </button>
                \` : ''}
              </div>
            </div>
            <div class="comment-thread-body">\${escapeHtml(c.text)}</div>
          </div>\`;
      }).join('');

      // Auto scroll to bottom
      const modalBody = container.parentElement;
      if (modalBody) {
        modalBody.scrollTop = modalBody.scrollHeight;
      }
    }

    async function handleAddCandidateCommentFromModal() {
      const input = document.getElementById('inputCandidateCommentText');
      if (!input || !state.activeCommentsTalentId) return;
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      await addCandidateComment(state.activeCommentsTalentId, text);
    }

    async function addCandidateComment(talentId, text) {
      if (!talentId || !text || !text.trim()) return;

      const user = auth.currentUser || state.currentUser;
      const authorName = user ? (user.displayName || user.email.split('@')[0]) : 'HR Team';
      const authorEmail = user ? user.email : 'hr@pge.co.id';
      const authorPhoto = user ? (user.photoURL || '') : '';

      const commentId = 'cm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const commentObj = {
        id: commentId,
        talentId: talentId,
        text: text.trim(),
        authorName: authorName,
        authorEmail: authorEmail,
        authorPhoto: authorPhoto,
        createdAt: Date.now()
      };

      try {
        await rtdb.ref(\`/candidate_comments/\${talentId}/\${commentId}\`).set(commentObj);
        showToast('✓ Catatan tim berhasil disimpan!');
      } catch (err) {
        console.error('Error saving candidate comment:', err);
        showToast('⚠️ Gagal menyimpan catatan: ' + err.message);
      }
    }

    async function handleDeleteCandidateComment(talentId, commentId) {
      if (!confirm('Hapus catatan evaluasi ini?')) return;
      try {
        await rtdb.ref(\`/candidate_comments/\${talentId}/\${commentId}\`).remove();
        showToast('Catatan dihapus.');
      } catch (err) {
        console.error('Error deleting comment:', err);
        showToast('⚠️ Gagal menghapus: ' + err.message);
      }
    }

    function updateCardCommentBadges() {
      document.querySelectorAll('.card-comments-preview').forEach(el => {
        const talentId = el.getAttribute('data-talent-id');
        if (!talentId) return;
        const comments = state.candidateComments[talentId] || [];
        const countPill = el.querySelector('.card-comments-count-pill');
        const snippetEl = el.querySelector('.card-comments-snippet');

        if (countPill) {
          countPill.textContent = comments.length > 0 ? comments.length : '+ Catatan';
        }
        if (snippetEl) {
          if (comments.length > 0) {
            const last = comments[comments.length - 1];
            const authorShort = (last.authorName || 'HR').split(' ')[0];
            snippetEl.innerHTML = \`
              <span class="comment-author-avatar-sm">\${authorShort.charAt(0).toUpperCase()}</span>
              <span style="font-weight: 600; color: #1E293B;">\${escapeHtml(authorShort)}:</span>
              <span style="color: #64748B; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"\${escapeHtml(last.text)}"</span>
            \`;
          } else {
            snippetEl.innerHTML = \`
              <span style="font-size: 13px;">💬</span>
              <span style="color: #94A3B8; font-style: italic; font-size: 10.5px;">+ Tulis catatan evaluasi tim...</span>
            \`;
          }
        }
      });
    }

    function renderProfileCommentsSection(talentId) {
      const container = document.getElementById('profModalCommentsContainer');
      const countEl = document.getElementById('profModalCommentsCount');
      if (!container) return;

      const comments = state.candidateComments[talentId] || [];
      if (countEl) countEl.textContent = comments.length;

      if (comments.length === 0) {
        container.innerHTML = '<span style="font-size: 11px; color: var(--text-muted); font-style: italic; text-align: center; padding: 10px 0;">Belum ada catatan evaluasi tim. Tulis catatan pertama di bawah.</span>';
        return;
      }

      const curEmail = state.currentUser ? (state.currentUser.email || '').toLowerCase() : '';
      container.innerHTML = comments.map(c => {
        const isAuthor = (c.authorEmail || '').toLowerCase() === curEmail;
        const canDelete = isAuthor || isSuperAdmin();
        const initial = (c.authorName || 'HR').charAt(0).toUpperCase();

        return \`
          <div class="comment-thread-item" style="padding: 8px 10px;">
            <div class="comment-thread-header">
              <div class="comment-thread-author" style="font-size: 11px;">
                <div class="comment-author-avatar-sm" style="width: 16px; height: 16px; font-size: 8px;">\${initial}</div>
                <span>\${escapeHtml(c.authorName || 'HR Team')}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="comment-thread-time">\${formatTimeAgo(c.createdAt)}</span>
                \${canDelete ? \`
                  <button type="button" class="btn btn-secondary btn-sm" onclick="handleDeleteCandidateComment('\${talentId}', '\${c.id}')" title="Hapus Catatan" style="color: var(--pastel-red-text); padding: 0 4px; font-size: 10px;">
                    ✕
                  </button>
                \` : ''}
              </div>
            </div>
            <div class="comment-thread-body" style="font-size: 11.5px; margin-top: 2px;">\${escapeHtml(c.text)}</div>
          </div>\`;
      }).join('');
      container.scrollTop = container.scrollHeight;
    }

    async function handleAddCommentFromProfileModal(talentId) {
      const input = document.getElementById('profModalCommentInput');
      if (!input || !talentId) return;
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      await addCandidateComment(talentId, text);
    }

    /* Renders permanent attached CV Card in Drawer */
    function renderAttachedCvCard(url, customName) {
      const container = document.getElementById('cvAttachedContainer');
      if (!container) return;
      if (!isValidDisplayUrl(url)) {
        container.innerHTML = '';
        return;
      }
      const displayName = customName || (url.startsWith('data:') ? 'Local CV Document' : 'Attached CV Document (Click to Preview ↗)');
      container.innerHTML = \`
        <div class="attached-cv-box" id="attachedCvCard">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span>📄</span>
            <a href="\${url}" target="_blank" style="color: #1E40AF; font-weight: 500; text-decoration: underline;">\${escapeHtml(displayName)}</a>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="clearCvUrl()" style="padding: 2px 8px; font-size: 10px; color: var(--pastel-red-text);">Remove</button>
        </div>\`;
    }

    function handleManualCvUrlChange(val) {
      if (isValidDisplayUrl(val)) {
        renderAttachedCvCard(val);
      } else {
        const container = document.getElementById('cvAttachedContainer');
        if (container) container.innerHTML = '';
      }
    }

    function clearCvUrl() {
      const cvInput = document.getElementById('inputCvUrl');
      if (cvInput) cvInput.value = '';
      if (state.selectedTalent) state.selectedTalent.cvUrl = '';
      const container = document.getElementById('cvAttachedContainer');
      if (container) container.innerHTML = '';
      showToast('Cleared CV link. Click Save Candidate to update.');
    }

    function addSkillRow() {
      const container = document.getElementById('skillsBuilderContainer');
      if (!container) return;
      const row = document.createElement('div');
      row.className = 'skills-builder-row';
      row.innerHTML = \`
        <input type="text" class="form-input skill-name-input" placeholder="Skill name (e.g. Motion Graphics)" style="flex: 1;" onblur="this.value = toTitleCase(this.value)">
        <select class="form-select skill-rating-select" style="width: 90px;">
          <option value="5">5 ★</option>
          <option value="4" selected>4 ★</option>
          <option value="3">3 ★</option>
          <option value="2">2 ★</option>
          <option value="1">1 ★</option>
        </select>
        <button type="button" class="btn btn-secondary btn-icon" onclick="this.closest('.skills-builder-row').remove()" style="color: var(--pastel-red-text);">✕</button>\`;
      container.appendChild(row);
    }

    function renderPortfolioChips() {
      const container = document.getElementById('portfolioFilesContainer');
      if (!container) return;
      if (!state.stagedPortfolioItems.length) {
        container.innerHTML = '<span style="font-size: 11px; color: var(--text-muted); font-style: italic;">No portfolio files attached yet.</span>';
        return;
      }
      container.innerHTML = state.stagedPortfolioItems.map((item, idx) => {
        const safeUrl = normalizeUrl(item.url);
        return \`
          <div class="chip">
            <span>\${item.type === 'video' ? '🎬' : (item.type === 'image' ? '🖼️' : '📄')}</span>
            <a href="\${safeUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: none; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${escapeHtml(item.name || 'Portfolio Item')}</a>
            <span class="chip-remove" onclick="removePortoItem(\${idx})">✕</span>
          </div>\`;
      }).join('');
    }

    function addManualPortoLink() {
      const input = document.getElementById('inputManualPortoUrl');
      if (!input || !input.value.trim()) return;
      const rawUrl = input.value.trim();
      const safeUrl = normalizeUrl(rawUrl);
      if (!safeUrl) {
        showToast('⚠️ Please enter a valid URL');
        return;
      }
      const isVid = safeUrl.toLowerCase().includes('.mp4') || safeUrl.toLowerCase().includes('youtube') || safeUrl.toLowerCase().includes('tiktok') || safeUrl.toLowerCase().includes('youtu.be');
      state.stagedPortfolioItems.push({
        name: isVid ? 'Video Link' : 'Portfolio Link',
        url: safeUrl,
        type: isVid ? 'video' : 'document'
      });
      input.value = '';
      renderPortfolioChips();
      showToast('Added portfolio link!');
    }

    function removePortoItem(idx) {
      state.stagedPortfolioItems.splice(idx, 1);
      renderPortfolioChips();
    }

    /* ---------------------------------------------------- */
    /* CLIENT-SIDE AUTO-COMPRESSOR (IMAGES & 50MB+ PDFS)    */
    /* ---------------------------------------------------- */
    async function compressPdfFile(file) {
      if (!window.pdfjsLib || !window.PDFLib) {
        console.warn('PDF compression libraries not ready');
        return file;
      }

      showToast(\`⚡ Compressing \${formatFileSize(file.size)} PDF into high-res lightweight format...\`);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDocOriginal = await loadingTask.promise;
        const numPages = pdfDocOriginal.numPages;

        const newPdfDoc = await PDFLib.PDFDocument.create();

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDocOriginal.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          await page.render({ canvasContext: ctx, viewport: viewport }).promise;

          const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.80);
          const jpgImageBytes = await fetch(jpgDataUrl).then(res => res.arrayBuffer());
          const embeddedJpg = await newPdfDoc.embedJpg(jpgImageBytes);

          const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
          newPage.drawImage(embeddedJpg, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height
          });
        }

        const compressedPdfBytes = await newPdfDoc.save();
        const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });

        console.log(\`⚡ Compressed PDF from \${formatFileSize(file.size)} ➔ \${formatFileSize(compressedBlob.size)}\`);
        showToast(\`✓ PDF compressed (\${formatFileSize(file.size)} ➔ \${formatFileSize(compressedBlob.size)})!\`);

        return new File([compressedBlob], file.name, { type: 'application/pdf' });
      } catch (err) {
        console.error('PDF compression error:', err);
        showToast('PDF compression error, proceeding with original file...');
        return file;
      }
    }

    async function autoCompressFile(file) {
      if (file.type.startsWith('image/') || /\\.(jpe?g|png|webp|bmp)$/i.test(file.name)) {
        try {
          const compressedBlob = await new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
              URL.revokeObjectURL(url);
              const maxDim = 1920;
              let width = img.width;
              let height = img.height;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob(
                (b) => {
                  if (b) resolve(b);
                  else resolve(file);
                },
                'image/jpeg',
                0.82
              );
            };
            img.onerror = () => resolve(file);
            img.src = url;
          });

          if (compressedBlob && compressedBlob.size < file.size) {
            console.log(\`⚡ Auto-compressed image: \${formatFileSize(file.size)} ➔ \${formatFileSize(compressedBlob.size)}\`);
            const newFileName = file.name.replace(/\\.[^/.]+$/, '') + '.jpg';
            return new File([compressedBlob], newFileName, { type: 'image/jpeg' });
          }
        } catch (e) {
          console.warn('Image auto-compression fallback:', e);
        }
      }

      if ((file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) && file.size > 25 * 1024 * 1024) {
        return await compressPdfFile(file);
      }

      return file;
    }

    /* ---------------------------------------------------- */
    /* APPWRITE STORAGE RESUMABLE UPLOADER (UP TO 50 MB)    */
    /* ---------------------------------------------------- */
    async function enqueueAppwriteUpload(rawFile, category, targetCandidateId, targetCandidateName) {
      const file = await autoCompressFile(rawFile);

      const MAX_ALLOWED_SIZE = 49 * 1024 * 1024;
      if (file.size > MAX_ALLOWED_SIZE) {
        const sizeStr = formatFileSize(file.size);
        alert(\`⚠️ File "\${file.name}" berukuran \${sizeStr} melebihi batas 50 MB paket gratis Appwrite Cloud.\\n\\n💡 Solusi Terbaik:\\nSilakan masukkan link Google Drive / Canva / YouTube / TikTok pada kolom 'Attached Portfolio Items' agar portofolio video berukuran besar tetap tersimpan dalam kualitas penuh tanpa batasan kuota!\`);
        
        const manualInput = document.getElementById('inputManualPortoUrl');
        if (manualInput) manualInput.focus();
        return;
      }

      const existingJob = state.globalUploads.find(j => 
        j.candidateId === targetCandidateId && 
        j.category === category && 
        j.fileName === file.name && 
        j.status === 'uploading'
      );
      if (existingJob) {
        showToast(\`File \${file.name} is already uploading!\`);
        return;
      }

      const uplId = 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const isVid = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4');
      const isImg = file.type.startsWith('image/');
      const fileType = isVid ? 'video' : (isImg ? 'image' : 'document');

      const job = {
        id: uplId,
        candidateId: targetCandidateId,
        candidateName: targetCandidateName,
        fileName: file.name,
        fileSize: file.size,
        category: category,
        type: fileType,
        status: 'uploading',
        progress: 5,
        downloadUrl: null
      };

      state.globalUploads.push(job);
      updateGlobalUploadPill();
      renderDrawerUploadQueues();

      const fileId = Appwrite.ID.unique();
      const uploadPromise = storage.createFile(
        APPWRITE_CONFIG.bucketId,
        fileId,
        file,
        ['read("any")'],
        function(progress) {
          const pct = Math.min(99, Math.round((progress.progress || 0) * 100));
          job.progress = pct;
          updateGlobalUploadPill();
          renderDrawerUploadQueues();
        }
      );

      uploadPromise.then(fileObj => {
        const fileViewUrl = \`\${APPWRITE_CONFIG.endpoint}/storage/buckets/\${APPWRITE_CONFIG.bucketId}/files/\${fileObj.$id}/view?project=\${APPWRITE_CONFIG.projectId}\`;

        job.status = 'ready';
        job.progress = 100;
        job.downloadUrl = fileViewUrl;
        updateGlobalUploadPill();
        renderDrawerUploadQueues();

        if (category === 'cv') {
          const cvInput = document.getElementById('inputCvUrl');
          if (cvInput) cvInput.value = fileViewUrl;
          if (state.selectedTalent && (state.selectedTalent.id === targetCandidateId || state.selectedTalent.$id === targetCandidateId)) {
            state.selectedTalent.cvUrl = fileViewUrl;
          }
          renderAttachedCvCard(fileViewUrl, file.name);
        } else if (category === 'porto') {
          if (!state.stagedPortfolioItems.some(it => it.url === fileViewUrl || it.name === file.name)) {
            state.stagedPortfolioItems.push({
              name: file.name,
              url: fileViewUrl,
              type: fileType
            });
          }
          renderPortfolioChips();
        }

        if (state.selectedTalent && state.selectedTalent.$id) {
          patchCandidateInAppwrite(state.selectedTalent.$id, category, fileViewUrl, file.name, fileType);
        } else {
          showToast(\`☁️ Uploaded \${file.name} (Ready to Save)\`);
        }
      }).catch(err => {
        console.error('Appwrite Storage upload error:', err);
        job.status = 'error';
        updateGlobalUploadPill();
        renderDrawerUploadQueues();
        showToast(\`⚠️ Upload error: \${err.message || 'Storage error'}\`);
      });
    }

    async function patchCandidateInAppwrite(docId, category, fileUrl, fileName, fileType) {
      if (!docId || !fileUrl) return;

      try {
        if (category === 'cv') {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            { cvUrl: fileUrl }
          );
          showToast(\`☁️ CV saved to Appwrite!\`);
        } else if (category === 'porto') {
          const target = state.talents.find(t => t.$id === docId || t.id === docId);
          const currentItems = target && target.portfolioItems ? [...target.portfolioItems] : [...state.stagedPortfolioItems];
          if (!currentItems.some(it => it.url === fileUrl || it.name === fileName)) {
            currentItems.push({ name: fileName, url: fileUrl, type: fileType });
          }
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            {
              portfolioUrl: fileUrl,
              portfolioItemsJson: JSON.stringify(currentItems)
            }
          );
          showToast(\`☁️ Portfolio saved to Appwrite!\`);
        }
      } catch (e) {
        console.warn('Auto-patch document error:', e);
      }
    }

    function updateGlobalUploadPill() {
      if (!el.globalUploadPill) return;
      const activeJobs = state.globalUploads.filter(j => j.status === 'uploading');
      
      if (activeJobs.length > 0) {
        el.globalUploadPill.classList.add('active');
        el.globalUploadPill.classList.remove('success');
        
        const avgProgress = Math.round(activeJobs.reduce((sum, j) => sum + j.progress, 0) / activeJobs.length);
        if (el.globalUploadIcon) el.globalUploadIcon.textContent = '☁️';
        if (el.globalUploadText) el.globalUploadText.textContent = \`Streaming \${activeJobs.length} file\${activeJobs.length > 1 ? 's' : ''} to Appwrite (\${avgProgress}%)\`;
        if (el.globalUploadTrack) el.globalUploadTrack.style.display = 'block';
        if (el.globalUploadBar) el.globalUploadBar.style.width = avgProgress + '%';
      } else {
        const completedRecently = state.globalUploads.filter(j => j.status === 'ready');
        if (completedRecently.length > 0) {
          el.globalUploadPill.classList.add('active', 'success');
          if (el.globalUploadIcon) el.globalUploadIcon.textContent = '✓';
          if (el.globalUploadText) el.globalUploadText.textContent = 'Saved to Appwrite Storage!';
          if (el.globalUploadTrack) el.globalUploadTrack.style.display = 'none';

          setTimeout(() => {
            if (state.globalUploads.every(j => j.status !== 'uploading')) {
              el.globalUploadPill.classList.remove('active');
            }
          }, 3500);
        } else {
          el.globalUploadPill.classList.remove('active');
        }
      }
    }

    function renderDrawerUploadQueues() {
      const curId = state.selectedTalent ? state.selectedTalent.id : null;
      if (!curId) return;

      const cvQueueEl = document.getElementById('cvUploadQueue');
      const portoQueueEl = document.getElementById('portoUploadQueue');

      if (cvQueueEl) {
        const cvJobs = state.globalUploads.filter(j => j.candidateId === curId && j.category === 'cv' && j.status === 'uploading');
        cvQueueEl.innerHTML = cvJobs.map(item => generateUploadItemHtml(item)).join('');
      }

      if (portoQueueEl) {
        const portoJobs = state.globalUploads.filter(j => j.candidateId === curId && j.category === 'porto' && j.status === 'uploading');
        portoQueueEl.innerHTML = portoJobs.map(item => generateUploadItemHtml(item)).join('');
      }
    }

    function generateUploadItemHtml(item) {
      const isComplete = item.status === 'ready';
      const isError = item.status === 'error';
      const typeIcon = item.type === 'video' ? '🎬' : (item.type === 'image' ? '🖼️' : '📄');

      return \`
        <div class="upload-item-card" id="card_\${item.id}">
          <div class="upload-item-header">
            <div class="upload-item-name">
              <span>\${typeIcon}</span>
              <span>\${escapeHtml(item.fileName)}</span>
            </div>
            <div class="upload-item-meta" style="color:var(--text-muted);">\${formatFileSize(item.fileSize)}</div>
          </div>
          
          <div class="upload-progress-track">
            <div class="upload-progress-fill \${isComplete ? 'complete' : ''}" 
                 id="bar_\${item.id}" 
                 style="width: \${item.progress}%; \${isError ? 'background: #DC2626;' : ''}"></div>
          </div>

          <div class="upload-status-row">
            <div id="status_\${item.id}">
              \${isComplete ? \`
                <span class="badge-status-ready">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Uploaded &amp; Linked ✓
                </span>
              \` : (isError ? \`
                <span style="color: #DC2626; font-weight: 500;">Upload Failed.</span>
              \` : \`
                <span class="badge-status-uploading" style="color: #2563EB;">
                  <svg class="spin-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                  Streaming to Appwrite (\${item.progress}%)...
                </span>
              \`)}
            </div>
            \${isComplete && item.downloadUrl ? \`
              <a href="\${item.downloadUrl}" target="_blank" style="font-size: 10px; color: #2563EB; font-weight: 500; text-decoration: underline;">Preview ↗</a>
            \` : ''}
          </div>
        </div>\`;
    }

    /* ---------------------------------------------------- */
    /* CV DROPZONE HANDLERS                                 */
    /* ---------------------------------------------------- */
    function handleCvDragOver(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('cvDropzone');
      if (dz) dz.classList.add('drag-active');
    }
    function handleCvDragEnter(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('cvDropzone');
      if (dz) dz.classList.add('drag-active');
    }
    function handleCvDragLeave(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('cvDropzone');
      if (dz) dz.classList.remove('drag-active');
    }
    function handleCvDrop(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('cvDropzone');
      if (dz) dz.classList.remove('drag-active');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        triggerCvUpload(dt.files[0]);
      }
    }
    function handleCvFileSelect(e) {
      const files = e.target.files;
      if (files && files.length > 0) {
        triggerCvUpload(files[0]);
      }
      e.target.value = '';
    }

    function triggerCvUpload(file) {
      const candidateId = state.selectedTalent ? state.selectedTalent.id : ('PGE-' + String(state.talents.length + 1).padStart(3, '0'));
      const candidateName = (document.getElementById('inputName') && document.getElementById('inputName').value.trim()) || (state.selectedTalent ? state.selectedTalent.name : 'Candidate');

      enqueueAppwriteUpload(file, 'cv', candidateId, candidateName);
      showToast('☁️ Streaming CV to Appwrite...');
    }

    /* ---------------------------------------------------- */
    /* PORTFOLIO DROPZONE HANDLERS                          */
    /* ---------------------------------------------------- */
    function handlePortoDragOver(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('portoDropzone');
      if (dz) dz.classList.add('drag-active');
    }
    function handlePortoDragEnter(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('portoDropzone');
      if (dz) dz.classList.add('drag-active');
    }
    function handlePortoDragLeave(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('portoDropzone');
      if (dz) dz.classList.remove('drag-active');
    }
    function handlePortoDrop(e) {
      e.preventDefault(); e.stopPropagation();
      const dz = document.getElementById('portoDropzone');
      if (dz) dz.classList.remove('drag-active');
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        Array.from(dt.files).forEach(f => triggerPortoUpload(f));
      }
    }
    function handlePortoFileSelect(e) {
      const files = Array.from(e.target.files || []);
      files.forEach(f => triggerPortoUpload(f));
      e.target.value = '';
    }

    function triggerPortoUpload(file) {
      const candidateId = state.selectedTalent ? state.selectedTalent.id : ('PGE-' + String(state.talents.length + 1).padStart(3, '0'));
      const candidateName = (document.getElementById('inputName') && document.getElementById('inputName').value.trim()) || (state.selectedTalent ? state.selectedTalent.name : 'Candidate');

      enqueueAppwriteUpload(file, 'porto', candidateId, candidateName);
      showToast('☁️ Streaming Portfolio to Appwrite...');
    }

    /* Save candidate into Appwrite with Auto-Capitalization */
    async function handleSaveCandidate() {
      const rawName = document.getElementById('inputName').value.trim();
      if (!rawName) { showToast('Please enter candidate name'); return; }

      const name = toTitleCase(rawName);
      const role = toTitleCase(document.getElementById('inputRole').value.trim()) || 'Freelance Content Creator';
      const phone = formatToInternationalPhone(document.getElementById('inputPhone').value.trim());
      const email = cleanEmail(document.getElementById('inputEmail').value.trim());
      const experienceLevel = document.getElementById('inputLevel').value;
      const domisili = toTitleCase(document.getElementById('inputDomisili') ? document.getElementById('inputDomisili').value.trim() : '');
      const education = cleanEducation(document.getElementById('inputEducation') ? document.getElementById('inputEducation').value.trim() : '');
      const overallRating = Number(document.getElementById('inputOverallRating').value);
      const stage = document.getElementById('inputStage').value;
      const expectedSalary = document.getElementById('inputSalary').value.trim();
      const notes = document.getElementById('inputNotes').value.trim();
      const cvUrl = document.getElementById('inputCvUrl') ? document.getElementById('inputCvUrl').value.trim() : '';

      const skills = [];
      document.querySelectorAll('.skills-builder-row').forEach(row => {
        const sName = toTitleCase(row.querySelector('.skill-name-input').value.trim());
        const sRating = Number(row.querySelector('.skill-rating-select').value);
        if (sName) skills.push({ name: sName, rating: sRating });
      });

      let structuredNotes = notes;
      if (education && !structuredNotes.toLowerCase().includes('pendidikan:')) {
        structuredNotes = \`Pendidikan: \${education}\\n\` + structuredNotes;
      }
      if (domisili && !structuredNotes.toLowerCase().includes('domisili:')) {
        structuredNotes = \`Domisili: \${domisili}\\n\` + structuredNotes;
      }

      const targetId = state.selectedTalent ? (state.selectedTalent.id || state.selectedTalent.$id) : ('PGE-' + String(state.talents.length + 1).padStart(3, '0'));
      const docId = (targetId || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

      let primaryPorto = '';
      if (state.stagedPortfolioItems.length > 0) {
        const validItem = state.stagedPortfolioItems.find(p => isValidDisplayUrl(p.url));
        if (validItem) primaryPorto = validItem.url;
      }

      const docPayload = {
        talentId: targetId,
        name: name,
        role: role,
        phone: phone,
        email: email,
        experienceLevel: experienceLevel,
        overallRating: overallRating,
        stage: stage || 'Prospect',
        expectedSalary: expectedSalary || 'Standard Uang Saku',
        domisili: domisili,
        education: education,
        notes: structuredNotes.trim(),
        cvUrl: cvUrl,
        portfolioUrl: primaryPorto,
        portfolioItemsJson: JSON.stringify(state.stagedPortfolioItems),
        skillsJson: JSON.stringify(skills)
      };

      if (!state.selectedTalent && !isSuperAdmin()) {
        showToast('⚠️ Only Super Admin (hrdcvpge@gmail.com) is authorized to add new candidates.');
        return;
      }

      closeDrawer();
      showToast('Saving candidate to Appwrite Cloud...');

      try {
        if (state.selectedTalent && state.selectedTalent.$id) {
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            state.selectedTalent.$id,
            docPayload
          );
          showToast('✅ Candidate updated successfully!');
        } else {
          try {
            await databases.createDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collectionId,
              docId,
              docPayload,
              ['read("any")', 'update("any")', 'delete("any")']
            );
            showToast('✅ New candidate created successfully!');
          } catch (createErr) {
            if (createErr.code === 409 || (createErr.message && createErr.message.includes('already exists'))) {
              await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collectionId,
                docId,
                docPayload
              );
              showToast('✅ Candidate updated successfully!');
            } else {
              throw createErr;
            }
          }
        }
        loadAppwriteTalents();
      } catch (err) {
        console.error('Appwrite save error:', err);
        showToast('Save error: ' + (err.message || 'Check connection'));
      }
    }

    async function deleteCandidate(id, name) {
      if (!isSuperAdmin()) {
        showToast('⚠️ Only Super Admin (hrdcvpge@gmail.com) is authorized to delete candidates.');
        return;
      }

      if (!confirm('Are you sure you want to delete ' + (name || id) + ' from Appwrite?')) return;

      const target = state.talents.find(t => t.id === id || t.$id === id);
      const docId = target && target.$id ? target.$id : (id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

      try {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId
        );
        showToast('Deleted candidate: ' + (name || id));
        loadAppwriteTalents();
      } catch (err) {
        console.error('Delete error:', err);
        showToast('Delete error: ' + err.message);
      }
    }

    function handleDeleteCurrentCandidate() {
      if (!isSuperAdmin()) {
        showToast('⚠️ Only Super Admin is authorized to delete candidates.');
        return;
      }
      if (!state.selectedTalent) return;
      deleteCandidate(state.selectedTalent.id, state.selectedTalent.name);
      closeDrawer();
    }

    function handleExportCSV() {
      if (!state.talents.length) { showToast('No data to export'); return; }
      const headers = ['ID', 'Nama', 'Role', 'WhatsApp', 'Email', 'Level', 'Rating', 'Stage', 'Gaji', 'CV URL', 'Portfolio URL', 'Notes'];
      const rows = state.talents.map(t => [
        t.id,
        \`"\${(t.name || '').replace(/"/g, '""')}"\`,
        \`"\${(t.role || '').replace(/"/g, '""')}"\`,
        \`"\${(formatToInternationalPhone(t.phone) || '').replace(/"/g, '""')}"\`,
        \`"\${(t.email || '').replace(/"/g, '""')}"\`,
        t.experienceLevel || '',
        t.overallRating || '',
        t.stage || '',
        \`"\${(t.expectedSalary || '').replace(/"/g, '""')}"\`,
        \`"\${(t.cvUrl || '').replace(/"/g, '""')}"\`,
        \`"\${(t.portfolioUrl || '').replace(/"/g, '""')}"\`,
        \`"\${(t.notes || '').replace(/"/g, '""')}"\`
      ]);
      const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows.map(r => r.join(','))].join('\\n'));
      const a = document.createElement('a');
      a.href = csv;
      a.download = \`PGE_Talent_Pool_\${new Date().toISOString().slice(0, 10)}.csv\`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Exported CSV successfully!');
    }

    function showToast(msg) {
      if (!el.toastContainer) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      el.toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.2s';
        setTimeout(() => toast.remove(), 200);
      }, 3000);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Window Export Bindings
    window.isSuperAdmin = isSuperAdmin;
    window.handleGoogleSignIn = handleGoogleSignIn;
    window.handleSignOut = handleSignOut;
    window.updateCandidateStage = updateCandidateStage;
    window.openAddCandidateDrawer = openAddCandidateDrawer;
    window.openTalentDetail = openTalentDetail;
    window.closeDrawer = closeDrawer;
    window.handleSaveCandidate = handleSaveCandidate;
    window.deleteCandidate = deleteCandidate;
    window.handleDeleteCurrentCandidate = handleDeleteCurrentCandidate;
    window.switchView = switchView;
    window.resetFilters = resetFilters;
    window.handleExportCSV = handleExportCSV;
    window.toggleAnalyticsDashboard = toggleAnalyticsDashboard;
    window.renderAnalyticsDashboard = renderAnalyticsDashboard;
    window.addSkillRow = addSkillRow;
    window.addManualPortoLink = addManualPortoLink;
    window.removePortoItem = removePortoItem;
    window.clearCvUrl = clearCvUrl;
    window.handleManualCvUrlChange = handleManualCvUrlChange;
    window.handleCvDragOver = handleCvDragOver;
    window.handleCvDragEnter = handleCvDragEnter;
    window.handleCvDragLeave = handleCvDragLeave;
    window.handleCvDrop = handleCvDrop;
    window.handleCvFileSelect = handleCvFileSelect;
    window.handlePortoDragOver = handlePortoDragOver;
    window.handlePortoDragEnter = handlePortoDragEnter;
    window.handlePortoDragLeave = handlePortoDragLeave;
    window.handlePortoDrop = handlePortoDrop;
    window.handlePortoFileSelect = handlePortoFileSelect;
    window.formatToInternationalPhone = formatToInternationalPhone;
    window.handleNameBlur = handleNameBlur;
    window.handlePhoneBlur = handlePhoneBlur;
    window.checkDuplicateLive = checkDuplicateLive;
    window.addQuickTag = addQuickTag;
    window.toTitleCase = toTitleCase;
    window.cleanEducation = cleanEducation;
    window.cleanEmail = cleanEmail;
    window.toggleCompareCandidate = toggleCompareCandidate;
    window.updateCompareBar = updateCompareBar;
    window.clearComparison = clearComparison;
    window.openComparisonModal = openComparisonModal;
    window.closeComparisonModal = closeComparisonModal;
    window.openPortoGalleryModal = openPortoGalleryModal;
    window.closePortoGalleryModal = closePortoGalleryModal;
    window.openWhitelistModal = openWhitelistModal;
    window.closeWhitelistModal = closeWhitelistModal;
    window.handleAddWhitelistEmail = handleAddWhitelistEmail;
    window.handleRemoveWhitelistEmail = handleRemoveWhitelistEmail;
    window.toggleTeamMessenger = toggleTeamMessenger;
    window.switchMessengerTab = switchMessengerTab;
    window.mentionMemberInChat = mentionMemberInChat;
    window.handleSendTeamMessage = handleSendTeamMessage;
    window.handleBroadcastTemplateChange = handleBroadcastTemplateChange;
    window.insertVariableIntoMessage = insertVariableIntoMessage;
    window.updateBroadcastPreview = updateBroadcastPreview;
    window.toggleBroadcastSelect = toggleBroadcastSelect;
    window.toggleSelectAllBroadcast = toggleSelectAllBroadcast;
    window.handleCandidateCardClick = handleCandidateCardClick;
    window.openCandidateProfileModal = openCandidateProfileModal;
    window.closeCandidateProfileModal = closeCandidateProfileModal;
    window.switchToEditDrawer = switchToEditDrawer;
    window.requestWindowsDesktopNotification = requestWindowsDesktopNotification;
    window.sendBroadcastSingle = sendBroadcastSingle;
    window.renderBroadcastTable = renderBroadcastTable;
    window.selectVacancy = selectVacancy;
    window.renderVacancyHub = renderVacancyHub;
    window.getUniqueVacancies = getUniqueVacancies;
    window.openCandidateCommentsModal = openCandidateCommentsModal;
    window.closeCandidateCommentsModal = closeCandidateCommentsModal;
    window.handleAddCandidateCommentFromModal = handleAddCandidateCommentFromModal;
    window.handleDeleteCandidateComment = handleDeleteCandidateComment;
    window.handleAddCommentFromProfileModal = handleAddCommentFromProfileModal;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootApp);
    } else {
      bootApp();
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(targetPath, publicHtml, 'utf8');

const faviconSvgPath = 'C:\\\\Users\\\\User\\\\Documents\\\\antigravity\\\\Talent pool\\\\public\\\\favicon.svg';
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#111827"/>
  <text x="16" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="18" fill="#FFFFFF" text-anchor="middle">P</text>
</svg>`;
fs.writeFileSync(faviconSvgPath, faviconSvg, 'utf8');

console.log('Successfully regenerated public/index.html and favicon.svg:', publicHtml.length);

