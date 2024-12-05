import type { ElementType, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("font-head", {
  variants: {
    as: {
      p: "font-sans text-base",
      h1: "text-5xl lg:text-6xl font-bold",
      h2: "text-3xl lg:text-5xl font-semibold",
      h3: "text-2xl font-medium",
      h4: "text-xl font-medium",
      h5: "text-lg font-medium",
      h6: "",
    },
  },
  defaultVariants: {
    as: "p",
  },
});

interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, "className">,
    VariantProps<typeof textVariants> {
  className?: string;
}

export const Text = (props: TextProps) => {
  const { className, as, ...otherProps } = props;
  const Tag: ElementType = as ?? "p";

  return (
    <Tag className={cn(textVariants({ as }), className)} {...otherProps} />
  );
};
