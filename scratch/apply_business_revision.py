import json

# Define the new questions
new_questions = [
  {
    "id": "COG_BIZ_01",
    "category": "Logika Komersial",
    "question": "Toko Anda mengeluarkan modal biaya iklan sebesar Rp200.000 dan berhasil menjual 10 paket produk dengan total omzet penjualan sebesar Rp1.000.000. Berapa kali lipat hasil penjualan yang didapat dibanding biaya iklannya?",
    "options": [
      "2 kali lipat",
      "3 kali lipat",
      "4 kali lipat",
      "5 kali lipat",
      "10 kali lipat"
    ],
    "correct_answer": "5 kali lipat",
    "explanation": "Rasio penjualan terhadap biaya iklan = Rp1.000.000 / Rp200.000 = 5 kali lipat."
  },
  {
    "id": "COG_BIZ_02",
    "category": "Logika Komersial",
    "question": "Rata-rata pembeli di toko Anda biasanya hanya membeli 1 botol minuman seharga Rp20.000. Anda ingin membuat pembeli membelanjakan uang lebih banyak dalam sekali transaksi tanpa membuat toko rugi. Strategi mana yang paling tepat?",
    "options": [
      "Menurunkan harga minuman menjadi Rp10.000",
      "Membuat paket bundling \"Beli 3 botol seharga Rp50.000\"",
      "Memaksa pembeli membayar biaya parkir toko",
      "Menghapus produk minuman dari etalase",
      "Menolak melayani pembeli yang hanya membeli 1 botol"
    ],
    "correct_answer": "Membuat paket bundling \"Beli 3 botol seharga Rp50.000\"",
    "explanation": "Paket bundling mendorong pembeli menaikkan nilai belanja per transaksi secara menguntungkan bagi kedua belah pihak."
  },
  {
    "id": "COG_BIZ_03",
    "category": "Logika Komersial",
    "question": "Harga jual baju di toko Anda tetap sama yaitu Rp100.000, dan jumlah baju yang terjual bulan ini sama banyaknya dengan bulan lalu. Namun, sisa uang keuntungan yang masuk ke pemilik toko bulan ini berkurang drastis. Apa penyebab yang paling logis?",
    "options": [
      "Pembeli menggunakan metode pembayaran non-tunai",
      "Harga kain atau ongkos jahit dari penjahit (modal dasar barang) mengalami kenaikan",
      "Toko mendapatkan banyak ulasan bintang 5",
      "Warna kantong kresek toko diganti",
      "Jam buka toko diperpanjang 1 jam"
    ],
    "correct_answer": "Harga kain atau ongkos jahit dari penjahit (modal dasar barang) mengalami kenaikan",
    "explanation": "Jika harga jual dan jumlah unit terjual stabil namun laba turun, penyebab utamanya adalah kenaikan modal dasar produk (HPP/ongkos produksi)."
  },
  {
    "id": "COG_BIZ_04",
    "category": "Logika Komersial",
    "question": "Biaya sewa tempat dan listrik kios harian adalah Rp150.000. Dari setiap porsi makanan yang terjual seharga Rp25.000, keuntungan bersih yang didapat kios adalah Rp15.000 per porsi. Berapa porsi minimal yang harus terjual dalam sehari agar kios tidak rugi (balik modal)?",
    "options": [
      "5 porsi",
      "10 porsi",
      "15 porsi",
      "20 porsi",
      "25 porsi"
    ],
    "correct_answer": "10 porsi",
    "explanation": "Target porsi balik modal = Total biaya harian / Keuntungan per porsi = Rp150.000 / Rp15.000 = 10 porsi."
  },
  {
    "id": "COG_BIZ_05",
    "category": "Logika Komersial",
    "question": "Seorang pelanggan membeli barang seharga Rp100.000. Pihak marketplace memotong biaya admin sebesar 5% dan biaya gratis ongkir sebesar 5% langsung dari harga barang. Berapakah nominal uang bersih yang akan masuk ke rekening toko?",
    "options": [
      "Rp95.000",
      "Rp90.000",
      "Rp85.000",
      "Rp80.000",
      "Rp75.000"
    ],
    "correct_answer": "Rp90.000",
    "explanation": "Total potongan = 5% + 5% = 10%. Nominal potongan = 10% x Rp100.000 = Rp10.000. Uang bersih yang diterima = Rp100.000 - Rp10.000 = Rp90.000."
  },
  {
    "id": "COG_BIZ_06",
    "category": "Logika Komersial",
    "question": "Anda memasang iklan berbayar senilai Rp300.000. Dari iklan tersebut, Anda berhasil mendapatkan 20 transaksi baru. Jika dari setiap transaksi Anda mendapat laba bersih produk sebesar Rp25.000, berapa hasil akhir keuntungan bersih dari promosi tersebut?",
    "options": [
      "Rugi Rp50.000",
      "Balik modal (Rp0)",
      "Untung Rp200.000",
      "Untung Rp500.000",
      "Untung Rp800.000"
    ],
    "correct_answer": "Untung Rp200.000",
    "explanation": "Total laba produk = 20 transaksi x Rp25.000 = Rp500.000. Keuntungan bersih akhir = Rp500.000 - Rp300.000 (biaya iklan) = Rp200.000."
  },
  {
    "id": "COG_BIZ_07",
    "category": "Logika Komersial",
    "question": "Toko Anda memiliki 1 produk viral yang sangat laku, namun minat pembeli diperkirakan hanya akan bertahan 2–3 bulan ke depan sebelum orang-orang mulai bosan. Langkah paling tepat yang harus disiapkan dari sekarang adalah:",
    "options": [
      "Langsung berhenti berjualan hari ini juga",
      "Menyisihkan sebagian keuntungan saat ini untuk meriset dan menyiapkan produk baru berikutnya",
      "Membeli stok barang viral tersebut sebanyak-banyaknya hingga gudang penuh",
      "Melipatgandakan harga barang menjadi 5 kali lipat",
      "Menutup toko secara permanen bulan depan"
    ],
    "correct_answer": "Menyisihkan sebagian keuntungan saat ini untuk meriset dan menyiapkan produk baru berikutnya",
    "explanation": "Reinvestasi laba produk yang sedang laris untuk menyiapkan produk pengganti sebelum tren meredup."
  },
  {
    "id": "COG_BIZ_08",
    "category": "Logika Komersial",
    "question": "Anda memiliki 2 pilihan tempat berjualan: Tempat A biaya sewa Rp500.000/bulan dengan estimasi laba kotor Rp2.000.000 (sisa bersih Rp1.500.000). Tempat B biaya sewa Rp2.000.000/bulan dengan estimasi laba kotor Rp5.000.000 (sisa bersih Rp3.000.000). Manakah pilihan yang lebih menguntungkan?",
    "options": [
      "Tempat A, karena biaya sewanya paling murah dan risikonya kecil",
      "Tempat B, karena menghasilkan sisa nominal uang bersih yang jauh lebih besar",
      "Keduanya menghasilkan keuntungan yang sama persis",
      "Tidak memilih keduanya",
      "Tempat A, karena tempat sepi lebih tenang"
    ],
    "correct_answer": "Tempat B, karena menghasilkan sisa nominal uang bersih yang jauh lebih besar",
    "explanation": "Tempat B memberikan nominal laba bersih yang jauh lebih tinggi (Rp3.000.000 dibanding Rp1.500.000)."
  },
  {
    "id": "COG_DAT_01",
    "category": "Analisis Data",
    "question": "Toko Anda membagikan brosur sehingga jumlah orang yang datang melihat-lihat toko naik 2 kali lipat dari biasanya. Namun, saat dihitung di mesin kasir, jumlah orang yang benar-benar membeli barang tidak bertambah sama sekali. Kesimpulan apa yang paling tepat?",
    "options": [
      "Persentase pengunjung yang tergerak untuk membeli mengalami penurunan",
      "Semua orang yang datang pasti membeli barang mahal",
      "Mesin kasir toko rusak",
      "Brosur yang dibagikan salah tanggal",
      "Harga barang otomatis naik sendiri"
    ],
    "correct_answer": "Persentase pengunjung yang tergerak untuk membeli mengalami penurunan",
    "explanation": "Rasio pengunjung yang menjadi pembeli (konversi) menurun karena traffic naik tetapi transaksi tetap."
  },
  {
    "id": "COG_DAT_02",
    "category": "Analisis Data",
    "question": "Tanpa ada jadwal promosi, tiba-tiba pesanan produk keripik melonjak 4 kali lipat dalam hitungan jam. Sebagai staf operasional, apa tindakan pertama yang paling bijak dilakukan?",
    "options": [
      "Mematikan handphone toko agar tidak terganggu",
      "Segera memeriksa ketersediaan stok fisik di gudang dan memastikan pesanan dapat diproses tepat waktu",
      "Membatalkan semua pesanan yang masuk karena curiga",
      "Menunggu hingga besok lusa untuk mengeceknya",
      "Menghapus produk dari katalog toko"
    ],
    "correct_answer": "Segera memeriksa ketersediaan stok fisik di gudang dan memastikan pesanan dapat diproses tepat waktu",
    "explanation": "Tindakan cepat mengamankan stok fisik dan operasional fulfillment saat menghadapi lonjakan pesanan mendadak."
  },
  {
    "id": "COG_DAT_03",
    "category": "Analisis Data",
    "question": "Jumlah pembatalan pesanan di toko mendadak meningkat drastis minggu ini. Bersamaan dengan itu, pembeli banyak mengeluhkan: \"Stok di etalase tertera masih ada, tapi saat dipesan barangnya kosong\". Apa perbaikan utama yang harus segera dilakukan?",
    "options": [
      "Mengganti nama toko",
      "Menyinkronkan jumlah stok di aplikasi dengan stok nyata yang ada di gudang",
      "Memarahi pembeli yang membatalkan pesanan",
      "Menurunkan harga barang menjadi gratis",
      "Menonaktifkan fitur chat toko"
    ],
    "correct_answer": "Menyinkronkan jumlah stok di aplikasi dengan stok nyata yang ada di gudang",
    "explanation": "Akar masalah pembatalan adalah selisih data stok sistem dengan stok fisik (overselling)."
  },
  {
    "id": "COG_DAT_04",
    "category": "Analisis Data",
    "question": "Sebuah video promosi ditonton oleh 1.000 orang. Dari penonton tersebut, ada 100 orang yang memberikan tanda suka (like) dan 50 orang yang membagikan (share) video tersebut. Berapa total orang yang berinteraksi (like + share) terhadap video tersebut dalam bentuk persentase dari total penonton?",
    "options": [
      "5%",
      "10%",
      "15%",
      "20%",
      "25%"
    ],
    "correct_answer": "15%",
    "explanation": "Total interaksi = 100 + 50 = 150 interaksi. Persentase interaksi = (150 / 1.000) x 100% = 15%."
  },
  {
    "id": "COG_DAT_05",
    "category": "Analisis Data",
    "question": "Data mencatat ada 100 orang yang memasukkan baju ke keranjang belanja, tetapi hanya 30 orang yang melanjutkan sampai membayar. Jika pembeli mengaku: \"Ongkos kirimnya ternyata lebih mahal dari harga bajunya\", apa kesimpulan yang paling tepat?",
    "options": [
      "Pembeli tidak suka dengan model bajunya",
      "Tarif ongkos kirim yang tinggi menjadi penghambat utama pembeli menyelesaikan pembayaran",
      "Aplikasi toko sedang offline",
      "Baju tersebut kebesaran untuk pembeli",
      "Pembeli lupa kata sandi akunnya"
    ],
    "correct_answer": "Tarif ongkos kirim yang tinggi menjadi penghambat utama pembeli menyelesaikan pembayaran",
    "explanation": "Ongkos kirim yang tidak proporsional merupakan titik friksi utama yang menyebabkan pembeli membatalkan checkout di keranjang."
  },
  {
    "id": "COG_DAT_06",
    "category": "Analisis Data",
    "question": "Jumlah orang yang mengklik link produk tetap ramai, namun jumlah orang yang membeli tiba-tiba anjlok tepat setelah tim mengganti foto produk dan deskripsi barang dengan yang baru. Apa evaluasi paling masuk akal?",
    "options": [
      "Jaringan internet seluruh Indonesia sedang lambat",
      "Foto atau deskripsi yang baru kurang menarik atau kurang meyakinkan calon pembeli dibanding yang lama",
      "Kurir pengiriman sedang libur",
      "Tombol beli di aplikasi rusak permanen",
      "Kompetitor mematikan toko Anda"
    ],
    "correct_answer": "Foto atau deskripsi yang baru kurang menarik atau kurang meyakinkan calon pembeli dibanding yang lama",
    "explanation": "Penurunan konversi pembelian tepat setelah perubahan materi produk menandakan materi visual/copy baru kurang efektif meyakinkan calon pembeli."
  },
  {
    "id": "COG_DAT_07",
    "category": "Analisis Data",
    "question": "Anda mencoba berpromosi ke 2 orang kreator: Kreator X dibayar Rp1.000.000 menghasilkan 10 pembeli baru (biaya Rp100.000 per pembeli). Kreator Y dibayar Rp1.000.000 menghasilkan 20 pembeli baru (biaya Rp50.000 per pembeli). Kreator manakah yang lebih hemat biaya untuk mendatangkan pembeli?",
    "options": [
      "Kreator X, karena jumlah pembelinya lebih sedikit sehingga lebih eksklusif",
      "Kreator Y, karena biaya untuk mendapatkan setiap 1 pembeli separuh lebih murah",
      "Keduanya sama hematnya karena biayanya sama-sama 1 juta",
      "Tidak ada yang hemat",
      "Kreator X, karena lebih terkenal"
    ],
    "correct_answer": "Kreator Y, karena biaya untuk mendapatkan setiap 1 pembeli separuh lebih murah",
    "explanation": "Kreator Y menghasilkan efisiensi biaya per pembeli yang jauh lebih hemat (Rp50.000 vs Rp100.000 per pembeli)."
  },
  {
    "id": "COG_DAT_08",
    "category": "Analisis Data",
    "question": "Berdasarkan survei, 90% komplain bintang 1 pelanggan disebabkan oleh: \"Keterlambatan kurir mengantar barang hingga berminggu-minggu\". Seorang rekan kerja mengusulkan: \"Mari kita ganti kantong plastik packing dengan kardus tebal berpita emas agar komplain hilang\". Apakah usulan tersebut tepat?",
    "options": [
      "Ya, karena kemasan mewah selalu disukai pembeli",
      "Tidak tepat, karena masalah utamanya ada pada kecepatan jasa ekspedisi atau kurir, bukan pada kemasannya",
      "Ya, kardus tebal otomatis membuat kurir mengantar lebih cepat",
      "Tepat, asalkan harga barang dinaikkan 2 kali lipat",
      "Ya, pita emas bisa menggantikan barang yang terlambat"
    ],
    "correct_answer": "Tidak tepat, karena masalah utamanya ada pada kecepatan jasa ekspedisi atau kurir, bukan pada kemasannya",
    "explanation": "Solusi harus menyelesaikan akar masalah (root cause) yaitu keterlambatan pengiriman, bukan perubahan kemasan."
  }
]

# Convert new questions to properly indented JS string
lines = []
for q in new_questions:
    q_str = json.dumps(q, indent=4, ensure_ascii=False)
    # indent by 2 spaces
    indented = '\n'.join('  ' + line for line in q_str.split('\n'))
    lines.append(indented)

replacement_block = ',\n'.join(lines)

with open('public/assessment.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Locate from COG_BIZ_01 to COG_SIL_01
start_target = '  {\n    "id": "COG_BIZ_01",'
end_target = '  {\n    "id": "COG_SIL_01",'

idx_start = html.find(start_target)
idx_end = html.find(end_target)

assert idx_start != -1, "Could not find start_target COG_BIZ_01"
assert idx_end != -1, "Could not find end_target COG_SIL_01"

print(f"Target found between {idx_start} and {idx_end}")

new_html = html[:idx_start] + replacement_block + ',\n' + html[idx_end:]

with open('public/assessment.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Successfully replaced COG_BIZ_01 through COG_DAT_08 in public/assessment.html!")
