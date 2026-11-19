"""CA-01' acceptance tests for the K-Means category model.

Thresholds come from ``docs/acceptance-criteria.md`` and must never be
lowered: silhouette >= 0.40, ARI >= 0.90 across three seeds, and a distinct
top-4 ranking per cluster. Real-data tests skip when the CSV is absent.
"""

import pandas as pd
import pytest

from uxai.clustering import (
    N_CLUSTERS,
    ari_stability,
    cluster_labels,
    distinct_rankings,
    fit_kmeans,
    rank_categories,
    silhouette,
)
from uxai.features import build_affinity_matrix
from uxai.load import DEFAULT_PATH, load_dataset

requires_dataset = pytest.mark.skipif(
    not DEFAULT_PATH.exists(), reason="Dataset not present in this environment"
)


@pytest.fixture(scope="module")
def matrix() -> pd.DataFrame:
    df = load_dataset(DEFAULT_PATH)
    return build_affinity_matrix(df)


@requires_dataset
def test_ca01_silhouette_at_least_040(matrix: pd.DataFrame) -> None:
    labels = cluster_labels(matrix)
    assert silhouette(matrix, labels) >= 0.40


@requires_dataset
def test_ca01_ari_stability_at_least_090(matrix: pd.DataFrame) -> None:
    assert ari_stability(matrix, seeds=(0, 1, 2)) >= 0.90


@requires_dataset
def test_ca01_twelve_distinct_top4_rankings(matrix: pd.DataFrame) -> None:
    labels = cluster_labels(matrix)
    rankings = rank_categories(matrix, labels)
    assert len(rankings) == N_CLUSTERS
    assert all(len(categories) == 4 for categories in rankings.values())
    assert distinct_rankings(rankings) == N_CLUSTERS


@requires_dataset
def test_labels_match_rows_and_cluster_count(matrix: pd.DataFrame) -> None:
    labels = cluster_labels(matrix)
    assert len(labels) == len(matrix)
    assert labels.index.equals(matrix.index)
    assert labels.nunique() == N_CLUSTERS


def test_n_init_below_five_is_rejected() -> None:
    matrix = pd.DataFrame([[3.0, 0.0], [0.0, 3.0]])
    with pytest.raises(ValueError, match="n_init"):
        fit_kmeans(matrix, n_clusters=2, n_init=4)


def test_rank_categories_is_deterministic_with_ties() -> None:
    matrix = pd.DataFrame(
        [[3.0, 3.0, 0.0], [3.0, 3.0, 0.0], [0.0, 0.0, 3.0]],
        columns=["Books", "Fashion", "Toys"],
    )
    labels = pd.Series([0, 0, 1])
    rankings = rank_categories(matrix, labels, top_n=2)
    assert rankings[0] == ["Books", "Fashion"]
    assert rankings[1] == ["Toys", "Books"]
