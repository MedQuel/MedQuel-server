import { config } from '../api/config';
import type { User, HomeData } from '../types/types';
import type { Badge, AnalyticsData } from '../types/types';
import type { LeaderboardResult, LeaderboardPeriod } from '../types/types';
import type { StudyPlan, Plan, InitiatePaymentResult } from '../types/types';
import type { ChatRoom, ChatMessage, GetChatMessagesResult } from '../types/types';
import type { FriendSummary, FriendRequest, PublicProfile, UserSearchResult } from '../types/types';
import type { Contest, ClientQuestion, StartQuizSessionResult, SubmitQuizSessionResult } from '../types/types';


export const mockDelay = (ms: number = config.mockDelayMs) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// -----> User <-----
export const MOCK_USER: User = {
  uid: 'mock-uid-001',
  displayName: 'Najiya Ansari',
  email: 'najiya.ansari@gmail.com',
  photoURL: undefined,
  role: 'student',
  describesYou: 'MBBS Student',
  targetExam: 'NEET-PG',
  studyLevel: 'MBBS Year 1-5',
  yearOfStudy: 'Year 3',
  specialties: [],
  institution: 'IIM, Dholakpur',
  isPremium: false,
  subscriptionId: null,
  xpPoints: 2847,
  epPoints: 3201,
  currentLevel: 12,
  currentStreak: 24,
  longestStreak: 24,
  lastActiveDate: new Date().toISOString(),
  totalQuestions: 719,
  totalCorrect: 517,
  studyHours: 172.0,
  stats: {
    contestsPlayed: 18,
    contests90Plus: 4,
    hardContestsDone: 6,
    perfectQuizzes: 9,
    fastCompletions: 12,
    top3Finishes: 2,
    subjects70Plus: 3,
  },
  badges: ['streak_30', 'study_100', 'speed_5', 'questions_500'],
  notifPrefs: { pushEnabled: true, emailDigest: false, rankAlerts: true, contestReminders: true, achievementAlerts: true },
  quizPrefs: { timerSound: true, autoSubmit: false, defaultDifficulty: 'medium' },
  contentScope: 'focused',
  focusSubjects: ['Surgery', 'Anatomy', 'Pharmacology'],
  createdAt: '2026-01-12T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
};


// -----> Friends <-----
export const MOCK_FRIENDS: FriendSummary[] = [
  {
    uid: 'user-2',
    displayName: 'Swapnil Sharma',
    photoURL: undefined,
    currentLevel: 9,
    currentStreak: 14,
    epPoints: 2680,
    headToHead: { wins: 3, losses: 1 },
    addedAt: new Date(Date.now() - 20*86400000).toISOString(),
  },
  {
    uid: 'user-5',
    displayName: 'Issac Newton',
    photoURL: undefined,
    currentLevel: 15,
    currentStreak: 41,
    epPoints: 4120,
    headToHead: { wins: 1, losses: 4 },
    addedAt: new Date(Date.now() - 5*86400000).toISOString(),
  },
];

export const MOCK_PENDING_FRIEND_REQUESTS: FriendRequest[] = [
  {
    requestId: 'user-7_mock-uid-001',
    fromUid: 'user-7',
    toUid: MOCK_USER.uid,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    respondedAt: null,
  },
];

export function buildMockFriendRequest(toUid: string): FriendRequest {
  return {
    requestId: `${MOCK_USER.uid}_${toUid}`,
    fromUid: MOCK_USER.uid,
    toUid,
    status: 'pending',
    createdAt: new Date().toISOString(),
    respondedAt: null,
  };
}

export function buildMockPublicProfile(uid: string): PublicProfile {
  return {
    uid,
    displayName: 'Issac Newton',
    photoURL: undefined,
    targetExam: 'NEET-PG',
    studyLevel: 'MBBS Year 1-5',
    specialties: [],
    currentLevel: 10,
    xpPoints: 2450,
    epPoints: 2890,
    currentStreak: 18,
    longestStreak: 22,
    badges: ['streak_30'],
    relationshipStatus: 'NONE',
    headToHead: null,
    comparison: {
      xpDelta: MOCK_USER.xpPoints - 2450,
      epDelta: MOCK_USER.epPoints - 2890,
      streakDelta: MOCK_USER.currentStreak - 18,
      levelDelta: MOCK_USER.currentLevel - 10,
    },
  };
}

