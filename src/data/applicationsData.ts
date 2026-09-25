import { ApplicationDocument } from '../types';

export const APPLICATIONS: ApplicationDocument[] = [
  {
    id: 'guaranty-loan',
    title: 'GURRENTY / COMMODITY LOAN APPLICATION',
    subtitle: 'ඇපකර / භාණ්ඩ ණය අයදුම්පත්‍රය',
    type: 'guaranty',
    code: 'UD-LN-01',
    description: 'Application for personal, commodity, or surety-backed loans requiring 2 eligible guarantors.',
    requirements: [
      'Copy of National Identity Card (NIC)',
      'Last 3 months certified pay sheets',
      'Two (2) permanent staff guarantors with pay slips',
      'Utility bill or proof of permanent address'
    ],
    pdfPath: `${import.meta.env.BASE_URL}applications/guaranty-good-loan.pdf`
  },
  {
    id: 'festival-loan',
    title: 'FESTIVEL LOAN APPLICATION',
    subtitle: 'උත්සව අත්තිකාරම් / ණය අයදුම්පත්‍රය',
    type: 'festival',
    code: 'UD-FL-02',
    description: 'Special advance loan for festive seasons (Sinhala & Tamil New Year, Christmas, Ramadan, Vesak).',
    requirements: [
      'Staff Employee Number / ID verification',
      'Latest certified monthly pay sheet',
      'Approval from Department Head / Section Supervisor',
      'Consent form for 10-12 equal monthly payroll deductions'
    ],
    pdfPath: `${import.meta.env.BASE_URL}applications/festivel-loan.pdf`
  },
  {
    id: 'membership-application',
    title: 'MEMBERSHIP APPLICATION',
    subtitle: 'සාමාජිකත්ව අයදුම්පත්‍රය',
    type: 'membership',
    code: 'UD-MB-03',
    description: 'Official enrollment application form for Cooperative Welfare Society & Loan Scheme.',
    requirements: [
      'Certified copy of National Identity Card (NIC)',
      'Passport size photograph',
      'Nominee / Beneficiary details form',
      'Monthly share/welfare deduction authorization letter'
    ],
    pdfPath: `${import.meta.env.BASE_URL}applications/membership.pdf`
  }
];

export interface LoanConditionDetails {
  id: string;
  name: string;
  subtitle: string;
  maxLimit?: number;
  maxLimitText: string;
  maxTenureText: string;
  rateText: string;
  extraNote?: string;
}

export const LOAN_CONDITIONS_MAP: Record<string, LoanConditionDetails> = {
  'festivel-loan': {
    id: 'festivel-loan',
    name: 'FESTIVEL LOAN',
    subtitle: 'උත්සව ණය',
    maxLimit: 500000,
    maxLimitText: 'රු. 500,000',
    maxTenureText: 'මාස 18 (18 Months)',
    rateText: '8%',
    extraNote: 'උත්සව අත්තිකාරම් පහසුකම'
  },
  'guarantee-loan': {
    id: 'guarantee-loan',
    name: 'GUARANTEE LOAN',
    subtitle: 'ඇපකර ණය',
    maxLimit: 1000000,
    maxLimitText: 'රු. 1,000,000',
    maxTenureText: 'වසර 7 / මාස 84 (7 Years)',
    rateText: '6%',
    extraNote: 'සුදුසු ස්ථිර ඇපකරුවන් ඉදිරිපත් කිරීම මත'
  },
  'commodity-goods-loan': {
    id: 'commodity-goods-loan',
    name: 'COMMODITY / GOODS LOAN',
    subtitle: 'භාණ්ඩ ණය',
    maxLimit: 500000,
    maxLimitText: 'රු. 500,000',
    maxTenureText: 'වසර 4 / මාස 48 (4 Years)',
    rateText: '8%',
    extraNote: 'ගෘහ උපකරණ හා භාණ්ඩ මිලදී ගැනීම සඳහා'
  },
  'fixed-deposit-loan': {
    id: 'fixed-deposit-loan',
    name: 'FIXED DEPOSIT LOAN',
    subtitle: 'ස්ථාවර තැන්පතු ණය',
    maxLimitText: 'තැන්පතු වටිනාකම මත පදනම්ව',
    maxTenureText: 'මාස 10 (10 Months)',
    rateText: '6%',
    extraNote: 'ස්ථාවර තැන්පතු ඇප සුරැකුම මත'
  },
  'property-loan': {
    id: 'property-loan',
    name: 'PROPERTY LOAN',
    subtitle: 'දේපළ ණය',
    maxLimit: 5000000,
    maxLimitText: 'රු. 5,000,000',
    maxTenureText: 'වසර 25 / මාස 300 (25 Years)',
    rateText: '≤ 15y: 5% | 15-20y: 5.5% | 20-25y: 6%',
    extraNote: 'දේපොළ මිලදී ගැනීම් හෝ සංවර්ධනය සඳහා'
  },
  'spectacal-goods-loan': {
    id: 'spectacal-goods-loan',
    name: 'SPECTACAL/GOODS LOAN',
    subtitle: 'උපැස් / භාණ්ඩ ණය',
    maxLimit: 30000,
    maxLimitText: 'රු. 30,000',
    maxTenureText: 'වසර 2 / මාස 24 (2 Years)',
    rateText: '8%',
    extraNote: 'උපැස් යුවළ හා භාණ්ඩ මිලදී ගැනීම සඳහා'
  },
};

