import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const user = sqliteTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	githubId: integer('githubId').unique().notNull(),
	email: text('email').notNull().unique(),
	username: text('username').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const project = sqliteTable('project', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text('name').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id)
});

export const key = sqliteTable('key', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	projectId: text('project_id')
		.notNull()
		.references(() => project.id),
	key: text('key').notNull().unique(),
	type: text('type', { enum: ['public', 'private'] }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const capture = sqliteTable('capture', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	projectId: text('project_id')
		.notNull()
		.references(() => project.id),
	message: text('message').notNull(),
	data: text('data', { mode: 'json' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
