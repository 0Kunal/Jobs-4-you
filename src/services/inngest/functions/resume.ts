import { db } from "@/drizzle/db";
import { inngest } from "../client";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/drizzle/schema";
import { env } from "@/data/env/server";
import { updateUserResume } from "@/features/users/db/userResumes";

export const createAiSummaryOfUploadedResume = inngest.createFunction(
  {
    id: "create-ai-summary-of-uploaded-resume",
    name: "Create AI Summary of Uploaded Resume",
  },
  { event: "app/resume.uploaded" },
  async ({ step, event }) => {
    const { id: userId } = event.user;

    const userResume = await step.run("get-user-resume", async () => {
      return await db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
        columns: { resumeFileUrl: true },
      });
    });

    if (userResume == null) return;

    // Download the PDF and embed as inline base64 so Gemini can read it
    const pdfBase64 = await step.run("download-resume-pdf", async () => {
      const res = await fetch(userResume.resumeFileUrl);
      if (!res.ok) {
        throw new Error(
          `Failed to download resume: ${res.status} ${res.statusText}`
        );
      }
      const buf = Buffer.from(await res.arrayBuffer());
      return buf.toString("base64");
    });

    const result = await step.ai.infer("create-ai-summary", {
      model: step.ai.models.gemini({
        model: "gemini-2.5-flash",
        defaultParameters: { generationConfig: { maxOutputTokens: 2048 } },
        apiKey: env.GEMINI_API_KEY,
      }),
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                text: "Summarize the following resume and extract all key skills, experience, and qualifications. The summary should include all the information that a hiring manager would need to know about the candidate in order to determine if they are a good fit for a job. This summary should be formatted as markdown. Do not return any other text. If the file does not look like a resume return the text 'N/A.",
              },
            ],
          },
        ],
      },
    });

    await step.run("save-ai-summary", async () => {
      const message = result.candidates?.[0]?.content?.parts[0] || null;
      if (message == null) return;

      await updateUserResume(userId, {
        aiSummary: (message as { text: string }).text,
      });
    });
  }
);
