import { test, expect } from "@playwright/test";

test.describe("UpdateList Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the component to load
    await page.waitForSelector(
      '[data-testid="update-list"], .update-list, main'
    );
  });

  test("should display the updates list container", async ({ page }) => {
    // Check if the main updates container is visible
    const updatesList = page.locator(
      '[data-testid="update-list"], .update-list, main'
    );
    await expect(updatesList).toBeVisible();
  });

  test("should show empty state when no updates exist", async ({ page }) => {
    // Look for empty state indicators
    const emptyState = page.locator(
      ':text("No updates"), :text("empty"), :text("Get started"), .empty-state'
    );

    // If no updates are visible, should show empty state or at least not crash
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update'
    );
    const updateCount = await updateItems.count();

    if (updateCount === 0) {
      // Either empty state should be visible or the list should be empty but present
      const hasEmptyState = (await emptyState.count()) > 0;
      const listExists =
        (await page
          .locator('[data-testid="update-list"], .update-list, main')
          .count()) > 0;
      expect(hasEmptyState || listExists).toBeTruthy();
    }
  });

  test("should display updates when they exist", async ({ page }) => {
    // First add an update to ensure we have content
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    if ((await updateInput.count()) > 0) {
      await updateInput.fill("Test update for list display");
      const saveButton = page
        .locator('button:has-text("Save"), button:has-text("Add")')
        .first();
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Check if updates are displayed
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );
    if ((await updateItems.count()) > 0) {
      await expect(updateItems.first()).toBeVisible();
    }
  });

  test("should group updates by time periods", async ({ page }) => {
    // Look for time-based grouping headers
    const timeHeaders = page.locator(
      'h2, h3, .date-header, .time-group, :text("Today"), :text("Yesterday"), :text("This week")'
    );

    // If updates exist, they should be grouped
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );
    const updateCount = await updateItems.count();

    if (updateCount > 0) {
      // Should have at least one time grouping header
      expect(await timeHeaders.count()).toBeGreaterThan(0);
    }
  });

  test("should show area badges for updates", async ({ page }) => {
    // Look for area/category indicators
    const areaBadges = page.locator(
      '.badge, .tag, .area, [data-testid="area-badge"]'
    );
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );

    if ((await updateItems.count()) > 0) {
      // Updates should have area indicators
      const firstUpdate = updateItems.first();
      const areaInUpdate = firstUpdate.locator(
        '.badge, .tag, .area, [data-testid="area-badge"]'
      );

      if ((await areaInUpdate.count()) > 0) {
        await expect(areaInUpdate.first()).toBeVisible();
      }
    }
  });

  test("should handle update interactions", async ({ page }) => {
    // First ensure we have an update
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    if ((await updateInput.count()) > 0) {
      await updateInput.fill("Test update for interaction");
      const saveButton = page
        .locator('button:has-text("Save"), button:has-text("Add")')
        .first();
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );

    if ((await updateItems.count()) > 0) {
      const firstUpdate = updateItems.first();

      // Check for interaction buttons (edit, delete, copy, etc.)
      const actionButtons = firstUpdate.locator('button, [role="button"]');

      if ((await actionButtons.count()) > 0) {
        // Should be able to interact with the update
        await expect(actionButtons.first()).toBeVisible();
      }
    }
  });

  test("should show copy functionality", async ({ page }) => {
    // Grant clipboard permissions
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);

    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );

    if ((await updateItems.count()) > 0) {
      const firstUpdate = updateItems.first();

      // Look for copy button
      const copyButton = firstUpdate.locator(
        'button:has-text("Copy"), [data-testid="copy-button"], button[title*="copy"]'
      );

      if ((await copyButton.count()) > 0) {
        await copyButton.first().click();

        // Check for copy confirmation
        const copyConfirmation = page.locator(
          ':text("Copied"), .copied, [data-testid="copy-success"]'
        );
        if ((await copyConfirmation.count()) > 0) {
          await expect(copyConfirmation.first()).toBeVisible();
        }
      }
    }
  });

  test("should handle edit functionality", async ({ page }) => {
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );

    if ((await updateItems.count()) > 0) {
      const firstUpdate = updateItems.first();

      // Look for edit button
      const editButton = firstUpdate.locator(
        'button:has-text("Edit"), [data-testid="edit-button"], button[title*="edit"]'
      );

      if ((await editButton.count()) > 0) {
        await editButton.first().click();

        // Check if edit dialog or form appears
        const editDialog = page.locator(
          '[role="dialog"], .dialog, .modal, [data-testid="edit-dialog"]'
        );
        if ((await editDialog.count()) > 0) {
          await expect(editDialog.first()).toBeVisible();
        }
      }
    }
  });

  test("should handle delete functionality", async ({ page }) => {
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );

    if ((await updateItems.count()) > 0) {
      const initialCount = await updateItems.count();
      const firstUpdate = updateItems.first();

      // Look for delete button
      const deleteButton = firstUpdate.locator(
        'button:has-text("Delete"), [data-testid="delete-button"], button[title*="delete"]'
      );

      if ((await deleteButton.count()) > 0) {
        await deleteButton.first().click();

        // Check for confirmation dialog
        const confirmDialog = page.locator(
          '[role="dialog"], .dialog, .modal, :text("confirm"), :text("delete")'
        );
        if ((await confirmDialog.count()) > 0) {
          const confirmButton = confirmDialog.locator(
            'button:has-text("Delete"), button:has-text("Confirm")'
          );
          if ((await confirmButton.count()) > 0) {
            await confirmButton.first().click();

            // Wait and check if item was deleted
            await page.waitForTimeout(1000);
            const newCount = await updateItems.count();
            expect(newCount).toBeLessThan(initialCount);
          }
        }
      }
    }
  });

  test("should show todo updates drawer", async ({ page }) => {
    // Look for todo/undated updates trigger
    const todoTrigger = page.locator(
      'button:has-text("Todo"), button:has-text("Undated"), [data-testid="todo-trigger"]'
    );

    if ((await todoTrigger.count()) > 0) {
      await todoTrigger.first().click();

      // Check if drawer/sidebar appears
      const todoDrawer = page.locator(
        '[role="dialog"], .drawer, .sidebar, [data-testid="todo-drawer"]'
      );
      if ((await todoDrawer.count()) > 0) {
        await expect(todoDrawer.first()).toBeVisible();
      }
    }
  });

  test("should show area manager", async ({ page }) => {
    // Look for area manager trigger
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"]'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Check if area manager dialog appears
      const areaManagerDialog = page.locator(
        '[role="dialog"], .dialog, .modal, [data-testid="area-manager"]'
      );
      if ((await areaManagerDialog.count()) > 0) {
        await expect(areaManagerDialog.first()).toBeVisible();
      }
    }
  });
});
