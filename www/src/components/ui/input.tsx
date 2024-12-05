import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      {...props}
      className={cn(
        "w-full border-2 border-black px-4 py-2 shadow-md transition focus:shadow-xs focus:outline-none",
        props.className,
      )}
    />
  );
}
