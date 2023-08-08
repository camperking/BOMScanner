<script lang="ts">
    import { boms, currentBOM, currentView, modified } from "../lib/stores";
    import BOMEditor from "../views/BOMEditor.svelte";

    function edit_bom(selectedBOMIndex: number) {
        currentView.set(BOMEditor);
        currentBOM.set(selectedBOMIndex);
    }

    function new_bom() {
        boms.update(boms => {
            boms.push({
                name: "New BOM",
                items: []
            });
            $modified = true;
            return boms;
        });
    }

    function clone_bom(selectedBOMIndex: number) {
        boms.update(boms => {
            boms.push({
                name: boms[selectedBOMIndex].name + " (copy)",
                items: boms[selectedBOMIndex].items
            });
            $modified = true;
            return boms;
        });
    }

    function delete_bom(selectedBOMIndex: number) {
        boms.update(boms => {
            boms.splice(selectedBOMIndex, 1);
            $modified = true;
            return boms;
        });
    }

</script>

<h1>BOMs</h1>

<div class="list">
    <div class="list-header">
        <!-- <h2>Class</h2> -->
        <h2>Name</h2>
        <h2>Items</h2>
        <span></span>
    </div>
    {#each $boms as bom, i}
        <div class="list-row">
            <p class="list-row-item"><a href="#edit_bom" on:click={() => edit_bom(i)}>{bom.name}</a>
            </p>
            <p class="list-row-item">
                {bom.items.length}
            </p>
            <div class="list-row-action">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src="/copy.svg" alt="Copy" on:click={() => clone_bom(i)} />
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src="/trash-2.svg" alt="Delete" on:click={() => delete_bom(i)} />
            </div>
        </div>
    {/each}
</div>
<p>
    <button on:click={new_bom}> New BOM </button>
</p>

<!-- <button on:click={startScan}>Start Scan</button> -->

<style lang="postcss">
    .list-header, .list-row {
        grid-template-columns: auto 8rem 8rem;
    }

    a {
        @apply p-4;
    }
</style>