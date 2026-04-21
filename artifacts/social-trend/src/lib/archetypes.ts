export interface PopulationMock {
  percentage: string;
  topGroup: string;
  bottomGroup: string;
}

export interface ArchetypeContent {
  name: string;
  shortTagline: string;
  plainEnglishMeaning: string;
  howYouLikelyGotHere: string[];
  strengths: string[];
  blindSpots: string[];
  socialFriction: string[];
  whyThisMatters: string;
  populationContextTemplate: string;
  populationMock: PopulationMock;
  reflectionPrompt: string;
}

const ARCHETYPE_CONTENT: Record<string, ArchetypeContent> = {
  crowd_reader: {
    name: "Crowd Reader",
    shortTagline: "You're unusually good at seeing where the crowd will land.",
    plainEnglishMeaning:
      "You tend to read public opinion more accurately than most users. This does not necessarily mean you agree with the majority — it means you are unusually good at anticipating how other people think. You seem to have a sharp feel for social patterns, collective instincts, and where popular sentiment is actually heading.",
    howYouLikelyGotHere: [
      "You consistently predicted majority answers at a high level of accuracy",
      "You often recognized where the crowd would be more conventional, cautious, or divided than expected",
      "You showed stronger social calibration than pure ideological consistency",
      "Your result depends less on one worldview and more on your ability to read people correctly",
    ],
    strengths: [
      "Strong at anticipating how most people actually think, not just how they present themselves",
      "Good at detecting where public opinion will be more traditional, practical, or emotionally driven",
      "Often sees social consensus more clearly than more self-expressive or ideological types",
      "Can separate personal opinion from crowd psychology",
    ],
    blindSpots: [
      "May confuse crowd accuracy with deeper truth",
      "Can become too calibrated to the majority and underweight outlier perspectives",
      "May over-trust pattern recognition in situations where context matters more",
      "Can be good at reading the room without always knowing what to do with that knowledge",
    ],
    socialFriction: [
      "May feel impatient with users whose personal views override social reality",
      "Can clash with highly idealistic types who care less about majority sentiment",
      "May be seen as too consensus-oriented by more independent or contrarian users",
    ],
    whyThisMatters:
      "This archetype suggests you are not just answering questions — you are reading society. That can make you better at anticipating disagreement, understanding what most people will actually endorse, and spotting the gap between private belief and public feeling. In real life, this may help in relationships, social judgment, persuasion, and understanding how people behave at scale.",
    populationContextTemplate:
      "You're part of {percentage}% of users with this archetype. This type is most common among {top_group} and least common among {bottom_group}.",
    populationMock: {
      percentage: "~12",
      topGroup: "25–34 year-olds",
      bottomGroup: "55+ respondents",
    },
    reflectionPrompt:
      "Are you merely good at reading the crowd, or do you sometimes let the crowd define what feels believable?",
  },

  romantic_skeptic: {
    name: "Romantic Skeptic",
    shortTagline: "You still care about love, but you no longer take romantic stories at face value.",
    plainEnglishMeaning:
      "You are emotionally open, but not naïve. You tend to value connection, attraction, and emotional meaning, while also questioning the stories society tells about love, relationships, and what people claim to want. You seem drawn to sincerity, but suspicious of performance, fantasy, and romantic clichés that collapse under real life.",
    howYouLikelyGotHere: [
      "You scored strongly on romantic and independent-style signals",
      "You often resisted crowd-approved answers when they felt socially scripted",
      "You tend to believe emotion matters, but you do not blindly trust cultural narratives about romance",
      "Your answers suggest both emotional sensitivity and critical distance",
    ],
    strengths: [
      "Good at distinguishing genuine feeling from empty romantic performance",
      "More likely to notice when people romanticize what they have not really examined",
      "Can value intimacy without surrendering critical judgment",
      "Often sees the emotional appeal of love while staying alert to illusion and self-deception",
    ],
    blindSpots: [
      "May become overly suspicious of shared ideals just because they are common",
      "Can under-trust stable or simple relationship models if they seem too conventional",
      "May overcorrect against naïveté and become guarded around sincere feeling",
      "Can mistake realism for emotional honesty even when it becomes defensive",
    ],
    socialFriction: [
      "May clash with both pure romantics and hard pragmatists",
      "Can frustrate users who want love to remain idealized and uncomplicated",
      "May be misunderstood by traditional or security-first types as emotionally inconsistent",
    ],
    whyThisMatters:
      "This archetype suggests you want love to be real, not just beautiful in theory. That can help you resist fake intimacy, social scripting, and surface-level chemistry that is not grounded in truth. In real life, this may shape how you judge attraction, commitment, emotional risk, and whether a relationship feels meaningful or merely well-packaged.",
    populationContextTemplate:
      "You're part of {percentage}% of users with this archetype. This type is most common among {top_group} and least common among {bottom_group}.",
    populationMock: {
      percentage: "~19",
      topGroup: "18–34 year-olds",
      bottomGroup: "55+ respondents",
    },
    reflectionPrompt:
      "When you question romantic stories, are you protecting yourself from illusion — or from vulnerability too?",
  },

  value_first: {
    name: "Value-First Thinker",
    shortTagline: "You interpret people through emotional truth, not just visible behavior.",
    plainEnglishMeaning:
      "You tend to believe that what matters most is not image, status, or social performance, but whether something feels emotionally true and humanly meaningful. You are more likely to prioritize inner values, emotional reality, and the quality of connection beneath the surface. You often read social questions less as systems and more as reflections of what people genuinely care about.",
    howYouLikelyGotHere: [
      "You scored strongly on emotionally aware signals",
      "You often chose answers centered on empathy, communication, and emotional meaning",
      "You tended to prioritize relational depth over purely strategic or external explanations",
      "Your answers suggest that human experience matters more to you than abstract optimization",
    ],
    strengths: [
      "Strong at recognizing emotional subtext and human nuance",
      "More likely to notice what is felt, not just what is visible",
      "Often values sincerity, care, and emotional intelligence in a grounded way",
      "Can resist flattening people into money, status, or simple incentives",
    ],
    blindSpots: [
      "May overread emotional depth into situations driven by habit, structure, or convenience",
      "Can underweight how strongly incentives and practical constraints shape behavior",
      "May expect too much emotional awareness from people who are operating more simply",
      "Can become frustrated when nuance is ignored, even in situations that reward clarity over depth",
    ],
    socialFriction: [
      "Often disagrees with strongly pragmatic or highly traditional users",
      "May feel others reduce people too quickly to incentives or roles",
      "Can be seen as overcomplicating questions others think are straightforward",
    ],
    whyThisMatters:
      "This archetype suggests you are trying to protect the human core of social life from becoming too mechanical. That can make you more perceptive about care, emotional mismatch, and hidden relational tensions. In real life, this may shape how you understand conflict, attraction, support, communication, and what makes someone feel genuinely seen.",
    populationContextTemplate:
      "You're part of {percentage}% of users with this archetype. This type is most common among {top_group} and least common among {bottom_group}.",
    populationMock: {
      percentage: "~16",
      topGroup: "women 18–44",
      bottomGroup: "men 45+",
    },
    reflectionPrompt:
      "Do you sometimes see emotional truth more clearly than others — or sometimes project it where it is not really driving the outcome?",
  },

  stability_seeker: {
    name: "Stability Seeker",
    shortTagline: "You trust what feels grounded, proven, and dependable.",
    plainEnglishMeaning:
      "You tend to prefer what is stable over what is uncertain, and what has held up over what is merely new. You are more likely to value structure, reliability, and social or relational durability, especially when the alternative feels unpredictable or fragile. You do not necessarily reject change, but you usually want strong foundations before you trust it.",
    howYouLikelyGotHere: [
      "You scored highly on traditionalist and security-focused signals",
      "You often favored dependable, tested, or lower-risk answers over novelty",
      "You were more likely to affirm structure, commitment, and stability as positive forces",
      "Conformist or majority-aligned answers often strengthened this archetype",
    ],
    strengths: [
      "Good at spotting instability before others take it seriously",
      "More likely to value long-term durability over short-term excitement",
      "Often sees the stabilizing value of structure, routine, and dependability",
      "Can bring caution and steadiness to questions others answer too casually",
    ],
    blindSpots: [
      "May overvalue safety and underweight freedom, experimentation, or growth",
      "Can mistake uncertainty for unsuitability too quickly",
      "May be too slow to accept that some old structures no longer fit modern life",
      "Can read social change as risk even when it reflects necessary adaptation",
    ],
    socialFriction: [
      "Often clashes with more progressive, independent, or romantic users",
      "May feel others are too casual about instability or too eager to discard old structures",
      "Can be seen as overly cautious or too attached to predictability",
    ],
    whyThisMatters:
      "This archetype suggests you think trust, commitment, and stability are not boring extras — they are the conditions that make everything else possible. That can help you see weakness in situations that look exciting but are poorly built. In real life, this may shape how you think about commitment, money, security, family roles, and what makes a life or relationship actually hold together.",
    populationContextTemplate:
      "You're part of {percentage}% of users with this archetype. This type is most common among {top_group} and least common among {bottom_group}.",
    populationMock: {
      percentage: "~14",
      topGroup: "35–54 year-olds",
      bottomGroup: "18–24 year-olds",
    },
    reflectionPrompt:
      "When you choose stability, are you preserving what matters — or resisting uncertainty more than necessary?",
  },

  modern_pragmatist: {
    name: "Modern Pragmatist",
    shortTagline: "You care less about ideology and more about what works in the world as it is.",
    plainEnglishMeaning:
      "You tend to believe that modern life should be judged by outcomes, not by slogans or inherited scripts alone. You are open to change, but you also want that change to function in reality. You often think in terms of fit, tradeoffs, and workable arrangements rather than romantic ideals, rigid tradition, or abstract moral posturing.",
    howYouLikelyGotHere: [
      "You scored highly on progressive and pragmatic signals",
      "You often supported newer social arrangements when they seemed more realistic or fair",
      "You tended to value flexibility and realism at the same time",
      "Your answers suggest you care more about what holds up in practice than what sounds pure in theory",
    ],
    strengths: [
      "Good at seeing through both empty idealism and outdated rigidity",
      "Often able to combine openness to change with realistic judgment",
      "More likely to notice whether a value system actually works under pressure",
      "Can think clearly about tradeoffs without becoming cynical",
    ],
    blindSpots: [
      "May underweight symbolism, emotion, or tradition when they still matter deeply to people",
      "Can become overly outcome-focused and dismiss values that are harder to quantify",
      "May treat practical success as the main test even in situations where meaning matters more",
      "Can sound sharper or colder than intended when cutting through social narratives",
    ],
    socialFriction: [
      "Often clashes with ideological purists, old-school traditionalists, or pure romantics",
      "May frustrate users who want values protected even when they are not efficient",
      "Can be seen as too utilitarian by more emotionally driven profiles",
    ],
    whyThisMatters:
      "This archetype suggests you are trying to navigate modern life without being trapped by either stale rules or empty rhetoric. That can make you especially good at identifying what is sustainable, flexible, and grounded in reality. In real life, this may shape how you think about relationships, fairness, compromise, social change, and the difference between what sounds right and what actually works.",
    populationContextTemplate:
      "You're part of {percentage}% of users with this archetype. This type is most common among {top_group} and least common among {bottom_group}.",
    populationMock: {
      percentage: "~21",
      topGroup: "25–44 year-olds",
      bottomGroup: "55+ respondents",
    },
    reflectionPrompt:
      "When you ask what works, do you also ask who it works for — and what gets lost along the way?",
  },

  social_realist: {
    name: "Social Realist",
    shortTagline: "You look at society without needing it to be prettier than it is.",
    plainEnglishMeaning:
      "You tend to approach social questions with a grounded, unsentimental lens. You are less driven by one dominant emotional or ideological style and more by a willingness to see tradeoffs, incentives, contradictions, and uncomfortable patterns as they are. You often resist idealized explanations, even when they are culturally appealing.",
    howYouLikelyGotHere: [
      "No single alternative archetype clearly dominated your signal pattern",
      "Your answers stayed grounded without clustering strongly into one worldview",
      "You often recognized constraints, tradeoffs, and social reality without leaning heavily romantic, idealistic, or traditional",
      "You won when balance, realism, and unsentimental pattern recognition mattered more than one signal style",
    ],
    strengths: [
      "Good at seeing complexity without forcing it into one ideological frame",
      "More likely to acknowledge contradictions that other users smooth over",
      "Often comfortable with ambiguity, tradeoffs, and imperfect social realities",
      "Can notice how people behave without needing their behavior to fit a moral story",
    ],
    blindSpots: [
      "May appear detached or overly unsentimental to more emotionally driven users",
      "Can underestimate the motivational power of ideals, identity, or emotional meaning",
      "May become too comfortable describing reality without asking whether it should change",
      "Can mistake distance for objectivity when every lens still has its own bias",
    ],
    socialFriction: [
      "Often clashes with both highly idealistic and highly sentimental users",
      "May frustrate people who want stronger moral clarity or a more emotionally affirming frame",
      "Can be seen as too cold by users who prioritize hope, care, or symbolic meaning",
    ],
    whyThisMatters:
      "This archetype suggests you are willing to face the social world without softening it too quickly. That can make you strong at spotting incentives, contradictions, and patterns other people avoid or romanticize. In real life, this may shape how you judge status, gender expectations, relationships, public opinion, and the difference between how society sounds and how it behaves.",
    populationContextTemplate:
      "You're part of {percentage}% of users with this archetype. This type is most common among {top_group} and least common among {bottom_group}.",
    populationMock: {
      percentage: "~18",
      topGroup: "men 25–44",
      bottomGroup: "18–24 year-olds",
    },
    reflectionPrompt:
      "When you insist on seeing society clearly, are you also leaving room for the possibility that people can become better than their patterns?",
  },
};

const LABEL_TO_KEY: Record<string, string> = {
  "Crowd Reader": "crowd_reader",
  "Romantic Skeptic": "romantic_skeptic",
  "Value-First Thinker": "value_first",
  "Stability Seeker": "stability_seeker",
  "Modern Pragmatist": "modern_pragmatist",
  "Social Realist": "social_realist",
};

export function getArchetypeContent(profileLabel: string | null | undefined): ArchetypeContent | null {
  if (!profileLabel) return null;
  const key = LABEL_TO_KEY[profileLabel];
  if (!key) return null;
  return ARCHETYPE_CONTENT[key] ?? null;
}

export function resolvePopulationContext(
  content: ArchetypeContent,
  stats?: { percentage: string; topGroup: string; bottomGroup: string }
): string {
  const values = stats ?? content.populationMock;
  return content.populationContextTemplate
    .replace("{percentage}", values.percentage)
    .replace("{top_group}", values.topGroup)
    .replace("{bottom_group}", values.bottomGroup);
}
