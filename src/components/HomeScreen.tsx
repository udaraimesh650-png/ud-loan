import React, { useState } from 'react';
import { ScreenType } from '../types';
import { HeaderIllustration } from './HeaderIllustration';
import { PWAInstallButton } from './PWAInstallButton';
import { SettingsModal } from './SettingsModal';
import { Calculator, FileSpreadsheet, FileText, ChevronRight, Settings as SettingsIcon } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isIntroOpen, setIsIntroOpen] = useState<boolean>(false);

  return (
    <div
      id="home-screen"
      className="relative w-full min-h-full flex flex-col justify-between overflow-y-auto px-4 sm:px-5 select-none"
      style={{
        paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 8px), 16px)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 12px), 20px)',
        backgroundColor: '#e6eff5',
        backgroundImage: `
          radial-gradient(circle at 100% 40%, rgba(14, 165, 233, 0.22) 0%, transparent 60%),
          radial-gradient(circle at 95% 55%, rgba(2, 132, 199, 0.28) 0%, transparent 50%),
          radial-gradient(circle at 85% 75%, rgba(3, 105, 161, 0.2) 0%, transparent 45%),
          radial-gradient(circle at 15% 15%, rgba(254, 215, 170, 0.3) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 0%, rgba(225, 238, 246, 0.95) 100%)
        `
      }}
    >
      {/* Top Right Corner SETTINGS Button */}
      <button
        id="btn-home-settings"
        type="button"
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-2.5 right-3.5 z-30 py-1 px-2 rounded-full bg-linear-to-r from-[#0a2540] via-[#12396b] to-[#0a2540] text-white hover:text-amber-300 border border-sky-400/50 hover:border-amber-400 shadow-md flex items-center gap-1.5 text-xs font-black tracking-wider transition-all cursor-pointer active:scale-95 group select-none"
        style={{
          boxShadow: '0 4px 12px rgba(10,37,64,0.3)',
        }}
      >
        <SettingsIcon className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        <span>SETTINGS</span>
      </button>

      {/* Introduction User Guide Button */}
      <button
        id="btn-home-introduction"
        type="button"
        onClick={() => setIsIntroOpen(true)}
        className="absolute top-12 right-3.5 z-30 py-1 px-2 rounded-full bg-linear-to-r from-[#0a2540] via-[#12396b] to-[#0a2540] text-white hover:text-amber-300 border border-sky-400/50 hover:border-amber-400 shadow-md flex items-center gap-1.5 text-xs font-black tracking-wider transition-all cursor-pointer active:scale-95 group select-none"
        style={{
          boxShadow: '0 4px 12px rgba(10,37,64,0.3)',
        }}
        title="Open Introduction"
        aria-label="Introduction"
      >
        <FileText className="w-3.5 h-3.5 text-amber-400" />
        <span>INTRO</span>
      </button>
      {/* Introduction / User Guide */}
      {isIntroOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#eef6fa] shadow-2xl border border-sky-300">

            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-linear-to-r from-[#0a2540] via-[#12396b] to-[#0a2540] text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="font-black tracking-wide">UD LOAN CALCULATOR</h2>
                  <p className="text-xs text-sky-200">v1.2 භාවිත උපදෙස් අත්පොත</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsIntroOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 font-black text-lg"
                aria-label="Close Introduction"
              >
                X
              </button>
            </div>

            <div className="p-4 space-y-4 text-slate-800 select-text">

              <div className="rounded-2xl bg-white p-4 border border-sky-200 shadow-sm">
                <h3 className="font-black text-[#0d3b66] text-lg mb-2">
                  UD LOAN CALCULATOR
                </h3>
                <p className="font-bold text-sky-700 mb-2">
                  Loan Calculator • Pay Sheet Calculator • Settings
                </p>
                <p className="text-sm leading-6">
                  මෙම අත්පොතේ අරමුණ වන්නේ යෙදුම පළමු වරට භාවිත කරන අයෙකුට
                  ණය කොන්දේසි, ගණනය කිරීමේ ක්‍රමය සහ Settings භාවිතය පහසුවෙන්
                  ඉගෙන ගැනීමට උපකාර කිරීමයි.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-sky-200 shadow-sm">
                <h3 className="font-black text-[#0d3b66] mb-3">
                  1. යෙදුමේ ප්‍රධාන කොටස්
                </h3>
                <ul className="text-sm leading-6 space-y-2 list-disc pl-5">
                  <li><b>Loan Calculator</b> - තෝරාගත් ණය වර්ගයට අනුව ණය මුදල, කාලය, පොලී සහ මාසික වාරිකය ගණනය කරයි.</li>
                  <li><b>Pay Sheet Calculator</b> - වැටුප් පත්‍රිකාවේ අඩුකිරීම් අනුව ඉතිරි ශේෂය සහ ලබාගත හැකි උපරිම ණය මුදල පෙන්වයි.</li>
                  <li><b>Pay Sheet Loan Calculator</b> - Pay Sheet Calculator එකෙන් ලැබෙන ශේෂය භාවිත කර නිශ්චිත ණය මුදල හා කාලය අනුව මාසික වාරිකය පරීක්ෂා කරයි.</li>
                  <li><b>Settings</b> - ණය වර්ගවල සීමා, පොලී අනුපාත, කාලසීමා සහ විශේෂ tiers වෙනස් කිරීමට භාවිත කරයි.</li>
                </ul>
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
                  <b>වැදගත්:</b> Settings තුළ Save Conditions කළ පසු වෙනස්කම් Loan Calculator සහ Pay Sheet Calculator දෙකටම බලපායි.
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-sky-200 shadow-sm">
                <h3 className="font-black text-[#0d3b66] mb-3">
                  2. දැනට ඇතුළත් කර ඇති ණය කොන්දේසි
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0d3b66] text-white">
                        <th className="p-2 text-left">ණය වර්ගය</th>
                        <th className="p-2">පොලී</th>
                        <th className="p-2">උපරිම කාලය</th>
                        <th className="p-2">උපරිම මුදල</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="p-2 font-bold">FESTIVEL LOAN</td><td className="p-2">8%</td><td className="p-2">මාස 18</td><td className="p-2">රු. 500,000</td></tr>
                      <tr className="border-b"><td className="p-2 font-bold">GUARANTEE LOAN</td><td className="p-2">6%</td><td className="p-2">මාස 84*</td><td className="p-2">රු. 1,000,000*</td></tr>
                      <tr className="border-b"><td className="p-2 font-bold">COMMODITY GOODS / LOAN</td><td className="p-2">8%</td><td className="p-2">මාස 48</td><td className="p-2">රු. 500,000</td></tr>
                      <tr className="border-b"><td className="p-2 font-bold">FIXED DEPOSIT LOAN</td><td className="p-2">6%</td><td className="p-2">මාස 10</td><td className="p-2">තැන්පතු අගය අනුව</td></tr>
                      <tr className="border-b"><td className="p-2 font-bold">PROPERTY LOAN</td><td className="p-2">5% / 5.5% / 6%</td><td className="p-2">මාස 300</td><td className="p-2">රු. 5,000,000</td></tr>
                      <tr><td className="p-2 font-bold">SPECTACAL GOODS / LOAN</td><td className="p-2">8%</td><td className="p-2">මාස 24</td><td className="p-2">රු. 30,000</td></tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="font-black text-sky-800 mt-4 mb-2">
                  GUARANTEE LOAN - සාමාජිකත්ව කාලය අනුව
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-sky-100">
                        <th className="p-2 text-left">සාමාජිකත්වය</th>
                        <th className="p-2">උපරිම මුදල</th>
                        <th className="p-2">උපරිම කාලය</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="p-2">වසර 0 - 2</td><td className="p-2">රු. 500,000</td><td className="p-2">මාස 60</td></tr>
                      <tr className="border-b"><td className="p-2">වසර 2 ට වැඩි - 5 දක්වා</td><td className="p-2">රු. 800,000</td><td className="p-2">මාස 84</td></tr>
                      <tr><td className="p-2">වසර 5 ට වැඩි</td><td className="p-2">රු. 1,000,000</td><td className="p-2">මාස 84</td></tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-sm leading-6 mt-2">
                  Guarantee Loan තෝරාගත් විට පමණක් Membership Years ඇතුළත් කිරීම අවශ්‍ය වේ.
                  එම අගය අනුව උපරිම මුදල සහ උපරිම කාලය ස්වයංක්‍රීයව තීරණය වේ.
                </p>

                <h4 className="font-black text-sky-800 mt-4 mb-2">
                  PROPERTY LOAN - කාලය අනුව පොලී
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-sky-100">
                        <th className="p-2 text-left">ආපසු ගෙවීමේ කාලය</th>
                        <th className="p-2">පොලී අනුපාතය</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="p-2">වසර 15 දක්වා</td><td className="p-2">5%</td></tr>
                      <tr className="border-b"><td className="p-2">වසර 15 ට වැඩි - 20 දක්වා</td><td className="p-2">5.5%</td></tr>
                      <tr><td className="p-2">වසර 20 ට වැඩි - 25 දක්වා</td><td className="p-2">6%</td></tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-sm leading-6 mt-2">
                  Property Loan එකේ කාලය වෙනස් කළ විට අදාළ tier එක අනුව පොලී අනුපාතය ස්වයංක්‍රීයව වෙනස් වේ.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-emerald-200 shadow-sm">
                <h3 className="font-black text-emerald-800 mb-3">
                  3. Loan Calculator භාවිත කරන ආකාරය
                </h3>
                <ol className="text-sm leading-6 space-y-1 list-decimal pl-5">
                  <li>ණය වර්ගය (Loan Type) තෝරන්න.</li>
                  <li>Birthday අවශ්‍ය නම් YYYY/MM/DD ආකාරයෙන් ඇතුළත් කරන්න. හිස්ව තැබුවහොත් සාමාන්‍ය ණය කොන්දේසි අනුව ගණනය වේ.</li>
                  <li>ඇපකරු ණය (Guarantee Loan) නම් සාමාජිකත්ව වසර ගණන (Membership Years) ඇතුළත් කරන්න.</li>
                  <li>ණය මුදල (Loan Amount) ඇතුළත් කරන්න.</li>
                  <li>ආපසු ගෙවීමේ කාලය (Repayment Period / Tenure) මාස හෝ වසර අනුව තෝරන්න.</li>
                  <li>පොලී අනුපාතය (Interest Rate) තෝරාගත් ණය කොන්දේසියෙන් ස්වයංක්‍රීයව ලැබේ. දේපළ ණය (Property Loan) නම් තෝරාගත් කාලය අනුව පොලී අනුපාතය වෙනස් වේ.</li>
                  <li>වාරිකය (Installment), මාසික පොලිය (Monthly Interest) සහ මුළු මාසික වාරිකය (Total Monthly Installment) බලන්න.</li>
                </ol>

                <h4 className="font-black text-emerald-800 mt-4 mb-2">ගණනය කිරීමේ සූත්‍ර</h4>
                <div className="text-sm leading-7 bg-emerald-50 rounded-xl p-3">
                  <p><b>Installment</b> = Loan Amount ÷ Total Months</p>
                  <p><b>Monthly Interest</b> = (Loan Amount × Interest Rate) ÷ 1200</p>
                  <p><b>Total Monthly Installment</b> = Installment + Monthly Interest</p>
                </div>
                <p className="text-sm mt-2">ගණනය කිරීමේදී මුදල් අගයන් round කර පෙන්වනු ලැබේ.</p>

                <h4 className="font-black text-emerald-800 mt-4 mb-2">උපන් දිනය (Birthday) / වයස 60 සීමාව</h4>
                <ul className="text-sm leading-6 space-y-1 list-disc pl-5">
                  <li>උපන් දිනය (Birthday) ඇතුළත් කිරීම අනිවාර්ය නොවේ.</li>
                  <li>උපන් දිනය (Birthday) ඇතුළත් කළ විට අද දිනයේ සිට වයස 60 සම්පූර්ණ වන තෙක් ඉතිරි සම්පූර්ණ මාස ගණන ගණනය කරයි.</li>
                  <li>සාමාන්‍ය ණය උපරිම කාලය සහ වයස 60 දක්වා ඉතිරි මාස අතරින් අඩු අගය Effective Repayment Period ලෙස භාවිත වේ.</li>
                  <li>වයස අනුව සීමා වූ එම මාස ගණනම වාරිකය (Installment) ගණනය කිරීමට භාවිත වේ.</li>
                  <li>අනාගත උපන් දිනයක් හෝ වයස 60 ඉක්මවා ඇති උපන් දිනයක් ඇතුළත් කළහොත් දෝෂ පණිවිඩයක් (Validation) පෙන්වයි.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-emerald-200 shadow-sm">
                <h3 className="font-black text-emerald-800 mb-3">
                  4. Pay Sheet Calculator භාවිත කරන ආකාරය
                </h3>
                <ul className="text-sm leading-6 space-y-2 list-disc pl-5">
                  <li>ණය වර්ගය (Loan Type) තෝරන්න. ඇපකරු ණය (Guarantee Loan) නම් සාමාජිකත්ව වසර ගණන (Membership Years) ද ඇතුළත් කරන්න.</li>
                  <li>උපන් දිනය (Birthday) ඇතුළත් කළහොත් වයස 60 දක්වා ඉතිරි මාස ගණන අනුව ණය කාලය සීමා වේ.</li>
                  <li><b>මූලික වැටුප (Basic Salary)</b> ඇතුළත් කළ පසු අඩුකිරීම් නිවැරදි කොටසට ඇතුළත් කරන්න. <b>වැටුප් පත්‍රිකාවේ අඩුකිරීම් (PAY SHEET DEDUCTION)</b> කොටුවලට වැටුප් පත්‍රිකාවේ පෙන්වන අඩුකිරීම් ඇතුළත් කරන්න (උදා: ආපදා ණය, වෙනත් බැංකු ණය). <b>බැංකු අඩුකිරීම් (BANK DEDUCTION)</b> කොටුවලට ආයතනය මඟින් සිදුකරන අඩුකිරීම් ඇතුළත් කරන්න (උදා: සාමාජික ගාස්තු, ආයෝජන, වෙනත් ණය).</li>
                  <li>අවම වශයෙන් එක් අඩුකිරීමක් (Deduction) ඇතුළත් කළ පසු මුළු අඩුකිරීම් (Total Deductions) සහ අඩුකිරීම් පසු ඉතිරි ශේෂය (Balance After Deduction) පෙන්වයි.</li>
                  <li>අඩුකිරීම් පසු ඉතිරි ශේෂය (Balance After Deduction) ධන අගයක් නම් තෝරාගත් ණය කොන්දේසිය, පොලී සහ උපරිම කාලය අනුව ලබාගත හැකි ණය මුදල (Reachable Loan Amount) ගණනය කරයි.</li>
                  <li>ගණනය වූ මුදල තෝරාගත් ණය වර්ගයේ උපරිම මුදල් සීමාව (Max Limit) ඉක්මවන්නේ නම් එම උපරිම සීමාවට සීමා කරයි.</li>
                  <li>Pay Sheet එකෙන් Loan Calculator වෙත ගිය විට loan type, amount, months, balance සහ bank deductions වැනි අදාළ අගයන් ඉදිරියට ගෙන යයි.</li>
                </ul>

                <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <p className="font-black text-sky-800 mb-1">v1.2 Live Calculation</p>
                  <p className="text-sm leading-6">
                    Pay Sheet Loan Calculator තුළ Loan Type, Years හෝ Months වෙනස් කළ විට
                    තෝරාගත් repayment period එකට අනුව Reachable Loan Amount ස්වයංක්‍රීයව
                    නැවත ගණනය වී Loan Amount update වේ.
                  </p>
                </div>

                <h4 className="font-black text-emerald-800 mt-4 mb-2">වැටුප් පත්‍රිකා ගණනයේ (Pay Sheet) ප්‍රධාන ප්‍රතිඵල</h4>
                <div className="text-sm leading-7 bg-emerald-50 rounded-xl p-3">
                  <p><b>මුළු අඩුකිරීම් (TOTAL DEDUCTIONS)</b> - ඇතුළත් කළ වැටුප් අඩුකිරීම්වල එකතුව</p>
                  <p><b>අඩුකිරීම් පසු ඉතිරි ශේෂය (BALANCE AFTER DEDUCTION)</b> - අඩුකිරීම් පසු ඉතිරි වැටුප් ශේෂය</p>
                  <p><b>ලබාගත හැකි ණය මුදල (REACHABLE LOAN AMOUNT)</b> - එම ශේෂයෙන් දරාගත හැකි උපරිම ණය මුදල</p>
                  <p><b>මාසික වැටුප් පත්‍රිකා අඩුකිරීම (PAY SHEET DEDUCTION OF MONTH)</b> - මුළු බැංකු අඩුකිරීම් (Bank Deductions Total) + මුළු මාසික වාරිකය (Total Monthly Installment)</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-amber-200 shadow-sm">
                <h3 className="font-black text-amber-800 mb-3">
                  5. Pay Sheet Loan Calculator
                </h3>
                <ul className="text-sm leading-6 space-y-2 list-disc pl-5">
                  <li>Pay Sheet Calculator එකෙන් ලැබුණු Balance After Deduction ඉහළින් reference එකක් ලෙස පෙන්වයි.</li>
                  <li>ලබාගත හැකි ණය මුදල (Reachable Loan Amount) ද පෙන්වයි.</li>
                  <li>ණය වර්ගය (Loan Type) තෝරාගත් විට අදාළ උපරිම කාලය, පොලී අනුපාතය (Rate) සහ උපරිම මුදල් සීමාව (Max Limit) භාවිත වේ.</li>
                  <li>Loan Amount, Tenure සහ Interest Rate අනුව Installment, Monthly Interest සහ Total of Installment ගණනය වේ.</li>
                  <li>මුළු වාරිකය (Total of Installment) අඩුකිරීම් පසු ඉතිරි ශේෂයට (Balance After Deduction) වඩා වැඩි නම් රතු අනතුරු ඇඟවීමක් (Warning) පෙන්වයි.</li>
                  <li>එවිට ණය මුදල අඩු කිරීම හෝ නීතිමය උපරිම සීමාව තුළ repayment period එක වෙනස් කිරීමෙන් වාරිකය සකස් කළ හැක.</li>
                  <li>Back to Pay Sheet කළ විට ගණනය කළ Total of Installment එක Pay Sheet එකේ monthly deduction calculation එකට භාවිත කළ හැක.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-violet-200 shadow-sm">
                <h3 className="font-black text-violet-800 mb-3">
                  6. Settings - Loan Conditions වෙනස් කිරීම
                </h3>
                <ul className="text-sm leading-6 space-y-2 list-disc pl-5">
                  <li>Settings විවෘත කර Conditions tab එක තෝරන්න.</li>
                  <li>වෙනස් කිරීමට අවශ්‍ය Loan Type එක තෝරන්න.</li>
                  <li>Default Rate, Max Period Months, Max Limit සහ අදාළ description / condition fields වෙනස් කළ හැක.</li>
                  <li>Property Loan සඳහා tier rates වෙනස් කළ හැක.</li>
                  <li>Guarantee Loan සඳහා membership tier years, max limits සහ max periods වෙනස් කළ හැක.</li>
                  <li>වෙනස්කම් අවසන් වූ පසු <b>Save Conditions</b> ඔබන්න. Save නොකළ draft වෙනස්කම් ස්ථිර නොවේ.</li>
                </ul>

                <div className="mt-3 p-3 rounded-xl bg-violet-50">
                  <h4 className="font-black text-violet-800 mb-2">නව ණය වර්ගයක් (New Loan Type) එකතු කිරීම</h4>
                  <ul className="text-sm leading-6 list-disc pl-5">
                    <li>Name, Subtitle, Max Limit, Default Rate, Default Period Months සහ අවශ්‍ය Extra Note ඇතුළත් කරන්න.</li>
                    <li>New Loan Type එක add කළ පසු Save Conditions ඔබන්න.</li>
                    <li>Custom Loan Type එකක් පසුව delete කළ හැක.</li>
                    <li>Default Loan Types delete කළ නොහැක. ඒවායේ conditions පමණක් edit කළ හැක.</li>
                  </ul>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-rose-50">
                  <h4 className="font-black text-rose-800 mb-2">ණය කොන්දේසි නැවත මුල් තත්ත්වයට පත් කිරීම (Reset Conditions)</h4>
                  <ul className="text-sm leading-6 list-disc pl-5">
                    <li>Reset කළ විට Default Loan Types වල factory default conditions නැවත ලැබේ.</li>
                    <li>ඔබ විසින් එකතු කළ Custom Loan Types Reset කිරීමෙන් මැකෙන්නේ නැත.</li>
                    <li>Custom Loan Type එකක් ඉවත් කිරීමට එය වෙනම delete කළ යුතුය.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-amber-200 shadow-sm">
                <h3 className="font-black text-amber-800 mb-3">
                  7. ඉක්මන් පුහුණු උදාහරණයක්
                </h3>
                <p className="font-bold mb-2">උදාහරණය: FESTIVEL LOAN</p>
                <div className="text-sm leading-7 bg-amber-50 rounded-xl p-3">
                  <p>Loan Amount = රු. 180,000</p>
                  <p>Period = මාස 18</p>
                  <p>Rate = 8%</p>
                  <p>Installment = 180,000 ÷ 18 = රු. 10,000</p>
                  <p>Monthly Interest = (180,000 × 8) ÷ 1200 = රු. 1,200</p>
                  <p className="font-black">Total Monthly Installment = රු. 11,200</p>
                </div>
                <p className="text-sm leading-6 mt-2">
                  මෙම උදාහරණය calculator එකේ සූත්‍ර තේරුම් ගැනීමට පමණි.
                  සැබෑ ණය අනුමැතිය සඳහා යෙදුමේ පෙන්වන වත්මන් Settings / Conditions භාවිත කරන්න.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-rose-200 shadow-sm">
                <h3 className="font-black text-rose-800 mb-3">
                  8. භාවිතයේදී මතක තබාගත යුතු දේ
                </h3>
                <ul className="text-sm leading-6 space-y-2 list-disc pl-5">
                  <li>ණය වර්ගය (Loan Type) නිවැරදිව තෝරා ඇතිද බලන්න.</li>
                  <li>ඇපකරු ණය (Guarantee Loan) සඳහා සාමාජිකත්ව වසර ගණන (Membership Years) නිවැරදිව ඇතුළත් කරන්න.</li>
                  <li>උපන් දිනය (Birthday) භාවිත කරන්නේ නම් YYYY/MM/DD ආකෘතිය භාවිත කරන්න.</li>
                  <li>Property Loan කාලය වෙනස් කළ විට rate tier එකත් වෙනස් වන බව මතක තබාගන්න.</li>
                  <li>සැකසුම් (Settings) වෙනස් කළ පසු කොන්දේසි සුරකින්න (Save Conditions).</li>
                  <li>Pay Sheet warning එකක් පෙන්වන්නේ නම් Total Monthly Installment එක ඉතිරි වැටුප් ශේෂය ඉක්මවා ඇති බව අදහස් කරයි.</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-[#0a2540] p-4 text-center text-white shadow-sm">
                <p className="font-black text-amber-300">UD Loan Calculator v1.2</p>
                <p className="text-xs text-sky-200 mt-1">Designed & Developed by</p>
                <p className="font-black text-white tracking-wide">Udara</p>
              </div>

              <button
                type="button"
                onClick={() => setIsIntroOpen(false)}
                className="w-full py-3 rounded-xl bg-[#0d3b66] text-white font-black active:scale-[0.98] transition-transform"
              >
                CLOSE
              </button>

            </div>
          </div>
        </div>
      )}
      {/* Settings Modal (Condition Tab) */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Subtle decorative ink flecks on right side like in screenshot */}
      <div
        className="absolute inset-y-0 right-0 w-2/5 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#0369a1 1px, transparent 1px), radial-gradient(#0ea5e9 1.5px, transparent 1.5px)`,
          backgroundSize: '18px 18px, 24px 24px',
          backgroundPosition: '0 0, 9px 12px',
        }}
      />

      {/* Top illustration */}
      <div className="pt-2 z-10">
        <HeaderIllustration />
      </div>

      {/* Title section */}
      <div className="my-auto py-3 text-center z-10 flex flex-col items-center">
        <h1
          id="home-title"
          className="font-black tracking-wider leading-tight text-3xl sm:text-4xl uppercase flex flex-col items-center"
        >
          <div className="flex items-center justify-center gap-2.5">
            <span
              className="inline-flex items-center justify-center px-3.5 py-1 rounded-xl bg-linear-to-br from-[#0a2540] via-[#12396b] to-[#0a2540] text-amber-300 border-2 border-amber-400/80 shadow-[0_4px_16px_rgba(10,37,64,0.35)] font-black text-2xl sm:text-3xl tracking-widest ring-2 ring-amber-400/20"
              style={{
                textShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
              }}
            >
              UD
            </span>
            <span className="font-black text-2xl sm:text-3xl tracking-wider uppercase text-[#0d3b66] drop-shadow-sm">
              LOAN
            </span>
          </div>
          <div
            className="mt-1 text-2xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-sm"
            style={{
              background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CALCULATER
          </div>
        </h1>
      </div>

      {/* 3 Main Action Buttons with Professional Financial Theme */}
      <div className="w-full max-w-[340px] mx-auto flex flex-col gap-3.5 z-10 pb-10">
        {/* 1. LOAN CALCULATER BUTTON */}
        <button
          id="btn-nav-loan-calculator"
          onClick={() => onNavigate('loan-calculator')}
          className="group relative w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-[#0b2545] via-[#12396b] to-[#0b2545] hover:from-[#0e2e56] hover:via-[#174783] hover:to-[#0e2e56] active:scale-[0.98] transition-all duration-200 border-2 border-sky-400/40 hover:border-sky-300 shadow-[0_8px_20px_rgba(11,37,69,0.35)] flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-inner group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-base sm:text-lg tracking-wider uppercase text-white leading-tight">
                LOAN CALCULATER
              </span>
              <span className="text-[11px] font-semibold text-sky-200/90 tracking-normal mt-0.5">
                මාසික වාරික හා පොලී ගණනය (EMI & Interest)
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-sky-300 group-hover:translate-x-1 transition-transform shrink-0 opacity-80 group-hover:opacity-100" />
        </button>

        {/* 2. PAY SHEET CALCULATER BUTTON */}
        <button
          id="btn-nav-paysheet-calculator"
          onClick={() => onNavigate('paysheet-calculator')}
          className="group relative w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-[#042f2e] via-[#0d5553] to-[#042f2e] hover:from-[#063c3b] hover:via-[#116664] hover:to-[#063c3b] active:scale-[0.98] transition-all duration-200 border-2 border-emerald-400/40 hover:border-emerald-300 shadow-[0_8px_20px_rgba(4,47,46,0.35)] flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-base sm:text-lg tracking-wider uppercase text-white leading-tight">
                PAY SHEET CALCULATER
              </span>
              <span className="text-[11px] font-semibold text-emerald-200/90 tracking-normal mt-0.5">
                40% වැටුප් සීමාව හා ණය ධාරිතාව (40% Capacity)
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform shrink-0 opacity-80 group-hover:opacity-100" />
        </button>

        {/* 3. APPLICATIONS BUTTON */}
        <button
          id="btn-nav-applications"
          onClick={() => onNavigate('applications')}
          className="group relative w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-[#1b222c] via-[#2a3443] to-[#1b222c] hover:from-[#212935] hover:via-[#333e50] hover:to-[#212935] active:scale-[0.98] transition-all duration-200 border-2 border-amber-400/40 hover:border-amber-300 shadow-[0_8px_20px_rgba(27,34,44,0.35)] flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-base sm:text-lg tracking-wider uppercase text-white leading-tight">
                APPLICATIONS
              </span>
              <span className="text-[11px] font-semibold text-amber-200/90 tracking-normal mt-0.5">
                ණය අයදුම්පත් බාගත කිරීම (Download Forms)
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0 opacity-80 group-hover:opacity-100" />
        </button>

        {/* PWA Home Screen Install Banner (auto-hides when installed) */}
        <PWAInstallButton variant="banner" className="mt-2.5 z-10" />
      </div>

      {/* Bottom badge: Designed & Developed by Udara */}
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none">
        <div
          className="px-5 pt-3.5 pb-2.5 pr-8 rounded-tr-3xl bg-linear-to-r from-[#93d4d4]/90 to-[#a8dede]/90 backdrop-blur-xs shadow-sm border-t border-r border-[#6fb9b9]/60 flex items-center gap-1.5"
        >
          <span className="text-xs font-bold text-slate-800 tracking-wide">
            Designed & Developed by <span className="font-extrabold text-slate-950">Udara</span>
          </span>
        </div>
      </div>
    </div>
  );
};
