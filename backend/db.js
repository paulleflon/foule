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
	for (const img of images) {
		(function insert() {
			const id = generateId();
			const query = db.prepare('INSERT INTO IMAGES VALUES ($id, $url, $type, $width, $height, $category, $tags)');
			try {
				const result = query.run({
					id,
					url: img.url,
					type: img.type,
					width: img.width,
					height: img.height,
					category: img.category,
					tags: img.tags.join(',')
				});
			} catch (err) {
				// If the generated id already exists, we try again with another id until it works.
				if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
					insert();
				else
					return err;
			}
		})();
	}
};

module.exports.getCategories = function() {
	const q = db.prepare('SELECT name FROM CATEGORIES');
	return q.all().map(row => row.name);
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