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
    const cogPct = (assessment.cognitive && typeof assessment.cognitive.percentage === 'number')
      ? assessment.cognitive.percentage
      : 50;

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

    // 4. Overall Weighted Fit Score
    const totalScore = Math.round(
      (cogPct * benchmark.weights.cognitive) +
      (b5Score * benchmark.weights.bigFive) +
      (discScore * benchmark.weights.disc)
    );

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
        cognitive: cogPct,
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
  if (/business|bd|sales|account executive|partnership|komersial|commercial|crm|marketing/i.test(r)) {
    return 'business_development';
  }
  if (/marketplace|tokopedia|shopee|lazada|tiktok shop|operation|operasional|admin|logistik|inventory|supply/i.test(r)) {
    return 'marketplace_operations';
  }
  if (/creator|content|kreator|video|desain|design|creative|copywriter|animat|editor/i.test(r)) {
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

  // 1. Cognitive & Decision-Making Probing
  const cogPct = cog.percentage !== undefined ? cog.percentage : 60;
  const wrongItems = (cog.items || []).filter(it => !it.isCorrect);

  if (roleCat === 'business_development') {
    if (wrongItems.length > 0) {
      questions.push({
        topic: 'Pengambilan Keputusan di Bawah Ketidakpastian Pasar',
        indicator: `Skor Logika ${cogPct}% • Evaluasi Kasus Data`,
        options: [
          {
            label: 'Pilihan A (Toleransi Ambiguitas & Deal Speed)',
            question: 'Dalam studi kasus kognitif, Anda cenderung menunggu data laporan lengkap dibanding langsung mengamankan stok saat terjadi lonjakan 300%. Dalam dunia Business Development riil, bagaimana Anda menyeimbangkan antara kehati-hatian memverifikasi data dengan kecepatan mengeksekusi kesepakatan (deal speed) agar momentum pasar tidak hilang?',
            whatToLookFor: 'Melihat keberanian mengambil calculated risk dan ketangkasan komersial tanpa terjebak dalam kelumpuhan analisis (analysis paralysis).'
          },
          {
            label: 'Pilihan B (Prioritas Pipeline & Alokasi Waktu)',
            question: 'Ketika Anda memiliki beberapa prospek kemitraan besar sekaligus di tengah keterbatasan kapasitas operasional perusahaan, parameter data apa yang Anda gunakan untuk menentukan akun mana yang harus diprioritaskan terlebih dahulu?',
            whatToLookFor: 'Kecakapan mengkalkulasi deal value, probability to close, dan keselarasan dengan kapasitas pemenuhan perusahaan.'
          }
        ]
      });
    } else {
      questions.push({
        topic: 'Strategi Pertumbuhan & Negosiasi Komersial',
        indicator: `Skor Logika Tinggi (${cogPct}%)`,
        options: [
          {
            label: 'Pilihan A (Proteksi Margin vs Perang Harga)',
            question: 'Ketika calon klien institusi atau mitra bisnis menuntut diskon harga agresif yang berpotensi memangkas margin keuntungan perusahaan, strategi komersial dan penawaran nilai tambah apa yang Anda ajukan agar kesepakatan tetap tercapai tanpa perang harga?',
            whatToLookFor: 'Kemampuan value-based selling, pembelaan margin keuntungan, dan negosiasi skema non-moneter.'
          },
          {
            label: 'Pilihan B (Sensing Peluang Pasar Baru)',
            question: 'Bagaimana pendekatan analitis Anda dalam mengidentifikasi segmen pasar atau channel kemitraan baru yang belum digarap oleh kompetitor sejenis?',
            whatToLookFor: 'Visi komersial proaktif, riset pasar mandiri, dan kemampuan merumuskan penawaran kemitraan yang terstruktur.'
          }
        ]
      });
    }
  } else if (roleCat === 'marketplace_operations') {
    questions.push({
      topic: 'Diagnostik Masalah & Efisiensi Operasional Toko',
      indicator: `Skor Logika ${cogPct}% • Analisis Marketplace`,
      options: [
        {
          label: 'Pilihan A (Diagnostik Penurunan Performa Iklan)',
          question: 'Jika Return on Ad Spend (ROAS) toko mendadak drop dari 4.5x ke 1.8x di saat CPC stabil, urutan metrik apa saja yang pertama kali Anda audit untuk mengisolasi akar masalahnya?',
          whatToLookFor: 'Kemampuan berpikir struktural dalam membedah conversion rate, visual produk, harga promo, atau review pembeli.'
        },
        {
          label: 'Pilihan B (Mitigasi Risiko Overselling di Mega-Sale)',
          question: 'Bagaimana SOP Anda dalam mengantisipasi kehabisan stok fisik (overselling) menjelang kampanye besar (seperti Payday/11.11) agar tidak terkena penalti poin keterlambatan marketplace?',
          whatToLookFor: 'Kedisiplinan sinkronisasi stok multi-channel dan mitigasi risiko logistik.'
        }
      ]
    });
  } else if (roleCat === 'content_creator') {
    questions.push({
      topic: 'Penyelarasan Bisnis & Kreativitas Konten',
      indicator: `Skor Logika ${cogPct}% • Kreativitas Konten`,
      options: [
        {
          label: 'Pilihan A (Estetika vs Objektif Konversi)',
          question: 'Sebagai kreator, bagaimana cara Anda menyeimbangkan antara estetika visual konten yang disukai netizen dengan tujuan call-to-action (CTA) konversi penjualan produk perusahaan?',
          whatToLookFor: 'Kemampuan menerjemahkan objektif komersial ke dalam visual menarik tanpa terkesan hard-selling.'
        },
        {
          label: 'Pilihan B (Evaluasi Drop Retensi Penonton)',
          question: 'Ketika sebuah video mengalami drop retensi drastis di 3 detik pertama, langkah apa yang Anda lakukan untuk mengevaluasi hook audio-visual dan merombak formatnya?',
          whatToLookFor: 'Kemampuan membaca data analitik video dan fleksibilitas memperbaiki konsep.'
        }
      ]
    });
  } else {
    questions.push({
      topic: 'Pemecahan Masalah & Pendekatan Berbasis Data',
      indicator: `Skor Logika ${cogPct}%`,
      options: [
        {
          label: 'Pilihan A (Keputusan Berbasis Data)',
          question: 'Ceritakan satu contoh kasus kerja di mana data lapangan bertolak belakang dengan intuisi awal Anda. Tindakan apa yang Anda ambil?',
          whatToLookFor: 'Objektivitas, integritas data, dan kemampuan mengubah haluan keputusan secara rasional.'
        },
        {
          label: 'Pilihan B (Efisiensi Alur Kerja)',
          question: 'Bagaimana cara Anda mengidentifikasi inefisiensi atau bottleneck dalam alur kerja harian dan merumuskan solusinya?',
          whatToLookFor: 'Inisiatif continuous improvement dan orientasi efisiensi kerja.'
        }
      ]
    });
  }

  // 2. DISC Behavioral Probing
  const discPattern = (disc.profilePattern || '').toUpperCase();
  if (roleCat === 'business_development') {
    if (discPattern.startsWith('D')) {
      questions.push({
        topic: 'Gaya Negosiasi & Dinamika Hubungan Klien',
        indicator: `Gaya DISC Tipe ${discPattern} (Dominance / Cepat & Berorientasi Target)`,
        options: [
          {
            label: 'Pilihan A (Menghadapi Klien Birokratis & Lambat)',
            question: 'Gaya kepribadian Anda sangat berorientasi pada target dan hasil cepat (Dominance). Bagaimana pendekatan diplomasi Anda saat berhadapan dengan prospek korporat besar yang proses birokrasinya berbelit-belit dan lambat mengambil keputusan?',
            whatToLookFor: 'Kesabaran strategis, kepekaan diplomasi, serta seni membujuk tanpa terkesan memaksa atau agresif.'
          },
          {
            label: 'Pilihan B (Penyelarasan Target Internal)',
            question: 'Dalam mengejar target omzet yang menantang, sering kali tim BD mengalami friksi dengan tim operasional atau finance terkait batas kredit/syarat kerja sama. Bagaimana Anda memimpin keselarasan agar kesepakatan tetap jalan tanpa melanggar kepatuhan?',
            whatToLookFor: 'Kepemimpinan kolaboratif, manajemen konflik internal, dan solusi win-win antar divisi.'
          }
        ]
      });
    } else if (discPattern.startsWith('I')) {
      questions.push({
        topic: 'Persuasi, Networking & Manajemen Pipeline',
        indicator: `Gaya DISC Tipe ${discPattern} (Influence / Karismatik & Ekspresif)`,
        options: [
          {
            label: 'Pilihan A (Retensi Klien & Hubungan Jangka Panjang)',
            question: 'Anda memiliki kemampuan komunikasi interpersonal yang kuat (Influence). Bagaimana metode Anda mengonversi hubungan pertemanan kasual menjadi kontrak bisnis formal dan mempertahankannya jangka panjang?',
            whatToLookFor: 'Kemampuan menjaga profesionalisme, account farming, dan membangun kepercayaan klien.'
          },
          {
            label: 'Pilihan B (Disiplin Administrasi Penjualan)',
            question: 'Pribadi ekspresif sering kali sangat piawai di tahap pitching awal namun kurang telaten dalam dokumentasi CRM atau follow-up berkala. Bagaimana sistem kerja pribadi Anda agar tidak ada calon klien yang tercecer?',
            whatToLookFor: 'Disiplin pelaporan pipeline, pengorganisasian data prospek, dan konsistensi follow-up.'
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
            whatToLookFor: 'Daya tahan, analisis diferensiasi produk, dan kesabaran menanam benih kerja sama.'
          },
          {
            label: 'Pilihan B (Kepatuhan Term of Payment)',
            question: 'Bagaimana cara Anda menyeimbangkan antara mengejar deal cepat dengan ketelitian memeriksa term of payment dan legalitas kontrak?',
            whatToLookFor: 'Keseimbangan antara orientasi bisnis dengan kepatuhan manajemen risiko.'
          }
        ]
      });
    }
  } else if (roleCat === 'marketplace_operations') {
    questions.push({
      topic: 'Manajemen Beban Kerja & Koordinasi Tim Operasional',
      indicator: `Gaya DISC Tipe ${discPattern}`,
      options: [
        {
          label: 'Pilihan A (Situasi Darurat Lonjakan Pesanan)',
          question: 'Ketika pesanan melonjak drastis dan tim gudang kewalahan, bagaimana gaya komunikasi Anda membagi peran kerja agar pesanan terkirim sebelum cut-off?',
          whatToLookFor: 'Ketenangan memimpin, ketegasan membagi tugas, dan orientasi penyelesaian masalah.'
        },
        {
          label: 'Pilihan B (Kolaborasi Antar Divisi Ekspedisi)',
          question: 'Bagaimana cara Anda mengelola relasi harian dengan kurir pick-up agar paket toko selalu diprioritaskan keberangkatannya?',
          whatToLookFor: 'Kecakapan koordinasi operasional dan networking informal di level lapangan.'
        }
      ]
    });
  } else {
    // Content Creator / General fallback
    questions.push({
      topic: 'Kolaborasi & Respon Terhadap Arahan Tim',
      indicator: `Gaya DISC Tipe ${discPattern}`,
      options: [
        {
          label: 'Pilihan A (Respon Terhadap Evaluasi & Revisi)',
          question: 'Sebagai pribadi yang berorientasi hasil, bagaimana respon profesional Anda jika hasil kerja Anda harus dirombak karena arahan kebijakan internal manajer?',
          whatToLookFor: 'Fleksibilitas ego, kemampuan mendengarkan, dan kedewasaan menyikapi masukan.'
        },
        {
          label: 'Pilihan B (Manajemen Waktu & Tenggat Ketat)',
          question: 'Bagaimana cara pribadi Anda mengatur prioritas ketika beberapa proyek mendesak datang pada hari yang sama?',
          whatToLookFor: 'Manajemen waktu konkret, ketenangan eksekusi, dan kejelasan komunikasi status.'
        }
      ]
    });
  }

  // 3. Big Five Personality Probing
  const emoPct = b5.emotionalStability ? b5.emotionalStability.percentage : 50;
  const consPct = b5.conscientiousness ? b5.conscientiousness.percentage : 50;

  if (roleCat === 'business_development') {
    if (emoPct < 50) {
      questions.push({
        topic: 'Resiliensi Menghadapi Penolakan & Tekanan Target',
        indicator: `Stabilitas Emosional Sensitif (${emoPct}%)`,
        options: [
          {
            label: 'Pilihan A (Menghadapi Penolakan & Deal Lepas)',
            question: 'Dalam Business Development, penolakan prospek (rejection) atau pembatalan kesepakatan bernilai besar di detik-detik akhir adalah hal yang tak terhindarkan. Ceritakan pengalaman Anda saat menghadapi penolakan berat dan bagaimana proses pribadi Anda memulihkan motivasi?',
            whatToLookFor: 'Resiliensi mental, pemisahan ego pribadi dari relasi bisnis, dan keuletan bangkit mengejar target berikutnya.'
          },
          {
            label: 'Pilihan B (Mengelola Ekspektasi di Bawah Tekanan Kuota)',
            question: 'Ketika kuota akhir bulan tersisa 3 hari dan Anda masih kekurangan 30% dari target, bagaimana Anda mengelola kecemasan agar tetap berpikir jernih saat bernegosiasi dengan prospek?',
            whatToLookFor: 'Regulasi emosi, ketenangan di bawah tekanan tinggi, dan fokus pada solusi taktis.'
          }
        ]
      });
    } else {
      questions.push({
        topic: 'Konsistensi Eksekusi & Daya Tahan Komersial',
        indicator: `Stabilitas Emosional Tangguh (${emoPct}%)`,
        options: [
          {
            label: 'Pilihan A (Mengelola Prospek Dingin / Sulit)',
            question: 'Bagaimana cara Anda mempertahankan energi dan antusiasme saat melakukan pendekatan ke prospek dingin (cold outreach) yang tidak memberikan respon selama berminggu-minggu?',
            whatToLookFor: 'Konsistensi mental, kreativitas sudut pandang pendekatan baru, dan disiplin tanpa patah arang.'
          },
          {
            label: 'Pilihan B (Menghadapi Konflik Klien Kritis)',
            question: 'Ceritakan situasi ketika seorang klien marah besar karena kendala layanan. Bagaimana langkah Anda menenangkan klien dan menyelamatkan hubungan kemitraan?',
            whatToLookFor: 'Kematangan emosional, empati profesional, dan de-eskalasi situasi tegang.'
          }
        ]
      });
    }
  } else if (roleCat === 'marketplace_operations') {
    questions.push({
      topic: 'Ketenangan Menghadapi Komplain & Manajemen Stres',
      indicator: `Stabilitas Emosional (${emoPct}%)`,
      options: [
        {
          label: 'Pilihan A (Menangani Komplain Pembeli Agresif)',
          question: 'Ketika pembeli meluapkan kemarahan dengan kata-kata kasar di chat toko akibat kendala paket rusak di jalan, bagaimana Anda menenangkan situasi tanpa terpancing emosi?',
          whatToLookFor: 'Kematangan emosi, empati layanan konsumen, dan kemampuan mematuhi SOP penyelesaian komplain.'
        },
        {
          label: 'Pilihan B (Ketelitian Input Harga & Stok)',
          question: 'Bagaimana sistem pengecekan ganda Anda saat mengunggah ratusan SKU promo agar tidak terjadi salah input harga yang fatal bagi perusahaan?',
          whatToLookFor: 'Ketelitian detail, checklist kerja mandiri, dan tanggung jawab operasional.'
        }
      ]
    });
  } else {
    // Creator / General
    if (emoPct < 50) {
      questions.push({
        topic: 'Manajemen Stres & Respon Kritik Profesional',
        indicator: `Stabilitas Emosional Sensitif (${emoPct}%)`,
        options: [
          {
            label: 'Pilihan A (Pemisahan Emosi & Kritik Kerja)',
            question: 'Kritik tajam atau tanggapan tidak memuaskan terhadap hasil kerja adalah hal yang lumrah. Bagaimana cara pribadi Anda menjaga ketenangan mental agar fokus kerja tidak terganggu?',
            whatToLookFor: 'Kemampuan memisahkan emosi pribadi dari pekerjaan profesional dan kedewasaan bersikap.'
          },
          {
            label: 'Pilihan B (Menjaga Ritme di Bawah Tekanan)',
            question: 'Ketika ritme kerja menuntut deliverables mendesak secara simultan, bagaimana Anda menjaga diri agar tidak mengalami burnout?',
            whatToLookFor: 'Self-awareness, manajemen energi kerja, dan komunikasi asertif dengan rekan tim.'
          }
        ]
      });
    } else {
      questions.push({
        topic: 'Kreativitas & Keterbukaan Ide Baru',
        indicator: `Tingkat Keterbukaan (${b5.intellect ? b5.intellect.percentage : 50}%)`,
        options: [
          {
            label: 'Pilihan A (Eksplorasi Metode Kerja Baru)',
            question: 'Metode atau pendekatan baru apa yang baru-baru ini Anda pelajari dan berhasil Anda terapkan untuk meningkatkan kualitas pekerjaan Anda?',
            whatToLookFor: 'Keingintahuan intelektual, self-directed learning, dan penerapan praktis.'
          },
          {
            label: 'Pilihan B (Berbagi Wawasan Tim)',
            question: 'Bagaimana cara Anda membagikan ide atau gagasan baru kepada rekan tim yang mungkin masih terbiasa dengan cara kerja lama?',
            whatToLookFor: 'Komunikasi persuasif, kerendahan hati intelektual, dan kolaborasi tim.'
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

    // Close dropdown
    const menu = document.getElementById(`stageMenu_${talentId}`);
    if (menu) menu.classList.remove('open');

    const state = window.state || {};
    const talent = (state.talents || []).find(t => t.id === talentId);
    const candidateName = talent ? talent.name : talentId;

    if (!confirm(`Ubah tahap seleksi kandidat "${candidateName}" menjadi [${newStage}]?`)) {
      if (typeof window.renderCandidates === 'function') {
        window.renderCandidates();
      }
      return;
    }

    // Direct Firebase RTDB update
    if (typeof firebase !== 'undefined' && firebase.database) {
      const rtdb = firebase.database();
      rtdb.ref('/talents/' + talentId).update({
        stage: newStage,
        stageUpdatedAt: Date.now()
      }).then(() => {
        if (talent) talent.stage = newStage;
        showToastNotification(`✓ Tahap ${candidateName} berhasil diubah menjadi "${newStage}"!`);
        if (typeof window.renderCandidates === 'function') {
          window.renderCandidates();
        }
      }).catch(err => {
        console.error('Error updating stage in Firebase:', err);
        alert('Gagal memperbarui status di Firebase: ' + err.message);
      });
    } else {
      if (talent) talent.stage = newStage;
      showToastNotification(`✓ Tahap ${candidateName} diubah menjadi "${newStage}" (mode lokal)`);
      if (typeof window.renderCandidates === 'function') {
        window.renderCandidates();
      }
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

  window.AssessmentExtensions = {
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
