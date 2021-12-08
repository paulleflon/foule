import e from 'cors';
import {useEffect} from 'react';
import {MdChevronLeft, MdChevronRight, MdClose} from 'react-icons/md';

let touchStartX = 0;
let touchEndX = 0;


function ImageViewer(props) {
	const handleTouchStart = (e) => {
		touchStartX = e.changedTouches[0].screenX;
	};
	const handleTouchEnd = (e) => {
		touchEndX = e.changedTouches[0].screenX;
		if (touchEndX > touchStartX)
			props.previous();
		if (touchEndX < touchStartX)
			props.next();
	};
	return (
		<div className='fixed w-full h-full top-0 left-0 bg-black bg-opacity-75 z-50 flex justify-center items-center'>
			<div className='absolute top-0 left-0 w-full h-full flex flex-row justify-between items-center md:px-20'>
				<MdChevronLeft className='cursor-pointer bg-white bg-opacity-0  hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200' color='#ffffff' onClick={props.previous} size={48} />
				<MdChevronRight className='cursor-pointer bg-white bg-opacity-0  hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200' color='#ffffff' onClick={props.next} size={48} />
			</div>
			{
				props.type === 'image' ?
					<img className='w-full h-full p-10 object-contain' src={props.url} alt={props.alt} /> :
					<video
						className='absolute h-full mx-auto p-5 md:p-10'
						src={props.url}
						autoPlay
						loop
						playsInline
						muted
						controls
					/>
			}
			<div
				className='absolute w-3/4'
				style={{height: '50%'}}
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			></div>
			<MdClose className='absolute top-0 right-0 md:m-5 cursor-pointer bg-white bg-opacity-0 hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200' color='#ffffff' onClick={props.close} size={30} style={{zIndex: 1001}} />
		</div>
	);
}
export default ImageViewer;