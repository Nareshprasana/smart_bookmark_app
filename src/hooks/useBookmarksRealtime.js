import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useBookmarksRealtime(setBookmarks) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("realtime_bookmarks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookmarks" },
        (payload) => {
          setBookmarks((current) => {
            // Prevent duplicate insertions if optimistic UI already added this bookmark
            if (current.some((b) => b.id === payload.new.id)) {
              return current;
            }
            // Add the new bookmark to the beginning of the list
            return [payload.new, ...current];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookmarks" },
        (payload) => {
          setBookmarks((current) =>
            current.map((b) => (b.id === payload.new.id ? payload.new : b))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "bookmarks" },
        (payload) => {
          setBookmarks((current) =>
            current.filter((b) => b.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount to prevent memory leaks
    return () => {
      supabase.removeChannel(channel);
    };
  }, [setBookmarks]);
}
