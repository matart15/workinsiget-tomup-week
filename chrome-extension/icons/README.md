# Extension Icons

Place your Chrome extension icons in this directory.

## Required Icons

You need to create the following icon files:

- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Icon Guidelines

- Use PNG format for best quality
- Keep file sizes under 100KB each
- Use transparent backgrounds
- Ensure icons are clearly visible at small sizes
- Test how they look in the Chrome toolbar

## Temporary Icons

Until you create your own icons, you can:

1. Use a simple colored square as a placeholder
2. Download free icons from sites like:
   - [Material Icons](https://material.io/icons/)
   - [Feather Icons](https://feathericons.com/)
   - [Heroicons](https://heroicons.com/)

## Icon Creation Tools

- **Online**: Canva, Figma, or similar design tools
- **Desktop**: Photoshop, GIMP, or Sketch
- **Command Line**: ImageMagick for batch processing

## Example with ImageMagick

```bash
# Create a simple colored square icon
convert -size 128x128 xc:#667eea icon128.png
convert -size 48x48 xc:#667eea icon48.png
convert -size 32x32 xc:#667eea icon32.png
convert -size 16x16 xc:#667eea icon16.png
```

Replace `#667eea` with your brand color.
