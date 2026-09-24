# Candidate Report Card & Interview Evaluation Dossier (Printable A4)

## Problem Statement
How might we provide interviewers and hiring executives with an impeccable, print-ready 2-page A4 Candidate Report Card that bridges physical interview note-taking with digital portfolios (via QR codes), multi-position history, structured evaluation rubrics, team discussion notes, and psychometric assessment data without wasting ink or clipping pages?

---

## Recommended Direction: The "Hybrid Executive & Interviewer Dossier" (2-Page A4)

A meticulously typeset 2-page print document combining live interview evaluation utilities on Page 1 and deep psychometric/cognitive diagnostics on Page 2:

### Page 1: Executive Profile & Live Interview Scorecard
1. **Header & Document Identity**:
   - Company branding: `PGE TALENT POOL` • Confidential Recruitment Record.
   - Candidate ID, Role, Application Date, Stage badge.
2. **Candidate Bio & Multi-Job Awareness Banner**:
   - Contact: WhatsApp (normalized), Email, Domicile, Education, Expected Salary.
   - If candidate applied to multiple positions: Compact alert pill listing other applied roles & their current stages.
3. **Portfolio & Digital Bridge (Dynamic QR Codes)**:
   - Dynamic QR codes generated for the candidate's primary Portfolio link and CV document.
   - Interviewers can aim their smartphone or iPad camera at the paper sheet to instantly inspect video reels, Canva decks, or Drive files while seated with the candidate.
4. **Talent Baseline Rating**:
   - 4 Core Pillar stars & scores: Foto, Video, Editing, Sense/Taste.
5. **Pre-Filled Team Discussion & Internal Notes**:
   - Chronological summary of previous comments from team evaluators / screeners.
6. **Structured Interview Scoring Rubric (1–5 scale with checkboxes)**:
   - Komunikasi & Kepercayaan Diri (1 - 5)
   - Penguasaan Skill Teknis & Estetika (1 - 5)
   - Problem Solving & Inisiatif Kreatif (1 - 5)
   - Culture Fit & Etika Kerja (1 - 5)
   - Box for Total / Average Score.
7. **Live Interviewer Notes & Recommendation Box**:
   - Ruled space for pen-and-paper note-taking.
   - Decision tick-boxes: `[ ] REKOMENDASI (HIRE)` | `[ ] DIPERTIMBANGKAN (HOLD)` | `[ ] TIDAK DISARANKAN (REJECT)`.
   - Formal signature and interviewer name block.

### Page 2: Psychometric & Cognitive Dossier (Auto-Collapses if Unassessed)
1. **Assessment Metadata**:
   - Completion timestamp, total questions answered, validity index.
2. **Pentagon Matrix (IPIP Big Five Personality)**:
   - High-contrast SVG radar/pentagon chart with 5 dimensions (Extraversion, Agreeableness, Conscientiousness, Emotional Stability, Openness).
   - Dimension percentage and trait level cards.
3. **DISC Behavioral Curve**:
   - Vector line graph connecting D-I-S-C values.
   - Profile archetype pill (e.g. `High-I Influencer / Achiever`) + workplace behavioral narrative.
4. **Business Logic & Cognitive Reasoning**:
   - Visual aspect breakdown bars for Verbal, Numeric, Spatial, Logic, and Commercial Sense.
5. **Graceful Handling for Unassessed Candidates**:
   - If candidate has not yet taken the assessment, Page 2 can be excluded or display an on-site test invitation QR code, avoiding blank wasted paper.

---

## Key Assumptions to Validate
- [ ] Office printers handle vector SVG pentagons and line graphs crisply in black & white without banding.
- [ ] QR code generation via fast, lightweight CDN (`api.qrserver.com` or local SVG) renders instantly with high error correction (Level M or Q) for fast mobile camera scanning.
- [ ] Page 1 content fits within exactly 1 A4 page (no overflow to page 2), using strict print typography and CSS `@page { size: A4; margin: 10mm 12mm; }`.

---

## MVP Scope
- Add `printCandidateReportCard(talentId, options)` accessible directly from:
  1. Profile Showcase Modal header button `🖨️ Cetak Report Card`
  2. Table view candidate row action menu
  3. Assessment tab inside profile modal
- Support page print controls:
  - Toggle: "Cetak 2 Halaman (Lengkap)" vs "Cetak Halaman 1 Saja (Lembar Interview)"
  - Direct browser trigger: `window.print()`
- Incorporate team discussions/comments stored in `state.candidateDiscussions[talentId]`.
- Include multi-position history from `getCandidateApplications(talent)`.
- Generate QR codes for CV & Portfolio URLs.
- Include structured 1–5 scoring rubric and interviewer notes grid.

---

## Not Doing (and Why)
- **Heavy dark background fills**: Bleeds ink, looks smeared on office printers, and drains cartridges. Strictly light theme with razor-sharp dark slate hairline typography.
- **Requiring assessment completion to print**: Previous prototype blocked printing if assessment wasn't completed. The new design allows printing anytime for interviews even if tests are still pending.
- **Complex server-side PDF generation**: Kept 100% client-side via native browser print/PDF engine for instantaneous rendering with 0 server latency or costs.
