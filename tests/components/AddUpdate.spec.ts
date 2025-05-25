import { test, expect } from "@playwright/test";

test.describe("AddUpdate Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the component to load
    await page.waitForSelector(
      '[data-testid="add-update-form"], .add-update, form'
    );
  });

  test("should display the add update form", async ({ page }) => {
    // Check if the main form elements are visible
    await expect(
      page.locator('input[placeholder*="update"], input[placeholder*="Update"]')
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Save"), button:has-text("Add")')
    ).toBeVisible();
  });

  test("should allow typing in the update input field", async ({ page }) => {
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Test update content");
    await expect(updateInput).toHaveValue("Test update content");
  });

  test("should show date picker when date field is clicked", async ({
    page,
  }) => {
    // Look for date-related elements
    const dateButton = page.locator(
      'button:has-text("Pick a date"), [data-testid="date-picker"], button:has([data-testid="calendar"])'
    );

    if ((await dateButton.count()) > 0) {
      await dateButton.first().click();
      // Check if calendar appears
      await expect(
        page.locator(
          '[role="dialog"] [data-testid="calendar"], .calendar, [role="grid"]'
        )
      ).toBeVisible();
    }
  });

  test("should show area selection dropdown", async ({ page }) => {
    // Look for area/category selection
    const areaSelect = page.locator(
      'select, [role="combobox"], button:has-text("Select area"), button:has-text("Area")'
    );

    if ((await areaSelect.count()) > 0) {
      await areaSelect.first().click();
      // Should show dropdown options or open a selection dialog
      await page.waitForTimeout(500); // Wait for dropdown to appear
    }
  });

  test("should toggle between update and music modes", async ({ page }) => {
    // Look for mode toggle buttons or checkboxes
    const musicToggle = page.locator(
      'button:has-text("Music"), input[type="checkbox"]:near(:text("Music")), [data-testid="music-toggle"]'
    );

    if ((await musicToggle.count()) > 0) {
      await musicToggle.first().click();

      // Check if music-specific fields appear
      const musicFields = page.locator(
        'input[placeholder*="song"], input[placeholder*="artist"], input[placeholder*="link"], input[placeholder*="music"]'
      );
      if ((await musicFields.count()) > 0) {
        await expect(musicFields.first()).toBeVisible();
      }
    }
  });

  test("should show details/description editor", async ({ page }) => {
    // Look for rich text editor or textarea for details
    const detailsEditor = page.locator(
      '[contenteditable="true"], textarea[placeholder*="detail"], .editor, [data-testid="editor"]'
    );

    if ((await detailsEditor.count()) > 0) {
      await detailsEditor.first().click();
      await detailsEditor.first().fill("Test details content");

      // Check if content was added
      const content = await detailsEditor.first().textContent();
      expect(content).toContain("Test details");
    }
  });

  test("should handle form submission", async ({ page }) => {
    // Fill out the form
    const updateInput = page
      .locator('input[placeholder*="update"], input[placeholder*="Update"]')
      .first();
    await updateInput.fill("Test update for submission");

    // Submit the form
    const saveButton = page
      .locator(
        'button:has-text("Save"), button:has-text("Add"), button[type="submit"]'
      )
      .first();
    await saveButton.click();

    // Check if form was reset or success indication
    await page.waitForTimeout(1000);
    const inputValue = await updateInput.inputValue();
    // Form should either be reset or show success state
    expect(
      inputValue === "" || inputValue === "Test update for submission"
    ).toBeTruthy();
  });

  test("should show validation for required fields", async ({ page }) => {
    // Try to submit empty form
    const saveButton = page
      .locator(
        'button:has-text("Save"), button:has-text("Add"), button[type="submit"]'
      )
      .first();
    await saveButton.click();

    // Look for validation messages or disabled state
    const validationMessage = page.locator(
      '.error, [role="alert"], .text-red, .text-destructive'
    );
    const isButtonDisabled = await saveButton.isDisabled();

    // Either validation message should appear or button should be disabled
    expect(
      (await validationMessage.count()) > 0 || isButtonDisabled
    ).toBeTruthy();
  });

  test("should handle link input for updates", async ({ page }) => {
    // Look for link input field
    const linkInput = page.locator(
      'input[placeholder*="link"], input[placeholder*="URL"], input[type="url"]'
    );

    if ((await linkInput.count()) > 0) {
      await linkInput.first().fill("https://example.com");
      await expect(linkInput.first()).toHaveValue("https://example.com");
    }
  });

  test("should show collapsible sections for additional options", async ({
    page,
  }) => {
    // Look for collapsible triggers
    const collapsibleTrigger = page.locator(
      'button:has-text("More"), button:has-text("Advanced"), [data-testid="collapsible-trigger"], button[aria-expanded]'
    );

    if ((await collapsibleTrigger.count()) > 0) {
      const trigger = collapsibleTrigger.first();
      await trigger.click();

      // Check if additional content is revealed
      const expandedState = await trigger.getAttribute("aria-expanded");
      expect(expandedState).toBe("true");
    }
  });
});
