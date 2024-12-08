import Link from "next/link";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import AuthButton from "./auth-button";

export default function SiteHeader() {
  return (
    <>
      <div className="h-16" />
      <header className="fixed inset-x-0 top-0 flex w-screen justify-between bg-white p-4">
        <Link href="/">
          <h1 className="font-head text-2xl font-extrabold">Capture</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link target="_blank" href="https://jsr.io/@capture/analytics">
            <Button size="sm" className="flex items-center gap-2">
              JSR <ExternalLink className="size-3.5" />
            </Button>
          </Link>
          <AuthButton
            variant="outline"
            size="sm"
            defaultContent="Sign out"
            pendingContent="Signing out"
            shouldLogout
          />
        </div>
      </header>
    </>
  );
}
