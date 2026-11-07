"""Tests for uxai.export.

Structural tests use synthetic frames; the end-to-end export test runs the
real pipeline into ``tmp_path`` and is skipped when the CSV is absent.
"""

import json

import pandas as pd
import pytest

from uxai.export import (
    build_popularity,
    build_profiles,
    build_rankings,
    export_artifacts,
    load_schema,
    validate_artifact,
)
from uxai.load import DEFAULT_PATH

requires_dataset = pytest.mark.skipif(
    not DEFAULT_PATH.exists(), reason="Dataset not present in this environment"
)


def _customers() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "customer_id": ["CUST-3", "CUST-1", "CUST-4", "CUST-2"],
            "activity_status": ["Active", "At Risk", "Dormant", "Inactive"],
            "behavior_segment": [
                "Frequent Buyer",
                "Regular Buyer",
                "New Buyer",
                "Occasional Buyer",
            ],
        }
    )


def test_build_profiles_is_deterministic_and_spread() -> None:
    labels = pd.Series([1, 0, 0, 1])
    profiles = build_profiles(_customers(), labels, per_cluster=1)
    assert profiles["kind"] == "profiles"
    assert [item["customer_id"] for item in profiles["items"]] == ["CUST-1", "CUST-2"]
    assert [item["cluster"] for item in profiles["items"]] == [0, 1]
    assert set(profiles["items"][0]) == {
        "customer_id",
        "cluster",
        "activity_status",
        "behavior_segment",
    }


def test_build_rankings_sorted_by_cluster() -> None:
    rankings = build_rankings({1: ["Books", "Toys", "Grocery", "Beauty"], 0: ["A", "B", "C", "D"]})
    assert [entry["cluster"] for entry in rankings["clusters"]] == [0, 1]
    assert rankings["clusters"][1]["categories"] == ["Books", "Toys", "Grocery", "Beauty"]


def test_build_popularity_orders_by_total_then_name() -> None:
    matrix = pd.DataFrame(
        [[3.0, 1.0, 2.0], [3.0, 0.0, 0.0]],
        columns=["Books", "Fashion", "Toys"],
    )
    popularity = build_popularity(matrix)
    assert popularity["categories"] == ["Books", "Toys", "Fashion"]


def test_validate_artifact_rejects_wrong_document() -> None:
    schema = load_schema()
    with pytest.raises(ValueError, match="profiles"):
        validate_artifact({"kind": "profiles", "items": []}, schema)


def test_validate_artifact_accepts_valid_document() -> None:
    schema = load_schema()
    document = {
        "kind": "popularity",
        "categories": [
            "Automotive",
            "Beauty",
            "Books",
            "Electronics",
            "Fashion",
            "Grocery",
            "Health & Personal Care",
            "Home & Kitchen",
            "Office Supplies",
            "Pet Supplies",
            "Sports & Fitness",
            "Toys",
        ],
    }
    validate_artifact(document, schema)


@requires_dataset
def test_export_writes_three_valid_artifacts(tmp_path) -> None:
    paths = export_artifacts(tmp_path)
    assert [path.name for path in paths] == [
        "profiles.json",
        "rankings.json",
        "popularity.json",
    ]

    schema = load_schema()
    documents = {
        path.stem: json.loads(path.read_text(encoding="utf-8")) for path in paths
    }
    for document in documents.values():
        validate_artifact(document, schema)

    profiles = documents["profiles"]["items"]
    assert 20 <= len(profiles) <= 50
    assert len({profile["cluster"] for profile in profiles}) == 12
    assert len({profile["customer_id"] for profile in profiles}) == len(profiles)

    clusters = documents["rankings"]["clusters"]
    assert len(clusters) == 12
    assert all(len(entry["categories"]) == 4 for entry in clusters)
    assert len({tuple(entry["categories"]) for entry in clusters}) == 12

    categories = documents["popularity"]["categories"]
    assert len(categories) == 12
    assert len(set(categories)) == 12
