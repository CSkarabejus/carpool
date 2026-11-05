"""
Generates clean PNG icons for PWA without external dependencies.
Uses Python standard library zlib and struct to construct PNG chunks.
"""
import zlib
import struct
import math

def create_png(width, height, draw_func, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
            
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # IDAT chunk
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

def car_icon(x, y, w, h):
    # Normalized coords 0..1
    nx = x / w
    ny = y / h
    
    # Background: Rounded rectangle with gradient (Dark emerald / teal to indigo)
    corner_radius = 0.22
    dx = max(0, abs(nx - 0.5) - (0.5 - corner_radius))
    dy = max(0, abs(ny - 0.5) - (0.5 - corner_radius))
    dist = math.sqrt(dx*dx + dy*dy)
    if dist > corner_radius:
        return (0, 0, 0, 0) # transparent outer
        
    # Gradient background
    t = (nx + ny) * 0.5
    bg_r = int(16 + (30 - 16) * t)
    bg_g = int(185 + (130 - 185) * t)
    bg_b = int(129 + (246 - 129) * t)
    
    # Car body geometry (simplified stylish car silhouette + fuel drop / split)
    # Center circle badge
    cx = nx - 0.5
    cy = ny - 0.5
    cdist = math.sqrt(cx*cx + cy*cy)
    
    # Draw a stylized car + fuel pump / currency icon in white
    # Let's do a stylish car icon
    # Top roof: x in [0.32, 0.68], y in [0.28, 0.45]
    # Body: x in [0.22, 0.78], y in [0.45, 0.65]
    # Wheels: left cx=0.33, cy=0.66, r=0.09; right cx=0.67, cy=0.66, r=0.09
    
    is_car = False
    
    # Roof (trapezoid)
    if 0.32 <= ny <= 0.46:
        roof_w = 0.16 + (ny - 0.32) * 0.8
        if abs(nx - 0.5) <= roof_w:
            is_car = True
            
    # Main body
    if 0.44 <= ny <= 0.62 and 0.22 <= nx <= 0.78:
        # curve the corners
        if ny > 0.58 and (nx < 0.24 or nx > 0.76):
            pass
        else:
            is_car = True
            
    # Window cutouts (darkening car)
    is_window = False
    if 0.34 <= ny <= 0.44:
        win_w = 0.13 + (ny - 0.34) * 0.75
        if abs(nx - 0.5) <= win_w and abs(nx - 0.5) > 0.02:
            is_window = True
            
    # Wheel cutouts
    w1_dist = math.sqrt((nx - 0.34)**2 + (ny - 0.64)**2)
    w2_dist = math.sqrt((nx - 0.66)**2 + (ny - 0.64)**2)
    
    is_wheel = False
    if w1_dist <= 0.085 or w2_dist <= 0.085:
        is_wheel = True
        
    is_rim = False
    if w1_dist <= 0.04 or w2_dist <= 0.04:
        is_rim = True
        
    # Headlights
    is_light = False
    if 0.48 <= ny <= 0.54:
        if (0.23 <= nx <= 0.27) or (0.73 <= nx <= 0.77):
            is_light = True
            
    # Fuel drop icon in bottom center or split badge
    is_drop = False
    if 0.46 <= ny <= 0.58 and abs(nx - 0.5) <= 0.06:
        # fuel gauge / dollar slash
        pass

    if is_rim:
        return (255, 255, 255, 255)
    elif is_wheel:
        return (30, 41, 59, 255)
    elif is_light:
        return (254, 240, 138, 255)
    elif is_window:
        return (15, 23, 42, 220)
    elif is_car:
        return (255, 255, 255, 255)
        
    # Currency symbol / split dot indicator at bottom
    # Dots representing passengers
    for px in [0.35, 0.50, 0.65]:
        pdist = math.sqrt((nx - px)**2 + (ny - 0.79)**2)
        if pdist <= 0.035:
            return (255, 255, 255, 240)
            
    return (bg_r, bg_g, bg_b, 255)

if __name__ == '__main__':
    create_png(192, 192, car_icon, 'icon-192.png')
    create_png(512, 512, car_icon, 'icon-512.png')
    create_png(64, 64, car_icon, 'favicon.png')
