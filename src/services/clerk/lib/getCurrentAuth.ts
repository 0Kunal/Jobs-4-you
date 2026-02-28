import { db } from "@/drizzle/db";
import { OrganizationTable, UserTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId } = await auth();

  return {
    userId,
    user: allData && userId != null ? await getUser(userId) : undefined,
  };
}

export async function getCurrentOrganization({ allData = false } = {}) {
  const { orgId } = await auth();

  return {
    orgId,
    organization:
      allData && orgId != null ? await getOrganization(orgId) : undefined,
  };
}

async function getUser(id: string) {
  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });
}

async function getOrganization(id: string) {
  return db.query.OrganizationTable.findFirst({
    where: eq(OrganizationTable.id, id),
  });
}
