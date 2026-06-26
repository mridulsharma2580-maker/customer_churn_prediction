import React from "react";
import { BarChart3, BrainCircuit, Users, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 overflow-hidden py-12">
      {/* Decorative Blur Orbs */}
      <div className="glow-bg top-10 left-10 opacity-60"></div>
      <div className="glow-bg-pink bottom-10 right-10 opacity-50"></div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-emerald-500/20 text-emerald-400 text-sm font-medium animate-pulse-slow">
          <BrainCircuit className="w-4 h-4" />
          <span>Next-Generation Predictive Analytics</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none">
          Anticipate Churn. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500">
            Retain Customers.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-light leading-relaxed">
          Unlock machine learning insights to detect customer defection risk early,
          explain churn factor drivers, and deploy proactive retention workflows.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>Open Churn Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate("prediction")}
            className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-slate-800/50 text-slate-200 hover:text-white font-medium rounded-xl border border-slate-700 hover:border-slate-500 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Predict Individual Churn</span>
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {/* Card 1 */}
          <div className="glass-card glass-panel-hover p-6 rounded-2xl text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Live Churn Dashboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitor key performance indicators including active user distribution, churn rates, contract models, and aggregate behaviors.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-panel-hover p-6 rounded-2xl text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/25">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Single-Customer Prediction</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Calculate risk probabilities on the fly, with precise positive and negative drivers detailed through local model explanations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-panel-hover p-6 rounded-2xl text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/25">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Visual Insights & Actions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Analyze statistical correlations between contracts, payment channels, charges, and view custom algorithmic retention recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
