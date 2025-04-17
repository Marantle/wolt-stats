import { test as base } from '@playwright/test';
import { WoltDashboardPage } from './pages/WoltDashboardPage';

// Declare the types of fixtures
type Fixtures = {
  dashboardPage: WoltDashboardPage;
};

// Extend the base test with our fixtures
export const test = base.extend<Fixtures>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new WoltDashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect } from '@playwright/test';