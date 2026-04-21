import { useParams, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { useGetQuestion, getGetQuestionQueryKey, useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { setFlowAnswer, isQuestionAnswered, getResponse, getSessionId } from "@/lib/store";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function QuestionPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const sessionId = getSessionId();

  const { data: question, isLoading } = useGetQuestion(id || "", {
    query: {
      enabled: !!id,
      queryKey: getGetQuestionQueryKey(id || "")
    }
  });

  const { data: profile } = useGetProfile(
    { sessionId },
    { query: { queryKey: getGetProfileQueryKey({ sessionId }) } }
  );

  const serverAnsweredIds = useMemo(
    () => new Set(profile?.answeredQuestionIds ?? []),
    [profile?.answeredQuestionIds]
  );

  const alreadyAnswered = !!id && (isQuestionAnswered(id) || serverAnsweredIds.has(id));
  const previousResponse = id ? getResponse(id) : null;

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 pt-12 flex flex-col gap-8">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-12 w-full md:w-3/4" />
        <div className="flex flex-col gap-3 mt-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!question) return null;

  if (alreadyAnswered) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col gap-8 w-full max-w-2xl mx-auto px-4 pt-8 md:pt-16"
      >
        <div className="flex flex-col gap-4">
          <div className="inline-flex px-3 py-1 rounded-md bg-secondary w-max text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
            {question.category}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-medium leading-tight text-balance">
            {question.prompt}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            You've already answered this question.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {question.options.map((option) => {
            const isYourAnswer = previousResponse ? option === previousResponse.answer : false;
            return (
              <div
                key={option}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                  isYourAnswer
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-foreground"
                    : "border-transparent bg-secondary/30 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isYourAnswer ? "border-green-500 bg-green-500" : "border-muted-foreground/20"
                  }`}>
                    {isYourAnswer && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-lg font-medium ${isYourAnswer ? "" : "opacity-50"}`}>
                    {option}
                  </span>
                  {isYourAnswer && (
                    <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide shrink-0">
                      Your answer
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-8 rounded-xl"
            onClick={() => setLocation("/")}
          >
            Back to home
          </Button>
          <Button
            size="lg"
            className="h-14 px-10 rounded-xl"
            onClick={() => id && setLocation(`/results/${id}`)}
          >
            View results
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  const handleContinue = () => {
    if (selectedOption && id) {
      setFlowAnswer(id, selectedOption);
      setLocation(`/predict/${id}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-8 w-full max-w-2xl mx-auto px-4 pt-8 md:pt-16"
    >
      <div className="flex flex-col gap-4">
        <div className="inline-flex px-3 py-1 rounded-md bg-secondary w-max text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
          {question.category}
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-medium leading-tight text-balance">
          {question.prompt}
        </h1>
        <p className="text-muted-foreground text-sm font-medium">What is your honest answer?</p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          return (
            <motion.div key={option} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <button
                onClick={() => setSelectedOption(option)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? "border-primary bg-primary/5 text-foreground shadow-sm" 
                    : "border-transparent bg-secondary/50 hover:bg-secondary text-foreground"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "border-primary" : "border-muted-foreground/30"
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-lg font-medium">{option}</span>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          size="lg" 
          disabled={!selectedOption} 
          onClick={handleContinue}
          className="w-full sm:w-auto px-12 text-md h-14 rounded-xl"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
