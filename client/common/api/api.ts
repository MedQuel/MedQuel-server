// Domain-organized API calls. Every function here either talks to the real GraphQL
// backend or falls back to mock data - screens never need to know which one they got.

import { config } from './config';
import { gql, graphqlRequest } from './http';
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  NotImplementedError,
  ValidationError,
  isFallbackEligible,
  isUnshippedFeature,
  normalizeError,
} from './api.errors';
import type {
  User,
  QuizPrefs,
  NotifPrefs,
  CompleteOnboardingInput,
  CompleteOnboardingResult,
  UpdateProfileInput,
  StartQuizSessionInput,
  StartQuizSessionResult,
  SubmitQuizSessionInput,
  SubmitQuizSessionResult,
  Contest,
  GetContestsFilter,
  LeaderboardPeriod,
  LeaderboardScope,
  LeaderboardResult,
  StudyPlan,
  GenerateStudyPlanInput,
  ChatRoom,
  DirectConversation,
  DirectMessageDTO,
  GetChatMessagesResult,
  GetDirectMessagesResult,
  Badge,
  HomeData,
  AnalyticsData,
  InitiatePaymentInput,
  InitiatePaymentResult,
  VerifyPaymentInput,
  Subscription,
} from '../types/types';
import * as Mock from '../constants/mockData';


const IMPLEMENTED_OPERATIONS = {
  'user.getMe': true,
  'user.completeOnboarding': true,
  'user.updateProfile': true,
  'user.updateNotifPrefs': false,
  'user.updateQuizPrefs': false,
  'home.getHomeData': false,
  'quiz.startQuizSession': false,
  'quiz.submitQuizSession': false,
  'contest.getContests': false,
  'contest.getContest': false,
  'contest.joinContest': false,
  'contest.searchContests': false,
  'leaderboard.getLeaderboard': false,
  'studyPlan.getStudyPlan': false,
  'studyPlan.generateStudyPlan': false,
  'chat.getChatRooms': false,
  'chat.getChatMessages': false,
  'chat.getConversations': false,
  'chat.getConversationMessages': false,
  'chat.sendMessage': false,
  'chat.sendDirectMessage': false,
  'achievement.getAchievements': false,
  'analytics.getAnalytics': false,
  'subscription.getPlans': false,
  'subscription.initiatePayment': false,
  'subscription.verifyPayment': false,
} as const;
type OperationLabel = keyof typeof IMPLEMENTED_OPERATIONS;

const warnedThisSession = new Set<string>();
function warnFallbackOnce(label: string, reason: string): void {
  if (!config.logMockFallbacks) return;
  if (warnedThisSession.has(label)) return;
  warnedThisSession.add(label);
  console.warn(`[api] ${label} → serving mock data (${reason})`);
}

async function withMockFallback<T>(
  label: OperationLabel,
  real: () => Promise<T>,
  mock: () => T | Promise<T>
): Promise<T> {
  if (config.useMockData) {
    if (config.isDev) console.log(`[api] mock mode (forced) → ${label}`);
    await Mock.mockDelay();
    return mock();
  }
  if (!IMPLEMENTED_OPERATIONS[label]) {
    warnFallbackOnce(label, 'not deployed yet');
    await Mock.mockDelay();
    return mock();
  }

  try {
    return await real();
  } catch (err) {
    const apiErr = normalizeError(err);

    if (
      apiErr instanceof AuthenticationError ||
      apiErr instanceof AuthorizationError ||
      apiErr instanceof ValidationError ||
      apiErr instanceof ConflictError
    ) {
      throw apiErr;
    }

    if (config.autoFallbackOnError && isFallbackEligible(apiErr)) {
      const reason = isUnshippedFeature(apiErr)
        ? 'field not on schema yet'
        : `${apiErr.code} — ${apiErr.message}`;
      warnFallbackOnce(label, reason);
      await Mock.mockDelay();
      return mock();
    }

    throw apiErr;
  }
}


