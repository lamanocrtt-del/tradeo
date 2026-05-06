"""
Remove background from mascot image using rembg library.
Creates a transparent PNG ready for use as a UI mascot.
"""

import subprocess
import sys

# Install required packages with CPU backend for rembg
subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg[cpu]", "pillow", "requests", "-q"])

from rembg import remove
from PIL import Image
import requests
from io import BytesIO

# Source image URL - Tradeo bull mascot
IMAGE_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tradeo%20mascotte-lo2ZLVUjNDc8mIaTzlS0yrAWhzSL8K.png"

# Download the image
print("Downloading mascot image...")
response = requests.get(IMAGE_URL)
input_image = Image.open(BytesIO(response.content))

print(f"Original image size: {input_image.size}")
print(f"Original image mode: {input_image.mode}")

# Remove background
print("Removing background...")
output_image = remove(input_image)

# Ensure RGBA mode for transparency
if output_image.mode != 'RGBA':
    output_image = output_image.convert('RGBA')

print(f"Output image size: {output_image.size}")
print(f"Output image mode: {output_image.mode}")

# Crop to content bounds (remove excess transparent space)
print("Cropping to content bounds...")
bbox = output_image.getbbox()
if bbox:
    output_image = output_image.crop(bbox)
    print(f"Cropped image size: {output_image.size}")

# Save the result
output_path = "public/images/tradeo-mascot.png"
output_image.save(output_path, "PNG", optimize=True)

print(f"Saved transparent mascot to: {output_path}")
print("Done! The Tradeo mascot is now ready to use with transparent background.")
