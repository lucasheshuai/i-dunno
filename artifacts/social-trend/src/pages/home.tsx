import { useLocation, Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetStats,
  getGetStatsQueryKey,
  useListQuestions,
  getListQuestionsQueryKey,
  useListClusters,
  getListClustersQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isQuestionAnswered,
  getAnsweredQuestions,
  getNextQuestion,
  getFeedCursor,
  type QuestionRef,
  type ClusterRef,
} from "@/lib/store";
import { useMemo } from "react";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: isStatsLoading } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() },
  });

  const { data: allQuestions, isLoading: isQuestionsLoading } = useListQuestions(
    {},
    { query: { queryKey: getListQuestionsQueryKey({}) } }
  );

  const { data: allClusters, isLoading: isClustersLoading } = useListClusters({
    query: { queryKey: getListClustersQueryKey() },
  });

  // Compute next unanswered question in cluster-sequential order.
  // Prefer the persisted feed cursor (set by the results page after each answer)
  // for fast resume, falling back to full recompute from answered state.
  const nextQuestion = useMemo(() => {
    if (!allQuestions || !allClusters) return null;
    const answeredIds = new Set(Object.keys(getAnsweredQuestions()));

    // Try cursor first — it points to the question computed right after the last answer
    const cursor = getFeedCursor();
    if (cursor && !answeredIds.has(cursor.questionId)) {
      const cursorQ = allQuestions.find(q => q.id === cursor.questionId);
      if (cursorQ) {
        return {
          id: cursorQ.id,
          topicClusterId: cursorQ.topicClusterId,
          clusterOrder: cursorQ.clusterOrder,
          teaserText: cursorQ.teaserText,
        };
      }
    }

    // Fall back to full cluster-sequential computation
    const questionRefs: QuestionRef[] = allQuestions.map((q) => ({
      id: q.id,
      topicClusterId: q.topicClusterId,
      clusterOrder: q.clusterOrder,
      teaserText: q.teaserText,
    }));
    const clusterRefs: ClusterRef[] = allClusters.map((c) => ({
      id: c.id,
      title: c.title,
      questionIds: c.questionIds,
      outro: c.outro,
    }));
    return getNextQuestion(questionRefs, clusterRefs, answeredIds);
  }, [allQuestions, allClusters]);

  const nextQuestionData = allQuestions?.find(q => q.id === nextQuestion?.id);
  const isLoading = isQuestionsLoading || isClustersLoading;

  const trendingQuestions = useMemo(() => {
    if (!allQuestions) return [];
    return allQuestions
      .filter(q => !isQuestionAnswered(q.id) && q.id !== nextQuestionData?.id)
      .slice(0, 3);
  }, [allQuestions, nextQuestionData]);

  return (
    <div className="flex flex-col gap-16 pb-12 w-full max-w-3xl mx-auto px-4 pt-12 md:pt-24">
      <section className="flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-balance leading-tight">
          How well do you know <br />
          <span className="text-primary italic">what everyone else thinks?</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl text-balance">
          Answer thought-provoking questions, predict the majority, and uncover how different demographics really think.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {nextQuestionData ? "Up Next" : "You're all caught up"}
          </h2>
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-48 rounded-xl" />
        ) : nextQuestionData ? (
          <Card
            className="group cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            onClick={() => setLocation(`/question/${nextQuestionData.id}`)}
          >
            <CardContent className="p-6 md:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start gap-4">
                <div className="inline-flex px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">
                  {nextQuestionData.category}
                </div>
                {allClusters && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {allClusters.find(c => c.id === nextQuestionData.topicClusterId)?.title}
                  </span>
                )}
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-medium leading-snug">
                {nextQuestionData.prompt}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">
                  {nextQuestionData.responseCount.toLocaleString()} responses
                </span>
                <Button
                  variant="ghost"
                  className="group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                >
                  Answer Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center p-8 bg-muted/20">
            <CardContent className="flex flex-col gap-4 items-center pt-2">
              <p className="text-muted-foreground">
                You've answered every question. Check your profile to see what it reveals.
              </p>
              <Button asChild>
                <Link href="/profile">
                  View Your Profile <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {trendingQuestions.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-semibold tracking-tight">More to Explore</h2>
            <Link href="/explore" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {trendingQuestions.map((q) => (
              <Card
                key={q.id}
                className="group cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setLocation(`/question/${q.id}`)}
              >
                <CardContent className="p-4 md:p-5 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="inline-flex px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider w-max">
                      {q.category}
                    </div>
                    <p className="font-medium text-sm md:text-base leading-snug line-clamp-2">
                      {q.prompt}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {q.responseCount.toLocaleString()} responses
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-serif text-lg font-bold">
            1
          </div>
          <h3 className="font-semibold text-lg">You Answer</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Give your honest opinion on questions ranging from dating to career. It's completely anonymous.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-serif text-lg font-bold">
            2
          </div>
          <h3 className="font-semibold text-lg">You Predict</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Guess what the majority of other people chose. This is where your social intuition gets tested.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-lg font-bold">
            3
          </div>
          <h3 className="font-semibold text-lg">Discover</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            See the real breakdown. Compare how men vs. women voted, or how different age groups think.
          </p>
        </div>
      </section>

      {!isStatsLoading && stats && (
        <section className="flex flex-wrap justify-center gap-8 py-8 px-4 bg-secondary/50 rounded-2xl">
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-serif font-bold">
              {stats.totalResponses.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Insights Shared
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-serif font-bold">
              {stats.activeUsers.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Curious Minds
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
