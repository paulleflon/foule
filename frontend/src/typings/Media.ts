/**
 * Data about a saved Media.
 */
export default interface Media {
	/**
	 * The category the image was saved under.
	 */
	category: string;
	/**
	 * The height of the image.
	 */
	height: number;
	/**
	 * The id of the media.
	 */
	id: string;
	/**
	 * The tags of the image.
	 */
	tags: string[];
	/**
	 * Whether the media is an image or a video.
	 */
	type: 'image' | 'video';
	/**
	 * The URL to the image file.
	 */
	url: string;
	/**
	 * The width of the image.
	 */
	width: number;
}