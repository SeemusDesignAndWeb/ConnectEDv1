<script>
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '$lib/components/footer.svelte';
</script>

<svelte:head>
	<title>ConnectED – The PhD Journey, Connected</title>
	<meta
		name="description"
		content="ConnectED brings clarity, structure, and opportunity to the PhD lifecycle. Connecting students, researchers, supervisors, and institutions."
	/>
</svelte:head>

<Navbar currentPage="home" />

<main>
	<!-- Hero Section -->
	<section class="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<div class="mb-8 flex justify-center">
				<img
					src="/images/logo_colour.svg"
					alt="ConnectED Logo"
					class="h-20 w-20 object-contain sm:h-24 sm:w-24"
				/>
			</div>
			<h1
				class="text-foreground mb-6 text-balance font-serif text-4xl font-semibold sm:text-5xl lg:text-6xl"
			>
				ConnectED – The PhD Journey, Connected
			</h1>
			<p
				class="text-muted-foreground mx-auto mb-12 max-w-2xl text-pretty text-lg leading-relaxed sm:text-xl"
			>
				ConnectED brings clarity, structure, and opportunity to the PhD lifecycle. Whether you're
				starting your research journey or supporting those who are, we're here to help.
			</p>

			<!-- Audience Pathway Buttons -->
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a
					href="/students"
					class="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-medium shadow-lg transition-colors"
				>
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						/>
					</svg>
					I am a Student / Researcher
				</a>
				<a
					href="/universities"
					class="bg-card text-card-foreground border-border hover:bg-secondary inline-flex items-center justify-center rounded-xl border px-8 py-4 text-base font-medium transition-colors"
				>
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
						/>
					</svg>
					I am a University / Partner
				</a>
			</div>
		</div>
	</section>

	<!-- Visual Divider -->
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="border-border border-t"></div>
	</div>

	<!-- Overview Section -->
	<section class="px-4 py-24 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="grid items-center gap-16 md:grid-cols-2">
				<div>
					<span class="text-destructive text-sm font-medium uppercase tracking-wider">Our Mission</span>
					<h2
						class="text-foreground mb-6 mt-4 text-balance font-serif text-3xl font-semibold sm:text-4xl"
					>
						One connected ecosystem for the entire research journey
					</h2>
					<p class="text-muted-foreground mb-6 leading-relaxed">
						ConnectED brings students, researchers, supervisors, and institutions into one connected
						ecosystem. Students gain clarity. Universities gain efficiency. Supervisors gain
						insight. Employers gain visibility.
					</p>
					<p class="text-muted-foreground leading-relaxed">
						We understand that the PhD journey can feel overwhelming, fragmented, and uncertain.
						That's why we've built a platform that provides structure without rigidity, support
						without dependency, and clarity without oversimplification.
					</p>
				</div>
				<div class="bg-secondary rounded-2xl p-8 lg:p-12">
					<div class="grid grid-cols-2 gap-6">
						<div class="bg-card rounded-xl p-6 text-center">
							<div class="text-destructive mb-2 text-3xl font-bold">10K+</div>
							<div class="text-muted-foreground text-sm">Researchers</div>
						</div>
						<div class="bg-card rounded-xl p-6 text-center">
							<div class="text-destructive mb-2 text-3xl font-bold">150+</div>
							<div class="text-muted-foreground text-sm">Institutions</div>
						</div>
						<div class="bg-card rounded-xl p-6 text-center">
							<div class="text-destructive mb-2 text-3xl font-bold">500+</div>
							<div class="text-muted-foreground text-sm">Supervisors</div>
						</div>
						<div class="bg-card rounded-xl p-6 text-center">
							<div class="text-destructive mb-2 text-3xl font-bold">95%</div>
							<div class="text-muted-foreground text-sm">Satisfaction</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Shared Closing Section -->
	<section class="bg-secondary px-4 py-24 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<h2 class="text-foreground mb-6 text-balance font-serif text-3xl font-semibold sm:text-4xl">
				Ready to transform your research journey?
			</h2>
			<p class="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed">
				ConnectED brings students, researchers, supervisors, and institutions into one connected
				ecosystem. Students gain clarity. Universities gain efficiency. Supervisors gain insight.
				Employers gain visibility.
			</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a
					href="/students"
					class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition-colors"
				>
					Student / Researcher Path
				</a>
				<a
					href="/universities"
					class="bg-card text-card-foreground border-border hover:bg-background inline-flex items-center justify-center rounded-xl border px-6 py-3 text-sm font-medium transition-colors"
				>
					University / Partner Path
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
