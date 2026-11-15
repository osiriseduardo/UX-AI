import type { Profile } from './domain/types';

/**
 * The four Figma personas, mapped onto real dataset profiles so the rule
 * table still decides each layout. Ana has no history (guest), which is the
 * documented `DEFAULT_POPULAR` fallback and shows her cart reminder.
 */
export interface Persona {
  id: string;
  name: string;
  initial: string;
  tagline: string;
  customerId: string | null;
  cartItems: string[];
}

export const personas: Persona[] = [
  {
    id: 'carlos',
    name: 'Carlos',
    initial: 'C',
    tagline: 'Cazador de ofertas',
    customerId: 'CUST-000012',
    cartItems: ['P-001', 'P-008'],
  },
  {
    id: 'ana',
    name: 'Ana',
    initial: 'A',
    tagline: 'Invitada con carrito pendiente',
    customerId: null,
    cartItems: ['P-016', 'P-030'],
  },
  {
    id: 'luis',
    name: 'Luis',
    initial: 'L',
    tagline: 'Rutina de entrenamiento',
    customerId: 'CUST-000029',
    cartItems: [],
  },
  {
    id: 'sofia',
    name: 'Sofía',
    initial: 'S',
    tagline: 'Explorando nuevas categorías',
    customerId: 'CUST-000014',
    cartItems: [],
  },
];

export function findPersona(id: string | null | undefined): Persona {
  return personas.find((persona) => persona.id === id) ?? personas[1];
}

export function profileFor(persona: Persona, profiles: Profile[]): Profile | null {
  if (!persona.customerId) return null;
  return profiles.find((profile) => profile.customer_id === persona.customerId) ?? null;
}