export function buildMockSearchResults(query: string): UserSearchResult[] {
  return MOCK_LEADERBOARD_NAMES.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase())
  ).map((name, i) => ({
    uid: `user-${i+1}`,
    displayName: name,
    photoURL: undefined,
    targetExam: 'NEET-PG' as const,
    relationshipStatus: 'NONE' as const,
  }));
}


// -----> Questions / quiz sessions <-----
const MOCK_QUESTIONS: ClientQuestion[] = [
  {
    questionId: 'q-001',
    questionText: 'A 45-year-old man presents with sudden severe abdominal pain radiating to the back. Which enzyme is most specific for diagnosis?',
    optionA: 'Serum amylase',
    optionB: 'Serum lipase',
    optionC: 'ALT',
    optionD: 'Alkaline phosphatase',
    imageUrl: null,
    questionType: 'mcq',
    difficulty: 'medium',
    subject: 'Surgery',
    topic: 'Acute Abdomen',
    marks: 4,
  },
  {
    questionId: 'q-002',
    questionText: 'Which incision is preferred for an emergency appendectomy with diffuse peritonitis?',
    optionA: 'McBurney incision',
    optionB: 'Lanz incision',
    optionC: 'Midline laparotomy',
    optionD: 'Pfannenstiel incision',
    imageUrl: null,
    questionType: 'mcq',
    difficulty: 'easy',
    subject: 'Surgery',
    topic: 'Acute Abdomen',
    marks: 4,
  },
  {
    questionId: 'q-003',
    questionText: 'Wound healing by secondary intention differs from primary intention primarily in:',
    optionA: 'Presence of granulation tissue',
    optionB: 'Time to epithelialization only',
    optionC: 'Use of sutures',
    optionD: 'Scar pigmentation',
    imageUrl: null,
    questionType: 'mcq',
    difficulty: 'easy',
    subject: 'Surgery',
    topic: 'Wound Management',
    marks: 4,
  },
];

export function buildMockQuizSession(questionCount = 3): StartQuizSessionResult {
  return {
    sessionId: `mock-session-${Date.now()}`,
    quizType: 'practice',
    subject: 'Surgery',
    difficulty: 'medium',
    topic: null,
    timeLimitSecs: questionCount * 20,
    totalQuestions: questionCount,
    questions: MOCK_QUESTIONS.slice(0, questionCount),
    startedAt: new Date().toISOString(),
  };
}

export function buildMockSubmitResult(sessionId: string): SubmitQuizSessionResult {
  return {
    sessionId,
    totalQuestions: 3,
    correctCount: 2,
    wrongCount: 1,
    skippedCount: 0,
    score: 7,
    scorePercent: 66.7,
    timeTaken: 145,
    epEarned: 30,
    xpEarned: 45,
    updatedXpPoints: MOCK_USER.xpPoints + 45,
    updatedEpPoints: MOCK_USER.epPoints + 30,
    updatedCurrentLevel: MOCK_USER.currentLevel,
    updatedCurrentStreak: MOCK_USER.currentStreak + 1,
    leveledUp: false,
    isNewLongestStreak: false,
    results: MOCK_QUESTIONS.map((q, i) => ({
      questionId: q.questionId,
      selectedOption: i === 1 ? 'A' : 'B',
      correctAnswer: 'B',
      isCorrect: i !== 1,
      explanation: 'Serum lipase remains elevated longer and is more specific for pancreatic injury than amylase.',
    })),
  };
}


