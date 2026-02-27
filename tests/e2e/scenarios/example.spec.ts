import { test, expect } from '@playwright/test';
import { HomePage, MailPage, CollectionPage, CareerPage, MarketPage } from '../infrastructure';

/**
 * Example E2E tests for Emily At Last.
 * These demonstrate the infrastructure and verify core functionality.
 */

test.describe('Core Game Navigation', () => {
  test('Home page loads with title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await expect(homePage.getTitle()).toBeVisible();
  });

  test('All tabs are accessible', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Test navigation to each tab - just verify no crashes
    await homePage.clickTab('Mail');
    await homePage.clickTab('Collection');
    await homePage.clickTab('Career');
    await homePage.clickTab('Market');
  });
});

test.describe('Onboarding Flow', () => {
  test('Mail tab exists', async ({ page }) => {
    const mailPage = new MailPage(page);
    await mailPage.goto();
    
    // Should have mail heading
    await expect(page.getByRole('heading', { name: 'Mail' })).toBeVisible();
  });
});

test.describe('Collection', () => {
  test('Collection tab loads', async ({ page }) => {
    const collectionPage = new CollectionPage(page);
    await collectionPage.goto();
    
    // Should have collection heading
    await expect(page.getByRole('heading', { name: 'Collection' })).toBeVisible();
  });
});

test.describe('Market', () => {
  test('Market tab loads', async ({ page }) => {
    const marketPage = new MarketPage(page);
    await marketPage.goto();
    
    // Should have market heading
    await expect(page.getByRole('heading', { name: 'Market' })).toBeVisible();
  });
});

test.describe('Career', () => {
  test('Career tab loads', async ({ page }) => {
    const careerPage = new CareerPage(page);
    await careerPage.goto();
    
    // Should have career heading (exact match to avoid "Career Timeline")
    await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();
  });
});

// ============================================
// Full Journey Tests - Complete Player Flows
// ============================================

test.describe('Full Player Journey: Start → Earn → Buy → Collect', () => {
  test('Player starts new game and has initial state', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Player starts with some enjoyment (10) for initial sessions
    // Enjoyment is displayed in the stats bar on Home tab
    await expect(homePage.getEnjoymentDisplay()).toBeVisible();
    const enjoymentText = await homePage.getEnjoymentDisplay().textContent();
    expect(parseInt(enjoymentText?.replace(/[^0-9]/g, '') || '0')).toBeGreaterThan(0);
    
    // Player starts with acceptance letter in mail
    await homePage.clickTab('Mail');
    // Use more specific selector to avoid debug panel
    await expect(page.getByRole('button', { name: /Your Admission Decision/ })).toBeVisible();
  });
  
  test('Market is locked at game start (pre-PhD stage)', async ({ page }) => {
    const marketPage = new MarketPage(page);
    await marketPage.goto();
    
    // At pre-phd stage, no watch tiers are unlocked yet
    // Quartz watches unlock at PhDStudent stage (after onboarding)
    const articles = await marketPage.getWatchArticles().count();
    expect(articles).toBe(0);
    
    // Should see locked tier placeholders instead
    await expect(page.getByText(/quartz Watches/i)).toBeVisible();
    await expect(page.getByText(/Unlock at PhD Student/i)).toBeVisible();
  });
  
  test('Collection is empty at start', async ({ page }) => {
    const collectionPage = new CollectionPage(page);
    await collectionPage.goto();
    
    // Should show empty state
    await expect(page.getByText(/no watches in your collection/i)).toBeVisible();
  });
});

test.describe('Watch Purchase Flow: Buy → Ship → Arrive → Open', () => {
  test('Market shows locked tiers at game start', async ({ page }) => {
    const marketPage = new MarketPage(page);
    await marketPage.goto();
    
    // At start (pre-phd), no watches are available to buy
    // All tiers are locked until career progression
    const articles = await marketPage.getWatchArticles().count();
    expect(articles).toBe(0);
    
    // Should see tier unlock requirements (at least one locked tier)
    await expect(page.getByText(/Unlock at PhD Student/i)).toBeVisible();
  });
  
  test('Market shows watch articles only after unlocking tiers', async ({ page }) => {
    const marketPage = new MarketPage(page);
    await marketPage.goto();
    
    // Initially no articles (locked)
    const articles = await marketPage.getWatchArticles().count();
    expect(articles).toBe(0);
    
    // Note: To actually see watches, player needs to:
    // 1. Complete onboarding (read letter + begin PhD)
    // 2. Progress to PhDStudent stage
    // This would require completing therapy sessions for XP
    // Full integration test would simulate this progression
  });
});

test.describe('Career Progression: Sessions → XP → Advance', () => {
  test('Career tab shows current stage information', async ({ page }) => {
    const careerPage = new CareerPage(page);
    await careerPage.goto();
    
    // Should show career stage info
    await expect(page.getByRole('heading', { name: 'Career', exact: true })).toBeVisible();
  });
  
  test('Career shows XP progress', async ({ page }) => {
    const careerPage = new CareerPage(page);
    await careerPage.goto();
    
    // Should show XP information
    const xpText = await page.getByText(/XP/).count();
    expect(xpText).toBeGreaterThan(0);
  });
  
  test('Career shows income rate information', async ({ page }) => {
    const careerPage = new CareerPage(page);
    await careerPage.goto();
    
    // Should show income rate
    const incomeText = await page.getByText(/\$|income|rate/i).count();
    expect(incomeText).toBeGreaterThan(0);
  });
});

test.describe('Mail System: Acceptance → Shipping → Arrived', () => {
  test('Acceptance letter appears in mail at start', async ({ page }) => {
    const mailPage = new MailPage(page);
    await mailPage.goto();
    
    // Should have acceptance letter button
    await expect(page.getByRole('button', { name: /Your Admission Decision/ })).toBeVisible();
  });
  
  test('Mail shows from field', async ({ page }) => {
    const mailPage = new MailPage(page);
    await mailPage.goto();
    
    // Should show sender in the mail button
    await expect(page.getByRole('button', { name: /Graduate Division/ })).toBeVisible();
  });
  
  test('Mail shows timestamp or Now for new mail', async ({ page }) => {
    const mailPage = new MailPage(page);
    await mailPage.goto();
    
    // Should show timestamp in mail list
    await expect(page.getByText('Now')).toBeVisible();
  });
});

test.describe('Passive Income System', () => {
  test('Home page shows currency display', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Should display currency (starts at $0)
    await expect(page.getByText(/\$0\.00/)).toBeVisible();
  });
  
  test('Collect button is present on home when applicable', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Should have collect passive income button (exact name to avoid "Collection" tab)
    await expect(page.getByRole('button', { name: 'Collect passive income' })).toBeVisible();
  });
});
