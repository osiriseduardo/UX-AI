"""K-Means clustering over category affinity features.

K-Means is the only machine learning in UX-AI. It groups customers by their
category affinity and gives each cluster a top-4 category ranking
(priority 1-4). Layout is decided later by deterministic rules, not here.
"""

from itertools import combinations

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score, silhouette_score

N_CLUSTERS = 12
N_INIT = 10
RANDOM_STATE = 42
TOP_N = 4


def fit_kmeans(
    matrix: pd.DataFrame,
    *,
    n_clusters: int = N_CLUSTERS,
    random_state: int = RANDOM_STATE,
    n_init: int = N_INIT,
) -> KMeans:
    """Fit K-Means on the affinity matrix.

    Args:
        matrix: Customer x category affinity matrix from ``build_affinity_matrix``.
        n_clusters: Number of clusters (12 for this dataset).
        random_state: Fixed seed for reproducibility.
        n_init: Number of initializations; must be >= 5.

    Returns:
        The fitted ``KMeans`` estimator.

    Raises:
        ValueError: If ``n_init`` is below 5.
    """
    if n_init < 5:
        raise ValueError(f"n_init must be >= 5, got {n_init}")
    model = KMeans(n_clusters=n_clusters, n_init=n_init, random_state=random_state)
    model.fit(matrix)
    return model


def cluster_labels(
    matrix: pd.DataFrame,
    *,
    n_clusters: int = N_CLUSTERS,
    random_state: int = RANDOM_STATE,
    n_init: int = N_INIT,
) -> pd.Series:
    """Return one cluster label per customer, indexed like ``matrix``."""
    model = fit_kmeans(
        matrix, n_clusters=n_clusters, random_state=random_state, n_init=n_init
    )
    return pd.Series(model.labels_, index=matrix.index, name="cluster")


def rank_categories(
    matrix: pd.DataFrame,
    labels: pd.Series,
    *,
    top_n: int = TOP_N,
) -> dict[int, list[str]]:
    """Rank categories per cluster by mean affinity, highest first.

    Ties break alphabetically so the ranking is deterministic across runs.
    """
    means = matrix.groupby(labels.to_numpy()).mean()
    rankings: dict[int, list[str]] = {}
    for cluster, row in means.iterrows():
        order = sorted(row.index, key=lambda category: (-row[category], category))
        rankings[int(cluster)] = order[:top_n]
    return rankings


def distinct_rankings(rankings: dict[int, list[str]]) -> int:
    """Count how many clusters have a unique top-N ranking."""
    return len({tuple(categories) for categories in rankings.values()})


def silhouette(matrix: pd.DataFrame, labels: pd.Series) -> float:
    """Silhouette coefficient with the CA-01' sampling parameters."""
    return float(silhouette_score(matrix, labels, sample_size=10000, random_state=0))


def ari_stability(
    matrix: pd.DataFrame,
    *,
    seeds: tuple[int, ...] = (0, 1, 2),
    n_clusters: int = N_CLUSTERS,
    n_init: int = N_INIT,
) -> float:
    """Worst pairwise Adjusted Rand Index across seeds (CA-01' stability).

    Returns 1.0 when every seed produces the same partition.
    """
    if len(seeds) < 2:
        raise ValueError("At least two seeds are required")
    partitions = [
        fit_kmeans(matrix, n_clusters=n_clusters, random_state=seed, n_init=n_init).labels_
        for seed in seeds
    ]
    return float(min(adjusted_rand_score(a, b) for a, b in combinations(partitions, 2)))
