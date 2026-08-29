/**
 * Firebase Realtime Database Seed Script for PGE Talent Pool
 * 
 * Uses Node.js built-in fetch (Node 18+) and the Firebase REST API
 * to populate candidate data and metadata in a single PUT operation.
 */

const DATABASE_URL = 'https://talentpool-34137-default-rtdb.asia-southeast1.firebasedatabase.app';

const now = Date.now();

const rawCandidates = [
  {
    id: 'PGE-001',
    name: 'Lia Ana Pratama',
    phone: '+6281323319026',
    email: 'liaanapratama21@gmail.com',
    education: 'Fresh Graduate (Duta Bangsa)',
    domisili: 'Banjarsari',
    skills: { foto: 4, video: 5, editing: 4, sense: 5 },
    overallRating: 5,
    portfolioUrl: 'CV\\CV - Portofolio (Lia Ana Pratama).pdf',
    notes: 'Source: Email'
  },
  {
    id: 'PGE-002',
    name: 'Rizky Abdullah',
    phone: '+6285157199358',
    email: 'riskiabdulah112@gmail.com',
    education: 'Mahasiswa Aktif (Universitas terbuka)',
    domisili: 'Jebres',
    skills: { foto: 5, video: 5, editing: 5, sense: 4 },
    overallRating: 5,
    portfolioUrl: 'CV\\Latest Personal Portfolio_Rizky Abdullah_ July 26.pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-003',
    name: 'Deviana Putri Wahyudi',
    phone: '+6281237707919',
    email: 'devianapw@gmail.com',
    education: 'Mahasiswa Aktif (USB)',
    domisili: 'Surakarta',
    skills: { foto: 4, video: 3, editing: 4, sense: 4 },
    overallRating: 4,
    portfolioUrl: 'https://drive.google.com/drive/folders/1rysH8kTC2aBwUOgxOdbdHGsSIQsiBYCA',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-004',
    name: 'Rahdan Hutama',
    phone: '+6282276022168',
    email: 'rahdanvol11@gmail.com',
    education: 'Fresh Graduate (ISI)',
    domisili: 'Surakarta',
    skills: { foto: 5, video: 3, editing: 4, sense: 3 },
    overallRating: 4,
    portfolioUrl: 'CV\\PORTOFOLIO RAHDAN HUTAMA.pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-005',
    name: 'Abdul Rouf Alghofar',
    phone: '+6285867405226',
    email: '',
    education: 'Profesional',
    domisili: 'Kartosuro',
    skills: { foto: 3, video: 3, editing: 4, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'https://drive.google.com/drive/folders/1PusfLcxfuI0vH-Ne79MrhylkuooJGiaL',
    notes: 'Source: Email'
  },
  {
    id: 'PGE-006',
    name: 'Dini Ayu Milany',
    phone: '+6285642359407',
    email: 'dinimilany@gmail.com',
    education: 'SMA/SMK',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 4, editing: 4, sense: 4 },
    overallRating: 4,
    portfolioUrl: 'https://drive.google.com/drive/folders/19AXdnLvjvxRAnKGBb1LxpGJQoBxO-wdc?usp=sharing',
    notes: 'Source: Email'
  },
  {
    id: 'PGE-007',
    name: 'Anggun Permatasari',
    phone: '+6281252080760',
    email: 'anggunpermatasariasli@gmail.com',
    education: 'Profesional',
    domisili: 'Karanganyar',
    skills: { foto: 4, video: 4, editing: 4, sense: 4 },
    overallRating: 4,
    portfolioUrl: 'CV\\PORTOFOLIO CONTENT CREATOR .pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-008',
    name: 'Putri Pandu Pertiwi',
    phone: '+6287775884427',
    email: 'pertiwiputri218@gmail.com',
    education: 'SMA/SMK',
    domisili: 'Karanggede',
    skills: { foto: 4, video: 4, editing: 3, sense: 4 },
    overallRating: 4,
    portfolioUrl: 'https://sawlader.my.canva.site/portoputripandu',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-009',
    name: 'Alvie Chasanah',
    phone: '+6285867107306',
    email: 'salma.alvie99@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 5, video: 5, editing: 5, sense: 5 },
    overallRating: 5,
    portfolioUrl: 'https://salmaal.my.canva.site/',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-010',
    name: 'Nabilla Nur Azizah',
    phone: '+62882007676522',
    email: 'nabillaazizah4@gmail.com',
    education: 'Profesional',
    domisili: '-',
    skills: { foto: 4, video: 3, editing: 3, sense: 4 },
    overallRating: 4,
    portfolioUrl: 'CV\\Portofolio Nura konten.pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-011',
    name: 'Galih Adhi S',
    phone: '+62882006619182',
    email: 'adhigalih40@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\Portofolio konten_Galih adhi.pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-012',
    name: 'Indah Chahyanti',
    phone: '+628971506347',
    email: 'Chahyantii806@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\WhatsApp Video 2026-07-27 at 13.25.49.mp4',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-013',
    name: 'Vika Nindhi',
    phone: '+6282172111836',
    email: 'nindyvika18@gmail.com',
    education: 'Profesional',
    domisili: 'Sukoharjo',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'https://vt.tiktok.com/ZS41JjvFo/',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-014',
    name: 'Melinia Eka Budianti',
    phone: '+6283110801114',
    email: 'meliniaeka@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\ssstik.io_@cilopimshop_1783661279088.mp4',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-015',
    name: 'elvira romadhony',
    phone: '+6285117392229',
    email: 'elvirapromadhony18@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 4, video: 4, editing: 5, sense: 5 },
    overallRating: 5,
    portfolioUrl: 'CV\\PORTOFOLIO ELVIRA P.pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-016',
    name: 'Siti Aisiah',
    phone: '+6289520133438',
    email: '',
    education: 'Fresh Graduate',
    domisili: 'Sukoharjo',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\Portofolio_.pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-017',
    name: 'Putri Nanda Ika',
    phone: '+6285743718396',
    email: 'putriinandaika@gmail.com',
    education: 'Mahasiswa Aktif',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 4 },
    overallRating: 3,
    portfolioUrl: 'CV\\PORTOFOLIO PUTRI NANDA .pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-018',
    name: 'Bayu Badra',
    phone: '+6287879675744',
    email: 'bayubadras7@gmail.com',
    education: 'Profesional',
    domisili: 'Sukoharjo',
    skills: { foto: 4, video: 3, editing: 5, sense: 4 },
    overallRating: 4,
    portfolioUrl: 'CV\\PORTOFOLIO CONTENT SPECIALIST_BAYU BADRA.pdf',
    notes: 'Source: Email'
  },
  {
    id: 'PGE-019',
    name: 'Indra Kurniawan',
    phone: '+6289690892458',
    email: 'indrakurniawann60@gmail.com',
    education: 'Mahasiswa Aktif',
    domisili: 'Sukoharjo',
    skills: { foto: 3, video: 3, editing: 4, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\CV Indra Kurniawan.pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-020',
    name: 'Mei Widyaningsih',
    phone: '+6281927911302',
    email: 'Meiwidya624@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 4, video: 4, editing: 4, sense: 4 },
    overallRating: 4,
    portfolioUrl: 'CV\\Portofolio Mei Widyaningsih_20251012_031617_0000.pdf',
    notes: 'Source: WhatsApp'
  },
  {
    id: 'PGE-021',
    name: 'Karen Gita',
    phone: '+6285803693744',
    email: 'gitakaren6@gmail.com',
    education: 'Mahasiswa Aktif',
    domisili: 'Surakarta',
    skills: { foto: 4, video: 4, editing: 4, sense: 4 },
    overallRating: 4,
    portfolioUrl: 'CV\\Karen Portfolio_.pdf',
    notes: 'Source: email'
  },
  {
    id: 'PGE-022',
    name: 'Wulan Yuniarti',
    phone: '+6283124089877',
    email: 'Wulanyunisa59@gmail.com',
    education: 'Profesional',
    domisili: 'Karanganyar',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\WULAN (Freelance Content Creator).pdf',
    notes: ''
  },
  {
    id: 'PGE-023',
    name: 'Aprilia Widyaningtyas',
    phone: '+62895384204646',
    email: 'aprillia65277@gmail.com',
    education: 'Profesional',
    domisili: 'Sukoharjo',
    skills: { foto: 4, video: 4, editing: 5, sense: 5 },
    overallRating: 5,
    portfolioUrl: 'CV\\Portofolio Aprillia W (1)_compressed (1).pdf',
    notes: 'Source: email'
  },
  {
    id: 'PGE-024',
    name: 'BERLIANA ZAHARA QONITA',
    phone: '+6289630031932',
    email: 'berlianazahara7@gmail.com',
    education: 'Fresh Graduate',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\CV BERLIANA ZAHARA QONITA (1).pdf',
    notes: ''
  },
  {
    id: 'PGE-025',
    name: 'Sekar arum',
    phone: '+62882003776620',
    email: 'sekarum31@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\Portfolio Sekar Arum.pdf',
    notes: ''
  },
  {
    id: 'PGE-026',
    name: 'Wahyu setyo Nugroho',
    phone: '+6281912046596',
    email: 'FORBUSSINESAJALAH@GMAIL.COM',
    education: 'Profesional',
    domisili: 'Sragen',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'link',
    notes: ''
  },
  {
    id: 'PGE-027',
    name: 'Sulva Inggriani',
    phone: '+6289639328080',
    email: 'sulvainggriani@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\Portofolio_Content_Creator_Sulva_Inggriani_Update 2.docx',
    notes: ''
  },
  {
    id: 'PGE-028',
    name: 'Nadila laras Suci',
    phone: '+6282197044209',
    email: 'nadilalarassuci@student.uns.ac.id',
    education: 'Mahasiswa Aktif',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\PORTOFOLIO_NADILA LARAS SUCI (1).pdf',
    notes: ''
  },
  {
    id: 'PGE-029',
    name: 'Erza Rizki Akbar',
    phone: '+62895335452860',
    email: 'erzarizky22@gmail.com',
    education: 'Mahasiswa Aktif',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\WhatsApp Video 2026-08-26 at 12.18.42.mp4',
    notes: ''
  },
  {
    id: 'PGE-030',
    name: 'Sinta Rahmalia',
    phone: '+62882007567394',
    email: 'sintarahmalia44@gmail.com',
    education: 'Profesional',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'link',
    notes: ''
  },
  {
    id: 'PGE-031',
    name: 'Bertha Damara',
    phone: '+6285198507192',
    email: 'damarabertha549@gmail.com',
    education: 'Profesional',
    domisili: 'Sragen',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'LINK',
    notes: ''
  },
  {
    id: 'PGE-032',
    name: 'Abdurohman Alharits',
    phone: '+6285894047244',
    email: 'abdurrohmanalharits@gmail.com',
    education: 'Mahasiswa Aktif',
    domisili: 'Surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'LINK',
    notes: ''
  },
  {
    id: 'PGE-033',
    name: 'Fitria Nofvita Paramitha',
    phone: '+6283141644178',
    email: 'nofvitafitria11@gmail.com',
    education: 'Fresh Graduate',
    domisili: 'surakarta',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\Portofolio_Fitria N.P..pdf',
    notes: ''
  },
  {
    id: 'PGE-034',
    name: 'Mutia zulfa nur fadhila',
    phone: '+6285869505546',
    email: 'mutiazulfanf@gmail.com',
    education: 'Profesional',
    domisili: 'Sukoharjo',
    skills: { foto: 3, video: 3, editing: 3, sense: 3 },
    overallRating: 3,
    portfolioUrl: 'CV\\PORTOFOLIO MUTIA ZULFA.pdf',
    notes: ''
  }
];

