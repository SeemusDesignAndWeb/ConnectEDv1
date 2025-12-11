<script>
	let { currentPage = '' } = $props();
	let mobileMenuOpen = $state(false);
	let logoError = $state(false);
	
	function handleLogoError() {
		logoError = true;
	}
</script>

<nav
	class="bg-white/90 border-border fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-sm"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<a href="/" class="flex items-center gap-2">
				{#if !logoError}
					<img
						src="/images/logo_colour.svg"
						alt="ConnectED Logo"
						class="h-8 w-8 object-contain"
						onerror={handleLogoError}
					/>
				{:else}
					<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
						<span class="text-primary-foreground text-sm font-bold">C</span>
					</div>
				{/if}
				<span class="text-foreground text-lg font-semibold">ConnectED</span>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden items-center gap-8 md:flex">
				<a
					href="/"
					class="text-sm font-medium transition-colors {currentPage === 'home'
						? 'text-destructive'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Home
				</a>
				<a
					href="/students"
					class="text-sm font-medium transition-colors {currentPage === 'students'
						? 'text-destructive'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Students / Researchers
				</a>
				<a
					href="/universities"
					class="text-sm font-medium transition-colors {currentPage === 'universities'
						? 'text-destructive'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Universities / Partners
				</a>
				<a
					href="/about"
					class="text-sm font-medium transition-colors {currentPage === 'about'
						? 'text-destructive'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					About
				</a>
				<a
					href="/contact"
					class="text-sm font-medium transition-colors {currentPage === 'contact'
						? 'text-destructive'
						: 'text-muted-foreground hover:text-foreground'}"
				>
					Contact
				</a>
			</div>

			<!-- Mobile Menu Button -->
			<button
				class="hover:bg-secondary rounded-lg p-2 transition-colors md:hidden"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
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
		</div>

		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div class="border-border border-t py-4 md:hidden">
				<div class="flex flex-col gap-4">
					<a
						href="/"
						class="py-2 text-sm font-medium {currentPage === 'home'
							? 'text-destructive'
							: 'text-muted-foreground'}"
					>
						Home
					</a>
					<a
						href="/students"
						class="py-2 text-sm font-medium {currentPage === 'students'
							? 'text-destructive'
							: 'text-muted-foreground'}"
					>
						Students / Researchers
					</a>
					<a
						href="/universities"
						class="py-2 text-sm font-medium {currentPage === 'universities'
							? 'text-destructive'
							: 'text-muted-foreground'}"
					>
						Universities / Partners
					</a>
					<a
						href="/about"
						class="py-2 text-sm font-medium {currentPage === 'about'
							? 'text-destructive'
							: 'text-muted-foreground'}"
					>
						About
					</a>
					<a
						href="/contact"
						class="py-2 text-sm font-medium {currentPage === 'contact'
							? 'text-destructive'
							: 'text-muted-foreground'}"
					>
						Contact
					</a>
				</div>
			</div>
		{/if}
	</div>
</nav>
