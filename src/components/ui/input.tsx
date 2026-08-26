import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/15 disabled:bg-muted aria-invalid:border-destructive aria-invalid:ring-destructive/20 h-11 w-full min-w-0 rounded-full border px-4 py-2 text-base transition-[border-color,box-shadow,background-color] duration-150 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
