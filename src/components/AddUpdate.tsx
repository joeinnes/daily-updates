"use client";
import { Editor } from "@/components/Editor.tsx";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button, buttonVariants } from "./ui/button";

import {
  Area,
  DraftUpdate,
  MusicUpdate,
  type Update,
  UpdatesAccount,
} from "@/schema";

import { useAccount } from "jazz-react";
import { type Loaded, co } from "jazz-tools";

import { CalendarIcon, Music, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ColorPicker } from "./ColorPicker";

export function AddUpdate() {
  const [thisDate, setthisDate] = useState<Date | undefined>(undefined);
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);
  const [newUpdate, setNewUpdate] = useState<any>(null);

  const { me } = useAccount(UpdatesAccount, {
    resolve: {
      profile: true,
      root: {
        updates: {
          $each: true,
        },
      },
    },
  });

  useEffect(() => {
    if (!me?.root) return;

    if (!me.root.draft) {
      me.root.draft = DraftUpdate.create({
        update: co.plainText().create(""),
        details: co.richText().create(""),
        type: "update",
      });
    }
    setNewUpdate(me.root.draft);
  }, [me?.root]);

  if (!me?.root || !newUpdate) return null;

  const areas = me?.root?.areas || [];

  const handleSave = () => {
    if (!newUpdate) return;

    if (!newUpdate?.update) {
      console.error("No update");
      return;
    }

    if (!newUpdate?.area) {
      console.error("No area");
      return;
    }

    const updatedItem = newUpdate as Loaded<typeof Update>;
    if (thisDate) {
      updatedItem.date = thisDate;
    }
    if (!me?.root?.updates) {
      console.error(" me.root.updates is undefined");
      return;
    }

    me.root.updates.push(updatedItem);
    me.root.draft = DraftUpdate.create({
      update: co.plainText().create(""),
      details: co.richText().create(""),
      link: "",
      type: "update",
    });

    setNewUpdate(me.root.draft); // Try commenting out this line
    setthisDate(undefined);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          Add an update <AddMusic />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4 flex-wrap md:flex-nowrap">
          <Checkbox
            id="completed"
            checked={thisDate !== undefined}
            className="me-2 hidden md:block"
          />
          <AreaSelect
            areas={areas}
            updateArea={(val: string) => {
              newUpdate.area = areas.find((area) => area?.id === val);
            }}
            value={newUpdate?.area?.id}
            className="md:rounded-r-none md:border-r-0"
          />
          <Input
            type="text"
            placeholder="What have you been up to?"
            value={newUpdate?.update?.valueOf()}
            onChange={(e) => newUpdate.update?.applyDiff(e.target.value)}
            className="text-sm md:rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 my-2 md:my-0"
          />
          <DatePicker
            date={thisDate}
            onSelect={setthisDate}
            className="md:border-l-0 md:rounded-l-none"
          />
          <Button className="ms-2" onClick={handleSave}>
            Save
          </Button>
        </div>
        <Collapsible onOpenChange={setDetailsExpanded}>
          <CollapsibleTrigger className="w-full text-sm flex justify-between font-semibold ">
            <p>Add Details</p>
            <span
              className={cn(
                "ms-auto transform duration-300 ease-in-out",
                detailsExpanded && "rotate-180"
              )}
            >
              &darr;
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Input
              type="text"
              placeholder="Link"
              value={newUpdate?.link}
              onChange={(e) => (newUpdate.link = e.target.value)}
              className="text-sm"
            />

            {newUpdate && (
              <Editor key={newUpdate.id} value={newUpdate.details!} />
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}

function AreaSelect({
  areas,
  updateArea,
  value,
  className,
}: {
  areas: any[];
  updateArea: (val: string) => void;
  value: string | undefined;
  className?: string;
}) {
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
                  backgroundColor: selectedArea.color,
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
                  className="w-4 h-4 rounded inline-block"
                  style={{
                    backgroundColor: area?.color,
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
          "w-[130px] justify-start text-left font-normal ",
          !date && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon />
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

function AddArea() {
  const [name, setName] = useState<string | null>(null);
  const [color, setColor] = useState<string>("#000000");

  const { me } = useAccount(UpdatesAccount, {
    resolve: { root: true },
  });
  const onSave = () => {
    if (!me || !name) return;
    const area = Area.create({
      name: co.plainText().create(name),
      color: color,
    });
    me.root.areas?.push(area);
  };
  return (
    <Dialog>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
      >
        <Plus />
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
          <DialogClose className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </DialogClose>
          <Button onClick={onSave}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddMusic() {
  const [name, setName] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const { me } = useAccount(UpdatesAccount, {
    resolve: { root: true },
  });

  const onSave = () => {
    if (!me || !link || !date || !name) return;
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
      {" "}
      <DialogTrigger className={cn(buttonVariants({ variant: "secondary" }))}>
        <Music />
      </DialogTrigger>
      <DialogContent aria-describedby="Music addition">
        <DialogHeader>
          <DialogTitle>Add some music</DialogTitle>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Label (e.g. 'Artist—Album')"
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground h-10"
          required
        />

        <Input
          type="text"
          placeholder="Link"
          onChange={(e) => setLink(e.target.value)}
          className="flex-1 bg-transparent rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground h-10"
          required
        />

        <DatePicker date={date} onSelect={setDate} />

        <DialogFooter>
          <DialogClose className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </DialogClose>
          <Button onClick={onSave}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