// -----> Contests <-----
export const MOCK_CONTESTS: Contest[] = [
  {
    contestId: 'contest-004',
    title: 'Grand Medical Championship',
    subject: 'Medicine',
    topics: ['Mixed'],
    contestType: 'weekly',
    difficulty: 'hard',
    isPremium: true,
    totalQuestions: 40,
    timeLimitSecs: 3600,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    epReward: 250,
    passPercent: 70,
    recommendedLevel: null,
    status: 'active',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now()+6 * 86400000).toISOString(),
    participantCount: 512,
  },
  {
    contestId: 'contest-001',
    title: 'Cardiology Sprint',
    subject: 'Cardiology',
    topics: ['ECG Interpretation', 'Heart Failure'],
    contestType: 'daily',
    difficulty: 'medium',
    isPremium: false,
    totalQuestions: 15,
    timeLimitSecs: 900,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    epReward: 60,
    passPercent: 70,
    recommendedLevel: 'Year 4+ MBBS',
    status: 'active',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 86400000).toISOString(),
    participantCount: 312,
  },
  {
    contestId: 'contest-002',
    title: 'Surgery Case Studies',
    subject: 'Surgery',
    topics: ['Acute Abdomen', 'Trauma'],
    contestType: 'weekly',
    difficulty: 'hard',
    isPremium: true,
    totalQuestions: 25,
    timeLimitSecs: 1800,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    epReward: 120,
    passPercent: 70,
    recommendedLevel: 'Postgraduate',
    status: 'active',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 5*86400000).toISOString(),
    participantCount: 98,
  },
  {
    contestId: 'contest-003',
    title: 'Pharmacology Basics',
    subject: 'Pharmacology',
    topics: ['Autonomic Drugs'],
    contestType: 'daily',
    difficulty: 'easy',
    isPremium: false,
    totalQuestions: 10,
    timeLimitSecs: 600,
    markingScheme: { correct: 4, wrong: -1, skipped: 0 },
    epReward: 40,
    passPercent: 60,
    recommendedLevel: 'MBBS Year 1-5',
    status: 'scheduled',
    startsAt: new Date(Date.now() + 3600000).toISOString(),
    endsAt: new Date(Date.now() + 90000000).toISOString(),
    participantCount: 0,
  },
];


// -----> Leaderboard <-----
const MOCK_LEADERBOARD_NAMES = [
  'Rahul Verma',
  'Sneha Patil',
  'Imran Sheikh',
  'Divya Nair',
  'Karan Mehta',
  'Fatima Ali',
  'Arjun Rao',
  'Priya Singh',
  'Vikram Joshi',
  'Neha Gupta',
] as const;
const MOCK_LEADERBOARD_SPECIALIZATIONS = [
  'Anatomy',
  'Surgery',
  'Pediatrics',
  'Pharmacology',
  'Medicine',
] as const;

function cycleLookup<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length] as T;
}

export function buildMockFriendsLeaderboard(period: LeaderboardPeriod): LeaderboardResult {
  const entries = MOCK_FRIENDS
    .map((f) => ({
      userId: f.uid,
      displayName: f.displayName,
      photoURL: f.photoURL ?? undefined,
      specialization: 'Medicine',
      epPoints: f.epPoints,
      rank: 0,
      prevRank: 0,
      weeklyChange: 0,
      updatedAt: new Date().toISOString(),
    }))
    .concat([{
      userId: MOCK_USER.uid,
      displayName: MOCK_USER.displayName,
      photoURL: undefined,
      specialization: 'Anatomy',
      epPoints: MOCK_USER.epPoints,
      rank: 0,
      prevRank: 0,
      weeklyChange: 0,
      updatedAt: new Date().toISOString(),
    }])
    .sort((a, b) => b.epPoints - a.epPoints)
    .map((entry, index) => ({ ...entry, rank: index+1 }));

  const myEntry = entries.find((e) => e.userId === MOCK_USER.uid) ?? null;

  return {
    period,
    periodKey: period === 'weekly' ? 'weekly_2026-W32' : 'allTime',
    entries,
    myEntry,
    myRank: myEntry?.rank ?? null,
  };
}

