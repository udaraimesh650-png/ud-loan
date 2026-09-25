import React, { useState, useMemo, useEffect } from 'react';
import { Home, AlertTriangle, ChevronDown, Calculator, ArrowRight, ExternalLink } from 'lucide-react';
import { calculateReachableLoanAmount, formatLKR } from '../utils/loanMath';
import { useLoanConditions, getDynamicPropertyLoanRate } from '../utils/loanConditionsStorage';
import { LoanConditionBadge } from './LoanConditionBadge';

interface PaySheetCalculatorScreenProps {
  onGoHome: () => void;
  onNavigateToLoanCalculator?: (params: {
    loanType: string;
    amount: number;
    months: number;
    balanceAfterDeduction?: number;
    bankDeductionsTotal?: number;
  }) => void;
  customInstallmentFromLoanCalc?: number | null;
  onClearCustomInstallment?: () => void;
}

const PAYSHEET_STORAGE_KEY = 'ud_paysheet_saved_data';
const getMonthsUntilAge60 = (
  birthdayValue: string
): number | null => {
  if (!birthdayValue) return null;

  const parts = birthdayValue.split('/');

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1900 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const dob = new Date(year, month - 1, day);

  if (
    dob.getFullYear() !== year ||
    dob.getMonth() !== month - 1 ||
    dob.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();

  const age60Date = new Date(dob);

  age60Date.setFullYear(
    age60Date.getFullYear() + 60
  );

  if (today >= age60Date) {
    return 0;
  }

  let months =
    (age60Date.getFullYear() - today.getFullYear()) * 12 +
    (age60Date.getMonth() - today.getMonth());

  if (age60Date.getDate() < today.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
};


const getInitialSavedPaySheet = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PAYSHEET_STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
};

export const PAY_SHEET_LOAN_RULES: Record<
  string,
  { maxMonths: number; rate: number; name: string; maxLimit?: number }
> = {
  'festivel-loan': { maxMonths: 18, rate: 8, name: 'FESTIVEL LOAN', maxLimit: 500000 },
  'guarantee-loan': { maxMonths: 84, rate: 6, name: 'GUARANTEE LOAN', maxLimit: 1000000 },
  'commodity-goods-loan': { maxMonths: 48, rate: 8, name: 'COMMODITY / GOODS LOAN', maxLimit: 500000 },
  'fixed-deposit-loan': { maxMonths: 10, rate: 6, name: 'FIXED DEPOSIT LOAN' },
  'property-loan': { maxMonths: 180, rate: 5, name: 'PROPERTY LOAN', maxLimit: 5000000 },
  'spectacal-goods-loan': { maxMonths: 24, rate: 8, name: 'SPECTACAL/GOODS LOAN', maxLimit: 30000 },
};

export const PaySheetCalculatorScreen: React.FC<PaySheetCalculatorScreenProps> = ({
  onGoHome,
  onNavigateToLoanCalculator,
  customInstallmentFromLoanCalc,
  onClearCustomInstallment,
}) => {
  const { conditions, loanTypesList } = useLoanConditions();
  const initialData = useMemo(() => getInitialSavedPaySheet(), []);

  const [selectedLoanType, setSelectedLoanType] = useState<string>(
    initialData?.selectedLoanType || ''
  );

  const [propertyLoanYears, setPropertyLoanYears] = useState<number>(15);

  const [guaranteeLoanYears, setGuaranteeLoanYears] = useState<string>(
    initialData?.guaranteeLoanYears || ''
  );

  const [basicSalary, setBasicSalary] = useState<string>(
    initialData?.basicSalary || ''
  );

  const [birthday, setBirthday] = useState<string>(
    initialData?.birthday || ''
  );

  const [deduction1, setDeduction1] = useState<string>(initialData?.deduction1 || '');
  const [deduction2, setDeduction2] = useState<string>(initialData?.deduction2 || '');
  const [deduction3, setDeduction3] = useState<string>(initialData?.deduction3 || '');
  const [deduction4, setDeduction4] = useState<string>(initialData?.deduction4 || '');
  const [deduction5, setDeduction5] = useState<string>(initialData?.deduction5 || '');
  const [deduction6_1, setDeduction6_1] = useState<string>(
    initialData?.deduction6_1 || initialData?.deduction6 || ''
  );
  const [deduction6_2, setDeduction6_2] = useState<string>(
    initialData?.deduction6_2 || ''
  );
  const [deduction7, setDeduction7] = useState<string>(
    initialData?.deduction7 || ''
  );
  const [deduction8_1, setDeduction8_1] = useState<string>(
    initialData?.deduction8_1 || initialData?.deduction8 || ''
  );
  const [deduction8_2, setDeduction8_2] = useState<string>(
    initialData?.deduction8_2 || ''
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        PAYSHEET_STORAGE_KEY,
        JSON.stringify({
          selectedLoanType,
          guaranteeLoanYears,
          basicSalary,
          birthday,
          deduction1,
          deduction2,
          deduction3,
          deduction4,
          deduction5,
          deduction6_1,
          deduction6_2,
          deduction7,
          deduction8_1,
          deduction8_2,
        })
      );
    } catch (e) {
      // ignore
    }
  }, [
    selectedLoanType,
    guaranteeLoanYears,
    basicSalary,
    birthday,
    deduction1,
    deduction2,
    deduction3,
    deduction4,
    deduction5,
    deduction6_1,
    deduction6_2,
    deduction7,
    deduction8_1,
    deduction8_2,
  ]);

  const age60RemainingMonths = useMemo(
    () => getMonthsUntilAge60(birthday),
    [birthday]
  );

  const currentLoanConfig = useMemo(() => {
    if (!selectedLoanType) return null;

    const cond = conditions[selectedLoanType];

    if (!cond) return null;

    if (selectedLoanType === 'property-loan') {
      const baseMonths = propertyLoanYears * 12;

      const months =
        age60RemainingMonths !== null
          ? Math.min(baseMonths, age60RemainingMonths)
          : baseMonths;

      const dynamicRate = getDynamicPropertyLoanRate(
        months,
        cond.propertyTiers
      );

      return {
        name: cond.name,
        maxMonths: months,
        rate: dynamicRate,
        maxLimit: cond.maxLimit,
      };
    }

    if (selectedLoanType === 'guarantee-loan') {
      const yearsText = guaranteeLoanYears.trim();

      if (yearsText === '') {
        return null;
      }

      const years = Number(yearsText);

      if (!Number.isFinite(years) || years < 0) {
        return null;
      }

      const tiers = cond.guaranteeTiers;

      if (!tiers) {
        return {
          name: cond.name,
          maxMonths:
            age60RemainingMonths !== null
              ? Math.min(
                  cond.maxPeriodMonths,
                  age60RemainingMonths
                )
              : cond.maxPeriodMonths,
          rate: cond.defaultRate,
          maxLimit: cond.maxLimit,
        };
      }

      if (years <= tiers.tier1MaxYears) {
        return {
          name: cond.name,
          maxMonths:
            age60RemainingMonths !== null
              ? Math.min(
                  tiers.tier1MaxPeriodMonths,
                  age60RemainingMonths
                )
              : tiers.tier1MaxPeriodMonths,
          rate: cond.defaultRate,
          maxLimit: tiers.tier1MaxLimit,
        };
      }

      if (years <= tiers.tier2MaxYears) {
        return {
          name: cond.name,
          maxMonths:
            age60RemainingMonths !== null
              ? Math.min(
                  tiers.tier2MaxPeriodMonths,
                  age60RemainingMonths
                )
              : tiers.tier2MaxPeriodMonths,
          rate: cond.defaultRate,
          maxLimit: tiers.tier2MaxLimit,
        };
      }

      return {
        name: cond.name,
        maxMonths:
          age60RemainingMonths !== null
            ? Math.min(
                tiers.tier3MaxPeriodMonths,
                age60RemainingMonths
              )
            : tiers.tier3MaxPeriodMonths,
        rate: cond.defaultRate,
        maxLimit: tiers.tier3MaxLimit,
      };
    }

    return {
      name: cond.name,
      maxMonths:
        age60RemainingMonths !== null
          ? Math.min(
              cond.maxPeriodMonths,
              age60RemainingMonths
            )
          : cond.maxPeriodMonths,
      rate: cond.defaultRate,
      maxLimit: cond.maxLimit,
    };
  }, [
    selectedLoanType,
    propertyLoanYears,
    guaranteeLoanYears,
    conditions,
    age60RemainingMonths,
  ]);
