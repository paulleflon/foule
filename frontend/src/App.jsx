import axios from 'axios';
import React, {createRef, useCallback, useEffect, useState} from 'react';
import {MdAdd, MdOutlineNoPhotography} from 'react-icons/md';
import {VscDebugDisconnect} from 'react-icons/vsc';
import Gallery from './components/Gallery';
import EntryEditor from './components/EntryEditor';
import MediaViewer from './components/MediaViewer';
import MenuBar from './components/MenuBar';

function App() {
	// Array of all categories
	const [categories, setCategories] = useState();
	// Currently selected category
	const [selectedCategory, setSelectedCategory] = useState();
	// Whether the app is loading
	const [isLoading, setIsLoading] = useState(true);
	// Whether loading failed
	const [isFailing, setIsFailing] = useState(false);
	// Whether the user is typing
	const [isTyping, setIsTyping] = useState(false);
	// Object of all image arrays, keyed by category
	const [entries, setImages] = useState({});
	// Whether the user is currently adding an image
	const [isAdding, setIsAdding] = useState(false);
	// Whether the user is currently editing an image
	const [isEditing, setIsEditing] = useState(undefined);
	// The tags to filter in the gallery
	const [filter, setFilter] = useState({});
	// Whether the filter tags have to be applied by union or intersection (false is intersection)
	const [filterUnion, setFilterUnion] = useState(false);
	// The index of the image currently being viewed in the selected category
	const [viewing, setViewing] = useState(undefined);
	// Ref to the image gallery container
	const galleryRef = createRef();
	let filtered, // Filtered images array
		entriesCount, // Total number of displayed entries (image and video)
		imagesCount, // Number of images in the selected category
		videosCount; // Number of videos in the selected category
	if (!isLoading) { // These are only used if the app is loaded
		filtered = entries[selectedCategory]?.filter(img => {
			if (filter[selectedCategory].length === 0) return true;
			const imgTags = img.tags.map(t => t.toLowerCase());
			if (filterUnion) {
				return filter[selectedCategory].some(f => imgTags.includes(f.toLowerCase()));
			} else {
				return filter[selectedCategory].every(f => imgTags.includes(f.toLowerCase()));
			}
		});
		entriesCount = filtered?.length || 0;
		imagesCount = filtered?.filter(img => img.type === 'image').length;
		videosCount = filtered?.filter(img => img.type === 'video').length;
	}

	// Loads categories, selects a category (from localStorage or the first one) and loads images from it.
	async function initialFetch() {
		setIsLoading(true);
		let res;
		try {
			res = await axios.get(`${process.env.REACT_APP_API}/categories/get`, {
				'headers': {
					'Authorization': process.env.REACT_APP_API_KEY
				},
				timeout: 5000
			});
		} catch (_) {
			setIsFailing(true);
			setIsLoading(false);
			return;
		}
		setCategories(res.data);
		const savedSelection = localStorage.getItem('selectedCategory');
		const selection = res.data.includes(savedSelection) ? savedSelection : res.data[0];
		setSelectedCategory(selection);

		res = await axios.get(`${process.env.REACT_APP_API}/images/get/${selection}`, {
			'headers': {
				'Authorization': process.env.REACT_APP_API_KEY
			}
		});
		const obj = {};
		obj[selection] = res.data;
		setFilter(f => ({...f, [selection]: []}));
		setImages(obj);
		setIsLoading(false);
		setIsFailing(false);
	}

	// Startup effect
	useEffect(() => {
		initialFetch();
	}, []);

	// Selects a category, or creates it if it doesn't exist
	const selectCategory = async (name) => {
		if (!categories.includes(name)) {
			await axios.post(`${process.env.REACT_APP_API}/categories/add`, {name}, {
				'headers': {
					'Authorization': process.env.REACT_APP_API_KEY
				}
			});
			setCategories([...categories, name]);
		}
		const res = await axios.get(`${process.env.REACT_APP_API}/images/get/${name}`, {
			'headers': {
				'Authorization': process.env.REACT_APP_API_KEY
			}
		});
		const obj = entries;
		obj[name] = res.data;
		setImages(obj);
		if (!filter[name]) {
			filter[name] = [];
			setFilter(filter);
		}
		setSelectedCategory(name);
		localStorage.setItem('selectedCategory', name);
	};

	// Deletes a category
	const deleteCategory = async (name) => {
		await axios.post(`${process.env.REACT_APP_API}/categories/delete`, {name}, {
			'headers': {
				'Authorization': process.env.REACT_APP_API_KEY
			}
		});
		setCategories(categories.filter(c => c !== name));
	};

	// Adds to the app's state images that have been sent to the server
	const addImportedImages = (added, category) => {
		const obj = {...entries};
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
			const obj = {...entries};
			obj[selectedCategory] = obj[selectedCategory].sort(() => Math.random() - 0.5);
			setImages(obj);
			gallery.style.opacity = 1;
		}, 250);
	}, [galleryRef, entries, selectedCategory]);

	// Views the previous entry.
	const previousImage = useCallback(() => {
		const i = viewing;
		if (i - 1 < 0)
			setViewing(entriesCount - 1);
		else
			setViewing(i - 1);
	}, [viewing, entriesCount]);

	// Views the next entry.
	const nextImage = useCallback(() => {
		const i = viewing;
		if (i + 1 >= entriesCount)
			setViewing(0);
		else
			setViewing(i + 1);
	}, [viewing, entriesCount]);

	// Event handler for keypresses
	// Handles shuffling images and viewing previous/next images
	const handleUserKeyPress = useCallback(e => {
		switch (e.key) {
			case 'ArrowLeft':
				if (viewing !== undefined) previousImage();
				break;
			case 'ArrowRight':
				if (viewing !== undefined) nextImage();
				break;
			case 's':
				if (!isTyping && !isAdding && !isEditing && viewing === undefined) shuffleImages();
				break;
			case 'a':
				if (!isTyping && !isAdding && !isEditing && viewing === undefined) setIsAdding(true);
				break;
			case 'u':
				if (!isTyping && !isAdding && !isEditing && viewing === undefined) setFilterUnion(f => !f);
				break;
			case 'Escape':
				setViewing(undefined);
				setIsAdding(false);
				setIsEditing(false);
				break;
			default:
				break;
		}
	}, [shuffleImages, previousImage, nextImage, viewing, isAdding, isEditing, isTyping]);

	// Renames a category and update the images object.
	const renameCategory = async (oldName, newName) => {
		await axios.post(`${process.env.REACT_APP_API}/categories/rename`, {oldName, newName}, {
			'headers': {
				'Authorization': process.env.REACT_APP_API_KEY
			}
		});
		setCategories(categories.map(c => c === oldName ? newName : c));
		const obj = {...entries};
		if (obj[oldName]) {
			obj[oldName] = obj[oldName].map(i => ({...i, category: newName}));
			obj[newName] = obj[oldName];
			delete obj[oldName];
			setImages(obj);
		}
	};

	// Edits an entry, both in the images object and in the server
	const editImage = async (tags, category) => {
		const obj = {...entries};
		obj[selectedCategory] = obj[selectedCategory].map(i => i.id === isEditing ? {...i, tags} : i);
		if (category) {
			const entry = obj[selectedCategory].find(i => i.id === isEditing);
			obj[selectedCategory] = obj[selectedCategory].filter(i => i.id !== isEditing);
			obj[category] = [...(obj[category] || []), entry];
		}
		await axios.post(`${process.env.REACT_APP_API}/images/edit/${isEditing}`, {tags, category: category || selectedCategory}, {
			'headers': {
				'Authorization': process.env.REACT_APP_API_KEY
			}
		});
		setImages(obj);
		setIsEditing(undefined);
	};

	// Deletes an entry, both in the images object and in the server
	const deleteImage = async () => {
		const obj = {...entries};
		obj[selectedCategory] = obj[selectedCategory].filter(i => i.id !== isEditing);
		await axios.post(`${process.env.REACT_APP_API}/images/delete/${isEditing}`, {}, {
			'headers': {
				'Authorization': process.env.REACT_APP_API_KEY
			}
		});
		setImages(obj);
		setIsEditing(undefined);
	};

	// Updates the filter tags
	const updateFilter = (tags) => {
		const obj = {...filter};
		obj[selectedCategory] = tags;
		setFilter(obj);
	};

	// Binds the event listener for keypresses
	useEffect(() => {
		window.addEventListener('keydown', handleUserKeyPress);
		return () => {
			window.removeEventListener('keydown', handleUserKeyPress);
		};
	}, [handleUserKeyPress]);
	if (isFailing) {
		return (
			<div className='App w-full h-full flex flex-col items-center justify-center'>
				<div className='bg-black bg-opacity-50 rounded-full flex justify-center items-center w-32 h-32'>
					<VscDebugDisconnect size={64} color='#aaaaaa'></VscDebugDisconnect>
				</div>
				<div className='text-white font-title text-4xl'>{isLoading ? 'Retrying to connect...' : 'Couldn\'t connect to the database.'}</div>

				<button
					disabled={isLoading}
					onClick={() => !isLoading && initialFetch()}
					className='border border-white text-white px-6 py-2 text-lg font-default rounded-sm hover:bg-white hover:bg-opacity-25 duration-100'>
					{isLoading ?
						<div className='loader w-6 h-6'></div>
						:
						'Retry'
					}
				</button>
			</div>
		);
	}
	if (isLoading) {
		return (
			<div className='App bg-gray-800 w-full h-full flex items-center justify-center'>
				<div className='text-white font-title text-4xl'>Loading...</div>
			</div>
		);
	}
	return (
		<div className='App bg-gray-800 w-full h-full flex flex-col'>
			{viewing !== undefined &&
				<MediaViewer
					{...filtered[viewing]}
					close={() => setViewing(undefined)}
					next={nextImage}
					previous={previousImage}
				/>
			}
			{isAdding ?
				<EntryEditor
					categories={categories}
					close={() => setIsAdding(false)}
					addImportedImages={addImportedImages}
					selected={selectedCategory}>
				</EntryEditor>
				: ''
			}
			{isEditing ?
				<EntryEditor
					categories={categories}
					close={() => setIsEditing(undefined)}
					editing={entries[selectedCategory]?.find(img => img.id === isEditing)}
					edit={editImage}
					delete={deleteImage}
					selected={selectedCategory}>
				</EntryEditor>
				: ''
			}
			<div className='relative overflow-auto'>
				<MenuBar
					categories={categories}
					deleteCategory={deleteCategory}
					filter={filter}
					filterUnion={filterUnion}
					renameCategory={renameCategory}
					selectCategory={selectCategory}
					selectedCategory={selectedCategory}
					setFilterUnion={setFilterUnion}
					setIsTyping={setIsTyping}
					shuffleImages={shuffleImages}
					updateFilter={updateFilter}
				/>
				{entriesCount ?
					(
						<Gallery
							entries={entries}
							entriesCount={entriesCount}
							filtered={filtered}
							galleryRef={galleryRef}
							imagesCount={imagesCount}
							selectedCategory={selectedCategory}
							setIsEditing={setIsEditing}
							setViewing={setViewing}
							videosCount={videosCount}
						/>
					)
					:
					<div className='flex justify-center items-center h-full flex-col'> {/* 'No Images' indicator */}
						<div className='bg-black bg-opacity-50 rounded-full flex justify-center items-center w-32 h-32'>
							<MdOutlineNoPhotography size={48} color='#aaaaaa'></MdOutlineNoPhotography>
						</div>
						<div className='text-gray-400 font-title text-4xl my-4'>No images</div>
					</div>
				}
			</div>
			<div
				className='fixed bottom-0 right-0 m-5 bg-gray-700 shadow-lg rounded-full cursor-pointer p-2 z-40'
				onClick={() => setIsAdding(true)}
			>
				<MdAdd color='#ffffff' size={38}></MdAdd>
			</div>
		</div>
	);
}

export default App;