import { useState } from "react";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { getDemographics, hasSharedDemographics, clearSession } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Award, Target, Hash, Compass, Lock, Star, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, RotateCcw, Zap, EyeOff, ArrowRight, Users } from "lucide-react";
import { getArchetypeContent, resolvePopulationContext } from "@/lib/archetypes";

// ─── Milestone config ─────────────────────────────────────────────────────────

const MILESTONES = [
  {
    key: "social_reading_score",
    threshold: 3,
    title: "Your First Social Reading Score",
    icon: Star,
    accentColor: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    teaser: "Your crowd-reading accuracy, unlocked after 3 answers.",
  },
  {
    key: "perspective_profile",
    threshold: 5,
    title: "Your Perspective Profile",
    icon: Award,
    accentColor: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    borderColor: "border-purple-200 dark:border-purple-800",
    teaser: "A label that captures how you see the world, built from your answers.",
  },
  {
    key: "crowd_divergence",
    threshold: 8,
    title: "Where You Differ Most",
    icon: TrendingUp,
    accentColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    teaser: "The topic where your views diverge most from the majority.",
  },
  {
    key: "category_reads",
    threshold: 12,
    title: "Best & Worst Reads",
    icon: Target,
    accentColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    teaser: "Which category you read best — and which trips you up most.",
  },
  {
    key: "blind_spot",
    threshold: 15,
    title: "Your Blind Spot",
    icon: AlertCircle,
    accentColor: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    teaser: "Where your instincts about others most consistently miss.",
  },
] as const;

// ─── Milestone content renderers ──────────────────────────────────────────────

