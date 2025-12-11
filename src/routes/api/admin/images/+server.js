import { json } from '@sveltejs/kit';
import { checkAuth } from '$lib/auth.js';
import path from 'node:path';
import fs from 'node:fs/promises';

// Default to the writable volume location used in production containers
// Use Railway volume mount path if available, otherwise default to /data/images
const railwayMountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
const defaultImageStore = railwayMountPath 
	? path.join(railwayMountPath, 'images')
	: '/data/images';
const IMAGE_STORE = path
	.resolve(process.env.IMAGE_STORE || process.env.VITE_IMAGE_STORE || defaultImageStore)
	.replace(/\/$/, '');
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
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file || typeof file === 'string') {
			return json({ error: 'File is required' }, { status: 400 });
		}

		// Basic validation
		if (!file.type.startsWith('image/')) {
			return json({ error: 'Only image uploads are allowed' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const sanitizedName = file.name
			.toLowerCase()
			.replace(/[^a-z0-9_.-]+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '') || 'image';

		const ext = path.extname(sanitizedName) || '.jpg';
		const base = path.basename(sanitizedName, ext);
		let finalName = `${base}${ext}`;
		let counter = 1;

		await ensureDir(IMAGE_STORE);

		while (true) {
			try {
				const targetPath = path.join(IMAGE_STORE, finalName);
				await fs.writeFile(targetPath, buffer, { flag: 'wx' });
				break;
			} catch (err) {
				if (err.code === 'EEXIST') {
					finalName = `${base}-${counter}${ext}`;
					counter += 1;
					continue;
				}
				throw err;
			}
		}

		const images = await listImages();
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

