"""Export the trained model's artifacts for the web app.

Writes three JSON files to ``web/public/data/`` — ``profiles.json``,
``rankings.json`` and ``popularity.json`` — and validates each one against
``contracts/artifacts.schema.json`` before writing.

The pipeline runs offline; the web app never trains or reads the CSV.
"""

import json
from pathlib import Path

import pandas as pd
from jsonschema import Draft202012Validator

from uxai.clustering import cluster_labels, rank_categories
from uxai.features import build_affinity_matrix
from uxai.load import DEFAULT_PATH, load_dataset

REPO_ROOT = Path(__file__).resolve().parents[3]
SCHEMA_PATH = REPO_ROOT / "contracts" / "artifacts.schema.json"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "web" / "public" / "data"
PROFILES_PER_CLUSTER = 2


def build_profiles(
    df: pd.DataFrame,
    labels: pd.Series,
    *,
    per_cluster: int = PROFILES_PER_CLUSTER,
) -> dict[str, object]:
    """Pick a deterministic sample of customers, spread across clusters.

    Sorting by cluster then ``customer_id`` makes the selection reproducible
    without a random seed. ``activity_status`` and ``behavior_segment`` come
    from the dataset's fixed-threshold columns, not from the model.
    """
    frame = df.assign(cluster=labels).sort_values(["cluster", "customer_id"])
    sample = frame.groupby("cluster", sort=True).head(per_cluster)
    items = [
        {
            "customer_id": str(row.customer_id),
            "cluster": int(row.cluster),
            "activity_status": row.activity_status,
            "behavior_segment": row.behavior_segment,
        }
        for row in sample.itertuples()
    ]
    return {"kind": "profiles", "items": items}


def build_rankings(rankings: dict[int, list[str]]) -> dict[str, object]:
    """Wrap per-cluster top-4 rankings; array order is priority 1-4."""
    clusters = [
        {"cluster": int(cluster), "categories": list(categories)}
        for cluster, categories in sorted(rankings.items())
    ]
    return {"kind": "rankings", "clusters": clusters}


def build_popularity(matrix: pd.DataFrame) -> dict[str, object]:
    """Global category order by total affinity, highest first.

    Ties break alphabetically so the default view is deterministic.
    """
    totals = matrix.sum(axis=0)
    order = sorted(totals.index, key=lambda category: (-totals[category], category))
    return {"kind": "popularity", "categories": order}


def load_schema() -> dict[str, object]:
    """Read and self-check the contract shared with the web app."""
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    return schema


def validate_artifact(document: dict[str, object], schema: dict[str, object]) -> None:
    """Raise ``ValueError`` if a document does not satisfy the contract."""
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(document), key=lambda error: list(error.path))
    if errors:
        kind = document.get("kind")
        raise ValueError(f"Artifact {kind!r} is invalid: {errors[0].message}")


def export_artifacts(
    output_dir: Path | str = DEFAULT_OUTPUT_DIR,
    *,
    dataset_path: Path | str = DEFAULT_PATH,
) -> list[Path]:
    """Run the full offline pipeline and write the three JSON artifacts.

    Returns:
        Paths of the written files, in profiles, rankings, popularity order.
    """
    df = load_dataset(dataset_path)
    matrix = build_affinity_matrix(df)
    labels = cluster_labels(matrix)
    rankings = rank_categories(matrix, labels)

    documents = [
        build_profiles(df, labels),
        build_rankings(rankings),
        build_popularity(matrix),
    ]
    schema = load_schema()
    for document in documents:
        validate_artifact(document, schema)

    target = Path(output_dir)
    target.mkdir(parents=True, exist_ok=True)
    paths: list[Path] = []
    for document in documents:
        path = target / f"{document['kind']}.json"
        path.write_text(
            json.dumps(document, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        paths.append(path)
    return paths


def main() -> None:
    """CLI entry point: ``uv run --project ml python -m uxai.export``."""
    for path in export_artifacts():
        print(f"wrote {path.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
