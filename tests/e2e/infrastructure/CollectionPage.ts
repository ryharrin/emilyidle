import { Page } from '@playwright/test';
import { GamePage } from './GamePage';

/**
 * Collection tab page object.
 */
export class CollectionPage extends GamePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.clickTab('Collection');
    await this.waitForLoad();
  }

  // Get watch cards
  getWatchCards(): import('@playwright/test').Locator {
    return this.page.getByRole('article');
  }

  // Check empty state
  async hasEmptyState(): Promise<boolean> {
    return await this.page.getByText(/no watches in your collection/i).count() > 0;
  }
}
