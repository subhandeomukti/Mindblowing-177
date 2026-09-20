import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Camera, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Code,
  Building,
  UserCheck
} from 'lucide-react';
import { VillageOfficial } from '../../types';
import { EditOfficialModal } from './EditOfficialModal';

interface VillageOfficialsModuleProps {
  officials: VillageOfficial[];
  onUpdateOfficial: (updated: VillageOfficial) => void;
  onAddOfficial: (newOfficial: VillageOfficial) => void;
  onDeleteOfficial: (id: string) => void;
}

export const VillageOfficialsModule: React.FC<VillageOfficialsModuleProps> = ({
  officials,
  onUpdateOfficial,
  onAddOfficial,
  onDeleteOfficial,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOfficialForEdit, setSelectedOfficialForEdit] = useState<VillageOfficial | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredOfficials = officials.filter((off) => 
    off.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    off.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (off.email && off.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (off.nipNiapd && off.nipNiapd.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const subhanOfficial = officials.find(
    (off) => off.email?.toLowerCase().includes('subhandeomukti') || off.namaLengkap.toLowerCase().includes('subhan deo')
  );

  const handleOpenAddModal = () => {
    const newOfficialTemplate: VillageOfficial = {
      id: 'off-' + Date.now(),
      namaLengkap: '',
      jabatan: '',
      nipNiapd: '',
      noHp: '',
      email: 'subhandeomukti@gmail.com',
      fotoUrl: '',
      tugasPokok: '',
      status: 'Aktif',
      urutan: officials.length + 1,
      lastUpdatedBy: 'Subhan Deo Mukti (subhandeomukti@gmail.com)',
      lastUpdatedAt: new Date().toISOString().split('T')[0],
    };
    setSelectedOfficialForEdit(newOfficialTemplate);
    setIsEditModalOpen(true);
  };

  const handleOpenEditSubhan = () => {
    if (subhanOfficial) {
      setSelectedOfficialForEdit(subhanOfficial);
    } else {
      handleOpenAddModal();
    }
    setIsEditModalOpen(true);
  };

  const handleSaveOfficial = (savedOfficial: VillageOfficial) => {
    const exists = officials.some((o) => o.id === savedOfficial.id);
    if (exists) {
      onUpdateOfficial(savedOfficial);
    } else {
      onAddOfficial(savedOfficial);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header with Developer / Administrator Credit */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-950 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
              <span>Pemerintahan Desa Gunosari</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-xs font-bold flex items-center gap-1 border border-amber-200">
              <Code className="w-3 h-3 text-amber-700" />
              <span>Pengembang: Subhan Deo Mukti</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Struktur & Foto Resmi Perangkat Desa Gunosari
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Kelola nama, jabatan, nomor kontak, tugas pokok, dan potret foto kamera perangkat desa secara mandiri. Dilengkapi hak kelola pengembang oleh <strong>Subhan Deo Mukti</strong> (<span className="text-blue-700 font-mono">subhandeomukti@gmail.com</span>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenEditSubhan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            title="Kelola profil & foto pengembang / perangkat desa Subhan Deo Mukti"
          >
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>Atur Akun Subhan Deo Mukti</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>+ Tambah Perangkat Desa</span>
          </button>
        </div>
      </div>

      {/* Subhan Deo Mukti Dedicated Spotlight Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md border border-blue-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-blue-800 border-2 border-amber-300 shadow-md flex-shrink-0 flex items-center justify-center">
            {subhanOfficial?.fotoUrl ? (
              <img
                src={subhanOfficial.fotoUrl}
                alt="Subhan Deo Mukti"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xl font-bold text-amber-300">SDM</div>
            )}
            <button
              type="button"
              onClick={handleOpenEditSubhan}
              className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
              title="Ganti Foto Subhan Deo Mukti"
            >
              <Camera className="w-5 h-5 text-amber-300" />
            </button>
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-base text-white">Subhan Deo Mukti</span>
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider">
                Pengembang & Koordinator TI
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Email Resmi: <strong className="text-white font-mono">subhandeomukti@gmail.com</strong> &bull; Hak Akses: Administrator & Pengembang Sistem
            </p>
            <p className="text-[11px] text-blue-300 line-clamp-1">
              {subhanOfficial?.tugasPokok || 'Pengembang & Administrator Utama Portal Desa, Peta Geospasial, Manajemen Anggaran APBDes & Verifikasi Digital.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenEditSubhan}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition cursor-pointer backdrop-blur-xs flex-shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-300" />
          <span>Isi / Ubah Nama & Foto Saya</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari perangkat desa berdasarkan nama, jabatan, NIP, atau email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Menampilkan <strong>{filteredOfficials.length}</strong> Perangkat Desa</span>
        </div>
      </div>

      {/* Grid of Village Officials Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOfficials.map((official) => {
          const isSubhan = official.email?.toLowerCase().includes('subhandeomukti') || official.namaLengkap.toLowerCase().includes('subhan deo');

          return (
            <div
              key={official.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isSubhan 
                  ? 'border-amber-300 shadow-md ring-2 ring-amber-400/30' 
                  : 'border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header Card with Photo & Status Badge */}
                <div className="p-5 pb-3 border-b border-slate-100 flex items-start gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md flex-shrink-0 flex items-center justify-center">
                    {official.fotoUrl ? (
                      <img
                        src={official.fotoUrl}
                        alt={official.namaLengkap}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-900 text-amber-300 font-bold text-lg flex items-center justify-center">
                        {official.namaLengkap ? official.namaLengkap.charAt(0).toUpperCase() : 'P'}
                      </div>
                    )}

                    {/* Quick camera trigger icon */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOfficialForEdit(official);
                        setIsEditModalOpen(true);
                      }}
                      className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                      title="Ubah / Potret Foto"
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        official.status === 'Aktif' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {official.status}
                      </span>
                      {isSubhan && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-md border border-amber-200">
                          Pengembang
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 truncate" title={official.namaLengkap}>
                      {official.namaLengkap || 'Nama Belum Diisi'}
                    </h3>
                    <p className="text-xs text-blue-900 font-semibold truncate" title={official.jabatan}>
                      {official.jabatan}
                    </p>
                    {official.nipNiapd && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        NIP: {official.nipNiapd}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 pt-3 space-y-2.5 text-xs">
                  {official.tugasPokok && (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Tugas Pokok & Wewenang:
                      </span>
                      <p className="text-slate-700 text-xs line-clamp-2 leading-relaxed">
                        {official.tugasPokok}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                      <a 
                        href={`https://wa.me/${official.noHp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline hover:text-blue-800 font-medium truncate"
                      >
                        {official.noHp}
                      </a>
                    </div>

                    {official.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                        <span className="truncate font-mono text-[11px]">{official.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 truncate">
                  Diperbarui: {official.lastUpdatedAt || '2026-09-20'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOfficialForEdit(official);
                      setIsEditModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                    title="Ubah nama, jabatan, kontak, dan potret foto perangkat desa"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ubah & Foto</span>
                  </button>

                  {!isSubhan && officials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus data ${official.namaLengkap}?`)) {
                          onDeleteOfficial(official.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Hapus Perangkat Desa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Fill Official Modal */}
      <EditOfficialModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOfficialForEdit(null);
        }}
        official={selectedOfficialForEdit}
        onSave={handleSaveOfficial}
        currentUserEmail="subhandeomukti@gmail.com"
        currentUserName="Subhan Deo Mukti"
      />
    </div>
  );
};
