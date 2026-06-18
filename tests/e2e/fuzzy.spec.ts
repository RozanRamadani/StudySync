import { test, expect } from '../fixtures/auth.fixture';

test.describe('Fuzzy Logic Engine', () => {

  const setSliders = async (page: any, focus: string, fatigue: string, complexity: string) => {
    // Setting native range sliders requires evaluating scripts or keypresses.
    await page.evaluate(({ f, fa, c }) => {
      const inputs = document.querySelectorAll('input[type="range"]');
      (inputs[0] as HTMLInputElement).value = f;
      (inputs[0] as HTMLInputElement).dispatchEvent(new Event('change', { bubbles: true }));
      (inputs[1] as HTMLInputElement).value = fa;
      (inputs[1] as HTMLInputElement).dispatchEvent(new Event('change', { bubbles: true }));
      (inputs[2] as HTMLInputElement).value = c;
      (inputs[2] as HTMLInputElement).dispatchEvent(new Event('change', { bubbles: true }));
    }, { f: focus, fa: fatigue, c: complexity });
    
    await page.click('button:has-text("Hitung Durasi")');
    // Wait for the loading animation steps to complete
    await page.waitForTimeout(3500); 
  };

  test('Focus=10, Fatigue=90, Complexity=90 -> "Sangat Pendek"', async ({ authenticatedPage: page }) => {
    await setSliders(page, '10', '90', '90');
    const category = page.locator('span', { hasText: 'Sangat Pendek' }).first();
    await expect(category).toBeVisible();
  });

  test('Focus=90, Fatigue=10, Complexity=10 -> "Panjang" or "Sangat Panjang"', async ({ authenticatedPage: page }) => {
    await setSliders(page, '90', '10', '10');
    const durationPanel = page.locator('text="Rekomendasi"').locator('..');
    const isPanjang = await durationPanel.locator('text="Panjang"').isVisible();
    const isSangatPanjang = await durationPanel.locator('text="Sangat Panjang"').isVisible();
    expect(isPanjang || isSangatPanjang).toBeTruthy();
  });

  test('Focus=50, Fatigue=50, Complexity=50 -> "Sedang"', async ({ authenticatedPage: page }) => {
    await setSliders(page, '50', '50', '50');
    const category = page.locator('span', {hasText: /^Sedang$/ }).first();
    await expect(category).toBeVisible();
  });

  test('Bounds Low (Focus=0, Fatigue=100, Cmplx=100) -> 15 mins', async ({ authenticatedPage: page }) => {
    await setSliders(page, '0', '100', '100');
    const panel = page.locator('text="Rekomendasi"').locator('..');
    const duration = panel.locator('span:has-text("15")').first();
    await expect(duration).toBeVisible();
  });

  test('Bounds High (Focus=100, Fatigue=0, Cmplx=0)', async ({ authenticatedPage: page }) => {
    await setSliders(page, '100', '0', '0');
    // Bounded safely ~135-150m
    const panel = page.locator('text="Rekomendasi"').locator('..');
    const durationText = await panel.locator('span').nth(1).innerText();
    const durationInt = parseInt(durationText.replace(/[^0-9]/g, ''));
    expect(durationInt).toBeGreaterThanOrEqual(135);
    expect(durationInt).toBeLessThanOrEqual(150);
  });
});
