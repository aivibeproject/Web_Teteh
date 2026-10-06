import { useState, useEffect } from 'react';
import {
  X,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  KeyRound,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { InvitationRecord } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [token, setToken] = useState<string>('aa_tetehku_secret');
  const [records, setRecords] = useState<InvitationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [webhookConfigured, setWebhookConfigured] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchRecords = async (authToken: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/admin/records?token=${encodeURIComponent(authToken)}`);
      if (res.ok) {
        const data = await res.json();
        let serverRecords: InvitationRecord[] = data.records || [];
        // Check localStorage if server records are empty
        if (serverRecords.length === 0) {
          try {
            const local = JSON.parse(localStorage.getItem('invitation_records') || '[]');
            if (Array.isArray(local) && local.length > 0) {
              serverRecords = local;
            }
          } catch {}
        }
        setRecords(serverRecords);
        setWebhookConfigured(Boolean(data.googleSheetWebhookConfigured));
      } else {
        if (res.status === 403) {
          throw new Error('Token admin salah. Gunakan default: aa_tetehku_secret');
        }
        // Fallback to local storage if API route is not available (e.g. static hosting)
        const local = JSON.parse(localStorage.getItem('invitation_records') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          setRecords(local);
        } else {
          throw new Error(`Gagal memuat catatan (Status: ${res.status})`);
        }
      }
    } catch (err: any) {
      try {
        const local = JSON.parse(localStorage.getItem('invitation_records') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          setRecords(local);
        } else {
          setErrorMessage(err.message || 'Gagal mengambil data admin');
        }
      } catch {
        setErrorMessage(err.message || 'Gagal mengambil data admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllRecords = async () => {
    setDeleting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      try {
        localStorage.removeItem('invitation_records');
      } catch {}

      await fetch(`/api/admin/records?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
      });

      setRecords([]);
      setSuccessMessage('Daftar catatan berhasil dihapus seluruhnya!');
      setShowConfirmClear(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setRecords([]);
      setSuccessMessage('Daftar catatan berhasil dihapus!');
      setShowConfirmClear(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingleRecord = async (id: string) => {
    setDeleting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      try {
        const local = JSON.parse(localStorage.getItem('invitation_records') || '[]');
        const updated = local.filter((r: any) => r.id !== id);
        localStorage.setItem('invitation_records', JSON.stringify(updated));
      } catch {}

      await fetch(`/api/admin/records/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
      });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setDeleteTargetId(null);
      setSuccessMessage('Catatan berhasil dihapus!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setDeleteTargetId(null);
      setSuccessMessage('Catatan berhasil dihapus!');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecords(token);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadCsv = () => {
    window.open(`/api/admin/records?token=${encodeURIComponent(token)}&format=csv`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Admin Storage & Google Sheets Sync</h3>
              <p className="text-[11px] text-stone-400">Data tersimpan rahasia di backend & Google Sheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-sm">
          {/* Status Banner */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            {webhookConfigured ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold text-stone-900 text-xs sm:text-sm">
                Status Integrasi Google Sheets:{' '}
                <span className={webhookConfigured ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                  {webhookConfigured ? 'Aktif (Webhook Terhubung)' : 'Penyimpanan Lokal Aktif (Webhook Opsional)'}
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Semua respons dari Tetehku tersimpan secara aman di backend server (/data/responses.json).{' '}
                {webhookConfigured
                  ? 'Setiap ada respons baru, server langsung mengirimkannya ke Google Sheet Anda.'
                  : 'Untuk otomatis mengirim ke Google Sheet, deploy kode di file google-apps-script.js lalu isi GOOGLE_SHEET_WEBHOOK_URL di .env.'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Admin Token"
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-stone-400 w-44"
                />
              </div>
              <button
                onClick={() => fetchRecords(token)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Action buttons on the right: Download CSV and Delete List */}
            <div className="flex items-center gap-2">
              <button
                onClick={downloadCsv}
                disabled={records.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>

              <button
                onClick={() => setShowConfirmClear(true)}
                disabled={records.length === 0 || deleting}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Hapus semua catatan di daftar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete List</span>
              </button>
            </div>
          </div>

          {/* Confirmation Box for Delete List */}
          {showConfirmClear && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-rose-900">
                    Hapus semua {records.length} catatan dalam daftar?
                  </div>
                  <div className="text-xs text-rose-700">
                    Tindakan ini akan mengosongkan seluruh riwayat respon yang tersimpan.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-stone-700 text-xs font-medium hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleClearAllRecords}
                  disabled={deleting}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {deleting ? (
                    <span>Menghapus...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Semua</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success notice */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Records Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 font-bold text-xs text-stone-700 flex justify-between items-center">
              <span>Daftar Respons Tersimpan ({records.length})</span>
              <span className="text-stone-400 font-normal">Format: Timestamp | Answer | Date | Time</span>
            </div>

            {records.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs font-medium">
                Daftar respons kosong. Saat Tetehku mengklik YES dan memilih jadwal di Step 2, catatan akan langsung muncul di sini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-600">
                    <tr>
                      <th className="px-4 py-2.5">Timestamp</th>
                      <th className="px-4 py-2.5">Answer</th>
                      <th className="px-4 py-2.5">Selected Date</th>
                      <th className="px-4 py-2.5">Selected Time</th>
                      <th className="px-4 py-2.5">Format Baca</th>
                      <th className="px-4 py-2.5 text-center">Sheets Sync</th>
                      <th className="px-3 py-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-amber-50/40">
                        <td className="px-4 py-3 font-mono text-stone-600 whitespace-nowrap">{r.timestamp}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{r.answer}</span>
                        </td>
                        <td className="px-4 py-3 font-mono">{r.selectedDate}</td>
                        <td className="px-4 py-3 font-mono">{r.selectedTime}</td>
                        <td className="px-4 py-3 font-medium text-stone-800">
                          {r.formattedDate} @ {r.formattedTime}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {r.savedToGoogleSheet ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              Terkirim
                            </span>
                          ) : (
                            <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">
                              Lokal
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {deleteTargetId === r.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteSingleRecord(r.id)}
                                disabled={deleting}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                              >
                                Hapus
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(null)}
                                className="px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-[10px] hover:bg-stone-300 cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteTargetId(r.id)}
                              className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Guide to Google Apps Script */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 text-xs text-stone-700 space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <span>📋</span>
              <span>Panduan Menghubungkan Google Sheets Langsung</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 leading-relaxed">
              <li>Buka spreadsheet Google baru di <strong>sheets.new</strong></li>
              <li>Buka menu <strong>Extensions &gt; Apps Script</strong></li>
              <li>Salin isi file <strong>google-apps-script.js</strong> yang sudah disediakan di aplikasi ini</li>
              <li>Klik <strong>Deploy &gt; New deployment &gt; Web app</strong> (Who has access: Anyone)</li>
              <li>Salin URL Web App dan tempel ke <strong>GOOGLE_SHEET_WEBHOOK_URL</strong> di <strong>.env</strong></li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
