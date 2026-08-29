# Product Requirements Document (PRD): PGE Talent Pool

## 1. Executive Summary

**PGE Talent Pool** is a high-performance, web-based Candidate Management System (CMS) designed for high-volume recruitment of freelance content creators, video editors, and creative talent. Built on top of Google Apps Script and Google Sheets, it provides HR leads and hiring managers with zero-latency candidate browsing, multi-view evaluation (Bento Grid, Tabular Data, and Kanban Pipeline), WhatsApp 1-click candidate communication, and multi-file portfolio media management.

---

## 2. Product Objectives & Success Metrics

### Objectives:
1. **Instant Candidate Evaluation**: Provide a 0-millisecond eager client hydration layer so recruiters can search, filter, and review candidates without waiting for network RPC cycles.
2. **Seamless Google Sheets Data Persistence**: Maintain 100% sync with Google Sheets (`Spreadsheet ID: 14e8zSKkqBXmgQwzmZv_mvSS4xitximZLmInZXoUAAdQ`) using non-destructive, synonymous column resolution.
3. **Rich Portfolio & Media Management**: Support multi-file portfolio drops (PDF, MP4, MOV, ZIP, PNG/JPG) streaming directly into Google Drive with public view permissions.
4. **Frictionless Communication**: Enable 1-click WhatsApp chat links formatted to international standards (`+628...`).

---

## 3. User Personas

| Persona | Role | Key Needs | Primary Workflow |
| :--- | :--- | :--- | :--- |
| **Recruitment Lead** | Screening & Shortlisting | Rapid scanning of candidate ratings, skills, and portfolio samples. | Uses **Bento Grid** to review portfolios and star ratings; updates candidate stage. |
| **HR Operations Admin** | Data Management & Tracking | Bulk data input, CSV export, precise record updates. | Uses **Data Table View** & CSV Export; manages candidate contact information. |
| **Hiring Manager** | Final Evaluation | Pipeline progress visualization, candidate interviewing notes. | Uses **Kanban Pipeline Board** to track stages from Prospect to Hired. |

---

## 4. Feature Requirements

### 4.1 Candidate Directory & Multi-View Interface
- **Bento Card Grid**: Visual cards displaying candidate ID, name, role, overall rating badge (1–5 stars), location (Domisili), education (Pendidikan), skill tags, WhatsApp 1-click link, CV link, and multi-file portfolio chips.
- **Data Table View**: High-density tabular layout with sorting and action triggers.
- **Kanban Board**: 7-stage pipeline visualizer (`Prospect`, `Screening`, `Interviewed`, `Shortlisted`, `Offered`, `Hired`, `Archived`).

### 4.2 Filtering & Real-Time Search
- **Search Query**: Real-time filtering across name, role, skills, location, education, and interview notes.
- **Stage Selector**: Filter by pipeline stage.
- **Star Rating Selector**: Filter by minimum overall star rating (5 stars, 4+ stars, 3+ stars).

### 4.3 Candidate Profile Slide-Over Drawer
- **Personal Details**: Full Name, Role/Position, Experience Level (Junior, Mid, Senior, Lead).
- **Location & Education**: Dedicated fields for Domisili and Pendidikan.
- **Contact Info**: Phone (auto-formatted to international `+628...` format) and Email.
- **Skill Builder**: Dynamic row builder for specific skill ratings (Foto Produk, Video Produk, Video Editing, Content Sense, etc.).
- **Document Dropzone**: Direct Base64 stream to Google Drive folder (`TalentPool_Uploads`).
- **Multi-File Portfolio**: Interactive file chips (🎬 Video, 📄 PDF, 🖼️ Image) with remove triggers and manual link entry.

---

## 5. Technical Constraints & Architecture

- **Runtime & Hosting**: Firebase Hosting CDN (`https://talentpool-34137.web.app`).
- **Database**: Firebase Realtime Database (`asia-southeast1`).
- **Authentication**: Firebase Authentication (Google Sign-In).
- **Media Storage**: Firebase Cloud Storage (`talentpool-34137.firebasestorage.app`).
- **Sync Strategy**: Firebase WebSocket real-time listeners (`db.ref('talents').on('value')`).

---

## 6. Data Schema & Dictionary

| Field | Data Type | Sheet Header Synonym | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | `ID`, `Kode`, `No` | Sequential unique identifier (`PGE-001`) |
| `name` | String | `Nama Kandidat`, `Nama`, `Name` | Candidate full name |
| `role` | String | `Role`, `Posisi`, `Position` | Role or position (default: Freelance Content Creator) |
| `phone` | String | `No. WA`, `WA`, `Phone`, `Telepon` | WhatsApp phone number in international `+628...` format |
| `email` | String | `Email`, `Surel` | Email address |
| `education` | String | `Pendidikan`, `Education` | School/University background |
| `domisili` | String | `Domisili`, `Kota`, `Location` | Residence city/area |
| `skills` | Array | `Basic Foto`, `Basic Video`, `Basic Editing`, `Content Sense` | Skill rating objects `[{ name, rating }]` |
| `overallRating`| Number | `Overall Rating`, `Rating` | 1–5 star rating average |
| `stage` | String | `Status Panggilan`, `Stage`, `Status` | Pipeline stage (`Prospect`, `Screening`, etc.) |
| `cvUrl` | String | `CV Link`, `CV URL`, `CV` | Google Drive link to candidate CV |
| `portfolioUrl` | String | `Portfolio Link`, `Portfolio URL` | Primary or JSON multi-file portfolio links |
| `notes` | String | `Notes`, `Catatan` | Interview remarks & source tags |
