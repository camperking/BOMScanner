<script lang="ts">
    import { open } from '@tauri-apps/api/dialog';
    import { readDir, type FileEntry, readBinaryFile, copyFile, BaseDirectory, exists, removeFile, createDir } from '@tauri-apps/api/fs';
    import { homeDir } from '@tauri-apps/api/path';

    interface Image extends FileEntry {
        exclude?: boolean;
    }

    let images: Image[] = [];

    async function loadImages() {
        // Open a selection dialog for directories
        const selected = await open({
            directory: true,
            defaultPath: await homeDir(),
        });

        if (Array.isArray(selected)) {
            // user selected multiple directories
        } else if (selected === null) {
            // user cancelled the selection
        } else {
            // user selected a single directory
            let entries = await readDir(selected);

            // filter .jpg and .jpeg files
            entries = entries.filter((entry) => {
                return entry.name.toLowerCase().endsWith('.jpg') || entry.name.toLowerCase().endsWith('.jpeg');
            });

            // check if import folder exists
            const importDir = await exists('img/import', { dir: BaseDirectory.AppData });
            if (!importDir) {
                // create import folder
                await createDir('img/import', { dir: BaseDirectory.AppData });
            }

            // clear import folder
            const importFiles = await readDir('img/import', { dir: BaseDirectory.AppData });
            for (let file of importFiles) {
                await removeFile(file.path);
            }

            // copy files to public folder
            for (let file of entries) {
                await copyFile(file.path, `img/import/${file.name}`, { dir: BaseDirectory.AppData });
            }

            images.push(...entries);

            images = images;
        }
    }

    async function importImages() {
        images = images.filter((image) => !image.exclude);

        // check if label folder exists
        const labelDir = await exists('img/unlabeled', { dir: BaseDirectory.AppData });
        if (!labelDir) {
            // create label folder
            await createDir('img/unlabeled', { dir: BaseDirectory.AppData });
        }

        // copy files to unlabeled folder
        for (let file of images) {
            await copyFile(`img/import/${file.name}`, `img/unlabeled/${file.name}`, { dir: BaseDirectory.AppData });
        }

        // clear import folder
        const importFiles = await readDir('img/import', { dir: BaseDirectory.AppData });
        for (let file of importFiles) {
            await removeFile(file.path);
        }

        images = [];
    }
</script>

<h1>1. Import images for training</h1>

<p>
    The first step is to load some images for labelling and sort bad images out.
    Hit the button below to load images.
</p>

<button on:click={loadImages}>Load images</button>

{#if images.length > 0}
    <p>
        {images.length} images loaded.
    </p>
{/if}
<div class="images">
    {#each images as image}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
            class:exclude={image.exclude}
            on:click={() => {
                image.exclude = !image.exclude;
            }}
            src="http://localhost:1421/import/{image.name}"
            alt="{image.name}" />
    {/each}
</div>

{#if images.length > 0}
    <button on:click={importImages}>Import selected images</button>
{/if}

<style lang="postcss">
    .images {
        @apply flex flex-row gap-4 flex-wrap;
    }

    img {
        @apply w-64 h-64;
        @apply object-cover cursor-pointer;
    }

    img.exclude {
        @apply opacity-50;
    }
</style>