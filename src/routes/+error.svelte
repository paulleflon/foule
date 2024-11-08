<script>
	import {page} from '$app/stores';
</script>

<h1>
	{$page.status}
</h1>
<h2>{$page.error.message}</h2>

{#if $page.status === 404}
	<p>But you can go check out your other categories:</p>
	{#each $page.error.categories as category}
		<a href={`/${category}`}>{category}</a>
	{/each}
{/if}