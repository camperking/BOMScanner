import { Child, Command } from "@tauri-apps/api/shell";

export class ImgServer {
    private proc: Child;

    async start() {
        const command = new Command("img-server");
        this.proc = await command.spawn();
    }

    stop() {
        this.proc.kill();
    }
}