from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal, Optional

class CustomerInput(BaseModel):
    gender: Literal["Male", "Female"]
    SeniorCitizen: Literal[0, 1]
    Partner: Literal["Yes", "No"]
    Dependents: Literal["Yes", "No"]
    tenure: int = Field(..., ge=1, le=120, description="Tenure in months")
    PhoneService: Literal["Yes", "No"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaymentMethod: Literal["Electronic check", "Mailed check", "Bank transfer", "Credit card"]
    MonthlyCharges: float = Field(..., ge=0, description="Monthly billing charges")
    TotalCharges: Optional[float] = Field(None, ge=0, description="Total charges billed. If omitted, will be auto-calculated.")

class FactorExplanation(BaseModel):
    feature: str
    value: Any
    description: str
    impact: float

class PredictResponse(BaseModel):
    churn_prediction: Literal["Yes", "No"]
    churn_probability: float
    risk_level: Literal["Low", "Medium", "High"]
    risk_factors: List[FactorExplanation]
    protective_factors: List[FactorExplanation]
    suggestions: List[str]

class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: float

class ModelPerformanceResponse(BaseModel):
    best_model_name: str
    performance_metrics: Dict[str, ModelMetrics]
    feature_importances: List[Dict[str, Any]]

class DatasetStats(BaseModel):
    total_records: int
    num_churn: int
    num_active: int
    churn_rate: float
    average_tenure: float
    average_monthly_charges: float

class DashboardMetricsResponse(BaseModel):
    dataset_stats: DatasetStats
    contract_churn_distribution: Dict[str, Dict[str, int]]
    payment_churn_distribution: Dict[str, Dict[str, int]]
    recent_activity: List[Dict[str, Any]]
