export type DusunName = 
  | 'Dusun Krajan'
  | 'Dusun Sumber Ketangi'
  | 'Dusun Gunung Sari Kidul'
  | 'Dusun Sidodadi';

export type ComplaintCategory =
  | 'Infrastruktur & Jalan'
  | 'Saluran Air & Irigasi'
  | 'Pelayanan Administrasi'
  | 'Bantuan Sosial & Kesejahteraan'
  | 'Penerangan & Keamanan Lingkungan'
  | 'Kebersihan & Pengelolaan Sampah'
  | 'Lainnya';

export type ComplaintStatus =
  | 'Menunggu Verifikasi'
  | 'Diverifikasi'
  | 'Dalam Penanganan'
  | 'Selesai'
  | 'Ditolak';

export type UrgencyLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Darurat';

export interface StatusHistoryItem {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  actor: string;
  actorRole: string;
  notes: string;
  evidencePhotoUrl?: string;
  allocatedBudget?: number;
}

export interface ComplaintComment {
  id: string;
  senderName: string;
  senderRole: 'Warga' | 'Aparatur Desa';
  message: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  dusun: DusunName;
  locationDetail: string;
  latitude?: number;
  longitude?: number;
  urgency: UrgencyLevel;
  reporterName: string;
  isAnonymous: boolean;
  reporterContact?: string;
  reporterNik?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: ComplaintStatus;
  assignedTo?: string;
  assignedRole?: string;
  allocatedBudget?: number; // Anggaran yang dialokasikan dari APBDes untuk tindak lanjut
  fundingSource?: string; // Sumber dana e.g. "Dana Desa (Bidang Pembangunan)", "PADes"
  resolutionProofPhoto?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  citizenRating?: number;
  citizenFeedback?: string;
  statusHistory: StatusHistoryItem[];
  comments: ComplaintComment[];
}

export interface CitizenResident {
  id: string;
  namaLengkap: string;
  nik: string;
  noKk: string;
  dusun: DusunName;
  rt: string;
  rw: string;
  alamatRumah: string;
  patokanRumah: string;
  latitude: number;
  longitude: number;
  noHp: string;
  pekerjaan: string;
  statusKeluarga: 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Lainnya';
  statusPBB: 'Lunas' | 'Belum Lunas';
  nomorObjekPajak: string; // NOP PBB-P2
  jumlahTanggungan: number;
  fotoRumahUrl?: string;
  tanggalDaftar: string;
  catatanAparatur?: string;
}

export interface DusunTaxData {
  dusun: DusunName;
  kepalaDusun: string;
  jumlahWajibPajak: number;
  targetPBB: number; // Target PBB-P2 dalam Rupiah
  realisasiPBB: number; // Realisasi penerimaan PBB-P2
  persentaseRealisasi: number;
  alokasiDasarBHPRD: number; // Alokasi dasar (pemerataan)
  alokasiProporsionalBHPRD: number; // Alokasi kinerja pencapaian target PBB
  totalBHPRDDiterima: number; // Total bagi hasil pajak diterima dusun
  insentifKolektor: number; // Insentif untuk petugas pemungut
}

export interface TaxDistributionSummary {
  tahunAnggaran: number;
  totalPenerimaanBHPRD: number; // Pagu bagi hasil pajak & retribusi dari Kabupaten
  totalTargetPBBDesa: number;
  totalRealisasiPBBDesa: number;
  persentaseTotalRealisasi: number;
  proporsiAlokasiDasar: number; // e.g. 60%
  proporsiAlokasiKinerja: number; // e.g. 40%
  persentaseInsentifKolektor: number; // e.g. 5% dari realisasi
  dusunList: DusunTaxData[];
  statusPenyaluran: 'Draf' | 'Ditetapkan Melalui Perkades' | 'Tersalurkan Sebagian' | 'Tersalurkan Penuh';
  tanggalPenetapan: string;
}

export type BudgetType = 'Pendapatan' | 'Belanja' | 'Pembiayaan';

export interface VillageOfficial {
  id: string;
  namaLengkap: string;
  jabatan: string;
  nipNiapd?: string;
  noHp: string;
  email: string;
  fotoUrl: string;
  tugasPokok?: string;
  status: 'Aktif' | 'Cuti' | 'Purna Tugas';
  urutan: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface BudgetAccount {
  code: string; // e.g. "1.1.1", "2.1.2"
  name: string;
  type: BudgetType;
  bidang?: string; // e.g. "Bidang Pembangunan Desa"
  subBidang?: string;
  anggaran: number; // Target / pagu anggaran (Rp)
  realisasi: number; // Realisasi sampai saat ini (Rp)
}

export interface FinancialTransaction {
  id: string;
  noBukti: string;
  tanggal: string;
  uraian: string;
  accountCode: string;
  accountName: string;
  type: 'Penerimaan' | 'Pengeluaran';
  jumlah: number;
  sumberDana: 'Dana Desa (DD)' | 'Alokasi Dana Desa (ADD)' | 'Bagi Hasil Pajak & Retribusi (BHPRD)' | 'Pendapatan Asli Desa (PADes)' | 'Bantuan Keuangan';
  terkaitAduanTicket?: string; // Jika pengeluaran bersumber dari tindak lanjut aduan warga
  penanggungJawab: string;
}

export interface FinancialReportSummary {
  tahunAnggaran: number;
  semester: 'Semester I' | 'Semester II' | 'Tahunan';
  totalPendapatanAnggaran: number;
  totalPendapatanRealisasi: number;
  totalBelanjaAnggaran: number;
  totalBelanjaRealisasi: number;
  surplusDefisitAnggaran: number;
  surplusDefisitRealisasi: number;
  silpaTahunLalu: number;
  silpaTahunBerjalan: number;
}
