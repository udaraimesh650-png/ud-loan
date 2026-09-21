import React, { useState } from 'react';
import { Home, Check, Share2, Download, Eye } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { APPLICATIONS } from '../data/applicationsData';
import { ApplicationDocument } from '../types';
import { ApplicationFormModal } from './ApplicationFormModal';

interface ApplicationsScreenProps {
  onGoHome: () => void;
}

// Custom Downward Gradient Arrow Icon matching 4.png
const DownloadGradientArrow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 100 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-16 h-20 sm:w-20 sm:h-24 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${className}`}
  >
    <defs>
      <linearGradient id="downArrowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="35%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <path
      d="M33 5 L67 5 L67 58 L88 58 L50 112 L12 58 L33 58 Z"
      fill="url(#downArrowGrad)"
    />
  </svg>
);

// Custom Curved Share Arrow Icon matching 4.png
const ShareCurvedArrow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-16 h-20 sm:w-20 sm:h-24 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${className}`}
  >
    <defs>
      <linearGradient id="shareArrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="50%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    <path
      d="M18 98 C35 60, 60 45, 90 40 L88 20 L118 52 L88 84 L88 64 C64 66, 42 76, 26 100 Z"
      fill="url(#shareArrowGrad)"
    />
  </svg>
);

export const ApplicationsScreen: React.FC<ApplicationsScreenProps> = ({ onGoHome }) => {
  const [activeModalApp, setActiveModalApp] = useState<ApplicationDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Download PDF
  const handleDownload = (app: ApplicationDocument) => {
    const link = document.createElement('a');

    link.href = app.pdfPath;
    link.download = app.pdfPath.split('/').pop() || 'application.pdf';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`${app.title} PDF downloaded!`);
  };

  // Share PDF
  const handleShare = async (app: ApplicationDocument) => {
    try {
      const response = await fetch(app.pdfPath);

      if (!response.ok) {
        throw new Error(`PDF could not be loaded: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName =
        app.pdfPath.split('/').pop() || 'application.pdf';

      // Android / iPhone native sharing
      if (Capacitor.isNativePlatform()) {
        const arrayBuffer = await blob.arrayBuffer();

        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';

        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }

        const base64Data = btoa(binary);

        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        const fileUri = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache,
        });

        await Share.share({
          title: app.title,
          text: `${app.title} - ${app.subtitle}`,
          url: fileUri.uri,
          dialogTitle: 'Share PDF',
        });

        showToast('PDF shared successfully!');
        return;
      }

      // Web / Windows browser sharing
      const file = new File(
        [blob],
        fileName,
        { type: 'application/pdf' }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: app.title,
          text: `${app.title} - ${app.subtitle}`,
          files: [file],
        });

        showToast('PDF shared successfully!');
      } else {
        showToast('PDF sharing is not supported on this device.');
      }

    } catch (error) {
      console.error('PDF share error:', error);
      showToast('Unable to share PDF.');
    }
  };


  // Open PDF
  const handleOpenPdf = (app: ApplicationDocument) => {
    window.location.href = app.pdfPath;
  };

  // Trigger Print from inside modal
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="applications-screen"
      className="relative min-h-full flex flex-col justify-between overflow-y-auto px-4 sm:px-6 select-none"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 12px), 20px)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 20px)',
        backgroundColor: '#26282b',
        backgroundImage: `
          radial-gradient(circle at 50% 10%, rgba(70, 75, 82, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 90%, rgba(30, 32, 35, 0.6) 0%, transparent 70%),
          linear-gradient(180deg, #2b2d30 0%, #202225 50%, #17181a 100%)
        `,
      }}
    >
      {/* Subtle paper / slate texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
        style={{
          backgroundImage: `
            radial-gradient(#ffffff 0.75px, transparent 0.75px),
            radial-gradient(#000000 0.75px, transparent 0.75px)
          `,
          backgroundSize: '8px 8px, 12px 12px',
        }}
      />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 z-10">
        <button
          id="btn-apps-home"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-all text-white cursor-pointer touch-manipulation z-30 p-2.5 -m-2.5 rounded-2xl hover:bg-white/5 active:bg-white/10"
          title="Go to Home"
          aria-label="Home"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800/90 border border-slate-600/60 flex items-center justify-center shadow-lg text-white group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 fill-white" />
          </div>

          <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-300 group-hover:text-white transition-colors">
            Home
          </span>
        </button>

        <div className="flex flex-col items-center">
          <h1
            id="apps-title"
            className="text-xl sm:text-2xl font-black tracking-wider text-center uppercase text-white"
            style={{
              letterSpacing: '0.05em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            APPLICATION
          </h1>

          <span className="text-xs sm:text-sm font-bold text-slate-300 tracking-normal mt-0.5">
            (ණය අයදුම්පත්)
          </span>
        </div>

        <div className="w-9" />
      </div>

      {/* Application Sections */}
      <div className="w-full max-w-[360px] mx-auto flex flex-col gap-6 sm:gap-8 py-6 z-10 my-auto">
        {APPLICATIONS.map((app) => (
          <div
            key={app.id}
            id={`card-${app.id}`}
            className="flex flex-col items-center text-center group"
          >
            {/* Title */}
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wider uppercase drop-shadow-md mb-3 px-2 leading-snug">
              <span>{app.title}</span>

              <span className="block text-xs font-bold text-amber-300/90 normal-case tracking-normal mt-0.5">
                ({app.subtitle})
              </span>
            </h2>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              
              {/* OPEN PDF */}
              <button
                id={`btn-open-pdf-${app.id}`}
                type="button"
                onClick={() => handleOpenPdf(app)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-800 shadow-md transition hover:scale-105 hover:shadow-lg"
              >
                <Eye size={20} />
                <span>OPEN PDF</span>
              </button>

              {/* DOWNLOAD PDF */}
              <button
                id={`btn-download-${app.id}`}
                type="button"
                onClick={() => handleDownload(app)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-800 shadow-md transition hover:scale-105 hover:shadow-lg"
              >
                <Download size={20} />
                <span>DOWNLOAD</span>
              </button>

              {/* SHARE PDF */}
              <button
                id={`btn-share-${app.id}`}
                type="button"
                onClick={() => handleShare(app)}
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-800 shadow-md transition hover:scale-105 hover:shadow-lg"
              >
                <Share2 size={20} />
                <span>SHARE</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom info indicator */}
      <div className="pt-2 pb-3 text-center z-10">
        <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
          Official Documents • Verified for Sri Lankan Financial Standards
        </p>
      </div>

      {/* Interactive Printable Application Form Modal */}
      {activeModalApp && (
        <ApplicationFormModal
          application={activeModalApp}
          onClose={() => setActiveModalApp(null)}
          onPrint={handlePrint}
        />
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};