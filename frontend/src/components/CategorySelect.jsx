import React from 'react';
import {createRef} from 'react';
import {RiDeleteBin6Line, RiEdit2Fill} from 'react-icons/ri';
import {AiOutlineCaretDown} from 'react-icons/ai';
import {VscListSelection} from 'react-icons/vsc';

export default class CategorySelect extends React.Component {
	constructor(props) {
		super(props);
		this.input = createRef();
		this.whole = createRef();
		this.state = {
			filter: '',
			focused: false
		};
	}

	onChange() {
		this.setState({filter: this.input.current.value});
	}

	onBlur() {
		this.setState({focused: false, filter: ''});
		this.input.current.value = '';
	}

	select(name) {
		if (!name.length)
			return;
		this.props.select(name);
		this.whole.current.blur();
	}

	delete(name) {
		this.props.delete(name);
	}

	renderCategories() {
		if (this.state.filter === this.props.selected)
			return <div className='py-1 px-2 text-s hover:bg-white font-default italic w-full'>Already browsing <span className='font-bold'>{this.state.filter}</span></div>;
		const filtered = this.props.categories.filter(c => c.toLowerCase().includes(this.state.filter.toLowerCase()) && c !== this.props.selected);
		const mapped = filtered.map(c => <Category key={c} name={c} setIsTyping={this.props.setIsTyping} select={this.select.bind(this)} delete={this.delete.bind(this)} rename={this.props.rename.bind(this)}></Category>);
		return mapped.length ? mapped : <Category name={this.state.filter} create={true} select={this.select.bind(this)}></Category>;
	}

	render() {
		return (
			<div tabIndex={0}
				onFocus={() => this.setState({focused: true})}
				onBlur={this.onBlur.bind(this)}
				className={`${this.state.focused ? 'md:rounded-b-none' : ''} rounded-b z-40 category-select rounded-t md:w-64 inline-block md:relative filter drop-shadow-md bg-white`}
				ref={this.whole}>
				<div className='cursor-pointer selected-category font-title text-xl flex justify-between items-center w-full p-2'>
					<VscListSelection></VscListSelection>
					<div className='w-1/2 truncate text-center hidden md:block' title={this.props.selected}>{this.props.selected}</div>
					<AiOutlineCaretDown size='0.75em' className={`transition-all duration-200 ${this.state.focused ? 'transform rotate-180' : ''} hidden md:block`}></AiOutlineCaretDown>
				</div>
				<div
					className={`${!this.state.focused ? 'h-0' : ''} transition-all overflow-hidden absolute right-0 w-3/4 md:w-full bg-white my-2 mx-2 md:m-0 rounded-b rounded-t md:rounded-t-none`}>
					<div className='p-2'>
						<input
							onBlur={e => {e.stopPropagation(); this.whole.current.focus(); this.props.setIsTyping(false);}}
							onFocus={() => this.props.setIsTyping(true)}
							className='px-2 outline-none border-2 rounded-md w-full m-auto focus:border-blue-400 text-lg transition-all duration-100'
							type='text'
							ref={this.input}
							onChange={this.onChange.bind(this)}
							placeholder='Find or create a category' />
					</div>
					<div>
						{this.renderCategories()}
					</div>
				</div>
			</div>
		);
	}
}

function Category(props) {
	const [renaming, setRenaming] = React.useState(false);
	const onDown = (e) => {
		if (e.key === 'Enter' && e.target.value.trim().length) {
			props.rename(props.name, e.target.value);
			setRenaming(false);
		} else if (e.key === 'Escape') {
			setRenaming(false);
		}
	};
	return (
		<div className='flex items-center justify-between  w-full hover:bg-gray-100' onClick={() => !renaming && props.select(props.name)}>
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
			{!props.create
				? (
					<div className='flex flex-row'>
						{
							!renaming && <div className='cursor-pointer px-1' title='Rename' onClick={(e) => {e.stopPropagation(); setRenaming(true);}}><RiEdit2Fill></RiEdit2Fill></div>
						}
						<div className='cursor-pointer px-1' title='Delete' onClick={(e) => {e.stopPropagation(); props.delete(props.name);}}><RiDeleteBin6Line color='#eb4034'></RiDeleteBin6Line></div>
					</div>
				)
				: null
			}
		</div>
	);
}