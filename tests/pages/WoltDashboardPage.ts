import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WoltDashboardPage {
  readonly page: Page;
  readonly header: Locator;
  readonly welcomeHeading: Locator;
  readonly githubLink: Locator;
  readonly fileDropZone: Locator;
  readonly fileInput: Locator;
  readonly privacyMessage: Locator;
  readonly favoriteItemsTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('h1.text-3xl.font-bold').first();
    this.welcomeHeading = page.getByRole('heading', { name: 'Welcome to Wolt Stats Dashboard' });
    this.githubLink = page.getByTitle('View on GitHub');
    this.fileDropZone = page.locator('[data-testid="dropzone"]');
    this.fileInput = page.locator('[data-testid="file-input"]');
    this.privacyMessage = page.getByText('🔒 For your privaty, the data stays in your browser');
    // Target favorite items table by its heading
    this.favoriteItemsTable = page.locator('div').filter({ hasText: 'Favorite Items' }).first();
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async loadSampleData(data: any) {
    const tempFilePath = path.join(__dirname, '../test-data/temp-sample.json');
    
    try {
      // Ensure the directory exists
      const dir = path.dirname(tempFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the sample data
      fs.writeFileSync(tempFilePath, JSON.stringify(data), 'utf8');

      // Wait for file input to be ready
      await this.fileInput.waitFor({ state: 'attached' });

      // Upload file
      await this.fileInput.setInputFiles(tempFilePath);

      // Wait for welcome message to disappear
      await this.welcomeHeading.waitFor({ state: 'detached' });

      // Wait for stats cards to appear
      const totalOrdersCard = this.getStatsCard('Total Orders');
      await totalOrdersCard.waitFor({ state: 'visible' });

      // Wait for favorite items table to be visible
      await this.favoriteItemsTable.waitFor({ state: 'visible' });

    } finally {
      // Clean up
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }

  getStatsCard(title: string): Locator {
    return this.page.locator(`[data-testid="stats-card-${title.toLowerCase().replace(/\s+/g, '-')}"]`);
  }

  async expectStatsCardValue(title: string, expectedValue: string | number) {
    const card = this.getStatsCard(title);
    await card.waitFor({ state: 'visible' });
    await expect(card.locator('[data-testid="stats-card-value"]')).toHaveText(String(expectedValue));
  }

  async toggleItemsVisibility() {
    // Find the Hide/Show Items button by its current text
    const hideItemsButton = this.page.getByRole('button', { 
      name: /^(Hide|Show) Items$/
    });
    await hideItemsButton.waitFor({ state: 'visible' });
    await hideItemsButton.click();

    // Wait for item names to update in the favorites table
    const tableRows = this.favoriteItemsTable.locator('table tbody tr');
    await tableRows.first().waitFor({ state: 'visible' });
  }

  async getItemNames(): Promise<string[]> {
    const rows = this.favoriteItemsTable.locator('table tbody tr');
    const items: string[] = [];
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const itemCell = rows.nth(i).locator('td').first();
      items.push(await itemCell.textContent() || '');
    }
    return items;
  }
}