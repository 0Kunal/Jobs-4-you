import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "@/drizzle/schemaHelpers";
import { UserTable } from "./user";
import { OrganizationTable } from "./organization";
import { relations } from "drizzle-orm";

export const OrganizationUserSettingsTable = pgTable(
  "organization_user_settings",
  {
    userId: varchar()
      .references(() => UserTable.id)
      .notNull(),
    organizationId: varchar()
      .references(() => OrganizationTable.id)
      .notNull(),
    newApplicationEmailNotifications: boolean().notNull().default(false),
    minimumRating: integer(),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.organizationId] })]
);

export const organizationUserSettingsRelations = relations(
  OrganizationUserSettingsTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [OrganizationUserSettingsTable.userId],
      references: [UserTable.id],
    }),
    organization: one(OrganizationTable, {
      fields: [OrganizationUserSettingsTable.organizationId],
      references: [OrganizationTable.id],
    }),
  })
);
