"""
Alalay Brand Asset Generator
Generates high-resolution, production-grade icon, adaptive icon, and splash screen assets
featuring unmistakable rail transit lines forming the letter 'A'.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_alalay_emblem(size=1024, is_foreground_only=False, include_text=False):
    mode = "RGBA"
    bg = (0, 0, 0, 0) if is_foreground_only else (6, 7, 10, 255)
    img = Image.new(mode, (size, size), bg)
    draw = ImageDraw.Draw(img)

    scale = size / 1024.0
    cx = size / 2.0
    cy = (size / 2.0) - (48 * scale if include_text else 0)

    # 1. Outer Dark Circular Bezel
    if not is_foreground_only:
        bezel_r = 460 * scale
        draw.ellipse(
            [cx - bezel_r, cy - bezel_r, cx + bezel_r, cy + bezel_r],
            outline=(38, 42, 54, 255),
            width=int(6 * scale)
        )
        draw.ellipse(
            [cx - bezel_r + 6*scale, cy - bezel_r + 6*scale, cx + bezel_r - 6*scale, cy + bezel_r - 6*scale],
            fill=(10, 11, 16, 255)
        )

        # Ambient Aura
        aura = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        aura_draw = ImageDraw.Draw(aura)
        aura_draw.polygon(
            [(cx, cy - 200*scale), (cx - 280*scale, cy + 280*scale), (cx + 280*scale, cy + 280*scale)],
            fill=(0, 229, 255, 30)
        )
        aura = aura.filter(ImageFilter.GaussianBlur(int(45 * scale)))
        img = Image.alpha_composite(img, aura)
        draw = ImageDraw.Draw(img)

    # Key Geometry for "A"
    apex_x = cx
    apex_y = cy - (190 * scale)
    left_x = cx - (195 * scale)
    left_y = cy + (225 * scale)
    right_x = cx + (195 * scale)
    right_y = cy + (225 * scale)
    cbar_y = cy + (40 * scale)

    # 2. Railway Track Sleepers / Ties (Perpendicular to rails)
    num_ties = 14
    for i in range(2, num_ties):
        t = i / float(num_ties)
        # Left Leg Sleepers
        lx = apex_x + (left_x - apex_x) * t
        ly = apex_y + (left_y - apex_y) * t
        dx, dy = left_x - apex_x, left_y - apex_y
        length = math.hypot(dx, dy)
        nx, ny = -dy / length, dx / length
        w = 48 * scale
        draw.line(
            [(lx - nx * w, ly - ny * w), (lx + nx * w, ly + ny * w)],
            fill=(24, 48, 64, 255),
            width=int(16 * scale)
        )

        # Right Leg Sleepers
        rx = apex_x + (right_x - apex_x) * t
        ry = apex_y + (right_y - apex_y) * t
        rdx, rdy = right_x - apex_x, right_y - apex_y
        r_length = math.hypot(rdx, rdy)
        r_nx, r_ny = -rdy / r_length, rdx / r_length
        draw.line(
            [(rx - r_nx * w, ry - r_ny * w), (rx + r_nx * w, ry + r_ny * w)],
            fill=(64, 48, 20, 255),
            width=int(16 * scale)
        )

    # 3. Crossbar Ties (Horizontal Track connecting legs)
    for cx_step in range(int(cx - 110*scale), int(cx + 120*scale), int(28*scale)):
        draw.line(
            [(cx_step, cbar_y - (20*scale)), (cx_step, cbar_y + (20*scale))],
            fill=(42, 46, 58, 255),
            width=int(14 * scale)
        )

    # 4. Crossbar Dual Rails (Top & Bottom)
    cbar_w = 140 * scale
    draw.line(
        [(cx - cbar_w, cbar_y - (18*scale)), (cx + cbar_w, cbar_y - (18*scale))],
        fill=(0, 229, 255, 255),
        width=int(18 * scale)
    )
    draw.line(
        [(cx - cbar_w, cbar_y + (18*scale)), (cx + cbar_w, cbar_y + (18*scale))],
        fill=(255, 193, 7, 255),
        width=int(18 * scale)
    )
    # Steel Rail Caps
    draw.line(
        [(cx - cbar_w, cbar_y - (18*scale)), (cx + cbar_w, cbar_y - (18*scale))],
        fill=(240, 253, 255, 255),
        width=int(6 * scale)
    )
    draw.line(
        [(cx - cbar_w, cbar_y + (18*scale)), (cx + cbar_w, cbar_y + (18*scale))],
        fill=(255, 253, 231, 255),
        width=int(6 * scale)
    )

    # 5. Left Leg Dual Steel Rails (Cyan Transit Line)
    track_offset = 24 * scale
    rw = 28 * scale
    # Outer rail
    draw.line(
        [(apex_x - (22*scale), apex_y + (18*scale)), (left_x - track_offset, left_y)],
        fill=(0, 229, 255, 255),
        width=int(rw)
    )
    draw.line(
        [(apex_x - (22*scale), apex_y + (18*scale)), (left_x - track_offset, left_y)],
        fill=(255, 255, 255, 255),
        width=int(9 * scale)
    )
    # Inner rail
    draw.line(
        [(apex_x + (22*scale), apex_y + (18*scale)), (left_x + track_offset, left_y)],
        fill=(0, 184, 212, 255),
        width=int(rw)
    )
    draw.line(
        [(apex_x + (22*scale), apex_y + (18*scale)), (left_x + track_offset, left_y)],
        fill=(255, 255, 255, 255),
        width=int(9 * scale)
    )

    # 6. Right Leg Dual Steel Rails (Gold Transit Line)
    # Inner rail
    draw.line(
        [(apex_x - (22*scale), apex_y + (18*scale)), (right_x - track_offset, right_y)],
        fill=(255, 179, 0, 255),
        width=int(rw)
    )
    draw.line(
        [(apex_x - (22*scale), apex_y + (18*scale)), (right_x - track_offset, right_y)],
        fill=(255, 255, 255, 255),
        width=int(9 * scale)
    )
    # Outer rail
    draw.line(
        [(apex_x + (22*scale), apex_y + (18*scale)), (right_x + track_offset, right_y)],
        fill=(255, 213, 79, 255),
        width=int(rw)
    )
    draw.line(
        [(apex_x + (22*scale), apex_y + (18*scale)), (right_x + track_offset, right_y)],
        fill=(255, 255, 255, 255),
        width=int(9 * scale)
    )

    # 7. Central Interchange Station Diamond
    dw = 40 * scale
    draw.polygon(
        [(cx, cbar_y - dw), (cx + dw, cbar_y), (cx, cbar_y + dw), (cx - dw, cbar_y)],
        fill=(255, 255, 255, 255)
    )
    dw_in = 28 * scale
    draw.polygon(
        [(cx, cbar_y - dw_in), (cx + dw_in, cbar_y), (cx, cbar_y + dw_in), (cx - dw_in, cbar_y)],
        fill=(12, 14, 20, 255)
    )
    cr = 12 * scale
    draw.ellipse([cx - cr, cbar_y - cr, cx + cr, cbar_y + cr], fill=(0, 229, 255, 255))

    # 8. Apex Junction Peak (Unifying Cap & Forward Arrow)
    aw = 38 * scale
    draw.polygon(
        [(apex_x, apex_y - (22*scale)), (apex_x - aw, apex_y + (36*scale)), (apex_x + aw, apex_y + (36*scale))],
        fill=(255, 255, 255, 255)
    )
    aw_in = 24 * scale
    draw.polygon(
        [(apex_x, apex_y - (8*scale)), (apex_x - aw_in, apex_y + (32*scale)), (apex_x + aw_in, apex_y + (32*scale))],
        fill=(12, 14, 20, 255)
    )
    ar = 7 * scale
    draw.ellipse([apex_x - ar, apex_y + (12*scale) - ar, apex_x + ar, apex_y + (12*scale) + ar], fill=(255, 213, 79, 255))

    # 9. Optional Brand Typography for Splash
    if include_text:
        try:
            font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(68 * scale))
            font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", int(21 * scale))
        except:
            font_title = ImageFont.load_default()
            font_sub = ImageFont.load_default()

        # Render 'A L A L A Y'
        title_text = "A L A L A Y"
        bbox = draw.textbbox((0, 0), title_text, font=font_title)
        tw = bbox[2] - bbox[0]
        tx = cx - tw / 2.0
        ty = cy + (290 * scale)
        draw.text((tx, ty), title_text, fill=(255, 255, 255, 255), font=font_title)

        # Subtle cyan accent dot after title
        dot_r = 7 * scale
        draw.ellipse(
            [tx + tw + 10*scale, ty + 42*scale, tx + tw + 10*scale + 2*dot_r, ty + 42*scale + 2*dot_r],
            fill=(0, 229, 255, 255)
        )

        # Render subtitle: 'ACCESSIBLE COMMUTER COMPANION'
        sub_text = "ACCESSIBLE COMMUTER COMPANION"
        sbox = draw.textbbox((0, 0), sub_text, font=font_sub)
        sw = sbox[2] - sbox[0]
        sx = cx - sw / 2.0
        sy = ty + (86 * scale)
        draw.text((sx, sy), sub_text, fill=(148, 163, 184, 255), font=font_sub)

    return img

def main():
    base_dir = "D:/Dev/projects/alalay"
    os.makedirs(f"{base_dir}/scripts", exist_ok=True)
    os.makedirs(f"{base_dir}/assets/images", exist_ok=True)

    print("Generating Alalay standard icon (1024x1024)...")
    icon = create_alalay_emblem(size=1024, is_foreground_only=False, include_text=False)
    icon.save(f"{base_dir}/assets/images/icon.png", format="PNG", optimize=True)

    print("Generating Alalay adaptive icon foreground (1024x1024, safe-zone scaled)...")
    fg = create_alalay_emblem(size=720, is_foreground_only=True, include_text=False)
    adaptive_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    offset = (1024 - 720) // 2
    adaptive_canvas.paste(fg, (offset, offset), fg)
    adaptive_canvas.save(f"{base_dir}/assets/images/adaptive-icon.png", format="PNG", optimize=True)

    print("Generating Alalay splash icon (640x640 with typography)...")
    splash = create_alalay_emblem(size=640, is_foreground_only=False, include_text=True)
    splash.save(f"{base_dir}/assets/images/splash-icon.png", format="PNG", optimize=True)

    # For Android 12+ / Android 15 native splash screens:
    # Circular safe emblem without text to guarantee ZERO clipping!
    splash_android = create_alalay_emblem(size=800, is_foreground_only=False, include_text=False)

    # Android drawable splashscreen_logo across densities
    densities_splash = {
        "drawable-mdpi": 200,
        "drawable-hdpi": 300,
        "drawable-xhdpi": 400,
        "drawable-xxhdpi": 600,
        "drawable-xxxhdpi": 800,
    }
    for folder, dim in densities_splash.items():
        out_dir = os.path.join(f"{base_dir}/android/app/src/main/res", folder)
        os.makedirs(out_dir, exist_ok=True)
        scaled_splash = splash_android.resize((dim, dim), Image.Resampling.LANCZOS)
        out_path = os.path.join(out_dir, "splashscreen_logo.png")
        scaled_splash.save(out_path, format="PNG", optimize=True)
        print(f"Saved: {out_path} ({dim}x{dim})")

    # Android mipmap launcher icons across densities
    densities_launcher = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }
    for folder, (dim_icon, dim_fg) in densities_launcher.items():
        out_dir = os.path.join(f"{base_dir}/android/app/src/main/res", folder)
        os.makedirs(out_dir, exist_ok=True)

        scaled_icon = icon.resize((dim_icon, dim_icon), Image.Resampling.LANCZOS)
        scaled_icon.save(os.path.join(out_dir, "ic_launcher.png"), format="PNG", optimize=True)
        scaled_icon.save(os.path.join(out_dir, "ic_launcher_round.png"), format="PNG", optimize=True)

        scaled_fg = adaptive_canvas.resize((dim_fg, dim_fg), Image.Resampling.LANCZOS)
        scaled_fg.save(os.path.join(out_dir, "ic_launcher_foreground.png"), format="PNG", optimize=True)
        print(f"Saved mipmap: {folder} icon={dim_icon}x{dim_icon}, fg={dim_fg}x{dim_fg}")

    # Copy to artifacts directory
    icon.save("C:/Users/ralph/.gemini/antigravity/brain/bf497502-31c7-4e23-a06c-0a3e7dbdec1a/alalay_icon.png", format="PNG")
    splash.save("C:/Users/ralph/.gemini/antigravity/brain/bf497502-31c7-4e23-a06c-0a3e7dbdec1a/alalay_splash.png", format="PNG")
    print("Done generating all Alalay brand assets!")

if __name__ == "__main__":
    main()
