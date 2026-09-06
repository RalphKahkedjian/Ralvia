from fastapi import FastAPI
from routes.follow_up import router as follow_up_router
from routes.analytics_explanation import router as analytics_explanation_router
from routes.finance_chat import router as finance_chat_router
from routes.forecast import router as forecast_router
from routes.ml_risk import router as ml_risk_router

app = FastAPI(
    title="Ralvia AI Service",
    version="1.0.0"
)

app.include_router(follow_up_router)
app.include_router(analytics_explanation_router)
app.include_router(finance_chat_router)
app.include_router(forecast_router)
app.include_router(ml_risk_router)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ralvia-ai"
    }