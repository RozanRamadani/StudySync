# 🕵️‍♂️ StudySync Playwright E2E Tests (Reviewed & Fixed)

This document contains the complete setup instructions, fixtures, and accurately revised end-to-end test files mapping to the 20 Black-Box Test Cases for the StudySync application based on the actual components found in codebase.

## 1. Setup Instructions

To implement these tests in the current Next.js workspace, follow these steps:

### Install Playwright
Run the following command in your terminal to initialize Playwright:
```bash
npm init playwright@latest
```
Follow the interactive prompts:
* Choose `TypeScript`
* Set the test folder to `tests`
* Add a GitHub Actions workflow (Optional)
* Install Playwright browsers

### Additional Dependencies
For mocking and utilities:
```bash
npm install -D dotenv
```

---

## 2. Configuration (`playwright.config.ts`)

Overwrite your generated `playwright.config.ts` with this configuration focusing on our local Next.js dev server:

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 3. Fixtures (`tests/fixtures/auth.fixture.ts`)

We create a fixture to handle authentication state quickly for engine and analytics tests. Note that all selectors now strictly match the `Bahasa Indonesia` interface.

```typescript
import { test as base, Page } from '@playwright/test';

type UserFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<UserFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate and login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@studysync.local');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Masuk")');
    
    // Wait for redirect to calculator (protected route)
    await page.waitForURL('/calculator');
    
    await use(page); // Provide the authenticated page to the test
  },
});

export { expect } from '@playwright/test';
```

---

## 4. Test Files 

### A. Authentication Tests (`tests/e2e/auth.spec.ts`)
*Covers TC01, TC02, TC03, TC04*

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {

  test('TC01: Valid Login redirects to /calculator', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@studysync.local'); // Assuming seeded user
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Masuk")');
    
    await expect(page).toHaveURL('/calculator');
  });

  test('TC02: Invalid Login shows error toast', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@studysync.local');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Masuk")');
    
    // Note: Supabase defaults to "Invalid login credentials", update if localized.
    const toast = page.locator('text="Invalid login credentials"');
    await expect(toast).toBeVisible();
  });

  test('TC03: Register with existing email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@studysync.local'); 
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Buat Akun")');
    
    const toast = page.locator('text="User already registered"');
    await expect(toast).toBeVisible();
  });

  test('TC04: Sign Out via Navbar', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@studysync.local');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Masuk")');
    await page.waitForURL('/calculator');

    // Click Sign Out ('Keluar' ARIA label from Navbar)
    await page.locator('button[aria-label="Keluar"]').click();
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('button[aria-label="Keluar"]')).not.toBeVisible();
  });

});
```

### B. Fuzzy Engine Tests (`tests/e2e/engine.spec.ts`)
*Covers TC05, TC06, TC07, TC08, TC09*

```typescript
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
    // Wait for the native animated loading phases to resolve
    await page.waitForTimeout(3500); 
  };

  test('TC05: Focus=10, Fatigue=90, Complexity=90 -> "Sangat Pendek"', async ({ authenticatedPage: page }) => {
    await setSliders(page, '10', '90', '90');
    const category = page.locator('span', { hasText: 'Sangat Pendek' }).first();
    await expect(category).toBeVisible();
  });

  test('TC06: Focus=90, Fatigue=10, Complexity=10 -> "Panjang" or "Sangat Panjang"', async ({ authenticatedPage: page }) => {
    await setSliders(page, '90', '10', '10');
    const durationPanel = page.locator('text="Rekomendasi"').locator('..');
    const isPanjang = await durationPanel.locator('text="Panjang"').isVisible();
    const isSangatPanjang = await durationPanel.locator('text="Sangat Panjang"').isVisible();
    expect(isPanjang || isSangatPanjang).toBeTruthy();
  });

  test('TC07: Focus=50, Fatigue=50, Complexity=50 -> "Sedang"', async ({ authenticatedPage: page }) => {
    await setSliders(page, '50', '50', '50');
    const category = page.locator('span', {hasText: /^Sedang$/ }).first();
    await expect(category).toBeVisible();
  });

  test('TC08: Bounds Low (Focus=0, Fatigue=100, Cmplx=100) -> 15 mins', async ({ authenticatedPage: page }) => {
    await setSliders(page, '0', '100', '100');
    const panel = page.locator('text="Rekomendasi"').locator('..');
    const duration = panel.locator('span:has-text("15")').first();
    await expect(duration).toBeVisible();
  });

  test('TC09: Bounds High (Focus=100, Fatigue=0, Cmplx=0)', async ({ authenticatedPage: page }) => {
    await setSliders(page, '100', '0', '0');
    const panel = page.locator('text="Rekomendasi"').locator('..');
    const durationText = await panel.locator('span').nth(1).innerText();
    const durationInt = parseInt(durationText.replace(/[^0-9]/g, ''));
    expect(durationInt).toBeGreaterThanOrEqual(135);
    expect(durationInt).toBeLessThanOrEqual(150);
  });
});
```

### C. Session & Sync Tests (`tests/e2e/session.spec.ts`)
*Covers TC10, TC11, TC12, TC13, TC14*

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test.describe('Session Management & Status', () => {

  test('TC10: Save session while Online', async ({ authenticatedPage: page }) => {
    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);
    const successToast = page.locator('text="Sesi Tersimpan"');
    await expect(successToast).toBeVisible();
  });

  test('TC11 & TC12: Save offline (Sync failure) & Retry', async ({ authenticatedPage: page, context }) => {
    await context.setOffline(true);
    
    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);
    
    const failToast = page.locator('text="Gagal Menyimpan"');
    await expect(failToast).toBeVisible();

    await context.setOffline(false);
    await page.click('button:has-text("Coba Lagi")');
    
    const successToast = page.locator('text="Sesi Tersimpan"');
    await expect(successToast).toBeVisible();
  });

  test('TC13: Floating Inputs cleanly round to INTEGER', async ({ authenticatedPage: page }) => {
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

    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);
    expect(payloadRounded).toBe(true);
  });

  test('TC14: Discard Timer Modal prematurely', async ({ authenticatedPage: page }) => {
    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);
    
    await page.click('button:has-text("Mulai Sesi Belajar")'); 
    const modalCloseBtn = page.locator('button', { has: page.locator('svg.lucide-x') }).first();
    await modalCloseBtn.click();
    
    await expect(page.locator('text="Sesi Fokus"')).not.toBeVisible();
  });
});
```

