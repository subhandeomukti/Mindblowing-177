import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  RefreshCw, 
  Check, 
  RotateCcw, 
  Upload, 
  Image as ImageIcon, 
  X, 
  AlertCircle,
  Home,
  Trash2
} from 'lucide-react';

interface HouseCameraCaptureProps {
  currentPhotoUrl: string;
  onPhotoCaptured: (photoUrl: string) => void;
  label?: string;
  dusunName?: string;
}

export const HouseCameraCapture: React.FC<HouseCameraCaptureProps> = ({
  currentPhotoUrl,
  onPhotoCaptured,
  label = 'Foto Tampak Depan Rumah Warga',
  dusunName,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [sourceType, setSourceType] = useState<'camera' | 'upload' | 'empty'>('empty');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop current active video stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // Start device camera
  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopStream();
    setCameraError(null);
    setCapturedSnapshot(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Fitur kamera tidak didukung pada perangkat / browser ini.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
    } catch (err: any) {
      console.error('Gagal mengakses kamera:', err);
      let errorMsg = 'Izin kamera ditolak atau kamera sedang digunakan oleh aplikasi lain.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Akses kamera tidak diizinkan. Silakan berikan izin kamera pada peramban Anda atau gunakan opsi unggah galeri.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'Tidak ditemukan perangkat kamera pada gawai Anda. Silakan pilih foto dari galeri.';
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
      stopStream();
    }
  };

  // Switch between front & rear camera
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Capture current video frame
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    
    // Shutter flash effect
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // If user camera (selfie), mirror horizontally
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add watermark overlay for authenticity
      ctx.restore();
      const dateStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(16, canvas.height - 48, 380, 34);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`Desa Gunosari ${dusunName ? '• ' + dusunName : ''} [${dateStr}]`, 26, canvas.height - 26);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedSnapshot(dataUrl);
      stopStream();
    }
  };

  // Confirm using the captured snapshot
  const handleConfirmSnapshot = () => {
    if (capturedSnapshot) {
      onPhotoCaptured(capturedSnapshot);
      setSourceType('camera');
      setIsCameraActive(false);
      setCapturedSnapshot(null);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedSnapshot(null);
    startCamera(facingMode);
  };

  // Cancel / Close live camera
  const handleCancelCamera = () => {
    stopStream();
    setIsCameraActive(false);
    setCapturedSnapshot(null);
    setCameraError(null);
  };

  // Handle file upload from gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onPhotoCaptured(result);
        setSourceType('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Label and Source indicator */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1.5 text-[11px]">
          {sourceType === 'camera' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold">
              <Camera className="w-3 h-3 text-emerald-700" />
              <span>Kamera Aktif</span>
            </span>
          )}
          {sourceType === 'upload' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold">
              <Upload className="w-3 h-3 text-blue-700" />
              <span>Unggahan Galeri</span>
            </span>
          )}
          {(!currentPhotoUrl || sourceType === 'empty') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              <Home className="w-3 h-3 text-slate-400" />
              <span>Belum Ada Foto</span>
            </span>
          )}
        </div>
      </div>

      {/* Hidden File Input for Gallery / System Camera */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* VIEW 1: LIVE CAMERA VIEWFINDER & SHUTTER */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-blue-600 shadow-lg text-white">
          {/* Shutter flash overlay */}
          {isShutterFlashing && (
            <div className="absolute inset-0 bg-white z-30 transition-opacity duration-150 pointer-events-none opacity-90" />
          )}

          {/* Top Camera Controls */}
          <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Kamera Rumah Warga
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition cursor-pointer"
                title="Putar Kamera Depan / Belakang"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCancelCamera}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-red-600 text-white backdrop-blur-xs transition cursor-pointer"
                title="Tutup Kamera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Stream or Captured Preview */}
          <div className="relative aspect-video sm:aspect-16/10 w-full bg-black flex items-center justify-center overflow-hidden">
            {!capturedSnapshot ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Viewfinder Framing Guide */}
                <div className="absolute inset-6 border border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-t-2 border-l-2 border-amber-400" />
                    <span className="w-5 h-5 border-t-2 border-r-2 border-amber-400" />
                  </div>
                  <div className="text-center bg-black/60 backdrop-blur-xs text-amber-200 text-[11px] font-medium py-1 px-3 rounded-full mx-auto shadow-xs">
                    Arahkan ke tampak depan rumah warga Desa Gunosari
                  </div>
                  <div className="flex justify-between">
                    <span className="w-5 h-5 border-b-2 border-l-2 border-amber-400" />
                    <span className="w-5 h-5 border-b-2 border-r-2 border-amber-400" />
                  </div>
                </div>
              </>
            ) : (
              <img
                src={capturedSnapshot}
                alt="Hasil Foto Kamera"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Bottom Controls */}
          <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center gap-6">
            {!capturedSnapshot ? (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCancelCamera}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs text-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>

                {/* Shutter Button */}
                <button
                  type="button"
                  onClick={takeSnapshot}
                  className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-xl active:scale-95 transition cursor-pointer group"
                  title="Ambil Foto Rumah"
                >
                  <div className="w-12 h-12 rounded-full bg-white group-hover:scale-90 transition flex items-center justify-center">
                    <Camera className="w-6 h-6 text-red-600" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs text-slate-200 transition cursor-pointer flex items-center gap-1"
                  title="Pilih dari berkas gawai"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Galeri</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full max-w-sm justify-between">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Foto Ulang</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSnapshot}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Pakai Foto Ini</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: STANDARD PREVIEW & SELECTION CARD (WHEN CAMERA IS NOT ACTIVELY OPEN) */}
      {!isCameraActive && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-3.5 space-y-3">
          {/* Error Message if Camera was denied */}
          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="underline font-bold hover:text-amber-950 cursor-pointer"
                >
                  Buka Galeri Foto di Gawai Anda
                </button>
              </div>
            </div>
          )}

          {/* Current Selected Photo Preview OR Empty Placeholder */}
          {!currentPhotoUrl ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shadow-inner">
                <Home className="w-7 h-7 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  Foto Rumah Belum Ada (Kosong)
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Tidak ada foto rumah yang dimuat. Anda dapat mengambil foto langsung menggunakan kamera gawai atau unggah dari galeri.
                </p>
              </div>

              {/* Action buttons when empty */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  className="py-2 px-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ambil dengan Kamera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-800" />
                  <span>Pilih dari Galeri</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 h-44 sm:h-48 group">
                <img
                  src={currentPhotoUrl}
                  alt="Tampak Depan Rumah Terpilih"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                />
                
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex items-end justify-between">
                  <div>
                    <span className="text-white font-bold text-xs block drop-shadow-xs">
                      Foto Rumah Terpasang
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Tampak depan rumah warga Desa Gunosari
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-900/90 text-blue-100 rounded text-[10px] font-mono border border-blue-400/40">
                    Peta Geospasial
                  </span>
                </div>

                {/* Quick action buttons on preview */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => startCamera('environment')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-900/90 hover:bg-blue-900 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer border border-blue-400/50 backdrop-blur-xs"
                    title="Ambil foto rumah baru dengan kamera gawai"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ubah Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onPhotoCaptured('');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-1 transition cursor-pointer backdrop-blur-xs"
                    title="Hapus / Kosongkan Foto Rumah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan</span>
                  </button>
                </div>
              </div>

              {/* Primary Action Buttons: Camera & Upload & Delete */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  className="py-2.5 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span>Foto Kamera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-700" />
                  <span>Galeri</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onPhotoCaptured('');
                  }}
                  className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Kosongkan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
