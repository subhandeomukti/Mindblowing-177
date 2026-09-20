import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  UserCheck, 
  Shield, 
  Building2, 
  MapPin, 
  Home, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  Compass, 
  ArrowRight, 
  Search,
  Users,
  Sparkles,
  Info
} from 'lucide-react';
import { CitizenResident, DusunName } from '../../types';
import { VILLAGE_INFO, LOGO_DESA_GUNOSARI } from '../../data/mockData';
import { HouseCameraCapture } from './HouseCameraCapture';

interface VillageEntranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizens: CitizenResident[];
  onRegisterCitizen: (citizen: CitizenResident) => void;
  onSelectActiveCitizen: (citizen: CitizenResident) => void;
  onEnterAsAparatur: () => void;
  onEnterAsGuest: () => void;
  currentActiveCitizen?: CitizenResident | null;
}

const DUSUN_OPTIONS: DusunName[] = [
  'Dusun Krajan',
  'Dusun Sumber Ketangi',
  'Dusun Gunung Sari Kidul',
  'Dusun Sidodadi',
];

const DUSUN_COORDINATES: Record<DusunName, { lat: number; lng: number }> = {
  'Dusun Krajan': { lat: -7.9854, lng: 113.9158 },
  'Dusun Sumber Ketangi': { lat: -7.9878, lng: 113.9186 },
  'Dusun Gunung Sari Kidul': { lat: -7.9908, lng: 113.9138 },
  'Dusun Sidodadi': { lat: -7.9832, lng: 113.9205 },
};

