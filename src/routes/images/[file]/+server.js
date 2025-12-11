import { error } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';

// Use IMAGE_STORE environment variable to determine where to read images from
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
		finalPath = path.resolve('data/images');
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

export async function GET({ params }) {
	const file = params.file;
	if (!file) throw error(404, 'Not found');

	const target = path.join(IMAGE_STORE, file);

	try {
		const data = await fs.readFile(target);
		const ext = path.extname(file).toLowerCase();
		const type =
			ext === '.png'
				? 'image/png'
				: ext === '.jpg' || ext === '.jpeg'
					? 'image/jpeg'
					: ext === '.gif'
						? 'image/gif'
						: ext === '.svg'
							? 'image/svg+xml'
							: ext === '.webp'
								? 'image/webp'
								: 'application/octet-stream';

		return new Response(data, {
			headers: {
				'Content-Type': type,
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (err) {
		throw error(404, 'Not found');
	}
}
