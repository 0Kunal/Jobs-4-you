import { inngest } from "@/services/inngest/client";
import {
  clerkCreateUser,
  clerkDeleteUser,
  clerkUpdateUser,
  clerkCreateOrganization,
  clerkUpdateOrganization,
  clerkDeleteOrganization,
} from "@/services/inngest/functions/clerk";
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
    createAiSummaryOfUploadedResume,
  ],
});
