import { DB_FILE } from '$env/static/private';
import sqlite from 'better-sqlite3';

export const db = sqlite(DB_FILE);

export function dbInit() {
	const createImages = db.prepare(
		'CREATE TABLE IF NOT EXISTS IMAGES (' +
			'id TEXT PRIMARY KEY NOT NULL,' +
			'url TEXT NOT NULL,' +
			'type TEXT NOT NULL,' +
			'width INTEGER NOT NULL,' +
			'height INTEGER NOT NULL,' +
			'category TEXT NOT NULL,' +
			'tags TEXT' +
			')'
	);
	const createCategories = db.prepare(
		'CREATE TABLE IF NOT EXISTS CATEGORIES (' + 'name TEXT PRIMARY KEY NOT NULL' + ')'
	);
	createImages.run();
	createCategories.run();
	const fillDefaultCategory = db.prepare("INSERT INTO CATEGORIES VALUES ('Default')");
	try {
		// Throws an error if this category already exists.
		fillDefaultCategory.run();
	} catch (err) {
		// We can safely ignore the error
	}
}
