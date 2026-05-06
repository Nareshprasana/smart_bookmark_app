"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, BookmarkPlus, Sparkles, TrendingUp, Search, X, ShieldCheck, Radio, Palette, Minimize2, HelpCircle, User, Download, Trash2, Mail, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { BookmarkCard } from "./BookmarkCard";
import { BookmarkForm } from "./BookmarkForm";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { addBookmark, deleteBookmark } from "@/services/bookmarks";
import { createClient } from "@/lib/supabase/client";
import { useBookmarksRealtime } from "@/hooks/useBookmarksRealtime";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export function DashboardClient({ initialBookmarks, user }) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState(initialBookmarks || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [customFolders, setCustomFolders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isCompactView, setIsCompactView] = useState(false);
  const [useColorBadges, setUseColorBadges] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [isAccountDeleteOpen, setIsAccountDeleteOpen] = useState(false);
  const [deleteAccountText, setDeleteAccountText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Attach realtime listeners
  useBookmarksRealtime(setBookmarks);

  useEffect(() => {
    const handleFocusSearch = () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    window.addEventListener("smartmark:focus-search", handleFocusSearch);
    return () => window.removeEventListener("smartmark:focus-search", handleFocusSearch);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("smartmark-tour-complete") !== "true") {
      const timer = window.setTimeout(() => setIsTourOpen(true), 500);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setTourStep(0);
    setIsTourOpen(true);
  };

  const finishTour = () => {
    localStorage.setItem("smartmark-tour-complete", "true");
    setIsTourOpen(false);
  };

  const exportBookmarks = () => {
    const payload = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smartmark-bookmarks.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Bookmark export started");
  };

  const confirmAccountDelete = async () => {
    if (deleteAccountText !== "DELETE") {
      toast.error("Type DELETE to confirm account deletion");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.removeItem("smartmark-tour-complete");
      toast.success("Account deleted");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Derived state for filtering
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((bookmark) => {
      const matchesCategory = selectedCategory === "All" || (bookmark.category || "Uncategorized") === selectedCategory;
      const searchLower = debouncedSearchQuery.toLowerCase();
      const matchesSearch = 
        !debouncedSearchQuery || 
        bookmark.title.toLowerCase().includes(searchLower) || 
        bookmark.url.toLowerCase().includes(searchLower);
      
      return matchesCategory && matchesSearch;
    });
  }, [bookmarks, selectedCategory, debouncedSearchQuery]);

  // Unique categories for the chips/sidebar
  const uniqueCategories = useMemo(() => {
    const cats = new Set([
      ...bookmarks.map(b => b.category || "Uncategorized"),
      ...customFolders,
    ]);
    return Array.from(cats).sort();
  }, [bookmarks, customFolders]);

  const handleAddBookmark = async (data, resetForm) => {
    setIsSubmitting(true);
    try {
      const newBookmark = await addBookmark(data);
      setBookmarks((prev) => [newBookmark, ...prev]);
      toast.success("Bookmark added successfully!");
      resetForm();
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to add bookmark");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (id, resetCardState) => {
    setDeleteCandidate({ id, resetCardState });
  };

  const handleCreateFolder = (event) => {
    event.preventDefault();
    const trimmedName = folderName.trim();

    if (!trimmedName) {
      toast.error("Folder name is required");
      return;
    }

    if (uniqueCategories.some((category) => category.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error("That folder already exists");
      return;
    }

    setCustomFolders((prev) => [...prev, trimmedName]);
    setSelectedCategory(trimmedName);
    setFolderName("");
    setIsFolderModalOpen(false);
    toast.success(`Folder "${trimmedName}" created`);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const { id, resetCardState } = deleteCandidate;
    
    const previousBookmarks = [...bookmarks];
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    
    try {
      await deleteBookmark(id);
      toast.success("Bookmark deleted permanently");
    } catch (error) {
      setBookmarks(previousBookmarks);
      toast.error(error.message || "Failed to delete bookmark");
    } finally {
      resetCardState();
      setDeleteCandidate(null);
    }
  };

  return (
    <>
      {/* Header Section */}
      <div id="dashboard" className="scroll-mt-24 mb-8 flex flex-col gap-4 rounded-xl border border-teal-900/10 bg-white/80 p-5 shadow-sm shadow-teal-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-700/20 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
            <Radio className="h-3.5 w-3.5 text-emerald-500" />
            Realtime library
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage, search, and organize your bookmarks from one focused workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            title="Create a new folder"
            aria-label="Create a new folder"
            data-tour="new-folder"
            className="inline-flex h-10 items-center justify-center rounded-md bg-sky-100 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 transition-colors hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            title="Add a new bookmark"
            aria-label="Add a new bookmark"
            data-tour="add-bookmark"
            className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-teal-900/20 transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Add Bookmark
          </button>
        </div>
      </div>

      {/* Stats/Overview Cards */}
      <div id="analytics" data-tour="analytics" className="scroll-mt-24 mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Bookmarks" 
          value={bookmarks.length} 
          trend="Tracking" 
          trendUp={true} 
          icon={<BookmarkPlus className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Categories" 
          value={uniqueCategories.length} 
          trend="Unique" 
          trendUp={true} 
          icon={<FolderPlus className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="AI Summaries" 
          value="Soon" 
          trend="Auto-generated" 
          trendUp={true} 
          icon={<Sparkles className="h-4 w-4 text-purple-500" />} 
        />
        <StatCard 
          title="Filtered View" 
          value={filteredBookmarks.length} 
          trend="Currently visible" 
          trendUp={true} 
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} 
        />
      </div>

      {/* Search and Filters */}
      <div data-tour="search-filters" className="mb-6 flex flex-col gap-4 rounded-xl border border-teal-900/10 bg-white/75 p-4 shadow-sm shadow-teal-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search bookmarks..."
              title="Search bookmarks by title or URL"
              aria-label="Search bookmarks by title or URL"
              value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-teal-900/10 bg-white pl-10 pr-10 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              title="Clear search"
              aria-label="Clear search"
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip 
            label="All" 
            isActive={selectedCategory === "All"} 
            onClick={() => setSelectedCategory("All")} 
          />
          {uniqueCategories.slice(0, 4).map((category) => (
            <FilterChip 
              key={category} 
              label={category} 
              isActive={selectedCategory === category} 
              onClick={() => setSelectedCategory(category)} 
            />
          ))}
          {uniqueCategories.length > 4 && (
            <span className="text-xs text-muted-foreground ml-2">+{uniqueCategories.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bookmarks Grid */}
        <div data-tour="bookmark-grid" className="rounded-xl border border-teal-900/10 bg-white/85 text-card-foreground shadow-sm shadow-teal-900/5 md:col-span-2">
          <div className="flex flex-col space-y-1.5 border-b border-teal-900/10 bg-sky-50/60 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Your Bookmarks</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCategory !== "All" || debouncedSearchQuery 
                ? `Showing results for ${selectedCategory !== "All" ? categoryText(selectedCategory) : 'All categories'} ${debouncedSearchQuery ? `matching "${debouncedSearchQuery}"` : ''}` 
                : 'All your saved items.'}
            </p>
          </div>
          <div className="p-6">
            {filteredBookmarks.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed border-teal-700/30 bg-teal-50/40 transition-all animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                    <Search className="h-6 w-6 text-teal-700" />
                  </div>
                  <h3 className="mt-4 font-semibold">No bookmarks found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    {bookmarks.length === 0 
                      ? "Get started by adding a new bookmark."
                      : "We couldn't find any bookmarks matching your filters."}
                  </p>
                  {bookmarks.length > 0 && (
                     <button 
                       onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                       className="mt-4 text-sm text-primary hover:underline"
                     >
                       Clear all filters
                     </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={cn(
                "grid animate-in fade-in slide-in-from-bottom-4 duration-500",
                isCompactView ? "gap-3 sm:grid-cols-2 lg:grid-cols-3" : "gap-4 sm:grid-cols-2"
              )}>
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard 
                    key={bookmark.id} 
                    bookmark={bookmark} 
                    onDelete={handleDeleteRequest} 
                    compact={isCompactView}
                    useColorBadge={useColorBadges}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="flex flex-col gap-6">
          <div id="collections" data-tour="collections" className="scroll-mt-24 rounded-xl border border-teal-900/10 bg-white/85 p-6 text-card-foreground shadow-sm shadow-teal-900/5">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Categories</h3>
            {uniqueCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedCategory("All")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md p-2 text-left transition-colors",
                    selectedCategory === "All" ? "bg-teal-100 text-teal-900 font-medium" : "hover:bg-sky-50"
                  )}
                  title="Show all bookmarks"
                  aria-label="Show all bookmarks"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                    <span className="text-sm">All Bookmarks</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {bookmarks.length}
                  </span>
                </button>
                
                {uniqueCategories.map((category, i) => {
                  const count = bookmarks.filter(b => (b.category || 'Uncategorized') === category).length;
                  const colors = ["bg-pink-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500"];
                  const color = colors[i % colors.length];
                  const isActive = selectedCategory === category;
                  
                  return (
                    <button 
                      key={category} 
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md p-2 text-left transition-colors",
                        isActive ? "bg-teal-100 text-teal-900 font-medium" : "hover:bg-sky-50"
                      )}
                      title={`Filter by ${category}`}
                      aria-label={`Filter by ${category}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        <span className="text-sm truncate max-w-[120px]">{category}</span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div id="settings" data-tour="settings" className="scroll-mt-24 overflow-hidden rounded-xl border border-teal-900/10 bg-white/85 text-card-foreground shadow-sm shadow-teal-900/5">
            <div className="bg-teal-700 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-none tracking-tight">Account Center</h3>
                  <p className="mt-1 truncate text-xs text-teal-50">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-sky-50 p-3">
                  <p className="text-xs text-muted-foreground">Bookmarks</p>
                  <p className="mt-1 text-xl font-bold text-sky-900">{bookmarks.length}</p>
                </div>
                <div className="rounded-md bg-amber-50 p-3">
                  <p className="text-xs text-muted-foreground">Folders</p>
                  <p className="mt-1 text-xl font-bold text-amber-900">{uniqueCategories.length}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Quick Actions</p>
                <button
                  onClick={startTour}
                  title="Restart app tour"
                  aria-label="Restart app tour"
                  className="flex w-full items-center gap-3 rounded-md border border-teal-200 bg-teal-50 p-3 text-left transition-colors hover:bg-teal-100"
                >
                  <HelpCircle className="h-4 w-4 text-teal-700" />
                  <span>
                    <span className="block font-medium">Restart tour</span>
                    <span className="block text-xs text-muted-foreground">Walk through the app again.</span>
                  </span>
                </button>
                <button
                  onClick={exportBookmarks}
                  title="Export bookmarks"
                  aria-label="Export bookmarks"
                  className="flex w-full items-center gap-3 rounded-md border border-sky-200 bg-sky-50 p-3 text-left transition-colors hover:bg-sky-100"
                >
                  <Download className="h-4 w-4 text-sky-700" />
                  <span>
                    <span className="block font-medium">Export data</span>
                    <span className="block text-xs text-muted-foreground">Download bookmarks as JSON.</span>
                  </span>
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">View Style</p>
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-sky-200 bg-white p-3" title="Toggle compact bookmark cards">
                  <span className="flex items-center gap-2 font-medium">
                    <Minimize2 className="h-4 w-4 text-sky-700" />
                    Compact cards
                  </span>
                  <input
                    type="checkbox"
                    checked={isCompactView}
                    onChange={(event) => setIsCompactView(event.target.checked)}
                    className="h-4 w-4 accent-teal-700"
                    aria-label="Toggle compact bookmark cards"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-amber-200 bg-white p-3" title="Toggle colored category badges">
                  <span className="flex items-center gap-2 font-medium">
                    <Palette className="h-4 w-4 text-amber-700" />
                    Color badges
                  </span>
                  <input
                    type="checkbox"
                    checked={useColorBadges}
                    onChange={(event) => setUseColorBadges(event.target.checked)}
                    className="h-4 w-4 accent-teal-700"
                    aria-label="Toggle colored category badges"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Account</p>
                <div className="flex items-start gap-3 rounded-md bg-emerald-50 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium">Private by default</p>
                    <p className="mt-1 text-xs text-muted-foreground">Only your signed-in account can access this library.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3">
                  <Mail className="mt-0.5 h-4 w-4 text-slate-600" />
                  <div className="min-w-0">
                    <p className="font-medium">Signed in as</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDeleteAccountText("");
                    setIsAccountDeleteOpen(true);
                  }}
                  title="Delete account"
                  aria-label="Delete account"
                  className="flex w-full items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-left text-red-700 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>
                    <span className="block font-medium">Delete account</span>
                    <span className="block text-xs text-red-600/80">Permanently remove your account and bookmarks.</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <BookmarkForm 
          onSubmit={handleAddBookmark} 
          onCancel={() => setIsAddModalOpen(false)} 
          isLoading={isSubmitting} 
        />
      )}

      {isFolderModalOpen && (
        <NewFolderModal
          folderName={folderName}
          setFolderName={setFolderName}
          onSubmit={handleCreateFolder}
          onCancel={() => {
            setFolderName("");
            setIsFolderModalOpen(false);
          }}
        />
      )}

      {deleteCandidate && (
        <DeleteConfirmationModal 
          onConfirm={confirmDelete} 
          onCancel={() => setDeleteCandidate(null)} 
          isDeleting={false} 
        />
      )}

      {isAccountDeleteOpen && (
        <DeleteAccountModal
          email={user?.email}
          confirmationText={deleteAccountText}
          setConfirmationText={setDeleteAccountText}
          onCancel={() => {
            setDeleteAccountText("");
            setIsAccountDeleteOpen(false);
          }}
          onConfirm={confirmAccountDelete}
          isDeleting={isDeletingAccount}
        />
      )}

      {isTourOpen && (
        <AppTour
          stepIndex={tourStep}
          setStepIndex={setTourStep}
          onFinish={finishTour}
        />
      )}
    </>
  );
}

function StatCard({ title, value, trend, trendUp, icon }) {
  return (
    <div className="rounded-xl border border-teal-900/10 bg-white/85 text-card-foreground shadow-sm shadow-teal-900/5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-900/10">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={trendUp ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
            {trend}
          </span>
        </p>
      </div>
    </div>
  );
}

function FilterChip({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      title={`Filter by ${label}`}
      aria-label={`Filter by ${label}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isActive 
          ? "border-transparent bg-teal-700 text-white shadow-sm shadow-teal-900/20" 
          : "border-teal-900/10 bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-900"
      )}
    >
      {label}
    </button>
  );
}

const categoryText = (cat) => `category '${cat}'`;

const tourSteps = [
  {
    selector: "[data-tour='brand']",
    title: "Welcome to SmartMark",
    body: "This is your bookmark workspace. The tour will show where to save, organize, search, and adjust your library.",
  },
  {
    selector: "[data-tour='navigation']",
    title: "Navigation",
    body: "Use these shortcuts to jump between dashboard sections like Collections, Analytics, and Settings.",
  },
  {
    selector: "[data-tour='add-bookmark']",
    title: "Add Bookmarks",
    body: "Save a URL with a title and category. New items appear in the dashboard immediately.",
  },
  {
    selector: "[data-tour='new-folder']",
    title: "Create Folders",
    body: "Create a folder/category first, then use that category when saving bookmarks.",
  },
  {
    selector: "[data-tour='search-filters']",
    title: "Search And Filter",
    body: "Search by title or URL, then combine it with category chips to narrow your library.",
  },
  {
    selector: "[data-tour='analytics']",
    title: "Analytics",
    body: "These cards summarize your bookmark count, categories, visible results, and upcoming smart features.",
  },
  {
    selector: "[data-tour='collections']",
    title: "Collections",
    body: "Select any collection to filter the grid. Counts show how many bookmarks are inside each category.",
  },
  {
    selector: "[data-tour='bookmark-grid']",
    title: "Bookmark Grid",
    body: "Your saved links live here. Open a bookmark externally or delete one from each card.",
  },
  {
    selector: "[data-tour='settings']",
    title: "Account Center",
    body: "Manage your view style, export data, restart this tour, and find protected account actions.",
  },
  {
    selector: "[data-tour='profile']",
    title: "Profile And Logout",
    body: "Open your profile menu to access account settings or safely log out.",
  },
];

function AppTour({ stepIndex, setStepIndex, onFinish }) {
  const [targetRect, setTargetRect] = useState(null);
  const step = tourSteps[stepIndex];
  const isLastStep = stepIndex === tourSteps.length - 1;

  useEffect(() => {
    const measureTarget = () => {
      const target = document.querySelector(step.selector);

      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      setTargetRect(isVisible ? rect : null);
    };

    const updateTarget = () => {
      const target = document.querySelector(step.selector);

      if (!target) {
        setTargetRect(null);
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

      window.setTimeout(() => {
        measureTarget();
      }, 250);
    };

    updateTarget();
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [step.selector]);

  const cardPosition = targetRect
    ? {
        top: Math.min(window.innerHeight - 260, Math.max(24, targetRect.bottom + 18)),
        left: Math.min(window.innerWidth - 344, Math.max(16, targetRect.left)),
      }
    : {
        top: Math.max(24, window.innerHeight / 2 - 140),
        left: Math.max(16, window.innerWidth / 2 - 170),
      };

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" />
      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-xl border-2 border-amber-300 bg-white/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.58),0_18px_60px_rgba(20,83,45,0.35)]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}
      <div
        className="absolute w-[calc(100vw-32px)] max-w-sm rounded-xl border border-teal-900/10 bg-white p-5 text-slate-900 shadow-2xl shadow-teal-950/25"
        style={cardPosition}
        role="dialog"
        aria-modal="true"
        aria-label="Application tour"
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">
            {stepIndex + 1} of {tourSteps.length}
          </span>
          <button
            onClick={onFinish}
            title="Skip tour"
            aria-label="Skip tour"
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{step.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-700 transition-all"
            style={{ width: `${((stepIndex + 1) / tourSteps.length) * 100}%` }}
          />
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
            disabled={stepIndex === 0}
            title="Previous tour step"
            aria-label="Previous tour step"
            className="inline-flex h-10 items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (isLastStep) {
                onFinish();
                return;
              }
              setStepIndex((value) => value + 1);
            }}
            title={isLastStep ? "Finish tour" : "Next tour step"}
            aria-label={isLastStep ? "Finish tour" : "Next tour step"}
            className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-teal-900/20 transition-colors hover:bg-teal-800"
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  email,
  confirmationText,
  setConfirmationText,
  onCancel,
  onConfirm,
  isDeleting,
}) {
  const canDelete = confirmationText === "DELETE";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-2xl shadow-red-950/20 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">Delete account?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This permanently deletes {email ? email : "your account"} and removes all saved bookmarks. This cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="delete-account-confirmation" className="text-sm font-medium">
            Type DELETE to confirm
          </label>
          <input
            id="delete-account-confirmation"
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            placeholder="DELETE"
            title="Type DELETE to confirm account deletion"
            aria-label="Type DELETE to confirm account deletion"
            className="flex h-10 w-full rounded-md border border-red-200 bg-red-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            autoFocus
          />
        </div>

        <div className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-red-100 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            title="Cancel account deletion"
            aria-label="Cancel account deletion"
            className="inline-flex h-10 items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete || isDeleting}
            title="Permanently delete account"
            aria-label="Permanently delete account"
            className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete forever"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewFolderModal({ folderName, setFolderName, onSubmit, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-teal-900/10 bg-white p-6 shadow-2xl shadow-teal-950/20 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Create Folder</h2>
          <button
            onClick={onCancel}
            title="Close folder dialog"
            aria-label="Close folder dialog"
            className="rounded-md p-2 transition-colors hover:bg-teal-50"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="folder-name">Folder name</label>
            <input
              id="folder-name"
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="e.g. Design, Research, Tools"
              title="Enter folder name"
              aria-label="Folder name"
              autoFocus
              className="flex h-10 w-full rounded-md border border-teal-900/10 bg-teal-50/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-teal-900/10 pt-4">
            <button
              type="button"
              onClick={onCancel}
              title="Cancel folder creation"
              aria-label="Cancel folder creation"
              className="inline-flex h-10 items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              title="Create folder"
              aria-label="Create folder"
              className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
