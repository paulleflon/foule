import React from 'react';
import {createRef} from 'react';
import {RiDeleteBin6Line} from 'react-icons/ri';
import {AiOutlineCaretDown, AiOutlineCaretUp} from 'react-icons/ai';
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
		const mapped = filtered.map(c => <Category key={c} name={c} select={this.select.bind(this)} delete={this.delete.bind(this)}></Category>);
		return mapped.length ? mapped : <Category name={this.state.filter} create={true} select={this.select.bind(this)}></Category>;
	}

	render() {
		return (
			<div tabIndex={0}
				onFocus={() => this.setState({focused: true})}
				onBlur={this.onBlur.bind(this)}
				className={`${!this.state.focused ? 'rounded-b' : ''} z-10 category-select rounded-t w-60 inline-block relative filter drop-shadow-md bg-white`}
				ref={this.whole}>
				<div className='cursor-pointer selected-category font-title text-xl flex justify-between items-center w-full p-2'>
					<VscListSelection></VscListSelection>
					<div className='w-1/2 overflow-hidden overflow-ellipsis whitespace-nowrap text-center' title={this.props.selected}>{this.props.selected}</div>
					<AiOutlineCaretDown size='0.75em' className={`transition-all duration-200 ${this.state.focused ? 'transform rotate-180' : ''}`}></AiOutlineCaretDown>
				</div>
				<div className={`${!this.state.focused ? 'h-0' : ''} transition-all overflow-hidden absolute w-full bg-white rounded-b`}>
					<div className='p-2'>
						<input
							onBlur={e => {e.stopPropagation(); this.whole.current.focus();}}
							className='px-2 outline-none border-2 rounded-md focus:border-blue-400 text-lg transition-all duration-100'
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
	return (
		<div className='flex items-center justify-between  w-full hover:bg-gray-100' onClick={() => props.select(props.name)}>
			{
				props.name.length ?
					<div
						title={props.name}
						className='py-1 px-2 text-s cursor-pointer font-default overflow-ellipsis whitespace-nowrap overflow-hidden w-3/4 flex-grow'>
						{props.create ? 'Create category: ' : ''}
						<span className='font-bold'>{props.name}</span>
					</div>
					:
					<div className='py-1 px-2 text-s hover:bg-white font-default italic w-full'>Create a category...</div>
			}
			{!props.create
				? <div className='cursor-pointer px-1' title='Delete' onClick={(e) => {e.stopPropagation(); props.delete(props.name);}}><RiDeleteBin6Line color='#eb4034'></RiDeleteBin6Line></div>
				: null
			}
		</div>
	);
}