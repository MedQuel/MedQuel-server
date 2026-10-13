import type { AppNotification } from '../types/types';
import type { useTheme } from '../../theme/ThemeContext';
import { parseNotificationData } from './notificationRoutes';


export function getNotificationText(
  n: AppNotification,
  theme: ReturnType<typeof useTheme>['theme']
): { title: string; body: string } {
  const t = theme.i18n.t.bind(theme.i18n);
  const data = parseNotificationData(n.data);
  const params = {
    ...data,
    actorName: data.actorName || t('notifications.someone'),
  };

  return {
    title: t(`notifications.kinds.${n.kind}.title`, { ...params, defaultValue: n.title }),
    body: t(`notifications.kinds.${n.kind}.body`, { ...params, defaultValue: n.body }),
  };
}
