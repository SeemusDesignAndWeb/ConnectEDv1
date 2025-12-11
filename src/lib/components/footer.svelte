<script>
	import { imagePath } from '$lib/utils/images.js';
	let logoError = $state(false);
	let settings = $state(null);
	
	function handleLogoError() {
		logoError = true;
	}

	$effect(() => {
		(async () => {
			try {
				const response = await fetch('/api/settings');
				if (response.ok) {
					const data = await response.json();
					if (data.settings) {
						settings = data.settings;
					}
				}
			} catch (error) {
				console.error('Failed to load settings:', error);
			}
		})();
	});
</script>

<footer class="bg-foreground text-background py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-12 md:grid-cols-4">
			<div class="md:col-span-2">
				<div class="mb-4 flex items-center gap-2">
					{#if !logoError}
						<img
							src={imagePath('logo_colour.svg')}
							alt="ConnectED Logo"
							class="h-8 w-8 object-contain"
							onerror={handleLogoError}
						/>
					{:else}
						<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
							<span class="text-primary-foreground text-sm font-bold">C</span>
						</div>
					{/if}
					<span class="text-background text-lg font-semibold">ConnectED</span>
				</div>
				<p class="text-background max-w-md text-sm leading-relaxed">
					{settings?.footer?.description || 'Bringing clarity, structure, and opportunity to the PhD lifecycle. Connecting students, researchers, supervisors, and institutions.'}
				</p>
			</div>

			<div>
				<h4 class="text-background mb-4 text-md font-medium uppercase tracking-wider">Navigation</h4>
				<ul class="space-y-3">
					<li>
						<a
							href="/"
							class="text-background  text-sm transition-colors">Home</a
						>
					</li>
					<li>
						<a
							href="/students"
							class="text-background  text-sm transition-colors"
							>Students / Researchers</a
						>
					</li>
					<li>
						<a
							href="/universities"
							class="text-background  text-sm transition-colors"
							>Universities / Partners</a
						>
					</li>
					<li>
						<a
							href="/about"
							class="text-background  text-sm transition-colors">About</a
						>
					</li>
					<li>
						<a
							href="/contact"
							class="text-background  text-sm transition-colors"
							>Contact</a
						>
					</li>
				</ul>
			</div>

			<div>
				<h4 class="text-background mb-4 text-md font-medium uppercase tracking-wider">Connect</h4>
				<ul class="space-y-3">
					{#each (settings?.footer?.socialLinks || []) as link}
						<li>
							<a
								href={link.url}
								class="text-background  text-sm transition-colors"
								>{link.name}</a
							>
						</li>
					{/each}
					
					{#if settings?.footer?.email}
						<li>
							<a
								href="mailto:{settings.footer.email}"
								class="text-background  text-sm transition-colors"
								>Email Us</a
							>
						</li>
					{/if}
				</ul>
			</div>
		</div>

		<div class="border-background/20 mt-12 border-t pt-8">
			<p class="text-background text-center text-sm">
				{settings?.footer?.copyright || '© 2025 ConnectED. All rights reserved.'}
			</p>
		</div>
	</div>
</footer>
