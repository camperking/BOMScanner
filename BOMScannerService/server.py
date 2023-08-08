#!/usr/bin/env python

import asyncio
import json
import threading
from websockets.server import serve

from bom_scanner import bom_scanner


objects = []
objects_found = []
config = {}

def start_scanner(websocket, objects, objects_found, config):
    asyncio.run(bom_scanner(websocket, objects, objects_found, config))

async def echo(websocket):
    global objects_found
    global config
    async for message in websocket:
        data = json.loads(message)
        command = data['command']
        args = data['args']

        # switch case
        if command == "config":
            config = args[0]
            await websocket.send(json.dumps({"status": "configured"}))
        if command == "start":
            t = threading.Thread(target=start_scanner, args=(websocket, objects, objects_found, config))
            t.start()
        if command == "add_device":
            print(f"Adding device {args[0]}")
            objects_found.append(args[0])
            await websocket.send(json.dumps({"status": "added"}))
        else:
            await websocket.send(json.dumps({"status": "unknown command"}))

async def main():
    async with serve(echo, "localhost", 8000):
        await asyncio.Future()  # run forever

asyncio.run(main())