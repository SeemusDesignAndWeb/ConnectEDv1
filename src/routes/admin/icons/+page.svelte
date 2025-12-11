<script>
	import { onMount } from 'svelte';
	import HtmlEditor from '$lib/components/html-editor.svelte';

	let icons = $state([]);
	let loading = $state(true);
	let error = $state('');
	let success = $state(false);
	let successMessage = $state('');
	let editingIcon = $state(null);
	let showAddForm = $state(false);
	let newIcon = $state({ name: '', svg: '' });

	onMount(async () => {
		await loadIcons();
	});

	async function loadIcons() {
		loading = true;
		error = '';
		try {
			const response = await fetch('/api/admin/icons');
			if (response.ok) {
				const data = await response.json();
				icons = data.icons || [];
			} else {
				error = 'Failed to load icons';
			}
		} catch (err) {
			error = 'An error occurred while loading icons';
		} finally {
			loading = false;
		}
	}

	async function handleAdd() {
		if (!newIcon.name || !newIcon.svg) {
			error = 'Name and SVG are required';
			return;
		}

		if (icons.length >= 20) {
			error = 'Maximum of 20 icons allowed';
			return;
		}

		try {
			const response = await fetch('/api/admin/icons', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newIcon)
			});

			const data = await response.json();

			if (response.ok) {
				success = true;
				successMessage = 'Icon added successfully';
				newIcon = { name: '', svg: '' };
				showAddForm = false;
				await loadIcons();
				setTimeout(() => {
					success = false;
					successMessage = '';
				}, 3000);
			} else {
				error = data.error || 'Failed to add icon';
			}
		} catch (err) {
			error = 'An error occurred while adding icon';
		}
	}

	async function handleUpdate(icon) {
		try {
			const response = await fetch('/api/admin/icons', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: icon.id,
					name: icon.name,
					svg: icon.svg
				})
			});

			const data = await response.json();

			if (response.ok) {
				success = true;
				successMessage = 'Icon updated successfully';
				editingIcon = null;
				await loadIcons();
				setTimeout(() => {
					success = false;
					successMessage = '';
				}, 3000);
			} else {
				error = data.error || 'Failed to update icon';
			}
		} catch (err) {
			error = 'An error occurred while updating icon';
		}
	}

	async function handleDelete(id) {
		if (!confirm('Are you sure you want to delete this icon?')) {
			return;
		}

		try {
			const response = await fetch('/api/admin/icons', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});

			const data = await response.json();

			if (response.ok) {
				success = true;
				successMessage = 'Icon deleted successfully';
				await loadIcons();
				setTimeout(() => {
					success = false;
					successMessage = '';
				}, 3000);
			} else {
				error = data.error || 'Failed to delete icon';
			}
		} catch (err) {
			error = 'An error occurred while deleting icon';
		}
	}

	function startEdit(icon) {
		editingIcon = { ...icon };
		showAddForm = false;
	}

	function cancelEdit() {
		editingIcon = null;
	}
</script>

<svelte:head>
	<title>Icon Management – Admin – ConnectED</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-foreground mb-2 font-serif text-3xl font-semibold">Icon Management</h1>
			<p class="text-muted-foreground text-sm">
				Manage icons that can be used throughout the site. Maximum of 20 icons allowed.
			</p>
		</div>
		<a
			href="/admin"
			class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
		>
			← Back to Dashboard
		</a>
	</div>

	{#if error}
		<div class="bg-destructive/10 text-destructive mb-4 rounded-lg p-3 text-sm">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="bg-primary/10 text-primary mb-4 rounded-lg p-3 text-sm">
			{successMessage}
		</div>
	{/if}

	<div class="mb-6 flex items-center justify-between">
		<p class="text-muted-foreground text-sm">
			{icons.length} / 20 icons
		</p>
		{#if !showAddForm && icons.length < 20}
			<button
				onclick={() => {
					showAddForm = true;
					editingIcon = null;
					newIcon = { name: '', svg: '' };
				}}
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
			>
				+ Add Icon
			</button>
		{/if}
	</div>

	{#if showAddForm}
		<div class="bg-card border-border mb-6 rounded-xl border p-6">
			<h2 class="text-foreground mb-4 font-semibold">Add New Icon</h2>
			<div class="space-y-4">
				<div>
					<label class="text-foreground mb-2 block text-sm font-medium">Icon Name</label>
					<input
						type="text"
						bind:value={newIcon.name}
						placeholder="e.g., Entry Path, Matching, etc."
						class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<div>
					<label class="text-foreground mb-2 block text-sm font-medium">SVG Code</label>
					<p class="text-muted-foreground mb-2 text-xs">
						Paste the SVG code here. Make sure to include classes like "w-12 h-12 text-primary" for proper sizing.
					</p>
					<textarea
						bind:value={newIcon.svg}
						rows="6"
						placeholder='<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">...</svg>'
						class="border-input bg-background text-foreground font-mono w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
					></textarea>
				</div>
				<div class="flex gap-3">
					<button
						onclick={handleAdd}
						class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
					>
						Add Icon
					</button>
					<button
						onclick={() => {
							showAddForm = false;
							newIcon = { name: '', svg: '' };
						}}
						class="bg-card text-card-foreground border-border hover:bg-secondary rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading icons...</div>
		</div>
	{:else if icons.length === 0}
		<div class="bg-card border-border rounded-xl border p-8 text-center">
			<p class="text-muted-foreground mb-4">No icons yet. Add your first icon to get started.</p>
			{#if !showAddForm}
				<button
					onclick={() => {
						showAddForm = true;
						newIcon = { name: '', svg: '' };
					}}
					class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
				>
					+ Add Icon
				</button>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each icons as icon}
				<div class="bg-card border-border rounded-xl border p-6">
					{#if editingIcon && editingIcon.id === icon.id}
						<div class="space-y-4">
							<div>
								<label class="text-foreground mb-2 block text-xs font-medium">Icon Name</label>
								<input
									type="text"
									bind:value={editingIcon.name}
									class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>
							<div>
								<label class="text-foreground mb-2 block text-xs font-medium">SVG Code</label>
								<textarea
									bind:value={editingIcon.svg}
									rows="4"
									class="border-input bg-background text-foreground font-mono w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
								></textarea>
							</div>
							<div class="flex gap-2">
								<button
									onclick={() => handleUpdate(editingIcon)}
									class="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
								>
									Save
								</button>
								<button
									onclick={cancelEdit}
									class="bg-card text-card-foreground border-border hover:bg-secondary flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-foreground font-semibold">{icon.name}</h3>
							<div class="flex gap-2">
								<button
									onclick={() => startEdit(icon)}
									class="text-primary hover:text-primary/80 text-xs"
								>
									Edit
								</button>
								<button
									onclick={() => handleDelete(icon.id)}
									class="text-destructive hover:text-destructive/80 text-xs"
								>
									Delete
								</button>
							</div>
						</div>
						<div class="bg-secondary border-border rounded-lg border p-4">
							<div class="bg-primary/10 mb-3 flex h-16 w-16 items-center justify-center rounded-lg">
								{@html icon.svg}
							</div>
							<p class="text-muted-foreground mb-2 text-xs font-mono">ID: {icon.id}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
