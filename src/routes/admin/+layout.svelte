<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { imagePath } from '$lib/utils/images.js';
	
	let { children, data } = $props();
	let mobileMenuOpen = $state(false);
	let logoError = $state(false);
	
	async function handleLogout() {
		await fetch('/api/admin/logout', { method: 'POST' });
		goto('/admin/login');
	}

	function isActive(path) {
		return $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');
	}

	function handleLogoError() {
		logoError = true;
	}
</script>

<svelte:head>
	<title>Admin – ConnectED</title>
</svelte:head>

<div class="bg-background min-h-screen font-sans antialiased">
	<!-- Admin Navbar -->
	<nav
		class="bg-gradient-to-r from-primary/10 via-card to-destructive/10 border-border fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-sm"
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-6">
					<a href="/admin" class="flex items-center gap-2">
						{#if !logoError}
							<img
								src={imagePath('logo_colour.svg')}
								alt="ConnectED Logo"
								class="h-8 w-8 object-contain"
								onerror={handleLogoError}
							/>
						{:else}
							<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
								<span class="text-primary-foreground text-sm font-bold">A</span>
							</div>
						{/if}
						<span class="text-foreground text-lg font-semibold">Admin</span>
					</a>

					{#if data.authenticated}
						<nav class="hidden items-center gap-4 md:flex">
							<a
								href="/admin/pages/home"
								class="text-sm font-medium rounded-lg px-3 py-1 transition-colors {isActive('/admin/pages/home')
									? 'bg-primary/15 text-primary-foreground/90'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								Home
							</a>
							<a
								href="/admin/pages/students"
								class="text-sm font-medium rounded-lg px-3 py-1 transition-colors {isActive('/admin/pages/students')
									? 'bg-primary/15 text-primary-foreground/90'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								Students
							</a>
							<a
								href="/admin/pages/universities"
								class="text-sm font-medium rounded-lg px-3 py-1 transition-colors {isActive('/admin/pages/universities')
									? 'bg-primary/15 text-primary-foreground/90'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								Universities
							</a>
							<a
								href="/admin/pages/about"
								class="text-sm font-medium rounded-lg px-3 py-1 transition-colors {isActive('/admin/pages/about')
									? 'bg-primary/15 text-primary-foreground/90'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								About
							</a>
							<a
								href="/admin/pages/contact"
								class="text-sm font-medium rounded-lg px-3 py-1 transition-colors {isActive('/admin/pages/contact')
									? 'bg-primary/15 text-primary-foreground/90'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								Contact
							</a>
							<a
								href="/admin/icons"
								class="text-sm font-medium rounded-lg px-3 py-1 transition-colors {isActive('/admin/icons')
									? 'bg-primary/15 text-primary-foreground/90'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								Icons
							</a>
							<a
								href="/admin/images"
								class="text-sm font-medium rounded-lg px-3 py-1 transition-colors {isActive('/admin/images')
									? 'bg-destructive/15 text-destructive'
									: 'text-muted-foreground hover:text-foreground'}"
							>
								Images
							</a>
						</nav>
					{/if}
				</div>

				{#if data.authenticated}
					<div class="flex items-center gap-4">
						<!-- Mobile menu button -->
						<button
							onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
							class="hover:bg-secondary rounded-lg p-2 transition-colors md:hidden"
							aria-label="Toggle menu"
							aria-expanded={mobileMenuOpen}
						>
							{#if mobileMenuOpen}
								<svg
									class="text-foreground h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							{:else}
								<svg
									class="text-foreground h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							{/if}
						</button>

						<!-- Desktop actions -->
						<div class="hidden items-center gap-4 md:flex">
							<a
								href="/"
								target="_blank"
								class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
							>
								View Site
							</a>
							<button
								onclick={handleLogout}
								class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
							>
								Logout
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Mobile menu -->
			{#if data.authenticated && mobileMenuOpen}
				<div class="border-border border-t py-4 md:hidden">
					<div class="flex flex-col gap-4">
						<a
							href="/admin"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium {isActive('/admin') && !$page.url.pathname.startsWith('/admin/pages/')
								? 'text-foreground font-semibold'
								: 'text-muted-foreground'}"
						>
							Dashboard
						</a>
						<a
							href="/admin/pages/home"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium {isActive('/admin/pages/home')
								? 'text-foreground font-semibold'
								: 'text-muted-foreground'}"
						>
							Home
						</a>
						<a
							href="/admin/pages/students"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium {isActive('/admin/pages/students')
								? 'text-foreground font-semibold'
								: 'text-muted-foreground'}"
						>
							Students
						</a>
						<a
							href="/admin/pages/universities"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium {isActive('/admin/pages/universities')
								? 'text-foreground font-semibold'
								: 'text-muted-foreground'}"
						>
							Universities
						</a>
						<a
							href="/admin/pages/about"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium {isActive('/admin/pages/about')
								? 'text-foreground font-semibold'
								: 'text-muted-foreground'}"
						>
							About
						</a>
						<a
							href="/admin/pages/contact"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium {isActive('/admin/pages/contact')
								? 'text-foreground font-semibold'
								: 'text-muted-foreground'}"
						>
							Contact
						</a>
						<a
							href="/admin/icons"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium {isActive('/admin/icons')
								? 'text-foreground font-semibold'
								: 'text-muted-foreground'}"
						>
							Icons
						</a>
						<a
							href="/admin/images"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium {isActive('/admin/images')
								? 'text-foreground font-semibold'
								: 'text-muted-foreground'}"
						>
							Images
						</a>
						<a
							href="/"
							target="_blank"
							onclick={() => (mobileMenuOpen = false)}
							class="py-2 text-sm font-medium text-muted-foreground"
						>
							View Site
						</a>
						<button
							onclick={() => {
								mobileMenuOpen = false;
								handleLogout();
							}}
							class="py-2 text-left text-sm font-medium text-muted-foreground"
						>
							Logout
						</button>
					</div>
				</div>
			{/if}
		</div>
	</nav>

	<!-- Content with padding for navbar -->
	<div class="pt-16">
		{@render children()}
	</div>
</div>
