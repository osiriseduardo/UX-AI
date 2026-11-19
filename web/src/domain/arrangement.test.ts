import { describe, expect, it } from 'vitest';
import { arrangeHome } from './arrangement';
import type { Category, PopularityArtifact, Profile, RankingsArtifact } from './types';

const POPULAR: Category[] = [
  'Grocery',
  'Home & Kitchen',
  'Sports & Fitness',
  'Fashion',
  'Office Supplies',
  'Automotive',
  'Books',
  'Electronics',
  'Pet Supplies',
  'Health & Personal Care',
  'Toys',
  'Beauty',
];

const CLUSTER_2: Category[] = ['Books', 'Grocery', 'Office Supplies', 'Health & Personal Care'];

const rankings: RankingsArtifact = {
  kind: 'rankings',
  clusters: [{ cluster: 2, categories: CLUSTER_2 }],
};

const popularity: PopularityArtifact = { kind: 'popularity', categories: POPULAR };

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    customer_id: 'CUST-000001',
    cluster: 2,
    activity_status: 'Active',
    behavior_segment: 'Frequent Buyer',
    ...overrides,
  };
}

describe('arrangeHome', () => {
  it('puts cluster #1 in the Hero and #2-#4 in OFERTAS_PRIMERO order', () => {
    const home = arrangeHome(profile({ activity_status: 'Dormant' }), rankings, popularity);

    expect(home.layout.variant).toBe('OFERTAS_PRIMERO');
    expect(home.heroCategory).toBe('Books');
    expect(home.sections).toEqual([
      { kind: 'offers', category: 'Grocery' },
      { kind: 'suggestions', category: 'Office Supplies' },
      { kind: 'keepShopping', category: 'Health & Personal Care' },
    ]);
  });

  it('fills RECOMPRA_PRIMERO blocks in rank order', () => {
    const home = arrangeHome(profile({ behavior_segment: 'Regular Buyer' }), rankings, popularity);

    expect(home.layout.variant).toBe('RECOMPRA_PRIMERO');
    expect(home.heroCategory).toBe('Books');
    expect(home.sections).toEqual([
      { kind: 'keepShopping', category: 'Grocery' },
      { kind: 'suggestions', category: 'Office Supplies' },
      { kind: 'offers', category: 'Health & Personal Care' },
    ]);
  });

  it('fills EXPLORACION blocks in rank order', () => {
    const home = arrangeHome(profile({ behavior_segment: 'New Buyer' }), rankings, popularity);

    expect(home.layout.variant).toBe('EXPLORACION');
    expect(home.sections).toEqual([
      { kind: 'suggestions', category: 'Grocery' },
      { kind: 'offers', category: 'Office Supplies' },
      { kind: 'keepShopping', category: 'Health & Personal Care' },
    ]);
  });

  it('shows categories by global popularity when there is no profile', () => {
    const home = arrangeHome(null, rankings, popularity);

    expect(home.layout.variant).toBe('DEFAULT_POPULAR');
    expect(home.layout.isPersonalized).toBe(false);
    expect(home.heroCategory).toBe('Grocery');
    expect(home.ranking).toEqual(POPULAR);
    expect(home.sections).toEqual([{ kind: 'categories', categories: POPULAR }]);
  });

  it('drops every trace of the cluster ranking when the default view is restored', () => {
    const home = arrangeHome(profile({ activity_status: 'Dormant' }), rankings, popularity, true);

    expect(home.layout.variant).toBe('DEFAULT_POPULAR');
    expect(home.heroCategory).toBe('Grocery');
    expect(home.ranking).toEqual(POPULAR);
    expect(home.sections).toEqual([{ kind: 'categories', categories: POPULAR }]);
  });

  it('falls back to DEFAULT_POPULAR when the profile cluster has no ranking', () => {
    const home = arrangeHome(profile({ cluster: 9 }), rankings, popularity);

    expect(home.layout.variant).toBe('DEFAULT_POPULAR');
    expect(home.heroCategory).toBe('Grocery');
    expect(home.sections).toEqual([{ kind: 'categories', categories: POPULAR }]);
  });
});