// -----> User <-----
const ME_QUERY = gql`
  query Me {
    me {
      uid
      displayName
      email
      photoURL
      role
      targetExam
      studyLevel
      yearOfStudy
      institution
      isPremium
      subscriptionId
      xpPoints
      epPoints
      currentLevel
      currentStreak
      longestStreak
      lastActiveDate
      totalQuestions
      totalCorrect
      studyHours
      badges
      createdAt
      updatedAt
    }
  }
`;
const COMPLETE_ONBOARDING_MUTATION = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
    completeOnboarding(input: $input) {
      displayName
      describesYou
      yearOfStudy
      targetExam
      institution
    }
  }
`;
const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      uid
      displayName
      photoURL
      studyLevel
      yearOfStudy
      targetExam
      institution
    }
  }
`;
const UPDATE_NOTIF_PREFS_MUTATION = gql`
  mutation UpdateNotifPrefs($input: NotifPrefsInput!) {
    updateNotifPrefs(input: $input) {
      pushEnabled
      emailDigest
      rankAlerts
      contestReminders
    }
  }
`;
const UPDATE_QUIZ_PREFS_MUTATION = gql`
  mutation UpdateQuizPrefs($input: QuizPrefsInput!) {
    updateQuizPrefs(input: $input) {
      defaultDifficulty
      timerSound
      autoSubmit
    }
  }
`;

export const userApi = {
  getMe: () =>
    withMockFallback(
      'user.getMe',
      async () =>
        (
          await graphqlRequest<{ me: User }>(ME_QUERY, undefined, {
            idempotent: true,
          })
        ).me,
      () => Mock.MOCK_USER
    ),

  completeOnboarding: (input: CompleteOnboardingInput) =>
    withMockFallback(
      'user.completeOnboarding',
      async () =>
        (
          await graphqlRequest<
            { completeOnboarding: CompleteOnboardingResult },
            { input: CompleteOnboardingInput }
          >(COMPLETE_ONBOARDING_MUTATION, { input })
        ).completeOnboarding,
      () => ({
        displayName: input.displayName,
        describesYou: input.describesYou,
        yearOfStudy: input.yearOfStudy ?? null,
        targetExam: input.targetExam,
        institution: input.institution ?? null,
      })
    ),

  updateProfile: (input: UpdateProfileInput) =>
    withMockFallback(
      'user.updateProfile',
      async () =>
        (
          await graphqlRequest<
            { updateProfile: User },
            { input: UpdateProfileInput }
          >(UPDATE_PROFILE_MUTATION, { input })
        ).updateProfile,
      () => ({ ...Mock.MOCK_USER, ...input })
    ),

  updateNotifPrefs: (input: NotifPrefs) =>
    withMockFallback(
      'user.updateNotifPrefs',
      async () =>
        (
          await graphqlRequest<
            { updateNotifPrefs: NotifPrefs },
            { input: NotifPrefs }
          >(UPDATE_NOTIF_PREFS_MUTATION, { input })
        ).updateNotifPrefs,
      () => input
    ),

  updateQuizPrefs: (input: QuizPrefs) =>
    withMockFallback(
      'user.updateQuizPrefs',
      async () =>
        (
          await graphqlRequest<
            { updateQuizPrefs: QuizPrefs },
            { input: QuizPrefs }
          >(UPDATE_QUIZ_PREFS_MUTATION, { input })
        ).updateQuizPrefs,
      () => input
    ),
};


// -----> Home <-----
const GET_HOME_DATA_QUERY = gql`
  query GetHomeData {
    getHomeData {
      dailyChallenge {
        date
        contestId
        subject
        epReward
        expiresAt
      }
      activeContests {
        contestId
        title
        subject
        contestType
        difficulty
        isPremium
        epReward
        status
        startsAt
        endsAt
        participantCount
      }
      subjectGrid {
        subject
        accuracy
        totalAttempted
      }
      performanceTrend {
        date
        accuracy
      }
    }
  }
`;

export const homeApi = {
  getHomeData: () =>
    withMockFallback(
      'home.getHomeData',
      async () =>
        (
          await graphqlRequest<{ getHomeData: HomeData }>(
            GET_HOME_DATA_QUERY,
            undefined,
            { idempotent: true }
          )
        ).getHomeData,
      () => Mock.MOCK_HOME_DATA
    ),
};


