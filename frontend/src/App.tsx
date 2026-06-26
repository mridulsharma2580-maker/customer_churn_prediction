import React, { useState, useEffect } from "react";
import { fetchHealth } from "./services/api";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { PredictionPage } from "./pages/PredictionPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { InsightsPage } from "./pages/InsightsPage";
import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Lightbulb,
  Sun,
  Moon,
  Menu,
  X,
  Compass,
} from "lucide-react";

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);

  // Poll API health on mount and periodically
  useEffect(() => {
    const checkApi = async () => {
      const status = await fetchHealth();
      setIsApiOnline(status);
    };
    checkApi();
    const interval = setInterval(checkApi, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  // Update HTML class for dark/light mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.remove("light");
      root.classList.add("dark");
      root.style.backgroundColor = "#020617"; // slate-950
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.backgroundColor = "#f8fafc"; // slate-50
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "prediction", label: "Churn Predictor", icon: Brain },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "insights", label: "AI Insights", icon: Lightbulb },
  ];

  return (
    <div className={`min-h-screen font-sans flex ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 w-64 glass-panel border-r border-slate-800 transition-transform duration-300 transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col justify-between">
          <div className="p-6 space-y-8">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setCurrentPage("landing")}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-500/20">
                C
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
                  ChurnAI
                </span>
                <span className="text-[10px] block font-semibold text-emerald-400 uppercase tracking-widest leading-none">
                  Portal
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              <button
                onClick={() => {
                  setCurrentPage("landing");
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                  currentPage === "landing"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                    : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Compass className="w-5 h-5" />
                <span>Explore Landing</span>
              </button>

              <div className="py-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4">
                  Analytics & Inference
                </span>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer of Sidebar */}
          <div className="p-6 border-t border-slate-800 space-y-4">
            {/* API Status indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">FastAPI Server:</span>
              <div className="flex items-center gap-1.5 font-bold">
                {isApiOnline === null ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span>
                    <span className="text-slate-500">Checking...</span>
                  </>
                ) : isApiOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50"></span>
                    <span className="text-emerald-400">Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-md shadow-red-500/50"></span>
                    <span className="text-red-500">Offline</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
              v1.0.0-beta • Enterprise Edition
            </p>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col lg:pl-64 transition-all duration-300`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 glass-panel border-b border-slate-800 flex items-center justify-between px-6">
          {/* Left: Hamburger toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-200 lg:hidden rounded-xl border border-transparent hover:bg-slate-900/40"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden lg:block">
            <span className="text-slate-500 text-xs font-semibold">Active workspace: customer-churn-prediction</span>
          </div>

          {/* Right: Theme Toggle & Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl glass-panel text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 transition-all"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold border border-slate-700">
                US
              </span>
              <span className="hidden md:inline text-xs text-slate-300 font-medium">User Session</span>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {currentPage === "landing" && <LandingPage onNavigate={setCurrentPage} />}
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "prediction" && <PredictionPage />}
          {currentPage === "analytics" && <AnalyticsPage />}
          {currentPage === "insights" && <InsightsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
