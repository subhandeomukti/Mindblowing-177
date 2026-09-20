import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Home, 
  Plus, 
  ExternalLink,
  Filter,
  CreditCard,
  Building,
  Camera,
  X
} from 'lucide-react';
import { CitizenResident, DusunName } from '../../types';
import { HouseCameraCapture } from '../common/HouseCameraCapture';

interface CitizenDirectoryModuleProps {
  citizens: CitizenResident[];
  onOpenRegisterModal: () => void;
  onFocusCitizenOnMap: (citizenId: string) => void;
  onUpdateCitizenPhoto?: (citizenId: string, newPhotoUrl: string) => void;
}

export const CitizenDirectoryModule: React.FC<CitizenDirectoryModuleProps> = ({
  citizens,
  onOpenRegisterModal,
  onFocusCitizenOnMap,
  onUpdateCitizenPhoto,
}) => {
  const [selectedDusun, setSelectedDusun] = useState<string>('all');
  const [selectedStatusPbb, setSelectedStatusPbb] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [photoEditCitizen, setPhotoEditCitizen] = useState<CitizenResident | null>(null);
  const [tempEditedPhoto, setTempEditedPhoto] = useState<string>('');

  const filteredCitizens = citizens
    .filter((c) => selectedDusun === 'all' || c.dusun === selectedDusun)
    .filter((c) => selectedStatusPbb === 'all' || c.statusPBB === selectedStatusPbb)
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.namaLengkap.toLowerCase().includes(q) ||
        c.nik.includes(q) ||
        c.alamatRumah.toLowerCase().includes(q) ||
        c.patokanRumah.toLowerCase().includes(q)
      );
    });

  const totalCitizens = citizens.length;
  const lunasPbbCount = citizens.filter((c) => c.statusPBB === 'Lunas').length;
  const belumLunasCount = totalCitizens - lunasPbbCount;
  const persentaseKepatuhan = totalCitizens > 0 ? ((lunasPbbCount / totalCitizens) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner Kependudukan */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
              Pelayanan Kependudukan & Pajak Daerah
            </span>
            <span className="text-xs text-slate-500 font-medium">Kec. Tlogosari, Kab. Bondowoso</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Data Registrasi Warga & Alamat Rumah Desa Gunosari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Basis data alamat rumah, kepatuhan PBB-P2, kontak warga, dan koordinat geospasial untuk aparatur desa.
          </p>
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-blue-200" />
          <span>+ Tambah Warga Terdaftar</span>
        </button>
      </div>

      {/* KPI Kependudukan & PBB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Warga Terdata</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {totalCitizens} <span className="text-xs font-normal text-slate-500">Kepala Keluarga</span>
          </span>
          <span className="text-[11px] text-blue-800 font-medium mt-1 block">
            Terpetakan dalam 4 Dusun
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Kepatuhan PBB-P2 2025</span>
          <span className="text-2xl font-bold text-emerald-800 mt-1 block">
            {persentaseKepatuhan}%
          </span>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {lunasPbbCount} Rumah Telah Lunas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Wajib Pajak Belum Lunas</span>
          <span className="text-2xl font-bold text-amber-900 mt-1 block">
            {belumLunasCount} <span className="text-xs font-normal text-slate-500">Objek Pajak</span>
          </span>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            Perlu konfirmasi Kepala Dusun
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Integrasi Peta Rumah</span>
          <span className="text-2xl font-bold text-blue-900 mt-1 block">
            100%
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Semua alamat dilengkapi koordinat GPS
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Dusun:
          </span>
          <select
            value={selectedDusun}
            onChange={(e) => setSelectedDusun(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Semua Dusun di Desa Gunosari</option>
            <option value="Dusun Krajan">Dusun Krajan</option>
            <option value="Dusun Sumber Ketangi">Dusun Sumber Ketangi</option>
            <option value="Dusun Gunung Sari Kidul">Dusun Gunung Sari Kidul</option>
            <option value="Dusun Sidodadi">Dusun Sidodadi</option>
          </select>

          <select
            value={selectedStatusPbb}
            onChange={(e) => setSelectedStatusPbb(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Semua Status PBB</option>
            <option value="Lunas">Hanya PBB Lunas</option>
            <option value="Belum Lunas">Hanya Belum Lunas</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIK, alamat rumah..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-700"
          />
        </div>
      </div>

      {/* Directory Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCitizens.map((citizen) => {
          const isLunas = citizen.statusPBB === 'Lunas';
          const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${citizen.latitude},${citizen.longitude}`;
          const waUrl = `https://wa.me/62${citizen.noHp.replace(/[^0-9]/g, '').replace(/^0/, '')}`;

          return (
            <div
              key={citizen.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-36 bg-slate-100 overflow-hidden">
                  {citizen.fotoRumahUrl ? (
                    <img
                      src={citizen.fotoRumahUrl}
                      alt={citizen.namaLengkap}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-50 border-b border-dashed border-slate-200 flex flex-col items-center justify-center p-3 text-center">
                      <Home className="w-7 h-7 text-slate-300 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-600">Foto Rumah Kosong</span>
                      <span className="text-[10px] text-slate-400">Gunakan kamera untuk memotret</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1 bg-white/90 backdrop-blur-xs text-slate-800">
                    <span className={`w-2 h-2 rounded-full ${isLunas ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span>{citizen.statusPBB}</span>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-medium">
                    RT {citizen.rt} / RW {citizen.rw} &bull; {citizen.dusun}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoEditCitizen(citizen);
                      setTempEditedPhoto(citizen.fotoRumahUrl || '');
                    }}
                    className="absolute top-2 left-2 px-2 py-1 bg-blue-900/85 hover:bg-blue-900 text-white rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1 backdrop-blur-xs transition cursor-pointer border border-blue-400/40"
                    title="Buka Kamera untuk Memotret Rumah Ini"
                  >
                    <Camera className="w-3 h-3 text-amber-300" />
                    <span>Kamera</span>
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{citizen.namaLengkap}</h3>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 mt-0.5">
                      <span>NIK: {citizen.nik}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Alamat & Patokan Rumah
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {citizen.alamatRumah}
                    </p>
                    <p className="text-slate-500 italic text-[11px]">
                      "{citizen.patokanRumah}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pekerjaan:</span>
                      <span className="font-semibold text-slate-800 text-[11px]">{citizen.pekerjaan}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">NOP Pajak PBB:</span>
                      <span className="font-mono text-slate-800 text-[10px] truncate block">{citizen.nomorObjekPajak}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onFocusCitizenOnMap(citizen.id)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-800" />
                  <span>Lihat di Peta</span>
                </button>

                <a
                  href={gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                  <span>Rute Google</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Kamera Pembaruan Foto Rumah Warga */}
      {photoEditCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
                  <Camera className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Foto Kamera Rumah Warga
                  </h3>
                  <p className="text-xs text-slate-500">
                    {photoEditCitizen.namaLengkap} &bull; {photoEditCitizen.dusun} (RT {photoEditCitizen.rt} / RW {photoEditCitizen.rw})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPhotoEditCitizen(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <HouseCameraCapture
              currentPhotoUrl={tempEditedPhoto || photoEditCitizen.fotoRumahUrl || ''}
              onPhotoCaptured={(url) => setTempEditedPhoto(url)}
              dusunName={photoEditCitizen.dusun}
              label={`Potret Rumah ${photoEditCitizen.namaLengkap}`}
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPhotoEditCitizen(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempEditedPhoto !== undefined) {
                    onUpdateCitizenPhoto?.(photoEditCitizen.id, tempEditedPhoto);
                  }
                  setPhotoEditCitizen(null);
                }}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-200" />
                <span>Simpan Foto Rumah</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
