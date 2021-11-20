require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');

app.use(cors({
	origin: '*'
}));
app.use(express.json());

app.post('/images/add', (req, res) => {
	const insert = req.body.images.map(entry => {return {...entry, category: req.body.category, tags: req.body.tags};});
	const result = db.addImages(insert);
	res.status(result ? 500 : 200).send(result ? {error: result} : {success: true});
});

app.get('/images/get/:category', (req, res) => {
	const result = db.getImages(req.params.category, req.body.tags);
	res.send(result);
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

app.listen(8080, () => console.log('Listening'));