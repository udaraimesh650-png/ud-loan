import React, { useState, useEffect, useRef } from 'react';
import { ScreenType, LoanCalculationParams } from './types';
import { HomeScreen } from './components/HomeScreen';
import { LoanCalculatorScreen } from './components/LoanCalculatorScreen';
import { PaySheetCalculatorScreen } from './components/PaySheetCalculatorScreen';
import { PaySheetLoanCalculatorScreen } from './components/PaySheetLoanCalculatorScreen';
import { ApplicationsScreen } from './components/ApplicationsScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Smartphone, Grid } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';

export default function App() {
const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
const [viewMode, setViewMode] = useState<'mobile' | 'grid'>('mobile');
const [loanCalcParams, setLoanCalcParams] = useState<LoanCalculationParams | null>(null);
const [customTotalInstallment, setCustomTotalInstallment] = useState<number | null>(null);
const [resetKey, setResetKey] = useState<number>(0);

const screenHistoryRef = useRef<ScreenType[]>(['home']);
/* ------------------------------------------------------------
SCREEN NAVIGATION
------------------------------------------------------------ */

const navigateToScreen = (screen: ScreenType) => {
setCurrentScreen((previousScreen) => {
if (previousScreen !== screen) {
screenHistoryRef.current.push(screen);
}


return screen;


});
};

const goBackToPreviousScreen = () => {
const history = screenHistoryRef.current;

if (history.length > 1) {
  history.pop();

  const previousScreen = history[history.length - 1];

  if (previousScreen === 'home') {
    handleGoHome();
  } else {
    setCurrentScreen(previousScreen);
  }

  return true;
}

return false;


};

// ------------------------------------------------------------
// ANDROID BACK BUTTON
// ------------------------------------------------------------

useEffect(() => {
let listenerHandle: { remove: () => Promise<void> } | null = null;


const setupBackButton = async () => {
  try {
    listenerHandle = await CapacitorApp.addListener(
      'backButton',
      ({ canGoBack }) => {
        const handled = goBackToPreviousScreen();

        if (!handled && !canGoBack) {
          CapacitorApp.exitApp();
        }
      }
    );
  } catch (error) {
    // Browser development mode does not use Capacitor native events.
  }
};

setupBackButton();

return () => {
  if (listenerHandle) {
    listenerHandle.remove();
  }
};


}, []);

// ------------------------------------------------------------
// BROWSER BACK BUTTON
// ------------------------------------------------------------

useEffect(() => {
const handlePopState = () => {
goBackToPreviousScreen();
};


window.addEventListener('popstate', handlePopState);

return () => {
  window.removeEventListener('popstate', handlePopState);
};


}, []);

// ------------------------------------------------------------
// MOBILE KEYBOARD / VIEWPORT RESET
// ------------------------------------------------------------

useEffect(() => {
const resetZoomToScreenSize = () => {
const metaViewport = document.querySelector('meta[name="viewport"]');


  if (metaViewport) {
    metaViewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, viewport-fit=cover'
    );

    setTimeout(() => {
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover'
      );
    }, 300);
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
};

const handleFocusOut = (e: FocusEvent) => {
  const target = e.target;

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    setTimeout(resetZoomToScreenSize, 120);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    const active = document.activeElement;

    if (active instanceof HTMLInputElement) {
      active.blur();
    }
  }
};

const handleTouchStart = (e: TouchEvent) => {
  const active = document.activeElement;

  if (
    active instanceof HTMLInputElement &&
    e.target !== active &&
    !(e.target as HTMLElement)?.closest('input, textarea, select')
  ) {
    active.blur();
  }
};

window.addEventListener('focusout', handleFocusOut);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('touchstart', handleTouchStart, {
  passive: true,
});

return () => {
  window.removeEventListener('focusout', handleFocusOut);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('touchstart', handleTouchStart);
};


}, []);

// ------------------------------------------------------------
// HOME
// ------------------------------------------------------------

const handleGoHome = () => {
try {
localStorage.removeItem('ud_paysheet_saved_data');
} catch (e) {
// Ignore localStorage errors.
}


setLoanCalcParams(null);
setCustomTotalInstallment(null);
setResetKey((previous) => previous + 1);

screenHistoryRef.current = ['home'];
setCurrentScreen('home');


};

// ------------------------------------------------------------
// PAY SHEET -> LOAN CALCULATOR
// ------------------------------------------------------------

const handleOpenLoanInCalculator = (params: {
loanType: string;
amount: number;
months: number;
balanceAfterDeduction?: number;
bankDeductionsTotal?: number;
}) => {
setLoanCalcParams(params);
navigateToScreen('paysheet-loan-calculator');
};

// ------------------------------------------------------------
// MAIN UI
// ------------------------------------------------------------

