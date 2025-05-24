import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";

export function ColorPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}) {
  return (
    <GradientPicker
      background={value}
      setBackground={onChange}
      className={className}
    />
  );
}

export function GradientPicker({
  background,
  setBackground,
  className,
}: {
  background: string;
  setBackground: (background: string) => void;
  className?: string;
}) {
  const colors = [
    // Pastels & Light Tones
    "#FADADD", // Light Pink
    "#FDEEBE", // Pale Yellow
    "#D4F0F0", // Light Aqua
    "#E6E6FA", // Lavender
    "#FFDDC1", // Light Peach
    "#C1E1C1", // Pale Green
    "#F0F8FF", // Alice Blue
    "#FFF0F5", // Lavender Blush

    // Muted & Mid Tones
    "#A0D2DB", // Muted Blue
    "#F3BFB3", // Soft Coral
    "#B2DFDB", // Pale Teal
    "#D8BFD8", // Thistle
    "#F4A261", // Sandy Brown
    "#87CEEB", // Sky Blue
    "#98FB98", // Pale Green (more vibrant)
    "#FFB6C1", // Light Pink (more vibrant)

    // Slightly Deeper & Richer Tones
    "#778DA9", // Slate Blue
    "#E07A5F", // Terracotta
    "#3D405B", // Dark Blue-Gray
    "#81B29A", // Sage Green
    "#6A5ACD", // SlateBlue (more vibrant)
    "#4682B4", // SteelBlue
    "#5F9EA0", // CadetBlue

    // Dark & Deep Tones
    "#2F4F4F", // DarkSlateGray
    "#483D8B", // DarkSlateBlue
    "#556B2F", // DarkOliveGreen
    "#8B4513", // SaddleBrown
    "#708090", // SlateGray
  ];

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({
            variant: "outline",
          }),
          "w-[120px] justify-start text-left font-normal",
          !background && "text-muted-foreground",
          className
        )}
      >
        <div className="w-full flex items-center gap-2">
          {background ? (
            <div
              className="h-4 w-4 rounded !bg-center !bg-cover transition-all"
              style={{ background }}
            ></div>
          ) : (
            <Paintbrush className="h-4 w-4" />
          )}
          <div className="truncate flex-1">
            {background ? background : "Pick a color"}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex gap-2 flex-wrap">
          {colors.map((s) => (
            <div
              key={s}
              style={{ background: s }}
              className="rounded-md h-6 w-6 cursor-pointer active:scale-105"
              onClick={() => setBackground(s)}
            ></div>
          ))}
        </div>

        <Input
          id="custom"
          value={background}
          className="col-span-2 h-8 mt-4"
          onChange={(e) => setBackground(e.currentTarget.value)}
        />
      </PopoverContent>
    </Popover>
  );
}
