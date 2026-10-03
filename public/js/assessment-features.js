/**
 * assessment-features.js
 * PGE Talent Pool - Executive Assessment Extensions
 * Modular Additive Implementation:
 * 1. Role Benchmark & Fit Score Index (% Match)
 * 2. Side-by-Side Candidate Comparison Matrix (Overlaid Spider Web + Metrics)
 * 3. Smart Interview Probe Guide Generator
 * 4. Quick Stage Action (Direct Firebase RTDB Update)
 * 5. Smart WhatsApp Template Modal & Direct Action
 */

(function() {
  'use strict';

  window.AssessmentExtensions = window.AssessmentExtensions || {};

  /* ---------------------------------------------------- */
  /* 1. ROLE BENCHMARK & FIT SCORE CALCULATION            */
  /* ---------------------------------------------------- */
  function isCognitiveTested(assessment) {
    if (!assessment || !assessment.cognitive) return false;
    const cog = assessment.cognitive;
    if (cog.tested === false || cog.completed === false) return false;
    if (typeof cog.score === 'number' && cog.score > 0) return true;
    if (Array.isArray(cog.items) && cog.items.length > 0) {
      return cog.items.some(it => it.selectedAnswer !== undefined || it.userAnswer !== undefined || it.isCorrect !== undefined || it.answered);
    }
    if (cog.answers && Object.keys(cog.answers).length > 0) return true;
    if (cog.completed === true || cog.tested === true) return true;
    return false;
  }

  function formatBigFiveTraitName(traitKey) {
    const map = {
      extraversion: 'Ekstraversi (Extraversion)',
      agreeableness: 'Keramahan (Agreeableness)',
      conscientiousness: 'Kehati-hatian (Conscientiousness)',
      emotionalStability: 'Kestabilan Emosi (Emotional Stability)',
      emotionalstability: 'Kestabilan Emosi (Emotional Stability)',
      intellect: 'Kreativitas & Keterbukaan (Intellect)',
      openness: 'Kreativitas & Keterbukaan (Intellect)'
    };
    if (map[traitKey]) return map[traitKey];
    return String(traitKey || '').replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
  }

  function getSharpenedBigFiveTraitDescription(traitKey, percentage, level) {
    const k = String(traitKey || '').toLowerCase();
    const pct = Number(percentage) || 50;
    const isHigh = pct >= 65 || (level && (level.includes('Tinggi') || level.includes('High') || level.includes('Sangat')));
    const isLow = pct < 45 || (level && (level.includes('Rendah') || level.includes('Low')));

    if (k.includes('extraversion') || k.includes('ekstraversi')) {
      if (isHigh) return 'Komunikatif, proaktif membuka relasi baru, energik saat berinteraksi publik atau memimpin diskusi tim.';
      if (isLow) return 'Cenderung tenang & reflektif; optimal pada tugas mandiri mendalam (deep work) dengan koordinasi terencana.';
      return 'Seimbang dan adaptif; luwes berkomunikasi dalam tim serta mandiri saat menyelesaikan tanggung jawab individu.';
    }
    if (k.includes('agreeableness') || k.includes('keramahan')) {
      if (isHigh) return 'Kooperatif, empati tinggi, berorientasi layanan, menjaga harmoni tim & mendengarkan keluhan klien.';
      if (isLow) return 'Skeptis & independen; berani berbeda pendapat, lugas menyuarakan fakta kritis tanpa ragu bernegosiasi keras.';
      return 'Kolaboratif namun tetap objektif; mampu membangun relasi baik tanpa mengorbankan standar kerja profesional.';
    }
    if (k.includes('conscientiousness') || k.includes('kehati-hatian') || k.includes('kehati')) {
      if (isHigh) return 'Sangat terstruktur, disiplin tenggat waktu, cermat terhadap SOP, minim kesalahan pada detail operasional.';
      if (isLow) return 'Spontan & fleksibel menangani dinamika mendadak; memerlukan supervisi pada kontrol kualitas data & deadline.';
      return 'Cukup teratur dan disiplin; mampu menyeimbangkan kepatuhan prosedur dengan fleksibilitas situasi kerja.';
    }
    if (k.includes('stability') || k.includes('emosi') || k.includes('kestabilan')) {
      if (isHigh) return 'Tenang & stabil di bawah tekanan target, komplain tinggi, atau situasi darurat yang berubah cepat.';
      if (isLow) return 'Sensitif terhadap dinamika konflik & lonjakan beban mendadak; bekerja optimal pada iklim kerja yang terprediksi.';
      return 'Memiliki ketahanan emosi yang wajar; mampu memulihkan fokus kerja setelah menghadapi kendala operasional.';
    }
    if (k.includes('intellect') || k.includes('openness') || k.includes('kreativitas') || k.includes('keterbukaan')) {
      if (isHigh) return 'Cepat menangkap inovasi/tren baru, berpikiran terbuka, eksploratif mencari solusi kreatif di luar kebiasaan.';
      if (isLow) return 'Praktis & konsisten pada metode teruji konvensional; membutuhkan data nyata sebelum mengadopsi hal baru.';
      return 'Praktis dan terbuka; siap menerapkan ide baru selama terbukti efisien dan relevan dengan target kerja.';
    }
    return 'Karakteristik kepribadian terukur mendukung kesesuaian tugas.';
  }

  const ROLE_BENCHMARKS = {
    'business development': {
      title: 'Business Development & Sales',
      weights: { cognitive: 0.40, bigFive: 0.35, disc: 0.25 },
      cognitiveTarget: 70,
      bigFiveWeights: {
        extraversion: 0.30,       // Pitching, client outreach, charisma
        conscientiousness: 0.25,  // Pipeline discipline, quota follow-up
        emotionalStability: 0.20, // Rejection handling, composure in high-stakes
        intellect: 0.15,          // Creative deal structures
        agreeableness: 0.10       // Firm negotiation with rapport
      },
      preferredDiscPatterns: ['D', 'DI', 'ID', 'DC', 'CD', 'I']
    },
    'marketplace specialist': {
      title: 'Marketplace & E-Commerce Specialist',
      weights: { cognitive: 0.45, bigFive: 0.35, disc: 0.20 },
      cognitiveTarget: 65,
      bigFiveWeights: {
        conscientiousness: 0.35,  // Stock accuracy, pricing precision, zero-error
        intellect: 0.25,          // Algorithm trend sensing, campaign tactics
        emotionalStability: 0.20, // Mega-sale stress composure
        agreeableness: 0.10,      // Customer dispute handling
        extraversion: 0.10        // Internal coordination
      },
      preferredDiscPatterns: ['C', 'CS', 'SC', 'D', 'CD', 'S']
    },
    'freelance content creator': {
      title: 'Freelance Content Creator',
      weights: { cognitive: 0.35, bigFive: 0.40, disc: 0.25 },
      cognitiveTarget: 55,
      bigFiveWeights: {
        intellect: 0.35,          // Creative openness, trend adaptation
        extraversion: 0.25,       // Engagement, charisma, public expression
        conscientiousness: 0.20,  // Editorial discipline, deadlines
        emotionalStability: 0.10, // Coping with revisions & critiques
        agreeableness: 0.10       // Team & client collaboration
      },
      preferredDiscPatterns: ['I', 'DI', 'ID', 'IS', 'SI', 'D', 'IC', 'CD']
    },
    'default': {
      title: 'Standard Talent Benchmark',
      weights: { cognitive: 0.40, bigFive: 0.35, disc: 0.25 },
      cognitiveTarget: 60,
      bigFiveWeights: {
        conscientiousness: 0.30,
        intellect: 0.25,
        emotionalStability: 0.20,
        agreeableness: 0.15,
        extraversion: 0.10
      },
      preferredDiscPatterns: ['S', 'C', 'CS', 'SC', 'I', 'D', 'IS']
    }
  };

  function calculateRoleFitScore(talent, assessment) {
    if (!assessment || assessment.status !== 'completed') {
      return null;
    }

    const roleKey = (talent.role || '').toLowerCase().trim();
    const benchmark = ROLE_BENCHMARKS[roleKey] || ROLE_BENCHMARKS['default'];

    // 1. Cognitive Component (0 - 100)
    const hasCog = isCognitiveTested(assessment);
    const cogPct = hasCog && typeof assessment.cognitive.percentage === 'number'
      ? assessment.cognitive.percentage
      : null;

    // 2. Big Five Component (0 - 100)
    const b5Data = assessment.dimensions || assessment.scores || {};
    let b5WeightedSum = 0;
    let b5TotalWeight = 0;

    Object.entries(benchmark.bigFiveWeights).forEach(([traitKey, weight]) => {
      const traitObj = b5Data[traitKey];
      const traitPct = (traitObj && typeof traitObj.percentage === 'number') ? traitObj.percentage : 50;
      b5WeightedSum += (traitPct * weight);
      b5TotalWeight += weight;
    });

    const b5Score = b5TotalWeight > 0 ? (b5WeightedSum / b5TotalWeight) : 50;

    // 3. DISC Component (0 - 100)
    let discScore = 65; // default moderate score
    if (assessment.disc && assessment.disc.profilePattern) {
      const pattern = assessment.disc.profilePattern.toUpperCase();
      const isDirectMatch = benchmark.preferredDiscPatterns.some(p => pattern.startsWith(p));
      const hasSecondaryMatch = benchmark.preferredDiscPatterns.some(p => pattern.includes(p[0]));

      if (isDirectMatch) {
        discScore = 95;
      } else if (hasSecondaryMatch) {
        discScore = 80;
      } else {
        discScore = 65;
      }
    }

    // 4. Overall Weighted Fit Score (Dynamic Re-normalization when Cognitive is not tested)
    let totalScore = 0;
    if (hasCog && typeof cogPct === 'number') {
      totalScore = Math.round(
        (cogPct * benchmark.weights.cognitive) +
        (b5Score * benchmark.weights.bigFive) +
        (discScore * benchmark.weights.disc)
      );
    } else {
      const remainingWeight = (benchmark.weights.bigFive || 0.40) + (benchmark.weights.disc || 0.25);
      const b5NormWeight = remainingWeight > 0 ? (benchmark.weights.bigFive / remainingWeight) : 0.60;
      const discNormWeight = remainingWeight > 0 ? (benchmark.weights.disc / remainingWeight) : 0.40;
      totalScore = Math.round(
        (b5Score * b5NormWeight) +
        (discScore * discNormWeight)
      );
    }

    let label = 'Perlu Evaluasi';
    let badgeBg = '#FFF1F2';
    let badgeColor = '#9F1239';
    let badgeBorder = '#FECDD3';

    if (totalScore >= 80) {
      label = 'Sangat Cocok';
      badgeBg = '#ECFDF5';
      badgeColor = '#065F46';
      badgeBorder = '#A7F3D0';
    } else if (totalScore >= 68) {
      label = 'Kompeten / Cocok';
      badgeBg = '#EFF6FF';
      badgeColor = '#1E40AF';
      badgeBorder = '#BFDBFE';
    } else if (totalScore >= 55) {
      label = 'Dipertimbangkan';
      badgeBg = '#FFFBEB';
      badgeColor = '#92400E';
      badgeBorder = '#FDE68A';
    }

    return {
      score: totalScore,
      label: label,
      badgeBg: badgeBg,
      badgeColor: badgeColor,
      badgeBorder: badgeBorder,
      breakdown: {
        cognitive: hasCog ? cogPct : null,
        bigFive: Math.round(b5Score),
        disc: discScore
      }
    };
  }

  /* ---------------------------------------------------- */
  /* 2. SMART INTERVIEW PROBE GUIDE GENERATOR             */
  /* ---------------------------------------------------- */
  function getRoleCategory(roleStr) {
    const r = (roleStr || '').toLowerCase();
    if (/streamer|live host|host live|shopee live|tiktok live|mc|broadcaster|presenter|live shopping/i.test(r)) {
      return 'live_streamer';
    }
    if (/video|editor|motion|animat|videographer|premiere|after effects|capcut/i.test(r)) {
      return 'video_editor';
    }
    if (/graphic|grafis|desain|design|ui|ux|visual|illustrat|canva|photoshop|figma/i.test(r)) {
      return 'graphic_designer';
    }
    if (/digital marketing|media buyer|meta ads|tiktok ads|fb ads|google ads|seo|sem|growth marketer|performance marketing/i.test(r)) {
      return 'digital_marketing';
    }
    if (/kol|influencer|endorse|talent management|talent coordinator|talent acquisition/i.test(r)) {
      return 'kol_specialist';
    }
    if (/admin recruitment|recruiter|hr|human resources|general affair|personalia|rekrutmen|admin hr/i.test(r)) {
      return 'admin_recruitment';
    }
    if (/writer|copywriter|scriptwriter|penulis|copywriting|artikel|naskah/i.test(r)) {
      return 'content_writer';
    }
    if (/business|bd|sales|account executive|partnership|komersial|commercial|crm|sales officer/i.test(r)) {
      return 'business_development';
    }
    if (/marketplace|tokopedia|shopee|lazada|tiktok shop|operation|operasional|admin olshop|e-commerce|toko online/i.test(r)) {
      return 'marketplace_operations';
    }
    if (/creator|content|kreator|ugc|konten/i.test(r)) {
      return 'content_creator';
    }
    return 'general';
  }

  function generateInterviewProbeQuestions(talent, assessment) {
    if (!assessment) return [];

    const questions = [];
    const b5 = assessment.dimensions || assessment.scores || {};
    const disc = assessment.disc || {};
    const cog = assessment.cognitive || {};
    const roleCat = getRoleCategory(talent.role);
    const hasCog = isCognitiveTested(assessment);
    const cogPct = cog.percentage !== undefined ? cog.percentage : 60;
    const wrongItems = (cog.items || []).filter(it => !it.isCorrect);

    /* ============================================================ */
    /* AXIS 1: ROLE COMPETENCY, TECHNICAL SCENARIO & STRATEGIC DEPTH */
    /* ============================================================ */
    if (roleCat === 'live_streamer') {
      questions.push({
        topic: 'Interaksi Live, Retensi Penonton & Handling Dead Air',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Situasi Live Stream` : `Kompetensi Live Streamer & Host`,
        options: [
          {
            label: 'Pilihan A (Handling Penonton Dingin / Silent Room)',
            question: 'Ketika siaran live sedang sepi atau penonton hanya menonton tanpa memberikan komentar, taktik interaksi spontan apa yang Anda gunakan untuk memancing chat, likes, dan menjaga energi ruangan tetap hidup selama 2 jam penuh?',
            whatToLookFor: '🎯 Green Flag: Memiliki variasi ice-breaker spontan, gimik pertanyaan interaktif, dan stamina vokal stabil tanpa bergantung pada respon penonton.\n🚩 Red Flag: Mengaku sering bingung mau ngomong apa jika tidak ada yang chat atau energi cepat turun saat penonton sepi.'
          },
          {
            label: 'Pilihan B (Hard Selling vs Soft Selling & Flash Sale Urgency)',
            question: 'Bagaimana cara Anda membagi ritme antara storytelling/edukasi manfaat produk dengan momentum flash-sale countdown agar penonton merasa perlu checkout saat itu juga tanpa terkesan memaksa?',
            whatToLookFor: '🎯 Green Flag: Paham teknik call-to-action berulang, penekanan limitasi stok/voucher live, dan struktur product-benefit-urgency yang luwes.\n🚩 Red Flag: Terlalu kaku membaca spesifikasi brosur atau hanya mengulang kata "buruan co" tanpa menggarisbawahi nilai produk.'
          }
        ]
      });
    } else if (roleCat === 'video_editor') {
      questions.push({
        topic: 'Pacing Video, 3-Sec Hook & Efisiensi Workflow Editing',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Editing & Analitik Video` : `Kompetensi Video Editor & Motion`,
        options: [
          {
            label: 'Pilihan A (Evaluasi Drop Retensi 3 Detik Pertama)',
            question: 'Ketika video campaign mengalami drop retensi penonton hingga 65% di detik ke-3, elemen apa saja (audio soundbite, visual cut, kinetic typography, b-roll) yang pertama kali Anda bedah dan rombak?',
            whatToLookFor: '🎯 Green Flag: Memahami psikologi visual hook, audio sound effect sync, pattern interrupt, dan pemangkasan jeda nafas/footage mati.\n🚩 Red Flag: Hanya fokus pada efek visual rumit/estetika warna tanpa memedulikan metrik retensi audiens atau pesan komersial.'
          },
          {
            label: 'Pilihan B (Manajemen Deadline Cepat & Modularity Aset)',
            question: 'Dalam seminggu Anda ditargetkan merilis 10-15 video vertikal siap tayang. Bagaimana sistem template project, file hygiene, dan shortcut workflow yang Anda gunakan agar kecepatan render dan revisi tetap optimal?',
            whatToLookFor: '🎯 Green Flag: Memiliki sistem penamaan folder rapi, preset effect/color grading sendiri, dan terbiasa repurpose 1 master footage ke berbagai variasi hook.\n🚩 Red Flag: Bekerja serabutan tanpa struktur project file, mudah panik saat diminta export variasi format secara cepat.'
          }
        ]
      });
    } else if (roleCat === 'graphic_designer') {
      questions.push({
        topic: 'Hirarki Visual, CTR Banner & Penyelarasan Brand Guideline',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Desain & Konversi Visual` : `Kompetensi Desain Grafis & UI`,
        options: [
          {
            label: 'Pilihan A (Banner Estetis vs Banner Konversi Tinggi)',
            question: 'Sering kali desain yang sangat clean dan estetik justru menghasilkan Click-Through-Rate (CTR) lebih rendah dibanding visual yang padat promo dengan kontras kuat. Bagaimana Anda mencari titik temu antara estetika brand dengan kebutuhan konversi penjualan?',
            whatToLookFor: '🎯 Green Flag: Memahami prinsip visual hierarchy di layar HP kecil (contrast ratio, typography legibility, clear promo badge) tanpa merusak identitas brand.\n🚩 Red Flag: Bersikukuh hanya pada idealisme seni sendiri dan enggan menyesuaikan desain dengan performa konversi.'
          },
          {
            label: 'Pilihan B (Adaptasi Layout Multi-Platform Cepat)',
            question: 'Bagaimana metode Anda dalam merancang sistem desain (master template) agar 1 konsep promosi dapat dengan cepat dipecah menjadi Story 9:16, Feed 1:1, Banner Toko 16:9, dan Carousel tanpa harus mendesain ulang dari nol?',
            whatToLookFor: '🎯 Green Flag: Memanfaatkan smart objects/components, grid system modular, dan efisiensi typography auto-layout.\n🚩 Red Flag: Bekerja manual satu per satu tanpa standardisasi komponen grafis.'
          }
        ]
      });
    } else if (roleCat === 'digital_marketing') {
      questions.push({
        topic: 'Manajemen Budget Iklan, Diagnostik ROAS & Testing Matrix',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Diagnostik Data Ads` : `Kompetensi Digital Marketing & Media Buyer`,
        options: [
          {
            label: 'Pilihan A (Diagnostik ROAS Drop & Ad Fatigue)',
            question: 'Jika CPA/CPR iklan Meta atau TikTok melonjak tajam dalam 3 hari terakhir padahal materi iklan tidak diubah, urutan metrik apa saja (Frequency, CTR link, LP View Rate, Hook Rate) yang Anda audit sebelum memutuskan kill atau scale campaign?',
            whatToLookFor: '🎯 Green Flag: Mampu memisahkan masalah ad creative fatigue dari landing page issue atau audiens saturasi secara runtut.\n🚩 Red Flag: Langsung menaikkan budget sembarangan atau mengganti target audiens tanpa menganalisis metrik funnel.'
          },
          {
            label: 'Pilihan B (Creative Testing Framework & Budget Scaling)',
            question: 'Bagaimana alur kerja Anda dalam menguji puluhan kombinasi video hook, angle promosi, dan copy setiap minggu sebelum menemukan winning creative yang layak di-scale up?',
            whatToLookFor: '🎯 Green Flag: Memiliki metodologi testing terstruktur (CBO vs ABO, isolasi variabel, batasan budget uji coba yang disiplin).\n🚩 Red Flag: Mengandalkan tebak-tebakan tanpa logging data spreadsheet performa kreatif.'
          }
        ]
      });
    } else if (roleCat === 'kol_specialist') {
      questions.push({
        topic: 'Kurasi Influencer, Negosiasi Rate Card & Eksekusi Brief',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Manajemen Talent KOL` : `Kompetensi KOL & Influencer Specialist`,
        options: [
          {
            label: 'Pilihan A (Deteksi Fake Engagement & Evaluasi Kualitas)',
            question: 'Parameter apa saja yang Anda gunakan untuk membedakan antara akun influencer yang memiliki follower organik aktif dengan akun yang menggunakan bot likes/komentar template?',
            whatToLookFor: '🎯 Green Flag: Memeriksa rasio komentar bermakna, views-to-follower ratio, kualitas audiens demografis, dan portfolio brand review sebelumnya.\n🚩 Red Flag: Hanya tergiur angka total followers tinggi tanpa mengecek engagement rate nyata.'
          },
          {
            label: 'Pilihan B (Penanganan KOL Wanprestasi / Molor Deadline)',
            question: 'Bagaimana tindakan tegas namun tetap profesional yang Anda ambil saat seorang KOL yang sudah menerima produk dan uang muka tidak mengunggah konten sesuai jadwal atau melanggar brief revisi?',
            whatToLookFor: '🎯 Green Flag: Memiliki kesepakatan MoU tertulis yang jelas, prosedur reminder berjenjang, dan ketegasan meminta kompensasi/re-shoot.\n🚩 Red Flag: Pasif menunggu atau bersikap emosional tanpa landasan kontrak kerja yang jelas.'
          }
        ]
      });
    } else if (roleCat === 'admin_recruitment') {
      questions.push({
        topic: 'Screening CV Volume Tinggi, SLA Rekrutmen & Mitigasi No-Show',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Operasional HR` : `Kompetensi Admin Recruitment & HR`,
        options: [
          {
            label: 'Pilihan A (Mitigasi Tingkat Kandidat Ghosting / No-Show)',
            question: 'Dalam rekrutmen massal (misal: live host atau sales), tingkat ketidakhadiran wawancara sering kali tinggi. SOP komunikasi WhatsApp dan penjadwalan seperti apa yang Anda terapkan untuk menekan angka no-show?',
            whatToLookFor: '🎯 Green Flag: Menggunakan reminder H-1 dan 2 jam sebelum sesi, konfirmasi kehadiran interaktif, dan overbooking buffer kuota cadangan.\n🚩 Red Flag: Hanya mengirim broadcast 1 kali dan pasrah ketika banyak kandidat tidak hadir.'
          },
          {
            label: 'Pilihan B (Kecepatan Screening CV & Objektivitas Seleksi)',
            question: 'Ketika masuk 300 lamaran dalam 2 hari untuk posisi mendesak, bagaimana formula filter kriteria utama Anda agar proses shortlist selesai dalam hitungan jam tanpa mengabaikan potensi kandidat berbobot?',
            whatToLookFor: '🎯 Green Flag: Memiliki scorecard seleksi berbasis skill kunci, verifikasi portfolio awal, dan kedisiplinan pencatatan database ATS.\n🚩 Red Flag: Membaca CV tanpa rubrik terukur atau mudah terdistraksi oleh format visual CV.'
          }
        ]
      });
    } else if (roleCat === 'content_writer') {
      questions.push({
        topic: 'Formula Copywriting, Angle Emosional & Hook Naskah Video',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Penulisan & Persuasi` : `Kompetensi Content & Scriptwriter`,
        options: [
          {
            label: 'Pilihan A (Penerapan Framework AIDA / PAS pada Naskah)',
            question: 'Bagaimana cara Anda menyusun naskah video pendek 45 detik agar hook masalah (Problem), pembahasan solusi (Agitate/Solution), dan ajakan beli (Call to Action) mengalir mulus tanpa terkesan klise?',
            whatToLookFor: '🎯 Green Flag: Memahami pemilihan kata percakapan alami (spoken word), tempo bacaan, dan emosi audiens sasaran.\n🚩 Red Flag: Menulis kalimat terlalu panjang seperti artikel jurnal yang tidak cocok untuk format audio-visual pendek.'
          },
          {
            label: 'Pilihan B (Riset Pain Point Konsumen & Diferensiasi)',
            question: 'Di tengah banyaknya produk kompetitor sejenis di marketplace, dari sumber mana Anda menggali sudut pandang (angle) baru yang belum pernah dipakai orang lain?',
            whatToLookFor: '🎯 Green Flag: Membaca ulasan bintang 1-3 produk kompetitor, membedah komentar komunitas TikTok/X, dan mencari angle unboxing unik.\n🚩 Red Flag: Hanya mendaur ulang copy kompetitor secara mentah-mentah.'
          }
        ]
      });
    } else if (roleCat === 'business_development') {
      if (wrongItems.length > 0 && hasCog) {
        questions.push({
          topic: 'Pengambilan Keputusan di Bawah Ketidakpastian Pasar',
          indicator: `Skor Logika ${cogPct}% • Evaluasi Kasus Data`,
          options: [
            {
              label: 'Pilihan A (Toleransi Ambiguitas & Deal Speed)',
              question: 'Dalam studi kasus kognitif, Anda cenderung menunggu data laporan lengkap dibanding langsung mengamankan stok saat terjadi lonjakan 300%. Dalam dunia Business Development riil, bagaimana Anda menyeimbangkan antara kehati-hatian memverifikasi data dengan kecepatan mengeksekusi kesepakatan (deal speed) agar momentum pasar tidak hilang?',
              whatToLookFor: '🎯 Green Flag: Mengambil calculated risk terukur, berani melangkah dengan 80% data, dan memiliki contingency plan bila kondisi berubah.\n🚩 Red Flag: Mengalami analysis paralysis (terlalu lama menunda eksekusi sampai prospek diambil kompetitor).'
            },
            {
              label: 'Pilihan B (Prioritas Pipeline & Alokasi Waktu)',
              question: 'Ketika Anda memiliki beberapa prospek kemitraan besar sekaligus di tengah keterbatasan kapasitas operasional perusahaan, parameter data apa yang Anda gunakan untuk menentukan akun mana yang harus diprioritaskan terlebih dahulu?',
              whatToLookFor: '🎯 Green Flag: Menghitung Deal Value x Closing Probability x Onboarding Speed, bukan sekadar nominal omzet kotor semata.\n🚩 Red Flag: Hanya mengejar prospek yang paling ramah tanpa mempertimbangkan profitabilitas riil.'
            }
          ]
        });
      } else {
        questions.push({
          topic: 'Strategi Penetrasi Akun, Proteksi Margin & Negosiasi',
          indicator: hasCog ? `Skor Logika Tinggi (${cogPct}%)` : `Kompetensi Komersial Business Development`,
          options: [
            {
              label: 'Pilihan A (Proteksi Margin vs Tuntutan Diskon Agresif)',
              question: 'Ketika calon klien korporat besar menuntut diskon harga 25% yang dapat merusak struktur margin perusahaan, strategi penawaran nilai tambah (value-add bundle) non-moneter apa yang Anda ajukan agar kesepakatan tetap tercapai?',
              whatToLookFor: '🎯 Green Flag: Menawarkan benefit volume tier, payment terms lebih cepat, co-branding, atau bonus kuota tanpa membakar harga dasar.\n🚩 Red Flag: Langsung menyerah memotong harga atau bersikap kaku menolak tanpa opsi jalan tengah.'
            },
            {
              label: 'Pilihan B (Membuka Akun Dingin & Menembus Gatekeeper)',
              question: 'Ceritakan pendekatan terbaik Anda dalam menembus gatekeeper (sekretaris/admin) dan menjadwalkan meeting perdana dengan pengambil keputusan level C-level atau manajer utama?',
              whatToLookFor: '🎯 Green Flag: Riset latar belakang prospek secara mendalam, personalized pitch yang langsung menyentuh pain-point bisnis mereka.\n🚩 Red Flag: Mengirim template pesan dingin standar yang generik dan mudah diabaikan.'
            }
          ]
        });
      }
    } else if (roleCat === 'marketplace_operations') {
      questions.push({
        topic: 'Diagnostik Performa Toko, Iklan & Mitigasi Risiko Stok',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Operasional Marketplace` : `Kompetensi Operasional E-Commerce`,
        options: [
          {
            label: 'Pilihan A (Diagnostik Penurunan Performa Penjualan)',
            question: 'Jika Return on Ad Spend (ROAS) toko mendadak drop dari 4.5x ke 1.8x di saat biaya klik (CPC) stabil, urutan metrik apa saja (Conversion Rate, review rating, voucher, stock badge) yang pertama kali Anda audit?',
            whatToLookFor: '🎯 Green Flag: Kemampuan berpikir struktural dalam membedah conversion rate listing, bundle promo, stok varian, dan ulasan negatif terbaru.\n🚩 Red Flag: Langsung panik mematikan seluruh iklan atau menurunkan harga produk secara drastis.'
          },
          {
            label: 'Pilihan B (Mitigasi Risiko Overselling di Mega-Sale)',
            question: 'Bagaimana SOP Anda dalam mengantisipasi kehabisan stok fisik (overselling) menjelang kampanye besar (Payday / Twin Date) agar toko tidak terkena poin penalti keterlambatan marketplace?',
            whatToLookFor: '🎯 Green Flag: Disiplin safety stock buffer, auto-sync software multi-channel, dan koordinasi harian dengan gudang.\n🚩 Red Flag: Tidak memiliki buffer cadangan dan mengandalkan update stok manual saat event berlangsung.'
          }
        ]
      });
    } else if (roleCat === 'content_creator') {
      questions.push({
        topic: 'Penyelarasan Bisnis & Kreativitas Konten Organik',
        indicator: hasCog ? `Skor Logika ${cogPct}% • Kreativitas Konten` : `Strategi Kreatif & Komersial Peran`,
        options: [
          {
            label: 'Pilihan A (Estetika vs Objektif Konversi Penjualan)',
            question: 'Sebagai kreator, bagaimana cara Anda menyeimbangkan antara estetika visual konten yang disukai netizen dengan tujuan call-to-action (CTA) konversi penjualan produk perusahaan?',
            whatToLookFor: '🎯 Green Flag: Menerjemahkan objektif komersial ke dalam visual menarik, soft-selling natural, dan CTA yang jelas.\n🚩 Red Flag: Konten terlalu hard-selling seperti iklan TV lama atau terlalu abstrak tanpa kaitan produk.'
          },
          {
            label: 'Pilihan B (Evaluasi Drop Retensi & Adaptasi Cepat)',
            question: 'Ketika sebuah video mengalami drop retensi drastis di 3 detik pertama, langkah apa yang Anda lakukan untuk merombak formula hook visual, audio, dan caption?',
            whatToLookFor: '🎯 Green Flag: Rutin membaca analitik video, berani menguji variasi format, dan cepat merespon tren sound/topik hangat.\n🚩 Red Flag: Menganggap performa video murni karena "nasib algoritma" tanpa analisis mandiri.'
          }
        ]
      });
    } else {
      questions.push({
        topic: 'Pemecahan Masalah & Pendekatan Berbasis Data',
        indicator: hasCog ? `Skor Logika ${cogPct}%` : `Gaya Eksekusi Mandiri`,
        options: [
          {
            label: 'Pilihan A (Keputusan Berbasis Fakta vs Asumsi)',
            question: 'Ceritakan satu contoh kasus kerja di mana data lapangan bertolak belakang dengan intuisi atau asumsi awal Anda. Tindakan apa yang Anda ambil?',
            whatToLookFor: '🎯 Green Flag: Objektivitas, integritas data, dan kemampuan mengubah haluan kerja secara rasional.\n🚩 Red Flag: Memaksakan kehendak subjektif meski bukti data menunjukkan kegagalan.'
          },
          {
            label: 'Pilihan B (Manajemen Prioritas di Tengah Brief Ambigu)',
            question: 'Bagaimana cara Anda mengambil langkah ketika menerima instruksi kerja yang kurang detail atau serba mendesak dari atasan?',
            whatToLookFor: '🎯 Green Flag: Inisiatif mengklarifikasi objektif utama, menyusun draft langkah awal secara proaktif, dan melaporkan kemajuan berkala.\n🚩 Red Flag: Diam menunggu arahan mendetail atau malah salah mengerjakan karena berasumsi sendiri.'
          }
        ]
      });
    }

    /* ============================================================ */
    /* AXIS 2: DISC INTERPERSONAL COMMUNICATION & TEAM DYNAMICS     */
    /* ============================================================ */
    const discPattern = (disc.profilePattern || '').toUpperCase();
    const isDominant = discPattern.startsWith('D');
    const isInfluential = discPattern.startsWith('I');
    const isSteady = discPattern.startsWith('S');
    const isCompliant = discPattern.startsWith('C');

    if (roleCat === 'live_streamer') {
      if (isDominant || isInfluential) {
        questions.push({
          topic: 'Dinamika Energi Live & Kepatuhan Brief Produk',
          indicator: `Gaya DISC Tipe ${discPattern} (Ekspresif & Berenergi Tinggi)`,
          options: [
            {
              label: 'Pilihan A (Disiplin Terhadap Product Knowledge & Klaim)',
              question: 'Sebagai host dengan gaya bicara ekspresif dan persuasif, bagaimana Anda memastikan bahwa Anda tidak melebih-lebihkan klaim produk (overclaim) yang berpotensi melanggar ketentuan BPOM/kebijakan platform saat live?',
              whatToLookFor: '🎯 Green Flag: Selalu mempelajari product brief sebelum tayang, memiliki batas etika klaim, dan disiplin aturan platform.\n🚩 Red Flag: Mengabaikan brief demi closing semata atau asal klaim khasiat produk.'
            },
            {
              label: 'Pilihan B (Kerja Sama dengan Co-Host & Tim Operator)',
              question: 'Bagaimana cara Anda berkoordinasi dengan operator live stream (yang mengatur banner voucher, harga flash sale, dan stok) saat siaran berlangsung cepat?',
              whatToLookFor: '🎯 Green Flag: Komunikasi kode visual yang tenang, menghargai peran operator, dan tidak menyalahkan tim di depan kamera.\n🚩 Red Flag: Terlihat kesal atau menegur tim teknis saat kamera masih on-air.'
            }
          ]
        });
      } else {
        questions.push({
          topic: 'Stamina Interaksi & Fleksibilitas Spontan',
          indicator: `Gaya DISC Tipe ${discPattern} (Terstruktur & Tenang)`,
          options: [
            {
              label: 'Pilihan A (Meningkatkan Ketangkasan Ad-Libbing)',
              question: 'Gaya Anda cenderung terstruktur dan tenang. Bagaimana cara Anda melatih improvisasi spontan (ad-libbing) saat terjadi hal-hal di luar script live?',
              whatToLookFor: '🎯 Green Flag: Memiliki cadangan cerita produk, humor yang santun, dan keluwesan merespon komentar lucu audiens.\n🚩 Red Flag: Terpaku kaku pada susunan naskah hingga live terasa dingin.'
            },
            {
              label: 'Pilihan B (Menjaga Konsistensi Vokal & Mood)',
              question: 'Bagaimana manajemen fisik dan mental Anda agar suara tidak serak dan mood tetap ramah saat harus live 2-3 shift dalam satu hari?',
              whatToLookFor: '🎯 Green Flag: Manajemen hidrasi, pemanasan vokal, dan kontrol artikulasi pernapasan.\n🚩 Red Flag: Tidak memiliki persiapan fisik khusus dan mudah kehabisan suara.'
            }
          ]
        });
      }
    } else if (roleCat === 'video_editor' || roleCat === 'graphic_designer') {
      questions.push({
        topic: 'Respon Terhadap Masukan Kreatif & Penyelarasan Tim',
        indicator: `Gaya DISC Tipe ${discPattern} • Kolaborasi Kreatif`,
        options: [
          {
            label: 'Pilihan A (Menyikapi Revisi Berulang & Perbedaan Selera)',
            question: 'Ketika hasil karya yang sudah Anda kerjakan dengan teliti diminta revisi total oleh tim marketing karena arah kampanye mendadak berubah, bagaimana Anda mengelola respon profesional Anda?',
            whatToLookFor: '🎯 Green Flag: Mampu memisahkan karya dari ego pribadi, mendengarkan objektif bisnis di balik revisi, dan memberikan opsi solusi alternatif.\n🚩 Red Flag: Defensif, bersungut-sungut, atau mengerjakan revisi secara asal-asalan sebagai bentuk protes.'
          },
          {
            label: 'Pilihan B (Komunikasi Waktu & Kapasitas Kerja)',
            question: 'Ketika beberapa divisi sekaligus meminta materi desain/video mendesak di hari yang sama, bagaimana cara Anda mengomunikasikan batas kapasitas kerja Anda tanpa terkesan menolak tugas?',
            whatToLookFor: '🎯 Green Flag: Transparansi antrean tugas, meminta bantuan lead untuk menentukan prioritas, dan memberikan estimasi waktu realistis.\n🚩 Red Flag: Mengiyakan semua permintaan tapi akhirnya banyak yang terlambat (over-promise under-deliver).'
          }
        ]
      });
    } else if (roleCat === 'digital_marketing' || roleCat === 'kol_specialist') {
      questions.push({
        topic: 'Koordinasi Lintas Divisi & Penegakan Kesepakatan',
        indicator: `Gaya DISC Tipe ${discPattern} • Diplomasi Kerja`,
        options: [
          {
            label: 'Pilihan A (Kolaborasi dengan Tim Kreatif & Copywriter)',
            question: 'Bagaimana cara Anda memberikan feedback berbasis data analitik kepada tim desainer/editor tanpa membuat mereka merasa karyanya diremehkan?',
            whatToLookFor: '🎯 Green Flag: Menyajikan data metrik konkret (CTR, hook rate) secara suportif dan mendiskusikan ide bersama.\n🚩 Red Flag: Hanya memberikan komentar subjektif seperti "videonya jelek" tanpa landasan data analitik.'
          },
          {
            label: 'Pilihan B (Ketegasan Follow-Up Tanpa Merusak Relasi)',
            question: 'Bagaimana gaya komunikasi Anda saat melakukan follow-up tagihan komitmen atau materi kepada partner/influencer yang lambat merespon?',
            whatToLookFor: '🎯 Green Flag: Asertif, sopan namun tegas, dan mengingatkan kembali klausul target waktu bersama.\n🚩 Red Flag: Pasif mendiamkan atau sebaliknya terlalu kasar hingga merusak hubungan kerja sama.'
          }
        ]
      });
    } else if (roleCat === 'admin_recruitment') {
      questions.push({
        topic: 'Pelayanan Kandidat, Empati & Kepatuhan Prosedur',
        indicator: `Gaya DISC Tipe ${discPattern} • Komunikasi HR`,
        options: [
          {
            label: 'Pilihan A (Menyampaikan Keputusan Tidak Lolos Secara Humanis)',
            question: 'Bagaimana standar komunikasi Anda saat mengabari kandidat yang tidak lolos seleksi agar citra perusahaan (employer branding) tetap dipandang profesional dan hangat?',
            whatToLookFor: '🎯 Green Flag: Menggunakan template penolakan yang santun, memberikan apresiasi atas waktu kandidat, dan menjaga kerahasiaan data.\n🚩 Red Flag: Mengabaikan kandidat tanpa kabar (ghosting) atau membalas pertanyaan kandidat dengan ketus.'
          },
          {
            label: 'Pilihan B (Menghadapi Kandidat yang Menuntut / Agresif)',
            question: 'Bagaimana cara Anda menenangkan kandidat yang mendesak menanyakan hasil atau komplain terkait proses rekrutmen di WhatsApp?',
            whatToLookFor: '🎯 Green Flag: Ketenangan emosi, diplomasi sopan, dan penjelasan timeline yang jelas sesuai SOP.\n🚩 Red Flag: Terpancing berdebat atau memblokir kontak kandidat tanpa penjelasan.'
          }
        ]
      });
    } else if (roleCat === 'business_development') {
      if (isDominant) {
        questions.push({
          topic: 'Gaya Negosiasi & Dinamika Hubungan Klien',
          indicator: `Gaya DISC Tipe ${discPattern} (Dominance / Cepat & Berorientasi Target)`,
          options: [
            {
              label: 'Pilihan A (Menghadapi Klien Birokratis & Lambat)',
              question: 'Gaya kepribadian Anda sangat berorientasi pada target dan hasil cepat (Dominance). Bagaimana pendekatan diplomasi Anda saat berhadapan dengan prospek korporat besar yang proses birokrasinya berbelit-belit dan lambat mengambil keputusan?',
              whatToLookFor: '🎯 Green Flag: Kesabaran strategis, kepekaan diplomasi, serta seni membujuk tanpa terkesan memaksa atau agresif.\n🚩 Red Flag: Kehilangan kesabaran dan meninggalkan prospek potensial hanya karena proses birokrasi butuh waktu.'
            },
            {
              label: 'Pilihan B (Penyelarasan Target dengan Tim Operasional)',
              question: 'Dalam mengejar target omzet, sering kali tim BD mengalami friksi dengan tim operasional atau finance terkait batas kredit/syarat kerja sama. Bagaimana Anda memimpin keselarasan agar kesepakatan tetap jalan tanpa melanggar kepatuhan?',
              whatToLookFor: '🎯 Green Flag: Kepemimpinan kolaboratif, manajemen konflik internal, dan solusi win-win antar divisi.\n🚩 Red Flag: Mengabaikan resiko kepatuhan finance demi komisi atau angka penjualan pribadi.'
            }
          ]
        });
      } else if (isInfluential) {
        questions.push({
          topic: 'Persuasi, Networking & Manajemen Pipeline',
          indicator: `Gaya DISC Tipe ${discPattern} (Influence / Karismatik & Ekspresif)`,
          options: [
            {
              label: 'Pilihan A (Retensi Klien & Hubungan Jangka Panjang)',
              question: 'Anda memiliki kemampuan komunikasi interpersonal yang kuat (Influence). Bagaimana metode Anda mengonversi hubungan pertemanan kasual menjadi kontrak bisnis formal dan mempertahankannya jangka panjang?',
              whatToLookFor: '🎯 Green Flag: Kemampuan menjaga profesionalisme, account farming, dan membangun kepercayaan klien secara substantif.\n🚩 Red Flag: Hubungan akrab di awal tapi gagal mengeksekusi kontrak nyata.'
            },
            {
              label: 'Pilihan B (Disiplin Administrasi Penjualan & CRM)',
              question: 'Pribadi ekspresif sering kali sangat piawai di tahap pitching awal namun kurang telaten dalam dokumentasi CRM atau follow-up berkala. Bagaimana sistem kerja pribadi Anda agar tidak ada calon klien yang tercecer?',
              whatToLookFor: '🎯 Green Flag: Disiplin pelaporan pipeline harian, pengorganisasian data prospek, dan konsistensi follow-up berjadwal.\n🚩 Red Flag: Mengandalkan ingatan kepala tanpa mencatat status prospek di spreadsheet/CRM.'
            }
          ]
        });
      } else {
        questions.push({
          topic: 'Manajemen Kepercayaan Klien & Ketelitian Kontrak',
          indicator: `Gaya DISC Tipe ${discPattern}`,
          options: [
            {
              label: 'Pilihan A (Membangun Kepercayaan Klien Skeptis)',
              question: 'Bagaimana strategi pendekatan Anda saat mendekati calon mitra yang sudah terikat kontrak eksklusif dengan kompetitor?',
              whatToLookFor: '🎯 Green Flag: Daya tahan, analisis diferensiasi produk, dan kesabaran menanam benih kerja sama jangka panjang.\n🚩 Red Flag: Mudah menyerah saat pertama kali mendengar kata "sudah ada vendor lain".'
            },
            {
              label: 'Pilihan B (Kepatuhan Term of Payment & Legalitas)',
              question: 'Bagaimana cara Anda menyeimbangkan antara mengejar deal cepat dengan ketelitian memeriksa term of payment dan legalitas kontrak?',
              whatToLookFor: '🎯 Green Flag: Keseimbangan antara orientasi bisnis dengan kepatuhan manajemen risiko piutang.\n🚩 Red Flag: Ceroboh menyetujui termin pembayaran tanpa mengecek kredibilitas calon mitra.'
            }
          ]
        });
      }
    } else {
      questions.push({
        topic: 'Kolaborasi, Respon Arahan & Gaya Kerja Sama',
        indicator: `Gaya DISC Tipe ${discPattern}`,
        options: [
          {
            label: 'Pilihan A (Respon Terhadap Evaluasi & Revisi)',
            question: 'Sebagai pribadi yang berorientasi hasil, bagaimana respon profesional Anda jika hasil kerja Anda harus dirombak karena perubahan kebijakan internal manajer?',
            whatToLookFor: '🎯 Green Flag: Fleksibilitas ego, kemampuan mendengarkan masukan, dan kedewasaan menyikapi perubahan arah.\n🚩 Red Flag: Menolak perubahan atau menunjukkan sikap pasif-agresif.'
          },
          {
            label: 'Pilihan B (Manajemen Waktu & Tenggat Ketat)',
            question: 'Bagaimana cara pribadi Anda mengatur prioritas ketika beberapa proyek mendesak datang pada hari yang sama?',
            whatToLookFor: '🎯 Green Flag: Manajemen waktu konkret (Eisenhower Matrix), ketenangan eksekusi, dan kejelasan komunikasi status.\n🚩 Red Flag: Kebingungan menentukan prioritas dan kewalahan.'
          }
        ]
      });
    }

    /* ============================================================ */
    /* AXIS 3: BIG FIVE EMOTIONAL STABILITY, RESILIENCE & DISCIPLINE */
    /* ============================================================ */
    const emoPct = b5.emotionalStability ? b5.emotionalStability.percentage : 50;
    const consPct = b5.conscientiousness ? b5.conscientiousness.percentage : 50;
    const intPct = b5.intellect ? b5.intellect.percentage : 50;

    if (roleCat === 'live_streamer') {
      questions.push({
        topic: 'Resiliensi Menghadapi Komentar Negatif / Haters di Live',
        indicator: emoPct < 50 ? `Stabilitas Emosional Sensitif (${emoPct}%)` : `Stabilitas Emosional Tangguh (${emoPct}%)`,
        options: [
          {
            label: 'Pilihan A (Handling Trolls & Komentar Menyinggung)',
            question: 'Saat live stream, tidak jarang muncul penonton yang melontarkan komentar kasar, body shaming, atau menghina produk. Bagaimana cara Anda menjaga kestabilan senyum dan fokus tanpa terpancing berdebat di depan kamera?',
            whatToLookFor: '🎯 Green Flag: Kemampuan reframing situasi dengan lelucon santun, mengabaikan troll, atau mengarahkan moderator untuk memblokir tanpa merusak mood live.\n🚩 Red Flag: Terpancing emosi, membalas dengan nada marah, atau langsung mogok bicara.'
          },
          {
            label: 'Pilihan B (Menjaga Konsistensi Energi Saat Target Belum Tercapai)',
            question: 'Ketika live sudah berjalan 1.5 jam namun penjualan produk masih jauh di bawah target harian, bagaimana proses mental pribadi Anda agar energi di 30 menit terakhir tidak merosot?',
            whatToLookFor: '🎯 Green Flag: Mentalitas pantang menyerah, mencoba variasi angle promo baru hingga detik terakhir siaran.\n🚩 Red Flag: Menunjukkan raut wajah putus asa atau malas-malasan di sisa waktu siaran.'
          }
        ]
      });
    } else if (roleCat === 'video_editor' || roleCat === 'graphic_designer' || roleCat === 'content_creator') {
      questions.push({
        topic: 'Manajemen Stres Deadline & Ketahanan Menghadapi Revisi Kilat',
        indicator: emoPct < 50 ? `Stabilitas Emosional Sensitif (${emoPct}%)` : `Stabilitas Emosional Tangguh (${emoPct}%)`,
        options: [
          {
            label: 'Pilihan A (Situasi Rombak Desain/Video Menjelang Launching)',
            question: 'Ceritakan situasi ketika Anda harus merombak materi konten 1 jam sebelum jadwal tayang kampanye besar karena adanya perubahan kebijakan sponsor. Bagaimana Anda menjaga ketenangan dan fokus?',
            whatToLookFor: '🎯 Green Flag: Tetap tenang di bawah tekanan waktu mendesak, fokus mengeksekusi elemen terpenting terlebih dahulu.\n🚩 Red Flag: Panik berlebihan, mengeluh panjang lebar, atau menghasilkan file ekspor yang rusak/salah format.'
          },
          {
            label: 'Pilihan B (Mencegah Creative Burnout & Rutinitas)',
            question: 'Dalam memproduksi materi visual harian dengan ritme cepat, bagaimana cara Anda menjaga kesegaran ide agar tidak mengalami kebuntuan kreativitas (burnout)?',
            whatToLookFor: '🎯 Green Flag: Memiliki bank referensi visual aktif, kebiasaan belajar tren baru mandiri, dan manajemen waktu istirahat yang sehat.\n🚩 Red Flag: Pasrah saat ide mentok dan menyalin karya orang lain tanpa adaptasi.'
          }
        ]
      });
    } else if (roleCat === 'business_development') {
      if (emoPct < 50) {
        questions.push({
          topic: 'Resiliensi Menghadapi Penolakan & Tekanan Target Bulanan',
          indicator: `Stabilitas Emosional Sensitif (${emoPct}%)`,
          options: [
            {
              label: 'Pilihan A (Menghadapi Penolakan & Deal Lepas di Menit Akhir)',
              question: 'Dalam Business Development, pembatalan kesepakatan besar di menit-menit akhir sering terjadi. Ceritakan pengalaman Anda saat menghadapi penolakan terberat dan bagaimana proses pribadi Anda memulihkan motivasi kerja?',
              whatToLookFor: '🎯 Green Flag: Resiliensi mental, pemisahan emosi pribadi dari pekerjaan bisnis, dan keuletan mengejar target prospek berikutnya.\n🚩 Red Flag: Terpuruk berminggu-minggu atau menyalahkan keadaan saat target gagal tercapai.'
            },
            {
              label: 'Pilihan B (Mengelola Kecemasan di Bawah Tekanan Kuota)',
              question: 'Ketika batas waktu akhir bulan tersisa 3 hari dan Anda masih kekurangan 30% dari kuota omzet, bagaimana Anda mengelola kecemasan agar tetap berpikir jernih saat bernegosiasi?',
              whatToLookFor: '🎯 Green Flag: Regulasi emosi yang matang, ketenangan eksekusi, dan fokus pada actionable tactics.\n🚩 Red Flag: Menunjukkan kepanikan di depan calon klien hingga terlihat putus asa.'
            }
          ]
        });
      } else {
        questions.push({
          topic: 'Konsistensi Eksekusi & Daya Tahan Komersial Tinggi',
          indicator: `Stabilitas Emosional Tangguh (${emoPct}%)`,
          options: [
            {
              label: 'Pilihan A (Menghadapi Prospek Dingin yang Mengabaikan Pesan)',
              question: 'Bagaimana cara Anda mempertahankan antusiasme saat melakukan pendekatan ke puluhan prospek dingin (cold outreach) yang tidak memberikan respon selama berminggu-minggu?',
              whatToLookFor: '🎯 Green Flag: Disiplin konsistensi, kreativitas mencoba sudut pandang email/pesan baru, dan tidak mudah patah arang.\n🚩 Red Flag: Cepat bosan dan menghentikan proses follow-up setelah 1-2 kali tidak dibalas.'
            },
            {
              label: 'Pilihan B (De-Eskalasi Konflik Klien Kritis)',
              question: 'Ceritakan situasi ketika seorang klien marah besar karena kendala pengiriman atau sistem. Bagaimana langkah Anda menenangkan klien dan menyelamatkan kontrak kemitraan?',
              whatToLookFor: '🎯 Green Flag: Kematangan emosional, empati profesional, dan ketenangan merumuskan solusi win-win.\n🚩 Red Flag: Bersikap defensif dan saling melempar kesalahan ke divisi lain di depan klien.'
            }
          ]
        });
      }
    } else if (roleCat === 'marketplace_operations') {
      questions.push({
        topic: 'Ketenangan Menghadapi Komplain & Ketelitian Eksekusi Promo',
        indicator: `Stabilitas Emosional (${emoPct}%) • Ketelitian (${consPct}%)`,
        options: [
          {
            label: 'Pilihan A (Menangani Komplain Pembeli Agresif & Rating 1)',
            question: 'Ketika pembeli meluapkan kemarahan dengan kata-kata kasar di chat toko akibat kelalaian kurir, bagaimana Anda menenangkan situasi tanpa terpancing emosi dan berhasil mengubah rating bintang 1 menjadi bintang 5?',
            whatToLookFor: '🎯 Green Flag: Empati layanan pelanggan, respon cepat sesuai SOP ganti rugi/retur, dan keramahan yang tulus.\n🚩 Red Flag: Terpancing berdebat dengan pembeli di kolom ulasan publik toko.'
          },
          {
            label: 'Pilihan B (Sistem Double Check Input Harga Diskon Massal)',
            question: 'Bagaimana sistem pengecekan ganda Anda saat mengatur flash sale untuk ratusan SKU agar tidak terjadi kesalahan titik desimal harga yang merugikan perusahaan?',
            whatToLookFor: '🎯 Green Flag: Memiliki checklist teliti, simulasi pembelian akun demo, dan tanggung jawab penuh atas angka promosi.\n🚩 Red Flag: Mengisi diskon terburu-buru tanpa verifikasi ulang.'
          }
        ]
      });
    } else {
      if (emoPct < 50) {
        questions.push({
          topic: 'Manajemen Stres Kerja & Respon Kritik Profesional',
          indicator: `Stabilitas Emosional Sensitif (${emoPct}%)`,
          options: [
            {
              label: 'Pilihan A (Pemisahan Emosi Pribadi dari Kritik Tugas)',
              question: 'Kritik tajam atau feedback tidak memuaskan terhadap hasil kerja adalah hal lumrah dalam dunia profesional. Bagaimana cara pribadi Anda menjaga ketenangan mental agar fokus kerja tidak terganggu?',
              whatToLookFor: '🎯 Green Flag: Mampu memisahkan emosi pribadi dari pekerjaan profesional dan kedewasaan bersikap positif.\n🚩 Red Flag: Merasa diserang secara personal dan menyimpan dendam terhadap pemberi feedback.'
            },
            {
              label: 'Pilihan B (Menjaga Ritme Kerja di Bawah Tekanan Simultan)',
              question: 'Ketika ritme kerja menuntut beberapa deliverables mendesak secara bersamaan, bagaimana Anda menjaga diri agar tidak mengalami stres berlebih?',
              whatToLookFor: '🎯 Green Flag: Self-awareness tinggi, manajemen energi kerja teratur, dan komunikasi asertif bila membutuhkan bantuan tim.\n🚩 Red Flag: Menutup diri dan membiarkan pekerjaan terbengkalai.'
            }
          ]
        });
      } else {
        questions.push({
          topic: 'Inisiatif Belajar Mandiri & Peningkatan Kualitas Kerja',
          indicator: `Keterbukaan Ide & Belajar (${intPct}%)`,
          options: [
            {
              label: 'Pilihan A (Eksplorasi Metode / Tools Baru)',
              question: 'Tools atau metode baru apa yang baru-baru ini Anda pelajari secara mandiri dan berhasil Anda terapkan untuk mempercepat atau meningkatkan kualitas pekerjaan Anda?',
              whatToLookFor: '🎯 Green Flag: Rasa ingin tahu tinggi, self-directed learner, dan mampu menerapkan efisiensi secara nyata.\n🚩 Red Flag: Puas dengan cara lama dan enggan mempelajari tools teknologi baru.'
            },
            {
              label: 'Pilihan B (Berbagi Pengetahuan dengan Rekan Kerja)',
              question: 'Bagaimana cara Anda membagikan wawasan baru kepada rekan tim yang mungkin masih terbiasa dengan metode konvensional?',
              whatToLookFor: '🎯 Green Flag: Komunikasi persuasif, kerendahan hati intelektual, dan semangat kolaborasi tim.\n🚩 Red Flag: Merasa paling pintar atau enggan berbagi ilmu kepada rekan sejawat.'
            }
          ]
        });
      }
    }

    // Populate backward compatibility fields
    questions.forEach(q => {
      if (q.options && q.options.length > 0) {
        q.question = q.options[0].question;
        q.whatToLookFor = q.options[0].whatToLookFor;
      }
    });

    return questions;
  }

    /* ---------------------------------------------------- */
  /* 3. SIDE-BY-SIDE CANDIDATE COMPARISON STATE & MODAL   */
  /* ---------------------------------------------------- */
  const selectedCandidateIds = new Set();

  function toggleCandidateCompare(talentId, isChecked) {
    if (isChecked) {
      if (selectedCandidateIds.size >= 3) {
        alert('Maksimal membandingkan 3 kandidat sekaligus.');
        const cb = document.querySelector(`.compare-check-${talentId}`);
        if (cb) cb.checked = false;
        return;
      }
      selectedCandidateIds.add(talentId);
    } else {
      selectedCandidateIds.delete(talentId);
    }
    updateComparisonFloatingBar();
  }

  function clearCandidateComparison() {
    selectedCandidateIds.clear();
    document.querySelectorAll('.candidate-compare-checkbox').forEach(cb => {
      cb.checked = false;
    });
    updateComparisonFloatingBar();
  }

  function updateComparisonFloatingBar() {
    let bar = document.getElementById('comparisonFloatingBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'comparisonFloatingBar';
      bar.className = 'comparison-floating-bar';
      document.body.appendChild(bar);
    }

    const count = selectedCandidateIds.size;
    if (count < 2) {
      bar.style.display = 'none';
      return;
    }

    const names = Array.from(selectedCandidateIds).map(id => {
      const talent = (window.state && window.state.talents) ? window.state.talents.find(t => t.id === id) : null;
      return talent ? talent.name : id;
    }).join(' vs ');

    bar.innerHTML = `
      <div class="comparison-bar-content">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 18px;">⚖️</span>
          <div>
            <div style="font-weight: 700; font-size: 13px; color: #0F172A;">Bandingkan ${count} Kandidat</div>
            <div style="font-size: 11px; color: #64748B; max-width: 320px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              ${escapeHtml(names)}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="AssessmentExtensions.clearCandidateComparison()" style="font-size: 11px; padding: 5px 8px;">
            ✖ Batal
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="AssessmentExtensions.openComparisonModal()" style="font-size: 12px; font-weight: 700; padding: 6px 14px; background: #2563EB;">
            <span>Lihat Perbandingan Berdampingan ➔</span>
          </button>
        </div>
      </div>
    `;
    bar.style.display = 'block';
  }

  function renderOverlaidPentagonSvg(candidatesList) {
    const W = 540;
    const H = 340;
    const cx = 270;
    const cy = 165;
    const R = 90;

    const dims = [
      { key: 'extraversion', label: 'Extraversion', icon: '⚡' },
      { key: 'agreeableness', label: 'Agreeableness', icon: '🤝' },
      { key: 'conscientiousness', label: 'Conscientiousness', icon: '🎯' },
      { key: 'emotionalStability', label: 'Emotional Stability', icon: '🧘' },
      { key: 'intellect', label: 'Intellect / Openness', icon: '💡' }
    ];

    const angles = [0, 1, 2, 3, 4].map(i => -Math.PI / 2 + (i * 2 * Math.PI / 5));

    // Rings
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
    let ringsSvg = '';
    rings.forEach((scale, idx) => {
      const pts = angles.map(a => (cx + Math.cos(a) * R * scale).toFixed(1) + ',' + (cy + Math.sin(a) * R * scale).toFixed(1)).join(' ');
      const isOuter = (idx === rings.length - 1);
      ringsSvg += `<polygon points="${pts}" fill="${idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}" stroke="${isOuter ? '#94A3B8' : '#E2E8F0'}" stroke-width="${isOuter ? '1.5' : '1'}" />`;
    });

    // Spokes
    let spokesSvg = '';
    angles.forEach(a => {
      const x2 = (cx + Math.cos(a) * R).toFixed(1);
      const y2 = (cy + Math.sin(a) * R).toFixed(1);
      spokesSvg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="2 2" />`;
    });

    // Axis Labels
    const labelOffsets = [
      { x: 0, y: -16, align: 'middle' },
      { x: 10, y: -2, align: 'start' },
      { x: 8, y: 14, align: 'start' },
      { x: -8, y: 14, align: 'end' },
      { x: -10, y: -2, align: 'end' }
    ];

    let labelsSvg = '';
    dims.forEach((d, i) => {
      const outerX = cx + Math.cos(angles[i]) * (R + 10);
      const outerY = cy + Math.sin(angles[i]) * (R + 10);
      const off = labelOffsets[i];
      labelsSvg += `
        <g transform="translate(${outerX + off.x}, ${outerY + off.y})">
          <text text-anchor="${off.align}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#0F172A">
            ${d.icon} ${d.label}
          </text>
        </g>
      `;
    });

    // Color palettes for up to 3 candidates
    const palette = [
      { stroke: '#2563EB', fill: '#3B82F6', fillOpacity: '0.22', dot: '#1D4ED8' },
      { stroke: '#D97706', fill: '#F59E0B', fillOpacity: '0.22', dot: '#B45309' },
      { stroke: '#059669', fill: '#10B981', fillOpacity: '0.22', dot: '#047857' }
    ];

    let candidatePolygonsSvg = '';
    candidatesList.forEach((c, idx) => {
      const color = palette[idx % palette.length];
      const b5 = c.assessment.dimensions || c.assessment.scores || {};
      const pts = dims.map((d, i) => {
        const dataObj = b5[d.key];
        const pct = dataObj ? Math.max(10, Math.min(100, dataObj.percentage || 50)) : 50;
        const r = (pct / 100) * R;
        const x = cx + Math.cos(angles[i]) * r;
        const y = cy + Math.sin(angles[i]) * r;
        return { x, y };
      });

      const polyPoints = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      const dots = pts.map(p => `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="${color.stroke}" stroke="#FFFFFF" stroke-width="1.5" />
      `).join('');

      candidatePolygonsSvg += `
        <polygon points="${polyPoints}" fill="${color.fill}" fill-opacity="${color.fillOpacity}" stroke="${color.stroke}" stroke-width="2.5" stroke-linejoin="round" />
        ${dots}
      `;
    });

    return `
      <svg viewBox="0 0 ${W} ${H}" style="width: 100%; max-width: 500px; height: auto; display: block; margin: 0 auto; overflow: visible;" xmlns="http://www.w3.org/2000/svg">
        ${ringsSvg}
        ${spokesSvg}
        ${labelsSvg}
        ${candidatePolygonsSvg}
      </svg>
    `;
  }

  function openComparisonModal() {
    const list = [];
    const state = window.state || {};
    selectedCandidateIds.forEach(id => {
      const talent = (state.talents || []).find(t => t.id === id);
      const assessment = (state.assessments && state.assessments[id]) || (talent ? talent.assessment : null);
      if (talent && assessment) {
        list.push({ talent, assessment, fit: calculateRoleFitScore(talent, assessment) });
      }
    });

    if (list.length < 2) {
      alert('Pilih minimal 2 kandidat yang telah menyelesaikan tes.');
      return;
    }

    const palette = [
      { name: 'Kandidat 1', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
      { name: 'Kandidat 2', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
      { name: 'Kandidat 3', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' }
    ];

    let modal = document.getElementById('candidateComparisonModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'candidateComparisonModal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const overlaidSvg = renderOverlaidPentagonSvg(list);

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 960px; width: 95%; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <div>
            <h2 style="font-size: 17px; font-weight: 700; color: #0F172A; display: flex; align-items: center; gap: 8px;">
              <span>⚖️</span> Komparasi Kandidat Berdampingan (Side-by-Side)
            </h2>
            <p style="font-size: 12.5px; color: #64748B; margin-top: 2px;">
              Membandingkan ${list.length} kandidat finalis secara objektif berdasarkan penalaran, kepribadian Big Five, dan gaya kerja DISC.
            </p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="AssessmentExtensions.closeComparisonModal()" style="font-size: 16px; padding: 4px 10px;">✕</button>
        </div>

        <div class="modal-body" style="padding: 18px 24px;">
          <!-- Legend Bar -->
          <div style="display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;">
            ${list.map((item, idx) => `
              <div style="flex: 1; min-width: 220px; background: ${palette[idx].bg}; border: 1.5px solid ${palette[idx].border}; padding: 10px 14px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${palette[idx].color};"></span>
                    <strong style="font-size: 13.5px; color: #0F172A;">${escapeHtml(item.talent.name)}</strong>
                  </div>
                  <div style="font-size: 11px; color: #64748B; margin-top: 2px; font-family: var(--font-mono);">
                    ${item.talent.id} • ${escapeHtml(item.talent.role || 'Freelance Content Creator')}
                  </div>
                </div>
                ${item.fit ? `
                  <div style="text-align: right;">
                    <div style="font-size: 10px; color: #64748B;">Role Match</div>
                    <div style="font-size: 13px; font-weight: 800; color: ${palette[idx].color}; font-family: var(--font-mono);">${item.fit.score}%</div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Radar Matrix Overlay Subcard -->
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 700; font-size: 13px; color: #0F172A;">🧠 Overlaid Pentagon Spider Web (Big Five Matrix)</span>
              <span style="font-size: 11px; color: #64748B;">Grafik bertumpuk untuk melihat celah kekuatan karakter</span>
            </div>
            ${overlaidSvg}
          </div>

          <!-- Side-by-Side Matrix Table -->
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
            <table class="leaderboard-table" style="margin: 0; width: 100%;">
              <thead>
                <tr>
                  <th style="width: 220px;">Dimensi Asesmen</th>
                  ${list.map((item, idx) => `
                    <th style="color: ${palette[idx].color}; font-weight: 700;">
                      ${escapeHtml(item.talent.name)} (${item.talent.id})
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 600; color: #334155;">🎯 Role Match Fit Score</td>
                  ${list.map(item => `
                    <td>
                      ${item.fit ? `
                        <span style="display: inline-block; font-family: var(--font-mono); font-size: 12px; font-weight: 800; background: ${item.fit.badgeBg}; color: ${item.fit.badgeColor}; border: 1px solid ${item.fit.badgeBorder}; padding: 2px 8px; border-radius: 6px;">
                          ${item.fit.score}% (${item.fit.label})
                        </span>
                      ` : '-'}
                    </td>
                  `).join('')}
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #334155;">📊 Skor Logika &amp; Bisnis</td>
                  ${list.map(item => {
                    const cog = item.assessment.cognitive || {};
                    return `
                      <td>
                        <div style="font-family: var(--font-mono); font-weight: 700; font-size: 13px; color: #0F172A;">
                          ${cog.score !== undefined ? cog.score : 0} / ${cog.total || 15} (${cog.percentage || 0}%)
                        </div>
                      </td>
                    `;
                  }).join('')}
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #334155;">🧩 Gaya Kerja DISC</td>
                  ${list.map(item => {
                    const disc = item.assessment.disc || {};
                    return `
                      <td>
                        <strong style="color: #7C3AED; font-family: var(--font-mono); font-size: 12.5px;">
                          Tipe ${disc.profilePattern || '-'}
                        </strong>
                        <div style="font-size: 11px; color: #6D28D9;">${escapeHtml(disc.primaryName || '')}</div>
                      </td>
                    `;
                  }).join('')}
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #334155;">💡 Openness / Intellect</td>
                  ${list.map(item => {
                    const b5 = item.assessment.dimensions || item.assessment.scores || {};
                    const val = b5.intellect ? b5.intellect.percentage : 0;
                    return `<td><strong style="color: #1E40AF; font-family: var(--font-mono);">${val}%</strong></td>`;
                  }).join('')}
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #334155;">🎯 Conscientiousness</td>
                  ${list.map(item => {
                    const b5 = item.assessment.dimensions || item.assessment.scores || {};
                    const val = b5.conscientiousness ? b5.conscientiousness.percentage : 0;
                    return `<td><strong style="color: #1E40AF; font-family: var(--font-mono);">${val}%</strong></td>`;
                  }).join('')}
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #334155;">⚡ Extraversion</td>
                  ${list.map(item => {
                    const b5 = item.assessment.dimensions || item.assessment.scores || {};
                    const val = b5.extraversion ? b5.extraversion.percentage : 0;
                    return `<td><strong style="color: #1E40AF; font-family: var(--font-mono);">${val}%</strong></td>`;
                  }).join('')}
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #334155;">🤝 Agreeableness</td>
                  ${list.map(item => {
                    const b5 = item.assessment.dimensions || item.assessment.scores || {};
                    const val = b5.agreeableness ? b5.agreeableness.percentage : 0;
                    return `<td><strong style="color: #1E40AF; font-family: var(--font-mono);">${val}%</strong></td>`;
                  }).join('')}
                </tr>
                <tr>
                  <td style="font-weight: 600; color: #334155;">🧘 Emotional Stability</td>
                  ${list.map(item => {
                    const b5 = item.assessment.dimensions || item.assessment.scores || {};
                    const val = b5.emotionalStability ? b5.emotionalStability.percentage : 0;
                    return `<td><strong style="color: #1E40AF; font-family: var(--font-mono);">${val}%</strong></td>`;
                  }).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer" style="padding: 12px 24px; display: flex; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" onclick="AssessmentExtensions.closeComparisonModal()">Tutup Komparasi</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function closeComparisonModal() {
    const modal = document.getElementById('candidateComparisonModal');
    if (modal) modal.style.display = 'none';
  }

  /* ---------------------------------------------------- */
  /* 4. QUICK STAGE ACTION (DIRECT FIREBASE RTDB UPDATE)   */
  /* ---------------------------------------------------- */
  function toggleStageMenu(talentId, event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById(`stageMenu_${talentId}`);
    if (!menu) return;

    // Close any other open menus
    document.querySelectorAll('.stage-menu.open').forEach(m => {
      if (m !== menu) m.classList.remove('open');
    });

    menu.classList.toggle('open');
  }

  function updateCandidateStageDirectly(talentId, newStage, event) {
    if (event) event.stopPropagation();
    if (!talentId || !newStage) return;

    const state = window.state || {};
    const talent = (state.talents || []).find(t => t.id === talentId || t.$id === talentId);
    const candidateName = talent ? talent.name : talentId;

    if (talent) {
      talent.stage = newStage;
    }
    if (typeof window.renderCandidates === 'function') {
      window.renderCandidates();
    }
    showToastNotification(`✓ Tahap ${candidateName} diubah menjadi "${newStage}"`);

    // Direct Firebase RTDB update
    if (typeof firebase !== 'undefined' && firebase.database) {
      const rtdb = firebase.database();
      rtdb.ref('/talents/' + talentId).update({
        stage: newStage,
        stageUpdatedAt: Date.now()
      }).catch(err => {
        console.error('Error updating stage in Firebase:', err);
      });
    }

    // Direct Appwrite Cloud sync
    if (typeof databases !== 'undefined' && typeof APPWRITE_CONFIG !== 'undefined') {
      const docId = (talent && (talent.appwriteId || talent.$id)) || (talentId || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      databases.updateDocument(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collectionId, docId, {
        stage: newStage
      }).catch(err => {
        console.warn('Appwrite direct stage sync warning:', err);
      });
    }
  }

  /* ---------------------------------------------------- */
  /* 5. SMART WHATSAPP TEMPLATE MODAL & SENDER            */
  /* ---------------------------------------------------- */
  function getCandidatePhone(talent) {
    if (!talent) return '';
    return talent.phone || talent.telepon || talent.noHp || talent.whatsapp || talent.kontak || '';
  }

  function formatIndonesianPhone(raw) {
    if (!raw) return '';
    let cleaned = String(raw).replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  }

  function openWhatsAppModal(talentId, event) {
    if (event) event.stopPropagation();

    const state = window.state || {};
    const talent = (state.talents || []).find(t => t.id === talentId);
    if (!talent) return;

    const assessment = (state.assessments && state.assessments[talentId]) || talent.assessment || {};
    const rawPhone = getCandidatePhone(talent);
    const cleanPhone = formatIndonesianPhone(rawPhone);

    let modal = document.getElementById('whatsAppTemplateModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'whatsAppTemplateModal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const fit = calculateRoleFitScore(talent, assessment);
    const fitStr = fit ? `${fit.score}% (${fit.label})` : 'Selesai Terasesmen';

    // Preset Templates
    const templates = {
      interview: `Halo ${talent.name},\n\nSelamat! Berdasarkan hasil asesmen posisi *${talent.role || 'Freelance Content Creator'}* di PGE Talent Pool, kami mengundang Anda untuk mengikuti sesi *Wawancara (Interview)*.\n\n📅 Hari/Tanggal: [Isi Tanggal]\n⏰ Waktu: [Isi Jam] WIB\n📍 Lokasi/Link: [Kantor PGE / Google Meet]\n\nMohon konfirmasi ketersediaan Anda dengan membalas pesan ini. Terima kasih!`,
      passed: `Halo ${talent.name},\n\nTerima kasih telah menyelesaikan seluruh rangkaian tes asesmen on-site di PGE Talent Pool untuk posisi *${talent.role || 'Freelance Content Creator'}*.\n\nHasil tes Anda telah berhasil direkam ke sistem evaluasi tim rekruter kami (${fitStr}). Kami akan segera mengabari tahapan seleksi selanjutnya. Sukses selalu!`,
      custom: `Halo ${talent.name}, terkait proses seleksi di PGE Talent Pool...`
    };

    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px; width: 92%;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">💬</span>
            <div>
              <h3 style="font-size: 15px; font-weight: 700; color: #0F172A; margin: 0;">Kirim WhatsApp ke Kandidat</h3>
              <div style="font-size: 11px; color: #64748B;">${escapeHtml(talent.name)} (${talent.id})</div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="AssessmentExtensions.closeWhatsAppModal()" style="font-size: 14px; padding: 2px 8px;">✕</button>
        </div>

        <div class="modal-body" style="padding: 16px 20px;">
          <div style="margin-bottom: 12px;">
            <label style="font-size: 11.5px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">
              Nomor WhatsApp Kandidat:
            </label>
            <input type="text" id="waRecipientPhone" value="${cleanPhone}" placeholder="Contoh: 628123456789" style="width: 100%; padding: 8px 10px; border: 1px solid #CBD5E1; border-radius: 6px; font-family: var(--font-mono); font-size: 13px;">
          </div>

          <div style="margin-bottom: 12px;">
            <label style="font-size: 11.5px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">
              Pilih Template Pesan:
            </label>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn btn-secondary btn-sm active" id="btnTplInterview" onclick="AssessmentExtensions.switchWaTemplate('interview')" style="font-size: 11px; padding: 4px 8px;">
                🎙️ Undangan Wawancara
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btnTplPassed" onclick="AssessmentExtensions.switchWaTemplate('passed')" style="font-size: 11px; padding: 4px 8px;">
                ✓ Lolos Asesmen
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btnTplCustom" onclick="AssessmentExtensions.switchWaTemplate('custom')" style="font-size: 11px; padding: 4px 8px;">
                ✏️ Kustom
              </button>
            </div>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="font-size: 11.5px; font-weight: 700; color: #334155; display: block; margin-bottom: 4px;">
              Isi Pesan WhatsApp:
            </label>
            <textarea id="waMessageBody" rows="7" style="width: 100%; padding: 10px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 12.5px; line-height: 1.45; resize: vertical;">${templates.interview}</textarea>
          </div>
        </div>

        <div class="modal-footer" style="padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="AssessmentExtensions.closeWhatsAppModal()">Batal</button>
          <button type="button" class="btn btn-primary" onclick="AssessmentExtensions.sendWhatsAppMessage()" style="background: #16A34A; border-color: #15803D; font-size: 12.5px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
            <span>💬 Buka WhatsApp ↗</span>
          </button>
        </div>
      </div>
    `;

    modal.dataset.templateInterview = templates.interview;
    modal.dataset.templatePassed = templates.passed;
    modal.dataset.templateCustom = templates.custom;
    modal.style.display = 'flex';
  }

  function switchWaTemplate(tplKey) {
    const modal = document.getElementById('whatsAppTemplateModal');
    const textarea = document.getElementById('waMessageBody');
    if (!modal || !textarea) return;

    if (tplKey === 'interview') textarea.value = modal.dataset.templateInterview || '';
    if (tplKey === 'passed') textarea.value = modal.dataset.templatePassed || '';
    if (tplKey === 'custom') textarea.value = modal.dataset.templateCustom || '';

    ['btnTplInterview', 'btnTplPassed', 'btnTplCustom'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(tplKey === 'interview' ? 'btnTplInterview' : (tplKey === 'passed' ? 'btnTplPassed' : 'btnTplCustom'));
    if (activeBtn) activeBtn.classList.add('active');
  }

  function sendWhatsAppMessage() {
    const phoneInput = document.getElementById('waRecipientPhone');
    const textInput = document.getElementById('waMessageBody');
    if (!phoneInput || !textInput) return;

    let phone = formatIndonesianPhone(phoneInput.value.trim());
    const msg = textInput.value.trim();

    if (!phone) {
      alert('Mohon masukkan nomor WhatsApp tujuan yang valid.');
      phoneInput.focus();
      return;
    }
    if (!msg) {
      alert('Pesan tidak boleh kosong.');
      return;
    }

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    closeWhatsAppModal();
  }

  function closeWhatsAppModal() {
    const modal = document.getElementById('whatsAppTemplateModal');
    if (modal) modal.style.display = 'none';
  }

  /* ---------------------------------------------------- */
  /* 6. TOAST NOTIFICATION UTILITY                        */
  /* ---------------------------------------------------- */
  function showToastNotification(msg) {
    let toast = document.getElementById('extToastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'extToastNotification';
      toast.className = 'ext-toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3500);
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

  // Close stage dropdown when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.stage-menu.open').forEach(m => m.classList.remove('open'));
  });

  // Export to window
    function switchProbeTab(talentId, qIdx, optIdx) {
    const panels = document.querySelectorAll(`[id^="probePanel_${talentId}_${qIdx}_"]`);
    panels.forEach((p, idx) => {
      p.style.display = (idx === optIdx) ? 'block' : 'none';
    });
    
    // Toggle active pill button styling
    const btn0 = document.querySelector(`.probe-pill-${talentId}-${qIdx}-0`);
    const btn1 = document.querySelector(`.probe-pill-${talentId}-${qIdx}-1`);
    if (btn0 && btn1) {
      if (optIdx === 0) {
        btn0.style.background = '#FFFFFF';
        btn0.style.color = '#4338CA';
        btn0.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
        btn1.style.background = 'transparent';
        btn1.style.color = '#64748B';
        btn1.style.boxShadow = 'none';
      } else {
        btn1.style.background = '#FFFFFF';
        btn1.style.color = '#4338CA';
        btn1.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
        btn0.style.background = 'transparent';
        btn0.style.color = '#64748B';
        btn0.style.boxShadow = 'none';
      }
    }
  }

    function switchCandidateDossierTab(talentId, tabName) {
    const btnDetails = document.getElementById(`dossierTabBtn_details_${talentId}`);
    const btnInterview = document.getElementById(`dossierTabBtn_interview_${talentId}`);
    const panelDetails = document.getElementById(`dossierPanel_details_${talentId}`);
    const panelInterview = document.getElementById(`dossierPanel_interview_${talentId}`);

    if (tabName === 'interview') {
      if (panelDetails) panelDetails.style.display = 'none';
      if (panelInterview) panelInterview.style.display = 'block';
      if (btnDetails) {
        btnDetails.style.background = 'transparent';
        btnDetails.style.color = '#64748B';
        btnDetails.style.boxShadow = 'none';
      }
      if (btnInterview) {
        btnInterview.style.background = '#FFFFFF';
        btnInterview.style.color = '#4338CA';
        btnInterview.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }
    } else {
      if (panelDetails) panelDetails.style.display = 'block';
      if (panelInterview) panelInterview.style.display = 'none';
      if (btnDetails) {
        btnDetails.style.background = '#FFFFFF';
        btnDetails.style.color = '#1E40AF';
        btnDetails.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }
      if (btnInterview) {
        btnInterview.style.background = 'transparent';
        btnInterview.style.color = '#64748B';
        btnInterview.style.boxShadow = 'none';
      }
    }
  }

  // Also bind to window directly for inline HTML onclicks
  window.switchCandidateDossierTab = switchCandidateDossierTab;
  window.isCognitiveTested = isCognitiveTested;
  window.formatBigFiveTraitName = formatBigFiveTraitName;
  window.getSharpenedBigFiveTraitDescription = getSharpenedBigFiveTraitDescription;

  window.AssessmentExtensions = {
    isCognitiveTested,
    formatBigFiveTraitName,
    getSharpenedBigFiveTraitDescription,
    calculateRoleFitScore,
    generateInterviewProbeQuestions,
    switchProbeTab,
    switchCandidateDossierTab,
    toggleCandidateCompare,
    clearCandidateComparison,
    openComparisonModal,
    closeComparisonModal,
    toggleStageMenu,
    updateCandidateStageDirectly,
    openWhatsAppModal,
    closeWhatsAppModal,
    switchWaTemplate,
    sendWhatsAppMessage,
    showToastNotification
  };

})();
