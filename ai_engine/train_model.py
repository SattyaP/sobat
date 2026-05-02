from pathlib import Path

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split


def main() -> None:
    try:
        base_dir = Path(__file__).resolve().parent
        dataset_path = base_dir / "dataset.csv"

        data = pd.read_csv(dataset_path)
        X = data[["time_difference_minutes"]]
        y = data["is_adherent"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        model = LogisticRegression(max_iter=1000, random_state=42)
        model.fit(X_train, y_train)

        predictions = model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        f1 = f1_score(y_test, predictions)

        print(f"SUCCESS: Model trained. Accuracy: {accuracy:.4f}, F1-Score: {f1:.4f}")

        model_path = base_dir / "logistic_model.pkl"
        joblib.dump(model, model_path)
        print(f"SUCCESS: Model saved to {model_path}")
    except Exception as error:
        print(f"ERROR: Failed to train or save model. Details: {error}")


if __name__ == "__main__":
    main()
