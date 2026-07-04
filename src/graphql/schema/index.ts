import { rootTypeDefs } from './root.js';
import { userTypeDefs } from './user.js';
import { quizTypeDefs } from './quiz.js';

// ApolloServer accepts an array of SDL strings directly
export const typeDefs = [rootTypeDefs, userTypeDefs, quizTypeDefs];
