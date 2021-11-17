import axios from 'axios';
import React, {useEffect, useState} from 'react';
import CategorySelect from './components/CategorySelect';
function App() {
	const [categories, setCategories] = useState();
	const [selected, setSelected] = useState();
	const [isLoading, setLoading] = useState(true);
	useEffect(async () => {
		const res = await axios.get(`${process.env.REACT_APP_API}/categories/get`);
		setCategories(res.data);
		setSelected(res.data[0]);
		setLoading(false);
	}, []);

	const select = async (name) => {
		// TODO: Database insertion
		if (!categories.includes(name)) {
			await axios.post(`${process.env.REACT_APP_API}/categories/add`, {name});
			setCategories([...categories, name]);
		}
		setSelected(name);
	};
	const del = async (name) => {
		// TODO: Database insertion / Optimization
		await axios.post(`${process.env.REACT_APP_API}/categories/delete`, {name});
		setCategories(categories.filter(c => c !== name));
	};

	return (
		<div className='App bg-gray-800 w-full h-full'>
			{isLoading ? <div>Loading...</div> : <CategorySelect categories={categories} selected={selected} select={select} delete={del}></CategorySelect>}
		</div>
	);
}

export default App;