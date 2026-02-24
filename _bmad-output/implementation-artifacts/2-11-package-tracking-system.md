# Story 2.11: Package Tracking System

Status: done

## Story

As a player,
I want to track my watch packages as they travel from China to my location with realistic tracking updates and countdown timers,
so that waiting for deliveries feels engaging and authentic.

## Overview

This feature transforms package waiting from passive to active engagement. Players can watch their watches travel the world with:
- Real-time countdown to delivery
- Location-based tracking updates based on Emily's career stage
- Realistic shipping routes (China → US ports → regional distribution)
- Different locations for Oakland, Ann Arbor, or player-chosen retirement location

## Acceptance Criteria

1. **Tracking view shows countdown timer**
   - Given I have a package in transit
   - When I view the tracking details
   - Then I see a countdown timer showing time until delivery
   - And the timer updates every second

2. **Location-based tracking for PhD/Externship/VA stages**
   - Given Emily is in PhD, Externship, or VA Hospital career stage
   - When a package is shipped from China
   - Then tracking updates through:
     - Shenzhen, China (origin)
     - Port of Oakland
     - Oakland Distribution Center
     - Emily's address in Oakland, CA

3. **Location-based tracking for Private Practice/Group Practice stages**
   - Given Emily is in Private Practice or Group Practice career stage
   - When a package is shipped from China
   - Then tracking updates through:
     - Shenzhen, China (origin)
     - Port of Long Beach or Port of Seattle
     - Midwest Distribution Hub (Chicago)
     - Ann Arbor Distribution Center
     - Emily's address in Ann Arbor, MI

4. **Location-based tracking for retirement with location choice**
   - Given Emily is in Retirement stage
   - When the stage begins
   - Then the player chooses their retirement location
   - And packages route to that location using pre-generated tracking stops

5. **Realistic tracking updates**
   - Given a package is in transit
   - When I view tracking
   - Then I see current location and status (e.g., "In Transit", "Arrived at Facility", "Out for Delivery")
   - And the progress bar shows % complete based on journey stage

6. **Generic tracking for non-CA/MI retirement locations**
   - Given Emily retires to a location other than California or Michigan
   - When packages are shipped
   - Then tracking uses generic pre-generated locations appropriate to that region
   - And follows realistic shipping patterns

7. **Tracking visibility in mail interface**
   - Given I have in-transit packages
   - When I open the Mail tab
   - Then I see a "Tracking" section separate from delivered mail
   - And tapping a package shows full tracking details

## Technical Requirements

### Data Model

```typescript
// Add to GameState
interface GameState {
  // ... existing fields
  packageTracking: {
    inTransit: TrackingPackage[];
    delivered: TrackingPackage[];
    playerLocation: PlayerLocation;
  };
}

// Location configs
interface PlayerLocation {
  type: 'oakland-ca' | 'ann-arbor-mi' | 'custom';
  customRegion?: string; // For retirement choice
  displayName: string;
}

interface TrackingLocation {
  name: string;
  region: 'china' | 'us-west' | 'us-midwest' | 'custom';
  coordinates?: { lat: number; lng: number }; // Optional, for map visualization
}

interface TrackingCheckpoint {
  location: TrackingLocation;
  status: 'pending' | 'arrived' | 'departed' | 'out-for-delivery';
  timestamp?: number; // When arrived/departed
  estimatedArrival?: number; // For pending stops
}

interface TrackingPackage {
  id: string;
  watchId: string;
  dealerName: string; // From Story 2.10
  origin: TrackingLocation;
  destination: TrackingLocation;
  route: TrackingCheckpoint[];
  currentCheckpointIndex: number;
  estimatedDelivery: number;
  orderedAt: number;
  deliveredAt?: number;
}

// Predefined routes
const LOCATION_ROUTES = {
  'oakland-ca': {
    origin: { name: 'Shenzhen, China', region: 'china' },
    stops: [
      { name: 'Port of Oakland', region: 'us-west' },
      { name: 'Oakland Distribution Center', region: 'us-west' },
      { name: "Emily's Home - Oakland, CA", region: 'us-west' }
    ]
  },
  'ann-arbor-mi': {
    origin: { name: 'Shenzhen, China', region: 'china' },
    stops: [
      { name: 'Port of Long Beach, CA', region: 'us-west' },
      { name: 'Midwest Distribution Hub - Chicago, IL', region: 'us-midwest' },
      { name: 'Ann Arbor Distribution Center', region: 'us-midwest' },
      { name: "Emily's Home - Ann Arbor, MI", region: 'us-midwest' }
    ]
  }
};

// For custom retirement locations
type USRegion = 'northeast' | 'southeast' | 'southwest' | 'northwest' | 'mountain';

const GENERIC_ROUTES: Record<USRegion, string[]> = {
  northeast: [
    'Port of New York/New Jersey',
    'Northeast Regional Hub',
    'Local Distribution Center'
  ],
  southeast: [
    'Port of Savannah, GA',
    'Southeast Regional Hub',
    'Local Distribution Center'
  ],
  southwest: [
    'Port of Long Beach, CA',
    'Southwest Regional Hub',
    'Local Distribution Center'
  ],
  northwest: [
    'Port of Seattle, WA',
    'Northwest Regional Hub',
    'Local Distribution Center'
  ],
  mountain: [
    'Port of Long Beach, CA',
    'Mountain Regional Hub - Denver, CO',
    'Local Distribution Center'
  ]
};
```

