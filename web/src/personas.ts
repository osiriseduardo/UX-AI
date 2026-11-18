import { arrangeHome } from './domain/arrangement';
import { resolveVariant } from './domain/layout';
import type { Artifacts, Category, LayoutVariant, Profile } from './domain/types';

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
 * Assigns every persona one profile whose resolved variant matches its
 * expected layout, so each persona's Home shows its own Hero category.
 * Guests keep the default Hero (global popularity #1), which is reserved
 * first; the others, in declaration order, prefer a profile whose Hero
 * (its cluster's #1 category) no other persona shows. When the export offers
 * no such profile for a variant, the first match is used.
 * Guests and variants with no exported profile map to `null`.
 */
export function assignProfiles(artifacts: Artifacts): Map<string, Profile | null> {
  const { profiles, rankings, popularity } = artifacts;
  const heroOf = (profile: Profile | null): Category =>
    arrangeHome(profile, rankings, popularity).heroCategory;
  const assigned = new Map<string, Profile | null>();
  const shownHeroes = new Set<Category>();

  for (const persona of personas.filter((item) => !item.expectedVariant)) {
    assigned.set(persona.id, null);
    shownHeroes.add(heroOf(null));
  }

  for (const persona of personas.filter((item) => item.expectedVariant)) {
    const matches = profiles.items.filter(
      (profile) => resolveVariant(profile) === persona.expectedVariant,
    );
    const choice =
      matches.find((profile) => !shownHeroes.has(heroOf(profile))) ?? matches[0] ?? null;
    if (choice) shownHeroes.add(heroOf(choice));
    assigned.set(persona.id, choice);
  }

  return assigned;
}

/**
 * Profile assigned to one persona by `assignProfiles`. Returns `null` when the
 * persona is a guest or when the export has no profile for its variant; the
 * caller decides how to surface the gap.
 */
export function profileFor(persona: Persona, artifacts: Artifacts): Profile | null {
  return assignProfiles(artifacts).get(persona.id) ?? null;
}
