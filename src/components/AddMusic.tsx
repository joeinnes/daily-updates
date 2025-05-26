"use client";

import { useState } from "react";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { DatePicker } from "./DatePicker";
import { useAccount } from "jazz-react";
import { MusicUpdate, UpdatesAccount } from "@/schema";
import { co } from "jazz-tools";

export function AddMusic() {
  const [name, setName] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const { me } = useAccount(UpdatesAccount, {
    resolve: { root: true },
  });

  const onSave = () => {
    if (!me?.root || !link || !date || !name) return;
    const music = MusicUpdate.create({
      name: co.plainText().create(name),
      link,
      date,
      type: "music",
    });
    me.root.updates?.push(music);
    setName(null);
    setLink(null);
    setDate(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <Music className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="Music addition">
        <DialogHeader>
          <DialogTitle>Add some music</DialogTitle>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Label (e.g. 'Artist—Album')"
          value={name || ""}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground h-10"
          required
        />

        <Input
          type="text"
          placeholder="Link"
          value={link || ""}
          onChange={(e) => setLink(e.target.value)}
          className="flex-1 bg-transparent rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground h-10"
          required
        />

        <DatePicker date={date} onSelect={setDate} />

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
