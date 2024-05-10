<script>
	import {PUBLIC_API_KEY} from '$env/static/public';
	import ImageTag from './ImageTag.svelte';

	export let url;
	export let id;
	export let tags;

	let scroller;
	const mouseIn = () => {
		if (scroller.scrollWidth === scroller.offsetWidth)
			return;
		scroller.style.marginLeft = - (scroller.scrollWidth - scroller.offsetWidth + 5) + 'px';
	}
	const mouseOut = () => {
		scroller.style.marginLeft = '';
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="image-card" id={id}>
	<div class="image-card-tools">
		<div></div>
		<div></div>
		<div></div>
	</div>
	<img src={`/api/images/poster/${id}`} alt={tags.join(', ')}>
	{#if tags.length}
		<div class="image-card-tags"  on:mouseenter={mouseIn} on:mouseleave={mouseOut}>
			<div class="backdrop"></div>
			<div class='scroller' bind:this={scroller}>
				{#each tags as tag}
					<ImageTag>{tag}</ImageTag>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.image-card {
		cursor: pointer;
		position: relative;
		width: 300px;
		height: 300px;
		border-radius: 15px;
		overflow: hidden;
		box-shadow: 0px 10px 20px #00000064;
		border: 1px solid #6262628a;
		& img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		}
	}
	.image-card-tags {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		transform: translateY(200%);
		transition: transform .3s ease;
		& .backdrop {
			position: absolute;
			bottom: 0;
			left: 0;
			height: 200%;
			width: 100%;
			background: linear-gradient(to top, #0004, transparent 60%);
		}
		& .scroller {
			padding: 5px;
			display: flex;
			justify-content: start;
			align-items: center;
			gap: 8px;
		}
		&:hover .scroller {
			transition: margin-left 3s linear;
		}
	}
	.image-card:hover {
		& .image-card-tags {
			transform: translateY(0);
		}
	}
</style>