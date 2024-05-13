<script>
	import MenuBar from '../../components/MenuBar.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import ImageCard from '../../components/ImageCard.svelte';
	import { page } from '$app/stores';

	export let data;

	let categories = data.categories,
		selectedCategory = data.selectedCategory,
		galleryFilters = data.galleryFilters,
		images;

	$: images = data.images;

	$: {
		if (browser) goto(`/${selectedCategory}`);
	}

	$: {
		if (browser) {
			if (galleryFilters.length) {
				let query = new URLSearchParams($page.url.searchParams);
				query.set('s', galleryFilters.join(','));
				goto(`?${query}`, { keepFocus: true });
			} else {
				goto($page.url.pathname, { keepFocus: true });
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
		{#each images as image}
			<ImageCard id={image.id} url={image.url} tags={image.tags} />
		{/each}
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

	section {
		width: 85%;
		margin: 20px auto;
		display: flex;
		justify-content: left;
		flex-wrap: wrap;
		gap: 10px;
	}
</style>
