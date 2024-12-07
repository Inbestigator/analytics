import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export default function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full border-2 border-black px-4 py-2 shadow-md transition focus:shadow-xs focus:outline-none",
        props.className,
      )}
    />
  );
}
