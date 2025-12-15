import { json } from '@sveltejs/kit';
import { clearSession } from '$lib/auth.js';

/**
 * POST /api/admin/logout
 * Logout admin user
 */
export async function POST({ cookies }) {
	clearSession(cookies);
	return json({ success: true });
}

