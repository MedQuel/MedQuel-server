export type TargetExam = 'USMLE' | 'NEET-PG' | 'INI-CET' | 'PLAB' | 'MRCP' | 'FMGE' | 'DM' | 'MCH' | 'Fellowship Exams' | 'Clinical Mastery';
export type StudyLevel = 'MBBS Year 1-5' | 'Postgraduate' | 'Practitioner' | 'Nursing / Allied';
export type YearOfStudy = 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4' | 'Final Year' | 'Intern';
export type DescribesYou = 'MBBS Student' | 'Postgraduate' | 'Practicing Doctor' | 'Nursing / Allied';
export type ContentScope = 'all' | 'focused';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';
export type FriendRelationshipStatus = 'NONE' | 'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'SELF';

export type BadgeVariant = 'gold' | 'red' | 'purple' | 'blue' | 'green';
export type BadgeRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type BadgeStatus = 'earned' | 'in_progress' | 'locked';

export type UserRole = 'student' | 'admin' | 'reviewer';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type Specialty =
  | 'Anatomy' | 'Biochemistry' | 'Physiology' | 'Microbiology' | 'Pharmacology'
  | 'Forensic Medicine' | 'Pathology' | 'Ophthalmology' | 'ENT' | 'Community Medicine'
  | 'Medicine' | 'Surgery' | 'Pediatrics' | 'Gynaecology & Obstetrics'
  | 'Orthopedics' | 'Dermatology' | 'Psychiatry' | 'Anesthesia' | 'Radiology';


// -----> User
export interface NotifPrefs {
  pushEnabled: boolean;
  emailDigest: boolean;
  rankAlerts: boolean;
  contestReminders: boolean;
  achievementAlerts: boolean;
}
export interface QuizPrefs {
  defaultDifficulty: Difficulty;
  timerSound: boolean;
  autoSubmit: boolean;
}
export interface UserStats {
  contestsPlayed: number;
  contests90Plus: number;
  hardContestsDone: number;
  perfectQuizzes: number;
  fastCompletions: number;
  top3Finishes: number;
  subjects70Plus: number;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  describesYou: DescribesYou;
  targetExam: TargetExam;
  studyLevel: StudyLevel;
  yearOfStudy?: YearOfStudy | null;
  specialties: Specialty[];
  institution?: string;
  isPremium: boolean;
  subscriptionId?: string | null;
  xpPoints: number;
  epPoints: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalQuestions: number;
  totalCorrect: number;
  studyHours: number;
  stats: UserStats;
  badges: string[];
  notifPrefs: NotifPrefs;
  quizPrefs: QuizPrefs;
  contentScope: ContentScope;
  focusSubjects: Specialty[];
  createdAt: string;
  updatedAt: string;
}

export interface CompleteOnboardingInput {
  displayName: string;
  describesYou: DescribesYou;
  yearOfStudy?: YearOfStudy;
  specialties?: Specialty[];
  targetExam: TargetExam;
  institution?: string;
  contentScope: ContentScope;
  focusSubjects?: Specialty[];
}
export interface CompleteOnboardingResult {
  displayName: string;
  describesYou: DescribesYou;
  yearOfStudy?: YearOfStudy | null;
  specialties: Specialty[];
  targetExam: TargetExam;
  institution?: string | null;
  contentScope: ContentScope;
  focusSubjects: Specialty[];
}
export interface UpdateProfileInput {
  displayName?: string;
  photoURL?: string | null;
  describesYou?: DescribesYou;
  yearOfStudy?: YearOfStudy;
  specialties?: Specialty[];
  targetExam?: TargetExam;
  institution?: string;
  contentScope?: ContentScope;
  focusSubjects?: Specialty[];
}


// -----> Friends
export interface FriendRequest {
  requestId: string;
  fromUid: string;
  toUid: string;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt: string | null;
}

export interface HeadToHead {
  wins: number;
  losses: number;
}
export interface FriendSummary {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  currentLevel: number;
  currentStreak: number;
  epPoints: number;
  headToHead: HeadToHead;
  addedAt: string;
}

