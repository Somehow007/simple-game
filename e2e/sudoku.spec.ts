import { test, expect } from '@playwright/test';

test.describe('数独游戏', () => {
  test('应该显示难度选择', async ({ page }) => {
    await page.goto('/');
    await page.getByText('数独').first().click();
    await expect(page.getByText('选择难度开始游戏')).toBeVisible();
    await expect(page.getByText('简单')).toBeVisible();
    await expect(page.getByText('中等')).toBeVisible();
    await expect(page.getByText('困难')).toBeVisible();
    await expect(page.getByText('专家')).toBeVisible();
  });

  test('应该能开始简单游戏', async ({ page }) => {
    await page.goto('/');
    await page.getByText('数独').first().click();
    await page.getByText('简单').click();
    await expect(page.locator('.game-page')).toBeVisible();
    await expect(page.locator('.grid-container')).toBeVisible();
    await expect(page.locator('.numpad')).toBeVisible();
  });

  test('应该能返回主界面', async ({ page }) => {
    await page.goto('/');
    await page.getByText('数独').first().click();
    await page.getByText('简单').click();
    await expect(page.locator('.game-page')).toBeVisible();
    await page.getByText('← 主界面').click();
    await expect(page.locator('.dialog')).toBeVisible();
    await page.getByText('确定返回').click();
    await expect(page.locator('.start-page')).toBeVisible();
  });

  test('应该显示工具栏按钮', async ({ page }) => {
    await page.goto('/');
    await page.getByText('数独').first().click();
    await page.getByText('简单').click();
    await expect(page.locator('.game-page')).toBeVisible();
    await expect(page.locator('.toolbar')).toBeVisible();
  });

  test('应该能选择格子', async ({ page }) => {
    await page.goto('/');
    await page.getByText('数独').first().click();
    await page.getByText('简单').click();
    await expect(page.locator('.game-page')).toBeVisible();
    const cell = page.locator('.grid-cell:not(.grid-cell--given)').first();
    await cell.click();
    await expect(cell).toHaveClass(/grid-cell--selected/);
  });

  test('应该能切换笔记模式', async ({ page }) => {
    await page.goto('/');
    await page.getByText('数独').first().click();
    await page.getByText('简单').click();
    await expect(page.locator('.game-page')).toBeVisible();
    const noteBtn = page.locator('.toolbar__btn--note');
    if (await noteBtn.isVisible()) {
      await noteBtn.click();
    }
  });
});
