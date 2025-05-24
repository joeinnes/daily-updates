import { type UpdateItem } from "@/schema";
import { Check, Copy, Pencil, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateMonthMarkdown,
  generateWeekMarkdown,
  generateDayMarkdown,
} from "@/lib/markdownUtils";
import { useState } from "react";
import { EditUpdate } from "./EditUpdate";

type CopyButtonProps = {
  onClick: () => void;
  isCopied: boolean;
  label: string;
};

/**
 * Reusable copy button component
 */
export function CopyButton({ onClick, isCopied, label }: CopyButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={`Copy ${label} to clipboard`}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="ml-2 text-xs">
        {isCopied ? "Copied!" : `Copy ${label}`}
      </span>
    </Button>
  );
}

type MonthSectionProps = {
  monthKey: string;
  currentMonthDate: Date;
  daysInMonth: string[];
  groupedByDay: Record<string, UpdateItem[]>;
  copiedIdentifier: string | null;
  setCopiedIdentifier: (id: string | null) => void;
};

/**
 * Component for rendering a month section with its updates
 */
export function MonthSection({
  monthKey,
  daysInMonth,
  groupedByDay,
  copiedIdentifier,
  setCopiedIdentifier,
}: MonthSectionProps) {
  const monthId = `month-${monthKey}`;

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard
      .writeText(text?.trim())
      .then(() => {
        setCopiedIdentifier(identifier);
        setTimeout(() => setCopiedIdentifier(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div
      id={monthId}
      className="mt-10 mb-4 pb-2 border-b-2 border-primary flex justify-between items-center"
    >
      <h2 className="text-2xl font-bold text-primary">
        {new Date(monthKey + "-01T00:00:00").toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
        })}
      </h2>
      <CopyButton
        onClick={async () => {
          // Pass headingLevel 1 for month as top-level heading
          const md = await generateMonthMarkdown(
            monthKey,
            daysInMonth,
            groupedByDay,
            1
          );
          copyToClipboard(md, monthId);
        }}
        isCopied={copiedIdentifier === monthId}
        label="Month"
      />
    </div>
  );
}

type WeekSectionProps = {
  weekMondayKey: string;
  currentWeekMonday: Date;
  currentISOWeek: number;
  isFirstInMonth: boolean;
  daysInWeek: string[];
  groupedByDay: Record<string, UpdateItem[]>;
  copiedIdentifier: string | null;
  setCopiedIdentifier: (id: string | null) => void;
};

/**
 * Component for rendering a week section with its updates
 */
export function WeekSection({
  weekMondayKey,
  currentWeekMonday,
  currentISOWeek,
  isFirstInMonth,
  daysInWeek,
  groupedByDay,
  copiedIdentifier,
  setCopiedIdentifier,
}: WeekSectionProps) {
  const weekId = `week-${weekMondayKey}`;

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard
      .writeText(text.trim())
      .then(() => {
        setCopiedIdentifier(identifier);
        setTimeout(() => setCopiedIdentifier(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div
      id={weekId}
      className={`mt-6 mb-3 pb-1 flex justify-between items-center ${
        isFirstInMonth ? "" : "pt-2 border-t border-border"
      }`}
    >
      <h3 className="text-xl font-semibold text-muted-foreground">
        Week of{" "}
        {currentWeekMonday.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
        })}
        <span className="text-sm font-normal ml-2">
          (Week {String(currentISOWeek).padStart(2, "0")})
        </span>
      </h3>
      <CopyButton
        onClick={async () => {
          // Pass headingLevel 1 for week as top-level heading
          const md = await generateWeekMarkdown(
            currentWeekMonday,
            daysInWeek,
            groupedByDay,
            1
          );
          copyToClipboard(md, weekId);
        }}
        isCopied={copiedIdentifier === weekId}
        label="Week"
      />
    </div>
  );
}

type DaySectionProps = {
  dayKey: string;
  currentDayDate: Date;
  dayUpdates: UpdateItem[];
  isFirstInWeekOrMonth: boolean;
  copiedIdentifier: string | null;
  setCopiedIdentifier: (id: string | null) => void;
};

/**
 * Component for rendering a day section with its updates
 */
export function DaySection({
  dayKey,
  currentDayDate,
  dayUpdates,
  isFirstInWeekOrMonth,
  copiedIdentifier,
  setCopiedIdentifier,
}: DaySectionProps) {
  const dayId = `day-${dayKey}`;
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard
      .writeText(text?.trim())
      .then(() => {
        setCopiedIdentifier(identifier);
        setTimeout(() => setCopiedIdentifier(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const handleEditClick = (update: UpdateItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedUpdate(update);
    setIsEditDialogOpen(true);
  };

  return (
    <div key={dayKey}>
      <div
        id={dayId}
        className={`mt-4 flex justify-between items-center ${
          isFirstInWeekOrMonth ? "" : "pt-2 border-t border-border"
        }`}
      >
        <h4 className="text-lg font-medium text-foreground">
          {currentDayDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h4>
        <CopyButton
          onClick={async () => {
            // Pass headingLevel 1 for day as top-level heading
            const md = await generateDayMarkdown(currentDayDate, dayUpdates, 1);
            copyToClipboard(md, dayId);
          }}
          isCopied={copiedIdentifier === dayId}
          label="Day"
        />
      </div>

      {selectedUpdate && (
        <EditUpdate
          update={selectedUpdate}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
      <div className="mt-2 space-y-3 pl-4 border-l-2 border-gray-200 ml-1 grid gap-2 grid-cols-[max-content_1fr]">
        {dayUpdates.map((update) => (
          <div className="contents" key={update.id}>
            {update.type === "update" && update.area && (
              <>
                <div className="flex flex-col justify-center">
                  <Badge
                    style={{
                      backgroundColor: update.area.color ?? "#000000",
                      color: contrastColor(update.area.color ?? "#000000"),
                    }}
                    className="mt-1 self-start w-full"
                  >
                    {update.area.name}
                  </Badge>
                </div>
                <div className="flex flex-col justify-center group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleEditClick(update, e)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <p className="text-sm">{update.update}</p>
                  {update.details && (
                    <div
                      className="text-sm text-muted-foreground prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: update.details }}
                    ></div>
                  )}
                </div>
              </>
            )}
            {update.type === "music" && (
              <>
                <div className="grid place-items-center">
                  <div className="bg-primary rounded-full text-primary-foreground p-1.5">
                    <Music className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex flex-col justify-center group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleEditClick(update, e)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <a
                    href={
                      "https://song.link/" + encodeURIComponent(update.link)
                    }
                    target="_blank"
                    className="hover:underline"
                  >
                    <p>{update.name}</p>
                  </a>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function contrastColor(color: string) {
  let r, g, b;

  if (typeof color !== "string") return "black";

  // Remove leading/trailing whitespace
  color = color.trim();

  // HEX format
  if (color.startsWith("#")) {
    color = color.slice(1);

    if (color.length === 3) {
      color = color
        .split("")
        .map((c) => c + c)
        .join("");
    }

    if (color.length === 6) {
      r = parseInt(color.slice(0, 2), 16);
      g = parseInt(color.slice(2, 4), 16);
      b = parseInt(color.slice(4, 6), 16);
    } else {
      // Invalid hex fallback
      return "black";
    }
  }

  // RGB / RGBA format
  else if (color.startsWith("rgb")) {
    const matches = color.match(/rgba?\(([^)]+)\)/);
    if (matches) {
      const [rStr, gStr, bStr] = matches[1]
        .split(",")
        .map((v) => parseInt(v.trim(), 10));
      r = rStr;
      g = gStr;
      b = bStr;
    } else {
      return "black";
    }
  } else {
    return "black"; // fallback if unknown format
  }

  // YIQ brightness formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}
