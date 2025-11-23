"use server";

import z from "zod";
import { organizationUserSettingsSchema } from "./schemas";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { updateOrganizationUserSettings as updateOrganizationUserSettingDb } from "@/features/organizations/db/organizationUserSettings";

export async function updateOragnizationUserSettings(
  unsafeData: z.infer<typeof organizationUserSettingsSchema>
) {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  if (userId == null || orgId == null) {
    return {
      error: true,
      message: "You must be signed in to update notification settings",
    };
  }

  const { success, data } =
    organizationUserSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your notification settings",
    };
  }

  await updateOrganizationUserSettingDb(
    { userId, organizationId: orgId },
    data
  );

  return {
    error: false,
    message: "Successfully updated your notification settings",
  };
}
