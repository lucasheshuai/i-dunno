import { useLocation, Link } from "wouter";
import { ArrowRight, BarChart3, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetTodayQuestion, getGetTodayQuestionQueryKey, useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isQuestionAnswered } from "@/lib/store";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: todayQuestion, isLoading: isQuestionLoading } = useGetTodayQuestion({
    query: {
      queryKey: getGetTodayQuestionQueryKey(),
    }
  });

  const { data: stats, isLoading: isStatsLoading } = useGetStats({
    query: {
      queryKey: getGetStatsQueryKey()
    }
  });

  return (
    <div className="flex flex-col gap-16 pb-12 w-full max-w-3xl mx-auto px-4 pt-12 md:pt-24">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          The Social Mirror
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-balance leading-tight">
          How well do you know <br />
          <span className="text-primary italic">what everyone else thinks?</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl text-balance">
          Answer thought-provoking questions, predict the majority, and uncover how different demographics really think.
        </p>
      </section>

      {/* Featured Question */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-semibold tracking-tight">Today's Question</h2>
        </div>
        
        {isQuestionLoading ? (
          <Skeleton className="w-full h-48 rounded-xl" />
        ) : todayQuestion ? (
          <Card 
            className="group cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
            onClick={() => setLocation(`/question/${todayQuestion.id}`)}
          >
            <CardContent className="p-6 md:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start gap-4">
                <div className="inline-flex px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">
                  {todayQuestion.category}
                </div>
                {isQuestionAnswered(todayQuestion.id) && (
                  <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    Answered
                  </div>
                )}
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-medium leading-snug">
                {todayQuestion.prompt}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">
                  {todayQuestion.responseCount.toLocaleString()} responses
                </span>
                <Button variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {isQuestionAnswered(todayQuestion.id) ? "View Results" : "Answer Now"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-8 border rounded-xl bg-muted/20 text-muted-foreground">
            No question featured today.
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-serif text-lg font-bold">1</div>
          <h3 className="font-semibold text-lg">You Answer</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Give your honest opinion on questions ranging from dating to career. It's completely anonymous.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-serif text-lg font-bold">2</div>
          <h3 className="font-semibold text-lg">You Predict</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Guess what the majority of other people chose. This is where your social intuition gets tested.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-lg font-bold">3</div>
          <h3 className="font-semibold text-lg">Discover</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            See the real breakdown. Compare how men vs. women voted, or how different age groups think.
          </p>
        </div>
      </section>

      {/* Stats */}
      {!isStatsLoading && stats && (
        <section className="flex flex-wrap justify-center gap-8 py-8 px-4 bg-secondary/50 rounded-2xl">
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-serif font-bold">{stats.totalResponses.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Insights Shared</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-serif font-bold">{stats.activeUsers.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Curious Minds</span>
          </div>
        </section>
      )}

    </div>
  );
}
