import random
from pathlib import Path

import pandas as pd
from faker import Faker


def main() -> None:
    try:
        fake = Faker()
        rng = random.Random(42)
        row_count = 5000

        records: list[dict[str, int]] = []
        for schedule_id in range(1, row_count + 1):
            minute_gap = rng.randint(0, 300)
            is_adherent = 1 if minute_gap <= 120 else 0

            # Add realistic label noise so the model learns a probabilistic boundary.
            noise = rng.random()
            if is_adherent == 1 and noise < 0.08:
                is_adherent = 0
            elif is_adherent == 0 and noise < 0.05:
                is_adherent = 1

            _ = fake.time_object()

            records.append(
                {
                    "schedule_id": schedule_id,
                    "time_difference_minutes": minute_gap,
                    "is_adherent": is_adherent,
                }
            )

        dataset = pd.DataFrame.from_records(records)
        output_path = Path(__file__).resolve().parent / "dataset.csv"
        dataset.to_csv(output_path, index=False)

        print(f"SUCCESS: Dataset generated at {output_path} with {len(dataset)} rows.")
    except Exception as error:
        print(f"ERROR: Failed to generate dataset. Details: {error}")


if __name__ == "__main__":
    main()
