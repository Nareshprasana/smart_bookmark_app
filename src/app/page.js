import { Navbar } from "@/components/Navbar";
import { Container } from "@/components/Container";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial bookmarks server-side
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar user={user} />
      
      <main className="py-8">
        <Container>
          <DashboardClient initialBookmarks={bookmarks || []} user={user} />
        </Container>
      </main>
    </div>
  );
}
