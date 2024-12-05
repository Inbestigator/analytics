import { signIn, signOut } from "@/server/auth";
import { LogOut, User } from "lucide-react";
import { Button } from "./ui/button";

export default function AuthButton({
  shouldLogout,
  ...props
}: React.ComponentProps<"button"> & {
  shouldLogout?: boolean;
}) {
  return (
    <form
      action={async () => {
        "use server";
        if (shouldLogout) await signOut();
        else await signIn("github");
      }}
    >
      <Button
        title={`Sign ${shouldLogout ? "out" : "in"}`}
        type="submit"
        {...props}
      >
        {props.children ?? (shouldLogout ? <LogOut /> : <User />)}
      </Button>
    </form>
  );
}
