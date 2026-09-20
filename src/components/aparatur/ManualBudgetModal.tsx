import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  Check, 
  Plus, 
  Layers, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { BudgetAccount, BudgetType } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface ManualBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts: BudgetAccount[];
  accountToEdit?: BudgetAccount | null;
  onSaveAccount: (account: BudgetAccount) => void;
  onDeleteAccount?: (code: string) => void;
}

export const ManualBudgetModal: React.FC<ManualBudgetModalProps> = ({
  isOpen,
  onClose,
  existingAccounts,
  accountToEdit,
  onSaveAccount,
  onDeleteAccount,
}) => {
  if (!isOpen) return null;

  const isEditing = !!accountToEdit;

  const [type, setType] = useState<BudgetType>(accountToEdit?.type || 'Belanja');
  const [code, setCode] = useState(accountToEdit?.code || '');
  const [name, setName] = useState(accountToEdit?.name || '');
  const [bidang, setBidang] = useState(accountToEdit?.bidang || 'Pembangunan');
  const [subBidang, setSubBidang] = useState(accountToEdit?.subBidang || '');
  const [anggaranInput, setAnggaranInput] = useState<string>(
    accountToEdit ? accountToEdit.anggaran.toString() : ''
  );
  const [realisasiInput, setRealisasiInput] = useState<string>(
    accountToEdit ? accountToEdit.realisasi.toString() : '0'
  );

  useEffect(() => {
    if (accountToEdit) {
      setType(accountToEdit.type);
      setCode(accountToEdit.code);
      setName(accountToEdit.name);
      setBidang(accountToEdit.bidang || 'Pembangunan');
      setSubBidang(accountToEdit.subBidang || '');
      setAnggaranInput(accountToEdit.anggaran.toString());
      setRealisasiInput(accountToEdit.realisasi.toString());
    } else {
      // Suggest next available code
      const nextNum = existingAccounts.filter((a) => a.type === type).length + 1;
      const prefix = type === 'Pendapatan' ? '1.' : type === 'Belanja' ? '2.' : '3.';
      setCode(`${prefix}${nextNum}`);
    }
  }, [accountToEdit, type]);

  const parsedAnggaran = parseFloat(anggaranInput) || 0;
  const parsedRealisasi = parseFloat(realisasiInput) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert('Kode rekening anggaran wajib diisi.');
      return;
    }
    if (!name.trim()) {
      alert('Uraian / nama akun anggaran wajib diisi.');
      return;
    }
    if (parsedAnggaran <= 0) {
      alert('Pagu anggaran harus lebih dari 0.');
      return;
    }

    const savedAccount: BudgetAccount = {
      code: code.trim(),
      name: name.trim(),
      type,
      bidang: type === 'Belanja' ? bidang : undefined,
      subBidang: subBidang.trim() || undefined,
      anggaran: parsedAnggaran,
      realisasi: parsedRealisasi,
    };

    onSaveAccount(savedAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {isEditing ? 'Ubah Nilai Anggaran Manual' : 'Masukkan Anggaran Manual (APBDes)'}
              </h3>
              <p className="text-xs text-slate-500">
                Input pagu anggaran dan realisasi kas APBDes Desa Gunosari TA 2025
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick preset notice */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span>
              Anggaran yang Anda masukkan secara manual akan langsung mengkalkulasi ulang LRA dan BKU secara real-time.
            </span>
          </div>

          {/* Jenis Anggaran */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Jenis Struktur Anggaran APBDes *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Pendapatan', 'Belanja', 'Pembiayaan'] as BudgetType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    setType(t);
                    if (!isEditing) {
                      const prefix = t === 'Pendapatan' ? '1.' : t === 'Belanja' ? '2.' : '3.';
                      setCode(`${prefix}${existingAccounts.filter((a) => a.type === t).length + 1}`);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center border ${
                    type === t
                      ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* If Belanja -> Pilih 5 Bidang Standar Permendagri */}
          {type === 'Belanja' && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Bidang Belanja (Permendagri No. 20/2018)
              </label>
              <select
                value={bidang}
                onChange={(e) => setBidang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Pemerintahan">Bidang 1: Penyelenggaraan Pemerintahan Desa</option>
                <option value="Pembangunan">Bidang 2: Pelaksanaan Pembangunan Desa (Fisik/Jalan/Irigasi)</option>
                <option value="Kemasyarakatan">Bidang 3: Pembinaan Kemasyarakatan</option>
                <option value="Pemberdayaan">Bidang 4: Pemberdayaan Masyarakat (UMKM/Tani)</option>
                <option value="Bencana & Darurat">Bidang 5: Penanggulangan Bencana, Darurat & Mendesak</option>
              </select>
            </div>
          )}

          {/* Kode Rekening & Sub Bidang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Kode Rekening *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: 2.2.1 atau 1.1"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Sub-Bidang / Klasifikasi
              </label>
              <input
                type="text"
                value={subBidang}
                onChange={(e) => setSubBidang(e.target.value)}
                placeholder="Contoh: Infrastruktur Jalan & Jembatan"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Uraian Akun Anggaran */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-800">
              Uraian Akun Anggaran *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pengaspalan Jalan Dusun Sidodadi / Alokasi Dana Desa"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Pagu Anggaran (Rp) & Realisasi Saat Ini */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Target Pagu Anggaran (Rp) *
                </label>
                <span className="text-xs font-bold text-blue-900 font-mono">
                  {formatRupiah(parsedAnggaran)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  required
                  value={anggaranInput}
                  onChange={(e) => setAnggaranInput(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Realisasi Kas Masuk / Keluar (Rp)
                </label>
                <span className="text-xs font-bold text-amber-800 font-mono">
                  {formatRupiah(parsedRealisasi)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={realisasiInput}
                  onChange={(e) => setRealisasiInput(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Quick Sisa Anggaran Calculation */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Sisa Pagu Tersedia:</span>
              <span className={`font-mono font-bold ${parsedAnggaran - parsedRealisasi >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {formatRupiah(parsedAnggaran - parsedRealisasi)}
                {parsedAnggaran > 0 && ` (${(((parsedAnggaran - parsedRealisasi) / parsedAnggaran) * 100).toFixed(1)}%)`}
              </span>
            </div>
          </div>

          {/* Quick preset buttons for common amounts */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-slate-400">Preset:</span>
            {[10000000, 25000000, 50000000, 100000000, 250000000].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setAnggaranInput(amt.toString())}
                className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
              >
                {amt >= 1000000 ? `${amt / 1000000} Juta` : amt}
              </button>
            ))}
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {isEditing && onDeleteAccount ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Hapus akun anggaran ${code} - ${name}?`)) {
                    onDeleteAccount(code);
                    onClose();
                  }
                }}
                className="text-red-600 hover:text-red-700 text-xs font-semibold cursor-pointer"
              >
                Hapus Akun
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">
                Tersimpan di APBDes 2025
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Perbarui Anggaran' : 'Simpan ke APBDes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
