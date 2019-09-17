import numpy as np
from PIL import Image, ImageFilter


def attention_map_jpg(alphas, image=None):
    alphas = np.asarray(alphas).astype('uint8')
    alphas = alphas * 10000#00
    att_map = Image.fromarray(alphas)
    att_map = att_map.convert("L")
    att_map = rescale_and_smooth(att_map)
    
    if image is not None:
        image = Image.fromarray(image, 'RGB')
    return apply_attention_mask(image, att_map)


def rescale_and_smooth(pil_image, scale=16, smooth=True):
    """Returns the original image rescaled
    and smoothened by a Gaussian filter
    """

    w = pil_image.width
    h = pil_image.height
    n_img = pil_image.resize((scale * w, scale * h))
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