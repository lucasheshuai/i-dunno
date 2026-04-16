import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { getSessionId, getDemographics, hasSharedDemographics } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Award, Target, Hash, Compass } from "lucide-react";

export default function Profile() {
  const sessionId = getSessionId();
  const localDemographics = getDemographics();
  const demographicsShared = hasSharedDemographics();
  
  const { data: profile, isLoading } = useGetProfile({ sessionId }, {
    query: {
      enabled: !!sessionId,
      queryKey: getGetProfileQueryKey({ sessionId })
    }
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 pt-12 flex flex-col gap-8">
        <Skeleton className="w-32 h-32 rounded-full mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-10 w-full max-w-3xl mx-auto px-4 pt-8 md:pt-16"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-xl">
          <Award className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Your Profile</h1>
          {profile.badge && (
            <div className="mt-3 inline-flex px-4 py-1.5 rounded-full bg-secondary text-foreground text-sm font-medium">
              {profile.badge}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <Card className="border-none shadow-sm bg-secondary/30">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <Hash className="w-6 h-6 text-muted-foreground mb-1" />
            <span className="text-3xl font-serif font-bold">{profile.answeredCount}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Answered</span>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-secondary/30">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <Target className="w-6 h-6 text-primary mb-1" />
            <span className="text-3xl font-serif font-bold text-primary">{Math.round(profile.predictionAccuracy * 100)}%</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Accuracy</span>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-secondary/30 col-span-2">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <Compass className="w-6 h-6 text-muted-foreground mb-1" />
            <span className="text-2xl font-serif font-bold mt-1 line-clamp-1">{profile.favoriteCategory || "None yet"}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Category</span>
          </CardContent>
        </Card>
      </div>

      {demographicsShared && (
        <div className="flex flex-col gap-6 mt-8">
          <h2 className="text-xl font-serif font-bold border-b pb-4">Demographics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Age</span>
              <span className="text-lg font-medium">{localDemographics.ageRange || "Not provided"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Gender</span>
              <span className="text-lg font-medium">{localDemographics.gender || "Not provided"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Region</span>
              <span className="text-lg font-medium">{localDemographics.region || "Not provided"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Relationship</span>
              <span className="text-lg font-medium">{localDemographics.relationshipStatus || "Not provided"}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
