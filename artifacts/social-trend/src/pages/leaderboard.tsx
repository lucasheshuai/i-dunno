import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Trophy, Medal, Users, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionId } from "@/lib/store";

interface LeaderboardEntry {
  rank: number;
  handle: string;
  answeredCount: number;
  predictionAccuracy: number;
  badge: string;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  totalParticipants: number;
}

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-400 shrink-0">
        <Medal className="w-5 h-5" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-400/20 text-slate-300 shrink-0">
        <Medal className="w-5 h-5" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-600/20 text-orange-400 shrink-0">
        <Medal className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-muted-foreground text-sm font-semibold shrink-0">
      {rank}
    </div>
  );
}

function EntryRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <motion.div
      key={entry.handle}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
        entry.isCurrentUser
          ? "bg-primary/10 border-primary/30"
          : "bg-secondary/20 border-border/30 hover:bg-secondary/40"
      }`}
    >
      <RankDisplay rank={entry.rank} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-medium text-foreground truncate">
            {entry.handle}
          </span>
          {entry.isCurrentUser && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold shrink-0">
              You
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs shrink-0">
            {entry.badge}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>{entry.answeredCount} answered</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-lg font-serif font-bold text-foreground">
          {Math.round(entry.predictionAccuracy * 100)}%
        </div>
        <div className="text-xs text-muted-foreground">accuracy</div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const sessionId = getSessionId();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = sessionId
      ? `/api/leaderboard?sessionId=${encodeURIComponent(sessionId)}`
      : "/api/leaderboard";

    fetch(url)
      .then((r) => r.json())
      .then((json) => setData(json as LeaderboardData))
      .catch(() => setData({ entries: [], currentUserRank: null, totalParticipants: 0 }))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 pt-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-64" />
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const currentUserInTop = data?.entries.some((e) => e.isCurrentUser && e.rank <= 50);
  const hasAnswers = data && data.currentUserRank !== null;

  const top50Entries = data?.entries.filter((e) => e.rank <= 50) ?? [];
  const overflowEntry = data?.entries.find((e) => e.isCurrentUser && e.rank > 50);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-6 pt-4"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-1">
          See how your predictions stack up
        </p>
      </div>

      <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-secondary/30 border border-border/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            <span className="font-semibold text-foreground">{data?.totalParticipants ?? 0}</span>{" "}
            participants
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="w-4 h-4" />
          <span>Ranked by accuracy · answered</span>
        </div>
      </div>

      {!hasAnswers && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Trophy className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">You're not on the board yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Answer questions to appear on the leaderboard
            </p>
          </div>
          <Button asChild>
            <Link href="/">Answer Questions</Link>
          </Button>
        </div>
      )}

      {(top50Entries.length > 0 || overflowEntry) && (
        <div className="flex flex-col gap-2">
          {top50Entries.map((entry, i) => (
            <EntryRow key={entry.handle + entry.rank} entry={entry} index={i} />
          ))}

          {overflowEntry && (
            <>
              <div className="flex items-center gap-3 py-2 px-1">
                <div className="flex-1 border-t border-dashed border-border/50" />
                <span className="text-xs text-muted-foreground px-2">···</span>
                <div className="flex-1 border-t border-dashed border-border/50" />
              </div>
              <EntryRow entry={overflowEntry} index={50} />
            </>
          )}
        </div>
      )}

      {hasAnswers && !currentUserInTop && !overflowEntry && (
        <p className="text-xs text-center text-muted-foreground">
          Your rank: #{data?.currentUserRank}
        </p>
      )}
    </motion.div>
  );
}
