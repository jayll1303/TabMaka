import os
import numpy as np
from PIL import Image
from collections import deque

def extract_croak_sprites(src_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    img = Image.open(src_path).convert("RGBA")

    boxes = [
        ("croak_1_rest", (50, 220, 445, 550)),
        ("croak_2_mid", (465, 220, 875, 550)),
        ("croak_3_full", (885, 220, 1330, 550)),
    ]

    def flood_fill_bg(crop_img):
        arr = np.array(crop_img.convert("RGBA")).copy()
        h, w = arr.shape[:2]
        is_white = (arr[:,:,0] > 232) & (arr[:,:,1] > 232) & (arr[:,:,2] > 232)
        visited = np.zeros((h, w), dtype=bool)
        queue = deque()
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
        arr[visited, 3] = 0
        non_zero = np.where(arr[:,:,3] > 0)
        if len(non_zero[0]) > 0:
            ymin, ymax = non_zero[0].min(), non_zero[0].max()
            xmin, xmax = non_zero[1].min(), non_zero[1].max()
            arr = arr[max(0, ymin-1):min(h, ymax+2), max(0, xmin-1):min(w, xmax+2)]
        return Image.fromarray(arr)

    for name, box in boxes:
        cropped = img.crop(box)
        transparent = flood_fill_bg(cropped)
        save_path = os.path.join(out_dir, f"{name}.png")
        transparent.save(save_path, "PNG")
        print(f"Extracted {name}.png: {transparent.size}")

if __name__ == "__main__":
    src = r"C:\Users\jayll\.gemini\antigravity\brain\6654f525-75b7-43c1-944d-524dd81e0101\frog_croak_sheet_1787041026391.jpg"
    dst = r"d:\SideHustle\Extensions\public\sprites\frog\croak"
    extract_croak_sprites(src, dst)
