<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<h2>Projects</h2>
<ul>
	{#each data.projects as project}
		<li>
			<a href={project.id}>{project.name}</a>
		</li>
	{/each}
</ul>
<a href="/dashboard/projects/new">Create</a>