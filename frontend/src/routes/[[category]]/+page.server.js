import { db } from '$lib/db.js';
import { error, redirect } from '@sveltejs/kit';

export function load({ params, cookies }) {
	const { category: paramCategory } = params;
	const savedCategory = cookies.get('selected_category');
	const categories = db
		.prepare('SELECT name FROM CATEGORIES')
		.all()
		.map((c) => c.name);

	if (!paramCategory) {
		if (!savedCategory || !categories.includes(savedCategory))
			return redirect(307, `/${categories[0]}`);
		else return redirect(307, `/${savedCategory}`);
	}

	if (!categories.includes(paramCategory))
		return error(404, {
			message: 'Category not found.',
			categories
		});

	const q = db.prepare('SELECT * FROM IMAGES WHERE category = $category');
	const images = q
		.all({ category: paramCategory })
		.map((e) => ({ ...e, tags: e.tags === '' ? [] : e.tags.split(',') }));

	cookies.set('last_category', paramCategory, { path: '/' });
	return {
		selectedCategory: paramCategory,
		categories,
		images
	};
}
