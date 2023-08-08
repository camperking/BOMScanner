<script lang="ts">
    import { BaseDirectory, readDir, writeTextFile } from "@tauri-apps/api/fs";
    import { open } from "@tauri-apps/api/shell";
    import { onMount } from "svelte";
    import { devices } from "../../lib/stores";
    import { save } from "@tauri-apps/api/dialog";

    let num_unlabeled = 0;

    onMount(async () => {
        const files = await readDir("img/unlabeled", { dir: BaseDirectory.AppData });

        num_unlabeled = files.length;
    });

    async function save_classes() {
        const labels = [];

        // sort devices by class_id
        $devices.sort((a, b) => a.class_id - b.class_id);

        for (let device of $devices) {
            labels.push(device.text);
        }

        const file_string = labels.join("\n");

        const file_path = await save({
            defaultPath: "classes.txt",
            filters: [
                {
                    name: "Text file",
                    extensions: ["txt"],
                },
            ],
        });

        if (file_path) {
            await writeTextFile(file_path, file_string);
        }
    }

    
</script>


<h1>Label</h1>

<p>
    Labeling is the step to prepare the images for training. 
    It is done by drawing a bounding box around the object of interest and assigning a label to it. 
    The label is the name of the object that is being detected. 
    The bounding box is the area of the image that contains the object. 
    The bounding box is used to train the model to detect the object in the image.
</p>

<h2>Labeling with make-sense</h2>
<p>
    Start by opening <a href="#make-sense" on:click={() => open("http://10.232.56.56:3000/")}>make-sense</a>. 
    Load a package of presorted, unlabeled images from $APPDATA/net.xdevbox.bomscannergui/img/unlabeled. 
    There are currently <strong>{num_unlabeled}</strong> images available for labeling.
    When asked for a file with labels description, save classes.txt below and load it.
</p>

<p>
    <button on:click={save_classes}>Save labels description</button>
</p>

<p>
    Now you are ready for labeling. Draw bounding boxes and classify them. 
    When you are done, go to actions and export the annotations in yolov5 format. 
    Well done! Proceed to training if you think your dataset is big enough.
</p>
    
<style lang="postcss">

</style>