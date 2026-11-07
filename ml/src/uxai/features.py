"""Category affinity features for the K-Means model.

One column per category, built only from ``preferred_category_1/2/3`` with
weights 3/2/1. The literal ``"None"`` means "no preference" and is excluded.

No behavior, demographic or derived column is used: per
``docs/dataset-findings.md`` they carry no category signal (Cramér's V
0.010-0.015). The noise columns (``conversion_rate``, ``click_through_rate``,
``email_open_rate``, ``satisfaction_score``) must never become features.
"""

import pandas as pd

PREFERRED_COLUMNS: tuple[str, str, str] = (
    "preferred_category_1",
    "preferred_category_2",
    "preferred_category_3",
)
WEIGHTS: tuple[int, int, int] = (3, 2, 1)
NONE_VALUE = "None"

NOISE_COLUMNS = frozenset(
    {"conversion_rate", "click_through_rate", "email_open_rate", "satisfaction_score"}
)


def category_names(df: pd.DataFrame) -> list[str]:
    """Return every category that appears in any preference column, sorted.

    Sorted order keeps the feature matrix columns deterministic across runs.
    """
    _validate_columns(df)
    names: set[str] = set()
    for column in PREFERRED_COLUMNS:
        names.update(df[column].unique())
    names.discard(NONE_VALUE)
    return sorted(names)


def build_affinity_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Build the customer x category affinity matrix.

    Each customer gets one row. For every preference position the matching
    category column receives its weight (3/2/1); a repeated category
    accumulates both weights. ``"None"`` adds nothing, so a customer with
    only one preference still has a row (all other categories at 0).

    Args:
        df: DataFrame with the three ``preferred_category_*`` columns.

    Returns:
        Float DataFrame indexed like ``df`` with one column per category.

    Raises:
        ValueError: If a preference column is missing.
    """
    _validate_columns(df)
    categories = category_names(df)
    matrix = pd.DataFrame(0.0, index=df.index, columns=categories)

    for column, weight in zip(PREFERRED_COLUMNS, WEIGHTS, strict=True):
        values = df[column]
        for category in categories:
            matrix[category] += weight * (values == category)

    return matrix


def _validate_columns(df: pd.DataFrame) -> None:
    missing = [column for column in PREFERRED_COLUMNS if column not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
