import { Page } from '@playwright/test';
import { GamePage } from './GamePage';

/**
 * Career tab page object.
 */
export class CareerPage extends GamePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.clickTab('Career');
    await this.waitForLoad();
  }

  // Get start session button
  getStartSessionButton(): import('@playwright/test').Locator {
    return this.page.getByRole('button', { name: /Start Session/i });
  }

  // Check if session is available
  async isSessionAvailable(): Promise<boolean> {
    const button = this.getStartSessionButton();
    return await button.isEnabled();
  }
}
