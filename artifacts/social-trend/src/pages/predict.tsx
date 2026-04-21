import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useGetQuestion, getGetQuestionQueryKey, useSubmitResponse } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getFlowState, hasOnboarded, markQuestionAnswered, setFlowPrediction } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PredictPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: question, isLoading } = useGetQuestion(id || "", {
    query: {
      enabled: !!id,
      queryKey: getGetQuestionQueryKey(id || "")
    }
  });

  const submitMutation = useSubmitResponse();
  const flowState = getFlowState(id || "");

  // If they somehow skipped the question step, redirect back
  useEffect(() => {
    if (!isLoading && question && !flowState.answer) {
      setLocation(`/question/${id}`);
    }
  }, [isLoading, question, flowState.answer, id, setLocation]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 pt-12 flex flex-col gap-8">
        <Skeleton className="h-12 w-full md:w-3/4" />
        <div className="flex flex-col gap-3 mt-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!question || !flowState.answer) return null;

  const handleSubmit = () => {
    if (selectedOption && id && flowState.answer) {
      setFlowPrediction(id, selectedOption);
      submitMutation.mutate({
        data: {
          questionId: id,
          answer: flowState.answer,
          predictedMajority: selectedOption
        }
      }, {
        onSuccess: () => {
          markQuestionAnswered(id);
          if (!hasOnboarded()) {
            setLocation(`/onboarding?returnTo=/results/${id}`);
          } else {
            setLocation(`/results/${id}`);
          }
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to submit response. Please try again.",
            variant: "destructive"
          });
        }
      });
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
        <h1 className="text-3xl md:text-4xl font-serif font-medium leading-tight text-balance text-primary">
          What do you think <br/>most people chose?
        </h1>
        <p className="text-muted-foreground text-sm font-medium">Predict the majority answer.</p>
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
          disabled={!selectedOption || submitMutation.isPending} 
          onClick={handleSubmit}
          className="w-full sm:w-auto px-12 text-md h-14 rounded-xl"
        >
          {submitMutation.isPending ? (
             <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
          ) : (
            "Lock in Prediction"
          )}
        </Button>
      </div>
    </motion.div>
  );
}
