import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Coins, 
  MessageSquare, 
  Send, 
  Star, 
  ArrowRight,
  ShieldAlert,
  Share2,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import { formatRupiah, formatDateTime, formatDate } from '../../utils/formatters';

interface TicketTrackerProps {
  complaints: Complaint[];
  selectedTicketNumber?: string;
  onSelectTicket: (ticket: string) => void;
  onAddComment: (ticketNumber: string, message: string, senderName: string) => void;
  onSubmitRating: (ticketNumber: string, rating: number, feedback: string) => void;
  onFocusOnMap?: (ticket: string) => void;
}

const STATUS_STEPS: { status: ComplaintStatus; label: string; desc: string }[] = [
  { status: 'Menunggu Verifikasi', label: '1. Terkirim', desc: 'Menunggu verifikasi admin desa' },
  { status: 'Diverifikasi', label: '2. Diverifikasi', desc: 'Survei lapangan & disposisi tugas' },
  { status: 'Dalam Penanganan', label: '3. Penanganan Fisik', desc: 'Pengerjaan & alokasi anggaran' },
  { status: 'Selesai', label: '4. Selesai & Tuntas', desc: 'Verifikasi hasil pengerjaan' },
];

export const TicketTracker: React.FC<TicketTrackerProps> = ({
  complaints,
  selectedTicketNumber,
  onSelectTicket,
  onAddComment,
  onSubmitRating,
  onFocusOnMap,
}) => {
  const [searchInput, setSearchInput] = useState(selectedTicketNumber || '');
  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [starRating, setStarRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Cari complaint yang aktif
  const currentComplaint = complaints.find(
    (c) => c.ticketNumber.toLowerCase() === (selectedTicketNumber || searchInput).trim().toLowerCase()
  ) || complaints[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectTicket(searchInput.trim());
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentComplaint) return;
    onAddComment(currentComplaint.ticketNumber, commentText.trim(), commenterName.trim() || 'Warga Gunosari');
    setCommentText('');
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentComplaint) return;
    onSubmitRating(currentComplaint.ticketNumber, starRating, feedbackText);
    setShowRatingSuccess(true);
    setTimeout(() => setShowRatingSuccess(false), 3000);
  };

  const getStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Menunggu Verifikasi': return 0;
      case 'Diverifikasi': return 1;
      case 'Dalam Penanganan': return 2;
      case 'Selesai': return 3;
      case 'Ditolak': return -1;
      default: return 0;
    }
  };

  const currentStep = currentComplaint ? getStepIndex(currentComplaint.status) : 0;

  const handleShare = () => {
    if (currentComplaint) {
      navigator.clipboard.writeText(`Pantau transparansi aduan Desa Gunosari Tiket: ${currentComplaint.ticketNumber} - ${currentComplaint.title}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-900 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-200">
            Transparansi Real-Time
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Lacak Status Aduan Warga Gunosari</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Ketik nomor tiket aduan Anda untuk melihat tahapan penanganan, tim yang bertugas, dokumentasi foto, titik lokasi peta, dan alokasi anggaran APBDes.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Masukkan Nomor Tiket (cth: ADU-GNS-2025-0018)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium focus:bg-white focus:ring-2 focus:ring-blue-700 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Cari Tiket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Ticket Pills */}
        <div className="max-w-2xl mx-auto mt-3 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-500">
          <span>Contoh Tiket Cepat:</span>
          {complaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchInput(c.ticketNumber);
                onSelectTicket(c.ticketNumber);
              }}
              className={`px-2 py-0.5 rounded-md border font-mono transition cursor-pointer ${
                currentComplaint?.ticketNumber === c.ticketNumber
                  ? 'bg-blue-100 border-blue-300 text-blue-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {c.ticketNumber}
            </button>
          ))}
        </div>
      </div>

      {currentComplaint ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Complaint Tracker Detail (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Card Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-800 border border-slate-200">
                      {currentComplaint.ticketNumber}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                      {currentComplaint.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{shareCopied ? 'Tersalin!' : 'Bagikan'}</span>
                    </button>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        currentComplaint.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : currentComplaint.status === 'Dalam Penanganan'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : currentComplaint.status === 'Diverifikasi'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {currentComplaint.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 leading-snug">{currentComplaint.title}</h3>
                
                <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-800" />
                    <strong>{currentComplaint.dusun}</strong> &bull; {currentComplaint.locationDetail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Dilaporkan: {formatDate(currentComplaint.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    Pelapor: {currentComplaint.reporterName}
                  </span>

                  {currentComplaint.latitude && currentComplaint.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${currentComplaint.latitude},${currentComplaint.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Navigation className="w-3 h-3 text-blue-700" />
                      <span>Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Real-time Stepper Progress */}
              <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Tahapan Real-Time Penanganan Aduan
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div
                        key={step.status}
                        className={`p-3 rounded-xl border text-left transition ${
                          isCurrent
                            ? 'bg-white border-blue-800 shadow-xs ring-2 ring-blue-700/20'
                            : isDone
                            ? 'bg-blue-50/60 border-blue-200 text-slate-800'
                            : 'bg-white/50 border-slate-200 text-slate-400 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isDone ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </span>
                          {isCurrent && (
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-700 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{step.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transparansi Alokasi Anggaran APBDes (Kunci Transparansi Warga) */}
              {currentComplaint.allocatedBudget && (
                <div className="p-5 sm:p-6 bg-blue-50/80 border-b border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl text-blue-900 mt-0.5">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                        Transparansi Pembiayaan APBDes
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        Alokasi Anggaran: {formatRupiah(currentComplaint.allocatedBudget)}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Sumber Dana: <strong>{currentComplaint.fundingSource || 'Dana Desa (DD) / Alokasi APBDes 2025'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-blue-900 bg-blue-100/70 px-3 py-2 rounded-lg border border-blue-200">
                    <span>Terhubung ke Buku Kas Umum &bull; Sub-Bidang Pembangunan</span>
                  </div>
                </div>
              )}

              {/* Deskripsi & Foto Aduan */}
              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Isi Laporan Warga
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {currentComplaint.description}
                  </p>
                </div>

                {/* Foto Before & After */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {currentComplaint.photoUrl && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Foto Kondisi Awal (Laporan Warga)</span>
                      </span>
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img
                          src={currentComplaint.photoUrl}
                          alt="Kondisi Awal"
                          referrerPolicy="no-referrer"
                          className="w-full h-48 object-cover hover:scale-102 transition duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {currentComplaint.resolutionProofPhoto ? (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Foto Hasil Tindak Lanjut Pemdes Gunosari</span>
                      </span>
                      <div className="overflow-hidden rounded-xl border border-emerald-300 bg-emerald-50">
                        <img
                          src={currentComplaint.resolutionProofPhoto}
                          alt="Hasil Tindak Lanjut"
                          referrerPolicy="no-referrer"
                          className="w-full h-48 object-cover hover:scale-102 transition duration-300"
                        />
                      </div>
                    </div>
                  ) : (
                    currentComplaint.photoUrl && (
                      <div className="space-y-1.5 flex flex-col justify-center items-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
                        <Clock className="w-8 h-8 text-slate-400 mb-1" />
                        <p className="text-xs font-semibold text-slate-600">Dokumentasi Tindak Lanjut</p>
                        <p className="text-[11px] text-slate-400">
                          {currentComplaint.status === 'Dalam Penanganan'
                            ? 'Pengerjaan lapangan sedang berlangsung. Dokumentasi foto akan diunggah setelah selesai.'
                            : 'Menunggu jadwal pengerjaan tim perangkat desa.'}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Riwayat Log Aktivitas Real-Time */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-800" />
                <span>Log Riwayat Penanganan Resmi Aparatur Desa</span>
              </h4>

              <div className="relative pl-6 border-l-2 border-blue-700 space-y-6">
                {currentComplaint.statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-800 border-2 border-white shadow-xs"></div>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900">{item.status}</span>
                      <span className="text-[11px] text-slate-400">{formatDateTime(item.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Oleh: <strong className="text-slate-700">{item.actor}</strong> ({item.actorRole})
                    </p>
                    <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      {item.notes}
                    </p>
                    {item.allocatedBudget && (
                      <p className="text-xs text-blue-900 font-semibold mt-1">
                        &bull; Nominal Anggaran: {formatRupiah(item.allocatedBudget)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Citizen Discussion & Rating (Col 3) */}
          <div className="space-y-6">
            {/* Citizen Feedback / Rating Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h4 className="text-sm font-bold text-slate-900">Umpan Balik Kepuasan Warga</h4>
              </div>

              {currentComplaint.citizenRating ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= currentComplaint.citizenRating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs italic text-slate-700">
                    "{currentComplaint.citizenFeedback || 'Pelayanan sangat transparan dan responsif.'}"
                  </p>
                  <span className="text-[10px] text-blue-900 font-semibold block">
                    Penilaian Warga Terverifikasi
                  </span>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Apakah Anda puas dengan respon transparansi penanganan aduan ini?
                  </p>

                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStarRating(s)}
                        className="p-1 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${s <= starRating ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Beri ulasan singkat (opsional)..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Kirim Penilaian Warga
                  </button>

                  {showRatingSuccess && (
                    <p className="text-[11px] text-blue-800 text-center font-medium">
                      Terima kasih atas penilaian Anda!
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Diskusi Transparan Warga & Aparatur Desa */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col h-[480px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-800" />
                  <h4 className="text-sm font-bold text-slate-900">Diskusi Transparan</h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {currentComplaint.comments.length} Pesan
                </span>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                {currentComplaint.comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs p-4">
                    <MessageSquare className="w-8 h-8 text-slate-300 mb-1" />
                    <span>Belum ada diskusi untuk tiket ini. Kirim pertanyaan jika memerlukan penjelasan tambahan.</span>
                  </div>
                ) : (
                  currentComplaint.comments.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.senderRole === 'Aparatur Desa'
                          ? 'bg-blue-50/90 border border-blue-200 ml-3'
                          : 'bg-slate-50 border border-slate-200 mr-3'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold ${msg.senderRole === 'Aparatur Desa' ? 'text-blue-950' : 'text-slate-800'}`}>
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{msg.message}</p>
                      {msg.senderRole === 'Aparatur Desa' && (
                        <span className="inline-block text-[10px] font-semibold text-blue-900 bg-blue-100 px-1.5 py-0.2 rounded">
                          Tanggapan Resmi Pemdes
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 space-y-2">
                <input
                  type="text"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  placeholder="Nama Anda (cth: Warga RT 02 / Bpk. Rudi)"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tulis pertanyaan / tanggapan..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg transition cursor-pointer"
                    title="Kirim Pesan"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Tiket Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Pastikan format nomor tiket sesuai (contoh: ADU-GNS-2025-0018) atau pilih dari daftar aduan publik.
          </p>
        </div>
      )}
    </div>
  );
};
