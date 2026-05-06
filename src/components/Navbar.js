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
    <header className="sticky top-0 z-50 w-full border-b border-teal-900/10 bg-white/80 shadow-sm shadow-teal-900/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <a href="#dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm shadow-teal-800/20 transition-transform hover:scale-105">
              <Bookmark className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold tracking-tight text-slate-900">SmartMark</span>
              <span className="hidden text-xs text-teal-800/70 sm:block">Bookmark command center</span>
            </div>
          </a>

          <nav className="hidden items-center rounded-lg border border-teal-900/10 bg-teal-50/80 p-1 text-sm font-medium text-slate-600 md:flex">
            {navItems.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 transition-colors hover:bg-white hover:text-teal-800 hover:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={focusSearch}
              className="hidden h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-sky-100 hover:text-sky-800 md:flex"
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
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-amber-100 hover:text-amber-800"
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
              <div className="relative hidden border-l border-teal-900/10 pl-3 md:block">
                <button
                  onClick={() => {
                    setIsProfileOpen((value) => !value);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-md py-1 pl-2 pr-1 transition-colors hover:bg-teal-50"
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
                  <div className="absolute right-0 mt-3 w-72 rounded-lg border border-teal-900/10 bg-white p-3 text-popover-foreground shadow-xl shadow-teal-900/10">
                    <div className="mb-3 flex items-center gap-3 border-b pb-3">
                      <Avatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.user_metadata?.full_name || "SmartMark User"}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <a href="#settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-800">
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
              <a href="/login" className="hidden rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white shadow-sm shadow-teal-900/20 hover:bg-teal-800 md:inline-flex">
                Sign in
              </a>
            )}

            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-teal-900/10 py-3 md:hidden">
            <nav className="grid gap-1">
              {navItems.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-teal-50 hover:text-teal-800"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </a>
              ))}
              <button
                onClick={focusSearch}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-sky-50 hover:text-sky-800"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                Search bookmarks
              </button>
            </nav>
            {user && (
              <div className="mt-3 border-t border-teal-900/10 pt-3">
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
    <div className="h-9 w-9 overflow-hidden rounded-lg border border-teal-900/10 bg-teal-50 shadow-sm">
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
    <div className="absolute right-0 mt-3 w-80 rounded-lg border border-teal-900/10 bg-white p-4 text-popover-foreground shadow-xl shadow-teal-900/10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Notifications</h2>
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">Live</span>
      </div>
      <div className="space-y-3">
        <div className="rounded-md bg-sky-50 p-3">
          <p className="text-sm font-medium">Bookmarks are syncing</p>
          <p className="mt-1 text-xs text-muted-foreground">Realtime updates are active for this dashboard.</p>
        </div>
        <div className="rounded-md bg-amber-50 p-3">
          <p className="text-sm font-medium">Tip</p>
          <p className="mt-1 text-xs text-muted-foreground">Use search and category filters together to narrow a large library fast.</p>
        </div>
      </div>
    </div>
  );
}
