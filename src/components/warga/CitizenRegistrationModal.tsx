import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  MapPin, 
  Home, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  Compass, 
  Camera,
  Info
} from 'lucide-react';
import { CitizenResident, DusunName } from '../../types';
import { HouseCameraCapture } from '../common/HouseCameraCapture';

interface CitizenRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterCitizen: (citizen: CitizenResident) => void;
  onViewOnMap?: (citizenId: string) => void;
}

export const CitizenRegistrationModal: React.FC<CitizenRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterCitizen,
  onViewOnMap,
}) => {
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

  // Koordinat otomatis berdasarkan dusun di Desa Gunosari
  const dusunCoordinates: Record<DusunName, { lat: number; lng: number }> = {
    'Dusun Krajan': { lat: -7.9854, lng: 113.9158 },
    'Dusun Sumber Ketangi': { lat: -7.9878, lng: 113.9186 },
    'Dusun Gunung Sari Kidul': { lat: -7.9908, lng: 113.9138 },
    'Dusun Sidodadi': { lat: -7.9832, lng: 113.9205 },
  };

  const [latitude, setLatitude] = useState(dusunCoordinates['Dusun Krajan'].lat);
  const [longitude, setLongitude] = useState(dusunCoordinates['Dusun Krajan'].lng);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // House photo (empty by default)
  const [selectedPhoto, setSelectedPhoto] = useState('');

  if (!isOpen) return null;

  const handleDusunChange = (newDusun: DusunName) => {
    setDusun(newDusun);
    // Auto-adjust latitude longitude with small jitter
    const base = dusunCoordinates[newDusun];
    const jitterLat = (Math.random() - 0.5) * 0.001;
    const jitterLng = (Math.random() - 0.5) * 0.001;
    setLatitude(parseFloat((base.lat + jitterLat).toFixed(5)));
    setLongitude(parseFloat((base.lng + jitterLng).toFixed(5)));
  };

  const handleGetLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Browser Anda tidak mendukung deteksi lokasi otomatis.');
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
        setGpsStatus('Tidak dapat mendeteksi GPS. Menggunakan koordinat perkiraan Dusun.');
        setTimeout(() => setGpsStatus(null), 3000);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      patokanRumah: patokanRumah.trim() || `Dekat perumahan RT ${rt} / RW ${rw}`,
      latitude,
      longitude,
      noHp: noHp.trim() || '0812-0000-0000',
      pekerjaan: pekerjaan.trim(),
      statusKeluarga,
      statusPBB,
      nomorObjekPajak: nomorObjekPajak.trim() || `35.11.140.006.${rt}${rw}-00${Math.floor(10 + Math.random() * 80)}.0`,
      jumlahTanggungan,
      fotoRumahUrl: selectedPhoto,
      tanggalDaftar: new Date().toISOString().split('T')[0],
      catatanAparatur: 'Pendaftaran warga baru melalui Portal Desa Gunosari.',
    };

    onRegisterCitizen(newCitizen);
    onClose();

    if (onViewOnMap) {
      onViewOnMap(newCitizen.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700/80 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Pendaftaran Warga Desa Gunosari
              </h3>
              <p className="text-xs text-slate-300">
                Kecamatan Tlogosari, Kabupaten Bondowoso, Jawa Timur
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Isi */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-blue-900">
            <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Data pendaftaran kependudukan ini akan langsung memetakan koordinat alamat rumah warga di <strong>Peta Geospasial Desa Gunosari</strong> agar Kepala Desa, Kepala Dusun, dan aparat pelayanan desa dapat langsung mengunjungi lokasi dengan akurat.
            </p>
          </div>

          {/* Nama & NIK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap Warga <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                NIK (16 Digit) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="351114xxxxxxxxxx"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          {/* No KK & Status Keluarga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nomor Kartu Keluarga (KK)
              </label>
              <input
                type="text"
                maxLength={16}
                value={noKk}
                onChange={(e) => setNoKk(e.target.value)}
                placeholder="351114xxxxxxxxxx"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status Dalam Keluarga
              </label>
              <select
                value={statusKeluarga}
                onChange={(e) => setStatusKeluarga(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Lainnya">Anggota Keluarga Lainnya</option>
              </select>
            </div>
          </div>

          {/* Wilayah Dusun & RT/RW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Wilayah Dusun <span className="text-red-500">*</span>
              </label>
              <select
                value={dusun}
                onChange={(e) => handleDusunChange(e.target.value as DusunName)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="Dusun Krajan">Dusun Krajan</option>
                <option value="Dusun Sumber Ketangi">Dusun Sumber Ketangi</option>
                <option value="Dusun Gunung Sari Kidul">Dusun Gunung Sari Kidul</option>
                <option value="Dusun Sidodadi">Dusun Sidodadi</option>
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
                placeholder="01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-center font-mono"
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
                placeholder="01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-center font-mono"
              />
            </div>
          </div>

          {/* Alamat Lengkap & Patokan Rumah */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Alamat Rumah Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={alamatRumah}
              onChange={(e) => setAlamatRumah(e.target.value)}
              placeholder="Contoh: Jl. Melati No. 20, Gang Mawar RT 02 / RW 01"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Patokan / Ciri Khusus Rumah (Penting untuk Kades & Perangkat)
            </label>
            <input
              type="text"
              value={patokanRumah}
              onChange={(e) => setPatokanRumah(e.target.value)}
              placeholder="Contoh: Rumah cat biru pagar bambu, 30 meter timur Pos Kamling"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Koordinat Geospasial Peta */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-700" />
                Koordinat Rumah di Peta Desa Gunosari:
              </span>
              <button
                type="button"
                onClick={handleGetLiveGps}
                className="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                <span>Ambil GPS Sekarang</span>
              </button>
            </div>

            {gpsStatus && (
              <p className="text-[11px] text-blue-800 font-semibold">{gpsStatus}</p>
            )}

            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Latitude (Garis Lintang):</span>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Longitude (Garis Bujur):</span>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              *Koordinat telah disesuaikan otomatis dengan wilayah {dusun}, Kecamatan Tlogosari, Bondowoso.
            </p>
          </div>

          {/* Nomor HP, Pekerjaan, Status PBB */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                No. HP / WhatsApp
              </label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pekerjaan Utama
              </label>
              <input
                type="text"
                value={pekerjaan}
                onChange={(e) => setPekerjaan(e.target.value)}
                placeholder="Petani / Pedagang / Buruh"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status PBB-P2
              </label>
              <select
                value={statusPBB}
                onChange={(e) => setStatusPBB(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="Lunas">Lunas PBB</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>
            </div>
          </div>

          {/* Fitur Kamera & Foto Rumah Warga */}
          <div className="pt-1 border-t border-slate-200/80">
            <HouseCameraCapture
              currentPhotoUrl={selectedPhoto}
              onPhotoCaptured={setSelectedPhoto}
              dusunName={dusun}
              label="Foto Tampak Depan Rumah Warga (Kamera Langsung)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-200" />
              <span>Simpan & Petakan di Peta Desa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
