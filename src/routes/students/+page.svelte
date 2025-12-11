<script>
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '$lib/components/footer.svelte';
	import FeatureCard from '$lib/components/feature-card.svelte';
	import PainPointItem from '$lib/components/pain-point-item.svelte';
	import PageContent from '$lib/components/page-content.svelte';
	import { imagePath } from '$lib/utils/images.js';

	const entryPathIcon = `<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>`;

	const exitPathIcon = `<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>`;

	const passportIcon = `<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>`;

	let pageSections = $state(null);
	let icons = $state([]);

	$effect(() => {
		(async () => {
			try {
				const [pagesResponse, iconsResponse] = await Promise.all([
					fetch('/api/pages/students'),
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
	<title>Students & Researchers – ConnectED</title>
	<meta
		name="description"
		content="ConnectED helps students and researchers navigate the PhD journey with clarity, structure, and support."
	/>
</svelte:head>

<Navbar currentPage="students" />

<main>
	<!-- Hero Section -->
	<section class="bg-secondary px-4 pb-16 pt-32 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<span
				class="bg-primary/10 text-primary mb-6 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
			>
				{pageSections?.hero?.strapline || 'FOR STUDENTS & RESEARCHERS'}
			</span>
			<h1 class="text-foreground mb-6 text-balance font-serif text-4xl font-semibold sm:text-5xl">
				{pageSections?.hero?.title || 'Navigate your research journey with clarity'}
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
				{pageSections?.hero?.description || "ConnectED is your companion throughout the entire PhD lifecycle. From finding the right supervisor to planning your career after graduation, we provide the structure and support you need to thrive."}
			</p>
		</div>
	</section>

	<!-- Editable Content Section -->
	<section class="px-4 py-12 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<PageContent pageId="students" />
		</div>
	</section>

	<!-- Pain Points Section -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<div class="mb-12 text-center">
				<span class="text-destructive text-md font-medium uppercase tracking-wider"
					>{pageSections?.painPoints?.strapline || 'Common Challenges'}</span
				>
				<h2 class="text-foreground mt-4 font-serif text-3xl font-semibold">
					{pageSections?.painPoints?.heading || 'We understand the struggles you face'}
				</h2>
			</div>
			<div class="bg-card border-border rounded-2xl border p-8 lg:p-10">
				<ul class="space-y-4">
					{#each (pageSections?.painPoints?.items || []) as point}
						<PainPointItem text={point} />
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<!-- Solutions Section -->
	<section class="bg-secondary px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="mb-16 text-center">
				<span class="text-destructive text-md font-medium uppercase tracking-wider">
					{pageSections?.solutions?.strapline || 'Our Solutions'}
				</span>
				<h2 class="text-foreground mt-4 text-balance font-serif text-3xl font-semibold sm:text-4xl">
					{pageSections?.solutions?.heading || 'How ConnectED supports your journey'}
				</h2>
			</div>

			<div class="grid gap-8 md:grid-cols-3">
				{#if pageSections?.features?.entryPaths}
					<FeatureCard
						title={pageSections.features.entryPaths.title || 'Entry Paths'}
						description={pageSections.features.entryPaths.description || 'Supervisor matching, proposal guidance, application roadmap, and progress tracking. We help you start your PhD journey on the right foot with clear direction and expert support.'}
						icon={getIcon(pageSections.features.entryPaths.iconId) || entryPathIcon}
					/>
				{/if}
				{#if pageSections?.features?.exitPaths}
					<FeatureCard
						title={pageSections.features.exitPaths.title || 'Exit Paths'}
						description={pageSections.features.exitPaths.description || 'Career mapping, skills translation, curated roles and fellowships, plus mentoring and networks. We prepare you for life after your PhD with actionable pathways forward.'}
						icon={getIcon(pageSections.features.exitPaths.iconId) || exitPathIcon}
					/>
				{/if}
				{#if pageSections?.features?.researcherPassport}
					<FeatureCard
						title={pageSections.features.researcherPassport.title || 'Researcher Passport'}
						description={pageSections.features.researcherPassport.description || 'Your verified academic identity with training records, skills, outputs, and collaborations. Portable across institutions, it follows you throughout your entire academic career.'}
						icon={getIcon(pageSections.features.researcherPassport.iconId) || passportIcon}
					/>
				{/if}
			</div>
		</div>
	</section>

	<!-- Entry Paths Detail -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="grid items-center gap-16 lg:grid-cols-2">
				<div>
					<span class="text-destructive text-md font-medium uppercase tracking-wider">
						{pageSections?.features?.entryPaths?.strapline || 'Entry Paths'}
					</span>
					<h2 class="text-foreground mb-6 mt-4 font-serif text-3xl font-semibold">
						{pageSections?.features?.entryPaths?.heading || 'Start your journey with confidence'}
					</h2>
					<div class="space-y-6">
						{#each (pageSections?.features?.entryPaths?.items || []) as item}
							<div class="flex gap-4 items-start">
								{#if item.iconId && getIcon(item.iconId)}
									<div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg [&_svg]:!h-5 [&_svg]:!w-5 [&_svg]:!text-primary">
										{@html getIcon(item.iconId)}
									</div>
								{:else}
									<div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
										<svg
											class="text-primary h-5 w-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
									</div>
								{/if}
								<div>
									<h4 class="text-foreground mb-1 font-medium">{item.title || 'Item'}</h4>
									<p class="text-muted-foreground text-sm">
										{item.description || ''}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<div class="bg-secondary rounded-2xl p-8 lg:p-12">
					<img
						src={pageSections?.features?.entryPaths?.image || imagePath('researcher.jpg')}
						alt="Researcher"
						class="h-auto w-full rounded-xl"
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- Exit Paths Detail -->
	<section class="bg-secondary px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="grid items-center gap-16 lg:grid-cols-2">
				<div class="bg-card order-2 rounded-2xl p-8 lg:order-1 lg:p-12">
					<img
						src={pageSections?.features?.exitPaths?.image || imagePath('career.jpg')}
						alt="Career planning and networking"
						class="h-auto w-full rounded-xl"
					/>
				</div>
				<div class="order-1 lg:order-2">
					<span class="text-destructive text-md font-medium uppercase tracking-wider">
						{pageSections?.features?.exitPaths?.strapline || 'Exit Paths'}
					</span>
					<h2 class="text-foreground mb-6 mt-4 font-serif text-3xl font-semibold">
						{pageSections?.features?.exitPaths?.heading || 'Prepare for life after your PhD'}
					</h2>
					<div class="space-y-6">
						{#each (pageSections?.features?.exitPaths?.items || []) as item}
							<div class="flex gap-4 items-start">
								{#if item.iconId && getIcon(item.iconId)}
									<div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg [&_svg]:!h-5 [&_svg]:!w-5 [&_svg]:!text-primary">
										{@html getIcon(item.iconId)}
									</div>
								{:else}
									<div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
										<svg
											class="text-primary h-5 w-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
											/>
										</svg>
									</div>
								{/if}
								<div>
									<h4 class="text-foreground mb-1 font-medium">{item.title || 'Item'}</h4>
									<p class="text-muted-foreground text-sm">
										{item.description || ''}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Researcher Passport Detail -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<span class="text-destructive text-md font-medium uppercase tracking-wider"
				>{pageSections?.features?.researcherPassport?.strapline || 'Researcher Passport'}</span
			>
			<h2
				class="text-foreground mb-6 mt-4 text-balance font-serif text-3xl font-semibold sm:text-4xl"
			>
				{pageSections?.features?.researcherPassport?.heading || 'Your verified academic identity, wherever you go'}
			</h2>
			<p class="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed">
				{pageSections?.features?.researcherPassport?.subheading || 'The Researcher Passport is your portable academic profile that follows you throughout your career. It captures your verified credentials, training, skills, outputs, and collaborations in one secure place.'}
			</p>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<div class="bg-card border-border rounded-xl border p-6 text-center">
					<div
						class="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
					>
						<svg class="text-primary h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</div>
					<h4 class="text-foreground mb-2 font-medium">Verified Identity</h4>
					<p class="text-muted-foreground text-sm">Authenticated academic credentials</p>
				</div>
				<div class="bg-card border-border rounded-xl border p-6 text-center">
					<div
						class="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
					>
						<svg class="text-primary h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							/>
						</svg>
					</div>
					<h4 class="text-foreground mb-2 font-medium">Training Records</h4>
					<p class="text-muted-foreground text-sm">Complete history of development</p>
				</div>
				<div class="bg-card border-border rounded-xl border p-6 text-center">
					<div
						class="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
					>
						<svg class="text-primary h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
					</div>
					<h4 class="text-foreground mb-2 font-medium">Research Outputs</h4>
					<p class="text-muted-foreground text-sm">Publications and contributions</p>
				</div>
				<div class="bg-card border-border rounded-xl border p-6 text-center">
					<div
						class="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
					>
						<svg class="text-primary h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
							/>
						</svg>
					</div>
					<h4 class="text-foreground mb-2 font-medium">Portable</h4>
					<p class="text-muted-foreground text-sm">Moves with you across institutions</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="bg-primary px-4 py-24 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<h2
				class="text-primary-foreground mb-6 text-balance font-serif text-3xl font-semibold sm:text-4xl"
			>
				{pageSections?.cta?.heading || 'Build your pathway with clarity'}
			</h2>
			<p class="text-primary-foreground/80 mx-auto mb-10 max-w-2xl text-lg leading-relaxed">
				{pageSections?.cta?.description || 'Join thousands of researchers who have found structure and support with ConnectED. Start your journey today.'}
			</p>
			<a
				href="/contact"
				class="bg-card text-foreground hover:bg-card/90 inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-medium transition-colors"
			>
				{pageSections?.cta?.button || 'Get Started with ConnectED'}
			</a>
		</div>
	</section>
</main>

<Footer />
