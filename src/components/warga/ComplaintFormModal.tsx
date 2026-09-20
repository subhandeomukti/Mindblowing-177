import React, { useState, useEffect } from 'react';
import { X, Camera, ShieldCheck, CheckCircle2, Copy, ArrowRight, UploadCloud, MapPin, UserCheck } from 'lucide-react';
import { Complaint, ComplaintCategory, DusunName, UrgencyLevel, CitizenResident } from '../../types';
import { generateTicketNumber } from '../../utils/formatters';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (complaint: Complaint) => void;
  onTrackSubmittedTicket?: (ticketNumber: string) => void;
  activeCitizen?: CitizenResident | null;
}

const CATEGORIES: ComplaintCategory[] = [
  'Infrastruktur & Jalan',
  'Saluran Air & Irigasi',
  'Pelayanan Administrasi',
  'Bantuan Sosial & Kesejahteraan',
  'Penerangan & Keamanan Lingkungan',
  'Kebersihan & Pengelolaan Sampah',
  'Lainnya',
];

const DUSUN_OPTIONS: DusunName[] = [
  'Dusun Krajan',
  'Dusun Sumber Ketangi',
  'Dusun Gunung Sari Kidul',
  'Dusun Sidodadi',
];

// Baseline coordinate per Dusun in Desa Gunosari
const DUSUN_COORDINATES: Record<DusunName, { lat: number; lng: number }> = {
  'Dusun Krajan': { lat: -7.9575, lng: 113.8895 },
  'Dusun Sumber Ketangi': { lat: -7.9542, lng: 113.8965 },
  'Dusun Gunung Sari Kidul': { lat: -7.9620, lng: 113.8850 },
  'Dusun Sidodadi': { lat: -7.9510, lng: 113.8920 },
};

