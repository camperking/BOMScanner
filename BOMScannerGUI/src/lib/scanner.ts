import { appDataDir } from "@tauri-apps/api/path";
import { Command, type Child } from "@tauri-apps/api/shell";

interface ScannerConfig {
    verbose: boolean;
    model_path: string;
    source: string | number;
    output_path: string;
}

interface Message {
    status: string;
    class_id?: number
    id?: number;
    identifiers?: string[];
    image?: string;
}

export interface Device {
    class_id: number;
    id: number;
    identifiers: string[];
}

export class Scanner {
    private ws: WebSocket;
    private proc: Child;
    private stream: Child;
    config: ScannerConfig;
    is_running: boolean;
    onEnd: () => void;

    constructor(config: ScannerConfig) {
        this.config = config;
        this.is_running = false;
    }

    async init() {
        this.is_running = true;
        // start rtmp stream
        const rtmp_cmd = new Command("rtmp-stream");
        this.stream = await rtmp_cmd.spawn();

        // const server_py = await appDataDir() + "bin/server.py";
        const server_py = "/home/campi/coding/ML/BOMScanner/BOMScannerService/server.py";

        const command = new Command("python", [server_py]);

        if (this.config.verbose) {
            command.on('close', data => {
                console.log(`command finished with code ${data.code} and signal ${data.signal}`)
            });
            command.on('error', error => console.error(`command error: "${error}"`));
            command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
            command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
        }

        this.proc = await command.spawn();
        
        // wait for the server to start
        await new Promise(resolve => setTimeout(resolve, 5000));

        this.ws = new WebSocket("ws://localhost:8000/");

        await new Promise<void>(resolve => {
            this.ws.onopen = function() {
                resolve();
            };
        });

        const server_config = {
            "command": "config",
            "args": [this.config]
        };

        this.ws.send(JSON.stringify(server_config));

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    stop() {
        if (!this.is_running) {
            return;
        }

        this.ws.close();
        this.proc.kill();
        this.stream.kill();
        this.is_running = false;
    }

    async scan(device_found: (object: Device) => void) {
        let ws = this.ws;
        let proc = this.proc;
        let stream = this.stream;
        let onEnd = this.onEnd;

        ws.onmessage = function(event) {
            let message: Message = JSON.parse(event.data);
            // handle the message here
            switch (message.status) {
                case "done":
                    ws.close();
                    proc.kill();
                    stream.kill();
                    onEnd();
                case "found":
                    device_found({
                        class_id: message.class_id,
                        id: message.id,
                        identifiers: message.identifiers
                    });                    
                    break;
                default:
                    break;
            }
        };

        const req = {
            "command": "start",
            "args": []
        }
        ws.send(JSON.stringify(req));


        this.ws.onclose = function() {
            console.log("Connection closed");
        };
    }

    async add_device(device_id: number) {
        this.ws.send(JSON.stringify({
            "command": "add_device",
            "args": [device_id]
        }));
    }
}