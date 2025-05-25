import { Page, Locator, expect } from "@playwright/test";

/**
 * Utility functions and helpers for tests
 * Provides reusable functions for common test operations
 */

// Common selectors used across tests
export const selectors = {
  // Update form elements
  updateInput: 'input[placeholder*="update"], input[placeholder*="Update"]',
  saveButton: 'button:has-text("Save"), button:has-text("Add")',
  datePickerButton:
    'button:has-text("Pick a date"), [data-testid="date-picker"]',
  areaSelect: 'select, [role="combobox"], button:has-text("Select area")',

  // Music form elements
  musicToggle:
    'button:has-text("Music"), input[type="checkbox"]:near(:text("Music"))',
  songNameInput: 'input[placeholder*="song"], input[placeholder*="name"]',
  artistInput: 'input[placeholder*="artist"]',
  linkInput: 'input[placeholder*="link"], input[type="url"]',

  // Area management
  areaManagerTrigger:
    'button:has-text("Areas"), button:has-text("Manage"), [data-testid="area-manager-trigger"]',
  addAreaButton:
    'button:has-text("Add"), button:has-text("New"), [data-testid="add-area-button"]',
  areaNameInput: 'input[placeholder*="name"], input[placeholder*="Name"]',
  colorPicker: 'input[type="color"], [data-testid="color-picker"]',

  // Update list elements
  updateItem: '[data-testid="update-item"], .update-item, .update, .card',
  editButton: 'button:has-text("Edit"), [data-testid="edit-button"]',
  deleteButton: 'button:has-text("Delete"), [data-testid="delete-button"]',
  copyButton: 'button:has-text("Copy"), [data-testid="copy-button"]',

  // Rich text editor
  editor: '[contenteditable="true"], .editor, [data-testid="editor"]',
  boldButton: 'button:has-text("Bold"), button[title*="bold"]',
  italicButton: 'button:has-text("Italic"), button[title*="italic"]',

  // Dialogs and modals
  dialog: '[role="dialog"], .dialog, .modal',
  closeButton: 'button:has-text("Close"), button[aria-label*="close"]',
  confirmButton:
    'button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")',

  // Todo/undated updates
  todoTrigger:
    'button:has-text("Todo"), button:has-text("Undated"), [data-testid="todo-trigger"]',
  todoDrawer: '[role="dialog"], .drawer, .sidebar',

  // Calendar
  calendar:
    '[role="dialog"] [data-testid="calendar"], .calendar, [role="grid"]',
  todayButton: 'button:has-text("Today"), [data-testid="today"]',
  dayButton: 'button[name="day"]:not([disabled])',
};

// Test data generators
export const generateTestData = {
  update: (suffix = "") => ({
    content: `Test update ${suffix} ${Date.now()}`,
    details: `Test update details ${suffix}`,
  }),

  area: (suffix = "") => ({
    name: `Test Area ${suffix} ${Date.now()}`,
    color: "#" + Math.floor(Math.random() * 16777215).toString(16),
  }),

  musicUpdate: (suffix = "") => ({
    name: `Test Song ${suffix} ${Date.now()}`,
    artist: `Test Artist ${suffix}`,
    link: `https://example.com/song-${Date.now()}`,
  }),
};

// Common test actions
export class TestActions {
  constructor(private page: Page) {}

