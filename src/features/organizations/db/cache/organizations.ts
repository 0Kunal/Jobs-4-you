import { getGlobalTag, getIdlTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getOrganizationGlobalTag() {
  return getGlobalTag("organizations");
}

export function getOrganizationIdTag(id: string) {
  return getIdlTag("organizations", id);
}

export function revalidateOrganizationCache(id: string) {
  revalidateTag(getOrganizationGlobalTag());
  revalidateTag(getOrganizationIdTag(id));
}
