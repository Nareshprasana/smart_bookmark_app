"use client";

import { Container } from "./Container";
import { Bookmark, Search, Bell, Menu, LogOut, User, X, LayoutDashboard, FolderOpen, BarChart3, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar({ user }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh(); // This will trigger the middleware and redirect to /login
  };

  const focusSearch = () => {
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent("smartmark:focus-search"));
  };

  const navItems = [
    { label: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
    { label: "Collections", href: "#collections", icon: FolderOpen },
    { label: "Analytics", href: "#analytics", icon: BarChart3 },
    { label: "Settings", href: "#settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <a href="#dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-sm transition-transform hover:scale-105">
              <Bookmark className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold tracking-tight">SmartMark</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Bookmark command center</span>
            </div>
          </a>

          <nav className="hidden items-center rounded-lg border bg-muted/40 p-1 text-sm font-medium text-muted-foreground md:flex">
            {navItems.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 transition-colors hover:bg-background hover:text-foreground hover:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={focusSearch}
              className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
              title="Search bookmarks"
              aria-label="Search bookmarks"
            >
              <Search className="h-5 w-5" />
            </button>
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setIsNotificationsOpen((value) => !value);
                  setIsProfileOpen(false);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              </button>
              {isNotificationsOpen && <NotificationsPanel />}
            </div>
            
            {user ? (
              <div className="relative hidden border-l border-border pl-3 md:block">
                <button
                  onClick={() => {
                    setIsProfileOpen((value) => !value);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-md py-1 pl-2 pr-1 transition-colors hover:bg-accent"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileOpen}
                >
                  <div className="flex max-w-44 flex-col text-right">
                    <span className="truncate text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</span>
                    <span className="mt-1 truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <Avatar user={user} />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-lg border bg-popover p-3 text-popover-foreground shadow-xl">
                    <div className="mb-3 flex items-center gap-3 border-b pb-3">
                      <Avatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.user_metadata?.full_name || "SmartMark User"}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <a href="#settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                      <Settings className="h-4 w-4" />
                      Account settings
                    </a>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" className="hidden rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 md:inline-flex">
                Sign in
              </a>
            )}

            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border py-3 md:hidden">
            <nav className="grid gap-1">
              {navItems.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </a>
              ))}
              <button
                onClick={focusSearch}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                Search bookmarks
              </button>
            </nav>
            {user && (
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar user={user} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.user_metadata?.full_name || "User"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}

function Avatar({ user }) {
  return (
    <div className="h-9 w-9 overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
      {user.user_metadata?.avatar_url ? (
        <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function NotificationsPanel() {
  return (
    <div className="absolute right-0 mt-3 w-80 rounded-lg border bg-popover p-4 text-popover-foreground shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Notifications</h2>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">Live</span>
      </div>
      <div className="space-y-3">
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-sm font-medium">Bookmarks are syncing</p>
          <p className="mt-1 text-xs text-muted-foreground">Realtime updates are active for this dashboard.</p>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-sm font-medium">Tip</p>
          <p className="mt-1 text-xs text-muted-foreground">Use search and category filters together to narrow a large library fast.</p>
        </div>
      </div>
    </div>
  );
}
