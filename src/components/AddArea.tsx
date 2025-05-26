"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColorPicker } from "./ColorPicker";
import { useAccount } from "jazz-react";
import { Area, UpdatesAccount } from "@/schema";
import { co } from "jazz-tools";

export function AddArea() {
  const [name, setName] = useState<string | null>(null);
  const [color, setColor] = useState<string>("#000000");
  const [open, setOpen] = useState(false);

  const { me } = useAccount(UpdatesAccount, {
    resolve: { root: true },
  });

  const onSave = () => {
    if (!me?.root || !name) return;
    const area = Area.create({
      name: co.plainText().create(name),
      color: color,
    });
    me.root.areas?.push(area);
    setName(null);
    setColor("#000000");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
      >
        <Plus className="me-2 h-4 w-4" />
        Add an area
      </DialogTrigger>
      <DialogContent aria-describedby="Area addition">
        <DialogHeader>
          <DialogTitle>Add an area</DialogTitle>
        </DialogHeader>
        <div className="flex items-stretch group rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-background focus-within:border-ring transition-all duration-150 ease-in-out">
          <Input
            type="text"
            placeholder="Area name"
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent rounded-l-md rounded-r-none border-0 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 h-10"
          />
          <ColorPicker
            onChange={setColor}
            value={color}
            className={cn(
              "rounded-l-none rounded-r-md border-0 border-l border-input px-3 py-2 focus:outline-none focus:ring-0 h-10",
              "group-focus-within:border-l-ring transition-all duration-150 ease-in-out"
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSave}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
