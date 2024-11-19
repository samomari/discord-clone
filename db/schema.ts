import { varchar, pgTable, text, timestamp, uuid, pgEnum, boolean, unique } from 'drizzle-orm/pg-core';

export const profile = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('userId', { length: 255 }).unique().notNull(),
  name: varchar('name',{ length: 255 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
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
  updatedAt: timestamp('updated_at').defaultNow(),
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
  updatedAt: timestamp('updated_at').defaultNow(),
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
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const message = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  fileUrl: text('fileUrl').default(null),
  fileType: text('fileType').default(null),
  memberId: uuid('memberId')
    .notNull()
    .references(() => member.id, { onDelete: 'cascade' }),
  channelId: uuid('channelId')
    .notNull()
    .references(() => channel.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const conversation = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberOneId: uuid('memberOneId')
    .notNull()
    .references(() => member.id, { onDelete: 'cascade' }),
  memberTwoId: uuid('memberTwoId')
    .notNull()
    .references(() => member.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow(),
}, (t) => ({
  unq: unique().on(t.memberOneId, t.memberTwoId),
}));

export const directMessage = pgTable('direct_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  fileUrl: text('fileUrl').default(null),
  fileType: text('fileType').default(null),
  memberId: uuid('memberId')
    .notNull()
    .references(() => member.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversationId')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),
  deleted: boolean('deleted').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export type InsertProfile = typeof profile.$inferInsert;
export type SelectProfile = typeof profile.$inferSelect;

export type InsertServer = typeof server.$inferInsert;
export type SelectServer = typeof server.$inferSelect;

export type InsertMember = typeof member.$inferInsert;
export type SelectMember = typeof member.$inferSelect;

export type InsertChannel = typeof channel.$inferInsert;
export type SelectChannel = typeof channel.$inferSelect;

export type InsertMessage = typeof message.$inferInsert;
export type SelectMessage = typeof message.$inferSelect;

export type InsertConversation = typeof conversation.$inferInsert;
export type SelectConversation = typeof conversation.$inferSelect;

export type InsertDirectMessage = typeof directMessage.$inferInsert;
export type SelectDirectMessage = typeof directMessage.$inferSelect;