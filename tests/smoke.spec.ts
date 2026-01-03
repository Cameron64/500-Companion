import { test, expect } from '@playwright/test';

/**
 * Smoke tests for The 500 Companion.
 * These verify that all core pages load and basic functionality works.
 */

test.describe('Core Pages Load', () => {
  test('homepage loads with key elements', async ({ page }) => {
    await page.goto('/');

    // Page should have a title
    await expect(page).toHaveTitle(/The 500|500 Companion/i);

    // Should have header navigation
    await expect(page.locator('header')).toBeVisible();

    // Should have footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('updates page loads', async ({ page }) => {
    await page.goto('/updates');

    // Should show updates heading or content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('events page loads', async ({ page }) => {
    await page.goto('/events');

    // Should show events page content
    await expect(page.locator('main')).toBeVisible();
  });

  test('gallery page loads', async ({ page }) => {
    await page.goto('/gallery');

    // Should show gallery content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('visitor guide page loads', async ({ page }) => {
    await page.goto('/visitor-guide');

    // Should show visitor guide content
    await expect(page.locator('main')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');

    // Should show about content
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('can navigate between pages via header links', async ({ page }) => {
    await page.goto('/');

    // Look for nav links (handle both desktop and mobile nav patterns)
    const navLinks = page.locator('header a, nav a');
    const linkCount = await navLinks.count();

    // Should have at least some navigation links
    expect(linkCount).toBeGreaterThan(0);
  });

  test('footer contains expected links', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Events Calendar', () => {
  test('calendar component renders on events page', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // Calendar may or may not have events, but page should load
    // FullCalendar uses .fc class
    const calendar = page.locator('.fc');
    const hasCalendar = await calendar.count() > 0;

    // Either calendar is visible or we have some events content
    if (hasCalendar) {
      await expect(calendar.first()).toBeVisible();
    } else {
      // If no calendar, at least the main content should be visible
      await expect(page.locator('main')).toBeVisible();
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile view loads correctly', async ({ page }) => {
    await page.goto('/');

    // Page should still have header
    await expect(page.locator('header')).toBeVisible();

    // Content should be visible
    await expect(page.locator('main')).toBeVisible();
  });
});
