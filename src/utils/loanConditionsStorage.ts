import { useState, useEffect, useCallback } from 'react';
import { LoanConditionDetails } from '../data/applicationsData';

export interface PropertyLoanTiers {
  tier1MaxYears: number;
  tier1Rate: number;
  tier2MaxYears: number;
  tier2Rate: number;
  tier3MaxYears: number;
  tier3Rate: number;
}
export interface GuaranteeLoanTiers {
  tier1MaxYears: number;
  tier1MaxLimit: number;
  tier1MaxPeriodMonths: number;

  tier2MaxYears: number;
  tier2MaxLimit: number;
  tier2MaxPeriodMonths: number;

  tier3MaxLimit: number;
  tier3MaxPeriodMonths: number;
}
export interface EditableLoanCondition {
  id: string;
  name: string;
  subtitle: string;
  defaultRate: number;
  maxPeriodMonths: number;
  defaultPeriodMonths: number;
  maxLimit?: number; // 0 or undefined for fixed deposit
  maxLimitText: string;
  maxTenureText: string;
  rateText: string;
  extraNote?: string;
  description?: string;
  propertyTiers?: PropertyLoanTiers;
  guaranteeTiers?: GuaranteeLoanTiers;
}

export const STORAGE_KEY_LOAN_CONDITIONS = 'ud_custom_loan_conditions';
export const EVENT_LOAN_CONDITIONS_CHANGED = 'ud_loan_conditions_changed';

