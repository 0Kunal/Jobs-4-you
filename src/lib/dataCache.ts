type CacheTag =
  | "users"
  | "organizations"
  | "jobListings"
  | "userNotificationSettings"
  | "userResumes"
  | "jobListingApplications"
  | "organizationUserSettings";

export function getGlobalTag(tag: CacheTag) {
  return `global:${tag}` as const;
}

export function getOrganizationTag(tag: CacheTag, organizationId: string) {
  return `organization:${organizationId}-${tag}` as const;
}

export function getIdlTag(tag: CacheTag, id: string) {
  return `global:${id}-${tag}` as const;
}
