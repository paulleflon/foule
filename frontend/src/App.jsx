import axios from 'axios';
import React, {useEffect, useState, useCallback, createRef} from 'react';
import {MdOutlineNoPhotography, MdAdd} from 'react-icons/md';
import {TiArrowShuffle} from 'react-icons/ti';
import CategorySelect from './components/CategorySelect';
import ImageAdder from './components/ImageAdder';
import ImageCard from './components/ImageCard';
import TagsEditor from './components/TagsEditor';

function App() {
	const [categories, setCategories] = useState();
	const [selected, setSelected] = useState();
	const [isLoading, setLoading] = useState(true);
	const [images, setImages] = useState({});
	const [isAdding, setIsAdding] = useState(false);
	const [editing, setEditing] = useState(undefined);
	const [filter, setFilter] = useState([]);
	const galleryRef = createRef();
	useEffect(() => {
		async function fetchData() {
			let res = await axios.get(`${process.env.REACT_APP_API}/categories/get`);
			setCategories(res.data);
			const savedSelection = localStorage.getItem('selectedCategory');
			const selection = res.data.includes(savedSelection) ? savedSelection : res.data[0];
			setSelected(selection);

			res = await axios.get(`${process.env.REACT_APP_API}/images/get/${selection}`);
			const obj = {};
			obj[selection] = res.data;
			setImages(obj);
			setLoading(false);
		}
		fetchData();
	}, []);
	const select = async (name) => {
		if (!categories.includes(name)) {
			await axios.post(`${process.env.REACT_APP_API}/categories/add`, {name});
			setCategories([...categories, name]);
		}
		const res = await axios.get(`${process.env.REACT_APP_API}/images/get/${name}`);
		const obj = images;
		obj[name] = res.data;
		setImages(obj);
		setSelected(name);
		localStorage.setItem('selectedCategory', name);
	};
	const del = async (name) => {
		await axios.post(`${process.env.REACT_APP_API}/categories/delete`, {name});
		setCategories(categories.filter(c => c !== name));
	};

	const addImportedImages = (added, category) => {
		const obj = {...images};
		obj[category] = [...(obj[category] || []), ...added];
		setImages(obj);
		setIsAdding(false);
	};

	const shuffleImages = useCallback(() => {
		const gallery = galleryRef.current;
		if (!gallery) return;
		gallery.style.opacity = 0;
		setTimeout(() => {
			const obj = {...images};
			obj[selected] = obj[selected].sort(() => Math.random() - 0.5);
			setImages(obj);
			gallery.style.opacity = 1;
		}, 250);
	}, [galleryRef, images, selected]);

	const handleUserKeyPress = useCallback(e => {
		if (e.key === 's')
			shuffleImages();
	}, [shuffleImages]);

	const renameCategory = async (oldName, newName) => {
		await axios.post(`${process.env.REACT_APP_API}/categories/rename`, {oldName, newName});
		setCategories(categories.map(c => c === oldName ? newName : c));
		const obj = {...images};
		if (obj[oldName]) {
			obj[oldName] = obj[oldName].map(i => ({...i, category: newName}));
			obj[newName] = obj[oldName];
			delete obj[oldName];
			setImages(obj);
		}
	};

	const editImage = async (tags, category) => {
		const obj = {...images};
		obj[selected] = obj[selected].map(i => i.id === editing ? {...i, tags} : i);
		if (category) {
			const entry = obj[selected].find(i => i.id === editing);
			obj[selected] = obj[selected].filter(i => i.id !== editing);
			obj[category] = [...(obj[category] || []), entry];
		}
		await axios.post(`${process.env.REACT_APP_API}/images/edit/${editing}`, {tags, category: category || selected});
		setImages(obj);
		setEditing(undefined);
	};

	const deleteImage = async () => {
		const obj = {...images};
		obj[selected] = obj[selected].filter(i => i.id !== editing);
		await axios.post(`${process.env.REACT_APP_API}/images/delete/${editing}`);
		setImages(obj);
		setEditing(undefined);
	};

	useEffect(() => {
		window.addEventListener('keydown', handleUserKeyPress);
		return () => {
			window.removeEventListener('keydown', handleUserKeyPress);
		};
	}, [handleUserKeyPress]);

	if (isLoading) {
		return (
			<div className='App bg-gray-800 w-full h-full flex items-center justify-center'>
				<div className='text-white font-title text-4xl'>Loading...</div>
			</div>
		);
	} else {
		const filtered = images[selected]?.filter(img => {
			for (const tag of filter) {
				if (!img.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())) return false;
			}
			return true;
		});
		const total = filtered?.length || 0;
		const imagesCount = filtered?.filter(img => img.type === 'image').length;
		const videosCount = filtered?.filter(img => img.type === 'video').length;
		return (
			<div className='App bg-gray-800 w-full h-full flex flex-col'>
				{isAdding ?
					<ImageAdder
						categories={categories}
						close={() => setIsAdding(false)}
						addImportedImages={addImportedImages}
						selected={selected}>
					</ImageAdder> : ''}
				{editing ?
					<ImageAdder
						categories={categories}
						close={() => setEditing(undefined)}
						editing={images[selected]?.find(img => img.id === editing)}
						edit={editImage}
						delete={deleteImage}
						selected={selected}>
					</ImageAdder>
					: ''
				}
				<div className='w-full bg-gray-900 py-4 px-4 flex flex-row items-center justify-end md:justify-between shadow-sm'>
					<div className='font-title text-white text-4xl md:block hidden'>Foule</div>
					<div className='flex flex-row items-center'>
						<TagsEditor tags={filter} updateTags={setFilter} inMenu={true}></TagsEditor>
						<TiArrowShuffle
							title='Shuffle images'
							color='#ffffff'
							size={45}
							className='mx-4 cursor-pointer rounded-full hover:bg-white hover:bg-opacity-25 p-2'
							onClick={shuffleImages}
						>
						</TiArrowShuffle>
						<CategorySelect
							categories={categories}
							selected={selected}
							select={select}
							rename={renameCategory}
							delete={del}></CategorySelect>
					</div>
				</div>
				{total ?
					(
						<div className='relative overflow-y-auto'>
							<div
								className='images-grid flex sm:flex-wrap px-4 pt-2 transition-opacity duration-200 justify-center md:justify-between flex-col sm:flex-row items-center sm:items-start'
								style={{flexFlow: 'wrap'}}
								ref={galleryRef}
							>
								{filtered.map(image => (<ImageCard {...image} key={image.id} edit={() => setEditing(image.id)}></ImageCard>))}
							</div>
							<div className='font-default text-gray-100 text-lg text-center my-4'>
								<span className='font-bold'>{imagesCount}</span> image{imagesCount === 1 ? '' : 's'},
								<span className='font-bold'> {videosCount}</span> video{videosCount === 1 ? '' : 's'}
								{
									total !== images[selected].length ?
										<div className='text-sm text-italic'> <span className='font-bold'>{images[selected].length}</span> total entries in <span className='font-bold'>{selected}</span></div>
										: ''
								}
							</div>
						</div>
					)
					:
					<div className='flex justify-center items-center h-full flex-col'>
						<div className='bg-black bg-opacity-50 rounded-full flex justify-center items-center w-32 h-32'>
							<MdOutlineNoPhotography size={48} color='#aaaaaa'></MdOutlineNoPhotography>
						</div>
						<div className='text-gray-400 font-title text-4xl my-4'>No images</div>
					</div>
				}
				<div
					className='fixed bottom-0 right-0 m-5 bg-gray-700 shadow-lg rounded-full cursor-pointer p-2 z-50'
					onClick={() => setIsAdding(true)}
				>
					<MdAdd color='#ffffff' size={38}></MdAdd>
				</div>
			</div>
		);
	}
}

export default App;