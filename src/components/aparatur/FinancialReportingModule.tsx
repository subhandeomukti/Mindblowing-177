import React, { useState } from 'react';
import { 
  BarChart3, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Search,
  Printer,
  TrendingUp,
  Sparkles,
  Edit3,
  PlusCircle
} from 'lucide-react';
import { BudgetAccount, FinancialTransaction, Complaint } from '../../types';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { ManualBudgetModal } from './ManualBudgetModal';

interface FinancialReportingModuleProps {
  budgetAccounts: BudgetAccount[];
  transactions: FinancialTransaction[];
  complaints: Complaint[];
  onOpenNewTransactionModal: () => void;
  onOpenPrintModal: () => void;
  onSaveBudgetAccount: (account: BudgetAccount) => void;
  onDeleteBudgetAccount?: (code: string) => void;
}

export const FinancialReportingModule: React.FC<FinancialReportingModuleProps> = ({
  budgetAccounts,
  transactions,
  complaints,
  onOpenNewTransactionModal,
  onOpenPrintModal,
  onSaveBudgetAccount,
  onDeleteBudgetAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'lra' | 'bku' | 'grafik'>('lra');
  const [searchBku, setSearchBku] = useState('');
  const [isManualBudgetModalOpen, setIsManualBudgetModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<BudgetAccount | null>(null);

  // Hitung agregat APBDes
  const pendapatanAccounts = budgetAccounts.filter((a) => a.type === 'Pendapatan');
  const belanjaAccounts = budgetAccounts.filter((a) => a.type === 'Belanja');
  const pembiayaanAccounts = budgetAccounts.filter((a) => a.type === 'Pembiayaan');

  const totalPendapatanAnggaran = pendapatanAccounts.reduce((acc, a) => acc + a.anggaran, 0);
  const totalPendapatanRealisasi = pendapatanAccounts.reduce((acc, a) => acc + a.realisasi, 0);

  const totalBelanjaAnggaran = belanjaAccounts.reduce((acc, a) => acc + a.anggaran, 0);
  const totalBelanjaRealisasi = belanjaAccounts.reduce((acc, a) => acc + a.realisasi, 0);

  const surplusDefisitAnggaran = totalPendapatanAnggaran - totalBelanjaAnggaran;
  const surplusDefisitRealisasi = totalPendapatanRealisasi - totalBelanjaRealisasi;

  // Hitung saldo kas berjalan di BKU
  let runningBalance = 0;
  const chronologicalTransactions = [...transactions].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
  );

  const transactionsWithBalance = chronologicalTransactions.map((tx) => {
    if (tx.type === 'Penerimaan') {
      runningBalance += tx.jumlah;
    } else {
      runningBalance -= tx.jumlah;
    }
    return { ...tx, saldo: runningBalance };
  });

  const filteredTransactions = transactionsWithBalance.filter(
    (tx) =>
      tx.uraian.toLowerCase().includes(searchBku.toLowerCase()) ||
      tx.noBukti.toLowerCase().includes(searchBku.toLowerCase()) ||
      tx.accountName.toLowerCase().includes(searchBku.toLowerCase()) ||
      (tx.terkaitAduanTicket && tx.terkaitAduanTicket.toLowerCase().includes(searchBku.toLowerCase()))
  );

  // Aduan yang terintegrasi secara otomatis ke pengeluaran APBDes
  const integratedComplaintsCount = transactions.filter((tx) => tx.terkaitAduanTicket).length;
  const totalDanaAduan = transactions
    .filter((tx) => tx.terkaitAduanTicket)
    .reduce((sum, tx) => sum + tx.jumlah, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Aparatur Keuangan */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-950 text-xs font-bold">
              Kaur Keuangan / Bendahara Desa
            </span>
            <span className="text-xs text-slate-500 font-medium">Siskeudes & APBDes Terpadu Desa Gunosari</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Sistem Pelaporan Keuangan Desa Gunosari (Otomatis & Real-Time)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan Realisasi Anggaran (LRA), Buku Kas Umum (BKU), dan integrasi otomatis belanja pemeliharaan dari aduan warga (Kec. Tlogosari, Kab. Bondowoso).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setAccountToEdit(null);
              setIsManualBudgetModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition cursor-pointer shadow-xs"
            title="Tambah atau ubah nilai pagu anggaran APBDes secara manual"
          >
            <Coins className="w-4 h-4 text-amber-700" />
            <span>+ Masukkan Anggaran Manual</span>
          </button>
          <button
            onClick={onOpenNewTransactionModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-700" />
            <span>+ Catat Transaksi BKU</span>
          </button>
          <button
            onClick={onOpenPrintModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-200" />
            <span>Cetak LRA Resmi</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Dashboard Keuangan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Pendapatan Desa</span>
          <span className="text-xl font-bold text-blue-950 mt-1 block">
            {formatRupiah(totalPendapatanRealisasi)}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Pagu: {formatRupiah(totalPendapatanAnggaran)}</span>
            <span className="font-bold text-blue-800">
              {((totalPendapatanRealisasi / totalPendapatanAnggaran) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Belanja Desa</span>
          <span className="text-xl font-bold text-amber-900 mt-1 block">
            {formatRupiah(totalBelanjaRealisasi)}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Pagu: {formatRupiah(totalBelanjaAnggaran)}</span>
            <span className="font-bold text-amber-700">
              {((totalBelanjaRealisasi / totalBelanjaAnggaran) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Saldo Kas Berjalan (BKU)</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {formatRupiah(runningBalance)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Kas Rekening Kas Desa (RKD)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Belanja Terkait Aduan Warga</span>
          <span className="text-xl font-bold text-blue-900 mt-1 block">
            {formatRupiah(totalDanaAduan)}
          </span>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 block">
            {integratedComplaintsCount} Kegiatan Fisik Tersinkron
          </span>
        </div>
      </div>

      {/* Notice Banner: Otomasi Terintegrasi Aduan -> Keuangan */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-950">
        <Sparkles className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-blue-950 block">
            Integrasi Otomatis Antar-Sistem Berhasil Aktif:
          </span>
          <p className="leading-relaxed text-slate-700">
            Setiap aduan masyarakat yang ditindaklanjuti dengan pembiayaan (contoh: perbaikan jalan rusak atau saluran irigasi) secara otomatis tercatat ke dalam <strong>Buku Kas Umum (BKU)</strong> dan langsung mengurangi saldo sisa pada <strong>Bidang Pelaksanaan Pembangunan APBDes</strong> tanpa perlu input ganda manual.
          </p>
        </div>
      </div>

      {/* Tabs Selector: LRA vs BKU vs Grafik */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('lra')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'lra'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. Laporan Realisasi Anggaran (LRA) APBDes
        </button>
        <button
          onClick={() => setActiveTab('bku')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'bku'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>2. Buku Kas Umum (BKU) Digital</span>
          <span className="px-1.5 py-0.2 bg-blue-700 text-white rounded text-[10px]">
            {transactions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('grafik')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'grafik'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          3. Grafik & Komposisi Anggaran
        </button>
      </div>

      {/* TAB 1: Laporan Realisasi Anggaran (LRA) */}
      {activeTab === 'lra' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Laporan Realisasi Pelaksanaan APBDes Tahun Anggaran 2025
              </h3>
              <p className="text-xs text-slate-500">
                Format Standar Permendagri No. 20 Tahun 2018 tentang Pengelolaan Keuangan Desa.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-28">Kode Rekening</th>
                  <th className="px-4 py-3">Uraian Akun APBDes</th>
                  <th className="px-4 py-3 text-right">Anggaran (Rp)</th>
                  <th className="px-4 py-3 text-right">Realisasi (Rp)</th>
                  <th className="px-4 py-3 text-right">% Capaian</th>
                  <th className="px-4 py-3 text-right">Sisa Anggaran (Rp)</th>
                  <th className="px-4 py-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. PENDAPATAN */}
                <tr className="bg-blue-50/70 font-bold text-blue-950">
                  <td className="px-4 py-2.5 font-mono">1.</td>
                  <td className="px-4 py-2.5">PENDAPATAN DESA</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatRupiah(totalPendapatanAnggaran)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatRupiah(totalPendapatanRealisasi)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {((totalPendapatanRealisasi / totalPendapatanAnggaran) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {formatRupiah(totalPendapatanAnggaran - totalPendapatanRealisasi)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountToEdit(null);
                        setIsManualBudgetModalOpen(true);
                      }}
                      className="text-blue-700 hover:text-blue-900 font-bold text-[11px] hover:underline cursor-pointer"
                      title="Tambah Akun Pendapatan Baru"
                    >
                      + Akun
                    </button>
                  </td>
                </tr>
                {pendapatanAccounts.map((acc) => {
                  const sisa = acc.anggaran - acc.realisasi;
                  const pct = acc.anggaran > 0 ? (acc.realisasi / acc.anggaran) * 100 : 0;
                  return (
                    <tr key={acc.code} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-slate-500 pl-6">{acc.code}</td>
                      <td className="px-4 py-2 text-slate-800">{acc.name}</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600">{formatRupiah(acc.anggaran)}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-blue-900">
                        {formatRupiah(acc.realisasi)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{pct.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500">{formatRupiah(sisa)}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountToEdit(acc);
                            setIsManualBudgetModalOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 transition text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                          title="Ubah Anggaran / Pagu Secara Manual"
                        >
                          <Edit3 className="w-3 h-3 text-amber-700" />
                          <span>Ubah</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* 2. BELANJA */}
                <tr className="bg-amber-50/60 font-bold text-amber-950">
                  <td className="px-4 py-2.5 font-mono">2.</td>
                  <td className="px-4 py-2.5">BELANJA DESA</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatRupiah(totalBelanjaAnggaran)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatRupiah(totalBelanjaRealisasi)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {((totalBelanjaRealisasi / totalBelanjaAnggaran) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {formatRupiah(totalBelanjaAnggaran - totalBelanjaRealisasi)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountToEdit(null);
                        setIsManualBudgetModalOpen(true);
                      }}
                      className="text-amber-800 hover:text-amber-950 font-bold text-[11px] hover:underline cursor-pointer"
                      title="Tambah Akun Belanja Baru"
                    >
                      + Akun
                    </button>
                  </td>
                </tr>
                {belanjaAccounts.map((acc) => {
                  const sisa = acc.anggaran - acc.realisasi;
                  const pct = acc.anggaran > 0 ? (acc.realisasi / acc.anggaran) * 100 : 0;
                  const isPembangunan = acc.code === '2.2';

                  return (
                    <tr key={acc.code} className={`hover:bg-slate-50 ${isPembangunan ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-4 py-2 font-mono text-slate-500 pl-6">{acc.code}</td>
                      <td className="px-4 py-2 text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{acc.name}</span>
                          {isPembangunan && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-900 font-semibold rounded">
                              Terintegrasi Aduan Warga
                            </span>
                          )}
                        </div>
                        {acc.subBidang && (
                          <span className="text-[11px] text-slate-400 block">{acc.subBidang}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600">{formatRupiah(acc.anggaran)}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-amber-900">
                        {formatRupiah(acc.realisasi)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{pct.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-500">{formatRupiah(sisa)}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountToEdit(acc);
                            setIsManualBudgetModalOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 transition text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                          title="Ubah Anggaran / Pagu Secara Manual"
                        >
                          <Edit3 className="w-3 h-3 text-amber-700" />
                          <span>Ubah</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* SURPLUS / DEFISIT */}
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">SURPLUS / (DEFISIT) ANGGARAN</td>
                  <td className="px-4 py-3 text-right font-mono">{formatRupiah(surplusDefisitAnggaran)}</td>
                  <td className="px-4 py-3 text-right font-mono text-blue-900">
                    {formatRupiah(surplusDefisitRealisasi)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">-</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatRupiah(surplusDefisitAnggaran - surplusDefisitRealisasi)}
                  </td>
                  <td className="px-4 py-3 text-center">-</td>
                </tr>

                {/* 3. PEMBIAYAAN */}
                <tr className="bg-slate-100 font-bold text-slate-950">
                  <td className="px-4 py-2.5 font-mono">3.</td>
                  <td className="px-4 py-2.5">PEMBIAYAAN DESA</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {formatRupiah(pembiayaanAccounts.reduce((acc, a) => acc + a.anggaran, 0))}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {formatRupiah(pembiayaanAccounts.reduce((acc, a) => acc + a.realisasi, 0))}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">-</td>
                  <td className="px-4 py-2.5 text-right font-mono">-</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountToEdit(null);
                        setIsManualBudgetModalOpen(true);
                      }}
                      className="text-slate-800 hover:text-black font-bold text-[11px] hover:underline cursor-pointer"
                      title="Tambah Akun Pembiayaan Baru"
                    >
                      + Akun
                    </button>
                  </td>
                </tr>
                {pembiayaanAccounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-slate-500 pl-6">{acc.code}</td>
                    <td className="px-4 py-2 text-slate-800">{acc.name}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-600">{formatRupiah(acc.anggaran)}</td>
                    <td className="px-4 py-2 text-right font-mono text-blue-900 font-semibold">{formatRupiah(acc.realisasi)}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      {((acc.realisasi / acc.anggaran) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-500">
                      {formatRupiah(acc.anggaran - acc.realisasi)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountToEdit(acc);
                          setIsManualBudgetModalOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 transition text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer border border-slate-200"
                        title="Ubah Anggaran / Pagu Secara Manual"
                      >
                        <Edit3 className="w-3 h-3 text-amber-700" />
                        <span>Ubah</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Buku Kas Umum (BKU) Digital */}
      {activeTab === 'bku' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Buku Kas Umum (BKU) Penerimaan & Pengeluaran Kas Desa
              </h3>
              <p className="text-xs text-slate-500">
                Mutasi keuangan otomatis real-time yang diverifikasi oleh Kaur Keuangan Desa Gunosari.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchBku}
                  onChange={(e) => setSearchBku(e.target.value)}
                  placeholder="Cari transaksi / no tiket..."
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <button
                onClick={onOpenNewTransactionModal}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Transaksi</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No. Bukti / Tgl</th>
                  <th className="px-4 py-3">Uraian Transaksi</th>
                  <th className="px-4 py-3">Rekening & Sumber Dana</th>
                  <th className="px-4 py-3 text-right text-blue-950">Penerimaan (Rp)</th>
                  <th className="px-4 py-3 text-right text-amber-900">Pengeluaran (Rp)</th>
                  <th className="px-4 py-3 text-right text-slate-900">Saldo Kas (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-800">{tx.noBukti}</div>
                      <div className="text-[11px] text-slate-400">{formatDate(tx.tanggal)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{tx.uraian}</div>
                      {tx.terkaitAduanTicket && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-950 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-blue-700" />
                          <span>Terkait Tiket Aduan: {tx.terkaitAduanTicket}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 mt-0.5">PIC: {tx.penanggungJawab}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-500 block">{tx.accountCode}</span>
                      <span className="text-[11px] font-medium text-slate-700 block">{tx.sumberDana}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-950">
                      {tx.type === 'Penerimaan' ? formatRupiah(tx.jumlah) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-900">
                      {tx.type === 'Pengeluaran' ? formatRupiah(tx.jumlah) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900">
                      {formatRupiah(tx.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Grafik & Komposisi Anggaran */}
      {activeTab === 'grafik' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Perbandingan 5 Bidang Belanja APBDes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Alokasi & Realisasi Belanja per 5 Bidang APBDes
            </h3>
            <div className="space-y-4 pt-2">
              {belanjaAccounts.map((acc) => {
                const pct = acc.anggaran > 0 ? (acc.realisasi / acc.anggaran) * 100 : 0;
                return (
                  <div key={acc.code} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 line-clamp-1">{acc.name}</span>
                      <span className="font-mono font-bold text-slate-900">{pct.toFixed(1)}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-900 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Realisasi: {formatRupiah(acc.realisasi)}</span>
                      <span>Pagu: {formatRupiah(acc.anggaran)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Komposisi Sumber Pendapatan Desa */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Komposisi Realisasi Pendapatan Desa Gunosari
            </h3>
            <div className="space-y-3 pt-2">
              {pendapatanAccounts.map((acc) => {
                const shareOfTotal = totalPendapatanRealisasi > 0
                  ? (acc.realisasi / totalPendapatanRealisasi) * 100
                  : 0;

                return (
                  <div key={acc.code} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{acc.name}</span>
                      <span className="font-mono font-bold text-blue-950">{formatRupiah(acc.realisasi)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Porsi terhadap total pendapatan desa:</span>
                      <span className="font-bold text-slate-700">{shareOfTotal.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Input & Edit Anggaran Manual */}
      <ManualBudgetModal
        isOpen={isManualBudgetModalOpen}
        onClose={() => {
          setIsManualBudgetModalOpen(false);
          setAccountToEdit(null);
        }}
        existingAccounts={budgetAccounts}
        accountToEdit={accountToEdit}
        onSaveAccount={onSaveBudgetAccount}
        onDeleteAccount={onDeleteBudgetAccount}
      />
    </div>
  );
};
