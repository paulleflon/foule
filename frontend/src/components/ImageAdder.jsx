import React, {createRef} from 'react';
import {MdClose} from 'react-icons/md';
import axios from 'axios';
import TagsEditor from './TagsEditor';

class ImageAdder extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props);
		this.state = {
			images: [],
			tags: this.props.editing ? this.props.editing.tags : [],
		};
		this.inputs = {
			src: createRef(),
			tags: createRef(),
			category: createRef()
		};
	}

	addImage(type) {
		const value = this.inputs.src.current.value;
		if (!value.trim().length)
			return;
		try {
			new URL(value);
		} catch (_) {
			alert('Invalid URL.');
			return;
		}
		if (type === 'image') {
			const img = new Image();
			img.src = value;
			img.onerror = () => {
				alert('Couldnt load image.');
			};
			img.onload = () => {
				const entry = {
					url: value,
					width: img.width,
					height: img.height,
					type: 'image'
				};
				this.setState({images: [...this.state.images, entry]});
				this.inputs.src.current.value = '';
				this.inputs.src.current.focus();
			};
		} else {
			const vid = document.createElement('video');
			vid.src = value;
			vid.onerror = () => {
				alert('Couldnt load video.');
			};
			vid.oncanplaythrough = () => {
				const entry = {
					url: value,
					width: vid.videoWidth,
					height: vid.videoHeight,
					type: 'video'
				};
				this.setState({images: [...this.state.images, entry]});
				this.inputs.src.current.value = '';
				this.inputs.src.current.focus();
			};
		}
	}

	removeImage(i) {
		const updated = [...this.state.images.slice(0, i), ...this.state.images.slice(i + 1)];
		this.setState({images: updated});
	}

	updateTags(tags) {
		this.setState({tags});
	}

	send() {
		axios.post(`${process.env.REACT_APP_API}/images/add`, {images: this.state.images, tags: this.state.tags, category: this.inputs.category.current.value})
			.then(response => {
				if (response.status === 200) {
					this.props.addImportedImages(response.data, this.inputs.category.current.value);
				} else {
					// Must get rid of all alert for better warning notifications.
					alert('An error occured: see console for more infos.');
					console.error(response.data.error);
				}
			});
	}

	edit() {
		const category = this.inputs.category.current.value;
		this.props.edit(this.state.tags, category !== this.props.editing.category ? category : undefined);
	}

	render() {
		return (
			<div className='z-50 image-adder-container fixed w-full h-full flex justify-center items-center bg-black bg-opacity-50'>
				<div className='relative image-adder shadow-xl bg-gray-800 md:w-1/2 h-5/6 md:h-2/3 w-5/6 rounded-lg p-4 overflow-hidden'>
					<MdClose
						className='absolute top-0 right-0 m-2 rounded-full cursor-pointer hover:bg-white hover:bg-opacity-25 p-2 transition-all duration-100'
						size={40}
						color='#ffffff'
						onClick={() => this.props.close()}
					></MdClose>
					{!this.props.editing &&
						<div className='image-adder uploader'>
							<div className='image-adder-tab-title font-title text-4xl text-white py-4 px-2'>Add images</div>
							<div className='added-images my-4 overflow-y-auto max-h-32'>
								{
									this.state.images.map((e, i) =>
										<div className='flex text-white' key={`image-${i}`}>
											<span className='inline-block w-3/4 truncate'>{e.url}</span>
											<span className='mx-2 cursor-pointer' onClick={this.removeImage.bind(this, i)}><MdClose size='1.5em'></MdClose></span>
										</div>
									)}
							</div>
							<div className='input-group flex'>
								<input type='text' placeholder='Image/Video URL' className='font-default text-xl border-none h-8 px-2 w-1/2 rounded-none' ref={this.inputs.src} />
								<button className='bg-white h-8 border-l px-2 border-black' onClick={this.addImage.bind(this, 'image')}>Add</button>
								<button className='bg-white h-8 border-l px-2 border-black' onClick={this.addImage.bind(this, 'video')}>Add Video</button>
							</div>
						</div>
					}
					<div className='image-adder-metadata'>
						<div className='image-adder-tab-title font-title text-4xl text-white py-4 px-2'>{this.props.editing ? 'Edit entry' : 'Set metadata'}</div>
						<div className='font-title text-xl text-white'>Tags</div>
						<TagsEditor tags={this.state.tags} updateTags={this.updateTags.bind(this)} />
						<div className='font-title text-xl text-white'>Category</div>
						<select ref={this.inputs.category}>
							<option className='font-bold' disabled>Select a category</option>
							{this.props.categories.map(c => <option key={c}>{c}</option>)}
						</select>
					</div>
					<div className='absolute bottom-0 right-0 m-2 '>
						{
							this.props.editing &&
							<button className='font-title text-xl text-red-500 border-2 border-red-500 rounded-full px-4 py-1 hover:bg-red-800 hover:bg-opacity-25 duration-200 transition-all' onClick={this.props.delete}>Delete</button>

						}
						<button
							className='font-title text-xl text-white border-2 border-white rounded-full px-4 py-1 ml-4 hover:bg-white hover:bg-opacity-25 duration-200 transition-all'
							onClick={this.props.editing ? this.edit.bind(this) : this.send.bind(this)}>
							{this.props.editing ? 'Save' : 'Send'}
						</button>
					</div>
				</div>
			</div>
		);
	}
}
export default ImageAdder;