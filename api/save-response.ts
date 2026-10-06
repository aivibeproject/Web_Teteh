export default async function handler(req: any, res: any) {
  // Support CORS for serverless
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { answer, selectedDate, selectedTime, formattedDate, formattedTime, notes } = req.body || {};
    const timestamp = new Date()
      .toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' })
      .replace('T', ' ')
      .slice(0, 16);
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    let savedToGoogleSheet = false;
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || process.env.GOOGLE_APPS_SCRIPT_URL;

    const payload = {
      timestamp: req.body?.timestamp || timestamp,
      answer: answer || 'YES',
      selectedDate: selectedDate || '',
      selectedTime: selectedTime || '',
      formattedDate: formattedDate || '',
      formattedTime: formattedTime || '',
      notes: notes || 'Tetehku confirmed video call!',
    };

    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const sheetResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (sheetResponse.ok) {
          savedToGoogleSheet = true;
        }
      } catch (webhookErr) {
        console.error('[Vercel API] Webhook error:', webhookErr);
      }
    }

    return res.status(200).json({
      success: true,
      id,
      timestamp: payload.timestamp,
      savedToGoogleSheet,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