export interface ProfileComparison {
  xpDelta: number;
  epDelta: number;
  streakDelta: number;
  levelDelta: number;
}
export interface PublicProfile {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  targetExam: TargetExam;
  studyLevel: StudyLevel;
  specialties: Specialty[];
  currentLevel: number;
  xpPoints: number;
  epPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  studyHours: number;
  quizzesCompleted: number;
  badges: string[];
  friends: FriendSummary[];
  relationshipStatus: FriendRelationshipStatus;
  headToHead: HeadToHead | null;
  comparison: ProfileComparison;
}

export interface UserSearchResult {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  targetExam: TargetExam;
  relationshipStatus: FriendRelationshipStatus;
}


// -----> Questions
export type QuestionType = 'mcq' | 'assertion_reason' | 'match' | 'image_based' | 'clinical';

export interface ClientQuestion {
  questionId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  imageUrl?: string | null;
  questionType: QuestionType;
  marks: number;
  difficulty: Difficulty;
  subject?: string;
  topic?: string;
}
export type SelectedOption = 'A' | 'B' | 'C' | 'D' | 'SKIPPED';
export type WireSelectedOption = 'A' | 'B' | 'C' | 'D' | null;


// -----> Quiz sessions
export type QuizType = 'daily' | 'contest' | 'practice' | 'subject' | 'challenge';
export type QuizSessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface QuizSession {
  sessionId: string;
  userId: string;
  contestId?: string | null;
  challengeId?: string | null;
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
  quizType: 'practice' | 'subject' | 'challenge';
  subject?: string;
  topic?: string;
  difficulty?: Difficulty;
  questionCount?: number;
  timeLimitSecs?: number;
  challengeId?: string;
}
export interface StartQuizSessionResult {
  sessionId: string;
  quizType: QuizType;
  subject: string;
  difficulty: Difficulty;
  topic?: string | null;
  timeLimitSecs: number | null;
  totalQuestions: number;
  questions: ClientQuestion[];
  startedAt: string;
}

export interface SubmittedAnswer {
  questionId: string;
  selectedOption: WireSelectedOption;
}
export interface GradedAnswer {
  questionId: string;
  selectedOption: WireSelectedOption;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  explanation: string;
}

export interface SubmitQuizSessionInput {
  sessionId: string;
  answers: SubmittedAnswer[];
}
export interface SubmitQuizSessionResult {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  scorePercent: number;
  timeTaken: number;
  epEarned: number;
  xpEarned: number;
  updatedXpPoints: number;
  updatedEpPoints: number;
  updatedCurrentLevel: number;
  updatedCurrentStreak: number;
  leveledUp: boolean;
  isNewLongestStreak: boolean;
  results: GradedAnswer[];
  challengeId: string | null;
  challengeStatus: ChallengeStatus | null;
  challengeWinnerUid: string | null;
}


// -----> Contests
export type ContestType = 'daily' | 'live' | 'contest' | 'weekly';
export type ContestStatus = 'draft' | 'scheduled' | 'active' | 'completed';
export interface MarkingScheme {
  correct: number;
  wrong: number;
  skipped: number;
}
export interface ContestPerformer {
  userId: string;
  displayName: string;
  photoURL?: string | null;
  score: number;
  rank: number;
  completedAt: string;
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
  recommendedLevel: string | null;
  status: ContestStatus;
  startsAt: string;
  endsAt: string;
  participantCount: number;
  topPerformers?: ContestPerformer[];
}

export interface ContestLeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
  completedAt: string;
}
export interface GetContestsFilter {
  status?: ContestStatus;
  contestType?: ContestType;
  subject?: string;
  difficulty?: Difficulty;
  isPremium?: boolean;
  cursor?: string;
  limit?: number;
  personalized?: boolean;
}

export interface GetContestsResult {
  contests: Contest[];
  nextCursor: string | null;
}


// -----> Challenges
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'declined' | 'expired' | 'cancelled';
export type ParticipantResponseStatus = 'invited' | 'accepted' | 'declined';

export interface ParticipantState {
  uid: string;
  status: ParticipantResponseStatus;
  respondedAt: string | null;
  score: number | null;
  correctCount: number | null;
  quizSessionId: string | null;
  completedAt: string | null;
}
export interface ChallengeRewards {
  winnerEp: number;
  participationEp: number;
}