const isGuaranteeMembershipMissing =
    selectedLoanType === 'guarantee-loan' &&
    guaranteeLoanYears.trim() === '';

  const parsedGuaranteeLoanYears =
    guaranteeLoanYears.trim() !== ''
      ? Number(guaranteeLoanYears)
      : NaN;

  const isGuaranteeMembershipInvalid =
    selectedLoanType === 'guarantee-loan' &&
    guaranteeLoanYears.trim() !== '' &&
    (!Number.isFinite(parsedGuaranteeLoanYears) ||
      parsedGuaranteeLoanYears < 0);

  const parsedBasic =
    parseFloat(basicSalary.replace(/,/g, '')) || 0;

  const d1 = parseFloat(deduction1.replace(/,/g, '')) || 0;
  const d2 = parseFloat(deduction2.replace(/,/g, '')) || 0;
  const d3 = parseFloat(deduction3.replace(/,/g, '')) || 0;
  const d4 = parseFloat(deduction4.replace(/,/g, '')) || 0;
  const d5 = parseFloat(deduction5.replace(/,/g, '')) || 0;
  const d6_1 = parseFloat(deduction6_1.replace(/,/g, '')) || 0;
  const d6_2 = parseFloat(deduction6_2.replace(/,/g, '')) || 0;
  const d7 = parseFloat(deduction7.replace(/,/g, '')) || 0;
  const d8_1 = parseFloat(deduction8_1.replace(/,/g, '')) || 0;
  const d8_2 = parseFloat(deduction8_2.replace(/,/g, '')) || 0;

  const hasAtLeastOneDeduction = useMemo(() => {
    return [
      deduction1,
      deduction2,
      deduction3,
      deduction4,
      deduction5,
      deduction6_1,
      deduction6_2,
      deduction7,
      deduction8_1,
      deduction8_2,
    ].some((val) => {
      const clean = val.replace(/,/g, '').trim();
      return clean !== '' && !isNaN(Number(clean));
    });
  }, [
    deduction1,
    deduction2,
    deduction3,
    deduction4,
    deduction5,
    deduction6_1,
    deduction6_2,
    deduction7,
    deduction8_1,
    deduction8_2,
  ]);

  const fortyPercentLimit = useMemo(() => {
    return Math.round(parsedBasic * 0.4);
  }, [parsedBasic]);

  const totalDeductions = useMemo(() => {
    return Math.round(
      d1 +
        d2 +
        d3 +
        d4 +
        d5 +
        d6_1 +
        d6_2 +
        d7 +
        d8_1 +
        d8_2
    );
  }, [
    d1,
    d2,
    d3,
    d4,
    d5,
    d6_1,
    d6_2,
    d7,
    d8_1,
    d8_2,
  ]);

  const balanceAfterDeduction = useMemo(() => {
    if (!hasAtLeastOneDeduction) return 0;

    return Math.round(
      fortyPercentLimit - totalDeductions
    );
  }, [
    fortyPercentLimit,
    totalDeductions,
    hasAtLeastOneDeduction,
  ]);

  const bankDeductionsTotal = useMemo(() => {
    return Math.round(
      d2 +
        d4 +
        d6_1 +
        d6_2 +
        d8_1 +
        d8_2
    );
  }, [
    d2,
    d4,
    d6_1,
    d6_2,
    d8_1,
    d8_2,
  ]);

  const reachableLoanAmount = useMemo(() => {
    if (
      !hasAtLeastOneDeduction ||
      balanceAfterDeduction <= 0 ||
      !currentLoanConfig
    ) {
      return 0;
    }

    const calculated = calculateReachableLoanAmount(
      balanceAfterDeduction,
      currentLoanConfig.rate,
      currentLoanConfig.maxMonths
    );

    if (
      currentLoanConfig.maxLimit &&
      calculated > currentLoanConfig.maxLimit
    ) {
      return currentLoanConfig.maxLimit;
    }

    return calculated;
  }, [
    hasAtLeastOneDeduction,
    balanceAfterDeduction,
    currentLoanConfig,
  ]);

  const reachableMonthlyInstallment = useMemo(() => {
    if (
      reachableLoanAmount <= 0 ||
      !currentLoanConfig ||
      currentLoanConfig.maxMonths <= 0
    ) {
      return 0;
    }

    return Math.round(
      reachableLoanAmount / currentLoanConfig.maxMonths
    );
  }, [reachableLoanAmount, currentLoanConfig]);

  const reachableMonthlyInterest = useMemo(() => {
    if (
      reachableLoanAmount <= 0 ||
      !currentLoanConfig
    ) {
      return 0;
    }

    return Math.round(
      (reachableLoanAmount * currentLoanConfig.rate) /
        1200
    );
  }, [reachableLoanAmount, currentLoanConfig]);

  const reachableTotalMonthly = useMemo(() => {
    return (
      reachableMonthlyInstallment +
      reachableMonthlyInterest
    );
  }, [
    reachableMonthlyInstallment,
    reachableMonthlyInterest,
  ]);

  const effectiveTotalOfInstallment = useMemo(() => {
    if (
      customInstallmentFromLoanCalc &&
      customInstallmentFromLoanCalc > 0
    ) {
      return customInstallmentFromLoanCalc;
    }

    return reachableTotalMonthly;
  }, [
    customInstallmentFromLoanCalc,
    reachableTotalMonthly,
  ]);

  const paySheetDeductionOfMonth = useMemo(() => {
    if (!hasAtLeastOneDeduction) return 0;

    return Math.round(
      bankDeductionsTotal +
        effectiveTotalOfInstallment
    );
  }, [
    bankDeductionsTotal,
    effectiveTotalOfInstallment,
    hasAtLeastOneDeduction,
  ]);

  const isCappedAtMaxLimit = useMemo(() => {
    if (
      balanceAfterDeduction <= 0 ||
      !currentLoanConfig ||
      !currentLoanConfig.maxLimit
    ) {
      return false;
    }

    const rawCalc = calculateReachableLoanAmount(
      balanceAfterDeduction,
      currentLoanConfig.rate,
      currentLoanConfig.maxMonths
    );

    return rawCalc >= currentLoanConfig.maxLimit;
  }, [
    balanceAfterDeduction,
    currentLoanConfig,
  ]);

  const handleClearAll = () => {
    onClearCustomInstallment?.();

    setSelectedLoanType('');
    setGuaranteeLoanYears('');
    setBasicSalary('');
    setBirthday('');
    setDeduction1('');
    setDeduction2('');
    setDeduction3('');
    setDeduction4('');
    setDeduction5('');
    setDeduction6_1('');
    setDeduction6_2('');
    setDeduction7('');
    setDeduction8_1('');
    setDeduction8_2('');

    try {
      localStorage.removeItem(
        PAYSHEET_STORAGE_KEY
      );
    } catch (e) {
      // ignore
    }
  };

  return (
    <div
      id="paysheet-calculator-screen"
      className="relative min-h-full flex flex-col justify-between overflow-y-auto px-4 sm:px-6 select-none"
      style={{
        paddingTop:
          'max(calc(env(safe-area-inset-top, 0px) + 12px), 20px)',
        paddingBottom:
          'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 20px)',
        backgroundColor: '#1b3b5a',
        backgroundImage: `
          radial-gradient(circle at 50% 20%, rgba(30, 64, 175, 0.4) 0%, transparent 60%),
          radial-gradient(circle at 20% 80%, rgba(14, 116, 144, 0.35) 0%, transparent 60%),
          linear-gradient(180deg, #1b3d5b 0%, #17324d 50%, #0f2236 100%)
        `,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 4px)`,
        }}
      />

      <div className="flex items-center justify-between pb-3 border-b border-sky-800/60 z-10">
        <button
          id="btn-paysheet-calc-home"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleClearAll();
            onGoHome();
          }}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-all text-cyan-400 cursor-pointer touch-manipulation z-30 p-2.5 -m-2.5 rounded-2xl hover:bg-white/5 active:bg-white/10"
          title="Go to Home"
          aria-label="Home"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg text-white group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 fill-current" />
          </div>

          <span className="text-[11px] font-extrabold tracking-wider uppercase text-cyan-200 group-hover:text-cyan-100 transition-colors">
            Home
          </span>
        </button>

        <h1
          id="paysheet-calc-title"
          className="text-xl sm:text-2xl font-black tracking-wider text-center uppercase"
          style={{
            color: '#4ade80',
            textShadow:
              '0 2px 4px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.04em',
            fontFamily:
              'system-ui, -apple-system, sans-serif',
          }}
        >
          PAY SHEET CALCULATOR
        </h1>

        <div className="w-9" />
      </div>

      <div className="w-full max-w-[360px] mx-auto flex flex-col gap-4 py-4 z-10">

        <div className="flex flex-col items-center text-center gap-1.5">
          <label className="text-sm font-black text-white tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5 justify-center flex-wrap">
            <span>LOAN TYPE</span>

            <span className="text-xs font-semibold text-cyan-200 normal-case">
              (ණය �?ර�S�oය)
            </span>

            <span className="text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-400/60 px-2 py-0.5 rounded-full tracking-normal normal-case">
              * �.න�'�?ාර�Sයය�' (Required)
            </span>
          </label>

          <div className="relative w-full">
            <select
              id="input-paysheet-loan-type"
              value={selectedLoanType}
              onChange={(e) => {
                setSelectedLoanType(e.target.value);

                if (e.target.value !== 'guarantee-loan') {
                  setGuaranteeLoanYears('');
                }
              }}
              className={`w-full py-3.5 px-5 rounded-full bg-white text-slate-800 font-extrabold text-sm text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.2)] appearance-none cursor-pointer transition-all ${
                parsedBasic > 0 && !selectedLoanType
                  ? 'border-2 border-amber-400 ring-2 ring-amber-400/50'
                  : 'border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400'
              }`}
            >
              <option
                value=""
                className="text-slate-400 font-bold"
              >
                -- ණය �?ර�S�oය තෝරන�Sන (Select Loan Type) * --
              </option>

              {loanTypesList.map((type) => (
                <option
                  key={type.id}
                  value={type.id}
                >
                  {type.name} ({type.subtitle})
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {selectedLoanType && (
            <LoanConditionBadge
              loanTypeId={selectedLoanType}
              variant="dark"
              propertyYears={propertyLoanYears}
              onSelectPropertyYears={setPropertyLoanYears}
            />
          )}

          {selectedLoanType === 'guarantee-loan' && (
            <div className="w-full mt-2 flex flex-col items-center gap-1.5">
              <label
                htmlFor="input-guarantee-membership-years"
                className="text-xs sm:text-sm font-black text-amber-200 tracking-wide"
              >
                �fාමාජ�'�sත�S�? �sාල �f�"මා�?
                <span className="ml-1 text-amber-300">
                  (Years) * �.න�'�?ාර�Sයය�'
                </span>
              </label>

              <div className="relative w-full">
                <input
                  id="input-guarantee-membership-years"
                  type="number"
                  min="0"
                  step="0.1"
                  value={guaranteeLoanYears}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === '') {
                      setGuaranteeLoanYears('');
                      return;
                    }

                    const num = Number(value);

                    if (
                      Number.isFinite(num) &&
                      num >= 0
                    ) {
                      setGuaranteeLoanYears(value);
                    }
                  }}
                  placeholder="�fාමාජ�'�sත�S�? �sාලය (Years) *"
                  className={`w-full py-3 px-5 rounded-full bg-white text-slate-900 font-black text-sm text-center border-2 focus:outline-none focus:ring-2 ${
                    isGuaranteeMembershipMissing ||
                    isGuaranteeMembershipInvalid
                      ? 'border-amber-400 focus:ring-amber-400'
                      : 'border-emerald-400 focus:ring-emerald-400'
                  }`}
                />

                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500">
                  YEARS
                </span>
              </div>

              {isGuaranteeMembershipMissing ? (
                <div className="text-[11px] font-bold text-amber-300 text-center">
                  �s� �fාමාජ�'�sත�S�? �sාල �f�"මා�? �?ත�"�.ත�S �s�'ර�"ම �.න�'�?ාර�Sයය�'.
                </div>
              ) : isGuaranteeMembershipInvalid ? (
                <div className="text-[11px] font-bold text-red-300 text-center">
                  �s� �sර�"ණා�sර න�'�?ැරද�' �fාමාජ�'�sත�S�? �sාල �f�"මා�?�s�S �?ත�"�.ත�S �sරන�Sන.
                </div>
              ) : (
                <div className="text-[11px] font-bold text-cyan-200 text-center">
                  {parsedGuaranteeLoanYears <= 2
                    ? '0 - 2 Years - Max Rs. 500,000 / 60 Months'
                    : parsedGuaranteeLoanYears <= 5
                    ? '>2-5 Years - Max Rs. 800,000 / 84 Months'
                    : '>5 Years �?' Max Rs. 1,000,000 / 84 Months'}
                </div>
              )}
            </div>
          )}

          {parsedBasic > 0 && !selectedLoanType && (
            <div className="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/60 text-amber-200 text-xs font-bold text-center mt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />

              <span>
                ණය ම�"දල �oණනය �s�'ර�"ම �fඳ�"ා ණය �?ර�S�oය (Loan Type) තෝරා�oන�Sන.
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center text-center gap-1.5">
          <label className="text-sm font-black text-white tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5 justify-center flex-wrap">
            <span>BASIC SALARY/GROSS SALARY</span>

            <span className="text-xs font-semibold text-cyan-200 normal-case">
              (ම�-ල�'�s �?ැට�"ප / ද�. �?ැට�"ප)
            </span>
          </label>

          <div className="relative w-full">
            <input
              id="input-basic-salary"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={basicSalary}
              onChange={(e) => {
                const raw = e.target.value.replace(
                  /[^0-9]/g,
                  ''
                );

                setBasicSalary(
                  raw
                    ? Number(raw).toLocaleString('en-US')
                    : ''
                );
              }}
              placeholder="-"
              className="w-full py-3.5 px-5 rounded-full bg-white text-slate-900 font-black text-base text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.2)] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rs.
            </div>
          </div>
        </div>


        <div className="flex flex-col items-center text-center gap-1.5">
          <label
            htmlFor="input-paysheet-birthday"
            className="text-sm font-black text-white tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5 justify-center flex-wrap"
          >
            <span>BIRTHDAY</span>

            <span className="text-xs font-semibold text-cyan-200 normal-case">
              (YYYY/MM/DD)
            </span>
          </label>

          <div className="relative w-full">
            <input
              id="input-paysheet-birthday"
              type="text"
              inputMode="numeric"
              value={birthday}
              onChange={(e) => {
                let value = e.target.value.replace(
                  /[^0-9]/g,
                  ''
                );

                if (value.length > 8) {
                  value = value.slice(0, 8);
                }

                if (value.length > 4) {
                  value =
                    value.slice(0, 4) +
                    '/' +
                    value.slice(4);
                }

                if (value.length > 7) {
                  value =
                    value.slice(0, 7) +
                    '/' +
                    value.slice(7);
                }

                setBirthday(value);
              }}
              placeholder="YYYY/MM/DD"
              maxLength={10}
              className="w-full py-3.5 px-5 rounded-full bg-white text-slate-900 font-black text-base text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.2)] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {birthday &&
            age60RemainingMonths !== null && (
              <div className="text-[11px] font-bold text-cyan-200 text-center">
                {age60RemainingMonths > 0
                  ? `Age 60 remaining: ${age60RemainingMonths} Months`
                  : 'Age 60 reached. No repayment period is available.'}
              </div>
            )}
        </div>
        <div className="flex flex-col items-center text-center gap-1.5">
          <label className="text-sm font-black text-white tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5 justify-center flex-wrap">
            <span>40% OF BASIC SALARY/GROSS SALARY</span>

            <span className="text-xs font-semibold text-cyan-200 normal-case">
              (ම�-ල�'�s / ද�. �?ැට�"ප�Tන�S 40% �s �f�"මා�?)
            </span>
          </label>

          <div
            id="display-40-percent"
            className="w-full py-3.5 px-5 rounded-full bg-white text-blue-900 font-black text-lg text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.2)] border-2 border-cyan-400"
          >
            {parsedBasic > 0
              ? formatLKR(fortyPercentLimit)
              : '-'}
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-2">
          <label className="text-sm font-black text-white tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5 justify-center flex-wrap">
            <span>DEDUCTION OF 40%</span>

            <span className="text-xs font-semibold text-cyan-200 normal-case">
              (40% �f�"මා�? ත�"�. දැනට ප�?ත�'න �.ඩ�"�s�'ර�"ම�S)
            </span>
          </label>

          <div
            id="rule-deduction-of-40"
            className={`w-full py-1 px-2.5 rounded-lg transition-all ${
              parsedBasic > 0 &&
              !hasAtLeastOneDeduction
                ? 'bg-amber-950/80 border border-amber-400/80 text-amber-200 shadow-xs animate-pulse'
                : 'bg-[#0c1e3d]/60 border border-cyan-500/25 text-cyan-200/90 shadow-xs'
            } flex items-center justify-center gap-1.5 text-center flex-wrap leading-tight`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 inline-block" />

            <span className="text-[11px] font-bold text-amber-300">
              Rule: Fill in at least 1 deduction field
            </span>

            <span className="text-[10px] font-medium text-amber-100/90">
              (�.�?ම �?ශය�Tන�S �'�s�S �.ඩ�"�s�'ර�"ම�S �s�S�,�sත�S�?�රය�s�S �"ෝ �fම�Sප�-ර�Sණ �s�. ය�"ත�"ය)
            </span>
          </div>

          <div className="w-full grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                id="input-deduction-1"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction1}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction1(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="PAY SHEET DEDUCTION"
                className={`w-full py-2 px-2 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[9px] xs:placeholder:text-[10px] sm:placeholder:text-xs tracking-tight`}
              />
            </div>

            <div className="relative">
              <input
                id="input-deduction-2"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction2}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction2(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="BANK DEDUCTION"
                className={`w-full py-2 px-2 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[9px] xs:placeholder:text-[10px] sm:placeholder:text-xs tracking-tight`}
              />
            </div>

            <div className="relative">
              <input
                id="input-deduction-3"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction3}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction3(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="PAY SHEET DEDUCTION"
                className={`w-full py-2 px-2 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[9px] xs:placeholder:text-[10px] sm:placeholder:text-xs tracking-tight`}
              />
            </div>

            <div className="relative">
              <input
                id="input-deduction-4"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction4}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction4(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="BANK DEDUCTION"
                className={`w-full py-2 px-2 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[9px] xs:placeholder:text-[10px] sm:placeholder:text-xs tracking-tight`}
              />
            </div>

            <div className="relative">
              <input
                id="input-deduction-5"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction5}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction5(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="PAY SHEET DEDUCTION"
                className={`w-full py-2 px-2 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[9px] xs:placeholder:text-[10px] sm:placeholder:text-xs tracking-tight`}
              />
            </div>

            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
              <input
                id="input-deduction-6-1"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction6_1}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction6_1(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="BANK DED."
                title="BANK DEDUCTION"
                className={`w-full py-2 px-1 rounded-full bg-white text-slate-900 font-bold text-xs text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[8px] xs:placeholder:text-[9px] sm:placeholder:text-[10px] tracking-tight`}
              />

              <input
                id="input-deduction-6-2"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction6_2}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction6_2(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="BANK DED."
                title="BANK DEDUCTION"
                className={`w-full py-2 px-1 rounded-full bg-white text-slate-900 font-bold text-xs text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[8px] xs:placeholder:text-[9px] sm:placeholder:text-[10px] tracking-tight`}
              />
            </div>

            <div className="relative">
              <input
                id="input-deduction-7"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction7}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction7(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="PAY SHEET DEDUCTION"
                className={`w-full py-2 px-2 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[9px] xs:placeholder:text-[10px] sm:placeholder:text-xs tracking-tight`}
              />
            </div>

            <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
              <input
                id="input-deduction-8-1"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction8_1}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction8_1(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="BANK DED."
                title="BANK DEDUCTION"
                className={`w-full py-2 px-1 rounded-full bg-white text-slate-900 font-bold text-xs text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[8px] xs:placeholder:text-[9px] sm:placeholder:text-[10px] tracking-tight`}
              />

              <input
                id="input-deduction-8-2"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={deduction8_2}
                onChange={(e) => {
                  const raw = e.target.value.replace(
                    /[^0-9]/g,
                    ''
                  );

                  setDeduction8_2(
                    raw
                      ? Number(raw).toLocaleString('en-US')
                      : ''
                  );
                }}
                placeholder="BANK DED."
                title="BANK DEDUCTION"
                className={`w-full py-2 px-1 rounded-full bg-white text-slate-900 font-bold text-xs text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] border transition-colors ${
                  parsedBasic > 0 &&
                  !hasAtLeastOneDeduction
                    ? 'border-amber-400/90 focus:ring-2 focus:ring-amber-400'
                    : 'border-slate-300 focus:ring-2 focus:ring-cyan-400'
                } focus:outline-none placeholder:text-slate-400 placeholder:font-semibold placeholder:italic italic placeholder:text-[8px] xs:placeholder:text-[9px] sm:placeholder:text-[10px] tracking-tight`}
              />
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-between px-3 text-xs font-extrabold text-cyan-200">
          <span>TOTAL DEDUCTIONS:</span>

          <span>
            {hasAtLeastOneDeduction
              ? formatLKR(totalDeductions)
              : parsedBasic > 0
              ? '(�.�?ම �?ශය�Tන�S 1�s�S �?ත�"�.ත�S �sරන�Sන)'
              : '-'}
          </span>
        </div>

        <div className="flex flex-col items-center text-center gap-1.5">
          <label className="text-sm font-black text-white tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5 justify-center flex-wrap">
            <span>BALANCE AFTER DEDUCTION</span>

            <span className="text-xs font-semibold text-cyan-200 normal-case">
              (�.ඩ�"�s�'ර�"ම�S�?ල�'න�S ප�f�" �?ත�'ර�' ශ�s�,ය)
            </span>

            {parsedBasic > 0 &&
              !hasAtLeastOneDeduction && (
                <span className="text-amber-300 text-xs font-semibold">
                  (�.ඩ�"�s�'ර�"ම�s�S �?ත�"�.ත�S �sරන�Sන)
                </span>
              )}

            {parsedBasic > 0 &&
              hasAtLeastOneDeduction &&
              balanceAfterDeduction < 0 && (
                <span className="text-red-400 text-xs font-semibold">
                  (Limit Exceeded)
                </span>
              )}
          </label>

          <div
            id="display-balance-after-deduction"
            className={`w-full py-3.5 px-5 rounded-full bg-white font-black text-lg text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.2)] border-2 ${
              parsedBasic > 0 &&
              !hasAtLeastOneDeduction
                ? 'text-amber-700 border-amber-300'
                : parsedBasic > 0 &&
                  balanceAfterDeduction < 0
                ? 'text-red-600 border-red-400'
                : 'text-emerald-700 border-emerald-400'
            }`}
          >
            {parsedBasic > 0 &&
            hasAtLeastOneDeduction
              ? formatLKR(balanceAfterDeduction)
              : '-'}
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-1.5 pt-2">
          <label className="text-sm sm:text-base font-black text-cyan-200 tracking-wider uppercase drop-shadow-md flex items-center gap-1.5 justify-center flex-wrap">
            <span>REACHABLE LOAN AMOUNT</span>

            <span className="text-xs sm:text-sm font-bold text-emerald-300 normal-case">
              (ලබා�oත �"ැ�s�' �<පර�'ම ණය ප�S�?�රමාණය)
            </span>
          </label>

          <div
            id="display-reachable-loan-amount"
            className={`w-full py-4 px-6 rounded-full font-black text-center flex items-center justify-center min-h-[64px] transition-all duration-300 ${
              parsedBasic > 0 &&
              !hasAtLeastOneDeduction
                ? 'bg-amber-950/50 border-2 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                : parsedBasic > 0 &&
                  balanceAfterDeduction < 0
                ? 'bg-linear-to-r from-red-600 via-rose-600 to-red-700 text-white border-2 border-red-300 shadow-[0_10px_25px_rgba(220,38,38,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)]'
                : selectedLoanType &&
                  parsedBasic > 0 &&
                  balanceAfterDeduction > 0 &&
                  !isGuaranteeMembershipMissing &&
                  !isGuaranteeMembershipInvalid
                ? 'bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-300 text-slate-950 border-2 border-emerald-100 shadow-[0_10px_30px_rgba(20,184,166,0.45),inset_0_2px_4px_rgba(255,255,255,0.7)]'
                : parsedBasic > 0 &&
                  balanceAfterDeduction > 0 &&
                  !selectedLoanType
                ? 'bg-amber-950/50 border-2 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                : 'bg-white/10 border-2 border-white/20 text-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
            }`}
          >
            {parsedBasic > 0 &&
            !hasAtLeastOneDeduction ? (
              <div className="flex flex-col items-center justify-center px-2 py-1 text-center">
                <span className="text-amber-300 font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  �.ඩ�"�s�'ර�"ම�S �s�'�f�'�?�s�S �?ත�"�.ත�S �sර න�oමැත
                </span>

                <span className="text-[11px] font-semibold text-amber-200/90 mt-0.5">
                  (�sර�"ණා�sර 40% �.ඩ�"�s�'ර�"ම�S �.ත�"ර�'න�S �.�?ම �?ශය�Tන�S �'�s�s�S �"ෝ �?ත�"�.ත�S �sරන�Sන)
                </span>
              </div>
            ) : parsedBasic > 0 &&
              balanceAfterDeduction < 0 ? (
              <div className="flex flex-col items-center justify-center px-2 py-0.5 text-center">
                <span className="tracking-wider font-black text-white text-sm sm:text-base md:text-lg uppercase drop-shadow-md flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 shrink-0" />
                  <span>LOAN CANNOT BE OBTAINED</span>
                </span>

                <span className="text-xs sm:text-sm font-bold text-red-100/95 drop-shadow-xs mt-0.5">
                  (ණය ප�"�f�"�sම�S ලබා�oත න�o�"ැ�s)
                </span>
              </div>
            ) : selectedLoanType ===
                'guarantee-loan' &&
              isGuaranteeMembershipMissing ? (
              <div className="flex flex-col items-center justify-center px-2 py-1 text-center">
                <span className="text-amber-300 font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  �fාමාජ�'�sත�S�? �sාල �f�"මා�? �?ත�"�.ත�S �sරන�Sන
                </span>

                <span className="text-[11px] font-semibold text-amber-200/90 mt-0.5">
                  (Guarantee Loan �fඳ�"ා Membership Duration �.න�'�?ාර�Sයය�')
                </span>
              </div>
            ) : selectedLoanType ===
                'guarantee-loan' &&
              isGuaranteeMembershipInvalid ? (
              <div className="flex flex-col items-center justify-center px-2 py-1 text-center">
                <span className="text-red-200 font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
                  �fාමාජ�'�sත�S�? �sාල �f�"මා�? න�'�?ැරද�' න�o�?�s
                </span>

                <span className="text-[11px] font-semibold text-red-100/90 mt-0.5">
                  (0 �"ෝ �Sට �?ැඩ�' �?�fර�s�S �?ත�"�.ත�S �sරන�Sන)
                </span>
              </div>
            ) : selectedLoanType &&
              parsedBasic > 0 &&
              balanceAfterDeduction > 0 ? (
              <span className="tracking-tight drop-shadow-xs text-2xl sm:text-3xl md:text-[32px] font-black leading-tight">
                {formatLKR(reachableLoanAmount)}
              </span>
            ) : parsedBasic > 0 &&
              balanceAfterDeduction > 0 &&
              !selectedLoanType ? (
              <div className="flex flex-col items-center justify-center px-2 py-1 text-center">
                <span className="text-amber-300 font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ණය �?ර�S�oය තෝරා�o�Tන න�oමැත
                </span>

                <span className="text-[11px] font-semibold text-amber-200/90 mt-0.5">
                  (�sර�"ණා�sර �?�"�.�'න�S �.දා�. ණය �?ර�S�oය තෝරා�oන�Sන)
                </span>
              </div>
            ) : (
              <span className="text-slate-300 font-bold text-2xl tracking-widest">
                -
              </span>
            )}
          </div>

          {selectedLoanType &&
            parsedBasic > 0 &&
            hasAtLeastOneDeduction &&
            balanceAfterDeduction > 0 &&
            reachableLoanAmount > 0 &&
            currentLoanConfig && (
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                <div className="bg-[#0b1638]/90 border border-cyan-400/40 rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-tight">
                    Installment (මා�f�'�s �?ාර�'�sය)
                  </span>

                  <span className="text-xs sm:text-sm font-black text-white">
                    {formatLKR(
                      reachableMonthlyInstallment
                    )}
                  </span>
                </div>

                <div className="bg-[#0b1638]/90 border border-cyan-400/40 rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-tight">
                    Interest (මා�f�'�s ප�oල�'ය)
                  </span>

                  <span className="text-xs sm:text-sm font-black text-white">
                    {formatLKR(
                      reachableMonthlyInterest
                    )}
                  </span>
                </div>

                <div className="bg-[#0b1638]/90 border border-cyan-400/40 rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-tight">
                    Rate (ප�oල�" �.න�"පාත�'�sය)
                  </span>

                  <span className="text-xs sm:text-sm font-black text-amber-300">
                    {currentLoanConfig.rate}%
                  </span>
                </div>

                <div className="bg-[#0b1638]/90 border border-cyan-400/40 rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-tight">
                    Period (�sාල�f�"මා�?)
                  </span>

                  <span className="text-xs sm:text-sm font-black text-cyan-300">
                    {currentLoanConfig.maxMonths} Months
                  </span>
                </div>
              </div>
            )}

          {selectedLoanType &&
            parsedBasic > 0 &&
            hasAtLeastOneDeduction &&
            balanceAfterDeduction > 0 &&
            reachableLoanAmount > 0 &&
            currentLoanConfig &&
            onNavigateToLoanCalculator &&
            !isGuaranteeMembershipMissing &&
            !isGuaranteeMembershipInvalid && (
              <button
                id="btn-goto-loan-calculator"
                type="button"
                onClick={() => {
                  onNavigateToLoanCalculator({
                    loanType: selectedLoanType,
                    amount: reachableLoanAmount,
                    months:
                      currentLoanConfig?.maxMonths ||
                      12,
                    balanceAfterDeduction:
                      balanceAfterDeduction,
                    bankDeductionsTotal:
                      bankDeductionsTotal,
                  });
                }}
                className="w-full mt-2 py-3.5 px-5 rounded-full bg-linear-to-r from-sky-400 via-cyan-400 to-teal-400 hover:from-sky-300 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black text-sm tracking-wide shadow-[0_6px_20px_rgba(14,165,233,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all border border-cyan-100"
              >
                <Calculator className="w-4 h-4 text-slate-950 shrink-0" />

                <span>
                  LOAN CALCULATOR �?�Tත ය�oම�"�?න�Sන
                </span>

                <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
              </button>
            )}
        </div>

        <div className="flex flex-col items-center text-center gap-1.5 pt-1">
          <label className="text-sm font-black text-white tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5 justify-center flex-wrap">
            <span>PAY SHEET DEDUCTION OF MONTH</span>

            <span className="text-xs font-semibold text-cyan-200 normal-case">
              (�?ැට�"ප�S පත�S�?�ර�'�sා�?�Tන�S මා�f�'�s �.ඩ�"�s�'ර�"ම)
            </span>
          </label>

          <div
            id="display-paysheet-deduction-of-month"
            className={`w-full py-3.5 px-5 rounded-full font-black text-xl text-center transition-all duration-300 ${
              parsedBasic > 0 &&
              hasAtLeastOneDeduction &&
              balanceAfterDeduction < 0
                ? 'bg-linear-to-r from-red-600 via-rose-600 to-red-700 text-white border-2 border-red-300 shadow-[0_10px_25px_rgba(220,38,38,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)]'
                : 'bg-white text-blue-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.2)] border-2 border-cyan-400'
            }`}
          >
            {parsedBasic > 0 &&
            hasAtLeastOneDeduction &&
            balanceAfterDeduction < 0
              ? '-'
              : parsedBasic > 0 &&
                hasAtLeastOneDeduction
              ? formatLKR(
                  paySheetDeductionOfMonth
                )
              : '-'}
          </div>

          {parsedBasic > 0 &&
            hasAtLeastOneDeduction &&
            balanceAfterDeduction >= 0 && (
              <div className="text-[11px] text-cyan-200/90 font-medium text-center">
                {selectedLoanType &&
                effectiveTotalOfInstallment > 0 ? (
                  <span>
                    (Total of Installment:{' '}
                    <strong className="text-white font-extrabold">
                      {formatLKR(
                        effectiveTotalOfInstallment
                      )}
                    </strong>{' '}
                    + Bank Deductions:{' '}
                    <strong className="text-white font-extrabold">
                      {formatLKR(
                        bankDeductionsTotal
                      )}
                    </strong>
                    )
                  </span>
                ) : (
                  <span>
                    (Bank Deductions Total:{' '}
                    <strong className="text-white font-extrabold">
                      {formatLKR(
                        bankDeductionsTotal
                      )}
                    </strong>
                    )
                  </span>
                )}
              </div>
            )}
        </div>
      </div>

      <div className="w-full max-w-[360px] mx-auto pt-3 pb-6 text-center z-10">
        <button
          id="btn-paysheet-clear-all"
          type="button"
          onClick={handleClearAll}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-widest uppercase shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_18px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center cursor-pointer border border-red-400/40"
        >
          <span>CLEAR ALL</span>
        </button>
      </div>
    </div>
  );
};







