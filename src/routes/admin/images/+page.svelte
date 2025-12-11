<script>
	import { imagePath } from '$lib/utils/images.js';

let images = $state([]);
let loading = $state(true);
let uploading = $state(false);
let error = $state('');
let success = $state('');
let publicBase = $state('/images');
let storagePath = $state('/data/images');

	async function loadImages() {
		error = '';
		try {
			const res = await fetch('/api/admin/images');
			if (!res.ok) throw new Error('Failed to load images');
			const data = await res.json();
			images = data.images || [];
			publicBase = data.publicBase || publicBase;
			storagePath = data.storagePath || storagePath;
		} catch (err) {
			error = err.message || 'Failed to load images';
		} finally {
			loading = false;
		}
	}

	async function handleUpload(event) {
		event.preventDefault();
		error = '';
		success = '';

		const form = event.target;
		const fileInput = form.querySelector('input[type="file"]');
		const file = fileInput?.files?.[0];
		if (!file) {
			error = 'Please select an image file';
			return;
		}

		const formData = new FormData();
		formData.append('file', file);

		uploading = true;
		try {
			const res = await fetch('/api/admin/images', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Upload failed');
			images = data.images || [];
			publicBase = data.publicBase || publicBase;
			storagePath = data.storagePath || storagePath;
			success = 'Image uploaded';
			fileInput.value = '';
		} catch (err) {
			error = err.message || 'Upload failed';
		} finally {
			uploading = false;
		}
	}

	$effect(() => {
		loadImages();
	});
</script>

<svelte:head>
	<title>Admin – Images</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-8 px-4 py-10">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-foreground text-2xl font-semibold">Image Library</h1>
		</div>
	</div>

	<div class="rounded-xl border border-border bg-card p-6">
		<h2 class="text-foreground mb-4 text-lg font-semibold">Upload image</h2>
		<form class="flex flex-col gap-4 sm:flex-row sm:items-center" onsubmit={handleUpload}>
			<input
				type="file"
				accept="image/*"
				class="text-sm"
				name="file"
				aria-label="Image file"
			/>
			<button
				type="submit"
				class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
				disabled={uploading}
			>
				{uploading ? 'Uploading…' : 'Upload'}
			</button>
		</form>
		{#if error}
			<p class="text-destructive mt-3 text-sm">{error}</p>
		{/if}
		{#if success}
			<p class="text-success mt-3 text-sm">{success}</p>
		{/if}
	</div>

	<div class="rounded-xl border border-border bg-card p-6">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-foreground text-lg font-semibold">Images</h2>
			{#if loading}
				<span class="text-muted-foreground text-sm">Loading…</span>
			{/if}
		</div>

		{#if !loading && images.length === 0}
			<p class="text-muted-foreground text-sm">No images uploaded yet.</p>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
				{#each images as img}
					<div class="flex flex-col gap-2 rounded-lg border border-border p-3">
						<div class="flex justify-center">
							<img
								src={img.url}
								alt={img.name}
								class="h-32 w-full rounded-md object-contain bg-secondary"
								loading="lazy"
							/>
						</div>
						<div class="truncate text-sm font-medium text-foreground">{img.name}</div>
						<div class="truncate text-xs text-muted-foreground">{img.url}</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<div class="mx-auto max-w-6xl px-4 pb-10">
	<p class="text-muted-foreground text-sm">
		Public URL base: {publicBase}/ &nbsp;|&nbsp; Stored at: {storagePath}/
	</p>
</div>

