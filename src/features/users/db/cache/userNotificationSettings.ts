import { getGlobalTag, getIdlTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserNotificationSettingsGlobalTag() {
  return getGlobalTag("userNotificationSettings");
}

export function getUserNotificationSettingsIdTag(userId: string) {
  return getIdlTag("userNotificationSettings", userId);
}

export function revalidateUserNotificationSettingsCache(userId: string) {
  revalidateTag(getUserNotificationSettingsGlobalTag());
  revalidateTag(getUserNotificationSettingsIdTag(userId));
}
