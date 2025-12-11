import { json } from '@sveltejs/kit';
import { checkAuth } from '$lib/auth.js';
import path from 'node:path';
import fs from 'node:fs/promises';

// Use IMAGE_STORE environment variable to determine where to store images
// Local: IMAGE_STORE=./data/images (or not set, defaults to relative path)
// Production: IMAGE_STORE=/data/images (absolute path pointing to volume)
const IMAGE_STORE_ENV = process.env.IMAGE_STORE || process.env.VITE_IMAGE_STORE;

/**
 * Get the resolved image store path, handling both relative (local) and absolute (production) paths
 * @returns {string} The resolved image store directory path
 */
function getImageStorePath() {
	let finalPath;
	if (!IMAGE_STORE_ENV) {
		// Default to relative path for local development
		finalPath = path.resolve('./data/images');
	} else if (IMAGE_STORE_ENV.startsWith('./') || IMAGE_STORE_ENV.startsWith('../')) {
		// Relative path - local development
		finalPath = path.resolve(IMAGE_STORE_ENV);
	} else {
		// Absolute path - production (Railway volume)
		finalPath = IMAGE_STORE_ENV;
	}
	return finalPath.replace(/\/$/, '');
}

const IMAGE_STORE = getImageStorePath();
const PUBLIC_BASE = (process.env.IMAGE_BASE || process.env.VITE_IMAGE_BASE || '/images').replace(/\/$/, '');

const ensureDir = async (dir) => {
	await fs.mkdir(dir, { recursive: true });
};

const listImages = async () => {
	await ensureDir(IMAGE_STORE);
	try {
		const files = await fs.readdir(IMAGE_STORE, { withFileTypes: true });
		return files
			.filter((f) => f.isFile())
			.map((f) => ({
				name: f.name,
				url: `${PUBLIC_BASE}/${f.name}`
			}));
	} catch (err) {
		if (err.code === 'ENOENT') return [];
		throw err;
	}
};

export async function GET({ cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const images = await listImages();
		return json({ images, publicBase: PUBLIC_BASE, storagePath: IMAGE_STORE });
	} catch (error) {
		console.error('[API] Error listing images:', error);
		return json({ error: 'Failed to list images' }, { status: 500 });
	}
}

export async function POST({ request, cookies }) {
	if (!checkAuth(cookies)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const contentType = request.headers.get('content-type') || '';
		
		// Support both FormData and JSON (base64) uploads
		let file, fileName;
		
		if (contentType.includes('application/json')) {
			// JSON upload with base64 data
			const body = await request.json();
			if (!body.data || !body.filename) {
				return json({ error: 'JSON upload requires "data" (base64) and "filename" fields' }, { status: 400 });
			}
			
			try {
				const buffer = Buffer.from(body.data, 'base64');
				// Create a File-like object
				fileName = body.filename;
				file = {
					name: fileName,
					type: body.mimeType || 'image/jpeg',
					arrayBuffer: async () => buffer
				};
			} catch (error) {
				return json({ error: 'Invalid base64 data' }, { status: 400 });
			}
		} else {
			// FormData upload (original method)
			const formData = await request.formData();
			file = formData.get('file');
		}

		if (!file) {
			return json({ error: 'File is required' }, { status: 400 });
		}

		// Basic validation
		if (file.type && !file.type.startsWith('image/')) {
			return json({ error: 'Only image uploads are allowed' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		
		if (!fileName) {
			fileName = file.name;
		}

		const sanitizedName = fileName
			.toLowerCase()
			.replace(/[^a-z0-9_.-]+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '') || 'image';

		const ext = path.extname(sanitizedName) || '.jpg';
		const base = path.basename(sanitizedName, ext);
		let finalName = `${base}${ext}`;
		let counter = 1;
		const maxRetries = 100; // Prevent infinite loop

		console.log('[API] Image store path:', IMAGE_STORE);
		console.log('[API] IMAGE_STORE env var:', process.env.IMAGE_STORE || process.env.VITE_IMAGE_STORE || 'not set');
		console.log('[API] Ensuring directory exists:', IMAGE_STORE);
		await ensureDir(IMAGE_STORE);
		console.log('[API] Directory ready, writing file...');

		let targetPath = path.join(IMAGE_STORE, finalName);
		console.log('[API] Writing to:', targetPath);
		console.log('[API] File size:', buffer.length, 'bytes');
		
		// Find available filename - limit retries to prevent infinite loop
		while (counter <= maxRetries) {
			try {
				await fs.writeFile(targetPath, buffer, { flag: 'wx' });
				console.log('[API] File written successfully:', finalName);
				break;
			} catch (err) {
				if (err.code === 'EEXIST') {
					console.log(`[API] File exists (attempt ${counter}/${maxRetries}), trying: ${finalName}`);
					finalName = `${base}-${counter}${ext}`;
					targetPath = path.join(IMAGE_STORE, finalName);
					counter += 1;
					if (counter > maxRetries) {
						console.error('[API] Max retries reached');
						throw new Error(`Could not find available filename after ${maxRetries} attempts`);
					}
					continue;
				}
				console.error('[API] Write error:', err.code, err.message, err.stack);
				throw err;
			}
		}

		console.log('[API] Listing images...');
		let images;
		try {
			images = await listImages();
			console.log('[API] Found', images.length, 'images');
		} catch (listErr) {
			console.error('[API] Error listing images after upload:', listErr);
			// Still return success if file was written, just without updated list
			images = [];
		}
		return json({
			success: true,
			images,
			uploaded: `${PUBLIC_BASE}/${finalName}`,
			publicBase: PUBLIC_BASE,
			storagePath: IMAGE_STORE
		});
	} catch (error) {
		console.error('[API] Error uploading image:', error);
		return json({ error: 'Failed to upload image' }, { status: 500 });
	}
}

