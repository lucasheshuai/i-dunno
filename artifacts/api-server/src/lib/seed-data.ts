export interface TopicCluster {
  id: string;
  title: string;
  intro: string;
  outro: string;
  questionIds: string[];
}

interface Question {
  id: string;
  category: "Dating" | "Marriage" | "Gender" | "Money" | "Values" | "Career";
  type: "single_choice" | "slider";
  prompt: string;
  options: string[];
  status: "active" | "draft";
  responseCount: number;
  topicClusterId: string;
  clusterOrder: number;
  teaserText: string;
  followUpQuestionIds: string[];
  rewardTags: string[];
  profileSignals: string[];
}

interface DistributionItem {
  option: string;
  percentage: number;
  count: number;
}

interface SegmentResult {
  groupName: string;
  distribution: DistributionItem[];
}

interface AggregatedResult {
  questionId: string;
  totalResponses: number;
  majorityAnswer: string;
  distribution: DistributionItem[];
  segments: SegmentResult[];
}

export const clusters: TopicCluster[] = [
  {
    id: "c1",
    title: "Attraction & Dating Signals",
    intro:
      "How we approach dating reveals what we really believe — not what we say we believe. These questions expose the unspoken rules people actually follow when they're sizing someone up.",
    outro:
      "You've mapped the hidden logic behind modern attraction. The crowd agrees more than you'd expect — but there are real fault lines below the surface.",
    questionIds: ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"],
  },
  {
    id: "c2",
    title: "Commitment & Marriage",
    intro:
      "Marriage is where society's hidden rules get most exposed — who gets judged, what's expected, and what people won't say out loud about love lasting.",
    outro:
      "Commitment questions consistently split along lines people don't expect. The crowd's answers on what makes love last often contradict what people say in conversation.",
    questionIds: ["q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18"],
  },
  {
    id: "c3",
    title: "Gender Pressure",
    intro:
      "Gender expectations in relationships are shifting — but not always in the direction people assume. Everyone claims to dislike double standards, but fewer recognize the ones they hold.",
    outro:
      "Gender pressure is more complicated than any simple narrative. Double standards persist because they feel like common sense to the people who hold them. Did the crowd surprise you?",
    questionIds: ["q19", "q20", "q21", "q22", "q23", "q24", "q25", "q26", "q27"],
  },
  {
    id: "c4",
    title: "Money & Compatibility",
    intro:
      "Money is the topic most couples avoid — until it's unavoidable. How people handle money alone says more about how they'll handle it together.",
    outro:
      "Financial compatibility is one of the top predictors of relationship outcomes. The crowd's answers reveal what most people won't say directly about money and trust.",
    questionIds: ["q28", "q29", "q30", "q31", "q32", "q33", "q34", "q35"],
  },
  {
    id: "c5",
    title: "Values & Connection",
    intro:
      "What people claim to value in relationships and what actually drives their decisions are often different things. These questions test that gap.",
    outro:
      "Your values profile is coming into focus. The gap between what we say matters and what we actually choose is one of the most revealing things about us.",
    questionIds: ["q36", "q37", "q38", "q39", "q40"],
  },
  {
    id: "c6",
    title: "Modern Love & Regret",
    intro:
      "What we regret, what we can no longer accept, and where modern life creates hidden relationship costs. The questions that cut closest to home.",
    outro:
      "Regret and modern expectations around love reveal something deep about what people believe they deserve — and what they're afraid to ask for.",
    questionIds: ["q41", "q42", "q43", "q49", "q50"],
  },
  {
    id: "c7",
    title: "Career Tradeoffs",
    intro:
      "Career ambition and love are in a quiet conflict most people refuse to name directly. These questions put the conflict on the table.",
    outro:
      "You've completed all the insight clusters. Career questions tend to reveal the most practical calculations in relationships — and who people really expect to sacrifice.",
    questionIds: ["q44", "q45", "q46", "q47", "q48"],
  },
];

