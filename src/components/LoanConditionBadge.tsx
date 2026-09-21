import React, { useState } from 'react';
import { useLoanConditions } from '../utils/loanConditionsStorage';
import { ShieldCheck, ChevronDown, ChevronUp, X, Info, Maximize2 } from 'lucide-react';

interface LoanConditionBadgeProps {
  loanTypeId: string;
  variant?: 'dark' | 'light';
  propertyYears?: number;
  onSelectPropertyYears?: (years: number) => void;
}

export const LoanConditionBadge: React.FC<LoanConditionBadgeProps> = ({
  loanTypeId,
  variant = 'light',
  propertyYears = 15,
  onSelectPropertyYears,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const { conditions, conditionsMap } = useLoanConditions();
  const info = conditionsMap[loanTypeId];
  const propertyTiers = conditions['property-loan']?.propertyTiers;

  if (!info) return null;

  const isDark = variant === 'dark';

  return (
    <div className="w-full mt-2">
      {/* 1. Screen Message Bar under the Loan Type (Always visible when a loan type is selected) */}
      <div
        className={`w-full p-2 px-3 rounded-2xl transition-all border flex items-center justify-between gap-2 shadow-xs cursor-pointer select-none ${
          isDark
            ? isOpen
              ? 'bg-[#0a1845] border-sky-400/80 text-white'
              : 'bg-[#081232]/90 hover:bg-[#0c1a4b] border-amber-400/60 text-sky-100 hover:border-amber-300'
            : isOpen
            ? 'bg-sky-50 border-sky-300 text-slate-900'
            : 'bg-linear-to-r from-amber-50 via-sky-50 to-amber-50/60 hover:from-amber-100/80 hover:to-sky-100 border-amber-300/80 text-slate-800 hover:border-amber-400'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-lg font-black text-[11px] tracking-wider uppercase bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
            CONDITIONS
          </span>
          <span className="text-xs font-extrabold truncate">
            {info.name} <span className="font-semibold opacity-85">({info.subtitle}) කොන්දේසි</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[11px] font-black px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
              isOpen
                ? isDark
                  ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                  : 'bg-sky-100 text-sky-900 border border-sky-300'
                : isDark
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {isOpen ? (
              <>
                <span>සඟවන්න (Close)</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>විස්තර බලන්න (View Details)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </span>
        </div>
      </div>

      {/* 2. Expanded Conditions Card (Shown when clicked) */}
      {isOpen && (
        <div
          className={`w-full mt-1.5 p-3 rounded-2xl transition-all border animate-in fade-in-50 duration-200 ${
            isDark
              ? 'bg-[#0a1845]/95 border-sky-400/50 text-slate-100 shadow-lg'
              : 'bg-linear-to-r from-sky-50 via-indigo-50/70 to-blue-50 border-sky-200/90 text-slate-800 shadow-xs'
          }`}
        >
          {/* Header with Title and Type */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-sky-300/30 text-xs">
            <div className="flex items-center gap-1.5 font-black tracking-tight">
              <ShieldCheck className={`w-4 h-4 shrink-0 ${isDark ? 'text-sky-300' : 'text-sky-600'}`} />
              <span className={isDark ? 'text-sky-100 font-extrabold' : 'text-sky-950 font-extrabold'}>
                {info.name} — කොන්දේසි හා සීමාවන්
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                title="විශාල තිර පණිවිඩයක් ලෙස පෙන්වන්න (View as Popup)"
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-sky-950/60 hover:bg-sky-900 text-sky-200 border border-sky-400/30'
                    : 'bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs'
                }`}
              >
                <Maximize2 className="w-3 h-3" />
                <span>Popup Msg</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-0.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-sky-100'
                }`}
                title="සඟවන්න (Close)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conditions Grid */}
          <div className="grid grid-cols-3 gap-1.5 pt-2">
            {/* Max Limit */}
            <div
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border ${
                isDark
                  ? 'bg-slate-900/70 border-slate-700/60'
                  : 'bg-white/95 border-sky-100 shadow-2xs'
              }`}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                උපරිම ණය මුදල
              </span>
              <span className={`text-xs sm:text-sm font-black mt-0.5 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                {info.maxLimitText}
              </span>
            </div>

            {/* Max Tenure */}
            <div
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border ${
                isDark
                  ? 'bg-slate-900/70 border-slate-700/60'
                  : 'bg-white/95 border-sky-100 shadow-2xs'
              }`}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                උපරිම කාලසීමාව
              </span>
              <span className={`text-xs sm:text-sm font-black mt-0.5 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                {info.maxTenureText}
              </span>
            </div>

            {/* Interest Rate */}
            <div
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border ${
                isDark
                  ? 'bg-slate-900/70 border-slate-700/60'
                  : 'bg-white/95 border-sky-100 shadow-2xs'
              }`}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                පොලී අනුපාතිකය
              </span>
              <span className={`text-xs sm:text-sm font-black mt-0.5 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {info.rateText}
              </span>
            </div>
          </div>

          {info.extraNote && (
            <div className="mt-2 text-center">
              <span
                className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isDark ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30' : 'bg-white/90 text-sky-900 border border-sky-200 shadow-2xs'
                }`}
              >
                ℹ️ {info.extraNote}
              </span>
            </div>
          )}

          {/* Special Tier Selector / Breakdown for Property Loan */}
          {loanTypeId === 'property-loan' && (
            <div className="mt-2 pt-2 border-t border-sky-300/20 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={isDark ? 'text-sky-200' : 'text-sky-900'}>
                  කාලසීමාව අනුව පොලී අනුපාතිකය (Tenure Tiers):
                </span>
                <span className={`text-[10px] ${isDark ? 'text-amber-300' : 'text-amber-700'} font-black`}>
                  උපරිම කාලය වසර 25
                </span>
              </div>
              {onSelectPropertyYears ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { years: 15, rate: propertyTiers?.tier1Rate ?? 5, label: '≤ වසර 15 (මාස 180)' },
                    { years: 20, rate: propertyTiers?.tier2Rate ?? 5.5, label: 'වසර 15 - 20' },
                    { years: 25, rate: propertyTiers?.tier3Rate ?? 6, label: 'වසර 20 - 25' },
                  ].map((tier) => (
                    <button
                      key={tier.years}
                      type="button"
                      onClick={() => onSelectPropertyYears(tier.years)}
                      className={`py-1.5 px-1 rounded-xl text-center font-black text-xs transition-all cursor-pointer ${
                        propertyYears === tier.years
                          ? isDark
                            ? 'bg-linear-to-r from-sky-400 to-teal-400 text-slate-950 shadow-md ring-2 ring-sky-300'
                            : 'bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-sm ring-2 ring-sky-300'
                          : isDark
                          ? 'bg-slate-800/80 text-sky-200 hover:bg-slate-700/80 border border-sky-400/30'
                          : 'bg-white text-slate-700 hover:bg-sky-50 border border-sky-200'
                      }`}
                    >
                      <div className="leading-tight text-[11px]">{tier.label}</div>
                      <div className="text-[10px] font-black opacity-90">{tier.rate}% පොලිය</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-black">
                  <div
                    className={`py-1 px-1 rounded-lg border ${
                      isDark ? 'bg-slate-900/60 border-slate-700 text-sky-200' : 'bg-white border-sky-200 text-slate-700'
                    }`}
                  >
                    ≤ වසර 15 → <span className="text-emerald-600 font-extrabold">{propertyTiers?.tier1Rate ?? 5}%</span>
                  </div>
                  <div
                    className={`py-1 px-1 rounded-lg border ${
                      isDark ? 'bg-slate-900/60 border-slate-700 text-sky-200' : 'bg-white border-sky-200 text-slate-700'
                    }`}
                  >
                    වසර 15 - 20 → <span className="text-amber-600 font-extrabold">{propertyTiers?.tier2Rate ?? 5.5}%</span>
                  </div>
                  <div
                    className={`py-1 px-1 rounded-lg border ${
                      isDark ? 'bg-slate-900/60 border-slate-700 text-sky-200' : 'bg-white border-sky-200 text-slate-700'
                    }`}
                  >
                    වසර 20 - 25 → <span className="text-red-600 font-extrabold">{propertyTiers?.tier3Rate ?? 6}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Screen Message Modal (Popup Dialog Option) */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-sky-200 text-slate-800 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl font-black text-xs uppercase bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                  CONDITIONS
                </span>
                <span className="font-black text-sm text-slate-900">
                  {info.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {info.subtitle} — ණය කොන්දේසි හා සීමාවන්
            </div>

            {/* Conditions Box */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-[10px] font-extrabold text-amber-800 uppercase">උපරිම ණය මුදල</div>
                <div className="text-sm font-black text-amber-950 mt-1">{info.maxLimitText}</div>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-center">
                <div className="text-[10px] font-extrabold text-cyan-800 uppercase">උපරිම කාලසීමාව</div>
                <div className="text-sm font-black text-cyan-950 mt-1">{info.maxTenureText}</div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[10px] font-extrabold text-emerald-800 uppercase">පොලී අනුපාතිකය</div>
                <div className="text-sm font-black text-emerald-950 mt-1">{info.rateText}</div>
              </div>
            </div>

            {info.extraNote && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{info.extraNote}</span>
              </div>
            )}

            {loanTypeId === 'property-loan' && (
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs space-y-1.5">
                <div className="font-extrabold text-sky-950">කාලසීමාව අනුව පොලී අනුපාතික:</div>
                <div className="grid grid-cols-3 gap-1 text-center font-black text-[11px]">
                  <div className="p-1.5 bg-white rounded-lg border border-sky-200 text-slate-800">
                    ≤ වසර 15<br/><span className="text-emerald-600 text-xs">{propertyTiers?.tier1Rate ?? 5}%</span>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-sky-200 text-slate-800">
                    වසර 15 - 20<br/><span className="text-amber-600 text-xs">{propertyTiers?.tier2Rate ?? 5.5}%</span>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-sky-200 text-slate-800">
                    වසර 20 - 25<br/><span className="text-red-600 text-xs">{propertyTiers?.tier3Rate ?? 6}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal OK button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-2xl bg-linear-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-black text-xs shadow-md cursor-pointer transition-all"
            >
              තහවුරු කර වසන්න (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

