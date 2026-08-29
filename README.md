# PGE Talent Pool (Firebase Edition)

A Candidate Management System (CMS) and talent repository built for recruitment leads and hiring managers. Features zero-latency live sync, multi-view evaluation (Bento Grid, Table, and Kanban Pipeline), WhatsApp communication links, and candidate portfolio tracking.

- **Production URL**: [https://talentpool-34137.web.app](https://talentpool-34137.web.app)
- **Firebase Project Console**: [https://console.firebase.google.com/project/talentpool-34137/overview](https://console.firebase.google.com/project/talentpool-34137/overview)
- **Database**: Firebase Realtime Database (`asia-southeast1`)
- **Authentication**: Google Sign-In with Firebase Auth

---

## 1. Architecture Overview

```text
[ Browser Client / PWA ]
       │
       ├── Google Sign-In (Firebase Auth)
       ├── Live Data Sync (Firebase Realtime Database)
       ├── File Uploads (Firebase Cloud Storage)
       └── Static CDN (Firebase Hosting)
```

### Key Advantages over Google Apps Script:
1. **True Real-time Synchronization**: When any recruiter adds, updates, or deletes a candidate, all connected browser tabs update immediately without refreshing.
2. **Independent CDN Hosting**: Hosted directly on Google Cloud CDN (`talentpool-34137.web.app`), eliminating Apps Script `/exec` iframe caching and Google Drive permissions redirects.
3. **Secure Cloud Storage**: Candidate CVs and media portfolios are stored in dedicated cloud buckets with signed URLs.

---

## 2. Directory Structure

```text
c:/Users/User/Documents/antigravity/Talent pool/
├── public/
│   └── index.html              # Production Single-Page Application (Firebase SDK)
├── firebase.json               # Firebase Hosting, DB rules, & Storage config
├── .firebaserc                 # Project alias binding (talentpool-34137)
├── database.rules.json         # Realtime Database security rules
├── storage.rules               # Cloud Storage security rules
├── seed-firebase.js            # Initial data migration seed script
├── PRODUCT.md                  # Product Requirements Document
├── DESIGN.md                   # Design System & UI Tokens
└── README.md                   # Developer & Handoff Guide
```

---

## 3. Database Schema (Realtime Database)

### `/talents/{candidateId}`
```json
{
  "id": "PGE-001",
  "name": "Lia Ana Pratama",
  "role": "Freelance Content Creator",
  "phone": "+6281323319026",
  "email": "liaanapratama21@gmail.com",
  "experienceLevel": "Junior",
  "overallRating": 5,
  "stage": "Prospect",
  "expectedSalary": "Standard Uang Saku",
  "skills": [
    { "name": "Foto Produk", "rating": 4 },
    { "name": "Video Produk", "rating": 5 },
    { "name": "Video Editing", "rating": 4 },
    { "name": "Content Sense", "rating": 5 }
  ],
  "domisili": "Banjarsari",
  "education": "Fresh Graduate (Duta Bangsa)",
  "cvUrl": "https://firebasestorage.googleapis.com/...",
  "portfolioUrl": "CV/CV - Portofolio (Lia Ana Pratama).pdf",
  "portfolioItems": [
    { "name": "Portfolio.pdf", "url": "https://...", "type": "document" }
  ],
  "notes": "Source: Email",
  "createdAt": 1724745600000,
  "updatedAt": 1724745600000
}
```

---

## 4. Deployment Commands

```bash
# Deploy everything (Hosting + Database Rules)
npx --yes firebase-tools deploy

# Deploy only frontend updates
npx --yes firebase-tools deploy --only hosting

# Deploy only database security rules
npx --yes firebase-tools deploy --only database
```

