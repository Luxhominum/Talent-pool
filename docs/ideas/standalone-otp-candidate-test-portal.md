# Standalone OTP Candidate Test Portal: Architecture & Specification

## Problem Statement
How might we completely decouple the candidate testing experience from the internal Talent Pool dashboard into an ultra-lightweight, dedicated standalone web page (`/test`), accessible exclusively via an admin-generated 6-digit OTP (with 1-click WhatsApp smart links), ensuring 100% candidate privacy, zero exposure of internal candidate records, real-time proctoring status, and automatic self-locking upon submission?

---

## Recommended Direction: The "Decoupled Standalone OTP Portal" (`/test`)

A dedicated single-purpose application (`public/test.html`) completely isolated from `index.html`. Candidates never see or load the Talent Pool dashboard, other candidate records, or administrative controls.

```
┌────────────────────────────────────────────────────────┐
│             ADMIN DASHBOARD (index.html)               │
│                                                        │
│  [ PGE-001 Lia Ana Pratama ]                           │
│  [ 🔑 Kirim OTP Tes ke WA ] ──▶ Generates OTP: 839-214 │
│                                  Saves to /assessmentTokens
│                                  Opens WhatsApp Web with:
│                                  "https://.../test?otp=839214"
└───────────────────────────┬────────────────────────────┘
                            │
              Candidate receives WhatsApp
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          STANDALONE TEST PORTAL (/test.html)           │
│                                                        │
│  Scenario A: Candidate taps WA Smart Link              │
│  URL has ?otp=839214 ──▶ Auto-populates & Auto-verifies│
│                                                        │
│  Scenario B: Candidate opens link on laptop            │
│  Enters 6-digit OTP manually ──▶ Instant verification  │
│                                                        │
│  Display: "Selamat datang, Lia Ana Pratama"           │
│  Role: Freelance Content Creator                       │
│  Session: Sandboxed (Only accesses own test)          │
│                                                        │
│  Phase 1: Big Five & DISC (Relaxed & Autosaved)        │
│  Phase 2: Aptitude/Logic (Timer 45s + Anti-Cheat)      │
│                                                        │
│  [ Kirim Jawaban Final ]                               │
│       │                                                │
│       ├─▶ Writes result to /talents/PGE-001/assessment │
│       ├─▶ Marks OTP status: 'completed' (Locked)       │
│       └─▶ Displays Thank You & Career Mini-Infographic │
└───────────────────────────┬────────────────────────────┘
                            │
               Real-Time Cloud Synchronization
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             ADMIN DASHBOARD (index.html)               │
│                                                        │
│  Live Status Pill updates automatically:               │
│  [ Belum Dibuka ] ──▶ [ Sedang Mengerjakan ] ──▶ [ ✓ Selesai ]
│  Report Card & Pentagon Matrix instantly ready to print!
└────────────────────────────────────────────────────────┘
```

---

## 🔒 1. Absolute Privacy & Isolation Model

### Why Decoupling Matters:
In the current on-site kiosk (`assessment-portal.html`), candidates select names from a dropdown or see applicant lists. **For remote testing from home, this is unacceptable** due to strict Indonesian personal data privacy and competitive confidentiality.

### The Sandboxed Node Architecture:
In Firebase Realtime Database:
```json
"/assessmentTokens": {
  "839214": {
    "talentId": "PGE-001",
    "candidateName": "Lia Ana Pratama",
    "role": "Freelance Content Creator",
    "phone": "+6281323319026",
    "createdAt": 1789710000000,
    "expiresAt": 1789796400000,
    "status": "active", // "active" | "in_progress" | "completed" | "expired"
    "currentStep": 0,
    "tabViolations": 0,
    "answers": {}
  }
}
```
- The standalone page (`test.html`) query is scoped **strictly** to `/assessmentTokens/{otp}`.
- It possesses **zero queries** to `/talents` or `/metadata`.
- Even if a tech-savvy candidate inspects the browser DevTools Network tab or JavaScript memory, they can **never** view or enumerate other applicants.

---

## 📱 2. The Smart Link & OTP Flow

### A. Admin Dispatcher (Inside `index.html`):
1. In the Candidate Profile Modal or Drawer, an action button **`🔑 Kirim OTP Tes ke WhatsApp`** is available.
2. Clicking it:
   - Checks if an active token already exists; if not, generates a random 6-digit number (e.g. `839-214`).
   - Sets `expiresAt = Date.now() + (24 * 60 * 60 * 1000)` (24-hour validity).
   - Generates the pre-filled WhatsApp message:
     ```text
     Halo Kak Lia Ana Pratama,

     Selamat! Anda lolos ke tahap asesmen online PGE Talent Pool untuk posisi Freelance Content Creator.

     Silakan klik link berikut untuk memulai tes melalui smartphone/laptop Anda:
     👉 https://pge-talentpool.web.app/test?otp=839214

     Kode OTP Anda: 839-214 (Aktif selama 24 jam).
     Estimasi waktu pengerjaan: 15–20 menit. Mohon kerjakan di tempat yang tenang dan stabil.

     Terima kasih,
     Tim HR PGE
     ```
   - Opens `https://wa.me/6281323319026?text=...` in a new tab.

