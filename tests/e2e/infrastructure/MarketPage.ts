import { Page } from '@playwright/test';
import { GamePage } from './GamePage';

/**
 * Market tab page object.
 */
export class MarketPage extends GamePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.clickTab('Market');
    await this.waitForLoad();
  }

  // Get all watch articles
  getWatchArticles(): import('@playwright/test').Locator {
    return this.page.getByRole('article');
  }

  // Get buy button for a specific watch
  getBuyButton(watchName: string): import('@playwright/test').Locator {
    return this.page.getByRole('article').filter({ hasText: watchName }).getByRole('button', { name: /Buy/i });
  }

  // Get price display
  getPriceForWatch(watchName: string): import('@playwright/test').Locator {
    return this.page.getByRole('article').filter({ hasText: watchName }).locator('[class*="price"]');
  }
}