export interface Challenge {
  challengeId: string;
  createdBy: string;
  participants: string[];
  participantStates: ParticipantState[];
  subject: string;
  difficulty: Difficulty;
  questionCount: number;
  timeLimitSecs: number;
  status: ChallengeStatus;
  winnerUid: string | null;
  rewards: ChallengeRewards;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChallengeInput {
  toUid: string;
  subject: string;
  difficulty: Difficulty;
  questionCount: number;
  timeLimitSecs?: number;
}
export interface GetChallengesFilter {
  status?: ChallengeStatus;
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
  updatedAt: string;
}

export interface LeaderboardResult {
  period: LeaderboardPeriod;
  periodKey: string;
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  myRank: number | null;
}


// -----> Study plan
export type StudyPlanSessionType = 'quiz' | 'read';
export type StudyPlanSessionStatus = 'pending' | 'completed' | 'skipped';
export type DailyCommitment = 'light' | 'moderate' | 'intense';
export type StudyPlanWeekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface StudyPlanSession {
  sessionId: string;
  sessionType: StudyPlanSessionType;
  subject: string;
  topic: string;
  scheduledDate: string;
  status: StudyPlanSessionStatus;
  xpReward: number;
  completedAt: string | null;
  questionCount?: number | null;
  difficulty?: Difficulty | null;
  linkedQuizSessionId?: string | null;
  title?: string | null;
  content?: string | null;
  disclaimer?: string | null;
  estimatedMinutes?: number | null;
}
export interface StudyPlanMilestone {
  label: string;
  phase: string;
  description: string;
  startWeek: number;
  endWeek: number | null;
}

export interface GenerateStudyPlanInput {
  examDate?: string;
  dailyCommitment: DailyCommitment;
  daysPerWeek: StudyPlanWeekday[];
  subjectPriority?: string[];
}

export interface StudyPlan {
  userId: string;
  targetExam: TargetExam;
  examDate: string | null;
  dailyCommitment: DailyCommitment;
  daysPerWeek: StudyPlanWeekday[];
  subjectPriority: string[];
  milestones: StudyPlanMilestone[];
  weeklyXpTarget: number;
  preparationPercent: number;
  currentWeekNumber: number;
  currentWeekStartDate: string;
  sessions: StudyPlanSession[];
  generatedBy: 'ai' | 'fallback';
}

export interface MarkStudySessionCompleteInput {
  sessionId: string;
  quizSessionId?: string;
}
export interface MarkStudySessionCompleteResult {
  plan: StudyPlan;
  xpEarned: number;
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
export interface Badge {
  badgeId: string;
  name: string;
  description: string;
  iconKey: string;
  variant: BadgeVariant;
  rarity: BadgeRarity;
  category: string;
  requirementValue: number;
  currentProgress: number;
  status: BadgeStatus;
  earnedAt?: string | null;
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


// -----> Home
export interface DailyChallenge {
  date: string;
  contestId: string;
  subject: string;
  epReward: number;
  expiresAt: string;
}
export interface PerformanceTrendPoint {
  date: string;
  accuracy: number | null;
}

export interface HomeData {
  dailyChallenge: DailyChallenge | null;
  activeContests: Contest[];
  performanceTrend: PerformanceTrendPoint[];
}


// -----> Analytics
export interface SubjectPerformanceEntry {
  subject: string;
  accuracy: number;
  totalAttempted: number;
  totalCorrect: number;
}
export interface ActivityLogEntry {
  date: string;
  questionsAttempted: number;
  minutesStudied: number;
}
export interface RecentAttempt {
  sessionId: string;
  title: string;
  subject: string;
  quizType: QuizType;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  passed: boolean;
  completedAt: string;
}

export interface AnalyticsData {
  overallAccuracy: number;
  avgScore: number;
  bestSubject: string | null;
  weakSubject: string | null;
  heatmap: ActivityLogEntry[];
  subjectPerformance: SubjectPerformanceEntry[];
  recentAttempts: RecentAttempt[];
}
