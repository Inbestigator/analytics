import { signIn, signOut } from "@/server/auth";
import { User, LogOut } from "lucide-react";

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
      <button
        title={`Sign ${shouldLogout ? "out" : "in"}`}
        type="submit"
        {...props}
      >
        {props.children ?? (shouldLogout ? <LogOut /> : <User />)}
      </button>
    </form>
  );
}