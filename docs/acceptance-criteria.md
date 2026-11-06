# Acceptance criteria

Source: the approved project formulation document ("Formulación de Proyecto de TI", section A6). The criteria are quoted in Spanish as written, with the PDF's math-formatting artifacts removed (for example `$1.5$` → `1.5`, `%40` → `40%`). CA-01 has been modified by the team.

## CA-01' — Desempeño de IA (modified by the team)

The K-Means model must group the 50,000 records by category affinity, obtaining:

- (a) silhouette coefficient ≥ 0.40;
- (b) ARI stability ≥ 0.90 across 3 runs with different seeds;
- (c) a distinct category ranking (priority 1–4) for each cluster.

The original text required a silhouette ≥ 0.50, which the dataset cannot reach honestly (see [`dataset-findings.md`](dataset-findings.md)).

## CA-02 — Tiempo de Respuesta UI

> "Al seleccionar un perfil de usuario en el prototipo, el reordenamiento visual de la interfaz debe ejecutarse en menos de 1.5 segundos en el entorno de prueba."

## CA-03 — Estructura de Componentes

> "La categoría clasificada con Prioridad #1 por el sistema debe renderizarse obligatoriamente en el contenedor Hero principal, ocupando un área superior al 40% del ancho utilizable del dashboard."

## CA-04 — Coherencia de Navegación

> "El prototipo navegable en Figma debe permitir realizar la navegación completa de flujo ida y vuelta (Dashboard ↔ Detalle de Categoría/Perfil) sin enlaces rotos ni pantallas huérfanas."

Team decision (2026-11-06): Figma is the design source only and lives outside this repository. The navigable prototype is the web app, so CA-04 is verified there with Playwright, not in Figma.

## CA-05 — Transparencia e Información

> "Cada vista personalizada debe contener un aviso visible de nivel de contraste WCAG AA que explicite la naturaleza automatizada del reordenamiento por IA y proporcione la opción de restaurar la vista predeterminada."

## Requirements traceability

| Requirement | Description | Criterion | Test | Status |
|---|---|---|---|---|
| RF-01 | Clasificación de usuarios mediante clustering | CA-01' | `ml/tests/test_ca01_clustering.py` | pending |
| RF-02 | Reordenamiento dinámico de secciones UI | CA-02, CA-03 | `web/e2e/ca02-reorder-time.spec.ts` | pending |
| RF-03 | Layout adaptativo con contenedor Hero principal | CA-03 | domain Vitest + Playwright | pending |
| RF-04 | Flujo de navegación interactiva y pruebas de usabilidad | CA-04 | `web/e2e/ca04-navigation.spec.ts` | pending |
| RF-05 | Módulo de transparencia e indicación de automatización por IA | CA-05 | Playwright + axe | pending |
