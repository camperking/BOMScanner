<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { clickOutside } from "./clickOutside.js";
    import { modified } from "./stores.js";
    
    export let value: number | string = '';

    let node: HTMLElement;

    let editing = false;

    onMount(() => {
		node.addEventListener('outclick', () => (editing = false));
	});

    onDestroy(() => {
        document.removeEventListener('keydown', handleKeyDown);
    });

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            editing = false;
        }
    }

    function start_editing() {
        editing = true;
        $modified = true;
        document.addEventListener('keydown', handleKeyDown);
    }
</script>

{#if editing}
    <input bind:value use:clickOutside/>
{:else}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span bind:this={node} on:click={start_editing} class="empty">
        {value}
    </span>
{/if}

<style lang="postcss">
    input {
        @apply w-full;
    }
</style>
