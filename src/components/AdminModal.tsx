import { useState, useEffect } from 'react';
import {
  X,
  Download,
  RefreshCw,
  CheckCircle,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';
import { InvitationRecord } from '../types';
import { getCloudRecords, clearCloudRecords, deleteSingleRecord } from '../utils/cloudSync';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [records, setRecords] = useState<InvitationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Load records synchronized across all devices
  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await getCloudRecords();
      setRecords(data);
    } catch (e) {
      console.warn('Failed to load records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Direct client-side CSV download (guaranteed to work on Vercel or any host)
  const downloadCsv = () => {
    if (records.length === 0) return;
    let csv = 'Timestamp,Answer,Selected Date,Selected Time,Formatted Schedule\n';
    records.forEach((r) => {
      csv += `"${r.timestamp}","${r.answer}","${r.selectedDate}","${r.selectedTime}","${(r.formattedDate || '') + ' ' + (r.formattedTime || '')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jawaban_tetehku_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = async () => {
    await clearCloudRecords();
    setRecords([]);
    setShowConfirmClear(false);
    setSuccessMessage('Semua catatan berhasil dihapus!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteSingle = async (id: string) => {
    const updated = await deleteSingleRecord(id);
    setRecords(updated);
    setDeleteTargetId(null);
    setSuccessMessage('Catatan berhasil dihapus!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Catatan Rahasia Aa (Admin Storage)</h3>
              <p className="text-[11px] text-stone-400">Data respon otomatis tersimpan saat Tetehku memilih jadwal</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-stone-800 text-sm">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                {records.length} Respon Tersimpan
              </span>
              <button
                type="button"
                onClick={loadRecords}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadCsv}
                disabled={records.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                disabled={records.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete List</span>
              </button>
            </div>
          </div>

          {/* Confirmation Box for Delete List */}
          {showConfirmClear && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-rose-900">
                    Hapus semua {records.length} catatan dalam daftar?
                  </div>
                  <div className="text-xs text-rose-700">
                    Tindakan ini akan mengosongkan seluruh riwayat respon.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-stone-700 text-xs font-medium hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Semua</span>
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

          {/* Records Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 font-bold text-xs text-stone-700 flex justify-between items-center">
              <span>Daftar Catatan Jawaban</span>
              <span className="text-stone-400 font-normal">Format: Timestamp | Answer | Date | Time</span>
            </div>

            {records.length === 0 ? (
              <div className="p-10 text-center text-stone-400 text-xs font-medium space-y-1">
                <p className="font-semibold text-stone-500">Daftar respon masih kosong.</p>
                <p>Saat Tetehku mengklik YES dan memilih jadwal di Step 2, catatan langsung otomatis muncul di sini!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-600">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Answer</th>
                      <th className="px-4 py-3">Selected Date</th>
                      <th className="px-4 py-3">Selected Time</th>
                      <th className="px-4 py-3">Format Lengkap</th>
                      <th className="px-3 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {records.map((r, index) => (
                      <tr key={r.id || index} className="hover:bg-amber-50/40">
                        <td className="px-4 py-3 font-mono text-stone-600 whitespace-nowrap">
                          {r.timestamp}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {r.answer}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {r.selectedDate}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-stone-900">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {r.selectedTime}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-800">
                          {r.formattedDate} @ {r.formattedTime}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {deleteTargetId === r.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteSingle(r.id)}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                              >
                                Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTargetId(null)}
                                className="px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-[10px] hover:bg-stone-300 cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(r.id)}
                              className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus catatan ini"
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