const SAMPLE_EVIDENCE_PHOTOS = [
  { label: 'Jalan Rusak / Berlubang', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Saluran Irigasi Tersumbat', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80' },
  { label: 'Lampu PJU Padam', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tumpukan Sampah', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80' },
];

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitComplaint,
  onTrackSubmittedTicket,
  activeCitizen,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Infrastruktur & Jalan');
  const [dusun, setDusun] = useState<DusunName>('Dusun Krajan');
  const [locationDetail, setLocationDetail] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Sedang');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterContact, setReporterContact] = useState('');
  const [reporterNik, setReporterNik] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_EVIDENCE_PHOTOS[0].url);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeCitizen) {
      if (!reporterName) setReporterName(activeCitizen.namaLengkap);
      if (!reporterNik) setReporterNik(activeCitizen.nik);
      if (!reporterContact) setReporterContact(activeCitizen.noHp);
      setDusun(activeCitizen.dusun);
      if (!locationDetail) setLocationDetail(activeCitizen.alamatRumah);
    }
  }, [activeCitizen, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationDetail.trim()) return;

    const ticketNumber = generateTicketNumber();
    const now = new Date().toISOString();
    const baseCoords = DUSUN_COORDINATES[dusun];
    // Add tiny randomized jitter (+/- 0.001) so multiple markers don't overlap exactly
    const lat = baseCoords.lat + (Math.random() - 0.5) * 0.002;
    const lng = baseCoords.lng + (Math.random() - 0.5) * 0.002;

    const newComplaint: Complaint = {
      id: 'c-' + Date.now(),
      ticketNumber,
      title: title.trim(),
      description: description.trim(),
      category,
      dusun,
      locationDetail: locationDetail.trim(),
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lng.toFixed(5)),
      urgency,
      reporterName: isAnonymous ? 'Warga Gunosari (Anonim)' : (reporterName.trim() || 'Warga Gunosari'),
      isAnonymous,
      reporterContact: reporterContact.trim() || undefined,
      reporterNik: reporterNik.trim() || undefined,
      photoUrl: photoUrl || undefined,
      createdAt: now,
      updatedAt: now,
      status: 'Menunggu Verifikasi',
      statusHistory: [
        {
          id: 'h-' + Date.now(),
          status: 'Menunggu Verifikasi',
          timestamp: now,
          actor: 'Sistem Pengaduan Warga',
          actorRole: 'System Portal Desa',
          notes: `Aduan masyarakat telah diterima sistem dengan nomor ${ticketNumber}. Siap diverifikasi oleh perangkat desa terkait.`,
        }
      ],
      comments: []
    };

    onSubmitComplaint(newComplaint);
    setSubmittedTicket(ticketNumber);
  };

  const handleCopyTicket = () => {
    if (submittedTicket) {
      navigator.clipboard.writeText(submittedTicket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setDescription('');
    setLocationDetail('');
    setReporterName('');
    setReporterContact('');
    setReporterNik('');
    setIsAnonymous(false);
    setSubmittedTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-800/80 rounded-lg text-blue-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Form Pengaduan Warga Desa Gunosari</h2>
              <p className="text-xs text-blue-200">Kecamatan Tlogosari, Kabupaten Bondowoso &bull; Terhubung ke APBDes & Peta</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Jika Berhasil Dikirim */}
        {submittedTicket ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Aduan Anda Berhasil Dikirim!</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Laporan Anda telah diteruskan ke perangkat Desa Gunosari dan titik lokasi telah disematkan di Peta Wilayah Desa. Anda dapat memantau status secara real-time:
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl max-w-md mx-auto flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider text-left">Nomor Tiket Anda</p>
                <p className="text-lg sm:text-xl font-mono font-bold text-slate-900">{submittedTicket}</p>
              </div>
              <button
                onClick={handleCopyTicket}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-blue-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Tersalin!' : 'Salin Tiket'}</span>
              </button>
            </div>

            <div className="bg-blue-50 text-blue-950 text-xs p-3 rounded-lg border border-blue-200 flex items-start gap-2 text-left max-w-md mx-auto">
              <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
              <span>Pemberitahuan: Tim aparatur Desa Gunosari biasanya melakukan verifikasi lapangan dalam waktu 1x24 jam kerja.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (onTrackSubmittedTicket) {
                    onTrackSubmittedTicket(submittedTicket);
                  }
                  handleResetAndClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
              >
                <span>Lacak Status Tiket Ini Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition cursor-pointer"
              >
                Tutup Form
              </button>
            </div>
          </div>
        ) : (
          /* Form Input Pengaduan */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {activeCitizen && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-950">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    Melapor sebagai warga terdaftar: <strong>{activeCitizen.namaLengkap}</strong> ({activeCitizen.dusun})
                  </span>
                </div>
                <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                  Terverifikasi
                </span>
              </div>
            )}

            {/* Judul Aduan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Judul Pengaduan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Jalan RT 03 Dusun Krajan Rusak Parah Tergerus Air"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              />
            </div>

            {/* Kategori & Dusun */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Permasalahan <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Wilayah Dusun <span className="text-red-500">*</span>
                </label>
                <select
                  value={dusun}
                  onChange={(e) => setDusun(e.target.value as DusunName)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 font-medium"
                >
                  {DUSUN_OPTIONS.map((ds) => (
                    <option key={ds} value={ds}>
                      {ds}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lokasi Spesifik & Urgensi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lokasi Detail / Patokan Rumah/Jalan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder="Contoh: Depan Pos Kamling RT 02 / RW 01 dekat jembatan"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tingkat Urgensi
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  <option value="Rendah">Rendah (Dapat dijadwalkan)</option>
                  <option value="Sedang">Sedang (Perlu dicek)</option>
                  <option value="Tinggi">Tinggi (Mengganggu warga)</option>
                  <option value="Darurat">Darurat (Berbahaya/Kritis)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Titik koordinat otomatis dipetakan di wilayah {dusun} agar kepala desa & perangkat desa dapat memantau langsung di Peta Desa.</span>
            </div>

            {/* Deskripsi Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deskripsi Aduan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kondisi yang terjadi, dampak bagi warga sekitar, dan perkiraan waktu kejadian..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            {/* Foto Bukti Aduan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Foto Bukti Lapangan</span>
                <span className="text-slate-500 font-normal">Pilih sampel atau masukkan URL</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {SAMPLE_EVIDENCE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(sample.url)}
                    className={`p-1.5 border rounded-xl text-left text-xs transition cursor-pointer ${
                      photoUrl === sample.url
                        ? 'border-blue-700 bg-blue-50 ring-2 ring-blue-700/20 font-semibold text-blue-950'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <img 
                      src={sample.url} 
                      alt={sample.label} 
                      referrerPolicy="no-referrer"
                      className="w-full h-14 object-cover rounded-lg mb-1" 
                    />
                    <span className="block truncate text-[11px]">{sample.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="URL Foto atau Gambar Bukti"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                />
              </div>
            </div>

            {/* Identitas Pelapor & Anonimitas */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identitas Pelapor</span>
                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-blue-800 rounded border-slate-300 focus:ring-blue-700"
                  />
                  <span>Laporkan Secara Anonim (Rahasiakan Nama)</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="Nama Lengkap Warga"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={reporterContact}
                      onChange={(e) => setReporterContact(e.target.value)}
                      placeholder="No. WhatsApp (Untuk Info Progres)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={reporterNik}
                      onChange={(e) => setReporterNik(e.target.value)}
                      placeholder="NIK (Opsional / Rahasia)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Kirim Aduan ke Pemerintah Desa</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
