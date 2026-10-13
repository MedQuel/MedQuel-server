import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { registerDeviceToken, unregisterDeviceToken } from '../../services/notificationService.js';
import { getNotifications, getUnreadNotificationCount } from '../../services/notificationService.js';
import { markNotificationRead, markAllNotificationsRead } from '../../services/notificationService.js';


export async function getNotificationsResolver(
  _parent: unknown,
  args: { limit?: number; cursor?: string },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return getNotifications(context.user.uid, args, context.db);
}

export async function getUnreadNotificationCountResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getUnreadNotificationCount(
    context.user.uid,
    context.db
  );
}

export async function markNotificationReadResolver(
  _parent: unknown,
  args: { notificationId: string },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return markNotificationRead(
    context.user.uid,
    args.notificationId,
    context.db
  );
}

export async function markAllNotificationsReadResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return markAllNotificationsRead(
    context.user.uid,
    context.db
  );
}

export async function registerDeviceTokenResolver(
  _parent: unknown,
  args: { token: string },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return registerDeviceToken(
    context.user.uid,
    args.token,
    context.db
  );
}

export async function unregisterDeviceTokenResolver(
  _parent: unknown,
  args: { token: string },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return unregisterDeviceToken(
    context.user.uid,
    args.token,
    context.db
  );
}