// -----> Quiz <-----
const START_QUIZ_SESSION_MUTATION = gql`
  mutation StartQuizSession($input: StartQuizSessionInput!) {
    startQuizSession(input: $input) {
      sessionId
      timeLimitSecs
      questions {
        questionId
        questionText
        optionA
        optionB
        optionC
        optionD
        imageUrl
        questionType
        difficulty
        subject
        topic
        marks
      }
    }
  }
`;
const SUBMIT_QUIZ_SESSION_MUTATION = gql`
  mutation SubmitQuizSession(
    $sessionId: ID!
    $answers: [SubmittedAnswerInput!]!
  ) {
    submitQuizSession(sessionId: $sessionId, answers: $answers) {
      session {
        sessionId
        status
        scorePercent
        correctCount
        wrongCount
        epEarned
        xpEarned
        timeTaken
      }
      gradedAnswers {
        questionId
        selected
        isCorrect
        correctAnswer
        explanation
        timeSpent
      }
      newStreak
      newXpTotal
      newEpTotal
      badgesUnlocked
    }
  }
`;

export const quizApi = {
  startQuizSession: (input: StartQuizSessionInput) =>
    withMockFallback(
      'quiz.startQuizSession',
      async () =>
        (
          await graphqlRequest<
            { startQuizSession: StartQuizSessionResult },
            { input: StartQuizSessionInput }
          >(START_QUIZ_SESSION_MUTATION, { input })
        ).startQuizSession,
      () => Mock.buildMockQuizSession(input.questionCount)
    ),

  submitQuizSession: (input: SubmitQuizSessionInput) =>
    withMockFallback(
      'quiz.submitQuizSession',
      async () =>
        (
          await graphqlRequest<
            { submitQuizSession: SubmitQuizSessionResult },
            SubmitQuizSessionInput
          >(SUBMIT_QUIZ_SESSION_MUTATION, input)
        ).submitQuizSession,
      () => Mock.buildMockSubmitResult(input.sessionId)
    ),
};


// -----> Contests <-----
const GET_CONTESTS_QUERY = gql`
  query GetContests($filter: GetContestsFilter) {
    getContests(filter: $filter) {
      contestId
      title
      subject
      topics
      contestType
      difficulty
      isPremium
      totalQuestions
      timeLimitSecs
      markingScheme {
        correct
        wrong
        skipped
      }
      epReward
      passPercent
      recommendedLevel
      status
      startsAt
      endsAt
      participantCount
    }
  }
`;
const GET_CONTEST_QUERY = gql`
  query GetContest($contestId: ID!) {
    getContest(contestId: $contestId) {
      contestId
      title
      subject
      topics
      contestType
      difficulty
      isPremium
      totalQuestions
      timeLimitSecs
      markingScheme {
        correct
        wrong
        skipped
      }
      epReward
      passPercent
      recommendedLevel
      status
      startsAt
      endsAt
      participantCount
    }
  }
`;
const JOIN_CONTEST_MUTATION = gql`
  mutation JoinContest($contestId: ID!) {
    joinContest(contestId: $contestId) {
      sessionId
      timeLimitSecs
      questions {
        questionId
        questionText
        optionA
        optionB
        optionC
        optionD
        imageUrl
        questionType
        difficulty
        subject
        topic
        marks
      }
    }
  }
`;
const SEARCH_CONTESTS_QUERY = gql`
  query SearchContests($query: String!) {
    searchContests(query: $query) {
      contestId
      title
      subject
      contestType
      status
      startsAt
      endsAt
    }
  }
`;

