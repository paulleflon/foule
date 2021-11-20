import React, {createRef} from 'react';
import {MdClose} from 'react-icons/md';
import axios from 'axios';

class ImageAdder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			images: [],
			tags: [],
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

	onTagDown(e) {
		if (!this.inputs.tags.current.value.trim() && e.code === 'Backspace') {
			this.removeTag(this.state.tags.length - 1);
		}
		// Timeout to have the input value with this keydown taken into account.
		// We don't want this for Backspace though
		setTimeout(() => {
			const input = this.inputs.tags.current;
			let value = this.inputs.tags.current.value.trim();
			if (e.code === 'Comma')
				value = value.substring(0, value.length - 1);
			if (e.code === 'Enter' || e.code === 'Comma') {
				if (value)
					this.setState({tags: [...this.state.tags, value]});
				input.value = '';
				input.focus();
			}
		});
	}

	removeTag(i) {
		const updated = [...this.state.tags.slice(0, i), ...this.state.tags.slice(i + 1)];
		this.setState({tags: updated});
	}

	send() {
		console.log(process.env.REACT_APP_API);
		console.log(this.inputs.category);
		axios.post(`${process.env.REACT_APP_API}/images/add`, {images: this.state.images, tags: this.state.tags, category: this.inputs.category.current.value})
			.then(response => {
				if (response.status === 200) {
					// To fill when the rest of the interface is completed
				} else {
					// Must get rid of all alert for better warning notifications.
					alert('An error occured: see console for more infos.');
					console.error(response.data.error);
				}
			});
	}

	render() {
		return (
			<div className='image-adder-container fixed w-full h-full flex justify-center items-center'>
				<div className='image-adder filter drop-shadow-lg bg-gray-800 md:w-1/2 h-5/6 md:h-2/3 w-5/6 rounded-lg p-4 overflow-hidden'>
					<div className='image-adder uploader'>
						<div className='image-adder-tab-title font-title text-4xl text-white py-4 px-2'>Add images</div>
						<div className='added-images my-4 overflow-y-auto max-h-32'>
							{
								this.state.images.map((e, i) =>
									<div className='flex text-white' key={`image-${i}`}>
										<span className='inline-block w-3/4 overflow-ellipsis overflow-hidden whitespace-nowrap'>{e.url}</span>
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
					<div className='image-adder-metadata'>
						<div className='image-adder-tab-title font-title text-4xl text-white py-4 px-2'>Set metadata</div>
						<div className='font-title text-xl text-white'>Tags</div>
						<div className='tags flex items-center flex-wrap w-100% overflow-auto p-2 max-h-32'>
							{
								this.state.tags.map((l, i) =>
									<div className='flex bg-green-400 px-1 py-1 mr-1 rounded-sm filter drop-shadow-md mt-2' key={`image-${i}`}>
										<div className='max-w-xxs overflow-ellipsis overflow-hidden whitespace-nowrap'>{l}</div>
										<div className='ml-2 cursor-pointer' onClick={this.removeTag.bind(this, i)}><MdClose size='1.5em'></MdClose></div>
									</div>
								)}
							<input type='text' placeholder='Tag' className='font-default text-xl border-none h-8 px-2 block mt-2' onKeyDown={this.onTagDown.bind(this)} ref={this.inputs.tags} />
						</div>
						<div className='font-title text-xl text-white'>Category</div>
						<select ref={this.inputs.category}>
							<option className='font-bold' disabled>Select a category</option>
							{this.props.categories.map(c => <option>{c}</option>)}
						</select>
					</div>
					<button className='font-title text-xl text-white absolute bottom-4 right-4 border-2 border-white rounded-full px-4 py-1 hover:bg-white hover:bg-opacity-20 transition-all' onClick={this.send.bind(this)}>Send</button>
				</div>
			</div>
		);
	}
}
export default ImageAdder;