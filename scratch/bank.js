const bank = [
  {
    "id": "COG_NUM_01",
    "category": "Deret Angka",
    "question": "Berapakah angka selanjutnya pada deret berikut: 3, 6, 12, 24, 48, ... ?",
    "options": [
      "72",
      "84",
      "96",
      "108",
      "120"
    ],
    "correct_answer": "96",
    "explanation": "Pola perkalian 2: setiap angka dikali 2 (48 x 2 = 96)."
  },
  {
    "id": "COG_NUM_02",
    "category": "Deret Angka",
    "question": "Perhatikan deret berikut: 5, 8, 14, 23, 35, ... Angka berikutnya adalah?",
    "options": [
      "48",
      "50",
      "52",
      "54",
      "56"
    ],
    "correct_answer": "50",
    "explanation": "Pola selisih bertingkat kelipatan 3 (+3, +6, +9, +12). Selanjutnya adalah +15 (35 + 15 = 50)."
  },
  {
    "id": "COG_NUM_03",
    "category": "Deret Angka",
    "question": "Berapakah angka selanjutnya pada deret berikut: 100, 95, 85, 70, 50, ... ?",
    "options": [
      "20",
      "25",
      "30",
      "35",
      "40"
    ],
    "correct_answer": "25",
    "explanation": "Pola pengurangan bertingkat: -5, -10, -15, -20. Selanjutnya adalah -25 (50 - 25 = 25)."
  },
  {
    "id": "COG_NUM_04",
    "category": "Deret Angka",
    "question": "Perhatikan deret berikut: 4, 9, 16, 25, 36, ... Angka berikutnya adalah?",
    "options": [
      "45",
      "47",
      "49",
      "52",
      "64"
    ],
    "correct_answer": "49",
    "explanation": "Pola kuadrat bilangan bulat: 2², 3², 4², 5², 6². Selanjutnya adalah 7² = 49."
  },
  {
    "id": "COG_NUM_05",
    "category": "Deret Angka",
    "question": "Berapakah angka selanjutnya: 1, 2, 6, 24, 120, ... ?",
    "options": [
      "240",
      "360",
      "480",
      "600",
      "720"
    ],
    "correct_answer": "720",
    "explanation": "Pola faktorial/perkalian bertingkat: x2, x3, x4, x5. Selanjutnya adalah x6 (120 x 6 = 720)."
  },
  {
    "id": "COG_NUM_06",
    "category": "Deret Angka",
    "question": "Perhatikan barisan berikut: 2, 3, 5, 8, 13, 21, ... Angka berikutnya adalah?",
    "options": [
      "29",
      "31",
      "34",
      "36",
      "42"
    ],
    "correct_answer": "34",
    "explanation": "Pola Fibonacci (penjumlahan dua angka sebelumnya): 13 + 21 = 34."
  },
  {
    "id": "COG_NUM_07",
    "category": "Deret Angka",
    "question": "Berapakah angka selanjutnya: 80, 40, 44, 22, 26, 13, ... ?",
    "options": [
      "15",
      "17",
      "18",
      "20",
      "26"
    ],
    "correct_answer": "17",
    "explanation": "Pola selang-seling operasi bagi 2 lalu tambah 4: 80/2=40, 40+4=44, 44/2=22, 22+4=26, 26/2=13. Selanjutnya 13+4 = 17."
  },
  {
    "id": "COG_NUM_08",
    "category": "Deret Angka",
    "question": "Perhatikan deret berikut: 7, 12, 10, 15, 13, 18, ... Angka berikutnya adalah?",
    "options": [
      "14",
      "16",
      "20",
      "21",
      "23"
    ],
    "correct_answer": "16",
    "explanation": "Pola operasi berulang (+5, -2, +5, -2, +5). Selanjutnya adalah 18 - 2 = 16."
  },
  {
    "id": "COG_ARI_01",
    "category": "Aritmatika Dasar",
    "question": "Sebuah produk memiliki harga awal Rp50.000. Produk tersebut didiskon 20%, kemudian pada saat flash sale didiskon lagi sebesar 10% dari harga setelah diskon pertama. Berapakah harga akhirnya?",
    "options": [
      "Rp35.000",
      "Rp36.000",
      "Rp37.500",
      "Rp40.000",
      "Rp45.000"
    ],
    "correct_answer": "Rp36.000",
    "explanation": "Diskon 20% dari 50.000 = 40.000. Diskon tambahan 10% dari 40.000 = 4.000. Harga akhir = 40.000 - 4.000 = 36.000."
  },
  {
    "id": "COG_ARI_02",
    "category": "Aritmatika Dasar",
    "question": "Rasio penjualan produk A dan produk B adalah 3:2. Jika total penjualan kedua produk tersebut dalam sebulan adalah 150 unit, berapakah jumlah produk A yang terjual?",
    "options": [
      "60",
      "75",
      "80",
      "90",
      "100"
    ],
    "correct_answer": "90",
    "explanation": "Bagian produk A = 3 / (3+2) x 150 = (3/5) x 150 = 90 unit."
  },
  {
    "id": "COG_ARI_03",
    "category": "Aritmatika Dasar",
    "question": "5 orang admin dapat memproses 100 pesanan dalam waktu 2 jam. Jika hanya ada 2 orang admin, berapa waktu yang dibutuhkan untuk memproses 40 pesanan dengan kecepatan yang sama?",
    "options": [
      "1 jam",
      "1,5 jam",
      "2 jam",
      "2,5 jam",
      "3 jam"
    ],
    "correct_answer": "2 jam",
    "explanation": "1 admin = 20 pesanan / 2 jam = 10 pesanan/jam. 2 admin = 20 pesanan/jam. Waktu untuk 40 pesanan = 40 / 20 = 2 jam."
  },
  {
    "id": "COG_ARI_04",
    "category": "Aritmatika Dasar",
    "question": "Seorang host live streaming menghasilkan rata-rata omzet Rp1.200.000 per 2 jam sesi siaran. Jika target omzet harian toko adalah Rp6.000.000, berapa total jam siaran yang dibutuhkan per hari?",
    "options": [
      "6 jam",
      "8 jam",
      "10 jam",
      "12 jam",
      "15 jam"
    ],
    "correct_answer": "10 jam",
    "explanation": "Omzet per jam = Rp1.200.000 / 2 = Rp600.000. Total jam = Rp6.000.000 / Rp600.000 = 10 jam."
  },
  {
    "id": "COG_ARI_05",
    "category": "Aritmatika Dasar",
    "question": "Harga jual per unit produk adalah Rp150.000 dengan modal produksi Rp90.000 per unit. Jika toko memberikan voucher potongan Rp15.000 per unit kepada pembeli, berapakah margin laba kotor toko per unit dari harga jual efektif?",
    "options": [
      "25,0%",
      "30,0%",
      "33,3%",
      "40,0%",
      "45,0%"
    ],
    "correct_answer": "33,3%",
    "explanation": "Harga jual efektif = 150.000 - 15.000 = 135.000. Laba kotor = 135.000 - 90.000 = 45.000. Margin = (45.000 / 135.000) x 100% = 33,3%."
  },
  {
    "id": "COG_ARI_06",
    "category": "Aritmatika Dasar",
    "question": "Dalam sebuah gudang, terdapat 240 paket pesanan. Tim packing Shift Pagi menyelesaikan 3/8 bagian paket, dan Shift Siang menyelesaikan 1/3 bagian paket. Berapakah sisa paket yang belum terselesaikan?",
    "options": [
      "60 paket",
      "70 paket",
      "75 paket",
      "80 paket",
      "90 paket"
    ],
    "correct_answer": "70 paket",
    "explanation": "Shift Pagi = 3/8 x 240 = 90. Shift Siang = 1/3 x 240 = 80. Total selesai = 170. Sisa = 240 - 170 = 70 paket."
  },
  {
    "id": "COG_ARI_07",
    "category": "Aritmatika Dasar",
    "question": "Sebuah tim beranggotakan 4 content creator menghasilkan rata-rata 36 video TikTok per minggu. Perusahaan ingin menaikkan target menjadi 54 video per minggu dengan ritme kerja per orang yang sama. Berapa tambahan anggota tim creator yang harus direkrut?",
    "options": [
      "1 orang",
      "2 orang",
      "3 orang",
      "4 orang",
      "5 orang"
    ],
    "correct_answer": "2 orang",
    "explanation": "Kapasitas 1 creator = 36 / 4 = 9 video/minggu. Target 54 butuh 54 / 9 = 6 creator. Tambahan yang direkrut = 6 - 4 = 2 orang."
  },
  {
    "id": "COG_ARI_08",
    "category": "Aritmatika Dasar",
    "question": "Toko online membeli 500 pcs kemasan kardus dengan biaya total Rp1.000.000. Karena pemesanan jumlah banyak, supplier memberikan bonus 100 pcs kardus gratis. Berapakah harga pokok kemasan per pcs setelah bonus dihitung?",
    "options": [
      "Rp1.500",
      "Rp1.667",
      "Rp1.800",
      "Rp2.000",
      "Rp2.200"
    ],
    "correct_answer": "Rp1.667",
    "explanation": "Total kardus diperoleh = 500 + 100 = 600 pcs. Biaya total tetap Rp1.000.000. HPP per pcs = 1.000.000 / 600 = Rp1.667 per pcs."
  },
  {
    "id": "COG_BIZ_01",
    "category": "Logika Komersial",
    "question": "Toko Anda menghabiskan anggaran iklan (Ads) Rp2.000.000 dan berhasil menghasilkan omzet penjualan kotor (Revenue) sebesar Rp8.000.000. Berapakah nilai Return on Ad Spend (ROAS) kampanye tersebut?",
    "options": [
      "2x (200%)",
      "3x (300%)",
      "4x (400%)",
      "5x (500%)",
      "8x (800%)"
    ],
    "correct_answer": "4x (400%)",
    "explanation": "ROAS = Pendapatan Kotor / Biaya Iklan = Rp8.000.000 / Rp2.000.000 = 4x (400%)."
  },
  {
    "id": "COG_BIZ_02",
    "category": "Logika Komersial",
    "question": "Rata-rata nilai belanja per pelanggan (Average Order Value / AOV) toko saat ini adalah Rp80.000. Untuk menaikkan AOV tanpa mengorbankan margin keuntungan, strategi komersial mana yang paling tepat?",
    "options": [
      "Memberikan diskon harga 50% untuk semua produk satuan",
      "Membuat paket bundling 2 produk seharga Rp145.000 dengan bonus pouch eksklusif",
      "Menaikkan biaya tarif ongkos kirim ke pembeli",
      "Menghentikan penjualan produk terlaris toko",
      "Mengubah sistem toko menjadi sistem lelang"
    ],
    "correct_answer": "Membuat paket bundling 2 produk seharga Rp145.000 dengan bonus pouch eksklusif",
    "explanation": "Bundling menaikkan nominal transaksi pembeli sekaligus menjaga margin laba tanpa perang harga diskon ekstrem."
  },
  {
    "id": "COG_BIZ_03",
    "category": "Logika Komersial",
    "question": "Data bulan ini menunjukkan Gross Margin turun drastis dari 30% menjadi 24%, sementara Average Selling Price (harga jual) hampir tidak berubah. Manakah faktor yang paling mungkin menjadi penyebabnya?",
    "options": [
      "Penurunan jumlah pengunjung (traffic)",
      "Kenaikan harga pokok barang atau biaya produksi",
      "Peningkatan anggaran iklan secara berlebihan",
      "Kenaikan conversion rate",
      "Banyak pelanggan menggunakan fitur gratis ongkir"
    ],
    "correct_answer": "Kenaikan harga pokok barang atau biaya produksi",
    "explanation": "Jika Gross Margin turun sementara harga jual stabil, otomatis biaya pokok barang (COGS) yang meningkat."
  },
  {
    "id": "COG_BIZ_04",
    "category": "Logika Komersial",
    "question": "Biaya operasional tetap toko adalah Rp5.000.000 per bulan. Rata-rata keuntungan bersih dari setiap produk yang terjual adalah Rp25.000. Berapa jumlah minimal produk yang harus terjual agar perusahaan mencapai Break Even Point (balik modal)?",
    "options": [
      "100",
      "150",
      "200",
      "250",
      "300"
    ],
    "correct_answer": "200",
    "explanation": "BEP Unit = Biaya Tetap / Margin Kontribusi per unit = 5.000.000 / 25.000 = 200 produk."
  },
  {
    "id": "COG_BIZ_05",
    "category": "Logika Komersial",
    "question": "Sebuah dompet kulit dijual seharga Rp100.000. Biaya admin marketplace adalah 5% dan biaya layanan gratis ongkir adalah 3% yang dipotong langsung dari harga jual. Berapa nominal uang yang akan diterima masuk ke saldo perusahaan?",
    "options": [
      "Rp100.000",
      "Rp95.000",
      "Rp92.000",
      "Rp85.000",
      "Rp82.000"
    ],
    "correct_answer": "Rp92.000",
    "explanation": "Total potongan = 5% + 3% = 8%. Potongan = 8% x 100.000 = 8.000. Uang diterima = 100.000 - 8.000 = 92.000."
  },
  {
    "id": "COG_BIZ_06",
    "category": "Logika Komersial",
    "question": "Perusahaan menghabiskan Rp500.000 untuk biaya iklan (Ads). Iklan tersebut menghasilkan 20 transaksi baru. Jika profit kotor dari setiap transaksi adalah Rp40.000, berapakah laba bersih yang didapat dari kampanye iklan ini?",
    "options": [
      "Rp300.000",
      "Rp400.000",
      "Rp500.000",
      "Rp800.000",
      "-Rp100.000 (Rugi)"
    ],
    "correct_answer": "Rp300.000",
    "explanation": "Total profit kotor = 20 x 40.000 = 800.000. Laba bersih = Profit kotor - Biaya iklan = 800.000 - 500.000 = Rp300.000."
  },
  {
    "id": "COG_BIZ_07",
    "category": "Logika Komersial",
    "question": "Perusahaan memiliki produk best-seller yang saat ini menyumbang 70% laba perusahaan, namun tren minat pasar diperkirakan hanya bertahan 6 bulan lagi. Tindakan komersial strategis manakah yang paling bijak dilakukan saat ini?",
    "options": [
      "Segera menghentikan stok produk best-seller hari ini juga",
      "Mengalokasikan sebagian arus kas saat ini untuk riset dan peluncuran produk baru sebelum tren berakhir",
      "Menaikkan harga produk 200% agar mendapat laba instan sebelum tren hilang",
      "Mengganti seluruh tim penjualan dengan tim baru",
      "Menunggu hingga penjualan benar-benar habis baru mulai meriset produk lain"
    ],
    "correct_answer": "Mengalokasikan sebagian arus kas saat ini untuk riset dan peluncuran produk baru sebelum tren berakhir",
    "explanation": "Diversifikasi portofolio produk dan reinvestasi cash cow sebelum siklus hidup produk memasuki tahap decline."
  },
  {
    "id": "COG_BIZ_08",
    "category": "Logika Komersial",
    "question": "Marketplace A mengenakan komisi 4% dengan potensi omzet Rp100.000.000. Marketplace B mengenakan komisi 8% namun memiliki traffic besar dengan estimasi omzet Rp150.000.000. Asumsikan HPP dan biaya lain 60% dari omzet. Pilihan manakah yang memberikan nominal profit bersih lebih tinggi?",
    "options": [
      "Marketplace A, karena komisinya jauh lebih murah",
      "Marketplace B, karena volume penjualan lebih besar sehingga nominal laba bersih absolut lebih tinggi",
      "Keduanya menghasilkan nominal laba bersih yang sama persis",
      "Marketplace A, karena omzet 100 juta lebih mudah diatur",
      "Tidak bisa ditentukan karena tidak ada rincian ekspedisi"
    ],
    "correct_answer": "Marketplace B, karena volume penjualan lebih besar sehingga nominal laba bersih absolut lebih tinggi",
    "explanation": "Marketplace A: Net Margin = 40% - 4% = 36% x 100 jt = Rp36 jt. Marketplace B: Net Margin = 40% - 8% = 32% x 150 jt = Rp48 jt. Nominal laba B lebih tinggi Rp12 jt."
  },
  {
    "id": "COG_DAT_01",
    "category": "Analisis Data",
    "question": "Data penjualan menunjukkan bahwa ketika perusahaan melipatgandakan anggaran iklan, jumlah pengunjung toko (traffic) naik tajam, tetapi total transaksi harian tetap sama seperti sebelumnya. Apa simpulan metrik yang paling akurat?",
    "options": [
      "Conversion rate menurun",
      "Average order value meningkat",
      "Margin keuntungan meningkat",
      "Pembeli menghabiskan lebih banyak uang",
      "Iklan mendatangkan target pasar yang tepat"
    ],
    "correct_answer": "Conversion rate menurun",
    "explanation": "Conversion Rate = Transaksi / Traffic. Jika traffic naik namun pembagi (transaksi) tetap, persentasenya pasti mengecil."
  },
  {
    "id": "COG_DAT_02",
    "category": "Analisis Data",
    "question": "Anda menyadari satu lini produk tiba-tiba melonjak penjualannya 300% dalam sehari tanpa ada promosi. Sistem pelaporan belum selesai memproses asal sumber pengunjung tersebut. Apa tindakan komersial terbaik yang harus segera dilakukan?",
    "options": [
      "Menunggu hingga data pelaporan selesai 100% besok pagi",
      "Segera mengecek tren viral di sosial media dan mengamankan ketersediaan stok fisik",
      "Menghentikan penjualan produk agar stok tidak habis",
      "Menurunkan harga agar semakin banyak yang beli",
      "Melaporkan adanya kesalahan sistem kepada tim IT"
    ],
    "correct_answer": "Segera mengecek tren viral di sosial media dan mengamankan ketersediaan stok fisik",
    "explanation": "Toleransi ambiguitas saat mengambil keputusan dengan data belum lengkap untuk mengamankan momentum komersial."
  },
  {
    "id": "COG_DAT_03",
    "category": "Analisis Data",
    "question": "Tingkat pembatalan (Cancellation Rate) mendadak naik dari 2% menjadi 6%. Bersamaan dengan itu, traffic dan conversion rate pesanan di awal bulan sangat tinggi. Apa hipotesis yang paling masuk akal?",
    "options": [
      "Sistem pembayaran pelanggan sedang error",
      "Stok fisik barang tidak cukup untuk memenuhi lonjakan pesanan sehingga sistem otomatis membatalkan",
      "Kurir pengiriman mogok kerja",
      "Kualitas produk memburuk",
      "Harga produk terlalu mahal"
    ],
    "correct_answer": "Stok fisik barang tidak cukup untuk memenuhi lonjakan pesanan sehingga sistem otomatis membatalkan",
    "explanation": "Lonjakan pesanan memicu overselling jika sinkronisasi stok telat, berujung pembatalan otomatis."
  },
  {
    "id": "COG_DAT_04",
    "category": "Analisis Data",
    "question": "Sebuah video promosi mendapatkan 200.000 penayangan (views), 8.000 likes, 1.200 shares, dan 800 komentar. Berapakah Engagement Rate (ER) video tersebut berdasarkan rasio interaksi terhadap views?",
    "options": [
      "2,5%",
      "3,8%",
      "4,2%",
      "5,0%",
      "6,0%"
    ],
    "correct_answer": "5,0%",
    "explanation": "Total interaksi = 8.000 + 1.200 + 800 = 10.000. Engagement Rate = (10.000 / 200.000) x 100% = 5,0%."
  },
  {
    "id": "COG_DAT_05",
    "category": "Analisis Data",
    "question": "Dari 10.000 pengunjung yang mengklik link produk, 600 orang memasukkan produk ke keranjang (Add to Cart), dan 150 orang akhirnya menyelesaikan pembayaran (Checkout). Berapakah Cart-to-Checkout Conversion Rate?",
    "options": [
      "1,5%",
      "6,0%",
      "15,0%",
      "25,0%",
      "30,0%"
    ],
    "correct_answer": "25,0%",
    "explanation": "Cart-to-Checkout Rate = (Jumlah Checkout / Jumlah Add to Cart) x 100% = (150 / 600) x 100% = 25,0%."
  },
  {
    "id": "COG_DAT_06",
    "category": "Analisis Data",
    "question": "Return on Ad Spend (ROAS) iklan turun dari 4.5x ke 1.8x, padahal Cost per Click (CPC) stabil. Data mencatat rasio klik-ke-beli (CR) anjlok tepat setelah perubahan foto produk dan copy deskripsi. Apa akar masalah paling mungkin?",
    "options": [
      "Platform iklan mengalami gangguan server global",
      "Visual atau copywriting deskripsi baru kurang meyakinkan atau tidak sesuai ekspektasi audiens yang mengklik",
      "Kompetitor melakukan serangan bot klik iklan",
      "Algoritma demografi audiens bergeser total",
      "Tarif jasa ekspedisi kurir tiba-tiba naik"
    ],
    "correct_answer": "Visual atau copywriting deskripsi baru kurang meyakinkan atau tidak sesuai ekspektasi audiens yang mengklik",
    "explanation": "CPC stabil berarti minat klik awal tetap, tetapi konversi di halaman produk drop tepat setelah foto dan copy diganti."
  },
  {
    "id": "COG_DAT_07",
    "category": "Analisis Data",
    "question": "Influencer X (biaya Rp5.000.000) menghasilkan 100 pembeli baru. Influencer Y (biaya Rp9.000.000) menghasilkan 200 pembeli baru. Berapakah Customer Acquisition Cost (CAC) per pembeli masing-masing influencer?",
    "options": [
      "X: Rp50.000, Y: Rp45.000",
      "X: Rp45.000, Y: Rp50.000",
      "X: Rp50.000, Y: Rp90.000",
      "X: Rp100.000, Y: Rp45.000",
      "X: Rp25.000, Y: Rp45.000"
    ],
    "correct_answer": "X: Rp50.000, Y: Rp45.000",
    "explanation": "CAC X = Rp5.000.000 / 100 = Rp50.000. CAC Y = Rp9.000.000 / 200 = Rp45.000."
  },
  {
    "id": "COG_DAT_08",
    "category": "Analisis Data",
    "question": "Data mencatat 85% keluhan ulasan bintang 1 disebabkan keterlambatan kurir reguler. Tim operasional mengusulkan mengganti bubble wrap menjadi 3 lapis lebih tebal. Apakah rekomendasi tersebut menyelesaikan akar masalah?",
    "options": [
      "Ya, karena kemasan tebal membuat pembeli lebih bahagia",
      "Tidak, solusi tersebut tidak menyelesaikan akar masalah yaitu SLA penyerahan paket dan kecepatan ekspedisi kurir",
      "Ya, karena ulasan buruk selalu terselesaikan dengan packaging",
      "Tidak, sebaiknya langsung hapus produk dari etalase",
      "Ya, bubble wrap tebal otomatis membuat kurir mengantar lebih cepat"
    ],
    "correct_answer": "Tidak, solusi tersebut tidak menyelesaikan akar masalah yaitu SLA penyerahan paket dan kecepatan ekspedisi kurir",
    "explanation": "Solusi harus selaras dengan root cause yang teridentifikasi dalam data."
  },
  {
    "id": "COG_SIL_01",
    "category": "Silogisme",
    "question": "Semua produk yang diskon diletakkan di etalase kategori 'Promo'. Beberapa gantungan kunci diletakkan di etalase kategori 'Promo'. Kesimpulan yang paling tepat adalah:",
    "options": [
      "Semua gantungan kunci adalah produk diskon",
      "Gantungan kunci pasti produk paling murah",
      "Tidak ada gantungan kunci yang diskon",
      "Beberapa gantungan kunci mungkin adalah produk diskon",
      "Gantungan kunci bukan produk diskon"
    ],
    "correct_answer": "Beberapa gantungan kunci mungkin adalah produk diskon",
    "explanation": "Premis tidak secara eksklusif menyatakan HANYA produk diskon yang ada di etalase Promo. Jadi 'beberapa' mengindikasikan kemungkinan."
  },
  {
    "id": "COG_SIL_02",
    "category": "Silogisme",
    "question": "Semua konten yang masuk FYP memiliki rasio retensi tontonan di atas 60%. Sebagian konten video unboxing masuk FYP. Kesimpulan yang sah adalah:",
    "options": [
      "Semua konten video unboxing memiliki retensi di atas 60%",
      "Sebagian konten video unboxing memiliki rasio retensi tontonan di atas 60%",
      "Tidak ada video unboxing yang memiliki retensi rendah",
      "Semua konten dengan retensi di atas 60% pasti video unboxing",
      "Video unboxing pasti selalu masuk FYP"
    ],
    "correct_answer": "Sebagian konten video unboxing memiliki rasio retensi tontonan di atas 60%",
    "explanation": "Jika semua P adalah Q, dan sebagian R adalah P, maka sebagian R pasti adalah Q."
  },
  {
    "id": "COG_SIL_03",
    "category": "Silogisme",
    "question": "Tidak ada pesanan sistem yang diproses tanpa verifikasi pembayaran. Semua pesanan COD (Bayar di Tempat) telah diverifikasi otomatis oleh sistem. Kesimpulan yang valid:",
    "options": [
      "Semua pesanan COD diproses oleh sistem",
      "Beberapa pesanan COD tidak diproses",
      "Pesanan non-COD tidak memerlukan verifikasi",
      "Sistem hanya memproses pesanan COD",
      "Pesanan COD tidak perlu membayar uang"
    ],
    "correct_answer": "Semua pesanan COD diproses oleh sistem",
    "explanation": "Karena seluruh pesanan COD telah diverifikasi, maka seluruh pesanan COD memenuhi syarat untuk diproses."
  },
  {
    "id": "COG_SIL_04",
    "category": "Silogisme",
    "question": "Semua anggota tim kreatif menguasai aplikasi CapCut. Beberapa anggota tim kreatif juga mahir menggunakan Adobe Premiere. Kesimpulan yang benar adalah:",
    "options": [
      "Semua anggota tim kreatif menguasai Adobe Premiere",
      "Sebagian pengguna mahir Adobe Premiere dalam tim tersebut juga menguasai CapCut",
      "Anggota yang memakai CapCut tidak boleh memakai Premiere",
      "Hanya tim kreatif yang boleh mengedit video",
      "Aplikasi CapCut lebih sulit dibanding Adobe Premiere"
    ],
    "correct_answer": "Sebagian pengguna mahir Adobe Premiere dalam tim tersebut juga menguasai CapCut",
    "explanation": "Karena seluruh tim menguasai CapCut, maka anggota yang mahir Premiere pun otomatis menguasai CapCut."
  },
  {
    "id": "COG_LOG_01",
    "category": "Penalaran Kritis",
    "question": "Anda menemukan kompetitor menjual produk identik dengan harga 10% lebih murah. Produk kompetitor memiliki rating 3.5 dari 5, sedangkan produk perusahaan Anda memiliki rating 4.9 dari 5. Apa rekomendasi harga (pricing) yang paling logis?",
    "options": [
      "Ikut menurunkan harga 10% agar tidak kalah saing",
      "Menurunkan harga 15% untuk mematikan kompetitor",
      "Pertahankan harga saat ini dan jadikan ulasan/kualitas sebagai nilai jual utama",
      "Menaikkan harga 10% karena kualitas lebih bagus",
      "Berhenti menjual produk tersebut"
    ],
    "correct_answer": "Pertahankan harga saat ini dan jadikan ulasan/kualitas sebagai nilai jual utama",
    "explanation": "Penurunan harga tidak rasional jika produk memiliki keunggulan kompetitif pada trust (rating tinggi)."
  },
  {
    "id": "COG_LOG_02",
    "category": "Penalaran Kritis",
    "question": "Toko menerima keluhan publik di kolom komentar TikTok karena salah mengirimkan warna baju. Pelanggan tersebut memiliki 50.000 followers dan videonya mulai ramai. Respon pertama yang paling tepat?",
    "options": [
      "Menghapus komentar pelanggan dan memblokir akunnya",
      "Menyalahkan pihak bagian gudang packing di depan umum",
      "Meminta maaf secara santun di kolom komentar, mengakui kelalaian, dan segera mengirimkan barang yang benar via ekspedisi instan tanpa membebani pelanggan",
      "Mengabaikan komentar karena keluhan adalah hal biasa",
      "Menantang pelanggan untuk membuktikan video rekaman pembukaan paket"
    ],
    "correct_answer": "Meminta maaf secara santun di kolom komentar, mengakui kelalaian, dan segera mengirimkan barang yang benar via ekspedisi instan tanpa membebani pelanggan",
    "explanation": "Respons cepat, transparan, dan berorientasi solusi memitigasi krisis PR dan justru membangun reputasi positif brand."
  },
  {
    "id": "COG_LOG_03",
    "category": "Penalaran Kritis",
    "question": "Perusahaan memiliki anggaran promosi Rp30 juta dan membidik direct sales. Opsi A: endorse 1 artis besar (jangkauan luas tapi umum). Opsi B: endorse 10 micro-creator segmented (engagement tinggi & niche relevan). Opsi mana yang lebih rasional untuk direct sales?",
    "options": [
      "Opsi A, karena artis besar membuat toko terlihat bergengsi",
      "Opsi B, karena komunitas niche dengan keterikatan tinggi memiliki tingkat konversi pembelian langsung yang lebih kuat",
      "Keduanya memiliki performa yang sama persis",
      "Tidak memilih keduanya dan membiarkan produk terjual organik",
      "Membagikan voucher acak ke 100 orang lewat direct message"
    ],
    "correct_answer": "Opsi B, karena komunitas niche dengan keterikatan tinggi memiliki tingkat konversi pembelian langsung yang lebih kuat",
    "explanation": "Untuk tujuan direct sales pada budget terbatas, micro-influencer niche memberikan conversion rate dan efisiensi biaya (CAC) yang lebih tinggi dibanding artis umum."
  },
  {
    "id": "COG_LOG_04",
    "category": "Penalaran Kritis",
    "question": "Dua insiden terjadi serentak: (1) Printer resi gudang offline sehingga 50 paket tertunda cetak, dan (2) Akun media sosial utama diretas dan menyebarkan tautan penipuan ke followers. Bagaimana prioritas tindakan PIC?",
    "options": [
      "Prioritaskan penanganan akun media sosial secepatnya guna menghentikan penipuan terhadap publik, sambil mengarahkan gudang memakai printer cadangan / manual",
      "Fokus cetak resi terlebih dahulu karena jam jemput kurir sudah dekat",
      "Menunggu kedatangan pimpinan yang sedang rapat di luar kota",
      "Mematikan daya listrik seluruh kantor",
      "Membiarkan keduanya ditangani pihak luar"
    ],
    "correct_answer": "Prioritaskan penanganan akun media sosial secepatnya guna menghentikan penipuan terhadap publik, sambil mengarahkan gudang memakai printer cadangan / manual",
    "explanation": "Peretasan akun publik menimbulkan risiko reputasi masif dan potensi kerugian finansial pihak ketiga (followers), sehingga merupakan krisis prioritas darurat."
  }
];
console.log(JSON.stringify(bank, null, 2));