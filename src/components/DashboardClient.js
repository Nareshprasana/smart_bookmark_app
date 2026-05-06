"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { FolderPlus, BookmarkPlus, Sparkles, TrendingUp, Search, X, ShieldCheck, Radio, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { BookmarkCard } from "./BookmarkCard";
import { BookmarkForm } from "./BookmarkForm";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { addBookmark, deleteBookmark } from "@/services/bookmarks";
import { useBookmarksRealtime } from "@/hooks/useBookmarksRealtime";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export function DashboardClient({ initialBookmarks }) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks || []);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

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
    const cats = new Set(bookmarks.map(b => b.category || "Uncategorized"));
    return Array.from(cats).sort();
  }, [bookmarks]);

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
          <button className="inline-flex h-10 items-center justify-center rounded-md bg-sky-100 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm ring-1 ring-inset ring-sky-200 transition-colors hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-ring">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-teal-900/20 transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Add Bookmark
          </button>
        </div>
      </div>

      {/* Stats/Overview Cards */}
      <div id="analytics" className="scroll-mt-24 mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-teal-900/10 bg-white/75 p-4 shadow-sm shadow-teal-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input 
            ref={searchInputRef}
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-teal-900/10 bg-white pl-10 pr-10 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
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
        <div className="rounded-xl border border-teal-900/10 bg-white/85 text-card-foreground shadow-sm shadow-teal-900/5 md:col-span-2">
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
              <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard 
                    key={bookmark.id} 
                    bookmark={bookmark} 
                    onDelete={handleDeleteRequest} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="flex flex-col gap-6">
          <div id="collections" className="scroll-mt-24 rounded-xl border border-teal-900/10 bg-white/85 p-6 text-card-foreground shadow-sm shadow-teal-900/5">
            <h3 className="font-semibold leading-none tracking-tight mb-4">Categories</h3>
            {uniqueCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              <div className="space-y-3">
                <div 
                  onClick={() => setSelectedCategory("All")}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                    selectedCategory === "All" ? "bg-teal-100 text-teal-900 font-medium" : "hover:bg-sky-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                    <span className="text-sm">All Bookmarks</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {bookmarks.length}
                  </span>
                </div>
                
                {uniqueCategories.map((category, i) => {
                  const count = bookmarks.filter(b => (b.category || 'Uncategorized') === category).length;
                  const colors = ["bg-pink-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500"];
                  const color = colors[i % colors.length];
                  const isActive = selectedCategory === category;
                  
                  return (
                    <div 
                      key={category} 
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                        isActive ? "bg-teal-100 text-teal-900 font-medium" : "hover:bg-sky-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        <span className="text-sm truncate max-w-[120px]">{category}</span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div id="settings" className="scroll-mt-24 rounded-xl border border-teal-900/10 bg-white/85 p-6 text-card-foreground shadow-sm shadow-teal-900/5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-semibold leading-none tracking-tight">Settings</h3>
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-md bg-emerald-50 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div>
                  <p className="font-medium">Private by default</p>
                  <p className="mt-1 text-xs text-muted-foreground">Your saved links are scoped to your signed-in account.</p>
                </div>
              </div>
              <label className="flex cursor-pointer items-center justify-between rounded-md border border-sky-200 bg-sky-50/70 p-3">
                <span>
                  <span className="block font-medium">Realtime updates</span>
                  <span className="block text-xs text-muted-foreground">Keep the dashboard synced as bookmarks change.</span>
                </span>
                <input type="checkbox" checked readOnly className="h-4 w-4 accent-foreground" />
              </label>
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

      {deleteCandidate && (
        <DeleteConfirmationModal 
          onConfirm={confirmDelete} 
          onCancel={() => setDeleteCandidate(null)} 
          isDeleting={false} 
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
