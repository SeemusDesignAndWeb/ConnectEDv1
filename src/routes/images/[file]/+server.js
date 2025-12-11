import { error } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';

const IMAGE_STORE = path
	.resolve(process.env.IMAGE_STORE || process.env.VITE_IMAGE_STORE || 'data/images')
	.replace(/\/$/, '');

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