### Career Stage → Location Mapping

```typescript
const CAREER_LOCATIONS: Record<CareerStage, PlayerLocation> = {
  'pre-phd': { type: 'oakland-ca', displayName: 'Oakland, CA' },
  'phd-student': { type: 'oakland-ca', displayName: 'Oakland, CA' },
  'externship': { type: 'oakland-ca', displayName: 'Oakland, CA' },
  'va-hospital': { type: 'oakland-ca', displayName: 'Oakland, CA' },
  'private-practice': { type: 'ann-arbor-mi', displayName: 'Ann Arbor, MI' },
  'group-practice': { type: 'ann-arbor-mi', displayName: 'Ann Arbor, MI' },
  'retirement': null // Player chooses
};
```

### New Components

1. **`PackageTrackingCard`** (`src/ui/components/PackageTrackingCard.tsx`)
   - Shows in Mail tab under "In Transit" section
   - Displays watch thumbnail, dealer name, countdown
   - Progress bar showing journey completion
   - Tap to view details

2. **`TrackingDetailView`** (`src/ui/components/TrackingDetailView.tsx`)
   - Full-screen modal with detailed tracking
   - Route visualization (list or simple map)
   - Current location highlighted
   - Countdown timer prominent
   - All checkpoints with timestamps

3. **`TrackingProgressBar`** (`src/ui/components/TrackingProgressBar.tsx`)
   - Visual progress indicator
   - Shows % complete
   - Color-coded by status
   - Segment markers for each checkpoint

4. **`RetirementLocationSelector`** (`src/ui/components/RetirementLocationSelector.tsx`)
   - Modal for choosing retirement location
   - US map or region list
   - Previews tracking route
   - Confirmation button

### State Management

**Actions:**
```typescript
type Action =
  | { type: 'CREATE_TRACKING'; package: TrackingPackage }
  | { type: 'UPDATE_TRACKING_PROGRESS'; packageId: string }
  | { type: 'MARK_DELIVERED'; packageId: string }
  | { type: 'SET_RETIREMENT_LOCATION'; location: PlayerLocation }
  | { type: 'CHOOSE_RETIREMENT_LOCATION' } // Opens selector modal
  | { type: 'TICK_TRACKING' }; // Called on each sim tick
```

**Selectors:**
```typescript
// src/game/selectors/tracking.ts
export const inTransitPackages = (state: GameState): TrackingPackage[] =>
  state.packageTracking.inTransit.sort(
    (a, b) => a.estimatedDelivery - b.estimatedDelivery
  );

export const currentLocation = (state: GameState): PlayerLocation =>
  state.packageTracking.playerLocation;

export const getTrackingForPackage = (
  state: GameState,
  packageId: string
): TrackingPackage | undefined =>
  state.packageTracking.inTransit.find(p => p.id === packageId);

export const estimatedDeliveryTime = (pkg: TrackingPackage): string => {
  const remaining = pkg.estimatedDelivery - Date.now();
  if (remaining <= 0) return 'Arriving now';
  if (remaining < 60000) return 'Less than a minute';
  const minutes = Math.floor(remaining / 60000);
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};
```

### Integration Points

