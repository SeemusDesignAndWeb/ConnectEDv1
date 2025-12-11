import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { verifyPassword, setSession } from '$lib/auth.js';

/**
 * POST /api/admin/login
 * Authenticate admin user
 */
export async function POST({ request, cookies }) {
	try {
		const { password } = await request.json();

		if (!password) {
			return json({ error: 'Password is required' }, { status: 400 });
		}

		// Check if admin password is configured
		// Use $env/dynamic/private to access .env variables
		const adminPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
		if (!adminPassword) {
			console.error('[API] ADMIN_PASSWORD not set in environment variables');
			console.error('[API] Make sure .env file exists with ADMIN_PASSWORD=TheRootOfTheTree!');
			console.error('[API] Restart the dev server after changing .env file');
			return json({ 
				error: 'Server configuration error: Admin password not configured. Check server logs.',
				hint: 'Make sure ADMIN_PASSWORD is set in .env file and restart the server'
			}, { status: 500 });
		}

		console.log('[API] Login attempt - checking password...');
		console.log('[API] Expected password length:', adminPassword.length);
		console.log('[API] Provided password length:', password?.length);
		
		const isValid = verifyPassword(password);
		
		if (!isValid) {
			console.log('[API] Login attempt failed - password mismatch');
			console.log('[API] Check server console for detailed comparison');
			return json({ error: 'Invalid password' }, { status: 401 });
		}
		
		console.log('[API] Login successful');

		// Set session
		setSession(cookies);

		return json({ success: true });
	} catch (error) {
		console.error('[API] Login error:', error);
		return json({ error: 'Login failed' }, { status: 500 });
	}
}
