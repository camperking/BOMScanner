<script lang="ts">
    import Main from "../views/Main.svelte";
    import Scanner from "../views/Scanner.svelte";
    import BOMs from "../views/BOMs.svelte";
    import Devices from "../views/Devices.svelte";
    import Training from "../views/Training.svelte";
    import Import from "../views/Training/Import.svelte";
    import Label from "../views/Training/Label.svelte";
    import Train from "../views/Training/Train.svelte";

    import { currentView, modified, save_stores } from "./stores";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let showSaveButton = false;

    onMount(() => {
        modified.subscribe(value => {
            if (value === false) return;
            showSaveButton = value;
            setTimeout(() => {
                save();
            }, 5000);
        });
    });

    function save() {
        save_stores();
        showSaveButton = false;
        modified.set(false);
    }
</script>

<menu>
    <ul>
        <li
            class:active={$currentView === Main}
        ><a href="#main"
            on:click={() => currentView.set(Main)}
        >Main</a></li>

        <li
            class:active={$currentView === Scanner}
        ><a href="#scanner"
            on:click={() => currentView.set(Scanner)}
        >Scanner</a></li>

        <li
            class:active={$currentView === BOMs}
        ><a href="#boms"
            on:click={() => currentView.set(BOMs)}
        >BOMs</a></li>

        <li
            class:active={$currentView === Devices}
        ><a href="#devices"
            on:click={() => currentView.set(Devices)}
        >Devices</a></li>

        <li
            class:active={$currentView === Training}
        ><a href="#training"
            on:click={() => currentView.set(Training)}
        >Training</a></li>

        {#if $currentView === Training || $currentView === Import || $currentView === Label || $currentView === Train}
            <li
                class="training"
                class:active={$currentView === Import}
            ><a href="#train_import"
                on:click={() => currentView.set(Import)}
            >1. Import</a>
            </li>

            <li
                class="training"
                class:active={$currentView === Label}
            ><a href="#train_label"
                on:click={() => currentView.set(Label)}
            >2. Label</a>
            </li>

            <li
                class="training"
                class:active={$currentView === Train}
            ><a href="#train_train"
                on:click={() => currentView.set(Train)}
            >3. Train</a>
            </li>
        {/if}
    </ul>
    {#if showSaveButton}
        <button
            on:click={save}
            transition:fade
        >Save</button>
    {/if}
</menu>

<style lang="postcss">
    menu {
        @apply border-r-2 border-gray-200;
        @apply text-center;
    }

    ul {
        @apply text-left;
    }
      
    li {
        @apply text-xl font-bold;
        @apply px-4 py-4;
    }

    a {
        @apply px-4 py-4;
    }

    .active {
        @apply bg-gray-200;
    }

    .training {
        @apply text-base font-normal;
        @apply p-0 pl-6 py-2;
    }
</style>