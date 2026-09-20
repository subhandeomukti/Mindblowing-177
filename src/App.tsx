import React, { useState, useEffect } from 'react';
import { 
  Complaint, 
  TaxDistributionSummary, 
  BudgetAccount, 
  FinancialTransaction,
  CitizenResident,
  VillageOfficial
} from './types';
import { 
  INITIAL_COMPLAINTS, 
  INITIAL_TAX_SUMMARY, 
  INITIAL_BUDGET_ACCOUNTS, 
  INITIAL_TRANSACTIONS,
  INITIAL_CITIZENS,
  INITIAL_VILLAGE_OFFICIALS,
  VILLAGE_INFO,
  LOGO_DESA_GUNOSARI
} from './data/mockData';
import { generateBkuNumber } from './utils/formatters';
import { Header } from './components/Header';
import { PublicTransparencyFeed } from './components/warga/PublicTransparencyFeed';
import { TicketTracker } from './components/warga/TicketTracker';
import { ComplaintFormModal } from './components/warga/ComplaintFormModal';
import { CitizenRegistrationModal } from './components/warga/CitizenRegistrationModal';
import { ComplaintManagement } from './components/aparatur/ComplaintManagement';
import { TaxDistributionModule } from './components/aparatur/TaxDistributionModule';
import { FinancialReportingModule } from './components/aparatur/FinancialReportingModule';
import { CitizenDirectoryModule } from './components/aparatur/CitizenDirectoryModule';
import { VillageOfficialsModule } from './components/aparatur/VillageOfficialsModule';
import { VillageMapView } from './components/maps/VillageMapView';
import { NewTransactionModal } from './components/aparatur/NewTransactionModal';
import { PrintReportModal } from './components/common/PrintReportModal';
import { VillageEntranceModal } from './components/common/VillageEntranceModal';

