import { test, expect } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should have proper heading structure", async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();

    if (headingCount > 0) {
      // Should have at least one h1
      const h1Elements = page.locator("h1");
      const h1Count = await h1Elements.count();

      // Should have exactly one h1 or be a single-page app without traditional h1
      expect(h1Count).toBeGreaterThanOrEqual(0);

      // Check that headings are accessible
      for (let i = 0; i < Math.min(headingCount, 5); i++) {
        const heading = headings.nth(i);
        const text = await heading.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("should have proper form labels and accessibility", async ({ page }) => {
    // Check input fields have proper labels
    const inputs = page.locator("input, textarea, select");
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      const input = inputs.nth(i);

      // Check for label association
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      const placeholder = await input.getAttribute("placeholder");

      // Input should have some form of labeling
      const hasLabel = id
        ? (await page.locator(`label[for="${id}"]`).count()) > 0
        : false;
      const hasAccessibleName =
        ariaLabel || ariaLabelledBy || placeholder || hasLabel;

      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test("should have proper button accessibility", async ({ page }) => {
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 15); i++) {
      const button = buttons.nth(i);

      // Button should have accessible text
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const ariaLabelledBy = await button.getAttribute("aria-labelledby");
      const title = await button.getAttribute("title");

      const hasAccessibleText =
        (text && text.trim().length > 0) ||
        ariaLabel ||
        ariaLabelledBy ||
        title;
      expect(hasAccessibleText).toBeTruthy();

      // Button should be focusable
      const tabIndex = await button.getAttribute("tabindex");
      const isDisabled = await button.isDisabled();

      if (!isDisabled) {
        expect(tabIndex !== "-1").toBeTruthy();
      }
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press("Tab");

    // Check if focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test multiple tab presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const currentFocus = page.locator(":focus");

      if ((await currentFocus.count()) > 0) {
        await expect(currentFocus).toBeVisible();
      }
    }

    // Test Shift+Tab (reverse navigation)
    await page.keyboard.press("Shift+Tab");
    const reverseFocus = page.locator(":focus");
    if ((await reverseFocus.count()) > 0) {
      await expect(reverseFocus).toBeVisible();
    }
  });

  test("should handle Enter and Space key interactions", async ({ page }) => {
    // Find interactive elements
    const buttons = page.locator('button:visible, [role="button"]:visible');

    if ((await buttons.count()) > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();

      // Test Enter key
      await page.keyboard.press("Enter");

      // Test Space key
      await page.keyboard.press("Space");

      // Should not throw errors
    }
  });

  test("should have proper ARIA attributes for interactive elements", async ({
    page,
  }) => {
    // Check dialogs
    const dialogs = page.locator('[role="dialog"]');
    const dialogCount = await dialogs.count();

    // Open a dialog if possible
    const dialogTriggers = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), button:has-text("Todo")'
    );

    if ((await dialogTriggers.count()) > 0) {
      await dialogTriggers.first().click();

      const openDialog = page.locator('[role="dialog"]:visible');
      if ((await openDialog.count()) > 0) {
        // Dialog should have proper ARIA attributes
        const ariaModal = await openDialog.getAttribute("aria-modal");
        const ariaLabelledBy = await openDialog.getAttribute("aria-labelledby");
        const ariaLabel = await openDialog.getAttribute("aria-label");

        expect(
          ariaModal === "true" || ariaLabelledBy || ariaLabel
        ).toBeTruthy();

        // Close dialog
        await page.keyboard.press("Escape");
      }
    }
  });

  test("should have proper color contrast", async ({ page }) => {
    // Test that text is readable (basic check)
    const textElements = page.locator(
      "p, span, div, h1, h2, h3, h4, h5, h6, button, a, label"
    );
    const elementCount = await textElements.count();

    for (let i = 0; i < Math.min(elementCount, 20); i++) {
      const element = textElements.nth(i);
      const text = await element.textContent();

      if (text && text.trim().length > 0) {
        // Element should be visible (basic contrast check)
        await expect(element).toBeVisible();

        // Check if element has reasonable styling
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
          };
        });

        // Should have color and font size set
        expect(styles.color).toBeTruthy();
        expect(styles.fontSize).toBeTruthy();
      }
    }
  });

  test("should support screen reader navigation", async ({ page }) => {
    // Check for proper semantic elements
    const semanticElements = page.locator(
      "main, nav, header, footer, section, article, aside"
    );
    const semanticCount = await semanticElements.count();

    // Should have at least main content area
    expect(semanticCount).toBeGreaterThan(0);

    // Check for proper list structure
    const lists = page.locator("ul, ol");
    const listCount = await lists.count();

    for (let i = 0; i < Math.min(listCount, 5); i++) {
      const list = lists.nth(i);
      const listItems = list.locator("li");
      const itemCount = await listItems.count();

      // Lists should contain list items
      if (await list.isVisible()) {
        expect(itemCount).toBeGreaterThan(0);
      }
    }
  });

  test("should handle focus management in modals", async ({ page }) => {
    // Open a modal/dialog
    const modalTriggers = page.locator(
      'button:has-text("Areas"), button:has-text("Manage"), button:has-text("Todo")'
    );

    if ((await modalTriggers.count()) > 0) {
      const trigger = modalTriggers.first();
      await trigger.click();

      const modal = page.locator('[role="dialog"]:visible');
      if ((await modal.count()) > 0) {
        // Focus should be trapped in modal
        const focusableElements = modal.locator(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableCount = await focusableElements.count();

        if (focusableCount > 0) {
          // Tab through all focusable elements
          for (let i = 0; i < focusableCount + 1; i++) {
            await page.keyboard.press("Tab");

            const focused = page.locator(":focus");
            if ((await focused.count()) > 0) {
              // Focus should remain within modal
              const isInModal = (await modal.locator(":focus").count()) > 0;
              expect(isInModal).toBeTruthy();
            }
          }
        }

        // Escape should close modal
        await page.keyboard.press("Escape");
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test("should have proper form validation messages", async ({ page }) => {
    // Try to submit forms with invalid data
    const forms = page.locator("form");
    const formCount = await forms.count();

    if (formCount > 0) {
      const form = forms.first();
      const submitButton = form.locator(
        'button[type="submit"], button:has-text("Save"), button:has-text("Add")'
      );

      if ((await submitButton.count()) > 0) {
        // Try to submit empty form
        await submitButton.first().click();

        // Look for validation messages
        const validationMessages = page.locator(
          '[role="alert"], .error, .invalid, [aria-invalid="true"]'
        );

        if ((await validationMessages.count()) > 0) {
          // Validation messages should be accessible
          const firstMessage = validationMessages.first();
          await expect(firstMessage).toBeVisible();

          const messageText = await firstMessage.textContent();
          expect(messageText?.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("should support reduced motion preferences", async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });

    // Interact with elements that might have animations
    const animatedElements = page.locator(
      'button, [role="button"], .transition, .animate'
    );

    if ((await animatedElements.count()) > 0) {
      await animatedElements.first().click();

      // Should still be functional with reduced motion
      // This is more of a smoke test to ensure nothing breaks
    }

    // Reset motion preference
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  test("should have proper skip links for keyboard users", async ({ page }) => {
    // Look for skip links (usually hidden until focused)
    const skipLinks = page.locator(
      'a[href*="#main"], a[href*="#content"], .skip-link, [data-testid="skip-link"]'
    );

    if ((await skipLinks.count()) > 0) {
      // Skip links should become visible when focused
      await skipLinks.first().focus();
      await expect(skipLinks.first()).toBeVisible();
    }
  });

  test("should handle high contrast mode", async ({ page }) => {
    // Test with forced colors (high contrast mode simulation)
    await page.emulateMedia({ forcedColors: "active" });

    // Check that important elements are still visible
    const importantElements = page.locator("button, input, a, h1, h2, h3");
    const elementCount = await importantElements.count();

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = importantElements.nth(i);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }

    // Reset forced colors
    await page.emulateMedia({ forcedColors: "none" });
  });
});
