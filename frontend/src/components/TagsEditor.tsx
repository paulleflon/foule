import { KeyboardEventHandler, useEffect, useRef, WheelEventHandler } from 'react';
import { MdClose } from 'react-icons/md';

function TagsEditor({
	className,
	inputClassName,
	placeholder,
	setIsTyping,
	tags,
	updateTags
}: TagsEditorProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const tagListRef = useRef<HTMLDivElement>(null);
	const onDown = (e: KeyboardEvent) => {
		if (!inputRef.current)
			return;
		if (!inputRef.current.value.trim() && e.code === 'Backspace') {
			updateTags(tags.slice(0, tags.length - 1));
		}
		// Timeout to have the input value with this keydown taken into account.
		// We don't want this for Backspace though
		setTimeout(() => {
			const input = inputRef.current!;
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

	const onWheel = (e: WheelEvent) => {
		const delta = e.deltaY;
		if (tagListRef.current)
		tagListRef.current.scrollLeft += delta;
	};
	
	useEffect(() => {
		if (tagListRef.current)
			tagListRef.current.scrollLeft = tagListRef.current.scrollWidth;
	}, [tagListRef, tags]);

	return (
		<div className={`${className} flex flex-row`}>
			<div
				className={`hide-scrollbar tags flex flex-row max-w-[300px] overflow-auto ${tags.length && 'mr-2'}`}
				onWheel={onWheel as any as WheelEventHandler<HTMLDivElement>}
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
				onKeyDown={onDown as any as KeyboardEventHandler<HTMLInputElement>}
				placeholder={placeholder}
				ref={inputRef}
			/>
		</div>
	);
}
export default TagsEditor;

export interface TagsEditorProps {
	className?: string;
	inputClassName?: string;
	placeholder?: string;
	setIsTyping: (v: boolean) => void;
	tags: string[];
	updateTags: (v: string[]) => void;
}