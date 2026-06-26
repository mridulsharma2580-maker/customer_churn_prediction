import React, { useState } from "react";
import { Flame, Zap, Shield, Sparkles, MessageSquare } from "lucide-react";

export const InsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"high" | "medium" | "low">("high");

  const strategies = {
    high: {
      title: "Critical Retention Playbook (High Risk)",
      badge: "Urgent Action Required",
      colorClass: "text-red-400 border-red-500/20 bg-red-500/10",
      description: "Customers in this tier have a >70% calculated probability of leaving, usually driven by month-to-month contracts, electronic check billing, and high monthly charges.",
      tactics: [
        {
          name: "Direct Outreach Call",
          cost: "Medium",
          uplift: "+28% retention",
          desc: "Initiate an outbound call from the executive customer success team to discuss usage issues and resolve outstanding billing friction."
        },
        {
          name: "Contract Upgrade Discount",
          cost: "High ($15-20 credit)",
          uplift: "+45% retention",
          desc: "Offer a $15/month credit for 6 months if the customer signs up for a stable 1-Year or 2-Year contract."
        },
        {
          name: "Auto-pay Migration Credit",
          cost: "Low ($5 credit)",
          uplift: "+18% retention",
          desc: "Offer a one-time $10 account credit to set up credit card or bank transfer automatic payments and disable electronic checks."
        }
      ]
    },
    medium: {
      title: "Nurturing Retention Playbook (Medium Risk)",
      badge: "Proactive Engagement",
      colorClass: "text-amber-400 border-amber-500/20 bg-amber-500/10",
      description: "Customers in this tier have a 30% - 70% probability of leaving. Typical drivers are lack of family plans (dependents/partners) or expensive fiber optic plans without bundle packages.",
      tactics: [
        {
          name: "Usage Auditing & Optimization",
          cost: "Low (Time-only)",
          uplift: "+20% retention",
          desc: "Send an automated email highlighting their bandwidth utilization and suggesting custom value bundles."
        },
        {
          name: "Family Bundle Discount",
          cost: "Medium ($10/mo discount)",
          uplift: "+32% retention",
          desc: "Provide option to convert plan into a family tier adding discounted mobile slots, aligning with dependents protective coefficients."
        },
        {
          name: "Technical Support Check-in",
          cost: "Low",
          uplift: "+15% retention",
          desc: "Schedule a router diagnosis check-in via chatbot to resolve fiber connection drop-offs."
        }
      ]
    },
    low: {
      title: "Loyalty Expansion Playbook (Low Risk)",
      badge: "Advocacy & Upsell",
      colorClass: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      description: "Customers in this tier have a <30% probability of leaving. They usually have long tenure, multi-year contracts, and bank-automated payment schemes.",
      tactics: [
        {
          name: "Loyalty Points Booster",
          cost: "Low",
          uplift: "+5% NPS score",
          desc: "Send standard loyalty vouchers and rewards to reinforce satisfaction."
        },
        {
          name: "Premium early-access upgrade",
          cost: "Low (Marginal cost)",
          uplift: "+12% ARPU",
          desc: "Offer discounted trials of new smart home security or high-speed bandwidth upgrades."
        },
        {
          name: "Referral Reward Program",
          cost: "Performance-based",
          uplift: "+1.2 new signups",
          desc: "Offer a $25 referral gift card to incentivize user sharing."
        }
      ]
    }
  };

  const activeStrategy = strategies[activeTab];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Insights & Actions</h1>
        <p className="text-slate-400 text-sm">Algorithmic playbooks and financial retention recommendations based on user risk categories.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/60 border border-slate-800 p-1.5 rounded-2xl max-w-lg">
        <button
          onClick={() => setActiveTab("high")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "high"
              ? "bg-red-500/15 border border-red-500/30 text-red-400 shadow-lg"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>High Risk</span>
        </button>
        <button
          onClick={() => setActiveTab("medium")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "medium"
              ? "bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Medium Risk</span>
        </button>
        <button
          onClick={() => setActiveTab("low")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "low"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Low Risk</span>
        </button>
      </div>

      {/* Active Playbook Card */}
      <div className="glass-card p-8 rounded-3xl space-y-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full"></div>

        {/* Playbook Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider inline-block ${activeStrategy.colorClass}`}>
              {activeStrategy.badge}
            </div>
            <h2 className="text-2xl font-bold text-slate-100">{activeStrategy.title}</h2>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
          {activeStrategy.description}
        </p>

        {/* Tactics list */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Recommended Tactic Deployments</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeStrategy.tactics.map((tactic, i) => (
              <div key={i} className="p-6 rounded-2xl glass-panel flex flex-col justify-between hover:border-slate-700 transition-all space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200 text-sm">{tactic.name}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{tactic.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-slate-500 uppercase">Cost: {tactic.cost}</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                    {tactic.uplift}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Retention Summary */}
      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between border-l-4 border-l-emerald-500">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>Need Automated Communications?</span>
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
            Integrate this AI system with HubSpot, Salesforce, or Marketo to trigger these campaigns automatically the moment a customer's churn risk shifts past the threshold.
          </p>
        </div>
        <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex-shrink-0">
          Request API Hook Integration
        </button>
      </div>
    </div>
  );
};
