import { BaseDirectory, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { get, writable, type Writable } from "svelte/store";

import Main from '../views/Main.svelte';

export const currentView = writable(Main);

export const currentBOM = writable(0);

export const modified = writable(false);

interface Device {
    class_id: number;
    image: string;
    text: string;
    name: string;
    bom_identifier: string;
    removed?: boolean;
}

export interface BOMItem {
    class_id: number;
    identifiers: string[];
    text: string;
    found?: boolean;
    dev_identifier: string;
}

export interface BOM {
    name: string;
    items: BOMItem[];
    scanned_at?: Date;
}

export async function load_stores() {
    if (await exists("devices.json", { dir: BaseDirectory.AppData })) {
        const devices_json = await readTextFile("devices.json", { dir: BaseDirectory.AppData });
        const loaded_devices: Device[] = JSON.parse(devices_json);
    
        devices.set(loaded_devices);
    }

    if (await exists("bom.json", { dir: BaseDirectory.AppData })) {
        const bom_json = await readTextFile("bom.json", { dir: BaseDirectory.AppData });
        const loaded_bom: BOM[] = JSON.parse(bom_json);
    
        boms.set(loaded_bom);
    }
        

}

export async function save_stores() {
    const devices_json = JSON.stringify(get(devices));
    await writeTextFile("devices.json", devices_json, { dir: BaseDirectory.AppData });

    const bom_json = JSON.stringify(get(boms));
    await writeTextFile("bom.json", bom_json, { dir: BaseDirectory.AppData });
}

export const devices: Writable<Device[]> = writable([
    {
        class_id: 0,
        image: "",
        text: "2 pole circuit breaker",
        name: "S202M",
        bom_identifier: "123123123"
    },
    {
        class_id: 1,
        image: "",
        text: "3 pole circuit breaker",
        name: "S203M",
        bom_identifier: "321321321"
    },
]);

export const boms: Writable<BOM[]> = writable([
    {
        name: "test BOM",
        items: [
    {
        "class_id": 0,
        "identifiers": ["Q29", "C1"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q30", "C1"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q31", "C1"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q32", "B10"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q33", "B10"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q34", "B10"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q35", "B13"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q36", "B10"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q37", "B10"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q38", "C2"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q39", "C2"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 0,
        "identifiers": ["Q40", "C2"],
        "text": "S202M",
        "dev_identifier": "123123123"
    },
    {
        "class_id": 1,
        "identifiers": ["F42", "C2"],
        "text": "S203M",
        "dev_identifier": "321321321"
    }
]}]);