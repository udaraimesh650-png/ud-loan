import React, { useState, useMemo, useEffect } from 'react';
import { Home, ArrowLeft, Calendar, Percent, AlertTriangle } from 'lucide-react';
import { calculateLoan, calculateReachableLoanAmount, formatLKR } from '../utils/loanMath';
import { useLoanConditions, getDynamicPropertyLoanRate } from '../utils/loanConditionsStorage';
import { LoanConditionBadge } from './LoanConditionBadge';

interface PaySheetLoanCalculatorScreenProps {
  onGoHome: () => void;
  onGoBackToPaySheet: (customInstallment?: number) => void;
  initialLoanType?: string;
  initialAmount?: number;
  initialMonths?: number;
  ageRemainingMonths?: number;
  balanceAfterDeduction?: number;
  bankDeductionsTotal?: number;
}

const getSavedBankDeductions = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('ud_paysheet_saved_data') : null;
    if (raw) {
      const data = JSON.parse(raw);
      const parseNum = (v: any) => {
        if (!v) return 0;
        const n = parseFloat(String(v).replace(/,/g, ''));
        return isNaN(n) ? 0 : n;
      };
      return Math.round(
        parseNum(data.deduction2) +
        parseNum(data.deduction4) +
        parseNum(data.deduction6_1 || data.deduction6) +
        parseNum(data.deduction6_2) +
        parseNum(data.deduction8_1 || data.deduction8) +
        parseNum(data.deduction8_2)
      );
    }
  } catch (e) {
    // ignore
  }
  return 0;
};

