import { chromium, FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Global teardown for all test suites
 * Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting global test teardown...");

  const { baseURL } = config.projects[0].use;

  // Launch browser for teardown
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Connect to the application
    await page.goto(baseURL!);
    await page.waitForLoadState("networkidle", { timeout: 30000 });

    // Clean up test data
    await cleanupTestData(page);

    // Generate test reports
    await generateTestReports();

    // Collect performance metrics
    await collectPerformanceMetrics(page);

    // Clean up test artifacts
    await cleanupTestArtifacts();

    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw here as teardown failures shouldn't fail the test run
  } finally {
    await browser.close();
  }
}

/**
 * Clean up any test data that was created during test runs
 */
async function cleanupTestData(page: any) {
  console.log("🗑️ Cleaning up test data...");

  try {
    // Clear all test-related localStorage data
    await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (
          key.includes("test") ||
          key.includes("Test") ||
          key.includes("API Test") ||
          key.includes("Integration Test") ||
          key.includes("global-test")
        ) {
          localStorage.removeItem(key);
        }
      });

      // Remove test environment flag
      localStorage.removeItem("test-environment");
      localStorage.removeItem("test-mode");
    });

    // Clear any test cookies
    await page.context().clearCookies();

    // Clear any test session storage
    await page.evaluate(() => {
      sessionStorage.clear();
    });

    console.log("✅ Test data cleanup completed");
  } catch (error) {
    console.error("❌ Test data cleanup failed:", error);
  }
}

/**
 * Generate comprehensive test reports
 */
async function generateTestReports() {
  console.log("📊 Generating test reports...");

  try {
    const testResultsDir = path.join(process.cwd(), "test-results");

    // Ensure test results directory exists
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }

    // Generate summary report
    const summaryReport = {
      timestamp: new Date().toISOString(),
      testRun: {
        environment: process.env.NODE_ENV || "test",
        baseURL: process.env.BASE_URL || "http://localhost:5173",
        browser: "chromium",
        testSuites: [
          "unit",
          "components",
          "integration",
          "e2e",
          "accessibility",
          "performance",
          "api",
        ],
      },
      metrics: {
        totalTestFiles: getTestFileCount(),
        estimatedDuration: "Variable based on test suite",
      },
    };

    const summaryPath = path.join(testResultsDir, "test-summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));

    // Generate test coverage report placeholder
    const coverageReport = {
      timestamp: new Date().toISOString(),
      coverage: {
        components: "See individual test files for component coverage",
        utils: "Unit tests cover utility functions",
        integration: "Integration tests cover component interactions",
        e2e: "End-to-end tests cover user workflows",
      },
    };

    const coveragePath = path.join(testResultsDir, "coverage-summary.json");
    fs.writeFileSync(coveragePath, JSON.stringify(coverageReport, null, 2));

    console.log("✅ Test reports generated successfully");
  } catch (error) {
    console.error("❌ Test report generation failed:", error);
  }
}

/**
 * Collect performance metrics from the test run
 */
async function collectPerformanceMetrics(page: any) {
  console.log("📈 Collecting performance metrics...");

  try {
    const metrics = await page.evaluate(() => {
      const performance = window.performance;

      if (!performance) {
        return { error: "Performance API not available" };
      }

      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const marks = performance.getEntriesByType("mark");
      const measures = performance.getEntriesByType("measure");

      return {
        navigation: navigation
          ? {
              domContentLoaded:
                navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              totalTime: navigation.loadEventEnd - navigation.fetchStart,
            }
          : null,
        marks: marks.map((mark) => ({
          name: mark.name,
          startTime: mark.startTime,
        })),
        measures: measures.map((measure) => ({
          name: measure.name,
          duration: measure.duration,
        })),
        memory: (performance as any).memory
          ? {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
              jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            }
          : null,
      };
    });

    const testResultsDir = path.join(process.cwd(), "test-results");
    const metricsPath = path.join(testResultsDir, "performance-metrics.json");

    const performanceReport = {
      timestamp: new Date().toISOString(),
      metrics,
      notes: "Performance metrics collected during teardown",
    };

    fs.writeFileSync(metricsPath, JSON.stringify(performanceReport, null, 2));

    console.log("✅ Performance metrics collected");
  } catch (error) {
    console.error("❌ Performance metrics collection failed:", error);
  }
}

/**
 * Clean up test artifacts and temporary files
 */
async function cleanupTestArtifacts() {
  console.log("🧽 Cleaning up test artifacts...");

  try {
    const testResultsDir = path.join(process.cwd(), "test-results");

    // Clean up old screenshots (keep only recent ones)
    const screenshotsDir = path.join(testResultsDir, "screenshots");
    if (fs.existsSync(screenshotsDir)) {
      const files = fs.readdirSync(screenshotsDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      files.forEach((file) => {
        const filePath = path.join(screenshotsDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Clean up old video recordings (keep only recent ones)
    const videosDir = path.join(testResultsDir, "videos");
    if (fs.existsSync(videosDir)) {
      const files = fs.readdirSync(videosDir);
      const now = Date.now();
      const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days

      files.forEach((file) => {
        const filePath = path.join(videosDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    }

    console.log("✅ Test artifacts cleanup completed");
  } catch (error) {
    console.error("❌ Test artifacts cleanup failed:", error);
  }
}

/**
 * Get count of test files for reporting
 */
function getTestFileCount(): number {
  try {
    const testsDir = path.join(process.cwd(), "tests");
    let count = 0;

    function countTestFiles(dir: string) {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          countTestFiles(filePath);
        } else if (file.endsWith(".spec.ts")) {
          count++;
        }
      });
    }

    if (fs.existsSync(testsDir)) {
      countTestFiles(testsDir);
    }

    return count;
  } catch (error) {
    console.error("❌ Failed to count test files:", error);
    return 0;
  }
}

/**
 * Generate test execution summary
 */
async function generateExecutionSummary() {
  console.log("📋 Generating execution summary...");

  try {
    const summary = {
      timestamp: new Date().toISOString(),
      testExecution: {
        environment: process.env.NODE_ENV || "test",
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
      },
      testSuites: {
        unit: "Tests for utility functions and isolated components",
        components: "Tests for React component behavior and rendering",
        integration: "Tests for component interactions and workflows",
        e2e: "End-to-end user workflow tests",
        accessibility: "Accessibility compliance and usability tests",
        performance: "Performance benchmarks and optimization tests",
        api: "Data persistence and API interaction tests",
      },
      recommendations: [
        "Run tests regularly during development",
        "Monitor performance test results for regressions",
        "Update accessibility tests when UI changes",
        "Review integration tests when adding new features",
      ],
    };

    const testResultsDir = path.join(process.cwd(), "test-results");
    const summaryPath = path.join(testResultsDir, "execution-summary.json");

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log("✅ Execution summary generated");
  } catch (error) {
    console.error("❌ Execution summary generation failed:", error);
  }
}

export default globalTeardown;
