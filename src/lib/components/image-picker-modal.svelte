<script>
	let { images = [], selectedUrl = '', onSelect, onClose } = $props();

	function handleSelect(url) {
		if (onSelect) onSelect(url);
	}

	function handleBackdrop(e) {
		if (e.target === e.currentTarget && onClose) onClose();
	}

	function handleKey(e) {
		if (e.key === 'Escape' && onClose) onClose();
	}
</script>

<svelte:window on:keydown={handleKey} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
	onclick={handleBackdrop}
>
	<div class="bg-card w-full max-w-4xl rounded-xl border border-border shadow-xl">
		<div class="flex items-center justify-between border-b border-border px-4 py-3">
			<h2 class="text-foreground text-lg font-semibold">Select Image</h2>
			<button
				class="text-muted-foreground hover:text-foreground rounded p-2 transition-colors"
				onclick={onClose}
				aria-label="Close"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="p-4">
			{#if images.length === 0}
				<p class="text-muted-foreground text-sm">No images available. Upload images in the Images section.</p>
			{:else}
				<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{#each images as img}
						<button
							type="button"
							class={`border ${img.url === selectedUrl ? 'border-primary ring-2 ring-primary/40' : 'border-border'} rounded-lg p-2 text-left transition-all hover:shadow-md`}
							onclick={() => handleSelect(img.url)}
						>
							<div class="bg-secondary mb-2 flex h-32 w-full items-center justify-center overflow-hidden rounded">
								<img src={img.url} alt={img.name} class="h-full w-full object-contain" loading="lazy" />
							</div>
							<div class="truncate text-sm font-medium text-foreground">{img.name}</div>
							<div class="truncate text-xs text-muted-foreground">{img.url}</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
