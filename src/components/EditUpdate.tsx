"use client";
import { Button, buttonVariants } from "./ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Editor } from "@/components/Editor.tsx";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

import { UpdatesAccount, type UpdateItem } from "@/schema";

import { useAccount } from "jazz-react";
import { useEffect, useState } from "react";

type EditUpdateProps = {
  update: UpdateItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
};

export function EditUpdate({
  update,
  isOpen,
  onOpenChange,
  onDelete,
}: EditUpdateProps) {
  const [editedUpdate, setEditedUpdate] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const { me } = useAccount(UpdatesAccount, {
    resolve: {
      profile: true,
      root: {
        updates: true,
      },
    },
  });

  useEffect(() => {
    if (!update) return;
    setEditedUpdate(update);
    setDate(update.date);
  }, [update, isOpen]);

  if (!me?.root || !editedUpdate) return null;

  const areas = me?.root?.areas || [];

  const handleSave = () => {
    if (!editedUpdate) return;

    // Update the date
    if (date) {
      editedUpdate.date = date;
    }

    // Close the dialog
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onOpenChange(false);
      return;
    }
    me.root.updates?.splice(
      me.root.updates.findIndex((u) => u?.id === editedUpdate.id),
      1
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editedUpdate.type === "update" ? "Edit Update" : "Edit Music"}
          </DialogTitle>
        </DialogHeader>

        {editedUpdate.type === "update" ? (
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <AreaSelect
                areas={areas}
                updateArea={(val: string) => {
                  editedUpdate.area = areas.find((area) => area?.id === val);
                }}
                value={editedUpdate?.area?.id}
              />
              <DatePicker date={date} onSelect={setDate} />
            </div>

            <div className="grid gap-2">
              <Input
                type="text"
                placeholder="What have you been up to?"
                value={editedUpdate?.update?.valueOf()}
                onChange={(e) => editedUpdate.update?.applyDiff(e.target.value)}
              />

              <Input
                type="text"
                placeholder="Link"
                value={editedUpdate?.link?.valueOf()}
                onChange={(e) => (editedUpdate.link = e.target.value)}
              />

              {editedUpdate.details && <Editor value={editedUpdate.details} />}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <Input
              type="text"
              placeholder="Track name"
              value={editedUpdate?.name?.valueOf()}
              onChange={(e) => editedUpdate.name?.applyDiff(e.target.value)}
            />

            <Input
              type="text"
              placeholder="Link"
              value={editedUpdate?.link}
              onChange={(e) => (editedUpdate.link = e.target.value)}
            />

            <DatePicker date={date} onSelect={setDate} />
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <DialogClose className={cn(buttonVariants({ variant: "outline" }))}>
              Cancel
            </DialogClose>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AreaSelect({
  areas,
  updateArea,
  value,
}: {
  areas: any[];
  updateArea: (val: string) => void;
  value: string | undefined;
}) {
  return (
    <Select onValueChange={updateArea} value={value ?? ""}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Area" />
      </SelectTrigger>
      <SelectContent>
        {areas.length ? (
          areas.map((area) => {
            return area ? (
              <SelectItem value={area.id} key={area.id}>
                {area?.name}
              </SelectItem>
            ) : null;
          })
        ) : (
          <SelectItem value="no" disabled={true} key="no">
            No areas found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

function DatePicker({
  date,
  onSelect,
  className,
}: {
  date: Date | undefined;
  onSelect: (newDate: Date | undefined) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({
            variant: "outline",
          }),
          "w-[180px] justify-start text-left font-normal",
          !date && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? date.toLocaleDateString("en-GB") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
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
