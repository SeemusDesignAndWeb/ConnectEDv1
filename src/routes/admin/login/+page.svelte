<script>
	import { goto } from '$app/navigation';
	
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	
	async function handleLogin(e) {
		e.preventDefault();
		error = '';
		loading = true;
		
		try {
			const response = await fetch('/api/admin/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ password })
			});
			
			const data = await response.json();
			
			if (response.ok) {
				goto('/admin');
			} else {
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Login – ConnectED</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
	<div class="bg-card border-border w-full max-w-md rounded-2xl border p-8">
		<div class="mb-8 text-center">
			<div class="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
				<svg class="text-primary h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			</div>
			<h1 class="text-foreground mb-2 font-serif text-2xl font-semibold">Admin Login</h1>
			<p class="text-muted-foreground text-sm">Enter your password to access the admin area</p>
		</div>

		{#if error}
			<div class="bg-destructive/10 text-destructive mb-4 rounded-lg p-3 text-sm">
				{error}
			</div>
		{/if}

		<form onsubmit={handleLogin} class="space-y-4">
			<div>
				<label for="password" class="text-foreground mb-2 block text-sm font-medium">
					Password
				</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					autofocus
					class="border-input bg-background text-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2"
					placeholder="Enter admin password"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 w-full rounded-xl px-6 py-3 font-medium transition-colors"
			>
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>
	</div>
</div>
