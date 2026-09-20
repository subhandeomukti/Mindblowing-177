import React, { useState } from 'react';
import { 
  Calculator, 
  Coins, 
  Landmark, 
  CheckCircle2, 
  Download, 
  Percent, 
  Award,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { TaxDistributionSummary, DusunTaxData } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface TaxDistributionModuleProps {
  taxSummary: TaxDistributionSummary;
  onUpdateTaxSummary: (updated: TaxDistributionSummary) => void;
  onOpenPrintModal: () => void;
}

export const TaxDistributionModule: React.FC<TaxDistributionModuleProps> = ({
  taxSummary,
  onUpdateTaxSummary,
  onOpenPrintModal,
}) => {
  const [totalBHPRD, setTotalBHPRD] = useState<number>(taxSummary.totalPenerimaanBHPRD);
  const [proporsiDasar, setProporsiDasar] = useState<number>(taxSummary.proporsiAlokasiDasar); // default 60%
  const [insentifPct, setInsentifPct] = useState<number>(taxSummary.persentaseInsentifKolektor); // default 5%
  const [dusunData, setDusunData] = useState<DusunTaxData[]>(taxSummary.dusunList);
  const [savedNotice, setSavedNotice] = useState(false);

  // Recalculate allocations based on parameters
  const proporsiKinerja = 100 - proporsiDasar;
  const danaAlokasiDasarTotal = (totalBHPRD * proporsiDasar) / 100;
  const danaAlokasiKinerjaTotal = (totalBHPRD * proporsiKinerja) / 100;

  const totalRealisasiPBB = dusunData.reduce((acc, d) => acc + d.realisasiPBB, 0);
  const totalTargetPBB = dusunData.reduce((acc, d) => acc + d.targetPBB, 0);
  const totalPersenRealisasi = totalTargetPBB > 0 ? (totalRealisasiPBB / totalTargetPBB) * 100 : 0;

  // Function to compute updated dusun list
  const calculateAllocations = (
    currentDusunList: DusunTaxData[],
    currentBHPRD: number,
    dasarPct: number,
    kolektorPct: number
  ): DusunTaxData[] => {
    const numDusun = currentDusunList.length;
    const dasarTotal = (currentBHPRD * dasarPct) / 100;
    const kinerjaTotal = (currentBHPRD * (100 - dasarPct)) / 100;
    const dasarPerDusun = numDusun > 0 ? dasarTotal / numDusun : 0;

    const sumRealisasi = currentDusunList.reduce((acc, d) => acc + d.realisasiPBB, 0);

    return currentDusunList.map((d) => {
      const pctRealisasi = d.targetPBB > 0 ? (d.realisasiPBB / d.targetPBB) * 100 : 0;
      // Proporsional bobot realisasi PBB dusun terhadap total realisasi desa
      const proporsional = sumRealisasi > 0 ? (d.realisasiPBB / sumRealisasi) * kinerjaTotal : 0;
      const totalDiterima = dasarPerDusun + proporsional;
      const insentif = (d.realisasiPBB * kolektorPct) / 100;

      return {
        ...d,
        persentaseRealisasi: Number(pctRealisasi.toFixed(2)),
        alokasiDasarBHPRD: Math.round(dasarPerDusun),
        alokasiProporsionalBHPRD: Math.round(proporsional),
        totalBHPRDDiterima: Math.round(totalDiterima),
        insentifKolektor: Math.round(insentif),
      };
    });
  };

  const handleUpdateRealisasiPBB = (index: number, newRealisasi: number) => {
    const updatedList = [...dusunData];
    updatedList[index] = {
      ...updatedList[index],
      realisasiPBB: newRealisasi,
    };
    const recomputed = calculateAllocations(updatedList, totalBHPRD, proporsiDasar, insentifPct);
    setDusunData(recomputed);
  };

  const handleUpdateTargetPBB = (index: number, newTarget: number) => {
    const updatedList = [...dusunData];
    updatedList[index] = {
      ...updatedList[index],
      targetPBB: newTarget,
    };
    const recomputed = calculateAllocations(updatedList, totalBHPRD, proporsiDasar, insentifPct);
    setDusunData(recomputed);
  };

  const handleSaveSimulasi = () => {
    const recomputed = calculateAllocations(dusunData, totalBHPRD, proporsiDasar, insentifPct);
    const updatedSummary: TaxDistributionSummary = {
      ...taxSummary,
      totalPenerimaanBHPRD: totalBHPRD,
      proporsiAlokasiDasar: proporsiDasar,
      proporsiAlokasiKinerja: proporsiKinerja,
      persentaseInsentifKolektor: insentifPct,
      totalTargetPBBDesa: totalTargetPBB,
      totalRealisasiPBBDesa: totalRealisasiPBB,
      persentaseTotalRealisasi: Number(totalPersenRealisasi.toFixed(2)),
      dusunList: recomputed,
      statusPenyaluran: 'Ditetapkan Melalui Perkades',
    };
    onUpdateTaxSummary(updatedSummary);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Perangkat Desa */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-950 text-xs font-bold">
              Kaur Keuangan & Tata Pemerintahan
            </span>
            <span className="text-xs text-slate-500 font-medium">Bagi Hasil Pajak & Retribusi Daerah (BHPRD)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Sistem Pembagian Pajak Daerah Desa Gunosari TA 2025
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula otomatis pembagian bagi hasil pajak kabupaten (BHPRD) dan insentif pemungutan PBB-P2 untuk 4 Dusun di Desa Gunosari (Kec. Tlogosari, Kab. Bondowoso).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPrintModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>Cetak SK Pembagian Pajak</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan dan simulasi pembagian pajak dusun berhasil disimpan dan ditetapkan!</span>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Pagu Total BHPRD Kabupaten</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {formatRupiah(totalBHPRD)}
          </span>
          <span className="text-[11px] text-blue-700 font-medium mt-1 block">
            Tersedia untuk 4 Dusun
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Realisasi PBB-P2 Desa</span>
          <span className="text-xl font-bold text-blue-900 mt-1 block">
            {formatRupiah(totalRealisasiPBB)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Target: {formatRupiah(totalTargetPBB)} ({totalPersenRealisasi.toFixed(1)}%)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Formula Alokasi Dasar / Kinerja</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {proporsiDasar}% : {proporsiKinerja}%
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Pemerataan vs Bobot Capaian PBB
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Insentif Kolektor RT/Dusun</span>
          <span className="text-xl font-bold text-amber-900 mt-1 block">
            {formatRupiah((totalRealisasiPBB * insentifPct) / 100)}
          </span>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            {insentifPct}% dari Realisasi PBB
          </span>
        </div>
      </div>

      {/* Interactive Simulator Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kalkulator Simulasi Parameter Pembagian Pajak
              </h3>
              <p className="text-xs text-slate-500">
                Atur proporsi dasar pemerataan, porsi kinerja PBB, serta persentase insentif petugas pemungut.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveSimulasi}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan & Terapkan Pembagian</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pagu Dana BHPRD Desa Gunosari (Rp)
            </label>
            <input
              type="number"
              value={totalBHPRD}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setTotalBHPRD(val);
                setDusunData(calculateAllocations(dusunData, val, proporsiDasar, insentifPct));
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                Alokasi Dasar (Pemerataan 4 Dusun): {proporsiDasar}%
              </label>
              <span className="text-slate-400">Kinerja: {proporsiKinerja}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={80}
              step={5}
              value={proporsiDasar}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setProporsiDasar(val);
                setDusunData(calculateAllocations(dusunData, totalBHPRD, val, insentifPct));
              }}
              className="w-full accent-blue-800 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Alokasi Dasar: {formatRupiah(danaAlokasiDasarTotal)}</span>
              <span>Alokasi Kinerja: {formatRupiah(danaAlokasiKinerjaTotal)}</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Insentif Kolektor Pemungut Pajak (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={insentifPct}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setInsentifPct(val);
                  setDusunData(calculateAllocations(dusunData, totalBHPRD, proporsiDasar, val));
                }}
                className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-700"
              />
              <span className="text-slate-500">% dari perolehan PBB dusun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Detail Pembagian Pajak per Dusun */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rincian Pembagian BHPRD & Realisasi PBB-P2 per Dusun
            </h3>
            <p className="text-xs text-slate-500">
              Perhitungan transparan: Alokasi Dasar dibagi rata + Alokasi Kinerja proporsional realisasi PBB.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-900 rounded-full border border-blue-200">
            Status: {taxSummary.statusPenyaluran}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nama Dusun & Kasun</th>
                <th className="px-4 py-3">Wajib Pajak</th>
                <th className="px-4 py-3">Target PBB-P2</th>
                <th className="px-4 py-3">Realisasi PBB-P2</th>
                <th className="px-4 py-3">% Capaian</th>
                <th className="px-4 py-3">Alokasi Dasar ({proporsiDasar}%)</th>
                <th className="px-4 py-3">Alokasi Kinerja ({proporsiKinerja}%)</th>
                <th className="px-4 py-3 text-blue-900">Total BHPRD Diterima</th>
                <th className="px-4 py-3 text-amber-900">Insentif Kolektor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dusunData.map((dusun, idx) => (
                <tr key={dusun.dusun} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <div>{dusun.dusun}</div>
                    <span className="text-[11px] text-slate-500 font-normal">Kasun: {dusun.kepalaDusun}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">
                    {dusun.jumlahWajibPajak} WP
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <input
                      type="number"
                      value={dusun.targetPBB}
                      onChange={(e) => handleUpdateTargetPBB(idx, parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    <input
                      type="number"
                      value={dusun.realisasiPBB}
                      onChange={(e) => handleUpdateRealisasiPBB(idx, parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-xs font-bold text-blue-900"
                    />
                  </td>
                  <td className="px-4 py-3 font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded ${
                        dusun.persentaseRealisasi >= 95
                          ? 'bg-emerald-100 text-emerald-800'
                          : dusun.persentaseRealisasi >= 90
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {dusun.persentaseRealisasi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {formatRupiah(dusun.alokasiDasarBHPRD)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {formatRupiah(dusun.alokasiProporsionalBHPRD)}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-900 text-sm">
                    {formatRupiah(dusun.totalBHPRDDiterima)}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-amber-900">
                    {formatRupiah(dusun.insentifKolektor)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total Row */}
            <tfoot className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300">
              <tr>
                <td className="px-4 py-3">TOTAL KESELURUHAN</td>
                <td className="px-4 py-3 font-mono">
                  {dusunData.reduce((acc, d) => acc + d.jumlahWajibPajak, 0)} WP
                </td>
                <td className="px-4 py-3 font-mono">{formatRupiah(totalTargetPBB)}</td>
                <td className="px-4 py-3 font-mono text-blue-900">{formatRupiah(totalRealisasiPBB)}</td>
                <td className="px-4 py-3 font-mono">{totalPersenRealisasi.toFixed(1)}%</td>
                <td className="px-4 py-3 font-mono">
                  {formatRupiah(dusunData.reduce((acc, d) => acc + d.alokasiDasarBHPRD, 0))}
                </td>
                <td className="px-4 py-3 font-mono">
                  {formatRupiah(dusunData.reduce((acc, d) => acc + d.alokasiProporsionalBHPRD, 0))}
                </td>
                <td className="px-4 py-3 font-mono text-blue-900 text-sm">
                  {formatRupiah(dusunData.reduce((acc, d) => acc + d.totalBHPRDDiterima, 0))}
                </td>
                <td className="px-4 py-3 font-mono text-amber-900">
                  {formatRupiah(dusunData.reduce((acc, d) => acc + d.insentifKolektor, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
