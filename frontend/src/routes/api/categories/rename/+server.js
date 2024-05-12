import { db } from '$lib/db';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { name, newName } = await request.json();
	try {
		const info = db
			.prepare('UPDATE CATEGORIES SET name = @newName WHERE name = @name')
			.run({ name, newName });
		if (info.changes === 0) return json({ ok: false, message: 'Category does not exist.' });
		db.prepare('UPDATE IMAGES SET category = @newName WHERE category = @name').run({
			name,
			newName
		});
		return json({ ok: true });
	} catch (err) {
		return json({ ok: false, message: `Category '${newName}' already exists.` });
	}
}
