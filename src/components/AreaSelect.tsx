"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Area } from "@/schema"; // Changed from 'import type { Area as AreaType }'
import { type Loaded } from "jazz-tools"; // Added import for Loaded
import { AddArea } from "./AddArea";

type AreaType = Loaded<typeof Area> | null; // Added type definition for AreaType

interface AreaSelectProps {
  areas: AreaType[];
  updateArea: (val: string) => void;
  value: string | undefined;
  className?: string;
}

export function AreaSelect({
  areas,
  updateArea,
  value,
  className,
}: AreaSelectProps) {
  const selectedArea = areas.find((area) => area?.id === value);

  return (
    <Select onValueChange={updateArea} value={value ?? ""}>
      <SelectTrigger
        className={cn(
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          "flex items-center justify-between w-[120px] flex-shrink-0",
          className
        )}
      >
        {selectedArea ? (
          <>
            <div className="flex items-center overflow-hidden w-full">
              <div
                className="w-4 h-4 rounded inline-block me-2 flex-shrink-0"
                style={{
                  backgroundColor: selectedArea.color || undefined,
                }}
              ></div>
              <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                {selectedArea.name?.valueOf()}
              </span>
            </div>
          </>
        ) : (
          <SelectValue placeholder="Area" />
        )}
      </SelectTrigger>
      <SelectContent>
        {areas.length ? (
          areas.map((area) => {
            return area ? (
              <SelectItem value={area.id} key={area.id}>
                <div
                  className="w-4 h-4 rounded inline-block me-2"
                  style={{
                    backgroundColor: area?.color || undefined,
                  }}
                ></div>
                {area?.name?.valueOf()}
              </SelectItem>
            ) : null;
          })
        ) : (
          <SelectItem value="no" disabled={true} key="no">
            No areas found
          </SelectItem>
        )}
        <div className="mt-2">
          <AddArea />
        </div>
      </SelectContent>
    </Select>
  );
}
