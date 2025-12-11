<script>
	import { page } from '$app/stores';
	import IconPickerModal from '$lib/components/icon-picker-modal.svelte';
	import ImagePickerModal from '$lib/components/image-picker-modal.svelte';
	import HtmlEditor from '$lib/components/html-editor.svelte';

	const sectionLinks = [
		{ key: 'hero', label: 'Hero' },
		{ key: 'painPoints', label: 'Pain Points' },
		{ key: 'solutions', label: 'Solutions' },
		{ key: 'features', label: 'Solutions (cards)' },
		{ key: 'mission', label: 'Mission' },
		{ key: 'detailedSections', label: 'Detailed' },
		{ key: 'cta', label: 'CTA' },
		{ key: 'contactInfo', label: 'Contact' },
		{ key: 'faq', label: 'FAQ' },
		{ key: 'values', label: 'Values' }
	];

	let pageData = $state(null);
	let sections = $state(null);
	let icons = $state([]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state(false);
	let iconPickerOpen = $state(false);
	let iconPickerContext = $state({ path: '', index: null }); // Stores the path to update (e.g., 'features.0.iconId')
	let imagePickerOpen = $state(false);
	let imagePickerContext = $state({ path: '' });
	let images = $state([]);

	function deepClone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	function openIconPicker(path, index = null) {
		iconPickerContext = { path, index };
		iconPickerOpen = true;
	}

	function closeIconPicker() {
		iconPickerOpen = false;
		iconPickerContext = { path: '', index: null };
	}

	function handleIconSelect(iconId) {
		if (!iconPickerContext.path) return;

		const pathParts = iconPickerContext.path.split('.');
		
		// Handle array items (e.g., features.0.iconId or values.items.0.iconId)
		if (pathParts.length >= 3) {
			let target = sections;
			// Navigate to the parent object
			for (let i = 0; i < pathParts.length - 2; i++) {
				if (!target) return;
				target = target[pathParts[i]];
			}
			// Get the index
			const index = parseInt(pathParts[pathParts.length - 2]);
			const field = pathParts[pathParts.length - 1];
			if (target && Array.isArray(target) && target[index]) {
				target[index][field] = iconId;
			} else if (target && target[index]) {
				// Handle nested arrays like values.items[0]
				target[index][field] = iconId;
			}
		} else {
			// Object property (e.g., features.entryPaths.iconId)
			let target = sections;
			for (let i = 0; i < pathParts.length - 1; i++) {
				if (!target) return;
				target = target[pathParts[i]];
			}
			if (target) {
				target[pathParts[pathParts.length - 1]] = iconId;
			}
		}
		closeIconPicker();
	}

	function getSelectedIconId(path, index = null) {
		if (!path || !sections) return '';
		
		const pathParts = path.split('.');
		
		// Handle array items (e.g., features.0.iconId or values.items.0.iconId)
		if (pathParts.length >= 3) {
			let target = sections;
			// Navigate to the parent object
			for (let i = 0; i < pathParts.length - 2; i++) {
				if (!target) return '';
				target = target[pathParts[i]];
			}
			// Get the index
			const idx = parseInt(pathParts[pathParts.length - 2]);
			const field = pathParts[pathParts.length - 1];
			if (target && Array.isArray(target) && target[idx]) {
				return target[idx][field] || '';
			} else if (target && target[idx]) {
				// Handle nested arrays like values.items[0]
				return target[idx][field] || '';
			}
		} else {
			// Object property (e.g., features.entryPaths.iconId)
			let target = sections;
			for (let i = 0; i < pathParts.length; i++) {
				if (!target) return '';
				target = target[pathParts[i]];
			}
			return target || '';
		}
		return '';
	}

function openImagePicker(path) {
	imagePickerContext = { path };
	imagePickerOpen = true;
}

function closeImagePicker() {
	imagePickerOpen = false;
	imagePickerContext = { path: '' };
}

function handleImageSelect(url) {
	if (!url || !imagePickerContext.path || !sections) {
		closeImagePicker();
		return;
	}

	const parts = imagePickerContext.path.split('.');
	let target = sections;
	for (let i = 0; i < parts.length - 1; i++) {
		if (!target[parts[i]]) target[parts[i]] = {};
		target = target[parts[i]];
	}
	target[parts[parts.length - 1]] = url;
	closeImagePicker();
}

	function scrollToSection(id) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	async function loadIcons() {
		try {
			const response = await fetch('/api/icons');
			if (response.ok) {
				const data = await response.json();
				icons = data.icons || [];
			}
		} catch (error) {
			console.error('Failed to load icons:', error);
		}
	}

async function loadImages() {
	try {
		const response = await fetch('/api/admin/images');
		if (response.ok) {
			const data = await response.json();
			images = data.images || [];
		}
	} catch (error) {
		console.error('Failed to load images:', error);
	}
}

	$effect(() => {
		const id = $page.params.id;

		if (!id) {
			error = 'Page ID is required';
			loading = false;
			return;
		}

		loading = true;
		error = '';

		(async () => {
		try {
			const response = await fetch(`/api/admin/pages/${id}`);
			const data = await response.json();
			
			if (response.ok) {
					pageData = data.page;
					sections = pageData.sections ? deepClone(pageData.sections) : null;
					await loadIcons();
					await loadImages();
			} else {
				error = data.error || `Failed to load page (${response.status})`;
				console.error('[Page Editor] Failed to load page:', data);
			}
		} catch (err) {
			error = `An error occurred while loading the page: ${err.message}`;
			console.error('[Page Editor] Error:', err);
		} finally {
			loading = false;
		}
		})();
	});
	
	async function handleSave() {
		const id = $page.params.id;

		if (!id) {
			error = 'Page ID is required';
			return;
		}

		saving = true;
		error = '';
		success = false;
		
		try {
			const response = await fetch('/api/admin/pages', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id, sections })
			});
			
			const data = await response.json();
			
			if (response.ok) {
				success = true;
				pageData = data.page;
				setTimeout(() => {
					success = false;
				}, 3000);
			} else {
				error = data.error || 'Failed to save page';
			}
		} catch (err) {
			error = 'An error occurred while saving';
		} finally {
			saving = false;
		}
	}

