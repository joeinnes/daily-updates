# Daily Updates App - Test Suite

This directory contains comprehensive tests for the Daily Updates application, covering all aspects of functionality, performance, accessibility, and user experience.

## 📁 Test Structure

```
tests/
├── unit/                    # Unit tests for utilities and isolated functions
│   ├── utils.spec.ts       # Tests for utility functions (cn, contrastColor)
│   └── dateUtils.spec.ts   # Tests for date handling functions
├── components/             # Component-level tests
│   ├── AddUpdate.spec.ts   # Tests for the AddUpdate component
│   ├── UpdateList.spec.ts  # Tests for the UpdateList component
│   └── AreaManager.spec.ts # Tests for the AreaManager component
├── integration/            # Integration tests for component interactions
│   └── integration.spec.ts # Tests for workflows and component integration
├── e2e/                   # End-to-end user workflow tests
│   └── user-workflows.spec.ts # Complete user journey tests
├── accessibility/         # Accessibility and usability tests
│   └── a11y.spec.ts      # WCAG compliance and accessibility tests
├── performance/           # Performance and optimization tests
│   └── performance.spec.ts # Load time, responsiveness, and resource usage
├── api/                   # Data persistence and API tests
│   └── api.spec.ts       # Data consistency and persistence tests
├── setup/                 # Global test setup and teardown
│   ├── global-setup.ts   # Pre-test environment setup
│   └── global-teardown.ts # Post-test cleanup and reporting
├── utils/                 # Test utilities and helpers
│   └── test-helpers.ts   # Reusable test functions and utilities
├── test.config.ts         # Test configuration and settings
├── run-tests.ts          # Custom test runner script
└── README.md             # This documentation file
```

## 🧪 Test Categories

### Unit Tests
**Location:** `tests/unit/`
**Purpose:** Test individual functions and utilities in isolation
**Coverage:**
- Utility functions (`cn`, `contrastColor`)
- Date handling functions (`getMonday`, `getISOWeek`, `getMonthKey`, `getDateKey`)
- Edge cases and error conditions

### Component Tests
**Location:** `tests/components/`
**Purpose:** Test React component behavior and rendering
**Coverage:**
- Component rendering and props handling
- User interactions (clicks, form submissions)
- State management and updates
- Conditional rendering logic

### Integration Tests
**Location:** `tests/integration/`
**Purpose:** Test how components work together
**Coverage:**
- Area creation and update assignment
- Todo management workflows
- Music and regular update integration
- Edit and copy functionality
- Keyboard shortcuts and UI interactions

### End-to-End Tests
**Location:** `tests/e2e/`
**Purpose:** Test complete user workflows
**Coverage:**
- User authentication flows
- Complete update creation and management
- Area management workflows
- Theme switching and preferences
- Mobile and responsive design

### Accessibility Tests
**Location:** `tests/accessibility/`
**Purpose:** Ensure WCAG compliance and usability
**Coverage:**
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes and roles
- Color contrast ratios
- Focus management
- Form accessibility

### Performance Tests
**Location:** `tests/performance/`
**Purpose:** Monitor app performance and optimization
**Coverage:**
- Page load times
- UI responsiveness
- Memory usage
- Large dataset handling
- Resource optimization

### API Tests
**Location:** `tests/api/`
**Purpose:** Test data persistence and consistency
**Coverage:**
- Data persistence across sessions
- Concurrent operations
- Data validation and error handling
- Offline/online state transitions

## 🚀 Running Tests

### Prerequisites

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers:**
   ```bash
   npx playwright install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

### Basic Test Execution

**Run All Tests:**
```bash
npm run test
```

**Run Specific Test Suite:**
```bash
# Unit tests only
npm run test -- --suite unit

# Component tests only
npm run test -- --suite components

# Integration tests only
npm run test -- --suite integration

# End-to-end tests only
npm run test -- --suite e2e

# Accessibility tests only
npm run test -- --suite accessibility

# Performance tests only
npm run test -- --suite performance

# API tests only
npm run test -- --suite api
```

### Advanced Test Options

**Run Tests in Headed Mode (with browser UI):**
```bash
npm run test -- --headed
```

**Run Tests in Debug Mode:**
```bash
npm run test -- --debug
```

**Run Tests in Specific Browser:**
```bash
# Chromium
npm run test -- --browser chromium

# Firefox
npm run test -- --browser firefox

# WebKit (Safari)
npm run test -- --browser webkit

# Mobile Chrome
npm run test -- --browser mobile-chrome

# Mobile Safari
npm run test -- --browser mobile-safari
```

**Run Tests with Specific Pattern:**
```bash
# Run tests matching a pattern
npm run test -- --grep "should create update"