export const MOCK_LEADERBOARD: LeaderboardResult = {
  period: 'weekly',
  periodKey: 'weekly_2026-W32',
  entries: Array.from({ length: 10 }, (_, i) => ({
    userId: `user-${i+1}`,
    displayName: cycleLookup(MOCK_LEADERBOARD_NAMES, i),
    photoURL: undefined,
    specialization: cycleLookup(MOCK_LEADERBOARD_SPECIALIZATIONS, i),
    epPoints: 3150 - i*180,
    rank: i+1,
    prevRank: i+2,
    weeklyChange: 180,
    updatedAt: new Date().toISOString(),
  })),
  myEntry: {
    userId: MOCK_USER.uid,
    displayName: MOCK_USER.displayName,
    photoURL: undefined,
    specialization: 'Surgery',
    epPoints: MOCK_USER.epPoints,
    rank: 0,
    prevRank: 0,
    weeklyChange: 5,
    updatedAt: new Date().toISOString(),
  },
  myRank: 47,
};


// -----> Study plan <-----
export const MOCK_STUDY_PLAN: StudyPlan = {
  userId: MOCK_USER.uid,
  targetExam: 'NEET-PG',
  examDate: '2027-05-03T00:00:00.000Z',
  preparationPercent: 38,
  weeklyEpTarget: 3150,
  currentWeekProgress: { daysCompleted: 2, totalDays: 7 },
  generatedBy: 'ai',
  sessions: [
    {
      sessionId: 'sp-1',
      subject: 'Surgery',
      topic: 'Acute Abdomen',
      questionCount: 20,
      scheduledTime: '07:30',
      scheduledDate: new Date().toISOString().slice(0, 10),
      epReward: 40,
      status: 'completed',
    },
    {
      sessionId: 'sp-2',
      subject: 'Pharmacology',
      topic: 'Autonomic Drugs',
      questionCount: 15,
      scheduledTime: '20:00',
      scheduledDate: new Date().toISOString().slice(0, 10),
      epReward: 30,
      status: 'pending',
    },
    {
      sessionId: 'sp-3',
      subject: 'Cardiology',
      topic: 'ECG Interpretation',
      questionCount: 20,
      scheduledTime: '07:30',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      epReward: 40,
      status: 'pending',
    },
  ],
};


// -----> Chat <-----
export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    roomId: 'cardiology-discussion',
    name: 'Cardiology Discussion',
    subject: 'Cardiology',
    iconColor: '#E5484D',
    memberCount: 412,
    lastMessage: 'Anyone have notes on Wolff-Parkinson-White?',
    lastMessageAt: new Date(Date.now() - 600000).toISOString(),
    isActive: true,
  },
  {
    roomId: 'surgery-discussion',
    name: 'Surgery Discussion',
    subject: 'Surgery',
    iconColor: '#2F80ED',
    memberCount: 287,
    lastMessage: 'Lanz vs McBurney — which is favoured now?',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    isActive: true,
  },
  {
    roomId: 'pharm-discussion',
    name: 'Pharmacology Discussion',
    subject: 'Pharmacology',
    iconColor: '#27AE60',
    memberCount: 198,
    lastMessage: 'Atropine dosing in OP poisoning?',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    isActive: true,
  },
];

const MOCK_MESSAGES_BY_ROOM: Record<string, ChatMessage[]> = {
  'cardiology-discussion': [
    {
      messageId: 'm1',
      roomId: 'cardiology-discussion',
      userId: 'user-2',
      displayName: 'Sneha Patil',
      text: 'Anyone have notes on Wolff-Parkinson-White?',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      isEdited: false,
    },
    {
      messageId: 'm2',
      roomId: 'cardiology-discussion',
      userId: MOCK_USER.uid,
      displayName: MOCK_USER.displayName,
      text: 'I have a summary, sharing in a bit!',
      createdAt: new Date(Date.now() - 540000).toISOString(),
      isEdited: false,
    },
  ],
};

export function getMockChatMessages(roomId: string): GetChatMessagesResult {
  return { messages: MOCK_MESSAGES_BY_ROOM[roomId] ?? [], nextCursor: null };
}


