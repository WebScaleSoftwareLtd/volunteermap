import { pgTable, text, timestamp, boolean, integer, doublePrecision, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url'),
  userValidationId: uuid('user_validation_id').notNull().defaultRandom(),
  passwordDigest: text('password_digest').notNull(),
  twoFaToken: text('two_fa_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('users_username_unique').on(table.username),
  uniqueIndex('users_email_unique').on(table.email),
]);

// Opportunities table
export const opportunities = pgTable('opportunities', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  domainAssociationId: integer('domain_association_id').references(() => domainAssociations.id, { onDelete: 'set null' }),
  uuid: uuid('uuid').notNull().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  mentallyTaxing: boolean('mentally_taxing').notNull().default(false),
  physicallyTaxing: boolean('physically_taxing').notNull().default(false),
  timeFlexible: boolean('time_flexible').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('opportunities_uuid_unique').on(table.uuid),
  index('opportunities_user_id_idx').on(table.userId),
]);

// Domain Associations table
export const domainAssociations = pgTable('domain_associations', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  validationActive: boolean('validation_active').notNull().default(false),
  validationCheckCount: integer('validation_check_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('domain_associations_user_id_idx').on(table.userId),
]);

// Bookmarks table (join table)
export const bookmarks = pgTable('bookmarks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  opportunityId: integer('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('bookmarks_user_opportunity_unique').on(table.userId, table.opportunityId),
]);

// User Tokens table (session tokens)
export const userTokens = pgTable('user_tokens', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: uuid('token').notNull().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_tokens_token_unique').on(table.token),
  index('user_tokens_user_id_idx').on(table.userId),
]);

// Half Tokens table (2FA intermediate state)
export const halfTokens = pgTable('half_tokens', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: uuid('token').notNull().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('half_tokens_token_unique').on(table.token),
  index('half_tokens_user_id_idx').on(table.userId),
]);

// Password Update Requests table
export const passwordUpdateRequests = pgTable('password_update_requests', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: uuid('token').notNull().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('password_update_requests_token_unique').on(table.token),
  index('password_update_requests_user_id_idx').on(table.userId),
]);

// Email Update Requests table
export const emailUpdateRequests = pgTable('email_update_requests', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  token: text('token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('email_update_requests_token_unique').on(table.token),
  uniqueIndex('email_update_requests_user_id_unique').on(table.userId),
]);

// User Backup Codes table
export const userBackupCodes = pgTable('user_backup_codes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  backupCode: text('backup_code').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('user_backup_codes_user_id_idx').on(table.userId),
]);

// Pending Signups table
export const pendingSignups = pgTable('pending_signups', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').notNull(),
  emailToken: uuid('email_token').notNull().defaultRandom(),
  redirectTo: text('redirect_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('pending_signups_email_token_unique').on(table.emailToken),
]);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  opportunities: many(opportunities),
  domainAssociations: many(domainAssociations),
  userTokens: many(userTokens),
  halfTokens: many(halfTokens),
  passwordUpdateRequests: many(passwordUpdateRequests),
  emailUpdateRequest: one(emailUpdateRequests),
  userBackupCodes: many(userBackupCodes),
  bookmarks: many(bookmarks),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  user: one(users, {
    fields: [opportunities.userId],
    references: [users.id],
  }),
  domainAssociation: one(domainAssociations, {
    fields: [opportunities.domainAssociationId],
    references: [domainAssociations.id],
  }),
  bookmarks: many(bookmarks),
}));

export const domainAssociationsRelations = relations(domainAssociations, ({ one, many }) => ({
  user: one(users, {
    fields: [domainAssociations.userId],
    references: [users.id],
  }),
  opportunities: many(opportunities),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  opportunity: one(opportunities, {
    fields: [bookmarks.opportunityId],
    references: [opportunities.id],
  }),
}));

export const userTokensRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
  }),
}));

export const halfTokensRelations = relations(halfTokens, ({ one }) => ({
  user: one(users, {
    fields: [halfTokens.userId],
    references: [users.id],
  }),
}));

export const passwordUpdateRequestsRelations = relations(passwordUpdateRequests, ({ one }) => ({
  user: one(users, {
    fields: [passwordUpdateRequests.userId],
    references: [users.id],
  }),
}));

export const emailUpdateRequestsRelations = relations(emailUpdateRequests, ({ one }) => ({
  user: one(users, {
    fields: [emailUpdateRequests.userId],
    references: [users.id],
  }),
}));

export const userBackupCodesRelations = relations(userBackupCodes, ({ one }) => ({
  user: one(users, {
    fields: [userBackupCodes.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
export type DomainAssociation = typeof domainAssociations.$inferSelect;
export type NewDomainAssociation = typeof domainAssociations.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type UserToken = typeof userTokens.$inferSelect;
export type HalfToken = typeof halfTokens.$inferSelect;
export type PasswordUpdateRequest = typeof passwordUpdateRequests.$inferSelect;
export type EmailUpdateRequest = typeof emailUpdateRequests.$inferSelect;
export type UserBackupCode = typeof userBackupCodes.$inferSelect;
export type PendingSignup = typeof pendingSignups.$inferSelect;

// Category enum
export const OPPORTUNITY_CATEGORIES = [
  'Animal Shelter',
  'Homeless Services',
  'Food Bank',
  'Soup Kitchen',
  'Humanitarian Aid',
  'Environmental Action',
  'Demonstrations',
  'Other',
] as const;

export type OpportunityCategory = typeof OPPORTUNITY_CATEGORIES[number];
