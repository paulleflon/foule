import { db } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { name } = await request.json();
	const info = db.prepare('DELETE FROM CATEGORIES WHERE name = ?').run(name);
	if (info.changes === 0)
		return json({ ok: false, message: 'Category does not exist.' }, { status: 404 });
	else return json({ ok: true });
}
