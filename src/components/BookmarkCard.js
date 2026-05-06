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
    <div className="group relative flex h-full flex-col justify-between rounded-xl border border-teal-900/10 bg-white p-5 text-card-foreground shadow-sm shadow-teal-900/5 transition-all hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-md hover:shadow-teal-900/10">
      <div className="flex items-start justify-between">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
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
        <p className="mb-4 inline-flex w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
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
          className="inline-flex items-center justify-center rounded-md p-1.5 text-teal-700 transition-colors hover:bg-teal-100"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
