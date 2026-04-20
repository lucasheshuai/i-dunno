import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Zap, Users, Sparkles, TrendingUp } from "lucide-react";

interface DistributionItem {
  option: string;
  percentage: number;
  count: number;
}

interface SegmentResult {
  groupName: string;
  distribution: DistributionItem[];
}

// ─── Prediction Score Module ──────────────────────────────────────────────────

interface PredictionScoreProps {
  userAnswer: string;
  userPrediction: string;
  majorityAnswer: string;
  majorityPct: number;
  userAnswerPct: number;
}

export function PredictionScoreModule({
  userAnswer,
  userPrediction,
  majorityAnswer,
  majorityPct,
  userAnswerPct,
}: PredictionScoreProps) {
  const correct = userPrediction === majorityAnswer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card
        className={`overflow-hidden border-2 ${correct ? "border-green-500/40 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}`}
      >
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {correct ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <span className="font-bold text-base">
              {correct ? "You read the crowd" : "The crowd surprised you"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {correct ? (
              <>
                You predicted <strong className="text-foreground">"{majorityAnswer}"</strong> — and{" "}
                <strong className="text-foreground">{majorityPct.toFixed(0)}%</strong> of people agreed.
              </>
            ) : (
              <>
                You predicted <strong className="text-foreground">"{userPrediction}"</strong>, but the
                majority chose <strong className="text-foreground">"{majorityAnswer}"</strong> ({majorityPct.toFixed(0)}%).
              </>
            )}
          </p>
          {userAnswer !== userPrediction && (
            <div className="mt-1 text-xs text-muted-foreground bg-secondary/60 rounded-lg px-3 py-2">
              Your answer: <strong className="text-foreground">"{userAnswer}"</strong> — chosen by{" "}
              {userAnswerPct.toFixed(0)}% of people
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Crowd Shock Module ───────────────────────────────────────────────────────

interface CrowdShockProps {
  userAnswer: string;
  userAnswerPct: number;
}

export function CrowdShockModule({ userAnswer, userAnswerPct }: CrowdShockProps) {
  const isRareMinority = userAnswerPct < 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="overflow-hidden border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary shrink-0" />
            <span className="font-bold text-base">
              {isRareMinority ? "You're in rare company" : "Minority view"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Only <strong className="text-foreground text-lg">{userAnswerPct.toFixed(0)}%</strong> of people chose{" "}
            <strong className="text-foreground">"{userAnswer}"</strong>.{" "}
            {isRareMinority
              ? "That puts you in a very small group — with an unusual perspective."
              : "Most people saw this differently than you."}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Demographic Split Module ─────────────────────────────────────────────────

interface DemographicSplitProps {
  segments: SegmentResult[];
}

function getSharpestSplit(segments: SegmentResult[]): { segment: SegmentResult; spread: number } | null {
  let sharpest: { segment: SegmentResult; spread: number } | null = null;

  for (const segment of segments) {
    if (segment.distribution.length < 2) continue;
    const sorted = [...segment.distribution].sort((a, b) => b.percentage - a.percentage);
    const spread = sorted[0].percentage - sorted[1].percentage;
    if (!sharpest || spread > sharpest.spread) {
      sharpest = { segment, spread };
    }
  }
  return sharpest;
}

export function DemographicSplitModule({ segments }: DemographicSplitProps) {
  const sharpest = getSharpestSplit(segments);
  if (!sharpest) return null;

  const { segment } = sharpest;
  const sorted = [...segment.distribution].sort((a, b) => b.percentage - a.percentage);
  const top = sorted[0];
  const second = sorted[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="overflow-hidden border-2 border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="font-bold text-base">Groups split on this one</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{segment.groupName}</strong> diverged sharply:
          </p>
          <div className="flex flex-col gap-2 mt-1">
            {[top, second].filter(Boolean).map((d) => (
              <div key={d.option} className="flex items-center gap-3">
                <div className="w-10 text-xs font-bold text-right shrink-0 text-foreground">
                  {d.percentage.toFixed(0)}%
                </div>
                <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500/60"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <div className="w-28 text-xs text-muted-foreground truncate" title={d.option}>
                  {d.option}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function hasMeaningfulSplit(segments: SegmentResult[], threshold = 20): boolean {
  const sharpest = getSharpestSplit(segments);
  return !!sharpest && sharpest.spread >= threshold;
}

// ─── Profile Builder Module ───────────────────────────────────────────────────

interface ProfileBuilderProps {
  profileSignals: string[];
  dominantLabel: string | null;
  answerCount: number;
}

const SIGNAL_FRIENDLY: Record<string, string> = {
  romantic: 'romantic',
  pragmatic: 'pragmatic',
  traditionalist: 'traditional',
  progressive: 'progressive',
  security_focused: 'security-oriented',
  emotionally_aware: 'emotionally aware',
  independent: 'independent',
};

export function ProfileBuilderModule({ profileSignals, dominantLabel, answerCount }: ProfileBuilderProps) {
  const friendlySignals = profileSignals
    .map(s => SIGNAL_FRIENDLY[s] ?? s)
    .slice(0, 2)
    .join(' and ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card className="overflow-hidden border-2 border-violet-500/30 bg-violet-500/5">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600 shrink-0" />
            <span className="font-bold text-base">Your profile is taking shape</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This answer adds a <strong className="text-foreground">{friendlySignals}</strong> signal
            to your profile.{" "}
            {dominantLabel ? (
              <>
                Based on your {answerCount} answers, you're trending{" "}
                <strong className="text-foreground">{dominantLabel}</strong>.
              </>
            ) : (
              "Keep answering to reveal your relationship profile."
            )}
          </p>
          {dominantLabel && (
            <div className="flex items-center gap-2 mt-1 bg-violet-500/10 rounded-lg px-3 py-2">
              <TrendingUp className="w-4 h-4 text-violet-600 shrink-0" />
              <span className="text-sm font-semibold text-violet-800 dark:text-violet-300">
                {dominantLabel}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