**Market Purchase Flow** (Story 2.5):
```typescript
const createTrackingForPurchase = (
  watchId: string,
  dealerName: string,
  deliveryDelayMs: number
): TrackingPackage => {
  const location = getCurrentLocation(state);
  const route = generateRoute(location);
  
  return {
    id: generateId(),
    watchId,
    dealerName,
    origin: { name: 'Shenzhen, China', region: 'china' },
    destination: { 
      name: location.displayName, 
      region: location.type === 'oakland-ca' ? 'us-west' : 'us-midwest'
    },
    route: route.map((stop, index) => ({
      location: stop,
      status: index === 0 ? 'departed' : 'pending',
      timestamp: index === 0 ? Date.now() : undefined,
      estimatedArrival: calculateCheckpointArrival(index, deliveryDelayMs)
    })),
    currentCheckpointIndex: 0,
    estimatedDelivery: Date.now() + deliveryDelayMs,
    orderedAt: Date.now()
  };
};
```

**Career Stage Transition** (Epic 4):
```typescript
// When transitioning to retirement
const handleRetirementTransition = () => {
  dispatch({ type: 'CHOOSE_RETIREMENT_LOCATION' });
  // Opens modal for player to choose
};

const onLocationChosen = (region: USRegion, customName?: string) => {
  const location: PlayerLocation = {
    type: 'custom',
    customRegion: region,
    displayName: customName || `Retirement Home (${region})`
  };
  dispatch({ type: 'SET_RETIREMENT_LOCATION', location });
};
```

**Sim Tick Update**:
```typescript
// Called every tick (e.g., every second)
const updateTracking = (state: GameState) => {
  state.packageTracking.inTransit.forEach(pkg => {
    const now = Date.now();
    const progress = (now - pkg.orderedAt) / (pkg.estimatedDelivery - pkg.orderedAt);
    
    // Update checkpoint status based on progress
    const checkpointProgress = 1 / pkg.route.length;
    const currentIndex = Math.floor(progress / checkpointProgress);
    
    if (currentIndex > pkg.currentCheckpointIndex) {
      // Package has reached next checkpoint
      pkg.route[pkg.currentCheckpointIndex].status = 'departed';
      pkg.route[pkg.currentCheckpointIndex].timestamp = now;
      
      if (currentIndex < pkg.route.length) {
        pkg.route[currentIndex].status = 'arrived';
        pkg.route[currentIndex].timestamp = now;
        pkg.currentCheckpointIndex = currentIndex;
        
        // Show notification
        dispatch({
          type: 'SHOW_MAIL_TOAST',
          toast: {
            type: 'package',
            title: 'Package Update',
            content: `Arrived at ${pkg.route[currentIndex].location.name}`
          }
        });
      }
    }
    
    // Check if delivered
    if (now >= pkg.estimatedDelivery) {
      dispatch({ type: 'MARK_DELIVERED', packageId: pkg.id });
    }
  });
};
```

## UI/UX Specifications

### Package Tracking Card (Mail Tab)

```
┌─────────────────────────────────────────┐
│ In Transit                              │
├─────────────────────────────────────────┤
│ ┌─────┐  Rolex Submariner      2m 34s  │
│ │ 📷  │  From: Jason007         ▓▓▓░░  │
│ └─────┘  In Transit - Port of Oakland   │
├─────────────────────────────────────────┤
│ ┌─────┐  Omega Speedmaster     5m 12s  │
│ │ 📷  │  From: Lena             ▓░░░░░  │
│ └─────┘  Departed - Shenzhen, China     │
└─────────────────────────────────────────┘
```

### Tracking Detail View

```
┌─────────────────────────────────────────┐
│ ←  Tracking Details                 ✕  │
├─────────────────────────────────────────┤
│                                         │
│        ┌─────────────┐                  │
│        │   📷        │                  │
│        │  [Watch]    │                  │
│        └─────────────┘                  │
│                                         │
│     Rolex Submariner                    │
│     From: Jason007                      │
│                                         │
│     ───────  2 minutes 34 seconds  ─────│
│                                         │
│     Journey Progress:                   │
│     ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░  60%         │
│                                         │
│     Route:                              │
│     ✓ Shenzhen, China          2:34 PM  │
│     ✓ Departed                           │
│       ─────────────────────────────     │
│     ✓ Port of Oakland          2:45 PM  │
│     ✓ Arrived                            │
│       ─────────────────────────────     │
│     → Oakland Distribution     2:52 PM  │
│       In Transit                         │
│       ─────────────────────────────     │
│     ○ Emily's Home - Oakland   2:58 PM  │
│       Estimated                          │
│                                         │
└─────────────────────────────────────────┘
```

