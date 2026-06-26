import React, { useEffect, useState } from "react";
import { fetchDashboardMetrics, fetchModelPerformance } from "../services/api";
import type { DashboardMetricsResponse, ModelPerformanceResponse } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { BarChart3, RefreshCw, AlertCircle } from "lucide-react";

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [modelPerf, setModelPerf] = useState<ModelPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, perfData] = await Promise.all([
        fetchDashboardMetrics(),
        fetchModelPerformance(),
      ]);
      setMetrics(metricsData);
      setModelPerf(perfData);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch analytics data. Please make sure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">Loading advanced analytics models...</p>
      </div>
    );
  }

  if (error || !metrics || !modelPerf) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-100">API Connection Offline</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 1. Feature Importance Data formatting
  const importanceData = modelPerf.feature_importances.slice(0, 10).map((item) => ({
    name: item.feature,
    "Weight / Impact": parseFloat((item.importance * 100).toFixed(1)),
  }));

  // 2. Payment Method Data formatting
  const paymentChartData = Object.keys(metrics.payment_churn_distribution).map((key) => {
    const data = metrics.payment_churn_distribution[key];
    const total = data.Active + data.Churned;
    const rate = total > 0 ? (data.Churned / total) * 100 : 0;
    return {
      name: key,
      Active: data.Active,
      Churned: data.Churned,
      "Churn Rate (%)": parseFloat(rate.toFixed(1)),
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Advanced Analytics</h1>
          <p className="text-slate-400 text-sm">Deep-dive correlation charts and global machine learning driver weights.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2.5 glass-panel hover:bg-slate-800/40 text-slate-300 rounded-xl transition-all border border-slate-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global Feature Importance */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[450px]">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Global Feature Importance</h3>
            <p className="text-slate-500 text-xs">Relative weights assigned by the machine learning algorithm.</p>
          </div>
          <div className="flex-1 min-h-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={importanceData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="Weight / Impact" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn by Payment Method */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[450px]">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Churn by Payment Channel</h3>
            <p className="text-slate-500 text-xs">Comparing total active/churned counts against churn percentage.</p>
          </div>
          <div className="flex-1 min-h-0 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paymentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
                <Bar dataKey="Active" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Churn Rate (%)" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Extra Explainer Card */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">Key Correlation Insights</h3>
            <p className="text-slate-500 text-xs">Identified statistical drivers within the Telco Churn system.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-300 text-sm">Contract Leverage</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Customers on <strong>Month-to-month</strong> contracts exhibit a churn rate nearly 6x higher than those on multi-year agreements. Moving monthly contracts to 1-Year plans represents the highest retention opportunity.
            </p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-300 text-sm">Billing friction</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Paying via <strong>Electronic check</strong> correlates with elevated churn, likely due to manually entered transactions and monthly balance friction. Automating payments (credit card, bank transfer) decreases churn significantly.
            </p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-300 text-sm">Service Value Fit</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Customers with <strong>Fiber optic</strong> connections have high monthly charges, leading to higher sensitivity to pricing. Proactive onboarding checks and customized bundling help anchor the service value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
