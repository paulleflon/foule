import {MdChevronLeft, MdChevronRight, MdClose} from 'react-icons/md';
import VideoPlayer from './VideoPlayer';

function MediaViewer(props: MediaViewerProps) {
	let xDown: number | null = null;
	let yDown: number | null = null;
	function handleTouchStart(e: TouchEvent) {
		const firstTouch = e.touches[0];
		xDown = firstTouch.clientX;
		yDown = firstTouch.clientY;
	};
	function handleTouchMove(e: TouchEvent) {
		if (!xDown || !yDown)
			return;
		if (document.documentElement.clientWidth / window.innerWidth > 1) {
			// Check if mobile is zoomed in.
			xDown = null;
			yDown = null;
			return;
		}
		let xUp = e.touches[0].clientX;
		let yUp = e.touches[0].clientY;
		let xDiff = xDown - xUp;
		let yDiff = yDown - yUp;

		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			if (xDiff > 0)
				props.next();
			else
				props.previous();
		}
		xDown = null;
		yDown = null;
	};

	return (
		<div className='fullscreen-container'>
			<MdChevronLeft
				className='absolute top-[50%] left-0 cursor-pointer bg-white bg-opacity-0 hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200'
				color='#ffffff'
				size={48}
				onClick={props.previous}
			/>
			<MdChevronRight
				className='absolute top-[50%] right-0 cursor-pointer bg-white bg-opacity-0  hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200'
				color='#ffffff'
				size={48}
				onClick={props.next}
			/>
			{
				props.type === 'image' ?
					<img
						className='w-full h-full p-10 object-contain'
						src={props.url}
						alt={props.alt}
						onTouchStart={handleTouchStart as any}
						onTouchMove={handleTouchMove as any}
					/>
					:
					<VideoPlayer
						className='h-[90%]'
						src={props.url}
						onSwipeLeft={props.previous}
						onSwipeRight={props.next}
					/>
			}
			<MdClose
				className='z-[1000] absolute top-0 right-0 md:m-5 cursor-pointerbg-white bg-opacity-0 hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200'
				color='#ffffff'
				onClick={props.close}
				size={30}
			/>
		</div>
	);
}
export default MediaViewer;


export interface MediaViewerProps {
	next: () => void;
	previous: () => void;
	url: string;
	alt: string;
	type: 'video' | 'image';
	close: () => void;
}