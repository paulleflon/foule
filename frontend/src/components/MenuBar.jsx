import React, {useState} from 'react';
import CategorySelect from './CategorySelect';
import TagsEditor from './TagsEditor';
import {TiArrowShuffle} from 'react-icons/ti';
import {MdClose} from 'react-icons/md';
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
	const [explainOpen, setExplainOpen] = useState(false);
	return (
		<>
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
						className='relative ml-4 w-[45px] h-[45px]'
						title={filterUnion ? 'Union' : 'Intersection'}
					>
						<div className='absolute text-white  top-[-3px] right-[-3px] cursor-pointer hover:underline' onClick={() => setExplainOpen(true)}>?</div>
						<img
							alt=''
							className='w-full h-full rounded-full cursor-pointer hover:bg-white hover:bg-opacity-25 p-2 transition duration-200'
							onClick={() => setFilterUnion(!filterUnion)}
							src={filterUnion ? JoinFull : JoinInner}
						/>
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
			{explainOpen &&
				<div className='fullscreen-container'>
					<div className='pop-up'>
						<MdClose
							className='pop-up-close'
							size={40}
							color='#ffffff'
							onClick={() => setExplainOpen(false)}
						></MdClose>
						<div className='pop-up-title'> 'Union' and 'Intersection' search modes</div>
						<div>
							<div className='flex flex-row items-center font-bold'>
								<img src={JoinFull} alt='Intersection' className='w-[45px] h-[45px] mr-2' />
								Intersection
							</div>
							Returns entries that have <b>at least 	one</b> of the tags in the search.
						</div>
						<div>
							<div className='flex flex-row items-center font-bold'>
								<img src={JoinInner} alt='Union' className='w-[45px] h-[45px] mr-2' />
								Union
							</div>
							Returns entries that have <b>all</b> of the tags in the search.
						</div>
					</div>
				</div>
			}
		</>
	);
}

export default MenuBar;