function SocialReadingScore({ accuracy }: { accuracy: number }) {
  const pct = Math.round(accuracy * 100);
  const label =
    pct >= 70 ? "Exceptionally accurate" :
    pct >= 55 ? "Above average" :
    pct >= 40 ? "About average" :
    "Contrarian instincts";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <span className="text-4xl font-serif font-bold">
          {pct}<span className="text-xl text-muted-foreground">%</span>
        </span>
        <span className="text-sm text-muted-foreground mb-1">prediction accuracy</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-yellow-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function PerspectiveProfile({
  label,
  description,
}: {
  label: string | null | undefined;
  description: string | null | undefined;
}) {
  if (!label) {
    return <p className="text-sm text-muted-foreground">Keep answering to shape your profile.</p>;
  }

  const content = getArchetypeContent(label);

  if (!content) {
    return (
      <div className="flex flex-col gap-2">
        <span className="inline-flex self-start px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-semibold text-sm">
          {label}
        </span>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
    );
  }

  const populationContext = resolvePopulationContext(content);

  return (
    <div className="flex flex-col gap-7">
      <p className="text-base italic text-foreground/80 leading-relaxed">
        {content.shortTagline}
      </p>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4 mt-0.5 shrink-0" />
        <span className="leading-relaxed">{populationContext}</span>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed">
        {content.plainEnglishMeaning}
      </p>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          How you likely got here
        </h4>
        <ul className="flex flex-col gap-2">
          {content.howYouLikelyGotHere.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
              <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Strengths
        </h4>
        <ul className="flex flex-col gap-2">
          {content.strengths.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
              <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Blind spots
        </h4>
        <ul className="flex flex-col gap-2">
          {content.blindSpots.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
              <EyeOff className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Why this matters
        </h4>
        <p className="text-sm text-foreground/75 leading-relaxed">
          {content.whyThisMatters}
        </p>
      </div>

      <div className="border-l-2 border-purple-300 dark:border-purple-700 pl-4">
        <p className="text-sm italic text-foreground/60 leading-relaxed">
          {content.reflectionPrompt}
        </p>
      </div>
    </div>
  );
}

function CrowdDivergence({ topic }: { topic: string | null | undefined }) {
  if (!topic) {
    return (
      <p className="text-sm text-muted-foreground">
        Answer more questions across topics to reveal where you diverge.
      </p>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
        <TrendingUp className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="font-semibold">{topic}</p>
        <p className="text-xs text-muted-foreground">Your views diverge most from the crowd here.</p>
      </div>
    </div>
  );
}

function CategoryReads({
  best,
  worst,
}: {
  best: string | null | undefined;
  worst: string | null | undefined;
}) {
  if (!best && !worst) {
    return (
      <p className="text-sm text-muted-foreground">
        Answer more questions across categories to compare your reads.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {best && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Best read</p>
            <p className="font-semibold text-sm">{best}</p>
          </div>
        </div>
      )}
      {worst && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Needs work</p>
            <p className="font-semibold text-sm">{worst}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BlindSpot({
  worst,
  topic,
  mostAlignedDemographic,
}: {
  worst: string | null | undefined;
  topic: string | null | undefined;
  mostAlignedDemographic: string | null | undefined;
}) {
  const subject = worst ?? topic;
  const hasContent = subject || mostAlignedDemographic;
  if (!hasContent) {
    return (
      <p className="text-sm text-muted-foreground">
        Keep answering to reveal your blind spot and most aligned group.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {subject && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Biggest blind spot</p>
            <p className="font-semibold text-sm">{subject}</p>
            <p className="text-xs text-muted-foreground">Your predictions here miss most often.</p>
          </div>
        </div>
      )}
      {mostAlignedDemographic && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Most aligned group</p>
            <p className="font-semibold text-sm">{mostAlignedDemographic}</p>
            <p className="text-xs text-muted-foreground">Your answers align most closely with this group.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Profile() {
  const [resetting, setResetting] = useState(false);
  const localDemographics = getDemographics();
  const demographicsShared = hasSharedDemographics();

  const handleReset = async () => {
    setResetting(true);
    await clearSession();
  };

  const { data: profile, isLoading } = useGetProfile({
    query: {
      queryKey: getGetProfileQueryKey(),
    },
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 pt-12 flex flex-col gap-8">
        <Skeleton className="w-24 h-24 rounded-full mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const unlockedSet = new Set(profile.milestonesUnlocked ?? []);
  const answeredCount = profile.answeredCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-10 w-full max-w-3xl mx-auto px-4 pt-8 pb-16"
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-xl">
          <Award className="w-9 h-9" />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Your Profile</h1>
          {profile.profileLabel ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
            >
              {profile.profileLabel}
            </motion.span>
          ) : profile.badge ? (
            <span className="px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              {profile.badge}
            </span>
          ) : null}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-secondary/30">
          <CardContent className="p-5 flex flex-col items-center text-center gap-2">
            <Hash className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-3xl font-serif font-bold">{answeredCount}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Answered
            </span>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-secondary/30">
          <CardContent className="p-5 flex flex-col items-center text-center gap-2">
            <Target className="w-5 h-5 text-primary mb-1" />
            <span className="text-3xl font-serif font-bold text-primary">
              {Math.round(profile.predictionAccuracy * 100)}%
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Accuracy
            </span>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-secondary/30 col-span-2 md:col-span-1">
          <CardContent className="p-5 flex flex-col items-center text-center gap-2">
            <Compass className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-xl font-serif font-bold mt-1 line-clamp-1">
              {profile.favoriteCategory || "None yet"}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Top Category
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Milestone cards */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
          Insight Unlocks
        </h2>

        {MILESTONES.map((milestone, idx) => {
          const isUnlocked = unlockedSet.has(milestone.key);
          const remaining = milestone.threshold - answeredCount;
          const Icon = milestone.icon;

          return (
            <motion.div
              key={milestone.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.07 }}
            >
              <Card
                className={`border transition-all ${
                  isUnlocked
                    ? `${milestone.bgColor} ${milestone.borderColor}`
                    : "bg-muted/20 border-muted/40 opacity-60"
                }`}
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          isUnlocked ? milestone.bgColor : "bg-muted"
                        }`}
                      >
                        {isUnlocked ? (
                          <Icon className={`w-4 h-4 ${milestone.accentColor}`} />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">{milestone.title}</h3>
                    </div>
                    {isUnlocked && (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${milestone.accentColor}`} />
                    )}
                  </div>

                  {isUnlocked ? (
                    <div className="pl-12">
                      {milestone.key === "social_reading_score" && (
                        <SocialReadingScore accuracy={profile.predictionAccuracy} />
                      )}
                      {milestone.key === "perspective_profile" && (
                        <PerspectiveProfile
                          label={profile.profileLabel}
                          description={profile.profileLabelDescription}
                        />
                      )}
                      {milestone.key === "crowd_divergence" && (
                        <CrowdDivergence topic={profile.topDisagreementTopic} />
                      )}
                      {milestone.key === "category_reads" && (
                        <CategoryReads
                          best={profile.bestReadCategory}
                          worst={profile.worstReadCategory}
                        />
                      )}
                      {milestone.key === "blind_spot" && (
                        <BlindSpot
                          worst={profile.worstReadCategory}
                          topic={profile.topDisagreementTopic}
                          mostAlignedDemographic={profile.mostAlignedDemographic}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="pl-12">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {milestone.teaser}
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground mt-1">
                        Answer {remaining} more to unlock →
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Demographics */}
      {demographicsShared && (
        <div className="flex flex-col gap-6">
          <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground border-t pt-6">
            Demographics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {localDemographics.ageRange && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Age
                </span>
                <span className="font-medium">{localDemographics.ageRange}</span>
              </div>
            )}
            {localDemographics.gender && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Gender
                </span>
                <span className="font-medium">{localDemographics.gender}</span>
              </div>
            )}
            {localDemographics.region && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Region
                </span>
                <span className="font-medium">{localDemographics.region}</span>
              </div>
            )}
            {localDemographics.relationshipStatus && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Relationship
                </span>
                <span className="font-medium">{localDemographics.relationshipStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-border/40 flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          On a shared device? Starting fresh clears your session and all local data so the next person starts clean.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={resetting}
          className="text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          {resetting ? "Clearing…" : "Start Fresh"}
        </Button>
      </div>
    </motion.div>
  );
}
