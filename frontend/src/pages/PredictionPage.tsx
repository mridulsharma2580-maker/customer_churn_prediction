import React, { useState, useEffect } from "react";
import { predictChurn } from "../services/api";
import type { CustomerData, PredictionResponse } from "../services/api";
import { Brain, ShieldAlert, ShieldCheck, Play, RefreshCw } from "lucide-react";

export const PredictionPage: React.FC = () => {
  const [formData, setFormData] = useState<CustomerData>({
    gender: "Male",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 12,
    PhoneService: "Yes",
    InternetService: "Fiber optic",
    Contract: "Month-to-month",
    PaymentMethod: "Electronic check",
    MonthlyCharges: 75.0,
    TotalCharges: 900.0,
  });

  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-adjust charges based on services when changed (realistic baseline)
  useEffect(() => {
    let mc = 18.0;
    if (formData.PhoneService === "Yes") mc += 10.0;
    if (formData.InternetService === "DSL") mc += 30.0;
    else if (formData.InternetService === "Fiber optic") mc += 60.0;

    // Preserve some variance but align charges closer to defaults unless manually changed
    setFormData((prev) => ({
      ...prev,
      MonthlyCharges: prev.MonthlyCharges ? prev.MonthlyCharges : mc,
      TotalCharges: Math.round(prev.tenure * mc * 100) / 100,
    }));
  }, [formData.PhoneService, formData.InternetService, formData.tenure]);

  // Run a default prediction on initial load so the page is not blank
  useEffect(() => {
    handleSubmit();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Parse numbers
      if (name === "tenure") {
        updated.tenure = parseInt(value, 10);
      } else if (name === "SeniorCitizen") {
        updated.SeniorCitizen = parseInt(value, 10) as 0 | 1;
      } else if (name === "MonthlyCharges") {
        updated.MonthlyCharges = parseFloat(value);
      }
      
      // Recalculate total charges
      if (name === "tenure" || name === "MonthlyCharges") {
        const tenureVal = name === "tenure" ? parseInt(value, 10) : prev.tenure;
        const mcVal = name === "MonthlyCharges" ? parseFloat(value) : prev.MonthlyCharges;
        updated.TotalCharges = Math.round(tenureVal * mcVal * 100) / 100;
      }
      
      return updated as CustomerData;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // API request to FastAPI
      const res = await predictChurn(formData);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError("Prediction failed. Make sure the FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // Helper colors
  const getRiskColor = (level: string) => {
    if (level === "Low") return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
    if (level === "Medium") return "text-amber-400 border-amber-500/20 bg-amber-500/10";
    return "text-red-400 border-red-500/20 bg-red-500/10";
  };

  const getRiskRingColor = (level: string) => {
    if (level === "Low") return "stroke-emerald-500";
    if (level === "Medium") return "stroke-amber-500";
    return "stroke-red-500";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Churn Predictor</h1>
        <p className="text-slate-400 text-sm">Input customer demographics and contract features to calculate churn risks in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-6 lg:col-span-7">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-200">Customer Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 transition-all outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Senior Citizen */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Senior Citizen Status</label>
              <select
                name="SeniorCitizen"
                value={formData.SeniorCitizen}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 transition-all outline-none"
              >
                <option value="0">No (Age &lt; 65)</option>
                <option value="1">Yes (Age &ge; 65)</option>
              </select>
            </div>

            {/* Partner */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Has Partner</label>
              <select
                name="Partner"
                value={formData.Partner}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 transition-all outline-none"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Dependents */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Has Dependents</label>
              <select
                name="Dependents"
                value={formData.Dependents}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 transition-all outline-none"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Phone Service */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Service</label>
              <select
                name="PhoneService"
                value={formData.PhoneService}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 transition-all outline-none"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Internet Service */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Internet Connection</label>
              <select
                name="InternetService"
                value={formData.InternetService}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 transition-all outline-none"
              >
                <option value="DSL">DSL Connection</option>
                <option value="Fiber optic">Fiber Optic Connection</option>
                <option value="No">No Internet Service</option>
              </select>
            </div>

            {/* Contract Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contract Type</label>
              <select
                name="Contract"
                value={formData.Contract}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 transition-all outline-none"
              >
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Channel</label>
              <select
                name="PaymentMethod"
                value={formData.PaymentMethod}
                onChange={handleInputChange}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 rounded-xl px-3.5 py-2.5 transition-all outline-none"
              >
                <option value="Electronic check">Electronic Check</option>
                <option value="Mailed check">Mailed Check</option>
                <option value="Bank transfer">Bank Transfer (Automatic)</option>
                <option value="Credit card">Credit Card (Automatic)</option>
              </select>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Account Tenure</span>
              <span className="text-emerald-400 font-bold normal-case text-sm">{formData.tenure} months</span>
            </div>
            <input
              type="range"
              name="tenure"
              min="1"
              max="72"
              value={formData.tenure}
              onChange={handleInputChange}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Monthly Charges Input / Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Monthly Bill</span>
              <span className="text-emerald-400 font-bold normal-case text-sm">${formData.MonthlyCharges.toFixed(2)} / month</span>
            </div>
            <input
              type="range"
              name="MonthlyCharges"
              min="18"
              max="120"
              step="0.5"
              value={formData.MonthlyCharges}
              onChange={handleInputChange}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Aggregated Total charges display */}
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs flex justify-between text-slate-400">
            <span>Estimated Total Charges:</span>
            <span className="font-bold text-slate-200">${formData.TotalCharges?.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running Prediction Model...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Calculate Churn Probability</span>
              </>
            )}
          </button>
        </form>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Circular Gauge Card */}
              <div className="glass-card p-6 rounded-2xl text-center space-y-6 flex flex-col items-center justify-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">Churn Analysis Result</h3>
                  <p className="text-slate-500 text-xs">Calculated by Logistic Regression model</p>
                </div>

                {/* Circular Indicator */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background track */}
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    {/* Progress Fill */}
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      className={getRiskRingColor(result.risk_level)}
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={408.4}
                      strokeDashoffset={408.4 - (result.churn_probability * 408.4)}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold tracking-tight">
                      {(result.churn_probability * 100).toFixed(0)}%
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Churn Risk</p>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div className={`px-4 py-1.5 rounded-full border text-xs font-bold ${getRiskColor(result.risk_level)}`}>
                  {result.risk_level} Risk Segment
                </div>
              </div>

              {/* Explanations Drivers */}
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">Feature Risk Drivers</h3>
                  <p className="text-slate-500 text-xs">Local explanations showing positive and protective influences.</p>
                </div>

                {/* Risk Factors */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Risk Indicators (Increases Odds)</span>
                  </h4>
                  {result.risk_factors.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No significant risk contributors detected.</p>
                  ) : (
                    <div className="space-y-3">
                      {result.risk_factors.slice(0, 3).map((factor, i) => (
                        <div key={`risk-${i}`} className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>{factor.description}</span>
                            <span className="text-red-400 font-semibold">+{(factor.impact * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-900/60 h-1.5 rounded border border-slate-800 overflow-hidden">
                            <div
                              className="bg-red-500 h-full rounded"
                              style={{ width: `${Math.min(factor.impact * 100 * 2, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Protective Factors */}
                <div className="space-y-3.5 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Protective Indicators (Reduces Odds)</span>
                  </h4>
                  {result.protective_factors.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No significant protective contributors detected.</p>
                  ) : (
                    <div className="space-y-3">
                      {result.protective_factors.slice(0, 3).map((factor, i) => (
                        <div key={`protect-${i}`} className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>{factor.description}</span>
                            <span className="text-emerald-400 font-semibold">{(factor.impact * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-900/60 h-1.5 rounded border border-slate-800 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded"
                              style={{ width: `${Math.min(Math.abs(factor.impact) * 100 * 2, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Suggestions */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">Retention Suggestions</h3>
                  <p className="text-slate-500 text-xs">Algorithmic playbooks based on risk factors.</p>
                </div>
                <ul className="space-y-2.5">
                  {result.suggestions.map((sug, i) => (
                    <li key={`sug-${i}`} className="text-xs text-slate-300 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
