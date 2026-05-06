"use client";

import { AlertTriangle } from "lucide-react";

export function DeleteConfirmationModal({ onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-6 shadow-2xl shadow-red-950/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight mb-2">Delete Bookmark?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This action cannot be undone. This will permanently delete this bookmark from our servers.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            title="Cancel delete"
            aria-label="Cancel delete"
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100 disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            title="Delete bookmark permanently"
            aria-label="Delete bookmark permanently"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 sm:w-auto"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