// -----> Achievements <-----
export const MOCK_ACHIEVEMENTS: Badge[] = [
   {
    badgeId: 'streak_30',
    name: 'Monthly Master',
    description: 'Study for 30 consecutive days',
    iconKey: 'flame',
    variant: 'red',
    rarity: 'Rare',
    category: 'streak',
    requirementValue: 30,
    currentProgress: 24,
    status: 'in_progress',
  },
  {
    badgeId: 'questions_500',
    name: 'Knowledge Seeker',
    description: 'Solve 500 questions',
    iconKey: 'brain',
    variant: 'purple',
    rarity: 'Rare',
    category: 'questions',
    requirementValue: 500,
    currentProgress: 500,
    status: 'earned',
    earnedAt: '2026-04-02T10:00:00.000Z',
  },
  {
    badgeId: 'speed_20',
    name: 'Speed Demon',
    description: 'Finish 20 quizzes in half the time',
    iconKey: 'zap',
    variant: 'blue',
    rarity: 'Rare',
    category: 'speed',
    requirementValue: 20,
    currentProgress: 5,
    status: 'in_progress',
  },
  {
    badgeId: 'study_100',
    name: 'Consistent',
    description: 'Accumulate 100 study hours',
    iconKey: 'clock',
    variant: 'green',
    rarity: 'Epic',
    category: 'study',
    requirementValue: 100,
    currentProgress: 63.5,
    status: 'in_progress',
  },
];


// -----> Home / Analytics <-----
export const MOCK_HOME_DATA: HomeData = {
  dailyChallenge: {
    date: new Date().toISOString().slice(0, 10),
    contestId: 'contest-001',
    subject: 'Cardiology',
    epReward: 60,
    expiresAt: new Date(Date.now() + 43200000).toISOString(),
  },
  activeContests: MOCK_CONTESTS.filter((c) => c.status === 'active'),
  performanceTrend: Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6-i) * 86400000).toISOString().slice(0, 10);
    if (i === 2) return { date, accuracy: null };
    if (i === 4) return { date, accuracy: 0 };
    return { date, accuracy: 55 + i*3 };
  }),
};

export const MOCK_ANALYTICS: AnalyticsData = {
  overallAccuracy: 70.2,
  avgScore: 68.4,
  bestSubject: 'Surgery',
  weakSubject: 'Pharmacology',
  heatmap: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13-i) * 86400000).toISOString().slice(0, 10),
    questionsAttempted: Math.floor(Math.random() * 30),
    minutesStudied: Math.floor(Math.random() * 90),
  })),
  subjectPerformance: [
    { subject: 'Surgery', accuracy: 70, totalAttempted: 240, totalCorrect: 168 },
    { subject: 'Cardiology', accuracy: 64, totalAttempted: 180, totalCorrect: 115 },
    { subject: 'Pharmacology', accuracy: 58, totalAttempted: 150, totalCorrect: 87 },
  ],
  recentAttempts: [
    {
      sessionId: 'mock-session-1',
      subject: 'Surgery',
      quizType: 'practice',
      scorePercent: 80,
      correctCount: 12,
      totalQuestions: 15,
      timeTaken: 640,
      passed: true,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      sessionId: 'mock-session-2',
      subject: 'Cardiology',
      quizType: 'contest',
      scorePercent: 65,
      correctCount: 13,
      totalQuestions: 20,
      timeTaken: 890,
      passed: false,
      completedAt: new Date(Date.now()-2 * 86400000).toISOString(),
    },
  ],
};


// -----> Subscriptions <-----
export const MOCK_PLANS: Plan[] = [
  {
    planId: 'plan-free',
    name: 'Free',
    duration: 'forever',
    price: 0,
    currency: 'INR',
    features: ['Daily challenge', 'Basic analytics'],
    epMultiplier: 1,
    isActive: true,
  },
  {
    planId: 'plan-monthly',
    name: 'Premium Monthly',
    duration: '1 month',
    price: 149,
    currency: 'INR',
    features: ['All contests', 'AI study plan', '2x EP'],
    epMultiplier: 2,
    isActive: true,
  },
  {
    planId: 'plan-annual',
    name: 'Premium Annual',
    duration: '12 months',
    price: 1499,
    currency: 'INR',
    features: ['All contests', 'AI study plan', '2x EP', 'Priority support'],
    epMultiplier: 2,
    isActive: true,
  },
];

export function buildMockInitiatePayment(): InitiatePaymentResult {
  return {
    razorpayOrderId: `mock-order-${Date.now()}`,
    razorpayKeyId: 'rzp_test_mock',
    amount: 149900,
    currency: 'INR',
  };
}
