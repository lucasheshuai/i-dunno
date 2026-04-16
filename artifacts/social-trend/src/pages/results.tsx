import { useParams, useLocation, Link } from "wouter";
import { useGetQuestionResults, getGetQuestionResultsQueryKey, useGetQuestion, getGetQuestionQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight, Info, CheckCircle2, XCircle } from "lucide-react";
import { getFlowState, hasOnboarded, hasSharedDemographics } from "@/lib/store";
import { useEffect } from "react";

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
    query: {
      enabled: !!id,
      queryKey: getGetQuestionQueryKey(id || "")
    }
  });

  const { data: results, isLoading: isRLoading } = useGetQuestionResults(id || "", {
    query: {
      enabled: !!id && hasOnboarded(),
      queryKey: getGetQuestionResultsQueryKey(id || "")
    }
  });

  if (isQLoading || isRLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 pt-12 flex flex-col gap-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!question || !results) return null;

  const wasPredictionCorrect = userPrediction === results.majorityAnswer;

  const chartData = results.distribution.map(d => ({
    name: d.option,
    value: d.percentage,
    count: d.count
  })).sort((a, b) => b.value - a.value);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-10 w-full max-w-3xl mx-auto px-4 pt-4 md:pt-8"
    >
      <div className="text-center flex flex-col gap-3 mb-4">
        <div className="inline-flex px-3 py-1 rounded-md bg-secondary mx-auto text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
          Results
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-medium leading-tight text-balance">
          {question.prompt}
        </h1>
        <p className="text-muted-foreground text-sm">Based on {results.totalResponses.toLocaleString()} responses</p>
      </div>

      {userPrediction && (
        <Card className={`border-2 overflow-hidden ${wasPredictionCorrect ? 'border-green-500/50 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {wasPredictionCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <h3 className="font-bold text-lg">
                  {wasPredictionCorrect ? "You read the crowd perfectly" : "You overestimated the crowd"}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                You predicted <span className="font-semibold text-foreground">"{userPrediction}"</span>. 
                The actual majority chose <span className="font-semibold text-foreground">"{results.majorityAnswer}"</span>.
              </p>
            </div>
            {userAnswer && (
              <div className="bg-background border rounded-lg p-3 shrink-0 text-center min-w-[140px]">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Answer</div>
                <div className="font-medium text-sm truncate max-w-[120px]" title={userAnswer}>{userAnswer}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Distribution Chart */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-serif font-bold">Overall Distribution</h2>
        <Card>
          <CardContent className="p-6">
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500}} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border text-popover-foreground p-3 rounded-xl shadow-lg">
                            <p className="font-medium mb-1">{payload[0].payload.name}</p>
                            <p className="text-sm text-muted-foreground">{Number(payload[0].value).toFixed(1)}% ({payload[0].payload.count} votes)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === results.majorityAnswer ? 'hsl(var(--primary))' : 'hsl(var(--secondary-foreground) / 0.15)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographic Breakdown — only shown when user shared their demographics */}
      {hasSharedDemographics() && results.segments && results.segments.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold">Demographic Splits</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.segments.map((segment, idx) => {
              // Find the top option for this segment
              const topOption = [...segment.distribution].sort((a,b) => b.percentage - a.percentage)[0];
              
              return (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader className="bg-secondary/30 pb-4">
                    <CardTitle className="text-base font-medium flex justify-between items-center">
                      <span>{segment.groupName}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Majority chose:</span>
                      <span className="font-semibold">{topOption?.option || "N/A"}</span>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      {segment.distribution.slice(0, 3).map((dist, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-12 text-xs font-medium text-right shrink-0">{dist.percentage.toFixed(0)}%</div>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${dist.option === topOption?.option ? 'bg-primary' : 'bg-primary/30'}`} 
                              style={{ width: `${dist.percentage}%` }} 
                            />
                          </div>
                          <div className="w-24 text-xs text-muted-foreground truncate" title={dist.option}>{dist.option}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!hasSharedDemographics() && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">See how different groups answered</p>
              <p className="text-sm text-muted-foreground">Share your demographics to unlock Men vs Women, Single vs Married breakdowns.</p>
            </div>
            <Button className="shrink-0 whitespace-nowrap" asChild>
              <Link href={`/onboarding?returnTo=/results/${id}`}>
                Unlock Splits
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 mb-12 flex justify-center">
        <Button size="lg" className="h-14 px-8 rounded-xl text-md" asChild>
          <Link href="/explore">
            Answer Another Question <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </div>

    </motion.div>
  );
}
