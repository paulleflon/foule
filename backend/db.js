const db = require('better-sqlite3')(process.env.DB_FILE);
const bcrypt = require('bcrypt');

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
	const createPassword = db.prepare('CREATE TABLE IF NOT EXISTS PASSWORD (password TEXT PRIMARY KEY NOT NULL)');
	createImages.run();
	createCategories.run();
	createPassword.run();
	const fillDefaultCateory = db.prepare('INSERT INTO CATEGORIES VALUES (\'Default\')');
	try {
		// Throws an eror if this category already exists.
		fillDefaultCateory.run();
	} catch (err) {
		// Never gonna give you up
	}
};

/* 
	Password protection is done with a single password stored in the database.
	It is automatically enabled if a password is stored.
	Otherwise, it is disabled.
	Run these functions manually to enable/disable password protection.
*/

function disablePassword() {
	const deletePasswords = db.prepare('DELETE FROM PASSWORD');
	deletePasswords.run();
}
function enablePassword(password) {
	disablePassword();
	const encrypted = bcrypt.hashSync(password, 10);
	const insertPassword = db.prepare('INSERT INTO PASSWORD VALUES ($password)');
	insertPassword.run({password: encrypted});
}

enablePassword('Petaouchnok13');

module.exports.getPassword = function() {
	const getPassword = db.prepare('SELECT password FROM PASSWORD');
	const password = getPassword.get();
	return password?.password;
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
					tags: img.tags
				};
				query.run({...entry, tags: entry.tags.join(',')});
				added.push(entry);
			} catch (err) {
				console.log(err);
				// If the generated id already exists, we try again with another id until it works.
				if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
					insert();
				else
					return err;
			}
		})();
	}
	console.log(`Added ${added.length} images to the database.`);
	return added;
};

module.exports.getImages = function(category) {
	const q = db.prepare('SELECT * FROM IMAGES WHERE category = $category');
	const images = q.all({category}).map(e => ({...e, tags: e.tags === '' ? [] : e.tags.split(',')}));
	return images;
};

module.exports.getImage = function(id) {
	const q = db.prepare('SELECT * FROM IMAGES WHERE id = $id');
	const image = q.get({id});
	if (image)
		return {...image, tags: image.tags.split(',')};
	else
		return null;
};

module.exports.editImage = function(id, tags, category) {
	const q = db.prepare('UPDATE IMAGES SET category = $category, tags = $tags WHERE id = $id');
	q.run({id, category, tags: tags.join(',')});
	console.log(`Edited image ${id}.`);
};

module.exports.deleteImage = function(id) {
	const q = db.prepare('DELETE FROM IMAGES WHERE id = $id');
	q.run({id});
	console.log(`Deleted image ${id}.`);
};

module.exports.getCategories = function() {
	const q = db.prepare('SELECT name FROM CATEGORIES');
	return q.all().map(row => row.name);
};

module.exports.addCategory = function(name) {
	if (module.exports.getCategories().includes(name))
		return false;
	db.prepare('INSERT INTO CATEGORIES VALUES ($name)').run({name});
	console.log(`Added category ${name} to the database.`);
};

module.exports.deleteCategory = function(name) {
	if (!module.exports.getCategories().includes(name))
		return false;
	db.prepare('DELETE FROM CATEGORIES WHERE name=$name').run({name});
	console.log(`Deleted category ${name} from the database.`);
};

module.exports.renameCategory = function(oldName, newName) {
	if (!module.exports.getCategories().includes(oldName))
		return false;
	db.prepare('UPDATE CATEGORIES SET name = $newName WHERE name = $oldName').run({oldName, newName});
	db.prepare('UPDATE IMAGES SET category = $newName WHERE category = $oldName').run({oldName, newName});
	console.log(`Renamed category ${oldName} to ${newName}.`);
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