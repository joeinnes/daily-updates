"use client";
import { Editor } from "@/components/Editor.tsx";
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
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

import { DraftUpdate, type Update, UpdatesAccount } from "@/schema";

import { useAccount } from "jazz-react";
import { type Loaded, co } from "jazz-tools";

import { useEffect, useState, useRef } from "react"; // Added useRef
import { AreaSelect } from "./AreaSelect";
import { DatePicker } from "./DatePicker";
import { AddMusic } from "./AddMusic";

export function AddUpdate() {
  const [thisDate, setthisDate] = useState<Date | undefined>(undefined);
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);
  const [newUpdate, setNewUpdate] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const updateArea = (val: string) => {
    if (!newUpdate) return;
    newUpdate.area = me?.root?.areas?.find((area) => area?.id === val);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0); // Delay focus to ensure input is ready
  };

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
            updateArea={updateArea}
            value={newUpdate?.area?.id}
            className="md:rounded-r-none md:border-r-0"
          />
          <Input
            type="text"
            placeholder="What have you been up to?"
            value={newUpdate?.update?.valueOf()}
            onChange={(e) => newUpdate.update?.applyDiff(e.target.value)}
            className="text-sm md:rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 my-2 md:my-0"
            ref={inputRef}
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
