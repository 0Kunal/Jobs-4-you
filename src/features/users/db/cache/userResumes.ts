import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserResumeGlobalTag() {
  return getGlobalTag("userResumes");
}

export function getUserResumeIdTag(userId: string) {
  return getIdTag("userResumes", userId);
}

export function revalidateUserCache(userId: string) {
  revalidateTag(getUserResumeGlobalTag());
  revalidateTag(getUserResumeIdTag(userId));
}
