require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
const sharp = require('sharp');
const fetch = require('node-fetch');
const cp = require('child_process');
const {mkdirSync, readFileSync, existsSync, unlinkSync} = require('fs');

app.use(cors({
	origin: '*'
}));
app.use(express.json());


const password = db.getPassword();


app.get('/password', (req, res) => {
	res.send(password !== undefined);
});


if (password) {
	app.use(require('./auth')(password));
	console.log('Auth enabled.');
}


app.get('/download/:id', async (req, res) => {
	const {id} = req.params;
	const {url, type} = await db.getImage(id);
	if (type === 'image') {
		const data = await fetch(url);
		let buffer = await data.buffer();
		const image = await sharp(buffer).toBuffer();
		res.set('Content-Type', 'image/jpeg');
		res.send(image);
	} else {
		const data = await fetch(url);
		const buffer = await data.buffer();
		res.set('Content-Type', 'video/mp4');
		res.send(buffer);
	}
});

app.get('/posters/:id', async (req, res) => {
	const id = req.params.id;
	const data = db.getImage(id);
	if (!data) {
		return res.status(404).send('Not found');
	}
	if (data.type === 'image') {
		let img = await fetch(data.url);
		if (img.status !== 200)
			return res.redirect(data.url);
		try {
			const data = await sharp(await img.buffer())
				.resize(400, 400)
				.toBuffer();
			res.set('Content-Type', 'image/jpeg');
			res.send(data);
		} catch (_) {
			res.redirect(data.url);
		}
	} else {
		cp.exec(`ffmpeg -i "${data.url}" -y -vf scale=-2:720 -vframes 1 "temp/${id}.jpg"`, async (err, stdout, stderr) => {
			try {
				let img = readFileSync(`temp/${id}.jpg`);
				const data = await sharp(img)
					.resize(400, 400)
					.toBuffer();
				res.set('Content-Type', 'image/jpeg');
				res.send(data);
				res.sent = true;
				unlinkSync(`temp/${id}.jpg`);
			} catch (_) {
				console.log('ERR:', _);
				console.log('ERR:', res.sent);
				if (!res.sent) {
					res.removeHeader('Content-Type');
					res.redirect(data.url); //temp
				}
			}
		});

	}
});

app.post('/images/add', (req, res) => {
	const insert = req.body.images.map(entry => {return {...entry, category: req.body.category, tags: req.body.tags};});
	const result = db.addImages(insert);
	res.status(result.length ? 200 : 500).send(result);
});

app.get('/images/get/:category', (req, res) => {
	const result = db.getImages(req.params.category);
	res.send(result);
});

app.post('/images/edit/:id', (req, res) => {
	db.editImage(req.params.id, req.body.tags, req.body.category);
	res.status(200).send();
});

app.post('/images/delete/:id', (req, res) => {
	db.deleteImage(req.params.id);
	res.status(200).send();
});

app.get('/categories/get', (req, res) => {
	const arr = db.getCategories();
	res.send(arr);
});

app.post('/categories/add', (req, res) => {
	db.addCategory(req.body.name);
	res.sendStatus(200);
});

app.post('/categories/delete', (req, res) => {
	db.deleteCategory(req.body.name);
	res.sendStatus(200);
});

app.post('/categories/rename', (req, res) => {
	db.renameCategory(req.body.oldName, req.body.newName);
	res.sendStatus(200);
});

if (!existsSync('temp')) {
	mkdirSync('temp');
}

app.listen(process.env.PORT || 8080, () => {
	console.log(`Server started on port ${process.env.PORT || 8080}`);
});