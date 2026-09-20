import React, { useState } from 'react';
import { X, PlusCircle, Coins } from 'lucide-react';
import { FinancialTransaction, BudgetAccount, Complaint } from '../../types';
import { generateBkuNumber } from '../../utils/formatters';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetAccounts: BudgetAccount[];
  complaints: Complaint[];
  existingTransactionCount: number;
  onAddTransaction: (tx: FinancialTransaction) => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  budgetAccounts,
  complaints,
  existingTransactionCount,
  onAddTransaction,
}) => {
  const [type, setType] = useState<'Penerimaan' | 'Pengeluaran'>('Pengeluaran');
  const [uraian, setUraian] = useState('');
  const [accountCode, setAccountCode] = useState(budgetAccounts[0]?.code || '2.2');
  const [jumlah, setJumlah] = useState('');
  const [sumberDana, setSumberDana] = useState<any>('Dana Desa (DD)');
  const [terkaitTicket, setTerkaitTicket] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('Kaur Keuangan (Indah Kusuma, S.Ak.)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(jumlah);
    if (!uraian.trim() || isNaN(amount) || amount <= 0) return;

    const matchedAccount = budgetAccounts.find((a) => a.code === accountCode);
    const newTx: FinancialTransaction = {
      id: 'tx-' + Date.now(),
      noBukti: generateBkuNumber(existingTransactionCount),
      tanggal: new Date().toISOString().split('T')[0],
      uraian: uraian.trim(),
      accountCode,
      accountName: matchedAccount ? matchedAccount.name : 'Operasional Belanja APBDes',
      type,
      jumlah: amount,
      sumberDana,
      terkaitAduanTicket: terkaitTicket.trim() || undefined,
      penanggungJawab: penanggungJawab.trim(),
    };

    onAddTransaction(newTx);
    onClose();
  };

  const filteredAccounts = budgetAccounts.filter((a) => 
    type === 'Penerimaan' ? a.type === 'Pendapatan' : a.type === 'Belanja'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-300" />
            <div>
              <h3 className="text-base font-bold">Catat Transaksi Buku Kas Umum (BKU)</h3>
              <p className="text-xs text-blue-200">Sistem Keuangan Otomatis Desa Gunosari</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Tipe Transaksi */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Jenis Mutasi Kas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('Pengeluaran');
                  setAccountCode('2.2');
                }}
                className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                  type === 'Pengeluaran'
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Pengeluaran Kas (Belanja)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('Penerimaan');
                  setAccountCode('1.2.1');
                }}
                className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                  type === 'Penerimaan'
                    ? 'bg-blue-100 border-blue-400 text-blue-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Penerimaan Kas (Pendapatan)
              </button>
            </div>
          </div>

          {/* Uraian */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Uraian Transaksi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Contoh: Belanja Pembelian Material Semen & Pasir Gorong-gorong"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-700 text-xs"
            />
          </div>

          {/* Akun Rekening APBDes & Sumber Dana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Rekening Akun APBDes
              </label>
              <select
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                {filteredAccounts.map((acc) => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sumber Dana
              </label>
              <select
                value={sumberDana}
                onChange={(e) => setSumberDana(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="Dana Desa (DD)">Dana Desa (DD)</option>
                <option value="Alokasi Dana Desa (ADD)">Alokasi Dana Desa (ADD)</option>
                <option value="Bagi Hasil Pajak & Retribusi (BHPRD)">Bagi Hasil Pajak & Retribusi (BHPRD)</option>
                <option value="Pendapatan Asli Desa (PADes)">Pendapatan Asli Desa (PADes)</option>
                <option value="Bantuan Keuangan">Bantuan Keuangan</option>
              </select>
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nominal Jumlah (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Contoh: 7500000"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Hubungkan ke Tiket Aduan Warga (Opsional) */}
          {type === 'Pengeluaran' && (
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hubungkan ke Tiket Aduan Warga (Opsional)
              </label>
              <select
                value={terkaitTicket}
                onChange={(e) => setTerkaitTicket(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
              >
                <option value="">-- Tanpa Tautan Aduan (Belanja Reguler) --</option>
                {complaints.map((c) => (
                  <option key={c.id} value={c.ticketNumber}>
                    {c.ticketNumber} - {c.title.substring(0, 40)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Penanggung Jawab */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Penanggung Jawab Transaksi
            </label>
            <input
              type="text"
              value={penanggungJawab}
              onChange={(e) => setPenanggungJawab(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan ke BKU & Perbarui Saldo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