return (
<div
className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-between font-sans selection:bg-sky-500 selection:text-white overflow-x-hidden"
style={{
paddingTop: 'env(safe-area-inset-top)',
paddingBottom: 'env(safe-area-inset-bottom)',
paddingLeft: 'env(safe-area-inset-left)',
paddingRight: 'env(safe-area-inset-right)',
}}
>
{/* Top App Control Bar: Only displayed in 4-Page Grid View */}
{viewMode === 'grid' && ( <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-30 shrink-0"> <div className="flex items-center gap-2.5"> <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-amber-400 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
UD </div>


        <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
          UD Loan Calculator - 4-Page Grid Inspection
        </span>
      </div>

      <button
        onClick={() => setViewMode('mobile')}
        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Switch to Mobile View</span>
      </button>
    </header>
  )}

  {/* Main Viewport Container */}
  <main className="w-full flex-1 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
    {viewMode === 'mobile' ? (
      <div className="relative w-full h-[100dvh] sm:h-[860px] sm:max-h-[calc(100dvh-40px)] sm:max-w-[420px] bg-slate-100 flex flex-col sm:rounded-[36px] sm:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] sm:border sm:border-slate-800/80 overflow-hidden transition-all">
        <div
          className="relative w-full h-full overflow-hidden flex flex-col bg-slate-100"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {currentScreen === 'home' && (
            <HomeScreen
              onNavigate={(screen) => navigateToScreen(screen)}
            />
          )}

          {currentScreen === 'loan-calculator' && (
            <LoanCalculatorScreen
              key={`loan-calc-${resetKey}`}
              onGoHome={handleGoHome}
            />
          )}

          {currentScreen === 'paysheet-calculator' && (
            <PaySheetCalculatorScreen
              key={`paysheet-calc-${resetKey}`}
              onGoHome={handleGoHome}
              onNavigateToLoanCalculator={handleOpenLoanInCalculator}
              customInstallmentFromLoanCalc={customTotalInstallment}
              onClearCustomInstallment={() =>
                setCustomTotalInstallment(null)
              }
            />
          )}

          {currentScreen === 'paysheet-loan-calculator' && (
            <PaySheetLoanCalculatorScreen
              key={`paysheet-loan-calc-${resetKey}`}
              onGoHome={handleGoHome}
              onGoBackToPaySheet={(installment) => {
                if (typeof installment === 'number') {
                  setCustomTotalInstallment(installment);
                }

                navigateToScreen('paysheet-calculator');
              }}
              initialLoanType={loanCalcParams?.loanType}
              initialAmount={loanCalcParams?.amount}
              initialMonths={loanCalcParams?.months}
              balanceAfterDeduction={
                loanCalcParams?.balanceAfterDeduction
              }
              bankDeductionsTotal={
                loanCalcParams?.bankDeductionsTotal
              }
            />
          )}

          {currentScreen === 'applications' && (
            <ApplicationsScreen onGoHome={handleGoHome} />
          )}
        </div>
      </div>
    ) : (
      <div className="w-full max-w-7xl py-4 px-2 sm:px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start justify-items-center overflow-y-auto max-h-[calc(100vh-60px)]">
        {/* Page 1: Home */}
        <div className="flex flex-col items-center gap-2 w-full max-w-[360px]">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-full">
            Page 1: UD LOAN CALCULATOR
          </span>

          <div className="w-full h-[760px] rounded-[32px] overflow-hidden border-2 border-slate-700 shadow-2xl bg-white flex flex-col">
            <HomeScreen
              onNavigate={(screen) => navigateToScreen(screen)}
            />
          </div>
        </div>

        {/* Page 2: Loan Calculator */}
        <div className="flex flex-col items-center gap-2 w-full max-w-[360px]">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-full">
            Page 2: LOAN CALCULATOR
          </span>

          <div className="w-full h-[760px] rounded-[32px] overflow-hidden border-2 border-slate-700 shadow-2xl bg-white flex flex-col">
            <LoanCalculatorScreen
              key={`grid-loan-${resetKey}`}
              onGoHome={handleGoHome}
            />
          </div>
        </div>

        {/* Page 3: Pay Sheet Calculator */}
        <div className="flex flex-col items-center gap-2 w-full max-w-[360px]">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-full">
            Page 3: PAY SHEET CALCULATOR
          </span>

          <div className="w-full h-[760px] rounded-[32px] overflow-hidden border-2 border-slate-700 shadow-2xl bg-white flex flex-col">
            <PaySheetCalculatorScreen
              key={`grid-paysheet-${resetKey}`}
              onGoHome={handleGoHome}
              onNavigateToLoanCalculator={handleOpenLoanInCalculator}
            />
          </div>
        </div>

        {/* Page 4: Applications */}
        <div className="flex flex-col items-center gap-2 w-full max-w-[360px]">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-full">
            Page 4: APPLICATIONS
          </span>

          <div className="w-full h-[760px] rounded-[32px] overflow-hidden border-2 border-slate-700 shadow-2xl bg-white flex flex-col">
            <ApplicationsScreen onGoHome={handleGoHome} />
          </div>
        </div>
      </div>
    )}
  </main>

  {/* Desktop 4-Page Grid Inspector Toggle */}
  <div className="hidden lg:flex fixed bottom-3 right-3 z-50">
    <button
      onClick={() =>
        setViewMode(viewMode === 'mobile' ? 'grid' : 'mobile')
      }
      className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 shadow-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
    >
      {viewMode === 'mobile' ? (
        <>
          <Grid className="w-3 h-3 text-sky-400" />
          <span>4-Page Grid</span>
        </>
      ) : (
        <>
          <Smartphone className="w-3 h-3 text-sky-400" />
          <span>Mobile View</span>
        </>
      )}
    </button>
  </div>

  {/* Offline Mode Alert */}
  <OfflineIndicator />
</div>


);
}
