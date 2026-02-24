# E2E Testing Infrastructure

End-to-end tests that validate complete player journeys through the game using Playwright.

## Quick Start

### Running Tests

```bash
# Run all E2E tests
pnpm exec playwright test

# Run with UI
pnpm exec playwright test --ui

# Run specific file
pnpm exec playwright test tests/e2e/scenarios/example.spec.ts
```

### Creating New Tests

1. Create a new test file in `tests/e2e/scenarios/`
2. Import page objects from `../infrastructure/`
3. Use page objects to interact with the game

```typescript
import { test, expect } from '@playwright/test';
import { HomePage, MarketPage } from '../infrastructure';

test('Player can buy a watch', async ({ page }) => {
  const marketPage = new MarketPage(page);
  await marketPage.goto();
  
  // Buy first available watch
  await marketPage.getBuyButton('Seiko').click();
  
  // Verify purchase
  await expect(page.getByText('Owned')).toBeVisible();
});
```

## Page Objects

| Page | Description |
|------|-------------|
| `HomePage` | Home tab interactions |
| `MailPage` | Mail/inbox interactions |
| `CollectionPage` | Watch collection |
| `CareerPage` | Career progression |
| `MarketPage` | Watch purchasing |

## Test Structure

```
tests/e2e/
├── infrastructure/      # Page objects and utilities
│   ├── GamePage.ts     # Base class
│   ├── HomePage.ts
│   ├── MailPage.ts
│   ├── CollectionPage.ts
│   ├── CareerPage.ts
│   ├── MarketPage.ts
│   └── index.ts
├── scenarios/           # Test scenarios
│   └── example.spec.ts
└── README.md
```

## Best Practices

1. **Use page objects** - Abstract UI interactions into page objects
2. **One journey per test** - Keep tests focused
3. **Descriptive names** - `player_can_purchase_watch.spec.ts`
4. **Wait for conditions** - Use Playwright's auto-waiting
5. **Clean up state** - Each test should be independent

## Debugging

```bash
# Open UI to debug
pnpm exec playwright test --ui

# Show browser while running
pnpm exec playwright test --headed

# Debug specific test
pnpm exec playwright test tests/e2e/scenarios/example.spec.ts:10 --debug
```

## CI Integration

The Playwright config is already set up for CI:
- Runs on Chromium
- Retries failed tests 2x on CI
- Captures traces on first retry
- Takes screenshots on failure
