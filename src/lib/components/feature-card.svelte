<script>
	let { title, description, icon } = $props();
</script>

<div
	class="bg-card border-border hover:border-primary/30 rounded-xl border p-8 transition-all duration-300 hover:shadow-lg"
>
	{#if icon}
		<div class="bg-primary/10 grid mb-6 rounded-lg">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html icon}
	</div>
	{/if}
	<h3 class="text-card-foreground mb-3 text-lg font-semibold">{title}</h3>
	<div class="text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none">
		{@html description}
	</div>
</div>