export const DEFAULT_LOAN_CONDITIONS: Record<string, EditableLoanCondition> = {
  'festivel-loan': {
    id: 'festivel-loan',
    name: 'FESTIVEL LOAN',
    subtitle: 'à¶‹à¶­à·Šà·ƒà·€ à¶«à¶º',
    defaultRate: 8,
    defaultPeriodMonths: 18,
    maxPeriodMonths: 18,
    maxLimit: 500000,
    maxLimitText: 'à¶»à·”. 500,000',
    maxTenureText: 'à¶¸à·à·ƒ 18 (18 Months)',
    rateText: '8%',
    extraNote: 'à¶‹à¶­à·Šà·ƒà·€ à¶…à¶­à·Šà¶­à·’à¶šà·à¶»à¶¸à·Š à¶´à·„à·ƒà·”à¶šà¶¸',
    description: 'Special festival advance with short repayment tenure (18 months).',
  },
  'guarantee-loan': {
    id: 'guarantee-loan',
    name: 'GUARANTEE LOAN',
    subtitle: 'à¶‡à¶´à¶šà¶» à¶«à¶º',
    defaultRate: 6,
    defaultPeriodMonths: 84,
    maxPeriodMonths: 84,
    maxLimit: 1000000,
    maxLimitText: 'à¶»à·”. 1,000,000',
    maxTenureText: 'à·€à·ƒà¶» 7 / à¶¸à·à·ƒ 84 (7 Years)',
    rateText: '6%',
    extraNote: 'à·ƒà·”à¶¯à·”à·ƒà·” à·ƒà·Šà¶®à·’à¶» à¶‡à¶´à¶šà¶»à·”à·€à¶±à·Š à¶‰à¶¯à·’à¶»à·’à¶´à¶­à·Š à¶šà·’à¶»à·“à¶¸ à¶¸à¶­',
    description: 'Personal surety-backed loan requiring eligible permanent guarantors.',
    guaranteeTiers: {
      tier1MaxYears: 2,
      tier1MaxLimit: 500000,
      tier1MaxPeriodMonths: 60,

      tier2MaxYears: 5,
      tier2MaxLimit: 800000,
      tier2MaxPeriodMonths: 84,

      tier3MaxLimit: 1000000,
      tier3MaxPeriodMonths: 84,
    },
  },
  'commodity-goods-loan': {
    id: 'commodity-goods-loan',
    name: 'COMMODITY / GOODS LOAN',
    subtitle: 'à¶·à·à¶«à·Šà¶© à¶«à¶º',
    defaultRate: 8,
    defaultPeriodMonths: 48,
    maxPeriodMonths: 48,
    maxLimit: 500000,
    maxLimitText: 'à¶»à·”. 500,000',
    maxTenureText: 'à·€à·ƒà¶» 4 / à¶¸à·à·ƒ 48 (4 Years)',
    rateText: '8%',
    extraNote: 'à¶œà·˜à·„ à¶‹à¶´à¶šà¶»à¶« à·„à· à¶·à·à¶«à·Šà¶© à¶¸à·’à¶½à¶¯à·“ à¶œà·à¶±à·“à¶¸ à·ƒà¶³à·„à·',
    description: 'Loan facility for household appliances, furniture, and consumer goods.',
  },
  'fixed-deposit-loan': {
    id: 'fixed-deposit-loan',
    name: 'FIXED DEPOSIT LOAN',
    subtitle: 'à·ƒà·Šà¶®à·à·€à¶» à¶­à·à¶±à·Šà¶´à¶­à·” à¶«à¶º',
    defaultRate: 6,
    defaultPeriodMonths: 10,
    maxPeriodMonths: 10,
    maxLimit: 0,
    maxLimitText: 'à¶­à·à¶±à·Šà¶´à¶­à·” à·€à¶§à·’à¶±à·à¶šà¶¸ à¶¸à¶­ à¶´à¶¯à¶±à¶¸à·Šà·€',
    maxTenureText: 'à¶¸à·à·ƒ 10 (10 Months)',
    rateText: '6%',
    extraNote: 'à·ƒà·Šà¶®à·à·€à¶» à¶­à·à¶±à·Šà¶´à¶­à·” à¶‡à¶´ à·ƒà·”à¶»à·à¶šà·”à¶¸ à¶¸à¶­',
    description: 'Quick credit against fixed deposit security at preferential interest rates.',
  },
  'property-loan': {
    id: 'property-loan',
    name: 'PROPERTY LOAN',
    subtitle: 'à¶¯à·šà¶´à·… à¶«à¶º',
    defaultRate: 5,
    defaultPeriodMonths: 180,
    maxPeriodMonths: 300,
    maxLimit: 5000000,
    maxLimitText: 'à¶»à·”. 5,000,000',
    maxTenureText: 'à·€à·ƒà¶» 25 / à¶¸à·à·ƒ 300 (25 Years)',
    rateText: 'â‰¤ 15y: 5% | 15-20y: 5.5% | 20-25y: 6%',
    extraNote: 'à¶¯à·šà¶´à·œà·… à¶¸à·’à¶½à¶¯à·“ à¶œà·à¶±à·“à¶¸à·Š à·„à· à·ƒà¶‚à·€à¶»à·Šà¶°à¶±à¶º à·ƒà¶³à·„à·',
    description: 'à¶¯à·šà¶´à·œà·… à¶«à¶º à¶´à·„à·ƒà·”à¶šà¶¸ (à¶‹à¶´à¶»à·’à¶¸ à¶»à·”. 5,000,000 | à·€à·ƒà¶» 15 à¶¯à¶šà·Šà·€à· 5% | à·€à·ƒà¶» 15-20: 5.5% | à·€à·ƒà¶» 20-25: 6%).',
    propertyTiers: {
      tier1MaxYears: 15,
      tier1Rate: 5,
      tier2MaxYears: 20,
      tier2Rate: 5.5,
      tier3MaxYears: 25,
      tier3Rate: 6,
    },
  },
  'spectacal-goods-loan': {
    id: 'spectacal-goods-loan',
    name: 'SPECTACAL/GOODS LOAN',
    subtitle: 'à¶‹à¶´à·à·ƒà·Š / à¶·à·à¶«à·Šà¶© à¶«à¶º',
    defaultRate: 8,
    defaultPeriodMonths: 24,
    maxPeriodMonths: 24,
    maxLimit: 30000,
    maxLimitText: 'à¶»à·”. 30,000',
    maxTenureText: 'à·€à·ƒà¶» 2 / à¶¸à·à·ƒ 24 (2 Years)',
    rateText: '8%',
    extraNote: 'à¶‹à¶´à·à·ƒà·Š à¶ºà·”à·€à·… à·„à· à¶·à·à¶«à·Šà¶© à¶¸à·’à¶½à¶¯à·“ à¶œà·à¶±à·“à¶¸ à·ƒà¶³à·„à·',
    description: 'à¶‹à¶´à·à·ƒà·Š à¶ºà·”à·€à·… à·ƒà·„ à¶·à·à¶«à·Šà¶© à¶«à¶º à¶´à·„à·ƒà·”à¶šà¶¸ (à¶‹à¶´à¶»à·’à¶¸ à¶»à·”. 30,000 | à¶‹à¶´à¶»à·’à¶¸ à¶šà·à¶½à¶º à·€à·ƒà¶» 2 | à·€à·à¶»à·Šà·‚à·’à¶š à¶´à·œà¶½à·’à¶º 8%).',
  },
};

/**
 * Retrieve active loan conditions from localStorage, merged with defaults
 */

export function getStoredLoanConditions(): Record<string, EditableLoanCondition> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOAN_CONDITIONS);

    if (!raw) {
      return JSON.parse(JSON.stringify(DEFAULT_LOAN_CONDITIONS));
    }

    const parsed = JSON.parse(raw);
    const merged: Record<string, EditableLoanCondition> = {};

    // Load original/default loan types.
    // Saved changes are merged on top of their factory defaults.
    for (const key of Object.keys(DEFAULT_LOAN_CONDITIONS)) {
      if (parsed[key]) {
        merged[key] = {
          ...DEFAULT_LOAN_CONDITIONS[key],
          ...parsed[key],
          propertyTiers: DEFAULT_LOAN_CONDITIONS[key].propertyTiers
            ? {
                ...DEFAULT_LOAN_CONDITIONS[key].propertyTiers,
                ...(parsed[key].propertyTiers || {}),
              }
            : parsed[key].propertyTiers,
        };
      } else {
        merged[key] = JSON.parse(
          JSON.stringify(DEFAULT_LOAN_CONDITIONS[key])
        );
      }
    }

    // IMPORTANT:
    // Keep all user-created/custom loan types.
    for (const [key, value] of Object.entries(parsed)) {
      if (!Object.prototype.hasOwnProperty.call(DEFAULT_LOAN_CONDITIONS, key)) {
        merged[key] = value as EditableLoanCondition;
      }
    }

    return merged;
  } catch (e) {
    console.error('Error reading stored loan conditions:', e);
    return JSON.parse(JSON.stringify(DEFAULT_LOAN_CONDITIONS));
  }
}
/**
 * Save updated loan conditions to localStorage and dispatch update event
 */
