#!/usr/bin/env ts-node

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * Comprehensive test runner for the Daily Updates app
 * Provides different test execution modes and reporting
 */

interface TestSuite {
  name: string;
  pattern: string;
  description: string;
  timeout?: number;
  retries?: number;
}

const testSuites: Record<string, TestSuite> = {
  unit: {
    name: "Unit Tests",
    pattern: "tests/unit/**/*.spec.ts",
    description: "Tests for utility functions and isolated components",
    timeout: 10000,
    retries: 0,
  },
  components: {
    name: "Component Tests",
    pattern: "tests/components/**/*.spec.ts",
    description: "Tests for React component behavior and rendering",
    timeout: 20000,
    retries: 1,
  },
  integration: {
    name: "Integration Tests",
    pattern: "tests/integration/**/*.spec.ts",
    description: "Tests for component interactions and workflows",
    timeout: 45000,
    retries: 2,
  },
  e2e: {
    name: "End-to-End Tests",
    pattern: "tests/e2e/**/*.spec.ts",
    description: "Complete user workflow tests",
    timeout: 60000,
    retries: 2,
  },
  accessibility: {
    name: "Accessibility Tests",
    pattern: "tests/accessibility/**/*.spec.ts",
    description: "Accessibility compliance and usability tests",
    timeout: 30000,
    retries: 1,
  },
  performance: {
    name: "Performance Tests",
    pattern: "tests/performance/**/*.spec.ts",
    description: "Performance benchmarks and optimization tests",
    timeout: 90000,
    retries: 0,
  },
  api: {
    name: "API Tests",
    pattern: "tests/api/**/*.spec.ts",
    description: "Data persistence and API interaction tests",
    timeout: 30000,
    retries: 2,
  },
};

interface RunOptions {
  suite?: string;
  browser?: string;
  headed?: boolean;
  debug?: boolean;
  reporter?: string;
  parallel?: boolean;
  updateSnapshots?: boolean;
  grep?: string;
  project?: string;
}

class TestRunner {
  private options: RunOptions;
  private startTime: number = 0;

  constructor(options: RunOptions = {}) {
    this.options = options;
  }

  /**
   * Main test execution method
   */
  async run(): Promise<void> {
    console.log("🚀 Daily Updates Test Runner");
    console.log("============================\n");

    this.startTime = Date.now();

    try {
      // Validate environment
      await this.validateEnvironment();

      // Setup test environment
      await this.setupTestEnvironment();

      // Run tests based on options
      if (this.options.suite) {
        await this.runTestSuite(this.options.suite);
      } else {
        await this.runAllTests();
      }

      // Generate reports
      await this.generateReports();

      console.log("\n✅ All tests completed successfully!");
    } catch (error) {
      console.error("\n❌ Test execution failed:", error);
      process.exit(1);
    } finally {
      const duration = Date.now() - this.startTime;
      console.log(
        `\n⏱️ Total execution time: ${this.formatDuration(duration)}`
      );
    }
  }

  /**
   * Validate that the environment is ready for testing
   */
  private async validateEnvironment(): Promise<void> {
    console.log("🔍 Validating test environment...");

    // Check if package.json exists
    if (!fs.existsSync("package.json")) {
      throw new Error("package.json not found. Please run from project root.");
    }

    // Check if node_modules exists
    if (!fs.existsSync("node_modules")) {
      console.log("📦 Installing dependencies...");
      execSync("npm install", { stdio: "inherit" });
    }

    // Check if Playwright browsers are installed
    try {
      execSync("npx playwright --version", { stdio: "pipe" });
    } catch {
      console.log("🎭 Installing Playwright browsers...");
      execSync("npx playwright install", { stdio: "inherit" });
    }

    console.log("✅ Environment validation completed\n");
  }

  /**
   * Setup test environment and directories
   */
  private async setupTestEnvironment(): Promise<void> {
    console.log("🛠️ Setting up test environment...");

    // Create test results directory
    const testResultsDir = "test-results";
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }

