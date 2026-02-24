# Story 2.10: Mail Notification System

Status: done

## Story

As a player,
I want prominent notifications when mail arrives and an indicator showing unopened mail count,
so that I never miss important deliveries or messages.

## Overview

This feature enhances the existing mailbox system (Story 2.5) by adding:
1. Toast notifications when new mail arrives
2. Badge indicator on Mail button showing unopened count
3. Four named watch dealers (Ethan, Jason007, Lena, Michael Travis)
4. Visual distinction between mail types (letters vs packages)

## Acceptance Criteria

1. **Toast notification on new mail arrival**
   - Given a watch package or letter is delivered to my mailbox
   - When the delivery completes
   - Then a prominent toast notification appears with message type and sender
   - And the toast auto-dismisses after 3-5 seconds or on tap

2. **Mail badge indicator shows unopened count**
   - Given I have unopened mail in my mailbox
   - When I view the navigation bar
   - Then the Mail button displays a badge with the count of unopened items

3. **Mail indicator clears when all mail opened**
   - Given I have unopened mail
   - When I open and read all mail items
   - Then the badge disappears from the Mail button

4. **Named dealers for watch purchases**
   - Given I purchase a watch from the market
   - When the order is placed
   - Then the package sender is randomly one of: Ethan, Jason007, Lena, or Michael Travis
   - And the dealer name appears in the delivery notification and package details

5. **Different notification types**
   - Given mail arrives
   - When the notification displays
   - Then acceptance letters have special visual treatment
   - And watch packages show dealer name and watch preview
   - And system messages have distinct styling

## Technical Requirements

### Data Model Changes

```typescript
// Add to GameState
interface GameState {
  // ... existing fields
  mail: {
    inbox: MailItem[];
    unopenedCount: number;
    pendingToasts: MailToast[];
  };
}

// New types
interface MailItem {
  id: string;
  type: 'letter' | 'package' | 'system';
  sender?: string; // Dealer name for packages
  title: string;
  content: string;
  metadata?: {
    watchId?: string; // For packages
    letterType?: 'acceptance' | 'milestone' | 'personal';
  };
  isOpened: boolean;
  receivedAt: number;
}

interface MailToast {
  id: string;
  type: 'letter' | 'package' | 'system';
  title: string;
  sender?: string;
  watchPreview?: string; // Image URL for packages
  durationMs: number;
}

// Dealer names
const DEALERS = ['Ethan', 'Jason007', 'Lena', 'Michael Travis'] as const;
type DealerName = typeof DEALERS[number];
```

### New Components

1. **`MailToast`** (`src/ui/components/MailToast.tsx`)
   - Displays incoming mail notification
   - Auto-dismiss with progress bar
   - Tap to dismiss early
   - Different styling per mail type

2. **`MailBadge`** (integrated into `BottomNav`)
   - Shows unopened count
   - Red dot badge styling
   - Updates in real-time

3. **`MailIndicator`** (hook-based)
   - `useUnopenedMailCount()` selector
   - Returns count from GameState

### State Management

**Actions to Add:**
```typescript
type Action =
  | { type: 'ADD_MAIL'; item: MailItem }
  | { type: 'OPEN_MAIL'; mailId: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'SHOW_MAIL_TOAST'; toast: MailToast }
  | { type: 'DISMISS_TOAST'; toastId: string }
  | { type: 'ASSIGN_DEALER'; watchId: string; dealer: DealerName };
```

**Selectors:**
```typescript
// src/game/selectors/mail.ts
export const unopenedMailCount = (state: GameState): number =>
  state.mail.inbox.filter(item => !item.isOpened).length;

export const activeToasts = (state: GameState): MailToast[] =>
  state.mail.pendingToasts;

export const inboxItems = (state: GameState): MailItem[] =>
  state.mail.inbox.sort((a, b) => b.receivedAt - a.receivedAt);
```

### Integration Points

