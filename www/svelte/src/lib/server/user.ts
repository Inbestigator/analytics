import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function createUser(githubId: number, email: string, username: string): Promise<User> {
	const [result] = await db
		.insert(table.user)
		.values({
			githubId,
			email,
			username
		})
		.returning();
	if (!result) {
		throw new Error('Unexpected error');
	}
	return result;
}

export async function getUserFromGitHubId(githubId: number): Promise<User | null> {
	const [result] = await db
		.select()
		.from(table.user)
		.where(eq(table.user.githubId, githubId))
		.limit(1);
	if (!result) {
		return null;
	}
	return result;
}

export async function getProjects(userId: string): Promise<Project[]> {
	const projects = await db.select().from(table.project).where(eq(table.project.ownerId, userId));
	return projects;
}

export interface User {
	id: string;
	githubId: number;
	email: string;
	username: string;
}

export interface Project {
	id: string;
	name: string;
	createdAt: Date;
	ownerId: string;
}
