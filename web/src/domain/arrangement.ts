import { buildLayout } from './layout';
import type {
  Category,
  Layout,
  PopularityArtifact,
  Profile,
  RankingsArtifact,
  SectionKind,
} from './types';

export type ProductSectionKind = Exclude<SectionKind, 'categories'>;

/** One secondary block of the Home, in the order the variant decides. */
export type HomeSection =
  | { kind: ProductSectionKind; category: Category }
  | { kind: 'categories'; categories: Category[] };

export interface HomeArrangement {
  layout: Layout;
  /** Category priority in effect: the cluster ranking or the global popularity order. */
  ranking: Category[];
  /** Priority #1 always goes to the Hero (CA-03). */
  heroCategory: Category;
  sections: HomeSection[];
}

/**
 * Arranges the Home/Dashboard for a customer from the exported artifacts,
 * following `docs/layout-rules.md`. Pure function: no React, no I/O.
 *
 * - The rule table picks the variant; a profile whose cluster has no ranking
 *   counts as unknown data (rule 1) and gets `DEFAULT_POPULAR`.
 * - Personalized variants put cluster #1 in the Hero and fill the secondary
 *   blocks with #2-#4 in rank order.
 * - `DEFAULT_POPULAR`, including the restored default view, uses only the
 *   global popularity order, never the customer's cluster.
 */
export function arrangeHome(
  profile: Profile | null | undefined,
  rankings: RankingsArtifact,
  popularity: PopularityArtifact,
  restored = false,
): HomeArrangement {
  const clusterRanking = profile
    ? rankings.clusters.find((entry) => entry.cluster === profile.cluster)?.categories
    : undefined;

  const layout = buildLayout(clusterRanking ? profile : null, restored);
  const ranking =
    layout.isPersonalized && clusterRanking ? clusterRanking : popularity.categories;

  const sections = layout.sections.map((kind, index): HomeSection =>
    kind === 'categories'
      ? { kind, categories: popularity.categories }
      : { kind, category: ranking[index + 1] ?? ranking[ranking.length - 1] },
  );

  return { layout, ranking, heroCategory: ranking[0], sections };
}
