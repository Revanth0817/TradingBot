import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  default: "bg-accent text-slate-950 hover:bg-[#5be0d4]",
  secondary: "bg-panelAlt text-text hover:bg-[#192433]",
  danger: "bg-danger text-slate-950 hover:bg-[#ff8989]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "default", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
