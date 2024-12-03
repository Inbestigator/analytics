// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/user').User | null;
			session: import('$lib/server/session').Session | null;
		}
	}
}

export {};
