const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const oldMapBlock = `        const items = (response.documents || []).map(doc => {
          let skills = [];
          let portfolioItems = [];
          try { if (doc.skillsJson) skills = JSON.parse(doc.skillsJson); } catch (e) {}
          try { if (doc.portfolioItemsJson) portfolioItems = JSON.parse(doc.portfolioItemsJson); } catch (e) {}

          return {
            $id: doc.$id,
            id: doc.talentId || doc.$id,
            name: toTitleCase(doc.name || ''),
            role: doc.role || 'Freelance Content Creator',
            phone: formatToInternationalPhone(doc.phone || ''),
            email: cleanEmail(doc.email || ''),
            experienceLevel: doc.experienceLevel || 'Junior',
            overallRating: Number(doc.overallRating) || 4,
            stage: (parsedNotes.status === 'Reschedule' && (doc.stage === 'Screening' || !doc.stage)) ? 'Interviewed' : (doc.stage || 'Prospect'),
            expectedSalary: doc.expectedSalary || 'Standard Uang Saku',
            domisili: toTitleCase(doc.domisili || ''),
            education: cleanEducation(doc.education || ''),
            cvUrl: doc.cvUrl || '',
            portfolioUrl: doc.portfolioUrl || '',
            portfolioItems: portfolioItems,
            skills: skills,
            notes: extractOutreachStatus(doc.notes || '').text,
            outreachStatus: extractOutreachStatus(doc.notes || '').status
          };
        });`;

const newMapBlock = `        const items = (response.documents || []).map(doc => {
          let skills = [];
          let portfolioItems = [];
          try { if (doc.skillsJson) skills = JSON.parse(doc.skillsJson); } catch (e) {}
          try { if (doc.portfolioItemsJson) portfolioItems = JSON.parse(doc.portfolioItemsJson); } catch (e) {}

          const parsedNotes = extractOutreachStatus(doc.notes || '');

          return {
            $id: doc.$id,
            id: doc.talentId || doc.$id,
            name: toTitleCase(doc.name || ''),
            role: doc.role || 'Freelance Content Creator',
            phone: formatToInternationalPhone(doc.phone || ''),
            email: cleanEmail(doc.email || ''),
            experienceLevel: doc.experienceLevel || 'Junior',
            overallRating: Number(doc.overallRating) || 4,
            stage: (parsedNotes.status === 'Reschedule' && (doc.stage === 'Screening' || !doc.stage)) ? 'Interviewed' : (doc.stage || 'Prospect'),
            expectedSalary: doc.expectedSalary || 'Standard Uang Saku',
            domisili: toTitleCase(doc.domisili || ''),
            education: cleanEducation(doc.education || ''),
            cvUrl: doc.cvUrl || '',
            portfolioUrl: doc.portfolioUrl || '',
            portfolioItems: portfolioItems,
            skills: skills,
            notes: parsedNotes.text,
            outreachStatus: parsedNotes.status
          };
        });`;

if (html.includes(oldMapBlock)) {
  html = html.replace(oldMapBlock, newMapBlock);
  console.log('Fixed parsedNotes declaration in loadAppwriteTalents.');
} else {
  // Try regex replacement in case of line endings
  const regex = /const items = \(response\.documents \|\| \[\]\)\.map\(doc => \{[\s\S]*?outreachStatus: extractOutreachStatus\(doc\.notes \|\| ''\)\.status\s*\};\s*\}\);/;
  html = html.replace(regex, newMapBlock);
  console.log('Regex replaced parsedNotes in loadAppwriteTalents.');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('public/index.html written.');
