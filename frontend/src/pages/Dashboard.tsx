import React, { useEffect, useState } from "react";
import { fetchDashboardMetrics, fetchModelPerformance } from "../services/api";
import type { DashboardMetricsResponse, ModelPerformanceResponse } from "../services/api";
import { Users, UserX, UserCheck, TrendingUp, Cpu, Award, RefreshCw, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const Dashboard: React.FC = () => {
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
      setError("Failed to fetch dashboard data. Please make sure the FastAPI server is running on localhost:8000.");
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
        <p className="text-slate-400 font-medium">Loading churn analysis dashboard...</p>
      </div>
    );
  }

  if (error || !metrics || !modelPerf) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
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

  const stats = metrics.dataset_stats;
  const churnRatePct = (stats.churn_rate * 100).toFixed(1);

  // 1. Churn pie data
  const pieData = [
    { name: "Active", value: stats.num_active },
    { name: "Churned", value: stats.num_churn },
  ];
  const COLORS = ["#10b981", "#ef4444"];

  // 2. Contract distribution data for bar chart
  const contractChartData = Object.keys(metrics.contract_churn_distribution).map((key) => {
    const data = metrics.contract_churn_distribution[key];
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
          <h1 className="text-3xl font-extrabold tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-400 text-sm">System performance metrics and aggregate customer churn analysis.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2.5 glass-panel hover:bg-slate-800/40 text-slate-300 rounded-xl transition-all border border-slate-700"
          title="Refresh Dashboard"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Customers</p>
            <h3 className="text-3xl font-bold tracking-tight">{stats.total_records.toLocaleString()}</h3>
            <p className="text-slate-500 text-xs">Synthetic user records</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Churned Users</p>
            <h3 className="text-3xl font-bold tracking-tight text-red-400">{stats.num_churn.toLocaleString()}</h3>
            <p className="text-slate-500 text-xs">Closed accounts</p>
          </div>
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center justify-center text-red-400">
            <UserX className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-teal-500 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Users</p>
            <h3 className="text-3xl font-bold tracking-tight">{stats.num_active.toLocaleString()}</h3>
            <p className="text-slate-500 text-xs">Active subscription base</p>
          </div>
          <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/25 rounded-xl flex items-center justify-center text-teal-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-pink-500 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Average Churn Rate</p>
            <h3 className="text-3xl font-bold tracking-tight text-pink-400">{churnRatePct}%</h3>
            <p className="text-slate-500 text-xs">Target benchmark &lt; 15%</p>
          </div>
          <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/25 rounded-xl flex items-center justify-center text-pink-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Model Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active vs Churned Ratio */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Customer Ratio</h3>
            <p className="text-slate-500 text-xs">Distribution of customer retention status.</p>
          </div>
          <div className="flex-1 min-h-0 relative flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Rate by Contract */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[360px] lg:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Churn Rate by Contract Type</h3>
            <p className="text-slate-500 text-xs">Churn percentages depending on billing models.</p>
          </div>
          <div className="flex-1 min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
                <Bar dataKey="Active" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="Churn Rate (%)" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Performance & Recent Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Engine Card */}
        <div className="glass-card p-6 rounded-2xl space-y-6 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-200">Active AI Model</h3>
              <p className="text-slate-500 text-xs">Real-time inference provider.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Selected Estimator:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                {modelPerf.best_model_name}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metrics Table</h4>
            <div className="space-y-2.5">
              {Object.keys(modelPerf.performance_metrics).map((modelName) => {
                const metric = modelPerf.performance_metrics[modelName];
                const isBest = modelName === modelPerf.best_model_name;
                return (
                  <div
                    key={modelName}
                    className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                      isBest ? "bg-emerald-500/5 border-emerald-500/20" : "bg-slate-950/20 border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${isBest ? "text-slate-200" : "text-slate-400"}`}>
                        {modelName} {isBest && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded ml-1">Best</span>}
                      </span>
                      <span className="text-slate-500">F1: {(metric.f1 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-slate-500 text-[10px]">
                      <div>Acc: {(metric.accuracy * 100).toFixed(0)}%</div>
                      <div>Prec: {(metric.precision * 100).toFixed(0)}%</div>
                      <div>Rec: {(metric.recall * 100).toFixed(0)}%</div>
                      <div>AUC: {metric.roc_auc.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Customer Activity Feed</h3>
            <p className="text-slate-500 text-xs">Simulated live feed of customer analysis and actions.</p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 mt-6">
            {metrics.recent_activity.map((act, index) => {
              const isHigh = act.risk === "High";
              return (
                <div
                  key={`${act.id}-${index}`}
                  className="p-4 rounded-xl glass-panel flex items-start gap-4 justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{act.id}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-xs font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {act.action}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{act.description}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
                        isHigh
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {act.risk} Risk
                    </span>
                    <p className="text-slate-500 text-[10px]">${act.charges}/mo • {act.contract}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
