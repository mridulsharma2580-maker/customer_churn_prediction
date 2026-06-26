import os
import numpy as np
import pandas as pd

def generate_synthetic_data(num_records=5500, random_state=42):
    """
    Generates a synthetic Telco Customer Churn dataset with realistic distributions and correlations.
    """
    np.random.seed(random_state)
    
    # 1. Basic demographics
    gender = np.random.choice(["Male", "Female"], size=num_records, p=[0.5, 0.5])
    senior_citizen = np.random.choice([0, 1], size=num_records, p=[0.84, 0.16])
    partner = np.random.choice(["Yes", "No"], size=num_records, p=[0.48, 0.52])
    dependents = np.random.choice(["Yes", "No"], size=num_records, p=[0.3, 0.7])
    
    # 2. Tenure (1 to 72 months)
    # Give it a slightly bimodal distribution: many new customers (tenure 1-12) and many loyal ones (tenure 60-72)
    tenure_group1 = np.random.randint(1, 13, size=int(num_records * 0.35))
    tenure_group2 = np.random.randint(13, 60, size=int(num_records * 0.35))
    tenure_group3 = np.random.randint(60, 73, size=num_records - len(tenure_group1) - len(tenure_group2))
    tenure = np.concatenate([tenure_group1, tenure_group2, tenure_group3])
    np.random.shuffle(tenure)
    
    # 3. Services
    phone_service = np.random.choice(["Yes", "No"], size=num_records, p=[0.9, 0.1])
    
    # Internet service
    internet_service = np.random.choice(["DSL", "Fiber optic", "No"], size=num_records, p=[0.35, 0.45, 0.20])
    
    # Contract type - highly correlated with tenure
    contract = []
    for t in tenure:
        if t < 12:
            contract.append(np.random.choice(["Month-to-month", "One year", "Two year"], p=[0.85, 0.12, 0.03]))
        elif t < 36:
            contract.append(np.random.choice(["Month-to-month", "One year", "Two year"], p=[0.3, 0.5, 0.2]))
        else:
            contract.append(np.random.choice(["Month-to-month", "One year", "Two year"], p=[0.05, 0.25, 0.7]))
    contract = np.array(contract)
    
    # Payment Method
    payment_method = np.random.choice(
        ["Electronic check", "Mailed check", "Bank transfer", "Credit card"],
        size=num_records,
        p=[0.34, 0.23, 0.21, 0.22]
    )
    
    # 4. Charges
    # Monthly charges depend on PhoneService and InternetService
    monthly_charges = []
    for ps, is_serv in zip(phone_service, internet_service):
        base = 18.0
        if ps == "Yes":
            base += 10.0
        if is_serv == "DSL":
            base += 30.0 + np.random.uniform(5, 20)
        elif is_serv == "Fiber optic":
            base += 60.0 + np.random.uniform(10, 30)
        else:
            # No internet
            base += np.random.uniform(0, 5)
        monthly_charges.append(round(base, 2))
    monthly_charges = np.array(monthly_charges)
    
    # Total charges (approximately tenure * MonthlyCharges with slight variance)
    total_charges = []
    for t, mc in zip(tenure, monthly_charges):
        tc = t * mc * np.random.uniform(0.97, 1.03)
        total_charges.append(round(tc, 2))
    total_charges = np.array(total_charges)
    
    # 5. Churn Probability Logic (Realistic correlations)
    # Start with base log-odds corresponding to ~15% churn
    log_odds = -1.6
    
    # Contracts (Month-to-month is highly risky, Two-year is very stable)
    contract_contrib = np.where(contract == "Month-to-month", 1.8, np.where(contract == "Two year", -1.8, -0.4))
    log_odds += contract_contrib
    
    # Tenure (longer tenure, less churn)
    # Normalize tenure contribution
    tenure_contrib = -0.05 * tenure
    log_odds += tenure_contrib
    
    # Internet Service (Fiber optic customers are higher churn, No internet is lower)
    internet_contrib = np.where(internet_service == "Fiber optic", 0.7, np.where(internet_service == "No", -0.8, 0.0))
    log_odds += internet_contrib
    
    # Payment Method (Electronic check is highest churn)
    payment_contrib = np.where(payment_method == "Electronic check", 0.6, np.where(payment_method == "Credit card", -0.4, -0.1))
    log_odds += payment_contrib
    
    # Monthly Charges (higher monthly charges, more churn pressure)
    charge_contrib = 0.015 * (monthly_charges - 60.0)
    log_odds += charge_contrib
    
    # Demographics
    senior_contrib = np.where(senior_citizen == 1, 0.3, 0.0)
    partner_contrib = np.where(partner == "No", 0.15, -0.15)
    dependents_contrib = np.where(dependents == "No", 0.2, -0.2)
    
    log_odds += senior_contrib + partner_contrib + dependents_contrib
    
    # Compute probability
    churn_prob = 1.0 / (1.0 + np.exp(-log_odds))
    
    # Sample Churn decision
    churn_rand = np.random.uniform(0, 1, size=num_records)
    churn = np.where(churn_rand < churn_prob, "Yes", "No")
    
    # Create DataFrame
    # Generate a unique CustomerID
    customer_ids = [f"{i:04d}-CHURN" for i in range(1, num_records + 1)]
    
    df = pd.DataFrame({
        "customerID": customer_ids,
        "gender": gender,
        "SeniorCitizen": senior_citizen,
        "Partner": partner,
        "Dependents": dependents,
        "tenure": tenure,
        "PhoneService": phone_service,
        "InternetService": internet_service,
        "Contract": contract,
        "PaymentMethod": payment_method,
        "MonthlyCharges": monthly_charges,
        "TotalCharges": total_charges,
        "Churn": churn
    })
    
    return df

def save_dataset(filepath):
    """
    Generates and saves the synthetic dataset to CSV.
    """
    directory = os.path.dirname(filepath)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)
        
    df = generate_synthetic_data()
    df.to_csv(filepath, index=False)
    print(f"Dataset generated and saved with {len(df)} records at {filepath}")
    print(f"Overall Churn rate: {(df['Churn'] == 'Yes').mean() * 100:.2f}%")
    return df

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "data"))
    save_dataset(os.path.join(data_dir, "customer_churn.csv"))
