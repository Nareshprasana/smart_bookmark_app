import { createClient } from "@/lib/supabase/client";

export async function fetchBookmarks() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function addBookmark(bookmark) {
  const supabase = createClient();
  
  // We explicitly fetch the user to ensure we attach the correct user_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to add a bookmark.");

  const { data, error } = await supabase
    .from("bookmarks")
    .insert([{ ...bookmark, user_id: user.id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBookmark(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}