// Build talents dictionary
const talents = {};
for (const cand of rawCandidates) {
  talents[cand.id] = {
    id: cand.id,
    name: cand.name,
    role: 'Freelance Content Creator',
    phone: cand.phone,
    email: cand.email,
    education: cand.education,
    domisili: cand.domisili,
    skills: cand.skills,
    overallRating: cand.overallRating,
    stage: 'Prospect',
    expectedSalary: 'Standard Uang Saku',
    cvUrl: '',
    portfolioUrl: cand.portfolioUrl,
    notes: cand.notes,
    createdAt: now,
    updatedAt: now
  };
}

const metadata = {
  nextId: 35,
  totalCount: 34
};

const payload = {
  talents,
  metadata
};

async function seed() {
  console.log('==============================================');
  console.log(' PGE Talent Pool - Firebase Realtime DB Seeder');
  console.log('==============================================\n');
  console.log(`Target URL : ${DATABASE_URL}`);
  console.log(`Candidates : ${rawCandidates.length} records (PGE-001 -> PGE-034)`);
  console.log(`Metadata   : nextId=${metadata.nextId}, totalCount=${metadata.totalCount}\n`);

  console.log('Sending PUT request to root /.json ...');
  
  try {
    const response = await fetch(`${DATABASE_URL}/.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status} (${response.statusText}): ${errorText}`);
    }

    const data = await response.json();
    console.log('\n[SUCCESS] Successfully seeded database!');
    console.log(`  - Talents inserted : ${Object.keys(data.talents || {}).length}`);
    console.log(`  - Metadata updated  : nextId=${data.metadata?.nextId}, totalCount=${data.metadata?.totalCount}`);
    console.log('\nSeeding completed successfully.');
  } catch (err) {
    console.error('\n[ERROR] Failed to seed Firebase database:');
    console.error(err.message);
    process.exit(1);
  }
}

seed();
