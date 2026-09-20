import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, FileText, Building2 } from 'lucide-react';
import { Complaint, BudgetAccount, TaxDistributionSummary } from '../../types';
import { VILLAGE_INFO } from '../../data/mockData';
import { formatRupiah, formatDate } from '../../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: Complaint[];
  budgetAccounts: BudgetAccount[];
  taxSummary: TaxDistributionSummary;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  complaints,
  budgetAccounts,
  taxSummary,
}) => {
  const [reportType, setReportType] = useState<'lra' | 'pajak' | 'aduan'>('lra');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let summaryText = `LAPORAN RESMI PEMERINTAH DESA GUNOSARI\n`;
    summaryText += `Kecamatan ${VILLAGE_INFO.kecamatan}, Kabupaten ${VILLAGE_INFO.kabupaten}\n`;
    summaryText += `Kode Desa: ${VILLAGE_INFO.kodeDesa}\n\n`;

    if (reportType === 'lra') {
      summaryText += `LAPORAN REALISASI ANGGARAN PENDAPATAN & BELANJA DESA (APBDes) TA 2025\n`;
      budgetAccounts.forEach((acc) => {
        summaryText += `${acc.code} ${acc.name} - Anggaran: ${formatRupiah(acc.anggaran)} | Realisasi: ${formatRupiah(acc.realisasi)}\n`;
      });
    } else if (reportType === 'pajak') {
      summaryText += `SK PENETAPAN PEMBAGIAN BAGI HASIL PAJAK DAERAH & PBB PER DUSUN\n`;
      summaryText += `Total BHPRD: ${formatRupiah(taxSummary.totalPenerimaanBHPRD)}\n`;
      taxSummary.dusunList.forEach((d) => {
        summaryText += `- ${d.dusun}: Realisasi PBB ${formatRupiah(d.realisasiPBB)} (${d.persentaseRealisasi}%) -> BHPRD Diterima: ${formatRupiah(d.totalBHPRDDiterima)}, Insentif Kolektor: ${formatRupiah(d.insentifKolektor)}\n`;
      });
    } else {
      summaryText += `REKAPITULASI PENANGANAN ADUAN WARGA & TRANSPARANSI ANGGARAN\n`;
      complaints.forEach((c) => {
        summaryText += `[${c.ticketNumber}] ${c.title} (${c.dusun}) - Status: ${c.status} | Anggaran: ${c.allocatedBudget ? formatRupiah(c.allocatedBudget) : '-'}\n`;
      });
    }

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-300" />
            <span className="font-bold text-sm">Pratinjau Cetak Dokumen Resmi Desa Gunosari (Kab. Bondowoso)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setReportType('lra')}
                className={`px-3 py-1 rounded cursor-pointer ${
                  reportType === 'lra' ? 'bg-blue-800 text-white' : 'text-slate-300'
                }`}
              >
                1. LRA APBDes
              </button>
              <button
                onClick={() => setReportType('pajak')}
                className={`px-3 py-1 rounded cursor-pointer ${
                  reportType === 'pajak' ? 'bg-blue-800 text-white' : 'text-slate-300'
                }`}
              >
                2. SK Pembagian Pajak
              </button>
              <button
                onClick={() => setReportType('aduan')}
                className={`px-3 py-1 rounded cursor-pointer ${
                  reportType === 'aduan' ? 'bg-blue-800 text-white' : 'text-slate-300'
                }`}
              >
                3. Rekap Aduan Warga
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              {copied ? 'Tersalin!' : 'Salin Teks'}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-12 overflow-y-auto font-serif text-slate-900 space-y-6 print:p-0 print:space-y-4">
          {/* Official Village Letterhead (KOP SURAT) */}
          <div className="border-b-4 border-double border-slate-900 pb-4 text-center relative">
            <img
              src={VILLAGE_INFO.logoUrl}
              alt="Logo Desa Gunosari"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-800 mx-auto mb-2 shadow-xs bg-white"
            />
            <h2 className="text-sm font-bold tracking-widest uppercase">
              PEMERINTAH KABUPATEN {VILLAGE_INFO.kabupaten.toUpperCase()}
            </h2>
            <h1 className="text-lg sm:text-xl font-black tracking-wider uppercase mt-0.5">
              KECAMATAN {VILLAGE_INFO.kecamatan.toUpperCase()} &bull; DESA GUNOSARI
            </h1>
            <p className="text-xs text-slate-600 font-sans mt-1">
              {VILLAGE_INFO.alamatKantor} &bull; Surel: {VILLAGE_INFO.emailResmi} &bull; Kode Pos: 68262
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold uppercase underline tracking-wide">
              {reportType === 'lra' && 'LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA DESA (APBDes)'}
              {reportType === 'pajak' && 'KEPUTUSAN KEPALA DESA TENTANG PEMBAGIAN BAGI HASIL PAJAK DAERAH & RETRIBUSI PER DUSUN'}
              {reportType === 'aduan' && 'REKAPITULASI PELAYANAN PENGADUAN WARGA & REALISASI PEMBIAYAAN FISIK'}
            </h3>
            <p className="text-xs font-sans text-slate-600">
              Tahun Anggaran 2025 &bull; Dicetak pada tanggal: {formatDate(new Date().toISOString())}
            </p>
          </div>

          {/* Report 1: LRA */}
          {reportType === 'lra' && (
            <div className="font-sans text-xs space-y-4">
              <table className="w-full border-collapse border border-slate-400">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="border border-slate-400 px-3 py-2 text-left w-24">Kode</th>
                    <th className="border border-slate-400 px-3 py-2 text-left">Uraian Akun</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Anggaran (Rp)</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Realisasi (Rp)</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">% Capaian</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetAccounts.map((acc) => (
                    <tr key={acc.code}>
                      <td className="border border-slate-300 px-3 py-1.5 font-mono">{acc.code}</td>
                      <td className="border border-slate-300 px-3 py-1.5">{acc.name}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">{formatRupiah(acc.anggaran)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">{formatRupiah(acc.realisasi)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">
                        {acc.anggaran > 0 ? ((acc.realisasi / acc.anggaran) * 100).toFixed(1) : '-'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Report 2: Pajak */}
          {reportType === 'pajak' && (
            <div className="font-sans text-xs space-y-4">
              <p className="leading-relaxed">
                Berdasarkan penerimaan Bagi Hasil Pajak & Retribusi Daerah (BHPRD) Kabupaten Bondowoso untuk Desa Gunosari sebesar <strong>{formatRupiah(taxSummary.totalPenerimaanBHPRD)}</strong>, dengan formula Alokasi Dasar <strong>{taxSummary.proporsiAlokasiDasar}%</strong> dan Alokasi Proporsional Kinerja PBB <strong>{taxSummary.proporsiAlokasiKinerja}%</strong>, ditetapkan penyaluran sebagai berikut:
              </p>

              <table className="w-full border-collapse border border-slate-400">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="border border-slate-400 px-3 py-2 text-left">Nama Dusun</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Target PBB</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Realisasi PBB</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Alokasi Dasar</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Alokasi Kinerja</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Total Diterima</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Insentif Kolektor</th>
                  </tr>
                </thead>
                <tbody>
                  {taxSummary.dusunList.map((d) => (
                    <tr key={d.dusun}>
                      <td className="border border-slate-300 px-3 py-1.5 font-semibold">{d.dusun}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">{formatRupiah(d.targetPBB)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">{formatRupiah(d.realisasiPBB)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">{formatRupiah(d.alokasiDasarBHPRD)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">{formatRupiah(d.alokasiProporsionalBHPRD)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono font-bold">{formatRupiah(d.totalBHPRDDiterima)}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono font-bold text-slate-800">{formatRupiah(d.insentifKolektor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Report 3: Aduan */}
          {reportType === 'aduan' && (
            <div className="font-sans text-xs space-y-4">
              <table className="w-full border-collapse border border-slate-400">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="border border-slate-400 px-3 py-2 text-left">No. Tiket</th>
                    <th className="border border-slate-400 px-3 py-2 text-left">Uraian Aduan & Dusun</th>
                    <th className="border border-slate-400 px-3 py-2 text-left">Pelapor</th>
                    <th className="border border-slate-400 px-3 py-2 text-left">Status</th>
                    <th className="border border-slate-400 px-3 py-2 text-right">Alokasi Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td className="border border-slate-300 px-3 py-1.5 font-mono">{c.ticketNumber}</td>
                      <td className="border border-slate-300 px-3 py-1.5">
                        <div className="font-semibold">{c.title}</div>
                        <span className="text-[10px] text-slate-500">{c.dusun} - {c.locationDetail}</span>
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5">{c.reporterName}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-semibold">{c.status}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-mono">
                        {c.allocatedBudget ? formatRupiah(c.allocatedBudget) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Signatures & Village Stamp Watermark */}
          <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs font-sans">
            <div className="text-center space-y-16">
              <p>Mengetahui / Menyetujui,<br /><strong>Kaur Keuangan Desa Gunosari</strong></p>
              <div>
                <p className="font-bold underline uppercase">{VILLAGE_INFO.kaurKeuangan}</p>
                <p className="text-[11px] text-slate-600">NIPD. 19880512 201704 2 003</p>
              </div>
            </div>

            <div className="text-center space-y-16">
              <p>Gunosari, {formatDate(new Date().toISOString())}<br /><strong>Kepala Desa Gunosari</strong></p>
              <div>
                <p className="font-bold underline uppercase">{VILLAGE_INFO.kepalaDesa}</p>
                <p className="text-[11px] text-slate-600">NIPD. 19740315 201203 1 001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
