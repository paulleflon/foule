import { db } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { name } = await request.json();
	try {
		db.prepare('INSERT INTO CATEGORIES VALUES (?)').run(name);
		return json({ ok: true });
	} catch (err) {
		// Crashes if the category already exists (Primary key)
		return json({ message: 'Category already exists', ok: false }, { status: 409 });
	}
}
