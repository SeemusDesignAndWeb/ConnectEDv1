import { json } from '@sveltejs/kit';
import { readDatabase } from '$lib/database.js';

/**
 * GET /api/settings
 * Get site settings (public endpoint for frontend)
 */
export async function GET() {
	try {
		const db = readDatabase();
		return json({ 
			settings: db.settings || {}
		});
	} catch (error) {
		console.error('[API] Error getting settings:', error);
		return json({ settings: {} });
	}
}