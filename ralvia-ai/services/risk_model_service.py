from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    confusion_matrix,
)
from sklearn.preprocessing import StandardScaler

import os
import joblib

from sklearn.ensemble import RandomForestClassifier


MODEL_DIR = "models"

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "invoice_risk_model.joblib",
)

SCALER_PATH = os.path.join(
    MODEL_DIR,
    "invoice_risk_scaler.joblib",
)


FEATURE_COLUMNS = [
    "amount",
    "payment_terms_days",
    "issue_month",
    "previous_invoice_count",
    "previous_late_rate",
    "previous_avg_days_late",
    "amount_vs_customer_average",
]


def train_risk_model(dataset):
    # ---------------------------------------------
    # 1. Features and target
    # ---------------------------------------------

    X = dataset[FEATURE_COLUMNS]
    y = dataset["late"]

    # ---------------------------------------------
    # 2. Chronological 80/20 split
    # ---------------------------------------------

    split_index = int(
        len(dataset) * 0.80
    )

    X_train = X.iloc[
        :split_index
    ]

    X_test = X.iloc[
        split_index:
    ]

    y_train = y.iloc[
        :split_index
    ]

    y_test = y.iloc[
        split_index:
    ]

    # ---------------------------------------------
    # 3. Random Forest
    #
    # IMPORTANT:
    # No StandardScaler for Random Forest.
    # ---------------------------------------------

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
    )

    # ---------------------------------------------
    # 4. Train on RAW features
    # ---------------------------------------------

    model.fit(
        X_train,
        y_train
    )

    # ---------------------------------------------
    # 5. Predict using RAW features
    # ---------------------------------------------

    predictions = model.predict(
        X_test
    )

    # ---------------------------------------------
    # 6. Evaluate
    # ---------------------------------------------

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0,
    )

    matrix = confusion_matrix(
        y_test,
        predictions
    )

    # ---------------------------------------------
    # 7. Save ONLY after successful evaluation
    # ---------------------------------------------

    save_risk_model(
        model
    )

    return {
        "model": model,

        "training_rows":
            len(X_train),

        "testing_rows":
            len(X_test),

        "accuracy":
            float(accuracy),

        "precision":
            float(precision),

        "recall":
            float(recall),

        "confusion_matrix":
            matrix.tolist(),
    }


def predict_late_probability(
    model,
    scaler,
    features,
):
    """
    Predict the probability that one invoice
    will be paid late.
    """

    scaled_features = scaler.transform(
        [features]
    )

    probabilities = model.predict_proba(
        scaled_features
    )

    # Class 1 = late
    late_probability = probabilities[0][1]

    return float(
        late_probability
    )


def risk_label(
    probability: float
) -> str:
    """
    Convert probability into a simple
    Ralvia risk level.
    """

    if probability >= 0.70:
        return "high"

    if probability >= 0.40:
        return "medium"

    return "low"


def save_risk_model(model):
    os.makedirs(
        MODEL_DIR,
        exist_ok=True,
    )

    joblib.dump(
        model,
        MODEL_PATH,
    )


def load_risk_model():
    return joblib.load(
        MODEL_PATH
    )


def predict_risk(
    features: list[float]
):
    model = load_risk_model()

    probabilities = model.predict_proba(
        [features]
    )

    late_probability = float(
        probabilities[0][1]
    )

    risk = risk_label(
        late_probability
    )

    return {
        "late_probability":
            late_probability,
        "risk":
            risk,
    }

def compare_risk_models(dataset):
    X = dataset[FEATURE_COLUMNS]
    y = dataset["late"]

    split_index = int(
        len(dataset) * 0.80
    )

    X_train = X.iloc[:split_index]
    X_test = X.iloc[split_index:]

    y_train = y.iloc[:split_index]
    y_test = y.iloc[split_index:]

    # ---------------------------------------------
    # Logistic Regression
    # ---------------------------------------------

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(
        X_train
    )

    X_test_scaled = scaler.transform(
        X_test
    )

    logistic_model = LogisticRegression(
        max_iter=1000
    )

    logistic_model.fit(
        X_train_scaled,
        y_train
    )

    logistic_predictions = (
        logistic_model.predict(
            X_test_scaled
        )
    )

    # ---------------------------------------------
    # Random Forest
    # ---------------------------------------------

    random_forest_model = (
        RandomForestClassifier(
            n_estimators=200,
            random_state=42,
        )
    )

    random_forest_model.fit(
        X_train,
        y_train
    )

    random_forest_predictions = (
        random_forest_model.predict(
            X_test
        )
    )

    # ---------------------------------------------
    # Evaluate Logistic Regression
    # ---------------------------------------------

    logistic_results = {
        "accuracy": float(
            accuracy_score(
                y_test,
                logistic_predictions,
            )
        ),

        "precision": float(
            precision_score(
                y_test,
                logistic_predictions,
                zero_division=0,
            )
        ),

        "recall": float(
            recall_score(
                y_test,
                logistic_predictions,
                zero_division=0,
            )
        ),

        "confusion_matrix":
            confusion_matrix(
                y_test,
                logistic_predictions,
            ).tolist(),
    }

    # ---------------------------------------------
    # Evaluate Random Forest
    # ---------------------------------------------

    random_forest_results = {
        "accuracy": float(
            accuracy_score(
                y_test,
                random_forest_predictions,
            )
        ),

        "precision": float(
            precision_score(
                y_test,
                random_forest_predictions,
                zero_division=0,
            )
        ),

        "recall": float(
            recall_score(
                y_test,
                random_forest_predictions,
                zero_division=0,
            )
        ),

        "confusion_matrix":
            confusion_matrix(
                y_test,
                random_forest_predictions,
            ).tolist(),
    }

    return {
        "training_rows": len(X_train),
        "testing_rows": len(X_test),

        "logistic_regression":
            logistic_results,

        "random_forest":
            random_forest_results,
    }

def predict_risk_batch(
    invoices: list[dict]
):
    model = load_risk_model()

    if not invoices:
        return []

    feature_rows = []

    for invoice in invoices:
        feature_rows.append(
            [
                invoice["amount"],
                invoice["payment_terms_days"],
                invoice["issue_month"],
                invoice["previous_invoice_count"],
                invoice["previous_late_rate"],
                invoice["previous_avg_days_late"],
                invoice["amount_vs_customer_average"],
            ]
        )

    probabilities = model.predict_proba(
        feature_rows
    )

    results = []

    for index, invoice in enumerate(invoices):
        late_probability = float(
            probabilities[index][1]
        )

        results.append(
            {
                "invoice_id":
                    invoice["invoice_id"],

                "late_probability":
                    late_probability,

                "risk":
                    risk_label(
                        late_probability
                    ),
            }
        )

    return results