### B. Candidate Experience on `/test.html`:
- **Path 1 (Smart Link from WhatsApp)**:
  - Candidate taps link. The page reads `?otp=839214`.
  - Automatically fills the 6-digit box and authenticates in 400ms with a gentle checkmark animation.
  - Skips manual typing entirely!
- **Path 2 (Manual Input on Laptop/PC)**:
  - Candidate visits `pge-talentpool.web.app/test`.
  - Sees a clean, distraction-free screen with a 6-digit input box (`___ - ___`).
  - Types `839214`.
  - System verifies and displays:
    > *"Selamat datang, Lia Ana Pratama! Anda akan memulai asesmen untuk posisi Freelance Content Creator."*
  - Big friendly button: **`Mulai Asesmen Sekarang ➔`**.

---

## ⏱️ 3. Split Testing Engine & Autosave

### Phase 1: Karakter & Gaya Kerja (Big Five & DISC)
- **Kondisi**: Waktu santai, tanpa countdown timer.
- **Interaksi**: Thumb-first buttons (tinggi minimal 48px). Begitu opsi disentuh, otomatis meluncur (*smooth auto-advance*) ke soal berikutnya.
- **Autosave**: Setiap jawaban langsung tersimpan ke cloud (`/assessmentTokens/839214/answers/q_12`).
- **Audit**: Waktu respons per soal dicatat diam-diam untuk mendeteksi apakah kandidat membaca soal atau asal klik cepat (< 1 detik).

### Phase 2: Logika Bisnis & Penalaran Kognitif (Aptitude & Frexor)
- **Kondisi**: **Strict Countdown Timer (45–60 detik per soal)**.
- **Anti-Cheat Guardrails**:
  - Timer bar visual di atas soal yang menyusut secara halus.
  - Jika waktu habis, jawaban tersimpan dan otomatis lanjut ke soal berikutnya.
  - **Tab Switch Detection**: Jika kandidat berganti aplikasi/tab untuk browsing jawaban atau membuka AI, sistem menampilkan modal peringatan dan mencatat pelanggaran ke database (`tabViolations`).
  - **Anti Copy-Paste**: Mematikan seleksi teks dan klik kanan.

---

## 🔒 4. Completion & Self-Locking Protocol

When the candidate clicks **`Kirim Jawaban Final`**:
1. Full score calculation runs (Pentagon 5-dimensions, DISC tally, Cognitive percentage).
2. Data is written directly to `/talents/{talentId}/assessment` in Firebase/Appwrite:
   - `status: "completed"`
   - `completedAt: Date.now()`
   - `tabViolations: N`
   - `dimensions`, `disc`, `cognitive`.
3. The token status is updated:
   - `/assessmentTokens/839214/status = "completed"`.
   - Any future attempts to re-enter this OTP will show: *"Asesmen ini telah selesai dikerjakan pada [Tanggal & Waktu]. Terima kasih!"*.
4. **Candidate Screen**:
   - Menampilkan layar apresiasi profesional.
   - Menyajikan **Mini Infografis Karakter Kerja** (misal: *"Gaya Dominan: Kreatif & Kolaboratif"*) sebagai bentuk apresiasi bagi kandidat.
   - Kunci jawaban logika kognitif tetap 100% dirahasiakan.

---

## 📊 5. Real-Time Admin Proctoring (Di Dashboard Talent Pool)

Pada dashboard admin `index.html`, recruiter dapat melihat status live kandidat secara real-time:
- `⏳ Belum Dibuka`: Token sudah dibuat dan dikirim, tapi kandidat belum membuka link.
- `🟡 Sedang Mengerjakan`: Kandidat sedang aktif mengisi (menampilkan nomor soal terakhir).
- `✓ Selesai`: Asesmen selesai, dossier psikometrik dan Report Card siap dicetak!
- `⚠️ Terdeteksi Pindah Tab (2x)`: Flag peringatan kecurangan bagi pewawancara.

---

## Key Assumptions to Validate
- [ ] Kandidat menggunakan berbagai peramban mobile (Chrome Android, Samsung Internet, Safari iOS) tanpa kendala autosave.
- [ ] Routing Firebase rewrite `/test` -> `/test.html` berfungsi mulus tanpa reload looping.
- [ ] 24 jam adalah durasi ideal sebelum OTP kedaluwarsa.

---

## MVP Scope (Rencana Eksekusi)
1. **File `public/test.html`**: Halaman mandiri ultra-ringan khusus kandidat.
2. **Routing `firebase.json`**: Menambahkan rewrite rule `{ "source": "/test", "destination": "/test.html" }`.
3. **Admin Trigger di `public/index.html`**: Tombol "🔑 Kirim OTP Tes" di Profile Modal kandidat untuk generate PIN dan membuka template WhatsApp.
4. **Sinkronisasi Database**: Modul update otomatis ke `/talents/{talentId}/assessment` saat kandidat submit.

---

## Not Doing (and Why)
- **Mengizinkan Kandidat Masuk ke `index.html`**: Sepenuhnya dilarang demi keamanan data dan privasi kandidat lain.
- **Aplikasi Mobile / Download Play Store**: Menggunakan web mobile instan via browser HP agar kandidat tidak perlu mengunduh aplikasi tambahan.
- **Webcam Video Proctoring**: Cukup timer 45 detik + tab switch detection yang jauh lebih handal dan ramah kuota.
