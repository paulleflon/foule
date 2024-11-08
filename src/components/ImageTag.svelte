<script>
	import { Icon } from 'svelte-icons-pack';
	import { FaSolidXmark } from 'svelte-icons-pack/fa';
	import { createEventDispatcher } from 'svelte';

	export let name;
	export let closable = true;

	const dispatch = createEventDispatcher();
</script>

<div>
	{name}
	{#if closable}
		<button on:click={() => dispatch('close')}>
			<Icon src={FaSolidXmark} size={16} color="#ffffff" />
		</button>
	{/if}
</div>

<style>
	div {
		background: #ffffff40;
		padding: 3px 7px;
		border: 1px solid #ffffff;
		border-radius: 10em;
		display: flex;
		align-items: center;
		gap: 5px;
		font: 11pt 'Open Sans';
		white-space: nowrap;
		& button {
			appearance: none;
			background: none;
			border: none;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0;
			cursor: pointer;
		}
	}
</style>
