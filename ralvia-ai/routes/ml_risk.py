from fastapi import APIRouter, HTTPException

from schemas.ml_risk import RiskTrainingRequest
from services.ml_dataset_service import build_invoice_risk_dataset
from services.risk_model_service import train_risk_model
from schemas.ml_risk import (
    RiskTrainingRequest,
    RiskPredictionRequest,
)

from schemas.ml_risk import (
    RiskTrainingRequest,
    RiskPredictionRequest,
    BatchRiskPredictionRequest,
)

from services.risk_model_service import (
    train_risk_model,
    predict_risk,
    compare_risk_models,
    predict_risk_batch,
)

from services.risk_model_service import (
    train_risk_model,
    predict_risk,
)

from services.risk_model_service import (
    train_risk_model,
    predict_risk,
    compare_risk_models,
)

from schemas.ml_risk import (
    RiskTrainingRequest,
    RiskPredictionRequest,
    BatchRiskPredictionRequest,
    RiskExplanationRequest,
)

from services.risk_explanation_service import (
    explain_invoice_risk,
)

router = APIRouter(
    prefix="/ml/risk",
    tags=["ML Risk"],
)


@router.post("/train")
def train_invoice_risk_model(
    request: RiskTrainingRequest,
):
    invoices = [
        invoice.model_dump()
        for invoice in request.invoices
    ]

    dataset = build_invoice_risk_dataset(
        invoices
    )

    if len(dataset) < 20:
        raise HTTPException(
            status_code=400,
            detail="At least 20 historical invoices are required for training."
        )

    if dataset["late"].nunique() < 2:
        raise HTTPException(
            status_code=400,
            detail="Training data must contain both late and on-time invoices."
        )

    result = train_risk_model(
        dataset
    )

    return {
        "rows": len(dataset),
        "training_rows": result["training_rows"],
        "testing_rows": result["testing_rows"],
        "accuracy": result["accuracy"],
        "precision": result["precision"],
        "recall": result["recall"],
        "confusion_matrix": result["confusion_matrix"],
    }

@router.post("/predict")
def predict_invoice_risk(
    request: RiskPredictionRequest,
):
    features = [
        request.amount,
        request.payment_terms_days,
        request.issue_month,
        request.previous_invoice_count,
        request.previous_late_rate,
        request.previous_avg_days_late,
        request.amount_vs_customer_average,
    ]

    return predict_risk(
        features
    )

@router.post("/compare")
def compare_invoice_risk_models(
    request: RiskTrainingRequest,
):
    invoices = [
        invoice.model_dump()
        for invoice in request.invoices
    ]

    dataset = build_invoice_risk_dataset(
        invoices
    )

    return compare_risk_models(
        dataset
    )

@router.post("/predict/batch")
def predict_invoice_risk_batch(
    request: BatchRiskPredictionRequest,
):
    invoices = [
        invoice.model_dump()
        for invoice in request.invoices
    ]

    predictions = predict_risk_batch(
        invoices
    )

    return {
        "count": len(predictions),
        "predictions": predictions,
    }

@router.post("/explain")
def explain_risk(
    request: RiskExplanationRequest,
):
    data = request.model_dump()

    explanation = explain_invoice_risk(
        data
    )

    return explanation