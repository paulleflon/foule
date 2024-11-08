import { db } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function GET() {
	const categories = db
		.prepare('SELECT name FROM CATEGORIES')
		.all()
		.map((row) => row.name);
	return json({ ok: true, categories });
}
