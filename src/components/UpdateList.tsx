import { EditUpdate } from "@/components/EditUpdate";
import { ToDoUpdatesDrawer } from "@/components/ToDoUpdatesDrawer";
import {
	DaySection,
	MonthSection,
	WeekSection,
} from "@/components/UpdateListItems";
import {
	getDateKey,
	getISOWeek,
	getMonday,
	getMonthKey,
} from "@/lib/dateUtils";
import { type UpdateItem, UpdatesAccount } from "@/schema";
import { useAccount } from "jazz-react";
import { useState } from "react";
import { AreaManager } from "./AreaManager";

export function UpdateList() {
	const { me } = useAccount(UpdatesAccount, {
		resolve: {
			root: {
				updates: {
					$each: true,
				},
			},
		},
	});

	const [copiedIdentifier, setCopiedIdentifier] = useState<string | null>(null);
	const [selectedUpdate] = useState<UpdateItem | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const handleDeleteUpdate = () => {
		if (!selectedUpdate || !me?.root?.updates) return;

		// Find the index of the update to delete
		const index = me.root.updates.findIndex((u) => u?.id === selectedUpdate.id);
		if (index !== -1) {
			// Remove the update from the array
			me.root.updates.splice(index, 1);
		}

		// Close the dialog
		setIsEditDialogOpen(false);
	};

	if (!me || !me.root || !me.root.updates) {
		return null;
	}

	const updatesWithDate = me.root.updates
		.filter((update) => update && update.date)
		.sort((a, b) => (a && b ? b.date.getTime() - a.date.getTime() : 0));

	const groupedByDay: Record<string, UpdateItem[]> = {};
	for (const update of updatesWithDate) {
		if (!update) continue;
		const dateKey = getDateKey(update.date);
		if (!groupedByDay[dateKey]) {
			groupedByDay[dateKey] = [];
		}
		// @ts-expect-error: update.area isn't null, but it thinks it might be for some reason. I guess theoretically it could be null if you didn't have permission to view it.
		groupedByDay[dateKey].push(update);
	}

	const sortedDayKeys = Object.keys(groupedByDay).sort((a, b) =>
		b.localeCompare(a),
	);

	let lastRenderedMonthKey: string | null = null;
	let lastRenderedWeekKey: string | null = null;

	return (
		<div className="space-y-6">
			<div className="flex justify-end mb-4 gap-2">
				<AreaManager />
				<ToDoUpdatesDrawer />
			</div>

			{selectedUpdate && (
				<EditUpdate
					update={selectedUpdate}
					isOpen={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
					onDelete={handleDeleteUpdate}
				/>
			)}

			{sortedDayKeys.map((dayKey) => {
				const dayUpdates = groupedByDay[dayKey].sort((a) =>
					a.type === "music" ? 1 : -1,
				); // Move music updates to the end
				if (!dayUpdates || dayUpdates.length === 0) return null;

				const currentDayDate = new Date(dayUpdates[0].date);
				currentDayDate.setHours(0, 0, 0, 0);

				const currentMonthKey = getMonthKey(currentDayDate);
				const currentWeekMonday = getMonday(new Date(currentDayDate));
				const currentWeekMondayKey = getDateKey(currentWeekMonday);
				const currentISOWeek = getISOWeek(currentWeekMonday);

				const renderMonthSeparator = currentMonthKey !== lastRenderedMonthKey;
				if (renderMonthSeparator) {
					lastRenderedMonthKey = currentMonthKey;
				}

				const renderWeekSeparator =
					currentWeekMondayKey !== lastRenderedWeekKey;
				if (renderWeekSeparator) {
					lastRenderedWeekKey = currentWeekMondayKey;
				}

				// Get all days in this month for month markdown generation
				const daysInThisMonth = sortedDayKeys.filter((dk) =>
					dk.startsWith(currentMonthKey),
				);

				// Get all days in this week for week markdown generation
				const daysInThisWeek = sortedDayKeys.filter(
					(dk) =>
						getDateKey(getMonday(new Date(groupedByDay[dk][0].date))) ===
						currentWeekMondayKey,
				);

				return (
					<div key={dayKey}>
						{renderMonthSeparator && (
							<MonthSection
								monthKey={currentMonthKey}
								currentMonthDate={currentDayDate}
								daysInMonth={daysInThisMonth}
								groupedByDay={groupedByDay}
								copiedIdentifier={copiedIdentifier}
								setCopiedIdentifier={setCopiedIdentifier}
							/>
						)}
						{renderWeekSeparator && (
							<WeekSection
								weekMondayKey={currentWeekMondayKey}
								currentWeekMonday={currentWeekMonday}
								currentISOWeek={currentISOWeek}
								isFirstInMonth={renderMonthSeparator}
								daysInWeek={daysInThisWeek}
								groupedByDay={groupedByDay}
								copiedIdentifier={copiedIdentifier}
								setCopiedIdentifier={setCopiedIdentifier}
							/>
						)}
						<DaySection
							dayKey={dayKey}
							currentDayDate={currentDayDate}
							dayUpdates={dayUpdates}
							isFirstInWeekOrMonth={renderWeekSeparator || renderMonthSeparator}
							copiedIdentifier={copiedIdentifier}
							setCopiedIdentifier={setCopiedIdentifier}
						/>
					</div>
				);
			})}
		</div>
	);
}
