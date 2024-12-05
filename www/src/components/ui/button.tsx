import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "font-head transition-all outline-none disabled:shadow-none",
  {
    variants: {
      variant: {
        default:
          "shadow-md hover:shadow-xs bg-primary-400 text-black border-2 border-black hover:bg-primary-500 disabled:bg-primary-400",
        outline:
          "shadow-md hover:shadow-xs bg-transparent text-black border-2 border-black",
        link: "bg-transparent text-black hover:underline",
        danger:
          "shadow-md hover:shadow-xs bg-red-400 text-black border-2 border-black hover:bg-red-500 disabled:bg-red-400",
      },
      size: {
        icon: "p-1 text-sm",
        sm: "px-4 py-1 text-sm",
        md: "px-6 py-2 text-base",
        lg: "px-8 py-3 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      children,
      size = "md",
      className = "",
      variant = "default",
      ...props
    }: IButtonProps,
    forwardedRef,
  ) => (
    <button
      ref={forwardedRef}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
