import { test, expect } from '@playwright/test';

test.describe('首页', () => {
  test('应该显示应用标题和游戏选择', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('益智游戏合集');
    await expect(page.getByText('数独')).toBeVisible();
    await expect(page.getByText('扫雷')).toBeVisible();
  });

  test('应该能导航到数独开始页', async ({ page }) => {
    await page.goto('/');
    await page.getByText('数独').first().click();
    await expect(page.locator('.start-page__title')).toHaveText('数独');
  });

  test('应该能导航到扫雷开始页', async ({ page }) => {
    await page.goto('/');
    await page.getByText('扫雷').first().click();
    await expect(page.locator('.start-page__title')).toHaveText('扫雷');
  });

  test('应该能导航到设置页', async ({ page }) => {
    await page.goto('/');
    await page.getByText('设置').click();
    await expect(page.locator('h2')).toHaveText('设置');
  });

  test('应该能导航到统计页', async ({ page }) => {
    await page.goto('/');
    await page.getByText('统计').click();
    await expect(page.locator('h2')).toHaveText('📊 游戏统计');
  });
});
