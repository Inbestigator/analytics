"use client";

import { LogOut, User } from "lucide-react";
import { Button, type IButtonProps } from "./ui/button";
import { useTransition } from "react";
import { authAction } from "./auth-actions";

export default function AuthButton({
  defaultContent,
  pendingContent,
  shouldLogout,
  ...props
}: IButtonProps & {
  defaultContent?: React.ReactNode;
  pendingContent?: React.ReactNode;
  shouldLogout?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={async () => {
        startTransition(async () => {
          void authAction(shouldLogout);
        });
      }}
    >
      <Button
        title={`${isPending ? "Signing" : "Sign"} ${shouldLogout ? "out" : "in"}`}
        type="submit"
        disabled={isPending}
        {...props}
      >
        {props.children ??
          (isPending ? pendingContent : defaultContent) ??
          (shouldLogout ? <LogOut /> : <User />)}
      </Button>
    </form>
  );
}
