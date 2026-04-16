interface Question {
  id: string;
  category: "Dating" | "Marriage" | "Gender" | "Money" | "Values" | "Career";
  type: "single_choice" | "slider";
  prompt: string;
  options: string[];
  status: "active" | "draft";
  responseCount: number;
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

export const questions: Question[] = [
  {
    id: "q1",
    category: "Dating",
    type: "single_choice",
    prompt: "In modern dating, who is usually expected to make the relationship more emotionally stable?",
    options: ["Men", "Women", "It's equally shared", "Neither — we avoid the topic"],
    status: "active",
    responseCount: 4823,
  },
  {
    id: "q2",
    category: "Marriage",
    type: "single_choice",
    prompt: "When people talk about \"marrying up,\" which side do you think society still expects more?",
    options: ["Women marrying up is still more expected", "Men marrying up is more expected now", "Both are equally expected", "The concept is outdated"],
    status: "active",
    responseCount: 3912,
  },
  {
    id: "q3",
    category: "Marriage",
    type: "single_choice",
    prompt: "In the marriages you've seen recently, what pattern feels most common?",
    options: ["The man has stronger overall conditions", "The woman has stronger overall conditions", "They are roughly matched", "Hard to generalize"],
    status: "active",
    responseCount: 5671,
  },
  {
    id: "q4",
    category: "Dating",
    type: "single_choice",
    prompt: "Which matters more in long-term partner selection today?",
    options: ["Emotional compatibility", "Financial stability", "Physical attraction", "Shared values and lifestyle"],
    status: "active",
    responseCount: 7204,
  },
  {
    id: "q5",
    category: "Marriage",
    type: "single_choice",
    prompt: "Are young adults becoming more practical or more romantic about marriage?",
    options: ["Much more practical", "Slightly more practical", "Still mostly romantic", "More cynical than either"],
    status: "active",
    responseCount: 4458,
  },
  {
    id: "q6",
    category: "Gender",
    type: "single_choice",
    prompt: "Who faces more pressure to be financially established before marriage?",
    options: ["Men face more pressure", "Women face more pressure now too", "It's genuinely equal", "Neither — fewer people care"],
    status: "active",
    responseCount: 6130,
  },
  {
    id: "q7",
    category: "Money",
    type: "single_choice",
    prompt: "Are people more willing today to date someone with significantly lower income than before?",
    options: ["Yes, much more open", "Slightly more open", "About the same", "Less willing — money matters more now"],
    status: "active",
    responseCount: 3887,
  },
  {
    id: "q8",
    category: "Money",
    type: "single_choice",
    prompt: "Which creates more relationship tension today: money differences or different values?",
    options: ["Money differences", "Value differences", "They're equally damaging", "Lifestyle differences — neither money nor values"],
    status: "active",
    responseCount: 5293,
  },
  {
    id: "q9",
    category: "Gender",
    type: "single_choice",
    prompt: "In your view, who is more judged for \"settling\" in relationships?",
    options: ["Women are judged more", "Men are judged more", "They're judged equally", "Neither — settling is normalized"],
    status: "active",
    responseCount: 4102,
  },
  {
    id: "q10",
    category: "Values",
    type: "single_choice",
    prompt: "Does modern love feel more equal, or just differently unequal?",
    options: ["Genuinely more equal now", "Differently unequal — new power dynamics", "As unequal as ever", "Depends entirely on the couple"],
    status: "active",
    responseCount: 4989,
  },
  {
    id: "q11",
    category: "Career",
    type: "single_choice",
    prompt: "When a couple has to choose between career opportunities, whose career typically takes priority?",
    options: ["The higher earner's career", "The man's career, by default", "The woman's career more often now", "It's genuinely negotiated each time"],
    status: "active",
    responseCount: 5821,
  },
  {
    id: "q12",
    category: "Dating",
    type: "single_choice",
    prompt: "How do most people feel about dating apps in 2025?",
    options: ["Still optimistic", "Burned out but still using them", "Actively avoiding them", "Never tried and never will"],
    status: "active",
    responseCount: 8234,
  },
  {
    id: "q13",
    category: "Values",
    type: "single_choice",
    prompt: "What's the biggest reason people stay in relationships that aren't working?",
    options: ["Fear of being alone", "Financial dependency", "Sunk cost — too much invested", "Hope that things will change"],
    status: "active",
    responseCount: 6714,
  },
  {
    id: "q14",
    category: "Gender",
    type: "single_choice",
    prompt: "Do you think gender roles in relationships are becoming more flexible?",
    options: ["Yes, meaningfully more flexible", "Flexible on the surface, traditional underneath", "About the same", "Actually less flexible than before"],
    status: "active",
    responseCount: 5102,
  },
  {
    id: "q15",
    category: "Career",
    type: "single_choice",
    prompt: "Would you rather have a highly successful career with an average relationship, or an average career with a deeply fulfilling relationship?",
    options: ["Successful career, average relationship", "Average career, deeply fulfilling relationship", "I refuse to accept this as a real trade-off", "Career first — relationships can wait"],
    status: "active",
    responseCount: 9102,
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
    total: 4823,
    percentages: [22, 51, 18, 9],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [28, 42, 22, 8] },
      { groupName: "Women", percentages: [16, 58, 18, 8] },
      { groupName: "Single", percentages: [25, 48, 17, 10] },
      { groupName: "In a relationship", percentages: [19, 53, 21, 7] },
    ],
  },
  {
    id: "q2",
    total: 3912,
    percentages: [42, 8, 24, 26],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [38, 10, 28, 24] },
      { groupName: "Women", percentages: [46, 7, 21, 26] },
      { groupName: "18–24", percentages: [35, 12, 22, 31] },
      { groupName: "25–34", percentages: [47, 7, 24, 22] },
    ],
  },
  {
    id: "q3",
    total: 5671,
    percentages: [38, 14, 31, 17],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [32, 18, 35, 15] },
      { groupName: "Women", percentages: [43, 11, 28, 18] },
      { groupName: "Married", percentages: [41, 12, 34, 13] },
      { groupName: "Single", percentages: [35, 16, 28, 21] },
    ],
  },
  {
    id: "q4",
    total: 7204,
    percentages: [44, 21, 8, 27],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [40, 24, 11, 25] },
      { groupName: "Women", percentages: [47, 18, 6, 29] },
      { groupName: "18–24", percentages: [40, 20, 10, 30] },
      { groupName: "25–34", percentages: [46, 22, 7, 25] },
    ],
  },
  {
    id: "q5",
    total: 4458,
    percentages: [32, 38, 14, 16],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [28, 40, 16, 16] },
      { groupName: "Women", percentages: [36, 36, 13, 15] },
      { groupName: "Single", percentages: [38, 35, 11, 16] },
      { groupName: "Married", percentages: [27, 41, 18, 14] },
    ],
  },
  {
    id: "q6",
    total: 6130,
    percentages: [52, 12, 22, 14],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [47, 15, 25, 13] },
      { groupName: "Women", percentages: [56, 10, 20, 14] },
      { groupName: "18–24", percentages: [58, 9, 19, 14] },
      { groupName: "25–34", percentages: [50, 13, 24, 13] },
    ],
  },
  {
    id: "q7",
    total: 3887,
    percentages: [18, 32, 28, 22],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [22, 28, 30, 20] },
      { groupName: "Women", percentages: [14, 36, 26, 24] },
      { groupName: "18–24", percentages: [24, 34, 24, 18] },
      { groupName: "25–34", percentages: [15, 31, 30, 24] },
    ],
  },
  {
    id: "q8",
    total: 5293,
    percentages: [27, 41, 19, 13],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [30, 38, 20, 12] },
      { groupName: "Women", percentages: [24, 44, 19, 13] },
      { groupName: "Single", percentages: [25, 43, 18, 14] },
      { groupName: "In a relationship", percentages: [29, 39, 20, 12] },
    ],
  },
  {
    id: "q9",
    total: 4102,
    percentages: [49, 11, 28, 12],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [42, 16, 30, 12] },
      { groupName: "Women", percentages: [55, 7, 26, 12] },
      { groupName: "18–24", percentages: [52, 10, 25, 13] },
      { groupName: "25–34", percentages: [46, 13, 30, 11] },
    ],
  },
  {
    id: "q10",
    total: 4989,
    percentages: [19, 43, 16, 22],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [23, 38, 18, 21] },
      { groupName: "Women", percentages: [15, 47, 15, 23] },
      { groupName: "Single", percentages: [17, 46, 14, 23] },
      { groupName: "Married", percentages: [22, 39, 19, 20] },
    ],
  },
  {
    id: "q11",
    total: 5821,
    percentages: [36, 28, 12, 24],
    majority: 0,
    segments: [
      { groupName: "Men", percentages: [31, 34, 10, 25] },
      { groupName: "Women", percentages: [40, 23, 14, 23] },
      { groupName: "Married", percentages: [38, 30, 11, 21] },
      { groupName: "Single", percentages: [33, 26, 14, 27] },
    ],
  },
  {
    id: "q12",
    total: 8234,
    percentages: [11, 52, 27, 10],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [14, 48, 28, 10] },
      { groupName: "Women", percentages: [8, 56, 26, 10] },
      { groupName: "18–24", percentages: [13, 55, 23, 9] },
      { groupName: "25–34", percentages: [10, 50, 30, 10] },
    ],
  },
  {
    id: "q13",
    total: 6714,
    percentages: [28, 19, 32, 21],
    majority: 2,
    segments: [
      { groupName: "Men", percentages: [25, 16, 35, 24] },
      { groupName: "Women", percentages: [30, 22, 29, 19] },
      { groupName: "18–24", percentages: [33, 14, 30, 23] },
      { groupName: "25–34", percentages: [25, 21, 34, 20] },
    ],
  },
  {
    id: "q14",
    total: 5102,
    percentages: [24, 47, 14, 15],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [28, 43, 15, 14] },
      { groupName: "Women", percentages: [20, 51, 13, 16] },
      { groupName: "18–24", percentages: [30, 42, 14, 14] },
      { groupName: "25–34", percentages: [21, 50, 14, 15] },
    ],
  },
  {
    id: "q15",
    total: 9102,
    percentages: [16, 54, 22, 8],
    majority: 1,
    segments: [
      { groupName: "Men", percentages: [20, 49, 22, 9] },
      { groupName: "Women", percentages: [12, 58, 22, 8] },
      { groupName: "18–24", percentages: [18, 51, 22, 9] },
      { groupName: "25–34", percentages: [15, 56, 21, 8] },
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
