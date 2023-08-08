<script lang="ts">
    import { get } from "svelte/store";
    import { Scanner, type Device } from "../lib/scanner.js";
    import { currentBOM, boms, type BOMItem, type BOM, save_stores } from "../lib/stores.js";
    import { onDestroy, onMount } from "svelte";
    import { BaseDirectory, appDataDir } from "@tauri-apps/api/path";
    import { createDir, exists } from "@tauri-apps/api/fs";

    const bom: BOM = $boms[get(currentBOM)];
    let BOMDisplay: BOM = {...bom};


    
    let scanner: Scanner;

    let scanner_running = false;

    async function startScan() {
        scanner_running = true;

        // const model_path = "/home/campi/coding/ML/BOMScanner/runs/detect/train4/weights/best.pt";
        const model_path = await appDataDir() + "models/best.pt";

        // check if output path exists
        const output_dir = await exists("scans", { dir: BaseDirectory.AppData });
        if (!output_dir) {
            // create output path
            await createDir("scans", { dir: BaseDirectory.AppData });
        }        
        const output_path = await appDataDir() + "scans/test.avi";

        const scanner_config = {
            verbose: true,
            model_path,
            source: "rtmp://10.232.56.91/live/stream",
            output_path,
        };

        scanner = new Scanner(scanner_config);

        // set all found to false
        bom.items.forEach((item: BOMItem) => {
            item.found = false;
        });

        BOMDisplay = {...bom};

        // initialize scanner
        await scanner.init();

        scanner.onEnd = function () {
            scanner_running = false;

            bom.scanned_at = new Date();

            boms.update((boms) => {
                boms[get(currentBOM)] = bom;
                return boms;
            });

            save_stores();
        };

        scanner.scan((device: Device) => {
            const { class_id, id, identifiers } = device;

            const found_device = bom.items.findIndex((bom: BOMItem) => {
                if (bom.class_id !== class_id)
                    return false;

                // check every identifier from bom against each identifier from scanner
                return bom.identifiers.every((id) => {
                    for (let i = 0; i < identifiers.length; i++) {
                        if (identifiers[i].includes(id.toLowerCase()))
                            return true;
                    }
                    return false;
                });                
            });

            if (found_device > -1) {
                // console.log(bom.items[found_device]);
                
                bom.items[found_device].found = true;
                BOMDisplay = {...bom};
                // report back device id to server so it won't be scanned again
                scanner.add_device(id);
            }
        });
    }

    function stopScan() {
        scanner.stop();
        scanner_running = false;
    }

    onDestroy(() => {
        if (scanner.is_running) scanner.stop();
    });
</script>


<main class="container">
    <h1>Scanner</h1>

    <p>
        <button
            on:click={startScan}
            disabled={scanner_running}
        >Start</button>
        <button
            on:click={stopScan}
            disabled={!scanner_running}
        >Stop</button>
    </p>

    <div class="scan-info">
        <h2>List name: <strong>{bom.name}</strong></h2>
        <h2>Last scan at: <strong>{bom.scanned_at}</strong></h2>
        <h2>Items: <strong>{bom.items.length}</strong></h2>
    </div>

    <div class="list">
        <div class="list-header">
            <h2>Class</h2>
            <h2>Text</h2>
            <h2>Identifiers</h2>
        </div>
        {#each BOMDisplay.items as item}
            <div class="list-row {item.found ? 'found' : ''}">
                <p class="list-row-item class-id">{item.class_id}</p>
                <p class="list-row-item">{item.text}</p>
                <p class="list-row-item">
                    {#each item.identifiers as identifier}
                        <span>{identifier}&nbsp;</span>
                    {/each}
                </p>
            </div>
        {/each}
    </div>
</main>

<style lang="postcss">
    .scan-info {
        @apply pb-4;
    }

    .list-header, .list-row {
        grid-template-columns: 6rem auto 16rem;
    }

    .class-id {
        @apply text-xl font-bold;
    }

    .found {
        @apply bg-green-200;
    }
</style>
