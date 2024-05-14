<script>
	import MenuBar from '../../components/MenuBar.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import ImageCard from '../../components/ImageCard.svelte';
	import { page } from '$app/stores';
	import CategorySelector from '../../components/CategorySelector.svelte';
	import { FaSolidXmark } from 'svelte-icons-pack/fa';
	import { Icon } from 'svelte-icons-pack';

	export let data;

	let categories = data.categories,
		selectedCategory = data.selectedCategory,
		galleryFilters = data.galleryFilters,
		images;

	let notFoundGif = ['weekend', 'travolta'][Math.floor(Math.random() * 2)];

	$: images = data.images;

	$: displayedImages = images.filter(
		(img) => !galleryFilters.length || galleryFilters.some((f) => img.tags.includes(f))
	);

	$: {
		if (browser) {
			if (galleryFilters.length) {
				let query = new URLSearchParams($page.url.searchParams);
				query.set('s', galleryFilters.join(','));
				goto(`/${selectedCategory}?${query}`, { keepFocus: true });
			} else {
				goto(`/${selectedCategory}`, { keepFocus: true });
			}
		}
	}
</script>

{#key selectedCategory}
	<MenuBar bind:categories bind:selectedCategory bind:galleryFilters />
	<h1>
		{selectedCategory} gallery
	</h1>
	<section>
		{#if displayedImages.length}
			<div class="gallery">
				{#each displayedImages as image}
					<ImageCard id={image.id} tags={image.tags} />
				{/each}
			</div>
		{:else}
			<div class="not-found">
				<img src={`/img/${notFoundGif}.gif`} alt="Not found gif" />
				<p>Nothing to see here xD</p>
				<p>You could try</p>
				<div class="options">
					<div class="option">
						<h2>Another category</h2>
						<div class="absolute">
							<CategorySelector bind:selectedCategory bind:categories />
						</div>
					</div>
					{#if galleryFilters.length}
						<div class="separator"></div>
						<div class="option">
							<h2>Removing filters</h2>
							<button on:click={() => (galleryFilters = [])}>
								<Icon src={FaSolidXmark} />
								<span>Clear filters</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</section>
{/key}

<style>
	:global(body) {
		background: rgb(17 24 39);
		color: #fff5ea;
		margin: 0;
		height: 200vh;
	}
	:global(*) {
		position: relative;
		box-sizing: border-box;
	}

	h1 {
		font: 600 25pt 'Poppins';
		text-align: center;
		margin: 30px auto;
	}
	section {
		width: 85%;
		margin: 20px auto;
		& .gallery {
			display: flex;
			justify-content: left;
			flex-wrap: wrap;
			gap: 10px;
		}
	}
	.not-found {
		display: flex;
		flex-direction: column;
		align-items: center;
		& img {
			width: 50%;
			border-radius: 10px;
		}
		& p {
			text-align: center;
			font: 16pt 'Poppins';
			margin: 5px 0;
		}
		& .options {
			display: flex;
			gap: 20px;
			align-items: start;
			& .option {
				width: 200px;
				text-align: center;
			}
			& h2 {
				margin-top: 0;
				font: 600 14pt 'Poppins';
				text-align: center;
			}
			& .absolute {
				position: absolute;
				left: 0;
			}
			& .separator {
				width: 1px;
				height: 100px;
				background: #ffffff40;
				align-self: center;
				&:after {
					content: 'or';
					position: absolute;
					background: rgb(17 24 39);
					font: 12pt 'Open Sans';
					top: 50%;
					transform: translate(-50%, -50%);
					left: 0;
				}
			}
			& button {
				appearance: none;
				display: flex;
				width: 100%;
				align-items: center;
				justify-content: center;
				border: none;
				margin: 20px 0;
				cursor: pointer;
				background: none;
				color: #ffffff80;
				gap: 5px;
				&:hover {
					text-decoration: underline;
				}
			}
		}
	}
</style>
