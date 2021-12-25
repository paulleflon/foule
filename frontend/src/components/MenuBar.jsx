import React from 'react';
import CategorySelect from './CategorySelect';
import TagsEditor from './TagsEditor';
import {TiArrowShuffle} from 'react-icons/ti';
import JoinFull from '../assets/join_full.png';
import JoinInner from '../assets/join_inner.png';

function MenuBar({
	categories,
	deleteCategory,
	filter,
	filterUnion,
	renameCategory,
	selectCategory,
	selectedCategory,
	setFilterUnion,
	setIsTyping,
	shuffleImages,
	updateFilter,
}) {
	return (
		<div
			className='fixed w-full lg:w-11/12 bg-gray-900/90 backdrop-blur-lg py-4 px-4 lg:left-[4.5%] lg:my-2 flex flex-row items-center justify-end lg:justify-between shadow-xl lg:rounded-2xl z-40'
		>
			<div className='font-title text-white text-4xl lg:block hidden'>Foule</div>
			<div className='flex flex-row items-center'>
				<TagsEditor
					setIsTyping={setIsTyping}
					tags={filter[selectedCategory]}
					updateTags={updateFilter}
					placeholder='Search...'
				/>

				<div
					className='ml-4 cursor-pointer rounded-full hover:bg-white hover:bg-opacity-25 p-2 transition duration-200'
					style={{width: '45px', height: '45px'}}
					onClick={() => setFilterUnion(!filterUnion)}
					title={filterUnion ? 'Union' : 'Intersection'}
				>
					<img src={filterUnion ? JoinFull : JoinInner} alt='' className='w-full h-full' />
				</div>

				<TiArrowShuffle
					title='Shuffle images'
					color='#ffffff'
					size={45}
					className='mx-4 cursor-pointer rounded-full hover:bg-white hover:bg-opacity-25 p-2 transition duration-200'
					onClick={shuffleImages}
				>
				</TiArrowShuffle>

				<CategorySelect
					categories={categories}
					selected={selectedCategory}
					delete={deleteCategory}
					select={selectCategory}
					rename={renameCategory}
					setIsTyping={setIsTyping}
				/>
			</div>
		</div>
	);
}

export default MenuBar;