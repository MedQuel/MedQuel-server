import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { getHomeData } from '../../services/homeService.js';


export async function getHomeDataResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getHomeData(context.user.uid, context.db);
}
