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

app.get('/categories', (req, res) => {
	const arr = db.getCategories();
	res.send(arr);
});

app.listen(8080, () => console.log('Listening'));