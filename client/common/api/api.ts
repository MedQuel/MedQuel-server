import { config } from './config';
import { gql, graphqlRequest } from './http';
import * as Mock from '../constants/mockData';
import { ConflictError, normalizeError, ValidationError, isFallbackEligible } from './api.errors';
import { isUnshippedFeature, AuthorizationError, AuthenticationError, NotImplementedError } from './api.errors';

import type { Badge, HomeData, AnalyticsData } from '../types/types';
import type { ChatRoom, GetChatMessagesResult } from '../types/types';
import type { StudyPlan, GenerateStudyPlanInput } from '../types/types';
import type { Contest, GetContestsFilter, GetContestsResult } from '../types/types';
import type { User, QuizPrefs, NotifPrefs, UpdateProfileInput } from '../types/types';
import type { CompleteOnboardingInput, CompleteOnboardingResult } from '../types/types';
import type { LeaderboardPeriod, LeaderboardScope, LeaderboardResult } from '../types/types';
import type { MarkStudySessionCompleteInput, MarkStudySessionCompleteResult } from '../types/types';
import type { FriendRequest, FriendSummary, PublicProfile, UserSearchResult } from '../types/types';
import type { Subscription, InitiatePaymentInput, InitiatePaymentResult, VerifyPaymentInput } from '../types/types';
import type { StartQuizSessionInput, StartQuizSessionResult, SubmitQuizSessionInput, SubmitQuizSessionResult } from '../types/types';


const IMPLEMENTED_OPERATIONS = {
  'user.getMe': true,
  'user.completeOnboarding': true,
  'user.updateProfile': true,
  'user.updateNotifPrefs': true,
  'user.updateQuizPrefs': true,
  'friends.sendFriendRequest': true,
  'friends.respondFriendRequest': true,
  'friends.removeFriend': true,
  'friends.getUserProfile': true,
  'friends.searchUsers': true,
  'friends.getPendingFriendRequests': true,
  'friends.getFriends': true,
  'home.getHomeData': true,
  'quiz.getTopicsForSubject': true,
  'quiz.startQuizSession': true,
  'quiz.submitQuizSession': true,
  'contest.getContests': true,
  'contest.getContest': true,
  'contest.joinContest': true,
  'leaderboard.getLeaderboard': true,
  'studyPlan.getStudyPlan': true,
  'studyPlan.generateStudyPlan': true,
  'studyPlan.markStudySessionComplete': true,
  'chat.getChatRooms': false, //
  'chat.getChatMessages': false, //
  'chat.sendMessage': false, //
  'achievement.getAchievements': true,
  'analytics.getAnalytics': true,
  'subscription.getPlans': false, //
  'subscription.verifyPayment': false, //
  'subscription.initiatePayment': false, //
} as const;
type OperationLabel = keyof typeof IMPLEMENTED_OPERATIONS;


const warnedThisSession = new Set<string>();
function warnFallbackOnce(label: string, reason: string): void {
  if (!config.logMockFallbacks) return;
  if (warnedThisSession.has(label)) return;
  warnedThisSession.add(label);
  console.warn(`[api] ${label} → serving mock data (${reason})`);
}

async function withMockFallback<T>(label: OperationLabel, real: () => Promise<T>, mock: () => T | Promise<T>): Promise<T> {
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

    if (apiErr instanceof AuthenticationError || apiErr instanceof AuthorizationError || apiErr instanceof ValidationError || apiErr instanceof ConflictError) {
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
      describesYou
      targetExam
      studyLevel
      yearOfStudy
      specialties
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
      stats {
        contestsPlayed
        contests90Plus
        hardContestsDone
        perfectQuizzes
        fastCompletions
        top3Finishes
        subjects70Plus
      }
      badges
      notifPrefs {
        pushEnabled
        emailDigest
        rankAlerts
        contestReminders
        achievementAlerts
      }
      quizPrefs {
        defaultDifficulty
        timerSound
        autoSubmit
      }
      contentScope
      focusSubjects
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
      specialties
      targetExam
      institution
      contentScope
      focusSubjects
    }
  }