    // Create subdirectories for different types of results
    const subdirs = ["screenshots", "videos", "traces", "reports"];
    subdirs.forEach((subdir) => {
      const dirPath = path.join(testResultsDir, subdir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    console.log("✅ Test environment setup completed\n");
  }

  /**
   * Run a specific test suite
   */
  private async runTestSuite(suiteName: string): Promise<void> {
    const suite = testSuites[suiteName];
    if (!suite) {
      throw new Error(`Unknown test suite: ${suiteName}`);
    }

    console.log(`🧪 Running ${suite.name}`);
    console.log(`📝 ${suite.description}\n`);

    const command = this.buildPlaywrightCommand(suite);

    try {
      execSync(command, { stdio: "inherit" });
      console.log(`\n✅ ${suite.name} completed successfully`);
    } catch (error) {
      console.error(`\n❌ ${suite.name} failed`);
      throw error;
    }
  }

  /**
   * Run all test suites in sequence
   */
  private async runAllTests(): Promise<void> {
    console.log("🧪 Running all test suites\n");

    const suiteOrder = [
      "unit",
      "components",
      "integration",
      "api",
      "accessibility",
      "performance",
      "e2e",
    ];

    for (const suiteName of suiteOrder) {
      if (testSuites[suiteName]) {
        await this.runTestSuite(suiteName);
        console.log(""); // Add spacing between suites
      }
    }
  }

  /**
   * Build Playwright command with appropriate options
   */
  private buildPlaywrightCommand(suite: TestSuite): string {
    let command = "npx playwright test";

    // Add test pattern
    command += ` "${suite.pattern}"`;

    // Add browser option
    if (this.options.browser) {
      command += ` --project=${this.options.browser}`;
    }

    // Add headed mode
    if (this.options.headed) {
      command += " --headed";
    }

    // Add debug mode
    if (this.options.debug) {
      command += " --debug";
    }

    // Add reporter
    if (this.options.reporter) {
      command += ` --reporter=${this.options.reporter}`;
    } else {
      command += " --reporter=list";
    }

    // Add parallel execution
    if (this.options.parallel === false) {
      command += " --workers=1";
    }

    // Add update snapshots
    if (this.options.updateSnapshots) {
      command += " --update-snapshots";
    }

    // Add grep pattern
    if (this.options.grep) {
      command += ` --grep="${this.options.grep}"`;
    }

    // Add timeout
    if (suite.timeout) {
      command += ` --timeout=${suite.timeout}`;
    }

    // Add retries
    if (suite.retries !== undefined) {
      command += ` --retries=${suite.retries}`;
    }

    return command;
  }

  /**
   * Generate test reports and summaries
   */
  private async generateReports(): Promise<void> {
    console.log("\n📊 Generating test reports...");

    try {
      // Generate HTML report
      execSync("npx playwright show-report --host=127.0.0.1", {
        stdio: "pipe",
      });

      // Create summary report
      const summary = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        suites: Object.keys(testSuites).map((key) => ({
          name: testSuites[key].name,
          description: testSuites[key].description,
        })),
        options: this.options,
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      };

      fs.writeFileSync(
        "test-results/test-summary.json",
        JSON.stringify(summary, null, 2)
      );

      console.log("✅ Test reports generated");
      console.log("📄 HTML report: test-results/playwright-report/index.html");
      console.log("📄 Summary: test-results/test-summary.json");
    } catch (error) {
      console.warn("⚠️ Report generation failed:", error);
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Display help information
   */
  static displayHelp(): void {
    console.log("Daily Updates Test Runner");
    console.log("========================\n");
    console.log("Usage: npm run test [options]\n");
    console.log("Options:");
    console.log("  --suite <name>        Run specific test suite");
    console.log(
      "  --browser <name>      Run tests in specific browser (chromium, firefox, webkit)"
    );
    console.log("  --headed              Run tests in headed mode");
    console.log("  --debug               Run tests in debug mode");
    console.log(
      "  --reporter <name>     Use specific reporter (list, html, json)"
    );
    console.log("  --no-parallel         Run tests sequentially");
    console.log("  --update-snapshots    Update visual snapshots");
    console.log("  --grep <pattern>      Run tests matching pattern");
    console.log("  --help                Show this help\n");
    console.log("Available test suites:");
    Object.entries(testSuites).forEach(([key, suite]) => {
      console.log(`  ${key.padEnd(12)} ${suite.description}`);
    });
    console.log("\nExamples:");
    console.log("  npm run test                    # Run all tests");
    console.log("  npm run test -- --suite unit   # Run only unit tests");
    console.log("  npm run test -- --headed       # Run tests with browser UI");
    console.log("  npm run test -- --debug        # Run tests in debug mode");
  }
}

// Parse command line arguments
function parseArgs(): RunOptions {
  const args = process.argv.slice(2);
  const options: RunOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--suite":
        options.suite = args[++i];
        break;
      case "--browser":
        options.browser = args[++i];
        break;
      case "--headed":
        options.headed = true;
        break;
      case "--debug":
        options.debug = true;
        break;
      case "--reporter":
        options.reporter = args[++i];
        break;
      case "--no-parallel":
        options.parallel = false;
        break;
      case "--update-snapshots":
        options.updateSnapshots = true;
        break;
      case "--grep":
        options.grep = args[++i];
        break;
      case "--project":
        options.project = args[++i];
        break;
      case "--help":
        TestRunner.displayHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const runner = new TestRunner(options);
  runner.run().catch((error) => {
    console.error("Test runner failed:", error);
    process.exit(1);
  });
}

export { TestRunner, testSuites };
