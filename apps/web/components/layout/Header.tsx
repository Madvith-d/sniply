"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b-[2.5px] border-ink bg-card/95 sticky top-0 z-50 backdrop-blur-sm shadow-[0_2px_0_var(--shadow-color)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-xl font-extrabold font-heading tracking-tight hover:opacity-75 transition-opacity duration-150 shrink-0"
        >
          sniply<span className="text-yellow">.</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-mono text-ink/60 max-w-[160px] truncate">
                {user.email}
              </span>
              <DarkModeToggle />
              <Button
                variant="secondary"
                onClick={logout}
                className="text-xs sm:text-sm px-3 sm:px-4"
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <DarkModeToggle />
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-xs sm:text-sm px-3 sm:px-4"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="text-xs sm:text-sm px-3 sm:px-4">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
