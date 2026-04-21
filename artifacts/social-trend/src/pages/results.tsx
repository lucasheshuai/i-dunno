import { useParams, useLocation, Link } from "wouter";
import { useEffect, useMemo } from "react";
import {
  useGetQuestionResults,
  getGetQuestionResultsQueryKey,
  useGetQuestion,
  getGetQuestionQueryKey,
  useListQuestions,
  getListQuestionsQueryKey,
  useListClusters,
  getListClustersQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ArrowRight, Info, Trophy, ChevronRight } from "lucide-react";
import {
  getFlowState,
  hasOnboarded,
  hasSharedDemographics,
  getAnswerCount,
  getDominantProfileLabel,
  recordProfileSignals,
  getAnsweredQuestions,
  getNextInSequence,
  setFeedCursor,
  type QuestionRef,
  type ClusterRef,
} from "@/lib/store";
import {
  PredictionScoreModule,
  CrowdShockModule,
  DemographicSplitModule,
  ProfileBuilderModule,
  hasMeaningfulSplit,
} from "@/components/result-modules";

export default function ResultsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const flowState = getFlowState(id || "");
  const userAnswer = flowState.answer;
  const userPrediction = flowState.prediction;

  useEffect(() => {
    if (!hasOnboarded() && userAnswer) {
      setLocation(`/onboarding?returnTo=/results/${id}`);
    }
  }, [id, setLocation, userAnswer]);

  const { data: question, isLoading: isQLoading } = useGetQuestion(id || "", {
    query: { enabled: !!id, queryKey: getGetQuestionQueryKey(id || "") },
  });

  const { data: results, isLoading: isRLoading } = useGetQuestionResults(id || "", {
    query: { enabled: !!id && hasOnboarded(), queryKey: getGetQuestionResultsQueryKey(id || "") },
  });

  const { data: allQuestions } = useListQuestions(
    {},
    { query: { queryKey: getListQuestionsQueryKey({}) } }
  );

  const { data: allClusters } = useListClusters({
    query: { queryKey: getListClustersQueryKey() },
  });

  // Record profile signals for this question once data is available
  useEffect(() => {
    if (question && id && userAnswer) {
      recordProfileSignals(id, question.profileSignals);
    }
  }, [question, id, userAnswer]);

  // Compute next-in-sequence info
  const sequenceResult = useMemo(() => {
    if (!allQuestions || !allClusters || !id) return null;
    const answeredIds = new Set(Object.keys(getAnsweredQuestions()));
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
    return getNextInSequence(id, questionRefs, clusterRefs, answeredIds);
  }, [allQuestions, allClusters, id]);

  // Persist feed cursor in an effect (not inside useMemo) so home page can resume correctly
  useEffect(() => {
    if (sequenceResult?.next) {
      setFeedCursor(sequenceResult.next.topicClusterId, sequenceResult.next.id);
    }
  }, [sequenceResult]);

  if (isQLoading || isRLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 pt-12 flex flex-col gap-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-[250px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!question || !results) return null;

  // ─── Module selection logic ──────────────────────────────────────────────────

  const userAnswerDist = results.distribution.find((d) => d.option === userAnswer);
  const majorityDist = results.distribution.find((d) => d.option === results.majorityAnswer);
  const userAnswerPct = userAnswerDist?.percentage ?? 0;
  const majorityPct = majorityDist?.percentage ?? 0;

  const answerCount = getAnswerCount();
  const dominantLabel = getDominantProfileLabel();

  // Prediction Score always shows (mandatory, 1 of max 3 total).
  // Build eligible optional modules, then randomize their order so that
  // different questions show different combinations — no two results feel identical.
  // Cap at 2 optional so total never exceeds 3 modules.
  const eligibleOptional: Array<'crowd_shock' | 'demographic_split' | 'profile_builder'> = [];

  if (question.rewardTags.includes("crowd_shock") && userAnswerPct < 40 && !!userAnswer) {
    eligibleOptional.push('crowd_shock');
  }
  if (
    question.rewardTags.includes("demographic_split") &&
    hasSharedDemographics() &&
    (results.segments?.length ?? 0) > 0 &&
    hasMeaningfulSplit(results.segments ?? [], 15)
  ) {
    eligibleOptional.push('demographic_split');
  }
  if (question.profileSignals.length > 0 && answerCount >= 3) {
    eligibleOptional.push('profile_builder');
  }

  // Shuffle eligible list using question ID as a stable seed so the set is
  // consistent within a session but varies across questions
  const seed = id ? id.charCodeAt(id.length - 1) : 0;
  const shuffled = [...eligibleOptional].sort(
    (a, b) => ((a.charCodeAt(0) + seed) % 7) - ((b.charCodeAt(0) + seed) % 7)
  );
  const activeOptional = new Set(shuffled.slice(0, 2));
  const showCrowdShock = activeOptional.has('crowd_shock');
  const showDemographicSplit = activeOptional.has('demographic_split');
  const showProfileBuilder = activeOptional.has('profile_builder');

  // ─── Chart data ──────────────────────────────────────────────────────────────

  const chartData = results.distribution
    .map((d) => ({ name: d.option, value: d.percentage, count: d.count }))
    .sort((a, b) => b.value - a.value);

  // ─── Next question info ──────────────────────────────────────────────────────

  const nextQuestion = sequenceResult?.next;
  const clusterComplete = sequenceResult?.clusterComplete ?? false;
  const completedCluster = sequenceResult?.completedCluster;
  const nextTeaserText = nextQuestion?.teaserText || "Next question";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 w-full max-w-3xl mx-auto px-4 pt-4 md:pt-8 pb-16"
    >
      {/* Header */}
      <div className="text-center flex flex-col gap-3 mb-2">
        <div className="inline-flex px-3 py-1 rounded-md bg-secondary mx-auto text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
          Results
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-medium leading-tight text-balance">
          {question.prompt}
        </h1>
        <p className="text-muted-foreground text-sm">
          Based on {results.totalResponses.toLocaleString()} responses
        </p>
      </div>

      {/* Variable Reward Modules */}
      {userAnswer && userPrediction && (
        <PredictionScoreModule
          userAnswer={userAnswer}
          userPrediction={userPrediction}
          majorityAnswer={results.majorityAnswer}
          majorityPct={majorityPct}
          userAnswerPct={userAnswerPct}
        />
      )}

      {showCrowdShock && userAnswer && (
        <CrowdShockModule userAnswer={userAnswer} userAnswerPct={userAnswerPct} />
      )}

      {showDemographicSplit && results.segments && (
        <DemographicSplitModule segments={results.segments} />
      )}

      {showProfileBuilder && (
        <ProfileBuilderModule
          profileSignals={question.profileSignals}
          dominantLabel={dominantLabel}
          answerCount={answerCount}
        />
      )}

      {/* Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3"
      >
        <h2 className="text-lg font-bold">Overall Distribution</h2>
        <Card>
          <CardContent className="p-5">
            <div className="h-[220px] md:h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={130}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 500 }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border text-popover-foreground p-3 rounded-xl shadow-lg">
                            <p className="font-medium mb-1">{payload[0].payload.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {Number(payload[0].value).toFixed(1)}% ({payload[0].payload.count} votes)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === userAnswer
                            ? "hsl(var(--primary))"
                            : entry.name === results.majorityAnswer
                            ? "hsl(var(--primary) / 0.45)"
                            : "hsl(var(--secondary-foreground) / 0.12)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {userAnswer && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-primary mr-1 align-middle" />
                Your answer
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Demographic unlock prompt */}
      {!hasSharedDemographics() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm">See how groups split on this</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share your demographics to unlock Men vs Women, Single vs Married breakdowns.
                </p>
              </div>
              <Button size="sm" className="shrink-0" asChild>
                <Link href={`/onboarding?returnTo=/results/${id}`}>Unlock Splits</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cluster Complete Card */}
      {clusterComplete && completedCluster && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <Card className="border-2 border-amber-400/50 bg-amber-50/60 dark:bg-amber-900/10 overflow-hidden">
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-bold text-base text-amber-900 dark:text-amber-300">
                  You finished: {completedCluster.title}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {completedCluster.outro}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Teased Next CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 flex flex-col items-center gap-3"
      >
        {nextQuestion ? (
          <Button
            size="lg"
            className="h-auto min-h-14 px-6 rounded-xl text-left flex-col items-start gap-1 w-full max-w-md"
            onClick={() => setLocation(`/question/${nextQuestion.id}`)}
          >
            <span className="text-xs font-normal opacity-70 uppercase tracking-wide">
              {clusterComplete && completedCluster
                ? `Next: ${allClusters?.find((c) => c.id === nextQuestion.topicClusterId)?.title ?? "Next cluster"}`
                : "Up next"}
            </span>
            <span className="flex items-start gap-2 font-semibold text-base leading-snug w-full">
              <span className="flex-1 min-w-0 break-words">{nextTeaserText}</span>
              <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
            </span>
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm font-medium">
              You've answered every question. Impressive.
            </p>
            <Button size="lg" className="h-14 px-8 rounded-xl" asChild>
              <Link href="/profile">
                See your full profile <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        )}
        <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
          <Link href="/explore">Browse all topics</Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
