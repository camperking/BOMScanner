<script lang="ts">
    import { open } from "@tauri-apps/api/dialog";
    import { BaseDirectory, copyFile, createDir, exists, readBinaryFile, readDir, removeFile, writeTextFile } from "@tauri-apps/api/fs";
    import * as zip from "@zip.js/zip.js";

    async function load_labels() {
        const files = await open({
            multiple: false,
            filters: [
                { name: "Zip", extensions: ["zip"] },
            ],
        });

        if (Array.isArray(files)) {
            // user selected multiple files
        } else if (files === null) {
            // user cancelled the selection
        } else {
            // user selected a single file
            const zip_file = await readBinaryFile(files);
            console.log(zip_file);
            const zipFileReader = new zip.Uint8ArrayReader(zip_file);
            const zipReader = new zip.ZipReader(zipFileReader);
            const entries = await zipReader.getEntries();
            console.log(entries);

            for (let entry of entries) {
                const text = await entry.getData(new zip.TextWriter());
                let txt_filename = entry.filename;

                // find corresponding image in unlabeled folder
                const img_files = await readDir("img/unlabeled", {
                    dir: BaseDirectory.AppData,
                });
                const img_file = img_files.find((file) => {
                    // remove .txt from the end of name
                    txt_filename = txt_filename.split(".")[0];

                    // remove .jpg from the end of file.name
                    const img_filename = file.name.split(".")[0];

                    console.log(img_filename, txt_filename);                    
                    
                    return img_filename === txt_filename;
                });

                if (!img_file) {
                    continue;
                }

                // check if directory exists
                const imgTrainDir = await exists("dataset/images/train", {
                    dir: BaseDirectory.AppData,
                });
                if (!imgTrainDir) {
                    // create directory
                    await createDir("dataset/images/train", {
                        dir: BaseDirectory.AppData,
                        recursive: true,
                    });
                }

                const labelTrainDir = await exists("dataset/labels/train", {
                    dir: BaseDirectory.AppData,
                });
                if (!labelTrainDir) {
                    // create directory
                    await createDir("dataset/labels/train", {
                        dir: BaseDirectory.AppData,
                        recursive: true,
                    });
                }

                // move image to labeled folder
                await copyFile(img_file.path, `dataset/images/train/${img_file.name}`, {
                    dir: BaseDirectory.AppData,
                });

                // remove image from unlabeled folder
                await removeFile(`img/unlabeled/${img_file.name}`, { dir: BaseDirectory.AppData });

                // write label file
                await writeTextFile(
                    `dataset/labels/train/${txt_filename}.txt`,
                    text,
                    { dir: BaseDirectory.AppData }
                );
            }
        }
    }
</script>

<h1>Training</h1>

<p>
    For the training we have to create a dataset. You have imported images and labeled them. 
    Load the zip files with the labels from make-sense. 
</p>

<p>
    <button on:click={load_labels}>Load</button>
</p>

<p>
    The training can now begin. There are different parameters that influence training. 
    The most important ones are the number of epochs and the size of your dataset. 
    Training can take a long time and can't be resumed when interrupted.
</p>

<p>
    <button on:click={load_labels}>Train</button>
</p>