import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Trash2, 
  Check, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { VillageOfficial } from '../../types';

interface EditOfficialModalProps {
  isOpen: boolean;
  onClose: () => void;
  official: VillageOfficial | null;
  onSave: (updatedOfficial: VillageOfficial) => void;
  currentUserEmail?: string;
  currentUserName?: string;
}

export const EditOfficialModal: React.FC<EditOfficialModalProps> = ({
  isOpen,
  onClose,
  official,
  onSave,
  currentUserEmail = 'subhandeomukti@gmail.com',
  currentUserName = 'Subhan Deo Mukti',
}) => {
  if (!isOpen || !official) return null;

  const [namaLengkap, setNamaLengkap] = useState(official.namaLengkap);
  const [jabatan, setJabatan] = useState(official.jabatan);
  const [nipNiapd, setNipNiapd] = useState(official.nipNiapd || '');
  const [noHp, setNoHp] = useState(official.noHp);
  const [email, setEmail] = useState(official.email || '');
  const [tugasPokok, setTugasPokok] = useState(official.tugasPokok || '');
  const [status, setStatus] = useState<'Aktif' | 'Cuti' | 'Purna Tugas'>(official.status);
  const [fotoUrl, setFotoUrl] = useState<string>(official.fotoUrl || '');

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const startCamera = async (facing: 'user' | 'environment') => {
    stopCamera();
    setCameraError(null);
    setCameraFacing(facing);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Fitur kamera tidak didukung pada browser ini.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.error('Gagal memutar stream video:', err);
          });
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera error:', err);
      let msg = 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 600, video.videoHeight || 600);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Crop center square
        const sx = ((video.videoWidth || size) - size) / 2;
        const sy = ((video.videoHeight || size) - size) / 2;

        if (cameraFacing === 'user') {
          // Mirror for front selfie camera
          ctx.translate(size, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setFotoUrl(dataUrl);
        stopCamera();
      }
    } catch (e) {
      console.error('Snapshot error:', e);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFotoUrl(reader.result);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) {
      alert('Nama lengkap perangkat desa wajib diisi.');
      return;
    }
    if (!jabatan.trim()) {
      alert('Jabatan wajib diisi.');
      return;
    }

    const updated: VillageOfficial = {
      ...official,
      namaLengkap: namaLengkap.trim(),
      jabatan: jabatan.trim(),
      nipNiapd: nipNiapd.trim() || undefined,
      noHp: noHp.trim(),
      email: email.trim() || `${currentUserEmail}`,
      tugasPokok: tugasPokok.trim(),
      status,
      fotoUrl,
      lastUpdatedBy: `${currentUserName} (${currentUserEmail})`,
      lastUpdatedAt: new Date().toISOString().split('T')[0],
    };

    stopCamera();
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header Modal */}
        <div className="sticky top-0 z-10 bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                Kelola Nama & Foto Perangkat Desa
              </h3>
              <p className="text-xs text-slate-500">
                Diisi & Diperbarui oleh: <strong className="text-blue-900">{currentUserName}</strong> ({currentUserEmail})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Quick preset for Subhan Deo Mukti */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <span className="text-slate-700">
                Ingin mengisi data sebagai <strong>Subhan Deo Mukti</strong>?
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setNamaLengkap('Subhan Deo Mukti');
                setEmail('subhandeomukti@gmail.com');
                setNoHp('0812-3344-5566');
                if (!jabatan) {
                  setJabatan('Koordinator TI & Pengembang Sistem Informasi Desa');
                }
              }}
              className="px-2.5 py-1 bg-blue-900 text-white rounded-lg text-[11px] font-bold hover:bg-blue-950 transition cursor-pointer flex-shrink-0"
            >
              Isi Data Subhan
            </button>
          </div>

          {/* Foto Profil Perangkat Desa */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Foto Resmi Perangkat Desa
            </label>

            {/* Camera View Mode */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-xs mx-auto border-2 border-blue-500 shadow-lg">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                
                {/* Guide Oval Frame for Portrait */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-56 rounded-full border-2 border-dashed border-white/60 shadow-inner"></div>
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => startCamera(cameraFacing === 'user' ? 'environment' : 'user')}
                    className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1 hover:bg-black/80"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Putar</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={takeSnapshot}
                    disabled={isCapturing}
                    className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg flex items-center gap-2 border-2 border-white cursor-pointer active:scale-95 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Jepret Foto Sekarang</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Photo Display / Empty Preview */
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md flex-shrink-0 flex items-center justify-center">
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={namaLengkap || 'Perangkat Desa'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-900 text-amber-300 font-bold text-2xl flex items-center justify-center">
                      {namaLengkap ? namaLengkap.charAt(0).toUpperCase() : <User className="w-8 h-8 text-white/80" />}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {fotoUrl ? 'Foto Terpasang' : 'Belum Ada Foto Terpasang'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Gunakan kamera gawai secara langsung atau pilih file pasfoto dari galeri perangkat Anda.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera('user')}
                      className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                      <span>Buka Kamera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-800" />
                      <span>Pilih dari Berkas</span>
                    </button>

                    {fotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFotoUrl('')}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800">
                Nama Lengkap Perangkat Desa *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Subhan Deo Mukti"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800">
                Jabatan / Posisi Pemerintahan *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Kepala Desa / Koordinator TI & Pengembang"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                NIP / NIAPD
              </label>
              <input
                type="text"
                value={nipNiapd}
                onChange={(e) => setNipNiapd(e.target.value)}
                placeholder="Contoh: 19980512-TI-001"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Status Aparatur
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Purna Tugas">Purna Tugas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Nomor WhatsApp / HP *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Alamat Email (Gmail)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="subhandeomukti@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800">
                Tugas Pokok & Tanggung Jawab
              </label>
              <textarea
                rows={3}
                value={tugasPokok}
                onChange={(e) => setTugasPokok(e.target.value)}
                placeholder="Rincian tugas dan tanggung jawab dalam pemerintahan desa..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Perubahan tersimpan otomatis ke sistem desa
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perangkat Desa</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
