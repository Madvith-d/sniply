"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b-[3px] border-ink bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-xl font-bold font-heading tracking-tight hover:opacity-80 transition-opacity duration-150"
        >
          sniply
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-mono text-ink/70">
                {user.email}
              </span>
              <Button variant="secondary" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
