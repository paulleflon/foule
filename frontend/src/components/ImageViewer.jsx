import {MdChevronLeft, MdChevronRight, MdClose} from 'react-icons/md';

function ImageViewer(props) {
	return (
		<div className='fixed w-full h-full top-0 left-0 bg-black bg-opacity-75 z-50'>
			{
				props.type === 'image' ?
					<img className='w-full h-full p-10 object-contain' src={props.url} alt={props.alt} /> :
					<video className='w-full h-full p-10 object-contain' src={props.url} alt={props.alt} autoPlay loop playsInline muted />
			}
			<div className='absolute top-0 left-0 w-full h-full flex flex-row justify-between items-center md:px-20'>
				<MdChevronLeft className='cursor-pointer bg-white bg-opacity-0  hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200' color='#ffffff' onClick={props.previous} size={48} />
				<MdChevronRight className='cursor-pointer bg-white bg-opacity-0  hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200' color='#ffffff' onClick={props.next} size={48} />
			</div>
			<MdClose className='absolute top-0 right-0 m-5 cursor-pointer bg-white bg-opacity-0 hover:bg-opacity-25 rounded-full p-2 box-content transition-all duration-200' color='#ffffff' onClick={props.close} size={30} />
		</div>
	);
}
export default ImageViewer;