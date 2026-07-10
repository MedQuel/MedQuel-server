export type TargetExam =
  | 'USMLE'
  | 'NEET-PG'
  | 'INI-CET'
  | 'PLAB'
  | 'MRCP'
  | 'FMGE'
  | 'Clinical Mastery';
export type StudyLevel =
  | 'MBBS Year 1-5'
  | 'Postgraduate'
  | 'Practitioner'
  | 'Nursing / Allied';
export type YearOfStudy =
  | 'Year 1'
  | 'Year 2'
  | 'Year 3'
  | 'Year 4'
  | 'Final Year'
  | 'Intern';
export type DescribesYou =
  | 'MBBS Student'
  | 'Postgraduate'
  | 'Practicing Doctor'
  | 'Nursing / Allied';
export type UserRole = 'student' | 'admin' | 'reviewer';
export type Difficulty = 'easy' | 'medium' | 'hard';


// -----> User
export interface NotifPrefs {
  pushEnabled: boolean;
  emailDigest: boolean;
  rankAlerts: boolean;
  contestReminders: boolean;
}
export interface QuizPrefs {
  defaultDifficulty: Difficulty;
  timerSound: boolean;
  autoSubmit: boolean;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  targetExam: TargetExam;
  studyLevel: StudyLevel;
  yearOfStudy?: YearOfStudy | null;
  institution?: string;
  isPremium: boolean;
  subscriptionId?: string | null;
  xpPoints: number;
  epPoints: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date string
  totalQuestions: number;
  totalCorrect: number;
  studyHours: number;
  badges: string[];
  badgeProgress: Record<string, number>;
  notifPrefs: NotifPrefs;
  quizPrefs: QuizPrefs;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteOnboardingInput {
  displayName: string;
  describesYou: DescribesYou;
  yearOfStudy?: YearOfStudy;
  targetExam: TargetExam;
  institution?: string;
}
export interface CompleteOnboardingResult {
  displayName: string;
  describesYou: DescribesYou;
  yearOfStudy?: YearOfStudy | null;
  targetExam: TargetExam;
  institution?: string | null;
}
export interface UpdateProfileInput {
  displayName?: string;
  photoURL?: string;
  targetExam?: TargetExam;
  studyLevel?: StudyLevel;
  yearOfStudy?: YearOfStudy;
  institution?: string;
}


// -----> Questions (correct_answer NEVER included)
export type QuestionType =
  | 'mcq'
  | 'assertion_reason'
  | 'match'
  | 'image_based'
  | 'clinical';

export interface ClientQuestion {
  questionId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  imageUrl?: string | null;
  questionType: QuestionType;
  difficulty: Difficulty;
  subject: string;
  topic: string;
  marks: number;
}
export type SelectedOption = 'A' | 'B' | 'C' | 'D' | 'SKIPPED';


// -----> Quiz sessions
export type QuizType = 'daily' | 'contest' | 'practice' | 'subject';
export type QuizSessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface QuizSession {
  sessionId: string;
  userId: string;
  contestId?: string | null;
  quizType: QuizType;
  subject: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  scorePercent: number;
  epEarned: number;
  xpEarned: number;
  timeTaken: number;
  status: QuizSessionStatus;
  startedAt: string;
  completedAt?: string | null;
}

export interface StartQuizSessionInput {
  contestId?: string;
  subject: string;
  difficulty: Difficulty;
  questionCount: number;
}
export interface StartQuizSessionResult {
  sessionId: string;
  questions: ClientQuestion[];
  timeLimitSecs: number;
}

export interface SubmittedAnswer {
  questionId: string;
  selected: SelectedOption;
  timeSpent: number;
}
export interface GradedAnswer extends SubmittedAnswer {
  isCorrect: boolean;
  correctAnswer: SelectedOption;
  explanation: string;
}

export interface SubmitQuizSessionInput {
  sessionId: string;
  answers: SubmittedAnswer[];
}
export interface SubmitQuizSessionResult {
  session: QuizSession;
  gradedAnswers: GradedAnswer[];
  newStreak: number;
  newXpTotal: number;
  newEpTotal: number;
  badgesUnlocked: string[];
}


// -----> Contests
export type ContestType = 'daily' | 'weekly' | 'live' | 'premium';
export type ContestStatus = 'draft' | 'scheduled' | 'active' | 'completed';
export interface MarkingScheme {
  correct: number;
  wrong: number;
  skipped: number;
}

export interface Contest {
  contestId: string;
  title: string;
  subject: string;
  topics: string[];
  contestType: ContestType;
  difficulty: Difficulty;
  isPremium: boolean;
  totalQuestions: number;
  timeLimitSecs: number;
  markingScheme: MarkingScheme;
  epReward: number;
  passPercent: number;
  recommendedLevel: string;
  status: ContestStatus;
  startsAt: string;
  endsAt: string;
  participantCount: number;
}

export interface ContestLeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
  completedAt: string;
}
export interface GetContestsFilter {
  type?: ContestType;
  subject?: string;
  difficulty?: Difficulty;
  cursor?: string;
  limit?: number;
}