### Retirement Location Selector

```
┌─────────────────────────────────────────┐
│ Choose Your Retirement Location         │
├─────────────────────────────────────────┤
│                                         │
│     Where would you like to retire?     │
│                                         │
│   ┌─────────┐  ┌─────────┐  ┌────────┐ │
│   │  West   │  │ Midwest │  │Northeast│ │
│   │   🌴    │  │   🏙️    │  │   🍂   │ │
│   │Coast    │  │         │  │        │ │
│   └─────────┘  └─────────┘  └────────┘ │
│                                         │
│   ┌─────────┐  ┌─────────┐             │
│   │Southwest│  │Southeast│             │
│   │   🏜️    │  │   🏖️    │             │
│   └─────────┘  └─────────┘             │
│                                         │
│   Or choose a specific state...         │
│   [Dropdown: All US States]             │
│                                         │
│        [Confirm Location]               │
│                                         │
└─────────────────────────────────────────┘
```

## Files to Create/Modify

### New Files

1. **`src/ui/components/PackageTrackingCard.tsx`**
2. **`src/ui/components/TrackingDetailView.tsx`**
3. **`src/ui/components/TrackingProgressBar.tsx`**
4. **`src/ui/components/RetirementLocationSelector.tsx`**
5. **`src/game/selectors/tracking.ts`**
6. **`src/game/data/trackingRoutes.ts`** - Route definitions

### Modified Files

1. **`src/ui/tabs/MailTab.tsx`** - Add tracking section
2. **`src/game/career.ts`** - Add retirement location logic
3. **`src/game/economy.ts`** - Create tracking on purchase
4. **`src/game/reducer.ts`** - Handle tracking actions
5. **`src/game/types.ts`** - Add tracking types
6. **`src/game/loop.ts`** - Call tracking update on tick

## Animation Specifications

**Progress Bar:**
- Smooth width transition: 300ms ease-out
- Color gradient: Blue → Green as package approaches
- Pulse animation on "Out for Delivery" status

**Countdown Timer:**
- Updates every second with subtle fade
- Red color when < 10 seconds remaining
- Celebratory animation on delivery

**Checkpoint Updates:**
- Checkmark animates in (scale 0 → 1)
- Current checkpoint pulses gently
- Line between checkpoints draws progressively

## Testing Requirements

### Unit Tests

```typescript
// src/game/selectors/tracking.unit.test.ts
describe('tracking selectors', () => {
  it('calculates remaining time correctly', () => {
    const pkg = createTrackingPackage({
      estimatedDelivery: Date.now() + 120000 // 2 minutes
    });
    expect(estimatedDeliveryTime(pkg)).toBe('2 minutes');
  });
  
  it('generates correct route for Oakland', () => {
    const route = generateRoute({ type: 'oakland-ca' });
    expect(route[0].name).toBe('Shenzhen, China');
    expect(route[route.length - 1].name).toContain('Oakland');
  });
  
  it('generates correct route for Ann Arbor', () => {
    const route = generateRoute({ type: 'ann-arbor-mi' });
    expect(route).toContainEqual(
      expect.objectContaining({ name: expect.stringContaining('Chicago') })
    );
  });
});
```

### E2E Tests

```gherkin
Scenario: Package tracking shows countdown
  Given I purchase a watch
  When I view the Mail tab
  Then I see the package in "In Transit"
  And it shows a countdown timer
  And the timer decreases every second

Scenario: Tracking shows correct locations for Oakland
  Given I am in PhD stage (Oakland)
  When I purchase a watch
  Then the tracking shows Oakland route
  And includes "Port of Oakland"

Scenario: Tracking shows correct locations for Ann Arbor
  Given I am in Private Practice stage (Ann Arbor)
  When I purchase a watch
  Then the tracking shows Ann Arbor route
  And includes "Chicago Hub"

Scenario: Retirement location choice
  Given I reach Retirement stage
  When the stage begins
  Then I can choose my retirement location
  And future packages route to that location

Scenario: Generic route for non-CA/MI location
  Given I retire to Florida
  When I purchase a watch
  Then the tracking shows Southeast route
  And includes appropriate regional stops
```

