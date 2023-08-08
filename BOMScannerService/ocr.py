import asyncio
import threading
import time
import json
from mmocr.apis import MMOCRInferencer

ocr = MMOCRInferencer(det='DBNet', rec='ABINet_Vision', device='cuda:0')

async def scanner(image, class_id, box_id, websocket):
        ocr_result = ocr(image)
        # identifiers = ' '.join(ocr_result['predictions'][0]['rec_texts']).lower()
        identifiers = ocr_result['predictions'][0]['rec_texts']

        response = {
            "status": "found",
            "class_id": int(class_id),
            "id": int(box_id),
            "identifiers": identifiers
        }

        await websocket.send(json.dumps(response))

async def process_queue(queue: list, websocket):
    if len(queue) > 0:
        (image, class_id, id) = queue.pop(0)
        await scanner(image, class_id, id, websocket)

class OCRThread(threading.Thread):
    def __init__(self, queue, websocket):
        threading.Thread.__init__(self)
        self.queue = queue
        self.websocket = websocket
        self._stop_event = threading.Event()

    def run(self):
        while not self._stop_event.is_set():
            asyncio.run(process_queue(self.queue, self.websocket))
            time.sleep(0.002)

    def stop(self):
        self._stop_event.set()