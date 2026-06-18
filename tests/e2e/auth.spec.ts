import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {

  test('Valid Login redirects to /calculator', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@studysync.local'); 
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Masuk")');
    
    await expect(page).toHaveURL('/calculator');
  });

  test('Invalid Login shows error toast', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@studysync.local');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Masuk")');
    
    const alert = page.locator('text="Invalid login credentials"');
    await expect(alert).toBeVisible();
  });

  test('Register with existing email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@studysync.local'); 
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Buat Akun")');
    
    const alert = page.locator('text="User already registered"');
    await expect(alert).toBeVisible();
  });

  test('Sign Out via Navbar', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@studysync.local');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Masuk")');
    await page.waitForURL('/calculator');

    // Click Sign Out
    await page.locator('button[aria-label="Keluar"]').click();
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('button[aria-label="Keluar"]')).not.toBeVisible();
  });

});
