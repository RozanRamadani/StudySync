import { test, expect } from '../fixtures/auth.fixture';

test.describe('Calculator Page Features', () => {

  test('Render standard Input Parameters and Button', async ({ authenticatedPage: page }) => {
    await expect(page.locator('h2:has-text("Input Parameter")')).toBeVisible();
    await expect(page.locator('button:has-text("Hitung Durasi")')).toBeVisible();
    
    // Verify 3 range inputs exist
    const inputs = page.locator('input[type="range"]');
    await expect(inputs).toHaveCount(3);
  });

  test('Open and Discard Timer Modal prematurely', async ({ authenticatedPage: page }) => {
    await page.click('button:has-text("Hitung Durasi")');
    // Wait for the UI loading simulation to complete
    await page.waitForTimeout(3500);
    
    await page.click('button:has-text("Mulai Sesi Belajar")'); 
    
    // Timer text rendering
    await expect(page.locator('h2:has-text("Sesi Fokus")')).toBeVisible();

    // Close the Modal using 'X'
    const modalCloseBtn = page.locator('button', { has: page.locator('svg.lucide-x') }).first();
    await modalCloseBtn.click();
    
    await expect(page.locator('h2:has-text("Sesi Fokus")')).not.toBeVisible();
  });
});
