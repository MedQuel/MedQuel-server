import { getHomeDataResolver } from './home.js';
import { getAnalyticsResolver } from './analytics.js';
import { getLeaderboardResolver } from './leaderboard.js';
import { getAchievementsResolver } from './achievements.js';
import { completeOnboardingResolver } from './onboarding.js';
import { meResolver, updateProfileResolver } from './user.js';
import { getContestsResolver, getContestResolver } from './contest.js';
import { getChallengeResolver, getChallengesResolver } from './challenge.js';
import { getTopPerformersResolver, joinContestResolver } from './contest.js';
import { updateNotifPrefsResolver, updateQuizPrefsResolver } from './user.js';
import { getTopicsForSubjectResolver, getQuizSessionResolver } from './quiz.js';
import { startQuizSessionResolver, submitQuizSessionResolver } from './quiz.js';
import { createChallengeResolver, respondChallengeResolver } from './challenge.js';
import { removeFriendResolver, getPendingFriendRequestsResolver } from './friends.js';
import { sendFriendRequestResolver, respondFriendRequestResolver } from './friends.js';
import { getUserProfileResolver, searchUsersResolver, getFriendsResolver } from './friends.js';
import { getStudyPlanResolver, generateStudyPlanResolver, markStudySessionCompleteResolver } from './studyPlan.js';


export const resolvers = {
  Query: {
    me: meResolver,
    getHomeData: getHomeDataResolver,
    getTopicsForSubject: getTopicsForSubjectResolver,
    getFriends: getFriendsResolver,
    getUserProfile: getUserProfileResolver,
    searchUsers: searchUsersResolver,
    getPendingFriendRequests: getPendingFriendRequestsResolver,
    getQuizSession: getQuizSessionResolver,
    getContests: getContestsResolver,
    getContest: getContestResolver,
    getChallenge: getChallengeResolver,
    getChallenges: getChallengesResolver,
    getLeaderboard: getLeaderboardResolver,
    getAnalytics: getAnalyticsResolver,
    getAchievements: getAchievementsResolver,
    getStudyPlan: getStudyPlanResolver,
  },
  Mutation: {
    completeOnboarding: completeOnboardingResolver,
    updateProfile: updateProfileResolver,
    updateQuizPrefs: updateQuizPrefsResolver,
    updateNotifPrefs: updateNotifPrefsResolver,
    sendFriendRequest: sendFriendRequestResolver,
    respondFriendRequest: respondFriendRequestResolver,
    removeFriend: removeFriendResolver,
    joinContest: joinContestResolver,
    startQuizSession: startQuizSessionResolver,
    submitQuizSession: submitQuizSessionResolver,
    createChallenge: createChallengeResolver,
    respondChallenge: respondChallengeResolver,
    generateStudyPlan: generateStudyPlanResolver,
    markStudySessionComplete: markStudySessionCompleteResolver,
  },
  Contest: {
    topPerformers: getTopPerformersResolver,
  }
};