**Market Purchase Flow** (Story 2.5):
```typescript
// In purchase handler
const purchaseWatch = (watchId: string) => {
  const dealer = DEALERS[Math.floor(Math.random() * DEALERS.length)];
  
  dispatch({
    type: 'ADD_MAIL',
    item: {
      id: generateId(),
      type: 'package',
      sender: dealer,
      title: `Package from ${dealer}`,
      content: `Your ${watchName} has arrived!`,
      metadata: { watchId },
      isOpened: false,
      receivedAt: Date.now(),
    }
  });
  
  dispatch({
    type: 'SHOW_MAIL_TOAST',
    toast: {
      id: generateId(),
      type: 'package',
      title: 'Package Arrived!',
      sender: dealer,
      watchPreview: watchImageUrl,
      durationMs: 5000,
    }
  });
};
```

**Acceptance Letter** (Story 2.4):
- Special toast styling
- "Important Letter" indicator
- Different sound effect (if audio implemented)

## UI/UX Specifications

### Toast Design

**Watch Package Toast:**
```
┌─────────────────────────────────┐
│ 📦 Package Arrived!          ✕ │
├─────────────────────────────────┤
│ [Watch Thumbnail]               │
│ From: Ethan                     │
│ Your watch is here!             │
│ ─────────────────────────────── │
│ ▓▓▓▓▓░░░░░ (5s remaining)       │
└─────────────────────────────────┘
```

**Letter Toast:**
```
┌─────────────────────────────────┐
│ ✉️ Important Letter            ✕ │
├─────────────────────────────────┤
│ Acceptance Letter               │
│ Tap to read                     │
└─────────────────────────────────┘
```

### Badge Design

**BottomNav Mail Button:**
```
┌─────────┐
│   📬    │  <- Mail icon
│    3    │  <- Red badge with count
└─────────┘
```

