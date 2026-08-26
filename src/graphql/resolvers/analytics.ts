import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { getAnalytics } from '../../services/analyticsService.js';


export async function getAnalyticsResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getAnalytics(context.user.uid, context.db);
}
