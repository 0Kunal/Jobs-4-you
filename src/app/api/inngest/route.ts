import { inngest } from "@/services/inngest/client";
import {
  clerkCreateUser,
  clerkDeleteUser,
  clerkUpdateUser,
  clerkCreateOrganization,
  clerkUpdateOrganization,
  clerkDeleteOrganization,
  clerkCreateOrgMembership,
  clerkDeleteOrgMembership,
} from "@/services/inngest/functions/clerk";
import {
  prepareDailyOrganizationUserApplicationNotifications,
  prepareDailyUserJobListingNotifications,
  sendDailyOrganizationUserApplicationEmail,
  sendDailyUserJobListingEmail,
} from "@/services/inngest/functions/email";
import { rankApplicaton } from "@/services/inngest/functions/jobListingApplication";
import { createAiSummaryOfUploadedResume } from "@/services/inngest/functions/resume";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkUpdateUser,
    clerkDeleteUser,
    clerkCreateOrganization,
    clerkUpdateOrganization,
    clerkDeleteOrganization,
    clerkCreateOrgMembership,
    clerkDeleteOrgMembership,
    createAiSummaryOfUploadedResume,
    rankApplicaton,
    prepareDailyUserJobListingNotifications,
    sendDailyUserJobListingEmail,
    prepareDailyOrganizationUserApplicationNotifications,
    sendDailyOrganizationUserApplicationEmail,
  ],
});
