<script>
	let { pageId } = $props();

	let sections = $state(null);
	let loading = $state(true);

	$effect(() => {
		if (!pageId) {
			loading = false;
			return;
		}

		loading = true;

		(async () => {
			try {
				const path = pageId === 'home' ? 'home' : pageId;
				const response = await fetch(`/api/pages/${path}`);
				if (response.ok) {
					const data = await response.json();
					if (data.sections) {
						sections = data.sections;
					}
				}
			} catch (error) {
				console.error('Failed to load page sections:', error);
			} finally {
				loading = false;
			}
		})();
	});
</script>

{#if sections}
	{@render children({ sections })}
{/if}