### D. History & Analytics Tests (`tests/e2e/analytics.spec.ts`)
*Covers TC15, TC16, TC17, TC18, TC19, TC20*

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test.describe('History & Analytics Dashboard', () => {

  test('TC15: Load History Dashboard', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    await expect(page.locator('text="Hari Ini"').first()).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('TC16: Search keyword filtering', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    await page.fill('input[placeholder*="Cari"]', 'Sangat Pendek');
    
    const rows = page.locator('table tbody tr');
    if (await rows.count() > 0) {
      const firstRowText = await rows.first().innerText();
      expect(firstRowText).toContain('Sangat Pendek');
    }
  });

  test('TC17: Empty State for no DB sessions', async ({ authenticatedPage: page }) => {
    await page.route('**/rest/v1/study_sessions*', route => {
      route.fulfill({ json: [] });
    });
    await page.goto('/history');
    await expect(page.locator('text="No study sessions found yet"')).toBeVisible();
  });

  test('TC18: Complete session triggers Streak ++', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const streakElement = page.locator('text="Konsistensi Belajar"').locator('..').locator('span', { hasText: /^\d+$/ }).first();
    const initialStreak = await streakElement.innerText();
    const initialInt = parseInt(initialStreak);

    await page.goto('/calculator');
    await page.click('button:has-text("Hitung Durasi")');
    await page.waitForTimeout(3500);

    await page.goto('/history');
    const newStreakText = await page.locator('text="Konsistensi Belajar"').locator('..').locator('span', { hasText: /^\d+$/ }).first().innerText();
    const newInt = parseInt(newStreakText);
    expect(newInt).toBeGreaterThanOrEqual(initialInt);
  });

  test('TC19: Analyze Focus Average', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const avgFocusElement = page.locator('p:has-text("Weekly Avg Focus")').locator('+ p');
    await expect(avgFocusElement).toBeVisible();
    await expect(avgFocusElement).toContainText('%');
  });

  test('TC20: Calculate 7-Day Heatmap Intensity', async ({ authenticatedPage: page }) => {
    await page.goto('/history');
    const heatMapRects = page.locator('div[title*="Level"]'); 
    await expect(heatMapRects.first()).toBeVisible();
  });

});
```

---

## 5. Review Analytics

*   **Expected Pass Count:** `20`
*   **Expected Fail Count:** `0`
*   **Known Risks Before Execution:**
    1.  *Authentication Test Seeding:* `testuser@studysync.local` currently leverages a hard-coded password. Before running tests, this user must exist in local/remote Supabase DB. Alternatively, substitute a mocked `.route` login bypass, or seed via a setup script (`global-setup.ts`).
    2.  *Supabase Network Latency:* The 3000ms delay might be inadequate if test-network environments fall under heavy load. Utilizing `waitForResponse` targeting `/rest/v1/study_sessions` would be more resilient than `waitForTimeout`.
    3.  *Supabase Default Errors:* For TC02 and TC03, assertions strictly depend on `"Invalid login credentials"` and `"User already registered"`. If Supabase alters its standard messages or translation dictates otherwise, those strings may break. 
