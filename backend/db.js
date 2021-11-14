const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_FILE);

db.on('error', console.log);


module.exports.init = function() {
	db.run
		('CREATE TABLE IF NOT EXISTS IMAGES ('
			+ 'id TEXT PRIMARY KEY NOT NULL,'
			+ 'url TEXT NOT NULL,'
			+ 'type TEXT NOT NULL,'
			+ 'width INTEGER NOT NULL,'
			+ 'height INTEGER NOT NULL,'
			+ 'category TEXT NOT NULL,'
			+ 'tags TEXT'
			+ ')'
		);
	db.run('CREATE TABLE IF NOT EXISTS CATEGORIES ('
		+ 'name TEXT PRIMARY KEY NOT NULL'
		+ ')'
	);
	db.run('INSERT INTO CATEGORIES VALUES ("Default")', _ => null); // This callback avoids error.
};

module.exports.addImages = function(images) {
	for (const img of images) {
		const id = generateId();
		db.run('INSERT INTO IMAGES VALUES ($id, $url, $type, $width, $height, $category, $tags)', {
			$id: id,
			$url: img.url,
			$type: img.type,
			$width: img.width,
			$height: img.height,
			$category: img.category,
			$tags: img.tags.join(','),
		});
	}
};

module.exports.getCategories = async function() {
	return new Promise((resolve, reject) => {
		db.all('SELECT name FROM CATEGORIES', (err, rows) => {
			if (err)
				return reject(err);
			resolve(rows.map(row => row.name));
		});
	});
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