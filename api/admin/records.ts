export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const secretKey = req.query?.token || req.headers?.['x-admin-token'];
  const expectedSecret = process.env.ADMIN_SECRET || 'aa_tetehku_secret';

  if (secretKey !== expectedSecret) {
    return res.status(403).json({ error: 'Unauthorized admin access' });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true, message: 'Daftar berhasil dihapus' });
  }

  return res.status(200).json({
    records: [],
  });
}
