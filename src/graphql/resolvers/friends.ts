import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { getUserProfile, removeFriend, searchUsers, getFriends } from '../../services/friendsService.js';
import { sendFriendRequest, respondFriendRequest, getPendingFriendRequests } from '../../services/friendsService.js';


export async function sendFriendRequestResolver(_parent: unknown, args: { toUid: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return sendFriendRequest(
    context.user.uid,
    args.toUid,
    context.db
  );
}

export async function respondFriendRequestResolver(_parent: unknown, args: { requestId: string; accept: boolean }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return respondFriendRequest(
    context.user.uid,
    args.requestId,
    args.accept,
    context.db
  );
}

export async function removeFriendResolver(_parent: unknown, args: { friendUid: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return removeFriend(
    context.user.uid,
    args.friendUid,
    context.db
  );
}

export async function getUserProfileResolver(_parent: unknown, args: { uid: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getUserProfile(
    context.user.uid,
    args.uid,
    context.db
  );
}

export async function searchUsersResolver(_parent: unknown, args: { query: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return searchUsers(
    context.user.uid,
    args.query,
    context.db
  );
}

export async function getPendingFriendRequestsResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getPendingFriendRequests(
    context.user.uid,
    context.db
  );
}

export async function getFriendsResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getFriends(
    context.user.uid,
    context.db
  );
}
