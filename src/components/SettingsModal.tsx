import React, { useState, useEffect } from 'react';
import {
useLoanConditions,
EditableLoanCondition,
DEFAULT_LOAN_CONDITIONS,
} from '../utils/loanConditionsStorage';
import {
X,
Settings as SettingsIcon,
Sliders,
RotateCcw,
Check,
Save,
AlertCircle,
Percent,
Calendar,
DollarSign,
FileText,
HelpCircle,
Sparkles,
Layers,
} from 'lucide-react';

interface SettingsModalProps {
isOpen: boolean;
onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
isOpen,
onClose,
}) => {
const { conditions, saveConditions } = useLoanConditions();

const [activeTab, setActiveTab] = useState<'conditions' | 'about'>(
'conditions'
);

const [selectedLoanId, setSelectedLoanId] =
useState<string>('festivel-loan');

const [draftConditions, setDraftConditions] = useState<
Record<string, EditableLoanCondition>

> (conditions);

const [showNewLoanForm, setShowNewLoanForm] = useState(false);

const [newLoanType, setNewLoanType] = useState({
name: '',
subtitle: '',
maxLimit: 1000000,
defaultRate: 6,
defaultPeriodMonths: 84,
extraNote: '',
});

const [statusMessage, setStatusMessage] = useState('');

useEffect(() => {
if (isOpen) {
setDraftConditions(conditions);
setStatusMessage('');
}
}, [isOpen, conditions]);

if (!isOpen) {
return null;
}

const activeLoan =
draftConditions[selectedLoanId] ||
draftConditions['festivel-loan'];

const handleFieldChange = (
field: keyof EditableLoanCondition,
value: string | number
) => {
setDraftConditions((prev) => {
const current = prev[selectedLoanId];


  if (!current) {
    return prev;
  }

  const updated: EditableLoanCondition = {
    ...current,
    [field]: value,
  };

  if (field === 'defaultRate') {
    updated.rateText = String(value) + '%';
  }

  if (field === 'maxPeriodMonths') {
    const months = Number(value) || 0;
    const years = (months / 12).toFixed(1);

    updated.maxTenureText =
      'මාස ' + String(months) + ' (' + years + ' Years)';
  }

  if (field === 'maxLimit') {
    updated.maxLimitText =
      'රු. ' + Number(value).toLocaleString('en-US');
  }

  return {
  ...prev,
  [selectedLoanId]: updated,
};

});
};

const handleTierRateChange = (
field: 'tier1Rate' | 'tier2Rate' | 'tier3Rate',
value: number
) => {
setDraftConditions((prev) => {
const current = prev['property-loan'];


  if (!current || !current.propertyTiers) {
    return prev;
  }

  return {
    ...prev,
    'property-loan': {
      ...current,
      propertyTiers: {
        ...current.propertyTiers,
        [field]: value,
      },
    },
  };
});


};

const handleGuaranteeTierChange = (
field:
| 'tier1MaxYears'
| 'tier1MaxLimit'
| 'tier1MaxPeriodMonths'
| 'tier2MaxYears'
| 'tier2MaxLimit'
| 'tier2MaxPeriodMonths'
| 'tier3MaxLimit'
| 'tier3MaxPeriodMonths',
value: number
) => {
setDraftConditions((prev) => {
const current = prev['guarantee-loan'];


  if (!current || !current.guaranteeTiers) {
    return prev;
  }

  const updatedGuaranteeTiers = {
    ...current.guaranteeTiers,
    [field]: value,
  };

  const updatedLoan: EditableLoanCondition = {
    ...current,
    guaranteeTiers: updatedGuaranteeTiers,
  };

  if (field === 'tier3MaxLimit') {
    updatedLoan.maxLimit = value;
    updatedLoan.maxLimitText =
      'රු. ' + Number(value).toLocaleString('en-US');
  }

  if (field === 'tier3MaxPeriodMonths') {
    const months = Number(value) || 0;
    const years = (months / 12).toFixed(1);

    updatedLoan.maxPeriodMonths = months;
    updatedLoan.defaultPeriodMonths = months;
    updatedLoan.maxTenureText =
      'මාස ' +
      String(months) +
      ' (' +
      years +
      ' Years)';
  }

  return {
    ...prev,
    'guarantee-loan': updatedLoan,
  };
});


};

const handleCreateLoanType = () => {
const trimmedName = newLoanType.name.trim();


if (!trimmedName) {
  setStatusMessage('⚠ Please enter a loan type name.');
  return;
}

const id =
  trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') ||
  'custom-loan-' + String(Date.now());

if (draftConditions[id]) {
  setStatusMessage(
    '⚠ A loan type with this name already exists.'
  );
  return;
}

const maxLimit = Number(newLoanType.maxLimit) || 0;
const rate = Number(newLoanType.defaultRate) || 0;
const months =
  Number(newLoanType.defaultPeriodMonths) || 0;

const years = (months / 12).toFixed(1);

const newCondition: EditableLoanCondition = {
  id: id,
  name: trimmedName,
  subtitle: newLoanType.subtitle.trim(),
  defaultRate: rate,
  defaultPeriodMonths: months,
  maxPeriodMonths: months,
  maxLimit: maxLimit,
  maxLimitText:
    'රු. ' + maxLimit.toLocaleString('en-US'),
  maxTenureText:
    'මාස ' +
    String(months) +
    ' (' +
    years +
    ' Years)',
  rateText: String(rate) + '%',
  extraNote: newLoanType.extraNote.trim(),
  description: newLoanType.extraNote.trim(),
};

const updated = {
  ...draftConditions,
  [id]: newCondition,
};

setDraftConditions(updated);
setSelectedLoanId(id);
setShowNewLoanForm(false);

setNewLoanType({
  name: '',
  subtitle: '',
  maxLimit: 1000000,
  defaultRate: 6,
  defaultPeriodMonths: 84,
  extraNote: '',
});

setStatusMessage(
  '✓ New loan type added. Click Save Conditions.'
);


};

const handleDeleteLoanType = () => {
if (!activeLoan) {
return;
}


const defaultLoanIds = Object.keys(
  DEFAULT_LOAN_CONDITIONS
);

if (defaultLoanIds.includes(activeLoan.id)) {
  setStatusMessage(
    '⚠ Default loan types cannot be deleted. You can edit their conditions.'
  );
  return;
}

setDraftConditions((prev) => {
  const next = { ...prev };
  delete next[activeLoan.id];
  return next;
});

setSelectedLoanId('festivel-loan');
setStatusMessage('✓ Custom loan type removed.');


};

const handleSave = () => {
saveConditions(draftConditions);
onClose();
};

const handleReset = () => {
const customLoans: Record<
string,
EditableLoanCondition
> = {};


Object.entries(draftConditions).forEach(
  ([id, loan]) => {
    if (!DEFAULT_LOAN_CONDITIONS[id]) {
      customLoans[id] = loan;
    }
  }
);

const resetConditions = {
  ...DEFAULT_LOAN_CONDITIONS,
  ...customLoans,
};

setDraftConditions(resetConditions);

if (!resetConditions[selectedLoanId]) {
  setSelectedLoanId('festivel-loan');
}

setStatusMessage(
  '✓ Default loan conditions restored. Custom loans were kept.'
);


};

const loans = Object.values(draftConditions);

return ( <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4"> <div className="w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-3xl bg-slate-950 border border-white/10 shadow-2xl flex flex-col">


    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-slate-900/80">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-cyan-300" />
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            Settings
          </h2>

          <p className="text-[11px] sm:text-xs text-slate-400">
            Loan conditions & application settings
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
        aria-label="Close settings"
      >
        <X className="w-5 h-5 text-slate-300" />
      </button>
    </div>

    <div className="px-4 sm:px-6 pt-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('conditions')}
          className={
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition ' +
            (activeTab === 'conditions'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-white/5 text-slate-300 hover:bg-white/10')
          }
        >
          <Sliders className="w-4 h-4" />
          Conditions
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition ' +
            (activeTab === 'about'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-white/5 text-slate-300 hover:bg-white/10')
          }
        >
          <HelpCircle className="w-4 h-4" />
          About
        </button>
      </div>
    </div>

    {statusMessage && (
      <div className="mx-4 sm:mx-6 mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
        {statusMessage.startsWith('⚠') ? (
          <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
        ) : (
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
        )}

        <span className="text-xs sm:text-sm font-bold text-white">
          {statusMessage}
        </span>
      </div>
    )}

    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
      {activeTab === 'conditions' ? (
        <div className="space-y-5">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-cyan-300" />

              <h3 className="text-sm font-black text-white">
                Select Loan Type
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {loans.map((loan) => (
                <button
                  key={loan.id}
                  type="button"
                  onClick={() =>
                    setSelectedLoanId(loan.id)
                  }
                  className={
                    'text-left rounded-2xl border p-3 transition ' +
                    (selectedLoanId === loan.id
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]')
                  }
                >
                  <div className="text-xs font-black text-white truncate">
                    {loan.name}
                  </div>

                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {loan.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <button
              type="button"
              onClick={() =>
                setShowNewLoanForm((prev) => !prev)
              }
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-300" />

                <span className="text-sm font-black text-white">
                  Add New Loan Type
                </span>
              </div>

              <span className="text-xs font-bold text-slate-400">
                {showNewLoanForm ? 'Hide' : 'Open'}
              </span>
            </button>

            {showNewLoanForm && (
              <div className="border-t border-white/10 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>
                  <label className="text-[11px] font-bold text-slate-400">
                    Loan Name
                  </label>

                  <input
                    type="text"
                    value={newLoanType.name}
                    onChange={(e) =>
                      setNewLoanType((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-2.5 text-sm font-bold outline-none"
                    placeholder="Example: EDUCATION LOAN"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400">
                    Subtitle
                  </label>

                  <input
                    type="text"
                    value={newLoanType.subtitle}
                    onChange={(e) =>
                      setNewLoanType((prev) => ({
                        ...prev,
                        subtitle: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-2.5 text-sm font-bold outline-none"
                    placeholder="Sinhala subtitle"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400">
                    Maximum Loan Limit
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newLoanType.maxLimit}
                    onChange={(e) =>
                      setNewLoanType((prev) => ({
                        ...prev,
                        maxLimit:
                          Number(e.target.value) || 0,
                      }))
                    }
                    className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-2.5 text-sm font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400">
                    Annual Interest Rate %
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newLoanType.defaultRate}
                    onChange={(e) =>
                      setNewLoanType((prev) => ({
                        ...prev,
                        defaultRate:
                          Number(e.target.value) || 0,
                      }))
                    }
                    className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-2.5 text-sm font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400">
                    Repayment Months
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      newLoanType.defaultPeriodMonths
                    }
                    onChange={(e) =>
                      setNewLoanType((prev) => ({
                        ...prev,
                        defaultPeriodMonths:
                          Number(e.target.value) || 0,
                      }))
                    }
                    className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-2.5 text-sm font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400">
                    Extra Note
                  </label>

                  <input
                    type="text"
                    value={newLoanType.extraNote}
                    onChange={(e) =>
                      setNewLoanType((prev) => ({
                        ...prev,
                        extraNote: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-2.5 text-sm font-bold outline-none"
                    placeholder="Optional note"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateLoanType}
                    className="px-5 py-2.5 rounded-xl bg-fuchsia-500 text-white text-sm font-black hover:bg-fuchsia-400 transition"
                  >
                    Create Loan Type
                  </button>
                </div>

              </div>
            )}
          </div>

          {activeLoan && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">

              <div className="px-4 sm:px-5 py-4 border-b border-white/10 bg-slate-900/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {activeLoan.name}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      {activeLoan.subtitle}
                    </p>
                  </div>

                  {!DEFAULT_LOAN_CONDITIONS[
                    activeLoan.id
                  ] && (
                    <button
                      type="button"
                      onClick={handleDeleteLoanType}
                      className="px-3 py-2 rounded-xl border border-red-400/20 bg-red-400/10 text-red-300 text-xs font-black hover:bg-red-400/20 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="w-4 h-4 text-emerald-300" />

                      <label className="text-xs font-black text-white">
                        Annual Interest Rate
                      </label>
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={activeLoan.defaultRate}
                      onChange={(e) =>
                        handleFieldChange(
                          'defaultRate',
                          Number(e.target.value) || 0
                        )
                      }
                      className="w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-lg font-black outline-none"
                    />

                    <div className="text-[10px] text-slate-500 mt-2">
                      Display: {activeLoan.rateText}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-cyan-300" />

                      <label className="text-xs font-black text-white">
                        Max Repayment Months
                      </label>
                    </div>

                    <input
                      type="number"
                      min="0"
                      value={activeLoan.maxPeriodMonths}
                      onChange={(e) =>
                        handleFieldChange(
                          'maxPeriodMonths',
                          Number(e.target.value) || 0
                        )
                      }
                      className="w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-lg font-black outline-none"
                    />

                    <div className="text-[10px] text-slate-500 mt-2">
                      Display: {activeLoan.maxTenureText}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-amber-300" />

                      <label className="text-xs font-black text-white">
                        Maximum Loan Limit
                      </label>
                    </div>

                    <input
                      type="number"
                      min="0"
                      value={activeLoan.maxLimit}
                      onChange={(e) =>
                        handleFieldChange(
                          'maxLimit',
                          Number(e.target.value) || 0
                        )
                      }
                      className="w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-lg font-black outline-none"
                    />

                    <div className="text-[10px] text-slate-500 mt-2">
                      Display: {activeLoan.maxLimitText}
                    </div>
                  </div>

                </div>

                {activeLoan.id === 'property-loan' &&
                  activeLoan.propertyTiers && (
                    <div className="rounded-3xl border border-violet-400/20 bg-violet-400/5 overflow-hidden">

                      <div className="px-4 sm:px-5 py-4 border-b border-violet-400/20">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-violet-300" />

                          <h4 className="text-sm sm:text-base font-black text-white">
                            Property Loan Tenure Tier Rates
                          </h4>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1">
                          Configure the annual interest rate for each property loan tenure range.
                        </p>
                      </div>

                      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">

                        <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4">
                          <div className="text-xs font-black text-white">
                            Tier 1
                          </div>

                          <div className="text-[10px] text-slate-500 mt-1">
                            First property tenure tier
                          </div>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              activeLoan.propertyTiers.tier1Rate
                            }
                            onChange={(e) =>
                              handleTierRateChange(
                                'tier1Rate',
                                Number(e.target.value) || 0
                              )
                            }
                            className="mt-3 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center text-lg font-black outline-none"
                          />

                          <div className="text-[10px] text-slate-500 mt-1 text-center">
                            Annual Rate %
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4">
                          <div className="text-xs font-black text-white">
                            Tier 2
                          </div>

                          <div className="text-[10px] text-slate-500 mt-1">
                            Second property tenure tier
                          </div>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              activeLoan.propertyTiers.tier2Rate
                            }
                            onChange={(e) =>
                              handleTierRateChange(
                                'tier2Rate',
                                Number(e.target.value) || 0
                              )
                            }
                            className="mt-3 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center text-lg font-black outline-none"
                          />

                          <div className="text-[10px] text-slate-500 mt-1 text-center">
                            Annual Rate %
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4">
                          <div className="text-xs font-black text-white">
                            Tier 3
                          </div>

                          <div className="text-[10px] text-slate-500 mt-1">
                            Third property tenure tier
                          </div>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              activeLoan.propertyTiers.tier3Rate
                            }
                            onChange={(e) =>
                              handleTierRateChange(
                                'tier3Rate',
                                Number(e.target.value) || 0
                              )
                            }
                            className="mt-3 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center text-lg font-black outline-none"
                          />

                          <div className="text-[10px] text-slate-500 mt-1 text-center">
                            Annual Rate %
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                {activeLoan.id === 'guarantee-loan' &&
                  activeLoan.guaranteeTiers && (
                    <div className="rounded-3xl border border-amber-400/25 bg-amber-400/5 overflow-hidden">

                      <div className="px-4 sm:px-5 py-4 border-b border-amber-400/20">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-300" />

                          <h4 className="text-sm sm:text-base font-black text-white">
                            Guarantee Loan Membership Conditions
                          </h4>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1">
                          සාමාජිකත්ව කාලය අනුව උපරිම ණය මුදල සහ උපරිම ගෙවීම් කාලය මෙතැනින් configure කරන්න.
                        </p>
                      </div>

                      <div className="p-4 sm:p-5 space-y-4">

                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">

                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div>
                              <div className="text-sm font-black text-white">
                                Tier 1 — 0–2 Years
                              </div>

                              <div className="text-[10px] text-slate-400 mt-1">
                                Membership years less than or equal to Tier 1 maximum
                              </div>
                            </div>

                            <div className="text-[10px] font-black text-emerald-300">
                              MEMBERSHIP
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                            <div>
                              <label className="text-[10px] font-black text-slate-400">
                                Max Membership Years
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={
                                  activeLoan.guaranteeTiers.tier1MaxYears
                                }
                                onChange={(e) =>
                                  handleGuaranteeTierChange(
                                    'tier1MaxYears',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center font-black outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black text-slate-400">
                                Max Loan Limit (Rs.)
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  activeLoan.guaranteeTiers.tier1MaxLimit
                                }
                                onChange={(e) =>
                                  handleGuaranteeTierChange(
                                    'tier1MaxLimit',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center font-black outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black text-slate-400">
                                Max Repayment Months
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  activeLoan.guaranteeTiers.tier1MaxPeriodMonths
                                }
                                onChange={(e) =>
                                  handleGuaranteeTierChange(
                                    'tier1MaxPeriodMonths',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center font-black outline-none"
                              />
                            </div>

                          </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">

                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div>
                              <div className="text-sm font-black text-white">
                                Tier 2 — &gt;2–5 Years
                              </div>

                              <div className="text-[10px] text-slate-400 mt-1">
                                Greater than Tier 1 and less than or equal to Tier 2 maximum
                              </div>
                            </div>

                            <div className="text-[10px] font-black text-cyan-300">
                              MEMBERSHIP
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                            <div>
                              <label className="text-[10px] font-black text-slate-400">
                                Max Membership Years
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={
                                  activeLoan.guaranteeTiers.tier2MaxYears
                                }
                                onChange={(e) =>
                                  handleGuaranteeTierChange(
                                    'tier2MaxYears',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center font-black outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black text-slate-400">
                                Max Loan Limit (Rs.)
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  activeLoan.guaranteeTiers.tier2MaxLimit
                                }
                                onChange={(e) =>
                                  handleGuaranteeTierChange(
                                    'tier2MaxLimit',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center font-black outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black text-slate-400">
                                Max Repayment Months
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  activeLoan.guaranteeTiers.tier2MaxPeriodMonths
                                }
                                onChange={(e) =>
                                  handleGuaranteeTierChange(
                                    'tier2MaxPeriodMonths',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center font-black outline-none"
                              />
                            </div>

                          </div>
                        </div>

                        <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/5 p-4">

                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div>
                              <div className="text-sm font-black text-white">
                                Tier 3 — &gt;5 Years
                              </div>

                              <div className="text-[10px] text-slate-400 mt-1">
                                Greater than Tier 2 maximum
                              </div>
                            </div>

                            <div className="text-[10px] font-black text-fuchsia-300">
                              MEMBERSHIP
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <div>
                              <label className="text-[10px] font-black text-slate-400">
                                Max Loan Limit (Rs.)
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  activeLoan.guaranteeTiers.tier3MaxLimit
                                }
                                onChange={(e) =>
                                  handleGuaranteeTierChange(
                                    'tier3MaxLimit',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center text-lg font-black outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-black text-slate-400">
                                Max Repayment Months
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  activeLoan.guaranteeTiers.tier3MaxPeriodMonths
                                }
                                onChange={(e) =>
                                  handleGuaranteeTierChange(
                                    'tier3MaxPeriodMonths',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-center text-lg font-black outline-none"
                              />
                            </div>

                          </div>
                        </div>

                        <div className="rounded-2xl border border-amber-300/20 bg-slate-950/70 p-4">

                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-300" />

                            <span className="text-xs font-black text-amber-200">
                              Current Guarantee Loan Rule
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-bold">

                            <div className="rounded-xl bg-white/5 p-3 text-slate-200">
                              <span className="text-emerald-300">
                                0–{activeLoan.guaranteeTiers.tier1MaxYears} Years
                              </span>

                              <br />

                              Max Rs.{' '}
                              {activeLoan.guaranteeTiers.tier1MaxLimit.toLocaleString(
                                'en-US'
                              )}{' '}
                              /{' '}
                              {
                                activeLoan.guaranteeTiers
                                  .tier1MaxPeriodMonths
                              }{' '}
                              Months
                            </div>

                            <div className="rounded-xl bg-white/5 p-3 text-slate-200">
                              <span className="text-cyan-300">
                                &gt;{activeLoan.guaranteeTiers.tier1MaxYears}–
                                {activeLoan.guaranteeTiers.tier2MaxYears}{' '}
                                Years
                              </span>

                              <br />

                              Max Rs.{' '}
                              {activeLoan.guaranteeTiers.tier2MaxLimit.toLocaleString(
                                'en-US'
                              )}{' '}
                              /{' '}
                              {
                                activeLoan.guaranteeTiers
                                  .tier2MaxPeriodMonths
                              }{' '}
                              Months
                            </div>

                            <div className="rounded-xl bg-white/5 p-3 text-slate-200">
                              <span className="text-fuchsia-300">
                                &gt;{activeLoan.guaranteeTiers.tier2MaxYears}{' '}
                                Years
                              </span>

                              <br />

                              Max Rs.{' '}
                              {activeLoan.guaranteeTiers.tier3MaxLimit.toLocaleString(
                                'en-US'
                              )}{' '}
                              /{' '}
                              {
                                activeLoan.guaranteeTiers
                                  .tier3MaxPeriodMonths
                              }{' '}
                              Months
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">

                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-300" />

                    <label className="text-xs font-black text-white">
                      Extra Note
                    </label>
                  </div>

                  <textarea
                    value={activeLoan.extraNote || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'extraNote',
                        e.target.value
                      )
                    }
                    rows={3}
                    className="w-full rounded-xl bg-white text-slate-900 px-3 py-3 text-sm font-bold outline-none resize-none"
                    placeholder="Additional condition or note..."
                  />

                </div>

              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">

            <div className="px-4 sm:px-5 py-4 border-b border-white/10">
              <h3 className="text-sm sm:text-base font-black text-white">
                Current Conditions Summary
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">

                <thead>
                  <tr className="border-b border-white/10">

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Loan
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Rate
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Max Period
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Max Limit
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Notes
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {loans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="border-b border-white/5 last:border-0"
                    >

                      <td className="px-4 py-3">

                        <div className="text-xs font-black text-white">
                          {loan.name}
                        </div>

                        <div className="text-[10px] text-slate-500">
                          {loan.subtitle}
                        </div>

                        {loan.id === 'guarantee-loan' &&
                          loan.guaranteeTiers && (
                            <div className="text-[10px] text-cyan-300 block mt-1">

                              0–{loan.guaranteeTiers.tier1MaxYears}
                              y: Rs.{' '}
                              {loan.guaranteeTiers.tier1MaxLimit.toLocaleString(
                                'en-US'
                              )}{' '}
                              /{' '}
                              {
                                loan.guaranteeTiers
                                  .tier1MaxPeriodMonths
                              }
                              m

                              {' | '}

                              &gt;
                              {loan.guaranteeTiers.tier1MaxYears}–
                              {loan.guaranteeTiers.tier2MaxYears}
                              y: Rs.{' '}
                              {loan.guaranteeTiers.tier2MaxLimit.toLocaleString(
                                'en-US'
                              )}{' '}
                              /{' '}
                              {
                                loan.guaranteeTiers
                                  .tier2MaxPeriodMonths
                              }
                              m

                              {' | '}

                              &gt;
                              {loan.guaranteeTiers.tier2MaxYears}
                              y: Rs.{' '}
                              {loan.guaranteeTiers.tier3MaxLimit.toLocaleString(
                                'en-US'
                              )}{' '}
                              /{' '}
                              {
                                loan.guaranteeTiers
                                  .tier3MaxPeriodMonths
                              }
                              m

                            </div>
                          )}

                      </td>

                      <td className="px-4 py-3 text-xs font-black text-emerald-300">
                        {loan.rateText}
                      </td>

                      <td className="px-4 py-3 text-xs font-black text-cyan-300">
                        {loan.maxPeriodMonths} months
                      </td>

                      <td className="px-4 py-3 text-xs font-black text-amber-300">
                        {loan.maxLimitText}
                      </td>

                      <td className="px-4 py-3 text-[11px] text-slate-400 max-w-xs">
                        {loan.extraNote || '—'}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>

        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-5">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-cyan-300" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  Loan Calculator Settings
                </h3>

                <p className="text-xs text-slate-400">
                  Manage loan limits, rates and repayment conditions.
                </p>
              </div>

            </div>

            <div className="space-y-3 text-sm text-slate-300 leading-6">

              <p>
                මෙම Settings section එකෙන් application එකේ loan conditions වෙනස් කර save කරන්න පුළුවන්.
              </p>

              <p>
                Guarantee Loan සඳහා සාමාජිකත්ව කාල සීමාව අනුව වෙනස් වන maximum loan limit සහ repayment period මෙතැනින් configure කළ හැක.
              </p>

              <p>
                Save Conditions කිරීමෙන් පසුව calculator screens වලට එම conditions භාවිතා වේ.
              </p>

            </div>
          </div>

          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-5">

            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-300" />

              <h4 className="text-sm font-black text-white">
                Guarantee Loan
              </h4>
            </div>

            <div className="text-xs text-slate-300 leading-6">

              <p>
                Tier 1 maximum years value එකට අඩු හෝ සමාන membership period එක Tier 1 ලෙස සලකයි.
              </p>

              <p className="mt-2">
                Tier 1 maximum years එකට වඩා වැඩි සහ Tier 2 maximum years එකට අඩු හෝ සමාන membership period එක Tier 2 ලෙස සලකයි.
              </p>

              <p className="mt-2">
                Tier 2 maximum years එකට වඩා වැඩි membership period සඳහා Tier 3 conditions භාවිතා වේ.
              </p>

            </div>
          </div>

        </div>
      )}
    </div>

    <div className="border-t border-white/10 bg-slate-900/80 px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">

      <button
        type="button"
        onClick={handleReset}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-black transition"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Defaults
      </button>

      <div className="flex flex-col sm:flex-row gap-2">

        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-black transition"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-black transition"
        >
          <Save className="w-4 h-4" />
          Save Conditions
        </button>

      </div>
    </div>

  </div>
</div>


);
};

export default SettingsModal;
