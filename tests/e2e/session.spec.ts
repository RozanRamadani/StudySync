import { test, expect } from '../fixtures/auth.fixture';

test.describe('Session Management & Status', () => {

  test('Save session while Online yields "Sesi Tersimpan" toast', async ({ authenticatedPage: page }) => {
    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);
    // Notification assertion
    const successToast = page.locator('text="Sesi Tersimpan"');
    await expect(successToast).toBeVisible();
  });

  test('Save offline yields "Gagal Menyimpan" (Sync failure) & validates Retry', async ({ authenticatedPage: page, context }) => {
    // Disconnect network via Playwright context
    await context.setOffline(true);
    
    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);
    
    const failToast = page.locator('text="Gagal Menyimpan"');
    await expect(failToast).toBeVisible();

    // Reconnect and trigger optimistic Retry
    await context.setOffline(false);
    await page.click('button:has-text("Coba Lagi")');
    
    const successToast = page.locator('text="Sesi Tersimpan"');
    await expect(successToast).toBeVisible();
  });

  test('Floating Inputs cleanly round to pure INTEGER before DB push', async ({ authenticatedPage: page }) => {
    let payloadRounded = false;
    
    await page.route('**/rest/v1/study_sessions*', route => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        expect(Number.isInteger(postData.focus)).toBeTruthy();
        expect(Number.isInteger(postData.fatigue)).toBeTruthy();
        payloadRounded = true;
      }
      route.continue();
    });

    // Simulate input modification
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="range"]');
      (inputs[0] as HTMLInputElement).value = '33.33';
      (inputs[0] as HTMLInputElement).dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);
    
    expect(payloadRounded).toBe(true);
  });

});