<script>
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '$lib/components/footer.svelte';
	import PageContent from '$lib/components/page-content.svelte';
	import { imagePath } from '$lib/utils/images.js';

	let pageSections = $state(null);
	let icons = $state([]);

	$effect(() => {
		(async () => {
			try {
				const [pagesResponse, iconsResponse] = await Promise.all([
					fetch('/api/pages/about'),
					fetch('/api/icons')
				]);
				
				if (pagesResponse.ok) {
					const data = await pagesResponse.json();
					if (data.sections) {
						pageSections = data.sections;
					}
				}
				
				if (iconsResponse.ok) {
					const iconsData = await iconsResponse.json();
					icons = iconsData.icons || [];
				}
			} catch (error) {
				console.error('Failed to load page data:', error);
			}
		})();
	});

	function getIcon(iconId) {
		if (!iconId) return '';
		const icon = icons.find(i => i.id === iconId);
		return icon?.svg || '';
	}
</script>

<svelte:head>
	<title>About – ConnectED</title>
	<meta
		name="description"
		content="Learn about ConnectED's mission to transform the PhD lifecycle through clarity, structure, and connection."
	/>
</svelte:head>

<Navbar currentPage="about" />

<main>
	<!-- Hero Section -->
	<section class="bg-secondary px-4 pb-16 pt-32 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<img
				src={imagePath('logo_colour.svg')}
				alt="ConnectED logo"
				class="mx-auto mb-6 h-16 w-auto"
			/>
			<h1 class="text-foreground mb-6 text-balance font-serif text-4xl font-semibold sm:text-5xl">
				{pageSections?.hero?.title || 'About ConnectED'}
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
				{pageSections?.hero?.description || "We believe the PhD journey shouldn't feel isolating, unclear, or overwhelming. ConnectED exists to bring structure, support, and connection to researchers and institutions alike."}
			</p>
		</div>
	</section>

	<!-- Editable Content Section -->
	<section class="px-4 py-12 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<PageContent pageId="about" />
		</div>
	</section>

	<!-- Mission Section -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<div class="grid gap-12 md:grid-cols-2">
				<div>
					<span class="text-destructive text-md font-medium uppercase tracking-wider">
						{pageSections?.mission?.strapline || 'Our Mission'}
					</span>
					<h2 class="text-foreground mb-6 mt-4 font-serif text-3xl font-semibold">
						{pageSections?.mission?.heading || 'Transforming the research journey'}
					</h2>
					<p class="text-muted-foreground mb-4 leading-relaxed">
						{pageSections?.mission?.paragraph1 || "ConnectED was founded on the understanding that the PhD lifecycle is complex, often fragmented, and rarely supported by cohesive infrastructure."}
					</p>
					<p class="text-muted-foreground leading-relaxed">
						{pageSections?.mission?.paragraph2 || "Our mission is to bring clarity to researchers, efficiency to institutions, and connection across the entire ecosystem. We believe that when students, supervisors, universities, and employers work together, everyone benefits."}
					</p>
				</div>
				<div>
					<span class="text-destructive text-md font-medium uppercase tracking-wider">
						{pageSections?.vision?.strapline || 'Our Vision'}
					</span>
					<h2 class="text-foreground mb-6 mt-4 font-serif text-3xl font-semibold">
						{pageSections?.vision?.heading || 'A connected future'}
					</h2>
					<p class="text-muted-foreground mb-4 leading-relaxed">
						{pageSections?.vision?.paragraph1 || "We envision a future where every researcher has a clear pathway from application to career, where institutions can support their doctoral programmes efficiently, and where the value of research is visible to society."}
					</p>
					<p class="text-muted-foreground leading-relaxed">
						{pageSections?.vision?.paragraph2 || "ConnectED is building the infrastructure to make this vision a reality, one connection at a time."}
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Values Section -->
	<section class="bg-secondary px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="mb-16 text-center">
				<span class="text-destructive text-md font-medium uppercase tracking-wider">
					{pageSections?.values?.strapline || 'Our Values'}
				</span>
				<h2 class="text-foreground mt-4 font-serif text-3xl font-semibold">
					{pageSections?.values?.heading || 'What guides us'}
				</h2>
			</div>

			<div class="grid gap-8 md:grid-cols-3">
				{#each (pageSections?.values?.items || []) as value}
					<div class="bg-card border-border rounded-xl border p-8">
						{#if value.iconId && getIcon(value.iconId)}
							<div class="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-lg">
								{@html getIcon(value.iconId)}
							</div>
						{:else}
							<div class="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-lg">
								<svg class="text-primary h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									/>
								</svg>
							</div>
						{/if}
						<h3 class="text-card-foreground mb-3 text-lg font-semibold">{value.title}</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">
							{value.description}
						</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Closing CTA -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<h2 class="text-foreground mb-6 font-serif text-3xl font-semibold">
				{pageSections?.cta?.heading || 'Join the ConnectED community'}
			</h2>
			<p class="text-muted-foreground mx-auto mb-10 max-w-2xl leading-relaxed">
				{pageSections?.cta?.description || "Whether you're a researcher starting your journey or an institution looking to improve outcomes, we're here to help."}
			</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a
					href="/students"
					class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition-colors"
				>
					{pageSections?.cta?.studentButton || 'FOR STUDENTS / RESEARCHERS'}
				</a>
				<a
					href="/universities"
					class="bg-card text-card-foreground border-border hover:bg-secondary inline-flex items-center justify-center rounded-xl border px-6 py-3 text-sm font-medium transition-colors"
				>
					{pageSections?.cta?.universityButton || 'FOR UNIVERSITIES / PARTNERS'}
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
