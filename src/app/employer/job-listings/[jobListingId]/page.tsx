import ActionButton from "@/components/ActionButton";
import { AsyncIf } from "@/components/AsyncIf";
import { MarkdownPartial } from "@/components/markdown/MarkdownPartial";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { db } from "@/drizzle/db";
import {
  JobListingApplicationTable,
  JobListingStatus,
  JobListingTable,
} from "@/drizzle/schema";
import ApplicationTable, {
  SkeletonApplicationTable,
} from "@/features/jobListingApplications/components/ApplicationTable";
import {
  deleteJobListing,
  toggleJobListingFeatured,
  toggleJobListingStatus,
} from "@/features/jobListings/actions/actions";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "@/features/jobListings/lib/planFeatureHelpers";
import { getNextJobListingStatus } from "@/features/jobListings/lib/utils";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { and, eq } from "drizzle-orm";
import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  StarIcon,
  StarOffIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { ReactNode, Suspense } from "react";

type Props = {
  params: Promise<{ jobListingId: string }>;
};

export default function JobListingPage(props: Props) {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
}

async function SuspendedPage({ params }: Props) {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return null;

  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);
  if (jobListing == null) return notFound();

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt-4">
          <AsyncIf
            condition={() => hasOrgUserPermission("org:job_listings:update")}
          >
            <Button asChild variant="outline">
              <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
                <EditIcon className="size-4" />
                Edit
              </Link>
            </Button>
          </AsyncIf>
          <StatusUpdateButton id={jobListing.id} status={jobListing.status} />
          {jobListing.status === "published" && (
            <FeaturedToggleButton
              id={jobListing.id}
              isFeatured={jobListing.isFeatured}
            />
          )}
          <AsyncIf
            condition={() => hasOrgUserPermission("org:job_listings:delete")}
          >
            <ActionButton
              variant="destructive"
              requireAreYouSure={true}
              action={deleteJobListing.bind(null, jobListing.id)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </ActionButton>
          </AsyncIf>
        </div>
      </div>
      <MarkdownPartial
        dialogTitle="Description"
        dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
        mainMarkdown={
          <MarkdownRenderer
            className="prose-sm"
            source={jobListing.description}
          />
        }
      />

      <Separator />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Applications</h2>
        <Suspense fallback={<SkeletonApplicationTable />}>
          <Applications jobListingId={jobListingId} />
        </Suspense>
      </div>
    </div>
  );
}

function StatusUpdateButton({
  id,
  status,
}: {
  id: string;
  status: JobListingStatus;
}) {
  const button = (
    <ActionButton
      variant="outline"
      action={toggleJobListingStatus.bind(null, id)}
      requireAreYouSure={getNextJobListingStatus(status) === "published"}
      areYouSureDescription="This will immediately show this job listing to all users."
    >
      {statusToggleButtonText(status)}
    </ActionButton>
  );
  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("org:job_listings:change_status")}
    >
      {getNextJobListingStatus(status) === "published" ? (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxPublishedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={statusToggleButtonText(status)}
              popoverText="You must upgrade your plan to publish more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      ) : (
        button
      )}
    </AsyncIf>
  );
}

function FeaturedToggleButton({
  id,
  isFeatured,
}: {
  id: string;
  isFeatured: boolean;
}) {
  const button = (
    <ActionButton
      variant="outline"
      action={toggleJobListingFeatured.bind(null, id)}
    >
      {featuredToggleButtonText(isFeatured)}
    </ActionButton>
  );
  return (
    <AsyncIf
      condition={() => hasOrgUserPermission("org:job_listings:change_status")}
    >
      {isFeatured ? (
        button
      ) : (
        <AsyncIf
          condition={async () => {
            const isMaxed = await hasReachedMaxFeaturedJobListings();
            return !isMaxed;
          }}
          otherwise={
            <UpgradePopover
              buttonText={featuredToggleButtonText(isFeatured)}
              popoverText="You must upgrade your plan to feature more job listings."
            />
          }
        >
          {button}
        </AsyncIf>
      )}
    </AsyncIf>
  );
}

function UpgradePopover({
  buttonText,
  popoverText,
}: {
  buttonText: ReactNode;
  popoverText: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {popoverText}
        <Button asChild>
          <Link href="/employer/pricing">Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function statusToggleButtonText(status: JobListingStatus) {
  switch (status) {
    case "delisted":
    case "draft":
      return (
        <>
          <EyeIcon className="size-4" />
          Publish
        </>
      );
    case "published":
      return (
        <>
          <EyeOffIcon className="size-4" />
          Delist
        </>
      );
    default:
      throw new Error(`Unknown status: ${status satisfies never}`);
  }
}

function featuredToggleButtonText(isFeatured: boolean) {
  if (isFeatured) {
    return (
      <>
        <StarOffIcon className="size-4" />
        UnFeature
      </>
    );
  }

  return (
    <>
      <StarIcon className="size-4" />
      Feature
    </>
  );
}

async function Applications({ jobListingId }: { jobListingId: string }) {
  const applications = await getJobListingApplications(jobListingId);

  return (
    <ApplicationTable
      applications={applications.map((a) => ({
        ...a,
        user: {
          ...a.user,
          resume: a.user.resume
            ? {
                ...a.user.resume,
                markdownSummary: a.user.resume.aiSummary ? (
                  <MarkdownRenderer source={a.user.resume.aiSummary} />
                ) : null,
              }
            : null,
        },
        coverLetterMarkdown: a.coverLetter ? (
          <MarkdownRenderer source={a.coverLetter} />
        ) : null,
      }))}
      canUpdateRating={await hasOrgUserPermission(
        "org:job_listing_applications:change_rating",
      )}
      canUpdateStage={await hasOrgUserPermission(
        "org:job_listing_applications:change_stage",
      )}
    />
  );
}

async function getJobListingApplications(jobListingId: string) {
  const data = await db.query.JobListingApplicationTable.findMany({
    where: eq(JobListingApplicationTable.jobListingId, jobListingId),
    columns: {
      coverLetter: true,
      createdAt: true,
      stage: true,
      rating: true,
      jobListingId: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
        with: {
          resume: {
            columns: {
              resumeFileUrl: true,
              aiSummary: true,
            },
          },
        },
      },
    },
  });

  return data;
}

async function getJobListing(id: string, orgId: string) {
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId),
    ),
  });
}
