<script lang="ts">
    import Editable from "../lib/Editable.svelte";
    import Scanner from "./Scanner.svelte";
    import { boms, currentBOM, currentView, modified } from "../lib/stores";

    function new_bom_item() {
        boms.update(boms => {
            boms[$currentBOM].items.push({
                class_id: 0,
                text: "New Item",
                identifiers: [""],
                dev_identifier: ""
            });
            $modified = true;
            return boms;
        });
    }

    function clone_bom_item(selectedBOMItemIndex: number) {
        boms.update(boms => {
            boms[$currentBOM].items.push({
                class_id: boms[$currentBOM].items[selectedBOMItemIndex].class_id,
                text: boms[$currentBOM].items[selectedBOMItemIndex].text + " (copy)",
                identifiers: boms[$currentBOM].items[selectedBOMItemIndex].identifiers,
                dev_identifier: boms[$currentBOM].items[selectedBOMItemIndex].dev_identifier
            });
            $modified = true;
            return boms;
        });
    }

    function delete_bom_item(selectedBOMItemIndex: number) {
        boms.update(boms => {
            boms[$currentBOM].items.splice(selectedBOMItemIndex, 1);
            $modified = true;
            return boms;
        });
    }

    function add_identifier(selectedBOMItemIndex: number) {
        boms.update(boms => {
            boms[$currentBOM].items[selectedBOMItemIndex].identifiers.push("123");
            $modified = true;
            return boms;
        });
    }

    function delete_identifier(selectedBOMItemIndex: number, selectedIdentifierIndex: number) {
        boms.update(boms => {
            boms[$currentBOM].items[selectedBOMItemIndex].identifiers.splice(selectedIdentifierIndex, 1);
            $modified = true;
            return boms;
        });
    }

    function toScanner() {
        currentView.set(Scanner);
    }
</script>

<h1>BOM Editor</h1>

<p>
    <button on:click={toScanner}>Scan</button>
</p>

<h2>Name: <Editable bind:value={$boms[$currentBOM].name} /></h2>

<div class="list">
    <div class="list-header">
        <h2>DEV ID</h2>
        <h2>Text</h2>
        <h2>Identifiers</h2>
        <span></span>
    </div>
    {#each $boms[$currentBOM].items as item, i}
        <div class="list-row">
            <p class="list-row-item class-id">
                <Editable bind:value={item.dev_identifier} />
            </p>
            <p class="list-row-item">
                <Editable bind:value={item.text} />
            </p>
            <p class="list-row-item">
                {#each item.identifiers as identifier, n}
                    <div class="identifiers">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <img src="/trash-2_16.svg" alt="Delete" on:click={() => delete_identifier(i, n)} />
                        <Editable bind:value={identifier} />
                    </div>
                {/each}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src="/plus-circle_16.svg" alt="Add" on:click={() => add_identifier(i)}>
            </p>
            <div class="list-row-action">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src="/copy.svg" alt="Copy" on:click={() => clone_bom_item(i)} />
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src="/trash-2.svg" alt="Delete" on:click={() => delete_bom_item(i)} />
            </div>
        </div>
    {/each}
</div>
<p>
    <button on:click={new_bom_item}>New Item</button>
</p>

<style lang="postcss">

    .list-header, .list-row {
        grid-template-columns: 10rem auto 12rem 8rem;
    }

    .identifiers {
        @apply flex gap-2;
    }
</style>