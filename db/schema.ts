import { varchar, index, pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const profile = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('userId', { length: 255 }).unique().notNull(),
  name: varchar('name',{ length: 255 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
});

export const server = pgTable('servers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  inviteCode: text("inviteCode").notNull(),
  profileId: uuid('profileId')
    .notNull()
    .references(() => profile.id, {onDelete: 'cascade'}),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull().$onUpdate(() => new Date()),
}, (table) => {
  return {
    profileIdx: index('server_profile_idx').on(table.profileId),
  }
});

export const MemberRoleEnum = pgEnum('member_role', [
  'ADMIN',
  'MODERATOR',
  'GUEST',
]);

export const member = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: MemberRoleEnum('role')
    .notNull()
    .default('GUEST'),
  profileId: uuid('profileId')
    .notNull()
    .references(() => profile.id, {onDelete: 'cascade'}),
  serverId: uuid('serverId')
    .notNull()
    .references(() => server.id, {onDelete: 'cascade'}),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull().$onUpdate(() => new Date()),
}, (table) => {
  return {
    profileIdx: index('member_profile_idx').on(table.profileId),
    serverIdx: index('member_server_idx').on(table.serverId),
  }
});

export const ChannelTypeEnum = pgEnum('channel_type', [
  'TEXT',
  'VOICE',
]);

export const channel = pgTable('channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: ChannelTypeEnum('type')
    .notNull()
    .default('TEXT'),
  profileId: uuid('profileId')
    .notNull()
    .references(() => profile.id, {onDelete: 'cascade'}),
  serverId: uuid('serverId')
    .notNull()
    .references(() => server.id, {onDelete: 'cascade'}),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull().$onUpdate(() => new Date()),
}, (table) => {
  return {
    profileIdx: index('channel_profile_idx').on(table.profileId),
    serverIdx: index('channel_server_idx').on(table.serverId),
  }
});



export type InsertProfile = typeof profile.$inferInsert;
export type SelectProfile = typeof profile.$inferSelect;

export type InsertServer = typeof server.$inferInsert;
export type SelectServer = typeof server.$inferSelect;

export type InsertMember = typeof member.$inferInsert;
export type SelectMember = typeof member.$inferSelect;

export type InsertChannel = typeof channel.$inferInsert;
export type SelectChannel = typeof channel.$inferSelect;