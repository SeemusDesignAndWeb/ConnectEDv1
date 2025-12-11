import { redirect } from '@sveltejs/kit';
import { getSession } from '$lib/auth.js';

export async function load({ cookies, url }) {
	const session = getSession(cookies);
	const isLoginPage = url.pathname === '/admin/login';
	
	// If not authenticated and not on login page, redirect to login
	if (!session && !isLoginPage) {
		throw redirect(302, '/admin/login');
	}
	
	// If authenticated and on login page, redirect to dashboard
	if (session && isLoginPage) {
		throw redirect(302, '/admin');
	}
	
	return {
		authenticated: !!session
	};
}
