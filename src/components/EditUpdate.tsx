"use client";
import { Editor } from "@/components/Editor.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { AreaSelect } from "./AreaSelect";
import { DatePicker } from "./DatePicker";

import { type UpdateItem, UpdatesAccount } from "@/schema";

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

    onOpenChange(false);
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
    <Dialog open={isOpen} onOpenChange={onOpenChange} key={update.id}>
      <DialogContent className="max-w-full ">
        <DialogHeader>
          <DialogTitle>
            {editedUpdate.type === "update" ? "Edit Update" : "Edit Music"}
          </DialogTitle>
        </DialogHeader>

        {editedUpdate.type === "update" ? (
          <div className="grid gap-4 py-4 grid-cols-1 md:grid-cols-none ">
            <div className="flex items-center gap-2">
              <AreaSelect
                areas={areas}
                updateArea={(val: string) => {
                  editedUpdate.area = areas.find((area) => area?.id === val);
                }}
                value={editedUpdate?.area?.id}
                className="flex-1"
              />
              <DatePicker date={date} onSelect={setDate} className="flex-1" />
            </div>

            <div className="grid gap-2">
              <Input
                type="text"
                placeholder="What have you been up to?"
                value={editedUpdate?.update?.valueOf()}
                onChange={(e) => editedUpdate.update?.applyDiff(e.target.value)}
                className="text-sm break-all"
              />

              <Input
                type="text"
                placeholder="Link"
                value={editedUpdate?.link?.valueOf()}
                onChange={(e) => (editedUpdate.link = e.target.value)}
                className="text-sm break-all"
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
              className="text-sm break-all"
            />

            <Input
              type="text"
              placeholder="Link"
              value={editedUpdate?.link}
              onChange={(e) => (editedUpdate.link = e.target.value)}
              className="text-sm break-all"
            />

            <DatePicker date={date} onSelect={setDate} />
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="me-auto"
            >
              Delete
            </Button>
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