export const VillageEntranceModal: React.FC<VillageEntranceModalProps> = ({
  isOpen,
  onClose,
  citizens,
  onRegisterCitizen,
  onSelectActiveCitizen,
  onEnterAsAparatur,
  onEnterAsGuest,
  currentActiveCitizen,
}) => {
  const [activeTab, setActiveTab] = useState<'daftar' | 'pilih' | 'mode'>('daftar');

  // Form states
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nik, setNik] = useState('');
  const [noKk, setNoKk] = useState('');
  const [dusun, setDusun] = useState<DusunName>('Dusun Krajan');
  const [rt, setRt] = useState('01');
  const [rw, setRw] = useState('01');
  const [alamatRumah, setAlamatRumah] = useState('');
  const [patokanRumah, setPatokanRumah] = useState('');
  const [noHp, setNoHp] = useState('');
  const [pekerjaan, setPekerjaan] = useState('Petani');
  const [statusKeluarga, setStatusKeluarga] = useState<'Kepala Keluarga' | 'Istri' | 'Anak' | 'Lainnya'>('Kepala Keluarga');
  const [statusPBB, setStatusPBB] = useState<'Lunas' | 'Belum Lunas'>('Lunas');
  const [nomorObjekPajak, setNomorObjekPajak] = useState('');
  const [jumlahTanggungan, setJumlahTanggungan] = useState(2);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [latitude, setLatitude] = useState(DUSUN_COORDINATES['Dusun Krajan'].lat);
  const [longitude, setLongitude] = useState(DUSUN_COORDINATES['Dusun Krajan'].lng);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // Search existing
  const [searchQuery, setSearchQuery] = useState('');
  const [justRegistered, setJustRegistered] = useState<CitizenResident | null>(null);

  if (!isOpen) return null;

  const handleDusunChange = (newDusun: DusunName) => {
    setDusun(newDusun);
    const base = DUSUN_COORDINATES[newDusun];
    const jitterLat = (Math.random() - 0.5) * 0.001;
    const jitterLng = (Math.random() - 0.5) * 0.001;
    setLatitude(parseFloat((base.lat + jitterLat).toFixed(5)));
    setLongitude(parseFloat((base.lng + jitterLng).toFixed(5)));
  };

  const handleGetLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Browser tidak mendukung deteksi lokasi otomatis.');
      return;
    }
    setGpsStatus('Mendeteksi sinyal satelit GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
        setGpsStatus('Lokasi GPS berhasil diperbarui!');
        setTimeout(() => setGpsStatus(null), 3000);
      },
      () => {
        setGpsStatus('GPS tidak dapat diakses. Menggunakan koordinat default wilayah dusun.');
        setTimeout(() => setGpsStatus(null), 3000);
      }
    );
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !nik.trim() || !alamatRumah.trim()) return;

    const newCitizen: CitizenResident = {
      id: 'cit-' + Date.now(),
      namaLengkap: namaLengkap.trim(),
      nik: nik.trim(),
      noKk: noKk.trim() || '351114' + Math.floor(1000000000 + Math.random() * 9000000000),
      dusun,
      rt,
      rw,
      alamatRumah: alamatRumah.trim(),
      patokanRumah: patokanRumah.trim() || `Dekat jalan utama ${dusun}`,
      latitude,
      longitude,
      noHp: noHp.trim() || '0812' + Math.floor(10000000 + Math.random() * 90000000),
      pekerjaan,
      statusKeluarga,
      statusPBB,
      nomorObjekPajak: nomorObjekPajak.trim() || `35.11.140.006.00${Math.floor(10 + Math.random() * 89)}-00${Math.floor(10 + Math.random() * 89)}.0`,
      jumlahTanggungan: Number(jumlahTanggungan) || 1,
      fotoRumahUrl: selectedPhoto,
      tanggalDaftar: new Date().toISOString().split('T')[0],
      catatanAparatur: 'Pendaftaran mandiri warga via portal awal Desa Gunosari.',
    };

    onRegisterCitizen(newCitizen);
    onSelectActiveCitizen(newCitizen);
    setJustRegistered(newCitizen);
  };

  const filteredCitizens = citizens.filter(
    (c) =>
      c.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nik.includes(searchQuery) ||
      c.dusun.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.alamatRumah.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header Desa Gunosari dengan Logo Perdesaan */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 relative overflow-hidden">
          {/* Subtle decorative background ring */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-blue-600/10 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Logo Desa Gunosari Bernuansa Perdesaan */}
            <div className="relative flex-shrink-0">
              <img
                src={LOGO_DESA_GUNOSARI}
                alt="Logo Desa Gunosari"
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg border-2 border-amber-400 bg-white"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full shadow-xs uppercase tracking-wider">
                Resmi
              </span>
            </div>

            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-900/80 border border-blue-700/60 text-blue-200 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Pelayanan & Transparansi Desa Gunosari</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Selamat Datang di Desa Gunosari
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Kecamatan Tlogosari, Kabupaten Bondowoso &bull; {VILLAGE_INFO.motto}
              </p>
              <p className="text-[11px] text-blue-200/80 mt-0.5">
                Daftarkan identitas Anda untuk kemudahan pelaporan aduan, pemetaan rumah, dan transparansi anggaran desa.
              </p>
            </div>

            {/* Close Button if already entered before */}
            {currentActiveCitizen && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Jika Baru Saja Berhasil Daftar */}
        {justRegistered ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900">
                Pendaftaran Warga Berhasil!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Selamat datang, <strong>{justRegistered.namaLengkap}</strong>. Data kependudukan Anda di <strong>{justRegistered.dusun}</strong> telah aktif dan terhubung ke Peta Wilayah Desa Gunosari.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">NIK:</span>
                <span className="font-mono font-bold text-slate-800">{justRegistered.nik}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">Wilayah:</span>
                <span className="font-semibold text-slate-800">{justRegistered.dusun} (RT {justRegistered.rt} / RW {justRegistered.rw})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">Alamat:</span>
                <span className="font-medium text-slate-700">{justRegistered.alamatRumah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status PBB-P2:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  justRegistered.statusPBB === 'Lunas' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                }`}>
                  {justRegistered.statusPBB}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setJustRegistered(null);
                  onClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                <span>Masuk ke Portal Desa Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Tab Navigation di Awal Masuk */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
              <button
                onClick={() => setActiveTab('daftar')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === 'daftar'
                    ? 'border-blue-900 text-blue-950 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4 text-blue-700" />
                <span>1. Daftar Warga Baru</span>
              </button>
              <button
                onClick={() => setActiveTab('pilih')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === 'pilih'
                    ? 'border-blue-900 text-blue-950 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-700" />
                <span>2. Warga Terdaftar ({citizens.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('mode')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === 'mode'
                    ? 'border-blue-900 text-blue-950 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-4 h-4 text-blue-700" />
                <span>3. Aparatur / Tamu</span>
              </button>
            </div>

            {/* TAB 1: FORMULIR PENDAFTARAN WARGA */}
            {activeTab === 'daftar' && (
              <form onSubmit={handleSubmitRegistration} className="p-5 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto text-xs">
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-blue-950">
                  <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Silakan isi data kependudukan warga Desa Gunosari di bawah ini. Data Anda akan disimpan untuk memudahkan pembuatan laporan aduan, pemantauan status PBB, dan penandaan titik rumah di Peta Wilayah Desa.
                  </p>
                </div>

                {/* Baris 1: Nama & NIK */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      placeholder="Contoh: Sugeng Santoso"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      placeholder="Contoh: 3511141203850001"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Baris 2: Dusun, RT, RW */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Wilayah Dusun <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={dusun}
                      onChange={(e) => handleDusunChange(e.target.value as DusunName)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-700"
                    >
                      {DUSUN_OPTIONS.map((ds) => (
                        <option key={ds} value={ds}>
                          {ds}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      RT
                    </label>
                    <input
                      type="text"
                      value={rt}
                      onChange={(e) => setRt(e.target.value)}
                      placeholder="Contoh: 02"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      RW
                    </label>
                    <input
                      type="text"
                      value={rw}
                      onChange={(e) => setRw(e.target.value)}
                      placeholder="Contoh: 01"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono"
                    />
                  </div>
                </div>

                {/* Baris 3: Alamat Rumah & Patokan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Alamat Jalan / Gang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={alamatRumah}
                      onChange={(e) => setAlamatRumah(e.target.value)}
                      placeholder="Contoh: Jl. Dusun Krajan Timur RT 02/RW 01"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Patokan Lokasi Rumah
                    </label>
                    <input
                      type="text"
                      value={patokanRumah}
                      onChange={(e) => setPatokanRumah(e.target.value)}
                      placeholder="Contoh: Depan Pos Kamling dekat pohon beringin"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Baris 4: WhatsApp & Pekerjaan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      No. WhatsApp / HP
                    </label>
                    <input
                      type="text"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pekerjaan Utama
                    </label>
                    <select
                      value={pekerjaan}
                      onChange={(e) => setPekerjaan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      <option value="Petani">Petani</option>
                      <option value="Pekebun Kopi">Pekebun Kopi</option>
                      <option value="Buruh Tani">Buruh Tani</option>
                      <option value="Pedagang">Pedagang</option>
                      <option value="Wiraswasta">Wiraswasta</option>
                      <option value="PNS / Guru">PNS / Guru</option>
                      <option value="Perangkat Desa">Perangkat Desa</option>
                      <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Status Keluarga
                    </label>
                    <select
                      value={statusKeluarga}
                      onChange={(e) => setStatusKeluarga(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      <option value="Kepala Keluarga">Kepala Keluarga</option>
                      <option value="Istri">Istri</option>
                      <option value="Anak">Anak</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* Status Kepatuhan Pajak PBB */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Status Pajak PBB-P2 2025
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStatusPBB('Lunas')}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                          statusPBB === 'Lunas'
                            ? 'bg-blue-100 border-blue-400 text-blue-950'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        Sudah Lunas
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusPBB('Belum Lunas')}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                          statusPBB === 'Belum Lunas'
                            ? 'bg-amber-100 border-amber-400 text-amber-900'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        Belum Lunas
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nomor Objek Pajak (NOP)
                    </label>
                    <input
                      type="text"
                      value={nomorObjekPajak}
                      onChange={(e) => setNomorObjekPajak(e.target.value)}
                      placeholder="Contoh: 35.11.140.006.001-0023.0"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Pemetaan Koordinat GPS Rumah */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-700" />
                      <span>Titik Lokasi Rumah di Peta Desa</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleGetLiveGps}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-900 border border-slate-200 rounded-md font-semibold text-[11px] cursor-pointer"
                    >
                      <Compass className="w-3 h-3 text-blue-700" />
                      <span>Deteksi GPS Saya</span>
                    </button>
                  </div>

                  {gpsStatus && (
                    <div className="text-[11px] text-blue-900 bg-blue-100/60 p-1.5 rounded font-medium">
                      {gpsStatus}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Latitude:</span>
                      <span className="font-bold text-slate-800">{latitude}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Longitude:</span>
                      <span className="font-bold text-slate-800">{longitude}</span>
                    </div>
                  </div>
                </div>

                {/* Fitur Kamera & Foto Rumah Warga */}
                <div className="pt-2 border-t border-slate-200">
                  <HouseCameraCapture
                    currentPhotoUrl={selectedPhoto}
                    onPhotoCaptured={setSelectedPhoto}
                    dusunName={dusun}
                    label="Foto Tampak Depan Rumah Warga (Kamera Langsung)"
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onEnterAsGuest}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    Lewati (Masuk Tamu)
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar & Masuk ke Aplikasi</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PILIH WARGA TERDAFTAR (MASUK CEPAT) */}
            {activeTab === 'pilih' && (
              <div className="p-5 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama warga, NIK, atau dusun..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredCitizens.map((c) => {
                    const isCurrent = currentActiveCitizen?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectActiveCitizen(c);
                          onClose();
                        }}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                          isCurrent
                            ? 'bg-blue-50 border-blue-700 ring-2 ring-blue-700/20'
                            : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                        }`}
                      >
                        {c.fotoRumahUrl ? (
                          <img
                            src={c.fotoRumahUrl}
                            alt={c.namaLengkap}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Home className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {c.namaLengkap}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 bg-blue-900 text-white rounded text-[9px] font-bold">
                                Aktif
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {c.dusun} (RT {c.rt}/RW {c.rw})
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-slate-400">
                              NIK: {c.nik.substring(0, 8)}...
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 rounded ${
                              c.statusPBB === 'Lunas' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                            }`}>
                              PBB {c.statusPBB}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: MASUK SEBAGAI APARATUR / TAMU */}
            {activeTab === 'mode' && (
              <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-300" />
                    <span className="font-bold text-sm">Masuk Sebagai Aparatur / Perangkat Desa</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Akses modul resmi untuk Kepala Desa, Kaur Keuangan, Sekretaris Desa, dan Kasi Kesejahteraan. Kelola aduan masuk, update realisasi belanja BKU, atur bagi hasil pajak per dusun, dan pantau direktori kependudukan.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={onEnterAsAparatur}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Masuk ke Dashboard Aparatur Desa</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-700" />
                    <span className="font-bold text-sm text-slate-900">Jelajahi Langsung Sebagai Tamu Publik</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Akses publik tanpa mendaftar terlebih dahulu. Anda dapat memantau feed transparansi pengaduan warga, melihat peta sebaran fasilitas desa, dan mengecek laporan realisasi APBDes Desa Gunosari.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={onEnterAsGuest}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <span>Masuk Portal Publik (Tamu)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
