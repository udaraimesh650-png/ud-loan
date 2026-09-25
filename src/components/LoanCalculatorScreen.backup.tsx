import React, { useState, useMemo, useEffect } from 'react';
import { Home, AlertTriangle } from 'lucide-react';
import {
useLoanConditions,
getDynamicPropertyLoanRate,
GuaranteeLoanTiers,
} from '../utils/loanConditionsStorage';
import { formatLKR } from '../utils/loanMath';
import { LoanConditionBadge } from './LoanConditionBadge';

interface LoanCalculatorScreenProps {
onGoHome: () => void;
}

export const LoanCalculatorScreen: React.FC<LoanCalculatorScreenProps> = ({
onGoHome,
}) => {
const { conditions, loanTypesList } = useLoanConditions();

const [selectedLoanType, setSelectedLoanType] = useState<string>('');
const [loanAmount, setLoanAmount] = useState<string>('');
const [membershipYears, setMembershipYears] = useState<string>('');
const [tenureValue, setTenureValue] = useState<string>('');
const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('months');
const [interestRate, setInterestRate] = useState<string>('');

// ------------------------------------------------------------
// GUARANTEE LOAN LIMITS
// ------------------------------------------------------------
const getGuaranteeLoanLimits = (
years: number,
tiers?: GuaranteeLoanTiers
) => {
const currentTiers =
tiers || conditions['guarantee-loan']?.guaranteeTiers;


if (!currentTiers || years < 0 || Number.isNaN(years)) {
  return null;
}

// 0 - 2 years
if (years <= currentTiers.tier1MaxYears) {
  return {
    maxLimit: currentTiers.tier1MaxLimit,
    maxPeriodMonths: currentTiers.tier1MaxPeriodMonths,
  };
}

// More than 2 - 5 years
if (years <= currentTiers.tier2MaxYears) {
  return {
    maxLimit: currentTiers.tier2MaxLimit,
    maxPeriodMonths: currentTiers.tier2MaxPeriodMonths,
  };
}

// More than 5 years
return {
  maxLimit: currentTiers.tier3MaxLimit,
  maxPeriodMonths: currentTiers.tier3MaxPeriodMonths,
};


};

// ------------------------------------------------------------
// LOAN TYPE CHANGE
// ------------------------------------------------------------
const handleLoanTypeChange = (typeId: string) => {
setSelectedLoanType(typeId);


if (typeId !== 'guarantee-loan') {
  setMembershipYears('');
}

if (!typeId) {
  setInterestRate('');
  setTenureValue('');
  setTenureUnit('months');
  return;
}

const found = conditions[typeId];

if (!found) {
  setInterestRate('');
  setTenureValue('');
  setTenureUnit('months');
  return;
}

// Guarantee Loan
if (typeId === 'guarantee-loan') {
  setInterestRate(found.defaultRate.toString());
  setTenureValue('');
  setTenureUnit('months');
  return;
}

// Property Loan
if (typeId === 'property-loan') {
  setTenureValue('15');
  setTenureUnit('years');

  const dynamicRate = getDynamicPropertyLoanRate(
    180,
    found.propertyTiers
  );

  setInterestRate(dynamicRate.toString());
  return;
}

// Other Loan Types
setInterestRate(found.defaultRate.toString());

if (found.defaultPeriodMonths) {
  if (
    found.defaultPeriodMonths % 12 === 0 &&
    found.defaultPeriodMonths >= 12 &&
    found.id !== 'fixed-deposit-loan'
  ) {
    setTenureValue(
      (found.defaultPeriodMonths / 12).toString()
    );
    setTenureUnit('years');
  } else {
    setTenureValue(
      found.defaultPeriodMonths.toString()
    );
    setTenureUnit('months');
  }
}


};

// ------------------------------------------------------------
// TOTAL TENURE IN MONTHS
// ------------------------------------------------------------
const totalMonths = useMemo(() => {
const value = parseFloat(tenureValue) || 0;


if (tenureUnit === 'years') {
  return Math.round(value * 12);
}

return Math.round(value);


}, [tenureValue, tenureUnit]);

// ------------------------------------------------------------
// ------------------------------------------------------------
// PROPERTY LOAN DYNAMIC RATE
// ------------------------------------------------------------
useEffect(() => {
  if (
    selectedLoanType === 'property-loan' &&
    totalMonths > 0
  ) {
    const dynamicRate = getDynamicPropertyLoanRate(
      totalMonths,
      conditions['property-loan']?.propertyTiers
    );

    setInterestRate(dynamicRate.toString());
  }
}, [selectedLoanType, totalMonths, conditions]);

// ------------------------------------------------------------
// NUMERICAL VALUES
// ------------------------------------------------------------
const principal =
  parseFloat(loanAmount.replace(/,/g, '')) || 0;
// ------------------------------------------------------------


const rate = parseFloat(interestRate) || 0;

// ------------------------------------------------------------
// GUARANTEE LOAN CURRENT LIMITS
// ------------------------------------------------------------
const guaranteeLimits = useMemo(() => {
if (
selectedLoanType !== 'guarantee-loan' ||
membershipYears === ''
) {
return null;
}


const years = parseFloat(membershipYears);

if (
  Number.isNaN(years) ||
  years < 0
) {
  return null;
}

return getGuaranteeLoanLimits(
  years,
  conditions['guarantee-loan']?.guaranteeTiers
);


}, [
selectedLoanType,
membershipYears,
conditions,
]);

// ------------------------------------------------------------
// VALIDATION
// ------------------------------------------------------------
const limitWarning = useMemo(() => {
if (!selectedLoanType) {
return null;
}


const condition = conditions[selectedLoanType];

if (!condition) {
  return null;
}

// Guarantee Loan
if (selectedLoanType === 'guarantee-loan') {
  if (membershipYears === '') {
    return null;
  }

  const years = parseFloat(membershipYears);

  if (
    Number.isNaN(years) ||
    years < 0
  ) {
    return 'කරුණාකර නිවැරදි සාමාජිකත්ව කාල සීමාවක් ඇතුළත් කරන්න.';
  }

  const limits = getGuaranteeLoanLimits(
    years,
    condition.guaranteeTiers
  );

  if (!limits) {
    return null;
  }

  if (principal > limits.maxLimit) {
    return `සාමාජිකත්ව කාලය අනුව උපරිම ණය සීමාව රු. ${limits.maxLimit.toLocaleString(
      'en-US'
    )} කි.`;
  }

  if (totalMonths > limits.maxPeriodMonths) {
    return `සාමාජිකත්ව කාලය අනුව උපරිම ආපසු ගෙවීමේ කාලය මාස ${limits.maxPeriodMonths} කි.`;
  }

  return null;
}

// Other Loan Types - Maximum Amount
if (
  condition.maxLimit &&
  condition.maxLimit > 0 &&
  principal > condition.maxLimit
) {
  return `${condition.name} උපරිම සීමාව රු. ${condition.maxLimit.toLocaleString(
    'en-US'
  )} කි.`;
}

// Other Loan Types - Maximum Period
if (
  condition.maxPeriodMonths &&
  totalMonths > condition.maxPeriodMonths
) {
  const years = (condition.maxPeriodMonths / 12)
    .toFixed(1)
    .replace(/\.0$/, '');

  return `${condition.name} උපරිම කාලසීමාව මාස ${condition.maxPeriodMonths} (වසර ${years}) කි.`;
}

return null;


}, [
selectedLoanType,
principal,
totalMonths,
conditions,
membershipYears,
]);

// ------------------------------------------------------------
// CHECK WHETHER CALCULATION IS VALID
// ------------------------------------------------------------
const calculationBlocked = Boolean(limitWarning);

// ------------------------------------------------------------
// INSTALLMENT
// ------------------------------------------------------------
const installment = useMemo(() => {
if (
calculationBlocked ||
!principal ||
!totalMonths
) {
return 0;
}


return Math.round(
  principal / totalMonths
);


}, [
calculationBlocked,
principal,
totalMonths,
]);

// ------------------------------------------------------------
// MONTHLY INTEREST
// ------------------------------------------------------------
const monthlyInterest = useMemo(() => {
if (
calculationBlocked ||
!principal ||
!rate
) {
return 0;
}


return Math.round(
  (principal * rate) / 1200
);


}, [
calculationBlocked,
principal,
rate,
]);

// ------------------------------------------------------------
// TOTAL INSTALLMENT
// ------------------------------------------------------------
const totalOfInstallment = useMemo(() => {
if (
calculationBlocked ||
(!installment && !monthlyInterest)
) {
return 0;
}


return Math.round(
  installment + monthlyInterest
);


}, [
calculationBlocked,
installment,
monthlyInterest,
]);

// ------------------------------------------------------------
// CLEAR
// ------------------------------------------------------------
const handleClear = () => {
setLoanAmount('');
setMembershipYears('');
setTenureValue('');
setInterestRate('');
setSelectedLoanType('');
setTenureUnit('months');
};

// ------------------------------------------------------------
// DYNAMIC TENURE MAX
// ------------------------------------------------------------
const tenureMax = useMemo(() => {
if (selectedLoanType === 'guarantee-loan') {
if (guaranteeLimits) {
return tenureUnit === 'years'
? Math.floor(
guaranteeLimits.maxPeriodMonths / 12
)
: guaranteeLimits.maxPeriodMonths;
}


  return tenureUnit === 'years'
    ? 30
    : 360;
}

const condition =
  conditions[selectedLoanType];

if (condition?.maxPeriodMonths) {
  return tenureUnit === 'years'
    ? Math.floor(
        condition.maxPeriodMonths / 12
      )
    : condition.maxPeriodMonths;
}

return tenureUnit === 'years'
  ? 30
  : 360;


}, [
selectedLoanType,
guaranteeLimits,
tenureUnit,
conditions,
]);

return (
<div
id="loan-calculator-screen"
className="relative min-h-full flex flex-col justify-between overflow-y-auto px-4 sm:px-6 select-none"
style={{
paddingTop:
'max(calc(env(safe-area-inset-top, 0px) + 12px), 20px)',
paddingBottom:
'max(calc(env(safe-area-inset-bottom, 0px) + 16px), 20px)',
backgroundColor: '#e6f7ec',
backgroundImage: `           radial-gradient(
            circle at 85% 5%,
            rgba(254, 215, 170, 0.55) 0%,
            transparent 40%
          ),
          radial-gradient(
            circle at 10% 95%,
            rgba(153, 246, 228, 0.45) 0%,
            transparent 45%
          ),
          radial-gradient(
            circle at 50% 50%,
            rgba(240, 253, 244, 0.8) 0%,
            rgba(220, 245, 230, 0.95) 100%
          )
        `,
}}
>
{/* TOP HEADER */} <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 z-10">
<button
id="btn-loan-calc-home"
type="button"
onClick={(e) => {
e.preventDefault();
handleClear();
onGoHome();
}}
className="flex flex-col items-center gap-1 group active:scale-95 transition-all text-[#161a49] cursor-pointer touch-manipulation z-30 p-2.5 -m-2.5 rounded-2xl hover:bg-emerald-950/5 active:bg-emerald-950/10"
title="Go to Home"
aria-label="Home"
> <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-[#1b2559] to-[#0f172a] flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform"> <Home className="w-5 h-5" /> </div>


      <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-700 group-hover:text-emerald-700 transition-colors">
        Home
      </span>
    </button>

    <h1
      id="loan-calc-title"
      className="text-2xl sm:text-3xl font-black tracking-wide text-center uppercase"
      style={{
        color: '#0284c7',
        textShadow:
          '0 1px 2px rgba(14, 116, 144, 0.25)',
        letterSpacing: '0.04em',
      }}
    >
      LOAN CALCULATOR
    </h1>

    <div className="w-8 sm:w-9" />
  </div>

  {/* FORM */}
  <div className="w-full max-w-[360px] mx-auto flex flex-col gap-4 py-4 z-10">

    {/* LOAN TYPE */}
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />

        <span>LOAN TYPE</span>

        <span className="text-xs font-semibold text-slate-500 normal-case">
          (ණය වර්ගය)
        </span>
      </label>

      <div className="relative">
        <select
          id="input-loan-type"
          value={selectedLoanType}
          onChange={(e) =>
            handleLoanTypeChange(
              e.target.value
            )
          }
          className="w-full py-3 px-5 pr-10 rounded-full bg-white text-slate-900 font-extrabold text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none cursor-pointer tracking-wide"
        >
          <option
            value=""
            className="font-bold text-slate-400"
          >
            -
          </option>

          {loanTypesList.map((type) => (
            <option
              key={type.id}
              value={type.id}
              className="font-bold py-1 text-slate-800"
            >
              {type.name} ({type.subtitle})
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {/* CONDITION BADGE */}
      {selectedLoanType && (
        <LoanConditionBadge
          loanTypeId={selectedLoanType}
          variant="light"
          propertyYears={
            Math.round(totalMonths / 12) || 15
          }
          onSelectPropertyYears={(years) => {
            setTenureValue(
              years.toString()
            );

            setTenureUnit('years');

            setInterestRate(
              getDynamicPropertyLoanRate(
                years * 12,
                conditions['property-loan']
                  ?.propertyTiers
              ).toString()
            );
          }}
        />
      )}

      {/* GUARANTEE MEMBERSHIP PERIOD */}
      {selectedLoanType === 'guarantee-loan' && (
        <div className="mt-2 flex flex-col gap-1.5">
          <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />

            <span>
              සාමාජිකත්ව කාල සීමාව
            </span>

            <span className="text-xs font-semibold text-slate-500 normal-case">
              (Membership Period - Years)
            </span>
          </label>

          <input
            id="input-membership-years"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={membershipYears}
            onChange={(e) => {
              const value =
                e.target.value;

              if (value === '') {
                setMembershipYears('');
                return;
              }

              const num =
                parseFloat(value);

              if (
                !Number.isNaN(num) &&
                num >= 0
              ) {
                setMembershipYears(value);
              }
            }}
            placeholder="වසර ගණන ඇතුළත් කරන්න"
            className="w-full py-3 px-5 rounded-full bg-white text-slate-900 font-bold text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />

          {/* CURRENT GUARANTEE LIMIT */}
          {guaranteeLimits && (
            <div className="mt-1 p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-900">
              <div>
                උපරිම ණය මුදල:{' '}
                <span className="font-black">
                  Rs.{' '}
                  {guaranteeLimits.maxLimit.toLocaleString(
                    'en-US'
                  )}
                </span>
              </div>

              <div>
                උපරිම ආපසු ගෙවීමේ කාලය:{' '}
                <span className="font-black">
                  {
                    guaranteeLimits.maxPeriodMonths
                  }{' '}
                  Months
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* LOAN AMOUNT */}
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />

        <span>LOAN AMOUNT</span>

        <span className="text-xs font-semibold text-slate-500 normal-case">
          (ණය මුදල)
        </span>
      </label>

      <div className="relative">
        <input
          id="input-loan-amount"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={11}
          value={loanAmount}
          onChange={(e) => {
            const digits =
              e.target.value
                .replace(/[^0-9]/g, '')
                .slice(0, 7);

            setLoanAmount(
              digits
                ? Number(
                    digits
                  ).toLocaleString(
                    'en-US'
                  )
                : ''
            );
          }}
          placeholder="-"
          className="w-full py-3 px-5 pr-14 rounded-full bg-white text-slate-900 font-bold text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
          Rs.
        </div>
      </div>
    </div>

    {/* YEARS / MONTHS */}
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />

        <span>YEARS/MONTHS</span>

        <span className="text-xs font-semibold text-slate-500 normal-case">
          (ආපසු ගෙවීමේ කාලය - වසර / මාස)
        </span>
      </label>

      <div className="flex gap-2">
        <input
          id="input-loan-tenure"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min="1"
          max={tenureMax}
          value={tenureValue}
          onChange={(e) => {
            const value =
              e.target.value.replace(
                /[^0-9]/g,
                ''
              );

            setTenureValue(value);
          }}
          placeholder="-"
          className="w-full py-3 px-5 rounded-full bg-white text-slate-900 font-bold text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        <div className="flex rounded-full bg-white p-1 border border-slate-200 shadow-xs shrink-0">
          <button
            type="button"
            onClick={() =>
              setTenureUnit('years')
            }
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
            onClick={() =>
              setTenureUnit('months')
            }
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

    {/* RATE */}
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />

        <span>
          RATE (% Annual Interest)
        </span>

        <span className="text-xs font-semibold text-slate-500 normal-case">
          (වාර්ෂික පොලී අනුපාතිකය)
        </span>
      </label>

      <div className="relative">
        <input
          id="input-loan-rate"
          type="number"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          step="0.1"
          min="0"
          max="100"
          value={interestRate}
          onChange={(e) =>
            setInterestRate(
              e.target.value
            )
          }
          placeholder="-"
          className="w-full py-3 px-5 pr-10 rounded-full bg-white text-slate-900 font-bold text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
          %
        </div>
      </div>
    </div>

    {/* WARNING */}
    {limitWarning && (
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs font-black shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />

        <span>{limitWarning}</span>
      </div>
    )}

    {/* INSTALLMENT */}
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />

        <span>INSTALLMENT</span>

        <span className="text-xs font-semibold text-slate-500 normal-case">
          (මාසික මූලික වාරිකය)
        </span>
      </label>

      <div
        id="display-monthly-installment"
        className="w-full py-3.5 px-5 rounded-full bg-white text-sky-600 font-black text-lg sm:text-xl text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05)] border-2 border-sky-200"
      >
        {principal > 0 &&
        totalMonths > 0 &&
        !calculationBlocked
          ? formatLKR(installment)
          : '-'}
      </div>
    </div>

    {/* INTEREST */}
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />

        <span>
          INTEREST (Monthly)
        </span>

        <span className="text-xs font-semibold text-slate-500 normal-case">
          (මාසික පොලී මුදල)
        </span>
      </label>

      <div
        id="display-monthly-interest"
        className="w-full py-3.5 px-5 rounded-full bg-white text-slate-800 font-extrabold text-base sm:text-lg text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] border border-slate-200"
      >
        {principal > 0 &&
        rate > 0 &&
        !calculationBlocked
          ? formatLKR(monthlyInterest)
          : '-'}
      </div>
    </div>

    {/* TOTAL OF INSTALLMENT */}
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5 flex-wrap">
        <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />

        <span>
          TOTAL OF INSTALLMENT
        </span>

        <span className="text-xs font-semibold text-emerald-700 normal-case">
          (මුළු මාසික වාරිකය)
        </span>
      </label>

      <div
        id="display-total-installment"
        className="w-full py-3.5 px-5 rounded-full bg-white text-emerald-700 font-black text-lg sm:text-xl text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05)] border border-emerald-200"
      >
        {principal > 0 &&
        (totalMonths > 0 ||
          rate > 0) &&
        !calculationBlocked
          ? formatLKR(
              totalOfInstallment
            )
          : '-'}
      </div>
    </div>
  </div>

  {/* CLEAR BUTTON */}
  <div className="w-full max-w-[360px] mx-auto pt-3 pb-6 text-center z-10">
    <button
      id="btn-loan-clear"
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
