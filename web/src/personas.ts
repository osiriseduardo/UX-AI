import { resolveVariant } from './domain/layout';
import type { LayoutVariant, Profile } from './domain/types';

/**
 * The four Figma personas, matched to dataset profiles by the layout variant
 * the rule table assigns, never by a hard-coded customer id: re-exporting the
 * model cannot silently turn a persona into a guest.
 * Ana has no history (guest), which is the documented `DEFAULT_POPULAR`
 * fallback and shows her cart reminder.
 */
export interface Persona {
  id: string;
  name: string;
  initial: string;
  tagline: string;
  /** Layout the persona must land on; `null` means intentional guest. */
  expectedVariant: LayoutVariant | null;
  cartItems: string[];
}

export const personas: Persona[] = [
  {
    id: 'carlos',
    name: 'Carlos',
    initial: 'C',
    tagline: 'Cazador de ofertas',
    expectedVariant: 'OFERTAS_PRIMERO',
    cartItems: ['P-001', 'P-008'],
  },
  {
    id: 'ana',
    name: 'Ana',
    initial: 'A',
    tagline: 'Invitada con carrito pendiente',
    expectedVariant: null,
    cartItems: ['P-016', 'P-030'],
  },
  {
    id: 'luis',
    name: 'Luis',
    initial: 'L',
    tagline: 'Comprador frecuente',
    expectedVariant: 'RECOMPRA_PRIMERO',
    cartItems: [],
  },
  {
    id: 'sofia',
    name: 'Sofía',
    initial: 'S',
    tagline: 'Explorando nuevas categorías',
    expectedVariant: 'EXPLORACION',
    cartItems: [],
  },
];

export function findPersona(id: string | null | undefined): Persona {
  return personas.find((persona) => persona.id === id) ?? personas[1];
}

/**
 * First profile whose resolved variant matches the persona's expected layout.
 * Returns `null` when the persona is a guest or when the export has no profile
 * for that variant; the caller decides how to surface the gap.
 */
export function profileFor(persona: Persona, profiles: Profile[]): Profile | null {
  if (!persona.expectedVariant) return null;
  return (
    profiles.find(
      (profile) => resolveVariant(profile) === persona.expectedVariant,
    ) ?? null
  );
}
