<script>
	let { title, description, icon } = $props();
</script>

<div
	class="bg-card border-border hover:border-primary/30 rounded-xl border p-8 transition-all duration-300 hover:shadow-lg"
>
	<div class="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-lg">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html icon}
	</div>
	<h3 class="text-card-foreground mb-3 text-lg font-semibold">{title}</h3>
	<p class="text-muted-foreground text-sm leading-relaxed">{description}</p>
</div>
