"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, User, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navigation() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="text-xl font-bold">EventBook</span>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/events">
              <Button variant="ghost">Events</Button>
            </Link>

            {status === "loading" ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : session ? (
              <>
                <Link href="/wallet">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Ticket className="h-4 w-4" />
                    <span>Wallet</span>
                  </Button>
                </Link>

                {session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                )}

                {(session.user.role === "VALIDATOR" || session.user.role === "ADMIN") && (
                  <Link href="/validator">
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Ticket className="h-4 w-4" />
                      <span>Validator</span>
                    </Button>
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {session.user.name || session.user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
