import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Home, 
  MapPin, 
  Search, 
  Layers, 
  Navigation, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  Plus, 
  ExternalLink,
  Filter,
  Maximize2,
  Camera,
  X
} from 'lucide-react';
import { CitizenResident, Complaint, DusunName } from '../../types';
import { VILLAGE_INFO } from '../../data/mockData';
import { formatRupiah } from '../../utils/formatters';
import { HouseCameraCapture } from '../common/HouseCameraCapture';

interface VillageMapViewProps {
  citizens: CitizenResident[];
  complaints: Complaint[];
  onOpenRegisterModal: () => void;
  onSelectComplaintTicket?: (ticket: string) => void;
  selectedCitizenId?: string | null;
  activeCitizen?: CitizenResident | null;
  onUpdateCitizenPhoto?: (citizenId: string, newPhotoUrl: string) => void;
}

export const VillageMapView: React.FC<VillageMapViewProps> = ({
  citizens,
  complaints,
  onOpenRegisterModal,
  onSelectComplaintTicket,
  selectedCitizenId,
  activeCitizen,
  onUpdateCitizenPhoto,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'citizens' | 'complaints'>('all');
  const [selectedDusun, setSelectedDusun] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'citizen' | 'complaint' | 'facility';
    data: any;
  } | null>(null);
  const [photoEditCitizen, setPhotoEditCitizen] = useState<CitizenResident | null>(null);
  const [tempEditedPhoto, setTempEditedPhoto] = useState<string>('');

  // Fasilitas umum Desa Gunosari
  const publicFacilities = [
    {
      id: 'fac-1',
      name: 'Kantor Balai Desa Gunosari',
      category: 'Pusat Pemerintahan',
      dusun: 'Dusun Krajan',
      alamat: 'Jl. Raya Gunosari - Tlogosari No. 12',
      lat: -7.9865,
      lng: 113.9168,
      pj: 'H. Sudarsono, S.Sos. (Kades)',
    },
    {
      id: 'fac-2',
      name: 'Pos Kesehatan Desa (Poskesdes) Gunosari',
      category: 'Layanan Medis',
      dusun: 'Dusun Krajan',
      alamat: 'Kompleks Balai Desa Gunosari',
      lat: -7.9862,
      lng: 113.9172,
      pj: 'Bidan Desa (Ibu Ratna, A.Md.Keb)',
    },
    {
      id: 'fac-3',
      name: 'Masjid Jami Al-Hidayah Gunosari',
      category: 'Tempat Ibadah',
      dusun: 'Dusun Sumber Ketangi',
      alamat: 'Jl. Utama Sumber Ketangi No. 01',
      lat: -7.9875,
      lng: 113.9182,
      pj: 'Takmir Masjid KH. Mansur',
    },
    {
      id: 'fac-4',
      name: 'SDN Gunosari 01 Tlogosari',
      category: 'Pendidikan',
      dusun: 'Dusun Gunung Sari Kidul',
      alamat: 'Jl. Lereng Kidul No. 05',
      lat: -7.9902,
      lng: 113.9145,
      pj: 'Kepala Sekolah SDN Gunosari 01',
    }
  ];

  // Inisialisasi peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [VILLAGE_INFO.koordinatPusatDesa.lat, VILLAGE_INFO.koordinatPusatDesa.lng],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor | Pemdes Gunosari',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Tidak menghancurkan peta pada re-render minor
    };
  }, []);

  // Update Markers bila filter atau data berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const layerGroup = markersLayerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Tampilkan Rumah Warga
    if (activeFilter === 'all' || activeFilter === 'citizens') {
      citizens
        .filter((c) => selectedDusun === 'all' || c.dusun === selectedDusun)
        .filter((c) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            c.namaLengkap.toLowerCase().includes(q) ||
            c.nik.includes(q) ||
            c.alamatRumah.toLowerCase().includes(q) ||
            c.patokanRumah.toLowerCase().includes(q)
          );
        })
        .forEach((citizen) => {
          const isLunas = citizen.statusPBB === 'Lunas';
          const markerHtml = `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-full ${isLunas ? 'bg-blue-800' : 'bg-amber-600'} text-white shadow-md border-2 border-white flex items-center justify-center transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${isLunas ? 'bg-emerald-500' : 'bg-red-500'} border-2 border-white"></div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: markerHtml,
            className: 'custom-house-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([citizen.latitude, citizen.longitude], { icon: customIcon });

          marker.on('click', () => {
            setSelectedEntity({ type: 'citizen', data: citizen });
            mapInstanceRef.current?.panTo([citizen.latitude, citizen.longitude]);
          });

          marker.bindTooltip(`Rumah: ${citizen.namaLengkap} (${citizen.dusun} RT ${citizen.rt})`, {
            direction: 'top',
            offset: [0, -12],
          });

          layerGroup.addLayer(marker);
        });
    }

    // 2. Tampilkan Titik Aduan Masyarakat
    if (activeFilter === 'all' || activeFilter === 'complaints') {
      complaints
        .filter((c) => selectedDusun === 'all' || c.dusun === selectedDusun)
        .filter((c) => c.latitude && c.longitude)
        .filter((c) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            c.title.toLowerCase().includes(q) ||
            c.ticketNumber.toLowerCase().includes(q) ||
            c.locationDetail.toLowerCase().includes(q)
          );
        })
        .forEach((complaint) => {
          const isDone = complaint.status === 'Selesai';
          const markerHtml = `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-full ${isDone ? 'bg-emerald-700' : 'bg-red-700'} text-white shadow-md border-2 border-white flex items-center justify-center transition-transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: markerHtml,
            className: 'custom-complaint-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([complaint.latitude!, complaint.longitude!], { icon: customIcon });

          marker.on('click', () => {
            setSelectedEntity({ type: 'complaint', data: complaint });
            mapInstanceRef.current?.panTo([complaint.latitude!, complaint.longitude!]);
          });

          marker.bindTooltip(`[${complaint.ticketNumber}] ${complaint.title}`, {
            direction: 'top',
            offset: [0, -12],
          });

          layerGroup.addLayer(marker);
        });
    }

    // 3. Tampilkan Fasilitas Umum / Kantor Balai Desa
    publicFacilities.forEach((fac) => {
      const markerHtml = `
        <div class="w-7 h-7 rounded-full bg-slate-900 text-amber-300 shadow-md border-2 border-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
            <path d="M9 22v-4h6v4"></path>
            <path d="M8 6h.01"></path>
            <path d="M16 6h.01"></path>
            <path d="M8 10h.01"></path>
            <path d="M16 10h.01"></path>
            <path d="M8 14h.01"></path>
            <path d="M16 14h.01"></path>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-fac-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedEntity({ type: 'facility', data: fac });
        mapInstanceRef.current?.panTo([fac.lat, fac.lng]);
      });
      marker.bindTooltip(fac.name, { direction: 'top', offset: [0, -10] });
      layerGroup.addLayer(marker);
    });
  }, [citizens, complaints, activeFilter, selectedDusun, searchQuery]);

  // Handle selected citizen from parent table
  useEffect(() => {
    if (selectedCitizenId) {
      const found = citizens.find((c) => c.id === selectedCitizenId);
      if (found && mapInstanceRef.current) {
        setSelectedEntity({ type: 'citizen', data: found });
        mapInstanceRef.current.setView([found.latitude, found.longitude], 17);
      }
    }
  }, [selectedCitizenId, citizens]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [VILLAGE_INFO.koordinatPusatDesa.lat, VILLAGE_INFO.koordinatPusatDesa.lng],
        15
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Kontrol & Pencarian Alamat */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
              Peta Geospasial Desa Gunosari
            </span>
            <span className="text-xs text-slate-500 font-medium">Kec. Tlogosari, Kab. Bondowoso</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Peta Lokasi Rumah Warga & Titik Aduan Masyarakat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Memudahkan Kepala Desa dan aparatur melihat posisi rumah warga, patokan alamat, status kepatuhan PBB, dan aduan lingkungan langsung pada peta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeCitizen && (
            <button
              type="button"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([activeCitizen.latitude, activeCitizen.longitude], 17);
                  setSelectedEntity({ type: 'citizen', data: activeCitizen });
                }
              }}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-950 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
              title="Fokus ke lokasi rumah Anda di peta"
            >
              <Home className="w-3.5 h-3.5 text-blue-700" />
              <span>Rumah Saya ({activeCitizen.namaLengkap.split(' ')[0]})</span>
            </button>
          )}

          <button
            onClick={resetView}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Pusat Balai Desa</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-200" />
            <span>+ Daftarkan Rumah Warga Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Tampilan:
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Titik ({citizens.length + complaints.length})
          </button>
          <button
            onClick={() => setActiveFilter('citizens')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
              activeFilter === 'citizens'
                ? 'bg-blue-900 text-white'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Rumah Warga ({citizens.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('complaints')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
              activeFilter === 'complaints'
                ? 'bg-red-800 text-white'
                : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Titik Aduan ({complaints.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDusun}
            onChange={(e) => setSelectedDusun(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-700"
          >
            <option value="all">Semua Dusun</option>
            <option value="Dusun Krajan">Dusun Krajan</option>
            <option value="Dusun Sumber Ketangi">Dusun Sumber Ketangi</option>
            <option value="Dusun Gunung Sari Kidul">Dusun Gunung Sari Kidul</option>
            <option value="Dusun Sidodadi">Dusun Sidodadi</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama warga / jalan..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-700"
            />
          </div>
        </div>
      </div>

      {/* Main Map Canvas and Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Container */}
        <div className={`rounded-2xl overflow-hidden border border-slate-300 shadow-sm relative min-h-[460px] sm:min-h-[540px] ${selectedEntity ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] sm:min-h-[540px] z-10" />

          {/* Floating Map Legend */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-[11px] space-y-1.5 hidden sm:block">
            <span className="font-bold text-slate-800 block text-xs border-b border-slate-200 pb-1">
              Legenda Peta Gunosari
            </span>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-blue-800 border border-white inline-block"></span>
              <span>Rumah Warga (PBB Lunas)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-amber-600 border border-white inline-block"></span>
              <span>Rumah Warga (PBB Belum Lunas)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-red-700 border border-white inline-block"></span>
              <span>Lokasi Aduan Lingkungan</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-slate-900 border border-white inline-block"></span>
              <span>Balai Desa / Fasilitas Publik</span>
            </div>
          </div>
        </div>

        {/* Detail Inspection Card (Shown when an entity is clicked) */}
        {selectedEntity && (
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 max-h-[540px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedEntity.type === 'citizen' && (
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[11px] font-bold">
                    Profil Rumah Warga
                  </span>
                )}
                {selectedEntity.type === 'complaint' && (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 text-[11px] font-bold">
                    Detail Lokasi Aduan
                  </span>
                )}
                {selectedEntity.type === 'facility' && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold">
                    Fasilitas Publik Desa
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold p-1 cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* If Citizen */}
            {selectedEntity.type === 'citizen' && (() => {
              const citizen = selectedEntity.data as CitizenResident;
              const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${citizen.latitude},${citizen.longitude}`;
              const waUrl = `https://wa.me/62${citizen.noHp.replace(/[^0-9]/g, '').replace(/^0/, '')}`;

              return (
                <div className="space-y-4 text-xs">
                  {/* Foto Rumah Warga dengan Fitur Kamera atau Tampilan Kosong */}
                  {citizen.fotoRumahUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-900 group">
                      <img
                        src={citizen.fotoRumahUrl}
                        alt={`Rumah ${citizen.namaLengkap}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-200"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white rounded text-[10px] font-medium">
                        RT {citizen.rt} / RW {citizen.rw} &bull; {citizen.dusun}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPhotoEditCitizen(citizen);
                          setTempEditedPhoto(citizen.fotoRumahUrl || '');
                        }}
                        className="absolute top-2 right-2 px-2.5 py-1.5 bg-blue-900/90 hover:bg-blue-900 text-white rounded-lg text-[11px] font-bold shadow-md flex items-center gap-1 border border-blue-400/50 backdrop-blur-xs transition cursor-pointer"
                        title="Buka Kamera untuk Memotret Rumah Ini"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-300" />
                        <span>Kamera</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-xs">
                        <Home className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">Foto Rumah Kosong</p>
                        <p className="text-[10px] text-slate-500">
                          RT {citizen.rt} / RW {citizen.rw} &bull; {citizen.dusun}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoEditCitizen(citizen);
                          setTempEditedPhoto('');
                        }}
                        className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ambil Foto (Kamera)</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{citizen.namaLengkap}</h3>
                    <p className="text-slate-500 font-mono text-[11px]">NIK: {citizen.nik}</p>
                    <p className="text-slate-500 font-mono text-[11px]">No. KK: {citizen.noKk}</p>
                  </div>

                  {/* Status PBB Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Status PBB-P2 2025:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        citizen.statusPBB === 'Lunas' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {citizen.statusPBB}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      NOP: {citizen.nomorObjekPajak}
                    </div>
                  </div>

                  {/* Alamat & Patokan Rumah */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 block">Alamat Rumah Lengkap:</span>
                    <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {citizen.alamatRumah}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 block">Patokan / Ciri Khusus:</span>
                    <p className="text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
                      "{citizen.patokanRumah}"
                    </p>
                  </div>

                  {/* Pekerjaan & Tanggungan */}
                  <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pekerjaan:</span>
                      <span className="font-semibold text-slate-800">{citizen.pekerjaan}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tanggungan:</span>
                      <span className="font-semibold text-slate-800">{citizen.jumlahTanggungan} Jiwa</span>
                    </div>
                  </div>

                  {/* Action Buttons for Kepala Desa & Perangkat */}
                  <div className="pt-2 space-y-2">
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 text-blue-200" />
                      <span>Petunjuk Arah Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-blue-300" />
                    </a>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Phone className="w-4 h-4 text-emerald-200" />
                      <span>Hubungi WhatsApp Warga ({citizen.noHp})</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setPhotoEditCitizen(citizen);
                        setTempEditedPhoto(citizen.fotoRumahUrl || '');
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-blue-700" />
                      <span>Ambil / Perbarui Foto Rumah (Kamera)</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* If Complaint */}
            {selectedEntity.type === 'complaint' && (() => {
              const complaint = selectedEntity.data as Complaint;
              const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${complaint.latitude},${complaint.longitude}`;

              return (
                <div className="space-y-4 text-xs">
                  {complaint.photoUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
                      <img
                        src={complaint.photoUrl}
                        alt={complaint.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white rounded text-[10px] font-mono">
                        {complaint.ticketNumber}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{complaint.title}</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">{complaint.dusun} - {complaint.locationDetail}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Status Pengerjaan:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                        {complaint.status}
                      </span>
                    </div>
                    {complaint.allocatedBudget && (
                      <div className="text-[11px] text-emerald-800 font-bold">
                        Alokasi APBDes: {formatRupiah(complaint.allocatedBudget)}
                      </div>
                    )}
                  </div>

                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {complaint.description}
                  </p>

                  <div className="pt-2 space-y-2">
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 text-blue-200" />
                      <span>Rute Lokasi Masalah (Google Maps)</span>
                      <ExternalLink className="w-3 h-3 text-blue-300" />
                    </a>

                    {onSelectComplaintTicket && (
                      <button
                        onClick={() => onSelectComplaintTicket(complaint.ticketNumber)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition cursor-pointer"
                      >
                        Lihat Progres Real-Time Tiket Ini
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* If Public Facility */}
            {selectedEntity.type === 'facility' && (() => {
              const fac = selectedEntity.data;
              const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`;

              return (
                <div className="space-y-3 text-xs">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{fac.name}</h3>
                    <p className="text-slate-500 text-[11px]">{fac.category} &bull; {fac.dusun}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Alamat:</span>
                    <p className="text-slate-800 font-semibold">{fac.alamat}</p>
                    <span className="text-slate-400 block text-[10px] mt-1">Penanggung Jawab:</span>
                    <p className="text-slate-800 font-semibold">{fac.pj}</p>
                  </div>
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 text-slate-200" />
                    <span>Arahkan ke Lokasi Ini</span>
                    <ExternalLink className="w-3 h-3 text-slate-300" />
                  </a>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Modal Kamera Pembaruan Foto Rumah Warga */}
      {photoEditCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-900">
                  <Camera className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Foto Kamera Rumah Warga
                  </h3>
                  <p className="text-xs text-slate-500">
                    {photoEditCitizen.namaLengkap} &bull; {photoEditCitizen.dusun} (RT {photoEditCitizen.rt} / RW {photoEditCitizen.rw})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPhotoEditCitizen(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <HouseCameraCapture
              currentPhotoUrl={tempEditedPhoto || photoEditCitizen.fotoRumahUrl || ''}
              onPhotoCaptured={(url) => setTempEditedPhoto(url)}
              dusunName={photoEditCitizen.dusun}
              label={`Potret Rumah ${photoEditCitizen.namaLengkap}`}
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPhotoEditCitizen(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tempEditedPhoto !== undefined) {
                    onUpdateCitizenPhoto?.(photoEditCitizen.id, tempEditedPhoto);
                    // Update selectedEntity data in place
                    if (selectedEntity?.type === 'citizen' && selectedEntity.data.id === photoEditCitizen.id) {
                      setSelectedEntity({
                        ...selectedEntity,
                        data: {
                          ...selectedEntity.data,
                          fotoRumahUrl: tempEditedPhoto,
                        },
                      });
                    }
                  }
                  setPhotoEditCitizen(null);
                }}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-200" />
                <span>Simpan Foto Rumah</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
