import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-line bg-panelAlt px-3 text-sm text-text outline-none ring-accent/30 transition focus:ring",
          className,
        )}
        {...props}
      />
    );
  },
);
