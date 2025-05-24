import { getISOWeek, getMonday } from "./dateUtils";

import type { UpdateItem } from "@/schema";

export function formatUpdateItemToMarkdown(
	update: UpdateItem,
	indentLevel = 0,
): string {
	let markdown = "";
	const indent = "  ".repeat(indentLevel);
	if (update.type == "update" && update.area) {
		const areaName = update.area?.name ? `[${update.area.name}] ` : "";
		markdown += `${indent} - ${areaName}${update.update || ""}${
			update.link ? " [🔗](" + update.link + ")" : ""
		}\n`;

		// Convert HTML details to plain text if needed
		if (typeof document !== "undefined") {
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = (update.details ?? "").toString();
			const plainTextDetails = (
				tempDiv.textContent ||
				tempDiv.innerText ||
				""
			).trim();
			if (plainTextDetails) {
				const detailIndent = "  ".repeat(indentLevel + 1);
				markdown += `${detailIndent} - ${plainTextDetails.replace(
					/\n/g,
					`\n${detailIndent}   `,
				)}\n`;
			}
		} else {
			// Fallback for non-browser environments
			const detailIndent = "  ".repeat(indentLevel + 1);
			markdown += `${detailIndent} - ${(update.details ?? "")
				.toString()
				.replace(/\n/g, `\n${detailIndent}   `)}\n`;
		}
	} else if (update.type === "music") {
		markdown += `${indent} - [🎶 ${update.name}](${update.link})\n`;
	}
	return markdown;
}

/**
 * Generates markdown for a day's updates
 */
export async function generateDayMarkdown(
	dayDate: Date,
	dayUpdates: UpdateItem[],
	headingLevel = 1,
): Promise<string> {
	const dayTitle = dayDate.toLocaleDateString(undefined, {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
	// Create heading with the appropriate number of # characters
	const heading = "#".repeat(headingLevel);
	let markdown = `${heading} ${dayTitle}\n\n`;

	for (const update of dayUpdates) {
		if (update.type === "update") {
			await update.ensureLoaded({
				resolve: {
					area: true,
				},
			});
		}
		markdown += formatUpdateItemToMarkdown(update);
	}
	return markdown;
}

/**
 * Generates markdown for a week's updates
 */
export async function generateWeekMarkdown(
	weekMonday: Date,
	weekDayKeys: string[],
	allGroupedUpdates: Record<string, UpdateItem[]>,
	headingLevel = 1,
): Promise<string> {
	const isoWeek = getISOWeek(weekMonday);
	const weekTitle = `Week of ${weekMonday.toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
	})} (Week ${String(isoWeek).padStart(2, "0")})`;

	// Create heading with the appropriate number of # characters
	const heading = "#".repeat(headingLevel);
	let markdown = `${heading} ${weekTitle}\n\n`;

	weekDayKeys.sort((a, b) => a.localeCompare(b));
	for (const dayKey of weekDayKeys) {
		const dayUpdates = allGroupedUpdates[dayKey];
		if (dayUpdates && dayUpdates.length > 0) {
			const dayDate = new Date(dayUpdates[0].date);
			// Pass headingLevel + 1 to make day headings one level deeper
			markdown += await generateDayMarkdown(
				dayDate,
				dayUpdates,
				headingLevel + 1,
			);
		}
	}
	return markdown;
}

/**
 * Generates markdown for a month's updates
 */
export async function generateMonthMarkdown(
	monthKey: string,
	monthDayKeys: string[],
	allGroupedUpdates: Record<string, UpdateItem[]>,
	headingLevel = 1,
): Promise<string> {
	const monthDate = new Date(monthKey + "-01T00:00:00");
	const monthTitle = monthDate.toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
	});

	// Create heading with the appropriate number of # characters
	const heading = "#".repeat(headingLevel);
	let markdown = `${heading} ${monthTitle}\n\n`;

	const weeksInMonth: { [weekKey: string]: string[] } = {};
	monthDayKeys.forEach((dayKey) => {
		const dayDate = new Date(allGroupedUpdates[dayKey][0].date);
		const weekMonday = getMonday(dayDate);
		const weekMondayKey = weekMonday.toISOString().split("T")[0];
		if (!weeksInMonth[weekMondayKey]) {
			weeksInMonth[weekMondayKey] = [];
		}
		weeksInMonth[weekMondayKey].push(dayKey);
	});

	for (const weekKey of Object.keys(weeksInMonth)) {
		const firstDayOfWeekDate = new Date(weekKey + "T00:00:00");
		// Pass headingLevel + 1 to make week headings one level deeper
		markdown += await generateWeekMarkdown(
			firstDayOfWeekDate,
			weeksInMonth[weekKey],
			allGroupedUpdates,
			headingLevel + 1,
		);
	}
	return markdown;
}
