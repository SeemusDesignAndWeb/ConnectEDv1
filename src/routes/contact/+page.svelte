<script>
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '$lib/components/footer.svelte';

	let formData = $state({
		name: '',
		email: '',
		organization: '',
		type: '',
		message: ''
	});

	let submitted = $state(false);

	function handleSubmit(event) {
		event.preventDefault();
		// In a real app, this would send the form data to an API
		console.log('[v0] Form submitted:', formData);
		submitted = true;
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
				Get in Touch
			</h1>
			<p class="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
				Whether you're a student seeking clarity, a researcher looking for support, or an
				institution exploring partnership, we'd love to hear from you.
			</p>
		</div>
	</section>

	<!-- Contact Form Section -->
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-4xl">
			<div class="grid gap-12 lg:grid-cols-5">
				<!-- Contact Info -->
				<div class="lg:col-span-2">
					<h2 class="text-foreground mb-6 font-serif text-2xl font-semibold">Let's connect</h2>
					<p class="text-muted-foreground mb-8 leading-relaxed">
						Fill out the form and our team will get back to you within 48 hours. You can also reach
						us directly through the channels below.
					</p>

					<div class="space-y-6">
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
								<a href="mailto:hello@connected.edu" class="text-destructive text-sm hover:underline"
									>hello@connected.edu</a
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
								<p class="text-muted-foreground text-sm">
									Innovation Hub, Research Park<br />Cambridge, UK
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
								<p class="text-muted-foreground text-sm">Within 48 hours</p>
							</div>
						</div>
					</div>
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
								Thank you for reaching out!
							</h3>
							<p class="text-muted-foreground">
								We've received your message and will get back to you within 48 hours.
							</p>
						</div>
					{:else}
						<form onsubmit={handleSubmit} class="bg-card border-border rounded-2xl border p-8">
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
										class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
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
										class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
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
										class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
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
										class="border-input bg-background text-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
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
									class="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full resize-none rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
									placeholder="How can we help you?"
								></textarea>
							</div>

							<button
								type="submit"
								class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl px-8 py-3 font-medium transition-colors sm:w-auto"
							>
								Send Message
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
					Frequently Asked Questions
				</h2>
			</div>

			<div class="space-y-4">
				<div class="bg-card border-border rounded-xl border p-6">
					<h4 class="text-foreground mb-2 font-medium">Is ConnectED free for students?</h4>
					<p class="text-muted-foreground text-sm leading-relaxed">
						ConnectED offers free core features for students and researchers. Some advanced features
						may be available through institutional partnerships.
					</p>
				</div>
				<div class="bg-card border-border rounded-xl border p-6">
					<h4 class="text-foreground mb-2 font-medium">How do university partnerships work?</h4>
					<p class="text-muted-foreground text-sm leading-relaxed">
						We work with institutions to integrate ConnectED into existing doctoral programmes.
						Contact us to discuss partnership models tailored to your needs.
					</p>
				</div>
				<div class="bg-card border-border rounded-xl border p-6">
					<h4 class="text-foreground mb-2 font-medium">Is my data secure?</h4>
					<p class="text-muted-foreground text-sm leading-relaxed">
						Absolutely. We take data security seriously and comply with GDPR and institutional data
						protection requirements. Your Researcher Passport remains under your control.
					</p>
				</div>
			</div>
		</div>
	</section>
</main>

<Footer />
