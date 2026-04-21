import { useLocation, Link } from "wouter";
import { ArrowRight, ChevronRight, Zap, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useListQuestions,
  getListQuestionsQueryKey,
  useListClusters,
  getListClustersQueryKey,
  useGetProfile,
  getGetProfileQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  getAnsweredQuestions,
  getNextQuestion,
  getFeedCursor,
  getDominantProfileLabel,
  getRecentResponses,
  type QuestionRef,
  type ClusterRef,
} from "@/lib/store";
import { useMemo } from "react";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: allQuestions, isLoading: isQuestionsLoading } = useListQuestions(
    {},
    { query: { queryKey: getListQuestionsQueryKey({}) } }
  );

  const { data: allClusters, isLoading: isClustersLoading } = useListClusters({
    query: { queryKey: getListClustersQueryKey() },
  });

  const { data: profile, isLoading: isProfileLoading } = useGetProfile(
    { query: { queryKey: getGetProfileQueryKey() } }
  );

  const answeredIds = useMemo(() => new Set(Object.keys(getAnsweredQuestions())), []);
  const answerCount = answeredIds.size;
  const isFirstTime = answerCount === 0;

  // Compute next unanswered question (cursor first, then full recompute)
  const nextQuestion = useMemo(() => {
    if (!allQuestions || !allClusters) return null;

    const cursor = getFeedCursor();
    if (cursor && !answeredIds.has(cursor.questionId)) {
      const cursorQ = allQuestions.find(q => q.id === cursor.questionId);
      if (cursorQ) return cursorQ;
    }

    const questionRefs: QuestionRef[] = allQuestions.map(q => ({
      id: q.id,
      topicClusterId: q.topicClusterId,
      clusterOrder: q.clusterOrder,
      teaserText: q.teaserText,
    }));
    const clusterRefs: ClusterRef[] = allClusters.map(c => ({
      id: c.id,
      title: c.title,
      questionIds: c.questionIds,
      outro: c.outro,
    }));
    const ref = getNextQuestion(questionRefs, clusterRefs, answeredIds);
    return ref ? allQuestions.find(q => q.id === ref.id) ?? null : null;
  }, [allQuestions, allClusters, answeredIds]);

  // Featured cluster = cluster of the next question (or first cluster)
  const featuredCluster = useMemo(() => {
    if (!allClusters) return null;
    if (nextQuestion) return allClusters.find(c => c.id === nextQuestion.topicClusterId) ?? allClusters[0];
    return allClusters[0] ?? null;
  }, [allClusters, nextQuestion]);

  // "Latest reveal" card — how many of the last 5 the user went against the grain
  const latestReveal = useMemo(() => {
    const recent = getRecentResponses(5);
    if (recent.length === 0) return null;
    const againstGrain = recent.filter(r => r.answer !== r.prediction).length;
    return { total: recent.length, againstGrain };
  }, [answerCount]);

  const profileLabel = getDominantProfileLabel();
  const accuracy = profile ? Math.round(profile.predictionAccuracy * 100) : null;
  const isLoading = isQuestionsLoading || isClustersLoading;

  // ── First-time visitor view ───────────────────────────────────────────────
  if (!isLoading && isFirstTime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 w-full max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-balance leading-tight">
            How well do you know <br />
            <span className="text-primary italic">what everyone else thinks?</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg text-balance">
            Answer one question. Predict the crowd. Discover where you stand.
          </p>
          <Button
            size="lg"
            className="h-14 px-10 text-base rounded-xl mt-2"
            onClick={() => nextQuestion
              ? setLocation(`/question/${nextQuestion.id}`)
              : setLocation("/explore")
            }
          >
            Start your insight feed
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-xs text-muted-foreground">Anonymous · Free · No signup needed</p>
        </motion.div>
      </div>
    );
  }

  // ── Returning user dashboard ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-3xl mx-auto px-4 pt-6 md:pt-12">

      {/* Continue CTA */}
      <section>
        {isLoading ? (
          <Skeleton className="w-full h-20 rounded-xl" />
        ) : nextQuestion ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <button
              className="w-full text-left bg-primary text-primary-foreground rounded-2xl p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-primary/90 transition-colors shadow-lg"
              onClick={() => setLocation(`/question/${nextQuestion.id}`)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                  {allClusters?.find(c => c.id === nextQuestion.topicClusterId)?.title ?? "Continue"}
                </span>
                <span className="font-serif text-lg md:text-xl font-semibold leading-snug">
                  {answerCount > 0 ? "Pick up where you left off" : "Start your insight feed"}
                </span>
                <span className="text-sm opacity-75 mt-0.5 line-clamp-1">
                  {nextQuestion.teaserText || nextQuestion.prompt}
                </span>
              </div>
              <ChevronRight className="w-6 h-6 shrink-0 opacity-80" />
            </button>
          </motion.div>
        ) : (
          <Card className="bg-muted/30">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <p className="text-muted-foreground font-medium">
                You've answered everything — impressive.
              </p>
              <Button asChild>
                <Link href="/profile">View profile <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Cards row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Profile snapshot */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="h-full">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <Target className="w-4 h-4" />
                Your snapshot
              </div>
              {isProfileLoading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-serif font-bold">{answerCount}</span>
                    <span className="text-sm text-muted-foreground pb-1">questions answered</span>
                  </div>
                  {accuracy !== null && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground shrink-0">
                        {accuracy}% accuracy
                      </span>
                    </div>
                  )}
                  {profileLabel ? (
                    <div className="inline-flex px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold w-max">
                      {profileLabel}
                    </div>
                  ) : answerCount >= 3 ? null : (
                    <p className="text-xs text-muted-foreground">Answer 3+ questions to reveal your profile</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Latest reveal */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <Zap className="w-4 h-4" />
                Latest reveal
              </div>
              {latestReveal ? (
                <div className="flex flex-col gap-2">
                  <p className="text-2xl font-serif font-bold">
                    {latestReveal.againstGrain}
                    <span className="text-base font-sans font-normal text-muted-foreground ml-1">
                      / {latestReveal.total}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {latestReveal.againstGrain === 0
                      ? "You went with the crowd on your last answers."
                      : latestReveal.againstGrain >= 3
                      ? "You took the contrarian view in most of your recent answers."
                      : "You went against the grain in your recent answers."}
                  </p>
                  <Link href="/explore" className="text-xs text-primary font-medium hover:underline mt-1">
                    See all results →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Answer a few questions to see how your views compare to the crowd.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Featured cluster */}
      {featuredCluster && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <BookOpen className="w-4 h-4" />
              {nextQuestion && allClusters?.find(c => c.id === nextQuestion.topicClusterId)?.id === featuredCluster.id
                ? "You're exploring"
                : "Featured cluster"}
            </div>
          </div>
          <Card
            className="group cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => {
              const firstQ = allQuestions
                ?.filter(q => q.topicClusterId === featuredCluster.id)
                .sort((a, b) => a.clusterOrder - b.clusterOrder)
                .find(q => !answeredIds.has(q.id));
              if (firstQ) setLocation(`/question/${firstQ.id}`);
              else setLocation("/explore");
            }}
          >
            <CardContent className="p-5 md:p-6 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-xl font-semibold">{featuredCluster.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {featuredCluster.intro}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
              <div className="flex items-center gap-3 mt-1">
                {(() => {
                  const total = featuredCluster.questionIds.length;
                  const done = featuredCluster.questionIds.filter(id => answeredIds.has(id)).length;
                  return (
                    <>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {done}/{total} answered
                      </span>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </div>
  );
}
