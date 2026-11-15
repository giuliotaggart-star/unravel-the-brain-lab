import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        coral:
          "rounded-full bg-coral text-primary-foreground shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--coral)_70%,transparent)] hover:bg-coral-ink active:translate-y-px",
        go: "rounded-full bg-go text-go-foreground shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--go)_70%,transparent)] hover:bg-go-ink active:translate-y-px",
        gold: "rounded-full bg-gold text-foreground shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--gold)_70%,transparent)] hover:brightness-95 active:translate-y-px",
        soft: "rounded-full border border-border bg-card text-foreground shadow-card hover:border-peri/40 hover:bg-peri-soft",
        quiet: "rounded-full text-peri-ink hover:bg-peri-soft",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        pill: "h-11 rounded-full px-6 text-[0.95rem] font-semibold",
        pillSm: "h-9 rounded-full px-4 text-sm font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
