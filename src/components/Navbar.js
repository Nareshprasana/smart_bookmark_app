"use client";

import { Container } from "./Container";
import { Bookmark, Search, Bell, Menu, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar({ user }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh(); // This will trigger the middleware and redirect to /login
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105">
              <Bookmark className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">SmartMark</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="text-foreground transition-colors hover:text-foreground/80">Dashboard</a>
            <a href="#" className="transition-colors hover:text-foreground">Collections</a>
            <a href="#" className="transition-colors hover:text-foreground">Analytics</a>
            <a href="#" className="transition-colors hover:text-foreground">Settings</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Search className="h-5 w-5" />
            </button>
            <button className="hidden md:flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive"></span>
            </button>
            
            {/* User Profile Section */}
            {user ? (
              <div className="hidden md:flex items-center gap-3 ml-2 pl-4 border-l border-border">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</span>
                  <span className="text-xs text-muted-foreground mt-1">{user.email}</span>
                </div>
                <div className="h-8 w-8 rounded-full overflow-hidden border border-border shadow-sm">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="ml-2 flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-sm cursor-pointer border-2 border-background hover:scale-105 transition-transform" />
            )}

            <button className="md:hidden flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
