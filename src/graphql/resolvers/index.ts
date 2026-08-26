import { getHomeDataResolver } from './home.js';
import { getAnalyticsResolver } from './analytics.js';
import { getLeaderboardResolver } from './leaderboard.js';
import { getAchievementsResolver } from './achievements.js';
import { completeOnboardingResolver } from './onboarding.js';
import { meResolver, updateProfileResolver } from './user.js';
import { updateNotifPrefsResolver, updateQuizPrefsResolver } from './user.js';
import { getTopicsForSubjectResolver, getQuizSessionResolver } from './quiz.js';
import { startQuizSessionResolver, submitQuizSessionResolver } from './quiz.js';
import { getContestsResolver, getContestResolver, joinContestResolver } from './contest.js';


export const resolvers = {
  Query: {
    me: meResolver,
    getHomeData: getHomeDataResolver,
    getTopicsForSubject: getTopicsForSubjectResolver,
    getQuizSession: getQuizSessionResolver,
    getContests: getContestsResolver,
    getContest: getContestResolver,
    getLeaderboard: getLeaderboardResolver,
    getAnalytics: getAnalyticsResolver,
    getAchievements: getAchievementsResolver,
  },
  Mutation: {
    completeOnboarding: completeOnboardingResolver,
    updateProfile: updateProfileResolver,
    updateQuizPrefs: updateQuizPrefsResolver,
    updateNotifPrefs: updateNotifPrefsResolver,
    joinContest: joinContestResolver,
    startQuizSession: startQuizSessionResolver,
    submitQuizSession: submitQuizSessionResolver,
  },
};
