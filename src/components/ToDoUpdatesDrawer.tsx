"use client";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Music, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useAccount } from "jazz-react";
import { UpdatesAccount, type UpdateItem } from "@/schema";
import { EditUpdate } from "./EditUpdate";

export function ToDoUpdatesDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { me } = useAccount(UpdatesAccount, {
    resolve: {
      root: {
        updates: {
          $each: true,
        },
      },
    },
  });

  if (!me || !me.root || !me.root.updates) {
    return null;
  }

  // Filter updates without a date
  const todoUpdates = me.root.updates.filter((update) => !update?.date);

  const handleUpdateClick = (update: UpdateItem) => {
    setSelectedUpdate(update);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUpdate = () => {
    if (!selectedUpdate || !me.root.updates) return;

    // Find the index of the update to delete
    const index = me.root.updates.findIndex((u) => u?.id === selectedUpdate.id);
    if (index !== -1) {
      // Remove the update from the array
      me.root.updates.splice(index, 1);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <ClipboardList className="h-5 w-5" />
            <span className="ml-2">To Do</span>
            {todoUpdates.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                {todoUpdates.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>To Dos</SheetTitle>
            <SheetDescription>
              These updates don't have a date assigned. Click on an update to
              edit or assign a date.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {todoUpdates.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No to dos found
              </p>
            ) : (
              todoUpdates.map((update) => (
                <div
                  key={update.id}
                  className="p-3 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    if (update.type === "update" && update.area === null)
                      return;
                    handleUpdateClick(update);
                  }}
                >
                  {update.type === "update" && update.area && (
                    <div className="flex items-start gap-2">
                      <Badge
                        style={{
                          backgroundColor: update.area.color ?? "#000000",
                        }}
                        className="mt-1"
                      >
                        {update.area.name}
                      </Badge>
                      <div>
                        <p>{update.update}</p>
                        {update.details && (
                          <div
                            className="text-sm text-muted-foreground prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: update.details }}
                          ></div>
                        )}
                      </div>
                    </div>
                  )}
                  {update.type === "music" && (
                    <div className="flex items-center gap-2">
                      <div className="bg-primary rounded-full text-primary-foreground p-1.5">
                        <Music className="h-4 w-4" />
                      </div>
                      <p>{update.name}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {selectedUpdate && (
        <EditUpdate
          update={selectedUpdate}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onDelete={handleDeleteUpdate}
        />
      )}
    </>
  );
}
