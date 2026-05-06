import { Navbar } from "@/components/Navbar";
import { Container } from "@/components/Container";
import { FolderPlus, BookmarkPlus, Sparkles, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar user={user} />
      
      <main className="py-8">
        <Container>
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage and organize your bookmarks smartly.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm ring-1 ring-inset ring-border transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring dark:bg-zinc-950">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </button>
              <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring">
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Add Bookmark
              </button>
            </div>
          </div>

          {/* Stats/Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard 
              title="Total Bookmarks" 
              value="1,248" 
              trend="+12%" 
              trendUp={true} 
              icon={<BookmarkPlus className="h-4 w-4 text-muted-foreground" />} 
            />
            <StatCard 
              title="Collections" 
              value="32" 
              trend="+2" 
              trendUp={true} 
              icon={<FolderPlus className="h-4 w-4 text-muted-foreground" />} 
            />
            <StatCard 
              title="AI Summaries" 
              value="843" 
              trend="Auto-generated" 
              trendUp={true} 
              icon={<Sparkles className="h-4 w-4 text-purple-500" />} 
            />
            <StatCard 
              title="Read Rate" 
              value="68%" 
              trend="+5.4%" 
              trendUp={true} 
              icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} 
            />
          </div>

          {/* Main Content Area */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Recent Bookmarks (takes up 2 columns on medium screens) */}
            <div className="md:col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50">
                <h3 className="font-semibold leading-none tracking-tight">Recent Bookmarks</h3>
                <p className="text-sm text-muted-foreground">Your recently added or viewed items.</p>
              </div>
              <div className="p-6">
                <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/10">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <BookmarkPlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 font-semibold">No recent bookmarks</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                      Get started by adding a new bookmark. SmartMark will automatically categorize and summarize it for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / Quick Actions */}
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <h3 className="font-semibold leading-none tracking-tight mb-4">Quick Collections</h3>
                <div className="space-y-3">
                  {[
                    { name: "Design Inspiration", count: 42, color: "bg-pink-500" },
                    { name: "Engineering Blogs", count: 18, color: "bg-blue-500" },
                    { name: "Recipes", count: 7, color: "bg-orange-500" },
                    { name: "Read Later", count: 124, color: "bg-emerald-500" },
                  ].map((collection, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${collection.color}`} />
                        <span className="text-sm font-medium">{collection.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {collection.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={trendUp ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
            {trend}
          </span>{" "}
          from last month
        </p>
      </div>
    </div>
  );
}
