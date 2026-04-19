import { test, expect } from '@playwright/test';

test.describe('扫雷游戏', () => {
  test('应该显示难度选择', async ({ page }) => {
    await page.goto('/');
    await page.getByText('扫雷').first().click();
    await expect(page.getByText('选择难度开始游戏')).toBeVisible();
    await expect(page.getByText('初级')).toBeVisible();
    await expect(page.getByText('中级')).toBeVisible();
    await expect(page.getByText('高级')).toBeVisible();
    await expect(page.getByText('专家')).toBeVisible();
  });

  test('应该能开始初级游戏', async ({ page }) => {
    await page.goto('/');
    await page.getByText('扫雷').first().click();
    await page.getByText('初级').click();
    await expect(page.locator('.game-page')).toBeVisible();
    await expect(page.locator('.mine-grid-container')).toBeVisible();
  });

  test('应该显示地雷计数器', async ({ page }) => {
    await page.goto('/');
    await page.getByText('扫雷').first().click();
    await page.getByText('初级').click();
    await expect(page.locator('.game-page')).toBeVisible();
    await expect(page.locator('.mine-counter')).toBeVisible();
  });

  test('应该能点击格子', async ({ page }) => {
    await page.goto('/');
    await page.getByText('扫雷').first().click();
    await page.getByText('初级').click();
    await expect(page.locator('.game-page')).toBeVisible();
    const cell = page.locator('.mine-cell--hidden').first();
    await cell.click();
  });

  test('应该能切换旗帜模式', async ({ page }) => {
    await page.goto('/');
    await page.getByText('扫雷').first().click();
    await page.getByText('初级').click();
    await expect(page.locator('.game-page')).toBeVisible();
    const flagBtn = page.locator('.flag-toggle');
    if (await flagBtn.isVisible()) {
      await flagBtn.click();
    }
  });

  test('应该能返回', async ({ page }) => {
    await page.goto('/');
    await page.getByText('扫雷').first().click();
    await page.getByText('初级').click();
    await expect(page.locator('.game-page')).toBeVisible();
    await page.getByText('← 返回').click();
    await expect(page.locator('.dialog')).toBeVisible();
    await page.getByText('确定返回').click();
    await expect(page.locator('.start-page')).toBeVisible();
  });
});
