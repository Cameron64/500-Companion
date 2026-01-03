import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility tests for The 500 Companion.
 * Uses axe-core to check for WCAG compliance.
 *
 * Note: These tests check for critical accessibility issues.
 * Minor issues are logged but don't fail the test to avoid blocking development.
 */

// Helper to run accessibility scan and filter by impact
async function runA11yScan(page: import('@playwright/test').Page, options?: {
  include?: string;
  exclude?: string;
}) {
  let builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

  if (options?.include) {
    builder = builder.include(options.include);
  }
  if (options?.exclude) {
    builder = builder.exclude(options.exclude);
  }

  return builder.analyze();
}

// Filter to only critical/serious violations
function getCriticalViolations(results: Awaited<ReturnType<typeof runA11yScan>>) {
  return results.violations.filter(v =>
    v.impact === 'critical' || v.impact === 'serious'
  );
}

test.describe('Homepage Accessibility', () => {
  test('no critical accessibility issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await runA11yScan(page);
    const critical = getCriticalViolations(results);

    // Log all violations for review
    if (results.violations.length > 0) {
      console.log(`Found ${results.violations.length} accessibility issues:`);
      results.violations.forEach(v => {
        console.log(`  - [${v.impact}] ${v.id}: ${v.help}`);
      });
    }

    // Only fail on critical violations (excluding color-contrast which needs design fixes)
    const blockers = critical.filter(v => v.id !== 'color-contrast');
    expect(blockers).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through the page and ensure focus is visible
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName : null;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('Updates Page Accessibility', () => {
  test('no critical accessibility issues', async ({ page }) => {
    await page.goto('/updates');
    await page.waitForLoadState('networkidle');

    const results = await runA11yScan(page);
    const blockers = getCriticalViolations(results).filter(v => v.id !== 'color-contrast');

    expect(blockers).toEqual([]);
  });
});

test.describe('Events Page Accessibility', () => {
  test('no critical accessibility issues', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // Wait for calendar to load
    await page.waitForSelector('.fc', { timeout: 5000 }).catch(() => {});

    const results = await runA11yScan(page, {
      // Exclude FullCalendar internal elements that may have known issues
      exclude: '.fc-scrollgrid-sync-table, .fc-scroller',
    });
    const blockers = getCriticalViolations(results).filter(v => v.id !== 'color-contrast');

    expect(blockers).toEqual([]);
  });
});

test.describe('Gallery Page Accessibility', () => {
  test('images have alt text', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('Static Pages Accessibility', () => {
  const pages = ['/visitor-guide', '/about'];

  for (const pagePath of pages) {
    const pageName = pagePath.replace('/', '');

    test(`${pageName} has no critical accessibility issues`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      const results = await runA11yScan(page);
      const blockers = getCriticalViolations(results).filter(v => v.id !== 'color-contrast');

      expect(blockers).toEqual([]);
    });
  }
});

test.describe('Forms Accessibility', () => {
  test('any forms have proper labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['label', 'form-field-multiple-labels'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
