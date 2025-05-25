import { test, expect } from "@playwright/test";
import {
  getMonday,
  getISOWeek,
  getMonthKey,
  getDateKey,
} from "../../src/lib/dateUtils";

test.describe("Date Utils", () => {
  test.describe("getMonday function", () => {
    test("should return Monday for a date in the middle of the week", () => {
      const wednesday = new Date("2024-01-03"); // Wednesday
      const monday = getMonday(wednesday);
      expect(monday.getDay()).toBe(1); // Monday
      expect(monday.toISOString().split("T")[0]).toBe("2024-01-01");
    });

    test("should return the same date if it is already Monday", () => {
      const monday = new Date("2024-01-01"); // Monday
      const result = getMonday(monday);
      expect(result.getDay()).toBe(1);
      expect(result.toISOString().split("T")[0]).toBe("2024-01-01");
    });

    test("should return previous Monday for Sunday", () => {
      const sunday = new Date("2024-01-07"); // Sunday
      const monday = getMonday(sunday);
      expect(monday.getDay()).toBe(1);
      expect(monday.toISOString().split("T")[0]).toBe("2024-01-01");
    });

    test("should set time to 00:00:00.000", () => {
      const date = new Date("2024-01-03T15:30:45.123");
      const monday = getMonday(date);
      expect(monday.getHours()).toBe(0);
      expect(monday.getMinutes()).toBe(0);
      expect(monday.getSeconds()).toBe(0);
      expect(monday.getMilliseconds()).toBe(0);
    });
  });

  test.describe("getISOWeek function", () => {
    test("should return correct ISO week number", () => {
      expect(getISOWeek(new Date("2024-01-01"))).toBe(1);
      expect(getISOWeek(new Date("2024-01-08"))).toBe(2);
      expect(getISOWeek(new Date("2024-12-30"))).toBe(1); // Week 1 of 2025
    });

    test("should handle year boundaries correctly", () => {
      // December 31, 2023 is in week 52 of 2023
      expect(getISOWeek(new Date("2023-12-31"))).toBe(52);
      // January 1, 2024 is in week 1 of 2024
      expect(getISOWeek(new Date("2024-01-01"))).toBe(1);
    });

    test("should be consistent across different days of the same week", () => {
      const monday = new Date("2024-01-01");
      const tuesday = new Date("2024-01-02");
      const sunday = new Date("2024-01-07");

      const weekNumber = getISOWeek(monday);
      expect(getISOWeek(tuesday)).toBe(weekNumber);
      expect(getISOWeek(sunday)).toBe(weekNumber);
    });
  });

  test.describe("getMonthKey function", () => {
    test("should return correct month key format", () => {
      expect(getMonthKey(new Date("2024-01-15"))).toBe("2024-01");
      expect(getMonthKey(new Date("2024-12-31"))).toBe("2024-12");
      expect(getMonthKey(new Date("2023-05-01"))).toBe("2023-05");
    });

    test("should pad single digit months with zero", () => {
      expect(getMonthKey(new Date("2024-01-01"))).toBe("2024-01");
      expect(getMonthKey(new Date("2024-09-15"))).toBe("2024-09");
    });

    test("should handle different days in the same month consistently", () => {
      const firstDay = new Date("2024-03-01");
      const middleDay = new Date("2024-03-15");
      const lastDay = new Date("2024-03-31");

      const monthKey = getMonthKey(firstDay);
      expect(getMonthKey(middleDay)).toBe(monthKey);
      expect(getMonthKey(lastDay)).toBe(monthKey);
      expect(monthKey).toBe("2024-03");
    });
  });

  test.describe("getDateKey function", () => {
    test("should return correct ISO date string", () => {
      expect(getDateKey(new Date("2024-01-15T10:30:00"))).toBe("2024-01-15");
      expect(getDateKey(new Date("2023-12-31T23:59:59"))).toBe("2023-12-31");
      expect(getDateKey(new Date("2024-07-04T00:00:00"))).toBe("2024-07-04");
    });

    test("should ignore time component", () => {
      const morning = new Date("2024-06-15T08:00:00");
      const evening = new Date("2024-06-15T20:00:00");

      expect(getDateKey(morning)).toBe("2024-06-15");
      expect(getDateKey(evening)).toBe("2024-06-15");
      expect(getDateKey(morning)).toBe(getDateKey(evening));
    });

    test("should handle timezone differences consistently", () => {
      const utcDate = new Date("2024-03-15T12:00:00Z");
      const dateKey = getDateKey(utcDate);
      expect(dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
