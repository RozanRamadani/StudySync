import { test as base, Page } from '@playwright/test';

type UserFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<UserFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate and login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button:has-text("Masuk")');
    
    // Wait for redirect to calculator (protected route)
    await page.waitForURL('/calculator', { timeout: 10000 });
    
    await use(page); // Provide the authenticated page to the test
  },
});

export { expect } from '@playwright/test';