export const contestApi = {
  getContests: (filter?: GetContestsFilter) =>
    withMockFallback(
      'contest.getContests',
      async () =>
        (
          await graphqlRequest<
            { getContests: Contest[] },
            { filter?: GetContestsFilter }
          >(GET_CONTESTS_QUERY, { filter }, { idempotent: true })
        ).getContests,
      () => Mock.MOCK_CONTESTS
    ),

  getContest: (contestId: string) =>
    withMockFallback(
      'contest.getContest',
      async () =>
        (
          await graphqlRequest<{ getContest: Contest }, { contestId: string }>(
            GET_CONTEST_QUERY,
            { contestId },
            { idempotent: true }
          )
        ).getContest,
      () =>
        Mock.MOCK_CONTESTS.find((c) => c.contestId === contestId) ??
        Mock.MOCK_CONTESTS[0]
    ),

  joinContest: (contestId: string) =>
    withMockFallback(
      'contest.joinContest',
      async () =>
        (
          await graphqlRequest<
            { joinContest: StartQuizSessionResult },
            { contestId: string }
          >(JOIN_CONTEST_MUTATION, { contestId })
        ).joinContest,
      () => Mock.buildMockQuizSession()
    ),

  searchContests: (query: string) =>
    withMockFallback(
      'contest.searchContests',
      async () =>
        (
          await graphqlRequest<
            { searchContests: Contest[] },
            { query: string }
          >(SEARCH_CONTESTS_QUERY, { query }, { idempotent: true })
        ).searchContests,
      () =>
        Mock.MOCK_CONTESTS.filter((c) =>
          c.title.toLowerCase().includes(query.toLowerCase())
        )
    ),
};


// -----> Leaderboard <-----
const GET_LEADERBOARD_QUERY = gql`
  query GetLeaderboard($period: LeaderboardPeriod!, $scope: LeaderboardScope!) {
    getLeaderboard(period: $period, scope: $scope) {
      period
      scope
      entries {
        userId
        displayName
        photoURL
        specialization
        epPoints
        rank
        prevRank
        weeklyChange
      }
      currentUserEntry {
        userId
        displayName
        photoURL
        specialization
        epPoints
        rank
        prevRank
        weeklyChange
      }
    }
  }
`;

export const leaderboardApi = {
  getLeaderboard: (
    period: LeaderboardPeriod = 'weekly',
    scope: LeaderboardScope = 'global'
  ) =>
    withMockFallback(
      'leaderboard.getLeaderboard',
      async () =>
        (
          await graphqlRequest<
            { getLeaderboard: LeaderboardResult },
            { period: LeaderboardPeriod; scope: LeaderboardScope }
          >(GET_LEADERBOARD_QUERY, { period, scope }, { idempotent: true })
        ).getLeaderboard,
      () => ({ ...Mock.MOCK_LEADERBOARD, period, scope })
    ),
};


// -----> Study plan <-----
const GET_STUDY_PLAN_QUERY = gql`
  query GetStudyPlan {
    getStudyPlan {
      userId
      targetExam
      examDate
      preparationPercent
      weeklyEpTarget
      generatedBy
      currentWeekProgress {
        daysCompleted
        totalDays
      }
      sessions {
        sessionId
        subject
        topic
        contestId
        questionCount
        scheduledTime
        scheduledDate
        epReward
        status
      }
    }
  }
`;
const GENERATE_STUDY_PLAN_MUTATION = gql`
  mutation GenerateStudyPlan($input: GenerateStudyPlanInput!) {
    generateStudyPlan(input: $input) {
      userId
      targetExam
      examDate
      preparationPercent
      weeklyEpTarget
      generatedBy
      currentWeekProgress {
        daysCompleted
        totalDays
      }
      sessions {
        sessionId
        subject
        topic
        contestId
        questionCount
        scheduledTime
        scheduledDate
        epReward
        status
      }
    }
  }
`;

export const studyPlanApi = {
  getStudyPlan: () =>
    withMockFallback(
      'studyPlan.getStudyPlan',
      async () =>
        (
          await graphqlRequest<{ getStudyPlan: StudyPlan }>(
            GET_STUDY_PLAN_QUERY,
            undefined,
            { idempotent: true }
          )
        ).getStudyPlan,
      () => Mock.MOCK_STUDY_PLAN
    ),

  generateStudyPlan: (input: GenerateStudyPlanInput) =>
    withMockFallback(
      'studyPlan.generateStudyPlan',
      async () =>
        (
          await graphqlRequest<
            { generateStudyPlan: StudyPlan },
            { input: GenerateStudyPlanInput }
          >(GENERATE_STUDY_PLAN_MUTATION, { input })
        ).generateStudyPlan,
      () => Mock.MOCK_STUDY_PLAN
    ),
};


