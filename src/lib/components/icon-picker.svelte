<script>
	let { icons = [], selectedIconId = '', onSelect } = $props();
	let searchQuery = $state('');
	let filteredIcons = $derived(
		icons.filter(
			(icon) =>
				icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				icon.id.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function handleSelect(iconId) {
		onSelect(iconId);
	}
</script>

<div class="bg-background border-border rounded-xl border p-4 shadow-lg">
	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search icons..."
			class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
		/>
	</div>
	<div class="max-h-96 overflow-y-auto">
		<div class="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
			<!-- No icon option -->
			<button
				type="button"
				onclick={() => handleSelect('')}
				class="bg-secondary border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center rounded-lg border p-3 transition-all {selectedIconId === ''
					? 'border-primary bg-primary/10'
					: ''}"
			>
				<div class="bg-muted mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
					<svg class="text-muted-foreground h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>
				<span class="text-muted-foreground text-xs">None</span>
			</button>

			{#each filteredIcons as icon}
				<button
					type="button"
					onclick={() => handleSelect(icon.id)}
					class="bg-secondary border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center rounded-lg border p-3 transition-all {selectedIconId === icon.id
						? 'border-primary bg-primary/10'
						: ''}"
					title={icon.name}
				>
					<div class="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
						{@html icon.svg}
					</div>
					<span class="text-muted-foreground text-center text-xs">{icon.name}</span>
				</button>
			{/each}
		</div>
		{#if filteredIcons.length === 0}
			<div class="py-8 text-center">
				<p class="text-muted-foreground text-sm">No icons found matching "{searchQuery}"</p>
			</div>
		{/if}
	</div>
</div>