export const questions: Question[] = [
  // ─── Cluster 1: Dating Standards ────────────────────────────────────────────
  {
    id: "q1",
    category: "Dating",
    type: "single_choice",
    prompt: "In modern dating, who is usually expected to make the first move?",
    options: [
      "Men",
      "Women",
      "It feels more equal now",
      "It depends on who's more interested",
    ],
    status: "active",
    responseCount: 6840,
    topicClusterId: "c1",
    clusterOrder: 1,
    teaserText:
      "Next: does physical attraction or emotional connection matter more first?",
    followUpQuestionIds: ["q2", "q3"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["traditionalist", "progressive"],
  },
  {
    id: "q2",
    category: "Dating",
    type: "single_choice",
    prompt: "In early dating, what matters more first?",
    options: [
      "Physical attraction",
      "Emotional connection",
      "Shared lifestyle and values",
      "It's genuinely a mix of all three",
    ],
    status: "active",
    responseCount: 5210,
    topicClusterId: "c1",
    clusterOrder: 2,
    teaserText:
      "Next: who gets judged more harshly for having too high standards?",
    followUpQuestionIds: ["q3", "q4"],
    rewardTags: ["prediction_score", "demographic_split", "crowd_shock"],
    profileSignals: ["romantic", "pragmatic"],
  },
  {
    id: "q3",
    category: "Dating",
    type: "single_choice",
    prompt:
      "Who is more likely to be judged for being 'too picky' in dating?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — standards feel more personal now",
    ],
    status: "active",
    responseCount: 4760,
    topicClusterId: "c1",
    clusterOrder: 3,
    teaserText:
      "Next: the one thing that causes the most confusion in modern dating",
    followUpQuestionIds: ["q4", "q5"],
    rewardTags: ["prediction_score", "demographic_split", "crowd_shock"],
    profileSignals: ["traditionalist", "progressive"],
  },
  {
    id: "q4",
    category: "Dating",
    type: "single_choice",
    prompt: "In dating today, what causes more confusion?",
    options: [
      "Mixed signals",
      "Different relationship intentions",
      "Timing and life stage mismatch",
      "Unclear expectations about exclusivity",
    ],
    status: "active",
    responseCount: 7130,
    topicClusterId: "c1",
    clusterOrder: 4,
    teaserText: "Next: who actually feels more pressure to reply quickly?",
    followUpQuestionIds: ["q5"],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "emotionally_aware"],
  },
  {
    id: "q5",
    category: "Dating",
    type: "single_choice",
    prompt:
      "Who is more expected to reply quickly in the early stage of dating?",
    options: [
      "Men",
      "Women",
      "Neither side especially",
      "Both feel it but neither admits it",
    ],
    status: "active",
    responseCount: 3950,
    topicClusterId: "c1",
    clusterOrder: 5,
    teaserText: "Next: what actually makes or breaks a first date?",
    followUpQuestionIds: ["q6"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["progressive", "traditionalist"],
  },

  // ─── Cluster 1 continued: What Drives Attraction ────────────────────────────
  {
    id: "q6",
    category: "Dating",
    type: "single_choice",
    prompt: "What matters more in whether a first date goes well?",
    options: [
      "Conversation chemistry",
      "Physical attraction",
      "Effort and manners",
      "Mutual comfort and lack of awkwardness",
    ],
    status: "active",
    responseCount: 5880,
    topicClusterId: "c1",
    clusterOrder: 6,
    teaserText: "Next: who is under more pressure to seem interesting?",
    followUpQuestionIds: ["q7", "q8"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["romantic", "emotionally_aware", "pragmatic"],
  },
  {
    id: "q7",
    category: "Dating",
    type: "single_choice",
    prompt:
      "In your view, who is under more pressure to seem interesting in dating?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Whoever seems more interested",
    ],
    status: "active",
    responseCount: 4410,
    topicClusterId: "c1",
    clusterOrder: 7,
    teaserText: "Next: what do people value more than they openly admit?",
    followUpQuestionIds: ["q8", "q9"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["traditionalist", "progressive"],
  },
  {
    id: "q8",
    category: "Dating",
    type: "single_choice",
    prompt: "In modern dating, which matters more than people openly admit?",
    options: [
      "Looks",
      "Income and status",
      "Emotional maturity",
      "Lifestyle fit and day-to-day compatibility",
    ],
    status: "active",
    responseCount: 6520,
    topicClusterId: "c1",
    clusterOrder: 8,
    teaserText: "Next: who is more likely to lose interest when things feel too easy?",
    followUpQuestionIds: ["q9"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["pragmatic", "security_focused"],
  },
  {
    id: "q9",
    category: "Dating",
    type: "single_choice",
    prompt:
      "Who is more likely to lose interest when things feel too easy too early?",
    options: [
      "Men",
      "Women",
      "It depends more on the person",
      "Neither — it's more about attachment style than gender",
    ],
    status: "active",
    responseCount: 4090,
    topicClusterId: "c1",
    clusterOrder: 9,
    teaserText:
      "Next: a question about marriage where men and women disagreed most",
    followUpQuestionIds: ["q10"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["pragmatic", "romantic"],
  },

  // ─── Cluster 3: Marriage & Status ───────────────────────────────────────────
  {
    id: "q10",
    category: "Marriage",
    type: "single_choice",
    prompt:
      "In the marriages you've seen recently, what pattern feels most common?",
    options: [
      "The man has stronger overall conditions",
      "The woman has stronger overall conditions",
      "They are roughly matched",
      "Hard to generalize — every couple is different",
    ],
    status: "active",
    responseCount: 5670,
    topicClusterId: "c2",
    clusterOrder: 1,
    teaserText:
      "Next: who faces more pressure to be financially established before marriage?",
    followUpQuestionIds: ["q11", "q12"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["traditionalist", "progressive"],
  },
  {
    id: "q11",
    category: "Marriage",
    type: "single_choice",
    prompt:
      "Who faces more pressure to be financially established before marriage?",
    options: [
      "Men",
      "Women",
      "About equally",
      "No one — fewer people see it as a requirement",
    ],
    status: "active",
    responseCount: 6180,
    topicClusterId: "c2",
    clusterOrder: 2,
    teaserText:
      "Next: what do people actually judge when deciding if a marriage is a good match?",
    followUpQuestionIds: ["q12", "q13"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["traditionalist", "pragmatic"],
  },
  {
    id: "q12",
    category: "Marriage",
    type: "single_choice",
    prompt:
      "What matters more in how people judge whether a marriage is a 'good match'?",
    options: [
      "Income and financial stability",
      "Education and background",
      "Personality and compatibility",
      "Life stage and readiness",
    ],
    status: "active",
    responseCount: 4830,
    topicClusterId: "c2",
    clusterOrder: 3,
    teaserText:
      "Next: the source of most long-term tension in marriage today",
    followUpQuestionIds: ["q13", "q14"],
    rewardTags: ["prediction_score"],
    profileSignals: ["romantic", "pragmatic", "security_focused"],
  },
  {
    id: "q13",
    category: "Marriage",
    type: "single_choice",
    prompt: "In marriage today, what creates more long-term tension?",
    options: [
      "Money",
      "Communication",
      "Division of responsibility",
      "Different long-term visions",
    ],
    status: "active",
    responseCount: 7290,
    topicClusterId: "c2",
    clusterOrder: 4,
    teaserText: "Next: who is more judged for marrying down?",
    followUpQuestionIds: ["q14"],
    rewardTags: ["prediction_score"],
    profileSignals: ["emotionally_aware", "pragmatic"],
  },
  {
    id: "q14",
    category: "Marriage",
    type: "single_choice",
    prompt: "Who is more likely to be judged for marrying 'down'?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — the concept feels outdated",
    ],
    status: "active",
    responseCount: 3870,
    topicClusterId: "c2",
    clusterOrder: 5,
    teaserText:
      "Next: what the crowd says matters most for a stable marriage",
    followUpQuestionIds: ["q15"],
    rewardTags: ["prediction_score", "demographic_split", "crowd_shock"],
    profileSignals: ["traditionalist", "progressive"],
  },

  // ─── Cluster 4: What Makes Love Last ────────────────────────────────────────
  {
    id: "q15",
    category: "Marriage",
    type: "single_choice",
    prompt: "In your view, what matters most for a stable marriage today?",
    options: [
      "Emotional trust",
      "Financial stability",
      "Shared values and life goals",
      "Mutual respect and personal freedom",
    ],
    status: "active",
    responseCount: 8410,
    topicClusterId: "c2",
    clusterOrder: 6,
    teaserText:
      "Next: are young adults becoming more practical or more romantic about marriage?",
    followUpQuestionIds: ["q16", "q17"],
    rewardTags: ["prediction_score"],
    profileSignals: ["romantic", "security_focused", "pragmatic"],
  },
  {
    id: "q16",
    category: "Marriage",
    type: "single_choice",
    prompt:
      "Are young adults becoming more practical or more romantic about marriage?",
    options: [
      "More practical",
      "More romantic",
      "Not much has changed",
      "More cynical — many are avoiding it entirely",
    ],
    status: "active",
    responseCount: 5540,
    topicClusterId: "c2",
    clusterOrder: 7,
    teaserText: "Next: what is most likely to delay marriage today?",
    followUpQuestionIds: ["q17", "q18"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["pragmatic", "romantic"],
  },
  {
    id: "q17",
    category: "Marriage",
    type: "single_choice",
    prompt: "What is more likely to delay marriage today?",
    options: [
      "Career uncertainty",
      "High standards in partner selection",
      "Financial pressure",
      "Lack of urgency — it no longer feels necessary",
    ],
    status: "active",
    responseCount: 6750,
    topicClusterId: "c2",
    clusterOrder: 8,
    teaserText:
      "Next: who is expected to compromise more after getting married?",
    followUpQuestionIds: ["q18"],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "security_focused"],
  },
  {
    id: "q18",
    category: "Marriage",
    type: "single_choice",
    prompt:
      "Who is more likely to be expected to compromise after marriage?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — compromise is avoided more than before",
    ],
    status: "active",
    responseCount: 4320,
    topicClusterId: "c2",
    clusterOrder: 9,
    teaserText:
      "Next: who is expected to provide more emotional support in relationships?",
    followUpQuestionIds: ["q19"],
    rewardTags: ["prediction_score", "demographic_split", "crowd_shock"],
    profileSignals: ["traditionalist", "progressive"],
  },

  // ─── Cluster 5: Gender Expectations ─────────────────────────────────────────
  {
    id: "q19",
    category: "Gender",
    type: "single_choice",
    prompt:
      "In relationships today, who is expected to provide more emotional support?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — emotional support feels optional now",
    ],
    status: "active",
    responseCount: 5960,
    topicClusterId: "c3",
    clusterOrder: 1,
    teaserText:
      "Next: who gets judged more harshly for being too ambitious?",
    followUpQuestionIds: ["q20", "q21"],
    rewardTags: ["prediction_score", "demographic_split", "crowd_shock"],
    profileSignals: ["traditionalist", "progressive", "emotionally_aware"],
  },
  {
    id: "q20",
    category: "Gender",
    type: "single_choice",
    prompt:
      "Who is judged more harshly for being 'too ambitious' in a relationship?",
    options: [
      "Men",
      "Women",
      "Neither side clearly",
      "Both are equally judged depending on the context",
    ],
    status: "active",
    responseCount: 4580,
    topicClusterId: "c3",
    clusterOrder: 2,
    teaserText:
      "Next: who is more socially allowed to prioritize career over relationships?",
    followUpQuestionIds: ["q21", "q22"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["progressive", "traditionalist"],
  },
  {
    id: "q21",
    category: "Gender",
    type: "single_choice",
    prompt:
      "Who is more socially allowed to prioritize career over relationships?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — ambition is celebrated regardless",
    ],
    status: "active",
    responseCount: 5110,
    topicClusterId: "c3",
    clusterOrder: 3,
    teaserText:
      "Next: whose insecurity is more socially tolerated in modern relationships?",
    followUpQuestionIds: ["q22"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["independent", "traditionalist"],
  },
  {
    id: "q22",
    category: "Gender",
    type: "single_choice",
    prompt:
      "In modern relationships, whose insecurity is more socially tolerated?",
    options: [
      "Men's",
      "Women's",
      "About equally",
      "Neither — insecurity isn't really tolerated openly",
    ],
    status: "active",
    responseCount: 3720,
    topicClusterId: "c3",
    clusterOrder: 4,
    teaserText: "Next: who is under more pressure to 'have it all' today?",
    followUpQuestionIds: ["q23"],
    rewardTags: ["prediction_score", "demographic_split", "crowd_shock"],
    profileSignals: ["emotionally_aware", "pragmatic"],
  },

  // ─── Cluster 6: Double Standards ─────────────────────────────────────────────
  {
    id: "q23",
    category: "Gender",
    type: "single_choice",
    prompt: "Who is under more pressure to 'have it all' today?",
    options: [
      "Men",
      "Women",
      "About equally",
      "It affects both but in very different ways",
    ],
    status: "active",
    responseCount: 6030,
    topicClusterId: "c3",
    clusterOrder: 5,
    teaserText:
      "Next: who gets judged more harshly for aging in the dating market?",
    followUpQuestionIds: ["q24", "q25"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["progressive", "independent"],
  },
  {
    id: "q24",
    category: "Gender",
    type: "single_choice",
    prompt:
      "In your view, who is more judged for aging in the dating market?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — attitudes toward aging are shifting",
    ],
    status: "active",
    responseCount: 7480,
    topicClusterId: "c3",
    clusterOrder: 6,
    teaserText:
      "Next: who gets more criticism for openly caring about a partner's income?",
    followUpQuestionIds: ["q25", "q26"],
    rewardTags: ["prediction_score", "demographic_split", "crowd_shock"],
    profileSignals: ["traditionalist", "progressive"],
  },
  {
    id: "q25",
    category: "Gender",
    type: "single_choice",
    prompt:
      "Who is more likely to be criticized for caring about a partner's income?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — everyone cares, few admit it",
    ],
    status: "active",
    responseCount: 4890,
    topicClusterId: "c3",
    clusterOrder: 7,
    teaserText:
      "Next: whose relationship struggles are taken less seriously in public discussion?",
    followUpQuestionIds: ["q26", "q27"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["pragmatic", "security_focused"],
  },
  {
    id: "q26",
    category: "Gender",
    type: "single_choice",
    prompt:
      "In social discussions today, whose relationship struggles are taken less seriously?",
    options: [
      "Men's",
      "Women's",
      "Both are taken seriously enough",
      "Neither — relationship struggles rarely get serious attention",
    ],
    status: "active",
    responseCount: 3560,
    topicClusterId: "c3",
    clusterOrder: 8,
    teaserText:
      "Next: who is more expected to stay emotionally composed no matter what?",
    followUpQuestionIds: ["q27"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["progressive", "emotionally_aware"],
  },
  {
    id: "q27",
    category: "Gender",
    type: "single_choice",
    prompt:
      "In modern life, who is more expected to stay emotionally composed no matter what?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — emotional composure is becoming less expected",
    ],
    status: "active",
    responseCount: 5340,
    topicClusterId: "c3",
    clusterOrder: 9,
    teaserText:
      "Next: the money question that creates the most disagreement in relationships",
    followUpQuestionIds: ["q28"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["traditionalist", "progressive", "emotionally_aware"],
  },

  // ─── Cluster 7: Money in Relationships ──────────────────────────────────────
  {
    id: "q28",
    category: "Money",
    type: "single_choice",
    prompt:
      "In relationships, what causes more disagreement today?",
    options: [
      "Spending habits",
      "Income differences",
      "Different financial goals",
      "Different attitudes toward risk and security",
    ],
    status: "active",
    responseCount: 6620,
    topicClusterId: "c4",
    clusterOrder: 1,
    teaserText:
      "Next: who is more likely to spend money as a form of self-reward?",
    followUpQuestionIds: ["q29", "q30"],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "security_focused"],
  },
  {
    id: "q29",
    category: "Money",
    type: "single_choice",
    prompt:
      "Who is more likely to use spending as a form of self-reward?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — it's more about emotional state than gender",
    ],
    status: "active",
    responseCount: 4270,
    topicClusterId: "c4",
    clusterOrder: 2,
    teaserText:
      "Next: what signal does spending send in dating that people won't admit?",
    followUpQuestionIds: ["q30", "q31"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["pragmatic", "independent"],
  },
  {
    id: "q30",
    category: "Money",
    type: "single_choice",
    prompt: "In dating, what sends a stronger signal than people admit?",
    options: [
      "How much someone spends",
      "How thoughtfully someone spends",
      "How financially responsible someone seems",
      "Whether they're building toward something real",
    ],
    status: "active",
    responseCount: 5090,
    topicClusterId: "c4",
    clusterOrder: 3,
    teaserText:
      "Next: what matters most for long-term financial compatibility?",
    followUpQuestionIds: ["q31"],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "security_focused"],
  },
  {
    id: "q31",
    category: "Money",
    type: "single_choice",
    prompt: "What matters more for long-term compatibility?",
    options: [
      "Similar income level",
      "Similar spending habits",
      "Similar financial ambition",
      "Similar relationship with debt and saving",
    ],
    status: "active",
    responseCount: 7810,
    topicClusterId: "c4",
    clusterOrder: 4,
    teaserText:
      "Next: who gets more judgment for not earning enough in a relationship?",
    followUpQuestionIds: ["q32"],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "security_focused"],
  },

  // ─── Cluster 8: Financial Patterns ──────────────────────────────────────────
  {
    id: "q32",
    category: "Money",
    type: "single_choice",
    prompt:
      "Who is more judged for not earning enough in a relationship?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — it's rarely discussed openly",
    ],
    status: "active",
    responseCount: 5450,
    topicClusterId: "c4",
    clusterOrder: 5,
    teaserText:
      "Next: what actually feels most attractive in a long-term partner financially?",
    followUpQuestionIds: ["q33", "q34"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["traditionalist", "progressive"],
  },
  {
    id: "q33",
    category: "Money",
    type: "single_choice",
    prompt:
      "What feels more attractive in a potential long-term partner today?",
    options: [
      "High income",
      "Financial discipline",
      "Growth potential",
      "Consistency and financial security",
    ],
    status: "active",
    responseCount: 8150,
    topicClusterId: "c4",
    clusterOrder: 6,
    teaserText:
      "Next: who is more likely to hide financial stress from a partner?",
    followUpQuestionIds: ["q34", "q35"],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "security_focused", "romantic"],
  },
  {
    id: "q34",
    category: "Money",
    type: "single_choice",
    prompt:
      "In your view, who is more likely to hide financial stress in a relationship?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — it depends more on personality",
    ],
    status: "active",
    responseCount: 4700,
    topicClusterId: "c4",
    clusterOrder: 7,
    teaserText:
      "Next: what is most likely to break financial trust in a relationship?",
    followUpQuestionIds: ["q35"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["emotionally_aware", "pragmatic"],
  },
  {
    id: "q35",
    category: "Money",
    type: "single_choice",
    prompt: "What is more likely to break trust in a relationship?",
    options: [
      "Overspending",
      "Lack of financial transparency",
      "Unequal effort around money",
      "Completely different money philosophies",
    ],
    status: "active",
    responseCount: 6340,
    topicClusterId: "c4",
    clusterOrder: 8,
    teaserText:
      "Next: what the crowd says matters most in choosing a long-term partner",
    followUpQuestionIds: ["q36"],
    rewardTags: ["prediction_score"],
    profileSignals: ["emotionally_aware", "security_focused"],
  },

  // ─── Cluster 9: Values & Connection ─────────────────────────────────────────
  {
    id: "q36",
    category: "Values",
    type: "single_choice",
    prompt:
      "In choosing a long-term partner today, what matters most?",
    options: [
      "Emotional compatibility",
      "Practical stability",
      "Shared values",
      "All three matter roughly equally",
    ],
    status: "active",
    responseCount: 9200,
    topicClusterId: "c5",
    clusterOrder: 1,
    teaserText:
      "Next: which feeling matters more in a relationship?",
    followUpQuestionIds: ["q37", "q38"],
    rewardTags: ["prediction_score"],
    profileSignals: ["romantic", "pragmatic", "security_focused"],
  },
  {
    id: "q37",
    category: "Values",
    type: "single_choice",
    prompt: "Which matters more in modern relationships?",
    options: [
      "Feeling understood",
      "Feeling secure",
      "Feeling respected",
      "Feeling free to be yourself",
    ],
    status: "active",
    responseCount: 7640,
    topicClusterId: "c5",
    clusterOrder: 2,
    teaserText:
      "Next: what is hardest to compromise on in a serious relationship?",
    followUpQuestionIds: ["q38", "q39"],
    rewardTags: ["prediction_score"],
    profileSignals: ["romantic", "independent", "emotionally_aware"],
  },
  {
    id: "q38",
    category: "Values",
    type: "single_choice",
    prompt:
      "What is harder to compromise on in a serious relationship?",
    options: [
      "Lifestyle preferences",
      "Core values",
      "Long-term goals",
      "Daily habits and personal rhythms",
    ],
    status: "active",
    responseCount: 5980,
    topicClusterId: "c5",
    clusterOrder: 3,
    teaserText: "Next: what actually makes a relationship last?",
    followUpQuestionIds: ["q39", "q40"],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "romantic", "independent"],
  },
  {
    id: "q39",
    category: "Values",
    type: "single_choice",
    prompt: "What matters more in whether a relationship lasts?",
    options: [
      "Love",
      "Timing",
      "Shared life direction",
      "The consistent effort both people put in",
    ],
    status: "active",
    responseCount: 8760,
    topicClusterId: "c5",
    clusterOrder: 4,
    teaserText:
      "Next: are people today driven more by personal happiness or social expectation?",
    followUpQuestionIds: ["q40"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["romantic", "pragmatic", "emotionally_aware"],
  },
  {
    id: "q40",
    category: "Values",
    type: "single_choice",
    prompt:
      "Are people today more driven by personal happiness or social expectation in relationships?",
    options: [
      "Personal happiness",
      "Social expectation",
      "A mix of both",
      "Fear of making the wrong choice",
    ],
    status: "active",
    responseCount: 6110,
    topicClusterId: "c5",
    clusterOrder: 5,
    teaserText:
      "Next: the type of relationship regret that shows up most often",
    followUpQuestionIds: ["q41"],
    rewardTags: ["prediction_score"],
    profileSignals: ["independent", "pragmatic", "progressive"],
  },

  // ─── Cluster 10: Modern Love & Regret ───────────────────────────────────────
  {
    id: "q41",
    category: "Values",
    type: "single_choice",
    prompt: "What creates more regret in relationships?",
    options: [
      "Choosing the wrong person",
      "Waiting too long",
      "Settling too early",
      "Not being honest with yourself sooner",
    ],
    status: "active",
    responseCount: 7380,
    topicClusterId: "c6",
    clusterOrder: 1,
    teaserText:
      "Next: what is becoming less acceptable in modern relationships?",
    followUpQuestionIds: ["q42", "q43"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["romantic", "pragmatic"],
  },
  {
    id: "q42",
    category: "Values",
    type: "single_choice",
    prompt:
      "In your view, what is becoming less acceptable in modern relationships?",
    options: [
      "Unequal effort",
      "Emotional unavailability",
      "Traditional role expectations",
      "Being taken for granted",
    ],
    status: "active",
    responseCount: 5720,
    topicClusterId: "c6",
    clusterOrder: 2,
    teaserText:
      "Next: what matters most when conflict happens in a relationship?",
    followUpQuestionIds: ["q43"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["progressive", "emotionally_aware"],
  },
  {
    id: "q43",
    category: "Values",
    type: "single_choice",
    prompt: "What matters more when conflict happens in a relationship?",
    options: [
      "Who is right",
      "Who is willing to repair",
      "Whether the issue touches core values",
      "Whether both people feel safe expressing themselves",
    ],
    status: "active",
    responseCount: 6490,
    topicClusterId: "c6",
    clusterOrder: 3,
    teaserText:
      "Next: the hidden conflict that dual-career couples almost never name directly",
    followUpQuestionIds: ["q49"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["emotionally_aware", "pragmatic"],
  },
  {
    id: "q49",
    category: "Career",
    type: "single_choice",
    prompt:
      "In dual-career relationships, what is most likely to become a hidden conflict?",
    options: [
      "Whose career gets prioritized",
      "Household responsibility",
      "Emotional availability",
      "Whether both people's ambitions feel equally valued",
    ],
    status: "active",
    responseCount: 5270,
    topicClusterId: "c6",
    clusterOrder: 4,
    teaserText:
      "Next: who is more likely to feel that career success has made love harder?",
    followUpQuestionIds: ["q50"],
    rewardTags: ["prediction_score", "demographic_split"],
    profileSignals: ["pragmatic", "independent"],
  },
  {
    id: "q50",
    category: "Career",
    type: "single_choice",
    prompt:
      "In your view, who is more likely to feel that career success has made relationships harder rather than easier?",
    options: [
      "Men",
      "Women",
      "About equally",
      "It affects both but they rarely talk about it the same way",
    ],
    status: "active",
    responseCount: 3820,
    topicClusterId: "c6",
    clusterOrder: 5,
    teaserText:
      "Next: who is more likely to change life plans for a partner's career?",
    followUpQuestionIds: ["q44"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["pragmatic", "independent", "emotionally_aware"],
  },

  // ─── Cluster 11: Career Tradeoffs ───────────────────────────────────────────
  {
    id: "q44",
    category: "Career",
    type: "single_choice",
    prompt:
      "Who is more likely to change life plans for a partner's career?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — it's becoming less expected overall",
    ],
    status: "active",
    responseCount: 4950,
    topicClusterId: "c7",
    clusterOrder: 1,
    teaserText:
      "Next: what creates the most strain between career and relationships?",
    followUpQuestionIds: ["q45", "q46"],
    rewardTags: ["prediction_score", "demographic_split", "crowd_shock"],
    profileSignals: ["traditionalist", "progressive", "independent"],
  },
  {
    id: "q45",
    category: "Career",
    type: "single_choice",
    prompt:
      "What creates more strain between career and relationships today?",
    options: [
      "Long work hours",
      "Different ambition levels",
      "Geographic mobility",
      "Feeling like the relationship always comes second",
    ],
    status: "active",
    responseCount: 6800,
    topicClusterId: "c7",
    clusterOrder: 2,
    teaserText:
      "Next: who faces more pressure to be successful before seriously dating?",
    followUpQuestionIds: ["q46", "q47"],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "emotionally_aware"],
  },
  {
    id: "q46",
    category: "Career",
    type: "single_choice",
    prompt:
      "Who faces more pressure to be successful before seriously dating or marrying?",
    options: [
      "Men",
      "Women",
      "About equally",
      "Neither — the pressure is shifting equally to both",
    ],
    status: "active",
    responseCount: 5630,
    topicClusterId: "c7",
    clusterOrder: 3,
    teaserText:
      "Next: what is actually hardest to handle when career ambitions differ?",
    followUpQuestionIds: ["q47", "q48"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["traditionalist", "pragmatic"],
  },
  {
    id: "q47",
    category: "Career",
    type: "single_choice",
    prompt: "In a serious relationship, what is harder to handle?",
    options: [
      "One partner earning much more",
      "One partner having much less time",
      "One partner being much more ambitious",
      "One partner feeling they've made more sacrifices",
    ],
    status: "active",
    responseCount: 7050,
    topicClusterId: "c7",
    clusterOrder: 4,
    teaserText:
      "Next: what matters most for career compatibility in a relationship?",
    followUpQuestionIds: ["q48"],
    rewardTags: ["prediction_score", "crowd_shock"],
    profileSignals: ["pragmatic", "emotionally_aware"],
  },
  {
    id: "q48",
    category: "Career",
    type: "single_choice",
    prompt:
      "What matters more in relationship compatibility today?",
    options: [
      "Similar career stage",
      "Similar work-life priorities",
      "Similar income expectations",
      "Similar views on what success actually means",
    ],
    status: "active",
    responseCount: 4480,
    topicClusterId: "c7",
    clusterOrder: 5,
    teaserText:
      "You've reached the end. Return to explore other insight clusters.",
    followUpQuestionIds: [],
    rewardTags: ["prediction_score"],
    profileSignals: ["pragmatic", "security_focused"],
  },
];

function makeDistribution(
  options: string[],
  percentages: number[],
  total: number
): DistributionItem[] {
  return options.map((option, i) => ({
    option,
    percentage: percentages[i],
    count: Math.round((percentages[i] / 100) * total),
  }));
}

function makeSegments(
  options: string[],
  total: number,
  segmentData: { groupName: string; percentages: number[] }[]
): SegmentResult[] {
  return segmentData.map(({ groupName, percentages }) => ({
    groupName,
    distribution: makeDistribution(options, percentages, Math.round(total * 0.48)),
  }));
}

export const mockResults = new Map<string, AggregatedResult>();

const seed: {
  id: string;
  total: number;
  percentages: number[];
  majority: number;
  segments: { groupName: string; percentages: number[] }[];
}[] = [
  {
    id: "q1",
    total: 6840,
    percentages: [48, 10, 22, 20],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [42, 13, 25, 20] },
      { groupName: "Women", percentages: [53, 8, 20, 19] },
      { groupName: "Single", percentages: [50, 10, 20, 20] },
      { groupName: "In a relationship", percentages: [45, 11, 25, 19] },
    ],
  },
  {
    id: "q2",
    total: 5210,
    percentages: [22, 38, 12, 28],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [30, 30, 13, 27] },
      { groupName: "Women", percentages: [14, 46, 11, 29] },
      { groupName: "Single", percentages: [26, 34, 12, 28] },
      { groupName: "In a relationship", percentages: [18, 42, 12, 28] },
    ],
  },
  {
    id: "q3",
    total: 4760,
    percentages: [14, 46, 28, 12],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [20, 38, 30, 12] },
      { groupName: "Women", percentages: [9, 53, 26, 12] },
      { groupName: "Single", percentages: [16, 44, 27, 13] },
      { groupName: "In a relationship", percentages: [12, 48, 29, 11] },
    ],
  },
  {
    id: "q4",
    total: 7130,
    percentages: [37, 28, 18, 17],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [35, 30, 19, 16] },
      { groupName: "Women", percentages: [39, 26, 17, 18] },
      { groupName: "Single", percentages: [40, 26, 17, 17] },
      { groupName: "In a relationship", percentages: [34, 30, 19, 17] },
    ],
  },
  {
    id: "q5",
    total: 3950,
    percentages: [12, 18, 22, 48],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [15, 16, 24, 45] },
      { groupName: "Women", percentages: [9, 20, 20, 51] },
      { groupName: "Single", percentages: [13, 19, 21, 47] },
      { groupName: "In a relationship", percentages: [11, 17, 23, 49] },
    ],
  },
  {
    id: "q6",
    total: 5880,
    percentages: [44, 14, 16, 26],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [40, 18, 17, 25] },
      { groupName: "Women", percentages: [48, 10, 15, 27] },
      { groupName: "Single", percentages: [46, 14, 14, 26] },
      { groupName: "In a relationship", percentages: [42, 14, 18, 26] },
    ],
  },
  {
    id: "q7",
    total: 4410,
    percentages: [45, 12, 26, 17],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [38, 15, 28, 19] },
      { groupName: "Women", percentages: [51, 9, 24, 16] },
      { groupName: "Single", percentages: [47, 12, 24, 17] },
      { groupName: "In a relationship", percentages: [43, 12, 28, 17] },
    ],
  },
  {
    id: "q8",
    total: 6520,
    percentages: [32, 24, 20, 24],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [36, 26, 18, 20] },
      { groupName: "Women", percentages: [28, 22, 22, 28] },
      { groupName: "Single", percentages: [34, 25, 19, 22] },
      { groupName: "In a relationship", percentages: [30, 23, 21, 26] },
    ],
  },
  {
    id: "q9",
    total: 4090,
    percentages: [36, 18, 32, 14],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [30, 22, 34, 14] },
      { groupName: "Women", percentages: [42, 14, 30, 14] },
      { groupName: "Single", percentages: [38, 18, 30, 14] },
      { groupName: "In a relationship", percentages: [34, 18, 34, 14] },
    ],
  },
  {
    id: "q10",
    total: 5670,
    percentages: [22, 10, 24, 44],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [24, 12, 26, 38] },
      { groupName: "Women", percentages: [20, 8, 22, 50] },
      { groupName: "Single", percentages: [23, 10, 23, 44] },
      { groupName: "In a relationship", percentages: [21, 10, 25, 44] },
    ],
  },
  {
    id: "q11",
    total: 6180,
    percentages: [54, 8, 22, 16],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [48, 10, 25, 17] },
      { groupName: "Women", percentages: [59, 6, 20, 15] },
      { groupName: "Single", percentages: [56, 8, 21, 15] },
      { groupName: "In a relationship", percentages: [52, 8, 23, 17] },
    ],
  },
  {
    id: "q12",
    total: 4830,
    percentages: [18, 10, 52, 20],
    majority: 2,
    segments: [
      { groupName: "Men", percentages: [22, 12, 48, 18] },
      { groupName: "Women", percentages: [14, 8, 56, 22] },
      { groupName: "Single", percentages: [18, 10, 52, 20] },
      { groupName: "In a relationship", percentages: [18, 10, 52, 20] },
    ],
  },
  {
    id: "q13",
    total: 7290,
    percentages: [20, 38, 22, 20],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [22, 34, 24, 20] },
      { groupName: "Women", percentages: [18, 42, 20, 20] },
      { groupName: "Single", percentages: [20, 36, 24, 20] },
      { groupName: "In a relationship", percentages: [20, 40, 20, 20] },
    ],
  },
  {
    id: "q14",
    total: 3870,
    percentages: [10, 44, 22, 24],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [14, 38, 24, 24] },
      { groupName: "Women", percentages: [7, 49, 20, 24] },
      { groupName: "Single", percentages: [11, 43, 22, 24] },
      { groupName: "In a relationship", percentages: [9, 45, 22, 24] },
    ],
  },
  {
    id: "q15",
    total: 8410,
    percentages: [42, 14, 32, 12],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [38, 17, 32, 13] },
      { groupName: "Women", percentages: [46, 11, 32, 11] },
      { groupName: "Single", percentages: [40, 14, 34, 12] },
      { groupName: "In a relationship", percentages: [44, 14, 30, 12] },
    ],
  },
  {
    id: "q16",
    total: 5540,
    percentages: [42, 8, 16, 34],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [40, 9, 17, 34] },
      { groupName: "Women", percentages: [44, 7, 15, 34] },
      { groupName: "Single", percentages: [44, 7, 14, 35] },
      { groupName: "In a relationship", percentages: [40, 9, 18, 33] },
    ],
  },
  {
    id: "q17",
    total: 6750,
    percentages: [18, 22, 34, 26],
    majority: 2,
    segments: [
      { groupName: "Men", percentages: [20, 24, 32, 24] },
      { groupName: "Women", percentages: [16, 20, 36, 28] },
      { groupName: "Single", percentages: [16, 24, 32, 28] },
      { groupName: "In a relationship", percentages: [20, 20, 36, 24] },
    ],
  },
  {
    id: "q18",
    total: 4320,
    percentages: [12, 46, 32, 10],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [16, 40, 34, 10] },
      { groupName: "Women", percentages: [8, 52, 30, 10] },
      { groupName: "Single", percentages: [12, 45, 33, 10] },
      { groupName: "In a relationship", percentages: [12, 47, 31, 10] },
    ],
  },
  {
    id: "q19",
    total: 5960,
    percentages: [8, 52, 34, 6],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [12, 44, 37, 7] },
      { groupName: "Women", percentages: [5, 59, 31, 5] },
      { groupName: "Single", percentages: [8, 52, 34, 6] },
      { groupName: "In a relationship", percentages: [8, 52, 34, 6] },
    ],
  },
  {
    id: "q20",
    total: 4580,
    percentages: [8, 44, 22, 26],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [10, 38, 24, 28] },
      { groupName: "Women", percentages: [6, 50, 20, 24] },
      { groupName: "Single", percentages: [8, 44, 22, 26] },
      { groupName: "In a relationship", percentages: [8, 44, 22, 26] },
    ],
  },
  {
    id: "q21",
    total: 5110,
    percentages: [46, 6, 30, 18],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [40, 8, 32, 20] },
      { groupName: "Women", percentages: [52, 4, 28, 16] },
      { groupName: "Single", percentages: [46, 6, 30, 18] },
      { groupName: "In a relationship", percentages: [46, 6, 30, 18] },
    ],
  },
  {
    id: "q22",
    total: 3720,
    percentages: [10, 46, 20, 24],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [14, 40, 22, 24] },
      { groupName: "Women", percentages: [7, 51, 18, 24] },
      { groupName: "Single", percentages: [10, 46, 20, 24] },
      { groupName: "In a relationship", percentages: [10, 46, 20, 24] },
    ],
  },
  {
    id: "q23",
    total: 6030,
    percentages: [8, 14, 34, 44],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [10, 12, 36, 42] },
      { groupName: "Women", percentages: [6, 16, 32, 46] },
      { groupName: "Single", percentages: [8, 14, 34, 44] },
      { groupName: "In a relationship", percentages: [8, 14, 34, 44] },
    ],
  },
  {
    id: "q24",
    total: 7480,
    percentages: [8, 50, 28, 14],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [11, 44, 30, 15] },
      { groupName: "Women", percentages: [5, 56, 26, 13] },
      { groupName: "Single", percentages: [9, 51, 27, 13] },
      { groupName: "In a relationship", percentages: [7, 49, 29, 15] },
    ],
  },
  {
    id: "q25",
    total: 4890,
    percentages: [10, 42, 18, 30],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [14, 36, 20, 30] },
      { groupName: "Women", percentages: [7, 48, 16, 29] },
      { groupName: "Single", percentages: [11, 41, 18, 30] },
      { groupName: "In a relationship", percentages: [9, 43, 18, 30] },
    ],
  },
  {
    id: "q26",
    total: 3560,
    percentages: [40, 12, 20, 28],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [34, 15, 22, 29] },
      { groupName: "Women", percentages: [46, 9, 18, 27] },
      { groupName: "Single", percentages: [40, 12, 20, 28] },
      { groupName: "In a relationship", percentages: [40, 12, 20, 28] },
    ],
  },
  {
    id: "q27",
    total: 5340,
    percentages: [54, 7, 25, 14],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [49, 9, 27, 15] },
      { groupName: "Women", percentages: [55, 5, 26, 14] },
      { groupName: "Single", percentages: [54, 7, 25, 14] },
      { groupName: "In a relationship", percentages: [54, 7, 25, 14] },
    ],
  },
  {
    id: "q28",
    total: 6620,
    percentages: [34, 18, 28, 20],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [32, 20, 28, 20] },
      { groupName: "Women", percentages: [36, 16, 28, 20] },
      { groupName: "Single", percentages: [34, 18, 28, 20] },
      { groupName: "In a relationship", percentages: [34, 18, 28, 20] },
    ],
  },
  {
    id: "q29",
    total: 4270,
    percentages: [14, 42, 26, 18],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [18, 36, 28, 18] },
      { groupName: "Women", percentages: [10, 48, 24, 18] },
      { groupName: "Single", percentages: [14, 42, 26, 18] },
      { groupName: "In a relationship", percentages: [14, 42, 26, 18] },
    ],
  },
  {
    id: "q30",
    total: 5090,
    percentages: [10, 28, 32, 30],
    majority: 2,
    segments: [
      { groupName: "Men", percentages: [12, 26, 34, 28] },
      { groupName: "Women", percentages: [8, 30, 30, 32] },
      { groupName: "Single", percentages: [10, 28, 32, 30] },
      { groupName: "In a relationship", percentages: [10, 28, 32, 30] },
    ],
  },
  {
    id: "q31",
    total: 7810,
    percentages: [12, 30, 22, 36],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [14, 28, 24, 34] },
      { groupName: "Women", percentages: [10, 32, 20, 38] },
      { groupName: "Single", percentages: [12, 30, 22, 36] },
      { groupName: "In a relationship", percentages: [12, 30, 22, 36] },
    ],
  },
  {
    id: "q32",
    total: 5450,
    percentages: [52, 10, 22, 16],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [46, 13, 24, 17] },
      { groupName: "Women", percentages: [57, 7, 20, 16] },
      { groupName: "Single", percentages: [52, 10, 22, 16] },
      { groupName: "In a relationship", percentages: [52, 10, 22, 16] },
    ],
  },
  {
    id: "q33",
    total: 8150,
    percentages: [8, 28, 26, 38],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [10, 26, 28, 36] },
      { groupName: "Women", percentages: [6, 30, 24, 40] },
      { groupName: "Single", percentages: [8, 28, 26, 38] },
      { groupName: "In a relationship", percentages: [8, 28, 26, 38] },
    ],
  },
  {
    id: "q34",
    total: 4700,
    percentages: [46, 14, 26, 14],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [40, 17, 28, 15] },
      { groupName: "Women", percentages: [52, 11, 24, 13] },
      { groupName: "Single", percentages: [46, 14, 26, 14] },
      { groupName: "In a relationship", percentages: [46, 14, 26, 14] },
    ],
  },
  {
    id: "q35",
    total: 6340,
    percentages: [14, 42, 22, 22],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [16, 40, 22, 22] },
      { groupName: "Women", percentages: [12, 44, 22, 22] },
      { groupName: "Single", percentages: [14, 42, 22, 22] },
      { groupName: "In a relationship", percentages: [14, 42, 22, 22] },
    ],
  },
  {
    id: "q36",
    total: 9200,
    percentages: [32, 18, 24, 26],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [28, 22, 24, 26] },
      { groupName: "Women", percentages: [36, 14, 24, 26] },
      { groupName: "Single", percentages: [32, 18, 24, 26] },
      { groupName: "In a relationship", percentages: [32, 18, 24, 26] },
    ],
  },
  {
    id: "q37",
    total: 7640,
    percentages: [34, 20, 24, 22],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [30, 22, 26, 22] },
      { groupName: "Women", percentages: [38, 18, 22, 22] },
      { groupName: "Single", percentages: [34, 20, 24, 22] },
      { groupName: "In a relationship", percentages: [34, 20, 24, 22] },
    ],
  },
  {
    id: "q38",
    total: 5980,
    percentages: [12, 44, 26, 18],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [14, 42, 26, 18] },
      { groupName: "Women", percentages: [10, 46, 26, 18] },
      { groupName: "Single", percentages: [12, 44, 26, 18] },
      { groupName: "In a relationship", percentages: [12, 44, 26, 18] },
    ],
  },
  {
    id: "q39",
    total: 8760,
    percentages: [14, 10, 36, 40],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [15, 11, 36, 38] },
      { groupName: "Women", percentages: [13, 9, 36, 42] },
      { groupName: "Single", percentages: [14, 10, 36, 40] },
      { groupName: "In a relationship", percentages: [14, 10, 36, 40] },
    ],
  },
  {
    id: "q40",
    total: 6110,
    percentages: [44, 12, 32, 12],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [46, 12, 30, 12] },
      { groupName: "Women", percentages: [42, 12, 34, 12] },
      { groupName: "Single", percentages: [44, 12, 32, 12] },
      { groupName: "In a relationship", percentages: [44, 12, 32, 12] },
    ],
  },
  {
    id: "q41",
    total: 7380,
    percentages: [28, 16, 24, 32],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [28, 17, 24, 31] },
      { groupName: "Women", percentages: [28, 15, 24, 33] },
      { groupName: "Single", percentages: [26, 18, 24, 32] },
      { groupName: "In a relationship", percentages: [30, 14, 24, 32] },
    ],
  },
  {
    id: "q42",
    total: 5720,
    percentages: [26, 30, 20, 24],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [24, 28, 22, 26] },
      { groupName: "Women", percentages: [28, 32, 18, 22] },
      { groupName: "Single", percentages: [26, 30, 20, 24] },
      { groupName: "In a relationship", percentages: [26, 30, 20, 24] },
    ],
  },
  {
    id: "q43",
    total: 6490,
    percentages: [4, 32, 18, 46],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [6, 30, 20, 44] },
      { groupName: "Women", percentages: [2, 34, 16, 48] },
      { groupName: "Single", percentages: [4, 32, 18, 46] },
      { groupName: "In a relationship", percentages: [4, 32, 18, 46] },
    ],
  },
  {
    id: "q49",
    total: 5270,
    percentages: [32, 26, 18, 24],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [30, 26, 20, 24] },
      { groupName: "Women", percentages: [34, 26, 16, 24] },
      { groupName: "Single", percentages: [32, 26, 18, 24] },
      { groupName: "In a relationship", percentages: [32, 26, 18, 24] },
    ],
  },
  {
    id: "q50",
    total: 3820,
    percentages: [28, 14, 30, 28],
    majority: 2,
    segments: [
      { groupName: "Men", percentages: [30, 13, 30, 27] },
      { groupName: "Women", percentages: [26, 15, 30, 29] },
      { groupName: "Single", percentages: [28, 14, 30, 28] },
      { groupName: "In a relationship", percentages: [28, 14, 30, 28] },
    ],
  },
  {
    id: "q44",
    total: 4950,
    percentages: [10, 48, 28, 14],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [13, 42, 30, 15] },
      { groupName: "Women", percentages: [7, 54, 26, 13] },
      { groupName: "Single", percentages: [10, 48, 28, 14] },
      { groupName: "In a relationship", percentages: [10, 48, 28, 14] },
    ],
  },
  {
    id: "q45",
    total: 6800,
    percentages: [30, 22, 14, 34],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [30, 24, 14, 32] },
      { groupName: "Women", percentages: [30, 20, 14, 36] },
      { groupName: "Single", percentages: [30, 22, 14, 34] },
      { groupName: "In a relationship", percentages: [30, 22, 14, 34] },
    ],
  },
  {
    id: "q46",
    total: 5630,
    percentages: [50, 8, 26, 16],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [44, 10, 28, 18] },
      { groupName: "Women", percentages: [55, 6, 24, 15] },
      { groupName: "Single", percentages: [50, 8, 26, 16] },
      { groupName: "In a relationship", percentages: [50, 8, 26, 16] },
    ],
  },
  {
    id: "q47",
    total: 7050,
    percentages: [20, 22, 16, 42],
    majority: 3,
    segments: [
      { groupName: "Men", percentages: [22, 22, 17, 39] },
      { groupName: "Women", percentages: [18, 22, 15, 45] },
      { groupName: "Single", percentages: [20, 22, 16, 42] },
      { groupName: "In a relationship", percentages: [20, 22, 16, 42] },
    ],
  },
  {
    id: "q48",
    total: 4480,
    percentages: [12, 40, 14, 34],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [14, 38, 16, 32] },
      { groupName: "Women", percentages: [10, 42, 12, 36] },
      { groupName: "Single", percentages: [12, 40, 14, 34] },
      { groupName: "In a relationship", percentages: [12, 40, 14, 34] },
    ],
  },
];

for (const s of seed) {
  const q = questions.find((q) => q.id === s.id)!;
  mockResults.set(s.id, {
    questionId: s.id,
    totalResponses: s.total,
    majorityAnswer: q.options[s.majority],
    distribution: makeDistribution(q.options, s.percentages, s.total),
    segments: makeSegments(q.options, s.total, s.segments),
  });
}
