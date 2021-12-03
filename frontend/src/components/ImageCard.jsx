import {useEffect, createRef, useState} from 'react';

const MAX_HEIGHT = 300;

export default function ImageCard(props) {
	const mediaRef = createRef();
	const containerRef = createRef();
	const [isPlaying, setPlaying] = useState(false);
	const [isLoaded, setLoaded] = useState(false);
	const [w, setW] = useState(0);
	const [h, setH] = useState(0);
	const [bestUrl, setBestUrl] = useState(undefined);
	const togglePlaying = () => {
		mediaRef.current[isPlaying ? 'pause' : 'play']();
		setPlaying(!isPlaying);
	};
	useEffect(() => {
		window.addEventListener('resize', handleResize);
		handleResize();

		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && !isLoaded) {
				setLoaded(true);
			}
		}, {
			root: null,
			threshold: 0.5
		});
		observer.observe(containerRef.current);
	}, []);

	const handleResize = () => {
		if (document.body.clientWidth < 640) {
			console.log('????');
			setW(640);
			setH(640 * props.height / props.width);
			setBestUrl(`${process.env.REACT_APP_API}/posters/${props.id}?width=${640}&height=${640 * props.height / props.width}`);
		} else {
			setW(MAX_HEIGHT * props.width / props.height);
			setH(MAX_HEIGHT);
		}
	};

	return (
		<div
			id={props.id}
			className='image-card cursor-pointer relative m-1 flex items-center justify-center'
			title={props.tags.join(', ')}
			style={(document.body.clientWidth < 640) ? {width: '80%', height: !isLoaded ? '80%' : 'auto'} : {
				width: w + 'px',
				height: h + 'px'
			}}
			ref={containerRef}
			>
			<div className='loader absolute w-4 h-4 z-0'></div>
			{
				isLoaded ?
					props.type === 'image' ?
						<img
							src={bestUrl || `${process.env.REACT_APP_API}/posters/${props.id}?width=${w * 1.5}&height=${h * 1.5}`}
							alt={props.tags.join(', ')}
							className='block w-full h-full object-contain z-10'
							ref={mediaRef}
						/>
						: <video
							className='block w-full h-full object-contain z-10'
							src={props.url}
							ref={mediaRef}
							autoPlay={false}
							loop
							playsInline
							muted
							poster={bestUrl || `${process.env.REACT_APP_API}/posters/${props.id}?width=${w * 1.5}&height=${h * 1.5}`}
							onClick={() => togglePlaying()}
						></video>
					: null
			}
			<div className='image-card-tags opacity-0 absolute bottom-0 left-0 w-full box-border px-1 bg-black bg-opacity-50 text-white truncate'>
				{props.tags.join(', ')}
			</div>
		</div >
	);

}