// -----> Chat <-----
const GET_CHAT_ROOMS_QUERY = gql`
  query GetChatRooms {
    getChatRooms {
      roomId
      name
      subject
      iconColor
      memberCount
      lastMessage
      lastMessageAt
      isActive
    }
  }
`;
const GET_CHAT_MESSAGES_QUERY = gql`
  query GetChatMessages($roomId: ID!, $cursor: String) {
    getChatMessages(roomId: $roomId, cursor: $cursor) {
      messages {
        messageId
        roomId
        userId
        displayName
        photoURL
        text
        createdAt
        isEdited
        editedAt
      }
      nextCursor
    }
  }
`;
const GET_CONVERSATIONS_QUERY = gql`
  query GetConversations {
    getConversations {
      userId
      displayName
      isOnline
      lastSeenAt
      lastMessage
      lastMessageAt
      unreadCount
    }
  }
`;
const GET_CONVERSATION_MESSAGES_QUERY = gql`
  query GetConversationMessages($userId: ID!, $cursor: String) {
    getConversationMessages(userId: $userId, cursor: $cursor) {
      messages {
        messageId
        userId
        displayName
        photoURL
        text
        createdAt
        isEdited
        editedAt
      }
      nextCursor
    }
  }
`;
const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($roomId: ID!, $text: String!) {
    sendMessage(roomId: $roomId, text: $text) {
      messageId
      roomId
      userId
      displayName
      text
      createdAt
      isEdited
    }
  }
`;
const SEND_DIRECT_MESSAGE_MUTATION = gql`
  mutation SendDirectMessage($userId: ID!, $text: String!) {
    sendDirectMessage(userId: $userId, text: $text) {
      messageId
      userId
      displayName
      text
      createdAt
      isEdited
    }
  }
`;

export const chatApi = {
  getChatRooms: () =>
    withMockFallback(
      'chat.getChatRooms',
      async () =>
        (
          await graphqlRequest<{ getChatRooms: ChatRoom[] }>(
            GET_CHAT_ROOMS_QUERY,
            undefined,
            { idempotent: true }
          )
        ).getChatRooms,
      () => Mock.MOCK_CHAT_ROOMS
    ),

  getConversations: () =>
    withMockFallback(
      'chat.getConversations',
      async () =>
        (
          await graphqlRequest<{ getConversations: DirectConversation[] }>(
            GET_CONVERSATIONS_QUERY,
            undefined,
            { idempotent: true }
          )
        ).getConversations,
      () => Mock.MOCK_DIRECT_CONVERSATIONS
    ),

  getConversationMessages: (userId: string, cursor?: string) =>
    withMockFallback(
      'chat.getConversationMessages',
      async () =>
        (
          await graphqlRequest<
            { getConversationMessages: GetDirectMessagesResult },
            { userId: string; cursor?: string }
          >(GET_CONVERSATION_MESSAGES_QUERY, { userId, cursor }, { idempotent: true })
        ).getConversationMessages,
      () => Mock.getMockConversationMessages(userId)
    ),

  getChatMessages: (roomId: string, cursor?: string) =>
    withMockFallback(
      'chat.getChatMessages',
      async () =>
        (
          await graphqlRequest<
            { getChatMessages: GetChatMessagesResult },
            { roomId: string; cursor?: string }
          >(GET_CHAT_MESSAGES_QUERY, { roomId, cursor }, { idempotent: true })
        ).getChatMessages,
      () => Mock.getMockChatMessages(roomId)
    ),

  sendMessage: (roomId: string, text: string) =>
    withMockFallback(
      'chat.sendMessage',
      async () =>
        (
          await graphqlRequest<
            { sendMessage: GetChatMessagesResult['messages'][number] },
            { roomId: string; text: string }
          >(SEND_MESSAGE_MUTATION, { roomId, text })
        ).sendMessage,
      () => ({
        messageId: `mock-msg-${Date.now()}`,
        roomId,
        userId: Mock.MOCK_USER.uid,
        displayName: Mock.MOCK_USER.displayName,
        text,
        createdAt: new Date().toISOString(),
        isEdited: false,
      })
    ),

  sendDirectMessage: (userId: string, text: string) =>
    withMockFallback(
      'chat.sendDirectMessage',
      async () =>
        (
          await graphqlRequest<
            { sendDirectMessage: DirectMessageDTO },
            { userId: string; text: string }
          >(SEND_DIRECT_MESSAGE_MUTATION, { userId, text })
        ).sendDirectMessage,
      () => ({
        messageId: `mock-msg-${Date.now()}`,
        userId: Mock.MOCK_USER.uid,
        displayName: Mock.MOCK_USER.displayName,
        text,
        createdAt: new Date().toISOString(),
        isEdited: false,
      })
    ),
};


// -----> Achievements <-----
const GET_ACHIEVEMENTS_QUERY = gql`
  query GetAchievements {
    getAchievements {
      badgeId
      name
      description
      icon
      tier
      requirementValue
      currentProgress
      status
      earnedAt
    }
  }
