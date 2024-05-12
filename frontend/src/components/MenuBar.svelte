<script>
	import CategorySelector from './CategorySelector.svelte';
	import { Icon } from 'svelte-icons-pack';
	import { FaSolidMagnifyingGlass, FaSolidXmark } from 'svelte-icons-pack/fa';
	import ImageTag from './ImageTag.svelte';
	import { tick } from 'svelte';

	export let galleryFilters = [];
	export let selectedCategory;
	export let categories;

	let filterList;
	let filterContainer;
	let filterScrollX = 0;
	let searchValue;

	const filterScroll = (e) => {
		filterScrollX += e.deltaX || e.deltaY;

		const limit = filterList.scrollWidth - filterContainer.offsetWidth + 15;
		if (filterScrollX >= limit) filterScrollX = limit;
		if (filterScrollX <= 0) filterScrollX = 0;
	};

	$: {
		if (filterList) filterList.style.marginLeft = `-${filterScrollX}px`;
	}

	const searchKeydown = async (e) => {
		if (e.key === 'Enter') {
			const val = searchValue.trim();
			if (!val) return;
			if (!galleryFilters.includes(val)) galleryFilters.push(val);
			galleryFilters = galleryFilters;
			searchValue = '';
			await tick();
			filterScrollX = filterList.scrollWidth - filterContainer.offsetWidth + 15;
		}
		if (e.key === 'Backspace' && searchValue === '') {
			galleryFilters.pop();
			galleryFilters = galleryFilters;
			await tick();
			filterScrollX = filterList.scrollWidth - filterContainer.offsetWidth + 15;
		}
	};

	const removeFilter = async (name) => {
		galleryFilters = galleryFilters.filter((f) => f !== name);
		await tick();
		filterScrollX = filterList.scrollWidth - filterContainer.offsetWidth + 15;
	};

	const removeAllFilters = async () => {
		galleryFilters = [];
		await tick();
		filterScrollX = 0;
	};
</script>

<header>
	<div class="left">
		<h1>Foule</h1>
	</div>
	<div class="middle">
		<div
			class="filters-container"
			on:wheel|preventDefault={filterScroll}
			bind:this={filterContainer}
		>
			<div class="filter-list" bind:this={filterList}>
				{#each galleryFilters as filter}
					<ImageTag name={filter} on:close={() => removeFilter(filter)} />
				{/each}
			</div>
			{#if galleryFilters.length}
				<button on:click={removeAllFilters}>
					<Icon src={FaSolidXmark} />
					Close All
				</button>
			{/if}
		</div>
		<div class="input">
			<input placeholder="Filter by tags..." on:keydown={searchKeydown} bind:value={searchValue} />
			<button class="icon">
				<Icon src={FaSolidMagnifyingGlass} color="#ffffff" size={16} />
			</button>
		</div>
		<div class="gallery-parameters"></div>
	</div>
	<div class="right">
		<div>
			<CategorySelector bind:selectedCategory bind:categories />
		</div>
	</div>
</header>

<style>
	header {
		z-index: 1000;
		position: sticky;
		top: 20px;
		width: 80%;
		display: flex;
		height: 90px;
		margin: 20px auto;
		gap: 10px;
		border-radius: 23px;
		padding: 0 15px;
		background: #00000050;
		border: 1px solid #ffffff40;
		backdrop-filter: blur(16px);
		box-shadow: 0 10px 10px #00000040;
		& > div {
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		& .right {
			width: 200px;
		}

		& .left {
			justify-content: left;
			& h1 {
				font: 800 25pt 'Poppins';
			}
		}

		& .middle {
			display: flex;
			justify-content: center;
			align-items: center;
			flex: 1;
			gap: 10px;

			& .filters-container {
				width: 250px;
				height: 100%;
				padding-left: 10px;
				mask: linear-gradient(
					to right,
					rgba(0, 0, 0, 0) 0%,
					rgba(0, 0, 0, 0.4) 1%,
					rgba(0, 0, 0, 1) 3%,
					rgba(0, 0, 0, 1) 93%,
					rgba(0, 0, 0, 0.4) 97%,
					rgba(0, 0, 0, 0) 100%
				);
				& .filter-list {
					height: 100%;
					width: 100%;
					display: flex;
					gap: 5px;
					align-items: center;
				}
				& > button {
					position: absolute;
					bottom: 8px;
					left: 50%;
					transform: translate(-50%, -100%);
					display: flex;
					justify-content: center;
					align-items: center;
					background: none;
					border: none;
					color: inherit;
					cursor: pointer;
					padding: 0;
					gap: 5px;
					opacity: 0;
					transition: 0.1s ease;
					&:hover:after {
						opacity: 1;
					}
					&:after {
						/* Not using text-decoration because the svg would not be underlined */
						content: '';
						position: absolute;
						width: 100%;
						height: 1px;
						background: #fff;
						bottom: -1px;
						left: 0;
						opacity: 0;
					}
				}
				&:hover > button {
					transform: translate(-50%, 0);
					opacity: 0.7;
				}
			}

			& .gallery-parameters {
				width: 250px;
				border: 2px dashed deeppink;
				height: 40px;
			}

			& .input {
				width: 50%;
				display: flex;
				align-items: center;
				& input {
					appearance: none;
					width: 100%;
					height: 40px;
					background: #00000010;
					border: 1px solid #ffffff40;
					border-right: none;
					padding: 10px;
					border-radius: 10em 0 0 10em;
					color: #ffffffbb;
					outline: none;
					font-size: 12pt;
				}
				& .icon {
					height: 40px;
					display: flex;
					align-items: center;
					justify-content: center;
					padding-left: 2px;
					width: 45px;
					background: #00000030;
					border: 1px solid #ffffff40;
					border-collapse: collapse;
					border-radius: 0 10em 10em 0;
					cursor: pointer;
				}
			}
		}

		& .right > div {
			top: 20px;
			position: absolute;
		}
	}
</style>