`;
const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      uid
      displayName
      photoURL
      describesYou
      studyLevel
      yearOfStudy
      specialties
      targetExam
      institution
      contentScope
      focusSubjects
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
      achievementAlerts
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
  getMe: () => withMockFallback(
    'user.getMe', async () => (
      await graphqlRequest<{ me: User }>(ME_QUERY, undefined, {
        idempotent: true,
      })
    ).me,
    () => Mock.MOCK_USER
  ),

  completeOnboarding: (input: CompleteOnboardingInput) => withMockFallback(
    'user.completeOnboarding', async () => (
      await graphqlRequest<
        { completeOnboarding: CompleteOnboardingResult },
        { input: CompleteOnboardingInput }
      >(COMPLETE_ONBOARDING_MUTATION, { input })
    ).completeOnboarding,
    () => ({
      displayName: input.displayName,
      describesYou: input.describesYou,
      yearOfStudy: input.yearOfStudy ?? null,
      specialties: Mock.MOCK_USER.specialties,
      targetExam: input.targetExam,
      institution: input.institution ?? null,
      contentScope: Mock.MOCK_USER.contentScope,
      focusSubjects: Mock.MOCK_USER.focusSubjects,
    })
  ),

  updateProfile: (input: UpdateProfileInput) => withMockFallback(
    'user.updateProfile', async () => (
      await graphqlRequest<
        { updateProfile: User },
        { input: UpdateProfileInput }
      >(UPDATE_PROFILE_MUTATION, { input })
    ).updateProfile,
    () => ({ ...Mock.MOCK_USER, ...input })
  ),

  updateNotifPrefs: (input: NotifPrefs) => withMockFallback(
    'user.updateNotifPrefs', async () => (
      await graphqlRequest<
        { updateNotifPrefs: NotifPrefs },
        { input: NotifPrefs }
      >(UPDATE_NOTIF_PREFS_MUTATION, { input })
    ).updateNotifPrefs,
    () => input
  ),

  updateQuizPrefs: (input: QuizPrefs) => withMockFallback(
    'user.updateQuizPrefs', async () => (
      await graphqlRequest<
        { updateQuizPrefs: QuizPrefs },
        { input: QuizPrefs }
      >(UPDATE_QUIZ_PREFS_MUTATION, { input })
    ).updateQuizPrefs,
    () => input
  ),
};


// -----> Friends <-----
const SEND_FRIEND_REQUEST_MUTATION = gql`
  mutation SendFriendRequest($toUid: ID!) {
    sendFriendRequest(toUid: $toUid) {
      requestId
      fromUid
      toUid
      status
      createdAt
      respondedAt
    }
  }
`;
const RESPOND_FRIEND_REQUEST_MUTATION = gql`
  mutation RespondFriendRequest($requestId: ID!, $accept: Boolean!) {
    respondFriendRequest(requestId: $requestId, accept: $accept)
  }
`;
const REMOVE_FRIEND_MUTATION = gql`
  mutation RemoveFriend($friendUid: ID!) {
    removeFriend(friendUid: $friendUid)
  }
`;
const GET_USER_PROFILE_QUERY = gql`
  query GetUserProfile($uid: ID!) {
    getUserProfile(uid: $uid) {
      uid
      displayName
      photoURL
      targetExam
      studyLevel
      specialties
      currentLevel
      xpPoints
      epPoints
      currentStreak
      longestStreak
      totalQuestions
      totalCorrect
      accuracy
      studyHours
      quizzesCompleted
      badges
      friends {
        uid
        displayName
        photoURL
        currentLevel
        currentStreak
        epPoints
        headToHead { wins losses }
        addedAt
      }
      relationshipStatus
      headToHead {
        wins
        losses
      }
      comparison {
        xpDelta
        epDelta
        streakDelta
        levelDelta
      }
    }
  }
`;
const SEARCH_USERS_QUERY = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      uid
      displayName
      photoURL
      targetExam
      relationshipStatus
    }
  }
`;
const GET_PENDING_FRIEND_REQUESTS_QUERY = gql`
  query GetPendingFriendRequests {
    getPendingFriendRequests {
      requestId
      fromUid
      toUid
      status
      createdAt
      respondedAt
    }
  }
`;
const GET_FRIENDS_QUERY = gql`
  query GetFriends {
    getFriends {
      uid
      displayName
      photoURL
      currentLevel
      currentStreak
      epPoints
      headToHead {
        wins
        losses
      }
      addedAt
    }
  }
`;


