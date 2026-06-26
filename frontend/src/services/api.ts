const BASE_URL = "http://localhost:8000/api";

export interface CustomerData {
  gender: "Male" | "Female";
  SeniorCitizen: 0 | 1;
  Partner: "Yes" | "No";
  Dependents: "Yes" | "No";
  tenure: number;
  PhoneService: "Yes" | "No";
  InternetService: "DSL" | "Fiber optic" | "No";
  Contract: "Month-to-month" | "One year" | "Two year";
  PaymentMethod: "Electronic check" | "Mailed check" | "Bank transfer" | "Credit card";
  MonthlyCharges: number;
  TotalCharges?: number;
}

export interface FactorExplanation {
  feature: string;
  value: any;
  description: string;
  impact: number;
}

export interface PredictionResponse {
  churn_prediction: "Yes" | "No";
  churn_probability: number;
  risk_level: "Low" | "Medium" | "High";
  risk_factors: FactorExplanation[];
  protective_factors: FactorExplanation[];
  suggestions: string[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
}

export interface ModelPerformanceResponse {
  best_model_name: string;
  performance_metrics: { [key: string]: ModelMetrics };
  feature_importances: { feature: string; importance: number }[];
}

export interface DatasetStats {
  total_records: number;
  num_churn: number;
  num_active: number;
  churn_rate: number;
  average_tenure: number;
  average_monthly_charges: number;
}

export interface DashboardMetricsResponse {
  dataset_stats: DatasetStats;
  contract_churn_distribution: {
    [key: string]: { Active: number; Churned: number };
  };
  payment_churn_distribution: {
    [key: string]: { Active: number; Churned: number };
  };
  recent_activity: Array<{
    id: string;
    action: string;
    description: string;
    risk: "High" | "Low";
    charges: number;
    contract: string;
  }>;
}

export async function fetchHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}

export async function fetchDashboardMetrics(): Promise<DashboardMetricsResponse> {
  const res = await fetch(`${BASE_URL}/dashboard-metrics`);
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard metrics: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchModelPerformance(): Promise<ModelPerformanceResponse> {
  const res = await fetch(`${BASE_URL}/model-performance`);
  if (!res.ok) {
    throw new Error(`Failed to fetch model performance: ${res.statusText}`);
  }
  return res.json();
}

export async function predictChurn(customer: CustomerData): Promise<PredictionResponse> {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });
  if (!res.ok) {
    throw new Error(`Failed to run churn prediction: ${res.statusText}`);
  }
  return res.json();
}
