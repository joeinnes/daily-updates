import { chromium, FullConfig } from "@playwright/test";

/**
 * Global setup for all test suites
 * Runs once before all tests begin
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global test setup...");

  const { baseURL } = config.projects[0].use;

  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    console.log("⏳ Waiting for application to be ready...");
    await page.goto(baseURL!);
    await page.waitForLoadState("networkidle", { timeout: 60000 });

    // Check if the app is properly loaded
    const appLoaded = await page.locator("body").isVisible();
    if (!appLoaded) {
      throw new Error("Application failed to load properly");
    }

    console.log("✅ Application is ready");

    // Perform any global authentication or setup
    await setupTestEnvironment(page);

    // Clear any existing test data
    await clearTestData(page);

    console.log("✅ Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Setup test environment with necessary configurations
 */
async function setupTestEnvironment(page: any) {
  console.log("🔧 Setting up test environment...");

  try {
    // Set up any necessary localStorage or sessionStorage items
    await page.evaluate(() => {
      // Clear any existing data
      localStorage.clear();
      sessionStorage.clear();

      // Set test environment flag
      localStorage.setItem("test-environment", "true");

      // Set any default preferences for testing
      localStorage.setItem("theme", "light");
      localStorage.setItem("test-mode", "enabled");
    });

    // Wait for any initialization to complete
    await page.waitForTimeout(1000);

    console.log("✅ Test environment setup completed");
  } catch (error) {
    console.error("❌ Test environment setup failed:", error);
    throw error;
  }
}

/**
 * Clear any existing test data to ensure clean test runs
 */
async function clearTestData(page: any) {
  console.log("🧹 Clearing existing test data...");

  try {
    // Clear any test-specific data
    await page.evaluate(() => {
      // Remove any test data from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes("test") || key.includes("Test")) {
          localStorage.removeItem(key);
        }
      });
    });

    // Clear any cookies that might interfere with tests
    await page.context().clearCookies();

    console.log("✅ Test data cleared successfully");
  } catch (error) {
    console.error("❌ Failed to clear test data:", error);
    // Don't throw here as this is not critical
  }
}

/**
 * Verify application health before running tests
 */
async function verifyApplicationHealth(page: any) {
  console.log("🏥 Verifying application health...");

  try {
    // Check if critical elements are present
    const criticalElements = ["body", 'main, #root, [data-testid="app"]'];

    for (const selector of criticalElements) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 5000 });

      if (!isVisible) {
        throw new Error(`Critical element not found: ${selector}`);
      }
    }

    // Check for any critical errors in console
    const errors: string[] = [];
    page.on("console", (msg: any) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Wait a bit to collect any immediate errors
    await page.waitForTimeout(2000);

    // Filter out non-critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("Console Ninja") &&
        !error.includes("DevTools")
    );

    if (criticalErrors.length > 0) {
      console.warn("⚠️ Console errors detected:", criticalErrors);
      // Don't fail setup for console errors, just warn
    }

    console.log("✅ Application health check passed");
  } catch (error) {
    console.error("❌ Application health check failed:", error);
    throw error;
  }
}

/**
 * Setup test data that will be used across multiple tests
 */
async function setupGlobalTestData(page: any) {
  console.log("📊 Setting up global test data...");

  try {
    // Create standard test areas that can be used across tests
    const testAreas = [
      { name: "Test Work Area", color: "#3b82f6" },
      { name: "Test Personal Area", color: "#10b981" },
    ];

    // Note: In a real app, you might want to create these through the UI
    // or API calls. For now, we'll just set them up in localStorage
    await page.evaluate((areas) => {
      localStorage.setItem("global-test-areas", JSON.stringify(areas));
    }, testAreas);

    console.log("✅ Global test data setup completed");
  } catch (error) {
    console.error("❌ Global test data setup failed:", error);
    // Don't throw here as this is not critical for all tests
  }
}

/**
 * Setup performance monitoring for tests
 */
async function setupPerformanceMonitoring(page: any) {
  console.log("📈 Setting up performance monitoring...");

  try {
    // Enable performance monitoring
    await page.evaluate(() => {
      // Mark the start of test performance monitoring
      if (window.performance && window.performance.mark) {
        window.performance.mark("test-setup-start");
      }
    });

    console.log("✅ Performance monitoring setup completed");
  } catch (error) {
    console.error("❌ Performance monitoring setup failed:", error);
    // Don't throw here as this is not critical
  }
}

export default globalSetup;
