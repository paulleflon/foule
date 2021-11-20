const db = require('better-sqlite3')(process.env.DB_FILE);

module.exports.init = function() {
	const createImages = db.prepare(
		'CREATE TABLE IF NOT EXISTS IMAGES ('
		+ 'id TEXT PRIMARY KEY NOT NULL,'
		+ 'url TEXT NOT NULL,'
		+ 'type TEXT NOT NULL,'
		+ 'width INTEGER NOT NULL,'
		+ 'height INTEGER NOT NULL,'
		+ 'category TEXT NOT NULL,'
		+ 'tags TEXT'
		+ ')'
	);
	const createCategories = db.prepare('CREATE TABLE IF NOT EXISTS CATEGORIES ('
		+ 'name TEXT PRIMARY KEY NOT NULL'
		+ ')'
	);
	const fillDefaultCateory = db.prepare('INSERT INTO CATEGORIES VALUES (\'Default\')');
	createImages.run();
	createCategories.run();
	try {
		// Throws an eror if this category already exists.
		fillDefaultCateory.run();
	} catch (err) {
		// Never gonna give you up
	}
};

module.exports.addImages = function(images) {
	const added = [];
	for (const img of images) {
		(function insert() {
			const id = generateId();
			const query = db.prepare('INSERT INTO IMAGES VALUES ($id, $url, $type, $width, $height, $category, $tags)');
			try {
				const entry = {
					id,
					url: img.url,
					type: img.type,
					width: img.width,
					height: img.height,
					category: img.category,
					tags: img.tags.join(',')
				};
				query.run(entry);
				added.push(entry);
			} catch (err) {
				// If the generated id already exists, we try again with another id until it works.
				if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
					insert();
				else
					return err;
			}
		})();
	}
	return added;
};

module.exports.getImages = function(category, tags = []) {
	const q = db.prepare('SELECT * FROM IMAGES WHERE category = $category');
	const images = q.all({category}).map(e => ({...e, tags: e.tags.split(',')}));
	return images.filter(img => {
		for (const tag of tags) {
			if (!img.tags.includes(tag))
				return false;
		}
		return true;
	});
};

module.exports.getCategories = function() {
	const q = db.prepare('SELECT name FROM CATEGORIES');
	return q.all().map(row => row.name);
};

module.exports.addCategory = function(name) {
	if (module.exports.getCategories().includes(name))
		return false;
	db.prepare('INSERT INTO CATEGORIES VALUES ($name)').run({name});
};

module.exports.deleteCategory = function(name) {
	if (!module.exports.getCategories().includes(name))
		return false;
	db.prepare('DELETE FROM CATEGORIES WHERE name=$name').run({name});
};

module.exports.renameCategory = function(oldName, newName) {
	if (!module.exports.getCategories().includes(oldName))
		return false;
	db.prepare('UPDATE CATEGORIES SET name = $newName WHERE name = $oldName').run({oldName, newName});
};

function generateId() {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-';
	let id = '';
	for (let i = 0;i < 11;i++) {
		const n = Math.floor(Math.random() * chars.length);
		id += chars[n];
	}
	return id;
}