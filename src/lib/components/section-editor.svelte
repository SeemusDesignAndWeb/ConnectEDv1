<script>
	let { section, path = '', label = '' } = $props();

	function updateValue(key, value) {
		if (section && typeof section === 'object' && !Array.isArray(section)) {
			section[key] = value;
		}
	}

	function updateArray(index, value) {
		if (Array.isArray(section)) {
			section[index] = value;
		}
	}

	function addArrayItem() {
		if (Array.isArray(section)) {
			section.push('');
		}
	}

	function removeArrayItem(index) {
		if (Array.isArray(section)) {
			section.splice(index, 1);
		}
	}
</script>

{#if typeof section === 'string' || typeof section === 'number'}
	<div class="mb-4">
		{#if label}
			<label class="text-foreground mb-2 block text-sm font-medium">{label}</label>
		{/if}
		<input
			type="text"
			bind:value={section}
			class="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
		/>
	</div>
{:else if Array.isArray(section)}
	<div class="mb-6">
		{#if label}
			<label class="text-foreground mb-3 block text-sm font-semibold">{label}</label>
		{/if}
		<div class="space-y-3">
			{#each section as item, index}
				<div class="flex gap-2">
					{#if typeof item === 'string' || typeof item === 'number'}
						<input
							type="text"
							bind:value={section[index]}
							class="border-input bg-background text-foreground flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					{:else}
						<div class="border-border bg-secondary flex-1 rounded-lg border p-4">
							<svelte:component this={SectionEditor} section={item} path="{path}.{index}" />
						</div>
					{/if}
					<button
						type="button"
						onclick={() => removeArrayItem(index)}
						class="text-destructive hover:text-destructive/80 text-sm"
					>
						Remove
					</button>
				</div>
			{/each}
			<button
				type="button"
				onclick={addArrayItem}
				class="text-primary hover:text-primary/80 text-sm font-medium"
			>
				+ Add Item
			</button>
		</div>
	</div>
{:else if typeof section === 'object' && section !== null}
	<div class="mb-6 border-border rounded-lg border p-4">
		{#if label}
			<h3 class="text-foreground mb-4 text-sm font-semibold">{label}</h3>
		{/if}
		<div class="space-y-4">
			{#each Object.entries(section) as [key, value]}
				<svelte:component
					this={SectionEditor}
					section={value}
					path="{path}.{key}"
					label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
				/>
			{/each}
		</div>
	</div>
{/if}
