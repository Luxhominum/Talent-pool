const fs = require('fs');
const XLSX = require('xlsx');

const filePath = 'C:/Users/User/Documents/HRD/Resa/Recruitment/Freelance Content Creator/PGE_Talent_Pool_Freelance_Content_Creator.xlsx';

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Talent Pool'] || workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

function convertRating(level) {
  const l = String(level).toLowerCase().trim();
  if (l.includes('advanced') || l.includes('ahli')) return 5;
  if (l.includes('intermediate') || l.includes('menengah')) return 4;
  if (l.includes('basic') || l.includes('dasar')) return 3;
  return 3;
}

function cleanPhone(p) {
  if (!p) return '';
  let str = String(p).replace(/[^0-9]/g, '');
  if (str.startsWith('08')) {
    str = '+628' + str.substring(2);
  } else if (str.startsWith('628')) {
    str = '+' + str;
  } else if (str.startsWith('8')) {
    str = '+62' + str;
  }
  return str;
}

const formattedTalents = rows.map((r, i) => {
  const name = r['Nama Kandidat'] ? String(r['Nama Kandidat']).trim() : '';
  if (!name || name === 'Nama Kandidat') return null;

  const phone = cleanPhone(r['No. WA'] || r['No WA'] || r['Telepon'] || r['Phone']);
  const email = r['Email'] ? String(r['Email']).trim() : '';
  const education = r['Pendidikan'] || 'Fresh Graduate';
  const campus = r['Asal Sekolah/Kampus'] || '';
  const domisili = r['Domisili'] || '';
  const portfolioLink = r['Portfolio Link'] || r['CV'] || '';

  const skills = [
    { name: 'Foto Produk', rating: convertRating(r['Basic Foto']) },
    { name: 'Video Produk', rating: convertRating(r['Basic Video']) },
    { name: 'Video Editing', rating: convertRating(r['Basic Editing']) },
    { name: 'Content Sense', rating: convertRating(r['Content Sense']) }
  ];

  const overallRating = Math.max(3, Math.round(skills.reduce((acc, s) => acc + s.rating, 0) / skills.length));

  let notes = '';
  if (education) notes += `Pendidikan: ${education} ${campus ? `(${campus})` : ''}\n`;
  if (domisili) notes += `Domisili: ${domisili}\n`;
  if (r['Status Panggilan']) notes += `Status Panggilan: ${r['Status Panggilan']}\n`;
  if (r['Source']) notes += `Source: ${r['Source']}\n`;

  return {
    id: 'PGE-' + String(i + 1).padStart(3, '0'),
    name: name,
    role: 'Freelance Content Creator',
    phone: phone,
    email: email,
    experienceLevel: 'Junior',
    overallRating: overallRating,
    skills: skills,
    stage: r['Status Panggilan'] && String(r['Status Panggilan']).toLowerCase().includes('prioritas') ? 'Interviewed' : 'Prospect',
    expectedSalary: 'Standard Uang Saku',
    cvUrl: '',
    cvFileId: '',
    portfolioUrl: portfolioLink,
    portfolioFileId: '',
    links: { portfolio: portfolioLink },
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}).filter(Boolean);

console.log(`Parsed ${formattedTalents.length} candidates from Excel!`);
fs.writeFileSync('excel_talents.json', JSON.stringify(formattedTalents, null, 2));
