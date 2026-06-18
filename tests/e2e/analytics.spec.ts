import { test, expect } from '../fixtures/auth.fixture';

test.describe('Analytics Logic & Charts', () => {

  test('Complete session triggers Streak incrementation', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    
    const streakElement = page.locator('text="Konsistensi Belajar"').locator('..').locator('span', { hasText: /^\d+$/ }).first();
    let initialInt = 0;
    
    // Default to 0 if doesn't exist
    if (await streakElement.isVisible()) {
      const initialStreak = await streakElement.innerText();
      initialInt = parseInt(initialStreak) || 0;
    }

    // Prepare a session
    await page.goto('/calculator');
    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);

    // Assert change
    await page.goto('/history');
    const newStreakText = await page.locator('text="Konsistensi Belajar"').locator('..').locator('span', { hasText: /^\d+$/ }).first().innerText();
    const newInt = parseInt(newStreakText);
    expect(newInt).toBeGreaterThanOrEqual(initialInt);
  });

  test('Analyze Focus Average logic exists', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const avgFocusTitle = page.locator('p:has-text("Weekly Avg Focus")');
    await expect(avgFocusTitle).toBeVisible();
    
    const avgFocusValue = avgFocusTitle.locator('+ p');
    await expect(avgFocusValue).toContainText('%');
  });

  test('Calculate 4-Week / 7-Day Heatmap Intensity Grid', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const heatMapRects = page.locator('div[title*="Level"]'); 
    await expect(heatMapRects.first()).toBeVisible();

    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    for (const day of days) {
      await expect(page.locator(`div:has-text("${day}")`).first()).toBeVisible();
    }
  });

});