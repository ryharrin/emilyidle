import { Page, Locator } from '@playwright/test';

/**
 * Base GamePage with common functionality for all game pages.
 */
export class GamePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async clickTab(tabName: 'Home' | 'Mail' | 'Collection' | 'Career' | 'Market'): Promise<void> {
    await this.page.getByRole('button', { name: tabName }).click();
  }

  // Wait for page to be fully loaded
  async waitForLoad(timeout = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  // Get toast messages
  getToasts(): Locator {
    return this.page.locator('[class*="toast"]');
  }

  // Check for error states
  async hasError(): Promise<boolean> {
    const errorText = await this.page.locator('[class*="error"]').count();
    return errorText > 0;
  }
}
