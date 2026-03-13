from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import random # Mock for joblib

app = FastAPI(title="Smart Food Rescue ML Service")

class DonationData(BaseModel):
    quantity: int
    donor_history_count: int
    time_to_fill_form_seconds: int
    distance_from_registered_location: float

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "FoodRescue ML Engine"}

@app.post("/api/ml/predict-fraud")
async def predict_fraud(data: DonationData):
    # Mock anomaly detection logic
    # In a real scenario, this would load an IsolationForest model
    is_anomaly = False
    score = random.uniform(0.5, 1.0)
    
    if data.quantity > 500 or data.distance_from_registered_location > 50:
        is_anomaly = True
        score = random.uniform(0.0, 0.4)
        
    return {
        "isAnomaly": is_anomaly,
        "anomalyScore": score
    }

@app.get("/api/ml/predict-surplus")
async def get_surplus_prediction(restaurant_id: str):
    # Mock time series forecasting
    predicted_meals = random.randint(10, 50)
    return {
        "restaurant_id": restaurant_id,
        "predicted_surplus_meals": predicted_meals
    }
