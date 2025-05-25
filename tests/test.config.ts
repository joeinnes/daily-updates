import { defineConfig } from "@playwright/test";

/**
 * Test configuration for the Daily Updates app
 * Organizes different test suites and their specific settings
 */
export default defineConfig({
  // Test directory structure
  testDir: "./tests",

  // Global test settings
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Parallel execution
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  // Global setup and teardown
  globalSetup: require.resolve("./tests/setup/global-setup.ts"),
  globalTeardown: require.resolve("./tests/setup/global-teardown.ts"),

  // Output directory
  outputDir: "test-results/",

  // Browser projects for cross-browser testing
  projects: [
    {
      name: "chromium",
      use: {
        ...require("@playwright/test").devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "retain-on-failure",
      },
    },
    {
      name: "firefox",
      use: {
        ...require("@playwright/test").devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
    },
    {
      name: "webkit",
      use: {
        ...require("@playwright/test").devices["Desktop Safari"],
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...require("@playwright/test").devices["Pixel 5"],
        ignoreHTTPSErrors: true,
        screenshot: "only-on-failure",
      },
    },
    {
      name: "mobile-safari",
      use: {
        ...require("@playwright/test").devices["iPhone 12"],
        ignoreHTTPSErrors: true,
        screenshot: "only-on-failure",
      },
    },
  ],

  // Web server configuration
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Test metadata and tags
  metadata: {
    "test-suite": "daily-updates-comprehensive",
    "app-version": process.env.npm_package_version || "unknown",
    "test-environment": process.env.NODE_ENV || "test",
  },

  // Use base URL
  use: {
    baseURL: "http://localhost:5173",
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
});

// Test suite configurations for different test types
export const testSuites = {
  unit: {
    testMatch: "**/unit/**/*.spec.ts",
    timeout: 10000,
    retries: 0,
  },

  components: {
    testMatch: "**/components/**/*.spec.ts",
    timeout: 20000,
    retries: 1,
  },

  integration: {
    testMatch: "**/integration/**/*.spec.ts",
    timeout: 45000,
    retries: 2,
  },

  e2e: {
    testMatch: "**/e2e/**/*.spec.ts",
    timeout: 60000,
    retries: 2,
  },

  accessibility: {
    testMatch: "**/accessibility/**/*.spec.ts",
    timeout: 30000,
    retries: 1,
  },

  performance: {
    testMatch: "**/performance/**/*.spec.ts",
    timeout: 90000,
    retries: 0,
  },

  api: {
    testMatch: "**/api/**/*.spec.ts",
    timeout: 30000,
    retries: 2,
  },
};

// Environment-specific configurations
export const environments = {
  development: {
    baseURL: "http://localhost:5173",
    timeout: 30000,
  },

  staging: {
    baseURL: process.env.STAGING_URL || "https://staging.daily-updates.com",
    timeout: 45000,
  },

  production: {
    baseURL: process.env.PRODUCTION_URL || "https://daily-updates.com",
    timeout: 60000,
  },
};

// Test data configuration
export const testData = {
  users: {
    testUser: {
      email: "test@example.com",
      name: "Test User",
    },
  },

  areas: {
    work: {
      name: "Work",
      color: "#3b82f6",
    },
    personal: {
      name: "Personal",
      color: "#10b981",
    },
    projects: {
      name: "Projects",
      color: "#f59e0b",
    },
  },

  updates: {
    sample: {
      content: "Sample update for testing",
      details: "This is a detailed description of the update",
    },
    music: {
      name: "Test Song",
      artist: "Test Artist",
      link: "https://example.com/test-song",
    },
  },
};

// Utility functions for test configuration
export const getTestConfig = (suite: keyof typeof testSuites) => {
  return {
    ...testSuites[suite],
    use: {
      baseURL: environments.development.baseURL,
    },
  };
};

export const getEnvironmentConfig = (env: keyof typeof environments) => {
  return environments[env];
};

// Test tags for organizing test runs
export const testTags = {
  smoke: "@smoke",
  regression: "@regression",
  critical: "@critical",
  slow: "@slow",
  flaky: "@flaky",
  mobile: "@mobile",
  desktop: "@desktop",
};

// Custom test fixtures and utilities
export const customFixtures = {
  // Add custom fixtures here as needed
  testArea: async ({ page }, use) => {
    // Create a test area for use in tests
    const area = {
      name: `Test Area ${Date.now()}`,
      color: "#ff0000",
    };

    // Setup code here
    await use(area);

    // Cleanup code here
  },

  testUpdate: async ({ page }, use) => {
    // Create a test update for use in tests
    const update = {
      content: `Test Update ${Date.now()}`,
      details: "Test update details",
    };

    // Setup code here
    await use(update);

    // Cleanup code here
  },
};
