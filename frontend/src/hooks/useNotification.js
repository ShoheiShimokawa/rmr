import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getNotificationAll, markAllAsDone } from "../api/notification";
import { queryKeys } from "../api/queryKeys";

// 他人の操作で頻繁に変わりうる社交的データなので、投稿フィード等より短め
const SOCIAL_STALE_TIME = 1000 * 30;

/** 自分宛の通知一覧を返します。 */
export const useNotifications = (userId) => {
  return useQuery({
    queryKey: queryKeys.notifications(userId),
    queryFn: async () => {
      const result = await getNotificationAll();
      return result.data;
    },
    enabled: !!userId,
    staleTime: SOCIAL_STALE_TIME,
  });
};

/** 未読の通知があるかどうかを返します。(ヘッダー/ボトムナビのバッジ表示用) */
export const useHasUnreadNotification = (userId) => {
  const { data: notifications = [] } = useNotifications(userId);
  return notifications.some((notification) => notification.statusType === "NONE");
};

/** 通知を全て既読にします。 */
export const useMarkNotificationsAsDoneMutation = (userId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsDone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
    },
  });
};
