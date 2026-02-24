import { Page } from '@playwright/test';
import { GamePage } from './GamePage';

/**
 * Mail tab page object.
 */
export class MailPage extends GamePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.clickTab('Mail');
    await this.waitForLoad();
  }

  // Get all mail items
  getMailItems(): import('@playwright/test').Locator {
    return this.page.locator('[class*="mail"] button');
  }

  // Get first unread mail item
  async clickFirstUnreadMail(): Promise<void> {
    const unread = this.page.locator('[class*="mail"] button').filter({ has: this.page.locator('[class*="unread"]') });
    await unread.first().click();
  }

  // Check if acceptance letter is present
  async hasAcceptanceLetter(): Promise<boolean> {
    return await this.page.getByText(/Your Admission Decision/).count() > 0;
  }
}
