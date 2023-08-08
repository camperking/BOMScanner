

import torch


def crop(orig_img, orig_shape, xyxy):
    y1 = int(xyxy[0][1])
    y2 = int(xyxy[0][3])
    x1 = int(xyxy[0][0])
    x2 = int(xyxy[0][2])

    # reshape tensor to 2d
    orig_img = torch.reshape(torch.tensor(orig_img), (orig_shape[0], orig_shape[1], 3))

    # crop image
    crop = orig_img[y1:y2, x1:x2].numpy()

    # skip if crop is empty
    if crop.size == 0:
        return None
    
    return crop