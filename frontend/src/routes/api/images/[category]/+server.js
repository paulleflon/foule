import { json } from '@sveltejs/kit';
import { db } from '$lib/db';

export function GET({ params }) {
	const { category } = params;
	const q = db.prepare('SELECT * FROM IMAGES WHERE category = $category');
	const images = q
		.all({ category })
		.map((e) => ({ ...e, tags: e.tags === '' ? [] : e.tags.split(',') }));
	return json({ ok: true, images });
}
