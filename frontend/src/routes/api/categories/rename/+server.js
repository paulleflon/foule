import { db } from '$lib/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { name, newName } = await request.json();
	try {
		const info = db
			.prepare('UPDATE CATEGORIES SET name = @newName WHERE name = @name')
			.run({ name, newName });
		if (info.changes === 0) return json({ ok: false, message: 'Category does not exist.' });
		else return json({ ok: true });
	} catch (err) {
		return json({ ok: false, message: `Category '${newName}' already exists.` });
	}
}
