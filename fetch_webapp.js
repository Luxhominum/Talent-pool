const https = require('https');

const url = 'https://script.google.com/macros/s/AKfycbzIC-mHyF6VqxWBl-ljZCSAB5RYeo6rex8wo841rheeODdibPgMxyFci1InN9BtGLH5Vg/exec';

function fetchUrl(url) {
  https.get(url, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers.location || '');
    if (res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      if (res.headers.location.startsWith('https://')) {
        fetchUrl(res.headers.location);
      }
    } else {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Body length:', data.length);
        console.log('Body snippet:', data.slice(0, 500));
      });
    }
  }).on('error', (e) => {
    console.error('Fetch error:', e);
  });
}

fetchUrl(url);
