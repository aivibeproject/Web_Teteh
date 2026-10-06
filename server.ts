import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RESPONSES_FILE)) {
  fs.writeFileSync(RESPONSES_FILE, JSON.stringify([], null, 2), 'utf-8');
}

export interface InvitationRecord {
  id: string;
  timestamp: string;
  answer: string;
  selectedDate: string;
  selectedTime: string;
  formattedDate?: string;
  formattedTime?: string;
  notes?: string;
  savedToGoogleSheet?: boolean;
}

// Helper to read responses
function getStoredResponses(): InvitationRecord[] {
  try {
    if (fs.existsSync(RESPONSES_FILE)) {
      const data = fs.readFileSync(RESPONSES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed reading responses file:', err);
  }
  return [];
}

// Helper to save response
function saveResponseToFile(record: InvitationRecord): void {
  try {
    const list = getStoredResponses();
    list.unshift(record); // newest first
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing response to file:', err);
  }
}

// POST endpoint: secretly saves the response
app.post('/api/save-response', async (req: Request, res: Response) => {
  try {
    const { answer, selectedDate, selectedTime, formattedDate, formattedTime, notes } = req.body;

    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace('T', ' ').slice(0, 16);
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    let savedToGoogleSheet = false;
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || process.env.GOOGLE_APPS_SCRIPT_URL;

    const payload = {
      timestamp: req.body.timestamp || timestamp,
      answer: answer || 'YES',
      selectedDate: selectedDate || '',
      selectedTime: selectedTime || '',
      formattedDate: formattedDate || '',
      formattedTime: formattedTime || '',
      notes: notes || 'Tetehku confirmed video call!'
    };

    // Forward to Google Sheets if configured
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const sheetResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (sheetResponse.ok) {
          savedToGoogleSheet = true;
          console.log('[Google Sheets] Successfully posted record to Google Sheets webhook');
        } else {
          console.warn('[Google Sheets] Webhook returned status:', sheetResponse.status);
        }
      } catch (webhookErr) {
        console.error('[Google Sheets] Error sending to webhook:', webhookErr);
      }
    }

    const record: InvitationRecord = {
      id,
      timestamp: payload.timestamp,
      answer: payload.answer,
      selectedDate: payload.selectedDate,
      selectedTime: payload.selectedTime,
      formattedDate: payload.formattedDate,
      formattedTime: payload.formattedTime,
      notes: payload.notes,
      savedToGoogleSheet,
    };

    saveResponseToFile(record);

    res.json({
      success: true,
      id,
      timestamp: record.timestamp,
      savedToGoogleSheet,
    });
  } catch (err: any) {
    console.error('Error saving invitation response:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Admin endpoint for Aa to inspect records secretly
app.get('/api/admin/records', (req: Request, res: Response) => {
  const secretKey = req.query.token || req.headers['x-admin-token'];
  const expectedSecret = process.env.ADMIN_SECRET || 'aa_tetehku_secret';

  if (secretKey !== expectedSecret) {
    return res.status(403).json({ error: 'Unauthorized admin access' });
  }

  const records = getStoredResponses();
  const format = req.query.format;

  if (format === 'csv') {
    let csv = 'Timestamp,Answer,Selected Date,Selected Time,Notes\n';
    records.forEach(r => {
      csv += `"${r.timestamp}","${r.answer}","${r.selectedDate}","${r.selectedTime}","${(r.formattedDate || '') + ' ' + (r.formattedTime || '')}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="invitation_responses.csv"');
    return res.send(csv);
  }

  res.json({
    records,
    googleSheetWebhookConfigured: !!(process.env.GOOGLE_SHEET_WEBHOOK_URL || process.env.GOOGLE_APPS_SCRIPT_URL),
  });
});

// Admin endpoint to delete all records or a single record
app.delete('/api/admin/records', (req: Request, res: Response) => {
  const secretKey = req.query.token || req.headers['x-admin-token'];
  const expectedSecret = process.env.ADMIN_SECRET || 'aa_tetehku_secret';

  if (secretKey !== expectedSecret) {
    return res.status(403).json({ error: 'Unauthorized admin access' });
  }

  try {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify([], null, 2), 'utf-8');
    res.json({ success: true, message: 'Semua daftar catatan berhasil dihapus' });
  } catch (err: any) {
    console.error('Failed to clear records:', err);
    res.status(500).json({ error: 'Gagal menghapus catatan' });
  }
});

app.delete('/api/admin/records/:id', (req: Request, res: Response) => {
  const secretKey = req.query.token || req.headers['x-admin-token'];
  const expectedSecret = process.env.ADMIN_SECRET || 'aa_tetehku_secret';

  if (secretKey !== expectedSecret) {
    return res.status(403).json({ error: 'Unauthorized admin access' });
  }

  try {
    const { id } = req.params;
    const currentList = getStoredResponses();
    const updatedList = currentList.filter(item => item.id !== id);
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(updatedList, null, 2), 'utf-8');
    res.json({ success: true, message: 'Catatan berhasil dihapus' });
  } catch (err: any) {
    console.error('Failed to delete record:', err);
    res.status(500).json({ error: 'Gagal menghapus catatan' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Dynamic import vite for development middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static serving in production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✨ Server running on http://localhost:${PORT}`);
  });
}

startServer();
