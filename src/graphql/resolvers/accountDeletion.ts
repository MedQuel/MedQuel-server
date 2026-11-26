import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { deleteMyAccount } from '../../services/accountDeletionService.js';


export async function deleteMyAccountResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  return deleteMyAccount(
    context.user.uid,
    context.db,
    context.auth
  );
}