- Badge color: Red (#FF4444)
- Badge position: Top-right of icon
- Font: Bold, white
- Hide when count is 0

## Files to Create/Modify

### New Files

1. **`src/ui/components/MailToast.tsx`**
   - Toast notification component
   - Props: `toast: MailToast`, `onDismiss: () => void`
   - Animation: Slide in from top, fade out

2. **`src/ui/components/MailToastManager.tsx`**
   - Manages toast queue
   - Renders active toasts
   - Handles auto-dismiss logic

3. **`src/game/selectors/mail.ts`**
   - Mail-related selectors
   - `unopenedMailCount`, `inboxItems`, `activeToasts`

### Modified Files

1. **`src/ui/components/BottomNav.tsx`**
   - Add badge to Mail button
   - Use `useUnopenedMailCount()` hook
   - Badge updates reactively

2. **`src/ui/tabs/MailTab.tsx`**
   - Add "mark as read" functionality
   - Update `isOpened` status
   - Track unopened count

3. **`src/game/reducer.ts`**
   - Assign dealer on purchase
   - Add mail item to inbox
   - Trigger toast notification

4. **`src/game/reducer.ts`**
   - Handle new mail actions
   - Update mail state
   - Calculate unopened count

5. **`src/game/types.ts`**
   - Add `MailItem`, `MailToast`, `DealerName` types
   - Update `GameState` interface

6. **`src/ui/App.tsx`**
   - Include `MailToastManager` at root level
   - Toasts display above all content

## Animation Specifications

**Toast Entry:**
- Duration: 300ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Transform: `translateY(-100%)` → `translateY(0)`
- Opacity: 0 → 1

**Toast Exit:**
- Duration: 200ms
- Easing: `ease-out`
- Opacity: 1 → 0
- Height collapse after fade

**Badge Pop:**
- Scale: 0 → 1.2 → 1
- Duration: 300ms
- Trigger: When count increases

## Testing Requirements

### Unit Tests

```typescript
// src/game/selectors/mail.unit.test.ts
describe('mail selectors', () => {
  it('counts unopened mail correctly', () => {
    const state = createGameState({
      mail: {
        inbox: [
          { id: '1', isOpened: false },
          { id: '2', isOpened: true },
          { id: '3', isOpened: false },
        ]
      }
    });
    expect(unopenedMailCount(state)).toBe(2);
  });
  
  it('returns 0 when all mail opened', () => {
    const state = createGameState({
      mail: {
        inbox: [
          { id: '1', isOpened: true },
          { id: '2', isOpened: true },
        ]
      }
    });
    expect(unopenedMailCount(state)).toBe(0);
  });
});

// src/ui/components/MailToast.unit.test.tsx
describe('MailToast', () => {
  it('displays package sender name', () => {
    render(<MailToast toast={{
      type: 'package',
      sender: 'Ethan',
      title: 'Package Arrived!'
    }} />);
    expect(screen.getByText('From: Ethan')).toBeInTheDocument();
  });
  
  it('auto-dismisses after duration', async () => {
    const onDismiss = vi.fn();
    render(<MailToast toast={{...}} onDismiss={onDismiss} />);
    await waitFor(() => expect(onDismiss).toHaveBeenCalled(), {
      timeout: 5000
    });
  });
});
```

### E2E Tests

```gherkin
Scenario: Toast appears on mail delivery
  Given I purchase a watch
  When the delivery completes
  Then a toast notification appears
  And it shows the dealer name
  And it disappears after 5 seconds

Scenario: Badge shows unopened count
  Given I have 3 unopened mail items
  When I view the navigation
  Then the Mail button shows badge with "3"

Scenario: Badge clears when mail opened
  Given I have unopened mail
  When I open the Mail tab
  And I read all messages
  Then the badge disappears

Scenario: Dealer assignment
  Given I purchase multiple watches
  When packages arrive
  Then each has one of the 4 dealer names
  And dealers are randomly assigned
```

## Dev Notes

### State Shape

Mail state should be persisted (saved/loaded). Ensure:
- `receivedAt` timestamps are numbers
- Toast state may be ephemeral (not persisted)
- Unopened count recalculated on load (don't store separately)

### Performance Considerations

- Use selector memoization for `unopenedMailCount`
- Toast manager should limit concurrent toasts (max 3)
- Clean up dismissed toasts from state

### Accessibility

- Toasts should have `role="alert"`
- Badges should have `aria-label` with count
- Ensure keyboard navigation to dismiss toasts

## References

- **Epic Source**: `_bmad-output/planning-artifacts/epic-2-core-loop.md#Story 2.10`
- **Related Stories**:
  - 2.5 (Watch Market & Purchase Flow) - Integration point
  - 2.4 (Pre-PhD Onboarding) - Acceptance letters
  - 2.11 (Package Tracking) - Complements this feature
- **Components**:
  - `src/ui/components/UnlockToasts.tsx` - Similar toast pattern
  - `src/ui/components/BottomNav.tsx` - Navigation with badges

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Completion Notes List

- [x] MailToast component created
- [x] Badge integrated into BottomNav
- [x] Dealer assignment logic implemented
- [x] All 4 dealer names used
- [x] Unopened count working
- [x] Tests passing
- [x] Added distinct toast visual variants for letter/package/system
- [x] Restored weighted package delivery windows (10-20s, 20-60s, 60-120s)
- [x] Fixed package-arrived ID collisions for repeat purchases
- [x] Removed duplicate package polling from Mail tab to avoid double processing

### File List

- Created: `src/game/data/dealers.ts`
- Created: `src/game/selectors/mail.ts`
- Created: `src/game/selectors/mail.unit.test.ts`
- Created: `src/ui/components/MailToast.tsx`
- Created: `src/ui/components/MailToast.unit.test.tsx`
- Created: `src/ui/components/MailToastManager.tsx`
- Modified: `src/game/types.ts`
- Modified: `src/game/reducer.ts`
- Modified: `src/game/persistence.ts`
- Modified: `src/game/reducer.unit.test.ts`
- Modified: `src/game/selectors/index.ts`
- Modified: `src/ui/App.tsx`
- Modified: `src/ui/components/BottomNav.tsx`
- Modified: `src/ui/App.css`
- Modified: `src/ui/tabs/MailTab.tsx`
- Modified: `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Debug Log References

- Added dealer assignment source (`DEALERS`, `pickDealer`) for package purchases.
- Extended package delivery flow to enqueue mail toasts on arrival, including sender and watch preview data.
- Added mail toast UI stack with auto-dismiss and manual dismiss behavior.
- Switched unread badge rendering to red-dot numeric badge in bottom navigation.
- Added selector coverage and reducer delivery/toast coverage tests.

### Change Summary

- Package and letter notifications now use a dedicated toast flow with mail-type styling.
- Package sender is now one of Ethan, Jason007, Lena, or Michael Travis.
- Mail button now shows unread badge count as a visual indicator instead of inline text count.
- Mail selectors added (`unopenedMailCount`, `activeToasts`, `inboxItems`) and used by app shell.
- Verified with full Vitest suite: 36 files, 244 tests passing.
