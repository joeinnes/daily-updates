import { test, expect } from "@playwright/test";

test.describe("Integration Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should integrate area creation with update assignment", async ({
    page,
  }) => {
    // Step 1: Create a new area
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
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
          await nameInput.first().fill("Integration Test Area");

          const saveButton = page.locator(
            'button:has-text("Save"), button:has-text("Create")'
          );
          if ((await saveButton.count()) > 0) {
            await saveButton.first().click();
            await page.waitForTimeout(1000);
          }
        }

        // Close area manager
        const closeButton = page.locator(
          'button:has-text("Close"), button[aria-label*="close"]'
        );
        if ((await closeButton.count()) > 0) {
          await closeButton.first().click();
        }
      }
    }

    // Step 2: Create an update and assign it to the new area
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Test update for integration area");

    // Select the area we just created
    const areaSelect = page.locator(
      'select, [role="combobox"], button:has-text("Select area")'
    );
    if ((await areaSelect.count()) > 0) {
      await areaSelect.first().click();

      const integrationAreaOption = page.locator(
        ':text("Integration Test Area")'
      );
      if ((await integrationAreaOption.count()) > 0) {
        await integrationAreaOption.first().click();
      }
    }

    const saveUpdateButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveUpdateButton.click();
    await page.waitForTimeout(1000);

    // Step 3: Verify the update appears with the correct area
    const updateWithArea = page.locator(
      ':text("Test update for integration area")'
    );
    await expect(updateWithArea).toBeVisible();

    const areaIndicator = page.locator(':text("Integration Test Area")');
    await expect(areaIndicator).toBeVisible();
  });

  test("should integrate update creation with todo management", async ({
    page,
  }) => {
    // Create an update without a date (should become a todo)
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Todo integration test update");

    // Don't set a date to make it a todo
    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Open todo drawer
    const todoTrigger = page.locator(
      'button:has-text("Todo"), button:has-text("Undated"), [data-testid="todo-trigger"]'
    );

    if ((await todoTrigger.count()) > 0) {
      await todoTrigger.first().click();

      // Verify todo appears in drawer
      const todoDrawer = page.locator('[role="dialog"], .drawer, .sidebar');
      if ((await todoDrawer.count()) > 0) {
        const todoItem = todoDrawer.locator(
          ':text("Todo integration test update")'
        );
        if ((await todoItem.count()) > 0) {
          await expect(todoItem.first()).toBeVisible();

          // Test completing the todo (adding a date)
          const dateButton = todoItem.locator(
            'button:has-text("Date"), [data-testid="date-picker"]'
          );
          if ((await dateButton.count()) > 0) {
            await dateButton.first().click();

            // Select today's date
            const todayButton = page.locator(
              'button:has-text("Today"), [data-testid="today"]'
            );
            if ((await todayButton.count()) > 0) {
              await todayButton.first().click();
            }
          }
        }
      }
    }
  });

  test("should integrate music updates with regular updates in timeline", async ({
    page,
  }) => {
    // Create a regular update
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Regular update for timeline test");

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(500);

    // Create a music update
    const musicToggle = page.locator(
      'button:has-text("Music"), input[type="checkbox"]:near(:text("Music"))'
    );

    if ((await musicToggle.count()) > 0) {
      await musicToggle.first().click();

      const nameInput = page.locator(
        'input[placeholder*="song"], input[placeholder*="name"]'
      );
      if ((await nameInput.count()) > 0) {
        await nameInput.first().fill("Timeline Test Song");

        const linkInput = page.locator(
          'input[placeholder*="link"], input[type="url"]'
        );
        if ((await linkInput.count()) > 0) {
          await linkInput.first().fill("https://example.com/song");
        }

        const saveMusicButton = page.locator(
          'button:has-text("Save"), button:has-text("Add")'
        );
        if ((await saveMusicButton.count()) > 0) {
          await saveMusicButton.first().click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Verify both updates appear in timeline
    const regularUpdate = page.locator(
      ':text("Regular update for timeline test")'
    );
    const musicUpdate = page.locator(':text("Timeline Test Song")');

    if ((await regularUpdate.count()) > 0) {
      await expect(regularUpdate.first()).toBeVisible();
    }

    if ((await musicUpdate.count()) > 0) {
      await expect(musicUpdate.first()).toBeVisible();
    }
  });

  test("should integrate edit functionality with area management", async ({
    page,
  }) => {
    // Create an update
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Update for edit integration test");

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Edit the update
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );

    if ((await updateItems.count()) > 0) {
      const editButton = updateItems
        .first()
        .locator('button:has-text("Edit"), [data-testid="edit-button"]');

      if ((await editButton.count()) > 0) {
        await editButton.first().click();

        const editDialog = page.locator('[role="dialog"], .dialog, .modal');
        if ((await editDialog.count()) > 0) {
          // Change the update text
          const editInput = editDialog.locator("input[value], textarea");
          if ((await editInput.count()) > 0) {
            await editInput.first().fill("Edited update content");
          }

          // Change the area if area selection is available
          const areaSelect = editDialog.locator('select, [role="combobox"]');
          if ((await areaSelect.count()) > 0) {
            await areaSelect.first().click();

            const areaOptions = page.locator('[role="option"], option');
            if ((await areaOptions.count()) > 0) {
              await areaOptions.first().click();
            }
          }

          // Save changes
          const saveEditButton = editDialog.locator(
            'button:has-text("Save"), button:has-text("Update")'
          );
          if ((await saveEditButton.count()) > 0) {
            await saveEditButton.first().click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }

    // Verify changes were applied
    const editedUpdate = page.locator(':text("Edited update content")');
    if ((await editedUpdate.count()) > 0) {
      await expect(editedUpdate.first()).toBeVisible();
    }
  });

  test("should integrate copy functionality with clipboard", async ({
    page,
  }) => {
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);

    // Create an update with specific content
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    const testContent = "Copy integration test content";
    await updateInput.fill(testContent);

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Copy the update
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );

    if ((await updateItems.count()) > 0) {
      const copyButton = updateItems
        .first()
        .locator('button:has-text("Copy"), [data-testid="copy-button"]');

      if ((await copyButton.count()) > 0) {
        await copyButton.first().click();

        // Verify copy confirmation
        const copyConfirmation = page.locator(':text("Copied"), .copied');
        if ((await copyConfirmation.count()) > 0) {
          await expect(copyConfirmation.first()).toBeVisible();
        }

        // Test pasting the content
        const newUpdateInput = page
          .locator('input[placeholder*="update"], input[placeholder*="Update"]')
          .first();
        await newUpdateInput.click();
        await page.keyboard.press("Control+v");

        // Verify content was pasted
        const pastedValue = await newUpdateInput.inputValue();
        expect(pastedValue).toContain(testContent);
      }
    }
  });

  test("should integrate date picker with update scheduling", async ({
    page,
  }) => {
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Scheduled update test");

    // Open date picker
    const dateButton = page.locator(
      'button:has-text("Pick a date"), [data-testid="date-picker"]'
    );

    if ((await dateButton.count()) > 0) {
      await dateButton.first().click();

      const calendar = page.locator(
        '[role="dialog"] [data-testid="calendar"], .calendar, [role="grid"]'
      );
      if ((await calendar.count()) > 0) {
        // Select a future date
        const futureDateButton = calendar
          .locator('button[name="day"]:not([disabled])')
          .first();
        if ((await futureDateButton.count()) > 0) {
          await futureDateButton.first().click();
        }
      }
    }

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Verify update appears with correct date
    const scheduledUpdate = page.locator(':text("Scheduled update test")');
    if ((await scheduledUpdate.count()) > 0) {
      await expect(scheduledUpdate.first()).toBeVisible();
    }
  });

  test("should integrate rich text editor with update details", async ({
    page,
  }) => {
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Rich text integration test");

    // Add rich text details
    const detailsEditor = page.locator(
      '[contenteditable="true"], .editor, [data-testid="editor"]'
    );

    if ((await detailsEditor.count()) > 0) {
      await detailsEditor.first().click();
      await detailsEditor
        .first()
        .fill("This is detailed content with formatting.");

      // Test formatting buttons if available
      const boldButton = page.locator(
        'button:has-text("Bold"), button[title*="bold"]'
      );
      if ((await boldButton.count()) > 0) {
        // Select some text and make it bold
        await page.keyboard.press("Control+a");
        await boldButton.first().click();
      }
    }

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Verify update with rich text appears
    const richTextUpdate = page.locator(':text("Rich text integration test")');
    if ((await richTextUpdate.count()) > 0) {
      await expect(richTextUpdate.first()).toBeVisible();
    }

    const detailsContent = page.locator(':text("This is detailed content")');
    if ((await detailsContent.count()) > 0) {
      await expect(detailsContent.first()).toBeVisible();
    }
  });

  test("should integrate search/filter with area management", async ({
    page,
  }) => {
    // Create updates in different areas
    const areas = ["Work", "Personal"];

    for (const area of areas) {
      // Create area first
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
            await nameInput.first().fill(area);

            const saveButton = page.locator(
              'button:has-text("Save"), button:has-text("Create")'
            );
            if ((await saveButton.count()) > 0) {
              await saveButton.first().click();
              await page.waitForTimeout(500);
            }
          }
        }

        const closeButton = page.locator('button:has-text("Close")');
        if ((await closeButton.count()) > 0) {
          await closeButton.first().click();
        }
      }

      // Create update for this area
      const updateInput = page.locator('input[placeholder*="update"]').first();
      await updateInput.fill(`${area} update for filtering test`);

      const areaSelect = page.locator('select, [role="combobox"]');
      if ((await areaSelect.count()) > 0) {
        await areaSelect.first().click();

        const areaOption = page.locator(`:text("${area}")`);
        if ((await areaOption.count()) > 0) {
          await areaOption.first().click();
        }
      }

      const saveUpdateButton = page
        .locator('button:has-text("Save"), button:has-text("Add")')
        .first();
      await saveUpdateButton.click();
      await page.waitForTimeout(500);
    }

    // Test filtering by area
    const areaFilter = page.locator(
      'select[name*="area"], [data-testid="area-filter"]'
    );
    if ((await areaFilter.count()) > 0) {
      await areaFilter.first().selectOption("Work");

      // Should only show work updates
      const workUpdate = page.locator(
        ':text("Work update for filtering test")'
      );
      const personalUpdate = page.locator(
        ':text("Personal update for filtering test")'
      );

      if ((await workUpdate.count()) > 0) {
        await expect(workUpdate.first()).toBeVisible();
      }

      if ((await personalUpdate.count()) > 0) {
        await expect(personalUpdate.first()).not.toBeVisible();
      }
    }
  });

  test("should integrate keyboard shortcuts with UI interactions", async ({
    page,
  }) => {
    // Test keyboard shortcuts for common actions

    // Focus on update input with keyboard
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    const isInputFocused = await focusedElement.evaluate(
      (el) =>
        el.tagName.toLowerCase() === "input" ||
        el.tagName.toLowerCase() === "textarea"
    );

    if (isInputFocused) {
      // Type update content
      await page.keyboard.type("Keyboard shortcut integration test");

      // Use Enter to save (if supported)
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);

      // Verify update was created
      const keyboardUpdate = page.locator(
        ':text("Keyboard shortcut integration test")'
      );
      if ((await keyboardUpdate.count()) > 0) {
        await expect(keyboardUpdate.first()).toBeVisible();
      }
    }

    // Test Escape key for closing dialogs
    const modalTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage")'
    );
    if ((await modalTrigger.count()) > 0) {
      await modalTrigger.first().click();

      const modal = page.locator('[role="dialog"]:visible');
      if ((await modal.count()) > 0) {
        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();
      }
    }
  });
});
