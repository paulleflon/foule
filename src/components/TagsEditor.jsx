import {useEffect, useRef} from 'react';
import {MdClose} from 'react-icons/md';

function TagsEditor({
	className,
	inputClassName,
	placeholder,
	setIsTyping,
	tags,
	updateTags
}) {
	const inputRef = useRef(null);
	const tagListRef = useRef(null);
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

	const onWheel = e => {
		const delta = e.deltaY;
		tagListRef.current.scrollLeft += delta;
	};

	useEffect(() => {
		tagListRef.current.scrollLeft = tagListRef.current.scrollWidth;
	}, [tagListRef, tags]);

	return (
		<div className={`${className} flex flex-row`}>
			<div
				className={`hide-scrollbar tags flex flex-row max-w-[300px] overflow-auto ${tags.length && 'mr-2'}`}
				onWheel={onWheel}
				ref={tagListRef}
			>
				{
					tags.map((l, i) =>
						<div className='flex border bg-white/40 border-white text-white p-1 rounded-sm filter drop-shadow-md mr-2' key={`image-${i}`}>
							<div className='max-w-xs truncate'>{l}</div>
							<div
								className='ml-2 cursor-pointer'
								onClick={() => updateTags(tags.slice(0, tags.length - 1))}
							>
								<MdClose size='1.5em' color='#ffffff'></MdClose>
							</div>
						</div>
					)}

			</div>
			<input type='text'
				className={inputClassName || 'font-default text-xl border-none h-8 px-2 block rounded-sm w-20 md:w-48 text-black'}
				onBlur={() => setIsTyping(false)}
				onFocus={() => setIsTyping(true)}
				onKeyDown={onDown}
				placeholder={placeholder}
				ref={inputRef} />
		</div>
	);
}
export default TagsEditor;