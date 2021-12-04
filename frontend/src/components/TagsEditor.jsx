import {useRef} from 'react';
import {MdClose} from 'react-icons/md';

function TagsEditor({tags, updateTags, inMenu}) {
	const inputRef = useRef(null);
	const onDown = (e) => {
		if (!inputRef.current.value.trim() && e.code === 'Backspace') {
			updateTags(tags.slice(0, tags.length - 1));
		}
		// Timeout to have the input value with this keydown taken into account.
		// We don't want this for Backspace though
		setTimeout(() => {
			const input = inputRef.current;
			let value = input.value.trim();
			if (e.code === 'Comma')
				value = value.substring(0, value.length - 1);
			if (e.code === 'Enter' || e.code === 'Comma') {
				if (value)
					updateTags([...tags, value]);
				input.value = '';
				input.focus();
			}
		});
	};
	return (
		<div className='flex flex-row items-center'>
			<div className={inMenu ?
				'tags flex flex-row'
				: 'tags flex items-center flex-wrap w-100% overflow-auto p-2 max-h-32'}>
				{
					tags.map((l, i) =>
						<div className='flex bg-green-400 px-1 py-1 mr-1 rounded-sm filter drop-shadow-md' key={`image-${i}`}>
							<div className='max-w-xxs truncate'>{l}</div>
							<div className='ml-2 cursor-pointer' onClick={updateTags.bind(this, tags.slice(0, tags.length - 1))}><MdClose size='1.5em'></MdClose></div>
						</div>
					)}

			</div>
			<input type='text' placeholder={inMenu ? 'Filter...' : 'Tag'}
				className='font-default text-xl border-none h-8 px-2 block rounded-sm w-20 md:w-auto' onKeyDown={onDown} ref={inputRef} />
		</div>
	);
}
export default TagsEditor;