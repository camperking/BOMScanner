import asyncio
import json
import time
import cv2
from ultralytics import YOLO
from ocr import OCRThread
from track_crop import crop

async def bom_scanner(websocket, objects, objects_found, config):
    # load model

    # model = YOLO("/home/campi/coding/ML/BOMScanner/runs/detect/train4/weights/best.pt")
    # source="/home/campi/coding/ML/BOMScanner_testing/src/test.mp4"

    model = YOLO(config['model_path'])
    source = config['source']
    # source = cv2.VideoCapture(config['source'])

    results = model.track(source=source, tracker="botsort.yaml", verbose=False, stream=True, show=True)
    frame_counter_ocr = 0

    # process queue for ocr
    queue = []
    t = OCRThread(queue, websocket)
    t.start()

    outfile = config['output_path']
    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    writer = None

    for result in results:
        boxes = result.boxes 

        # get original image and shape
        orig_img = result.orig_img
        orig_shape = result.orig_shape

        if writer is None:
            fps = 30
            w = int(orig_shape[1])
            h = int(orig_shape[0])
            writer = cv2.VideoWriter(outfile, fourcc, fps, (w, h))

        writer.write(result.plot())
        # write to video file
        # outfile = "test.mp4"
        # if outfile:
        #     if result.frame_id == 0:
        #         fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        #         fps = result.cap.get(cv2.CAP_PROP_FPS)
        #         w = int(result.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        #         h = int(result.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        #         writer = cv2.VideoWriter(outfile, fourcc, fps, (w, h))
        #     writer.write(result.img0)

        # process every n frames
        frame_counter_ocr += 1
        if frame_counter_ocr % 4 != 0:
            continue
        frame_counter_ocr = 0

        for box in boxes:
            # print(f"Box ID: {box.id}")
            # box already found
            if box.id in objects_found:
                # print(f"Box {box.id} already found")
                continue

            # confidence threshold
            if box.conf < 0.98:
                continue
            
            good = True

            # check if box is already found
            if box.id in objects_found:
                continue

            # check if box is already in objects list
            for obj in objects:
                if obj['box_id'] == box.id:
                    obj['tries'] += 1
                    if obj['tries'] > 1:
                        good = False

            if good:
                cropped = crop(orig_img, orig_shape, box.xyxy)
                if cropped is None:
                    continue
                queue.append((cropped, int(box.cls), box.id))

        # wait for queue to finish
    await asyncio.sleep(1)

    # stop thread
    t.stop()

    await websocket.send(json.dumps({"status": "done"}))