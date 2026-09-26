export type ScreenType =
  | 'home'
  | 'loan-calculator'
  | 'paysheet-calculator'
  | 'applications'
  | 'paysheet-loan-calculator';

export type CalculationMethod = 'reducing' | 'flat';

export interface LoanPreset {
  id: string;
  name: string;
  defaultRate: number;
  defaultPeriod: number; // in months
  periodUnit: 'years' | 'months';
}

export interface LoanCalculationResult {
  monthlyInstallment: number;
  totalInterest: number;
  totalRepayment: number;
  amortizationSchedule: AmortizationRow[];
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface PaySheetState {
  loanType: string;
  basicSalary: string;
  deduction1: string;
  deduction2: string;
  deduction3: string;
  deduction4: string;
  interestRate: number; // default e.g. 14%
  repaymentPeriodMonths: number; // default e.g. 60 months (5 years)
}

export interface ApplicationDocument {
  id: string;
  title: string;
  subtitle: string;
  type: 'guaranty' | 'festival' | 'membership';
  code: string;
  description: string;
  requirements: string[];
  pdfPath: string;
}

export interface LoanCalculationParams {
  loanType?: string;
  amount?: number;
  months?: number;
  ageRemainingMonths?: number;
  balanceAfterDeduction?: number;
  bankDeductionsTotal?: number;
}
