import { json } from '@sveltejs/kit';
import { checkAuth } from '$lib/auth.js';
import { readDatabase, writeDatabase } from '$lib/database.js';

/**
 * GET /api/admin/icons
 * Get all icons
 */
export async function GET({ cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const db = readDatabase();
		return json({ icons: db.icons || [] });
	} catch (error) {
		console.error('[API] Error getting icons:', error);
		return json({ error: error.message || 'Failed to get icons' }, { status: 500 });
	}
}

/**
 * POST /api/admin/icons
 * Create a new icon
 */
export async function POST({ request, cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { name, svg } = await request.json();

		if (!name || !svg) {
			return json({ error: 'Name and SVG are required' }, { status: 400 });
		}

		const db = readDatabase();
		
		// Check if we've reached the limit
		if (db.icons && db.icons.length >= 20) {
			return json({ error: 'Maximum of 20 icons allowed' }, { status: 400 });
		}

		// Generate ID from name
		const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		
		// Check if ID already exists
		if (db.icons && db.icons.some(icon => icon.id === id)) {
			return json({ error: 'An icon with this name already exists' }, { status: 400 });
		}

		const newIcon = {
			id,
			name,
			svg,
			createdAt: new Date().toISOString()
		};

		if (!db.icons) {
			db.icons = [];
		}

		db.icons.push(newIcon);
		writeDatabase(db);

		return json({ success: true, icon: newIcon });
	} catch (error) {
		console.error('[API] Error creating icon:', error);
		return json({ error: error.message || 'Failed to create icon' }, { status: 500 });
	}
}

/**
 * PUT /api/admin/icons
 * Update an icon
 */
export async function PUT({ request, cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { id, name, svg } = await request.json();

		if (!id) {
			return json({ error: 'Icon ID is required' }, { status: 400 });
		}

		const db = readDatabase();
		const iconIndex = db.icons.findIndex((icon) => icon.id === id);

		if (iconIndex === -1) {
			return json({ error: 'Icon not found' }, { status: 404 });
		}

		if (name !== undefined) {
			db.icons[iconIndex].name = name;
		}
		if (svg !== undefined) {
			db.icons[iconIndex].svg = svg;
		}
		db.icons[iconIndex].updatedAt = new Date().toISOString();

		writeDatabase(db);

		return json({ success: true, icon: db.icons[iconIndex] });
	} catch (error) {
		console.error('[API] Error updating icon:', error);
		return json({ error: error.message || 'Failed to update icon' }, { status: 500 });
	}
}

/**
 * DELETE /api/admin/icons
 * Delete an icon
 */
export async function DELETE({ request, cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { id } = await request.json();

		if (!id) {
			return json({ error: 'Icon ID is required' }, { status: 400 });
		}

		const db = readDatabase();
		const iconIndex = db.icons.findIndex((icon) => icon.id === id);

		if (iconIndex === -1) {
			return json({ error: 'Icon not found' }, { status: 404 });
		}

		db.icons.splice(iconIndex, 1);
		writeDatabase(db);

		return json({ success: true });
	} catch (error) {
		console.error('[API] Error deleting icon:', error);
		return json({ error: error.message || 'Failed to delete icon' }, { status: 500 });
	}
}
