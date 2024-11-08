import { db } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import sharp from 'sharp';

export async function GET({ params }) {
	const { id } = params;
	const image = db.prepare('SELECT * FROM IMAGES WHERE id = ?').get(id);
	if (!image) return new Response(null, { status: 404 });
	if (image.type === 'video') return redirect(302, image.url);

	let response = await fetch(image.url);
	if (response.status !== 200) return redirect(302, image.url);
	try {
		const data = await sharp(await response.arrayBuffer())
			.resize(400, 400)
			.toBuffer();
		return new Response(data, { headers: { 'Content-Type': 'image/jpeg' } });
	} catch (_) {
		redirect(302, image.url);
	}
}
