import { useLocation } from "wouter";
import { useState } from "react";
import { useUpdateDemographics } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { setOnboarded, setDemographicsShared, saveDemographics } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "intro" | "age" | "gender" | "region" | "relationship";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const returnTo = new URLSearchParams(window.location.search).get("returnTo") || "/explore";
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>("intro");
  
  const [demographics, setDemographics] = useState({
    ageRange: "",
    gender: "",
    region: "",
    relationshipStatus: ""
  });

  const updateMutation = useUpdateDemographics();

  const handleSkip = () => {
    setOnboarded();
    setLocation(returnTo);
  };

  const handleFinish = (finalRelationship: string) => {
    const data = { ...demographics, relationshipStatus: finalRelationship };
    saveDemographics(data);
    updateMutation.mutate({
      data: {
        ageRange: data.ageRange || null,
        gender: data.gender || null,
        region: data.region || null,
        relationshipStatus: data.relationshipStatus || null,
      }
    }, {
      onSuccess: () => {
        setOnboarded();
        setDemographicsShared();
        setLocation(returnTo);
      },
      onError: () => {
        toast({
          title: "Error saving profile",
          variant: "destructive"
        });
        setOnboarded();
        setDemographicsShared();
        setLocation(returnTo);
      }
    });
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-12 md:pt-24 min-h-[70vh]">
      <AnimatePresence mode="wait">
        
        {step === "intro" && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6 text-center items-center"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h1 className="text-3xl font-serif font-bold">You've unlocked results</h1>
            <p className="text-muted-foreground text-lg max-w-md">
              To see how different groups answered (Men vs Women, Single vs Married), we need to know a bit about you.
            </p>
            <div className="flex flex-col gap-3 w-full mt-8">
              <Button size="lg" className="h-14 text-md rounded-xl" onClick={() => setStep("age")}>
                Complete Profile
              </Button>
              <Button variant="ghost" className="text-muted-foreground" onClick={handleSkip}>
                Skip for now, just show me basic results
              </Button>
            </div>
          </motion.div>
        )}

        {step === "age" && (
          <motion.div 
            key="age"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 w-full"
          >
            <h2 className="text-3xl font-serif font-medium">How old are you?</h2>
            <div className="grid grid-cols-2 gap-3">
              {["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"].map(opt => (
                <Button 
                  key={opt} 
                  variant={demographics.ageRange === opt ? "default" : "outline"}
                  className="h-14 text-md rounded-xl"
                  onClick={() => {
                    setDemographics(p => ({ ...p, ageRange: opt }));
                    setTimeout(() => setStep("gender"), 300);
                  }}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "gender" && (
          <motion.div 
            key="gender"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 w-full"
          >
            <h2 className="text-3xl font-serif font-medium">What is your gender?</h2>
            <div className="grid grid-cols-1 gap-3">
              {["Male", "Female", "Non-binary", "Other", "Prefer not to say"].map(opt => (
                <Button 
                  key={opt} 
                  variant={demographics.gender === opt ? "default" : "outline"}
                  className="h-14 text-md rounded-xl"
                  onClick={() => {
                    setDemographics(p => ({ ...p, gender: opt }));
                    setTimeout(() => setStep("region"), 300);
                  }}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "region" && (
          <motion.div 
            key="region"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 w-full"
          >
            <h2 className="text-3xl font-serif font-medium">Where are you from?</h2>
            <div className="grid grid-cols-1 gap-3">
              {["North America", "Europe", "Asia", "Latin America", "Middle East & Africa", "Oceania"].map(opt => (
                <Button 
                  key={opt} 
                  variant={demographics.region === opt ? "default" : "outline"}
                  className="h-14 text-md rounded-xl"
                  onClick={() => {
                    setDemographics(p => ({ ...p, region: opt }));
                    setTimeout(() => setStep("relationship"), 300);
                  }}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "relationship" && (
          <motion.div 
            key="relationship"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 w-full"
          >
            <h2 className="text-3xl font-serif font-medium">Relationship status?</h2>
            <div className="grid grid-cols-1 gap-3">
              {["Single", "In a relationship", "Married", "Complicated", "Prefer not to say"].map(opt => (
                <Button 
                  key={opt} 
                  variant={demographics.relationshipStatus === opt ? "default" : "outline"}
                  className="h-14 text-md rounded-xl"
                  onClick={() => {
                    setDemographics(p => ({ ...p, relationshipStatus: opt }));
                  }}
                >
                  {opt}
                </Button>
              ))}
            </div>
            
            <Button 
              size="lg" 
              className="mt-8 h-14 rounded-xl" 
              disabled={!demographics.relationshipStatus || updateMutation.isPending}
              onClick={() => handleFinish(demographics.relationshipStatus)}
            >
              {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "See Results"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