export function saveStoredLoanConditions(conditions: Record<string, EditableLoanCondition>): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOAN_CONDITIONS, JSON.stringify(conditions));
    window.dispatchEvent(new CustomEvent(EVENT_LOAN_CONDITIONS_CHANGED));
  } catch (e) {
    console.error('Error saving loan conditions:', e);
  }
}

/**
 * Reset loan conditions to factory defaults and dispatch update event
 */
export function resetStoredLoanConditions(): void {
  try {
    const factoryDefaults = JSON.parse(
      JSON.stringify(DEFAULT_LOAN_CONDITIONS)
    );

    localStorage.setItem(
      STORAGE_KEY_LOAN_CONDITIONS,
      JSON.stringify(factoryDefaults)
    );

    window.dispatchEvent(
      new CustomEvent(EVENT_LOAN_CONDITIONS_CHANGED)
    );
  } catch (e) {
    console.error('Error resetting loan conditions:', e);
  }
}

/**
 * Check if custom loan conditions are currently active
 */
export function hasCustomLoanConditions(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY_LOAN_CONDITIONS);
  } catch {
    return false;
  }
}

/**
 * Calculate dynamic Property Loan rate based on months and custom tiers if available
 */
export function getDynamicPropertyLoanRate(
  months: number,
  tiers?: PropertyLoanTiers
): number {
  const currentTiers = tiers || DEFAULT_LOAN_CONDITIONS['property-loan'].propertyTiers!;
  const tier1Months = currentTiers.tier1MaxYears * 12;
  const tier2Months = currentTiers.tier2MaxYears * 12;

  if (months <= 0) return currentTiers.tier1Rate;
  if (months <= tier1Months) return currentTiers.tier1Rate;
  if (months <= tier2Months) return currentTiers.tier2Rate;
  return currentTiers.tier3Rate;
}

/**
 * Helper to convert conditions dictionary to LOAN_TYPES list
 */
export function convertToLoanTypes(conditions: Record<string, EditableLoanCondition>) {
  return Object.values(conditions).map((c) => ({
    id: c.id,
    name: c.name,
    subtitle: c.subtitle,
    defaultRate: c.defaultRate,
    defaultPeriodMonths: c.defaultPeriodMonths,
    maxPeriodMonths: c.maxPeriodMonths,
    maxLimit: c.maxLimit,
    description: c.description || `${c.name} (${c.subtitle})`,
  }));
}

/**
 * Helper to convert conditions dictionary to LoanConditionDetails map
 */
export function convertToConditionsMap(
  conditions: Record<string, EditableLoanCondition>
): Record<string, LoanConditionDetails> {
  const map: Record<string, LoanConditionDetails> = {};
  for (const [id, c] of Object.entries(conditions)) {
    map[id] = {
      id: c.id,
      name: c.name,
      subtitle: c.subtitle,
      maxLimit: c.maxLimit,
      maxLimitText: c.maxLimitText,
      maxTenureText: c.maxTenureText,
      rateText: c.rateText,
      extraNote: c.extraNote,
    };
  }
  return map;
}

/**
 * React Hook to access and manipulate loan conditions reactively across the entire app
 */
export function useLoanConditions() {
  const [conditions, setConditions] = useState<Record<string, EditableLoanCondition>>(
    getStoredLoanConditions
  );
  const [isCustomized, setIsCustomized] = useState<boolean>(hasCustomLoanConditions);

  const refresh = useCallback(() => {
    setConditions(getStoredLoanConditions());
    setIsCustomized(hasCustomLoanConditions());
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener(EVENT_LOAN_CONDITIONS_CHANGED, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_LOAN_CONDITIONS_CHANGED, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const save = useCallback(
    (newConditions: Record<string, EditableLoanCondition>) => {
      saveStoredLoanConditions(newConditions);
      refresh();
    },
    [refresh]
  );

  const reset = useCallback(() => {
    resetStoredLoanConditions();
    refresh();
  }, [refresh]);

  const loanTypesList = convertToLoanTypes(conditions);
  const conditionsMap = convertToConditionsMap(conditions);

  return {
    conditions,
    loanTypesList,
    conditionsMap,
    isCustomized,
    saveConditions: save,
    resetConditions: reset,
    refresh,
  };
}

