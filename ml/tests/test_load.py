"""Tests for uxai.load.

Dataset is git-ignored and may be absent in CI, so real-data tests skip
when the CSV is not present. Logic errors (missing file, missing columns)
are tested with temporary files.
"""

import pandas as pd
import pytest

from uxai.load import DEFAULT_PATH, load_dataset


@pytest.mark.skipif(not DEFAULT_PATH.exists(), reason="Dataset not present in this environment")
def test_load_dataset_returns_dataframe_with_required_columns() -> None:
    df = load_dataset(DEFAULT_PATH)
    assert isinstance(df, pd.DataFrame)
    assert not df.empty
    assert {"preferred_category_1", "preferred_category_2", "preferred_category_3"} <= set(df.columns)


@pytest.mark.skipif(not DEFAULT_PATH.exists(), reason="Dataset not present in this environment")
def test_load_dataset_preserves_none_string() -> None:
    df = load_dataset(DEFAULT_PATH)
    # pandas would parse "None" as NaN by default; keep_default_na=False must keep it.
    assert (df["preferred_category_2"] == "None").any()
    assert df["preferred_category_1"].ne("None").all()


def test_load_dataset_raises_when_missing(tmp_path, monkeypatch) -> None:
    missing = tmp_path / "missing.csv"
    with pytest.raises(FileNotFoundError):
        load_dataset(missing)


def test_load_dataset_raises_when_columns_missing(tmp_path) -> None:
    csv_path = tmp_path / "bad.csv"
    pd.DataFrame({"other": [1]}).to_csv(csv_path, index=False)
    with pytest.raises(ValueError, match="Missing required columns"):
        load_dataset(csv_path)
