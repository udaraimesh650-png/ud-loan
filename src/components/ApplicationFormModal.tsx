import React from 'react';
import { ApplicationDocument } from '../types';
import { Printer, Download, X, UserCheck } from 'lucide-react';

interface ApplicationFormModalProps {
  application: ApplicationDocument | null;
  onClose: () => void;
  onPrint: () => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  application,
  onClose,
  onPrint,
}) => {
  if (!application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 text-slate-800">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              {application.code} • OFFICIAL FORM
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
              {application.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Printable Form Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs sm:text-sm space-y-4 font-sans bg-slate-50/50">
          {/* Header section */}
          <div className="text-center pb-3 border-b-2 border-slate-800">
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
              UDARA CREDIT & WELFARE SOCIETY LTD.
            </h2>
            <p className="text-xs font-medium text-slate-600">
              Registration No: CP/WLF/2026 • Headquarters, Colombo, Sri Lanka
            </p>
            <div className="mt-2 inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded">
              {application.title}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">{application.subtitle}</p>
          </div>

          {/* Section 1: Applicant Details */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-900 uppercase border-b border-slate-300 pb-1 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-sky-600" />
              1. Applicant Personal Particulars (අයදුම්කරුගේ පෞද්ගලික විස්තර)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Full Name (සම්පූර්ණ නම)</span>
                <span className="font-semibold text-slate-800">...................................................</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">NIC Number (ජා.හැ. අංකය)</span>
                <span className="font-semibold text-slate-800">..................................</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Designation / Post (තනතුර)</span>
                <span className="font-semibold text-slate-800">...................................................</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Basic Salary / Gross Salary (මූලික / දළ වැටුප)</span>
                <span className="font-semibold text-slate-800">Rs. ...........................</span>
              </div>
              <div className="col-span-2 p-2 bg-white rounded border border-slate-200">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Permanent Address (ස්ථිර ලිපිනය)</span>
                <span className="font-semibold text-slate-800">......................................................................................................</span>
              </div>
            </div>
          </div>

          {/* Section 2: Loan / Facility Details */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-900 uppercase border-b border-slate-300 pb-1">
              2. Facility Request (ඉල්ලුම් කරන ණය මුදල සහ වාරික)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Requested Amount (ණය මුදල)</span>
                <span className="font-semibold text-slate-800">Rs. ...................</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Repayment Tenure (කාලසීමාව)</span>
                <span className="font-semibold text-slate-800">......... Months</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Monthly Deduction (මාසික අඩුකිරීම)</span>
                <span className="font-semibold text-slate-800">Rs. ...................</span>
              </div>
            </div>
          </div>

          {/* Section 3: Guarantor Details */}
          {application.type === 'guaranty' && (
            <div className="space-y-2">
              <h4 className="font-black text-slate-900 uppercase border-b border-slate-300 pb-1">
                3. Guarantors Undertaking (ඇපකරුවන්ගේ ප්‍රකාශය)
              </h4>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Guarantor 1 (පළමු ඇපකරු)</span>
                  <p className="text-slate-500">Name: ...............................................</p>
                  <p className="text-slate-500">NIC: ..................................................</p>
                  <p className="text-slate-500">Signature: .........................................</p>
                </div>
                <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Guarantor 2 (දෙවන ඇපකරු)</span>
                  <p className="text-slate-500">Name: ...............................................</p>
                  <p className="text-slate-500">NIC: ..................................................</p>
                  <p className="text-slate-500">Signature: .........................................</p>
                </div>
              </div>
            </div>
          )}

          {/* Requirements Checklist */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80">
            <span className="font-black text-amber-900 block text-xs uppercase mb-1">
              Required Enclosures (අමුණා එවිය යුතු ලියකියවිලි):
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
              {application.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Signature declaration */}
          <div className="pt-3 flex justify-between items-end border-t border-slate-300 text-xs text-slate-600">
            <div>
              <p>Date: _____ / _____ / 2026</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">.....................................................</p>
              <p className="text-[10px] uppercase font-bold text-slate-500">Applicant Signature</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs uppercase cursor-pointer"
          >
            Close (වසන්න)
          </button>
          <button
            onClick={onPrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs uppercase flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save Form (මුද්‍රණය / සුරකින්න)
          </button>
        </div>
      </div>
    </div>
  );
};
