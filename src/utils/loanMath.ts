import { AmortizationRow, CalculationMethod, LoanCalculationResult } from '../types';

/**
 * Format a number as Sri Lankan Rupees currency representation (no decimals)
 */
export function formatLKR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return 'Rs. 0';
  return 'Rs. ' + Math.round(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a number with commas without currency prefix (no decimals)
 */
export function formatNumber(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '0';
  return Math.round(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Calculate loan details
 */
export function calculateLoan(
  principal: number,
  annualRatePct: number,
  periodMonths: number,
  method: CalculationMethod = 'reducing'
): LoanCalculationResult {
  if (principal <= 0 || periodMonths <= 0) {
    return {
      monthlyInstallment: 0,
      totalInterest: 0,
      totalRepayment: 0,
      amortizationSchedule: [],
    };
  }

  const monthlyRate = annualRatePct / 100 / 12;

  if (annualRatePct === 0) {
    const installment = principal / periodMonths;
    return {
      monthlyInstallment: installment,
      totalInterest: 0,
      totalRepayment: principal,
      amortizationSchedule: Array.from({ length: Math.min(periodMonths, 60) }, (_, i) => ({
        month: i + 1,
        payment: installment,
        principal: installment,
        interest: 0,
        remainingBalance: Math.max(0, principal - installment * (i + 1)),
      })),
    };
  }

  if (method === 'flat') {
    const totalInterest = principal * (annualRatePct / 100) * (periodMonths / 12);
    const totalRepayment = principal + totalInterest;
    const monthlyInstallment = totalRepayment / periodMonths;
    const monthlyPrincipal = principal / periodMonths;
    const monthlyInterest = totalInterest / periodMonths;

    const schedule: AmortizationRow[] = [];
    let currentBalance = principal;
    const maxMonths = Math.min(periodMonths, 60);

    for (let i = 1; i <= maxMonths; i++) {
      currentBalance = Math.max(0, currentBalance - monthlyPrincipal);
      schedule.push({
        month: i,
        payment: monthlyInstallment,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        remainingBalance: currentBalance,
      });
    }

    return {
      monthlyInstallment,
      totalInterest,
      totalRepayment,
      amortizationSchedule: schedule,
    };
  }

  // Reducing balance EMI calculation
  // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const factor = Math.pow(1 + monthlyRate, periodMonths);
  const monthlyInstallment = (principal * monthlyRate * factor) / (factor - 1);
  const totalRepayment = monthlyInstallment * periodMonths;
  const totalInterest = totalRepayment - principal;

  const schedule: AmortizationRow[] = [];
  let remaining = principal;
  const maxMonths = Math.min(periodMonths, 120);

  for (let m = 1; m <= maxMonths; m++) {
    const interestPart = remaining * monthlyRate;
    const principalPart = monthlyInstallment - interestPart;
    remaining = Math.max(0, remaining - principalPart);

    schedule.push({
      month: m,
      payment: monthlyInstallment,
      principal: principalPart,
      interest: interestPart,
      remainingBalance: remaining,
    });
  }

  return {
    monthlyInstallment,
    totalInterest,
    totalRepayment,
    amortizationSchedule: schedule,
  };
}

/**
 * Calculate reachable principal loan amount from available monthly installment capacity
 */
export function calculateReachableLoan(
  availableMonthlyInstallment: number,
  annualRatePct: number,
  periodMonths: number,
  method: CalculationMethod = 'reducing'
): number {
  if (availableMonthlyInstallment <= 0 || periodMonths <= 0) return 0;
  if (annualRatePct === 0) return availableMonthlyInstallment * periodMonths;

  if (method === 'flat') {
    // totalRepayment = P * (1 + r * (t/12))
    // installment = totalRepayment / n = P * (1 + r * (n/12)) / n
    // P = installment * n / (1 + (annualRatePct/100) * (periodMonths/12))
    const denominator = 1 + (annualRatePct / 100) * (periodMonths / 12);
    return (availableMonthlyInstallment * periodMonths) / denominator;
  }

  // Reducing Balance PV of Annuity:
  // P = EMI * ((1 + r)^n - 1) / (r * (1 + r)^n)
  const monthlyRate = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, periodMonths);
  return availableMonthlyInstallment * ((factor - 1) / (monthlyRate * factor));
}

/**
 * Calculate reachable loan amount based on the loan system's specific monthly installment & interest formula:
 * Installment = Math.round(P / N)
 * Monthly Interest = Math.round((P * R) / 1200)
 * Total Monthly Payment = Installment + Monthly Interest
 * 
 * Must strictly be LESS THAN OR EQUAL TO availableMonthlyBalance (balance after deduction):
 * Total Monthly Payment <= availableMonthlyBalance
 * 
 * Rounded to nearest thousand downwards with strict verification so it NEVER exceeds the available balance.
 */
export function calculateReachableLoanAmount(
  availableMonthlyBalance: number,
  annualRatePct: number,
  periodMonths: number
): number {
  if (availableMonthlyBalance <= 0 || periodMonths <= 0) return 0;

  // Theoretical maximum principal:
  // (P / N) + (P * R / 1200) <= availableMonthlyBalance
  // P * ((1200 + N * R) / (1200 * N)) <= availableMonthlyBalance
  // P <= (availableMonthlyBalance * 1200 * N) / (1200 + N * R)
  const rawP = (availableMonthlyBalance * 1200 * periodMonths) / (1200 + periodMonths * annualRatePct);

  // Round down to the nearest 1,000
  let p = Math.floor(rawP / 1000) * 1000;

  // Strict verification against the exact discrete whole-number formulas used in the loan calculator:
  // installment = Math.round(p / periodMonths)
  // interest = Math.round((p * annualRatePct) / 1200)
  // total = installment + interest
  // Must satisfy: total <= availableMonthlyBalance
  while (p > 0) {
    const installment = Math.round(p / periodMonths);
    const interest = Math.round((p * annualRatePct) / 1200);
    if (installment + interest <= availableMonthlyBalance) {
      break;
    }
    p -= 1000;
  }

  return Math.max(0, p);
}

/**
 * Dynamic interest rate for PROPERTY LOAN based on tenure (in months):
 * - 15 years or less (<= 180 months): 5%
 * - 15 to 20 years (181 to 240 months): 5.5%
 * - 20 to 25 years (241 to 300 months): 6%
 */
export function getPropertyLoanRate(months: number): number {
  if (months <= 0) return 5;
  if (months <= 180) return 5;
  if (months <= 240) return 5.5;
  return 6;
}
