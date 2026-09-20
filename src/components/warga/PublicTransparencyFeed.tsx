import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Coins, 
  ArrowUpRight, 
  MessageSquare,
  Sparkles,
  Layers
} from 'lucide-react';
import { Complaint } from '../../types';
import { formatDate, formatRupiah } from '../../utils/formatters';

interface PublicTransparencyFeedProps {
  complaints: Complaint[];
  onSelectComplaintToTrack: (ticketNumber: string) => void;
  onOpenNewComplaintModal: () => void;
  onFocusOnMap?: (ticketNumber: string) => void;
}

export const PublicTransparencyFeed: React.FC<PublicTransparencyFeedProps> = ({
  complaints,
  onSelectComplaintToTrack,
  onOpenNewComplaintModal,
  onFocusOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDusun, setSelectedDusun] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Metrik statistik transparansi
  const total = complaints.length;
  const selesai = complaints.filter((c) => c.status === 'Selesai').length;
  const dalamProses = complaints.filter((c) => c.status === 'Dalam Penanganan' || c.status === 'Diverifikasi').length;
  const totalAnggaranTindakLanjut = complaints.reduce((sum, c) => sum + (c.allocatedBudget || 0), 0);
  const completionRate = total > 0 ? Math.round((selesai / total) * 100) : 0;

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.locationDetail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDusun = selectedDusun === 'Semua' || c.dusun === selectedDusun;
    const matchStatus = selectedStatus === 'Semua' || c.status === selectedStatus;
    const matchCategory = selectedCategory === 'Semua' || c.category === selectedCategory;
    return matchQuery && matchDusun && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Transparansi Hero Banner & Key Metrics */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        {/* Subtle patterned overlay */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Keterbukaan Informasi Publik Desa Gunosari</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Transparansi Aduan Warga & Realisasi Pembangunan
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Setiap aduan warga Desa Gunosari (Kec. Tlogosari, Kab. Bondowoso) dicatat secara terbuka, dipantau secara real-time, dan terhubung langsung dengan alokasi anggaran penanganan pada APBDes.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-xs text-slate-300 block">Total Aduan Masuk</span>
            <span className="text-2xl sm:text-3xl font-bold mt-1 block">{total}</span>
            <span className="text-[11px] text-blue-300 mt-1 block">Warga terlayani</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-xs text-slate-300 block">Tingkat Penyelesaian</span>
            <span className="text-2xl sm:text-3xl font-bold mt-1 text-emerald-400 block">{completionRate}%</span>
            <span className="text-[11px] text-emerald-300/90 mt-1 block">{selesai} tuntas dikerjakan</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-xs text-slate-300 block">Dalam Penanganan</span>
            <span className="text-2xl sm:text-3xl font-bold mt-1 text-amber-300 block">{dalamProses}</span>
            <span className="text-[11px] text-amber-300/90 mt-1 block">Fisik lapangan aktif</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <span className="text-xs text-slate-300 block">Alokasi Kas APBDes</span>
            <span className="text-lg sm:text-xl font-bold mt-1 text-blue-200 block">
              {formatRupiah(totalAnggaranTindakLanjut)}
            </span>
            <span className="text-[11px] text-blue-300 mt-1 block">Terserap dari APBDes</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata kunci aduan, jalan, dusun, atau nomor tiket..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-700 focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenNewComplaintModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-blue-200" />
            <span>+ Buat Aduan Baru</span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Layers className="w-3.5 h-3.5 text-blue-700" />
            <span>Filter:</span>
          </div>

          {/* Dusun Filter */}
          <select
            value={selectedDusun}
            onChange={(e) => setSelectedDusun(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium cursor-pointer"
          >
            <option value="Semua">Semua Dusun</option>
            <option value="Dusun Krajan">Dusun Krajan</option>
            <option value="Dusun Sumber Ketangi">Dusun Sumber Ketangi</option>
            <option value="Dusun Gunung Sari Kidul">Dusun Gunung Sari Kidul</option>
            <option value="Dusun Sidodadi">Dusun Sidodadi</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium cursor-pointer"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Diverifikasi">Diverifikasi</option>
            <option value="Dalam Penanganan">Dalam Penanganan</option>
            <option value="Selesai">Selesai</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium cursor-pointer"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Infrastruktur & Jalan">Infrastruktur & Jalan</option>
            <option value="Saluran Air & Irigasi">Saluran Air & Irigasi</option>
            <option value="Pelayanan Administrasi">Pelayanan Administrasi</option>
            <option value="Bantuan Sosial & Kesejahteraan">Bantuan Sosial</option>
            <option value="Penerangan & Keamanan Lingkungan">Penerangan & Keamanan</option>
            <option value="Kebersihan & Pengelolaan Sampah">Kebersihan & Sampah</option>
          </select>

          {(selectedDusun !== 'Semua' || selectedStatus !== 'Semua' || selectedCategory !== 'Semua' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDusun('Semua');
                setSelectedStatus('Semua');
                setSelectedCategory('Semua');
                setSearchQuery('');
              }}
              className="text-blue-700 hover:text-blue-900 font-semibold px-2 py-1 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Complaints Grid Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Menampilkan <strong>{filtered.length}</strong> aduan masyarakat Desa Gunosari</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Pembaruan Real-Time
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800">Tidak ada aduan yang cocok</h4>
            <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau reset filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectComplaintToTrack(item.ticketNumber)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-700/60 p-5 shadow-xs hover:shadow-md transition duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar of card */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {item.ticketNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {item.category}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'Dalam Penanganan'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : item.status === 'Diverifikasi'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Location & Dusun */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-800 flex-shrink-0" />
                    <span className="truncate">
                      <strong>{item.dusun}</strong> &bull; {item.locationDetail}
                    </span>
                  </div>

                  {/* Alokasi Anggaran Banner jika ada */}
                  {item.allocatedBudget && (
                    <div className="mt-3 p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                        <Coins className="w-4 h-4 text-blue-800" />
                        <span>Anggaran Realisasi:</span>
                      </div>
                      <span className="font-bold text-blue-950">{formatRupiah(item.allocatedBudget)}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.comments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        {item.comments.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onFocusOnMap && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusOnMap(item.ticketNumber);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-900 bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded-md transition cursor-pointer"
                        title="Buka titik aduan di Peta Desa Gunosari"
                      >
                        <MapPin className="w-3 h-3 text-blue-700" />
                        <span>Peta</span>
                      </button>
                    )}
                    <span className="inline-flex items-center gap-1 text-blue-900 font-semibold group-hover:translate-x-0.5 transition">
                      <span>Detail</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
