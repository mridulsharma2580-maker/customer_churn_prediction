import os
import json
import random
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Relative imports
try:
    from app.schemas import (
        CustomerInput, PredictResponse, ModelPerformanceResponse, 
        DashboardMetricsResponse, DatasetStats
    )
    from app.ml.pipeline import load_pipeline
    from app.ml.train import train_and_evaluate
except ImportError:
    from schemas import (
        CustomerInput, PredictResponse, ModelPerformanceResponse, 
        DashboardMetricsResponse, DatasetStats
    )
    from ml.pipeline import load_pipeline
    from ml.train import train_and_evaluate

app = FastAPI(
    title="Customer Churn Prediction API",
    description="FastAPI Backend for predicting customer churn using scikit-learn models.",
    version="1.0.0"
)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Vite development server runs on a separate port.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold model and data cache
predictor_pipeline = None
metadata = None
df_cache = None

# Paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
PIPELINE_PATH = os.path.join(DATA_DIR, "best_churn_pipeline.joblib")
METADATA_PATH = os.path.join(DATA_DIR, "model_metadata.json")
CSV_PATH = os.path.join(DATA_DIR, "customer_churn.csv")

def ensure_model_and_data():
    """
    Ensures that the synthetic data has been generated and the model trained.
    Loads them into memory.
    """
    global predictor_pipeline, metadata, df_cache
    
    # If already loaded, skip
    if predictor_pipeline is not None and metadata is not None and df_cache is not None:
        return
        
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Train if files do not exist
    if not os.path.exists(PIPELINE_PATH) or not os.path.exists(METADATA_PATH) or not os.path.exists(CSV_PATH):
        print("Model or dataset not found. Running training workflow...")
        train_and_evaluate()
        
    # Load model pipeline
    print(f"Loading predictive pipeline from {PIPELINE_PATH}")
    predictor_pipeline = load_pipeline(PIPELINE_PATH)
    
    # Load metadata
    print(f"Loading model metadata from {METADATA_PATH}")
    with open(METADATA_PATH, "r") as f:
        metadata = json.load(f)
        
    # Load dataset for statistics
    print(f"Loading cached dataset from {CSV_PATH}")
    df_cache = pd.read_csv(CSV_PATH)

@app.on_event("startup")
def startup_event():
    ensure_model_and_data()

@app.get("/api/health")
def health_check():
    """
    Simple health check endpoint.
    """
    try:
        ensure_model_and_data()
        return {
            "status": "healthy",
            "model_loaded": predictor_pipeline is not None,
            "dataset_loaded": df_cache is not None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.get("/api/model-performance", response_model=ModelPerformanceResponse)
def get_model_performance():
    """
    Returns the training/validation performance metrics and overall feature importances.
    """
    ensure_model_and_data()
    if not metadata:
        raise HTTPException(status_code=500, detail="Metadata not loaded")
    return ModelPerformanceResponse(
        best_model_name=metadata["best_model_name"],
        performance_metrics=metadata["performance_metrics"],
        feature_importances=metadata["feature_importances"]
    )

@app.get("/api/dashboard-metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics():
    """
    Returns aggregated metrics from the synthetic dataset, distributions, and mock recent activity.
    """
    ensure_model_and_data()
    if df_cache is None or not metadata:
        raise HTTPException(status_code=500, detail="Data or metadata cache not loaded")
        
    # Extract stats from metadata JSON
    stats_data = metadata["dataset_stats"]
    stats = DatasetStats(
        total_records=stats_data["total_records"],
        num_churn=stats_data["num_churn"],
        num_active=stats_data["num_active"],
        churn_rate=stats_data["churn_rate"],
        average_tenure=stats_data["average_tenure"],
        average_monthly_charges=stats_data["average_monthly_charges"]
    )
    
    # Contract Churn Distribution
    # Group by Contract and Churn and count
    contract_groups = df_cache.groupby(["Contract", "Churn"]).size().unstack(fill_value=0)
    contract_dist = {}
    for idx, row in contract_groups.iterrows():
        contract_dist[idx] = {
            "Active": int(row.get("No", 0)),
            "Churned": int(row.get("Yes", 0))
        }
        
    # Payment Method Churn Distribution
    payment_groups = df_cache.groupby(["PaymentMethod", "Churn"]).size().unstack(fill_value=0)
    payment_dist = {}
    for idx, row in payment_groups.iterrows():
        payment_dist[idx] = {
            "Active": int(row.get("No", 0)),
            "Churned": int(row.get("Yes", 0))
        }
        
    # Generate static, realistic recent actions feed
    random.seed(42)  # Keep it deterministic/stable per app instance
    sample_indices = random.sample(range(len(df_cache)), 5)
    recent_activity = []
    
    action_types = ["Prediction run", "Status updated", "Retention offer sent", "Plan upgraded", "Feedback logged"]
    
    for idx in sample_indices:
        cust = df_cache.iloc[idx]
        is_churn = cust["Churn"] == "Yes"
        act_type = random.choice(action_types)
        
        # Adjust description based on the churn value
        if is_churn:
            desc = f"Customer {cust['customerID']} has high churn probability. Suggested retention: discount on Contract."
        else:
            desc = f"Customer {cust['customerID']} analyzed. Predicted risk is Low ({cust['tenure']} months tenure)."
            
        recent_activity.append({
            "id": cust["customerID"],
            "action": act_type,
            "description": desc,
            "risk": "High" if is_churn else "Low",
            "charges": float(cust["MonthlyCharges"]),
            "contract": cust["Contract"]
        })
        
    return DashboardMetricsResponse(
        dataset_stats=stats,
        contract_churn_distribution=contract_dist,
        payment_churn_distribution=payment_dist,
        recent_activity=recent_activity
    )

@app.post("/api/predict", response_model=PredictResponse)
def predict_churn(customer: CustomerInput):
    """
    Accepts customer profile details, predicts churn probability, and provides local explanations.
    """
    ensure_model_and_data()
    if predictor_pipeline is None:
        raise HTTPException(status_code=500, detail="Predictive pipeline not initialized")
        
    # Convert input to dict and handle optional TotalCharges
    cust_dict = customer.dict()
    if cust_dict["TotalCharges"] is None:
        cust_dict["TotalCharges"] = round(cust_dict["tenure"] * cust_dict["MonthlyCharges"], 2)
        
    # Predict using the custom pipeline method that computes explanations
    try:
        explanation = predictor_pipeline.explain_prediction(cust_dict)
        prob = explanation["churn_probability"]
        
        # Decide prediction and risk level
        prediction = "Yes" if prob >= 0.5 else "No"
        if prob < 0.3:
            risk_level = "Low"
        elif prob < 0.7:
            risk_level = "Medium"
        else:
            risk_level = "High"
            
        return PredictResponse(
            churn_prediction=prediction,
            churn_probability=prob,
            risk_level=risk_level,
            risk_factors=explanation["risk_factors"],
            protective_factors=explanation["protective_factors"],
            suggestions=explanation["suggestions"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
