"""Generate circular favicon PNGs with transparent corners."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "images" / "go-football-logo-nav.png"
OUT_PUBLIC = ROOT / "public" / "images" / "favicon-circle.png"
OUT_ICON = ROOT / "src" / "app" / "icon.png"
OUT_APPLE = ROOT / "src" / "app" / "apple-icon.png"


def make_circular_favicon(src: Path, dst: Path, size: int, crop_ratio: float = 0.58) -> None:
    img = Image.open(src).convert("RGBA")
    width, height = img.size
    crop_height = int(width * crop_ratio)
    top = img.crop((0, 0, width, min(crop_height, height)))

    side = min(top.width, top.height)
    left = (top.width - side) // 2
    square = top.crop((left, 0, left + side, side))
    square = square.resize((size, size), Image.Resampling.LANCZOS)

    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size - 1, size - 1), fill=255)

    output = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    output.paste(square, (0, 0), mask)
    dst.parent.mkdir(parents=True, exist_ok=True)
    output.save(dst, "PNG")


def main() -> None:
    make_circular_favicon(SRC, OUT_PUBLIC, 192)
    make_circular_favicon(SRC, OUT_ICON, 32)
    make_circular_favicon(SRC, OUT_APPLE, 180)
    print("Generated:", OUT_PUBLIC, OUT_ICON, OUT_APPLE)


if __name__ == "__main__":
    main()
