<script>
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '$lib/components/footer.svelte';
	import FeatureCard from '$lib/components/feature-card.svelte';
	import PainPointItem from '$lib/components/pain-point-item.svelte';

	const entryPathIcon = `<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>`;

	const exitPathIcon = `<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>`;

	const passportIcon = `<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>`;

	const painPoints = [
		'Unclear expectations and uncertain milestones throughout the PhD journey',
		'Scattered funding opportunities that are difficult to find and navigate',
		'Limited guidance on structuring research and developing proposals',
		'Difficulty finding the right supervisor with aligned research interests',
		'Uncertainty about career paths after completing a doctorate',
		'Feeling isolated without access to networks and mentorship'
	];
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
				For Students & Researchers
			</span>
			<h1 class="text-foreground mb-6 text-balance font-serif text-4xl font-semibold sm:text-5xl">
				Navigate your research journey with clarity
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
				ConnectED is your companion throughout the entire PhD lifecycle. From finding the right
				supervisor to planning your career after graduation, we provide the structure and support
				you need to thrive.
			</p>
		</div>
	</section>

	<!-- Pain Points Section -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<div class="mb-12 text-center">
				<span class="text-destructive text-md font-medium uppercase tracking-wider"
					>Common Challenges</span
				>
				<h2 class="text-foreground mt-4 font-serif text-3xl font-semibold">
					We understand the struggles you face
				</h2>
			</div>
			<div class="bg-card border-border rounded-2xl border p-8 lg:p-10">
				<ul class="space-y-4">
					{#each painPoints as point}
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
				<span class="text-destructive text-md font-medium uppercase tracking-wider">Our Solutions</span>
				<h2 class="text-foreground mt-4 text-balance font-serif text-3xl font-semibold sm:text-4xl">
					How ConnectED supports your journey
				</h2>
			</div>

			<div class="grid gap-8 md:grid-cols-3">
				<FeatureCard
					title="Entry Paths"
					description="Supervisor matching, proposal guidance, application roadmap, and progress tracking. We help you start your PhD journey on the right foot with clear direction and expert support."
					icon={entryPathIcon}
				/>
				<FeatureCard
					title="Exit Paths"
					description="Career mapping, skills translation, curated roles and fellowships, plus mentoring and networks. We prepare you for life after your PhD with actionable pathways forward."
					icon={exitPathIcon}
				/>
				<FeatureCard
					title="Researcher Passport"
					description="Your verified academic identity with training records, skills, outputs, and collaborations. Portable across institutions, it follows you throughout your entire academic career."
					icon={passportIcon}
				/>
			</div>
		</div>
	</section>

	<!-- Entry Paths Detail -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="grid items-center gap-16 lg:grid-cols-2">
				<div>
					<span class="text-destructive text-md font-medium uppercase tracking-wider">Entry Paths</span>
					<h2 class="text-foreground mb-6 mt-4 font-serif text-3xl font-semibold">
						Start your journey with confidence
					</h2>
					<div class="space-y-6">
						<div class="flex gap-4">
							<div
								class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
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
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Supervisor Matching</h4>
								<p class="text-muted-foreground text-sm">
									Find supervisors whose research interests align with yours through intelligent
									matching.
								</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div
								class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
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
							<div>
								<h4 class="text-foreground mb-1 font-medium">Proposal Guidance</h4>
								<p class="text-muted-foreground text-sm">
									Structure your research proposal with expert templates and feedback.
								</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div
								class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
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
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Application Roadmap</h4>
								<p class="text-muted-foreground text-sm">
									Navigate the application process with clear milestones and deadlines.
								</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div
								class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
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
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Progress Tracking</h4>
								<p class="text-muted-foreground text-sm">
									Monitor your progress and stay accountable with structured milestones.
								</p>
							</div>
						</div>
					</div>
				</div>
				<div class="bg-secondary rounded-2xl p-8 lg:p-12">
					<img
						src="/placeholder.svg?height=400&width=500"
						alt="Student working on research"
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
						src="/placeholder.svg?height=400&width=500"
						alt="Career planning and networking"
						class="h-auto w-full rounded-xl"
					/>
				</div>
				<div class="order-1 lg:order-2">
					<span class="text-destructive text-md font-medium uppercase tracking-wider">Exit Paths</span>
					<h2 class="text-foreground mb-6 mt-4 font-serif text-3xl font-semibold">
						Prepare for life after your PhD
					</h2>
					<div class="space-y-6">
						<div class="flex gap-4">
							<div
								class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
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
							<div>
								<h4 class="text-foreground mb-1 font-medium">Career Mapping</h4>
								<p class="text-muted-foreground text-sm">
									Explore diverse career paths tailored to your skills and interests.
								</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div
								class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
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
										d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Skills Translation</h4>
								<p class="text-muted-foreground text-sm">
									Learn how to articulate your research skills for industry and beyond.
								</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div
								class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
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
										d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Curated Opportunities</h4>
								<p class="text-muted-foreground text-sm">
									Access curated roles and fellowships matched to your profile.
								</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div
								class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
							>
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
										d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Mentoring & Networks</h4>
								<p class="text-muted-foreground text-sm">
									Connect with mentors and expand your professional network.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Researcher Passport Detail -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<span class="text-destructive text-md font-medium uppercase tracking-wider"
				>Researcher Passport</span
			>
			<h2
				class="text-foreground mb-6 mt-4 text-balance font-serif text-3xl font-semibold sm:text-4xl"
			>
				Your verified academic identity, wherever you go
			</h2>
			<p class="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed">
				The Researcher Passport is your portable academic profile that follows you throughout your
				career. It captures your verified credentials, training, skills, outputs, and collaborations
				in one secure place.
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
				Build your pathway with clarity
			</h2>
			<p class="text-primary-foreground/80 mx-auto mb-10 max-w-2xl text-lg leading-relaxed">
				Join thousands of researchers who have found structure and support with ConnectED. Start
				your journey today.
			</p>
			<a
				href="/contact"
				class="bg-card text-foreground hover:bg-card/90 inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-medium transition-colors"
			>
				Get Started with ConnectED
			</a>
		</div>
	</section>
</main>

<Footer />
