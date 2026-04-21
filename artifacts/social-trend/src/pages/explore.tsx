import { useLocation } from "wouter";
import {
  useListQuestions,
  getListQuestionsQueryKey,
  useListClusters,
  getListClustersQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getAnsweredQuestions, isQuestionAnswered, getRecentResponses, getProfileSignalCounts } from "@/lib/store";
import { ChevronRight, TrendingUp, Target, CheckCircle2, UserCircle2 } from "lucide-react";
import { useMemo } from "react";

export default function Explore() {
  const [, setLocation] = useLocation();

  const { data: allQuestions, isLoading: isQuestionsLoading } = useListQuestions(
    {},
    { query: { queryKey: getListQuestionsQueryKey({}) } }
  );

  const { data: allClusters, isLoading: isClustersLoading } = useListClusters({
    query: { queryKey: getListClustersQueryKey() },
  });

  const answeredIds = useMemo(() => new Set(Object.keys(getAnsweredQuestions())), []);
  const isLoading = isQuestionsLoading || isClustersLoading;

  // Build cluster progress info
  const clusterProgress = useMemo(() => {
    if (!allClusters || !allQuestions) return [];
    return allClusters.map(cluster => {
      const questions = allQuestions
        .filter(q => q.topicClusterId === cluster.id)
        .sort((a, b) => a.clusterOrder - b.clusterOrder);
      const answered = questions.filter(q => answeredIds.has(q.id)).length;
      const total = questions.length;
      const firstUnanswered = questions.find(q => !answeredIds.has(q.id));
      return {
        cluster,
        questions,
        answered,
        total,
        firstUnanswered,
        isComplete: answered === total && total > 0,
      };
    });
  }, [allClusters, allQuestions, answeredIds]);

  // Trending Divides: questions tagged demographic_split, unanswered first
  const trendingDivides = useMemo(() => {
    if (!allQuestions) return [];
    return allQuestions
      .filter(q => q.rewardTags.includes("demographic_split"))
      .sort((a, b) => (isQuestionAnswered(a.id) ? 1 : 0) - (isQuestionAnswered(b.id) ? 1 : 0))
      .slice(0, 4);
  }, [allQuestions]);

  // Most Misread: questions where user mispredicted (answer !== prediction as proxy)
  // plus questions tagged crowd_shock that are unanswered — the whole point is
  // surfacing questions that tend to trip people up.
  const mostMisread = useMemo(() => {
    if (!allQuestions) return [];

    // IDs of questions where user went against their own prediction (proxy for misprediction)
    const recentResponses = getRecentResponses(50);
    const mispredictedIds = new Set(
      recentResponses
        .filter(r => r.answer !== r.prediction)
        .map(r => r.questionId)
    );

    const scored = allQuestions
      .filter(q => q.rewardTags.includes("crowd_shock") || mispredictedIds.has(q.id))
      .map(q => ({
        q,
        score:
          (mispredictedIds.has(q.id) ? 2 : 0) +          // user already surprised themselves
          (q.rewardTags.includes("crowd_shock") ? 1 : 0) + // flagged as surprising
          (isQuestionAnswered(q.id) ? 0 : 1),              // prefer unanswered
      }))
      .sort((a, b) => b.score - a.score)
      .map(({ q }) => q)
      .slice(0, 4);

    return scored;
  }, [allQuestions]);

  // Best for Your Profile: surfaces unanswered questions whose profileSignals
  // extend the user's existing profile into underexplored territory.
  // If user has no signals yet, shows questions with the richest profileSignals array.
  const bestForProfile = useMemo(() => {
    if (!allQuestions) return [];
    const signalCounts = getProfileSignalCounts();
    const hasSignals = Object.keys(signalCounts).length > 0;
    const dominantSignals = new Set(
      Object.entries(signalCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([s]) => s)
    );

    return allQuestions
      .filter(q => !isQuestionAnswered(q.id) && q.profileSignals.length > 0)
      .map(q => {
        // Score: prioritize questions that add NEW signal dimensions
        const newSignals = q.profileSignals.filter(s => !dominantSignals.has(s)).length;
        const existingSignals = q.profileSignals.filter(s => dominantSignals.has(s)).length;
        const score = hasSignals
          ? newSignals * 2 + existingSignals           // new dims weighted higher
          : q.profileSignals.length;                   // no profile yet: richest wins
        return { q, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ q }) => q)
      .slice(0, 4);
  }, [allQuestions, answeredIds]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto px-4 pt-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full max-w-3xl mx-auto px-4 pt-8 pb-16">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Explore Topics</h1>
        <p className="text-muted-foreground">
          Dive into a cluster or seek out the questions that divide people most.
        </p>
      </div>

      {/* Cluster grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
          Topic Clusters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clusterProgress.map(({ cluster, answered, total, firstUnanswered, questions, isComplete }, idx) => {
            const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

            return (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`group cursor-pointer h-full transition-all hover:border-primary/40 hover:shadow-sm ${isComplete ? "bg-muted/30" : ""}`}
                  onClick={() => {
                    if (firstUnanswered) {
                      setLocation(`/question/${firstUnanswered.id}`);
                    } else if (questions.length > 0) {
                      // Cluster complete — view first question's results
                      setLocation(`/results/${questions[0].id}`);
                    }
                  }}
                >
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-semibold text-base leading-snug">
                        {cluster.title}
                      </h3>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronRight className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                      {cluster.intro}
                    </p>
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {answered}/{total}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {isComplete
                          ? "Completed ✓"
                          : answered === 0
                          ? `${total} questions`
                          : `${total - answered} remaining`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trending Divides */}
      {trendingDivides.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
              Trending Divides
            </h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            These questions split groups most sharply.
          </p>
          <div className="flex flex-col gap-3">
            {trendingDivides.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
              >
                <Card
                  className="group cursor-pointer hover:border-blue-400/50 hover:shadow-sm transition-all"
                  onClick={() =>
                    setLocation(isQuestionAnswered(q.id) ? `/results/${q.id}` : `/question/${q.id}`)
                  }
                >
                  <CardContent className="p-4 flex items-center gap-4 justify-between">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {q.category}
                        </span>
                        {isQuestionAnswered(q.id) && (
                          <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium">
                            Answered
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-sm leading-snug line-clamp-2">{q.prompt}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4 text-blue-600 group-hover:text-white" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Most Misread */}
      {mostMisread.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
              Most Misread
            </h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Questions where most people get the crowd wrong — including you.
          </p>
          <div className="flex flex-col gap-3">
            {mostMisread.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
              >
                <Card
                  className="group cursor-pointer hover:border-amber-400/50 hover:shadow-sm transition-all"
                  onClick={() =>
                    setLocation(isQuestionAnswered(q.id) ? `/results/${q.id}` : `/question/${q.id}`)
                  }
                >
                  <CardContent className="p-4 flex items-center gap-4 justify-between">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {q.category}
                        </span>
                        {isQuestionAnswered(q.id) ? (
                          <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium">
                            Answered
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">
                            Surprising
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-sm leading-snug line-clamp-2">{q.prompt}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4 text-amber-600 group-hover:text-white" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Best for Your Profile */}
      {bestForProfile.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2">
            <UserCircle2 className="w-4 h-4 text-violet-600" />
            <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
              Best for Your Profile
            </h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Questions that would add new dimensions to your perspective profile.
          </p>
          <div className="flex flex-col gap-3">
            {bestForProfile.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
              >
                <Card
                  className="group cursor-pointer hover:border-violet-400/50 hover:shadow-sm transition-all"
                  onClick={() => setLocation(`/question/${q.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4 justify-between">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {q.category}
                        </span>
                        <span className="text-[10px] bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded font-medium">
                          Builds profile
                        </span>
                      </div>
                      <p className="font-medium text-sm leading-snug line-clamp-2">{q.prompt}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-950 group-hover:bg-violet-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4 text-violet-600 group-hover:text-white" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
