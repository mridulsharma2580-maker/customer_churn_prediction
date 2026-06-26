import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import ConfusionMatrixDisplay, confusion_matrix
import matplotlib.pyplot as plt
from sklearn.metrics import ConfusionMatrixDisplay
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# Relative imports
try:
    from app.ml.dataset import generate_synthetic_data, save_dataset
    from app.ml.pipeline import create_preprocessing_pipeline, ChurnPredictorPipeline, save_pipeline
except ImportError:
    # If running directly from app/ml/ directory
    from dataset import generate_synthetic_data, save_dataset
    from pipeline import create_preprocessing_pipeline, ChurnPredictorPipeline, save_pipeline

def train_and_evaluate():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
    
    # 1. Load or Generate Dataset
    data_path = os.path.join(project_root, "data", "customer_churn.csv")
    if not os.path.exists(data_path):
        print("Dataset not found. Generating a synthetic dataset...")
        df = save_dataset(data_path)
    else:
        print(f"Loading existing dataset from {data_path}")
        df = pd.read_csv(data_path)
        
    # Split features and target
    X = df.drop(columns=["customerID", "Churn"])
    y = df["Churn"].apply(lambda x: 1 if x == "Yes" else 0)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 2. Setup preprocessing
    preprocessor = create_preprocessing_pipeline()
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Get feature names out
    try:
        feature_names = list(preprocessor.get_feature_names_out())
        # Clean feature names (remove prefix num__, cat__, pass__)
        cleaned_feature_names = []
        for name in feature_names:
            cleaned = name.split("__")[-1]
            cleaned_feature_names.append(cleaned)
    except Exception as e:
        print(f"Warning: could not get feature names from preprocessor: {e}")
        # Fallback names
        cleaned_feature_names = [f"Feature_{i}" for i in range(X_train_processed.shape[1])]
        feature_names = cleaned_feature_names

    # 3. Train models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    }
    
    results = {}
    best_f1 = 0
    best_model_name = ""
    best_model = None
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train_processed, y_train)
        
        # Predictions
        y_pred = model.predict(X_test_processed)
        y_prob = model.predict_proba(X_test_processed)[:, 1]
        
        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        from sklearn.metrics import confusion_matrix

        cm = confusion_matrix(y_test, y_pred)

        print("\nConfusion Matrix:")
        print(cm)
        disp = ConfusionMatrixDisplay(confusion_matrix=cm)
        disp.plot()

        plt.savefig(f"{name}_confusion_matrix.png")
        plt.show()
        
        results[name] = {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
            "roc_auc": float(auc)
        }
        
        print(f"  Accuracy: {accuracy:.4f} | Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f} | ROC-AUC: {auc:.4f}")
        
        # Select best model based on F1-score (harmonic mean of precision and recall)
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model = model
            
    print(f"\nBest Model Selected: {best_model_name} with F1-score: {best_f1:.4f}")
    
    # 4. Extract Feature Importances from the best model
    importances = {}
    if hasattr(best_model, "coef_"):
        # For Logistic Regression, absolute coefficients normalized
        coefs = np.abs(best_model.coef_[0])
        norm_coefs = coefs / np.sum(coefs)
        for name, val in zip(cleaned_feature_names, norm_coefs):
            importances[name] = float(val)
    elif hasattr(best_model, "feature_importances_"):
        # For Trees/Forests
        for name, val in zip(cleaned_feature_names, best_model.feature_importances_):
            importances[name] = float(val)
            
    # Sort importances
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    importances_dict = [{"feature": k, "importance": v} for k, v in sorted_importances]
    
    # Save the pipeline wrapper
    predictor_pipeline = ChurnPredictorPipeline(best_model, preprocessor, cleaned_feature_names)
    pipeline_path = os.path.join(project_root, "data", "best_churn_pipeline.joblib")
    save_pipeline(predictor_pipeline, pipeline_path)
    
    # 5. Save metadata
    metadata = {
        "best_model_name": best_model_name,
        "performance_metrics": results,
        "feature_importances": importances_dict,
        "dataset_stats": {
            "total_records": len(df),
            "num_churn": int((df["Churn"] == "Yes").sum()),
            "churn_rate": float((df["Churn"] == "Yes").mean()),
            "num_active": int((df["Churn"] == "No").sum()),
            "average_tenure": float(df["tenure"].mean()),
            "average_monthly_charges": float(df["MonthlyCharges"].mean())
        }
    }
    
    metadata_path = os.path.join(project_root, "data", "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=4)
    print(f"Model metadata saved to {metadata_path}")
    
if __name__ == "__main__":
    train_and_evaluate()