export const friendsApi = {
  sendFriendRequest: (toUid: string) =>
    withMockFallback('friends.sendFriendRequest', async () => (
      await graphqlRequest<
        { sendFriendRequest: FriendRequest },
        { toUid: string }
      >(SEND_FRIEND_REQUEST_MUTATION, { toUid })
    ).sendFriendRequest, () => Mock.buildMockFriendRequest(toUid)
  ),

  respondFriendRequest: (requestId: string, accept: boolean) =>
    withMockFallback('friends.respondFriendRequest', async () => (
      await graphqlRequest<
        { respondFriendRequest: boolean },
        { requestId: string; accept: boolean }
      >(RESPOND_FRIEND_REQUEST_MUTATION, { requestId, accept })
    ).respondFriendRequest, () => true
  ),

  removeFriend: (friendUid: string) =>
    withMockFallback('friends.removeFriend', async () => (
      await graphqlRequest<
        { removeFriend: boolean },
        { friendUid: string }
      >(REMOVE_FRIEND_MUTATION, { friendUid })
    ).removeFriend, () => true
  ),

  getUserProfile: (uid: string) =>
    withMockFallback('friends.getUserProfile', async () => (
      await graphqlRequest<
        { getUserProfile: PublicProfile },
        { uid: string }
      >(GET_USER_PROFILE_QUERY, { uid }, { idempotent: true })
    ).getUserProfile, () => Mock.buildMockPublicProfile(uid)
  ),

  searchUsers: (query: string) =>
    withMockFallback('friends.searchUsers', async () => (
      await graphqlRequest<
        { searchUsers: UserSearchResult[] },
        { query: string }
      >(SEARCH_USERS_QUERY, { query }, { idempotent: true })
    ).searchUsers, () => Mock.buildMockSearchResults(query)
  ),

  getPendingFriendRequests: () =>
    withMockFallback('friends.getPendingFriendRequests', async () => (
      await graphqlRequest<{ getPendingFriendRequests: FriendRequest[] }>(
        GET_PENDING_FRIEND_REQUESTS_QUERY,
        undefined,
        { idempotent: true }
      )
    ).getPendingFriendRequests, () => Mock.MOCK_PENDING_FRIEND_REQUESTS
  ),

  getFriends: () =>
    withMockFallback('friends.getFriends', async () => (
      await graphqlRequest<{ getFriends: FriendSummary[] }>(
        GET_FRIENDS_QUERY,
        undefined,
        { idempotent: true }
      )
    ).getFriends, () => Mock.MOCK_FRIENDS
  ),
};


// -----> Home <-----
const GET_HOME_DATA_QUERY = gql`
  query GetHomeData {
    getHomeData {
      dailyChallenge { date contestId subject epReward expiresAt }
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
      performanceTrend { date accuracy }
    }
  }
`;


