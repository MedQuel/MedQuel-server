import { rootTypeDefs } from './root.js';
import { userTypeDefs } from './user.js';
import { homeTypeDefs } from './home.js';
import { quizTypeDefs } from './quiz.js';
import { friendsTypeDefs } from './friends.js';
import { contestTypeDefs } from './contest.js';
import { analyticsTypeDefs } from './analytics.js';
import { studyPlanTypeDefs } from './studyPlan.js';
import { challengeTypeDefs } from './challenge.js';
import { leaderboardTypeDefs } from './leaderboard.js';
import { achievementsTypeDefs } from './achievements.js';


export const typeDefs = [
  rootTypeDefs,
  userTypeDefs,
  quizTypeDefs,
  homeTypeDefs,
  friendsTypeDefs,
  contestTypeDefs,
  challengeTypeDefs,
  analyticsTypeDefs,
  leaderboardTypeDefs,
  achievementsTypeDefs,
  studyPlanTypeDefs,
];
