"""Dataset loading for the UX-AI K-Means pipeline.

Reads the CSV from ``ml/data/raw/`` with ``keep_default_na=False`` so the
literal string ``"None"`` is preserved as a real value (see
``docs/dataset-findings.md``). Noise columns are left in the DataFrame;
feature building must exclude them.
"""

from pathlib import Path

import pandas as pd

DEFAULT_PATH = Path(__file__).resolve().parents[2] / "data" / "raw" / "E-commerce_Customer_Segmentation_2026.csv"


def load_dataset(path: Path | str = DEFAULT_PATH) -> pd.DataFrame:
    """Load the customer dataset.

    Args:
        path: CSV path. Defaults to ``ml/data/raw/E-commerce_Customer_Segmentation_2026.csv``.

    Returns:
        DataFrame with all dataset columns and ``"None"`` strings preserved.

    Raises:
        FileNotFoundError: If the CSV does not exist.
        ValueError: If required category affinity columns are missing.
    """
    csv_path = Path(path)
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found: {csv_path}")

    df = pd.read_csv(csv_path, keep_default_na=False)

    required = {"preferred_category_1", "preferred_category_2", "preferred_category_3"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    return df
