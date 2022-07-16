import React from 'react';
import Media from '../typings/Media';
import ImageCard from './ImageCard';


const Gallery = ({
	className,
	media,
	mediaCount,
	filtered,
	ref,
	imagesCount,
	selectedCategory,
	setIsEditing,
	setViewing,
	videosCount }: GalleryProps) => {
	return (
		<div className={`${className} relative pt-20`}>
			<div
				className='images-grid [flex-flow:wrap] flex sm:flex-wrap px-4 pt-2 transition-opacity duration-200 justify-center 
					flex-col sm:flex-row items-center sm:items-start'
				ref={ref}
			>
				{filtered.map((image, i) =>
					<ImageCard {...image}
						key={image.id}
						edit={() => setIsEditing(image.id)}
						onClick={() => setViewing(i)} />
				)}
			</div>
			<div className='font-default text-gray-100 text-lg text-center my-4'>
				{/* Entries stats */}
				<span className='font-bold'>{imagesCount}</span> image{imagesCount === 1 ? '' : 's'},
				<span className='font-bold'> {videosCount}</span> video{videosCount === 1 ? '' : 's'}
				{
					mediaCount !== media[selectedCategory].length &&
					<div className='text-sm text-italic'>
						<span className='font-bold'>{media[selectedCategory].length}</span>
						<span>
							total entries in
							<span className='font-bold'>{selectedCategory}</span>
						</span>
					</div>
				}
			</div>
		</div>
	);
}
export default Gallery;

/**
 * Props for Gallery component.
 */
export interface GalleryProps {
	/**
	 * Optionnal classname to add to the Gallery HTML  element.
	 */
	className?: string;
	/**
	 * All the saved media.
	 */
	media: Record<string, Media[]>;
	/**
	 * The amount of filtered media entries.
	 */
	mediaCount: number;
	/**
	 * The media to display in the gallery, considering tags filter.
	 */
	filtered: Media[];
	/**
	 * A ref to the Gallery HTML element.
	 */
	ref: any;
	/**
	 * The amount of 'image' type media.
	 */
	imagesCount: number;
	/**
	 * The selected category.
	 */
	selectedCategory: string;
	setIsEditing: (id: string) => void;
	setViewing: (i: number) => void;
	/**
	 * The amount of 'video' type media.
	 */
	videosCount: number;
}