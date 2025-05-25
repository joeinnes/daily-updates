import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("should load the homepage within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Homepage should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Check that main content is visible
    const mainContent = page.locator(
      'main, [data-testid="main-content"], .main-content'
    );
    await expect(mainContent).toBeVisible();
  });

  test("should handle large numbers of updates efficiently", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const startTime = Date.now();

    // Add multiple updates quickly
    for (let i = 0; i < 10; i++) {
      const updateInput = page
        .locator('input[placeholder*="update"], input[placeholder*="Update"]')
        .first();
      await updateInput.fill(`Performance test update ${i + 1}`);

      const saveButton = page
        .locator('button:has-text("Save"), button:has-text("Add")')
        .first();
      await saveButton.click();

      // Small delay to allow for processing
      await page.waitForTimeout(100);
    }

    const totalTime = Date.now() - startTime;

    // Should handle 10 updates within 30 seconds
    expect(totalTime).toBeLessThan(30000);

    // Check that all updates are visible
    const updateItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );
    const updateCount = await updateItems.count();
    expect(updateCount).toBeGreaterThanOrEqual(10);
  });

  test("should maintain responsive UI during interactions", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test rapid clicking and interactions
    const buttons = page.locator("button:visible");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const startTime = Date.now();

      // Rapidly interact with buttons
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if ((await button.isVisible()) && !(await button.isDisabled())) {
          await button.click();
          await page.waitForTimeout(50);
        }
      }

      const interactionTime = Date.now() - startTime;

      // Interactions should be responsive (under 2 seconds)
      expect(interactionTime).toBeLessThan(2000);
    }
  });

  test("should handle form submissions efficiently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();

    // Test multiple form submissions
    const submissions = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();

      await updateInput.fill(`Form submission test ${i + 1}`);

      const saveButton = page
        .locator('button:has-text("Save"), button:has-text("Add")')
        .first();
      await saveButton.click();

      // Wait for form to reset or show success
      await page.waitForTimeout(500);

      const submissionTime = Date.now() - startTime;
      submissions.push(submissionTime);
    }

    // Each submission should complete within 3 seconds
    for (const time of submissions) {
      expect(time).toBeLessThan(3000);
    }

    // Average submission time should be reasonable
    const averageTime =
      submissions.reduce((a, b) => a + b, 0) / submissions.length;
    expect(averageTime).toBeLessThan(2000);
  });

  test("should handle modal/dialog operations efficiently", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const modalTriggers = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), button:has-text("Todo")'
    );

    if ((await modalTriggers.count()) > 0) {
      const openTimes = [];
      const closeTimes = [];

      for (let i = 0; i < 3; i++) {
        // Test modal opening
        const openStart = Date.now();
        await modalTriggers.first().click();

        const modal = page.locator('[role="dialog"]:visible');
        await expect(modal).toBeVisible();

        const openTime = Date.now() - openStart;
        openTimes.push(openTime);

        // Test modal closing
        const closeStart = Date.now();
        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();

        const closeTime = Date.now() - closeStart;
        closeTimes.push(closeTime);

        await page.waitForTimeout(100);
      }

      // Modal operations should be fast
      for (const time of openTimes) {
        expect(time).toBeLessThan(1000);
      }

      for (const time of closeTimes) {
        expect(time).toBeLessThan(1000);
      }
    }
  });

  test("should handle rapid typing efficiently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();

    // Test rapid typing
    const startTime = Date.now();
    const longText =
      "This is a very long update that tests how well the application handles rapid typing and large amounts of text input. ".repeat(
        5
      );

    await updateInput.fill(longText);

    const typingTime = Date.now() - startTime;

    // Typing should be responsive
    expect(typingTime).toBeLessThan(2000);

    // Verify text was entered correctly
    const inputValue = await updateInput.inputValue();
    expect(inputValue).toBe(longText);
  });

  test("should handle editor operations efficiently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const editor = page.locator(
      '[contenteditable="true"], .editor, [data-testid="editor"]'
    );

    if ((await editor.count()) > 0) {
      const startTime = Date.now();

      // Test editor interactions
      await editor.first().click();
      await editor.first().fill("Testing editor performance with some content");

      // Test formatting if available
      const boldButton = page.locator(
        'button:has-text("Bold"), button[title*="bold"], [data-testid="bold-button"]'
      );
      if ((await boldButton.count()) > 0) {
        await boldButton.first().click();
      }

      const editorTime = Date.now() - startTime;

      // Editor operations should be responsive
      expect(editorTime).toBeLessThan(3000);
    }
  });

  test("should handle list rendering efficiently", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // First add some updates to test list performance
    for (let i = 0; i < 15; i++) {
      const updateInput = page
        .locator('input[placeholder*="update"], input[placeholder*="Update"]')
        .first();
      await updateInput.fill(`List performance test ${i + 1}`);

      const saveButton = page
        .locator('button:has-text("Save"), button:has-text("Add")')
        .first();
      await saveButton.click();
      await page.waitForTimeout(50);
    }

    // Test scrolling performance
    const startTime = Date.now();

    // Scroll through the list
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(100);
      await page.mouse.wheel(0, -500);
      await page.waitForTimeout(100);
    }

    const scrollTime = Date.now() - startTime;

    // Scrolling should be smooth and responsive
    expect(scrollTime).toBeLessThan(3000);
  });

  test("should handle area management operations efficiently", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const areaManagerTrigger = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"]'
    );

    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();

      const startTime = Date.now();

      // Add multiple areas quickly
      for (let i = 0; i < 5; i++) {
        const addButton = page.locator(
          'button:has-text("Add"), button:has-text("New"), [data-testid="add-area-button"]'
        );

        if ((await addButton.count()) > 0) {
          await addButton.first().click();

          const nameInput = page.locator(
            'input[placeholder*="name"], input[placeholder*="Name"]'
          );
          if ((await nameInput.count()) > 0) {
            await nameInput.first().fill(`Performance Area ${i + 1}`);

            const saveButton = page.locator(
              'button:has-text("Save"), button:has-text("Create")'
            );
            if ((await saveButton.count()) > 0) {
              await saveButton.first().click();
              await page.waitForTimeout(100);
            }
          }
        }
      }

      const areaCreationTime = Date.now() - startTime;

      // Area creation should be efficient
      expect(areaCreationTime).toBeLessThan(10000);
    }
  });

  test("should maintain performance with mixed content types", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const startTime = Date.now();

    // Add mix of regular updates and music updates
    for (let i = 0; i < 8; i++) {
      if (i % 2 === 0) {
        // Regular update
        const updateInput = page
          .locator('input[placeholder*="update"], input[placeholder*="Update"]')
          .first();
        await updateInput.fill(`Mixed content test update ${i + 1}`);

        const saveButton = page
          .locator('button:has-text("Save"), button:has-text("Add")')
          .first();
        await saveButton.click();
      } else {
        // Music update (if available)
        const musicToggle = page.locator(
          'button:has-text("Music"), input[type="checkbox"]:near(:text("Music"))'
        );

        if ((await musicToggle.count()) > 0) {
          await musicToggle.first().click();

          const nameInput = page.locator(
            'input[placeholder*="song"], input[placeholder*="name"]'
          );
          if ((await nameInput.count()) > 0) {
            await nameInput.first().fill(`Test Song ${i + 1}`);

            const saveButton = page.locator(
              'button:has-text("Save"), button:has-text("Add")'
            );
            if ((await saveButton.count()) > 0) {
              await saveButton.first().click();
            }
          }
        }
      }

      await page.waitForTimeout(100);
    }

    const mixedContentTime = Date.now() - startTime;

    // Mixed content handling should be efficient
    expect(mixedContentTime).toBeLessThan(15000);

    // Verify content is displayed
    const contentItems = page.locator(
      '[data-testid="update-item"], .update-item, .update, .card'
    );
    const itemCount = await contentItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(4);
  });

  test("should handle browser resource constraints", async ({ page }) => {
    // Simulate slower network
    await page.route("**/*", (route) => {
      setTimeout(() => route.continue(), 100);
    });

    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTimeWithDelay = Date.now() - startTime;

    // Should still load within reasonable time even with network delay
    expect(loadTimeWithDelay).toBeLessThan(10000);

    // App should still be functional
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Network delay test");

    const saveButton = page
      .locator('button:has-text("Save"), button:has-text("Add")')
      .first();
    await saveButton.click();

    // Should handle the interaction despite network constraints
    await page.waitForTimeout(2000);
  });
});
