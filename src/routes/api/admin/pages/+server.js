import { json } from '@sveltejs/kit';
import { checkAuth } from '$lib/auth.js';
import { readDatabase, writeDatabase } from '$lib/database.js';

/**
 * GET /api/admin/pages
 * Get all pages
 */
export async function GET({ cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const db = readDatabase();
		return json({ pages: db.pages || [] });
	} catch (error) {
		console.error('[API] Error getting pages:', error);
		return json({ error: error.message || 'Failed to get pages' }, { status: 500 });
	}
}

/**
 * PUT /api/admin/pages
 * Update a page
 */
export async function PUT({ request, cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const body = await request.json();
		const { id, content, sections } = body;

		if (!id) {
			return json({ error: 'Page ID is required' }, { status: 400 });
		}

		const db = readDatabase();
		const pageIndex = db.pages.findIndex((p) => p.id === id);

		if (pageIndex === -1) {
			return json({ error: 'Page not found' }, { status: 404 });
		}

		// Update page content (for backward compatibility)
		if (content !== undefined) {
			db.pages[pageIndex].content = content || '';
		}

		// Update page sections if provided
		if (sections !== undefined) {
			db.pages[pageIndex].sections = sections;
		}

		db.pages[pageIndex].updatedAt = new Date().toISOString();

		writeDatabase(db);

		return json({ success: true, page: db.pages[pageIndex] });
	} catch (error) {
		console.error('[API] Error updating page:', error);
		return json({ error: error.message || 'Failed to update page' }, { status: 500 });
	}
}
