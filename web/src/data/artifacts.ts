import type { Artifacts } from '../domain/types';

let cache: Promise<Artifacts> | null = null;

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status})`);
  }
  return (await response.json()) as T;
}

/** Loads the three exported artifacts once; later profile switches are local (CA-02). */
export function loadArtifacts(): Promise<Artifacts> {
  if (!cache) {
    const base = import.meta.env.BASE_URL;
    cache = Promise.all([
      fetchJson<Artifacts['profiles']>(`${base}data/profiles.json`),
      fetchJson<Artifacts['rankings']>(`${base}data/rankings.json`),
      fetchJson<Artifacts['popularity']>(`${base}data/popularity.json`),
    ]).then(([profiles, rankings, popularity]) => ({ profiles, rankings, popularity }));
  }
  return cache;
}
