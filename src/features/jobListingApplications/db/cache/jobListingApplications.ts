import { getGlobalTag, getIdTag, getJobListingTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobListingApplicationGlobalTag() {
  return getGlobalTag("jobListingApplications");
}

export function getJobListingApplicationJobListingTag(jobListingId: string) {
  return getJobListingTag("jobListingApplications", jobListingId);
}

export function getJobListingApplcationIdTag({
  userId,
  jobListingId,
}: {
  userId: string;
  jobListingId: string;
}) {
  return getIdTag("jobListingApplications", `${jobListingId}-${userId}`);
}

export function revalidateJobListingApplcationCache(id: {
  userId: string;
  jobListingId: string;
}) {
  revalidateTag(getJobListingApplicationGlobalTag());
  revalidateTag(getJobListingApplicationJobListingTag(id.jobListingId));
  revalidateTag(getJobListingApplcationIdTag(id));
}
