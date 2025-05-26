"use client";

import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (newDate: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, onSelect, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({
            variant: "outline",
          }),
          "w-[130px] justify-start text-left font-normal ",
          !date && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="me-2 h-4 w-4" />
        {date ? date.toLocaleDateString("en-GB") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          weekStartsOn={1}
          ISOWeek
        />
        <Button
          variant={"outline"}
          className="w-full mt-2"
          onClick={() => onSelect(undefined)}
        >
          Clear
        </Button>
      </PopoverContent>
    </Popover>
  );
}