export default function App() {
  // Persistence state with localStorage fallback
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('gunosari_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [taxSummary, setTaxSummary] = useState<TaxDistributionSummary>(() => {
    const saved = localStorage.getItem('gunosari_tax_summary');
    return saved ? JSON.parse(saved) : INITIAL_TAX_SUMMARY;
  });

  const [budgetAccounts, setBudgetAccounts] = useState<BudgetAccount[]>(() => {
    const saved = localStorage.getItem('gunosari_budget_accounts');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('gunosari_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [officials, setOfficials] = useState<VillageOfficial[]>(() => {
    const saved = localStorage.getItem('gunosari_officials');
    return saved ? JSON.parse(saved) : INITIAL_VILLAGE_OFFICIALS;
  });

  const [citizens, setCitizens] = useState<CitizenResident[]>(() => {
    const saved = localStorage.getItem('gunosari_citizens');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CitizenResident[];
        // Clear out any old mock house images as requested by user
        return parsed.map((c) => ({
          ...c,
          fotoRumahUrl: c.fotoRumahUrl?.includes('unsplash.com') ? '' : (c.fotoRumahUrl || ''),
        }));
      } catch {
        return INITIAL_CITIZENS;
      }
    }
    return INITIAL_CITIZENS;
  });

  // Active citizen resident currently using the portal
  const [currentActiveCitizen, setCurrentActiveCitizen] = useState<CitizenResident | null>(() => {
    const saved = localStorage.getItem('gunosari_active_citizen');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CitizenResident;
        if (parsed.fotoRumahUrl?.includes('unsplash.com')) {
          parsed.fotoRumahUrl = '';
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Entrance modal at the start of entering the application
  const [isEntranceModalOpen, setIsEntranceModalOpen] = useState<boolean>(() => {
    const hasEntered = localStorage.getItem('gunosari_has_entered');
    return hasEntered !== 'true';
  });

  // Navigation state
  const [currentPortal, setCurrentPortal] = useState<'warga' | 'aparatur'>('warga');
  const [activeWargaTab, setActiveWargaTab] = useState<'transparansi' | 'peta' | 'lacak' | 'buat'>('transparansi');
  const [activeAparaturTab, setActiveAparaturTab] = useState<'aduan' | 'peta' | 'warga' | 'perangkat' | 'pajak' | 'keuangan'>('aduan');
  const [selectedTicketToTrack, setSelectedTicketToTrack] = useState<string>('ADU-GNS-2025-0018');
  const [selectedCitizenIdOnMap, setSelectedCitizenIdOnMap] = useState<string | null>(null);

  // Modals state
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('gunosari_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('gunosari_tax_summary', JSON.stringify(taxSummary));
  }, [taxSummary]);

  useEffect(() => {
    localStorage.setItem('gunosari_budget_accounts', JSON.stringify(budgetAccounts));
  }, [budgetAccounts]);

  useEffect(() => {
    localStorage.setItem('gunosari_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('gunosari_officials', JSON.stringify(officials));
  }, [officials]);

  useEffect(() => {
    localStorage.setItem('gunosari_citizens', JSON.stringify(citizens));
  }, [citizens]);

  // Officials handlers
  const handleUpdateOfficial = (updated: VillageOfficial) => {
    setOfficials((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleAddOfficial = (newOfficial: VillageOfficial) => {
    setOfficials((prev) => [...prev, newOfficial]);
  };

  const handleDeleteOfficial = (id: string) => {
    setOfficials((prev) => prev.filter((o) => o.id !== id));
  };

  // Manual Budget handlers
  const handleSaveBudgetAccount = (account: BudgetAccount) => {
    setBudgetAccounts((prev) => {
      const idx = prev.findIndex((a) => a.code === account.code);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = account;
        return copy;
      }
      return [...prev, account];
    });
  };

  const handleDeleteBudgetAccount = (code: string) => {
    setBudgetAccounts((prev) => prev.filter((a) => a.code !== code));
  };

  // Handler for adding a new complaint from warga
  const handleAddComplaint = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    setSelectedTicketToTrack(newComplaint.ticketNumber);
  };

  // Handler for registering citizen
  const handleRegisterCitizen = (newCitizen: CitizenResident) => {
    setCitizens((prev) => [newCitizen, ...prev]);
  };

  // Handler for updating citizen house photo with camera
  const handleUpdateCitizenPhoto = (citizenId: string, newPhotoUrl: string) => {
    setCitizens((prev) =>
      prev.map((c) => (c.id === citizenId ? { ...c, fotoRumahUrl: newPhotoUrl } : c))
    );
    if (currentActiveCitizen && currentActiveCitizen.id === citizenId) {
      const updated = { ...currentActiveCitizen, fotoRumahUrl: newPhotoUrl };
      setCurrentActiveCitizen(updated);
      localStorage.setItem('gunosari_active_citizen', JSON.stringify(updated));
    }
  };

  // Handler for updating complaint from aparatur
  const handleUpdateComplaint = (updatedComplaint: Complaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.ticketNumber === updatedComplaint.ticketNumber ? updatedComplaint : c))
    );
  };

  // Handler for automatic financial integration when complaint action has a budget
  const handleSyncFinanceExpense = (complaint: Complaint, amount: number, source: string) => {
    // 1. Create a BKU transaction
    const newTx: FinancialTransaction = {
      id: 'tx-' + Date.now(),
      noBukti: generateBkuNumber(transactions.length),
      tanggal: new Date().toISOString().split('T')[0],
      uraian: `Realisasi Belanja Penanganan Aduan: ${complaint.title} (${complaint.dusun})`,
      accountCode: '2.2',
      accountName: 'Bidang Pelaksanaan Pembangunan Desa - Sarpras & Jalan',
      type: 'Pengeluaran',
      jumlah: amount,
      sumberDana: source as any,
      terkaitAduanTicket: complaint.ticketNumber,
      penanggungJawab: complaint.assignedTo || 'Kasi Kesejahteraan (Pak Hartono)',
    };

    setTransactions((prev) => [...prev, newTx]);

    // 2. Automatically update budget realisasi in Bidang 2 (Pembangunan)
    setBudgetAccounts((prev) =>
      prev.map((acc) => {
        if (acc.code === '2.2') {
          return {
            ...acc,
            realisasi: acc.realisasi + amount,
          };
        }
        return acc;
      })
    );
  };

  // Handler for adding a comment to a complaint
  const handleAddComment = (ticketNumber: string, message: string, senderName: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.ticketNumber === ticketNumber) {
          return {
            ...c,
            comments: [
              ...c.comments,
              {
                id: 'cm-' + Date.now(),
                senderName,
                senderRole: currentPortal === 'aparatur' ? 'Aparatur Desa' : 'Warga',
                message,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return c;
      })
    );
  };

  // Handler for citizen feedback/rating
  const handleSubmitRating = (ticketNumber: string, rating: number, feedback: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.ticketNumber === ticketNumber) {
          return {
            ...c,
            citizenRating: rating,
            citizenFeedback: feedback,
          };
        }
        return c;
      })
    );
  };

  // Handler for manual BKU transaction
  const handleAddTransaction = (newTx: FinancialTransaction) => {
    setTransactions((prev) => [...prev, newTx]);

    // Update the corresponding account realisasi
    setBudgetAccounts((prev) =>
      prev.map((acc) => {
        if (acc.code === newTx.accountCode) {
          return {
            ...acc,
            realisasi: acc.realisasi + newTx.jumlah,
          };
        }
        return acc;
      })
    );
  };

  // Focus a citizen on the map
  const handleFocusCitizenOnMap = (citizenId: string) => {
    setSelectedCitizenIdOnMap(citizenId);
    if (currentPortal === 'warga') {
      setActiveWargaTab('peta');
    } else {
      setActiveAparaturTab('peta');
    }
  };

  // Focus a complaint on the map
  const handleFocusComplaintOnMap = (_ticket: string) => {
    setSelectedCitizenIdOnMap(null);
    if (currentPortal === 'warga') {
      setActiveWargaTab('peta');
    } else {
      setActiveAparaturTab('peta');
    }
  };

  const resolvedCount = complaints.filter((c) => c.status === 'Selesai').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Header with Navigation and Portal Switching */}
      <Header
        currentPortal={currentPortal}
        onSelectPortal={setCurrentPortal}
        activeWargaTab={activeWargaTab}
        onSelectWargaTab={(tab) => {
          setActiveWargaTab(tab);
          if (tab === 'buat') {
            setIsComplaintModalOpen(true);
          }
        }}
        activeAparaturTab={activeAparaturTab}
        onSelectAparaturTab={setActiveAparaturTab}
        openComplaintModal={() => setIsComplaintModalOpen(true)}
        openRegisterModal={() => setIsRegisterModalOpen(true)}
        openPrintModal={() => setIsPrintModalOpen(true)}
        openEntranceModal={() => setIsEntranceModalOpen(true)}
        activeCitizen={currentActiveCitizen}
        onLogoutCitizen={() => {
          setCurrentActiveCitizen(null);
          localStorage.removeItem('gunosari_active_citizen');
          setIsEntranceModalOpen(true);
        }}
        totalComplaints={complaints.length}
        resolvedComplaints={resolvedCount}
        totalCitizens={citizens.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentPortal === 'warga' ? (
          /* PORTAL WARGA (Transparansi, Peta Rumah & Pelacakan Aduan) */
          <div>
            {activeWargaTab === 'transparansi' && (
              <PublicTransparencyFeed
                complaints={complaints}
                onSelectComplaintToTrack={(ticket) => {
                  setSelectedTicketToTrack(ticket);
                  setActiveWargaTab('lacak');
                }}
                onOpenNewComplaintModal={() => setIsComplaintModalOpen(true)}
                onFocusOnMap={handleFocusComplaintOnMap}
              />
            )}

            {activeWargaTab === 'peta' && (
              <VillageMapView
                citizens={citizens}
                complaints={complaints}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onSelectComplaintTicket={(ticket) => {
                  setSelectedTicketToTrack(ticket);
                  setActiveWargaTab('lacak');
                }}
                selectedCitizenId={selectedCitizenIdOnMap}
                activeCitizen={currentActiveCitizen}
                onUpdateCitizenPhoto={handleUpdateCitizenPhoto}
              />
            )}

            {activeWargaTab === 'lacak' && (
              <TicketTracker
                complaints={complaints}
                selectedTicketNumber={selectedTicketToTrack}
                onSelectTicket={setSelectedTicketToTrack}
                onAddComment={handleAddComment}
                onSubmitRating={handleSubmitRating}
                onFocusOnMap={handleFocusComplaintOnMap}
              />
            )}
          </div>
        ) : (
          /* PORTAL PERANGKAT DESA (Aparatur, Peta Rumah, Data Warga, Pembagian Pajak & APBDes) */
          <div>
            {activeAparaturTab === 'aduan' && (
              <ComplaintManagement
                complaints={complaints}
                onUpdateComplaint={handleUpdateComplaint}
                onSyncFinanceExpense={handleSyncFinanceExpense}
                onViewFinanceTab={() => setActiveAparaturTab('keuangan')}
                onFocusOnMap={handleFocusComplaintOnMap}
              />
            )}

            {activeAparaturTab === 'peta' && (
              <VillageMapView
                citizens={citizens}
                complaints={complaints}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onSelectComplaintTicket={(ticket) => {
                  setSelectedTicketToTrack(ticket);
                  setCurrentPortal('warga');
                  setActiveWargaTab('lacak');
                }}
                selectedCitizenId={selectedCitizenIdOnMap}
                activeCitizen={currentActiveCitizen}
                onUpdateCitizenPhoto={handleUpdateCitizenPhoto}
              />
            )}

            {activeAparaturTab === 'warga' && (
              <CitizenDirectoryModule
                citizens={citizens}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onFocusCitizenOnMap={handleFocusCitizenOnMap}
                onUpdateCitizenPhoto={handleUpdateCitizenPhoto}
              />
            )}

            {activeAparaturTab === 'pajak' && (
              <TaxDistributionModule
                taxSummary={taxSummary}
                onUpdateTaxSummary={setTaxSummary}
                onOpenPrintModal={() => setIsPrintModalOpen(true)}
              />
            )}

            {activeAparaturTab === 'keuangan' && (
              <FinancialReportingModule
                budgetAccounts={budgetAccounts}
                transactions={transactions}
                complaints={complaints}
                onOpenNewTransactionModal={() => setIsNewTransactionModalOpen(true)}
                onOpenPrintModal={() => setIsPrintModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer Berlogo Nuansa Pedesaan */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <img
              src={LOGO_DESA_GUNOSARI}
              alt="Logo Desa Gunosari"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-amber-400/80 shadow-xs flex-shrink-0 bg-white"
            />
            <div className="space-y-0.5">
              <p className="font-bold text-white text-sm">
                Pemerintah Desa Gunosari &bull; Kecamatan Tlogosari &bull; Kabupaten Bondowoso
              </p>
              <p className="text-slate-400 text-[11px]">
                {VILLAGE_INFO.motto} &bull; {VILLAGE_INFO.alamatKantor}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setIsEntranceModalOpen(true)}
              className="text-amber-300 hover:text-amber-200 hover:underline cursor-pointer font-semibold"
            >
              Ganti Akun / Pendaftaran Awal
            </button>
            <span>&bull;</span>
            <span>Call Center: {VILLAGE_INFO.callCenter}</span>
            <span>&bull;</span>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="text-blue-300 hover:underline cursor-pointer"
            >
              Cetak Dokumen Resmi
            </button>
            <span>&bull;</span>
            <span className="text-slate-300">Tahun Anggaran 2025</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* Modal Pintu Masuk / Pendaftaran Awal Masuk Aplikasi */}
      <VillageEntranceModal
        isOpen={isEntranceModalOpen}
        onClose={() => setIsEntranceModalOpen(false)}
        citizens={citizens}
        currentActiveCitizen={currentActiveCitizen}
        onRegisterCitizen={(newCitizen: CitizenResident) => {
          handleRegisterCitizen(newCitizen);
          setCurrentActiveCitizen(newCitizen);
          localStorage.setItem('gunosari_has_entered', 'true');
          localStorage.setItem('gunosari_active_citizen', JSON.stringify(newCitizen));
          setIsEntranceModalOpen(false);
          setSelectedCitizenIdOnMap(newCitizen.id);
          setActiveWargaTab('peta');
        }}
        onSelectActiveCitizen={(citizen: CitizenResident) => {
          setCurrentActiveCitizen(citizen);
          localStorage.setItem('gunosari_has_entered', 'true');
          localStorage.setItem('gunosari_active_citizen', JSON.stringify(citizen));
          setIsEntranceModalOpen(false);
        }}
        onEnterAsAparatur={() => {
          setCurrentPortal('aparatur');
          localStorage.setItem('gunosari_has_entered', 'true');
          setIsEntranceModalOpen(false);
        }}
        onEnterAsGuest={() => {
          localStorage.setItem('gunosari_has_entered', 'true');
          setIsEntranceModalOpen(false);
        }}
      />

      <ComplaintFormModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSubmitComplaint={handleAddComplaint}
        onTrackSubmittedTicket={(ticket) => {
          setSelectedTicketToTrack(ticket);
          setActiveWargaTab('lacak');
        }}
        activeCitizen={currentActiveCitizen}
      />

      <CitizenRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterCitizen={handleRegisterCitizen}
        onViewOnMap={(citizenId) => {
          handleFocusCitizenOnMap(citizenId);
        }}
      />

      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        budgetAccounts={budgetAccounts}
        complaints={complaints}
        existingTransactionCount={transactions.length}
        onAddTransaction={handleAddTransaction}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        complaints={complaints}
        budgetAccounts={budgetAccounts}
        taxSummary={taxSummary}
      />
    </div>
  );
}
