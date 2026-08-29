/**
 * =========================================================================
 * PGE TALENT POOL - High-Performance Production Backend (V8)
 * Explicit Binding to Spreadsheet ID: 14e8zSKkqBXmgQwzmZv_mvSS4xitximZLmInZXoUAAdQ
 * Single-Batch Range Writes + Dynamic Synonymous Column Resolution + Drive Streaming
 * =========================================================================
 */

const CONFIG = {
  SPREADSHEET_ID: '14e8zSKkqBXmgQwzmZv_mvSS4xitximZLmInZXoUAAdQ',
  TARGET_GID: 0,
  DRIVE_FOLDER_NAME: 'TalentPool_Uploads',
  HEADERS: [
    'ID',
    'Nama Kandidat',
    'Role',
    'No. WA',
    'Email',
    'Pendidikan',
    'Domisili',
    'Basic Foto',
    'Basic Video',
    'Basic Editing',
    'Content Sense',
    'Overall Rating',
    'Status Panggilan',
    'Expected Salary',
    'CV Link',
    'Portfolio Link',
    'Notes'
  ]
};

const INITIAL_TALENT_ROWS = [
  ["PGE-001", "Lia Ana Pratama", "Freelance Content Creator", "+6281323319026", "liaanapratama21@gmail.com", "Fresh Graduate (Duta Bangsa)", "Banjarsari", 4, 5, 4, 5, 5, "Prospect", "Standard Uang Saku", "", "CV\\CV - Portofolio (Lia Ana Pratama).pdf", "Pendidikan: Fresh Graduate (Duta Bangsa)\nDomisili: Banjarsari\nSource: Email"],
  ["PGE-002", "Rizky Abdullah", "Freelance Content Creator", "+6285157199358", "riskiabdulah112@gmail.com", "Mahasiswa Aktif (Universitas terbuka)", "Jebres", 5, 5, 5, 4, 5, "Prospect", "Standard Uang Saku", "", "CV\\Latest Personal Portfolio_Rizky Abdullah_ July 26.pdf", "Pendidikan: Mahasiswa Aktif (Universitas terbuka)\nDomisili: Jebres\nSource: WhatsApp"],
  ["PGE-003", "Deviana Putri Wahyudi", "Freelance Content Creator", "+6281237707919", "devianapw@gmail.com", "Mahasiswa Aktif (USB)", "Surakarta", 4, 3, 4, 4, 4, "Prospect", "Standard Uang Saku", "", "https://drive.google.com/drive/folders/1rysH8kTC2aBwUOgxOdbdHGsSIQsiBYCA", "Pendidikan: Mahasiswa Aktif (USB)\nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-004", "Rahdan Hutama", "Freelance Content Creator", "+6282276022168", "rahdanvol11@gmail.com", "Fresh Graduate (ISI)", "Surakarta", 5, 3, 4, 3, 4, "Prospect", "Standard Uang Saku", "", "CV\\PORTOFOLIO RAHDAN HUTAMA.pdf", "Pendidikan: Fresh Graduate (ISI)\nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-005", "Abdul Rouf Alghofar", "Freelance Content Creator", "+6285867405226", "", "Profesional", "Kartosuro", 3, 3, 4, 3, 3, "Prospect", "Standard Uang Saku", "", "https://drive.google.com/drive/folders/1PusfLcxfuI0vH-Ne79MrhylkuooJGiaL", "Pendidikan: Profesional \nDomisili: Kartosuro\nSource: Email"],
  ["PGE-006", "Dini Ayu Milany", "Freelance Content Creator", "+6285642359407", "dinimilany@gmail.com", "SMA/SMK", "Surakarta", 3, 4, 4, 4, 4, "Prospect", "Standard Uang Saku", "", "https://drive.google.com/drive/folders/19AXdnLvjvxRAnKGBb1LxpGJQoBxO-wdc?usp=sharing", "Pendidikan: SMA/SMK \nDomisili: Surakarta\nSource: Email"],
  ["PGE-007", "Anggun Permatasari", "Freelance Content Creator", "+6281252080760", "anggunpermatasariasli@gmail.com", "Profesional", "Karanganyar", 4, 4, 4, 4, 4, "Prospect", "Standard Uang Saku", "", "CV\\PORTOFOLIO CONTENT CREATOR .pdf", "Pendidikan: Profesional \nDomisili: Karanganyar\nSource: WhatsApp"],
  ["PGE-008", "Putri Pandu Pertiwi", "Freelance Content Creator", "+6287775884427", "pertiwiputri218@gmail.com", "SMA/SMK", "Karanggede", 4, 4, 3, 4, 4, "Prospect", "Standard Uang Saku", "", "https://sawlader.my.canva.site/portoputripandu", "Pendidikan: SMA/SMK \nDomisili: Karanggede\nSource: WhatsApp"],
  ["PGE-009", "Alvie Chasanah", "Freelance Content Creator", "+6285867107306", "salma.alvie99@gmail.com", "Profesional", "Surakarta", 5, 5, 5, 5, 5, "Prospect", "Standard Uang Saku", "", "https://salmaal.my.canva.site/", "Pendidikan: Profesional \nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-010", "Nabilla Nur Azizah", "Freelance Content Creator", "+62882007676522", "nabillaazizah4@gmail.com", "Profesional", "-", 4, 3, 3, 4, 4, "Prospect", "Standard Uang Saku", "", "CV\\Portofolio Nura konten.pdf", "Pendidikan: Profesional \nDomisili: -\nSource: WhatsApp"],
  ["PGE-011", "Galih Adhi S", "Freelance Content Creator", "+62882006619182", "adhigalih40@gmail.com", "Profesional", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\Portofolio konten_Galih adhi.pdf", "Pendidikan: Profesional \nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-012", "Indah Chahyanti", "Freelance Content Creator", "+628971506347", "Chahyantii806@gmail.com", "Profesional", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\WhatsApp Video 2026-07-27 at 13.25.49.mp4", "Pendidikan: Profesional \nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-013", "Vika Nindhi", "Freelance Content Creator", "+6282172111836", "nindyvika18@gmail.com", "Profesional", "Sukoharjo", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "https://vt.tiktok.com/ZS41JjvFo/", "Pendidikan: Profesional \nDomisili: Sukoharjo\nSource: WhatsApp"],
  ["PGE-014", "Melinia Eka Budianti", "Freelance Content Creator", "+6283110801114", "meliniaeka@gmail.com", "Profesional", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\ssstik.io_@cilopimshop_1783661279088.mp4", "Pendidikan: Profesional \nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-015", "elvira romadhony", "Freelance Content Creator", "+6285117392229", "elvirapromadhony18@gmail.com", "Profesional", "Surakarta", 4, 4, 5, 5, 5, "Prospect", "Standard Uang Saku", "", "CV\\PORTOFOLIO ELVIRA P.pdf", "Pendidikan: Profesional \nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-016", "Siti Aisiah", "Freelance Content Creator", "+6289520133438", "", "Fresh Graduate", "Sukoharjo", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\Portofolio_.pdf", "Pendidikan: Fresh Graduate \nDomisili: Sukoharjo\nSource: WhatsApp"],
  ["PGE-017", "Putri Nanda Ika", "Freelance Content Creator", "+6285743718396", "putriinandaika@gmail.com", "Mahasiswa Aktif", "Surakarta", 3, 3, 3, 4, 3, "Prospect", "Standard Uang Saku", "", "CV\\PORTOFOLIO PUTRI NANDA .pdf", "Pendidikan: Mahasiswa Aktif \nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-018", "Bayu Badra", "Freelance Content Creator", "+6287879675744", "bayubadras7@gmail.com", "Profesional", "Sukoharjo", 4, 3, 5, 4, 4, "Prospect", "Standard Uang Saku", "", "CV\\PORTOFOLIO CONTENT SPECIALIST_BAYU BADRA.pdf", "Pendidikan: Profesional \nDomisili: Sukoharjo\nSource: Email"],
  ["PGE-019", "Indra Kurniawan", "Freelance Content Creator", "+6289690892458", "indrakurniawann60@gmail.com", "Mahasiswa Aktif", "Sukoharjo", 3, 3, 4, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\CV Indra Kurniawan.pdf", "Pendidikan: Mahasiswa Aktif \nDomisili: Sukoharjo\nSource: WhatsApp"],
  ["PGE-020", "Mei Widyaningsih", "Freelance Content Creator", "+6281927911302", "Meiwidya624@gmail.com", "Profesional", "Surakarta", 4, 4, 4, 4, 4, "Prospect", "Standard Uang Saku", "", "CV\\Portofolio Mei Widyaningsih_20251012_031617_0000.pdf", "Pendidikan: Profesional \nDomisili: Surakarta\nSource: WhatsApp"],
  ["PGE-021", "Karen Gita", "Freelance Content Creator", "+6285803693744", "gitakaren6@gmail.com", "Mahasiswa Aktif", "Surakarta", 4, 4, 4, 4, 4, "Prospect", "Standard Uang Saku", "", "CV\\Karen Portfolio_.pdf", "Pendidikan: Mahasiswa Aktif \nDomisili: Surakarta\nSource: email"],
  ["PGE-022", "Wulan Yuniarti", "Freelance Content Creator", "+6283124089877", "Wulanyunisa59@gmail.com", "Profesional", "Karanganyar", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\WULAN (Freelance Content Creator).pdf", "Pendidikan: Profesional \nDomisili: Karanganyar"],
  ["PGE-023", "Aprilia Widyaningtyas", "Freelance Content Creator", "+62895384204646", "aprillia65277@gmail.com", "Profesional", "Sukoharjo", 4, 4, 5, 5, 5, "Prospect", "Standard Uang Saku", "", "CV\\Portofolio Aprillia W (1)_compressed (1).pdf", "Pendidikan: Profesional \nDomisili: Sukoharjo\nSource: email"],
  ["PGE-024", "BERLIANA ZAHARA QONITA", "Freelance Content Creator", "+6289630031932", "berlianazahara7@gmail.com", "Fresh Graduate", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\CV BERLIANA ZAHARA QONITA (1).pdf", "Pendidikan: Fresh Graduate \nDomisili: Surakarta"],
  ["PGE-025", "Sekar arum", "Freelance Content Creator", "+62882003776620", "sekarum31@gmail.com", "Profesional", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\Portfolio Sekar Arum.pdf", "Pendidikan: Profesional \nDomisili: Surakarta"],
  ["PGE-026", "Wahyu setyo Nugroho", "Freelance Content Creator", "+6281912046596", "FORBUSSINESAJALAH@GMAIL.COM", "Profesional", "Sragen", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "link", "Pendidikan: Profesional \nDomisili: Sragen"],
  ["PGE-027", "Sulva Inggriani", "Freelance Content Creator", "+6289639328080", "sulvainggriani@gmail.com", "Profesional", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\Portofolio_Content_Creator_Sulva_Inggriani_Update 2.docx", "Pendidikan: Profesional \nDomisili: Surakarta"],
  ["PGE-028", "Nadila laras Suci", "Freelance Content Creator", "+6282197044209", "nadilalarassuci@student.uns.ac.id", "Mahasiswa Aktif", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\PORTOFOLIO_NADILA LARAS SUCI (1).pdf", "Pendidikan: Mahasiswa Aktif \nDomisili: Surakarta"],
  ["PGE-029", "Erza Rizki Akbar", "Freelance Content Creator", "+62895335452860", "erzarizky22@gmail.com", "Mahasiswa Aktif", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\WhatsApp Video 2026-08-26 at 12.18.42.mp4", "Pendidikan: Mahasiswa Aktif \nDomisili: Surakarta"],
  ["PGE-030", "Sinta Rahmalia", "Freelance Content Creator", "+62882007567394", "sintarahmalia44@gmail.com", "Profesional", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "link", "Pendidikan: Profesional \nDomisili: Surakarta"],
  ["PGE-031", "Bertha Damara", "Freelance Content Creator", "+6285198507192", "damarabertha549@gmail.com", "Profesional", "Sragen", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "LINK", "Pendidikan: Profesional \nDomisili: Sragen"],
  ["PGE-032", "Abdurohman Alharits", "Freelance Content Creator", "+6285894047244", "abdurrohmanalharits@gmail.com", "Mahasiswa Aktif", "Surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "LINK", "Pendidikan: Mahasiswa Aktif \nDomisili: Surakarta"],
  ["PGE-033", "Fitria Nofvita Paramitha", "Freelance Content Creator", "+6283141644178", "nofvitafitria11@gmail.com", "Fresh Graduate", "surakarta", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\Portofolio_Fitria N.P..pdf", "Pendidikan: Fresh Graduate \nDomisili: surakarta"],
  ["PGE-034", "Mutia zulfa nur fadhila", "Freelance Content Creator", "+6285869505546", "mutiazulfanf@gmail.com", "Profesional", "Sukoharjo", 3, 3, 3, 3, 3, "Prospect", "Standard Uang Saku", "", "CV\\PORTOFOLIO MUTIA ZULFA.pdf", "Pendidikan: Profesional \nDomisili: Sukoharjo"]
];

/**
 * Main Web App Handler
 * @param {Object} e HTTP Event Parameter
 * @return {HtmlOutput|TextOutput}
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.format === 'json') {
    return ContentService.createTextOutput(JSON.stringify(getTalents()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('PGE Talent Pool | Candidate Repository')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handles POST requests for Google Drive direct file uploads
 * @param {Object} e HTTP Post Event
 * @return {TextOutput} JSON response with Drive share URL
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'No post data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'uploadChunk') {
      const res = handleChunkUpload(data);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (data.action === 'uploadFile' || data.fileObj) {
      const res = uploadSingleFileToDrive(data.fileObj, data.prefix || 'PGE');
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getUploadFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
}

function handleChunkUpload(data) {
  try {
    const folder = getUploadFolder();
    const sessionId = data.sessionId;
    const chunkIndex = Number(data.chunkIndex);
    const totalChunks = Number(data.totalChunks);
    const fileName = data.fileName || 'document';
    const mimeType = data.mimeType || 'application/octet-stream';
    const prefix = data.prefix || 'PGE';
    const base64Chunk = data.base64Chunk || '';

    // Store each base64 segment as a lightweight temp text file
    const pieceBlob = Utilities.newBlob(base64Chunk, 'text/plain', 'temp_' + sessionId + '_' + chunkIndex + '.txt');
    folder.createFile(pieceBlob);

    if (chunkIndex === totalChunks - 1) {
      let completeBase64 = '';
      const filesToDelete = [];

      for (let i = 0; i < totalChunks; i++) {
        const pieceName = 'temp_' + sessionId + '_' + i + '.txt';
        const fIter = folder.getFilesByName(pieceName);
        if (fIter.hasNext()) {
          const pFile = fIter.next();
          filesToDelete.push(pFile);
          completeBase64 += pFile.getBlob().getDataAsString();
        }
      }

      // Memory-safe native C++/Java base64 decode and Drive file creation
      const finalBlob = Utilities.newBlob(Utilities.base64Decode(completeBase64), mimeType, (prefix ? prefix + '_' : '') + fileName);
      const finalFile = folder.createFile(finalBlob);
      finalFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      // Clean up temporary text slices
      filesToDelete.forEach(function(f) { f.setTrashed(true); });

      return {
        success: true,
        completed: true,
        url: finalFile.getUrl(),
        id: finalFile.getId(),
        name: finalFile.getName()
      };
    }

    return { success: true, completed: false, chunkIndex: chunkIndex };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Access Google Spreadsheet by ID
 * @return {SpreadsheetApp.Spreadsheet}
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } catch (err) {
    throw new Error('Failed to open Spreadsheet ID ' + CONFIG.SPREADSHEET_ID + ': ' + err.toString());
  }
}

/**
 * Locate target worksheet tab
 * @return {SpreadsheetApp.Sheet}
 */
function getSheet() {
  const ss = getSpreadsheet();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === CONFIG.TARGET_GID) {
      return sheets[i];
    }
  }
  return sheets[0];
}

/**
 * Auto-seeds table headers and initial candidate records if spreadsheet tab is blank
 */
function ensureSheetInitialized() {
  const sheet = getSheet();
  let lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastCol < CONFIG.HEADERS.length) {
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setFontWeight('bold').setBackground('#F3F4F6');
    sheet.setFrozenRows(1);
  }

  lastRow = sheet.getLastRow();
  if (lastRow <= 1 && INITIAL_TALENT_ROWS && INITIAL_TALENT_ROWS.length > 0) {
    sheet.getRange(2, 1, INITIAL_TALENT_ROWS.length, CONFIG.HEADERS.length).setValues(INITIAL_TALENT_ROWS);
    SpreadsheetApp.flush();
  }
}

/**
 * Helper to build a synonymous column mapping object from header text
 * @param {Array<string>} headerValues Header array
 * @return {Object} Index mapping object
 */
function buildColumnIndices(headerValues) {
  const colMap = {};
  headerValues.forEach((h, i) => {
    if (h) colMap[String(h).trim().toLowerCase()] = i;
  });

  return {
    cId: findColIndex(colMap, ['id', 'kode', 'no']),
    cName: findColIndex(colMap, ['nama kandidat', 'nama', 'name']),
    cRole: findColIndex(colMap, ['role', 'posisi']),
    cPhone: findColIndex(colMap, ['no. wa', 'no wa', 'wa', 'telepon', 'phone']),
    cEmail: findColIndex(colMap, ['email', 'surel']),
    cEdu: findColIndex(colMap, ['pendidikan', 'education']),
    cDom: findColIndex(colMap, ['domisili', 'kota']),
    cFoto: findColIndex(colMap, ['basic foto', 'foto']),
    cVideo: findColIndex(colMap, ['basic video', 'video']),
    cEdit: findColIndex(colMap, ['basic editing', 'editing']),
    cSense: findColIndex(colMap, ['content sense', 'sense']),
    cRating: findColIndex(colMap, ['overall rating', 'rating']),
    cStage: findColIndex(colMap, ['status panggilan', 'stage', 'status']),
    cSalary: findColIndex(colMap, ['expected salary', 'gaji']),
    cCv: findColIndex(colMap, ['cv link', 'cv url', 'cv']),
    cPorto: findColIndex(colMap, ['portfolio link', 'portfolio url', 'portfolio', 'portofolio']),
    cNotes: findColIndex(colMap, ['notes', 'catatan'])
  };
}

/**
 * Resolves column index using synonyms
 */
function findColIndex(colMap, synonyms) {
  for (let i = 0; i < synonyms.length; i++) {
    const key = synonyms[i].toLowerCase().trim();
    if (colMap[key] !== undefined) return colMap[key];
  }
  for (let i = 0; i < synonyms.length; i++) {
    const key = synonyms[i].toLowerCase().trim();
    for (const colKey in colMap) {
      if (colKey.includes(key) || key.includes(colKey)) {
        return colMap[colKey];
      }
    }
  }
  return -1;
}

/**
 * Safely extracts column cell value
 */
function getColVal(row, colIdx, defaultVal) {
  if (colIdx === -1 || colIdx === undefined || colIdx >= row.length) return (defaultVal !== undefined ? defaultVal : '');
  const val = row[colIdx];
  return val !== null && val !== undefined ? val : (defaultVal !== undefined ? defaultVal : '');
}

/**
 * Formats phone string to standard international +628... format
 */
function formatToInternationalPhone(rawPhone) {
  if (!rawPhone) return '';
  let cleaned = String(rawPhone).replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('08')) cleaned = '+628' + cleaned.substring(2);
  else if (cleaned.startsWith('628')) cleaned = '+' + cleaned;
  else if (cleaned.startsWith('8') && !cleaned.startsWith('+')) cleaned = '+62' + cleaned;
  return cleaned;
}

/**
 * High-Performance Read-Only Candidate Fetching
 * @return {Object} Response payload { success, data, count, spreadsheetUrl }
 */
function getTalents() {
  try {
    const ss = getSpreadsheet();
    ensureSheetInitialized();
    const sheet = getSheet();
    let lastRow = sheet.getLastRow();
    let lastCol = Math.max(sheet.getLastColumn(), CONFIG.HEADERS.length);

    if (lastRow <= 1 && INITIAL_TALENT_ROWS && INITIAL_TALENT_ROWS.length > 0) {
      sheet.getRange(2, 1, INITIAL_TALENT_ROWS.length, CONFIG.HEADERS.length).setValues(INITIAL_TALENT_ROWS);
      SpreadsheetApp.flush();
      lastRow = sheet.getLastRow();
      lastCol = Math.max(sheet.getLastColumn(), CONFIG.HEADERS.length);
    }

    const headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const cols = buildColumnIndices(headerValues);
    const rawData = sheet.getRange(2, 1, Math.max(1, lastRow - 1), lastCol).getValues();
    const talents = [];

    rawData.forEach((row) => {
      const name = cols.cName !== -1 ? String(getColVal(row, cols.cName)).trim() : '';
      if (!name || name.toLowerCase() === 'nama kandidat') return;

      const sFoto = Number(getColVal(row, cols.cFoto, 4)) || 4;
      const sVideo = Number(getColVal(row, cols.cVideo, 4)) || 4;
      const sEdit = Number(getColVal(row, cols.cEdit, 4)) || 4;
      const sSense = Number(getColVal(row, cols.cSense, 4)) || 4;

      const skills = [
        { name: 'Foto Produk', rating: sFoto },
        { name: 'Video Produk', rating: sVideo },
        { name: 'Video Editing', rating: sEdit },
        { name: 'Content Sense', rating: sSense }
      ];

      let overallRating = cols.cRating !== -1 ? Number(getColVal(row, cols.cRating)) : 0;
      if (!overallRating || isNaN(overallRating)) {
        overallRating = Math.round((sFoto + sVideo + sEdit + sSense) / 4);
      }

      let rawStage = cols.cStage !== -1 ? String(getColVal(row, cols.cStage)).trim() : 'Prospect';
      let stage = 'Prospect';
      const sLower = rawStage.toLowerCase();
      if (sLower.includes('hired') || sLower.includes('diterima')) stage = 'Hired';
      else if (sLower.includes('interview') || sLower.includes('prioritas')) stage = 'Interviewed';
      else if (sLower.includes('shortlist')) stage = 'Shortlisted';
      else if (sLower.includes('screen')) stage = 'Screening';
      else if (sLower.includes('offer')) stage = 'Offered';
      else if (sLower.includes('reject') || sLower.includes('archived')) stage = 'Archived';
      else stage = 'Prospect';

      let notes = cols.cNotes !== -1 ? String(getColVal(row, cols.cNotes)).trim() : '';
      const edu = cols.cEdu !== -1 ? String(getColVal(row, cols.cEdu)).trim() : '';
      const dom = cols.cDom !== -1 ? String(getColVal(row, cols.cDom)).trim() : '';

      if (edu && !notes.toLowerCase().includes('pendidikan:')) notes = 'Pendidikan: ' + edu + '\n' + notes;
      if (dom && !notes.toLowerCase().includes('domisili:')) notes = 'Domisili: ' + dom + '\n' + notes;

      const cvUrl = cols.cCv !== -1 ? String(getColVal(row, cols.cCv)).trim() : '';
      const portoUrl = cols.cPorto !== -1 ? String(getColVal(row, cols.cPorto)).trim() : '';

      let portfolioItems = [];
      if (portoUrl) {
        portfolioItems = portoUrl.split(/[\n,]+/).map((u, i) => {
          const trimmed = u.trim();
          const isVid = trimmed.toLowerCase().includes('.mp4') || trimmed.toLowerCase().includes('youtube') || trimmed.toLowerCase().includes('tiktok');
          return { name: isVid ? ('Video Portfolio ' + (i + 1)) : ('Portfolio File ' + (i + 1)), url: trimmed, type: isVid ? 'video' : 'document' };
        }).filter(u => u.url);
      }

      const idVal = cols.cId !== -1 ? String(getColVal(row, cols.cId)).trim() : '';

      talents.push({
        id: idVal.startsWith('PGE-') ? idVal : ('PGE-' + String(talents.length + 1).padStart(3, '0')),
        name: name,
        role: cols.cRole !== -1 && getColVal(row, cols.cRole) ? String(getColVal(row, cols.cRole)).trim() : 'Freelance Content Creator',
        phone: formatToInternationalPhone(cols.cPhone !== -1 ? getColVal(row, cols.cPhone) : ''),
        email: cols.cEmail !== -1 ? String(getColVal(row, cols.cEmail)).trim() : '',
        experienceLevel: 'Junior',
        overallRating: overallRating,
        skills: skills,
        stage: stage,
        expectedSalary: cols.cSalary !== -1 && getColVal(row, cols.cSalary) ? String(getColVal(row, cols.cSalary)).trim() : 'Standard Uang Saku',
        cvUrl: cvUrl,
        portfolioUrl: portoUrl,
        portfolioItems: portfolioItems,
        notes: notes.trim()
      });
    });

    return { success: true, data: talents, count: talents.length, spreadsheetUrl: ss.getUrl() };
  } catch (err) {
    Logger.log('getTalents Error: ' + err.toString());
    return { success: false, error: err.toString(), data: [] };
  }
}

/**
 * Saves or updates a candidate in the Google Sheet (Optimized Single-Batch Range Update)
 * @param {Object} talentData Candidate record payload
 * @return {Object} Response status
 */
function saveTalent(talentData) {
  try {
    ensureSheetInitialized();
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    const lastCol = Math.max(sheet.getLastColumn(), CONFIG.HEADERS.length);
    const headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const cols = buildColumnIndices(headerValues);

    const targetId = talentData.id ? String(talentData.id).trim() : '';
    let foundRow = -1;

    if (targetId && cols.cId !== -1 && lastRow > 1) {
      const ids = sheet.getRange(2, cols.cId + 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]).trim() === targetId) {
          foundRow = i + 2;
          break;
        }
      }
    }

    const portoVal = (talentData.portfolioItems && talentData.portfolioItems.length > 0)
      ? talentData.portfolioItems.map(p => p.url).join('\n')
      : (talentData.portfolioUrl || '');

    // Skill ratings breakdown
    let sFoto = 4, sVideo = 4, sEdit = 4, sSense = 4;
    if (talentData.skills && Array.isArray(talentData.skills)) {
      talentData.skills.forEach(s => {
        const n = String(s.name || '').toLowerCase();
        if (n.includes('foto')) sFoto = Number(s.rating) || 4;
        else if (n.includes('video produk')) sVideo = Number(s.rating) || 4;
        else if (n.includes('editing')) sEdit = Number(s.rating) || 4;
        else if (n.includes('sense')) sSense = Number(s.rating) || 4;
      });
    }

    const overallRating = talentData.overallRating || Math.round((sFoto + sVideo + sEdit + sSense) / 4);

    if (foundRow !== -1) {
      // Single Batch Write: Fetch existing row array, update in memory, write back once
      const existingRow = sheet.getRange(foundRow, 1, 1, lastCol).getValues()[0];
      if (cols.cName !== -1 && talentData.name) existingRow[cols.cName] = talentData.name;
      if (cols.cRole !== -1 && talentData.role) existingRow[cols.cRole] = talentData.role;
      if (cols.cPhone !== -1 && talentData.phone) existingRow[cols.cPhone] = formatToInternationalPhone(talentData.phone);
      if (cols.cEmail !== -1 && talentData.email !== undefined) existingRow[cols.cEmail] = talentData.email;
      if (cols.cEdu !== -1 && talentData.education) existingRow[cols.cEdu] = talentData.education;
      if (cols.cDom !== -1 && talentData.domisili) existingRow[cols.cDom] = talentData.domisili;
      if (cols.cFoto !== -1) existingRow[cols.cFoto] = sFoto;
      if (cols.cVideo !== -1) existingRow[cols.cVideo] = sVideo;
      if (cols.cEdit !== -1) existingRow[cols.cEdit] = sEdit;
      if (cols.cSense !== -1) existingRow[cols.cSense] = sSense;
      if (cols.cRating !== -1) existingRow[cols.cRating] = overallRating;
      if (cols.cStage !== -1 && talentData.stage) existingRow[cols.cStage] = talentData.stage;
      if (cols.cSalary !== -1 && talentData.expectedSalary) existingRow[cols.cSalary] = talentData.expectedSalary;
      if (cols.cCv !== -1 && talentData.cvUrl !== undefined) existingRow[cols.cCv] = talentData.cvUrl;
      if (cols.cPorto !== -1 && portoVal !== undefined) existingRow[cols.cPorto] = portoVal;
      if (cols.cNotes !== -1 && talentData.notes !== undefined) existingRow[cols.cNotes] = talentData.notes;

      sheet.getRange(foundRow, 1, 1, lastCol).setValues([existingRow]);
      return { success: true, data: talentData };
    } else {
      const nextId = 'PGE-' + String(Math.max(1, lastRow)).padStart(3, '0');
      talentData.id = nextId;
      const newRow = new Array(lastCol).fill('');
      if (cols.cId !== -1) newRow[cols.cId] = nextId;
      if (cols.cName !== -1) newRow[cols.cName] = talentData.name || '';
      if (cols.cRole !== -1) newRow[cols.cRole] = talentData.role || 'Freelance Content Creator';
      if (cols.cPhone !== -1) newRow[cols.cPhone] = formatToInternationalPhone(talentData.phone || '');
      if (cols.cEmail !== -1) newRow[cols.cEmail] = talentData.email || '';
      if (cols.cEdu !== -1) newRow[cols.cEdu] = talentData.education || '';
      if (cols.cDom !== -1) newRow[cols.cDom] = talentData.domisili || '';
      if (cols.cFoto !== -1) newRow[cols.cFoto] = sFoto;
      if (cols.cVideo !== -1) newRow[cols.cVideo] = sVideo;
      if (cols.cEdit !== -1) newRow[cols.cEdit] = sEdit;
      if (cols.cSense !== -1) newRow[cols.cSense] = sSense;
      if (cols.cRating !== -1) newRow[cols.cRating] = overallRating;
      if (cols.cStage !== -1) newRow[cols.cStage] = talentData.stage || 'Prospect';
      if (cols.cSalary !== -1) newRow[cols.cSalary] = talentData.expectedSalary || 'Standard Uang Saku';
      if (cols.cCv !== -1) newRow[cols.cCv] = talentData.cvUrl || '';
      if (cols.cPorto !== -1) newRow[cols.cPorto] = portoVal;
      if (cols.cNotes !== -1) newRow[cols.cNotes] = talentData.notes || '';

      sheet.appendRow(newRow);
      return { success: true, data: talentData };
    }
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Deletes candidate row from Google Sheet
 * @param {string} talentId Candidate unique ID (PGE-XXX)
 * @return {Object} Response status
 */
function deleteTalent(talentId) {
  try {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, error: 'Empty sheet' };

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim() === String(talentId).trim()) {
        sheet.deleteRow(i + 2);
        return { success: true };
      }
    }
    return { success: false, error: 'Candidate ID not found' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Streams uploaded files to Google Drive folder 'TalentPool_Uploads'
 * @param {Object} fileObj File object containing base64 string, name, type
 * @param {string} prefix Optional file name prefix
 * @return {Object} Response payload with Drive public URL
 */
function uploadSingleFileToDrive(fileObj, prefix) {
  try {
    if (!fileObj || !fileObj.base64) return { success: false, error: 'Invalid or missing file data' };
    let folder;
    const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
    if (folders.hasNext()) folder = folders.next();
    else folder = DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);

    const decoded = Utilities.base64Decode(fileObj.base64);
    const blob = Utilities.newBlob(decoded, fileObj.type || 'application/octet-stream', (prefix ? prefix + '_' : '') + (fileObj.name || 'doc'));
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return { success: true, url: file.getUrl(), id: file.getId(), name: file.getName() };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
