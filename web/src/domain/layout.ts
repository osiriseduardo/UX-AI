import type {
  ActivityStatus,
  BehaviorSegment,
  Layout,
  LayoutVariant,
  Profile,
  SectionKind,
} from './types';

const ACTIVITY_STATUSES: readonly ActivityStatus[] = ['Active', 'At Risk', 'Dormant', 'Inactive'];

const BEHAVIOR_SEGMENTS: readonly BehaviorSegment[] = [
  'Frequent Buyer',
  'New Buyer',
  'Occasional Buyer',
  'Regular Buyer',
];

/** Rule 1: a profile with any value outside the contract counts as unknown. */
function isKnownProfile(profile: Profile): boolean {
  return (
    ACTIVITY_STATUSES.includes(profile.activity_status) &&
    BEHAVIOR_SEGMENTS.includes(profile.behavior_segment)
  );
}

/**
 * Rule table from `docs/layout-rules.md` (first match wins).
 * Pure function: profile -> LayoutVariant. No React, no I/O.
 */
export function resolveVariant(profile: Profile | null | undefined): LayoutVariant {
  if (!profile || !isKnownProfile(profile)) return 'DEFAULT_POPULAR';

  if (
    profile.activity_status === 'At Risk' ||
    profile.activity_status === 'Dormant' ||
    profile.activity_status === 'Inactive'
  ) {
    return 'OFERTAS_PRIMERO';
  }

  if (
    profile.behavior_segment === 'Frequent Buyer' ||
    profile.behavior_segment === 'Regular Buyer'
  ) {
    return 'RECOMPRA_PRIMERO';
  }

  if (
    profile.behavior_segment === 'New Buyer' ||
    profile.behavior_segment === 'Occasional Buyer'
  ) {
    return 'EXPLORACION';
  }

  return 'DEFAULT_POPULAR';
}

const LAYOUTS: Record<LayoutVariant, Omit<Layout, 'variant'>> = {
  OFERTAS_PRIMERO: {
    heroEmphasis: 'discounts',
    sections: ['offers', 'suggestions', 'keepShopping'],
    isPersonalized: true,
  },
  RECOMPRA_PRIMERO: {
    heroEmphasis: 'previousPurchases',
    sections: ['keepShopping', 'suggestions', 'offers'],
    isPersonalized: true,
  },
  EXPLORACION: {
    heroEmphasis: 'bestSellers',
    sections: ['suggestions', 'offers', 'keepShopping'],
    isPersonalized: true,
  },
  DEFAULT_POPULAR: {
    heroEmphasis: 'globalBestSellers',
    sections: ['categories'],
    isPersonalized: false,
  },
};

/**
 * Builds the full layout for a profile. `restored` is the customer's
 * "restore default view" choice, which overrides every rule (CA-05).
 */
export function buildLayout(
  profile: Profile | null | undefined,
  restored = false,
): Layout {
  const variant = restored ? 'DEFAULT_POPULAR' : resolveVariant(profile);
  return { variant, ...LAYOUTS[variant] };
}

export function sectionOrder(layout: Layout): SectionKind[] {
  return layout.sections;
}
