import React from 'react';
import ImageCard from './ImageCard';


function Gallery({
	className,
	entries,
	entriesCount,
	filtered,
	galleryRef,
	imagesCount,
	selectedCategory,
	setIsEditing,
	setViewing,
	videosCount
}) {
	return (
		<div className={`${className} relative pt-20`}>
			<div
				className='images-grid [flex-flow:wrap] flex sm:flex-wrap px-4 pt-2 transition-opacity duration-200 justify-center flex-col sm:flex-row items-center sm:items-start'
				ref={galleryRef}
			>
				{filtered.map((image, i) => (<ImageCard {...image} key={image.id} edit={() => setIsEditing(image.id)} onClick={() => setViewing(i)} ></ImageCard>))}
			</div>
			<div className='font-default text-gray-100 text-lg text-center my-4'> {/* Entries stats */}
				<span className='font-bold'>{imagesCount}</span> image{imagesCount === 1 ? '' : 's'},
				<span className='font-bold'> {videosCount}</span> video{videosCount === 1 ? '' : 's'}
				{


					entriesCount !== entries[selectedCategory].length ?
						<div className='text-sm text-italic'> <span className='font-bold'>{entries[selectedCategory].length}</span> total entries in <span className='font-bold'>{selectedCategory}</span></div>
						: ''
				}
			</div>
		</div>
	);
}

export default Gallery;