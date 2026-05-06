"use client";

import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BookmarkCard({ bookmark, onDelete, compact = false, useColorBadge = true }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleting(true);
    // Let the parent handle the delete, we just trigger it and wait.
    onDelete(bookmark.id, () => setIsDeleting(false));
  };

  const domain = new URL(bookmark.url).hostname.replace("www.", "");

  return (
    <div className={cn(
      "group relative flex h-full flex-col justify-between rounded-xl border border-teal-900/10 bg-white text-card-foreground shadow-sm shadow-teal-900/5 transition-all hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-md hover:shadow-teal-900/10",
      compact ? "p-4" : "p-5"
    )}>
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex items-center justify-center rounded-lg bg-teal-100 text-teal-800",
          compact ? "mb-3 h-8 w-8" : "mb-4 h-10 w-10"
        )}>
          <Bookmark className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          title="Delete bookmark"
          aria-label={`Delete ${bookmark.title}`}
          className="rounded-md p-2 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div>
        <h3 className={cn("mb-1 font-semibold leading-tight tracking-tight line-clamp-2", compact ? "text-sm" : "text-base")}>
          {bookmark.title}
        </h3>
        <p className={cn(
          "mb-4 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium",
          useColorBadge ? "bg-amber-100 text-amber-900" : "bg-muted text-muted-foreground"
        )}>
          {bookmark.category || "Uncategorized"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-teal-900/10 pt-4">
        <span className="text-xs font-medium text-muted-foreground truncate pr-4">
          {domain}
        </span>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open ${bookmark.title}`}
          aria-label={`Open ${bookmark.title}`}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-teal-700 transition-colors hover:bg-teal-100"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
