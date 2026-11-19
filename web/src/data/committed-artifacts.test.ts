import { describe, expect, it } from 'vitest';
import popularityJson from '../../public/data/popularity.json';
import profilesJson from '../../public/data/profiles.json';
import rankingsJson from '../../public/data/rankings.json';
import { arrangeHome } from '../domain/arrangement';
import { CATEGORIES, CATEGORY_LABELS } from '../domain/categories';
import { resolveVariant } from '../domain/layout';
import type { Artifacts } from '../domain/types';
import { productsByCategory } from '../mocks/products';
import { assignProfiles, personas } from '../personas';

/**
 * Correlation between the model's committed export (`web/public/data/`,
 * written by `uxai.export`) and the web app: every value the pipeline writes
 * must have a place to land in the UI. Re-exporting the model re-runs these
 * checks against the new data.
 */
const artifacts = {
  profiles: profilesJson,
  rankings: rankingsJson,
  popularity: popularityJson,
} as Artifacts;
const { profiles, rankings, popularity } = artifacts;

const sorted = (values: readonly string[]) => [...values].sort();

describe('committed model artifacts', () => {
  it('ranks every exported cluster exactly once', () => {
    const ranked = rankings.clusters.map((entry) => entry.cluster);

    expect(new Set(ranked).size).toBe(ranked.length);
    for (const profile of profiles.items) {
      expect(ranked, `cluster of ${profile.customer_id}`).toContain(profile.cluster);
    }
  });

  it('ranks four distinct known categories per cluster', () => {
    for (const { cluster, categories } of rankings.clusters) {
      expect(categories, `cluster ${cluster}`).toHaveLength(4);
      expect(new Set(categories).size, `cluster ${cluster}`).toBe(4);
      for (const category of categories) {
        expect(CATEGORIES, `cluster ${cluster}`).toContain(category);
      }
    }
  });

  it('orders all twelve categories by global popularity', () => {
    expect(sorted(popularity.categories)).toEqual(sorted(CATEGORIES));
  });

  it('has a label and mock products for every category the model can show', () => {
    for (const category of popularity.categories) {
      expect(CATEGORY_LABELS[category], category).toBeTruthy();
      expect(productsByCategory(category).length, category).toBeGreaterThan(0);
    }
  });

  it('gives every exported profile a personalized Home', () => {
    for (const profile of profiles.items) {
      const { layout } = arrangeHome(profile, rankings, popularity);

      expect(layout.isPersonalized, profile.customer_id).toBe(true);
    }
  });
});

describe('personas on the committed artifacts', () => {
  const assigned = assignProfiles(artifacts);

  it('assigns every persona with history a profile of its expected variant', () => {
    for (const persona of personas) {
      const profile = assigned.get(persona.id) ?? null;

      if (persona.expectedVariant === null) {
        expect(profile, persona.id).toBeNull();
      } else {
        expect(profile, persona.id).not.toBeNull();
        expect(resolveVariant(profile), persona.id).toBe(persona.expectedVariant);
      }
    }
  });

  it("puts each persona's priority #1 in its Hero, a different one per persona", () => {
    const heroes = personas.map((persona) => {
      const profile = assigned.get(persona.id) ?? null;
      const expected = profile
        ? rankings.clusters.find((entry) => entry.cluster === profile.cluster)?.categories[0]
        : popularity.categories[0];
      const { heroCategory } = arrangeHome(profile, rankings, popularity);

      expect(heroCategory, persona.id).toBe(expected);
      return heroCategory;
    });

    expect(new Set(heroes).size).toBe(personas.length);
  });
});
