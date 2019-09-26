import numpy as np
from PIL import Image, ImageFilter

from preprocessing import PreproMode, crop

def attention_map_jpg(alphas, image=None, target_w=None, target_h=None):
    alphas = np.asarray(alphas).astype('uint8')
    att_map = Image.fromarray(alphas)

    if image is None:
        att_map = rescale_and_smooth(
            pil_image=att_map, 
            target_w=target_w, 
            target_h=target_h)
        return att_map
    
    #pil_img = Image.fromarray(image.astype('uint8'), 'RGB')
    pil_img = image
    target_w = target_w if target_w else pil_img.width
    target_h = target_h if target_h else pil_img.height
    att_map = rescale_and_smooth(att_map, target_w, target_h)

    return apply_attention_mask(pil_img, att_map)


def rescale_and_smooth(pil_image, target_w=224, target_h=224, smooth=True):
    """Returns the original image rescaled
    and smoothened by a Gaussian filter
    """

    w = pil_image.width
    h = pil_image.height
    n_img = pil_image.resize((target_w, target_h))
    n_img = n_img.filter(ImageFilter.GaussianBlur(10))
    return n_img


def apply_attention_mask(orig_pil_img, mask_pil_img, alpha_channel=0.8):
    """Applies the attention mask to the original image by pasting it
    on top with a selected alpha channel, thus visualizing the workings
    of the model's attention component on the image.
    """

    assert (orig_pil_img.height == mask_pil_img.height) and \
        (orig_pil_img.width == mask_pil_img.width)
    assert alpha_channel <= 1.

    mask = mask_pil_img.convert('RGBA')
    alpha = int(255 * alpha_channel)
    mask.putalpha(alpha)

    cp = orig_pil_img.copy()
    cp.paste(mask, (0,0), mask)
    return cp

def attention_map_for_original_img(alphas, image, prepro, alpha_channel=0.8):
    att_map = attention_map_jpg(
        alphas=alphas, 
        image=None,
        target_w=prepro.target_width,
        target_h=prepro.target_height)
    mode = prepro.mode
    if mode == PreproMode.AspectRatioCrop:
        c_w = prepro.target_width / image.width
        c_h = prepro.target_height / image.height
        if c_w > c_h:
            att_map = att_map.resize((image.width, int(prepro.target_height / c_w)))
        else:
            att_map = att_map.resize((int(prepro.target_width / c_h), image.height))
        mask = att_map.convert('RGBA')
        alpha = int(255 * alpha_channel)
        mask.putalpha(alpha)
        cp = image.copy()
        o_w = (image.width - mask.width) // 2
        o_h = (image.height - mask.height) // 2
        cp.paste(mask, (o_w, o_h), mask)
        return cp
    elif mode == PreproMode.AspectRatioPad:
        c_w = prepro.target_width / image.width
        c_h = prepro.target_height / image.height
        if c_w > c_h:
            att_map = att_map.resize((int(prepro.target_width / c_h), image.height))
        else:
            att_map = att_map.resize((image.width, int(prepro.target_height / c_w)))
        att_map = crop(att_map, image.width, image.height)
        mask = att_map.convert('RGBA')
        alpha = int(255 * alpha_channel)
        mask.putalpha(alpha)
        cp = image.copy()
        cp.paste(mask, (0, 0), mask)
        return cp
    elif mode == PreproMode.RescaleWidthRescaleHeight:
        att_map = att_map.resize((image.width, image.height))
        mask = att_map.convert('RGBA')
        alpha = int(255 * alpha_channel)
        mask.putalpha(alpha)
        cp = image.copy()
        cp.paste(mask, (0, 0), mask)
        return cp
    elif mode == PreproMode.RescaleWidthPadOrCropHeight:
        c_w = image.width / prepro.target_width
        att_map = att_map.resize((image.width, int(att_map.height * c_w)))
        if att_map.height > image.height:
            att_map = crop(att_map, image.width, image.height)
            o_w = 0
            o_h = 0
        else:
            o_w = 0
            o_h = (image.height - att_map.height) // 2
        mask = att_map.convert('RGBA')
        alpha = int(255 * alpha_channel)
        mask.putalpha(alpha)
        cp = image.copy()
        cp.paste(mask, (o_w, o_h), mask)
        return cp
    elif mode == PreproMode.RescaleHeightPadOrCropWidth:
        c_h = image.height / prepro.target_height
        att_map = att_map.resize((int(att_map.width * c_h), image.height))
        if att_map.width > image.width:
            att_map = crop(att_map, image.width, image.height)
            o_w = 0
            o_h = 0
        else:
            o_w = (image.width - att_map.width) // 2
            o_h = 0
        mask = att_map.convert('RGBA')
        alpha = int(255 * alpha_channel)
        mask.putalpha(alpha)
        cp = image.copy()
        cp.paste(mask, (o_w, o_h), mask)
        return cp
