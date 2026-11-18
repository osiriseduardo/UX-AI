import { describe, expect, it } from 'vitest';
import { findPersona, personas, profileFor } from './personas';
import type { Persona } from './personas';
import type { Artifacts, Category, Profile } from './domain/types';

const POPULARITY: Category[] = [
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

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    customer_id: 'CUST-000001',
    cluster: 3,
    activity_status: 'Active',
    behavior_segment: 'Frequent Buyer',
    ...overrides,
  };
}

function persona(id: string): Persona {
  return findPersona(id);
}

/** Artifacts around `profiles`; each entry of `heroes` is a cluster's #1 category. */
function artifacts(profiles: Profile[], heroes: Record<number, Category> = {}): Artifacts {
  return {
    profiles: { kind: 'profiles', items: profiles },
    rankings: {
      kind: 'rankings',
      clusters: Object.entries(heroes).map(([cluster, hero]) => ({
        cluster: Number(cluster),
        categories: [hero, ...POPULARITY.filter((category) => category !== hero).slice(0, 3)],
      })),
    },
    popularity: { kind: 'popularity', categories: POPULARITY },
  };
}

describe('personas', () => {
  it('declares the expected variant instead of a fixed customer id', () => {
    expect(personas.map((item) => [item.id, item.expectedVariant])).toEqual([
      ['carlos', 'OFERTAS_PRIMERO'],
      ['ana', null],
      ['luis', 'RECOMPRA_PRIMERO'],
      ['sofia', 'EXPLORACION'],
    ]);
    expect(personas.some((item) => 'customerId' in item)).toBe(false);
  });

  it('gives Luis a tagline that does not name a category', () => {
    expect(persona('luis').tagline).toBe('Comprador frecuente');
  });
});

describe('profileFor', () => {
  it('matches the first OFERTAS_PRIMERO profile', () => {
    const profiles = [
      profile({ customer_id: 'CUST-1', behavior_segment: 'Frequent Buyer' }),
      profile({ customer_id: 'CUST-2', activity_status: 'Dormant' }),
      profile({ customer_id: 'CUST-3', activity_status: 'Inactive' }),
    ];

    expect(profileFor(persona('carlos'), artifacts(profiles))?.customer_id).toBe('CUST-2');
  });

  it('matches the first RECOMPRA_PRIMERO profile', () => {
    const profiles = [
      profile({ customer_id: 'CUST-1', activity_status: 'At Risk' }),
      profile({ customer_id: 'CUST-2', behavior_segment: 'Regular Buyer' }),
      profile({ customer_id: 'CUST-3', behavior_segment: 'Frequent Buyer' }),
    ];

    expect(profileFor(persona('luis'), artifacts(profiles))?.customer_id).toBe('CUST-2');
  });

  it('matches the first EXPLORACION profile', () => {
    const profiles = [
      profile({ customer_id: 'CUST-1', behavior_segment: 'Frequent Buyer' }),
      profile({ customer_id: 'CUST-2', behavior_segment: 'Occasional Buyer' }),
      profile({ customer_id: 'CUST-3', behavior_segment: 'New Buyer' }),
    ];

    expect(profileFor(persona('sofia'), artifacts(profiles))?.customer_id).toBe('CUST-2');
  });

  it('returns null for Ana because she is an intentional guest', () => {
    const profiles = [profile({ customer_id: 'CUST-1' })];

    expect(persona('ana').expectedVariant).toBeNull();
    expect(profileFor(persona('ana'), artifacts(profiles))).toBeNull();
  });

  it('returns null when no profile matches the expected variant', () => {
    const profiles = [
      profile({ customer_id: 'CUST-1', behavior_segment: 'Frequent Buyer' }),
      profile({ customer_id: 'CUST-2', behavior_segment: 'Regular Buyer' }),
    ];

    expect(profileFor(persona('carlos'), artifacts(profiles))).toBeNull();
    expect(profileFor(persona('sofia'), artifacts([]))).toBeNull();
  });

  it('gives each persona a Hero category no other persona shows', () => {
    const profiles = [
      profile({ customer_id: 'CUST-A', cluster: 0, activity_status: 'Inactive', behavior_segment: 'Occasional Buyer' }),
      profile({ customer_id: 'CUST-B', cluster: 0, behavior_segment: 'Frequent Buyer' }),
      profile({ customer_id: 'CUST-C', cluster: 2, behavior_segment: 'Regular Buyer' }),
      profile({ customer_id: 'CUST-D', cluster: 3, behavior_segment: 'Regular Buyer' }),
      profile({ customer_id: 'CUST-E', cluster: 1, behavior_segment: 'Occasional Buyer' }),
    ];
    // Cluster 2's #1 is Grocery, the guest's default Hero (popularity #1).
    const data = artifacts(profiles, {
      0: 'Books',
      1: 'Home & Kitchen',
      2: 'Grocery',
      3: 'Sports & Fitness',
    });

    expect(profileFor(persona('carlos'), data)?.customer_id).toBe('CUST-A');
    expect(profileFor(persona('luis'), data)?.customer_id).toBe('CUST-D');
    expect(profileFor(persona('sofia'), data)?.customer_id).toBe('CUST-E');
  });

  it('falls back to the first match when every Hero of the variant is taken', () => {
    const profiles = [
      profile({ customer_id: 'CUST-A', cluster: 0, activity_status: 'Dormant' }),
      profile({ customer_id: 'CUST-B', cluster: 0, behavior_segment: 'Regular Buyer' }),
    ];
    const data = artifacts(profiles, { 0: 'Books' });

    expect(profileFor(persona('carlos'), data)?.customer_id).toBe('CUST-A');
    expect(profileFor(persona('luis'), data)?.customer_id).toBe('CUST-B');
  });
});
