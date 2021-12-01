import {useEffect, createRef, useState} from 'react';

const MAX_WIDTH = 300;
const MAX_HEIGHT = 400;

export default function ImageCard(props) {
	const mediaRef = createRef();
	const [isPlaying, setPlaying] = useState(false);

	const togglePlaying = () => {
		if (isPlaying) {
			mediaRef.current.currentTime = 0;
			mediaRef.current.pause();
		} else {
			mediaRef.current.play();
		}
		setPlaying(!isPlaying);
	};

	useEffect(() => {
		const media = mediaRef.current;
		const w = media.videoWidth || media.width;
		const h = media.videoHeight || media.height;
		if (w > h) {
			media.style.width = MAX_WIDTH + 'px';
			media.style.height = MAX_WIDTH * h / w + 'px';
		} else {
			media.style.width = MAX_HEIGHT * w / h + 'px';
			media.style.height = MAX_HEIGHT + 'px';
		}
	}, []);
	return (
		<div
			className='image-card cursor-pointer relative m-1 flex items-center justify-center'
			title={props.tags.join(', ')}
		>
			{props.type === 'image' ?
				<img src={props.url} alt={props.tags.join(', ')} className='block' ref={mediaRef} />
				: <video
					src={props.url}
					ref={mediaRef}
					autoPlay={false}
					loop
					onClick={() => togglePlaying()}
					onMouseEnter={() => mediaRef.current.play()}
					onMouseLeave={() => {
						if (!isPlaying) {
							mediaRef.current.pause();
							mediaRef.current.currentTime = 0;
						}
					}}></video>
			}
			<div className='image-card-tags opacity-0 absolute bottom-0 left-0 w-full box-border px-1 bg-black bg-opacity-50 text-white truncate'>
				{props.tags.join(', ')}
			</div>
		</div>
	);

}