<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	let pages = $state([]);
	let loading = $state(true);
	let error = $state('');
	
	onMount(async () => {
		try {
			const response = await fetch('/api/admin/pages');
			if (response.ok) {
				const data = await response.json();
				pages = data.pages || [];
			} else {
				error = 'Failed to load pages';
			}
		} catch (err) {
			error = 'An error occurred while loading pages';
		} finally {
			loading = false;
		}
	});
	
	function editPage(id) {
		goto(`/admin/pages/${id}`);
	}
</script>

<svelte:head>
	<title>Admin Dashboard – ConnectED</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8">
		<h1 class="text-foreground mb-2 font-serif text-3xl font-semibold">Page Management</h1>
		<p class="text-muted-foreground text-sm">
			Select a page to edit its content. Changes will be visible on the frontend immediately after saving.
		</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading pages...</div>
		</div>
	{:else if error}
		<div class="bg-destructive/10 text-destructive rounded-lg p-4">
			{error}
		</div>
	{:else if pages.length === 0}
		<div class="bg-card border-border rounded-xl border p-8 text-center">
			<p class="text-muted-foreground">No pages found. Pages will be created automatically.</p>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each pages as page}
				<button
					onclick={() => editPage(page.id)}
					class="bg-card border-border hover:bg-secondary group flex flex-col rounded-xl border p-6 text-left transition-colors"
				>
					<div class="mb-3 flex items-center justify-between">
						<h3 class="text-foreground font-semibold">{page.title}</h3>
						<svg
							class="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
					{#if page.updatedAt}
						<p class="text-muted-foreground text-xs">
							Updated: {new Date(page.updatedAt).toLocaleDateString()}
						</p>
					{:else}
						<p class="text-muted-foreground text-xs">Not yet edited</p>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>
