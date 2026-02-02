# Milestone v3.2 Requirements: Catalog/Vault Consolidation

## Overview

Unify the catalog shopping experience by merging vault information into the catalog surface and making watch purchasing feel seamless. This is a UI/UX consolidation milestone that reorganizes existing capabilities without adding new domain features.

**Milestone Goal:** Catalog cards become the sole purchase flow with vault information integrated into the catalog surface.

---

## v1 Requirements (This Milestone)

### Catalog Shopping Experience

- [x] **CAT-01**: Catalog cards are the sole purchase flow for watches (remove separate Vault purchase button)
- [x] **CAT-02**: Undiscovered watches display as greyed out with lock icon (not completely hidden)
- [x] **CAT-03**: Catalog shows "Why can't I buy?" explanations on disabled purchase actions
- [x] **CAT-04**: Catalog highlights actionable cards (affordable vs locked) with visual distinction

### Vault Information Integration

- [ ] **VLT-01**: Vault capacity displayed within catalog surface (current/max)
- [ ] **VLT-02**: Current collection value shown in catalog context
- [ ] **VLT-03**: Upgrade status visible in catalog (merge from separate upgrades surface)
- [ ] **VLT-04**: Rename "Vault" tab to "Collection" consistently across UI and copy

### Upgrade System Alignment

- [ ] **UPG-01**: Upgrade copy reflects enjoyment-only multipliers (remove cash multiplier claims)
- [ ] **UPG-02**: Upgrade previews match actual accrual behavior (enjoyment calculation)
- [ ] **UPG-03**: Remove or reframe any upgrade descriptions implying cash multipliers

### Technical Requirements

- [ ] **TEC-01**: Maintain existing save compatibility (no save format changes)
- [ ] **TEC-02**: Preserve all localStorage keys and data structures
- [ ] **TEC-03**: Keep UI selectors stable (`id`, `data-testid`) for test protection
- [ ] **TEC-04**: Ensure catalog images continue to load correctly after consolidation

---

## Future Requirements (Deferred)

### v4.0 Watch Interactions & Catalog Polish

- Winding mini-game with more interactive control and visual animation
- Additional automatic watch mini-games (setting time/date, changing strap)
- Catalog expansion with more watch brands and models
- Individual watch stats showing enjoyment/cash rates per watch
- Mobile-responsive catalog with touch-friendly interactions

---

## Out of Scope

- **New watch interactions**: Winding, setting time, strap changes → v4.0
- **New watch models/brands**: Catalog expansion → v4.0
- **New upgrade types**: Additional upgrade categories → Future milestone
- **Save format changes**: Any breaking changes to save structure → Not in v3.2
- **New game mechanics**: No new loops or currencies → Not in v3.2

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAT-01 | Phase 37 | Complete |
| CAT-02 | Phase 38 | Complete |
| CAT-03 | Phase 38 | Complete |
| CAT-04 | Phase 37 | Complete |
| VLT-01 | Phase 39 | Not started |
| VLT-02 | Phase 39 | Not started |
| VLT-03 | Phase 40 | Not started |
| VLT-04 | Phase 39 | Not started |
| UPG-01 | Phase 40 | Not started |
| UPG-02 | Phase 40 | Not started |
| UPG-03 | Phase 40 | Not started |
| TEC-01 | Phase 41 | Not started |
| TEC-02 | Phase 41 | Not started |
| TEC-03 | Phase 41 | Not started |
| TEC-04 | Phase 41 | Not started |

---

*Last updated: 2026-02-02*
