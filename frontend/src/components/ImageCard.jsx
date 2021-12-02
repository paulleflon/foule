import {useEffect, createRef, useState} from 'react';

const MAX_HEIGHT = 300;

export default function ImageCard(props) {
	const mediaRef = createRef();
	const containerRef = createRef();
	const [isPlaying, setPlaying] = useState(false);
	const [isLoaded, setLoaded] = useState(false);
	const w = MAX_HEIGHT * props.width / props.height;
	const h = MAX_HEIGHT;
	const togglePlaying = () => {
		mediaRef.current[isPlaying ? 'pause' : 'play']();
		setPlaying(!isPlaying);
	};
	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting && !isLoaded) {
				setLoaded(true);
			}
		}, {
			root: null,
			threshold: 0.5
		});
		observer.observe(containerRef.current);
	});
	return (
		<div
			className='image-card  cursor-pointer relative m-1 flex items-center justify-center'
			title={props.tags.join(', ')}
			style={{
				width: w + 'px',
				height: h + 'px',
			}}
			ref={containerRef}
		>
			{isLoaded ?
				props.type === 'image' ?
					<img src={props.url} alt={props.tags.join(', ')} className='block w-full h-full object-cover' ref={mediaRef} />
					: <video
						className='block w-full h-full object-contain'
						src={props.url}
						ref={mediaRef}
						autoPlay={false}
						loop
						playsInline
						muted
						onClick={() => togglePlaying()}
					></video>
				: <div className='loader w-4 h-4'></div>
			}
			<div className='image-card-tags opacity-0 absolute bottom-0 left-0 w-full box-border px-1 bg-black bg-opacity-50 text-white truncate'>
				{props.tags.join(', ')}
			</div>
		</div>
	);

}