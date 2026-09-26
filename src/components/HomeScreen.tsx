import React, { useState } from 'react';
import { ScreenType } from '../types';
import { HeaderIllustration } from './HeaderIllustration';
import { PWAInstallButton } from './PWAInstallButton';
import { SettingsModal } from './SettingsModal';
import { Calculator, FileSpreadsheet, FileText, ChevronRight, Settings as SettingsIcon } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  return (
    <div
      id="home-screen"
      className="relative w-full min-h-full flex flex-col justify-between overflow-y-auto px-4 sm:px-5 select-none"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 8px), 16px)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 12px), 20px)',
        backgroundColor: '#e6eff5',
        backgroundImage: `
          radial-gradient(circle at 100% 40%, rgba(14, 165, 233, 0.22) 0%, transparent 60%),
          radial-gradient(circle at 95% 55%, rgba(2, 132, 199, 0.28) 0%, transparent 50%),
          radial-gradient(circle at 85% 75%, rgba(3, 105, 161, 0.2) 0%, transparent 45%),
          radial-gradient(circle at 15% 15%, rgba(254, 215, 170, 0.3) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(225, 238, 246, 0.95) 100%)
        `
      }}
    >
      {/* Top Right Corner SETTINGS Button */}
      <button
        id="btn-home-settings"
        type="button"
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-2.5 right-3.5 z-30 py-1.5 px-3 rounded-full bg-linear-to-r from-[#0a2540] via-[#12396b] to-[#0a2540] text-white hover:text-amber-300 border border-sky-400/50 hover:border-amber-400 shadow-md flex items-center gap-1.5 text-xs font-black tracking-wider transition-all cursor-pointer active:scale-95 group select-none"
        style={{
          boxShadow: '0 4px 12px rgba(10,37,64,0.3)',
        }}
      >
        <SettingsIcon className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        <span>SETTINGS</span>
      </button>

      {/* Settings Modal (Condition Tab) */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Subtle decorative ink flecks on right side like in screenshot */}
      <div
        className="absolute inset-y-0 right-0 w-2/5 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#0369a1 1px, transparent 1px), radial-gradient(#0ea5e9 1.5px, transparent 1.5px)`,
          backgroundSize: '18px 18px, 24px 24px',
          backgroundPosition: '0 0, 9px 12px',
        }}
      />

      {/* Top illustration */}
      <div className="pt-2 z-10">
        <HeaderIllustration />
      </div>

      {/* Title section */}
      <div className="my-auto py-3 text-center z-10 flex flex-col items-center">
        <h1
          id="home-title"
          className="font-black tracking-wider leading-tight text-3xl sm:text-4xl uppercase flex flex-col items-center"
        >
          <div className="flex items-center justify-center gap-2.5">
            <span
              className="inline-flex items-center justify-center px-3.5 py-1 rounded-xl bg-linear-to-br from-[#0a2540] via-[#12396b] to-[#0a2540] text-amber-300 border-2 border-amber-400/80 shadow-[0_4px_16px_rgba(10,37,64,0.35)] font-black text-2xl sm:text-3xl tracking-widest ring-2 ring-amber-400/20"
              style={{
                textShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
              }}
            >
              UD
            </span>
            <span className="font-black text-2xl sm:text-3xl tracking-wider uppercase text-[#0d3b66] drop-shadow-sm">
              LOAN
            </span>
          </div>
          <div
            className="mt-1 text-2xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-sm"
            style={{
              background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CALCULATER
          </div>
        </h1>
      </div>

      {/* 3 Main Action Buttons with Professional Financial Theme */}
      <div className="w-full max-w-[340px] mx-auto flex flex-col gap-3.5 z-10 pb-10">
        {/* 1. LOAN CALCULATER BUTTON */}
        <button
          id="btn-nav-loan-calculator"
          onClick={() => onNavigate('loan-calculator')}
          className="group relative w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-[#0b2545] via-[#12396b] to-[#0b2545] hover:from-[#0e2e56] hover:via-[#174783] hover:to-[#0e2e56] active:scale-[0.98] transition-all duration-200 border-2 border-sky-400/40 hover:border-sky-300 shadow-[0_8px_20px_rgba(11,37,69,0.35)] flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-inner group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-base sm:text-lg tracking-wider uppercase text-white leading-tight">
                LOAN CALCULATER
              </span>
              <span className="text-[11px] font-semibold text-sky-200/90 tracking-normal mt-0.5">
                මාසික වාරික හා පොලී ගණනය (EMI & Interest)
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-sky-300 group-hover:translate-x-1 transition-transform shrink-0 opacity-80 group-hover:opacity-100" />
        </button>

        {/* 2. PAY SHEET CALCULATER BUTTON */}
        <button
          id="btn-nav-paysheet-calculator"
          onClick={() => onNavigate('paysheet-calculator')}
          className="group relative w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-[#042f2e] via-[#0d5553] to-[#042f2e] hover:from-[#063c3b] hover:via-[#116664] hover:to-[#063c3b] active:scale-[0.98] transition-all duration-200 border-2 border-emerald-400/40 hover:border-emerald-300 shadow-[0_8px_20px_rgba(4,47,46,0.35)] flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-base sm:text-lg tracking-wider uppercase text-white leading-tight">
                PAY SHEET CALCULATER
              </span>
              <span className="text-[11px] font-semibold text-emerald-200/90 tracking-normal mt-0.5">
                40% වැටුප් සීමාව හා ණය ධාරිතාව (40% Capacity)
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0 opacity-80 group-hover:opacity-100" />
        </button>

        {/* 3. APPLICATIONS BUTTON */}
        <button
          id="btn-nav-applications"
          onClick={() => onNavigate('applications')}
          className="group relative w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-[#1b222c] via-[#2a3443] to-[#1b222c] hover:from-[#212935] hover:via-[#333e50] hover:to-[#212935] active:scale-[0.98] transition-all duration-200 border-2 border-amber-400/40 hover:border-amber-300 shadow-[0_8px_20px_rgba(27,34,44,0.35)] flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-base sm:text-lg tracking-wider uppercase text-white leading-tight">
                APPLICATIONS
              </span>
              <span className="text-[11px] font-semibold text-amber-200/90 tracking-normal mt-0.5">
                ණය අයදුම්පත් බාගත කිරීම (Download Forms)
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0 opacity-80 group-hover:opacity-100" />
        </button>

        {/* PWA Home Screen Install Banner (auto-hides when installed) */}
        <PWAInstallButton variant="banner" className="mt-2.5 z-10" />
      </div>

      {/* Bottom badge: Designed & Developed by Udara */}
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none">
        <div
          className="px-5 pt-3.5 pb-2.5 pr-8 rounded-tr-3xl bg-linear-to-r from-[#93d4d4]/90 to-[#a8dede]/90 backdrop-blur-xs shadow-sm border-t border-r border-[#6fb9b9]/60 flex items-center gap-1.5"
        >
          <span className="text-xs font-bold text-slate-800 tracking-wide">
            Designed & Developed by <span className="font-extrabold text-slate-950">Udara</span>
          </span>
        </div>
      </div>
    </div>
  );
};
