import os
import joblib
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

NUMERICAL_COLS = ["tenure", "MonthlyCharges", "TotalCharges"]
CATEGORICAL_COLS = [
    "gender", "Partner", "Dependents", "PhoneService", 
    "InternetService", "Contract", "PaymentMethod"
]
PASSTHROUGH_COLS = ["SeniorCitizen"]

def create_preprocessing_pipeline():
    """
    Creates a scikit-learn ColumnTransformer for preprocessing.
    """
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_COLS),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_COLS),
            ("pass", "passthrough", PASSTHROUGH_COLS)
        ]
    )
    return preprocessor

class ChurnPredictorPipeline:
    def __init__(self, model, preprocessor, feature_names=None):
        self.model = model
        self.preprocessor = preprocessor
        self.feature_names = feature_names
        
    def predict_probability(self, df_input):
        """
        Predicts churn probability for a DataFrame of customer inputs.
        """
        # Ensure df_input is a DataFrame
        if isinstance(df_input, dict):
            df_input = pd.DataFrame([df_input])
        elif isinstance(df_input, list):
            df_input = pd.DataFrame(df_input)
            
        # Clean potential numeric types
        for col in NUMERICAL_COLS:
            if col in df_input.columns:
                df_input[col] = pd.to_numeric(df_input[col])
                
        # Transform inputs
        X_processed = self.preprocessor.transform(df_input)
        
        # Predict probability of Churn == "Yes" (class 1)
        # Check model classes to map correctly
        prob = self.model.predict_proba(X_processed)[:, 1]
        return prob
    
    def explain_prediction(self, customer_dict):
        """
        Explains an individual prediction using model-agnostic local perturbation.
        Measures how much each feature shifts the probability relative to a baseline reference.
        """
        # Baseline reference profile representing a standard "average" user
        baseline = {
            "gender": "Male",
            "SeniorCitizen": 0,
            "Partner": "No",
            "Dependents": "No",
            "tenure": 24,
            "PhoneService": "Yes",
            "InternetService": "DSL",
            "Contract": "One year",
            "PaymentMethod": "Bank transfer",
            "MonthlyCharges": 60.0,
            "TotalCharges": 1440.0
        }
        
        # Original prediction
        original_prob = self.predict_probability(customer_dict)[0]
        
        contributions = []
        all_features = NUMERICAL_COLS + CATEGORICAL_COLS + PASSTHROUGH_COLS
        
        for feature in all_features:
            # Create a copy and perturb the specific feature to baseline
            perturbed_dict = customer_dict.copy()
            perturbed_dict[feature] = baseline[feature]
            
            # Predict with the perturbed profile
            perturbed_prob = self.predict_probability(perturbed_dict)[0]
            
            # Difference is the local impact
            # Positive diff means the customer's actual value increases churn risk compared to baseline
            diff = original_prob - perturbed_prob
            
            val = customer_dict[feature]
            # Human readable explanation formatting
            if feature == "tenure":
                desc = f"{val} months tenure"
            elif feature == "MonthlyCharges":
                desc = f"${val:.2f} monthly charges"
            elif feature == "TotalCharges":
                desc = f"${val:.2f} total charges"
            elif feature == "Contract":
                desc = f"{val} contract"
            elif feature == "InternetService":
                desc = f"{val} internet service"
            elif feature == "PaymentMethod":
                desc = f"{val} payment method"
            elif feature == "SeniorCitizen":
                desc = "Senior citizen" if val == 1 else "Non-senior citizen"
            else:
                desc = f"{feature}: {val}"
                
            contributions.append({
                "feature": feature,
                "value": val,
                "description": desc,
                "impact": float(diff)
            })
            
        # Sort contributions by absolute impact
        contributions.sort(key=lambda x: abs(x["impact"]), reverse=True)
        
        # Split into risk factors (increases risk) and protective factors (decreases risk)
        # Filter out negligible impacts (e.g., < 0.005)
        risk_factors = [c for c in contributions if c["impact"] > 0.005]
        protective_factors = [c for c in contributions if c["impact"] < -0.005]
        
        # Order protective factors so that most protective (most negative impact) is first
        protective_factors.sort(key=lambda x: x["impact"])
        
        # Provide suggestions based on top risk factors
        suggestions = []
        top_risks = [r["feature"] for r in risk_factors[:3]]
        
        if "Contract" in top_risks and customer_dict["Contract"] == "Month-to-month":
            suggestions.append("Offer a discount to upgrade to a 1-Year or 2-Year contract.")
        if "MonthlyCharges" in top_risks and customer_dict["MonthlyCharges"] > 70:
            suggestions.append("Review service usage to offer a lower-cost plan or customized bundle.")
        if "PaymentMethod" in top_risks and customer_dict["PaymentMethod"] == "Electronic check":
            suggestions.append("Incentivize migrating to Automatic Payment (Credit card or Bank transfer) with a billing credit.")
        if "InternetService" in top_risks and customer_dict["InternetService"] == "Fiber optic":
            suggestions.append("Proactively check connection satisfaction and offer premium loyalty support.")
        if "tenure" in top_risks and customer_dict["tenure"] <= 6:
            suggestions.append("Initiate a customer success onboarding call to guide them through service setup and address early pain points.")
            
        # Default fallback suggestion if list is empty
        if not suggestions:
            suggestions.append("Schedule a routine account review call to build relationship value.")
            
        return {
            "churn_probability": float(original_prob),
            "risk_factors": risk_factors,
            "protective_factors": protective_factors,
            "suggestions": suggestions
        }

def save_pipeline(pipeline_obj, filepath):
    directory = os.path.dirname(filepath)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)
    joblib.dump(pipeline_obj, filepath)
    print(f"Pipeline saved to {filepath}")

def load_pipeline(filepath):
    return joblib.load(filepath)
