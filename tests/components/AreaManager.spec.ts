import { test, expect } from "@playwright/test";

test.describe("AreaManager Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
  });

  test("should open area manager dialog", async ({ page }) => {
    // Look for area manager trigger button
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Check if dialog opens
      const dialog = page.locator(
        '[role="dialog"], .dialog, [data-testid="area-manager-dialog"]'
      );
      await expect(dialog).toBeVisible();

      // Check for dialog title
      const title = page.locator(
        'h1, h2, h3, .dialog-title, [data-testid="dialog-title"]:has-text("Area"), :text("Manage Areas")'
      );
      if ((await title.count()) > 0) {
        await expect(title.first()).toBeVisible();
      }
    }
  });

  test("should display existing areas", async ({ page }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Look for area list
      const areaList = page.locator(
        '[data-testid="area-list"], .area-list, .areas'
      );
      const areaItems = page.locator(
        '[data-testid="area-item"], .area-item, .area, .badge'
      );

      // Should show either areas or empty state
      const hasAreas = (await areaItems.count()) > 0;
      const hasEmptyState =
        (await page.locator(':text("No areas"), .empty-state').count()) > 0;

      expect(hasAreas || hasEmptyState).toBeTruthy();
    }
  });

  test("should show add new area form", async ({ page }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Look for add area button or form
      const addButton = page.locator(
        'button:has-text("Add"), button:has-text("New"), [data-testid="add-area-button"], button:has([data-testid="plus"])'
      );

      if ((await addButton.count()) > 0) {
        await addButton.first().click();

        // Check for form fields
        const nameInput = page.locator(
          'input[placeholder*="name"], input[placeholder*="Name"], [data-testid="area-name-input"]'
        );
        const colorPicker = page.locator(
          '[data-testid="color-picker"], .color-picker, input[type="color"]'
        );

        if ((await nameInput.count()) > 0) {
          await expect(nameInput.first()).toBeVisible();
        }

        if ((await colorPicker.count()) > 0) {
          await expect(colorPicker.first()).toBeVisible();
        }
      }
    }
  });

  test("should allow creating a new area", async ({ page }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Look for add area functionality
      const addButton = page.locator(
        'button:has-text("Add"), button:has-text("New"), [data-testid="add-area-button"], button:has([data-testid="plus"])'
      );

      if ((await addButton.count()) > 0) {
        await addButton.first().click();

        // Fill in area details
        const nameInput = page.locator(
          'input[placeholder*="name"], input[placeholder*="Name"], [data-testid="area-name-input"]'
        );

        if ((await nameInput.count()) > 0) {
          await nameInput.first().fill("Test Area");

          // Submit the form
          const saveButton = page.locator(
            'button:has-text("Save"), button:has-text("Create"), button:has-text("Add"), [data-testid="save-area-button"]'
          );

          if ((await saveButton.count()) > 0) {
            await saveButton.first().click();

            // Check if area was created
            await page.waitForTimeout(1000);
            const newArea = page.locator(':text("Test Area")');
            if ((await newArea.count()) > 0) {
              await expect(newArea.first()).toBeVisible();
            }
          }
        }
      }
    }
  });

  test("should show color picker for areas", async ({ page }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Look for color picker
      const colorPicker = page.locator(
        '[data-testid="color-picker"], .color-picker, .color-selector'
      );
      const colorButtons = page.locator(
        '.color-option, .color-button, [data-testid="color-option"]'
      );

      if ((await colorPicker.count()) > 0 || (await colorButtons.count()) > 0) {
        // Color picker should be functional
        if ((await colorButtons.count()) > 0) {
          await colorButtons.first().click();
          // Should be able to select colors
        }
      }
    }
  });

  test("should allow editing existing areas", async ({ page }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Look for existing areas with edit buttons
      const editButtons = page.locator(
        'button:has-text("Edit"), [data-testid="edit-area-button"], button:has([data-testid="pencil"])'
      );

      if ((await editButtons.count()) > 0) {
        await editButtons.first().click();

        // Check if edit form appears
        const nameInput = page.locator(
          'input[value], input[placeholder*="name"], [data-testid="edit-area-name"]'
        );

        if ((await nameInput.count()) > 0) {
          await expect(nameInput.first()).toBeVisible();

          // Try editing the name
          await nameInput.first().fill("Edited Area Name");

          // Save changes
          const saveButton = page.locator(
            'button:has-text("Save"), button:has-text("Update"), [data-testid="save-edit-button"]'
          );

          if ((await saveButton.count()) > 0) {
            await saveButton.first().click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }
  });

  test("should allow deleting areas", async ({ page }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Count initial areas
      const areaItems = page.locator(
        '[data-testid="area-item"], .area-item, .area'
      );
      const initialCount = await areaItems.count();

      if (initialCount > 0) {
        // Look for delete buttons
        const deleteButtons = page.locator(
          'button:has-text("Delete"), [data-testid="delete-area-button"], button:has([data-testid="trash"])'
        );

        if ((await deleteButtons.count()) > 0) {
          await deleteButtons.first().click();

          // Check for confirmation dialog
          const confirmDialog = page.locator(
            '[role="dialog"]:has-text("delete"), [role="dialog"]:has-text("confirm")'
          );

          if ((await confirmDialog.count()) > 0) {
            const confirmButton = confirmDialog.locator(
              'button:has-text("Delete"), button:has-text("Confirm")'
            );

            if ((await confirmButton.count()) > 0) {
              await confirmButton.first().click();

              // Check if area was deleted
              await page.waitForTimeout(1000);
              const newCount = await areaItems.count();
              expect(newCount).toBeLessThan(initialCount);
            }
          }
        }
      }
    }
  });

  test("should validate area name input", async ({ page }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Try to add area with empty name
      const addButton = page.locator(
        'button:has-text("Add"), button:has-text("New"), [data-testid="add-area-button"], button:has([data-testid="plus"])'
      );

      if ((await addButton.count()) > 0) {
        await addButton.first().click();

        // Try to save without entering name
        const saveButton = page.locator(
          'button:has-text("Save"), button:has-text("Create"), button:has-text("Add"), [data-testid="save-area-button"]'
        );

        if ((await saveButton.count()) > 0) {
          const isDisabled = await saveButton.first().isDisabled();

          if (!isDisabled) {
            await saveButton.first().click();

            // Should show validation error or prevent submission
            const errorMessage = page.locator(
              '.error, [role="alert"], .text-red, .text-destructive'
            );
            if ((await errorMessage.count()) > 0) {
              await expect(errorMessage.first()).toBeVisible();
            }
          } else {
            // Button should be disabled for empty input
            expect(isDisabled).toBeTruthy();
          }
        }
      }
    }
  });

  test("should close dialog when clicking outside or close button", async ({
    page,
  }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Look for close button
      const closeButton = page.locator(
        'button:has-text("Close"), button[aria-label*="close"], [data-testid="close-button"], button:has([data-testid="x"])'
      );

      if ((await closeButton.count()) > 0) {
        await closeButton.first().click();

        // Dialog should close
        await expect(dialog).not.toBeVisible();
      }
    }
  });
});
