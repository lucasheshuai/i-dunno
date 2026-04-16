import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListQuestions, getListQuestionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isQuestionAnswered } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "Dating", "Marriage", "Gender", "Money", "Values", "Career"];

export default function Explore() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const { data: questions, isLoading } = useListQuestions(
    activeCategory === "All" ? undefined : { category: activeCategory },
    {
      query: {
        queryKey: getListQuestionsQueryKey(activeCategory === "All" ? undefined : { category: activeCategory })
      }
    }
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto px-4 pt-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Explore Bank</h1>
        <p className="text-muted-foreground">Browse our entire collection of questions.</p>
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:px-0 md:mx-0 hide-scrollbar">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="h-10 w-max inline-flex">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat} value={cat} className="px-4">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))
        ) : questions?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
            No questions found for this category.
          </div>
        ) : (
          questions?.map((q, index) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="group cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                onClick={() => setLocation(`/question/${q.id}`)}
              >
                <CardContent className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {q.category}
                      </span>
                      {isQuestionAnswered(q.id) && (
                        <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-medium">
                          Answered
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-medium leading-tight">
                      {q.prompt}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                    <span>{q.responseCount.toLocaleString()} responses</span>
                    <div className="w-8 h-8 rounded-full bg-secondary/50 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
