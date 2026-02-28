import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import { DropzoneClient } from "./_DropzoneClient";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/drizzle/schema";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";

export default function UserResumePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Upload Your Resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient />
        </CardContent>
        <Suspense>
          <ResumeDetails />
        </Suspense>
      </Card>
      <Suspense>
        <AISummaryCard />
      </Suspense>
    </div>
  );
}

async function ResumeDetails() {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const userResume = await getUserResume(userId);
  if (userResume == null) return null;

  return (
    <CardFooter>
      <Button asChild>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={userResume.resumeFileUrl}
        >
          View Resume
        </Link>
      </Button>
    </CardFooter>
  );
}

async function AISummaryCard() {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const userResume = await getUserResume(userId);
  if (userResume == null || userResume.aiSummary == null) return null;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>AI Summary</CardTitle>
        <CardDescription>
          This s AI-generated summary of your resume. This is used by employers
          to quickly understand your qualifcations and experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MarkdownRenderer source={userResume.aiSummary} />
      </CardContent>
    </Card>
  );
}

async function getUserResume(userId: string) {
  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
  });
}
