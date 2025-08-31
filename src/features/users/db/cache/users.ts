import { getGlobalTag, getIdlTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getUserGlobalTag() {
  return getGlobalTag("users");
}

export function getUserIdTag(id: string) {
  return getIdlTag("users", id);
}

export function revalidateUserCache(id: string) {
  revalidateTag(getUserGlobalTag());
  revalidateTag(getUserIdTag(id));
}
