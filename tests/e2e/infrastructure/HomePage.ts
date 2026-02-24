import { Page } from '@playwright/test';
import { GamePage } from './GamePage';

/**
 * Home tab page object.
 */
export class HomePage extends GamePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.clickTab('Home');
    await this.waitForLoad();
  }

  // Elements
  getTitle(): import('@playwright/test').Locator {
    return this.page.getByRole('heading', { name: 'Emily At Last' });
  }

  getCollectButton(): import('@playwright/test').Locator {
    return this.page.getByRole('button', { name: /Collect/i });
  }

  getEnjoymentDisplay(): import('@playwright/test').Locator {
    // Enjoyment is shown in a pill element with text "Enjoyment: X"
    return this.page.locator('span.pill').filter({ hasText: /Enjoyment:/ });
  }

  async clickCollect(): Promise<void> {
    await this.getCollectButton().click();
  }
}
