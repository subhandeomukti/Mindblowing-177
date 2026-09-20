import React from 'react';
import { 
  Shield, 
  Building2, 
  User, 
  RefreshCw, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus,
  Users,
  LogOut,
  UserCheck
} from 'lucide-react';
import { CitizenResident } from '../types';
import { VILLAGE_INFO, LOGO_DESA_GUNOSARI } from '../data/mockData';

interface HeaderProps {
  currentPortal: 'warga' | 'aparatur';
  onSelectPortal: (portal: 'warga' | 'aparatur') => void;
  activeWargaTab: 'transparansi' | 'peta' | 'lacak' | 'buat';
  onSelectWargaTab: (tab: 'transparansi' | 'peta' | 'lacak' | 'buat') => void;
  activeAparaturTab: 'aduan' | 'peta' | 'warga' | 'perangkat' | 'pajak' | 'keuangan';
  onSelectAparaturTab: (tab: 'aduan' | 'peta' | 'warga' | 'perangkat' | 'pajak' | 'keuangan') => void;
  openComplaintModal: () => void;
  openRegisterModal: () => void;
  openPrintModal: () => void;
  openEntranceModal?: () => void;
  activeCitizen?: CitizenResident | null;
  onLogoutCitizen?: () => void;
  totalComplaints: number;
  resolvedComplaints: number;
  totalCitizens: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPortal,
  onSelectPortal,
  activeWargaTab,
  onSelectWargaTab,
  activeAparaturTab,
  onSelectAparaturTab,
  openComplaintModal,
  openRegisterModal,
  openPrintModal,
  openEntranceModal,
  activeCitizen,
  onLogoutCitizen,
  totalComplaints,
  resolvedComplaints,
  totalCitizens,
}) => {
  const resolvedPct = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Pemerintah Desa Gunosari */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="font-bold text-white tracking-wide">{VILLAGE_INFO.namaDesa.toUpperCase()}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">{VILLAGE_INFO.kecamatan}</span>
            <span className="text-slate-500">|</span>
            <span className="text-blue-300 font-medium">{VILLAGE_INFO.kabupaten}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="hidden sm:inline text-slate-400">Kode: {VILLAGE_INFO.kodeDesa}</span>
            <button
              onClick={openPrintModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 transition font-medium border border-slate-700 cursor-pointer"
              title="Cetak Rekap Laporan Resmi Desa Gunosari"
            >
              <FileText className="w-3 h-3 text-blue-300" />
              <span>Cetak Dokumen Resmi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Identity & Emblem Desa Gunosari */}
        <div className="flex items-center gap-3.5">
          <button 
            type="button"
            onClick={openEntranceModal}
            className="relative cursor-pointer group flex-shrink-0 text-left"
            title="Klik untuk membuka Menu Pendaftaran & Pintu Masuk Desa Gunosari"
          >
            <img
              src={LOGO_DESA_GUNOSARI}
              alt="Logo Desa Gunosari"
              referrerPolicy="no-referrer"
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover shadow-md border-2 border-amber-400 group-hover:scale-105 transition bg-white"
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-blue-900 rounded-full text-white border border-white shadow-xs">
              <Building2 className="w-3 h-3 text-amber-300" />
            </span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Portal Desa Gunosari
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200 rounded-full">
                Bondowoso
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
              Pendaftaran Warga &bull; Peta Alamat Rumah &bull; Aduan Real-Time &bull; Pajak BHPRD &bull; APBDes
            </p>
          </div>
        </div>

        {/* Portal Switcher, Active Citizen Badge & Action CTAs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Switcher Warga vs Perangkat */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onSelectPortal('warga')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                currentPortal === 'warga'
                  ? 'bg-white text-blue-950 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-800" />
              <span>Portal Warga</span>
            </button>

            <button
              onClick={() => onSelectPortal('aparatur')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                currentPortal === 'aparatur'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Perangkat Desa</span>
            </button>
          </div>

          {/* Active Citizen Badge or Initial Entrance Trigger */}
          {activeCitizen ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={openEntranceModal}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 text-xs transition cursor-pointer text-left"
                title="Warga Aktif: Klik untuk ganti akun atau daftar baru"
              >
                <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {activeCitizen.namaLengkap.charAt(0)}
                </div>
                <div className="leading-tight hidden sm:block">
                  <div className="flex items-center gap-1">
                    <span className="font-bold truncate max-w-[110px]">{activeCitizen.namaLengkap}</span>
                    <span className="text-[9px] bg-blue-200 text-blue-900 px-1 rounded font-bold">Warga</span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block max-w-[120px]">
                    {activeCitizen.dusun}
                  </span>
                </div>
              </button>
              {onLogoutCitizen && (
                <button
                  type="button"
                  onClick={onLogoutCitizen}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition cursor-pointer"
                  title="Keluar dari akun warga"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openEntranceModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 text-xs font-bold border border-blue-200 transition cursor-pointer"
              title="Buka Pendaftaran Awal Masuk Aplikasi"
            >
              <UserCheck className="w-4 h-4 text-blue-800" />
              <span className="hidden sm:inline">Pendaftaran Awal</span>
              <span className="sm:hidden">Masuk</span>
            </button>
          )}

          {/* Action CTAs */}
          <button
            onClick={openRegisterModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-800" />
            <span>+ Daftar Warga</span>
          </button>

          {currentPortal === 'warga' && (
            <button
              onClick={openComplaintModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-blue-200" />
              <span>+ Buat Aduan</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar based on active portal */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 py-2">
          {currentPortal === 'warga' ? (
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-medium scrollbar-none">
              <button
                onClick={() => onSelectWargaTab('transparansi')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeWargaTab === 'transparansi'
                    ? 'bg-blue-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Papan Transparansi Publik
              </button>
              <button
                onClick={() => onSelectWargaTab('peta')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeWargaTab === 'peta'
                    ? 'bg-blue-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Peta Alamat Rumah & Aduan</span>
              </button>
              <button
                onClick={() => onSelectWargaTab('lacak')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeWargaTab === 'lacak'
                    ? 'bg-blue-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Lacak Status Tiket Real-Time
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-medium scrollbar-none">
              <button
                onClick={() => onSelectAparaturTab('aduan')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeAparaturTab === 'aduan'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                Verifikasi & Disposisi Aduan
              </button>
              <button
                onClick={() => onSelectAparaturTab('peta')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeAparaturTab === 'peta'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Peta Lokasi Rumah (Kades/Perangkat)</span>
              </button>
              <button
                onClick={() => onSelectAparaturTab('warga')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeAparaturTab === 'warga'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Data Warga ({totalCitizens})</span>
              </button>
              <button
                onClick={() => onSelectAparaturTab('perangkat')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeAparaturTab === 'perangkat'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Perangkat Desa & Profil Pengembang</span>
              </button>
              <button
                onClick={() => onSelectAparaturTab('pajak')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeAparaturTab === 'pajak'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                Pembagian Pajak Daerah (BHPRD & PBB)
              </button>
              <button
                onClick={() => onSelectAparaturTab('keuangan')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  activeAparaturTab === 'keuangan'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                Pelaporan Keuangan APBDes Otomatis
              </button>
            </nav>
          )}

          {/* Real-time sync badge */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Penyelesaian: <strong className="text-slate-800">{resolvedPct}%</strong> ({resolvedComplaints}/{totalComplaints})</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-800 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Terintegrasi Real-Time</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
