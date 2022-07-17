import React, { useCallback, useEffect, useState, useRef } from 'react';
import { MdAdd, MdOutlineNoPhotography } from 'react-icons/md';
import { VscDebugDisconnect } from 'react-icons/vsc';
import * as API from './api';
import Gallery from './components/Gallery';
import EntryEditor from './components/EntryEditor';
import MediaViewer from './components/MediaViewer';
import MenuBar from './components/MenuBar';
import Media from './typings/Media';

const App = () => {
	// Array of all categories
	const [categories, setCategories] = useState<string[]>([]);
	// Currently selected category
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	// Whether the app is loading
	const [isLoading, setIsLoading] = useState(true);
	// Whether loading failed
	const [isFailing, setIsFailing] = useState(false);
	// Whether the user is typing
	const [isTyping, setIsTyping] = useState(false);
	// Object of all image arrays, keyed by category
	const [media, setMedia] = useState<Record<string, Media[]>>({});
	// Whether the user is currently adding an image
	const [isAdding, setIsAdding] = useState(false);
	// The id of the media that is currently beding edited. `null` if the user is not editing any media. 
	const [isEditing, setIsEditing] = useState<string | null>(null);
	// The tags to filter in the gallery, for each category.
	const [filter, setFilter] = useState<Record<string, string[]>>({});
	// Whether the filter tags have to be applied by union or intersection (`false` is intersection)
	const [filterUnion, setFilterUnion] = useState(false);
	// The index of the media currently being viewed in the selected category
	// `null` if the user is not viewing any media.
	const [viewing, setViewing] = useState<number | null>(null);
	// Ref to the image gallery container
	const galleryRef = useRef<HTMLDivElement>(null);
	let filtered: Media[] = []; // Filtered medias array
	let mediaCount = 0; // Total number of displayed medias (image and video)
	let imagesCount = 0; // Number of images in the selected category
	let videosCount = 0; // Number of videos in the selected category
	if (!isLoading) { // These are only used if the app is loaded
		filtered = media[selectedCategory]?.filter(media => {
			if (filter[selectedCategory].length === 0) return true;
			const imgTags = media.tags.map((t: string) => t.toLowerCase());
			if (filterUnion) {
				return filter[selectedCategory].some(f => imgTags.includes(f.toLowerCase()));
			} else {
				return filter[selectedCategory].every(f => imgTags.includes(f.toLowerCase()));
			}
		});
		mediaCount = filtered?.length || 0;
		imagesCount = filtered?.filter(img => img.type === 'image').length;
		videosCount = filtered?.filter(img => img.type === 'video').length;
	}

	// Loads categories, selects a category (from localStorage or the first one) and loads images from it.
	async function initialFetch() {
		setIsLoading(true);
		let res;
		try {
			res = await API.get('/categories/get', { timeout: 5000 });
		} catch (_) {
			setIsFailing(true);
			setIsLoading(false);
			return;
		}
		setCategories(res.data);
		const savedSelection = localStorage.getItem('selectedCategory');
		const selection = res.data.includes(savedSelection) ? savedSelection : res.data[0];
		setSelectedCategory(selection);

		res = await API.get(`/images/get/${selection}`);
		const obj: Record<string, Media[]> = {};
		obj[selection] = res.data;
		setFilter(f => ({ ...f, [selection]: [] }));
		setMedia(obj);
		setIsLoading(false);
		setIsFailing(false);
	}

	// Startup effect
	useEffect(() => {
		initialFetch();
	}, []);

	// Selects a category, or creates it if it doesn't exist
	const selectCategory = async (name: string) => {
		if (!categories.includes(name)) {
			await API.post('/categories/add', { name });
			setCategories([...categories, name]);
		}
		const res = await API.get(`/images/get/${name}`);
		const obj = media;
		obj[name] = res.data;
		setMedia(obj);
		if (!filter[name]) {
			filter[name] = [];
			setFilter(filter);
		}
		setSelectedCategory(name);
		localStorage.setItem('selectedCategory', name);
	};

	// Deletes a category
	const deleteCategory = async (name: string) => {
		await API.post('/categories/delete', { name });
		setCategories(categories.filter(c => c !== name));
	};

	// Adds to the app's state media that has been sent to the server
	const addImportedMedia = (added: Media[], category: string) => {
		const obj = { ...media };
		obj[category] = [...(obj[category] || []), ...added];
		setMedia(obj);
		setIsAdding(false);
	};

	// Shuffles the media in the selected category
	const shuffleMedia = useCallback(() => {
		const gallery = galleryRef.current;
		if (!gallery)
			return;
		gallery.style.opacity = '0';
		setTimeout(() => {
			const obj = { ...media };
			obj[selectedCategory] = obj[selectedCategory].sort(() => Math.random() - 0.5);
			setMedia(obj);
			gallery.style.opacity = '1';
		}, 250);
	}, [galleryRef, media, selectedCategory]);

	// Views the previous entry.
	const previousImage = useCallback(() => {
		const i = viewing ?? 0;
		if (i - 1 < 0)
			setViewing(mediaCount - 1);
		else
			setViewing(i - 1);
	}, [viewing, mediaCount]);

	// Views the next entry.
	const nextImage = useCallback(() => {
		const i = viewing ?? 0;
		if (i + 1 >= mediaCount)
			setViewing(0);
		else
			setViewing(i + 1);
	}, [viewing, mediaCount]);

	// Event handler for keypresses
	// Handles shuffling images and viewing previous/next images
	const handleUserKeyPress = useCallback((e: KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowLeft':
				if (viewing !== null) previousImage();
				break;
			case 'ArrowRight':
				if (viewing !== null) nextImage();
				break;
			case 's':
				if (!isTyping && !isAdding && !isEditing && viewing === null) shuffleMedia();
				break;
			case 'a':
				if (!isTyping && !isAdding && !isEditing && viewing === null) setIsAdding(true);
				break;
			case 'u':
				if (!isTyping && !isAdding && !isEditing && viewing === null) setFilterUnion(f => !f);
				break;
			case 'Escape':
				setViewing(null);
				setIsAdding(false);
				setIsEditing(null);
				break;
		}
	}, [shuffleMedia, previousImage, nextImage, viewing, isAdding, isEditing, isTyping]);

	// Renames a category and update the images object.
	const renameCategory = async (oldName: string, newName: string) => {
		await API.post('/categories/rename', { oldName, newName });
		setCategories(categories.map(c => c === oldName ? newName : c));
		const obj = { ...media };
		if (obj[oldName]) {
			obj[oldName] = obj[oldName].map(i => ({ ...i, category: newName }));
			obj[newName] = obj[oldName];
			delete obj[oldName];
			setMedia(obj);
		}
	};

	// Edits a media
	const editMedia = async (tags: string[], category?: string) => {
		const obj = { ...media };
		obj[selectedCategory] = obj[selectedCategory].map(i => i.id === isEditing ? { ...i, tags } : i);
		if (category) {
			const entry = obj[selectedCategory].find(i => i.id === isEditing)!;
			obj[selectedCategory] = obj[selectedCategory].filter(i => i.id !== isEditing);
			obj[category] = [...(obj[category] || []), entry];
		}
		await API.post(`/images/edit/${isEditing}`, { tags, category: category || selectedCategory });
		setMedia(obj);
		setIsEditing(null);
	};

	// Deletes a media
	const deleteImage = async () => {
		const obj = { ...media };
		obj[selectedCategory] = obj[selectedCategory].filter(i => i.id !== isEditing);
		await API.post(`/images/delete/${isEditing}`);
		setMedia(obj);
		setIsEditing(null);
	};

	// Updates the filter tags
	const updateFilter = (tags: string[]) => {
		const obj = { ...filter };
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
			{viewing !== null &&
				<MediaViewer
					alt=''
					{...filtered[viewing]}
					close={() => setViewing(null)}
					next={nextImage}
					previous={previousImage}
				/>
			}
			{isAdding ?
				<EntryEditor
					edit={editMedia}
					delete={deleteImage}
					setIsTyping={setIsTyping}
					categories={categories}
					close={() => setIsAdding(false)}
					addImportedImages={addImportedMedia}
					selected={selectedCategory} />
				: ''
			}
			{isEditing ?
				<EntryEditor
					addImportedImages={addImportedMedia}
					edit={editMedia}
					delete={deleteImage}
					categories={categories}
					close={() => setIsEditing(null)}
					editing={media[selectedCategory]?.find(img => img.id === isEditing)}
					setIsTyping={setIsTyping}
					selected={selectedCategory} />
				: ''
			}
			<div className='relative w-full h-full overflow-auto'>
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
					shuffleImages={shuffleMedia}
					updateFilter={updateFilter}
				/>
				{mediaCount ?
					(
						<Gallery
							className=''
							media={media}
							mediaCount={mediaCount}
							filtered={filtered}
							ref={galleryRef}
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