</script>

<svelte:head>
	<title>Edit {pageData?.title || 'Page'} – Admin – ConnectED</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading page...</div>
		</div>
	{:else if error && !pageData}
		<div class="bg-destructive/10 text-destructive rounded-lg p-4">
			{error}
		</div>
	{:else if pageData}
		<div class="mb-6 space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-foreground mb-1 font-serif text-2xl font-semibold">Edit: {pageData.title}</h1>
				</div>
			</div>
			<!-- Mobile quick links -->
			<div class="flex gap-2 overflow-x-auto lg:hidden items-center">
				{#each sectionLinks as link}
					{#if sections && sections[link.key]}
						<button
							type="button"
							onclick={() => scrollToSection(link.key)}
							class="text-sm whitespace-nowrap rounded-lg px-3 py-2 transition-colors bg-card/70 hover:bg-primary/10 hover:text-primary font-medium text-muted-foreground"
						>
							{link.label}
						</button>
					{/if}
				{/each}
				<div class="ml-auto flex gap-2 items-center">
					<button
						onclick={handleSave}
						disabled={saving}
						class="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
					>
						{saving ? 'Saving...' : 'Save'}
					</button>
				</div>
			</div>
		</div>

		{#if error}
			<div class="bg-destructive/10 text-destructive mb-4 rounded-lg p-3 text-sm">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="bg-primary/10 text-primary mb-4 rounded-lg p-3 text-sm">
				Page saved successfully! Changes are now visible on the frontend.
			</div>
		{/if}

		{#if sections}
			<div class="grid gap-6 lg:grid-cols-[170px,1fr]">
				<aside class="hidden lg:block">
					<div class="sticky top-24 space-y-2 rounded-xl bg-card/80 py-2 shadow-sm backdrop-blur">
						{#each sectionLinks as link}
							{#if sections && sections[link.key]}
								<button
									type="button"
									onclick={() => scrollToSection(link.key)}
									class="text-sm w-full rounded-lg py-2 text-left font-medium transition-colors hover:bg-primary/10 hover:text-primary text-muted-foreground"
								>
									{link.label}
								</button>
							{/if}
						{/each}
						<div class="pt-4 border-t border-border mt-2">
							<button
								onclick={handleSave}
								disabled={saving}
								class="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg px-4 py-2 w-full text-sm font-medium transition-colors"
							>
								{saving ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</div>
				</aside>

				<div class="space-y-6">
				{#if sections.hero}
					<div id="hero" class="bg-secondary rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">Hero Section</h2>
						<div class="space-y-4">
							{#each Object.entries(sections.hero) as [key, value]}
								{#if typeof value === 'string'}
									<div>
										<label class="text-foreground mb-2 block text-sm font-medium">
											{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
										</label>
										{#if key.includes('description')}
											<HtmlEditor bind:value={sections.hero[key]} />
										{:else}
											<input
												type="text"
												bind:value={sections.hero[key]}
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										{/if}
									</div>
								{:else if typeof value === 'object' && value !== null && !Array.isArray(value)}
									<div class="border-border rounded-lg border p-4">
										<h3 class="text-foreground mb-3 text-sm font-semibold">
											{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
										</h3>
										{#each Object.entries(value) as [subKey, subValue]}
											<div class="mb-3">
												<label class="text-foreground mb-1 block text-xs font-medium">
													{subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1')}
												</label>
												<input
													type="text"
													bind:value={sections.hero[key][subKey]}
													class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
												/>
											</div>
										{/each}
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				{#if sections.painPoints}
					<div id="painPoints" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">Pain Points Section</h2>
						{#if typeof sections.painPoints === 'object' && !Array.isArray(sections.painPoints)}
							<div class="mb-6 space-y-4">
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">Strapline</label>
									<input
										type="text"
										bind:value={sections.painPoints.strapline}
										class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">Heading</label>
									<input
										type="text"
										bind:value={sections.painPoints.heading}
										class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">Pain Points</label>
									<div class="space-y-3">
										{#each (sections.painPoints.items || []) as point, index}
											<div class="flex gap-2">
												<input
													type="text"
													bind:value={sections.painPoints.items[index]}
													class="border-input bg-background text-foreground flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
												/>
												<button
													type="button"
													onclick={() => sections.painPoints.items.splice(index, 1)}
													class="text-destructive hover:text-destructive/80 text-sm"
												>
													Remove
												</button>
											</div>
										{/each}
										<button
											type="button"
											onclick={() => {
												if (!sections.painPoints.items) sections.painPoints.items = [];
												sections.painPoints.items.push('');
											}}
											class="text-primary hover:text-primary/80 text-sm font-medium"
										>
											+ Add Pain Point
										</button>
									</div>
								</div>
							</div>
						{:else}
							<div class="space-y-3">
								{#each sections.painPoints as point, index}
									<div class="flex gap-2">
										<input
											type="text"
											bind:value={sections.painPoints[index]}
											class="border-input bg-background text-foreground flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
										<button
											type="button"
											onclick={() => sections.painPoints.splice(index, 1)}
											class="text-destructive hover:text-destructive/80 text-sm"
										>
											Remove
										</button>
									</div>
								{/each}
								<button
									type="button"
									onclick={() => sections.painPoints.push('')}
									class="text-primary hover:text-primary/80 text-sm font-medium"
								>
									+ Add Pain Point
								</button>
							</div>
						{/if}
					</div>
				{/if}

				{#if sections.solutions && sections.features}
					<div id="solutions" class="bg-secondary rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">Our Solutions</h2>
						<div class="mb-6 space-y-4">
							<div>
								<label class="text-foreground mb-2 block text-sm font-medium">Strapline</label>
								<input
									type="text"
									bind:value={sections.solutions.strapline}
									class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>
							<div>
								<label class="text-foreground mb-2 block text-sm font-medium">Heading</label>
								<input
									type="text"
									bind:value={sections.solutions.heading}
									class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>
						</div>
						{#if typeof sections.features === 'object' && sections.features !== null}
							<div class="grid gap-4 md:grid-cols-3">
								{#if sections.features.entryPaths}
									{@const feature = sections.features.entryPaths}
									<div class="bg-card border-border rounded-xl border p-6">
										<div class="mb-4">
											<button
												type="button"
												onclick={() => openIconPicker(`features.entryPaths.iconId`)}
												class="border-input bg-background text-foreground hover:bg-secondary flex h-12 w-12 items-center justify-center rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary mb-3"
											>
												{#if feature.iconId}
													{@html icons.find(i => i.id === feature.iconId)?.svg || ''}
												{:else}
													<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
													</svg>
												{/if}
											</button>
											<label class="text-foreground mb-2 block text-xs font-medium">Title</label>
											<input
												type="text"
												bind:value={sections.features.entryPaths.title}
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-3"
											/>
											<label class="text-foreground mb-2 block text-xs font-medium">Description</label>
											<HtmlEditor bind:value={sections.features.entryPaths.description} />
										</div>
									</div>
								{/if}
								{#if sections.features.exitPaths}
									{@const feature = sections.features.exitPaths}
									<div class="bg-card border-border rounded-xl border p-6">
										<div class="mb-4">
											<button
												type="button"
												onclick={() => openIconPicker(`features.exitPaths.iconId`)}
												class="border-input bg-background text-foreground hover:bg-secondary flex h-12 w-12 items-center justify-center rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary mb-3"
											>
												{#if feature.iconId}
													{@html icons.find(i => i.id === feature.iconId)?.svg || ''}
												{:else}
													<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
													</svg>
												{/if}
											</button>
											<label class="text-foreground mb-2 block text-xs font-medium">Title</label>
											<input
												type="text"
												bind:value={sections.features.exitPaths.title}
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-3"
											/>
											<label class="text-foreground mb-2 block text-xs font-medium">Description</label>
											<HtmlEditor bind:value={sections.features.exitPaths.description} />
										</div>
									</div>
								{/if}
								{#if sections.features.researcherPassport}
									{@const feature = sections.features.researcherPassport}
									<div class="bg-card border-border rounded-xl border p-6">
										<div class="mb-4">
											<button
												type="button"
												onclick={() => openIconPicker(`features.researcherPassport.iconId`)}
												class="border-input bg-background text-foreground hover:bg-secondary flex h-12 w-12 items-center justify-center rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary mb-3"
											>
												{#if feature.iconId}
													{@html icons.find(i => i.id === feature.iconId)?.svg || ''}
												{:else}
													<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
													</svg>
												{/if}
											</button>
											<label class="text-foreground mb-2 block text-xs font-medium">Title</label>
											<input
												type="text"
												bind:value={sections.features.researcherPassport.title}
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-3"
											/>
											<label class="text-foreground mb-2 block text-xs font-medium">Description</label>
											<HtmlEditor bind:value={sections.features.researcherPassport.description} />
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				{#if sections.features && typeof sections.features === 'object' && sections.features !== null}
					{#if sections.features.entryPaths && (sections.features.entryPaths.items || sections.features.entryPaths.image || sections.features.entryPaths.strapline || sections.features.entryPaths.heading)}
						{@const featureValue = sections.features.entryPaths}
						<div id="entryPaths" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
							<h2 class="text-foreground mb-4 font-semibold">Entry Paths Detail</h2>
							<div class="space-y-4">
								{#if featureValue.strapline !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Strapline</label>
										<input
											type="text"
											bind:value={sections.features.entryPaths.strapline}
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
								{/if}
								{#if featureValue.heading !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Heading</label>
										<input
											type="text"
											bind:value={sections.features.entryPaths.heading}
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
								{/if}
								{#if featureValue.image !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Image</label>
										<button
											type="button"
											onclick={() => openImagePicker(`features.entryPaths.image`)}
											class="border-input bg-background text-foreground hover:bg-secondary flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
										>
											{#if sections.features.entryPaths.image}
												<div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
													<img src={sections.features.entryPaths.image} alt="Selected image" class="h-full w-full object-cover" />
												</div>
												<span class="text-left truncate">{sections.features.entryPaths.image}</span>
											{:else}
												<div class="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
													<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
													</svg>
												</div>
												<span class="text-muted-foreground text-left">Select Image</span>
											{/if}
											<svg class="text-muted-foreground ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
											</svg>
										</button>
									</div>
								{/if}
								{#if featureValue.items}
									<div>
										<label class="text-foreground mb-3 block text-xs font-medium">Items</label>
										<div class="grid gap-4 md:grid-cols-2">
											{#each featureValue.items as item, itemIndex}
												<div class="bg-card border-border hover:border-primary/30 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg">
													{#if item.title !== undefined}
														<div class="mb-3">
															<label class="text-foreground mb-1 block text-xs font-medium">Title</label>
															<input
																type="text"
																bind:value={sections.features.entryPaths.items[itemIndex].title}
																class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
															/>
														</div>
													{/if}
													{#if item.description !== undefined}
														<div class="mb-3">
															<label class="text-foreground mb-1 block text-xs font-medium">Description</label>
															<HtmlEditor bind:value={sections.features.entryPaths.items[itemIndex].description} />
														</div>
													{/if}
													<button
														type="button"
														onclick={() => sections.features.entryPaths.items.splice(itemIndex, 1)}
														class="text-destructive hover:text-destructive/80 w-full text-xs"
													>
														Remove Item
													</button>
												</div>
											{/each}
											<button
												type="button"
												onclick={() => {
													const newItem = {};
													if (featureValue.items.length > 0) {
														const firstItem = featureValue.items[0];
														if (firstItem.title !== undefined) newItem.title = '';
														if (firstItem.description !== undefined) newItem.description = '';
													} else {
														newItem.title = '';
														newItem.description = '';
													}
													sections.features.entryPaths.items.push(newItem);
												}}
												class="bg-card border-border hover:border-primary/30 flex h-full min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed p-4 text-xs text-muted-foreground transition-all duration-300 hover:shadow-lg"
											>
												<svg class="mb-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												+ Add Item
											</button>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/if}

				{#if sections.features && typeof sections.features === 'object' && sections.features !== null}
					{#if sections.features.exitPaths && (sections.features.exitPaths.items || sections.features.exitPaths.image || sections.features.exitPaths.strapline || sections.features.exitPaths.heading)}
						{@const featureValue = sections.features.exitPaths}
						<div id="exitPaths" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
							<h2 class="text-foreground mb-4 font-semibold">Exit Paths Detail</h2>
							<div class="space-y-4">
								{#if featureValue.strapline !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Strapline</label>
										<input
											type="text"
											bind:value={sections.features.exitPaths.strapline}
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
								{/if}
								{#if featureValue.heading !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Heading</label>
										<input
											type="text"
											bind:value={sections.features.exitPaths.heading}
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
								{/if}
								{#if featureValue.image !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Image</label>
										<button
											type="button"
											onclick={() => openImagePicker(`features.exitPaths.image`)}
											class="border-input bg-background text-foreground hover:bg-secondary flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
										>
											{#if sections.features.exitPaths.image}
												<div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
													<img src={sections.features.exitPaths.image} alt="Selected image" class="h-full w-full object-cover" />
												</div>
												<span class="text-left truncate">{sections.features.exitPaths.image}</span>
											{:else}
												<div class="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
													<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
													</svg>
												</div>
												<span class="text-muted-foreground text-left">Select Image</span>
											{/if}
											<svg class="text-muted-foreground ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
											</svg>
										</button>
									</div>
								{/if}
								{#if featureValue.items}
									<div>
										<label class="text-foreground mb-3 block text-xs font-medium">Items</label>
										<div class="grid gap-4 md:grid-cols-2">
											{#each featureValue.items as item, itemIndex}
												<div class="bg-card border-border hover:border-primary/30 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg">
													{#if item.title !== undefined}
														<div class="mb-3">
															<label class="text-foreground mb-1 block text-xs font-medium">Title</label>
															<input
																type="text"
																bind:value={sections.features.exitPaths.items[itemIndex].title}
																class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
															/>
														</div>
													{/if}
													{#if item.description !== undefined}
														<div class="mb-3">
															<label class="text-foreground mb-1 block text-xs font-medium">Description</label>
															<HtmlEditor bind:value={sections.features.exitPaths.items[itemIndex].description} />
														</div>
													{/if}
													<button
														type="button"
														onclick={() => sections.features.exitPaths.items.splice(itemIndex, 1)}
														class="text-destructive hover:text-destructive/80 w-full text-xs"
													>
														Remove Item
													</button>
												</div>
											{/each}
											<button
												type="button"
												onclick={() => {
													const newItem = {};
													if (featureValue.items.length > 0) {
														const firstItem = featureValue.items[0];
														if (firstItem.title !== undefined) newItem.title = '';
														if (firstItem.description !== undefined) newItem.description = '';
													} else {
														newItem.title = '';
														newItem.description = '';
													}
													sections.features.exitPaths.items.push(newItem);
												}}
												class="bg-card border-border hover:border-primary/30 flex h-full min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed p-4 text-xs text-muted-foreground transition-all duration-300 hover:shadow-lg"
											>
												<svg class="mb-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												+ Add Item
											</button>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/if}

				{#if sections.features && typeof sections.features === 'object' && sections.features !== null}
					{#if sections.features.researcherPassport && (sections.features.researcherPassport.features || sections.features.researcherPassport.strapline || sections.features.researcherPassport.heading || sections.features.researcherPassport.subheading)}
						{@const featureValue = sections.features.researcherPassport}
						<div id="researcherPassport" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
							<h2 class="text-foreground mb-4 font-semibold">Researcher Passport Detail</h2>
							<div class="space-y-4">
								{#if featureValue.strapline !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Strapline</label>
										<input
											type="text"
											bind:value={sections.features.researcherPassport.strapline}
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
								{/if}
								{#if featureValue.heading !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Heading</label>
										<input
											type="text"
											bind:value={sections.features.researcherPassport.heading}
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
								{/if}
								{#if featureValue.subheading !== undefined}
									<div>
										<label class="text-foreground mb-2 block text-xs font-medium">Subheading</label>
										<textarea
											bind:value={sections.features.researcherPassport.subheading}
											rows="2"
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										></textarea>
									</div>
								{/if}
								{#if featureValue.features}
									<div>
										<label class="text-foreground mb-3 block text-xs font-medium">Features</label>
										<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
											{#each featureValue.features as feature, featureIndex}
												<div class="bg-card border-border rounded-xl border p-4">
													<div class="mb-3">
														<button
															type="button"
															onclick={() => openIconPicker(`features.researcherPassport.features.${featureIndex}.iconId`)}
															class="border-input bg-background text-foreground hover:bg-secondary flex h-10 w-10 items-center justify-center rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary mx-auto"
														>
															{#if feature.iconId}
																{@html icons.find(i => i.id === feature.iconId)?.svg || ''}
															{:else}
																<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
																</svg>
															{/if}
														</button>
													</div>
													<div class="mb-2">
														<label class="text-foreground mb-1 block text-xs font-medium">Title</label>
														<input
															type="text"
															bind:value={sections.features.researcherPassport.features[featureIndex].title}
															class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
														/>
													</div>
													<div>
														<label class="text-foreground mb-1 block text-xs font-medium">Description</label>
														<textarea
															bind:value={sections.features.researcherPassport.features[featureIndex].description}
															rows="3"
															class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
														></textarea>
													</div>
													<button
														type="button"
														onclick={() => sections.features.researcherPassport.features.splice(featureIndex, 1)}
														class="mt-2 text-destructive hover:text-destructive/80 w-full text-xs"
													>
														Remove Feature
													</button>
												</div>
											{/each}
											<button
												type="button"
												onclick={() => {
													if (!sections.features.researcherPassport.features) sections.features.researcherPassport.features = [];
													sections.features.researcherPassport.features.push({ title: '', description: '', iconId: '' });
												}}
												class="bg-card border-border hover:border-primary/30 flex h-full min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed p-4 text-xs text-muted-foreground transition-all duration-300 hover:shadow-lg"
											>
												<svg class="mb-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M12 6v6m0 0v6m0-6h6m-6 0H6"
													/>
												</svg>
												+ Add Feature
											</button>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/if}

				{#if sections.features && typeof sections.features === 'object' && sections.features !== null}
					{#each Object.entries(sections.features) as [featureKey, featureValue]}
						{#if featureKey !== 'entryPaths' && featureKey !== 'exitPaths' && featureKey !== 'researcherPassport'}
							{#if typeof featureValue === 'object' && featureValue !== null && (featureValue.items || featureValue.image || featureValue.strapline || featureValue.heading)}
								<div id="features-{featureKey}" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
									<h2 class="text-foreground mb-4 font-semibold">{featureKey.charAt(0).toUpperCase() + featureKey.slice(1).replace(/([A-Z])/g, ' $1')} Detail</h2>
									<div class="space-y-4">
										{#if featureValue.strapline !== undefined}
											<div>
												<label class="text-foreground mb-2 block text-xs font-medium">Strapline</label>
												<input
													type="text"
													bind:value={sections.features[featureKey].strapline}
													class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
												/>
											</div>
										{/if}
										{#if featureValue.heading !== undefined}
											<div>
												<label class="text-foreground mb-2 block text-xs font-medium">Heading</label>
												<input
													type="text"
													bind:value={sections.features[featureKey].heading}
													class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
												/>
											</div>
										{/if}
										{#if featureValue.image !== undefined}
											<div>
												<label class="text-foreground mb-2 block text-xs font-medium">Image</label>
												<button
													type="button"
													onclick={() => openImagePicker(`features.${featureKey}.image`)}
													class="border-input bg-background text-foreground hover:bg-secondary flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
												>
													{#if sections.features[featureKey].image}
														<div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
															<img src={sections.features[featureKey].image} alt="Selected image" class="h-full w-full object-cover" />
														</div>
														<span class="text-left truncate">{sections.features[featureKey].image}</span>
													{:else}
														<div class="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
															<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
															</svg>
														</div>
														<span class="text-muted-foreground text-left">Select Image</span>
													{/if}
													<svg class="text-muted-foreground ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
													</svg>
												</button>
											</div>
										{/if}
										{#if featureValue.items}
											<div>
												<label class="text-foreground mb-3 block text-xs font-medium">Items</label>
												<div class="grid gap-4 md:grid-cols-2">
													{#each featureValue.items as item, itemIndex}
														<div class="bg-card border-border hover:border-primary/30 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg">
															{#if item.title !== undefined}
																<div class="mb-3">
																	<label class="text-foreground mb-1 block text-xs font-medium">Title</label>
																	<input
																		type="text"
																		bind:value={sections.features[featureKey].items[itemIndex].title}
																		class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
																	/>
																</div>
															{/if}
															{#if item.description !== undefined}
																<div class="mb-3">
																	<label class="text-foreground mb-1 block text-xs font-medium">Description</label>
																	<HtmlEditor bind:value={sections.features[featureKey].items[itemIndex].description} />
																</div>
															{/if}
															<button
																type="button"
																onclick={() => sections.features[featureKey].items.splice(itemIndex, 1)}
																class="text-destructive hover:text-destructive/80 w-full text-xs"
															>
																Remove Item
															</button>
														</div>
													{/each}
													<button
														type="button"
														onclick={() => {
															const newItem = {};
															if (featureValue.items.length > 0) {
																const firstItem = featureValue.items[0];
																if (firstItem.title !== undefined) newItem.title = '';
																if (firstItem.description !== undefined) newItem.description = '';
															} else {
																newItem.title = '';
																newItem.description = '';
															}
															sections.features[featureKey].items.push(newItem);
														}}
														class="bg-card border-border hover:border-primary/30 flex h-full min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed p-4 text-xs text-muted-foreground transition-all duration-300 hover:shadow-lg"
													>
														<svg class="mb-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M12 6v6m0 0v6m0-6h6m-6 0H6"
															/>
														</svg>
														+ Add Item
													</button>
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						{/if}
					{/each}
				{/if}

				{#if sections.features && Array.isArray(sections.features)}
					<div id="features" class="bg-secondary rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">Solutions</h2>
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
							{#each sections.features as feature, index}
								<div class="bg-card border-border hover:border-primary/30 rounded-xl border p-6 transition-all duration-300 hover:shadow-lg">
									<div class="mb-4 space-y-3">
										<div class="flex items-center gap-3">
											<button
												type="button"
												onclick={() => openIconPicker(`features.${index}.iconId`, index)}
												class="border-input bg-background text-foreground hover:bg-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
											>
												{#if sections.features[index].iconId}
													{@html icons.find(i => i.id === sections.features[index].iconId)?.svg || ''}
												{:else}
													<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
													</svg>
												{/if}
											</button>
										</div>
										<input
											type="text"
											placeholder="Solution title"
											bind:value={sections.features[index].title}
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
									<div class="mb-4">
										<label class="text-foreground mb-2 block text-xs font-medium">Description</label>
										<HtmlEditor bind:value={sections.features[index].description} />
									</div>
									<button
										type="button"
										onclick={() => sections.features.splice(index, 1)}
										class="text-destructive hover:text-destructive/80 w-full text-xs"
									>
										Remove Feature
									</button>
								</div>
							{/each}
							<button
								type="button"
								onclick={() => sections.features.push({ title: '', description: '', iconId: '' })}
								class="bg-card border-border hover:border-primary/30 flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-sm text-muted-foreground transition-all duration-300 hover:shadow-lg"
							>
								<svg class="mb-2 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								+ Add Feature
							</button>
						</div>
					</div>
				{/if}

				{#if sections.mission}
					<div id="mission" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">Mission Section</h2>
						<div class="space-y-4">
							{#each Object.entries(sections.mission) as [key, value]}
								{#if typeof value === 'string' && key !== 'paragraph2'}
									<div>
										<label class="text-foreground mb-2 block text-sm font-medium">
											{key === 'paragraph1' ? 'Paragraph' : key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
										</label>
										{#if key.includes('paragraph') || key.includes('description')}
											<HtmlEditor bind:value={sections.mission[key]} />
										{:else}
											<input
												type="text"
												bind:value={sections.mission[key]}
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										{/if}
									</div>
								{:else if typeof value === 'object' && value !== null}
									<div class="border-border rounded-lg border p-4">
										<h3 class="text-foreground mb-3 text-sm font-semibold">
											{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
										</h3>
										{#if key === 'stats'}
											{@const statsEntries = Object.entries(value)}
											<div class="grid grid-cols-2 gap-4">
												{#each Array(Math.ceil(statsEntries.length / 2)) as _, rowIndex}
													{@const startIndex = rowIndex * 2}
													{@const pair = statsEntries.slice(startIndex, startIndex + 2)}
													<!-- Labels row -->
													<div class="grid grid-cols-2 gap-4 col-span-2">
														{#each pair as [subKey, subValue]}
															<label class="text-foreground text-xs font-medium">
																{subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1')}
															</label>
														{/each}
													</div>
													<!-- Fields row -->
													<div class="grid grid-cols-2 gap-4 col-span-2">
														{#each pair as [subKey, subValue]}
															<input
																type="text"
																bind:value={sections.mission[key][subKey]}
																class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
															/>
														{/each}
													</div>
												{/each}
											</div>
										{:else}
											{#each Object.entries(value) as [subKey, subValue]}
												<div class="mb-3">
													<label class="text-foreground mb-1 block text-xs font-medium">
														{subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1')}
													</label>
													<input
														type="text"
														bind:value={sections.mission[key][subKey]}
														class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
													/>
												</div>
											{/each}
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				{#if sections.detailedSections}
					<div id="detailedSections" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">Detailed Sections</h2>
						<div class="space-y-6">
							{#each Object.entries(sections.detailedSections) as [sectionKey, sectionValue]}
								<div class="border-border rounded-lg border p-4">
									<h3 class="text-foreground mb-4 text-sm font-semibold">
										{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace(/([A-Z])/g, ' $1')}
									</h3>
									{#if typeof sectionValue === 'object' && sectionValue !== null}
										<div class="space-y-4">
											{#if sectionValue.strapline !== undefined}
												<div>
													<label class="text-foreground mb-2 block text-xs font-medium">Strapline</label>
													<input
														type="text"
														bind:value={sections.detailedSections[sectionKey].strapline}
														class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
													/>
												</div>
											{/if}
											{#if sectionValue.heading !== undefined}
												<div>
													<label class="text-foreground mb-2 block text-xs font-medium">Heading</label>
													<input
														type="text"
														bind:value={sections.detailedSections[sectionKey].heading}
														class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
													/>
												</div>
											{/if}
											{#if sectionValue.image !== undefined}
												<div>
													<label class="text-foreground mb-2 block text-xs font-medium">Image</label>
													<button
														type="button"
														onclick={() => openImagePicker(`detailedSections.${sectionKey}.image`)}
														class="border-input bg-background text-foreground hover:bg-secondary flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
													>
														{#if sections.detailedSections[sectionKey].image}
															<div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
																<img src={sections.detailedSections[sectionKey].image} alt="Selected image" class="h-full w-full object-cover" />
															</div>
															<span class="text-left truncate">{sections.detailedSections[sectionKey].image}</span>
														{:else}
															<div class="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
																<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
																</svg>
															</div>
															<span class="text-muted-foreground text-left">Select Image</span>
														{/if}
														<svg class="text-muted-foreground ml-auto h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
														</svg>
													</button>
												</div>
											{/if}
											{#if sectionValue.description !== undefined}
												<div>
													<label class="text-foreground mb-2 block text-xs font-medium">Description</label>
													<HtmlEditor bind:value={sections.detailedSections[sectionKey].description} />
												</div>
											{/if}
											{#if sectionValue.items}
												<div>
													<label class="text-foreground mb-2 block text-xs font-medium">Items</label>
													<div class="space-y-2">
														{#each sectionValue.items as item, itemIndex}
															<div class="flex gap-2">
																<input
																	type="text"
																	bind:value={sections.detailedSections[sectionKey].items[itemIndex]}
																	class="border-input bg-background text-foreground flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
																/>
																<button
																	type="button"
																	onclick={() => sections.detailedSections[sectionKey].items.splice(itemIndex, 1)}
																	class="text-destructive hover:text-destructive/80 text-xs"
																>
																	Remove
																</button>
															</div>
														{/each}
														<button
															type="button"
															onclick={() => {
																if (!sections.detailedSections[sectionKey].items) sections.detailedSections[sectionKey].items = [];
																sections.detailedSections[sectionKey].items.push('');
															}}
															class="text-primary hover:text-primary/80 text-xs font-medium"
														>
															+ Add Item
														</button>
													</div>
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if sections.cta}
					<div id="cta" class="bg-primary rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-primary-foreground mb-4 font-semibold">Call to Action Section</h2>
						<div class="space-y-4">
							{#each Object.entries(sections.cta) as [key, value]}
								{#if typeof value === 'string'}
									<div>
										<label class="text-primary-foreground mb-2 block text-sm font-medium">
											{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
										</label>
										{#if key.includes('description')}
											<HtmlEditor bind:value={sections.cta[key]} />
										{:else}
											<input
												type="text"
												bind:value={sections.cta[key]}
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				{#if sections.contactInfo}
					<div id="contactInfo" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">Contact Information</h2>
						<div class="space-y-4">
							{#each Object.entries(sections.contactInfo) as [key, value]}
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">
										{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
									</label>
									{#if key === 'office'}
										<textarea
											bind:value={sections.contactInfo[key]}
											rows="2"
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										></textarea>
									{:else}
										<input
											type="text"
											bind:value={sections.contactInfo[key]}
											class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if sections.faq}
					<div id="faq" class="bg-secondary rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">FAQ Section</h2>
						{#if typeof sections.faq === 'object' && !Array.isArray(sections.faq)}
							<div class="mb-6 space-y-4">
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">Heading</label>
									<input
										type="text"
										bind:value={sections.faq.heading}
										class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">FAQ Items</label>
									<div class="space-y-4">
										{#each (sections.faq.items || []) as faq, index}
											<div class="border-border rounded-lg border p-4">
												<div class="mb-3">
													<label class="text-foreground mb-2 block text-xs font-medium">Question</label>
													<input
														type="text"
														bind:value={sections.faq.items[index].question}
														class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
													/>
												</div>
												<div>
													<label class="text-foreground mb-2 block text-xs font-medium">Answer</label>
													<HtmlEditor bind:value={sections.faq.items[index].answer} />
												</div>
												<button
													type="button"
													onclick={() => sections.faq.items.splice(index, 1)}
													class="mt-2 text-destructive hover:text-destructive/80 text-xs"
												>
													Remove FAQ
												</button>
											</div>
										{/each}
										<button
											type="button"
											onclick={() => {
												if (!sections.faq.items) sections.faq.items = [];
												sections.faq.items.push({ question: '', answer: '' });
											}}
											class="text-primary hover:text-primary/80 text-sm font-medium"
										>
											+ Add FAQ
										</button>
									</div>
								</div>
							</div>
						{:else}
							<div class="space-y-4">
								{#each sections.faq as faq, index}
									<div class="border-border rounded-lg border p-4">
										<div class="mb-3">
											<label class="text-foreground mb-2 block text-xs font-medium">Question</label>
											<input
												type="text"
												bind:value={sections.faq[index].question}
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										</div>
										<div>
											<label class="text-foreground mb-2 block text-xs font-medium">Answer</label>
											<HtmlEditor bind:value={sections.faq[index].answer} />
										</div>
										<button
											type="button"
											onclick={() => sections.faq.splice(index, 1)}
											class="mt-2 text-destructive hover:text-destructive/80 text-xs"
										>
											Remove FAQ
										</button>
									</div>
								{/each}
								<button
									type="button"
									onclick={() => sections.faq.push({ question: '', answer: '' })}
									class="text-primary hover:text-primary/80 text-sm font-medium"
								>
									+ Add FAQ
								</button>
							</div>
						{/if}
					</div>
				{/if}

				{#if sections.values}
					<div id="values" class="bg-muted rounded-xl p-6 shadow-sm scroll-mt-20">
						<h2 class="text-foreground mb-4 font-semibold">Values Section</h2>
						{#if typeof sections.values === 'object' && !Array.isArray(sections.values)}
							<div class="mb-6 space-y-4">
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">Strapline</label>
									<input
										type="text"
										bind:value={sections.values.strapline}
										class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">Heading</label>
									<input
										type="text"
										bind:value={sections.values.heading}
										class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<div>
									<label class="text-foreground mb-2 block text-sm font-medium">Values</label>
									<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
										{#each (sections.values.items || []) as value, index}
											<div class="bg-card border-border rounded-xl border p-4">
												<div class="mb-3">
													<button
														type="button"
														onclick={() => openIconPicker(`values.items.${index}.iconId`)}
														class="border-input bg-background text-foreground hover:bg-secondary flex h-10 w-10 items-center justify-center rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary mx-auto mb-3"
													>
														{#if value.iconId}
															{@html icons.find(i => i.id === value.iconId)?.svg || ''}
														{:else}
															<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
															</svg>
														{/if}
													</button>
												</div>
												<div class="mb-3">
													<label class="text-foreground mb-2 block text-xs font-medium">Title</label>
													<input
														type="text"
														bind:value={sections.values.items[index].title}
														class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
													/>
												</div>
												<div>
													<label class="text-foreground mb-2 block text-xs font-medium">Description</label>
													<textarea
														bind:value={sections.values.items[index].description}
														rows="3"
														class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
													></textarea>
												</div>
												<button
													type="button"
													onclick={() => sections.values.items.splice(index, 1)}
													class="mt-2 text-destructive hover:text-destructive/80 w-full text-xs"
												>
													Remove Value
												</button>
											</div>
										{/each}
										<button
											type="button"
											onclick={() => {
												if (!sections.values.items) sections.values.items = [];
												sections.values.items.push({ title: '', description: '', iconId: '' });
											}}
											class="bg-card border-border hover:border-primary/30 flex h-full min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed p-4 text-xs text-muted-foreground transition-all duration-300 hover:shadow-lg"
										>
											<svg class="mb-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 6v6m0 0v6m0-6h6m-6 0H6"
												/>
											</svg>
											+ Add Value
										</button>
									</div>
								</div>
							</div>
						{:else}
							<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{#each sections.values as value, index}
									<div class="bg-card border-border rounded-xl border p-4">
										<div class="mb-3">
											<button
												type="button"
												onclick={() => openIconPicker(`values.${index}.iconId`)}
												class="border-input bg-background text-foreground hover:bg-secondary flex h-10 w-10 items-center justify-center rounded-lg border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary mx-auto mb-3"
											>
												{#if value.iconId}
													{@html icons.find(i => i.id === value.iconId)?.svg || ''}
												{:else}
													<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
													</svg>
												{/if}
											</button>
										</div>
										<div class="mb-3">
											<label class="text-foreground mb-2 block text-xs font-medium">Title</label>
											<input
												type="text"
												bind:value={sections.values[index].title}
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										</div>
										<div>
											<label class="text-foreground mb-2 block text-xs font-medium">Description</label>
											<textarea
												bind:value={sections.values[index].description}
												rows="3"
												class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
											></textarea>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				</div>
			</div>
		{:else}
			<div class="bg-muted border-border rounded-xl border p-6">
				<p class="text-muted-foreground text-center">
					No sections available for this page. Sections will be created automatically when content is added.
				</p>
		</div>
		{/if}
	{/if}
</div>

{#if iconPickerOpen}
	<IconPickerModal
		icons={icons}
		selectedIconId={getSelectedIconId(iconPickerContext.path, iconPickerContext.index)}
		onSelect={handleIconSelect}
		onClose={closeIconPicker}
	/>
{/if}

{#if imagePickerOpen}
	<ImagePickerModal
		images={images}
		selectedUrl={sections && imagePickerContext.path ? imagePickerContext.path.split('.').reduce((obj, key) => (obj ? obj[key] : ''), sections) : ''}
		onSelect={handleImageSelect}
		onClose={closeImagePicker}
	/>
{/if}
