"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL (e.g. https://example.com)" }),
  title: z.string().min(1, { message: "Title is required" }),
  category: z.string().optional(),
});

export function BookmarkForm({ onSubmit, onCancel, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      title: "",
      category: "",
    },
  });

  // Handle escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-teal-900/10 bg-white p-6 shadow-2xl shadow-teal-950/20 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Add New Bookmark</h2>
          <button
            onClick={onCancel}
            title="Close add bookmark dialog"
            aria-label="Close add bookmark dialog"
            className="rounded-md p-2 transition-colors hover:bg-teal-50"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data, reset))} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">URL</label>
            <input
              {...register("url")}
              placeholder="https://example.com"
              title="Bookmark URL"
              aria-label="Bookmark URL"
              className="flex h-10 w-full rounded-md border border-teal-900/10 bg-teal-50/40 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Title</label>
            <input
              {...register("title")}
              placeholder="Bookmark Title"
              title="Bookmark title"
              aria-label="Bookmark title"
              className="flex h-10 w-full rounded-md border border-teal-900/10 bg-teal-50/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Category (Optional)</label>
            <input
              {...register("category")}
              placeholder="e.g. Work, Reading List"
              title="Bookmark category"
              aria-label="Bookmark category"
              className="flex h-10 w-full rounded-md border border-teal-900/10 bg-teal-50/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-teal-900/10 pt-4">
            <button
              type="button"
              onClick={onCancel}
              title="Cancel adding bookmark"
              aria-label="Cancel adding bookmark"
              className="inline-flex h-10 items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              title="Save bookmark"
              aria-label="Save bookmark"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />}
              Save Bookmark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
