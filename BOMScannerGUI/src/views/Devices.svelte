<script lang="ts">
    import { devices, modified } from "../lib/stores";
    import { open } from "@tauri-apps/api/dialog";
    import Editable from "../lib/Editable.svelte";
    import { BaseDirectory, copyFile, createDir, exists } from "@tauri-apps/api/fs";


    let show_removed = false;

    function add_device() {
        devices.update((devices) => {
            devices.push({
                class_id: devices.length,
                name: "New Device",
                text: "New Device",
                bom_identifier: "New Device",
                image: "",
            });
            return devices;
        });
        $modified = true;
    }

    function remove_device(i) {
        devices.update((devices) => {
            devices[i].removed = true;
            return devices;
        });
        $modified = true;
    }

    function restore_device(i) {
        devices.update((devices) => {
            devices[i].removed = false;
            return devices;
        });
        $modified = true;
    }

    async function change_image(i: number) {
        const files = await open({
            multiple: false,
            filters: [
                { name: "Jpeg", extensions: ["jpg", "jpeg"] },
            ],
        });

        if (Array.isArray(files)) {
            // user selected multiple files
        } else if (files === null) {
            // user cancelled the selection
        } else {
            // user selected a single file

            // check if directory exists
            const imgDir = await exists("img/devices", {
                dir: BaseDirectory.AppData,
            });
            if (!imgDir) {
                // create directory
                await createDir("img/devices", {
                    dir: BaseDirectory.AppData,
                    recursive: true,
                });
            }

            // move file to app data
            await copyFile(files, `img/devices/${i}.jpg`, {
                dir: BaseDirectory.AppData,
            });            

            devices.update((devices) => {
                devices[i].image = `devices/${i}.jpg`;
                return devices;
            });
            $modified = true;
        }
    }

</script>

<h1>Devices</h1>

<p>
    The device list is append only. You can show removed devices by checking the box below. 
    The BOM ID is used to match devices to BOM items. 
    This could be an inventory number, serial number, or other identifier. 
    The name is used in the labeling process to classify devices. 
    All other fields are optional. Edit them by clicking on the text.
</p>

<label>
    <input type="checkbox" bind:checked={show_removed} />
    Show Removed
</label>

<div class="list">
    <div class="list-header">
        <h2>Class</h2>
        <h2>Name</h2>
        <h2>Text</h2>
        <h2>BOM ID</h2>
        <h2>Image</h2>
        <span></span>
    </div>
    {#each $devices as device, i}
        {#if !device.removed || show_removed}
            <div class="list-row">
                <p class="list-row-item class-id">{device.class_id}</p>
                <p class="list-row-item">
                    <Editable bind:value={device.name} />
                </p>
                <p class="list-row-item">
                    <Editable bind:value={device.text} />
                </p>
                <p class="list-row-item">
                    <Editable bind:value={device.bom_identifier} />
                </p>
                <div class="list-row-item">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <img src={device.image ? `http://localhost:1421/devices/${i}.jpg`:''} alt={device.name} on:click={() => change_image(i)}>
                </div>
                <div class="list-row-action">
                    {#if device.removed}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <img src="/refresh-cw.svg" alt="Restore Device" on:click={() => restore_device(i)} />
                    {:else}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <img src="/trash-2.svg" alt="Remove Device" on:click={() => remove_device(i)} />
                    {/if}
                </div>
            </div>
        {/if}
    {/each}
</div>

<button on:click={add_device}>Add Device</button>


<style lang="postcss">    
    .list-header, .list-row {
        grid-template-columns: 5rem 8rem auto 8rem 10rem 4rem;
    }

    .class-id {
        @apply text-xl font-bold;
    }

    .list-row-item img {
        @apply w-32 h-32;
        @apply object-cover;
    }
</style>
