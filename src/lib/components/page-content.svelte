<script>
	let { pageId, defaultContent = '' } = $props();
	
	let content = $state(defaultContent);
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
				if (data.content) {
					content = data.content;
				}
			}
		} catch (error) {
			console.error('Failed to load page content:', error);
		} finally {
			loading = false;
		}
		})();
	});
</script>

{#if !loading && content && content.trim()}
	<div class="prose prose-slate max-w-none">
		{@html content}
	</div>
{/if}

<style>
	:global(.prose) {
		color: var(--color-foreground);
	}
	
	:global(.prose h2) {
		color: var(--color-foreground);
		font-family: var(--font-serif);
		font-size: 1.875rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}
	
	:global(.prose h3) {
		color: var(--color-foreground);
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
	}
	
	:global(.prose p) {
		color: var(--color-muted-foreground);
		margin-bottom: 1rem;
		line-height: 1.75;
	}
	
	:global(.prose a) {
		color: var(--color-primary);
		text-decoration: underline;
	}
	
	:global(.prose ul),
	:global(.prose ol) {
		color: var(--color-muted-foreground);
		margin-left: 1.5rem;
		margin-bottom: 1rem;
	}
	
	:global(.prose strong) {
		color: var(--color-foreground);
		font-weight: 600;
	}
	
	:global(.prose em) {
		font-style: italic;
	}
</style>
