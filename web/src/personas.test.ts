import { describe, expect, it } from 'vitest';
import { findPersona, personas, profileFor } from './personas';
import type { Persona } from './personas';
import type { Profile } from './domain/types';

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

    expect(profileFor(persona('carlos'), profiles)?.customer_id).toBe('CUST-2');
  });

  it('matches the first RECOMPRA_PRIMERO profile', () => {
    const profiles = [
      profile({ customer_id: 'CUST-1', activity_status: 'At Risk' }),
      profile({ customer_id: 'CUST-2', behavior_segment: 'Regular Buyer' }),
      profile({ customer_id: 'CUST-3', behavior_segment: 'Frequent Buyer' }),
    ];

    expect(profileFor(persona('luis'), profiles)?.customer_id).toBe('CUST-2');
  });

  it('matches the first EXPLORACION profile', () => {
    const profiles = [
      profile({ customer_id: 'CUST-1', behavior_segment: 'Frequent Buyer' }),
      profile({ customer_id: 'CUST-2', behavior_segment: 'Occasional Buyer' }),
      profile({ customer_id: 'CUST-3', behavior_segment: 'New Buyer' }),
    ];

    expect(profileFor(persona('sofia'), profiles)?.customer_id).toBe('CUST-2');
  });

  it('returns null for Ana because she is an intentional guest', () => {
    const profiles = [profile({ customer_id: 'CUST-1' })];

    expect(persona('ana').expectedVariant).toBeNull();
    expect(profileFor(persona('ana'), profiles)).toBeNull();
  });

  it('returns null when no profile matches the expected variant', () => {
    const profiles = [
      profile({ customer_id: 'CUST-1', behavior_segment: 'Frequent Buyer' }),
      profile({ customer_id: 'CUST-2', behavior_segment: 'Regular Buyer' }),
    ];

    expect(profileFor(persona('carlos'), profiles)).toBeNull();
    expect(profileFor(persona('sofia'), [])).toBeNull();
  });
});
