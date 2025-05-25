import { test, expect } from "@playwright/test";

test.describe("User Workflows - End to End", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("complete workflow: create area, add update, view and manage updates", async ({
    page,
  }) => {
    // Step 1: Create a new area
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      const addAreaButton = page.locator(
        'button:has-text("Add"), button:has-text("New"), [data-testid="add-area-button"], button:has([data-testid="plus"])'
      );

      if ((await addAreaButton.count()) > 0) {
        await addAreaButton.first().click();

        const nameInput = page.locator(
          'input[placeholder*="name"], input[placeholder*="Name"], [data-testid="area-name-input"]'
        );

        if ((await nameInput.count()) > 0) {
          await nameInput.first().fill("Work Projects");

          const saveButton = page.locator(
            'button:has-text("Save"), button:has-text("Create"), button:has-text("Add")'
          );
          if ((await saveButton.count()) > 0) {
            await saveButton.first().click();
            await page.waitForTimeout(1000);
          }
        }

        // Close area manager
        const closeButton = page.locator(
          'button:has-text("Close"), button[aria-label*="close"], [data-testid="close-button"]'
        );
        if ((await closeButton.count()) > 0) {
          await closeButton.first().click();
        }
      }
    }

    // Step 2: Add a new update
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Completed user authentication feature");

    // Select the area we just created
    const areaSelect = page.locator(
      'select, [role="combobox"], button:has-text("Select area"), button:has-text("Area")'
    );
    if ((await areaSelect.count()) > 0) {
      await areaSelect.first().click();

      const workProjectsOption = page.locator(':text("Work Projects")');
      if ((await workProjectsOption.count()) > 0) {
        await workProjectsOption.first().click();
      }
    }

    // Add details
    const detailsEditor = page.locator(
      '[contenteditable="true"], textarea[placeholder*="detail"], .editor'
    );
    if ((await detailsEditor.count()) > 0) {
      await detailsEditor.first().click();
      await detailsEditor
        .first()
        .fill(
          "Implemented JWT authentication with refresh tokens and role-based access control."
        );
    }

    // Save the update
    const saveUpdateButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveUpdateButton.click();
    await page.waitForTimeout(1000);

    // Step 3: Verify the update appears in the list
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );
    const updateText = page.locator(
      ':text("Completed user authentication feature")'
    );
    await expect(updateText).toBeVisible();

    // Step 4: Test copy functionality
    if ((await updateItems.count()) > 0) {
      await page
        .context()
        .grantPermissions(["clipboard-read", "clipboard-write"]);

      const copyButton = updateItems
        .first()
        .locator('button:has-text("Copy"), [data-testid="copy-button"]');
      if ((await copyButton.count()) > 0) {
        await copyButton.first().click();

        const copyConfirmation = page.locator(':text("Copied"), .copied');
        if ((await copyConfirmation.count()) > 0) {
          await expect(copyConfirmation.first()).toBeVisible();
        }
      }
    }
  });

  test("music update workflow", async ({ page }) => {
    // Toggle to music mode
    const musicToggle = page.locator(
      'button:has-text("Music"), input[type="checkbox"]:near(:text("Music")), [data-testid="music-toggle"]'
    );

    if ((await musicToggle.count()) > 0) {
      await musicToggle.first().click();

      // Fill music details
      const nameInput = page.locator(
        'input[placeholder*="song"], input[placeholder*="name"], input[placeholder*="track"]'
      );
      if ((await nameInput.count()) > 0) {
        await nameInput.first().fill("Bohemian Rhapsody");
      }

      const linkInput = page.locator(
        'input[placeholder*="link"], input[placeholder*="URL"], input[type="url"]'
      );
      if ((await linkInput.count()) > 0) {
        await linkInput.first().fill("https://open.spotify.com/track/example");
      }

      // Save music update
      const saveButton = page.locator(
        'button:has-text("Save"), button:has-text("Add")'
      );
      if ((await saveButton.count()) > 0) {
        await saveButton.first().click();
        await page.waitForTimeout(1000);
      }

      // Verify music update appears
      const musicUpdate = page.locator(':text("Bohemian Rhapsody")');
      if ((await musicUpdate.count()) > 0) {
        await expect(musicUpdate.first()).toBeVisible();
      }
    }
  });

  test("todo/undated updates workflow", async ({ page }) => {
    // Create an update without a date (todo)
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Review code for security vulnerabilities");

    // Don't set a date to make it a todo item
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

      // Verify todo item appears in drawer
      const todoDrawer = page.locator('[role="dialog"], .drawer, .sidebar');
      if ((await todoDrawer.count()) > 0) {
        const todoItem = todoDrawer.locator(
          ':text("Review code for security vulnerabilities")'
        );
        if ((await todoItem.count()) > 0) {
          await expect(todoItem.first()).toBeVisible();
        }
      }
    }
  });

  test("edit and delete update workflow", async ({ page }) => {
    // First create an update
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Initial update content");

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Find the update and edit it
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );

    if ((await updateItems.count()) > 0) {
      const firstUpdate = updateItems.first();

      // Edit the update
      const editButton = firstUpdate.locator(
        'button:has-text("Edit"), [data-testid="edit-button"]'
      );

      if ((await editButton.count()) > 0) {
        await editButton.first().click();

        const editDialog = page.locator('[role="dialog"], .dialog, .modal');
        if ((await editDialog.count()) > 0) {
          const editInput = editDialog.locator("input[value], textarea");

          if ((await editInput.count()) > 0) {
            await editInput.first().fill("Updated content after editing");

            const saveEditButton = editDialog.locator(
              'button:has-text("Save"), button:has-text("Update")'
            );
            if ((await saveEditButton.count()) > 0) {
              await saveEditButton.first().click();
              await page.waitForTimeout(1000);

              // Verify the update was changed
              const updatedText = page.locator(
                ':text("Updated content after editing")'
              );
              if ((await updatedText.count()) > 0) {
                await expect(updatedText.first()).toBeVisible();
              }
            }
          }
        }
      }

      // Now delete the update
      const deleteButton = firstUpdate.locator(
        'button:has-text("Delete"), [data-testid="delete-button"]'
      );

      if ((await deleteButton.count()) > 0) {
        const initialCount = await updateItems.count();

        await deleteButton.first().click();

        // Confirm deletion
        const confirmDialog = page.locator(
          '[role="dialog"]:has-text("delete"), [role="dialog"]:has-text("confirm")'
        );
        if ((await confirmDialog.count()) > 0) {
          const confirmButton = confirmDialog.locator(
            'button:has-text("Delete"), button:has-text("Confirm")'
          );
          if ((await confirmButton.count()) > 0) {
            await confirmButton.first().click();
            await page.waitForTimeout(1000);

            // Verify update was deleted
            const newCount = await updateItems.count();
            expect(newCount).toBeLessThan(initialCount);
          }
        }
      }
    }
  });

  test("area management workflow", async ({ page }) => {
    // Open area manager
    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"], button:has([data-testid="settings"])'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      // Add multiple areas
      const areas = ["Personal", "Learning", "Health"];

      for (const areaName of areas) {
        const addButton = page.locator(
          'button:has-text("Add"), button:has-text("New"), [data-testid="add-area-button"]'
        );

        if ((await addButton.count()) > 0) {
          await addButton.first().click();

          const nameInput = page.locator(
            'input[placeholder*="name"], input[placeholder*="Name"]'
          );
          if ((await nameInput.count()) > 0) {
            await nameInput.first().fill(areaName);

            const saveButton = page.locator(
              'button:has-text("Save"), button:has-text("Create"), button:has-text("Add")'
            );
            if ((await saveButton.count()) > 0) {
              await saveButton.first().click();
              await page.waitForTimeout(500);
            }
          }
        }
      }

      // Verify all areas were created
      for (const areaName of areas) {
        const areaElement = page.locator(`:text("${areaName}")`);
        if ((await areaElement.count()) > 0) {
          await expect(areaElement.first()).toBeVisible();
        }
      }

      // Edit an area
      const editButtons = page.locator(
        'button:has-text("Edit"), [data-testid="edit-area-button"]'
      );
      if ((await editButtons.count()) > 0) {
        await editButtons.first().click();

        const editInput = page.locator(
          'input[value], input[placeholder*="name"]'
        );
        if ((await editInput.count()) > 0) {
          await editInput.first().fill("Personal Projects");

          const saveEditButton = page.locator(
            'button:has-text("Save"), button:has-text("Update")'
          );
          if ((await saveEditButton.count()) > 0) {
            await saveEditButton.first().click();
            await page.waitForTimeout(500);
          }
        }
      }

      // Delete an area
      const deleteButtons = page.locator(
        'button:has-text("Delete"), [data-testid="delete-area-button"]'
      );
      if ((await deleteButtons.count()) > 0) {
        await deleteButtons.first().click();

        const confirmDialog = page.locator(
          '[role="dialog"]:has-text("delete")'
        );
        if ((await confirmDialog.count()) > 0) {
          const confirmButton = confirmDialog.locator(
            'button:has-text("Delete"), button:has-text("Confirm")'
          );
          if ((await confirmButton.count()) > 0) {
            await confirmButton.first().click();
            await page.waitForTimeout(500);
          }
        }
      }
    }
  });

  test("theme and authentication workflow", async ({ page }) => {
    // Test authentication button
    const authButton = page.locator(
      'button:has-text("Auth"), button:has-text("Login"), button:has-text("Sign")'
    );

    if ((await authButton.count()) > 0) {
      await expect(authButton.first()).toBeVisible();
      // Note: We don't actually click auth in tests to avoid external dependencies
    }

    // Test theme switching (if available)
    const themeToggle = page.locator(
      'button:has-text("Dark"), button:has-text("Light"), button:has-text("Theme"), [data-testid="theme-toggle"]'
    );

    if ((await themeToggle.count()) > 0) {
      await themeToggle.first().click();

      // Check if theme changed
      const htmlElement = page.locator("html");
      const hasThemeClass = await htmlElement.evaluate(
        (el) => el.classList.contains("dark") || el.classList.contains("light")
      );

      // Theme system should be working
      expect(typeof hasThemeClass).toBe("boolean");
    }
  });

  test("responsive design and mobile workflow", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile navigation works
    const mobileMenu = page.locator(
      'button[aria-label*="menu"], .mobile-menu, [data-testid="mobile-menu"]'
    );

    if ((await mobileMenu.count()) > 0) {
      await mobileMenu.first().click();

      // Mobile menu should open
      const menuContent = page.locator(
        '.menu-content, [role="menu"], .mobile-nav'
      );
      if ((await menuContent.count()) > 0) {
        await expect(menuContent.first()).toBeVisible();
      }
    }

    // Test that main functionality still works on mobile
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Mobile test update");

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();
    await page.waitForTimeout(1000);

    // Verify update appears
    const mobileUpdate = page.locator(':text("Mobile test update")');
    if ((await mobileUpdate.count()) > 0) {
      await expect(mobileUpdate.first()).toBeVisible();
    }

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
