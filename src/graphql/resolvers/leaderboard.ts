import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import type { LeaderboardPeriodInput } from '../../utils/leaderboardPeriod.js';
import { getLeaderboard, type LeaderboardScopeInput } from '../../services/leaderboardService.js';


export async function getLeaderboardResolver(
  _parent: unknown,
  args: { period: LeaderboardPeriodInput; scope: LeaderboardScopeInput },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return getLeaderboard(
    context.user.uid,
    context.db,
    args.scope ?? 'global',
    args.period
  );
}
