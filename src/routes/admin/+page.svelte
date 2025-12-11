<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	
	let pages = $state([]);
	let icons = $state([]);
	let images = $state([]);
	let loading = $state(true);
	let error = $state('');
	
	onMount(async () => {
		try {
			const [pagesResponse, iconsResponse, imagesResponse] = await Promise.all([
				fetch('/api/admin/pages'),
				fetch('/api/admin/icons'),
				fetch('/api/admin/images')
			]);
			
			if (pagesResponse.ok) {
				const data = await pagesResponse.json();
				pages = data.pages || [];
			} else {
				error = 'Failed to load pages';
			}
			
			if (iconsResponse.ok) {
				const iconsData = await iconsResponse.json();
				icons = iconsData.icons || [];
			}
			
			if (imagesResponse.ok) {
				const imagesData = await imagesResponse.json();
				images = imagesData.images || [];
			}
		} catch (err) {
			error = 'An error occurred while loading data';
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
		<h1 class="text-foreground mb-2 font-serif text-3xl font-semibold">Admin Dashboard</h1>
		<p class="text-muted-foreground text-sm">
			Manage your ConnectED site content and assets.
		</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading...</div>
		</div>
	{:else if error}
		<div class="bg-destructive/10 text-destructive rounded-lg p-4">
			{error}
		</div>
	{:else}
		<div class="grid gap-8 lg:grid-cols-4">
			<!-- Main Content: Pages Section -->
			<div class="lg:col-span-3">
				{#if pages.length === 0}
					<div class="bg-card border-border rounded-xl border p-8 text-center">
						<p class="text-muted-foreground">No pages found. Pages will be created automatically.</p>
					</div>
				{:else}
					<div class="grid gap-4 md:grid-cols-2">
						{#each pages as page}
							<button
								onclick={() => editPage(page.id)}
								class="bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 group relative flex flex-col rounded-xl border-2 p-6 text-left transition-all duration-200"
							>
								<div class="mb-3 flex items-center justify-between">
									<h3 class="text-foreground font-semibold">{page.title}</h3>
									<svg
										class="text-primary group-hover:translate-x-1 h-5 w-5 transition-all"
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

			<!-- Sidebar: Icons & Images -->
			<div class="lg:col-span-1">
				<div class="space-y-6">
					<!-- Icons Section -->
					<a
						href="/admin/icons"
						class="bg-secondary/50 border-border hover:bg-secondary group block rounded-xl border p-5 transition-colors"
					>
						<div class="mb-3 flex items-center justify-between">
							<h3 class="text-foreground text-sm font-semibold">Icons</h3>
							<svg
								class="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors"
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
						<p class="text-primary mb-2 text-2xl font-bold">{icons.length}</p>
						<p class="text-muted-foreground text-xs">Total icons</p>
					</a>

					<!-- Images Section -->
					<a
						href="/admin/images"
						class="bg-secondary/50 border-border hover:bg-secondary group block rounded-xl border p-5 transition-colors"
					>
						<div class="mb-3 flex items-center justify-between">
							<h3 class="text-foreground text-sm font-semibold">Images</h3>
							<svg
								class="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors"
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
						<p class="text-primary mb-2 text-2xl font-bold">{images.length}</p>
						<p class="text-muted-foreground text-xs">Total images</p>
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
