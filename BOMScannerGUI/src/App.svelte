<script lang="ts">
    import { onMount } from "svelte";
    import Nav from "./lib/Nav.svelte";
    import { currentView, load_stores } from "./lib/stores";
    import { ImgServer } from "./lib/img_server";
    import { BaseDirectory, createDir, exists } from "@tauri-apps/api/fs";

    const img_server = new ImgServer();

    onMount(async () => {
        await load_stores();

        // check for image dir
        // if not found, create it
        const img_dir = await exists("img", { dir: BaseDirectory.AppData });
        if (!img_dir) {
            await createDir("img", { dir: BaseDirectory.AppData });
        }

        await img_server.start();
    });


</script>

<div class="app-view">
    <Nav />
    <main class="container">
        <svelte:component this={$currentView} />
    </main>
</div>

<style lang="postcss">
    .app-view {
        @apply flex flex-row h-screen;
        /* @apply w-screen; */
    }

    .container {
        @apply flex flex-col flex-grow;
        @apply px-8 py-4;
    }
</style>
