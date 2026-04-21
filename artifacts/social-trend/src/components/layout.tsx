import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, User, Library, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasSharedDemographics, getDemographics, getNickname } from "@/lib/store";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isHome = location === "/";

  useEffect(() => {
    if (hasSharedDemographics()) {
      const demographics = getDemographics();
      const nickname = getNickname();
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, ...demographics }),
      }).catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col relative w-full overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC4wOCIvPjwvc3ZnPg==')]"></div>
      
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isHome && (
              <Button variant="ghost" size="icon" className="md:hidden" asChild>
                <Link href="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
            )}
            <Link href="/" className="font-serif text-xl font-medium tracking-tight hover:text-primary transition-colors flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              I Dunno
            </Link>
          </div>
          
          <nav className="flex items-center gap-2 md:gap-6">
            <Link href="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <Library className="w-4 h-4 hidden md:block" />
              Explore
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <Trophy className="w-4 h-4 hidden md:block" />
              Leaderboard
            </Link>
            <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <User className="w-4 h-4 hidden md:block" />
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 pt-6 md:pt-10 pb-20">
        {children}
      </main>
    </div>
  );
}