export const homeApi = {
  getHomeData: () => withMockFallback(
    'home.getHomeData', async () => (
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
const GET_TOPICS_FOR_SUBJECT_QUERY = gql`
  query GetTopicsForSubject($subject: String!) {
    getTopicsForSubject(subject: $subject)
  }
`;
const START_QUIZ_SESSION_MUTATION = gql`
  mutation StartQuizSession($input: StartQuizSessionInput!) {
    startQuizSession(input: $input) {
      sessionId
      quizType
      subject
      difficulty
      topic
      totalQuestions
      timeLimitSecs
      startedAt
      questions {
        questionId
        questionText
        optionA
        optionB
        optionC
        optionD
        imageUrl
        difficulty
        questionType
        marks
      }
    }
  }
`;
const SUBMIT_QUIZ_SESSION_MUTATION = gql`
  mutation SubmitQuizSession($input: SubmitQuizSessionInput!) {
    submitQuizSession(input: $input) {
      sessionId
      totalQuestions
      correctCount
      wrongCount
      skippedCount
      score
      scorePercent
      timeTaken
      epEarned
      xpEarned
      updatedXpPoints
      updatedEpPoints
      updatedCurrentLevel
      updatedCurrentStreak
      leveledUp
      isNewLongestStreak
      results {
        questionId
        selectedOption
        correctAnswer
        isCorrect
        explanation
      }
    }
  }
`;


export const quizApi = {
  getTopicsForSubject: (subject: string) => withMockFallback(
    'quiz.getTopicsForSubject', async () => (
      await graphqlRequest<
        { getTopicsForSubject: string[] },
        { subject: string }
      >(GET_TOPICS_FOR_SUBJECT_QUERY, { subject }, { idempotent: true })
    ).getTopicsForSubject, () => Array.from(
      new Set(
        Mock.MOCK_CONTESTS.filter(
          (contest) => contest.subject === subject
        ).flatMap((contest) => contest.topics)
      )
    )
  ),

  startQuizSession: (input: StartQuizSessionInput) => withMockFallback(
    'quiz.startQuizSession', async () => (
      await graphqlRequest<
        { startQuizSession: StartQuizSessionResult },
        { input: StartQuizSessionInput }
      >(START_QUIZ_SESSION_MUTATION, { input })
    ).startQuizSession, () => Mock.buildMockQuizSession(input.questionCount)
  ),

  submitQuizSession: (input: SubmitQuizSessionInput) => withMockFallback(
    'quiz.submitQuizSession', async () => (
      await graphqlRequest<
        { submitQuizSession: SubmitQuizSessionResult },
        { input: SubmitQuizSessionInput }
      >(SUBMIT_QUIZ_SESSION_MUTATION, { input })
    ).submitQuizSession, () => Mock.buildMockSubmitResult(input.sessionId)
  ),
};


// -----> Contests <-----
const GET_CONTESTS_QUERY = gql`
  query GetContests($filter: GetContestsFilter) {
    getContests(filter: $filter) {
      contests {
        contestId
        title
        subject
        topics
        contestType
        difficulty
        isPremium
        totalQuestions
        timeLimitSecs
        markingScheme { correct wrong skipped }
        epReward
        passPercent
        recommendedLevel
        status
        startsAt
        endsAt
        participantCount
      }
      nextCursor
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
      markingScheme { correct wrong skipped }
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
      quizType
      subject
      difficulty
      topic
      totalQuestions
      timeLimitSecs
      startedAt
      questions {
        questionId
        questionText
        optionA
        optionB
        optionC
        optionD
        imageUrl
        difficulty
        questionType
        marks
      }
    }
  }
`;


export const contestApi = {
  getContests: (filter?: GetContestsFilter) => withMockFallback(
    'contest.getContests', async () => (
      await graphqlRequest<
        { getContests: GetContestsResult },
        { filter?: GetContestsFilter }
      >(GET_CONTESTS_QUERY, { filter }, { idempotent: true })
    ).getContests.contests, () => Mock.MOCK_CONTESTS
  ),

  getContest: (contestId: string) => withMockFallback(
    'contest.getContest', async () => (
      await graphqlRequest<{ getContest: Contest }, { contestId: string }>(
        GET_CONTEST_QUERY,
        { contestId },
        { idempotent: true }
      )
    ).getContest, () => Mock.MOCK_CONTESTS.find((c) => c.contestId === contestId) ?? Mock.MOCK_CONTESTS[0]
  ),

  joinContest: (contestId: string) => withMockFallback(
    'contest.joinContest', async () => (
      await graphqlRequest<
        { joinContest: StartQuizSessionResult },
        { contestId: string }
      >(JOIN_CONTEST_MUTATION, { contestId })
    ).joinContest, () => Mock.buildMockQuizSession()
  ),
};


// -----> Leaderboard <-----
const GET_LEADERBOARD_QUERY = gql`
  query GetLeaderboard($period: LeaderboardPeriod!, $scope: LeaderboardScope!) {
    getLeaderboard(period: $period, scope: $scope) {
      period
      periodKey
      entries { userId displayName photoURL specialization epPoints rank prevRank weeklyChange updatedAt }
      myEntry { userId displayName photoURL specialization epPoints rank prevRank weeklyChange updatedAt }
      myRank
    }
  }
`;


export const leaderboardApi = {
  getLeaderboard: (period: LeaderboardPeriod = 'weekly', scope: LeaderboardScope = 'global') => withMockFallback(
    'leaderboard.getLeaderboard', async () => (
      await graphqlRequest<
        { getLeaderboard: LeaderboardResult },
        { period: LeaderboardPeriod; scope: LeaderboardScope }
      >(GET_LEADERBOARD_QUERY, { period, scope }, { idempotent: true })
    ).getLeaderboard, () => scope === 'friends'
      ? Mock.buildMockFriendsLeaderboard(period)
      : { ...Mock.MOCK_LEADERBOARD, period, scope }
  ),
};


// -----> Study plan <-----
const GET_STUDY_PLAN_QUERY = gql`
  query GetStudyPlan {
    getStudyPlan {
      userId
      targetExam
      examDate
      dailyCommitment
      daysPerWeek
      subjectPriority
      milestones { label phase description startWeek endWeek }
      weeklyXpTarget
      preparationPercent
      currentWeekNumber
      currentWeekStartDate
      generatedBy
      sessions {
        sessionId
        sessionType
        subject
        topic
        scheduledDate
        status
        xpReward
        completedAt
        questionCount
        difficulty
        linkedQuizSessionId
        title
        content
        disclaimer
        estimatedMinutes
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
      dailyCommitment
      daysPerWeek
      subjectPriority
      milestones { label phase description startWeek endWeek }
      weeklyXpTarget
      preparationPercent
      currentWeekNumber
      currentWeekStartDate
      generatedBy
      sessions {
        sessionId
        sessionType
        subject
        topic
        scheduledDate
        status
        xpReward
        completedAt
        questionCount
        difficulty
        linkedQuizSessionId
        title
        content
        disclaimer
        estimatedMinutes
      }
    }
  }
`;
const MARK_STUDY_SESSION_COMPLETE_MUTATION = gql`
  mutation MarkStudySessionComplete($sessionId: ID!, $quizSessionId: ID) {
    markStudySessionComplete(sessionId: $sessionId, quizSessionId: $quizSessionId) {
      xpEarned
      plan {
        userId
        targetExam
        examDate
        dailyCommitment
        daysPerWeek
        subjectPriority
        milestones { label phase description startWeek endWeek }
        weeklyXpTarget
        preparationPercent
        currentWeekNumber
        currentWeekStartDate
        generatedBy
        sessions {
          sessionId
          sessionType
          subject
          topic
          scheduledDate
          status
          xpReward
          completedAt
          questionCount
          difficulty
          linkedQuizSessionId
          title
          content
          disclaimer
          estimatedMinutes
        }
      }
    }
  }
`;


export const studyPlanApi = {
  getStudyPlan: () => withMockFallback(
    'studyPlan.getStudyPlan', async () => (
      await graphqlRequest<{ getStudyPlan: StudyPlan | null }>(
        GET_STUDY_PLAN_QUERY,
        undefined,
        { idempotent: true }
      )
    ).getStudyPlan, () => Mock.MOCK_STUDY_PLAN
  ),

  generateStudyPlan: (input: GenerateStudyPlanInput) => withMockFallback(
    'studyPlan.generateStudyPlan', async () => (
      await graphqlRequest<
        { generateStudyPlan: StudyPlan },
        { input: GenerateStudyPlanInput }
      >(GENERATE_STUDY_PLAN_MUTATION, { input })
    ).generateStudyPlan, () => Mock.MOCK_STUDY_PLAN
  ),

  markStudySessionComplete: (input: MarkStudySessionCompleteInput) => withMockFallback(
    'studyPlan.markStudySessionComplete', async () => (
      await graphqlRequest<
        { markStudySessionComplete: MarkStudySessionCompleteResult },
        { sessionId: string; quizSessionId?: string }
      >(MARK_STUDY_SESSION_COMPLETE_MUTATION, {
        sessionId: input.sessionId,
        quizSessionId: input.quizSessionId,
      })
    ).markStudySessionComplete, () => Mock.buildMockMarkSessionCompleteResult(input.sessionId)
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


export const chatApi = {
  getChatRooms: () => withMockFallback(
    'chat.getChatRooms', async () => (
      await graphqlRequest<{ getChatRooms: ChatRoom[] }>(
        GET_CHAT_ROOMS_QUERY,
        undefined,
        { idempotent: true }
      )
    ).getChatRooms, () => Mock.MOCK_CHAT_ROOMS
  ),

  getChatMessages: (roomId: string, cursor?: string) => withMockFallback(
    'chat.getChatMessages', async () => (
      await graphqlRequest<
        { getChatMessages: GetChatMessagesResult },
        { roomId: string; cursor?: string }
      >(GET_CHAT_MESSAGES_QUERY, { roomId, cursor }, { idempotent: true })
    ).getChatMessages, () => Mock.getMockChatMessages(roomId)
  ),

  sendMessage: (roomId: string, text: string) => withMockFallback(
    'chat.sendMessage', async () => (
      await graphqlRequest<
        { sendMessage: GetChatMessagesResult['messages'][number] },
        { roomId: string; text: string }
      >(SEND_MESSAGE_MUTATION, { roomId, text })
    ).sendMessage, () => ({
      messageId: `mock-msg-${Date.now()}`,
      roomId,
      userId: Mock.MOCK_USER.uid,
      displayName: Mock.MOCK_USER.displayName,
      text,
      createdAt: new Date().toISOString(),
      isEdited: false
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
      iconKey
      variant
      rarity
      category
      requirementValue
      currentProgress
      status
      earnedAt
    }
  }
`;


export const achievementApi = {
  getAchievements: () => withMockFallback(
    'achievement.getAchievements', async () => (
      await graphqlRequest<{ getAchievements: Badge[] }>(
        GET_ACHIEVEMENTS_QUERY,
        undefined,
        { idempotent: true }
      )
    ).getAchievements, () => Mock.MOCK_ACHIEVEMENTS
  ),
};


// -----> Analytics <-----
const GET_ANALYTICS_QUERY = gql`
  query GetAnalytics {
    getAnalytics {
      overallAccuracy
      avgScore
      bestSubject
      weakSubject
      heatmap { date questionsAttempted minutesStudied }
      subjectPerformance { subject accuracy totalAttempted totalCorrect }
      recentAttempts {
        sessionId
        subject
        quizType
        scorePercent
        correctCount
        totalQuestions
        timeTaken
        passed
        completedAt
      }
    }
  }
`;


export const analyticsApi = {
  getAnalytics: () => withMockFallback(
    'analytics.getAnalytics', async () => (
      await graphqlRequest<{ getAnalytics: AnalyticsData }>(
        GET_ANALYTICS_QUERY,
        undefined,
        { idempotent: true }
      )
    ).getAnalytics, () => Mock.MOCK_ANALYTICS
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
  getPlans: () => withMockFallback(
    'subscription.getPlans', async () => {
      throw new NotImplementedError('getPlans query not yet on schema');
    }, () => Mock.MOCK_PLANS
  ),

  initiatePayment: (input: InitiatePaymentInput) => withMockFallback(
    'subscription.initiatePayment', async () => (
      await graphqlRequest<
        { initiatePayment: InitiatePaymentResult },
        { input: InitiatePaymentInput }
      >(INITIATE_PAYMENT_MUTATION, { input })
    ).initiatePayment, () => Mock.buildMockInitiatePayment()
  ),

  verifyPayment: (input: VerifyPaymentInput) => withMockFallback(
    'subscription.verifyPayment', async () => (
      await graphqlRequest<
        { verifyPayment: Subscription },
        { input: VerifyPaymentInput }
      >(VERIFY_PAYMENT_MUTATION, { input })
    ).verifyPayment, () => ({
      subscriptionId: `mock-sub-${Date.now()}`,
      userId: Mock.MOCK_USER.uid,
      planId: 'plan-monthly',
      status: 'active' as const,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now()+30 * 86400000).toISOString(),
      autoRenew: true,
    })
  ),
};


// -----> Combined export - API
export const api = {
  user: userApi,
  friends: friendsApi,
  home: homeApi,
  quiz: quizApi,
  contest: contestApi,
  leaderboard: leaderboardApi,
  chat: chatApi,
  analytics: analyticsApi,
  achievement: achievementApi,
  studyPlan: studyPlanApi,
  subscription: subscriptionApi,
};

export * from './api.errors';
