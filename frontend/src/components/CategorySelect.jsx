import React, {useRef, useState} from 'react';
import {RiDeleteBin6Line, RiEdit2Fill} from 'react-icons/ri';
import {AiOutlineCaretDown} from 'react-icons/ai';
import {VscListSelection} from 'react-icons/vsc';


function Category(props) {
	const [renaming, setRenaming] = React.useState(false);
	const onDown = e => {
		if (e.key === 'Enter' && e.target.value.trim().length) {
			props.renameCategory(props.name, e.target.value);
			setRenaming(false);
		} else if (e.key === 'Escape') {
			setRenaming(false);
		}
	};
	return (
		<div
			className='flex items-center justify-between  w-full hover:bg-gray-100'
			onClick={() => !renaming && props.selectCategory(props.name)}
		>
			{
				renaming ?
					<input
						className='w-full outline-none border-2 rounded-md text-lg transition-all duration-100'
						type='text'
						defaultValue={props.name}
						onKeyDown={onDown}
						onFocus={() => props.setIsTyping(true)}
						onBlur={() => {setRenaming(false); props.setIsTyping(false);}}
						autoFocus />
					:
					props.name.length ?
						<div
							title={props.name}
							className='py-1 px-2 text-s cursor-pointer font-default truncate w-3/4 flex-grow'>
							{props.create ? 'Create category: ' : ''}
							<span className='font-bold'>{props.name}</span>
						</div>
						:
						<div className='py-1 px-2 text-s hover:bg-white font-default italic w-full'>Create a category...</div>
			}
			{!props.create && !renaming
				? (
					<div className='flex flex-row'>
						<div className='cursor-pointer px-1' title='Rename' onClick={(e) => {e.stopPropagation(); setRenaming(true);}}><RiEdit2Fill></RiEdit2Fill></div>
						<div className='cursor-pointer px-1' title='Delete' onClick={(e) => {e.stopPropagation(); props.deleteCategory(props.name);}}><RiDeleteBin6Line color='#eb4034'></RiDeleteBin6Line></div>
					</div>
				)
				: ''
			}
		</div>
	);
}

function CategorySelect(props) {
	const inputRef = useRef();
	const categorySelectRef = useRef();
	const [filter, setFilter] = useState('');
	const [focused, setFocused] = useState(false);

	const onChange = () => {
		setFilter(inputRef.current.value);
	};

	const onBlur = () => {
		setFocused(false);
		setFilter('');
		inputRef.current.value = '';
	};

	const selectCategory = name => {
		if (!name.length)
			return;
		props.select(name);
		categorySelectRef.current.blur();
	};

	const deleteCategory = name => {
		props.delete(name);
	};

	const renderCategories = () => {
		if (filter === props.selected)
			return <div className='py-1 px-2 text-s hover:bg-white font-default italic w-full'>Already browsing <span className='font-bold'>{filter}</span></div>;

		const filtered = props.categories.filter(c => c.toLowerCase().includes(filter.toLowerCase()) && c !== props.selected);
		const mapped = filtered.map(c =>
			<Category
				key={c}
				name={c}
				setIsTyping={props.setIsTyping}
				selectCategory={selectCategory}
				deleteCategory={deleteCategory}
				renameCategory={props.rename}
			/>
		);
		return mapped.length ? mapped : <Category name={filter} create={true} select={selectCategory}></Category>;
	};
	return (
		<div tabIndex={0}
			onFocus={() => setFocused(true)}
			onBlur={onBlur}
			className={`${focused ? 'md:rounded-b-none' : ''} rounded-b z-40 category-select rounded-t md:w-64 inline-block md:relative filter drop-shadow-md bg-white`}
			ref={categorySelectRef}>
			<div className='cursor-pointer selected-category font-title text-xl flex justify-between items-center w-full p-2'>
				<VscListSelection></VscListSelection>
				<div className='w-1/2 truncate text-center hidden md:block' title={props.selected}>{props.selected}</div>
				<AiOutlineCaretDown size='0.75em' className={`transition-all duration-200 ${focused ? 'transform rotate-180' : ''} hidden md:block`}></AiOutlineCaretDown>
			</div>
			<div
				className={`${!focused ? 'h-0' : ''} transition-all overflow-hidden absolute right-0 w-3/4 md:w-full bg-white my-2 mx-2 md:m-0 rounded-b rounded-t md:rounded-t-none`}>
				<div className='p-2'>
					<input
						onBlur={e => {e.stopPropagation(); categorySelectRef.current.focus(); props.setIsTyping(false);}}
						onFocus={() => props.setIsTyping(true)}
						className='px-2 outline-none border-2 rounded-md w-full m-auto focus:border-blue-400 text-lg transition-all duration-100'
						type='text'
						ref={inputRef}
						onChange={onChange}
						placeholder='Find or create a category'
					/>
				</div>
				<div>
					{renderCategories()}
				</div>
			</div>
		</div>
	);
}

export default CategorySelect;
