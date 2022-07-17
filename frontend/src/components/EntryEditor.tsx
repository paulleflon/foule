import React, { useRef, useState } from 'react';
import { MdClose } from 'react-icons/md';
import * as API from '../api';
import Media from '../typings/Media';
import TagsEditor from './TagsEditor';

function EntryEditor(props: EntryEditorProps) {
	const [entries, setEntries] = useState<Partial<Media>[]>([]);
	const [tags, setTags] = useState(props.editing ? props.editing.tags : []);
	const inputs = {
		src: useRef<HTMLInputElement>(null),
		tags: useRef<HTMLInputElement>(null),
		category: useRef<HTMLSelectElement>(null)
	};

	const addEntry = (type: 'video' | 'image') => {
		const value = inputs.src.current?.value;
		if (!value || !value.trim().length)
			return;
		try {
			new URL(value);
		} catch (_) {
			alert('Invalid URL.');
			return;
		}
		if (type === 'image') {
			const img = new Image();
			img.src = value;
			img.onerror = () => {
				alert('Couldnt load image.');
			};
			img.onload = () => {
				const entry = {
					url: value,
					width: img.width,
					height: img.height,
					type: 'image' as 'image'
				};
				setEntries([...entries, entry]);
				if (inputs.src.current) {
					inputs.src.current.value = '';
					inputs.src.current.focus();
				}
			};
		} else {
			const vid = document.createElement('video');
			vid.src = value;
			vid.onerror = () => {
				alert('Couldnt load video.');
			};
			vid.oncanplaythrough = () => {
				const entry = {
					url: value,
					width: vid.videoWidth,
					height: vid.videoHeight,
					type: 'video' as 'video'
				};
				setEntries([...entries, entry]);
				if (inputs.src.current) {
					inputs.src.current.value = '';
					inputs.src.current.focus();
				}
			};
		}
	};

	const removeEntry = (i: number) => {
		const updated = [...entries.slice(0, i), ...entries.slice(i + 1)];
		setEntries(updated);
	};

	const updateTags = (tags: string[]) => {
		setTags(tags);
	};

	const sendEntry = () => {
		API.post('/images/add', { images: entries, tags, category: inputs.category.current?.value })
			.then(response => {
				if (response.status === 200) {
					props.addImportedImages(response.data, inputs.category.current!?.value);
				} else {
					// Must get rid of all alert for better warning notifications.
					// lmao 
					alert('An error occured: see console for more infos.');
					console.error(response.data.error);
				}
			});
	};

	const editEntry = () => {
		const category = inputs.category.current!?.value;
		props.edit(tags, category !== props.editing!.category ? category : undefined);
	};

	return (
		<div className='fullscreen-container'>
			<div className='pop-up'>
				<MdClose
					className='absolute top-0 right-0 m-2 rounded-full cursor-pointer hover:bg-white hover:bg-opacity-25 p-2 transition-all duration-100'
					size={40}
					color='#ffffff'
					onClick={() => props.close()}
				></MdClose>
				{!props.editing &&
					<div>
						<div className='pop-up-title'>Add images/videos</div>
						<div className='my-4 overflow-y-auto max-h-32'>
							{
								entries.map((e, i) =>
									<div className='flex' key={`image-${i}`}>
										<span className='inline-block w-3/4 truncate'>{e.url}</span>
										<span className='mx-2 cursor-pointer' onClick={() => removeEntry(i)}><MdClose size='1.5em'></MdClose></span>
									</div>
								)}
						</div>
						<div className='flex'>
							<input type='text' placeholder='Image/Video URL' className='font-default text-black text-xl border-none h-8 px-2 w-1/2 rounded-l-sm rounded-r-none' ref={inputs.src} />
							<button className='bg-white text-black h-8 border-l px-2 border-black' onClick={() => addEntry('image')}>Add</button>
							<button className='bg-white text-black h-8 border-l px-2 border-black rounded-r-sm' onClick={() => addEntry('video')}>Add Video</button>
						</div>
					</div>
				}
				<div>
					<div className='pop-up-title mt-4'>{props.editing ? 'Edit entry' : 'Set metadata'}</div>
					<div className='pop-up-title text-left text-xl'>Tags</div>
					<TagsEditor tags={tags} updateTags={updateTags} setIsTyping={props.setIsTyping} placeholder='Tag' />
					<div className='pop-up-title text-left text-xl'>Category</div>
					<select ref={inputs.category} className='text-black'>
						<option className='font-bold' disabled>Select a category</option>
						<option>{props.selected}</option>
						{props.categories.map(c => c === props.selected ? null : <option key={c}>{c}</option>)}
					</select>
				</div>
				<div className='absolute bottom-0 right-0 m-2 '>
					{
						props.editing &&
						<button className='font-title text-xl text-red-500 border-2 border-red-500 rounded-full px-4 py-1 hover:bg-red-800 hover:bg-opacity-25 duration-200 transition-all' onClick={props.delete}>Delete</button>

					}
					<button
						className='font-title text-xl text-white border-2 border-white rounded-full px-4 py-1 ml-4 hover:bg-white hover:bg-opacity-25 duration-200 transition-all'
						onClick={props.editing ? editEntry : sendEntry}>
						{props.editing ? 'Save' : 'Send'}
					</button>
				</div>
			</div>
		</div>
	);
}
export default EntryEditor;

interface EntryEditorProps {
	editing?: Media;
	addImportedImages: (media: Media[], category: string) => void;
	edit: (tags: string[], category?: string) => void;
	close: () => void;
	categories: string[];
	selected: string;
	setIsTyping: (v: boolean) => void;
	delete: () => void;
}