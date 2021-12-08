import {createRef, useEffect, useState} from 'react';
import {MdDownload, MdEdit, MdOpenInNew} from 'react-icons/md';

const MAX_HEIGHT = 300;

export default function ImageCard(props) {
	const mediaRef = createRef();
	const containerRef = createRef();
	const [isLoaded, setLoaded] = useState(false);
	const [w, setW] = useState(0);
	const [h, setH] = useState(0);
	const [bestUrl, setBestUrl] = useState(undefined);
	const [isDownloading, setDownloading] = useState(false);
	useEffect(() => {
		const handleResize = () => {
			if (document.body.clientWidth < 640) {
				setW(640);
				setH(640 * props.height / props.width);
				setBestUrl(`${process.env.REACT_APP_API}/posters/${props.id}?width=${640}&height=${640 * props.height / props.width}`);
			} else {
				setW(MAX_HEIGHT * props.width / props.height);
				setH(MAX_HEIGHT);
			}
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && !isLoaded) {
				setLoaded(true);
			}
		}, {
			root: null,
			threshold: 0.01
		});
		observer.observe(containerRef.current);
	}, [containerRef, isLoaded, props.id, props.height, props.width]);

	const download = () => {
		setDownloading(true);
		fetch(`${process.env.REACT_APP_API}/download/${props.id}`)
			.then(response => response.blob())
			.then(blob => {
				const blobURL = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = blobURL;
				a.style = 'display: none';
				a.download = props.id;
				document.body.appendChild(a);
				a.click();
				a.remove();
				setDownloading(false);
			}).catch(() => null);
	};


	return (
		<div
			id={props.id}
			className='image-card cursor-pointer relative m-1 flex items-center justify-center'
			title={props.tags.join(', ')}
			style={(document.body.clientWidth < 640) ? {width: '80%', height: !isLoaded ? '80%' : 'auto', minHeight: '100px'} : {
				width: w + 'px',
				height: h + 'px',
				minHeight: '100px'
			}}
			onClick={props.onClick}
			ref={containerRef}
		>
			<div className={`loader absolute w-4 h-4 ${isDownloading ? 'z-20' : 'z-0'}`}></div>
			{
				isLoaded ?
					<img
						src={bestUrl || `${process.env.REACT_APP_API}/posters/${props.id}?width=${Math.floor(w * 1.5)}&height=${Math.floor(h * 1.5)}`}
						alt={props.tags.join(', ')}
						className='block w-full h-full object-contain z-10'
						ref={mediaRef}
					/>
					: null

			}
			<div className='image-card-actions absolute z-20 top-0 right-0 flex flex-row m-1 opacity-0 transition-opacity duration-100'>
				<MdEdit color='#fff' size={24} onClick={e => {e.stopPropagation(); props.edit()}} title={'Edit'} className='transform hover:translate-y-1 transition-all duration-100'></MdEdit>
				<a href={props.url} target='_blank' onClick={e => e.stopPropagation()}>
					<MdOpenInNew color='#fff' size={24} title='Download' className='transform hover:translate-y-1 transition-all duration-100'></MdOpenInNew>
				</a>
				<MdDownload color='#fff' size={24} title='Download' className='transform hover:translate-y-1 transition-all duration-100' onClick={e => {e.stopPropagation(); download();}}></MdDownload>
			</div>
			<div className='image-card-tags opacity-0 absolute bottom-0 left-0 w-full box-border px-1 bg-black bg-opacity-50 text-white truncate z-20'>
				{props.tags.join(', ')}
			</div>
		</div >
	);

}