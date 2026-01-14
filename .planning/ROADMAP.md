# Roadmap: Watch Idle

## Overview

Build a browser-based incremental game where the core loop starts with collecting luxury watches, then escalates into upgrading a workshop that accelerates the entire economy, and finally culminates in founding a “Maison” that turns repeated runs into an expanding brand empire. The north star is a compounding “vault value” fantasy: every reset should feel like you’re cashing in a lifetime of collecting for permanent leverage.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Choose stack and ship a playable skeleton with saving
- [ ] **Phase 2: Collection Loop** - Make collecting/upgrading feel good and scalable
- [ ] **Phase 3: Catalog & Images** - Add real-image catalog with licensing + attribution
- [ ] **Phase 4: Workshop Prestige** - Add first prestige reset + meta-progression
- [ ] **Phase 5: Maison Prestige** - Add second prestige reset + brand-empire expansion
- [ ] **Phase 6: Balance & Content** - Tune pacing/softcaps and add mid/late content
- [ ] **Phase 7: Packaging & Polish** - Make it pleasant to run locally and robust

## Phase Details

### Phase 1: Foundation
**Goal**: A playable local web app with a ticking economy, basic UI, and save/load.
**Depends on**: Nothing (first phase)
**Research**: Unlikely (established web app patterns)
**Plans**: 3 plans

Plans:
- [ ] 01-01: Pick stack + repo scaffolding (Vite, TS, formatting)
- [ ] 01-02: Game loop core (tick, currency, buy action, rendering)
- [ ] 01-03: Persistence (localStorage), import/export save

### Phase 2: Collection Loop
**Goal**: Collection is fun: watches/upgrades drive compounding and clear goals.
**Depends on**: Phase 1
**Research**: Unlikely (core incremental mechanics)
**Plans**: 3 plans

Plans:
- [ ] 02-01: Watch items + pricing curve + purchase UX
- [ ] 02-02: Upgrades and softcaps (diminishing returns) for pacing
- [ ] 02-03: Collection value, set bonuses, and milestone unlocks

### Phase 3: Catalog & Images
**Goal**: Real-image catalog for Rolex / Jaeger‑LeCoultre / Audemars Piguet with attribution.
**Depends on**: Phase 2
**Research**: Likely (image licensing/attribution requirements and source reliability)
**Research topics**: Wikimedia Commons licensing patterns, attribution fields, acceptable image transforms, local caching strategy
**Plans**: 3 plans

Plans:
- [ ] 03-01: Catalog data model (brand/model/metadata) and filtering/search
- [ ] 03-02: Image pipeline (download/curate list, store sources, render)
- [ ] 03-03: Attribution UI and “sources” view (per-image license + link)

### Phase 4: Workshop Prestige
**Goal**: “Workshop” prestige reset that makes the next Collection run meaningfully faster.
**Depends on**: Phase 3
**Research**: Unlikely (standard prestige patterns)
**Plans**: 3 plans

Plans:
- [ ] 04-01: Prestige 1 reset rules (what resets vs persists)
- [ ] 04-02: Workshop meta-currency and permanent upgrades/unlocks
- [ ] 04-03: Automation and QoL (auto-buy, bulk buy, milestones)

### Phase 5: Maison Prestige
**Goal**: “Maison” prestige reset that unlocks long-term brand-empire progression.
**Depends on**: Phase 4
**Research**: Unlikely (internal systems and content)
**Plans**: 2 plans

Plans:
- [ ] 05-01: Prestige 2 reset rules and Maison currency (Heritage/Reputation)
- [ ] 05-02: Maison systems (product lines, permanent expansion unlocks)

### Phase 6: Balance & Content
**Goal**: A satisfying early→mid→late curve across all three layers.
**Depends on**: Phase 5
**Research**: Unlikely (iteration/tuning)
**Plans**: 2 plans

Plans:
- [ ] 06-01: Balance pass (curves, thresholds, softcaps, pacing)
- [ ] 06-02: Content pass (achievements, events, milestone goals)

### Phase 7: Packaging & Polish
**Goal**: Easy personal-use distribution; stable saves; good performance.
**Depends on**: Phase 6
**Research**: Unlikely (packaging and cleanup)
**Plans**: 1 plan

Plans:
- [ ] 07-01: Build output, local run instructions, perf+accessibility polish

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Collection Loop | 0/3 | Not started | - |
| 3. Catalog & Images | 0/3 | Not started | - |
| 4. Workshop Prestige | 0/3 | Not started | - |
| 5. Maison Prestige | 0/2 | Not started | - |
| 6. Balance & Content | 0/2 | Not started | - |
| 7. Packaging & Polish | 0/1 | Not started | - |
