from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="SOBAT AI Prediction Service")
class PredictionRequest(BaseModel):
    time_difference_minutes: int = Field(ge=0, le=1440)

model = None
model_load_error = None

try:
    model_path = Path(__file__).resolve().parent / "logistic_model.pkl"
    model = joblib.load(model_path)
except Exception as error:
    model_load_error = str(error)


@app.post("/predict")
def predict(payload: PredictionRequest) -> dict[str, float | int]:
    if model is None:
        raise HTTPException(
            status_code=500,
            detail=f"Model is not available. Failed to load logistic_model.pkl: {model_load_error}",
        )

    try:
        input_data = pd.DataFrame(
            [{"time_difference_minutes": payload.time_difference_minutes}]
        )

        prediction = int(model.predict(input_data)[0])
        probabilities = model.predict_proba(input_data)[0]

        adherence_class_index = list(model.classes_).index(1)
        adherence_score = float(probabilities[adherence_class_index] * 100)

        return {
            "is_adherent": prediction,
            "adherence_score": round(adherence_score, 2),
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {error}",
        ) from error
