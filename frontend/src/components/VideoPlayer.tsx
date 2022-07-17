import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MdFullscreen, MdPause, MdPlayArrow, MdVolumeOff, MdVolumeUp } from 'react-icons/md';

function VideoPlayer(props: VidePlayerProps) {
	const [isPlaying, setIsPlaying] = useState(true);
	const [isMuted, setIsMuted] = useState(true);
	const [controlsOutTimeout, setControlsOutTimeout] = useState<NodeJS.Timeout | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const videoContainerRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const controlsRef = useRef<HTMLDivElement>(null);
	const progressContainerRef = useRef<HTMLDivElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);
	const progressBallRef = useRef<HTMLDivElement>(null);
	const buttonProps = {
		color: '#ffffff',
		className: 'cursor-pointer',
		size: 24
	};


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
				props.onSwipeRight();
			else
				props.onSwipeLeft();
		}
		xDown = null;
		yDown = null;
	};

	const toggleMute = useCallback(() => {
		setIsMuted(!isMuted);
		if (videoRef.current)
			videoRef.current.muted = !isMuted;
	}, [isMuted]);

	const togglePlayPause = useCallback(() => {
		setIsPlaying(!isPlaying);
		if (!videoRef.current)
			return;
		if (isPlaying)
			videoRef.current.pause();
		else
			videoRef.current.play();
	}, [isPlaying]);

	const updateProgress = (e: MouseEvent) => {
		if (!progressContainerRef.current || !videoRef.current)
			return;
		const rect = progressContainerRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percent = x / rect.width;
		videoRef.current.currentTime = percent * videoRef.current.duration;
	};

	const videoMouseMove = () => {
		if (!controlsRef.current || !videoRef.current)
			return;
		controlsRef.current.style.opacity = '1';
		videoRef.current.style.cursor = 'default';
		clearTimeout(controlsOutTimeout as NodeJS.Timeout);
		setControlsOutTimeout(setTimeout(() => {
			if (videoRef.current)
				videoRef.current.style.cursor = 'none';
			if (controlsRef.current)
				controlsRef.current.style.opacity = '0';
		}, 5000));
	};

	const videoMouseLeave = () => {
		if (controlsRef.current)
			controlsRef.current.style.opacity = '0';
		clearTimeout(controlsOutTimeout as NodeJS.Timeout);
		setControlsOutTimeout(null);
	};
	const progressMouseEnter = () => progressBallRef.current!.style.opacity = '0';
	const progressMouseLeave = () => progressBallRef.current!.style.opacity = '0';

	const onTimeUpdate = () => {
		if (!videoRef.current || !progressRef.current || !progressBallRef.current)
			return;
		progressRef.current.style.width = `${videoRef.current.currentTime / videoRef.current.duration * 100}%`;
		progressBallRef.current.style.left = `${videoRef.current.currentTime / videoRef.current.duration * 100}%`;
	};

	function toggleFullScreen() {
		const vid = videoRef.current;
		if (!vid)
			return;
		if (!document.fullscreenElement) {
			if (vid.requestFullscreen)
				vid.requestFullscreen();
			else if ((vid as any).webkitEnterFullscreen)
				(vid as any).webkitEnterFullscreen();
		}
		else {
			if (document.exitFullscreen)
				document.exitFullscreen();
			else if ((vid as any).webkitExitFullscreen)
				(vid as any).webkitExitFullscreen();
		}
	}

	const keyboardControl = useCallback((e: KeyboardEvent) => {
		const vid = videoRef.current;
		if (!vid)
			return;
		switch (e.key.toLowerCase()) {
			case 'j':
				vid.currentTime = Math.max(0, vid.currentTime - (e.shiftKey ? 0.05 : 5));
				break;
			case 'l':
				vid.currentTime = Math.min(vid.duration, vid.currentTime + (e.shiftKey ? 0.05 : 5));
				break;
			case ' ':
			case 'k':
				togglePlayPause();
				break;
			case 'm':
				toggleMute();
				break;
			case 'f':
				toggleFullScreen();
				break;
			default:
				break;
		}
	}, [toggleMute, togglePlayPause]);

	useEffect(() => {
		document.addEventListener('keydown', keyboardControl);
		const vid = videoRef.current;
		const container = videoContainerRef.current;
		if (!vid || !container)
			return;
		if (vid.width > vid.height) {
			container.style.width = '100%';
			vid.style.width = '100%';
		}
		else {
			container.style.height = '100%';
			vid.style.height = '100%';
		}
		return () => {
			document.removeEventListener('keydown', keyboardControl);
		};
	}, [keyboardControl]);
	return (
		<div
			className={`${props.className} relative flex justify-center items-center`}
			ref={containerRef}
		>
			<div
				onMouseMove={videoMouseMove}
				onMouseLeave={videoMouseLeave}
				ref={videoContainerRef}
				className='relative'
			>
				<video
					src={props.src}
					autoPlay
					loop
					muted
					playsInline
					className='relative w-full h-full object-contain'
					ref={videoRef}
					onClick={togglePlayPause}
					onTimeUpdate={onTimeUpdate}
					onTouchStart={handleTouchStart as any}
					onTouchMove={handleTouchMove as any}
					onPause={() => setIsPlaying(false)}
					onPlay={() => setIsPlaying(true)}
				>
				</video>
				<div
					ref={controlsRef}
					className='absolute bottom-5 left-[2.5%] w-[95%] h-8 rounded-full bg-gray-900/50 backdrop-blur flex flex-row items-center justify-between px-2 transition-opacity duration-500'
				>
					<div onClick={togglePlayPause}>
						{
							isPlaying ? <MdPause {...buttonProps}></MdPause> : <MdPlayArrow {...buttonProps}></MdPlayArrow>
						}
					</div>
					<div
						onMouseEnter={progressMouseEnter}
						onMouseLeave={progressMouseLeave}
						className='relative h-full w-[80%] flex items-center'
					>
						<div
							className='relative w-full h-1 bg-white/80 rounded-full cursor-pointer [overflow:visible_!important]'
							onClick={e => updateProgress(e as any)}
							ref={progressContainerRef}
						>
							<div className='h-full rounded-full bg-white pointer-events-none' ref={progressRef}></div>
							<div className='absolute w-4 h-4 rounded-full bg-white top-[-50%] transforn translate-x-[-50%] translate-y-[-25%] transition-opacity duration-150 opacity-0 pointer-events-none z-30' ref={progressBallRef}></div>
						</div>
					</div>
					<div onClick={toggleMute}>
						{
							isMuted ? <MdVolumeOff {...buttonProps}></MdVolumeOff> : <MdVolumeUp {...buttonProps}></MdVolumeUp>
						}
					</div>
					<MdFullscreen {...buttonProps} onClick={toggleFullScreen}></MdFullscreen>
				</div>
			</div>
		</div>
	);
};
export default VideoPlayer;

export interface VidePlayerProps {
	className?: string;
	onSwipeLeft: () => void;
	onSwipeRight: () => void;
	src: string;
}
