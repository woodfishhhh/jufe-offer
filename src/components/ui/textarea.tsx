import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/15 disabled:bg-muted aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex field-sizing-content min-h-24 w-full rounded-2xl border px-4 py-3 text-base transition-[border-color,box-shadow,background-color] duration-150 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
