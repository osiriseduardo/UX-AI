"""Tests for uxai.features.

Synthetic frames pin the weighting rules; the real dataset checks are
skipped when the git-ignored CSV is absent.
"""

import pandas as pd
import pytest

from uxai.features import NOISE_COLUMNS, build_affinity_matrix, category_names
from uxai.load import DEFAULT_PATH, load_dataset


def _frame(rows: list[tuple[str, str, str]]) -> pd.DataFrame:
    return pd.DataFrame(
        rows,
        columns=["preferred_category_1", "preferred_category_2", "preferred_category_3"],
    )


def test_weights_are_three_two_one() -> None:
    matrix = build_affinity_matrix(_frame([("Fashion", "Books", "Toys")]))
    assert matrix.loc[0, "Fashion"] == 3
    assert matrix.loc[0, "Books"] == 2
    assert matrix.loc[0, "Toys"] == 1
    assert matrix.loc[0].sum() == 6


def test_none_adds_nothing() -> None:
    matrix = build_affinity_matrix(_frame([("Fashion", "None", "None")]))
    assert matrix.loc[0, "Fashion"] == 3
    assert matrix.loc[0].sum() == 3
    assert "None" not in matrix.columns


def test_repeated_category_accumulates() -> None:
    matrix = build_affinity_matrix(_frame([("Books", "Books", "Books")]))
    assert matrix.loc[0, "Books"] == 6


def test_one_row_per_customer_and_index_preserved() -> None:
    df = _frame([("Fashion", "None", "None"), ("Books", "Toys", "None")])
    df.index = [10, 20]
    matrix = build_affinity_matrix(df)
    assert list(matrix.index) == [10, 20]
    assert len(matrix) == 2


def test_missing_preference_column_raises() -> None:
    df = pd.DataFrame({"preferred_category_1": ["Fashion"]})
    with pytest.raises(ValueError, match="Missing required columns"):
        build_affinity_matrix(df)


def test_noise_columns_never_become_features() -> None:
    matrix = build_affinity_matrix(_frame([("Fashion", "None", "None")]))
    assert NOISE_COLUMNS.isdisjoint(matrix.columns)


@pytest.mark.skipif(not DEFAULT_PATH.exists(), reason="Dataset not present in this environment")
def test_real_dataset_has_twelve_sorted_categories() -> None:
    df = load_dataset(DEFAULT_PATH)
    categories = category_names(df)
    assert len(categories) == 12
    assert categories == sorted(categories)
    assert "None" not in categories


@pytest.mark.skipif(not DEFAULT_PATH.exists(), reason="Dataset not present in this environment")
def test_real_dataset_matrix_shape() -> None:
    df = load_dataset(DEFAULT_PATH)
    matrix = build_affinity_matrix(df)
    assert matrix.shape == (len(df), 12)
    assert (matrix.sum(axis=1) > 0).all()
