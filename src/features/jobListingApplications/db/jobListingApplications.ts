import { db } from "@/drizzle/db";
import { JobListingApplicationTable } from "@/drizzle/schema";
import { revalidateJobListingApplcationCache } from "./cache/jobListingApplications";

export async function insertJobListingApplication(
  applicaton: typeof JobListingApplicationTable.$inferInsert
) {
  await db.insert(JobListingApplicationTable).values(applicaton);

  revalidateJobListingApplcationCache(applicaton);
}
