import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Coins, 
  FileCheck, 
  MessageSquare, 
  Send,
  Camera,
  ExternalLink,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import { formatRupiah, formatDateTime, formatDate } from '../../utils/formatters';

interface ComplaintManagementProps {
  complaints: Complaint[];
  onUpdateComplaint: (updated: Complaint) => void;
  onSyncFinanceExpense: (complaint: Complaint, amount: number, source: string) => void;
  onViewFinanceTab: () => void;
  onFocusOnMap?: (ticket: string) => void;
}

const APARATUR_STAFF = [
  { name: 'Pak Hartono', role: 'Kasi Kesejahteraan & Pembangunan' },
  { name: 'Pak Suprayitno, S.E.', role: 'Sekretaris Desa' },
  { name: 'Ibu Indah Kusuma, S.Ak.', role: 'Kaur Keuangan' },
  { name: 'Mas Faisal', role: 'Kaur TU & Umum' },
  { name: 'Pak Slamet Widodo', role: 'Kepala Dusun Krajan' },
  { name: 'Pak Mulyono Santoso', role: 'Kepala Dusun Sumber Ketangi' },
  { name: 'Pak Karyadi', role: 'Kepala Dusun Gunung Sari Kidul' },
  { name: 'Pak Rahmat', role: 'Kepala Dusun Sidodadi' },
];

