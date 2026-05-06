"use client";

import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";

export function BookmarkCard({ bookmark, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleting(true);
    // Let the parent handle the delete, we just trigger it and wait.
    onDelete(bookmark.id, () => setIsDeleting(false));
  };

  const domain = new URL(bookmark.url).hostname.replace("www.", "");

  return (
    <div className="group relative rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/30 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
          <Bookmark className="h-5 w-5" />
        </div>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="rounded-md p-2 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          title="Delete Bookmark"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div>
        <h3 className="font-semibold leading-tight tracking-tight mb-1 line-clamp-2">
          {bookmark.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {bookmark.category || "Uncategorized"}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <span className="text-xs font-medium text-muted-foreground truncate pr-4">
          {domain}
        </span>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