// -----> Leaderboard
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'allTime';
export type LeaderboardScope = 'global' | 'friends';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  specialization: string;
  epPoints: number;
  rank: number;
  prevRank: number;
  weeklyChange: number;
}

export interface LeaderboardResult {
  period: LeaderboardPeriod;
  scope: LeaderboardScope;
  entries: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
}


// -----> Study plan
export type StudyPlanSessionStatus = 'pending' | 'completed' | 'skipped';

export interface StudyPlanSessionItem {
  sessionId: string;
  subject: string;
  topic: string;
  contestId?: string;
  questionCount: number;
  scheduledTime: string; // "HH:MM"
  scheduledDate: string; // "YYYY-MM-DD"
  epReward: number;
  status: StudyPlanSessionStatus;
}

export interface StudyPlan {
  userId: string;
  targetExam: TargetExam;
  examDate: string;
  preparationPercent: number;
  weeklyEpTarget: number;
  currentWeekProgress: { daysCompleted: number; totalDays: number };
  sessions: StudyPlanSessionItem[];
  generatedBy: 'ai' | 'manual';
}

export interface GenerateStudyPlanInput {
  examDate: string;
  weakSubjects?: string[];
  hoursPerDay?: number;
}


// -----> Chat
export interface ChatRoom {
  roomId: string;
  name: string;
  subject: string;
  iconColor: string;
  memberCount: number;
  lastMessage: string;
  lastMessageAt: string;
  isActive: boolean;
}

export interface ChatMessage {
  messageId: string;
  roomId: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  text: string;
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
}

export interface GetChatMessagesResult {
  messages: ChatMessage[];
  nextCursor: string | null;
}


// -----> Achievements
export type BadgeTier = 'gold' | 'silver' | 'bronze';
export type BadgeStatus = 'earned' | 'in_progress' | 'locked';

export interface Badge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  requirementValue: number;
  currentProgress: number;
  status: BadgeStatus;
  earnedAt?: string;
}


// -----> Subscriptions
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface Plan {
  planId: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  features: string[];
  epMultiplier: number;
  isActive: boolean;
}
export interface Subscription {
  subscriptionId: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string;
  autoRenew: boolean;
}

export interface InitiatePaymentInput {
  planId: string;
}
export interface InitiatePaymentResult {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
}
export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}


// -----> Notifications
export interface AppNotification {
  notifId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}


// -----> Home / Analytics
export interface DailyChallenge {
  date: string;
  contestId: string;
  subject: string;
  epReward: number;
  expiresAt: string;
}

export interface SubjectGridItem {
  subject: string;
  accuracy: number;
  totalAttempted: number;
}

export interface PerformancePoint {
  date: string;
  accuracy: number;
}

export interface HomeData {
  dailyChallenge: DailyChallenge | null;
  activeContests: Contest[];
  subjectGrid: SubjectGridItem[];
  performanceTrend: PerformancePoint[];
}

export interface SubjectPerformanceEntry {
  subject: string;
  accuracy: number;
  totalAttempted: number;
  totalCorrect: number;
}

export interface ActivityLogEntry {
  date: string; // YYYY-MM-DD
  questionsAttempted: number;
  minutesStudied: number;
}

export interface QuizSessionSummary {
  sessionId: string;
  subject: string;
  scorePercent: number;
  completedAt: string;
}

export interface AnalyticsData {
  overallAccuracy: number;
  heatmap: ActivityLogEntry[];
  subjectPerformance: SubjectPerformanceEntry[];
  recentAttempts: QuizSessionSummary[];
}