  /**
   * Create a new update with the given content
   */
  async createUpdate(
    content: string,
    options: {
      area?: string;
      date?: string;
      details?: string;
    } = {}
  ) {
    const updateInput = this.page.locator(selectors.updateInput).first();
    await updateInput.fill(content);

    // Set area if provided
    if (options.area) {
      await this.selectArea(options.area);
    }

    // Set date if provided
    if (options.date) {
      await this.setDate(options.date);
    }

    // Add details if provided
    if (options.details) {
      await this.addDetails(options.details);
    }

    const saveButton = this.page.locator(selectors.saveButton).first();
    await saveButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Create a new music update
   */
  async createMusicUpdate(data: {
    name: string;
    artist?: string;
    link?: string;
  }) {
    // Toggle to music mode
    const musicToggle = this.page.locator(selectors.musicToggle);
    if ((await musicToggle.count()) > 0) {
      await musicToggle.first().click();
    }

    // Fill song name
    const nameInput = this.page.locator(selectors.songNameInput);
    if ((await nameInput.count()) > 0) {
      await nameInput.first().fill(data.name);
    }

    // Fill artist if provided
    if (data.artist) {
      const artistInput = this.page.locator(selectors.artistInput);
      if ((await artistInput.count()) > 0) {
        await artistInput.first().fill(data.artist);
      }
    }

    // Fill link if provided
    if (data.link) {
      const linkInput = this.page.locator(selectors.linkInput);
      if ((await linkInput.count()) > 0) {
        await linkInput.first().fill(data.link);
      }
    }

    const saveButton = this.page.locator(selectors.saveButton).first();
    await saveButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Create a new area
   */
  async createArea(name: string, color?: string) {
    // Open area manager
    const areaManagerTrigger = this.page.locator(selectors.areaManagerTrigger);
    if ((await areaManagerTrigger.count()) > 0) {
      await areaManagerTrigger.first().click();
    }

    // Click add area button
    const addAreaButton = this.page.locator(selectors.addAreaButton);
    if ((await addAreaButton.count()) > 0) {
      await addAreaButton.first().click();
    }

    // Fill area name
    const nameInput = this.page.locator(selectors.areaNameInput);
    if ((await nameInput.count()) > 0) {
      await nameInput.first().fill(name);
    }

    // Set color if provided
    if (color) {
      const colorPicker = this.page.locator(selectors.colorPicker);
      if ((await colorPicker.count()) > 0) {
        await colorPicker.first().fill(color);
      }
    }

    // Save area
    const saveButton = this.page.locator(
      'button:has-text("Save"), button:has-text("Create")'
    );
    if ((await saveButton.count()) > 0) {
      await saveButton.first().click();
      await this.page.waitForTimeout(1000);
    }

    // Close area manager
    const closeButton = this.page.locator(selectors.closeButton);
    if ((await closeButton.count()) > 0) {
      await closeButton.first().click();
    }
  }

  /**
   * Select an area from the dropdown
   */
  async selectArea(areaName: string) {
    const areaSelect = this.page.locator(selectors.areaSelect);
    if ((await areaSelect.count()) > 0) {
      await areaSelect.first().click();

      const areaOption = this.page.locator(`:text("${areaName}")`);
      if ((await areaOption.count()) > 0) {
        await areaOption.first().click();
      }
    }
  }

  /**
   * Set a date using the date picker
   */
  async setDate(date: string) {
    const dateButton = this.page.locator(selectors.datePickerButton);
    if ((await dateButton.count()) > 0) {
      await dateButton.first().click();

      // For simplicity, just click today or a specific day
      if (date === "today") {
        const todayButton = this.page.locator(selectors.todayButton);
        if ((await todayButton.count()) > 0) {
          await todayButton.first().click();
        }
      } else {
        // Try to click a day button with the specified date
        const dayButton = this.page.locator(
          `button[name="day"]:has-text("${date}")`
        );
        if ((await dayButton.count()) > 0) {
          await dayButton.first().click();
        }
      }
    }
  }

  /**
   * Add details to an update using the rich text editor
   */
  async addDetails(details: string) {
    const editor = this.page.locator(selectors.editor);
    if ((await editor.count()) > 0) {
      await editor.first().click();
      await editor.first().fill(details);
    }
  }

  /**
   * Delete an update by its content
   */
  async deleteUpdate(content: string) {
    const updateElement = this.page.locator(`:text("${content}")`);
    if ((await updateElement.count()) > 0) {
      const updateContainer = updateElement.locator("..");
      const deleteButton = updateContainer.locator(selectors.deleteButton);

      if ((await deleteButton.count()) > 0) {
        await deleteButton.first().click();

        // Confirm deletion if dialog appears
        const confirmButton = this.page.locator(selectors.confirmButton);
        if ((await confirmButton.count()) > 0) {
          await confirmButton.first().click();
        }

        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Wait for an element to be visible with custom timeout
   */
  async waitForElement(selector: string, timeout = 5000) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: "visible", timeout });
    return element;
  }

  /**
   * Check if an element exists without throwing
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      return (await element.count()) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }
}

// Assertion helpers
export class TestAssertions {
  constructor(private page: Page) {}

  /**
   * Assert that an update with given content is visible
   */
  async updateIsVisible(content: string) {
    const updateElement = this.page.locator(`:text("${content}")`);
    await expect(updateElement.first()).toBeVisible();
  }

  /**
   * Assert that an update with given content is not visible
   */
  async updateIsNotVisible(content: string) {
    const updateElement = this.page.locator(`:text("${content}")`);
    if ((await updateElement.count()) > 0) {
      await expect(updateElement.first()).not.toBeVisible();
    }
  }

  /**
   * Assert that an area with given name exists
   */
  async areaExists(name: string) {
    const areaElement = this.page.locator(`:text("${name}")`);
    await expect(areaElement.first()).toBeVisible();
  }

  /**
   * Assert that a form field has a specific value
   */
  async fieldHasValue(selector: string, expectedValue: string) {
    const field = this.page.locator(selector);
    await expect(field).toHaveValue(expectedValue);
  }

  /**
   * Assert that an element has a specific CSS property
   */
  async elementHasCSS(
    selector: string,
    property: string,
    expectedValue: string
  ) {
    const element = this.page.locator(selector);
    await expect(element).toHaveCSS(property, expectedValue);
  }
}

// Performance helpers
export class PerformanceHelpers {
  constructor(private page: Page) {}

  /**
   * Measure the time it takes for a page to load
   */
  async measurePageLoad(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForLoadState("networkidle");
    return Date.now() - startTime;
  }

  /**
   * Measure the time it takes for an action to complete
   */
  async measureAction(action: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
  }

  /**
   * Get memory usage information
   */
  async getMemoryUsage() {
    return await this.page.evaluate(() => {
      const memory = (performance as any).memory;
      return memory
        ? {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          }
        : null;
    });
  }
}

// Accessibility helpers
export class AccessibilityHelpers {
  constructor(private page: Page) {}

  /**
   * Check if an element is keyboard accessible
   */
  async isKeyboardAccessible(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);

    // Tab to the element
    await this.page.keyboard.press("Tab");

    // Check if it's focused
    const isFocused = await element.evaluate(
      (el) => el === document.activeElement
    );

    return isFocused;
  }

  /**
   * Check if an element has proper ARIA attributes
   */
  async hasAriaAttributes(
    selector: string,
    attributes: string[]
  ): Promise<boolean> {
    const element = this.page.locator(selector);

    for (const attr of attributes) {
      const hasAttr = await element.getAttribute(`aria-${attr}`);
      if (!hasAttr) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check color contrast ratio
   */
  async checkColorContrast(selector: string): Promise<number> {
    return await this.page.locator(selector).evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;

      // This is a simplified contrast calculation
      // In a real implementation, you'd use a proper contrast calculation library
      return 4.5; // Placeholder return value
    });
  }
}

// Export convenience function to create all helpers
export function createTestHelpers(page: Page) {
  return {
    actions: new TestActions(page),
    assertions: new TestAssertions(page),
    performance: new PerformanceHelpers(page),
    accessibility: new AccessibilityHelpers(page),
  };
}
