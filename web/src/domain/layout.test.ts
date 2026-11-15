import { describe, expect, it } from 'vitest';
import { buildLayout, resolveVariant } from './layout';
import type { Profile } from './types';

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    customer_id: 'CUST-000001',
    cluster: 3,
    activity_status: 'Active',
    behavior_segment: 'Frequent Buyer',
    ...overrides,
  };
}

describe('resolveVariant', () => {
  it('returns DEFAULT_POPULAR when the profile is missing', () => {
    expect(resolveVariant(null)).toBe('DEFAULT_POPULAR');
    expect(resolveVariant(undefined)).toBe('DEFAULT_POPULAR');
  });

  it.each(['At Risk', 'Dormant', 'Inactive'] as const)(
    'maps activity_status %s to OFERTAS_PRIMERO',
    (status) => {
      expect(resolveVariant(profile({ activity_status: status }))).toBe(
        'OFERTAS_PRIMERO',
      );
    },
  );

  it.each(['Frequent Buyer', 'Regular Buyer'] as const)(
    'maps behavior_segment %s to RECOMPRA_PRIMERO',
    (segment) => {
      expect(
        resolveVariant(profile({ behavior_segment: segment, activity_status: 'Active' })),
      ).toBe('RECOMPRA_PRIMERO');
    },
  );

  it.each(['New Buyer', 'Occasional Buyer'] as const)(
    'maps behavior_segment %s to EXPLORACION',
    (segment) => {
      expect(
        resolveVariant(profile({ behavior_segment: segment, activity_status: 'Active' })),
      ).toBe('EXPLORACION');
    },
  );

  it('gives activity_status priority over behavior_segment', () => {
    expect(
      resolveVariant(
        profile({ activity_status: 'Dormant', behavior_segment: 'Frequent Buyer' }),
      ),
    ).toBe('OFERTAS_PRIMERO');
  });

  it('returns DEFAULT_POPULAR for an unknown segment value', () => {
    const unknown = {
      ...profile(),
      behavior_segment: 'Unknown' as Profile['behavior_segment'],
    };
    expect(resolveVariant(unknown)).toBe('DEFAULT_POPULAR');
  });
});

describe('buildLayout', () => {
  it('keeps the Hero emphasis and section order per variant', () => {
    expect(buildLayout(profile({ activity_status: 'Dormant' }))).toEqual({
      variant: 'OFERTAS_PRIMERO',
      heroEmphasis: 'discounts',
      sections: ['offers', 'suggestions', 'keepShopping'],
      isPersonalized: true,
    });

    expect(buildLayout(profile({ behavior_segment: 'Regular Buyer' }))).toEqual({
      variant: 'RECOMPRA_PRIMERO',
      heroEmphasis: 'previousPurchases',
      sections: ['keepShopping', 'suggestions', 'offers'],
      isPersonalized: true,
    });

    expect(buildLayout(profile({ behavior_segment: 'New Buyer' }))).toEqual({
      variant: 'EXPLORACION',
      heroEmphasis: 'bestSellers',
      sections: ['suggestions', 'offers', 'keepShopping'],
      isPersonalized: true,
    });
  });

  it('marks the default view as not personalized', () => {
    expect(buildLayout(null)).toMatchObject({
      variant: 'DEFAULT_POPULAR',
      isPersonalized: false,
    });
  });

  it('lets the restored choice override every rule', () => {
    const restored = buildLayout(profile({ activity_status: 'Dormant' }), true);
    expect(restored.variant).toBe('DEFAULT_POPULAR');
    expect(restored.isPersonalized).toBe(false);
  });
});
