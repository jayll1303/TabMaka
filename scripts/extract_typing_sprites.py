import os
from PIL import Image
import numpy as np
from collections import deque

files = [
    (r"C:\Users\jayll\Downloads\ChatGPT Image Aug 19, 2026, 04_15_14 PM.png", "type_0_idle.png"),
    (r"C:\Users\jayll\Downloads\ChatGPT Image Aug 19, 2026, 04_04_03 PM.png", "type_1_left.png"),
    (r"C:\Users\jayll\Downloads\ChatGPT Image Aug 19, 2026, 04_16_22 PM.png", "type_2_right.png"),
    (r"C:\Users\jayll\Downloads\ChatGPT Image Aug 19, 2026, 04_17_21 PM.png", "type_3_both.png"),
]

out_dir = r"d:\SideHustle\Extensions\public\sprites\frog\typing"
os.makedirs(out_dir, exist_ok=True)

def flood_fill_bg(crop_img):
    arr = np.array(crop_img.convert("RGBA")).copy()
    h, w = arr.shape[:2]
    
    # White background threshold (near pure white)
    is_white = (arr[:,:,0] > 230) & (arr[:,:,1] > 230) & (arr[:,:,2] > 230)
    
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()
    
    # Seed from all 4 borders
    for x in range(w):
        if is_white[0, x]: queue.append((0, x)); visited[0, x] = True
        if is_white[h-1, x]: queue.append((h-1, x)); visited[h-1, x] = True
    for y in range(h):
        if is_white[y, 0]: queue.append((y, 0)); visited[y, 0] = True
        if is_white[y, w-1]: queue.append((y, w-1)); visited[y, w-1] = True
        
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                if is_white[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))
                    
    # Only remove outer connected background
    arr[visited, 3] = 0
    
    # Smooth edge anti-aliasing for the outer 1px perimeter
    for y in range(1, h-1):
        for x in range(1, w-1):
            if arr[y, x, 3] > 0 and (visited[y, x-1] or visited[y, x+1] or visited[y-1, x] or visited[y+1, x]):
                brightness = arr[y, x, :3].mean()
                if brightness > 210:
                    arr[y, x, 3] = int((255 - brightness) * 4)

    # Auto crop to bounding box
    non_zero = np.where(arr[:,:,3] > 0)
    if len(non_zero[0]) > 0:
        ymin, ymax = non_zero[0].min(), non_zero[0].max()
        xmin, xmax = non_zero[1].min(), non_zero[1].max()
        arr = arr[max(0, ymin-1):min(h, ymax+2), max(0, xmin-1):min(w, xmax+2)]
        
    return Image.fromarray(arr)

for src_path, out_name in files:
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        continue
    img = Image.open(src_path).convert("RGBA")
    print(f"Processing {src_path} - Original size: {img.size}")
    transparent = flood_fill_bg(img)
    save_path = os.path.join(out_dir, out_name)
    transparent.save(save_path, "PNG")
    print(f"Saved {out_name}: Size {transparent.size}")