## Dev Notes

### Sim Tick Performance

Tracking updates should be efficient:
- Only process in-transit packages
- Calculate progress once per tick
- Batch state updates
- Consider throttling UI updates (every 5 ticks vs every tick)

### Career Stage Detection

Get current location from career state:
```typescript
const getCurrentLocation = (state: GameState): PlayerLocation => {
  if (state.packageTracking.playerLocation) {
    return state.packageTracking.playerLocation;
  }
  // Fall back to career stage default
  return CAREER_LOCATIONS[state.career.currentStage];
};
```

### Persistence

Tracking state must be saved/loaded:
- Save: All tracking packages, player location
- Load: Restore inTransit and delivered arrays
- Recalculate: Current checkpoint on load (time may have passed)

### Generic Route Generation

```typescript
const generateGenericRoute = (region: USRegion): TrackingLocation[] => {
  const stops = GENERIC_ROUTES[region];
  return [
    { name: 'Shenzhen, China', region: 'china' },
    ...stops.map(stop => ({ name: stop, region: 'custom' })),
    { name: 'Your Retirement Home', region: 'custom' }
  ];
};
```

## References

- **Epic Source**: `_bmad-output/planning-artifacts/epic-2-core-loop.md#Story 2.11`
- **Related Stories**:
  - 2.5 (Watch Market) - Purchase integration
  - 2.10 (Mail Notifications) - Toast notifications for updates
  - 4.x (Career Journey) - Location changes
- **Files**:
  - Career stage definitions: `src/game/career.ts`
  - Existing mailbox: `src/ui/tabs/MailTab.tsx`

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Completion Notes List

- [x] PackageTrackingCard component created
- [x] TrackingDetailView with countdown implemented
- [x] Routes defined for Oakland and Ann Arbor
- [x] Retirement location selector implemented
- [x] Generic route generation working
- [x] Sim tick updates tracking progress
- [x] Tests passing

### File List

- Created: `src/game/data/trackingRoutes.ts`
- Created: `src/game/data/trackingRoutes.unit.test.ts`
- Created: `src/game/selectors/tracking.ts`
- Created: `src/game/selectors/tracking.unit.test.ts`
- Created: `src/ui/components/PackageTrackingCard.tsx`
- Created: `src/ui/components/TrackingDetailView.tsx`
- Created: `src/ui/components/TrackingProgressBar.tsx`
- Created: `src/ui/components/RetirementLocationSelector.tsx`
- Modified: `src/game/types.ts`
- Modified: `src/game/reducer.ts`
- Modified: `src/game/persistence.ts`
- Modified: `src/game/selectors/index.ts`
- Modified: `src/game/reducer.unit.test.ts`
- Modified: `src/ui/tabs/MailTab.tsx`
- Modified: `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Debug Log References

- Added location-aware route generation and tracking package creation in `trackingRoutes`.
- Added tracking selectors for in-transit listing, location lookup, countdown formatting, and progress percent.
- Integrated tracking creation during purchase and tracking progression updates during package checks.
- Added Mail tab tracking section, detail modal, countdown updates each second, and retirement location picker.
- Added unit test coverage for route generation and tracking selectors.

### Change Summary

- Tracking now shows a separate "In Transit" section in Mail with countdown and progress bar cards.
- Package routes follow career-stage location defaults (Oakland and Ann Arbor) and support custom retirement regions.
- Detailed tracking view exposes checkpoints, status progression, and ETA timeline.
- Full suite passes after integration.

## Senior Developer Review (AI)

### Reviewer

- Ryan (AI-assisted adversarial review)

### Outcome

- Approve

### Findings Resolved

- Fixed SIM tick delivery reconciliation so tracking entries move from in-transit to delivered.
- Fixed delivered package opening flow to work after packages leave pending queue and ensured matching package mail is marked read.
- Fixed package-arrived mail read logic to key by `type + watchId` rather than fragile generated IDs.
- Moved retirement location prompt trigger to app-level transition handling rather than Mail-tab-only display.
- Improved origin checkpoint semantics to remain `departed` at shipment start.

### Verification

- `pnpm -s exec vitest run` (35 files, 231 tests passed)
