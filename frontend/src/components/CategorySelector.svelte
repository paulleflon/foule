<script>
	/* eslint-disable svelte/no-at-html-tags */
	import {post} from '$lib/api.js';
	import { tick } from 'svelte';
	import {Icon} from 'svelte-icons-pack';
	import {FaSolidBarsStaggered, FaSolidCaretDown, FaSolidCaretUp, FaSolidCheck, FaSolidPencil, FaSolidTrash, FaSolidPlus } from 'svelte-icons-pack/fa';

	export let selected;
	export let categories;

	let editing = null;
	let opened = false;
	let searchQuery = '';
	let renameValue;
	let renameInput;
	let to;

	$: {
		if (opened === false) {
			to = setTimeout(() => {
				editing = null;
				searchQuery = '';
			}, 200)
		} else {
			clearTimeout(to);
		}
	}

	const externalClick = e => {
		if (!e.target.classList.contains('category-selector'))
			opened = false;
	}

	const setEditing = async c => {
		editing = c;
		await tick();
		renameInput.value = c;
		renameInput.select();
	}

	const highlightSearch = (str, search) => {
		return str.replace(new RegExp(`(${search.trim()})`,'gi'),'<b>$1</b>');
	}

	const changeCategory = c => {
		selected = c;
		opened = false;
	}

	const createCategory = async () => {
			let name = searchQuery.trim();
			if (!name)
				return;
			let res = await post('/api/categories/create', {name});
			res = await res.json();
			if (res.ok) {
				categories.push(searchQuery);
				categories = categories;
				searchQuery = '';
			}
	}

	const deleteCategory = async name => {
		const confirmation = confirm(`Are you sure you want to delete ${name}?`);
		if (!confirmation)
			return;
		let res = await post('/api/categories/delete', {name});
		const {ok} = await res.json();
		if (ok)
			categories = categories.filter(c => c !== name);
		if (ok && name === selected)
			selected = categories[0];
	}

	const renameCategory = async name => {
		const newName = renameValue.trim();
		if (!newName || newName === name) {
			editing = null;
			return;
		}
		const res = await post('/api/categories/rename', {name, newName});
		const {ok} = await res.json();
		if (ok) {
			categories = categories.map(c => c === name ? newName : c);
			if (name === selected)
				selected = newName;
		}
		editing = null;
	}

</script>

<svelte:window on:click={externalClick} />


<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class={`category-selector ${opened ? 'opened' : ''}`} on:click|stopPropagation={() => null}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class='selection' on:click={() => opened = !opened}>
		<Icon src={FaSolidBarsStaggered}/>
		<span>{selected}</span>
		<Icon src={opened ? FaSolidCaretUp : FaSolidCaretDown} />
	</div>
	<div class='category-dropdown'>
		<input bind:value={searchQuery} type="text" class='category-search' placeholder="Search or create...">
		<div class="category-list">
			{#each categories as c}
				{#if c.toLowerCase().includes(searchQuery.toLocaleLowerCase().trim())}
					<div class="category">
						{#if editing === c}
							<input bind:this={renameInput} bind:value={renameValue} />
						{:else}
							<span on:click={() => changeCategory(c)}>
								{@html highlightSearch(c, searchQuery)}</span>
						{/if}
						<div class="actions">
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							{#if editing === c}
								<div class="confirm-edit" on:click={() => renameCategory(c)}>
									<Icon src={FaSolidCheck} color='#1bcf22'/>
								</div>
							{:else}
								<div class="edit" on:click={() => setEditing(c)}>
									<Icon src={FaSolidPencil} />
								</div>
							{/if}
							<div class="delete" on:click={() => deleteCategory(c)}>
								<Icon src={FaSolidTrash} color='#ff330f' />
							</div>
						</div>
					</div>
				{/if}
			{/each}
			{#if categories.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).length === 0}
				<div class='no-match' on:click={createCategory}>
					<div class="plus">
						<Icon src={FaSolidPlus} size={32} color='#aaa' />
					</div>
					<div class="sentence">
						Create category 
						<div>{searchQuery}</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.category-selector {
		box-sizing: border-box;
		width: 200px;
		display: flex;
		border-radius: 13px;
		max-height: 50px;
		flex-direction: column;
		border: 1px solid #fff;
		background: #fff4;
		backdrop-filter: blur(20px);
		color: white;
		overflow: hidden;
		transition: .2s ease;
		box-shadow: 0px 15px 10px #0003;
	}
	.category-selector.opened {
		background: white;
		color: black;
		max-height: 500px;
	}
	.category-selector.opened .category-dropdown {
		max-height: 200px;
	}

	.category-selector .selection {
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		font: 600 12pt 'Poppins';
		cursor: pointer;
		padding: 10px;
	}

	.category-dropdown {
		max-height: 0;
		transition: max-height .3s ease;
		display: flex;
		flex-direction: column;
	}

	.category-dropdown input {
		box-sizing: border-box;
		z-index: 3;
		appearance: none;
		border: 1px solid #eee;
		width: 90%;
		margin: 3px auto;
		border-radius: 4px;
		padding: 5px;
		font: 10pt 'Open Sans';
		outline: none !important;
		background-color: transparent;
		&:focus {
			border-color: #aaa;
		}
	}

	.category-dropdown .category-list {
		overflow-y: auto;
		flex: 1;
	}
	.category-dropdown .category {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 3px;
		&:hover {
			background: #eee;
		}
	}
	.category-dropdown .category span {
		cursor: pointer;
		width: 70%;
		padding: 8px 0;
		overflow: hidden;
		text-overflow: ellipsis;
		font: 11pt 'Open Sans';
		flex: 1;
	}

	.category-dropdown .category input {
		margin-right: 5px;
	}

	.category-dropdown .category .actions {
		display: flex;
		gap: 5px;
		& div {cursor: pointer;}
	}

	.category-dropdown .category + .category:after {
		content: '';
		position: absolute;
		width: 90%;
		height: 1px;
		background: #eee;
		top: 0;
		left: 5%;
	}
	.category-dropdown .no-match {
		position: relative;
		box-sizing: border-box;
		font: 12pt 'Open Sans';
		cursor: pointer;
		padding: 5px 2px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		width: 100%;
		overflow: hidden;
		&:hover {
			background-color: #eee;
		}
	}

	.category-dropdown .no-match .plus {
		position: relative;
		border: 4px solid #aaa;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 10px;
	}

	.category-dropdown .no-match .sentence div {
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		font: 600 12pt 'Poppins';
	}

</style>