import axios from 'axios';
import React, {useEffect, useState} from 'react';
import CategorySelect from './components/CategorySelect';
function App() {
	const [categories, setCategories] = useState();
	const [selected, setSelected] = useState();
	const [isLoading, setLoading] = useState(true);
	useEffect(async () => {
		const res = await axios.get(`${process.env.REACT_APP_API}/categories`);
		setCategories(res.data);
		setSelected(res.data[0]);
		setLoading(false);
	}, []);

	const select = (name) => {
		// TODO: Database insertion
		if (!categories.includes(name))
			setCategories([...categories, name]);
		setSelected(name);
	};
	const del = (name) => {
		// TODO: Database insertion / Optimization
		setCategories(categories.filter(c => c !== name));
	};

	return (
		<div className='App bg-gray-800 w-full h-full'>
			{isLoading ? <div>Loading...</div> : <CategorySelect categories={categories} selected={selected} select={select} delete={del}></CategorySelect>}
		</div>
	);
}

export default App;