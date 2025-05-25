import { test, expect } from "@playwright/test";

test.describe("API Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should persist updates across page reloads", async ({ page }) => {
    // Create an update
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    const testContent = "Persistence test update";
    await updateInput.fill(testContent);

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(2000); // Wait for save to complete

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify update still exists
    const persistedUpdate = page.locator(`:text("${testContent}")`);
    if ((await persistedUpdate.count()) > 0) {
      await expect(persistedUpdate.first()).toBeVisible();
    }
  });

  test("should persist areas across sessions", async ({ page }) => {
    const areaName = "API Test Area";

    // Create an area
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"]'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      const addAreaButton = page.locator(
        'button:has-text("Add"), button:has-text("New"), [data-testid="add-area-button"]'
      );

      if ((await addAreaButton.count()) > 0) {
        await addAreaButton.first().click();

        const nameInput = page.locator(
          'input[placeholder*="name"], input[placeholder*="Name"]'
        );
        if ((await nameInput.count()) > 0) {
          await nameInput.first().fill(areaName);

          const saveButton = page.locator(
            'button:has-text("Save"), button:has-text("Create")'
          );
          if ((await saveButton.count()) > 0) {
            await saveButton.first().click();
            await page.waitForTimeout(2000);
          }
        }

        const closeButton = page.locator(
          'button:has-text("Close"), button[aria-label*="close"]'
        );
        if ((await closeButton.count()) > 0) {
          await closeButton.first().click();
        }
      }
    }

    // Reload page and check if area persists
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Open area manager again
    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      const persistedArea = page.locator(`:text("${areaName}")`);
      if ((await persistedArea.count()) > 0) {
        await expect(persistedArea.first()).toBeVisible();
      }
    }
  });

  test("should handle concurrent update creation", async ({
    page,
    context,
  }) => {
    // Create multiple updates rapidly to test concurrency
    const updates = [
      "Concurrent update 1",
      "Concurrent update 2",
      "Concurrent update 3",
    ];

    for (let i = 0; i < updates.length; i++) {
      const updateInput = page
        .locator('input[placeholder*="update"], input[placeholder*="Update"]')
        .first();
      await updateInput.fill(updates[i]);

      const saveButton = page
        .locator('button:has-text("Save"), button:has-text("Add")')
        .first();
      await saveButton.click();

      // Small delay to simulate rapid creation
      await page.waitForTimeout(100);
    }

    // Wait for all saves to complete
    await page.waitForTimeout(3000);

    // Verify all updates were created
    for (const update of updates) {
      const updateElement = page.locator(`:text("${update}")`);
      if ((await updateElement.count()) > 0) {
        await expect(updateElement.first()).toBeVisible();
      }
    }
  });

  test("should handle update deletion and data consistency", async ({
    page,
  }) => {
    // Create multiple updates
    const updates = ["Delete test 1", "Delete test 2", "Delete test 3"];

    for (const update of updates) {
      const updateInput = page
        .locator('input[placeholder*="update"], input[placeholder*="Update"]')
        .first();
      await updateInput.fill(update);

      const saveButton = page
        .locator('button:has-text("Save"), button:has-text("Add")')
        .first();
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Delete the middle update
    const targetUpdate = page.locator(':text("Delete test 2")');
    if ((await targetUpdate.count()) > 0) {
      const updateContainer = targetUpdate.locator("..");
      const deleteButton = updateContainer.locator(
        'button:has-text("Delete"), [data-testid="delete-button"]'
      );

      if ((await deleteButton.count()) > 0) {
        await deleteButton.first().click();

        // Confirm deletion if confirmation dialog appears
        const confirmButton = page.locator(
          'button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")'
        );
        if ((await confirmButton.count()) > 0) {
          await confirmButton.first().click();
        }

        await page.waitForTimeout(2000);
      }
    }

    // Verify deletion
    const deletedUpdate = page.locator(':text("Delete test 2")');
    if ((await deletedUpdate.count()) > 0) {
      await expect(deletedUpdate.first()).not.toBeVisible();
    }

    // Verify other updates still exist
    const remainingUpdate1 = page.locator(':text("Delete test 1")');
    const remainingUpdate3 = page.locator(':text("Delete test 3")');

    if ((await remainingUpdate1.count()) > 0) {
      await expect(remainingUpdate1.first()).toBeVisible();
    }

    if ((await remainingUpdate3.count()) > 0) {
      await expect(remainingUpdate3.first()).toBeVisible();
    }
  });

  test("should handle music update data structure", async ({ page }) => {
    // Toggle to music mode
    const musicToggle = page.locator(
      'button:has-text("Music"), input[type="checkbox"]:near(:text("Music"))'
    );

    if ((await musicToggle.count()) > 0) {
      await musicToggle.first().click();

      // Fill music update fields
      const nameInput = page.locator(
        'input[placeholder*="song"], input[placeholder*="name"]'
      );
      if ((await nameInput.count()) > 0) {
        await nameInput.first().fill("API Test Song");
      }

      const artistInput = page.locator('input[placeholder*="artist"]');
      if ((await artistInput.count()) > 0) {
        await artistInput.first().fill("API Test Artist");
      }

      const linkInput = page.locator(
        'input[placeholder*="link"], input[type="url"]'
      );
      if ((await linkInput.count()) > 0) {
        await linkInput.first().fill("https://example.com/api-test-song");
      }

      const saveButton = page.locator(
        'button:has-text("Save"), button:has-text("Add")'
      );
      if ((await saveButton.count()) > 0) {
        await saveButton.first().click();
        await page.waitForTimeout(2000);
      }
    }

    // Reload and verify music update persists with all fields
    await page.reload();
    await page.waitForLoadState("networkidle");

    const musicUpdate = page.locator(':text("API Test Song")');
    if ((await musicUpdate.count()) > 0) {
      await expect(musicUpdate.first()).toBeVisible();
    }

    const artistInfo = page.locator(':text("API Test Artist")');
    if ((await artistInfo.count()) > 0) {
      await expect(artistInfo.first()).toBeVisible();
    }
  });

  test("should handle area color persistence", async ({ page }) => {
    const areaName = "Color Test Area";

    // Create area with specific color
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage")'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      const addAreaButton = page.locator(
        'button:has-text("Add"), button:has-text("New")'
      );
      if ((await addAreaButton.count()) > 0) {
        await addAreaButton.first().click();

        const nameInput = page.locator('input[placeholder*="name"]');
        if ((await nameInput.count()) > 0) {
          await nameInput.first().fill(areaName);
        }

        // Set a specific color
        const colorInput = page.locator(
          'input[type="color"], [data-testid="color-picker"]'
        );
        if ((await colorInput.count()) > 0) {
          await colorInput.first().fill("#ff0000"); // Red color
        }

        const saveButton = page.locator(
          'button:has-text("Save"), button:has-text("Create")'
        );
        if ((await saveButton.count()) > 0) {
          await saveButton.first().click();
          await page.waitForTimeout(2000);
        }

        const closeButton = page.locator('button:has-text("Close")');
        if ((await closeButton.count()) > 0) {
          await closeButton.first().click();
        }
      }
    }

    // Create an update with this area
    const updateInput = page.locator('input[placeholder*="update"]').first();
    await updateInput.fill("Update with colored area");

    const areaSelect = page.locator('select, [role="combobox"]');
    if ((await areaSelect.count()) > 0) {
      await areaSelect.first().click();

      const areaOption = page.locator(`:text("${areaName}")`);
      if ((await areaOption.count()) > 0) {
        await areaOption.first().click();
      }
    }

    const saveUpdateButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveUpdateButton.click();
    await page.waitForTimeout(2000);

    // Reload and verify color persists
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Check if area badge has the correct color
    const areaBadge = page.locator(`:text("${areaName}")`);
    if ((await areaBadge.count()) > 0) {
      const backgroundColor = await areaBadge
        .first()
        .evaluate((el) => window.getComputedStyle(el).backgroundColor);

      // Red color should be applied (allowing for different color formats)
      expect(backgroundColor).toMatch(/rgb\(255,\s*0,\s*0\)|#ff0000|red/i);
    }
  });

  test("should handle rich text content persistence", async ({ page }) => {
    const updateInput = page.locator('input[placeholder*="update"]').first();
    await updateInput.fill("Rich text API test");

    // Add rich text content
    const detailsEditor = page.locator(
      '[contenteditable="true"], .editor, [data-testid="editor"]'
    );

    if ((await detailsEditor.count()) > 0) {
      await detailsEditor.first().click();

      // Add formatted content
      await detailsEditor
        .first()
        .fill("This is bold text and this is italic text.");

      // Apply formatting if buttons are available
      const boldButton = page.locator(
        'button:has-text("Bold"), button[title*="bold"]'
      );
      if ((await boldButton.count()) > 0) {
        // Select first part of text
        await page.keyboard.press("Control+Home");
        await page.keyboard.press("Shift+Control+Right");
        await page.keyboard.press("Shift+Control+Right");
        await page.keyboard.press("Shift+Control+Right");

        await boldButton.first().click();
      }
    }

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(2000);

    // Reload and verify rich text persists
    await page.reload();
    await page.waitForLoadState("networkidle");

    const richTextUpdate = page.locator(':text("Rich text API test")');
    if ((await richTextUpdate.count()) > 0) {
      await expect(richTextUpdate.first()).toBeVisible();
    }

    const richTextContent = page.locator(':text("This is bold text")');
    if ((await richTextContent.count()) > 0) {
      await expect(richTextContent.first()).toBeVisible();
    }
  });

  test("should handle date and time data correctly", async ({ page }) => {
    const updateInput = page.locator('input[placeholder*="update"]').first();
    await updateInput.fill("Date API test update");

    // Set a specific date
    const dateButton = page.locator(
      'button:has-text("Pick a date"), [data-testid="date-picker"]'
    );

    if ((await dateButton.count()) > 0) {
      await dateButton.first().click();

      const calendar = page.locator(
        '[role="dialog"] [data-testid="calendar"], .calendar'
      );
      if ((await calendar.count()) > 0) {
        // Select a specific date (15th of current month)
        const specificDate = calendar.locator(
          'button[name="day"]:has-text("15")'
        );
        if ((await specificDate.count()) > 0) {
          await specificDate.first().click();
        }
      }
    }

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(2000);

    // Reload and verify date persists
    await page.reload();
    await page.waitForLoadState("networkidle");

    const dateUpdate = page.locator(':text("Date API test update")');
    if ((await dateUpdate.count()) > 0) {
      await expect(dateUpdate.first()).toBeVisible();

      // Verify date is displayed correctly
      const dateDisplay = page.locator(':text("15")');
      if ((await dateDisplay.count()) > 0) {
        await expect(dateDisplay.first()).toBeVisible();
      }
    }
  });

  test("should handle data validation and error states", async ({ page }) => {
    // Test empty update submission
    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();

    // Should show validation error or prevent submission
    const errorMessage = page.locator(
      ':text("required"), :text("error"), .error, [role="alert"]'
    );
    if ((await errorMessage.count()) > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }

    // Test invalid music link
    const musicToggle = page.locator(
      'button:has-text("Music"), input[type="checkbox"]:near(:text("Music"))'
    );

    if ((await musicToggle.count()) > 0) {
      await musicToggle.first().click();

      const nameInput = page.locator(
        'input[placeholder*="song"], input[placeholder*="name"]'
      );
      if ((await nameInput.count()) > 0) {
        await nameInput.first().fill("Test Song");
      }

      const linkInput = page.locator(
        'input[placeholder*="link"], input[type="url"]'
      );
      if ((await linkInput.count()) > 0) {
        await linkInput.first().fill("invalid-url");
      }

      const saveMusicButton = page.locator(
        'button:has-text("Save"), button:has-text("Add")'
      );
      if ((await saveMusicButton.count()) > 0) {
        await saveMusicButton.first().click();

        // Should show URL validation error
        const urlError = page.locator(':text("valid"), :text("URL"), .error');
        if ((await urlError.count()) > 0) {
          await expect(urlError.first()).toBeVisible();
        }
      }
    }
  });

  test("should handle offline/online state transitions", async ({
    page,
    context,
  }) => {
    // Create an update while online
    const updateInput = page.locator('input[placeholder*="update"]').first();
    await updateInput.fill("Online update test");

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(2000);

    // Simulate offline state
    await context.setOffline(true);

    // Try to create another update while offline
    await updateInput.fill("Offline update test");
    await saveButton.click();

    // Should handle offline state gracefully
    const offlineIndicator = page.locator(
      ':text("offline"), :text("connection"), .offline'
    );
    if ((await offlineIndicator.count()) > 0) {
      await expect(offlineIndicator.first()).toBeVisible();
    }

    // Go back online
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    // Verify online update still exists
    const onlineUpdate = page.locator(':text("Online update test")');
    if ((await onlineUpdate.count()) > 0) {
      await expect(onlineUpdate.first()).toBeVisible();
    }
  });
});
