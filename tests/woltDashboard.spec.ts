import { test, expect } from './fixtures';
import { sampleOrderData } from './test-data/sampleData';

test.describe('Wolt Stats Dashboard', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test('initial page layout shown correctly', async ({ dashboardPage }) => {
    await test.step('verify page title and header', async () => {
      await expect(dashboardPage.page).toHaveTitle('Wolt Stats Dashboard');
      await expect(dashboardPage.header).toHaveText('Wolt Stats Dashboard');
      await expect(dashboardPage.welcomeHeading).toBeVisible();
    });

    await test.step('verify GitHub link', async () => {
      await expect(dashboardPage.githubLink).toBeVisible();
      await expect(dashboardPage.githubLink).toHaveAttribute('href', 'https://github.com/Marantle/wolt-stats');
    });
  });

  test('file upload area shows instructions', async ({ dashboardPage }) => {
    await test.step('verify file dropzone', async () => {
      await expect(dashboardPage.fileDropZone).toBeVisible();
      await expect(dashboardPage.privacyMessage).toBeVisible();
    });

    await test.step('verify file requirements are shown', async () => {
      await expect(dashboardPage.page.getByText('✓ File format: JSON')).toBeVisible();
      await expect(dashboardPage.page.getByText('✓ Contains complete order history')).toBeVisible();
      await expect(dashboardPage.page.getByText('✓ Filename: wolt_order_dump.json')).toBeVisible();
    });
  });

  test.describe('with sample data loaded', () => {
    test.beforeEach(async ({ dashboardPage }) => {
      await dashboardPage.loadSampleData(sampleOrderData);
    });

    test('displays stats cards with correct values', async ({ dashboardPage }) => {
      await test.step('verify stats cards are visible', async () => {
        await expect(dashboardPage.getStatsCard('Total Orders')).toBeVisible();
        await expect(dashboardPage.getStatsCard('Total Spent')).toBeVisible();
        await expect(dashboardPage.getStatsCard('Average Order Value')).toBeVisible();
        await expect(dashboardPage.getStatsCard('Longest Order Streak')).toBeVisible();
      });

      await test.step('verify stats values are correct', async () => {
        await dashboardPage.expectStatsCardValue('Total Orders', '1');
        await dashboardPage.expectStatsCardValue('Total Spent', '€25.90');
      });
    });

    test('privacy controls work correctly', async ({ dashboardPage }) => {
      await test.step('test item privacy toggle', async () => {
        // First verify original item names are visible
        const originalItems = await dashboardPage.getItemNames();
        expect(originalItems).toContain('Test Item 1');

        // Toggle privacy and verify items are anonymized
        await dashboardPage.toggleItemsVisibility();
        const anonymizedItems = await dashboardPage.getItemNames();
        expect(anonymizedItems).toContain('[Item 1]');

        // Toggle back and verify original names return
        await dashboardPage.toggleItemsVisibility();
        const restoredItems = await dashboardPage.getItemNames();
        expect(restoredItems).toContain('Test Item 1');
      });
    });
  });
});