# Run tests for a specific component
npm run test -- --grep "AddUpdate"
```

**Run Tests Sequentially (no parallel execution):**
```bash
npm run test -- --no-parallel
```

**Update Visual Snapshots:**
```bash
npm run test -- --update-snapshots
```

### Direct Playwright Commands

**Run All Playwright Tests:**
```bash
npx playwright test
```

**Run Specific Test File:**
```bash
npx playwright test tests/components/AddUpdate.spec.ts
```

**Run Tests with UI Mode:**
```bash
npx playwright test --ui
```

**Generate Test Report:**
```bash
npx playwright show-report
```

## 📊 Test Reports and Results

### Generated Reports

After running tests, the following reports are generated:

1. **HTML Report:** `test-results/playwright-report/index.html`
   - Interactive test results with screenshots and videos
   - Detailed failure information and stack traces
   - Performance metrics and timing data

2. **JSON Report:** `test-results/results.json`
   - Machine-readable test results
   - Suitable for CI/CD integration

3. **JUnit Report:** `test-results/junit.xml`
   - Standard format for CI/CD systems
   - Compatible with most testing dashboards

4. **Test Summary:** `test-results/test-summary.json`
   - High-level overview of test execution
   - Environment and configuration details

5. **Performance Metrics:** `test-results/performance-metrics.json`
   - Page load times and performance data
   - Memory usage statistics

### Viewing Reports

**Open HTML Report:**
```bash
npx playwright show-report
```

**View Test Results Directory:**
```bash
ls -la test-results/
```

## 🛠️ Test Configuration

### Configuration Files

- **`playwright.config.ts`** - Main Playwright configuration
- **`tests/test.config.ts`** - Custom test suite configurations
- **`tests/setup/global-setup.ts`** - Global test setup
- **`tests/setup/global-teardown.ts`** - Global test cleanup

### Environment Variables

```bash
# Set test environment
export NODE_ENV=test

# Set base URL for tests
export BASE_URL=http://localhost:5173

# Enable CI mode
export CI=true
```

### Browser Configuration

Tests are configured to run on multiple browsers:
- **Desktop:** Chrome, Firefox, Safari
- **Mobile:** Chrome Mobile, Safari Mobile
- **Responsive:** Various viewport sizes

## 🔧 Writing New Tests

### Test File Structure

```typescript
import { test, expect } from '@playwright/test';
import { createTestHelpers } from '../utils/test-helpers';

test.describe('Component Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should perform expected behavior', async ({ page }) => {
    const { actions, assertions } = createTestHelpers(page);
    
    // Test implementation
    await actions.createUpdate('Test content');
    await assertions.updateIsVisible('Test content');
  });
});
```

### Using Test Helpers

```typescript
import { createTestHelpers } from '../utils/test-helpers';

test('example test', async ({ page }) => {
  const { actions, assertions, performance, accessibility } = createTestHelpers(page);
  
  // Create test data
  await actions.createArea('Test Area', '#ff0000');
  await actions.createUpdate('Test update', { area: 'Test Area' });
  
  // Verify results
  await assertions.updateIsVisible('Test update');
  await assertions.areaExists('Test Area');
  
  // Check performance
  const loadTime = await performance.measurePageLoad();
  expect(loadTime).toBeLessThan(3000);
  
  // Check accessibility
  const isAccessible = await accessibility.isKeyboardAccessible('button');
  expect(isAccessible).toBe(true);
});
```

### Best Practices

1. **Use Descriptive Test Names:**
   ```typescript
   test('should create update with area and display in correct section')
   ```

2. **Group Related Tests:**
   ```typescript
   test.describe('Update Creation', () => {
     // Related tests here
   });
   ```

3. **Use Test Helpers:**
   - Leverage existing helper functions
   - Create new helpers for repeated actions

4. **Handle Async Operations:**
   ```typescript
   await page.waitForTimeout(1000);
   await page.waitForLoadState('networkidle');
   ```

5. **Clean Up Test Data:**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Clean up test data
   });
   ```

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run single test in debug mode
npx playwright test --debug tests/components/AddUpdate.spec.ts

# Run with headed browser
npx playwright test --headed
```

### Screenshots and Videos

Tests automatically capture:
- **Screenshots** on failure
- **Videos** for failed tests
- **Traces** for debugging

### Console Logs

```typescript
test('debug example', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log(msg.text()));
  
  // Your test code
});
```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

### Test Execution Order

For CI/CD, tests run in this order:
1. Unit tests (fastest)
2. Component tests
3. Integration tests
4. API tests
5. Accessibility tests
6. Performance tests
7. End-to-end tests (slowest)

## 📈 Performance Monitoring

### Performance Thresholds

- **Page Load:** < 3 seconds
- **Component Render:** < 100ms
- **User Interaction:** < 50ms
- **Memory Usage:** Monitor for leaks

### Performance Test Examples

```typescript
test('should load page within performance threshold', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});
```

## ♿ Accessibility Testing

### Accessibility Standards

- **WCAG 2.1 Level AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** requirements

### Accessibility Test Examples

```typescript
test('should be keyboard accessible', async ({ page }) => {
  await page.goto('/');
  
  // Tab through interactive elements
  await page.keyboard.press('Tab');
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toBeVisible();
});
```

## 🤝 Contributing

### Adding New Tests

1. **Identify Test Category:** Determine which test suite your test belongs to
2. **Create Test File:** Follow naming convention `*.spec.ts`
3. **Use Test Helpers:** Leverage existing utilities
4. **Document Test:** Add clear descriptions and comments
5. **Run Tests:** Ensure all tests pass before submitting

### Test Review Checklist

- [ ] Test has clear, descriptive name
- [ ] Test covers both positive and negative cases
- [ ] Test uses appropriate assertions
- [ ] Test cleans up after itself
- [ ] Test is properly categorized
- [ ] Test documentation is updated

## 📞 Support

For questions about testing:

1. **Check Documentation:** Review this README and test files
2. **Run Help Command:** `npm run test -- --help`
3. **Check Playwright Docs:** [playwright.dev](https://playwright.dev)
4. **Review Test Examples:** Look at existing test files for patterns

---

**Happy Testing! 🎉**

This comprehensive test suite ensures the Daily Updates app maintains high quality, performance, and accessibility standards across all features and user workflows.