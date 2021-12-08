import axios from 'axios';
import React, {useEffect, useState, useCallback, createRef} from 'react';
import {MdOutlineNoPhotography, MdAdd} from 'react-icons/md';
import JoinFull from './assets/join_full.png';
import JoinInner from './assets/join_inner.png';
import {TiArrowShuffle} from 'react-icons/ti';
import CategorySelect from './components/CategorySelect';
import ImageAdder from './components/ImageAdder';
import ImageCard from './components/ImageCard';
import TagsEditor from './components/TagsEditor';
import ImageViewer from './components/ImageViewer';

function App() {
	// Array of all categories
	const [categories, setCategories] = useState();
	// Currently selected category
	const [selected, setSelected] = useState();
	// Whether the app is loading
	const [isLoading, setLoading] = useState(true);
	// Object of all image arrays, keyed by category
	const [images, setImages] = useState({});
	// Whether the user is currently adding an image
	const [isAdding, setIsAdding] = useState(false);
	// Whether the user is currently editing an image
	const [editing, setEditing] = useState(undefined);
	// The tags to filter in the gallery
	const [filter, setFilter] = useState({});
	// Whether the filter tags have to be applied by union or intersection (false is intersection)
	const [filterUnion, setFilterUnion] = useState(false);
	// The index of the image currently being viewed in the selected category
	const [viewing, setViewing] = useState(undefined);
	// Ref to the image gallery container
	const galleryRef = createRef();
	let filtered, // Filtered images array
		total, // Total number of displayed entries (image and video)
		imagesCount, // Number of images in the selected category
		videosCount; // Number of videos in the selected category
	if (!isLoading) { // These are only used if the app is loaded
		filtered = images[selected]?.filter(img => {
			if (filter[selected].length === 0) return true;
			const imgTags = img.tags.map(t => t.toLowerCase());
			if (filterUnion) {
				return filter[selected].some(f => imgTags.includes(f.toLowerCase()));
			} else {
				return filter[selected].every(f => imgTags.includes(f.toLowerCase()));
			}
		});
		total = filtered?.length || 0;
		imagesCount = filtered?.filter(img => img.type === 'image').length;
		videosCount = filtered?.filter(img => img.type === 'video').length;
	}

	// Startup effect
	// Loads categories, selects a category (from localStorage or the first one) and loads images from it.
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
			setFilter(f => ({...f, [selection]: []}));
			setImages(obj);
			setLoading(false);
		}
		fetchData();
	}, []);

	// Selects a category, or creates it if it doesn't exist
	const select = async (name) => {
		if (!categories.includes(name)) {
			await axios.post(`${process.env.REACT_APP_API}/categories/add`, {name});
			setCategories([...categories, name]);
		}
		const res = await axios.get(`${process.env.REACT_APP_API}/images/get/${name}`);
		const obj = images;
		obj[name] = res.data;
		setImages(obj);
		if (!filter[name]) {
			filter[name] = [];
			setFilter(filter);
		}
		setSelected(name);
		localStorage.setItem('selectedCategory', name);
	};

	// Deletes a category
	const del = async (name) => {
		await axios.post(`${process.env.REACT_APP_API}/categories/delete`, {name});
		setCategories(categories.filter(c => c !== name));
	};

	// Adds to the app's state images that have been sent to the server
	const addImportedImages = (added, category) => {
		const obj = {...images};
		obj[category] = [...(obj[category] || []), ...added];
		setImages(obj);
		setIsAdding(false);
	};

	// Shuffles the images in the selected category
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

	// Views the previous entry.
	const previousImage = useCallback(() => {
		const i = viewing;
		if (i - 1 < 0)
			setViewing(total - 1);
		else
			setViewing(i - 1);
	});

	// Views the next entry.
	const nextImage = useCallback(() => {
		const i = viewing;
		if (i + 1 >= total)
			setViewing(0);
		else
			setViewing(i + 1);
	});

	// Event handler for keypresses
	// Handles shuffling images and viewing previous/next images
	const handleUserKeyPress = useCallback(e => {
		if (e.key === 's')
			shuffleImages();
		if (e.key === 'ArrowRight' && viewing !== undefined)
			nextImage();
		if (e.key === 'ArrowLeft' && viewing !== undefined)
			previousImage();
		if (e.key === 'Escape')
			setViewing(undefined);
	}, [shuffleImages, previousImage, nextImage, viewing]);

	// Renames a category and update the images object.
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

	// Edits an entry, both in the images object and in the server
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

	// Deletes an entry, both in the images object and in the server
	const deleteImage = async () => {
		const obj = {...images};
		obj[selected] = obj[selected].filter(i => i.id !== editing);
		await axios.post(`${process.env.REACT_APP_API}/images/delete/${editing}`);
		setImages(obj);
		setEditing(undefined);
	};

	// Updates the filter tags
	const updateFilter = (tags) => {
		const obj = {...filter};
		obj[selected] = tags;
		setFilter(obj);
	};

	// Binds the event listener for keypresses
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
		return (
			<div className='App bg-gray-800 w-full h-full flex flex-col'>
				{viewing !== undefined && <ImageViewer {...filtered[viewing]} previous={previousImage} next={nextImage} close={() => setViewing(undefined)} />}
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
				{/* MenuBar */}
				<div
					className='w-full md:w-11/12 bg-gray-900 py-4 px-4 md:mx-auto md:m-2 flex flex-row items-center justify-end md:justify-between shadow-xl md:rounded-2xl'
				>
					<div className='font-title text-white text-4xl md:block hidden'>Foule</div>
					<div className='flex flex-row items-center'>
						<TagsEditor tags={filter[selected]} updateTags={updateFilter} inMenu={true}></TagsEditor>
						<div
							className='ml-4 cursor-pointer rounded-full hover:bg-white hover:bg-opacity-25 p-2 transition duration-200'
							style={{width: '45px', height: '45px'}}
							onClick={() => setFilterUnion(!filterUnion)}
							title={filterUnion ? 'Union' : 'Intersection'}
						>
							<img src={filterUnion ? JoinFull : JoinInner} alt='' className='w-full h-full' />
						</div>
						<TiArrowShuffle
							title='Shuffle images'
							color='#ffffff'
							size={45}
							className='mx-4 cursor-pointer rounded-full hover:bg-white hover:bg-opacity-25 p-2 transition duration-200'
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
						<div className='relative overflow-y-auto'> {/* Image Gallery */}
							<div
								className='images-grid flex sm:flex-wrap px-4 pt-2 transition-opacity duration-200 justify-center md:justify-between flex-col sm:flex-row items-center sm:items-start'
								style={{flexFlow: 'wrap'}}
								ref={galleryRef}
							>
								{filtered.map((image, i) => (<ImageCard {...image} key={image.id} edit={() => setEditing(image.id)} onClick={() => setViewing(i)} ></ImageCard>))}
							</div>
							<div className='font-default text-gray-100 text-lg text-center my-4'> {/* Entries stats */}
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
					<div className='flex justify-center items-center h-full flex-col'> {/* 'No Images' indicator */}
						<div className='bg-black bg-opacity-50 rounded-full flex justify-center items-center w-32 h-32'>
							<MdOutlineNoPhotography size={48} color='#aaaaaa'></MdOutlineNoPhotography>
						</div>
						<div className='text-gray-400 font-title text-4xl my-4'>No images</div>
					</div>
				}
				<div
					className='fixed bottom-0 right-0 m-5 bg-gray-700 shadow-lg rounded-full cursor-pointer p-2 z-40'
					onClick={() => setIsAdding(true)}
				>
					<MdAdd color='#ffffff' size={38}></MdAdd>
				</div>
			</div>
		);
	}
};

export default App;