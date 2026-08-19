import { test, expect } from '@playwright/test';

test.describe('App loads', () => {
  test('loads the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Github AI Web Forge')).toBeVisible();
  });

  test('has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });
});

test.describe('Explorer view', () => {
  test('shows content and layout sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Content')).toBeVisible();
    await expect(page.locator('text=Layout')).toBeVisible();
  });

  test('shows empty state message', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Generate universes in the Studio')).toBeVisible();
  });

  test('has Edit Mode button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button:has-text("Edit Mode")')).toBeVisible();
  });

  test('toggles edit mode', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Edit Mode")');
    await expect(page.locator('button:has-text("Explorer")')).toBeVisible();
  });

  test('has iframe preview', async ({ page }) => {
    await page.goto('/');
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
  });
});

test.describe('URL sync', () => {
  test('preserves query params', async ({ page }) => {
    await page.goto('/');
    const url = new URL(page.url());
    expect(url.searchParams.has('p')).toBe(true);
    expect(url.searchParams.has('l')).toBe(true);
  });
});

test.describe('Settings persistence', () => {
  test('stores explorer state in localStorage', async ({ page }) => {
    await page.goto('/');
    const state = await page.evaluate(() => {
      return localStorage.getItem('random-web:explorer.state');
    });
    expect(state).toBeTruthy();
  });
});
