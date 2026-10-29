# OrgoBingo Implementation Plan

**Goal:** Build and publish the approved organic-compound bingo and related links.
**Architecture:** Static HTML, CSS and JavaScript, with separately versioned JSON and SVG assets. Editing uses a single Git commit based on one validated GitHub HEAD; drawing uses an immutable round snapshot.
**Tech Stack:** Browser JavaScript, JSON, SVG, GitHub Git Database API, GitHub Pages.
**Spec:** docs/implementation-spec.md

- [ ] Inspect the existing bingo interaction and publication settings.
- [ ] Create and verify 31 compound records, fixed vocabularies, ordered set, and chemically accurate readable SVGs.
- [ ] Implement and test filtering, stable sorting, per-set local ON/OFF, draft editing and immutable drawing rounds.
- [ ] Implement and test coherent baseline loading, atomic GitHub save, conflict detection and ambiguous-result recovery.
- [ ] Verify local UI including narrow layouts, safe rendering, SVG preload, animation and settings workflows.
- [ ] Replace the elemental bingo shuffle with Fisher–Yates, test and publish.
- [ ] Publish OrgoBingo and add its link to the actual KoiChem Apps portal; verify commits, deployments and public assets separately.
- [ ] Report physical projector verification as unperformed unless actually performed.