export const PaySheetLoanCalculatorScreen: React.FC<PaySheetLoanCalculatorScreenProps> = ({
  onGoHome,
  onGoBackToPaySheet,
  initialLoanType = '',
  initialAmount = 0,
  initialMonths = 0,
  ageRemainingMonths,
  balanceAfterDeduction = 0,
  bankDeductionsTotal,
}) => {
  const { conditions, loanTypesList } = useLoanConditions();

  const [selectedLoanType, setSelectedLoanType] = useState<string>(initialLoanType);
  const [loanAmount, setLoanAmount] = useState<string>(
    initialAmount > 0 ? Math.round(initialAmount).toLocaleString('en-US') : ''
  );
  const [tenureValue, setTenureValue] = useState<string>(() => {
    if (initialMonths > 0) return initialMonths.toString();
    if (initialLoanType) {
      const f = conditions[initialLoanType];
      return f?.maxPeriodMonths ? f.maxPeriodMonths.toString() : '';
    }
    return '';
  });
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('months');
  const [interestRate, setInterestRate] = useState<string>(() => {
    if (!initialLoanType) return '';
    const found = conditions[initialLoanType];
    return found ? found.defaultRate.toString() : '';
  });

  // Sync if initial props change
  useEffect(() => {
    if (initialLoanType) {
      setSelectedLoanType(initialLoanType);
      const found = conditions[initialLoanType];
      if (initialLoanType === 'property-loan') {
        const months = initialMonths && initialMonths > 0 ? initialMonths : 180;
        setTenureValue(months.toString());
        setTenureUnit('months');
        setInterestRate(
          getDynamicPropertyLoanRate(months, found?.propertyTiers).toString()
        );
      } else if (found) {
        setInterestRate(found.defaultRate.toString());
        if (initialMonths && initialMonths > 0) {
          setTenureValue(initialMonths.toString());
          setTenureUnit('months');
        } else if (found.maxPeriodMonths) {
          setTenureValue(found.maxPeriodMonths.toString());
          setTenureUnit('months');
        }
      }
    }
    if (initialAmount && initialAmount > 0) {
      setLoanAmount(Math.round(initialAmount).toLocaleString('en-US'));
    }
  }, [initialLoanType, initialAmount, initialMonths, conditions]);

  // Selected Loan Configuration (Max Months, Rate, Max Limit)
  const currentLoanConfig = useMemo(() => {
    if (!selectedLoanType) return null;

    const cond = conditions[selectedLoanType];
    if (!cond) return null;

    const normalMaxMonths =
      selectedLoanType === 'property-loan'
        ? 180
        : cond.maxPeriodMonths;

    const maxMonths =
      ageRemainingMonths &&
      ageRemainingMonths > 0
        ? Math.min(
            normalMaxMonths,
            ageRemainingMonths
          )
        : normalMaxMonths;

    const rate =
      selectedLoanType === 'property-loan'
        ? getDynamicPropertyLoanRate(
            maxMonths,
            cond.propertyTiers
          )
        : cond.defaultRate;

    return {
      maxMonths,
      rate,
      name: cond.name,
      maxLimit: cond.maxLimit,
    };
  }, [
    selectedLoanType,
    conditions,
    ageRemainingMonths,
  ]);

  // Reachable Loan Amount based on balanceAfterDeduction, current loan type's max months and rate:
  const reachableLoanAmount = useMemo(() => {
    if (balanceAfterDeduction <= 0 || !currentLoanConfig) return 0;
    const calculated = calculateReachableLoanAmount(
      balanceAfterDeduction,
      currentLoanConfig.rate,
      currentLoanConfig.maxMonths
    );
    if (currentLoanConfig.maxLimit && calculated > currentLoanConfig.maxLimit) {
      return currentLoanConfig.maxLimit;
    }
    return calculated;
  }, [balanceAfterDeduction, currentLoanConfig]);

  // Handle loan type selection
  const handleLoanTypeChange = (typeId: string) => {
    setSelectedLoanType(typeId);

    if (!typeId) {
      setInterestRate('');
      return;
    }

    const cond = conditions[typeId];
    if (!cond) return;

    const normalMaxMonths =
      typeId === 'property-loan'
        ? 180
        : cond.maxPeriodMonths;

    const effectiveMonths =
      ageRemainingMonths &&
      ageRemainingMonths > 0
        ? Math.min(
            normalMaxMonths,
            ageRemainingMonths
          )
        : normalMaxMonths;

    const effectiveRate =
      typeId === 'property-loan'
        ? getDynamicPropertyLoanRate(
            effectiveMonths,
            cond.propertyTiers
          )
        : cond.defaultRate;

    setInterestRate(effectiveRate.toString());
    setTenureValue(effectiveMonths.toString());
    setTenureUnit('months');

    if (balanceAfterDeduction > 0) {
      const reachable =
        calculateReachableLoanAmount(
          balanceAfterDeduction,
          effectiveRate,
          effectiveMonths
        );

      const finalAmt =
        cond.maxLimit &&
        reachable > cond.maxLimit
          ? cond.maxLimit
          : reachable;

      if (finalAmt > 0) {
        setLoanAmount(
          finalAmt.toLocaleString('en-US')
        );
      }
    }
  };
  // Calculate tenure in total months
  // Age-60 limit is always preserved when available.
  const totalMonths = useMemo(() => {
    const val = parseFloat(tenureValue) || 0;

    const requestedMonths =
      tenureUnit === 'years'
        ? Math.round(val * 12)
        : Math.round(val);

    if (
      ageRemainingMonths &&
      ageRemainingMonths > 0
    ) {
      return Math.min(
        requestedMonths,
        ageRemainingMonths
      );
    }

    return requestedMonths;
  }, [
    tenureValue,
    tenureUnit,
    ageRemainingMonths,
  ]);

  // For PROPERTY LOAN: Dynamically set interest rate based on tenure
  useEffect(() => {
    if (selectedLoanType === 'property-loan' && totalMonths > 0) {
      const dynamicRate = getDynamicPropertyLoanRate(
        totalMonths,
        conditions['property-loan']?.propertyTiers
      );
      setInterestRate(dynamicRate.toString());
    }
  }, [selectedLoanType, totalMonths, conditions]);

  // Numerical inputs
  const principal = parseFloat(loanAmount.replace(/,/g, '')) || 0;
  const rate = parseFloat(interestRate) || 0;

  // Validation rules for maximum limits and tenure based on active conditions
  const limitWarning = useMemo(() => {
    if (!selectedLoanType) return null;
    const cond = conditions[selectedLoanType];
    if (!cond) return null;

    if (cond.maxLimit && cond.maxLimit > 0 && principal > cond.maxLimit) {
      return `${cond.name} උපරිම සීමාව රු. ${cond.maxLimit.toLocaleString('en-US')} කි. (Max Limit: Rs. ${cond.maxLimit.toLocaleString('en-US')})`;
    }
    if (cond.maxPeriodMonths && totalMonths > cond.maxPeriodMonths) {
      const years = (cond.maxPeriodMonths / 12).toFixed(1).replace(/\.0$/, '');
      return `${cond.name} උපරිම කාලසීමාව මාස ${cond.maxPeriodMonths} (වසර ${years}) කි. (Max Tenure: ${cond.maxPeriodMonths} Months)`;
    }
    return null;
  }, [selectedLoanType, principal, totalMonths, conditions]);

  // Exact formulas matching the Loan Calculator:
  // 1. Installment = Loan Amount / Years/Months
  const installment = useMemo(() => {
    if (!principal || !totalMonths) return 0;
    return Math.round(principal / totalMonths);
  }, [principal, totalMonths]);

  // 2. Monthly Interest = (Loan Amount * Rate) / 1200
  const monthlyInterest = useMemo(() => {
    if (!principal || !rate) return 0;
    return Math.round((principal * rate) / 1200);
  }, [principal, rate]);

  // 3. Total of Installment = Installment + Interest
  const totalOfInstallment = useMemo(() => {
    if (!installment && !monthlyInterest) return 0;
    return Math.round(installment + monthlyInterest);
  }, [installment, monthlyInterest]);

  // Check if Total of Installment exceeds Balance After Deduction
  const isExceeded = useMemo(() => {
    return (
      balanceAfterDeduction > 0 &&
      totalOfInstallment > 0 &&
      totalOfInstallment > balanceAfterDeduction
    );
  }, [balanceAfterDeduction, totalOfInstallment]);

  const excessAmount = useMemo(() => {
    return isExceeded ? totalOfInstallment - balanceAfterDeduction : 0;
  }, [isExceeded, totalOfInstallment, balanceAfterDeduction]);

  // Resolved Bank Deductions (from 40% Bank Deductions)
  const resolvedBankDeductions = useMemo(() => {
    if (typeof bankDeductionsTotal === 'number') {
      return bankDeductionsTotal;
    }
    return getSavedBankDeductions();
  }, [bankDeductionsTotal]);

  // Pay Sheet Deduction of Month = Total of Installment + Bank Deductions Total
  const paySheetDeductionOfMonth = useMemo(() => {
    if (totalOfInstallment <= 0 && resolvedBankDeductions <= 0) return 0;
    return Math.round(resolvedBankDeductions + totalOfInstallment);
  }, [resolvedBankDeductions, totalOfInstallment]);

  // Reset / Clear
  const handleClear = () => {
    setLoanAmount('');
    setTenureValue('');
    setInterestRate('');
    setSelectedLoanType('');
  };

  return (
    <div
      id="paysheet-loan-calculator-screen"
      className="relative min-h-full flex flex-col justify-between overflow-y-auto px-4 sm:px-6 select-none transition-colors duration-300"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 12px), 20px)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 20px)',
        backgroundColor: isExceeded ? '#fee2e2' : '#e6f7ec',
        backgroundImage: isExceeded
          ? `
            radial-gradient(circle at 85% 5%, rgba(254, 202, 202, 0.85) 0%, transparent 45%),
            radial-gradient(circle at 10% 95%, rgba(252, 165, 165, 0.75) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(254, 242, 242, 0.95) 0%, rgba(254, 226, 226, 0.98) 100%)
          `
          : `
            radial-gradient(circle at 85% 5%, rgba(254, 215, 170, 0.55) 0%, transparent 40%),
            radial-gradient(circle at 10% 95%, rgba(153, 246, 228, 0.45) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(240, 253, 244, 0.8) 0%, rgba(220, 245, 230, 0.95) 100%)
          `,
      }}
    >
      {/* Top Header Bar matching 2.png - Home on left, spacer on right, NO back button */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 z-10">
        <button
          id="btn-paysheet-loan-calc-home"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleClear();
            onGoHome();
          }}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-all text-[#161a49] cursor-pointer touch-manipulation z-30 p-2.5 -m-2.5 rounded-2xl hover:bg-emerald-950/5 active:bg-emerald-950/10"
          title="Go to Home"
          aria-label="Home"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-[#1b2559] to-[#0f172a] flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-700 group-hover:text-emerald-700 transition-colors">
            Home
          </span>
        </button>

        <h1
          id="paysheet-loan-calc-title"
          className="text-2xl sm:text-3xl font-black tracking-wide text-center uppercase"
          style={{
            color: '#0284c7',
            textShadow: '0 1px 2px rgba(14, 116, 144, 0.25)',
            letterSpacing: '0.04em',
          }}
        >
          LOAN CALCULATOR
        </h1>

        <button
          id="btn-paysheet-loan-calc-back"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onGoBackToPaySheet(totalOfInstallment);
          }}
          className="flex flex-col items-center gap-1 group active:scale-95 transition-all text-[#161a49] cursor-pointer touch-manipulation z-30 p-2.5 -m-2.5 rounded-2xl hover:bg-emerald-950/5 active:bg-emerald-950/10"
          title="Back to Pay Sheet"
          aria-label="Back"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-[#1b2559] to-[#0f172a] flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform">
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-700 group-hover:text-emerald-700 transition-colors">
            Back
          </span>
        </button>
      </div>

      {/* Form Fields Stack matching 2.png */}
      <div className="w-full max-w-[360px] mx-auto flex flex-col gap-4 py-4 z-10">
        {/* Top Reference: BALANCE AFTER DEDUCTION from Pay Sheet */}
        {balanceAfterDeduction > 0 && (
          <div
            id="display-paysheet-balance-after-deduction-header"
            className={`w-full py-3 px-4 rounded-2xl text-white border-2 shadow-md flex items-center justify-between transition-all ${
              isExceeded
                ? 'bg-linear-to-r from-red-950 via-[#7f1d1d] to-red-950 border-red-400 shadow-[0_4px_20px_rgba(220,38,38,0.35)]'
                : 'bg-linear-to-r from-[#0b1638] via-[#11235a] to-[#0b1638] border-sky-400/50 shadow-[0_4px_16px_rgba(14,165,233,0.3)]'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-black text-sky-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isExceeded ? 'bg-red-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
                BALANCE AFTER DEDUCTION
              </span>
              <span className="text-[10px] text-sky-300 font-bold">
                (වැටුප් පත්‍රිකාවෙන් ඉතිරි ශේෂය)
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg sm:text-xl font-black text-amber-300 tracking-tight drop-shadow-sm">
                {formatLKR(balanceAfterDeduction)}
              </span>
              {isExceeded && (
                <span className="text-[10px] font-black text-red-300 uppercase tracking-tight">
                  ප්‍රමාණවත් නොවේ (Insufficient)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reachable Loan Amount Card - displayed directly below Balance After Deduction */}
        {balanceAfterDeduction > 0 && (
          <div
            id="display-paysheet-reachable-loan-amount-card"
            className="w-full py-3 px-4 rounded-2xl bg-linear-to-r from-[#061e33] via-[#09354a] to-[#062438] text-white border-2 border-emerald-400/60 shadow-[0_4px_16px_rgba(16,185,129,0.25)] flex items-center justify-between transition-all"
          >
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                REACHABLE LOAN AMOUNT
              </span>
              <span className="text-[10px] text-emerald-200/90 font-bold">
                (ලබාගත හැකි උපරිම ණය මුදල)
              </span>
            </div>
            <div className="flex flex-col items-end">
              {selectedLoanType && currentLoanConfig ? (
                <span className="text-lg sm:text-xl font-black text-emerald-300 tracking-tight drop-shadow-sm">
                  {formatLKR(reachableLoanAmount)}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-300">
                  ණය වර්ගය තෝරාගන්න
                </span>
              )}
            </div>
          </div>
        )}

        {/* Warning Banner when Total of Installment exceeds Balance After Deduction */}
        {isExceeded && (
          <div
            id="warning-exceeded-balance-banner"
            className="w-full p-3.5 rounded-2xl bg-linear-to-r from-red-600 via-rose-600 to-red-600 text-white border-2 border-red-300 shadow-[0_6px_20px_rgba(220,38,38,0.45)] flex items-start gap-2.5 animate-pulse"
          >
            <AlertTriangle className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
            <div className="flex flex-col text-left gap-0.5">
              <span className="text-xs sm:text-sm font-black tracking-wide uppercase text-amber-200 flex items-center gap-1">
                ⚠️ අවවාදයයි: වැටුප් ශේෂ සීමාව ඉක්මවා ඇත!
              </span>
              <span className="text-xs sm:text-[13px] font-black text-white leading-snug">
                මුළු මාසික වාරිකය ({formatLKR(totalOfInstallment)}), වැටුප් පත්‍රිකාවෙන් ඉතිරි ශේෂයට ({formatLKR(balanceAfterDeduction)}) වඩා රු. {formatLKR(excessAmount)} කින් වැඩිය.
              </span>
              <span className="text-[11px] text-red-100 font-bold mt-0.5">
                කරුණාකර ණය මුදල අඩු කිරීමෙන් හෝ ආපසු ගෙවීමේ කාලය (මාස ගණන) දීර්ඝ කිරීමෙන් වාරිකය සකස් කරගන්න.
              </span>
            </div>
          </div>
        )}

        {/* Field 1: LOAN TYPE */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
            <span>LOAN TYPE</span>
            <span className="text-xs font-semibold text-slate-500 normal-case">(ණය වර්ගය)</span>
          </label>
          <div className="relative">
            <select
              id="input-paysheet-loan-type"
              value={selectedLoanType}
              onChange={(e) => handleLoanTypeChange(e.target.value)}
              className="w-full py-3 px-5 pr-10 rounded-full bg-white text-slate-900 font-extrabold text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none cursor-pointer tracking-wide"
            >
              <option value="" className="font-bold text-slate-400">
                -
              </option>
              {loanTypesList.map((type) => (
                <option key={type.id} value={type.id} className="font-bold py-1 text-slate-800">
                  {type.name} ({type.subtitle})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Condition note displayed for every selected loan type */}
          {selectedLoanType && (
            <LoanConditionBadge
              loanTypeId={selectedLoanType}
              variant="light"
              propertyYears={Math.round(totalMonths / 12) || 15}
              onSelectPropertyYears={(years) => {
                setTenureValue(years.toString());
                setTenureUnit('years');
                setInterestRate(
                  getDynamicPropertyLoanRate(
                    years * 12,
                    conditions['property-loan']?.propertyTiers
                  ).toString()
                );
              }}
            />
          )}
        </div>

        {/* Field 2: LOAN AMOUNT */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
            <span>LOAN AMOUNT</span>
            <span className="text-xs font-semibold text-slate-500 normal-case">(ණය මුදල)</span>
          </label>
          <div className="relative">
            <input
              id="input-paysheet-loan-amount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              value={loanAmount}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 7);
                setLoanAmount(digits ? Number(digits).toLocaleString('en-US') : '');
              }}
              placeholder="-"
              className="w-full py-3 px-5 pr-14 rounded-full bg-white text-slate-900 font-bold text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rs.
            </div>
          </div>
        </div>

        {/* Field 3: YEARS/MONTHS */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
            <span>YEARS/MONTHS</span>
            <span className="text-xs font-semibold text-slate-500 normal-case">(ආපසු ගෙවීමේ කාලය - වසර / මාස)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="input-paysheet-loan-tenure"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              max={tenureUnit === 'years' ? '30' : '360'}
              value={tenureValue}
              onChange={(e) => setTenureValue(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="-"
              className="w-full py-3 px-5 rounded-full bg-white text-slate-900 font-bold text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="flex rounded-full bg-white p-1 border border-slate-200 shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => setTenureUnit('years')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  tenureUnit === 'years'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Years
              </button>
              <button
                type="button"
                onClick={() => setTenureUnit('months')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  tenureUnit === 'months'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Months
              </button>
            </div>
          </div>
        </div>

        {/* Field 4: RATE */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
            <span>RATE (% Annual Interest)</span>
            <span className="text-xs font-semibold text-slate-500 normal-case">(වාර්ෂික පොලී අනුපාතිකය)</span>
          </label>
          <div className="relative">
            <input
              id="input-paysheet-loan-rate"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              step="0.1"
              min="0"
              max="100"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="-"
              className="w-full py-3 px-5 pr-10 rounded-full bg-white text-slate-900 font-bold text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
              %
            </div>
          </div>
        </div>

        {/* Limit / Tenure Warning */}
        {limitWarning && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs font-black shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{limitWarning}</span>
          </div>
        )}

        {/* Field 5: INSTALLMENT (Loan Amount / Years or Months) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
            <span>INSTALLMENT</span>
            <span className="text-xs font-semibold text-slate-500 normal-case">(මාසික මූලික වාරිකය)</span>
          </label>
          <div
            id="display-paysheet-monthly-installment"
            className="w-full py-3.5 px-5 rounded-full bg-white text-sky-600 font-black text-lg sm:text-xl text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05)] border-2 border-sky-200"
          >
            {principal > 0 && totalMonths > 0 ? formatLKR(installment) : '-'}
          </div>
        </div>

        {/* Field 6: INTEREST (Monthly) = (Loan Amount * Rate) / 1200 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
            <span>INTEREST (Monthly)</span>
            <span className="text-xs font-semibold text-slate-500 normal-case">(මාසික පොලී මුදල)</span>
          </label>
          <div
            id="display-paysheet-monthly-interest"
            className="w-full py-3.5 px-5 rounded-full bg-white text-slate-800 font-extrabold text-base sm:text-lg text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200"
          >
            {principal > 0 && rate > 0 ? formatLKR(monthlyInterest) : '-'}
          </div>
        </div>

        {/* Field 7: TOTAL OF INSTALLMENT = Installment + Interest */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center justify-between flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
              <span>TOTAL OF INSTALLMENT</span>
              <span className={`text-xs font-semibold normal-case ${isExceeded ? 'text-red-700 font-bold' : 'text-emerald-700'}`}>
                (මුළු මාසික වාරිකය)
              </span>
            </div>
            {isExceeded && (
              <span className="text-[10px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                ⚠️ වැටුප් ශේෂය ඉක්මවා ඇත!
              </span>
            )}
          </label>
          <div
            id="display-paysheet-total-installment"
            className={`w-full py-3.5 px-5 rounded-full font-black text-lg sm:text-xl text-center transition-all ${
              isExceeded
                ? 'bg-red-50 text-red-700 shadow-[inset_0_2px_4px_rgba(220,38,38,0.15),0_2px_8px_rgba(220,38,38,0.25)] border-2 border-red-500'
                : 'bg-white text-emerald-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05)] border border-emerald-200'
            }`}
          >
            {principal > 0 && (totalMonths > 0 || rate > 0)
              ? formatLKR(totalOfInstallment)
              : '-'}
          </div>
        </div>

        {/* Field 8: PAY SHEET DEDUCTION OF MONTH */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center justify-between flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
              <span>PAY SHEET DEDUCTION OF MONTH</span>
              <span className="text-xs font-semibold text-slate-500 normal-case">
                (වැටුප් පත්‍රිකාවෙන් මාසික අඩුකිරීම)
              </span>
            </div>
          </label>
          <div
            id="display-paysheet-loan-deduction-of-month"
            className="w-full py-3.5 px-5 rounded-full bg-white text-blue-950 font-black text-lg sm:text-xl text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05)] border-2 border-sky-400"
          >
            {totalOfInstallment > 0 || resolvedBankDeductions > 0
              ? formatLKR(paySheetDeductionOfMonth)
              : '-'}
          </div>
          {(totalOfInstallment > 0 || resolvedBankDeductions > 0) && (
            <div className="text-[11px] text-slate-600 font-medium text-center">
              {totalOfInstallment > 0 && resolvedBankDeductions > 0 ? (
                <span>
                  (Total of Installment: <strong className="text-slate-900 font-bold">{formatLKR(totalOfInstallment)}</strong> + Bank Deductions: <strong className="text-slate-900 font-bold">{formatLKR(resolvedBankDeductions)}</strong>)
                </span>
              ) : resolvedBankDeductions > 0 ? (
                <span>
                  (Bank Deductions Total: <strong className="text-slate-900 font-bold">{formatLKR(resolvedBankDeductions)}</strong>)
                </span>
              ) : (
                <span>
                  (Total of Installment: <strong className="text-slate-900 font-bold">{formatLKR(totalOfInstallment)}</strong>)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CLEAR button */}
      <div className="w-full max-w-[360px] mx-auto pt-3 pb-6 text-center z-10">
        <button
          id="btn-paysheet-loan-clear"
          type="button"
          onClick={handleClear}
          className="w-full py-3.5 px-6 rounded-full bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-widest uppercase shadow-[0_4px_14px_rgba(239,68,68,0.28)] hover:shadow-[0_6px_18px_rgba(239,68,68,0.38)] transition-all flex items-center justify-center cursor-pointer border border-red-400/40"
        >
          <span>CLEAR</span>
        </button>
      </div>
    </div>
  );
};
