import { json } from '@sveltejs/kit';
import { readDatabase } from '$lib/database.js';

/**
 * GET /api/pages/[path]
 * Get page content by path (public endpoint for frontend)
 */
export async function GET({ params }) {
	try {
		const db = readDatabase();
		// Try to find by id first, then by path
		let page = db.pages.find((p) => p.id === params.path);
		
		if (!page) {
			// Try matching by path
			const normalizedPath = params.path === 'home' ? '/' : `/${params.path}`;
			page = db.pages.find((p) => p.path === normalizedPath);
		}

		if (!page) {
			return json({ content: null, sections: null });
		}

		return json({ 
			content: page.content || '',
			sections: page.sections || null
		});
	} catch (error) {
		console.error('[API] Error getting page content:', error);
		return json({ content: null });
	}
}