`;

export const achievementApi = {
  getAchievements: () =>
    withMockFallback(
      'achievement.getAchievements',
      async () =>
        (
          await graphqlRequest<{ getAchievements: Badge[] }>(
            GET_ACHIEVEMENTS_QUERY,
            undefined,
            { idempotent: true }
          )
        ).getAchievements,
      () => Mock.MOCK_ACHIEVEMENTS
    ),
};


// -----> Analytics <-----
const GET_ANALYTICS_QUERY = gql`
  query GetAnalytics {
    getAnalytics {
      overallAccuracy
      heatmap {
        date
        questionsAttempted
        minutesStudied
      }
      subjectPerformance {
        subject
        accuracy
        totalAttempted
        totalCorrect
      }
      recentAttempts {
        sessionId
        subject
        scorePercent
        completedAt
      }
    }
  }
`;

export const analyticsApi = {
  getAnalytics: () =>
    withMockFallback(
      'analytics.getAnalytics',
      async () =>
        (
          await graphqlRequest<{ getAnalytics: AnalyticsData }>(
            GET_ANALYTICS_QUERY,
            undefined,
            { idempotent: true }
          )
        ).getAnalytics,
      () => Mock.MOCK_ANALYTICS
    ),
};


// -----> Subscriptions <-----
const INITIATE_PAYMENT_MUTATION = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      razorpayOrderId
      razorpayKeyId
      amount
      currency
    }
  }
`;
const VERIFY_PAYMENT_MUTATION = gql`
  mutation VerifyPayment($input: VerifyPaymentInput!) {
    verifyPayment(input: $input) {
      subscriptionId
      userId
      planId
      status
      startsAt
      expiresAt
      autoRenew
    }
  }
`;

export const subscriptionApi = {
  getPlans: () =>
    withMockFallback(
      'subscription.getPlans',
      async () => {
        throw new NotImplementedError('getPlans query not yet on schema');
      },
      () => Mock.MOCK_PLANS
    ),

  initiatePayment: (input: InitiatePaymentInput) =>
    withMockFallback(
      'subscription.initiatePayment',
      async () =>
        (
          await graphqlRequest<
            { initiatePayment: InitiatePaymentResult },
            { input: InitiatePaymentInput }
          >(INITIATE_PAYMENT_MUTATION, { input })
        ).initiatePayment,
      () => Mock.buildMockInitiatePayment()
    ),

  verifyPayment: (input: VerifyPaymentInput) =>
    withMockFallback(
      'subscription.verifyPayment',
      async () =>
        (
          await graphqlRequest<
            { verifyPayment: Subscription },
            { input: VerifyPaymentInput }
          >(VERIFY_PAYMENT_MUTATION, { input })
        ).verifyPayment,
      () => ({
        subscriptionId: `mock-sub-${Date.now()}`,
        userId: Mock.MOCK_USER.uid,
        planId: 'plan-monthly',
        status: 'active' as const,
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        autoRenew: true,
      })
    ),
};


// -----> Combined export - API
export const api = {
  user: userApi,
  home: homeApi,
  quiz: quizApi,
  contest: contestApi,
  leaderboard: leaderboardApi,
  chat: chatApi,
  achievement: achievementApi,
  analytics: analyticsApi,
  studyPlan: studyPlanApi,
  subscription: subscriptionApi,
};

export * from './api.errors';
