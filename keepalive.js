/**
 * Appwrite Keep-Alive Heartbeat Script
 * Sends a lightweight request to keep the Appwrite project active and prevent auto-pausing.
 */
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1/databases/talent_pool_db/collections/talents/documents';
const PROJECT_ID = '6a9131260006737c5919';

async function pingAppwrite() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔄 Sending keep-alive ping to Appwrite (${PROJECT_ID})...`);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[${timestamp}] ✅ SUCCESS: Appwrite is ACTIVE. Total candidates: ${data.total || data.documents?.length || 0}`);
    } else {
      console.warn(`[${timestamp}] ⚠️ WARNING: HTTP ${response.status}`, data);
    }
  } catch (err) {
    console.error(`[${timestamp}] ❌ ERROR: Failed to reach Appwrite:`, err.message);
  }
}

pingAppwrite();
