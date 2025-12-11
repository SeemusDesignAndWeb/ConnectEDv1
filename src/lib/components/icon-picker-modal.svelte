<script>
	import IconPicker from './icon-picker.svelte';

	let { icons = [], selectedIconId = '', onSelect, onClose } = $props();

	function handleSelect(iconId) {
		onSelect(iconId);
		onClose();
	}
</script>

<!-- Backdrop -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
	onclick={onClose}
	onkeydown={(e) => {
		if (e.key === 'Escape') onClose();
	}}
	role="dialog"
	aria-modal="true"
	aria-labelledby="icon-picker-title"
>
	<!-- Modal -->
	<div
		class="bg-background border-border w-full max-w-2xl rounded-xl border shadow-xl"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="border-border flex items-center justify-between border-b p-4">
			<h2 id="icon-picker-title" class="text-foreground font-semibold">Select Icon</h2>
			<button
				type="button"
				onclick={onClose}
				class="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
				aria-label="Close"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
		<div class="p-4">
			<IconPicker {icons} {selectedIconId} {onSelect} />
		</div>
	</div>
</div>
