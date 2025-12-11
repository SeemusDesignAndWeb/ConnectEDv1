import { json } from '@sveltejs/kit';
import { readDatabase } from '$lib/database.js';

/**
 * GET /api/icons
 * Get all icons (public endpoint)
 */
export async function GET() {
	try {
		const db = readDatabase();
		return json({ icons: db.icons || [] });
	} catch (error) {
		console.error('[API] Error getting icons:', error);
		return json({ icons: [] });
	}
}