export const ComplaintManagement: React.FC<ComplaintManagementProps> = ({
  complaints,
  onUpdateComplaint,
  onSyncFinanceExpense,
  onViewFinanceTab,
  onFocusOnMap,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<string>(complaints[0]?.ticketNumber || '');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Form State for update modal / panel
  const [editStatus, setEditStatus] = useState<ComplaintStatus>('Dalam Penanganan');
  const [assignedStaff, setAssignedStaff] = useState(APARATUR_STAFF[0].name);
  const [officerNotes, setOfficerNotes] = useState('');
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [fundingSource, setFundingSource] = useState<string>('Dana Desa (DD)');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [autoSyncToBku, setAutoSyncToBku] = useState(true);
  const [officialReply, setOfficialReply] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const activeComplaint = complaints.find((c) => c.ticketNumber === selectedTicket) || complaints[0];

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === 'Semua') return true;
    return c.status === statusFilter;
  });

  const handleSelectComplaint = (ticket: string) => {
    setSelectedTicket(ticket);
    const comp = complaints.find((c) => c.ticketNumber === ticket);
    if (comp) {
      setEditStatus(comp.status);
      setAssignedStaff(comp.assignedTo || APARATUR_STAFF[0].name);
      setBudgetAmount(comp.allocatedBudget ? String(comp.allocatedBudget) : '');
      setProofPhotoUrl(comp.resolutionProofPhoto || '');
      setOfficerNotes('');
    }
  };

  const handleProcessAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;

    const now = new Date().toISOString();
    const staffObj = APARATUR_STAFF.find((s) => s.name === assignedStaff) || APARATUR_STAFF[0];
    const budgetNum = budgetAmount ? parseFloat(budgetAmount) : undefined;

    // Create new history log
    const newHistoryItem = {
      id: 'h-' + Date.now(),
      status: editStatus,
      timestamp: now,
      actor: staffObj.name,
      actorRole: staffObj.role,
      notes: officerNotes.trim() || `Status aduan diperbarui menjadi ${editStatus}.`,
      evidencePhotoUrl: proofPhotoUrl || undefined,
      allocatedBudget: budgetNum,
    };

    const updatedComplaint: Complaint = {
      ...activeComplaint,
      status: editStatus,
      updatedAt: now,
      assignedTo: staffObj.name,
      assignedRole: staffObj.role,
      allocatedBudget: budgetNum,
      fundingSource: budgetNum ? fundingSource : undefined,
      resolutionProofPhoto: proofPhotoUrl || activeComplaint.resolutionProofPhoto,
      resolutionNotes: editStatus === 'Selesai' ? (officerNotes || 'Tuntas dilaksanakan') : activeComplaint.resolutionNotes,
      resolvedAt: editStatus === 'Selesai' ? now : activeComplaint.resolvedAt,
      statusHistory: [...activeComplaint.statusHistory, newHistoryItem],
    };

    // If official reply is typed, add to comments
    if (officialReply.trim()) {
      updatedComplaint.comments = [
        ...updatedComplaint.comments,
        {
          id: 'cm-' + Date.now(),
          senderName: `${staffObj.name} (${staffObj.role})`,
          senderRole: 'Aparatur Desa',
          message: officialReply.trim(),
          timestamp: now,
        }
      ];
      setOfficialReply('');
    }

    onUpdateComplaint(updatedComplaint);

    // Otomatis sinkron ke Keuangan Desa jika ada alokasi anggaran dan dicentang
    if (budgetNum && budgetNum > 0 && autoSyncToBku) {
      onSyncFinanceExpense(updatedComplaint, budgetNum, fundingSource);
    }

    setActionSuccessMsg(`Aduan ${activeComplaint.ticketNumber} berhasil diperbarui!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Aparatur */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-950 text-xs font-bold">
              Desk Aparatur Desa Gunosari
            </span>
            <span className="text-xs text-slate-500 font-medium">Kec. Tlogosari, Kab. Bondowoso</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Verifikasi & Disposisi Aduan Masyarakat</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola tindak lanjut, tugaskan perangkat pelaksana, cek lokasi di peta, dan integrasikan anggaran perbaikan fisik langsung ke APBDes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onViewFinanceTab}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition cursor-pointer border border-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-800" />
            <span>Cek BKU & Realisasi Belanja</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Workspace: 2-Column (Left: List, Right: Action Desk) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Complaints List Table (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['Semua', 'Menunggu Verifikasi', 'Diverifikasi', 'Dalam Penanganan', 'Selesai'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-900 text-white font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada aduan dalam status ini.
              </div>
            ) : (
              filteredComplaints.map((item) => {
                const isSelected = activeComplaint?.ticketNumber === item.ticketNumber;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectComplaint(item.ticketNumber)}
                    className={`p-4 cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-900'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {item.ticketNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Dalam Penanganan'
                            ? 'bg-amber-100 text-amber-900'
                            : item.status === 'Diverifikasi'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {item.dusun} &bull; {item.reporterName}
                    </p>

                    {item.allocatedBudget && (
                      <div className="mt-2 text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded inline-block">
                        Anggaran: {formatRupiah(item.allocatedBudget)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Officer Action Desk (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeComplaint ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Active Ticket Banner */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-blue-300 font-mono font-bold block">
                    {activeComplaint.ticketNumber} &bull; {activeComplaint.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{activeComplaint.title}</h3>
                  <p className="text-xs text-slate-200 mt-1">
                    Lokasi: <strong>{activeComplaint.dusun}</strong> ({activeComplaint.locationDetail})
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Urgensi: {activeComplaint.urgency}
                  </span>
                  {onFocusOnMap && (
                    <button
                      onClick={() => onFocusOnMap(activeComplaint.ticketNumber)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-blue-200 text-xs rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Cek di Peta</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Detail Warga Box */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Pelapor:</span>
                    <span className="font-bold text-slate-800">{activeComplaint.reporterName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kontak WhatsApp:</span>
                    <span className="font-bold text-slate-800">{activeComplaint.reporterContact || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Lapor:</span>
                    <span className="font-bold text-slate-800">{formatDate(activeComplaint.createdAt)}</span>
                  </div>
                </div>

                <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  "{activeComplaint.description}"
                </p>
              </div>

              {/* Action Form */}
              <form onSubmit={handleProcessAction} className="p-5 sm:p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-800" />
                  <span>Tindakan & Disposisi Aparatur Desa</span>
                </h4>

                {/* Status & Petugas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Perbarui Status Aduan
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700 font-semibold"
                    >
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Diverifikasi">Diverifikasi & Disurvei</option>
                      <option value="Dalam Penanganan">Dalam Penanganan Lapangan</option>
                      <option value="Selesai">Selesai (Tuntas Dikerjakan)</option>
                      <option value="Ditolak">Ditolak (Tidak Memenuhi Syarat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Perangkat / Penanggung Jawab Lapangan
                    </label>
                    <select
                      value={assignedStaff}
                      onChange={(e) => setAssignedStaff(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700"
                    >
                      {APARATUR_STAFF.map((st) => (
                        <option key={st.name} value={st.name}>
                          {st.name} - {st.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Integrasi Keuangan Desa (Otomatis ke APBDes) */}
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-blue-900" />
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                        Integrasi Anggaran APBDes Gunosari
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                      Otomatis Terhubung ke BKU
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Biaya / Alokasi Anggaran Tindak Lanjut (Rp)
                      </label>
                      <input
                        type="number"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        placeholder="Contoh: 15000000"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Sumber Rekening APBDes
                      </label>
                      <select
                        value={fundingSource}
                        onChange={(e) => setFundingSource(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Dana Desa (DD)">Dana Desa (DD) - Pembangunan Fisik</option>
                        <option value="Alokasi Dana Desa (ADD)">Alokasi Dana Desa (ADD) - Operasional</option>
                        <option value="Bagi Hasil Pajak & Retribusi (BHPRD)">Bagi Hasil Pajak & Retribusi (BHPRD)</option>
                        <option value="Pendapatan Asli Desa (PADes)">Pendapatan Asli Desa (PADes)</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={autoSyncToBku}
                      onChange={(e) => setAutoSyncToBku(e.target.checked)}
                      className="w-4 h-4 text-blue-800 rounded border-slate-300 focus:ring-blue-600"
                    />
                    <span>
                      Otomatis posting pengeluaran kas ke Buku Kas Umum & kurangi sisa pagu Bidang Pembangunan APBDes
                    </span>
                  </label>
                </div>

                {/* Catatan Tindak Lanjut & Foto Bukti */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Progres Resmi (Dapat Dilihat Warga)
                  </label>
                  <textarea
                    rows={2}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Contoh: Tim lapangan sudah mengecek jalan, material batu split dikirim tanggal 21 Maret..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                {/* URL Foto Penyelesaian jika status selesai */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Foto Dokumentasi Hasil Pengerjaan (Opsional)</span>
                    <span className="text-slate-400 font-normal">URL foto hasil tuntas</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={proofPhotoUrl}
                      onChange={(e) => setProofPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setProofPhotoUrl('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg border border-slate-200 cursor-pointer whitespace-nowrap"
                    >
                      Pilih Contoh Foto
                    </button>
                  </div>
                </div>

                {/* Balasan Langsung ke Warga */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kirim Pesan Tanggapan Langsung ke Kolom Diskusi Warga (Opsional)
                  </label>
                  <input
                    type="text"
                    value={officialReply}
                    onChange={(e) => setOfficialReply(e.target.value)}
                    placeholder="Tulis pesan ke warga pelapor..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-200" />
                    <span>Simpan Perubahan & Perbarui Status Tiket</span>
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
