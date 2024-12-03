import { redirect } from '@sveltejs/kit';

import type { RequestEvent } from './$types';
import { getProjects } from '$lib/server/user';

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	const projects = await getProjects(event.locals.user.id);
	return {
		user: event.locals.user,
		projects
	};
}
