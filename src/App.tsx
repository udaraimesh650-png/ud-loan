import React, { useState, useEffect, useRef } from 'react';
import { ScreenType, LoanCalculationParams } from './types';
import { HomeScreen } from './components/HomeScreen';
import { LoanCalculatorScreen } from './components/LoanCalculatorScreen';
import { PaySheetCalculatorScreen } from './components/PaySheetCalculatorScreen';
import { PaySheetLoanCalculatorScreen } from './components/PaySheetLoanCalculatorScreen';
import { ApplicationsScreen } from './components/ApplicationsScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Home,
  Calculator,
  FileSpreadsheet,
  FileText,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [loanCalcParams, setLoanCalcParams] =
    useState<LoanCalculationParams | null>(null);
  const [customTotalInstallment, setCustomTotalInstallment] =
    useState<number | null>(null);
  const [resetKey, setResetKey] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  /* ------------------------------------------------------------
     ANDROID BACK BUTTON
  ------------------------------------------------------------ */

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
        // Browser / Electron does not use Capacitor native events.
      }
    };

    setupBackButton();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

  /* ------------------------------------------------------------
     BROWSER BACK BUTTON
  ------------------------------------------------------------ */

  useEffect(() => {
    const handlePopState = () => {
      goBackToPreviousScreen();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  /* ------------------------------------------------------------
     MOBILE KEYBOARD / VIEWPORT RESET
  ------------------------------------------------------------ */

  useEffect(() => {
    const resetZoomToScreenSize = () => {
      const metaViewport = document.querySelector(
        'meta[name="viewport"]'
      );

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
        !(e.target as HTMLElement)?.closest(
          'input, textarea, select'
        )
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

  /* ------------------------------------------------------------
     HOME
  ------------------------------------------------------------ */

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

  /* ------------------------------------------------------------
     PAY SHEET -> LOAN CALCULATOR
  ------------------------------------------------------------ */

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

  /* ------------------------------------------------------------
     DESKTOP NAVIGATION
  ------------------------------------------------------------ */

  const handleDesktopNavigation = (screen: ScreenType) => {
    navigateToScreen(screen);
    setSidebarOpen(false);
  };

  const isActive = (screen: ScreenType) => {
    return currentScreen === screen;
  };

  /* ------------------------------------------------------------
     DESKTOP NAVIGATION ITEM
  ------------------------------------------------------------ */

  const NavItem = ({
    screen,
    icon: Icon,
    label,
    description,
  }: {
    screen: ScreenType;
    icon: React.ElementType;
    label: string;
    description: string;
  }) => (
    <button
      type="button"
      onClick={() => handleDesktopNavigation(screen)}
      className={`w-full group flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
        isActive(screen)
          ? 'bg-sky-500/15 border border-sky-400/30 text-white shadow-lg'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
      }`}
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
          isActive(screen)
            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
            : 'bg-slate-800 text-slate-400 group-hover:text-sky-300'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="min-w-0">
        <div className="font-extrabold text-sm tracking-wide">
          {label}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5 truncate">
          {description}
        </div>
      </div>
    </button>
  );

  /* ------------------------------------------------------------
     MAIN UI
  ------------------------------------------------------------ */

  return (
    <div className="min-h-screen w-full bg-[#07111f] text-slate-100 font-sans overflow-hidden">
      {/* ========================================================
          MOBILE VERSION
      ======================================================== */}

      <div className="lg:hidden min-h-screen w-full">
        <div
          className="relative w-full h-[100dvh] overflow-hidden flex flex-col bg-slate-100"
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

      {/* ========================================================
          DESKTOP VERSION
      ======================================================== */}

      <div className="hidden lg:flex h-screen w-full">
        {/* SIDEBAR */}

        <aside
          className={`${
            sidebarOpen ? 'w-[280px]' : 'w-[82px]'
          } shrink-0 h-full bg-[#081426] border-r border-slate-700/60 transition-all duration-300 flex flex-col`}
        >
          {/* Logo */}

          <div className="h-[82px] px-4 flex items-center border-b border-slate-800/80">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg">
              UD
            </div>

            {sidebarOpen && (
              <div className="ml-3 min-w-0">
                <div className="font-black text-white tracking-wide text-sm">
                  UD LOAN
                </div>
                <div className="text-[10px] text-sky-300 font-semibold tracking-wider">
                  CALCULATOR
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}

          <div className="flex-1 overflow-y-auto p-3">
            {sidebarOpen && (
              <div className="px-2 pb-3 pt-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
                  Main Menu
                </span>
              </div>
            )}

            {sidebarOpen ? (
              <div className="space-y-2">
                <NavItem
                  screen="home"
                  icon={Home}
                  label="HOME"
                  description="Main dashboard"
                />

                <NavItem
                  screen="loan-calculator"
                  icon={Calculator}
                  label="LOAN CALCULATOR"
                  description="EMI & interest"
                />

                <NavItem
                  screen="paysheet-calculator"
                  icon={FileSpreadsheet}
                  label="PAY SHEET"
                  description="40% capacity"
                />

                <NavItem
                  screen="applications"
                  icon={FileText}
                  label="APPLICATIONS"
                  description="Loan application forms"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  {
                    screen: 'home' as ScreenType,
                    icon: Home,
                  },
                  {
                    screen: 'loan-calculator' as ScreenType,
                    icon: Calculator,
                  },
                  {
                    screen: 'paysheet-calculator' as ScreenType,
                    icon: FileSpreadsheet,
                  },
                  {
                    screen: 'applications' as ScreenType,
                    icon: FileText,
                  },
                ].map(({ screen, icon: Icon }) => (
                  <button
                    key={screen}
                    type="button"
                    onClick={() => handleDesktopNavigation(screen)}
                    className={`w-full h-12 rounded-xl flex items-center justify-center transition-all ${
                      isActive(screen)
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Sidebar */}

          <div className="p-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              {sidebarOpen ? (
                <>
                  <Menu className="w-4 h-4" />
                  <span className="text-xs font-bold">
                    Collapse Menu
                  </span>
                </>
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {sidebarOpen && (
              <div className="mt-3 text-center text-[9px] text-slate-600 font-semibold">
                Designed & Developed by Udara
              </div>
            )}
          </div>
        </aside>

        {/* DESKTOP MAIN AREA */}

        <section className="flex-1 min-w-0 h-full flex flex-col">
          {/* TOP BAR */}

          <header className="h-[82px] shrink-0 bg-[#0b1728]/95 border-b border-slate-700/60 px-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-sky-400 font-bold">
                UD Loan Calculator
              </div>

              <h1 className="text-xl font-black text-white mt-0.5">
                {currentScreen === 'home' && 'Dashboard'}
                {currentScreen === 'loan-calculator' &&
                  'Loan Calculator'}
                {currentScreen === 'paysheet-calculator' &&
                  'Pay Sheet Calculator'}
                {currentScreen === 'paysheet-loan-calculator' &&
                  'Loan Calculator'}
                {currentScreen === 'applications' &&
                  'Applications'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-400">
                  Ready
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (currentScreen !== 'home') {
                    handleGoHome();
                  }
                }}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all"
                title="Home"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* CONTENT */}

          <main className="flex-1 min-h-0 overflow-auto bg-[#eef3f7]">
            <div className="w-full min-h-full p-5 xl:p-7">
              <div className="w-full max-w-[1500px] mx-auto min-h-full">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 min-h-full overflow-hidden">
                  {currentScreen === 'home' && (
                    <HomeScreen
                      onNavigate={(screen) =>
                        navigateToScreen(screen)
                      }
                    />
                  )}

                  {currentScreen === 'loan-calculator' && (
                    <LoanCalculatorScreen
                      key={`desktop-loan-${resetKey}`}
                      onGoHome={handleGoHome}
                    />
                  )}

                  {currentScreen === 'paysheet-calculator' && (
                    <PaySheetCalculatorScreen
                      key={`desktop-paysheet-${resetKey}`}
                      onGoHome={handleGoHome}
                      onNavigateToLoanCalculator={
                        handleOpenLoanInCalculator
                      }
                      customInstallmentFromLoanCalc={
                        customTotalInstallment
                      }
                      onClearCustomInstallment={() =>
                        setCustomTotalInstallment(null)
                      }
                    />
                  )}

                  {currentScreen ===
                    'paysheet-loan-calculator' && (
                    <PaySheetLoanCalculatorScreen
                      key={`desktop-paysheet-loan-${resetKey}`}
                      onGoHome={handleGoHome}
                      onGoBackToPaySheet={(installment) => {
                        if (typeof installment === 'number') {
                          setCustomTotalInstallment(
                            installment
                          );
                        }

                        navigateToScreen(
                          'paysheet-calculator'
                        );
                      }}
                      initialLoanType={
                        loanCalcParams?.loanType
                      }
                      initialAmount={
                        loanCalcParams?.amount
                      }
                      initialMonths={
                        loanCalcParams?.months
                      }
                      balanceAfterDeduction={
                        loanCalcParams?.balanceAfterDeduction
                      }
                      bankDeductionsTotal={
                        loanCalcParams?.bankDeductionsTotal
                      }
                    />
                  )}

                  {currentScreen === 'applications' && (
                    <ApplicationsScreen
                      onGoHome={handleGoHome}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>

      <OfflineIndicator />
    </div>
  );
}