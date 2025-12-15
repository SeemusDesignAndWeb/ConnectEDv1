<script>
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '$lib/components/footer.svelte';
	import PageContent from '$lib/components/page-content.svelte';

	let formData = $state({
		name: '',
		email: '',
		organization: '',
		type: '',
		message: '',
		website: '' // Honeypot field - bots will fill this, humans won't
	});

	let submitted = $state(false);
	let submitting = $state(false);
	let error = $state(null);
	let pageSections = $state(null);

	$effect(() => {
		(async () => {
			try {
				const response = await fetch('/api/pages/contact');
				if (response.ok) {
					const data = await response.json();
					if (data.sections) {
						pageSections = data.sections;
					}
				}
			} catch (error) {
				console.error('Failed to load page sections:', error);
			}
		})();
	});

	async function handleSubmit(event) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send message');
			}

			submitted = true;
			// Reset form
			formData = {
				name: '',
				email: '',
				organization: '',
				type: '',
				message: '',
				website: ''
			};
		} catch (err) {
			error = err.message;
			console.error('Form submission error:', err);
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Contact – ConnectED</title>
	<meta
		name="description"
		content="Get in touch with ConnectED. We're here to help students, researchers, and institutions."
	/>
</svelte:head>

<Navbar currentPage="contact" />

<main>
	<!-- Hero Section -->
	<section class="bg-secondary px-4 pb-16 pt-32 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<h1 class="text-foreground mb-6 text-balance font-serif text-4xl font-semibold sm:text-5xl">
				{pageSections?.hero?.title || 'Get in Touch'}
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
				{pageSections?.hero?.description || "Whether you're a student seeking clarity, a researcher looking for support, or an institution exploring partnership, we'd love to hear from you."}
			</p>
		</div>
	</section>

	<!-- Editable Content Section -->
	<section class="px-4 py-12 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<PageContent pageId="contact" />
		</div>
	</section>

	<!-- Contact Form Section -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<div class="grid gap-12 lg:grid-cols-5">
				<!-- Contact Info -->
				<div class="lg:col-span-2">
					<h2 class="text-foreground mb-6 font-serif text-2xl font-semibold">
						{pageSections?.formSection?.heading || 'Let\'s connect'}
					</h2>
					<p class="text-muted-foreground mb-8 leading-relaxed">
						{pageSections?.formSection?.description || pageSections?.formDescription || "Fill out the form and our team will get back to you within 48 hours."}
					</p>

					<!-- <div class="space-y-6">
						<div class="flex items-start gap-4">
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
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Email</h4>
								<a href="mailto:{pageSections?.contactInfo?.email || 'hello@connected.edu'}" class="text-destructive text-sm hover:underline"
									>{pageSections?.contactInfo?.email || 'hello@connected.edu'}</a
								>
							</div>
						</div>
						<div class="flex items-start gap-4">
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
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Office</h4>
								<p class="text-muted-foreground text-sm whitespace-pre-line">
									{pageSections?.contactInfo?.office || 'Innovation Hub, Research Park\nCambridge, UK'}
								</p>
							</div>
						</div>
						<div class="flex items-start gap-4">
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
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<h4 class="text-foreground mb-1 font-medium">Response Time</h4>
								<p class="text-muted-foreground text-sm">{pageSections?.contactInfo?.responseTime || 'Within 48 hours'}</p>
							</div>
						</div>
					</div> -->
				</div>

				<!-- Form -->
				<div class="lg:col-span-3">
					{#if submitted}
						<div class="bg-primary/10 rounded-2xl p-8 text-center">
							<div
								class="bg-primary/20 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
							>
								<svg
									class="text-primary h-8 w-8"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h3 class="text-foreground mb-3 text-xl font-semibold">
								{pageSections?.formSuccess?.heading || 'Thank you for reaching out!'}
							</h3>
							<p class="text-muted-foreground">
								{pageSections?.formSuccess?.message || "We've received your message and will get back to you within 48 hours."}
							</p>
						</div>
					{:else}
						<form onsubmit={handleSubmit} class="bg-card border-border relative rounded-2xl border p-8">
							{#if error}
								<div class="bg-destructive/10 border-destructive/20 text-destructive mb-6 rounded-xl border p-4">
									<p class="text-sm font-medium">Error: {error}</p>
									<p class="mt-1 text-xs">Please try again or contact us directly.</p>
								</div>
							{/if}

							<div class="mb-6 grid gap-6 sm:grid-cols-2">
								<div>
									<label for="name" class="text-foreground mb-2 block text-sm font-medium"
										>Name</label
									>
									<input
										type="text"
										id="name"
										bind:value={formData.name}
										required
										disabled={submitting}
										class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-50"
										placeholder="Your name"
									/>
								</div>
								<div>
									<label for="email" class="text-foreground mb-2 block text-sm font-medium"
										>Email</label
									>
									<input
										type="email"
										id="email"
										bind:value={formData.email}
										required
										disabled={submitting}
										class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-50"
										placeholder="you@example.com"
									/>
								</div>
							</div>

							<div class="mb-6 grid gap-6 sm:grid-cols-2">
								<div>
									<label for="organization" class="text-foreground mb-2 block text-sm font-medium"
										>Organisation (optional)</label
									>
									<input
										type="text"
										id="organization"
										bind:value={formData.organization}
										disabled={submitting}
										class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-50"
										placeholder="University or company"
									/>
								</div>
								<div>
									<label for="type" class="text-foreground mb-2 block text-sm font-medium"
										>I am a...</label
									>
									<select
										id="type"
										bind:value={formData.type}
										required
										disabled={submitting}
										class="border-input bg-background text-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-50"
									>
										<option value="">Select an option</option>
										<option value="student">Student / Researcher</option>
										<option value="university">University / Institution</option>
										<option value="employer">Employer / Partner</option>
										<option value="other">Other</option>
									</select>
								</div>
							</div>

							<div class="mb-6">
								<label for="message" class="text-foreground mb-2 block text-sm font-medium"
									>Message</label
								>
								<textarea
									id="message"
									bind:value={formData.message}
									required
									rows="5"
									disabled={submitting}
									class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full resize-none rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-50"
									placeholder="How can we help you?"
								></textarea>
							</div>

							<!-- Honeypot field - hidden from users but visible to bots -->
							<div style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" aria-hidden="true">
								<label for="website">Website (leave blank)</label>
								<input
									type="text"
									id="website"
									name="website"
									tabindex="-1"
									autocomplete="off"
									bind:value={formData.website}
								/>
							</div>

							<button
								type="submit"
								disabled={submitting}
								class="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-xl px-8 py-3 font-medium transition-colors sm:w-auto"
							>
								{submitting ? 'Sending...' : 'Send Message'}
							</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="bg-secondary px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<div class="mb-12 text-center">
				<h2 class="text-foreground font-serif text-3xl font-semibold">
					{pageSections?.faq?.heading || 'Frequently Asked Questions'}
				</h2>
			</div>

			<div class="space-y-4">
				{#each (pageSections?.faq?.items || []) as faq}
				<div class="bg-card border-border rounded-xl border p-6">
						<h4 class="text-foreground mb-2 font-medium">{faq.question}</h4>
					<div class="text-muted-foreground text-sm leading-relaxed prose prose-sm max-w-none">
							{@html faq.answer}
					</div>
				</div>
				{/each}
			</div>
		</div>
	</section>
</main>

<Footer />