export const LOAN_TYPES = [
  {
    id: 'festivel-loan',
    name: 'FESTIVEL LOAN',
    subtitle: 'උත්සව ණය',
    defaultRate: 8,
    defaultPeriodMonths: 18,
    maxPeriodMonths: 18,
    maxLimit: 500000,
    description: 'Special festival advance with short repayment tenure (18 months).'
  },
  {
    id: 'guarantee-loan',
    name: 'GUARANTEE LOAN',
    subtitle: 'ඇපකර ණය',
    defaultRate: 6,
    defaultPeriodMonths: 84,
    maxPeriodMonths: 84,
    maxLimit: 1000000,
    description: 'Personal surety-backed loan requiring eligible permanent guarantors.'
  },
  {
    id: 'commodity-goods-loan',
    name: 'COMMODITY / GOODS LOAN',
    subtitle: 'භාණ්ඩ ණය',
    defaultRate: 8,
    defaultPeriodMonths: 48,
    maxPeriodMonths: 48,
    maxLimit: 500000,
    description: 'Loan facility for household appliances, furniture, and consumer goods.'
  },
  {
    id: 'fixed-deposit-loan',
    name: 'FIXED DEPOSIT LOAN',
    subtitle: 'ස්ථාවර තැන්පතු ණය',
    defaultRate: 6,
    defaultPeriodMonths: 10,
    maxPeriodMonths: 10,
    description: 'Quick credit against fixed deposit security at preferential interest rates.'
  },
  {
    id: 'property-loan',
    name: 'PROPERTY LOAN',
    subtitle: 'දේපළ ණය',
    defaultRate: 5,
    defaultPeriodMonths: 180,
    maxPeriodMonths: 300,
    maxLimit: 5000000,
    description: 'දේපළ ණය පහසුකම (උපරිම රු. 5,000,000 | වසර 15 දක්වා 5% | වසර 15-20: 5.5% | වසර 20-25: 6%).'
  },
  {
    id: 'spectacal-goods-loan',
    name: 'SPECTACAL/GOODS LOAN',
    subtitle: 'උපැස් / භාණ්ඩ ණය',
    defaultRate: 8,
    defaultPeriodMonths: 24,
    maxPeriodMonths: 24,
    maxLimit: 30000,
    description: 'උපැස් යුවළ සහ භාණ්ඩ ණය පහසුකම (උපරිම රු. 30,000 | උපරිම කාලය වසර 2 | වාර්ෂික පොලිය 8%).'
  },
];